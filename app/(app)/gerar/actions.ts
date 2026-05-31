'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import {
  GeracaoBloqueadaError,
  gerarPorAudio,
  gerarPorPrint,
  gerarPorTexto,
  type VitoriaPassada,
} from '@/lib/gemini';
import {
  ALLOWED_AUDIO_MIME,
  ALLOWED_IMAGE_MIME,
  MAX_AUDIO_BYTES,
  MAX_IMAGE_BYTES,
  geracaoInputSchema,
  geracaoMidiaInputSchema,
  type GeracaoInput,
  type GeracaoMidiaInput,
  type GeracaoOutput,
  type GeracaoOutputAudio,
  type GeracaoOutputPrint,
} from '@/lib/schemas/geracao';

export type GerarResult =
  | { ok: true; data: GeracaoOutput; generationId: string; crushId: string }
  | { ok: false; error: string };

export async function gerarResposta(input: GeracaoInput): Promise<GerarResult> {
  const parsed = geracaoInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'dados inválidos' };
  }

  const user = await requireUser();
  const supabase = await createClient();

  // Limite diário (RPC já existente no schema.sql)
  const { data: canGenerate, error: usageError } = await supabase.rpc('increment_usage', {
    p_user_id: user.id,
  });
  if (usageError) {
    console.error('increment_usage error:', usageError);
    return { ok: false, error: 'erro interno checando limite. tenta de novo.' };
  }
  if (canGenerate === false) {
    return { ok: false, error: 'limite diário de gerações atingido. volta amanhã.' };
  }

  // Carregar profile
  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'age_range, marital_status, time_single, returning_to_market, has_children, improvement_areas, primary_goal, onboarding_completed',
    )
    .eq('id', user.id)
    .single();

  if (!profile) {
    return { ok: false, error: 'perfil não encontrado.' };
  }

  if (!profile.onboarding_completed) {
    return { ok: false, error: 'calibra teu perfil antes em /perfil.' };
  }

  // Carregar crush (RLS + belt+suspenders)
  const { data: crush } = await supabase
    .from('crushes')
    .select('id, name, relationship_type, age_range, context')
    .eq('id', parsed.data.crush_id)
    .eq('user_id', user.id)
    .single();

  if (!crush) {
    return { ok: false, error: 'crush não encontrada.' };
  }

  // Few-shot por user (Task #35)
  const vitorias = await buscarVitoriasRecentes(supabase, user.id);

  // Chamar Gemini
  let geracaoOutput: GeracaoOutput;
  try {
    geracaoOutput = await gerarPorTexto({
      input: parsed.data,
      profile,
      crush: {
        name: crush.name,
        relationship_type: crush.relationship_type,
        age_range: crush.age_range,
        context: crush.context,
      },
      vitorias,
    });
  } catch (e) {
    if (e instanceof GeracaoBloqueadaError) {
      return { ok: false, error: 'a IA recusou essa. tenta com outra abordagem.' };
    }
    console.error('Gemini generateContent error:', e);
    return { ok: false, error: 'a IA travou. tenta de novo daqui um pouco.' };
  }

  // Persistir (não bloquear retorno se falhar — user já viu a resposta)
  const { data: generation, error: insertError } = await supabase
    .from('generations')
    .insert({
      user_id: user.id,
      crush_id: crush.id,
      input_mode: 'text',
      her_message: parsed.data.her_message,
      intensity: parsed.data.intensity,
      intent: parsed.data.intent,
      extra_context: parsed.data.extra_context || null,
      ai_reading: geracaoOutput.leitura,
      ai_options: geracaoOutput.opcoes,
      skills_applied: geracaoOutput.skills_aplicadas,
      info_detected: geracaoOutput.info_nova_detectada,
    })
    .select('id')
    .single();

  if (insertError) {
    console.error('insert generation error:', insertError);
  }

  // Atualizar crush updated_at pra ela subir na lista (sinal de uso recente)
  await supabase
    .from('crushes')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', crush.id)
    .eq('user_id', user.id);

  revalidatePath('/');
  revalidatePath('/crushes');

  return {
    ok: true,
    data: geracaoOutput,
    generationId: generation?.id ?? '',
    crushId: crush.id,
  };
}

export type AddInfoResult = { ok: true } | { ok: false; error: string };

export async function adicionarInfoNaCrush(
  crushId: string,
  info: string,
): Promise<AddInfoResult> {
  if (!info.trim()) return { ok: false, error: 'info vazia' };

  const user = await requireUser();
  const supabase = await createClient();

  const { data: crush } = await supabase
    .from('crushes')
    .select('context')
    .eq('id', crushId)
    .eq('user_id', user.id)
    .single();

  if (!crush) return { ok: false, error: 'crush não encontrada' };

  const trimmedInfo = info.trim();
  const newContext = crush.context?.trim()
    ? `${crush.context.trim()}\n\n${trimmedInfo}`
    : trimmedInfo;

  if (newContext.length > 5000) {
    return {
      ok: false,
      error: 'contexto da crush tá cheio. dá uma limpada em /crushes primeiro.',
    };
  }

  const { error } = await supabase
    .from('crushes')
    .update({ context: newContext })
    .eq('id', crushId)
    .eq('user_id', user.id);

  if (error) return { ok: false, error: 'não consegui salvar.' };

  revalidatePath(`/crushes/${crushId}`);
  return { ok: true };
}

// ─────────────────────────────────────────────────────────────────
// ADR-022 Marco 4 — actions multimodais
// ─────────────────────────────────────────────────────────────────

export type GerarPrintResult =
  | { ok: true; data: GeracaoOutputPrint; generationId: string; crushId: string }
  | { ok: false; error: string };

export type GerarAudioResult =
  | { ok: true; data: GeracaoOutputAudio; generationId: string; crushId: string }
  | { ok: false; error: string };

// Helper compartilhado entre actions multimodais
async function preparaContextoGeracao(input: GeracaoMidiaInput) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: canGenerate, error: usageError } = await supabase.rpc('increment_usage', {
    p_user_id: user.id,
  });
  if (usageError) {
    return { kind: 'error' as const, error: 'erro interno checando limite. tenta de novo.' };
  }
  if (canGenerate === false) {
    return { kind: 'error' as const, error: 'limite diário de gerações atingido. volta amanhã.' };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'age_range, marital_status, time_single, returning_to_market, has_children, improvement_areas, primary_goal, onboarding_completed',
    )
    .eq('id', user.id)
    .single();

  if (!profile) return { kind: 'error' as const, error: 'perfil não encontrado.' };
  if (!profile.onboarding_completed)
    return { kind: 'error' as const, error: 'calibra teu perfil antes em /perfil.' };

  const { data: crush } = await supabase
    .from('crushes')
    .select('id, name, relationship_type, age_range, context')
    .eq('id', input.crush_id)
    .eq('user_id', user.id)
    .single();

  if (!crush) return { kind: 'error' as const, error: 'crush não encontrada.' };

  return { kind: 'ok' as const, user, supabase, profile, crush };
}

function approxBytesFromBase64(b64: string): number {
  // base64 string length * 3/4 ≈ bytes originais (descontando padding)
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  return Math.floor((b64.length * 3) / 4) - padding;
}

// Task #35: busca últimas vitórias do user pra usar como few-shot.
// Limita a 3 pra economizar tokens (system prompt já é grande).
// Falha silenciosa: se der erro, retorna [] e a geração segue sem vitórias.
async function buscarVitoriasRecentes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<VitoriaPassada[]> {
  const { data, error } = await supabase
    .from('generations')
    .select('her_message, ai_options, intensity, intent')
    .eq('user_id', userId)
    .eq('marked_as_win', true)
    .order('created_at', { ascending: false })
    .limit(3);

  if (error) {
    console.warn('buscarVitoriasRecentes falhou (não bloqueante):', error);
    return [];
  }
  return (data ?? []) as VitoriaPassada[];
}

export async function gerarRespostaPrint(
  input: GeracaoMidiaInput,
  imageBase64: string,
  mimeType: string,
): Promise<GerarPrintResult> {
  const parsed = geracaoMidiaInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'dados inválidos' };
  }

  if (!(ALLOWED_IMAGE_MIME as readonly string[]).includes(mimeType)) {
    return { ok: false, error: `tipo de imagem não suportado (${mimeType}).` };
  }

  const bytes = approxBytesFromBase64(imageBase64);
  if (bytes === 0) return { ok: false, error: 'imagem vazia.' };
  if (bytes > MAX_IMAGE_BYTES) {
    return { ok: false, error: 'imagem muito grande (máx 5 MB).' };
  }

  const ctx = await preparaContextoGeracao(parsed.data);
  if (ctx.kind === 'error') return { ok: false, error: ctx.error };

  const vitorias = await buscarVitoriasRecentes(ctx.supabase, ctx.user.id);

  let geracaoOutput: GeracaoOutputPrint;
  try {
    geracaoOutput = await gerarPorPrint({
      input: parsed.data,
      profile: ctx.profile,
      crush: {
        name: ctx.crush.name,
        relationship_type: ctx.crush.relationship_type,
        age_range: ctx.crush.age_range,
        context: ctx.crush.context,
      },
      imageBase64,
      mimeType,
      vitorias,
    });
  } catch (e) {
    if (e instanceof GeracaoBloqueadaError) {
      return { ok: false, error: 'a IA recusou essa imagem. tenta outra ou descreve em texto.' };
    }
    console.error('Gemini gerarPorPrint error:', e);
    return { ok: false, error: 'a IA travou processando o print. tenta de novo.' };
  }

  const { data: generation, error: insertError } = await ctx.supabase
    .from('generations')
    .insert({
      user_id: ctx.user.id,
      crush_id: ctx.crush.id,
      input_mode: 'print',
      her_message: geracaoOutput.transcricao_estruturada.ultima_dela,
      her_message_structured: geracaoOutput.transcricao_estruturada,
      intensity: parsed.data.intensity,
      intent: parsed.data.intent,
      extra_context: parsed.data.extra_context || null,
      ai_reading: geracaoOutput.leitura,
      ai_options: geracaoOutput.opcoes,
      skills_applied: geracaoOutput.skills_aplicadas,
      info_detected: geracaoOutput.info_nova_detectada,
    })
    .select('id')
    .single();

  if (insertError) console.error('insert generation (print) error:', insertError);

  await ctx.supabase
    .from('crushes')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', ctx.crush.id)
    .eq('user_id', ctx.user.id);

  revalidatePath('/');
  revalidatePath('/crushes');

  return {
    ok: true,
    data: geracaoOutput,
    generationId: generation?.id ?? '',
    crushId: ctx.crush.id,
  };
}

export async function gerarRespostaAudio(
  input: GeracaoMidiaInput,
  audioBase64: string,
  mimeType: string,
): Promise<GerarAudioResult> {
  const parsed = geracaoMidiaInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'dados inválidos' };
  }

  if (!(ALLOWED_AUDIO_MIME as readonly string[]).includes(mimeType)) {
    return { ok: false, error: `tipo de áudio não suportado (${mimeType}).` };
  }

  const bytes = approxBytesFromBase64(audioBase64);
  if (bytes === 0) return { ok: false, error: 'áudio vazio.' };
  if (bytes > MAX_AUDIO_BYTES) {
    return { ok: false, error: 'áudio muito grande (máx 8 MB).' };
  }

  const ctx = await preparaContextoGeracao(parsed.data);
  if (ctx.kind === 'error') return { ok: false, error: ctx.error };

  const vitorias = await buscarVitoriasRecentes(ctx.supabase, ctx.user.id);

  let geracaoOutput: GeracaoOutputAudio;
  try {
    geracaoOutput = await gerarPorAudio({
      input: parsed.data,
      profile: ctx.profile,
      crush: {
        name: ctx.crush.name,
        relationship_type: ctx.crush.relationship_type,
        age_range: ctx.crush.age_range,
        context: ctx.crush.context,
      },
      audioBase64,
      mimeType,
      vitorias,
    });
  } catch (e) {
    if (e instanceof GeracaoBloqueadaError) {
      return { ok: false, error: 'a IA recusou esse áudio. tenta outro ou descreve em texto.' };
    }
    console.error('Gemini gerarPorAudio error:', e);
    return { ok: false, error: 'a IA travou processando o áudio. tenta de novo.' };
  }

  const { data: generation, error: insertError } = await ctx.supabase
    .from('generations')
    .insert({
      user_id: ctx.user.id,
      crush_id: ctx.crush.id,
      input_mode: 'audio',
      her_message: geracaoOutput.transcricao_estruturada.transcricao,
      her_message_structured: geracaoOutput.transcricao_estruturada,
      intensity: parsed.data.intensity,
      intent: parsed.data.intent,
      extra_context: parsed.data.extra_context || null,
      ai_reading: geracaoOutput.leitura,
      ai_options: geracaoOutput.opcoes,
      skills_applied: geracaoOutput.skills_aplicadas,
      info_detected: geracaoOutput.info_nova_detectada,
    })
    .select('id')
    .single();

  if (insertError) console.error('insert generation (audio) error:', insertError);

  await ctx.supabase
    .from('crushes')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', ctx.crush.id)
    .eq('user_id', ctx.user.id);

  revalidatePath('/');
  revalidatePath('/crushes');

  return {
    ok: true,
    data: geracaoOutput,
    generationId: generation?.id ?? '',
    crushId: ctx.crush.id,
  };
}

export type MarkWinResult = { ok: true } | { ok: false; error: string };

// ADR-030: like por opção. optionIndex 0-2 = qual das 3 funcionou; null = desmarca.
// marked_as_win acompanha (true se alguma venceu) pra manter o few-shot (ADR-024)
// coeso — a injeção per-user continua grosseira de propósito (sem enviesar).
// winning_option_index é coletado pro aprendizado MACRO (pós-MVP), não pra micro.
export async function marcarOpcaoVitoria(
  generationId: string,
  optionIndex: number | null,
): Promise<MarkWinResult> {
  if (optionIndex !== null && (optionIndex < 0 || optionIndex > 2)) {
    return { ok: false, error: 'opção inválida.' };
  }

  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from('generations')
    .update({
      winning_option_index: optionIndex,
      marked_as_win: optionIndex !== null,
    })
    .eq('id', generationId)
    .eq('user_id', user.id);

  if (error) return { ok: false, error: 'não consegui marcar.' };

  return { ok: true };
}

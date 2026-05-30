'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { GeracaoBloqueadaError, gerarPorTexto } from '@/lib/gemini';
import {
  geracaoInputSchema,
  type GeracaoInput,
  type GeracaoOutput,
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

export type MarkWinResult = { ok: true } | { ok: false; error: string };

export async function marcarComoVitoria(
  generationId: string,
  win: boolean,
): Promise<MarkWinResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from('generations')
    .update({ marked_as_win: win })
    .eq('id', generationId)
    .eq('user_id', user.id);

  if (error) return { ok: false, error: 'não consegui marcar.' };

  return { ok: true };
}

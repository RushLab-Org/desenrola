import { z } from 'zod';

export const intentOptions = [
  'responder_normal',
  'esquentar',
  'sair_de_dr',
  'pedir_pra_sair',
  'reconquistar',
  'desconversar',
  'outros',
] as const;

export const intentLabels: Record<(typeof intentOptions)[number], string> = {
  responder_normal: 'responder normal',
  esquentar: 'esquentar',
  sair_de_dr: 'sair de DR',
  pedir_pra_sair: 'pedir pra sair',
  reconquistar: 'reconquistar',
  desconversar: 'desconversar',
  outros: 'outros',
};

// ADR-020: 5 etapas em vez de 4. Definições por etapa em system-prompt-v3 PARTE IV.
export const intensityLabels: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: 'leve',
  2: 'equilibrado',
  3: 'quente',
  4: 'provocante',
  5: 'explícito',
};

export const geracaoInputSchema = z.object({
  crush_id: z.string().uuid(),
  her_message: z
    .string()
    .trim()
    .min(1, 'cola a mensagem dela')
    .max(5000, 'mensagem muito longa'),
  intensity: z.number().int().min(1).max(5),
  intent: z.enum(intentOptions),
  extra_context: z.string().trim().max(2000, 'contexto muito longo'),
});

export type GeracaoInput = z.infer<typeof geracaoInputSchema>;

// Output schema conforme PARTE VII do system prompt v3.
// IMPORTANTE: mudar aqui = atualizar o system prompt v3 PARTE VII junto.
export const geracaoOpcaoSchema = z.object({
  texto: z.string(),
  tom: z.string(),
});

export const geracaoOutputSchema = z.object({
  leitura: z.string(),
  opcoes: z.array(geracaoOpcaoSchema).length(3),
  skills_aplicadas: z.array(z.string()),
  info_nova_detectada: z.string().nullable(),
  alerta: z.string().nullable(),
});

export type GeracaoOpcao = z.infer<typeof geracaoOpcaoSchema>;
export type GeracaoOutput = z.infer<typeof geracaoOutputSchema>;

// ─────────────────────────────────────────────────────────────────
// ADR-022 Marco 4 — schemas multimodais
// Transcrição estruturada persistida em generations.her_message_structured
// Reutilizada futuramente como few-shot pra aprendizado por usuário.
// ─────────────────────────────────────────────────────────────────

// Print de conversa
export const mensagemPrintSchema = z.object({
  autor: z.enum(['ela', 'ele']),
  texto: z.string(),
  emojis: z.array(z.string()).optional(),
  tom: z.string().optional(),
});

export const transcricaoPrintSchema = z.object({
  mensagens: z.array(mensagemPrintSchema),
  ultima_dela: z.string(),
  vibe_geral: z.string(),
});

export type MensagemPrint = z.infer<typeof mensagemPrintSchema>;
export type TranscricaoPrint = z.infer<typeof transcricaoPrintSchema>;

// Áudio
export const transcricaoAudioSchema = z.object({
  transcricao: z.string(),
  tom_emocional: z.string(),
  pausas_relevantes: z.array(z.string()).optional(),
  risadas: z.boolean().optional(),
  duracao_seg: z.number().optional(),
  recomendar_audio_volta: z.boolean().optional(),
});

export type TranscricaoAudio = z.infer<typeof transcricaoAudioSchema>;

// Outputs combinados: geração padrão + transcrição estruturada da mídia
export const geracaoOutputPrintSchema = geracaoOutputSchema.extend({
  transcricao_estruturada: transcricaoPrintSchema,
});

export const geracaoOutputAudioSchema = geracaoOutputSchema.extend({
  transcricao_estruturada: transcricaoAudioSchema,
});

export type GeracaoOutputPrint = z.infer<typeof geracaoOutputPrintSchema>;
export type GeracaoOutputAudio = z.infer<typeof geracaoOutputAudioSchema>;

// Input do form multimodal (igual ao de texto + arquivo)
// crush_id, intensity, intent, extra_context já estão no geracaoInputSchema.
// her_message FICA OPCIONAL pra modo print/áudio (a IA preenche via extração)
export const geracaoMidiaInputSchema = z.object({
  crush_id: z.string().uuid(),
  intensity: z.number().int().min(1).max(5),
  intent: z.enum(intentOptions),
  extra_context: z.string().trim().max(2000),
});

export type GeracaoMidiaInput = z.infer<typeof geracaoMidiaInputSchema>;

// Tipos MIME aceitos (validados no client + na Server Action)
export const ALLOWED_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const ALLOWED_AUDIO_MIME = [
  'audio/mpeg',
  'audio/mp3',
  'audio/ogg',
  'audio/aac',
  'audio/wav',
  'audio/webm',
  'audio/x-m4a',
  'audio/mp4',
] as const;

// Limites de tamanho em bytes (validar antes de enviar pra Gemini)
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_AUDIO_BYTES = 8 * 1024 * 1024; // 8 MB (~4-5 min de áudio voz)

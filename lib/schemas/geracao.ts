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

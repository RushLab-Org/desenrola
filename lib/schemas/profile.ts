import { z } from 'zod';

export const ageRangeOptions = ['18-24', '25-30', '31-38', '39-45', '46-55', '55+'] as const;

export const ageRangeLabels: Record<(typeof ageRangeOptions)[number], string> = {
  '18-24': '18 a 24',
  '25-30': '25 a 30',
  '31-38': '31 a 38',
  '39-45': '39 a 45',
  '46-55': '46 a 55',
  '55+': '55+',
};

export const maritalStatusOptions = [
  'single_long_term',
  'recently_single',
  'divorced',
  'widowed',
] as const;

export const maritalStatusLabels: Record<(typeof maritalStatusOptions)[number], string> = {
  single_long_term: 'solteiro faz tempo',
  recently_single: 'solteiro recente',
  divorced: 'divorciado',
  widowed: 'viúvo',
};

export const timeSingleOptions = ['less_3_months', '3_to_12_months', 'more_1_year'] as const;

export const timeSingleLabels: Record<(typeof timeSingleOptions)[number], string> = {
  less_3_months: 'menos de 3 meses',
  '3_to_12_months': '3 a 12 meses',
  more_1_year: 'mais de 1 ano',
};

export const primaryGoalOptions = [
  'reconquer_specific',
  'date_around',
  'serious_relationship',
  'avoid_mistakes',
  'learn_flirting',
] as const;

export const primaryGoalLabels: Record<(typeof primaryGoalOptions)[number], string> = {
  reconquer_specific: 'reconquistar alguém específica',
  date_around: 'ficar com várias',
  serious_relationship: 'relação séria',
  avoid_mistakes: 'parar de cometer erros',
  learn_flirting: 'aprender a paquerar',
};

// Valores devem bater com PARTE II.6 do system prompt v3 (improvement_areas).
// Mudar aqui SEM atualizar o prompt vai gerar respostas descalibradas.
export const improvementAreaOptions = [
  'flerte',
  'conexao_emocional',
  'sair_dr',
  'manter_interesse',
  'iniciar_conversa',
  'fechar_encontro',
  'sair_friendzone',
  'reconquista',
  'relacao_estavel',
] as const;

export const improvementAreaLabels: Record<(typeof improvementAreaOptions)[number], string> = {
  flerte: 'flertar melhor',
  conexao_emocional: 'criar conexão',
  sair_dr: 'sair de DR',
  manter_interesse: 'manter interesse',
  iniciar_conversa: 'iniciar conversa',
  fechar_encontro: 'fechar encontro',
  sair_friendzone: 'sair da friendzone',
  reconquista: 'reconquistar',
  relacao_estavel: 'melhorar relação estável',
};

export const profileSchema = z.object({
  age_range: z.enum(ageRangeOptions),
  marital_status: z.enum(maritalStatusOptions),
  time_single: z.enum(timeSingleOptions).nullable(),
  returning_to_market: z.boolean(),
  has_children: z.boolean(),
  improvement_areas: z
    .array(z.enum(improvementAreaOptions))
    .min(1, 'escolhe pelo menos uma área'),
  primary_goal: z.enum(primaryGoalOptions),
});

export type ProfileInput = z.infer<typeof profileSchema>;

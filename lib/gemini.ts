import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
} from '@google/generative-ai';
import { requireEnv } from '@/lib/env';
import { SYSTEM_PROMPT_V3 } from '@/prompts/system-prompt-v3';
import {
  ageRangeLabels,
  improvementAreaLabels,
  maritalStatusLabels,
  primaryGoalLabels,
  timeSingleLabels,
} from '@/lib/schemas/profile';
import { relationshipTypeLabels } from '@/lib/schemas/crush';
import { geracaoOutputSchema, type GeracaoInput, type GeracaoOutput } from '@/lib/schemas/geracao';

// ADR-006: BLOCK_NONE nas 4 categorias = máximo permissivo configurável.
// Limites residuais (CSAM, menores, instruções pra crime grave) são guardrails
// hard do modelo e estão alinhados com PARTE VI do system prompt v3.
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

function getModel() {
  const genAI = new GoogleGenerativeAI(requireEnv('GEMINI_API_KEY'));
  return genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    systemInstruction: SYSTEM_PROMPT_V3,
    safetySettings,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.9,
    },
  });
}

export type ProfileForPrompt = {
  age_range: string | null;
  marital_status: string | null;
  time_single: string | null;
  returning_to_market: boolean | null;
  has_children: boolean | null;
  improvement_areas: string[] | null;
  primary_goal: string | null;
};

export type CrushForPrompt = {
  name: string;
  relationship_type: string;
  context: string | null;
};

function yn(v: boolean | null): string {
  if (v === true) return 'sim';
  if (v === false) return 'não';
  return 'não informado';
}

function labelOrRaw<T extends string>(
  value: string | null,
  labels: Record<T, string>,
): string {
  if (!value) return 'não informado';
  return labels[value as T] ?? value;
}

function montarPromptUsuario(
  input: GeracaoInput,
  profile: ProfileForPrompt,
  crush: CrushForPrompt,
): string {
  const idadeLabel = labelOrRaw(profile.age_range, ageRangeLabels);
  const situacaoLabel = labelOrRaw(profile.marital_status, maritalStatusLabels);
  const tempoSolteiroLine =
    profile.marital_status === 'recently_single' && profile.time_single
      ? `\n- Tempo solteiro: ${labelOrRaw(profile.time_single, timeSingleLabels)}`
      : '';
  const areasMelhorar =
    profile.improvement_areas && profile.improvement_areas.length > 0
      ? profile.improvement_areas
          .map((a) => labelOrRaw(a, improvementAreaLabels))
          .join(', ')
      : 'não informado';
  const objetivoLabel = labelOrRaw(profile.primary_goal, primaryGoalLabels);
  const tipoRelLabel = labelOrRaw(crush.relationship_type, relationshipTypeLabels);

  const contextoExtraLine = input.extra_context
    ? `\n- Contexto extra desta situação: ${input.extra_context}`
    : '';

  return `PERFIL DO USUÁRIO:
- Idade: ${idadeLabel}
- Situação relacional: ${situacaoLabel}${tempoSolteiroLine}
- Voltando ao mercado: ${yn(profile.returning_to_market)}
- Tem filhos: ${yn(profile.has_children)}
- Áreas que quer melhorar: ${areasMelhorar}
- Objetivo principal: ${objetivoLabel}

PERFIL DA CRUSH (${crush.name}):
- Tipo de relação: ${tipoRelLabel}
- Contexto registrado: ${crush.context?.trim() || '(sem contexto registrado ainda)'}

MENSAGEM DELA:
"""
${input.her_message}
"""

PARÂMETROS DA RESPOSTA SOLICITADA:
- Intensidade desejada: ${input.intensity} (1=leve, 2=equilibrado, 3=quente, 4=provocante)
- Intenção do usuário: ${input.intent}${contextoExtraLine}

Gere 3 opções de resposta seguindo o JSON estruturado da PARTE VII do seu prompt.`;
}

export class GeracaoBloqueadaError extends Error {
  constructor(public readonly motivo: string) {
    super(motivo);
    this.name = 'GeracaoBloqueadaError';
  }
}

export async function gerarPorTexto(args: {
  input: GeracaoInput;
  profile: ProfileForPrompt;
  crush: CrushForPrompt;
}): Promise<GeracaoOutput> {
  const model = getModel();
  const userPrompt = montarPromptUsuario(args.input, args.profile, args.crush);

  const result = await model.generateContent(userPrompt);
  const response = result.response;

  // Gemini pode retornar promptFeedback.blockReason mesmo com BLOCK_NONE
  // em casos de guardrail hard (PARTE VI do system prompt cobre os mesmos).
  if (response.promptFeedback?.blockReason) {
    throw new GeracaoBloqueadaError(
      `IA recusou: ${response.promptFeedback.blockReason}`,
    );
  }

  const text = response.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('A IA não devolveu JSON válido.');
  }

  const validated = geracaoOutputSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error('A IA devolveu JSON fora do schema esperado.');
  }

  return validated.data;
}

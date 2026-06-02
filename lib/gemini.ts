import {
  GoogleGenerativeAI,
  HarmBlockThreshold,
  HarmCategory,
  type GenerateContentResult,
  type Part,
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
import {
  geracaoOutputAudioSchema,
  geracaoOutputPrintSchema,
  geracaoOutputSchema,
  type GeracaoInput,
  type GeracaoMidiaInput,
  type GeracaoOutput,
  type GeracaoOutputAudio,
  type GeracaoOutputPrint,
} from '@/lib/schemas/geracao';

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

// Temperatura escala por intensidade — mais ousadia em registros sexuais.
// Range Gemini é 0-2. Acima de 1.1 risco maior de JSON malformado.
function temperatureFor(intensity: number): number {
  switch (intensity) {
    case 1:
      return 0.8;
    case 2:
      return 0.9;
    case 3:
      return 0.95;
    case 4:
      return 1.05;
    case 5:
      return 1.1;
    default:
      return 0.9;
  }
}

// ADR-031: 3.5-flash primário (qualidade/variação melhor). ADR-037: fallback
// pra 2.5-flash quando o 3.5 dá 503/sobrecarga (picos de demanda do Google).
const PRIMARY_MODEL = 'gemini-3.5-flash';
const FALLBACK_MODEL = 'gemini-2.5-flash';

function getModel(intensity: number, modelName: string) {
  const genAI = new GoogleGenerativeAI(requireEnv('GEMINI_API_KEY'));
  return genAI.getGenerativeModel({
    // mantém BLOCK_NONE + JSON. Custo do 3.5 ~5-8x do 2.5 — ver ADR-031/037.
    model: modelName,
    systemInstruction: SYSTEM_PROMPT_V3,
    safetySettings,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: temperatureFor(intensity),
    },
  });
}

// Detecta erro de DISPONIBILIDADE (vale retry/fallback), não erro de conteúdo.
function isOverloadError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /\b(503|500|429)\b|overloaded|high demand|Service Unavailable|UNAVAILABLE|RESOURCE_EXHAUSTED|internal error/i.test(
    msg,
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type GenContentInput = string | Array<string | Part>;

// Geração resiliente (ADR-037): tenta o primário (1 retry em erro de
// sobrecarga), depois cai pro fallback. Erro não-transitório aborta na hora.
// Retorna a response do Gemini ou relança o último erro.
async function generateResilient(
  intensity: number,
  input: GenContentInput,
): Promise<GenerateContentResult['response']> {
  const chain = [PRIMARY_MODEL, FALLBACK_MODEL];
  let lastErr: unknown;

  for (const modelName of chain) {
    const model = getModel(intensity, modelName);
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const result = await model.generateContent(input);
        return result.response;
      } catch (err) {
        lastErr = err;
        if (!isOverloadError(err)) throw err; // não-transitório: aborta
        if (attempt === 0) await sleep(700); // backoff antes do retry
      }
    }
    // esgotou retries nesse modelo por sobrecarga → próximo da chain
  }
  throw lastErr;
}

// Boost contextual: instrução extra anexada ao prompt do usuário pra reforçar
// a calibração que o system prompt já define (PARTE IV — Intensidade).
// Útil porque Gemini tem viés default pra polidez mesmo com BLOCK_NONE.
function intensityBoost(intensity: number, intent: string): string {
  if (intensity <= 2) return '';

  if (intensity === 3) {
    return `
NOTA DE CALIBRAÇÃO (intensidade 3 - quente):
- Flerte claro com double meaning ambíguo. Tensão sexual saudável.
- Humor mais cúmplice, menos amenizador. Não fechar opções com "kkk" só pra escapar da tensão.`;
  }

  if (intensity === 4) {
    const intentLine =
      intent === 'esquentar' || intent === 'sexualizar'
        ? `\n- Intenção "${intent}" + intensidade 4: vai DIRETO no peso sexual — o usuário tá tomando a iniciativa de subir pro sexo. Humor adulto como tempero ocasional, nunca como base.`
        : '';
    return `
NOTA DE CALIBRAÇÃO (intensidade 4 - provocante / safadeza zelada):
- AMBOS sabem que tão falando de putaria, mas sem ser cru. Intenção sexual ÓBVIA pros dois.
- Humor REDUZIDO. Só de teor sexual velado/óbvio (piada cúmplice adulta, double meaning que ambos pegam).
- NÃO use "kkk", emoji de risada, ou humor como válvula de escape da tensão sexual.
- Frases com peso sexual claro mas não cru. Convites/sugestões diretas. Confiança ousada (afirmação, não pergunta).${intentLine}`;
  }

  if (intensity === 5) {
    const intentLine =
      intent === 'esquentar' || intent === 'sexualizar'
        ? '\n- A intenção + a intensidade 5 mandam aqui: o usuário escolheu subir pro explícito. Vai pro sexual direto MESMO que a última mensagem dela seja morna — ele tá tomando a iniciativa, não espere ela puxar.'
        : '';
    return `
NOTA DE CALIBRAÇÃO (intensidade 5 - explícito / putaria pouco sutil):
- Sexual direto, sem rodeio. Humor minimizado — só nota cúmplice rápida, nunca como mediação.
- Linguagem sexual adulta crua mas não objetificante. Frases que descrevem desejo/ação sexual com peso e cumplicidade.
- Palavrão OK se o registro coloquial pedir.
- SEM "kkk", SEM emoji de risada, SEM suavização performática.
- Confiança ousada: ela tá no jogo, então não cala, não diminui, não pede permissão.${intentLine}`;
  }

  return '';
}

// Boost de RELAÇÃO: reforço contextual por chamada do tipo de relação com a
// crush. Mesma lógica do intensityBoost (ADR-020): o Gemini ignora guia "macio"
// no system prompt; reforço explícito por chamada faz o tipo de relação MOVER o
// output. Sem isso, ficante e conversante geram a mesma resposta (ADR-027).
function relationshipBoost(relationship: string): string {
  switch (relationship) {
    case 'namorada':
      return `
NOTA DE RELAÇÃO (namorada/esposa — intimidade estabelecida):
- Tom de quem já tem intimidade: sem cerimônia de paquera inicial, referências internas OK.
- Foco em reacender, quebrar rotina, surpreender. Em registros altos, à vontade total.`;
    case 'ficante':
      return `
NOTA DE RELAÇÃO (ficante/FWB — território conhecido):
- Leve, ágil, intimidade presumida. Pode ir direto, sem construir do zero.
- Sem demanda emocional grande, sem "definir relação", sem projeção de futuro.`;
    case 'conversante':
      return `
NOTA DE RELAÇÃO (conversante/paquera recente — ainda construindo):
- NÃO presuma intimidade que ainda não existe. Atração se constrói com jogo/sedução, não com familiaridade.
- Se a intensidade pedida for alta (3+), pode ir, MAS reconhecendo que tá escalando rápido — com sedução e confiança, NUNCA com freio moralista. O enquadramento é diferente de quem já transa com ela.`;
    case 'ex':
      return `
NOTA DE RELAÇÃO (ex):
- Cuidado com o histórico. Postura adulta, sem rancor, sem cobrança, sem mágoa expressa.
- Humor leve sobre o passado bom é OK; comparações com o presente e ressentimento, não.`;
    default:
      return '';
  }
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
  age_range: string | null;
  context: string | null;
};

// Task #35 — few-shot dinâmico por user.
// Cada item é uma geração passada que o usuário marcou como vitória.
// Injetamos no prompt pra IA aprender o estilo/voz que funciona pra ele.
export type VitoriaPassada = {
  her_message: string | null;
  ai_options: unknown; // JSONB do banco - validamos shape mínimo no prompt
  intensity: number;
  intent: string;
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

/**
 * Constrói bloco "EXEMPLOS DO QUE JÁ FUNCIONOU" pra injetar no prompt.
 * Mostra 3 vitórias mais recentes. Limita comprimento pra economizar tokens.
 * Retorna string vazia se não houver vitórias.
 */
function montarVitoriasBloco(vitorias: VitoriaPassada[]): string {
  if (!vitorias || vitorias.length === 0) return '';

  const top = vitorias.slice(0, 3);
  const blocos = top.map((v, idx) => {
    const her = v.her_message ?? '(sem mensagem registrada)';
    const herTrunc = her.length > 200 ? her.slice(0, 200) + '...' : her;
    let opcoesText = '(sem opções registradas)';

    if (Array.isArray(v.ai_options)) {
      opcoesText = (v.ai_options as Array<{ texto?: string }>)
        .filter((o) => typeof o?.texto === 'string')
        .map((o) => `   - ${o.texto}`)
        .join('\n');
      if (!opcoesText) opcoesText = '(sem opções registradas)';
    }

    return `[${idx + 1}] intensity=${v.intensity} / intent=${v.intent}
Mensagem dela: "${herTrunc}"
Opções geradas (uma delas marcada como vitória):
${opcoesText}`;
  });

  return `

EXEMPLOS DO QUE JÁ FUNCIONOU PRA ESSE USUÁRIO (referência de estilo/voz; NÃO copiar literal — usar como calibração do registro):

${blocos.join('\n\n')}`;
}

function montarPromptUsuario(
  input: GeracaoInput,
  profile: ProfileForPrompt,
  crush: CrushForPrompt,
  vitorias: VitoriaPassada[] = [],
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
  const idadeCrushLine = crush.age_range
    ? `\n- Idade dela: ${labelOrRaw(crush.age_range, ageRangeLabels)}`
    : '';

  const contextoExtraLine = input.extra_context
    ? `\n- Contexto extra desta situação: ${input.extra_context}`
    : '';

  const boost = intensityBoost(input.intensity, input.intent);
  const relBoost = relationshipBoost(crush.relationship_type);
  const vitoriasBloco = montarVitoriasBloco(vitorias);

  return `PERFIL DO USUÁRIO:
- Idade: ${idadeLabel}
- Situação relacional: ${situacaoLabel}${tempoSolteiroLine}
- Voltando ao mercado: ${yn(profile.returning_to_market)}
- Tem filhos: ${yn(profile.has_children)}
- Áreas que quer melhorar: ${areasMelhorar}
- Objetivo principal: ${objetivoLabel}

PERFIL DA CRUSH (${crush.name}):
- Tipo de relação: ${tipoRelLabel}${idadeCrushLine}
- Contexto registrado: ${crush.context?.trim() || '(sem contexto registrado ainda)'}

MENSAGEM DELA:
"""
${input.her_message}
"""

PARÂMETROS DA RESPOSTA SOLICITADA:
- Intensidade desejada: ${input.intensity} (1=leve, 2=equilibrado, 3=quente, 4=provocante, 5=explícito)
- Intenção do usuário: ${input.intent}${contextoExtraLine}${boost}${relBoost}${vitoriasBloco}

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
  vitorias?: VitoriaPassada[];
}): Promise<GeracaoOutput> {
  const userPrompt = montarPromptUsuario(
    args.input,
    args.profile,
    args.crush,
    args.vitorias ?? [],
  );

  const response = await generateResilient(args.input.intensity, userPrompt);

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

// ─────────────────────────────────────────────────────────────────
// ADR-022 Marco 4 — funções multimodais
// ─────────────────────────────────────────────────────────────────

function montarPromptBase(
  input: GeracaoMidiaInput,
  profile: ProfileForPrompt,
  crush: CrushForPrompt,
  vitorias: VitoriaPassada[] = [],
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
  const idadeCrushLine = crush.age_range
    ? `\n- Idade dela: ${labelOrRaw(crush.age_range, ageRangeLabels)}`
    : '';

  const contextoExtraLine = input.extra_context
    ? `\n- Contexto extra desta situação: ${input.extra_context}`
    : '';

  const boost = intensityBoost(input.intensity, input.intent);
  const relBoost = relationshipBoost(crush.relationship_type);
  const vitoriasBloco = montarVitoriasBloco(vitorias);

  return `PERFIL DO USUÁRIO:
- Idade: ${idadeLabel}
- Situação relacional: ${situacaoLabel}${tempoSolteiroLine}
- Voltando ao mercado: ${yn(profile.returning_to_market)}
- Tem filhos: ${yn(profile.has_children)}
- Áreas que quer melhorar: ${areasMelhorar}
- Objetivo principal: ${objetivoLabel}

PERFIL DA CRUSH (${crush.name}):
- Tipo de relação: ${tipoRelLabel}${idadeCrushLine}
- Contexto registrado: ${crush.context?.trim() || '(sem contexto registrado ainda)'}

PARÂMETROS DA RESPOSTA SOLICITADA:
- Intensidade desejada: ${input.intensity} (1=leve, 2=equilibrado, 3=quente, 4=provocante, 5=explícito)
- Intenção do usuário: ${input.intent}${contextoExtraLine}${boost}${relBoost}${vitoriasBloco}`;
}

const PROMPT_PRINT_INSTRUCAO = `
VOU TE ENVIAR UMA IMAGEM DE PRINT DE CONVERSA DE WHATSAPP/MENSAGEM.

Faça DUAS coisas no MESMO JSON output:

1. EXTRAIA conversa estruturada:
   - Identifique quem enviou cada mensagem (esquerda geralmente é ela, direita é ele, mas CONFIRME pelo contexto)
   - Liste mensagens em ordem cronológica
   - Foque nas últimas 10 mensagens
   - Identifique a ÚLTIMA mensagem dela como ponto de resposta
   - Capture emojis dela e tom percebido (animada, sedutora, fria, etc)
   - IGNORE nomes de contatos (privacidade — não inclua nomes próprios)
   - IGNORE endereços, números de telefone, dados sensíveis

2. GERE 3 opções de resposta CONSIDERANDO TODO O HISTÓRICO VISÍVEL

Output JSON com EXATAMENTE esta estrutura:
{
  "transcricao_estruturada": {
    "mensagens": [
      {"autor": "ela", "texto": "...", "emojis": ["😂"], "tom": "..."},
      {"autor": "ele", "texto": "...", "tom": "..."}
    ],
    "ultima_dela": "...",
    "vibe_geral": "..."
  },
  "leitura": "...",
  "opcoes": [
    {"texto": "...", "tom": "..."},
    {"texto": "...", "tom": "..."},
    {"texto": "...", "tom": "..."}
  ],
  "skills_aplicadas": ["..."],
  "info_nova_detectada": null,
  "alerta": null
}`;

const PROMPT_AUDIO_INSTRUCAO = `
VOU TE ENVIAR UM ÁUDIO QUE ELA MANDOU.

Faça TRÊS coisas no MESMO JSON output:

1. TRANSCREVA o áudio (PT-BR, transcrição literal das palavras dela)
2. ANALISE tom emocional, pausas, hesitações, risadas, duração aproximada
3. GERE 3 opções de resposta (texto). Se o contexto pedir resposta também em áudio, marque "recomendar_audio_volta": true

Output JSON com EXATAMENTE esta estrutura:
{
  "transcricao_estruturada": {
    "transcricao": "...",
    "tom_emocional": "animada|triste|sedutora|neutra|irritada|...",
    "pausas_relevantes": ["[hesitação antes de X]"],
    "risadas": true,
    "duracao_seg": 8,
    "recomendar_audio_volta": false
  },
  "leitura": "...",
  "opcoes": [
    {"texto": "...", "tom": "..."},
    {"texto": "...", "tom": "..."},
    {"texto": "...", "tom": "..."}
  ],
  "skills_aplicadas": ["..."],
  "info_nova_detectada": null,
  "alerta": null
}`;

export async function gerarPorPrint(args: {
  input: GeracaoMidiaInput;
  profile: ProfileForPrompt;
  crush: CrushForPrompt;
  imageBase64: string;
  mimeType: string;
  vitorias?: VitoriaPassada[];
}): Promise<GeracaoOutputPrint> {
  const basePrompt = montarPromptBase(
    args.input,
    args.profile,
    args.crush,
    args.vitorias ?? [],
  );
  const fullPrompt = basePrompt + '\n\n' + PROMPT_PRINT_INSTRUCAO;

  const response = await generateResilient(args.input.intensity, [
    { text: fullPrompt },
    { inlineData: { mimeType: args.mimeType, data: args.imageBase64 } },
  ]);

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
    throw new Error('A IA não devolveu JSON válido (modo print).');
  }

  const validated = geracaoOutputPrintSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error('A IA devolveu JSON fora do schema esperado (modo print).');
  }

  return validated.data;
}

export async function gerarPorAudio(args: {
  input: GeracaoMidiaInput;
  profile: ProfileForPrompt;
  crush: CrushForPrompt;
  audioBase64: string;
  mimeType: string;
  vitorias?: VitoriaPassada[];
}): Promise<GeracaoOutputAudio> {
  const basePrompt = montarPromptBase(
    args.input,
    args.profile,
    args.crush,
    args.vitorias ?? [],
  );
  const fullPrompt = basePrompt + '\n\n' + PROMPT_AUDIO_INSTRUCAO;

  const response = await generateResilient(args.input.intensity, [
    { text: fullPrompt },
    { inlineData: { mimeType: args.mimeType, data: args.audioBase64 } },
  ]);

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
    throw new Error('A IA não devolveu JSON válido (modo áudio).');
  }

  const validated = geracaoOutputAudioSchema.safeParse(parsed);
  if (!validated.success) {
    throw new Error('A IA devolveu JSON fora do schema esperado (modo áudio).');
  }

  return validated.data;
}

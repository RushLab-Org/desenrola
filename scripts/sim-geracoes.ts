/**
 * Script ad-hoc pra rodar simulações de geração em vários cenários.
 *
 * Uso (do path lowercase, conforme ADR-019):
 *   cd "/d/Claude Code/sacada-ia"
 *   export GEMINI_API_KEY=$(doppler secrets get GEMINI_API_KEY --plain)
 *   npx tsx scripts/sim-geracoes.ts
 *
 * Output: cenário × intensidade × intenção com leitura e 3 opções.
 * Foco: averiguar se respostas parecem ou não IA. NÃO PARECER IA é
 * pilar 1 do system prompt v3.
 */

import { gerarPorTexto, type ProfileForPrompt, type CrushForPrompt } from '../lib/gemini';
import type { GeracaoInput } from '../lib/schemas/geracao';

type Scenario = {
  name: string;
  profile: ProfileForPrompt;
  crush: CrushForPrompt;
  her_message: string;
  extra_context?: string;
};

// Perfil-base do user pros testes (adulto BR típico, 31-38, solteiro recente)
const baseProfile: ProfileForPrompt = {
  age_range: '31-38',
  marital_status: 'recently_single',
  time_single: '3_to_12_months',
  returning_to_market: true,
  has_children: false,
  improvement_areas: ['flerte', 'manter_interesse', 'fechar_encontro'],
  primary_goal: 'date_around',
};

const scenarios: Scenario[] = [
  {
    name: 'A) Mensagem casual de oi',
    profile: baseProfile,
    crush: {
      age_range: '25-30',
      name: 'Marina',
      relationship_type: 'conversante',
      context: 'match no Tinder há 2 semanas. Trocaram poucas mensagens. Trabalha em marketing.',
    },
    her_message: 'oi sumido',
  },
  {
    name: 'B) Conversa esquentando sutilmente',
    profile: baseProfile,
    crush: {
      age_range: '25-30',
      name: 'Marina',
      relationship_type: 'ficante',
      context: 'Ficaram numa festa há 3 semanas. Trocam mensagens flertando.',
    },
    her_message: 'tá fazendo o que essa noite?',
  },
  {
    name: 'C) Convite sexual quase explícito (cenário do vinho)',
    profile: baseProfile,
    crush: {
      age_range: '25-30',
      name: 'Marina',
      relationship_type: 'ficante',
      context: 'Conheceram num show. Ficaram uma vez (só beijo). Trocam flertes pelo Instagram.',
    },
    her_message: 'um vinhozinho agora de noite seria uma boa mesmo, era só uma companhia',
    extra_context: 'a gente estava falando que tá muito frio na cidade e eu comentei que um vinho era uma boa nesse frio',
  },
  {
    name: 'D) Shit test ("vc sumiu hein")',
    profile: baseProfile,
    crush: {
      age_range: '25-30',
      name: 'Marina',
      relationship_type: 'conversante',
      context: 'Saíram uma vez há 1 mês. Conversaram um pouco depois mas ele sumiu por 2 semanas.',
    },
    her_message: 'kkk vc sumiu hein, achei que tinha desistido de mim',
  },
  {
    name: 'E) DR (puxando definição)',
    profile: baseProfile,
    crush: {
      age_range: '25-30',
      name: 'Marina',
      relationship_type: 'ficante',
      context: 'Tão se vendo há 2 meses. Sem rótulo definido. Ela começou a pressionar.',
    },
    her_message: 'preciso saber o que a gente é. tô meio confusa.',
  },
  {
    name: 'F) Mensagem cheia de inuendo dela (resposta extrema)',
    profile: baseProfile,
    crush: {
      age_range: '25-30',
      name: 'Marina',
      relationship_type: 'ficante',
      context: 'Já ficaram várias vezes. Conversam frequentemente. Tem química sexual estabelecida.',
    },
    her_message: 'tô na cama pensando em vc...',
  },
];

const intensities = [2, 4, 5] as const;
const intents: GeracaoInput['intent'][] = ['responder_normal', 'esquentar'];

async function runOne(
  scenario: Scenario,
  intensity: 1 | 2 | 3 | 4 | 5,
  intent: GeracaoInput['intent'],
) {
  const input: GeracaoInput = {
    crush_id: '00000000-0000-0000-0000-000000000000',
    her_message: scenario.her_message,
    intensity,
    intent,
    extra_context: scenario.extra_context ?? '',
  };

  try {
    const out = await gerarPorTexto({
      input,
      profile: scenario.profile,
      crush: scenario.crush,
    });

    console.log(`\n────────────────────────────────────────`);
    console.log(`${scenario.name}`);
    console.log(`intensidade=${intensity} (${intensityLabel(intensity)}) | intent=${intent}`);
    console.log(`Msg dela: "${scenario.her_message}"`);
    console.log(`\n📖 Leitura: ${out.leitura}`);
    out.opcoes.forEach((o, i) => {
      console.log(`\n  [${i + 1}] (${o.tom})`);
      console.log(`      ${o.texto}`);
    });
    console.log(`\n🎯 skills: ${out.skills_aplicadas.join(', ')}`);
    if (out.info_nova_detectada) {
      console.log(`💡 info nova: ${out.info_nova_detectada}`);
    }
    if (out.alerta) {
      console.log(`⚠️  alerta: ${out.alerta}`);
    }
  } catch (e) {
    console.log(`\n❌ ${scenario.name} | ${intensity} | ${intent}: ${(e as Error).message}`);
  }
}

function intensityLabel(i: number): string {
  return ['', 'leve', 'equilibrado', 'quente', 'provocante', 'explícito'][i] ?? '?';
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('SIMULAÇÃO DE GERAÇÕES — averiguar qualidade "não parecer IA"');
  console.log('═══════════════════════════════════════════════════════');

  for (const scenario of scenarios) {
    for (const intent of intents) {
      for (const intensity of intensities) {
        await runOne(scenario, intensity, intent);
        // Espaçar chamadas pra não estourar rate limit
        await new Promise((r) => setTimeout(r, 800));
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════');
  console.log('FIM');
}

main().catch((e) => {
  console.error('Erro fatal:', e);
  process.exit(1);
});

/* eslint-disable react/no-unescaped-entities */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Perfil = 'recomecante' | 'esquentado' | 'calibrado';
type Opcao = { label: string; perfil: Perfil; peso: number };

type PerguntaStep = {
  tipo: 'pergunta';
  pergunta: string;
  detalhe?: string;
  opcoes: Opcao[];
};

type BridgeStep = {
  tipo: 'bridge';
  h: string;
  stat_numero: string;
  stat_texto: string;
  insight: string;
  her_message: string;
  preview_ruim: string;
  preview_bom: string;
  botao: string;
};

type Step = PerguntaStep | BridgeStep;

const STEPS: Step[] = [
  /* ── Q1 – OPENER ─────────────────────────────────────────── */
  {
    tipo: 'pergunta',
    pergunta: 'A última mensagem que você ficou com medo de mandar... o que você fez?',
    opcoes: [
      { label: 'Reescrevi umas 4 vezes e mandei algo mais "seguro" — provavelmente menos interessante', perfil: 'recomecante', peso: 3 },
      { label: 'Perguntei pra alguém o que achar — ou simplesmente não mandei', perfil: 'recomecante', peso: 2 },
      { label: 'Mandei rápido pra não pensar demais e fiquei me arrependendo depois', perfil: 'esquentado', peso: 3 },
      { label: 'Tenho uma forma de lidar com isso — mas nunca sei se funcionou por mérito ou sorte', perfil: 'calibrado', peso: 3 },
    ],
  },

  /* ── Q2 – DOR ESPECÍFICA ─────────────────────────────────── */
  {
    tipo: 'pergunta',
    pergunta: 'Ela tava respondendo rápido. Você mandou alguma coisa e ela demorou 3 horas pra responder com um "haha". O que você sentiu?',
    opcoes: [
      { label: 'Aquele aperto no estômago — "será que eu disse algo errado?"', perfil: 'esquentado', peso: 3 },
      { label: 'Raiva de mim mesmo — sei que errei o tom mas não entendo como', perfil: 'esquentado', peso: 2 },
      { label: 'Confusão total — não sei mais ler o que esses sinais significam', perfil: 'recomecante', peso: 3 },
      { label: 'Incerteza — nunca sei se é sinal ruim ou ela só estava ocupada', perfil: 'calibrado', peso: 3 },
    ],
  },

  /* ── Q3 – SITUAÇÃO ───────────────────────────────────────── */
  {
    tipo: 'pergunta',
    pergunta: 'Tem alguém específica no teu radar agora?',
    opcoes: [
      { label: 'Sim — e cada mensagem dela parece uma decisão de alto risco', perfil: 'esquentado', peso: 3 },
      { label: 'Sim — mas a conversa tá morna e não sei como esquentar', perfil: 'esquentado', peso: 2 },
      { label: 'Não agora — mas já perdi alguém por erro de mensagem e isso ficou na cabeça', perfil: 'recomecante', peso: 3 },
      { label: 'Conheci alguém recentemente — ainda estou tentando entender ela', perfil: 'recomecante', peso: 2 },
    ],
  },

  /* ── BRIDGE – MOMENTO DE VENDA ────────────────────────────── */
  {
    tipo: 'bridge',
    h: 'Suas respostas estão revelando um padrão que você nunca nomeou.',
    stat_numero: '8 em 10',
    stat_texto: 'homens acima de 35 que voltaram ao mercado perderam pelo menos uma oportunidade real por causa de uma mensagem enviada no tom errado.',
    insight: 'Não é falta de charme. Não é falta de interesse da parte dela. É que existe uma linguagem nas mensagens — com regras específicas que ninguém te ensinou. E quem aprende esse idioma não precisa ser o mais bonito nem o mais jovem.',
    her_message: '"nossa, que dia pesado... mas tô bem 😅"',
    preview_ruim: '"que chato, descansa! amanhã é outro dia 😊"',
    preview_bom: '"vou ignorar o \'bem\'. me conta o que foi."',
    botao: 'Continuar meu diagnóstico →',
  },

  /* ── Q4 – COMPORTAMENTO REAL ─────────────────────────────── */
  {
    tipo: 'pergunta',
    pergunta: 'Ela manda uma mensagem ambígua — tipo "tô numa fase estranha" ou "tô pensando em você rs". O que você faz?',
    opcoes: [
      { label: 'Fico tentando decifrar o que ela quis dizer antes de escrever qualquer coisa', perfil: 'calibrado', peso: 2 },
      { label: 'Mando algo seguro pra não errar — depois fico me perguntando se fui interessante', perfil: 'esquentado', peso: 3 },
      { label: 'Tenho um senso do que ela quer — mas na hora de executar perco o fio', perfil: 'calibrado', peso: 3 },
      { label: 'Peço mais contexto pra entender — mas fico com medo de parecer inseguro', perfil: 'recomecante', peso: 2 },
    ],
  },

  /* ── Q5 – VERGONHA/URGÊNCIA ──────────────────────────────── */
  {
    tipo: 'pergunta',
    pergunta: 'Já aconteceu de uma mulher parar de responder de repente — e você saber, no fundo, que uma resposta sua causou isso?',
    opcoes: [
      { label: 'Sim — e fico revivendo o que poderia ter mandado', perfil: 'esquentado', peso: 3 },
      { label: 'Provavelmente sim — mas prefiro não pensar muito nisso', perfil: 'recomecante', peso: 2 },
      { label: 'Não tenho certeza — e essa incerteza me incomoda mais do que saber', perfil: 'calibrado', peso: 2 },
      { label: 'Não — mas o medo de que aconteça está sempre presente', perfil: 'esquentado', peso: 2 },
    ],
  },

  /* ── Q6 – CENÁRIO ESPECÍFICO ─────────────────────────────── */
  {
    tipo: 'pergunta',
    pergunta: 'Ela manda "oi sumido :)" depois de 5 dias sem responder. O que você faz?',
    opcoes: [
      { label: 'Respondo imediatamente — aliviado que voltou, mas sem certeza do tom certo', perfil: 'esquentado', peso: 3 },
      { label: 'Espero algumas horas pra não parecer ansioso — depois mando algo neutro', perfil: 'recomecante', peso: 2 },
      { label: 'Mando algo mais direto ou engraçado — mas fico inseguro se acertei', perfil: 'esquentado', peso: 2 },
      { label: 'Tenho um jeito de responder isso — mas nunca sei se é mérito ou sorte', perfil: 'calibrado', peso: 3 },
    ],
  },

  /* ── Q7 – ASPIRAÇÃO ──────────────────────────────────────── */
  {
    tipo: 'pergunta',
    pergunta: 'O que você mais quer agora?',
    opcoes: [
      { label: 'Parar de adivinhar o que ela quer dizer — entender os sinais de verdade', perfil: 'calibrado', peso: 2 },
      { label: 'Ter a resposta certa na ponta da língua — sem reescrever 4 vezes antes de mandar', perfil: 'esquentado', peso: 3 },
      { label: 'Voltar a sentir que sou interessante — e que ela percebe isso', perfil: 'recomecante', peso: 3 },
      { label: 'Transformar conversa em encontro de verdade, sem enrolar', perfil: 'calibrado', peso: 3 },
    ],
  },
];

/* ── Scoring ─────────────────────────────────────────────── */
function calcularPerfil(respostas: number[]): Perfil {
  const scores: Record<Perfil, number> = { recomecante: 0, esquentado: 0, calibrado: 0 };
  const perguntas = STEPS.filter((s): s is PerguntaStep => s.tipo === 'pergunta');
  respostas.forEach((opcaoIdx, pergIdx) => {
    const step = perguntas[pergIdx];
    if (step && opcaoIdx < step.opcoes.length) {
      const { perfil, peso } = step.opcoes[opcaoIdx];
      scores[perfil] += peso;
    }
  });
  return (Object.entries(scores) as [Perfil, number][]).sort((a, b) => b[1] - a[1])[0][0];
}

const TOTAL_PERGUNTAS = STEPS.filter(s => s.tipo === 'pergunta').length;

function perguntasAntesDoStep(idx: number): number {
  let count = 0;
  for (let i = 0; i < idx && i < STEPS.length; i++) {
    if (STEPS[i].tipo === 'pergunta') count++;
  }
  return count;
}

/* ── Componente ──────────────────────────────────────────── */
type Fase = 'intro' | 'quiz' | 'calculando';

export function QuizInterativo() {
  const router = useRouter();
  const [fase, setFase] = useState<Fase>('intro');
  const [stepIdx, setStepIdx] = useState(0);
  const [respostas, setRespostas] = useState<number[]>([]);
  const [selecionado, setSelecionado] = useState<number | null>(null);
  const [saindo, setSaindo] = useState(false);

  function iniciar() {
    setSaindo(true);
    setTimeout(() => { setFase('quiz'); setSaindo(false); }, 320);
  }

  function avancar(opcaoIdx?: number) {
    if (saindo) return;
    if (opcaoIdx !== undefined && selecionado !== null) return;
    if (opcaoIdx !== undefined) setSelecionado(opcaoIdx);

    // Para perguntas, aguarda o feedback visual da seleção antes de transicionar
    const delay = opcaoIdx !== undefined ? 370 : 0;

    setTimeout(() => {
      const novasRespostas = opcaoIdx !== undefined ? [...respostas, opcaoIdx] : respostas;
      setSaindo(true);

      setTimeout(() => {
        setRespostas(novasRespostas);
        setSelecionado(null);

        const proximo = stepIdx + 1;
        if (proximo < STEPS.length) {
          setStepIdx(proximo);
          setSaindo(false);
        } else {
          setFase('calculando');
          setSaindo(false);
          const perfil = calcularPerfil(novasRespostas);
          setTimeout(() => router.push(`/quiz/resultado/${perfil}`), 2200);
        }
      }, 290);
    }, delay);
  }

  const step = STEPS[stepIdx];
  const perguntasDone = fase === 'quiz' ? perguntasAntesDoStep(stepIdx) : 0;
  const progresso = (perguntasDone / TOTAL_PERGUNTAS) * 100;

  return (
    <div className={`quiz-container${saindo ? ' quiz-saindo' : ''}`}>

      {/* Marca */}
      <div className="quiz-header">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Desenrola" className="quiz-logo" />
      </div>

      {/* ── Introdução ──────────────────────────────────── */}
      {fase === 'intro' && (
        <div className="quiz-intro">
          <p className="kicker">diagnóstico gratuito</p>
          <h1 className="quiz-intro-h">
            Descubra o padrão que está travando suas conversas com ela.
          </h1>
          <p className="quiz-intro-sub">
            7 perguntas situacionais. 3 minutos. Um diagnóstico do que está acontecendo de verdade — e o que fazer sobre isso hoje.
          </p>
          <button type="button" className="cta quiz-intro-cta" onClick={iniciar}>
            Descobrir meu padrão <span className="arw">→</span>
          </button>
          <div className="quiz-intro-meta">
            <span>✓ Gratuito</span>
            <span>✓ Sem cadastro</span>
            <span>✓ Resultado personalizado</span>
          </div>
        </div>
      )}

      {/* ── Quiz ────────────────────────────────────────── */}
      {fase === 'quiz' && step && (
        <div style={{ width: '100%', maxWidth: 'var(--maxw)' }}>

          {/* Progress bar (só em perguntas) */}
          {step.tipo === 'pergunta' && (
            <div className="quiz-progress-wrap">
              <div className="quiz-progress-bar">
                <div className="quiz-progress-fill" style={{ width: `${progresso}%` }} />
              </div>
              <span className="quiz-progress-label">{perguntasDone + 1} de {TOTAL_PERGUNTAS}</span>
            </div>
          )}

          {/* Pergunta */}
          {step.tipo === 'pergunta' && (
            <div className="quiz-step" key={stepIdx}>
              <h2 className="quiz-pergunta">{step.pergunta}</h2>
              {step.detalhe && (
                <p style={{ fontSize: '15px', color: 'var(--fg-muted)', marginBottom: '20px', marginTop: '-12px' }}>
                  {step.detalhe}
                </p>
              )}
              <div className="quiz-opcoes">
                {step.opcoes.map((opcao, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`quiz-opcao${selecionado === i ? ' is-selected' : ''}`}
                    onClick={() => avancar(i)}
                    disabled={selecionado !== null}
                  >
                    <span className="quiz-opcao__letra">{String.fromCharCode(65 + i)}</span>
                    <span className="quiz-opcao__label">{opcao.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bridge page */}
          {step.tipo === 'bridge' && (
            <div className="quiz-bridge" key={stepIdx}>
              <h2 className="quiz-bridge__h">{step.h}</h2>

              <div className="quiz-bridge__stat">
                <p className="quiz-bridge__stat-numero">{step.stat_numero}</p>
                <p className="quiz-bridge__stat-texto">{step.stat_texto}</p>
              </div>

              <p className="quiz-bridge__insight">{step.insight}</p>

              {/* Preview antes/depois */}
              <div className="quiz-bridge__preview">
                <p className="quiz-bridge__preview-label">Ela mandou:</p>
                <div className="quiz-bridge__preview-dela">{step.her_message}</div>
                <p className="quiz-bridge__preview-label" style={{ marginTop: '16px' }}>A resposta que a maioria manda:</p>
                <div className="quiz-bridge__preview-ruim">{step.preview_ruim}</div>
                <p className="quiz-bridge__preview-label" style={{ marginTop: '12px' }}>
                  O que a Desenrola entrega:
                </p>
                <div className="quiz-bridge__preview-bom">{step.preview_bom}</div>
                <p style={{ fontSize: '13px', color: 'var(--fg-muted)', marginTop: '10px', textAlign: 'center' }}>
                  Veja seu resultado completo depois das últimas 4 perguntas.
                </p>
              </div>

              <button
                type="button"
                className="cta cta-full"
                onClick={() => avancar()}
                disabled={saindo}
              >
                {step.botao}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Calculando ──────────────────────────────────── */}
      {fase === 'calculando' && (
        <div className="quiz-calculando">
          <div className="quiz-spinner" aria-hidden="true" />
          <h2 className="quiz-calculando__h">Analisando suas respostas...</h2>
          <p className="quiz-calculando__sub">Identificando seu padrão de comunicação</p>
        </div>
      )}
    </div>
  );
}

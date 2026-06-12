/* eslint-disable react/no-unescaped-entities */
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

const CHECKOUT_URL = process.env.NEXT_PUBLIC_PERFECTPAY_URL ?? '#';

type Perfil = 'recomecante' | 'esquentado' | 'calibrado';
const PERFIS_VALIDOS: Perfil[] = ['recomecante', 'esquentado', 'calibrado'];

function isPerfil(v: string): v is Perfil {
  return (PERFIS_VALIDOS as string[]).includes(v);
}

/* ── Conteúdo por perfil ─────────────────────────────────── */

type Exemplo = { mensagem_dela: string; opcoes: { tom: string; texto: string }[] };
type Depoimento = { nome: string; texto: string };

type ConteudoPerfil = {
  badge: string;
  titulo: string;
  subtitulo: string;
  diag_p1: string;
  diag_p2: string;
  diag_p3: string;
  exemplo: Exemplo;
  depoimentos: Depoimento[];
  ponte: string;
  cta_texto: string;
  meta_title: string;
  meta_desc: string;
};

const CONTEUDO: Record<Perfil, ConteudoPerfil> = {
  recomecante: {
    badge: 'Seu perfil: O Recomecante',
    titulo: 'Você foi rei um dia. E tem tudo pra ser de novo.',
    subtitulo:
      'Você saiu de um relacionamento longo com maturidade, vivência e substância. O problema não é você — é que o idioma do namoro mudou enquanto você estava em outro lugar.',
    diag_p1:
      'Suas respostas mostram um padrão claro: você tem tudo que as mulheres de 30+ realmente procuram — maturidade, histórias, presença. Só que você ficou anos fora do ritmo, e as mensagens de hoje têm uma linguagem própria — ambígua por design, cheia de subtexto que o cara de fora não consegue decifrar.',
    diag_p2:
      'Aí acontece o ciclo: você manda o neutro, o seguro, o "descansa então!" — que parece gentil mas mata qualquer tensão. Ela não responde com entusiasmo. Você interpreta como desinteresse. Na verdade, a mensagem dela era uma abertura, e a sua resposta fechou a porta sem querer.',
    diag_p3:
      'A boa notícia: a base que você tem é exatamente o que falta pra maioria dos caras mais novos. Você precisa só de uma coisa — aprender a traduzir quem você é em mensagens que fazem ela sentir que vale a pena responder. E isso tem um sistema.',
    exemplo: {
      mensagem_dela: '"vi uma foto minha de uns 10 anos atrás hoje e ri muito kk"',
      opcoes: [
        { tom: 'curioso', texto: 'me manda essa foto. agora preciso saber.' },
        { tom: 'provocante', texto: '10 anos é tempo suficiente pra uma boa história. me conta a melhor.' },
        { tom: 'puxando pra frente', texto: 'foto dessa época merece ser vista com uma cerveja e a pessoa certa pra ouvir a história.' },
      ],
    },
    depoimentos: [
      { nome: 'Carlos, 44 anos', texto: 'Depois de 12 anos de casamento, não fazia ideia de como funciona mais. A Desenrola me ajudou a voltar a soar como eu mesmo — sem forçar nada.' },
      { nome: 'Fábio, 47 anos', texto: 'Em 2 semanas de uso já marquei dois encontros. O segredo foi entender que não precisa ser perfeito — precisa ser autêntico no tom certo.' },
      { nome: 'Ricardo, 39 anos', texto: 'Estava mandando as respostas mais genéricas possíveis. A IA me mostrou que eu tinha muito mais pra oferecer do que imaginava.' },
    ],
    ponte:
      'Pra resolver exatamente o que o seu perfil mostrou, criamos a Desenrola. Você cola a mensagem que ela mandou — e em segundos recebe 3 respostas calibradas pro momento: nem neutro demais, nem forçado. No seu tom, no tom certo.',
    cta_texto: 'Quero recuperar meu ritmo →',
    meta_title: 'Seu Perfil: O Recomecante — Desenrola',
    meta_desc: 'Você tem a substância que as mulheres procuram. Só precisa reconectar com o idioma do jogo. Veja seu diagnóstico completo.',
  },

  esquentado: {
    badge: 'Seu perfil: O Esquentado',
    titulo: 'Você está perto de algo bom. E a janela tá se fechando.',
    subtitulo:
      'Você tem alguém em mente — e cada mensagem dela parece uma decisão de vida. Responde demais: ansioso. Responde de menos: indiferente. Fica no meio: invisível.',
    diag_p1:
      'Suas respostas mostram um padrão específico: tem uma mulher no radar, ela está mandando sinais — só que você está num estado de alerta constante que produz exatamente as respostas mais genéricas que você já mandou. É o paradoxo do cuidado demais: você quer tanto não estragar que acaba não dizendo nada que realmente a atinge.',
    diag_p2:
      'O que está acontecendo não é falta de interesse seu, nem falta de charme. É excesso de tentativa de acertar sem ter o mapa da conversa. Você passa tempo demais tentando adivinhar o que ela quer em vez de liderar o rumo dela.',
    diag_p3:
      'A janela existe. Ela está aberta. O que você precisa não é de coragem nem de uma frase mágica — é de um sistema que te mostra o que cada mensagem dela está pedindo, e qual resposta abre a próxima porta em vez de fechar essa.',
    exemplo: {
      mensagem_dela: '"nossa, cansada hoje, mas tô bem kkk"',
      opcoes: [
        { tom: 'curioso', texto: 'cansada como? tipo o bom ou o ruim?' },
        { tom: 'provocante', texto: 'o "kkk" no fim me fez imaginar que você tá me escondendo alguma coisa.' },
        { tom: 'direto', texto: 'vou ignorar o "bem". me conta o que foi.' },
      ],
    },
    depoimentos: [
      { nome: 'Lucas, 36 anos', texto: 'Estava passando horas olhando pra tela sem saber o que mandar. A Desenrola me deu clareza em segundos — e ela continua na conversa.' },
      { nome: 'André, 41 anos', texto: 'Marquei o encontro na semana que comecei a usar. A resposta que mandei era exatamente o que eu não teria pensado sozinho.' },
      { nome: 'Marcos, 38 anos', texto: 'O medo de estragar era real. Depois de usar a Desenrola percebi que o problema não era eu — era que eu não tinha o mapa certo da conversa.' },
    ],
    ponte:
      'Pra resolver exatamente o que o seu perfil mostrou, criamos a Desenrola. Você cola a mensagem dela — e em 10 segundos tem 3 opções calibradas pro momento: no tom certo, na intensidade certa, prontas pra mandar. Sem travar, sem adivinhar.',
    cta_texto: 'Quero saber como responder ela certo →',
    meta_title: 'Seu Perfil: O Esquentado — Desenrola',
    meta_desc: 'Você tem alguém em mente e a janela está se fechando. Veja por que você está travando e como sair disso agora.',
  },

  calibrado: {
    badge: 'Seu perfil: O Calibrado',
    titulo: 'Você lê a situação. Mas ainda erra na hora H.',
    subtitulo:
      'Você tem mais base do que a maioria. O problema não é competência — é que você depende do instinto, e o instinto falha justamente quando tem algo a perder.',
    diag_p1:
      'Suas respostas mostram algo interessante: você percebe os sinais, você entende que existe uma linguagem nas mensagens dela. Às vezes você acerta na mosca. Às vezes sente que perdeu a janela sem entender por quê. Isso é o problema clássico de quem tem intuição mas não tem um sistema.',
    diag_p2:
      'Você depende do instinto — e o instinto falha justamente quando você mais precisa: quando tem algo a perder, quando está animado, quando a tensão aumenta. A insegurança não é sobre competência. É sobre não ter critérios claros pra saber que fez a escolha certa.',
    diag_p3:
      'O que você precisa não é aprender do zero — você já está na frente. Você precisa de um sistema que confirme o que você sente e te entregue a palavra certa no momento certo. Algo que converta a sua leitura da situação em mensagens que fazem ela dar o próximo passo.',
    exemplo: {
      mensagem_dela: '"não sei se vou sair esse fds"',
      opcoes: [
        { tom: 'ambíguo', texto: 'não sei se isso é um convite disfarçado ou uma reclamação. me esclarece.' },
        { tom: 'provocante', texto: 'seus fins de semana estão se tornando meus assuntos favoritos ultimamente.' },
        { tom: 'direto', texto: 'eu tinha uma ideia pra você. mas só funciona se você sair.' },
      ],
    },
    depoimentos: [
      { nome: 'Thiago, 37 anos', texto: 'Eu já tinha noção de como funciona, mas errava na execução. A Desenrola me deu a confirmação do que eu já sentia — e o texto certo na hora certa.' },
      { nome: 'Paulo, 40 anos', texto: 'O que me surpreendeu foi como a IA captura o tom da conversa. Não é genérico — é calibrado pro momento específico.' },
      { nome: 'Rodrigo, 35 anos', texto: 'Uso no celular mesmo, colo a mensagem dela e em 10 segundos tenho 3 opções. Escolho a que mais combina comigo e mando. Simples assim.' },
    ],
    ponte:
      'Pra resolver exatamente o que o seu perfil mostrou, criamos a Desenrola. Você cola a mensagem dela — e recebe 3 respostas calibradas que transformam sua leitura da situação em execução concreta. Sem depender do instinto no momento errado.',
    cta_texto: 'Quero afinar minha leitura das mensagens →',
    meta_title: 'Seu Perfil: O Calibrado — Desenrola',
    meta_desc: 'Você lê a situação — mas ainda erra na hora H. Veja por que o instinto falha e como ter um sistema que não falha.',
  },
};

/* ── Metadata dinâmica ──────────────────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ perfil: string }>;
}): Promise<Metadata> {
  const { perfil } = await params;
  if (!isPerfil(perfil)) return { title: 'Resultado — Desenrola' };
  const c = CONTEUDO[perfil];
  return { title: c.meta_title, description: c.meta_desc };
}

/* ── Page ───────────────────────────────────────────────── */
export default async function ResultadoPage({
  params,
}: {
  params: Promise<{ perfil: string }>;
}) {
  const { perfil } = await params;
  if (!isPerfil(perfil)) notFound();

  const c = CONTEUDO[perfil];

  const checkoutProps =
    CHECKOUT_URL === '#'
      ? { href: '#', 'aria-disabled': 'true' as const }
      : { href: CHECKOUT_URL, target: '_blank' as const, rel: 'noopener noreferrer' };

  return (
    <>
      {/* ── Nav ── */}
      <div className="resultado-nav">
        <a href="/quiz">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Desenrola" className="quiz-logo" />
        </a>
      </div>

      {/* ── Hero do resultado ── */}
      <div className="resultado-hero">
        <div className="wrap">
          <div className="resultado-badge">{c.badge}</div>
          <h1 className="resultado-titulo">{c.titulo}</h1>
          <p className="resultado-subtitulo">{c.subtitulo}</p>
        </div>
      </div>

      {/* ── Diagnóstico personalizado ── */}
      <section className="resultado-sec">
        <div className="wrap">
          <p className="kicker">Seu diagnóstico</p>
          <h2 className="h-sec" style={{ marginBottom: '28px' }}>O que as suas respostas revelaram:</h2>
          <div className="resultado-diagnostico">
            <p>{c.diag_p1}</p>
            <p>{c.diag_p2}</p>
            <p>{c.diag_p3}</p>
          </div>
        </div>
      </section>

      {/* ── Prova em ação — exemplo real ── */}
      <section className="resultado-sec" style={{ background: 'var(--bg-2)' }}>
        <div className="wrap">
          <p className="kicker">Veja funcionando</p>
          <h2 className="h-sec" style={{ marginBottom: '28px' }}>
            Isso é o que a Desenrola entregaria pro seu perfil agora:
          </h2>
          <p className="resultado-exemplo-label">Ela te mandou:</p>
          <p className="resultado-msg-dela">{c.exemplo.mensagem_dela}</p>
          <p style={{ marginBottom: '18px', color: 'var(--fg-muted)', fontSize: '14px' }}>
            A Desenrola analisa o contexto e entrega 3 opções calibradas pro seu perfil:
          </p>
          {c.exemplo.opcoes.map((op, i) => (
            <div className="resp" key={i}>
              <span className="tone">Opção {i + 1} · {op.tom}</span>
              <p className="msg">"{op.texto}"</p>
            </div>
          ))}
          <p style={{ marginTop: '20px', fontSize: '15px', color: 'var(--fg-2)' }}>
            Sentiu a diferença? Nenhuma parece robô. Todas soam como um homem que sabe o que está fazendo. E a Desenrola te entrega isso pra qualquer mensagem que ela mandar.
          </p>
        </div>
      </section>

      {/* ── Resultados de quem usou ── */}
      <section className="resultado-sec">
        <div className="wrap">
          <p className="kicker">Quem já usou</p>
          <h2 className="h-sec" style={{ marginBottom: '28px' }}>
            Homens com o seu perfil que estão usando:
          </h2>
          <div className="resultado-depos">
            {c.depoimentos.map((d, i) => (
              <div className="resultado-depo" key={i}>
                <p className="resultado-depo__texto">"{d.texto}"</p>
                <p className="resultado-depo__autor">— {d.nome}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bridge para a oferta ── */}
      <section className="resultado-sec" style={{ background: 'linear-gradient(180deg, rgba(160,24,42,.08) 0%, transparent 80%)', borderTop: '1px solid var(--brasa-line)' }}>
        <div className="wrap">
          <p className="kicker">A solução</p>
          <h2 className="h-sec" style={{ marginBottom: '20px' }}>Por que a Desenrola funciona pro seu perfil:</h2>
          <p style={{ fontSize: '17px', lineHeight: '1.72', color: 'var(--fg-2)', marginBottom: '28px' }}>
            {c.ponte}
          </p>

          {/* O que está incluso */}
          <ul className="resultado-incluso">
            <li><span className="ck">✓</span><span>Você cola a mensagem dela. Em 10 segundos tem 3 respostas calibradas pro momento — no seu tom, no ritmo certo</span></li>
            <li><span className="ck">✓</span><span>Funciona com texto, print da conversa e áudio — a Desenrola lê tudo</span></li>
            <li><span className="ck">✓</span><span>Quanto mais você usa, mais ela aprende o perfil dela — e afina as respostas pro estilo específico dela</span></li>
            <li><span className="ck">✓</span><span>Não parece robô — escreve como você, em português real, sem cantada de internet</span></li>
            <li><span className="ck">✓</span><span>WhatsApp, Instagram, Tinder, Bumble — qualquer plataforma, qualquer momento</span></li>
            <li><span className="ck">✓</span><span>+ 4 bônus: os 7 erros que fazem ela sumir, guia de perfil, do app ao café em 48h, e como ler os 12 sinais dela</span></li>
          </ul>
        </div>
      </section>

      {/* ── Preço + CTA ── */}
      <section className="resultado-sec">
        <div className="wrap">
          <p className="kicker">A oferta</p>

          {/* Âncora de valor */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 'var(--r-card)', padding: '20px', marginBottom: '24px' }}>
            {[
              { label: 'Desenrola (vitalício)', valor: 'R$197' },
              { label: 'Bônus 1 — Os 7 Erros', valor: 'R$47' },
              { label: 'Bônus 2 — Perfil que Atrai', valor: 'R$67' },
              { label: 'Bônus 3 — Do App ao Café', valor: 'R$77' },
              { label: 'Bônus 4 — 12 Sinais Dela', valor: 'R$47' },
            ].map((r) => (
              <div key={r.label} className="value-stack__row" style={{ padding: '8px 0' }}>
                <span style={{ fontSize: '14px', color: 'var(--fg-2)' }}>{r.label}</span>
                <span style={{ fontSize: '14px', color: 'var(--fg-muted)' }}>{r.valor}</span>
              </div>
            ))}
            <div className="value-stack__total">
              <span>Valor total:</span>
              <s>R$435</s>
            </div>
          </div>

          {/* Preço real */}
          <div className="resultado-preco">
            <p className="resultado-preco__label">Tudo isso hoje, por apenas</p>
            <p className="resultado-preco__numero"><small>R$</small><span>29,90</span></p>
            <p className="resultado-preco__unica">uma única vez — acesso vitalício</p>
          </div>

          {/* CTA */}
          <div className="resultado-cta-wrap">
            <a {...checkoutProps} className="cta cta-full cta-block resultado-cta">
              {c.cta_texto} <span className="arw">→</span>
            </a>
            <p className="cta-sub">PIX ou Cartão · acesso em minutos</p>
          </div>

          {/* Trust */}
          <div className="trust-badges">
            <span className="trust-badge">🔒 Pagamento seguro</span>
            <span className="trust-badge">✓ PIX</span>
            <span className="trust-badge">✓ Cartão</span>
          </div>

          {/* Garantia */}
          <div className="guarantee--compact" style={{ marginTop: '4px' }}>
            <div className="seal" style={{ flexShrink: 0 }}>
              <span className="n">7</span>
              <span className="d">dias</span>
            </div>
            <div>
              <p style={{ fontSize: '14px', color: 'var(--fg-2)', margin: 0 }}>
                Teste por <strong>7 dias</strong>. Não valeu? <strong>100% de volta</strong> — sem perguntas, na hora.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="resultado-sec resultado-faq">
        <div className="wrap">
          <p className="kicker">Perguntas frequentes</p>
          <h2 className="h-sec" style={{ marginBottom: '28px' }}>Antes de você perguntar:</h2>
          <div className="faq">
            <details>
              <summary>Vai parecer que não sou eu falando?</summary>
              <p className="fa">Esse é o ponto inteiro da Desenrola. Ela não te dá frase de robô nem cantada pronta de internet. Ela te dá o que VOCÊ diria no seu melhor dia — destravado, no tom certo, na intensidade certa.</p>
            </details>
            <details>
              <summary>É cobrança mensal?</summary>
              <p className="fa">Não. Você paga R$29,90 uma única vez e tem acesso vitalício. Nunca mais paga nada.</p>
            </details>
            <details>
              <summary>Ela vai perceber que usei uma IA?</summary>
              <p className="fa">Não — esse é o motivo da Desenrola existir. Ela foi construída especificamente pra não soar como robô. Escreve como gente de verdade, em português brasileiro real, no seu tom.</p>
            </details>
            <details>
              <summary>Funciona com mulheres que eu já conheço?</summary>
              <p className="fa">Funciona com qualquer conversa — match novo, alguém que você reencontrou, aquela que esfriou, a que você quer reconquistar. Cola a conversa e a Desenrola desenrola.</p>
            </details>
            <details>
              <summary>E se não funcionar pra mim?</summary>
              <p className="fa">Você tem 7 dias pra testar numa conversa real. Não gostou? Devolvo cada centavo — sem pergunta, sem burocracia. O risco é 100% meu.</p>
            </details>
          </div>

          {/* CTA final */}
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <a {...checkoutProps} className="cta cta-full resultado-cta">
              {c.cta_texto} <span className="arw">→</span>
            </a>
            <p className="cta-sub">R$29,90 uma vez · garantia de 7 dias · acesso vitalício</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="foot">
        <div className="wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Desenrola" className="quiz-logo" style={{ margin: '0 auto 10px' }} />
          <p className="fine">Desenrola · inteligência de conversa · uso adulto e individual · © 2026</p>
        </div>
      </footer>
    </>
  );
}

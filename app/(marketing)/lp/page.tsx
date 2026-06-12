/* eslint-disable react/no-unescaped-entities -- copy de marketing tem muitas aspas literais */
import { StickyNav } from '../_components/sticky-nav';
import { HeroDemoMini } from '../_components/hero-demo-mini';
import { BeforeAfterSection } from '../_components/before-after';
import { DemoSection } from '../_components/demo';
import { ComparisonTable } from '../_components/comparison-table';
import { AnimatedCounters } from '../_components/animated-counters';
import { AnimationObserver } from '../_components/animation-observer';
import { PitchSection } from '../_components/pitch-section';
import { MobileBottomBar } from '../_components/mobile-bottom-bar';

export default function LandingPage() {
  return (
    <>
      <AnimationObserver />
      <StickyNav />

      {/* ── 1. Hero ────────────────────────────────────────────── */}
      <header className="hero">
        <div className="wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Desenrola" className="hero-logo" />
          <p className="prehead">Pra todo homem que voltou a ficar solteiro depois dos 35 — e descobriu que o jogo mudou.</p>
          <h1 className="h-hero">Ela mandou mensagem. E você travou de novo.</h1>
          <p className="sub">Cola o que ela mandou. A Desenrola desenrola em segundos: 3 respostas no teu tom, prontas pra mandar.</p>
          <HeroDemoMini />
          <p className="cta-sub" style={{ marginTop: '16px' }}>Sem mensalidade · acesso imediato · garantia 7 dias</p>
        </div>
      </header>

      <div className="divider"></div>

      {/* ── 2. Dores + Antes/Depois ────────────────────────────── */}
      <BeforeAfterSection />

      <div className="divider"></div>

      {/* ── 3. O Mecanismo ─────────────────────────────────────── */}
      <section className="mech" data-animate>
        <div className="wrap">
          <p className="kicker">O mecanismo</p>
          <h2 className="h-sec">A IA que escreve como você — não como robô.</h2>
          <div style={{ marginTop: '24px' }}>
            <p>Não é ChatGPT. Não é curso. Não é coach te mandando "ser mais confiante".</p>
            <p>É uma IA construída pra fazer uma coisa só, e fazer bem: você cola a mensagem que ela te mandou, e em segundos recebe <strong>3 respostas calibradas</strong> — no tom certo, prontas pra mandar.</p>
            <p className="pull"><span className="serif-accent">A Desenrola foi construída pra não parecer IA.</span></p>
            <p>Escreve como brasileiro de verdade — com a gíria na medida, a vírgula onde a fala respira, a malandragem certa. E calibra pro SEU momento: você voltou ao mercado depois de anos, ela ajusta tudo pra você soar como um homem maduro e confiante.</p>
            <div className="method-badge">★ Método Desenrola</div>
          </div>
        </div>
      </section>

      {/* ── 4. Como funciona ───────────────────────────────────── */}
      <section data-animate>
        <div className="wrap-w">
          <div className="wrap" style={{ paddingLeft: '0', paddingRight: '0' }}>
            <p className="kicker">Como funciona</p>
            <h2 className="h-sec">É ridículo de simples — feito pra quem não quer aprender mais um app complicado.</h2>
          </div>
          <div className="steps">
            <div className="step">
              <span className="num">1</span>
              <h3>Cola o que ela mandou.</h3>
              <p>Pode digitar, colar o print da conversa, ou até mandar o áudio que ela te enviou. A Desenrola entende tudo.</p>
            </div>
            <div className="step">
              <span className="num">2</span>
              <h3>Escolhe o tom.</h3>
              <p>Quer ser leve? Provocante? Quer puxar pro encontro? Você decide a temperatura com um toque.</p>
            </div>
            <div className="step">
              <span className="num">3</span>
              <h3>Recebe 3 respostas prontas.</h3>
              <p>Calibradas, no seu tom, prontas pra copiar e mandar. Escolhe a que mais te representa. Em 10 segundos.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ── 5. Olha ela trabalhando ────────────────────────────── */}
      <section data-animate>
        <div className="wrap">
          <p className="kicker">Olha ela trabalhando</p>
          <h2 className="h-sec">Exemplo real do que a Desenrola gera.</h2>
          <div style={{ marginTop: '30px' }}>
            <p><strong>Ela te manda:</strong> <span className="serif-accent" style={{ fontSize: '1.1em' }}>"nossa, hoje foi um dia longo… só quero um banho quente e minha cama 😴"</span></p>
            <p className="dim">O que a maioria dos caras responde (e mata a conversa):<br /><span style={{ color: 'var(--fg-faint)', fontStyle: 'italic' }}>"descansa então! amanhã é outro dia 😊"</span> — morno, genérico, esquecível. Ela nem responde.</p>
            <p style={{ marginTop: '30px' }}><strong>O que a Desenrola te entrega:</strong></p>
          </div>
          <div style={{ marginTop: '22px' }}>
            <div className="resp">
              <span className="tone">Opção 1 · leve</span>
              <p className="msg">"banho quente e cama parece plano de gente sábia. me conta o que acabou com o teu dia assim."</p>
            </div>
            <div className="resp">
              <span className="tone">Opção 2 · provocante</span>
              <p className="msg">"tô quase com inveja dessa cama. ela não faz ideia da sorte que tem."</p>
            </div>
            <div className="resp">
              <span className="tone">Opção 3 · puxando pra frente</span>
              <p className="msg">"guarda essa energia de sexta. semana que vem esse dia longo termina com uma taça de vinho e uma companhia bem melhor que o chuveiro."</p>
            </div>
          </div>
          <div style={{ marginTop: '30px' }}>
            <p>Sentiu a diferença? Nenhuma delas parece robô. Todas soam como um homem que sabe o que tá fazendo. E a Desenrola te mostra quais técnicas ela usou — cada conversa vira uma aula.</p>
          </div>
        </div>
      </section>

      {/* ── 6. Demo completo ───────────────────────────────────── */}
      <DemoSection />

      {/* ── 7. Tabela de comparação ────────────────────────────── */}
      <ComparisonTable />

      <div className="divider"></div>

      {/* ── 8. O que muda + counters animados ─────────────────── */}
      <section data-animate>
        <div className="wrap">
          <p className="kicker">O que muda</p>
          <h2 className="h-sec">O que muda na sua vida a partir de hoje:</h2>
          <AnimatedCounters />
          <ul className="checks">
            <li><span className="ck">✓</span><span>Você abre a conversa dela e sabe exatamente o que mandar — sem travar, sem reler dez vezes</span></li>
            <li><span className="ck">✓</span><span>Você para de matar conversa boa por mandar a resposta morna na hora errada</span></li>
            <li><span className="ck">✓</span><span>Você volta a soar como um homem confiante e atual, não como alguém que sumiu por uma década</span></li>
            <li><span className="ck">✓</span><span>Você aprende as técnicas enquanto usa — destrava de verdade, não fica dependente</span></li>
            <li><span className="ck">✓</span><span>Você para de depender de pedir conselho pro amigo mais novo (que também não sabe direito)</span></li>
            <li><span className="ck">✓</span><span>Você transforma a maturidade que tem numa vantagem, em vez de carregar como peso</span></li>
          </ul>
          <a href="#pitch" className="cta cta-full cta-block" style={{ marginTop: '28px' }} data-cta="">Ver a oferta <span className="arw">→</span></a>
        </div>
      </section>

      <div className="divider"></div>

      {/* ── 9. Prova social alternativa ────────────────────────── */}
      <section data-animate>
        <div className="wrap">
          <p className="kicker">Primeiros resultados</p>
          <h2 className="h-sec">Veja o que a Desenrola gera na prática:</h2>
          <div className="proof-alt">
            <div className="proof-alt__grid">
              <div className="proof-alt__sample">
                <span className="tone">tom · leve e confiante</span>
                <p className="msg">"sumiço intencional. queria ver quanto tempo até você notar."</p>
              </div>
              <div className="proof-alt__sample">
                <span className="tone">tom · provocante</span>
                <p className="msg">"tive uma ideia pra você. mas só conto pessoalmente."</p>
              </div>
              <div className="proof-alt__sample">
                <span className="tone">tom · puxando pra frente</span>
                <p className="msg">"guarda essa energia de sexta. semana que vem esse dia longo termina com uma taça de vinho e uma companhia bem melhor que o chuveiro."</p>
              </div>
            </div>
            <p className="proof-alt__invite">
              Essas respostas foram geradas pela Desenrola. Você pode ser o próximo a usar — e nos contar como foi.
            </p>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ── 10. Antes de você perguntar ────────────────────────── */}
      <section data-animate>
        <div className="wrap">
          <p className="kicker">Antes de você perguntar</p>
          <h2 className="h-sec">Deixa eu adivinhar o que tá passando na sua cabeça:</h2>
          <div className="qa">
            <div>
              <p className="q">"Sou velho demais pra ficar usando appzinho de paquera."</p>
              <p className="a">Foi exatamente pra você que isso foi feito. Os apps gringos são pra moleque de 20 anos. A Desenrola foi calibrada pro homem adulto brasileiro que voltou ao jogo. A sua idade não é o problema — é o seu trunfo, quando você sabe usar.</p>
            </div>
            <div>
              <p className="q">"Não entendo nada de tecnologia."</p>
              <p className="a">Se você sabe mandar mensagem no WhatsApp, você sabe usar a Desenrola. Cola, toca, copia. Acabou.</p>
            </div>
            <div>
              <p className="q">"Vai parecer que não sou eu falando."</p>
              <p className="a">Esse é o ponto inteiro. A Desenrola não te dá frase de robô nem cantada pronta de internet. Ela te dá o que VOCÊ diria no seu melhor dia — destravado, no tom certo.</p>
            </div>
            <div>
              <p className="q">"E se eu não gostar / não funcionar comigo?"</p>
              <p className="a">Você tem 7 dias pra testar numa conversa real. Não gostou? Devolvo cada centavo. Sem pergunta, sem burocracia.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ── 11. Pitch — destino de todos os CTAs ──────────────── */}
      <PitchSection />

      {/* ── 12. Garantia 7 dias ────────────────────────────────── */}
      <section data-animate>
        <div className="wrap">
          <div className="guarantee">
            <div className="guarantee-inner">
              <div className="seal">
                <span className="n">7</span>
                <span className="d">dias</span>
              </div>
              <div>
                <h2 className="h-sub" style={{ marginBottom: '14px' }}>A garantia que tira todo o risco das suas costas.</h2>
                <p style={{ fontSize: '16px' }}>Testa a Desenrola por <strong>7 dias</strong>. Usa numa conversa de verdade. Manda a resposta. Vê acontecer.</p>
                <p style={{ fontSize: '16px' }}>Se em 7 dias você achar que não valeu — por qualquer motivo, ou por nenhum — você me manda uma mensagem e eu devolvo <strong>100% do seu dinheiro</strong>. Na hora. Sem pergunta, sem cara feia.</p>
                <p style={{ fontSize: '16px', marginBottom: '0' }}>O risco é todo meu. Você não tem nada a perder além do silêncio que tá recebendo agora.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 13. FAQ expandido ──────────────────────────────────── */}
      <section data-animate>
        <div className="wrap">
          <p className="kicker">Perguntas frequentes</p>
          <h2 className="h-sec">Perguntas que todo mundo faz antes de entrar:</h2>
          <div className="faq">
            <details>
              <summary>É cobrança mensal?</summary>
              <p className="fa">Não. Você paga R$29,90 uma vez e tem acesso vitalício. Nunca mais paga nada.</p>
            </details>
            <details>
              <summary>Preciso entender de tecnologia?</summary>
              <p className="fa">Não. Se você usa WhatsApp, você usa a Desenrola. É colar, escolher o tom e copiar a resposta.</p>
            </details>
            <details>
              <summary>Ela vai perceber que usei uma IA?</summary>
              <p className="fa">Não — esse é o motivo da Desenrola existir. Ela foi construída especificamente pra não soar como robô. Escreve como gente de verdade, em português brasileiro real.</p>
            </details>
            <details>
              <summary>Funciona com mulheres que eu já conheço, não só match novo?</summary>
              <p className="fa">Funciona com qualquer conversa. Match novo, alguém que você reencontrou, aquela que esfriou. Cola a conversa e a Desenrola desenrola.</p>
            </details>
            <details>
              <summary>Em quanto tempo recebo o acesso?</summary>
              <p className="fa">Na hora. Assim que o pagamento confirma, você já entra e já usa.</p>
            </details>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* ── 14. P.S. / P.P.S. ─────────────────────────────────── */}
      <section>
        <div className="wrap ps">
          <p><b className="lbl">P.S.</b> — Se você chegou até aqui, é porque alguma parte dessa página falou com você. Provavelmente aquela cena lá no começo, da tela em branco. A pergunta é só uma: você vai continuar fechando o app frustrado, ou vai gastar menos que uma pizza pra destravar isso de uma vez?</p>
          <p><b className="lbl">P.P.S.</b> — E lembra: o risco é todo meu. 7 dias, devolução total, sem pergunta. Se não funcionar pra você, não custa nada. Mas se funcionar — e eu construí isso justamente pra funcionar pra quem ficou anos fora — talvez essa seja a melhor nota de R$29,90 que você já gastou. <a href="#pitch" className="inline-cta" data-cta="">Quero voltar pro jogo →</a></p>
        </div>
      </section>

      {/* ── 15. CTA final ─────────────────────────────────────── */}
      <section className="urgency" style={{ borderBottom: 'none' }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <a href="#pitch" className="cta cta-full" data-cta="">Quero voltar pro jogo <span className="arw">→</span></a>
          <p className="cta-sub">R$29,90 uma única vez · acesso vitalício · garantia de 7 dias</p>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="foot">
        <div className="wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Desenrola" className="footer-logo" />
          <p className="fine">Desenrola · inteligência de conversa · uso adulto e individual · © 2026</p>
        </div>
      </footer>

      {/* ── Mobile bottom bar (fixed) ─────────────────────────── */}
      <MobileBottomBar />
    </>
  );
}

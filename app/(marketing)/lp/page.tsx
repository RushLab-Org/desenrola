/* eslint-disable react/no-unescaped-entities -- copy de marketing tem muitas aspas literais; escapar deixaria o texto ilegível pra edição */
import { DemoSection } from '../_components/demo';

// Landing page "Onyx & Brasa" — portada de Sacada-Landing-PV2.html (ADR-035).
// Server Component: todo o conteúdo estático renderiza no servidor (SEO).
// A seção interativa "Testa agora" vive em <DemoSection /> (client component).
export default function LandingPage() {
  return (
    <>
      <div className="hero-brand-fixed"></div>


      <header className="hero">
        <span className="brand">Sacada</span>
        <div className="wrap">
          <p className="prehead">Pra todo homem que voltou a ficar solteiro depois dos 35 — e descobriu que o jogo mudou.</p>
          <h1 className="h-hero">Você ficou fora do mercado por anos. O problema não é isso. O problema é que ninguém te avisou que as regras mudaram completamente.</h1>
          <p className="sub">E enquanto você trava tentando lembrar como se conversa com uma mulher que você acabou de conhecer, caras com metade da sua bagagem estão marcando encontro com ela. Tem uma forma de virar esse jogo. Sem curso de sedução, sem fingir ser quem você não é, sem pagar mico.</p>
          <a href="#checkout" className="cta" data-cta="">Quero virar o jogo <span className="arw">→</span></a>
        </div>
      </header>

      <div className="divider"></div>


      <section className="lead">
        <div className="wrap">
          <p>Deixa eu adivinhar como foi.</p>
          <p>Você baixou o aplicativo de novo. Depois de anos. Talvez tenha sido um amigo que insistiu, talvez tenha sido uma noite de sexta sozinho em casa que pesou mais que as outras.</p>
          <p>Criou o perfil meio sem jeito. Colocou três fotos. Começou a deslizar.</p>
          <p>E aconteceu: deu match.</p>
          <p>Aí veio o frio na barriga que você não sentia há uns dez anos. Abriu a conversa dela. Leu. Releu. Começou a digitar… apagou. Digitou de novo… apagou de novo.</p>
          <p>Ficou ali. Encarando a tela. Sem saber o que mandar pra não parecer babaca, careta, ou desesperado.</p>
          <p>E quando finalmente mandou alguma coisa — provavelmente um "oi, tudo bem?" ou um elogio meio sem graça — ela respondeu seco. Ou simplesmente não respondeu.</p>
          <p>Você fechou o app. Falou pra si mesmo que "não tá afim disso agora". Mentira. Você tá. Só não sabe mais como jogar.</p>
          <p className="pull">E aqui vai a verdade que ninguém te conta: <span className="serif-accent">não é a sua idade. Não é a sua aparência.</span> É que você está jogando um jogo de 2026 com um manual de 2010.</p>
        </div>
      </section>

      <div className="divider"></div>


      <section>
        <div className="wrap">
          <p className="kicker">O terreno mudou</p>
          <h2 className="h-sec">Enquanto você estava construindo uma vida, o terreno inteiro mudou debaixo dos seus pés.</h2>
          <div style={{ marginTop: '30px' }}>
            <p>Quando você saiu do mercado, paquera era olho no olho. Puxar assunto no bar, pedir o número, ligar (ligar!) e marcar.</p>
            <p>Agora é tudo numa caixa de texto. Três linhas no WhatsApp decidem se você é alguém que ela quer conhecer — ou só mais um. E se saírem erradas, formais demais ou óbvias demais, ela já te descartou antes da segunda mensagem.</p>
            <p>O pior é que você nem vê o erro. Só vê o "visualizado". E o silêncio.</p>
            <p>Você, que segura uma reunião e aguenta pressão que moleque de 25 não suportaria. Travado por uma caixa de texto. Não porque você é fraco — mas porque essa é a única coisa que enferrujou enquanto você estava ocupado sendo responsável.</p>
            <p>E cada semana que passa, a ideia que te apavora pesa mais um pouco: a de que a sua época já passou.</p>
            <p className="pull"><span className="serif-accent">Não passou.</span> Você só está sem tradução.</p>
          </div>
        </div>
      </section>

      <div className="divider"></div>


      <section>
        <div className="wrap">
          <p className="kicker">A virada</p>
          <h2 className="h-sec">Para de se culpar. Isso não é sobre ser galã. É sobre saber o que dizer.</h2>
          <div style={{ marginTop: '30px' }}>
            <p>Esquece tudo que te venderam sobre "ser alfa", "ter pegada natural", "nascer com lábia". Isso é conversa de quem quer te vender curso de R$3 mil.</p>
            <p>A real é mais simples e mais brutal: <strong>conversa é uma habilidade. E toda habilidade enferruja quando você fica anos sem usar.</strong></p>
            <p>Você não esqueceu de ser interessante. Você não ficou chato. Você só perdeu a prática de transformar o que você PENSA em algo que soa bem numa tela — rápido, no tom certo, sem parecer que você tá tentando demais.</p>
            <p>Um cara de 25 não é melhor que você nisso. Ele só treinou mais recentemente. Mais nada.</p>
            <p>E adivinha? Prática é a única coisa do mundo que dá pra acelerar com a ferramenta certa.</p>
          </div>
        </div>
      </section>


      <section className="mech">
        <div className="wrap">
          <p className="kicker">O mecanismo</p>
          <h2 className="h-sec">Apresento a Sacada IA: a inteligência que te dá as palavras certas, na hora certa, do jeito que <span className="serif-accent">você</span> falaria — se não estivesse travado.</h2>
          <div style={{ marginTop: '30px' }}>
            <p>Não é ChatGPT. Não é curso. Não é coach te mandando "ser mais confiante".</p>
            <p>É uma IA treinada pra fazer uma coisa só, e fazer bem: você cola a mensagem que ela te mandou, e em segundos recebe <strong>3 respostas calibradas</strong> — no tom certo, na temperatura certa, prontas pra mandar.</p>
            <p>E aqui tá o pulo do gato, o motivo de isso funcionar quando ChatGPT te deixa na mão:</p>
            <p className="pull"><span className="serif-accent">A Sacada foi construída pra não parecer IA.</span></p>
            <p>Sabe quando você usa o ChatGPT pra responder e sai aquela coisa certinha, educada, com ponto final em tudo, que grita "isso foi escrito por robô"? Ela percebe. Toda mulher percebe. E aí já era.</p>
            <p>A Sacada não faz isso. Ela escreve como brasileiro escreve de verdade — com a gíria na medida, a vírgula onde a fala respira, a malandragem certa. Ela espelha o tom dela. E o mais importante pra você: ela calibra pro SEU momento. Você diz que voltou ao mercado depois de anos, e ela ajusta tudo — pra você soar como um homem maduro e confiante, não como um moleque nem como um tiozão perdido.</p>
            <div className="method-badge">★ Método Resposta Certa</div>
            <p style={{ marginTop: '22px' }}>A mensagem certa, no tom certo, na hora exata em que você normalmente travaria. Não é sorte, não é dom. É o que a Sacada faz toda vez que você cola uma conversa.</p>
          </div>
        </div>
      </section>


      <section>
        <div className="wrap-w">
          <div className="wrap" style={{ paddingLeft: '0', paddingRight: '0' }}>
            <p className="kicker">Como funciona</p>
            <h2 className="h-sec">É ridículo de simples — feito pra quem não quer aprender mais um app complicado.</h2>
          </div>
          <div className="steps">
            <div className="step">
              <span className="num">1</span>
              <h3>Cola o que ela mandou.</h3>
              <p>Pode digitar, colar o print da conversa, ou até mandar o áudio que ela te enviou. A Sacada entende.</p>
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
          <div className="wrap" style={{ paddingLeft: '0', paddingRight: '0', marginTop: '34px' }}>
            <p>Acabou o "encarar a tela em branco". Acabou o "mandar e se arrepender". Acabou o vácuo por não saber o que dizer.</p>
          </div>
        </div>
      </section>

      <div className="divider"></div>


      <section>
        <div className="wrap">
          <p className="kicker">Olha ela trabalhando</p>
          <h2 className="h-sec">Exemplo real do que a Sacada gera.</h2>
          <div style={{ marginTop: '30px' }}>
            <p><strong>Ela te manda:</strong> <span className="serif-accent" style={{ fontSize: '1.1em' }}>"nossa, hoje foi um dia longo… só quero um banho quente e minha cama 😴"</span></p>
            <p className="dim">O que a maioria dos caras responde (e mata a conversa):<br /><span style={{ color: 'var(--fg-faint)', fontStyle: 'italic' }}>"descansa então! amanhã é outro dia 😊"</span> — morno, genérico, esquecível. Ela nem responde.</p>
            <p style={{ marginTop: '30px' }}><strong>O que a Sacada te entrega:</strong></p>
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
            <p>Sentiu a diferença? Nenhuma delas parece robô. Nenhuma delas é o "oi sumida" de sempre. Todas soam como um homem que sabe o que tá fazendo.</p>
            <p>E ainda tem mais: a Sacada te mostra QUAIS técnicas ela usou em cada resposta. Você não só manda a mensagem — você aprende. Cada conversa vira uma aula. Em algumas semanas, você nem vai precisar tanto dela. Vai ter destravado de novo.</p>
          </div>
        </div>
      </section>

      <DemoSection />

      <section>
        <div className="wrap">
          <p className="kicker">O que muda</p>
          <h2 className="h-sec">O que muda na sua vida a partir de hoje:</h2>
          <ul className="checks">
            <li><span className="ck">✓</span><span>Você abre a conversa dela e sabe exatamente o que mandar — sem travar, sem reler dez vezes</span></li>
            <li><span className="ck">✓</span><span>Você para de matar conversa boa por mandar a resposta morna na hora errada</span></li>
            <li><span className="ck">✓</span><span>Você volta a soar como um homem confiante e atual, não como alguém que sumiu por uma década</span></li>
            <li><span className="ck">✓</span><span>Você aprende as técnicas enquanto usa — destrava de verdade, não fica dependente</span></li>
            <li><span className="ck">✓</span><span>Você para de depender de pedir conselho pro amigo mais novo (que também não sabe direito)</span></li>
            <li><span className="ck">✓</span><span>Você transforma a maturidade que tem numa vantagem, em vez de carregar como peso</span></li>
          </ul>
        </div>
      </section>

      <div className="divider"></div>


      <section>
        <div className="wrap">
          <p className="kicker">Antes de você perguntar</p>
          <h2 className="h-sec">Deixa eu adivinhar o que tá passando na sua cabeça:</h2>
          <div className="qa">
            <div>
              <p className="q">"Sou velho demais pra ficar usando appzinho de paquera."</p>
              <p className="a">Foi exatamente pra você que isso foi feito. Os apps gringos são pra moleque de 20 anos. A Sacada foi calibrada pro homem adulto brasileiro que voltou ao jogo. A sua idade não é o problema — é o seu trunfo, quando você sabe usar.</p>
            </div>
            <div>
              <p className="q">"Não entendo nada de tecnologia."</p>
              <p className="a">Se você sabe mandar mensagem no WhatsApp, você sabe usar a Sacada. Cola, toca, copia. Acabou.</p>
            </div>
            <div>
              <p className="q">"Vai parecer que não sou eu falando."</p>
              <p className="a">Esse é o ponto inteiro. A Sacada não te dá frase de robô nem cantada pronta de internet. Ela te dá o que VOCÊ diria no seu melhor dia — destravado, no tom certo. As respostas soam como você, porque são calibradas pra soar.</p>
            </div>
            <div>
              <p className="q">"E se eu não gostar / não funcionar comigo?"</p>
              <p className="a">Você tem 7 dias pra testar numa conversa real. Não gostou? Devolvo cada centavo. Sem pergunta, sem burocracia, sem "me explica o motivo". (Mais sobre isso já já.)</p>
            </div>
          </div>
        </div>
      </section>



      <section>
        <div className="wrap">
          <p className="kicker">Quem já voltou pro jogo</p>
          <div className="proof-ph" data-proof-social="">
            <div className="pl">Espaço reservado · prova social</div>
            <div className="pt">depoimentos e prints dos primeiros usuários entram aqui</div>
          </div>
        </div>
      </section>

      <div className="divider"></div>


      <section>
        <div className="wrap">
          <p className="kicker">A oferta</p>
          <h2 className="h-sec">O que você leva hoje:</h2>
          <ul className="offer-list">
            <li><span className="ck">✓</span><span className="ot"><b>Acesso VITALÍCIO à Sacada IA</b> — paga uma vez, é seu pra sempre. Sem mensalidade, sem renovação, sem pegadinha.</span></li>
            <li><span className="ck">✓</span><span className="ot"><b>Respostas ilimitadas, calibradas pro seu perfil</b> — quantas conversas você quiser, quantas vezes precisar.</span></li>
            <li><span className="ck">✓</span><span className="ot"><b>As 12 técnicas de conversa que viram aula</b> — você aprende enquanto usa.</span></li>
            <li><span className="ck">✓</span><span className="ot"><b>Funciona em qualquer lugar</b> — WhatsApp, Instagram, Tinder, Bumble. Cola de qualquer conversa.</span></li>
            <li><span className="ck">✓</span><span className="ot"><b>Entende texto, print e áudio</b> — cola a conversa do jeito que ela vier.</span></li>
          </ul>

          <div className="bonus">
            <p className="gift-kicker">🎁 E mais um presente pra você entrar hoje</p>
            <h3>Bônus: "Os 7 Erros Que Fazem Ela Sumir Depois do Primeiro 'Oi'"</h3>
            <p style={{ margin: '0', color: 'var(--fg-2)', fontSize: '16px' }}>Um guia direto ao ponto com os 7 erros que quase todo homem que voltou ao mercado comete sem perceber — e que fazem a conversa morrer antes mesmo de começar. Não é teoria de coach. São os deslizes reais que transformam um match promissor em mais um "visualizado".</p>
            <p style={{ margin: '18px 0 0', color: 'var(--fg)', fontSize: '15px', fontWeight: '500' }}>Você vai descobrir, entre outros:</p>
            <ul className="blist">
              <li><span className="d">—</span><span>O "oi, tudo bem?" e por que ele te coloca na pilha dos esquecíveis na primeira linha</span></li>
              <li><span className="d">—</span><span>O elogio que parece gentil mas grita carência (quase todo mundo manda)</span></li>
              <li><span className="d">—</span><span>O erro de timing que faz você parecer desesperado mesmo dizendo a coisa certa</span></li>
              <li><span className="d">—</span><span>O que NUNCA mandar nas primeiras 3 mensagens — e o que mandar no lugar</span></li>
            </ul>
            <p style={{ margin: '20px 0 0', color: 'var(--fg-2)', fontSize: '15px' }}>Leitura de 10 minutos que pode salvar as próximas 10 conversas. <strong>Seu de graça junto com o acesso.</strong></p>
          </div>
        </div>
      </section>


      <section>
        <div className="wrap">
          <p className="kicker">Quanto isso vale</p>
          <h2 className="h-sec">Vamos falar de quanto isso vale.</h2>
          <div style={{ marginTop: '30px' }}>
            <p>Um curso de sedução presencial no Brasil custa de R$2.000 a R$3.000. Um fim de semana ouvindo um coach falar, e você volta pra casa com uma apostila e nenhuma conversa real resolvida.</p>
            <p>Os aplicativos gringos que fazem parecido com isso cobram toda santa semana. Em um ano, você paga mais de R$500 — e no dia que parar de pagar, perde tudo.</p>
            <p>A Sacada não é nem curso nem assinatura. É uma ferramenta que cabe no seu bolso, no seu tempo, no seu celular — e resolve a conversa de verdade, na hora que você precisa.</p>
          </div>
        </div>
      </section>


      <section>
        <div className="wrap">
          <div className="price-wrap">
            <p className="kicker" style={{ marginBottom: '14px' }}>Hoje, o acesso vitalício sai por</p>
            <div className="price-old">R$197</div>
            <span className="price-now"><small>R$</small>47</span>
            <p className="price-once">uma única vez.</p>
          </div>
          <div style={{ marginTop: '34px' }}>
            <p>Não é por mês. Não é por semana. É uma vez, e é seu pra sempre.</p>
            <p>Menos que uma pizza com a galera num sábado. Pra destravar a parte da sua vida que você anda fingindo que não importa.</p>
            <p>E por que tão barato? Porque a Sacada acabou de ser lançada. Esse é o preço de fundador — pra quem entra agora, antes de todo mundo. Quando esse lote acabar, o preço sobe e não volta.</p>
          </div>
          <a href="#checkout" className="cta cta-full cta-block" data-cta="" style={{ marginTop: '14px' }}>Quero o preço de fundador <span className="arw">→</span></a>
        </div>
      </section>


      <section>
        <div className="wrap">
          <div className="guarantee">
            <div className="guarantee-inner">
              <div className="seal">
                <span className="n">7</span>
                <span className="d">dias</span>
              </div>
              <div>
                <h2 className="h-sub" style={{ marginBottom: '14px' }}>A garantia que tira todo o risco das suas costas.</h2>
                <p style={{ fontSize: '16px' }}>Testa a Sacada por <strong>7 dias</strong>. Usa numa conversa de verdade. Manda a resposta. Vê acontecer.</p>
                <p style={{ fontSize: '16px' }}>Se em 7 dias você achar que não valeu — por qualquer motivo, ou por nenhum — você me manda uma mensagem e eu devolvo <strong>100% do seu dinheiro</strong>. Na hora. Sem pergunta, sem cara feia, sem "deixa eu te oferecer um desconto".</p>
                <p style={{ fontSize: '16px', marginBottom: '0' }}>O risco é todo meu. Você não tem nada a perder além do silêncio que tá recebendo agora.</p>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="urgency">
        <div className="wrap">
          <p className="kicker" style={{ display: 'inline-block' }}>A janela tá aberta. Por enquanto.</p>
          <h2 className="h-sec">Cada dia que você espera é mais uma conversa que morre.</h2>
          <div style={{ marginTop: '24px' }}>
            <p>Mais um match que esfria. Mais uma noite fechando o app frustrado.</p>
            <p>Você já perdeu tempo demais travado. Hoje isso acaba.</p>
          </div>
          <a href="#checkout" className="cta cta-full cta-block" data-cta="" style={{ marginTop: '18px' }}>Quero voltar pro jogo <span className="arw">→</span></a>
          <p className="cta-sub">Acesso imediato. Pagamento via PIX ou cartão. Garantia de 7 dias.</p>
        </div>
      </section>


      <section>
        <div className="wrap">
          <p className="kicker">Perguntas frequentes</p>
          <h2 className="h-sec">Perguntas que todo mundo faz antes de entrar:</h2>
          <div className="faq">
            <details>
              <summary>É cobrança mensal?</summary>
              <p className="fa">Não. Você paga R$47 uma vez e tem acesso vitalício. Nunca mais paga nada.</p>
            </details>
            <details>
              <summary>Preciso entender de tecnologia?</summary>
              <p className="fa">Não. Se você usa WhatsApp, você usa a Sacada. É colar, escolher o tom e copiar a resposta.</p>
            </details>
            <details>
              <summary>Ela vai perceber que usei uma IA?</summary>
              <p className="fa">Não — esse é o motivo da Sacada existir. Ela foi construída especificamente pra não soar como robô. Escreve como gente de verdade, em português brasileiro real.</p>
            </details>
            <details>
              <summary>Funciona com mulheres que eu já conheço, não só match novo?</summary>
              <p className="fa">Funciona com qualquer conversa. Match novo, alguém que você reencontrou, aquela que esfriou. Cola a conversa e a Sacada calibra.</p>
            </details>
            <details>
              <summary>Em quanto tempo recebo o acesso?</summary>
              <p className="fa">Na hora. Assim que o pagamento confirma, você já entra e já usa.</p>
            </details>
          </div>
        </div>
      </section>

      <div className="divider"></div>


      <section>
        <div className="wrap ps">
          <p><b className="lbl">P.S.</b> — Se você chegou até aqui, é porque alguma parte dessa página falou com você. Provavelmente aquela cena lá no começo, da tela em branco. Você conhece esse silêncio. A pergunta é só uma: você vai continuar fechando o app frustrado, ou vai gastar menos que uma pizza pra destravar isso de uma vez? A janela do preço de fundador não fica aberta pra sempre.</p>
          <p><b className="lbl">P.P.S.</b> — E lembra: o risco é todo meu. 7 dias, devolução total, sem pergunta. Se não funcionar pra você, não custa nada. Mas se funcionar — e eu construí isso justamente pra funcionar pra quem ficou anos fora — talvez essa seja a melhor nota de R$47 que você já gastou. <a href="#checkout" className="inline-cta" data-cta="">Quero voltar pro jogo →</a></p>
        </div>
      </section>


      <section className="urgency" style={{ borderBottom: 'none' }}>
        <div className="wrap" style={{ textAlign: 'center' }}>
          <a href="#checkout" className="cta cta-full" data-cta="">Quero voltar pro jogo <span className="arw">→</span></a>
          <p className="cta-sub">R$47 uma única vez · acesso vitalício · garantia de 7 dias</p>
        </div>
      </section>

      <footer className="foot">
        <div className="wrap">
          <div className="brand">Sacada</div>
          <p className="fine">Inteligência de conversa · uso adulto e individual · © 2026</p>
        </div>
      </footer>
    </>
  );
}

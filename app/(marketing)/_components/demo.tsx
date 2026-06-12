/* eslint-disable react/no-unescaped-entities -- copy de marketing tem aspas literais; escapar deixaria o texto ilegível pra edição */
'use client';

import { useState } from 'react';
import { gerarDemo, type DemoOpcao } from '../actions';

const INTENTS = [
  { label: 'Só responder', value: 'responder_normal', emoji: '💬' },
  { label: 'Esquentar', value: 'esquentar', emoji: '🔥' },
  { label: 'Marcar encontro', value: 'pedir_pra_sair', emoji: '☕' },
  { label: 'Reconquistar', value: 'reconquistar', emoji: '🎯' },
] as const;

type IntentValue = (typeof INTENTS)[number]['value'];
type Status = 'idle' | 'loading' | 'done' | 'limit' | 'error';

export function DemoSection() {
  const [herMessage, setHerMessage] = useState('');
  const [intent, setIntent] = useState<IntentValue>('responder_normal');

  const [status, setStatus] = useState<Status>('idle');
  const [leitura, setLeitura] = useState('');
  const [opcoes, setOpcoes] = useState<DemoOpcao[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  function scrollToPitch(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    document.getElementById('pitch')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleGenerate() {
    if (status === 'loading') return;
    if (!herMessage.trim()) {
      setStatus('error');
      setErrorMsg('Cola a mensagem dela primeiro.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    const res = await gerarDemo({
      her_message: herMessage,
      intensity: 3,
      intent,
    });

    if (res.ok) {
      setLeitura(res.leitura);
      setOpcoes(res.opcoes);
      setStatus('done');
    } else if (res.reason === 'limit') {
      setStatus('limit');
    } else {
      setErrorMsg(res.message);
      setStatus('error');
    }
  }

  const loading = status === 'loading';
  const showResults = status === 'done';
  const showGate = status === 'limit';

  return (
    <section className="demo" id="demo">
      <div className="wrap">
        <p className="kicker">Testa agora</p>
        <h2 className="h-sec">
          Para de ler. Testa agora, com a <span className="serif-accent">tua</span> conversa.
        </h2>
        <div style={{ marginTop: '30px' }}>
          <p>
            Você não precisa acreditar em mim. Pega a última mensagem que ela te mandou — aquela que
            tá te travando agora mesmo, parada no seu WhatsApp — e cola aqui embaixo.
          </p>
          <p>
            Em 8 segundos você vê o Método Resposta Certa trabalhar com a sua situação real. De
            graça. Sem cadastro.
          </p>
        </div>

        <div className="composer">
          {/* mensagem dela */}
          <div className="gen-card">
            <span className="field-label">a mensagem dela</span>
            <textarea
              className="gen-textarea"
              placeholder="cola exatamente o que ela mandou..."
              aria-label="Mensagem que ela te mandou"
              value={herMessage}
              onChange={(e) => setHerMessage(e.target.value)}
            />
            <p className="gen-hint">ou manda o print da conversa / um áudio que ela mandou</p>
            <div className="gen-attach">
              <button type="button" className="ghost-btn" onClick={() => setShowPopup(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>
                anexar print
              </button>
              <button type="button" className="ghost-btn" onClick={() => setShowPopup(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" x2="12" y1="3" y2="15" /></svg>
                enviar áudio
              </button>
              <button type="button" className="ghost-btn" onClick={() => setShowPopup(true)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>
                gravar áudio
              </button>
            </div>
          </div>

          {/* o que você quer fazer (substituiu o slider de intensidade) */}
          <div className="gen-block">
            <span className="field-label">o que você quer fazer?</span>
            <div className="gen-chips">
              {INTENTS.map((it) => (
                <button
                  key={it.value}
                  type="button"
                  className={`chip${intent === it.value ? ' is-active' : ''}`}
                  onClick={() => setIntent(it.value)}
                >
                  {it.emoji} {it.label}
                </button>
              ))}
            </div>
          </div>

          {/* gerar */}
          {!showResults && !showGate && (
            <div className="gen-generate">
              <button
                type="button"
                className="cta cta-full"
                onClick={handleGenerate}
                disabled={loading}
              >
                {loading ? (
                  <span className="btn-spin" aria-hidden="true" />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="btn-icon"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" /></svg>
                )}
                <span className="btn-label">{loading ? 'gerando' : 'gerar 3 opções'}</span>
              </button>
              {status === 'error' && (
                <p className="gen-hint" style={{ color: 'var(--brasa-light)', marginTop: '14px' }}>
                  {errorMsg}
                </p>
              )}
            </div>
          )}

          {/* resultados */}
          {showResults && (
            <div className="demo-results" aria-live="polite">
              <p className="res-label">Suas 3 respostas calibradas</p>
              {leitura && (
                <p className="dim" style={{ marginTop: '-8px', marginBottom: '24px' }}>
                  {leitura}
                </p>
              )}

              {opcoes.map((op, i) => (
                <div className="resp demo-resp-card" key={i}>
                  <span className="tone">{op.tom}</span>
                  <p className="msg">{op.texto}</p>
                </div>
              ))}

              {/* bloco de conversão */}
              <div className="demo-convert">
                <p>
                  <strong>
                    Você acabou de ver o que a Desenrola faz. Isso que você gerou agora, em segundos?
                    É exatamente o que você vai ter pra cada conversa — pra sempre.
                  </strong>
                </p>
                <p>
                  Sem limite. Sem mensalidade. Cola a mensagem dela a qualquer hora e você tem 3
                  respostas calibradas no tom certo, prontas pra mandar.
                </p>
                <p>
                  Tudo isso por{' '}
                  <span className="brasa-text">
                    <strong>R$29,90</strong>
                  </span>{' '}
                  — uma vez, e seu pra sempre.
                </p>
                <a
                  href="#pitch"
                  onClick={scrollToPitch}
                  className="cta cta-full cta-block"
                >
                  Quero isso ilimitado <span className="arw">→</span>
                </a>
                <p className="demo-note">
                  limite de testes grátis por pessoa — pra gerar quantas quiser, é só entrar
                </p>
              </div>
            </div>
          )}

          {/* gate de compra — limite atingido */}
          {showGate && (
            <div className="demo-convert" style={{ marginTop: '0' }}>
              <p>
                <strong>
                  Você já viu o que a Desenrola faz. Viu as respostas aparecerem. Sentiu a diferença.
                </strong>
              </p>
              <p>
                Agora imagina ter isso pra cada conversa que ela te mandar. Todo dia. A qualquer
                hora. Sem nunca mais travar encarando a tela.
              </p>
              <p>
                É exatamente isso que você leva por{' '}
                <span className="brasa-text">
                  <strong>R$29,90</strong>
                </span>{' '}
                — uma única vez. Sem mensalidade. Acesso vitalício.
              </p>
              <a
                href="#pitch"
                onClick={scrollToPitch}
                className="cta cta-full cta-block"
              >
                Quero o acesso completo <span className="arw">→</span>
              </a>
              <p className="demo-note">
                acesso imediato após o pagamento · garantia incondicional de 7 dias
              </p>
            </div>
          )}
        </div>
      </div>

      {/* popup: print/áudio são exclusivos do app */}
      {showPopup && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setShowPopup(false)}
          style={{
            position: 'fixed',
            inset: '0',
            zIndex: '1000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '22px',
            background: 'rgba(0,0,0,.72)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '420px',
              width: '100%',
              background: 'var(--surface)',
              border: '1px solid var(--line-2)',
              borderRadius: 'var(--r-card)',
              padding: '32px 26px',
              textAlign: 'center',
            }}
          >
            <h3 className="h-sub" style={{ marginBottom: '14px' }}>
              Isso é coisa de dentro do app
            </h3>
            <p style={{ marginBottom: '24px' }}>
              Mandar print da conversa ou áudio que ela te mandou é exclusivo de quem já tá dentro.
              No teste grátis você cola o texto — lá dentro, você joga o print ou o áudio e a IA lê
              tudo.
            </p>
            <a
              href="#pitch"
              onClick={(e) => {
                e.preventDefault();
                setShowPopup(false);
                document.getElementById('pitch')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="cta cta-full cta-block"
              style={{ marginBottom: '12px' }}
            >
              Quero o acesso completo <span className="arw">→</span>
            </a>
            <button
              type="button"
              className="ghost-btn"
              onClick={() => setShowPopup(false)}
              style={{ margin: '0 auto' }}
            >
              voltar pro teste
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

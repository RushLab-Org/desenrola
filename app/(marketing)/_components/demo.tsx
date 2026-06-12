/* eslint-disable react/no-unescaped-entities -- copy de marketing tem aspas literais; escapar deixaria o texto ilegível pra edição */
'use client';

import { useState } from 'react';
import { gerarDemo, type DemoOpcao } from '../actions';

// Demo interativo da landing (ADR-035 / ADR-036).
// Liga na IA real via Server Action gerarDemo. Print/áudio mostram popup
// "exclusivo no app". Limite de 2 gerações tratado no servidor.

const LEVELS = ['leve', 'equilibrado', 'quente', 'provocante', 'explícito'] as const;

const INTENTS = [
  { label: 'responder normal', value: 'responder_normal' },
  { label: 'esquentar', value: 'esquentar' },
  { label: 'sair de DR', value: 'sair_de_dr' },
  { label: 'pedir pra sair', value: 'pedir_pra_sair' },
  { label: 'reconquistar', value: 'reconquistar' },
  { label: 'desconversar', value: 'desconversar' },
  { label: 'sexualizar', value: 'sexualizar' },
] as const;

type Status = 'idle' | 'loading' | 'done' | 'error';

export function DemoSection() {
  const [herMessage, setHerMessage] = useState('');
  const [intensityIdx, setIntensityIdx] = useState(1);
  const [intent, setIntent] = useState<string>('responder_normal');
  const [context, setContext] = useState('');

  const [status, setStatus] = useState<Status>('idle');
  const [leitura, setLeitura] = useState('');
  const [opcoes, setOpcoes] = useState<DemoOpcao[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPopup, setShowPopup] = useState(false);

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
      intensity: intensityIdx + 1,
      intent,
      extra_context: context,
    });

    if (res.ok) {
      setLeitura(res.leitura);
      setOpcoes(res.opcoes);
      setStatus('done');
    } else {
      setErrorMsg(res.message);
      setStatus('error');
    }
  }

  const loading = status === 'loading';
  const showResults = status === 'done';

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

          {/* intensidade */}
          <div className="gen-block">
            <div className="gen-intens-head">
              <span className="field-label">intensidade</span>
              <span className="gen-intens-val">{LEVELS[intensityIdx]}</span>
            </div>
            <input
              type="range"
              className="gen-range"
              min={0}
              max={4}
              step={1}
              value={intensityIdx}
              aria-label="intensidade"
              onChange={(e) => setIntensityIdx(Number(e.target.value))}
            />
            <div className="gen-scale">
              {LEVELS.map((lvl, idx) => (
                <span
                  key={lvl}
                  className={idx === intensityIdx ? 'is-on' : undefined}
                  onClick={() => setIntensityIdx(idx)}
                  style={{ cursor: 'pointer' }}
                >
                  {lvl}
                </span>
              ))}
            </div>
          </div>

          {/* intenção */}
          <div className="gen-block">
            <span className="field-label">intenção</span>
            <div className="gen-chips">
              {INTENTS.map((it) => (
                <button
                  key={it.value}
                  type="button"
                  className={intent === it.value ? 'chip is-active' : 'chip'}
                  onClick={() => setIntent(it.value)}
                >
                  {it.label}
                </button>
              ))}
            </div>
          </div>

          {/* contexto extra */}
          <div className="gen-block">
            <span className="field-label">contexto extra (opcional)</span>
            <textarea
              className="gen-context"
              placeholder="algo específico dessa situação que ajuda a calibrar..."
              aria-label="contexto extra"
              value={context}
              onChange={(e) => setContext(e.target.value)}
            />
          </div>

          {/* gerar */}
          {!showResults && (
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
                    Essas respostas que você acabou de ver? Você gerou em segundos, sem pagar nada,
                    sem nem se cadastrar.
                  </strong>
                </p>
                <p>
                  Agora imagina ter isso pra CADA conversa. Toda vez que ela te mandar mensagem.
                  Ilimitado. Pra sempre. Sem nunca mais travar encarando a tela.
                </p>
                <p>
                  É exatamente isso que você leva por{' '}
                  <span className="brasa-text">
                    <strong>R$47</strong>
                  </span>{' '}
                  — uma vez, e seu pra sempre.
                </p>
                <a href="#pitch" onClick={(e) => { e.preventDefault(); document.getElementById('pitch')?.scrollIntoView({ behavior: 'smooth' }); }} className="cta cta-full cta-block">
                  Quero isso ilimitado <span className="arw">→</span>
                </a>
                <p className="demo-note">
                  limite de 2 testes grátis por pessoa — pra gerar quantas quiser, é só entrar
                </p>
              </div>
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
            <a href="#pitch" onClick={(e) => { e.preventDefault(); document.getElementById('pitch')?.scrollIntoView({ behavior: 'smooth' }); }} className="cta cta-full cta-block" style={{ marginBottom: '12px' }}>
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

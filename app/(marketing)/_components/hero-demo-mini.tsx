'use client';

import { useState } from 'react';
import { gerarDemo, type DemoOpcao } from '../actions';

type Status = 'idle' | 'loading' | 'done' | 'limit' | 'error';

export function HeroDemoMini() {
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [opcoes, setOpcoes] = useState<DemoOpcao[]>([]);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message.trim() || status === 'loading') return;
    setStatus('loading');

    const res = await gerarDemo({
      her_message: message,
      intensity: 2,
      intent: 'responder_normal',
    });

    if (res.ok) {
      setOpcoes(res.opcoes);
      setStatus('done');
    } else if (res.reason === 'limit') {
      setStatus('limit');
    } else {
      setErrorMsg(res.message);
      setStatus('error');
    }
  }

  function scrollToPitch(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    document.getElementById('pitch')?.scrollIntoView({ behavior: 'smooth' });
  }

  if (status === 'limit') {
    return (
      <div className="hero-demo-mini__limit">
        <p>Você usou seus 2 testes grátis. Pra gerar quantas quiser:</p>
        <a href="#pitch" onClick={scrollToPitch} className="cta cta-full">
          Quero o acesso ilimitado <span className="arw">→</span>
        </a>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="hero-demo-mini__results">
        {opcoes.map((op, i) => (
          <div key={i} className="resp">
            <span className="tone">{op.tom}</span>
            <p className="msg">{op.texto}</p>
          </div>
        ))}
        <p className="hero-demo-mini__note">
          ↓ quer isso ilimitado pra toda conversa?
        </p>
      </div>
    );
  }

  return (
    <div className="hero-demo-mini">
      <form className="hero-demo-mini__form" onSubmit={handleSubmit}>
        <textarea
          className="hero-demo-mini__input"
          placeholder="cola exatamente o que ela mandou..."
          aria-label="Mensagem que ela te mandou"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          maxLength={5000}
        />
        <button
          type="submit"
          className="cta hero-demo-mini__btn"
          disabled={status === 'loading' || !message.trim()}
        >
          {status === 'loading' ? (
            <span className="btn-spin" aria-hidden="true" />
          ) : null}
          <span>{status === 'loading' ? 'gerando...' : 'Gerar 3 respostas →'}</span>
        </button>
        {status === 'error' && (
          <p className="hero-demo-mini__error">{errorMsg}</p>
        )}
      </form>
    </div>
  );
}

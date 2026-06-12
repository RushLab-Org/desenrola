'use client';

import { useRef, useState } from 'react';
import { gerarDemo, type DemoOpcao } from '../actions';

type Mode = 'texto' | 'print' | 'audio';
type Status = 'idle' | 'loading' | 'done' | 'redirect' | 'error';

export function HeroDemoMini() {
  const [mode, setMode] = useState<Mode>('texto');
  const [message, setMessage] = useState('');
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [opcoes, setOpcoes] = useState<DemoOpcao[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  function switchMode(m: Mode) {
    setMode(m);
    setFileName('');
  }

  function scrollToDemo(e?: React.MouseEvent) {
    e?.preventDefault();
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Print/áudio no hero → redireciona pro sistema completo abaixo
    if (mode !== 'texto') {
      setStatus('redirect');
      setTimeout(() => scrollToDemo(), 500);
      return;
    }

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
      // Limite atingido → redireciona pro demo completo (buy gate aparece lá)
      setStatus('redirect');
      setTimeout(() => scrollToDemo(), 500);
    } else {
      setErrorMsg(res.message);
      setStatus('error');
    }
  }

  // Redireciona pro demo completo (print/áudio ou limite atingido no hero)
  if (status === 'redirect') {
    const isMedia = mode === 'print' || mode === 'audio';
    return (
      <div className="hero-demo-mini__limit">
        <p>
          {isMedia
            ? `Envio de ${mode === 'print' ? 'prints' : 'áudios'} está no sistema completo — testa lá embaixo:`
            : 'Quer ajustar a intensidade ou enviar um print? O sistema completo está logo abaixo:'}
        </p>
        <button type="button" onClick={scrollToDemo} className="cta cta-full">
          Testar o sistema completo <span className="arw">↓</span>
        </button>
      </div>
    );
  }

  // Geração concluída no hero → mostra resultado + convida pro demo completo
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
          ↓ quer ajustar a intensidade ou enviar um print da conversa?
        </p>
        <button
          type="button"
          onClick={scrollToDemo}
          className="ghost-btn"
          style={{ margin: '8px auto 0' }}
        >
          testar o sistema completo
        </button>
      </div>
    );
  }

  const submitLabel =
    status === 'loading'
      ? 'gerando...'
      : mode === 'texto'
      ? 'Gerar 3 respostas →'
      : mode === 'print'
      ? 'Analisar o print →'
      : 'Analisar o áudio →';

  return (
    <div className="hero-demo-mini">
      <div className="hdm-tabs">
        <button
          type="button"
          className={`hdm-tab${mode === 'texto' ? ' hdm-tab--active' : ''}`}
          onClick={() => switchMode('texto')}
        >
          💬 Mensagem
        </button>
        <button
          type="button"
          className={`hdm-tab${mode === 'print' ? ' hdm-tab--active' : ''}`}
          onClick={() => switchMode('print')}
        >
          📸 Print
        </button>
        <button
          type="button"
          className={`hdm-tab${mode === 'audio' ? ' hdm-tab--active' : ''}`}
          onClick={() => switchMode('audio')}
        >
          🎤 Áudio
        </button>
      </div>

      <form className="hero-demo-mini__form" onSubmit={handleSubmit}>
        {mode === 'texto' && (
          <textarea
            className="hero-demo-mini__input"
            placeholder="cola exatamente o que ela mandou..."
            aria-label="Mensagem que ela te mandou"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={5000}
          />
        )}

        {mode === 'print' && (
          <div
            className="hdm-upload"
            role="button"
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
            />
            {fileName ? (
              <p className="hdm-upload__name">📎 {fileName}</p>
            ) : (
              <>
                <p className="hdm-upload__icon">📸</p>
                <p className="hdm-upload__label">Toca aqui para selecionar o print</p>
                <p className="hdm-upload__hint">Stories, conversa, perfil dela</p>
              </>
            )}
          </div>
        )}

        {mode === 'audio' && (
          <div
            className="hdm-upload"
            role="button"
            tabIndex={0}
            onClick={() => fileRef.current?.click()}
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
            />
            {fileName ? (
              <p className="hdm-upload__name">🎵 {fileName}</p>
            ) : (
              <>
                <p className="hdm-upload__icon">🎤</p>
                <p className="hdm-upload__label">Toca aqui para selecionar o áudio</p>
                <p className="hdm-upload__hint">Áudio que ela te mandou no zap</p>
              </>
            )}
          </div>
        )}

        <button
          type="submit"
          className="cta hero-demo-mini__btn"
          disabled={status === 'loading' || (mode === 'texto' && !message.trim())}
        >
          {status === 'loading' ? <span className="btn-spin" aria-hidden="true" /> : null}
          <span>{submitLabel}</span>
        </button>

        {status === 'error' && <p className="hero-demo-mini__error">{errorMsg}</p>}
      </form>
    </div>
  );
}

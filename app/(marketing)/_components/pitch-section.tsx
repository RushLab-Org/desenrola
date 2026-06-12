const CHECKOUT_URL = process.env.NEXT_PUBLIC_PERFECTPAY_URL ?? '#';

const BONUSES = [
  {
    emoji: '📖',
    title: 'Os 7 Erros Que Fazem Ela Sumir Depois do Primeiro \'Oi\'',
    desc: 'Guia de 10 min com os deslizes que matam a conversa antes mesmo de começar.',
    value: 'R$47',
  },
  {
    emoji: '📸',
    title: 'O Perfil que Atrai: Fotos e Bio que Geram Match com Mulher de Qualidade',
    desc: '5 regras de foto + como escrever uma bio que diferencia você dos outros 500 caras.',
    value: 'R$67',
  },
  {
    emoji: '☕',
    title: 'Do App ao Café: Como Sair da Conversa e Marcar o Encontro nas Primeiras 48h',
    desc: 'O roteiro exato de como conduzir a conversa até o primeiro encontro sem parecer ansioso.',
    value: 'R$77',
  },
  {
    emoji: '🎯',
    title: '12 Sinais Que Ela Está Interessada de Verdade (e Quando Agir)',
    desc: 'Como ler os sinais certos e não perder a janela quando ela está aberta.',
    value: 'R$47',
  },
] as const;

const STACK_ROWS = [
  { label: 'Desenrola (vitalício)',     value: 'R$197' },
  { label: 'Bônus 1 — Os 7 Erros',    value: 'R$47'  },
  { label: 'Bônus 2 — O Perfil',       value: 'R$67'  },
  { label: 'Bônus 3 — Do App ao Café', value: 'R$77'  },
  { label: 'Bônus 4 — 12 Sinais',      value: 'R$47'  },
] as const;

export function PitchSection() {
  const checkoutProps =
    CHECKOUT_URL === '#'
      ? { href: '#', 'aria-disabled': 'true' as const }
      : { href: CHECKOUT_URL, target: '_blank' as const, rel: 'noopener noreferrer' };

  return (
    <section id="pitch" className="pitch-section">
      <div className="wrap">
        <p className="kicker">A oferta completa</p>
        <h2 className="h-sec">Tudo que você leva hoje:</h2>

        <div className="pitch-product">
          <p className="pitch-product__label">✦ Produto principal</p>
          <h3 className="pitch-product__name">Desenrola — Acesso Vitalício</h3>
          <p className="pitch-product__desc">
            3 respostas calibradas em segundos. Texto, print e áudio.
            WhatsApp, Instagram, Tinder, Bumble.
          </p>
          <ul className="pitch-product__list">
            <li><span className="ck">✓</span><span>Respostas ilimitadas, calibradas pro seu perfil</span></li>
            <li><span className="ck">✓</span><span>Não parece robô — escreve no seu tom</span></li>
            <li><span className="ck">✓</span><span>Aprende as 12 técnicas enquanto usa</span></li>
          </ul>
          <p className="pitch-product__value">Valor: <s>R$197</s> <strong>Incluso</strong></p>
        </div>

        <p className="pitch-bonus-divider">+ bônus exclusivos</p>

        {BONUSES.map((b, i) => (
          <div key={b.title} className="bonus-item">
            <span className="bonus-item__emoji">{b.emoji}</span>
            <div className="bonus-item__body">
              <p className="bonus-item__tag">Bônus {i + 1}</p>
              <h3 className="bonus-item__title">&ldquo;{b.title}&rdquo;</h3>
              <p className="bonus-item__desc">{b.desc}</p>
              <p className="bonus-item__value">Valor: <strong>{b.value}</strong></p>
            </div>
          </div>
        ))}

        <div className="value-stack">
          {STACK_ROWS.map((r) => (
            <div key={r.label} className="value-stack__row">
              <span>{r.label}</span><span>{r.value}</span>
            </div>
          ))}
          <div className="value-stack__total">
            <span>Valor total:</span>
            <s>R$435</s>
          </div>
        </div>

        <div className="price-reveal">
          <p className="price-reveal__label">Tudo isso hoje, por apenas</p>
          <p className="price-reveal__pre">↓ preço de fundador ↓</p>
          <p className="price-reveal__number"><small>R$</small><span>29,90</span></p>
          <p className="price-reveal__once">uma única vez — acesso vitalício</p>
        </div>

        <a {...checkoutProps} className="cta cta-full cta-block pitch-cta">
          Quero tudo isso por R$29,90 <span className="arw">→</span>
        </a>
        <p className="cta-sub">PIX ou Cartão · acesso em minutos</p>

        <div className="trust-badges">
          <span className="trust-badge">🔒 Pagamento seguro</span>
          <span className="trust-badge">✓ PIX</span>
          <span className="trust-badge">✓ Cartão</span>
        </div>

        <div className="guarantee guarantee--compact">
          <div className="seal">
            <span className="n">7</span>
            <span className="d">dias</span>
          </div>
          <div>
            <p>
              Teste por <strong>7 dias</strong>. Não valeu?{' '}
              <strong>100% de volta</strong> — sem perguntas, na hora.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

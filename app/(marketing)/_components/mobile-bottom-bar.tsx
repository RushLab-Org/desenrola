'use client';

import { useEffect, useState } from 'react';

export function MobileBottomBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollToPitch(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    document.getElementById('pitch')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div
      className={`mobile-bottom-bar${visible ? ' mobile-bottom-bar--visible' : ''}`}
      aria-hidden={!visible}
    >
      <span className="mobile-bottom-bar__price">
        <strong>R$29,90</strong> uma vez
      </span>
      <a href="#pitch" onClick={scrollToPitch} className="cta mobile-bottom-bar__cta">
        Comprar agora <span className="arw">→</span>
      </a>
    </div>
  );
}

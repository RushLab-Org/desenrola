'use client';

import { useEffect, useState } from 'react';

export function StickyNav() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollToPitch(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    document.getElementById('pitch')?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <nav className={`sticky-nav${visible ? ' sticky-nav--visible' : ''}`} aria-hidden={!visible}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-icon.png" alt="Desenrola" className="sticky-nav__logo" />
      <a href="#pitch" onClick={scrollToPitch} className="cta sticky-nav__cta">
        Ver a oferta <span className="arw">→</span>
      </a>
    </nav>
  );
}

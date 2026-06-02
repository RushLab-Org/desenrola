import type { Metadata } from 'next';
import './landing.css';

// Route group público de marketing (ADR-035). Fica fora do gate de assinatura
// do (app)/layout. As fontes (Inter + Cormorant) já vêm do root layout via
// next/font; aqui só importamos o CSS escopado e embrulhamos em .lp-root.
export const metadata: Metadata = {
  title: 'Sacada IA — Volta pro jogo',
  description:
    'Sacada IA — o copiloto de conversas que te dá as palavras certas, na hora certa. Para o homem que voltou ao mercado depois dos 35.',
};

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="lp-root">{children}</div>;
}

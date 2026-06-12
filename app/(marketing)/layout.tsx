import type { Metadata } from 'next';
import './landing.css';

// Route group público de marketing (ADR-035). Fica fora do gate de assinatura
// do (app)/layout. As fontes (Inter + Cormorant) já vêm do root layout via
// next/font; aqui só importamos o CSS escopado e embrulhamos em .lp-root.
export const metadata: Metadata = {
  title: 'Desenrola — Para de Travar. Resposta Certa Pra Ela.',
  description:
    'Cola o que ela mandou. Em segundos você recebe 3 respostas calibradas — no seu tom, sem parecer robô. Para homens de 35+ que voltaram ao jogo. Testa grátis.',
  keywords: [
    'paquera whatsapp',
    'o que responder ela',
    'como responder mensagem mulher',
    'conversa paquera',
    'resposta certa para ela',
    'app paquera homem',
    'IA paquera',
    'desenrola app',
  ],
  openGraph: {
    title: 'Ela mandou mensagem. E você travou de novo.',
    description:
      'Cola o que ela escreveu. Em 10 segundos você tem 3 respostas — no seu tom, sem parecer robô. Testa grátis, sem cadastro.',
    type: 'website',
    locale: 'pt_BR',
    siteName: 'Desenrola',
  },
  twitter: {
    card: 'summary',
    title: 'Desenrola — Resposta Certa Pra Ela, Sem Travar',
    description:
      'IA que gera 3 respostas calibradas a partir da mensagem dela. No seu tom, sem parecer robô. Para homens de 35+.',
  },
};

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <div className="lp-root">{children}</div>;
}

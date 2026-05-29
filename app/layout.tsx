import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// TODO design: metadata final (título canonical, OG image, etc) com humano
export const metadata: Metadata = {
  title: 'Sacada IA',
  description: 'copiloto de comunicação para conversas com mulheres.',
};

// Workaround pra bug de prerender em Next 16 com /_global-error e /_not-found
// (Invariant: Expected workStore to be initialized). Como o app é todo dinâmico
// (depende de auth via cookies em quase tudo), force-dynamic não muda perf real.
// Reavaliar quando Next 16 corrigir o bug.
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}

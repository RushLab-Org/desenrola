import type { Metadata } from 'next';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';

// Onyx & Brasa: Inter no corpo, Cormorant nos títulos (ADR-033).
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500'],
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant',
  weight: ['400', '500', '600'],
});

// TODO design: metadata final (título canonical, OG image, etc) com humano
export const metadata: Metadata = {
  title: 'Sacada IA',
  description: 'copiloto de comunicação para conversas com mulheres.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`dark ${inter.variable} ${cormorant.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster richColors closeButton position="top-center" />
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { QuizInterativo } from './quiz-interativo';

export const metadata: Metadata = {
  title: 'Descubra seu Perfil com Mulheres — Desenrola',
  description:
    '7 perguntas. 2 minutos. Um diagnóstico personalizado sobre por que você trava nas mensagens — e o que fazer sobre isso.',
};

export default function QuizPage() {
  return <QuizInterativo />;
}

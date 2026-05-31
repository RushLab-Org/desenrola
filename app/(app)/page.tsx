import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// TODO design: home pós-login (Marco 3 vai adicionar CTA principal de gerar resposta)
export default async function HomePage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single();

  const onboardingDone = profile?.onboarding_completed ?? false;

  // 1º acesso: manda pro fluxo guiado (ADR-032)
  if (!onboardingDone) redirect('/onboarding');

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-12">
      <header>
        <h1 className="font-serif text-3xl font-medium tracking-tight">tá dentro.</h1>
        <p className="text-muted-foreground mt-2 max-w-prose">
          {onboardingDone
            ? 'IA calibrada. recebeu mensagem dela? gera resposta agora.'
            : 'antes de gerar respostas, calibra a tua voz no perfil.'}
        </p>
      </header>

      {!onboardingDone && (
        <Card>
          <CardHeader>
            <CardTitle>primeira parada: o teu perfil</CardTitle>
            <CardDescription>
              isso ajusta o jeito que as respostas saem pra bater contigo. 2 minutos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/perfil" className={buttonVariants()}>
              calibrar agora
            </Link>
          </CardContent>
        </Card>
      )}

      {onboardingDone && (
        <Card className="border-foreground/30">
          <CardHeader>
            <CardTitle>gerar resposta</CardTitle>
            <CardDescription>
              cola o que ela mandou, escolhe o tom, IA te dá 3 opções calibradas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/gerar" className={buttonVariants()}>
              começar
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>tuas mulheres</CardTitle>
            <CardDescription>cada uma com perfil próprio.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/crushes" className={buttonVariants({ variant: 'outline' })}>
              ver tudo
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>teu perfil</CardTitle>
            <CardDescription>edita quando quiser.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/perfil" className={buttonVariants({ variant: 'outline' })}>
              {onboardingDone ? 'editar' : 'preencher'}
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

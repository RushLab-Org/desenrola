import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { GerarForm } from './gerar-form';

export default async function GerarPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single();

  if (!profile?.onboarding_completed) {
    redirect('/onboarding');
  }

  const { data: crushes } = await supabase
    .from('crushes')
    .select('id, name, relationship_type')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-medium tracking-tight">gerar resposta</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          cola o que ela mandou, escolhe o tom, e a IA te dá 3 opções.
        </p>
      </header>

      {!crushes || crushes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
            <p className="text-base">precisa de pelo menos uma mulher cadastrada.</p>
            <p className="text-muted-foreground text-sm">
              cada uma tem perfil próprio. quanto mais contexto, melhor a IA calibra.
            </p>
            <Link href="/crushes" className={buttonVariants()}>
              ir pras mulheres
            </Link>
          </CardContent>
        </Card>
      ) : (
        <GerarForm crushes={crushes} />
      )}
    </div>
  );
}

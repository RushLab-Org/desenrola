import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { signOut } from './actions';

// TODO design: header/nav visual (definir com humano via Claude Design)
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  // Gate de assinatura (ADR-034): só quem está 'active' usa o app.
  // Conta criada pelo webhook na compra (active) passa; pending/refunded é barrado.
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_status')
    .eq('id', user.id)
    .single();

  if (profile?.subscription_status !== 'active') {
    const status = profile?.subscription_status ?? 'pending';
    const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'apoiosacada@gmail.com';
    const msg =
      status === 'refunded'
        ? 'teu acesso foi encerrado (reembolso).'
        : status === 'pending'
          ? 'teu pagamento ainda não foi confirmado.'
          : 'teu acesso não está ativo.';
    return (
      <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
        <div className="w-full max-w-sm space-y-4">
          <h1 className="font-serif text-2xl font-medium tracking-tight">acesso não ativo</h1>
          <p className="text-muted-foreground text-sm">{msg}</p>
          <p className="text-muted-foreground text-sm">
            qualquer coisa, fala com a gente:{' '}
            <span className="text-foreground">{supportEmail}</span>
          </p>
          <form action={signOut}>
            <Button variant="outline" type="submit">
              sair
            </Button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-serif text-xl font-semibold">
              Desenrola
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/gerar"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                gerar
              </Link>
              <Link
                href="/crushes"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                mulheres
              </Link>
              <Link
                href="/perfil"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                perfil
              </Link>
              <Link
                href="/configuracoes"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                config
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground hidden text-sm sm:inline">
              {user.email}
            </span>
            <form action={signOut}>
              <Button type="submit" variant="ghost" size="sm">
                sair
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}

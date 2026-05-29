import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { signOut } from './actions';

// TODO design: header/nav visual (definir com humano via Claude Design)
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold">
              Sacada IA
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link
                href="/crushes"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                crushes
              </Link>
              <Link
                href="/perfil"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                perfil
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

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';

// Pública (em PUBLIC_PATH_PREFIXES do middleware). Não bloqueia se user
// não tiver sessão ainda — webhook libera acesso em paralelo via magic link.
// TODO design: visual pós-compra (definir com humano via Claude Design)
export default function SucessoPage() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <CheckCircle2 className="size-12" />
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">acesso liberado.</h1>
        <p className="text-muted-foreground max-w-md text-sm">
          mandei um link de acesso pro teu email. clica nele e tu entra direto, sem senha.
        </p>
      </div>
      <div className="text-muted-foreground space-y-1 text-xs">
        <p>se não chegar em 2 minutos, olha o spam.</p>
        <p>qualquer problema, fala com o suporte que a gente resolve.</p>
      </div>
      <Link href="/login" className={buttonVariants({ variant: 'outline' })}>
        já tenho link, ir pro login
      </Link>
    </main>
  );
}

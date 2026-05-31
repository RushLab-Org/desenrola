import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ChevronRight, MessageCircle } from 'lucide-react';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

// Dashboard no padrão Onyx & Brasa (ADR-033): stats + card de gerar + atalhos.
export default async function HomePage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: profile }, genRes, crushRes, winRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('onboarding_completed, age_range, marital_status, primary_goal, improvement_areas')
      .eq('id', user.id)
      .single(),
    supabase
      .from('generations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('crushes')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id),
    supabase
      .from('generations')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('marked_as_win', true),
  ]);

  if (!profile?.onboarding_completed) redirect('/onboarding');

  const genCount = genRes.count ?? 0;
  const crushCount = crushRes.count ?? 0;
  const winCount = winRes.count ?? 0;

  // calibração: 6 sinais simples (perfil preenchido + uso real)
  const sinais = [
    !!profile.age_range,
    !!profile.marital_status,
    !!profile.primary_goal,
    (profile.improvement_areas?.length ?? 0) > 0,
    crushCount > 0,
    genCount > 0,
  ];
  const calibrado = Math.round((sinais.filter(Boolean).length / sinais.length) * 100);

  return (
    <div className="mx-auto w-full max-w-md space-y-6 px-4 py-8">
      <header>
        <h1 className="font-serif text-3xl font-medium tracking-tight">tá dentro.</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          recebeu mensagem dela? a IA tá calibrada.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <Stat value={genCount} label="gerações" />
        <Stat value={crushCount} label="mulheres" />
        <Stat value={winCount} label="vitórias" accent />
      </div>

      <div className="rounded-xl border border-l-2 border-border border-l-primary bg-[#1b1416] p-5 shadow-[0_0_40px_-14px_rgba(160,24,42,0.6)]">
        <div className="flex items-center gap-2">
          <MessageCircle className="text-primary size-5" />
          <span className="font-serif text-lg font-medium">gerar resposta</span>
        </div>
        <p className="text-muted-foreground mt-2 text-sm">
          cola o que ela mandou, escolhe o tom, recebe 3 opções calibradas
        </p>
        <Link
          href="/gerar"
          className="bg-primary text-primary-foreground mt-4 flex h-11 w-full items-center justify-center rounded-full text-sm font-medium shadow-[0_0_20px_-2px_rgba(160,24,42,0.6)] transition-opacity hover:opacity-90"
        >
          começar
        </Link>
      </div>

      <NavCard
        href="/crushes"
        title="tuas mulheres"
        sub={`${crushCount} ${crushCount === 1 ? 'ativa' : 'ativas'}`}
      />
      <NavCard href="/perfil" title="teu perfil" sub={`${calibrado}% calibrado`} />
    </div>
  );
}

function Stat({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
  return (
    <div className="bg-card rounded-xl py-4 text-center ring-1 ring-foreground/10">
      <div className={'font-serif text-2xl font-medium ' + (accent ? 'text-[#c8243c]' : '')}>
        {value}
      </div>
      <div className="text-muted-foreground mt-0.5 text-[9px] font-medium tracking-[0.15em] uppercase">
        {label}
      </div>
    </div>
  );
}

function NavCard({ href, title, sub }: { href: string; title: string; sub: string }) {
  return (
    <Link
      href={href}
      className="bg-card flex items-center justify-between rounded-xl px-5 py-4 ring-1 ring-foreground/10 transition-colors hover:bg-accent"
    >
      <div>
        <div className="font-serif text-base font-medium">{title}</div>
        <div className="text-muted-foreground mt-0.5 text-xs">{sub}</div>
      </div>
      <ChevronRight className="text-muted-foreground size-5" />
    </Link>
  );
}

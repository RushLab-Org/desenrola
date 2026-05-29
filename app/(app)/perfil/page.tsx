import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { PerfilForm } from './perfil-form';

export default async function PerfilPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'age_range, marital_status, time_single, returning_to_market, has_children, improvement_areas, primary_goal, onboarding_completed',
    )
    .eq('id', user.id)
    .single();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">teu perfil</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          isso calibra a IA. quanto mais preciso, melhores as respostas.
        </p>
      </header>

      <PerfilForm
        initial={{
          age_range: profile?.age_range ?? null,
          marital_status: profile?.marital_status ?? null,
          time_single: profile?.time_single ?? null,
          returning_to_market: profile?.returning_to_market ?? false,
          has_children: profile?.has_children ?? false,
          improvement_areas: profile?.improvement_areas ?? [],
          primary_goal: profile?.primary_goal ?? null,
        }}
        onboardingCompleted={profile?.onboarding_completed ?? false}
      />
    </div>
  );
}

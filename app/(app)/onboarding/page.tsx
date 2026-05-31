import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { OnboardingWizard } from './onboarding-wizard';

// 1º acesso pós-compra cai aqui (home redireciona pra cá enquanto onboarding
// não tá completo). Quem já completou é mandado pro app. ADR-032.
export default async function OnboardingPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single();

  if (profile?.onboarding_completed) redirect('/');

  return <OnboardingWizard />;
}

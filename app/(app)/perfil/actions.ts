'use server';

import { revalidatePath } from 'next/cache';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { profileSchema, type ProfileInput } from '@/lib/schemas/profile';

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function updateUserProfile(input: ProfileInput): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'dados inválidos' };
  }

  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from('profiles')
    .update({
      age_range: parsed.data.age_range,
      marital_status: parsed.data.marital_status,
      time_single: parsed.data.time_single,
      returning_to_market: parsed.data.returning_to_market,
      has_children: parsed.data.has_children,
      improvement_areas: parsed.data.improvement_areas,
      primary_goal: parsed.data.primary_goal,
      onboarding_completed: true,
    })
    .eq('id', user.id);

  if (error) {
    return { ok: false, error: 'não consegui salvar. tenta de novo.' };
  }

  revalidatePath('/perfil');
  revalidatePath('/');
  return { ok: true };
}

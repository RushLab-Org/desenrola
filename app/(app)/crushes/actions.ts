'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { crushSchema, type CrushInput } from '@/lib/schemas/crush';

export type ActionResult = { ok: true } | { ok: false; error: string };
export type CreateCrushResult = { ok: true; id: string } | { ok: false; error: string };

export async function createCrush(input: CrushInput): Promise<CreateCrushResult> {
  const parsed = crushSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'dados inválidos' };
  }

  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('crushes')
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      relationship_type: parsed.data.relationship_type,
      age_range: parsed.data.age_range,
      context: parsed.data.context || null,
    })
    .select('id')
    .single();

  if (error || !data) {
    return { ok: false, error: 'não consegui salvar. tenta de novo.' };
  }

  revalidatePath('/crushes');
  return { ok: true, id: data.id };
}

export async function updateCrush(id: string, input: CrushInput): Promise<ActionResult> {
  const parsed = crushSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'dados inválidos' };
  }

  const user = await requireUser();
  const supabase = await createClient();

  // belt + suspenders: RLS já restringe, mas o .eq('user_id') protege contra
  // bug de policy descobrindo só em produção
  const { error } = await supabase
    .from('crushes')
    .update({
      name: parsed.data.name,
      relationship_type: parsed.data.relationship_type,
      age_range: parsed.data.age_range,
      context: parsed.data.context || null,
    })
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { ok: false, error: 'não consegui salvar. tenta de novo.' };
  }

  revalidatePath('/crushes');
  revalidatePath(`/crushes/${id}`);
  return { ok: true };
}

export async function deleteCrush(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from('crushes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return { ok: false, error: 'não consegui excluir. tenta de novo.' };
  }

  revalidatePath('/crushes');
  redirect('/crushes');
}

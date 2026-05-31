'use server';

import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { setPasswordSchema, type SetPasswordInput } from '@/lib/schemas/login';

export type SetPasswordResult = { ok: true } | { ok: false; error: string };

// Define/altera a senha do usuário autenticado (ADR-029).
// Depois disso ele consegue logar por email + senha em vez de magic link.
export async function setPassword(input: SetPasswordInput): Promise<SetPasswordResult> {
  const parsed = setPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'senha inválida' };
  }

  await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { ok: false, error: 'não consegui salvar a senha. tenta de novo.' };
  }

  return { ok: true };
}

'use server';

import { createClient } from '@/lib/supabase/server';
import { loginSchema, type LoginInput } from '@/lib/schemas/login';
import { requireEnv } from '@/lib/env';

export type SignInResult = { ok: true } | { ok: false; error: string };

export async function signInWithEmail(input: LoginInput): Promise<SignInResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'dados inválidos' };
  }

  const supabase = await createClient();
  const appUrl = requireEnv('NEXT_PUBLIC_APP_URL');

  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${appUrl}/auth/callback`,
    },
  });

  if (error) {
    return {
      ok: false,
      error: 'não consegui mandar o link agora. tenta de novo daqui um pouco.',
    };
  }

  return { ok: true };
}

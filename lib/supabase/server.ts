import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { requireEnv } from '@/lib/env';

/**
 * Cliente Supabase pra Server Components, Server Actions e Route Handlers.
 *
 * Lê/escreve cookies da request via `next/headers`. Em Server Components
 * o `setAll` pode falhar (read-only) — o middleware é quem realmente
 * faz refresh da sessão a cada request.
 *
 * Uso:
 *   import { createClient } from '@/lib/supabase/server';
 *   const supabase = await createClient();
 *   const { data: { user } } = await supabase.auth.getUser();
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components não podem escrever cookies.
            // O middleware é responsável pelo refresh da sessão.
          }
        },
      },
    },
  );
}

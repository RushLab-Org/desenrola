import { createBrowserClient } from '@supabase/ssr';
import { requireEnv } from '@/lib/env';

/**
 * Cliente Supabase pra uso em Client Components (browser).
 *
 * Usa a anon key — protegido por RLS. NUNCA importar aqui o service role.
 *
 * Uso:
 *   'use client';
 *   import { createClient } from '@/lib/supabase/client';
 *   const supabase = createClient();
 */
export function createClient() {
  return createBrowserClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  );
}

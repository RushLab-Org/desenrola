import { createClient } from '@supabase/supabase-js';
import { requireEnv } from '@/lib/env';

/**
 * Cliente Supabase com Service Role Key — BYPASSA RLS.
 *
 * USAR APENAS em:
 * - Webhooks (criar user pós-pagamento via admin.createUser)
 * - Operações de backend que precisam acessar dados de qualquer user
 *
 * NUNCA importar em Client Component ou Server Component que recebe
 * input de usuário sem validação rigorosa. Vazamento dessa chave =
 * acesso total ao banco.
 */
export function createAdminClient() {
  return createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}

/**
 * Acesso fail-fast a variáveis de ambiente.
 *
 * Conforme skill `doppler-helper`: variáveis vêm do Doppler em runtime via
 * `doppler run -- <comando>`. Se faltar, parar a execução em vez de seguir
 * com undefined (que causaria erro silencioso depois).
 *
 * Uso:
 *   import { requireEnv } from '@/lib/env';
 *   const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
 */

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variável de ambiente ${name} não está definida. ` +
        `Adicione no Doppler (environment apropriado) e rode novamente com 'doppler run --'.`,
    );
  }
  return value;
}

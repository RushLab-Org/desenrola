import { redirect } from 'next/navigation';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

/**
 * Retorna o user autenticado ou null. Use em Server Components quando o
 * caminho do código aceita visitante anônimo.
 */
export async function getUser(): Promise<User | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Retorna o user autenticado ou redireciona pra /login. Use em Server
 * Components que exigem autenticação.
 *
 * O middleware já redireciona não-autenticados, mas chamar requireUser
 * dentro do componente protege contra config-drift do matcher.
 */
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) redirect('/login');
  return user;
}

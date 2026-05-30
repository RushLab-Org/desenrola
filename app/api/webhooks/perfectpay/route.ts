import { NextResponse, type NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireEnv } from '@/lib/env';
import {
  SALE_STATUS,
  mapPaymentMethod,
  perfectPayWebhookSchema,
} from '@/lib/schemas/perfectpay';

/**
 * Webhook do Perfect Pay (ADR-023 — Marco 5).
 *
 * Recebe POST com payload JSON. Fluxo:
 *   1. Lê body como JSON
 *   2. Valida token (body.token OU body.webhook_owner OU header) contra PERFECTPAY_WEBHOOK_SECRET
 *   3. Parseia com zod (passthrough)
 *   4. Switch por sale_status_enum:
 *      - APPROVED → criar user no Supabase Auth + atualizar profile pra 'active' + enviar magic link
 *      - REFUNDED/CHARGEBACK → marcar profile como 'refunded' (revoga acesso)
 *      - outros → ignora, retorna 200 (Perfect Pay reenvia se 4xx/5xx)
 *
 * Idempotência: usa `transaction_id` (Perfect Pay `code`) pra detectar reentrega.
 * Se já processou aquele code, retorna 200 sem fazer nada.
 *
 * Retorna SEMPRE 200 quando recebe e valida (mesmo se status for ignorado),
 * EXCETO em casos de erro estrutural (token inválido, payload malformado).
 */
export async function POST(request: NextRequest) {
  // 1. Body
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return new NextResponse('invalid json', { status: 400 });
  }

  // 2. Validação do token
  const expectedToken = requireEnv('PERFECTPAY_WEBHOOK_SECRET');
  const headerToken =
    request.headers.get('x-perfectpay-token') ?? request.headers.get('x-webhook-token');

  // Token pode vir no body OU em header (Perfect Pay config-dependent)
  const bodyToken =
    typeof rawBody === 'object' && rawBody !== null
      ? ((rawBody as Record<string, unknown>).token as string | undefined) ??
        ((rawBody as Record<string, unknown>).webhook_owner as string | undefined)
      : undefined;

  const providedToken = headerToken ?? bodyToken;

  if (!providedToken || providedToken !== expectedToken) {
    console.warn('perfectpay webhook: token inválido ou ausente');
    return new NextResponse('unauthorized', { status: 401 });
  }

  // 3. Parse do payload
  const parsed = perfectPayWebhookSchema.safeParse(rawBody);
  if (!parsed.success) {
    console.error('perfectpay webhook: payload inválido', parsed.error.flatten());
    return new NextResponse('invalid payload', { status: 400 });
  }

  const { code, sale_status_enum, customer, payment_method_enum, payment_method_name } =
    parsed.data;
  const supabase = createAdminClient();

  // 4. Idempotência: já processado?
  const { data: existing } = await supabase
    .from('profiles')
    .select('id, subscription_status, transaction_id')
    .eq('transaction_id', code)
    .maybeSingle();

  // 5. Switch por status
  switch (sale_status_enum) {
    case SALE_STATUS.APPROVED: {
      const email = customer.email.toLowerCase().trim();
      const paymentMethod =
        mapPaymentMethod(payment_method_enum) ?? mapPaymentMethod(payment_method_name);

      if (existing?.subscription_status === 'active') {
        // Já ativado antes — retransmissão do webhook. OK.
        return NextResponse.json({ ok: true, idempotent: true });
      }

      // Criar user no Supabase Auth (idempotente: createUser falha se já existe,
      // tratamos esse caso pegando o user existente)
      let userId: string;
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true, // Perfect Pay já confirmou (cara pagou com esse email)
      });

      if (createErr) {
        // user já existe? buscar e usar o existente
        const { data: userList } = await supabase.auth.admin.listUsers();
        const found = userList?.users.find((u) => u.email?.toLowerCase() === email);
        if (!found) {
          console.error('perfectpay webhook: createUser falhou e user não existe', createErr);
          return new NextResponse('user create failed', { status: 500 });
        }
        userId = found.id;
      } else {
        userId = created.user.id;
      }

      // Trigger handle_new_user já criou profile com status 'pending'.
      // Promover pra 'active' + gravar transaction_id.
      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'active',
          subscription_type: 'lifetime',
          purchased_at: new Date().toISOString(),
          transaction_id: code,
          payment_method: paymentMethod,
        })
        .eq('id', userId);

      if (updateErr) {
        console.error('perfectpay webhook: profile update falhou', updateErr);
        return new NextResponse('profile update failed', { status: 500 });
      }

      // Enviar magic link pra esse email
      const appUrl = requireEnv('NEXT_PUBLIC_APP_URL');
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${appUrl}/auth/callback`,
        },
      });

      if (otpErr) {
        // Magic link falhou mas conta JÁ FOI ATIVADA. Log e segue.
        console.error('perfectpay webhook: signInWithOtp falhou (não bloqueante)', otpErr);
      }

      return NextResponse.json({ ok: true, action: 'activated', user_id: userId });
    }

    case SALE_STATUS.REFUNDED:
    case SALE_STATUS.CHARGEBACK: {
      if (!existing) {
        // Refund de transação que nunca foi ativada? Ignora.
        return NextResponse.json({ ok: true, idempotent: true });
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          subscription_status: 'refunded',
          refunded_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('perfectpay webhook: refund update falhou', error);
        return new NextResponse('refund update failed', { status: 500 });
      }

      return NextResponse.json({ ok: true, action: 'refunded', user_id: existing.id });
    }

    case SALE_STATUS.PENDING:
    case SALE_STATUS.REFUSED:
    default: {
      // Status não acionável — ack pra Perfect Pay parar de reenviar
      return NextResponse.json({ ok: true, action: 'ignored', status: sale_status_enum });
    }
  }
}

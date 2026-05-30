import { z } from 'zod';

/**
 * Schema do payload do webhook Perfect Pay.
 *
 * Documentação Perfect Pay usa campos como `sale_status_enum` (numeric),
 * `code` (transaction id), `customer.email`, `payment_method_enum`.
 *
 * Schema usa `.passthrough()` em objetos pra aceitar campos não previstos
 * (Perfect Pay adiciona campos novos sem warning) — só validamos o que
 * EFETIVAMENTE usamos.
 */

// Enum de status da venda. Valores mais comuns (Perfect Pay docs):
//   2  = approved  (pagamento confirmado, liberar acesso)
//   11 = refunded  (estornado, revogar acesso)
//   7  = chargeback (revogar acesso, anti-fraude)
//   1  = pending
//   3  = refused
export const SALE_STATUS = {
  APPROVED: 2,
  PENDING: 1,
  REFUSED: 3,
  CHARGEBACK: 7,
  REFUNDED: 11,
} as const;

export function mapPaymentMethod(value: unknown): 'pix' | 'credit_card' | null {
  // Perfect Pay usa enum numérico OU string descritiva. Aceitamos ambos.
  if (typeof value === 'number') {
    // 1 = Pix, 2 = Boleto, 3 = Cartão (valores típicos)
    if (value === 1) return 'pix';
    if (value === 3) return 'credit_card';
    return null;
  }
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower.includes('pix')) return 'pix';
    if (lower.includes('cart') || lower.includes('credit')) return 'credit_card';
  }
  return null;
}

export const perfectPayWebhookSchema = z
  .object({
    // Token de validação. Perfect Pay envia no body. Validamos contra
    // PERFECTPAY_WEBHOOK_SECRET. Pode vir como `token` ou `webhook_owner`
    // dependendo da config — aceitamos ambos.
    token: z.string().optional(),
    webhook_owner: z.string().optional(),

    // ID único da transação
    code: z.string(),

    // Status numérico da venda
    sale_status_enum: z.number(),
    sale_status_detail: z.string().optional(),

    // Método de pagamento (numérico ou string)
    payment_method_enum: z.union([z.number(), z.string()]).optional(),
    payment_method_name: z.string().optional(),

    // Dados do comprador
    customer: z
      .object({
        email: z.string().email(),
        full_name: z.string().optional(),
      })
      .passthrough(),

    // Produto comprado
    product: z
      .object({
        code: z.string().optional(),
        name: z.string().optional(),
      })
      .passthrough()
      .optional(),
  })
  .passthrough();

export type PerfectPayPayload = z.infer<typeof perfectPayWebhookSchema>;

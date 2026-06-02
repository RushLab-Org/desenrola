'use server';

import { cookies, headers } from 'next/headers';
import { z } from 'zod';
import {
  gerarPorTexto,
  GeracaoBloqueadaError,
  type ProfileForPrompt,
  type CrushForPrompt,
} from '@/lib/gemini';
import { intentOptions } from '@/lib/schemas/geracao';

// ─────────────────────────────────────────────────────────────────
// Demo público da landing (ADR-035 / ADR-036).
// Roda a IA real (lib/gemini.ts) SEM login, com perfil/crush genéricos.
// Limite: 2 gerações por pessoa (cookie) + rate limit por IP (best-effort).
// ─────────────────────────────────────────────────────────────────

const DEMO_LIMIT = 2;
const COOKIE_NAME = 'sacada_demo_usos';

// Validação do input do demo (subset do geracaoInputSchema, sem crush_id —
// no demo não existe crush real; o crush_id não é usado na geração).
const demoInputSchema = z.object({
  her_message: z.string().trim().min(1, 'cola a mensagem dela').max(5000),
  intensity: z.number().int().min(1).max(5),
  intent: z.enum(intentOptions),
  extra_context: z.string().trim().max(2000).optional().default(''),
});

export type DemoOpcao = { texto: string; tom: string };
export type DemoResult =
  | { ok: true; leitura: string; opcoes: DemoOpcao[]; restantes: number }
  | { ok: false; reason: 'limit' | 'blocked' | 'invalid' | 'error'; message: string };

// Perfil genérico: homem 35+ voltando ao mercado (público-alvo do produto).
// Tudo conservador pra não enviesar demais a demo.
const DEMO_PROFILE: ProfileForPrompt = {
  age_range: null,
  marital_status: null,
  time_single: null,
  returning_to_market: true,
  has_children: null,
  improvement_areas: null,
  primary_goal: null,
};

// Crush genérica: paquera recente (cenário mais comum de quem chega pela landing).
const DEMO_CRUSH: CrushForPrompt = {
  name: 'ela',
  relationship_type: 'conversante',
  age_range: null,
  context: null,
};

// Rate limit por IP em memória (best-effort, por instância serverless).
// MVP: aceitável (ADR-036). Pós-MVP: mover pra Upstash/Redis durável.
const ipHits = new Map<string, { count: number; ts: number }>();
const IP_WINDOW_MS = 24 * 60 * 60 * 1000;
const IP_LIMIT = 4; // folga sobre o limite de cookie; corta abuso óbvio

async function getClientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return h.get('x-real-ip') ?? 'desconhecido';
}

function checkIp(ip: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ip);
  if (!entry || now - entry.ts > IP_WINDOW_MS) {
    ipHits.set(ip, { count: 1, ts: now });
    return true;
  }
  if (entry.count >= IP_LIMIT) return false;
  entry.count += 1;
  return true;
}

export async function gerarDemo(raw: {
  her_message: string;
  intensity: number;
  intent: string;
  extra_context?: string;
}): Promise<DemoResult> {
  // 1) valida input
  const parsed = demoInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      reason: 'invalid',
      message: parsed.error.issues[0]?.message ?? 'dados inválidos',
    };
  }

  // 2) limite por cookie (2 gerações por pessoa)
  const jar = await cookies();
  const usos = Number(jar.get(COOKIE_NAME)?.value ?? '0');
  if (usos >= DEMO_LIMIT) {
    return {
      ok: false,
      reason: 'limit',
      message: 'Você já usou seus testes grátis. Pra gerar quantas quiser, é só entrar.',
    };
  }

  // 3) rate limit por IP (best-effort)
  const ip = await getClientIp();
  if (!checkIp(ip)) {
    return {
      ok: false,
      reason: 'limit',
      message: 'Limite de testes atingido. Pra gerar sem limite, é só entrar.',
    };
  }

  // 4) chama a IA real
  try {
    const out = await gerarPorTexto({
      input: {
        crush_id: '00000000-0000-0000-0000-000000000000',
        her_message: parsed.data.her_message,
        intensity: parsed.data.intensity,
        intent: parsed.data.intent,
        extra_context: parsed.data.extra_context,
      },
      profile: DEMO_PROFILE,
      crush: DEMO_CRUSH,
    });

    // 5) consome 1 uso (cookie httpOnly, 30 dias)
    const novosUsos = usos + 1;
    jar.set(COOKIE_NAME, String(novosUsos), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return {
      ok: true,
      leitura: out.leitura,
      opcoes: out.opcoes,
      restantes: DEMO_LIMIT - novosUsos,
    };
  } catch (err) {
    if (err instanceof GeracaoBloqueadaError) {
      return {
        ok: false,
        reason: 'blocked',
        message: 'A IA não conseguiu trabalhar com essa mensagem. Tenta com outra conversa.',
      };
    }
    return {
      ok: false,
      reason: 'error',
      message: 'Deu um problema ao gerar. Tenta de novo em instantes.',
    };
  }
}

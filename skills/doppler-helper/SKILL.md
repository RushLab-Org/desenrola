---
name: doppler-helper
description: Procedimentos práticos pra trabalhar com Doppler no Sacada IA. Use ao adicionar segredo novo, ao rodar comando que depende de variável de ambiente, ao debugar variável faltando ou errada, ao trabalhar com múltiplos environments (`dev` e `prod`), ao configurar GitHub Actions com `DOPPLER_TOKEN_PROD`. Esta skill cobre o "como fazer" repetível — não cobre decisão de qual segredo deve existir (vem do agente.md e dos ADRs).
---

# Skill: doppler-helper

> **Esta skill é viva.** Adicionar procedimentos novos conforme casos específicos aparecerem (rotação de segredo, novo provedor com peculiaridade de autenticação, etc).
>
> **Fonte da verdade da lista de variáveis:** seção "Variáveis previstas" do `agente.md`. Esta skill replica como referência rápida — se houver divergência, agente.md vence.

---

## Princípios invioláveis

Estão no agente.md, mas valem repetir aqui porque são os erros mais comuns:

1. **Nunca criar arquivos `.env`, `credentials.json`, `token.json` no projeto.** Todos os segredos vivem no Doppler. O `.gitignore` já protege contra commit acidental, mas nem criar.
2. **Nunca pedir ao usuário pra colar chave diretamente em arquivo.** Se chave nova é necessária, ela vai pro Doppler (via painel ou CLI), e a aplicação lê de `process.env` em runtime.
3. **Nunca hardcodar segredo no código.** Mesmo em desenvolvimento. Mesmo "só pra testar". Quando segredo necessário não está disponível, **pare a execução** e avise qual variável falta em qual environment.
4. **Sempre prefixar com `doppler run --`** comandos que precisam de segredos. Sem isso, `process.env.X` retorna `undefined` e tudo quebra.

---

## Environments do projeto

No MVP, dois environments configurados (ADR-012):

- **`dev`** — cada dev tem o seu. Aponta pra Supabase do projeto (mesmo banco do prod no MVP, manter ativo manualmente até primeiras vendas). Segredos de dev podem usar mesmos valores do prod nesse MVP simplificado.
- **`prod`** — produção. Segredos reais. Injetado na Vercel via integração Doppler ↔ Vercel.

**Quando separar dev e prod de verdade:** quando primeiras vendas começarem a rodar OU quando upgrade pra Supabase Pro acontecer. Aí cria projeto Supabase separado pra dev. Até lá, dois environments apontando pro mesmo Supabase basta (princípio fundador 5 do agente.md: simplicidade no MVP).

---

## Comandos do dia-a-dia

### Setup inicial (primeira vez na máquina)

```bash
# Instala CLI
brew install dopplerhq/cli/doppler          # macOS
# Windows/Linux: docs.doppler.com/docs/install-cli

# Autentica
doppler login

# Conecta o repositório local ao projeto Doppler
cd /caminho/pro/projeto/sacada-ia
doppler setup
# Seleciona projeto: sacada-ia
# Seleciona config: dev

# Verifica que pegou
doppler configure get
```

### Rodar comandos com segredos injetados

```bash
# Geral
doppler run -- <qualquer comando>

# Casos comuns no projeto
doppler run -- npm run dev
doppler run -- npm run build
doppler run -- npm run lint
doppler run -- npx supabase gen types typescript --project-id <id> > lib/database.types.ts
doppler run -- claude              # Claude Code recebendo os segredos
```

**Por que `--` (dois traços):** separa argumentos do `doppler` dos argumentos do comando seguinte. Sem isso, o Doppler tenta interpretar flags do `npm` como suas.

### Adicionar segredo novo

**Opção A — via painel (recomendado pra valores longos):** `dashboard.doppler.com` → projeto `sacada-ia` → config (`dev` ou `prod`) → "Add Secret" → nome + valor → save.

**Opção B — via CLI (rápido pra valores curtos):**

```bash
# No config atualmente conectado (verifica com `doppler configure get`)
doppler secrets set NOME_DA_VARIAVEL="valor"

# Em config específico
doppler secrets set NOME_DA_VARIAVEL="valor" --config prod
```

**Sempre cadastre em todos os environments aplicáveis.** Variável que falta em `prod` derruba deploy. Variável que falta em `dev` derruba a sessão de desenvolvimento.

### Listar segredos do environment atual

```bash
doppler secrets                    # lista nomes (mascarando valores)
doppler secrets get NOME           # mostra valor de um específico
doppler secrets --only-names       # só os nomes, sem valores
```

### Trocar de environment

```bash
doppler setup --config prod        # muda pra prod
doppler setup --config dev   # volta pra dev
doppler configure get              # confirma qual config está ativo
```

---

## Segredo faltando — protocolo

**Quando segredo necessário não está disponível, pare a execução.**

Padrão recomendado em código (cria como helper em `lib/env.ts`):

```typescript
export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variável de ambiente ${name} não está definida. ` +
      `Adicione no Doppler (environment apropriado) e rode novamente com 'doppler run --'.`
    );
  }
  return value;
}

// Uso
const supabaseUrl = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
const geminiKey = requireEnv('GEMINI_API_KEY');
```

Não tentar contornar com hardcoded, mock, ou valor default. Erro loud é melhor que erro silencioso.

---

## Cenários comuns de debug

### "Mas eu adicionei a variável e ainda não funciona"

Checklist em ordem:

1. **Comando foi prefixado com `doppler run --`?** Sem isso, `process.env.X` não é injetado.
2. **Você está no environment certo?** Roda `doppler configure get`. Se aparecer `dev` mas você queria testar com segredos de `prod`, troca com `doppler setup --config prod`.
3. **A variável existe no environment que você está usando?** Roda `doppler secrets --only-names` e procura.
4. **A variável tem o nome exato?** Supabase é `NEXT_PUBLIC_SUPABASE_URL` (não `SUPABASE_URL` puro — o prefixo `NEXT_PUBLIC_` é necessário pra ela ser exposta ao client). Service role key é `SUPABASE_SERVICE_ROLE_KEY` (sem prefixo `NEXT_PUBLIC_` — NUNCA expor ao client). Diferenças sutis quebram silenciosamente.
5. **Você acabou de adicionar?** Doppler injeta no momento do `run`. Comando que está rodando desde antes não pega valor novo — precisa reiniciar.
6. **Variável `NEXT_PUBLIC_*` mudou e o cache do Next.js tá segurando valor antigo?** Apaga `.next/` e roda de novo.

### "Funcionou em dev mas quebrou em prod"

Quase sempre é variável que existe em `dev` mas não em `prod` (ou vice-versa). Compara:

```bash
doppler secrets --only-names --config dev > /tmp/dev.txt
doppler secrets --only-names --config prod > /tmp/prod.txt
diff /tmp/dev.txt /tmp/prod.txt
```

A `diff` mostra exatamente o que está em um e não no outro.

### "O Claude Code não está vendo segredos quando rodo `claude`"

Roda `doppler run -- claude`, não só `claude`. O Claude Code precisa dos segredos pra ferramentas que ele dispara (queries no Supabase, chamadas à API do Gemini, etc).

### "Webhook da Perfect Pay tá retornando 401"

Quase sempre é o `PERFECTPAY_WEBHOOK_SECRET` divergente. Confere:
1. Valor no painel da Perfect Pay (em "Notificações" ou "Webhooks") bate com o valor no Doppler em `prod`?
2. O endpoint `/api/webhooks/perfectpay` tá lendo a variável certa?
3. A header que a Perfect Pay manda tem o nome exato esperado?

### "Chave do Gemini estourou gasto inesperado"

**Spend limit configurado no Google AI Studio desde dia 1** (princípio fundador do MVP). Se já estourou:
1. Vai no console Google AI Studio
2. Baixa o limit pra zero temporariamente
3. Identifica qual loop bugado gerou o gasto
4. Roda o código corrigido localmente antes de reativar
5. Reativa com limit conservador

Mitigações de código:
- Limite de 200 gerações/dia por usuário (ADR-011) já barra abuso
- Função `requireEnv` faz fail-fast se chave não existir (não fica retentando)
- `safety_settings: BLOCK_NONE` no Gemini não aumenta custo — só permite conteúdo, não loop

---

## CI/CD — `DOPPLER_TOKEN_PROD`

Pra GitHub Actions injetar segredos de `prod` em deploys:

1. No painel Doppler: projeto `sacada-ia` → config `prod` → "Access" → "Service Tokens" → "Generate" (escopo: **read**).
2. Copia o token gerado (formato `dp.st.prod.XXX`).
3. No GitHub: repositório → Settings → Secrets and variables → Actions → "New repository secret" → nome `DOPPLER_TOKEN_PROD` → valor (o token).
4. No workflow (`.github/workflows/deploy.yml` ou similar), o token é usado pra autenticar a CLI:

```yaml
- name: Setup Doppler
  uses: dopplerhq/cli-action@v3

- name: Build
  env:
    DOPPLER_TOKEN: ${{ secrets.DOPPLER_TOKEN_PROD }}
  run: doppler run -- npm run build
```

**Cuidado:** tokens de service são read-only. Nunca usar token de escopo `admin` em CI — só `read` no environment necessário.

**Nota MVP:** se você usar a integração nativa Doppler ↔ Vercel (recomendado, ADR-013), as variáveis vão direto pro deploy da Vercel sem precisar do GitHub Actions injetar nada. `DOPPLER_TOKEN_PROD` só é necessário se você decidir rodar comandos custom de CI (lint, typecheck, testes) que precisam dos segredos.

---

## Rotação de segredo (procedimento)

Quando rotacionar (chave vazou, troca preventiva, ou rotação periódica):

1. Gera valor novo no provedor (Gemini, Supabase, Perfect Pay, etc).
2. **Adiciona o valor novo no Doppler em paralelo ao antigo** — temporariamente, dois segredos. Usa nomes tipo `GEMINI_API_KEY` e `GEMINI_API_KEY_OLD`.
3. Deploy com o novo. Confirma que aplicação está usando o novo.
4. Revoga o antigo no provedor.
5. Remove a variável `_OLD` do Doppler.

Esse esquema evita downtime — em nenhum momento a aplicação fica sem chave válida.

**Quando rotacionar obrigatoriamente:**
- `SUPABASE_SERVICE_ROLE_KEY` exposta acidentalmente em log/commit/screen share → rotacionar em <1h
- Qualquer chave depois de comprometimento suspeito de máquina/conta
- Rotação periódica recomendada: semestral pras chaves mais sensíveis (`SUPABASE_SERVICE_ROLE_KEY`, `PERFECTPAY_WEBHOOK_SECRET`)

---

## Casos específicos do projeto

### Variáveis do Supabase

ADR-004 e ADR-005: Supabase é Postgres + Auth (magic link). Três variáveis distintas:

- **`NEXT_PUBLIC_SUPABASE_URL`** — URL do projeto (`https://xxx.supabase.co`). `NEXT_PUBLIC_*` porque precisa ser acessível no client.
- **`NEXT_PUBLIC_SUPABASE_ANON_KEY`** — chave pública (anon), seguro expor ao client. Junto com RLS, só permite acesso ao que o RLS autoriza.
- **`SUPABASE_SERVICE_ROLE_KEY`** — chave admin (bypassa RLS). **NUNCA EXPOR AO CLIENT.** Usada SÓ no backend (Server Actions, Route Handlers, webhook). Sem prefixo `NEXT_PUBLIC_`.

Helper de criação dos clientes em `lib/supabase/`:

```typescript
// lib/supabase/server.ts (Server Components, Server Actions)
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { requireEnv } from '@/lib/env';

export const createClient = async () => {
  const cookieStore = await cookies();
  return createServerClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    { cookies: { /* ... */ } }
  );
};

// lib/supabase/admin.ts (APENAS pra webhook e operações admin)
import { createClient } from '@supabase/supabase-js';
import { requireEnv } from '@/lib/env';

export const createAdminClient = () =>
  createClient(
    requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    requireEnv('SUPABASE_SERVICE_ROLE_KEY')  // NUNCA importar em Client Component
  );
```

### `GEMINI_API_KEY`

ADR-006: Gemini 2.5 Flash via Google AI Studio. **API key simples, não Service Account.**

Gerar em `aistudio.google.com` → "Get API key" → "Create API key in new project" (ou projeto existente).

**Spend limit OBRIGATÓRIO desde dia 1** no Google AI Studio → "Settings" → "API key" → configurar limite mensal. Valor sugerido pro MVP: USD 50/mês (cobre milhares de gerações; loop bugado para antes de drenar a conta).

Helper em `lib/gemini.ts`:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { requireEnv } from '@/lib/env';

export const genAI = new GoogleGenerativeAI(requireEnv('GEMINI_API_KEY'));
```

A chave NÃO precisa de prefixo `NEXT_PUBLIC_*` — só usada no backend, nunca no client.

### `PERFECTPAY_WEBHOOK_SECRET`

ADR-010: Perfect Pay via redirect. O webhook que confirma pagamento precisa ser autenticado pra não ser falsificado por qualquer um.

1. No painel da Perfect Pay → produto → "Notificações" / "Webhooks" → gerar/copiar o secret
2. Cola no Doppler em `prod` como `PERFECTPAY_WEBHOOK_SECRET`
3. No endpoint `/api/webhooks/perfectpay/route.ts`, valida cada POST:

```typescript
const receivedSecret = request.headers.get('x-perfectpay-secret'); // nome exato do header confirmar na doc
const expectedSecret = requireEnv('PERFECTPAY_WEBHOOK_SECRET');

if (receivedSecret !== expectedSecret) {
  return new Response('Unauthorized', { status: 401 });
}
```

### `NEXT_PUBLIC_APP_URL` e `SUPPORT_WHATSAPP`

- `NEXT_PUBLIC_APP_URL` — URL do app (`https://app.dominio.com` em prod, `http://localhost:3000` em dev). Usado em magic links, redirects, OG images.
- `SUPPORT_WHATSAPP` (ou `SUPPORT_EMAIL`) — canal de suporte exibido no modal de reembolso. Botão "Falar com suporte" abre `https://wa.me/{numero}?text=...` ou `mailto:{email}?subject=...`.

---

## Lista canônica de variáveis

Fonte de verdade: seção "Variáveis previstas" do `agente.md`. Esta lista é referência rápida.

**Necessárias no MVP (ambos os environments):**

- `NEXT_PUBLIC_SUPABASE_URL` (Supabase, ADR-004)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase, ADR-004)
- `SUPABASE_SERVICE_ROLE_KEY` (Supabase admin, ADR-004 — backend only)
- `GEMINI_API_KEY` (Google AI Studio, ADR-006)
- `PERFECTPAY_WEBHOOK_SECRET` (Perfect Pay, ADR-010)
- `NEXT_PUBLIC_APP_URL` (URL do app)
- `SUPPORT_WHATSAPP` ou `SUPPORT_EMAIL` (canal de suporte/reembolso)

**Necessárias só em GitHub Secrets (não no Doppler):**

- `DOPPLER_TOKEN_PROD` (se você decidir rodar CI custom que precisa de segredos)

**Pós-MVP (referência, não criar agora):**

- `RESEND_API_KEY` — quando volume de magic link passar limite do SMTP nativo do Supabase
- `POSTHOG_*` ou `MIXPANEL_*` — quando ativar tracking dentro do app
- `GROK_API_KEY` — quando habilitar tier premium com intensidade 5

---

## Checklist pra cada segredo novo

Antes de aceitar segredo novo como pronto:

- [ ] Adicionado no Doppler em `dev` (com valor de dev/sandbox quando aplicável)
- [ ] Adicionado no Doppler em `prod` (com valor real)
- [ ] Nome exato bate com o que o código espera
- [ ] Prefixo `NEXT_PUBLIC_` apenas se a variável PRECISA ser exposta ao client; senão SEM prefixo (segurança)
- [ ] Restrições adequadas configuradas no provedor (referrer, IP, escopo) quando aplicável
- [ ] Documentado na lista de "Variáveis previstas" do agente.md (se variável nova, não prevista)
- [ ] Código usa `requireEnv(name)` ou padrão equivalente — não tem fallback hardcoded
- [ ] Nunca está em arquivo `.env`, log, ou histórico de comando
- [ ] Se tiver spend limit configurável no provedor (Gemini, Google APIs em geral): limite definido

---

**Versão:** 1.0 (adaptada do doppler-helper do projeto frota-app)
**Última atualização:** maio/2026
**Ativada por:** trabalho com Doppler, segredos, environments, debug de variável de ambiente

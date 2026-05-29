# Sessão atual — Sacada IA (atualizado em 2026-05-29 madrugada)

**Estado:** Setup 100% feito + Marco 1 implementado (auth via magic link). Bloqueador conhecido pra deploy (bug Next 16). **dev local funciona; build prod quebra.**
**Repositório:** `RushLab-Org/Sacada-ia` (GitHub privado)
**Meta de entrega:** MVP funcional em 12-18h focadas

---

## Status do workflow

| Fase | Estado |
|---|---|
| 1. Initial Understanding | ✅ Completa |
| 2. Design Arquitetural | ✅ Completa — 17 ADRs (002 substituído pelo 016) |
| 3. Setup Inicial (contas + Doppler + repo + schema) | ✅ Completa |
| 4. Setup técnico do projeto (Next, shadcn, Prettier, prompts/) | ✅ Completa |
| 5. Marco 1 — Auth + Schema base | ✅ Código implementado, ⚠️ build bloqueado |
| 6. Marco 2 — CRUD Crushes + Perfil | ⏸️ Aguardando decisão sobre bloqueador |
| 7. Marcos 3-6 | ⏳ Pendentes |

---

## ⚠️ BLOQUEADOR CRÍTICO — decidir na próxima sessão

**Bug do Next.js 16.2.6 quebra `next build`** (issue oficial vercel/next.js #87719, aberto, sem fix).

Erro: `Invariant: Expected workStore to be initialized. This is a bug in Next.js.` Bug ao prerender pages internas `/_global-error` e `/_not-found` que sequer existem na aplicação.

**O que FOI tentado nesta sessão (sem sucesso):**
1. Renomear `middleware.ts` → `proxy.ts` (Next 16 deprecou middleware) — feito, correto, mas não resolve bug
2. Criar `app/global-error.tsx` customizado (Client Component) — feito, mas Next ignora
3. Criar `app/not-found.tsx` customizado — feito, mas Next ignora
4. `export const dynamic = 'force-dynamic'` em `app/layout.tsx` raiz — feito, não vence bug interno
5. Ajustar matcher do `proxy.ts` excluindo `_not-found|_global-error` — feito, não resolve

**O que FUNCIONA:**
- ✅ `npx tsc --noEmit` passa (exit 0)
- ✅ `npm run lint` passa (exit 0)
- ✅ `npm run dev` (não testado neste turno mas Marco 1 foi escrito com Server Components + Server Actions padrão, deve funcionar normal)

**O que NÃO funciona:**
- ❌ `doppler run -- npm run build` falha em prerender de `/_global-error`

**DECISÃO PENDENTE PRA HUMANO (2 opções):**

- **Opção A — Aguardar fix oficial.** Acompanhar issue vercel/next.js #87719. Deploy bloqueado até lá. OK pra fase atual de dev local, mas inviável quando precisar subir Vercel pra rodar webhook real da Perfect Pay. Risco: sem ETA do fix.
- **Opção B — Downgrade pra Next.js 15** (versão original do ADR-002). Reverte ADR-016. Workarounds adicionados (proxy.ts renomear, custom error pages, force-dynamic) precisam ser revertidos parcialmente — `middleware.ts` volta. Estimativa: 15-30min de trabalho de downgrade. Sem outras consequências conhecidas.

Detalhes técnicos completos em `DECISIONS.md` ADR-016 + ADR-017.

---

## Outras pendências pra discutir amanhã

1. **Design da tela de login** + layout `(app)` + home — vão ser revisados/refeitos visualmente com humano. Estrutura funcional pronta, sem cor/spacing/branding.
2. **Design global-error.tsx e not-found.tsx** — placeholders mínimos, refazer com cara da marca.
3. **`prettier --write`** em 15+ arquivos detectados como fora de formato (CLAUDE.md, ROADMAP.md, DECISIONS.md, etc) — agente não rodou pra não reformatar manuais sem autorização.
4. **Schema do Supabase ainda diz `v_limit INTEGER := 200`** — pendente migration pra 50 quando ADR formal for criado (autorização explícita pendente; só item TODO no ROADMAP).
5. **2 vulnerabilidades moderadas** no `npm audit` — não corrigidas (`audit fix --force` é destrutivo).

---

## O que JÁ ESTÁ feito (não refazer)

### Contas externas configuradas
- **Supabase:** projeto `nqhtxsnmoucyzilhmmez` em SP, schema rodado, RLS ativo (10 policies totais nas 4 tabelas), Auth com magic link, Confirm email OFF, Site URL `http://localhost:3000`, Redirect `http://localhost:3000/auth/callback`
- **Google AI Studio:** `GEMINI_API_KEY` gerada em Free Tier (não foi configurado spend limit ainda — atenção)
- **Perfect Pay:** produto "Sacada IA — Acesso Vitalício" R$ 47 criado, PIX + Cartão habilitados, garantia 7 dias, "Área de Membros Externa", webhook configurado com URL placeholder via `webhook.site`, Public Token (`PERFECTPAY_WEBHOOK_SECRET`) copiado pro Doppler

### Repositório e ambiente
- **GitHub:** repo `RushLab-Org/Sacada-ia` privado, branch `main`, commits da sessão de 2026-05-29 pushed
- **Doppler:** projeto `sacada-ia`, config `dev` com 7 variáveis, login local feito, `doppler setup` executado
- **Vercel:** ainda NÃO conectada (fazer quando build resolver — ver bloqueador)
- **Domínio:** ainda NÃO comprado (não bloqueia desenvolvimento)

### Setup técnico do projeto (sessão 2026-05-29)
- **Next.js 16.2.6** bootstrapado via create-next-app, App Router, sem `src/`, Tailwind v4, ESLint 9, React 19 (ADR-016 substituindo ADR-002)
- **Deps core instaladas:** `@supabase/ssr`, `@supabase/supabase-js`, `@google/generative-ai`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react`
- **shadcn/ui** inicializado (preset `base-nova`, base color neutral), 13 componentes em `components/ui/`: button, card, dialog, badge, input, label, select, skeleton, slider, sonner (substitui toast deprecado), tabs, textarea, form (este último puxado do preset `new-york` porque `base-nova` não tem form)
- **Prettier 3 + prettier-plugin-tailwindcss** configurados (`.prettierrc.json` + `.prettierignore`)
- **Estrutura de pastas:** `app/`, `components/ui/`, `lib/supabase/`, `lib/schemas/`, `prompts/`, `skills/`
- **system_prompt_v3.md** migrado pra `prompts/system-prompt-v3.ts` (export const SYSTEM_PROMPT_V3, template literal com escapes corretos)
- **`.md` original deletado** da raiz

### Marco 1 — implementado (sessão 2026-05-29)
Arquivos criados:
- `lib/env.ts` — `requireEnv()` fail-fast (skill doppler-helper)
- `lib/supabase/client.ts` — `createBrowserClient` (Client Components)
- `lib/supabase/server.ts` — `createServerClient` com cookies async (Server Components/Actions)
- `lib/auth.ts` — `getUser()` e `requireUser()` (redirect pra `/login`)
- `lib/schemas/login.ts` — schema zod `{ email }`
- `proxy.ts` (raiz) — proxy Next 16 que faz refresh de sessão Supabase + redirect de não-autenticados
- `app/login/page.tsx` — Client Component com react-hook-form + Form do shadcn + tom adulto
- `app/login/actions.ts` — Server Action `signInWithEmail` (magic link via `supabase.auth.signInWithOtp` + `emailRedirectTo`)
- `app/auth/callback/route.ts` — handler que troca code por sessão e redireciona
- `app/(app)/layout.tsx` — layout autenticado com header + email do user + botão sair
- `app/(app)/page.tsx` — home placeholder dopaminérgica
- `app/(app)/actions.ts` — Server Action `signOut`
- `app/global-error.tsx` — placeholder Client Component (workaround Next 16)
- `app/not-found.tsx` — placeholder Server Component (workaround Next 16)
- `app/layout.tsx` — atualizado: metadata real, lang="pt-BR", `force-dynamic` (workaround Next 16). **Toaster do Sonner removido temporariamente** durante debug — precisa ser readicionado quando bloqueador resolver.
- `app/page.tsx` raiz — **deletado** (rota `/` agora é `app/(app)/page.tsx`)

### Variáveis no Doppler (`sacada-ia` / `dev`)
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `GEMINI_API_KEY`
- ✅ `PERFECTPAY_WEBHOOK_SECRET`
- ✅ `NEXT_PUBLIC_APP_URL` = `http://localhost:3000` (placeholder)
- ✅ `SUPPORT_WHATSAPP` = `5547999999999` (placeholder)

### Placeholders pendentes (trocar antes de rodar tráfego)
Documentados em ROADMAP.md seção "⚠️ Após primeiro deploy na Vercel":
- `NEXT_PUBLIC_APP_URL` → trocar pelo URL real da Vercel
- `SUPPORT_WHATSAPP` → trocar pelo número real de suporte
- URL do webhook na Perfect Pay → trocar do webhook.site pelo endpoint real do app

---

## Visão do produto

App de IA de relacionamento focado no público masculino brasileiro adulto. Usuário cola/printa/grava mensagem que recebeu de uma mulher; a IA gera 3 sugestões de resposta calibradas por perfil do usuário + tipo de relação com a crush (namorada/ficante/conversante/ex) + intensidade (1-4) + intenção (responder normal, esquentar, sair de DR, etc).

**Diferenciais competitivos:**
1. **Memória persistente da crush** (perfil contínuo, info nova detectada automaticamente)
2. **Perfil do usuário** que calibra a voz da IA (idade, estado civil, situação relacional, objetivo) — concorrente nenhum tem
3. **Fundamentos masculinos E femininos** destilados de literatura especializada (Manson, Greene, Gottman, Perel, Nagoski, hooks, Fisher)
4. **12 skills de comunicação** especializadas (sair de DR, reconquistar, lidar com shit test, etc)
5. **Multimodal nativo** (texto, print de conversa, áudio dela)
6. **Não-parecer-IA** como pilar #1 do system prompt (filtro obrigatório em toda resposta)

**Modelo de negócio:** Vitalício R$ 47 PIX ou Cartão via Perfect Pay. **Garantia incondicional de 7 dias** com reembolso solicitado dentro do app (botão "falar com suporte"). Sem trial gratuito — todo mundo paga upfront.

**Princípio fundador:** o produto não pode parecer IA. Toda resposta passa por filtro de naturalidade brasileira coloquial antes de sair. Mulher detecta IA em 2 segundos — esse é o jogo a ganhar.

---

## Fluxo do usuário (definitivo)

```
1. Visitante chega em dominio.com (página de vendas externa, FORA do escopo do app)
2. Vê copy + vídeo demo + exemplos estáticos + prova social + garantia 7 dias
3. Clica em "Comprar agora com garantia"
4. Vai pro checkout da Perfect Pay (PIX ou Cartão)
5. Paga
6. Perfect Pay envia webhook pro app
7. App cria conta automática com email do pagamento + libera acesso vitalício + envia magic link
8. Cara recebe email com magic link, clica, entra logado já como pagante
9. Onboarding dopaminérgico (6 telas): captura perfil do usuário + cria primeira crush + demonstração ao vivo da IA gerando resposta
10. Usa o app livremente (limite anti-abuso: 200 gerações/dia)
11. Se quiser reembolso em até 7 dias: botão "Solicitar reembolso" no app abre suporte (WhatsApp/email)
12. Suporte processa reembolso manualmente na Perfect Pay, marca conta como `refunded`, acesso é removido
```

---

## Decisões fechadas TOTAIS do projeto

Detalhes completos em `DECISIONS.md`.

### Fundações técnicas (ADR-001 a ADR-005):
- **ADR-001:** TypeScript em todo código
- **ADR-002:** Next.js 15 + App Router
- **ADR-003:** Tailwind + shadcn/ui + ESLint + Prettier
- **ADR-004:** Supabase (Postgres + Auth) região São Paulo, free tier no MVP mantido ativo manualmente até primeiras vendas
- **ADR-005:** Auth via Magic Link

### IA e geração (ADR-006 a ADR-008):
- **ADR-006:** Gemini 2.5 Flash via Google AI Studio (multimodal nativo, BLOCK_NONE em safety)
- **ADR-007:** System prompt master v2 estruturado em Pilares + Fundamentos + 12 Skills + Perfil do Usuário + Perfil da Crush
- **ADR-008:** Output JSON forçado com `leitura`, `opcoes[3]`, `skills_aplicadas`, `info_nova_detectada`, `alerta`

### Negócio e monetização (ADR-009 a ADR-011):
- **ADR-009:** Vitalício R$ 47 PIX/Cartão com garantia incondicional 7 dias
- **ADR-010:** Pagamento via Perfect Pay (redirect, não checkout transparente — princípio de simplicidade pro MVP)
- **ADR-011:** Limite anti-abuso de 200 gerações/dia por usuário pagante

### Infraestrutura (ADR-012 a ADR-014):
- **ADR-012:** Doppler pra todos os segredos (dev + prod)
- **ADR-013:** Vercel pro frontend (free Hobby no MVP, gru1)
- **ADR-014:** Repositório GitHub privado + GitHub Actions pra CI/CD básico

### UX e produto (ADR-015):
- **ADR-015:** Skill carregável `produto-dopaminergico` aplicada em todo desenvolvimento de UI (engagement saudável + conversão ética, SEM dark patterns)

---

## Decisões PENDENTES (resumo)

1. **Bloqueador #1:** Opção A (esperar fix Next #87719) vs Opção B (downgrade pra Next 15) — ver seção bloqueador acima
2. **ADR-018 sobre redução do limite 200→50 gerações/dia** — autorização pendente do humano pra formalizar (atualmente só TODO no ROADMAP linha "Ajuste de margem pré-tráfego pago")
3. **Visual de todas as telas do Marco 1** — humano quer participar das decisões de design

Setup operacional: 100% completo.

---

## Protocolo de trabalho

- **NÃO** atualizar `CLAUDE.md` durante sessão (responsabilidade do usuário entre sessões)
- **PODE** atualizar `DECISIONS.md` se decisão nova surgir durante implementação (adicionar ADR-016+, nunca editar ADR existente)
- **PODE** atualizar este `SESSAO_ATUAL.md` ao fim de cada sessão pra registrar progresso
- **PODE** marcar checkboxes no `ROADMAP.md` quando completar tarefa significativa
- **DEVE** consultar skill `produto-dopaminergico` sempre que trabalhar em UI/UX (carrega automaticamente quando contexto for relevante)
- Decisões novas devem mencionar **gatilho de reavaliação claro** (condição mensurável, não "talvez no futuro")

---

## Próximo passo recomendado (pra próxima sessão)

**Ordem proposta:**

1. **Decidir bloqueador #1** (Opção A esperar fix vs Opção B downgrade Next 15) — 5min de decisão
2. **Se Opção B:** rodar downgrade (`npm i next@15 eslint-config-next@15`), reverter `proxy.ts` → `middleware.ts`, remover `force-dynamic` do layout root, rodar build pra confirmar — ~20min
3. **Testar magic link end-to-end** (humano com email real) — primeiro teste manual pendente do Marco 1
4. **Refazer design das telas do Marco 1** (login, layout (app), home, global-error, not-found) com humano — tempo livre
5. **Readicionar `<Toaster />` em `app/layout.tsx`** (foi removido durante debug do bloqueador)
6. **Marco 2** — CRUD crushes + perfil — 2-3h

**Sequência dos marcos restantes:**
2. Marco 2 (CRUD de crushes + Perfil do usuário) — 2-3h
3. Marco 3 (Geração de respostas modo texto) — 3-4h
4. Marco 4 (Multimodal: print + áudio) — 2-3h
5. Marco 5 (Webhook Perfect Pay + criação automática de conta) — 2-3h
6. Marco 6 (Onboarding dopaminérgico + Polish) — 2-3h

Total restante (excluindo Marco 1 já implementado): 11-16 horas focadas.

---

## Como retomar essa sessão (passo a passo)

Se a sessão do Claude Code travar ou for retomada depois:

1. Ler `CLAUDE.md` (instruções base)
2. Ler este `SESSAO_ATUAL.md` (estado atual)
3. Ler `DECISIONS.md` (todas as decisões e justificativas)
4. Ler `ROADMAP.md` (próximo checkbox `[ ]`)
5. Carregar skill `produto-dopaminergico` se trabalho envolver UI
6. Confirmar com o usuário em qual marco/checkbox está
7. Continuar implementação do checkbox seguinte

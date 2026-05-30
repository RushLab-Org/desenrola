# Sessão atual — Sacada IA (atualizado em 2026-05-29 tarde)

**Estado:** Setup 100% + Marco 1 implementado + downgrade pra Next 15 + React 18 (Opção B + C). **Build verde. Pronto pra Marco 2.**
**Repositório:** `RushLab-Org/Sacada-ia` (GitHub privado)
**Meta de entrega:** MVP funcional em 12-18h focadas

---

## Status do workflow

| Fase | Estado |
|---|---|
| 1. Initial Understanding | ✅ Completa |
| 2. Design Arquitetural | ✅ Completa — 19 ADRs (002→016→018 evolução; 017 obsoleta) |
| 3. Setup Inicial (contas + Doppler + repo + schema) | ✅ Completa |
| 4. Setup técnico (Next 15 + React 18 + shadcn + Prettier + prompts/) | ✅ Completa |
| 5. Marco 1 — Auth + Schema base | ✅ Implementado + build verde |
| 6. Marco 2 — CRUD Crushes + Perfil | ✅ Implementado + build verde |
| 7. Marco 3 — Geração de respostas (texto) | ✅ Implementado + build verde |
| 8. Marco 4 — Multimodal (print + áudio) | ✅ Implementado + build verde |
| 9. Marco 5 — Webhook Perfect Pay | ✅ Código implementado + build verde (validação end-to-end pendente deploy) |
| 10. Few-shot dinâmico por user (opção A, Task #35) | 🚀 Próximo |
| 11. Deploy Vercel + ativar webhook real | 🚀 Próximo (humano executa parte) |
| 12. Marco 6 — Onboarding + Polish | ⏳ Pendente |

---

## ⚠️ Atenção operacional — Working directory case-sensitive (ADR-019)

**Sempre navegar pra `D:\Claude Code\sacada-ia` (lowercase no último segmento) antes de rodar `npm run build`.**

Windows é case-insensitive mas Next/Webpack resolve módulos parcialmente via working dir e parcialmente via real FS path. Se working dir for `D:\Claude Code\Sacada-ia` (mixed case), bundle carrega 2 árvores React → `useContext null` em prerender de `/404`. Detalhes em ADR-019.

```powershell
# Conferir antes de build:
(Get-Item .).FullName
# Deve mostrar: D:\Claude Code\sacada-ia
```

## ⚠️ Convenção de build (sessão 2026-05-29)

**Não rodar `doppler run -- npm run build`.** Doppler intercepta stdio do PS de forma que warnings do Next viram ErrorRecord. Pra build:
- `npm run dev` com Doppler: OK (dev funciona normal)
- `npm run build`: injetar env vars manualmente via `doppler secrets get`, depois rodar `npm run build` puro

---

## Bloqueadores anteriores RESOLVIDOS nesta sessão

- ~~Bug Next 16.2.6 prerender `/_global-error`~~ → resolvido por ADR-018 (downgrade Next 15)
- ~~Erro `useContext null` em Next 15 + React 19~~ → resolvido pelo ADR-019 (path lowercase) — descobrimos durante o downgrade que o real causador era casing, não a versão do React. React 18 foi mantido por estabilidade adicional.
- ~~ESLint 9 incompatível com eslint-config-next 15~~ → resolvido downgrading pra ESLint 8 + `.eslintrc.json` legacy

---

## Pendências pra próximas sessões

1. **Teste manual end-to-end do magic link** — primeiro passo da próxima sessão. Cara digita email, recebe link, clica, entra logado.
2. **Design das 5 telas do Marco 1** (login, layout `(app)`, home, global-error, not-found) — humano participa.
3. **`prettier --write`** em 15+ arquivos com formatação desalinhada (CLAUDE.md, ROADMAP.md, etc).
4. **Schema do Supabase ainda diz `v_limit INTEGER := 200`** — migration pra 50 quando ADR for criado (autorização explícita pendente).
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
- **Next.js 15.5.18** (downgrade do 16.2.6 — ADR-018), App Router, sem `src/`, Tailwind v4
- **React 18.3.1** + react-dom 18.3.1 (downgrade do React 19 — ADR-018)
- **ESLint 8.x** + `.eslintrc.json` legacy config + extends `next/core-web-vitals` e `next/typescript`
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
- `middleware.ts` (raiz) — refresh de sessão Supabase + redirect de não-autenticados
- `app/login/page.tsx` — Client Component com react-hook-form + Form do shadcn + tom adulto
- `app/login/actions.ts` — Server Action `signInWithEmail` (magic link via `supabase.auth.signInWithOtp` + `emailRedirectTo`)
- `app/auth/callback/route.ts` — handler que troca code por sessão e redireciona
- `app/(app)/layout.tsx` — layout autenticado com header + email do user + botão sair
- `app/(app)/page.tsx` — home placeholder dopaminérgica
- `app/(app)/actions.ts` — Server Action `signOut`
- `app/global-error.tsx` — placeholder custom (boa prática mantida)
- `app/not-found.tsx` — placeholder custom (boa prática mantida)
- `app/layout.tsx` — metadata, lang="pt-BR", `<Toaster />` do Sonner ativo
- `app/page.tsx` raiz — **deletado** (rota `/` agora é `app/(app)/page.tsx`)

**Validação:**
- ✅ `npx tsc --noEmit` exit 0
- ✅ `npm run lint` exit 0
- ✅ `npm run build` exit 0 (do path lowercase, sem doppler) — 4 routes geradas (`/`, `/_not-found`, `/auth/callback`, `/login`), middleware 90.2 kB
- ⏳ Teste manual end-to-end pendente (humano)

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

1. **ADR sobre redução do limite 200→50 gerações/dia** — autorização pendente do humano pra formalizar (atualmente só TODO no ROADMAP linha "Ajuste de margem pré-tráfego pago")
2. **Visual de todas as telas dos Marcos 1, 2 e 3** — humano quer participar via Claude Design
3. **Migration SQL pra ADR-020 (intensidade 1-5)** — humano precisa rodar no Supabase SQL Editor:
   ```sql
   ALTER TABLE public.generations DROP CONSTRAINT generations_intensity_check;
   ALTER TABLE public.generations ADD CONSTRAINT generations_intensity_check
     CHECK (intensity BETWEEN 1 AND 5);
   ```
   Sem isso, gerações com intensidade 5 vão FALHAR no INSERT.

4. **Migration SQL pra ADR-021 (age_range na crush)** — humano precisa rodar no Supabase SQL Editor:
   ```sql
   ALTER TABLE public.crushes
     ADD COLUMN age_range TEXT
     CHECK (age_range IN ('18-24', '25-30', '31-38', '39-45', '46-55', '55+') OR age_range IS NULL);
   ```
   Sem isso, criar/editar crush com idade vai falhar no INSERT/UPDATE.

5. **Migration SQL pra ADR-022 (Marco 4 multimodal)** — humano precisa rodar no Supabase SQL Editor:
   ```sql
   ALTER TABLE public.generations
     ADD COLUMN her_message_structured JSONB;
   ```
   Sem isso, gerações modo print/áudio vão falhar no INSERT.

6. **ADR-023 (Marco 5) — sem migration nova, MAS:**
   - Adicionar `NEXT_PUBLIC_SUPPORT_WHATSAPP` no Doppler (botão de reembolso usa). Atualmente fallback hardcoded `5547999999999` no `reembolso-button.tsx`.
   - Após deploy Vercel: atualizar URL do webhook na Perfect Pay pra `https://<vercel-url>/api/webhooks/perfectpay` (hoje está em `webhook.site` placeholder).
   - Adicionar URL de produção em Supabase Auth → Redirect URLs (`https://<vercel-url>/auth/callback`).

Setup operacional: 100% completo. Build verde.

---

## Protocolo de trabalho

- **NÃO** atualizar `CLAUDE.md` durante sessão (responsabilidade do usuário entre sessões)
- **PODE** atualizar `DECISIONS.md` se decisão nova surgir durante implementação (adicionar ADR-016+, nunca editar ADR existente)
- **PODE** atualizar este `SESSAO_ATUAL.md` ao fim de cada sessão pra registrar progresso
- **PODE** marcar checkboxes no `ROADMAP.md` quando completar tarefa significativa
- **DEVE** consultar skill `produto-dopaminergico` sempre que trabalhar em UI/UX (carrega automaticamente quando contexto for relevante)
- Decisões novas devem mencionar **gatilho de reavaliação claro** (condição mensurável, não "talvez no futuro")

---

## Próximo passo recomendado

1. **Teste manual end-to-end do Marco 3** (humano):
   - Acessar `/gerar`, escolher crush, colar mensagem dela, escolher intensidade/intenção, gerar
   - Confirmar que 3 opções aparecem com tom diferente cada
   - Testar "copiar" em uma opção
   - Se aparecer info nova detectada, testar "salvar no perfil dela"
   - Testar "essa funcionou?"
2. **Design das telas dos Marcos 1, 2 e 3** com humano via Claude Design
3. **Marco 4** — Multimodal (print + áudio) — 2-3h

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

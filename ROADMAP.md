# Roadmap — Sacada IA

> **Natureza deste arquivo:** mapa do trabalho. Lista o que falta fazer e o que já foi feito (checkbox). Atualizado conforme o projeto avança.
>
> **Convenção:** `[ ]` = não iniciado; `[~]` = em andamento; `[x]` = concluído. Marcação é ato consciente.
>
> **Ordem:** os 6 marcos têm **ordem rígida** — marco N só começa quando N-1 estiver concluído.
>
> **Meta de tempo:** MVP completo em 13-19 horas focadas no Claude Code.

---

## Setup inicial (pré-requisito dos marcos)

### Contas externas
- [x] Criar projeto Supabase em **região São Paulo** (ID: `nqhtxsnmoucyzilhmmez`)
- [x] Habilitar Supabase Auth com **magic link** (SMTP nativo OK no MVP)
- [x] Copiar credenciais pro Doppler: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [x] Criar conta Google AI Studio, gerar API key (Free Tier por enquanto, sem spend limit configurado — atenção)
- [x] Copiar `GEMINI_API_KEY` pro Doppler
- [x] Criar conta Perfect Pay
- [x] Criar produto "Sacada IA — Acesso Vitalício" R$ 47 com PIX + Cartão habilitados, garantia 7 dias, "Área de Membros Externa"
- [x] Configurar webhook da Perfect Pay (**URL placeholder via `webhook.site` por enquanto** — trocar pós-deploy)
- [x] Copiar `PERFECTPAY_WEBHOOK_SECRET` pro Doppler (Public Token gerado pela Perfect Pay)
- [ ] Comprar domínio (registro.br ou Cloudflare) — **não bloqueia desenvolvimento**, fazer antes de deploy
- [ ] Configurar DNS: `dominio.com` (página de vendas, fora do escopo do app) e `app.dominio.com` (o app) — **não bloqueia desenvolvimento**

### Repositório e ambiente
- [x] Criar repositório GitHub privado (`RushLab-Org/Sacada-ia`)
- [x] Configurar Doppler com projetos `dev` e `prd`, importar todas as variáveis no `dev`
- [x] Vincular projeto local ao Doppler (`doppler login` + `doppler setup`)
- [x] `git init` + commit inicial + push pra `main`
- [ ] Conectar Vercel ao repo, configurar deploy automático em `main`, region `gru1` — **fazer depois do Marco 1**
- [ ] Integrar Doppler com Vercel (ou importar env vars manualmente)
- [ ] Workflow GitHub Actions básico: `.github/workflows/pr.yml` com lint + typecheck em PR — opcional, pós-MVP
- [ ] Popular config `prd` do Doppler com chaves reais de produção — fazer antes do deploy

### Inicialização do projeto
- [x] `npx create-next-app@latest` com TypeScript, Tailwind, App Router, **sem `src/`** (rodou em Next 16.2.6 — ver ADR-016)
- [x] Instalar dependências: `@supabase/supabase-js`, `@supabase/ssr`, `@google/generative-ai`, `react-hook-form`, `@hookform/resolvers`, `zod`, `lucide-react`
- [x] Instalar shadcn/ui CLI + componentes: `button`, `input`, `textarea`, `form` (puxado do preset `new-york`), `card`, `dialog`, `select`, `slider`, `tabs`, `badge`, `sonner` (substitui `toast` deprecado), `skeleton`, `label` (dep do form)
- [x] Configurar `prettier` + `prettier-plugin-tailwindcss` (`.prettierrc.json` + `.prettierignore`)
- [x] Estrutura de pastas: `app/`, `components/ui/`, `lib/supabase/`, `lib/schemas/`, `skills/`, `prompts/`
- [x] Copiar system prompt v3 pra `prompts/system-prompt-v3.ts` (export const, template literal escapado; .md original deletado)

### Schema do banco
- [x] Rodar `schema.sql` no SQL Editor do Supabase
- [x] Verificar que **RLS está ativo** em `profiles` (2 policies), `crushes` (4), `generations` (3), `usage_tracking` (1)
- [x] Verificar triggers funcionando (auto-criação de profile no signup, cleanup de histórico)
- [ ] **Teste manual de isolamento:** criar 2 usuários teste, verificar que não acessam dados um do outro — fazer junto com Marco 1 ao testar Auth

---

## ⚠️ Após primeiro deploy na Vercel (não esquecer)

Três placeholders foram colocados no setup inicial pra destravar o desenvolvimento. Antes de rodar tráfego pago em cima, trocar todos:

- [ ] **Doppler — `NEXT_PUBLIC_APP_URL`:** trocar `http://localhost:3000` pelo URL real do app na Vercel (ex: `https://app.sacadaia.com.br`)
- [ ] **Doppler — `SUPPORT_WHATSAPP`:** trocar o número placeholder pelo número real de suporte
- [ ] **Perfect Pay — URL do Webhook:** trocar `https://webhook.site/...` pelo endpoint real `https://app.sacadaia.com.br/api/webhooks/perfectpay`

Sem essas trocas, vendas reais vão entrar mas webhook nunca chega no app (cara paga e não recebe acesso).

### Ajuste de margem pré-tráfego pago

- [ ] **Reduzir limite anti-abuso de 200 → 50 gerações/dia** antes de rodar primeira campanha. Uso legítimo típico é 10-30/dia; 50 cobre com folga, barra abuso bem antes, e salva margem da API Gemini. **Mudança implica:**
  - Criar **ADR-016** substituindo ADR-011 (registrar motivação: proteção de margem em escala de tráfego pago, não previsto no dimensionamento original)
  - Alterar `v_limit INTEGER := 200` → `:= 50` no `schema.sql` e rodar migration no Supabase
  - Atualizar copy da mensagem de limite atingido no Marco 3
  - Atualizar referência em `skills/doppler-helper/SKILL.md` linha 181
  - Atualizar `SESSAO_ATUAL.md` (linhas 80 e 106) e índice de ADRs em `DECISIONS.md`

---

## Marcos do MVP (ordem rígida)

### Marco 1 — Setup técnico + Auth + Schema base
*Meta: 2-3 horas — implementado em 2026-05-29*

- [x] `app/layout.tsx` raiz com metadata + lang pt-BR + `<Toaster />` do Sonner
- [x] `app/login/page.tsx` — Client Component com Form do shadcn + react-hook-form + tom adulto da skill
- [x] `app/login/actions.ts` — Server Action `signInWithEmail` (magic link via `signInWithOtp`)
- [x] `app/auth/callback/route.ts` — handler que troca code por sessão e redireciona
- [x] `middleware.ts` raiz — refresh sessão Supabase + redirect não-autenticados
- [x] `lib/supabase/server.ts` e `lib/supabase/client.ts` (createServerClient com cookies async + createBrowserClient)
- [x] `lib/auth.ts` com `getUser()` e `requireUser()` server-side
- [x] `lib/env.ts` com `requireEnv()` fail-fast (skill doppler-helper)
- [x] `lib/schemas/login.ts` (schema zod compartilhado)
- [x] `app/(app)/layout.tsx` — header com email + botão sair (visual placeholder — definir com humano)
- [x] `app/(app)/page.tsx` — home placeholder com tom dopaminérgico
- [x] `app/(app)/actions.ts` — Server Action `signOut`
- [x] `app/global-error.tsx` + `app/not-found.tsx` — custom error pages (boa prática)
- [x] Aplicar princípios da skill `produto-dopaminergico` em todas as telas desde já (tom adulto da copy; visual fica pra revisão com humano)
- [x] **Build verde** (`npm run build` exit 0, 4 routes geradas, middleware 90.2 kB)
- [ ] **Teste manual end-to-end** (humano): digitar email → receber magic link → entrar logado → ver header com email → clicar "sair" → voltar pra /login. **PRIMEIRO PASSO da próxima sessão.**

### Marco 2 — CRUD de Crushes + Perfil do Usuário
*Meta: 2-3 horas — implementado em 2026-05-29*

**Perfil do usuário:**
- [x] `app/(app)/perfil/page.tsx` (Server Component) + `perfil-form.tsx` (Client Component)
- [x] Campos: idade (Select), situação relacional (Select), tempo solteiro (Select, condicional em "recently_single"), voltando ao mercado (Switch), tem filhos (Switch), áreas de melhoria (Checkbox group, 9 opções batendo com PARTE II.6 do system prompt v3), objetivo (Select)
- [x] Server Action `updateUserProfile` (`app/(app)/perfil/actions.ts`) validando schema zod + marcando `onboarding_completed=true`
- [x] Toast "IA calibrada" no primeiro save, "perfil atualizado" nos subsequentes

**CRUD de crushes:**
- [x] `app/(app)/crushes/page.tsx` (Server Component lista, ordenada por `updated_at DESC`)
- [x] Empty state com personalidade ("tua agenda tá vazia. começa pela que tá te tirando o sono.")
- [x] `app/(app)/crushes/nova-crush-button.tsx` (Client Component dialog + form react-hook-form + zod)
- [x] Campos: nome, tipo de relação (select), contexto livre (textarea 5000 chars)
- [x] Server Action `createCrush` retorna `{ ok, id }` + cliente navega pra `/crushes/[id]`
- [x] `app/(app)/crushes/[id]/page.tsx` (Server Component detalhes + 404 se não for do user)
- [x] `app/(app)/crushes/[id]/crush-edit-form.tsx` (Client Component form de edição, botão disabled até dirty)
- [x] `app/(app)/crushes/[id]/delete-crush-button.tsx` (Client Component dialog de confirmação)
- [x] Server Actions `updateCrush` (revalida `/crushes` e `/crushes/[id]`) e `deleteCrush` (revalida + redirect pra `/crushes`)
- [x] Toast visual em todas as mutations (haptic mobile fica pra Marco 6 polish)

**Layout e navegação:**
- [x] `app/(app)/layout.tsx` atualizado com nav (`/crushes`, `/perfil`)
- [x] `app/(app)/page.tsx` atualizado com CTAs pras subpáginas + mensagem condicional de onboarding pendente

**Componentes shadcn adicionados nesta etapa:**
- `checkbox`, `switch`

**Validação:**
- ✅ `npx tsc --noEmit` exit 0
- ✅ `npx eslint .` exit 0 (com `.eslintignore` adicionado pra arquivos gerados)
- ✅ `npm run build` exit 0 — 7 routes geradas (`/`, `/_not-found`, `/auth/callback`, `/crushes`, `/crushes/[id]`, `/login`, `/perfil`)
- ⏳ Teste manual pendente (humano): preencher perfil, criar crush, editar, excluir

### Marco 3 — Geração de respostas (modo texto)
*Meta: 3-4 horas*

- [ ] `app/(app)/gerar/page.tsx` — tela principal de geração
- [ ] Seleção de crush (autocomplete/select da lista do usuário)
- [ ] Campo textarea pra colar mensagem dela
- [ ] **Slider de intensidade (1-4)** com rótulos visuais: 🙂 leve / 😏 equilibrado / 🔥 quente / 🔥🔥 provocante
- [ ] **Chips de intenção** (single select): Responder normal / Esquentar / Sair de DR / Pedir pra sair / Reconquistar / Desconversar / Outros
- [ ] Campo opcional "Contexto extra desta situação"
- [ ] Botão GERAR com **loading dopaminérgico** (mensagens rotativas: "analisando o tom dela...", "aplicando provocação invertida...", "calibrando pela sua voz...")
- [ ] `lib/gemini.ts` com função `gerarPorTexto(input, perfilUsuario, perfilCrush)` injetando system prompt v3 + perfil do usuário no template
- [ ] Renderização das 3 opções em cards copiáveis
- [ ] Botão "copiar" com feedback haptic + visual ("copiado!")
- [ ] Exibição da `leitura` da conversa acima das opções
- [ ] **Badges das `skills_aplicadas`** abaixo de cada opção (vira aula gratuita: "esta usa: provocação invertida + double meaning")
- [ ] Botão "Salvar info nova sobre [nome]" quando `info_nova_detectada !== null` (atualiza contexto da crush)
- [ ] Contador "Geração #X de hoje" sutil no header
- [ ] Tratamento de limite de 200 gerações/dia com mensagem clara

### Marco 4 — Multimodal (print + áudio)
*Meta: 2-3 horas*

- [ ] Tabs na tela "Gerar resposta": **Texto / Print / Áudio**
- [ ] **Modo Print:** input upload de imagem, preview, conversão pra base64
- [ ] `lib/gemini.ts` função `gerarPorPrint(input, imageBase64)` mandando imagem inline pra API do Gemini
- [ ] **Modo Áudio:** input upload de áudio + opção de gravar pelo navegador (`MediaRecorder API`)
- [ ] Visualizador de waveform simples durante gravação
- [ ] `lib/gemini.ts` função `gerarPorAudio(input, audioBase64)`
- [ ] **NÃO armazenar mídia em disco/storage** — processar em memória, descartar
- [ ] Tratamento de erros: imagem muito grande, áudio inválido, Gemini retornou erro/recusou
- [ ] Loading dopaminérgico contextual: "transcrevendo áudio dela...", "lendo o print da conversa..."

### Marco 5 — Webhook Perfect Pay + Criação automática de conta
*Meta: 2-3 horas*

- [ ] `app/api/webhooks/perfectpay/route.ts` recebendo POST do webhook
- [ ] Validação do `PERFECTPAY_WEBHOOK_SECRET` no header
- [ ] Parsing do payload: extrair `email`, `transaction_id`, `status`, `payment_method`
- [ ] **Lógica `status=approved`:**
  - Criar usuário no Supabase Auth com o email (via admin API)
  - Criar `profile` com `subscription_status='active'`, `subscription_type='lifetime'`, `purchased_at=now()`, `transaction_id`
  - Enviar magic link pro email automaticamente
- [ ] **Lógica `status=refunded`:** marcar `profile.subscription_status='refunded'`, revogar acesso
- [ ] `app/sucesso/page.tsx` — tela pós-compra com "Acesso liberado, verifique seu email"
- [ ] **Botão "Solicitar reembolso"** em `app/(app)/configuracoes/page.tsx`
- [ ] Modal de reembolso: confirmação + abre WhatsApp Business OU email pré-formatado pro suporte
- [ ] Validar com webhook real da Perfect Pay (modo sandbox primeiro, depois produção)

### Marco 6 — Onboarding dopaminérgico + Polish
*Meta: 2-3 horas. Esse marco separa MVP que vende de MVP que falha.*

**Onboarding (6 telas pós-primeiro-login):**
- [ ] Tela 1: "Vamos te conhecer rapidinho" — captura perfil do usuário (idade + estado civil)
- [ ] Tela 2: situação (recém-solteiro? voltando ao mercado? filhos?) — chips, máximo 30s pra preencher
- [ ] Tela 3: "O que você quer melhorar?" multi-select + objetivo single-select
- [ ] Tela 4: "Vamos criar o perfil da sua primeira crush" — guiado
- [ ] Tela 5: "Cole a última mensagem dela" — demonstração ao vivo
- [ ] Tela 6: Resposta gerada na tela + "Sua IA tá calibrada. Esse é seu app." (CTA pra explorar)

**Polish geral:**
- [ ] Empty states com personalidade em TODAS as listas/telas
- [ ] Animações sutis de entrada (framer-motion ou CSS puro)
- [ ] `app/(app)/progresso/page.tsx` — gerações feitas, dias usando, "vitórias" registradas
- [ ] `app/(app)/como-funciona/page.tsx` — explicação das 12 skills (educacional + reforça valor pago)
- [ ] `app/(app)/configuracoes/page.tsx` — botão excluir conta (LGPD) + solicitar reembolso
- [ ] Favicon, OG image, metadata completa
- [ ] Termos de uso + política de privacidade (templates básicos, OK pra MVP)
- [ ] Botão "Marcar essa resposta como vitória" em gerações (futura feature de feedback loop, mas começa coletando dado)

---

## Marcos finais do MVP — Validação antes do go-live

- [ ] **Teste end-to-end completo:**
  - Simular compra na Perfect Pay sandbox
  - Receber webhook
  - Verificar criação de conta e magic link
  - Entrar, fazer onboarding completo
  - Criar crush, gerar resposta (texto/print/áudio)
  - Testar limite de 200/dia
  - Solicitar reembolso, verificar fluxo
- [ ] **Teste de isolamento multi-tenant:** 2 usuários não veem dados um do outro
- [ ] **Teste de segurança básica:** SQL injection nos forms, XSS, validação server-side
- [ ] **Spend limit** confirmado no Google AI Studio
- [ ] **Backup manual do schema** do Supabase (princípio de propriedade dos dados)
- [ ] Documentação interna revisada: `SESSAO_ATUAL.md`, `DECISIONS.md`, `ROADMAP.md` consistentes
- [ ] Página de vendas externa (`dominio.com`) pronta — escopo separado do app
- [ ] Tráfego pronto pra rodar — criativos, copy, conta de anúncio com pixel

---

## Pós-MVP (referência — NÃO construir sem validar oferta primeiro)

### Monetização (somente após oferta validada — sinal claro de vendabilidade)

Construir SOMENTE se MVP provar tração comercial:
- Conversão de tráfego pago consistente ≥1% por pelo menos 2 semanas, OU
- ≥100 vendas vitalício acumuladas com refund rate <15%

Critério é proteção contra over-engineering em produto que pode não vingar.

- **Order bump no checkout Perfect Pay** — oferta adicional NA tela de pagamento, antes do "Finalizar compra". Aumenta ticket médio sem fricção pós-venda.
  - Candidato A: **+R$ 27 — "Análise de bio do Instagram dela"** (cara cola URL/print, IA gera leitura completa do perfil dela: tipo de homem que ela atrai, gatilhos, vulnerabilidades, abordagem ideal). Reaproveita stack Gemini já existente.
  - Candidato B: **+R$ 17 — Guia PDF "As 7 mensagens que sempre funcionam"** (PDF estático com modelos calibrados, entrega imediata via email). Custo marginal zero.
  - Eleva ticket médio estimado 30-50% sem violar princípio fundador 7 do CLAUDE.md (oferta acontece NO checkout EXTERNO, não dentro do app pós-compra).
  - Validar com A/B test (50% vê order bump, 50% não) por mínimo 100 vendas antes de cravar.
  - Implementação: depende de feature de order bump da Perfect Pay (verificar disponibilidade no plano contratado).
- **Upsell pós-compra** — oferta adicional APÓS pagamento confirmado, antes do magic link. **Só implementar se order bump tiver conversão >20%** (sinal de que público compra adicional).
  - Candidato: **upgrade pra tier premium recorrente** (R$ 19/mês com features extras: histórico ilimitado por crush, modo voz, análise de Instagram ilimitada).
  - **NÃO** colocar upsell dentro do app pós-login — viola princípio fundador 7 do CLAUDE.md. Fluxo separado via página intermediária pós-pagamento OU email transacional, NUNCA dentro da experiência principal do app.
  - Construção: requer infra de recorrência na Perfect Pay (ou migração pra processador adequado tipo Stripe BR).

### Outras evoluções

- **Tracking dentro do app** (PostHog/Mixpanel funil de ativação)
- **Histórico rolante de conversa por crush** (contexto das últimas 10 trocas)
- **Feedback loop** ("essa funcionou" → ajuste personalizado por usuário)
- **App nativo iOS/Android**
- **Modo voz** (cara fala em vez de digitar)
- **Análise de Instagram dela** (URL → contexto auto-preenchido) — pode virar parte do order bump A
- **Bio Tinder/Hinge analyzer**
- **Conversation Coach** (analisa screenshot da conversa inteira)
- **Tier premium com Grok** pra intensidade 5 explícita
- **Sistema de indicação** (cara indica amigo, bônus pros dois)
- **Migração pra recorrência** mensal/anual após validar vitalício
- **Versão feminina** (depois de dominar nicho masculino)
- **Backup automatizado** pra Cloudflare R2 (quando primeiras vendas justificarem complexidade)

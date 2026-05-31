# Architecture Decision Records — Sacada IA

Registro de todas as decisões arquiteturais do projeto seguindo o padrão ADR.

## Convenções

- Cada ADR documenta UMA decisão arquitetural
- ADRs nunca são editados após criados, exceto pra mudar status:
  - **Aceita** (decisão vigente)
  - **Substituída por ADR-XXX**
  - **Obsoleta**
- Quando uma decisão for revisitada e mudada, criar ADR novo referenciando o anterior
- Cada ADR deve ter **gatilho de reavaliação claro** (condição concreta)

## Índice

| ADR | Decisão | Status | Data |
|---|---|---|---|
| 001 | TypeScript em todo código Node | Aceita | 2026-05-28 |
| 002 | Next.js 15 + App Router | Aceita | 2026-05-28 |
| 003 | Tailwind + shadcn/ui + ESLint + Prettier | Aceita | 2026-05-28 |
| 004 | PostgreSQL via Supabase (região SP) | Aceita | 2026-05-28 |
| 005 | Auth via Magic Link (Supabase Auth) | Aceita | 2026-05-28 |
| 006 | Gemini 2.5 Flash como modelo de IA | Aceita | 2026-05-28 |
| 007 | System Prompt Master v2 estruturado em camadas | Aceita | 2026-05-28 |
| 008 | Output JSON forçado com schema fixo | Aceita | 2026-05-28 |
| 009 | Vitalício R$ 47 + Garantia 7 dias (sem trial) | Aceita | 2026-05-28 |
| 010 | Perfect Pay via redirect (não checkout transparente) | Aceita | 2026-05-28 |
| 011 | Limite anti-abuso 200 gerações/dia por usuário | Aceita | 2026-05-28 |
| 012 | Doppler pra segredos | Aceita | 2026-05-28 |
| 013 | Vercel pro frontend, free Hobby no MVP | Aceita | 2026-05-28 |
| 014 | GitHub privado + GitHub Actions | Aceita | 2026-05-28 |
| 015 | Skill `produto-dopaminergico` aplicada em UI | Aceita | 2026-05-28 |
| 016 | Upgrade pra Next.js 16 (substitui ADR-002) | Substituída por ADR-018 | 2026-05-29 |
| 017 | Workarounds parciais pra bug de prerender em Next 16 | Obsoleta (resolvida pelo ADR-018) | 2026-05-29 |
| 018 | Downgrade pra Next.js 15 + React 18 (revisão do ADR-016) | Aceita | 2026-05-29 |
| 019 | Working directory em caminho lowercase obrigatório no Windows | Aceita | 2026-05-29 |
| 020 | Intensidade de geração: 4 → 5 etapas + boost contextual + humor calibrado | Aceita | 2026-05-29 |
| 021 | Adicionar `age_range` na crush pra calibrar registro/maturidade da IA | Aceita | 2026-05-30 |
| 022 | Marco 4 multimodal (print + áudio) com transcrição estruturada persistida | Aceita | 2026-05-30 |
| 023 | Marco 5 — Webhook Perfect Pay + criação automática de conta + reembolso | Aceita | 2026-05-30 |
| 024 | Few-shot dinâmico por user: últimas 3 vitórias viram exemplos no prompt | Aceita | 2026-05-30 |
| 025 | Canal de suporte/reembolso: email em vez de WhatsApp | Aceita | 2026-05-30 |
| 026 | Entrada unificada (texto/print/áudio num bloco só) substitui as tabs do Marco 4 | Aceita | 2026-05-30 |
| 027 | Calibração de geração: output literal (anti-meta) + few-shot de intensidade 4/5 + relationshipBoost por chamada | Aceita | 2026-05-30 |
| 028 | Intenção "sexualizar" substitui "outros" na taxonomia de geração | Aceita | 2026-05-30 |
| 029 | Login híbrido: magic link no 1º acesso + email/senha definida depois (evolui ADR-005) | Aceita | 2026-05-31 |
| 030 | Vitória por opção (🔥) + coleta pro aprendizado macro pós-MVP (injeção per-user segue grosseira) | Aceita | 2026-05-31 |
| 031 | Modelo de geração: Gemini 3.5 Flash substitui 2.5 Flash (qualidade/variação; custo ~5-8x, mitigável) | Aceita | 2026-05-31 |
| 032 | Onboarding guiado em 5 telas (Marco 6); onboarding_completed marcado ao salvar perfil | Aceita | 2026-05-31 |

---

## ADR-001: TypeScript em todo código Node

**Data:** 2026-05-28
**Status:** Aceita
**Camada:** Fundação

**Contexto:**
App é greenfield, escopo de MVP relativamente compacto (~13-19h dev), mas com expectativa de evolução pós-validação. Decisão linguística afeta velocidade inicial vs segurança de refactor.

**Opções consideradas:**
- **JavaScript:** menos cerimônia, sem compilação
- **TypeScript:** tipos compartilhados, refactor seguro, ecossistema Next.js prioriza TS

**Decisão:**
TypeScript em todo o código.

**Justificativa:**
- Next.js 15 documentação prioriza TS
- Supabase gera tipos automaticamente do schema (`supabase gen types`)
- Zod schemas compartilhados front/back via TypeScript
- Refactor seguro num projeto que vai evoluir
- Claude escreve TS com qualidade alta

**Gatilho de reavaliação:**
N/A. Decisão estrutural irreversível na prática.

---

## ADR-002: Next.js 15 + App Router

**Data:** 2026-05-28
**Status:** Substituída por ADR-016
**Camada:** Fundação — Frontend

**Contexto:**
Framework do app. App tem dashboards de geração de resposta, formulários, mutations via Server Actions, e precisa multimodal (upload de imagem/áudio).

**Opções consideradas:**
- **Next.js 15 + App Router**
- **Next.js 15 + Pages Router** (legado)
- **Remix** (menos features novas)
- **Astro** (foco em conteúdo, não dinâmico)

**Decisão:**
Next.js 15 + App Router.

**Justificativa:**
- Server Components reduzem JS no client
- Server Actions cortam boilerplate de API routes pra mutations
- Streaming pra dados grandes (lista de crushes, histórico)
- React 19 nativo
- Vercel hospeda nativamente
- Padrão de mercado pra apps Next.js em 2026

**Implicações:**
- Server Components default; `'use client'` só com necessidade real
- Server Actions pra todas as mutations CRUD
- Middleware pra proteção de rotas autenticadas

**Gatilho de reavaliação:**
Instabilidade grave do App Router em feature crítica do app; OU Vercel mudar pricing/modelo de forma incompatível.

---

## ADR-003: Tailwind + shadcn/ui + ESLint + Prettier

**Data:** 2026-05-28
**Status:** Aceita
**Camada:** Fundação — Frontend Estilo

**Contexto:**
Sistema de design e qualidade de código no frontend. Velocidade de iteração visual é crítica num MVP de 13-19h.

**Decisão:**
Tailwind CSS + shadcn/ui + ESLint (config Next) + Prettier + `prettier-plugin-tailwindcss`.

**Justificativa:**
- Tailwind utility-first acelera dashboards e telas operacionais
- shadcn/ui copia componentes pro projeto (owned, customizável)
- Componentes shadcn já vêm com integração `react-hook-form` nativa
- `prettier-plugin-tailwindcss` ordena classes automaticamente
- Padrão dominante no ecossistema Next.js 2026

**Implicações:**
- Componentes shadcn em `components/ui/` copiados via CLI
- Sem dependência runtime de CSS-in-JS
- Tema centralizado em `tailwind.config.ts`

**Gatilho de reavaliação:**
Design system corporativo (pós-MVP) exigindo paradigma diferente; OU breaking changes graves em major do Tailwind.

---

## ADR-004: PostgreSQL via Supabase (região SP)

**Data:** 2026-05-28
**Status:** Aceita
**Camada:** Banco

**Contexto:**
Banco do projeto. Precisa Postgres (RLS pra multi-tenant entre usuários, JSON pra contexto da crush, Auth integrada pra simplificar magic link), região BR pra latência baixa, free tier viável no MVP.

**Opções consideradas:**
- **Supabase:** Postgres + Auth + região SP, free tier OK
- **Neon:** sem região SP
- **Railway:** sem região SP
- **AWS RDS:** overhead operacional alto pra MVP

**Decisão:**
Supabase, região São Paulo. Free tier no MVP (mantido ativo manualmente até primeiras vendas), upgrade pra Pro ($25/mês) **antes** de rodar primeira campanha de tráfego.

**Justificativa:**
- Postgres padrão, zero lock-in técnico
- Região SP — latência baixa pra usuário BR
- Auth integrada simplifica magic link (decisão crítica em MVP de 13-19h)
- Free tier OK pra fase pré-venda
- Pro ($25/mês) viável após primeiras vendas (ponto de equilíbrio com 6 vendas)

**Implicações:**
- Free tier **pausa após 1 semana de inatividade** — usuário mantém ativo manualmente até lançamento
- Migração Free → Pro feita ANTES do primeiro anúncio rodar (~15min de propagação)
- RLS ativo desde dia 1 em todas as tabelas sensíveis
- Schema versionado em `schema.sql` no repo, NUNCA criado via UI da Supabase

**Gatilho de reavaliação:**
- Free tier insuficiente → upgrade Pro (planejado pré-launch)
- Downtime acumulado >0.5%/mês → considerar migração
- Necessidade de >8GB DB → upgrade compute

---

## ADR-005: Auth via Magic Link (Supabase Auth)

**Data:** 2026-05-28
**Status:** Aceita
**Camada:** Autenticação

**Contexto:**
App tem fluxo de criação automática de conta pós-pagamento (webhook Perfect Pay cria conta com email do comprador). Usuário nunca passou por "cadastro" tradicional. Modelo de auth precisa funcionar SEM senha pré-definida.

**Opções consideradas:**
- **Magic Link:** sem senha, link único por email
- **Senha padrão tipo 0000:** simples mas catastrófico em segurança
- **Email + senha definida no primeiro acesso:** mais passos, fricção alta
- **OAuth (Google/Apple):** ainda exige cadastro prévio em SaaS terceiro

**Decisão:**
Magic Link via Supabase Auth.

**Justificativa:**
- Funciona perfeitamente com fluxo pós-compra (cara recebe link no email, clica, entra logado)
- Zero fricção (não precisa lembrar senha)
- Padrão moderno (2026), profissional
- Supabase oferece nativamente, sem dev extra
- Senha 0000 seria catastrófica em segurança (qualquer um com lista de emails de compradores entraria em qualquer conta)

**Implicações:**
- SMTP nativo do Supabase no MVP (limite ~30 emails/hora) — suficiente pra primeiras vendas
- **Trigger automático no Supabase:** ao criar usuário em `auth.users`, criar registro em `public.profiles`
- Quando volume crescer (>20 vendas/dia), configurar SMTP customizado (Resend free 3k emails/mês)
- Sessão persistente via cookie HTTP-only (Supabase SSR)

**Gatilho de reavaliação:**
- Volume passar limite do SMTP nativo → migrar pra Resend
- Usuários reclamarem de magic link (raro) → adicionar OAuth como opção

---

## ADR-006: Gemini 2.5 Flash como modelo de IA

**Data:** 2026-05-28
**Status:** Aceita
**Camada:** IA

**Contexto:**
Modelo de IA central do produto. Critérios: custo baixo (escala com vendas), qualidade boa em português brasileiro, permissividade pra conteúdo "picante/provocante" (não explícito), multimodal nativo (print + áudio).

**Opções consideradas:**
- **Gemini 2.5 Flash:** $0.30/M input, $2.50/M output, multimodal nativo, BLOCK_NONE configurável
- **Claude Haiku 4.5:** $1/M input, $5/M output, qualidade superior em copy mas mais restritivo
- **Claude Sonnet 4.6:** $3/M input, $15/M output, melhor qualidade mas custo proibitivo
- **GPT-4o-mini:** competitivo, mas qualidade em PT-BR inferior ao Gemini

**Decisão:**
Gemini 2.5 Flash via Google AI Studio.

**Justificativa:**
- Custo ~3x menor que Haiku (irrelevante? sim, mas margem importa)
- Custo ~10x menor que Sonnet
- Multimodal nativo elimina necessidade de OCR/transcrição separada (decisivo pra modo print + áudio)
- `safety_settings: BLOCK_NONE` permite range de "leve" a "provocante" sem travar
- Qualidade em português brasileiro é boa (não excelente, mas suficiente pra esse uso)
- Custo estimado por geração: ~R$ 0,007 sem caching, ~R$ 0,002 com context caching

**Implicações:**
- `GEMINI_API_KEY` no Doppler
- Spend limit configurado no Google AI Studio (defesa contra loop bugado)
- Helper `lib/gemini.ts` com 3 funções: `gerarPorTexto`, `gerarPorPrint`, `gerarPorAudio`
- `responseMimeType: "application/json"` força output JSON válido
- Quando volume >100 gerações/dia, ativar **context caching** do system prompt (90% desconto no input cacheado)

**Gatilho de reavaliação:**
- Usuários reclamarem consistentemente da qualidade da resposta → A/B test com Claude Haiku 4.5
- Custo médio por venda exceder 15% do ticket → otimizações de prompt + caching
- Necessidade de intensidade 5 (sexting explícito) → pluga Grok como modelo opcional premium (decisão pós-MVP)

---

## ADR-007: System Prompt Master v2 estruturado em camadas

**Data:** 2026-05-28
**Status:** Aceita
**Camada:** IA — Prompting

**Contexto:**
Diferenciação central do produto vs concorrente é qualidade da resposta. Estrutura do system prompt determina essa qualidade. Precisa ser editável, versionável, com lógica clara.

**Estrutura decidida:**

```
PARTE I — PILARES INEGOCIÁVEIS
  1. Não Parecer IA (lista negra de palavras, estruturas proibidas, fala real)
  2. Postura > Carência
  3. Espelhar Registro Dela

PARTE II — FUNDAMENTOS (constituição da IA)
  A. Comunicação masculina e atração (12 princípios destilados de Manson,
     Greene, Gottman, Holiday)
  B. Decodificação feminina (12 princípios destilados de Perel, Nagoski,
     hooks, Fisher, Gottlieb, Brown, Ury)

PARTE II.5 — CALIBRAÇÃO PELO PERFIL DO USUÁRIO
  - Por idade (5 ranges)
  - Por situação relacional (solteiro/recém-solteiro/divorciado/voltando)
  - Por filhos
  - Por área que quer melhorar
  - Por objetivo

PARTE III — SKILLS (12 playbooks situacionais)
  Situacionais: sair_de_dr, reconquistar_pos_sumico, lidar_com_shit_test,
    desconversar_pergunta_inconveniente, convite_para_sair_natural
  Calibração de tom: provocacao_invertida, double_meaning_sutil,
    humor_que_constroi_tensao, quebra_de_padrao, resposta_curta_alto_impacto
  Continuidade: esquentar_conversa_morna, fechar_loop_com_curiosidade

PARTE IV — CALIBRAÇÃO POR RELAÇÃO + INTENSIDADE + INTENÇÃO

PARTE V — INPUTS MULTIMODAIS (texto/print/áudio)

PARTE VI — REGRAS DE SEGURANÇA (não-negociáveis)

PARTE VII — FORMATO DE OUTPUT JSON
```

**Justificativa:**
- Pilares como filtros NEGATIVOS (eliminam o que não pode sair)
- Fundamentos como princípios POSITIVOS (constituição que rege ambiguidade)
- Skills como PLAYBOOKS ativados conforme contexto
- Perfil do usuário é diferencial competitivo único (concorrente nenhum tem)

**Implicações:**
- System prompt ~7.000 tokens (atualizado com PARTE II.5)
- Cacheável via Gemini context caching
- Versionado em `prompts/system-prompt-v3.ts`
- Mudanças requerem teste manual em 5-10 cenários antes de release

**Gatilho de reavaliação:**
- Qualidade de resposta degradar (medido por feedback de usuário) → ajustar pilares/skills
- Aparecer skill nova necessária → ADR de evolução adicionando v3
- Modelo mudar (Gemini → Claude) → reavaliar formato (alguns prompts funcionam diferente)

---

## ADR-008: Output JSON forçado com schema fixo

**Data:** 2026-05-28
**Status:** Aceita
**Camada:** IA — Output

**Contexto:**
Frontend precisa parsear resposta da IA pra renderizar 3 opções, leitura, badges de skills aplicadas, e botão de "salvar info nova". Parsing de texto livre via regex é frágil.

**Decisão:**
Output JSON forçado via `responseMimeType: "application/json"` do Gemini. Schema fixo:

```typescript
{
  leitura: string;           // 1-2 frases analisando o estado da conversa
  opcoes: Array<{            // sempre 3, cada uma com tom diferente
    estrategia: string;      // explica o que essa opção faz
    resposta: string;        // mensagem pronta pra copiar
  }>;
  skills_aplicadas: string[]; // ex: ["provocacao_invertida", "double_meaning_sutil"]
  info_nova_detectada: string | null; // info nova sobre a crush detectada
  alerta: string | null;     // alertas (menor de idade, risco real)
}
```

**Justificativa:**
- `JSON.parse()` direto sem regex
- Gemini suporta nativamente via `responseMimeType`
- Validação no frontend via zod
- Schema versionado, fácil evoluir

**Implicações:**
- Schema documentado em `lib/schemas/geracao.ts`
- Validação zod no parse server-side antes de retornar pro client
- Erros de parse retornam mensagem amigável ("tivemos um problema, tente novamente")

**Gatilho de reavaliação:**
- Gemini quebrar consistência do JSON (raro) → fallback pra parsing tolerante
- Schema precisar crescer significativamente → versionar com v3

---

## ADR-009: Vitalício R$ 47 + Garantia 7 dias (sem trial)

**Data:** 2026-05-28
**Status:** Aceita
**Camada:** Negócio

**Contexto:**
Modelo de monetização do MVP. Tráfego frio brasileiro responde mal a recorrência. Decisão entre: trial freemium, garantia de reembolso, ou modelo recorrente. Premissa de validação rápida de oferta.

**Opções consideradas:**
- **Trial freemium (3 gerações/dia × 7 dias):** mais conversão de cadastro, complexidade técnica alta
- **Garantia 7 dias incondicional + vitalício R$ 47:** todo mundo paga upfront, refund se quiser
- **Recorrência R$ 39/mês:** LTV alto mas conversão cold baixa (1-1.5%)
- **Híbrido trial + garantia:** confuso, viola simplicidade

**Decisão:**
Vitalício R$ 47 PIX/Cartão com garantia incondicional de 7 dias de reembolso. **Sem trial.**

**Justificativa:**
- Cash flow imediato (compra hoje, dinheiro hoje)
- Funil simples: 1 passo (compra)
- Mede QUALIDADE DA OFERTA, não retenção de free
- Refund 7 dias incondicional VENDE (copy poderosa)
- Endowment effect: cara que pagou se sente dono, custa pedir devolução
- Refund típico em infoproduto vitalício: 8-15% (margem ainda saudável)
- P&L unitário: R$ 47 - 2% taxa Perfect Pay - 30% tráfego - R$ 5 API = **R$ 23-25 lucro líquido por venda**

**Implicações:**
- Página de vendas precisa transmitir WOW (vídeo demo, exemplos estáticos)
- Botão "Solicitar reembolso" dentro do app abre WhatsApp/email pro suporte
- Refund processado manualmente na Perfect Pay (eles têm botão "estornar")
- Schema marca conta como `refunded` e revoga acesso

**Gatilho de reavaliação:**
- Refund rate >20% → investigar causa (oferta enganosa? produto fraco? expectativa errada?)
- Volume validar (>500 vendas) → testar migração pra recorrência mensal/anual
- Conversão muito baixa (<1%) → testar ticket diferente (R$ 27 ou R$ 67)

---

## ADR-010: Perfect Pay via redirect (não checkout transparente)

**Data:** 2026-05-28
**Status:** Aceita
**Camada:** Negócio — Pagamento

**Contexto:**
Decisão entre redirect (cara sai do app pra checkout da Perfect Pay) vs checkout transparente (UI dentro do app).

**Opções consideradas:**
- **Redirect:** Perfect Pay cuida de tudo (PIX, Cartão, antifraude, recibo, NFe)
- **Checkout transparente API:** UX 100% dentro do app, mas adiciona 2-4h dev + PCI compliance
- **Híbrido PIX nativo + Cartão redirect:** complexidade média, parcial

**Decisão:**
Redirect simples pro checkout da Perfect Pay.

**Justificativa:**
- MVP em 13-19h não comporta complexidade extra de checkout transparente
- Perfect Pay tem checkout otimizado (não é página feia de banco)
- Zero responsabilidade legal sobre dado de cartão (PCI compliance)
- Quebra de imersão acontece DEPOIS do "decidiu comprar" — momento menos sensível
- Recuperação de carrinho abandonado da Perfect Pay funciona

**Implicações:**
- Botão "Comprar" na página de vendas → URL do Perfect Pay com `external_reference` se disponível
- Após pagamento, Perfect Pay redireciona pra `app.dominio.com/sucesso`
- Webhook é o caminho REAL de liberação (redirect é só UX)

**Gatilho de reavaliação:**
- Validar oferta com 500+ vendas + identificar que perde X% no momento do redirect → considerar checkout transparente
- Mudança de política Perfect Pay incompatível → considerar Stripe BR ou outros

---

## ADR-011: Limite anti-abuso 200 gerações/dia por usuário

**Data:** 2026-05-28
**Status:** Aceita
**Camada:** Negócio — Anti-abuso

**Contexto:**
Vitalício R$ 47 + uso ilimitado pode atrair abusadores (cara compra, gera 5.000 mensagens/dia em fazenda de bot, ou compartilha conta).

**Decisão:**
Limite de 200 gerações por dia por usuário pagante.

**Justificativa:**
- Usuário legítimo NUNCA atinge 200 (uso típico: 10-30/dia em fases ativas)
- Limite barra abuso evidente
- Implementação trivial (tabela `usage_tracking` com contador diário)
- Não menciona o limite no marketing — visível só quando usuário (improvável) bate

**Implicações:**
- Schema tem tabela `usage_tracking (user_id, date, count)`
- Geração 201+ do dia retorna erro "limite diário atingido, tente amanhã"
- Reset à meia-noite (timezone do servidor: America/Sao_Paulo)

**Gatilho de reavaliação:**
- Usuário legítimo bater limite → reavaliar valor (subir pra 500?)
- Múltiplos casos de abuso identificados → adicionar fingerprint do dispositivo

---

## ADR-012: Doppler pra segredos

**Data:** 2026-05-28
**Status:** Aceita
**Camada:** Infraestrutura — Segurança

**Contexto:**
Gerenciamento de variáveis de ambiente e segredos. `.env` em disco é vulnerável (commit acidental, leak por screen share, sem versionamento de quem mudou).

**Decisão:**
Doppler com projetos `dev` e `prod`. Sem `.env` em disco em nenhum momento.

**Justificativa:**
- Free tier cobre solo dev + 1 projeto
- Versionamento de mudanças (quem alterou o quê e quando)
- Integração nativa com Vercel
- CLI `doppler run -- npm dev` injeta vars sem expor em disco
- Padrão de mercado em 2026 pra apps modernos

**Implicações:**
- Doppler CLI instalado localmente
- Comandos `npm dev`, `npm build`, `npx prisma migrate` etc rodam via `doppler run --`
- Integração com Vercel injeta vars no deploy automaticamente
- GitHub Actions usa `DOPPLER_TOKEN_PROD` pra deploy

**Variáveis previstas:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY`
- `PERFECTPAY_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `SUPPORT_EMAIL` ou `SUPPORT_WHATSAPP`

**Gatilho de reavaliação:**
- Volume de segredos crescer demais → considerar Vault ou AWS Secrets Manager
- Doppler mudar pricing → migrar pra alternativa

---

## ADR-013: Vercel pro frontend, free Hobby no MVP

**Data:** 2026-05-28
**Status:** Aceita
**Camada:** Infraestrutura — Hospedagem

**Contexto:**
Hospedagem do Next.js. Critérios: integração com Next.js (features novas chegam primeiro), região BR (gru1), free tier viável no MVP.

**Decisão:**
Vercel com plano Hobby (free) no MVP, region `gru1` (São Paulo). Upgrade pra Pro ($20/mês) quando volume justificar.

**Justificativa:**
- Vercel = quem fez o Next.js (features novas + bug fixes mais rápidos)
- Region `gru1` SP — latência baixa pra usuário BR
- Hobby cobre MVP com folga
- GitHub integration zero-config

**Implicações:**
- Conta Vercel conectada ao GitHub privado
- Branch `main` em produção
- Preview deploys automáticos em PRs (útil pra testar antes de merge)
- Doppler integration ativa pra injetar env vars

**Gatilho de reavaliação:**
- Hobby insuficiente (bandwidth, executions) → Pro $20/mês
- Edge functions necessárias pra latência crítica → reavaliar arquitetura

---

## ADR-014: GitHub privado + GitHub Actions

**Data:** 2026-05-28
**Status:** Aceita
**Camada:** Infraestrutura — Repositório

**Contexto:**
Repositório do código. Critérios: privacidade (system prompt é IP do produto), integração com Vercel, CI/CD básico.

**Decisão:**
GitHub repositório privado + GitHub Actions pra workflows básicos.

**Justificativa:**
- Privado no MVP (código + prompt são IP)
- Free tier do GitHub generoso pra solo dev
- Actions cobre CI básico (2000min/mês private free)
- Integração Vercel zero-config

**Implicações:**
- `.github/workflows/pr.yml`: lint + typecheck + build em PR (sem deploy)
- Branch protection em `main` (require PR review, require checks passing)
- `.gitignore` rigoroso (`.env*`, `node_modules`, `.next`, etc)

**Gatilho de reavaliação:**
- Time crescer → considerar GitHub Pro ou GitLab
- CI demorar demais → otimizar com cache ou paralelização

---

## ADR-015: Skill `produto-dopaminergico` aplicada em UI

**Data:** 2026-05-28
**Status:** Aceita
**Camada:** UX e Produto

**Contexto:**
UX/UI separa MVP que vende de MVP que falha. Princípios de produto dopaminérgico (engagement saudável + conversão ética) precisam ser aplicados consistentemente. Sem documentação, princípios viram folclore que evapora entre sessões.

**Decisão:**
Criar skill carregável `skills/produto-dopaminergico/SKILL.md` ativada automaticamente quando trabalho envolver UI/UX.

**Escopo da skill (Uso B do termo "dopaminérgico"):**
- Engagement saudável + conversão ética
- Princípios de conversão (free → paid)
- Princípios de UX que geram satisfação real
- Princípios de retenção e indicação
- **NÃO** inclui dark patterns (ansiedade artificial, slot machine, confusão proposital, exploração de inseguranças)

**Justificativa:**
- Skill carregável = padrão do projeto (replica padrão do frota-app de referência)
- Princípios documentados em UM lugar versionado
- Aplicação consistente entre sessões do Claude Code
- Editável (princípios podem evoluir com dados de uso real)

**Implicações:**
- `skills/produto-dopaminergico/SKILL.md` com frontmatter YAML
- `CLAUDE.md` do projeto referencia pasta `skills/` pra carregamento automático
- Skill consultada em TODOS os marcos que envolvem UI (Marcos 1, 2, 3, 4, 5, 6)

**Gatilho de reavaliação:**
- Dados de uso real revelarem que princípio X não funciona → atualizar skill
- Princípio novo emergir de feedback de usuário → adicionar skill
- Pivot de produto significativo → reavaliar escopo

---

## ADR-016: Upgrade pra Next.js 16

**Data:** 2026-05-29
**Status:** Substituída por ADR-018
**Camada:** Fundação — Frontend

**Contexto:**
ADR-002 cravou Next.js 15 + App Router em 2026-05-28. Bootstrap do projeto
(commit `fd83336` — "Bootstrap Next.js 16 + setup completo") usou Next.js 16.2.6
em vez de 15. Decisão sobre versão foi tomada implicitamente pelo
`create-next-app@latest`, que pegou a versão mais recente disponível em maio/2026.

**Decisão:**
Aceitar o upgrade pra Next.js 16 (App Router + Turbopack default + React 19).

**Justificativa:**
- create-next-app já bootstrapou em 16; reverter seria trabalho extra sem benefício claro pro MVP
- Next 16 é o release stable em maio/2026 — não é canary nem RC
- Diferenças relevantes pro projeto vs Next 15:
  - `middleware.ts` renomeado pra `proxy.ts` (export `proxy` em vez de `middleware`)
  - Turbopack como builder default em `next build`
  - React 19 nativo (mesma coisa que Next 15)
  - APIs assíncronas mantidas (cookies/headers já eram async em 15)
- Suporte do `@supabase/ssr` continua compatível (testado nesta sessão)

**Implicações:**
- Helper de auth via `proxy.ts` em vez de `middleware.ts`
- Bug aberto vercel/next.js #87719 afeta `next build` em pages internas — ver ADR-017
- Outras decisões já tomadas (Tailwind v4, shadcn base-nova, Sonner) seguem compatíveis

**Gatilho de reavaliação:**
- Bug #87719 sem fix em 60 dias → considerar downgrade pra Next.js 15
- Incompatibilidade grave com lib crítica (Supabase, Gemini, Doppler) → reverter
- Vercel mudar pricing/modelo de forma incompatível com hobby/pro plan

---

## ADR-017: Workarounds parciais pra bug de prerender em Next 16

**Data:** 2026-05-29
**Status:** Obsoleta (resolvida pelo ADR-018 — downgrade Next 15 elimina necessidade dos workarounds)
**Camada:** Fundação — Frontend / Build

**Contexto:**
Next 16.2.6 tem bug aberto (vercel/next.js #87719, reportado em 2025-12-23 na 16.1.1, persiste em 16.2.6) onde `next build` falha ao prerender pages internas geradas pelo framework (`/_global-error` e `/_not-found`) que sequer existem na aplicação:

```
Error [InvariantError]: Invariant: Expected workStore to be initialized.
This is a bug in Next.js.
Export encountered an error on /_global-error/page: /_global-error, exiting the build.
```

A mensagem reconhece o bug como interno do Next. Sem fix oficial até 2026-05-29. `next dev` funciona normalmente — só `next build` quebra.

**Decisão:**
Manter Next 16 (ADR-016) e aplicar workarounds parciais até fix oficial:

1. **Criar `app/global-error.tsx`** customizado (Client Component obrigatório por contrato Next)
2. **Criar `app/not-found.tsx`** customizado (Server Component)
3. **`export const dynamic = 'force-dynamic'`** no `app/layout.tsx` raiz (semanticamente correto: app é todo auth-dependent)
4. **Matcher do `proxy.ts`** excluindo `_not-found|_global-error|_next` pra evitar que o proxy rode em pages internas

**Status atual dos workarounds:** **parciais** — typecheck (`npx tsc --noEmit`) e lint (`npm run lint`) passam. `next build` continua quebrado: o bug é em prerender interno do framework, não respeita config dos parents.

**Próxima ação humana necessária (decisão pendente):**
- **Opção A:** aceitar esperar fix oficial (acompanhar issue #87719) e bloquear deploy até lá
- **Opção B:** downgrade pra Next.js 15 conforme ADR-002 original — reverter o upgrade do ADR-016

**Justificativa dos workarounds escolhidos:**
- `app/global-error.tsx` e `app/not-found.tsx` customizados deveriam sobrescrever as pages auto-geradas pelo Next; bug ignora isso, mas ter os arquivos é boa prática mesmo sem o bug
- `force-dynamic` em root layout é correção semanticamente correta — app é todo dinâmico (RLS, auth via cookies), prerender estático tem valor zero pro caso de uso
- Workarounds não introduzem dívida técnica adicional além do bug em si

**Gatilho de reavaliação:**
- Issue #87719 fechado/corrigido → remover `force-dynamic` em root (manter custom error pages)
- Próximo deploy em produção exigir build → forçar decisão A vs B
- Bug afetar `next dev` também → forçar downgrade imediato

---

## ADR-018: Downgrade pra Next.js 15 + React 18

**Data:** 2026-05-29
**Status:** Aceita (substitui ADR-016, obsoleta ADR-017)
**Camada:** Fundação — Frontend / React

**Contexto:**
ADR-016 cravou Next 16.2.6 com React 19. ADR-017 tentou workarounds parciais pro bug de prerender (vercel/next.js #87719) — sem sucesso. Decisão humana entre Opção A (esperar fix) vs Opção B (downgrade Next 15) escolheu **Opção B**.

Durante o downgrade, surgiu erro **diferente** no build Next 15.5.18 + React 19.2.4:

```
TypeError: Cannot read properties of null (reading 'useContext')
Error occurred prerendering page "/404" (Pages Router fallback _error.js)
```

Sintomas de "two Reacts" — bundle carregando duas árvores do React, com `useContext` retornando null porque está em árvore diferente do Provider.

Após investigação, o erro persistia mesmo com:
- node_modules apagado e reinstalado do zero
- Toaster (next-themes) removido do layout
- `package-lock.json` reciclado

**Sintoma confirma issues vercel/next.js #82366 e #74616.**

**Como Opção C (downgrade React 19 → React 18) foi sugerida e aceita pelo humano,
fizemos o downgrade — mas o erro permaneceu.** A causa raiz foi outra (ADR-019).

**Decisão:**
Stack atual após esta sessão:

- **Next.js 15.5.18** (versão estável estável de maio/2026, App Router)
- **React 18.3.1** + react-dom 18.3.1
- **@types/react 18.3.29** + @types/react-dom 18.3.7
- **ESLint 8.x** + `.eslintrc.json` legacy config + extends `next/core-web-vitals` e `next/typescript`
  (ESLint 9 + eslint-config-next 15 são incompatíveis — `@rushstack/eslint-patch` quebra)
- **`middleware.ts`** (com `export async function middleware`) — Next 15 mantém convenção middleware (proxy é Next 16+)
- **`app/global-error.tsx`** e **`app/not-found.tsx`** custom — boa prática mantida
- **Sem `force-dynamic`** em root layout — Next 15 prerender funciona quando working dir tem case correto (ADR-019)
- **`<Toaster />` do Sonner** restaurado em `app/layout.tsx`

**Justificativa:**
- Next 15 + React 18 é a combinação oficialmente recomendada pelo Vercel em maio/2026, com mais estabilidade comprovada
- React 18 é maduro, sem bugs como o `useContext null` no prerender
- ESLint 8 é o oficial suportado pelo eslint-config-next 15
- Custom error pages são úteis em qualquer versão
- Custom features do React 19 não eram usadas no Marco 1 (sem `useActionState`, sem `use()`, sem novos Server Component features)

**Implicações:**
- Componentes shadcn copiados originalmente em ambiente React 19 podem assumir features de React 19 — testar caso a caso (até agora: tudo passa typecheck)
- Quando Vercel/Next corrigirem bug do Next 16, considerar upgrade de volta — não há pressa
- A migração futura React 18 → 19 será nova decisão se necessário (features novas do 19: `useActionState`, `useFormStatus`, `useOptimistic`, `use()` API)

**Gatilho de reavaliação:**
- Necessidade de feature específica do React 19 → considerar upgrade
- Bug crítico de segurança em Next 15 → upgrade pra Next 16 ou 17
- Vercel anunciar EOL de Next 15 → planejar migração

---

## ADR-019: Working directory em caminho lowercase obrigatório no Windows

**Data:** 2026-05-29
**Status:** Aceita
**Camada:** Operação — Build local

**Contexto:**
Durante o downgrade pra Next 15 + React 18 (ADR-018), o erro de prerender `useContext null` em `/404` PERSISTIU mesmo com a stack oficialmente compatível. Cleanup completo de node_modules e package-lock.json não resolveu.

**Causa raiz identificada:**
O caminho real do projeto no filesystem é `D:\Claude Code\sacada-ia` (tudo lowercase no último segmento). Windows é case-insensitive — `Get-Location` no PowerShell mostrava `D:\Claude Code\Sacada-ia` (mixed case, com S maiúsculo) porque foi assim que o terminal foi navegado.

O Next/Webpack resolve módulos parcialmente via:
- Working directory do processo (mixed case)
- Real path do filesystem (lowercase)

Resultando em **bundling de DUAS instâncias do mesmo módulo** (uma com path mixed, outra com path lowercase). Cada instância tem sua própria árvore React → `useContext` retorna null porque o Consumer está em árvore diferente do Provider.

**Evidência:**
Warning durante build:
```
There are multiple modules with names that only differ in casing.
This can lead to unexpected behavior on a case-semantic filesystem.
Compare these module identifiers:
 D:\Claude Code\sacada-ia\node_modules\next\dist\...
 D:\Claude Code\Sacada-ia\node_modules\next\dist\...
```

**Decisão:**
Rodar todos os comandos (npm, npx, doppler run --, next build, etc) com working directory em path **lowercase puro**: `D:\Claude Code\sacada-ia`.

**Como aplicar:**
- No PowerShell: `Set-Location 'D:\Claude Code\sacada-ia'` (lowercase)
- No Bash via Git Bash: `cd "/d/Claude Code/sacada-ia"`
- Em terminais de IDE: configurar workspace path com case correto
- Evitar `cd D:\Claude Code\Sacada-ia` (mixed case)

**Verificação rápida:**
```powershell
$path = (Get-Item .).FullName
Write-Output "Current path: $path"
# Esperado: D:\Claude Code\sacada-ia (sem S maiúsculo)
```

**Justificativa:**
- Solução simples (não muda código, só hábito de navegação)
- Não exige renomear pasta nem mexer no Git
- Resolve o bug 100%
- `next dev` funciona em qualquer case porque não bundla pra produção; só `next build` quebra

**Alternativas consideradas e rejeitadas:**
- Renomear pasta pra mixed case ou outro path: muda paths de Doppler config, recents do VSCode, links no GitHub — fricção alta sem ganho
- Mover projeto pra `D:\sacada-ia` (raiz sem espaços): violaria estrutura existente
- Forçar webpack a normalizar casing: webpack docs não suportam isso oficialmente

**Gatilho de reavaliação:**
- Migrar pra ambiente Linux/Mac (case-sensitive nativo) → ADR obsoleto
- Mover projeto pra outro path lowercase → manter ADR
- Vercel CI/build em Linux: já é case-sensitive, sem impacto

---

## ADR-020: Intensidade de geração: 4 → 5 etapas + boost contextual + humor calibrado

**Data:** 2026-05-29
**Status:** Aceita
**Camada:** Produto — IA / Geração

**Contexto:**
Marco 3 implementado com 4 níveis de intensidade (1=leve, 2=equilibrado, 3=quente, 4=provocante) conforme system prompt v3 PARTE IV original. Durante teste manual em conversa com convite sexual óbvio ("vinho + frio + casa à noite"), com intenção "esquentar" + intensidade 4 (máxima), as 3 opções saíram em registro 2-3 — humor "kkk" como válvula de escape, double meaning bonzinho, sutil demais pro contexto.

Causa raiz:
1. **System prompt v3 PARTE IV** descrevia intensidade 4 com "Limite: ainda dentro do 'adulto consentido', nunca grosseiro ou objetificante" — frase puxando IA pra "safe defaults"
2. **Gemini default** com BLOCK_NONE ainda tem viés calibrado pra polidez — precisa empurrão explícito
3. **Humor era usado como fallback** mesmo quando registro pedia tensão sexual mantida

ADR-006 já antecipava no gatilho de reavaliação: "Necessidade de intensidade 5 (sexting explícito) → pluga Grok como modelo opcional premium (decisão pós-MVP)". Decisão humana foi formalizar 5ª etapa já no MVP, mantendo Gemini (Grok como upgrade futuro).

**Decisão:**

5 níveis de intensidade com definições calibradas + boost contextual + temperatura escalonada.

**Definições (system prompt v3 PARTE IV atualizada):**

| # | Label | Tom calibrado |
|---|---|---|
| 1 | leve | respeitoso, humor leve OK como base |
| 2 | equilibrado | humor + flerte leve (default) |
| 3 | quente | flerte claro, double meaning ambíguo, humor cúmplice |
| 4 | provocante (safadeza zelada) | ambos sabem que é putaria mas sem ser cru. Humor REDUZIDO, só de teor sexual velado/óbvio. Não termina com "kkk". |
| 5 | explícito (putaria pouco sutil) | sexual direto, sem humor amenizando, palavrão OK, confiança ousada |

**Regra meta sobre humor adicionada ao system prompt:**
> Humor NÃO É FALLBACK. Em intensidades 4 e 5, humor reduz drasticamente. Se o registro dela é sério/sexual claro, humor pode estar AUSENTE. NUNCA terminar opção com "kkk" só pra amenizar tensão construída.

**Boost contextual em `lib/gemini.ts`:**
Pra intensidades 3, 4 e 5, instrução EXTRA é anexada ao prompt do usuário reforçando a calibração (porque Gemini default tende a suavizar). Pra intensidade 4 com intenção "esquentar", instrução adicional pra ir direto.

**Temperatura escalonada por intensidade:**
- 1: 0.8 (mais previsível)
- 2: 0.9 (atual default)
- 3: 0.95
- 4: 1.0
- 5: 1.05

Mais ousadia em intensidades altas. Acima de 1.1 risco maior de JSON malformado.

**Mudanças implementadas:**
- `schema.sql`: `CHECK (intensity BETWEEN 1 AND 5)` (requer migration manual no Supabase em prod)
- `lib/schemas/geracao.ts`: `.max(5)` + label "explícito"
- `lib/gemini.ts`: funções `intensityBoost()` e `temperatureFor()` + `getModel(intensity)`
- `prompts/system-prompt-v3.ts` PARTE IV: substituídas 4 definições por 5 + regra meta sobre humor
- `app/(app)/gerar/gerar-form.tsx`: slider `max={5}`, 5 labels embaixo

**Migration manual necessária (humano roda no Supabase SQL Editor):**

```sql
ALTER TABLE public.generations DROP CONSTRAINT generations_intensity_check;
ALTER TABLE public.generations ADD CONSTRAINT generations_intensity_check
  CHECK (intensity BETWEEN 1 AND 5);
```

**Justificativa:**
- Intensidade 4 com "safe limit" não cobria gama de registros sexuais adultos consentidos
- Humor como fallback era padrão problemático generalizado, não específico de intensidade 4
- 5 etapas dá granularidade pra distinguir "sexual ambíguo zelado" (4) de "sexting cru" (5)
- Boost contextual + temperatura escalonada compensam viés default do Gemini sem trocar de modelo
- Solução não exige troca pro Grok no MVP (ADR-006 mantido)

**Gatilho de reavaliação:**
- Usuário reportar que intensidade 5 ainda fica suave → considerar Grok como tier premium (ADR-006 gatilho original)
- Gemini bloquear consistentemente intensidade 5 (`promptFeedback.blockReason`) → mesmo caminho
- Aprendizado dinâmico (few-shot por user) ativado → reavaliar se boost contextual ainda é necessário

---

## ADR-021: Adicionar `age_range` na crush pra calibrar registro/maturidade da IA

**Data:** 2026-05-30
**Status:** Aceita
**Camada:** Produto — Schema / IA

**Contexto:**
Durante calibração manual do system prompt v3 (pós-ADR-020), humano apontou que o **mesmo registro de flerte** funciona ou não dependendo da idade tanto do USER quanto da CRUSH:

- Cara até ~30 falando "tava sumido pra gerar desejo, funcionou?" → flerte charmoso brincalhão
- Cara 40+ falando mesma coisa pra mulher 38+ → soa adolescente/cringe
- Mulher madura recebendo registro adolescente → fora de tom

System prompt v3 PARTE II.6 já calibra pela idade do USER (5 ranges), mas o app não capturava idade da CRUSH. A IA só conseguia inferir se o usuário escrevesse no contexto livre ("ela tem 40, separada, com filhos"), o que depende de o usuário lembrar.

**Decisão:**
Adicionar campo `age_range` na tabela `crushes` (opcional, mesmo enum do profile). Quando preenchido, injetar no prompt do usuário. Quando NULL, pular linha (não inventar idade).

**Mudanças implementadas:**
- `schema.sql`: nova coluna `age_range TEXT` com CHECK matching ageRangeOptions ou NULL
- `lib/schemas/crush.ts`: campo `age_range: z.enum(ageRangeOptions).nullable()`, reusando `ageRangeOptions` de `lib/schemas/profile.ts` (DRY)
- `app/(app)/crushes/nova-crush-button.tsx` e `crush-edit-form.tsx`: Select com 6 opções + "não sei" (sentinel `__unknown__` mapeia pra null)
- `app/(app)/crushes/actions.ts`: persiste `age_range` em create e update
- `app/(app)/crushes/[id]/page.tsx`: query inclui `age_range`, passa pro form
- `app/(app)/gerar/actions.ts`: carrega `age_range` da crush
- `lib/gemini.ts`: `CrushForPrompt` ganha `age_range`. `montarPromptUsuario` adiciona linha "Idade dela: X" quando preenchido

**Migration manual necessária (humano roda no Supabase SQL Editor):**

```sql
ALTER TABLE public.crushes
  ADD COLUMN age_range TEXT
  CHECK (age_range IN ('18-24', '25-30', '31-38', '39-45', '46-55', '55+') OR age_range IS NULL);
```

Crushes existentes ficam com `age_range = NULL` (comportamento atual mantido — IA não vai ter info nova nelas até o user editar).

**Justificativa:**
- Calibrar tom adulto vs jovem é diferencial competitivo importante
- Custo zero adicional (campo opcional, query SELECT igual, +1 SELECT trivial)
- Reusa enum do profile (DRY), label e tipos compartilhados
- Sentinel `__unknown__` em vez de SelectItem com value vazio (base-ui não aceita value vazio)
- Crushes existentes não quebram (NULL OK)

**Implicações na qualidade da resposta:**
- IA pode calibrar registro adolescente vs maduro pela idade da CRUSH (não só do user)
- Combinação USER × CRUSH dá matriz fina: cara 35 com crush 24 = registro diferente de cara 35 com crush 38
- Quando contexto livre da crush já diz idade ("ela tem 38"), age_range é redundância útil (mais explícito pra IA)

**Gatilho de reavaliação:**
- Se análise futura mostrar que age_range da crush não move significativamente o output (vs só context livre), considerar tornar inferido por NLP do context
- Se enum padrão (18-24, 25-30, etc) não bater com perfil real dos usuários, ajustar ranges

---

## ADR-022: Marco 4 multimodal (print + áudio) com transcrição estruturada persistida

**Data:** 2026-05-30
**Status:** Aceita
**Camada:** Produto — IA / Schema / UI

**Contexto:**
Marco 4 do ROADMAP previa suporte multimodal (print de conversa + áudio dela) reaproveitando a capacidade nativa do Gemini 2.5 Flash (ADR-006). Durante discussão, surgiu ideia adicional do humano: **usar o conteúdo extraído de prints/áudios como material de "aprendizado" pra IA pegar sutilezas do flerte brasileiro**.

Restrição: NÃO armazenar mídia bruta (princípio fundador 6 do agente.md — propriedade dos dados sem inchar storage). Print + áudio têm 100-1000x mais bytes que texto extraído.

**3 opções avaliadas:**

- **A** Marco 4 simples (só extrair texto pra usar na geração, descartar mídia, salvar texto plano em `her_message`)
- **B** Marco 4 com **transcrição estruturada** persistida (Gemini retorna JSON com mensagens + autores + emojis + tom; áudio retorna transcrição + tom emocional + pausas + risadas)
- **C** Marco 4 simples agora + estrutura depois quando der vitória

Humano escolheu **B** — evita refatoração futura e prepara base pra few-shot rico depois.

**Decisão:**

Implementar Marco 4 multimodal com **transcrição estruturada** persistida em `generations.her_message_structured JSONB`.

**Stack final:**

- **Coluna nova:** `generations.her_message_structured JSONB` (NULL pra modo texto)
- **`lib/schemas/geracao.ts`:** 
  - `transcricaoPrintSchema` (mensagens, ultima_dela, vibe_geral)
  - `transcricaoAudioSchema` (transcricao, tom_emocional, pausas, risadas, duracao_seg, recomendar_audio_volta)
  - `geracaoOutputPrintSchema` e `geracaoOutputAudioSchema` (output combinado: geração + transcrição estruturada)
  - `ALLOWED_IMAGE_MIME` (jpeg/png/webp), `ALLOWED_AUDIO_MIME` (mpeg/mp3/ogg/aac/wav/webm/m4a/mp4)
  - `MAX_IMAGE_BYTES` = 5 MB, `MAX_AUDIO_BYTES` = 8 MB (~4-5 min voz)
- **`lib/gemini.ts`:** funções `gerarPorPrint()` e `gerarPorAudio()`. UMA chamada Gemini por modo, retornando JSON único com extração + 3 opções. Multimodal via `{ inlineData: { mimeType, data: base64 } }`.
- **Server Actions:** `gerarRespostaPrint` e `gerarRespostaAudio` em `app/(app)/gerar/actions.ts`. Validam mimeType + tamanho + chamam helpers compartilhados (`preparaContextoGeracao`).
- **UI:** Tabs (Texto / Print / Áudio) em `gerar-form.tsx`. 3 componentes: `gerar-text-form.tsx` (renomeado), `gerar-print-form.tsx`, `gerar-audio-form.tsx`. Print: upload de imagem + preview via `<Image>`. Áudio: upload OU gravação via `MediaRecorder API` (Chrome/Edge produz `audio/webm`).
- **`next.config.ts`:** `experimental.serverActions.bodySizeLimit: '10mb'` (cobre áudio 5min com folga).

**Princípio mantido:**
- Mídia bruta processada em memória, descartada — NUNCA salva em disco/storage
- Apenas transcrição estruturada (texto) persistida em JSONB
- Custo storage por geração: ~2-10 KB (vs ~500-3000 KB se persistisse mídia)

**Migration manual necessária (humano roda no Supabase SQL Editor):**

```sql
ALTER TABLE public.generations
  ADD COLUMN her_message_structured JSONB;
```

Generations existentes ficam com NULL (não quebram, modo texto continua igual).

**Implicações pro aprendizado futuro:**

- Coluna `her_message_structured` está pronta pra ser usada pelo **few-shot dinâmico** (Task #35, próximo passo) — exemplos mais ricos por incluir estilo de escrita dela (emojis, tom)
- Coletivo Brasil-wide ainda fica como pós-MVP (LGPD pesado)

**Custos:**

- Cada chamada multimodal: 1 round-trip Gemini (input = system prompt + texto + mídia; output = JSON estruturado + 3 opções)
- Estimativa custo extra vs texto puro: ~+30-50% tokens output (transcrição estruturada adiciona ~300-800 tokens). Continua viável no free tier pra desenvolvimento e nos primeiros mil usuários.
- Bandwidth upload: limite 10 MB/request — cobre quase qualquer print/áudio realista

**Gatilho de reavaliação:**

- Custo Gemini explodir → considerar extrair transcrição em PRIMEIRA chamada + gerar opções em SEGUNDA (cacheável)
- MediaRecorder não funcionar consistentemente em iOS Safari → cair pra upload-only ou adicionar polyfill
- Volume de uploads grande (>1000/dia) → considerar limite de tamanho menor ou compressão client-side antes de enviar

---

## ADR-023: Marco 5 — Webhook Perfect Pay + criação automática de conta + reembolso

**Data:** 2026-05-30
**Status:** Aceita
**Camada:** Produto — Pagamento / Auth / Backend

**Contexto:**
Marco 5 fecha o fluxo comercial do MVP: pagamento Perfect Pay → conta criada automaticamente → magic link enviado → user entra logado. Sem isso, vendas reais NÃO viram acesso. ADR-010 já cravou Perfect Pay via redirect (não checkout transparente).

Decisões implícitas que viraram explícitas neste marco:
- Idempotência (Perfect Pay reenviar webhook em retransmissão)
- Onde validar o token (header vs body)
- Como tratar status não-acionáveis (pending, refused)
- Fluxo de reembolso dentro do app (botão + WhatsApp pré-formatado)

**Decisão:**

Webhook em `app/api/webhooks/perfectpay/route.ts` com:
- Validação de token: aceita em header `x-perfectpay-token`/`x-webhook-token` OU body (`token`/`webhook_owner`) — Perfect Pay tem config-dependent
- Schema zod com `.passthrough()` (campos novos da Perfect Pay não quebram)
- Switch por `sale_status_enum`:
  - **APPROVED (2)** → `supabase.auth.admin.createUser` (idempotente: se já existe, busca user; trigger `handle_new_user` no schema cria profile pendente) → UPDATE profile pra `active` + grava `transaction_id` + envia magic link via `signInWithOtp`
  - **REFUNDED (11) / CHARGEBACK (7)** → UPDATE profile pra `refunded` + grava `refunded_at` (RLS bloqueia acesso já que `has_active_subscription()` retorna false)
  - **PENDING (1) / REFUSED (3) / outros** → ACK 200 (Perfect Pay para de reenviar) sem mexer no banco
- Idempotência via `transaction_id` (Perfect Pay `code`): se profile com aquele code já existe e está `active`, retorna 200 sem reprocessar
- Erros estruturais retornam 4xx/5xx pra Perfect Pay reenviar (token inválido = 401, payload malformado = 400, falha de banco = 500)

Cliente admin separado em `lib/supabase/admin.ts` (service_role key, bypassa RLS). NUNCA importar em código de cliente.

**Telas relacionadas:**

- `app/sucesso/page.tsx` (pública, já no PUBLIC_PATH_PREFIXES do middleware) — mensagem "acesso liberado, verifique email"
- `app/(app)/configuracoes/page.tsx` (autenticada) — mostra info da conta (status, data compra, método pagamento) + botão **reembolso** + placeholder "excluir conta" (Marco 6)
- `app/(app)/configuracoes/reembolso-button.tsx` — Client Component: dialog de confirmação → abre WhatsApp pré-formatado (`https://wa.me/{numero}?text=...`) com email da conta + motivo a preencher
- Nav do `(app)/layout.tsx` ganha link "config"

**Princípio mantido:**
- Refund processado MANUALMENTE pelo suporte na Perfect Pay (chargeback flow). Quando Perfect Pay confirma refund, webhook recebe status REFUNDED → automaticamente revoga acesso. **Webhook não dispara refund — só REAGE ao status mudado externamente.** Princípio fundador 7 do CLAUDE.md (botão fácil de sair = confiança pra entrar).

**Variável de ambiente nova/usada:**
- `SUPABASE_SERVICE_ROLE_KEY` (já no Doppler, criada no setup) — usada APENAS em `admin.ts` e `route.ts`
- `PERFECTPAY_WEBHOOK_SECRET` (já no Doppler) — validação do token

**Pendência: `NEXT_PUBLIC_SUPPORT_WHATSAPP`**

`SUPPORT_WHATSAPP` no Doppler é backend-only. Pra usar no client (botão de reembolso), preciso de prefixo `NEXT_PUBLIC_*`. No MVP atual o botão tem fallback hardcoded `5547999999999` (placeholder). Pré-deploy:

1. Renomear/duplicar `SUPPORT_WHATSAPP` → `NEXT_PUBLIC_SUPPORT_WHATSAPP` no Doppler
2. Remover hardcoded de `reembolso-button.tsx`

**Justificativa:**

- Schema flexível (`.passthrough`) evita romper se Perfect Pay adicionar campo
- Idempotência via `transaction_id` é mais simples que tabela de webhook_logs (que serve mais pra debug/auditoria)
- Aceitar token em header OU body cobre dois modos de config sem refatorar
- Botão reembolso via WhatsApp pré-formatado em vez de form interno: zero estado, zero email server, suporte humano resolve em paralelo
- Admin client isolado em arquivo separado = revisão mais fácil de não-vazamento

**Bloqueador pra teste end-to-end:**

Tudo funciona localmente, MAS Perfect Pay só consegue enviar webhook pra URL pública. **Marco 5 só pode ser validado end-to-end depois do deploy Vercel.**

- Tasks pré-validação no humano (deploy Vercel + atualizar URLs):
  - Conectar Vercel ao repo GitHub
  - Integração Doppler ↔ Vercel pra env vars
  - Primeiro deploy
  - Atualizar `NEXT_PUBLIC_APP_URL` no Doppler com URL real `.vercel.app`
  - Atualizar Supabase Auth Redirect URLs (adicionar `https://app.vercel.app/auth/callback`)
  - Atualizar URL do webhook na Perfect Pay (apontar pra `https://app.vercel.app/api/webhooks/perfectpay`)
  - Adicionar `NEXT_PUBLIC_SUPPORT_WHATSAPP` no Doppler

**Gatilho de reavaliação:**

- Perfect Pay mudar formato do payload de modo que `.passthrough()` não cubra → atualizar schema zod
- Volume de chargeback alto → adicionar webhook_logs pra auditoria
- Suporte sobrecarregado por solicitações de reembolso → automatizar refund via API da Perfect Pay (se ela suportar)
- Fluxo "esqueci minha senha" — não existe porque é magic link, mas se acabar tendo um, integrar ao mesmo fluxo

---

## ADR-024: Few-shot dinâmico por user — últimas 3 vitórias viram exemplos no prompt

**Data:** 2026-05-30
**Status:** Aceita
**Camada:** Produto — IA / Aprendizado individual

**Contexto:**

Após análise das simulações (Task #36), humano questionou: "essa IA aprende conforme as pessoas vão enviando mais mensagens pra ela criar respostas?" — pergunta estratégica sobre arquitetura.

Resposta direta: NÃO automaticamente. Cada chamada Gemini é stateless. As 3 opções de evolução discutidas:

- **A (opção escolhida agora)** Few-shot dinâmico POR USER. Busca últimas 3-5 vitórias do próprio user (`marked_as_win=true`) e injeta como exemplos no prompt. Aprendizado individual, sem privacidade complicada.
- **B** Few-shot por crush. Mesma lógica mas filtrando pela crush específica. Mais focado, exige volume.
- **C** Aprendizado coletivo Brasil-wide. LGPD pesado, pós-MVP forte.

Humano inicialmente pediu pra esperar (sem conteúdo) → mudou de ideia → implementamos A após Marco 5.

**Decisão:**

Implementar few-shot dinâmico por user com 3 vitórias mais recentes (não 5 — economizar tokens).

**Implementação:**

- `lib/gemini.ts`:
  - Novo tipo `VitoriaPassada = { her_message, ai_options, intensity, intent }`
  - Função `montarVitoriasBloco(vitorias)` constrói bloco "EXEMPLOS DO QUE JÁ FUNCIONOU PRA ESSE USUÁRIO" com até 3 vitórias formatadas
  - `montarPromptUsuario` e `montarPromptBase` (multimodal) ganham parâmetro `vitorias = []`
  - `gerarPorTexto`, `gerarPorPrint`, `gerarPorAudio` aceitam `vitorias?` opcional
- `app/(app)/gerar/actions.ts`:
  - Helper `buscarVitoriasRecentes(supabase, userId)` busca 3 vitórias mais recentes (`marked_as_win=true`, `created_at DESC`)
  - Falha silenciosa: se erro, retorna `[]` e geração segue normal
  - As 3 actions (`gerarResposta`, `gerarRespostaPrint`, `gerarRespostaAudio`) chamam o helper e passam pra Gemini

**Formato injetado no prompt:**

```
EXEMPLOS DO QUE JÁ FUNCIONOU PRA ESSE USUÁRIO (referência de estilo/voz; NÃO copiar literal — usar como calibração do registro):

[1] intensity=2 / intent=responder_normal
Mensagem dela: "..."
Opções geradas (uma delas marcada como vitória):
   - "..."
   - "..."
   - "..."

[2] ...
```

**Custos:**

- Tokens extra por geração: ~300-1000 (3 vitórias × ~100-300 tokens cada)
- Custo Gemini extra: ~$0.0001-0.0003 por geração (irrelevante)
- Latência extra: 1 query SELECT em `generations` (~50ms)

**Limitações conhecidas:**

- User precisa ter usado o botão "essa funcionou?" pelo menos uma vez pra ter vitória. Se nunca marcou, o bloco não aparece — comportamento idêntico ao pre-ADR-024.
- 3 vitórias é arbitrário; pode subir/descer conforme análise futura.
- `marked_as_win` é boolean único pro registro inteiro (não diz qual das 3 opções venceu). IA recebe as 3 e infere — tradeoff de simplicidade.

**Justificativa:**

- Aprendizado real do usuário sem fine-tuning caro
- Privacy-safe (dados do user pro próprio user, sem agregação)
- Custo marginal trivial
- Implementação adiciona ~50 linhas em 2 arquivos
- Quando volume crescer, podemos expandir pra incluir transcrições estruturadas do Marco 4 (mais rico ainda)

**Gatilho de reavaliação:**

- Análise mostrar que vitórias não movem qualidade da geração → reduzir custo voltando pra sem few-shot
- Custo Gemini explodir → reduzir pra 1-2 vitórias ou truncar mais agressivamente
- Aprendizado coletivo (opção C) virar prioridade → arquitetura precisa ser refeita (privacy, agregação, fine-tuning real)
- Marcar como vitória ficar visível mas pouco usado → adicionar prompt UX pra encorajar marcação

---

## ADR-025: Canal de suporte/reembolso: email em vez de WhatsApp

**Data:** 2026-05-30
**Status:** Aceita
**Camada:** Produto — UX / Operações

**Contexto:**
ADR-023 (Marco 5) implementou o botão "solicitar reembolso" abrindo WhatsApp pré-formatado (`wa.me/{numero}?text=...`) via variável `SUPPORT_WHATSAPP`. Durante setup de deploy Vercel (2026-05-30), o humano decidiu trocar pra email — mais profissional, escalável e barato no MVP.

**Decisão:**

Substituir canal de suporte de WhatsApp pra email. Detalhes:

- **Variável de ambiente:** `NEXT_PUBLIC_SUPPORT_EMAIL` (prefixo `NEXT_PUBLIC_` obrigatório porque o botão é Client Component, precisa expor no browser)
- **Valor inicial (MVP):** `apoiosacada@gmail.com` (email Gmail dedicado, criado pelo humano)
- **Comportamento do botão:** abre `mailto:apoiosacada@gmail.com?subject=Solicitar reembolso — Sacada IA&body=Email da conta: {email}\n\nMotivo do reembolso:\n\n` no cliente de email padrão do user
- **Variáveis removidas:** `SUPPORT_WHATSAPP` (deletada de Doppler dev e prd)

**Mudanças no código:**

- `app/(app)/configuracoes/reembolso-button.tsx`:
  - Prop `whatsappNumber` → `supportEmail`
  - Lê `process.env.NEXT_PUBLIC_SUPPORT_EMAIL` em fallback
  - Removido fallback hardcoded `5547999999999`
  - Ícone `MessageCircle` → `Mail`
  - Copy: "abrir WhatsApp" → "abrir email"
  - Se var não setada, exibe `alert()` em vez de abrir mailto vazio (fail-loud)

**Justificativa:**

- Email tem trail/histórico (WhatsApp depende do app, perde mensagem em troca de aparelho)
- Suporte pode ser de qualquer pessoa do time (gmail compartilhado vs número de uma pessoa)
- Sem precisar gerenciar número WhatsApp Business, pix do número, app desinstalado etc
- LGPD: email é dado de contato padrão pra comunicação comercial
- Quando comprar domínio: migrar pra `suporte@sacadaia.com.br` é só trocar 1 var no Doppler

**Implicações:**

- Variável atualizada manualmente no Doppler dev + prd
- Vercel re-importou as vars via integração (deploy já refletindo)
- `agente.md`, `skills/doppler-helper.md`, `lib/schemas/perfectpay.ts` ainda mencionam `SUPPORT_WHATSAPP` em comentários — responsabilidade humana atualizar entre sessões (regra do CLAUDE.md)
- ROADMAP atualizado refletindo nova variável

**Gatilho de reavaliação:**

- Volume de reembolso crescer muito (>10/dia) → considerar form interno em vez de mailto (controle melhor de tempo de resposta)
- Cliente de email default do user não abrir corretamente em mobile (raro) → fallback pra `tel:` ou link direto da caixa Gmail
- Quando comprar domínio: trocar de `apoiosacada@gmail.com` pra email do domínio (`suporte@sacadaia.com.br`) — só atualizar var no Doppler, sem mudança de código

---

## ADR-026: Entrada unificada (texto/print/áudio num bloco só) substitui as tabs do Marco 4

**Data:** 2026-05-30
**Status:** Aceita
**Camada:** Produto — UI / Geração

**Relação com ADR-022:** substitui APENAS o aspecto de UI do ADR-022 (as Tabs "Texto / Print / Áudio"). O resto do ADR-022 — multimodal via Gemini nativo, transcrição estruturada persistida em `her_message_structured`, limites de tamanho, princípio de não-armazenar-mídia — **continua vigente**. ADR-022 permanece **Aceita**.

**Contexto:**
O Marco 4 (ADR-022) entregou os 3 modos de geração (texto, print, áudio) como **tabs separadas** no topo da tela `/gerar`, cada uma com seu próprio form duplicando os mesmos campos (crush, intensidade, intenção, contexto extra). Durante revisão da UI, o humano apontou dois problemas:

1. **Fricção desnecessária:** obrigar o usuário a escolher uma aba "lá em cima" antes de saber o que quer mandar contraria a leitura natural ("recebi isso dela — como respondo?"). O modo da entrada (texto vs print vs áudio) é detalhe de input, não uma decisão que merece navegação.
2. **Bug de crash:** clicar nas abas **print** ou **áudio** derrubava a tela no `global-error` ("algo quebrou"). Causa raiz: os forms de print/áudio tinham um `<FormItem><FormLabel>` **fora de qualquer `<FormField>`**. O `useFormField()` do shadcn (`components/ui/form.tsx`) faz `throw` quando `FormFieldContext` é `null`, quebrando o render. O form de texto não tinha o problema porque todos os campos estavam dentro de `<FormField>`.

**Decisão:**

Substituir as tabs por um **form único** com um **bloco de mensagem unificado** que aceita as 3 entradas no mesmo lugar:

- **textarea** pra colar o texto da mensagem dela, OU
- **anexar print** (botão de upload de imagem), OU
- **enviar/gravar áudio** (upload de arquivo ou `MediaRecorder`).

**Uma modalidade por geração** (mantém o backend do ADR-022 intacto: anexar print limpa o áudio e vice-versa; ter mídia anexada desabilita a textarea pra deixar claro qual entrada vale). No submit, o componente detecta o que foi preenchido e roteia pra action correta (`gerarRespostaPrint` > `gerarRespostaAudio` > `gerarResposta`, nessa precedência). As 3 Server Actions e as 3 funções do Gemini do ADR-022 **não mudaram**.

**Implementação:**

- `app/(app)/gerar/gerar-form.tsx` reescrito de wrapper-de-Tabs pra form único e completo.
- **Deletados:** `gerar-text-form.tsx`, `gerar-print-form.tsx`, `gerar-audio-form.tsx` (lógica consolidada).
- Schema de form local na UI com `her_message` **opcional** (print/áudio substituem o texto); regra "pelo menos uma entrada" validada no submit. Server Actions seguem revalidando com os schemas estritos (`geracaoInputSchema` / `geracaoMidiaInputSchema`) — defesa em profundidade preservada.
- Área de anexo usa `<Label>` puro (NUNCA `<FormItem>`/`<FormLabel>` fora de `<FormField>`) — elimina a causa do crash.
- Loading dopaminérgico contextual por modalidade mantido (mensagens diferentes pra texto/print/áudio).
- `components/ui/tabs.tsx` continua no projeto (pode ser usado em outras telas), só não é mais usado em `/gerar`.

**Validação:** `npx tsc --noEmit` OK, `npx eslint` limpo, `npm run build` verde (11 rotas; `/gerar` 22.2 kB).

**Justificativa:**
- Menos cliques pro WOW (skill `produto-dopaminergico` 1.5: "aha moment" rápido)
- Corrige o crash na raiz (padrão de uso errado do shadcn Form removido)
- Risco baixo: backend e schemas do ADR-022 ficam idênticos; só a camada de UI mudou
- Consolidar 3 forms duplicados num só reduz superfície de manutenção

**Implicações:**
- `ROADMAP.md` Marco 4 ainda descreve "Tabs Texto/Print/Áudio" — referência histórica, atualização é responsabilidade humana entre sessões (regra do CLAUDE.md)
- Combinar texto + mídia numa MESMA chamada (uma única geração multimodal com tudo junto) continua fora de escopo — seria refator de `lib/gemini.ts` + schemas (avaliado e rejeitado pra MVP por custo/risco)

**Gatilho de reavaliação:**
- Usuários quiserem mandar texto + print juntos numa geração só → reavaliar caminho multimodal combinado (opção B descartada agora)
- Métrica mostrar abandono no bloco de entrada → revisar affordances de anexo
- Se tabs voltarem a ser úteis em outra parte do app, `tabs.tsx` segue disponível

---

## ADR-027: Calibração de geração — output literal (anti-meta) + few-shot de intensidade 4/5 + relationshipBoost por chamada

**Data:** 2026-05-30
**Status:** Aceita
**Camada:** Produto — IA / Prompting

**Relação com ADRs anteriores:** evolui a calibração do ADR-020 (5 níveis de intensidade + boost + temperatura) e do ADR-021 (age_range da crush). Não substitui nenhum — todos seguem **Aceitos**. Mudança de prompt sujeita ao ADR-007 (teste manual em alguns cenários antes de fechar).

**Contexto:**
Teste manual real (áudio: mulher diz que queria vinho à noite e "só faltava a campainha"; crush = ficante; intensidade 4; intenção "esquentar") expôs 3 falhas:

1. **Output em formato meta/terceira pessoa:** uma das 3 opções saiu como *"ela disse que queria um vinhozinho hoje? diz pra ela que a companhia pra isso já chegou."* — instrução de coach em vez da mensagem pronta pra copiar. Viola o propósito do produto (o `texto` tem que ser copiável direto).
2. **Intensidade 4 branda demais:** as opções saíram em registro ~3 (double meaning fofo) num convite que era claramente chamada pra sexo. Causa raiz: o system prompt **definia** os níveis 4 e 5 de forma abstrata mas **não tinha nenhum exemplo few-shot** de como uma resposta nível 4/5 realmente soa (os exemplos das 12 skills param no nível ~3). Sem âncora concreta, o Gemini 2.5 Flash volta pro viés de polidez mesmo com `intensityBoost` ativo.
3. **Tipo de relação não movia o output:** ficante e conversante geravam resposta idêntica pra mesma mensagem. O tipo de relação era injetado como guia "macio" no prompt, sem reforço por chamada — o mesmo problema que o ADR-020 resolveu pra intensidade com o `intensityBoost`.

**Decisão:**

Três mudanças de calibração:

1. **Regra de output literal (anti-meta)** em `prompts/system-prompt-v3.ts`:
   - PARTE VII ganha "REGRA ZERO": cada `opcoes[].texto` é a mensagem LITERAL que o usuário copia e cola, em 1ª pessoa falando COM ela; proibido "diz pra ela que...", "responde que...", narração em 3ª pessoa. Com exemplo do anti-padrão (❌/✅).
   - Descrição do campo `texto` no schema reforça o mesmo.

2. **Few-shot de intensidade 4 e 5** em `prompts/system-prompt-v3.ts` PARTE IV:
   - Bloco "ÂNCORA" com a mesma deixa dela escalando 3 → 4 → 5 (exemplos concretos).
   - **Nível 5 é adaptativo (espelha o registro dela — PILAR 3):** ela sugestiva com classe → ousado com classe; ela crua/explícita → espelha o cru dela (palavrão OK). Decisão do humano (product owner): nível 5 alterna entre "putaria com classe" e "explícito cru" conforme a mensagem que ela mandou. Nunca mais cru que ela; no nível 5, nunca mais tímido que ela.
   - Nota nova: **relação × intensidade são eixos separados** — intensidade = peso sexual, relação = familiaridade/enquadramento; nunca gerar a mesma resposta pra relações diferentes na mesma deixa (com exemplo ficante vs conversante vs namorada no mesmo nível 4).

3. **`relationshipBoost(relationship)`** em `lib/gemini.ts`:
   - Reforço contextual por chamada do tipo de relação (espelha o `intensityBoost` do ADR-020), injetado em `montarPromptUsuario` e `montarPromptBase` (texto, print e áudio).
   - Notas específicas por tipo: namorada, ficante, conversante, ex (outras → vazio).
   - Temperatura escalonada subiu nos níveis altos: 4: 1.0 → 1.05; 5: 1.05 → 1.1 (teto seguro pra JSON válido).

**Validação:** `npx tsc --noEmit` OK, `npx eslint` limpo, `npm run build` verde.

**Justificativa:**
- LLM calibra por exemplo: a âncora few-shot é o lever mais forte pra resolver "branda demais" sem trocar de modelo (mantém ADR-006)
- O padrão de "reforço por chamada" já provou funcionar no ADR-020 (intensidade); estender pra relação é consistente
- Regra de output literal corrige um bug de formato que quebra o valor central do produto (mensagem copiável)
- Nível 5 adaptativo respeita o PILAR 3 (espelhar registro) em vez de cravar um teto fixo de crueza

**Implicações:**
- System prompt cresceu ~50 linhas (ainda dentro do orçamento de tokens do ADR-007)
- Conteúdo sexual explícito agora aparece como exemplo NO system prompt (intencional — é o que o produto faz; ADR-020 já autorizou intensidade 5 explícita com palavrão)
- Temperatura 1.1 no nível 5 é o teto; se aumentar incidência de JSON malformado (erro "a IA travou"), recuar pra 1.05

**Gatilho de reavaliação:**
- Se ainda sair brando no nível 4/5 após few-shot → adicionar mais exemplos OU reavaliar Grok como tier premium (gatilho original do ADR-006/ADR-020)
- Se o formato meta voltar a aparecer apesar da REGRA ZERO → adicionar guard server-side que detecta padrões ("diz pra ela", "responde que") e regenera
- Se `relationshipBoost` ainda não diferenciar relações → tornar a diferença mais agressiva ou adicionar few-shot por relação
- Teste manual (ADR-007) dos 3-4 cenários ainda pendente de confirmação do humano antes de considerar a calibração fechada

---

## ADR-028: Intenção "sexualizar" substitui "outros" na taxonomia de geração

**Data:** 2026-05-30
**Status:** Aceita
**Camada:** Produto — IA / Schema

**Relação com ADRs anteriores:** ajusta a calibração do ADR-027 (revisa o few-shot do nível 5) e evolui a taxonomia de intenção do ADR-007/ADR-008. Nenhum substituído.

**Contexto:**
Na revisão do few-shot do ADR-027, o humano (product owner) apontou que cravar "nível 5 espelha o registro dela / nunca seja mais cru que ela" **engessa**: muitas vezes o cara quer justamente **tomar a iniciativa** de mandar algo mais explícito pra subir o nível da conversa, mesmo que a mensagem dela tenha vindo morna. Quem deve definir a explicitude é a **intensidade + intenção que o usuário escolhe**, não a régua dela.

Disso saiu uma segunda observação: a intenção **"outros"** é vaga (PARTE IV definia como "análise contextual livre" = sinal de calibração zero), e **"responder_normal"** já cobre o caso neutro/catch-all. Melhor trocar "outros" por uma intenção que agrega: **"sexualizar"**.

**Decisão:**

1. **Few-shot do nível 5 reescrito** (system-prompt-v3 PARTE IV): removida a regra de espelhamento/teto. Agora: no nível 5 quem manda é **intensidade + intenção**; ir pro explícito mesmo com mensagem dela morna é **quebra de registro deliberada pra cima** (o PILAR 3 já permite quebra como ferramenta). Exemplos cobrem ela-morna / ela-quente / ela-crua, todos resultando em resposta ousada conforme o usuário pediu.

2. **Taxonomia de intenção:** remove `'outros'`, adiciona `'sexualizar'`.
   - **sexualizar** = levar a conversa pro território sexual de forma DELIBERADA e óbvia (o cara tomando a iniciativa). Skills 6/7 com peso sexual; combina com a intensidade pra definir o grau (4-5 = bem safado/explícito).
   - **Distinto de "esquentar"** (sobe tensão/flerte, pode ser sem sexo óbvio).

**Arquivos alterados:**
- `lib/schemas/geracao.ts` — `intentOptions` e `intentLabels` (swap)
- `prompts/system-prompt-v3.ts` — few-shot do nível 5 reescrito + linha de calibração da intenção "sexualizar" na PARTE IV
- `lib/gemini.ts` — `intensityBoost` reconhece `esquentar` OU `sexualizar` nos níveis 4 e 5 (instrução de "tomar a iniciativa pro sexual")
- `schema.sql` — CHECK do `intent` atualizado
- UI: chips de intenção em `gerar-form.tsx` se atualizam sozinhos (mapeiam `intentOptions`)

**Migration manual necessária (humano roda no Supabase SQL Editor):**

\`\`\`sql
-- 1. Migra gerações antigas que usavam 'outros' (a regra nova não aceita mais)
UPDATE public.generations SET intent = 'responder_normal' WHERE intent = 'outros';

-- 2. Remove a CHECK constraint antiga de intent (seja qual for o nome) e cria a nova
DO $$
DECLARE c text;
BEGIN
  SELECT conname INTO c
  FROM pg_constraint
  WHERE conrelid = 'public.generations'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%intent%';
  IF c IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.generations DROP CONSTRAINT %I', c);
  END IF;
END $$;

ALTER TABLE public.generations ADD CONSTRAINT generations_intent_check
  CHECK (intent IN ('responder_normal','esquentar','sair_de_dr','pedir_pra_sair','reconquistar','desconversar','sexualizar'));
\`\`\`

**Ordem de deploy:** a insersão de geração com `intent` é **não-bloqueante** (se o insert falhar, o usuário ainda recebe a resposta — só não persiste). Então o push do código não quebra nada se a migration ainda não rodou; apenas gerações com `intent='sexualizar'` não vão persistir até a migration. Rodar a migration antes de usar "sexualizar" pra valer em produção.

**Justificativa:**
- Intensidade + intenção como fonte da explicitude é mais fiel ao uso real (o usuário decide o movimento) do que um teto preso na mensagem dela
- "outros" não dava sinal nenhum; "sexualizar" dá um movimento estratégico claro que faltava
- Custo baixo: 1 migration + swap de enum; a UI se adapta sozinha

**Gatilho de reavaliação:**
- Se "sexualizar" e "esquentar" na prática gerarem a mesma coisa (usuários não percebem diferença) → fundir ou redefinir
- Se faltar um catch-all genérico que "responder_normal" não cubra → reavaliar reintroduzir algo como "outros"
- Migration não rodada + uso de "sexualizar" em prod → gerações não persistem (lembrete operacional)

---

## ADR-029: Login híbrido — magic link no 1º acesso + email/senha nos seguintes

**Data:** 2026-05-31
**Status:** Aceita
**Camada:** Autenticação

**Relação com ADR-005:** evolui, não substitui. O magic link continua sendo o **1º acesso (pós-compra)** e o caminho de **recuperação ("esqueci a senha")**. ADR-005 permanece **Aceito**.

**Contexto:**
ADR-005 cravou magic link por causa do fluxo pós-compra (o webhook da Perfect Pay cria a conta com o email do pagamento, **sem senha**). Funciona, mas pra usuário recorrente é fricção real receber um link **toda vez** que vai entrar. O humano pediu login por email + senha.

**Decisão:**
Login **híbrido**:
- **1º acesso e recuperação:** magic link (`signInWithOtp`), igual hoje — o usuário criado pelo webhook não tem senha, então entra pelo link.
- **Definir senha:** em `/configuracoes`, o usuário autenticado define uma senha (`supabase.auth.updateUser({ password })`).
- **Logins seguintes:** email + senha (`supabase.auth.signInWithPassword`).
- **Tela de login:** modo **senha por padrão** + link "primeira vez ou esqueceu a senha? entra com link" que alterna pro modo magic link.

**Implementação:**
- `lib/schemas/login.ts` — `passwordLoginSchema` (email+senha), `setPasswordSchema` (min 8)
- `app/login/actions.ts` — `signInWithPassword`
- `app/login/page.tsx` — dois modos (senha / link) com toggle
- `app/(app)/configuracoes/actions.ts` — `setPassword` (updateUser)
- `app/(app)/configuracoes/senha-form.tsx` + card "senha de acesso" na page

**Notas técnicas:**
- Usuário do webhook **não tem senha** até definir uma → até lá usa magic link (fluxo do ADR-023 intacto)
- Supabase "Confirm email OFF" (setup) já permite `signInWithPassword` sem confirmação
- Senha setada no server action → cookie de sessão setado → client faz `window.location.assign('/')` pra o middleware enxergar
- **Não precisa de migration** — senha vive em `auth.users` (gerenciado pelo Supabase), nada muda no schema público

**Justificativa:**
- Tira a fricção do recorrente sem quebrar o fluxo pós-compra (que depende de não ter senha no momento da criação)
- Magic link como fallback cobre "esqueci a senha" sem precisar de fluxo de reset dedicado
- Custo baixo, sem migration, sem mexer no webhook

**Gatilho de reavaliação:**
- Se quiserem OAuth (Google/Apple) → adicionar como 3º método
- Se "definir senha" tiver baixa adesão → considerar setar senha no onboarding (Marco 6)
- Se aparecer abuso de tentativa de senha → habilitar rate limit / lockout do Supabase Auth

---

## ADR-030: Vitória por opção (🔥) + coleta pro aprendizado macro pós-MVP

**Data:** 2026-05-31
**Status:** Aceita
**Camada:** Produto — IA / Feedback / Schema

**Relação com ADR-024:** evolui a coleta de feedback. O few-shot **per-user** do ADR-024 continua **grosseiro de propósito** (injeta gerações inteiras marcadas, não a opção específica) — isso NÃO muda. ADR-024 permanece Aceito.

**Contexto:**
O "essa funcionou?" era um booleano **por geração** (não dizia qual das 3 opções funcionou). O humano propôs um **like por opção** (🔥 no canto de cada resposta): o cara envia a mensagem, e se funcionou com aquela mulher (dado o perfil/estereótipo dela + a mensagem que ela mandou), ele marca aquela opção específica.

Surgiu a tensão (levantada pelo próprio humano): isso não enviesaria a IA a repetir as mesmas respostas? **Resolução do humano:** manter o aprendizado num **contexto MACRO**, não micro.

**Distinção micro × macro (o que destrava a tensão):**
- **Micro (enviesa):** pegar as vitórias do próprio usuário e reinjetar as linhas dele em toda geração dele → repetição. Por isso o per-user fica grosseiro (ADR-024 inalterado).
- **Macro (não enviesa):** agregar os 🔥 da base por **tipo/estereótipo de mulher** e destilar **padrões** (não frases). Calibra o *jeito* da IA sem forçar repetição e é privacy-safe se anonimizado/agregado.

**Decisão:**
Separar **coletar** de **aprender**:

1. **Agora (MVP, barato):**
   - **UI:** like 🔥 por opção em `resultado.tsx` (substitui o "essa funcionou?" único do rodapé). Marca qual das 3 funcionou.
   - **Dado:** coluna `generations.winning_option_index SMALLINT (0-2, NULL=nenhuma)`. O contexto (tipo da crush, mensagem dela, intensidade, intenção) já está ligado via `crush_id`/geração. `marked_as_win` acompanha (true se alguma venceu) pra manter o few-shot do ADR-024 funcionando sem mudança.
   - Action `marcarOpcaoVitoria(generationId, optionIndex|null)` (substitui `marcarComoVitoria`).
   - **Não liga o motor macro** — só acumula o dataset.

2. **Depois (pós-MVP):** motor de aprendizado **macro/coletivo** por tipo de mulher — agrega, anonimiza, destila padrões, dobra no system prompt/calibração. É a opção C do ADR-024 (LGPD-heavy), confirmada como pós-MVP. Construção só com aprovação explícita (regra do CLAUDE.md).

**Implementação:**
- `schema.sql` — coluna `winning_option_index` (migration manual)
- `app/(app)/gerar/actions.ts` — `marcarOpcaoVitoria`
- `app/(app)/gerar/resultado.tsx` — 🔥 por opção (otimista, toggle), remove o card "essa funcionou?" do rodapé

**Migration manual necessária (humano roda no Supabase SQL Editor):**

\`\`\`sql
ALTER TABLE public.generations
  ADD COLUMN winning_option_index SMALLINT
  CHECK (winning_option_index BETWEEN 0 AND 2);
\`\`\`

Linhas existentes ficam com NULL (passam no CHECK). Sem a migration, o like retorna erro ("não consegui marcar") — rodar antes de usar.

**Limitação conhecida (honestidade):**
O like é marcado **na tela do resultado**. A visão completa do humano ("marcar depois que ela reagiu de verdade") precisa de **histórico rolante** (pós-MVP no CLAUDE.md). Por ora, o cara marca a que vai usar / acha que funcionou ali mesmo — mesma limitação do "essa funcionou?" anterior, só que por opção.

**Justificativa:**
- Coletar é barato e de alto valor (constrói o dataset do macro); aprender macro é caro/LGPD → adiar é MVP-correto
- Resolve a tensão do viés: per-user fica grosseiro, macro destila padrão (não repete linha)
- Dado por-opção é muito mais rico que o booleano por-geração pro futuro

**Gatilho de reavaliação:**
- Volume de 🔥 suficiente + oferta validada → construir o motor macro (com pipeline de anonimização/LGPD)
- Se quiserem feedback "depois da reação dela" → construir histórico rolante por crush (pós-MVP)
- Se o macro provar que certos padrões funcionam muito → dobrar no system prompt como calibração fixa

---

## ADR-031: Modelo de geração — Gemini 3.5 Flash substitui 2.5 Flash

**Data:** 2026-05-31
**Status:** Aceita (evolui ADR-006)
**Camada:** IA

**Contexto:**
Testes manuais (ADR-007) mostraram o **Gemini 2.5 Flash** gerando respostas **repetitivas e às vezes carentes** (3 opções variando pouco entre si; tom "queria estar aí..."). Comparando o mesmo prompt ("acabei de sair do banho", intensidade 4, ficante) no 2.5-flash vs **3.5-flash**:
- 3.5 variou de verdade (3 ângulos distintos), tom mais afirmativo/postura, mantendo permissividade.
- 2.5 repetiu a mesma jogada ("que pena não estar aí" 3x) com tom mais carente.

Verificado via API + via o SDK do app (`@google/generative-ai`): 3.5-flash existe na key, aceita `BLOCK_NONE` nas 4 categorias, gera explícito quando pedido, e `response.text()` devolve JSON válido (o "thinking" do 3.x não quebra o parse).

**Decisão:**
Trocar o modelo de `gemini-2.5-flash` → `gemini-3.5-flash` em `lib/gemini.ts` (todas as intensidades). Mantém systemInstruction (v3), `responseMimeType: application/json`, `BLOCK_NONE`, temperatura escalonada e multimodal.

**Custo (honesto):**
- 2.5-flash: $0,30 input / $2,50 output por 1M.
- 3.5-flash: **$1,50 input / $9,00 output** por 1M (output inclui tokens de "thinking").
- ≈ 5x input, 3,6x output; com thinking, **~5-8x mais caro por geração** (estimativa ~R$ 0,15-0,18/geração vs ~R$ 0,02-0,03 do 2.5).

**Justificativa:**
- Princípio fundador: validar a oferta rápido. Qualidade da resposta afeta **conversão e refund** diretamente — vale mais que economizar centavos no volume baixo da validação.
- Mantém o pilar comercial (permissividade BLOCK_NONE pro conteúdo adulto), que modelos frontier tipo Claude NÃO mantêm (recusariam o explícito).

**Alavancas pra escala (aplicar ANTES de tráfego pago pesado — gatilho de reavaliação):**
1. **Context caching** do system prompt v3 (~7k tokens fixos) → corta o grosso do input.
2. **Limitar/desligar o "thinking"** se o SDK permitir → corta o output inflado.
3. **Híbrido:** 3.5 nas intensidades 4-5, 2.5 nas 1-3 (qualidade onde importa).
4. Reduzir limite **200→50 gerações/dia** (já pendente no ROADMAP).

**Gatilho de reavaliação:**
- Custo médio por venda/assinante exceder o orçamento de margem → aplicar alavancas 1-4 OU voltar pro híbrido/2.5
- Latência do thinking incomodar usuário → cap de thinking ou voltar 2.5
- Migração pra assinatura → reavaliar limite diário + plano vs custo de inferência (ver discussão de unit economics)

---

## ADR-032: Onboarding guiado em 5 telas (Marco 6)

**Data:** 2026-05-31
**Status:** Aceita
**Camada:** Produto — UX / Onboarding

**Contexto:**
O ROADMAP (Marco 6) previa onboarding em **6 telas**. Decisão: **5 telas** — duas do roadmap (perfil básico + situação) viram uma só, porque são chips rápidos e menos passos = mais gente termina (a skill `produto-dopaminergico` prioriza WOW em 60s, fricção mínima). Antes disso, o 1º acesso caía numa home sem graça apontando pro /perfil.

**Decisão — as 5 telas (rota `/onboarding`):**
1. **bora te conhecer** — idade, situação relacional, tempo solteiro (condicional), voltando ao mercado, filhos.
2. **o que quer melhorar** — áreas (multi) + objetivo. Ao concluir, **salva o perfil**.
3. **tua primeira crush** — nome, tipo de relação, idade (opcional), contexto. Cria a crush.
4. **cola algo que ela mandou** — mensagem + intensidade + intenção, com botão "usar um exemplo" pra quem não tem caso real.
5. **demonstração ao vivo** — chama a geração e mostra as 3 opções (reusa o componente `Resultado`) + "tá calibrada. esse é teu app." → botão "entrar no app".

**Reúso (sem duplicar lógica):** `updateUserProfile` (perfil), `createCrush` (crush), `gerarResposta` (demo), `Resultado` (render). O wizard é um Client Component com estado por passo (sem react-hook-form, pra evitar os pitfalls de form/base-ui).

**Decisão-chave — quando marcar `onboarding_completed`:**
Marcado **`true` ao salvar o perfil (passo 2)**, NÃO no fim. Motivo: a demonstração do passo 5 chama `gerarResposta`, que **exige perfil calibrado** (`onboarding_completed`). Se marcasse só no fim, a demo seria recusada. Ter **perfil sem crush é um estado válido e usável** (o app trata "sem crush" com empty state), então não fica "meio quebrado" se o cara abandonar entre os passos 2 e 5.

**Roteamento (gating):**
- Home (`/`): se `!onboarding_completed` → `redirect('/onboarding')`.
- `/onboarding`: se `onboarding_completed` → `redirect('/')` (evita reonboarding).
- `/gerar`: se `!onboarding_completed` → `redirect('/onboarding')` (antes ia pro /perfil).
- Sem loop: flag false manda pro onboarding; flag true tira de lá.
- Edge case aceito: se o cara der **refresh no meio do wizard** (após o passo 2, flag já true), o guard manda ele pro app — que é usável (calibrado, cria crush e gera normal). Não finaliza a demo guiada, mas não quebra.

**Visual:** cru/funcional (mesmo estilo do resto). A passada de design entra depois (o humano tá produzindo a direção visual).

**Validação:** `npx tsc --noEmit` OK, `npx eslint` limpo, `npm run build` verde (rota `/onboarding` gerada). Sem migration (usa tabelas/colunas existentes).

**Gatilho de reavaliação:**
- Refresh-no-meio gerar crush duplicada incomodar → persistir step do wizard (localStorage) ou guardar progresso no banco
- Métrica de conclusão baixa → cortar/fundir passos ou mover captura pro próprio uso
- Passada de design → reestilizar as 5 telas junto com o resto

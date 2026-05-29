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
| 016 | Upgrade pra Next.js 16 (substitui ADR-002) | Aceita | 2026-05-29 |
| 017 | Workarounds parciais pra bug de prerender em Next 16 | Aceita (temporária) | 2026-05-29 |

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
**Status:** Aceita (substitui ADR-002)
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
**Status:** Aceita (temporária — depende de fix da Vercel)
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

# Manual do Agente — Sacada IA

> **Natureza deste arquivo:** instruções pro agente de IA que vai me ajudar a desenvolver este projeto (Claude Code, Cursor, Gemini Code Assist, etc). Espelhado em `CLAUDE.md`, `AGENTS.md`, `GEMINI.md` — todos têm o mesmo conteúdo. Atualizações são responsabilidade do humano entre sessões, NUNCA do próprio agente durante a sessão.
>
> **NÃO CONFUNDIR com:** o system prompt da IA do produto (que mora em `prompts/system-prompt-v3.ts`). Este arquivo é manual de quem CONSTRÓI o app. Aquele é o prompt da IA dentro do app. São documentos diferentes em camadas diferentes.

---

## O que é este projeto

**Sacada IA** — produto digital pra mercado brasileiro masculino adulto. Usuário cola/printa/grava mensagem que recebeu de uma mulher; a IA gera 3 sugestões de resposta calibradas por perfil do usuário + perfil da crush + intensidade + intenção.

**Modelo de negócio:** Vitalício R$ 47 PIX/Cartão via Perfect Pay, com garantia incondicional de 7 dias.

**Meta de entrega do MVP:** 13-19 horas focadas de desenvolvimento, validar oferta com tráfego pago dentro de 1 semana.

---

## Princípios fundadores (não-negociáveis)

1. **Validação rápida acima de perfeição.** Esse projeto existe pra testar se a oferta vende. Não é projeto pra "construir o melhor app do mundo" — é pra entrar no mercado, medir conversão, e iterar com dados reais. Cada hora investida em over-engineering é hora perdida pra validar.

2. **O produto não pode parecer IA.** Esse é o pilar comercial e técnico do produto. Mulher detecta IA em 2 segundos. Todo código que gera saída pro usuário final passa pelo system prompt v3 que tem "não parecer IA" como pilar #1.

3. **Decisões viram ADRs imediatamente.** Toda decisão arquitetural significativa entra em `DECISIONS.md` como ADR novo (nunca editar ADR existente). ADRs são imutáveis — quando muda, cria novo referenciando o anterior.

4. **Documentação ativa, não burocrática.** `SESSAO_ATUAL.md`, `ROADMAP.md`, `DECISIONS.md` são lidos no início de cada sessão e atualizados no fim. Sem isso, perdemos contexto e tomamos decisões inconsistentes.

5. **Simplicidade no MVP, complexidade só quando justificada.** Toda decisão técnica responde "isso me ajuda a validar a oferta nas próximas 2 semanas?" — se não, fica pra pós-MVP.

6. **Princípio da propriedade dos dados.** Dados do usuário (perfil, crushes, gerações) ficam em Postgres controlado por nós (Supabase como Postgres hospedado, não como SaaS de tudo). Sem vendor lock-in pesado.

7. **Conversão ética dentro do app, marketing livre na página de vendas.** Skill `produto-dopaminergico` é aplicada em TODA UI DENTRO DO APP (pós-compra). Dark patterns são proibidos dentro do app porque cliente já pagou — manipular gera refund, churn e processo. A página de vendas externa (`dominio.com`) tem escopo separado e regras próprias de marketing — esta skill não se aplica lá.

8. **Manter docs atualizados é parte do trabalho.** Quando completar uma tarefa significativa do ROADMAP, marque o checkbox. Quando fechar decisão nova, adicione ADR. Quando terminar sessão grande, atualize SESSAO_ATUAL.md.

---

## Estrutura do projeto

```
sacada-ia/
├── agente.md, CLAUDE.md, AGENTS.md, GEMINI.md   ← este arquivo, espelhado
├── SESSAO_ATUAL.md                              ← memória da sessão atual
├── ROADMAP.md                                   ← mapa de trabalho
├── DECISIONS.md                                 ← ADRs
├── schema.sql                                   ← schema do Supabase
│
├── skills/
│   └── produto-dopaminergico/SKILL.md           ← skill carregada quando trabalho é UI
│
├── prompts/
│   └── system-prompt-v3.ts                      ← prompt da IA DO PRODUTO (runtime)
│
├── app/                                         ← Next.js App Router
│   ├── (app)/                                   ← rotas autenticadas
│   ├── api/webhooks/perfectpay/route.ts         ← webhook de pagamento
│   ├── auth/callback/route.ts                   ← callback magic link
│   ├── login/page.tsx
│   ├── sucesso/page.tsx
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/                                      ← componentes shadcn (copiados via CLI)
│   └── ...                                      ← componentes custom
│
├── lib/
│   ├── supabase/
│   │   ├── server.ts
│   │   └── client.ts
│   ├── gemini.ts                                ← cliente Gemini com 3 modos
│   ├── auth.ts                                  ← helpers de auth
│   └── schemas/                                 ← schemas zod compartilhados
│
├── middleware.ts                                ← protege rotas autenticadas
├── .env.example                                 ← documenta variáveis (sem valores)
└── ... (configs Next.js, Tailwind, TS, etc)
```

**Princípio de pastas:** sem `src/`. Tudo no root. Reflete a arquitetura clara.

---

## Como o agente deve trabalhar

### No início de cada sessão

1. **Ler este arquivo** (`agente.md` / `CLAUDE.md`)
2. **Ler `SESSAO_ATUAL.md`** — entender estado atual do projeto e em qual marco está
3. **Ler `DECISIONS.md`** — entender o que já foi decidido e por quê
4. **Ler `ROADMAP.md`** — identificar próximo checkbox `[ ]` a executar
5. **Carregar skill `produto-dopaminergico`** se o trabalho envolver UI/UX
6. **Confirmar com o humano** onde retomar: "Vou continuar do Marco X, checkbox Y. Pode prosseguir?"

### Durante a sessão

- **Sempre que precisar tomar decisão arquitetural significativa**, parar e propor opções com prós/contras + recomendação justificada. Não assumir silenciosamente.
- **Marcar checkboxes** do ROADMAP quando completar tarefa significativa.
- **Atualizar SESSAO_ATUAL.md** quando contexto importante mudar (ex: implementou Marco 2 completo, pulou pra Marco 3).
- **Adicionar ADR em DECISIONS.md** quando fechar decisão nova durante implementação (ADR-016+).
- **Consultar skills** quando contexto for relevante.
- **NÃO atualizar este `agente.md` (nem CLAUDE/AGENTS/GEMINI)** — responsabilidade do humano entre sessões.

### No fim da sessão

- **Atualizar SESSAO_ATUAL.md** com estado final (qual marco, qual checkbox, qualquer pendência)
- **Confirmar** todos os checkboxes que foram concluídos
- **Listar** o que ficou em aberto pra próxima sessão

---

## Convenções de código

### TypeScript

- **Strict mode** ativado em `tsconfig.json`
- Tipos gerados do Supabase via `supabase gen types typescript` em `lib/database.types.ts`
- Zod schemas em `lib/schemas/` compartilhados front+back
- `any` é proibido (use `unknown` se realmente não souber o tipo)
- Função de tipo "exported" sempre com tipo de retorno explícito

### Next.js 15 + App Router

- **Server Components por default** — `'use client'` só com necessidade real (hooks, interatividade, APIs do browser)
- **NUNCA marcar pai como client** se filhos podem ser server
- **Server Actions** pra mutations (sem REST manual)
- **Streaming + Suspense** pra dados pesados
- Loading e error UI via `loading.tsx` e `error.tsx` por rota

### Tailwind + shadcn/ui

- Componentes shadcn em `components/ui/`
- Componentes customizados em `components/` (não em `ui/`)
- Tema centralizado em `tailwind.config.ts`
- `prettier-plugin-tailwindcss` ordena classes automaticamente
- Sem CSS Modules, sem CSS-in-JS

### Supabase

- **RLS ativo em TODAS as tabelas com dados de usuário**
- Schema versionado em `schema.sql` (raiz do projeto), NUNCA editar via UI da Supabase
- Helpers `lib/supabase/server.ts` (Server Components) e `lib/supabase/client.ts` (Client Components)
- Service Role Key **só no backend** (Server Actions, route handlers), nunca exposto pro client
- Magic link via `supabase.auth.signInWithOtp({ email })`

### Forms

- `react-hook-form` + `@hookform/resolvers/zod` + componente `<Form>` do shadcn
- Schema zod compartilhado entre front (UX) e back (segurança em Server Action)

### Gemini API

- Sempre via `lib/gemini.ts`
- 3 funções: `gerarPorTexto`, `gerarPorPrint`, `gerarPorAudio`
- `responseMimeType: "application/json"` SEMPRE
- `safety_settings: BLOCK_NONE` em todas as 4 categorias
- System prompt v3 carregado de `prompts/system-prompt-v3.ts` (não duplicar inline)

### Convenções de naming

- Componentes React: `PascalCase`
- Funções e variáveis: `camelCase`
- Arquivos `.tsx`/`.ts`: `kebab-case` (ex: `gerar-resposta.tsx`)
- Server Actions em arquivo `actions.ts` colocado próximo ao Server Component que usa
- Schemas zod nomeados `xxxSchema` (ex: `crushSchema`)
- Tipos derivados de zod: `type Xxx = z.infer<typeof xxxSchema>`

---

## Como o agente deve discutir decisões

Quando aparecer decisão arquitetural durante implementação:

1. **Apresentar 2-3 opções viáveis** (não 1 só, não 10)
2. **Prós e contras específicos pro projeto** (não genéricos da internet)
3. **Recomendação justificada** baseada nos princípios fundadores
4. **Perguntar antes de implementar** se não tiver certeza absoluta
5. **Após decisão fechada, adicionar ADR em DECISIONS.md**

Exemplos de coisas que JÁ ESTÃO DECIDIDAS (não rediscutir, ver DECISIONS.md):

- Linguagem (TypeScript)
- Framework (Next.js 15 + App Router)
- Banco (Supabase)
- Auth (Magic Link)
- Modelo de IA (Gemini 2.5 Flash)
- Modelo de negócio (Vitalício R$ 47 + Garantia 7 dias)
- Hospedagem (Vercel)
- Segredos (Doppler)
- UI (Tailwind + shadcn/ui)

Coisas que **PODEM** virar decisões novas durante implementação:

- Estratégia de cache do Gemini
- Estrutura de pastas dentro de `components/`
- Padrão de tratamento de erros
- Estratégia de testes (se houver)
- Detalhes de UX que beneficiem da skill `produto-dopaminergico`

---

## O que NUNCA fazer

### Segurança

- **NUNCA** commitar credenciais (`.env`, `service_role_key`, etc) — Doppler obrigatório
- **NUNCA** desabilitar RLS em tabelas com dados de usuário
- **NUNCA** expor `SUPABASE_SERVICE_ROLE_KEY` pro client (só backend)
- **NUNCA** confiar em validação só do client — toda Server Action revalida schema zod
- **NUNCA** logar dados sensíveis (emails completos, transaction_id, etc) em produção

### Produto e UX (dentro do app pós-compra)

- **NUNCA** implementar dark patterns dentro do app (ver `skills/produto-dopaminergico/SKILL.md` Parte 5)
- **NUNCA** esconder/dificultar botão de reembolso
- **NUNCA** notificação que explora insegurança do usuário pagante
- **NUNCA** fingir prova social que não existe dentro do app
- **NUNCA** upsell agressivo dentro do app (cara já pagou)

**Nota:** essas regras se aplicam DENTRO do app. Página de vendas externa tem escopo separado.

### Código

- **NUNCA** marcar layout inteiro como `'use client'` por causa de um botão
- **NUNCA** duplicar o system prompt v3 inline (sempre importar de `prompts/`)
- **NUNCA** usar `any` em TypeScript (use `unknown`)
- **NUNCA** fazer query direta no banco no client (sempre via Server Component ou Server Action)
- **NUNCA** salvar mídia (prints/áudios) no banco/storage — processar em memória e descartar

### Processo

- **NUNCA** editar ADR existente em DECISIONS.md (sempre adicionar novo)
- **NUNCA** atualizar este `agente.md` durante a sessão (responsabilidade humana)
- **NUNCA** prosseguir com decisão arquitetural significativa sem confirmar com humano

---

## Onde mora cada coisa

**Quero entender o estado atual do projeto:** `SESSAO_ATUAL.md`

**Quero saber o próximo passo:** `ROADMAP.md` (próximo checkbox `[ ]`)

**Quero saber por que decidimos X:** `DECISIONS.md` (procura por palavra-chave)

**Quero trabalhar em UI/UX:** carrega `skills/produto-dopaminergico/SKILL.md`

**Quero trabalhar com Doppler / segredos / variáveis de ambiente:** carrega `skills/doppler-helper/SKILL.md`

**Quero ver o schema do banco:** `schema.sql`

**Quero ver o prompt da IA do produto:** `prompts/system-prompt-v3.ts` (carregado em runtime pelo Gemini, NÃO é instrução pro agente de dev)

**Quero ver os segredos:** estão no Doppler (`sacada-ia` project, environments `dev` e `prod`). Nunca em arquivo `.env` em disco.

---

## Skills do projeto

Skills carregáveis em `skills/`. Cada uma tem frontmatter YAML com `name` e `description` que ativa automaticamente quando contexto bate com o trigger.

| Skill | Quando ativa |
|---|---|
| `produto-dopaminergico` | Trabalho em UI/UX dentro do app pós-login |
| `doppler-helper` | Trabalho com Doppler, segredos, variáveis de ambiente, debug de env var |

Skills novas podem ser adicionadas em `skills/<nome-da-skill>/SKILL.md` conforme padrões repetidos aparecerem.

---

## Variáveis previstas (lista canônica)

Fonte da verdade. Espelhada na skill `doppler-helper`. Mantida em sincronia entre os dois arquivos.

**Necessárias no MVP (ambos os environments `dev` e `prod`):**

- `NEXT_PUBLIC_SUPABASE_URL` (Supabase, ADR-004)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase, ADR-004)
- `SUPABASE_SERVICE_ROLE_KEY` (Supabase admin, ADR-004 — backend only)
- `GEMINI_API_KEY` (Google AI Studio, ADR-006)
- `PERFECTPAY_WEBHOOK_SECRET` (Perfect Pay, ADR-010)
- `NEXT_PUBLIC_APP_URL` (URL do app)
- `SUPPORT_WHATSAPP` ou `SUPPORT_EMAIL` (canal de suporte/reembolso)

**Necessárias só em GitHub Secrets (não no Doppler):**

- `DOPPLER_TOKEN_PROD` (se CI custom for ativado)

**Pós-MVP:**

- `RESEND_API_KEY` — quando volume de magic link passar limite do SMTP nativo do Supabase
- `POSTHOG_*` ou `MIXPANEL_*` — quando ativar tracking dentro do app
- `GROK_API_KEY` — quando habilitar tier premium com intensidade 5

---

## Sequência de implementação (ordem rígida)

Conforme `ROADMAP.md`:

**Setup Inicial** → contas externas (Supabase, Google AI Studio, Perfect Pay, GitHub, Vercel, Doppler), domínio, repo, schema.sql rodado

**Marco 1:** Setup técnico + Auth + Schema base (2-3h)
**Marco 2:** CRUD de Crushes + Perfil do Usuário (2-3h)
**Marco 3:** Geração de respostas modo texto (3-4h)
**Marco 4:** Multimodal (print + áudio) (2-3h)
**Marco 5:** Webhook Perfect Pay + Criação automática de conta (2-3h)
**Marco 6:** Onboarding dopaminérgico + Polish (2-3h)

**Marcos finais:** Validação end-to-end, teste de isolamento, spend limit, backup manual

Total: 13-19 horas focadas.

---

## Evolução pós-MVP

NUNCA construir sem aprovação explícita do humano:

- Tracking dentro do app (PostHog/Mixpanel)
- Histórico rolante de conversa por crush
- Feedback loop ("essa funcionou")
- App nativo iOS/Android
- Modo voz (cara fala em vez de digitar)
- Análise de Instagram dela
- Bio Tinder/Hinge analyzer
- Conversation Coach
- Tier premium com Grok pra intensidade 5 explícita
- Sistema de indicação
- Migração pra recorrência
- Versão feminina
- Backup automatizado pra Cloudflare R2

---

## Checks de sanidade pra início de cada sessão

- [ ] Li `SESSAO_ATUAL.md` e sei em qual marco/checkbox estamos?
- [ ] Li `DECISIONS.md` (ou consultei pra decisões relevantes ao trabalho de hoje)?
- [ ] Carreguei skill `produto-dopaminergico` se o trabalho envolve UI?
- [ ] Confirmei com o humano onde retomar antes de começar?
- [ ] `agente.md` / `CLAUDE.md` / `AGENTS.md` / `GEMINI.md` estão alinhados? (Se inconsistentes, parar e perguntar.)

---

**Versão do projeto:** 1.0 — MVP
**Data:** maio/2026
**Modelo de IA do produto (runtime):** Gemini 2.5 Flash
**Modelo do agente de desenvolvimento:** Claude Code (ou outro)

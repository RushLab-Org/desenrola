# Sessão de Planejamento — Sacada IA (atualizado em 2026-05-29)

**Estado:** Setup inicial 100% completo, **zero código de produto escrito** (greenfield) — pronto pra começar Marco 1
**Repositório:** `RushLab-Org/Sacada-ia` (GitHub privado)
**Meta de entrega:** MVP funcional em 12-18h focadas no Claude Code

---

## Status do workflow

| Fase | Estado |
|---|---|
| 1. Initial Understanding | ✅ Completa |
| 2. Design Arquitetural | ✅ Completa — 15 ADRs fechados |
| 3. Setup Inicial (contas + Doppler + repo + schema) | ✅ Completa |
| 4. Implementação (Marcos 1-6) | 🚀 Pronto pra iniciar pelo Marco 1 |

---

## O que JÁ ESTÁ feito (não refazer)

### Contas externas configuradas
- **Supabase:** projeto `nqhtxsnmoucyzilhmmez` em SP, schema rodado, RLS ativo (10 policies totais nas 4 tabelas), Auth com magic link, Confirm email OFF, Site URL `http://localhost:3000`, Redirect `http://localhost:3000/auth/callback`
- **Google AI Studio:** `GEMINI_API_KEY` gerada em Free Tier (não foi configurado spend limit ainda — atenção)
- **Perfect Pay:** produto "Sacada IA — Acesso Vitalício" R$ 47 criado, PIX + Cartão habilitados, garantia 7 dias, "Área de Membros Externa", webhook configurado com URL placeholder via `webhook.site`, Public Token (`PERFECTPAY_WEBHOOK_SECRET`) copiado pro Doppler

### Repositório e ambiente
- **GitHub:** repo `RushLab-Org/Sacada-ia` privado, branch `main`, commit inicial com 13 arquivos pushed
- **Doppler:** projeto `sacada-ia`, config `dev` com 7 variáveis, login local feito, `doppler setup` executado
- **Vercel:** ainda NÃO conectada (fazer depois do Marco 1)
- **Domínio:** ainda NÃO comprado (não bloqueia desenvolvimento)

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

## Decisões PENDENTES

**Nenhuma decisão arquitetural pendente.** Tudo cravado em DECISIONS.md.

**Setup operacional:** 100% completo. Tudo já está pronto pra começar Marco 1.

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

**Marco 1 — Setup técnico + Auth + Schema base** (2-3h).

Checklist específico em ROADMAP.md. Resumo:
- `npx create-next-app@latest` com TypeScript + Tailwind + App Router (sem `src/`)
- Instalar dependências (Supabase SSR, Gemini SDK, react-hook-form, zod, shadcn)
- Criar `lib/supabase/server.ts` e `lib/supabase/client.ts`
- Criar `app/login/page.tsx` com input de email + magic link
- Criar `app/auth/callback/route.ts`
- Criar `middleware.ts` protegendo `(app)/*`
- Criar `lib/auth.ts` com `getUser()` e `requireUser()`
- Testar fluxo: digitar email → receber magic link → entrar logado

**Sequência completa dos marcos seguintes:**
2. Marco 2 (CRUD de crushes + Perfil do usuário) — 2-3h
3. Marco 3 (Geração de respostas modo texto) — 3-4h
4. Marco 4 (Multimodal: print + áudio) — 2-3h
5. Marco 5 (Webhook Perfect Pay + criação automática de conta) — 2-3h
6. Marco 6 (Onboarding dopaminérgico + Polish) — 2-3h

Total restante: 13-19 horas focadas.

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

# Guia de Deploy Vercel — Sacada IA

> Marco 5 (webhook Perfect Pay) implementado em código, mas **só funciona end-to-end com URL pública**. Este guia te leva do "tudo local" pro "tudo no ar com .vercel.app temporário".
>
> **Tempo estimado:** 30-45 min total (sem contar propagação de DNS — não tem DNS ainda).

---

## Pré-checagem antes de começar

- [ ] Repo `RushLab-Org/sacada-ia` no GitHub (ok, já tem)
- [ ] `npm run build` localmente passa (✅ — último build verde)
- [ ] As 3 migrations SQL acumuladas (ADR-020, 021, 022) **JÁ FORAM RODADAS** no Supabase. Se não, roda agora (estão no `SESSAO_ATUAL.md` seção "Decisões PENDENTES"). Sem isso o app deploya mas dá erro 500 em várias telas.
- [ ] Confirmar se Doppler tem **config `prod`** populado. Se só tem `dev`, criar prod e copiar valores.

### Como verificar Doppler prod

```bash
doppler secrets --only-names --config prod
```

Esperado: as mesmas 7+ variáveis que o dev tem. Se não:

```bash
# Listar do dev
doppler secrets download --no-file --format env --config dev > /tmp/dev.env

# Setar tudo no prod (revisa cada uma antes — IDEALMENTE produção tem valores diferentes)
doppler secrets set --config prod $(cat /tmp/dev.env | tr '\n' ' ')
```

⚠️ **Recomendado:** em prod, usar projeto Supabase SEPARADO do dev (princípio do ADR-004). Mas pra MVP rápido, ok usar o mesmo Supabase com env vars iguais — só mexer quando volume justificar.

---

## Passo 1 — Criar conta Vercel (se não tiver)

1. Acessa **https://vercel.com**
2. Login via **Continue with GitHub** (usa a conta do RushLab-Org)
3. Aceita permissões pra acessar repos

---

## Passo 2 — Importar projeto

1. Dashboard Vercel → **Add New… → Project**
2. Em "Import Git Repository", procura **`sacada-ia`** → clica **Import**
3. Configurações iniciais:
   - **Framework Preset:** Next.js (deve detectar automaticamente)
   - **Root Directory:** `./` (padrão)
   - **Build Command:** `next build` (padrão)
   - **Output Directory:** `.next` (padrão)
   - **Install Command:** `npm install` (padrão)
4. **NÃO clica Deploy ainda** — precisa configurar env vars primeiro

---

## Passo 3 — Configurar Environment Variables (integração Doppler — recomendado)

### Opção A — Integração nativa Doppler ↔ Vercel (preferida)

1. Vai em **dashboard.doppler.com** → projeto `sacada-ia`
2. Sidebar esquerda → **Integrations**
3. Procura **Vercel** → clica **Add**
4. Autoriza acesso à conta Vercel
5. Configuração da integração:
   - **Project:** sacada-ia (o que você acabou de importar)
   - **Doppler Config → Vercel Environment:**
     - `prod` → `Production`
     - `dev` → `Preview` (opcional — pra branches)
6. Clica **Setup Integration**
7. Doppler sincroniza env vars automaticamente

### Opção B — Manual (caso integração Doppler falhe)

Na tela de "Configure Project" no Vercel, expande **Environment Variables** e adiciona uma por uma:

```
NEXT_PUBLIC_SUPABASE_URL          = (valor do Doppler)
NEXT_PUBLIC_SUPABASE_ANON_KEY     = (valor do Doppler)
SUPABASE_SERVICE_ROLE_KEY         = (valor do Doppler) — selecionar "Production" SÓ
GEMINI_API_KEY                    = (valor do Doppler)
PERFECTPAY_WEBHOOK_SECRET         = (valor do Doppler) — selecionar "Production" SÓ
NEXT_PUBLIC_APP_URL               = PLACEHOLDER por enquanto (vai trocar depois do primeiro deploy)
NEXT_PUBLIC_SUPPORT_WHATSAPP      = teu número de WhatsApp suporte (ex: 5547999999999)
```

---

## Passo 4 — Primeiro deploy

1. Volta pra Vercel
2. Clica **Deploy**
3. Aguarda build (~2-5 min)
4. Se der erro: copia o log de erro e me manda
5. Sucesso: Vercel gera URL tipo `sacada-ia-xxxxx.vercel.app`
6. **Anota essa URL** — vai usar nos próximos passos

---

## Passo 5 — Atualizar `NEXT_PUBLIC_APP_URL`

Agora que você tem a URL real:

### Via Doppler:

```bash
doppler secrets set NEXT_PUBLIC_APP_URL="https://sacada-ia-xxxxx.vercel.app" --config prod
```

(substitui pelo seu URL real)

### Disparar redeploy pra pegar nova env var:

- Vercel dashboard → projeto → Deployments → clica nos `...` do último deploy → **Redeploy**
- Ou commit qualquer coisa no `main` → push → deploy auto

---

## Passo 6 — Atualizar Supabase Auth Redirect URLs

Sem isso, magic link vai redirecionar pra `http://localhost:3000` mesmo em produção.

1. Acessa **app.supabase.com** → projeto `nqhtxsnmoucyzilhmmez`
2. Sidebar → **Authentication → URL Configuration**
3. **Site URL:** muda pra `https://sacada-ia-xxxxx.vercel.app`
4. **Redirect URLs:** adiciona `https://sacada-ia-xxxxx.vercel.app/auth/callback` (mantém o `http://localhost:3000/auth/callback` pra dev)
5. Salva

---

## Passo 7 — Atualizar Webhook Perfect Pay

Hoje aponta pra `webhook.site` placeholder.

1. Acessa painel **Perfect Pay** → produto Sacada IA → **Notificações / Webhooks**
2. Encontra a URL placeholder do `webhook.site`
3. Troca por: `https://sacada-ia-xxxxx.vercel.app/api/webhooks/perfectpay`
4. Salva

---

## Passo 8 — Teste end-to-end real

Agora dá pra validar Marco 5:

1. **Simular compra** na Perfect Pay em modo sandbox (se eles tiverem) — OU
2. **Fazer uma compra real de teste** (R$ 47, depois pede reembolso pra você mesmo)
3. **Verificar logs Vercel:**
   - Dashboard → projeto → **Functions** ou **Logs** (Real-time)
   - Procura pela request POST em `/api/webhooks/perfectpay`
   - Confirma status code 200 + body de retorno (`action: "activated"`)
4. **Verificar Supabase:**
   - Authentication → Users — deve ter user novo com teu email
   - Table Editor → profiles — esse user deve estar com `subscription_status='active'`
5. **Verificar email:**
   - Deve chegar magic link na caixa
   - Clica → cai em `/` autenticado
6. **Solicitar reembolso pelo app:** `/configuracoes` → botão "solicitar reembolso" → abre WhatsApp pro suporte
7. **Processar reembolso manual na Perfect Pay:**
   - Painel Perfect Pay → vendas → tua transação → "Estornar"
8. **Verificar que webhook revogou acesso:**
   - Logs Vercel → POST com `action: "refunded"`
   - Supabase profiles → teu user agora com `subscription_status='refunded'`
9. **Verificar que app bloqueia user reembolsado:**
   - TODO Marco 5 (proxy middleware ainda deixa passar — checagem de subscription_status está marcada como `TODO Marco 5` em `middleware.ts`). **Esse check ainda não foi implementado** porque dependia de testar end-to-end. Adicionar quando confirmar fluxo acima.

---

## Passo 9 — Limpeza pós-deploy

- [ ] Remover env var `NEXT_PUBLIC_APP_URL=http://localhost:3000` do Doppler `prod` se ainda estiver placeholder
- [ ] Confirmar que `dev` continua apontando pra localhost (não muda)
- [ ] Adicionar URL `.vercel.app` no `SESSAO_ATUAL.md` pra referência
- [ ] Atualizar este `DEPLOY_VERCEL.md` com URL real (ou apagar arquivo depois do domínio definitivo)

---

## Pra quando comprar domínio definitivo

1. Vercel dashboard → projeto → **Settings → Domains** → adiciona `app.sacadaia.com.br` (ou similar)
2. Vercel mostra DNS records pra configurar no provider (registro.br ou Cloudflare)
3. Aguarda propagação DNS (15min - 24h)
4. Quando ativo, atualiza:
   - `NEXT_PUBLIC_APP_URL` no Doppler prod
   - Supabase Site URL + Redirect URLs
   - Perfect Pay webhook URL
5. Vercel mantém URL `.vercel.app` funcionando junto (redundância)

---

**Quando terminar todos os passos**, me avisa qual a URL final e eu adiciono o middleware check de subscription pra fechar Marco 5 100% (TODO comentado em `middleware.ts:58`).

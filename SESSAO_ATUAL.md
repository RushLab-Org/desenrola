# Sessão atual — Sacada IA (atualizado em 2026-06-02)

**Estado:** App funcional em produção com **tema visual Onyx & Brasa**, **login híbrido**, **gate de assinatura**, **onboarding de 5 telas** e **geração calibrada** (Gemini 3.5 Flash, **agora com fallback pro 2.5** em sobrecarga). Nesta sessão: **landing page portada** pro projeto (`app/(marketing)/lp`) com **demo interativo ligado na IA real**. Falta a passada de design **estrutural** em algumas telas, o teste end-to-end do Marco 5 (compra real), e o link de checkout na landing.

**Repositório:** `RushLab-Org/sacada-ia` (GitHub privado)
**URL produção:** `https://sacada-ia.vercel.app`
**Branch:** `main` (deploy automático no push)

---

## 🌅 PRA RETOMAR — começar aqui

A última grande frente é a **passada de design ESTRUTURAL** (a fundação visual já está no ar; falta a estrutura nova de cada tela pra bater 100% com os mockups aprovados):

1. **Lista de mulheres** (`/crushes`): avatar (inicial em círculo brasa), stats por mulher (gerações / vitórias / última), "desde X dias", trecho do contexto, tag de relação, + card "DICA".
2. **Perfil** (`/perfil`): barra de calibração visual (%).
3. **Resultado**: virar uma tela "3 sugestões" com a mensagem dela citada no topo (hoje aparece embaixo do form).
4. **Gerar** (`/gerar`): labels em MAIÚSCULO, seletor de mulher com avatar + tag + chevron, print/áudio como 2 botões.
5. **Header/nav** do `(app)/layout`: hoje é logo + links; o mockup usa logo + menu hamburguer.

Mockups aprovados pelo humano (login, dashboard, gerar, resultado, mulheres, perfil) — o design system completo está documentado no **ADR-033**.

---

## ✅ Feito nesta sessão (2026-06-02)

Tudo commitado e no ar. ADRs novos: 035, 036, 037.

- **Landing page portada (ADR-035, ADR-036):** a LP feita no Claude design (`Sacada-Landing-PV2.html`, um bundle auto-extraível) foi extraída e portada pro projeto em `app/(marketing)/lp/page.tsx` — HTML→JSX via script, **Server Component** (SEO). Fontes via `next/font` (os 51 @font-face/17 woff2 descartados). CSS "Onyx & Brasa" à mão em `app/(marketing)/landing.css`, **escopado sob `.lp-root`** (CSS no App Router é global). `/lp` liberado no `middleware.ts`.
- **Demo interativo ligado na IA real (ADR-036):** `app/(marketing)/_components/demo.tsx` (client) + Server Action pública `app/(marketing)/actions.ts` chamando `gerarPorTexto` com perfil/crush genéricos. **Só texto**; print/áudio mostram **popup "exclusivo no app"**. **Limite de 2 gerações** por pessoa (cookie httpOnly + rate limit IP best-effort).
- **Fallback de modelo (ADR-037):** `lib/gemini.ts` ganhou `generateResilient()` — `gemini-3.5-flash` primário com retry, caindo pro `gemini-2.5-flash` em 503/sobrecarga. Descoberto ao validar o demo: o 3.5 estava dando 503 sustentado (derrubava TODA geração do app).
- **Bundle bruto da landing** (`Sacada-Landing-PV2.html`, 721KB) adicionado ao `.gitignore` (já portado, não precisa versionar).

**Landing acessível em produção:** `https://sacada-ia.vercel.app/lp` (path `/lp` por ora; vira `/` no domínio de marketing via rewrite por hostname quando o domínio for configurado).

---

## ✅ Feito na sessão anterior (2026-05-31)

Tudo commitado e no ar. ADRs novos: 026 a 034.

- **Entrada unificada (ADR-026):** removidas as tabs Texto/Print/Áudio; um bloco só (escrever / anexar print / gravar-enviar áudio). Corrigido o crash que derrubava print/áudio (`<FormItem>`/`<FormLabel>` fora de `<FormField>`).
- **Calibração da IA (ADR-027, ADR-028):** REGRA ZERO (output literal, sem 3ª pessoa), few-shot de intensidade 3→4→5, registro casual/minúsculo (PILAR 1), `relationshipBoost` (ficante ≠ conversante), intenção `sexualizar` no lugar de `outros`, nível 5 variando entre tier 1 (classe) e tier 2 (cru). Filtro determinístico pra intenção não vazar nos chips de skills.
- **Modelo Gemini 3.5 Flash (ADR-031):** substitui o 2.5 Flash (mais variação/postura, mantém BLOCK_NONE). Custo ~5-8x — alavancas de escala (caching, thinking cap, híbrido, limite 200→50) documentadas pra aplicar ANTES de tráfego pesado.
- **Login híbrido (ADR-029):** magic link no 1º acesso/recuperação + email/senha depois (definida em /configuracoes).
- **Vitória por opção 🔥 (ADR-030):** like por opção + coleta `winning_option_index` pro aprendizado MACRO (pós-MVP). Cabeçalho "3 OPÇÕES CALIBRADAS" + "gerar novamente" no resultado.
- **Onboarding 5 telas (ADR-032):** fluxo guiado (perfil → 1ª mulher → mensagem → demo ao vivo). `onboarding_completed` marcado ao salvar perfil. **Repaginado no padrão Onyx & Brasa** (títulos Cormorant, labels maiúsculas tan, barra de progresso brasa, botões pill+glow, chips com glow).
- **Design "Onyx & Brasa" (ADR-033):** tokens shadcn redefinidos (dark-only), Inter + Cormorant, login redesenhada (glow radial + botão pill), dashboard com stats reais + card de gerar com glow, chips/botões com glow brasa.
- **Rename crush → mulher** no texto visível (interno: tabela/rota/variáveis intactas).
- **Gate de assinatura (ADR-034):** `(app)/layout` bloqueia quem não é `active` (tela "acesso não ativo").

**Contas de teste (active):** `admin@sacada.com` (criada via service role) e `lucassilvamaximo@gmail.com` (ativada + onboarding zerado). Credenciais passadas no chat — NÃO ficam neste doc.

---

## ⏳ Pendências / próximos passos

1. **Passada de design estrutural** (ver "PRA RETOMAR" acima) — principal.
2. **Hardening de acesso (opcional, pré-tráfego):**
   - Vercel: desligar Deployment Protection (painel) pra deixar 100% público.
   - Supabase: desligar "Allow new users to sign up" + colocar `shouldCreateUser:false` no magic link (impede criar conta junk; o gate já impede o USO). Webhook segue criando comprador via service role.
3. **Teste end-to-end Marco 5** — compra real R$47 + webhook + refund (nunca foi feito).
4. **Confirmar migration do `winning_option_index`** (ADR-030) — humano precisa ter rodado o SQL no Supabase pra o 🔥 persistir. (A migration do `sexualizar`/ADR-028 o humano confirmou que rodou.)
5. **Alavancas de custo do 3.5 Flash** antes de escalar tráfego (ADR-031).
6. **Limite 200→50 gerações/dia** + ADR (pendência antiga).

---

## ⚠️ Convenções operacionais (manter)

- **Working dir lowercase** (ADR-019): rodar tudo em `D:\Claude Code\sacada-ia` (minúsculo). Conferir com `(Get-Item .).FullName`.
- **Build/dev:** NÃO usar `doppler run --` (nem `build` nem `dev` — quebra). As env vars já estão no **ambiente do sistema**, então `npm run dev` / `npm run build` puros funcionam sozinhos.
- **Git email:** local precisa ser email público vinculado à Vercel (senão deploy trava no team plan).
- **Deploy:** push na `main` → Vercel builda. Build local sempre verde antes de pushar.

---

## Decisões fechadas (índice rápido — detalhes em DECISIONS.md)

ADR-001 a 015: fundações (TS, Next 15, Tailwind/shadcn, Supabase SP, magic link, Gemini, prompt v3, JSON output, R$47 vitalício, Perfect Pay, limite 200/dia, Doppler, Vercel, GitHub, skill dopaminérgica).
ADR-016 a 019: Next 16→15 + React 18, working dir lowercase.
ADR-020 a 025: intensidade 5 etapas, age_range crush, multimodal, webhook Perfect Pay, few-shot por user, suporte por email.
ADR-026 a 034: entrada unificada, calibração + sexualizar, vitória por opção, Gemini 3.5 Flash, onboarding 5 telas, design Onyx & Brasa, gate de assinatura.
ADR-035 a 037: landing no mesmo projeto (route group marketing), port + demo público ligado na IA, fallback de modelo 3.5→2.5.

---

## Protocolo de trabalho

- **NÃO** atualizar `CLAUDE.md`/`agente.md` (responsabilidade humana entre sessões).
- **PODE** adicionar ADR novo em `DECISIONS.md` (nunca editar ADR existente).
- **PODE** atualizar este `SESSAO_ATUAL.md` e marcar checkboxes do `ROADMAP.md`.
- Carregar conteúdo da skill `produto-dopaminergico` ao trabalhar em UI.

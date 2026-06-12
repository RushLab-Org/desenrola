# Spec: LP Visual CRO — Sacada IA

**Data:** 2026-06-11  
**Status:** Aguardando aprovação  
**Rota:** `app/(marketing)/lp/page.tsx`  
**Escopo:** Reestruturação completa da landing page `/lp` com foco em conversão visual

---

## Contexto

A landing page atual (`/lp`) foi portada de um HTML estático e tem problemas críticos que impedem conversão:

1. **6 CTAs apontam para `#checkout` que não existe** — todo visitante que clica comprar vai a lugar nenhum
2. **Página 100% texto** — sem elementos visuais de antes/depois, sem chat mockups, sem comparações
3. **Demo enterrado no fim** — o melhor argumento de venda (testar a IA ao vivo) está na posição 8 de 18 seções
4. **Preço exposto cedo demais** — o sticky nav mostrava "R$47" antes do visitante ser aquecido
5. **Prova social é placeholder vazio** — agrava a falta de credibilidade
6. **Sem mobile bottom bar** — público-alvo (35+) está majoritariamente no celular

Esta spec cobre a **LP Visual** (página B). O **Quiz Funnel** (página A, rota `/quiz`) é um projeto separado, não coberto aqui.

---

## Arquitetura

### Arquivos modificados
- `app/(marketing)/lp/page.tsx` — estrutura JSX completa (substituída)
- `app/(marketing)/landing.css` — novos componentes visuais adicionados
- `app/(marketing)/layout.tsx` — adicionar variável de env de checkout no metadata

### Novos componentes
| Componente | Arquivo | Tipo |
|---|---|---|
| `StickyNav` | `app/(marketing)/_components/sticky-nav.tsx` | Client Component |
| `HeroDemoMini` | `app/(marketing)/_components/hero-demo-mini.tsx` | Client Component |
| `BeforeAfterSection` | `app/(marketing)/_components/before-after.tsx` | Server Component |
| `ComparisonTable` | `app/(marketing)/_components/comparison-table.tsx` | Server Component |
| `PitchSection` | `app/(marketing)/_components/pitch-section.tsx` | Server Component |
| `MobileBottomBar` | `app/(marketing)/_components/mobile-bottom-bar.tsx` | Client Component |

### Componentes reutilizados
- `DemoSection` — `app/(marketing)/_components/demo.tsx` — movido pra posição 7, sem alteração

### Nova variável de ambiente
```
NEXT_PUBLIC_PERFECTPAY_URL=<url do checkout Perfect Pay>
```
Adicionar no Doppler (dev + prod) e em `.env.example`. Todos os CTAs de compra usam essa variável.

---

## Estrutura de seções (ordem final)

### 1. `StickyNav` — Client Component
- Aparece após 100px de scroll (via `scroll` event listener + `useState`)
- Conteúdo: logo "Sacada" à esquerda + botão "Ver a oferta →" à direita
- **Não mostra preço** — botão faz `scrollIntoView` para `#pitch`
- CSS: `position: fixed; top: 0; z-index: 50;` com `backdrop-filter: blur`

### 2. Hero — reescrito
Headline: **"Ela mandou mensagem. E você travou de novo."**  
Subhead: "Cola o que ela escreveu. Em 10 segundos você tem 3 respostas — no seu tom, sem parecer robô."

Contém `HeroDemoMini` inline:
- `<textarea>` para colar a mensagem
- Botão "Gerar 3 respostas →"
- Chama `gerarDemo` Server Action (mesmo do `DemoSection`)
- Exibe as 3 respostas inline com tom label
- Consome 1 das 2 gerações gratuitas (mesmo cookie `DEMO_LIMIT`)
- CTA principal abaixo: **"Ver a oferta completa →"** → `scrollIntoView('#pitch')`
- Micro-copy: "Sem mensalidade · acesso imediato · garantia 7 dias"

### 3. 3 Dores Visuais + Antes/Depois — `BeforeAfterSection`
Substitui completamente as seções "Lead story", "O terreno mudou" e "A virada".

**Parte A — 3 cards de dor (ícone + texto):**
```
😶 Trava encarando a tela, não sabe o que mandar
📵 Manda algo e ela some — "✓✓ Visualizado"  
📅 Ficou anos fora — as regras do jogo mudaram
```

**Parte B — Antes/Depois (2 colunas, 2 exemplos de conversa):**

| Sem a Sacada | Com a Sacada |
|---|---|
| "oi, sumiu né 😏" → "é, tava ocupado kkkk" → ✓✓ Visualizado | "oi, sumiu né 😏" → "sumiço intencional. queria ver quanto tempo até você notar" → ❤️ Respondeu |
| "o que você fez no fds?" → "nada especial, fiquei em casa" → ✓✓ Visualizado | "o que você fez no fds?" → "tive uma ideia pra você. mas só conto pessoalmente" → 🔥 Marcou encontro |

Estilo de chat bubble (WhatsApp-like) para imersão visual.

### 4. O Mecanismo — condensado
Versão enxuta: kicker + h2 + 3 linhas de corpo. Remove os parágrafos longos atuais.  
Mantém: `method-badge` "★ Método Resposta Certa"

### 5. Como Funciona — 3 passos visuais
Mantido com upgrade visual: número grande + ícone emoji + título + descrição curta.  
Grid mobile 1 col, desktop 3 cols. Sem alteração no copy.

### 6. Olha ela trabalhando — mantido
Seção atual com os 3 exemplos de resposta (leve / provocante / puxando pra frente).  
Pequena melhoria: estilo de chat bubble nos exemplos (igual ao Antes/Depois).

### 7. `DemoSection` — movido pra posição 7
O `DemoSection` existente sobe para esta posição (hoje está em posição 8 de 18).  
Sem alteração no componente. A proximidade com o hero + antes/depois cria fluxo: "viu o problema → viu a solução → testa agora".

### 8. Tabela de Comparação — `ComparisonTable`
Kicker: "Por que a Sacada?"  
H2: "Comparado com as outras opções que você já considerou:"

| | Sacada IA | Coach presencial | ChatGPT | Pedir pro amigo |
|---|---|---|---|---|
| Não parece IA | ✓ | — | ✗ | — |
| Funciona na hora certa | ✓ | ✗ | ✓ | ✗ |
| Paga uma única vez | ✓ | ✗ | ✗ | ✓ |
| Calibrado pro seu perfil | ✓ | ✓ | ✗ | ✗ |
| Disponível às 23h | ✓ | ✗ | ✓ | ✗ |
| Custo | R$47 | R$2.000+ | R$100+/mês | Grátis |

Coluna "Sacada IA" destacada com borda brasa.

### 9. O que Muda — benefícios com counters animados
6 checkmarks atuais mantidos.  
Adicionar 3 counters animados no topo da seção (via `IntersectionObserver` + `requestAnimationFrame`):
- **+2.400** respostas geradas *(número ilustrativo — ajustar antes do lançamento)*
- **12** técnicas de conversa *(fixo — vem do system prompt v3)*
- **7 dias** de garantia total *(fixo)*

Counters contam de 0 até o valor ao entrar na viewport.

### 10. Prova Social — nova abordagem sem depoimentos
Substitui o placeholder vazio.  
Conteúdo: screenshots do demo (frases geradas pela Sacada) com moldura de chat + copy:
> "Essas respostas foram geradas pela Sacada IA. Você pode ser o próximo a usar."

Abaixo: convite para deixar depoimento após a compra (copy simples, sem widget).

### 11. `PitchSection` — seção `id="pitch"` — NOVA
**Este é o destino de todos os CTAs da página.**

Estrutura interna:
```
kicker: "A oferta completa"
h2: "Tudo que você leva hoje:"

[Produto principal]
  Sacada IA — Acesso Vitalício
  - Respostas ilimitadas, calibradas pro seu perfil
  - Texto, print e áudio
  - WhatsApp, Instagram, Tinder, Bumble
  Valor: ~~R$197~~ Incluso

[+ bônus exclusivos]

[Bônus 1] 📖 "Os 7 Erros Que Fazem Ela Sumir Depois do Primeiro 'Oi'"
  Guia de 10 min. Valor: R$47

[Bônus 2] 📸 "O Perfil que Atrai: Fotos e Bio que Geram Match com Mulher de Qualidade"
  5 regras de foto + como escrever uma bio que diferencia. Valor: R$67

[Bônus 3] ☕ "Do App ao Café: Como Sair da Conversa e Marcar o Encontro nas Primeiras 48h"
  Roteiro exato do match ao primeiro encontro. Valor: R$77

[Bônus 4] 🎯 "12 Sinais Que Ela Está Interessada de Verdade (e Quando Agir)"
  Leitura de sinais — não perder a janela. Valor: R$47

[Tabela acumulada]
  Sacada IA             R$197
  Bônus 1               R$47
  Bônus 2               R$67
  Bônus 3               R$77
  Bônus 4               R$47
  ─────────────────────────
  Valor total:     ~~R$435~~

[Reveal]
  "Tudo isso hoje, por apenas"
  "↓ preço de fundador ↓"
  R$47
  "uma única vez — acesso vitalício"

[CTA checkout]
  "Quero tudo isso por R$47 →"
  href={process.env.NEXT_PUBLIC_PERFECTPAY_URL}
  "PIX ou Cartão · acesso em minutos"

[Trust badges]
  🔒 Pagamento seguro · ✓ PIX · ✓ Cartão

[Garantia inline]
  Selo 7 dias + "Teste por 7 dias. Não valeu? 100% de volta — sem perguntas."
```

### 12. Garantia 7 dias — movida para após #pitch
Seção atual mantida, movida para logo depois do `PitchSection`.  
Razão: a objeção "e se não funcionar?" surge quando o cara está prestes a pagar.

### 13. FAQ expandido — mantido
5 perguntas `<details>` atuais mantidas. Posição movida para depois da garantia.

### 14. P.S. / P.P.S. + CTA final — mantidos
Sem alteração. Copy atual é forte.  
CTA final: também aponta para `#pitch`.

### 15. `MobileBottomBar` — Client Component — NOVA
Barra fixa no rodapé, visível apenas em mobile (`@media (max-width: 768px)`).  
Aparece após o usuário scrollar 300px.  
Conteúdo: "R$47 uma vez" à esquerda + "Comprar agora →" à direita.  
Botão aponta para `#pitch` com `scrollIntoView`.  
Usa `useState` + `scroll` listener. Respeita `prefers-reduced-motion`.

### 16. Footer — melhorado
Adiciona: selos de confiança (🔒 SSL, Perfect Pay, suporte por email), link de suporte.  
Mantém: logo "Sacada" + fine print atual.

---

## Padrão de CTAs na página

| Localização | Texto | Destino |
|---|---|---|
| Hero (acima do mini demo) | "Ver a oferta completa →" | `#pitch` |
| Hero (CTA principal) | "Ver a oferta completa →" | `#pitch` |
| StickyNav | "Ver a oferta →" | `#pitch` |
| Demo section | "Quero o acesso completo →" | `#pitch` |
| Antes/Depois | "Quero isso pra mim →" | `#pitch` |
| O que muda | "Ver a oferta →" | `#pitch` |
| MobileBottomBar | "Comprar agora →" | `#pitch` |
| PitchSection (checkout) | "Quero tudo isso por R$47 →" | `NEXT_PUBLIC_PERFECTPAY_URL` (externo) |
| P.P.S. inline | "Quero voltar pro jogo →" | `#pitch` |
| CTA final | "Quero voltar pro jogo →" | `#pitch` |

**Regra:** Só o botão dentro de `#pitch` aponta para o link externo do Perfect Pay. Todo o resto faz scroll para `#pitch`.

---

## Animações (nível moderado)

- **Fade + slide up ao entrar na viewport:** `IntersectionObserver` adiciona classe `.visible` nos elementos com `data-animate`; CSS aplica `opacity 0→1 + translateY 20px→0`. Abordagem escolhida por suporte universal (sem `animation-timeline`).
- **Counters animados:** seção "O que muda" — 3 números contam de 0 ao valor alvo
- **Pulso no CTA principal:** botão no `#pitch` tem `animation: pulse 2s infinite` quando em repouso
- **Sticky nav:** transição `opacity + translateY` ao aparecer/sumir

---

## Variáveis de ambiente necessárias

| Variável | Onde | Descrição |
|---|---|---|
| `NEXT_PUBLIC_PERFECTPAY_URL` | Doppler dev + prod | URL do checkout do produto no Perfect Pay |

Adicionar em `.env.example` com comentário. Sem essa variável, o botão de checkout fica desabilitado com `href="#"` e `aria-disabled`.

---

## O que NÃO muda

- `app/(marketing)/actions.ts` — `gerarDemo` sem alteração
- `app/(marketing)/layout.tsx` — apenas adiciona meta tags se necessário
- `app/(marketing)/_components/demo.tsx` — `DemoSection` sem alteração
- `middleware.ts` — `/lp` já está em `PUBLIC_PATH_PREFIXES`
- Todo o `app/(app)/` — zero impacto

---

## Verificação

1. `npm run dev` — abre `/lp` e verifica:
   - [ ] Sticky nav aparece após 100px de scroll e some ao voltar ao topo
   - [ ] Hero renderiza headline + mini demo + CTA
   - [ ] Mini demo gera 3 respostas ao submeter uma mensagem
   - [ ] Todos os CTAs fazem scroll suave até `#pitch`
   - [ ] `#pitch` mostra stack completo com 4 bônus e tabela acumulada
   - [ ] Botão de checkout em `#pitch` aponta para `NEXT_PUBLIC_PERFECTPAY_URL`
   - [ ] Mobile bottom bar aparece após 300px de scroll (testar no DevTools mobile)
   - [ ] Animações de entrada funcionam ao scrollar
   - [ ] Counters animam ao entrar na viewport
   - [ ] `DemoSection` completo (print/áudio popup, limite 2) ainda funciona
2. `npm run build` — zero erros TypeScript
3. Testar em mobile real ou DevTools 390px — verificar bottom bar e layout

---

## Fora do escopo desta spec

- **Quiz Funnel** (`/quiz`) — spec separada, projeto B
- Depoimentos reais — a ser adicionado quando disponíveis (substituir seção 10)
- `NEXT_PUBLIC_PERFECTPAY_URL` preenchido — responsabilidade do humano no Doppler
- Os 4 guias de bônus — conteúdo a ser criado separadamente; landing usa apenas título + descrição
- Rewrite hostname `/lp` → `/` — ADR-035, fora de escopo

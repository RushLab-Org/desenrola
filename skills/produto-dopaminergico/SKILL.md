---
name: produto-dopaminergico
description: Aplica princípios de produto dopaminérgico ético DENTRO do app (pós-compra) do Sacada IA. Use SEMPRE que estiver desenhando telas, fluxos, microinterações, copy de botões, empty states, onboarding, ou qualquer ponto onde usuário já-pagante interage com o produto. NÃO se aplica à página de vendas externa (que tem regras próprias de marketing agressivo). Trigger em UI, UX, tela, layout, fluxo, onboarding, design, componente, animação, copy de botão, mensagem de erro, empty state, loading, microinteração, feedback visual.
---

# Skill: Produto Dopaminérgico — Dentro do App

## Princípio fundador

O produto dopaminérgico ético gera **sensação real de progresso, capacidade e satisfação** — não dependência psicológica nem manipulação.

Esta skill aplica APENAS dentro do app pós-compra. O cliente já pagou, já é nosso. Aqui a régua é: entregar valor, gerar satisfação real, não-explorar.

---

## ESCOPO DESTA SKILL

### Onde esta skill ATIVA:

- Dentro do app (`app.dominio.com`) em qualquer tela pós-login
- Email transacional pós-compra (boas-vindas, magic link, suporte)
- Modal de reembolso e suporte
- Onboarding pós-cadastro
- Notificações push (quando implementadas pós-MVP)
- Qualquer comunicação direta com cliente JÁ PAGANTE

### Onde esta skill NÃO ATIVA:

- Página de vendas externa (`dominio.com`) — território de marketing agressivo, escopo separado, regras próprias
- Anúncios pagos (Meta Ads, Google Ads, TikTok Ads) — território de copy de tráfego
- Materiais promocionais (criativos de venda, lançamento, copy de captação)

**Por que essa distinção:** página de vendas é jogo de captação onde persuasão agressiva é padrão do mercado. Dentro do app é entrega de valor — cliente já é nosso, manipulação aqui é tiro no pé (refund explode, churn de boca, reputação queima). São dois jogos diferentes.

---

## TOM DE COMUNICAÇÃO DENTRO DO APP

### O que SOMOS dentro do app:

- **Adulto** — falamos com homem adulto, sem moralismo, sem infantilização
- **Direto** — sem rodeio, sem "vamos lá!", sem corporativês
- **Brasileiro real** — gírias quando cabem, registro coloquial
- **Sem censura** — palavrão pode aparecer se contexto pede, sexo é assunto normal
- **Com humor seco** — não puritano, não politicamente correto
- **Honesto** — informação verdadeira, sem mentira pra empurrar comportamento

### O que NÃO somos dentro do app:

- **Family friendly** — não é Disney+, é app de adulto pra adulto
- **Coach motivacional** — sem "VOCÊ CONSEGUE!" e jargão de coach
- **Vendedor agressivo** — cara já pagou, não tem mais nada pra vender
- **Manipulador** — não explora insegurança pra empurrar comportamento
- **Mentiroso** — não inventa urgência, não fabrica social proof, não confunde

### A distinção que importa:

- ✅ **Adulto e honesto:** "Ela tá te enrolando há 3 dias. Vamos resolver isso?"
- ❌ **Manipulador e mentiroso:** "Ela tá te trocando por outro AGORA. Pague AGORA pra não perder."

- ✅ **Direto sem moralismo:** "Cara, essa resposta tá horrível. Refaz."
- ❌ **Coach cringe:** "Você pode mais! Acredite no seu potencial de paquera!"

- ✅ **Sem censura:** "Resposta provocante que vai fazer ela perder a paciência."
- ❌ **Puritano:** "Resposta cuidadosa que respeita os limites dela."

Diferença é **honesto vs manipulador**, não "duro vs leve".

---

## PARTE 1 — Princípios de UX que geram satisfação real

### 1.1 Velocidade percebida > velocidade real

Usuário tolera 5 segundos de loading se durante esses 5 segundos ele tem feedback visual que o produto está trabalhando. Tolera 0.5 segundos de tela travada como uma eternidade.

**Aplicação no app:**

Loading da geração de resposta (chamada Gemini leva 2-5s):

- ❌ "Carregando..." (genérico, parece travado)
- ✅ Mensagens rotativas que entretêm:
  - "lendo o que ela mandou..."
  - "puxando o perfil da [nome da crush]..."
  - "aplicando provocação invertida..."
  - "calibrando pela sua voz..."
  - "verificando se tem double meaning..."

Cada mensagem dura 800-1200ms e troca. Cara nem percebe que esperou 4 segundos.

**Princípio mais amplo:** TODA operação assíncrona >500ms tem feedback visual contextual, NUNCA genérico.

### 1.2 Microinterações que dão dopamina honesta

Pequenos detalhes que afirmam ação do usuário:

- **Haptic feedback no mobile** ao copiar resposta (vibração curta)
- **Animação sutil** ao salvar crush (card "pulsa" verde por 200ms)
- **Toast visual** com mensagem específica ("Marina salva no seu radar")
- **Confetti BREVE** (1 segundo, sem exagero) ao completar onboarding — apenas em conquistas REAIS, não aleatório
- **Botão "copiar" muda visualmente** por 1.5s ("copiado!") com check verde

**Não é firula** — é confirmação de que a ação aconteceu. Sem isso, usuário tenta de novo achando que travou.

### 1.3 Empty states com personalidade

Tela vazia é OPORTUNIDADE, não problema. Tom: adulto, direto, sem cringe.

- ❌ "Nenhuma crush cadastrada"
- ✅ "Sua agenda tá vazia. Bora começar com aquela que tá te tirando o sono?" [botão "Adicionar primeira"]

- ❌ "Sem gerações ainda"
- ✅ "Tudo zerado por aqui. A primeira é a que mais ensina."

- ❌ "Você ainda não tem nenhuma vitória registrada"
- ✅ "Sem vitórias marcadas ainda. Vai precisar de uma boa primeira."

**Princípio:** empty state com CTA específica + tom adulto + sem culpa.

### 1.4 Tornar a tática visível (educação como feature)

Diferencial competitivo único do produto: mostrar AS SKILLS aplicadas na geração.

Em cada resposta gerada, abaixo do card:

```
[ resposta gerada ]
─────────────────
🎯 Esta resposta usa:
   • Provocação invertida
   • Double meaning sutil
   • Resposta curta de alto impacto
```

**Por que isso é dopaminérgico (e ético):**
- Cara aprende enquanto usa (valor educacional real)
- Vê QUE TEM TÉCNICA (não é palpite aleatório)
- Reforça que ele está EVOLUINDO, não dependendo
- Justifica preço pago

### 1.5 Velocidade de "Aha moment"

O WOW tem que acontecer em 60 segundos do primeiro contato pós-compra. Toda etapa anterior é fricção que mata satisfação.

**Onboarding ideal:**
- Tela 1-3: captura perfil rápido (chips, não input livre)
- Tela 4: cria primeira crush (guiado, exemplos clicáveis)
- Tela 5: "Cole a última mensagem dela" + exemplo plug-and-play se cara não tiver caso real
- Tela 6: **resposta gerada na tela em frente aos olhos dele**

Aí ele pensa: "Puta que pariu, isso é bom."

Esse momento define se ele vira fã ou pede reembolso em 24h.

---

## PARTE 2 — Princípios de retenção (pós-compra)

### 2.1 Streak de uso (sem punição)

Tela "Meu progresso" mostra:
- Dias consecutivos usando o app
- Total de gerações
- Crushes ativas
- "Vitórias" registradas (cara marca quais respostas funcionaram)

**Crítico:** streak não pode gerar culpa se quebrar. Sem "VOCÊ PERDEU 7 DIAS!" — apenas "Bem vindo de volta, faz um tempo. Tudo de boa?" sem drama.

### 2.2 Notificações inteligentes baseadas em contexto

Se push notification for implementada (pós-MVP):

**Útil e honesto:**
- ✅ "[nome da crush] não recebe mensagem sua há 3 dias. Quer atualizar o perfil dela?"
- ✅ "Faz uma semana desde sua última geração. Bola pra alguém?"

**Manipulador (NÃO USAR):**
- ❌ "Ela viu seu story às 23h e não respondeu, gere mensagem agora!"
- ❌ "OUTROS CARAS já mandaram 12 respostas hoje. E você?"
- ❌ "Você está perdendo as mulheres que deixou esfriando!"

**A distinção:** notificação útil avisa fato real e oferece ajuda. Notificação manipuladora cria ansiedade pra forçar ação.

### 2.3 Sistema de indicação simples (pós-MVP)

- Cara indica amigo via link único
- Amigo compra com desconto pequeno (R$ 10 OFF, real)
- Quem indicou ganha bônus real (acesso antecipado a feature beta, 1 mês de premium quando lançar tier premium)

**NÃO** usar moedas, gemas, ranking, gamificação artificial. Indicação saudável é "compartilha porque o produto é bom", não "compartilha pra ganhar coisas".

### 2.4 Pesquisa de satisfação no momento certo

Depois da 5ª "vitória" registrada (cara marcou que a resposta funcionou), aparece:

"Você resolveu 5 conversas com o app. Funcionou? [Sim / Mais ou menos / Não]"

- **Sim** → "Topa indicar pra um amigo?"
- **Mais ou menos** → "O que poderia ser melhor? [textarea]"
- **Não** → mostra botão de reembolso visível, sem fricção

Pesquisa NO MOMENTO CERTO (depois de valor entregue), não no primeiro dia.

---

## PARTE 3 — Princípios de copy DENTRO do app

### 3.1 Tom de marca

- **Adulto** (não adolescente, não corporativo, não family friendly)
- **Direto** (sem rodeio, sem palestra)
- **Brasileiro real** (gírias, registro coloquial, expressões naturais)
- **Sem moralismo** (cara é adulto, sabe o que tá fazendo)
- **Sem cringe** (não "alfa", não coach motivacional, não "macho")
- **Pode ter humor seco e ácido** (não puritano, não politicamente correto)

### 3.2 Botões e CTAs

- ❌ "Clique aqui pra continuar" → ✅ "Continuar"
- ❌ "Envie sua mensagem" → ✅ "Gerar resposta"
- ❌ "Salvar alterações" → ✅ "Salvar"
- ❌ "Adicionar nova crush" → ✅ "Nova crush"

**Princípio:** botão diz O QUE acontece, em 1-3 palavras, verbo forte.

### 3.3 Mensagens de erro

- ❌ "Erro: ocorreu um problema inesperado" → ✅ "Tivemos um problema aqui. Tenta de novo?"
- ❌ "Falha na validação dos campos" → ✅ "Faltou preencher o nome dela"
- ❌ "Sua sessão expirou" → ✅ "Faz tempo que você não usa. Entra de novo pra continuar."

**Princípio:** erro é humano, específico, com próximo passo claro.

### 3.4 Copy do reembolso (CRÍTICO)

Refund tem que ser FÁCIL e VISÍVEL, não escondido. Botão em configurações:

```
"Solicitar reembolso"

Tem até 7 dias do dia da compra pra pedir reembolso por
qualquer motivo. Sem perguntas, sem burocracia.

[ Falar com suporte ]
```

Botão abre WhatsApp/email pré-formatado pro suporte.

**Princípio:** facilidade de sair = confiança pra entrar. Esconder reembolso piora conversão upstream E gera processos.

### 3.5 Copy de conquistas e progresso

Tom: adulto, sem cringe, sem exagero.

- ❌ "Parabéns campeão! Você é incrível! 🎉🎉🎉" → ✅ "Tá decolando. 10 conversas resolvidas."
- ❌ "Continue assim que o sucesso está próximo!" → ✅ "Tu tá pegando o jeito."
- ❌ "Wow! Que conquista épica!" → ✅ "Primeira vitória registrada. Boa."

**Princípio:** reconhecer sem puxar saco. Cara adulto detecta bajulação na hora.

---

## PARTE 4 — Checklist a aplicar EM TODA tela criada

Antes de finalizar qualquer tela, verificar:

- [ ] Tem feedback visual em TODA ação do usuário?
- [ ] Operações >500ms têm loading contextual (não genérico)?
- [ ] Empty state tem personalidade + CTA + sem culpa?
- [ ] Botões usam verbos fortes em 1-3 palavras?
- [ ] Mensagens de erro são humanas e com próximo passo?
- [ ] Microinterações confirmam ação (haptic, animação, toast)?
- [ ] Onde aplicável, mostra "POR QUÊ" funciona (skills aplicadas)?
- [ ] WOW moment acontece em 60s do onboarding?
- [ ] Layout funciona em mobile (90%+ dos usuários)?
- [ ] Tom adulto sem moralismo, sem cringe?

---

## PARTE 5 — Anti-checklist (o que NÃO fazer NUNCA dentro do app)

Comportamentos proibidos no produto pós-compra:

- **NUNCA** notificações que exploram insegurança ("ela ainda não respondeu!", "ela viu seu story", "outras meninas viram você")
- **NUNCA** ranking público entre usuários ("você é o 47º cara mais ativo")
- **NUNCA** streaks que punem ou geram culpa ("VOCÊ PERDEU 5 DIAS!")
- **NUNCA** prova social falsa dentro do app ("847 outros caras usaram agora")
- **NUNCA** prometer resultado que o produto não entrega
- **NUNCA** confusão proposital pra dificultar reembolso/cancelamento
- **NUNCA** "dark patterns" de confirmação (botão cancelar pequeno cinza, botão "continuar" verde grande)
- **NUNCA** gamificação com recompensas variáveis aleatórias (slot machine)
- **NUNCA** FOMO artificial dentro do app
- **NUNCA** upsell agressivo após compra (cara já pagou, deixa ele em paz)
- **NUNCA** mentir sobre features ou capacidades do produto

**NOTA IMPORTANTE:** essas regras se aplicam DENTRO do app. Na página de vendas externa, regras de marketing são separadas e têm escopo próprio. Esta skill cobre apenas o pós-compra.

---

## PARTE 6 — Princípios de animação e movimento

### 6.1 Duração

- Microinterações: 150-300ms
- Transições entre telas: 200-400ms
- Loading dopaminérgico: textos rotativos a cada 800-1200ms

Acima de 500ms uma animação começa a parecer lenta. Abaixo de 100ms parece glitch.

### 6.2 Easing

Padrão shadcn já vem com `cubic-bezier` adequado. Não inventar.

### 6.3 Quando NÃO animar

- Loading de dados crítico (mostre skeleton, não animação chamativa)
- Após erro (não enfeitar dor)
- Em tela de reembolso (respeitar momento sério)

---

## PARTE 7 — Princípios mobile-first

90%+ do tráfego será mobile. Todo design começa mobile:

- Botões grandes (mínimo 44x44px tap target)
- Texto legível sem zoom (mínimo 16px)
- Espaçamento generoso entre elementos clicáveis
- Inputs com keyboard adequado (`type="email"`, `inputmode="numeric"`)
- Imagens otimizadas (`<Image>` do Next.js)
- Não usar hover como mecânica única (não existe em mobile)

---

## PARTE 8 — Como aplicar esta skill

Quando estiver trabalhando em UI dentro do app, antes de finalizar:

1. Releia PARTE 4 (checklist do que fazer)
2. Releia PARTE 5 (anti-checklist do que não fazer)
3. Pergunte-se: "essa tela gera valor real pro cliente que já pagou ou só engaja artificialmente?"
4. Se for retenção: aplique PARTE 2
5. Se for copy: aplique PARTE 3 (tom adulto, brasileiro, sem moralismo, sem cringe)
6. Se for animação: aplique PARTE 6

**Em caso de conflito entre velocidade de entrega e qualidade dopaminérgica:** velocidade ganha no MVP. Mas marque com comentário `// TODO: aplicar princípio X da skill produto-dopaminergico` pra revisar depois.

**Em caso de dúvida sobre página de vendas vs dentro do app:** se for página de vendas externa, esta skill NÃO se aplica — use a copy/design de marketing apropriada pra captação. Se for dentro do app pós-login, esta skill SE APLICA.

---

**Versão:** 1.1
**Última atualização:** maio/2026
**Mudança vs v1.0:** distinção explícita entre página de vendas (escopo de marketing, fora) e dentro do app (escopo desta skill); ajuste de tom pra "adulto sem moralismo" em vez de "family friendly"
**Ativada por:** trabalho em UI/UX dentro do app pós-login

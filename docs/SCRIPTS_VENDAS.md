# Scripts de Vendas + Materiais Necessários

Manual operacional pra rodar as 5 cadências comerciais. Complementa os BPMNs em `src/utils/comercial/` — scripts dos **toques** estão dentro de cada task BPMN (campo DOCUMENTAÇÃO). Este documento traz o que **não está nos BPMNs**: scripts pós-demo, banco de objeções, voicemails e materiais a produzir.

---

## Sumário

1. [Materiais a produzir (por prioridade)](#1-materiais-a-produzir-por-prioridade)
2. [Scripts pós-demo (depois de mostrar a Fyness)](#2-scripts-pós-demo)
3. [Banco de respostas a objeções](#3-banco-de-respostas-a-objeções)
4. [Voicemails pré-prontos](#4-voicemails-pré-prontos)
5. [Onde estão os scripts dos toques](#5-onde-estão-os-scripts-dos-toques)

---

## 1. Materiais a produzir (por prioridade)

### Tier 1 — Imprescindível pra rodar HOJE

| # | Material | Pra que serve | Esforço |
|---|---|---|---|
| 1 | **Cartilha visual 1 página** (PDF/imagem) | Usada em Endosso D2 · Indicação D4 · Anúncio D2 · Inbound D1 · Aquecida D3. É o material visual #1. | 1 dia (Canva) |
| 2 | **3 vídeos curtos de clientes reais** (60-90s vertical) — 1 por perfil (padaria, salão, restaurante) | Usado em TODAS as 5 cadências (prova social) | 1-2 sem (combinar com 3 clientes + gravar) |
| 3 | **Voicemail pré-gravado** (texto padrão pra falar) | Pra deixar quando não atender (já documentado abaixo) | 30min (gravar 1 versão tua + 1 do Kaynan) |
| 4 | **Linha telefônica oficial da Fyness** (não número pessoal) | Aparece como "Fyness" no WhatsApp Business + telefone oficial | 1 dia (configurar chip ou WhatsApp Business) |

### Tier 2 — Importante pra completar a operação

| # | Material | Pra que serve | Esforço |
|---|---|---|---|
| 5 | **Vídeo institucional 90s** explicando a Fyness | Toque D9 do Endosso, D2 do Inbound, D4 da Indicação | 2-3 dias (roteiro + gravação + edição) |
| 6 | **5-10 mini-vídeos de dicas semanais** (45-90s vertical) | Biblioteca pros D5/D10 das cadências + dicas pós-onboarding em CS | 1 sem (1 dia gravando 5 de uma vez) |
| 7 | **Print "anonimizado" do resumo de sexta** (modelo bonito) | Mostrar o que o cliente recebe — usado quando cliente pergunta "como é que aparece pra mim?" | 2h (Photoshop/Figma) |
| 8 | **Cheat sheet WhatsApp** (1 imagem com 5 ações principais do produto) | Entregue na call de implementação como referência | 4h (Canva) |
| 9 | **Página de agendamento simples** (link curto pra demo de 15min) | Pra mandar quando cliente diz "manda link" em vez de marcar na hora | 1 dia (Cal.com gratuito ou link manual) |

### Tier 3 — Pra escalar / automatizar (M3+)

| # | Material | Pra que serve | Esforço |
|---|---|---|---|
| 10 | **Pixel + audiência de remarketing no Meta** | Lead que entrou em cadência e não converteu vira público de remarketing | 1 dia (devs) |
| 11 | **Templates de WhatsApp Business homologados** | Pra mandar mensagens em massa sem cair em spam | 2-3 dias (Meta exige aprovação) |
| 12 | **Bot de qualificação de anúncio pago** | Captura lead do anúncio + dispara WhatsApp automático em ≤15min (toque T01 da cadência de Anúncio) | 3-5 dias (devs + integração) |
| 13 | **CRM com cadências automatizadas** (sequências de tarefas) | Lead que chega via endosso já cai com 12 tarefas agendadas na timeline da Consultora | 1 sem (devs no CRM próprio) |

---

## 2. Scripts pós-demo

Cenários depois que você fez a demo de 15min e o cliente NÃO fechou na hora. São os mais comuns:

### 2.1 Cliente disse "vou pensar"

**Não aceitar passivamente.** Quem fala "vou pensar" não tem ainda os elementos pra decidir. Sua função é entender O QUE ele precisa pensar.

```
"Beleza, totalmente justo. Mas deixa eu te perguntar — o que especificamente você quer 
pensar? É preço, é se a ferramenta faz o que você precisa, é o momento do negócio? 
Talvez eu consiga te ajudar a pensar agora."
```

Se ele especificar (ex: "preço"), você endereça AGORA. Se ele insistir vago:

```
"Sem problema. Quando você acha que tem uma resposta pra mim — quinta? Posso te 
chamar quinta a tarde pra a gente fechar?"
```

**Marcou data?** Vira ouro. Não marcou? Volta na cadência normal (D2, D5, D7...).

### 2.2 Cliente disse "manda no WhatsApp depois"

```
"Posso mandar sim! Olha, quando você prefere receber? Hoje à noite ou amanhã de manhã? 
Eu te mando junto com um print rápido do que o seu negócio especificamente vai ver na 
ferramenta — fica mais fácil de você decidir."
```

Dá um horário CONCRETO + promete material PERSONALIZADO. Sem isso vira "mandei e ele sumiu".

### 2.3 Cliente disse "vou conversar com meu sócio/esposa"

```
"Faz total sentido. Que tal o seguinte: posso te ligar amanhã às 18h pra a gente 
conversar os 3 juntos por 10 minutos? Eu mostro pra ele/ela também na tela. Aí vocês 
decidem juntos com tudo na mão."
```

Marcar reunião com o decisor real > deixar o cliente "defender" sua venda sozinho.

### 2.4 Cliente pediu preço e silenciou

```
"Oi [nome], imagina que o preço deve ter pesado né. Olha — antes de você fechar ou 
descartar, deixa eu te perguntar: você comparou com quanto custa hoje o tempo que você 
gasta no controle de caixa? Se sua hora valer R$50 e você gasta 2h por dia tentando 
fechar conta, são R$3.000/mês. R$97 te devolve essa hora."
```

Argumento de tempo > argumento de feature. Esse perfil sente tempo perdido.

### 2.5 Cliente pediu desconto agressivo

```
"Olha, o preço já é o mais baixo do mercado pra esse tipo de ferramenta — a gente 
fez questão de manter acessível. O que eu consigo fazer é o seguinte: você fecha hoje, 
eu te dou os primeiros 15 dias com acompanhamento direto meu, sem custo extra, te 
ajudo a configurar tudo. Bate o martelo?"
```

Não desconta preço base — agrega VALOR. Acompanhamento personalizado vale mais que R$30 a menos.

### 2.6 Cliente curtiu mas "agora não dá"

```
"Tranquilo. Deixa eu marcar você pra eu te procurar daqui 30 dias então — sem 
compromisso, só pra a gente conversar de novo. Tá combinado?"
```

Marca no CRM "retomar em 30d". Reativa com 1 conteúdo novo da Fyness (lançamento, case, vídeo).

### 2.7 Cliente disse "já tenho contador"

```
"Show! Inclusive, o ideal é a gente trabalhar JUNTO com seu contador. A Fyness não 
substitui ele — ela te ajuda no dia a dia (lançar venda no WhatsApp, ver caixa) 
enquanto seu contador continua fazendo a parte fiscal e contábil. Inclusive, posso 
falar com seu contador também se quiser. Quem é ele?"
```

NUNCA brigar com o contador. Posicionar como COMPLEMENTAR + abrir porta de parceria.

### 2.8 Cliente disse "uso Excel/caderno e tá ótimo"

```
"Que ótimo que você já controla! Isso significa que você é o tipo de dono organizado, 
que cuida do dinheiro. Deixa eu te fazer uma pergunta: quanto tempo por dia você gasta 
preenchendo o Excel/caderno? E se de um caderno você tirasse a parte 'lançar coisa' 
e gastasse esse tempo pensando no seu negócio?"
```

Reconhece a virtude > ataca a fricção do método atual.

### 2.9 Cliente quer "ver funcionando antes"

```
"Posso te dar acesso por 7 dias agora, mas tem uma condição: você assina o contrato 
hoje com carência de pagamento de 15 dias. Você usa por 15 dias, e SÓ começa a pagar 
no dia 16. Se nesses 15 dias você decidir que não é pra você, cancela e não paga nada. 
Combinado?"
```

A carência É o "trial" disfarçado. Mas exige o **comprometimento** (assinou).

### 2.10 Cliente sumiu pós-demo (não respondeu em 48h)

Manda 1 mensagem direta:

```
"Oi [nome]! Faz 2 dias que conversamos, sumiu. Imagino que esteja ocupado — qualquer 
coisa que tenha ficado em dúvida, me manda. Vou parar de te chamar amanhã se nada 
chegar — só pra você saber."
```

**Reciprocidade.** "Vou parar amanhã" reativa 15-30% dos sumidos.

---

## 3. Banco de respostas a objeções

### "É caro"
```
"Caro comparado a quê? Se você comparar com não controlar nada, é caro mesmo. Mas 
comparado a contratar 1 estagiário pra organizar caixa (R$1.500/mês), ou pagar 
contador pra fazer também o dia a dia (R$800/mês), R$97 é bem barato. Você já 
calculou quanto perde por mês não sabendo seu caixa real?"
```

### "Não tenho tempo de aprender ferramenta nova"
```
"É exatamente por isso que a Fyness foi feita pra dono de negócio igual a você — 
não é dashboard complicado. Você manda foto do comprovante no WhatsApp e tá pronto. 
A gente fez uma call de 30 minutos no começo, e depois disso você só usa. Quem aprende 
em 30 minutos é qualquer um."
```

### "Não confio em IA / pode dar erro"
```
"Entendo. A IA é a primeira camada — ela lê o comprovante e sugere. Mas VOCÊ confirma 
ou edita antes de salvar. Nada entra no caixa sem você dar o OK. E quando ela acerta 
muito, você só clica em 'confirmar' e tá pronto. Sem você no controle, nada vira 
lançamento."
```

### "Tenho que falar com meu contador"
*(ver script 2.7)*

### "Já tentei outras ferramentas, todas complicadas"
```
"Saquei. Posso te perguntar qual era? [escuta]. Olha, a diferença da Fyness é que 
você não precisa abrir aplicativo nenhum no dia a dia. Você manda foto no WhatsApp 
do mesmo jeito que você já manda foto pra parente. É o WhatsApp que você já usa o 
dia inteiro, não uma 'plataforma nova'."
```

### "Vou esperar a empresa crescer mais pra usar"
```
"Cuidado com essa lógica — quem espera crescer pra organizar, normalmente perde a 
chance de crescer mais rápido. Saber quanto sobra hoje é o que te ajuda a decidir 
em quê investir pra crescer."
```

### "E se eu cancelar?"
```
"No plano mensal, você cancela quando quiser. Sem multa, sem fidelidade. No anual, 
tem fidelidade de 12 meses, mas você paga 30% a menos. Você escolhe."
```

### "Posso pagar via boleto?"
```
"Hoje a gente trabalha com cartão de crédito (a mensalidade entra no seu cartão) ou 
PIX no anual. O cartão pode ser de qualquer banco. Você tem cartão aí, certo?"
```

### "E se meu negócio fechar?"
```
"No mensal você cancela na hora, sem multa. E mesmo se fechar com plano anual, a 
gente sempre conversa e ajeita a situação — não somos burocráticos com cliente que 
está em momento difícil. Tem cláusula no contrato pra isso."
```

### "Vou pensar e te dou retorno"
*(ver script 2.1)*

---

## 4. Voicemails pré-prontos

**Versão 1 — Consultora padrão (cadência de endosso/indicação)**
```
"Oi [nome], aqui é a [consultora] da Fyness. Estou te ligando porque o [Contador X / 
Cliente Y] te indicou pra conversarmos. Tô disponível agora ou no horário que você 
preferir — me manda um WhatsApp quando puder, no número que apareceu aqui. Obrigada!"
```

**Versão 2 — Anúncio pago (urgência implícita)**
```
"Oi [nome], aqui é a [consultora] da Fyness. Vi que você clicou no nosso anúncio 
hoje e quis te ligar pra te apresentar pessoalmente, em 5 minutos. Te chamo no 
WhatsApp também — quando puder me responde lá. Beleza?"
```

**Versão 3 — Kaynan (toque do fundador, qualquer cadência)**
```
"E aí [nome], aqui é o Kaynan, dono da Fyness. Te liguei pessoalmente porque a 
[consultora] me falou de você. Quando puder, me manda um oi no WhatsApp aqui — 
prometo que não tomo seu dia. Abraço."
```

**Regra:** ≤20 segundos. Nome próprio + contexto + ação clara. Voicemail longo ninguém ouve.

---

## 5. Onde estão os scripts dos toques

Os scripts de fala de cada toque das 5 cadências estão dentro dos BPMNs:

1. Abre o **Editor** de processos
2. Carrega a cadência desejada via dropdown **Cadências ▼** (cor âmbar)
3. Clica em qualquer task do diagrama
4. O painel à direita mostra **DOCUMENTAÇÃO** — script de fala + dicas + o que fazer se não atender + o que anotar no CRM

**Atalho — onde está o quê:**

| Canal | Arquivo fonte | Quantos scripts |
|---|---|---|
| Endosso do contador | `src/utils/comercial/cadenciaProspeccaoTemplate.js` | 12 |
| Indicação direta | `src/utils/comercial/cadenciaIndicacaoTemplate.js` | 6 |
| Inbound orgânico | `src/utils/comercial/cadenciaInboundOrganicoTemplate.js` | 9 |
| Anúncio pago | `src/utils/comercial/cadenciaAnuncioPagoTemplate.js` | 7 |
| Prospecção aquecida | `src/utils/comercial/cadenciaProspeccaoAquecidaTemplate.js` | 8 |

Total: **42 scripts de fala** prontos pra uso, todos personalizáveis com `[nome]`, `[contador]`, `[indicador]`, etc.
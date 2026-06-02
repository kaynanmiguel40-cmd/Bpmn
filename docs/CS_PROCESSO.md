# Customer Success Fyness — Processo de Retenção Long-Term

Documentação operacional do processo de Customer Success (CS) modelado nos 7 BPMNs da página Processos.

**Objetivo do processo:** fazer o cliente Fyness (MEI/EPP — Seu Zé da padaria, Dona Juana do hortifruti) ficar 3+ anos como cliente ativo, renovando, indicando e virando case.

**Modelo operacional:** High Touch com Consultora de Relacionamento dedicada. Não é Low Touch / automação pura — esse perfil de cliente cancela no primeiro mês ruim de caixa se não tiver vínculo humano.

**Modelo de contrato vigente (atualizado 2026-05-28):**
- Mensal R$97 — sem fidelidade, cancela quando quiser
- Anual R$67/mês (R$804 antecipado via cartão) — fidelidade 12 meses, multa proporcional aos meses restantes
- Sem trial — entrada por contrato assinado **com carência de pagamento** (assina agora, começa a pagar depois de X dias). No início o cliente ainda não pagou nada — pode sumir antes da 1ª cobrança, por isso a Fase 1 é decisiva
- Estratégia land-and-expand: ticket entra baixo e sobe conforme novos módulos (estoque, fiscal, etc) são adicionados

---

## Sumário

0. [**O que rodar AGORA (early ~5 clientes) vs DEPOIS**](#0-o-que-rodar-agora-vs-depois) — leia primeiro
0b. [Unit economics: ticket R$97 vs custo do touch](#0b-unit-economics) — o trade-off central
1. [Como aplicar os templates no editor](#1-como-aplicar-os-templates-no-editor)
2. [CS Macro — visão das 6 fases](#2-cs-macro--visão-das-6-fases)
3. [Fase 1 — Implementação Guiada (D0-D7)](#3-fase-1--implementação-guiada-d0-d7)
4. [Fase 2 — Ativação (D8-D30)](#4-fase-2--ativação-d8-d30)
5. [Fase 3 — Hábito (D31-D120)](#5-fase-3--hábito-d31-d120)
6. [Fase 4 — Expansão (M4-M11)](#6-fase-4--expansão-m4-m11)
7. [Fase 5 — Renovação Anual (M10-M12)](#7-fase-5--renovação-anual-m10-m12)
8. [Fase 6 — Advocacy (M12+)](#8-fase-6--advocacy-m12)
9. [Mecanismos transversais](#9-mecanismos-transversais)
10. [Health Score — 5 sinais](#10-health-score--5-sinais)
11. [Riscos específicos do ICP e mitigação](#11-riscos-específicos-do-icp-e-mitigação)
12. [Metas anuais](#12-metas-anuais)

---

## 0. O que rodar AGORA vs DEPOIS

> **Leia esta seção antes de tudo.** O processo das 6 fases descrito aqui é o **norte de escala** — operação ideal quando você tiver 50+ clientes. A Fyness hoje (Maio 2026) tem ~5 clientes ativos. Operar todo esse maquinário com 5 clientes é teatro: gasto operacional sem benefício real.

**A operação real de hoje cabe num documento de 1 página + 1 BPMN simples** ("CS Agora", template `cs00AgoraTemplate.js`, disponível no dropdown).

| O que | AGORA (até ~15 clientes) | DEPOIS (15-20+ clientes) |
|---|---|---|
| Atendimento | Kaynan + Consultora atuam **junto, sem separação formal** | Consultora dedicada com carteira definida |
| Onboarding | 1 call de 30-40min, cadastra tudo junto | Fase 1 completa (D0-D7 estruturada) |
| Acompanhamento | Mensagem pessoal **toda semana** pra cada cliente | Resumo-sexta-17h **automático** + check-ins programados |
| Resumo de sexta | **Manual** (você olha o caixa do cliente e escreve áudio) | Automação no CRM + WhatsApp |
| Health Score | **Você sente na conversa** (sem score numérico) | 5 sinais ponderados, cálculo semanal automático |
| NPS | Não formal — escuta na ligação mensal | Pesquisa NPS automática trimestral |
| Dunning | Cartão recusou → **liga na hora**, manda PIX | Sequência de 7 passos em 7 dias |
| Indicação | Pede na hora quando cliente elogia | Programa formal com tracking + desconto auto |
| EBR (review trimestral) | Não precisa | Áudio do Kaynan a cada 90 dias por cliente |
| Cohort/NDR/GRR | Não precisa medir | Dashboards mensais, base pra decisões |
| Renovação anual | Conversa pessoal no M10 | Fase 5 estruturada com 2 fluxos (mensal/anual) |
| Save Playbook | Kaynan resolve qualquer caso pessoalmente | Playbook escalonado por causa raiz |

**Os sinais de que você precisa migrar do "Agora" pro "Macro":**
- Você começa a **esquecer o nome do negócio** do cliente
- Esquece de mandar mensagem pra alguém na semana
- Demora **mais de 1h** pra mandar os resumos de sexta
- Está perdendo informação entre conversas
- Algum cliente cancela e **você não viu vindo**

Quando 2 desses sinais aparecerem, é hora de instrumentar — aí o CS Macro + 6 fases entra em produção.

---

## 0b. Unit economics

> O processo CS Macro (High Touch — call de 1h + check-ins semanais + EBR + ligações mensais) **não fecha a conta no ticket R$97 quando escalar**. Você precisa estar consciente do limite antes de chegar nele.

**A conta hoje (ticket atual):**

| Item | Valor |
|---|---|
| Ticket mensal | R$97 |
| Carteira de uma consultora (High Touch) | ~50 clientes |
| MRR gerado pela consultora | R$97 × 50 = **R$4.850/mês** |
| Custo de uma consultora CLT (com encargos) | **R$3.500-4.500/mês** |
| Margem bruta sobrando | R$350-1.350/mês |
| % do MRR consumido só pela consultora | **70-90%** |

Sobra muito pouco pra cobrir produto, infra, marketing, impostos, salário do Kaynan. **A receita da carteira mal cobre quem atende ela.**

**3 saídas possíveis** (uma ou combinação):

**1. Subir o ticket via Land-and-Expand** *(estratégia já planejada)*
- Entra com financeiro básico em R$97
- Adiciona módulos pagos: estoque, fiscal, integração contador, multi-loja
- Ticket médio sobe pra R$200-400 ao longo da vida do cliente
- Mantém a mesma carteira High Touch viável
- **Risco**: precisa de tempo de produto + roadmap puxado por dor real

**2. Afinar o touch conforme escala**
- Manter High Touch só pros clientes Pro/Enterprise (ticket maior)
- Migrar Starter pra **Tech Touch** (resumo-sexta auto + dashboard + bot 24h)
- Consultora atende **100-150 clientes** porque o touch é mais leve
- **Risco**: piora retenção do Starter (eles dependem de relação humana)

**3. Cobrar setup / onboarding pago**
- Setup R$300-500 single fee na assinatura
- Cobre o custo da call de 1h + 1 mês de atendimento
- Aumenta CAC payback efetivo
- **Risco**: barreira de entrada maior na conversão

**Gatilhos pra mudar de modelo:**
- Quando carteira/consultora passar de 30 clientes ativos
- Quando margem bruta cair abaixo de R$1.000/cliente/ano
- Quando o tempo médio gasto por cliente/semana ficar acima de 30min

**Recomendação CCO (registrada em [project_cs_setup.md]):** rodar **CS Agora** até passar de ~15 clientes. Em paralelo, validar 1-2 add-ons monetizáveis. Quando carteira passar de 30 + a 1ª expansão de ticket converter, ativar CS Macro completo.

---

---

## 1. Como aplicar os templates no editor

Os 7 BPMNs ficam disponíveis no botão **Templates CS** (verde-água) dentro do Editor de cada card de processo.

**Passo-a-passo de aplicação inicial (1 vez só):**

1. Abrir `http://localhost:3000/` → menu **Processos**
2. Localizar o card antigo **"Pós-Venda"** (modelo Low Touch obsoleto)
3. Abrir o card → no editor, clicar no dropdown **Templates CS** → escolher **"CS Macro — Visão das 6 fases"** → confirmar substituição
4. Renomear o card de "Pós-Venda" para **"CS Macro"** (botão de renomear no header do editor)
5. Salvar
6. Voltar para a página Processos → criar **6 cards novos** (1 por fase) com os nomes:
   - `1. Implementação Guiada`
   - `2. Ativação`
   - `3. Hábito`
   - `4. Expansão`
   - `5. Renovação Anual`
   - `6. Advocacy`
7. Para cada card novo → abrir editor → dropdown **Templates CS** → escolher a fase correspondente → salvar

**Manutenção:**
- Quando o processo evoluir na operação, editar diretamente o BPMN do card e salvar.
- Quando precisar voltar à versão padrão, abrir dropdown **Templates CS** e recarregar (vai sobrescrever — confirmar antes).

---

## 2. CS Macro — visão das 6 fases

**Diagrama:** [csMacroTemplate.js](../src/utils/cs/csMacroTemplate.js)

Visão geral do ciclo de vida pós-venda do cliente. As 6 fases são sequenciais com gateways de qualificação entre cada uma e um caminho de risco (Save Playbook) operado pelo Kaynan.

**Raias:** Cliente · Consultora de Relacionamento · Kaynan (Fundador) · Sistema (CRM + WhatsApp + Asaas)

**Fluxo:**

```
Contrato assinado (D0)
  → 1. Implementação Guiada (D0-D7)     → TTV ≤48h? Sim → ...  Não → Save Playbook
  → 2. Ativação (D8-D30)                → Ativado? Sim → ...   Não → Save Playbook
  → 3. Hábito (D31-D120)                → Health ≥70 M3? Sim → ...  Não → Save Playbook
  → 4. Expansão (M4-M11)
  → 5. Renovação Anual (M10-M12)        → Renovou? Sim → ...   Não → End (Churn)
  → 6. Advocacy (M12+)
  → Cliente long-term 3+ anos
```

**Sistema (automações contínuas):**
- Health Score 5 sinais (semanal)
- Resumo-sexta-17h auto via WhatsApp (semanal)
- Dunning 7 passos (cartão recusado)

**Kaynan:**
- Save Playbook (intervenção em risco quando gateway de qualidade negativo)
- Aprovar upgrade / exception (autoriza desconto, parcelamento, condição especial)

---

## 3. Fase 1 — Implementação Guiada (D0-D7)

**Diagrama:** [cs01ImplementacaoTemplate.js](../src/utils/cs/cs01ImplementacaoTemplate.js)

**Objetivo:** atingir TTV (Time To Value) ≤48h e criar vínculo emocional com a Consultora antes que o cliente se arrependa da compra.

**Métrica de sucesso da fase:** TTV ≤48h (cliente lança 1ª conta + 1ª venda + 1º pagamento em até 48h após o contrato) · NPS de onboarding ≥8 · 100% dos clientes participam da call D1.

**Por que essa é a fase mais crítica:** o cliente acabou de pagar. No mensal ele pode cancelar amanhã (sem fidelidade). No anual ele já antecipou os 12 meses mas vai virar detrator se se sentir abandonado. Os primeiros 7 dias decidem se ele vai usar a Fyness ou se vai esquecer.

**Atores e responsabilidades:**

| Quem | O que faz |
|---|---|
| Sistema | D0: dispara WhatsApp boas-vindas auto + cartilha visual 1 página |
| Kaynan | D0: grava áudio pessoal de 1min recebendo o cliente |
| Consultora | D0: agenda call D1-D2 (vídeo, tela compartilhada, 30-40min) |
| Consultora | D1-D2: conduz a call de implementação cadastrando JUNTO com o cliente: 1ª conta bancária + 1ª venda + 1º pagamento |
| Consultora | D2: corta a gravação da call em 3 vídeos curtos e envia no WhatsApp |
| Consultora | D3: áudio "conseguiu lançar ontem?" |
| Consultora | D5: mini-vídeo dica da semana (45-90s vertical) |
| Consultora | D6: check "tudo certo?" |
| Consultora | D7: call de 15min fechando o onboarding, define ritual sexta-17h, transiciona pra Fase 2 |

**Decisão final (gateway):** TTV ≤48h atingido?
- **Sim** → cliente vai pra Fase 2 (Ativação)
- **Não** → escala pro Kaynan → Save Playbook (CS Macro)

**Sinais de risco nessa fase:**
- Cliente não confirma call D1-D2 em 24h
- Call D1 ocorre mas cliente não lança nada nos 3 dias seguintes
- Não responde áudios D3 / D5 / D6
- Pede para reagendar a call D7

**Playbook de save (D0-D7):** Kaynan grava áudio pessoal pedindo desculpa por o cliente não estar conseguindo + oferece reagendamento prioritário + 1 mês grátis se for mensal. No anual, mantém call extra com Kaynan presente.

---

## 4. Fase 2 — Ativação (D8-D30)

**Diagrama:** [cs02AtivacaoTemplate.js](../src/utils/cs/cs02AtivacaoTemplate.js)

**Objetivo:** transformar o cliente onboardado em usuário recorrente com hábito mínimo de 3 usos por semana.

**Métrica de sucesso:** 3 semanas consecutivas com ≥3 usos no app · NPS na ligação M1 ≥7 · 0 sinal de churn declarado.

**Por que é crítica:** no mensal sem fidelidade, esse é o segundo momento mais perigoso. Se o cliente não forma hábito até o D30, ele cancela na próxima cobrança.

**Atores e responsabilidades:**

| Quem | O que faz |
|---|---|
| Sistema | Dispara Resumo-sexta-17h automático (toda sexta) — gancho de hábito obrigatório |
| Sistema | Atualiza Health Score semanalmente |
| Consultora | D10: check-in WhatsApp "como está indo a 1ª semana?" |
| Consultora | D17: check-in semana 2 — reforço do hábito + sugerir lançamento atrasado |
| Consultora | D24: check-in semana 3 — identifica bloqueio se uso <3x na semana |
| Consultora | M1 (D30): ligação de 15min "como está sendo o 1º mês?", mede NPS, identifica risco |

**Decisão final (gateway):** 3 semanas seguidas com ≥3 usos?
- **Sim** → vai pra Fase 3 (Hábito)
- **Não** → risco → Save Playbook

**Sinais de risco:**
- Usuário não abre o app por 7 dias
- Não responde 2 check-ins seguidos da Consultora
- Reclama de complexidade ou bug repetidamente
- Mensal pede para "pausar" ou pergunta de cancelamento

**Playbook de save (D8-D30):**
1. Consultora liga, não manda WhatsApp
2. Identifica bloqueio real (técnico, financeiro, prioridade)
3. Se técnico → Kaynan grava vídeo personalizado resolvendo
4. Se financeiro → desconto 1 mês ou pausa-não-cancela
5. Se prioridade → mostra valor concreto com dados do próprio cliente

---

## 5. Fase 3 — Hábito (D31-D120)

**Diagrama:** [cs03HabitoTemplate.js](../src/utils/cs/cs03HabitoTemplate.js)

**Objetivo:** consolidar uso sustentado e construir relacionamento profundo com Consultora + Kaynan. Esta fase dura 90 dias e cobre os meses M2, M3 e M4.

**Métrica de sucesso:** Health Score ≥70 no M3 · NPS ≥8 · uso semanal sustentado · EBR-áudio respondido pelo cliente.

**Por que é crítica:** silent churn (cliente para de abrir o app e some) acontece aqui. Sem o resumo-sexta-17h e o EBR-áudio, esse perfil de cliente esquece que assina.

**Atores e responsabilidades:**

| Quem | O que faz |
|---|---|
| Sistema | Resumo-sexta-17h toda semana (auto, obrigatório) |
| Sistema | Health Score contínuo — alerta Consultora se cair <70 |
| Consultora | M2 (D60): check-in WhatsApp em áudio personalizado |
| Sistema | M3 (D90): dispara pesquisa NPS auto |
| Consultora | M3: conversa sobre NPS — detrator escala, passivo aprofunda, promotor pede feedback positivo |
| Kaynan | M3: grava EBR-áudio de 2-3min com 3 insights específicos do negócio do cliente + 1 pergunta poderosa |
| Consultora | M3: envia EBR-áudio do Kaynan no WhatsApp do cliente, coleta resposta |
| Consultora | M4 (D120): check-in identificando trigger pra Fase 4 (Expansão) |

**Decisão final (gateway):** Health Score ≥70 no M3?
- **Sim** → vai pra Fase 4 (Expansão)
- **Não** → Save Playbook

**Sinais de risco:**
- Não responde EBR-áudio do Kaynan
- Para de abrir o resumo-sexta-17h
- NPS detrator (0-6) e não dá motivo
- Uso semanal cai abaixo de 1 vez por semana

**Playbook de save (D31-D120):**
1. Kaynan liga pessoalmente (não Consultora)
2. Pesquisa o negócio do cliente em profundidade (Google Maps, Instagram dele, etc)
3. Oferece sessão de "diagnóstico financeiro grátis" via vídeo
4. Mostra 1 economia/oportunidade concreta no caixa dele
5. Se renova confiança → volta pra Fase 3. Se não → Save Playbook continua

---

## 6. Fase 4 — Expansão (M4-M11)

**Diagrama:** [cs04ExpansaoTemplate.js](../src/utils/cs/cs04ExpansaoTemplate.js)

**Objetivo:** identificar o momento certo e converter cliente Starter para Pro (ou Pro para Enterprise) com base em triggers naturais — sem forçar upsell que destrói relacionamento.

**Métrica de sucesso:** 20% dos Starters convertem para Pro até o M12 · conversão dos triggered ≥30%.

**Atores e responsabilidades:**

| Quem | O que faz |
|---|---|
| Sistema | Monitora continuamente triggers: 2ª loja, funcionário contratado, faturamento +50%, integração mais complexa |
| Gateway | Só prossegue se Trigger detectado **E** Health Score ≥80 |
| Consultora | Pesquisa o contexto do cliente — conversa entendendo momento + dor específica |
| Kaynan | Aprova oferta de upgrade — define preço, desconto, condição especial |
| Consultora | Apresenta pitch no WhatsApp/call com valor específico pro momento do cliente |
| Sistema | Se cliente aceita → atualiza plano no Asaas + cobra próxima fatura |

**Decisões (gateways):**
1. Trigger detectado E health ≥80?
   - **Não** → mantém plano, segue monitorando
   - **Sim** → segue
2. Cliente aceitou upgrade?
   - **Sim** → upgrade efetivado
   - **Não** → mantém plano, repete trigger watch

**Regra de ouro:** sem trigger natural e sem health ≥80, **NÃO INSISTIR**. Esse perfil de cliente queima a relação se sentir empurra-empurra. O upgrade tem que parecer ideia do cliente.

**Triggers típicos no ICP:**
- Contratou 1º funcionário formal (precisa controlar folha)
- Abriu 2ª loja / 2º CNPJ
- Faturamento subiu +50% nos últimos 60 dias
- Pediu integração com contador / banco específico
- Mencionou "tô perdendo controle" ou "preciso de mais"

---

## 7. Fase 5 — Renovação Anual (M10-M12)

**Diagrama:** [cs05RenovacaoTemplate.js](../src/utils/cs/cs05RenovacaoTemplate.js)

**Objetivo:** renovar contratos antes que o cliente comece a pensar em sair. Dois alvos simultâneos.

**Métrica de sucesso:** 40% dos clientes mensais migram pra anual no M10-M12 · 80% dos clientes anuais renovam por mais 12 meses.

**Atores e fluxos:**

| Quem | O que faz |
|---|---|
| Sistema | M10: identifica tipo de plano (mensal sem fidelidade ou anual com fidelidade) |
| Gateway | Tipo de plano? **Mensal** ou **Anual** |
| Consultora (caminho Mensal) | Pitch migração mensal→anual: R$67/mês (−30%) + 13º mês grátis + brinde físico (kit Fyness) |
| Consultora (caminho Anual) | Pitch renovação anual +12m: preço mantido + bônus desconto 1º mês da nova vigência + kit Fyness |
| Kaynan | Se cliente recusa → entra com negociação especial: áudio pessoal + condição customizada (parcelar, abater, gift card) |
| Sistema | Se fechou → processa novo contrato no Asaas, antecipa 12 parcelas via cartão, ativa fidelidade 12m |

**Decisões (gateways):**
1. Tipo de plano? Mensal → pitch migração / Anual → pitch renovação
2. Cliente aceitou? Não → escala pro Kaynan
3. Kaynan fechou? Sim → processa contrato / Não → cliente segue como mensal (ou churna no fim do anual)

**Pitch racional do mensal→anual:**
- Economia: R$97×12 = R$1.164 vs R$67×12 = R$804 → economia de R$360/ano
- 13º mês grátis = + R$67 (efetivo R$427 de vantagem no ano)
- Cliente paga via cartão e Fyness recebe antecipado (caixa imediato)

---

## 8. Fase 6 — Advocacy (M12+)

**Diagrama:** [cs06AdvocacyTemplate.js](../src/utils/cs/cs06AdvocacyTemplate.js)

**Objetivo:** transformar cliente fiel em canal de aquisição (indicações) + caso de marca (depoimentos públicos).

**Métrica de sucesso:** 1 indicação convertida por cliente promotor por ano · 15% do novo MRR vem de referral · 5 cases publicados por trimestre.

**Pré-requisitos pra entrar nesta fase:**
- M12 atingido
- Renovou (anual ou migrou mensal→anual)
- NPS ≥9 (promotor real)

**Atores e responsabilidades:**

| Quem | O que faz |
|---|---|
| Consultora | Pede indicação personalizada: "Tem amigo dono de negócio que você acha que se beneficiaria?" (áudio) |
| Sistema | Monitora indicações recebidas, tag cliente_indicador no CRM, conta conversões |
| Sistema (se indicação convertida) | Aplica desconto R$50/mês × 3 meses no Asaas, notifica cliente via WhatsApp |
| Consultora | Agradece + reforça pra próxima indicação — áudio personalizado + visibilidade pública (story/post) |
| Kaynan | Convida pra case study: grava vídeo depoimento 60-90s ou texto + foto |
| Kaynan | Posta case nos canais Fyness: LP + redes + comunidade + email pra base |
| Consultora | Convida pra Comunidade Fyness — grupo WhatsApp/Telegram exclusivo de clientes promotores |
| Sistema | Pesquisa NPS semestral reconfirmando status de promotor |

**Estado final:** cliente promotor ativo, ciclo do CS Macro se completa, cliente entra em modo long-term sustentado.

---

## 9. Mecanismos transversais

Esses mecanismos atravessam todas as fases e são o que efetivamente segura o cliente nos 3+ anos.

### 9.1 Resumo-sexta-17h (auto via WhatsApp)
**O quê:** todo cliente recebe na sexta às 17h um resumo da semana com tendência do caixa do negócio dele, em formato áudio + imagem.

**Por quê:** gancho de hábito. Sem isso, esse perfil de cliente esquece que assina a Fyness. Estudos internos indicam que sem o ritual sexta-17h o churn no M3 dobra.

**Quem dispara:** Sistema (CRM + WhatsApp). Obrigatório, não opcional.

### 9.2 EBR-áudio (Executive Business Review em áudio do fundador)
**O quê:** trimestralmente o Kaynan grava 2-3min de áudio com 3 insights específicos do negócio do cliente + 1 pergunta poderosa.

**Por quê:** EBR formal de 1h não cabe na agenda do MEI/EPP. Áudio personalizado do fundador cria reciprocidade e diferencia da concorrência B2B genérica. Custa ~5min/cliente, gera vínculo que não escala em concorrente.

**Quem grava:** Kaynan. Quem envia: Consultora.

### 9.3 Dunning 7-passos (cartão recusado)
**O quê:** sequência de 7 ações em 7 dias quando o cartão do cliente é recusado.

| Passo | Quando | Ação |
|---|---|---|
| 1 | T+0 | Retry automático no cartão |
| 2 | T+2h | WhatsApp suave + link de pagamento PIX |
| 3 | T+24h | Novo retry + reenvio de PIX |
| 4 | T+48h | Ligação humana da Consultora |
| 5 | T+72h | Oferta "paga só esse mês via PIX, normaliza no mês que vem" |
| 6 | T+5d | Kaynan liga pessoalmente |
| 7 | T+7d | Pausa-não-cancela (mantém conta ativa, suspende cobrança 30d) |

**Meta:** recuperação ≥60% em 7 dias. Sem isso, no mensal sem fidelidade a Fyness perde o cliente limpo.

**Atenção — Dunning ≠ Carência:** o fluxo acima só roda **após** o cliente ter passado a carência e estar pagando. Cenário diferente está abaixo.

### 9.3b Watch de Carência (cliente em carência some)
**Contexto:** o cliente assinou contrato mas tem **X dias de carência** antes da 1ª cobrança. Nesse período ele **ainda não pagou nada** — se desengajar, sai limpo, sem custo.

**Sinal de risco:** cliente em carência que para de responder por **2 dias seguidos**.

**Ação:**
1. Kaynan (não Consultora) liga pessoalmente
2. Foco **NÃO** é pagamento — é valor da ferramenta
3. Pergunta direto: "tá tudo bem? algo travando?"
4. Se cliente diz que vai cancelar antes de pagar: **escala pro time de aquisição** — provavelmente esperou expectativa errada na venda

**Por que importa:** cliente que some na carência **não é falha de retenção** — é falha de aquisição. Documenta como "no-show de carência" no CRM e revisa o discurso de venda se acontecer 2+ vezes.

**Meta:** ≤10% de no-show de carência. Acima disso, há problema sistêmico na venda (overselling, perfil errado, expectativa mal alinhada).

### 9.4 Save Playbook (intervenção em risco)
**Quem opera:** Kaynan.

**Quando entra:** sempre que um gateway de qualidade negativa dispara (TTV não atingido, ativação falhou, health <70 no M3, NPS detrator que não evolui).

**O que faz:**
1. Identifica raiz do problema (caixa, técnico, expectativa, vida pessoal)
2. Oferece o que faz sentido pra esse caso específico (não receita pronta)
3. Reenquadra o valor pra realidade do cliente
4. Documenta motivo de risco no CRM pra ajustar processo de aquisição

---

## 10. Health Score — 5 sinais

Pontuação 0-100 calculada semanalmente pelo sistema.

| Sinal | Peso | O que mede |
|---|---|---|
| Uso semanal | 30 | Frequência de abertura do app na última semana |
| Pagamento | 25 | Histórico de pagamentos em dia / atrasos / recusas |
| NPS | 20 | Última nota dada na pesquisa trimestral |
| Override-rate IA | 15 | Quantas vezes o cliente corrigiu sugestões da IA financeira (alto = baixa confiança) |
| Resposta a outreach | 10 | Se responde mensagens da Consultora em até 48h |

**Thresholds:**
- **<40** → Risco crítico → Save Playbook do Kaynan
- **40-69** → Atenção → Consultora intensifica relacionamento
- **≥70** → Saudável → fluxo normal
- **≥85** → Expansion candidate → entra em watch da Fase 4

---

## 11. Riscos específicos do ICP e mitigação

Sete riscos do perfil MEI/EPP que destroem retenção e como o processo defende cada um:

| Risco | Mitigação no processo |
|---|---|
| Cancela no 1º mês ruim do caixa | Resumo-sexta-17h mostra TENDÊNCIA (não só saldo) + dunning suave converte |
| Baixa literacia digital | Onboarding via WhatsApp áudio/foto, zero dashboard obrigatório no D0-D7 |
| Decisão emocional | EBR-áudio trimestral do Kaynan cria vínculo que concorrente B2B não replica |
| Silent churn (esquece que assinou) | Sexta-17h obrigatório toda semana |
| Cartão estoura limite (típico MEI) | Dunning 7d com PIX + pausa-não-cancela |
| Concorrente "grátis" aparece | Insights específicos do negócio do cliente no EBR-áudio = moat de relacionamento |
| Cliente cresce e procura contador externo | Expansion path Starter→Pro→Enterprise documentado captura antes do cliente procurar fora |

---

## 12. Metas anuais

Metas de saída para o processo de CS rodando 12 meses:

| Métrica | Alvo 12 meses |
|---|---|
| NDR (Net Dollar Retention) | 115% |
| Logo retention M12 | 85% |
| TTV (Time To Value) médio | ≤48h |
| NPS sistemático | ≥50 |
| Conversão mensal→anual M10 | 40% |
| Renovação anuais | 80% |
| Upgrade Starter→Pro até M12 | 20% |
| Indicações convertidas por cliente promotor/ano | 1 |
| MRR novo via referral | 15% |
| Recuperação dunning em 7d | ≥60% |

**Bússola operacional:** surpresa = falha de instrumentação. Se um cliente Enterprise churnar e você não viu vindo, o Health Score falhou. Construa o instrumento antes do processo — não inverta.

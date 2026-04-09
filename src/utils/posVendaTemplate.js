/**
 * Template BPMN 2.0 — POS-VENDA FYNESS (3 Pools)
 * Processo completo de pos-venda para SaaS financeiro Fyness
 * Modelo Low Touch: automacao + WhatsApp
 *
 * ═══════════════════════════════════════════════════════════════════════
 * PRODUTO FYNESS:
 * - Assistente Financeiro no WhatsApp (manda foto, assistente lanca automatico)
 * - Plataforma de Educacao Financeira
 * - Comunidade de Empresarios
 * Lancamento: 20 de Abril | Modelo Low Touch (automacao + WhatsApp)
 *
 * MODELO 3 POOLS:
 * Pool 1: ONBOARDING          → Primeiros 30 dias, ativar cliente
 * Pool 2: CS / RETENCAO       → Continuo, manter cliente saudavel
 * Pool 3: INDICACAO E FEEDBACK → Transformar promotor em canal de aquisicao
 *
 * PORTAIS (Link Events substituem Message Flows):
 * → CS/RETENCAO  = Cliente onboardado vai pro Pool CS
 * → INDICACAO    = Promotor vai pro Pool Indicacao
 *
 * Criado: Abril 2026 | Equipe Fyness | v1
 * ═══════════════════════════════════════════════════════════════════════
 */

export const POS_VENDA_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
 xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
 xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
 xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
 xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0"
 id="Definitions_PosVenda"
 targetNamespace="http://fyness.com/bpmn/pos-venda-v1">

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- COLLABORATION: 3 POOLS + PORTAIS (Link Events)                -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmn2:collaboration id="Collaboration_PosVenda">

   <!-- POOL 1: ONBOARDING (GREEN) -->
   <bpmn2:participant id="Pool_Onboarding" name="ONBOARDING — Primeiros 30 Dias (Ativacao do Cliente)" processRef="Process_Onboarding" />

   <!-- POOL 2: CS / RETENCAO (BLUE) -->
   <bpmn2:participant id="Pool_CS" name="CS / RETENCAO — Acompanhamento Continuo (Health Score + NPS + Anti-Churn)" processRef="Process_CS" />

   <!-- POOL 3: INDICACAO E FEEDBACK (ORANGE) -->
   <bpmn2:participant id="Pool_Indicacao" name="INDICACAO E FEEDBACK — Transformar Promotores em Canal de Aquisicao" processRef="Process_Indicacao" />

   <!-- TEXT ANNOTATIONS -->
   <bpmn2:textAnnotation id="Annotation_Metricas">
     <bpmn2:text>METRICAS POS-VENDA FYNESS:
Churn mensal alvo: menos de 3%
NPS alvo: acima de 50
Health Score verde: acima de 70% da base
Taxa renovacao: acima de 80%
Tempo medio primeira acao: menos de 24h
Taxa indicacao: 10% dos promotores indicam
LTV alvo: 24+ meses

REGRAS DE OURO:
1. Cliente sem usar 7 dias = alerta vermelho
2. Inadimplente no dia seguinte = contato imediato
3. NPS detrator = ligar em 24h
4. Renovacao = contato 30 dias antes
5. Todo cancelamento = catalogar motivo
6. Perder 1 mensalidade pra salvar 12 = bom negocio</bpmn2:text>
   </bpmn2:textAnnotation>

   <bpmn2:textAnnotation id="Annotation_Marcos">
     <bpmn2:text>MARCOS DE SUCESSO FYNESS:

Marco 1: Primeiro lancamento pelo WhatsApp (D0-D1)
O cliente mandou foto/comprovante e VIU o assistente lancar.
Esse e o momento WOW. Se nao acontecer em 24h = risco.

Marco 2: Primeira semana com lancamentos diarios (D1-D7)
Cliente criou o habito de mandar comprovantes.
Se parou = follow-up imediato.

Marco 3: Primeiro mes completo (D30)
DRE do mes pronto. Cliente ve o lucro real pela primeira vez.
Momento de reforco: 'Voce nunca mais vai ficar no escuro.'

Marco 4: Primeira recomendacao do assistente (D7-D30)
Assistente avisou: cortar custo, conta vencendo, etc.
Cliente percebe que o assistente TRABALHA pra ele.

Marco 5: Primeiro NPS positivo (D90)
Cliente recomenda. Hora de pedir depoimento + indicacao.</bpmn2:text>
   </bpmn2:textAnnotation>

 </bpmn2:collaboration>

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- POOL 1: ONBOARDING — Primeiros 30 Dias (GREEN)                -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmn2:process id="Process_Onboarding" isExecutable="false">

   <bpmn2:startEvent id="Start_Onb" name="Cliente pagou">
     <bpmn2:documentation>Gatilho: pagamento confirmado no sistema.
O cliente acabou de assinar o Fyness (trial convertido ou venda direta).
Iniciar onboarding IMEDIATAMENTE — cada hora sem ativacao e risco de churn.</bpmn2:documentation>
     <bpmn2:outgoing>Flow_Onb_01</bpmn2:outgoing>
   </bpmn2:startEvent>

   <bpmn2:task id="Task_Onb_BoasVindas" name="Boas-vindas WhatsApp">
     <bpmn2:documentation>MENSAGEM DE BOAS-VINDAS (enviar imediatamente apos pagamento):

"Bem-vindo ao Fyness! Manda agora a primeira foto de comprovante e ve a magica acontecer. Alem disso, ja liberei seu acesso a plataforma de educacao financeira e a comunidade de empresarios."

OBJETIVO: Fazer o cliente agir AGORA. Nao explicar funcionalidades — fazer ele EXPERIMENTAR.
O momento WOW e ver o assistente lancar automatico a partir da foto.

CHECKLIST:
- Mensagem enviada em ate 5 minutos apos pagamento
- Link da plataforma de educacao incluso
- Link da comunidade incluso
- Tom: entusiasmado mas direto</bpmn2:documentation>
     <bpmn2:incoming>Flow_Onb_01</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Onb_02</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_Onb_PrimeiroLancamento" name="Primeiro lancamento assistente">
     <bpmn2:documentation>MARCO DE SUCESSO #1 — Primeiro lancamento pelo WhatsApp

O cliente mandou a primeira foto/comprovante pelo WhatsApp e VIU o assistente lancar automaticamente.
Esse e o momento WOW — o cliente entende o valor do produto na pratica.

REGRA: Se nao fez em 24h = FOLLOW-UP IMEDIATO.

MONITORAR:
- Cliente mandou foto/comprovante? (verificar no sistema)
- Assistente processou corretamente? (verificar log)
- Cliente reagiu? (verificar se mandou mais ou se parou)

Se processou com sucesso: marcar Marco 1 como concluido no CRM.
Se deu erro no processamento: resolver URGENTE e avisar o cliente.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Onb_02</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Onb_03</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_Onb_FezLancamento" name="Fez primeiro lancamento?">
     <bpmn2:incoming>Flow_Onb_03</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Onb_04_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_Onb_05_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:task id="Task_Onb_FollowUp" name="Follow-up D3 D5 D7">
     <bpmn2:documentation>CADENCIA DE FOLLOW-UP (cliente NAO fez primeiro lancamento):

D3 — WhatsApp:
"Ainda nao mandou seu primeiro comprovante? Manda agora e ve como funciona - leva 5 segundos."

D5 — WhatsApp (pressao social):
"Seus concorrentes ja estao controlando o financeiro. Voce ainda nao comecou."

D7 — LIGAR PESSOALMENTE:
Ligacao do CS. "Oi [Nome], aqui e [CS] do Fyness. Vi que voce assinou mas ainda nao mandou o primeiro comprovante. Ta tudo bem? Posso te ajudar agora mesmo — leva 30 segundos."

OBJETIVO: Cada dia sem uso e risco de churn.
Se nao engajou ate D7 = risco alto de cancelamento precoce.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Onb_05_Nao</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Onb_06</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_Onb_Engajou" name="Engajou?">
     <bpmn2:incoming>Flow_Onb_06</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Onb_07_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_Onb_08_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:endEvent id="End_Onb_RiscoChurn" name="Risco churn inicial">
     <bpmn2:documentation>Cliente nao engajou apos follow-up D3/D5/D7.
ALTO RISCO de cancelamento precoce.
Registrar no CRM como "churn risk - nao ativou".
Considerar ligacao do gestor como ultima tentativa.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Onb_08_Nao</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:task id="Task_Onb_PrimeiraSemana" name="Primeira semana - acompanhar uso diario">
     <bpmn2:documentation>ACOMPANHAMENTO PRIMEIRA SEMANA (D1-D7):

Verificar DIARIAMENTE se o cliente esta mandando lancamentos pelo WhatsApp.
O habito de mandar comprovantes e o que garante retencao.

SE PAROU DE MANDAR:
WhatsApp: "Oi [Nome], vi que faz X dias que voce nao manda lancamento. Ta tudo bem? Posso te ajudar?"

MONITORAR:
- Quantos lancamentos por dia?
- Esta usando so foto ou tambem audio/texto?
- Abriu a plataforma de educacao?
- Entrou na comunidade?

MARCO 2: Cliente mandou lancamentos por 5+ dias na primeira semana = habito criado.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Onb_04_Sim</bpmn2:incoming>
     <bpmn2:incoming>Flow_Onb_07_Sim</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Onb_09</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_Onb_PrimeiroMes" name="Primeiro mes completo - DRE pronto">
     <bpmn2:documentation>MARCO 3 — PRIMEIRO MES COMPLETO (D30):

O DRE do primeiro mes esta pronto. O cliente ve o lucro real pela primeira vez.
Esse e o momento de REFORCO — mostrar o valor concreto.

WhatsApp:
"Seu primeiro relatorio financeiro ta pronto! Pela primeira vez voce sabe EXATAMENTE quanto lucrou esse mes. Quer que eu te explique cada numero?"

ACOES:
1. Enviar DRE resumido por WhatsApp (screenshot ou link)
2. Oferecer explicacao personalizada
3. Destacar insights: "Voce gastou X% com Y — isso ta acima da media do setor"
4. Reforcar: "Voce nunca mais vai ficar no escuro sobre o financeiro"

Se o cliente responder positivamente: momento ideal para pedir feedback.
Se nao responder: follow-up em 2 dias.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Onb_09</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Onb_10</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:intermediateThrowEvent id="Link_Onb_ToCS" name="→ CS/RETENCAO">
     <bpmn2:documentation>PORTAL: Cliente onboardado com sucesso.
Passou pelos marcos 1-3 (primeiro lancamento, primeira semana, primeiro mes).
Agora entra no fluxo continuo de CS/Retencao (Pool 2).</bpmn2:documentation>
     <bpmn2:incoming>Flow_Onb_10</bpmn2:incoming>
     <bpmn2:linkEventDefinition name="CS_RETENCAO" />
   </bpmn2:intermediateThrowEvent>

   <!-- SEQUENCE FLOWS -->
   <bpmn2:sequenceFlow id="Flow_Onb_01" sourceRef="Start_Onb" targetRef="Task_Onb_BoasVindas" />
   <bpmn2:sequenceFlow id="Flow_Onb_02" sourceRef="Task_Onb_BoasVindas" targetRef="Task_Onb_PrimeiroLancamento" />
   <bpmn2:sequenceFlow id="Flow_Onb_03" sourceRef="Task_Onb_PrimeiroLancamento" targetRef="Gw_Onb_FezLancamento" />
   <bpmn2:sequenceFlow id="Flow_Onb_04_Sim" name="Sim" sourceRef="Gw_Onb_FezLancamento" targetRef="Task_Onb_PrimeiraSemana" />
   <bpmn2:sequenceFlow id="Flow_Onb_05_Nao" name="Nao" sourceRef="Gw_Onb_FezLancamento" targetRef="Task_Onb_FollowUp" />
   <bpmn2:sequenceFlow id="Flow_Onb_06" sourceRef="Task_Onb_FollowUp" targetRef="Gw_Onb_Engajou" />
   <bpmn2:sequenceFlow id="Flow_Onb_07_Sim" name="Sim" sourceRef="Gw_Onb_Engajou" targetRef="Task_Onb_PrimeiraSemana" />
   <bpmn2:sequenceFlow id="Flow_Onb_08_Nao" name="Nao" sourceRef="Gw_Onb_Engajou" targetRef="End_Onb_RiscoChurn" />
   <bpmn2:sequenceFlow id="Flow_Onb_09" sourceRef="Task_Onb_PrimeiraSemana" targetRef="Task_Onb_PrimeiroMes" />
   <bpmn2:sequenceFlow id="Flow_Onb_10" sourceRef="Task_Onb_PrimeiroMes" targetRef="Link_Onb_ToCS" />

 </bpmn2:process>

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- POOL 2: CS / RETENCAO — Continuo (BLUE)                       -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmn2:process id="Process_CS" isExecutable="false">

   <bpmn2:intermediateCatchEvent id="Link_CS_FromOnb" name="← ONBOARDING">
     <bpmn2:documentation>PORTAL: Cliente vem do Onboarding (Pool 1).
Ja completou os primeiros 30 dias e os marcos iniciais.
Agora entra no acompanhamento continuo.</bpmn2:documentation>
     <bpmn2:outgoing>Flow_CS_01</bpmn2:outgoing>
     <bpmn2:linkEventDefinition name="CS_RETENCAO" />
   </bpmn2:intermediateCatchEvent>

   <bpmn2:task id="Task_CS_HealthScore" name="Health Score mensal">
     <bpmn2:documentation>HEALTH SCORE — Automatico pelo CRM (verificar mensalmente):

CRITERIOS:
1. Esta usando o assistente? (lancamentos nos ultimos 7 dias)
2. Abriu a plataforma de educacao?
3. Participou da comunidade?
4. Esta adimplente?

SCORE:
- VERDE (tudo ok): 3-4 criterios atendidos. Cliente saudavel.
- AMARELO (1-2 falhas): Atencao. Mandar WhatsApp proativo.
- VERMELHO (3+ falhas ou inadimplente): URGENTE. Gatilho risco churn.

ACAO POR SCORE:
- Verde: seguir fluxo normal (NPS trimestral)
- Amarelo: WhatsApp "Oi [Nome], percebi que voce nao usou [funcionalidade] essa semana. Posso te ajudar?"
- Vermelho: ir para Gatilho risco churn IMEDIATO</bpmn2:documentation>
     <bpmn2:incoming>Flow_CS_01</bpmn2:incoming>
     <bpmn2:incoming>Flow_CS_Recuperou_Sim</bpmn2:incoming>
     <bpmn2:incoming>Flow_CS_Ficou_Sim</bpmn2:incoming>
     <bpmn2:outgoing>Flow_CS_02</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_CS_Parallel_Renovacao</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_CS_Parallel_Inadimplencia</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_CS_ScoreOK" name="Score OK?">
     <bpmn2:incoming>Flow_CS_02</bpmn2:incoming>
     <bpmn2:outgoing>Flow_CS_03_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_CS_04_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <!-- CAMINHO POSITIVO: NPS -->
   <bpmn2:task id="Task_CS_NPS" name="NPS trimestral">
     <bpmn2:documentation>NPS — A cada 3 meses:

Pergunta simples por WhatsApp:
"De 0 a 10, quanto voce recomendaria o Fyness?"

CLASSIFICACAO:
- Promotor (9-10): Pedir depoimento + indicacao. Encaminhar para Pool Indicacao.
- Neutro (7-8): Perguntar "O que a gente poderia melhorar pra virar nota 10?"
- Detrator (0-6): URGENTE — ligar em 24h e resolver.

REGRAS:
- Enviar por WhatsApp (maior taxa de resposta)
- Se nao respondeu em 48h: reenviar 1x
- Registrar TODOS os scores no CRM
- Acompanhar evolucao trimestre a trimestre</bpmn2:documentation>
     <bpmn2:incoming>Flow_CS_03_Sim</bpmn2:incoming>
     <bpmn2:outgoing>Flow_CS_05</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_CS_NPS" name="NPS >= 8?">
     <bpmn2:incoming>Flow_CS_05</bpmn2:incoming>
     <bpmn2:outgoing>Flow_CS_06_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_CS_07_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:intermediateThrowEvent id="Link_CS_ToIndicacao" name="→ INDICACAO">
     <bpmn2:documentation>PORTAL: Cliente promotor (NPS 9-10).
Encaminhar para Pool Indicacao (Pool 3) para pedir depoimento e ativar programa de indicacao.</bpmn2:documentation>
     <bpmn2:incoming>Flow_CS_06_Sim</bpmn2:incoming>
     <bpmn2:linkEventDefinition name="INDICACAO" />
   </bpmn2:intermediateThrowEvent>

   <bpmn2:task id="Task_CS_LigarInsatisfacao" name="Ligar e entender insatisfacao">
     <bpmn2:documentation>NPS ABAIXO DE 8 — Ligar e entender:

SCRIPT:
"Oi [Nome], vi que voce deu nota [X] pro Fyness. Quero entender o que a gente pode melhorar.
O que ta te incomodando? O que voce esperava que nao esta acontecendo?"

ACOES:
- Registrar feedback detalhado no CRM
- Se for bug/problema tecnico: resolver em 24h
- Se for falta de funcionalidade: registrar e dar prazo
- Se for preco: avaliar desconto temporario
- Se for falta de uso: ajudar a reativar

OBJETIVO: Transformar neutro/detrator em promotor.</bpmn2:documentation>
     <bpmn2:incoming>Flow_CS_07_Nao</bpmn2:incoming>
     <bpmn2:outgoing>Flow_CS_LigarInsatisfacao_Back</bpmn2:outgoing>
   </bpmn2:task>

   <!-- CAMINHO NEGATIVO: RISCO CHURN -->
   <bpmn2:task id="Task_CS_GatilhoRisco" name="Gatilho risco churn">
     <bpmn2:documentation>GATILHO RISCO CHURN — Cliente em perigo:

SINAIS DE ALERTA:
- Sem usar o assistente ha 7+ dias
- Inadimplente
- Pediu backup/exportacao de dados
- Reclamou publicamente
- NPS detrator (0-6)

ACAO IMEDIATA:
1. WhatsApp: "Oi [Nome], percebi que faz [X] dias que voce nao usa o Fyness. Ta tudo bem? Posso te ajudar com alguma coisa?"
2. Se nao responder em 24h: LIGAR
3. Entender o motivo: falta de tempo? dificuldade? insatisfacao?
4. Resolver o problema na hora se possivel

REGRA: Cada dia de inatividade aumenta a chance de churn exponencialmente.</bpmn2:documentation>
     <bpmn2:incoming>Flow_CS_04_Nao</bpmn2:incoming>
     <bpmn2:outgoing>Flow_CS_08</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_CS_Recuperou" name="Recuperou?">
     <bpmn2:incoming>Flow_CS_08</bpmn2:incoming>
     <bpmn2:outgoing>Flow_CS_Recuperou_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_CS_Recuperou_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:task id="Task_CS_Negociacao" name="Negociacao anti-churn">
     <bpmn2:documentation>NEGOCIACAO ANTI-CHURN — Ultima tentativa antes do cancelamento:

OFERTAS (escada de retencao):
1. 1 mes gratis: "Fica mais 1 mes por nossa conta. Se nao gostar, cancela sem custo."
2. Desconto temporario: "Posso te dar 30% de desconto nos proximos 3 meses."
3. Reuniao com especialista: "Agenda 15 min comigo — vou te mostrar como tirar mais valor do Fyness pro seu negocio."

REGRA DE OURO: Perder 1 mensalidade pra ganhar 12 = bom negocio.
Se o cliente custa R$197/mes e o LTV medio e 24 meses = R$4.728.
Dar 1 mes gratis (R$197) pra salvar R$4.531 = ROI de 2.200%.

NUNCA:
- Dar desconto sem entender o motivo da saida
- Prometer funcionalidade que nao existe
- Ser agressivo ou culpar o cliente</bpmn2:documentation>
     <bpmn2:incoming>Flow_CS_Recuperou_Nao</bpmn2:incoming>
     <bpmn2:outgoing>Flow_CS_09</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_CS_Ficou" name="Ficou?">
     <bpmn2:incoming>Flow_CS_09</bpmn2:incoming>
     <bpmn2:outgoing>Flow_CS_Ficou_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_CS_Ficou_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:task id="Task_CS_CatalogarMotivo" name="Catalogar motivo cancelamento">
     <bpmn2:documentation>CATALOGAR MOTIVO DE CANCELAMENTO:

Todo cancelamento DEVE ser registrado com motivo em categorias:
- PRECO: "Ta caro demais pra mim"
- NAO USOU: "Nao consegui criar o habito"
- CONCORRENTE: "Achei outra solucao"
- EMPRESA FECHOU: "Fechei o negocio"
- FUNCIONALIDADE FALTANDO: "Preciso de X e voces nao tem"
- VENDA ERRADA: "Nao era o que eu esperava"

DADOS PARA MELHORIA:
- Registrar no CRM com data, motivo e detalhes
- Relatorio mensal de churn por categoria
- Se mesma categoria > 20% dos churns: ALERTA pro time de produto
- Feedback direto do cliente: "O que a gente deveria ter feito diferente?"

REGRA: Nao existe churn sem motivo catalogado.</bpmn2:documentation>
     <bpmn2:incoming>Flow_CS_Ficou_Nao</bpmn2:incoming>
     <bpmn2:outgoing>Flow_CS_10</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:endEvent id="End_CS_Cancelou" name="Cliente cancelou">
     <bpmn2:incoming>Flow_CS_10</bpmn2:incoming>
   </bpmn2:endEvent>

   <!-- CAMINHOS PARALELOS -->
   <bpmn2:task id="Task_CS_Renovacao" name="Renovacao contrato - ligar 30 dias antes">
     <bpmn2:documentation>RENOVACAO DE CONTRATO — Contato 30 dias antes do vencimento:

SCRIPT:
"Oi [Nome], seu contrato com o Fyness vence em [data]. Como foi o ano? Quer renovar com condicoes especiais?"

ACOES:
1. Verificar Health Score do cliente antes de ligar
2. Se Score verde: oferecer renovacao com desconto de fidelidade (5-10%)
3. Se Score amarelo: resolver pendencias ANTES de falar de renovacao
4. Se Score vermelho: tratar como risco de churn primeiro

CONDICOES ESPECIAIS DE RENOVACAO:
- Upgrade de plano mensal para anual: desconto de 30%
- Renovacao antecipada (60+ dias antes): desconto extra de 5%
- Indicacao na renovacao: 1 mes gratis

REGRA: NUNCA deixar o contrato vencer sem contato previo.</bpmn2:documentation>
     <bpmn2:incoming>Flow_CS_Parallel_Renovacao</bpmn2:incoming>
   </bpmn2:task>

   <bpmn2:task id="Task_CS_Inadimplencia" name="Prevencao inadimplencia - cobrar no dia seguinte">
     <bpmn2:documentation>PREVENCAO DE INADIMPLENCIA — Contato no dia seguinte ao vencimento:

DIA 1 (dia seguinte ao vencimento):
WhatsApp: "Oi [Nome], vi que a fatura venceu ontem. Precisa de segunda via?"

DIA 3 (se nao pagou):
Ligar: "Oi [Nome], sua fatura do Fyness ta pendente ha 3 dias. Aconteceu alguma coisa? Posso gerar um boleto atualizado ou trocar a forma de pagamento."

DIA 7 (se nao pagou):
WhatsApp: "Seu acesso ao Fyness sera suspenso em [X] dias por falta de pagamento. Nao quero que voce perca seus dados e relatorios. Posso te ajudar a resolver?"

DIA 15:
Suspensao do acesso + ultima tentativa de contato.

REGRA: Inadimplencia nao tratada vira churn silencioso.
Cobrar no dia seguinte e CUIDADO, nao grosseria.</bpmn2:documentation>
     <bpmn2:incoming>Flow_CS_Parallel_Inadimplencia</bpmn2:incoming>
   </bpmn2:task>

   <!-- SEQUENCE FLOWS -->
   <bpmn2:sequenceFlow id="Flow_CS_01" sourceRef="Link_CS_FromOnb" targetRef="Task_CS_HealthScore" />
   <bpmn2:sequenceFlow id="Flow_CS_02" sourceRef="Task_CS_HealthScore" targetRef="Gw_CS_ScoreOK" />
   <bpmn2:sequenceFlow id="Flow_CS_03_Sim" name="Sim" sourceRef="Gw_CS_ScoreOK" targetRef="Task_CS_NPS" />
   <bpmn2:sequenceFlow id="Flow_CS_04_Nao" name="Nao" sourceRef="Gw_CS_ScoreOK" targetRef="Task_CS_GatilhoRisco" />
   <bpmn2:sequenceFlow id="Flow_CS_05" sourceRef="Task_CS_NPS" targetRef="Gw_CS_NPS" />
   <bpmn2:sequenceFlow id="Flow_CS_06_Sim" name="Sim" sourceRef="Gw_CS_NPS" targetRef="Link_CS_ToIndicacao" />
   <bpmn2:sequenceFlow id="Flow_CS_07_Nao" name="Nao" sourceRef="Gw_CS_NPS" targetRef="Task_CS_LigarInsatisfacao" />
   <bpmn2:sequenceFlow id="Flow_CS_LigarInsatisfacao_Back" sourceRef="Task_CS_LigarInsatisfacao" targetRef="Task_CS_HealthScore" />
   <bpmn2:sequenceFlow id="Flow_CS_08" sourceRef="Task_CS_GatilhoRisco" targetRef="Gw_CS_Recuperou" />
   <bpmn2:sequenceFlow id="Flow_CS_Recuperou_Sim" name="Sim" sourceRef="Gw_CS_Recuperou" targetRef="Task_CS_HealthScore" />
   <bpmn2:sequenceFlow id="Flow_CS_Recuperou_Nao" name="Nao" sourceRef="Gw_CS_Recuperou" targetRef="Task_CS_Negociacao" />
   <bpmn2:sequenceFlow id="Flow_CS_09" sourceRef="Task_CS_Negociacao" targetRef="Gw_CS_Ficou" />
   <bpmn2:sequenceFlow id="Flow_CS_Ficou_Sim" name="Sim" sourceRef="Gw_CS_Ficou" targetRef="Task_CS_HealthScore" />
   <bpmn2:sequenceFlow id="Flow_CS_Ficou_Nao" name="Nao" sourceRef="Gw_CS_Ficou" targetRef="Task_CS_CatalogarMotivo" />
   <bpmn2:sequenceFlow id="Flow_CS_10" sourceRef="Task_CS_CatalogarMotivo" targetRef="End_CS_Cancelou" />
   <bpmn2:sequenceFlow id="Flow_CS_Parallel_Renovacao" sourceRef="Task_CS_HealthScore" targetRef="Task_CS_Renovacao" />
   <bpmn2:sequenceFlow id="Flow_CS_Parallel_Inadimplencia" sourceRef="Task_CS_HealthScore" targetRef="Task_CS_Inadimplencia" />

 </bpmn2:process>

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- POOL 3: INDICACAO E FEEDBACK (ORANGE)                         -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmn2:process id="Process_Indicacao" isExecutable="false">

   <bpmn2:intermediateCatchEvent id="Link_Ind_FromCS" name="← CS">
     <bpmn2:documentation>PORTAL: Cliente promotor vem do CS (Pool 2).
NPS 9-10 = promotor confirmado. Hora de ativar como canal de aquisicao.</bpmn2:documentation>
     <bpmn2:outgoing>Flow_Ind_01</bpmn2:outgoing>
     <bpmn2:linkEventDefinition name="INDICACAO" />
   </bpmn2:intermediateCatchEvent>

   <bpmn2:task id="Task_Ind_Depoimento" name="Pedir depoimento video/texto">
     <bpmn2:documentation>PEDIR DEPOIMENTO — Aproveitar o momento de satisfacao:

SCRIPT WhatsApp:
"Voce disse que recomendaria o Fyness nota [X]! Posso te pedir um favor? Grava um video de 30 segundos contando como o Fyness mudou seu financeiro. Em troca, te dou 1 mes gratis."

ALTERNATIVA (se nao quer gravar video):
"Sem problema! Pode mandar um texto aqui mesmo pelo WhatsApp contando sua experiencia. Tambem vale 1 mes gratis."

DICAS PRO VIDEO:
- Pedir que fale: nome, empresa, como era antes, como e agora com Fyness
- Maximo 30 segundos (videos longos nao convertem)
- Pode ser selfie no celular mesmo (autenticidade > producao)

USO DO DEPOIMENTO:
- Landing page (com autorizacao)
- Anuncios Meta Ads / Google Ads
- Posts na comunidade
- Material de vendas do time comercial</bpmn2:documentation>
     <bpmn2:incoming>Flow_Ind_01</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Ind_02</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_Ind_Programa" name="Programa de indicacao - R$50 desconto por indicacao">
     <bpmn2:documentation>PROGRAMA DE INDICACAO — Transformar promotor em canal de aquisicao:

SCRIPT WhatsApp:
"Conhece algum empresario que controla financeiro na mao? Indica pro Fyness e voce ganha R$50 de desconto na proxima mensalidade pra cada indicacao que virar cliente."

MECANICA:
- Cliente indica pelo WhatsApp (manda nome + telefone do indicado)
- CS entra em contato com o indicado mencionando quem indicou
- Se o indicado virar cliente: R$50 de desconto pro indicador
- Sem limite de indicacoes (pode indicar 10 e ganhar R$500)

TRACKING:
- Registrar no CRM: quem indicou, quem foi indicado, status
- Relatorio mensal de indicacoes por cliente
- Top indicadores: reconhecer na comunidade

META: 10% dos promotores indicam pelo menos 1 pessoa.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Ind_02</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Ind_03</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_Ind_Comunidade" name="Comunidade ativa - postar cases">
     <bpmn2:documentation>COMUNIDADE ATIVA — Postar cases de sucesso:

ACOES:
- Postar cases de sucesso na comunidade com autorizacao do cliente
- Exemplos: "Cliente X economizou R$3k/mes", "Cliente Y descobriu vazamento de R$500/mes"
- Formato: antes vs depois, numeros reais (com autorizacao)

BENEFICIOS:
- Inspira outros clientes a usar mais o produto
- Retem o promotor (ele se sente importante/reconhecido)
- Gera prova social para prospects na comunidade gratuita
- Cria cultura de sucesso e compartilhamento

FREQUENCIA: pelo menos 2 cases por semana na comunidade.
REGRA: Sempre pedir autorizacao antes de postar dados do cliente.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Ind_03</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Ind_04</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_Ind_Feedback" name="Feedback pro produto - melhorias">
     <bpmn2:documentation>FEEDBACK PRO PRODUTO — Coletar insights dos promotores:

SCRIPT (para todo NPS promotor):
"O que voce mais gosta no Fyness? O que voce mudaria?"

CATALOGAR RESPOSTAS:
- O que mais gostam: ranking de features mais valorizadas
- O que mudariam: ranking de melhorias mais pedidas
- Ideias novas: funcionalidades que nao existem

FLUXO:
1. Coletar feedback por WhatsApp
2. Registrar no CRM com tags (feature request, bug, melhoria, elogio)
3. Relatorio mensal pro time de produto
4. Top 3 pedidos do mes = prioridade no roadmap

REGRA: Promotor que pede feature e e atendido = promotor pra vida toda.
Sempre dar retorno: "Sua sugestao de [X] foi implementada! Obrigado."</bpmn2:documentation>
     <bpmn2:incoming>Flow_Ind_04</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Ind_05</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:endEvent id="End_Ind_Promotor" name="Cliente promotor da marca">
     <bpmn2:documentation>Cliente se tornou promotor ativo da marca Fyness.
Depoimento coletado, indicacoes ativas, participando da comunidade, dando feedback.
LTV alto, churn baixo, CAC dos indicados = zero.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Ind_05</bpmn2:incoming>
   </bpmn2:endEvent>

   <!-- SEQUENCE FLOWS -->
   <bpmn2:sequenceFlow id="Flow_Ind_01" sourceRef="Link_Ind_FromCS" targetRef="Task_Ind_Depoimento" />
   <bpmn2:sequenceFlow id="Flow_Ind_02" sourceRef="Task_Ind_Depoimento" targetRef="Task_Ind_Programa" />
   <bpmn2:sequenceFlow id="Flow_Ind_03" sourceRef="Task_Ind_Programa" targetRef="Task_Ind_Comunidade" />
   <bpmn2:sequenceFlow id="Flow_Ind_04" sourceRef="Task_Ind_Comunidade" targetRef="Task_Ind_Feedback" />
   <bpmn2:sequenceFlow id="Flow_Ind_05" sourceRef="Task_Ind_Feedback" targetRef="End_Ind_Promotor" />

 </bpmn2:process>

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- DIAGRAM: Layout Visual (BPMNDiagram)                          -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmndi:BPMNDiagram id="BPMNDiagram_PosVenda">
   <bpmndi:BPMNPlane id="BPMNPlane_PosVenda" bpmnElement="Collaboration_PosVenda">

     <!-- ═══════════════════════════════════════════════════════ -->
     <!-- POOL 1: ONBOARDING (GREEN) x=160 y=60 w=1800 h=250    -->
     <!-- ═══════════════════════════════════════════════════════ -->
     <bpmndi:BPMNShape id="Shape_Pool_Onboarding" bpmnElement="Pool_Onboarding" isHorizontal="true"
       bioc:stroke="#2E7D32" bioc:fill="#E8F5E9">
       <dc:Bounds x="160" y="60" width="1800" height="250" />
       <bpmndi:BPMNLabel />
     </bpmndi:BPMNShape>

     <!-- Start: Cliente pagou -->
     <bpmndi:BPMNShape id="Shape_Start_Onb" bpmnElement="Start_Onb"
       bioc:stroke="#2E7D32" bioc:fill="#E8F5E9">
       <dc:Bounds x="210" y="167" width="36" height="36" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="195" y="210" width="66" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <!-- Task: Boas-vindas -->
     <bpmndi:BPMNShape id="Shape_Task_Onb_BoasVindas" bpmnElement="Task_Onb_BoasVindas"
       bioc:stroke="#2E7D32" bioc:fill="#E8F5E9">
       <dc:Bounds x="290" y="145" width="130" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Primeiro lancamento -->
     <bpmndi:BPMNShape id="Shape_Task_Onb_PrimeiroLancamento" bpmnElement="Task_Onb_PrimeiroLancamento"
       bioc:stroke="#2E7D32" bioc:fill="#E8F5E9">
       <dc:Bounds x="460" y="145" width="140" height="80" />
     </bpmndi:BPMNShape>

     <!-- Gateway: Fez primeiro lancamento? -->
     <bpmndi:BPMNShape id="Shape_Gw_Onb_FezLancamento" bpmnElement="Gw_Onb_FezLancamento" isMarkerVisible="true"
       bioc:stroke="#2E7D32" bioc:fill="#E8F5E9">
       <dc:Bounds x="640" y="160" width="50" height="50" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="615" y="136" width="100" height="27" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <!-- Task: Follow-up D3 D5 D7 (below, NAO path) -->
     <bpmndi:BPMNShape id="Shape_Task_Onb_FollowUp" bpmnElement="Task_Onb_FollowUp"
       bioc:stroke="#2E7D32" bioc:fill="#E8F5E9">
       <dc:Bounds x="730" y="230" width="130" height="60" />
     </bpmndi:BPMNShape>

     <!-- Gateway: Engajou? -->
     <bpmndi:BPMNShape id="Shape_Gw_Onb_Engajou" bpmnElement="Gw_Onb_Engajou" isMarkerVisible="true"
       bioc:stroke="#2E7D32" bioc:fill="#E8F5E9">
       <dc:Bounds x="900" y="235" width="50" height="50" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="897" y="290" width="56" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <!-- End: Risco churn inicial -->
     <bpmndi:BPMNShape id="Shape_End_Onb_RiscoChurn" bpmnElement="End_Onb_RiscoChurn"
       bioc:stroke="#2E7D32" bioc:fill="#E8F5E9">
       <dc:Bounds x="1002" y="242" width="36" height="36" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="978" y="283" width="84" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <!-- Task: Primeira semana (SIM path continues) -->
     <bpmndi:BPMNShape id="Shape_Task_Onb_PrimeiraSemana" bpmnElement="Task_Onb_PrimeiraSemana"
       bioc:stroke="#2E7D32" bioc:fill="#E8F5E9">
       <dc:Bounds x="1060" y="145" width="160" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Primeiro mes -->
     <bpmndi:BPMNShape id="Shape_Task_Onb_PrimeiroMes" bpmnElement="Task_Onb_PrimeiroMes"
       bioc:stroke="#2E7D32" bioc:fill="#E8F5E9">
       <dc:Bounds x="1270" y="145" width="170" height="80" />
     </bpmndi:BPMNShape>

     <!-- Link: → CS/RETENCAO -->
     <bpmndi:BPMNShape id="Shape_Link_Onb_ToCS" bpmnElement="Link_Onb_ToCS"
       bioc:stroke="#2E7D32" bioc:fill="#E8F5E9">
       <dc:Bounds x="1492" y="167" width="36" height="36" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="1468" y="210" width="84" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <!-- EDGES: ONBOARDING -->
     <bpmndi:BPMNEdge id="Edge_Flow_Onb_01" bpmnElement="Flow_Onb_01">
       <di:waypoint x="246" y="185" />
       <di:waypoint x="290" y="185" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Onb_02" bpmnElement="Flow_Onb_02">
       <di:waypoint x="420" y="185" />
       <di:waypoint x="460" y="185" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Onb_03" bpmnElement="Flow_Onb_03">
       <di:waypoint x="600" y="185" />
       <di:waypoint x="640" y="185" />
     </bpmndi:BPMNEdge>
     <!-- SIM: down-right to Primeira semana -->
     <bpmndi:BPMNEdge id="Edge_Flow_Onb_04_Sim" bpmnElement="Flow_Onb_04_Sim">
       <di:waypoint x="690" y="185" />
       <di:waypoint x="1060" y="185" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="870" y="167" width="20" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNEdge>
     <!-- NAO: down to Follow-up -->
     <bpmndi:BPMNEdge id="Edge_Flow_Onb_05_Nao" bpmnElement="Flow_Onb_05_Nao">
       <di:waypoint x="665" y="210" />
       <di:waypoint x="665" y="260" />
       <di:waypoint x="730" y="260" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="670" y="232" width="21" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Onb_06" bpmnElement="Flow_Onb_06">
       <di:waypoint x="860" y="260" />
       <di:waypoint x="900" y="260" />
     </bpmndi:BPMNEdge>
     <!-- Engajou SIM: up to Primeira semana -->
     <bpmndi:BPMNEdge id="Edge_Flow_Onb_07_Sim" bpmnElement="Flow_Onb_07_Sim">
       <di:waypoint x="925" y="235" />
       <di:waypoint x="925" y="185" />
       <di:waypoint x="1060" y="185" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="930" y="207" width="20" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNEdge>
     <!-- Engajou NAO: to End -->
     <bpmndi:BPMNEdge id="Edge_Flow_Onb_08_Nao" bpmnElement="Flow_Onb_08_Nao">
       <di:waypoint x="950" y="260" />
       <di:waypoint x="1002" y="260" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="960" y="242" width="21" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Onb_09" bpmnElement="Flow_Onb_09">
       <di:waypoint x="1220" y="185" />
       <di:waypoint x="1270" y="185" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Onb_10" bpmnElement="Flow_Onb_10">
       <di:waypoint x="1440" y="185" />
       <di:waypoint x="1492" y="185" />
     </bpmndi:BPMNEdge>

     <!-- ═══════════════════════════════════════════════════════ -->
     <!-- POOL 2: CS / RETENCAO (BLUE) x=160 y=380 w=2200 h=300 -->
     <!-- ═══════════════════════════════════════════════════════ -->
     <bpmndi:BPMNShape id="Shape_Pool_CS" bpmnElement="Pool_CS" isHorizontal="true"
       bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="160" y="380" width="2200" height="300" />
       <bpmndi:BPMNLabel />
     </bpmndi:BPMNShape>

     <!-- Link: ← ONBOARDING -->
     <bpmndi:BPMNShape id="Shape_Link_CS_FromOnb" bpmnElement="Link_CS_FromOnb"
       bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="210" y="477" width="36" height="36" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="187" y="520" width="82" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <!-- Task: Health Score mensal -->
     <bpmndi:BPMNShape id="Shape_Task_CS_HealthScore" bpmnElement="Task_CS_HealthScore"
       bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="290" y="455" width="140" height="80" />
     </bpmndi:BPMNShape>

     <!-- Gateway: Score OK? -->
     <bpmndi:BPMNShape id="Shape_Gw_CS_ScoreOK" bpmnElement="Gw_CS_ScoreOK" isMarkerVisible="true"
       bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="475" y="470" width="50" height="50" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="472" y="446" width="56" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <!-- Task: NPS trimestral (SIM path, top) -->
     <bpmndi:BPMNShape id="Shape_Task_CS_NPS" bpmnElement="Task_CS_NPS"
       bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="570" y="400" width="130" height="60" />
     </bpmndi:BPMNShape>

     <!-- Gateway: NPS >= 8? -->
     <bpmndi:BPMNShape id="Shape_Gw_CS_NPS" bpmnElement="Gw_CS_NPS" isMarkerVisible="true"
       bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="740" y="405" width="50" height="50" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="740" y="388" width="50" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <!-- Link: → INDICACAO -->
     <bpmndi:BPMNShape id="Shape_Link_CS_ToIndicacao" bpmnElement="Link_CS_ToIndicacao"
       bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="832" y="412" width="36" height="36" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="815" y="393" width="70" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <!-- Task: Ligar e entender insatisfacao (NPS NAO) -->
     <bpmndi:BPMNShape id="Shape_Task_CS_LigarInsatisfacao" bpmnElement="Task_CS_LigarInsatisfacao"
       bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="830" y="465" width="150" height="60" />
     </bpmndi:BPMNShape>

     <!-- Task: Gatilho risco churn (Score NAO path, bottom) -->
     <bpmndi:BPMNShape id="Shape_Task_CS_GatilhoRisco" bpmnElement="Task_CS_GatilhoRisco"
       bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="570" y="555" width="130" height="60" />
     </bpmndi:BPMNShape>

     <!-- Gateway: Recuperou? -->
     <bpmndi:BPMNShape id="Shape_Gw_CS_Recuperou" bpmnElement="Gw_CS_Recuperou" isMarkerVisible="true"
       bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="745" y="560" width="50" height="50" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="738" y="615" width="64" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <!-- Task: Negociacao anti-churn -->
     <bpmndi:BPMNShape id="Shape_Task_CS_Negociacao" bpmnElement="Task_CS_Negociacao"
       bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="840" y="555" width="140" height="60" />
     </bpmndi:BPMNShape>

     <!-- Gateway: Ficou? -->
     <bpmndi:BPMNShape id="Shape_Gw_CS_Ficou" bpmnElement="Gw_CS_Ficou" isMarkerVisible="true"
       bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="1025" y="560" width="50" height="50" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="1032" y="615" width="36" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <!-- Task: Catalogar motivo cancelamento -->
     <bpmndi:BPMNShape id="Shape_Task_CS_CatalogarMotivo" bpmnElement="Task_CS_CatalogarMotivo"
       bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="1120" y="555" width="170" height="60" />
     </bpmndi:BPMNShape>

     <!-- End: Cliente cancelou -->
     <bpmndi:BPMNShape id="Shape_End_CS_Cancelou" bpmnElement="End_CS_Cancelou"
       bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="1332" y="567" width="36" height="36" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="1308" y="610" width="84" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <!-- Task: Renovacao contrato (parallel, right side) -->
     <bpmndi:BPMNShape id="Shape_Task_CS_Renovacao" bpmnElement="Task_CS_Renovacao"
       bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="1450" y="400" width="190" height="60" />
     </bpmndi:BPMNShape>

     <!-- Task: Prevencao inadimplencia (parallel, right side) -->
     <bpmndi:BPMNShape id="Shape_Task_CS_Inadimplencia" bpmnElement="Task_CS_Inadimplencia"
       bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="1450" y="480" width="210" height="60" />
     </bpmndi:BPMNShape>

     <!-- EDGES: CS / RETENCAO -->
     <bpmndi:BPMNEdge id="Edge_Flow_CS_01" bpmnElement="Flow_CS_01">
       <di:waypoint x="246" y="495" />
       <di:waypoint x="290" y="495" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_CS_02" bpmnElement="Flow_CS_02">
       <di:waypoint x="430" y="495" />
       <di:waypoint x="475" y="495" />
     </bpmndi:BPMNEdge>
     <!-- Score OK SIM: up to NPS -->
     <bpmndi:BPMNEdge id="Edge_Flow_CS_03_Sim" bpmnElement="Flow_CS_03_Sim">
       <di:waypoint x="500" y="470" />
       <di:waypoint x="500" y="430" />
       <di:waypoint x="570" y="430" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="505" y="447" width="20" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNEdge>
     <!-- Score OK NAO: down to Gatilho risco -->
     <bpmndi:BPMNEdge id="Edge_Flow_CS_04_Nao" bpmnElement="Flow_CS_04_Nao">
       <di:waypoint x="500" y="520" />
       <di:waypoint x="500" y="585" />
       <di:waypoint x="570" y="585" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="505" y="550" width="21" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_CS_05" bpmnElement="Flow_CS_05">
       <di:waypoint x="700" y="430" />
       <di:waypoint x="740" y="430" />
     </bpmndi:BPMNEdge>
     <!-- NPS SIM: to Link Indicacao -->
     <bpmndi:BPMNEdge id="Edge_Flow_CS_06_Sim" bpmnElement="Flow_CS_06_Sim">
       <di:waypoint x="790" y="430" />
       <di:waypoint x="832" y="430" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="800" y="412" width="20" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNEdge>
     <!-- NPS NAO: down to Ligar insatisfacao -->
     <bpmndi:BPMNEdge id="Edge_Flow_CS_07_Nao" bpmnElement="Flow_CS_07_Nao">
       <di:waypoint x="765" y="455" />
       <di:waypoint x="765" y="495" />
       <di:waypoint x="830" y="495" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="770" y="472" width="21" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNEdge>
     <!-- Ligar insatisfacao back to Health Score -->
     <bpmndi:BPMNEdge id="Edge_Flow_CS_LigarInsatisfacao_Back" bpmnElement="Flow_CS_LigarInsatisfacao_Back">
       <di:waypoint x="905" y="525" />
       <di:waypoint x="905" y="640" />
       <di:waypoint x="360" y="640" />
       <di:waypoint x="360" y="535" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_CS_08" bpmnElement="Flow_CS_08">
       <di:waypoint x="700" y="585" />
       <di:waypoint x="745" y="585" />
     </bpmndi:BPMNEdge>
     <!-- Recuperou SIM: back to Health Score -->
     <bpmndi:BPMNEdge id="Edge_Flow_CS_Recuperou_Sim" bpmnElement="Flow_CS_Recuperou_Sim">
       <di:waypoint x="770" y="560" />
       <di:waypoint x="770" y="540" />
       <di:waypoint x="360" y="540" />
       <di:waypoint x="360" y="535" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="560" y="522" width="20" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNEdge>
     <!-- Recuperou NAO: to Negociacao -->
     <bpmndi:BPMNEdge id="Edge_Flow_CS_Recuperou_Nao" bpmnElement="Flow_CS_Recuperou_Nao">
       <di:waypoint x="795" y="585" />
       <di:waypoint x="840" y="585" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="800" y="567" width="21" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_CS_09" bpmnElement="Flow_CS_09">
       <di:waypoint x="980" y="585" />
       <di:waypoint x="1025" y="585" />
     </bpmndi:BPMNEdge>
     <!-- Ficou SIM: back to Health Score -->
     <bpmndi:BPMNEdge id="Edge_Flow_CS_Ficou_Sim" bpmnElement="Flow_CS_Ficou_Sim">
       <di:waypoint x="1050" y="560" />
       <di:waypoint x="1050" y="540" />
       <di:waypoint x="360" y="540" />
       <di:waypoint x="360" y="535" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="700" y="522" width="20" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNEdge>
     <!-- Ficou NAO: to Catalogar -->
     <bpmndi:BPMNEdge id="Edge_Flow_CS_Ficou_Nao" bpmnElement="Flow_CS_Ficou_Nao">
       <di:waypoint x="1075" y="585" />
       <di:waypoint x="1120" y="585" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="1080" y="567" width="21" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_CS_10" bpmnElement="Flow_CS_10">
       <di:waypoint x="1290" y="585" />
       <di:waypoint x="1332" y="585" />
     </bpmndi:BPMNEdge>
     <!-- Parallel: Health Score to Renovacao -->
     <bpmndi:BPMNEdge id="Edge_Flow_CS_Parallel_Renovacao" bpmnElement="Flow_CS_Parallel_Renovacao">
       <di:waypoint x="430" y="475" />
       <di:waypoint x="440" y="430" />
       <di:waypoint x="1450" y="430" />
     </bpmndi:BPMNEdge>
     <!-- Parallel: Health Score to Inadimplencia -->
     <bpmndi:BPMNEdge id="Edge_Flow_CS_Parallel_Inadimplencia" bpmnElement="Flow_CS_Parallel_Inadimplencia">
       <di:waypoint x="430" y="510" />
       <di:waypoint x="440" y="510" />
       <di:waypoint x="1450" y="510" />
     </bpmndi:BPMNEdge>

     <!-- ═══════════════════════════════════════════════════════ -->
     <!-- POOL 3: INDICACAO E FEEDBACK (ORANGE) x=160 y=750 w=1400 h=250 -->
     <!-- ═══════════════════════════════════════════════════════ -->
     <bpmndi:BPMNShape id="Shape_Pool_Indicacao" bpmnElement="Pool_Indicacao" isHorizontal="true"
       bioc:stroke="#E65100" bioc:fill="#FFF3E0">
       <dc:Bounds x="160" y="750" width="1400" height="250" />
       <bpmndi:BPMNLabel />
     </bpmndi:BPMNShape>

     <!-- Link: ← CS -->
     <bpmndi:BPMNShape id="Shape_Link_Ind_FromCS" bpmnElement="Link_Ind_FromCS"
       bioc:stroke="#E65100" bioc:fill="#FFF3E0">
       <dc:Bounds x="210" y="857" width="36" height="36" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="205" y="900" width="46" height="14" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <!-- Task: Pedir depoimento -->
     <bpmndi:BPMNShape id="Shape_Task_Ind_Depoimento" bpmnElement="Task_Ind_Depoimento"
       bioc:stroke="#E65100" bioc:fill="#FFF3E0">
       <dc:Bounds x="290" y="835" width="160" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Programa de indicacao -->
     <bpmndi:BPMNShape id="Shape_Task_Ind_Programa" bpmnElement="Task_Ind_Programa"
       bioc:stroke="#E65100" bioc:fill="#FFF3E0">
       <dc:Bounds x="500" y="835" width="200" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Comunidade ativa -->
     <bpmndi:BPMNShape id="Shape_Task_Ind_Comunidade" bpmnElement="Task_Ind_Comunidade"
       bioc:stroke="#E65100" bioc:fill="#FFF3E0">
       <dc:Bounds x="750" y="835" width="160" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Feedback pro produto -->
     <bpmndi:BPMNShape id="Shape_Task_Ind_Feedback" bpmnElement="Task_Ind_Feedback"
       bioc:stroke="#E65100" bioc:fill="#FFF3E0">
       <dc:Bounds x="960" y="835" width="170" height="80" />
     </bpmndi:BPMNShape>

     <!-- End: Cliente promotor da marca -->
     <bpmndi:BPMNShape id="Shape_End_Ind_Promotor" bpmnElement="End_Ind_Promotor"
       bioc:stroke="#E65100" bioc:fill="#FFF3E0">
       <dc:Bounds x="1192" y="857" width="36" height="36" />
       <bpmndi:BPMNLabel>
         <dc:Bounds x="1160" y="900" width="100" height="27" />
       </bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <!-- EDGES: INDICACAO -->
     <bpmndi:BPMNEdge id="Edge_Flow_Ind_01" bpmnElement="Flow_Ind_01">
       <di:waypoint x="246" y="875" />
       <di:waypoint x="290" y="875" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Ind_02" bpmnElement="Flow_Ind_02">
       <di:waypoint x="450" y="875" />
       <di:waypoint x="500" y="875" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Ind_03" bpmnElement="Flow_Ind_03">
       <di:waypoint x="700" y="875" />
       <di:waypoint x="750" y="875" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Ind_04" bpmnElement="Flow_Ind_04">
       <di:waypoint x="910" y="875" />
       <di:waypoint x="960" y="875" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Ind_05" bpmnElement="Flow_Ind_05">
       <di:waypoint x="1130" y="875" />
       <di:waypoint x="1192" y="875" />
     </bpmndi:BPMNEdge>

     <!-- ═══════════════════════════════════════════════════════ -->
     <!-- ANNOTATIONS (below pools, y=1060)                      -->
     <!-- ═══════════════════════════════════════════════════════ -->
     <bpmndi:BPMNShape id="Shape_Annotation_Metricas" bpmnElement="Annotation_Metricas">
       <dc:Bounds x="160" y="1060" width="450" height="350" />
     </bpmndi:BPMNShape>

     <bpmndi:BPMNShape id="Shape_Annotation_Marcos" bpmnElement="Annotation_Marcos">
       <dc:Bounds x="650" y="1060" width="450" height="300" />
     </bpmndi:BPMNShape>

   </bpmndi:BPMNPlane>
 </bpmndi:BPMNDiagram>

</bpmn2:definitions>`;

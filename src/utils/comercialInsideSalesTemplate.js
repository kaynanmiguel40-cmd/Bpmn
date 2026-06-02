/**
 * Template BPMN 2.0 — INSIDE SALES FYNESS (v4 — SDR + CLOSER)
 * Metodologia: Vivendo de SaaS (Gus Domingues + Leticia Medeiros) adaptada
 * para o publico real do Fyness (PME R$10k+/mes: padaria, salao, restaurante,
 * oficina, loja) — decisao emocional, dono que controla tudo no caderninho.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * MODELO v4 — ESTEIRA DE VENDAS ESPECIALIZADA (Predictable Revenue)
 * ═══════════════════════════════════════════════════════════════════════
 * Quem MARCA reuniao e quem FECHA sao funcoes separadas.
 *
 * Pool 1: IA INBOUND   → SO TRIAGEM. Responde na hora (speed to lead),
 *                        coleta contato, confirma que e lead real e
 *                        entrega pro SDR humano. NAO qualifica a fundo,
 *                        NAO vende, NAO agenda.
 * Pool 2: SDR HUMANO   → Conecta, qualifica ICP e MARCA A REUNIAO.
 *                        Cobre inbound (lead da IA) e outbound (prospeccao
 *                        ativa via Google Meu Negocio). A IA outbound esta
 *                        em STANDBY (entra no futuro). Handoff = reuniao
 *                        agendada na agenda do Closer.
 * Pool 3: CLOSER       → Pega a reuniao agendada, faz demo ao vivo
 *                        (Retomada + SPIN + Demo), proposta, negocia e
 *                        FECHA. Contrato assinado com carencia de pagamento.
 * Pool 4: NURTURING    → Reativacao e conteudo para nao convertidos.
 *
 * OFERTA ATUAL (2026-05):
 * - Mensal: R$97/mes (cartao recorrente)
 * - Anual: R$67/mes (12x = R$804, Fyness antecipa via processador)
 * - SEM TRIAL — ninguem valoriza.
 * - Entrada por CONTRATO ASSINADO com CARENCIA DE PAGAMENTO de ate 15 dias
 *   (assina hoje, primeira cobranca em ate 15 dias).
 *
 * PRODUTO FYNESS:
 * - SaaS financeiro com Assistente Financeiro no WhatsApp: manda foto do
 *   comprovante, audio ou texto e o assistente lanca tudo automatico.
 * - Recomendacoes financeiras (avisa conta vencendo, onde cortar custo).
 * - Substitui funcionario do financeiro (economia R$2-3k/mes) ou acaba com
 *   a planilha/caderninho pra quem faz sozinho.
 * - Fluxo de caixa, DRE, contas a pagar/receber em tempo real.
 * - Plataforma de Educacao Financeira + Comunidade de Empresarios.
 *
 * PITCHES:
 * - Pitch 1 "Manda o financeiro embora": pra quem tem funcionario no financeiro.
 * - Pitch 2 "Para de perder horas com planilha": pra dono que faz sozinho.
 *
 * Criado: Maio 2026 | Equipe Fyness | v4 — Modelo SDR + Closer
 * ═══════════════════════════════════════════════════════════════════════
 */

export const COMERCIAL_INSIDE_SALES_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
 xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
 xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
 xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
 xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0"
 id="Definitions_InsideSales"
 targetNamespace="http://fyness.com/bpmn/inside-sales-v4">

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- COLLABORATION: 4 POOLS (IA Inbound, SDR Humano, Closer, Nurt)   -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmn2:collaboration id="Collaboration_InsideSales">

   <bpmn2:participant id="Pool_IaInbound" name="IA INBOUND — Triagem Rapida (Speed to Lead, 24/7)" processRef="Process_IaInbound" />
   <bpmn2:participant id="Pool_Sdr" name="SDR HUMANO — Conecta, Qualifica e MARCA A REUNIAO (Inbound + Outbound)" processRef="Process_Sdr" />
   <bpmn2:participant id="Pool_Closer" name="CLOSER — Demo ao Vivo (SPIN), Proposta e FECHAMENTO" processRef="Process_Closer" />
   <bpmn2:participant id="Pool_Nurt" name="NURTURING e EDUCACAO — Reativacao e Conteudo Continuo" processRef="Process_Nurt" />

   <bpmn2:textAnnotation id="Annotation_Precos">
     <bpmn2:text>OFERTA E FECHAMENTO (2026):

PLANOS:
- MENSAL: R$97/mes (cartao recorrente)
- ANUAL: R$67/mes (12x = R$804, Fyness antecipa)

SEM TRIAL — ninguem valoriza.

ENTRADA:
Contrato assinado com CARENCIA DE PAGAMENTO de ate 15 dias.
"Assina hoje, comeca a pagar em ate 15 dias." Tira o atrito
sem dar o produto de graca.

ESCADA DE PRECO:
1. Anual R$67/mes (12x) — ancorar SEMPRE aqui (melhor preco)
2. Mensal R$97/mes — opcao B

REGRAS DE OURO:
1. NUNCA abrir preco antes da demo
2. SEMPRE ancorar no anual (R$67/mes = R$2,20/dia)
3. Mensal como "opcao B"
4. Carencia de pagamento = quebra a objecao "preciso pensar/caro"
5. Desconto so com algo em troca (e aprovacao do gestor)

TODOS incluem: Assistente no WhatsApp + SaaS financeiro completo
+ Educacao Financeira + Comunidade de Empresarios.</bpmn2:text>
   </bpmn2:textAnnotation>

   <bpmn2:textAnnotation id="Annotation_ICP">
     <bpmn2:text>ICP CHECKLIST (3 de 4 = qualificado p/ reuniao):

1. SEGMENTO atendido (PME de servico/comercio/alimentacao)
2. FATURAMENTO minimo R$10k/mes
   (abaixo disso o ticket pesa e o churn e alto)
3. DOR FINANCEIRA (latente OU ativa):
   - Nao sabe o lucro real no fim do mes
   - Mistura conta PF com PJ
   - Controla na cabeca, caderno ou planilha bagunçada
   - Paga funcionario so pra fazer financeiro (R$2-3k/mes)
   - Gasta horas por semana em planilha/caderno
   - Paga conta atrasada por falta de organizacao
4. DECISOR ACESSIVEL: dono, socio ou gerente com autonomia

DESQUALIFICADORES:
- Faturamento abaixo de R$5k/mes
- Ja usa ERP robusto e satisfeito (SAP, TOTVS)
- Empresa em recuperacao judicial
- Nenhuma dor financeira identificada</bpmn2:text>
   </bpmn2:textAnnotation>

   <bpmn2:textAnnotation id="Annotation_SPIN">
     <bpmn2:text>SPIN NA DEMO (Closer) — fazer DOER:

S - SITUACAO (entender pra doer depois):
    "Como voce controla o financeiro hoje? Quem faz?"
    "Quanto tempo gasta por semana? Quanto paga pra quem faz?"
P - PROBLEMA (perguntas que incomodam):
    "Voce sabe seu lucro REAL do mes passado? O numero EXATO?"
    "Ja chegou no fim do mes sem dinheiro pra pagar conta?"
I - IMPLICACAO (amplificar a dor):
    "Se perde 5-15% do faturamento sem saber, em 1 ano da quanto?"
    "Paga R$2-3k/mes de funcionario? Sao R$30k/ano so de financeiro."
    "Seu concorrente ja sabe o lucro dele em tempo real. E voce?"
N - NECESSIDADE (lead verbaliza a solucao):
    "Se voce visse no celular, agora, quanto lucrou e o que tem
    a pagar — e recebesse alerta de custo alto — quanto valeria?"
    "Se mandasse foto do comprovante e acabasse com a planilha
    pra sempre — faria sentido?"

DICA: anotar os numeros de perda. Sao usados na proposta.</bpmn2:text>
   </bpmn2:textAnnotation>

   <bpmn2:textAnnotation id="Annotation_Portais">
     <bpmn2:text>PORTAIS (Link entre pools):

IA INBOUND  → entrega lead triado pro SDR HUMANO
SDR HUMANO  → reuniao agendada vai pro CLOSER
TODOS       → nao convertido vai pro NURTURING
NURTURING   → reativado volta pro SDR HUMANO

A IA SO faz triagem. Quem qualifica e marca e o SDR.
Quem fecha e o Closer. A IA outbound esta em STANDBY.</bpmn2:text>
   </bpmn2:textAnnotation>

   <bpmn2:textAnnotation id="Annotation_PlaybookSdr">
     <bpmn2:text>PLAYBOOK SDR — GERAR REUNIAO (meta: 2 reunioes/dia)
METRICA UNICA: reuniao marcada/dia (NAO mensagem enviada).

ROTINA DIARIA:
08h-09h30   Quentes: indicacao + quem respondeu + Meta
09h30-12h   Cold WhatsApp: 40 msg/dia (20 por chip, 2 chips)
14h-17h     Follow-up + confirma reunioes de amanha + CRM

ORDEM DOS CANAIS (do quente pro frio):
1. Indicacao (SEMPRE primeiro — converte 15-25x mais)
2. Quem ja respondeu / qualificados do Meta
3. Cold WhatsApp (40/dia, 2 chips aquecidos — sem ban)
4. Cold email (entra em ~3 sem, motor de volume sem teto)

HANDOFF: reuniao marcada cai na agenda do Closer (Kaynan).
SDR confirma 1h antes (mata no-show). Kaynan SO fecha.

META MES 1: 13 vendas (~17 reunioes). 20 e o destino (mes 2-3,
com a base e a indicacao crescendo). MEDIR sempre: msg -> resposta
-> reuniao -> venda, pra pilotar pelo dado e nao pelo chute.</bpmn2:text>
   </bpmn2:textAnnotation>

 </bpmn2:collaboration>

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- POOL 1: IA INBOUND (GREEN) — SO TRIAGEM                         -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmn2:process id="Process_IaInbound" isExecutable="false">

   <bpmn2:startEvent id="Start_In" name="Lead Inbound entra (site / anuncio / indicacao)">
     <bpmn2:documentation>Lead chega via Marketing (Meta Ads, Google Ads, organico), site ou indicacao.
REGRA: Speed to Lead — a IA responde em ate 5 minutos, 24/7.
A IA NAO qualifica a fundo, NAO vende e NAO agenda. Ela so faz a TRIAGEM:
responde na hora, coleta contato, confirma que e um lead real e entrega pro SDR humano.</bpmn2:documentation>
     <bpmn2:outgoing>Flow_In_1</bpmn2:outgoing>
   </bpmn2:startEvent>

   <bpmn2:task id="Task_In_Responde" name="IA responde na hora + coleta contato">
     <bpmn2:documentation>SCRIPT DA IA (enviar em ate 5 minutos):
"Oi [Nome]! Aqui e o assistente do Fyness. Vi que voce quer organizar o financeiro do seu negocio.
Pra um especialista te chamar no melhor horario, me confirma rapidinho: seu nome, seu WhatsApp e qual o tipo do seu negocio?"

OBJETIVO (so triagem):
- Responder em ate 5 min (speed to lead)
- Coletar: nome, WhatsApp, segmento
- Confirmar que e um lead real (negocio de verdade, quer resolver financeiro)

REGRAS:
- Tom humano e direto
- NAO mandar preco, NAO fazer demo, NAO qualificar ICP a fundo (isso e o SDR)
- NAO tentar agendar (quem marca e o SDR humano)
- Se o lead ja vier quente, so confirmar dados e avisar que o especialista chama</bpmn2:documentation>
     <bpmn2:incoming>Flow_In_1</bpmn2:incoming>
     <bpmn2:outgoing>Flow_In_2</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_In_Respondeu" name="Respondeu?">
     <bpmn2:incoming>Flow_In_2</bpmn2:incoming>
     <bpmn2:outgoing>Flow_In_3_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_In_4_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:task id="Task_In_FollowUp" name="Follow-up automatico (2 toques)">
     <bpmn2:documentation>Lead nao respondeu. Cadencia leve automatica:
D0 (+4h): "Oi [Nome], ainda quer organizar o financeiro do negocio? Um especialista pode te ligar rapidinho — so me confirma seu WhatsApp."
D1: "[Nome], ultima tentativa por aqui. Quando quiser parar de controlar o financeiro no escuro, e so responder."
Se nao responder em nenhum toque, segue pra Nurturing.</bpmn2:documentation>
     <bpmn2:incoming>Flow_In_4_Nao</bpmn2:incoming>
     <bpmn2:outgoing>Flow_In_5</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_In_RespFollow" name="Respondeu agora?">
     <bpmn2:incoming>Flow_In_5</bpmn2:incoming>
     <bpmn2:outgoing>Flow_In_6_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_In_7_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:endEvent id="End_In_NurtNaoResp" name="→ NURTURING (nao respondeu)">
     <bpmn2:incoming>Flow_In_7_Nao</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:exclusiveGateway id="Gw_In_Real" name="E lead real?">
     <bpmn2:documentation>Confirmar que e um negocio real com decisor acessivel.
Filtrar spam, concorrente e curioso sem negocio.
Nao e qualificacao ICP (isso e o SDR) — e so checagem basica de que vale acionar um humano.</bpmn2:documentation>
     <bpmn2:incoming>Flow_In_3_Sim</bpmn2:incoming>
     <bpmn2:incoming>Flow_In_6_Sim</bpmn2:incoming>
     <bpmn2:outgoing>Flow_In_8_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_In_9_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:endEvent id="End_In_Descarte" name="→ NURTURING (nao qualificado p/ contato)">
     <bpmn2:incoming>Flow_In_9_Nao</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:task id="Task_In_Entrega" name="Registra no CRM + entrega lead triado">
     <bpmn2:documentation>Registrar no CRM: nome, WhatsApp, segmento e fonte do lead (anuncio, organico, indicacao).
Marcar como LEAD TRIADO e entregar pro SDR humano.
Notificar o SDR imediatamente (CRM + WhatsApp interno) — o lead esta morno, agir rapido.</bpmn2:documentation>
     <bpmn2:incoming>Flow_In_8_Sim</bpmn2:incoming>
     <bpmn2:outgoing>Flow_In_10</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:endEvent id="End_In_SDR" name="→ SDR HUMANO (lead triado)">
     <bpmn2:incoming>Flow_In_10</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:sequenceFlow id="Flow_In_1" sourceRef="Start_In" targetRef="Task_In_Responde" />
   <bpmn2:sequenceFlow id="Flow_In_2" sourceRef="Task_In_Responde" targetRef="Gw_In_Respondeu" />
   <bpmn2:sequenceFlow id="Flow_In_3_Sim" name="Sim" sourceRef="Gw_In_Respondeu" targetRef="Gw_In_Real" />
   <bpmn2:sequenceFlow id="Flow_In_4_Nao" name="Nao" sourceRef="Gw_In_Respondeu" targetRef="Task_In_FollowUp" />
   <bpmn2:sequenceFlow id="Flow_In_5" sourceRef="Task_In_FollowUp" targetRef="Gw_In_RespFollow" />
   <bpmn2:sequenceFlow id="Flow_In_6_Sim" name="Sim" sourceRef="Gw_In_RespFollow" targetRef="Gw_In_Real" />
   <bpmn2:sequenceFlow id="Flow_In_7_Nao" name="Nao" sourceRef="Gw_In_RespFollow" targetRef="End_In_NurtNaoResp" />
   <bpmn2:sequenceFlow id="Flow_In_8_Sim" name="Sim" sourceRef="Gw_In_Real" targetRef="Task_In_Entrega" />
   <bpmn2:sequenceFlow id="Flow_In_9_Nao" name="Nao" sourceRef="Gw_In_Real" targetRef="End_In_Descarte" />
   <bpmn2:sequenceFlow id="Flow_In_10" sourceRef="Task_In_Entrega" targetRef="End_In_SDR" />

 </bpmn2:process>

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- POOL 2: SDR HUMANO (BLUE) — marca reuniao (inbound + outbound)  -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmn2:process id="Process_Sdr" isExecutable="false">

   <bpmn2:startEvent id="Start_Sdr_In" name="Recebe lead triado da IA (inbound)">
     <bpmn2:documentation>Lead morno entregue pela IA: ja demonstrou interesse e teve contato confirmado.
META DO SDR: conectar, qualificar ICP e MARCAR A REUNIAO com o Closer.</bpmn2:documentation>
     <bpmn2:outgoing>Flow_Sdr_1</bpmn2:outgoing>
   </bpmn2:startEvent>

   <bpmn2:task id="Task_Sdr_InContato" name="Contato rapido (lead morno)">
     <bpmn2:documentation>Lead veio do anuncio/site — ir direto, sem explicar "somos um SaaS".
SCRIPT (WhatsApp + ligacao):
"Oi [Nome], aqui e o [SDR] do Fyness. Vi que voce quer organizar o financeiro do seu [segmento]. Te chamei pra entender rapidinho como ta hoje e, se fizer sentido, marcar uma demonstracao de 20 min com nosso especialista. Pode falar 2 minutinhos?"
Objetivo: abrir a conversa e levar pra qualificacao + agendamento.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Sdr_1</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Sdr_2</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:startEvent id="Start_Sdr_Out" name="Inicia prospeccao ativa (outbound)">
     <bpmn2:documentation>Prospeccao ativa, hoje 100% humana.
A IA OUTBOUND esta em STANDBY — entra no futuro pra automatizar a cadencia de aquecimento.
Por enquanto, o proprio SDR prospecta, aborda e qualifica.</bpmn2:documentation>
     <bpmn2:outgoing>Flow_Sdr_3</bpmn2:outgoing>
   </bpmn2:startEvent>

   <bpmn2:task id="Task_Sdr_Prospecta" name="Prospecta (Google Meu Negocio) + enriquece + valida email">
     <bpmn2:documentation>Buscar empresas por segmento + cidade no Google Meu Negocio.
Coletar: nome da empresa, WhatsApp publico, endereco, avaliacoes, site, Instagram.

ENRIQUECER (ordem de prioridade):
1. CNPJ (Casa dos Dados) -> nome do SOCIO/decisor (transforma "Restaurante do Ze" em "Oi Joao"), CNAE, porte
2. Email do decisor/empresa -> VALIDAR num verificador (MillionVerifier/ZeroBounce). Email morto = bounce = queima a entrega da cadencia.
3. Instagram (atividade, tamanho)

Priorizar 4+ estrelas. WhatsApp DA EMPRESA (numero publico), nao o pessoal.
O email validado alimenta a cadencia de cold email (peneira barata ANTES de gastar WhatsApp).</bpmn2:documentation>
     <bpmn2:incoming>Flow_Sdr_3</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Sdr_4</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:serviceTask id="Task_Sdr_ColdEmail" name="[ROBO] Cadencia de Cold Email (peneira / termometro)">
     <bpmn2:documentation>PENEIRA BARATA: dispara cold email em volume pra qualificar o lead frio SEM gastar WhatsApp (evita ban). Quem CLICA esquenta sozinho.

FERRAMENTA: Smartlead/Instantly (NAO o Resend — Resend e so transacional/opt-in; cold queima a conta e a entrega).

INFRA (pre-requisito):
- Dominio SECUNDARIO (ex: useFyness.com), nunca o principal
- 2-3 inboxes (Google Workspace/M365) + SPF/DKIM/DMARC
- WARMUP 2-3 semanas ANTES de disparar
- Volume baixo: 30-50 emails por inbox/dia

SEQUENCIA (2-4 emails, texto puro 1:1, 1 CTA rastreavel pro WhatsApp):
E1 (D0) - dor + curiosidade. Assunto curto, nao "vendedor":
"[Nome], vi o [Empresa] aqui em [cidade]. Pergunta rapida: voce sabe seu lucro REAL do mes passado? A maioria dos donos de [segmento] nao sabe — e perde dinheiro sem ver. Olha isso: [link rastreavel]"
E2 (D3) - case curto + mesmo link.
E3 (D6) - prova social / comunidade + link.
E4 (D10) - break-off ("ultima vez que te escrevo").

REGRA DE OURO: o email NUNCA fecha e NUNCA liga. Ele so MEDE intencao.
Medir CLIQUE (nao abertura — abertura e furada hoje). Clicou = quente.
Webhook de clique (Smartlead) -> CRM marca temperatura -> notifica SDR.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Sdr_4</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Sdr_Cold</bpmn2:outgoing>
   </bpmn2:serviceTask>

   <bpmn2:exclusiveGateway id="Gw_Sdr_Engajou" name="Esquentou? (clicou/engajou)">
     <bpmn2:documentation>ALGORITMO DE TEMPERATURA (lead scoring por engajamento):
Pontuar sinais — clicou no link do email (sinal forte), respondeu, visitou a landing, assistiu o teaser.
Passou do limite = QUENTE -> SDR aborda no WhatsApp.
Nao engajou apos a cadencia = FRIO -> Nurturing (nao gasta WhatsApp, evita ban).

ATENCAO: so confie no "nao clicou" se a ENTREGA for boa (email caindo na caixa, nao no spam).
Entrega ruim = dado mentiroso = lead bom descartado como frio.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Sdr_Cold</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Sdr_EngSim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_Sdr_EngNao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:endEvent id="End_Sdr_NurtFrio" name="→ NURTURING (nao engajou no email)">
     <bpmn2:incoming>Flow_Sdr_EngNao</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:task id="Task_Sdr_CadOut" name="SDR aborda no WhatsApp (so leads quentes)">
     <bpmn2:documentation>So chega aqui quem ESQUENTOU no cold email (clicou/engajou). Agora sim o SDR gasta WhatsApp — com quem ja demonstrou intencao.

ABERTURA (referenciar o interesse, sem dizer "te mandei email"):
"Oi [Nome]! Aqui e o [SDR] do Fyness. Vi que voce se interessou em organizar o financeiro do [Empresa]. Da pra fazer tudo pelo WhatsApp — manda a foto do comprovante e o assistente lanca. Posso te mostrar rapidinho como ficaria no SEU [segmento]?"

TOM (publico solution-aware): nao precisa "criar dor do zero" — ele JA sabe que precisa organizar. Posicionar contra a planilha bagunçada e o ERP complexo: pratico, rapido, sem curva de aprendizado.

OBJETIVO: levar pra qualificacao + agendar a reuniao com o Closer.
REGRA: respondeu/engajou, segue pra qualificacao.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Sdr_EngSim</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Sdr_5</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:startEvent id="Start_Sdr_Parc" name="Parceria Contador (base endossada)">
     <bpmn2:documentation>Entrada de leads vindos da PARCERIA COM CONTADORES — substitui a prospeccao fria manual 1-a-1.
O contador entrega a base de clientes dele (PMEs do ICP exato). Sao leads endossados e quentes.
Diferente do outbound frio, aqui NAO precisa peneira dura: a base e quente e finita — vale acionar TODOS (com endosso antes).
RESSALVA: fechar o contador e uma venda em si (tem ciclo). Nao largar 100% os outros canais ate ter 3-5 contadores rodando.</bpmn2:documentation>
     <bpmn2:outgoing>Flow_Sdr_P1</bpmn2:outgoing>
   </bpmn2:startEvent>

   <bpmn2:task id="Task_Sdr_Endosso" name="Contador envia endosso (template pronto)">
     <bpmn2:documentation>ANTES de qualquer ligacao, o contador manda uma RECOMENDACAO PESSOAL (do numero/nome dele) pros clientes. NAO pode parecer propaganda — tem que soar como conselho do contador. E a mensagem que transfere a confianca.

ENTREGAR O TEMPLATE PRONTO pro contador (ele e ocupado, nao e marketeiro). Dar COMISSAO RECORRENTE pra mante-lo disparando.

TEMPLATE (contador -> cliente, WhatsApp):
"Fala [Nome]! Aqui e o [Contador]. To indicando pros meus clientes uma ferramenta que facilita demais o financeiro — voce manda a foto do comprovante no WhatsApp e ela lanca tudo, te mostra teu lucro real na hora. Pedi pra equipe do Fyness te ligar pra explicar. Pode atender numa boa, eu confio. Se quiser ja adiantar, chama eles aqui: [link]. Abraco!"

Quem responder o CTA do link = quentissimo (SDR liga JA).</bpmn2:documentation>
     <bpmn2:incoming>Flow_Sdr_P1</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Sdr_P2</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_Sdr_LigaParc" name="SDR liga amarrando no contador">
     <bpmn2:documentation>O SDR liga AMARRANDO no contador — transfere a confianca nos primeiros 5 segundos.

ABERTURA (ligacao):
"Oi [Nome]! Aqui e o [SDR] do Fyness. O [Contador] me pediu pra te ligar — falou que voce ia curtir organizar o financeiro de um jeito mais facil, tudo pelo WhatsApp. Ele te mandou uma mensagem, viu? Posso te mostrar rapidinho como ficaria no teu [segmento]?"

SE NAO ATENDER (follow-up WhatsApp):
"Oi [Nome], aqui e o [SDR] do Fyness — o [Contador] pediu pra eu falar com voce sobre organizar o financeiro do [negocio] pelo WhatsApp. Tentei te ligar. Melhor horario pra 5 min, manha ou tarde?"

REGRA: nao espere o cliente vir — ligue em TODA a base endossada em 2-3 dias. Quem veio pelo CTA, atenda na hora.
Daqui segue pra qualificacao (mesma esteira do inbound/outbound).</bpmn2:documentation>
     <bpmn2:incoming>Flow_Sdr_P2</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Sdr_P3</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:startEvent id="Start_Sdr_Indic" name="Indicacao (cliente atual)">
     <bpmn2:documentation>CANAL Nº1 de geracao de reuniao — quente e gratis. Converte 15-25x mais que cold.
FONTE: cliente atual satisfeito (Kaynan pede indicacao em TODO fechamento) + leads reativados do Nurturing.
REGRA: o SDR trabalha indicacao SEMPRE primeiro, todo dia, antes de qualquer cold.</bpmn2:documentation>
     <bpmn2:outgoing>Flow_Sdr_I1</bpmn2:outgoing>
   </bpmn2:startEvent>

   <bpmn2:task id="Task_Sdr_Indic" name="SDR contata o indicado (morno)">
     <bpmn2:documentation>Abordagem com o nome de quem indicou (transfere a confianca):
"Oi [Nome]! O [Cliente] passou teu contato — ele usa o Fyness pra cuidar do financeiro pelo WhatsApp e falou que ia fazer sentido pra voce tambem. Posso te mostrar em 10 min como ficaria no teu [segmento]? Amanha de manha ou a tarde?"
Lead morno = alta taxa de reuniao. Segue direto pra qualificacao/agendamento.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Sdr_I1</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Sdr_I2</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_Sdr_Merge" name="Em conversa">
     <bpmn2:incoming>Flow_Sdr_2</bpmn2:incoming>
     <bpmn2:incoming>Flow_Sdr_5</bpmn2:incoming>
     <bpmn2:incoming>Flow_Sdr_P3</bpmn2:incoming>
     <bpmn2:incoming>Flow_Sdr_I2</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Sdr_6</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:task id="Task_Sdr_Qualifica" name="Conecta com decisor + qualifica ICP">
     <bpmn2:documentation>Conectou com o decisor. Qualificar ICP (3 de 4): faturamento R$10k+/mes, dor financeira (latente ou ativa), decisor acessivel, segmento atendido.
Fazer 2-3 perguntas de DOR pra confirmar fit e ja gerar interesse:
"Como voce controla o financeiro hoje?" / "Voce sabe seu lucro real do mes passado?" / "Quem cuida disso, voce ou alguem?"
ANOTAR a dor principal e uma estimativa de quanto o lead pode estar perdendo — vai no handoff pro Closer.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Sdr_6</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Sdr_7</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_Sdr_ICP" name="Tem perfil ICP?">
     <bpmn2:incoming>Flow_Sdr_7</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Sdr_9_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_Sdr_8_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:endEvent id="End_Sdr_NurtICP" name="→ NURTURING (sem perfil)">
     <bpmn2:incoming>Flow_Sdr_8_Nao</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:task id="Task_Sdr_Interesse" name="Gera interesse + envia teaser + propoe a reuniao">
     <bpmn2:documentation>Lead qualificado. ESTE e o momento do TEASER — depois que o lead confessou a dor, nao antes.

SEQUENCIA (dor → teaser → agendamento):
1. Conectar com a dor que o lead acabou de falar:
"[Nome], e EXATAMENTE isso que o Fyness mata. Deixa eu te mostrar uma coisa rapidinha."
2. Enviar o TEASER (30-60s) no WhatsApp.
3. Fechar a reuniao usando o teaser como ponte:
"Viu? Voce manda a foto e acabou a planilha. Imagina isso rodando no SEU [segmento]. Vou marcar 20 min com nosso especialista pra ele te mostrar AO VIVO, com os numeros do seu negocio. Fica melhor amanha 10h ou 16h?"

TECNICA: sempre 2 opcoes de horario (alternativa), nunca pergunta aberta.
Confirmar na agenda do Closer + criar lembrete pro lead.

═══ ESPECIFICACAO DO TEASER (o que gravar) ═══
- Duracao: 30-60s (alvo 40s). Vertical 9:16, manda direto no chat do WhatsApp.
- UMA cena so: manda foto do comprovante no WhatsApp → assistente lanca automatico → aparece no fluxo de caixa. Legenda na tela (a maioria ve sem som).
- Primeiros 3 segundos PRENDEM: "Olha o que acontece quando voce manda um comprovante aqui..."
- CTA no fim: "Quer ver isso no SEU negocio?"
- Por segmento se der (restaurante, salao, loja); senao, generico.

REGRA DE OURO: e TEASER, nao demo. Mostra SO o lancamento via WhatsApp (o gancho).
NAO mostrar DRE completo, relatorios, recomendacoes — isso e municao do Closer ao vivo.
Mandar a demo completa aqui QUEIMA o WOW da reuniao e derruba o comparecimento.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Sdr_9_Sim</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Sdr_10</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_Sdr_Agendou" name="Marcou reuniao?">
     <bpmn2:incoming>Flow_Sdr_10</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Sdr_11_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_Sdr_12_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:task id="Task_Sdr_FollowAgenda" name="Follow-up para agendar (D1, D3, D5)">
     <bpmn2:documentation>Lead qualificado mas nao marcou ainda. Cadencia curta de agendamento com dor + prova social:
D1: "[Nome], consegui um horario pro nosso especialista te mostrar quanto voce ta perdendo. Amanha 10h ou 16h?"
D3: "[Nome], o [case do segmento] tava na mesma situacao e ficou adiando. Quando viu os numeros, fechou na hora. Bora marcar 20 min?"
D5: "[Nome], ultima janela essa semana. Cada dia sem controle e dinheiro saindo. Que horario fica bom?"
Se conseguir, marca. Se nao, vai pra Nurturing.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Sdr_12_Nao</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Sdr_13</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_Sdr_AgendouFollow" name="Conseguiu agendar?">
     <bpmn2:incoming>Flow_Sdr_13</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Sdr_14_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_Sdr_15_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:endEvent id="End_Sdr_NurtNaoAgenda" name="→ NURTURING (nao agendou)">
     <bpmn2:incoming>Flow_Sdr_15_Nao</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:task id="Task_Sdr_Handoff" name="Registra Smart Lead + handoff pro Closer">
     <bpmn2:documentation>REUNIAO MARCADA! Registrar Smart Lead no CRM e passar TUDO pro Closer:
- Nome do decisor e WhatsApp
- Segmento e cidade
- Dor financeira principal relatada
- Faturamento aproximado
- Estimativa de quanto o lead esta perdendo por mes (pro Closer ancorar)
- Fonte (inbound da IA ou outbound)
- Data e hora da reuniao
HANDOFF: notificar o Closer + enviar lembrete pro lead 1h antes da reuniao.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Sdr_11_Sim</bpmn2:incoming>
     <bpmn2:incoming>Flow_Sdr_14_Sim</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Sdr_16</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:endEvent id="End_Sdr_Closer" name="→ CLOSER (reuniao agendada)">
     <bpmn2:incoming>Flow_Sdr_16</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:sequenceFlow id="Flow_Sdr_1" sourceRef="Start_Sdr_In" targetRef="Task_Sdr_InContato" />
   <bpmn2:sequenceFlow id="Flow_Sdr_2" sourceRef="Task_Sdr_InContato" targetRef="Gw_Sdr_Merge" />
   <bpmn2:sequenceFlow id="Flow_Sdr_3" sourceRef="Start_Sdr_Out" targetRef="Task_Sdr_Prospecta" />
   <bpmn2:sequenceFlow id="Flow_Sdr_4" sourceRef="Task_Sdr_Prospecta" targetRef="Task_Sdr_ColdEmail" />
   <bpmn2:sequenceFlow id="Flow_Sdr_Cold" sourceRef="Task_Sdr_ColdEmail" targetRef="Gw_Sdr_Engajou" />
   <bpmn2:sequenceFlow id="Flow_Sdr_EngSim" name="Sim (clicou/engajou)" sourceRef="Gw_Sdr_Engajou" targetRef="Task_Sdr_CadOut" />
   <bpmn2:sequenceFlow id="Flow_Sdr_EngNao" name="Nao (frio)" sourceRef="Gw_Sdr_Engajou" targetRef="End_Sdr_NurtFrio" />
   <bpmn2:sequenceFlow id="Flow_Sdr_5" sourceRef="Task_Sdr_CadOut" targetRef="Gw_Sdr_Merge" />
   <bpmn2:sequenceFlow id="Flow_Sdr_P1" sourceRef="Start_Sdr_Parc" targetRef="Task_Sdr_Endosso" />
   <bpmn2:sequenceFlow id="Flow_Sdr_P2" sourceRef="Task_Sdr_Endosso" targetRef="Task_Sdr_LigaParc" />
   <bpmn2:sequenceFlow id="Flow_Sdr_P3" sourceRef="Task_Sdr_LigaParc" targetRef="Gw_Sdr_Merge" />
   <bpmn2:sequenceFlow id="Flow_Sdr_I1" sourceRef="Start_Sdr_Indic" targetRef="Task_Sdr_Indic" />
   <bpmn2:sequenceFlow id="Flow_Sdr_I2" sourceRef="Task_Sdr_Indic" targetRef="Gw_Sdr_Merge" />
   <bpmn2:sequenceFlow id="Flow_Sdr_6" sourceRef="Gw_Sdr_Merge" targetRef="Task_Sdr_Qualifica" />
   <bpmn2:sequenceFlow id="Flow_Sdr_7" sourceRef="Task_Sdr_Qualifica" targetRef="Gw_Sdr_ICP" />
   <bpmn2:sequenceFlow id="Flow_Sdr_8_Nao" name="Sem perfil" sourceRef="Gw_Sdr_ICP" targetRef="End_Sdr_NurtICP" />
   <bpmn2:sequenceFlow id="Flow_Sdr_9_Sim" name="Tem perfil (3/4)" sourceRef="Gw_Sdr_ICP" targetRef="Task_Sdr_Interesse" />
   <bpmn2:sequenceFlow id="Flow_Sdr_10" sourceRef="Task_Sdr_Interesse" targetRef="Gw_Sdr_Agendou" />
   <bpmn2:sequenceFlow id="Flow_Sdr_11_Sim" name="Sim" sourceRef="Gw_Sdr_Agendou" targetRef="Task_Sdr_Handoff" />
   <bpmn2:sequenceFlow id="Flow_Sdr_12_Nao" name="Nao" sourceRef="Gw_Sdr_Agendou" targetRef="Task_Sdr_FollowAgenda" />
   <bpmn2:sequenceFlow id="Flow_Sdr_13" sourceRef="Task_Sdr_FollowAgenda" targetRef="Gw_Sdr_AgendouFollow" />
   <bpmn2:sequenceFlow id="Flow_Sdr_14_Sim" name="Sim" sourceRef="Gw_Sdr_AgendouFollow" targetRef="Task_Sdr_Handoff" />
   <bpmn2:sequenceFlow id="Flow_Sdr_15_Nao" name="Nao" sourceRef="Gw_Sdr_AgendouFollow" targetRef="End_Sdr_NurtNaoAgenda" />
   <bpmn2:sequenceFlow id="Flow_Sdr_16" sourceRef="Task_Sdr_Handoff" targetRef="End_Sdr_Closer" />

 </bpmn2:process>

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- POOL 3: CLOSER (PURPLE) — demo ao vivo, proposta e fechamento   -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmn2:process id="Process_Closer" isExecutable="false">

   <bpmn2:startEvent id="Start_Cl" name="Recebe reuniao agendada (do SDR)">
     <bpmn2:documentation>O Closer recebe a reuniao ja agendada pelo SDR, com todos os dados do Smart Lead.
ACAO IMEDIATA: estudar o lead antes da call.</bpmn2:documentation>
     <bpmn2:outgoing>Flow_Cl_1</bpmn2:outgoing>
   </bpmn2:startEvent>

   <bpmn2:task id="Task_Cl_Prepara" name="Prepara (estuda o lead, 5 min)">
     <bpmn2:documentation>Antes da call (5 min):
1. Ler as notas do SDR (dor principal, segmento, faturamento, estimativa de perda)
2. Pesquisar Instagram/Google da empresa (volume, tamanho)
3. Calcular a estimativa de perda do lead pra usar na demo
4. Preparar o gancho de dor por segmento (Pitch 1 se tem funcionario no financeiro; Pitch 2 se faz sozinho)</bpmn2:documentation>
     <bpmn2:incoming>Flow_Cl_1</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Cl_2</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_Cl_Reuniao" name="Reuniao ao vivo: Retomada + SPIN + Demo">
     <bpmn2:documentation>REUNIAO CONSULTIVA (20-30 min) — fazer DOER antes do WOW:

1) RETOMADA (2-3 min): relembrar a dor que o SDR anotou.
"[Nome], o [SDR] me passou que voce controla o financeiro [na mao/de cabeca/com funcionario]. Piorou, melhorou ou continua igual? Hoje eu te mostro EXATAMENTE quanto isso custa e como resolver."

2) SPIN (5-8 min) — ver anotacao SPIN:
S - "Como controla hoje? Quem faz? Quanto tempo/quanto paga?"
P - "Sabe seu lucro REAL do mes passado? Ja faltou dinheiro pra pagar conta?"
I - "Se perde 5-15% sem saber, em 1 ano da quanto? Se paga R$2-3k/mes de funcionario, sao R$30k/ano."
N - "Se visse no celular agora quanto lucrou e o que tem a pagar — e mandasse foto do comprovante pra acabar com a planilha — quanto valeria?"
ANOTAR os numeros de perda (vao justificar o preco).

3) DEMO (8-10 min) — momento WOW:
"Olha: mando essa foto de comprovante no WhatsApp... pronto, o assistente ja lancou, categorizado, no fluxo de caixa. Voce nunca mais digita nada."
Mostrar com exemplos do segmento do lead:
- Lancamento via WhatsApp (foto/audio/texto) — matar a planilha
- DRE em tempo real — o lucro REAL que ele nao sabia
- Recomendacoes do assistente (custo alto, conta vencendo)
- Fluxo de caixa em tempo real
- Educacao Financeira + Comunidade (pacote completo)
RECONECTAR cada recurso com a dor do SPIN: "Lembra que voce me disse [dor]? Olha como acabou."</bpmn2:documentation>
     <bpmn2:incoming>Flow_Cl_2</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Cl_3</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_Cl_Proposta" name="Proposta e negociacao (R$97 / R$67)">
     <bpmn2:documentation>PROPOSTA COM ANCORAGEM NA PERDA (3-5 min):

TRANSICAO (usar a dor do SPIN):
"[Nome], com tudo que voce me mostrou, voce ta perdendo [estimativa] por mes sem controle. Sao R$[anual] por ANO sumindo. O Fyness resolve isso e ainda se paga."

ANCORAGEM (na economia, nao no preco):
Pitch 1 (tem funcionario): "Voce paga R$2-3k/mes pra alguem fazer o que o assistente faz por R$67/mes. Sao R$2k de economia POR MES."
Pitch 2 (faz sozinho): "Voce gasta horas toda semana e ainda nao sabe o lucro real. R$67/mes no anual = R$2,20/dia. Menos que um cafezinho."

ESCADA DE PRECO (ancorar no anual):
1. ANUAL: R$67/mes (12x = R$804) — MELHOR, ancorar aqui
2. MENSAL: R$97/mes (opcao B)

CARENCIA DE PAGAMENTO (quebra o atrito — substitui o trial):
"E pra voce comecar sem aperto: assina hoje e a primeira cobranca cai em ate 15 dias. Voce ja entra usando, manda o primeiro comprovante no WhatsApp, e so paga depois."

FECHAMENTO (urgencia):
"Faz sentido continuar perdendo [valor do SPIN] por mes ou vamos resolver isso agora? Te mando o contrato e voce ja comeca hoje."

TODOS incluem: assistente no WhatsApp + SaaS completo + Educacao Financeira + Comunidade.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Cl_3</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Cl_4</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_Cl_Fechou" name="Fechou?">
     <bpmn2:incoming>Flow_Cl_4</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Cl_5_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_Cl_8_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:task id="Task_Cl_Contrato" name="Contrato assinado + carencia de pagamento (ate 15d)">
     <bpmn2:documentation>VENDA FECHADA! Formalizar:
1. Enviar contrato por assinatura digital
2. Confirmar plano (Mensal R$97 ou Anual R$67/mes em 12x)
3. Aplicar CARENCIA DE PAGAMENTO de ate 15 dias (assina agora, primeira cobranca em ate 15 dias)
4. Coletar dados de pagamento (cartao recorrente)
5. Disparar o onboarding imediatamente — o lead precisa ver valor ja</bpmn2:documentation>
     <bpmn2:incoming>Flow_Cl_5_Sim</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Cl_6</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_Cl_Onboard" name="Ativar onboarding">
     <bpmn2:documentation>ONBOARDING (ver valor IMEDIATO):
1. Criar conta no Fyness + enviar credenciais (WhatsApp + email)
2. "Manda AGORA a primeira foto de comprovante no WhatsApp e ve o assistente lancando tudo."
3. Sessao de setup (30 min): plano de contas do segmento, contas a pagar/receber
4. Dar acesso a Educacao Financeira + adicionar na Comunidade
5. Agendar check-in D7 e D30
6. Comemorar no grupo de vendas!</bpmn2:documentation>
     <bpmn2:incoming>Flow_Cl_6</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Cl_7</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:endEvent id="End_Cl_Venda" name="VENDA!">
     <bpmn2:incoming>Flow_Cl_7</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:exclusiveGateway id="Gw_Cl_Motivo" name="Motivo da objecao?">
     <bpmn2:incoming>Flow_Cl_8_Nao</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Cl_9_Pensar</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_Cl_10_Caro</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_Cl_11_Momento</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_Cl_12_Perfil</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:task id="Task_Cl_ObjPensar" name="Preciso pensar → follow-up + carencia">
     <bpmn2:documentation>OBJECAO "preciso pensar" = nao sentiu dor suficiente.
Follow-up (D1, D3, D5) reforcando QUANTO perde por dia/mes:
D1: "[Nome], enquanto pensa, o financeiro continua no escuro. Qual a duvida que ta travando?"
D3: prova social ("o [case] ficou pensando e ja tinha perdido R$3k quando comecou").
D5: oferecer comecar com risco baixo via carencia de pagamento: "Assina hoje e so paga em ate 15 dias. Comeca usando sem tirar do bolso agora."
Se nao avancar, mover pra Nurturing.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Cl_9_Pensar</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Cl_13</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_Cl_ObjCaro" name="Esta caro → reframe ROI + carencia">
     <bpmn2:documentation>OBJECAO "esta caro" = reframe pela perda.
"Quanto voce PERDE por mes sem saber o lucro? R$97/mes se paga no primeiro mes. No anual sao R$67/mes — R$2,20 por dia."
Pitch 1: "Voce paga R$2-3k/mes de funcionario. Isso nao e economia, e emergencia."
Pitch 2: "Quanto vale sua hora? Voce ta pagando mais caro pra fazer pior na planilha."
Facilitar entrada: "Assina hoje e a primeira cobranca cai em ate 15 dias."
Se nao avancar, mover pra Nurturing.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Cl_10_Caro</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Cl_14</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_Cl_ObjMomento" name="Nao e o momento → planta dor + Nurturing">
     <bpmn2:documentation>OBJECAO "nao e o momento": plantar a semente da dor e manter canal aberto.
"Quando VAI ser o momento? Enquanto espera, voce perde [valor do SPIN] por mes. Em 6 meses sao [valor x6]."
ACOES: tag "nao_agora" + data de recontato, adicionar na comunidade e em remarketing, mover pra Nurturing com reativacao em 30 dias.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Cl_11_Momento</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Cl_15</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_Cl_ObjPerfil" name="Sem perfil → descarte educado + comunidade">
     <bpmn2:documentation>Closer percebe que nao tem fit real. Descarte educado:
"[Nome], vou ser honesto: nesse momento o Fyness e mais indicado pra [criterio]. Mas voce PRECISA resolver o financeiro. Entra na nossa comunidade gratuita e, quando crescer, me chama."
ACOES: tag "sem_perfil_closer", convidar pra comunidade, mover pra Nurturing (ciclo longo).</bpmn2:documentation>
     <bpmn2:incoming>Flow_Cl_12_Perfil</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Cl_16</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:endEvent id="End_Cl_Nurt" name="→ NURTURING (nao converteu)">
     <bpmn2:incoming>Flow_Cl_13</bpmn2:incoming>
     <bpmn2:incoming>Flow_Cl_14</bpmn2:incoming>
     <bpmn2:incoming>Flow_Cl_15</bpmn2:incoming>
     <bpmn2:incoming>Flow_Cl_16</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:sequenceFlow id="Flow_Cl_1" sourceRef="Start_Cl" targetRef="Task_Cl_Prepara" />
   <bpmn2:sequenceFlow id="Flow_Cl_2" sourceRef="Task_Cl_Prepara" targetRef="Task_Cl_Reuniao" />
   <bpmn2:sequenceFlow id="Flow_Cl_3" sourceRef="Task_Cl_Reuniao" targetRef="Task_Cl_Proposta" />
   <bpmn2:sequenceFlow id="Flow_Cl_4" sourceRef="Task_Cl_Proposta" targetRef="Gw_Cl_Fechou" />
   <bpmn2:sequenceFlow id="Flow_Cl_5_Sim" name="Sim!" sourceRef="Gw_Cl_Fechou" targetRef="Task_Cl_Contrato" />
   <bpmn2:sequenceFlow id="Flow_Cl_6" sourceRef="Task_Cl_Contrato" targetRef="Task_Cl_Onboard" />
   <bpmn2:sequenceFlow id="Flow_Cl_7" sourceRef="Task_Cl_Onboard" targetRef="End_Cl_Venda" />
   <bpmn2:sequenceFlow id="Flow_Cl_8_Nao" name="Nao" sourceRef="Gw_Cl_Fechou" targetRef="Gw_Cl_Motivo" />
   <bpmn2:sequenceFlow id="Flow_Cl_9_Pensar" name="Preciso pensar" sourceRef="Gw_Cl_Motivo" targetRef="Task_Cl_ObjPensar" />
   <bpmn2:sequenceFlow id="Flow_Cl_10_Caro" name="Esta caro" sourceRef="Gw_Cl_Motivo" targetRef="Task_Cl_ObjCaro" />
   <bpmn2:sequenceFlow id="Flow_Cl_11_Momento" name="Nao e o momento" sourceRef="Gw_Cl_Motivo" targetRef="Task_Cl_ObjMomento" />
   <bpmn2:sequenceFlow id="Flow_Cl_12_Perfil" name="Sem perfil" sourceRef="Gw_Cl_Motivo" targetRef="Task_Cl_ObjPerfil" />
   <bpmn2:sequenceFlow id="Flow_Cl_13" sourceRef="Task_Cl_ObjPensar" targetRef="End_Cl_Nurt" />
   <bpmn2:sequenceFlow id="Flow_Cl_14" sourceRef="Task_Cl_ObjCaro" targetRef="End_Cl_Nurt" />
   <bpmn2:sequenceFlow id="Flow_Cl_15" sourceRef="Task_Cl_ObjMomento" targetRef="End_Cl_Nurt" />
   <bpmn2:sequenceFlow id="Flow_Cl_16" sourceRef="Task_Cl_ObjPerfil" targetRef="End_Cl_Nurt" />

 </bpmn2:process>

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- POOL 4: NURTURING (AMBER)                                       -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmn2:process id="Process_Nurt" isExecutable="false">

   <bpmn2:startEvent id="Start_Nu" name="Recebe nao convertidos (todos os pools)">
     <bpmn2:documentation>Recebe leads nao convertidos de qualquer pool:
- IA Inbound: nao respondeu ou nao qualificado pra contato
- SDR: sem perfil ICP ou nao agendou reuniao
- Closer: nao fechou (pensar, caro, nao e o momento, sem perfil)
REGRA: nenhum lead e descartado sem passar por aqui.</bpmn2:documentation>
     <bpmn2:outgoing>Flow_Nu_1</bpmn2:outgoing>
   </bpmn2:startEvent>

   <bpmn2:task id="Task_Nu_Conteudo" name="Conteudo educativo semanal">
     <bpmn2:documentation>CRM envia conteudo educativo automatico toda semana — cada um bate na dor:
S1: "82% dos empresarios nao sabem o lucro real. Veja os 5 sinais de que voce ta perdendo dinheiro."
S2: "Quanto voce ACHA que lucra vs quanto lucra DE VERDADE? A diferenca assusta."
S3: "Cada hora na planilha e uma hora que voce nao ta vendendo."
S4: "O [empresario] resolveu em 30 dias. Veja como."
CANAIS: WhatsApp (principal) + email. Se interagir, notificar o SDR IMEDIATAMENTE.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Nu_1</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Nu_2</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_Nu_Comunidade" name="Convite comunidade de empresarios">
     <bpmn2:documentation>Convidar pra comunidade gratuita de empresarios Fyness.
BENEFICIOS: networking com quem ja resolveu o financeiro, aulas ao vivo, mentoria, materiais.
MENSAGEM (dor + comunidade): "[Nome], enquanto pensa, o financeiro continua no escuro. Mas a comunidade e gratuita — tem gente do seu segmento que ja resolveu. Entra: [link]."</bpmn2:documentation>
     <bpmn2:incoming>Flow_Nu_2</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Nu_3</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_Nu_Remarketing" name="Remarketing (Meta / Google)">
     <bpmn2:documentation>REMARKETING com anuncios de DOR:
1. Adicionar em audiencia do Meta Ads e lista do Google Ads
2. Anuncios focados em dor financeira:
   - "Quanto dinheiro voce perdeu esse mes sem perceber?"
   - "Seu concorrente ja sabe o lucro dele em tempo real. E voce?"
   - "R$2,20/dia pra nunca mais perder dinheiro sem saber"
   - Depoimento: "Descobri que perdia R$3k/mes sem saber"
3. Budget: R$2-5/dia por lead</bpmn2:documentation>
     <bpmn2:incoming>Flow_Nu_3</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Nu_4</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_Nu_Reativacao" name="Reativacao periodica (30-60d, max 3 ciclos)">
     <bpmn2:documentation>REATIVACAO — cada ciclo bate em dor diferente:
CICLO 1 (30d): "Faz 1 mes. Se ainda nao sabe o lucro real, perdeu mais 1 mes de dinheiro. Da pra resolver em 30 dias."
CICLO 2 (60d): "[X] empresarios do seu segmento em [cidade] ja usam o Fyness. Eles sabem o lucro em tempo real. E voce?"
CICLO 3 (90d, ultimo): "Nos ultimos 3 meses voce perdeu entre R$4.500 e R$13.500 sem saber. R$2,20/dia resolve. Quanto voce perdeu hoje?"
MAXIMO 3 ciclos. Se reativar, volta pro SDR humano.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Nu_4</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Nu_5</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_Nu_Reativou" name="Reativou?">
     <bpmn2:incoming>Flow_Nu_5</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Nu_6_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_Nu_7_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:endEvent id="End_Nu_SDR" name="→ SDR HUMANO (reativado)">
     <bpmn2:incoming>Flow_Nu_6_Sim</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:endEvent id="End_Nu_Descarte" name="Descarte elegante (apos 3 ciclos)">
     <bpmn2:documentation>Lead passou por 3 ciclos sem engajar.
1. Remover de listas ativas de remarketing
2. Manter em base fria (reativavel por campanha massiva futura)
3. Tag "descarte_elegante" + data
4. Nao enviar mais mensagens individuais</bpmn2:documentation>
     <bpmn2:incoming>Flow_Nu_7_Nao</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:sequenceFlow id="Flow_Nu_1" sourceRef="Start_Nu" targetRef="Task_Nu_Conteudo" />
   <bpmn2:sequenceFlow id="Flow_Nu_2" sourceRef="Task_Nu_Conteudo" targetRef="Task_Nu_Comunidade" />
   <bpmn2:sequenceFlow id="Flow_Nu_3" sourceRef="Task_Nu_Comunidade" targetRef="Task_Nu_Remarketing" />
   <bpmn2:sequenceFlow id="Flow_Nu_4" sourceRef="Task_Nu_Remarketing" targetRef="Task_Nu_Reativacao" />
   <bpmn2:sequenceFlow id="Flow_Nu_5" sourceRef="Task_Nu_Reativacao" targetRef="Gw_Nu_Reativou" />
   <bpmn2:sequenceFlow id="Flow_Nu_6_Sim" name="Sim (reativou)" sourceRef="Gw_Nu_Reativou" targetRef="End_Nu_SDR" />
   <bpmn2:sequenceFlow id="Flow_Nu_7_Nao" name="Nao (3 ciclos)" sourceRef="Gw_Nu_Reativou" targetRef="End_Nu_Descarte" />

 </bpmn2:process>

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- BPMN DIAGRAM: layout visual                                     -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmndi:BPMNDiagram id="BPMNDiagram_InsideSales">
   <bpmndi:BPMNPlane id="BPMNPlane_InsideSales" bpmnElement="Collaboration_InsideSales">

     <!-- POOL 1: IA INBOUND (GREEN) -->
     <bpmndi:BPMNShape id="Shape_Pool_IaInbound" bpmnElement="Pool_IaInbound" isHorizontal="true" bioc:stroke="#66bb6a" bioc:fill="#f1f8e9">
       <dc:Bounds x="160" y="40" width="2000" height="360" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Start_In" bpmnElement="Start_In">
       <dc:Bounds x="240" y="162" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="222" y="205" width="80" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_In_Responde" bpmnElement="Task_In_Responde">
       <dc:Bounds x="330" y="140" width="160" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Gw_In_Respondeu" bpmnElement="Gw_In_Respondeu" isMarkerVisible="true">
       <dc:Bounds x="540" y="155" width="50" height="50" />
       <bpmndi:BPMNLabel><dc:Bounds x="535" y="128" width="60" height="14" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_In_FollowUp" bpmnElement="Task_In_FollowUp">
       <dc:Bounds x="485" y="270" width="160" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Gw_In_RespFollow" bpmnElement="Gw_In_RespFollow" isMarkerVisible="true">
       <dc:Bounds x="700" y="285" width="50" height="50" />
       <bpmndi:BPMNLabel><dc:Bounds x="690" y="338" width="70" height="14" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_End_In_NurtNaoResp" bpmnElement="End_In_NurtNaoResp">
       <dc:Bounds x="820" y="292" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="800" y="332" width="80" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Gw_In_Real" bpmnElement="Gw_In_Real" isMarkerVisible="true">
       <dc:Bounds x="660" y="155" width="50" height="50" />
       <bpmndi:BPMNLabel><dc:Bounds x="650" y="128" width="70" height="14" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_End_In_Descarte" bpmnElement="End_In_Descarte">
       <dc:Bounds x="667" y="155" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="600" y="115" width="170" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_In_Entrega" bpmnElement="Task_In_Entrega">
       <dc:Bounds x="780" y="140" width="160" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_End_In_SDR" bpmnElement="End_In_SDR">
       <dc:Bounds x="1000" y="162" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="978" y="205" width="80" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <bpmndi:BPMNEdge id="Edge_Flow_In_1" bpmnElement="Flow_In_1"><di:waypoint x="276" y="180" /><di:waypoint x="330" y="180" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_2" bpmnElement="Flow_In_2"><di:waypoint x="490" y="180" /><di:waypoint x="540" y="180" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_3_Sim" bpmnElement="Flow_In_3_Sim"><di:waypoint x="590" y="180" /><di:waypoint x="660" y="180" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_4_Nao" bpmnElement="Flow_In_4_Nao"><di:waypoint x="565" y="205" /><di:waypoint x="565" y="270" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_5" bpmnElement="Flow_In_5"><di:waypoint x="645" y="310" /><di:waypoint x="700" y="310" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_6_Sim" bpmnElement="Flow_In_6_Sim"><di:waypoint x="725" y="285" /><di:waypoint x="725" y="180" /><di:waypoint x="710" y="180" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_7_Nao" bpmnElement="Flow_In_7_Nao"><di:waypoint x="750" y="310" /><di:waypoint x="820" y="310" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_8_Sim" bpmnElement="Flow_In_8_Sim"><di:waypoint x="710" y="180" /><di:waypoint x="780" y="180" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_9_Nao" bpmnElement="Flow_In_9_Nao"><di:waypoint x="685" y="180" /><di:waypoint x="685" y="191" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_10" bpmnElement="Flow_In_10"><di:waypoint x="940" y="180" /><di:waypoint x="1000" y="180" /></bpmndi:BPMNEdge>

     <!-- POOL 2: SDR HUMANO (BLUE) -->
     <bpmndi:BPMNShape id="Shape_Pool_Sdr" bpmnElement="Pool_Sdr" isHorizontal="true" bioc:stroke="#42a5f5" bioc:fill="#e3f2fd">
       <dc:Bounds x="160" y="440" width="2000" height="560" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Start_Sdr_In" bpmnElement="Start_Sdr_In">
       <dc:Bounds x="240" y="502" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="222" y="545" width="90" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Sdr_InContato" bpmnElement="Task_Sdr_InContato">
       <dc:Bounds x="320" y="480" width="160" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Start_Sdr_Out" bpmnElement="Start_Sdr_Out">
       <dc:Bounds x="240" y="682" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="222" y="725" width="90" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Sdr_Prospecta" bpmnElement="Task_Sdr_Prospecta">
       <dc:Bounds x="320" y="660" width="160" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Sdr_ColdEmail" bpmnElement="Task_Sdr_ColdEmail">
       <dc:Bounds x="520" y="660" width="170" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Gw_Sdr_Engajou" bpmnElement="Gw_Sdr_Engajou" isMarkerVisible="true">
       <dc:Bounds x="720" y="675" width="50" height="50" />
       <bpmndi:BPMNLabel><dc:Bounds x="700" y="648" width="90" height="14" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Sdr_CadOut" bpmnElement="Task_Sdr_CadOut">
       <dc:Bounds x="800" y="660" width="170" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_End_Sdr_NurtFrio" bpmnElement="End_Sdr_NurtFrio">
       <dc:Bounds x="727" y="792" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="700" y="832" width="100" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Start_Sdr_Parc" bpmnElement="Start_Sdr_Parc">
       <dc:Bounds x="240" y="592" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="222" y="628" width="90" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Sdr_Endosso" bpmnElement="Task_Sdr_Endosso">
       <dc:Bounds x="320" y="570" width="170" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Sdr_LigaParc" bpmnElement="Task_Sdr_LigaParc">
       <dc:Bounds x="560" y="570" width="180" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Start_Sdr_Indic" bpmnElement="Start_Sdr_Indic">
       <dc:Bounds x="240" y="872" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="222" y="912" width="90" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Sdr_Indic" bpmnElement="Task_Sdr_Indic">
       <dc:Bounds x="320" y="850" width="180" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Gw_Sdr_Merge" bpmnElement="Gw_Sdr_Merge" isMarkerVisible="true">
       <dc:Bounds x="1010" y="585" width="50" height="50" />
       <bpmndi:BPMNLabel><dc:Bounds x="1005" y="558" width="60" height="14" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Sdr_Qualifica" bpmnElement="Task_Sdr_Qualifica">
       <dc:Bounds x="1110" y="570" width="170" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Gw_Sdr_ICP" bpmnElement="Gw_Sdr_ICP" isMarkerVisible="true">
       <dc:Bounds x="1320" y="585" width="50" height="50" />
       <bpmndi:BPMNLabel><dc:Bounds x="1310" y="558" width="70" height="14" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_End_Sdr_NurtICP" bpmnElement="End_Sdr_NurtICP">
       <dc:Bounds x="1327" y="720" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="1300" y="760" width="90" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Sdr_Interesse" bpmnElement="Task_Sdr_Interesse">
       <dc:Bounds x="1420" y="570" width="190" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Gw_Sdr_Agendou" bpmnElement="Gw_Sdr_Agendou" isMarkerVisible="true">
       <dc:Bounds x="1650" y="585" width="50" height="50" />
       <bpmndi:BPMNLabel><dc:Bounds x="1638" y="558" width="74" height="14" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Sdr_FollowAgenda" bpmnElement="Task_Sdr_FollowAgenda">
       <dc:Bounds x="1595" y="720" width="160" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Gw_Sdr_AgendouFollow" bpmnElement="Gw_Sdr_AgendouFollow" isMarkerVisible="true">
       <dc:Bounds x="1810" y="735" width="50" height="50" />
       <bpmndi:BPMNLabel><dc:Bounds x="1798" y="788" width="74" height="14" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_End_Sdr_NurtNaoAgenda" bpmnElement="End_Sdr_NurtNaoAgenda">
       <dc:Bounds x="1910" y="742" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="1890" y="782" width="80" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Sdr_Handoff" bpmnElement="Task_Sdr_Handoff">
       <dc:Bounds x="1750" y="570" width="170" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_End_Sdr_Closer" bpmnElement="End_Sdr_Closer">
       <dc:Bounds x="1960" y="592" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="1938" y="635" width="90" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_1" bpmnElement="Flow_Sdr_1"><di:waypoint x="276" y="520" /><di:waypoint x="320" y="520" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_2" bpmnElement="Flow_Sdr_2"><di:waypoint x="480" y="520" /><di:waypoint x="1035" y="520" /><di:waypoint x="1035" y="585" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_3" bpmnElement="Flow_Sdr_3"><di:waypoint x="276" y="700" /><di:waypoint x="320" y="700" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_4" bpmnElement="Flow_Sdr_4"><di:waypoint x="480" y="700" /><di:waypoint x="520" y="700" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_Cold" bpmnElement="Flow_Sdr_Cold"><di:waypoint x="690" y="700" /><di:waypoint x="720" y="700" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_EngSim" bpmnElement="Flow_Sdr_EngSim"><di:waypoint x="770" y="700" /><di:waypoint x="800" y="700" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_EngNao" bpmnElement="Flow_Sdr_EngNao"><di:waypoint x="745" y="725" /><di:waypoint x="745" y="792" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_5" bpmnElement="Flow_Sdr_5"><di:waypoint x="970" y="700" /><di:waypoint x="1035" y="700" /><di:waypoint x="1035" y="635" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_P1" bpmnElement="Flow_Sdr_P1"><di:waypoint x="276" y="610" /><di:waypoint x="320" y="610" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_P2" bpmnElement="Flow_Sdr_P2"><di:waypoint x="490" y="610" /><di:waypoint x="560" y="610" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_P3" bpmnElement="Flow_Sdr_P3"><di:waypoint x="740" y="610" /><di:waypoint x="1010" y="610" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_I1" bpmnElement="Flow_Sdr_I1"><di:waypoint x="276" y="890" /><di:waypoint x="320" y="890" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_I2" bpmnElement="Flow_Sdr_I2"><di:waypoint x="500" y="890" /><di:waypoint x="1045" y="890" /><di:waypoint x="1045" y="635" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_6" bpmnElement="Flow_Sdr_6"><di:waypoint x="1060" y="610" /><di:waypoint x="1110" y="610" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_7" bpmnElement="Flow_Sdr_7"><di:waypoint x="1280" y="610" /><di:waypoint x="1320" y="610" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_8_Nao" bpmnElement="Flow_Sdr_8_Nao"><di:waypoint x="1345" y="635" /><di:waypoint x="1345" y="720" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_9_Sim" bpmnElement="Flow_Sdr_9_Sim"><di:waypoint x="1370" y="610" /><di:waypoint x="1420" y="610" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_10" bpmnElement="Flow_Sdr_10"><di:waypoint x="1610" y="610" /><di:waypoint x="1650" y="610" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_11_Sim" bpmnElement="Flow_Sdr_11_Sim"><di:waypoint x="1700" y="610" /><di:waypoint x="1750" y="610" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_12_Nao" bpmnElement="Flow_Sdr_12_Nao"><di:waypoint x="1675" y="635" /><di:waypoint x="1675" y="720" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_13" bpmnElement="Flow_Sdr_13"><di:waypoint x="1755" y="760" /><di:waypoint x="1810" y="760" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_14_Sim" bpmnElement="Flow_Sdr_14_Sim"><di:waypoint x="1835" y="735" /><di:waypoint x="1835" y="650" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_15_Nao" bpmnElement="Flow_Sdr_15_Nao"><di:waypoint x="1860" y="760" /><di:waypoint x="1910" y="760" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Sdr_16" bpmnElement="Flow_Sdr_16"><di:waypoint x="1920" y="610" /><di:waypoint x="1960" y="610" /></bpmndi:BPMNEdge>

     <!-- POOL 3: CLOSER (PURPLE) -->
     <bpmndi:BPMNShape id="Shape_Pool_Closer" bpmnElement="Pool_Closer" isHorizontal="true" bioc:stroke="#7e57c2" bioc:fill="#ede7f6">
       <dc:Bounds x="160" y="1040" width="2000" height="560" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Start_Cl" bpmnElement="Start_Cl">
       <dc:Bounds x="240" y="1162" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="222" y="1205" width="90" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Cl_Prepara" bpmnElement="Task_Cl_Prepara">
       <dc:Bounds x="320" y="1140" width="160" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Cl_Reuniao" bpmnElement="Task_Cl_Reuniao">
       <dc:Bounds x="540" y="1135" width="190" height="90" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Cl_Proposta" bpmnElement="Task_Cl_Proposta">
       <dc:Bounds x="780" y="1135" width="190" height="90" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Gw_Cl_Fechou" bpmnElement="Gw_Cl_Fechou" isMarkerVisible="true">
       <dc:Bounds x="1010" y="1155" width="50" height="50" />
       <bpmndi:BPMNLabel><dc:Bounds x="1005" y="1128" width="60" height="14" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Cl_Contrato" bpmnElement="Task_Cl_Contrato">
       <dc:Bounds x="1110" y="1140" width="180" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Cl_Onboard" bpmnElement="Task_Cl_Onboard">
       <dc:Bounds x="1330" y="1140" width="160" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_End_Cl_Venda" bpmnElement="End_Cl_Venda">
       <dc:Bounds x="1540" y="1162" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="1535" y="1205" width="50" height="20" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Gw_Cl_Motivo" bpmnElement="Gw_Cl_Motivo" isMarkerVisible="true">
       <dc:Bounds x="1010" y="1335" width="50" height="50" />
       <bpmndi:BPMNLabel><dc:Bounds x="998" y="1308" width="74" height="14" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Cl_ObjPensar" bpmnElement="Task_Cl_ObjPensar">
       <dc:Bounds x="540" y="1440" width="160" height="70" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Cl_ObjCaro" bpmnElement="Task_Cl_ObjCaro">
       <dc:Bounds x="740" y="1440" width="160" height="70" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Cl_ObjMomento" bpmnElement="Task_Cl_ObjMomento">
       <dc:Bounds x="940" y="1440" width="160" height="70" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Cl_ObjPerfil" bpmnElement="Task_Cl_ObjPerfil">
       <dc:Bounds x="1140" y="1440" width="160" height="70" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_End_Cl_Nurt" bpmnElement="End_Cl_Nurt">
       <dc:Bounds x="1402" y="1522" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="1382" y="1562" width="80" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <bpmndi:BPMNEdge id="Edge_Flow_Cl_1" bpmnElement="Flow_Cl_1"><di:waypoint x="276" y="1180" /><di:waypoint x="320" y="1180" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Cl_2" bpmnElement="Flow_Cl_2"><di:waypoint x="480" y="1180" /><di:waypoint x="540" y="1180" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Cl_3" bpmnElement="Flow_Cl_3"><di:waypoint x="730" y="1180" /><di:waypoint x="780" y="1180" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Cl_4" bpmnElement="Flow_Cl_4"><di:waypoint x="970" y="1180" /><di:waypoint x="1010" y="1180" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Cl_5_Sim" bpmnElement="Flow_Cl_5_Sim"><di:waypoint x="1060" y="1180" /><di:waypoint x="1110" y="1180" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Cl_6" bpmnElement="Flow_Cl_6"><di:waypoint x="1290" y="1180" /><di:waypoint x="1330" y="1180" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Cl_7" bpmnElement="Flow_Cl_7"><di:waypoint x="1490" y="1180" /><di:waypoint x="1540" y="1180" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Cl_8_Nao" bpmnElement="Flow_Cl_8_Nao"><di:waypoint x="1035" y="1205" /><di:waypoint x="1035" y="1335" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Cl_9_Pensar" bpmnElement="Flow_Cl_9_Pensar"><di:waypoint x="1010" y="1360" /><di:waypoint x="620" y="1360" /><di:waypoint x="620" y="1440" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Cl_10_Caro" bpmnElement="Flow_Cl_10_Caro"><di:waypoint x="1020" y="1385" /><di:waypoint x="820" y="1410" /><di:waypoint x="820" y="1440" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Cl_11_Momento" bpmnElement="Flow_Cl_11_Momento"><di:waypoint x="1035" y="1385" /><di:waypoint x="1035" y="1440" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Cl_12_Perfil" bpmnElement="Flow_Cl_12_Perfil"><di:waypoint x="1060" y="1360" /><di:waypoint x="1220" y="1360" /><di:waypoint x="1220" y="1440" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Cl_13" bpmnElement="Flow_Cl_13"><di:waypoint x="620" y="1510" /><di:waypoint x="620" y="1540" /><di:waypoint x="1402" y="1540" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Cl_14" bpmnElement="Flow_Cl_14"><di:waypoint x="820" y="1510" /><di:waypoint x="820" y="1540" /><di:waypoint x="1402" y="1540" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Cl_15" bpmnElement="Flow_Cl_15"><di:waypoint x="1020" y="1510" /><di:waypoint x="1020" y="1540" /><di:waypoint x="1402" y="1540" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Cl_16" bpmnElement="Flow_Cl_16"><di:waypoint x="1220" y="1510" /><di:waypoint x="1220" y="1540" /><di:waypoint x="1402" y="1540" /></bpmndi:BPMNEdge>

     <!-- POOL 4: NURTURING (AMBER) -->
     <bpmndi:BPMNShape id="Shape_Pool_Nurt" bpmnElement="Pool_Nurt" isHorizontal="true" bioc:stroke="#ffa726" bioc:fill="#fff8e1">
       <dc:Bounds x="160" y="1640" width="2000" height="320" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Start_Nu" bpmnElement="Start_Nu">
       <dc:Bounds x="240" y="1762" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="222" y="1805" width="90" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Nu_Conteudo" bpmnElement="Task_Nu_Conteudo">
       <dc:Bounds x="320" y="1740" width="160" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Nu_Comunidade" bpmnElement="Task_Nu_Comunidade">
       <dc:Bounds x="540" y="1740" width="160" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Nu_Remarketing" bpmnElement="Task_Nu_Remarketing">
       <dc:Bounds x="760" y="1740" width="160" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Nu_Reativacao" bpmnElement="Task_Nu_Reativacao">
       <dc:Bounds x="980" y="1740" width="180" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Gw_Nu_Reativou" bpmnElement="Gw_Nu_Reativou" isMarkerVisible="true">
       <dc:Bounds x="1200" y="1755" width="50" height="50" />
       <bpmndi:BPMNLabel><dc:Bounds x="1195" y="1728" width="60" height="14" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_End_Nu_SDR" bpmnElement="End_Nu_SDR">
       <dc:Bounds x="1300" y="1762" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="1280" y="1805" width="90" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_End_Nu_Descarte" bpmnElement="End_Nu_Descarte">
       <dc:Bounds x="1207" y="1870" width="36" height="36" />
       <bpmndi:BPMNLabel><dc:Bounds x="1187" y="1910" width="90" height="40" /></bpmndi:BPMNLabel>
     </bpmndi:BPMNShape>

     <bpmndi:BPMNEdge id="Edge_Flow_Nu_1" bpmnElement="Flow_Nu_1"><di:waypoint x="276" y="1780" /><di:waypoint x="320" y="1780" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Nu_2" bpmnElement="Flow_Nu_2"><di:waypoint x="480" y="1780" /><di:waypoint x="540" y="1780" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Nu_3" bpmnElement="Flow_Nu_3"><di:waypoint x="700" y="1780" /><di:waypoint x="760" y="1780" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Nu_4" bpmnElement="Flow_Nu_4"><di:waypoint x="920" y="1780" /><di:waypoint x="980" y="1780" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Nu_5" bpmnElement="Flow_Nu_5"><di:waypoint x="1160" y="1780" /><di:waypoint x="1200" y="1780" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Nu_6_Sim" bpmnElement="Flow_Nu_6_Sim"><di:waypoint x="1250" y="1780" /><di:waypoint x="1300" y="1780" /></bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Nu_7_Nao" bpmnElement="Flow_Nu_7_Nao"><di:waypoint x="1225" y="1805" /><di:waypoint x="1225" y="1870" /></bpmndi:BPMNEdge>

     <!-- ANNOTATIONS -->
     <bpmndi:BPMNShape id="Shape_Annotation_Precos" bpmnElement="Annotation_Precos">
       <dc:Bounds x="200" y="2010" width="440" height="420" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Annotation_ICP" bpmnElement="Annotation_ICP">
       <dc:Bounds x="680" y="2010" width="380" height="360" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Annotation_SPIN" bpmnElement="Annotation_SPIN">
       <dc:Bounds x="1100" y="2010" width="440" height="360" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Annotation_Portais" bpmnElement="Annotation_Portais">
       <dc:Bounds x="1580" y="2010" width="380" height="220" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Annotation_PlaybookSdr" bpmnElement="Annotation_PlaybookSdr">
       <dc:Bounds x="200" y="2470" width="520" height="340" />
     </bpmndi:BPMNShape>

   </bpmndi:BPMNPlane>
 </bpmndi:BPMNDiagram>

</bpmn2:definitions>`;

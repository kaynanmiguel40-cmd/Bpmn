/**
 * Template BPMN 2.0 — INSIDE SALES FYNESS (v3 — 4 Pools)
 * Metodologia: Vivendo de SaaS (Gus Domingues + Leticia Medeiros)
 * Adaptado para a operacao comercial do Fyness (SaaS Financeiro com Assistente Financeiro no WhatsApp + Educacao Financeira + Comunidade de Empresarios)
 * O assistente processa lancamentos via WhatsApp (foto, audio, texto), da recomendacoes financeiras e substitui funcionario do financeiro.
 *
 * ═══════════════════════════════════════════════════════════════════════
 * FUNDAMENTOS DA METODOLOGIA "VIVENDO DE SAAS"
 * ═══════════════════════════════════════════════════════════════════════
 *
 * PRINCIPIO CENTRAL: Venda consultiva + Educacao como moeda de negociacao.
 * O vendedor SaaS nao empurra produto — ele educa o prospect, entrega valor
 * antes de pedir dinheiro e constroi relacionamento de confianca.
 *
 * MODELO 4 POOLS (v3 — Inbound e Outbound separados):
 * Pool 1: SDR Robo INBOUND  → Speed to Lead, qualificacao rapida
 * Pool 2: SDR Robo OUTBOUND → Aquecimento personalizado 7 dias (Google Meu Negocio)
 * Pool 3: Vendedor           → Conexao + Venda Consultiva completa (AIDA + SPIN + Demo + Fechamento)
 * Pool 4: Nurturing          → Educacao continua para leads nao convertidos
 *
 * VANTAGENS DO MODELO v3:
 * - Inbound e Outbound com cadencias completamente diferentes
 * - Outbound usa dados publicos (Google Meu Negocio) + aquecimento 7 dias
 * - Inbound prioriza Speed to Lead (resposta em 5 min)
 * - Vendedor recebe leads mornos de AMBOS os fluxos
 * - Nurturing centralizado recebe nao-convertidos de TODOS os pools
 *
 * EPISODIOS DE REFERENCIA:
 * - Ep. 1: Estrutura de time SDR + metricas
 * - Ep. 2: Cadencia transacional (5 ligacoes, 3 WhatsApp, 1 email break-off)
 * - Ep. 3: Ligacao de prospeccao com AIDA (Atencao, Interesse, Desejo, Acao)
 * - Ep. 4: Gatekeepers e tecnicas de passagem
 * - Ep. 5: Reuniao de venda consultiva (SPIN Selling)
 * - Ep. 6: Proposta, negociacao e fechamento
 *
 * METRICAS-CHAVE:
 * - Taxa de resposta robo inbound: >40%
 * - Taxa de engajamento outbound: >15%
 * - Taxa de qualificacao ICP: >40% dos que respondem
 * - Taxa de conexao vendedor: >50%
 * - Taxa de demo agendada: >40% das conexoes
 * - Taxa de fechamento: >25%
 * - Taxa de conversao trial→pago: >25%
 * - Ciclo medio de venda: 5-12 dias
 *
 * PRECOS FYNESS:
 * - Mensal: R$197/mes (cartao recorrente)
 * - Semestral: R$997 (cartao ou boleto) = R$166/mes
 * - Anual Cartao: R$137/mes (12x = R$1.644)
 * - Anual PIX: R$1.497 a vista (sem taxa = melhor preco)
 * - Trial: 7 dias gratis, sem cartao
 *
 * PRODUTO FYNESS:
 * - SaaS financeiro com Assistente Financeiro no WhatsApp: manda foto do comprovante, audio ou texto e o assistente lanca tudo automatico
 * - Lancamentos automaticos via WhatsApp (nao precisa abrir sistema)
 * - Recomendacoes financeiras inteligentes (assistenteavisa quando cortar custo, quando tem conta vencendo)
 * - Substitui funcionario do financeiro (economia de R$2-3k/mes)
 * - Fluxo de caixa, contas a pagar/receber, DRE, conciliacao bancaria — tudo atualizado em tempo real
 * - Plataforma de Educacao Financeira: cursos, aulas ao vivo, materiais
 * - Comunidade exclusiva de empresarios: networking, mentoria, experiencias compartilhadas
 *
 * PITCHES PRINCIPAIS:
 * - Pitch 1 "Manda o financeiro embora": pra quem tem funcionario fazendo financeiro (economia R$2-3k/mes)
 * - Pitch 2 "Para de perder horas com planilha": pra dono que faz sozinho (economia de tempo + controle melhor)
 *
 * EDUCACAO COMO MOEDA:
 * - Educacao financeira NAO e bonus — e parte integral da oferta
 * - Comunidade de empresarios como diferencial competitivo unico
 * - Conteudos educativos semanais sobre gestao financeira
 * - Suporte consultivo (nao so tecnico)
 *
 * LAYOUT DOS POOLS:
 * - Pool 1 (Inbound GREEN):   x=160, y=60,   w=2600, h=350  | elements y: 80-390
 * - Pool 2 (Outbound ORANGE): x=160, y=480,  w=2600, h=350  | elements y: 500-810
 * - Pool 3 (Vendedor BLUE):   x=160, y=900,  w=4200, h=850  | elements y: 920-1730
 * - Pool 4 (Nurturing PURPLE):x=160, y=1820, w=2600, h=320  | elements y: 1840-2120
 * - Annotations: below Pool 4, y>=2200
 *
 * PORTAIS (Link Events substituem Message Flows):
 * → VENDEDOR = Lead qualificado vai pro Pool Vendedor
 * → NURTURING = Lead nao convertido vai pro Pool Nurturing
 * → SDR INBOUND = Lead reativado volta pro Pool Inbound
 *
 * Criado: Marco 2026 | Equipe Fyness | v3 — Modelo 4 Pools (Inbound/Outbound separados)
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
 targetNamespace="http://fyness.com/bpmn/inside-sales-v3">

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- COLLABORATION: 4 POOLS + PORTAIS (Link Events)                -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmn2:collaboration id="Collaboration_InsideSales">

   <!-- POOL 1: SDR ROBO INBOUND (GREEN) -->
   <bpmn2:participant id="Pool_Inbound" name="SDR ROBO INBOUND — Qualificacao Rapida (Speed to Lead)" processRef="Process_Inbound" />

   <!-- POOL 2: SDR ROBO OUTBOUND (ORANGE) -->
   <bpmn2:participant id="Pool_Outbound" name="SDR ROBO OUTBOUND — Aquecimento Personalizado (7 dias)" processRef="Process_Outbound" />

   <!-- POOL 3: VENDEDOR (BLUE) -->
   <bpmn2:participant id="Pool_Vendedor" name="VENDEDOR — Conexao + Venda Consultiva (AIDA + SPIN + Demo + Fechamento)" processRef="Process_Vendedor" />

   <!-- POOL 4: NURTURING (PURPLE) -->
   <bpmn2:participant id="Pool_Nurturing" name="NURTURING e EDUCACAO — Reativacao e Conteudo Continuo" processRef="Process_Nurturing" />

   <!-- TEXT ANNOTATIONS -->
   <bpmn2:textAnnotation id="Annotation_Portais">
     <bpmn2:text>PORTAIS DE NAVEGACAO ENTRE POOLS:

→ VENDEDOR = Lead qualificado vai pro Pool Vendedor
→ NURTURING = Lead nao convertido vai pro Pool Nurturing
→ SDR INBOUND = Lead reativado volta pro Pool Inbound

Os portais substituem as linhas tracejadas.
Siga o nome do portal pra encontrar o destino.</bpmn2:text>
   </bpmn2:textAnnotation>

   <bpmn2:textAnnotation id="Annotation_ICP">
     <bpmn2:text>ICP CHECKLIST (3 de 4 = qualificado):

1. SEGMENTO: Ja vem da Landing Page (preencheu form)
   Nao precisa perguntar — o CRM ja tem essa info.

2. FATURAMENTO: Minimo R$10k/mes
   Abaixo disso R$197/mes pesa demais no orcamento.

3. DOR FINANCEIRA (latente OU ativa):
   Ativa = "Estou perdendo dinheiro e sei disso"
   Latente = "Nao sei meu lucro real mas acho que ta ok"
   QUALQUER UMA das dores abaixo qualifica:
   - Nao sabe o lucro real no fim do mes
   - Mistura conta PF com PJ
   - Controla na cabeca, caderno ou planilha bagunçada
   - Nao sabe quanto entra e sai por dia
   - Ja tentou sistema e desistiu (trauma de ERP)
   - Funcionario mexe no dinheiro sem controle
   - Nao faz DRE / nao sabe o que e DRE
   - Paga conta atrasada por falta de organizacao
   - Paga funcionario so pra fazer financeiro (R$2-3k/mes)
   - Gasta horas por semana em planilha/caderno

4. DECISOR ACESSIVEL: Dono, socio ou gerente
   com autonomia pra decidir a compra.

DESQUALIFICADORES:
- Faturamento abaixo de R$5k/mes (nao sustenta)
- Ja usa ERP robusto e esta satisfeito (SAP, TOTVS)
- Empresa em recuperacao judicial
- Nao tem nenhuma dor financeira identificada</bpmn2:text>
   </bpmn2:textAnnotation>

<bpmn2:textAnnotation id="Annotation_SPIN">
     <bpmn2:text>FRAMEWORK SPIN AGRESSIVO (Descoberta na Demo):
S - SITUACAO (entender pra fazer DOER depois):
    "Como voce controla o financeiro hoje?"
    "Quem faz?" / "Quanto tempo gasta por semana?"
    "Quanto paga pro funcionario que cuida disso?" (se tem)
P - PROBLEMA (perguntas que INCOMODAM):
    "Voce sabe seu lucro REAL no fim do mes?"
    "Ja aconteceu de chegar no final do mes e NAO ter dinheiro pra pagar as contas?"
    "Quanto voce paga pro funcionario que faz isso?" (se tem)
    "Se eu te perguntar seu lucro real AGORA, voce sabe responder?"
I - IMPLICACAO (AMPLIFICAR — fazer DOER):
    "Se voce ta perdendo 5-15% do faturamento sem saber, em 1 ano isso da quanto?"
    "O que acontece se voce continuar mais 6 meses sem saber pra onde vai o dinheiro?"
    "Se paga R$2-3k/mes de funcionario, sao R$30k/ano. E se um assistente no WhatsApp fizesse por R$137/mes?"
    "Seu concorrente ja sabe o lucro dele em tempo real. E voce?"
N - NECESSIDADE (lead verbaliza a solucao):
    "Se voce pudesse ver AGORA, no celular, quanto lucrou hoje, quanto tem a pagar essa semana,
    e receber um alerta quando um custo ta acima do normal — quanto isso valeria pra voce?"
    "Se pudesse mandar foto do comprovante e acabar com planilha PRA SEMPRE — faria sentido?"</bpmn2:text>
   </bpmn2:textAnnotation>

   <bpmn2:textAnnotation id="Annotation_Precos">
     <bpmn2:text>PRECOS, DIFERENCIAL E CONDICOES DE FECHAMENTO:

═══════════════════════════════════════════
PLANOS FYNESS:
═══════════════════════════════════════════
MENSAL: R$197/mes (cartao recorrente)
SEMESTRAL: R$997 cartao ou boleto (R$166/mes)
ANUAL CARTAO: R$137/mes (12x = R$1.644)
ANUAL PIX: R$1.497 a vista (sem taxa = menor preco)
TRIAL: 7 dias GRATIS, sem cartao

═══════════════════════════════════════════
O QUE INCLUI (diferencial unico Fyness):
═══════════════════════════════════════════
1. assistenteno WhatsApp (manda foto, audio, texto — assistenteprocessa automatico)
2. Lancamentos automaticos (nao precisa abrir sistema, faz pelo WhatsApp)
3. Recomendacoes financeiras inteligentes (assistenteavisa quando cortar custo, conta vencendo)
4. SaaS Financeiro completo (fluxo caixa, DRE, contas — tudo atualizado em tempo real)
5. Plataforma de Educacao Financeira (cursos, aulas ao vivo)
6. Comunidade Exclusiva de Empresarios (networking, mentoria)

ECONOMIA: Substitui funcionario financeiro (R$2-3k/mes).
Tao simples que o dono faz sozinho pelo WhatsApp (sem treinamento).

ANCORAGEM: "Voce paga R$2-3k/mes pra alguem fazer o financeiro.
O Fyness custa R$137/mes no anual. Voce economiza R$2k e tem controle melhor."

═══════════════════════════════════════════
FLUXO DE NEGOCIACAO (escada de preco):
═══════════════════════════════════════════
1. Anual PIX a vista (R$1.497) — MELHOR (sem taxa!)
   → nao tem pix?
2. Anual cartao (12x R$137 = R$1.644)
   → cartao nao passou?
3. Semestral R$997 (cartao ou boleto)
   → nao tem R$997?
4. Anual boleto 3x (R$548/parcela) — so lead top
   → nao quer compromisso longo?
5. Mensal R$197/mes (cartao recorrente)
   → "preciso pensar"?
6. Trial 7 dias gratis → converter depois

═══════════════════════════════════════════
PARCELAMENTO (excecao, nao regra):
═══════════════════════════════════════════
ANUAL PIX: R$1.497 a vista — SEM TAXA, melhor preco
ANUAL CARTAO: ate 12x (R$137) — Fyness recebe antecipado
ANUAL BOLETO: ate 3x (R$548) — so com aprovacao gestor
SEMESTRAL: R$997 cartao, boleto ou pix
MENSAL: R$197 cartao recorrente (sem parcelamento)

═══════════════════════════════════════════
DESCONTOS (com aprovacao gestor):
═══════════════════════════════════════════
5%: fecha na primeira reuniao
10% MAXIMO: indicado por cliente ativo
NUNCA dar desconto sem pedir algo em troca

═══════════════════════════════════════════
REGRAS DE OURO:
═══════════════════════════════════════════
1. NUNCA abrir preco antes da demo
2. SEMPRE ancorar no anual primeiro (R$137/mes)
3. Mostrar mensal como "opcao B" (R$197/mes)
4. Semestral = cartada pra cartao que nao passa
5. Parcelamento boleto = ultima cartada
6. Desconto absurdo = nao e cliente Fyness
7. Trial = alternativa pra "preciso pensar"</bpmn2:text>
   </bpmn2:textAnnotation>

 </bpmn2:collaboration>

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- POOL 1: PROCESS SDR ROBO INBOUND (GREEN)                      -->
 <!-- y=60..410 | elements y: 80-390                                 -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmn2:process id="Process_Inbound" isExecutable="false">

   <bpmn2:startEvent id="Start_Inbound" name="Lead Inbound entra no CRM">
     <bpmn2:documentation>Lead chegou via Marketing (anuncio, SEO), Trial no site, ou Indicacao de cliente.
Fontes: Meta Ads, Google Ads, organico, indicacao, trial signup.
REGRA: Speed to Lead — responder em ate 5 MINUTOS.</bpmn2:documentation>
     <bpmn2:outgoing>Flow_In_01</bpmn2:outgoing>
   </bpmn2:startEvent>

   <bpmn2:task id="Task_In_WhatsQualificador" name="Robo envia WhatsApp qualificador">
     <bpmn2:documentation>SCRIPT DO ROBO (enviar em ate 5 minutos — PAIN FIRST):
"[Nome], me responde uma coisa: voce sabe EXATAMENTE quanto lucrou no ultimo mes? Nao por cima — o numero real, com todas as contas pagas.

Se a resposta for 'nao sei' ou 'mais ou menos', voce ta perdendo dinheiro todo mes sem perceber. E isso e mais comum do que voce imagina.

O Fyness resolve isso: voce manda o comprovante no WhatsApp, o assistente financeiro lanca tudo automatico. Fluxo de caixa, DRE, contas — tudo no seu celular. Alem disso voce recebe acesso a nossa plataforma de educacao financeira e entra na comunidade de empresarios que faturam de R$10k a R$500k/mes.

Me conta: como voce controla o financeiro hoje?"

LOGICA DE PITCH (baseado na resposta):
- Se TEM FUNCIONARIO fazendo financeiro → usar Pitch 1 "Manda o financeiro embora"
  "Voce ta pagando R$2-3k/mes pra alguem fazer o que o assistente do Fyness faz MELHOR pelo WhatsApp. Lancamentos, contas a pagar, fluxo de caixa, DRE — tudo automatico. O assistente nao erra, nao falta, nao pede aumento. Voce economiza o salario E tem controle melhor. Cada dia que voce paga esse funcionario e dinheiro jogado fora."
- Se FAZ SOZINHO → usar Pitch 2 "Para de perder horas com planilha"
  "Quantas horas por semana voce PERDE fazendo financeiro na mao? Cada hora que voce gasta em planilha e uma hora que voce NAO ta vendendo, NAO ta atendendo cliente, NAO ta crescendo. Com o Fyness voce manda foto do comprovante no WhatsApp e o assistente lanca tudo automatico. Acabou planilha. Acabou dor de cabeca. E alem do sistema, voce ganha educacao financeira de verdade e entra numa comunidade de empresarios."

REGRAS:
- Enviar em ATE 5 MINUTOS (Speed to Lead)
- Tom DIRETO e incisivo — bater na dor PRIMEIRO
- NAO mandar link, preco ou proposta
- Objetivo: fazer o lead SENTIR que ta perdendo dinheiro + coletar info para qualificacao ICP
- Se lead responder parcialmente, perguntar o que falta
- NAO perguntar segmento (ja veio da Landing Page)
- NAO perguntar numero de funcionarios (nao e criterio ICP)
- NAO explicar "somos um SaaS financeiro" — o lead ja sabe (veio do anuncio)</bpmn2:documentation>
     <bpmn2:incoming>Flow_In_01</bpmn2:incoming>
     <bpmn2:outgoing>Flow_In_02</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_In_Respondeu" name="Respondeu?">
     <bpmn2:incoming>Flow_In_02</bpmn2:incoming>
     <bpmn2:outgoing>Flow_In_03_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_In_04_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:task id="Task_In_CadenciaAuto" name="Cadencia automatica (D0, D2, D5)">
     <bpmn2:documentation>CADENCIA DE FOLLOW-UP AUTOMATICO (nao respondeu — cada mensagem bate em DOR DIFERENTE):

D0 (4h depois): "Voce sabia que 8 em cada 10 empresarios de [segmento] NAO sabem o lucro real do negocio? E por isso que a maioria fecha as portas em 5 anos. O Fyness existe pra mudar isso — voce manda o comprovante no WhatsApp e o assistente financeiro lanca tudo automatico. Lucro real, em tempo real, no seu celular."

D2: "[Nome], enquanto voce luta com planilha ou controla de cabeca, seu concorrente ta vendo o lucro dele em tempo real pelo WhatsApp. O assistente do Fyness faz todo o financeiro automatico — e alem disso voce recebe educacao financeira e entra numa comunidade de empresarios. Quer ver como funciona em 2 minutos? [link demo]"

D5: "[Nome], ultima mensagem. Cada dia sem controle financeiro e dinheiro saindo pelo ralo — e voce nem percebe. Quando quiser parar de perder dinheiro e ter o financeiro no automatico, e so responder aqui."

REGRA: Se respondeu em qualquer momento, SAI da cadencia e vai para qualificacao ICP.</bpmn2:documentation>
     <bpmn2:incoming>Flow_In_04_Nao</bpmn2:incoming>
     <bpmn2:outgoing>Flow_In_05</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_In_RespondeuCadencia" name="Respondeu na cadencia?">
     <bpmn2:incoming>Flow_In_05</bpmn2:incoming>
     <bpmn2:outgoing>Flow_In_06_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_In_07_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:endEvent id="End_Inbound_Nurturing_NaoResp" name="→ NURTURING (Nao Respondeu)">
     <bpmn2:incoming>Flow_In_07_Nao</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:exclusiveGateway id="Gw_In_ICP" name="Tem Perfil ICP?">
     <bpmn2:documentation>CHECKLIST ICP (marcar 3 de 4 para qualificar):
[ ] Segmento (ja veio da Landing Page — CRM tem)
[ ] Faturamento minimo R$10k/mes
[ ] Dor financeira identificada (latente ou ativa)
[ ] Decisor acessivel (dono, socio, gerente)

3 de 4 = TEM PERFIL → criar Smart Lead
Menos de 3 = SEM PERFIL → tag + comunidade gratuita</bpmn2:documentation>
     <bpmn2:incoming>Flow_In_03_Sim</bpmn2:incoming>
     <bpmn2:incoming>Flow_In_06_Sim</bpmn2:incoming>
     <bpmn2:outgoing>Flow_In_08_TemPerfil</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_In_09_SemPerfil</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:task id="Task_In_TagSemPerfil" name="Tag + Convite comunidade gratuita">
     <bpmn2:documentation>Lead nao tem perfil ICP mas demonstrou interesse.
ACOES:
1. Adicionar tag "sem_perfil_icp" no CRM
2. Enviar convite para comunidade gratuita de empresarios
3. Mensagem: "[Nome], nesse momento o Fyness e mais indicado pra empresas maiores. Mas independente disso, voce PRECISA saber seu lucro real — senao ta perdendo dinheiro todo mes. Entra na nossa comunidade GRATUITA de empresarios — tem conteudo sobre gestao financeira que vai te ajudar a parar de perder dinheiro. Quando seu negocio crescer, a gente conversa sobre o Fyness."
4. Mover para pool Nurturing</bpmn2:documentation>
     <bpmn2:incoming>Flow_In_09_SemPerfil</bpmn2:incoming>
     <bpmn2:outgoing>Flow_In_10</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:endEvent id="End_Inbound_Nurturing_SemPerfil" name="→ NURTURING (Sem Perfil)">
     <bpmn2:incoming>Flow_In_10</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:sendTask id="Task_In_DemoGravada" name="Enviar Demo Gravada por Segmento">
     <bpmn2:documentation>DEMO GRAVADA — GERAR DESEJO ANTES DO VENDEDOR (PAIN FIRST)

Lead qualificado! Antes de passar pro vendedor,
manda uma demo gravada personalizada por segmento.

SCRIPT DO ROBO (bater na dor antes de mandar o link):
"[Nome], gravei um video de 2 minutos mostrando o que acontece quando voce para de controlar financeiro na mao e deixa o assistente do Fyness fazer isso por voce. O resultado ASSUSTA — empresarios descobrem que perdiam milhares por mes sem saber. Da uma olhada: [link demo]

Se fizer sentido, nosso especialista te liga pra mostrar ao vivo como isso funcionaria pro SEU negocio."

REGRAS DA DEMO GRAVADA:
- CURTA: 2-3 minutos MAXIMO (ninguem assiste mais que isso)
- POR SEGMENTO: restaurante, loja, servicos, etc.
- COMECAR COM DOR: "Voce sabe quanto ta perdendo por mes sem controle financeiro?"
- WOW FACTOR: Mostrar o assistente processando um comprovante via WhatsApp em tempo real
- FOCO NA DOR + assistente + diferenciais:
  → "Olha: mandou foto do comprovante no WhatsApp, o assistente ja lancou automatico"
  → "O assistente te avisa quando tem conta vencendo e recomenda onde cortar custo"
  → "Aqui voce ve seu lucro real em 1 clique — tudo atualizado pelo assistente"
  → "Alem do sistema, voce recebe educacao financeira e entra na comunidade de empresarios"
  → NAO: "Esse e o modulo de DRE com filtro por periodo"
- TERMINA COM CTA: "Quanto dinheiro voce ta perdendo por mes sem isso?"
- HOSPEDADA: YouTube nao-listado ou pagina propria

DEMOS POR SEGMENTO (gravar 1 por segmento principal):
- Restaurante/Alimentacao
- Loja/Comercio
- Prestador de Servico
- Salao/Barbearia/Estetica
- Oficina/Auto
- Generico (pra segmentos sem demo especifica)

OBJETIVO: Lead ja chega na call com o vendedor
SENTINDO que ta perdendo dinheiro e QUERENDO resolver.
Vendedor nao perde tempo explicando o basico.</bpmn2:documentation>
     <bpmn2:incoming>Flow_In_08_TemPerfil</bpmn2:incoming>
     <bpmn2:outgoing>Flow_In_DemoToSmart</bpmn2:outgoing>
   </bpmn2:sendTask>

   <bpmn2:task id="Task_In_CriarSmartLead" name="Criar Smart Lead + Handoff para Vendedor">
     <bpmn2:documentation>Lead qualificado + ja viu a demo gravada! Criar Smart Lead e passar pro Vendedor.
SCRIPT DO ROBO (pain + anticipacao):
"[Nome], pelo que voce me contou, voce ta deixando dinheiro na mesa TODO mes sem perceber. Vou te passar pro [Nome Vendedor], ele e especialista em montar o financeiro de empresas de [segmento]. Ele vai te mostrar EXATAMENTE quanto voce ta perdendo e como resolver isso em 30 dias. Qual melhor horario pra te ligar?"

REGISTRAR NO CRM:
- Nome do decisor
- Melhor horario para contato
- Canal preferido (WhatsApp/telefone)
- Segmento do negocio
- Principal dor financeira relatada
- Nivel de urgencia (1-5)
- Fonte do lead (marketing, trial, indicacao)
- Se assistiu a demo gravada (sim/nao)
- Estimativa de quanto o lead ta perdendo por mes (pra vendedor usar)

HANDOFF: Notificar vendedor imediatamente via CRM + WhatsApp interno.</bpmn2:documentation>
     <bpmn2:incoming>Flow_In_DemoToSmart</bpmn2:incoming>
     <bpmn2:outgoing>Flow_In_11</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:endEvent id="End_Inbound_SmartLead" name="→ VENDEDOR (Smart Lead Inbound)">
     <bpmn2:incoming>Flow_In_11</bpmn2:incoming>
   </bpmn2:endEvent>

   <!-- SEQUENCE FLOWS -->
   <bpmn2:sequenceFlow id="Flow_In_01" sourceRef="Start_Inbound" targetRef="Task_In_WhatsQualificador" />
   <bpmn2:sequenceFlow id="Flow_In_02" sourceRef="Task_In_WhatsQualificador" targetRef="Gw_In_Respondeu" />
   <bpmn2:sequenceFlow id="Flow_In_03_Sim" name="Sim" sourceRef="Gw_In_Respondeu" targetRef="Gw_In_ICP" />
   <bpmn2:sequenceFlow id="Flow_In_04_Nao" name="Nao" sourceRef="Gw_In_Respondeu" targetRef="Task_In_CadenciaAuto" />
   <bpmn2:sequenceFlow id="Flow_In_05" sourceRef="Task_In_CadenciaAuto" targetRef="Gw_In_RespondeuCadencia" />
   <bpmn2:sequenceFlow id="Flow_In_06_Sim" name="Sim" sourceRef="Gw_In_RespondeuCadencia" targetRef="Gw_In_ICP" />
   <bpmn2:sequenceFlow id="Flow_In_07_Nao" name="Nao" sourceRef="Gw_In_RespondeuCadencia" targetRef="End_Inbound_Nurturing_NaoResp" />
   <bpmn2:sequenceFlow id="Flow_In_08_TemPerfil" name="Tem Perfil" sourceRef="Gw_In_ICP" targetRef="Task_In_DemoGravada" />
   <bpmn2:sequenceFlow id="Flow_In_09_SemPerfil" name="Sem Perfil" sourceRef="Gw_In_ICP" targetRef="Task_In_TagSemPerfil" />
   <bpmn2:sequenceFlow id="Flow_In_10" sourceRef="Task_In_TagSemPerfil" targetRef="End_Inbound_Nurturing_SemPerfil" />
   <bpmn2:sequenceFlow id="Flow_In_DemoToSmart" sourceRef="Task_In_DemoGravada" targetRef="Task_In_CriarSmartLead" />
   <bpmn2:sequenceFlow id="Flow_In_11" sourceRef="Task_In_CriarSmartLead" targetRef="End_Inbound_SmartLead" />

 </bpmn2:process>

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- POOL 2: PROCESS SDR ROBO OUTBOUND (ORANGE)                    -->
 <!-- y=480..830 | elements y: 500-810                               -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmn2:process id="Process_Outbound" isExecutable="false">

   <bpmn2:startEvent id="Start_Outbound" name="Lead Outbound entra na lista">
     <bpmn2:documentation>Lead capturado via prospeccao ativa.
FONTES DE DADOS:
- Google Meu Negocio: busca por segmento + cidade (ex: "restaurante Sao Paulo")
- CNAE: consulta por codigo de atividade economica
- LinkedIn: perfis de empresarios e decisores
- Apollo.io: enriquecimento de dados B2B

PROCESSO DE CAPTURA:
1. Buscar empresas por segmento+cidade no Google Meu Negocio
2. Coletar: nome empresa, telefone publico, endereco, avaliacao
3. Enriquecer com nome do dono (Instagram, LinkedIn, site da empresa)
4. Usar WhatsApp DA EMPRESA (numero publico do Google)
IMPORTANTE: WhatsApp da empresa, NAO pessoal do dono.</bpmn2:documentation>
     <bpmn2:outgoing>Flow_Out_01</bpmn2:outgoing>
   </bpmn2:startEvent>

   <bpmn2:task id="Task_Out_Enriquecer" name="Enriquecer Lead (nome, segmento, cidade, WhatsApp)">
     <bpmn2:documentation>ENRIQUECIMENTO DO LEAD OUTBOUND:
Automacao puxa dados do Google Meu Negocio e enriquece:
1. Nome do decisor (dono/socio) — buscar no Instagram, LinkedIn, site
2. Segmento exato da empresa
3. Cidade e regiao
4. WhatsApp da empresa (numero publico do Google)
5. Numero de avaliacoes Google (proxy de tamanho)
6. Instagram da empresa (se existir)

IMPORTANTE:
- Usar WhatsApp DA EMPRESA, NAO o pessoal
- Validar que numero e ativo (status online ou foto perfil)
- Se nao encontrar nome do dono, usar "Responsavel" como fallback
- Priorizar empresas com 4+ estrelas no Google (negocio saudavel)</bpmn2:documentation>
     <bpmn2:incoming>Flow_Out_01</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Out_02</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_Out_Cadencia7Dias" name="Cadencia Outbound Personalizada (7 dias)">
     <bpmn2:documentation>CADENCIA DE AQUECIMENTO OUTBOUND (7 dias — AGGRESSIVE PAIN):

D0 - PRIMEIRO CONTATO (direto na dor):
"Prazer [Nome]! Sou o [Vendedor] do Fyness. Vou ser direto: a maioria dos donos de [segmento] em [cidade] trabalha 12h por dia e no final do mes nao sabe se teve lucro. Se voce e um deles, eu consigo resolver isso em 30 dias. Se nao e, desculpa o incomodo! Me conta: voce sabe EXATAMENTE quanto lucrou no mes passado?"

D2 - CASE + DOR:
"[Nome], um dono de [segmento] em [cidade vizinha] descobriu que perdia R$3k/mes em custos que nem sabia que existiam. Em 30 dias com o Fyness, zerou esse vazamento. O segredo? O assistente financeiro no WhatsApp — manda foto do comprovante e ele lanca tudo automatico. Gravei um video de 2min mostrando como funciona: [link demo]"

D4 - COMUNIDADE COMO ISCA:
"[Nome], alem do sistema, a gente tem uma comunidade de empresarios do [segmento] que trocam experiencia sobre financeiro, precificacao, lucro real. E gratuita. Ja tem gente de [cidade] la. Se voce quer parar de controlar financeiro no escuro, entra: [link]. Sem compromisso nenhum."

D6 - ULTIMA TENTATIVA (urgencia):
"[Nome], ultima mensagem! Vou te ligar amanha — 2 minutinhos. Quero te mostrar quanto dinheiro voce ta deixando escapar todo mes sem perceber. Se nao fizer sentido, nunca mais te incomodo. Cada dia sem controle financeiro e dinheiro saindo pelo ralo."

REGRAS:
- WhatsApp da EMPRESA (numero publico do Google)
- Tom DIRETO — bater na dor imediatamente, sem enrolacao
- Se respondeu em QUALQUER momento, SAI da cadencia
- Personalizar com segmento e cidade do lead
- NAO explicar "somos um SaaS financeiro" — ir direto na dor
- Nunca mandar preco ou link de pagamento na cadencia</bpmn2:documentation>
     <bpmn2:incoming>Flow_Out_02</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Out_03</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_Out_Engajou" name="Lead Engajou?">
     <bpmn2:documentation>CRITERIOS DE ENGAJAMENTO:
- Respondeu qualquer mensagem da cadencia
- Entrou na comunidade gratuita
- Interagiu com conteudo enviado
- Clicou em link compartilhado
Qualquer um desses = ENGAJOU.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Out_03</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Out_04_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_Out_05_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:endEvent id="End_Outbound_Nurturing_NaoEng" name="→ NURTURING (Nao Engajou)">
     <bpmn2:incoming>Flow_Out_05_Nao</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:exclusiveGateway id="Gw_Out_ICP" name="Tem Perfil ICP?">
     <bpmn2:documentation>MESMA CHECKLIST ICP DO INBOUND (3 de 4):
[ ] Segmento (identificado na prospeccao)
[ ] Faturamento minimo R$10k/mes
[ ] Dor financeira identificada (latente ou ativa)
[ ] Decisor acessivel (dono, socio, gerente)
3 de 4 = TEM PERFIL → criar Smart Lead para Vendedor</bpmn2:documentation>
     <bpmn2:incoming>Flow_Out_04_Sim</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Out_06_TemPerfil</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_Out_07_SemPerfil</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:task id="Task_Out_TagComunidade" name="Tag + Convite comunidade gratuita">
     <bpmn2:documentation>Lead outbound engajou mas nao tem perfil ICP.
ACOES:
1. Tag "outbound_sem_perfil" no CRM
2. Convidar para comunidade gratuita
3. Mensagem: "Valeu pelo papo, [Nome]! O Fyness e mais indicado pra empresas um pouco maiores, mas voce PRECISA resolver o financeiro senao vai continuar perdendo dinheiro. Nossa comunidade de empresarios de [segmento] e GRATUITA — tem gente la que ja resolveu o financeiro e pode te ajudar. Entra: [link]. Quando crescer, a gente conversa."
4. Mover para Nurturing</bpmn2:documentation>
     <bpmn2:incoming>Flow_Out_07_SemPerfil</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Out_08</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:endEvent id="End_Outbound_Nurturing_SemPerfil" name="→ NURTURING (Sem Perfil)">
     <bpmn2:incoming>Flow_Out_08</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:task id="Task_Out_CriarSmartLead" name="Criar Smart Lead + Handoff para Vendedor">
     <bpmn2:documentation>Lead outbound qualificado! Criar Smart Lead e passar para Vendedor.
SCRIPT DO ROBO (pain + anticipacao):
"[Nome], pelo que voce me contou, voce ta perdendo dinheiro todo mes sem perceber — e a maioria dos donos de [segmento] ta na mesma situacao. Vou te passar pro [Nome Vendedor], ele e especialista em montar o financeiro de [segmento]. Ele vai te mostrar EXATAMENTE quanto voce ta deixando escapar e como zerar esse vazamento. Qual melhor horario pra te ligar?"

REGISTRAR NO CRM:
- Nome do decisor
- Melhor horario para contato
- Canal preferido (WhatsApp/telefone)
- Segmento do negocio
- Cidade
- Principal dor financeira relatada
- Nivel de urgencia (1-5)
- Fonte: outbound (Google Meu Negocio)
- Historico de interacoes na cadencia de aquecimento
- Estimativa de quanto o lead ta perdendo por mes

HANDOFF: Notificar vendedor imediatamente.</bpmn2:documentation>
     <bpmn2:incoming>Flow_Out_06_TemPerfil</bpmn2:incoming>
     <bpmn2:outgoing>Flow_Out_09</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:endEvent id="End_Outbound_SmartLead" name="→ VENDEDOR (Smart Lead Outbound)">
     <bpmn2:incoming>Flow_Out_09</bpmn2:incoming>
   </bpmn2:endEvent>

   <!-- SEQUENCE FLOWS -->
   <bpmn2:sequenceFlow id="Flow_Out_01" sourceRef="Start_Outbound" targetRef="Task_Out_Enriquecer" />
   <bpmn2:sequenceFlow id="Flow_Out_02" sourceRef="Task_Out_Enriquecer" targetRef="Task_Out_Cadencia7Dias" />
   <bpmn2:sequenceFlow id="Flow_Out_03" sourceRef="Task_Out_Cadencia7Dias" targetRef="Gw_Out_Engajou" />
   <bpmn2:sequenceFlow id="Flow_Out_04_Sim" name="Sim (engajou)" sourceRef="Gw_Out_Engajou" targetRef="Gw_Out_ICP" />
   <bpmn2:sequenceFlow id="Flow_Out_05_Nao" name="Nao (7 dias sem engajamento)" sourceRef="Gw_Out_Engajou" targetRef="End_Outbound_Nurturing_NaoEng" />
   <bpmn2:sequenceFlow id="Flow_Out_06_TemPerfil" name="Tem Perfil (3/4)" sourceRef="Gw_Out_ICP" targetRef="Task_Out_CriarSmartLead" />
   <bpmn2:sequenceFlow id="Flow_Out_07_SemPerfil" name="Sem Perfil" sourceRef="Gw_Out_ICP" targetRef="Task_Out_TagComunidade" />
   <bpmn2:sequenceFlow id="Flow_Out_08" sourceRef="Task_Out_TagComunidade" targetRef="End_Outbound_Nurturing_SemPerfil" />
   <bpmn2:sequenceFlow id="Flow_Out_09" sourceRef="Task_Out_CriarSmartLead" targetRef="End_Outbound_SmartLead" />

 </bpmn2:process>

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- POOL 3: PROCESS VENDEDOR (BLUE)                                -->
 <!-- y=900..1750 | elements y: 920-1730                             -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmn2:process id="Process_Vendedor" isExecutable="false">

   <bpmn2:startEvent id="Start_Vendedor" name="Recebe Smart Lead (Inbound ou Outbound)">
     <bpmn2:documentation>Vendedor recebe Smart Lead qualificado de qualquer um dos dois robos (Inbound ou Outbound).
O CRM notifica o vendedor com todos os dados coletados pelo robo.
ACAO IMEDIATA: Estudar o lead antes de fazer contato.</bpmn2:documentation>
     <bpmn2:outgoing>Flow_V_01</bpmn2:outgoing>
   </bpmn2:startEvent>

   <bpmn2:task id="Task_V_EstudarLead" name="Estudar Lead (2-5 min)">
     <bpmn2:documentation>PREPARACAO ANTES DO CONTATO (2-5 minutos):
1. Ler todas as notas do robo (respostas, segmento, dor PRINCIPAL)
2. Pesquisar Instagram/site da empresa
3. Ver avaliacoes no Google (entender volume/tamanho)
4. CALCULAR estimativa de perda financeira do lead (pra usar na call)
5. Preparar gancho de DOR personalizado por segmento

EXEMPLO DE GANCHO (sempre bater na DOR):
- Restaurante: "Vi que seu restaurante tem 4.8 estrelas no Google! Com esse volume de vendas, se voce nao sabe o lucro real, ta perdendo MUITO dinheiro sem perceber..."
- Loja: "Vi que voce tem uma loja de [produto] em [bairro]. Com o fluxo de varejo, se voce controla na mao, estatisticamente perde de 5-15% do faturamento..."
- Servicos: "Vi que voce presta servicos de [tipo]. Com clientes diferentes, prazos diferentes, se voce nao tem controle em tempo real, ta deixando dinheiro na mesa todo mes..."</bpmn2:documentation>
     <bpmn2:incoming>Flow_V_01</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_02</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_V_CadenciaVendedor" name="Cadencia WhatsApp Primeiro, Liga em Seguida (10 dias)">
     <bpmn2:documentation>CADENCIA DO VENDEDOR (9 touchpoints em 10 dias — CADA MENSAGEM BATE EM DOR DIFERENTE):

D0 - WhatsApp (dor + antecipacao):
"[Nome], aqui e o [Vendedor] do Fyness. O [Nome Robo] me passou que voce ta controlando financeiro [na mao/com funcionario/de cabeca]. Vou te ligar em 2 minutinhos — quero te mostrar quanto dinheiro voce ta perdendo por mes sem saber. Nao e papo de vendedor, e conta matematica."
→ Liga 2-3 minutos depois

D1 - Liga (horario diferente do D0)

D2 - WhatsApp 2 (estatistica + dor):
"[Nome], fiz uma conta rapida: se voce nao sabe seu lucro real, estatisticamente voce perde de 5-15% do faturamento todo mes. Num negocio de R$30k/mes, isso e R$1.500 a R$4.500 SUMINDO sem voce perceber. Posso te ligar 2 minutinhos pra te mostrar de onde vem esse vazamento?"
→ Liga apos 2h

D3 - Liga

D5 - WhatsApp 3 (case + urgencia):
"[Nome], o [Case] achava que tava tudo bem ate descobrir que perdia R$3k/mes em custos escondidos. Em 30 dias com o Fyness, zerou o vazamento. Ultimo contato — quando quiser resolver, me chama. Cada dia e mais dinheiro saindo."
→ Liga

D8 - Email break-off:
"[Nome], tentei te contatar porque sei que voce ta perdendo dinheiro todo mes sem perceber. Vou parar de insistir. Mas fica a reflexao: se voce nao sabe seu lucro real HOJE, como vai tomar decisoes amanha? Quando quiser resolver, e so responder. Abs, [Vendedor]"

TOTAL: 5 ligacoes + 3 WhatsApp + 1 email = 9 touchpoints
REGRA: Se conectou em qualquer ponto, SAI da cadencia e vai para AIDA.</bpmn2:documentation>
     <bpmn2:incoming>Flow_V_02</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_03</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_V_Conectou" name="Conectou com Decisor?">
     <bpmn2:incoming>Flow_V_03</bpmn2:incoming>
     <bpmn2:incoming>Flow_V_GK_Sim</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_04_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_V_05_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:task id="Task_V_Gatekeeper" name="Tecnicas Gatekeeper">
     <bpmn2:documentation>TECNICAS PARA PASSAR PELO GATEKEEPER (Ep. 4):

1. USAR O NOME: "Oi, o [Nome do Dono] esta? E o [Vendedor]."
   (Usar primeiro nome passa familiaridade)

2. SIMULAR PROXIMIDADE: "Ele pediu pra eu retornar..."
   "Estava conversando com ele por WhatsApp..."

3. PEDIR AJUDA: "Voce pode me ajudar? Preciso falar com o responsavel pelo financeiro..."

4. ELOGIAR: "Nossa, que atendimento bom! Voce e a [Nome]? O [Dono] tem sorte de ter voce na equipe."

5. HORARIO ESTRATEGICO: Ligar antes das 9h ou depois das 18h
   (dono costuma atender nessas horas)

6. WHATSAPP DIRETO: Se tem o WhatsApp da empresa,
   mandar mensagem direta pro dono

SE NAO PASSOU APOS 3 TENTATIVAS: Mover para Nurturing.</bpmn2:documentation>
     <bpmn2:incoming>Flow_V_05_Nao</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_GK_Check</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_V_PassouGK" name="Passou Gatekeeper?">
     <bpmn2:incoming>Flow_V_GK_Check</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_GK_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_V_GK_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:endEvent id="End_Vendedor_Nurturing" name="→ NURTURING (Nao Converteu)">
     <bpmn2:incoming>Flow_V_GK_Nao</bpmn2:incoming>
     <bpmn2:incoming>Flow_V_FollowUp_End</bpmn2:incoming>
     <bpmn2:incoming>Flow_V_Obj_SemPerfil</bpmn2:incoming>
     <bpmn2:incoming>Flow_V_Obj_NaoAgora</bpmn2:incoming>
     <bpmn2:incoming>Flow_V_TrialConverteu_Nao</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:task id="Task_V_AIDA" name="Ligacao Conexao AIDA (5-8 min)">
     <bpmn2:documentation>FRAMEWORK AIDA — LIGACAO DE CONEXAO AGRESSIVA (5-8 minutos):

A — ATENCAO (primeiros 15 segundos — PAIN FIRST):
"Oi [Nome]! Aqui e o [Vendedor] do Fyness. Vou ser direto contigo: voce sabe me dizer agora, de cabeca, quanto lucrou no mes passado? O numero REAL?"
(Lead vai dizer "mais ou menos" ou "nao sei exatamente")
"E EXATAMENTE ai que ta o problema. A maioria dos donos de [segmento] trabalha igual louco e no final do mes nao sabe se teve lucro ou prejuizo. E isso custa CARO."

I — INTERESSE (micro-compromisso):
"Posso te fazer uma pergunta em 2 minutinhos? Quero te mostrar uma coisa que vai mudar sua visao sobre o financeiro do seu negocio."
(Se sim = micro-compromisso, lead esta engajado)
(Se nao = "Sem problema! Mas [Nome], cada dia sem saber seu lucro real e dinheiro sumindo. Qual melhor horario pra te ligar?")

D — DESEJO (case + diferenciais):
"O [Case] tinha EXATAMENTE essa situacao. Controlava tudo em [planilha/cabeca/funcionario]. Quando colocou o Fyness, descobriu em 1 SEMANA que perdia R$3k/mes em custos que nem sabia que existiam. Hoje ele manda o comprovante no WhatsApp e o assistente financeiro faz tudo automatico — lancamento, DRE, fluxo de caixa. E alem do sistema, ele recebe educacao financeira e participa da comunidade de empresarios. Nao e so um sistema — e o pacote completo pra nunca mais ficar no escuro."

A — ACAO (urgencia + demo):
"Faz sentido eu te mostrar em 15 minutinhos como isso funcionaria pro SEU [segmento]? Te mostro ao vivo pelo WhatsApp. Voce vai ver EXATAMENTE quanto ta perdendo e como resolver."</bpmn2:documentation>
     <bpmn2:incoming>Flow_V_04_Sim</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_06</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_V_AceitouDemo" name="Aceitou Demo?">
     <bpmn2:incoming>Flow_V_06</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_07_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_V_08_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:task id="Task_V_FollowUpConteudo" name="Follow-up + Conteudo educativo">
     <bpmn2:documentation>Lead conectou mas nao aceitou demo agora.
ACOES:
1. Enviar conteudo que AMPLIFIQUE a dor
2. "[Nome], sem problema. Mas enquanto voce decide, vou te mandar um material que mostra quanto os donos de [segmento] PERDEM por mes sem controle financeiro. Os numeros assustam. Quando quiser resolver, me chama — cada dia sem controle e dinheiro sumindo."
3. Agendar follow-up no CRM para D3, D7, D14
4. Mover para Nurturing se nao engajar — com mensagens de DOR</bpmn2:documentation>
     <bpmn2:incoming>Flow_V_08_Nao</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_FollowUp_End</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_V_Etapa1_Retomada" name="ETAPA 1: Apresentacao + Retomada">
     <bpmn2:documentation>ETAPA 1 DA DEMO — RETOMADA COM DOR (2-3 min):

ABRIR RELEMBRANDO A DOR:
"[Nome]! Bom falar com voce de novo. Na nossa ultima conversa voce me contou que [resumir dor/situacao]. Me diz: piorou, melhorou ou continua igual?"
(Se piorou ou igual = PERFEITO — amplificar)
"Entao faz [X] dias que voce ta perdendo dinheiro sem saber. Vamos resolver isso HOJE."

DEFINIR EXPECTATIVAS COM URGENCIA:
"Nos proximos 15-20 minutos eu vou te mostrar EXATAMENTE quanto voce ta perdendo e como o Fyness resolve isso. No final, se fizer sentido — e vai fazer — a gente ve os proximos passos. Combinado?"

DICA: NAO comecar com papo furado. Ir direto na dor. O lead ja sabe que e um tool financeiro — o que ele precisa sentir e que ta PERDENDO DINHEIRO.</bpmn2:documentation>
     <bpmn2:incoming>Flow_V_07_Sim</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_09</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_V_Etapa2_SPIN" name="ETAPA 2: Descoberta SPIN">
     <bpmn2:documentation>ETAPA 2 DA DEMO — DESCOBERTA SPIN SELLING AGRESSIVA (5-8 min):

S — SITUACAO (entender pra poder DOER depois):
"Como voce controla o financeiro hoje?" / "Quem faz isso?"
"Quanto tempo por semana voce gasta com financeiro?"
"Quanto voce paga pro funcionario que cuida disso?" (se tem funcionario)

P — PROBLEMA (fazer DOER — perguntas que incomodam):
"Voce sabe seu lucro REAL do ultimo mes? Nao por cima — o numero EXATO?"
"Ja aconteceu de chegar no final do mes e nao ter dinheiro pra pagar as contas?"
"Quanto voce paga pro funcionario que faz isso? E ele erra?" (se tem funcionario)
"Quantas vezes voce ja pagou juros por esquecer uma conta?"
"Voce ja tomou uma decisao importante — contratar, investir — sem saber os numeros reais?"

I — IMPLICACAO (AMPLIFICAR a dor — fazer o lead SENTIR na carne):
"Se voce ta perdendo 5-15% do faturamento sem saber, em 1 ano isso da quanto? Faz a conta."
"Se voce paga R$2-3k/mes de funcionario, sao R$30k/ano SO com financeiro. E se um assistente no WhatsApp fizesse isso por R$137/mes?" (se tem funcionario)
"Se voce gasta 8 horas por semana no financeiro, sao 400 horas por ano. Quanto voce cobra por hora? Faz a conta — voce ta PAGANDO pra fazer financeiro."
"O que acontece se voce continuar mais 6 meses sem saber pra onde vai o dinheiro? Quanto mais voce perde?"
"Seu concorrente ja sabe o lucro dele em tempo real. Quanto tempo voce acha que leva pra ele te ultrapassar?"

N — NECESSIDADE (lead verbaliza a solucao — dor maxima):
"Se voce pudesse ver AGORA, no celular, quanto lucrou hoje, quanto tem a pagar essa semana, e receber um alerta quando um custo ta acima do normal — quanto isso valeria pra voce?"
"Se pudesse mandar foto do comprovante no WhatsApp e acabar com planilha PRA SEMPRE — faria sentido?"
"Se alem de resolver o financeiro, voce ainda tivesse acesso a educacao financeira e uma comunidade de empresarios do seu segmento — isso mudaria o jogo?"

DICA: ANOTAR TUDO — especialmente os numeros de perda. Vao ser usados na proposta pra justificar o preco. Quanto mais doloroso o SPIN, mais facil o fechamento.</bpmn2:documentation>
     <bpmn2:incoming>Flow_V_09</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_10</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_V_Etapa3_Demo" name="ETAPA 3: Demo Personalizada">
     <bpmn2:documentation>ETAPA 3 DA DEMO — DEMONSTRACAO QUE FAZ DOER (8-10 min):

ABRIR COM DOR ANTES DO WOW:
"Agora vou te mostrar o que muda quando voce para de fazer na mao. Tudo aquilo que voce me contou — [resumir dores do SPIN] — ACABOU."

MOMENTO WOW — ASSISTENTE PROCESSANDO COMPROVANTE VIA WHATSAPP:
"Olha: eu mando essa foto de comprovante no WhatsApp... pronto. O assistente ja lancou, categorizado, no seu fluxo de caixa. Voce nunca mais precisa abrir planilha. Nunca mais digita nada. Mandou a foto e acabou."

MOSTRAR USANDO EXEMPLOS DO SEGMENTO DO LEAD:

1. LANCAMENTOS VIA WHATSAPP (principal diferencial — matar a planilha):
"O assistente aceita foto, audio e texto. Voce manda: 'Paguei R$500 de aluguel' e ele lanca. Manda foto do boleto e ele cadastra a conta a pagar. Tudo pelo WhatsApp. Acabou a era da planilha."

2. DRE EM TEMPO REAL (mostrar o lucro que o lead NAO sabe):
"Esse e o DRE — seu lucro REAL. Nao o que voce ACHA que lucra, mas o numero EXATO. Lembra que voce me disse que nao sabe quanto lucrou no mes passado? Com o Fyness voce sabe em 1 clique. A pergunta e: voce quer continuar no escuro ou quer saber a verdade?"

3. RECOMENDACOES DO ASSISTENTE (dinheiro escondido):
"O assistente identificou que seus custos com [categoria] subiram 20% esse mes. Ele te avisa automatico e sugere onde cortar. Te avisa 3 dias antes de cada conta vencer — nunca mais paga juros. Quanto voce ja perdeu em juros por esquecimento?"

4. FLUXO DE CAIXA EM TEMPO REAL:
"Olha: voce ve EXATAMENTE quanto entrou, quanto saiu e quanto sobrou. Zero surpresa. Seu concorrente que usa o Fyness ja tem isso. E voce?"

5. EDUCACAO FINANCEIRA + COMUNIDADE (pacote completo):
"E alem do sistema, voce recebe acesso a plataforma de educacao financeira — cursos, aulas ao vivo, materiais sobre gestao, precificacao, fluxo de caixa. E entra na comunidade exclusiva de empresarios — networking, mentoria, troca de experiencia com gente do seu segmento. Nao e so um sistema, e o PACOTE COMPLETO pra voce nunca mais ficar no escuro com o financeiro."

CONECTAR COM AS DORES DO SPIN (fazer doer de novo):
"Lembra que voce me falou que [dor]? Olha como ACABOU esse problema."
Se tem funcionario: "Tudo isso que seu funcionario faz por R$2-3k/mes, o assistente faz pelo WhatsApp. E nao erra, nao falta, nao pede aumento, nao pede ferias. Quanto voce economiza por ano?"
Se faz sozinho: "Todas aquelas [X] horas por semana que voce perde em planilha? ACABOU. Manda foto no WhatsApp e pronto. O que voce faria com [X] horas extras por semana?"

DICA: O MOMENTO WOW e o assistente processando o comprovante. Comecar por ai. Depois RECONECTAR com cada dor do SPIN. Quanto mais doer, mais facil fechar.</bpmn2:documentation>
     <bpmn2:incoming>Flow_V_10</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_11</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_V_Etapa4_Proposta" name="ETAPA 4: Proposta e Negociacao">
     <bpmn2:documentation>ETAPA 4 DA DEMO — PROPOSTA COM URGENCIA (3-5 min):

TRANSICAO — USAR A DOR DO SPIN:
"[Nome], com tudo que voce me mostrou — voce ta perdendo [estimativa do SPIN] por mes sem controle. Sao R$[valor anual] por ANO sumindo. Cada dia que passa e mais dinheiro saindo. O Fyness resolve isso HOJE."
(Esperar resposta — se SIM, apresentar preco)

ANCORAGEM NA PERDA (nao no preco — na ECONOMIA):
Se TEM FUNCIONARIO (Pitch 1):
"Voce paga R$2-3k/mes pra alguem fazer o que o assistente do Fyness faz MELHOR por R$137/mes. Sao R$2k de economia POR MES. Em 1 ano voce economiza mais de R$20.000. E o assistente nao erra, nao falta, nao pede ferias, nao pede aumento. Cada dia que voce continua pagando esse funcionario e dinheiro jogado fora."
Se FAZ SOZINHO (Pitch 2):
"Voce gasta [X] horas por semana fazendo financeiro na mao — e AINDA nao sabe seu lucro real. Com o Fyness voce manda foto no WhatsApp e pronto. R$137/mes no anual — R$4,50 por dia. Menos que um cafezinho. E voce para de PERDER dinheiro todo mes sem perceber."

ESCADA DE PRECO (sempre comecar pelo melhor):
1. ANUAL PIX: R$1.497 a vista (sem taxa = MELHOR preco!)
   → nao tem pix?
2. ANUAL CARTAO: 12x R$137/mes (= R$1.644)
   → cartao nao passou?
3. SEMESTRAL: R$997 (cartao ou boleto) = R$166/mes
   → nao tem R$997?
4. ANUAL BOLETO: 3x R$548 (so lead top qualificado, aprovacao gestor)
   → nao quer compromisso longo?
5. MENSAL: R$197/mes (cartao recorrente)
   → "preciso pensar"?
6. TRIAL: 7 dias GRATIS, sem cartao

TODOS incluem: Assistente financeiro no WhatsApp + SaaS financeiro completo + Plataforma de Educacao Financeira + Comunidade Exclusiva de Empresarios.
Educacao e Comunidade = DIFERENCIAL (nao bonus).

TRIAL COMO ARMA:
"Se quiser testar antes, temos 7 dias GRATIS sem pedir cartao. Manda foto de comprovante no WhatsApp e ve a magica acontecer. Mas [Nome], cada dia sem o Fyness e mais dinheiro saindo pelo ralo."

TECNICA DE FECHAMENTO (urgencia):
"Consigo o anual no PIX por R$1.497 — voce ta perdendo [valor do SPIN] por mes. Em 1 mes o Fyness ja se pagou e voce AINDA economiza. Faz sentido continuar perdendo dinheiro ou vamos resolver isso AGORA?"
(Se resistir, descer a escada de preco)</bpmn2:documentation>
     <bpmn2:incoming>Flow_V_11</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_12</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_V_Fechou" name="Fechou?">
     <bpmn2:incoming>Flow_V_12</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_13_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_V_14_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:task id="Task_V_Onboarding" name="Ativar Onboarding">
     <bpmn2:documentation>VENDA FECHADA! Ativar onboarding com URGENCIA — lead precisa ver valor IMEDIATO.
ACOES:
1. Criar conta no Fyness
2. Enviar credenciais por WhatsApp + email
3. Mensagem: "[Nome], PRONTO! Seu acesso ta liberado. Manda AGORA a primeira foto de comprovante no WhatsApp — voce vai ver o assistente lancando tudo automatico. A partir de hoje, ACABOU de perder dinheiro sem saber."
4. Agendar sessao de setup (30 min) para configurar:
   - Plano de contas personalizado para o segmento
   - Importar dados existentes (se houver)
   - Configurar contas a pagar/receber
5. Dar acesso a plataforma de educacao financeira
6. Adicionar na comunidade de empresarios
7. Agendar check-in D7 e D30
8. Comemorar no grupo de vendas!</bpmn2:documentation>
     <bpmn2:incoming>Flow_V_13_Sim</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_Venda</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:endEvent id="End_V_Venda" name="VENDA!">
     <bpmn2:incoming>Flow_V_Venda</bpmn2:incoming>
     <bpmn2:incoming>Flow_V_TrialConverteu_Sim</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:exclusiveGateway id="Gw_V_Motivo" name="Motivo da objecao?">
     <bpmn2:incoming>Flow_V_14_Nao</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_Obj_Pensar</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_V_Obj_Caro</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_V_Obj_NaoAgora_Flow</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_V_Obj_SemPerfil_Flow</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:task id="Task_V_Obj_Pensar" name="Follow-up CRM (D1, D3, D5)">
     <bpmn2:documentation>OBJECAO: "Preciso pensar"
ESTRATEGIA: Follow-up com DOR — lembrar o que o lead ta perdendo cada dia.

D1: WhatsApp com dor + resumo
"[Nome], enquanto voce pensa, seu financeiro continua desorganizado. Lembra que voce me disse que [dor do SPIN]? Cada dia sem resolver e mais dinheiro saindo. As 3 coisas que mais fazem sentido pro seu [segmento]: [lista]. Qual e a duvida que ta te travando?"

D3: Prova social + urgencia
"[Nome], o [Case do segmento] tava na MESMA situacao que voce. Ficou 'pensando' 2 semanas. Quando finalmente comecou, descobriu que ja tinha perdido R$3k nesses 14 dias. Comecou a usar e zerou o vazamento em 30 dias."

D5: Oferta Trial + ultimo push
"[Nome], ultima tentativa. 7 dias GRATIS, sem cartao, sem compromisso. Manda uma foto de comprovante no WhatsApp e ve o assistente funcionando. Se voce nao descobrir que ta perdendo dinheiro, eu te devo um cafe. Mas cada dia que voce 'pensa', e mais dinheiro sumindo."

DICA: "Preciso pensar" = o lead nao sentiu a dor o suficiente. Reforcar QUANTO ele ta perdendo por dia/mes/ano.</bpmn2:documentation>
     <bpmn2:incoming>Flow_V_Obj_Pensar</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_Pensar_Trial</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_V_Obj_Caro" name="Oferta Trial 7 dias + ROI">
     <bpmn2:documentation>OBJECAO: "Esta caro"
ESTRATEGIA: Reframe pela DOR — quanto o lead ta PERDENDO e maior que o preco.

REFRAME PRINCIPAL (pain first):
"Entendo. Mas me diz: quanto voce ta PERDENDO por mes sem saber o lucro real? Se for R$1.000, R$2.000... o Fyness de R$197/mes se paga no PRIMEIRO mes. Na verdade, voce ta PERDENDO DINHEIRO cada dia que NAO usa. Caro e continuar sem controle."

REFRAME 1 — Funcionario vs assistente (se tem funcionario):
"Voce paga R$2-3k/mes pra alguem fazer financeiro. O Fyness custa R$137/mes no anual. Voce ta JOGANDO FORA R$2k por mes. Todo mes. Isso nao e economia — e EMERGENCIA."

REFRAME 2 — Horas perdidas (se faz sozinho):
"Quanto vale sua hora? Se voce gasta 8 horas por semana em planilha, sao 32 horas por mes. A R$50/hora, voce ta GASTANDO R$1.600/mes pra fazer financeiro na mao. O Fyness custa R$137/mes. Voce ta PAGANDO 10x mais pra fazer PIOR."

REFRAME 3 — Custo diario:
"R$4,50 por dia no anual. MENOS que um cafezinho. E cada dia SEM o Fyness voce perde mais que isso em custos escondidos."

REFRAME 4 — PIX:
"Se fizer no PIX anual: R$1.497 a vista — R$137/mes. Comparado com o que voce PERDE todo mes, isso e troco."

TRIAL (ultima cartada):
"Mas sabe o que? Testa 7 dias GRATIS. Sem cartao, sem compromisso. Manda foto de comprovante no WhatsApp e ve o assistente funcionando. Se em 7 dias voce nao descobrir que tava perdendo dinheiro, cancela sem pagar nada. Mas eu GARANTO que voce vai descobrir."</bpmn2:documentation>
     <bpmn2:incoming>Flow_V_Obj_Caro</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_Caro_Trial</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_V_Obj_NaoAgora" name="Nurturing + Remarketing">
     <bpmn2:documentation>OBJECAO: "Nao e o momento"
ESTRATEGIA: Plantar a semente da dor + manter canal aberto.

"Entendo, [Nome]. Mas me diz uma coisa: quando VAI ser o momento? Porque enquanto voce espera o 'momento certo', voce ta perdendo [valor do SPIN] por mes. Em 30 dias sao [valor x 1]. Em 6 meses sao [valor x 6]. O momento certo era ontem.

Mas respeito. Vou fazer o seguinte:
1. Te adiciono na nossa comunidade de empresarios (gratuita — tem gente do seu segmento la)
2. Daqui 30 dias eu te mando uma mensagem so pra ver quanto voce perdeu nesse periodo
3. Quando a dor ficar insuportavel, e so me chamar."

ACOES NO CRM:
1. Tag "nao_agora" + data prevista de recontato
2. Adicionar em lista de remarketing (Meta/Google) — anuncios de DOR
3. Mover para Nurturing com reativacao em 30 dias</bpmn2:documentation>
     <bpmn2:incoming>Flow_V_Obj_NaoAgora_Flow</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_Obj_NaoAgora</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_V_Obj_SemPerfil" name="Descarte educado + Comunidade">
     <bpmn2:documentation>OBJECAO: "Nao tenho perfil" / Vendedor percebe que nao tem fit
ESTRATEGIA: Descarte educado + comunidade + plantar semente de dor.

"[Nome], vou ser honesto: o Fyness e mais indicado pra empresas com [criterios]. Mas independente disso, voce PRECISA resolver o financeiro — senao cada mes e mais dinheiro sumindo. Vou te ajudar:
1. Nossa comunidade de empresarios e GRATUITA — tem gente do seu segmento que ja resolveu o financeiro e compartilha como fez
2. Tem conteudo de educacao financeira toda semana
3. Quando seu negocio crescer, me chama — eu te mostro quanto voce ta perdendo."

ACOES:
1. Tag "sem_perfil_vendedor" no CRM
2. Convidar para comunidade
3. Mover para Nurturing (ciclo longo)</bpmn2:documentation>
     <bpmn2:incoming>Flow_V_Obj_SemPerfil_Flow</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_Obj_SemPerfil</bpmn2:outgoing>
   </bpmn2:task>

   <!-- SUB-PROCESS: TRIAL 7 DIAS -->
   <bpmn2:subProcess id="SubProcess_Trial" name="Trial 7 Dias">
     <bpmn2:documentation>SUB-PROCESSO: TRIAL 7 DIAS GRATIS — MANTER URGENCIA
Objetivo: converter trial em cliente pago. Lead precisa SENTIR o valor e ter MEDO de perder.

D0 - SETUP + PRIMEIRO IMPACTO:
- Criar conta trial no sistema
- Enviar credenciais WhatsApp + email
- Mensagem: "Bem-vindo ao Fyness, [Nome]! Seu acesso ta liberado. Manda AGORA a primeira foto de comprovante no WhatsApp e ve a magica acontecer. Voce vai se perguntar por que nao fez isso antes."
- Agendar sessao de setup express (15 min)

D3 - CHECK-IN AUTOMATICO (robo — pain reminder):
- CRM envia: "[Nome]! Ja faz 3 dias do seu trial. Ja mandou comprovante pelo WhatsApp? Ja viu seu fluxo de caixa atualizado automatico? A maioria dos empresarios descobre um VAZAMENTO de dinheiro nos primeiros 3 dias. O que voce descobriu?"
- Se responder com duvida, vendedor intervem

D5 - VENDEDOR LIGA (urgencia):
- Ligacao de check-in pessoal
- "Oi [Nome]! Ta usando o Fyness? Ja descobriu algo que nao sabia sobre seu financeiro? A maioria descobre um vazamento nos primeiros 5 dias."
- Se usou: "Voce ja [beneficio]. Imagina perder isso e voltar pra planilha?"
- Se NAO usou: "[Nome], voce tem 2 dias pra testar de graca. Cada dia que passa sem usar e mais um dia perdendo dinheiro sem saber. Manda uma foto de comprovante AGORA."
- Preparar para fechamento: "Seu trial acaba em 2 dias. Vamos garantir seu acesso?"

D7 - VENDEDOR FECHA (ultimato):
- Ligacao de fechamento
- "Oi [Nome]! Os 7 dias acabaram. Voce viu o que o assistente faz. A pergunta e: voce quer VOLTAR pra planilha ou quer manter o controle? Vou te fazer a melhor condicao: anual no PIX por R$1.497 — sem taxa nenhuma. Cada dia sem o Fyness agora e dinheiro sumindo."
- Descer escada de preco se necessario: PIX → Anual cartao 12x R$137 → Semestral R$997 → Mensal R$197
- Se nao converter: mover para Nurturing com mensagem de dor

METRICAS: Taxa de conversao trial→pago meta: >25%</bpmn2:documentation>

     <bpmn2:startEvent id="Start_Trial" name="Inicio Trial">
       <bpmn2:outgoing>Flow_Trial_01</bpmn2:outgoing>
     </bpmn2:startEvent>
     <bpmn2:task id="Task_Trial_Setup" name="D0: Setup conta trial">
       <bpmn2:incoming>Flow_Trial_01</bpmn2:incoming>
       <bpmn2:outgoing>Flow_Trial_02</bpmn2:outgoing>
     </bpmn2:task>
     <bpmn2:task id="Task_Trial_CheckIn" name="D3: Check-in auto + D5: Vendedor liga">
       <bpmn2:incoming>Flow_Trial_02</bpmn2:incoming>
       <bpmn2:outgoing>Flow_Trial_03</bpmn2:outgoing>
     </bpmn2:task>
     <bpmn2:task id="Task_Trial_Fecha" name="D7: Vendedor fecha">
       <bpmn2:incoming>Flow_Trial_03</bpmn2:incoming>
       <bpmn2:outgoing>Flow_Trial_04</bpmn2:outgoing>
     </bpmn2:task>
     <bpmn2:endEvent id="End_Trial" name="Fim Trial">
       <bpmn2:incoming>Flow_Trial_04</bpmn2:incoming>
     </bpmn2:endEvent>
     <bpmn2:sequenceFlow id="Flow_Trial_01" sourceRef="Start_Trial" targetRef="Task_Trial_Setup" />
     <bpmn2:sequenceFlow id="Flow_Trial_02" sourceRef="Task_Trial_Setup" targetRef="Task_Trial_CheckIn" />
     <bpmn2:sequenceFlow id="Flow_Trial_03" sourceRef="Task_Trial_CheckIn" targetRef="Task_Trial_Fecha" />
     <bpmn2:sequenceFlow id="Flow_Trial_04" sourceRef="Task_Trial_Fecha" targetRef="End_Trial" />
   </bpmn2:subProcess>

   <bpmn2:exclusiveGateway id="Gw_V_TrialConverteu" name="Converteu?">
     <bpmn2:incoming>Flow_V_Trial_Done</bpmn2:incoming>
     <bpmn2:outgoing>Flow_V_TrialConverteu_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_V_TrialConverteu_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <!-- SEQUENCE FLOWS -->
   <bpmn2:sequenceFlow id="Flow_V_01" sourceRef="Start_Vendedor" targetRef="Task_V_EstudarLead" />
   <bpmn2:sequenceFlow id="Flow_V_02" sourceRef="Task_V_EstudarLead" targetRef="Task_V_CadenciaVendedor" />
   <bpmn2:sequenceFlow id="Flow_V_03" sourceRef="Task_V_CadenciaVendedor" targetRef="Gw_V_Conectou" />
   <bpmn2:sequenceFlow id="Flow_V_04_Sim" name="Sim" sourceRef="Gw_V_Conectou" targetRef="Task_V_AIDA" />
   <bpmn2:sequenceFlow id="Flow_V_05_Nao" name="Nao (nao conectou)" sourceRef="Gw_V_Conectou" targetRef="Task_V_Gatekeeper" />
   <bpmn2:sequenceFlow id="Flow_V_GK_Check" sourceRef="Task_V_Gatekeeper" targetRef="Gw_V_PassouGK" />
   <bpmn2:sequenceFlow id="Flow_V_GK_Sim" name="Sim" sourceRef="Gw_V_PassouGK" targetRef="Gw_V_Conectou" />
   <bpmn2:sequenceFlow id="Flow_V_GK_Nao" name="Nao (3 tentativas)" sourceRef="Gw_V_PassouGK" targetRef="End_Vendedor_Nurturing" />
   <bpmn2:sequenceFlow id="Flow_V_06" sourceRef="Task_V_AIDA" targetRef="Gw_V_AceitouDemo" />
   <bpmn2:sequenceFlow id="Flow_V_07_Sim" name="Sim" sourceRef="Gw_V_AceitouDemo" targetRef="Task_V_Etapa1_Retomada" />
   <bpmn2:sequenceFlow id="Flow_V_08_Nao" name="Nao" sourceRef="Gw_V_AceitouDemo" targetRef="Task_V_FollowUpConteudo" />
   <bpmn2:sequenceFlow id="Flow_V_FollowUp_End" sourceRef="Task_V_FollowUpConteudo" targetRef="End_Vendedor_Nurturing" />
   <bpmn2:sequenceFlow id="Flow_V_09" sourceRef="Task_V_Etapa1_Retomada" targetRef="Task_V_Etapa2_SPIN" />
   <bpmn2:sequenceFlow id="Flow_V_10" sourceRef="Task_V_Etapa2_SPIN" targetRef="Task_V_Etapa3_Demo" />
   <bpmn2:sequenceFlow id="Flow_V_11" sourceRef="Task_V_Etapa3_Demo" targetRef="Task_V_Etapa4_Proposta" />
   <bpmn2:sequenceFlow id="Flow_V_12" sourceRef="Task_V_Etapa4_Proposta" targetRef="Gw_V_Fechou" />
   <bpmn2:sequenceFlow id="Flow_V_13_Sim" name="Sim!" sourceRef="Gw_V_Fechou" targetRef="Task_V_Onboarding" />
   <bpmn2:sequenceFlow id="Flow_V_14_Nao" name="Nao" sourceRef="Gw_V_Fechou" targetRef="Gw_V_Motivo" />
   <bpmn2:sequenceFlow id="Flow_V_Venda" sourceRef="Task_V_Onboarding" targetRef="End_V_Venda" />
   <bpmn2:sequenceFlow id="Flow_V_Obj_Pensar" name="Preciso pensar" sourceRef="Gw_V_Motivo" targetRef="Task_V_Obj_Pensar" />
   <bpmn2:sequenceFlow id="Flow_V_Obj_Caro" name="Esta caro" sourceRef="Gw_V_Motivo" targetRef="Task_V_Obj_Caro" />
   <bpmn2:sequenceFlow id="Flow_V_Obj_NaoAgora_Flow" name="Nao e o momento" sourceRef="Gw_V_Motivo" targetRef="Task_V_Obj_NaoAgora" />
   <bpmn2:sequenceFlow id="Flow_V_Obj_SemPerfil_Flow" name="Sem perfil" sourceRef="Gw_V_Motivo" targetRef="Task_V_Obj_SemPerfil" />
   <bpmn2:sequenceFlow id="Flow_V_Pensar_Trial" sourceRef="Task_V_Obj_Pensar" targetRef="SubProcess_Trial" />
   <bpmn2:sequenceFlow id="Flow_V_Caro_Trial" sourceRef="Task_V_Obj_Caro" targetRef="SubProcess_Trial" />
   <bpmn2:sequenceFlow id="Flow_V_Obj_NaoAgora" sourceRef="Task_V_Obj_NaoAgora" targetRef="End_Vendedor_Nurturing" />
   <bpmn2:sequenceFlow id="Flow_V_Obj_SemPerfil" sourceRef="Task_V_Obj_SemPerfil" targetRef="End_Vendedor_Nurturing" />
   <bpmn2:sequenceFlow id="Flow_V_Trial_Done" sourceRef="SubProcess_Trial" targetRef="Gw_V_TrialConverteu" />
   <bpmn2:sequenceFlow id="Flow_V_TrialConverteu_Sim" name="Sim" sourceRef="Gw_V_TrialConverteu" targetRef="End_V_Venda" />
   <bpmn2:sequenceFlow id="Flow_V_TrialConverteu_Nao" name="Nao" sourceRef="Gw_V_TrialConverteu" targetRef="End_Vendedor_Nurturing" />

 </bpmn2:process>

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- POOL 4: PROCESS NURTURING (PURPLE)                             -->
 <!-- y=1820..2140 | elements y: 1840-2120                           -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmn2:process id="Process_Nurturing" isExecutable="false">

   <bpmn2:startEvent id="Start_Nurturing" name="Recebe Leads Nao Convertidos (Inbound + Outbound + Vendedor)">
     <bpmn2:documentation>Recebe leads nao convertidos de QUALQUER pool:
- Inbound: sem perfil ICP ou nao respondeu cadencia
- Outbound: nao engajou ou sem perfil
- Vendedor: nao conectou, nao aceitou demo, objecoes nao resolvidas, trial nao convertido

REGRA: Todo lead que nao converteu vai para Nurturing. Nenhum lead e descartado sem passar por aqui.</bpmn2:documentation>
     <bpmn2:outgoing>Flow_N_01</bpmn2:outgoing>
   </bpmn2:startEvent>

   <bpmn2:task id="Task_N_Conteudo" name="Conteudo educativo financeiro automatico (semanal)">
     <bpmn2:documentation>CRM envia conteudo educativo automatico toda semana — CADA CONTEUDO BATE NA DOR:
SEMANA 1: "[Nome], voce sabia que 82% dos empresarios nao sabem o lucro real? Esse conteudo mostra os 5 sinais de que voce ta PERDENDO dinheiro sem perceber."
SEMANA 2: "[Nome], quanto voce ACHA que lucra por mes? E quanto voce lucra DE VERDADE? A diferenca assusta. Aprenda a calcular."
SEMANA 3: "[Nome], cada hora que voce gasta em planilha e uma hora que voce NAO ta vendendo. Veja quando e hora de parar de jogar dinheiro fora."
SEMANA 4: "[Nome], o [empresario] tava na mesma situacao que voce. Perdendo dinheiro todo mes sem saber. Em 30 dias resolveu. Veja como."

CANAIS: WhatsApp (principal) + Email (secundario)
FORMATO: Texto curto com DOR + link para conteudo completo
REGRA: Se lead interagir com conteudo, notificar vendedor IMEDIATAMENTE (lead ta sentindo a dor).</bpmn2:documentation>
     <bpmn2:incoming>Flow_N_01</bpmn2:incoming>
     <bpmn2:outgoing>Flow_N_02</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_N_Comunidade" name="Convite comunidade de empresarios">
     <bpmn2:documentation>Convidar para comunidade gratuita de empresarios Fyness.
BENEFICIOS DA COMUNIDADE:
- Networking com outros empresarios que JA resolveram o financeiro
- Conteudo exclusivo sobre gestao financeira
- Aulas ao vivo semanais
- Mentoria de empresarios mais experientes
- Acesso a materiais de educacao financeira

MENSAGEM (pain + comunidade):
"[Nome], enquanto voce pensa, seu financeiro continua desorganizado. Cada dia sem controle e dinheiro que some. Mas independente de tudo, nossa comunidade de empresarios e GRATUITA — tem [X] empresarios que ja resolveram o financeiro trocando experiencia. Entra la e ve como os outros estao fazendo: [link]. Quando quiser resolver de vez, o Fyness ta aqui."</bpmn2:documentation>
     <bpmn2:incoming>Flow_N_02</bpmn2:incoming>
     <bpmn2:outgoing>Flow_N_03</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_N_Remarketing" name="Remarketing (Meta/Google)">
     <bpmn2:documentation>REMARKETING AUTOMATIZADO — ANUNCIOS DE DOR:
1. Adicionar lead em audiencia personalizada do Meta Ads
2. Adicionar em lista de remarketing do Google Ads
3. Anuncios focados em DOR FINANCEIRA (fazer o lead sentir que ta perdendo dinheiro)
4. Exemplos de anuncios:
   - "Quanto dinheiro voce PERDEU esse mes sem perceber?" + link conteudo
   - "Seu concorrente ja sabe o lucro dele em tempo real. E voce?" + video
   - "Voce trabalha 12h por dia e no final do mes nao sabe se teve lucro?" + case
   - "R$4,50/dia pra nunca mais perder dinheiro sem saber" + demo
   - Depoimentos: "Descobri que perdia R$3k/mes sem saber"
5. Budget: R$2-5/dia por lead em remarketing</bpmn2:documentation>
     <bpmn2:incoming>Flow_N_03</bpmn2:incoming>
     <bpmn2:outgoing>Flow_N_04</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:task id="Task_N_Reativacao" name="Reativacao periodica (30-60 dias, max 3 ciclos)">
     <bpmn2:documentation>REATIVACAO PERIODICA — CADA CICLO BATE EM DOR DIFERENTE:
A cada 30-60 dias, robo entra em contato para reativar lead.

CICLO 1 (30 dias — dor acumulada):
"[Nome], faz 1 mes que a gente conversou. Se voce ainda nao sabe seu lucro real, ja perdeu mais 1 mes de dinheiro sem perceber. Estatisticamente, sao de R$1.500 a R$4.500 que sumiram. O Fyness resolve isso em 30 dias — assistente no WhatsApp + educacao financeira + comunidade de empresarios. Quando quiser parar de perder, e so responder."

CICLO 2 (60 dias — concorrente):
"[Nome], nos ultimos 2 meses, [X] empresarios do seu segmento em [cidade] comecaram a usar o Fyness. Eles ja sabem o lucro real em tempo real. E voce? Ainda controlando na mao? Cada dia e mais distancia entre voce e quem ja resolveu. Quer ver como funciona? [link demo]"

CICLO 3 (90 dias — ULTIMO — dor maxima):
"[Nome], ultima mensagem. Nos ultimos 3 meses voce perdeu entre R$4.500 e R$13.500 sem saber pra onde foi. Isso e o CUSTO de nao ter controle financeiro. Se em algum momento a dor ficar grande demais, e so responder aqui. O Fyness custa R$4,50/dia. Quanto voce perdeu hoje?"

MAXIMO: 3 ciclos. Apos 3 ciclos sem resposta → descarte elegante.</bpmn2:documentation>
     <bpmn2:incoming>Flow_N_04</bpmn2:incoming>
     <bpmn2:outgoing>Flow_N_05</bpmn2:outgoing>
   </bpmn2:task>

   <bpmn2:exclusiveGateway id="Gw_N_Reativou" name="Reativou?">
     <bpmn2:incoming>Flow_N_05</bpmn2:incoming>
     <bpmn2:outgoing>Flow_N_06_Sim</bpmn2:outgoing>
     <bpmn2:outgoing>Flow_N_07_Nao</bpmn2:outgoing>
   </bpmn2:exclusiveGateway>

   <bpmn2:endEvent id="End_Nurturing_Reativacao" name="→ SDR INBOUND (Reativacao)">
     <bpmn2:incoming>Flow_N_06_Sim</bpmn2:incoming>
   </bpmn2:endEvent>

   <bpmn2:endEvent id="End_Nurturing_Descarte" name="Descarte elegante (apos 3 ciclos)">
     <bpmn2:documentation>Lead passou por 3 ciclos de reativacao sem engajar.
DESCARTE ELEGANTE:
1. Remover de listas ativas de remarketing
2. Manter em base fria (pode ser reativado por campanha massiva futura)
3. Tag "descarte_elegante" + data
4. NAO enviar mais mensagens individuais</bpmn2:documentation>
     <bpmn2:incoming>Flow_N_07_Nao</bpmn2:incoming>
   </bpmn2:endEvent>

   <!-- SEQUENCE FLOWS -->
   <bpmn2:sequenceFlow id="Flow_N_01" sourceRef="Start_Nurturing" targetRef="Task_N_Conteudo" />
   <bpmn2:sequenceFlow id="Flow_N_02" sourceRef="Task_N_Conteudo" targetRef="Task_N_Comunidade" />
   <bpmn2:sequenceFlow id="Flow_N_03" sourceRef="Task_N_Comunidade" targetRef="Task_N_Remarketing" />
   <bpmn2:sequenceFlow id="Flow_N_04" sourceRef="Task_N_Remarketing" targetRef="Task_N_Reativacao" />
   <bpmn2:sequenceFlow id="Flow_N_05" sourceRef="Task_N_Reativacao" targetRef="Gw_N_Reativou" />
   <bpmn2:sequenceFlow id="Flow_N_06_Sim" name="Sim (reativou)" sourceRef="Gw_N_Reativou" targetRef="End_Nurturing_Reativacao" />
   <bpmn2:sequenceFlow id="Flow_N_07_Nao" name="Nao (3 ciclos sem resposta)" sourceRef="Gw_N_Reativou" targetRef="End_Nurturing_Descarte" />

 </bpmn2:process>

 <!-- ═══════════════════════════════════════════════════════════════ -->
 <!-- BPMN DIAGRAM: Layout Visual de Todos os Pools                  -->
 <!-- ═══════════════════════════════════════════════════════════════ -->
 <bpmndi:BPMNDiagram id="BPMNDiagram_InsideSales">
   <bpmndi:BPMNPlane id="BPMNPlane_InsideSales" bpmnElement="Collaboration_InsideSales">

     <!-- ══════════════════════════════════════════════════════════ -->
     <!-- POOL 1: SDR ROBO INBOUND (GREEN) x=160 y=60 w=2600 h=350 -->
     <!-- ══════════════════════════════════════════════════════════ -->
     <bpmndi:BPMNShape id="Shape_Pool_Inbound" bpmnElement="Pool_Inbound" isHorizontal="true"
       bioc:stroke="#66bb6a" bioc:fill="#f1f8e9">
       <dc:Bounds x="160" y="60" width="2600" height="350" />
     </bpmndi:BPMNShape>

     <!-- Start Inbound -->
     <bpmndi:BPMNShape id="Shape_Start_Inbound" bpmnElement="Start_Inbound"
       bioc:stroke="#66bb6a" bioc:fill="#f1f8e9">
       <dc:Bounds x="242" y="202" width="36" height="36" />
     </bpmndi:BPMNShape>

     <!-- Task: WhatsApp qualificador -->
     <bpmndi:BPMNShape id="Shape_Task_In_WhatsQualificador" bpmnElement="Task_In_WhatsQualificador"
       bioc:stroke="#66bb6a" bioc:fill="#f1f8e9">
       <dc:Bounds x="340" y="180" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Gateway: Respondeu? -->
     <bpmndi:BPMNShape id="Shape_Gw_In_Respondeu" bpmnElement="Gw_In_Respondeu" isMarkerVisible="true"
       bioc:stroke="#66bb6a" bioc:fill="#f1f8e9">
       <dc:Bounds x="585" y="195" width="50" height="50" />
     </bpmndi:BPMNShape>

     <!-- Task: Cadencia automatica -->
     <bpmndi:BPMNShape id="Shape_Task_In_CadenciaAuto" bpmnElement="Task_In_CadenciaAuto"
       bioc:stroke="#66bb6a" bioc:fill="#f1f8e9">
       <dc:Bounds x="560" y="300" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Gateway: Respondeu cadencia? -->
     <bpmndi:BPMNShape id="Shape_Gw_In_RespondeuCadencia" bpmnElement="Gw_In_RespondeuCadencia" isMarkerVisible="true"
       bioc:stroke="#66bb6a" bioc:fill="#f1f8e9">
       <dc:Bounds x="805" y="315" width="50" height="50" />
     </bpmndi:BPMNShape>

     <!-- End: Nurturing nao respondeu -->
     <bpmndi:BPMNShape id="Shape_End_Inbound_Nurturing_NaoResp" bpmnElement="End_Inbound_Nurturing_NaoResp"
       bioc:stroke="#66bb6a" bioc:fill="#f1f8e9">
       <dc:Bounds x="922" y="322" width="36" height="36" />
     </bpmndi:BPMNShape>

     <!-- Gateway: ICP -->
     <bpmndi:BPMNShape id="Shape_Gw_In_ICP" bpmnElement="Gw_In_ICP" isMarkerVisible="true"
       bioc:stroke="#66bb6a" bioc:fill="#f1f8e9">
       <dc:Bounds x="805" y="195" width="50" height="50" />
     </bpmndi:BPMNShape>

     <!-- Task: Tag sem perfil -->
     <bpmndi:BPMNShape id="Shape_Task_In_TagSemPerfil" bpmnElement="Task_In_TagSemPerfil"
       bioc:stroke="#66bb6a" bioc:fill="#f1f8e9">
       <dc:Bounds x="1010" y="300" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- End: Nurturing sem perfil -->
     <bpmndi:BPMNShape id="Shape_End_Inbound_Nurturing_SemPerfil" bpmnElement="End_Inbound_Nurturing_SemPerfil"
       bioc:stroke="#66bb6a" bioc:fill="#f1f8e9">
       <dc:Bounds x="1252" y="322" width="36" height="36" />
     </bpmndi:BPMNShape>

     <!-- Task: Demo Gravada -->
     <bpmndi:BPMNShape id="Shape_Task_In_DemoGravada" bpmnElement="Task_In_DemoGravada"
       bioc:stroke="#66bb6a" bioc:fill="#f1f8e9">
       <dc:Bounds x="1010" y="180" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Criar Smart Lead -->
     <bpmndi:BPMNShape id="Shape_Task_In_CriarSmartLead" bpmnElement="Task_In_CriarSmartLead"
       bioc:stroke="#66bb6a" bioc:fill="#f1f8e9">
       <dc:Bounds x="1250" y="180" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- End: Smart Lead -->
     <bpmndi:BPMNShape id="Shape_End_Inbound_SmartLead" bpmnElement="End_Inbound_SmartLead"
       bioc:stroke="#66bb6a" bioc:fill="#f1f8e9">
       <dc:Bounds x="1492" y="202" width="36" height="36" />
     </bpmndi:BPMNShape>

     <!-- EDGES Pool 1 -->
     <bpmndi:BPMNEdge id="Edge_Flow_In_01" bpmnElement="Flow_In_01">
       <di:waypoint x="278" y="220" />
       <di:waypoint x="340" y="220" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_02" bpmnElement="Flow_In_02">
       <di:waypoint x="520" y="220" />
       <di:waypoint x="585" y="220" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_03_Sim" bpmnElement="Flow_In_03_Sim">
       <di:waypoint x="635" y="220" />
       <di:waypoint x="805" y="220" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_04_Nao" bpmnElement="Flow_In_04_Nao">
       <di:waypoint x="610" y="245" />
       <di:waypoint x="610" y="340" />
       <di:waypoint x="560" y="340" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_05" bpmnElement="Flow_In_05">
       <di:waypoint x="740" y="340" />
       <di:waypoint x="805" y="340" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_06_Sim" bpmnElement="Flow_In_06_Sim">
       <di:waypoint x="830" y="315" />
       <di:waypoint x="830" y="245" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_07_Nao" bpmnElement="Flow_In_07_Nao">
       <di:waypoint x="855" y="340" />
       <di:waypoint x="922" y="340" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_08_TemPerfil" bpmnElement="Flow_In_08_TemPerfil">
       <di:waypoint x="855" y="220" />
       <di:waypoint x="1010" y="220" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_09_SemPerfil" bpmnElement="Flow_In_09_SemPerfil">
       <di:waypoint x="830" y="245" />
       <di:waypoint x="830" y="340" />
       <di:waypoint x="1010" y="340" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_10" bpmnElement="Flow_In_10">
       <di:waypoint x="1190" y="340" />
       <di:waypoint x="1252" y="340" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_DemoToSmart" bpmnElement="Flow_In_DemoToSmart">
       <di:waypoint x="1190" y="220" />
       <di:waypoint x="1250" y="220" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_In_11" bpmnElement="Flow_In_11">
       <di:waypoint x="1430" y="220" />
       <di:waypoint x="1492" y="220" />
     </bpmndi:BPMNEdge>

     <!-- ══════════════════════════════════════════════════════════ -->
     <!-- POOL 2: SDR ROBO OUTBOUND (ORANGE) x=160 y=480 w=2600 h=350 -->
     <!-- ══════════════════════════════════════════════════════════ -->
     <bpmndi:BPMNShape id="Shape_Pool_Outbound" bpmnElement="Pool_Outbound" isHorizontal="true"
       bioc:stroke="#ffa726" bioc:fill="#fff8e1">
       <dc:Bounds x="160" y="480" width="2600" height="350" />
     </bpmndi:BPMNShape>

     <!-- Start Outbound -->
     <bpmndi:BPMNShape id="Shape_Start_Outbound" bpmnElement="Start_Outbound"
       bioc:stroke="#ffa726" bioc:fill="#fff8e1">
       <dc:Bounds x="242" y="622" width="36" height="36" />
     </bpmndi:BPMNShape>

     <!-- Task: Enriquecer Lead -->
     <bpmndi:BPMNShape id="Shape_Task_Out_Enriquecer" bpmnElement="Task_Out_Enriquecer"
       bioc:stroke="#ffa726" bioc:fill="#fff8e1">
       <dc:Bounds x="340" y="600" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Cadencia 7 dias -->
     <bpmndi:BPMNShape id="Shape_Task_Out_Cadencia7Dias" bpmnElement="Task_Out_Cadencia7Dias"
       bioc:stroke="#ffa726" bioc:fill="#fff8e1">
       <dc:Bounds x="580" y="600" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Gateway: Engajou? -->
     <bpmndi:BPMNShape id="Shape_Gw_Out_Engajou" bpmnElement="Gw_Out_Engajou" isMarkerVisible="true"
       bioc:stroke="#ffa726" bioc:fill="#fff8e1">
       <dc:Bounds x="825" y="615" width="50" height="50" />
     </bpmndi:BPMNShape>

     <!-- End: Nurturing nao engajou -->
     <bpmndi:BPMNShape id="Shape_End_Outbound_Nurturing_NaoEng" bpmnElement="End_Outbound_Nurturing_NaoEng"
       bioc:stroke="#ffa726" bioc:fill="#fff8e1">
       <dc:Bounds x="832" y="732" width="36" height="36" />
     </bpmndi:BPMNShape>

     <!-- Gateway: ICP Outbound -->
     <bpmndi:BPMNShape id="Shape_Gw_Out_ICP" bpmnElement="Gw_Out_ICP" isMarkerVisible="true"
       bioc:stroke="#ffa726" bioc:fill="#fff8e1">
       <dc:Bounds x="945" y="615" width="50" height="50" />
     </bpmndi:BPMNShape>

     <!-- Task: Tag + comunidade outbound -->
     <bpmndi:BPMNShape id="Shape_Task_Out_TagComunidade" bpmnElement="Task_Out_TagComunidade"
       bioc:stroke="#ffa726" bioc:fill="#fff8e1">
       <dc:Bounds x="1050" y="710" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- End: Nurturing sem perfil outbound -->
     <bpmndi:BPMNShape id="Shape_End_Outbound_Nurturing_SemPerfil" bpmnElement="End_Outbound_Nurturing_SemPerfil"
       bioc:stroke="#ffa726" bioc:fill="#fff8e1">
       <dc:Bounds x="1292" y="732" width="36" height="36" />
     </bpmndi:BPMNShape>

     <!-- Task: Criar Smart Lead Outbound -->
     <bpmndi:BPMNShape id="Shape_Task_Out_CriarSmartLead" bpmnElement="Task_Out_CriarSmartLead"
       bioc:stroke="#ffa726" bioc:fill="#fff8e1">
       <dc:Bounds x="1050" y="600" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- End: Smart Lead Outbound -->
     <bpmndi:BPMNShape id="Shape_End_Outbound_SmartLead" bpmnElement="End_Outbound_SmartLead"
       bioc:stroke="#ffa726" bioc:fill="#fff8e1">
       <dc:Bounds x="1292" y="622" width="36" height="36" />
     </bpmndi:BPMNShape>

     <!-- EDGES Pool 2 -->
     <bpmndi:BPMNEdge id="Edge_Flow_Out_01" bpmnElement="Flow_Out_01">
       <di:waypoint x="278" y="640" />
       <di:waypoint x="340" y="640" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Out_02" bpmnElement="Flow_Out_02">
       <di:waypoint x="520" y="640" />
       <di:waypoint x="580" y="640" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Out_03" bpmnElement="Flow_Out_03">
       <di:waypoint x="760" y="640" />
       <di:waypoint x="825" y="640" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Out_04_Sim" bpmnElement="Flow_Out_04_Sim">
       <di:waypoint x="875" y="640" />
       <di:waypoint x="945" y="640" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Out_05_Nao" bpmnElement="Flow_Out_05_Nao">
       <di:waypoint x="850" y="665" />
       <di:waypoint x="850" y="732" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Out_06_TemPerfil" bpmnElement="Flow_Out_06_TemPerfil">
       <di:waypoint x="995" y="640" />
       <di:waypoint x="1050" y="640" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Out_07_SemPerfil" bpmnElement="Flow_Out_07_SemPerfil">
       <di:waypoint x="970" y="665" />
       <di:waypoint x="970" y="750" />
       <di:waypoint x="1050" y="750" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Out_08" bpmnElement="Flow_Out_08">
       <di:waypoint x="1230" y="750" />
       <di:waypoint x="1292" y="750" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Out_09" bpmnElement="Flow_Out_09">
       <di:waypoint x="1230" y="640" />
       <di:waypoint x="1292" y="640" />
     </bpmndi:BPMNEdge>

     <!-- ══════════════════════════════════════════════════════════ -->
     <!-- POOL 3: VENDEDOR (BLUE) x=160 y=900 w=4200 h=850         -->
     <!-- ══════════════════════════════════════════════════════════ -->
     <bpmndi:BPMNShape id="Shape_Pool_Vendedor" bpmnElement="Pool_Vendedor" isHorizontal="true"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="160" y="900" width="4200" height="850" />
     </bpmndi:BPMNShape>

     <!-- Start Vendedor -->
     <bpmndi:BPMNShape id="Shape_Start_Vendedor" bpmnElement="Start_Vendedor"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="242" y="1082" width="36" height="36" />
     </bpmndi:BPMNShape>

     <!-- Task: Estudar Lead -->
     <bpmndi:BPMNShape id="Shape_Task_V_EstudarLead" bpmnElement="Task_V_EstudarLead"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="340" y="1060" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Cadencia Vendedor -->
     <bpmndi:BPMNShape id="Shape_Task_V_CadenciaVendedor" bpmnElement="Task_V_CadenciaVendedor"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="580" y="1060" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Gateway: Conectou? -->
     <bpmndi:BPMNShape id="Shape_Gw_V_Conectou" bpmnElement="Gw_V_Conectou" isMarkerVisible="true"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="825" y="1075" width="50" height="50" />
     </bpmndi:BPMNShape>

     <!-- Task: Gatekeeper -->
     <bpmndi:BPMNShape id="Shape_Task_V_Gatekeeper" bpmnElement="Task_V_Gatekeeper"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="800" y="1210" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Gateway: Passou GK? -->
     <bpmndi:BPMNShape id="Shape_Gw_V_PassouGK" bpmnElement="Gw_V_PassouGK" isMarkerVisible="true"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="1045" y="1225" width="50" height="50" />
     </bpmndi:BPMNShape>

     <!-- Task: AIDA -->
     <bpmndi:BPMNShape id="Shape_Task_V_AIDA" bpmnElement="Task_V_AIDA"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="940" y="1060" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Gateway: Aceitou Demo? -->
     <bpmndi:BPMNShape id="Shape_Gw_V_AceitouDemo" bpmnElement="Gw_V_AceitouDemo" isMarkerVisible="true"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="1185" y="1075" width="50" height="50" />
     </bpmndi:BPMNShape>

     <!-- Task: Follow-up conteudo -->
     <bpmndi:BPMNShape id="Shape_Task_V_FollowUpConteudo" bpmnElement="Task_V_FollowUpConteudo"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="1160" y="1210" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Etapa 1 Retomada -->
     <bpmndi:BPMNShape id="Shape_Task_V_Etapa1_Retomada" bpmnElement="Task_V_Etapa1_Retomada"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="1300" y="1060" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Etapa 2 SPIN -->
     <bpmndi:BPMNShape id="Shape_Task_V_Etapa2_SPIN" bpmnElement="Task_V_Etapa2_SPIN"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="1540" y="1060" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Etapa 3 Demo -->
     <bpmndi:BPMNShape id="Shape_Task_V_Etapa3_Demo" bpmnElement="Task_V_Etapa3_Demo"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="1780" y="1060" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Etapa 4 Proposta -->
     <bpmndi:BPMNShape id="Shape_Task_V_Etapa4_Proposta" bpmnElement="Task_V_Etapa4_Proposta"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="2020" y="1060" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Gateway: Fechou? -->
     <bpmndi:BPMNShape id="Shape_Gw_V_Fechou" bpmnElement="Gw_V_Fechou" isMarkerVisible="true"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="2265" y="1075" width="50" height="50" />
     </bpmndi:BPMNShape>

     <!-- Task: Onboarding -->
     <bpmndi:BPMNShape id="Shape_Task_V_Onboarding" bpmnElement="Task_V_Onboarding"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="2380" y="960" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- End: VENDA! -->
     <bpmndi:BPMNShape id="Shape_End_V_Venda" bpmnElement="End_V_Venda"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="2622" y="982" width="36" height="36" />
     </bpmndi:BPMNShape>

     <!-- Gateway: Motivo objecao -->
     <bpmndi:BPMNShape id="Shape_Gw_V_Motivo" bpmnElement="Gw_V_Motivo" isMarkerVisible="true"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="2380" y="1180" width="50" height="50" />
     </bpmndi:BPMNShape>

     <!-- Task: Objecao Pensar -->
     <bpmndi:BPMNShape id="Shape_Task_V_Obj_Pensar" bpmnElement="Task_V_Obj_Pensar"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="2520" y="1130" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Objecao Caro -->
     <bpmndi:BPMNShape id="Shape_Task_V_Obj_Caro" bpmnElement="Task_V_Obj_Caro"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="2520" y="1240" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Objecao Nao Agora -->
     <bpmndi:BPMNShape id="Shape_Task_V_Obj_NaoAgora" bpmnElement="Task_V_Obj_NaoAgora"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="2520" y="1350" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Objecao Sem Perfil -->
     <bpmndi:BPMNShape id="Shape_Task_V_Obj_SemPerfil" bpmnElement="Task_V_Obj_SemPerfil"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="2520" y="1460" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Sub-Process: Trial -->
     <bpmndi:BPMNShape id="Shape_SubProcess_Trial" bpmnElement="SubProcess_Trial" isExpanded="true"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="2780" y="1155" width="700" height="100" />
     </bpmndi:BPMNShape>

     <!-- Trial internal elements -->
     <bpmndi:BPMNShape id="Shape_Start_Trial" bpmnElement="Start_Trial"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="2800" y="1187" width="36" height="36" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Trial_Setup" bpmnElement="Task_Trial_Setup"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="2860" y="1175" width="140" height="60" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Trial_CheckIn" bpmnElement="Task_Trial_CheckIn"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="3020" y="1175" width="140" height="60" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_Task_Trial_Fecha" bpmnElement="Task_Trial_Fecha"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="3180" y="1175" width="140" height="60" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="Shape_End_Trial" bpmnElement="End_Trial"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="3340" y="1187" width="36" height="36" />
     </bpmndi:BPMNShape>

     <!-- Trial internal edges -->
     <bpmndi:BPMNEdge id="Edge_Flow_Trial_01" bpmnElement="Flow_Trial_01">
       <di:waypoint x="2836" y="1205" />
       <di:waypoint x="2860" y="1205" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Trial_02" bpmnElement="Flow_Trial_02">
       <di:waypoint x="3000" y="1205" />
       <di:waypoint x="3020" y="1205" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Trial_03" bpmnElement="Flow_Trial_03">
       <di:waypoint x="3160" y="1205" />
       <di:waypoint x="3180" y="1205" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_Trial_04" bpmnElement="Flow_Trial_04">
       <di:waypoint x="3320" y="1205" />
       <di:waypoint x="3340" y="1205" />
     </bpmndi:BPMNEdge>

     <!-- Gateway: Trial Converteu? -->
     <bpmndi:BPMNShape id="Shape_Gw_V_TrialConverteu" bpmnElement="Gw_V_TrialConverteu" isMarkerVisible="true"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="3555" y="1180" width="50" height="50" />
     </bpmndi:BPMNShape>

     <!-- End: Nurturing Vendedor -->
     <bpmndi:BPMNShape id="Shape_End_Vendedor_Nurturing" bpmnElement="End_Vendedor_Nurturing"
       bioc:stroke="#42a5f5" bioc:fill="#e8f4fd">
       <dc:Bounds x="3700" y="1350" width="36" height="36" />
     </bpmndi:BPMNShape>

     <!-- EDGES Pool 3 -->
     <bpmndi:BPMNEdge id="Edge_Flow_V_01" bpmnElement="Flow_V_01">
       <di:waypoint x="278" y="1100" />
       <di:waypoint x="340" y="1100" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_02" bpmnElement="Flow_V_02">
       <di:waypoint x="520" y="1100" />
       <di:waypoint x="580" y="1100" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_03" bpmnElement="Flow_V_03">
       <di:waypoint x="760" y="1100" />
       <di:waypoint x="825" y="1100" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_04_Sim" bpmnElement="Flow_V_04_Sim">
       <di:waypoint x="875" y="1100" />
       <di:waypoint x="940" y="1100" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_05_Nao" bpmnElement="Flow_V_05_Nao">
       <di:waypoint x="850" y="1125" />
       <di:waypoint x="850" y="1250" />
       <di:waypoint x="800" y="1250" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_GK_Check" bpmnElement="Flow_V_GK_Check">
       <di:waypoint x="980" y="1250" />
       <di:waypoint x="1045" y="1250" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_GK_Sim" bpmnElement="Flow_V_GK_Sim">
       <di:waypoint x="1070" y="1225" />
       <di:waypoint x="1070" y="1100" />
       <di:waypoint x="875" y="1100" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_GK_Nao" bpmnElement="Flow_V_GK_Nao">
       <di:waypoint x="1070" y="1275" />
       <di:waypoint x="1070" y="1368" />
       <di:waypoint x="3700" y="1368" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_06" bpmnElement="Flow_V_06">
       <di:waypoint x="1120" y="1100" />
       <di:waypoint x="1185" y="1100" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_07_Sim" bpmnElement="Flow_V_07_Sim">
       <di:waypoint x="1235" y="1100" />
       <di:waypoint x="1300" y="1100" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_08_Nao" bpmnElement="Flow_V_08_Nao">
       <di:waypoint x="1210" y="1125" />
       <di:waypoint x="1210" y="1250" />
       <di:waypoint x="1160" y="1250" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_FollowUp_End" bpmnElement="Flow_V_FollowUp_End">
       <di:waypoint x="1340" y="1250" />
       <di:waypoint x="1340" y="1368" />
       <di:waypoint x="3700" y="1368" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_09" bpmnElement="Flow_V_09">
       <di:waypoint x="1480" y="1100" />
       <di:waypoint x="1540" y="1100" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_10" bpmnElement="Flow_V_10">
       <di:waypoint x="1720" y="1100" />
       <di:waypoint x="1780" y="1100" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_11" bpmnElement="Flow_V_11">
       <di:waypoint x="1960" y="1100" />
       <di:waypoint x="2020" y="1100" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_12" bpmnElement="Flow_V_12">
       <di:waypoint x="2200" y="1100" />
       <di:waypoint x="2265" y="1100" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_13_Sim" bpmnElement="Flow_V_13_Sim">
       <di:waypoint x="2290" y="1075" />
       <di:waypoint x="2290" y="1000" />
       <di:waypoint x="2380" y="1000" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_14_Nao" bpmnElement="Flow_V_14_Nao">
       <di:waypoint x="2290" y="1125" />
       <di:waypoint x="2290" y="1205" />
       <di:waypoint x="2380" y="1205" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_Venda" bpmnElement="Flow_V_Venda">
       <di:waypoint x="2560" y="1000" />
       <di:waypoint x="2622" y="1000" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_Obj_Pensar" bpmnElement="Flow_V_Obj_Pensar">
       <di:waypoint x="2430" y="1195" />
       <di:waypoint x="2475" y="1170" />
       <di:waypoint x="2520" y="1170" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_Obj_Caro" bpmnElement="Flow_V_Obj_Caro">
       <di:waypoint x="2430" y="1210" />
       <di:waypoint x="2475" y="1280" />
       <di:waypoint x="2520" y="1280" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_Obj_NaoAgora_Flow" bpmnElement="Flow_V_Obj_NaoAgora_Flow">
       <di:waypoint x="2405" y="1230" />
       <di:waypoint x="2405" y="1390" />
       <di:waypoint x="2520" y="1390" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_Obj_SemPerfil_Flow" bpmnElement="Flow_V_Obj_SemPerfil_Flow">
       <di:waypoint x="2405" y="1230" />
       <di:waypoint x="2405" y="1500" />
       <di:waypoint x="2520" y="1500" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_Pensar_Trial" bpmnElement="Flow_V_Pensar_Trial">
       <di:waypoint x="2700" y="1170" />
       <di:waypoint x="2740" y="1170" />
       <di:waypoint x="2740" y="1205" />
       <di:waypoint x="2780" y="1205" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_Caro_Trial" bpmnElement="Flow_V_Caro_Trial">
       <di:waypoint x="2700" y="1280" />
       <di:waypoint x="2740" y="1280" />
       <di:waypoint x="2740" y="1205" />
       <di:waypoint x="2780" y="1205" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_Obj_NaoAgora" bpmnElement="Flow_V_Obj_NaoAgora">
       <di:waypoint x="2700" y="1390" />
       <di:waypoint x="3718" y="1390" />
       <di:waypoint x="3718" y="1386" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_Obj_SemPerfil" bpmnElement="Flow_V_Obj_SemPerfil">
       <di:waypoint x="2700" y="1500" />
       <di:waypoint x="3718" y="1500" />
       <di:waypoint x="3718" y="1386" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_Trial_Done" bpmnElement="Flow_V_Trial_Done">
       <di:waypoint x="3480" y="1205" />
       <di:waypoint x="3555" y="1205" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_TrialConverteu_Sim" bpmnElement="Flow_V_TrialConverteu_Sim">
       <di:waypoint x="3580" y="1180" />
       <di:waypoint x="3580" y="1000" />
       <di:waypoint x="2658" y="1000" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_V_TrialConverteu_Nao" bpmnElement="Flow_V_TrialConverteu_Nao">
       <di:waypoint x="3580" y="1230" />
       <di:waypoint x="3580" y="1368" />
       <di:waypoint x="3736" y="1368" />
     </bpmndi:BPMNEdge>

     <!-- ══════════════════════════════════════════════════════════ -->
     <!-- POOL 4: NURTURING (PURPLE) x=160 y=1820 w=2600 h=320     -->
     <!-- ══════════════════════════════════════════════════════════ -->
     <bpmndi:BPMNShape id="Shape_Pool_Nurturing" bpmnElement="Pool_Nurturing" isHorizontal="true"
       bioc:stroke="#ab47bc" bioc:fill="#fce4ec">
       <dc:Bounds x="160" y="1820" width="2600" height="320" />
     </bpmndi:BPMNShape>

     <!-- Start Nurturing -->
     <bpmndi:BPMNShape id="Shape_Start_Nurturing" bpmnElement="Start_Nurturing"
       bioc:stroke="#ab47bc" bioc:fill="#fce4ec">
       <dc:Bounds x="242" y="1952" width="36" height="36" />
     </bpmndi:BPMNShape>

     <!-- Task: Conteudo -->
     <bpmndi:BPMNShape id="Shape_Task_N_Conteudo" bpmnElement="Task_N_Conteudo"
       bioc:stroke="#ab47bc" bioc:fill="#fce4ec">
       <dc:Bounds x="340" y="1930" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Comunidade -->
     <bpmndi:BPMNShape id="Shape_Task_N_Comunidade" bpmnElement="Task_N_Comunidade"
       bioc:stroke="#ab47bc" bioc:fill="#fce4ec">
       <dc:Bounds x="580" y="1930" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Remarketing -->
     <bpmndi:BPMNShape id="Shape_Task_N_Remarketing" bpmnElement="Task_N_Remarketing"
       bioc:stroke="#ab47bc" bioc:fill="#fce4ec">
       <dc:Bounds x="820" y="1930" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Task: Reativacao -->
     <bpmndi:BPMNShape id="Shape_Task_N_Reativacao" bpmnElement="Task_N_Reativacao"
       bioc:stroke="#ab47bc" bioc:fill="#fce4ec">
       <dc:Bounds x="1060" y="1930" width="180" height="80" />
     </bpmndi:BPMNShape>

     <!-- Gateway: Reativou? -->
     <bpmndi:BPMNShape id="Shape_Gw_N_Reativou" bpmnElement="Gw_N_Reativou" isMarkerVisible="true"
       bioc:stroke="#ab47bc" bioc:fill="#fce4ec">
       <dc:Bounds x="1305" y="1945" width="50" height="50" />
     </bpmndi:BPMNShape>

     <!-- End: Reativacao -->
     <bpmndi:BPMNShape id="Shape_End_Nurturing_Reativacao" bpmnElement="End_Nurturing_Reativacao"
       bioc:stroke="#ab47bc" bioc:fill="#fce4ec">
       <dc:Bounds x="1422" y="1872" width="36" height="36" />
     </bpmndi:BPMNShape>

     <!-- End: Descarte -->
     <bpmndi:BPMNShape id="Shape_End_Nurturing_Descarte" bpmnElement="End_Nurturing_Descarte"
       bioc:stroke="#ab47bc" bioc:fill="#fce4ec">
       <dc:Bounds x="1422" y="2052" width="36" height="36" />
     </bpmndi:BPMNShape>

     <!-- Fix Nurturing Start to be inside Pool 4 -->
     <!-- Overriding Start_Nurturing position to be within Pool 4 bounds -->

     <!-- EDGES Pool 4 -->
     <bpmndi:BPMNEdge id="Edge_Flow_N_01" bpmnElement="Flow_N_01">
       <di:waypoint x="278" y="1970" />
       <di:waypoint x="340" y="1970" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_N_02" bpmnElement="Flow_N_02">
       <di:waypoint x="520" y="1970" />
       <di:waypoint x="580" y="1970" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_N_03" bpmnElement="Flow_N_03">
       <di:waypoint x="760" y="1970" />
       <di:waypoint x="820" y="1970" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_N_04" bpmnElement="Flow_N_04">
       <di:waypoint x="1000" y="1970" />
       <di:waypoint x="1060" y="1970" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_N_05" bpmnElement="Flow_N_05">
       <di:waypoint x="1240" y="1970" />
       <di:waypoint x="1305" y="1970" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_N_06_Sim" bpmnElement="Flow_N_06_Sim">
       <di:waypoint x="1330" y="1945" />
       <di:waypoint x="1330" y="1890" />
       <di:waypoint x="1422" y="1890" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="Edge_Flow_N_07_Nao" bpmnElement="Flow_N_07_Nao">
       <di:waypoint x="1330" y="1995" />
       <di:waypoint x="1330" y="2070" />
       <di:waypoint x="1422" y="2070" />
     </bpmndi:BPMNEdge>

     <!-- ══════════════════════════════════════════════════════════ -->
     <!-- TEXT ANNOTATIONS (below Pool 4, y >= 2200)                 -->
     <!-- ══════════════════════════════════════════════════════════ -->

     <bpmndi:BPMNShape id="Shape_Annotation_Portais" bpmnElement="Annotation_Portais">
       <dc:Bounds x="2700" y="60" width="350" height="180" />
     </bpmndi:BPMNShape>

     <bpmndi:BPMNShape id="Shape_Annotation_ICP" bpmnElement="Annotation_ICP">
       <dc:Bounds x="160" y="2200" width="380" height="220" />
     </bpmndi:BPMNShape>


     <bpmndi:BPMNShape id="Shape_Annotation_SPIN" bpmnElement="Annotation_SPIN">
       <dc:Bounds x="1420" y="2200" width="380" height="300" />
     </bpmndi:BPMNShape>

     <bpmndi:BPMNShape id="Shape_Annotation_Precos" bpmnElement="Annotation_Precos">
       <dc:Bounds x="580" y="2200" width="500" height="580" />
     </bpmndi:BPMNShape>



   </bpmndi:BPMNPlane>
 </bpmndi:BPMNDiagram>

</bpmn2:definitions>`;

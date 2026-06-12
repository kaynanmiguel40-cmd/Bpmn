/**
 * Template BPMN 2.0 — Cadencia de Prospeccao Aquecida (8 toques + pre-aquecimento)
 *
 * Aplicacao: outbound aquecido — voce DESCOBRIU o lead (Instagram, Maps, LinkedIn),
 * identificou que e ICP, e quer abordar. Mas ele NAO te conhece nem pediu nada.
 *
 * Diferenca-chave: precisa AQUECER antes de abordar. Curte post, comenta, segue.
 * Tom cuidadoso pra nao virar spam (esse e o lead que mais reage a spam).
 */

export const CADENCIA_PROSPECCAO_AQUECIDA_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_CadAq" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collab_Aq">
    <bpmn:participant id="Pool_Aq" name="Cadencia de Prospeccao Aquecida - 3 dias pre-aquecimento + 8 toques em 11 dias" processRef="Process_Aq" />
  </bpmn:collaboration>
  <bpmn:process id="Process_Aq" isExecutable="false">
    <bpmn:laneSet id="Lanes_Aq">
      <bpmn:lane id="Lane_Vendas" name="Voce (Consultora)">
        <bpmn:flowNodeRef>P01_Identifica</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>P02_PreAquece</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T01_D0_DM</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T02_D1_Wpp</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T03_D3_Visual</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T04_D5_Lig1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T05_D7_Pergunta</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T06_D9_Lig2</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T07_D11_Final</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Respondeu</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Cliente" name="Cliente (descoberto por voce - perfil ICP)">
        <bpmn:flowNodeRef>Start_Identificou</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Oportunidade</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Standby</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="Start_Identificou" name="Voce achou um perfil ICP&#10;(Insta/Maps/etc)">
      <bpmn:documentation>QUANDO: Voce achou um dono de negocio que e ICP claro (padaria, salao, hortifruti, etc) - geralmente via Instagram, Google Maps, indicacao de terceiro casual.

REGRA
Lead NAO te conhece, NAO pediu nada. So abordar depois do PRE-AQUECIMENTO.</bpmn:documentation>
      <bpmn:outgoing>F00</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:userTask id="P01_Identifica" name="Identifica + valida perfil&#10;(Instagram, Maps, site)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: Antes de abordar

O QUE FAZER
Validar que e ICP de verdade. Olha:
- Tipo de negocio (padaria/salao/restaurante/oficina/loja - SIM | corporativo - NAO)
- Tamanho aparente (1+ funcionarios, fluxo de movimento - SIM | MEI sozinho - NAO)
- Atividade nas redes (posta, responde DM - SIM | conta morta - NAO)

DOCUMENTA NO CRM
- Nome do dono
- Nome do negocio
- Endereco (se Maps)
- @Instagram
- 2-3 detalhes pessoais que voce notou pra puxar depois

REGRA
Se nao for ICP claro, NAO abordar. Spam destrutivo nesse perfil.</bpmn:documentation>
      <bpmn:incoming>F00</bpmn:incoming>
      <bpmn:outgoing>F01</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="P02_PreAquece" name="D-3 a D-1 - Pre-aquecimento&#10;Curte, comenta, segue (sem abordar)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: 3 dias antes da abordagem oficial

O QUE FAZER (TODO DIA, por 3 dias seguidos)
- Curte 1 post recente do lead (genuinamente, nao todos)
- Comenta 1 vez algo simples ("Que pao bonito!", "Show essas unhas, dona!")
- Segue o perfil
- Salva 1 post nos favoritos

POR QUE
Quando voce mandar DM no D0, o lead JA viu seu nome 3-4 vezes no feed dele. Voce nao e mais "estranho random" - voce e "aquela que comentou no meu post".

REGRA
NAO comentar pitch nem nada de vendas. So engajamento humano normal. Tipo: voce e cliente curtindo o negocio dele.

INVESTIMENTO
5-10 min/dia por lead. Vale ouro - converte 5x mais que cold DM puro.</bpmn:documentation>
      <bpmn:incoming>F01</bpmn:incoming>
      <bpmn:outgoing>F02</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T01_D0_DM" name="D0 - DM Instagram&#10;Refere algo do perfil DELE">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D0, no canal nativo dele (Instagram DM)

O QUE FAZER
Abordagem QUENTE - referencia algo especifico do perfil dele que voce viu no pre-aquecimento.

EXEMPLO DE FALA (DM)
"Oi [nome]! Sou a [consultora] da Fyness. Comecei a seguir voces faz uns dias - adorei aquele post da semana passada do [coisa especifica que ele postou]. Olha, sou de uma empresa que ajuda dono de [tipo de negocio] a controlar caixa pelo WhatsApp. Achei que poderia te interessar - posso te mandar 1 imagem rapida pra voce ver do que se trata?"

DICA CRITICA
- Pede PERMISSAO antes de mandar pitch ("posso te mandar?")
- Cita 1 detalhe especifico do feed dele (prova que voce e gente, nao bot)
- Frase "achei que poderia te interessar" e mais delicada que "tenho uma solucao pra voce"</bpmn:documentation>
      <bpmn:incoming>F02</bpmn:incoming>
      <bpmn:outgoing>F03</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T02_D1_Wpp" name="D1 - WhatsApp&#10;Se conseguiu numero / se nao, DM de novo">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D1

O QUE FAZER (caso 1: respondeu DM mas nao quis material)
Manda 1 audio curto no WhatsApp se conseguiu o numero:
"Oi [nome]! Aqui e a [consultora] - falei contigo no Insta ontem. So queria me apresentar mais pessoalmente."

CASO 2 (nao respondeu DM ainda)
Manda mensagem visual no proprio Instagram - print de feature ou 1 imagem.

REGRA
SE VOCE NAO TEM O TELEFONE DELE, NAO BUSCA - usa Instagram so. Cair de paraquedas no WhatsApp sem permissao queima.</bpmn:documentation>
      <bpmn:incoming>F03</bpmn:incoming>
      <bpmn:outgoing>F04</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T03_D3_Visual" name="D3 - Visual com prova social&#10;Cliente do mesmo perfil dele">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D3

O QUE FAZER
Manda no canal que mais respondeu (DM ou WhatsApp) um print/video de cliente real DO MESMO PERFIL dele.

EXEMPLO DE FALA
"Oi [nome]! Olha esse resumo aqui (com permissao) - e de outro [tipo de negocio] aqui da regiao. Acho que voce vai entender o que a Fyness faz so olhando isso."

DICA
"Do mesmo perfil" e chave. Padaria pra padaria. Salao pra salao. Concretude do beneficio so bate quando o lead se reconhece.</bpmn:documentation>
      <bpmn:incoming>F04</bpmn:incoming>
      <bpmn:outgoing>F05</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T04_D5_Lig1" name="D5 - 11h&#10;Ligacao 1 (manha, se tiver numero)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D5

O QUE FAZER
PRIMEIRA ligacao. Mais cuidadosa que outros canais - lead nao te conhece tanto.

EXEMPLO DE FALA SE ATENDER
"Oi [nome]! Aqui e a [consultora] da Fyness. Falei com voce no Insta semana passada - voce viu aqueles posts que te mandei? Tem 3 minutinhos pra eu te explicar?"

SE NAO TEM TELEFONE DELE
Pula essa task - segue pra pergunta direta D7 (no Insta).</bpmn:documentation>
      <bpmn:incoming>F05</bpmn:incoming>
      <bpmn:outgoing>F06</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T05_D7_Pergunta" name="D7 - Pergunta direta&#10;Baixo atrito (no canal que mais respondeu)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D7

O QUE FAZER
Pergunta curta de baixo atrito - lead nao precisa se comprometer.

EXEMPLO DE FALA
"Oi [nome]! Deixa eu te perguntar 1 coisa direta: o que voce usa hoje pra controlar o caixa do seu [negocio]? Cadernao, planilha, alguma ferramenta? Pergunta de curiosa mesmo."

POR QUE FUNCIONA
Pergunta sem agenda comercial. Ele responde sem se comprometer. Conversa comecou.</bpmn:documentation>
      <bpmn:incoming>F06</bpmn:incoming>
      <bpmn:outgoing>F07</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T06_D9_Lig2" name="D9 - 18h&#10;Ligacao 2 (se tiver numero)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D9 por volta das 18h

O QUE FAZER
Segunda ligacao em horario oposto.

EXEMPLO DE FALA SE ATENDER
"Oi [nome]! Aqui e a [consultora] da Fyness. Boa noite. Pego voce ai? Faz uns dias que a gente vem se falando no Insta, queria te explicar a Fyness em 5 minutos so."</bpmn:documentation>
      <bpmn:incoming>F07</bpmn:incoming>
      <bpmn:outgoing>F08</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T07_D11_Final" name="D11 - 19h&#10;Ligacao 3 + DM/WhatsApp despedida">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D11

O QUE FAZER
Ultima ligacao + mensagem de despedida no canal que mais respondeu.

EXEMPLO DE FALA NA LIGACAO
"Oi [nome]! Aqui e a [consultora]. Ultima vez que te procuro - queria so saber: faz sentido conversarmos sobre a Fyness ou nao agora? Sem problema, qualquer resposta serve."

DM/WHATSAPP APOS
"Oi [nome]! Vou parar de te procurar pra nao incomodar. Continuo seguindo voces no Insta - manda 1 oi quando quiser conversar. Sucesso ai!"

DICA
"Continuo seguindo voces" mantem porta aberta sem invasao. Voce pode reabrir em 90d com pretexto natural.</bpmn:documentation>
      <bpmn:incoming>F08</bpmn:incoming>
      <bpmn:outgoing>F09</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:exclusiveGateway id="Gateway_Respondeu" name="Respondeu em algum toque?">
      <bpmn:documentation>SIM -- abre oportunidade
NAO -- stand-by 120 dias (lead frio precisa janela maior antes de tentar de novo, e voce precisa de gancho NOVO pra reabrir)</bpmn:documentation>
      <bpmn:incoming>F09</bpmn:incoming>
      <bpmn:outgoing>F10_Sim</bpmn:outgoing>
      <bpmn:outgoing>F10_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:endEvent id="End_Oportunidade" name="Oportunidade aberta&#10;Agenda demo 15min">
      <bpmn:documentation>RESULTADO BOM - pre-aquecimento + cadencia aquecida converteu.</bpmn:documentation>
      <bpmn:incoming>F10_Sim</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:endEvent id="End_Standby" name="Stand-by 120 dias&#10;Reabre so com gancho NOVO">
      <bpmn:documentation>NAO RESPONDEU

REGRA DE REABERTURA
Esse canal precisa de gancho NOVO pra justificar volta. Em 120d:
- Comentou em post novo dele
- Saiu nova feature
- Lancou case do mesmo perfil

NUNCA reabrir com "oi, ainda lembra de mim?". Vira spam.

OPCAO MELHOR
Mantem ele na lista de remarketing pago (Meta) - melhor que outbound de novo.</bpmn:documentation>
      <bpmn:incoming>F10_Nao</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="F00" sourceRef="Start_Identificou" targetRef="P01_Identifica" />
    <bpmn:sequenceFlow id="F01" sourceRef="P01_Identifica" targetRef="P02_PreAquece" />
    <bpmn:sequenceFlow id="F02" sourceRef="P02_PreAquece" targetRef="T01_D0_DM" />
    <bpmn:sequenceFlow id="F03" sourceRef="T01_D0_DM" targetRef="T02_D1_Wpp" />
    <bpmn:sequenceFlow id="F04" sourceRef="T02_D1_Wpp" targetRef="T03_D3_Visual" />
    <bpmn:sequenceFlow id="F05" sourceRef="T03_D3_Visual" targetRef="T04_D5_Lig1" />
    <bpmn:sequenceFlow id="F06" sourceRef="T04_D5_Lig1" targetRef="T05_D7_Pergunta" />
    <bpmn:sequenceFlow id="F07" sourceRef="T05_D7_Pergunta" targetRef="T06_D9_Lig2" />
    <bpmn:sequenceFlow id="F08" sourceRef="T06_D9_Lig2" targetRef="T07_D11_Final" />
    <bpmn:sequenceFlow id="F09" sourceRef="T07_D11_Final" targetRef="Gateway_Respondeu" />
    <bpmn:sequenceFlow id="F10_Sim" name="Sim" sourceRef="Gateway_Respondeu" targetRef="End_Oportunidade" />
    <bpmn:sequenceFlow id="F10_Nao" name="Nao" sourceRef="Gateway_Respondeu" targetRef="End_Standby" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="Diag_Aq">
    <bpmndi:BPMNPlane id="Plane_Aq" bpmnElement="Collab_Aq">
      <bpmndi:BPMNShape id="Pool_Aq_di" bpmnElement="Pool_Aq" isHorizontal="true">
        <dc:Bounds x="160" y="80" width="2800" height="440" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Vendas_di" bpmnElement="Lane_Vendas" isHorizontal="true">
        <dc:Bounds x="190" y="80" width="2770" height="260" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Cliente_di" bpmnElement="Lane_Cliente" isHorizontal="true">
        <dc:Bounds x="190" y="340" width="2770" height="180" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_Identificou_di" bpmnElement="Start_Identificou">
        <dc:Bounds x="240" y="412" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="200" y="455" width="116" height="40" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Oportunidade_di" bpmnElement="End_Oportunidade">
        <dc:Bounds x="2860" y="395" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="2815" y="438" width="126" height="40" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Standby_di" bpmnElement="End_Standby">
        <dc:Bounds x="2860" y="465" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="2815" y="505" width="146" height="40" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="P01_Identifica_di" bpmnElement="P01_Identifica"><dc:Bounds x="320" y="180" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="P02_PreAquece_di" bpmnElement="P02_PreAquece"><dc:Bounds x="540" y="180" width="200" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T01_D0_DM_di" bpmnElement="T01_D0_DM"><dc:Bounds x="780" y="180" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T02_D1_Wpp_di" bpmnElement="T02_D1_Wpp"><dc:Bounds x="1000" y="180" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T03_D3_Visual_di" bpmnElement="T03_D3_Visual"><dc:Bounds x="1220" y="180" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T04_D5_Lig1_di" bpmnElement="T04_D5_Lig1"><dc:Bounds x="1440" y="180" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T05_D7_Pergunta_di" bpmnElement="T05_D7_Pergunta"><dc:Bounds x="1660" y="180" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T06_D9_Lig2_di" bpmnElement="T06_D9_Lig2"><dc:Bounds x="1880" y="180" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T07_D11_Final_di" bpmnElement="T07_D11_Final"><dc:Bounds x="2100" y="180" width="220" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Respondeu_di" bpmnElement="Gateway_Respondeu" isMarkerVisible="true"><dc:Bounds x="2360" y="195" width="50" height="50" /><bpmndi:BPMNLabel><dc:Bounds x="2345" y="155" width="80" height="27" /></bpmndi:BPMNLabel></bpmndi:BPMNShape>

      <bpmndi:BPMNEdge id="F00_di" bpmnElement="F00"><di:waypoint x="258" y="412" /><di:waypoint x="258" y="220" /><di:waypoint x="320" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F01_di" bpmnElement="F01"><di:waypoint x="500" y="220" /><di:waypoint x="540" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F02_di" bpmnElement="F02"><di:waypoint x="740" y="220" /><di:waypoint x="780" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F03_di" bpmnElement="F03"><di:waypoint x="960" y="220" /><di:waypoint x="1000" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F04_di" bpmnElement="F04"><di:waypoint x="1180" y="220" /><di:waypoint x="1220" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F05_di" bpmnElement="F05"><di:waypoint x="1400" y="220" /><di:waypoint x="1440" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F06_di" bpmnElement="F06"><di:waypoint x="1620" y="220" /><di:waypoint x="1660" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F07_di" bpmnElement="F07"><di:waypoint x="1840" y="220" /><di:waypoint x="1880" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F08_di" bpmnElement="F08"><di:waypoint x="2060" y="220" /><di:waypoint x="2100" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F09_di" bpmnElement="F09"><di:waypoint x="2320" y="220" /><di:waypoint x="2360" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F10_Sim_di" bpmnElement="F10_Sim"><di:waypoint x="2385" y="245" /><di:waypoint x="2385" y="413" /><di:waypoint x="2860" y="413" /><bpmndi:BPMNLabel><dc:Bounds x="2390" y="320" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F10_Nao_di" bpmnElement="F10_Nao"><di:waypoint x="2410" y="220" /><di:waypoint x="2500" y="220" /><di:waypoint x="2500" y="483" /><di:waypoint x="2860" y="483" /><bpmndi:BPMNLabel><dc:Bounds x="2505" y="340" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

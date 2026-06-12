/**
 * Template BPMN 2.0 — Cadencia de Indicacao Direta (6 toques em 7 dias)
 *
 * Aplicacao: lead que foi indicado por OUTRO CLIENTE FYNESS (peer-to-peer).
 * Lead super-quente: outro dono de negocio do mesmo perfil falou bem da Fyness.
 * Pode ser mais rapido e direto que a cadencia de contador - tom casual.
 */

export const CADENCIA_INDICACAO_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_CadIndic" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collab_Indic">
    <bpmn:participant id="Pool_Indic" name="Cadencia de Indicacao Direta - 6 toques em 7 dias (peer-to-peer)" processRef="Process_Indic" />
  </bpmn:collaboration>
  <bpmn:process id="Process_Indic" isExecutable="false">
    <bpmn:laneSet id="Lanes_Indic">
      <bpmn:lane id="Lane_Vendas" name="Voce (Consultora ou Kaynan)">
        <bpmn:flowNodeRef>T01_D0_Wpp</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T02_D1_Lig1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T03_D2_Lig2</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T04_D4_WppVisual</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T05_D5_Lig3</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T06_D7_Final</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Respondeu</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Cliente" name="Cliente (indicado por outro dono de negocio Fyness)">
        <bpmn:flowNodeRef>Start_Indicacao</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Oportunidade</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Standby</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="Start_Indicacao" name="Indicado por outro cliente Fyness">
      <bpmn:documentation>QUANDO: Outro cliente da Fyness te passou o contato dessa pessoa

POR QUE E DIFERENTE
Lead peer-to-peer e o mais quente que existe - confianca de igual pra igual. Pode ser mais direto e mais rapido que outras cadencias.

A FALA-CHAVE DE TODA CADENCIA
Mencionar SEMPRE o nome de quem indicou. Esse nome e a sua credencial.</bpmn:documentation>
      <bpmn:outgoing>F01</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:userTask id="T01_D0_Wpp" name="D0 - WhatsApp audio&#10;Apresentacao mencionando quem indicou">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D0 (em ate 2h depois da indicacao)

O QUE FAZER
Audio curto no WhatsApp. O nome do indicador vai PRIMEIRO.

EXEMPLO DE FALA
"Oi [nome]! Aqui e a [consultora] da Fyness. O [Joao da padaria do Centro] te indicou pra mim - ele falou que voce e o [tipo de negocio] que cresceu bastante e ele acha que voce ia curtir nossa ferramenta. Posso te explicar rapidinho?"

DICA
Tom de "amiga do Joao". Casual.</bpmn:documentation>
      <bpmn:incoming>F01</bpmn:incoming>
      <bpmn:outgoing>F02</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T02_D1_Lig1" name="D1 - 9h-10h&#10;Ligacao 1 (manha)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D1 entre 9h e 10h

O QUE FAZER
Ligacao usando o nome do indicador como abridor.

EXEMPLO DE FALA SE ATENDER
"Oi [nome]! Aqui e a [consultora] da Fyness. O [Joao] me passou seu numero, ele falou que voce era 'pessoa boa de papo' (haha). Tem 5 minutos pra eu te explicar como a gente ajudou ele a fechar o caixa do mes?"

DICA
A referencia ao amigo abre porta. Use frase do indicador real ("ele falou que voce e...").</bpmn:documentation>
      <bpmn:incoming>F02</bpmn:incoming>
      <bpmn:outgoing>F03</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T03_D2_Lig2" name="D2 - 18h&#10;Ligacao 2 (tarde)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D2 por volta das 18h

O QUE FAZER
Segunda ligacao em horario diferente. Reforca a indicacao.

EXEMPLO DE FALA SE ATENDER
"Oi [nome]! Aqui e a [consultora] de novo. Pego voce ai? Te procurei essa manha tambem - o [Joao] me cobrou se eu ja tinha falado contigo (haha). Topa 5 minutos?"

DICA
Mencionar que "o Joao me cobrou" reforca a indicacao + cria leve pressao social positiva.</bpmn:documentation>
      <bpmn:incoming>F03</bpmn:incoming>
      <bpmn:outgoing>F04</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T04_D4_WppVisual" name="D4 - WhatsApp&#10;Visual + lembra do indicador">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D4

O QUE FAZER
Texto curto + 1 imagem visual da Fyness OU print do resumo de sexta do indicador (com permissao dele).

EXEMPLO DE FALA
"Oi [nome]! Te mando aqui o que o [Joao] recebe toda sexta da Fyness - o resumo do caixa dele em 1 imagem. Da uma olhada quando der tempo. Qualquer coisa me chama."

DICA POTENTE
Se o indicador autorizar voce mostrar o resumo dele anonimizado/parcial, e ouro. "Olha como o Joao ta crescendo" fala muito mais que pitch.</bpmn:documentation>
      <bpmn:incoming>F04</bpmn:incoming>
      <bpmn:outgoing>F05</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T05_D5_Lig3" name="D5 - 11h&#10;Ligacao 3 (meio manha)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D5 por volta das 11h

O QUE FAZER
Terceira ligacao, tom mais direto.

EXEMPLO DE FALA SE ATENDER
"Oi [nome]! Aqui e a [consultora]. Olha, ja te procurei umas vezes - quero te respeitar. So uma pergunta direta: voce quer que eu marque 15 minutinhos pra te mostrar a Fyness, ou nao e o momento?"

DICA
"Voce quer ou nao quer?" Pergunta de saida digna - lead nao precisa enrolar.</bpmn:documentation>
      <bpmn:incoming>F05</bpmn:incoming>
      <bpmn:outgoing>F06</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T06_D7_Final" name="D7 - 19h&#10;Ligacao 4 + WhatsApp despedida">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D7

O QUE FAZER
Ultima ligacao + WhatsApp de despedida.

EXEMPLO DE FALA NA LIGACAO
"Oi [nome]! Boa noite. Aqui e a [consultora] da Fyness - to ligando pela ultima vez. Sem problema se nao quiser, so queria te ouvir dizer 'nao' pra eu te respeitar e parar de te procurar."

WHATSAPP APOS LIGACAO
"Oi [nome], vou parar de te chamar pra nao te incomodar. Quando precisar, me chama aqui. Abraco pro [Joao] tambem!"

DICA
A mencao ao Joao no final cria pressao reciproca - lead pode responder so pra "nao deixar mal" o amigo.</bpmn:documentation>
      <bpmn:incoming>F06</bpmn:incoming>
      <bpmn:outgoing>F07</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:exclusiveGateway id="Gateway_Respondeu" name="Respondeu em algum toque?">
      <bpmn:documentation>SIM -- abre oportunidade, agenda demo 15min
NAO -- stand-by 60 dias (lead indicado merece 2a chance mais cedo que outros canais) + AVISA o indicador "nao consegui contato com o [nome]" - ele pode reforcar</bpmn:documentation>
      <bpmn:incoming>F07</bpmn:incoming>
      <bpmn:outgoing>F08_Sim</bpmn:outgoing>
      <bpmn:outgoing>F08_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:endEvent id="End_Oportunidade" name="Oportunidade aberta&#10;Agenda demo 15min + avisa o indicador">
      <bpmn:documentation>RESULTADO BOM

ACAO BONUS
Avisa o indicador: "O [nome] me respondeu, vamos conversar amanha. Obrigada pela indicacao!" - mantem ele ativo como canal.</bpmn:documentation>
      <bpmn:incoming>F08_Sim</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:endEvent id="End_Standby" name="Stand-by 60 dias&#10;+ pede reforco ao indicador">
      <bpmn:documentation>RESULTADO NEUTRO

ACAO ESPECIAL DESSE CANAL
Avisa o indicador (sem culpa): "Tentei falar com o [nome], nao consegui contato. Voce sabe se ele anda muito ocupado?" - as vezes o indicador ja chama o cara pessoalmente e reabre porta.

REATIVA em 60 dias (nao 90 como outros canais - lead indicado vale mais).</bpmn:documentation>
      <bpmn:incoming>F08_Nao</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="F01" sourceRef="Start_Indicacao" targetRef="T01_D0_Wpp" />
    <bpmn:sequenceFlow id="F02" sourceRef="T01_D0_Wpp" targetRef="T02_D1_Lig1" />
    <bpmn:sequenceFlow id="F03" sourceRef="T02_D1_Lig1" targetRef="T03_D2_Lig2" />
    <bpmn:sequenceFlow id="F04" sourceRef="T03_D2_Lig2" targetRef="T04_D4_WppVisual" />
    <bpmn:sequenceFlow id="F05" sourceRef="T04_D4_WppVisual" targetRef="T05_D5_Lig3" />
    <bpmn:sequenceFlow id="F06" sourceRef="T05_D5_Lig3" targetRef="T06_D7_Final" />
    <bpmn:sequenceFlow id="F07" sourceRef="T06_D7_Final" targetRef="Gateway_Respondeu" />
    <bpmn:sequenceFlow id="F08_Sim" name="Sim" sourceRef="Gateway_Respondeu" targetRef="End_Oportunidade" />
    <bpmn:sequenceFlow id="F08_Nao" name="Nao" sourceRef="Gateway_Respondeu" targetRef="End_Standby" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="Diag_Indic">
    <bpmndi:BPMNPlane id="Plane_Indic" bpmnElement="Collab_Indic">
      <bpmndi:BPMNShape id="Pool_Indic_di" bpmnElement="Pool_Indic" isHorizontal="true">
        <dc:Bounds x="160" y="80" width="1900" height="440" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Vendas_di" bpmnElement="Lane_Vendas" isHorizontal="true">
        <dc:Bounds x="190" y="80" width="1870" height="260" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Cliente_di" bpmnElement="Lane_Cliente" isHorizontal="true">
        <dc:Bounds x="190" y="340" width="1870" height="180" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_Indicacao_di" bpmnElement="Start_Indicacao">
        <dc:Bounds x="240" y="412" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="200" y="455" width="116" height="40" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Oportunidade_di" bpmnElement="End_Oportunidade">
        <dc:Bounds x="1960" y="395" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="1915" y="438" width="126" height="40" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Standby_di" bpmnElement="End_Standby">
        <dc:Bounds x="1960" y="465" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="1915" y="505" width="126" height="40" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="T01_D0_Wpp_di" bpmnElement="T01_D0_Wpp">
        <dc:Bounds x="320" y="180" width="180" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T02_D1_Lig1_di" bpmnElement="T02_D1_Lig1">
        <dc:Bounds x="540" y="180" width="180" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T03_D2_Lig2_di" bpmnElement="T03_D2_Lig2">
        <dc:Bounds x="760" y="180" width="180" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T04_D4_WppVisual_di" bpmnElement="T04_D4_WppVisual">
        <dc:Bounds x="980" y="180" width="180" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T05_D5_Lig3_di" bpmnElement="T05_D5_Lig3">
        <dc:Bounds x="1200" y="180" width="180" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T06_D7_Final_di" bpmnElement="T06_D7_Final">
        <dc:Bounds x="1420" y="180" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Respondeu_di" bpmnElement="Gateway_Respondeu" isMarkerVisible="true">
        <dc:Bounds x="1690" y="195" width="50" height="50" />
        <bpmndi:BPMNLabel><dc:Bounds x="1675" y="155" width="80" height="27" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNEdge id="F01_di" bpmnElement="F01"><di:waypoint x="258" y="412" /><di:waypoint x="258" y="220" /><di:waypoint x="320" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F02_di" bpmnElement="F02"><di:waypoint x="500" y="220" /><di:waypoint x="540" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F03_di" bpmnElement="F03"><di:waypoint x="720" y="220" /><di:waypoint x="760" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F04_di" bpmnElement="F04"><di:waypoint x="940" y="220" /><di:waypoint x="980" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F05_di" bpmnElement="F05"><di:waypoint x="1160" y="220" /><di:waypoint x="1200" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F06_di" bpmnElement="F06"><di:waypoint x="1380" y="220" /><di:waypoint x="1420" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F07_di" bpmnElement="F07"><di:waypoint x="1640" y="220" /><di:waypoint x="1690" y="220" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F08_Sim_di" bpmnElement="F08_Sim"><di:waypoint x="1715" y="245" /><di:waypoint x="1715" y="413" /><di:waypoint x="1960" y="413" /><bpmndi:BPMNLabel><dc:Bounds x="1720" y="320" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F08_Nao_di" bpmnElement="F08_Nao"><di:waypoint x="1740" y="220" /><di:waypoint x="1820" y="220" /><di:waypoint x="1820" y="483" /><di:waypoint x="1960" y="483" /><bpmndi:BPMNLabel><dc:Bounds x="1825" y="340" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

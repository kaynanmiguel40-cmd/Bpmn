/**
 * Template BPMN 2.0 - Fyness Sales Engine
 * Labels posicionadas corretamente fora dos elementos
 */

export const FYNESS_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_1">
    <bpmn:participant id="Pool_Fyness" name="Operacao Fyness - Sales Engine" processRef="Process_1" />
  </bpmn:collaboration>
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:laneSet id="LaneSet_1">
      <bpmn:lane id="Lane_Marketing" name="Marketing / Vitrine">
        <bpmn:flowNodeRef>Start_Ads</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Start_Organico</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_Vitrine</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Plano</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Vendas" name="Vendas / SDR">
        <bpmn:flowNodeRef>Start_Parceiro</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Timer_SpeedLead</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Qualificacao</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_Demo</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Nurture</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Sistema" name="Sistema / IA">
        <bpmn:flowNodeRef>Task_Processamento</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Pagamento</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_Retaguarda</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_Downsell</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Financeiro" name="Gateway Financeiro / Asaas">
        <bpmn:flowNodeRef>Task_Split</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_Antecipacao</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_Onboarding</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Parceiro" name="Parceiro / Contador">
        <bpmn:flowNodeRef>Task_Recebimento</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_ClienteAtivo</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>
    <bpmn:startEvent id="Start_Ads" name="Lead via Ads">
      <bpmn:outgoing>Flow_1</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:startEvent id="Start_Organico" name="Lead Organico">
      <bpmn:outgoing>Flow_2</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:startEvent id="Start_Parceiro" name="Lead via Parceiro">
      <bpmn:outgoing>Flow_3</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:intermediateCatchEvent id="Timer_SpeedLead" name="Speed to Lead">
      <bpmn:incoming>Flow_3</bpmn:incoming>
      <bpmn:outgoing>Flow_4</bpmn:outgoing>
      <bpmn:timerEventDefinition id="TimerDef_1" />
    </bpmn:intermediateCatchEvent>
    <bpmn:task id="Task_Vitrine" name="Vitrine Binaria (Mensal R$197 vs Anual R$1.497)">
      <bpmn:incoming>Flow_1</bpmn:incoming>
      <bpmn:incoming>Flow_2</bpmn:incoming>
      <bpmn:incoming>Flow_4</bpmn:incoming>
      <bpmn:outgoing>Flow_5</bpmn:outgoing>
    </bpmn:task>
    <bpmn:exclusiveGateway id="Gateway_Plano" name="Plano?">
      <bpmn:incoming>Flow_5</bpmn:incoming>
      <bpmn:outgoing>Flow_6</bpmn:outgoing>
      <bpmn:outgoing>Flow_7</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:exclusiveGateway id="Gateway_Qualificacao" name="Qualificado?">
      <bpmn:incoming>Flow_6</bpmn:incoming>
      <bpmn:incoming>Flow_7</bpmn:incoming>
      <bpmn:outgoing>Flow_8</bpmn:outgoing>
      <bpmn:outgoing>Flow_9</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:userTask id="Task_Demo" name="Demo Audio/Video">
      <bpmn:incoming>Flow_8</bpmn:incoming>
      <bpmn:outgoing>Flow_10</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:endEvent id="End_Nurture" name="Nurture">
      <bpmn:incoming>Flow_9</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:serviceTask id="Task_Processamento" name="Processamento IA">
      <bpmn:incoming>Flow_10</bpmn:incoming>
      <bpmn:outgoing>Flow_11</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:exclusiveGateway id="Gateway_Pagamento" name="Pagamento?">
      <bpmn:incoming>Flow_11</bpmn:incoming>
      <bpmn:incoming>Flow_14</bpmn:incoming>
      <bpmn:incoming>Flow_15</bpmn:incoming>
      <bpmn:outgoing>Flow_12</bpmn:outgoing>
      <bpmn:outgoing>Flow_13</bpmn:outgoing>
      <bpmn:outgoing>Flow_16</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:task id="Task_Retaguarda" name="Retaguarda Anti-Recusa (Semestral R$997)">
      <bpmn:incoming>Flow_13</bpmn:incoming>
      <bpmn:outgoing>Flow_14</bpmn:outgoing>
    </bpmn:task>
    <bpmn:userTask id="Task_Downsell" name="Downsell Trimestral R$561">
      <bpmn:incoming>Flow_16</bpmn:incoming>
      <bpmn:outgoing>Flow_15</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:serviceTask id="Task_Split" name="Split 30% Parceiro">
      <bpmn:incoming>Flow_12</bpmn:incoming>
      <bpmn:outgoing>Flow_17</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:serviceTask id="Task_Antecipacao" name="Antecipacao D+1">
      <bpmn:incoming>Flow_17</bpmn:incoming>
      <bpmn:outgoing>Flow_18</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:task id="Task_Onboarding" name="Ativacao 5 min">
      <bpmn:incoming>Flow_18</bpmn:incoming>
      <bpmn:outgoing>Flow_19</bpmn:outgoing>
    </bpmn:task>
    <bpmn:task id="Task_Recebimento" name="Recebimento Parceiro">
      <bpmn:incoming>Flow_19</bpmn:incoming>
      <bpmn:outgoing>Flow_20</bpmn:outgoing>
    </bpmn:task>
    <bpmn:endEvent id="End_ClienteAtivo" name="Cliente Ativo">
      <bpmn:incoming>Flow_20</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="Start_Ads" targetRef="Task_Vitrine" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Start_Organico" targetRef="Task_Vitrine" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Start_Parceiro" targetRef="Timer_SpeedLead" />
    <bpmn:sequenceFlow id="Flow_4" sourceRef="Timer_SpeedLead" targetRef="Task_Vitrine" />
    <bpmn:sequenceFlow id="Flow_5" sourceRef="Task_Vitrine" targetRef="Gateway_Plano" />
    <bpmn:sequenceFlow id="Flow_6" name="Mensal" sourceRef="Gateway_Plano" targetRef="Gateway_Qualificacao" />
    <bpmn:sequenceFlow id="Flow_7" name="Anual" sourceRef="Gateway_Plano" targetRef="Gateway_Qualificacao" />
    <bpmn:sequenceFlow id="Flow_8" name="Sim" sourceRef="Gateway_Qualificacao" targetRef="Task_Demo" />
    <bpmn:sequenceFlow id="Flow_9" name="Nao" sourceRef="Gateway_Qualificacao" targetRef="End_Nurture" />
    <bpmn:sequenceFlow id="Flow_10" sourceRef="Task_Demo" targetRef="Task_Processamento" />
    <bpmn:sequenceFlow id="Flow_11" sourceRef="Task_Processamento" targetRef="Gateway_Pagamento" />
    <bpmn:sequenceFlow id="Flow_12" name="Sucesso" sourceRef="Gateway_Pagamento" targetRef="Task_Split" />
    <bpmn:sequenceFlow id="Flow_13" name="Sem Limite" sourceRef="Gateway_Pagamento" targetRef="Task_Retaguarda" />
    <bpmn:sequenceFlow id="Flow_14" sourceRef="Task_Retaguarda" targetRef="Gateway_Pagamento" />
    <bpmn:sequenceFlow id="Flow_15" sourceRef="Task_Downsell" targetRef="Gateway_Pagamento" />
    <bpmn:sequenceFlow id="Flow_16" name="Ceticismo" sourceRef="Gateway_Pagamento" targetRef="Task_Downsell" />
    <bpmn:sequenceFlow id="Flow_17" sourceRef="Task_Split" targetRef="Task_Antecipacao" />
    <bpmn:sequenceFlow id="Flow_18" sourceRef="Task_Antecipacao" targetRef="Task_Onboarding" />
    <bpmn:sequenceFlow id="Flow_19" sourceRef="Task_Onboarding" targetRef="Task_Recebimento" />
    <bpmn:sequenceFlow id="Flow_20" sourceRef="Task_Recebimento" targetRef="End_ClienteAtivo" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_1">
      <bpmndi:BPMNShape id="Pool_Fyness_di" bpmnElement="Pool_Fyness" isHorizontal="true">
        <dc:Bounds x="160" y="80" width="1500" height="800" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Marketing_di" bpmnElement="Lane_Marketing" isHorizontal="true">
        <dc:Bounds x="190" y="80" width="1470" height="160" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Vendas_di" bpmnElement="Lane_Vendas" isHorizontal="true">
        <dc:Bounds x="190" y="240" width="1470" height="160" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Sistema_di" bpmnElement="Lane_Sistema" isHorizontal="true">
        <dc:Bounds x="190" y="400" width="1470" height="160" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Financeiro_di" bpmnElement="Lane_Financeiro" isHorizontal="true">
        <dc:Bounds x="190" y="560" width="1470" height="160" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Parceiro_di" bpmnElement="Lane_Parceiro" isHorizontal="true">
        <dc:Bounds x="190" y="720" width="1470" height="160" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>

      <!-- START EVENTS - Labels abaixo -->
      <bpmndi:BPMNShape id="Start_Ads_di" bpmnElement="Start_Ads">
        <dc:Bounds x="272" y="122" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="258" y="168" width="65" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Start_Organico_di" bpmnElement="Start_Organico">
        <dc:Bounds x="272" y="182" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="252" y="228" width="76" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Start_Parceiro_di" bpmnElement="Start_Parceiro">
        <dc:Bounds x="272" y="302" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="248" y="348" width="85" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- TIMER - Label abaixo -->
      <bpmndi:BPMNShape id="Timer_SpeedLead_di" bpmnElement="Timer_SpeedLead">
        <dc:Bounds x="372" y="302" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="352" y="348" width="76" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- TASKS -->
      <bpmndi:BPMNShape id="Task_Vitrine_di" bpmnElement="Task_Vitrine">
        <dc:Bounds x="470" y="120" width="140" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>

      <!-- GATEWAYS - Labels acima -->
      <bpmndi:BPMNShape id="Gateway_Plano_di" bpmnElement="Gateway_Plano" isMarkerVisible="true">
        <dc:Bounds x="665" y="135" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="669" y="105" width="42" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Qualificacao_di" bpmnElement="Gateway_Qualificacao" isMarkerVisible="true">
        <dc:Bounds x="765" y="295" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="755" y="265" width="70" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- USER TASK Demo -->
      <bpmndi:BPMNShape id="Task_Demo_di" bpmnElement="Task_Demo">
        <dc:Bounds x="880" y="280" width="140" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>

      <!-- END Nurture - Label abaixo -->
      <bpmndi:BPMNShape id="End_Nurture_di" bpmnElement="End_Nurture">
        <dc:Bounds x="772" y="362" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="770" y="408" width="40" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- SERVICE TASK Processamento -->
      <bpmndi:BPMNShape id="Task_Processamento_di" bpmnElement="Task_Processamento">
        <dc:Bounds x="880" y="440" width="140" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>

      <!-- GATEWAY Pagamento - Label acima -->
      <bpmndi:BPMNShape id="Gateway_Pagamento_di" bpmnElement="Gateway_Pagamento" isMarkerVisible="true">
        <dc:Bounds x="1075" y="455" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1065" y="425" width="70" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- TASK Retaguarda -->
      <bpmndi:BPMNShape id="Task_Retaguarda_di" bpmnElement="Task_Retaguarda">
        <dc:Bounds x="1200" y="440" width="140" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>

      <!-- USER TASK Downsell -->
      <bpmndi:BPMNShape id="Task_Downsell_di" bpmnElement="Task_Downsell">
        <dc:Bounds x="1400" y="440" width="140" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>

      <!-- SERVICE TASK Split -->
      <bpmndi:BPMNShape id="Task_Split_di" bpmnElement="Task_Split">
        <dc:Bounds x="1050" y="600" width="140" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>

      <!-- SERVICE TASK Antecipacao -->
      <bpmndi:BPMNShape id="Task_Antecipacao_di" bpmnElement="Task_Antecipacao">
        <dc:Bounds x="1250" y="600" width="140" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>

      <!-- TASK Onboarding -->
      <bpmndi:BPMNShape id="Task_Onboarding_di" bpmnElement="Task_Onboarding">
        <dc:Bounds x="1450" y="600" width="140" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>

      <!-- TASK Recebimento -->
      <bpmndi:BPMNShape id="Task_Recebimento_di" bpmnElement="Task_Recebimento">
        <dc:Bounds x="1350" y="760" width="140" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>

      <!-- END Cliente Ativo - Label abaixo -->
      <bpmndi:BPMNShape id="End_ClienteAtivo_di" bpmnElement="End_ClienteAtivo">
        <dc:Bounds x="1552" y="782" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1537" y="828" width="66" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- SEQUENCE FLOWS -->
      <bpmndi:BPMNEdge id="Flow_1_di" bpmnElement="Flow_1">
        <di:waypoint x="308" y="140" />
        <di:waypoint x="389" y="140" />
        <di:waypoint x="389" y="160" />
        <di:waypoint x="470" y="160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_2_di" bpmnElement="Flow_2">
        <di:waypoint x="308" y="200" />
        <di:waypoint x="389" y="200" />
        <di:waypoint x="389" y="180" />
        <di:waypoint x="470" y="180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_3_di" bpmnElement="Flow_3">
        <di:waypoint x="308" y="320" />
        <di:waypoint x="372" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_4_di" bpmnElement="Flow_4">
        <di:waypoint x="408" y="320" />
        <di:waypoint x="439" y="320" />
        <di:waypoint x="439" y="170" />
        <di:waypoint x="470" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_5_di" bpmnElement="Flow_5">
        <di:waypoint x="610" y="160" />
        <di:waypoint x="665" y="160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_6_di" bpmnElement="Flow_6">
        <di:waypoint x="690" y="185" />
        <di:waypoint x="690" y="320" />
        <di:waypoint x="765" y="320" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="695" y="250" width="40" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_7_di" bpmnElement="Flow_7">
        <di:waypoint x="715" y="160" />
        <di:waypoint x="740" y="160" />
        <di:waypoint x="740" y="300" />
        <di:waypoint x="765" y="300" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="745" y="227" width="30" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_8_di" bpmnElement="Flow_8">
        <di:waypoint x="815" y="320" />
        <di:waypoint x="880" y="320" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="838" y="302" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_9_di" bpmnElement="Flow_9">
        <di:waypoint x="790" y="345" />
        <di:waypoint x="790" y="362" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="795" y="351" width="21" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_10_di" bpmnElement="Flow_10">
        <di:waypoint x="950" y="360" />
        <di:waypoint x="950" y="440" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_11_di" bpmnElement="Flow_11">
        <di:waypoint x="1020" y="480" />
        <di:waypoint x="1075" y="480" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_12_di" bpmnElement="Flow_12">
        <di:waypoint x="1100" y="505" />
        <di:waypoint x="1100" y="600" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1105" y="550" width="42" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_13_di" bpmnElement="Flow_13">
        <di:waypoint x="1125" y="480" />
        <di:waypoint x="1200" y="480" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1135" y="462" width="55" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_14_di" bpmnElement="Flow_14">
        <di:waypoint x="1270" y="520" />
        <di:waypoint x="1270" y="550" />
        <di:waypoint x="1060" y="550" />
        <di:waypoint x="1060" y="480" />
        <di:waypoint x="1075" y="480" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_15_di" bpmnElement="Flow_15">
        <di:waypoint x="1470" y="520" />
        <di:waypoint x="1470" y="550" />
        <di:waypoint x="1060" y="550" />
        <di:waypoint x="1060" y="480" />
        <di:waypoint x="1075" y="480" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_16_di" bpmnElement="Flow_16">
        <di:waypoint x="1125" y="480" />
        <di:waypoint x="1162" y="480" />
        <di:waypoint x="1162" y="420" />
        <di:waypoint x="1470" y="420" />
        <di:waypoint x="1470" y="440" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1290" y="402" width="50" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_17_di" bpmnElement="Flow_17">
        <di:waypoint x="1190" y="640" />
        <di:waypoint x="1250" y="640" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_18_di" bpmnElement="Flow_18">
        <di:waypoint x="1390" y="640" />
        <di:waypoint x="1450" y="640" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_19_di" bpmnElement="Flow_19">
        <di:waypoint x="1520" y="680" />
        <di:waypoint x="1520" y="720" />
        <di:waypoint x="1420" y="720" />
        <di:waypoint x="1420" y="760" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_20_di" bpmnElement="Flow_20">
        <di:waypoint x="1490" y="800" />
        <di:waypoint x="1552" y="800" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

/**
 * Template BPMN vazio para novos diagramas
 */
export const EMPTY_DIAGRAM_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_Empty" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" name="Inicio" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="StartEvent_1_di" bpmnElement="StartEvent_1">
        <dc:Bounds x="180" y="160" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="184" y="206" width="28" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

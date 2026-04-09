/**
 * Template BPMN — RH FYNESS
 * Checklist simples: quem contratar e o que perguntar
 */

export const RH_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
 xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
 xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
 xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
 xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0"
 id="Definitions_RH"
 targetNamespace="http://fyness.com/bpmn/rh">

 <bpmn2:collaboration id="Collaboration_RH">
   <bpmn2:participant id="Pool_RH" name="CONTRATACAO VENDEDOR FYNESS" processRef="Process_RH" />

   <bpmn2:textAnnotation id="Nota_Caracteristicas">
     <bpmn2:text>O QUE O VENDEDOR FYNESS DEVE TER (nota 1-10 cada):

1. TREINABILIDADE (peso 10) — Aceita feedback e APLICA no dia seguinte
2. CURIOSIDADE (peso 9) — Pesquisa antes de agir, quer entender
3. DISCIPLINA (peso 8) — Cumpre horario, entrega, nao precisa de cobranca
4. HISTORICO DE CONQUISTAS (peso 8) — Ja venceu em algo na vida
5. EXPERIENCIA COM VENDAS (peso 7) — Ja vendeu por telefone/WhatsApp
6. RACIOCINIO RAPIDO (peso 7) — Entende rapido, resolve sozinho
7. VOZ E COMUNICACAO (peso 6) — Tom firme, energia, clareza

NOTA: acima de 50/70 = contrata | 40-50 = com ressalva | abaixo de 40 = nao
REGRA: treinabilidade menor que 6 = nao contrata</bpmn2:text>
   </bpmn2:textAnnotation>

   <bpmn2:textAnnotation id="Nota_Perguntas">
     <bpmn2:text>O QUE PERGUNTAR NA ENTREVISTA:

SOBRE O PASSADO:
- "Me fala do seu chefe anterior. Pontos bons e ruins dele como profissional?"
- "O que ele falaria de VOCE? Coisas boas e ruins."
- "Qual a maior conquista da sua vida?"
- "Como era seu processo de venda? Como batia meta?"

SOBRE VALORES (eliminatorio):
- "O que faz uma pessoa ter sucesso na vida?"
- "Quando algo da errado, de quem e a responsabilidade?"
- "O que voce pensa sobre empreendedorismo no Brasil?"
- "Prefere estabilidade ou crescimento por resultado?"

FILTROS ELIMINATORIOS:
- Minimo 1 ano de experiencia em outro emprego
- Nao pula de emprego em emprego
- Alinhado com valores: meritocracia, responsabilidade individual,
  empreendedorismo, mentalidade de dono, anti-vitimismo
- Nao alinhado = nao contrata. Habilidade se treina. Valores nao.</bpmn2:text>
   </bpmn2:textAnnotation>

 </bpmn2:collaboration>

 <bpmn2:process id="Process_RH" isExecutable="false">
   <bpmn2:startEvent id="Start_RH" name="Candidato" />
   <bpmn2:task id="Task_Filtros" name="Filtros eliminatorios (experiencia + estabilidade)" />
   <bpmn2:exclusiveGateway id="GW1" name="Passou?" />
   <bpmn2:endEvent id="End_Nao1" name="Nao" />
   <bpmn2:task id="Task_Entrevista" name="Entrevista (passado + valores)" />
   <bpmn2:exclusiveGateway id="GW2" name="Alinhado?" />
   <bpmn2:endEvent id="End_Nao2" name="Nao" />
   <bpmn2:task id="Task_Nota" name="Dar nota nas 7 caracteristicas" />
   <bpmn2:exclusiveGateway id="GW3" name="Nota >= 40?" />
   <bpmn2:endEvent id="End_Nao3" name="Nao" />
   <bpmn2:endEvent id="End_Sim" name="CONTRATADO!" />

   <bpmn2:sequenceFlow id="F1" sourceRef="Start_RH" targetRef="Task_Filtros" />
   <bpmn2:sequenceFlow id="F2" sourceRef="Task_Filtros" targetRef="GW1" />
   <bpmn2:sequenceFlow id="F3" name="Nao" sourceRef="GW1" targetRef="End_Nao1" />
   <bpmn2:sequenceFlow id="F4" name="Sim" sourceRef="GW1" targetRef="Task_Entrevista" />
   <bpmn2:sequenceFlow id="F5" sourceRef="Task_Entrevista" targetRef="GW2" />
   <bpmn2:sequenceFlow id="F6" name="Nao" sourceRef="GW2" targetRef="End_Nao2" />
   <bpmn2:sequenceFlow id="F7" name="Sim" sourceRef="GW2" targetRef="Task_Nota" />
   <bpmn2:sequenceFlow id="F8" sourceRef="Task_Nota" targetRef="GW3" />
   <bpmn2:sequenceFlow id="F9" name="Nao" sourceRef="GW3" targetRef="End_Nao3" />
   <bpmn2:sequenceFlow id="F10" name="Sim" sourceRef="GW3" targetRef="End_Sim" />
 </bpmn2:process>

 <bpmndi:BPMNDiagram id="BPMNDiagram_RH">
   <bpmndi:BPMNPlane id="BPMNPlane_RH" bpmnElement="Collaboration_RH">

     <bpmndi:BPMNShape id="Shape_Pool" bpmnElement="Pool_RH" isHorizontal="true" bioc:stroke="#1565C0" bioc:fill="#E3F2FD">
       <dc:Bounds x="160" y="60" width="1200" height="200" />
     </bpmndi:BPMNShape>

     <bpmndi:BPMNShape id="S1" bpmnElement="Start_RH">
       <dc:Bounds x="220" y="142" width="36" height="36" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="S2" bpmnElement="Task_Filtros">
       <dc:Bounds x="300" y="120" width="160" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="S3" bpmnElement="GW1" isMarkerVisible="true">
       <dc:Bounds x="500" y="135" width="50" height="50" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="S4" bpmnElement="End_Nao1">
       <dc:Bounds x="507" y="77" width="36" height="36" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="S5" bpmnElement="Task_Entrevista">
       <dc:Bounds x="590" y="120" width="160" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="S6" bpmnElement="GW2" isMarkerVisible="true">
       <dc:Bounds x="790" y="135" width="50" height="50" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="S7" bpmnElement="End_Nao2">
       <dc:Bounds x="797" y="77" width="36" height="36" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="S8" bpmnElement="Task_Nota">
       <dc:Bounds x="880" y="120" width="160" height="80" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="S9" bpmnElement="GW3" isMarkerVisible="true">
       <dc:Bounds x="1080" y="135" width="50" height="50" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="S10" bpmnElement="End_Nao3">
       <dc:Bounds x="1087" y="77" width="36" height="36" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="S11" bpmnElement="End_Sim">
       <dc:Bounds x="1180" y="142" width="36" height="36" />
     </bpmndi:BPMNShape>

     <bpmndi:BPMNEdge id="E1" bpmnElement="F1">
       <di:waypoint x="256" y="160" />
       <di:waypoint x="300" y="160" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="E2" bpmnElement="F2">
       <di:waypoint x="460" y="160" />
       <di:waypoint x="500" y="160" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="E3" bpmnElement="F3">
       <di:waypoint x="525" y="135" />
       <di:waypoint x="525" y="113" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="E4" bpmnElement="F4">
       <di:waypoint x="550" y="160" />
       <di:waypoint x="590" y="160" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="E5" bpmnElement="F5">
       <di:waypoint x="750" y="160" />
       <di:waypoint x="790" y="160" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="E6" bpmnElement="F6">
       <di:waypoint x="815" y="135" />
       <di:waypoint x="815" y="113" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="E7" bpmnElement="F7">
       <di:waypoint x="840" y="160" />
       <di:waypoint x="880" y="160" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="E8" bpmnElement="F8">
       <di:waypoint x="1040" y="160" />
       <di:waypoint x="1080" y="160" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="E9" bpmnElement="F9">
       <di:waypoint x="1105" y="135" />
       <di:waypoint x="1105" y="113" />
     </bpmndi:BPMNEdge>
     <bpmndi:BPMNEdge id="E10" bpmnElement="F10">
       <di:waypoint x="1130" y="160" />
       <di:waypoint x="1180" y="160" />
     </bpmndi:BPMNEdge>

     <bpmndi:BPMNShape id="SA1" bpmnElement="Nota_Caracteristicas">
       <dc:Bounds x="160" y="310" width="500" height="280" />
     </bpmndi:BPMNShape>
     <bpmndi:BPMNShape id="SA2" bpmnElement="Nota_Perguntas">
       <dc:Bounds x="700" y="310" width="460" height="320" />
     </bpmndi:BPMNShape>

   </bpmndi:BPMNPlane>
 </bpmndi:BPMNDiagram>

</bpmn2:definitions>`;

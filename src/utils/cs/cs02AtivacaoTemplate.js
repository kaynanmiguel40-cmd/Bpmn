/**
 * Template BPMN 2.0 — CS Fase 2: Ativacao (D8-D30)
 *
 * Objetivo: cliente forma habito minimo de 3 usos por semana em 3 semanas seguidas.
 * Sucesso = 3 sem consecutivas >=3 usos no app + check-in M1 sem sinal de churn.
 * Mensal sem fidelidade -> cliente PODE cancelar a qualquer momento. Esse mes define se ele fica.
 *
 * 3 lanes: Cliente · Consultora · Sistema
 */

export const CS_02_ATIVACAO_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_CS02" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_CS02">
    <bpmn:participant id="Pool_CS02" name="CS Fase 2 - Ativacao (D8-D30) - Meta: 3 semanas &gt;=3 usos" processRef="Process_CS02" />
  </bpmn:collaboration>
  <bpmn:process id="Process_CS02" isExecutable="false">
    <bpmn:laneSet id="LaneSet_CS02">
      <bpmn:lane id="Lane_Cliente" name="Cliente">
        <bpmn:flowNodeRef>Start_Ativacao</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Habito</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Risco</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Consultora" name="Consultora de Relacionamento">
        <bpmn:flowNodeRef>Task_D10</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_D17</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_D24</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_M1Call</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Ativado</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Sistema" name="Sistema (CRM + WhatsApp)">
        <bpmn:flowNodeRef>Task_ResumoSemanal</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_HealthSemanal</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="Start_Ativacao" name="Saiu Fase 1 com TTV atingido (D8)">
      <bpmn:documentation>QUANDO: D8 (cliente saiu da Fase 1 com TTV atingido)

O QUE ACONTECE
Comeca a janela de 23 dias (D8 ate D30) pra o cliente formar habito de uso.</bpmn:documentation>
      <bpmn:outgoing>F01</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:serviceTask id="Task_ResumoSemanal" name="Resumo-sexta-17h auto (semanal)&#10;WhatsApp com tendencia caixa - gancho de habito">
      <bpmn:documentation>QUEM FAZ: Sistema (automatico)
QUANDO: Toda sexta as 17h

O QUE FAZER
Manda no WhatsApp do cliente um resumo da semana: audio + imagem mostrando como foi o caixa.

POR QUE E IMPORTANTE
E o gancho de habito principal. Se voce nao mandar, o cliente vai esquecer que assina. Sem ele, o churn dobra no M3.

REGRA
Obrigatorio. Nao pode falhar.</bpmn:documentation>
      <bpmn:incoming>F01</bpmn:incoming>
      <bpmn:outgoing>F02</bpmn:outgoing>
    </bpmn:serviceTask>

    <bpmn:serviceTask id="Task_HealthSemanal" name="Atualizar Health Score (semanal)&#10;Uso + Pagamento + NPS + Override + Outreach">
      <bpmn:documentation>QUEM FAZ: Sistema (automatico)
QUANDO: Toda semana

O QUE FAZER
Recalcula a nota de saude do cliente (0-100). Se cair muito, dispara alerta.

COMO E A NOTA
- Uso semanal: 30 pontos
- Pagamento em dia: 25 pontos
- NPS: 20 pontos
- Override IA: 15 pontos
- Responde a Consultora: 10 pontos

QUANDO ALERTA
- Cai abaixo de 40: chama Kaynan urgente
- Entre 40 e 69: Consultora intensifica contato
- Acima de 70: tudo certo</bpmn:documentation>
      <bpmn:incoming>F02</bpmn:incoming>
      <bpmn:outgoing>F03</bpmn:outgoing>
    </bpmn:serviceTask>

    <bpmn:userTask id="Task_D10" name="D10: Check-in WhatsApp&#10;'Como esta indo a 1a semana? Algo travando?'">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D10 (apos 1 semana de uso)

O QUE FAZER
Manda audio no WhatsApp do cliente perguntando como ta sendo a primeira semana.

EXEMPLO DE FALA
"Oi [nome]! Como ta sendo essa primeira semana usando a Fyness? Algo travando ai? Me conta."

SE DER RUIM
Cliente nao respondeu nada na semana toda: chama atencao no CRM, escala Consultora pra ligar.</bpmn:documentation>
      <bpmn:incoming>F03</bpmn:incoming>
      <bpmn:outgoing>F04</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_D17" name="D17: Check-in semana 2&#10;Reforcar habito sexta-17h + sugerir lancamento atrasado">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D17 (semana 2)

O QUE FAZER
Reforca o habito sexta-17h e sugere o cliente lancar 1 coisa que ele esqueceu.

EXEMPLO DE FALA
"Oi [nome]! Viu o resumo de sexta? Aproveita esse domingo, lanca aquela conta que voce me falou que esqueceu. Toma 30 segundos."

SE DER RUIM
Uso menor que 3 vezes na semana: pergunta diretamente o que ta travando.</bpmn:documentation>
      <bpmn:incoming>F04</bpmn:incoming>
      <bpmn:outgoing>F05</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_D24" name="D24: Check-in semana 3&#10;Identificar bloqueio se uso &lt;3x na semana">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D24 (semana 3)

O QUE FAZER
Ultimo check antes da ligacao do M1. Identifica especificamente o que esta travando se o uso continua baixo.

EXEMPLO DE FALA
"Oi [nome]! Semana que vem a gente conversa por ligacao - 15 minutinhos pra fechar esse 1o mes. Antes, tem alguma duvida ou bloqueio que voce queira que eu ja resolva?"

DICA
Se cliente continua com baixo uso, ja prepara a ligacao M1 pra ser mais aprofundada (nao apenas pesquisa de satisfacao).</bpmn:documentation>
      <bpmn:incoming>F05</bpmn:incoming>
      <bpmn:outgoing>F06</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_M1Call" name="M1 (D30): Ligacao 15min&#10;'Como esta sendo o 1o mes?' Mede NPS + identifica risco">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D30 (M1) - LIGACAO, nao WhatsApp

O QUE FAZER
Liga pro cliente pra conversar sobre o 1o mes. Mede satisfacao e identifica risco.

ROTEIRO
- "Como ta sendo o primeiro mes?" (escuta de verdade)
- "De 0 a 10, quanto voce indicaria a Fyness pra um amigo dono de negocio?"
- "O que falta pra ser 10?"
- Combina os proximos passos da Fase 3 (resumo-sexta + check-ins mensais)

EXEMPLO DE FALA NA ABERTURA
"Oi [nome]! Ja faz 1 mes - to ligando pra saber como ta sendo, ouvir voce, e a gente ajustar o que precisar."

SE DER RUIM (cliente fala em cancelamento)
ATENCAO MAXIMA. Cliente mensal cancela na proxima cobranca - escala Kaynan AGORA, no mesmo dia.</bpmn:documentation>
      <bpmn:incoming>F06</bpmn:incoming>
      <bpmn:outgoing>F07</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:exclusiveGateway id="Gateway_Ativado" name="3 sem seguidas &gt;=3 usos?">
      <bpmn:documentation>DECISAO NO D30

CRITERIO (precisa ter os 4)
- 3 semanas seguidas com pelo menos 3 usos no app
- NPS na ligacao M1 maior ou igual a 7
- Respondeu pelo menos 2 dos 3 check-ins (D10/D17/D24)
- Nenhuma menção a cancelamento

SIM -- vai pra Fase 3 (Habito)
NAO -- Save Playbook do Kaynan (urgente no mensal)</bpmn:documentation>
      <bpmn:incoming>F07</bpmn:incoming>
      <bpmn:outgoing>F08_Sim</bpmn:outgoing>
      <bpmn:outgoing>F08_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:endEvent id="End_Habito" name="Pronto pra Fase 3 (Habito)">
      <bpmn:documentation>RESULTADO BOM

Cliente ativado. Vai pra Fase 3 (Habito - D31 ate D120).

CONFIRME ANTES DE PROSSEGUIR
Health Score do cliente esta &gt;=60.</bpmn:documentation>
      <bpmn:incoming>F08_Sim</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:endEvent id="End_Risco" name="Risco -&gt; Save Playbook&#10;(CS Macro)">
      <bpmn:documentation>RESULTADO RUIM - Cliente em risco apos D30

ACAO DO KAYNAN
1. Liga (nao WhatsApp)
2. Identifica o que esta travando (tecnico, financeiro, prioridade, vida pessoal)
3. Se tecnico: grava video resolvendo
4. Se financeiro: 1 mes de desconto OU pausa-nao-cancela
5. Se prioridade: mostra valor com dados do proprio caixa do cliente</bpmn:documentation>
      <bpmn:incoming>F08_Nao</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="F01" sourceRef="Start_Ativacao" targetRef="Task_ResumoSemanal" />
    <bpmn:sequenceFlow id="F02" sourceRef="Task_ResumoSemanal" targetRef="Task_HealthSemanal" />
    <bpmn:sequenceFlow id="F03" sourceRef="Task_HealthSemanal" targetRef="Task_D10" />
    <bpmn:sequenceFlow id="F04" sourceRef="Task_D10" targetRef="Task_D17" />
    <bpmn:sequenceFlow id="F05" sourceRef="Task_D17" targetRef="Task_D24" />
    <bpmn:sequenceFlow id="F06" sourceRef="Task_D24" targetRef="Task_M1Call" />
    <bpmn:sequenceFlow id="F07" sourceRef="Task_M1Call" targetRef="Gateway_Ativado" />
    <bpmn:sequenceFlow id="F08_Sim" name="Sim" sourceRef="Gateway_Ativado" targetRef="End_Habito" />
    <bpmn:sequenceFlow id="F08_Nao" name="Nao" sourceRef="Gateway_Ativado" targetRef="End_Risco" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_CS02">
    <bpmndi:BPMNPlane id="BPMNPlane_CS02" bpmnElement="Collaboration_CS02">
      <bpmndi:BPMNShape id="Pool_CS02_di" bpmnElement="Pool_CS02" isHorizontal="true">
        <dc:Bounds x="160" y="80" width="2100" height="600" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Cliente_di" bpmnElement="Lane_Cliente" isHorizontal="true">
        <dc:Bounds x="190" y="80" width="2070" height="120" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Consultora_di" bpmnElement="Lane_Consultora" isHorizontal="true">
        <dc:Bounds x="190" y="200" width="2070" height="240" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Sistema_di" bpmnElement="Lane_Sistema" isHorizontal="true">
        <dc:Bounds x="190" y="440" width="2070" height="240" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_Ativacao_di" bpmnElement="Start_Ativacao">
        <dc:Bounds x="240" y="122" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="200" y="165" width="116" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Habito_di" bpmnElement="End_Habito">
        <dc:Bounds x="2140" y="122" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2100" y="165" width="116" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Risco_di" bpmnElement="End_Risco">
        <dc:Bounds x="2140" y="282" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2095" y="325" width="126" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_ResumoSemanal_di" bpmnElement="Task_ResumoSemanal">
        <dc:Bounds x="320" y="520" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_HealthSemanal_di" bpmnElement="Task_HealthSemanal">
        <dc:Bounds x="580" y="520" width="220" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_D10_di" bpmnElement="Task_D10">
        <dc:Bounds x="860" y="260" width="200" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D17_di" bpmnElement="Task_D17">
        <dc:Bounds x="1100" y="260" width="200" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D24_di" bpmnElement="Task_D24">
        <dc:Bounds x="1340" y="260" width="200" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_M1Call_di" bpmnElement="Task_M1Call">
        <dc:Bounds x="1580" y="260" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Ativado_di" bpmnElement="Gateway_Ativado" isMarkerVisible="true">
        <dc:Bounds x="1860" y="275" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1840" y="245" width="90" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNEdge id="F01_di" bpmnElement="F01">
        <di:waypoint x="258" y="158" />
        <di:waypoint x="258" y="560" />
        <di:waypoint x="320" y="560" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F02_di" bpmnElement="F02">
        <di:waypoint x="540" y="560" />
        <di:waypoint x="580" y="560" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F03_di" bpmnElement="F03">
        <di:waypoint x="800" y="560" />
        <di:waypoint x="830" y="560" />
        <di:waypoint x="830" y="300" />
        <di:waypoint x="860" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F04_di" bpmnElement="F04">
        <di:waypoint x="1060" y="300" />
        <di:waypoint x="1100" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F05_di" bpmnElement="F05">
        <di:waypoint x="1300" y="300" />
        <di:waypoint x="1340" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F06_di" bpmnElement="F06">
        <di:waypoint x="1540" y="300" />
        <di:waypoint x="1580" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F07_di" bpmnElement="F07">
        <di:waypoint x="1800" y="300" />
        <di:waypoint x="1860" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F08_Sim_di" bpmnElement="F08_Sim">
        <di:waypoint x="1885" y="275" />
        <di:waypoint x="1885" y="140" />
        <di:waypoint x="2140" y="140" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1890" y="200" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F08_Nao_di" bpmnElement="F08_Nao">
        <di:waypoint x="1910" y="300" />
        <di:waypoint x="2140" y="300" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2010" y="282" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

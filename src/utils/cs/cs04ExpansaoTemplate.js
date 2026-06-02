/**
 * Template BPMN 2.0 — CS Fase 4: Expansao (M4-M11)
 *
 * Objetivo: identificar momento certo e converter Starter -> Pro (ou Pro -> Enterprise).
 * So aborda cliente com health >=80 E trigger natural (2a loja, contratou funcionario, etc).
 * Sem trigger e sem health -> NAO insistir (queima relacionamento nesse ticket).
 *
 * 4 lanes: Cliente · Consultora · Kaynan · Sistema
 */

export const CS_04_EXPANSAO_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_CS04" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_CS04">
    <bpmn:participant id="Pool_CS04" name="CS Fase 4 - Expansao (M4-M11) - Meta: 20% Starter-&gt;Pro" processRef="Process_CS04" />
  </bpmn:collaboration>
  <bpmn:process id="Process_CS04" isExecutable="false">
    <bpmn:laneSet id="LaneSet_CS04">
      <bpmn:lane id="Lane_Cliente" name="Cliente">
        <bpmn:flowNodeRef>Start_Expansao</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Upgrade</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Manter</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Consultora" name="Consultora de Relacionamento">
        <bpmn:flowNodeRef>Task_PesquisarNegocio</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_Pitch</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Aceitou</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Kaynan" name="Kaynan (Fundador)">
        <bpmn:flowNodeRef>Task_AprovarOferta</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Sistema" name="Sistema (CRM + Asaas)">
        <bpmn:flowNodeRef>Task_MonitorarTriggers</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_TriggerHealth</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_AtualizarPlano</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="Start_Expansao" name="Saiu Fase 3 com habito (M4)">
      <bpmn:documentation>QUANDO: M4 (cliente saiu da Fase 3 com health &gt;=70)

O QUE ACONTECE
Janela de 7 meses (M4 ate M11) pra detectar momento natural de upgrade e converter Starter pra Pro.</bpmn:documentation>
      <bpmn:outgoing>F01</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:serviceTask id="Task_MonitorarTriggers" name="Monitorar triggers (continuo)&#10;2a loja / funcionario / faturamento +50% / integracao mais complexa">
      <bpmn:documentation>QUEM FAZ: Sistema (automatico)
QUANDO: O tempo todo

O QUE FAZER
Fica de olho no CRM pra detectar 5 sinais que indicam que o cliente cresceu:
1. Contratou 1o funcionario formal
2. Abriu 2a loja ou 2o CNPJ
3. Faturamento subiu mais de 50% nos ultimos 60 dias
4. Pediu integracao com contador ou banco
5. Falou em check-in: "to perdendo o controle", "to precisando de mais"

Quando detecta, alerta a Consultora.</bpmn:documentation>
      <bpmn:incoming>F01</bpmn:incoming>
      <bpmn:outgoing>F02</bpmn:outgoing>
    </bpmn:serviceTask>

    <bpmn:exclusiveGateway id="Gateway_TriggerHealth" name="Trigger detectado E&#10;health &gt;=80?">
      <bpmn:documentation>DECISAO

REGRA DE OURO
So faz pitch de upgrade se TER OS DOIS:
- Trigger natural detectado
- Health Score do cliente &gt;=80

POR QUE
Sem trigger, cliente nao quer upgrade.
Sem health alto, cliente nao confia o suficiente.
Forcar nesse ticket queima a relacao.

SIM -- segue pra pesquisar contexto e fazer pitch
NAO -- mantem plano e segue monitorando</bpmn:documentation>
      <bpmn:incoming>F02</bpmn:incoming>
      <bpmn:outgoing>F03_Sim</bpmn:outgoing>
      <bpmn:outgoing>F03_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:userTask id="Task_PesquisarNegocio" name="Pesquisar contexto do cliente&#10;Conversar com cliente entender momento + dor especifica">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: ANTES de fazer pitch de upgrade

O QUE FAZER
Manda audio pro cliente entender melhor o momento dele. Sem isso o pitch fica raso.

EXEMPLO DE FALA
"Oi [nome]! Vi que voce contratou a [Maria]. Que legal! Me conta como ta sendo isso - o que ta dando mais trabalho? Como a Fyness pode te ajudar nessa nova fase?"

O QUE ANOTAR NO CRM
- O que motivou o crescimento (contratou, abriu loja, etc)
- Qual dor especifica isso ta gerando
- Quanto tempo a Fyness atual ainda atende</bpmn:documentation>
      <bpmn:incoming>F03_Sim</bpmn:incoming>
      <bpmn:outgoing>F04</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_AprovarOferta" name="Aprovar oferta de upgrade&#10;Define preco, desconto, condicao especial (se necessario)">
      <bpmn:documentation>QUEM FAZ: Kaynan (fundador)
QUANDO: Depois da pesquisa de contexto

O QUE FAZER
Decide a oferta especifica pro cliente:
- Preco padrao Pro OU
- Desconto inicial (ex: 50% off no 1o mes) OU
- Parcelamento OU
- Condicao especial

REGRA
So aprovar oferta financeiramente saudavel. Anotar oferta no CRM pra Consultora apresentar.</bpmn:documentation>
      <bpmn:incoming>F04</bpmn:incoming>
      <bpmn:outgoing>F05</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_Pitch" name="Pitch de upgrade no WhatsApp/Call&#10;Apresenta valor especifico pro momento do cliente">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: Depois do Kaynan aprovar a oferta

O QUE FAZER
Faz o pitch em audio ou call - NUNCA texto frio.

EXEMPLO DE FALA (cliente que contratou funcionario)
"Oi [nome]! Lembrei da nossa conversa sobre voce ter contratado a Maria. A gente tem uma versao Pro que tem controle de comissao automatico - voce nao precisa mais somar a mao. Ficaria por [valor da oferta]. Que tal?"

REGRA
Linguagem de dono, nao de SaaS. Fala do beneficio especifico do MOMENTO do cliente, nao das features genericas.</bpmn:documentation>
      <bpmn:incoming>F05</bpmn:incoming>
      <bpmn:outgoing>F06</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:exclusiveGateway id="Gateway_Aceitou" name="Cliente aceitou?">
      <bpmn:documentation>DECISAO DO PITCH

SIM -- sistema atualiza o plano
NAO -- mantem o plano atual e volta a monitorar triggers. NAO refazer pitch antes do proximo trigger natural.</bpmn:documentation>
      <bpmn:incoming>F06</bpmn:incoming>
      <bpmn:outgoing>F07_Sim</bpmn:outgoing>
      <bpmn:outgoing>F07_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:serviceTask id="Task_AtualizarPlano" name="Atualizar plano no Asaas&#10;Novo valor + cobranca proxima fatura">
      <bpmn:documentation>QUEM FAZ: Sistema (automatico)
QUANDO: Logo apos cliente aceitar

O QUE FAZER
1. Atualiza plano no Asaas (Starter pra Pro)
2. Aplica o desconto autorizado pelo Kaynan se tiver
3. Ajusta a cobranca da proxima fatura
4. Notifica cliente no WhatsApp com confirmacao + lista das features Pro que ele agora tem</bpmn:documentation>
      <bpmn:incoming>F07_Sim</bpmn:incoming>
      <bpmn:outgoing>F08</bpmn:outgoing>
    </bpmn:serviceTask>

    <bpmn:endEvent id="End_Upgrade" name="Upgrade efetivado (Starter-&gt;Pro)">
      <bpmn:documentation>RESULTADO BOM - Upgrade convertido

PROXIMO PASSO
Cliente segue no ciclo (continua nos check-ins mensais). Anotar no CRM qual trigger disparou - ajuda a melhorar o playbook.</bpmn:documentation>
      <bpmn:incoming>F08</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:endEvent id="End_Manter" name="Mantem plano + monitora triggers">
      <bpmn:documentation>RESULTADO NEUTRO

Cliente fica no plano atual. Sistema continua monitorando triggers - pode aparecer nova oportunidade em 30, 60 ou 90 dias.

REGRA
NAO insistir antes do proximo trigger natural. Anotar no CRM o motivo (preco/momento/falta de percepcao de valor) pra ajustar oferta na proxima.</bpmn:documentation>
      <bpmn:incoming>F03_Nao</bpmn:incoming>
      <bpmn:incoming>F07_Nao</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="F01" sourceRef="Start_Expansao" targetRef="Task_MonitorarTriggers" />
    <bpmn:sequenceFlow id="F02" sourceRef="Task_MonitorarTriggers" targetRef="Gateway_TriggerHealth" />
    <bpmn:sequenceFlow id="F03_Sim" name="Sim" sourceRef="Gateway_TriggerHealth" targetRef="Task_PesquisarNegocio" />
    <bpmn:sequenceFlow id="F03_Nao" name="Nao" sourceRef="Gateway_TriggerHealth" targetRef="End_Manter" />
    <bpmn:sequenceFlow id="F04" sourceRef="Task_PesquisarNegocio" targetRef="Task_AprovarOferta" />
    <bpmn:sequenceFlow id="F05" sourceRef="Task_AprovarOferta" targetRef="Task_Pitch" />
    <bpmn:sequenceFlow id="F06" sourceRef="Task_Pitch" targetRef="Gateway_Aceitou" />
    <bpmn:sequenceFlow id="F07_Sim" name="Sim" sourceRef="Gateway_Aceitou" targetRef="Task_AtualizarPlano" />
    <bpmn:sequenceFlow id="F07_Nao" name="Nao" sourceRef="Gateway_Aceitou" targetRef="End_Manter" />
    <bpmn:sequenceFlow id="F08" sourceRef="Task_AtualizarPlano" targetRef="End_Upgrade" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_CS04">
    <bpmndi:BPMNPlane id="BPMNPlane_CS04" bpmnElement="Collaboration_CS04">
      <bpmndi:BPMNShape id="Pool_CS04_di" bpmnElement="Pool_CS04" isHorizontal="true">
        <dc:Bounds x="160" y="80" width="2200" height="720" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Cliente_di" bpmnElement="Lane_Cliente" isHorizontal="true">
        <dc:Bounds x="190" y="80" width="2170" height="140" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Consultora_di" bpmnElement="Lane_Consultora" isHorizontal="true">
        <dc:Bounds x="190" y="220" width="2170" height="200" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Kaynan_di" bpmnElement="Lane_Kaynan" isHorizontal="true">
        <dc:Bounds x="190" y="420" width="2170" height="140" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Sistema_di" bpmnElement="Lane_Sistema" isHorizontal="true">
        <dc:Bounds x="190" y="560" width="2170" height="240" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_Expansao_di" bpmnElement="Start_Expansao">
        <dc:Bounds x="240" y="132" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="210" y="175" width="106" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Upgrade_di" bpmnElement="End_Upgrade">
        <dc:Bounds x="2240" y="132" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2200" y="175" width="116" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Manter_di" bpmnElement="End_Manter">
        <dc:Bounds x="2240" y="312" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2200" y="355" width="116" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_MonitorarTriggers_di" bpmnElement="Task_MonitorarTriggers">
        <dc:Bounds x="320" y="630" width="240" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_TriggerHealth_di" bpmnElement="Gateway_TriggerHealth" isMarkerVisible="true">
        <dc:Bounds x="620" y="645" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="600" y="700" width="100" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_PesquisarNegocio_di" bpmnElement="Task_PesquisarNegocio">
        <dc:Bounds x="780" y="280" width="240" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Pitch_di" bpmnElement="Task_Pitch">
        <dc:Bounds x="1500" y="280" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Aceitou_di" bpmnElement="Gateway_Aceitou" isMarkerVisible="true">
        <dc:Bounds x="1780" y="295" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1765" y="265" width="80" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_AprovarOferta_di" bpmnElement="Task_AprovarOferta">
        <dc:Bounds x="1140" y="450" width="240" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_AtualizarPlano_di" bpmnElement="Task_AtualizarPlano">
        <dc:Bounds x="1900" y="630" width="220" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNEdge id="F01_di" bpmnElement="F01">
        <di:waypoint x="258" y="168" />
        <di:waypoint x="258" y="670" />
        <di:waypoint x="320" y="670" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F02_di" bpmnElement="F02">
        <di:waypoint x="560" y="670" />
        <di:waypoint x="620" y="670" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F03_Sim_di" bpmnElement="F03_Sim">
        <di:waypoint x="645" y="645" />
        <di:waypoint x="645" y="320" />
        <di:waypoint x="780" y="320" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="650" y="470" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F03_Nao_di" bpmnElement="F03_Nao">
        <di:waypoint x="670" y="670" />
        <di:waypoint x="2240" y="670" />
        <di:waypoint x="2258" y="348" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1400" y="652" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F04_di" bpmnElement="F04">
        <di:waypoint x="1020" y="320" />
        <di:waypoint x="1080" y="320" />
        <di:waypoint x="1080" y="490" />
        <di:waypoint x="1140" y="490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F05_di" bpmnElement="F05">
        <di:waypoint x="1380" y="490" />
        <di:waypoint x="1440" y="490" />
        <di:waypoint x="1440" y="320" />
        <di:waypoint x="1500" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F06_di" bpmnElement="F06">
        <di:waypoint x="1720" y="320" />
        <di:waypoint x="1780" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F07_Sim_di" bpmnElement="F07_Sim">
        <di:waypoint x="1805" y="345" />
        <di:waypoint x="1805" y="670" />
        <di:waypoint x="1900" y="670" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1810" y="480" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F07_Nao_di" bpmnElement="F07_Nao">
        <di:waypoint x="1830" y="320" />
        <di:waypoint x="2258" y="320" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2040" y="302" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F08_di" bpmnElement="F08">
        <di:waypoint x="2120" y="670" />
        <di:waypoint x="2258" y="670" />
        <di:waypoint x="2258" y="168" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

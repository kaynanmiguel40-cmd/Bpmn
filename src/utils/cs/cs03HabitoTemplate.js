/**
 * Template BPMN 2.0 — CS Fase 3: Habito (D31-D120, ~M2-M4)
 *
 * Objetivo: cliente forma habito sustentado de uso semanal + relacionamento profundo.
 * Mecanismos centrais: Resumo-sexta-17h (semanal) + EBR-audio do fundador (M3) + check-ins mensais.
 * Risco: silent churn (cliente mensal para de abrir o app e some).
 *
 * 4 lanes: Cliente · Consultora · Kaynan · Sistema
 */

export const CS_03_HABITO_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_CS03" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_CS03">
    <bpmn:participant id="Pool_CS03" name="CS Fase 3 - Habito (D31-D120) - Meta: Health &gt;=70 no M3" processRef="Process_CS03" />
  </bpmn:collaboration>
  <bpmn:process id="Process_CS03" isExecutable="false">
    <bpmn:laneSet id="LaneSet_CS03">
      <bpmn:lane id="Lane_Cliente" name="Cliente">
        <bpmn:flowNodeRef>Start_Habito</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Expansao</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Save</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Consultora" name="Consultora de Relacionamento">
        <bpmn:flowNodeRef>Task_M2Check</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ConversarNPS</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_EnviarEBR</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_M4Check</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Health</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Kaynan" name="Kaynan (Fundador)">
        <bpmn:flowNodeRef>Task_GravarEBR</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Sistema" name="Sistema (WhatsApp + CRM)">
        <bpmn:flowNodeRef>Task_ResumoSemanal</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_HealthContinuo</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_PesquisaNPS</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="Start_Habito" name="Saiu Fase 2 ativado (D31)">
      <bpmn:documentation>QUANDO: D31 (M2) - cliente saiu da Fase 2 ativado

O QUE ACONTECE
Comeca a janela de 90 dias (D31 ate D120) pra consolidar o habito de uso e criar vinculo profundo.</bpmn:documentation>
      <bpmn:outgoing>F01</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:serviceTask id="Task_ResumoSemanal" name="Resumo-sexta-17h auto (toda semana)&#10;Gancho de habito obrigatorio">
      <bpmn:documentation>QUEM FAZ: Sistema (automatico)
QUANDO: Toda sexta as 17h, sempre

O QUE FAZER
Continua mandando o resumo da semana no WhatsApp (audio + imagem).

REGRA
Se o cliente parar de abrir o resumo, e sinal de silent churn - sistema alerta a Consultora.</bpmn:documentation>
      <bpmn:incoming>F01</bpmn:incoming>
      <bpmn:outgoing>F02</bpmn:outgoing>
    </bpmn:serviceTask>

    <bpmn:serviceTask id="Task_HealthContinuo" name="Health Score continuo (semanal)&#10;Alerta consultora se cair &lt;70">
      <bpmn:documentation>QUEM FAZ: Sistema (automatico)
QUANDO: Toda semana

O QUE FAZER
Recalcula a nota de saude. Se cair abaixo de 70, alerta a Consultora. Se cair abaixo de 40, alerta o Kaynan.

ATENCAO ESPECIAL
Cliente que estava com 70+ e caiu de repente - sinal de problema, intervir rapido.</bpmn:documentation>
      <bpmn:incoming>F02</bpmn:incoming>
      <bpmn:outgoing>F03</bpmn:outgoing>
    </bpmn:serviceTask>

    <bpmn:userTask id="Task_M2Check" name="M2 (D60): Check-in WhatsApp&#10;Audio personalizado + reforco do habito sexta-17h">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D60 (M2)

O QUE FAZER
Manda audio no WhatsApp parabenizando 1 conquista que o cliente teve no mes (visto no resumo do caixa). Reforca o habito sexta-17h.

EXEMPLO DE FALA
"Oi [nome]! Vi no seu resumo de sexta que [conquista especifica - cresceu 15% no mes, etc]. Show de bola, hein. Continua nesse ritmo. Qualquer coisa me chama."

DICA
Audio, nao texto. Tom de amiga celebrando junto.</bpmn:documentation>
      <bpmn:incoming>F03</bpmn:incoming>
      <bpmn:outgoing>F04</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:serviceTask id="Task_PesquisaNPS" name="M3 (D90): Pesquisa NPS auto&#10;WhatsApp 'nota 0-10 + 1 frase'">
      <bpmn:documentation>QUEM FAZ: Sistema (automatico)
QUANDO: D90 (M3)

O QUE FAZER
Manda no WhatsApp pergunta de NPS.

MENSAGEM
"Oi [nome]! Ja sao 3 meses de Fyness juntos. De 0 a 10, quanto voce indicaria a Fyness pra um amigo dono de negocio? E em 1 frase, por que essa nota?"

COMO CLASSIFICA A RESPOSTA
- 0 a 6: detrator
- 7 ou 8: passivo
- 9 ou 10: promotor</bpmn:documentation>
      <bpmn:incoming>F04</bpmn:incoming>
      <bpmn:outgoing>F05</bpmn:outgoing>
    </bpmn:serviceTask>

    <bpmn:userTask id="Task_ConversarNPS" name="M3: Conversar com cliente sobre NPS&#10;Detrator (0-6) -&gt; escala / Passivo (7-8) -&gt; aprofundar / Promotor (9-10) -&gt; pedir feedback positivo">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: M3, DEPOIS que o cliente respondeu o NPS

O QUE FAZER
Conversa baseado na nota:

SE DETRATOR (0-6)
URGENTE. Escala Kaynan e tenta agendar ligacao.
Fala: "Oi [nome]! Recebi sua nota. Quero te ouvir, entender o que ta faltando. Posso te ligar amanha?"

SE PASSIVO (7-8)
Aprofunda em audio: "Oi [nome]! Obrigada pela nota. O que faltaria pra ser 10?"

SE PROMOTOR (9-10)
Agradece e ja semeia pra Fase 6 (Advocacy).
Fala: "Oi [nome]! Que legal! Voce ja ate sabe de algum amigo dono de negocio que voce acha que se beneficiaria?"</bpmn:documentation>
      <bpmn:incoming>F05</bpmn:incoming>
      <bpmn:outgoing>F06</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_GravarEBR" name="M3: Gravar EBR-audio 2-3min&#10;3 insights especificos do negocio do cliente + 1 pergunta poderosa">
      <bpmn:documentation>QUEM FAZ: Kaynan (fundador)
QUANDO: M3 (uma vez a cada 90 dias por cliente)

O QUE FAZER
Grava audio de 2-3min com 3 insights especificos do negocio do cliente + 1 pergunta poderosa.

EXEMPLO DE ESTRUTURA
1. "Vi que voce cresceu [X%] no trimestre - parabens"
2. "Notei que sua maior conta saindo e [categoria] - vale a pena dar uma olhada"
3. "Voce ta com [Y] reais sobrando esse mes, isso e ouro pra reinvestir"
4. Pergunta poderosa: "O que voce vai fazer com esse [Y] que ta sobrando?"

DICA
NAO e reuniao formal de 1h. E audio de 3min com olhar atento.
Custa 5min pro Kaynan. Vale ouro nesse perfil - cria reciprocidade que concorrente nao copia.</bpmn:documentation>
      <bpmn:incoming>F06</bpmn:incoming>
      <bpmn:outgoing>F07</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_EnviarEBR" name="M3: Enviar EBR-audio no WhatsApp do cliente&#10;Coletar resposta da pergunta">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: Logo apos o Kaynan gravar

O QUE FAZER
Encaminha o audio do Kaynan no WhatsApp do cliente com um contexto curto.

EXEMPLO DE FALA NO ENVIO
"Oi [nome]! O Kaynan ouviu seu caso, ele te mandou esse audio aqui. Da uma escutada quando puder, ele tem 1 perguntinha pra voce."

DEPOIS
Coleta a resposta a pergunta poderosa. Anota no CRM - vai alimentar os proximos check-ins.</bpmn:documentation>
      <bpmn:incoming>F07</bpmn:incoming>
      <bpmn:outgoing>F08</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_M4Check" name="M4 (D120): Check-in WhatsApp&#10;'Como foi o trimestre?' + identificar trigger pra Expansao">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D120 (M4)

O QUE FAZER
Check-in fechando o trimestre. Abre janela pra Fase 4 (Expansao) escutando se aconteceu algo no negocio.

PERGUNTAS A FAZER
- "Cresceu no trimestre?"
- "Contratou alguem novo?"
- "Pensou em segunda loja?"
- "Algum sistema novo querendo integrar?"

O QUE BUSCAR
Triggers naturais pra upgrade (Fase 4). Anota tudo no CRM.

EXEMPLO DE FALA
"Oi [nome]! Ja fechou seu trimestre? Conta pra mim - como foi? Cresceu, contratou alguem novo, pensou em alguma coisa pra negocio?"</bpmn:documentation>
      <bpmn:incoming>F08</bpmn:incoming>
      <bpmn:outgoing>F09</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:exclusiveGateway id="Gateway_Health" name="Health &gt;=70 no M3?">
      <bpmn:documentation>DECISAO NO M3

CRITERIO
Health Score do cliente esta &gt;=70?
- Uso regular
- Pagou em dia
- NPS &gt;=7
- Respondeu o EBR-audio do Kaynan

SIM -- vai pra Fase 4 (Expansao)
NAO -- Save Playbook do Kaynan</bpmn:documentation>
      <bpmn:incoming>F09</bpmn:incoming>
      <bpmn:outgoing>F10_Sim</bpmn:outgoing>
      <bpmn:outgoing>F10_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:endEvent id="End_Expansao" name="Pronto pra Fase 4 (Expansao)">
      <bpmn:documentation>RESULTADO BOM

Cliente formou habito + vinculo profundo. Vai pra Fase 4 (Expansao - M4 ate M11) onde sera monitorado por triggers de upgrade.</bpmn:documentation>
      <bpmn:incoming>F10_Sim</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:endEvent id="End_Save" name="Risco -&gt; Save Playbook">
      <bpmn:documentation>RESULTADO RUIM - Cliente em risco no M3

ACAO DO KAYNAN
1. Liga pessoalmente (nao a Consultora)
2. Pesquisa o negocio do cliente em profundidade (Google Maps, Instagram dele)
3. Oferece "diagnostico financeiro gratis" via video
4. Mostra 1 economia ou oportunidade concreta no caixa do cliente</bpmn:documentation>
      <bpmn:incoming>F10_Nao</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="F01" sourceRef="Start_Habito" targetRef="Task_ResumoSemanal" />
    <bpmn:sequenceFlow id="F02" sourceRef="Task_ResumoSemanal" targetRef="Task_HealthContinuo" />
    <bpmn:sequenceFlow id="F03" sourceRef="Task_HealthContinuo" targetRef="Task_M2Check" />
    <bpmn:sequenceFlow id="F04" sourceRef="Task_M2Check" targetRef="Task_PesquisaNPS" />
    <bpmn:sequenceFlow id="F05" sourceRef="Task_PesquisaNPS" targetRef="Task_ConversarNPS" />
    <bpmn:sequenceFlow id="F06" sourceRef="Task_ConversarNPS" targetRef="Task_GravarEBR" />
    <bpmn:sequenceFlow id="F07" sourceRef="Task_GravarEBR" targetRef="Task_EnviarEBR" />
    <bpmn:sequenceFlow id="F08" sourceRef="Task_EnviarEBR" targetRef="Task_M4Check" />
    <bpmn:sequenceFlow id="F09" sourceRef="Task_M4Check" targetRef="Gateway_Health" />
    <bpmn:sequenceFlow id="F10_Sim" name="Sim" sourceRef="Gateway_Health" targetRef="End_Expansao" />
    <bpmn:sequenceFlow id="F10_Nao" name="Nao" sourceRef="Gateway_Health" targetRef="End_Save" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_CS03">
    <bpmndi:BPMNPlane id="BPMNPlane_CS03" bpmnElement="Collaboration_CS03">
      <bpmndi:BPMNShape id="Pool_CS03_di" bpmnElement="Pool_CS03" isHorizontal="true">
        <dc:Bounds x="160" y="80" width="2500" height="720" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Cliente_di" bpmnElement="Lane_Cliente" isHorizontal="true">
        <dc:Bounds x="190" y="80" width="2470" height="140" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Consultora_di" bpmnElement="Lane_Consultora" isHorizontal="true">
        <dc:Bounds x="190" y="220" width="2470" height="220" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Kaynan_di" bpmnElement="Lane_Kaynan" isHorizontal="true">
        <dc:Bounds x="190" y="440" width="2470" height="140" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Sistema_di" bpmnElement="Lane_Sistema" isHorizontal="true">
        <dc:Bounds x="190" y="580" width="2470" height="220" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_Habito_di" bpmnElement="Start_Habito">
        <dc:Bounds x="240" y="132" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="210" y="175" width="100" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Expansao_di" bpmnElement="End_Expansao">
        <dc:Bounds x="2540" y="132" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2495" y="175" width="126" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Save_di" bpmnElement="End_Save">
        <dc:Bounds x="2540" y="312" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2500" y="355" width="116" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_ResumoSemanal_di" bpmnElement="Task_ResumoSemanal">
        <dc:Bounds x="320" y="650" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_HealthContinuo_di" bpmnElement="Task_HealthContinuo">
        <dc:Bounds x="580" y="650" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_PesquisaNPS_di" bpmnElement="Task_PesquisaNPS">
        <dc:Bounds x="1320" y="650" width="220" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_M2Check_di" bpmnElement="Task_M2Check">
        <dc:Bounds x="1060" y="290" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ConversarNPS_di" bpmnElement="Task_ConversarNPS">
        <dc:Bounds x="1580" y="290" width="240" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_EnviarEBR_di" bpmnElement="Task_EnviarEBR">
        <dc:Bounds x="2120" y="290" width="200" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_M4Check_di" bpmnElement="Task_M4Check">
        <dc:Bounds x="2360" y="290" width="160" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Health_di" bpmnElement="Gateway_Health" isMarkerVisible="true">
        <dc:Bounds x="2545" y="305" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2530" y="275" width="80" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_GravarEBR_di" bpmnElement="Task_GravarEBR">
        <dc:Bounds x="1860" y="470" width="220" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNEdge id="F01_di" bpmnElement="F01">
        <di:waypoint x="258" y="168" />
        <di:waypoint x="258" y="690" />
        <di:waypoint x="320" y="690" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F02_di" bpmnElement="F02">
        <di:waypoint x="540" y="690" />
        <di:waypoint x="580" y="690" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F03_di" bpmnElement="F03">
        <di:waypoint x="800" y="690" />
        <di:waypoint x="1030" y="690" />
        <di:waypoint x="1030" y="330" />
        <di:waypoint x="1060" y="330" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F04_di" bpmnElement="F04">
        <di:waypoint x="1280" y="330" />
        <di:waypoint x="1430" y="330" />
        <di:waypoint x="1430" y="650" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F05_di" bpmnElement="F05">
        <di:waypoint x="1540" y="690" />
        <di:waypoint x="1560" y="690" />
        <di:waypoint x="1560" y="330" />
        <di:waypoint x="1580" y="330" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F06_di" bpmnElement="F06">
        <di:waypoint x="1820" y="330" />
        <di:waypoint x="1970" y="330" />
        <di:waypoint x="1970" y="470" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F07_di" bpmnElement="F07">
        <di:waypoint x="2080" y="510" />
        <di:waypoint x="2210" y="510" />
        <di:waypoint x="2210" y="370" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F08_di" bpmnElement="F08">
        <di:waypoint x="2320" y="330" />
        <di:waypoint x="2360" y="330" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F09_di" bpmnElement="F09">
        <di:waypoint x="2520" y="330" />
        <di:waypoint x="2545" y="330" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F10_Sim_di" bpmnElement="F10_Sim">
        <di:waypoint x="2570" y="305" />
        <di:waypoint x="2570" y="150" />
        <di:waypoint x="2540" y="150" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2575" y="225" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F10_Nao_di" bpmnElement="F10_Nao">
        <di:waypoint x="2570" y="355" />
        <di:waypoint x="2570" y="330" />
        <di:waypoint x="2540" y="330" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2480" y="338" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

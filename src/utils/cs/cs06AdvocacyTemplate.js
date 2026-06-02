/**
 * Template BPMN 2.0 — CS Fase 6: Advocacy (M12+)
 *
 * Objetivo: transformar cliente fiel em canal de aquisicao + caso de marca.
 * Pre-requisitos: M12 atingido + renovou + NPS >=9 (promotor real).
 * Alvos: 1 indicacao/cliente/ano + 15% do novo MRR via referral + 5 cases/trimestre.
 *
 * 4 lanes: Cliente · Consultora · Kaynan · Sistema
 */

export const CS_06_ADVOCACY_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_CS06" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_CS06">
    <bpmn:participant id="Pool_CS06" name="CS Fase 6 - Advocacy (M12+) - Meta: 1 indicacao/cliente/ano + 5 cases/tri" processRef="Process_CS06" />
  </bpmn:collaboration>
  <bpmn:process id="Process_CS06" isExecutable="false">
    <bpmn:laneSet id="LaneSet_CS06">
      <bpmn:lane id="Lane_Cliente" name="Cliente Promotor">
        <bpmn:flowNodeRef>Start_Advocacy</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Promotor</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Consultora" name="Consultora de Relacionamento">
        <bpmn:flowNodeRef>Task_PedirIndicacao</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ConvidarComunidade</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_Agradecer</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Kaynan" name="Kaynan (Fundador)">
        <bpmn:flowNodeRef>Task_ConvidarCase</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_PostarCase</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Sistema" name="Sistema (CRM + WhatsApp + Asaas)">
        <bpmn:flowNodeRef>Task_MonitorarIndicacoes</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Convertida</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_AplicarDesconto</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_NPSSemestral</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="Start_Advocacy" name="M12 + renovou + NPS &gt;=9">
      <bpmn:documentation>QUANDO: Cliente que tem 3 coisas
1. Chegou no M12
2. Renovou (anual ou migrou mensal pra anual)
3. Esta com NPS &gt;=9

O QUE ACONTECE
Cliente entra como promotor real - vira candidato a indicar + virar case + entrar na comunidade.</bpmn:documentation>
      <bpmn:outgoing>F01</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:userTask id="Task_PedirIndicacao" name="Pedir indicacao personalizada&#10;'Tem amigo dono de negocio que voce acha que se beneficiaria?' (audio)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: Logo apos cliente entrar na Fase 6

O QUE FAZER
Manda audio pessoal pedindo indicacao. Usa um contexto especifico que voce ja sabe sobre o cliente.

EXEMPLO DE FALA
"Oi [nome]! Voce ja me falou da Dona Maria do salao da esquina. Acha que ela se daria bem com a Fyness? Se voce indicar pra ela e ela virar cliente, voce ganha R$50 de desconto por 3 meses - sao R$150 que voltam pro seu bolso."

A OFERTA
R$50/mes de desconto por 3 meses por cada indicacao que virar cliente pagante.</bpmn:documentation>
      <bpmn:incoming>F01</bpmn:incoming>
      <bpmn:outgoing>F02</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:serviceTask id="Task_MonitorarIndicacoes" name="Monitorar indicacoes recebidas (continuo)&#10;Tag cliente_indicador no CRM, conta conversoes">
      <bpmn:documentation>QUEM FAZ: Sistema (automatico)
QUANDO: O tempo todo

O QUE FAZER
Fica de olho em novos clientes que chegam pela origem "indicacao". Quando um chega, marca a tag de indicador no cliente que indicou.

QUANDO CONTA COMO CONVERSAO
Quando a indicacao vira cliente pagante (nao so demonstrou interesse).</bpmn:documentation>
      <bpmn:incoming>F02</bpmn:incoming>
      <bpmn:outgoing>F03</bpmn:outgoing>
    </bpmn:serviceTask>

    <bpmn:exclusiveGateway id="Gateway_Convertida" name="Indicacao convertida?">
      <bpmn:documentation>DECISAO

A indicacao virou cliente pagante?
SIM -- aplica desconto no Asaas + agradece
NAO -- mantem no fluxo (cliente continua sendo promotor, so nao converteu ainda)</bpmn:documentation>
      <bpmn:incoming>F03</bpmn:incoming>
      <bpmn:outgoing>F04_Sim</bpmn:outgoing>
      <bpmn:outgoing>F04_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:serviceTask id="Task_AplicarDesconto" name="Aplicar desconto R$50/mes x 3 meses no Asaas&#10;Notifica cliente via WhatsApp">
      <bpmn:documentation>QUEM FAZ: Sistema (automatico)
QUANDO: Indicacao virou cliente pagante

O QUE FAZER
1. Aplica desconto de R$50/mes por 3 meses no proximo ciclo de cobranca
2. Manda WhatsApp avisando o cliente

EXEMPLO DE MENSAGEM
"Oi [nome]! A Maria virou cliente da Fyness pela sua indicacao. Voce ja tem R$150 de desconto - vai aparecer na sua proxima fatura. Obrigada por confiar na gente!"</bpmn:documentation>
      <bpmn:incoming>F04_Sim</bpmn:incoming>
      <bpmn:outgoing>F05</bpmn:outgoing>
    </bpmn:serviceTask>

    <bpmn:userTask id="Task_Agradecer" name="Agradecer + reforcar pra proxima indicacao&#10;Audio personalizado + visibilidade publica (story/post)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: Logo apos o desconto aplicar

O QUE FAZER
1. Audio personalizado de agradecimento
2. Posta no Instagram da Fyness mencionando o cliente (se ele autorizar)

EXEMPLO DE FALA NO AUDIO
"Oi [nome]! Que orgulho receber a Maria aqui na Fyness pela sua indicacao. Voce nao imagina o quanto isso significa pra gente. Sempre que voce conhecer mais alguem que precise, manda pra mim - voce ja sabe que da certo!"

POR QUE PEDIR DE NOVO
Cliente que indicou uma vez, indica mais.</bpmn:documentation>
      <bpmn:incoming>F05</bpmn:incoming>
      <bpmn:outgoing>F06</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_ConvidarCase" name="Convidar pra case study&#10;Gravar video depoimento 60-90s ou texto + foto">
      <bpmn:documentation>QUEM FAZ: Kaynan (fundador)
QUANDO: Apos cliente indicar e a indicacao converter

O QUE FAZER
Manda audio convidando pra gravar case.

FORMATOS POSSIVEIS
- Video depoimento de 60-90s no proprio negocio (preferido)
- Texto + foto (alternativa)
- Pode ate visitar o cliente se for relevante

EXEMPLO DE FALA NO AUDIO
"E ai [nome]! Aqui e o Kaynan. Sua historia com a Fyness e linda. Topa gravar um videozinho de 1 minuto pra mim, contando seu antes e depois? Voce escolhe o dia, podemos gravar pelo proprio WhatsApp."</bpmn:documentation>
      <bpmn:incoming>F06</bpmn:incoming>
      <bpmn:outgoing>F07</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_PostarCase" name="Postar case nos canais Fyness&#10;LP + redes + comunidade + email pra base">
      <bpmn:documentation>QUEM FAZ: Kaynan + time de marketing
QUANDO: Apos o cliente gravar o case

O QUE FAZER
Posta o case em:
- Landing page (secao "quem confia na Fyness")
- Redes sociais (Instagram, TikTok, YouTube)
- Comunidade Fyness
- Email pra base de clientes

DICAS
- Sempre marca o cliente no post (visibilidade pra ele tambem)
- Cada case rende em media 3-5 leads novos</bpmn:documentation>
      <bpmn:incoming>F07</bpmn:incoming>
      <bpmn:outgoing>F08</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_ConvidarComunidade" name="Convidar pra Comunidade Fyness&#10;Grupo WhatsApp/Telegram exclusivo de clientes promotores">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: Cliente ja virou case

O QUE FAZER
Convida formalmente pra entrar na Comunidade Fyness (grupo de WhatsApp ou Telegram com 30 a 100 clientes promotores).

O QUE A COMUNIDADE OFERECE
- Trocas entre os proprios clientes
- Acesso prioritario ao Kaynan
- Eventos online exclusivos
- Beta de features novas

EXEMPLO DE FALA
"Oi [nome]! Quero te convidar pra um grupo nosso so de clientes mais proximos. Voce ganha acesso direto ao Kaynan, eventos exclusivos e troca ideias com outros donos de negocio que tao bombando."

POR QUE FAZER
Cria sensacao de "elite" + dificulta saida psicologica.</bpmn:documentation>
      <bpmn:incoming>F08</bpmn:incoming>
      <bpmn:outgoing>F09</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:serviceTask id="Task_NPSSemestral" name="Pesquisa NPS semestral auto&#10;Reconfirma status de promotor (NPS &gt;=9)">
      <bpmn:documentation>QUEM FAZ: Sistema (automatico)
QUANDO: A cada 6 meses

O QUE FAZER
Manda pesquisa NPS pra confirmar que o cliente ainda e promotor.

COMO ROTEAR A RESPOSTA
- NPS continua &gt;=9: mantem na Fase 6 (tudo ok)
- NPS caiu pra 7-8: volta pra Fase 3 (Habito) com check-in mais intenso
- NPS caiu pra &lt;=6: URGENTE - Save Playbook do Kaynan. Promotor que virou detrator tem causa que precisa ser entendida AGORA.</bpmn:documentation>
      <bpmn:incoming>F09</bpmn:incoming>
      <bpmn:incoming>F04_Nao</bpmn:incoming>
      <bpmn:outgoing>F10</bpmn:outgoing>
    </bpmn:serviceTask>

    <bpmn:endEvent id="End_Promotor" name="Cliente promotor ativo&#10;Long-term 3+ anos (CS Macro fechado)">
      <bpmn:documentation>RESULTADO FINAL DO CICLO

Cliente promotor ativo:
- Renova todo ano
- Indica amigos
- Virou case publico
- Esta na comunidade

VALOR
Esse cliente sustenta o crescimento da Fyness sem voce gastar com marketing. Vale 5 a 10 vezes o cliente medio.</bpmn:documentation>
      <bpmn:incoming>F10</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="F01" sourceRef="Start_Advocacy" targetRef="Task_PedirIndicacao" />
    <bpmn:sequenceFlow id="F02" sourceRef="Task_PedirIndicacao" targetRef="Task_MonitorarIndicacoes" />
    <bpmn:sequenceFlow id="F03" sourceRef="Task_MonitorarIndicacoes" targetRef="Gateway_Convertida" />
    <bpmn:sequenceFlow id="F04_Sim" name="Sim" sourceRef="Gateway_Convertida" targetRef="Task_AplicarDesconto" />
    <bpmn:sequenceFlow id="F04_Nao" name="Nao" sourceRef="Gateway_Convertida" targetRef="Task_NPSSemestral" />
    <bpmn:sequenceFlow id="F05" sourceRef="Task_AplicarDesconto" targetRef="Task_Agradecer" />
    <bpmn:sequenceFlow id="F06" sourceRef="Task_Agradecer" targetRef="Task_ConvidarCase" />
    <bpmn:sequenceFlow id="F07" sourceRef="Task_ConvidarCase" targetRef="Task_PostarCase" />
    <bpmn:sequenceFlow id="F08" sourceRef="Task_PostarCase" targetRef="Task_ConvidarComunidade" />
    <bpmn:sequenceFlow id="F09" sourceRef="Task_ConvidarComunidade" targetRef="Task_NPSSemestral" />
    <bpmn:sequenceFlow id="F10" sourceRef="Task_NPSSemestral" targetRef="End_Promotor" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_CS06">
    <bpmndi:BPMNPlane id="BPMNPlane_CS06" bpmnElement="Collaboration_CS06">
      <bpmndi:BPMNShape id="Pool_CS06_di" bpmnElement="Pool_CS06" isHorizontal="true">
        <dc:Bounds x="160" y="80" width="2400" height="720" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Cliente_di" bpmnElement="Lane_Cliente" isHorizontal="true">
        <dc:Bounds x="190" y="80" width="2370" height="120" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Consultora_di" bpmnElement="Lane_Consultora" isHorizontal="true">
        <dc:Bounds x="190" y="200" width="2370" height="200" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Kaynan_di" bpmnElement="Lane_Kaynan" isHorizontal="true">
        <dc:Bounds x="190" y="400" width="2370" height="180" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Sistema_di" bpmnElement="Lane_Sistema" isHorizontal="true">
        <dc:Bounds x="190" y="580" width="2370" height="220" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_Advocacy_di" bpmnElement="Start_Advocacy">
        <dc:Bounds x="240" y="122" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="200" y="165" width="116" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Promotor_di" bpmnElement="End_Promotor">
        <dc:Bounds x="2460" y="122" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2410" y="165" width="136" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_PedirIndicacao_di" bpmnElement="Task_PedirIndicacao">
        <dc:Bounds x="320" y="260" width="240" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Agradecer_di" bpmnElement="Task_Agradecer">
        <dc:Bounds x="1100" y="260" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ConvidarComunidade_di" bpmnElement="Task_ConvidarComunidade">
        <dc:Bounds x="1900" y="260" width="240" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_ConvidarCase_di" bpmnElement="Task_ConvidarCase">
        <dc:Bounds x="1380" y="460" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_PostarCase_di" bpmnElement="Task_PostarCase">
        <dc:Bounds x="1640" y="460" width="220" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_MonitorarIndicacoes_di" bpmnElement="Task_MonitorarIndicacoes">
        <dc:Bounds x="620" y="640" width="240" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Convertida_di" bpmnElement="Gateway_Convertida" isMarkerVisible="true">
        <dc:Bounds x="900" y="655" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="880" y="715" width="100" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_AplicarDesconto_di" bpmnElement="Task_AplicarDesconto">
        <dc:Bounds x="990" y="640" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_NPSSemestral_di" bpmnElement="Task_NPSSemestral">
        <dc:Bounds x="2200" y="640" width="220" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNEdge id="F01_di" bpmnElement="F01">
        <di:waypoint x="258" y="158" />
        <di:waypoint x="258" y="300" />
        <di:waypoint x="320" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F02_di" bpmnElement="F02">
        <di:waypoint x="560" y="300" />
        <di:waypoint x="600" y="300" />
        <di:waypoint x="600" y="680" />
        <di:waypoint x="620" y="680" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F03_di" bpmnElement="F03">
        <di:waypoint x="860" y="680" />
        <di:waypoint x="900" y="680" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F04_Sim_di" bpmnElement="F04_Sim">
        <di:waypoint x="950" y="680" />
        <di:waypoint x="990" y="680" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="958" y="662" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F04_Nao_di" bpmnElement="F04_Nao">
        <di:waypoint x="925" y="705" />
        <di:waypoint x="925" y="760" />
        <di:waypoint x="2310" y="760" />
        <di:waypoint x="2310" y="720" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="930" y="730" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F05_di" bpmnElement="F05">
        <di:waypoint x="1210" y="680" />
        <di:waypoint x="1245" y="680" />
        <di:waypoint x="1245" y="300" />
        <di:waypoint x="1100" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F06_di" bpmnElement="F06">
        <di:waypoint x="1320" y="300" />
        <di:waypoint x="1490" y="300" />
        <di:waypoint x="1490" y="460" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F07_di" bpmnElement="F07">
        <di:waypoint x="1600" y="500" />
        <di:waypoint x="1640" y="500" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F08_di" bpmnElement="F08">
        <di:waypoint x="1860" y="500" />
        <di:waypoint x="2010" y="500" />
        <di:waypoint x="2010" y="300" />
        <di:waypoint x="1900" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F09_di" bpmnElement="F09">
        <di:waypoint x="2140" y="300" />
        <di:waypoint x="2310" y="300" />
        <di:waypoint x="2310" y="640" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F10_di" bpmnElement="F10">
        <di:waypoint x="2420" y="680" />
        <di:waypoint x="2478" y="680" />
        <di:waypoint x="2478" y="158" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

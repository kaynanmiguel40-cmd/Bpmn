/**
 * Template BPMN 2.0 — Cadencia de Inbound Organico (9 toques em 14 dias)
 *
 * Aplicacao: lead que veio do organico — DM no Instagram/TikTok, formulario do site,
 * comentario em post, etc. Demonstrou interesse ATIVO (nao foi voce que abordou).
 *
 * Diferenca-chave: tom EDUCATIVO, nao comercial. Lead se auto-qualificou um pouco,
 * mas ainda esta em duvida. Forcar venda agora queima a relacao.
 */

export const CADENCIA_INBOUND_ORGANICO_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_CadInb" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collab_Inb">
    <bpmn:participant id="Pool_Inb" name="Cadencia de Inbound Organico - 9 toques em 14 dias (educativo)" processRef="Process_Inb" />
  </bpmn:collaboration>
  <bpmn:process id="Process_Inb" isExecutable="false">
    <bpmn:laneSet id="Lanes_Inb">
      <bpmn:lane id="Lane_Vendas" name="Voce (Consultora)">
        <bpmn:flowNodeRef>T01_D0_DM</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T02_D1_Educativo</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T03_D2_Pergunta</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T04_D4_VideoCliente</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T05_D6_Lig1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T07_D10_Lig2</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T08_D12_Educativo2</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T09_D14_Final</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Respondeu</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Kaynan" name="Kaynan (Fundador)">
        <bpmn:flowNodeRef>T06_D8_KaynanAudio</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Cliente" name="Cliente (veio do Instagram/TikTok/Site)">
        <bpmn:flowNodeRef>Start_Inbound</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Oportunidade</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Standby</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="Start_Inbound" name="Lead veio do organico&#10;(DM/formulario/comentario)">
      <bpmn:documentation>QUANDO: Cliente mandou DM no Instagram/TikTok, preencheu form no site, comentou em post, etc.

REGRA DE SPEED
Resposta em ATE 24h. Se demorar 3 dias, ele esfriou. Em ate 2h e o ideal.

CANAL DE SAIDA
SEMPRE responde no MESMO canal que ele veio (DM Insta = DM Insta, form do site = WhatsApp se ele deixou). Trocar canal cria atrito.</bpmn:documentation>
      <bpmn:outgoing>F01</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:userTask id="T01_D0_DM" name="D0 - Responde no mesmo canal&#10;Audio se apresentando + agradece interesse">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D0 em ate 2h depois do contato

O QUE FAZER
Responde no MESMO canal que ele entrou. Audio se possivel. Tom de amigo, nao de vendedor.

EXEMPLO DE FALA (DM Instagram)
"Oi [nome]! Que legal que voce chegou aqui. Vi que voce manda no Insta de [tipo de negocio]. Olha, antes de eu te explicar a Fyness, me conta: o que te chamou atencao? Foi alguma duvida especifica que voce ta tentando resolver no seu negocio?"

DICA
Pergunta antes de vender. Ele se auto-qualificou - aprofunda.</bpmn:documentation>
      <bpmn:incoming>F01</bpmn:incoming>
      <bpmn:outgoing>F02</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T02_D1_Educativo" name="D1 - Material educativo&#10;Cartilha 1 pagina OU video 90s explicativo">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D1 (manha ou tarde)

O QUE FAZER
Manda algo EDUCATIVO no canal dele (NAO pitch de venda). Pode ser:
- Cartilha 1 pagina "como controlar caixa em 5min/dia"
- Video curto (90s) explicando 1 problema comum + a solucao

EXEMPLO DE FALA AO ENVIAR
"Oi [nome]! Te mando isso aqui pra voce dar uma olhada. Nao precisa responder agora - so quero te ajudar a clarear a ideia."

DICA
"Nao precisa responder agora" tira pressao. Ele consome o conteudo e vem por curiosidade.</bpmn:documentation>
      <bpmn:incoming>F02</bpmn:incoming>
      <bpmn:outgoing>F03</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T03_D2_Pergunta" name="D2 - Pergunta de baixo atrito&#10;Curta, sem pedir resposta longa">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D2

O QUE FAZER
Pergunta CURTA que ele responde em 1 frase ou emoji.

EXEMPLOS DE PERGUNTA
- "Voce ja tentou alguma ferramenta de financas antes ou ta no caderno mesmo?"
- "Quantos funcionarios voce tem hoje?"
- "Seu negocio e mais venda no balcao ou voce faz entrega tambem?"

DICA
Pergunta que NAO pede compromisso ja semeia a conversa. Ele responde 1 emoji + texto curto = conversa aberta.</bpmn:documentation>
      <bpmn:incoming>F03</bpmn:incoming>
      <bpmn:outgoing>F04</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T04_D4_VideoCliente" name="D4 - Video de cliente real&#10;Depoimento 60-90s formato vertical">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D4

O QUE FAZER
Manda video de outro cliente do MESMO PERFIL (padaria pra padaria, salao pra salao). Autoridade social fala mais que pitch.

EXEMPLO DE FALA
"Oi [nome]! Lembrei que voce mencionou [algo dele]. Olha esse video aqui da Dona Maria do salao - ela passou pelo mesmo que voce ta passando. Te marca alguma coisa?"

DICA
Conectar o video ao que ELE falou no D0/D2 fecha o cerco. "Voce me falou X, esse cliente passou pela mesma situacao".</bpmn:documentation>
      <bpmn:incoming>F04</bpmn:incoming>
      <bpmn:outgoing>F05</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T05_D6_Lig1" name="D6 - 10h&#10;Primeira ligacao (consensual)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D6 entre 10h e 11h

O QUE FAZER
Primeira ligacao - mas avisa ANTES por WhatsApp. Inbound aceita ligacao SO se for combinada.

EXEMPLO DE FALA NO WHATSAPP ANTES (no proprio D6)
"Oi [nome]! Posso te ligar hoje pra gente conversar 5 minutos? Manha (10h) ou tarde (18h) te funciona melhor?"

SE ELE RESPONDER COM HORARIO
Liga no horario certinho.

SE NAO RESPONDER
NAO liga sem aviso. Segue pra D8 (audio Kaynan) e tenta de novo em outra hora.</bpmn:documentation>
      <bpmn:incoming>F05</bpmn:incoming>
      <bpmn:outgoing>F06</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T06_D8_KaynanAudio" name="D8 - 17h&#10;Audio do Kaynan (fundador)">
      <bpmn:documentation>QUEM FAZ: KAYNAN (fundador)
QUANDO: D8 por volta das 17h

O QUE FAZER
Audio pessoal do dono. Tom diferente da consultora - mais "olhar nos olhos".

EXEMPLO DE FALA
"E ai [nome], aqui e o Kaynan, dono da Fyness. Vi que voce ta interagindo com a gente faz uns dias. Olha, eu mesmo posso te explicar em 10 minutos se voce me chamar aqui. Sem compromisso - se nao for pra voce, ta tudo bem."

DICA
"Sem compromisso" tira pressao. Inbound responde melhor a postura nao-comercial.</bpmn:documentation>
      <bpmn:incoming>F06</bpmn:incoming>
      <bpmn:outgoing>F07</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T07_D10_Lig2" name="D10 - 18h&#10;Segunda ligacao (com aviso previo)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D10, com aviso de WhatsApp 1h antes

O QUE FAZER
Aviso por WhatsApp + ligacao no horario combinado.

WHATSAPP DE AVISO
"Oi [nome]! Pra fechar a semana, posso te ligar as 18h hoje? 10 minutinhos."

SE ELE NAO RESPONDER O AVISO
Liga assim mesmo. Inbound aceita 1 ligacao "espontanea" sem virar invasao. Mas SO 1.</bpmn:documentation>
      <bpmn:incoming>F07</bpmn:incoming>
      <bpmn:outgoing>F08</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T08_D12_Educativo2" name="D12 - Material educativo 2&#10;Caso de uso especifico do perfil dele">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D12

O QUE FAZER
Segundo material educativo, dessa vez ESPECIFICO pra ele.
- Se padaria: "Como o seu Joao da padaria do Centro descobriu que perdia R$2k/mes em desperdicio"
- Se salao: "Como a Dona Maria controla comissao automatica das 4 funcionarias"
- Se restaurante: idem

EXEMPLO DE FALA
"Oi [nome]! Como voce me falou que era de [tipo de negocio], te mando esse caso bem especifico aqui. Acho que voce vai se ver nesse caso."

DICA
Personalizacao por perfil aumenta abertura em ~50%.</bpmn:documentation>
      <bpmn:incoming>F08</bpmn:incoming>
      <bpmn:outgoing>F09</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T09_D14_Final" name="D14 - 19h&#10;Ligacao final + WhatsApp despedida">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D14

O QUE FAZER
Ligacao final + WhatsApp de despedida.

EXEMPLO DE FALA NA LIGACAO
"Oi [nome]! Boa noite, aqui e a [consultora]. Voce procurou a Fyness ha 2 semanas e a gente conversou um pouco. Quero so saber: faz sentido pra voce ou nao? Sem problema seja qual for a resposta."

WHATSAPP APOS LIGACAO
"Oi [nome], obrigada pelo interesse. Vou parar de te chamar pra nao te incomodar. Sempre que precisar, me chama aqui."

DICA
Inbound tem culpa maior de "nao responder" que outros canais (afinal ELE procurou). Despedida ativa essa culpa - taxa de resposta no toque final e mais alta aqui que em outros canais.</bpmn:documentation>
      <bpmn:incoming>F09</bpmn:incoming>
      <bpmn:outgoing>F10</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:exclusiveGateway id="Gateway_Respondeu" name="Respondeu em algum toque?">
      <bpmn:documentation>SIM -- abre oportunidade
NAO -- stand-by 90 dias + adiciona em lista de remarketing (cliente ja te conhece, anuncio remarketing converte 5x mais)</bpmn:documentation>
      <bpmn:incoming>F10</bpmn:incoming>
      <bpmn:outgoing>F11_Sim</bpmn:outgoing>
      <bpmn:outgoing>F11_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:endEvent id="End_Oportunidade" name="Oportunidade aberta&#10;Agenda demo 15min">
      <bpmn:documentation>RESULTADO BOM - lead inbound convertido. Pipeline ativo.</bpmn:documentation>
      <bpmn:incoming>F11_Sim</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:endEvent id="End_Standby" name="Stand-by 90 dias&#10;+ adiciona em remarketing pago">
      <bpmn:documentation>NAO RESPONDEU APOS 9 TOQUES

ACAO ESPECIAL DESSE CANAL
Inbound que nao converteu ja conhece a marca - adiciona em audiencia de remarketing (Meta/Google) pra alimentar com anuncio quando rodar canal pago. Converte 5x mais que lead frio.

REATIVA com mensagem nova em 90d.</bpmn:documentation>
      <bpmn:incoming>F11_Nao</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="F01" sourceRef="Start_Inbound" targetRef="T01_D0_DM" />
    <bpmn:sequenceFlow id="F02" sourceRef="T01_D0_DM" targetRef="T02_D1_Educativo" />
    <bpmn:sequenceFlow id="F03" sourceRef="T02_D1_Educativo" targetRef="T03_D2_Pergunta" />
    <bpmn:sequenceFlow id="F04" sourceRef="T03_D2_Pergunta" targetRef="T04_D4_VideoCliente" />
    <bpmn:sequenceFlow id="F05" sourceRef="T04_D4_VideoCliente" targetRef="T05_D6_Lig1" />
    <bpmn:sequenceFlow id="F06" sourceRef="T05_D6_Lig1" targetRef="T06_D8_KaynanAudio" />
    <bpmn:sequenceFlow id="F07" sourceRef="T06_D8_KaynanAudio" targetRef="T07_D10_Lig2" />
    <bpmn:sequenceFlow id="F08" sourceRef="T07_D10_Lig2" targetRef="T08_D12_Educativo2" />
    <bpmn:sequenceFlow id="F09" sourceRef="T08_D12_Educativo2" targetRef="T09_D14_Final" />
    <bpmn:sequenceFlow id="F10" sourceRef="T09_D14_Final" targetRef="Gateway_Respondeu" />
    <bpmn:sequenceFlow id="F11_Sim" name="Sim" sourceRef="Gateway_Respondeu" targetRef="End_Oportunidade" />
    <bpmn:sequenceFlow id="F11_Nao" name="Nao" sourceRef="Gateway_Respondeu" targetRef="End_Standby" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="Diag_Inb">
    <bpmndi:BPMNPlane id="Plane_Inb" bpmnElement="Collab_Inb">
      <bpmndi:BPMNShape id="Pool_Inb_di" bpmnElement="Pool_Inb" isHorizontal="true">
        <dc:Bounds x="160" y="80" width="2500" height="560" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Vendas_di" bpmnElement="Lane_Vendas" isHorizontal="true">
        <dc:Bounds x="190" y="80" width="2470" height="240" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Kaynan_di" bpmnElement="Lane_Kaynan" isHorizontal="true">
        <dc:Bounds x="190" y="320" width="2470" height="140" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Cliente_di" bpmnElement="Lane_Cliente" isHorizontal="true">
        <dc:Bounds x="190" y="460" width="2470" height="180" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_Inbound_di" bpmnElement="Start_Inbound">
        <dc:Bounds x="240" y="532" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="200" y="575" width="116" height="40" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Oportunidade_di" bpmnElement="End_Oportunidade">
        <dc:Bounds x="2560" y="510" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="2515" y="553" width="126" height="40" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Standby_di" bpmnElement="End_Standby">
        <dc:Bounds x="2560" y="580" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="2515" y="620" width="126" height="40" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="T01_D0_DM_di" bpmnElement="T01_D0_DM"><dc:Bounds x="320" y="160" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T02_D1_Educativo_di" bpmnElement="T02_D1_Educativo"><dc:Bounds x="540" y="160" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T03_D2_Pergunta_di" bpmnElement="T03_D2_Pergunta"><dc:Bounds x="760" y="160" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T04_D4_VideoCliente_di" bpmnElement="T04_D4_VideoCliente"><dc:Bounds x="980" y="160" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T05_D6_Lig1_di" bpmnElement="T05_D6_Lig1"><dc:Bounds x="1200" y="160" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T06_D8_KaynanAudio_di" bpmnElement="T06_D8_KaynanAudio"><dc:Bounds x="1420" y="350" width="200" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T07_D10_Lig2_di" bpmnElement="T07_D10_Lig2"><dc:Bounds x="1660" y="160" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T08_D12_Educativo2_di" bpmnElement="T08_D12_Educativo2"><dc:Bounds x="1880" y="160" width="200" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T09_D14_Final_di" bpmnElement="T09_D14_Final"><dc:Bounds x="2120" y="160" width="220" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Respondeu_di" bpmnElement="Gateway_Respondeu" isMarkerVisible="true"><dc:Bounds x="2380" y="175" width="50" height="50" /><bpmndi:BPMNLabel><dc:Bounds x="2365" y="135" width="80" height="27" /></bpmndi:BPMNLabel></bpmndi:BPMNShape>

      <bpmndi:BPMNEdge id="F01_di" bpmnElement="F01"><di:waypoint x="258" y="532" /><di:waypoint x="258" y="200" /><di:waypoint x="320" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F02_di" bpmnElement="F02"><di:waypoint x="500" y="200" /><di:waypoint x="540" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F03_di" bpmnElement="F03"><di:waypoint x="720" y="200" /><di:waypoint x="760" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F04_di" bpmnElement="F04"><di:waypoint x="940" y="200" /><di:waypoint x="980" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F05_di" bpmnElement="F05"><di:waypoint x="1160" y="200" /><di:waypoint x="1200" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F06_di" bpmnElement="F06"><di:waypoint x="1380" y="200" /><di:waypoint x="1520" y="200" /><di:waypoint x="1520" y="350" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F07_di" bpmnElement="F07"><di:waypoint x="1620" y="390" /><di:waypoint x="1750" y="390" /><di:waypoint x="1750" y="240" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F08_di" bpmnElement="F08"><di:waypoint x="1840" y="200" /><di:waypoint x="1880" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F09_di" bpmnElement="F09"><di:waypoint x="2080" y="200" /><di:waypoint x="2120" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F10_di" bpmnElement="F10"><di:waypoint x="2340" y="200" /><di:waypoint x="2380" y="200" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F11_Sim_di" bpmnElement="F11_Sim"><di:waypoint x="2405" y="225" /><di:waypoint x="2405" y="528" /><di:waypoint x="2560" y="528" /><bpmndi:BPMNLabel><dc:Bounds x="2410" y="375" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F11_Nao_di" bpmnElement="F11_Nao"><di:waypoint x="2430" y="200" /><di:waypoint x="2480" y="200" /><di:waypoint x="2480" y="598" /><di:waypoint x="2560" y="598" /><bpmndi:BPMNLabel><dc:Bounds x="2485" y="400" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

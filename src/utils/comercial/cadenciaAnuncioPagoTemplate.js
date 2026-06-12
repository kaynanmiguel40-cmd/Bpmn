/**
 * Template BPMN 2.0 — Cadencia de Anuncio Pago (7 toques em 7 dias)
 *
 * Aplicacao: lead que clicou em anuncio (Meta Ads, Google Ads) e preencheu form
 * ou abriu conversa no WhatsApp.
 *
 * Diferenca-chave: SPEED-TO-LEAD CRITICO. Janela quente e de 15min ate 2h.
 * Cada minuto perdido derruba conversao em 5-10%. Cadencia curta e agressiva.
 */

export const CADENCIA_ANUNCIO_PAGO_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_CadAds" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collab_Ads">
    <bpmn:participant id="Pool_Ads" name="Cadencia de Anuncio Pago - 7 toques em 7 dias (SPEED-TO-LEAD)" processRef="Process_Ads" />
  </bpmn:collaboration>
  <bpmn:process id="Process_Ads" isExecutable="false">
    <bpmn:laneSet id="Lanes_Ads">
      <bpmn:lane id="Lane_Sistema" name="Sistema (automacao)">
        <bpmn:flowNodeRef>T01_15min_WppAuto</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Vendas" name="Voce (Consultora) - speed urgente">
        <bpmn:flowNodeRef>T02_D0_Lig1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T03_D0_Lig2</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T04_D0_Lig3</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T05_D1_Lig4</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T06_D2_Wpp</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T07_D4_Lig5</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T08_D7_Final</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Respondeu</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Cliente" name="Cliente (clicou no anuncio)">
        <bpmn:flowNodeRef>Start_Click</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Oportunidade</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Standby</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="Start_Click" name="Cliente clicou no anuncio + preencheu form">
      <bpmn:documentation>QUANDO: Cliente clicou em anuncio Meta/Google e preencheu formulario OU abriu conversa no WhatsApp via clique no anuncio

REGRA CRITICA - SPEED TO LEAD
- 0-5min: conversao maxima (~50% maior)
- 5-15min: conversao alta
- 15min-1h: cai 30%
- 1h-24h: cai 70%
- 24h+: lead frio, queimou

DADO REAL: empresas que respondem em &lt;5min convertem 8x mais que &lt;1h.</bpmn:documentation>
      <bpmn:outgoing>F01</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:serviceTask id="T01_15min_WppAuto" name="0-15min - WhatsApp automatico&#10;Avisa que vai chamar AGORA">
      <bpmn:documentation>QUEM FAZ: Sistema (automatico)
QUANDO: Em ate 15min depois do click - automacao do CRM dispara

O QUE FAZER
Manda WhatsApp automatico avisando que voce vai ligar:

MENSAGEM
"Oi [nome]! Acabei de ver que voce se interessou pela Fyness. Vou te ligar agora pra tirar suas duvidas. Se nao puder atender, me avisa o melhor horario!"

POR QUE
Quebra o "estranhamento" da ligacao surpresa + cria expectativa positiva. Sem isso, o cliente ignora ligacao desconhecida.</bpmn:documentation>
      <bpmn:incoming>F01</bpmn:incoming>
      <bpmn:outgoing>F02</bpmn:outgoing>
    </bpmn:serviceTask>

    <bpmn:userTask id="T02_D0_Lig1" name="D0 +15min - Ligacao 1&#10;LIGUE AGORA (speed critico)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D0, dentro dos 15 minutos do click

O QUE FAZER
LIGUE AGORA. Nao espera "horario certo". E AGORA.

EXEMPLO DE FALA SE ATENDER
"Oi [nome]! Aqui e a [consultora] da Fyness. Acabei de ver que voce mostrou interesse no nosso anuncio. Tem 3 minutinhos pra eu te explicar o que somos e ver se faz sentido pra voce? Se rolar, te marco uma conversa mais demorada depois."

DICA CRITICA
NAO marca demo agora - QUALIFICA agora. 3 perguntas:
1. Qual seu negocio?
2. Voce ja usa alguma ferramenta de financas hoje?
3. O que te chamou atencao no anuncio?

Em 3min voce decide se ele e ICP. Se for, ja agenda demo de 15min.</bpmn:documentation>
      <bpmn:incoming>F02</bpmn:incoming>
      <bpmn:outgoing>F03</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T03_D0_Lig2" name="D0 +1h - Ligacao 2&#10;Se nao atendeu a primeira">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D0, 1h depois da primeira ligacao

O QUE FAZER
Tenta de novo 1h depois. Lead ainda esta quente nessa janela.

EXEMPLO DE FALA SE ATENDER
"Oi [nome]! Aqui e a [consultora] de novo - te procurei mais cedo. Da pra falar agora 3 minutinhos?"

SE NAO ATENDER
Deixa voicemail curto: "Oi [nome], aqui e a [consultora] da Fyness. Te liguei pq voce mostrou interesse no nosso anuncio. Me chama no WhatsApp quando puder."</bpmn:documentation>
      <bpmn:incoming>F03</bpmn:incoming>
      <bpmn:outgoing>F04</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T04_D0_Lig3" name="D0 +5h - Ligacao 3&#10;Tarde do mesmo dia">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D0, 5h depois da primeira

O QUE FAZER
Terceira tentativa no MESMO DIA - lead ainda esta quente. Janela diferente (tarde se manha, manha se tarde).

EXEMPLO DE FALA
"Oi [nome]! Aqui e a [consultora] da Fyness. Pego voce ai? Te procurei umas vezes hoje - rapidao, 3 minutos."

REGRA DE OURO
3 ligacoes no MESMO DIA pra anuncio pago. Nao espera amanha.</bpmn:documentation>
      <bpmn:incoming>F04</bpmn:incoming>
      <bpmn:outgoing>F05</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T05_D1_Lig4" name="D1 - manha&#10;Ligacao 4 (segundo dia)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D1 entre 9h e 11h

O QUE FAZER
Quarta ligacao no dia seguinte. Lead ainda esta na janela quente (24h).

EXEMPLO DE FALA SE ATENDER
"Oi [nome]! Bom dia, aqui e a [consultora]. Sou da Fyness - voce clicou no anuncio ontem. Tem 3 minutinhos pra eu te explicar o que e?"

SE NAO ATENDER
Sem voicemail. Segue pra D2 WhatsApp.</bpmn:documentation>
      <bpmn:incoming>F05</bpmn:incoming>
      <bpmn:outgoing>F06</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T06_D2_Wpp" name="D2 - WhatsApp&#10;Lembra interesse + visual">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D2

O QUE FAZER
WhatsApp com 1 imagem da Fyness + lembrete do interesse.

EXEMPLO DE FALA
"Oi [nome]! Voce clicou no nosso anuncio essa semana e a gente nao conseguiu se falar ainda. Te mando aqui em 1 imagem o que a Fyness faz - da uma olhada quando der tempo. Qualquer duvida, me chama."

DICA
Sem cobrar resposta. So lembra que existe.</bpmn:documentation>
      <bpmn:incoming>F06</bpmn:incoming>
      <bpmn:outgoing>F07</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T07_D4_Lig5" name="D4 - 18h&#10;Ligacao 5 (penultima)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D4 por volta das 18h

O QUE FAZER
Quinta ligacao. Tom mais direto - lead esta esfriando.

EXEMPLO DE FALA SE ATENDER
"Oi [nome]! Aqui e a [consultora] da Fyness. Te procurei umas vezes essa semana. Voce ainda quer saber sobre a gente ou nao e o momento?"

DICA
Pergunta direta. Anuncio pago atrai curiosos - filtra rapido quem nao tem real interesse.</bpmn:documentation>
      <bpmn:incoming>F07</bpmn:incoming>
      <bpmn:outgoing>F08</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T08_D7_Final" name="D7 - 19h&#10;Ligacao 6 + WhatsApp despedida">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D7

O QUE FAZER
Ultima ligacao + WhatsApp final.

EXEMPLO DE FALA NA LIGACAO
"Oi [nome]! Boa noite. Aqui e a [consultora] da Fyness - ultima vez que te procuro. Faz sentido conversarmos ou pode marcar como 'nao agora'?"

WHATSAPP APOS LIGACAO
"Oi [nome], obrigada pelo interesse no nosso anuncio. Vou parar de te chamar pra nao incomodar. Quando precisar, me chama aqui. Abraco!"</bpmn:documentation>
      <bpmn:incoming>F08</bpmn:incoming>
      <bpmn:outgoing>F09</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:exclusiveGateway id="Gateway_Respondeu" name="Respondeu em algum toque?">
      <bpmn:documentation>SIM -- abre oportunidade
NAO -- stand-by 60 dias + KEEPS NA AUDIENCIA DE REMARKETING (anuncio "voce mostrou interesse antes, volta agora" converte muito mais que 1o impact)

ALERTA DE QUALIDADE DO ANUNCIO
Se MUITOS leads desse anuncio nao respondem nem ao D7 final, o anuncio esta atraindo o ICP errado. Revisa criativos/segmentacao.</bpmn:documentation>
      <bpmn:incoming>F09</bpmn:incoming>
      <bpmn:outgoing>F10_Sim</bpmn:outgoing>
      <bpmn:outgoing>F10_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:endEvent id="End_Oportunidade" name="Oportunidade aberta&#10;Agenda demo 15min">
      <bpmn:documentation>RESULTADO BOM

REGRA DE TRACKING
Marca esse cliente como "veio de anuncio X" no CRM - alimenta calculo de CAC do canal pago.</bpmn:documentation>
      <bpmn:incoming>F10_Sim</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:endEvent id="End_Standby" name="Stand-by 60d + remarketing&#10;Alerta de CPL se for padrao">
      <bpmn:documentation>NAO RESPONDEU

ACOES
1. Stand-by 60 dias
2. Mantem em audiencia de remarketing
3. Se MUITOS leads desse anuncio acabarem aqui = revisa anuncio (ICP errado, copy ruim)

METRICA-CHAVE
Taxa de conversao lead-cadencia pra oportunidade. Anuncio bom = &gt;15%. Abaixo de 5% = troca anuncio.</bpmn:documentation>
      <bpmn:incoming>F10_Nao</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="F01" sourceRef="Start_Click" targetRef="T01_15min_WppAuto" />
    <bpmn:sequenceFlow id="F02" sourceRef="T01_15min_WppAuto" targetRef="T02_D0_Lig1" />
    <bpmn:sequenceFlow id="F03" sourceRef="T02_D0_Lig1" targetRef="T03_D0_Lig2" />
    <bpmn:sequenceFlow id="F04" sourceRef="T03_D0_Lig2" targetRef="T04_D0_Lig3" />
    <bpmn:sequenceFlow id="F05" sourceRef="T04_D0_Lig3" targetRef="T05_D1_Lig4" />
    <bpmn:sequenceFlow id="F06" sourceRef="T05_D1_Lig4" targetRef="T06_D2_Wpp" />
    <bpmn:sequenceFlow id="F07" sourceRef="T06_D2_Wpp" targetRef="T07_D4_Lig5" />
    <bpmn:sequenceFlow id="F08" sourceRef="T07_D4_Lig5" targetRef="T08_D7_Final" />
    <bpmn:sequenceFlow id="F09" sourceRef="T08_D7_Final" targetRef="Gateway_Respondeu" />
    <bpmn:sequenceFlow id="F10_Sim" name="Sim" sourceRef="Gateway_Respondeu" targetRef="End_Oportunidade" />
    <bpmn:sequenceFlow id="F10_Nao" name="Nao" sourceRef="Gateway_Respondeu" targetRef="End_Standby" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="Diag_Ads">
    <bpmndi:BPMNPlane id="Plane_Ads" bpmnElement="Collab_Ads">
      <bpmndi:BPMNShape id="Pool_Ads_di" bpmnElement="Pool_Ads" isHorizontal="true">
        <dc:Bounds x="160" y="80" width="2400" height="640" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Sistema_di" bpmnElement="Lane_Sistema" isHorizontal="true">
        <dc:Bounds x="190" y="80" width="2370" height="140" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Vendas_di" bpmnElement="Lane_Vendas" isHorizontal="true">
        <dc:Bounds x="190" y="220" width="2370" height="240" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Cliente_di" bpmnElement="Lane_Cliente" isHorizontal="true">
        <dc:Bounds x="190" y="460" width="2370" height="260" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_Click_di" bpmnElement="Start_Click">
        <dc:Bounds x="240" y="572" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="200" y="615" width="120" height="40" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Oportunidade_di" bpmnElement="End_Oportunidade">
        <dc:Bounds x="2460" y="540" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="2415" y="583" width="126" height="40" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Standby_di" bpmnElement="End_Standby">
        <dc:Bounds x="2460" y="620" width="36" height="36" />
        <bpmndi:BPMNLabel><dc:Bounds x="2410" y="660" width="146" height="40" /></bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="T01_15min_WppAuto_di" bpmnElement="T01_15min_WppAuto"><dc:Bounds x="320" y="110" width="200" height="80" /></bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="T02_D0_Lig1_di" bpmnElement="T02_D0_Lig1"><dc:Bounds x="560" y="300" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T03_D0_Lig2_di" bpmnElement="T03_D0_Lig2"><dc:Bounds x="780" y="300" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T04_D0_Lig3_di" bpmnElement="T04_D0_Lig3"><dc:Bounds x="1000" y="300" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T05_D1_Lig4_di" bpmnElement="T05_D1_Lig4"><dc:Bounds x="1220" y="300" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T06_D2_Wpp_di" bpmnElement="T06_D2_Wpp"><dc:Bounds x="1440" y="300" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T07_D4_Lig5_di" bpmnElement="T07_D4_Lig5"><dc:Bounds x="1660" y="300" width="180" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T08_D7_Final_di" bpmnElement="T08_D7_Final"><dc:Bounds x="1880" y="300" width="220" height="80" /></bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Respondeu_di" bpmnElement="Gateway_Respondeu" isMarkerVisible="true"><dc:Bounds x="2160" y="315" width="50" height="50" /><bpmndi:BPMNLabel><dc:Bounds x="2145" y="275" width="80" height="27" /></bpmndi:BPMNLabel></bpmndi:BPMNShape>

      <bpmndi:BPMNEdge id="F01_di" bpmnElement="F01"><di:waypoint x="258" y="572" /><di:waypoint x="258" y="150" /><di:waypoint x="320" y="150" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F02_di" bpmnElement="F02"><di:waypoint x="520" y="150" /><di:waypoint x="650" y="150" /><di:waypoint x="650" y="300" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F03_di" bpmnElement="F03"><di:waypoint x="740" y="340" /><di:waypoint x="780" y="340" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F04_di" bpmnElement="F04"><di:waypoint x="960" y="340" /><di:waypoint x="1000" y="340" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F05_di" bpmnElement="F05"><di:waypoint x="1180" y="340" /><di:waypoint x="1220" y="340" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F06_di" bpmnElement="F06"><di:waypoint x="1400" y="340" /><di:waypoint x="1440" y="340" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F07_di" bpmnElement="F07"><di:waypoint x="1620" y="340" /><di:waypoint x="1660" y="340" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F08_di" bpmnElement="F08"><di:waypoint x="1840" y="340" /><di:waypoint x="1880" y="340" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F09_di" bpmnElement="F09"><di:waypoint x="2100" y="340" /><di:waypoint x="2160" y="340" /></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F10_Sim_di" bpmnElement="F10_Sim"><di:waypoint x="2185" y="365" /><di:waypoint x="2185" y="558" /><di:waypoint x="2460" y="558" /><bpmndi:BPMNLabel><dc:Bounds x="2190" y="445" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F10_Nao_di" bpmnElement="F10_Nao"><di:waypoint x="2210" y="340" /><di:waypoint x="2300" y="340" /><di:waypoint x="2300" y="638" /><di:waypoint x="2460" y="638" /><bpmndi:BPMNLabel><dc:Bounds x="2305" y="450" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

/**
 * Template BPMN 2.0 — CS Fase 1: Implementacao Guiada (D0-D7)
 *
 * Fase mais critica do ciclo de CS (cliente acabou de assinar, ainda em carencia de pagamento, e no mensal nao tem fidelidade - pode sumir antes da 1a cobranca).
 * Meta principal: TTV <=48h (1a venda + 1a conta + 1o pagamento lancados).
 * Saida: cliente pronto pra Fase 2 (Ativacao) com vinculo emocional com a Consultora.
 *
 * 4 lanes: Cliente · Consultora · Kaynan · Sistema (CRM + WhatsApp)
 */

export const CS_01_IMPLEMENTACAO_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_CS01" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_CS01">
    <bpmn:participant id="Pool_CS01" name="CS Fase 1 - Implementacao Guiada (D0-D7) - Meta: TTV &lt;=48h" processRef="Process_CS01" />
  </bpmn:collaboration>
  <bpmn:process id="Process_CS01" isExecutable="false">
    <bpmn:laneSet id="LaneSet_CS01">
      <bpmn:lane id="Lane_Cliente" name="Cliente">
        <bpmn:flowNodeRef>Start_Contrato</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_ProntoFase2</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Consultora" name="Consultora de Relacionamento">
        <bpmn:flowNodeRef>Task_AgendarCall</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_CallImplementacao</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_3Videos</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_D3Audio</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_D5Video</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_D6Check</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_D7Fechamento</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_TTV</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Kaynan" name="Kaynan (Fundador)">
        <bpmn:flowNodeRef>Task_AudioFundador</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_EscaladoSave</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Sistema" name="Sistema (CRM + WhatsApp + Asaas)">
        <bpmn:flowNodeRef>Task_WppBoasvindas</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="Start_Contrato" name="Contrato assinado (D0)">
      <bpmn:documentation>QUANDO: Cliente assina contrato (mensal R$97 ou anual R$67/mes = R$804 antecipado)

O QUE ACONTECE
Comeca o ciclo de CS. Cliente entra direto na Fase 1 - nao tem mais trial.

ATENCAO: CARENCIA DE PAGAMENTO
O cliente assinou mas comeca a pagar so depois de X dias. Ele ainda nao pagou nada. Se nao gostar nesses primeiros dias, some sem ter pago. Por isso essa fase tem que mostrar valor RAPIDO.</bpmn:documentation>
      <bpmn:outgoing>F01</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:serviceTask id="Task_WppBoasvindas" name="D0: WhatsApp boas-vindas auto&#10;+ cartilha visual 1 pagina (PDF imagem)">
      <bpmn:documentation>QUEM FAZ: Sistema (automatico)
QUANDO: Na hora que o pagamento confirma

O QUE FAZER
Manda no WhatsApp do cliente: (1) mensagem de boas-vindas; (2) cartilha visual de 1 pagina (PDF/imagem) com o que vai acontecer nos proximos 7 dias.

DICA
Imagem, nao texto longo. Cliente desse perfil nao le.</bpmn:documentation>
      <bpmn:incoming>F01</bpmn:incoming>
      <bpmn:outgoing>F02</bpmn:outgoing>
    </bpmn:serviceTask>

    <bpmn:userTask id="Task_AudioFundador" name="D0: Gravar audio 1min do fundador&#10;Boas-vindas pessoal + agendamento da call">
      <bpmn:documentation>QUEM FAZ: Kaynan (fundador)
QUANDO: No mesmo dia do contrato

O QUE FAZER
Grava 1 audio de ate 1min no WhatsApp do cliente dando boas-vindas pessoais.

EXEMPLO DE FALA
"E ai [nome]! Aqui e o Kaynan, fundador da Fyness. Vi que voce acabou de entrar - obrigado pela confianca. A [nome da consultora] ja vai te chamar pra marcar nossa primeira conversa. Qualquer coisa que precisar, voce me chama direto, ta? Bem-vindo!"

DICA
Menciona algo especifico do negocio dele se conseguiu ver (Instagram, site). Custa 2min, vale muito nesse perfil emocional.</bpmn:documentation>
      <bpmn:incoming>F02</bpmn:incoming>
      <bpmn:outgoing>F03</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_AgendarCall" name="D0: Agendar call D1-D2&#10;30-40min, video, tela compartilhada">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: Ate 2h depois do cliente assinar contrato

O QUE FAZER
Mandar audio no WhatsApp se apresentando e marcar uma conversa pra amanha ou depois.

EXEMPLO DE FALA
"Oi, aqui e a [nome] da Fyness. Recebi seu contrato agora, ja quero te dar as boas-vindas. Eu vou ser sua consultora aqui. Marca uma conversa rapida comigo - 30 minutinhos, eu te mostro tudo na pratica pela tela. Que horario amanha funciona pra voce?"

DICAS
- Audio, nao texto
- Oferece horario fora do comercial (7h, 18h+, sabado de manha)
- Usa Google Meet ou WhatsApp Video (nada de Zoom/Calendly)
- Evita palavras "onboarding/treinamento/implantacao" - assusta

SE DER RUIM
- Cliente nao responde em 24h: chama Kaynan
- Cliente quer "fazer sozinho": insiste, explica que e mais rapido com voce
- Cliente diz "to ocupado": oferece horario alternativo

ANOTAR NO CRM
Horario marcado, tipo de negocio, qualquer detalhe pessoal pra usar na call.</bpmn:documentation>
      <bpmn:incoming>F03</bpmn:incoming>
      <bpmn:outgoing>F04</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_CallImplementacao" name="D1-D2: Call de implementacao&#10;Cadastrar JUNTOS: 1a conta + 1a venda + 1o pagamento (TTV &lt;=48h)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D1 ou D2 (idealmente D1), 30-40min, video com tela compartilhada

O QUE FAZER
Cadastra JUNTO com o cliente (voce na tela): 1a conta bancaria, 1a venda, 1o pagamento. O cliente sai da call usando a Fyness.

ROTEIRO BASICO
- 0-3min: quebra-gelo (comenta algo do negocio dele que voce pesquisou antes)
- 3-8min: cadastra a 1a conta bancaria
- 8-20min: lanca 1 venda real (pede pro cliente abrir 1 comprovante recente)
- 20-30min: lanca 1 conta a pagar real
- 30-35min: mostra o resumo-sexta-17h e combina ele esperar toda sexta
- 35-40min: combina os check-ins dos proximos dias

EXEMPLO DE FALA NA ABERTURA
"Oi [nome]! Antes da gente entrar, dei uma olhada no Instagram de voces - [comentario]. Show. Bom, hoje a gente vai fazer 3 coisinhas praticas pra voce ja sair usando a Fyness. Pode ser?"

DICAS
- Pesquisa o cliente antes (Instagram, Google Maps)
- Voce compartilha sua tela primeiro, depois pede pro cliente tentar 1 vez na tela dele
- Trata por "voce" e nome (nada de "senhor/senhora")
- Reforco positivo o tempo todo ("isso", "perfeito", "show")

SE DER RUIM
- Cliente parece perdido: para, simplifica, oferece refazer
- Cliente "fazendo outras coisas": pede foco gentilmente
- Cliente pergunta sobre cancelamento: ATENCAO MAXIMA, escala Kaynan na hora
- Cliente diz "depois eu faco": INSISTE pra fazer agora

ANOTAR NO CRM
TTV atingido (sim/nao), 3 itens cadastrados (sim/nao), engajamento (alto/medio/baixo), tipo de negocio, faturamento se mencionou, 1 detalhe pessoal pra usar nos proximos check-ins.</bpmn:documentation>
      <bpmn:incoming>F04</bpmn:incoming>
      <bpmn:outgoing>F05</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_3Videos" name="D2: Enviar gravacao da call&#10;Cortada em 3 videos curtos (1 por acao aprendida)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: Logo apos a call (mesmo dia)

O QUE FAZER
Corta a gravacao da call em 3 videos curtos (1 video por acao: cadastrar conta, lancar venda, lancar pagamento). Manda no WhatsApp do cliente.

EXEMPLO DE FALA AO ENVIAR
"Oi [nome]! Foi muito bom hoje. To te mandando 3 videozinhos cortados da nossa conversa - sao pra voce ter na mao se quiser revisar algo. Qualquer coisa me chama!"

DICA
Cada video de 1-2min, formato vertical (cliente assiste no celular).</bpmn:documentation>
      <bpmn:incoming>F05</bpmn:incoming>
      <bpmn:outgoing>F06</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_D3Audio" name="D3: Audio WhatsApp&#10;'Conseguiu lancar ontem? Qualquer duvida me chama'">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D3 (3o dia apos contrato)

O QUE FAZER
Manda 1 audio curto no WhatsApp checando se o cliente continuou usando.

EXEMPLO DE FALA
"Oi [nome]! Lembrei de voce hoje. Conseguiu lancar mais alguma coisa depois da nossa conversa? Qualquer duvida me chama, to por aqui."

DICA
Audio, nao texto. Tom de amiga, nao SaaS frio. Nao usa script pronto - audio cria vinculo.

SE DER RUIM
Cliente nao responde ate o fim do dia: tenta de novo amanha (D4). Se nao responder D4, escala atencao.</bpmn:documentation>
      <bpmn:incoming>F06</bpmn:incoming>
      <bpmn:outgoing>F07</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_D5Video" name="D5: Mini-video dica da semana&#10;45-90s, formato vertical">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D5 (5o dia apos contrato)

O QUE FAZER
Manda 1 video curto (45-90s, formato vertical, tipo TikTok) com 1 dica especifica que faz sentido pro negocio do cliente.

EXEMPLO DE FALA AO ENVIAR
"Oi [nome]! To te mandando 1 dica rapida que pode te ajudar essa semana. Se de hein!"

DICA
Pode ter biblioteca pre-gravada de videos (uma por tipo de negocio: padaria, salao, restaurante). Mas a entrega no WhatsApp e personalizada.</bpmn:documentation>
      <bpmn:incoming>F07</bpmn:incoming>
      <bpmn:outgoing>F08</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_D6Check" name="D6: WhatsApp check&#10;'Tudo certo? Alguma duvida pra resolver antes da call?'">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D6 (1 dia antes da call D7)

O QUE FAZER
Manda WhatsApp perguntando se tem duvida pendente antes da call de amanha.

EXEMPLO DE FALA
"Oi [nome]! Amanha a gente conversa pra fechar essa semana. Antes, tem alguma duvida que voce queira ja resolver agora?"

DICA
Se cliente responder com problema, resolve via audio/WhatsApp AGORA, nao deixa pra call.</bpmn:documentation>
      <bpmn:incoming>F08</bpmn:incoming>
      <bpmn:outgoing>F09</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_D7Fechamento" name="D7: Call 15min fechamento de onboarding&#10;Mede satisfacao + define ritual sexta 17h + transiciona pra Fase 2">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D7 (1 semana apos contrato), 15min, video

O QUE FAZER
Call curta de fechamento da semana de implementacao.

ROTEIRO
- "Como foi essa primeira semana?" (escuta)
- Pergunta nota de 0-10 pra essa 1a semana (NPS inicial)
- Reforca o ritual sexta-17h
- Apresenta a proxima fase (Ativacao) - "agora a gente entra no ritmo, vou te chamar uma vez a cada semana"

EXEMPLO DE FALA NO FIM
"[nome], a partir de agora a gente entra num ritmo mais leve. Sexta as 17h voce vai receber seu resumo automatico - esse e nosso ritual. E eu vou te chamar uma vez por semana pra ver como ta indo. Combinado?"

ANOTAR NO CRM
NPS dado, sinais de risco, se cliente atingiu TTV.</bpmn:documentation>
      <bpmn:incoming>F09</bpmn:incoming>
      <bpmn:outgoing>F10</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:exclusiveGateway id="Gateway_TTV" name="TTV &lt;=48h atingido?">
      <bpmn:documentation>DECISAO NO D7

CRITERIO
Cliente cadastrou 1a conta + 1a venda + 1o pagamento em ate 48h apos o contrato?
SIM -- avanca pra Fase 2 (Ativacao)
NAO -- escala Kaynan (Save Playbook)

SINAIS DE RISCO A CHECAR
Cliente nao apareceu na call D1, nao respondeu D3/D5/D6, reagendou D7.</bpmn:documentation>
      <bpmn:incoming>F10</bpmn:incoming>
      <bpmn:outgoing>F11_Sim</bpmn:outgoing>
      <bpmn:outgoing>F11_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:endEvent id="End_ProntoFase2" name="Pronto pra Fase 2 (Ativacao)">
      <bpmn:documentation>RESULTADO BOM

Cliente saiu da implementacao com:
- 1a conta + 1a venda + 1o pagamento cadastrados
- Vinculo com a Consultora
- Sabendo que toda sexta as 17h chega o resumo

PROXIMO PASSO
Vai pra Fase 2 (Ativacao - D8 ate D30) automaticamente.</bpmn:documentation>
      <bpmn:incoming>F11_Sim</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:endEvent id="End_EscaladoSave" name="Escalar pro Kaynan&#10;-&gt; Save Playbook (CS Macro)">
      <bpmn:documentation>RESULTADO RUIM - Cliente em risco apos D7

O QUE ACONTECE
Escala automatico pro Save Playbook do CS Macro. Kaynan entra pessoalmente.

ACAO DO KAYNAN
- Grava audio pessoal pedindo desculpa
- Oferece reagendar com prioridade
- Se for mensal: 1 mes gratis
- Se for anual: call extra com Kaynan presente</bpmn:documentation>
      <bpmn:incoming>F11_Nao</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="F01" sourceRef="Start_Contrato" targetRef="Task_WppBoasvindas" />
    <bpmn:sequenceFlow id="F02" sourceRef="Task_WppBoasvindas" targetRef="Task_AudioFundador" />
    <bpmn:sequenceFlow id="F03" sourceRef="Task_AudioFundador" targetRef="Task_AgendarCall" />
    <bpmn:sequenceFlow id="F04" sourceRef="Task_AgendarCall" targetRef="Task_CallImplementacao" />
    <bpmn:sequenceFlow id="F05" sourceRef="Task_CallImplementacao" targetRef="Task_3Videos" />
    <bpmn:sequenceFlow id="F06" sourceRef="Task_3Videos" targetRef="Task_D3Audio" />
    <bpmn:sequenceFlow id="F07" sourceRef="Task_D3Audio" targetRef="Task_D5Video" />
    <bpmn:sequenceFlow id="F08" sourceRef="Task_D5Video" targetRef="Task_D6Check" />
    <bpmn:sequenceFlow id="F09" sourceRef="Task_D6Check" targetRef="Task_D7Fechamento" />
    <bpmn:sequenceFlow id="F10" sourceRef="Task_D7Fechamento" targetRef="Gateway_TTV" />
    <bpmn:sequenceFlow id="F11_Sim" name="Sim" sourceRef="Gateway_TTV" targetRef="End_ProntoFase2" />
    <bpmn:sequenceFlow id="F11_Nao" name="Nao" sourceRef="Gateway_TTV" targetRef="End_EscaladoSave" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_CS01">
    <bpmndi:BPMNPlane id="BPMNPlane_CS01" bpmnElement="Collaboration_CS01">
      <bpmndi:BPMNShape id="Pool_CS01_di" bpmnElement="Pool_CS01" isHorizontal="true">
        <dc:Bounds x="160" y="80" width="2300" height="720" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Cliente_di" bpmnElement="Lane_Cliente" isHorizontal="true">
        <dc:Bounds x="190" y="80" width="2270" height="120" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Consultora_di" bpmnElement="Lane_Consultora" isHorizontal="true">
        <dc:Bounds x="190" y="200" width="2270" height="240" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Kaynan_di" bpmnElement="Lane_Kaynan" isHorizontal="true">
        <dc:Bounds x="190" y="440" width="2270" height="120" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Sistema_di" bpmnElement="Lane_Sistema" isHorizontal="true">
        <dc:Bounds x="190" y="560" width="2270" height="240" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_Contrato_di" bpmnElement="Start_Contrato">
        <dc:Bounds x="240" y="122" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="220" y="165" width="80" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_ProntoFase2_di" bpmnElement="End_ProntoFase2">
        <dc:Bounds x="2330" y="122" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2295" y="165" width="106" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_WppBoasvindas_di" bpmnElement="Task_WppBoasvindas">
        <dc:Bounds x="320" y="640" width="240" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_AudioFundador_di" bpmnElement="Task_AudioFundador">
        <dc:Bounds x="320" y="460" width="240" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_EscaladoSave_di" bpmnElement="End_EscaladoSave">
        <dc:Bounds x="2330" y="482" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2290" y="525" width="120" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_AgendarCall_di" bpmnElement="Task_AgendarCall">
        <dc:Bounds x="620" y="280" width="160" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_CallImplementacao_di" bpmnElement="Task_CallImplementacao">
        <dc:Bounds x="820" y="280" width="200" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_3Videos_di" bpmnElement="Task_3Videos">
        <dc:Bounds x="1060" y="280" width="180" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D3Audio_di" bpmnElement="Task_D3Audio">
        <dc:Bounds x="1280" y="280" width="160" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D5Video_di" bpmnElement="Task_D5Video">
        <dc:Bounds x="1480" y="280" width="160" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D6Check_di" bpmnElement="Task_D6Check">
        <dc:Bounds x="1680" y="280" width="160" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D7Fechamento_di" bpmnElement="Task_D7Fechamento">
        <dc:Bounds x="1880" y="280" width="200" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_TTV_di" bpmnElement="Gateway_TTV" isMarkerVisible="true">
        <dc:Bounds x="2120" y="295" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2105" y="265" width="80" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNEdge id="F01_di" bpmnElement="F01">
        <di:waypoint x="258" y="158" />
        <di:waypoint x="258" y="680" />
        <di:waypoint x="320" y="680" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F02_di" bpmnElement="F02">
        <di:waypoint x="440" y="640" />
        <di:waypoint x="440" y="540" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F03_di" bpmnElement="F03">
        <di:waypoint x="560" y="500" />
        <di:waypoint x="600" y="500" />
        <di:waypoint x="600" y="320" />
        <di:waypoint x="620" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F04_di" bpmnElement="F04">
        <di:waypoint x="780" y="320" />
        <di:waypoint x="820" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F05_di" bpmnElement="F05">
        <di:waypoint x="1020" y="320" />
        <di:waypoint x="1060" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F06_di" bpmnElement="F06">
        <di:waypoint x="1240" y="320" />
        <di:waypoint x="1280" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F07_di" bpmnElement="F07">
        <di:waypoint x="1440" y="320" />
        <di:waypoint x="1480" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F08_di" bpmnElement="F08">
        <di:waypoint x="1640" y="320" />
        <di:waypoint x="1680" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F09_di" bpmnElement="F09">
        <di:waypoint x="1840" y="320" />
        <di:waypoint x="1880" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F10_di" bpmnElement="F10">
        <di:waypoint x="2080" y="320" />
        <di:waypoint x="2120" y="320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F11_Sim_di" bpmnElement="F11_Sim">
        <di:waypoint x="2145" y="295" />
        <di:waypoint x="2145" y="140" />
        <di:waypoint x="2330" y="140" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2150" y="215" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F11_Nao_di" bpmnElement="F11_Nao">
        <di:waypoint x="2145" y="345" />
        <di:waypoint x="2145" y="500" />
        <di:waypoint x="2330" y="500" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2150" y="415" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

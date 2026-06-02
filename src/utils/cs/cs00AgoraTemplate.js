/**
 * Template BPMN 2.0 — CS Agora (Operacao Enxuta para Early Stage)
 *
 * Versao "AGORA" do processo de CS, dimensionada para a realidade atual da Fyness:
 * ~5 clientes (Maio 2026), foco em PMF/tracao na unha.
 *
 * Diferenca pra versao completa (CS Macro + 6 Fases):
 *  - SEM health score automatizado (voce sente na conversa)
 *  - SEM dunning de 7 passos (cartao recusou? liga na hora)
 *  - SEM cohort, NDR, NPS sistematico
 *  - SEM EBR-audio trimestral formal
 *  - SEM 6 fases distintas — operacao continua e pessoal
 *  - Voce = Kaynan + Consultora atuando junto, sem separacao formal
 *
 * Quando trocar pra versao completa: quando passar de ~15-20 clientes ativos
 * (nesse ponto a memoria nao da conta e voce comeca a esquecer detalhe de cliente).
 */

export const CS_00_AGORA_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_CSAgora" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_CSAgora">
    <bpmn:participant id="Pool_CSAgora" name="CS Agora - Operacao Enxuta (ate ~15 clientes)" processRef="Process_CSAgora" />
  </bpmn:collaboration>
  <bpmn:process id="Process_CSAgora" isExecutable="false">
    <bpmn:laneSet id="LaneSet_CSAgora">
      <bpmn:lane id="Lane_Voce" name="Voce (Kaynan + Consultora, sem separacao)">
        <bpmn:flowNodeRef>Task_Implementa</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_Planilha</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_RotinaSemanal</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_LigacaoMensal</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Feliz</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_PedeIndicacao</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ResolveNaHora</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_LigaNaHora</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Start_CartaoRecusou</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Resolvido</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_Carencia</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Cliente" name="Cliente">
        <bpmn:flowNodeRef>Start_Assinou</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Fiel</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="Start_Assinou" name="Cliente assinou (em carencia)">
      <bpmn:documentation>QUANDO: Cliente assinou contrato

ATENCAO
Ele esta em CARENCIA - ainda nao pagou nada. Pode sumir antes da 1a cobranca. Por isso a 1a conversa tem que ser HOJE ou amanha, no maximo.</bpmn:documentation>
      <bpmn:outgoing>F01</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:userTask id="Task_Implementa" name="Liga e cadastra tudo junto&#10;1 call de 30-40min, voce faz na tela com ele">
      <bpmn:documentation>QUEM FAZ: Voce (sem distincao Kaynan/Consultora)
QUANDO: Maximo 24-48h apos o cliente assinar

O QUE FAZER
Liga, faz video, compartilha tela. Cadastra junto com ele: 1a conta, 1a venda, 1o pagamento.

EXEMPLO DE FALA
"Oi [nome]! Recebi sua assinatura - bora ja deixar tudo rodando. Marca 30 minutinhos comigo hoje a tarde ou amanha, eu te mostro tudo na pratica."

POR QUE FAZER HOJE
Ele esta em carencia - nao pagou nada ainda. Se nao ver valor em 48h, some sem custo.</bpmn:documentation>
      <bpmn:incoming>F01</bpmn:incoming>
      <bpmn:outgoing>F02</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_Planilha" name="Anota o cliente numa planilha simples&#10;Nome, negocio, status, ultima conversa">
      <bpmn:documentation>QUEM FAZ: Voce
QUANDO: Logo apos a 1a call

O QUE FAZER
Anota numa planilha simples (Google Sheets, Notion, ou caderno):
- Nome do dono e do negocio
- Tipo de negocio (padaria/salao/etc)
- Telefone WhatsApp
- 1 detalhe pessoal pra usar nas conversas
- Status (feliz/neutro/com problema)
- Data da ultima conversa

DICA
Com ate 15 clientes, voce LEMBRA de tudo. Sem CRM complexo. Quando passar disso, ai vale a pena instrumentar (sai do "CS Agora" e migra pro CS Macro completo).</bpmn:documentation>
      <bpmn:incoming>F02</bpmn:incoming>
      <bpmn:outgoing>F03</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_Carencia" name="Acompanha durante a carencia&#10;Mensagens diarias nos primeiros 3-5 dias">
      <bpmn:documentation>QUEM FAZ: Voce
QUANDO: Todo dia durante a carencia (X dias ate a 1a cobranca)

O QUE FAZER
Cliente em carencia ainda nao pagou nada. Risco de sumir. Acompanha de perto.

ROTINA DIARIA NA CARENCIA
- Manda uma mensagem ou audio rapido
- Pergunta se ta usando, se tem duvida
- Resolve qualquer travamento na hora

EXEMPLO DE FALA (D2)
"Oi [nome]! Conseguiu lancar mais alguma coisa ontem? Qualquer coisa me chama."

SINAL DE RISCO
Cliente nao responde 2 dias seguidos durante a carencia: liga PESSOAL. Se nao atender, pode estar saindo silenciosamente antes da 1a cobranca.</bpmn:documentation>
      <bpmn:incoming>F03</bpmn:incoming>
      <bpmn:outgoing>F04</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_RotinaSemanal" name="Toda semana: mensagem pessoal pra cada um&#10;+ sexta as 17h: manda o resumo (manual)">
      <bpmn:documentation>QUEM FAZ: Voce
QUANDO: Toda semana, pra CADA cliente

O QUE FAZER
- 1 mensagem ou audio pessoal pra cada cliente (sem template, escreve do zero)
- Sexta as 17h: manda o resumo do caixa (pode fazer na mao - olha a planilha do cliente, escreve um audio rapido)

EXEMPLO DE FALA (segunda)
"Oi [nome]! Como ta sendo a semana ai? Vi que voce lancou bastante coisa semana passada - bom trabalho."

EXEMPLO DE FALA (sexta - resumo manual)
"Oi [nome]! Resumo da sua semana: voce vendeu [X], pagou [Y], sobrou [Z]. Boa semana voce!"

POR QUE MANUAL
Com 5 clientes voce faz isso em 30min na sexta. Quando virar 20 clientes, ja nao da - ai automatiza.</bpmn:documentation>
      <bpmn:incoming>F04</bpmn:incoming>
      <bpmn:outgoing>F05</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_LigacaoMensal" name="1x por mes: liga pra cada cliente&#10;Conversa de 15min, sem pauta">
      <bpmn:documentation>QUEM FAZ: Voce
QUANDO: 1 vez por mes, pra CADA cliente

O QUE FAZER
Liga (nao WhatsApp). Conversa de 15min sem pauta formal - pergunta como ta o negocio, escuta, oferece ajuda.

EXEMPLO DE ABERTURA
"Oi [nome]! To passando aqui pra saber como ta indo, como foi o mes, se tem algo que voce queira ajuste. Conta ai."

DICA
Sem questionario NPS, sem checklist. So escuta. Cliente desse perfil aprecia ligacao humana.</bpmn:documentation>
      <bpmn:incoming>F05</bpmn:incoming>
      <bpmn:outgoing>F06</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:exclusiveGateway id="Gateway_Feliz" name="Cliente feliz?&#10;(voce sente na conversa)">
      <bpmn:documentation>DECISAO BASEADA NA SUA PERCEPCAO

Sem health score, sem NPS formal. Voce sente na conversa.

SINAIS DE QUE ESTA FELIZ
- Fala bem do produto sem perguntar
- Cresceu/tem boas noticias
- Indica voce pra alguem espontaneamente

SINAIS DE QUE NAO ESTA FELIZ
- Respostas curtas, evita conversa
- Reclama de coisas pequenas
- Pergunta sobre cancelamento ou "como funciona se eu sair"

SIM -- pede indicacao quando elogiar
NAO -- resolve pessoalmente AGORA</bpmn:documentation>
      <bpmn:incoming>F06</bpmn:incoming>
      <bpmn:outgoing>F07_Sim</bpmn:outgoing>
      <bpmn:outgoing>F07_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:userTask id="Task_PedeIndicacao" name="Pede indicacao quando elogiar&#10;Sem programa formal, na hora da conversa">
      <bpmn:documentation>QUEM FAZ: Voce
QUANDO: Cliente elogia espontaneamente

O QUE FAZER
Pede indicacao na hora. Sem programa de pontos, sem desconto automatico. So pergunta.

EXEMPLO DE FALA
"Que legal que voce ta gostando! Tem algum amigo dono de negocio que voce acha que se beneficiaria? Manda ele falar comigo."

DICA EARLY STAGE
Com 5 clientes voce nao precisa de sistema de tracking. Quando alguem indicar e converter, voce manualmente da R$30 de desconto na proxima fatura.</bpmn:documentation>
      <bpmn:incoming>F07_Sim</bpmn:incoming>
      <bpmn:outgoing>F08</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_ResolveNaHora" name="Resolve pessoalmente AGORA&#10;Liga, entende, ajeita">
      <bpmn:documentation>QUEM FAZ: Voce (geralmente Kaynan)
QUANDO: Sinal de insatisfacao na ligacao mensal

O QUE FAZER
Para tudo. Liga AGORA. NAO espera.

ROTEIRO
1. Liga e pergunta direto: "Senti que voce nao ta 100%. O que ta acontecendo?"
2. Escuta sem interromper
3. Resolve o que puder na hora (tecnico, comercial, emocional)
4. Se for caixa apertado, oferece desconto pontual ou pausa
5. Volta a falar amanha pra confirmar

POR QUE FUNCIONA
No early stage, voce nao tem time. A intervencao pessoal e do dono e o que segura cliente nesse ticket.</bpmn:documentation>
      <bpmn:incoming>F07_Nao</bpmn:incoming>
      <bpmn:outgoing>F09</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:endEvent id="End_Fiel" name="Cliente fiel&#10;Quando passar de ~15-20 clientes, migra pro CS Macro completo">
      <bpmn:documentation>RESULTADO

Cliente fiel. Continua na operacao pessoal.

QUANDO MIGRAR PRO PROCESSO COMPLETO
Quando voce passar de ~15-20 clientes ativos. Sinais de que chegou a hora:
- Voce comeca a esquecer o nome do negocio do cliente
- Esquece de mandar mensagem pra alguem na semana
- Demora mais de 1h pra mandar o resumo de sexta
- Esta perdendo informacao entre conversas

Nesse ponto, troca pro template "CS Macro" + 6 fases detalhadas.</bpmn:documentation>
      <bpmn:incoming>F08</bpmn:incoming>
      <bpmn:incoming>F09</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:startEvent id="Start_CartaoRecusou" name="Cartao recusou (fora do fluxo principal)">
      <bpmn:documentation>EVENTO PARALELO

Quando o cartao do cliente e recusado em qualquer mes. Nao espera dunning de 7 passos. Acao imediata.</bpmn:documentation>
      <bpmn:outgoing>FC1</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:userTask id="Task_LigaNaHora" name="Liga na hora + manda PIX&#10;Sem fluxo de 7 passos">
      <bpmn:documentation>QUEM FAZ: Voce
QUANDO: Sistema avisa que o cartao recusou

O QUE FAZER
- Liga na hora (nao WhatsApp formal)
- Manda PIX como alternativa
- Pergunta se foi limite, se trocou de cartao, se quer ajuda

EXEMPLO DE FALA
"Oi [nome]! Sou eu, [nome]. Vi que o cartao recusou agora ha pouco. Foi limite? Voce prefere pagar via PIX esse mes? To te mandando o codigo."

POR QUE ASSIM
Com 5 clientes, contato pessoal resolve 80% dos casos no mesmo dia. Dunning de 7 passos e processo de quem tem volume - voce ainda nao.</bpmn:documentation>
      <bpmn:incoming>FC1</bpmn:incoming>
      <bpmn:outgoing>FC2</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:endEvent id="End_Resolvido" name="Resolvido&#10;(no early stage, contato pessoal resolve 80%)">
      <bpmn:documentation>RESULTADO

Pagamento normalizado. Anota na planilha o que aconteceu (limite estourado, trocou cartao, etc) - dado util pra entender padroes mais tarde.</bpmn:documentation>
      <bpmn:incoming>FC2</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="F01" sourceRef="Start_Assinou" targetRef="Task_Implementa" />
    <bpmn:sequenceFlow id="F02" sourceRef="Task_Implementa" targetRef="Task_Planilha" />
    <bpmn:sequenceFlow id="F03" sourceRef="Task_Planilha" targetRef="Task_Carencia" />
    <bpmn:sequenceFlow id="F04" sourceRef="Task_Carencia" targetRef="Task_RotinaSemanal" />
    <bpmn:sequenceFlow id="F05" sourceRef="Task_RotinaSemanal" targetRef="Task_LigacaoMensal" />
    <bpmn:sequenceFlow id="F06" sourceRef="Task_LigacaoMensal" targetRef="Gateway_Feliz" />
    <bpmn:sequenceFlow id="F07_Sim" name="Sim" sourceRef="Gateway_Feliz" targetRef="Task_PedeIndicacao" />
    <bpmn:sequenceFlow id="F07_Nao" name="Nao" sourceRef="Gateway_Feliz" targetRef="Task_ResolveNaHora" />
    <bpmn:sequenceFlow id="F08" sourceRef="Task_PedeIndicacao" targetRef="End_Fiel" />
    <bpmn:sequenceFlow id="F09" sourceRef="Task_ResolveNaHora" targetRef="End_Fiel" />
    <bpmn:sequenceFlow id="FC1" sourceRef="Start_CartaoRecusou" targetRef="Task_LigaNaHora" />
    <bpmn:sequenceFlow id="FC2" sourceRef="Task_LigaNaHora" targetRef="End_Resolvido" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_CSAgora">
    <bpmndi:BPMNPlane id="BPMNPlane_CSAgora" bpmnElement="Collaboration_CSAgora">
      <bpmndi:BPMNShape id="Pool_CSAgora_di" bpmnElement="Pool_CSAgora" isHorizontal="true">
        <dc:Bounds x="160" y="80" width="2400" height="700" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Voce_di" bpmnElement="Lane_Voce" isHorizontal="true">
        <dc:Bounds x="190" y="80" width="2370" height="520" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Cliente_di" bpmnElement="Lane_Cliente" isHorizontal="true">
        <dc:Bounds x="190" y="600" width="2370" height="180" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_Assinou_di" bpmnElement="Start_Assinou">
        <dc:Bounds x="240" y="672" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="210" y="715" width="100" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Fiel_di" bpmnElement="End_Fiel">
        <dc:Bounds x="2440" y="672" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2380" y="715" width="156" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_Implementa_di" bpmnElement="Task_Implementa">
        <dc:Bounds x="320" y="180" width="200" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Planilha_di" bpmnElement="Task_Planilha">
        <dc:Bounds x="560" y="180" width="200" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Carencia_di" bpmnElement="Task_Carencia">
        <dc:Bounds x="800" y="180" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_RotinaSemanal_di" bpmnElement="Task_RotinaSemanal">
        <dc:Bounds x="1060" y="180" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_LigacaoMensal_di" bpmnElement="Task_LigacaoMensal">
        <dc:Bounds x="1320" y="180" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Feliz_di" bpmnElement="Gateway_Feliz" isMarkerVisible="true">
        <dc:Bounds x="1580" y="195" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1565" y="155" width="80" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_PedeIndicacao_di" bpmnElement="Task_PedeIndicacao">
        <dc:Bounds x="1700" y="100" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ResolveNaHora_di" bpmnElement="Task_ResolveNaHora">
        <dc:Bounds x="1700" y="280" width="220" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_CartaoRecusou_di" bpmnElement="Start_CartaoRecusou">
        <dc:Bounds x="320" y="462" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="280" y="505" width="116" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_LigaNaHora_di" bpmnElement="Task_LigaNaHora">
        <dc:Bounds x="440" y="440" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Resolvido_di" bpmnElement="End_Resolvido">
        <dc:Bounds x="700" y="462" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="660" y="505" width="116" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNEdge id="F01_di" bpmnElement="F01">
        <di:waypoint x="258" y="672" />
        <di:waypoint x="258" y="220" />
        <di:waypoint x="320" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F02_di" bpmnElement="F02">
        <di:waypoint x="520" y="220" />
        <di:waypoint x="560" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F03_di" bpmnElement="F03">
        <di:waypoint x="760" y="220" />
        <di:waypoint x="800" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F04_di" bpmnElement="F04">
        <di:waypoint x="1020" y="220" />
        <di:waypoint x="1060" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F05_di" bpmnElement="F05">
        <di:waypoint x="1280" y="220" />
        <di:waypoint x="1320" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F06_di" bpmnElement="F06">
        <di:waypoint x="1540" y="220" />
        <di:waypoint x="1580" y="220" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F07_Sim_di" bpmnElement="F07_Sim">
        <di:waypoint x="1605" y="195" />
        <di:waypoint x="1605" y="140" />
        <di:waypoint x="1700" y="140" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1610" y="160" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F07_Nao_di" bpmnElement="F07_Nao">
        <di:waypoint x="1605" y="245" />
        <di:waypoint x="1605" y="320" />
        <di:waypoint x="1700" y="320" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1610" y="270" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F08_di" bpmnElement="F08">
        <di:waypoint x="1920" y="140" />
        <di:waypoint x="2458" y="140" />
        <di:waypoint x="2458" y="672" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F09_di" bpmnElement="F09">
        <di:waypoint x="1920" y="320" />
        <di:waypoint x="2458" y="320" />
        <di:waypoint x="2458" y="672" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FC1_di" bpmnElement="FC1">
        <di:waypoint x="356" y="480" />
        <di:waypoint x="440" y="480" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="FC2_di" bpmnElement="FC2">
        <di:waypoint x="660" y="480" />
        <di:waypoint x="700" y="480" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

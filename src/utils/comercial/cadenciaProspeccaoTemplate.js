/**
 * Template BPMN 2.0 — Cadencia de Prospeccao (12 toques em 14 dias)
 *
 * Aplicacao: lead recem-endossado pelo contador parceiro que NAO respondeu de primeira.
 * Filosofia: vendedor cara-de-pau. Ligacao converte 8-10x mais que mensagem.
 * Objetivo de cada toque: agendar 15min de demo, NAO fechar a venda no toque.
 *
 * 8 ligacoes + 4 WhatsApp em horarios variados (manha/almoco/tarde/noite).
 * Sai da cadencia quando o lead RESPONDE em qualquer toque.
 * No D14, se nao respondeu: vai pra stand-by 90d e tenta de novo.
 */

export const CADENCIA_PROSPECCAO_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_CadProspec" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_CadProspec">
    <bpmn:participant id="Pool_CadProspec" name="Cadencia de Prospeccao - 12 toques em 14 dias (8 ligacoes + 4 WhatsApp)" processRef="Process_CadProspec" />
  </bpmn:collaboration>
  <bpmn:process id="Process_CadProspec" isExecutable="false">
    <bpmn:laneSet id="LaneSet_CadProspec">
      <bpmn:lane id="Lane_Consultora" name="Voce (Consultora) - executa a cadencia">
        <bpmn:flowNodeRef>T01_D0_Wpp</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T02_D1_Lig1</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T03_D1_Lig2</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T04_D2_Lig3</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T05_D3_Wpp</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T06_D5_Lig4</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T08_D7_Lig5</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T09_D9_Lig6</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T10_D10_Wpp</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T11_D12_Lig7</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>T12_D14_Final</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Respondeu</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Kaynan" name="Kaynan (Fundador) - 1 toque no D6">
        <bpmn:flowNodeRef>T07_D6_KaynanAudio</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Cliente" name="Cliente (vindo do endosso do contador)">
        <bpmn:flowNodeRef>Start_Endosso</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Oportunidade</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Standby</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="Start_Endosso" name="Lead endossado pelo contador">
      <bpmn:documentation>QUANDO: Contador parceiro acabou de endossar voce com o cliente dele

REGRA
A cadencia comeca AINDA HOJE - o D0 e disparado no mesmo dia do endosso. Quanto mais cedo, mais quente esta o lead. Esperar 2-3 dias = perdeu o momento.</bpmn:documentation>
      <bpmn:outgoing>F01</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:userTask id="T01_D0_Wpp" name="D0 - WhatsApp&#10;Audio de 30s se apresentando">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D0 (mesmo dia do endosso, em ate 2h)

O QUE FAZER
Audio curto no WhatsApp do cliente se apresentando e mencionando o contador.

EXEMPLO DE FALA
"Oi [nome]! Aqui e a [consultora] da Fyness. O [Contador X] te falou da gente - ele que me pediu pra te procurar. Sei que voce ta ocupado, entao so queria me apresentar rapido. Te chamo amanha pra te mostrar tudo em 15min. Beleza?"

DICA
Audio (NUNCA texto). Tom de amiga, nao de atendimento.

SE NAO RESPONDER
Tudo bem, ja era esperado. Segue pra ligacao 1 no D1.</bpmn:documentation>
      <bpmn:incoming>F01</bpmn:incoming>
      <bpmn:outgoing>F02</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T02_D1_Lig1" name="D1 - 9h-10h&#10;Ligacao 1 (manha, antes do movimento)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D1 entre 9h e 10h da manha

O QUE FAZER
Liga pro telefone do cliente. NAO e pra fechar venda - e pra agendar 15min de demo.

EXEMPLO DE FALA SE ATENDER
"Oi [nome]! Aqui e a [consultora] da Fyness, te mandei audio ontem - o [contador] que me pediu pra te ligar. Posso te roubar 15 minutos hoje ou amanha pra te mostrar como funciona? Te chamo no horario que voce escolher."

SE ATENDER E DISSER "NAO TENHO TEMPO"
"Sem problema! Quando que e menos corrido pra voce? Eu encaixo no seu horario."

SE NAO ATENDER
Nao deixa voicemail nessa primeira. Segue pra ligacao 2 no fim do dia.</bpmn:documentation>
      <bpmn:incoming>F02</bpmn:incoming>
      <bpmn:outgoing>F03</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T03_D1_Lig2" name="D1 - 18h-19h&#10;Ligacao 2 (tarde, depois do movimento)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D1 entre 18h e 19h (mesmo dia da ligacao 1)

O QUE FAZER
Segunda ligacao no MESMO dia, mas em horario oposto - cliente pode ter ficado livre depois do expediente dele.

EXEMPLO DE FALA SE ATENDER
"Oi [nome]! Aqui e a [consultora] de novo - tentei te pegar mais cedo mas vi que voce tava ocupado. Tenho 5 minutos pra te explicar agora? Ou marca um horario melhor amanha?"

SE NAO ATENDER
Deixa voicemail curto: "Oi [nome], aqui e a [consultora] da Fyness, o [contador] te indicou. Te chamo amanha, me responde quando puder no WhatsApp."</bpmn:documentation>
      <bpmn:incoming>F03</bpmn:incoming>
      <bpmn:outgoing>F04</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T04_D2_Lig3" name="D2 - 13h (almoco)&#10;Ligacao 3 (horario diferente)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D2 por volta das 13h (horario de almoco)

O QUE FAZER
Liga no horario do almoco - varia a janela pra aumentar chance de pick up. Quem nao atende as 9h pode atender as 13h.

EXEMPLO DE FALA SE ATENDER
"Oi [nome]! Aqui e a [consultora] da Fyness. Pego voce no almoco? Sao 5 minutinhos, ou marca depois das 19h. Voce escolhe."

REGRA
Variar horario das ligacoes aumenta pick up rate em ~35%.</bpmn:documentation>
      <bpmn:incoming>F04</bpmn:incoming>
      <bpmn:outgoing>F05</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T05_D3_Wpp" name="D3 - WhatsApp&#10;Texto + visual (cartilha 1 pagina)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D3 (manha)

O QUE FAZER
Manda texto curto + 1 imagem (cartilha visual de 1 pagina mostrando o que a Fyness faz).

EXEMPLO DE FALA
"Oi [nome]! Tentei te ligar essas duas semanas - vou parar de te incomodar por telefone por hoje. Te mandei a Fyness aqui em 1 imagem pra voce dar uma olhada quando der tempo. Qualquer duvida, me chama."

DICA
Sem pedir resposta. So entrega valor visual. Ele pode salvar a imagem e voltar depois.</bpmn:documentation>
      <bpmn:incoming>F05</bpmn:incoming>
      <bpmn:outgoing>F06</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T06_D5_Lig4" name="D5 - 10h&#10;Ligacao 4 (manha de outro dia)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D5 por volta das 10h

O QUE FAZER
Volta pras ligacoes. Dia diferente da semana, horario que ja tentou (mas em dia diferente, o cliente pode estar livre).

EXEMPLO DE FALA SE ATENDER
"Oi [nome]! Aqui e a [consultora] - to voltando a te procurar. Voce conseguiu ver o que te mandei sexta? Me marca 15 minutinhos pra eu te mostrar tudo na pratica."

SE NAO ATENDER
Sem voicemail. Segue pro toque D6 (Kaynan).</bpmn:documentation>
      <bpmn:incoming>F06</bpmn:incoming>
      <bpmn:outgoing>F07</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T07_D6_KaynanAudio" name="D6 - 17h&#10;Audio do Kaynan (fundador chama direto)">
      <bpmn:documentation>QUEM FAZ: KAYNAN (fundador)
QUANDO: D6 por volta das 17h

O QUE FAZER
Audio pessoal do dono da empresa. Quebra o padrao "atendimento" - fundador chamando bate diferente.

EXEMPLO DE FALA
"E ai [nome], aqui e o Kaynan, dono da Fyness. Soube que o [contador] te apresentou a gente, e a [consultora] te procurou umas vezes. Olha, voce nao precisa marcar nada formal - me responde aqui 1 oi que eu mesmo te explico em 5 minutos como a gente pode te ajudar. Topa?"

POR QUE FUNCIONA
Cliente desse perfil (MEI/EPP) reage ao "dono". Reciprocidade + autoridade pessoal.

DICA
Kaynan grava 1 audio diferente pra cada lead. Custa 2 min, vale ouro.</bpmn:documentation>
      <bpmn:incoming>F07</bpmn:incoming>
      <bpmn:outgoing>F08</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T08_D7_Lig5" name="D7 - 19h&#10;Ligacao 5 (final do expediente)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D7 por volta das 19h

O QUE FAZER
Ligacao no fim do dia. Cliente do tipo dono-de-negocio costuma "respirar" depois das 19h.

EXEMPLO DE FALA SE ATENDER
"Oi [nome]! Boa noite, aqui e a [consultora] da Fyness. Pega voce ai? O Kaynan tinha te mandado um audio - voce viu? Me ajuda a entender se faz sentido a gente conversar ou nao."

PERGUNTA-CHAVE
"Faz sentido a gente conversar ou nao?" - da saida digna pro cliente E forca uma resposta. Se ele disser "nao agora", proximo passo. Se "nao quero", respeita.</bpmn:documentation>
      <bpmn:incoming>F08</bpmn:incoming>
      <bpmn:outgoing>F09</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T09_D9_Lig6" name="D9 - 11h&#10;Ligacao 6 (meio da manha)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D9 por volta das 11h

O QUE FAZER
Sexta ligacao. Hora de fazer uma pergunta DIFERENTE - quebrar o padrao "vamos marcar".

EXEMPLO DE FALA SE ATENDER
"Oi [nome]! Aqui e a [consultora]. Olha, deixa eu te perguntar 1 coisa direta - voce ainda controla as financas no caderno ou ja usa alguma coisa? Pergunta de curiosa mesmo."

POR QUE FUNCIONA
Pergunta de baixo atrito. Ele responde sem se comprometer. Conversa comecou.</bpmn:documentation>
      <bpmn:incoming>F09</bpmn:incoming>
      <bpmn:outgoing>F10</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T10_D10_Wpp" name="D10 - WhatsApp&#10;Video de cliente real (1min, formato vertical)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D10

O QUE FAZER
Manda no WhatsApp 1 video curto (45-60s, vertical) com depoimento de um cliente do mesmo perfil.

EXEMPLO DE FALA AO ENVIAR
"Oi [nome]! Te mando esse videozinho de 1 minuto - e a Dona Maria do salao, ela usa a Fyness ha 4 meses, ela conta como mudou pra ela. Acho que voce vai se identificar."

DICA
Autoridade social fala mais que pitch. Outro dono falando funciona 10x mais.</bpmn:documentation>
      <bpmn:incoming>F10</bpmn:incoming>
      <bpmn:outgoing>F11</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T11_D12_Lig7" name="D12 - 14h&#10;Ligacao 7 (pos-almoco)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D12 por volta das 14h

O QUE FAZER
Setima ligacao. Penultima ativa. Tom mais direto, sem rodeios.

EXEMPLO DE FALA SE ATENDER
"Oi [nome]! Aqui e a [consultora]. Olha, vou ser bem honesta - to tentando falar com voce ja faz quase 2 semanas. Voce viu o video da Dona Maria? Me da 5 minutos de telefone hoje ou amanha pra decidirmos se faz sentido pra voce ou nao."</bpmn:documentation>
      <bpmn:incoming>F11</bpmn:incoming>
      <bpmn:outgoing>F12</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="T12_D14_Final" name="D14 - 19h&#10;Ligacao 8 + WhatsApp despedida (ULTIMA chance)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: D14 (ultimo dia ativo da cadencia), 19h

O QUE FAZER
Ultima ligacao + WhatsApp final no mesmo dia. Tom: aceitacao serena, sem ressentimento.

LIGACAO 8 - FALA SE ATENDER
"Oi [nome]! Boa noite. Aqui e a [consultora] - to te ligando pra falar 1 minuto. Tentei umas vezes nessas 2 semanas mas vi que nao rolou. Voce ainda quer que eu te mostre como a Fyness funciona, ou prefere que eu pare de te procurar?"

WHATSAPP DESPEDIDA (apos a ligacao, mesmo se nao atendeu)
"Oi [nome], entendi que agora nao e o momento. Vou parar de te chamar pra nao te incomodar. Quando precisar, e so me mandar 1 oi aqui que retomo na hora. Sucesso ai!"

POR QUE FUNCIONA
A despedida ativa reciprocidade + saudade. 15-30% dos contatos respondem nesse ultimo toque - voce desistindo deles e o gatilho.</bpmn:documentation>
      <bpmn:incoming>F12</bpmn:incoming>
      <bpmn:outgoing>F13</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:exclusiveGateway id="Gateway_Respondeu" name="Respondeu em algum toque?">
      <bpmn:documentation>DECISAO

Importante: essa decisao acontece em CADA toque da cadencia, nao so no final. Assim que o cliente responde QUALQUER COISA (mensagem, ligacao, emoji), a cadencia PARA e voce entra em modo conversa.

CRITERIO
Em qualquer ponto dos 14 dias:
- SIM (respondeu) -- vira oportunidade no CRM, agenda demo de 15min
- NAO (nao respondeu nada) -- stand-by 90 dias

REGRA TECNICA NA AUTOMACAO
Quando lead responde, sistema pausa a cadencia automaticamente.</bpmn:documentation>
      <bpmn:incoming>F13</bpmn:incoming>
      <bpmn:outgoing>F14_Sim</bpmn:outgoing>
      <bpmn:outgoing>F14_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:endEvent id="End_Oportunidade" name="Oportunidade aberta&#10;Agenda demo de 15min">
      <bpmn:documentation>RESULTADO BOM

Lead respondeu, sai da cadencia automatica. Vira oportunidade ativa no pipeline.

PROXIMO PASSO
Marcar a demo de 15min (Google Meet/WhatsApp Video, tela compartilhada). Esse e o passo de venda real - cadencia foi so pra chegar nesse momento.</bpmn:documentation>
      <bpmn:incoming>F14_Sim</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:endEvent id="End_Standby" name="Stand-by 90 dias&#10;Reativa cadencia em [data + 90d]">
      <bpmn:documentation>RESULTADO PRO LEAD QUE NAO RESPONDEU

Lead nao respondeu em 14 dias e 12 toques. Vai pra stand-by 90 dias no CRM.

REGRA
- NAO ficar chamando depois do D14 (vira spam, queima a marca)
- Anotar no CRM tag "reativar em [data + 90d]"
- Em [data + 90d], dispara 1 mensagem nova: "Oi [nome], surgiu algo novo na Fyness, posso te mostrar?"
- Esse 2o round costuma converter melhor que o 1o - voce e "o que voltou"

QUANDO DESCARTAR DE VEZ
Se o lead disse "nao me liga mais" em qualquer ligacao, respeita. Tag "desqualificado - nao contatar".</bpmn:documentation>
      <bpmn:incoming>F14_Nao</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="F01" sourceRef="Start_Endosso" targetRef="T01_D0_Wpp" />
    <bpmn:sequenceFlow id="F02" sourceRef="T01_D0_Wpp" targetRef="T02_D1_Lig1" />
    <bpmn:sequenceFlow id="F03" sourceRef="T02_D1_Lig1" targetRef="T03_D1_Lig2" />
    <bpmn:sequenceFlow id="F04" sourceRef="T03_D1_Lig2" targetRef="T04_D2_Lig3" />
    <bpmn:sequenceFlow id="F05" sourceRef="T04_D2_Lig3" targetRef="T05_D3_Wpp" />
    <bpmn:sequenceFlow id="F06" sourceRef="T05_D3_Wpp" targetRef="T06_D5_Lig4" />
    <bpmn:sequenceFlow id="F07" sourceRef="T06_D5_Lig4" targetRef="T07_D6_KaynanAudio" />
    <bpmn:sequenceFlow id="F08" sourceRef="T07_D6_KaynanAudio" targetRef="T08_D7_Lig5" />
    <bpmn:sequenceFlow id="F09" sourceRef="T08_D7_Lig5" targetRef="T09_D9_Lig6" />
    <bpmn:sequenceFlow id="F10" sourceRef="T09_D9_Lig6" targetRef="T10_D10_Wpp" />
    <bpmn:sequenceFlow id="F11" sourceRef="T10_D10_Wpp" targetRef="T11_D12_Lig7" />
    <bpmn:sequenceFlow id="F12" sourceRef="T11_D12_Lig7" targetRef="T12_D14_Final" />
    <bpmn:sequenceFlow id="F13" sourceRef="T12_D14_Final" targetRef="Gateway_Respondeu" />
    <bpmn:sequenceFlow id="F14_Sim" name="Sim" sourceRef="Gateway_Respondeu" targetRef="End_Oportunidade" />
    <bpmn:sequenceFlow id="F14_Nao" name="Nao" sourceRef="Gateway_Respondeu" targetRef="End_Standby" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_CadProspec">
    <bpmndi:BPMNPlane id="BPMNPlane_CadProspec" bpmnElement="Collaboration_CadProspec">
      <bpmndi:BPMNShape id="Pool_CadProspec_di" bpmnElement="Pool_CadProspec" isHorizontal="true">
        <dc:Bounds x="160" y="80" width="3100" height="560" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Consultora_di" bpmnElement="Lane_Consultora" isHorizontal="true">
        <dc:Bounds x="190" y="80" width="3070" height="240" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Kaynan_di" bpmnElement="Lane_Kaynan" isHorizontal="true">
        <dc:Bounds x="190" y="320" width="3070" height="140" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Cliente_di" bpmnElement="Lane_Cliente" isHorizontal="true">
        <dc:Bounds x="190" y="460" width="3070" height="180" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_Endosso_di" bpmnElement="Start_Endosso">
        <dc:Bounds x="240" y="532" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="208" y="575" width="100" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Oportunidade_di" bpmnElement="End_Oportunidade">
        <dc:Bounds x="3160" y="500" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3115" y="543" width="126" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Standby_di" bpmnElement="End_Standby">
        <dc:Bounds x="3160" y="582" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3115" y="625" width="126" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="T01_D0_Wpp_di" bpmnElement="T01_D0_Wpp">
        <dc:Bounds x="320" y="160" width="180" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T02_D1_Lig1_di" bpmnElement="T02_D1_Lig1">
        <dc:Bounds x="540" y="160" width="170" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T03_D1_Lig2_di" bpmnElement="T03_D1_Lig2">
        <dc:Bounds x="750" y="160" width="170" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T04_D2_Lig3_di" bpmnElement="T04_D2_Lig3">
        <dc:Bounds x="960" y="160" width="170" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T05_D3_Wpp_di" bpmnElement="T05_D3_Wpp">
        <dc:Bounds x="1170" y="160" width="170" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T06_D5_Lig4_di" bpmnElement="T06_D5_Lig4">
        <dc:Bounds x="1380" y="160" width="170" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T07_D6_KaynanAudio_di" bpmnElement="T07_D6_KaynanAudio">
        <dc:Bounds x="1590" y="350" width="190" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T08_D7_Lig5_di" bpmnElement="T08_D7_Lig5">
        <dc:Bounds x="1820" y="160" width="170" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T09_D9_Lig6_di" bpmnElement="T09_D9_Lig6">
        <dc:Bounds x="2030" y="160" width="170" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T10_D10_Wpp_di" bpmnElement="T10_D10_Wpp">
        <dc:Bounds x="2240" y="160" width="170" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T11_D12_Lig7_di" bpmnElement="T11_D12_Lig7">
        <dc:Bounds x="2450" y="160" width="170" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="T12_D14_Final_di" bpmnElement="T12_D14_Final">
        <dc:Bounds x="2660" y="160" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Respondeu_di" bpmnElement="Gateway_Respondeu" isMarkerVisible="true">
        <dc:Bounds x="2920" y="175" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2900" y="135" width="100" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNEdge id="F01_di" bpmnElement="F01">
        <di:waypoint x="258" y="532" />
        <di:waypoint x="258" y="200" />
        <di:waypoint x="320" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F02_di" bpmnElement="F02">
        <di:waypoint x="500" y="200" />
        <di:waypoint x="540" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F03_di" bpmnElement="F03">
        <di:waypoint x="710" y="200" />
        <di:waypoint x="750" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F04_di" bpmnElement="F04">
        <di:waypoint x="920" y="200" />
        <di:waypoint x="960" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F05_di" bpmnElement="F05">
        <di:waypoint x="1130" y="200" />
        <di:waypoint x="1170" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F06_di" bpmnElement="F06">
        <di:waypoint x="1340" y="200" />
        <di:waypoint x="1380" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F07_di" bpmnElement="F07">
        <di:waypoint x="1550" y="200" />
        <di:waypoint x="1685" y="200" />
        <di:waypoint x="1685" y="350" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F08_di" bpmnElement="F08">
        <di:waypoint x="1780" y="390" />
        <di:waypoint x="1905" y="390" />
        <di:waypoint x="1905" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F09_di" bpmnElement="F09">
        <di:waypoint x="1990" y="200" />
        <di:waypoint x="2030" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F10_di" bpmnElement="F10">
        <di:waypoint x="2200" y="200" />
        <di:waypoint x="2240" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F11_di" bpmnElement="F11">
        <di:waypoint x="2410" y="200" />
        <di:waypoint x="2450" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F12_di" bpmnElement="F12">
        <di:waypoint x="2620" y="200" />
        <di:waypoint x="2660" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F13_di" bpmnElement="F13">
        <di:waypoint x="2880" y="200" />
        <di:waypoint x="2920" y="200" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F14_Sim_di" bpmnElement="F14_Sim">
        <di:waypoint x="2945" y="225" />
        <di:waypoint x="2945" y="518" />
        <di:waypoint x="3160" y="518" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2950" y="370" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F14_Nao_di" bpmnElement="F14_Nao">
        <di:waypoint x="2970" y="200" />
        <di:waypoint x="3050" y="200" />
        <di:waypoint x="3050" y="600" />
        <di:waypoint x="3160" y="600" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3055" y="400" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

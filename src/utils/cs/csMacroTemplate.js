/**
 * Template BPMN 2.0 — CS Macro Fyness
 * Visao geral das 6 fases de Customer Success pos-venda.
 *
 * 4 raias (lanes): Cliente · Consultora · Kaynan (Fundador) · Sistema
 *
 * Fluxo principal:
 * Contrato assinado
 *   -> 1. Implementacao Guiada (D0-D7)   -> TTV <=48h?
 *   -> 2. Ativacao (D8-D30)              -> 3 sem >=3 usos?
 *   -> 3. Habito (D31-D120)              -> Health >=70 no M3?
 *   -> 4. Expansao (M4-M11)
 *   -> 5. Renovacao Anual (M10-M12)      -> Renovou?
 *   -> 6. Advocacy (M12+)
 *   -> Cliente long-term 3+ anos
 *
 * Caminhos negativos -> Save Playbook (Kaynan intervem) -> Cliente churnou.
 *
 * Sistema executa: Health score 5 sinais, Resumo-sexta-17h, Dunning 7 passos.
 *
 * Modelo: High Touch (Consultora de Relacionamento dedicada).
 * Precos: mensal R$97 / anual R$67/mes (R$804 antecipados via cartao).
 * Contrato: mensal SEM fidelidade / anual com fidelidade 12m e multa proporcional.
 * SEM trial - entrada por contrato assinado COM CARENCIA DE PAGAMENTO (assina agora, paga depois de X dias).
 */

export const CS_MACRO_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_CSMacro" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_CS">
    <bpmn:participant id="Pool_CS" name="Customer Success Fyness - Visao Macro (6 Fases)" processRef="Process_CS" />
  </bpmn:collaboration>
  <bpmn:process id="Process_CS" isExecutable="false">
    <bpmn:laneSet id="LaneSet_CS">
      <bpmn:lane id="Lane_Cliente" name="Cliente">
        <bpmn:flowNodeRef>Start_Contrato</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_LongTerm</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Consultora" name="Consultora de Relacionamento">
        <bpmn:flowNodeRef>Task_1_Implementacao</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_1_TTV</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_2_Ativacao</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_2_Ativado</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_3_Habito</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_3_Health</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_4_Expansao</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_5_Renovacao</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_4_Renovou</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_6_Advocacy</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Kaynan" name="Kaynan (Fundador) - Intervencao">
        <bpmn:flowNodeRef>Task_Save_Playbook</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_Aprovar_Upgrade</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_Churn</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Sistema" name="Sistema (CRM + WhatsApp + Asaas)">
        <bpmn:flowNodeRef>Task_HealthScore</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ResumoSexta</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_Dunning</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="Start_Contrato" name="Contrato assinado (D0)">
      <bpmn:documentation>QUANDO: Cliente assina contrato no Asaas (mensal R$97 ou anual R$67/mes = R$804 antecipado)

O QUE ACONTECE
Comeca o ciclo de CS. Cliente vai direto pra Fase 1 - nao tem mais trial.

ATENCAO: CARENCIA DE PAGAMENTO
O cliente assina agora mas comeca a pagar depois de X dias. Ou seja, no inicio ele ainda nao pagou nada. Risco: pode sumir antes da 1a cobranca. Por isso a Implementacao (Fase 1) tem que prender ele rapido.</bpmn:documentation>
      <bpmn:outgoing>Flow_01</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:userTask id="Task_1_Implementacao" name="1. Implementacao Guiada (D0-D7)&#10;Call D1 + Call D7 + TTV &lt;=48h">
      <bpmn:documentation>FASE 1 (D0 ate D7)

OBJETIVO
Cliente sai da semana usando a Fyness e gostando da Consultora.

METAS
- TTV (1a conta + 1a venda + 1o pagamento) ate 48h
- NPS de onboarding &gt;=8
- 100% participam da call D1

VER DETALHES
Diagrama "1. Implementacao Guiada".</bpmn:documentation>
      <bpmn:incoming>Flow_01</bpmn:incoming>
      <bpmn:outgoing>Flow_02</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:exclusiveGateway id="Gateway_1_TTV" name="TTV &lt;=48h?">
      <bpmn:documentation>DECISAO NO D7

CRITERIO
Cliente cadastrou 1a conta + 1a venda + 1o pagamento em ate 48h?

SIM -- vai pra Fase 2 (Ativacao)
NAO -- escala Kaynan via Save Playbook</bpmn:documentation>
      <bpmn:incoming>Flow_02</bpmn:incoming>
      <bpmn:outgoing>Flow_03_Sim</bpmn:outgoing>
      <bpmn:outgoing>Flow_03_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:userTask id="Task_2_Ativacao" name="2. Ativacao (D8-D30)&#10;3 semanas >=3 usos + check-in M1">
      <bpmn:documentation>FASE 2 (D8 ate D30)

OBJETIVO
Cliente forma habito de uso. Esse e o momento de maior risco no mensal (sem fidelidade ele cancela na proxima cobranca se nao formar habito).

METAS
- 3 semanas seguidas com pelo menos 3 usos
- NPS na ligacao do M1 &gt;=7
- Nenhum sinal de querer cancelar

VER DETALHES
Diagrama "2. Ativacao".</bpmn:documentation>
      <bpmn:incoming>Flow_03_Sim</bpmn:incoming>
      <bpmn:outgoing>Flow_04</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:exclusiveGateway id="Gateway_2_Ativado" name="Ativado?">
      <bpmn:documentation>DECISAO NO D30

CRITERIO
- 3 semanas seguidas com &gt;=3 usos
- Cliente responde a Consultora
- NPS M1 &gt;=7

SIM -- vai pra Fase 3 (Habito)
NAO -- Save Playbook</bpmn:documentation>
      <bpmn:incoming>Flow_04</bpmn:incoming>
      <bpmn:outgoing>Flow_05_Sim</bpmn:outgoing>
      <bpmn:outgoing>Flow_05_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:userTask id="Task_3_Habito" name="3. Habito (D31-D120)&#10;Resumo sexta + EBR-audio + check-in M3">
      <bpmn:documentation>FASE 3 (D31 ate D120, do M2 ao M4)

OBJETIVO
Consolida o habito e cria vinculo profundo com Consultora e Kaynan.

O QUE ACONTECE
- Resumo-sexta-17h continua toda semana
- Check-ins mensais da Consultora
- EBR-audio do Kaynan no M3 (2-3min com insights especificos)

RISCO PRINCIPAL
Silent churn - cliente esquece que assina. Por isso o resumo-sexta e obrigatorio.

VER DETALHES
Diagrama "3. Habito".</bpmn:documentation>
      <bpmn:incoming>Flow_05_Sim</bpmn:incoming>
      <bpmn:outgoing>Flow_06</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:exclusiveGateway id="Gateway_3_Health" name="Health &gt;=70 no M3?">
      <bpmn:documentation>DECISAO NO M3 (D90)

CRITERIO
Health Score &gt;=70?
- Uso regular
- Pagou em dia
- NPS &gt;=7
- Sem atraso

SIM -- vai pra Fase 4 (Expansao)
NAO -- Save Playbook (Kaynan liga pessoalmente)</bpmn:documentation>
      <bpmn:incoming>Flow_06</bpmn:incoming>
      <bpmn:outgoing>Flow_07_Sim</bpmn:outgoing>
      <bpmn:outgoing>Flow_07_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:userTask id="Task_4_Expansao" name="4. Expansao (M4-M11)&#10;Trigger (funcionario/2a loja) -&gt; upgrade Starter-Pro">
      <bpmn:documentation>FASE 4 (M4 ate M11)

OBJETIVO
Converter cliente Starter pra Pro quando aparecer momento natural.

REGRA DE OURO
So aborda upgrade se TIVER OS DOIS:
- Trigger natural (2a loja, contratou funcionario, faturamento +50%)
- Health Score &gt;=80

Sem isso, NAO insiste - queima a relacao.

META
20% dos Starter migram pra Pro ate o M12.

VER DETALHES
Diagrama "4. Expansao".</bpmn:documentation>
      <bpmn:incoming>Flow_07_Sim</bpmn:incoming>
      <bpmn:outgoing>Flow_08</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_5_Renovacao" name="5. Renovacao Anual (M10-M12)&#10;Migrar mensal-&gt;anual + renovar anuais +12m">
      <bpmn:documentation>FASE 5 (M10 ate M12)

OBJETIVO
Renovar contrato antes do cliente comecar a pensar em sair.

2 FLUXOS
- Cliente MENSAL recebe oferta de migrar pra anual (R$67/mes + 13o gratis + kit)
- Cliente ANUAL recebe oferta de renovar +12m

METAS
- 40% dos mensais migram pra anual
- 80% dos anuais renovam

VER DETALHES
Diagrama "5. Renovacao Anual".</bpmn:documentation>
      <bpmn:incoming>Flow_08</bpmn:incoming>
      <bpmn:outgoing>Flow_09</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:exclusiveGateway id="Gateway_4_Renovou" name="Renovou?">
      <bpmn:documentation>DECISAO NO M12

SIM -- vai pra Fase 6 (Advocacy) se NPS &gt;=9
NAO -- cliente segue como mensal (pode cancelar) ou churna no fim do anual. Catalogar motivo + post-mortem com Kaynan.</bpmn:documentation>
      <bpmn:incoming>Flow_09</bpmn:incoming>
      <bpmn:outgoing>Flow_10_Sim</bpmn:outgoing>
      <bpmn:outgoing>Flow_10_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:userTask id="Task_6_Advocacy" name="6. Advocacy (M12+)&#10;NPS &gt;=9 -&gt; indicacao + case + comunidade">
      <bpmn:documentation>FASE 6 (M12 em diante)

PRE-REQUISITO
- Chegou no M12
- Renovou
- NPS &gt;=9 (promotor real)

OBJETIVO
Transforma cliente fiel em canal de aquisicao (indicacoes) e em caso de marca (depoimentos publicos).

METAS
- 1 indicacao convertida por cliente por ano
- 15% do novo MRR vem de indicacoes
- 5 cases publicados por trimestre

VER DETALHES
Diagrama "6. Advocacy".</bpmn:documentation>
      <bpmn:incoming>Flow_10_Sim</bpmn:incoming>
      <bpmn:outgoing>Flow_11</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:endEvent id="End_LongTerm" name="Cliente long-term 3+ anos">
      <bpmn:documentation>RESULTADO IDEAL

Cliente que renovou + indica + virou case publico.

NUMEROS QUE A FYNESS BUSCA
- NDR (mantem dinheiro) &gt;=115%
- 85% dos clientes ficam ate o M12
- NPS medio &gt;=50

E o objetivo principal do CS Macro.</bpmn:documentation>
      <bpmn:incoming>Flow_11</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:userTask id="Task_Save_Playbook" name="Save Playbook&#10;Kaynan intervem em risco (health &lt;40, NPS detrator, sinal de churn)">
      <bpmn:documentation>QUEM FAZ: KAYNAN (nao a Consultora)
QUANDO: Sempre que cliente entra em risco em qualquer fase

PASSOS
1. Identifica o que esta travando (caixa, tecnico, expectativa, vida pessoal)
2. Oferece solucao customizada pra esse caso (nao receita pronta)
3. Reenquadra o valor pra realidade do cliente
4. Anota motivo no CRM pra ajustar o processo de aquisicao

DICA
Cada save playbook vira aprendizado. Se o mesmo motivo aparece muitas vezes, algo precisa mudar.</bpmn:documentation>
      <bpmn:incoming>Flow_03_Nao</bpmn:incoming>
      <bpmn:incoming>Flow_05_Nao</bpmn:incoming>
      <bpmn:incoming>Flow_07_Nao</bpmn:incoming>
      <bpmn:outgoing>Flow_Save_Out</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_Aprovar_Upgrade" name="Aprovar upgrade / exception&#10;Kaynan autoriza upsell, desconto, condicao especial">
      <bpmn:documentation>QUEM FAZ: Kaynan (fundador)
QUANDO: Quando a Consultora pede aprovacao especial

O QUE FAZER
Autoriza desconto, parcelamento ou condicao especial em 3 momentos:
- Fase 4 (Expansao - aprovar oferta de upgrade)
- Fase 5 (Renovacao - negociacao especial)
- Dunning passo 5 e 6 (recuperar pagamento)

REGRA
Usa o contexto que a Consultora documentou pra decidir.</bpmn:documentation>
      <bpmn:incoming>Flow_Approve_In</bpmn:incoming>
      <bpmn:outgoing>Flow_Approve_Out</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:endEvent id="End_Churn" name="Cliente churnou&#10;Catalogar motivo + post-mortem">
      <bpmn:documentation>RESULTADO RUIM - Cliente saiu

ACAO OBRIGATORIA
1. Anota motivo no CRM (tag de churn)
2. Faz post-mortem com Kaynan
3. Se for padrao recorrente, atualiza o processo de aquisicao
4. Se for por problema do produto, escala pro time tecnico</bpmn:documentation>
      <bpmn:incoming>Flow_Save_Out</bpmn:incoming>
      <bpmn:incoming>Flow_10_Nao</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:serviceTask id="Task_HealthScore" name="Health Score 5 sinais&#10;Uso(30) + Pagamento(25) + NPS(20) + Override-rate(15) + Outreach(10)">
      <bpmn:documentation>QUEM FAZ: Sistema (automatico)
QUANDO: Toda semana, em todas as fases

O QUE FAZER
Calcula a nota de saude do cliente (0-100) com 5 sinais:

- Uso semanal: 30 pontos
- Pagamento em dia: 25 pontos
- NPS: 20 pontos
- Override da IA: 15 pontos
- Responde a Consultora: 10 pontos

THRESHOLDS
- Abaixo de 40: alerta Kaynan (Save Playbook)
- Entre 40 e 69: Consultora intensifica contato
- Acima de 70: saudavel
- Acima de 85: candidato a Expansao</bpmn:documentation>
      <bpmn:outgoing>Flow_HS_Out</bpmn:outgoing>
    </bpmn:serviceTask>

    <bpmn:serviceTask id="Task_ResumoSexta" name="Resumo-sexta-17h auto&#10;WhatsApp com tendencia do caixa do cliente (gancho de habito)">
      <bpmn:documentation>QUEM FAZ: Sistema (automatico)
QUANDO: Toda sexta as 17h, em todas as fases

O QUE FAZER
Manda no WhatsApp do cliente um resumo da semana com audio + imagem mostrando a tendencia do caixa.

POR QUE E IMPORTANTE
E o gancho de habito principal. Sem ele, o cliente esquece que assina e o churn no M3 dobra.

DICA
Nao confundir com check-in da Consultora (que e personalizado por cliente).</bpmn:documentation>
      <bpmn:incoming>Flow_HS_Out</bpmn:incoming>
      <bpmn:outgoing>Flow_Resumo_Out</bpmn:outgoing>
    </bpmn:serviceTask>

    <bpmn:serviceTask id="Task_Dunning" name="Dunning 7 passos&#10;Cartao recusado: retry+PIX+WhatsApp+ligacao em 7d">
      <bpmn:documentation>QUEM FAZ: Sistema (auto) + Consultora + Kaynan
QUANDO: Quando o cartao do cliente e recusado (cliente que JA esta pagando)

ATENCAO: NAO confundir com cliente em CARENCIA
Esse fluxo so roda APOS o cliente ja ter passado a carencia e ja estar pagando. Cliente em carencia que some antes da 1a cobranca tem outro tratamento (ver: Watch de Carencia abaixo).

OS 7 PASSOS EM 7 DIAS
1. T+0 (na hora): retry automatico
2. T+2h: WhatsApp suave + link de PIX
3. T+24h: novo retry + reenvio do PIX
4. T+48h: Consultora liga
5. T+72h: "paga so esse mes via PIX, normaliza no proximo"
6. T+5d: Kaynan liga pessoalmente
7. T+7d: pausa-nao-cancela (suspende cobranca 30d, mantem conta ativa)

META
Recuperar 60% dos cartoes recusados em 7 dias.

TRATAMENTO PARALELO - WATCH DE CARENCIA
Cliente em carencia (ainda nao pagou nada) que para de responder por 2+ dias:
- Kaynan liga PESSOAL (nao Consultora)
- NAO mencionar pagamento - mencionar valor da ferramenta
- Cliente que some na carencia = aquisicao falhou, nao retencao
- Anotar no CRM como "no-show de carencia" pra ajustar processo de venda</bpmn:documentation>
      <bpmn:incoming>Flow_Resumo_Out</bpmn:incoming>
      <bpmn:outgoing>Flow_Approve_In</bpmn:outgoing>
    </bpmn:serviceTask>

    <!-- Sequence flows -->
    <bpmn:sequenceFlow id="Flow_01" sourceRef="Start_Contrato" targetRef="Task_1_Implementacao" />
    <bpmn:sequenceFlow id="Flow_02" sourceRef="Task_1_Implementacao" targetRef="Gateway_1_TTV" />
    <bpmn:sequenceFlow id="Flow_03_Sim" name="Sim" sourceRef="Gateway_1_TTV" targetRef="Task_2_Ativacao" />
    <bpmn:sequenceFlow id="Flow_03_Nao" name="Nao" sourceRef="Gateway_1_TTV" targetRef="Task_Save_Playbook" />
    <bpmn:sequenceFlow id="Flow_04" sourceRef="Task_2_Ativacao" targetRef="Gateway_2_Ativado" />
    <bpmn:sequenceFlow id="Flow_05_Sim" name="Sim" sourceRef="Gateway_2_Ativado" targetRef="Task_3_Habito" />
    <bpmn:sequenceFlow id="Flow_05_Nao" name="Nao" sourceRef="Gateway_2_Ativado" targetRef="Task_Save_Playbook" />
    <bpmn:sequenceFlow id="Flow_06" sourceRef="Task_3_Habito" targetRef="Gateway_3_Health" />
    <bpmn:sequenceFlow id="Flow_07_Sim" name="Sim" sourceRef="Gateway_3_Health" targetRef="Task_4_Expansao" />
    <bpmn:sequenceFlow id="Flow_07_Nao" name="Nao" sourceRef="Gateway_3_Health" targetRef="Task_Save_Playbook" />
    <bpmn:sequenceFlow id="Flow_08" sourceRef="Task_4_Expansao" targetRef="Task_5_Renovacao" />
    <bpmn:sequenceFlow id="Flow_09" sourceRef="Task_5_Renovacao" targetRef="Gateway_4_Renovou" />
    <bpmn:sequenceFlow id="Flow_10_Sim" name="Sim" sourceRef="Gateway_4_Renovou" targetRef="Task_6_Advocacy" />
    <bpmn:sequenceFlow id="Flow_10_Nao" name="Nao" sourceRef="Gateway_4_Renovou" targetRef="End_Churn" />
    <bpmn:sequenceFlow id="Flow_11" sourceRef="Task_6_Advocacy" targetRef="End_LongTerm" />
    <bpmn:sequenceFlow id="Flow_Save_Out" sourceRef="Task_Save_Playbook" targetRef="End_Churn" />
    <bpmn:sequenceFlow id="Flow_HS_Out" sourceRef="Task_HealthScore" targetRef="Task_ResumoSexta" />
    <bpmn:sequenceFlow id="Flow_Resumo_Out" sourceRef="Task_ResumoSexta" targetRef="Task_Dunning" />
    <bpmn:sequenceFlow id="Flow_Approve_In" sourceRef="Task_Dunning" targetRef="Task_Aprovar_Upgrade" />
    <bpmn:sequenceFlow id="Flow_Approve_Out" sourceRef="Task_Aprovar_Upgrade" targetRef="Task_Save_Playbook" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_CS">
    <bpmndi:BPMNPlane id="BPMNPlane_CS" bpmnElement="Collaboration_CS">
      <bpmndi:BPMNShape id="Pool_CS_di" bpmnElement="Pool_CS" isHorizontal="true">
        <dc:Bounds x="160" y="80" width="2380" height="720" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Cliente_di" bpmnElement="Lane_Cliente" isHorizontal="true">
        <dc:Bounds x="190" y="80" width="2350" height="140" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Consultora_di" bpmnElement="Lane_Consultora" isHorizontal="true">
        <dc:Bounds x="190" y="220" width="2350" height="220" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Kaynan_di" bpmnElement="Lane_Kaynan" isHorizontal="true">
        <dc:Bounds x="190" y="440" width="2350" height="160" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Sistema_di" bpmnElement="Lane_Sistema" isHorizontal="true">
        <dc:Bounds x="190" y="600" width="2350" height="200" />
      </bpmndi:BPMNShape>

      <!-- Cliente lane -->
      <bpmndi:BPMNShape id="Start_Contrato_di" bpmnElement="Start_Contrato">
        <dc:Bounds x="240" y="132" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="218" y="175" width="82" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_LongTerm_di" bpmnElement="End_LongTerm">
        <dc:Bounds x="2310" y="132" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2275" y="175" width="106" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- Consultora lane -->
      <bpmndi:BPMNShape id="Task_1_Implementacao_di" bpmnElement="Task_1_Implementacao">
        <dc:Bounds x="320" y="290" width="180" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_1_TTV_di" bpmnElement="Gateway_1_TTV" isMarkerVisible="true">
        <dc:Bounds x="540" y="305" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="535" y="280" width="60" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_2_Ativacao_di" bpmnElement="Task_2_Ativacao">
        <dc:Bounds x="630" y="290" width="180" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_2_Ativado_di" bpmnElement="Gateway_2_Ativado" isMarkerVisible="true">
        <dc:Bounds x="850" y="305" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="850" y="280" width="50" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_3_Habito_di" bpmnElement="Task_3_Habito">
        <dc:Bounds x="940" y="290" width="180" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_3_Health_di" bpmnElement="Gateway_3_Health" isMarkerVisible="true">
        <dc:Bounds x="1160" y="305" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1150" y="280" width="70" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_4_Expansao_di" bpmnElement="Task_4_Expansao">
        <dc:Bounds x="1250" y="290" width="190" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_5_Renovacao_di" bpmnElement="Task_5_Renovacao">
        <dc:Bounds x="1490" y="290" width="190" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_4_Renovou_di" bpmnElement="Gateway_4_Renovou" isMarkerVisible="true">
        <dc:Bounds x="1720" y="305" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1720" y="280" width="55" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_6_Advocacy_di" bpmnElement="Task_6_Advocacy">
        <dc:Bounds x="1810" y="290" width="190" height="80" />
      </bpmndi:BPMNShape>

      <!-- Kaynan lane -->
      <bpmndi:BPMNShape id="Task_Save_Playbook_di" bpmnElement="Task_Save_Playbook">
        <dc:Bounds x="830" y="470" width="220" height="90" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Aprovar_Upgrade_di" bpmnElement="Task_Aprovar_Upgrade">
        <dc:Bounds x="1290" y="470" width="220" height="90" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Churn_di" bpmnElement="End_Churn">
        <dc:Bounds x="2310" y="495" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2270" y="538" width="116" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <!-- Sistema lane -->
      <bpmndi:BPMNShape id="Task_HealthScore_di" bpmnElement="Task_HealthScore">
        <dc:Bounds x="320" y="660" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ResumoSexta_di" bpmnElement="Task_ResumoSexta">
        <dc:Bounds x="650" y="660" width="220" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Dunning_di" bpmnElement="Task_Dunning">
        <dc:Bounds x="990" y="660" width="240" height="80" />
      </bpmndi:BPMNShape>

      <!-- Edges -->
      <bpmndi:BPMNEdge id="Flow_01_di" bpmnElement="Flow_01">
        <di:waypoint x="258" y="168" />
        <di:waypoint x="258" y="330" />
        <di:waypoint x="320" y="330" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_02_di" bpmnElement="Flow_02">
        <di:waypoint x="500" y="330" />
        <di:waypoint x="540" y="330" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_03_Sim_di" bpmnElement="Flow_03_Sim">
        <di:waypoint x="590" y="330" />
        <di:waypoint x="630" y="330" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="598" y="312" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_03_Nao_di" bpmnElement="Flow_03_Nao">
        <di:waypoint x="565" y="355" />
        <di:waypoint x="565" y="470" />
        <di:waypoint x="830" y="500" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="570" y="400" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_04_di" bpmnElement="Flow_04">
        <di:waypoint x="810" y="330" />
        <di:waypoint x="850" y="330" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_05_Sim_di" bpmnElement="Flow_05_Sim">
        <di:waypoint x="900" y="330" />
        <di:waypoint x="940" y="330" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="908" y="312" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_05_Nao_di" bpmnElement="Flow_05_Nao">
        <di:waypoint x="875" y="355" />
        <di:waypoint x="875" y="470" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="880" y="400" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_06_di" bpmnElement="Flow_06">
        <di:waypoint x="1120" y="330" />
        <di:waypoint x="1160" y="330" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_07_Sim_di" bpmnElement="Flow_07_Sim">
        <di:waypoint x="1210" y="330" />
        <di:waypoint x="1250" y="330" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1218" y="312" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_07_Nao_di" bpmnElement="Flow_07_Nao">
        <di:waypoint x="1185" y="355" />
        <di:waypoint x="1185" y="470" />
        <di:waypoint x="1050" y="500" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1190" y="400" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_08_di" bpmnElement="Flow_08">
        <di:waypoint x="1440" y="330" />
        <di:waypoint x="1490" y="330" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_09_di" bpmnElement="Flow_09">
        <di:waypoint x="1680" y="330" />
        <di:waypoint x="1720" y="330" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_10_Sim_di" bpmnElement="Flow_10_Sim">
        <di:waypoint x="1770" y="330" />
        <di:waypoint x="1810" y="330" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1778" y="312" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_10_Nao_di" bpmnElement="Flow_10_Nao">
        <di:waypoint x="1745" y="355" />
        <di:waypoint x="1745" y="513" />
        <di:waypoint x="2310" y="513" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1750" y="430" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_11_di" bpmnElement="Flow_11">
        <di:waypoint x="2000" y="330" />
        <di:waypoint x="2328" y="330" />
        <di:waypoint x="2328" y="168" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Save_Out_di" bpmnElement="Flow_Save_Out">
        <di:waypoint x="1050" y="515" />
        <di:waypoint x="2310" y="513" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_HS_Out_di" bpmnElement="Flow_HS_Out">
        <di:waypoint x="540" y="700" />
        <di:waypoint x="650" y="700" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Resumo_Out_di" bpmnElement="Flow_Resumo_Out">
        <di:waypoint x="870" y="700" />
        <di:waypoint x="990" y="700" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Approve_In_di" bpmnElement="Flow_Approve_In">
        <di:waypoint x="1230" y="700" />
        <di:waypoint x="1400" y="700" />
        <di:waypoint x="1400" y="560" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Approve_Out_di" bpmnElement="Flow_Approve_Out">
        <di:waypoint x="1290" y="515" />
        <di:waypoint x="1050" y="515" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

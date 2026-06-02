/**
 * Template BPMN 2.0 — CS Fase 5: Renovacao Anual (M10-M12)
 *
 * 2 fluxos paralelos (gateway de tipo de plano):
 *   - Cliente MENSAL no M10: oferta migrar pra ANUAL (R$97 -> R$67/mes + bonus 13o mes)
 *   - Cliente ANUAL no M10: oferta renovar +12m (preco mantido + bonus + brinde)
 *
 * Mensal sem fidelidade -> migracao pra anual e a melhor defesa contra churn.
 * Anual com fidelidade -> renovacao antecipada captura o cliente antes do M12.
 *
 * 4 lanes: Cliente · Consultora · Kaynan · Sistema
 */

export const CS_05_RENOVACAO_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_CS05" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:collaboration id="Collaboration_CS05">
    <bpmn:participant id="Pool_CS05" name="CS Fase 5 - Renovacao Anual (M10-M12) - Meta: 40% mensal-&gt;anual + 80% renovacao anuais" processRef="Process_CS05" />
  </bpmn:collaboration>
  <bpmn:process id="Process_CS05" isExecutable="false">
    <bpmn:laneSet id="LaneSet_CS05">
      <bpmn:lane id="Lane_Cliente" name="Cliente">
        <bpmn:flowNodeRef>Start_M10</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_RenovouAnual</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>End_NaoRenovou</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Consultora" name="Consultora de Relacionamento">
        <bpmn:flowNodeRef>Task_PitchMigracao</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_PitchRenovacao</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_Aceitou</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Kaynan" name="Kaynan (Fundador)">
        <bpmn:flowNodeRef>Task_NegociacaoEspecial</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_KaynanFechou</bpmn:flowNodeRef>
      </bpmn:lane>
      <bpmn:lane id="Lane_Sistema" name="Sistema (CRM + Asaas)">
        <bpmn:flowNodeRef>Task_IdentificarPlano</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Gateway_TipoPlano</bpmn:flowNodeRef>
        <bpmn:flowNodeRef>Task_ProcessarContrato</bpmn:flowNodeRef>
      </bpmn:lane>
    </bpmn:laneSet>

    <bpmn:startEvent id="Start_M10" name="M10 chegou + health &gt;=70">
      <bpmn:documentation>QUANDO: M10 do cliente (cliente com health &gt;=70 e pagando em dia)

O QUE ACONTECE
Janela de 3 meses (M10 ate M12) pra renovar o contrato ANTES do cliente comecar a pensar em sair.</bpmn:documentation>
      <bpmn:outgoing>F01</bpmn:outgoing>
    </bpmn:startEvent>

    <bpmn:serviceTask id="Task_IdentificarPlano" name="Identificar tipo de plano do cliente&#10;Mensal sem fidelidade ou Anual com fidelidade">
      <bpmn:documentation>QUEM FAZ: Sistema (automatico)
QUANDO: Quando cliente chega no M10

O QUE FAZER
Identifica se o cliente esta no plano:
- Mensal (R$97, sem fidelidade) OU
- Anual (R$67/mes, fidelidade 12m)

Roteia pra um dos 2 fluxos.</bpmn:documentation>
      <bpmn:incoming>F01</bpmn:incoming>
      <bpmn:outgoing>F02</bpmn:outgoing>
    </bpmn:serviceTask>

    <bpmn:exclusiveGateway id="Gateway_TipoPlano" name="Tipo de plano?">
      <bpmn:documentation>DECISAO DE ROTEAMENTO

MENSAL -- pitch de migracao pra anual (proteger contra churn)
ANUAL -- pitch de renovacao por mais 12 meses</bpmn:documentation>
      <bpmn:incoming>F02</bpmn:incoming>
      <bpmn:outgoing>F03_Mensal</bpmn:outgoing>
      <bpmn:outgoing>F03_Anual</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:userTask id="Task_PitchMigracao" name="Pitch migracao mensal-&gt;anual&#10;R$67/mes (-30%) + 13o mes gratis + brinde fisico (kit Fyness)">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: Cliente MENSAL chegou no M10

O QUE OFERECER
- R$67/mes (em vez de R$97) - cerca de 30% de desconto
- 13o mes gratis
- Brinde fisico (kit Fyness customizado)

EXEMPLO DE FALA
"Oi [nome]! Ja sao 10 meses de Fyness juntos. Quero te fazer uma proposta especial - se voce migrar pra anual agora, o valor cai pra R$67 (em vez de R$97), voce ganha o 13o mes de Fyness gratis e ainda te mando um kit aqui em casa. No fim do ano, sao R$427 a mais no seu bolso. Que tal?"

ARGUMENTO RACIONAL
Economia anual de R$427 (R$360 de desconto + R$67 do 13o mes gratis).

ARGUMENTO EMOCIONAL
Cliente vira "VIP" da Fyness.</bpmn:documentation>
      <bpmn:incoming>F03_Mensal</bpmn:incoming>
      <bpmn:outgoing>F04</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:userTask id="Task_PitchRenovacao" name="Pitch renovacao anual (+12m)&#10;Preco mantido R$67/mes + bonus desconto 1o mes da nova vigencia + kit Fyness">
      <bpmn:documentation>QUEM FAZ: Consultora
QUANDO: Cliente ANUAL chegou no M10

O QUE OFERECER
- Renovar por mais 12 meses
- Preco mantido em R$67/mes (sem reajuste)
- Bonus: 1o mes da nova vigencia com desconto
- Kit Fyness fisico

EXEMPLO DE FALA
"Oi [nome]! Faltam 2 mesinhos pra renovacao. Quero ja te dar uma proposta antecipada: renovamos mais 12 meses com o mesmo valor de R$67, dou um desconto no 1o mes da nova vigencia e te mando um kit aqui. Combinado?"

DICA
Reforcar o vinculo construido nos 12 meses + insights especificos do negocio do cliente.</bpmn:documentation>
      <bpmn:incoming>F03_Anual</bpmn:incoming>
      <bpmn:outgoing>F04</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:exclusiveGateway id="Gateway_Aceitou" name="Cliente aceitou?">
      <bpmn:documentation>DECISAO DO PITCH PADRAO

SIM -- sistema processa contrato
NAO -- escala Kaynan pra negociacao especial (NAO deixa o cliente "pensar mais" sem ouvir o Kaynan)</bpmn:documentation>
      <bpmn:incoming>F04</bpmn:incoming>
      <bpmn:outgoing>F05_Sim</bpmn:outgoing>
      <bpmn:outgoing>F05_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:userTask id="Task_NegociacaoEspecial" name="Negociacao especial do Kaynan&#10;Audio pessoal + condicao customizada (parcelar, abater, gift card)">
      <bpmn:documentation>QUEM FAZ: Kaynan (fundador)
QUANDO: Cliente recusou pitch padrao da Consultora

O QUE FAZER
1. Audio pessoal pro cliente
2. Condicao customizada conforme o contexto:
   - Parcelar diferente
   - Abater valor especial
   - Gift card de servico parceiro
   - Sessao 1:1 com Kaynan
   - Mentoria pontual

REGRA
Custa caro. So usar quando vale a pena (Health alto + cliente que indica ou comenta).

EXEMPLO DE FALA NO AUDIO
"E ai [nome]! Aqui e o Kaynan. Soube que voce ta pensando, e quero falar contigo direto. Voce ja faz parte da nossa familia. Topa [condicao customizada]?"</bpmn:documentation>
      <bpmn:incoming>F05_Nao</bpmn:incoming>
      <bpmn:outgoing>F06</bpmn:outgoing>
    </bpmn:userTask>

    <bpmn:exclusiveGateway id="Gateway_KaynanFechou" name="Fechou?">
      <bpmn:documentation>DECISAO APOS NEGOCIACAO DO KAYNAN

SIM -- sistema processa contrato
NAO -- cliente segue como esta (pode churnar). Anotar motivo no CRM pra post-mortem.</bpmn:documentation>
      <bpmn:incoming>F06</bpmn:incoming>
      <bpmn:outgoing>F07_Sim</bpmn:outgoing>
      <bpmn:outgoing>F07_Nao</bpmn:outgoing>
    </bpmn:exclusiveGateway>

    <bpmn:serviceTask id="Task_ProcessarContrato" name="Processar novo contrato no Asaas&#10;Antecipa 12 parcelas (R$804) via cartao + ativa fidelidade 12m">
      <bpmn:documentation>QUEM FAZ: Sistema (automatico)
QUANDO: Cliente aceitou (pitch padrao ou negociacao)

O QUE FAZER
1. Antecipa 12 parcelas (R$804) no cartao do cliente
2. Ativa fidelidade 12m no CRM
3. Envia confirmacao + recibo no WhatsApp
4. Despacha o kit Fyness fisico (se foi ofertado)
5. Atualiza dashboard de NDR</bpmn:documentation>
      <bpmn:incoming>F05_Sim</bpmn:incoming>
      <bpmn:incoming>F07_Sim</bpmn:incoming>
      <bpmn:outgoing>F08</bpmn:outgoing>
    </bpmn:serviceTask>

    <bpmn:endEvent id="End_RenovouAnual" name="Renovou anual -&gt; Fase 6 (Advocacy)">
      <bpmn:documentation>RESULTADO BOM - Cliente renovou

PROXIMO PASSO
- Se NPS &gt;=9: vai pra Fase 6 (Advocacy) - vira indicador e case
- Se NPS &lt;9: segue no ciclo normal (Habito + Expansao + nova Renovacao em 12m)</bpmn:documentation>
      <bpmn:incoming>F08</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:endEvent id="End_NaoRenovou" name="Nao renovou -&gt; segue mensal ou churna no fim do anual">
      <bpmn:documentation>RESULTADO RUIM - Cliente nao renovou

O QUE ACONTECE
- Mensal: continua como mensal, mas pode cancelar a qualquer momento
- Anual: termina o contrato atual e sai limpo no fim

ACAO
Catalogar motivo + fazer post-mortem com Kaynan pra entender o que deu errado.</bpmn:documentation>
      <bpmn:incoming>F07_Nao</bpmn:incoming>
    </bpmn:endEvent>

    <bpmn:sequenceFlow id="F01" sourceRef="Start_M10" targetRef="Task_IdentificarPlano" />
    <bpmn:sequenceFlow id="F02" sourceRef="Task_IdentificarPlano" targetRef="Gateway_TipoPlano" />
    <bpmn:sequenceFlow id="F03_Mensal" name="Mensal" sourceRef="Gateway_TipoPlano" targetRef="Task_PitchMigracao" />
    <bpmn:sequenceFlow id="F03_Anual" name="Anual" sourceRef="Gateway_TipoPlano" targetRef="Task_PitchRenovacao" />
    <bpmn:sequenceFlow id="F04" sourceRef="Task_PitchMigracao" targetRef="Gateway_Aceitou" />
    <bpmn:sequenceFlow id="F04b" sourceRef="Task_PitchRenovacao" targetRef="Gateway_Aceitou" />
    <bpmn:sequenceFlow id="F05_Sim" name="Sim" sourceRef="Gateway_Aceitou" targetRef="Task_ProcessarContrato" />
    <bpmn:sequenceFlow id="F05_Nao" name="Nao" sourceRef="Gateway_Aceitou" targetRef="Task_NegociacaoEspecial" />
    <bpmn:sequenceFlow id="F06" sourceRef="Task_NegociacaoEspecial" targetRef="Gateway_KaynanFechou" />
    <bpmn:sequenceFlow id="F07_Sim" name="Sim" sourceRef="Gateway_KaynanFechou" targetRef="Task_ProcessarContrato" />
    <bpmn:sequenceFlow id="F07_Nao" name="Nao" sourceRef="Gateway_KaynanFechou" targetRef="End_NaoRenovou" />
    <bpmn:sequenceFlow id="F08" sourceRef="Task_ProcessarContrato" targetRef="End_RenovouAnual" />
  </bpmn:process>

  <bpmndi:BPMNDiagram id="BPMNDiagram_CS05">
    <bpmndi:BPMNPlane id="BPMNPlane_CS05" bpmnElement="Collaboration_CS05">
      <bpmndi:BPMNShape id="Pool_CS05_di" bpmnElement="Pool_CS05" isHorizontal="true">
        <dc:Bounds x="160" y="80" width="2300" height="780" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Cliente_di" bpmnElement="Lane_Cliente" isHorizontal="true">
        <dc:Bounds x="190" y="80" width="2270" height="140" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Consultora_di" bpmnElement="Lane_Consultora" isHorizontal="true">
        <dc:Bounds x="190" y="220" width="2270" height="260" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Kaynan_di" bpmnElement="Lane_Kaynan" isHorizontal="true">
        <dc:Bounds x="190" y="480" width="2270" height="160" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Lane_Sistema_di" bpmnElement="Lane_Sistema" isHorizontal="true">
        <dc:Bounds x="190" y="640" width="2270" height="220" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_M10_di" bpmnElement="Start_M10">
        <dc:Bounds x="240" y="132" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="200" y="175" width="116" height="27" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_RenovouAnual_di" bpmnElement="End_RenovouAnual">
        <dc:Bounds x="2340" y="132" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2295" y="175" width="126" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_NaoRenovou_di" bpmnElement="End_NaoRenovou">
        <dc:Bounds x="2340" y="552" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="2290" y="595" width="136" height="40" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_IdentificarPlano_di" bpmnElement="Task_IdentificarPlano">
        <dc:Bounds x="320" y="710" width="240" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_TipoPlano_di" bpmnElement="Gateway_TipoPlano" isMarkerVisible="true">
        <dc:Bounds x="620" y="725" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="600" y="780" width="100" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_PitchMigracao_di" bpmnElement="Task_PitchMigracao">
        <dc:Bounds x="780" y="260" width="240" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_PitchRenovacao_di" bpmnElement="Task_PitchRenovacao">
        <dc:Bounds x="780" y="380" width="240" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Aceitou_di" bpmnElement="Gateway_Aceitou" isMarkerVisible="true">
        <dc:Bounds x="1080" y="325" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1060" y="295" width="100" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_NegociacaoEspecial_di" bpmnElement="Task_NegociacaoEspecial">
        <dc:Bounds x="1240" y="510" width="240" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_KaynanFechou_di" bpmnElement="Gateway_KaynanFechou" isMarkerVisible="true">
        <dc:Bounds x="1540" y="525" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1530" y="580" width="80" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_ProcessarContrato_di" bpmnElement="Task_ProcessarContrato">
        <dc:Bounds x="1900" y="710" width="240" height="80" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNEdge id="F01_di" bpmnElement="F01">
        <di:waypoint x="258" y="168" />
        <di:waypoint x="258" y="750" />
        <di:waypoint x="320" y="750" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F02_di" bpmnElement="F02">
        <di:waypoint x="560" y="750" />
        <di:waypoint x="620" y="750" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F03_Mensal_di" bpmnElement="F03_Mensal">
        <di:waypoint x="645" y="725" />
        <di:waypoint x="645" y="300" />
        <di:waypoint x="780" y="300" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="650" y="510" width="40" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F03_Anual_di" bpmnElement="F03_Anual">
        <di:waypoint x="670" y="750" />
        <di:waypoint x="730" y="750" />
        <di:waypoint x="730" y="420" />
        <di:waypoint x="780" y="420" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="735" y="585" width="40" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F04_di" bpmnElement="F04">
        <di:waypoint x="1020" y="300" />
        <di:waypoint x="1105" y="300" />
        <di:waypoint x="1105" y="325" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F04b_di" bpmnElement="F04b">
        <di:waypoint x="1020" y="420" />
        <di:waypoint x="1105" y="420" />
        <di:waypoint x="1105" y="375" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F05_Sim_di" bpmnElement="F05_Sim">
        <di:waypoint x="1130" y="350" />
        <di:waypoint x="2020" y="350" />
        <di:waypoint x="2020" y="710" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1500" y="332" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F05_Nao_di" bpmnElement="F05_Nao">
        <di:waypoint x="1105" y="375" />
        <di:waypoint x="1105" y="550" />
        <di:waypoint x="1240" y="550" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1110" y="455" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F06_di" bpmnElement="F06">
        <di:waypoint x="1480" y="550" />
        <di:waypoint x="1540" y="550" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F07_Sim_di" bpmnElement="F07_Sim">
        <di:waypoint x="1590" y="550" />
        <di:waypoint x="2020" y="550" />
        <di:waypoint x="2020" y="710" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1700" y="532" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F07_Nao_di" bpmnElement="F07_Nao">
        <di:waypoint x="1565" y="575" />
        <di:waypoint x="1565" y="570" />
        <di:waypoint x="2340" y="570" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1900" y="552" width="20" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="F08_di" bpmnElement="F08">
        <di:waypoint x="2140" y="750" />
        <di:waypoint x="2358" y="750" />
        <di:waypoint x="2358" y="168" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

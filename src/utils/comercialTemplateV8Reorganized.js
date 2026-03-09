/**
 * Template BPMN - JORNADA COMERCIAL FYNESS V8 (REORGANIZADO)
 * Versão reorganizada do V7 com Link Events - Mantendo TODO o conteúdo original
 *
 * RAIAS:
 * 1. Outbound (Sniper) - Lead Frio/EPP - 7 dias Trial - COR: Vermelho
 * 2. Base de Educação (Comunidade) - Lead Quente/Fã - 30 dias Trial - COR: Verde
 * 3. Google Ads (Urgência) - Lead Morno/Pressa - 7 dias Trial - COR: Azul
 * 4. Meta/SEO (Autoridade) - Lead Morno/Dor - 7 dias Trial - COR: Roxo
 * 5. Núcleo: Recuperação & Blindagem - Gateway Financeiro Asaas - COR: Cinza
 *
 * ORGANIZAÇÃO: Usando Link Events para eliminar linhas cruzadas entre raias
 */

export const COMERCIAL_V8_REORGANIZED_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0"
  xmlns:color="http://www.omg.org/spec/BPMN/non-normative/color/1.0"
  id="Definitions_MapaGuerra_v5"
  targetNamespace="http://fyness.com/bpmn/mapaguerra">

  <bpmn2:collaboration id="Collaboration_MapaGuerra">
    <bpmn2:participant id="Participant_MapaGuerra" name="MAPA DE GUERRA FYNESS - 4 Raias Mestras" processRef="Process_MapaGuerra" />
  </bpmn2:collaboration>

  <bpmn2:process id="Process_MapaGuerra" isExecutable="false">

    <!-- ==================== DEFINICAO DAS 5 RAIAS ==================== -->
    <bpmn2:laneSet id="LaneSet_MapaGuerra">

      <!-- RAIA 1: OUTBOUND (SNIPER) -->
      <bpmn2:lane id="Lane_Outbound" name="RAIA 1: OUTBOUND - O Sniper (Lead Frio/EPP - 7d Trial)" bioc:stroke="#ff6b6b" bioc:fill="#ffe0e0">
        <bpmn2:flowNodeRef>Start_Outbound</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_MineracaoCNPJ</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_EmailAbertura</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_LigacaoManha</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_AtendeuManha</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_AgendaTarde</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_LigacaoTarde</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_AtendeuTarde</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_FlashDemo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_AceitouTrial_Out</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_LiberaTrial7d_Out</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D1_Valor_Out</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D3_Video_Out</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D5_Relatorio_Out</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D7_Fechamento_Out</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_Conversao_Out</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>LinkThrow_Out_Checkout</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_GrupoNurturing_Out</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>End_Bloqueio_Out</bpmn2:flowNodeRef>
      </bpmn2:lane>

      <!-- RAIA 2: BASE DE EDUCACAO (COMUNIDADE) -->
      <bpmn2:lane id="Lane_Alunos" name="RAIA 2: ALUNOS - A Comunidade (Lead Quente/Fa - 30d Trial)" bioc:stroke="#51cf66" bioc:fill="#e0ffe0">
        <bpmn2:flowNodeRef>Start_Alunos</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_AulaGestao</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_LinkVIP30d</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D0_Onboarding_Alu</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D1_D14_Automacao</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D15_Checkin</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D25_OfertaAnual</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D30_Fechamento_Alu</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_Conversao_Alu</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>LinkThrow_Alu_Checkout</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_GrupoNurturing_Alu</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>End_Bloqueio_Alu</bpmn2:flowNodeRef>
      </bpmn2:lane>

      <!-- RAIA 3: GOOGLE ADS (URGENCIA) -->
      <bpmn2:lane id="Lane_Google" name="RAIA 3: GOOGLE ADS - A Urgencia (Lead Morno/Pressa - 7d Trial)" bioc:stroke="#4dabf7" bioc:fill="#e0f0ff">
        <bpmn2:flowNodeRef>Start_Google</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_LP_Google</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_TipoConversao_Goo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_SelfService_Goo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_WhatsApp_Goo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_SpeedToLead_Goo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_PitchDor_Goo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_LiberaTrial7d_Goo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D1_Followup_Goo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D3_Pressao_Goo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D5_Urgencia_Goo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D7_Fechamento_Goo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_Conversao_Goo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>LinkThrow_Goo_Checkout</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_GrupoNurturing_Goo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>End_Bloqueio_Goo</bpmn2:flowNodeRef>
      </bpmn2:lane>

      <!-- RAIA 4: META ADS & SEO (AUTORIDADE) -->
      <bpmn2:lane id="Lane_Meta" name="RAIA 4: META/SEO - A Autoridade (Lead Morno/Dor - 7d Trial)" bioc:stroke="#9775fa" bioc:fill="#f0e0ff">
        <bpmn2:flowNodeRef>Start_Meta</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_IscaDigital</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_ContatoConsultivo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_EducacaoVideos</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_ConviteTrial_Meta</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_LiberaTrial7d_Meta</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D1_ProvaSocial_Meta</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D4_Case_Meta</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D7_Fechamento_Meta</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D10_UltimaChance_Meta</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_Conversao_Meta</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>LinkThrow_Meta_Checkout</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_GrupoNurturing_Meta</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>End_Bloqueio_Meta</bpmn2:flowNodeRef>
      </bpmn2:lane>

      <!-- NUCLEO: RECUPERACAO & BLINDAGEM -->
      <bpmn2:lane id="Lane_Nucleo" name="NUCLEO: RECUPERACAO e BLINDAGEM - Gateway Financeiro Asaas" bioc:stroke="#868e96" bioc:fill="#f0f0f0">
        <bpmn2:flowNodeRef>Gateway_Checkout</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>LinkCatch_From_Out</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>LinkCatch_From_Alu</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>LinkCatch_From_Goo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>LinkCatch_From_Meta</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_PagamentoSucesso</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_Split30</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_OnboardingPago</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_FalhaSaldo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_OfertaSemestral</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_AbandonoCarrinho</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_OfertaTrimestral</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_Guardiao48h</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_ResgateManual</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>End_ClienteAtivo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>End_Churn</bpmn2:flowNodeRef>
      </bpmn2:lane>

    </bpmn2:laneSet>

    <!-- ==================== RAIA 1: OUTBOUND (SNIPER) ==================== -->

    <bpmn2:startEvent id="Start_Outbound" name="Mineracao de Dados">
      <bpmn2:documentation>GATILHO RAIA 1 - OUTBOUND (SNIPER)
Foco: Donos de ME/EPP que NAO conhecem a Fyness.
Lead: FRIO
Prazo Trial: 7 DIAS

Mineracao de listas de CNPJ recem-desenquadrados (MEI->ME).</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Out_1</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:serviceTask id="Task_MineracaoCNPJ" name="Extracao Lista CNPJ (MEI->ME/EPP)">
      <bpmn2:documentation>MINERACAO DE DADOS:
- CNPJs que mudaram de MEI para ME nos ultimos 6 meses
- EPPs de nichos especificos (servicos, comercio)
- Faturamento estimado: R$81k - R$4.8M/ano

Dados coletados: CNPJ, Nome, WhatsApp, LinkedIn</bpmn2:documentation>
      <bpmn2:incoming>Flow_Out_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Out_2</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_EmailAbertura" name="TOQUE 1: E-mail de Abertura (Quebra-gelo)">
      <bpmn2:documentation>TOQUE 1 - EMAIL DE ABERTURA:
Assunto: "[Nome], sua ME esta crescendo - posso ajudar?"

Conteudo: Quebra-gelo consultivo, sem vender.
Foco em mostrar que entende a dor da transicao MEI->ME.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Out_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Out_3</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:userTask id="Task_LigacaoManha" name="TOQUE 2: Ligacao (Manha)">
      <bpmn2:documentation>TOQUE 2 - LIGACAO MANHA:
Horario: 9h-12h
Objetivo: Contato direto com decisor.

Script: "Oi [Nome], tudo bem? Sou da Fyness, vi que sua empresa
cresceu recentemente. Como esta sendo organizar as financas?"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Out_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Out_4</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_AtendeuManha" name="Atendeu?">
      <bpmn2:incoming>Flow_Out_4</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Out_5_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Out_5_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:task id="Task_AgendaTarde" name="Agenda Retorno (Tarde)">
      <bpmn2:documentation>NAO ATENDEU DE MANHA:
Agendar nova tentativa para periodo da tarde (14h-18h).</bpmn2:documentation>
      <bpmn2:incoming>Flow_Out_5_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Out_6</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:userTask id="Task_LigacaoTarde" name="TOQUE 3: Ligacao (Tarde)">
      <bpmn2:documentation>TOQUE 3 - LIGACAO TARDE:
Horario: 14h-18h
Segunda tentativa de contato direto.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Out_6</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Out_7</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_AtendeuTarde" name="Atendeu?">
      <bpmn2:incoming>Flow_Out_7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Out_8_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Out_8_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:userTask id="Task_FlashDemo" name="FLASH DEMO (Audio Zap + Prova na Linha)">
      <bpmn2:documentation>FLASH DEMO - O MOMENTO MAGICO:
Quando atender (manha ou tarde):

1. Envia audio no WhatsApp NA HORA mostrando a IA
2. Prova o valor na linha: "Deixa eu te mostrar algo em 2 min"
3. Compartilha tela ou envia video curto

Objetivo: Gerar o "UAU" instantaneo.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Out_5_Sim</bpmn2:incoming>
      <bpmn2:incoming>Flow_Out_8_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Out_9</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_AceitouTrial_Out" name="Aceitou Trial?">
      <bpmn2:incoming>Flow_Out_9</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Out_10_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Out_10_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:serviceTask id="Task_LiberaTrial7d_Out" name="Libera Trial 7 Dias">
      <bpmn2:documentation>LIBERACAO DO TRIAL - 7 DIAS:
- Cria conta no sistema
- Envia credenciais via WhatsApp
- Inicia sequencia de acompanhamento D1-D7</bpmn2:documentation>
      <bpmn2:incoming>Flow_Out_10_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Out_11</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_D1_Valor_Out" name="D1: Mensagem de Valor">
      <bpmn2:documentation>DIA 1 - MENSAGEM DE VALOR:
"Oi [Nome]! Como foi o primeiro dia? Ja mandou algum audio pra IA?
Qualquer duvida, me chama!"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Out_11</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Out_12</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D3_Video_Out" name="D3: Video de Relatorio">
      <bpmn2:documentation>DIA 3 - VIDEO DE RELATORIO:
Envia video curto mostrando como gerar relatorios automaticos.
"Olha que legal esse relatorio que a IA monta pra voce!"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Out_12</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Out_13</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D5_Relatorio_Out" name="D5: Relatorio Personalizado">
      <bpmn2:documentation>DIA 5 - RELATORIO PERSONALIZADO:
Envia print/PDF do dashboard do lead com os dados reais dele.
"[Nome], olha como esta ficando sua visao financeira!"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Out_13</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Out_14</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:userTask id="Task_D7_Fechamento_Out" name="D7: Ligacao de Fechamento + Oferta Anual">
      <bpmn2:documentation>DIA 7 - GATILHO DE REATIVACAO:
Ligacao de fechamento obrigatoria.

Pitch: "Seus 7 dias acabam hoje! Vi que voce usou bastante.
Quer garantir o Plano Anual com desconto especial?"

Oferta: Plano Anual R$1.497 (equivale a R$124/mes)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Out_14</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Out_15</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_Conversao_Out" name="Converteu?">
      <bpmn2:incoming>Flow_Out_15</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Out_Checkout</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Out_Descarte</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    
    <bpmn2:serviceTask id="Task_GrupoNurturing_Out" name="Adicionar em Grupo WhatsApp (Promoções Outbound)">
      <bpmn2:documentation>NURTURING - GRUPO WHATSAPP:
Lead que não converteu no trial é adicionado em grupo de WhatsApp para:
- Receber promoções especiais
- Conteúdo educacional sobre gestão financeira
- Ofertas de reativação
CONSIDERADO PERDIDO: Apenas se bloquear/sair do grupo</bpmn2:documentation>
      <bpmn2:incoming>Flow_Out_ToNurturing</bpmn2:incoming>
      <bpmn2:incoming>Flow_Out_8_Nao</bpmn2:incoming>
      <bpmn2:incoming>Flow_Out_10_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Out_Bloqueio</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sequenceFlow id="Flow_Out_Bloqueio" sourceRef="Task_GrupoNurturing_Out" targetRef="End_Bloqueio_Out" />
    <bpmn2:endEvent id="End_Bloqueio_Out" name="Bloqueou/Saiu do Grupo">
      <bpmn2:documentation>Lead nao converteu apos Trial de 7 dias.
Mover para lista de reativacao futura (30-60 dias).</bpmn2:documentation>
      <bpmn2:incoming>Flow_Out_Bloqueio</bpmn2:incoming>
      <bpmn2:incoming>Flow_Out_8_Nao</bpmn2:incoming>
      <bpmn2:incoming>Flow_Out_10_Nao</bpmn2:incoming>
    </bpmn2:endEvent>

    <!-- Sequence Flows - RAIA 1 -->
    <bpmn2:sequenceFlow id="Flow_Out_1" sourceRef="Start_Outbound" targetRef="Task_MineracaoCNPJ" />
    <bpmn2:sequenceFlow id="Flow_Out_2" sourceRef="Task_MineracaoCNPJ" targetRef="Task_EmailAbertura" />
    <bpmn2:sequenceFlow id="Flow_Out_3" sourceRef="Task_EmailAbertura" targetRef="Task_LigacaoManha" />
    <bpmn2:sequenceFlow id="Flow_Out_4" sourceRef="Task_LigacaoManha" targetRef="Gateway_AtendeuManha" />
    <bpmn2:sequenceFlow id="Flow_Out_5_Sim" name="Sim" sourceRef="Gateway_AtendeuManha" targetRef="Task_FlashDemo" />
    <bpmn2:sequenceFlow id="Flow_Out_5_Nao" name="Nao" sourceRef="Gateway_AtendeuManha" targetRef="Task_AgendaTarde" />
    <bpmn2:sequenceFlow id="Flow_Out_6" sourceRef="Task_AgendaTarde" targetRef="Task_LigacaoTarde" />
    <bpmn2:sequenceFlow id="Flow_Out_7" sourceRef="Task_LigacaoTarde" targetRef="Gateway_AtendeuTarde" />
    <bpmn2:sequenceFlow id="Flow_Out_8_Sim" name="Sim" sourceRef="Gateway_AtendeuTarde" targetRef="Task_FlashDemo" />
    <bpmn2:sequenceFlow id="Flow_Out_8_Nao" name="Nao" sourceRef="Gateway_AtendeuTarde" targetRef="Task_GrupoNurturing_Out" />
    <bpmn2:sequenceFlow id="Flow_Out_9" sourceRef="Task_FlashDemo" targetRef="Gateway_AceitouTrial_Out" />
    <bpmn2:sequenceFlow id="Flow_Out_10_Sim" name="Sim" sourceRef="Gateway_AceitouTrial_Out" targetRef="Task_LiberaTrial7d_Out" />
    <bpmn2:sequenceFlow id="Flow_Out_10_Nao" name="Nao" sourceRef="Gateway_AceitouTrial_Out" targetRef="Task_GrupoNurturing_Out" />
    <bpmn2:sequenceFlow id="Flow_Out_11" sourceRef="Task_LiberaTrial7d_Out" targetRef="Task_D1_Valor_Out" />
    <bpmn2:sequenceFlow id="Flow_Out_12" sourceRef="Task_D1_Valor_Out" targetRef="Task_D3_Video_Out" />
    <bpmn2:sequenceFlow id="Flow_Out_13" sourceRef="Task_D3_Video_Out" targetRef="Task_D5_Relatorio_Out" />
    <bpmn2:sequenceFlow id="Flow_Out_14" sourceRef="Task_D5_Relatorio_Out" targetRef="Task_D7_Fechamento_Out" />
    <bpmn2:sequenceFlow id="Flow_Out_15" sourceRef="Task_D7_Fechamento_Out" targetRef="Gateway_Conversao_Out" />
    <bpmn2:sequenceFlow id="Flow_Out_Checkout" name="Sim - Para Checkout" sourceRef="Gateway_Conversao_Out" targetRef="LinkThrow_Out_Checkout" />
    <bpmn2:sequenceFlow id="Flow_Out_Descarte" name="Nao" sourceRef="Gateway_Conversao_Out" targetRef="Task_GrupoNurturing_Out" />

    <!-- ==================== RAIA 2: ALUNOS (COMUNIDADE) ==================== -->

    <bpmn2:startEvent id="Start_Alunos" name="Aula de Gestao Financeira">
      <bpmn2:documentation>GATILHO RAIA 2 - ALUNOS (COMUNIDADE)
Foco: Quem JA e aluno e confia na metodologia.
Lead: QUENTE
Prazo Trial: 30 DIAS

Gatilho: Aula de Gestao Financeira dentro da plataforma do curso.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Alu_1</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_AulaGestao" name="Aula: Gestao Financeira com IA">
      <bpmn2:documentation>AULA DENTRO DO CURSO:
Conteudo educativo sobre gestao financeira.
No final da aula: CTA para o Trial VIP de 30 dias.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Alu_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Alu_2</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:serviceTask id="Task_LinkVIP30d" name="Link VIP: 30 Dias Trial Gratis">
      <bpmn2:documentation>DIFERENCIAL DE ALUNO:
Link exclusivo para 30 dias de Trial (vs 7 dias padrao).
"Como voce e meu aluno, quero te dar 30 dias pra testar de verdade!"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Alu_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Alu_3</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_D0_Onboarding_Alu" name="D0: Onboarding via Zap (Primeiro Lancamento)">
      <bpmn2:documentation>DIA 0 - ONBOARDING:
Tutorial rapido de "Primeiro Lancamento" via WhatsApp.
Video de 2 min + passo a passo em texto.

"Bora fazer seu primeiro lancamento? Segue o passo a passo!"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Alu_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Alu_4</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:serviceTask id="Task_D1_D14_Automacao" name="D1-D14: Automacoes Semanais (Uso IA vs Aula)">
      <bpmn2:documentation>DIAS 1-14 - MONITORAMENTO:
Automacoes semanais comparando:
- O que o aluno esta usando na IA
- O que foi ensinado na aula

Mensagens tipo:
"Vi que voce ainda nao categorizou despesas. Lembra da aula X?"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Alu_4</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Alu_5</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:userTask id="Task_D15_Checkin" name="D15: Check-in de Sucesso (Ligacao Consultoria)">
      <bpmn2:documentation>DIA 15 - CHECK-IN DE SUCESSO:
Ligacao de Consultoria obrigatoria.

O vendedor/tutor analisa os DADOS REAIS do aluno e valida progresso.
"Oi [Nome], olhei seu dashboard e vi que voce ja tem X lancamentos.
Como esta sendo a experiencia? Posso te ajudar em algo?"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Alu_5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Alu_6</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:sendTask id="Task_D25_OfertaAnual" name="D25: Oferta Upgrade Anual (Bonus Aluno)">
      <bpmn2:documentation>DIA 25 - CONVERSAO ANTECIPADA:
Oferta de upgrade para Plano Anual com BONUS EXCLUSIVO de aluno.

"[Nome], como voce e aluno, tenho uma condicao especial:
Plano Anual R$1.497 + 2 meses gratis de consultoria!"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Alu_6</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Alu_7</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:userTask id="Task_D30_Fechamento_Alu" name="D30: Fechamento Final (Bloqueio ou Conversao)">
      <bpmn2:documentation>DIA 30 - FECHAMENTO FINAL:
Ligacao definitiva. Duas opcoes:

A) CONVERTE: Vai para checkout
B) NAO CONVERTE: Bloqueio de acesso imediato

"Seus 30 dias acabam hoje. Vamos garantir seu acesso?"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Alu_7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Alu_8</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_Conversao_Alu" name="Converteu?">
      <bpmn2:incoming>Flow_Alu_8</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Alu_Checkout</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Alu_Bloqueio</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    
    <bpmn2:serviceTask id="Task_GrupoNurturing_Alu" name="Adicionar em Grupo Comunidade (Educação Continuada)">
      <bpmn2:documentation>NURTURING - GRUPO COMUNIDADE:
Aluno que não converteu continua no grupo da comunidade para:
- Aulas mensais gratuitas
- Networking com outros empreendedores
- Ofertas exclusivas de reativação
CONSIDERADO PERDIDO: Apenas se bloquear/sair do grupo</bpmn2:documentation>
      <bpmn2:incoming>Flow_Alu_ToNurturing</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Alu_Bloqueio_Final</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sequenceFlow id="Flow_Alu_Bloqueio_Final" sourceRef="Task_GrupoNurturing_Alu" targetRef="End_Bloqueio_Alu" />
    <bpmn2:endEvent id="End_Bloqueio_Alu" name="Bloqueou/Saiu da Comunidade">
      <bpmn2:documentation>Aluno nao converteu apos 30 dias.
Bloqueio de acesso + mover para lista de reativacao.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Alu_Bloqueio_Final</bpmn2:incoming>
    </bpmn2:endEvent>

    <!-- Sequence Flows - RAIA 2 -->
    <bpmn2:sequenceFlow id="Flow_Alu_1" sourceRef="Start_Alunos" targetRef="Task_AulaGestao" />
    <bpmn2:sequenceFlow id="Flow_Alu_2" sourceRef="Task_AulaGestao" targetRef="Task_LinkVIP30d" />
    <bpmn2:sequenceFlow id="Flow_Alu_3" sourceRef="Task_LinkVIP30d" targetRef="Task_D0_Onboarding_Alu" />
    <bpmn2:sequenceFlow id="Flow_Alu_4" sourceRef="Task_D0_Onboarding_Alu" targetRef="Task_D1_D14_Automacao" />
    <bpmn2:sequenceFlow id="Flow_Alu_5" sourceRef="Task_D1_D14_Automacao" targetRef="Task_D15_Checkin" />
    <bpmn2:sequenceFlow id="Flow_Alu_6" sourceRef="Task_D15_Checkin" targetRef="Task_D25_OfertaAnual" />
    <bpmn2:sequenceFlow id="Flow_Alu_7" sourceRef="Task_D25_OfertaAnual" targetRef="Task_D30_Fechamento_Alu" />
    <bpmn2:sequenceFlow id="Flow_Alu_8" sourceRef="Task_D30_Fechamento_Alu" targetRef="Gateway_Conversao_Alu" />
    <bpmn2:sequenceFlow id="Flow_Alu_Checkout" name="Sim - Para Checkout" sourceRef="Gateway_Conversao_Alu" targetRef="LinkThrow_Alu_Checkout" />
    <bpmn2:sequenceFlow id="Flow_Alu_Bloqueio" name="Nao" sourceRef="Gateway_Conversao_Alu" targetRef="Task_GrupoNurturing_Alu" />

    <!-- ==================== RAIA 3: GOOGLE ADS (URGENCIA) ==================== -->

    <bpmn2:startEvent id="Start_Google" name="Clique Anuncio Google">
      <bpmn2:documentation>GATILHO RAIA 3 - GOOGLE ADS (URGENCIA)
Foco: Lead que buscou por "Contabilidade", "Gestao" ou "IA Financeira".
Lead: MORNO (com PRESSA)
Prazo Trial: 7 DIAS

Gatilho: Clique no anuncio de busca.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Goo_1</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_LP_Google" name="Landing Page Alta Conversao">
      <bpmn2:documentation>LANDING PAGE - GOOGLE ADS:
Foco: Velocidade e Preco.

Headline: "Organize as financas da sua empresa em 5 min/dia com IA"

DUAS OPCOES DE CTA:
A) "ASSINAR AGORA" - Self-Service (vai direto pro checkout)
B) "FALAR COM ESPECIALISTA" - WhatsApp</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_2</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_TipoConversao_Goo" name="Tipo de Conversao?">
      <bpmn2:incoming>Flow_Goo_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_SelfService</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Assistida</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:serviceTask id="Task_SelfService_Goo" name="OPCAO A: Self-Service (Checkout Direto)">
      <bpmn2:documentation>CONVERSAO SELF-SERVICE:
Lead clica em "Assinar Agora" e vai DIRETO para o Checkout.
Pula toda a jornada de trial - vai direto pro Nucleo Financeiro.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_SelfService</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Direct_Checkout</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_WhatsApp_Goo" name="OPCAO B: WhatsApp (Venda Assistida)">
      <bpmn2:documentation>CONVERSAO ASSISTIDA:
Lead clica no botao de WhatsApp.
Mensagem pre-preenchida: "Oi! Vim do Google, quero conhecer o Fyness!"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Assistida</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_3</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:serviceTask id="Task_SpeedToLead_Goo" name="Speed to Lead: Zap Auto (Min 0) + Ligacao 5min">
      <bpmn2:documentation>SPEED TO LEAD - ACAO COMERCIAL:
- Minuto 0: Zap automatico de boas-vindas
- Menos de 5 min: Ligacao do vendedor

"Oi [Nome]! Vi que voce veio do Google. Posso te mostrar
o Fyness funcionando em 2 minutos?"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_4</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:userTask id="Task_PitchDor_Goo" name="Pitch Direto na Dor da Burocracia">
      <bpmn2:documentation>PITCH - FOCO NA DOR:
"Voce ta cansado de planilha, ne? Deixa eu te mostrar como
a IA resolve isso em segundos."

Foco: Burocracia, tempo perdido, desorganizacao.
Objetivo: Liberar Trial de 7 dias.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_4</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_5</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:serviceTask id="Task_LiberaTrial7d_Goo" name="Libera Trial 7 Dias">
      <bpmn2:documentation>LIBERACAO DO TRIAL - 7 DIAS:
- Cria conta no sistema
- Envia credenciais via WhatsApp
- Inicia cadencia AGRESSIVA de fechamento</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_6</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_D1_Followup_Goo" name="D1: Follow-up Agressivo">
      <bpmn2:documentation>DIA 1 - FOLLOW-UP:
"E ai [Nome], ja testou? Manda um audio pra IA agora
e me conta o que achou!"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_6</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_7</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D3_Pressao_Goo" name="D3: Pressao (Metade do Trial)">
      <bpmn2:documentation>DIA 3 - PRESSAO:
"Metade do seu trial ja foi! Vi que voce ainda nao explorou
os relatorios. Quer que eu te mostre ao vivo?"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_8</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D5_Urgencia_Goo" name="D5: Urgencia (2 dias restantes)">
      <bpmn2:documentation>DIA 5 - URGENCIA:
"[Nome], faltam so 2 dias pro seu trial acabar!
Quer garantir o desconto do Plano Anual antes de expirar?"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_8</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_9</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:userTask id="Task_D7_Fechamento_Goo" name="D7: Ligacao de Fechamento">
      <bpmn2:documentation>DIA 7 - FECHAMENTO:
Ligacao obrigatoria. Tom de urgencia.

"Seu trial acaba HOJE! Vi que voce usou bastante.
Vamos fechar o Anual com 40% de desconto?"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_9</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_10</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_Conversao_Goo" name="Converteu?">
      <bpmn2:incoming>Flow_Goo_10</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Checkout</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Perdido</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    
    <bpmn2:serviceTask id="Task_GrupoNurturing_Goo" name="Adicionar em Lista de Promoções (Google Ads Retargeting)">
      <bpmn2:documentation>NURTURING - LISTA PROMOÇÕES:
Lead Google que não converteu vai para lista de:
- Remarketing via Google Ads
- E-mails com promoções especiais
- WhatsApp com ofertas relâmpago
CONSIDERADO PERDIDO: Apenas se descadastrar/bloquear</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_ToNurturing</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Bloqueio</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sequenceFlow id="Flow_Goo_Bloqueio" sourceRef="Task_GrupoNurturing_Goo" targetRef="End_Bloqueio_Goo" />
    <bpmn2:endEvent id="End_Bloqueio_Goo" name="Descadastrou/Bloqueou">
      <bpmn2:documentation>Lead Google nao converteu.
Alto custo de aquisicao - priorizar reativacao em 15 dias.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Bloqueio</bpmn2:incoming>
    </bpmn2:endEvent>

    <!-- Sequence Flows - RAIA 3 -->
    <bpmn2:sequenceFlow id="Flow_Goo_1" sourceRef="Start_Google" targetRef="Task_LP_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_2" sourceRef="Task_LP_Google" targetRef="Gateway_TipoConversao_Goo" />
    <bpmn2:sequenceFlow id="Flow_Goo_SelfService" name="Self-Service" sourceRef="Gateway_TipoConversao_Goo" targetRef="Task_SelfService_Goo" />
    <bpmn2:sequenceFlow id="Flow_Goo_Assistida" name="WhatsApp" sourceRef="Gateway_TipoConversao_Goo" targetRef="Task_WhatsApp_Goo" />
    <bpmn2:sequenceFlow id="Flow_Goo_Direct_Checkout" sourceRef="Task_SelfService_Goo" targetRef="Gateway_Checkout" />
    <bpmn2:sequenceFlow id="Flow_Goo_3" sourceRef="Task_WhatsApp_Goo" targetRef="Task_SpeedToLead_Goo" />
    <bpmn2:sequenceFlow id="Flow_Goo_4" sourceRef="Task_SpeedToLead_Goo" targetRef="Task_PitchDor_Goo" />
    <bpmn2:sequenceFlow id="Flow_Goo_5" sourceRef="Task_PitchDor_Goo" targetRef="Task_LiberaTrial7d_Goo" />
    <bpmn2:sequenceFlow id="Flow_Goo_6" sourceRef="Task_LiberaTrial7d_Goo" targetRef="Task_D1_Followup_Goo" />
    <bpmn2:sequenceFlow id="Flow_Goo_7" sourceRef="Task_D1_Followup_Goo" targetRef="Task_D3_Pressao_Goo" />
    <bpmn2:sequenceFlow id="Flow_Goo_8" sourceRef="Task_D3_Pressao_Goo" targetRef="Task_D5_Urgencia_Goo" />
    <bpmn2:sequenceFlow id="Flow_Goo_9" sourceRef="Task_D5_Urgencia_Goo" targetRef="Task_D7_Fechamento_Goo" />
    <bpmn2:sequenceFlow id="Flow_Goo_10" sourceRef="Task_D7_Fechamento_Goo" targetRef="Gateway_Conversao_Goo" />
    <bpmn2:sequenceFlow id="Flow_Goo_Checkout" name="Sim - Para Checkout" sourceRef="Gateway_Conversao_Goo" targetRef="LinkThrow_Goo_Checkout" />
    <bpmn2:sequenceFlow id="Flow_Goo_Perdido" name="Nao" sourceRef="Gateway_Conversao_Goo" targetRef="Task_GrupoNurturing_Goo" />

    <!-- ==================== RAIA 4: META/SEO (AUTORIDADE) ==================== -->

    <bpmn2:startEvent id="Start_Meta" name="Clique Anuncio Meta/SEO">
      <bpmn2:documentation>GATILHO RAIA 4 - META/SEO (AUTORIDADE)
Foco: Leads de Reels, YouTube e Anuncios de Dor no Instagram.
Lead: MORNO (com DOR)
Prazo Trial: 7-10 DIAS

Gatilho: Clique no anuncio de "Dor" ou link na bio.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Meta_1</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_IscaDigital" name="Isca Digital (Checklist/Guia)">
      <bpmn2:documentation>FILTRO DE QUALIFICACAO:
Pagina de Isca Digital para capturar contato.

Ofertas:
- "Checklist: 10 erros financeiros que quebram MEs"
- "Guia: Como sair do vermelho em 30 dias"

Formulario: Nome, WhatsApp, Porte da Empresa</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_2</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:userTask id="Task_ContatoConsultivo" name="Contato Consultivo via WhatsApp">
      <bpmn2:documentation>ABORDAGEM CONSULTIVA:
"Oi [Nome]! Vi que voce baixou o guia [X].
Voce ja esta sentindo essa dor na sua empresa?"

Tom: Consultor, nao vendedor. Ouvir primeiro.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_3</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:sendTask id="Task_EducacaoVideos" name="Educacao: Videos Curtos (Produto = Heroi)">
      <bpmn2:documentation>EDUCACAO - PROVA DE VALOR:
Envio de videos curtos mostrando a FACILIDADE.
O produto e o heroi, nao o vendedor.

Videos:
- "Olha como e facil lancar uma despesa"
- "Em 30 segundos a IA categorizou tudo"
- "Seu relatorio pronto em 1 clique"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_4</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:userTask id="Task_ConviteTrial_Meta" name="Convite: Trial 7 Dias">
      <bpmn2:documentation>TESTE DIRIGIDO:
"Quer testar isso na sua empresa? Te libero 7 dias gratis
pra voce ver funcionando com seus dados reais."</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_4</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_5</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:serviceTask id="Task_LiberaTrial7d_Meta" name="Libera Trial 7 Dias">
      <bpmn2:documentation>LIBERACAO DO TRIAL - 7 DIAS:
- Cria conta no sistema
- Envia credenciais via WhatsApp
- Inicia cadencia de 7-10 dias baseada em PROVAS SOCIAIS</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_6</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_D1_ProvaSocial_Meta" name="D1: Prova Social (Depoimento)">
      <bpmn2:documentation>DIA 1 - PROVA SOCIAL:
Envia depoimento de cliente similar.
"Olha o que o [Cliente] falou depois de 1 semana usando..."</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_6</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_7</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D4_Case_Meta" name="D4: Case de Sucesso">
      <bpmn2:documentation>DIA 4 - CASE DE SUCESSO:
Envia case completo de empresa similar.
"Essa ME economizou 15h/mes com o Fyness. Quer ver como?"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_8</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:userTask id="Task_D7_Fechamento_Meta" name="D7: Ligacao de Fechamento">
      <bpmn2:documentation>DIA 7 - FECHAMENTO:
Ligacao consultiva focada em RESULTADOS.

"[Nome], como foi a experiencia? Vi que voce ja lancou X despesas.
Quer continuar tendo essa clareza financeira?"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_8</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_9</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:sendTask id="Task_D10_UltimaChance_Meta" name="D10: Ultima Chance (Bonus Exclusivo)">
      <bpmn2:documentation>DIA 10 - ULTIMA CHANCE:
Extensao de 3 dias para leads que precisam de mais tempo.
Oferta com bonus exclusivo.

"Te dou mais 3 dias + bonus de consultoria se fechar hoje!"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_9</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_10</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:exclusiveGateway id="Gateway_Conversao_Meta" name="Converteu?">
      <bpmn2:incoming>Flow_Meta_10</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Checkout</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Meta_Perdido</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    
    <bpmn2:serviceTask id="Task_GrupoNurturing_Meta" name="Adicionar em Grupo Educacional (Meta Ads + Conteúdo)">
      <bpmn2:documentation>NURTURING - GRUPO EDUCACIONAL:
Lead Meta que não converteu continua recebendo:
- Conteúdo educacional via Instagram/Facebook
- Lives mensais sobre gestão
- Ofertas de cursos e ferramentas
CONSIDERADO PERDIDO: Apenas se bloquear/deixar de seguir</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_ToNurturing</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Bloqueio</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sequenceFlow id="Flow_Meta_Bloqueio" sourceRef="Task_GrupoNurturing_Meta" targetRef="End_Bloqueio_Meta" />
    <bpmn2:endEvent id="End_Bloqueio_Meta" name="Bloqueou/Parou de Seguir">
      <bpmn2:documentation>Lead Meta/SEO nao converteu.
Mover para lista de remarketing e nutrição por email.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Bloqueio</bpmn2:incoming>
    </bpmn2:endEvent>

    <!-- Sequence Flows - RAIA 4 -->
    <bpmn2:sequenceFlow id="Flow_Meta_1" sourceRef="Start_Meta" targetRef="Task_IscaDigital" />
    <bpmn2:sequenceFlow id="Flow_Meta_2" sourceRef="Task_IscaDigital" targetRef="Task_ContatoConsultivo" />
    <bpmn2:sequenceFlow id="Flow_Meta_3" sourceRef="Task_ContatoConsultivo" targetRef="Task_EducacaoVideos" />
    <bpmn2:sequenceFlow id="Flow_Meta_4" sourceRef="Task_EducacaoVideos" targetRef="Task_ConviteTrial_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_5" sourceRef="Task_ConviteTrial_Meta" targetRef="Task_LiberaTrial7d_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_6" sourceRef="Task_LiberaTrial7d_Meta" targetRef="Task_D1_ProvaSocial_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_7" sourceRef="Task_D1_ProvaSocial_Meta" targetRef="Task_D4_Case_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_8" sourceRef="Task_D4_Case_Meta" targetRef="Task_D7_Fechamento_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_9" sourceRef="Task_D7_Fechamento_Meta" targetRef="Task_D10_UltimaChance_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_10" sourceRef="Task_D10_UltimaChance_Meta" targetRef="Gateway_Conversao_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Checkout" name="Sim - Para Checkout" sourceRef="Gateway_Conversao_Meta" targetRef="LinkThrow_Meta_Checkout" />
    <bpmn2:sequenceFlow id="Flow_Meta_Perdido" name="Nao" sourceRef="Gateway_Conversao_Meta" targetRef="Task_GrupoNurturing_Meta" />

    <!-- ==================== NUCLEO: RECUPERACAO & BLINDAGEM ==================== -->

    
    <!-- ========== LINK THROW EVENTS (saídas das raias principais) ========== -->
    <bpmn2:intermediateThrowEvent id="LinkThrow_Out_Checkout" name="→ Checkout">
      <bpmn2:incoming>Flow_Out_Checkout</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_To_Checkout_Out" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Alu_Checkout" name="→ Checkout">
      <bpmn2:incoming>Flow_Alu_Checkout</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_To_Checkout_Alu" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Goo_Checkout" name="→ Checkout">
      <bpmn2:incoming>Flow_Goo_Checkout</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_To_Checkout_Goo" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Meta_Checkout" name="→ Checkout">
      <bpmn2:incoming>Flow_Meta_Checkout</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_To_Checkout_Meta" />
    </bpmn2:intermediateThrowEvent>

    <!-- ========== LINK CATCH EVENTS (entradas no Núcleo) ========== -->
    <bpmn2:intermediateCatchEvent id="LinkCatch_From_Out" name="← Outbound">
      <bpmn2:outgoing>Flow_LinkCatch_Out</bpmn2:outgoing>
      <bpmn2:linkEventDefinition name="Link_To_Checkout_Out" />
    </bpmn2:intermediateCatchEvent>

    <bpmn2:intermediateCatchEvent id="LinkCatch_From_Alu" name="← Educação">
      <bpmn2:outgoing>Flow_LinkCatch_Alu</bpmn2:outgoing>
      <bpmn2:linkEventDefinition name="Link_To_Checkout_Alu" />
    </bpmn2:intermediateCatchEvent>

    <bpmn2:intermediateCatchEvent id="LinkCatch_From_Goo" name="← Google">
      <bpmn2:outgoing>Flow_LinkCatch_Goo</bpmn2:outgoing>
      <bpmn2:linkEventDefinition name="Link_To_Checkout_Goo" />
    </bpmn2:intermediateCatchEvent>

    <bpmn2:intermediateCatchEvent id="LinkCatch_From_Meta" name="← Meta">
      <bpmn2:outgoing>Flow_LinkCatch_Meta</bpmn2:outgoing>
      <bpmn2:linkEventDefinition name="Link_To_Checkout_Meta" />
    </bpmn2:intermediateCatchEvent>

    <!-- Flows from LinkCatch to Gateway_Checkout -->
    <bpmn2:sequenceFlow id="Flow_LinkCatch_Out" sourceRef="LinkCatch_From_Out" targetRef="Gateway_Checkout" />
    <bpmn2:sequenceFlow id="Flow_LinkCatch_Alu" sourceRef="LinkCatch_From_Alu" targetRef="Gateway_Checkout" />
    <bpmn2:sequenceFlow id="Flow_LinkCatch_Goo" sourceRef="LinkCatch_From_Goo" targetRef="Gateway_Checkout" />
    <bpmn2:sequenceFlow id="Flow_LinkCatch_Meta" sourceRef="LinkCatch_From_Meta" targetRef="Gateway_Checkout" />

    <bpmn2:exclusiveGateway id="Gateway_Checkout" name="Gateway Checkout (Asaas)">
      <bpmn2:documentation>NUCLEO COMUM - GATEWAY FINANCEIRO
Todas as 4 raias convergem aqui no momento do Checkout.
Integracao com Asaas para processamento de pagamento.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Out_Checkout</bpmn2:incoming>
      <bpmn2:incoming>Flow_Alu_Checkout</bpmn2:incoming>
      <bpmn2:incoming>Flow_Goo_Checkout</bpmn2:incoming>
      <bpmn2:incoming>Flow_Goo_Direct_Checkout</bpmn2:incoming>
      <bpmn2:incoming>Flow_Meta_Checkout</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Nuc_Sucesso</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Nuc_FalhaSaldo</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Nuc_Abandono</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:serviceTask id="Task_PagamentoSucesso" name="Pagamento SUCESSO">
      <bpmn2:documentation>PAGAMENTO APROVADO:
Webhook Asaas confirma pagamento.
Inicia fluxo de cliente pago.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Nuc_Sucesso</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Nuc_1</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Task_Split30" name="Split 30% Automatico (Parceiro)">
      <bpmn2:documentation>SPLIT DE COMISSAO:
Se lead veio de parceiro, 30% vai automaticamente para ele.
Asaas faz o split no momento do pagamento.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Nuc_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Nuc_2</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:task id="Task_OnboardingPago" name="Onboarding Cliente Pago">
      <bpmn2:documentation>ONBOARDING DE CLIENTE PAGO:
- Boas-vindas personalizadas
- Acesso completo liberado
- Agendamento de call de sucesso (opcional)
- Entrada no grupo VIP de clientes</bpmn2:documentation>
      <bpmn2:incoming>Flow_Nuc_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Nuc_Ativo</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:serviceTask id="Task_FalhaSaldo" name="FALHA: Saldo Insuficiente">
      <bpmn2:documentation>ERRO DE PAGAMENTO - SALDO INSUFICIENTE:
Cartao recusado por falta de limite/saldo.
Gatilho: Webhook Asaas "insufficient_funds"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Nuc_FalhaSaldo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Nuc_3</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_OfertaSemestral" name="Automacao 5min: Oferta Semestral R$997">
      <bpmn2:documentation>RECUPERACAO - SALDO INSUFICIENTE:
Automacao dispara em 5 MINUTOS.

Mensagem: "Vi que deu problema no pagamento. Que tal o Plano
Semestral por R$997? Parcela menor, mesmo beneficio!"

Link direto para checkout do plano semestral.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Nuc_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Nuc_Retry</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:task id="Task_AbandonoCarrinho" name="ABANDONO: Carrinho Abandonado">
      <bpmn2:documentation>ABANDONO DE CARRINHO:
Lead chegou no checkout mas nao finalizou.
Gatilho: 15 minutos sem completar pagamento.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Nuc_Abandono</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Nuc_4</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:userTask id="Task_OfertaTrimestral" name="Vendedor Liga 15min: Oferta Trimestral R$561">
      <bpmn2:documentation>RECUPERACAO - ABANDONO:
Alerta para vendedor ligar em 15 MINUTOS.

Pitch: "Oi [Nome], vi que voce quase fechou! Aconteceu algo?
Posso te oferecer o Trimestral por R$561 pra voce comecar menor."

Objetivo: Fechar na ligacao com plano de entrada.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Nuc_4</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Nuc_Retry2</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:boundaryEvent id="Task_Guardiao48h" name="O GUARDIAO: Inatividade 48h" attachedToRef="Task_OnboardingPago">
      <bpmn2:documentation>O GUARDIAO DA RETENCAO:
Monitora TODOS os leads (Trial ou Pago).
Se ficar 48h sem mandar audio para a IA, dispara alerta.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Nuc_Guardiao</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT48H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:boundaryEvent>

    <bpmn2:userTask id="Task_ResgateManual" name="Tarefa de Resgate Manual (Ligacao/Audio)">
      <bpmn2:documentation>RESGATE MANUAL:
Sistema gera tarefa para vendedor.
Acao: Ligacao ou Audio personalizado no WhatsApp.

"Oi [Nome], percebi que voce nao usou o Fyness nos ultimos dias.
Esta tudo bem? Posso te ajudar com algo?"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Nuc_Guardiao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Nuc_Resgate</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:endEvent id="End_ClienteAtivo" name="Cliente Ativo">
      <bpmn2:documentation>SUCESSO: Cliente ativo e pagante.
Monitoramento continuo pelo Guardiao 48h.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Nuc_Ativo</bpmn2:incoming>
      <bpmn2:incoming>Flow_Nuc_Retry</bpmn2:incoming>
      <bpmn2:incoming>Flow_Nuc_Retry2</bpmn2:incoming>
      <bpmn2:incoming>Flow_Nuc_Resgate</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:endEvent id="End_Churn" name="Churn">
      <bpmn2:documentation>CHURN: Cliente perdido.
Mover para lista de reativacao futura.</bpmn2:documentation>
    </bpmn2:endEvent>

    <!-- Sequence Flows - NUCLEO -->
    <bpmn2:sequenceFlow id="Flow_Nuc_Sucesso" name="Sucesso" sourceRef="Gateway_Checkout" targetRef="Task_PagamentoSucesso" />
    <bpmn2:sequenceFlow id="Flow_Nuc_FalhaSaldo" name="Falha Saldo" sourceRef="Gateway_Checkout" targetRef="Task_FalhaSaldo" />
    <bpmn2:sequenceFlow id="Flow_Nuc_Abandono" name="Abandono" sourceRef="Gateway_Checkout" targetRef="Task_AbandonoCarrinho" />
    <bpmn2:sequenceFlow id="Flow_Nuc_1" sourceRef="Task_PagamentoSucesso" targetRef="Task_Split30" />
    <bpmn2:sequenceFlow id="Flow_Nuc_2" sourceRef="Task_Split30" targetRef="Task_OnboardingPago" />
    <bpmn2:sequenceFlow id="Flow_Nuc_Ativo" sourceRef="Task_OnboardingPago" targetRef="End_ClienteAtivo" />
    <bpmn2:sequenceFlow id="Flow_Nuc_3" sourceRef="Task_FalhaSaldo" targetRef="Task_OfertaSemestral" />
    <bpmn2:sequenceFlow id="Flow_Nuc_Retry" sourceRef="Task_OfertaSemestral" targetRef="End_ClienteAtivo" />
    <bpmn2:sequenceFlow id="Flow_Nuc_4" sourceRef="Task_AbandonoCarrinho" targetRef="Task_OfertaTrimestral" />
    <bpmn2:sequenceFlow id="Flow_Nuc_Retry2" sourceRef="Task_OfertaTrimestral" targetRef="End_ClienteAtivo" />
    <bpmn2:sequenceFlow id="Flow_Nuc_Guardiao" sourceRef="Task_Guardiao48h" targetRef="Task_ResgateManual" />
    <bpmn2:sequenceFlow id="Flow_Nuc_Resgate" sourceRef="Task_ResgateManual" targetRef="End_ClienteAtivo" />

  </bpmn2:process>

  <!-- ==================== DIAGRAMA VISUAL ==================== -->
  <bpmndi:BPMNDiagram id="BPMNDiagram_MapaGuerra">
    <bpmndi:BPMNPlane id="BPMNPlane_MapaGuerra" bpmnElement="Collaboration_MapaGuerra">

      <!-- Participant -->
      <bpmndi:BPMNShape id="Shape_Participant" bpmnElement="Participant_MapaGuerra" isHorizontal="true">
        <dc:Bounds x="120" y="60" width="2400" height="1200" />
      </bpmndi:BPMNShape>

      <!-- RAIA 1: OUTBOUND -->
      <bpmndi:BPMNShape id="Shape_Lane_Outbound" bpmnElement="Lane_Outbound" isHorizontal="true">
        <dc:Bounds x="150" y="60" width="2370" height="220" />
      </bpmndi:BPMNShape>

      <!-- RAIA 2: ALUNOS -->
      <bpmndi:BPMNShape id="Shape_Lane_Alunos" bpmnElement="Lane_Alunos" isHorizontal="true">
        <dc:Bounds x="150" y="280" width="2370" height="200" />
      </bpmndi:BPMNShape>

      <!-- RAIA 3: GOOGLE -->
      <bpmndi:BPMNShape id="Shape_Lane_Google" bpmnElement="Lane_Google" isHorizontal="true">
        <dc:Bounds x="150" y="480" width="2370" height="220" />
      </bpmndi:BPMNShape>

      <!-- RAIA 4: META -->
      <bpmndi:BPMNShape id="Shape_Lane_Meta" bpmnElement="Lane_Meta" isHorizontal="true">
        <dc:Bounds x="150" y="700" width="2370" height="200" />
      </bpmndi:BPMNShape>

      <!-- NUCLEO -->
      <bpmndi:BPMNShape id="Shape_Lane_Nucleo" bpmnElement="Lane_Nucleo" isHorizontal="true">
        <dc:Bounds x="150" y="900" width="2370" height="360" />
      </bpmndi:BPMNShape>

      <!-- ===== SHAPES RAIA 1: OUTBOUND ===== -->
      <bpmndi:BPMNShape id="Shape_Start_Outbound" bpmnElement="Start_Outbound">
        <dc:Bounds x="200" y="152" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_MineracaoCNPJ" bpmnElement="Task_MineracaoCNPJ">
        <dc:Bounds x="270" y="130" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_EmailAbertura" bpmnElement="Task_EmailAbertura">
        <dc:Bounds x="400" y="130" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_LigacaoManha" bpmnElement="Task_LigacaoManha">
        <dc:Bounds x="530" y="130" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_AtendeuManha" bpmnElement="Gateway_AtendeuManha" isMarkerVisible="true">
        <dc:Bounds x="660" y="145" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_AgendaTarde" bpmnElement="Task_AgendaTarde">
        <dc:Bounds x="740" y="80" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_LigacaoTarde" bpmnElement="Task_LigacaoTarde">
        <dc:Bounds x="870" y="80" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_AtendeuTarde" bpmnElement="Gateway_AtendeuTarde" isMarkerVisible="true">
        <dc:Bounds x="1000" y="85" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_FlashDemo" bpmnElement="Task_FlashDemo">
        <dc:Bounds x="1080" y="130" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_AceitouTrial_Out" bpmnElement="Gateway_AceitouTrial_Out" isMarkerVisible="true">
        <dc:Bounds x="1230" y="145" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_LiberaTrial7d_Out" bpmnElement="Task_LiberaTrial7d_Out">
        <dc:Bounds x="1310" y="130" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D1_Valor_Out" bpmnElement="Task_D1_Valor_Out">
        <dc:Bounds x="1440" y="130" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D3_Video_Out" bpmnElement="Task_D3_Video_Out">
        <dc:Bounds x="1570" y="130" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D5_Relatorio_Out" bpmnElement="Task_D5_Relatorio_Out">
        <dc:Bounds x="1700" y="130" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D7_Fechamento_Out" bpmnElement="Task_D7_Fechamento_Out">
        <dc:Bounds x="1830" y="130" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Conversao_Out" bpmnElement="Gateway_Conversao_Out" isMarkerVisible="true">
        <dc:Bounds x="1980" y="145" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Bloqueio_Out" bpmnElement="End_Bloqueio_Out">
        <dc:Bounds x="2420" y="142" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- ===== SHAPES RAIA 2: ALUNOS ===== -->
      <bpmndi:BPMNShape id="Shape_Start_Alunos" bpmnElement="Start_Alunos">
        <dc:Bounds x="200" y="362" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_AulaGestao" bpmnElement="Task_AulaGestao">
        <dc:Bounds x="270" y="340" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_LinkVIP30d" bpmnElement="Task_LinkVIP30d">
        <dc:Bounds x="400" y="340" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D0_Onboarding_Alu" bpmnElement="Task_D0_Onboarding_Alu">
        <dc:Bounds x="530" y="340" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D1_D14_Automacao" bpmnElement="Task_D1_D14_Automacao">
        <dc:Bounds x="680" y="340" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D15_Checkin" bpmnElement="Task_D15_Checkin">
        <dc:Bounds x="830" y="340" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D25_OfertaAnual" bpmnElement="Task_D25_OfertaAnual">
        <dc:Bounds x="980" y="340" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D30_Fechamento_Alu" bpmnElement="Task_D30_Fechamento_Alu">
        <dc:Bounds x="1130" y="340" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Conversao_Alu" bpmnElement="Gateway_Conversao_Alu" isMarkerVisible="true">
        <dc:Bounds x="1280" y="355" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Bloqueio_Alu" bpmnElement="End_Bloqueio_Alu">
        <dc:Bounds x="1620" y="352" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- ===== SHAPES RAIA 3: GOOGLE ===== -->
      <bpmndi:BPMNShape id="Shape_Start_Google" bpmnElement="Start_Google">
        <dc:Bounds x="200" y="572" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_LP_Google" bpmnElement="Task_LP_Google">
        <dc:Bounds x="270" y="550" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_TipoConversao_Goo" bpmnElement="Gateway_TipoConversao_Goo" isMarkerVisible="true">
        <dc:Bounds x="400" y="565" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_SelfService_Goo" bpmnElement="Task_SelfService_Goo">
        <dc:Bounds x="480" y="490" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_WhatsApp_Goo" bpmnElement="Task_WhatsApp_Goo">
        <dc:Bounds x="480" y="620" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_SpeedToLead_Goo" bpmnElement="Task_SpeedToLead_Goo">
        <dc:Bounds x="610" y="620" width="120" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_PitchDor_Goo" bpmnElement="Task_PitchDor_Goo">
        <dc:Bounds x="760" y="620" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_LiberaTrial7d_Goo" bpmnElement="Task_LiberaTrial7d_Goo">
        <dc:Bounds x="890" y="550" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D1_Followup_Goo" bpmnElement="Task_D1_Followup_Goo">
        <dc:Bounds x="1020" y="550" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D3_Pressao_Goo" bpmnElement="Task_D3_Pressao_Goo">
        <dc:Bounds x="1150" y="550" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D5_Urgencia_Goo" bpmnElement="Task_D5_Urgencia_Goo">
        <dc:Bounds x="1280" y="550" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D7_Fechamento_Goo" bpmnElement="Task_D7_Fechamento_Goo">
        <dc:Bounds x="1410" y="550" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Conversao_Goo" bpmnElement="Gateway_Conversao_Goo" isMarkerVisible="true">
        <dc:Bounds x="1540" y="565" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Bloqueio_Goo" bpmnElement="End_Bloqueio_Goo">
        <dc:Bounds x="1880" y="562" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- ===== SHAPES RAIA 4: META ===== -->
      <bpmndi:BPMNShape id="Shape_Start_Meta" bpmnElement="Start_Meta">
        <dc:Bounds x="200" y="782" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_IscaDigital" bpmnElement="Task_IscaDigital">
        <dc:Bounds x="270" y="760" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_ContatoConsultivo" bpmnElement="Task_ContatoConsultivo">
        <dc:Bounds x="400" y="760" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_EducacaoVideos" bpmnElement="Task_EducacaoVideos">
        <dc:Bounds x="550" y="760" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_ConviteTrial_Meta" bpmnElement="Task_ConviteTrial_Meta">
        <dc:Bounds x="700" y="760" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_LiberaTrial7d_Meta" bpmnElement="Task_LiberaTrial7d_Meta">
        <dc:Bounds x="830" y="760" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D1_ProvaSocial_Meta" bpmnElement="Task_D1_ProvaSocial_Meta">
        <dc:Bounds x="960" y="760" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D4_Case_Meta" bpmnElement="Task_D4_Case_Meta">
        <dc:Bounds x="1090" y="760" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D7_Fechamento_Meta" bpmnElement="Task_D7_Fechamento_Meta">
        <dc:Bounds x="1220" y="760" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D10_UltimaChance_Meta" bpmnElement="Task_D10_UltimaChance_Meta">
        <dc:Bounds x="1350" y="760" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Conversao_Meta" bpmnElement="Gateway_Conversao_Meta" isMarkerVisible="true">
        <dc:Bounds x="1500" y="775" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Bloqueio_Meta" bpmnElement="End_Bloqueio_Meta">
        <dc:Bounds x="1840" y="772" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- ===== SHAPES NUCLEO ===== -->
      <bpmndi:BPMNShape id="Shape_Gateway_Checkout" bpmnElement="Gateway_Checkout" isMarkerVisible="true">
        <dc:Bounds x="400" y="1055" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_PagamentoSucesso" bpmnElement="Task_PagamentoSucesso">
        <dc:Bounds x="520" y="940" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Split30" bpmnElement="Task_Split30">
        <dc:Bounds x="660" y="940" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_OnboardingPago" bpmnElement="Task_OnboardingPago">
        <dc:Bounds x="820" y="940" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_FalhaSaldo" bpmnElement="Task_FalhaSaldo">
        <dc:Bounds x="520" y="1040" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_OfertaSemestral" bpmnElement="Task_OfertaSemestral">
        <dc:Bounds x="660" y="1040" width="140" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_AbandonoCarrinho" bpmnElement="Task_AbandonoCarrinho">
        <dc:Bounds x="520" y="1140" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_OfertaTrimestral" bpmnElement="Task_OfertaTrimestral">
        <dc:Bounds x="660" y="1140" width="140" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Guardiao48h" bpmnElement="Task_Guardiao48h">
        <dc:Bounds x="922" y="1002" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_ResgateManual" bpmnElement="Task_ResgateManual">
        <dc:Bounds x="1000" y="1040" width="120" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_ClienteAtivo" bpmnElement="End_ClienteAtivo">
        <dc:Bounds x="1200" y="962" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Churn" bpmnElement="End_Churn">
        <dc:Bounds x="1200" y="1162" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- ===== EDGES RAIA 1 ===== -->
      <bpmndi:BPMNEdge id="Edge_Flow_Out_1" bpmnElement="Flow_Out_1">
        <di:waypoint x="236" y="170" />
        <di:waypoint x="270" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_2" bpmnElement="Flow_Out_2">
        <di:waypoint x="370" y="170" />
        <di:waypoint x="400" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_3" bpmnElement="Flow_Out_3">
        <di:waypoint x="500" y="170" />
        <di:waypoint x="530" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_4" bpmnElement="Flow_Out_4">
        <di:waypoint x="630" y="170" />
        <di:waypoint x="660" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_5_Sim" bpmnElement="Flow_Out_5_Sim">
        <di:waypoint x="710" y="170" />
        <di:waypoint x="1080" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_5_Nao" bpmnElement="Flow_Out_5_Nao">
        <di:waypoint x="685" y="145" />
        <di:waypoint x="685" y="110" />
        <di:waypoint x="740" y="110" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_6" bpmnElement="Flow_Out_6">
        <di:waypoint x="840" y="110" />
        <di:waypoint x="870" y="110" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_7" bpmnElement="Flow_Out_7">
        <di:waypoint x="970" y="110" />
        <di:waypoint x="1000" y="110" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_8_Sim" bpmnElement="Flow_Out_8_Sim">
        <di:waypoint x="1025" y="135" />
        <di:waypoint x="1025" y="170" />
        <di:waypoint x="1080" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_8_Nao" bpmnElement="Flow_Out_8_Nao">
        <di:waypoint x="1050" y="110" />
        <di:waypoint x="2118" y="110" />
        <di:waypoint x="2118" y="100" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_9" bpmnElement="Flow_Out_9">
        <di:waypoint x="1200" y="170" />
        <di:waypoint x="1230" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_10_Sim" bpmnElement="Flow_Out_10_Sim">
        <di:waypoint x="1280" y="170" />
        <di:waypoint x="1310" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_10_Nao" bpmnElement="Flow_Out_10_Nao">
        <di:waypoint x="1255" y="145" />
        <di:waypoint x="1255" y="100" />
        <di:waypoint x="2100" y="100" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_11" bpmnElement="Flow_Out_11">
        <di:waypoint x="1410" y="170" />
        <di:waypoint x="1440" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_12" bpmnElement="Flow_Out_12">
        <di:waypoint x="1540" y="170" />
        <di:waypoint x="1570" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_13" bpmnElement="Flow_Out_13">
        <di:waypoint x="1670" y="170" />
        <di:waypoint x="1700" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_14" bpmnElement="Flow_Out_14">
        <di:waypoint x="1800" y="170" />
        <di:waypoint x="1830" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_15" bpmnElement="Flow_Out_15">
        <di:waypoint x="1950" y="170" />
        <di:waypoint x="1980" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_Checkout" bpmnElement="Flow_Out_Checkout">
        <di:waypoint x="2005" y="195" />
        <di:waypoint x="2005" y="1080" />
        <di:waypoint x="450" y="1080" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Out_Descarte" bpmnElement="Flow_Out_Descarte">
        <di:waypoint x="2030" y="170" />
        <di:waypoint x="2065" y="170" />
        <di:waypoint x="2065" y="100" />
        <di:waypoint x="2100" y="100" />
      </bpmndi:BPMNEdge>

      <!-- ===== EDGES RAIA 2 ===== -->
      <bpmndi:BPMNEdge id="Edge_Flow_Alu_1" bpmnElement="Flow_Alu_1">
        <di:waypoint x="236" y="380" />
        <di:waypoint x="270" y="380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Alu_2" bpmnElement="Flow_Alu_2">
        <di:waypoint x="370" y="380" />
        <di:waypoint x="400" y="380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Alu_3" bpmnElement="Flow_Alu_3">
        <di:waypoint x="500" y="380" />
        <di:waypoint x="530" y="380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Alu_4" bpmnElement="Flow_Alu_4">
        <di:waypoint x="650" y="380" />
        <di:waypoint x="680" y="380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Alu_5" bpmnElement="Flow_Alu_5">
        <di:waypoint x="800" y="380" />
        <di:waypoint x="830" y="380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Alu_6" bpmnElement="Flow_Alu_6">
        <di:waypoint x="950" y="380" />
        <di:waypoint x="980" y="380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Alu_7" bpmnElement="Flow_Alu_7">
        <di:waypoint x="1100" y="380" />
        <di:waypoint x="1130" y="380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Alu_8" bpmnElement="Flow_Alu_8">
        <di:waypoint x="1250" y="380" />
        <di:waypoint x="1280" y="380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Alu_Checkout" bpmnElement="Flow_Alu_Checkout">
        <di:waypoint x="1305" y="405" />
        <di:waypoint x="1305" y="1080" />
        <di:waypoint x="450" y="1080" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Alu_Bloqueio" bpmnElement="Flow_Alu_Bloqueio">
        <di:waypoint x="1330" y="380" />
        <di:waypoint x="1355" y="380" />
        <di:waypoint x="1355" y="318" />
        <di:waypoint x="1380" y="318" />
      </bpmndi:BPMNEdge>

      <!-- ===== EDGES RAIA 3 ===== -->
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_1" bpmnElement="Flow_Goo_1">
        <di:waypoint x="236" y="590" />
        <di:waypoint x="270" y="590" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_2" bpmnElement="Flow_Goo_2">
        <di:waypoint x="370" y="590" />
        <di:waypoint x="400" y="590" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_SelfService" bpmnElement="Flow_Goo_SelfService">
        <di:waypoint x="425" y="565" />
        <di:waypoint x="425" y="520" />
        <di:waypoint x="480" y="520" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_Assistida" bpmnElement="Flow_Goo_Assistida">
        <di:waypoint x="425" y="615" />
        <di:waypoint x="425" y="650" />
        <di:waypoint x="480" y="650" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_Direct_Checkout" bpmnElement="Flow_Goo_Direct_Checkout">
        <di:waypoint x="530" y="490" />
        <di:waypoint x="530" y="450" />
        <di:waypoint x="300" y="450" />
        <di:waypoint x="300" y="1080" />
        <di:waypoint x="400" y="1080" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_3" bpmnElement="Flow_Goo_3">
        <di:waypoint x="580" y="650" />
        <di:waypoint x="610" y="650" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_4" bpmnElement="Flow_Goo_4">
        <di:waypoint x="730" y="650" />
        <di:waypoint x="760" y="650" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_5" bpmnElement="Flow_Goo_5">
        <di:waypoint x="860" y="650" />
        <di:waypoint x="875" y="650" />
        <di:waypoint x="875" y="590" />
        <di:waypoint x="890" y="590" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_6" bpmnElement="Flow_Goo_6">
        <di:waypoint x="990" y="590" />
        <di:waypoint x="1020" y="590" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_7" bpmnElement="Flow_Goo_7">
        <di:waypoint x="1120" y="590" />
        <di:waypoint x="1150" y="590" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_8" bpmnElement="Flow_Goo_8">
        <di:waypoint x="1250" y="590" />
        <di:waypoint x="1280" y="590" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_9" bpmnElement="Flow_Goo_9">
        <di:waypoint x="1380" y="590" />
        <di:waypoint x="1410" y="590" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_10" bpmnElement="Flow_Goo_10">
        <di:waypoint x="1510" y="590" />
        <di:waypoint x="1540" y="590" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_Checkout" bpmnElement="Flow_Goo_Checkout">
        <di:waypoint x="1565" y="615" />
        <di:waypoint x="1565" y="1080" />
        <di:waypoint x="450" y="1080" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_Perdido" bpmnElement="Flow_Goo_Perdido">
        <di:waypoint x="1590" y="590" />
        <di:waypoint x="1615" y="590" />
        <di:waypoint x="1615" y="510" />
        <di:waypoint x="1640" y="510" />
      </bpmndi:BPMNEdge>

      <!-- ===== EDGES RAIA 4 ===== -->
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_1" bpmnElement="Flow_Meta_1">
        <di:waypoint x="236" y="800" />
        <di:waypoint x="270" y="800" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_2" bpmnElement="Flow_Meta_2">
        <di:waypoint x="370" y="800" />
        <di:waypoint x="400" y="800" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_3" bpmnElement="Flow_Meta_3">
        <di:waypoint x="520" y="800" />
        <di:waypoint x="550" y="800" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_4" bpmnElement="Flow_Meta_4">
        <di:waypoint x="670" y="800" />
        <di:waypoint x="700" y="800" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_5" bpmnElement="Flow_Meta_5">
        <di:waypoint x="800" y="800" />
        <di:waypoint x="830" y="800" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_6" bpmnElement="Flow_Meta_6">
        <di:waypoint x="930" y="800" />
        <di:waypoint x="960" y="800" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_7" bpmnElement="Flow_Meta_7">
        <di:waypoint x="1060" y="800" />
        <di:waypoint x="1090" y="800" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_8" bpmnElement="Flow_Meta_8">
        <di:waypoint x="1190" y="800" />
        <di:waypoint x="1220" y="800" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_9" bpmnElement="Flow_Meta_9">
        <di:waypoint x="1320" y="800" />
        <di:waypoint x="1350" y="800" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_10" bpmnElement="Flow_Meta_10">
        <di:waypoint x="1470" y="800" />
        <di:waypoint x="1500" y="800" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Checkout" bpmnElement="Flow_Meta_Checkout">
        <di:waypoint x="1525" y="825" />
        <di:waypoint x="1525" y="1080" />
        <di:waypoint x="450" y="1080" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Perdido" bpmnElement="Flow_Meta_Perdido">
        <di:waypoint x="1550" y="800" />
        <di:waypoint x="1575" y="800" />
        <di:waypoint x="1575" y="730" />
        <di:waypoint x="1600" y="730" />
      </bpmndi:BPMNEdge>

      <!-- ===== EDGES NUCLEO ===== -->
      <bpmndi:BPMNEdge id="Edge_Flow_Nuc_Sucesso" bpmnElement="Flow_Nuc_Sucesso">
        <di:waypoint x="425" y="1055" />
        <di:waypoint x="425" y="980" />
        <di:waypoint x="520" y="980" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Nuc_FalhaSaldo" bpmnElement="Flow_Nuc_FalhaSaldo">
        <di:waypoint x="450" y="1080" />
        <di:waypoint x="520" y="1080" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Nuc_Abandono" bpmnElement="Flow_Nuc_Abandono">
        <di:waypoint x="425" y="1105" />
        <di:waypoint x="425" y="1180" />
        <di:waypoint x="520" y="1180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Nuc_1" bpmnElement="Flow_Nuc_1">
        <di:waypoint x="620" y="980" />
        <di:waypoint x="660" y="980" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Nuc_2" bpmnElement="Flow_Nuc_2">
        <di:waypoint x="780" y="980" />
        <di:waypoint x="820" y="980" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Nuc_Ativo" bpmnElement="Flow_Nuc_Ativo">
        <di:waypoint x="940" y="980" />
        <di:waypoint x="1200" y="980" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Nuc_3" bpmnElement="Flow_Nuc_3">
        <di:waypoint x="620" y="1080" />
        <di:waypoint x="660" y="1080" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Nuc_Retry" bpmnElement="Flow_Nuc_Retry">
        <di:waypoint x="800" y="1080" />
        <di:waypoint x="1218" y="1080" />
        <di:waypoint x="1218" y="998" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Nuc_4" bpmnElement="Flow_Nuc_4">
        <di:waypoint x="620" y="1180" />
        <di:waypoint x="660" y="1180" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Nuc_Retry2" bpmnElement="Flow_Nuc_Retry2">
        <di:waypoint x="800" y="1180" />
        <di:waypoint x="1218" y="1180" />
        <di:waypoint x="1218" y="998" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Nuc_Guardiao" bpmnElement="Flow_Nuc_Guardiao">
        <di:waypoint x="958" y="1020" />
        <di:waypoint x="979" y="1020" />
        <di:waypoint x="979" y="1080" />
        <di:waypoint x="1000" y="1080" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Nuc_Resgate" bpmnElement="Flow_Nuc_Resgate">
        <di:waypoint x="1120" y="1080" />
        <di:waypoint x="1160" y="1080" />
        <di:waypoint x="1160" y="980" />
        <di:waypoint x="1200" y="980" />
      </bpmndi:BPMNEdge>

    
      <!-- Link Throw Events Shapes -->
      <bpmndi:BPMNShape id="Shape_LinkThrow_Out_Checkout" bpmnElement="LinkThrow_Out_Checkout">
        <dc:Bounds x="2100" y="152" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Alu_Checkout" bpmnElement="LinkThrow_Alu_Checkout">
        <dc:Bounds x="1400" y="362" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Goo_Checkout" bpmnElement="LinkThrow_Goo_Checkout">
        <dc:Bounds x="1660" y="572" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Meta_Checkout" bpmnElement="LinkThrow_Meta_Checkout">
        <dc:Bounds x="1620" y="782" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- Link Catch Events Shapes -->
      <bpmndi:BPMNShape id="Shape_LinkCatch_From_Out" bpmnElement="LinkCatch_From_Out">
        <dc:Bounds x="100" y="1062" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkCatch_From_Alu" bpmnElement="LinkCatch_From_Alu">
        <dc:Bounds x="180" y="1062" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkCatch_From_Goo" bpmnElement="LinkCatch_From_Goo">
        <dc:Bounds x="260" y="1062" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkCatch_From_Meta" bpmnElement="LinkCatch_From_Meta">
        <dc:Bounds x="340" y="1062" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- Edges from LinkCatch to Gateway_Checkout -->
      <bpmndi:BPMNEdge id="Edge_Flow_LinkCatch_Out" bpmnElement="Flow_LinkCatch_Out">
        <di:waypoint x="136" y="1080" />
        <di:waypoint x="425" y="1080" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_LinkCatch_Alu" bpmnElement="Flow_LinkCatch_Alu">
        <di:waypoint x="216" y="1080" />
        <di:waypoint x="425" y="1080" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_LinkCatch_Goo" bpmnElement="Flow_LinkCatch_Goo">
        <di:waypoint x="296" y="1080" />
        <di:waypoint x="425" y="1080" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_LinkCatch_Meta" bpmnElement="Flow_LinkCatch_Meta">
        <di:waypoint x="376" y="1080" />
        <di:waypoint x="425" y="1080" />
      </bpmndi:BPMNEdge>

    
      <!-- Nurturing Tasks Shapes -->
      <bpmndi:BPMNShape id="Shape_Task_GrupoNurturing_Out" bpmnElement="Task_GrupoNurturing_Out">
        <dc:Bounds x="2250" y="120" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_GrupoNurturing_Alu" bpmnElement="Task_GrupoNurturing_Alu">
        <dc:Bounds x="1450" y="330" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_GrupoNurturing_Goo" bpmnElement="Task_GrupoNurturing_Goo">
        <dc:Bounds x="1710" y="540" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_GrupoNurturing_Meta" bpmnElement="Task_GrupoNurturing_Meta">
        <dc:Bounds x="1670" y="750" width="100" height="80" />
      </bpmndi:BPMNShape>

      <!-- Edges para nurturing flows -->
      <bpmndi:BPMNEdge id="Edge_Flow_Out_Bloqueio" bpmnElement="Flow_Out_Bloqueio">
        <di:waypoint x="2350" y="160" />
        <di:waypoint x="2420" y="160" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Alu_Bloqueio_Final" bpmnElement="Flow_Alu_Bloqueio_Final">
        <di:waypoint x="1550" y="370" />
        <di:waypoint x="1620" y="370" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Goo_Bloqueio" bpmnElement="Flow_Goo_Bloqueio">
        <di:waypoint x="1810" y="580" />
        <di:waypoint x="1880" y="580" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Bloqueio" bpmnElement="Flow_Meta_Bloqueio">
        <di:waypoint x="1770" y="790" />
        <di:waypoint x="1840" y="790" />
      </bpmndi:BPMNEdge>

    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>

</bpmn2:definitions>`;

// Export também como COMERCIAL_DIAGRAM_XML para compatibilidade
export const COMERCIAL_DIAGRAM_XML = COMERCIAL_V8_REORGANIZED_XML;

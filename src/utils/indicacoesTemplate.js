// Template BPMN - RAIA INDICACOES: O FUNIL DA CONFIANCA (v2.0)
// Fluxo realista com Gateway Ativo/Passivo, Guardiao e Vitrine Binaria
// Split 30% parceiro ja configurado no Gateway Central

export const indicacoesTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                   xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
                   xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                   xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                   xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                   id="Definitions_Indicacoes"
                   targetNamespace="http://fyness.com/bpmn/indicacoes">

  <bpmn2:collaboration id="Collaboration_Indicacoes">
    <bpmn2:participant id="Participant_Indicacoes" name="INDICACOES - O FUNIL DA CONFIANCA" processRef="Process_Indicacoes" />
  </bpmn2:collaboration>

  <bpmn2:process id="Process_Indicacoes" name="Fluxo de Indicacoes" isExecutable="false">

    <bpmn2:laneSet id="LaneSet_Indicacoes">
      <bpmn2:lane id="Lane_Indicacoes" name="INDICACOES - Funil da Confianca (7d Trial + Bonus Parceiro)">
        <!-- GATEWAY DE ENTRADA -->
        <bpmn2:flowNodeRef>Start_Indicacao</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_TipoEntrada</bpmn2:flowNodeRef>
        <!-- CENARIO A: ATIVO (Parceiro entrega contato) -->
        <bpmn2:flowNodeRef>Task_TagIndicacao</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_ContatoAtivo</bpmn2:flowNodeRef>
        <!-- CENARIO B: PASSIVO (Lead te procura) -->
        <bpmn2:flowNodeRef>Task_TagPassivo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_ContatoPassivo</bpmn2:flowNodeRef>
        <!-- MERGE E LIGACAO -->
        <bpmn2:flowNodeRef>Gateway_MergeContato</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_LigacaoParceiro</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_Atendeu</bpmn2:flowNodeRef>
        <!-- PATH NAO ATENDEU - CADENCIA DO PARCEIRO -->
        <bpmn2:flowNodeRef>Task_D1_ParceiroPerguntou</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D3_VideoBastidor</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D5_BonusExpirando</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_D7_Despedida</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_Respondeu</bpmn2:flowNodeRef>
        <!-- FLASH DEMO -->
        <bpmn2:flowNodeRef>Task_FlashDemo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_QuerTrial</bpmn2:flowNodeRef>
        <!-- TRIAL 7 DIAS COM GUARDIAO -->
        <bpmn2:flowNodeRef>Task_AtivarTrial</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_Guardiao_Ind</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_AlertaInativo</bpmn2:flowNodeRef>
        <!-- VITRINE BINARIA D7 -->
        <bpmn2:flowNodeRef>Task_OfertaAnual</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_FechouAnual</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_OfertaSemestral</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_FechouSemestral</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_OfertaTrimestral</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_FechouTrimestral</bpmn2:flowNodeRef>
        <!-- POS-CONVERSAO -->
        <bpmn2:flowNodeRef>Task_NotificaParceiro</bpmn2:flowNodeRef>
        <!-- FINALIZACOES -->
        <bpmn2:flowNodeRef>End_Checkout_Ind</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>End_Perdido_Ind</bpmn2:flowNodeRef>
      </bpmn2:lane>
    </bpmn2:laneSet>

    <!-- ==================== GATEWAY DE ENTRADA ==================== -->

    <bpmn2:startEvent id="Start_Indicacao" name="Lead Indicado">
      <bpmn2:documentation>ENTRADA DO LEAD INDICADO:
O lead entra por um de dois caminhos:
- Cenario A: Parceiro te entrega o contato (ATIVO)
- Cenario B: Lead te procura dizendo que conhece o parceiro (PASSIVO)</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Ind_Start</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:exclusiveGateway id="Gateway_TipoEntrada" name="Como Chegou?">
      <bpmn2:documentation>GATEWAY DE ENTRADA:

CENARIO A - ATIVO:
Parceiro te manda o Zap do lead.
Voce precisa dar o "Oi" inicial com autoridade emprestada.

CENARIO B - PASSIVO:
Lead clica no link ou te chama dizendo "O [Parceiro] me falou de voce".
Tratamento VIP imediato.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Ativo</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Passivo</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <!-- ==================== CENARIO A: ATIVO (Parceiro entrega contato) ==================== -->

    <bpmn2:serviceTask id="Task_TagIndicacao" name="Tag [INDICACAO: PARCEIRO]">
      <bpmn2:documentation>TAGUEAMENTO DO LEAD:
- Tag: [INDICACAO: NOME_DO_PARCEIRO]
- Origem: ATIVO (parceiro entregou)
- Medir qual parceiro traz os melhores clientes</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Ativo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_2A</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_ContatoAtivo" name="Oi Inicial (Autoridade Emprestada)">
      <bpmn2:documentation>PRIMEIRO CONTATO - CENARIO ATIVO:

SCRIPT WHATSAPP:
"Oi [Lead], aqui e o [Vendedor] da Fyness!

O [Parceiro] me passou seu contato e pediu MUITO
pra eu falar contigo. Ele ta usando o sistema
na [Empresa dele] e quis que voce visse tambem.

Posso te ligar rapidinho pra te mostrar o que ele viu?"

OBJETIVO: Usar autoridade do parceiro para abrir conversa</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_2A</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_3A</bpmn2:outgoing>
    </bpmn2:sendTask>

    <!-- ==================== CENARIO B: PASSIVO (Lead te procura) ==================== -->

    <bpmn2:serviceTask id="Task_TagPassivo" name="Tag [INDICACAO: PARCEIRO]">
      <bpmn2:documentation>TAGUEAMENTO DO LEAD:
- Tag: [INDICACAO: NOME_DO_PARCEIRO]
- Origem: PASSIVO (lead veio sozinho)
- Identificar qual parceiro indicou</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Passivo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_2B</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_ContatoPassivo" name="Resposta VIP Imediata">
      <bpmn2:documentation>PRIMEIRO CONTATO - CENARIO PASSIVO:

SCRIPT WHATSAPP:
"[Lead]! Que bom que voce veio!

O [Parceiro] ja tinha me falado de voce,
tava te esperando! Ele me contou que voce
tambem ta na correria com a gestao da [Empresa].

Deixa eu te mostrar rapidinho o que ele viu
e curtiu tanto. Posso te ligar agora?"

OBJETIVO: Tratamento VIP, valorizar que veio por indicacao</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_2B</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_3B</bpmn2:outgoing>
    </bpmn2:sendTask>

    <!-- ==================== MERGE E LIGACAO ==================== -->

    <bpmn2:exclusiveGateway id="Gateway_MergeContato" name="Merge">
      <bpmn2:incoming>Flow_Ind_3A</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_3B</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_4</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:userTask id="Task_LigacaoParceiro" name="Ligacao (Cita Parceiro no 1o Segundo)">
      <bpmn2:documentation>LIGACAO COM AUTORIDADE EMPRESTADA:

ABRIR A LIGACAO CITANDO O PARCEIRO NO 1o SEGUNDO!

SCRIPT:
"[Lead]! Aqui e o [Vendedor], o [PARCEIRO] me cobrou
pra te ligar! Ele ficou empolgado com o que a gente
fez pra academia dele e insistiu que eu te mostrasse."

"Ele comentou que voce sofre com [DOR ESPECIFICA].
Deixa eu te mostrar em 2 minutinhos o que ele viu
aqui no Zap... e voce me diz se faz sentido pra voce."

OBJETIVO: Quebrar o gelo usando confianca do parceiro</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_4</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_5</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_Atendeu" name="Atendeu?">
      <bpmn2:documentation>DECISAO: Lead atendeu a ligacao?

SIM -> Flash Demo imediata
NAO -> Cadencia do Parceiro (D1 a D7)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Atendeu</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_NaoAtendeu</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <!-- ==================== PATH NAO ATENDEU - CADENCIA DO PARCEIRO ==================== -->

    <bpmn2:sendTask id="Task_D1_ParceiroPerguntou" name="D+1: [Parceiro] Perguntou se Ja Mostrei">
      <bpmn2:documentation>CADENCIA D+1 - PRESSAO SOCIAL POSITIVA:

WHATSAPP:
"Fala [Lead], o [Parceiro] me perguntou se eu ja
tinha te mostrado o sistema. Ta na correria?

Me da um toque quando tiver 5 minutinhos
que te mostro rapidinho!"

OBJETIVO: Usar nome do parceiro como alavanca (sem ser chato)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_NaoAtendeu</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_6</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D3_VideoBastidor" name="D+3: Video de Bastidor">
      <bpmn2:documentation>CADENCIA D+3 - VIDEO DE BASTIDOR:

WHATSAPP + VIDEO CURTO:
"[Lead], gravei esse video rapidinho mostrando
um resultado foda que a gente fez essa semana.

O [Parceiro] ja viu e curtiu demais.
Da uma olhada quando puder!"

[ANEXAR VIDEO DE 30-60 SEG MOSTRANDO RESULTADO]

OBJETIVO: Prova social em video, resultado real</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_6</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_7</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D5_BonusExpirando" name="D+5: Bonus do Parceiro Expirando">
      <bpmn2:documentation>CADENCIA D+5 - URGENCIA DO BONUS:

WHATSAPP:
"[Lead], nao quero que voce perca o bonus
que o [Parceiro] conseguiu pra voce!

Ele me pediu pra garantir que voce testasse
antes de expirar. Conseguiu dar uma olhada?"

OBJETIVO: Criar urgencia usando o nome do parceiro</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_8</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D7_Despedida" name="D+7: Mensagem de Despedida">
      <bpmn2:documentation>CADENCIA D+7 - DESPEDIDA ELEGANTE:

WHATSAPP:
"[Lead], vou liberar o link pro bonus expirar.

Nao quero te encher, mas se precisar de mim
no futuro, o contato e este. O [Parceiro]
sabe me achar tambem!

Sucesso ai na [Empresa]! Abraco"

OBJETIVO: Fechar ciclo com elegancia, nao queimar ponte</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_8</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_9</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:exclusiveGateway id="Gateway_Respondeu" name="Respondeu na Cadencia?">
      <bpmn2:documentation>DECISAO: Lead respondeu durante a cadencia D1-D7?

SIM -> Flash Demo
NAO -> Lead Perdido (mas nao descartado)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_9</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Respondeu</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_NaoRespondeu</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <!-- ==================== FLASH DEMO ==================== -->

    <bpmn2:userTask id="Task_FlashDemo" name="Flash Demo (IA Processando Gasto Real)">
      <bpmn2:documentation>FLASH DEMO COM PROVA DE VALOR:

SCRIPT DE ABERTURA:
"O [Parceiro] me disse que voce queria ver isso...
Deixa eu te mostrar a IA processando um gasto real."

DURANTE A DEMO:
- Mostrar IA categorizando despesa em tempo real
- Usar exemplo similar ao do parceiro
- "Isso aqui o [Parceiro] usa todo dia..."

FECHAMENTO:
"Faz sentido pra [Empresa]? Quer testar 7 dias
com o bonus que o [Parceiro] conseguiu pra voce?"

OBJETIVO: Prova de valor INSTANTANEA</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Atendeu</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Respondeu</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_10</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_QuerTrial" name="Quer Trial?">
      <bpmn2:incoming>Flow_Ind_10</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Trial_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Trial_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <!-- ==================== TRIAL 7 DIAS COM GUARDIAO ==================== -->

    <bpmn2:serviceTask id="Task_AtivarTrial" name="Ativar Trial 7 Dias">
      <bpmn2:documentation>ATIVACAO DO TRIAL:
- Liberar acesso completo por 7 dias
- Tag: [TRIAL_INDICACAO: PARCEIRO]
- Configurar Guardiao para monitorar uso
- Agendar cadencia de fechamento D7

OBJETIVO: Fazer o lead "sentir o gosto" da organizacao</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Trial_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_11</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Task_Guardiao_Ind" name="Guardiao: Monitorar Uso no Trial">
      <bpmn2:documentation>GUARDIAO DO TRIAL INDICACAO:

MONITORAR:
- Login diario
- Funcionalidades usadas
- Tempo na plataforma
- Dados cadastrados

REGRA DE ALERTA:
Se nao logar em 48h -> Dispara alerta de inatividade

OBJETIVO: Nao deixar o lead esfriar durante o trial</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_11</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_12</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Inativo</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_AlertaInativo" name="Alerta: Ta Conseguindo Acessar?">
      <bpmn2:documentation>ALERTA DE INATIVIDADE (48H SEM LOGIN):

WHATSAPP:
"[Lead], vi que voce nao conseguiu entrar ainda.
Ta conseguindo acessar?

O [Parceiro] me pediu pra garantir que voce
testasse direitinho. Quer que eu te ajude?"

OBJETIVO: Reengajar lead inativo antes de esfriar</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Inativo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_VoltaGuardiao</bpmn2:outgoing>
    </bpmn2:sendTask>

    <!-- ==================== VITRINE BINARIA D7 ==================== -->

    <bpmn2:userTask id="Task_OfertaAnual" name="D7: Oferta Anual R$1.497 + Bonus Parceiro">
      <bpmn2:documentation>VITRINE BINARIA - OFERTA PRINCIPAL:

LIGACAO D7:
"[Lead], seu trial termina hoje! Antes de falar
de planos, me conta: o que voce mais curtiu?"

[OUVIR E VALIDAR]

OFERTA PRINCIPAL:
"Como voce veio pela indicacao do [Parceiro],
tenho uma condicao especial:

PLANO ANUAL: R$ 1.497 (12x R$ 124,75)
+ BONUS DO PARCEIRO: 1 mes extra gratis!
+ Consultoria de setup inclusa

O [Parceiro] fechou esse mesmo plano.
Faz sentido pra voce?"

OBJETIVO: Fechar no plano de maior valor</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_12</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_VoltaGuardiao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_13</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_FechouAnual" name="Fechou Anual?">
      <bpmn2:incoming>Flow_Ind_13</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Anual_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Anual_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:userTask id="Task_OfertaSemestral" name="Recuperacao: Semestral R$997">
      <bpmn2:documentation>VITRINE BINARIA - RECUPERACAO:

SE RESISTIR AO ANUAL:
"Entendo! Olha, se o anual pesa agora,
tenho o SEMESTRAL por R$ 997 (6x R$ 166).

Voce ainda ganha o bonus do [Parceiro]
e pode fazer upgrade depois se quiser.

O que acha?"

OBJETIVO: Oferecer alternativa sem perder a venda</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Anual_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_14</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_FechouSemestral" name="Fechou Semestral?">
      <bpmn2:incoming>Flow_Ind_14</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Semestral_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Semestral_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:userTask id="Task_OfertaTrimestral" name="Downsell Final: Trimestral R$561">
      <bpmn2:documentation>VITRINE BINARIA - DOWNSELL FINAL:

ULTIMA TENTATIVA (VENDEDOR):
"[Lead], ultima opcao que consigo fazer:
TRIMESTRAL por R$ 561 (3x R$ 187).

E o minimo pra voce comecar a organizar
a [Empresa] e sentir o resultado.

Depois voce decide se quer continuar.
Topa testar por 3 meses?"

OBJETIVO: Nao perder o lead, converter no minimo</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Semestral_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_15</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_FechouTrimestral" name="Fechou Trimestral?">
      <bpmn2:incoming>Flow_Ind_15</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Trimestral_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Trimestral_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <!-- ==================== POS-CONVERSAO ==================== -->

    <bpmn2:sendTask id="Task_NotificaParceiro" name="Notifica Parceiro: Indicado Fechou!">
      <bpmn2:documentation>NOTIFICACAO AO PARCEIRO:

WHATSAPP PARA O PARCEIRO:
"[Parceiro], boa noticia!

O [Lead] que voce indicou FECHOU com a gente!
Muito obrigado pela indicacao, voce e demais!

Sua comissao de 30% ja ta garantida no sistema.
Valeu mesmo! Manda mais que a gente cuida!"

OBJETIVO:
- Agradecer e fortalecer relacionamento
- Lembrar da comissao (30% split automatico)
- Incentivar mais indicacoes</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Anual_Sim</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Semestral_Sim</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Trimestral_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Checkout</bpmn2:outgoing>
    </bpmn2:sendTask>

    <!-- ==================== FINALIZACOES ==================== -->

    <bpmn2:endEvent id="End_Checkout_Ind" name="Vai pro Checkout">
      <bpmn2:documentation>LEAD CONVERTIDO - VAI PRO CHECKOUT:
- Direcionar para Gateway Checkout (Centro)
- Split 30% automatico para o parceiro via Asaas
- Onboarding de cliente pago</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Checkout</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:endEvent id="End_Perdido_Ind" name="Lead Nao Converteu">
      <bpmn2:documentation>LEAD NAO CONVERTEU:

IMPORTANTE: Nao descartar completamente!
- Manter em lista de remarketing
- Notificar parceiro com cuidado
- Deixar porta aberta

MSG PARA PARCEIRO:
"[Parceiro], o [Lead] decidiu esperar um pouco.
Valeu pela indicacao! Se ele mudar de ideia,
a gente atende na hora."</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_NaoRespondeu</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Trial_Nao</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Trimestral_Nao</bpmn2:incoming>
    </bpmn2:endEvent>

    <!-- ==================== SEQUENCE FLOWS ==================== -->

    <!-- Gateway de Entrada -->
    <bpmn2:sequenceFlow id="Flow_Ind_Start" sourceRef="Start_Indicacao" targetRef="Gateway_TipoEntrada" />
    <bpmn2:sequenceFlow id="Flow_Ind_Ativo" name="Ativo (Parceiro Entregou)" sourceRef="Gateway_TipoEntrada" targetRef="Task_TagIndicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Passivo" name="Passivo (Lead Veio)" sourceRef="Gateway_TipoEntrada" targetRef="Task_TagPassivo" />

    <!-- Cenario A -->
    <bpmn2:sequenceFlow id="Flow_Ind_2A" sourceRef="Task_TagIndicacao" targetRef="Task_ContatoAtivo" />
    <bpmn2:sequenceFlow id="Flow_Ind_3A" sourceRef="Task_ContatoAtivo" targetRef="Gateway_MergeContato" />

    <!-- Cenario B -->
    <bpmn2:sequenceFlow id="Flow_Ind_2B" sourceRef="Task_TagPassivo" targetRef="Task_ContatoPassivo" />
    <bpmn2:sequenceFlow id="Flow_Ind_3B" sourceRef="Task_ContatoPassivo" targetRef="Gateway_MergeContato" />

    <!-- Merge e Ligacao -->
    <bpmn2:sequenceFlow id="Flow_Ind_4" sourceRef="Gateway_MergeContato" targetRef="Task_LigacaoParceiro" />
    <bpmn2:sequenceFlow id="Flow_Ind_5" sourceRef="Task_LigacaoParceiro" targetRef="Gateway_Atendeu" />
    <bpmn2:sequenceFlow id="Flow_Ind_Atendeu" name="Sim" sourceRef="Gateway_Atendeu" targetRef="Task_FlashDemo" />
    <bpmn2:sequenceFlow id="Flow_Ind_NaoAtendeu" name="Nao" sourceRef="Gateway_Atendeu" targetRef="Task_D1_ParceiroPerguntou" />

    <!-- Cadencia do Parceiro -->
    <bpmn2:sequenceFlow id="Flow_Ind_6" sourceRef="Task_D1_ParceiroPerguntou" targetRef="Task_D3_VideoBastidor" />
    <bpmn2:sequenceFlow id="Flow_Ind_7" sourceRef="Task_D3_VideoBastidor" targetRef="Task_D5_BonusExpirando" />
    <bpmn2:sequenceFlow id="Flow_Ind_8" sourceRef="Task_D5_BonusExpirando" targetRef="Task_D7_Despedida" />
    <bpmn2:sequenceFlow id="Flow_Ind_9" sourceRef="Task_D7_Despedida" targetRef="Gateway_Respondeu" />
    <bpmn2:sequenceFlow id="Flow_Ind_Respondeu" name="Sim" sourceRef="Gateway_Respondeu" targetRef="Task_FlashDemo" />
    <bpmn2:sequenceFlow id="Flow_Ind_NaoRespondeu" name="Nao" sourceRef="Gateway_Respondeu" targetRef="End_Perdido_Ind" />

    <!-- Flash Demo -->
    <bpmn2:sequenceFlow id="Flow_Ind_10" sourceRef="Task_FlashDemo" targetRef="Gateway_QuerTrial" />
    <bpmn2:sequenceFlow id="Flow_Ind_Trial_Sim" name="Sim" sourceRef="Gateway_QuerTrial" targetRef="Task_AtivarTrial" />
    <bpmn2:sequenceFlow id="Flow_Ind_Trial_Nao" name="Nao" sourceRef="Gateway_QuerTrial" targetRef="End_Perdido_Ind" />

    <!-- Trial com Guardiao -->
    <bpmn2:sequenceFlow id="Flow_Ind_11" sourceRef="Task_AtivarTrial" targetRef="Task_Guardiao_Ind" />
    <bpmn2:sequenceFlow id="Flow_Ind_12" name="Usando" sourceRef="Task_Guardiao_Ind" targetRef="Task_OfertaAnual" />
    <bpmn2:sequenceFlow id="Flow_Ind_Inativo" name="48h Sem Login" sourceRef="Task_Guardiao_Ind" targetRef="Task_AlertaInativo" />
    <bpmn2:sequenceFlow id="Flow_Ind_VoltaGuardiao" sourceRef="Task_AlertaInativo" targetRef="Task_OfertaAnual" />

    <!-- Vitrine Binaria -->
    <bpmn2:sequenceFlow id="Flow_Ind_13" sourceRef="Task_OfertaAnual" targetRef="Gateway_FechouAnual" />
    <bpmn2:sequenceFlow id="Flow_Ind_Anual_Sim" name="Sim" sourceRef="Gateway_FechouAnual" targetRef="Task_NotificaParceiro" />
    <bpmn2:sequenceFlow id="Flow_Ind_Anual_Nao" name="Nao" sourceRef="Gateway_FechouAnual" targetRef="Task_OfertaSemestral" />
    <bpmn2:sequenceFlow id="Flow_Ind_14" sourceRef="Task_OfertaSemestral" targetRef="Gateway_FechouSemestral" />
    <bpmn2:sequenceFlow id="Flow_Ind_Semestral_Sim" name="Sim" sourceRef="Gateway_FechouSemestral" targetRef="Task_NotificaParceiro" />
    <bpmn2:sequenceFlow id="Flow_Ind_Semestral_Nao" name="Nao" sourceRef="Gateway_FechouSemestral" targetRef="Task_OfertaTrimestral" />
    <bpmn2:sequenceFlow id="Flow_Ind_15" sourceRef="Task_OfertaTrimestral" targetRef="Gateway_FechouTrimestral" />
    <bpmn2:sequenceFlow id="Flow_Ind_Trimestral_Sim" name="Sim" sourceRef="Gateway_FechouTrimestral" targetRef="Task_NotificaParceiro" />
    <bpmn2:sequenceFlow id="Flow_Ind_Trimestral_Nao" name="Nao" sourceRef="Gateway_FechouTrimestral" targetRef="End_Perdido_Ind" />

    <!-- Checkout -->
    <bpmn2:sequenceFlow id="Flow_Ind_Checkout" sourceRef="Task_NotificaParceiro" targetRef="End_Checkout_Ind" />

  </bpmn2:process>

  <!-- ==================== DIAGRAMA VISUAL (BPMNDI) ==================== -->

  <bpmndi:BPMNDiagram id="BPMNDiagram_Indicacoes">
    <bpmndi:BPMNPlane id="BPMNPlane_Indicacoes" bpmnElement="Collaboration_Indicacoes">

      <!-- Participant e Lane -->
      <bpmndi:BPMNShape id="Shape_Participant_Ind" bpmnElement="Participant_Indicacoes" isHorizontal="true">
        <dc:Bounds x="120" y="60" width="2600" height="520" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Lane_Indicacoes" bpmnElement="Lane_Indicacoes" isHorizontal="true">
        <dc:Bounds x="150" y="60" width="2570" height="520" />
      </bpmndi:BPMNShape>

      <!-- Gateway de Entrada -->
      <bpmndi:BPMNShape id="Shape_Start_Indicacao" bpmnElement="Start_Indicacao">
        <dc:Bounds x="200" y="282" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_TipoEntrada" bpmnElement="Gateway_TipoEntrada" isMarkerVisible="true">
        <dc:Bounds x="275" y="275" width="50" height="50" />
      </bpmndi:BPMNShape>

      <!-- Cenario A: Ativo (linha superior y=160) -->
      <bpmndi:BPMNShape id="Shape_Task_TagIndicacao" bpmnElement="Task_TagIndicacao">
        <dc:Bounds x="360" y="140" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_ContatoAtivo" bpmnElement="Task_ContatoAtivo">
        <dc:Bounds x="490" y="140" width="100" height="60" />
      </bpmndi:BPMNShape>

      <!-- Cenario B: Passivo (linha inferior y=380) -->
      <bpmndi:BPMNShape id="Shape_Task_TagPassivo" bpmnElement="Task_TagPassivo">
        <dc:Bounds x="360" y="370" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_ContatoPassivo" bpmnElement="Task_ContatoPassivo">
        <dc:Bounds x="490" y="370" width="100" height="60" />
      </bpmndi:BPMNShape>

      <!-- Merge e Ligacao (linha principal y=270) -->
      <bpmndi:BPMNShape id="Shape_Gateway_MergeContato" bpmnElement="Gateway_MergeContato" isMarkerVisible="true">
        <dc:Bounds x="625" y="275" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_LigacaoParceiro" bpmnElement="Task_LigacaoParceiro">
        <dc:Bounds x="710" y="270" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Atendeu" bpmnElement="Gateway_Atendeu" isMarkerVisible="true">
        <dc:Bounds x="845" y="275" width="50" height="50" />
      </bpmndi:BPMNShape>

      <!-- Cadencia do Parceiro (linha inferior y=420) -->
      <bpmndi:BPMNShape id="Shape_Task_D1_ParceiroPerguntou" bpmnElement="Task_D1_ParceiroPerguntou">
        <dc:Bounds x="820" y="420" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D3_VideoBastidor" bpmnElement="Task_D3_VideoBastidor">
        <dc:Bounds x="950" y="420" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D5_BonusExpirando" bpmnElement="Task_D5_BonusExpirando">
        <dc:Bounds x="1080" y="420" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D7_Despedida" bpmnElement="Task_D7_Despedida">
        <dc:Bounds x="1210" y="420" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Respondeu" bpmnElement="Gateway_Respondeu" isMarkerVisible="true">
        <dc:Bounds x="1345" y="425" width="50" height="50" />
      </bpmndi:BPMNShape>

      <!-- Flash Demo (linha principal y=270) -->
      <bpmndi:BPMNShape id="Shape_Task_FlashDemo" bpmnElement="Task_FlashDemo">
        <dc:Bounds x="930" y="270" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_QuerTrial" bpmnElement="Gateway_QuerTrial" isMarkerVisible="true">
        <dc:Bounds x="1065" y="275" width="50" height="50" />
      </bpmndi:BPMNShape>

      <!-- Trial com Guardiao (linha superior y=140) -->
      <bpmndi:BPMNShape id="Shape_Task_AtivarTrial" bpmnElement="Task_AtivarTrial">
        <dc:Bounds x="1150" y="140" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Guardiao_Ind" bpmnElement="Task_Guardiao_Ind">
        <dc:Bounds x="1280" y="140" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_AlertaInativo" bpmnElement="Task_AlertaInativo">
        <dc:Bounds x="1280" y="270" width="100" height="60" />
      </bpmndi:BPMNShape>

      <!-- Vitrine Binaria (linha superior y=140) -->
      <bpmndi:BPMNShape id="Shape_Task_OfertaAnual" bpmnElement="Task_OfertaAnual">
        <dc:Bounds x="1420" y="140" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_FechouAnual" bpmnElement="Gateway_FechouAnual" isMarkerVisible="true">
        <dc:Bounds x="1555" y="145" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_OfertaSemestral" bpmnElement="Task_OfertaSemestral">
        <dc:Bounds x="1640" y="220" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_FechouSemestral" bpmnElement="Gateway_FechouSemestral" isMarkerVisible="true">
        <dc:Bounds x="1775" y="225" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_OfertaTrimestral" bpmnElement="Task_OfertaTrimestral">
        <dc:Bounds x="1860" y="300" width="100" height="60" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_FechouTrimestral" bpmnElement="Gateway_FechouTrimestral" isMarkerVisible="true">
        <dc:Bounds x="1995" y="305" width="50" height="50" />
      </bpmndi:BPMNShape>

      <!-- Pos-Conversao -->
      <bpmndi:BPMNShape id="Shape_Task_NotificaParceiro" bpmnElement="Task_NotificaParceiro">
        <dc:Bounds x="2100" y="140" width="100" height="60" />
      </bpmndi:BPMNShape>

      <!-- Finalizacoes -->
      <bpmndi:BPMNShape id="Shape_End_Checkout_Ind" bpmnElement="End_Checkout_Ind">
        <dc:Bounds x="2262" y="152" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Perdido_Ind" bpmnElement="End_Perdido_Ind">
        <dc:Bounds x="2132" y="432" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- ===== EDGES ===== -->

      <!-- Gateway de Entrada -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Start" bpmnElement="Flow_Ind_Start">
        <di:waypoint x="236" y="300" />
        <di:waypoint x="275" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Ativo" bpmnElement="Flow_Ind_Ativo">
        <di:waypoint x="300" y="275" />
        <di:waypoint x="300" y="170" />
        <di:waypoint x="360" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Passivo" bpmnElement="Flow_Ind_Passivo">
        <di:waypoint x="300" y="325" />
        <di:waypoint x="300" y="400" />
        <di:waypoint x="360" y="400" />
      </bpmndi:BPMNEdge>

      <!-- Cenario A -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_2A" bpmnElement="Flow_Ind_2A">
        <di:waypoint x="460" y="170" />
        <di:waypoint x="490" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_3A" bpmnElement="Flow_Ind_3A">
        <di:waypoint x="590" y="170" />
        <di:waypoint x="650" y="170" />
        <di:waypoint x="650" y="275" />
      </bpmndi:BPMNEdge>

      <!-- Cenario B -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_2B" bpmnElement="Flow_Ind_2B">
        <di:waypoint x="460" y="400" />
        <di:waypoint x="490" y="400" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_3B" bpmnElement="Flow_Ind_3B">
        <di:waypoint x="590" y="400" />
        <di:waypoint x="650" y="400" />
        <di:waypoint x="650" y="325" />
      </bpmndi:BPMNEdge>

      <!-- Merge e Ligacao -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_4" bpmnElement="Flow_Ind_4">
        <di:waypoint x="675" y="300" />
        <di:waypoint x="710" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_5" bpmnElement="Flow_Ind_5">
        <di:waypoint x="810" y="300" />
        <di:waypoint x="845" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Atendeu" bpmnElement="Flow_Ind_Atendeu">
        <di:waypoint x="895" y="300" />
        <di:waypoint x="930" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_NaoAtendeu" bpmnElement="Flow_Ind_NaoAtendeu">
        <di:waypoint x="870" y="325" />
        <di:waypoint x="870" y="420" />
      </bpmndi:BPMNEdge>

      <!-- Cadencia do Parceiro -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_6" bpmnElement="Flow_Ind_6">
        <di:waypoint x="920" y="450" />
        <di:waypoint x="950" y="450" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_7" bpmnElement="Flow_Ind_7">
        <di:waypoint x="1050" y="450" />
        <di:waypoint x="1080" y="450" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_8" bpmnElement="Flow_Ind_8">
        <di:waypoint x="1180" y="450" />
        <di:waypoint x="1210" y="450" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_9" bpmnElement="Flow_Ind_9">
        <di:waypoint x="1310" y="450" />
        <di:waypoint x="1345" y="450" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Respondeu" bpmnElement="Flow_Ind_Respondeu">
        <di:waypoint x="1370" y="425" />
        <di:waypoint x="1370" y="300" />
        <di:waypoint x="1030" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_NaoRespondeu" bpmnElement="Flow_Ind_NaoRespondeu">
        <di:waypoint x="1395" y="450" />
        <di:waypoint x="2132" y="450" />
      </bpmndi:BPMNEdge>

      <!-- Flash Demo -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_10" bpmnElement="Flow_Ind_10">
        <di:waypoint x="1030" y="300" />
        <di:waypoint x="1065" y="300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Trial_Sim" bpmnElement="Flow_Ind_Trial_Sim">
        <di:waypoint x="1090" y="275" />
        <di:waypoint x="1090" y="170" />
        <di:waypoint x="1150" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Trial_Nao" bpmnElement="Flow_Ind_Trial_Nao">
        <di:waypoint x="1090" y="325" />
        <di:waypoint x="1090" y="450" />
        <di:waypoint x="2132" y="450" />
      </bpmndi:BPMNEdge>

      <!-- Trial com Guardiao -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_11" bpmnElement="Flow_Ind_11">
        <di:waypoint x="1250" y="170" />
        <di:waypoint x="1280" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_12" bpmnElement="Flow_Ind_12">
        <di:waypoint x="1380" y="170" />
        <di:waypoint x="1420" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Inativo" bpmnElement="Flow_Ind_Inativo">
        <di:waypoint x="1330" y="200" />
        <di:waypoint x="1330" y="270" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_VoltaGuardiao" bpmnElement="Flow_Ind_VoltaGuardiao">
        <di:waypoint x="1380" y="300" />
        <di:waypoint x="1400" y="300" />
        <di:waypoint x="1400" y="170" />
        <di:waypoint x="1420" y="170" />
      </bpmndi:BPMNEdge>

      <!-- Vitrine Binaria -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_13" bpmnElement="Flow_Ind_13">
        <di:waypoint x="1520" y="170" />
        <di:waypoint x="1555" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Anual_Sim" bpmnElement="Flow_Ind_Anual_Sim">
        <di:waypoint x="1605" y="170" />
        <di:waypoint x="2100" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Anual_Nao" bpmnElement="Flow_Ind_Anual_Nao">
        <di:waypoint x="1580" y="195" />
        <di:waypoint x="1580" y="250" />
        <di:waypoint x="1640" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_14" bpmnElement="Flow_Ind_14">
        <di:waypoint x="1740" y="250" />
        <di:waypoint x="1775" y="250" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Semestral_Sim" bpmnElement="Flow_Ind_Semestral_Sim">
        <di:waypoint x="1800" y="225" />
        <di:waypoint x="1800" y="170" />
        <di:waypoint x="2100" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Semestral_Nao" bpmnElement="Flow_Ind_Semestral_Nao">
        <di:waypoint x="1800" y="275" />
        <di:waypoint x="1800" y="330" />
        <di:waypoint x="1860" y="330" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_15" bpmnElement="Flow_Ind_15">
        <di:waypoint x="1960" y="330" />
        <di:waypoint x="1995" y="330" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Trimestral_Sim" bpmnElement="Flow_Ind_Trimestral_Sim">
        <di:waypoint x="2020" y="305" />
        <di:waypoint x="2020" y="170" />
        <di:waypoint x="2100" y="170" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Trimestral_Nao" bpmnElement="Flow_Ind_Trimestral_Nao">
        <di:waypoint x="2020" y="355" />
        <di:waypoint x="2020" y="450" />
        <di:waypoint x="2132" y="450" />
      </bpmndi:BPMNEdge>

      <!-- Checkout -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Checkout" bpmnElement="Flow_Ind_Checkout">
        <di:waypoint x="2200" y="170" />
        <di:waypoint x="2262" y="170" />
      </bpmndi:BPMNEdge>

    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>

</bpmn2:definitions>`;

export default indicacoesTemplate;

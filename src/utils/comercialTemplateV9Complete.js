/**
 * Template BPMN - JORNADA COMERCIAL FYNESS V9 (COMPLETO ENXUTO)
 * Template com TODAS as 7 POOLS SEPARADAS - Versão reestruturada
 *
 * POOLS (PARTICIPANTS):
 * 1. 🎓 EDUCAÇÃO - Alunos (6 Meses Grátis)
 * 2. 🤝 INDICAÇÃO - Parceiro (Ativo + Passivo)
 * 3. 📱 PRODUÇÃO CONTEÚDO - Instagram
 * 4. 🎯 PROSPECÇÃO ATIVA - Redes Sociais
 * 5. 🔍 GOOGLE ADS - Alta Intenção
 * 6. 📘 META ADS - Descoberta
 * 7. 💰 NÚCLEO FINANCEIRO - Gateway Asaas
 *
 * ESTRUTURA:
 * - 7 Pools separadas (ao invés de 1 pool com 7 lanes)
 * - 7 Processos independentes
 * - 5 Message Flows conectando pools ao Núcleo Financeiro
 * - Pools empilhadas verticalmente no diagrama
 */

export const COMERCIAL_V9_COMPLETE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0"
  id="Definitions_ComercialV9"
  targetNamespace="http://fyness.com/bpmn/comercial-v9">

    <bpmn2:collaboration id="Collaboration_Comercial">
    <bpmn2:participant id="Participant_Educacao" name="🎓 EDUCAÇÃO - Alunos (6 Meses Grátis)" processRef="Process_Educacao" />
    <bpmn2:participant id="Participant_Indicacao" name="🤝 INDICAÇÃO - Parceiro (Ativo + Passivo)" processRef="Process_Indicacao" />
    <bpmn2:participant id="Participant_Conteudo" name="📱 PRODUÇÃO CONTEÚDO - Instagram" processRef="Process_Conteudo" />
    <bpmn2:participant id="Participant_Prospeccao" name="🎯 PROSPECÇÃO ATIVA - Redes Sociais" processRef="Process_Prospeccao" />
    <bpmn2:participant id="Participant_Google" name="🔍 GOOGLE ADS - Alta Intenção" processRef="Process_Google" />
    <bpmn2:participant id="Participant_Meta" name="📘 META ADS - Descoberta" processRef="Process_Meta" />
    <bpmn2:participant id="Participant_Nucleo" name="💰 NÚCLEO FINANCEIRO - Gateway Asaas" processRef="Process_Nucleo" />
  </bpmn2:collaboration>

    <bpmn2:process id="Process_Educacao" isExecutable="false">

    <bpmn2:startEvent id="Start_Educacao_Software" name="Comprou Software (Semestral)">
      <bpmn2:documentation>PORTA A: Comprou o SOFTWARE (plano semestral)
Mentalidade: "Comprei a FERRAMENTA"
Bônus: Ganha Curso de Gestão Completo</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Edu_Soft_1</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:startEvent id="Start_Educacao_Curso" name="Comprou Curso (Método)">
      <bpmn2:documentation>PORTA B: Comprou o CURSO (método)
Mentalidade: "Comprei o CONHECIMENTO"
Bônus: Ganha 6 Meses Fyness Grátis</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Edu_Curso_1</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:endEvent id="End_Cliente_Ativo_Educacao" name="Cliente Ativo (Renovado)">
      <bpmn2:incoming>Flow_Edu_Renov_Anual</bpmn2:incoming>
      <bpmn2:incoming>Flow_Edu_Renov_Mensal</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:endEvent id="End_Cliente_Perdido_Educacao" name="Cliente Perdido (Churn)">
      <bpmn2:documentation>CHURN - MOTIVOS PROVÁVEIS:
- Não viu valor
- Não criou hábito
- Problema financeiro
- Voltou para planilha

AÇÃO PÓS-CHURN: Grupo de nurturing de longo prazo (conteúdo educativo)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Recuperou_Nao</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:task id="Task_Aula_Setup" name="Aula Trava-Zap: Setup em 10 min">
      <bpmn2:documentation>🎯 AULA INAUGURAL (TRAVA-ZAP):

ESTRATÉGIA: Aula curta e direta ao ponto
DURAÇÃO: 10 minutos máximo

CONTEÚDO:
1. Login no Fyness
2. Conectar WhatsApp
3. Fazer 1 lançamento de teste
4. Ver o gráfico aparecer

GANCHO: "Você vai lançar SUA primeira receita agora."</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Email_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Setup_1</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_CS_Liga_Ativacao" name="CS liga: Ajuda no Zoom">
      <bpmn2:documentation>📞 LIGAÇÃO CS (D+7 - NÃO ATIVOU):

SCRIPT:
"Oi [Nome], vi que você garantiu os 6 meses mas ainda não fez o setup.
Tem algo travando?

Posso te ajudar no Zoom agora em 15 minutos?"

OBJETIVO: Destravar. Se recusar 2x, marcar como "risco de cancelamento".</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Ativou_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_CS_Ativa</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_M1_Desafio_DRE" name="M1: Desafio do Primeiro DRE na Comunidade">
      <bpmn2:documentation>🏆 MÊS 1 - DESAFIO PRIMEIRO DRE:

MENSAGEM COMUNIDADE:
"Pessoal, quem vai postar o primeiro DRE do mês até sexta?
Quem postar ganha um Relatório Personalizado comigo."

PSICOLOGIA: Gamificação + Prova Social
OBJETIVO: Criar hábito de uso mensal</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Merge_Ativa</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_M1</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Renovacao_Anual" name="Anual: 20% desconto + Curso 2.0">
      <bpmn2:documentation>🎉 RENOVAÇÃO ANUAL (IDEAL):

BENEFÍCIOS:
- 20% de desconto
- Acesso ao Curso 2.0 (Gestão Avançada)
- Suporte prioritário
- Garantia de histórico vitalício

MENSAGEM:
"Parabéns! Você garantiu mais 12 meses de tranquilidade.
Seu histórico está seguro e você agora tem acesso ao módulo avançado."</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Tipo_Anual</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Renov_Anual</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Renovacao_Mensal" name="Mensal: Preço cheio recorrente">
      <bpmn2:documentation>💳 RENOVAÇÃO MENSAL:

CONDIÇÕES:
- Preço cheio mensal
- Mantém histórico
- Pode mudar para anual a qualquer momento

MENSAGEM:
"Seu plano mensal está ativo. Você mantém todo o histórico.
Dica: Mudando para anual você economiza 20%."</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Tipo_Mensal</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Renov_Mensal</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Bloqueio_Leitura" name="Bloqueio Lógico: Modo Leitura com Cadeado">
      <bpmn2:documentation>🔒 BLOQUEIO LÓGICO (MODO LEITURA):

O QUE ACONTECE:
- Ele entra no Fyness
- Vê os gráficos lindos dele
- Mas o botão de microfone (áudio) está bloqueado com cadeado
- Botão "Novo Lançamento" também bloqueado

MENSAGEM NA TELA:
"Sua licença expirou. Renove para continuar controlando seu lucro."

OBJETIVO: Mostrar o que ele vai PERDER se não renovar.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Renovou_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Bloqueio</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_CS_Recuperacao" name="CS Liga Final: Vai jogar 6 meses fora?">
      <bpmn2:documentation>📞 LIGAÇÃO CS (RECOVERY FINAL):

SCRIPT:
"[Nome], vi que sua licença expirou.

Você tem 6 meses de histórico valioso aí.
Vai jogar isso fora e voltar pra planilha?

Consegui liberar uma condição especial pra você renovar agora."

URGÊNCIA: Última chance antes de perder os dados.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Bloqueio</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_CS_Recovery</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:serviceTask id="Task_Tag_Software" name="Tag: [CLIENTE_BUNDLE_SOFT]">
      <bpmn2:documentation>CRM ACTION:
Tag: [CLIENTE_BUNDLE_SOFT]
Perfil: Comprou ferramenta, ganhou método
Bônus: Curso Completo de Gestão Financeira</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Soft_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Soft_2</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Task_Tag_Curso" name="Tag: [ALUNO_BUNDLE_CURSO]">
      <bpmn2:documentation>CRM ACTION:
Tag: [ALUNO_BUNDLE_CURSO]
Perfil: Comprou método, ganhou ferramenta
Bônus: 6 Meses Fyness Free</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Curso_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Curso_2</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_Email_BoasVindas" name="E-mail: Acesso Liberado (Curso + Software)">
      <bpmn2:documentation>📧 E-MAIL DE BOAS-VINDAS HÍBRIDO:

ASSUNTO: "Acesso Liberado: Sua Máquina de Lucro (Curso + Software)"

CORPO:
"Parabéns! Você garantiu 6 meses de tranquilidade.

Sua Ferramenta (Fyness): [Link de Ativação]
Seu Manual (Curso): [Link da Área de Membros]

Missão #1: Assista agora à 'Aula Inaugural' no curso para configurar o Fyness em 10 minutos."

OBJETIVO: Instalação Imediata. Se não configurar na 1ª semana, cancela.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Merge_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Email_1</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_M3_Checkpoint" name="M3: E-mail de Progresso - Economizou R$ X">
      <bpmn2:documentation>📊 MÊS 3 - CHECKPOINT DE VALOR:

E-MAIL PERSONALIZADO:
"[Nome], você já tem 90 dias de histórico no Fyness.

Nesse período você:
- Lançou R$ [X] em receitas
- Evitou R$ [Y] em vazamentos
- Economizou [Z] horas de planilha

Nos próximos 3 meses, vamos te mostrar como dobrar esse controle."

OBJETIVO: Mostrar ROI tangível</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_M2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_M3</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D150_Aviso" name="D+150 (30 dias antes): Aviso Perda de Histórico">
      <bpmn2:documentation>⚠️ D+150 - AVISO DE PERDA (30 DIAS ANTES):

PSICOLOGIA: Aversão à Perda. Ninguém quer perder os dados.

MENSAGEM:
"Fala [Nome]. Faltam 30 dias para encerrar seu ciclo de 6 meses.

Você tem um banco de dados valioso da sua empresa aqui.

Pra você não perder esse histórico e ter que voltar pra planilha,
o [Sócio] liberou uma condição de renovação exclusiva."

CTA: "Quero Garantir Minha Renovação"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_M5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_D150</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:exclusiveGateway id="Gateway_Merge_Entrada" name="Merge">
      <bpmn2:incoming>Flow_Edu_Soft_2</bpmn2:incoming>
      <bpmn2:incoming>Flow_Edu_Curso_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Merge_1</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Ativou_D7" name="Fez 1 lançamento?">
      <bpmn2:documentation>CHECKPOINT D+7:
Métrica: Pelo menos 1 lançamento no sistema?
SIM → Continua jornada
NÃO → CS Liga para Ativar</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Timer_D7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Ativou_Nao</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Edu_Ativou_Sim</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Merge_Ativacao" name="Merge">
      <bpmn2:incoming>Flow_Edu_Ativou_Sim</bpmn2:incoming>
      <bpmn2:incoming>Flow_Edu_CS_Ativa</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Merge_Ativa</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Renovou" name="Renovou?">
      <bpmn2:documentation>CHECKPOINT D+180:
Renovou o plano?
SIM → Qual tipo de renovação?
NÃO → Recovery Flow</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_30d</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Renovou_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Edu_Renovou_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Tipo_Renovacao" name="Tipo?">
      <bpmn2:documentation>Tipo de Renovação:
- Anual (ideal)
- Mensal (aceitável)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Renovou_Sim</bpmn2:incoming>
      <bpmn2:incoming>Flow_Edu_Recuperou_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Tipo_Anual</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Edu_Tipo_Mensal</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Recuperou" name="Recuperou?">
      <bpmn2:documentation>RESULTADO RECOVERY:
SIM → Volta para renovação
NÃO → Cliente perdido</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_CS_Recovery</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Recuperou_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Edu_Recuperou_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:intermediateCatchEvent id="IntermediateTimer_D7" name="7 dias">
      <bpmn2:incoming>Flow_Edu_Setup_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Timer_D7</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>P7D</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:intermediateCatchEvent id="IntermediateTimer_M2" name="60 dias">
      <bpmn2:incoming>Flow_Edu_M1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_M2</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>P60D</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:intermediateCatchEvent id="IntermediateTimer_M5" name="90 dias">
      <bpmn2:incoming>Flow_Edu_M3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_M5</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>P90D</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:intermediateCatchEvent id="IntermediateTimer_30d" name="30 dias">
      <bpmn2:incoming>Flow_Edu_D150</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_30d</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>P30D</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:sequenceFlow id="Flow_Edu_Soft_1" sourceRef="Start_Educacao_Software" targetRef="Task_Tag_Software" />
    <bpmn2:sequenceFlow id="Flow_Edu_Soft_2" sourceRef="Task_Tag_Software" targetRef="Gateway_Merge_Entrada" />
    <bpmn2:sequenceFlow id="Flow_Edu_Curso_1" sourceRef="Start_Educacao_Curso" targetRef="Task_Tag_Curso" />
    <bpmn2:sequenceFlow id="Flow_Edu_Curso_2" sourceRef="Task_Tag_Curso" targetRef="Gateway_Merge_Entrada" />
    <bpmn2:sequenceFlow id="Flow_Edu_Merge_1" sourceRef="Gateway_Merge_Entrada" targetRef="Task_Email_BoasVindas" />
    <bpmn2:sequenceFlow id="Flow_Edu_Email_1" sourceRef="Task_Email_BoasVindas" targetRef="Task_Aula_Setup" />
    <bpmn2:sequenceFlow id="Flow_Edu_Setup_1" sourceRef="Task_Aula_Setup" targetRef="IntermediateTimer_D7" />
    <bpmn2:sequenceFlow id="Flow_Edu_Timer_D7" sourceRef="IntermediateTimer_D7" targetRef="Gateway_Ativou_D7" />
    <bpmn2:sequenceFlow id="Flow_Edu_Ativou_Nao" name="NÃO" sourceRef="Gateway_Ativou_D7" targetRef="Task_CS_Liga_Ativacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_Ativou_Sim" name="SIM" sourceRef="Gateway_Ativou_D7" targetRef="Gateway_Merge_Ativacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_CS_Ativa" sourceRef="Task_CS_Liga_Ativacao" targetRef="Gateway_Merge_Ativacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_Merge_Ativa" sourceRef="Gateway_Merge_Ativacao" targetRef="Task_M1_Desafio_DRE" />
    <bpmn2:sequenceFlow id="Flow_Edu_M1" sourceRef="Task_M1_Desafio_DRE" targetRef="IntermediateTimer_M2" />
    <bpmn2:sequenceFlow id="Flow_Edu_M2" sourceRef="IntermediateTimer_M2" targetRef="Task_M3_Checkpoint" />
    <bpmn2:sequenceFlow id="Flow_Edu_M3" sourceRef="Task_M3_Checkpoint" targetRef="IntermediateTimer_M5" />
    <bpmn2:sequenceFlow id="Flow_Edu_M5" sourceRef="IntermediateTimer_M5" targetRef="Task_D150_Aviso" />
    <bpmn2:sequenceFlow id="Flow_Edu_D150" sourceRef="Task_D150_Aviso" targetRef="IntermediateTimer_30d" />
    <bpmn2:sequenceFlow id="Flow_Edu_30d" sourceRef="IntermediateTimer_30d" targetRef="Gateway_Renovou" />
    <bpmn2:sequenceFlow id="Flow_Edu_Renovou_Sim" name="SIM" sourceRef="Gateway_Renovou" targetRef="Gateway_Tipo_Renovacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_Renovou_Nao" name="NÃO" sourceRef="Gateway_Renovou" targetRef="Task_Bloqueio_Leitura" />
    <bpmn2:sequenceFlow id="Flow_Edu_Tipo_Anual" name="Anual" sourceRef="Gateway_Tipo_Renovacao" targetRef="Task_Renovacao_Anual" />
    <bpmn2:sequenceFlow id="Flow_Edu_Tipo_Mensal" name="Mensal" sourceRef="Gateway_Tipo_Renovacao" targetRef="Task_Renovacao_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Edu_Renov_Anual" sourceRef="Task_Renovacao_Anual" targetRef="End_Cliente_Ativo_Educacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_Renov_Mensal" sourceRef="Task_Renovacao_Mensal" targetRef="End_Cliente_Ativo_Educacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_Bloqueio" sourceRef="Task_Bloqueio_Leitura" targetRef="Task_CS_Recuperacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_CS_Recovery" sourceRef="Task_CS_Recuperacao" targetRef="Gateway_Recuperou" />
    <bpmn2:sequenceFlow id="Flow_Edu_Recuperou_Sim" name="SIM" sourceRef="Gateway_Recuperou" targetRef="Gateway_Tipo_Renovacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_Recuperou_Nao" name="NÃO" sourceRef="Gateway_Recuperou" targetRef="End_Cliente_Perdido_Educacao" />

  </bpmn2:process>

  <bpmn2:process id="Process_Indicacao" isExecutable="false">

    <bpmn2:startEvent id="Start_Indicacao_Ativo" name="Parceiro Entrega Contato">
      <bpmn2:documentation>CENÁRIO A (ATIVO): O parceiro entrega o contato do lead.
SLA: &lt; 30 minutos para primeiro contato.
Moeda de troca: Reputação do parceiro.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Ind_Ativo_1</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:startEvent id="Start_Indicacao_Passivo" name="Lead Procura (Indicação)">
      <bpmn2:documentation>CENÁRIO B (PASSIVO): O lead procura você mencionando o parceiro.
Resposta: Tempo real (não usar automação burra).</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Ind_Passivo_1</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:endEvent id="End_Perdido_Motivo_Indicacao" name="Lost (Motivo Registrado)">
      <bpmn2:incoming>Flow_Ind_Motivo</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:endEvent id="End_Bloqueio_Indicacao" name="Bloqueou/Saiu do Grupo">
      <bpmn2:incoming>Flow_Ind_Nurturing</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:serviceTask id="Task_Tag_Ativo" name="Cadastrar + Tag [INDICAÇÃO: PARCEIRO]">
      <bpmn2:documentation>CRM ACTION:
1. Cadastrar lead no sistema
2. Adicionar tag obrigatória: [INDICAÇÃO: NOME_DO_PARCEIRO]
3. Definir prioridade: SLA &lt; 30 min
4. Notificar vendedor responsável</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Ativo_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Ativo_2</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Task_Tag_Passivo" name="Identificar Parceiro + Tag">
      <bpmn2:documentation>CRM ACTION:
1. Perguntar: "Qual nome do parceiro que te indicou?"
2. Cadastrar lead
3. Adicionar tag: [INDICAÇÃO: NOME_DO_PARCEIRO]
4. Resposta em tempo real (WhatsApp/Instagram)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Passivo_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Passivo_2</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Task_D0_Instagram_Indicacao" name="D0 - Instagram (Final do Dia) - Social Selling">
      <bpmn2:documentation>📱 FINAL DO DIA - SOCIAL SELLING:

AÇÃO MANUAL DO VENDEDOR:
1. Seguir a empresa/perfil do lead no Instagram
2. Curtir 2 fotos recentes (não mais que isso)

POR QUÊ?
- Mostra que você é real
- Mostra interesse genuíno
- Cria proximidade social antes da venda

IMPORTANTE: Não mandar DM no Instagram. Isso é só warming.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D0_Zap1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Insta</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Task_Trial7d_Indicacao" name="Liberação Trial 7d VIP">
      <bpmn2:documentation>AÇÃO:
1. Cadastro simplificado
2. Vendedor libera acesso e manda link de login

DIFERENCIAL:
"Tô liberando seu acesso aqui. Já deixei configurado do jeito que o [Parceiro] usa."

MONITORAMENTO: Sistema monitora uso em 48h.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Demo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Trial</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Task_GrupoNurturing_Indicacao" name="Grupo WhatsApp Nurturing">
      <bpmn2:documentation>NURTURING - GRUPO WHATSAPP:
Lead que não converteu é adicionado em grupo de WhatsApp para:
- Receber promoções especiais
- Ver casos de sucesso do parceiro
- Ofertas de reativação

CONSIDERADO PERDIDO: Apenas se bloquear/sair do grupo</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Nurturing</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_D0_WhatsApp1_Indicacao" name="D0 - WhatsApp 1 (Min 15) - Áudio Pessoal">
      <bpmn2:documentation>⏱️ MINUTO 15 (Sem resposta na ligação):

MENSAGEM:
"Fala [Nome], tudo bem? O [Nome do Parceiro] me passou seu contato e disse que você precisava organizar o financeiro aí urgente. Ele me fez prometer que eu ia te dar um atendimento VIP. Pode falar?"

OBJETIVO: Reforçar autoridade emprestada via áudio pessoal.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D0_NaoAtendeu</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Zap1</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D1_WhatsApp2_Indicacao" name="D1 - WhatsApp 2 (Tarde) - Cobrança do Amigo">
      <bpmn2:documentation>📅 DIA 1 - TARDE (Se visualizou e não respondeu):

MENSAGEM:
"Opa [Nome]. O [Parceiro] me mandou msg aqui perguntando se a gente já tinha conseguido se falar. Disse pra ele que você devia estar na correria.

Consegue ouvir um áudio de 30s se eu te mandar? Só pra eu te mostrar o que ele viu aqui que mudou o jogo pra ele."

GATILHO MENTAL: Compromisso social + Prova de que o parceiro está acompanhando.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D0_Merge</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D1_Zap2</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D3_WhatsApp3_Indicacao" name="D3 - WhatsApp 3 (Manhã) - Bastidor do Parceiro">
      <bpmn2:documentation>💼 DIA 3 - MANHÃ (Ainda está morno):

MENSAGEM:
"Lembrei de você. O [Parceiro] adora essa função aqui de DRE no WhatsApp [Mandar Print/Vídeo].

Imagina você tendo essa clareza na sexta-feira à tarde? Tenho um horário livre às 15h, bora?"

GATILHO MENTAL: Espelhamento - "Se funciona pro parceiro, funciona pra mim"
PROVA SOCIAL: Print/vídeo real do parceiro usando.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D1_Zap2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D3_Zap3</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D6_WhatsApp4_Indicacao" name="D6 - WhatsApp 4 (Tarde) - Ultimato VIP">
      <bpmn2:documentation>⚠️ DIA 6 - TARDE (A semana virou e nada):

MENSAGEM:
"Fala [Nome]. Seguinte: como você veio pelo [Parceiro], eu tinha separado a isenção da taxa de adesão + o bônus de implantação pra você.

Mas o sistema vai resetar essa condição amanhã.

Você quer segurar essa vaga ou posso liberar pra outro? Sem pressão, só pra eu não segurar à toa."

GATILHO MENTAL: Escassez de relacionamento + Benefício exclusivo + Elegância no ultimato.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D3_Zap3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D6_Zap4</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D10_WhatsApp5_Indicacao" name="D10 - WhatsApp 5 (Manhã) - Break-up Elegante">
      <bpmn2:documentation>☠️ DIA 10 - MANHÃ (O BREAK-UP ELEGANTE):

MENSAGEM:
"Vou assumir que a rotina te engoliu ou você resolveu continuar como está.

Vou encerrar seu atendimento por aqui para não ficar te incomodando e não chatear o [Parceiro].

Se o caos voltar, meu número é esse. Um abraço e sucesso!"

OBJETIVO: Encerrar o ciclo de venda ativa sem queimar a ponte.
DIFERENCIAL: Menciona o parceiro para não queimar o relacionamento dele também.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D6_Zap4</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D10_Check</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_AvisaParceiro" name="Avisar Parceiro (Validar Ego)">
      <bpmn2:documentation>SCRIPT:
"Grande [Parceiro]! Só pra avisar que o [Lead] já é nosso cliente e tá sendo super bem cuidado. Obrigado pela confiança!

Se tiver mais alguém sofrendo com planilha, manda pra cá."

POR QUE ISSO É VITAL?
- Valida o ego do parceiro
- Estimula novas indicações</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Aviso</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:userTask id="Task_QuebraGelo_Ativo" name="WhatsApp Áudio - Script Ativo">
      <bpmn2:documentation>SCRIPT CENÁRIO A (Você chama):

"Fala [Nome do Lead], tudo bem? Aqui é o [Seu Nome] da Fyness.

O [Nome do Parceiro] me passou seu contato agora há pouco e me disse que você é um cara 100%, mas que a gestão financeira aí tá tirando seu sono, igual tirava o dele.

Ele me fez prometer que eu ia te dar uma atenção VIP aqui. Pode falar 2 minutinhos?"

OBJETIVO: Transferir confiança do parceiro para você.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Ativo_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Ativo_3</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_QuebraGelo_Passivo" name="WhatsApp Áudio - Script Passivo">
      <bpmn2:documentation>SCRIPT CENÁRIO B (Ele chama):

"Opa [Nome], que honra! O [Nome do Parceiro] é um grande parceiro nosso.

Se você é amigo dele, já é de casa. Me conta, ele te mostrou como a gente organizou o caixa dele?"

OBJETIVO: Validar a relação e mostrar resultado do parceiro.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Passivo_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Passivo_3</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_D0_Ligacao_Indicacao" name="D0 - Ligação (Min 0) - A Carteirada">
      <bpmn2:documentation>📞 AUTORIDADE EMPRESTADA - MINUTO 0:

SCRIPT SE ATENDER:
"Fala [Nome]! Aqui é o [Vendedor]. O [Parceiro] me falou muito bem da sua empresa e disse que você precisava organizar o financeiro. Tá na frente do computador?"

OBJETIVO: Transferir a autoridade do parceiro imediatamente.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Merged</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Lig</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_D0_Qualifica_Indicacao" name="D0 - Qualifica (Autoridade Parceiro)">
      <bpmn2:documentation>✅ ATENDEU - CARTEIRADA:

SCRIPT:
"O [Parceiro] me fez prometer que eu ia te dar um atendimento VIP aqui. Ele me disse que o financeiro aí tá tirando seu sono, igual tirava o dele antes.

Você tá usando planilha hoje ou caderno?"

OBJETIVO: Qualificar usando a confiança do parceiro como moeda.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D0_Atendeu</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Check</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_SelecaoMotivo_Indicacao" name="CRM: Selecionar Motivo da Perda">
      <bpmn2:documentation>📊 MARCAR COMO PERDIDO (LOST):
Vendedor deve selecionar o motivo real da perda:

MOTIVOS OBRIGATÓRIOS:
□ Sem Contato (Ghosting) - Nunca respondeu
□ Preço - Achou caro
□ Concorrência - Fechou com outro
□ Desqualificado - Não é decisor / Curioso
□ Timing - "Não é o momento"
□ Outro - Especificar

CRM ACTION: Marcar lead como LOST com motivo + TAG [INDICAÇÃO: NOME_DO_PARCEIRO].

IMPORTANTE: Avisar o parceiro que o lead não converteu (para não cobrar comissão inexistente).</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Respondeu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Motivo</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_FlashDemo_Indicacao" name="Flash Demo Contextualizada">
      <bpmn2:documentation>AÇÃO: Gravar tela do celular ou mandar áudio simulando a dor específica que o parceiro comentou.

SCRIPT VISUAL:
"Olha [Nome], o [Parceiro] gosta disso aqui ó: ele manda o áudio 'Gastei 100 reais no almoço' e a IA já lança. É essa agilidade que você busca?"

NÃO mostre demo genérica. Mostre o que o PARCEIRO gosta.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D0_Converteu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Demo</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_PressaoSocial" name="Ligação - Pressão Social">
      <bpmn2:documentation>SCRIPT (Ligação ou Áudio):

"Fala [Lead]! O sistema me avisou aqui que você ainda não lançou nada.

Cara, não deixa o [Parceiro] ficar na sua frente na organização! Rs.

Tem alguma dúvida ou foi só a correria? Vamos lançar o primeiro juntos agora?"

GATILHO MENTAL: Compromisso social com o parceiro.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_NaoUsou</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Pressao</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_D1_Lembrete" name="D+1 - Lembrete (Compromisso)">
      <bpmn2:documentation>SCRIPT:
"E aí [Lead], conseguiu ver o vídeo que te mandei? O [Parceiro] me perguntou hoje se a gente já tinha se falado."

GATILHO MENTAL: Compromisso.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Pressao</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Usou</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D1</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_D3_ProvaSocial" name="D+3 - Prova Social">
      <bpmn2:documentation>SCRIPT:
"Olha esse resultado aqui de uma empresa do mesmo ramo que o seu. Imagina você tendo esse controle..."

Anexar print ou vídeo de caso de sucesso similar.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D3</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_D5_Ultimato" name="D+5 - Ultimato Elegante">
      <bpmn2:documentation>SCRIPT:
"Vou imaginar que a semana tá caótica aí. Vou segurar sua condição especial de indicação até amanhã, beleza? Depois volta pro preço normal."

ESCASSEZ + ELEGÂNCIA.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_D3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D5</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_Atendeu_D0_Indicacao" name="Atendeu?">
      <bpmn2:incoming>Flow_Ind_D0_Lig</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Atendeu</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_D0_NaoAtendeu</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Converteu_D0_Indicacao" name="Fechou na hora?">
      <bpmn2:incoming>Flow_Ind_D0_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Converteu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_D0_Converteu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Merge_D0_Indicacao" name="Merge D0">
      <bpmn2:incoming>Flow_Ind_D0_Insta</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_D0_Merge</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Converteu_Indicacao" name="Converteu?">
      <bpmn2:incoming>Flow_Ind_D10_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Converteu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Converteu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Respondeu_Breakup_Indicacao" name="Respondeu?">
      <bpmn2:incoming>Flow_Ind_Check_Breakup</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Respondeu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Respondeu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_MergeIndicacao" name="Merge">
      <bpmn2:incoming>Flow_Ind_Ativo_3</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Passivo_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Merged</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_UsouEm48h" name="Usou o sistema?">
      <bpmn2:incoming>Flow_Ind_Timer_Check</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_NaoUsou</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Usou</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Converteu_Indicacao" name="Converteu?">
      <bpmn2:incoming>Flow_Ind_D5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Ind_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:intermediateCatchEvent id="IntermediateTimer_24h_Breakup_Indicacao" name="24h">
      <bpmn2:documentation>⏰ TIMER PÓS-BREAKUP:
Aguarda 24h para ver se o lead responde ao ultimato elegante.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Converteu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Check_Breakup</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:intermediateCatchEvent id="IntermediateTimer_48h" name="48h">
      <bpmn2:documentation>O GUARDIÃO DE 48H:
Sistema detecta se houve 0 lançamentos em 48h.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ind_Trial</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ind_Timer_Check</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT48H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Indicacao" name="→ Checkout">
      <bpmn2:incoming>Flow_Ind_D0_Converteu_Sim</bpmn2:incoming>
      <bpmn2:incoming>Flow_Ind_Converteu_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:sequenceFlow id="Flow_Ind_Ativo_1" sourceRef="Start_Indicacao_Ativo" targetRef="Task_Tag_Ativo" />
    <bpmn2:sequenceFlow id="Flow_Ind_Ativo_2" sourceRef="Task_Tag_Ativo" targetRef="Task_QuebraGelo_Ativo" />
    <bpmn2:sequenceFlow id="Flow_Ind_Ativo_3" sourceRef="Task_QuebraGelo_Ativo" targetRef="Gateway_MergeIndicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Passivo_1" sourceRef="Start_Indicacao_Passivo" targetRef="Task_Tag_Passivo" />
    <bpmn2:sequenceFlow id="Flow_Ind_Passivo_2" sourceRef="Task_Tag_Passivo" targetRef="Task_QuebraGelo_Passivo" />
    <bpmn2:sequenceFlow id="Flow_Ind_Passivo_3" sourceRef="Task_QuebraGelo_Passivo" targetRef="Gateway_MergeIndicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Merged" sourceRef="Gateway_MergeIndicacao" targetRef="Task_D0_Ligacao_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Demo" sourceRef="Task_FlashDemo_Indicacao" targetRef="Task_Trial7d_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Trial" sourceRef="Task_Trial7d_Indicacao" targetRef="IntermediateTimer_48h" />
    <bpmn2:sequenceFlow id="Flow_Ind_Timer_Check" sourceRef="IntermediateTimer_48h" targetRef="Gateway_UsouEm48h" />
    <bpmn2:sequenceFlow id="Flow_Ind_NaoUsou" name="Não" sourceRef="Gateway_UsouEm48h" targetRef="Task_PressaoSocial" />
    <bpmn2:sequenceFlow id="Flow_Ind_Usou" name="Sim" sourceRef="Gateway_UsouEm48h" targetRef="Task_D1_Lembrete" />
    <bpmn2:sequenceFlow id="Flow_Ind_Pressao" sourceRef="Task_PressaoSocial" targetRef="Task_D1_Lembrete" />
    <bpmn2:sequenceFlow id="Flow_Ind_D1" sourceRef="Task_D1_Lembrete" targetRef="Task_D3_ProvaSocial" />
    <bpmn2:sequenceFlow id="Flow_Ind_D3" sourceRef="Task_D3_ProvaSocial" targetRef="Task_D5_Ultimato" />
    <bpmn2:sequenceFlow id="Flow_Ind_D5" sourceRef="Task_D5_Ultimato" targetRef="Gateway_Converteu_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Sim" name="Sim" sourceRef="Gateway_Converteu_Indicacao" targetRef="Task_AvisaParceiro" />
    <bpmn2:sequenceFlow id="Flow_Ind_Aviso" sourceRef="Task_AvisaParceiro" targetRef="LinkThrow_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Nao" name="Não" sourceRef="Gateway_Converteu_Indicacao" targetRef="Task_GrupoNurturing_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Nurturing" sourceRef="Task_GrupoNurturing_Indicacao" targetRef="End_Bloqueio_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Lig" sourceRef="Task_D0_Ligacao_Indicacao" targetRef="Gateway_Atendeu_D0_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Atendeu" name="Sim" sourceRef="Gateway_Atendeu_D0_Indicacao" targetRef="Task_D0_Qualifica_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_NaoAtendeu" name="Não" sourceRef="Gateway_Atendeu_D0_Indicacao" targetRef="Task_D0_WhatsApp1_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Check" sourceRef="Task_D0_Qualifica_Indicacao" targetRef="Gateway_Converteu_D0_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Converteu_Sim" name="Sim" sourceRef="Gateway_Converteu_D0_Indicacao" targetRef="LinkThrow_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Converteu_Nao" name="Não" sourceRef="Gateway_Converteu_D0_Indicacao" targetRef="Task_FlashDemo_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Zap1" sourceRef="Task_D0_WhatsApp1_Indicacao" targetRef="Task_D0_Instagram_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Insta" sourceRef="Task_D0_Instagram_Indicacao" targetRef="Gateway_Merge_D0_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D0_Merge" sourceRef="Gateway_Merge_D0_Indicacao" targetRef="Task_D1_WhatsApp2_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D1_Zap2" sourceRef="Task_D1_WhatsApp2_Indicacao" targetRef="Task_D3_WhatsApp3_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D3_Zap3" sourceRef="Task_D3_WhatsApp3_Indicacao" targetRef="Task_D6_WhatsApp4_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D6_Zap4" sourceRef="Task_D6_WhatsApp4_Indicacao" targetRef="Task_D10_WhatsApp5_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_D10_Check" sourceRef="Task_D10_WhatsApp5_Indicacao" targetRef="Gateway_Converteu_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Converteu_Sim" name="Sim" sourceRef="Gateway_Converteu_Indicacao" targetRef="LinkThrow_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Converteu_Nao" name="Não" sourceRef="Gateway_Converteu_Indicacao" targetRef="IntermediateTimer_24h_Breakup_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Check_Breakup" sourceRef="IntermediateTimer_24h_Breakup_Indicacao" targetRef="Gateway_Respondeu_Breakup_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Respondeu_Nao" name="Não" sourceRef="Gateway_Respondeu_Breakup_Indicacao" targetRef="Task_SelecaoMotivo_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Motivo" sourceRef="Task_SelecaoMotivo_Indicacao" targetRef="End_Perdido_Motivo_Indicacao" />
    <bpmn2:sequenceFlow id="Flow_Ind_Respondeu_Sim" name="Sim" sourceRef="Gateway_Respondeu_Breakup_Indicacao" targetRef="Task_GrupoNurturing_Indicacao" />

  </bpmn2:process>

  <bpmn2:process id="Process_Conteudo" isExecutable="false">

    <bpmn2:startEvent id="Start_Conteudo_Pessoal" name="Instagram Pessoal">
      <bpmn2:documentation>ENTRADA: Lead comenta/interage no story de um SÓCIO/PARCEIRO.

CONTEXTO: É um seguidor do perfil pessoal que confia no indivíduo, não na marca.

GATILHO MENTAL: Autoridade emprestada do líder.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Cont_Pessoal_1</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:startEvent id="Start_Conteudo_Empresa" name="Instagram SaaS">
      <bpmn2:documentation>ENTRADA: Lead comenta/envia direct no perfil OFICIAL da Fyness.

CONTEXTO: É um seguidor frio que busca PRODUTO, não pessoa.

GATILHO MENTAL: Solução de problema (dor funcional).</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Cont_Empresa_1</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:endEvent id="End_Bloqueio_Conteudo" name="Bloqueou/Saiu do Grupo">
      <bpmn2:incoming>Flow_Cont_Nurturing</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:endEvent id="End_Perdido_Conteudo" name="Lost (Motivo Registrado)">
      <bpmn2:incoming>Flow_Cont_Motivo</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:serviceTask id="Task_ManyChat_Pessoal" name="ManyChat: Responde Comentário + Pede Zap">
      <bpmn2:documentation>AUTOMAÇÃO MANYCHAT:
1. Detecta comentário no story do sócio
2. Responde automaticamente via Direct:
   "Opa! Vi que você curtiu o story. Vou te chamar no Zap, beleza?"
3. Captura número de telefone
4. Tag no CRM: [CONTEÚDO: PESSOAL]

IMPORTANTE: Sócio não faz venda. Transfere para SDR/Closer.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Pessoal_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Pessoal_2</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Task_GrupoNurturing_Conteudo" name="Grupo WhatsApp Nurturing">
      <bpmn2:documentation>NURTURING - GRUPO WHATSAPP:
Lead que respondeu mas não converteu é adicionado em grupo de WhatsApp para:
- Receber promoções especiais
- Ver cases de sucesso de seguidores que viraram clientes
- Ofertas de reativação (Black Friday, Ano Novo, etc.)

CONSIDERADO PERDIDO: Apenas se bloquear/sair do grupo.

CRM ACTION: Tag [NURTURING: CONTEÚDO]</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Respondeu_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Nurturing</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:userTask id="Task_WhatsApp_Pessoal" name="D0 - WhatsApp - Autoridade Emprestada do Sócio">
      <bpmn2:documentation>SCRIPT - AUTORIDADE EMPRESTADA:
"Fala [Nome]! Aqui é o [Vendedor] da equipe do [Nome do Sócio].

Ele viu que você interagiu no Story dele sobre [Assunto X] e me pediu pra te dar uma atenção VIP aqui.

Você quer organizar o financeiro igual ele faz ou só estava curioso?"

GATILHO: Ele é FÃ. Quer o MÉTODO e o SUCESSO do sócio.

PRÓXIMO PASSO:
- Se engajou → Flash Demo
- Se ghostou → Cadência D1-D3-D7</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Pessoal_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Pessoal_3</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_FlashDemo_Pessoal" name="D0 - Flash Demo - Bastidor (Espelho)">
      <bpmn2:documentation>ABORDAGEM: ESPELHO DO SÓCIO.

SCRIPT VISUAL (Vídeo/Áudio):
"Olha [Nome], o [Sócio] usa assim: ele grava um áudio 'Gastei 300 reais no almoço da equipe' e a IA já lança automático. É essa agilidade que você busca?"

GATILHO: Lead quer ser igual ao ídolo.

IMPORTANTE: Não mostra todos os recursos. Mostra apenas o QUE O SÓCIO USA.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Pessoal_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Pessoal_Merge</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_SDR_Empresa" name="SDR: Qualifica Manual no Direct">
      <bpmn2:documentation>QUALIFICAÇÃO MANUAL:
SDR responde manualmente no Direct para QUALIFICAR antes de passar pro Zap.

SCRIPT:
"Oi [Nome], vi sua mensagem! Só pra eu te ajudar melhor: você é o dono do negócio ou cuida da parte financeira?"

OBJETIVO:
- Desqualificar curiosos
- Identificar decisor
- Capturar número de WhatsApp

Tag no CRM: [CONTEÚDO: EMPRESA]</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Empresa_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Empresa_2</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_WhatsApp_Empresa" name="D0 - WhatsApp - Abordagem Consultiva">
      <bpmn2:documentation>SCRIPT - ABORDAGEM CONSULTIVA:
"Oi [Nome], recebi seu contato pelo Instagram da Fyness.

Vi que você perguntou sobre o preço. Antes de te passar, deixa eu te perguntar: hoje você usa planilha ou caderno?"

GATILHO: Ele é COMPRADOR FRIO. Quer a FERRAMENTA.

OBJETIVO: Descobrir a dor para contextualizar demo.

PRÓXIMO PASSO: Flash Demo focada na DOR.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Empresa_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Empresa_3</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_FlashDemo_Empresa" name="D0 - Flash Demo - Função (Dor)">
      <bpmn2:documentation>ABORDAGEM: SOLUÇÃO DE DOR.

SCRIPT VISUAL (Vídeo/Áudio):
"Você falou que usa planilha, né? Então olha esse recurso: você manda um áudio 'Vendi 500 reais' e o sistema já lança. Sem digitar nada."

GATILHO: Lead quer RESOLVER o problema, não copiar ninguém.

IMPORTANTE: Mostra apenas a função que RESOLVE A DOR dele. Nada mais.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Empresa_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Empresa_Merge</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_D1_Repost_Conteudo" name="D1 - Repost do Story do Sócio">
      <bpmn2:documentation>ESTRATÉGIA: Prova social + FOMO.

SCRIPT:
"[Nome], acabei de ver o [Sócio] postando mais um story usando o sistema. Você viu? Ele falou que não consegue mais viver sem rs.

Quer que eu te mostre de novo como funciona?"

GATILHO MENTAL:
- Prova social (sócio usa diariamente)
- FOMO (você tá ficando pra trás)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Imediato_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_D1</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_D3_Prova_Conteudo" name="D3 - Print: Seguidor que Virou Cliente">
      <bpmn2:documentation>ESTRATÉGIA: Prova social irrefutável.

SCRIPT:
"Olha esse print que recebi ontem: é um seguidor do [Sócio] igual você que tava na dúvida. Olha o que ele mandou depois de 2 dias usando:

[PRINT DE DEPOIMENTO REAL]

Quer testar também ou prefere continuar na planilha?"

GATILHO MENTAL: Ele vai se arrepender se não testar.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_D1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_D3</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_D7_Fechamento_Conteudo" name="D7 - Fechamento com Bônus">
      <bpmn2:documentation>ESTRATÉGIA: Ultimato elegante + Bônus.

SCRIPT:
"Fala [Nome]! Vou imaginar que a semana tá caótica aí.

Consegui segurar um bônus VIP pra você até amanhã:
- Onboarding prioritário comigo
- Configuração inicial inclusa

Depois disso volta pro atendimento normal. Bora garantir?"

GATILHO MENTAL:
- Escassez (prazo até amanhã)
- Exclusividade (bônus VIP)
- Elegância (não culpa o lead)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_D3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_D7</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_SelecaoMotivo_Conteudo" name="CRM: Selecionar Motivo da Perda">
      <bpmn2:documentation>📊 MARCAR COMO PERDIDO (LOST):
Vendedor deve selecionar o motivo real da perda:

MOTIVOS OBRIGATÓRIOS:
□ Sem Contato (Ghosting) - Nunca respondeu após D7
□ Preço - Achou caro
□ Concorrência - Fechou com outro
□ Desqualificado - Não é decisor / Curioso
□ Timing - "Não é o momento"
□ Outro - Especificar

CRM ACTION: Marcar lead como LOST com motivo + TAG:
- [CONTEÚDO: PESSOAL] ou [CONTEÚDO: EMPRESA]
- Canal de origem (Instagram do Sócio X ou Instagram Fyness)

IMPORTANTE: Dados vão para análise de performance de conteúdo.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Respondeu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Motivo</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_Merge_Conteudo" name="Merge dos Caminhos">
      <bpmn2:incoming>Flow_Cont_Pessoal_Merge</bpmn2:incoming>
      <bpmn2:incoming>Flow_Cont_Empresa_Merge</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Merged</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Converteu_Imediato_Conteudo" name="Fechou na hora?">
      <bpmn2:documentation>DECISÃO: Lead converteu imediatamente após Flash Demo?

SIM → Checkout
NÃO → Cadência de follow-up (D1, D3, D7)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Merged</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Imediato_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Cont_Imediato_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Converteu_Conteudo" name="Converteu?">
      <bpmn2:documentation>DECISÃO: Lead converteu após cadência D1-D3-D7?

SIM → Checkout
NÃO → Break-up (24h para responder)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_D7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Converteu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Cont_Converteu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Respondeu_Conteudo" name="Respondeu?">
      <bpmn2:documentation>DECISÃO: Lead respondeu após as 24h?

SIM → Grupo Nurturing (mantém aquecido)
NÃO → Selecionar Motivo da Perda (LOST)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Timer</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Respondeu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Cont_Respondeu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:intermediateCatchEvent id="IntermediateTimer_24h_Conteudo" name="24h">
      <bpmn2:documentation>⏰ TIMER PÓS-BREAKUP:
Aguarda 24h para ver se o lead responde ao ultimato elegante do D7.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Cont_Converteu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Cont_Timer</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Conteudo" name="→ Checkout">
      <bpmn2:incoming>Flow_Cont_Imediato_Sim</bpmn2:incoming>
      <bpmn2:incoming>Flow_Cont_Converteu_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:sequenceFlow id="Flow_Cont_Pessoal_1" sourceRef="Start_Conteudo_Pessoal" targetRef="Task_ManyChat_Pessoal" />
    <bpmn2:sequenceFlow id="Flow_Cont_Pessoal_2" sourceRef="Task_ManyChat_Pessoal" targetRef="Task_WhatsApp_Pessoal" />
    <bpmn2:sequenceFlow id="Flow_Cont_Pessoal_3" sourceRef="Task_WhatsApp_Pessoal" targetRef="Task_FlashDemo_Pessoal" />
    <bpmn2:sequenceFlow id="Flow_Cont_Pessoal_Merge" sourceRef="Task_FlashDemo_Pessoal" targetRef="Gateway_Merge_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Empresa_1" sourceRef="Start_Conteudo_Empresa" targetRef="Task_SDR_Empresa" />
    <bpmn2:sequenceFlow id="Flow_Cont_Empresa_2" sourceRef="Task_SDR_Empresa" targetRef="Task_WhatsApp_Empresa" />
    <bpmn2:sequenceFlow id="Flow_Cont_Empresa_3" sourceRef="Task_WhatsApp_Empresa" targetRef="Task_FlashDemo_Empresa" />
    <bpmn2:sequenceFlow id="Flow_Cont_Empresa_Merge" sourceRef="Task_FlashDemo_Empresa" targetRef="Gateway_Merge_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Merged" sourceRef="Gateway_Merge_Conteudo" targetRef="Gateway_Converteu_Imediato_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Imediato_Sim" name="Sim" sourceRef="Gateway_Converteu_Imediato_Conteudo" targetRef="LinkThrow_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Imediato_Nao" name="Não" sourceRef="Gateway_Converteu_Imediato_Conteudo" targetRef="Task_D1_Repost_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_D1" sourceRef="Task_D1_Repost_Conteudo" targetRef="Task_D3_Prova_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_D3" sourceRef="Task_D3_Prova_Conteudo" targetRef="Task_D7_Fechamento_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_D7" sourceRef="Task_D7_Fechamento_Conteudo" targetRef="Gateway_Converteu_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Converteu_Sim" name="Sim" sourceRef="Gateway_Converteu_Conteudo" targetRef="LinkThrow_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Converteu_Nao" name="Não" sourceRef="Gateway_Converteu_Conteudo" targetRef="IntermediateTimer_24h_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Timer" sourceRef="IntermediateTimer_24h_Conteudo" targetRef="Gateway_Respondeu_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Respondeu_Sim" name="Sim" sourceRef="Gateway_Respondeu_Conteudo" targetRef="Task_GrupoNurturing_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Nurturing" sourceRef="Task_GrupoNurturing_Conteudo" targetRef="End_Bloqueio_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Respondeu_Nao" name="Não" sourceRef="Gateway_Respondeu_Conteudo" targetRef="Task_SelecaoMotivo_Conteudo" />
    <bpmn2:sequenceFlow id="Flow_Cont_Motivo" sourceRef="Task_SelecaoMotivo_Conteudo" targetRef="End_Perdido_Conteudo" />

  </bpmn2:process>

  <bpmn2:process id="Process_Prospeccao" isExecutable="false">

    <bpmn2:startEvent id="Start_Prospeccao" name="Prospecção">
      <bpmn2:outgoing>Flow_Prosp_1</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_Prosp_Placeholder" name="[EXPANDIR] Redes Sociais">
      <bpmn2:incoming>Flow_Prosp_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Prosp_2</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Prospeccao" name="→ Checkout">
      <bpmn2:incoming>Flow_Prosp_2</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:sequenceFlow id="Flow_Prosp_1" sourceRef="Start_Prospeccao" targetRef="Task_Prosp_Placeholder" />
    <bpmn2:sequenceFlow id="Flow_Prosp_2" sourceRef="Task_Prosp_Placeholder" targetRef="LinkThrow_Prospeccao" />

  </bpmn2:process>

  <bpmn2:process id="Process_Google" isExecutable="false">

    <bpmn2:startEvent id="Start_Google" name="Landing Page (Google Ads)">
      <bpmn2:documentation>Lead pesquisou "Gestão Financeira PME" e clicou no anúncio.
Alta intenção de compra.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Goo_Start</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:endEvent id="End_Bloqueio_Google" name="Descadastrou/Bloqueou">
      <bpmn2:incoming>Flow_Goo_Nurturing</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:endEvent id="End_Perdido_Motivo_Google" name="Lost (Motivo Registrado)">
      <bpmn2:incoming>Flow_Goo_Motivo</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:endEvent id="End_Pago_Google" name="✓ Pagou (Ativo)">
      <bpmn2:incoming>Flow_Goo_Mandou</bpmn2:incoming>
      <bpmn2:incoming>Flow_Goo_Alerta</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:serviceTask id="Task_AutomacaoBoasVindas" name="Automação D0 - Boas-vindas">
      <bpmn2:documentation>AUTOMAÇÃO IMEDIATA (D0):
1. Criação da conta no sistema
2. Envio de WhatsApp automático

MENSAGEM:
"Parabéns [Nome]! 🚀 Sua IA tá pronta.

Salva meu número e manda o primeiro áudio: 'Gastei 50 reais de almoço'."

OBJETIVO: Primeira vitória rápida.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Sucesso</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_BoasVindas</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Task_RecuperacaoCarrinho" name="Recuperação (10 min)">
      <bpmn2:documentation>AUTOMAÇÃO (10 MIN DEPOIS):
Disparo de recuperação se cartão recusou ou fechou a aba.

MENSAGEM:
"Oi [Nome], vi que deu erro no pagamento do Anual.

O banco às vezes barra o limite. Tenta esse link do Semestral que costuma passar direto: [Link]"

DOWNSELL: Anual → Semestral → Trimestral</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Falha</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Recuperacao</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:subProcess id="SubProcess_Trial_Google" name="Trial 7 Dias - Cadência de Ativação">
      <bpmn2:documentation>SUB-PROCESSO TRIAL 7 DIAS:
Cadência de nurturing ativa durante o período trial.
Objetivo: garantir o "aha moment" nos primeiros 2-3 dias
e maximizar conversão ao fim dos 7 dias.

CADÊNCIA INTERNA:
D0: Boas-vindas + Guia Rápido (primeiro valor em 5 min)
D1: Check de uso + Dica feature-chave (ativar aha moment)
D2: Case de sucesso de cliente similar (prova social)
D3: Check 48h de uso profundo (ponto de decisão)
D5: "Faltam 2 dias" + suporte (urgência)
D6: Oferta de conversão (incentivo final)
D7: Expiração → merge com fechamento principal</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Trial_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Trial_End</bpmn2:outgoing>

      <bpmn2:startEvent id="Start_Trial" name="Trial Ativado">
        <bpmn2:outgoing>Flow_Trial_D0</bpmn2:outgoing>
      </bpmn2:startEvent>

      <bpmn2:serviceTask id="Task_Trial_D0_BoasVindas" name="D0 - Boas-vindas + Guia Rápido">
        <bpmn2:documentation>ONBOARDING IMEDIATO:
- E-mail/WhatsApp de boas-vindas com vídeo de 2 min
- Guia rápido: "3 passos para seu primeiro lançamento"
- CTA: "Faça seu primeiro lançamento agora"

OBJETIVO: Primeiro valor em menos de 5 minutos.</bpmn2:documentation>
        <bpmn2:incoming>Flow_Trial_D0</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D0_D1</bpmn2:outgoing>
      </bpmn2:serviceTask>

      <bpmn2:intermediateCatchEvent id="Timer_Trial_24h" name="24h">
        <bpmn2:incoming>Flow_Trial_D0_D1</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D1_Check</bpmn2:outgoing>
        <bpmn2:timerEventDefinition>
          <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
        </bpmn2:timerEventDefinition>
      </bpmn2:intermediateCatchEvent>

      <bpmn2:exclusiveGateway id="Gateway_Trial_D1_Uso" name="Usou D0?">
        <bpmn2:incoming>Flow_Trial_D1_Check</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D1_Sim</bpmn2:outgoing>
        <bpmn2:outgoing>Flow_Trial_D1_Nao</bpmn2:outgoing>
      </bpmn2:exclusiveGateway>

      <bpmn2:sendTask id="Task_Trial_D1_Dica" name="D1 - Dica Feature-Chave">
        <bpmn2:documentation>SE USOU:
"Vi que você já fez seu primeiro lançamento! 🎉
Agora experimenta [feature-chave] — é onde a mágica acontece."

SE NÃO USOU:
"Ainda não testou? Normal, a rotina engole. Olha só como é rápido: [vídeo 60s]
Leva 2 minutos pra sentir a diferença."</bpmn2:documentation>
        <bpmn2:incoming>Flow_Trial_D1_Sim</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D1_Merge</bpmn2:outgoing>
      </bpmn2:sendTask>

      <bpmn2:sendTask id="Task_Trial_D1_Reengajamento" name="D1 - Reengajamento (Não Usou)">
        <bpmn2:documentation>REENGAJAMENTO SUAVE:
"Ainda não testou? Normal, a rotina engole.
Olha só como é rápido: [vídeo 60s]
Leva 2 minutos pra sentir a diferença."

INCLUI: Link direto para primeiro lançamento.</bpmn2:documentation>
        <bpmn2:incoming>Flow_Trial_D1_Nao</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D1_Merge2</bpmn2:outgoing>
      </bpmn2:sendTask>

      <bpmn2:exclusiveGateway id="Gateway_Trial_D1_Merge" name="Merge D1">
        <bpmn2:incoming>Flow_Trial_D1_Merge</bpmn2:incoming>
        <bpmn2:incoming>Flow_Trial_D1_Merge2</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D1_D2</bpmn2:outgoing>
      </bpmn2:exclusiveGateway>

      <bpmn2:intermediateCatchEvent id="Timer_Trial_D2" name="24h">
        <bpmn2:incoming>Flow_Trial_D1_D2</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D2_Start</bpmn2:outgoing>
        <bpmn2:timerEventDefinition>
          <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
        </bpmn2:timerEventDefinition>
      </bpmn2:intermediateCatchEvent>

      <bpmn2:sendTask id="Task_Trial_D2_Case" name="D2 - Case de Sucesso">
        <bpmn2:documentation>PROVA SOCIAL:
"O [Cliente X] do mesmo ramo que você economizou 4h/semana
no primeiro mês. Olha o depoimento dele: [link/print]

Você tá no caminho certo. Qualquer dúvida, me chama!"</bpmn2:documentation>
        <bpmn2:incoming>Flow_Trial_D2_Start</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D2_D3</bpmn2:outgoing>
      </bpmn2:sendTask>

      <bpmn2:intermediateCatchEvent id="Timer_Trial_D3" name="24h">
        <bpmn2:incoming>Flow_Trial_D2_D3</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D3_Check</bpmn2:outgoing>
        <bpmn2:timerEventDefinition>
          <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
        </bpmn2:timerEventDefinition>
      </bpmn2:intermediateCatchEvent>

      <bpmn2:exclusiveGateway id="Gateway_Trial_D3_Uso" name="Usou em 48h?">
        <bpmn2:incoming>Flow_Trial_D3_Check</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D3_Sim</bpmn2:outgoing>
        <bpmn2:outgoing>Flow_Trial_D3_Nao</bpmn2:outgoing>
      </bpmn2:exclusiveGateway>

      <bpmn2:sendTask id="Task_Trial_D3_Parabens" name="D3 - Parabéns + Próximo Nível">
        <bpmn2:documentation>REFORÇO POSITIVO (SE USOU):
"Show! Vi que você já tá usando [feature X]. 💪
Agora experimenta [feature Y] — os clientes que usam convertem 2x mais."</bpmn2:documentation>
        <bpmn2:incoming>Flow_Trial_D3_Sim</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D3_Merge1</bpmn2:outgoing>
      </bpmn2:sendTask>

      <bpmn2:userTask id="Task_Trial_D3_Resgate" name="D3 - Ligação de Resgate">
        <bpmn2:documentation>AÇÃO HUMANA (SE NÃO USOU EM 48H):
"Você buscou no Google porque tinha um problema urgente.
O problema sumiu ou a rotina te engoliu?
Vamos lançar o primeiro gasto agora na linha?"

OBJETIVO: Resgatar antes de perder. Se não ativar até D3,
a chance de conversão cai drasticamente.</bpmn2:documentation>
        <bpmn2:incoming>Flow_Trial_D3_Nao</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D3_Merge2</bpmn2:outgoing>
      </bpmn2:userTask>

      <bpmn2:exclusiveGateway id="Gateway_Trial_D3_Merge" name="Merge D3">
        <bpmn2:incoming>Flow_Trial_D3_Merge1</bpmn2:incoming>
        <bpmn2:incoming>Flow_Trial_D3_Merge2</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D3_D5</bpmn2:outgoing>
      </bpmn2:exclusiveGateway>

      <bpmn2:intermediateCatchEvent id="Timer_Trial_D5" name="48h">
        <bpmn2:incoming>Flow_Trial_D3_D5</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D5_Start</bpmn2:outgoing>
        <bpmn2:timerEventDefinition>
          <bpmn2:timeDuration>PT48H</bpmn2:timeDuration>
        </bpmn2:timerEventDefinition>
      </bpmn2:intermediateCatchEvent>

      <bpmn2:sendTask id="Task_Trial_D5_Urgencia" name="D5 - Faltam 2 Dias + Suporte">
        <bpmn2:documentation>URGÊNCIA + SUPORTE:
"Seu trial expira em 2 dias! ⏰
Quer que eu te ajude a configurar algo específico antes?
Agenda 15 min comigo e resolvo qualquer dúvida: [link agenda]"

OBJETIVO: Criar senso de urgência + oferecer ajuda genuína.</bpmn2:documentation>
        <bpmn2:incoming>Flow_Trial_D5_Start</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D5_D6</bpmn2:outgoing>
      </bpmn2:sendTask>

      <bpmn2:intermediateCatchEvent id="Timer_Trial_D6" name="24h">
        <bpmn2:incoming>Flow_Trial_D5_D6</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D6_Start</bpmn2:outgoing>
        <bpmn2:timerEventDefinition>
          <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
        </bpmn2:timerEventDefinition>
      </bpmn2:intermediateCatchEvent>

      <bpmn2:sendTask id="Task_Trial_D6_Oferta" name="D6 - Oferta de Conversão">
        <bpmn2:documentation>INCENTIVO FINAL:
"Amanhã seu trial acaba. Pra quem converte ANTES de expirar,
tenho uma condição especial:
🎁 20% OFF no primeiro trimestre + Onboarding VIP grátis.

Esse desconto some amanhã às 23:59. Bora?"

INCLUI: Link direto para checkout com cupom aplicado.</bpmn2:documentation>
        <bpmn2:incoming>Flow_Trial_D6_Start</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D6_D7</bpmn2:outgoing>
      </bpmn2:sendTask>

      <bpmn2:intermediateCatchEvent id="Timer_Trial_D7" name="24h">
        <bpmn2:incoming>Flow_Trial_D6_D7</bpmn2:incoming>
        <bpmn2:outgoing>Flow_Trial_D7_End</bpmn2:outgoing>
        <bpmn2:timerEventDefinition>
          <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
        </bpmn2:timerEventDefinition>
      </bpmn2:intermediateCatchEvent>

      <bpmn2:endEvent id="End_Trial" name="Trial Expirado">
        <bpmn2:incoming>Flow_Trial_D7_End</bpmn2:incoming>
      </bpmn2:endEvent>

      <bpmn2:sequenceFlow id="Flow_Trial_D0" sourceRef="Start_Trial" targetRef="Task_Trial_D0_BoasVindas" />
      <bpmn2:sequenceFlow id="Flow_Trial_D0_D1" sourceRef="Task_Trial_D0_BoasVindas" targetRef="Timer_Trial_24h" />
      <bpmn2:sequenceFlow id="Flow_Trial_D1_Check" sourceRef="Timer_Trial_24h" targetRef="Gateway_Trial_D1_Uso" />
      <bpmn2:sequenceFlow id="Flow_Trial_D1_Sim" name="Sim" sourceRef="Gateway_Trial_D1_Uso" targetRef="Task_Trial_D1_Dica" />
      <bpmn2:sequenceFlow id="Flow_Trial_D1_Nao" name="Não" sourceRef="Gateway_Trial_D1_Uso" targetRef="Task_Trial_D1_Reengajamento" />
      <bpmn2:sequenceFlow id="Flow_Trial_D1_Merge" sourceRef="Task_Trial_D1_Dica" targetRef="Gateway_Trial_D1_Merge" />
      <bpmn2:sequenceFlow id="Flow_Trial_D1_Merge2" sourceRef="Task_Trial_D1_Reengajamento" targetRef="Gateway_Trial_D1_Merge" />
      <bpmn2:sequenceFlow id="Flow_Trial_D1_D2" sourceRef="Gateway_Trial_D1_Merge" targetRef="Timer_Trial_D2" />
      <bpmn2:sequenceFlow id="Flow_Trial_D2_Start" sourceRef="Timer_Trial_D2" targetRef="Task_Trial_D2_Case" />
      <bpmn2:sequenceFlow id="Flow_Trial_D2_D3" sourceRef="Task_Trial_D2_Case" targetRef="Timer_Trial_D3" />
      <bpmn2:sequenceFlow id="Flow_Trial_D3_Check" sourceRef="Timer_Trial_D3" targetRef="Gateway_Trial_D3_Uso" />
      <bpmn2:sequenceFlow id="Flow_Trial_D3_Sim" name="Sim" sourceRef="Gateway_Trial_D3_Uso" targetRef="Task_Trial_D3_Parabens" />
      <bpmn2:sequenceFlow id="Flow_Trial_D3_Nao" name="Não" sourceRef="Gateway_Trial_D3_Uso" targetRef="Task_Trial_D3_Resgate" />
      <bpmn2:sequenceFlow id="Flow_Trial_D3_Merge1" sourceRef="Task_Trial_D3_Parabens" targetRef="Gateway_Trial_D3_Merge" />
      <bpmn2:sequenceFlow id="Flow_Trial_D3_Merge2" sourceRef="Task_Trial_D3_Resgate" targetRef="Gateway_Trial_D3_Merge" />
      <bpmn2:sequenceFlow id="Flow_Trial_D3_D5" sourceRef="Gateway_Trial_D3_Merge" targetRef="Timer_Trial_D5" />
      <bpmn2:sequenceFlow id="Flow_Trial_D5_Start" sourceRef="Timer_Trial_D5" targetRef="Task_Trial_D5_Urgencia" />
      <bpmn2:sequenceFlow id="Flow_Trial_D5_D6" sourceRef="Task_Trial_D5_Urgencia" targetRef="Timer_Trial_D6" />
      <bpmn2:sequenceFlow id="Flow_Trial_D6_Start" sourceRef="Timer_Trial_D6" targetRef="Task_Trial_D6_Oferta" />
      <bpmn2:sequenceFlow id="Flow_Trial_D6_D7" sourceRef="Task_Trial_D6_Oferta" targetRef="Timer_Trial_D7" />
      <bpmn2:sequenceFlow id="Flow_Trial_D7_End" sourceRef="Timer_Trial_D7" targetRef="End_Trial" />
    </bpmn2:subProcess>

    <bpmn2:serviceTask id="Task_GrupoNurturing_Google" name="Grupo Promoções + Remarketing">
      <bpmn2:documentation>NURTURING - LISTA PROMOÇÕES:
Lead Google que não converteu vai para lista de:
- Remarketing via Google Ads
- E-mails com promoções especiais
- WhatsApp com ofertas relâmpago

CONSIDERADO PERDIDO: Apenas se descadastrar/bloquear</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Respondeu_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Nurturing</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_D0_WhatsApp1_Prova_Google" name="D0 - WhatsApp 1 (Min 5) - A Prova">
      <bpmn2:documentation>⏱️ MINUTO 5 (Sem resposta na ligação):

MENSAGEM:
"Oi [Nome], tentei te ligar. Vi que buscou sobre gestão. Dá uma olhada em como a gente resolve isso em 3 segundos com IA: [Áudio Flash Demo + Print]"

OBJETIVO: Mostrar a prova real sem precisar de ligação.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D0_NaoAtendeu</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D0_Zap1</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D0_WhatsApp2_Ajuda_Google" name="D0 - WhatsApp 2 (Tarde) - A Ajuda">
      <bpmn2:documentation>🌅 TARDE (Sem resposta):

MENSAGEM:
"Conseguiu ver o vídeo? Se quiser, te libero um acesso de 7 dias pra você testar na prática. Me avisa."

OBJETIVO: Oferecer o trial sem pressão.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D0_Zap1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D0_Zap2</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D1_WhatsApp3_Diferenca_Google" name="D1 - WhatsApp 3 (Manhã) - A Diferença">
      <bpmn2:documentation>📊 DIA 1 - MANHÃ:
Ele provavelmente está cotando Conta Azul ou Omie.

MENSAGEM:
"E aí [Nome]. Uma dúvida rápida: você prefere ficar preenchendo formulário chato (igual nos outros sistemas) ou prefere mandar áudio no Zap? Só pra eu saber o que te mostrar."

OBJETIVO: Matar a concorrência mostrando a diferença.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D0_Merge</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D1_Zap3</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D3_WhatsApp4_Case_Google" name="D3 - WhatsApp 4 - A Cobrança Social">
      <bpmn2:documentation>💼 DIA 3 - COBRANÇA SOCIAL (Se ele sumiu/Ghosting):

MENSAGEM:
"Lembrei de você. Esse cliente aqui é do seu ramo [Mandar Print de Relatório/Depoimento]. Ele organizou o caixa em 2 dias. Falta o que pra gente fazer o mesmo aí?"

CRM: Mover para etapa "Tentativa de Contato 3".

OBJETIVO: Soft touch mostrando prova social do nicho dele.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D1_Lig2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D3_Zap4</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D5_WhatsApp5_Pressao_Google" name="D5 - WhatsApp 5 - A Pressão">
      <bpmn2:documentation>⚠️ DIA 5 - PRESSÃO DO BENEFÍCIO:
Lead está morno. Hora de provocar.

MENSAGEM:
"[Nome], o sistema segura seu pré-cadastro com a condição de isenção de taxa de adesão até amanhã. Depois volta pro preço cheio. Consegue falar hoje à tarde?"

GATILHO MENTAL: Escassez + Benefício.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D3_Zap4</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D5_Zap5</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D7_WhatsApp6_Breakup_Google" name="D7 - WhatsApp 6 - Break-up (Ultimato)">
      <bpmn2:documentation>☠️ DIA 7 - O ULTIMATO (BREAK-UP):
Tudo ou nada. Técnica de "retirar a oferta".

MENSAGEM:
"Fala [Nome]. Como não tivemos retorno, vou assumir que organizar o financeiro não é prioridade agora ou você decidiu continuar com as planilhas.

Vou encerrar seu processo por aqui para não te incomodar mais.

Se no futuro o caos voltar, meu contato é esse. Abraço!"

OBJETIVO: Provocar reação ou confirmar desinteresse.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Converteu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Breakup</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:userTask id="Task_ClickCheckout_Self" name="Clica 'Testar Agora/Assinar'">
      <bpmn2:documentation>PERFIL APRESSADO:
Já comparou, gostou da promessa, quer resolver agora (mesmo que seja 3 da manhã).

CTA na LP: "Testar Agora" ou "Assinar Anual"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Self</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Self_1</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_PreencheDados_Self" name="Preenche Dados + Cartão">
      <bpmn2:documentation>FORMULÁRIO DE CHECKOUT:
- Nome completo
- E-mail
- Telefone (WhatsApp)
- CPF/CNPJ
- Dados do cartão

MONITORAMENTO: Tempo no formulário (abandono > 2 min)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Self_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Self_2</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_AlertaHumano_Google" name="Alerta Humano - Ligar AGORA">
      <bpmn2:documentation>ALERTA PARA VENDEDOR:
"Cliente [Nome] pagou e não usou. Ligar agora."

SCRIPT LIGAÇÃO:
"[Nome], vi que você assinou mas ainda não mandou o primeiro áudio.

Tá com dúvida de como funciona? Vamos fazer juntos agora na linha?"

OBJETIVO: Ativação forçada antes de pedir chargeback.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_NaoMandou</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Alerta</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_ClickWhatsApp" name="Clica WhatsApp">
      <bpmn2:documentation>PERFIL DESCONFIADO:
Gostou mas tem dúvida se funciona pro nicho dele ou quer negociar.

CTA na LP: "Falar com Especialista"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Zap</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Zap_1</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_SpeedToLead_Google" name="Speed to Lead &lt; 5 min">
      <bpmn2:documentation>REGRA DE OURO: Vendedor responde em &lt; 5 minutos.

SCRIPT ABERTURA:
"Opa, tudo bem? Vi que veio do Google. Você tá usando planilha hoje ou o caderno?"

OBJETIVO: Qualificar rapidamente a dor.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Zap_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Zap_2</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_FlashDemo_Google" name="Flash Demo (Áudio + Print)">
      <bpmn2:documentation>A PROVA REAL:
Para matar objeção "será que funciona?", vendedor faz a mágica.

AÇÃO:
Manda áudio simulando gasto do nicho dele + Print do relatório pronto.

SCRIPT:
"Olha a mágica: eu mandei esse áudio de 3s e o sistema já gerou o DRE. É essa liberdade que você quer?"

GATILHO MENTAL: Prova social + Facilidade.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Zap_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Zap_3</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_OfertaTrial_Google" name="Oferta Trial 7d">
      <bpmn2:documentation>O GANCHO:

SCRIPT:
"Vou liberar 7 dias grátis pra você brincar. Se a IA não te economizar 2 horas na semana, você nem precisa assinar."

OBJEÇÃO ELIMINADA: "E se não der certo?" → Risco zero.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Zap_3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_ToGatewayTrial</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_AceitouTrial_Google" name="Aceitou Trial?">
      <bpmn2:incoming>Flow_Goo_ToGatewayTrial</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Trial_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Trial_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:userTask id="Task_D7_Fechamento_Google" name="D7 - Fechamento (Escada Downsell)">
      <bpmn2:documentation>O FECHAMENTO BINÁRIO (D7 - FINAL DO TRIAL):

ESCADA DE DOWNSELL:

Tentativa 1: Plano Anual (R$ 1.497)
- Foco: Maior desconto + Caixa antecipado
- Script: "Você testou, viu que funciona. Vou te dar 40% de desconto no anual."

Tentativa 2 (Se recusar/falhar): Plano Semestral (R$ 997)
- Argumento: "O limite do cartão não passou? Faz o semestral que alivia a parcela."

Tentativa 3 (Misericórdia): Plano Trimestral (R$ 561)
- Argumento: "Faz o seguinte: não casa comigo. Namora por 3 meses. É um teste pago pra você organizar a casa."

OBJETIVO: Não perder o cliente. Se ele não pode pagar o ideal, ele paga o possível.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D5_Lig3</bpmn2:incoming>
      <bpmn2:incoming>Flow_Goo_Trial_End</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D7</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_D0_Ligacao1_Google" name="D0 - Ligação Imediata (Min 1)">
      <bpmn2:documentation>📞 SPEED TO LEAD - MINUTO 1:
Lead acabou de se cadastrar ou chamar.

AÇÃO: Ligar IMEDIATAMENTE.

SCRIPT:
"[Nome], aqui é o [Vendedor] da Fyness. Vi que você acabou de preencher o cadastro. Tá na frente do computador agora?"

OBJETIVO: Qualificar a dor e agendar demo se atender.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Recuperacao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D0_Lig1</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_D0_Qualifica_Google" name="D0 - Qualifica e Agenda Demo">
      <bpmn2:documentation>✅ ATENDEU:

QUALIFICAÇÃO:
"Você tá usando planilha hoje ou o caderno?"
"Quanto tempo você perde por semana organizando isso?"

PITCH:
"Vou te mostrar como a gente resolve isso em 3 segundos com IA. Pode ver a tela agora?"

AÇÃO: Agenda demo ou faz demo ao vivo.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D0_Atendeu</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D0_Qualificou</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_D1_Ligacao2_Google" name="D1 - Ligação 2 (Tarde)">
      <bpmn2:documentation>📞 DIA 1 - TARDE:

SCRIPT:
"Tô com a sua ficha de pré-cadastro aqui. Só falta um 'ok' pra eu liberar seu teste. Tá na correria?"

OBJETIVO: Mostrar que ele está sendo acompanhado pessoalmente.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D1_Zap3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D1_Lig2</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_D5_Ligacao3_Google" name="D5 - Ligação 3 (Última Tentativa)">
      <bpmn2:documentation>📞 DIA 5 - ÚLTIMA TENTATIVA DE VOZ:

SCRIPT:
"[Nome], vi que você ainda não definiu. Tá com alguma dúvida ou quer que eu te mostre algo específico do seu ramo?"

OBJETIVO: Última chance de falar antes do ultimato D7.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_D5_Zap5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D5_Lig3</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_SelecaoMotivo_Google" name="CRM: Selecionar Motivo da Perda">
      <bpmn2:documentation>📊 MARCAR COMO PERDIDO (LOST):
Vendedor deve selecionar o motivo real da perda:

MOTIVOS OBRIGATÓRIOS:
□ Sem Contato (Ghosting) - Nunca respondeu
□ Preço - Achou caro e não aceitou Downsell
□ Concorrência - Fechou com outro
□ Desqualificado - Não é dono de empresa / Curioso
□ Timing - "Não é o momento" (válido)
□ Outro - Especificar

CRM ACTION: Marcar lead como LOST com motivo selecionado.

MÉTRICA CRÍTICA: Taxa de conversão por motivo de perda.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Respondeu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Motivo</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_CaminhoGoogle" name="Qual botão clicou?">
      <bpmn2:incoming>Flow_Goo_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Self</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Zap</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Pagamento_Self" name="Pagamento?">
      <bpmn2:incoming>Flow_Goo_Self_2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Sucesso</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Falha</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_PrimeiroAudio" name="Mandou áudio?">
      <bpmn2:incoming>Flow_Goo_Check24h</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_NaoMandou</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Mandou</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Converteu_Google" name="Converteu?">
      <bpmn2:incoming>Flow_Goo_D7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Converteu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Converteu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Atendeu_D0_Google" name="Atendeu?">
      <bpmn2:incoming>Flow_Goo_D0_Lig1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D0_Atendeu</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_D0_NaoAtendeu</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Merge_D0_Google" name="Merge D0">
      <bpmn2:incoming>Flow_Goo_D0_Qualificou</bpmn2:incoming>
      <bpmn2:incoming>Flow_Goo_D0_Zap2</bpmn2:incoming>
      <bpmn2:incoming>Flow_Goo_Trial_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_D0_Merge</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Respondeu_Breakup_Google" name="Respondeu?">
      <bpmn2:incoming>Flow_Goo_Check_Breakup</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Respondeu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Goo_Respondeu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:intermediateCatchEvent id="IntermediateTimer_24h_Google" name="24h">
      <bpmn2:documentation>O GUARDIÃO DE ATIVAÇÃO:
Monitora se cliente pagou mas NÃO usou em 24h.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_BoasVindas</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Check24h</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:intermediateCatchEvent id="IntermediateTimer_24h_Breakup_Google" name="24h">
      <bpmn2:documentation>⏰ TIMER PÓS-BREAKUP:
Aguarda 24h para ver se o lead responde ao ultimato.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Goo_Breakup</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Goo_Check_Breakup</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Google" name="→ Checkout">
      <bpmn2:incoming>Flow_Goo_Converteu_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:sequenceFlow id="Flow_Goo_Start" sourceRef="Start_Google" targetRef="Gateway_CaminhoGoogle" />
    <bpmn2:sequenceFlow id="Flow_Goo_Self" name="Checkout Direto" sourceRef="Gateway_CaminhoGoogle" targetRef="Task_ClickCheckout_Self" />
    <bpmn2:sequenceFlow id="Flow_Goo_Self_1" sourceRef="Task_ClickCheckout_Self" targetRef="Task_PreencheDados_Self" />
    <bpmn2:sequenceFlow id="Flow_Goo_Self_2" sourceRef="Task_PreencheDados_Self" targetRef="Gateway_Pagamento_Self" />
    <bpmn2:sequenceFlow id="Flow_Goo_Sucesso" name="Sucesso" sourceRef="Gateway_Pagamento_Self" targetRef="Task_AutomacaoBoasVindas" />
    <bpmn2:sequenceFlow id="Flow_Goo_Falha" name="Falha/Abandono" sourceRef="Gateway_Pagamento_Self" targetRef="Task_RecuperacaoCarrinho" />
    <bpmn2:sequenceFlow id="Flow_Goo_BoasVindas" sourceRef="Task_AutomacaoBoasVindas" targetRef="IntermediateTimer_24h_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Recuperacao" sourceRef="Task_RecuperacaoCarrinho" targetRef="Task_D0_Ligacao1_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Check24h" sourceRef="IntermediateTimer_24h_Google" targetRef="Gateway_PrimeiroAudio" />
    <bpmn2:sequenceFlow id="Flow_Goo_NaoMandou" name="Não" sourceRef="Gateway_PrimeiroAudio" targetRef="Task_AlertaHumano_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Mandou" name="Sim" sourceRef="Gateway_PrimeiroAudio" targetRef="End_Pago_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Alerta" sourceRef="Task_AlertaHumano_Google" targetRef="End_Pago_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Zap" name="WhatsApp" sourceRef="Gateway_CaminhoGoogle" targetRef="Task_ClickWhatsApp" />
    <bpmn2:sequenceFlow id="Flow_Goo_Zap_1" sourceRef="Task_ClickWhatsApp" targetRef="Task_SpeedToLead_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Zap_2" sourceRef="Task_SpeedToLead_Google" targetRef="Task_FlashDemo_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Zap_3" sourceRef="Task_FlashDemo_Google" targetRef="Task_OfertaTrial_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_ToGatewayTrial" sourceRef="Task_OfertaTrial_Google" targetRef="Gateway_AceitouTrial_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Trial_Sim" name="Sim (Aceitou)" sourceRef="Gateway_AceitouTrial_Google" targetRef="SubProcess_Trial_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Trial_Nao" name="Não (Recusou)" sourceRef="Gateway_AceitouTrial_Google" targetRef="Gateway_Merge_D0_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Trial_End" sourceRef="SubProcess_Trial_Google" targetRef="Task_D7_Fechamento_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D7" sourceRef="Task_D7_Fechamento_Google" targetRef="Gateway_Converteu_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Converteu_Sim" name="Sim" sourceRef="Gateway_Converteu_Google" targetRef="LinkThrow_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Converteu_Nao" name="Não" sourceRef="Gateway_Converteu_Google" targetRef="Task_D7_WhatsApp6_Breakup_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Nurturing" sourceRef="Task_GrupoNurturing_Google" targetRef="End_Bloqueio_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D0_Lig1" sourceRef="Task_D0_Ligacao1_Google" targetRef="Gateway_Atendeu_D0_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D0_Atendeu" name="Sim" sourceRef="Gateway_Atendeu_D0_Google" targetRef="Task_D0_Qualifica_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D0_NaoAtendeu" name="Não" sourceRef="Gateway_Atendeu_D0_Google" targetRef="Task_D0_WhatsApp1_Prova_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D0_Qualificou" sourceRef="Task_D0_Qualifica_Google" targetRef="Gateway_Merge_D0_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D0_Zap1" sourceRef="Task_D0_WhatsApp1_Prova_Google" targetRef="Task_D0_WhatsApp2_Ajuda_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D0_Zap2" sourceRef="Task_D0_WhatsApp2_Ajuda_Google" targetRef="Gateway_Merge_D0_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D0_Merge" sourceRef="Gateway_Merge_D0_Google" targetRef="Task_D1_WhatsApp3_Diferenca_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D1_Zap3" sourceRef="Task_D1_WhatsApp3_Diferenca_Google" targetRef="Task_D1_Ligacao2_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D1_Lig2" sourceRef="Task_D1_Ligacao2_Google" targetRef="Task_D3_WhatsApp4_Case_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D3_Zap4" sourceRef="Task_D3_WhatsApp4_Case_Google" targetRef="Task_D5_WhatsApp5_Pressao_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D5_Zap5" sourceRef="Task_D5_WhatsApp5_Pressao_Google" targetRef="Task_D5_Ligacao3_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_D5_Lig3" sourceRef="Task_D5_Ligacao3_Google" targetRef="Task_D7_Fechamento_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Breakup" sourceRef="Task_D7_WhatsApp6_Breakup_Google" targetRef="IntermediateTimer_24h_Breakup_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Check_Breakup" sourceRef="IntermediateTimer_24h_Breakup_Google" targetRef="Gateway_Respondeu_Breakup_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Respondeu_Nao" name="Não" sourceRef="Gateway_Respondeu_Breakup_Google" targetRef="Task_SelecaoMotivo_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Motivo" sourceRef="Task_SelecaoMotivo_Google" targetRef="End_Perdido_Motivo_Google" />
    <bpmn2:sequenceFlow id="Flow_Goo_Respondeu_Sim" name="Sim" sourceRef="Gateway_Respondeu_Breakup_Google" targetRef="Task_GrupoNurturing_Google" />

  </bpmn2:process>

  <bpmn2:process id="Process_Meta" isExecutable="false">

    <bpmn2:startEvent id="Start_Meta" name="Meta Ads">
      <bpmn2:outgoing>Flow_Meta_Start</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:endEvent id="End_Perdido_Meta" name="Lost (Motivo Registrado)">
      <bpmn2:incoming>Flow_Meta_Motivo</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:endEvent id="End_Bloqueio_Meta" name="Descadastrou/Bloqueou">
      <bpmn2:incoming>Flow_Meta_Nurturing</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:serviceTask id="Task_GrupoNurturing_Meta" name="Grupo de Nurturing">
      <bpmn2:documentation>📢 NURTURING - LISTA DE AQUECIMENTO:

Lead Meta que não converteu mas respondeu vai para:
- Lista de e-mail marketing
- Grupo de promoções no WhatsApp
- Campanhas de remarketing Meta Ads

CONSIDERADO PERDIDO: Apenas se bloquear ou descadastrar.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Respondeu_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Nurturing</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:sendTask id="Task_WhatsApp_D0_Meta" name="D0 - WhatsApp (Min 0-5) - Abordagem Ativa">
      <bpmn2:documentation>⚡ SPEED TO LEAD - META ADS (0-5 MINUTOS):

MENSAGEM INICIAL:
"Oi [Nome]! Vi que você acabou de preencher o formulário sobre gestão financeira.

Trabalha com [Segmento] mesmo? 🤔"

OBJETIVO: Quebra de gelo e confirmação de interesse real.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Filtro</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D0_Zap</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_FlashDemo_D0_Meta" name="D0 - Flash Demo - Áudio + Print">
      <bpmn2:documentation>🎬 FLASH DEMO - PROVA IMEDIATA:

MENSAGEM (após resposta ou 15min):
"Olha só que demais. Você manda um áudio falando o que precisa lançar e a IA já organiza tudo.

[Áudio Flash Demo 20s]
[Print de resultado]

Testou algo parecido antes ou é a primeira vez vendo isso?"

OBJETIVO: Mostrar o produto funcionando antes de qualquer pitch.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_D0_Zap</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_FlashDemo</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D1_WhatsApp_Meta" name="D1 - WhatsApp (Manhã) - A Curiosidade">
      <bpmn2:documentation>🧠 DIA 1 - A CURIOSIDADE:

Lead Meta é frio. Precisa de nutrição antes de venda.

MENSAGEM:
"Bom dia [Nome]!

Você usa planilha, caderno ou já tem algum sistema hoje pra controlar o caixa?"

OBJETIVO: Entender a dor atual e gerar engajamento através da pergunta.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Fechou_Nao</bpmn2:incoming>
      <bpmn2:incoming>Flow_Meta_Interessado_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D1</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D3_WhatsApp_Meta" name="D3 - WhatsApp (Tarde) - A Prova Social">
      <bpmn2:documentation>👥 DIA 3 - PROVA SOCIAL:

MENSAGEM:
"[Nome], lembrei de você hoje.

Esse cliente aqui é do ramo de [Segmento] também. Olha o antes e depois dele em 7 dias:

[Print de Depoimento/Resultado]

Muita gente do seu ramo tá usando. Você já organizou aí ou continua no improviso?"

OBJETIVO: Mostrar que o nicho dele já usa e tem resultados.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_D1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D3</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D6_WhatsApp_Meta" name="D6 - WhatsApp (Manhã) - Conteúdo Educativo">
      <bpmn2:documentation>📚 DIA 6 - EDUCAÇÃO (Soft Touch):

Lead ainda não comprou. Hora de educar sem vender.

MENSAGEM:
"Bom dia [Nome]!

Fiz esse vídeo rápido mostrando os 3 erros que TODO dono de [Segmento] comete no controle financeiro (e como evitar):

[Link para Vídeo Curto 2-3min]

Vale a pena assistir. Abraço!"

OBJETIVO: Gerar valor sem pedir nada em troca. Construir autoridade.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_D3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D6</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D9_WhatsApp_Meta" name="D9 - WhatsApp (Tarde) - Oferta Irresistível">
      <bpmn2:documentation>💰 DIA 9 - A OFERTA IRRESISTÍVEL:

Hora de fazer a oferta com escassez.

MENSAGEM:
"E aí [Nome], vou te fazer uma proposta:

Tô com 5 vagas essa semana pra liberar teste de 7 dias GRÁTIS + Onboarding personalizado (valor R$ 497) sem custo.

Mas só até sexta.

Se organizar o financeiro é prioridade, me confirma que eu separo uma vaga pra você. Se não for, sem problema, a gente se fala mais pra frente.

Bora?"

OBJETIVO: Criar senso de urgência e oportunidade limitada.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_D6</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D9</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:sendTask id="Task_D14_WhatsApp_Meta" name="D14 - WhatsApp - Break-up Elegante">
      <bpmn2:documentation>👋 DIA 14 - BREAK-UP ELEGANTE:

Técnica de "take away" sem queimar a ponte.

MENSAGEM:
"Fala [Nome]!

Como não tivemos retorno, vou assumir que organizar o financeiro não é prioridade agora ou você já resolveu de outra forma.

Vou parar de te cutucar por aqui pra não incomodar 😅

Mas fica o meu contato. Se um dia o caos voltar (e ele sempre volta haha), é só chamar.

Sucesso aí! 🚀"

OBJETIVO: Dar a última chance de resposta ou encerrar educadamente.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_D9</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_D14</bpmn2:outgoing>
    </bpmn2:sendTask>

    <bpmn2:userTask id="Task_PaginaFiltro_Meta" name="Página de Filtro + Formulário">
      <bpmn2:documentation>🎯 PÁGINA DE FILTRO META ADS:

Lead vem de anúncio de descoberta (topo de funil).

LANDING PAGE:
- Título: "Transforme áudios em organização financeira"
- Filtro de qualificação: "Você é dono/gestor?"
- Formulário: Nome, WhatsApp, Segmento

OBJETIVO: Capturar contato qualificado antes da abordagem.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Filtro</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_SelecaoMotivo_Meta" name="CRM: Selecionar Motivo da Perda">
      <bpmn2:documentation>📊 MARCAR COMO PERDIDO (LOST):

MOTIVOS OBRIGATÓRIOS:
□ Sem Contato (Ghosting) - Nunca respondeu
□ Preço - Achou caro
□ Não é Público-Alvo - Curioso/Estudante
□ Concorrência - Fechou com outro
□ Timing - "Não é o momento"
□ Outro - Especificar

CRM ACTION: Marcar lead como LOST com motivo.

MÉTRICA: Taxa de conversão Meta Ads por motivo de perda.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Respondeu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Motivo</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_Interessado_D0_Meta" name="Interessado?">
      <bpmn2:incoming>Flow_Meta_FlashDemo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Interessado_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Meta_Interessado_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Converteu_Imediato_Meta" name="Fechou na hora?">
      <bpmn2:incoming>Flow_Meta_Interessado_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Fechou_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Meta_Fechou_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Converteu_Meta" name="Converteu?">
      <bpmn2:incoming>Flow_Meta_D14</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Converteu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Meta_Converteu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Respondeu_Meta" name="Respondeu?">
      <bpmn2:incoming>Flow_Meta_Timer24h</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Respondeu_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Meta_Respondeu_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:intermediateCatchEvent id="IntermediateTimer_24h_Meta" name="24h">
      <bpmn2:documentation>⏰ TIMER PÓS-BREAKUP:
Aguarda 24h para ver se o lead responde ao ultimato.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Converteu_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Timer24h</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT24H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Meta" name="→ Checkout">
      <bpmn2:incoming>Flow_Meta_Fechou_Sim</bpmn2:incoming>
      <bpmn2:incoming>Flow_Meta_Converteu_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Checkout" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:sequenceFlow id="Flow_Meta_Start" sourceRef="Start_Meta" targetRef="Task_PaginaFiltro_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Filtro" sourceRef="Task_PaginaFiltro_Meta" targetRef="Task_WhatsApp_D0_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_D0_Zap" sourceRef="Task_WhatsApp_D0_Meta" targetRef="Task_FlashDemo_D0_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_FlashDemo" sourceRef="Task_FlashDemo_D0_Meta" targetRef="Gateway_Interessado_D0_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Interessado_Sim" name="Sim" sourceRef="Gateway_Interessado_D0_Meta" targetRef="Gateway_Converteu_Imediato_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Interessado_Nao" name="Não" sourceRef="Gateway_Interessado_D0_Meta" targetRef="Task_D1_WhatsApp_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Fechou_Sim" name="Sim" sourceRef="Gateway_Converteu_Imediato_Meta" targetRef="LinkThrow_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Fechou_Nao" name="Não" sourceRef="Gateway_Converteu_Imediato_Meta" targetRef="Task_D1_WhatsApp_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_D1" sourceRef="Task_D1_WhatsApp_Meta" targetRef="Task_D3_WhatsApp_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_D3" sourceRef="Task_D3_WhatsApp_Meta" targetRef="Task_D6_WhatsApp_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_D6" sourceRef="Task_D6_WhatsApp_Meta" targetRef="Task_D9_WhatsApp_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_D9" sourceRef="Task_D9_WhatsApp_Meta" targetRef="Task_D14_WhatsApp_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_D14" sourceRef="Task_D14_WhatsApp_Meta" targetRef="Gateway_Converteu_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Converteu_Sim" name="Sim" sourceRef="Gateway_Converteu_Meta" targetRef="LinkThrow_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Converteu_Nao" name="Não" sourceRef="Gateway_Converteu_Meta" targetRef="IntermediateTimer_24h_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Timer24h" sourceRef="IntermediateTimer_24h_Meta" targetRef="Gateway_Respondeu_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Respondeu_Sim" name="Sim" sourceRef="Gateway_Respondeu_Meta" targetRef="Task_GrupoNurturing_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Respondeu_Nao" name="Não" sourceRef="Gateway_Respondeu_Meta" targetRef="Task_SelecaoMotivo_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Nurturing" sourceRef="Task_GrupoNurturing_Meta" targetRef="End_Bloqueio_Meta" />
    <bpmn2:sequenceFlow id="Flow_Meta_Motivo" sourceRef="Task_SelecaoMotivo_Meta" targetRef="End_Perdido_Meta" />

  </bpmn2:process>

  <bpmn2:process id="Process_Nucleo" isExecutable="false">

    <bpmn2:endEvent id="End_Cliente_Ativo" name="✅ Cliente Ativo">
      <bpmn2:documentation>CLIENTE CONVERTIDO E ATIVO
Acesso liberado
Receita capturada
Onboarding em andamento</bpmn2:documentation>
      <bpmn2:incoming>Flow_Para_Cliente_Ativo</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:endEvent id="End_Pagamento_Falhou" name="❌ Pagamento Falhou">
      <bpmn2:documentation>LEAD PERDIDO POR PAGAMENTO
Tentativas esgotadas:
- Anual: Recusado
- Semestral: Recusado
- Trimestral: Recusado

Próximas ações:
- Adicionar ao grupo de nurturing
- Remarketing futuro
- Possível follow-up em 30 dias</bpmn2:documentation>
      <bpmn2:incoming>Flow_Trimestral_Recusado</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:task id="Task_Checkout_Anual" name="Checkout: Plano Anual (R$ 1.497)">
      <bpmn2:documentation>DEGRAU 1: OFERTA PRINCIPAL
Valor: R$ 1.497/ano (R$ 124,75/mês)
Estratégia: Máximo cashflow antecipado
Parcelamento: Até 12x no cartão (juros por conta do cliente)
Link: hotmart.com/fyness-anual
Gateway: Hotmart + Asaas (fallback)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Para_Anual</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Anual_Para_Gateway</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Split_Parceiro" name="Split: 30% Comissão Parceiro">
      <bpmn2:documentation>SPLIT AUTOMÁTICO (SE TAG: INDICACAO)
Gateway: Asaas Split Payments
Parceiro recebe: 30% do valor (R$ 449,10 no Anual)
Timing: D+30 (após garantia)
Nota: Apenas para leads vindos de Lane_Indicacao</bpmn2:documentation>
      <bpmn2:incoming>Flow_Anual_Aprovado</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Split_Para_Onboarding</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Onboarding_Pago" name="Onboarding: Acesso Imediato">
      <bpmn2:documentation>ONBOARDING CLIENTE PAGANTE:
1. E-mail de boas-vindas com credenciais
2. Acesso liberado ao sistema Fyness
3. WhatsApp de boas-vindas + link de suporte
4. Adiciona ao grupo VIP de clientes
5. Envia tutorial de primeiros passos
Timing: Imediato (webhook pós-pagamento)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Split_Para_Onboarding</bpmn2:incoming>
      <bpmn2:incoming>Flow_Semestral_Aprovado</bpmn2:incoming>
      <bpmn2:incoming>Flow_Trimestral_Aprovado</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Para_Cliente_Ativo</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Webhook_Falha" name="Webhook: Detecta Falha no Pagamento">
      <bpmn2:documentation>DETECÇÃO AUTOMÁTICA DE RECUSA
Sistema: Webhook do gateway de pagamento
Trigger: Cartão recusado por:
- Limite insuficiente
- Segurança do banco
- Dados incorretos
Ação: Dispara sequência de downsell automático</bpmn2:documentation>
      <bpmn2:incoming>Flow_Anual_Recusado</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Falha_Para_WhatsApp</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_WhatsApp_5min" name="WhatsApp Automático: Link Semestral (5min)">
      <bpmn2:documentation>DOWNSELL AUTOMÁTICO (5 MINUTOS APÓS FALHA)
Via: WhatsApp (ManyChat ou Evolution API)
Script:
"Oi [Nome], vi aqui que o banco barrou a transação do plano Anual por segurança ou limite.

Isso é super comum com valores maiores!

Tenta esse link do Semestral que costuma passar direto (valor menor, mesmo benefício):
[Link Semestral]

Qualquer coisa me chama! 💚"

Link: hotmart.com/fyness-semestral</bpmn2:documentation>
      <bpmn2:incoming>Flow_Falha_Para_WhatsApp</bpmn2:incoming>
      <bpmn2:outgoing>Flow_WhatsApp_Para_Semestral</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Checkout_Semestral" name="Checkout: Plano Semestral (R$ 997)">
      <bpmn2:documentation>DEGRAU 2: DOWNSELL AUTOMÁTICO
Valor: R$ 997/semestre (R$ 166,17/mês)
Estratégia: Ticket menor, mais fácil de passar no cartão
Parcelamento: Até 12x no cartão
Link: hotmart.com/fyness-semestral
Nota: NÃO fica exposto no site principal</bpmn2:documentation>
      <bpmn2:incoming>Flow_WhatsApp_Para_Semestral</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Semestral_Para_Gateway</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Vendedor_Trimestral" name="Vendedor: Oferta Manual Trimestral">
      <bpmn2:documentation>DEGRAU 3: CARTA NA MANGA DO VENDEDOR
Timing: D+2 após falha do Semestral
Responsável: SDR/Closer
Canal: WhatsApp ou ligação
Argumento:
"[Nome], entendo que o timing não está ideal agora.

Não casa comigo. Que tal namorar por 3 meses?

É um teste pago de R$ 561 pra você organizar a casa e decidir se vale continuar.

Se em 90 dias não mudou nada, cancela. Sem problema.

Bora testar?"

Link: hotmart.com/fyness-trimestral (NÃO EXPOSTO NO SITE)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Timer_Para_Vendedor</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Vendedor_Para_Trimestral</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Checkout_Trimestral" name="Checkout: Plano Trimestral (R$ 561)">
      <bpmn2:documentation>DEGRAU 3: LAST RESORT (NÃO PÚBLICO)
Valor: R$ 561/trimestre (R$ 187/mês)
Estratégia: Teste pago, menor compromisso
Parcelamento: Até 3x no cartão
Link: hotmart.com/fyness-trimestral (privado)
Uso: Apenas para recuperação manual via vendedor</bpmn2:documentation>
      <bpmn2:incoming>Flow_Vendedor_Para_Trimestral</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trimestral_Para_Gateway</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Checkout_Merge" name="Direciona Checkout">
      <bpmn2:incoming>Flow_Nucleo_Entrada</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Para_Anual</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Pagamento_Anual" name="Pagamento Anual Aprovado?">
      <bpmn2:incoming>Flow_Anual_Para_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Anual_Aprovado</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Anual_Recusado</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Pagamento_Semestral" name="Pagamento Semestral Aprovado?">
      <bpmn2:incoming>Flow_Semestral_Para_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Semestral_Aprovado</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Semestral_Recusado</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:exclusiveGateway id="Gateway_Pagamento_Trimestral" name="Pagamento Trimestral Aprovado?">
      <bpmn2:incoming>Flow_Trimestral_Para_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Trimestral_Aprovado</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Trimestral_Recusado</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:intermediateCatchEvent id="LinkCatch_Merge" name="← Checkout (Todas as Fontes)">
      <bpmn2:documentation>CONVERGÊNCIA DE 5 CANAIS:
- Indicação (Ativo + Passivo)
- Conteúdo (Perfil Pessoal + Empresa)
- Prospecção (Redes Sociais)
- Google Ads (Alta Intenção)
- Meta Ads (Funil Frio)</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Nucleo_Entrada</bpmn2:outgoing>
      <bpmn2:linkEventDefinition name="Link_Checkout" />
    </bpmn2:intermediateCatchEvent>

    <bpmn2:intermediateCatchEvent id="IntermediateTimer_D2" name="⏱ Timer: 48h">
      <bpmn2:documentation>COOLING OFF PERIOD
Aguarda 2 dias antes da última tentativa
Permite que cliente resolva questões bancárias
Evita spam excessivo</bpmn2:documentation>
      <bpmn2:incoming>Flow_Semestral_Recusado</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Timer_Para_Vendedor</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>PT48H</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:sequenceFlow id="Flow_Nucleo_Entrada" sourceRef="LinkCatch_Merge" targetRef="Gateway_Checkout_Merge" />
    <bpmn2:sequenceFlow id="Flow_Para_Anual" sourceRef="Gateway_Checkout_Merge" targetRef="Task_Checkout_Anual" />
    <bpmn2:sequenceFlow id="Flow_Anual_Para_Gateway" sourceRef="Task_Checkout_Anual" targetRef="Gateway_Pagamento_Anual" />
    <bpmn2:sequenceFlow id="Flow_Anual_Aprovado" name="SIM" sourceRef="Gateway_Pagamento_Anual" targetRef="Task_Split_Parceiro" />
    <bpmn2:sequenceFlow id="Flow_Anual_Recusado" name="NÃO" sourceRef="Gateway_Pagamento_Anual" targetRef="Task_Webhook_Falha" />
    <bpmn2:sequenceFlow id="Flow_Split_Para_Onboarding" sourceRef="Task_Split_Parceiro" targetRef="Task_Onboarding_Pago" />
    <bpmn2:sequenceFlow id="Flow_Para_Cliente_Ativo" sourceRef="Task_Onboarding_Pago" targetRef="End_Cliente_Ativo" />
    <bpmn2:sequenceFlow id="Flow_Falha_Para_WhatsApp" sourceRef="Task_Webhook_Falha" targetRef="Task_WhatsApp_5min" />
    <bpmn2:sequenceFlow id="Flow_WhatsApp_Para_Semestral" sourceRef="Task_WhatsApp_5min" targetRef="Task_Checkout_Semestral" />
    <bpmn2:sequenceFlow id="Flow_Semestral_Para_Gateway" sourceRef="Task_Checkout_Semestral" targetRef="Gateway_Pagamento_Semestral" />
    <bpmn2:sequenceFlow id="Flow_Semestral_Aprovado" name="SIM" sourceRef="Gateway_Pagamento_Semestral" targetRef="Task_Onboarding_Pago" />
    <bpmn2:sequenceFlow id="Flow_Semestral_Recusado" name="NÃO" sourceRef="Gateway_Pagamento_Semestral" targetRef="IntermediateTimer_D2" />
    <bpmn2:sequenceFlow id="Flow_Timer_Para_Vendedor" sourceRef="IntermediateTimer_D2" targetRef="Task_Vendedor_Trimestral" />
    <bpmn2:sequenceFlow id="Flow_Vendedor_Para_Trimestral" sourceRef="Task_Vendedor_Trimestral" targetRef="Task_Checkout_Trimestral" />
    <bpmn2:sequenceFlow id="Flow_Trimestral_Para_Gateway" sourceRef="Task_Checkout_Trimestral" targetRef="Gateway_Pagamento_Trimestral" />
    <bpmn2:sequenceFlow id="Flow_Trimestral_Aprovado" name="SIM" sourceRef="Gateway_Pagamento_Trimestral" targetRef="Task_Onboarding_Pago" />
    <bpmn2:sequenceFlow id="Flow_Trimestral_Recusado" name="NÃO" sourceRef="Gateway_Pagamento_Trimestral" targetRef="End_Pagamento_Falhou" />

  </bpmn2:process>


    <!-- DIAGRAMA (Posições - Gerado automaticamente) -->
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_Comercial">

      <!-- Pool Shapes -->
      <bpmndi:BPMNShape id="Shape_Participant_Educacao" bpmnElement="Participant_Educacao" isHorizontal="true" bioc:stroke="#51cf66" bioc:fill="#e0ffe0">
        <dc:Bounds x="160" y="80" width="4400" height="520" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Shape_Participant_Indicacao" bpmnElement="Participant_Indicacao" isHorizontal="true" bioc:stroke="#ff6b6b" bioc:fill="#ffe0e0">
        <dc:Bounds x="160" y="650" width="4400" height="630" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Shape_Participant_Conteudo" bpmnElement="Participant_Conteudo" isHorizontal="true" bioc:stroke="#9775fa" bioc:fill="#f0e0ff">
        <dc:Bounds x="160" y="1330" width="4400" height="520" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Shape_Participant_Prospeccao" bpmnElement="Participant_Prospeccao" isHorizontal="true" bioc:stroke="#fa5252" bioc:fill="#ffe0e0">
        <dc:Bounds x="160" y="1900" width="4400" height="160" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Shape_Participant_Google" bpmnElement="Participant_Google" isHorizontal="true" bioc:stroke="#4dabf7" bioc:fill="#e0f0ff">
        <dc:Bounds x="160" y="2110" width="4400" height="660" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Shape_Participant_Meta" bpmnElement="Participant_Meta" isHorizontal="true" bioc:stroke="#cc5de8" bioc:fill="#f3e0ff">
        <dc:Bounds x="160" y="2820" width="4400" height="410" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Shape_Participant_Nucleo" bpmnElement="Participant_Nucleo" isHorizontal="true" bioc:stroke="#868e96" bioc:fill="#f0f0f0">
        <dc:Bounds x="160" y="3280" width="4400" height="410" />
      </bpmndi:BPMNShape>

      <!-- Educacao elements -->
      <bpmndi:BPMNShape id="Shape_Start_Educacao_Curso" bpmnElement="Start_Educacao_Curso">
        <dc:Bounds x="232" y="112" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Tag_Curso" bpmnElement="Task_Tag_Curso">
        <dc:Bounds x="355" y="90" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Merge_Entrada" bpmnElement="Gateway_Merge_Entrada">
        <dc:Bounds x="535" y="215" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Email_BoasVindas" bpmnElement="Task_Email_BoasVindas">
        <dc:Bounds x="665" y="200" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Aula_Setup" bpmnElement="Task_Aula_Setup">
        <dc:Bounds x="820" y="200" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_D7" bpmnElement="IntermediateTimer_D7">
        <dc:Bounds x="1007" y="222" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Ativou_D7" bpmnElement="Gateway_Ativou_D7">
        <dc:Bounds x="1155" y="215" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Merge_Ativacao" bpmnElement="Gateway_Merge_Ativacao">
        <dc:Bounds x="1465" y="215" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_M1_Desafio_DRE" bpmnElement="Task_M1_Desafio_DRE">
        <dc:Bounds x="1595" y="200" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_M2" bpmnElement="IntermediateTimer_M2">
        <dc:Bounds x="1782" y="222" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_M3_Checkpoint" bpmnElement="Task_M3_Checkpoint">
        <dc:Bounds x="1905" y="200" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_M5" bpmnElement="IntermediateTimer_M5">
        <dc:Bounds x="2092" y="222" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D150_Aviso" bpmnElement="Task_D150_Aviso">
        <dc:Bounds x="2215" y="200" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_30d" bpmnElement="IntermediateTimer_30d">
        <dc:Bounds x="2402" y="222" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Renovou" bpmnElement="Gateway_Renovou">
        <dc:Bounds x="2550" y="215" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Tipo_Renovacao" bpmnElement="Gateway_Tipo_Renovacao">
        <dc:Bounds x="2705" y="215" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Renovacao_Anual" bpmnElement="Task_Renovacao_Anual">
        <dc:Bounds x="2835" y="200" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Cliente_Ativo_Educacao" bpmnElement="End_Cliente_Ativo_Educacao">
        <dc:Bounds x="3022" y="222" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Educacao_Software" bpmnElement="Start_Educacao_Software">
        <dc:Bounds x="232" y="332" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Tag_Software" bpmnElement="Task_Tag_Software">
        <dc:Bounds x="355" y="310" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_CS_Liga_Ativacao" bpmnElement="Task_CS_Liga_Ativacao">
        <dc:Bounds x="1285" y="310" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Renovacao_Mensal" bpmnElement="Task_Renovacao_Mensal">
        <dc:Bounds x="2835" y="310" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Bloqueio_Leitura" bpmnElement="Task_Bloqueio_Leitura">
        <dc:Bounds x="2525" y="420" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_CS_Recuperacao" bpmnElement="Task_CS_Recuperacao">
        <dc:Bounds x="2680" y="420" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Recuperou" bpmnElement="Gateway_Recuperou">
        <dc:Bounds x="2860" y="435" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Cliente_Perdido_Educacao" bpmnElement="End_Cliente_Perdido_Educacao">
        <dc:Bounds x="3022" y="442" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- Indicacao elements -->
      <bpmndi:BPMNShape id="Shape_Start_Indicacao_Ativo" bpmnElement="Start_Indicacao_Ativo">
        <dc:Bounds x="232" y="682" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Tag_Ativo" bpmnElement="Task_Tag_Ativo">
        <dc:Bounds x="355" y="660" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_QuebraGelo_Ativo" bpmnElement="Task_QuebraGelo_Ativo">
        <dc:Bounds x="510" y="660" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_MergeIndicacao" bpmnElement="Gateway_MergeIndicacao">
        <dc:Bounds x="690" y="785" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D0_Ligacao_Indicacao" bpmnElement="Task_D0_Ligacao_Indicacao">
        <dc:Bounds x="820" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Atendeu_D0_Indicacao" bpmnElement="Gateway_Atendeu_D0_Indicacao">
        <dc:Bounds x="1000" y="785" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D0_Qualifica_Indicacao" bpmnElement="Task_D0_Qualifica_Indicacao">
        <dc:Bounds x="1130" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Converteu_D0_Indicacao" bpmnElement="Gateway_Converteu_D0_Indicacao">
        <dc:Bounds x="1310" y="785" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Merge_D0_Indicacao" bpmnElement="Gateway_Merge_D0_Indicacao">
        <dc:Bounds x="1620" y="785" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D1_WhatsApp2_Indicacao" bpmnElement="Task_D1_WhatsApp2_Indicacao">
        <dc:Bounds x="1750" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D3_WhatsApp3_Indicacao" bpmnElement="Task_D3_WhatsApp3_Indicacao">
        <dc:Bounds x="1905" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D6_WhatsApp4_Indicacao" bpmnElement="Task_D6_WhatsApp4_Indicacao">
        <dc:Bounds x="2060" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D10_WhatsApp5_Indicacao" bpmnElement="Task_D10_WhatsApp5_Indicacao">
        <dc:Bounds x="2215" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Converteu_Indicacao" bpmnElement="Gateway_Converteu_Indicacao">
        <dc:Bounds x="2395" y="785" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Indicacao" bpmnElement="LinkThrow_Indicacao">
        <dc:Bounds x="2557" y="792" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_AvisaParceiro" bpmnElement="Task_AvisaParceiro">
        <dc:Bounds x="2680" y="770" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Indicacao_Passivo" bpmnElement="Start_Indicacao_Passivo">
        <dc:Bounds x="232" y="902" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Tag_Passivo" bpmnElement="Task_Tag_Passivo">
        <dc:Bounds x="355" y="880" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_QuebraGelo_Passivo" bpmnElement="Task_QuebraGelo_Passivo">
        <dc:Bounds x="510" y="880" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D0_WhatsApp1_Indicacao" bpmnElement="Task_D0_WhatsApp1_Indicacao">
        <dc:Bounds x="975" y="880" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D0_Instagram_Indicacao" bpmnElement="Task_D0_Instagram_Indicacao">
        <dc:Bounds x="1130" y="880" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_FlashDemo_Indicacao" bpmnElement="Task_FlashDemo_Indicacao">
        <dc:Bounds x="1440" y="990" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Trial7d_Indicacao" bpmnElement="Task_Trial7d_Indicacao">
        <dc:Bounds x="1580" y="990" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_48h" bpmnElement="IntermediateTimer_48h">
        <dc:Bounds x="1702" y="1012" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_UsouEm48h" bpmnElement="Gateway_UsouEm48h">
        <dc:Bounds x="1820" y="1005" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_PressaoSocial" bpmnElement="Task_PressaoSocial">
        <dc:Bounds x="1940" y="1100" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D1_Lembrete" bpmnElement="Task_D1_Lembrete">
        <dc:Bounds x="1960" y="990" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D3_ProvaSocial" bpmnElement="Task_D3_ProvaSocial">
        <dc:Bounds x="2100" y="990" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D5_Ultimato" bpmnElement="Task_D5_Ultimato">
        <dc:Bounds x="2240" y="990" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_24h_Breakup_Indicacao" bpmnElement="IntermediateTimer_24h_Breakup_Indicacao">
        <dc:Bounds x="2402" y="1122" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Respondeu_Breakup_Indicacao" bpmnElement="Gateway_Respondeu_Breakup_Indicacao">
        <dc:Bounds x="2550" y="1115" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_SelecaoMotivo_Indicacao" bpmnElement="Task_SelecaoMotivo_Indicacao">
        <dc:Bounds x="2680" y="1100" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Perdido_Motivo_Indicacao" bpmnElement="End_Perdido_Motivo_Indicacao">
        <dc:Bounds x="2867" y="1122" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_GrupoNurturing_Indicacao" bpmnElement="Task_GrupoNurturing_Indicacao">
        <dc:Bounds x="2680" y="990" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Bloqueio_Indicacao" bpmnElement="End_Bloqueio_Indicacao">
        <dc:Bounds x="2867" y="1012" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- Conteudo elements -->
      <bpmndi:BPMNShape id="Shape_Start_Conteudo_Empresa" bpmnElement="Start_Conteudo_Empresa">
        <dc:Bounds x="232" y="1362" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_SDR_Empresa" bpmnElement="Task_SDR_Empresa">
        <dc:Bounds x="355" y="1340" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_WhatsApp_Empresa" bpmnElement="Task_WhatsApp_Empresa">
        <dc:Bounds x="510" y="1340" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_FlashDemo_Empresa" bpmnElement="Task_FlashDemo_Empresa">
        <dc:Bounds x="665" y="1340" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Merge_Conteudo" bpmnElement="Gateway_Merge_Conteudo">
        <dc:Bounds x="845" y="1465" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Converteu_Imediato_Conteudo" bpmnElement="Gateway_Converteu_Imediato_Conteudo">
        <dc:Bounds x="1000" y="1465" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D1_Repost_Conteudo" bpmnElement="Task_D1_Repost_Conteudo">
        <dc:Bounds x="1130" y="1450" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D3_Prova_Conteudo" bpmnElement="Task_D3_Prova_Conteudo">
        <dc:Bounds x="1285" y="1450" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D7_Fechamento_Conteudo" bpmnElement="Task_D7_Fechamento_Conteudo">
        <dc:Bounds x="1440" y="1450" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Converteu_Conteudo" bpmnElement="Gateway_Converteu_Conteudo">
        <dc:Bounds x="1620" y="1465" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Conteudo" bpmnElement="LinkThrow_Conteudo">
        <dc:Bounds x="1782" y="1472" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Conteudo_Pessoal" bpmnElement="Start_Conteudo_Pessoal">
        <dc:Bounds x="232" y="1582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_ManyChat_Pessoal" bpmnElement="Task_ManyChat_Pessoal">
        <dc:Bounds x="355" y="1560" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_WhatsApp_Pessoal" bpmnElement="Task_WhatsApp_Pessoal">
        <dc:Bounds x="510" y="1560" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_FlashDemo_Pessoal" bpmnElement="Task_FlashDemo_Pessoal">
        <dc:Bounds x="665" y="1560" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_24h_Conteudo" bpmnElement="IntermediateTimer_24h_Conteudo">
        <dc:Bounds x="1627" y="1692" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Respondeu_Conteudo" bpmnElement="Gateway_Respondeu_Conteudo">
        <dc:Bounds x="1775" y="1685" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_GrupoNurturing_Conteudo" bpmnElement="Task_GrupoNurturing_Conteudo">
        <dc:Bounds x="1905" y="1670" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Bloqueio_Conteudo" bpmnElement="End_Bloqueio_Conteudo">
        <dc:Bounds x="2092" y="1692" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_SelecaoMotivo_Conteudo" bpmnElement="Task_SelecaoMotivo_Conteudo">
        <dc:Bounds x="1905" y="1560" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Perdido_Conteudo" bpmnElement="End_Perdido_Conteudo">
        <dc:Bounds x="2092" y="1582" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- Prospeccao elements -->
      <bpmndi:BPMNShape id="Shape_Start_Prospeccao" bpmnElement="Start_Prospeccao">
        <dc:Bounds x="232" y="1932" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Prosp_Placeholder" bpmnElement="Task_Prosp_Placeholder">
        <dc:Bounds x="355" y="1910" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Prospeccao" bpmnElement="LinkThrow_Prospeccao">
        <dc:Bounds x="542" y="1932" width="36" height="36" />
      </bpmndi:BPMNShape>

                  <!-- Google elements -->
      <bpmndi:BPMNShape id="Task_ClickCheckout_Self_di" bpmnElement="Task_ClickCheckout_Self">
        <dc:Bounds x="500" y="2170" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_PreencheDados_Self_di" bpmnElement="Task_PreencheDados_Self">
        <dc:Bounds x="640" y="2170" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Pagamento_Self_di" bpmnElement="Gateway_Pagamento_Self">
        <dc:Bounds x="780" y="2185" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_AutomacaoBoasVindas_di" bpmnElement="Task_AutomacaoBoasVindas">
        <dc:Bounds x="870" y="2170" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="IntermediateTimer_24h_Google_di" bpmnElement="IntermediateTimer_24h_Google">
        <dc:Bounds x="1010" y="2192" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_PrimeiroAudio_di" bpmnElement="Gateway_PrimeiroAudio">
        <dc:Bounds x="1090" y="2185" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_AlertaHumano_Google_di" bpmnElement="Task_AlertaHumano_Google">
        <dc:Bounds x="1180" y="2170" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Pago_Google_di" bpmnElement="End_Pago_Google">
        <dc:Bounds x="1332" y="2192" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Start_Google_di" bpmnElement="Start_Google">
        <dc:Bounds x="250" y="2302" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_CaminhoGoogle_di" bpmnElement="Gateway_CaminhoGoogle">
        <dc:Bounds x="370" y="2295" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_MergeTrial_di" bpmnElement="Gateway_MergeTrial">
        <dc:Bounds x="1100" y="2295" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D0_Ligacao1_Google_di" bpmnElement="Task_D0_Ligacao1_Google">
        <dc:Bounds x="1230" y="2280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Atendeu_D0_Google_di" bpmnElement="Gateway_Atendeu_D0_Google">
        <dc:Bounds x="1380" y="2295" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D0_Qualifica_Google_di" bpmnElement="Task_D0_Qualifica_Google">
        <dc:Bounds x="1480" y="2280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Merge_D0_Google_di" bpmnElement="Gateway_Merge_D0_Google">
        <dc:Bounds x="1750" y="2295" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D1_WhatsApp3_Diferenca_Google_di" bpmnElement="Task_D1_WhatsApp3_Diferenca_Google">
        <dc:Bounds x="1880" y="2280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D1_Ligacao2_Google_di" bpmnElement="Task_D1_Ligacao2_Google">
        <dc:Bounds x="2020" y="2280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D3_WhatsApp4_Case_Google_di" bpmnElement="Task_D3_WhatsApp4_Case_Google">
        <dc:Bounds x="2160" y="2280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D5_WhatsApp5_Pressao_Google_di" bpmnElement="Task_D5_WhatsApp5_Pressao_Google">
        <dc:Bounds x="2300" y="2280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D5_Ligacao3_Google_di" bpmnElement="Task_D5_Ligacao3_Google">
        <dc:Bounds x="2440" y="2280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D7_Fechamento_Google_di" bpmnElement="Task_D7_Fechamento_Google">
        <dc:Bounds x="2580" y="2280" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Converteu_Google_di" bpmnElement="Gateway_Converteu_Google">
        <dc:Bounds x="2720" y="2295" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="LinkThrow_Google_di" bpmnElement="LinkThrow_Google">
        <dc:Bounds x="2830" y="2302" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_ClickWhatsApp_di" bpmnElement="Task_ClickWhatsApp">
        <dc:Bounds x="500" y="2390" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_SpeedToLead_Google_di" bpmnElement="Task_SpeedToLead_Google">
        <dc:Bounds x="640" y="2390" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_FlashDemo_Google_di" bpmnElement="Task_FlashDemo_Google">
        <dc:Bounds x="780" y="2390" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_OfertaTrial_Google_di" bpmnElement="Task_OfertaTrial_Google">
        <dc:Bounds x="920" y="2390" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_AceitouTrial_Google_di" bpmnElement="Gateway_AceitouTrial_Google" isMarkerVisible="true">
        <dc:Bounds x="1050" y="2405" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D0_WhatsApp1_Prova_Google_di" bpmnElement="Task_D0_WhatsApp1_Prova_Google">
        <dc:Bounds x="1480" y="2390" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D0_WhatsApp2_Ajuda_Google_di" bpmnElement="Task_D0_WhatsApp2_Ajuda_Google">
        <dc:Bounds x="1620" y="2390" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_D7_WhatsApp6_Breakup_Google_di" bpmnElement="Task_D7_WhatsApp6_Breakup_Google">
        <dc:Bounds x="2830" y="2390" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="IntermediateTimer_24h_Breakup_Google_di" bpmnElement="IntermediateTimer_24h_Breakup_Google">
        <dc:Bounds x="2972" y="2412" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Respondeu_Breakup_Google_di" bpmnElement="Gateway_Respondeu_Breakup_Google">
        <dc:Bounds x="3050" y="2405" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_GrupoNurturing_Google_di" bpmnElement="Task_GrupoNurturing_Google">
        <dc:Bounds x="3140" y="2390" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Bloqueio_Google_di" bpmnElement="End_Bloqueio_Google">
        <dc:Bounds x="3282" y="2412" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_RecuperacaoCarrinho_di" bpmnElement="Task_RecuperacaoCarrinho">
        <dc:Bounds x="870" y="2500" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="SubProcess_Trial_Google_di" bpmnElement="SubProcess_Trial_Google" isExpanded="true" bioc:stroke="#4dabf7" bioc:fill="#e0f0ff">
        <dc:Bounds x="1010" y="2490" width="1540" height="220" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Start_Trial_di" bpmnElement="Start_Trial">
        <dc:Bounds x="1030" y="2582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D0_BoasVindas_di" bpmnElement="Task_Trial_D0_BoasVindas">
        <dc:Bounds x="1090" y="2560" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_24h_di" bpmnElement="Timer_Trial_24h">
        <dc:Bounds x="1212" y="2582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Trial_D1_Uso_di" bpmnElement="Gateway_Trial_D1_Uso">
        <dc:Bounds x="1270" y="2575" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D1_Dica_di" bpmnElement="Task_Trial_D1_Dica">
        <dc:Bounds x="1345" y="2510" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D1_Reengajamento_di" bpmnElement="Task_Trial_D1_Reengajamento">
        <dc:Bounds x="1345" y="2620" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Trial_D1_Merge_di" bpmnElement="Gateway_Trial_D1_Merge">
        <dc:Bounds x="1470" y="2575" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_D2_di" bpmnElement="Timer_Trial_D2">
        <dc:Bounds x="1542" y="2582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D2_Case_di" bpmnElement="Task_Trial_D2_Case">
        <dc:Bounds x="1600" y="2560" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_D3_di" bpmnElement="Timer_Trial_D3">
        <dc:Bounds x="1722" y="2582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Trial_D3_Uso_di" bpmnElement="Gateway_Trial_D3_Uso">
        <dc:Bounds x="1780" y="2575" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D3_Parabens_di" bpmnElement="Task_Trial_D3_Parabens">
        <dc:Bounds x="1855" y="2510" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D3_Resgate_di" bpmnElement="Task_Trial_D3_Resgate">
        <dc:Bounds x="1855" y="2620" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_Trial_D3_Merge_di" bpmnElement="Gateway_Trial_D3_Merge">
        <dc:Bounds x="1980" y="2575" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_D5_di" bpmnElement="Timer_Trial_D5">
        <dc:Bounds x="2052" y="2582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D5_Urgencia_di" bpmnElement="Task_Trial_D5_Urgencia">
        <dc:Bounds x="2110" y="2560" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_D6_di" bpmnElement="Timer_Trial_D6">
        <dc:Bounds x="2232" y="2582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_Trial_D6_Oferta_di" bpmnElement="Task_Trial_D6_Oferta">
        <dc:Bounds x="2290" y="2560" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Timer_Trial_D7_di" bpmnElement="Timer_Trial_D7">
        <dc:Bounds x="2412" y="2582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Trial_di" bpmnElement="End_Trial">
        <dc:Bounds x="2472" y="2582" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Task_SelecaoMotivo_Google_di" bpmnElement="Task_SelecaoMotivo_Google">
        <dc:Bounds x="3140" y="2500" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="End_Perdido_Motivo_Google_di" bpmnElement="End_Perdido_Motivo_Google">
        <dc:Bounds x="3282" y="2522" width="36" height="36" />
      </bpmndi:BPMNShape>
      <!-- Meta elements -->
      <bpmndi:BPMNShape id="Shape_Start_Meta" bpmnElement="Start_Meta">
        <dc:Bounds x="232" y="2852" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_PaginaFiltro_Meta" bpmnElement="Task_PaginaFiltro_Meta">
        <dc:Bounds x="355" y="2830" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_WhatsApp_D0_Meta" bpmnElement="Task_WhatsApp_D0_Meta">
        <dc:Bounds x="510" y="2830" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_FlashDemo_D0_Meta" bpmnElement="Task_FlashDemo_D0_Meta">
        <dc:Bounds x="665" y="2830" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Interessado_D0_Meta" bpmnElement="Gateway_Interessado_D0_Meta">
        <dc:Bounds x="845" y="2845" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Converteu_Imediato_Meta" bpmnElement="Gateway_Converteu_Imediato_Meta">
        <dc:Bounds x="1000" y="2845" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D1_WhatsApp_Meta" bpmnElement="Task_D1_WhatsApp_Meta">
        <dc:Bounds x="1130" y="2830" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D3_WhatsApp_Meta" bpmnElement="Task_D3_WhatsApp_Meta">
        <dc:Bounds x="1285" y="2830" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D6_WhatsApp_Meta" bpmnElement="Task_D6_WhatsApp_Meta">
        <dc:Bounds x="1440" y="2830" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D9_WhatsApp_Meta" bpmnElement="Task_D9_WhatsApp_Meta">
        <dc:Bounds x="1595" y="2830" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_D14_WhatsApp_Meta" bpmnElement="Task_D14_WhatsApp_Meta">
        <dc:Bounds x="1750" y="2830" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Converteu_Meta" bpmnElement="Gateway_Converteu_Meta">
        <dc:Bounds x="1930" y="2845" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_LinkThrow_Meta" bpmnElement="LinkThrow_Meta">
        <dc:Bounds x="2092" y="2852" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_24h_Meta" bpmnElement="IntermediateTimer_24h_Meta">
        <dc:Bounds x="1937" y="2962" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Respondeu_Meta" bpmnElement="Gateway_Respondeu_Meta">
        <dc:Bounds x="2085" y="2955" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_GrupoNurturing_Meta" bpmnElement="Task_GrupoNurturing_Meta">
        <dc:Bounds x="2215" y="2940" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Bloqueio_Meta" bpmnElement="End_Bloqueio_Meta">
        <dc:Bounds x="2402" y="2962" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_SelecaoMotivo_Meta" bpmnElement="Task_SelecaoMotivo_Meta">
        <dc:Bounds x="2215" y="3050" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Perdido_Meta" bpmnElement="End_Perdido_Meta">
        <dc:Bounds x="2402" y="3072" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- Nucleo elements -->
      <bpmndi:BPMNShape id="Shape_LinkCatch_Merge" bpmnElement="LinkCatch_Merge">
        <dc:Bounds x="232" y="3172" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Checkout_Merge" bpmnElement="Gateway_Checkout_Merge">
        <dc:Bounds x="380" y="3165" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Checkout_Anual" bpmnElement="Task_Checkout_Anual">
        <dc:Bounds x="510" y="3150" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Pagamento_Anual" bpmnElement="Gateway_Pagamento_Anual">
        <dc:Bounds x="690" y="3165" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Split_Parceiro" bpmnElement="Task_Split_Parceiro">
        <dc:Bounds x="820" y="3150" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Onboarding_Pago" bpmnElement="Task_Onboarding_Pago">
        <dc:Bounds x="975" y="3150" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Cliente_Ativo" bpmnElement="End_Cliente_Ativo">
        <dc:Bounds x="1162" y="3172" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Webhook_Falha" bpmnElement="Task_Webhook_Falha">
        <dc:Bounds x="665" y="3260" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_WhatsApp_5min" bpmnElement="Task_WhatsApp_5min">
        <dc:Bounds x="820" y="3260" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Checkout_Semestral" bpmnElement="Task_Checkout_Semestral">
        <dc:Bounds x="975" y="3260" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Pagamento_Semestral" bpmnElement="Gateway_Pagamento_Semestral">
        <dc:Bounds x="1155" y="3275" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_IntermediateTimer_D2" bpmnElement="IntermediateTimer_D2">
        <dc:Bounds x="1162" y="3392" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Vendedor_Trimestral" bpmnElement="Task_Vendedor_Trimestral">
        <dc:Bounds x="1285" y="3370" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Checkout_Trimestral" bpmnElement="Task_Checkout_Trimestral">
        <dc:Bounds x="1440" y="3370" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Gateway_Pagamento_Trimestral" bpmnElement="Gateway_Pagamento_Trimestral">
        <dc:Bounds x="1620" y="3385" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Pagamento_Falhou" bpmnElement="End_Pagamento_Falhou">
        <dc:Bounds x="1782" y="3392" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- Educacao edges -->
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Soft_1" bpmnElement="Flow_Edu_Soft_1">
        <di:waypoint x="268" y="350" />
        <di:waypoint x="355" y="350" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Soft_2" bpmnElement="Flow_Edu_Soft_2">
        <di:waypoint x="455" y="350" />
        <di:waypoint x="485" y="350" />
        <di:waypoint x="485" y="240" />
        <di:waypoint x="535" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Curso_1" bpmnElement="Flow_Edu_Curso_1">
        <di:waypoint x="268" y="130" />
        <di:waypoint x="355" y="130" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Curso_2" bpmnElement="Flow_Edu_Curso_2">
        <di:waypoint x="455" y="130" />
        <di:waypoint x="485" y="130" />
        <di:waypoint x="485" y="240" />
        <di:waypoint x="535" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Merge_1" bpmnElement="Flow_Edu_Merge_1">
        <di:waypoint x="585" y="240" />
        <di:waypoint x="665" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Email_1" bpmnElement="Flow_Edu_Email_1">
        <di:waypoint x="765" y="240" />
        <di:waypoint x="820" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Setup_1" bpmnElement="Flow_Edu_Setup_1">
        <di:waypoint x="920" y="240" />
        <di:waypoint x="1007" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Timer_D7" bpmnElement="Flow_Edu_Timer_D7">
        <di:waypoint x="1043" y="240" />
        <di:waypoint x="1155" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Ativou_Nao" bpmnElement="Flow_Edu_Ativou_Nao">
        <di:waypoint x="1205" y="240" />
        <di:waypoint x="1235" y="240" />
        <di:waypoint x="1235" y="350" />
        <di:waypoint x="1285" y="350" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Ativou_Sim" bpmnElement="Flow_Edu_Ativou_Sim">
        <di:waypoint x="1205" y="240" />
        <di:waypoint x="1465" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_CS_Ativa" bpmnElement="Flow_Edu_CS_Ativa">
        <di:waypoint x="1385" y="350" />
        <di:waypoint x="1415" y="350" />
        <di:waypoint x="1415" y="240" />
        <di:waypoint x="1465" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Merge_Ativa" bpmnElement="Flow_Edu_Merge_Ativa">
        <di:waypoint x="1515" y="240" />
        <di:waypoint x="1595" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_M1" bpmnElement="Flow_Edu_M1">
        <di:waypoint x="1695" y="240" />
        <di:waypoint x="1782" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_M2" bpmnElement="Flow_Edu_M2">
        <di:waypoint x="1818" y="240" />
        <di:waypoint x="1905" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_M3" bpmnElement="Flow_Edu_M3">
        <di:waypoint x="2005" y="240" />
        <di:waypoint x="2092" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_M5" bpmnElement="Flow_Edu_M5">
        <di:waypoint x="2128" y="240" />
        <di:waypoint x="2215" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_D150" bpmnElement="Flow_Edu_D150">
        <di:waypoint x="2315" y="240" />
        <di:waypoint x="2402" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_30d" bpmnElement="Flow_Edu_30d">
        <di:waypoint x="2438" y="240" />
        <di:waypoint x="2550" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Renovou_Sim" bpmnElement="Flow_Edu_Renovou_Sim">
        <di:waypoint x="2600" y="240" />
        <di:waypoint x="2705" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Renovou_Nao" bpmnElement="Flow_Edu_Renovou_Nao">
        <di:waypoint x="2575" y="265" />
        <di:waypoint x="2575" y="420" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Tipo_Anual" bpmnElement="Flow_Edu_Tipo_Anual">
        <di:waypoint x="2755" y="240" />
        <di:waypoint x="2835" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Tipo_Mensal" bpmnElement="Flow_Edu_Tipo_Mensal">
        <di:waypoint x="2755" y="240" />
        <di:waypoint x="2785" y="240" />
        <di:waypoint x="2785" y="350" />
        <di:waypoint x="2835" y="350" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Renov_Anual" bpmnElement="Flow_Edu_Renov_Anual">
        <di:waypoint x="2935" y="240" />
        <di:waypoint x="3022" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Renov_Mensal" bpmnElement="Flow_Edu_Renov_Mensal">
        <di:waypoint x="2935" y="350" />
        <di:waypoint x="2965" y="350" />
        <di:waypoint x="2965" y="240" />
        <di:waypoint x="3022" y="240" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Bloqueio" bpmnElement="Flow_Edu_Bloqueio">
        <di:waypoint x="2625" y="460" />
        <di:waypoint x="2680" y="460" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_CS_Recovery" bpmnElement="Flow_Edu_CS_Recovery">
        <di:waypoint x="2780" y="460" />
        <di:waypoint x="2860" y="460" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Recuperou_Sim" bpmnElement="Flow_Edu_Recuperou_Sim">
        <di:waypoint x="2885" y="435" />
        <di:waypoint x="2885" y="399" />
        <di:waypoint x="2730" y="399" />
        <di:waypoint x="2730" y="265" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Edu_Recuperou_Nao" bpmnElement="Flow_Edu_Recuperou_Nao">
        <di:waypoint x="2910" y="460" />
        <di:waypoint x="3022" y="460" />
      </bpmndi:BPMNEdge>

      <!-- Indicacao edges -->
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Ativo_1" bpmnElement="Flow_Ind_Ativo_1">
        <di:waypoint x="268" y="700" />
        <di:waypoint x="355" y="700" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Ativo_2" bpmnElement="Flow_Ind_Ativo_2">
        <di:waypoint x="455" y="700" />
        <di:waypoint x="510" y="700" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Ativo_3" bpmnElement="Flow_Ind_Ativo_3">
        <di:waypoint x="610" y="700" />
        <di:waypoint x="640" y="700" />
        <di:waypoint x="640" y="810" />
        <di:waypoint x="690" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Passivo_1" bpmnElement="Flow_Ind_Passivo_1">
        <di:waypoint x="268" y="920" />
        <di:waypoint x="355" y="920" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Passivo_2" bpmnElement="Flow_Ind_Passivo_2">
        <di:waypoint x="455" y="920" />
        <di:waypoint x="510" y="920" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Passivo_3" bpmnElement="Flow_Ind_Passivo_3">
        <di:waypoint x="610" y="920" />
        <di:waypoint x="640" y="920" />
        <di:waypoint x="640" y="810" />
        <di:waypoint x="690" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Merged" bpmnElement="Flow_Ind_Merged">
        <di:waypoint x="740" y="810" />
        <di:waypoint x="820" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Demo" bpmnElement="Flow_Ind_Demo">
        <di:waypoint x="1540" y="1030" />
        <di:waypoint x="1580" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Trial" bpmnElement="Flow_Ind_Trial">
        <di:waypoint x="1680" y="1030" />
        <di:waypoint x="1702" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Timer_Check" bpmnElement="Flow_Ind_Timer_Check">
        <di:waypoint x="1738" y="1030" />
        <di:waypoint x="1820" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_NaoUsou" bpmnElement="Flow_Ind_NaoUsou">
        <di:waypoint x="1845" y="1055" />
        <di:waypoint x="1845" y="1140" />
        <di:waypoint x="1940" y="1140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Usou" bpmnElement="Flow_Ind_Usou">
        <di:waypoint x="1870" y="1030" />
        <di:waypoint x="1960" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Pressao" bpmnElement="Flow_Ind_Pressao">
        <di:waypoint x="2010" y="1100" />
        <di:waypoint x="2010" y="1070" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D1" bpmnElement="Flow_Ind_D1">
        <di:waypoint x="2060" y="1030" />
        <di:waypoint x="2100" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D3" bpmnElement="Flow_Ind_D3">
        <di:waypoint x="2200" y="1030" />
        <di:waypoint x="2240" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D5" bpmnElement="Flow_Ind_D5">
        <di:waypoint x="2340" y="1030" />
        <di:waypoint x="2420" y="1030" />
        <di:waypoint x="2420" y="810" />
        <di:waypoint x="2395" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Sim" bpmnElement="Flow_Ind_Sim">
        <di:waypoint x="2445" y="810" />
        <di:waypoint x="2680" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Aviso" bpmnElement="Flow_Ind_Aviso">
        <di:waypoint x="2730" y="850" />
        <di:waypoint x="2730" y="870" />
        <di:waypoint x="2575" y="870" />
        <di:waypoint x="2575" y="828" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Nao" bpmnElement="Flow_Ind_Nao">
        <di:waypoint x="2445" y="810" />
        <di:waypoint x="2475" y="810" />
        <di:waypoint x="2475" y="1030" />
        <di:waypoint x="2680" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Nurturing" bpmnElement="Flow_Ind_Nurturing">
        <di:waypoint x="2780" y="1030" />
        <di:waypoint x="2867" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Lig" bpmnElement="Flow_Ind_D0_Lig">
        <di:waypoint x="920" y="810" />
        <di:waypoint x="1000" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Atendeu" bpmnElement="Flow_Ind_D0_Atendeu">
        <di:waypoint x="1050" y="810" />
        <di:waypoint x="1130" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_NaoAtendeu" bpmnElement="Flow_Ind_D0_NaoAtendeu">
        <di:waypoint x="1025" y="835" />
        <di:waypoint x="1025" y="880" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Check" bpmnElement="Flow_Ind_D0_Check">
        <di:waypoint x="1230" y="810" />
        <di:waypoint x="1310" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Converteu_Sim" bpmnElement="Flow_Ind_D0_Converteu_Sim">
        <di:waypoint x="1360" y="810" />
        <di:waypoint x="2557" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Converteu_Nao" bpmnElement="Flow_Ind_D0_Converteu_Nao">
        <di:waypoint x="1335" y="835" />
        <di:waypoint x="1335" y="1030" />
        <di:waypoint x="1440" y="1030" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Zap1" bpmnElement="Flow_Ind_D0_Zap1">
        <di:waypoint x="1075" y="920" />
        <di:waypoint x="1130" y="920" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Insta" bpmnElement="Flow_Ind_D0_Insta">
        <di:waypoint x="1230" y="920" />
        <di:waypoint x="1260" y="920" />
        <di:waypoint x="1260" y="810" />
        <di:waypoint x="1620" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D0_Merge" bpmnElement="Flow_Ind_D0_Merge">
        <di:waypoint x="1670" y="810" />
        <di:waypoint x="1750" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D1_Zap2" bpmnElement="Flow_Ind_D1_Zap2">
        <di:waypoint x="1850" y="810" />
        <di:waypoint x="1905" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D3_Zap3" bpmnElement="Flow_Ind_D3_Zap3">
        <di:waypoint x="2005" y="810" />
        <di:waypoint x="2060" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D6_Zap4" bpmnElement="Flow_Ind_D6_Zap4">
        <di:waypoint x="2160" y="810" />
        <di:waypoint x="2215" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_D10_Check" bpmnElement="Flow_Ind_D10_Check">
        <di:waypoint x="2315" y="810" />
        <di:waypoint x="2395" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Converteu_Sim" bpmnElement="Flow_Ind_Converteu_Sim">
        <di:waypoint x="2445" y="810" />
        <di:waypoint x="2557" y="810" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Converteu_Nao" bpmnElement="Flow_Ind_Converteu_Nao">
        <di:waypoint x="2420" y="835" />
        <di:waypoint x="2420" y="1122" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Check_Breakup" bpmnElement="Flow_Ind_Check_Breakup">
        <di:waypoint x="2438" y="1140" />
        <di:waypoint x="2550" y="1140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Respondeu_Nao" bpmnElement="Flow_Ind_Respondeu_Nao">
        <di:waypoint x="2600" y="1140" />
        <di:waypoint x="2680" y="1140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Motivo" bpmnElement="Flow_Ind_Motivo">
        <di:waypoint x="2780" y="1140" />
        <di:waypoint x="2867" y="1140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Ind_Respondeu_Sim" bpmnElement="Flow_Ind_Respondeu_Sim">
        <di:waypoint x="2600" y="1140" />
        <di:waypoint x="2630" y="1140" />
        <di:waypoint x="2630" y="1030" />
        <di:waypoint x="2680" y="1030" />
      </bpmndi:BPMNEdge>

      <!-- Conteudo edges -->
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Pessoal_1" bpmnElement="Flow_Cont_Pessoal_1">
        <di:waypoint x="268" y="1600" />
        <di:waypoint x="355" y="1600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Pessoal_2" bpmnElement="Flow_Cont_Pessoal_2">
        <di:waypoint x="455" y="1600" />
        <di:waypoint x="510" y="1600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Pessoal_3" bpmnElement="Flow_Cont_Pessoal_3">
        <di:waypoint x="610" y="1600" />
        <di:waypoint x="665" y="1600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Pessoal_Merge" bpmnElement="Flow_Cont_Pessoal_Merge">
        <di:waypoint x="765" y="1600" />
        <di:waypoint x="795" y="1600" />
        <di:waypoint x="795" y="1490" />
        <di:waypoint x="845" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Empresa_1" bpmnElement="Flow_Cont_Empresa_1">
        <di:waypoint x="268" y="1380" />
        <di:waypoint x="355" y="1380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Empresa_2" bpmnElement="Flow_Cont_Empresa_2">
        <di:waypoint x="455" y="1380" />
        <di:waypoint x="510" y="1380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Empresa_3" bpmnElement="Flow_Cont_Empresa_3">
        <di:waypoint x="610" y="1380" />
        <di:waypoint x="665" y="1380" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Empresa_Merge" bpmnElement="Flow_Cont_Empresa_Merge">
        <di:waypoint x="765" y="1380" />
        <di:waypoint x="795" y="1380" />
        <di:waypoint x="795" y="1490" />
        <di:waypoint x="845" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Merged" bpmnElement="Flow_Cont_Merged">
        <di:waypoint x="895" y="1490" />
        <di:waypoint x="1000" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Imediato_Sim" bpmnElement="Flow_Cont_Imediato_Sim">
        <di:waypoint x="1050" y="1490" />
        <di:waypoint x="1782" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Imediato_Nao" bpmnElement="Flow_Cont_Imediato_Nao">
        <di:waypoint x="1050" y="1490" />
        <di:waypoint x="1130" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_D1" bpmnElement="Flow_Cont_D1">
        <di:waypoint x="1230" y="1490" />
        <di:waypoint x="1285" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_D3" bpmnElement="Flow_Cont_D3">
        <di:waypoint x="1385" y="1490" />
        <di:waypoint x="1440" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_D7" bpmnElement="Flow_Cont_D7">
        <di:waypoint x="1540" y="1490" />
        <di:waypoint x="1620" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Converteu_Sim" bpmnElement="Flow_Cont_Converteu_Sim">
        <di:waypoint x="1670" y="1490" />
        <di:waypoint x="1782" y="1490" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Converteu_Nao" bpmnElement="Flow_Cont_Converteu_Nao">
        <di:waypoint x="1645" y="1515" />
        <di:waypoint x="1645" y="1692" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Timer" bpmnElement="Flow_Cont_Timer">
        <di:waypoint x="1663" y="1710" />
        <di:waypoint x="1775" y="1710" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Respondeu_Sim" bpmnElement="Flow_Cont_Respondeu_Sim">
        <di:waypoint x="1825" y="1710" />
        <di:waypoint x="1905" y="1710" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Nurturing" bpmnElement="Flow_Cont_Nurturing">
        <di:waypoint x="2005" y="1710" />
        <di:waypoint x="2092" y="1710" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Respondeu_Nao" bpmnElement="Flow_Cont_Respondeu_Nao">
        <di:waypoint x="1825" y="1710" />
        <di:waypoint x="1855" y="1710" />
        <di:waypoint x="1855" y="1600" />
        <di:waypoint x="1905" y="1600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Cont_Motivo" bpmnElement="Flow_Cont_Motivo">
        <di:waypoint x="2005" y="1600" />
        <di:waypoint x="2092" y="1600" />
      </bpmndi:BPMNEdge>

      <!-- Prospeccao edges -->
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_1" bpmnElement="Flow_Prosp_1">
        <di:waypoint x="268" y="1950" />
        <di:waypoint x="355" y="1950" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Prosp_2" bpmnElement="Flow_Prosp_2">
        <di:waypoint x="455" y="1950" />
        <di:waypoint x="542" y="1950" />
      </bpmndi:BPMNEdge>

                  <!-- Google edges -->
      <bpmndi:BPMNEdge id="Flow_Goo_Start_di" bpmnElement="Flow_Goo_Start">
        <di:waypoint x="286" y="2320" />
        <di:waypoint x="370" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Self_di" bpmnElement="Flow_Goo_Self">
        <di:waypoint x="395" y="2295" />
        <di:waypoint x="395" y="2210" />
        <di:waypoint x="500" y="2210" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Self_1_di" bpmnElement="Flow_Goo_Self_1">
        <di:waypoint x="600" y="2210" />
        <di:waypoint x="640" y="2210" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Self_2_di" bpmnElement="Flow_Goo_Self_2">
        <di:waypoint x="740" y="2210" />
        <di:waypoint x="780" y="2210" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Sucesso_di" bpmnElement="Flow_Goo_Sucesso">
        <di:waypoint x="830" y="2210" />
        <di:waypoint x="870" y="2210" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Falha_di" bpmnElement="Flow_Goo_Falha">
        <di:waypoint x="805" y="2235" />
        <di:waypoint x="805" y="2540" />
        <di:waypoint x="870" y="2540" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_BoasVindas_di" bpmnElement="Flow_Goo_BoasVindas">
        <di:waypoint x="970" y="2210" />
        <di:waypoint x="1010" y="2210" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Recuperacao_di" bpmnElement="Flow_Goo_Recuperacao">
        <di:waypoint x="970" y="2540" />
        <di:waypoint x="1070" y="2540" />
        <di:waypoint x="1070" y="2320" />
        <di:waypoint x="1100" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Check24h_di" bpmnElement="Flow_Goo_Check24h">
        <di:waypoint x="1046" y="2210" />
        <di:waypoint x="1090" y="2210" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_NaoMandou_di" bpmnElement="Flow_Goo_NaoMandou">
        <di:waypoint x="1140" y="2210" />
        <di:waypoint x="1180" y="2210" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Mandou_di" bpmnElement="Flow_Goo_Mandou">
        <di:waypoint x="1115" y="2185" />
        <di:waypoint x="1115" y="2155" />
        <di:waypoint x="1350" y="2155" />
        <di:waypoint x="1350" y="2192" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Alerta_di" bpmnElement="Flow_Goo_Alerta">
        <di:waypoint x="1280" y="2210" />
        <di:waypoint x="1332" y="2210" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Zap_di" bpmnElement="Flow_Goo_Zap">
        <di:waypoint x="395" y="2345" />
        <di:waypoint x="395" y="2430" />
        <di:waypoint x="500" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Zap_1_di" bpmnElement="Flow_Goo_Zap_1">
        <di:waypoint x="600" y="2430" />
        <di:waypoint x="640" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Zap_2_di" bpmnElement="Flow_Goo_Zap_2">
        <di:waypoint x="740" y="2430" />
        <di:waypoint x="780" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Zap_3_di" bpmnElement="Flow_Goo_Zap_3">
        <di:waypoint x="880" y="2430" />
        <di:waypoint x="920" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_ToGatewayTrial_di" bpmnElement="Flow_Goo_ToGatewayTrial">
        <di:waypoint x="1020" y="2430" />
        <di:waypoint x="1050" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Trial_Sim_di" bpmnElement="Flow_Goo_Trial_Sim">
        <di:waypoint x="1075" y="2455" />
        <di:waypoint x="1075" y="2600" />
        <di:waypoint x="1010" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Trial_Nao_di" bpmnElement="Flow_Goo_Trial_Nao">
        <di:waypoint x="1100" y="2430" />
        <di:waypoint x="1200" y="2430" />
        <di:waypoint x="1200" y="2320" />
        <di:waypoint x="1750" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Trial_End_di" bpmnElement="Flow_Goo_Trial_End">
        <di:waypoint x="2550" y="2600" />
        <di:waypoint x="2570" y="2600" />
        <di:waypoint x="2570" y="2360" />
      </bpmndi:BPMNEdge>
      <!-- Sub-processo Trial edges internas -->
      <bpmndi:BPMNEdge id="Flow_Trial_D0_di" bpmnElement="Flow_Trial_D0">
        <di:waypoint x="1066" y="2600" />
        <di:waypoint x="1090" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D0_D1_di" bpmnElement="Flow_Trial_D0_D1">
        <di:waypoint x="1190" y="2600" />
        <di:waypoint x="1212" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_Check_di" bpmnElement="Flow_Trial_D1_Check">
        <di:waypoint x="1248" y="2600" />
        <di:waypoint x="1270" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_Sim_di" bpmnElement="Flow_Trial_D1_Sim">
        <di:waypoint x="1295" y="2575" />
        <di:waypoint x="1295" y="2550" />
        <di:waypoint x="1345" y="2550" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_Nao_di" bpmnElement="Flow_Trial_D1_Nao">
        <di:waypoint x="1295" y="2625" />
        <di:waypoint x="1295" y="2660" />
        <di:waypoint x="1345" y="2660" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_Merge_di" bpmnElement="Flow_Trial_D1_Merge">
        <di:waypoint x="1445" y="2550" />
        <di:waypoint x="1495" y="2550" />
        <di:waypoint x="1495" y="2575" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_Merge2_di" bpmnElement="Flow_Trial_D1_Merge2">
        <di:waypoint x="1445" y="2660" />
        <di:waypoint x="1495" y="2660" />
        <di:waypoint x="1495" y="2625" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D1_D2_di" bpmnElement="Flow_Trial_D1_D2">
        <di:waypoint x="1520" y="2600" />
        <di:waypoint x="1542" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D2_Start_di" bpmnElement="Flow_Trial_D2_Start">
        <di:waypoint x="1578" y="2600" />
        <di:waypoint x="1600" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D2_D3_di" bpmnElement="Flow_Trial_D2_D3">
        <di:waypoint x="1700" y="2600" />
        <di:waypoint x="1722" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_Check_di" bpmnElement="Flow_Trial_D3_Check">
        <di:waypoint x="1758" y="2600" />
        <di:waypoint x="1780" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_Sim_di" bpmnElement="Flow_Trial_D3_Sim">
        <di:waypoint x="1805" y="2575" />
        <di:waypoint x="1805" y="2550" />
        <di:waypoint x="1855" y="2550" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_Nao_di" bpmnElement="Flow_Trial_D3_Nao">
        <di:waypoint x="1805" y="2625" />
        <di:waypoint x="1805" y="2660" />
        <di:waypoint x="1855" y="2660" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_Merge1_di" bpmnElement="Flow_Trial_D3_Merge1">
        <di:waypoint x="1955" y="2550" />
        <di:waypoint x="2005" y="2550" />
        <di:waypoint x="2005" y="2575" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_Merge2_di" bpmnElement="Flow_Trial_D3_Merge2">
        <di:waypoint x="1955" y="2660" />
        <di:waypoint x="2005" y="2660" />
        <di:waypoint x="2005" y="2625" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D3_D5_di" bpmnElement="Flow_Trial_D3_D5">
        <di:waypoint x="2030" y="2600" />
        <di:waypoint x="2052" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D5_Start_di" bpmnElement="Flow_Trial_D5_Start">
        <di:waypoint x="2088" y="2600" />
        <di:waypoint x="2110" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D5_D6_di" bpmnElement="Flow_Trial_D5_D6">
        <di:waypoint x="2210" y="2600" />
        <di:waypoint x="2232" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D6_Start_di" bpmnElement="Flow_Trial_D6_Start">
        <di:waypoint x="2268" y="2600" />
        <di:waypoint x="2290" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D6_D7_di" bpmnElement="Flow_Trial_D6_D7">
        <di:waypoint x="2390" y="2600" />
        <di:waypoint x="2412" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Trial_D7_End_di" bpmnElement="Flow_Trial_D7_End">
        <di:waypoint x="2448" y="2600" />
        <di:waypoint x="2472" y="2600" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D0_Lig1_di" bpmnElement="Flow_Goo_D0_Lig1">
        <di:waypoint x="1330" y="2320" />
        <di:waypoint x="1380" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D0_Atendeu_di" bpmnElement="Flow_Goo_D0_Atendeu">
        <di:waypoint x="1430" y="2320" />
        <di:waypoint x="1480" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D0_NaoAtendeu_di" bpmnElement="Flow_Goo_D0_NaoAtendeu">
        <di:waypoint x="1405" y="2345" />
        <di:waypoint x="1405" y="2430" />
        <di:waypoint x="1480" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D0_Qualificou_di" bpmnElement="Flow_Goo_D0_Qualificou">
        <di:waypoint x="1580" y="2320" />
        <di:waypoint x="1750" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D0_Zap1_di" bpmnElement="Flow_Goo_D0_Zap1">
        <di:waypoint x="1580" y="2430" />
        <di:waypoint x="1620" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D0_Zap2_di" bpmnElement="Flow_Goo_D0_Zap2">
        <di:waypoint x="1720" y="2430" />
        <di:waypoint x="1740" y="2430" />
        <di:waypoint x="1740" y="2320" />
        <di:waypoint x="1750" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D0_Merge_di" bpmnElement="Flow_Goo_D0_Merge">
        <di:waypoint x="1800" y="2320" />
        <di:waypoint x="1880" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D1_Zap3_di" bpmnElement="Flow_Goo_D1_Zap3">
        <di:waypoint x="1980" y="2320" />
        <di:waypoint x="2020" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D1_Lig2_di" bpmnElement="Flow_Goo_D1_Lig2">
        <di:waypoint x="2120" y="2320" />
        <di:waypoint x="2160" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D3_Zap4_di" bpmnElement="Flow_Goo_D3_Zap4">
        <di:waypoint x="2260" y="2320" />
        <di:waypoint x="2300" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D5_Zap5_di" bpmnElement="Flow_Goo_D5_Zap5">
        <di:waypoint x="2400" y="2320" />
        <di:waypoint x="2440" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D5_Lig3_di" bpmnElement="Flow_Goo_D5_Lig3">
        <di:waypoint x="2540" y="2320" />
        <di:waypoint x="2580" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_D7_di" bpmnElement="Flow_Goo_D7">
        <di:waypoint x="2680" y="2320" />
        <di:waypoint x="2720" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Converteu_Sim_di" bpmnElement="Flow_Goo_Converteu_Sim">
        <di:waypoint x="2770" y="2320" />
        <di:waypoint x="2830" y="2320" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Converteu_Nao_di" bpmnElement="Flow_Goo_Converteu_Nao">
        <di:waypoint x="2745" y="2345" />
        <di:waypoint x="2745" y="2430" />
        <di:waypoint x="2830" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Breakup_di" bpmnElement="Flow_Goo_Breakup">
        <di:waypoint x="2930" y="2430" />
        <di:waypoint x="2972" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Check_Breakup_di" bpmnElement="Flow_Goo_Check_Breakup">
        <di:waypoint x="3008" y="2430" />
        <di:waypoint x="3050" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Respondeu_Sim_di" bpmnElement="Flow_Goo_Respondeu_Sim">
        <di:waypoint x="3100" y="2430" />
        <di:waypoint x="3140" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Respondeu_Nao_di" bpmnElement="Flow_Goo_Respondeu_Nao">
        <di:waypoint x="3075" y="2455" />
        <di:waypoint x="3075" y="2540" />
        <di:waypoint x="3140" y="2540" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Nurturing_di" bpmnElement="Flow_Goo_Nurturing">
        <di:waypoint x="3240" y="2430" />
        <di:waypoint x="3282" y="2430" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_Goo_Motivo_di" bpmnElement="Flow_Goo_Motivo">
        <di:waypoint x="3240" y="2540" />
        <di:waypoint x="3282" y="2540" />
      </bpmndi:BPMNEdge>
      <!-- Meta edges -->
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Start" bpmnElement="Flow_Meta_Start">
        <di:waypoint x="268" y="2870" />
        <di:waypoint x="355" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Filtro" bpmnElement="Flow_Meta_Filtro">
        <di:waypoint x="455" y="2870" />
        <di:waypoint x="510" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D0_Zap" bpmnElement="Flow_Meta_D0_Zap">
        <di:waypoint x="610" y="2870" />
        <di:waypoint x="665" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_FlashDemo" bpmnElement="Flow_Meta_FlashDemo">
        <di:waypoint x="765" y="2870" />
        <di:waypoint x="845" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Interessado_Sim" bpmnElement="Flow_Meta_Interessado_Sim">
        <di:waypoint x="895" y="2870" />
        <di:waypoint x="1000" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Interessado_Nao" bpmnElement="Flow_Meta_Interessado_Nao">
        <di:waypoint x="895" y="2870" />
        <di:waypoint x="1130" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Fechou_Sim" bpmnElement="Flow_Meta_Fechou_Sim">
        <di:waypoint x="1050" y="2870" />
        <di:waypoint x="2092" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Fechou_Nao" bpmnElement="Flow_Meta_Fechou_Nao">
        <di:waypoint x="1050" y="2870" />
        <di:waypoint x="1130" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D1" bpmnElement="Flow_Meta_D1">
        <di:waypoint x="1230" y="2870" />
        <di:waypoint x="1285" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D3" bpmnElement="Flow_Meta_D3">
        <di:waypoint x="1385" y="2870" />
        <di:waypoint x="1440" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D6" bpmnElement="Flow_Meta_D6">
        <di:waypoint x="1540" y="2870" />
        <di:waypoint x="1595" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D9" bpmnElement="Flow_Meta_D9">
        <di:waypoint x="1695" y="2870" />
        <di:waypoint x="1750" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_D14" bpmnElement="Flow_Meta_D14">
        <di:waypoint x="1850" y="2870" />
        <di:waypoint x="1930" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Converteu_Sim" bpmnElement="Flow_Meta_Converteu_Sim">
        <di:waypoint x="1980" y="2870" />
        <di:waypoint x="2092" y="2870" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Converteu_Nao" bpmnElement="Flow_Meta_Converteu_Nao">
        <di:waypoint x="1955" y="2895" />
        <di:waypoint x="1955" y="2962" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Timer24h" bpmnElement="Flow_Meta_Timer24h">
        <di:waypoint x="1973" y="2980" />
        <di:waypoint x="2085" y="2980" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Respondeu_Sim" bpmnElement="Flow_Meta_Respondeu_Sim">
        <di:waypoint x="2135" y="2980" />
        <di:waypoint x="2215" y="2980" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Respondeu_Nao" bpmnElement="Flow_Meta_Respondeu_Nao">
        <di:waypoint x="2135" y="2980" />
        <di:waypoint x="2165" y="2980" />
        <di:waypoint x="2165" y="3090" />
        <di:waypoint x="2215" y="3090" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Nurturing" bpmnElement="Flow_Meta_Nurturing">
        <di:waypoint x="2315" y="2980" />
        <di:waypoint x="2402" y="2980" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Meta_Motivo" bpmnElement="Flow_Meta_Motivo">
        <di:waypoint x="2315" y="3090" />
        <di:waypoint x="2402" y="3090" />
      </bpmndi:BPMNEdge>

      <!-- Nucleo edges -->
      <bpmndi:BPMNEdge id="Edge_Flow_Nucleo_Entrada" bpmnElement="Flow_Nucleo_Entrada">
        <di:waypoint x="268" y="3330" />
        <di:waypoint x="380" y="3330" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Para_Anual" bpmnElement="Flow_Para_Anual">
        <di:waypoint x="430" y="3190" />
        <di:waypoint x="510" y="3190" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Anual_Para_Gateway" bpmnElement="Flow_Anual_Para_Gateway">
        <di:waypoint x="610" y="3190" />
        <di:waypoint x="690" y="3190" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Anual_Aprovado" bpmnElement="Flow_Anual_Aprovado">
        <di:waypoint x="740" y="3190" />
        <di:waypoint x="820" y="3190" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Anual_Recusado" bpmnElement="Flow_Anual_Recusado">
        <di:waypoint x="715" y="3215" />
        <di:waypoint x="715" y="3260" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Split_Para_Onboarding" bpmnElement="Flow_Split_Para_Onboarding">
        <di:waypoint x="920" y="3190" />
        <di:waypoint x="975" y="3190" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Para_Cliente_Ativo" bpmnElement="Flow_Para_Cliente_Ativo">
        <di:waypoint x="1075" y="3190" />
        <di:waypoint x="1162" y="3190" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Falha_Para_WhatsApp" bpmnElement="Flow_Falha_Para_WhatsApp">
        <di:waypoint x="765" y="3300" />
        <di:waypoint x="820" y="3300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_WhatsApp_Para_Semestral" bpmnElement="Flow_WhatsApp_Para_Semestral">
        <di:waypoint x="920" y="3300" />
        <di:waypoint x="975" y="3300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Semestral_Para_Gateway" bpmnElement="Flow_Semestral_Para_Gateway">
        <di:waypoint x="1075" y="3300" />
        <di:waypoint x="1155" y="3300" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Semestral_Aprovado" bpmnElement="Flow_Semestral_Aprovado">
        <di:waypoint x="1180" y="3275" />
        <di:waypoint x="1180" y="3239" />
        <di:waypoint x="1025" y="3239" />
        <di:waypoint x="1025" y="3230" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Semestral_Recusado" bpmnElement="Flow_Semestral_Recusado">
        <di:waypoint x="1180" y="3325" />
        <di:waypoint x="1180" y="3392" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Timer_Para_Vendedor" bpmnElement="Flow_Timer_Para_Vendedor">
        <di:waypoint x="1198" y="3410" />
        <di:waypoint x="1285" y="3410" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Vendedor_Para_Trimestral" bpmnElement="Flow_Vendedor_Para_Trimestral">
        <di:waypoint x="1385" y="3410" />
        <di:waypoint x="1440" y="3410" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Trimestral_Para_Gateway" bpmnElement="Flow_Trimestral_Para_Gateway">
        <di:waypoint x="1540" y="3410" />
        <di:waypoint x="1620" y="3410" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Trimestral_Aprovado" bpmnElement="Flow_Trimestral_Aprovado">
        <di:waypoint x="1645" y="3385" />
        <di:waypoint x="1645" y="3349" />
        <di:waypoint x="1025" y="3349" />
        <di:waypoint x="1025" y="3230" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Edge_Flow_Trimestral_Recusado" bpmnElement="Flow_Trimestral_Recusado">
        <di:waypoint x="1670" y="3410" />
        <di:waypoint x="1782" y="3410" />
      </bpmndi:BPMNEdge>

    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>

</bpmn2:definitions>`;

export default COMERCIAL_V9_COMPLETE_XML;
export const COMERCIAL_DIAGRAM_XML = COMERCIAL_V9_COMPLETE_XML;

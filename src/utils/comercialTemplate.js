/**
 * Template BPMN do Fluxo Comercial Fyness
 * 5 Raias: Marketing, Automações, Vendas, Trial/Onboarding, Gateway Financeiro
 *
 * FLUXO CORRETO:
 * 1. Lead entra → Qualificação → Demo → Aceita Trial?
 * 2. Trial 7 dias GRATUITO → Onboarding → Nurturing
 * 3. Fim do Trial → Cobrança → Pagamento aprovado?
 * 4. Se aprovado → Cliente ativo | Se recusado → Dunning → Lost ou Converteu
 */

export const COMERCIAL_DIAGRAM_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
  xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
  id="Definitions_Comercial"
  targetNamespace="http://fyness.com/bpmn/comercial">

  <bpmn2:collaboration id="Collaboration_Comercial">
    <bpmn2:participant id="Participant_Comercial" name="Fluxo Comercial Fyness" processRef="Process_Comercial" />
  </bpmn2:collaboration>

  <bpmn2:process id="Process_Comercial" isExecutable="false">

    <!-- RAIA 1: Marketing e Canais de Entrada -->
    <bpmn2:laneSet id="LaneSet_1">
      <bpmn2:lane id="Lane_Marketing" name="Marketing e Canais de Entrada">
        <bpmn2:flowNodeRef>Start_Parceiros</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Start_Google</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Start_Meta</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_Roteamento</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_LP</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_WhatsApp</bpmn2:flowNodeRef>
      </bpmn2:lane>

      <!-- RAIA 2: Automações de Sistema -->
      <bpmn2:lane id="Lane_Automacoes" name="Automacoes de Sistema">
        <bpmn2:flowNodeRef>Auto_CRM</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Auto_SpeedLead</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Auto_Distribuicao</bpmn2:flowNodeRef>
      </bpmn2:lane>

      <!-- RAIA 3: Vendas / SDR -->
      <bpmn2:lane id="Lane_Vendas" name="Vendas / SDR">
        <bpmn2:flowNodeRef>Task_Diagnostico</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_Qualificacao</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_Demo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_AceitaTrial</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>End_NaoInteressado</bpmn2:flowNodeRef>
      </bpmn2:lane>

      <!-- RAIA 4: Trial e Onboarding (7 dias gratuitos) -->
      <bpmn2:lane id="Lane_Trial" name="Trial e Onboarding (7 dias gratuitos)">
        <bpmn2:flowNodeRef>Auto_Ativacao</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_PrimeiroLancamento</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Auto_Nurturing</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Auto_AlertaChurn</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Task_ResgateChurn</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Timer_FimTrial</bpmn2:flowNodeRef>
      </bpmn2:lane>

      <!-- RAIA 5: Gateway Financeiro - Asaas (após trial) -->
      <bpmn2:lane id="Lane_Gateway" name="Gateway Financeiro - Asaas (apos trial)">
        <bpmn2:flowNodeRef>Task_Vitrine</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Gateway_Pagamento</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Auto_AntiRecusa</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Auto_Dunning</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>Auto_Split</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>End_ClienteAtivo</bpmn2:flowNodeRef>
        <bpmn2:flowNodeRef>End_Perdido</bpmn2:flowNodeRef>
      </bpmn2:lane>
    </bpmn2:laneSet>

    <!-- ========== ELEMENTOS RAIA 1: Marketing ========== -->
    <bpmn2:startEvent id="Start_Parceiros" name="Parceiros (Contadores, Maquininhas)">
      <bpmn2:documentation>CANAL DE ENTRADA: Leads vindos de parceiros estratégicos como escritórios de contabilidade e empresas de maquininhas. Geralmente leads mais qualificados por indicação.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_P1</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:startEvent id="Start_Google" name="Google Ads e Organico">
      <bpmn2:documentation>CANAL DE ENTRADA: Leads vindos de campanhas Google Ads (busca paga) e tráfego orgânico (SEO). Leads com intenção de busca ativa por solução.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_G1</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:startEvent id="Start_Meta" name="Meta Ads (Facebook/Instagram)">
      <bpmn2:documentation>CANAL DE ENTRADA: Leads vindos de campanhas Meta (Facebook e Instagram Ads). Leads de descoberta - podem não conhecer a solução ainda.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_M1</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:exclusiveGateway id="Gateway_Roteamento" name="Roteamento Inteligente">
      <bpmn2:documentation>DECISÃO: Roteia o lead para o canal de conversão mais adequado baseado na origem:
- Google/Orgânico → Landing Page (lead mais quente, busca ativa)
- Meta/Parceiros → WhatsApp (lead mais frio, precisa de relacionamento)</bpmn2:documentation>
      <bpmn2:incoming>Flow_P1</bpmn2:incoming>
      <bpmn2:incoming>Flow_G1</bpmn2:incoming>
      <bpmn2:incoming>Flow_M1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_ToLP</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_ToWhats</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:task id="Task_LP" name="Landing Page (Conversao)">
      <bpmn2:documentation>CONVERSÃO: Landing page otimizada para conversão. Formulário curto (nome, email, telefone, empresa). CTA: "Testar 7 dias grátis". Taxa de conversão esperada: 15-25%.</bpmn2:documentation>
      <bpmn2:incoming>Flow_ToLP</bpmn2:incoming>
      <bpmn2:outgoing>Flow_LP_CRM</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_WhatsApp" name="WhatsApp Comercial">
      <bpmn2:documentation>CONVERSÃO: Atendimento via WhatsApp Business. Lead vem direto, já quer saber mais.

📋 FLUXO WHATSAPP DIRETO:
1. Entender a dor (Diagnóstico)
2. Fazer demonstração (Momento Mágico IA)
3. Mostrar preço
4. Oferecer Trial

💬 SCRIPT INICIAL:
"Oi [Nome]! Tudo bem? Vi que você se interessou pelo Fyness! 🎯
Antes de te mostrar tudo que a gente faz, me conta: qual é o maior desafio que você enfrenta hoje no seu negócio?"

(Aguardar resposta - entender a dor antes de seguir)</bpmn2:documentation>
      <bpmn2:incoming>Flow_ToWhats</bpmn2:incoming>
      <bpmn2:outgoing>Flow_WA_CRM</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ========== ELEMENTOS RAIA 2: Automações ========== -->
    <bpmn2:serviceTask id="Auto_CRM" name="[ROBO] Registro no CRM">
      <bpmn2:documentation>AUTOMAÇÃO: Lead é registrado automaticamente no CRM com todos os dados capturados. Tags aplicadas baseado na origem. Integração via API/Webhook.</bpmn2:documentation>
      <bpmn2:incoming>Flow_LP_CRM</bpmn2:incoming>
      <bpmn2:incoming>Flow_WA_CRM</bpmn2:incoming>
      <bpmn2:outgoing>Flow_CRM_Speed</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Auto_SpeedLead" name="[ROBO] Speed to Lead (1 min)">
      <bpmn2:documentation>AUTOMAÇÃO CRÍTICA: Contato automático em até 1 minuto após cadastro. Estudos mostram que resposta em 1 min aumenta conversão em 391%. SMS/WhatsApp automático.</bpmn2:documentation>
      <bpmn2:incoming>Flow_CRM_Speed</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Speed_Dist</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Auto_Distribuicao" name="[ROBO] Distribuicao Round-Robin">
      <bpmn2:documentation>AUTOMAÇÃO: Distribui leads entre os SDRs disponíveis de forma equilibrada (round-robin). Considera carga de trabalho e especialidade por origem/segmento.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Speed_Dist</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Dist_Vendas</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <!-- ========== ELEMENTOS RAIA 3: Vendas ========== -->
    <bpmn2:userTask id="Task_Diagnostico" name="Diagnostico de Dor">
      <bpmn2:documentation>VENDAS - ETAPA 1: Entender a dor antes de mostrar qualquer coisa.

📋 OBJETIVO: Fazer o lead falar sobre os problemas dele. Quanto mais ele falar, mais engajado fica.

💬 SCRIPT DIAGNÓSTICO:
"Me conta mais... qual é o maior desafio que você enfrenta hoje no seu negócio?"

(Aguardar resposta - ESCUTAR)

Perguntas de aprofundamento:
• "E isso te atrapalha como no dia a dia?"
• "Quanto tempo você perde com isso por semana?"
• "Como você resolve isso hoje?"
• "O que acontece quando você não consegue resolver?"

🎯 IDENTIFICAR A DOR PRINCIPAL:
- Falta de tempo / produtividade
- Desorganização financeira
- Dificuldade em cobrar clientes
- Não sabe quanto está ganhando
- Medo de multa fiscal

Quando identificar a dor: "Entendi! Deixa eu te mostrar uma coisa que vai resolver exatamente isso..."</bpmn2:documentation>
      <bpmn2:incoming>Flow_Dist_Vendas</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Diag_Qual</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_Qualificacao" name="Qualificacao (3 Perguntas)">
      <bpmn2:documentation>VENDAS - ETAPA 2: Qualificar rapidamente para não perder tempo.

📋 OBJETIVO: Descobrir se vale a pena fazer demo ou se o lead não tem perfil.

💬 SCRIPT QUALIFICAÇÃO (rápido, natural):
Depois de ouvir a dor, perguntar de forma casual:

1. "E você já usa alguma ferramenta pra isso hoje? Ou é tudo na mão/planilha?"
   → Identifica se investe em soluções

2. "Legal! E você que resolve essas coisas do negócio ou tem mais alguém junto?"
   → Identifica se decide sozinho

3. "Entendi! E essa dificuldade que você me contou, tá urgente resolver ou dá pra esperar?"
   → Identifica timing

🎯 CRITÉRIO:
Se 2+ respostas positivas → Fazer Demo
Se lead claramente não tem perfil → "Vou te mandar um material por email pra você ver com calma!"

⚠️ NÃO PERDER TEMPO COM:
- Quem não decide nada
- Quem não investe em nada
- Quem "só tá olhando" sem dor real</bpmn2:documentation>
      <bpmn2:incoming>Flow_Diag_Qual</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Qual_Demo</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:userTask id="Task_Demo" name="Demonstracao (Momento Magico)">
      <bpmn2:documentation>VENDAS - ETAPA 3: Demonstração focada no "Momento Mágico" - a IA processando áudio.

📋 OBJETIVO: Mostrar o WOW moment - a IA fazendo algo impressionante em segundos.

💬 SCRIPT DEMO:
"Olha só, vou te mostrar uma coisa que vai mudar sua vida...

Vou gravar um áudio agora falando sobre uma venda fictícia, e você vai ver a mágica acontecer!"

(Gravar áudio: "Vendi um produto de R$150 para o João, ele pagou no PIX")

"Pronto! Olha o que a IA fez em segundos:
✅ Identificou que foi uma venda
✅ Pegou o valor: R$150
✅ Pegou o cliente: João
✅ Registrou a forma de pagamento: PIX
✅ Já lançou no seu fluxo de caixa!"

🔥 MOMENTO MÁGICO:
"Entendeu? Você só fala... e pronto. Acabou a digitação, acabou a planilha, acabou o esquecimento.

Imagina no final do mês ter TUDO registrado, só porque você mandou uns áudios?"

(Pausar - deixar o lead reagir)

"Quanto tempo você gasta hoje fazendo isso na mão?"

(Transição para preço depois da reação positiva)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Qual_Demo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Demo_Gateway</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:exclusiveGateway id="Gateway_AceitaTrial" name="Aceita Trial Gratuito?">
      <bpmn2:documentation>DECISÃO: Após mostrar preço, verificar se aceita o trial gratuito.

💬 SCRIPT APRESENTAÇÃO DE PREÇO (após demo):
"Gostou? Então deixa eu te falar como funciona...

O Fyness custa R$197 por mês.

Mas se você fechar anual, sai R$137 por mês - você economiza mais de R$700 no ano!

MAS... antes de você decidir qualquer coisa, eu quero que você TESTE de verdade.

🎁 OFERTA TRIAL:
Você pode testar 7 dias completamente GRÁTIS.
Sem cartão. Sem compromisso. Sem pegadinha.

Usa esses 7 dias pra ver se faz sentido pra você.

No sétimo dia, se você gostar, aí a gente conversa sobre pagamento.
Se não gostar... vida que segue, sem stress! 😄"

💬 FECHAMENTO:
"Bora testar? Me passa seu email que eu já crio sua conta agora!"

OBJEÇÕES COMUNS:
• "Vou pensar" → "Pensar no que? O teste é grátis! Testa e pensa com calma durante os 7 dias"
• "Não sei se vou usar" → "Por isso o teste! Você só decide depois de experimentar"
• "Depois eu vejo" → "Qual o melhor email pra eu te mandar? Assim você testa quando tiver um tempinho"

- Sim → Iniciar onboarding imediatamente
- Não → Marcar para follow-up em 30 dias</bpmn2:documentation>
      <bpmn2:incoming>Flow_Demo_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_AceitaTrial</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_NaoAceitaTrial</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:task id="Task_NaoInteressado" name="Lead Hesitante">
      <bpmn2:documentation>DECISÃO: Lead não aceitou trial imediatamente. Iniciar régua de follow-up automatizada para recuperação.</bpmn2:documentation>
      <bpmn2:incoming>Flow_NaoAceitaTrial</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Hesitante_FU24h</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ========== RÉGUA DE FOLLOW-UP: NÃO ACEITOU TRIAL ========== -->
    <bpmn2:serviceTask id="Auto_FollowUp24h" name="[ROBO] Follow-up 24h">
      <bpmn2:documentation>FOLLOW-UP 1 (24h após demo):

💬 SCRIPT:
"Oi [Nome]! Tudo bem?

Ontem conversamos sobre o Fyness e ficou alguma dúvida?

Me conta, posso te ajudar com algo específico?"

🎯 OBJETIVO: Quebrar o gelo, identificar objeções ocultas
⏰ TIMING: 24 horas após não aceitar trial
📊 Taxa de resposta esperada: 15-20%</bpmn2:documentation>
      <bpmn2:incoming>Flow_Hesitante_FU24h</bpmn2:incoming>
      <bpmn2:outgoing>Flow_FU24h_FU3d</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Auto_FollowUp3d" name="[ROBO] Follow-up 3 dias">
      <bpmn2:documentation>FOLLOW-UP 2 (3 dias após demo):

💬 SCRIPT:
"[Nome], lembrei de você hoje!

Sabe por quê? Um cliente nosso tinha exatamente o mesmo desafio que você me contou (sobre [dor identificada]).

Ele começou a usar semana passada e já economizou 5 horas de trabalho!

Quer que eu te conte como?"

🎯 OBJETIVO: Social proof, relembrar a dor, oferecer valor
⏰ TIMING: 3 dias após não aceitar
📊 Taxa de resposta esperada: 10-15%</bpmn2:documentation>
      <bpmn2:incoming>Flow_FU24h_FU3d</bpmn2:incoming>
      <bpmn2:outgoing>Flow_FU3d_FU7d</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Auto_FollowUp7d" name="[ROBO] Follow-up 7 dias">
      <bpmn2:documentation>FOLLOW-UP 3 (7 dias após demo):

💬 SCRIPT:
"[Nome], último recado! 😄

Tô abrindo algumas vagas pro teste gratuito essa semana.

Se você quiser garantir a sua, é só me avisar!

Ah, e preparei um BÔNUS exclusivo pra você: além dos 7 dias grátis, vou liberar [feature premium] no seu trial.

Bora?"

🎯 OBJETIVO: Criar urgência, oferecer incentivo extra
⏰ TIMING: 7 dias após não aceitar
📊 Taxa de conversão esperada: 5-8%</bpmn2:documentation>
      <bpmn2:incoming>Flow_FU3d_FU7d</bpmn2:incoming>
      <bpmn2:outgoing>Flow_FU7d_FU30d</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Auto_FollowUp30d" name="[ROBO] Follow-up 30 dias">
      <bpmn2:documentation>FOLLOW-UP 4 (30 dias após demo):

💬 SCRIPT:
"E aí, [Nome]! Faz tempo ein!

Muita coisa mudou por aqui no Fyness desde que a gente conversou:
✅ Novidade 1
✅ Novidade 2
✅ Case novo de sucesso

Vale a pena você dar uma olhada de novo.

O teste continua grátis por 7 dias, sem cartão!

Que tal marcarmos 15 min pra eu te mostrar as novidades?"

🎯 OBJETIVO: Re-engajar com novidades, nova abordagem
⏰ TIMING: 30 dias após não aceitar
📊 Taxa de resposta esperada: 3-5%</bpmn2:documentation>
      <bpmn2:incoming>Flow_FU7d_FU30d</bpmn2:incoming>
      <bpmn2:outgoing>Flow_FU30d_Gateway</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:exclusiveGateway id="Gateway_Reengajou" name="Reengajou?">
      <bpmn2:documentation>DECISÃO: Verificar se lead respondeu e quer testar:
- Sim → Redirecionar para aceitar trial (volta pro Gateway_AceitaTrial)
- Não → Enviar para nurturing de longo prazo</bpmn2:documentation>
      <bpmn2:incoming>Flow_FU30d_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Reengajou_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Reengajou_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:endEvent id="End_NurturingLongoPrazo" name="Nurturing Longo Prazo">
      <bpmn2:documentation>FIM DA RÉGUA ATIVA: Lead não respondeu aos follow-ups.

🔄 PRÓXIMOS PASSOS:
- Adicionar à lista de email marketing (newsletter)
- Remarketing ads no Meta/Google
- Follow-up passivo em 60/90/180 dias
- Pode ser reativado manualmente pela equipe

💡 APRENDIZADO: Analisar padrão de não-conversão para melhorar qualificação</bpmn2:documentation>
      <bpmn2:incoming>Flow_Reengajou_Nao</bpmn2:incoming>
    </bpmn2:endEvent>

    <!-- ========== ELEMENTOS RAIA 4: Trial e Onboarding ========== -->
    <bpmn2:serviceTask id="Auto_Ativacao" name="[ROBO] Ativacao Instantanea (D0)">
      <bpmn2:documentation>AUTOMAÇÃO ONBOARDING: Ativação imediata do trial gratuito:
- Criação de conta automática
- Email de boas-vindas com credenciais
- WhatsApp com link de acesso
- Trial de 7 dias inicia HOJE
- SEM cobrança ainda!</bpmn2:documentation>
      <bpmn2:incoming>Flow_AceitaTrial</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Ativacao_Primeiro</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:userTask id="Task_PrimeiroLancamento" name="Primeiro Lancamento Assistido (5 min)">
      <bpmn2:documentation>ONBOARDING - ETAPA CRÍTICA: Garantir que cliente faça o primeiro lançamento com sucesso em até 5 minutos. CS acompanha por WhatsApp/call. Métrica chave: Time to First Value.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Ativacao_Primeiro</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Primeiro_Nurturing</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:serviceTask id="Auto_Nurturing" name="[ROBO] Nurturing Trial (Dias 1, 3, 5)">
      <bpmn2:documentation>AUTOMAÇÃO ENGAJAMENTO DURANTE TRIAL:
- Dia 1: Dica de funcionalidade principal
- Dia 3: Case de sucesso similar
- Dia 5: "Faltam 2 dias! Já viu tudo que pode fazer?"
Objetivo: maximizar uso durante trial</bpmn2:documentation>
      <bpmn2:incoming>Flow_Primeiro_Nurturing</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Nurturing_Churn</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Auto_AlertaChurn" name="[ROBO] Alerta Inatividade (48h sem uso)">
      <bpmn2:documentation>AUTOMAÇÃO PREVENÇÃO DURANTE TRIAL: Detecta usuários inativos por 48h e dispara:
- Email: "Precisa de ajuda?"
- WhatsApp: Pergunta aberta
- Notificação interna para CS
Se continuar inativo → Ligar</bpmn2:documentation>
      <bpmn2:incoming>Flow_Nurturing_Churn</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Churn_Resgate</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:userTask id="Task_ResgateChurn" name="Ligacao de Resgate (CS)">
      <bpmn2:documentation>CS - RESGATE DURANTE TRIAL: Ligação para usuários inativos:
- Entender dificuldades
- Oferecer onboarding adicional
- Mostrar valor que está perdendo
Objetivo: reativar antes do fim do trial</bpmn2:documentation>
      <bpmn2:incoming>Flow_Churn_Resgate</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Resgate_Timer</bpmn2:outgoing>
    </bpmn2:userTask>

    <bpmn2:intermediateCatchEvent id="Timer_FimTrial" name="Dia 7 - Fim do Trial">
      <bpmn2:documentation>EVENTO DE TEMPO: No 7º dia, o trial gratuito termina. Sistema dispara:
- Email: "Seu trial terminou! Continue usando por R$X"
- WhatsApp: Link para pagamento
- Iniciar processo de cobrança</bpmn2:documentation>
      <bpmn2:incoming>Flow_Resgate_Timer</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Timer_Vitrine</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <!-- ========== ELEMENTOS RAIA 5: Gateway Financeiro ========== -->
    <bpmn2:task id="Task_Vitrine" name="Vitrine Binaria (Anual R$ 1.497 / Mensal R$ 197)">
      <bpmn2:documentation>PAGAMENTO - VITRINE PÓS-TRIAL: Conversão no Dia 7.

💬 SCRIPT CONVERSÃO (Dia 7):
"E aí, [Nome]! Tudo bem? 😄

Seus 7 dias de teste terminaram hoje!

Me conta: o que você achou? Conseguiu usar bastante?"

(Aguardar resposta)

SE GOSTOU:
"Que bom! Então bora continuar?

Deixa eu te relembrar as opções:

📌 ANUAL: R$ 1.497 (dá R$125/mês)
   → Você economiza R$867 no ano!
   → É o mais vantajoso de longe

📌 MENSAL: R$197/mês
   → Sem compromisso longo

Qual faz mais sentido pra você?"

SE HESITAR:
"Olha, se o anual tá pesado agora, posso fazer TRIMESTRAL por R$561 (R$187/mês). Assim você testa mais 3 meses sem o compromisso do ano todo."

💳 FORMAS DE PAGAMENTO:
- Cartão de crédito (até 12x)
- PIX com 10% de desconto
- Boleto

🎯 ANCORAGEM: Sempre mostrar ANUAL primeiro!</bpmn2:documentation>
      <bpmn2:incoming>Flow_Timer_Vitrine</bpmn2:incoming>
      <bpmn2:incoming>Flow_AntiRecusa_Vitrine</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Vitrine_Pag</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Pagamento" name="Pagamento aprovado?">
      <bpmn2:documentation>DECISÃO: Verificar resultado do processamento de pagamento:
- Aprovado → Processar split e manter cliente ativo
- Recusado → Tentar recuperar com anti-recusa</bpmn2:documentation>
      <bpmn2:incoming>Flow_Vitrine_Pag</bpmn2:incoming>
      <bpmn2:outgoing>Flow_PagOk</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_PagFalhou</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:serviceTask id="Auto_AntiRecusa" name="[ROBO] Anti-Recusa (PIX/Boleto)">
      <bpmn2:documentation>AUTOMAÇÃO RECUPERAÇÃO: Quando cartão é recusado, oferece automaticamente:
- PIX com desconto: R$ 1.347 anual ou R$ 177 mensal
- Boleto: mesmos valores
- Se ainda recusar: ir para régua de cobrança</bpmn2:documentation>
      <bpmn2:incoming>Flow_PagFalhou</bpmn2:incoming>
      <bpmn2:outgoing>Flow_AntiRecusa_Vitrine</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_AntiRecusa_Dunning</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Auto_Dunning" name="[ROBO] Regua de Cobranca (7 dias)">
      <bpmn2:documentation>AUTOMAÇÃO DE COBRANÇA: Régua automatizada para quem não pagou:
- Dia 1: "Sua conta está suspensa, pague para continuar"
- Dia 3: "Seus dados serão perdidos em 4 dias"
- Dia 5: "Última chance! Oferta especial: 20% off"
- Dia 7: Encerramento definitivo da conta</bpmn2:documentation>
      <bpmn2:incoming>Flow_AntiRecusa_Dunning</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Dunning_Lost</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Auto_Split" name="[ROBO] Split 30% Parceiro + D+1">
      <bpmn2:documentation>AUTOMAÇÃO FINANCEIRA: Processamento automático via Asaas:
- Split: 30% direcionado ao parceiro que indicou
- Antecipação: Recebimento em D+1
- Nota fiscal emitida automaticamente
- Conta do cliente mantida ativa!</bpmn2:documentation>
      <bpmn2:incoming>Flow_PagOk</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Split_Ativo</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:endEvent id="End_ClienteAtivo" name="Cliente Ativo e Pagante">
      <bpmn2:documentation>FIM POSITIVO: Cliente converteu do trial para pagante!
- Manter engajamento com CS
- Monitorar uso para upsell
- Solicitar indicações após 30 dias
- NPS após 60 dias</bpmn2:documentation>
      <bpmn2:incoming>Flow_Split_Ativo</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:task id="Task_TrialExpirado" name="Trial Expirado">
      <bpmn2:documentation>STATUS: Trial expirado sem conversão. Cliente usou mas não pagou.
- Dados mantidos por 90 dias (LGPD)
- Iniciar régua de reativação de longo prazo</bpmn2:documentation>
      <bpmn2:incoming>Flow_Dunning_Lost</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Expirado_Reativ30d</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ========== RÉGUA DE REATIVAÇÃO: TRIAL EXPIRADO ========== -->
    <bpmn2:serviceTask id="Auto_Reativacao30d" name="[ROBO] Reativacao 30 dias">
      <bpmn2:documentation>REATIVAÇÃO 1 (30 dias após expirar trial):

💬 SCRIPT:
"Oi [Nome]! Sentimos sua falta! 😊

Vi que você usou o Fyness durante o trial mas acabou não continuando.

Me conta: o que faltou pra você? Foi o preço? Alguma funcionalidade?

Quero te fazer uma proposta ESPECIAL:

🎁 30% DE DESCONTO nos primeiros 3 meses
   → Sai R$138/mês (em vez de R$197)

E mais: seus dados ainda estão salvos! É só reativar.

Topa?"

🎯 OBJETIVO: Identificar objeção real + oferta irresistível
⏰ TIMING: 30 dias após expirar trial
💰 OFERTA: 30% desconto por 3 meses
📊 Taxa de reativação esperada: 8-12%</bpmn2:documentation>
      <bpmn2:incoming>Flow_Expirado_Reativ30d</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Reativ30d_60d</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Auto_Reativacao60d" name="[ROBO] Reativacao 60 dias">
      <bpmn2:documentation>REATIVAÇÃO 2 (60 dias após expirar trial):

💬 SCRIPT:
"[Nome], novidades que você precisa ver! 🚀

Desde que você testou o Fyness, a gente lançou:
✅ [Nova Feature 1] - automatiza [X]
✅ [Nova Feature 2] - economiza [Y] horas/mês
✅ [Integração nova] - conecta com [ferramenta que ele usa]

E olha só: vários clientes que testaram junto com você estão economizando em média R$3.500/mês com a gente.

Você resolveu o problema de [dor que ele tinha] de outra forma?

Se não, tenho uma proposta:
🎁 TRIAL ESTENDIDO: 14 dias grátis (em vez de 7)
+ 20% desconto se fechar hoje

Seus dados continuam salvos. Quer reativar?"

🎯 OBJETIVO: FOMO + Novidades + Prova social
⏰ TIMING: 60 dias após expirar
💰 OFERTA: Trial 14 dias + 20% desconto
📊 Taxa de reativação esperada: 5-8%</bpmn2:documentation>
      <bpmn2:incoming>Flow_Reativ30d_60d</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Reativ60d_90d</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:serviceTask id="Auto_Reativacao90d" name="[ROBO] Reativacao 90 dias (Ultima Chance)">
      <bpmn2:documentation>REATIVAÇÃO 3 (90 dias após expirar trial - ÚLTIMA CHANCE):

💬 SCRIPT:
"[Nome], última chance! ⚠️

Em 7 dias, vamos APAGAR DEFINITIVAMENTE seus dados do Fyness (LGPD).

Você tinha [X] lançamentos, [Y] clientes cadastrados... tudo isso será perdido pra sempre.

Antes disso acontecer, quero te fazer UMA ÚLTIMA PROPOSTA:

🔥 ÚLTIMA CHANCE:
→ R$97/mês pelos próximos 6 meses (50% OFF!)
→ Trial extra de 7 dias GRÁTIS pra decidir
→ Seus dados recuperados 100%

É AGORA OU NUNCA, [Nome].

Responde esse número até [data]: SIM ou NÃO

SIM = eu reativo sua conta
NÃO = vou apagar tudo em 7 dias

O que vai ser?"

🎯 OBJETIVO: Urgência máxima + Última oportunidade real
⏰ TIMING: 90 dias após expirar (7 dias antes de apagar dados)
💰 OFERTA: 50% OFF por 6 meses + trial 7 dias
📊 Taxa de reativação esperada: 3-5%
⚠️ CRÍTICO: Se não responder, dados serão apagados em 7 dias (LGPD)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Reativ60d_90d</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Reativ90d_Gateway</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:exclusiveGateway id="Gateway_Voltou" name="Reativou?">
      <bpmn2:documentation>DECISÃO: Verificar se cliente reativou após régua de recuperação:
- Sim → Redirecionar para ativação (volta pro Auto_Ativacao para novo trial)
- Não → Churn definitivo, apagar dados</bpmn2:documentation>
      <bpmn2:incoming>Flow_Reativ90d_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Voltou_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Voltou_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:endEvent id="End_ChurnDefinitivo" name="Churn Definitivo">
      <bpmn2:documentation>FIM DEFINITIVO: Cliente não reativou após 90 dias.

🗑️ AÇÕES LGPD:
- Apagar todos os dados pessoais em 7 dias
- Manter apenas dados agregados/anônimos para análise
- Remover de todas as listas de contato

📊 ANÁLISE:
- Registrar motivo do churn (se identificado)
- Avaliar padrão: qual fase perdeu o cliente?
- Feedback para produto/vendas

💡 WIN-BACK CAMPAIGNS:
- Após 6-12 meses: pode tentar re-engajar com campanha de remarketing
- Considerar como novo lead se voltar espontaneamente</bpmn2:documentation>
      <bpmn2:incoming>Flow_Voltou_Nao</bpmn2:incoming>
    </bpmn2:endEvent>

    <!-- ========== SEQUENCE FLOWS ========== -->
    <bpmn2:sequenceFlow id="Flow_P1" sourceRef="Start_Parceiros" targetRef="Gateway_Roteamento" />
    <bpmn2:sequenceFlow id="Flow_G1" sourceRef="Start_Google" targetRef="Gateway_Roteamento" />
    <bpmn2:sequenceFlow id="Flow_M1" sourceRef="Start_Meta" targetRef="Gateway_Roteamento" />
    <bpmn2:sequenceFlow id="Flow_ToLP" name="Google/Organico" sourceRef="Gateway_Roteamento" targetRef="Task_LP" />
    <bpmn2:sequenceFlow id="Flow_ToWhats" name="Meta/Parceiros" sourceRef="Gateway_Roteamento" targetRef="Task_WhatsApp" />
    <bpmn2:sequenceFlow id="Flow_LP_CRM" sourceRef="Task_LP" targetRef="Auto_CRM" />
    <bpmn2:sequenceFlow id="Flow_WA_CRM" sourceRef="Task_WhatsApp" targetRef="Auto_CRM" />
    <bpmn2:sequenceFlow id="Flow_CRM_Speed" sourceRef="Auto_CRM" targetRef="Auto_SpeedLead" />
    <bpmn2:sequenceFlow id="Flow_Speed_Dist" sourceRef="Auto_SpeedLead" targetRef="Auto_Distribuicao" />
    <bpmn2:sequenceFlow id="Flow_Dist_Vendas" sourceRef="Auto_Distribuicao" targetRef="Task_Diagnostico" />
    <bpmn2:sequenceFlow id="Flow_Diag_Qual" sourceRef="Task_Diagnostico" targetRef="Task_Qualificacao" />
    <bpmn2:sequenceFlow id="Flow_Qual_Demo" sourceRef="Task_Qualificacao" targetRef="Task_Demo" />
    <bpmn2:sequenceFlow id="Flow_Demo_Gateway" sourceRef="Task_Demo" targetRef="Gateway_AceitaTrial" />
    <bpmn2:sequenceFlow id="Flow_AceitaTrial" name="Sim, quero testar!" sourceRef="Gateway_AceitaTrial" targetRef="Auto_Ativacao" />
    <bpmn2:sequenceFlow id="Flow_NaoAceitaTrial" name="Nao agora" sourceRef="Gateway_AceitaTrial" targetRef="End_NaoInteressado" />
    <bpmn2:sequenceFlow id="Flow_Ativacao_Primeiro" sourceRef="Auto_Ativacao" targetRef="Task_PrimeiroLancamento" />
    <bpmn2:sequenceFlow id="Flow_Primeiro_Nurturing" sourceRef="Task_PrimeiroLancamento" targetRef="Auto_Nurturing" />
    <bpmn2:sequenceFlow id="Flow_Nurturing_Churn" sourceRef="Auto_Nurturing" targetRef="Auto_AlertaChurn" />
    <bpmn2:sequenceFlow id="Flow_Churn_Resgate" sourceRef="Auto_AlertaChurn" targetRef="Task_ResgateChurn" />
    <bpmn2:sequenceFlow id="Flow_Resgate_Timer" sourceRef="Task_ResgateChurn" targetRef="Timer_FimTrial" />
    <bpmn2:sequenceFlow id="Flow_Timer_Vitrine" sourceRef="Timer_FimTrial" targetRef="Task_Vitrine" />
    <bpmn2:sequenceFlow id="Flow_Vitrine_Pag" sourceRef="Task_Vitrine" targetRef="Gateway_Pagamento" />
    <bpmn2:sequenceFlow id="Flow_PagOk" name="Aprovado" sourceRef="Gateway_Pagamento" targetRef="Auto_Split" />
    <bpmn2:sequenceFlow id="Flow_PagFalhou" name="Recusado" sourceRef="Gateway_Pagamento" targetRef="Auto_AntiRecusa" />
    <bpmn2:sequenceFlow id="Flow_AntiRecusa_Vitrine" name="Tentou outro metodo" sourceRef="Auto_AntiRecusa" targetRef="Task_Vitrine" />
    <bpmn2:sequenceFlow id="Flow_AntiRecusa_Dunning" name="Recusou tudo" sourceRef="Auto_AntiRecusa" targetRef="Auto_Dunning" />
    <bpmn2:sequenceFlow id="Flow_Dunning_Lost" sourceRef="Auto_Dunning" targetRef="Task_TrialExpirado" />
    <bpmn2:sequenceFlow id="Flow_Split_Ativo" sourceRef="Auto_Split" targetRef="End_ClienteAtivo" />

    <!-- Flows da Régua de Follow-up (Não Interessado) -->
    <bpmn2:sequenceFlow id="Flow_Hesitante_FU24h" sourceRef="Task_NaoInteressado" targetRef="Auto_FollowUp24h" />
    <bpmn2:sequenceFlow id="Flow_FU24h_FU3d" sourceRef="Auto_FollowUp24h" targetRef="Auto_FollowUp3d" />
    <bpmn2:sequenceFlow id="Flow_FU3d_FU7d" sourceRef="Auto_FollowUp3d" targetRef="Auto_FollowUp7d" />
    <bpmn2:sequenceFlow id="Flow_FU7d_FU30d" sourceRef="Auto_FollowUp7d" targetRef="Auto_FollowUp30d" />
    <bpmn2:sequenceFlow id="Flow_FU30d_Gateway" sourceRef="Auto_FollowUp30d" targetRef="Gateway_Reengajou" />
    <bpmn2:sequenceFlow id="Flow_Reengajou_Sim" name="Sim, quer testar!" sourceRef="Gateway_Reengajou" targetRef="Gateway_AceitaTrial" />
    <bpmn2:sequenceFlow id="Flow_Reengajou_Nao" name="Nao respondeu" sourceRef="Gateway_Reengajou" targetRef="End_NurturingLongoPrazo" />

    <!-- Flows da Régua de Reativação (Trial Expirado) -->
    <bpmn2:sequenceFlow id="Flow_Expirado_Reativ30d" sourceRef="Task_TrialExpirado" targetRef="Auto_Reativacao30d" />
    <bpmn2:sequenceFlow id="Flow_Reativ30d_60d" sourceRef="Auto_Reativacao30d" targetRef="Auto_Reativacao60d" />
    <bpmn2:sequenceFlow id="Flow_Reativ60d_90d" sourceRef="Auto_Reativacao60d" targetRef="Auto_Reativacao90d" />
    <bpmn2:sequenceFlow id="Flow_Reativ90d_Gateway" sourceRef="Auto_Reativacao90d" targetRef="Gateway_Voltou" />
    <bpmn2:sequenceFlow id="Flow_Voltou_Sim" name="Sim, reativou!" sourceRef="Gateway_Voltou" targetRef="Auto_Ativacao" />
    <bpmn2:sequenceFlow id="Flow_Voltou_Nao" name="Nao reativou" sourceRef="Gateway_Voltou" targetRef="End_ChurnDefinitivo" />

  </bpmn2:process>

  <!-- ========== DIAGRAMA VISUAL ========== -->
  <bpmndi:BPMNDiagram id="BPMNDiagram_Comercial">
    <bpmndi:BPMNPlane id="BPMNPlane_Comercial" bpmnElement="Collaboration_Comercial">

      <!-- Pool Principal -->
      <bpmndi:BPMNShape id="Participant_Comercial_di" bpmnElement="Participant_Comercial" isHorizontal="true">
        <dc:Bounds x="120" y="60" width="2200" height="1000" />
      </bpmndi:BPMNShape>

      <!-- Raias -->
      <bpmndi:BPMNShape id="Lane_Marketing_di" bpmnElement="Lane_Marketing" isHorizontal="true">
        <dc:Bounds x="150" y="60" width="2170" height="160" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Lane_Automacoes_di" bpmnElement="Lane_Automacoes" isHorizontal="true">
        <dc:Bounds x="150" y="220" width="2170" height="130" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Lane_Vendas_di" bpmnElement="Lane_Vendas" isHorizontal="true">
        <dc:Bounds x="150" y="350" width="2170" height="200" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Lane_Trial_di" bpmnElement="Lane_Trial" isHorizontal="true">
        <dc:Bounds x="150" y="550" width="2170" height="160" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Lane_Gateway_di" bpmnElement="Lane_Gateway" isHorizontal="true">
        <dc:Bounds x="150" y="710" width="2170" height="250" />
      </bpmndi:BPMNShape>

      <!-- Elementos Raia Marketing -->
      <bpmndi:BPMNShape id="Start_Parceiros_di" bpmnElement="Start_Parceiros">
        <dc:Bounds x="202" y="92" width="36" height="36" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_Google_di" bpmnElement="Start_Google">
        <dc:Bounds x="202" y="132" width="36" height="36" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Start_Meta_di" bpmnElement="Start_Meta">
        <dc:Bounds x="202" y="172" width="36" height="36" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Gateway_Roteamento_di" bpmnElement="Gateway_Roteamento" isMarkerVisible="true">
        <dc:Bounds x="305" y="115" width="50" height="50" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_LP_di" bpmnElement="Task_LP">
        <dc:Bounds x="420" y="75" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_WhatsApp_di" bpmnElement="Task_WhatsApp">
        <dc:Bounds x="420" y="150" width="100" height="60" />
      </bpmndi:BPMNShape>

      <!-- Elementos Raia Automações -->
      <bpmndi:BPMNShape id="Auto_CRM_di" bpmnElement="Auto_CRM">
        <dc:Bounds x="280" y="255" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Auto_SpeedLead_di" bpmnElement="Auto_SpeedLead">
        <dc:Bounds x="420" y="255" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Auto_Distribuicao_di" bpmnElement="Auto_Distribuicao">
        <dc:Bounds x="560" y="255" width="100" height="60" />
      </bpmndi:BPMNShape>

      <!-- Elementos Raia Vendas -->
      <bpmndi:BPMNShape id="Task_Diagnostico_di" bpmnElement="Task_Diagnostico">
        <dc:Bounds x="280" y="400" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_Qualificacao_di" bpmnElement="Task_Qualificacao">
        <dc:Bounds x="420" y="400" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_Demo_di" bpmnElement="Task_Demo">
        <dc:Bounds x="560" y="400" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Gateway_AceitaTrial_di" bpmnElement="Gateway_AceitaTrial" isMarkerVisible="true">
        <dc:Bounds x="705" y="405" width="50" height="50" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="End_NaoInteressado_di" bpmnElement="End_NaoInteressado">
        <dc:Bounds x="712" y="472" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- Elementos Raia Trial -->
      <bpmndi:BPMNShape id="Auto_Ativacao_di" bpmnElement="Auto_Ativacao">
        <dc:Bounds x="280" y="600" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_PrimeiroLancamento_di" bpmnElement="Task_PrimeiroLancamento">
        <dc:Bounds x="420" y="600" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Auto_Nurturing_di" bpmnElement="Auto_Nurturing">
        <dc:Bounds x="560" y="600" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Auto_AlertaChurn_di" bpmnElement="Auto_AlertaChurn">
        <dc:Bounds x="700" y="600" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Task_ResgateChurn_di" bpmnElement="Task_ResgateChurn">
        <dc:Bounds x="840" y="600" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Timer_FimTrial_di" bpmnElement="Timer_FimTrial">
        <dc:Bounds x="982" y="612" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- Elementos Raia Gateway Financeiro -->
      <bpmndi:BPMNShape id="Task_Vitrine_di" bpmnElement="Task_Vitrine">
        <dc:Bounds x="280" y="760" width="120" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Gateway_Pagamento_di" bpmnElement="Gateway_Pagamento" isMarkerVisible="true">
        <dc:Bounds x="445" y="765" width="50" height="50" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Auto_AntiRecusa_di" bpmnElement="Auto_AntiRecusa">
        <dc:Bounds x="420" y="840" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Auto_Dunning_di" bpmnElement="Auto_Dunning">
        <dc:Bounds x="560" y="840" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Auto_Split_di" bpmnElement="Auto_Split">
        <dc:Bounds x="560" y="760" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="End_ClienteAtivo_di" bpmnElement="End_ClienteAtivo">
        <dc:Bounds x="712" y="772" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- Edges / Conexões -->
      <bpmndi:BPMNEdge id="Flow_P1_di" bpmnElement="Flow_P1">
        <di:waypoint x="238" y="110" />
        <di:waypoint x="330" y="110" />
        <di:waypoint x="330" y="115" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_G1_di" bpmnElement="Flow_G1">
        <di:waypoint x="238" y="150" />
        <di:waypoint x="330" y="150" />
        <di:waypoint x="330" y="140" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_M1_di" bpmnElement="Flow_M1">
        <di:waypoint x="238" y="190" />
        <di:waypoint x="272" y="190" />
        <di:waypoint x="272" y="140" />
        <di:waypoint x="305" y="140" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_ToLP_di" bpmnElement="Flow_ToLP">
        <di:waypoint x="355" y="140" />
        <di:waypoint x="388" y="140" />
        <di:waypoint x="388" y="105" />
        <di:waypoint x="420" y="105" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_ToWhats_di" bpmnElement="Flow_ToWhats">
        <di:waypoint x="355" y="140" />
        <di:waypoint x="388" y="140" />
        <di:waypoint x="388" y="180" />
        <di:waypoint x="420" y="180" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_LP_CRM_di" bpmnElement="Flow_LP_CRM">
        <di:waypoint x="470" y="135" />
        <di:waypoint x="470" y="195" />
        <di:waypoint x="330" y="195" />
        <di:waypoint x="330" y="255" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_WA_CRM_di" bpmnElement="Flow_WA_CRM">
        <di:waypoint x="470" y="210" />
        <di:waypoint x="470" y="233" />
        <di:waypoint x="330" y="233" />
        <di:waypoint x="330" y="255" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_CRM_Speed_di" bpmnElement="Flow_CRM_Speed">
        <di:waypoint x="380" y="285" />
        <di:waypoint x="420" y="285" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Speed_Dist_di" bpmnElement="Flow_Speed_Dist">
        <di:waypoint x="520" y="285" />
        <di:waypoint x="560" y="285" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Dist_Vendas_di" bpmnElement="Flow_Dist_Vendas">
        <di:waypoint x="610" y="315" />
        <di:waypoint x="610" y="358" />
        <di:waypoint x="330" y="358" />
        <di:waypoint x="330" y="400" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Diag_Qual_di" bpmnElement="Flow_Diag_Qual">
        <di:waypoint x="380" y="430" />
        <di:waypoint x="420" y="430" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Qual_Demo_di" bpmnElement="Flow_Qual_Demo">
        <di:waypoint x="520" y="430" />
        <di:waypoint x="560" y="430" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Demo_Gateway_di" bpmnElement="Flow_Demo_Gateway">
        <di:waypoint x="660" y="430" />
        <di:waypoint x="705" y="430" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_AceitaTrial_di" bpmnElement="Flow_AceitaTrial">
        <di:waypoint x="730" y="455" />
        <di:waypoint x="730" y="570" />
        <di:waypoint x="330" y="570" />
        <di:waypoint x="330" y="600" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_NaoAceitaTrial_di" bpmnElement="Flow_NaoAceitaTrial">
        <di:waypoint x="755" y="430" />
        <di:waypoint x="800" y="430" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Ativacao_Primeiro_di" bpmnElement="Flow_Ativacao_Primeiro">
        <di:waypoint x="380" y="630" />
        <di:waypoint x="420" y="630" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Primeiro_Nurturing_di" bpmnElement="Flow_Primeiro_Nurturing">
        <di:waypoint x="520" y="630" />
        <di:waypoint x="560" y="630" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Nurturing_Churn_di" bpmnElement="Flow_Nurturing_Churn">
        <di:waypoint x="660" y="630" />
        <di:waypoint x="700" y="630" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Churn_Resgate_di" bpmnElement="Flow_Churn_Resgate">
        <di:waypoint x="800" y="630" />
        <di:waypoint x="840" y="630" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Resgate_Timer_di" bpmnElement="Flow_Resgate_Timer">
        <di:waypoint x="940" y="630" />
        <di:waypoint x="982" y="630" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Timer_Vitrine_di" bpmnElement="Flow_Timer_Vitrine">
        <di:waypoint x="1000" y="648" />
        <di:waypoint x="1000" y="730" />
        <di:waypoint x="340" y="730" />
        <di:waypoint x="340" y="760" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Vitrine_Pag_di" bpmnElement="Flow_Vitrine_Pag">
        <di:waypoint x="400" y="790" />
        <di:waypoint x="445" y="790" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_PagOk_di" bpmnElement="Flow_PagOk">
        <di:waypoint x="495" y="790" />
        <di:waypoint x="560" y="790" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_PagFalhou_di" bpmnElement="Flow_PagFalhou">
        <di:waypoint x="470" y="815" />
        <di:waypoint x="470" y="840" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_AntiRecusa_Vitrine_di" bpmnElement="Flow_AntiRecusa_Vitrine">
        <di:waypoint x="420" y="870" />
        <di:waypoint x="260" y="870" />
        <di:waypoint x="260" y="790" />
        <di:waypoint x="280" y="790" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_AntiRecusa_Dunning_di" bpmnElement="Flow_AntiRecusa_Dunning">
        <di:waypoint x="520" y="870" />
        <di:waypoint x="560" y="870" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Dunning_Lost_di" bpmnElement="Flow_Dunning_Lost">
        <di:waypoint x="660" y="870" />
        <di:waypoint x="800" y="870" />
        <di:waypoint x="800" y="860" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Split_Ativo_di" bpmnElement="Flow_Split_Ativo">
        <di:waypoint x="660" y="790" />
        <di:waypoint x="712" y="790" />
      </bpmndi:BPMNEdge>

      <!-- ========== SHAPES E EDGES: RÉGUA FOLLOW-UP (NÃO INTERESSADO) ========== -->
      <bpmndi:BPMNShape id="Task_NaoInteressado_di" bpmnElement="Task_NaoInteressado">
        <dc:Bounds x="800" y="400" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Auto_FollowUp24h_di" bpmnElement="Auto_FollowUp24h">
        <dc:Bounds x="950" y="400" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Auto_FollowUp3d_di" bpmnElement="Auto_FollowUp3d">
        <dc:Bounds x="1100" y="400" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Auto_FollowUp7d_di" bpmnElement="Auto_FollowUp7d">
        <dc:Bounds x="1250" y="400" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Auto_FollowUp30d_di" bpmnElement="Auto_FollowUp30d">
        <dc:Bounds x="1400" y="400" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Gateway_Reengajou_di" bpmnElement="Gateway_Reengajou" isMarkerVisible="true">
        <dc:Bounds x="1555" y="405" width="50" height="50" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="End_NurturingLongoPrazo_di" bpmnElement="End_NurturingLongoPrazo">
        <dc:Bounds x="1562" y="492" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- Edges da Régua Follow-up -->
      <bpmndi:BPMNEdge id="Flow_Hesitante_FU24h_di" bpmnElement="Flow_Hesitante_FU24h">
        <di:waypoint x="900" y="430" />
        <di:waypoint x="950" y="430" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_FU24h_FU3d_di" bpmnElement="Flow_FU24h_FU3d">
        <di:waypoint x="1050" y="430" />
        <di:waypoint x="1100" y="430" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_FU3d_FU7d_di" bpmnElement="Flow_FU3d_FU7d">
        <di:waypoint x="1200" y="430" />
        <di:waypoint x="1250" y="430" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_FU7d_FU30d_di" bpmnElement="Flow_FU7d_FU30d">
        <di:waypoint x="1350" y="430" />
        <di:waypoint x="1400" y="430" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_FU30d_Gateway_di" bpmnElement="Flow_FU30d_Gateway">
        <di:waypoint x="1500" y="430" />
        <di:waypoint x="1555" y="430" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Reengajou_Sim_di" bpmnElement="Flow_Reengajou_Sim">
        <di:waypoint x="1580" y="405" />
        <di:waypoint x="1580" y="360" />
        <di:waypoint x="730" y="360" />
        <di:waypoint x="730" y="405" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Reengajou_Nao_di" bpmnElement="Flow_Reengajou_Nao">
        <di:waypoint x="1580" y="455" />
        <di:waypoint x="1580" y="492" />
      </bpmndi:BPMNEdge>

      <!-- ========== SHAPES E EDGES: RÉGUA REATIVAÇÃO (TRIAL EXPIRADO) ========== -->
      <bpmndi:BPMNShape id="Task_TrialExpirado_di" bpmnElement="Task_TrialExpirado">
        <dc:Bounds x="800" y="800" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Auto_Reativacao30d_di" bpmnElement="Auto_Reativacao30d">
        <dc:Bounds x="950" y="800" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Auto_Reativacao60d_di" bpmnElement="Auto_Reativacao60d">
        <dc:Bounds x="1100" y="800" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Auto_Reativacao90d_di" bpmnElement="Auto_Reativacao90d">
        <dc:Bounds x="1250" y="800" width="100" height="60" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="Gateway_Voltou_di" bpmnElement="Gateway_Voltou" isMarkerVisible="true">
        <dc:Bounds x="1405" y="805" width="50" height="50" />
      </bpmndi:BPMNShape>

      <bpmndi:BPMNShape id="End_ChurnDefinitivo_di" bpmnElement="End_ChurnDefinitivo">
        <dc:Bounds x="1412" y="892" width="36" height="36" />
      </bpmndi:BPMNShape>

      <!-- Edges da Régua Reativação -->
      <bpmndi:BPMNEdge id="Flow_Expirado_Reativ30d_di" bpmnElement="Flow_Expirado_Reativ30d">
        <di:waypoint x="900" y="830" />
        <di:waypoint x="950" y="830" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Reativ30d_60d_di" bpmnElement="Flow_Reativ30d_60d">
        <di:waypoint x="1050" y="830" />
        <di:waypoint x="1100" y="830" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Reativ60d_90d_di" bpmnElement="Flow_Reativ60d_90d">
        <di:waypoint x="1200" y="830" />
        <di:waypoint x="1250" y="830" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Reativ90d_Gateway_di" bpmnElement="Flow_Reativ90d_Gateway">
        <di:waypoint x="1350" y="830" />
        <di:waypoint x="1405" y="830" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Voltou_Sim_di" bpmnElement="Flow_Voltou_Sim">
        <di:waypoint x="1430" y="805" />
        <di:waypoint x="1430" y="630" />
        <di:waypoint x="330" y="630" />
        <di:waypoint x="330" y="600" />
      </bpmndi:BPMNEdge>

      <bpmndi:BPMNEdge id="Flow_Voltou_Nao_di" bpmnElement="Flow_Voltou_Nao">
        <di:waypoint x="1430" y="855" />
        <di:waypoint x="1430" y="892" />
      </bpmndi:BPMNEdge>

    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>`;

export default COMERCIAL_DIAGRAM_XML;

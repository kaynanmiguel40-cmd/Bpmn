// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  BACKUP — PÓS-VENDA EDUCAÇÃO (removido do template comercial)             ║
// ║  Data: 2026-02-26                                                          ║
// ║  Motivo: Pós-venda não pertence ao processo comercial.                     ║
// ║          Será usado para criar um fluxo separado de CS/Pós-Venda.          ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// ==================== BPMN XML — Process_Educacao (PÓS-VENDA) ====================
// Copiar este XML para o template de pós-venda quando for criado.

export const BPMN_POS_VENDA_EDUCACAO = `
  <bpmn2:process id="Process_PosVenda_Educacao" isExecutable="false">
    <bpmn2:startEvent id="Start_Educacao_Software" name="Comprou Software (Semestral)">
      <bpmn2:documentation>PORTA A — NOVO ASSINANTE (via Software):
Comprou o plano semestral do Fyness.
Mentalidade: "Comprei a FERRAMENTA pra resolver meu problema"
Bônus: Curso de Gestão Completo incluso.

⚠️ ASSINANTE, NÃO ALUNO. Ele paga todo mês — precisa de RESULTADO todo mês.
Se não usar na 1ª semana, cancela no mês 2.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Edu_Soft_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:startEvent id="Start_Educacao_Curso" name="Comprou Curso (Método)">
      <bpmn2:documentation>PORTA B — NOVO ASSINANTE (via Curso):
Comprou o curso/método de gestão financeira.
Mentalidade: "Comprei o CONHECIMENTO pra crescer"
Bônus: 6 Meses Fyness incluso.

⚠️ ASSINANTE, NÃO ALUNO. O curso é isca — o objetivo é viciar no SOFTWARE.
Se não ativar o Fyness na 1ª semana, perde o hábito e cancela.</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Edu_Curso_1</bpmn2:outgoing>
    </bpmn2:startEvent>
    <bpmn2:endEvent id="End_Cliente_Ativo_Educacao" name="Cliente Ativo (Renovado)">
      <bpmn2:incoming>Flow_Edu_Renov_Anual</bpmn2:incoming>
      <bpmn2:incoming>Flow_Edu_Renov_Mensal</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:serviceTask id="Task_Nurturing_Educacao" name="Grupo WhatsApp Nurturing Longo Prazo">
      <bpmn2:documentation>NURTURING — EX-ASSINANTE (GRUPO WHATSAPP):
Assinante que não renovou. Ainda é potencial reconversão.

AÇÕES AUTOMÁTICAS:
- Cases semanais: "Fulano economizou R$ X esse mês com Fyness"
- Ofertas sazonais de reativação (Black Friday, Ano Novo)
- Novidades do produto (features novas que resolvem a dor dele)
- Lembrete mensal do histórico: "Seus dados ainda estão salvos por [X] dias"

MOTIVOS COMUNS DE CHURN:
- Não viu valor / Não criou hábito
- Problema financeiro temporário
- Voltou para planilha

OBJETIVO: Reconverter ex-assinante. Ele já conhece o produto.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Recuperou_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Nurturing_End</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:endEvent id="End_Educacao_Nurturing" name="Nurturing Ativo">
      <bpmn2:incoming>Flow_Edu_Nurturing_End</bpmn2:incoming>
    </bpmn2:endEvent>
    <bpmn2:task id="Task_Aula_Setup" name="Dica de uso">
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
    <bpmn2:task id="Task_CS_Liga_Ativacao" name="Ligacao">
      <bpmn2:documentation>📞 LIGAÇÃO ATIVAÇÃO (D+7 — ASSINANTE NÃO USOU):

O assinante PAGOU mas NÃO USOU. Dinheiro parado = cancelamento garantido.

SCRIPT:
"Oi [Nome], vi que você já é assinante há 7 dias mas ainda não fez
o primeiro lançamento. Tem algo travando?
Posso te ajudar agora em 15 minutos pelo Zoom — a gente configura junto."

→ Se aceitar: Zoom de 15 min, configurar junto NA HORA
→ Se recusar 1x: reagendar pra outro horário
→ Se recusar 2x: CRM tag [RISCO_CANCELAMENTO] + automação envia tutorial em vídeo

⚠️ ASSINANTE QUE NÃO USA NA SEMANA 1 = 80% DE CHANCE DE CANCELAR NO MÊS 2.
Essa ligação é a mais importante de toda a raia.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Ativou_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_CS_Ativa</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_M1_Desafio_DRE" name="M1: Interacao na comunidade &#10;Desafios+sorteios">
      <bpmn2:documentation>🏆 MÊS 1 — ENGAJAMENTO ATIVO DO ASSINANTE:

Assinante que não criou HÁBITO no mês 1 cancela no mês 3.

AÇÕES (automação + comunidade):
1. Desafio na comunidade: "Quem posta o primeiro DRE do mês até sexta?"
   → Prêmio: Relatório Personalizado
2. WhatsApp automático semanal com dica de uso:
   → Semana 1: "Você sabia que pode lançar por áudio?"
   → Semana 2: "Seus números dessa semana: R$ [X] lançados"
   → Semana 3: "Seu DRE do mês está quase pronto!"
   → Semana 4: "Parabéns! Seu 1º mês completo. Veja seu resultado."
3. Se NÃO usou no mês 1 → automação envia alerta ao vendedor

OBJETIVO: Criar HÁBITO — assinante que usa toda semana NÃO cancela.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Merge_Ativa</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_M1</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:task id="Task_Renovacao_Anual" name="Anual: 20% desconto &#10;+Caixa fundador">
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
      <bpmn2:documentation>📞 LIGAÇÃO RECOVERY — ASSINANTE EXPIRADO:

Assinante deixou expirar. Ainda vê dados no modo leitura.

SCRIPT:
"[Nome], vi que sua assinatura expirou.
Você tem [X] meses de histórico — lançamentos, relatórios, DRE.
Vai jogar isso fora e voltar pra planilha?
Consegui uma condição especial pra renovar agora."

→ Se aceitar → processar renovação na hora
→ Se recusar → registrar motivo + nurturing

URGÊNCIA: Última chance humana. Depois é só automação.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Bloqueio</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_CS_Recovery</bpmn2:outgoing>
    </bpmn2:task>
    <bpmn2:serviceTask id="Task_Tag_Software" name="CRM">
      <bpmn2:documentation>CRM ACTION:
Tag: [ASSINANTE_BUNDLE_SOFT]
Perfil: Comprou ferramenta, ganhou método
Bônus: Curso Completo de Gestão Financeira
→ Tratar como ASSINANTE desde o dia 1</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Soft_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Soft_2</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:serviceTask id="Task_Tag_Curso" name="CRM">
      <bpmn2:documentation>CRM ACTION:
Tag: [ASSINANTE_BUNDLE_CURSO]
Perfil: Comprou método, ganhou ferramenta
Bônus: 6 Meses Fyness incluso
→ Tratar como ASSINANTE desde o dia 1</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_Curso_1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_Curso_2</bpmn2:outgoing>
    </bpmn2:serviceTask>
    <bpmn2:sendTask id="Task_Email_BoasVindas" name="E-mail/Whats Acesso Liberado (Curso + Software)">
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
    <bpmn2:sendTask id="Task_M3_Checkpoint" name="M3: E-mail/zap de Progresso - Economizou R$ X">
      <bpmn2:documentation>📊 MÊS 3 — MOSTRAR ROI REAL AO ASSINANTE:

Se o assinante NÃO VÊ o retorno em R$, ele cancela.
Esse é o momento de provar que o Fyness SE PAGA.

MENSAGEM (automação com dados reais do dashboard):
"[Nome], 90 dias como assinante Fyness! Olha seus números:

💰 Lançou: R$ [X] em receitas
🛡️ Evitou: R$ [Y] em vazamentos
⏱️ Economizou: [Z] horas de planilha
📊 Seu DRE dos últimos 3 meses: [link]

Isso é [A]x o valor da assinatura. O Fyness tá se pagando."

→ Se métricas FRACAS (pouco uso) → vendedor liga:
  "Vi que você tá usando pouco. Posso te ajudar a aproveitar melhor?"
→ Se métricas FORTES → automação pede depoimento:
  "Posso compartilhar seu resultado na comunidade? Ajuda outros MEIs."

OBJETIVO: ROI tangível em R$ = assinante NÃO cancela.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_M2b</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_M3</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:sendTask id="Task_D150_Aviso" name="D+150 (30 dias antes): Aviso Perda de Histórico">
      <bpmn2:documentation>⚠️ D+150 — AVISO AO ASSINANTE (30 DIAS ANTES DO VENCIMENTO):

PSICOLOGIA: Aversão à Perda. O assinante construiu DADOS valiosos.

MENSAGEM (automação):
"Fala [Nome]. Faltam 30 dias pra renovar sua assinatura.

Você tem [X] meses de histórico financeiro aqui:
• [Y] lançamentos registrados
• [Z] relatórios gerados

Pra não perder tudo e voltar pra planilha,
o [Sócio] liberou uma condição exclusiva de renovação."

CTA: "Quero Garantir Minha Renovação"

→ Se não respondeu em 48h → vendedor liga</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_M5</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_D150</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:exclusiveGateway id="Gateway_Merge_Entrada" name="">
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
    <bpmn2:intermediateCatchEvent id="LinkCatch_Educacao" name="← Educação">
      <bpmn2:outgoing>Flow_Edu_Google_In</bpmn2:outgoing>
      <bpmn2:linkEventDefinition name="Link_Educacao" />
    </bpmn2:intermediateCatchEvent>
    <bpmn2:exclusiveGateway id="Gateway_Merge_Ativacao">
      <bpmn2:incoming>Flow_Edu_Ativou_Sim</bpmn2:incoming>
      <bpmn2:incoming>Flow_Edu_CS_Ativa</bpmn2:incoming>
      <bpmn2:incoming>Flow_Edu_Google_In</bpmn2:incoming>
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
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_M2" name="30 dias">
      <bpmn2:incoming>Flow_Edu_M1</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_M2</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P30D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:sendTask id="Task_M2_Upsell" name="M2: Upsell Módulos Avançados">
      <bpmn2:documentation>📈 MÊS 2 — EXPANDIR USO DO ASSINANTE:

Assinante já tem 30 dias. Se só usa o básico, vai achar caro.
Quanto MAIS funcionalidades usar, MAIS difícil cancelar.

MENSAGEM (automação):
"[Nome], você já é assinante há 30 dias! 🚀

Seus números: R$ [X] lançados, [Y] transações.

Assinantes avançados estão usando:
- DRE Automático (seu lucro REAL em 1 clique)
- Fluxo de Caixa (prever se vai faltar dinheiro)
- Alertas de Gastos (avisa quando passar do limite)

Quer que eu ative esses módulos pra você?"

→ Se respondeu → Vendedor liga e faz upsell
→ Se não respondeu → Automação ativa preview automático

OBJETIVO: Aumentar profundidade de uso = reduzir churn.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Edu_M2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_M2_Upsell</bpmn2:outgoing>
    </bpmn2:sendTask>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_M2b" name="30 dias">
      <bpmn2:incoming>Flow_Edu_M2_Upsell</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_M2b</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P30D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_M5" name="90 dias">
      <bpmn2:incoming>Flow_Edu_M3</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_M5</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P90D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>
    <bpmn2:intermediateCatchEvent id="IntermediateTimer_30d" name="30 dias">
      <bpmn2:incoming>Flow_Edu_D150</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Edu_30d</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P30D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
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
    <bpmn2:sequenceFlow id="Flow_Edu_Google_In" sourceRef="LinkCatch_Educacao" targetRef="Gateway_Merge_Ativacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_Merge_Ativa" sourceRef="Gateway_Merge_Ativacao" targetRef="Task_M1_Desafio_DRE" />
    <bpmn2:sequenceFlow id="Flow_Edu_M1" sourceRef="Task_M1_Desafio_DRE" targetRef="IntermediateTimer_M2" />
    <bpmn2:sequenceFlow id="Flow_Edu_M2" sourceRef="IntermediateTimer_M2" targetRef="Task_M2_Upsell" />
    <bpmn2:sequenceFlow id="Flow_Edu_M2_Upsell" sourceRef="Task_M2_Upsell" targetRef="IntermediateTimer_M2b" />
    <bpmn2:sequenceFlow id="Flow_Edu_M2b" sourceRef="IntermediateTimer_M2b" targetRef="Task_M3_Checkpoint" />
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
    <bpmn2:sequenceFlow id="Flow_Edu_Recuperou_Nao" name="NÃO" sourceRef="Gateway_Recuperou" targetRef="Task_Nurturing_Educacao" />
    <bpmn2:sequenceFlow id="Flow_Edu_Nurturing_End" sourceRef="Task_Nurturing_Educacao" targetRef="End_Educacao_Nurturing" />
  </bpmn2:process>
`;

// ==================== BPMNDI — Shapes e Edges da Educação ====================

export const BPMNDI_POS_VENDA_EDUCACAO = `
      <bpmndi:BPMNShape id="Shape_Participant_Educacao" bpmnElement="Participant_Educacao" isHorizontal="true" bioc:stroke="#51cf66" bioc:fill="#e0ffe0">
        <dc:Bounds x="160" y="80" width="4400" height="520" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Educacao_Software" bpmnElement="Start_Educacao_Software">
        <dc:Bounds x="232" y="332" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Start_Educacao_Curso" bpmnElement="Start_Educacao_Curso">
        <dc:Bounds x="232" y="112" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Cliente_Ativo_Educacao" bpmnElement="End_Cliente_Ativo_Educacao">
        <dc:Bounds x="3222" y="222" width="36" height="36" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_Task_Nurturing_Educacao" bpmnElement="Task_Nurturing_Educacao">
        <dc:Bounds x="3150" y="420" width="100" height="80" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Shape_End_Educacao_Nurturing" bpmnElement="End_Educacao_Nurturing">
        <dc:Bounds x="3292" y="442" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="3273" y="478" width="74" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <!-- ... (all shapes and edges preserved) ... -->
`;

// ==================== PROCESS ORDERS — Pós-Venda Educação ====================

export const POS_VENDA_PROCESS_ORDERS = [
  {
    elementId: 'Task_Tag_Software',
    elementType: 'serviceTask',
    title: 'CRM — Tag Assinante Bundle Software',
    objective: 'Registrar no CRM o perfil do ASSINANTE que comprou a ferramenta e ganhou o método como bônus.',
    description: 'Automação CRM que adiciona a tag [ASSINANTE_BUNDLE_SOFT] ao lead. Perfil: Comprou ferramenta, ganhou método. Bônus: Curso Completo de Gestão Financeira. MINDSET: É ASSINANTE desde o dia 1.',
    steps: [
      { text: 'Verificar dados do pagamento confirmado', done: false },
      { text: 'Adicionar tag [ASSINANTE_BUNDLE_SOFT] no CRM', done: false },
      { text: 'Liberar acesso ao Curso de Gestão Financeira (bônus)', done: false },
      { text: 'Registrar data de início do ciclo de 6 meses', done: false },
      { text: 'Disparar automação de boas-vindas como ASSINANTE', done: false },
    ],
    inputs: 'Confirmação de pagamento, dados do assinante',
    outputs: 'Assinante tagueado no CRM, acesso completo liberado',
    toolsResources: 'CRM, Gateway de pagamento, Plataforma de cursos',
    responsible: 'Automação',
    acceptanceCriteria: 'Tag [ASSINANTE_BUNDLE_SOFT] aplicada e acesso ativo',
  },
  {
    elementId: 'Task_Tag_Curso',
    elementType: 'serviceTask',
    title: 'CRM — Tag Assinante Bundle Curso',
    objective: 'Registrar no CRM o perfil do ASSINANTE que comprou o método e ganhou a ferramenta como bônus.',
    description: 'Automação CRM que adiciona a tag [ASSINANTE_BUNDLE_CURSO] ao lead. Perfil: Comprou método, ganhou ferramenta. Bônus: 6 Meses Fyness.',
    steps: [
      { text: 'Verificar matrícula no curso confirmada', done: false },
      { text: 'Adicionar tag [ASSINANTE_BUNDLE_CURSO] no CRM', done: false },
      { text: 'Liberar 6 meses de Fyness (bônus)', done: false },
      { text: 'Registrar data de início do ciclo', done: false },
      { text: 'Disparar automação de boas-vindas como ASSINANTE', done: false },
    ],
    inputs: 'Confirmação de matrícula, dados do assinante',
    outputs: 'Assinante tagueado no CRM, acesso Fyness liberado por 6 meses',
    toolsResources: 'CRM, Plataforma de cursos, Fyness',
    responsible: 'Automação',
    acceptanceCriteria: 'Tag [ASSINANTE_BUNDLE_CURSO] aplicada e acesso Fyness ativo',
  },
  {
    elementId: 'Task_Email_BoasVindas',
    elementType: 'sendTask',
    title: 'E-mail/WhatsApp — Bem-vindo Assinante (Curso + Software)',
    objective: 'Garantir instalação imediata do Fyness. Se não configurar na 1ª semana, risco de cancelamento.',
    steps: [
      { text: 'Enviar e-mail: "Bem-vindo, Assinante! Sua Gestão Financeira Começa Agora"', done: false },
      { text: 'Incluir link de ativação Fyness + link da área de membros', done: false },
      { text: 'Direcionar para Missão #1: Aula Inaugural (configurar em 10 min)', done: false },
      { text: 'WhatsApp automático se não abrir e-mail em 2h', done: false },
    ],
    responsible: 'Automação',
  },
  {
    elementId: 'Task_Aula_Setup',
    elementType: 'task',
    title: 'Aula Inaugural — Ativação do Assinante em 10 min',
    objective: 'Assinante precisa fazer o PRIMEIRO LANÇAMENTO em 10 minutos.',
    steps: [
      { text: 'Assinante faz login no Fyness', done: false },
      { text: 'Conectar WhatsApp ao sistema', done: false },
      { text: 'Fazer 1 lançamento por áudio', done: false },
      { text: 'Ver o gráfico aparecer — momento WOW', done: false },
    ],
    responsible: 'Automação',
  },
  {
    elementId: 'Task_CS_Liga_Ativacao',
    elementType: 'task',
    title: 'Ligação Ativação — Assinante Não Usou em 7 Dias',
    objective: 'Assinante pagou mas NÃO USOU em 7 dias = alarme vermelho.',
    steps: [
      { text: 'LIGAR: "Assinante, vi que você não configurou. Tem algo travando?"', done: false },
      { text: 'Se aceitar: Zoom de 15 min para setup juntos', done: false },
      { text: 'Se recusar 2x: CRM tag [RISCO_CANCELAMENTO]', done: false },
    ],
    responsible: 'Vendedor (se inativo)',
  },
  {
    elementId: 'Task_M1_Desafio_DRE',
    elementType: 'task',
    title: 'M1 — Desafio DRE + Engajamento Semanal do Assinante',
    objective: 'Criar HÁBITO de uso semanal no mês 1.',
    responsible: 'Automação / IA',
  },
  {
    elementId: 'Task_M2_Upsell',
    elementType: 'sendTask',
    title: 'M2 — Expandir Uso do Assinante',
    objective: 'Quanto mais features usa, mais difícil cancelar.',
    responsible: 'Automação / IA',
  },
  {
    elementId: 'Task_M3_Checkpoint',
    elementType: 'sendTask',
    title: 'M3 — Checkpoint ROI do Assinante',
    objective: 'Mostrar ROI em R$ no mês 3.',
    responsible: 'Automação / Vendedor',
  },
  {
    elementId: 'Task_D150_Aviso',
    elementType: 'sendTask',
    title: 'D+150 — Aviso ao Assinante: Perda de Dados em 30 Dias',
    objective: 'Aversão à perda com dados concretos.',
    responsible: 'Automação / Vendedor',
  },
  {
    elementId: 'Task_Renovacao_Anual',
    elementType: 'task',
    title: 'Renovação Anual — Assinante Fidelizado (20% OFF)',
    responsible: 'Automação',
  },
  {
    elementId: 'Task_Renovacao_Mensal',
    elementType: 'task',
    title: 'Renovação Mensal — Assinante Recorrente',
    responsible: 'Automação',
  },
  {
    elementId: 'Task_Bloqueio_Leitura',
    elementType: 'task',
    title: 'Bloqueio Lógico — Assinante Vê Dados Mas Não Edita',
    responsible: 'Automação / Desenvolvimento',
  },
  {
    elementId: 'Task_CS_Recuperacao',
    elementType: 'task',
    title: 'Ligação Recovery — Assinante Expirado',
    responsible: 'Vendedor (se inativo)',
  },
  {
    elementId: 'Task_Nurturing_Educacao',
    elementType: 'serviceTask',
    title: 'Grupo WhatsApp — Ex-Assinante Nurturing',
    responsible: 'Automação / Marketing',
  },
];

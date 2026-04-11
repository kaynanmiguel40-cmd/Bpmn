import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('c:/Users/kayna/Bpmn/src/utils/marketingTemplate.js', 'utf8');

const startMarker = '  <!-- ============================================================ -->\n  <!-- POOL 1: META ADS';
const endMarker = '  <!-- ============================================================ -->\n  <!-- POOL 2: GOOGLE ADS';

const startIdx = content.indexOf(startMarker);
const endIdx = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found', { startIdx, endIdx });
  process.exit(1);
}

const newMetaAds = `  <!-- ============================================================ -->
  <!-- POOL 1: META ADS — DESCOBERTA E CONVERSÃO                    -->
  <!-- ============================================================ -->
  <bpmn2:process id="Process_MetaAds" isExecutable="false">

    <bpmn2:startEvent id="Start_Meta_Setup" name="Setup Inicial da Conta Meta">
      <bpmn2:documentation>⚙️ SETUP INICIAL — FAZER UMA VEZ ANTES DE SUBIR QUALQUER ANÚNCIO

CHECKLIST OBRIGATÓRIO:
□ 1. Criar Conta de Anúncios no Gerenciador de Negócios (business.facebook.com)
□ 2. Adicionar forma de pagamento (cartão empresarial)
□ 3. Instalar o Meta Pixel no site/LP
□ 4. Verificar pixel (Meta Pixel Helper no Chrome)
□ 5. Configurar eventos de conversão:
   → ViewContent (visitou LP)
   → Lead (preencheu formulário)
   → CompleteRegistration (concluiu Trial)
□ 6. Conectar Instagram Fyness à Conta de Anúncios
□ 7. Criar Públicos Personalizados:
   → Visitantes da LP (últimos 30 dias)
   → Engajou no Instagram (últimos 30 dias)
   → Assistiu 50%+ dos vídeos (últimos 30 dias)
   → Lista de emails capturados (upload manual)
□ 8. Criar Públicos Lookalike (quando tiver 100+ clientes):
   → 1% Lookalike de clientes pagantes
   → 2% Lookalike de leads (Trial iniciado)
□ 9. Configurar limite de gastos diários na conta
□ 10. Adicionar UTM padrão em todos os anúncios:
   ?utm_source=meta&utm_medium=paid&utm_campaign=NOME&utm_content=CRIATIVO

RESPONSÁVEL: Kaynan (técnico) + Kauã (sobe criativos)</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Meta_Setup</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:serviceTask id="Task_Meta_Pixel_Publicos" name="Configurar Pixel + Públicos + Eventos">
      <bpmn2:documentation>🎯 CONFIGURAÇÃO DE PÚBLICOS — DETALHE COMPLETO

PÚBLICO FRIO (Campanha Consciência):
→ Interesses: Empreendedorismo, Gestão Empresarial, Finanças Empresariais,
   Pequenas e Médias Empresas, Contabilidade, Fluxo de Caixa
→ Concorrentes: Nibo, Conta Azul, Omie (alcança quem já pesquisou)
→ Comportamento: Proprietários de pequenas empresas, Tomadores de decisão
→ Faixa etária: 25–55 anos | Localização: Brasil
→ Excluir: quem já é cliente, quem já iniciou Trial

PÚBLICO QUENTE (Campanha Conversão):
→ Engajou com perfil Fyness nos últimos 30 dias
→ Assistiu 50%+ de qualquer vídeo (30 dias)
→ Visitou o perfil nos últimos 30 dias
→ Lookalike 1% de clientes pagantes (quando tiver base)

PÚBLICO HOT (Retargeting):
→ Visitou a LP (pixel) nos últimos 14 dias — NÃO converteu
→ Iniciou formulário mas não concluiu (7 dias)
→ Clicou em anúncio mas não preencheu (7 dias)

EXCLUSÕES OBRIGATÓRIAS EM TODOS OS CONJUNTOS:
→ Lista de clientes ativos (upload de CSV toda semana)
→ Leads que já iniciaram Trial (integração CRM → Meta)
→ Excluir público quente do conjunto frio (evitar sobreposição)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Setup</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Publicos</bpmn2:outgoing>
    </bpmn2:serviceTask>

    <bpmn2:startEvent id="Start_Meta_Consciencia" name="Campanha 1 — Consciência (Cold)">
      <bpmn2:documentation>🧊 CAMPANHA CONSCIÊNCIA — PÚBLICO FRIO
OBJETIVO: Reconhecimento | ORÇAMENTO: R$50/dia | LANCE: CPM automático
POSICIONAMENTOS: Automático (Feed + Reels + Stories)
DURAÇÃO: Permanente — só troca o criativo a cada 3-4 semanas</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Meta_C1_Start</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_Meta_Criativo_Consciencia" name="Brief Criativos — Consciência (Kauã Produz)">
      <bpmn2:documentation>🎬 BRIEF COMPLETO — CRIATIVOS DE CONSCIÊNCIA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRIATIVO A — REEL 15s (Robert) — GANCHO DE DOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[0–3s] "Você trabalha o mês inteiro... e no fim não sabe pra onde foi o dinheiro."
[3–8s] "Isso acontece porque você não tem controle financeiro real. Planilha não é controle. É ilusão."
[8–12s] "Empresário que enxerga os números decide melhor. Cresce mais. Sobra mais."
[12–15s] "Fyness — controle financeiro no WhatsApp. Link na bio."
DIREÇÃO: Fundo limpo, Robert com camisa social, cortes a cada 2s, texto na tela.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRIATIVO B — CARROSSEL 6 SLIDES (Kauã design)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Slide 1 (Capa): "5 sinais que seu financeiro está fora de controle"
Slide 2: "Você não sabe quanto sobra no fim do mês"
Slide 3: "Você descobre as contas no vencimento, não antes"
Slide 4: "Você usa planilha mas ela sempre está desatualizada"
Slide 5: "Você sente que trabalha muito e sobra pouco"
Slide 6 (CTA): "Se você se identificou... o Fyness foi feito pra você. 7 dias grátis."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRIATIVO C — REEL 30s (Kaynan) — BASTIDOR + DOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[0–3s] "Eu tenho 19 anos e descobri o erro que faz empresários perderem dinheiro sem perceber."
[3–15s] "A maioria dos pequenos empresários não tem controle financeiro real. Usa planilha, caderninho, ou pior: a memória."
[15–25s] "Quando fui entender esse problema, decidi construir a solução. Esse é o Fyness."
[25–30s] "7 dias grátis. Sem cartão. Link na bio."

COPY DO ANÚNCIO (texto acima do criativo):
"Você vende, recebe, paga fornecedor... e mesmo assim o saldo nunca fecha.
Não é falta de esforço. É falta de controle.
O Fyness resolve isso. 👇"

TESTE A/B: Criativo A (Robert) vs Criativo C (Kaynan)
→ Vence quem tiver melhor CTR em 7 dias → pausar perdedor</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_C1_Start</bpmn2:incoming>
      <bpmn2:incoming>Flow_Meta_Publicos</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_C1_Criativo</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:startEvent id="Start_Meta_Conversao" name="Campanha 2 — Conversão Trial (Warm)">
      <bpmn2:documentation>🔥 CAMPANHA CONVERSÃO — PÚBLICO QUENTE
OBJETIVO: Conversões (evento: Lead) | ORÇAMENTO: R$60/dia
LANCE: Custo por resultado — meta CPL abaixo de R$15
POSICIONAMENTOS: Feed + Stories + Reels (manual — excluir Audience Network)
ATIVAR QUANDO: Público quente tiver mínimo 1.000 pessoas</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Meta_C2_Start</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_Meta_Criativo_Conversao" name="Brief Criativos — Conversão (Produto em Ação)">
      <bpmn2:documentation>🎬 BRIEF COMPLETO — CRIATIVOS DE CONVERSÃO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRIATIVO D — REEL 30s — DEMO DO PRODUTO (Kaynan)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[0–3s] "Vou lançar um gasto no meu sistema financeiro em 10 segundos."
[3–15s] [Tela WhatsApp aparece]
Kaynan manda áudio: "Fyness, paguei R$350 de aluguel do escritório"
Sistema responde — lançamento categorizado aparece no painel.
[15–25s] "Seu DRE atualiza na hora. Sem planilha. Sem lembrar de nada." [Mostra painel com gráfico]
[25–30s] "7 dias grátis. Sem cartão. Clica no link."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRIATIVO E — REEL 20s — ANTES E DEPOIS (Robert)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[0–3s] "Esse era meu financeiro antes." [Mostra planilha caótica]
[3–10s] "Esse é depois." [Mostra painel Fyness limpo]
[10–17s] "DRE automático. Fluxo de caixa em tempo real. Alertas antes do vencimento."
[17–20s] "7 dias grátis pra você testar. Link na bio."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRIATIVO F — STORIES VERTICAL — CTA DIRETO (Kauã design)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frame 1: "Você ainda usa planilha pra controlar o financeiro?"
Frame 2: "O Fyness faz isso automaticamente. Via WhatsApp."
Frame 3: "7 dias grátis. Sem cartão. Começa agora." [Sticker de link pra LP]

COPY DO ANÚNCIO:
"Manda um áudio no WhatsApp. O Fyness lança no financeiro automaticamente.
DRE, Fluxo de Caixa e Alertas — tudo em tempo real.
Sem planilha. Sem contador. Sem complicação.
👇 7 dias grátis pra testar (sem cartão)"

TESTE A/B: Criativo D (demo técnica) vs Criativo E (antes/depois emocional)
→ KPI: CPL → vence em 7 dias</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_C2_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_C2_Criativo</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:startEvent id="Start_Meta_Retargeting" name="Campanha 3 — Retargeting (Hot)">
      <bpmn2:documentation>🔁 CAMPANHA RETARGETING — VISITOU LP, NÃO CONVERTEU
OBJETIVO: Conversões | ORÇAMENTO: R$25/dia
PÚBLICO: Visitou LP (14 dias) + NÃO converteu (excluir clientes/trials)
FREQUÊNCIA: Máx 3x/semana por usuário
ESTRATÉGIA: Não apresentar produto de novo — responder a objeção que travou o lead</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Meta_C3_Start</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_Meta_Criativo_Retargeting" name="Brief Criativos — Retargeting (Quebra de Objeções)">
      <bpmn2:documentation>🎬 BRIEF COMPLETO — CRIATIVOS DE RETARGETING

ESTRATÉGIA: Cada criativo responde UMA objeção. Rodar os 4 e ver qual retorna mais.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRIATIVO G — "É complicado de usar"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO: Stories 15s
"Sem instalar nada. Sem manual. Sem aprender sistema.
Você manda uma mensagem no WhatsApp. O Fyness cuida do resto.
Testa 7 dias grátis. Link aqui 👆"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRIATIVO H — "Não tenho tempo pra isso agora"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO: Reel 10s (Kaynan)
"Tempo pra lançar um gasto no Fyness: 10 segundos.
Tempo pra descobrir depois que tava no vermelho: tarde demais.
7 dias grátis. Agora."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRIATIVO I — "Não quero comprometer cartão"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO: Imagem estática
"Você foi até o site. Mas não testou ainda.
Os 7 dias grátis ainda estão esperando.
Sem cartão. Sem comprometimento. Só teste.
[Botão: Quero testar agora]"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRIATIVO J — URGÊNCIA (após 7 dias sem retorno)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO: Stories animado
"Você passou pelo Fyness mas não testou.
Enquanto isso, o financeiro do seu negócio continua sem controle.
Clica aqui. 7 dias grátis. Não custa nada."

ROTATIVIDADE:
→ Lead que não converteu em 7 dias com retargeting → pausar por 30 dias
→ Após 30 dias → reentrar com criativo completamente novo (ciclo fresco)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_C3_Start</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_C3_Criativo</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Meta_Publicar" name="Publicar Campanhas no Gerenciador (Estrutura Completa)">
      <bpmn2:documentation>📤 ESTRUTURA FINAL NO GERENCIADOR DE ANÚNCIOS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 CAMPANHA 1 — CONSCIÊNCIA (R$50/dia)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Objetivo: Reconhecimento
  └── Conjunto A: Interesses amplos (empreendedores BR)
        Anúncio 1: Criativo A (Robert — dor)
        Anúncio 2: Criativo C (Kaynan — bastidor)
  └── Conjunto B: Lookalike 2% leads (ativar com base)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 CAMPANHA 2 — CONVERSÃO TRIAL (R$60/dia)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Objetivo: Conversões (evento: Lead)
  └── Conjunto A: Engajou perfil + assistiu vídeos (30d)
        Anúncio 1: Criativo D (demo técnica)
        Anúncio 2: Criativo E (antes/depois)
  └── Conjunto B: Interesses qualificados (backup)
        Anúncio 1: Criativo F (Stories CTA direto)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📁 CAMPANHA 3 — RETARGETING (R$25/dia)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Objetivo: Conversões
  └── Conjunto A: Visitou LP 14d (não converteu)
        Anúncio 1: Criativo G | Anúncio 2: Criativo H | Anúncio 3: Criativo I

TOTAL: R$135/dia | ~R$4.050/mês

CONFIGURAÇÕES TÉCNICAS OBRIGATÓRIAS:
□ Budget no nível do CONJUNTO (não campanha — mais controle)
□ Programação: 24h (não limitar horário no início)
□ Attribution window: 7 dias após clique + 1 dia após visualização
□ UTM em todos os anúncios (rastrear origem no GA4)
□ Verificar aprovação dos anúncios (Meta rejeita copy agressiva sobre finanças — ter variação pronta)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_C1_Criativo</bpmn2:incoming>
      <bpmn2:incoming>Flow_Meta_C2_Criativo</bpmn2:incoming>
      <bpmn2:incoming>Flow_Meta_C3_Criativo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Publicado</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Meta_Semana1" name="7 dias">
      <bpmn2:documentation>⏱️ Aguarda 7 dias após subir as campanhas.
NÃO mexer antes disso — algoritmo precisa de tempo de aprendizado.
Mínimo 50 eventos de conversão por conjunto para sair da fase de aprendizado.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Publicado</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_T7</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>P7D</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Meta_Analise_Semanal" name="Análise Semanal — Toda Segunda-feira (30 min)">
      <bpmn2:documentation>📊 CHECKLIST DE ANÁLISE SEMANAL — META ADS
Responsável: Kaynan | Ferramenta: Gerenciador de Anúncios + GA4

CAMPANHA CONSCIÊNCIA — checar:
□ CPM (meta: abaixo de R$20)
□ CTR (meta: acima de 1%)
□ Frequência (acima de 3? → trocar criativo)
□ Alcance único crescendo semana a semana?

CAMPANHA CONVERSÃO — checar:
□ CPL — Custo por Lead (meta: abaixo de R$15)
□ CTR (meta: acima de 1,5%)
□ Taxa de conversão LP (meta: acima de 3%)
□ CPC (meta: abaixo de R$2)

CAMPANHA RETARGETING — checar:
□ Frequência (acima de 5? → renovar criativo imediatamente)
□ Custo por conversão (meta: abaixo de R$20)
□ Tamanho do público (muito pequeno? problema de pixel)

ANÁLISE DE CRIATIVOS:
□ Melhor CTR da semana → escalar 20% do orçamento
□ CTR abaixo de 0,8% por 7 dias → pausar
□ Algum criativo com 7+ dias e menos de 500 impressões? → problema de aprovação

REGISTRAR NO NOTION:
→ Data | CPL | CTR | Melhor criativo | Ação tomada</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_T7</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Analise</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Meta_CPL" name="CPL abaixo de R$15?">
      <bpmn2:incoming>Flow_Meta_Analise</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_CPL_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Meta_CPL_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:task id="Task_Meta_Escalar" name="Escalar: +20% Budget no Melhor Conjunto">
      <bpmn2:documentation>📈 CAMPANHA PERFORMANDO — ESCALAR COM CAUTELA

CPL abaixo de R$15. É hora de escalar.

REGRAS DE ESCALONAMENTO:
→ Aumentar budget do MELHOR conjunto em 20% (nunca dobrar de uma vez)
→ Esperar 3 dias antes de escalar novamente
→ Se após 3 dias CPL ainda bom → mais 20%
→ Limite seguro sem especialista: R$500/dia por conjunto

ORDEM DE ESCALONAMENTO:
1. Campanha Conversão (retorno direto)
2. Campanha Consciência (alimenta o funil)
3. Retargeting (público menor — cuidado com saturação)

ESCALONAMENTO HORIZONTAL (alternativa mais segura):
→ Em vez de aumentar budget → criar novo conjunto com público similar
→ Lookalike 1% funciona? → testar Lookalike 2%
→ Interesses A funcionam? → testar interesses B similares

SINAL DE ALERTA (parar de escalar):
→ CPL sobe mais de 30% após escalonamento → voltar ao budget anterior
→ Frequência explode após escalonamento → público muito pequeno</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_CPL_Sim</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Loop</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Meta_Otimizar_Criativo" name="Otimizar: Diagnóstico + Pausar Fraco + Criar Novo">
      <bpmn2:documentation>🔧 CAMPANHA NÃO PERFORMANDO — DIAGNÓSTICO COMPLETO

CPL acima de R$15. Não aumentar budget antes de resolver.

ÁRVORE DE DIAGNÓSTICO:

❓ CTR está baixo (menos de 1%)?
   → SIM: Problema no CRIATIVO (não está parando o scroll)
   → AÇÃO: Testar novo hook nos primeiros 3 segundos
   → Pausar criativo atual. Criar versão nova com abertura diferente.
   → Referências de hook que funcionam: dado chocante, pergunta, afirmação polêmica

❓ CTR está bom mas CPL está alto?
   → SIM: Problema na LANDING PAGE (não está convertendo)
   → AÇÃO: Checar taxa de conversão LP no GA4
   → A/B test na LP: mudar headline, CTA ou formulário
   → Verificar velocidade da LP (PageSpeed Insights — meta: acima de 70)

❓ CPM está alto (acima de R$30)?
   → SIM: Público muito pequeno ou muito competitivo
   → AÇÃO: Ampliar segmentação (faixa etária, interesses adicionais)
   → Ou testar horário (madrugada = CPM menor, mas qualidade menor)

❓ Frequência alta (acima de 3,5)?
   → SIM: Fadiga de anúncio — mesmo público vendo muito
   → AÇÃO: Trocar criativo OU expandir público
   → Criativo dura em média 3-4 semanas antes de cansar

❓ Anúncio reprovado?
   → SIM: Meta rejeita termos como "sua situação financeira", "dívida", "problemas com dinheiro"
   → AÇÃO: Ter sempre uma versão alternativa da copy sem esses termos
   → Substituição: "Controle total do seu negócio" em vez de "não saber pra onde vai o dinheiro"</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_CPL_Nao</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_Loop</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Meta_Mensal" name="30 dias">
      <bpmn2:documentation>⏱️ A cada 30 dias: relatório completo + planejamento do próximo mês.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_Loop</bpmn2:incoming>
      <bpmn2:incoming>Flow_Meta_Loop2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_T30</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>P30D</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Meta_Relatorio_Mensal" name="Relatório Mensal + Planejamento do Próximo Mês">
      <bpmn2:documentation>📋 RELATÓRIO MENSAL META ADS — Kaynan monta, apresenta para Robert

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUMO DO MÊS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Total investido: R$___
• Total de leads gerados: ___
• CPL médio: R$___
• Trials iniciados via Meta: ___
• Conversões em clientes pagantes: ___
• CAC (Custo de Aquisição de Cliente): R$___
• ROAS estimado: ___x
• Canal com melhor CPL: Consciência / Conversão / Retargeting

CRIATIVOS DO MÊS:
• Melhor CTR: ___ (Criativo ___)
• Melhor CPL: ___ (Criativo ___)
• Pausados por baixa performance: ___
• Novos criativos testados: ___

PÚBLICO:
• Público frio saturando? → expandir para próximo mês?
• Lookalike disponível? → ativar?
• Principais estados/cidades com melhor performance?

DECISÕES PARA O PRÓXIMO MÊS:
□ Budget: manter R$135/dia OU escalar para R$___/dia
□ Novos criativos: ___ (temas + quem grava)
□ Novo teste de público: ___
□ Ajuste na LP se conversão abaixo de 3%

META DO PRÓXIMO MÊS:
Leads: ___ | CPL meta: R$___ | CAC meta: R$___</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_T30</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Meta_LP_Link</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Meta_LP" name="→ Landing Page">
      <bpmn2:documentation>Tráfego gerado pelo Meta Ads chega à Landing Page.
A LP decide: converte em Trial ou entra em Nutrição. (Ver pool LANDING PAGE)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Meta_LP_Link</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_LP" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:sequenceFlow id="Flow_Meta_Setup"       sourceRef="Start_Meta_Setup"              targetRef="Task_Meta_Pixel_Publicos" />
    <bpmn2:sequenceFlow id="Flow_Meta_Publicos"    sourceRef="Task_Meta_Pixel_Publicos"       targetRef="Task_Meta_Criativo_Consciencia" />
    <bpmn2:sequenceFlow id="Flow_Meta_C1_Start"    sourceRef="Start_Meta_Consciencia"         targetRef="Task_Meta_Criativo_Consciencia" />
    <bpmn2:sequenceFlow id="Flow_Meta_C2_Start"    sourceRef="Start_Meta_Conversao"           targetRef="Task_Meta_Criativo_Conversao" />
    <bpmn2:sequenceFlow id="Flow_Meta_C3_Start"    sourceRef="Start_Meta_Retargeting"         targetRef="Task_Meta_Criativo_Retargeting" />
    <bpmn2:sequenceFlow id="Flow_Meta_C1_Criativo" sourceRef="Task_Meta_Criativo_Consciencia" targetRef="Task_Meta_Publicar" />
    <bpmn2:sequenceFlow id="Flow_Meta_C2_Criativo" sourceRef="Task_Meta_Criativo_Conversao"   targetRef="Task_Meta_Publicar" />
    <bpmn2:sequenceFlow id="Flow_Meta_C3_Criativo" sourceRef="Task_Meta_Criativo_Retargeting" targetRef="Task_Meta_Publicar" />
    <bpmn2:sequenceFlow id="Flow_Meta_Publicado"   sourceRef="Task_Meta_Publicar"             targetRef="Timer_Meta_Semana1" />
    <bpmn2:sequenceFlow id="Flow_Meta_T7"          sourceRef="Timer_Meta_Semana1"             targetRef="Task_Meta_Analise_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Meta_Analise"     sourceRef="Task_Meta_Analise_Semanal"      targetRef="Gateway_Meta_CPL" />
    <bpmn2:sequenceFlow id="Flow_Meta_CPL_Sim" name="Sim" sourceRef="Gateway_Meta_CPL"        targetRef="Task_Meta_Escalar" />
    <bpmn2:sequenceFlow id="Flow_Meta_CPL_Nao" name="Não" sourceRef="Gateway_Meta_CPL"        targetRef="Task_Meta_Otimizar_Criativo" />
    <bpmn2:sequenceFlow id="Flow_Meta_Loop"        sourceRef="Task_Meta_Escalar"              targetRef="Timer_Meta_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Meta_Loop2"       sourceRef="Task_Meta_Otimizar_Criativo"    targetRef="Timer_Meta_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Meta_T30"         sourceRef="Timer_Meta_Mensal"              targetRef="Task_Meta_Relatorio_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Meta_LP_Link"     sourceRef="Task_Meta_Relatorio_Mensal"     targetRef="LinkThrow_Meta_LP" />

  </bpmn2:process>

`;

const before = content.substring(0, startIdx);
const after = content.substring(endIdx);
const result = before + newMetaAds + after;

writeFileSync('c:/Users/kayna/Bpmn/src/utils/marketingTemplate.js', result, 'utf8');
console.log('Done!', result.length, 'chars,', result.split('\n').length, 'lines');

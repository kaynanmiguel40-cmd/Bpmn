/**
 * Template BPMN - ESTRATÉGIA DE MARKETING FYNESS
 * Pools: META ADS | GOOGLE ADS | ROBERT (IG+TikTok) | KAYNAN (IG+TikTok) | TIKTOK+YOUTUBE
 * FYNESS INSTITUCIONAL (IG+TikTok) | LANDING PAGE | YOUTUBE — Canal Unico Fyness
 * Nutrição e Trial 7 Dias → continuam no BPMN Comercial V9
 * Criado: Março 2026 | Equipe: Robert (financeiro), Kaynan (tech/produto), Kauã (produção)
 */

export const MARKETING_TEMPLATE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL"
 xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
 xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
 xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
 xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0"
 id="Definitions_Marketing"
 targetNamespace="http://fyness.com/bpmn/marketing-v1">

 <bpmn2:collaboration id="Collaboration_Marketing">
 <bpmn2:participant id="Participant_MetaAds" name=" META ADS — Descoberta" processRef="Process_MetaAds" />
 <bpmn2:participant id="Participant_GoogleAds" name=" GOOGLE ADS — Intenção Alta" processRef="Process_GoogleAds" />
 <bpmn2:participant id="Participant_Robert" name=" ROBERT — Autoridade Financeira" processRef="Process_Robert" />
 <bpmn2:participant id="Participant_Kaynan" name=" KAYNAN — Proximidade e Produto" processRef="Process_Kaynan" />
 <bpmn2:participant id="Participant_Institucional" name=" FYNESS — Perfil Institucional" processRef="Process_Institucional" />
 <bpmn2:participant id="Participant_LP" name=" LANDING PAGE — Jornada do Visitante" processRef="Process_LP" />
 <bpmn2:participant id="Participant_MultiPlat" name=" YOUTUBE — Canal Unico Fyness (Robert + Kaynan + Kaua)" processRef="Process_MultiPlat" />
 <bpmn2:textAnnotation id="Annotation_InMarketing">
   <bpmn2:text>IN MARKETING — POSICIONAMENTO DE MARCA

Toda a equipe Fyness funciona como midia da marca.
"Todos aqui dentro sao vendedores."

Kit personalizado Fyness:
- Polo (trabalho + vendas)
- Camisa Slim (academia + casual)
- Jaqueta personalizada
- Garrafinha
- Bone

Equipe: Robert (financeiro), Kaynan (tech/produto), Kaua (producao)
Cada membro e um ponto de contato e visibilidade no dia a dia.</bpmn2:text>
 </bpmn2:textAnnotation>
 <bpmn2:textAnnotation id="Annotation_CAC">
   <bpmn2:text>CAC MAXIMO, UNIT ECONOMICS E FILTRO DE CLIENTE

MODELO DE PRECO:
- Mensal: R$197/mes (recorrente no cartao)
- Anual: R$137/mes no cartao, Fyness antecipa 12 meses (~R$1.644 na hora)
- Trial: 7 dias gratis, sem cartao

UNIT ECONOMICS:
- Churn estimado SaaS B2B BR: 5-8%/mes
- LTV estimado (mensal): R$2.500 a R$4.000
- LTV minimo (anual com antecipacao): R$1.644 (recebido na hora)

CAC MAXIMO SEGURO: R$300-400
- No anual: payback imediato (antecipa R$1.644, gastou R$300-400 pra adquirir)
- No mensal: payback em 2 meses (R$197 x 2 = R$394)
- SE CAC passar de R$400: PARAR de escalar e otimizar antes

REGRA DE OURO:
- CAC deve ser no maximo 25% do LTV
- Todo gateway de "escalar" nos pools deve checar CAC antes
- Escalar = mais budget SO SE CAC esta saudavel

FILTRO DE CLIENTE IDEAL:
- Faturamento minimo: R$10.000/mes
- Tem pelo menos 1 funcionario (indica operacao real)
- Controla financeiro na cabeca, caderninho ou planilha abandonada
- MEI fraco (fatura R$3-5k, sem funcionario) = NAO e cliente Fyness
  → Da muito trabalho de suporte e churn alto
  → R$197/mes pesa demais no orcamento dele</bpmn2:text>
 </bpmn2:textAnnotation>
 </bpmn2:collaboration>

 <!-- ============================================================ -->
 <!-- POOL 1: META ADS — DESCOBERTA E CONVERSÃO -->
 <!-- ============================================================ -->
 <bpmn2:process id="Process_MetaAds" isExecutable="false">

 <bpmn2:startEvent id="Start_Meta_Setup" name="Setup Inicial da Conta Meta">
 <bpmn2:documentation> SETUP INICIAL — FAZER UMA VEZ ANTES DE SUBIR QUALQUER ANÚNCIO

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
 <bpmn2:documentation> CONFIGURAÇÃO DE PÚBLICOS — DETALHE COMPLETO

PÚBLICO FRIO (Campanha Consciência) — FOCO: NEGOCIO COM FATURAMENTO R$10k+/MES:
→ Interesses PRIMARIOS:
  Empreendedorismo, Pequenos Negocios, Gestao de Negocios,
  Sebrae, Simples Nacional, Comercio Local
  (EVITAR "MEI" isolado — atrai MEI fraco que fatura pouco)
→ Interesses SECUNDARIOS (setores com faturamento medio alto):
  Padaria, Salao de Beleza com funcionarios, Barbearia Premium,
  Restaurante, Hamburgueria, Pet Shop, Oficina Mecanica,
  Loja de Roupas, Acai, Food Truck (operacao media/grande)
→ FILTRO DE QUALIDADE (importante):
  Comportamento: "Administradores de Paginas de Negocios" (indica negocio real, nao hobby)
  Excluir: "Trabalho autonomo" sem equipe, "Freelancer", "Renda extra"
  Priorizar: quem tem funcionarios, quem usa maquininha de cartao, quem tem CNPJ ativo
→ Concorrentes: Nibo, Conta Azul, Omie (alcanca quem ja pesquisou)
→ Comportamento: Proprietarios de pequenos negocios, Administradores de paginas comerciais
→ Faixa etaria: 25-55 anos | Localizacao: Brasil (refinar por estado apos dados)
→ Excluir: quem ja e cliente, quem ja iniciou Trial
→ IMPORTANTE: NAO segmentar por "Gestao Empresarial" ou "Financas Empresariais" —
  MEI nao se identifica com esses termos. Usar "Pequenos Negocios" e setores especificos.

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
 <bpmn2:documentation> CAMPANHA CONSCIÊNCIA — PÚBLICO FRIO
OBJETIVO: Reconhecimento | ORÇAMENTO: R$50/dia | LANCE: CPM automático
POSICIONAMENTOS: Automático (Feed + Reels + Stories)
DURAÇÃO: Permanente — só troca o criativo a cada 3-4 semanas</bpmn2:documentation>
 <bpmn2:outgoing>Flow_Meta_C1_Start</bpmn2:outgoing>
 </bpmn2:startEvent>

 <bpmn2:task id="Task_Meta_Criativo_Consciencia" name="Brief Criativos — Consciência (Kauã Produz)">
 <bpmn2:documentation> BRIEF COMPLETO — CRIATIVOS DE CONSCIÊNCIA

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
O Fyness resolve isso. "

TESTE A/B: Criativo A (Robert) vs Criativo C (Kaynan)
→ Vence quem tiver melhor CTR em 7 dias → pausar perdedor</bpmn2:documentation>
 <bpmn2:incoming>Flow_Meta_C1_Start</bpmn2:incoming>
 <bpmn2:incoming>Flow_Meta_Publicos</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Meta_C1_Criativo</bpmn2:outgoing>
 </bpmn2:task>

 <bpmn2:startEvent id="Start_Meta_Conversao" name="Campanha 2 — Conversão Trial (Warm)">
 <bpmn2:documentation> CAMPANHA CONVERSÃO — PÚBLICO QUENTE
OBJETIVO: Conversões (evento: Lead) | ORÇAMENTO: R$60/dia
LANCE: Custo por resultado — meta CPL abaixo de R$15
POSICIONAMENTOS: Feed + Stories + Reels (manual — excluir Audience Network)
ATIVAR QUANDO: Público quente tiver mínimo 1.000 pessoas</bpmn2:documentation>
 <bpmn2:outgoing>Flow_Meta_C2_Start</bpmn2:outgoing>
 </bpmn2:startEvent>

 <bpmn2:task id="Task_Meta_Criativo_Conversao" name="Brief Criativos — Conversão (Produto em Ação)">
 <bpmn2:documentation> BRIEF COMPLETO — CRIATIVOS DE CONVERSÃO

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
 7 dias grátis pra testar (sem cartão)"

TESTE A/B: Criativo D (demo técnica) vs Criativo E (antes/depois emocional)
→ KPI: CPL → vence em 7 dias</bpmn2:documentation>
 <bpmn2:incoming>Flow_Meta_C2_Start</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Meta_C2_Criativo</bpmn2:outgoing>
 </bpmn2:task>

 <bpmn2:startEvent id="Start_Meta_Retargeting" name="Campanha 3 — Retargeting (Hot)">
 <bpmn2:documentation> CAMPANHA RETARGETING — VISITOU LP, NÃO CONVERTEU
OBJETIVO: Conversões | ORÇAMENTO: R$25/dia
PÚBLICO: Visitou LP (14 dias) + NÃO converteu (excluir clientes/trials)
FREQUÊNCIA: Máx 3x/semana por usuário
ESTRATÉGIA: Não apresentar produto de novo — responder a objeção que travou o lead</bpmn2:documentation>
 <bpmn2:outgoing>Flow_Meta_C3_Start</bpmn2:outgoing>
 </bpmn2:startEvent>

 <bpmn2:task id="Task_Meta_Criativo_Retargeting" name="Brief Criativos — Retargeting (Quebra de Objeções)">
 <bpmn2:documentation> BRIEF COMPLETO — CRIATIVOS DE RETARGETING

ESTRATÉGIA: Cada criativo responde UMA objeção. Rodar os 4 e ver qual retorna mais.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRIATIVO G — "É complicado de usar"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORMATO: Stories 15s
"Sem instalar nada. Sem manual. Sem aprender sistema.
Você manda uma mensagem no WhatsApp. O Fyness cuida do resto.
Testa 7 dias grátis. Link aqui "

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
 <bpmn2:documentation> ESTRUTURA FINAL NO GERENCIADOR DE ANÚNCIOS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CAMPANHA 1 — CONSCIÊNCIA (R$50/dia)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Objetivo: Reconhecimento
 └── Conjunto A: Interesses amplos (empreendedores BR)
 Anúncio 1: Criativo A (Robert — dor)
 Anúncio 2: Criativo C (Kaynan — bastidor)
 └── Conjunto B: Lookalike 2% leads (ativar com base)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CAMPANHA 2 — CONVERSÃO TRIAL (R$60/dia)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Objetivo: Conversões (evento: Lead)
 └── Conjunto A: Engajou perfil + assistiu vídeos (30d)
 Anúncio 1: Criativo D (demo técnica)
 Anúncio 2: Criativo E (antes/depois)
 └── Conjunto B: Interesses qualificados (backup)
 Anúncio 1: Criativo F (Stories CTA direto)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 CAMPANHA 3 — RETARGETING (R$25/dia)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Objetivo: Conversões
 └── Conjunto A: Visitou LP 14d (não converteu)
 Anúncio 1: Criativo G | Anúncio 2: Criativo H | Anúncio 3: Criativo I

TOTAL: R$135/dia | ~R$4.050/mês

NOTA DE FASE:
→ Se estiver começando, NÃO ligar Meta e Google ao mesmo tempo.
→ Fase 1 (mês 1-2): Apenas Meta Ads (R$135/dia) — validar criativos e CPL
→ Fase 2 (mês 3+): Adicionar Google Ads quando Meta já estiver otimizado
→ Orgânico (Robert, Kaynan, @fynessbr) roda desde o dia 1 — custo zero
→ Só escalar quando CAC estiver abaixo do LTV do primeiro mês (R$197)

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
 <bpmn2:documentation>⏱ Aguarda 7 dias após subir as campanhas.
NÃO mexer antes disso — algoritmo precisa de tempo de aprendizado.
Mínimo 50 eventos de conversão por conjunto para sair da fase de aprendizado.</bpmn2:documentation>
 <bpmn2:incoming>Flow_Meta_Publicado</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Meta_T7</bpmn2:outgoing>
 <bpmn2:timerEventDefinition><bpmn2:timeDuration>P7D</bpmn2:timeDuration></bpmn2:timerEventDefinition>
 </bpmn2:intermediateCatchEvent>

 <bpmn2:task id="Task_Meta_Analise_Semanal" name="Análise Semanal — Toda Segunda-feira (30 min)">
 <bpmn2:documentation> CHECKLIST DE ANÁLISE SEMANAL — META ADS
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
 <bpmn2:documentation> CAMPANHA PERFORMANDO — ESCALAR COM CAUTELA

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
 <bpmn2:documentation> CAMPANHA NÃO PERFORMANDO — DIAGNÓSTICO COMPLETO

CPL acima de R$15. Não aumentar budget antes de resolver.

ÁRVORE DE DIAGNÓSTICO:

 CTR está baixo (menos de 1%)?
 → SIM: Problema no CRIATIVO (não está parando o scroll)
 → AÇÃO: Testar novo hook nos primeiros 3 segundos
 → Pausar criativo atual. Criar versão nova com abertura diferente.
 → Referências de hook que funcionam: dado chocante, pergunta, afirmação polêmica

 CTR está bom mas CPL está alto?
 → SIM: Problema na LANDING PAGE (não está convertendo)
 → AÇÃO: Checar taxa de conversão LP no GA4
 → A/B test na LP: mudar headline, CTA ou formulário
 → Verificar velocidade da LP (PageSpeed Insights — meta: acima de 70)

 CPM está alto (acima de R$30)?
 → SIM: Público muito pequeno ou muito competitivo
 → AÇÃO: Ampliar segmentação (faixa etária, interesses adicionais)
 → Ou testar horário (madrugada = CPM menor, mas qualidade menor)

 Frequência alta (acima de 3,5)?
 → SIM: Fadiga de anúncio — mesmo público vendo muito
 → AÇÃO: Trocar criativo OU expandir público
 → Criativo dura em média 3-4 semanas antes de cansar

 Anúncio reprovado?
 → SIM: Meta rejeita termos como "sua situação financeira", "dívida", "problemas com dinheiro"
 → AÇÃO: Ter sempre uma versão alternativa da copy sem esses termos
 → Substituição: "Controle total do seu negócio" em vez de "não saber pra onde vai o dinheiro"</bpmn2:documentation>
 <bpmn2:incoming>Flow_Meta_CPL_Nao</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Meta_Loop</bpmn2:outgoing>
 </bpmn2:task>

 <bpmn2:intermediateCatchEvent id="Timer_Meta_Mensal" name="30 dias">
 <bpmn2:documentation>⏱ A cada 30 dias: relatório completo + planejamento do próximo mês.</bpmn2:documentation>
 <bpmn2:incoming>Flow_Meta_Loop</bpmn2:incoming>
 <bpmn2:incoming>Flow_Meta_Loop2</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Meta_T30</bpmn2:outgoing>
 <bpmn2:timerEventDefinition><bpmn2:timeDuration>P30D</bpmn2:timeDuration></bpmn2:timerEventDefinition>
 </bpmn2:intermediateCatchEvent>

 <bpmn2:task id="Task_Meta_Relatorio_Mensal" name="Relatório Mensal + Planejamento do Próximo Mês">
 <bpmn2:documentation> RELATÓRIO MENSAL META ADS — Kaynan monta, apresenta para Robert

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

 <bpmn2:intermediateThrowEvent id="LinkThrow_Meta_LP" name="→ Landing Page (todas as plataformas)">
 <bpmn2:documentation>Tráfego gerado pelo Meta Ads chega à Landing Page.
A LP decide: converte em Trial ou entra em Nutrição. (Ver pool LANDING PAGE)</bpmn2:documentation>
 <bpmn2:incoming>Flow_Meta_LP_Link</bpmn2:incoming>
 <bpmn2:linkEventDefinition name="Link_LP" />
 </bpmn2:intermediateThrowEvent>

 <bpmn2:sequenceFlow id="Flow_Meta_Setup" sourceRef="Start_Meta_Setup" targetRef="Task_Meta_Pixel_Publicos" />
 <bpmn2:sequenceFlow id="Flow_Meta_Publicos" sourceRef="Task_Meta_Pixel_Publicos" targetRef="Task_Meta_Criativo_Consciencia" />
 <bpmn2:sequenceFlow id="Flow_Meta_C1_Start" sourceRef="Start_Meta_Consciencia" targetRef="Task_Meta_Criativo_Consciencia" />
 <bpmn2:sequenceFlow id="Flow_Meta_C2_Start" sourceRef="Start_Meta_Conversao" targetRef="Task_Meta_Criativo_Conversao" />
 <bpmn2:sequenceFlow id="Flow_Meta_C3_Start" sourceRef="Start_Meta_Retargeting" targetRef="Task_Meta_Criativo_Retargeting" />
 <bpmn2:sequenceFlow id="Flow_Meta_C1_Criativo" sourceRef="Task_Meta_Criativo_Consciencia" targetRef="Task_Meta_Publicar" />
 <bpmn2:sequenceFlow id="Flow_Meta_C2_Criativo" sourceRef="Task_Meta_Criativo_Conversao" targetRef="Task_Meta_Publicar" />
 <bpmn2:sequenceFlow id="Flow_Meta_C3_Criativo" sourceRef="Task_Meta_Criativo_Retargeting" targetRef="Task_Meta_Publicar" />
 <bpmn2:sequenceFlow id="Flow_Meta_Publicado" sourceRef="Task_Meta_Publicar" targetRef="Timer_Meta_Semana1" />
 <bpmn2:sequenceFlow id="Flow_Meta_T7" sourceRef="Timer_Meta_Semana1" targetRef="Task_Meta_Analise_Semanal" />
 <bpmn2:sequenceFlow id="Flow_Meta_Analise" sourceRef="Task_Meta_Analise_Semanal" targetRef="Gateway_Meta_CPL" />
 <bpmn2:sequenceFlow id="Flow_Meta_CPL_Sim" name="Sim" sourceRef="Gateway_Meta_CPL" targetRef="Task_Meta_Escalar" />
 <bpmn2:sequenceFlow id="Flow_Meta_CPL_Nao" name="Não" sourceRef="Gateway_Meta_CPL" targetRef="Task_Meta_Otimizar_Criativo" />
 <bpmn2:sequenceFlow id="Flow_Meta_Loop" sourceRef="Task_Meta_Escalar" targetRef="Timer_Meta_Mensal" />
 <bpmn2:sequenceFlow id="Flow_Meta_Loop2" sourceRef="Task_Meta_Otimizar_Criativo" targetRef="Timer_Meta_Mensal" />
 <bpmn2:sequenceFlow id="Flow_Meta_T30" sourceRef="Timer_Meta_Mensal" targetRef="Task_Meta_Relatorio_Mensal" />
 <bpmn2:sequenceFlow id="Flow_Meta_LP_Link" sourceRef="Task_Meta_Relatorio_Mensal" targetRef="LinkThrow_Meta_LP" />

 </bpmn2:process>

 <!-- ============================================================ -->
 <!-- POOL 2: GOOGLE ADS — INTENÇÃO ALTA -->
 <!-- ============================================================ -->
 <bpmn2:process id="Process_GoogleAds" isExecutable="false">

 <!-- ===== CONFIGURAÇÃO INICIAL ===== -->

 <bpmn2:startEvent id="Start_Google_Setup" name="Setup Inicial da Conta Google Ads">
 <bpmn2:documentation> SETUP INICIAL — FAZER UMA VEZ ANTES DE SUBIR QUALQUER CAMPANHA

CHECKLIST OBRIGATÓRIO:
□ 1. Criar conta Google Ads (ads.google.com) com email profissional Fyness
□ 2. Instalar a tag do Google Ads no site/LP (via Google Tag Manager recomendado)
□ 3. Vincular ao Google Analytics 4 (GA4) — importar conversões do GA4 pro Ads
□ 4. Configurar conversões:
 → Trial Iniciado (CompleteRegistration) — PRIMÁRIA (valor: R$0, mas conta como conversão)
 → Formulário Preenchido — PRIMÁRIA
 → Página de Obrigado (/obrigado) — SECUNDÁRIA (verificação)
□ 5. Verificar propriedade do site no Google Search Console
□ 6. Criar lista de remarketing (visitantes da LP — mínimo 100 usuários pra ativar Display)
□ 7. Configurar alertas automáticos de gasto (notificar se gastar 20% acima do previsto)
□ 8. Definir fuso horário: Brasília (GMT-3)
□ 9. Definir moeda: BRL (Real Brasileiro)
□ 10. Adicionar UTMs padrão em todos os anúncios:
 ?utm_source=google&utm_medium=cpc&utm_campaign=NOME&utm_term={keyword}&utm_content=ANUNCIO

RESPONSÁVEL: Kaynan (configuração técnica)</bpmn2:documentation>
 <bpmn2:outgoing>Flow_Google_Setup</bpmn2:outgoing>
 </bpmn2:startEvent>

 <bpmn2:serviceTask id="Task_Google_ContaEstrutura" name="Configurar Conta: Conversões + Extensões + Estrutura">
 <bpmn2:documentation> ESTRUTURA COMPLETA DA CONTA GOOGLE ADS

HIERARQUIA:
 CONTA: Fyness Google Ads
 └── CAMPANHA 1: Search — Intenção Alta
 └── Grupo 1: Gestão Financeira (palavras do produto)
 └── Grupo 2: Concorrência (busca por concorrentes)
 └── Grupo 3: Branded (nome Fyness)
 └── CAMPANHA 2: Display — Retargeting
 └── Grupo 1: Visitou LP (7 dias)
 └── Grupo 2: Abandonou formulário (14 dias)

CONFIGURAÇÕES DA CAMPANHA SEARCH:
→ Rede de Pesquisa APENAS (desmarcar Rede de Display ao criar)
→ Idioma: Português
→ Localização: Brasil (depois refinar por estado)
→ Programação de anúncios: 7h–22h (fora disso, empresário não pesquisa)
→ Rotação de anúncios: Otimizar (Google escolhe o melhor)
→ Budget diário: R$45 (ajustável)

EXTENSÕES OBRIGATÓRIAS (configurar antes de subir):
□ Sitelinks (4 links adicionais sob o anúncio):
 → "Ver Planos e Preços" → /planos
 → "Como Funciona" → /como-funciona
 → "7 Dias Grátis" → /trial
 → "Falar com a Equipe" → /contato

□ Chamadas (número WhatsApp do Fyness):
 → (XX) XXXXX-XXXX | Horário: 8h–20h, Seg–Sex

□ Snippets estruturados:
 → Cabeçalho: "Funcionalidades"
 → Valores: Fluxo de Caixa · DRE Automático · Registro via WhatsApp · Alertas de Vencimento

□ Imagem (quando disponível):
 → Screenshot do painel Fyness (limpo, profissional)

□ Promoção (opcional):
 → "7 dias grátis — experimente sem comprometer cartão"</bpmn2:documentation>
 <bpmn2:incoming>Flow_Google_Setup</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Google_Conta</bpmn2:outgoing>
 </bpmn2:serviceTask>

 <!-- ===== CAMPANHA 1: SEARCH ===== -->

 <bpmn2:startEvent id="Start_Google_Search" name="Campanha 1 — Search (Alta Intenção)">
 <bpmn2:documentation> CAMPANHA SEARCH — LEAD JÁ SABE QUE TEM UM PROBLEMA E ESTÁ BUSCANDO

Este é o tráfego mais quente que existe no digital.
O lead digitou no Google uma palavra que mostra INTENÇÃO de resolver o problema.
ORÇAMENTO: R$45/dia | LANCE: CPC manual no início → Maximizar Conversões (após 30 conversões)
OBJETIVO: Conversões (Trial Iniciado)</bpmn2:documentation>
 <bpmn2:outgoing>Flow_Google_S1_Start</bpmn2:outgoing>
 </bpmn2:startEvent>

 <bpmn2:task id="Task_Google_Keywords" name="Configurar Keywords: Grupos + Match Types + Negativas">
 <bpmn2:documentation> LISTA COMPLETA DE PALAVRAS-CHAVE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRUPO 1: CONTROLE FINANCEIRO — NEGOCIO COM OPERACAO (principal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Correspondência Frase] — aparece em buscas que contenham a frase:

TERMOS QUE DONO DE NEGOCIO PESQUISA (faturamento R$10k+/mes):
"como controlar o caixa do meu negocio"
"controlar dinheiro da minha loja"
"controle financeiro pelo whatsapp"
"organizar financeiro do meu negocio"
"como saber se meu negocio da lucro"
"controle de caixa simples"
"sistema financeiro simples"
"sistema financeiro barato"
"controle financeiro do meu negocio"
"gestao financeira para dono de negocio"
"fluxo de caixa restaurante"
"controle financeiro para quem tem funcionario"
"fluxo de caixa automatico"
"controle financeiro pequeno negocio"
"controle financeiro padaria"
"controle financeiro salao"
"controle financeiro loja"

TERMOS TECNICOS (volume menor, intencao alta):
"software gestao financeira"
"sistema financeiro empresa"
"gestao financeira whatsapp"
"lancamento financeiro whatsapp"
"dre automatico"
"relatorio financeiro automatico"
"substituir planilha financeira"

[Correspondência Exata] — aparece SOMENTE nessa busca:
[controle financeiro pequeno negocio]
[controle de caixa pelo whatsapp]
[sistema financeiro para pequenos negocios]
[como controlar caixa da padaria]
[como organizar financeiro do meu negocio]
[fyness]
[fyness financeiro]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRUPO 2: CONCORRÊNCIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Correspondência Frase]:
"alternativa conta azul"
"alternativa nibo"
"alternativa omie"
"conta azul preço"
"nibo financeiro"
"sistema financeiro barato"
"gestão financeira mais barato"

ESTRATÉGIA DE CONCORRÊNCIA:
→ Anúncio específico para esse grupo:
 Headline: "Alternativa ao [Concorrente] — Mais Simples"
 Headline 2: "Registro via WhatsApp — Único no Mercado"
 Headline 3: "7 Dias Grátis — Sem Cartão"
→ NÃO mencionar concorrentes no texto do anúncio (viola políticas Google)
→ Mas o headline pode ser: "Software Financeiro Mais Simples e Barato"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRUPO 3: BRANDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Correspondência Exata] — baixo volume, mas CPC baixíssimo:
[fyness]
[fyness app]
[fyness financeiro]
[fyness sistema]
→ Proteger a marca. Se não anunciar, concorrente pode aparecer no nome.
→ CPC: geralmente abaixo de R$0,50

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
KEYWORDS NEGATIVAS (OBRIGATÓRIAS — CAMPANHA TODA)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Negativa Exata] — excluir completamente:
[gratis para sempre]
[gratuito]
[para estudantes]
[pessoal]
[pessoa fisica]
[excel template]
[planilha excel]
[baixar planilha]
[curso financeiro]
[faculdade]
[emprego]
[salário]
[imposto de renda]
[irpf]
[pessoa fisica]
[gastos pessoais]
[financiamento]
[financiamento imóvel]
[empréstimo]

POR QUÊ NEGATIVAS SÃO TÃO IMPORTANTES:
→ Sem negativas, o Google mostra pro público errado
→ "Gestão financeira" pode atrair buscas de estudantes, CPF, emprego
→ Negativas poupam até 30% do budget desperdiçado</bpmn2:documentation>
 <bpmn2:incoming>Flow_Google_S1_Start</bpmn2:incoming>
 <bpmn2:incoming>Flow_Google_Conta</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Google_Keywords</bpmn2:outgoing>
 </bpmn2:task>

 <bpmn2:task id="Task_Google_RSA" name="Criar Anúncios RSA — Todas as Variações">
 <bpmn2:documentation> ANÚNCIOS RSA (Responsive Search Ads) — VARIAÇÕES COMPLETAS

O Google testa combinações automáticas. Fornecer o máximo de variações de qualidade.
Regra: mínimo 8–10 headlines e 3–4 descrições por anúncio.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANÚNCIO 1 — GRUPO: GESTÃO FINANCEIRA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEADLINES (máx 30 caracteres cada):
H1: "Fyness: Gestão pelo WhatsApp" [30 car]
H2: "Controle Financeiro Completo" [29 car]
H3: "7 Dias Grátis — Sem Cartão" [27 car]
H4: "Sem Planilha. Sem Contador." [28 car]
H5: "DRE e Fluxo de Caixa Automático" [34 car — verificar]
H6: "Substitua Sua Planilha Hoje" [29 car]
H7: "Mande Áudio — Sistema Lança" [28 car]
H8: "Software Financeiro para Empresas" [34 car — verificar]
H9: "Alertas de Vencimento Automáticos" [34 car — verificar]
H10: "Relatórios Prontos em Segundos" [31 car — verificar]
H11: "Acesso Imediato — Cancele Quando Quiser" [40 car — verificar, pode truncar]
H12: "R$197/mês — Menos de R$7 por Dia" [35 car — verificar]

HEADLINES FIXOS (Pin — sempre aparecem nesta posição):
→ Pin posição 1: "Fyness: Gestão pelo WhatsApp" (marca sempre aparece)
→ Pin posição 2: "7 Dias Grátis — Sem Cartão" (oferta sempre visível)

DESCRIÇÕES (máx 90 caracteres cada):
D1: "Mande um áudio, foto ou texto no WhatsApp. O Fyness interpreta e organiza automaticamente."
D2: "DRE, Fluxo de Caixa e Alertas de Vencimento em tempo real. Sem planilha. Sem complicação."
D3: "Substitua planilha e contador. Painel completo do seu negócio. 7 dias grátis, sem cartão."
D4: "Projeção do caixa futuro + relatórios automáticos. Controle total do financeiro da empresa."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANÚNCIO 2 — GRUPO: CONCORRÊNCIA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
H1: "Software Financeiro Mais Simples"
H2: "Registro via WhatsApp — Exclusivo"
H3: "7 Dias Grátis — Comece Agora"
H4: "Sem Planilha. Painel Completo."
H5: "Mais Barato e Mais Fácil de Usar"

D1: "A diferença: você lança gastos por áudio no WhatsApp. Sem abrir sistema. Sem burocracia."
D2: "DRE automático, alertas de vencimento e projeção de caixa. Tudo em um painel. 7 dias grátis."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANÚNCIO 3 — GRUPO: BRANDED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
H1: "Fyness — Site Oficial"
H2: "Acesse Sua Conta Agora"
H3: "7 Dias Grátis para Novos Usuários"
D1: "Controle financeiro completo via WhatsApp. Acesso imediato. Cancele quando quiser."

QUALITY SCORE — COMO MAXIMIZAR:
→ Headline deve conter a keyword (Google destaca em negrito)
→ URL de destino deve ser relevante pra busca
→ LP deve ter conteúdo relacionado à keyword
→ Meta: Quality Score 8+ em todas as keywords principais</bpmn2:documentation>
 <bpmn2:incoming>Flow_Google_Keywords</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Google_RSA</bpmn2:outgoing>
 </bpmn2:task>

 <!-- ===== CAMPANHA 2: DISPLAY RETARGETING ===== -->

 <bpmn2:startEvent id="Start_Google_Display" name="Campanha 2 — Display Retargeting">
 <bpmn2:documentation> CAMPANHA DISPLAY — REMARKETING VISUAL
OBJETIVO: Conversões | ORÇAMENTO: R$10/dia
PÚBLICO: Visitou LP (últimos 14 dias) + NÃO converteu
POSICIONAMENTOS: Rede de Display Google (banners em sites parceiros)
ATIVAR QUANDO: Lista de remarketing atingir 100+ usuários (requisito mínimo Google)
FREQUÊNCIA: Máx 5x/semana por usuário</bpmn2:documentation>
 <bpmn2:outgoing>Flow_Google_D1_Start</bpmn2:outgoing>
 </bpmn2:startEvent>

 <bpmn2:task id="Task_Google_Display_Banners" name="Criar Banners Display — Todas as Variações">
 <bpmn2:documentation> BRIEF COMPLETO — BANNERS DISPLAY GOOGLE

FORMATOS OBRIGATÓRIOS (Google exige múltiplos tamanhos):
□ 300x250 (Retângulo Médio — mais comum)
□ 728x90 (Leaderboard — topo de página)
□ 160x600 (Arranha-céu Largo)
□ 320x50 (Banner Mobile)
□ 1200x628 (Anúncio Social/Responsivo)
→ Kauã cria em todos os formatos (template Canva com tamanhos salvos)

VARIAÇÕES DE COPY NOS BANNERS:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BANNER A — RETORNO SUAVE (lead saiu há menos de 3 dias)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Título: "Você veio até o Fyness..."
Texto: "Os 7 dias grátis ainda estão esperando."
CTA: "Testar Agora — Sem Cartão"
Visual: Screenshot do painel Fyness (limpo e organizado)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BANNER B — OBJEÇÃO TEMPO (lead saiu há 3–7 dias)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Título: "10 segundos para lançar um gasto"
Texto: "Via WhatsApp. Sem abrir sistema. Sem planilha."
CTA: "Começar Grátis"
Visual: Ícone WhatsApp + seta + ícone painel financeiro

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BANNER C — URGÊNCIA (lead saiu há 7–14 dias)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Título: "7 dias grátis — experimente agora"
Texto: "Controle financeiro completo. Sem cartão de crédito."
CTA: "Quero Testar"
Visual: Selo "7 DIAS GRÁTIS" em destaque + logotipo Fyness

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANÚNCIO RESPONSIVO DE DISPLAY (usar como principal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Google monta automaticamente com os ativos fornecidos:

IMAGENS (fornecer 3–5):
→ Logo Fyness (fundo branco)
→ Screenshot painel (paisagem 1,91:1)
→ Robert ou Kaynan segurando celular com painel
→ Ícone WhatsApp com elemento financeiro

HEADLINES (máx 30 car, fornecer 5):
→ "Controle Financeiro pelo WhatsApp"
→ "7 Dias Grátis — Sem Cartão"
→ "Seu DRE Gerado Automaticamente"
→ "Fyness: Sem Planilha"
→ "Alertas de Vencimento Automáticos"

DESCRIÇÕES (máx 90 car, fornecer 5):
→ "Mande áudio no WhatsApp. O sistema lança automaticamente. Sem planilha."
→ "Fluxo de caixa, DRE e alertas — tudo automático. 7 dias grátis."
→ "Você se afastou sem testar. O acesso gratuito ainda está disponível."</bpmn2:documentation>
 <bpmn2:incoming>Flow_Google_D1_Start</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Google_Display_Brief</bpmn2:outgoing>
 </bpmn2:task>

 <!-- ===== PUBLICAÇÃO ===== -->

 <bpmn2:task id="Task_Google_Publicar" name="Publicar Campanhas + Configurar Lances">
 <bpmn2:documentation> PUBLICAÇÃO E CONFIGURAÇÃO DE LANCES

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAMPANHA SEARCH — ESTRATÉGIA DE LANCE (evolução)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 1 — Lançamento (primeiros 30 dias):
→ CPC Manual — Máx R$4,00 por clique
→ Por quê: controle total enquanto aprende o comportamento
→ Ajuste de lance por dispositivo: começar neutro (0%)

FASE 2 — Aprendizado (após 30+ conversões):
→ Maximizar Conversões (automático)
→ Google otimiza lances para conseguir mais conversões dentro do budget
→ Monitorar CPL semanalmente

FASE 3 — Otimização (após 90 dias e dados sólidos):
→ CPA desejado (definir meta de custo por trial)
→ Definir meta: R$25 por trial iniciado
→ Google trabalha para manter abaixo desse custo

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAMPANHA DISPLAY — LANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ CPM alvo ou Maximizar Conversões
→ Budget: R$10/dia

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VERIFICAÇÃO PRÉ-PUBLICAÇÃO:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Todos os anúncios com status "Aprovado"?
□ URLs de destino funcionando? (testar cada uma)
□ UTMs presentes em todos os anúncios?
□ Extensões ativas e aprovadas?
□ Conversões sendo rastreadas? (testar com Tag Assistant)
□ Budget diário configurado corretamente?
□ Alertas de gasto ativados?

ORÇAMENTO TOTAL GOOGLE ADS:
→ Search: R$45/dia
→ Display: R$10/dia
→ TOTAL: R$55/dia | ~R$1.650/mês</bpmn2:documentation>
 <bpmn2:incoming>Flow_Google_RSA</bpmn2:incoming>
 <bpmn2:incoming>Flow_Google_Display_Brief</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Google_Publicado</bpmn2:outgoing>
 </bpmn2:task>

 <!-- ===== CICLO SEMANAL ===== -->

 <bpmn2:intermediateCatchEvent id="Timer_Google_Semana1" name="7 dias">
 <bpmn2:documentation>⏱ Aguarda 7 dias após publicação.
Search precisa de dados mínimos antes de otimizar.
Não alterar lances nem pausar keywords antes de 7 dias.</bpmn2:documentation>
 <bpmn2:incoming>Flow_Google_Publicado</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Google_T7</bpmn2:outgoing>
 <bpmn2:timerEventDefinition><bpmn2:timeDuration>P7D</bpmn2:timeDuration></bpmn2:timerEventDefinition>
 </bpmn2:intermediateCatchEvent>

 <bpmn2:task id="Task_Google_Analise_Semanal" name="Análise Semanal — Toda Terça-feira (45 min)">
 <bpmn2:documentation> CHECKLIST SEMANAL — GOOGLE ADS
Responsável: Kaynan | Ferramenta: Google Ads + GA4 + Search Console

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. RELATÓRIO DE TERMOS DE PESQUISA (mais importante)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Acessar: Palavras-chave → Termos de pesquisa
→ Filtrar por conversão e CTR
□ Termos com conversão → Adicionar como keyword exata (vão converter mais barato)
□ Termos irrelevantes → Adicionar como negativa imediatamente
□ Termos com volume alto e CTR baixo → keyword errada ou anúncio desalinhado

EXEMPLOS DE TERMOS A NEGATIVAR (surgem frequentemente):
→ "gestão financeira pessoal" → negativar [pessoal]
→ "curso de gestão financeira" → negativar [curso]
→ "planilha gratuita de fluxo de caixa" → negativar [planilha gratuita]
→ "gestão financeira para estudantes" → negativar [estudantes]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2. MÉTRICAS POR CAMPANHA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEARCH:
□ CTR (meta: acima de 5% — Search deve ter CTR alto)
□ CPC médio (meta: abaixo de R$3,00)
□ Taxa de conversão LP (meta: acima de 3%)
□ Custo por Trial (meta: abaixo de R$30)
□ Quality Score das principais keywords (meta: 7+)
□ Impression Share (% de vezes que apareceu vs total possível — meta: acima de 60%)

DISPLAY:
□ CTR (meta: acima de 0,3% — display tem CTR naturalmente baixo)
□ Frequência por usuário (meta: abaixo de 5)
□ Custo por conversão (meta: abaixo de R$30)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3. ANÁLISE DE QUALIDADE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Checar Quality Score de cada keyword (Colunas → Atributos → Quality Score)
 → QS 1–4: Problema sério (keyword, anúncio ou LP desalinhados)
 → QS 5–7: OK mas pode melhorar
 → QS 8–10: Excelente → CPC mais baixo
□ Anúncios com status "Fraco" ou "Regular" → criar variações novas</bpmn2:documentation>
 <bpmn2:incoming>Flow_Google_T7</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Google_Analise</bpmn2:outgoing>
 </bpmn2:task>

 <bpmn2:exclusiveGateway id="Gateway_Google_CTR" name="CTR Search acima de 5% e Custo/Trial abaixo de R$30?">
 <bpmn2:incoming>Flow_Google_Analise</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Google_CTR_Sim</bpmn2:outgoing>
 <bpmn2:outgoing>Flow_Google_CTR_Nao</bpmn2:outgoing>
 </bpmn2:exclusiveGateway>

 <bpmn2:task id="Task_Google_Escalar" name="Escalar: Aumentar Budget + Expandir Keywords">
 <bpmn2:documentation> CAMPANHA PERFORMANDO — COMO ESCALAR NO GOOGLE

CTR acima de 5% e custo por trial abaixo de R$30. Excelente. Hora de escalar.

ESCALONAMENTO NO GOOGLE ADS (diferente do Meta):
→ Google reage melhor ao escalonamento gradual
→ Aumentar budget em 20–30% por semana (não dobrar de uma vez)
→ Após aumento, aguardar 5–7 dias antes de novo ajuste (período de reaprendizado)

ONDE ESCALAR:
1. Aumentar budget da campanha Search em R$10–15/dia
2. Adicionar novas keywords similares às que estão convertendo
3. Testar novas correspondências (frase → exata para as que convertem bem)
4. Criar novo grupo de anúncios com tema de keyword diferente

EXPANSÃO DE KEYWORDS (quando Search está saturado):
→ Testar "controle financeiro app" / "sistema financeiro mobile"
→ Testar termos de problema: "dinheiro sumindo empresa" / "caixa empresa no vermelho"
→ Testar termos de persona: "sistema para contador" / "financeiro para MEI"

ESCALONAMENTO GEOGRÁFICO:
→ Ver quais estados têm melhor taxa de conversão no GA4
→ Aumentar lance (+20%) nos melhores estados
→ Reduzir lance (-20%) nos estados com alto gasto e baixa conversão</bpmn2:documentation>
 <bpmn2:incoming>Flow_Google_CTR_Sim</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Google_Loop</bpmn2:outgoing>
 </bpmn2:task>

 <bpmn2:task id="Task_Google_Otimizar" name="Otimizar: Diagnóstico por QS + Termos + LP">
 <bpmn2:documentation> CAMPANHA NÃO PERFORMANDO — ÁRVORE DE DIAGNÓSTICO COMPLETA

CTR baixo OU custo por trial acima de R$30. Investigar antes de aumentar budget.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROBLEMA 1: CTR BAIXO (abaixo de 3%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ CAUSA A: Anúncio não está atraente vs concorrência
 AÇÃO: Checar o que os concorrentes estão anunciando (ferramenta: Auction Insights)
 AÇÃO: Testar headline com benefício mais forte ("Via WhatsApp" é diferencial único — colocar em destaque)
 AÇÃO: Adicionar extensões se não tiver (elas aumentam área do anúncio e CTR)

→ CAUSA B: Keyword com intenção errada
 AÇÃO: Revisar Relatório de Termos — a busca real corresponde ao produto?
 AÇÃO: Adicionar termos irrelevantes como negativa
 AÇÃO: Mudar correspondência de ampla para frase/exata

→ CAUSA C: Posição baixa no leilão (aparecendo em posição 4–5)
 AÇÃO: Checar "Posição média" e "Impression Share"
 AÇÃO: Se Quality Score está bom, aumentar CPC máximo
 AÇÃO: Se Quality Score está ruim, melhorar primeiro (mais barato que aumentar lance)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROBLEMA 2: CTR BOM MAS TAXA DE CONVERSÃO LP BAIXA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ O lead está clicando mas não está convertendo na LP
 AÇÃO: Verificar se a LP está carregando rápido (PageSpeed Insights — meta: acima de 70)
 AÇÃO: Verificar se o formulário está funcionando em mobile
 AÇÃO: A/B test: mudar headline da LP para corresponder ao que o lead buscou
 AÇÃO: Verificar se o CTA está visível sem scroll (above the fold)
 AÇÃO: Adicionar prova social logo no início da LP (reduz desconfiança)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROBLEMA 3: QUALITY SCORE BAIXO (abaixo de 5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Google considera o anúncio/LP pouco relevante pra keyword
 AÇÃO: Verificar o componente mais baixo (Taxa de cliques esperada / Relevância / Experiência)
 AÇÃO: Se "Relevância do anúncio": headline não contém a keyword → adicionar
 AÇÃO: Se "Experiência na LP": LP não tem o conteúdo esperado pra busca → criar landing page específica por intenção
 AÇÃO: Se "CTR esperado": keyword muito competitiva → testar correspondência exata

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROBLEMA 4: BUDGET ESGOTANDO ANTES DAS 22H
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Budget insuficiente para cobrir toda a demanda
 AÇÃO: Verificar horário de maior clique (relatório de hora do dia)
 AÇÃO: Programar anúncios para os horários mais rentáveis
 AÇÃO: Aumentar budget OU limitar a horários de pico (11h–14h e 19h–22h)</bpmn2:documentation>
 <bpmn2:incoming>Flow_Google_CTR_Nao</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Google_Loop</bpmn2:outgoing>
 </bpmn2:task>

 <!-- ===== CICLO MENSAL ===== -->

 <bpmn2:intermediateCatchEvent id="Timer_Google_Mensal" name="30 dias">
 <bpmn2:documentation>⏱ A cada 30 dias: relatório completo + decisão de estratégia de lances.</bpmn2:documentation>
 <bpmn2:incoming>Flow_Google_Loop</bpmn2:incoming>
 <bpmn2:incoming>Flow_Google_Loop2</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Google_T30</bpmn2:outgoing>
 <bpmn2:timerEventDefinition><bpmn2:timeDuration>P30D</bpmn2:timeDuration></bpmn2:timerEventDefinition>
 </bpmn2:intermediateCatchEvent>

 <bpmn2:task id="Task_Google_Relatorio_Mensal" name="Relatório Mensal + Decisão de Estratégia de Lances">
 <bpmn2:documentation> RELATÓRIO MENSAL GOOGLE ADS — Kaynan monta, apresenta para Robert

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESUMO DO MÊS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Total investido: R$___
• Total de cliques: ___
• CPC médio: R$___
• Total de trials via Google: ___
• Custo por trial: R$___
• Conversões em clientes: ___
• CAC Google: R$___

SEARCH:
• CTR médio: ___%
• Quality Score médio: ___
• Impression Share: ___%
• Top 3 keywords que mais converteram: ___, ___, ___
• Top 3 termos negativados no mês: ___, ___, ___

DISPLAY:
• Alcance: ___ usuários únicos
• CTR: ___%
• Conversões: ___

DECISÃO DE ESTRATÉGIA DE LANCES:
□ Menos de 30 conversões no mês → manter CPC Manual
□ 30–60 conversões → testar Maximizar Conversões
□ Acima de 60 conversões → migrar para CPA desejado (meta: R$25/trial)

PLANO DO PRÓXIMO MÊS:
□ Novas keywords a testar: ___
□ Novas negativas a adicionar: ___
□ A/B test de LP planejado: ___
□ Budget: manter R$55/dia OU escalar para R$___/dia</bpmn2:documentation>
 <bpmn2:incoming>Flow_Google_T30</bpmn2:incoming>
 <bpmn2:outgoing>Flow_Google_LP_Link</bpmn2:outgoing>
 </bpmn2:task>

 <bpmn2:intermediateThrowEvent id="LinkThrow_Google_LP" name="→ Landing Page">
 <bpmn2:documentation>Tráfego do Google Ads chega à Landing Page.
Lead de Search tem intenção muito alta — taxa de conversão LP tende a ser maior que Meta.
(Ver pool LANDING PAGE)</bpmn2:documentation>
 <bpmn2:incoming>Flow_Google_LP_Link</bpmn2:incoming>
 <bpmn2:linkEventDefinition name="Link_LP" />
 </bpmn2:intermediateThrowEvent>

 <bpmn2:sequenceFlow id="Flow_Google_Setup" sourceRef="Start_Google_Setup" targetRef="Task_Google_ContaEstrutura" />
 <bpmn2:sequenceFlow id="Flow_Google_Conta" sourceRef="Task_Google_ContaEstrutura" targetRef="Task_Google_Keywords" />
 <bpmn2:sequenceFlow id="Flow_Google_S1_Start" sourceRef="Start_Google_Search" targetRef="Task_Google_Keywords" />
 <bpmn2:sequenceFlow id="Flow_Google_D1_Start" sourceRef="Start_Google_Display" targetRef="Task_Google_Display_Banners" />
 <bpmn2:sequenceFlow id="Flow_Google_Keywords" sourceRef="Task_Google_Keywords" targetRef="Task_Google_RSA" />
 <bpmn2:sequenceFlow id="Flow_Google_RSA" sourceRef="Task_Google_RSA" targetRef="Task_Google_Publicar" />
 <bpmn2:sequenceFlow id="Flow_Google_Display_Brief" sourceRef="Task_Google_Display_Banners" targetRef="Task_Google_Publicar" />
 <bpmn2:sequenceFlow id="Flow_Google_Publicado" sourceRef="Task_Google_Publicar" targetRef="Timer_Google_Semana1" />
 <bpmn2:sequenceFlow id="Flow_Google_T7" sourceRef="Timer_Google_Semana1" targetRef="Task_Google_Analise_Semanal" />
 <bpmn2:sequenceFlow id="Flow_Google_Analise" sourceRef="Task_Google_Analise_Semanal" targetRef="Gateway_Google_CTR" />
 <bpmn2:sequenceFlow id="Flow_Google_CTR_Sim" name="Sim" sourceRef="Gateway_Google_CTR" targetRef="Task_Google_Escalar" />
 <bpmn2:sequenceFlow id="Flow_Google_CTR_Nao" name="Não" sourceRef="Gateway_Google_CTR" targetRef="Task_Google_Otimizar" />
 <bpmn2:sequenceFlow id="Flow_Google_Loop" sourceRef="Task_Google_Escalar" targetRef="Timer_Google_Mensal" />
 <bpmn2:sequenceFlow id="Flow_Google_Loop2" sourceRef="Task_Google_Otimizar" targetRef="Timer_Google_Mensal" />
 <bpmn2:sequenceFlow id="Flow_Google_T30" sourceRef="Timer_Google_Mensal" targetRef="Task_Google_Relatorio_Mensal" />
 <bpmn2:sequenceFlow id="Flow_Google_LP_Link" sourceRef="Task_Google_Relatorio_Mensal" targetRef="LinkThrow_Google_LP" />

 </bpmn2:process>

 <!-- ============================================================ -->
 <!-- POOL 3: ROBERT — AUTORIDADE FINANCEIRA (Instagram ~3k seguidores) -->
  <!-- ============================================================ -->
  <bpmn2:process id="Process_Robert" isExecutable="false">

    <bpmn2:startEvent id="Start_Robert_Setup" name="Setup e Posicionamento do Perfil">
      <bpmn2:documentation>PERFIL: Robert | 35 anos | Especialista financeiro e comercial
Instagram: ~3.000 seguidores | Conta profissional (Criador de Conteudo)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOM DE VOZ — ROBERT (detalhado)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSONALIDADE:
Robert tem 35 anos. Ja abriu empresa. Ja quase faliu. Aprendeu na raca.
Fala como quem ja viveu o problema — nao como professor de faculdade.
Autoridade conquistada, nao imposta. O seguidor sente que ele esta do mesmo lado.
Usa a experiencia como ferramenta: "Eu ja vi isso destruir empresas."
Pausa dramatica antes da solucao: deixa o problema "doer" antes de resolver.

LINGUAGEM:
- Frases curtas. Maximo de 10 palavras por frase nos Reels.
- "Voce" direto. Fala com o empresario, nao sobre os empresarios.
- Usa numeros e dados reais sempre que possivel. Numeros chocam e educam.
- Pode ser duro: "Voce esta sangrando e nao sabe." Nunca cruel.
- Evita jargao financeiro pesado (CDI, Selic, derivativos). Foco em gestao operacional.
- Nao usa linguagem de motivador: sem "acredite em voce", sem "vai la".
- Tom de mentor experiente, nao de influencer.

EXEMPLOS DE ABERTURA QUE FUNCIONAM PARA O ROBERT (falar pro MEI):
- "Voce que tem padaria: sabe quanto lucrou esse mes? Se demorou pra responder, problema."
- "Conheco dono de salao que fatura R$20 mil por mes e no fim nao tem R$3 mil na conta. Sabe por que?"
- "Dono de loja: voce controla seu caixa no caderninho? Isso nao e controle. E ilusao."
- "O Seu Carlos tem uma padaria. Vendia 300 paes por dia e PERDIA dinheiro em 40 deles. Sabe como descobriu?"
- "Voce que fatura R$10, 20, 30 mil por mes e nao sabe quanto sobra — a gente precisa conversar."
- Dado + pergunta direta com exemplo de negocio real (padaria, salao, oficina). Nunca falar "empresa" ou "empresarial" — falar "seu negocio".

O QUE ROBERT NAO FAZ:
- Nao glamouriza empreendedorismo.
- Nao faz discurso motivacional.
- Nao usa linguagem de anuncio no conteudo organico.
- Nao transforma o perfil em vitrine de produto.

COMO MENCIONAR O FYNESS (regra 80/20):
- 80% do conteudo: educativo puro, sem mencionar o produto.
- 20%: mencionar o Fyness de forma natural e contextualizada.
- Sempre contextualizar antes do CTA: "Construi o Fyness porque precisava disso no meu proprio negocio."
- Nunca mencionar preco nos posts organicos. Preco vai para Stories ou DM.
- Exemplos de CTA natural:
  "O Fyness faz isso automaticamente. Link na bio."
  "Hoje uso o Fyness para isso. Me poupou 8h por mes."
  "Aliás, o Fyness resolve exatamente esse problema. 7 dias gratis, link na bio."

POSTURA SOBRE O @FYNESSBR (6 seguidores):
O perfil do Fyness nao tem autoridade propria ainda.
Robert e o motor que constroi essa autoridade por transferencia.
Toda quarta-feira: marcar @fynessbr em pelo menos 1 story.
Ao longo de 6 meses, o @fynessbr acumula credibilidade nas costas do Robert.

PUBLICO-ALVO: Dono de negocio que fatura R$10k+/mes — padaria, salao, loja, oficina, restaurante, hotfruit.
NAO e MEI fraco (fatura R$3-5k). E o pequeno empresario que JA TEM operacao rodando (funcionarios, estoque, fluxo)
mas controla tudo na cabeca, caderninho ou planilha abandonada. Ticket de R$197/mes faz sentido pra ele.
FILTRO: se o negocio nao fatura pelo menos R$10k/mes, o Fyness nao e pra ele (ainda).

BIO:
"Ajudo donos de negocio a pararem de perder dinheiro sem perceber
Padaria, salao, loja, oficina — se tem caixa, eu ajudo a controlar
Co-fundador @fynessbr | 7 dias gratis (link abaixo)"

LINK NA BIO: Pagina de trial do Fyness (UTM: utm_campaign=robert_bio)
FOTO: Profissional, terno ou camisa social, expressao seria e confiante
DESTAQUES: Dicas | Perguntas | Fyness | Resultados | Sobre mim

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIKTOK — @robert_fyness
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJETIVO: Alcance massivo — viralizar pra atingir donos de negocio que NAO estao procurando solucao (topo de funil)

POR QUE FUNCIONA:
TikTok distribui por INTERESSE, nao por seguidores. Um video com 0 seguidores pode ter 500k views
se o hook for bom. 35% dos usuarios do TikTok no Brasil tem 25-44 anos (DataReportal 2024).
Dono de negocio pequeno consome TikTok a noite depois de fechar a loja.
Ele nao esta procurando sistema de gestao — mas quando ve video que descreve a dor dele, para e assiste.

BIO TIKTOK: "Ajudo donos de negocio a pararem de perder dinheiro | Co-fundador @fynessbr | Teste gratis ↓"
LINK: LP com UTM utm_source=tiktok&utm_medium=bio&utm_campaign=robert

CONTEUDO PRINCIPAL (70%): HOOK + HISTORIA
Estrutura: 0-2s Hook (texto grande + fala) → 2-15s Problema → 15-40s Virada → 40-60s Resultado
Hooks: Pergunta direta | Numero chocante | Provocacao | Historia | Contraintuitivo
SEMPRE texto grande na tela (40% assistem sem som)

CONTEUDO SECUNDARIO (20%): NUMERO CHOCANTE
"R$2.400 perdidos em um mes." — numeros especificos interrompem o scroll

CONTEUDO TERCIARIO (10%): REACT/DUETO
Dueto com videos de "guru" ou Sebrae — adicionar perspectiva real

FREQUENCIA: 1-2 videos/dia nos primeiros 2 meses (volume > perfeicao)
REGRA: grava 5 em 1h, posta 1/dia. Algoritmo testa cada video independentemente.

METAS TIKTOK:
Mes 1-2: 0 → 1.000 seguidores | 2-3 videos com 10k+ views
Mes 3-6: 1.000 → 10.000 | 1-2 videos/mes com 50k+
Mes 7-12: 10.000 → 50.000+ | leads organicos toda semana

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUTUBE — Aparece no Canal @fynessbr
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Robert e o apresentador PRINCIPAL do canal YouTube da Fyness.

SHORTS: Repost do TikTok com titulo SEO (3-5/semana, custo zero)
LONGFORM: 1 video/semana de 8-15 minutos

CATEGORIAS LONGFORM:
1. TUTORIAL PRATICO (40%): "Como calcular preco de venda", "Fluxo de caixa simples"
   POR QUE: resolve busca ativa, 5.000-20.000 buscas/mes, lead qualificado
2. CASO REAL (30%): historias de clientes com numeros reais
   POR QUE: prova social em video = mais poderosa. Converte fundo de funil.
3. ERRO COMUM (30%): "5 erros financeiros que quebram seu negocio"
   POR QUE: formato com maior CTR no YouTube (vidIQ)

ESTRUTURA: 0-30s Hook → 30s-1:30 Contexto → 1:30-8:00 Conteudo → 8-9:00 Resumo → 9-9:30 CTA
SEO: keyword no inicio do titulo + descricao com timestamps + thumbnail com rosto + texto curto
      </bpmn2:documentation>
      <bpmn2:outgoing>Flow_Robert_Setup_Semanal</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_Robert_Calendario" name="Calendario Semanal de Conteudo">
      <bpmn2:documentation>CALENDARIO SEMANAL — ROBERT

SEGUNDA — Carrossel educativo (feed)
Tipo: conteudo denso, 7 a 10 slides, tema de gestao financeira.
Tom: professor experiente, dados reais, linguagem acessivel.
Exemplo de tema: "7 sinais que seu financeiro esta fora de controle"
Exemplo de slide 1: "7 sinais que seu financeiro esta fora de controle. Se voce marcar 3, a gente precisa conversar."
Publicar: 18h. Nos primeiros 30 min, Robert responde todos os comentarios.

TERCA — Reel educativo (feed)
Tipo: video 45-75 segundos, um unico problema financeiro com solucao direta.
Tom: serio, dado chocante nos primeiros 3 segundos, solucao no final.
Exemplo de gancho: "Voce sabe quanto seu negocio lucrou em janeiro? Se demorou mais de 3 segundos pra responder, a gente precisa conversar."
Publicar: 19h.

QUARTA — Stories: bastidores do Fyness (3 a 5 stories)
Tipo: video curto mostrando algo do produto, print de conversa com Kaynan, demo de feature.
Tom: informal, transparente, sem roteiro.
Obrigatorio: marcar @fynessbr em pelo menos 1 story.
Objetivo: transferir autoridade do Robert para o perfil do Fyness gradualmente.

QUINTA — Stories: responde perguntas da semana (3 a 5 stories)
Tipo: Robert responde em video (15-30s) as perguntas recebidas na caixa da segunda.
Tom: direto, como mentor respondendo um aluno.
Exemplo: "Pergunta da [nome]: como sei se meu produto da lucro? Resposta em 30 segundos."

SEXTA — Stories: dica rapida + link do trial (2 a 3 stories)
Tipo: 1 dica financeira pratica em 15 segundos + 1 story com link direto para o trial.
Exemplo de dica: "Toda sexta, dedique 15 minutos para revisar o que entrou e saiu essa semana. So isso ja muda tudo."

SABADO — Repost ou conteudo leve
Tipo: compartilhar o melhor Reel da semana nos stories ou conteudo pessoal sem roteiro.

DOMINGO — Story de reflexao + caixa de perguntas
Tipo: pergunta para a audiencia sobre dor financeira. Alimenta pauta da proxima semana.
Exemplo: "Qual e sua maior dificuldade financeira no negocio agora? Manda aqui."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIKTOK — CALENDARIO ROBERT (diario)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEGUNDA: Video hook+historia (grava na sessao de segunda junto com IG)
TERCA: Video numero chocante ou dica rapida
QUARTA: React/Dueto de conteudo financeiro (baixo custo de producao)
QUINTA: Video hook+historia (segundo tema da semana)
SEXTA: Resposta a comentario com video (engajamento em cascata)
SABADO: Trend adaptada pro nicho (se tiver trend relevante)
DOMINGO: Opcional — repost do melhor da semana ou descanso

HORARIOS: 20h-22h (dono de negocio no sofa depois de fechar)
REGRA: Texto grande na tela SEMPRE. 40% assiste sem som.
PRODUCAO: Robert grava 4-5 videos de uma vez (30-60min). Kaua edita e agenda.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUTUBE — CALENDARIO ROBERT (semanal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHORTS: Kaua reposta os melhores TikToks com titulo SEO (3-5/semana)
LONGFORM: 1 video/semana (publicar quinta-feira 18h)
Robert grava longform 1x/semana (40-60min de gravacao bruta → Kaua edita pra 8-15min)
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Setup_Semanal</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Reels_Stories</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Robert_Crescimento" name="Taticas de Crescimento de Seguidores">
      <bpmn2:documentation>CRESCIMENTO ORGANICO — ACOES SEMANAIS

META:
Mes 1-2: +500 seguidores (base consistente)
Mes 3-4: +1.500 seguidores (primeiro Reel acima de 50k views)
Mes 6: 10.000+ seguidores

ACOES FIXAS POR SEMANA:
- Responder 100% dos comentarios nos primeiros 30 min apos cada post.
- Responder todas as DMs em ate 24h (mesmo que uma linha).
- Comentar em 10 posts de contas grandes do nicho (empreendedorismo, financas).
- Seguir 20 contas de pequenos empresarios relevantes.
- Toda quarta: marcar @fynessbr em pelo menos 1 story (construcao do perfil do produto).

FORMATOS COM MAIOR RETORNO DE SEGUIDORES:
1. Carrossel com lista numerada (saves altos = mais alcance organico)
2. Reel com dado chocante no gancho (compartilhamento alto)
3. Story com caixa de perguntas respondida em video (engajamento real)

COLABORACOES (1 por mes):
- Gravar 1 Reel com Kaynan (audiencias diferentes, cross-follow).
- Abordar 3 criadores do nicho (10k a 100k seguidores) com proposta de collab clara.
  Modelo de abordagem: "Tenho [X] seguidores no nicho de financas empresariais.
  Podemos gravar um Reel sobre [tema especifico]? Beneficio para as duas audiencias."

QUANDO ESCALAR (a partir do mes 3):
- Passar de 2 para 3 Reels por semana.
- Criar lead magnet (PDF "7 relatorios financeiros essenciais") para captura de email.
- Testar anuncio de Stories com o melhor Reel organico (R$300/mes).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRESCIMENTO TIKTOK — ROBERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TATICAS:
1. TREND JACKING: usar audios/trends virais adaptados pro nicho
   POR QUE: pega carona no algoritmo. So usar se fizer sentido pro conteudo.
2. RESPONDER COMENTARIOS COM VIDEO: cada comentario bom = video novo
   POR QUE: gera engajamento em cascata, algoritmo distribui o video-resposta
3. SERIES COM GANCHO: "Parte 1, 2, 3" — forca follow pra ver proximo
   POR QUE: aumenta follow rate e watch time
4. DUETOS COM CONTEUDO DO NICHO: 2-3x/semana
   POR QUE: alcanca audiencia do video original sem precisar da propria base

CRESCIMENTO YOUTUBE — ROBERT
TATICAS:
1. SHORTS → LONGFORM FUNIL: no final do Short, "video completo no canal"
2. PLAYLISTS: "Gestao Financeira pra Iniciante", "Casos Reais", "Erros Comuns"
3. END SCREEN + CARDS: todo video tem end screen pro proximo + 3 cards
4. SEO AGRESSIVO: titulo com keyword, descricao com timestamps, tags
   Keywords alvo: "gestao financeira pequeno negocio", "como calcular lucro",
   "fluxo de caixa simples", "como precificar produto"
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Reels_Stories</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Crescimento_Ciclo</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Robert_Semanal" name="Ciclo Semanal (P7D)">
      <bpmn2:incoming>Flow_Robert_Crescimento_Ciclo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Analise</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Robert_Analise" name="Analise Semanal — Metricas e Decisao">
      <bpmn2:documentation>ANALISE SEMANAL — ROBERT
Quando: toda segunda-manha, antes de planejar a semana.

METRICAS A VERIFICAR:
- Novos seguidores da semana (meta mes 1: +100/semana)
- Reel com mais views: replicar o formato/gancho
- Carrossel com mais saves: replicar o tema
- Cliques no link da bio (meta: acima de 50/semana)
- Seguidores novos no @fynessbr vindos das mencoes do Robert

DECISAO:
- O que mais engajou? Fazer mais do mesmo na proxima semana.
- O que nao engajou? Trocar o gancho, nao o tema.
- Cliques na bio baixos? Revisar o CTA do ultimo story de sexta.

METRICAS TIKTOK:
- Views por video (>500 em 48h = ok, >10k = potencial viral)
- Watch time medio (>50% = bom, >70% = viral)
- Compartilhamentos (mais importante que curtidas no TikTok)
- Cliques no link da bio

METRICAS YOUTUBE:
- CTR da thumbnail (>5% = bom, >8% = otimo)
- Retencao media longform (>40% = bom)
- Impressoes de busca (SEO funcionando?)
- Cliques no link da descricao
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Analise</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Gateway</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Robert_Crescimento" name="Crescimento no Ritmo Esperado?">
      <bpmn2:incoming>Flow_Robert_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Escalar</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Robert_Otimizar</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:task id="Task_Robert_Escalar" name="Escalar: Aumentar Frequencia e Colaboracoes">
      <bpmn2:documentation>QUANDO ESCALAR:
- Taxa de seguidores acima de 1% (seguidores novos / alcance)
- Reel acima de 50k views
- Crescimento acima de 500 seguidores/semana

ACOES:
- Aumentar de 2 para 3 Reels/semana.
- Ativar lead magnet PDF via link na bio.
- Agendar collab com conta maior do nicho.
- Investir R$300/mes em anuncio de Stories com o melhor Reel organico.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Escalar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Mensal_Timer</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Robert_Otimizar" name="Otimizar: Revisar Gancho e Formato">
      <bpmn2:documentation>DIAGNOSTICO POR PROBLEMA:

Views baixos (menos de 500 em 7 dias):
- Problema: gancho fraco nos primeiros 3 segundos.
- Solucao: testar 3 variantes de gancho para o mesmo tema.
  Dado chocante | Pergunta direta | Afirmacao polêmica.

Saves baixos no carrossel (menos de 2%):
- Problema: conteudo interessante mas nao acionavel.
- Solucao: adicionar checklist ou passo a passo no ultimo slide.

Muita visita ao perfil mas poucos seguidores novos:
- Problema: bio ou grid nao convence.
- Solucao: revisar bio e garantir que os 9 ultimos posts comunicam autoridade.

Crescimento parado por 2 semanas seguidas:
- Solucao: buscar collab urgente com conta maior.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Otimizar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Mensal_Timer</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Robert_Mensal" name="Avaliacao Mensal (P30D)">
      <bpmn2:incoming>Flow_Robert_Mensal_Timer</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Mensal</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P30D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Robert_Mensal" name="Relatorio Mensal e Planejamento">
      <bpmn2:documentation>RELATORIO MENSAL — ROBERT

CRESCIMENTO:
- Seguidores: [inicio] → [fim] | Meta era [X] | Atingiu?
- Melhor Reel: [titulo] | [X] views | [Y] saves
- @fynessbr: ganhou [X] seguidores via mencoes do Robert

CONVERSAO:
- Cliques no link da bio: [X]
- Trials iniciados via Robert (UTM): [X]

PLANEJAMENTO PROXIMO MES:
- Temas que performaram → replicar com angulo diferente
- Colaboracoes agendadas: [listar]
- Frequencia de Reels: 2x ou 3x por semana?
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Mensal</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Gateway_LP</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Robert_Engajou" name="Lead Clicou no Link da Bio?">
      <bpmn2:incoming>Flow_Robert_Gateway_LP</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Robert_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Robert_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Robert_LP" name="Landing Page">
      <bpmn2:documentation>Lead clicou no link da bio do Robert.
UTM: utm_source=instagram&amp;utm_medium=organic&amp;utm_campaign=robert_bio</bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_LP" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:endEvent id="End_Robert_Organico" name="Continua no Feed (Maturacao)">
      <bpmn2:documentation>Lead nao converteu agora. Continua recebendo conteudo.
Ciclo natural: pode converter em semanas ou meses.
Quando estiver pronto, busca o link da bio espontaneamente.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Robert_Nao</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:sequenceFlow id="Flow_Robert_Setup_Semanal"  sourceRef="Start_Robert_Setup"        targetRef="Task_Robert_Calendario" />
    <bpmn2:sequenceFlow id="Flow_Robert_Reels_Stories"  sourceRef="Task_Robert_Calendario"    targetRef="Task_Robert_Crescimento" />
    <bpmn2:sequenceFlow id="Flow_Robert_Crescimento_Ciclo" sourceRef="Task_Robert_Crescimento" targetRef="Timer_Robert_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Robert_Analise"        sourceRef="Timer_Robert_Semanal"      targetRef="Task_Robert_Analise" />
    <bpmn2:sequenceFlow id="Flow_Robert_Gateway"        sourceRef="Task_Robert_Analise"       targetRef="Gateway_Robert_Crescimento" />
    <bpmn2:sequenceFlow id="Flow_Robert_Escalar"  name="No ritmo"      sourceRef="Gateway_Robert_Crescimento" targetRef="Task_Robert_Escalar" />
    <bpmn2:sequenceFlow id="Flow_Robert_Otimizar" name="Abaixo da meta" sourceRef="Gateway_Robert_Crescimento" targetRef="Task_Robert_Otimizar" />
    <bpmn2:sequenceFlow id="Flow_Robert_Mensal_Timer"   sourceRef="Task_Robert_Escalar"       targetRef="Timer_Robert_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Robert_Mensal_Timer2"  sourceRef="Task_Robert_Otimizar"      targetRef="Timer_Robert_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Robert_Mensal"         sourceRef="Timer_Robert_Mensal"       targetRef="Task_Robert_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Robert_Gateway_LP"     sourceRef="Task_Robert_Mensal"        targetRef="Gateway_Robert_Engajou" />
    <bpmn2:sequenceFlow id="Flow_Robert_Sim"  name="Sim" sourceRef="Gateway_Robert_Engajou"   targetRef="LinkThrow_Robert_LP" />
    <bpmn2:sequenceFlow id="Flow_Robert_Nao"  name="Nao" sourceRef="Gateway_Robert_Engajou"   targetRef="End_Robert_Organico" />

  </bpmn2:process>

  <!-- ============================================================ -->
<!-- POOL 4: KAYNAN — PROXIMIDADE E PRODUTO (Build in Public)      -->
  <!-- ============================================================ -->
  <bpmn2:process id="Process_Kaynan" isExecutable="false">

    <bpmn2:startEvent id="Start_Kaynan_Setup" name="Setup do Perfil Kaynan (Do Zero)">
      <bpmn2:documentation>PERFIL: Kaynan | 19 anos | Co-fundador | Build in public
Instagram: ~200 seguidores | Reconstruir como perfil profissional do zero

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOM DE VOZ — KAYNAN (detalhado)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSONALIDADE:
Kaynan tem 19 anos e esta vivendo o processo AGORA. Nao fala de teoria — fala do que esta acontecendo.
Autentico ao extremo: mostra o bug tanto quanto mostra a feature funcionando.
Energia alta. Fala rapido. Ritmo de podcast acelerado.
Vulnerabilidade real e estrategica: "As 2h da manha travei em um bug. Olha como resolvi."
Tom de amigo que conta o que esta fazendo — nao de professor ensinando.
Quem tem 18-28 anos querendo empreender se ve no Kaynan.
Diferente do Robert (que e autoridade): Kaynan e IDENTIFICACAO.

LINGUAGEM:
- Informal mas inteligente. "A gente" mais que "nos".
- Sem jargao tecnico — simplifica tudo: "e basicamente uma API que le texto".
- Frases curtas e energeticas. Sem silencio desnecessario.
- Admite quando nao sabe: "Eu nao sabia isso ate 3 meses atras."
- Pode usar "cara" e "mano" com moderacao — nao exagerar.
- Mostra o processo real, nao so o highlight reel.
- Nao glamouriza: nao posta foto de carro, escritorio bonito, lifestyle.

EXEMPLOS DE ABERTURA QUE FUNCIONAM PARA O KAYNAN (MEI entende):
- "Tenho 19 anos e construi um sistema pra donos de negocio controlarem o dinheiro pelo WhatsApp."
- "O Seu Carlos manda um audio: 'paguei R$800 de aluguel'. Pronto. O sistema ja lancou. Olha isso."
- "Quase desisti de tudo. Vou ser honesto sobre o que aconteceu."
- "Deixa eu te mostrar o que a Dona Maria faz pra controlar a loja dela em 10 segundos."
- "Voce que tem negocio e controla tudo na memoria — olha o que eu construi pra resolver isso."
- Demo ao vivo vale TUDO: mostrar o WhatsApp, mandar audio, sistema lancar. MEI entende visual, nao texto.

BUILD IN PUBLIC — REGRA DE OURO:
Transparencia total sobre o processo. Isso inclui:
- Numeros reais (trials novos, bugs corrigidos, features deployadas)
- Erros e o que foi aprendido
- Decisoes dificeis e como foram tomadas
- A dinamica com o Robert (socio mais velho — explorar essa narrativa)
O seguidor sente que esta acompanhando algo real sendo construido.
Isso cria fidelidade que nenhum anuncio consegue comprar.

COMO MENCIONAR O FYNESS:
- Sempre contextualizado: mostrar o produto em uso, nao em anuncio.
- Demo ao vivo vale mais que qualquer copy.
- "Uso o Fyness para controlar as financas do proprio Fyness" — uso real, nao forcado.
- Marcar @fynessbr toda quarta nos stories: construcao gradual do perfil do produto.

O QUE KAYNAN NAO FAZ:
- Nao finge que tudo e perfeito.
- Nao usa linguagem corporativa ("escalabilidade", "sinergia").
- Nao posta conteudo generico de motivacao.
- Nao tenta soar mais velho do que e — a idade e um diferencial, nao um problema.

PUBLICO-ALVO: Dono de negocio que fatura R$10k+/mes. Nao e MEI fraco — e o cara que ja tem operacao,
funcionarios, e sente que perde dinheiro sem saber onde.
A linguagem e simples. "SaaS" nao existe no vocabulario dele — falar "sistema", "ferramenta".

BIO:
"19 anos | Co-fundador @fynessbr
Construindo um sistema pra donos de negocio controlarem tudo pelo WhatsApp
Bastidores, erros e tudo mais (link abaixo)"

USERNAME: @kaynanfyness (verificar disponibilidade)
FOTO: Descontraida mas profissional. Pode ter notebook ou celular. Fundo neutro.
DESTAQUES: Bastidores | Fyness | Aprendi | Sobre mim | Perguntas

SETUP ANTES DO PRIMEIRO POST (Kaua executa):
- Conta no modo Criador de Conteudo
- Bio publicada
- 5 destaques criados com capas no padrao visual
- 9 primeiros posts do feed planejados e prontos antes de publicar qualquer coisa
- Seguir 200 contas estrategicas de tech, empreendedorismo e startup BR

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIKTOK — @kaynan_fyness
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJETIVO: Viralizar com narrativa "jovem fundador" + demos virais do produto

POR QUE FUNCIONA:
TikTok ADORA narrativas de fundador jovem. "19 anos construindo tech" viraliza
naturalmente porque quebra expectativa. Demo de produto em formato "satisfying"
(antes/depois, transformacao) performa bem. O algoritmo favorece conteudo que gera
curiosidade + watch time alto.

BIO TIKTOK: "19 anos. Construo sistema que dono de negocio usa pra parar de perder dinheiro | @fynessbr ↓"
LINK: LP com UTM utm_source=tiktok&utm_medium=bio&utm_campaign=kaynan

CONTEUDO PRINCIPAL (50%): POV / NARRATIVA FUNDADOR
POR QUE: POV coloca espectador DENTRO da situacao. Alta taxa de comentario = sinal forte pro algoritmo.
Exemplos:
- "POV: voce tem 19 anos e o dono de um restaurante te liga pra agradecer"
- "Me pediram pra mostrar meu setup. Aqui e onde o Fyness e construido."
- "19 anos. Co-fundador. Essa e minha rotina real."

CONTEUDO SECUNDARIO (30%): DEMO SATISFYING
POR QUE: videos de transformacao (antes/depois) sao dos mais compartilhados no TikTok.
Exemplos:
- Transicao: caderninho → tela do Fyness com tudo organizado
- Time-lapse: registrando 10 vendas em 30 segundos pelo celular
- Screen recording acelerado: "O Fyness organiza suas vendas automaticamente"

CONTEUDO TERCIARIO (20%): RESPONDER COMENTARIOS COM VIDEO
POR QUE: cada comentario respondido = video novo que o TikTok distribui.
Loop de crescimento gratuito.

FREQUENCIA: 1 video/dia
METAS TIKTOK:
Mes 1-3: 0 → 2.000 seguidores | 1+ video com 50k views
Mes 4-6: 2.000 → 10.000 | audiencia engajada
Mes 7-12: 10.000 → 30.000+ | link na bio gerando trials

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUTUBE — Aparece no Canal @fynessbr
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Kaynan aparece no canal UNICO do YouTube (Fyness). Menos frequencia que Robert
porque o tempo do Kaynan e mais valioso codando.

SHORTS: Repost do TikTok com titulo SEO (3-5/semana, custo zero)
LONGFORM: 1 video a cada 2 semanas

CATEGORIAS:
1. TOUR DO PRODUTO: walkthrough completo, setup pra tipos de negocio
   POR QUE: quem pesquisa "fyness" ou "sistema gestao financeira" quer VER o produto
2. BUILD IN PUBLIC: "O que construi essa semana", "Um cliente pediu X, construi em 3 dias"
   POR QUE: cria audiencia fiel, transmite que o produto evolui e a empresa escuta
      </bpmn2:documentation>
      <bpmn2:outgoing>Flow_Kaynan_Setup_Perfil</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_Kaynan_CriarPerfil" name="Configurar Perfil (Fase Zero — Antes de Publicar)">
      <bpmn2:documentation>CHECKLIST DE SETUP (fazer uma vez, antes de qualquer post):

- Trocar para conta Criador de Conteudo
- Definir username: @kaynanfyness
- Publicar bio e link na bio (Linktree com: trial Fyness, @fynessbr, WhatsApp)
- Fazer foto profissional (Kaua fotografa)
- Criar 5 destaques com capas no padrao de cores Fyness
- Planejar e produzir os 9 primeiros posts do grid
- Publicar os 9 posts em 3 dias (3 por dia) antes de qualquer crescimento

GRID INICIAL (9 posts, em ordem):
1. Reel: "Quem sou e o que estou construindo"
2. Carrossel: "Construi um SaaS com 19 anos — o que aprendi"
3. Reel: Demo do Fyness funcionando (produto em acao)
4. Carrossel: "Por que construimos no WhatsApp e nao num app"
5. Reel: Feature favorita do produto (bastidor)
6. Carrossel: "Erros que quase me fizeram desistir"
7. Reel: Collab com Robert — "Dois fundadores, dois perfis opostos"
8. Carrossel: "Stack do Fyness explicado para nao tecnicos"
9. Reel: "Dia 1 do lancamento — o que aconteceu"
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Setup_Perfil</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Perfil_Reels</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Kaynan_Calendario" name="Calendario Semanal de Conteudo">
      <bpmn2:documentation>CALENDARIO SEMANAL — KAYNAN

SEGUNDA — Reel de bastidor (feed)
Tipo: video 20-45 segundos mostrando algo real do processo de construcao do produto.
Tom: espontaneo, como se fosse contar para um amigo.
Exemplo de gancho: "As 2h da manha encontrei um bug critico no dia anterior ao lancamento. Aqui esta o que aconteceu."
Publicar: 20h.

TERCA — Stories: bastidor de desenvolvimento (4 a 5 stories)
Tipo: print ou video de algo sendo construido ou corrigido.
Tom: transparente, sem filtro.
Obrigatorio: caixa de perguntas aberta. "Pergunta sobre o produto ou sobre empreender."
Objetivo: gerar perguntas reais para o conteudo da quarta.

QUARTA — Stories: responde perguntas + mencao ao @fynessbr (4 a 5 stories)
Tipo: Kaynan responde em video 2 a 3 perguntas recebidas na terca.
Obrigatorio: 1 story marcando @fynessbr com algo novo do produto.

QUINTA — Reel ou Carrossel de empreendedorismo jovem (feed)
Tipo: aprendizado pessoal, erro cometido, decisao importante — build in public.
Tom: vulneravel e direto. Nao glamouriza. Mostra o real.
Exemplo de gancho: "Quase desisti do Fyness. Vou ser honesto sobre o que aconteceu."

SEXTA — Stories: resultados da semana (3 stories)
Tipo: transparencia sobre o que aconteceu na semana. Trials novos, feature deployada, numero real.
Tom: sem exagero. Um numero real vale mais do que qualquer elogio.
Exemplo: "Essa semana: 8 trials novos, 1 feature deployada, 1 bug corrigido que me tirou o sono."

SABADO — Conteudo pessoal leve (stories)
Tipo: vida fora do Fyness. Academia, amigos, hobby. Humanizar.

DOMINGO — Story de reflexao + enquete (2 stories)
Tipo: o que aprendeu essa semana + pergunta para a audiencia.
Exemplo: "Aprendi essa semana: produto que resolve dor real vende. Produto bonito que nao resolve dor, nao vende."

COLLAB COM ROBERT (1 vez por mes):
Gravar 1 Reel juntos. Mesma gravacao, corte diferente para cada perfil.
Publicar nos 3 perfis: @kaynan, @robert, @fynessbr.
Formato: "19 anos vs 35 anos — como tomamos decisao no Fyness."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIKTOK — CALENDARIO KAYNAN (diario)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEGUNDA: POV fundador ou "day in the life"
TERCA: Demo satisfying (antes/depois)
QUARTA: Resposta a comentario com video
QUINTA: POV ou narrativa pessoal
SEXTA: Demo de feature nova ou build in public
SABADO: Trend adaptada (se relevante) ou descanso
DOMINGO: Opcional

HORARIOS: 20h-22h
PRODUCAO: Kaynan grava 2-3 videos rapidos na segunda (15-30min total).
Kaua edita e agenda. Demos sao screen recording (Kaynan faz em 5min).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUTUBE — CALENDARIO KAYNAN (quinzenal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHORTS: Kaua reposta os melhores TikToks com titulo SEO (3-5/semana)
LONGFORM: 1 video a cada 2 semanas (grava quando tem feature nova ou caso interessante)
Playlist dedicada: "Tour pelo Fyness" e "Build in Public"
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Perfil_Reels</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Calendario_Crescimento</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Kaynan_Crescimento" name="Taticas de Crescimento de Seguidores">
      <bpmn2:documentation>CRESCIMENTO ORGANICO — ACOES SEMANAIS

META:
Mes 1: 200 → 700 (+500)
Mes 2: 700 → 1.500 (+800)
Mes 3: 1.500 → 2.500 (+1.000)
Mes 6: 5.000+

ACOES FIXAS POR SEMANA:
- Responder 100% dos comentarios nos primeiros 30 min apos cada post.
- Responder todas as DMs em ate 24h.
- Seguir ativamente quem comenta (audiencia pequena = conexao real possivel).
- Comentar em posts de outros criadores de tech e startup BR.
- Marcar @fynessbr toda quarta — sem falta.

FORMATOS COM MAIOR RETORNO DE SEGUIDORES:
1. Reel de bastidor com bug ou erro real (compartilhamento alto — identificacao)
2. Reel de "antes e depois" do produto (curiosidade + produto em acao)
3. Carrossel de licoes numeradas (saves altos = mais alcance)

ESCALA (a partir do mes 3):
- Passar de 2 para 3 Reels/semana.
- Criar serie semanal "Semana do Build in Public" (7 dias mostrando 1 aspecto do produto).
- Testar anuncio de Stories (R$200/mes) com o melhor Reel organico.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CRESCIMENTO TIKTOK — KAYNAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TATICAS:
1. NARRATIVA FUNDADOR JOVEM: "19 anos construindo tech" viraliza naturalmente
   POR QUE: quebra expectativa, gera curiosidade e admiracao
2. RESPONDER COMENTARIOS COM VIDEO: loop de crescimento gratuito
3. SERIES POV: "Acompanhe minha rotina como CTO de 19 anos — Dia 1"
   POR QUE: forca follow pra acompanhar a serie
4. CROSS-PROMO: Robert menciona "@kaynan_fyness construiu isso"
   POR QUE: transfer de audiencia entre perfis do mesmo time

CRESCIMENTO YOUTUBE — KAYNAN
TATICAS:
1. SHORTS viralizados no TikTok repostados com SEO
2. Videos de tour ranqueando pra buscas "fyness como funciona"
3. Build in public cria audiencia fiel de longo prazo
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Calendario_Crescimento</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Collab_Ciclo</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Kaynan_Semanal" name="Ciclo Semanal (P7D)">
      <bpmn2:incoming>Flow_Kaynan_Collab_Ciclo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Analise</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Kaynan_Analise" name="Analise Semanal — Metricas e Ajuste">
      <bpmn2:documentation>ANALISE SEMANAL — KAYNAN
Quando: toda segunda-manha, junto com Robert.

METRICAS A VERIFICAR:
- Novos seguidores (meta mes 1: +100/semana)
- Reel com mais views: replicar gancho/formato
- Story com mais respostas: replicar tipo de conteudo
- Cliques no link da bio
- @fynessbr: quantos seguidores novos vieram das mencoes do Kaynan

DECISAO:
- Reel com menos de 300 views: gancho fraco. Trocar nos proximos 2 segundos, nao o tema.
- Crescimento parado: buscar collab urgente ou serie tematica nova.

METRICAS TIKTOK — KAYNAN:
- Views por video (narrativa fundador tende a ter views mais altos)
- Comentarios (indica engajamento real — mais importante que curtidas)
- Follow rate apos video viral
- Cliques no link da bio

METRICAS YOUTUBE — KAYNAN:
- Views nos videos de tour (indica interesse no produto)
- Retencao nos videos de build in public
- Inscritos via Shorts vs Longform
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Analise</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Gateway_Cresc</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Kaynan_Crescimento" name="Crescimento no Ritmo?">
      <bpmn2:incoming>Flow_Kaynan_Gateway_Cresc</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Escalar</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Kaynan_Otimizar</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:task id="Task_Kaynan_Escalar" name="Escalar: Frequencia e Build in Public Aprofundado">
      <bpmn2:documentation>QUANDO ESCALAR:
- +200 seguidores/semana consistente
- Reel acima de 20k views
- DMs espontaneas sobre o produto chegando

ACOES:
- 3 Reels/semana ao inves de 2.
- Serie "7 dias de Build in Public" — mostrar um aspecto diferente do produto por dia.
- Anuncio de Stories com melhor Reel organico (R$200/mes).
- Collab com criador de tech ou startup com mais de 10k.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Escalar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Mensal</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Kaynan_Otimizar" name="Otimizar: Gancho, Autenticidade e Formato">
      <bpmn2:documentation>DIAGNOSTICO POR PROBLEMA:

Reels com poucos views (menos de 300):
- Problema: gancho fraco nos 2 primeiros segundos.
- Solucao: comecar com revelacao imediata ou situacao absurda.
  "As 2h da manha..." | "Quase perdi tudo por causa disso..." | "Deixa eu te mostrar..."

Views ok mas sem novos seguidores:
- Problema: conteudo entretém mas nao faz querer mais.
- Solucao: CTA mais claro no final. "Segue aqui para acompanhar a jornada."

Crescimento parado por 2 semanas:
- Solucao: collab urgente ou novo angulo de conteudo (ex: mostrar dados reais do produto).
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Otimizar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Mensal</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Kaynan_Mensal" name="Avaliacao Mensal (P30D)">
      <bpmn2:incoming>Flow_Kaynan_Mensal</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Relatorio</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P30D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Kaynan_Relatorio" name="Relatorio Mensal e Planejamento">
      <bpmn2:documentation>RELATORIO MENSAL — KAYNAN

CRESCIMENTO:
- Seguidores: [inicio] → [fim] | Meta era [X]
- Melhor Reel: [titulo] | [X] views
- @fynessbr: [X] seguidores novos via Kaynan esse mes
- Trials iniciados via Kaynan (UTM): [X]

PLANEJAMENTO:
- Temas que performaram → replicar
- Colaboracoes agendadas: [listar]
- Frequencia de Reels: manter 2x ou aumentar para 3x?
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Relatorio</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Gateway_LP</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Kaynan_Engajou" name="Lead Clicou no Link da Bio?">
      <bpmn2:incoming>Flow_Kaynan_Gateway_LP</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Kaynan_Sim</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Kaynan_Nao</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Kaynan_LP" name="Landing Page">
      <bpmn2:documentation>Lead clicou no link da bio do Kaynan.
UTM: utm_source=instagram&amp;utm_medium=organic&amp;utm_campaign=kaynan_bio</bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_LP" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:endEvent id="End_Kaynan_Organico" name="Continua no Feed (Maturacao)">
      <bpmn2:documentation>Lead nao converteu agora. Continua recebendo conteudo.
Build in public cria fidelidade — seguidores do Kaynan sao os mais engajados.
Quando estiver pronto, busca o link espontaneamente.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Kaynan_Nao</bpmn2:incoming>
    </bpmn2:endEvent>

    <bpmn2:sequenceFlow id="Flow_Kaynan_Setup_Perfil"         sourceRef="Start_Kaynan_Setup"        targetRef="Task_Kaynan_CriarPerfil" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Perfil_Reels"         sourceRef="Task_Kaynan_CriarPerfil"   targetRef="Task_Kaynan_Calendario" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Calendario_Crescimento" sourceRef="Task_Kaynan_Calendario"  targetRef="Task_Kaynan_Crescimento" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Collab_Ciclo"         sourceRef="Task_Kaynan_Crescimento"   targetRef="Timer_Kaynan_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Analise"              sourceRef="Timer_Kaynan_Semanal"      targetRef="Task_Kaynan_Analise" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Gateway_Cresc"        sourceRef="Task_Kaynan_Analise"       targetRef="Gateway_Kaynan_Crescimento" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Escalar"  name="No ritmo"      sourceRef="Gateway_Kaynan_Crescimento" targetRef="Task_Kaynan_Escalar" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Otimizar" name="Abaixo da meta" sourceRef="Gateway_Kaynan_Crescimento" targetRef="Task_Kaynan_Otimizar" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Mensal"               sourceRef="Task_Kaynan_Escalar"       targetRef="Timer_Kaynan_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Mensal2"              sourceRef="Task_Kaynan_Otimizar"      targetRef="Timer_Kaynan_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Relatorio"            sourceRef="Timer_Kaynan_Mensal"       targetRef="Task_Kaynan_Relatorio" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Gateway_LP"           sourceRef="Task_Kaynan_Relatorio"     targetRef="Gateway_Kaynan_Engajou" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Sim"  name="Sim" sourceRef="Gateway_Kaynan_Engajou"        targetRef="LinkThrow_Kaynan_LP" />
    <bpmn2:sequenceFlow id="Flow_Kaynan_Nao"  name="Nao" sourceRef="Gateway_Kaynan_Engajou"        targetRef="End_Kaynan_Organico" />

  </bpmn2:process>

  <!-- ============================================================ -->
<!-- POOL 5: FYNESS INSTITUCIONAL (@fynessbr — 6 seguidores, do zero) -->
  <!-- ============================================================ -->
  <bpmn2:process id="Process_Institucional" isExecutable="false">

    <bpmn2:startEvent id="Start_Inst_Setup" name="Setup do @fynessbr (Do Zero)">
      <bpmn2:documentation>PERFIL: @fynessbr | 6 seguidores | Recem-criado
Conta Empresa (nao Criador). Categoria: Software.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PAPEL NO ECOSSISTEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
NAO e o perfil que gera audiencia — isso e funcao de Robert e Kaynan.
E o perfil que CONFIRMA a decisao de compra.
Jornada do lead: ve conteudo do Robert ou Kaynan → fica curioso → vai no @fynessbr → decide comprar ou nao.
O que precisa encontrar ao chegar: produto real funcionando, prova social, CTA claro.
Se o perfil estiver vazio ou desorganizado, o lead vai embora.
Missao unica: converter quem ja chegou aquecido pelos fundadores.

CRESCIMENTO ESPERADO (realista — cresce na cauda dos fundadores):
Mes 1: 6 → 80 (via mencoes de Robert e Kaynan — toda quarta)
Mes 2: 80 → 250 (conteudo proprio + reposts dos fundadores)
Mes 3: 250 → 600 (primeiros clientes marcando espontaneamente)
Mes 6: 1.500+ (crescimento organico + trafego pago levando ao perfil)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOM DE VOZ — @FYNESSBR (detalhado)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERSONALIDADE DO PERFIL:
O @fynessbr nao tem "personalidade humana" como Robert e Kaynan.
Tem personalidade de produto: confiante, claro, orientado a resultado.
Fala como o produto que e — nao como startup empolgada tentando parecer cool.
Cada post comunica uma coisa: "isso funciona, e simples, e para o seu negocio."

LINGUAGEM:
- Profissional mas nao frio. Tem voz propria, mas sem gíria.
- Sempre especifico e mensuravel: "registre sua venda em 10 segundos" — nunca "gestao facil e rapida".
- Orientado a resultado: o que o produto FAZ pelo cliente, nao o que o produto E.
- Nunca linguagem de startup hipster: sem "revolucionario", "disruptivo", "game changer".
- Nunca linguagem de anuncio forcado: sem "NAO PERCA!", "OFERTA LIMITADA!".
- Frases curtas. Uma ideia por post. Um CTA por post.

EXEMPLOS DE LINGUAGEM CERTA vs ERRADA:
ERRADO: "Gestao financeira revolucionaria para o seu negocio crescer!"
CERTO:  "Voce manda uma mensagem. O Fyness lanca no financeiro. Em 2 segundos."

ERRADO: "Plataforma intuitiva com dashboard completo e relatórios avancados."
CERTO:  "DRE do mes atual. Agora. Sem esperar o fim do mes."

ERRADO: "Nao fique de fora da revolucao financeira!"
CERTO:  "7 dias gratis. Sem cartao. Comeca em 2 minutos."

QUANDO MENCIONAR OS FUNDADORES:
- Repostar conteudo de Robert e Kaynan nos sabados (com credito).
- Marcar @robert e @kaynan em posts de bastidor ou lancamento de feature.
- Nunca deixar o perfil parecer anonimo — os fundadores dao rosto ao produto.

BIO:
"Gestao financeira empresarial pelo WhatsApp
Mande uma mensagem. Controle seu negocio.
7 dias gratis — sem cartao (link abaixo)"

LINK NA BIO: Direto para a LP (sem Linktree — menos friccao, mais conversao)
FOTO: Logo Fyness em alta resolucao, fundo na cor primaria da marca
DESTAQUES: Demo | Clientes | Features | FAQ | Trial

SETUP ANTES DO PRIMEIRO POST (Kaua executa):
- Conta no modo Empresa, categoria Software
- Bio publicada com link direto para LP
- 5 destaques criados com capas no padrao visual Fyness
- 9 primeiros posts do grid planejados, produzidos e prontos para publicar
- Pixel do Meta e Google Tag configurados na LP (rastrear cliques do Instagram)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TIKTOK — @fynessbr (SECUNDARIO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJETIVO: Presenca institucional + repost dos melhores conteudos dos fundadores

POR QUE SECUNDARIO:
No TikTok, perfis pessoais (Robert/Kaynan) performam MUITO melhor que perfil de empresa.
O algoritmo favorece rostos. @fynessbr no TikTok serve pra:
1) Compilar os melhores videos dos fundadores
2) Postar conteudo que nao encaixa nos pessoais (comparativos, dados, produto puro)
3) Ter presenca institucional caso alguem pesquise "fyness" no TikTok

BIO TIKTOK: "Gestao financeira pra quem tem negocio de verdade | Teste gratis ↓"
LINK: LP com UTM utm_source=tiktok&utm_medium=bio&utm_campaign=fynessbr

CONTEUDO:
- Compilacoes de resultados: "3 clientes, 3 negocios, 1 problema"
- Trends adaptadas pro produto
- Demos curtas de features
FREQUENCIA: 3-4 videos/semana (repost + originais)
PRIORIDADE: BAIXA — investir energia nos perfis Robert e Kaynan primeiro

METAS: Mes 1-6: 0 → 2.000 | Mes 7-12: 2.000 → 10.000
      </bpmn2:documentation>
      <bpmn2:outgoing>Flow_Inst_Setup_Calendario</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_Inst_Calendario" name="Calendario Editorial Semanal — 4 Pilares">
      <bpmn2:documentation>CALENDARIO EDITORIAL — @FYNESSBR (FASEADO)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 1 — MES 1-2 (6 a ~300 seguidores)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frequencia: 3 posts/semana no feed + 2 stories/dia
Horario de post no feed: 18h30
Dias de post: Segunda (produto), Quarta (prova social), Sexta (oferta)
Stories: 1 link pro trial (obrigatorio) + 1 variavel (demo, dado, enquete)
Motivo: perfil com poucos seguidores nao tem engajamento pra justificar
conteudo diario. Algoritmo ignora. Kaua nao sobrecarrega.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 2 — MES 3+ (300+ seguidores engajados)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frequencia: 5 posts/semana no feed + 3 stories/dia
Escalar para diario somente quando engajamento medio por post > 3%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FASE 3 — MES 6+ (1.500+ seguidores)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frequencia: 1 post/dia no feed + 5 stories/dia (calendario completo abaixo)

CALENDARIO COMPLETO (ativar na Fase 3):

SEGUNDA — Produto em acao (Reel 15-30s)
Tipo: screen recording do produto funcionando. 1 feature por video.
Tom: produto fala por si. Minimo de texto, maximo de demonstracao.
Exemplo: usuario digita "vendi R$2.000 hoje" no WhatsApp. Fyness confirma em 2 segundos. Dashboard atualiza.
Legenda exemplo: "Sua venda registrada em 2 segundos. Sem planilha. Sem app novo. So o WhatsApp. Teste 7 dias: link na bio."

TERCA — Educativo com solucao (Carrossel 6-8 slides)
Tipo: problema financeiro real → o Fyness como solucao natural.
Tom: objetivo, sem rodeios. O produto aparece sempre como resposta, nao como produto.
Exemplo de titulo: "Voce sabe qual e o lucro real do seu negocio esse mes?"
Exemplo de ultimo slide: "O Fyness responde isso em 3 segundos. 7 dias gratis: link na bio."

QUARTA — Prova social (Depoimento ou Case)
Fase inicial (sem clientes): usar depoimento dos fundadores.
Exemplo Robert: "Uso o Fyness todos os dias. Nao porque sou co-fundador. Porque funciona."
Fase com clientes: print de mensagem ou video de 30s. Resultado especifico obrigatorio.
Exemplo de formato: "Antes: planilha que ninguem atualizava. Depois: DRE em tempo real. — [nome], [setor]"

QUINTA — Produto em acao (Feature especifica)
Tipo: demo de uma feature diferente da segunda-feira.
Rotacao de features: DRE em tempo real | alerta de vencimento | analise de margem | projecao de caixa | registro por audio.
Legenda padrao: "[descricao do que esta sendo mostrado]. Isso e o Fyness. 7 dias gratis: link na bio."

SEXTA — Oferta direta (Carrossel ou Reel)
Tipo: post com CTA direto para o trial. 1 vez por semana.
Exemplo de copy: "7 dias gratis. Sem cartao. Cancele quando quiser.
O que voce leva: controle financeiro completo, DRE automatico, alertas de vencimento, analise de margem.
Tudo pelo WhatsApp. Link na bio."
Tratar objecoes em rodizio semanal: "nao tenho tempo" | "ja uso planilha" | "e seguro?" | "funciona para meu negocio?"

SABADO — Repost do melhor conteudo dos fundadores
Tipo: repostar o melhor Reel ou carrossel da semana de Robert ou Kaynan.
Legenda: "De @[perfil] — Isso e exatamente o que o Fyness resolve. Trial gratis: link na bio."

DOMINGO — Story de engajamento
Tipo: enquete ou caixa de perguntas sobre dor financeira do seguidor.
Objetivo: coletar dados reais sobre o publico + alimentar pauta da proxima semana.
Exemplo: "Voce usa alguma ferramenta de controle financeiro no seu negocio?" [Sim] [Nao]

STORIES (frequencia por fase — ver acima):
FASE 1 (2/dia): 1 link trial (obrigatorio) + 1 variavel
FASE 2 (3/dia): 1 link trial + 1 demo + 1 variavel
FASE 3 (5/dia, Kaua programa):
- 1 story com link direto para o trial (obrigatorio, todos os dias)
- 1 story com dado ou estatistica sobre financas de PMEs (2x/semana)
- 1 story de demo rapida do produto em 10 segundos (2x/semana)
- 1 story de enquete ou caixa de perguntas (2x/semana)
- 1 story repostando mencao de fundador (quando disponivel)
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Setup_Calendario</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Calendario_PS</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Inst_ProvasSociais" name="Coleta e Publicacao de Prova Social">
      <bpmn2:documentation>PROTOCOLO DE COLETA DE DEPOIMENTOS

FASE 1 — SEM CLIENTES (primeiros 30-60 dias):
Usar depoimentos dos fundadores como prova social inicial.
Robert e Kaynan gravam video de 30s cada sobre o proprio uso do produto.
Publicar como post de quarta-feira.

FASE 2 — PRIMEIROS CLIENTES:
Dia 3 do trial → mensagem: "Como esta sendo a experiencia? Tem algo que poderia melhorar?"
Dia 7 do trial → mensagem: "Em uma frase: o que o Fyness fez pelo seu negocio ate agora?"
Apos conversao → pedir depoimento em video de 30s. Incentivo: 1 mes extra gratis.

COMO PUBLICAR:
- Video editado por Kaua (logo Fyness, legenda, nome e setor do cliente)
- Print de mensagem (com permissao — bloquear sobrenome se necessario)
- Formato obrigatorio: resultado especifico, nao elogio generico.
  RUIM: "Otimo produto, recomendo!"
  BOM: "Descobri que um servico meu dava prejuizo. Cortei. Lucro subiu R$3.200/mes."

META: 10 depoimentos publicados ate o mes 3.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Calendario_PS</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_PS_CTA</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Inst_CTA" name="CTA Diario e Conversao para Trial">
      <bpmn2:documentation>CONVERSAO — ACOES DIARIAS

STORY COM LINK (todos os dias, sem excecao):
- 1 story por dia com link direto para o trial.
- Variar o visual a cada semana (Kaua cria templates rotativos).
- Texto base: "7 dias gratis — sem cartao — comeca aqui"

DESTAQUES ATUALIZADOS SEMANALMENTE:
- Demo: ultimas demos publicadas no feed
- Clientes: depoimentos coletados
- Features: uma feature por story explicada
- FAQ: respostas das duvidas mais frequentes
- Trial: como funciona, o que inclui, como comecar

METRICAS DE CONVERSAO (mais importante que seguidores):
- Cliques no link da bio (UTM: utm_campaign=fynessbr_organico)
- Cliques nos links dos stories (UTM: utm_campaign=fynessbr_stories)
- Trials iniciados via @fynessbr
- Meta: taxa de conversao acima de 8% (cliques → trials)
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_PS_CTA</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_CTA_Ciclo</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Inst_Semanal" name="Ciclo Semanal (P7D)">
      <bpmn2:incoming>Flow_Inst_CTA_Ciclo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Analise</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Inst_Analise" name="Analise Semanal — Foco em Conversao">
      <bpmn2:documentation>ANALISE SEMANAL — @FYNESSBR
Quando: toda segunda-manha, junto com Robert e Kaynan.

METRICAS PRINCIPAIS (foco em conversao, nao em seguidores):
- Cliques no link da bio: [X] (meta: crescer toda semana)
- Cliques nos links de stories: [X]
- Trials iniciados via Instagram: [X]
- Taxa de conversao: trials / cliques × 100 (meta: acima de 8%)

METRICAS SECUNDARIAS:
- Qual post gerou mais cliques na bio? (replicar)
- Qual story de link teve mais cliques? (replicar horario e visual)
- Novos seguidores: [X] (crescem via mencoes dos fundadores)

DIAGNOSTICO:
- Cliques baixos: CTA fraco ou story de link sem apelo visual — Kaua refaz.
- Cliques ok mas trials baixos: problema esta na LP, nao no Instagram.
- Sem crescimento de seguidores: verificar se Robert e Kaynan estao marcando @fynessbr.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Analise</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Gateway</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Inst_Conversao" name="Taxa de Conversao Acima de 8%?">
      <bpmn2:incoming>Flow_Inst_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Escalar</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Inst_Otimizar</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:task id="Task_Inst_Escalar" name="Escalar: Ampliar Demos e Prova Social">
      <bpmn2:documentation>QUANDO ESCALAR:
- Taxa de conversao consistente acima de 8%
- Stories de link com mais de 5% de cliques
- Trials novos por semana crescendo

ACOES:
- 2 stories de link por dia ao inves de 1.
- Acelerar coleta de depoimentos (contatar todos os trials convertidos).
- Serie "Feature da semana" — uma feature nova a cada semana.
- Solicitar a Robert e Kaynan que aumentem mencoes ao @fynessbr.
- Testar anuncio de Stories do @fynessbr (R$200/mes) com o melhor post organico.
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Escalar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Mensal</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Inst_Otimizar" name="Otimizar: CTA, Visual e Frequencia de Link">
      <bpmn2:documentation>DIAGNOSTICO POR PROBLEMA:

Cliques baixos no story de link:
- Story de link sem apelo visual — Kaua refaz com novo design.
- Testar textos diferentes: "7 dias gratis" vs "Comeca gratis agora" vs "Ver o Fyness funcionando".

Alcance baixo no feed:
- Testar horarios diferentes: 12h e 19h alem do 18h30.
- Revisar consistencia visual do grid.

Trials baixos mesmo com cliques ok:
- Problema esta na LP (acionar ciclo de CRO do Pool 6).
- Passar dados para Kaua: "pessoas chegam mas nao convertem".
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Otimizar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Mensal</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Inst_Mensal" name="Avaliacao Mensal (P30D)">
      <bpmn2:incoming>Flow_Inst_Mensal</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_Relatorio</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P30D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Inst_Relatorio" name="Relatorio Mensal e Planejamento Editorial">
      <bpmn2:documentation>RELATORIO MENSAL — @FYNESSBR

CONVERSAO (principal):
- Cliques no link da bio: [X]
- Trials iniciados via Instagram: [X]
- Taxa de conversao: [X]%
- Melhor post de conversao: [titulo]

CRESCIMENTO:
- Seguidores: [inicio] → [fim]
- Depoimentos coletados esse mes: [X]

PLANEJAMENTO:
- Novas features a demonstrar: [listar]
- Depoimentos agendados: [listar]
- Anuncio de Stories? [Sim/Nao — budget]
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_Relatorio</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Inst_LP</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Inst_LP" name="Landing Page">
      <bpmn2:documentation>Lead clicou no link do @fynessbr.
UTM: utm_source=instagram&amp;utm_medium=bio&amp;utm_campaign=fynessbr_organico</bpmn2:documentation>
      <bpmn2:incoming>Flow_Inst_LP</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_LP" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:sequenceFlow id="Flow_Inst_Setup_Calendario"  sourceRef="Start_Inst_Setup"         targetRef="Task_Inst_Calendario" />
    <bpmn2:sequenceFlow id="Flow_Inst_Calendario_PS"     sourceRef="Task_Inst_Calendario"     targetRef="Task_Inst_ProvasSociais" />
    <bpmn2:sequenceFlow id="Flow_Inst_PS_CTA"            sourceRef="Task_Inst_ProvasSociais"  targetRef="Task_Inst_CTA" />
    <bpmn2:sequenceFlow id="Flow_Inst_CTA_Ciclo"         sourceRef="Task_Inst_CTA"            targetRef="Timer_Inst_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Inst_Analise"           sourceRef="Timer_Inst_Semanal"       targetRef="Task_Inst_Analise" />
    <bpmn2:sequenceFlow id="Flow_Inst_Gateway"           sourceRef="Task_Inst_Analise"        targetRef="Gateway_Inst_Conversao" />
    <bpmn2:sequenceFlow id="Flow_Inst_Escalar"  name="Acima de 8%"  sourceRef="Gateway_Inst_Conversao" targetRef="Task_Inst_Escalar" />
    <bpmn2:sequenceFlow id="Flow_Inst_Otimizar" name="Abaixo de 8%" sourceRef="Gateway_Inst_Conversao" targetRef="Task_Inst_Otimizar" />
    <bpmn2:sequenceFlow id="Flow_Inst_Mensal"            sourceRef="Task_Inst_Escalar"        targetRef="Timer_Inst_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Inst_Mensal2"           sourceRef="Task_Inst_Otimizar"       targetRef="Timer_Inst_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Inst_Relatorio"         sourceRef="Timer_Inst_Mensal"        targetRef="Task_Inst_Relatorio" />
    <bpmn2:sequenceFlow id="Flow_Inst_LP"                sourceRef="Task_Inst_Relatorio"      targetRef="LinkThrow_Inst_LP" />

  </bpmn2:process>

  <!-- ============================================================ -->
<!-- POOL 6: LANDING PAGE — CRO E OTIMIZAÇÃO DE CONVERSÃO -->
 <!-- ============================================================ -->
 <bpmn2:process id="Process_LP" isExecutable="false">

 <!-- ══════════════════════════════════════════════════════════════
 INÍCIO — VISITANTE CHEGA NA LP (de qualquer canal)
 ══════════════════════════════════════════════════════════════ -->
 <bpmn2:startEvent id="Start_LP_Visitante" name="Visitante Chega na LP (Qualquer Canal)">
 <bpmn2:documentation> LANDING PAGE — CONTEXTO E OBJETIVO

A LP já existe. Este pool documenta:
→ O que cada seção precisa entregar (trabalho de cada bloco)
→ Copy otimizada por seção (com variações para A/B test)
→ Elementos técnicos obrigatórios (Pixel, Tag, eventos)
→ Popup de saída (recuperar quem vai sair sem converter)
→ Ciclo de CRO semanal (medir → hipótese → testar → decidir)

FONTES DE TRÁFEGO (Link Events de entrada):
→ Meta Ads (LinkThrow_Meta_LP, LinkThrow_Retargeting_LP)
→ Google Ads (LinkThrow_Google_LP)
→ Robert Instagram (LinkThrow_Robert_LP)
→ Kaynan Instagram (LinkThrow_Kaynan_LP)
→ Fyness Institucional (LinkThrow_Inst_LP)

OBJETIVO ÚNICO DA LP: Visitante → Trial 7 dias grátis
Tudo que não contribui para esse objetivo é distração — remover.

META DE CONVERSÃO:
→ Baseline inicial: 3-5% (média de LP de SaaS BR sem otimização)
→ Meta mês 1: 6%
→ Meta mês 3: 10%
→ Meta mês 6: 15%+
→ Cada 1% de aumento na conversão = X novos trials sem aumentar tráfego

UTMs DE RASTREAMENTO (configurar antes de qualquer tráfego):
→ Meta Ads: utm_source=facebook&utm_medium=paid&utm_campaign=[campanha]
→ Google Search: utm_source=google&utm_medium=cpc&utm_campaign=[campanha]
→ Robert bio: utm_source=instagram&utm_medium=organic&utm_campaign=robert_bio
→ Kaynan bio: utm_source=instagram&utm_medium=organic&utm_campaign=kaynan_bio
→ @fynessbr: utm_source=instagram&utm_medium=bio&utm_campaign=fynessbr_organico

CHECKLIST TÉCNICO OBRIGATÓRIO (verificar antes de ligar tráfego pago):
□ Meta Pixel instalado e disparando na LP
□ Google Tag Manager instalado
□ Evento "TrialIniciado" configurado (dispara quando formulário é submetido)
□ Google Analytics 4 configurado com meta de conversão
□ Formulário testado — submissão funciona em mobile e desktop
□ Velocidade da LP: PageSpeed Score acima de 80 em mobile (testar em pagespeed.web.dev)
□ HTTPS ativo
□ Heatmap instalado (Hotjar gratuito ou Microsoft Clarity)
□ Gravação de sessão ativa (Hotjar/Clarity — ver onde usuários travam)
□ Integração LP → CRM funcionando (lead cadastrado com tag TRIAL_INICIADO)
□ Email automático de boas-vindas disparando após submissão
□ WhatsApp de confirmação disparando após submissão
 </bpmn2:documentation>
 <bpmn2:outgoing>Flow_LP_Start_Auditoria</bpmn2:outgoing>
 </bpmn2:startEvent>

 <!-- ══════════════════════════════════════════════════════════════
 TASK 1 — AUDITORIA E COPY POR SEÇÃO
 ══════════════════════════════════════════════════════════════ -->
 <bpmn2:task id="Task_LP_CopySecoes" name="Checklist CRO por Seção">
 <bpmn2:documentation> CHECKLIST CRO POR SEÇÃO — O QUE CADA BLOCO PRECISA ENTREGAR

A LP do Fyness já existe com copy própria. Este checklist garante que cada
seção está cumprindo seu trabalho de conversão. Kauã implementa ajustes.
NÃO contém copy — apenas critérios de performance por bloco.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 1 — HERO (acima do fold)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: Em 3 segundos, o visitante decide "isso é pra mim?"
□ Headline principal: falar do problema/dor, não do produto
□ Subheadline: especificar quem é o público
□ CTA acima do fold: botão visível, texto de ação
□ Visual: screenshot do produto OU vídeo demo (autoplay mudo)
□ Prova de credibilidade: logo + número de usuários (quando disponível)
→ Meta: taxa de rejeição abaixo de 55%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 2 — VALIDAÇÃO DA DOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: "Isso fala de mim." Lead se sente compreendido.
□ Listar dores específicas em primeira pessoa
□ Tom empático, não condescendente
□ Não resolver ainda — só identificar e validar
→ Meta: scroll depth acima de 45%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 3 — AMPLIFICAÇÃO DA DOR (opcional)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: Criar urgência sem exagero. Fatos reais, não drama.
□ Consequências de não agir — linguagem sóbria

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 4 — A SOLUÇÃO (apresentação do Fyness)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: "É simples, funciona, é pra mim."
□ Apresentar em 1 frase: O QUE É + PARA QUEM + RESULTADO
□ Screenshot ou GIF do produto funcionando
□ Diferencial claro: "pelo WhatsApp — sem instalar nada novo"
→ Meta: scroll depth acima de 65%

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 5 — COMO FUNCIONA (3 passos visuais)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: Eliminar objeção "parece complicado".
□ 3 passos visuais com ícones + texto curto
□ Cada passo: 1 ação → 1 resultado

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 6 — FEATURES + BENEFÍCIOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: Aumentar valor percebido.
□ Grid de cards: ícone + título + 1 frase de benefício direto
□ Linguagem orientada a resultado, não técnica

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 7 — PROVA SOCIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: "Funciona pra outros. Vai funcionar pra mim."
□ Depoimentos com resultado específico (não elogio genérico)
□ Formato: foto + nome + cargo/empresa + texto 2-3 linhas
□ Fase inicial sem clientes: depoimentos dos fundadores
□ Meta: 10 depoimentos publicados até mês 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 8 — PREÇOS E PLANOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: Ancorar o anual, minimizar fricção, CTA imediato.
□ MENSAL: R$197/mês
□ ANUAL: R$137/mês no cartão do cliente (Fyness antecipa os 12 meses ~R$1.644)
  → Destacar como "Mais Popular"
  → Economia: "Economize R$720 por ano"
□ Garantia visível: "7 dias grátis — sem cartão"
□ Ancoragem: "Menos de R$5 por dia"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 9 — FAQ (Objeções Respondidas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: Eliminar últimas objeções antes da decisão.
□ Mínimo 7 perguntas cobrindo: app, segurança, contador, tipos de negócio, trial, tempo de setup, múltiplos negócios
□ Respostas curtas e diretas

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 10 — CTA FINAL (rodapé)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: Última oportunidade de converter quem chegou até aqui.
□ Headline de fechamento + CTA grande e visível
□ Quem chega ao rodapé tem alto interesse — não deixar escapar
 </bpmn2:documentation>
 <bpmn2:incoming>Flow_LP_Start_Auditoria</bpmn2:incoming>
 <bpmn2:outgoing>Flow_LP_Auditoria_AB</bpmn2:outgoing>
 </bpmn2:task>

 <!-- ══════════════════════════════════════════════════════════════
 TASK 2 — PLANO DE A/B TESTS E POPUP DE SAÍDA
 ══════════════════════════════════════════════════════════════ -->
 <bpmn2:task id="Task_LP_ABTests" name="Plano de A/B Tests + Popup de Saída">
 <bpmn2:documentation> PLANO DE A/B TESTS — PRIORIDADE E SEQUÊNCIA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRA DE A/B TEST:
→ Testar UMA variável por vez. Nunca duas simultaneamente.
→ Mínimo de tráfego por variação: 500 visitantes únicos antes de decidir.
→ Decisão baseada em taxa de conversão, não em impressão visual.
→ Vencedor vira o novo controle. Próximo teste começa.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIORIDADE 1 — HEADLINE DO HERO (maior impacto, testar primeiro)
→ Ferramenta: VWO, Optimizely, ou A/B test nativo (React feature flag)
→ Variação A (controle): Headline atual
→ Variação B: "Controle o financeiro da sua empresa pelo WhatsApp — sem planilha, sem app novo"
→ Variação C: "80% dos empresários não sabem o lucro real do próprio negócio. Você é um deles?"
→ Duração: até 500 visitas por variação ou 2 semanas (o que vier primeiro)
→ Métrica de sucesso: taxa de clique no CTA do hero

PRIORIDADE 2 — TEXTO DO BOTÃO CTA (segundo maior impacto)
→ Variação A: "Começar grátis — 7 dias"
→ Variação B: "Testar sem cartão de crédito"
→ Variação C: "Ver o Fyness funcionando"
→ Métrica: taxa de clique no CTA

PRIORIDADE 3 — HERO: IMAGEM vs VÍDEO
→ Variação A: Screenshot estático do dashboard
→ Variação B: GIF de demo de 15s (autoplay mudo)
→ Variação C: Vídeo de 60s com play manual
→ Métrica: scroll depth abaixo do hero + taxa de conversão

PRIORIDADE 4 — PROVA SOCIAL: POSIÇÃO
→ Variação A: Prova social depois dos preços
→ Variação B: Prova social antes dos preços
→ Métrica: taxa de conversão geral da página

PRIORIDADE 5 — FORMULÁRIO: CAMPOS
→ Variação A: 3 campos (nome + email + WhatsApp)
→ Variação B: 1 campo apenas (WhatsApp) — "Começa pelo WhatsApp"
→ Hipótese: menos campos = mais conversão (mas valida se qualidade de lead mantém)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POPUP DE SAÍDA (Exit Intent)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OBJETIVO: Recuperar visitante que está saindo sem converter.
FERRAMENTA: Hotjar, Privy, ou código próprio (Kauã implementa)
TRIGGER: Cursor se mover para fora da janela (direção do botão X do browser)
TIMING: Não mostrar antes de 30 segundos na página (evitar irritar quem mal chegou)
FREQUÊNCIA: 1 vez por sessão. 1 vez por device em 7 dias.

COPY DO POPUP DE SAÍDA — VARIAÇÃO 1 (urgência suave):
TÍTULO: "Espera — você ainda não testou o Fyness"
CORPO: "7 dias grátis. Sem cartão. Cancele quando quiser.
O controle financeiro que você precisa está a uma mensagem de distância."
CTA: "Testar grátis agora"
LINK FECHAR: "Não, prefiro continuar sem controle financeiro" (copy de reforço da dor)

COPY DO POPUP DE SAÍDA — VARIAÇÃO 2 (lead magnet):
TÍTULO: "Antes de ir — leva isso de graça"
CORPO: "Guia: 7 Relatórios Financeiros que Todo Empresário Precisa
[PDF gratuito, enviado pro seu email]"
CAMPO: Email
CTA: "Quero o guia grátis"
SEQUÊNCIA APÓS CAPTURA: Email 1 com o PDF → Email 2 (dia 3): "Viu o guia? Esses relatórios estão no Fyness automaticamente." → CTA para trial

COPY DO POPUP DE SAÍDA — VARIAÇÃO 3 (social proof):
TÍTULO: "Outros empresários que quase saíram também..."
CORPO: "[Depoimento curto de 1 cliente com resultado específico]"
CTA: "Testar 7 dias grátis"

QUAL VARIAÇÃO USAR PRIMEIRO:
→ Variação 1 (urgência suave): mais simples, implementar primeiro.
→ Se taxa de captura do popup for abaixo de 5%: testar Variação 2 (lead magnet converte melhor).

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHAT WIDGET / WHATSAPP FLUTUANTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
→ Botão flutuante de WhatsApp no canto inferior direito da LP.
→ Texto: "Dúvida sobre o Fyness? Fala com a gente"
→ Abre chat direto com o WhatsApp comercial do Fyness.
→ Robert ou Kaynan respondem pessoalmente (aumenta conversão).
→ Implementar: plugin gratuito de WhatsApp ou botão simples com link wa.me.
 </bpmn2:documentation>
 <bpmn2:incoming>Flow_LP_Auditoria_AB</bpmn2:incoming>
 <bpmn2:outgoing>Flow_LP_AB_Visitante</bpmn2:outgoing>
 </bpmn2:task>

 <!-- ══════════════════════════════════════════════════════════════
 TASK 3 — VISITANTE PERCORRE A LP
 ══════════════════════════════════════════════════════════════ -->
 <bpmn2:task id="Task_LP_Scroll" name="Visitante Percorre a LP — Jornada de Scroll">
 <bpmn2:documentation> MONITORAMENTO DA JORNADA DE SCROLL

FERRAMENTAS: Hotjar ou Microsoft Clarity (gratuito)
O QUE ANALISAR:

HEATMAP DE CLIQUE:
→ Onde as pessoas clicam mais? (esperado: botões CTA e links)
→ Onde clicam mas não deveria ter clique? (elemento que parece clicável mas não é — corrigir)
→ O FAQ está sendo acessado? (se sim, as objeções estão ativas — bom sinal)

HEATMAP DE SCROLL:
→ Qual % dos visitantes chega na seção de preços? (meta: acima de 60%)
→ Qual % chega no CTA final? (meta: acima de 40%)
→ Onde ocorre o maior abandono de scroll? (esse é o ponto problemático — priorizar melhoria)

GRAVAÇÃO DE SESSÃO (assistir 20 sessões por semana):
→ Onde as pessoas travam? (cursor para, fica parado — conteúdo confuso)
→ Onde as pessoas voltam (rolam para cima)? (buscam informação que não ficou clara)
→ Quanto tempo ficam na página? (meta: acima de 2 minutos)
→ Qual device usam? (se maioria mobile: priorizar otimização mobile)

KPIs POR SEÇÃO:
□ Hero → CTA acima do fold: CTR acima de 5%
□ Scroll depth 50%: acima de 60% dos visitantes
□ Scroll depth 75% (chega nos preços): acima de 45%
□ Scroll depth 90% (CTA final): acima de 30%
□ Taxa de conversão geral (visita → trial): meta 8-15%
 </bpmn2:documentation>
 <bpmn2:incoming>Flow_LP_AB_Visitante</bpmn2:incoming>
 <bpmn2:outgoing>Flow_LP_Scroll</bpmn2:outgoing>
 </bpmn2:task>

 <!-- Gateway: Clicou no CTA? -->
 <bpmn2:exclusiveGateway id="Gateway_LP_Clicou" name="Clicou no CTA (Qualquer Botão)?">
 <bpmn2:incoming>Flow_LP_Scroll</bpmn2:incoming>
 <bpmn2:outgoing>Flow_LP_Sim</bpmn2:outgoing>
 <bpmn2:outgoing>Flow_LP_Nao</bpmn2:outgoing>
 </bpmn2:exclusiveGateway>

 <!-- ══════════════════════════════════════════════════════════════
 TASK 4 — FORMULÁRIO E CONVERSÃO
 ══════════════════════════════════════════════════════════════ -->
 <bpmn2:task id="Task_LP_Formulario" name="Formulário de Trial + Página de Obrigado">
 <bpmn2:documentation> FORMULÁRIO DE CAPTURA — OTIMIZAÇÃO

CAMPOS MÍNIMOS (versão A — controle):
□ Nome completo
□ Email
□ WhatsApp (com DDD)

CAMPOS VERSÃO B (só WhatsApp):
□ WhatsApp — "Começa pelo WhatsApp. Enviaremos o acesso lá."
→ Hipótese: menos atrito = mais conversão. Testar na Prioridade 5.

MICRO-COPY ABAIXO DO FORMULÁRIO (elimina ansiedade):
" Sem cartão de crédito Acesso imediato Cancele quando quiser"

APÓS SUBMISSÃO — SEQUÊNCIA AUTOMÁTICA:
1. Redirecionar para /obrigado (não fechar — confirmar que funcionou)
2. Disparar evento "TrialIniciado" no Meta Pixel e Google Tag
3. Email de boas-vindas (em até 5 minutos):
 ASSUNTO: "Seu acesso ao Fyness está aqui "
 CORPO: "Olá [nome], bem-vindo ao Fyness!
 Aqui está como começar em 2 minutos:
 1. Acesse [link do painel]
 2. Conecte seu WhatsApp seguindo as instruções
 3. Mande sua primeira mensagem: 'Oi Fyness, estou pronto!'
 Qualquer dúvida, responde esse email ou fala no WhatsApp. — Robert e Kaynan"
4. WhatsApp de confirmação (em até 2 minutos):
 "Oi [nome]! Sou o [Robert/bot do Fyness]. Seu trial de 7 dias está ativo.
 Manda 'OI' aqui pra eu te ajudar a configurar em 2 minutos. "
5. Cadastrar lead no CRM com tags: [TRIAL_ATIVO] [FONTE: [utm_source]] [DATA: hoje]

PÁGINA /OBRIGADO:
□ Título: "Acesso enviado! Confira seu email e WhatsApp."
□ Vídeo de boas-vindas do Robert (30-60s): "Oi, sou o Robert. Obrigado por confiar no Fyness..."
□ 3 passos visuais: "O que fazer agora"
□ CTA: "Acessar o painel" (botão direto)
□ Compartilhamento: "Conhece alguém que precisa disso? Compartilha esse link." (crescimento orgânico)
□ Pixel de conversão disparando nessa página (confirma que chegou até aqui)
 </bpmn2:documentation>
 <bpmn2:incoming>Flow_LP_Sim</bpmn2:incoming>
 <bpmn2:outgoing>Flow_LP_Form</bpmn2:outgoing>
 </bpmn2:task>

 <!-- Popup de saída para quem não clicou -->
 <bpmn2:task id="Task_LP_PopupSaida" name="Popup de Saída (Exit Intent — Recuperação)">
 <bpmn2:documentation> POPUP DE SAÍDA — ÚLTIMA CHANCE ANTES DE PERDER O LEAD

Trigger: movimento do cursor para fora da janela (exit intent)
Frequência: 1x por sessão, 1x por device a cada 7 dias

VARIAÇÃO EM USO (começar pela 1):
→ Variação 1: Urgência suave (implementar primeiro)
→ Variação 2: Lead magnet PDF (se V1 abaixo de 5% de captura)
→ Variação 3: Social proof (testar depois de ter depoimentos reais)

RESULTADO DO POPUP:
A — Lead deixa email/WhatsApp → entra na sequência de email nutrição → retargeting desativado para ele no Meta/Google
B — Lead fecha o popup → pixel registrou a visita → entra no retargeting de Meta Ads (Campanha Retargeting) e Google Display
C — Lead fecha a LP diretamente → mesmo que B

MÉTRICA DO POPUP:
→ Taxa de exibição: quantas sessões viram o popup / total de sessões que saíram sem converter
→ Taxa de captura: quantos deixaram email ou WhatsApp / total que viram o popup
→ Meta de taxa de captura: acima de 8%
→ Se abaixo: trocar variação do popup
 </bpmn2:documentation>
 <bpmn2:incoming>Flow_LP_Nao</bpmn2:incoming>
 <bpmn2:outgoing>Flow_LP_Popup_Gateway</bpmn2:outgoing>
 </bpmn2:task>

 <bpmn2:exclusiveGateway id="Gateway_LP_Popup" name="Deixou Contato no Popup?">
 <bpmn2:incoming>Flow_LP_Popup_Gateway</bpmn2:incoming>
 <bpmn2:outgoing>Flow_LP_Popup_Sim</bpmn2:outgoing>
 <bpmn2:outgoing>Flow_LP_Popup_Nao</bpmn2:outgoing>
 </bpmn2:exclusiveGateway>

 <bpmn2:intermediateThrowEvent id="LinkThrow_LP_Nutricao" name="→ Nutrição por Email">
 <bpmn2:documentation>Lead deixou email no popup de saída.
→ Entra na sequência de nutrição por email (8 emails em 14 dias)
→ B2B a R$197/mês tem ciclo de decisão mais longo — não apressar

SEQUÊNCIA DE NUTRIÇÃO (14 DIAS):

FASE 1 — EDUCAÇÃO (dias 1-5, sem vender):
→ Email 1 (imediato): PDF "7 Relatórios Financeiros Essenciais" (se lead magnet)
  OU conteúdo educativo: "3 sinais que seu financeiro está fora de controle"
  Tom: valor puro, sem CTA para trial. Construir confiança.
→ Email 2 (dia 2): "O erro mais comum de empresários que faturam R$50k+"
  Conteúdo denso. Posicionar Fyness como quem entende o problema.
→ Email 3 (dia 4): "Como saber se seu produto dá lucro de verdade"
  Ensinar algo útil. Menção leve ao Fyness no final: "O Fyness calcula isso automaticamente."

FASE 2 — PRODUTO (dias 6-10, introduzir solução):
→ Email 4 (dia 6): Case de uso — "Como [empresa do setor X] descobriu R$3.200/mês em desperdício"
  Resultado específico. Screenshot do painel. CTA suave: "Quer ver isso no seu negócio?"
→ Email 5 (dia 8): Demo por escrito — "Vou te mostrar o Fyness em 60 segundos"
  GIF ou prints da jornada: WhatsApp → lançamento → painel.
  CTA: "Testar 7 dias grátis — sem cartão"
→ Email 6 (dia 10): Objeções respondidas — FAQ por email
  "Não tenho tempo" / "Já uso planilha" / "É seguro?"
  CTA: "7 dias grátis, cancele quando quiser"

FASE 3 — CONVERSÃO (dias 11-14, fechar):
→ Email 7 (dia 12): Prova social + urgência leve
  Depoimento de cliente (quando disponível) ou depoimento dos fundadores.
  "X empresários já testaram essa semana."
→ Email 8 (dia 14): Último email da sequência
  "Essa é a última vez que falo sobre isso."
  Oferta: "Se começar hoje: primeira semana estendida para 14 dias grátis."
  Se não converter: sai da nutrição, volta pro retargeting via pixel.

REGRAS:
→ Remover do retargeting pago durante os 14 dias (não gastar com quem está na nutrição)
→ Se abrir trial durante a sequência: parar emails e mover para onboarding (Comercial V9)
→ Se não converter após dia 14: tag [NUTRICAO_COMPLETA], reentrar no retargeting
UTM: utm_source=email&utm_medium=nutricao&utm_content=email[N]</bpmn2:documentation>
 <bpmn2:incoming>Flow_LP_Popup_Sim</bpmn2:incoming>
 <bpmn2:linkEventDefinition name="Link_Nutricao" />
 </bpmn2:intermediateThrowEvent>

 <bpmn2:endEvent id="End_LP_Retargeting" name="Entra no Retargeting via Pixel (Meta + Google)">
 <bpmn2:documentation>Lead saiu sem converter e sem deixar contato.
Meta Pixel registrou a visita: entra automaticamente no publico de retargeting do Meta Ads.
Google Tag registrou: entra no publico de Display Retargeting do Google.
Nos proximos 7-14 dias vera anuncios do Fyness no Instagram e em sites parceiros.
Copy do retargeting: diferente da aquisicao, foca em objecao especifica ou prova social.
Nao requer fluxo BPMN explicito: acionado automaticamente pelo Pixel.</bpmn2:documentation>
 <bpmn2:incoming>Flow_LP_Popup_Nao</bpmn2:incoming>
 </bpmn2:endEvent>

 <!-- Trial iniciado → passa pro Comercial V9 -->
 <bpmn2:intermediateThrowEvent id="LinkThrow_LP_Trial" name="→ Trial 7 Dias (Comercial V9)">
 <bpmn2:documentation>Lead converteu. Trial iniciado.
→ Entra no fluxo do BPMN Comercial V9 (Trial 7 Dias + Nutrição)
→ CRM atualizado: tag [TRIAL_ATIVO], fonte rastreada por UTM
→ Meta Pixel: evento TrialIniciado disparado
→ Google Tag: conversão registrada
→ Lead removido dos públicos de retargeting (não gastar com quem já converteu)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REATIVAÇÃO DE TRIAL EXPIRADO (Comercial V9 deve implementar)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Se o lead fez trial de 7 dias e NÃO converteu em pagante:
→ Esse é o lead MAIS BARATO de converter — já conhece o produto, já testou.
→ Não deixar escapar silenciosamente.

SEQUÊNCIA DE REATIVAÇÃO (WhatsApp + Email):
→ Dia 7 (trial expira): WhatsApp pessoal do Robert/Kaynan
  "Oi [nome], seu trial do Fyness acabou hoje. Vi que você usou [X feature].
   Quer continuar? Posso ativar o plano agora com condição especial."
→ Dia 10: Email com case de uso similar ao negócio do lead
→ Dia 14: WhatsApp — oferta direta: "Primeira mensalidade com 30% off se ativar hoje"
→ Dia 30: Último contato — "Está tudo bem? Se mudou de ideia, o Fyness está aqui."
→ Após dia 30: Reentrar no público de retargeting (Meta + Google)

CRM TAGS:
→ [TRIAL_EXPIRADO] no dia 8
→ [REATIVACAO_DIA10] / [REATIVACAO_DIA14] / [REATIVACAO_DIA30]
→ [CHURNED_TRIAL] após dia 30 sem conversão

META: Taxa de reativação de trial expirado > 15%</bpmn2:documentation>
 <bpmn2:incoming>Flow_LP_Form</bpmn2:incoming>
 <bpmn2:linkEventDefinition name="Link_Trial" />
 </bpmn2:intermediateThrowEvent>

 <!-- ══════════════════════════════════════════════════════════════
 TIMER + CICLO DE CRO SEMANAL
 ══════════════════════════════════════════════════════════════ -->
 <bpmn2:intermediateCatchEvent id="Timer_LP_Semanal" name="Ciclo CRO Semanal (P7D)">
 <bpmn2:incoming>Flow_LP_CRO_Ciclo</bpmn2:incoming>
 <bpmn2:incoming>Flow_LP_Monitor_Start</bpmn2:incoming>
 <bpmn2:outgoing>Flow_LP_Analise</bpmn2:outgoing>
 <bpmn2:timerEventDefinition>
 <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
 </bpmn2:timerEventDefinition>
 </bpmn2:intermediateCatchEvent>

 <bpmn2:task id="Task_LP_Analise" name="Dashboard Cross-Channel + Análise CRO Semanal">
 <bpmn2:documentation> DASHBOARD CROSS-CHANNEL + ANÁLISE CRO SEMANAL

QUANDO: Toda segunda-feira. Responsável: Kaynan + Kauã.
FERRAMENTAS: Google Analytics 4, Hotjar/Clarity, Meta Ads Manager, Google Ads.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CONSOLIDAÇÃO CROSS-CHANNEL (fazer ANTES da análise CRO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Montar um único dashboard semanal com dados de TODOS os canais:

□ FONTE | INVESTIDO | LEADS | CPL | TRIALS | CAC | ROAS
  Meta Ads       | R$___ | ___ | R$___ | ___ | R$___ | ___x
  Google Ads     | R$___ | ___ | R$___ | ___ | R$___ | ___x
  Robert (org.)  | R$0   | ___ | R$0   | ___ | R$0   | ---
  Kaynan (org.)  | R$0   | ___ | R$0   | ___ | R$0   | ---
  @fynessbr      | R$0   | ___ | R$0   | ___ | R$0   | ---
  TOTAL          | R$___ | ___ | R$___ | ___ | R$___ | ___x

□ Qual canal trouxe mais trials essa semana?
□ Qual canal tem o menor CAC?
□ Realocar verba: tirar do canal com pior CAC → colocar no melhor
□ Orgânico vs Pago: qual % dos trials veio de cada?

DECISÃO DE ALOCAÇÃO:
→ Se um canal tem CAC 2x maior que outro: reduzir budget em 30%
→ Registrar decisão de realocação no Notion/planilha

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GATEWAY: PAUSA DO TRÁFEGO PAGO (checar toda semana)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Orgânico trouxe mais de 40% dos trials essa semana?
  → SIM: Reduzir tráfego pago em 50%. Orgânico está carregando — não queimar dinheiro.
  → Manter retargeting ativo (custo baixo, público quente).
  → Pausar campanha de Consciência (frio) primeiro.

□ Reel de Robert ou Kaynan viralizou (50k+ views)?
  → SIM: PAUSAR Consciência do Meta por 7 dias. O orgânico já está gerando awareness.
  → Manter Conversão + Retargeting ativos (capturam quem o Reel aqueceu).
  → Reativar Consciência quando views orgânicos voltarem ao normal.

□ CAC pago está acima de R$400?
  → SIM: PAUSAR canal pago com pior CAC imediatamente.
  → Redirecionar verba para orgânico (boost de Stories R$200) se tiver Reel performando.
  → Só reativar após otimização (criativo novo, público novo, LP ajustada).

□ Orgânico abaixo de 20% dos trials E pago com CAC saudável?
  → Situação normal. Manter pago rodando. Orgânico cresce com o tempo.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MÉTRICAS SEMANAIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRÁFEGO:
□ Visitantes únicos da semana: [X]
□ Breakdown por fonte: Meta Ads [X%] | Google [X%] | Instagram Orgânico [X%] | Direto [X%]
□ Taxa de rejeição (bounce): [X]% — meta: abaixo de 55%
□ Tempo médio na página: [X min] — meta: acima de 2 min
□ Scroll depth 50%: [X]% dos visitantes — meta: acima de 60%
□ Scroll depth 75% (chegou nos preços): [X]% — meta: acima de 45%

CONVERSÃO:
□ Total de trials iniciados: [X]
□ Taxa de conversão geral: [X]% — meta: 8-15%
□ Taxa de conversão por fonte:
 Meta Ads: [X]% | Google Ads: [X]% | Robert: [X]% | Kaynan: [X]% | @fynessbr: [X]%
□ CPA (custo por trial) por canal: Meta [R$X] | Google [R$X]
□ Popup de saída: exibido [X] vezes | capturou [X] emails | taxa [X]%

A/B TEST EM ANDAMENTO:
□ Teste atual: [variável testada]
□ Variação A: [X]% de conversão
□ Variação B: [X]% de conversão
□ Vencedor definido? [Sim/Não] — [precisa mais tráfego?]

ANÁLISE QUALITATIVA (Hotjar/Clarity):
□ Assistiu 10 gravações de sessão essa semana?
□ Identificou algum ponto de atrito novo?
□ Alguma seção com alto abandono de scroll?

DECISÃO DA SEMANA:
□ Próximo elemento a testar: [descrever]
□ Ajuste urgente a implementar: [descrever]
□ Canal com melhor conversão essa semana: [nomear] — por quê?

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RELATÓRIO MENSAL DE CRO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Taxa de conversão mês anterior: [X]% → mês atual: [Y]% → variação: [+/-Z%]
□ Testes A/B concluídos no mês: [listar] | Vencedores: [listar]
□ Melhor fonte de tráfego (maior taxa de conversão): [nomear]
□ Pior fonte de tráfego (menor taxa de conversão): [nomear] — o que mudar?
□ Popup de saída: taxa média de captura no mês: [X]% — manter ou trocar variação?
□ Velocidade da LP: PageSpeed atual [X] — abaixo de 70? Kauã otimiza.
 </bpmn2:documentation>
 <bpmn2:incoming>Flow_LP_Analise</bpmn2:incoming>
 <bpmn2:outgoing>Flow_LP_Gateway_CRO</bpmn2:outgoing>
 </bpmn2:task>

 <bpmn2:exclusiveGateway id="Gateway_LP_Conversao" name="Taxa de Conversão Acima de 8%?">
 <bpmn2:incoming>Flow_LP_Gateway_CRO</bpmn2:incoming>
 <bpmn2:outgoing>Flow_LP_Escalar</bpmn2:outgoing>
 <bpmn2:outgoing>Flow_LP_Otimizar</bpmn2:outgoing>
 </bpmn2:exclusiveGateway>

 <bpmn2:task id="Task_LP_Escalar" name="Escalar: Aumentar Tráfego + Próximo A/B Test">
 <bpmn2:documentation> ESCALAR — LP COM BOA CONVERSÃO

Conversão acima de 8%: a LP está funcionando. Hora de escalar o tráfego.

AÇÕES:
1. Comunicar para Meta Ads e Google Ads: aumentar orçamento (LP está convertendo bem)
2. Avançar para o próximo item do plano de A/B tests (otimização incremental)
3. Analisar qual fonte tem a maior conversão e direcionar mais verba para ela
4. Testar nova variação de popup de saída para aumentar captura
5. Adicionar social proof novo (novo depoimento, novo case) — prova social é sempre iterável
6. Considerar criar LP específica por canal (LP para Google diferente de LP para Instagram)
 → LP por canal: headline alinhada com o anúncio = maior Quality Score + maior conversão
 </bpmn2:documentation>
 <bpmn2:incoming>Flow_LP_Escalar</bpmn2:incoming>
 <bpmn2:outgoing>Flow_LP_CRO_Loop</bpmn2:outgoing>
 </bpmn2:task>

 <bpmn2:task id="Task_LP_Otimizar" name="Otimizar: Diagnóstico e Ajuste Prioritário">
 <bpmn2:documentation> OTIMIZAR — LP ABAIXO DA META

DIAGNÓSTICO POR SINTOMA:

Taxa de rejeição acima de 70%:
→ Hero não está funcionando. Headline não segura.
→ Ação: A/B test urgente na headline (Prioridade 1 do plano).
→ Verificar também: velocidade da página (lenta = rejeição alta).

Scroll depth baixo (menos de 40% chegam nos preços):
→ O conteúdo está perdendo o visitante no meio.
→ Assistir gravações de sessão no Hotjar: onde exatamente sai?
→ Ação: encurtar a seção onde ocorre o abandono ou reescrever o copy daquela seção.

Cliques no CTA mas formulário não converte:
→ Problema está no formulário ou na página pós-clique.
→ Ação: testar reduzir campos (Prioridade 5 do plano de A/B).
→ Verificar se formulário está funcionando em mobile.

Conversão baixa de um canal específico (ex: Google Search converte bem, Meta não):
→ O anúncio do Meta não está alinhado com o que o visitante encontra na LP.
→ Ação: revisar copy do anúncio do Meta para alinhar com a LP, ou criar variação da LP para Meta.

Popup de saída com taxa abaixo de 5%:
→ Copy do popup não está convencendo.
→ Ação: trocar para Variação 2 (lead magnet PDF — menor barreira).
 </bpmn2:documentation>
 <bpmn2:incoming>Flow_LP_Otimizar</bpmn2:incoming>
 <bpmn2:outgoing>Flow_LP_CRO_Loop</bpmn2:outgoing>
 </bpmn2:task>

 <!-- Loop de volta pro ciclo semanal -->
 <bpmn2:intermediateCatchEvent id="Timer_LP_Loop" name="Próximo Ciclo Semanal (P7D)">
 <bpmn2:incoming>Flow_LP_CRO_Loop</bpmn2:incoming>
 <bpmn2:outgoing>Flow_LP_CRO_Ciclo</bpmn2:outgoing>
 <bpmn2:timerEventDefinition>
 <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
 </bpmn2:timerEventDefinition>
 </bpmn2:intermediateCatchEvent>

 <!-- Start do ciclo de monitoramento CRO (paralelo ao fluxo de visitantes) -->
 <bpmn2:startEvent id="Start_LP_Monitoramento" name="Inicio do Ciclo de Monitoramento CRO">
 <bpmn2:documentation>Inicio paralelo do ciclo semanal de CRO.
Roda independente do fluxo de visitantes.
Responsavel: Kaua + Kaynan, toda segunda-feira.</bpmn2:documentation>
 <bpmn2:outgoing>Flow_LP_Monitor_Start</bpmn2:outgoing>
 </bpmn2:startEvent>

 <!-- SEQUENCE FLOWS -->
 <bpmn2:sequenceFlow id="Flow_LP_Start_Auditoria" sourceRef="Start_LP_Visitante" targetRef="Task_LP_CopySecoes" />
 <bpmn2:sequenceFlow id="Flow_LP_Auditoria_AB" sourceRef="Task_LP_CopySecoes" targetRef="Task_LP_ABTests" />
 <bpmn2:sequenceFlow id="Flow_LP_AB_Visitante" sourceRef="Task_LP_ABTests" targetRef="Task_LP_Scroll" />
 <bpmn2:sequenceFlow id="Flow_LP_Scroll" sourceRef="Task_LP_Scroll" targetRef="Gateway_LP_Clicou" />
 <bpmn2:sequenceFlow id="Flow_LP_Sim" name="Sim" sourceRef="Gateway_LP_Clicou" targetRef="Task_LP_Formulario" />
 <bpmn2:sequenceFlow id="Flow_LP_Nao" name="Não" sourceRef="Gateway_LP_Clicou" targetRef="Task_LP_PopupSaida" />
 <bpmn2:sequenceFlow id="Flow_LP_Form" sourceRef="Task_LP_Formulario" targetRef="LinkThrow_LP_Trial" />
 <bpmn2:sequenceFlow id="Flow_LP_Popup_Gateway" sourceRef="Task_LP_PopupSaida" targetRef="Gateway_LP_Popup" />
 <bpmn2:sequenceFlow id="Flow_LP_Popup_Sim" name="Deixou contato" sourceRef="Gateway_LP_Popup" targetRef="LinkThrow_LP_Nutricao" />
 <bpmn2:sequenceFlow id="Flow_LP_Popup_Nao" name="Saiu sem deixar" sourceRef="Gateway_LP_Popup" targetRef="End_LP_Retargeting" />
 <bpmn2:sequenceFlow id="Flow_LP_CRO_Ciclo" sourceRef="Timer_LP_Loop" targetRef="Timer_LP_Semanal" />
 <bpmn2:sequenceFlow id="Flow_LP_Analise" sourceRef="Timer_LP_Semanal" targetRef="Task_LP_Analise" />
 <bpmn2:sequenceFlow id="Flow_LP_Gateway_CRO" sourceRef="Task_LP_Analise" targetRef="Gateway_LP_Conversao" />
 <bpmn2:sequenceFlow id="Flow_LP_Escalar" name="Acima de 8%" sourceRef="Gateway_LP_Conversao" targetRef="Task_LP_Escalar" />
 <bpmn2:sequenceFlow id="Flow_LP_Otimizar" name="Abaixo de 8%" sourceRef="Gateway_LP_Conversao" targetRef="Task_LP_Otimizar" />
 <bpmn2:sequenceFlow id="Flow_LP_CRO_Loop" sourceRef="Task_LP_Escalar" targetRef="Timer_LP_Loop" />
 <bpmn2:sequenceFlow id="Flow_LP_CRO_Loop2" sourceRef="Task_LP_Otimizar" targetRef="Timer_LP_Loop" />
 <bpmn2:sequenceFlow id="Flow_LP_Monitor_Start" sourceRef="Start_LP_Monitoramento" targetRef="Timer_LP_Semanal" />

 </bpmn2:process>

  <!-- ============================================================ -->
  <!-- POOL 7: YOUTUBE — CANAL UNICO FYNESS -->
  <!-- ============================================================ -->
  <bpmn2:process id="Process_MultiPlat" isExecutable="false">

    <bpmn2:startEvent id="Start_Multi_Setup" name="Setup YouTube — Canal Unico Fyness">
      <bpmn2:documentation>YOUTUBE — CANAL UNICO FYNESS

POR QUE UM CANAL SO (e nao 3 separados):
YouTube recompensa WATCH TIME TOTAL do canal. Dividir em 3 canais fragmenta a audiencia
e enfraquece o algoritmo. No Instagram e TikTok, perfis pessoais vencem.
No YouTube, marca vence. Robert e Kaynan aparecem como APRESENTADORES do canal Fyness.

SETUP DO CANAL:
□ Nome: "Fyness — Gestao pra quem tem negocio de verdade"
□ Descricao: "Sistema de gestao financeira pra dono de padaria, salao, oficina, restaurante.
   Se voce fatura R$10k+ e nao sabe pra onde vai o dinheiro, esse canal e pra voce."
□ Banner: "Chega de perder dinheiro sem saber" + mockup do sistema + CTA teste gratis
□ Link: LP com UTM utm_source=youtube&amp;utm_medium=channel
□ Playlists iniciais:
  - Gestao Financeira pra Iniciante (Robert)
  - Casos Reais de Clientes (Robert)
  - Tour pelo Fyness (Kaynan)
  - Build in Public (Kaynan)
  - Dicas Rapidas (Shorts compilados)

RESPONSAVEL: Kaua (edicao/publicacao) + Robert (longform) + Kaynan (demos/build in public)

POR QUE YOUTUBE E ESTRATEGICO:
→ YouTube e o 2o maior buscador do mundo
→ Conteudo ranqueia por 2-3 ANOS (diferente de TikTok que morre em dias)
→ Lead que pesquisa "como calcular lucro" e o MAIS qualificado (busca ativa)
→ Video longform de 10min converte melhor que qualquer Short porque cria CONFIANCA
→ SEO de video aparece no GOOGLE tambem (double exposure)</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Multi_Setup</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_Multi_Fluxo" name="Shorts + Longform — Dois Formatos de Conteudo">
      <bpmn2:documentation>YOUTUBE — DOIS FORMATOS DE CONTEUDO

FORMATO 1: SHORTS (motor de crescimento rapido)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Reaproveitamento DIRETO do TikTok/Reels — mesmo video, upload separado.
POR QUE FUNCIONA: YouTube Shorts tem BUSCA (diferente do TikTok). Titulo e descricao
importam pra SEO. O mesmo video que viralizou no TikTok rankeia no YouTube pra
buscas como "controle financeiro pequeno negocio". Custo incremental: ZERO.

REGRAS:
→ Titulo SEO (diferente do TikTok): "Como saber se seu negocio da lucro | Dica rapida"
→ Descricao: 2-3 linhas com keywords + link Fyness com UTM
→ Upload separado por plataforma (nao usar cross-post automatico)
→ Kaua faz: recebe video editado pro TikTok, adapta titulo, publica
→ YouTube Shorts vive 6+ MESES (Instagram Reel morre em 48h)

FREQUENCIA: 5-7 Shorts/semana (todos os TikToks dos 3 perfis vao pro YouTube)

FORMATO 2: LONGFORM (motor de conversao + SEO)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Videos de 8-15 minutos. Conteudo profundo que CONVERTE.
POR QUE FUNCIONA:
1) Quem assiste 10min de video JA CONFIA em voce
2) YouTube favorece watch time longo no algoritmo
3) Aparece no GOOGLE (SEO duplo)
4) Permite explicar o produto sem parecer propaganda

ROBERT APRESENTA (70% dos longforms):
- Tutoriais praticos: "Como calcular preco de venda (passo a passo)"
- Casos reais: "Dono de padaria que perdia R$3mil/mes sem saber"
- Erros comuns: "5 erros financeiros que quebram seu negocio"

KAYNAN APRESENTA (30% dos longforms):
- Tour do produto: "Tudo que voce controla no Fyness pelo celular"
- Build in public: "O que construi essa semana no Fyness"
- Setup por nicho: "Configurando Fyness pra padaria/salao/oficina"

ESTRUTURA LONGFORM:
→ 0:00-0:30 HOOK: problema + promessa (NAO enrolar)
→ 0:30-1:30 CONTEXTO: por que isso importa (exemplo real)
→ 1:30-8:00 CONTEUDO: passo a passo / caso / explicacao (VALOR REAL)
→ 8:00-9:00 RESUMO: recapitular pontos principais
→ 9:00-9:30 CTA: "Link na descricao pra testar gratis" + like/subscribe

FREQUENCIA LONGFORM:
Mes 1-3: 1 video/semana (Robert) + 1 a cada 2 semanas (Kaynan) = ~6/mes
Mes 4+: 2 videos/semana = ~8/mes</bpmn2:documentation>
      <bpmn2:incoming>Flow_Multi_Setup</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Multi_Fluxo</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Multi_Calendario" name="SEO e Calendario YouTube">
      <bpmn2:documentation>YOUTUBE — SEO E CALENDARIO DE PUBLICACAO

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEO (MAIOR VANTAGEM DO YOUTUBE)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
POR QUE SEO IMPORTA:
Ads para de funcionar quando para de pagar.
Video ranqueado traz lead TODO MES por 2-3 anos. E juros compostos de conteudo.

TITULO: Keyword no inicio + curiosidade
BOM: "Fluxo de caixa: como montar o do seu negocio (metodo simples)"
BOM: "Como saber se seu negocio da lucro | Metodo pra iniciante"
RUIM: "Dica financeira incrivel que vai mudar sua vida!!!!"
RUIM: "Video 47 — Fyness explica gestao"

DESCRICAO: Primeiras 2 linhas com keywords (Google indexa). Depois: timestamps + link.
Template:
→ Linha 1-2: "Nesse video eu mostro [keyword] pra [publico]."
→ Linha 3: Link Fyness + UTM
→ Linha 4+: Timestamps (capitulos)

THUMBNAIL: Rosto (Robert ou Kaynan) com expressao + texto curto (3-4 palavras) + contraste alto
CTR > 5% = bom. > 8% = otimo. Kaua cria no Canva.

KEYWORDS ALVO (pesquisar volume antes):
"gestao financeira pequeno negocio" | "controle financeiro empreendedor"
"como calcular lucro do meu negocio" | "fluxo de caixa simples"
"como precificar meu produto" | "gestao de restaurante"
"controle de estoque" | "CMV restaurante hamburgueria"
"separar conta PJ e pessoal" | "sistema gestao financeira"
POR QUE: 5.000-20.000 buscas/mes no Brasil, baixa concorrencia de video.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CALENDARIO YOUTUBE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SHORTS: Kaua publica 1/dia (repost dos TikToks de Robert, Kaynan e Fyness)
LONGFORM: Quinta-feira 18h (Robert) + 2o e 4o sabado 14h (Kaynan, quinzenal)
Horario de publicacao importa MENOS no YouTube (algoritmo distribui ao longo de dias)

PLAYLISTS (YouTube recomenda playlists inteiras — aumenta watch time):
1. Gestao Financeira pra Iniciante (Robert)
2. Casos Reais de Clientes Fyness (Robert)
3. Tour pelo Fyness (Kaynan)
4. Build in Public — Bastidores (Kaynan)
5. Dicas Rapidas (compilacao de Shorts)
6. Precificacao e CMV (Robert)

END SCREEN + CARDS: todo video tem end screen pro proximo + 3 cards relevantes
POR QUE: aumenta tempo de sessao. YouTube recompensa isso no algoritmo.

COMMUNITY TAB (apos 500 inscritos):
Enquetes: "Qual seu maior desafio? Precificacao / Fluxo de caixa / Estoque"
Posts: "Proximo video: o que voces querem ver?"
POR QUE: engajamento barato que alimenta pauta</bpmn2:documentation>
      <bpmn2:incoming>Flow_Multi_Fluxo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Multi_Ciclo</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateCatchEvent id="Timer_Multi_Semanal" name="Ciclo Semanal (P7D)">
      <bpmn2:incoming>Flow_Multi_Ciclo</bpmn2:incoming>
      <bpmn2:incoming>Flow_Multi_Loop</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Multi_Analise</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Multi_Analise" name="Analise YouTube + Cross-Platform">
      <bpmn2:documentation>ANALISE SEMANAL — YOUTUBE + CROSS-PLATFORM
Quando: toda segunda, junto com analise dos outros pools.
Responsavel: Kaynan + Kaua

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
METRICAS YOUTUBE (primarias)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- CTR da thumbnail (>5% = bom, >8% = otimo)
- Retencao media longform (>40% = bom)
- Cliques no link da descricao (conversao real)
- Impressoes de busca (indica SEO funcionando)
- Watch time total do canal (principal metrica do algoritmo)
- Inscritos/semana
- Views Shorts vs Longform (rastrear separado)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
COMPARATIVO CROSS-PLATFORM (semanal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ PLATAFORMA | VIEWS TOTAL | MELHOR VIDEO | SEGUIDORES NOVOS | CLIQUES LINK
  IG Robert    | ___         | ___          | ___              | ___
  IG Kaynan    | ___         | ___          | ___              | ___
  IG Fyness    | ___         | ___          | ___              | ___
  TikTok Robert| ___         | ___          | ___              | ___
  TikTok Kaynan| ___         | ___          | ___              | ___
  YouTube      | ___         | ___          | ___              | ___
  TOTAL        | ___         | ___          | ___              | ___

PERGUNTAS CHAVE:
□ Qual PERFIL trouxe mais leads essa semana? (Robert vs Kaynan vs Fyness)
□ Qual PLATAFORMA trouxe mais cliques no link? (IG vs TikTok vs YouTube)
□ O mesmo video performou diferente por plataforma? Por que?
□ Trials via UTM: robert_ig [X] | robert_tiktok [X] | kaynan_ig [X] | kaynan_tiktok [X] | youtube [X]

FUNIL:
TikTok atrai (topo) → Instagram nutre (meio) → YouTube convence (fundo) → LP converte
POR QUE FUNCIONA: Marketing multi-touch: o cliente precisa de 7-13 pontos de contato
antes de comprar (Google Zero Moment of Truth). 3 perfis × 3 plataformas = muitos
pontos de contato sem parecer spam.

REGRAS CROSS-PLATFORM:
→ Robert NUNCA posta demo (papel do Kaynan)
→ Kaynan NUNCA da conselho financeiro (papel do Robert)
→ Fyness institucional NUNCA tem opiniao pessoal (so fatos, resultados, produto)
→ Todo conteudo menciona @fynessbr (direciona pro institucional)
→ YouTube e canal UNICO — Instagram e TikTok sao perfis SEPARADOS
→ Review semanal: qual plataforma traz mais cliques? Dobrar investimento nela.

DECISOES:
→ Se YouTube Shorts supera TikTok em views de longo prazo: priorizar titulos SEO
→ Se longform tem retencao <30%: hook fraco ou conteudo longo demais — Kaua reedita
→ Se CTR thumbnail <3%: Kaua refaz thumbnail (rosto + texto curto + contraste)</bpmn2:documentation>
      <bpmn2:incoming>Flow_Multi_Analise</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Multi_Gateway</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Multi_LP_Link</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:exclusiveGateway id="Gateway_Multi_Crescimento" name="Alcance Crescendo?">
      <bpmn2:incoming>Flow_Multi_Gateway</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Multi_Escalar</bpmn2:outgoing>
      <bpmn2:outgoing>Flow_Multi_Otimizar</bpmn2:outgoing>
    </bpmn2:exclusiveGateway>

    <bpmn2:task id="Task_Multi_Escalar" name="Escalar: YouTube + Cross-Platform">
      <bpmn2:documentation>ESCALAR — YOUTUBE CRESCENDO

QUANDO ESCALAR:
→ Videos longform com retencao >40% consistente
→ Shorts trazendo >100 inscritos/semana
→ Videos aparecendo em buscas do Google
→ Cliques no link da descricao crescendo

ACOES:
→ Robert: aumentar de 1 pra 2 longforms/semana
→ Kaynan: aumentar de quinzenal pra semanal
→ Kaua: investir em thumbnails profissionais (template premium)
→ Testar YouTube Ads (Shorts ads — CPV barato, formato novo)
→ Criar series tematicas: "30 Dias de Gestao Financeira" (1 video/dia por 30 dias)
→ Investir em equipamento: microfone melhor, iluminacao consistente

ESCALAR — CROSS-PLATFORM
→ Plataforma vencedora em cliques recebe mais investimento de tempo
→ Testar TikTok Ads (boost de video organico — R$50-100/semana no melhor)
→ Instagram: impulsionar melhor Reel organico (R$100-200/semana)
→ NAO abandonar nenhuma plataforma — manter minimo em todas</bpmn2:documentation>
      <bpmn2:incoming>Flow_Multi_Escalar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Multi_Loop_Esc</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:task id="Task_Multi_Otimizar" name="Otimizar: YouTube + Cross-Platform">
      <bpmn2:documentation>OTIMIZAR — YOUTUBE + CROSS-PLATFORM

DIAGNOSTICO YOUTUBE LONGFORM:
→ CTR thumbnail <3%: thumbnail fraco. Kaua refaz: rosto com expressao + 3-4 palavras
→ Retencao <30%: hook fraco OU conteudo nao entrega o prometido. Testar intro mais direta.
→ Views ok mas poucos cliques no link: CTA fraco. Adicionar card + mencao verbal aos 50% do video.
→ Impressoes de busca caindo: titulo sem keyword. Reformular titulo com keyword principal.

DIAGNOSTICO YOUTUBE SHORTS:
→ Views abaixo de 500 em 7 dias: titulo fraco pra busca.
  Testar: "Como [acao] [tipo de negocio]" (ex: "Como controlar caixa da padaria")
→ Views altos mas zero inscritos: falta CTA verbal e visual de subscribe

DIAGNOSTICO CROSS-PLATFORM:
→ TikTok views baixos: gancho fraco nos primeiros 1.5s. Texto grande na tela + fala direta.
→ Instagram Reels com pouco alcance: testar horarios (18h vs 20h) e formatos (carrossel vs reel)
→ Mesmo video funciona em 1 plataforma e nao em outra: normal. Adaptar formato.
→ Nenhuma plataforma funcionando: problema no CONTEUDO. Voltar pros pools e revisar ganchos.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Multi_Otimizar</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Multi_Loop_Oti</bpmn2:outgoing>
    </bpmn2:task>

    <bpmn2:intermediateThrowEvent id="LinkThrow_Multi_LP" name="→ Landing Page">
      <bpmn2:documentation>Trafego organico de TODAS as plataformas chega na LP via link na bio/descricao.
UTMs por perfil e plataforma:
→ Robert IG: utm_source=instagram&amp;utm_medium=bio&amp;utm_campaign=robert
→ Robert TikTok: utm_source=tiktok&amp;utm_medium=bio&amp;utm_campaign=robert
→ Kaynan IG: utm_source=instagram&amp;utm_medium=bio&amp;utm_campaign=kaynan
→ Kaynan TikTok: utm_source=tiktok&amp;utm_medium=bio&amp;utm_campaign=kaynan
→ Fyness IG: utm_source=instagram&amp;utm_medium=bio&amp;utm_campaign=fynessbr
→ Fyness TikTok: utm_source=tiktok&amp;utm_medium=bio&amp;utm_campaign=fynessbr
→ YouTube: utm_source=youtube&amp;utm_medium=channel&amp;utm_campaign=longform
→ YouTube Shorts: utm_source=youtube&amp;utm_medium=shorts&amp;utm_campaign=shorts</bpmn2:documentation>
      <bpmn2:incoming>Flow_Multi_LP_Link</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_LP" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:sequenceFlow id="Flow_Multi_Setup" sourceRef="Start_Multi_Setup" targetRef="Task_Multi_Fluxo" />
    <bpmn2:sequenceFlow id="Flow_Multi_Fluxo" sourceRef="Task_Multi_Fluxo" targetRef="Task_Multi_Calendario" />
    <bpmn2:sequenceFlow id="Flow_Multi_Ciclo" sourceRef="Task_Multi_Calendario" targetRef="Timer_Multi_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Multi_Analise" sourceRef="Timer_Multi_Semanal" targetRef="Task_Multi_Analise" />
    <bpmn2:sequenceFlow id="Flow_Multi_Gateway" sourceRef="Task_Multi_Analise" targetRef="Gateway_Multi_Crescimento" />
    <bpmn2:sequenceFlow id="Flow_Multi_Escalar" name="Sim" sourceRef="Gateway_Multi_Crescimento" targetRef="Task_Multi_Escalar" />
    <bpmn2:sequenceFlow id="Flow_Multi_Otimizar" name="Nao" sourceRef="Gateway_Multi_Crescimento" targetRef="Task_Multi_Otimizar" />
    <bpmn2:sequenceFlow id="Flow_Multi_Loop_Esc" sourceRef="Task_Multi_Escalar" targetRef="Timer_Multi_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Multi_Loop_Oti" sourceRef="Task_Multi_Otimizar" targetRef="Timer_Multi_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Multi_LP_Link" sourceRef="Task_Multi_Analise" targetRef="LinkThrow_Multi_LP" />

  </bpmn2:process>

    <!-- ============================================================ -->
  <!-- DIAGRAMA VISUAL — LAYOUT COMPLETO -->
  <!-- ============================================================ -->
  <bpmndi:BPMNDiagram id="BPMNDiagram_Marketing">
    <bpmndi:BPMNPlane id="BPMNPlane_Marketing" bpmnElement="Collaboration_Marketing">

    <!-- ANOTACAO: IN MARKETING -->
    <bpmndi:BPMNShape id="Annotation_InMarketing_di" bpmnElement="Annotation_InMarketing">
      <dc:Bounds x="180" y="3320" width="400" height="230" />
    </bpmndi:BPMNShape>

    <!-- ANOTACAO: CAC MAXIMO -->
    <bpmndi:BPMNShape id="Annotation_CAC_di" bpmnElement="Annotation_CAC">
      <dc:Bounds x="620" y="3320" width="400" height="250" />
    </bpmndi:BPMNShape>

    <!-- POOL 1: META ADS -->
    <bpmndi:BPMNShape id="Participant_MetaAds_di" bpmnElement="Participant_MetaAds" isHorizontal="true">
      <dc:Bounds x="160" y="80" width="1800" height="560" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Start_Meta_Setup_di" bpmnElement="Start_Meta_Setup">
      <dc:Bounds x="300" y="122" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="278" y="168" width="84" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Meta_Pixel_Publicos_di" bpmnElement="Task_Meta_Pixel_Publicos">
      <dc:Bounds x="370" y="100" width="160" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Start_Meta_Consciencia_di" bpmnElement="Start_Meta_Consciencia">
      <dc:Bounds x="300" y="242" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="278" y="288" width="84" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Meta_Criativo_Consciencia_di" bpmnElement="Task_Meta_Criativo_Consciencia">
      <dc:Bounds x="370" y="220" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Start_Meta_Conversao_di" bpmnElement="Start_Meta_Conversao">
      <dc:Bounds x="300" y="342" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="278" y="388" width="84" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Meta_Criativo_Conversao_di" bpmnElement="Task_Meta_Criativo_Conversao">
      <dc:Bounds x="370" y="320" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Meta_Publicar_di" bpmnElement="Task_Meta_Publicar">
      <dc:Bounds x="560" y="320" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Timer_Meta_Semana1_di" bpmnElement="Timer_Meta_Semana1">
      <dc:Bounds x="740" y="342" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="718" y="388" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Meta_Analise_Semanal_di" bpmnElement="Task_Meta_Analise_Semanal">
      <dc:Bounds x="810" y="320" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_Meta_CPL_di" bpmnElement="Gateway_Meta_CPL" isMarkerVisible="true">
      <dc:Bounds x="990" y="335" width="50" height="50" />
      <bpmndi:BPMNLabel><dc:Bounds x="970" y="305" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Meta_Escalar_di" bpmnElement="Task_Meta_Escalar">
      <dc:Bounds x="1080" y="270" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Meta_Otimizar_Criativo_di" bpmnElement="Task_Meta_Otimizar_Criativo">
      <dc:Bounds x="1080" y="400" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Timer_Meta_Mensal_di" bpmnElement="Timer_Meta_Mensal">
      <dc:Bounds x="1270" y="342" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1248" y="388" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Meta_Relatorio_Mensal_di" bpmnElement="Task_Meta_Relatorio_Mensal">
      <dc:Bounds x="1340" y="320" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="LinkThrow_Meta_LP_di" bpmnElement="LinkThrow_Meta_LP">
      <dc:Bounds x="1530" y="342" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1508" y="388" width="90" height="14" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Start_Meta_Retargeting_di" bpmnElement="Start_Meta_Retargeting">
      <dc:Bounds x="300" y="462" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="278" y="508" width="84" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Meta_Criativo_Retargeting_di" bpmnElement="Task_Meta_Criativo_Retargeting">
      <dc:Bounds x="370" y="440" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="Flow_Meta_Setup_di" bpmnElement="Flow_Meta_Setup"><di:waypoint x="336" y="140" /><di:waypoint x="370" y="140" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Meta_Publicos_di" bpmnElement="Flow_Meta_Publicos"><di:waypoint x="530" y="140" /><di:waypoint x="560" y="360" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Meta_C1_Start_di" bpmnElement="Flow_Meta_C1_Start"><di:waypoint x="336" y="260" /><di:waypoint x="370" y="260" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Meta_C2_Start_di" bpmnElement="Flow_Meta_C2_Start"><di:waypoint x="336" y="360" /><di:waypoint x="370" y="360" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Meta_C3_Start_di" bpmnElement="Flow_Meta_C3_Start"><di:waypoint x="336" y="480" /><di:waypoint x="370" y="480" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Meta_C1_Criativo_di" bpmnElement="Flow_Meta_C1_Criativo"><di:waypoint x="510" y="260" /><di:waypoint x="560" y="340" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Meta_C2_Criativo_di" bpmnElement="Flow_Meta_C2_Criativo"><di:waypoint x="510" y="360" /><di:waypoint x="560" y="360" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Meta_C3_Criativo_di" bpmnElement="Flow_Meta_C3_Criativo"><di:waypoint x="510" y="480" /><di:waypoint x="560" y="380" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Meta_Publicado_di" bpmnElement="Flow_Meta_Publicado"><di:waypoint x="700" y="360" /><di:waypoint x="740" y="360" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Meta_T7_di" bpmnElement="Flow_Meta_T7"><di:waypoint x="776" y="360" /><di:waypoint x="810" y="360" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Meta_Analise_di" bpmnElement="Flow_Meta_Analise"><di:waypoint x="950" y="360" /><di:waypoint x="990" y="360" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Meta_CPL_Sim_di" bpmnElement="Flow_Meta_CPL_Sim"><di:waypoint x="1040" y="360" /><di:waypoint x="1080" y="300" /><bpmndi:BPMNLabel><dc:Bounds x="1051" y="320" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Meta_CPL_Nao_di" bpmnElement="Flow_Meta_CPL_Nao"><di:waypoint x="1040" y="360" /><di:waypoint x="1080" y="440" /><bpmndi:BPMNLabel><dc:Bounds x="1051" y="400" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Meta_Loop_di" bpmnElement="Flow_Meta_Loop"><di:waypoint x="1220" y="310" /><di:waypoint x="1270" y="360" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Meta_Loop2_di" bpmnElement="Flow_Meta_Loop2"><di:waypoint x="1220" y="440" /><di:waypoint x="1270" y="378" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Meta_T30_di" bpmnElement="Flow_Meta_T30"><di:waypoint x="1306" y="360" /><di:waypoint x="1340" y="360" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Meta_LP_Link_di" bpmnElement="Flow_Meta_LP_Link"><di:waypoint x="1480" y="360" /><di:waypoint x="1530" y="360" /></bpmndi:BPMNEdge>

    <!-- POOL 2: GOOGLE ADS -->
    <bpmndi:BPMNShape id="Participant_GoogleAds_di" bpmnElement="Participant_GoogleAds" isHorizontal="true">
      <dc:Bounds x="160" y="660" width="1800" height="480" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Start_Google_Setup_di" bpmnElement="Start_Google_Setup">
      <dc:Bounds x="300" y="702" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="278" y="748" width="84" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Google_ContaEstrutura_di" bpmnElement="Task_Google_ContaEstrutura">
      <dc:Bounds x="370" y="680" width="160" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Start_Google_Search_di" bpmnElement="Start_Google_Search">
      <dc:Bounds x="300" y="802" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="278" y="848" width="84" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Google_Keywords_di" bpmnElement="Task_Google_Keywords">
      <dc:Bounds x="370" y="780" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Google_RSA_di" bpmnElement="Task_Google_RSA">
      <dc:Bounds x="550" y="780" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Start_Google_Display_di" bpmnElement="Start_Google_Display">
      <dc:Bounds x="300" y="942" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="278" y="988" width="84" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Google_Display_Banners_di" bpmnElement="Task_Google_Display_Banners">
      <dc:Bounds x="370" y="920" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Google_Publicar_di" bpmnElement="Task_Google_Publicar">
      <dc:Bounds x="740" y="830" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Timer_Google_Semana1_di" bpmnElement="Timer_Google_Semana1">
      <dc:Bounds x="920" y="852" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="898" y="898" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Google_Analise_Semanal_di" bpmnElement="Task_Google_Analise_Semanal">
      <dc:Bounds x="990" y="830" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_Google_CTR_di" bpmnElement="Gateway_Google_CTR" isMarkerVisible="true">
      <dc:Bounds x="1170" y="845" width="50" height="50" />
      <bpmndi:BPMNLabel><dc:Bounds x="1150" y="815" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Google_Escalar_di" bpmnElement="Task_Google_Escalar">
      <dc:Bounds x="1260" y="780" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Google_Otimizar_di" bpmnElement="Task_Google_Otimizar">
      <dc:Bounds x="1260" y="920" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Timer_Google_Mensal_di" bpmnElement="Timer_Google_Mensal">
      <dc:Bounds x="1450" y="852" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1428" y="898" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Google_Relatorio_Mensal_di" bpmnElement="Task_Google_Relatorio_Mensal">
      <dc:Bounds x="1520" y="830" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="LinkThrow_Google_LP_di" bpmnElement="LinkThrow_Google_LP">
      <dc:Bounds x="1710" y="852" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1688" y="898" width="90" height="14" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="Flow_Google_Setup_di" bpmnElement="Flow_Google_Setup"><di:waypoint x="336" y="720" /><di:waypoint x="370" y="720" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Google_Conta_di" bpmnElement="Flow_Google_Conta"><di:waypoint x="530" y="720" /><di:waypoint x="560" y="820" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Google_S1_Start_di" bpmnElement="Flow_Google_S1_Start"><di:waypoint x="336" y="820" /><di:waypoint x="370" y="820" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Google_D1_Start_di" bpmnElement="Flow_Google_D1_Start"><di:waypoint x="336" y="960" /><di:waypoint x="370" y="960" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Google_Keywords_di" bpmnElement="Flow_Google_Keywords"><di:waypoint x="510" y="820" /><di:waypoint x="550" y="820" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Google_RSA_di" bpmnElement="Flow_Google_RSA"><di:waypoint x="690" y="820" /><di:waypoint x="740" y="860" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Google_Display_Brief_di" bpmnElement="Flow_Google_Display_Brief"><di:waypoint x="510" y="960" /><di:waypoint x="740" y="880" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Google_Publicado_di" bpmnElement="Flow_Google_Publicado"><di:waypoint x="880" y="870" /><di:waypoint x="920" y="870" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Google_T7_di" bpmnElement="Flow_Google_T7"><di:waypoint x="956" y="870" /><di:waypoint x="990" y="870" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Google_Analise_di" bpmnElement="Flow_Google_Analise"><di:waypoint x="1130" y="870" /><di:waypoint x="1170" y="870" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Google_CTR_Sim_di" bpmnElement="Flow_Google_CTR_Sim"><di:waypoint x="1220" y="870" /><di:waypoint x="1260" y="820" /><bpmndi:BPMNLabel><dc:Bounds x="1231" y="835" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Google_CTR_Nao_di" bpmnElement="Flow_Google_CTR_Nao"><di:waypoint x="1220" y="870" /><di:waypoint x="1260" y="960" /><bpmndi:BPMNLabel><dc:Bounds x="1231" y="915" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Google_Loop_di" bpmnElement="Flow_Google_Loop"><di:waypoint x="1400" y="820" /><di:waypoint x="1450" y="870" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Google_Loop2_di" bpmnElement="Flow_Google_Loop2"><di:waypoint x="1400" y="960" /><di:waypoint x="1450" y="888" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Google_T30_di" bpmnElement="Flow_Google_T30"><di:waypoint x="1486" y="870" /><di:waypoint x="1520" y="870" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Google_LP_Link_di" bpmnElement="Flow_Google_LP_Link"><di:waypoint x="1660" y="870" /><di:waypoint x="1710" y="870" /></bpmndi:BPMNEdge>

    <!-- POOL 3: ROBERT -->
    <bpmndi:BPMNShape id="Participant_Robert_di" bpmnElement="Participant_Robert" isHorizontal="true">
      <dc:Bounds x="160" y="1160" width="1800" height="400" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Start_Robert_Setup_di" bpmnElement="Start_Robert_Setup">
      <dc:Bounds x="300" y="1342" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="278" y="1390" width="84" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Robert_Calendario_di" bpmnElement="Task_Robert_Calendario">
      <dc:Bounds x="370" y="1320" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Robert_Crescimento_di" bpmnElement="Task_Robert_Crescimento">
      <dc:Bounds x="550" y="1320" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Timer_Robert_Semanal_di" bpmnElement="Timer_Robert_Semanal">
      <dc:Bounds x="730" y="1342" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="708" y="1390" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Robert_Analise_di" bpmnElement="Task_Robert_Analise">
      <dc:Bounds x="800" y="1320" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_Robert_Crescimento_di" bpmnElement="Gateway_Robert_Crescimento" isMarkerVisible="true">
      <dc:Bounds x="980" y="1335" width="50" height="50" />
      <bpmndi:BPMNLabel><dc:Bounds x="960" y="1305" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Robert_Escalar_di" bpmnElement="Task_Robert_Escalar">
      <dc:Bounds x="1070" y="1240" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Robert_Otimizar_di" bpmnElement="Task_Robert_Otimizar">
      <dc:Bounds x="1070" y="1400" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Timer_Robert_Mensal_di" bpmnElement="Timer_Robert_Mensal">
      <dc:Bounds x="1260" y="1342" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1238" y="1390" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Robert_Mensal_di" bpmnElement="Task_Robert_Mensal">
      <dc:Bounds x="1330" y="1320" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_Robert_Engajou_di" bpmnElement="Gateway_Robert_Engajou" isMarkerVisible="true">
      <dc:Bounds x="1510" y="1335" width="50" height="50" />
      <bpmndi:BPMNLabel><dc:Bounds x="1490" y="1305" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="LinkThrow_Robert_LP_di" bpmnElement="LinkThrow_Robert_LP">
      <dc:Bounds x="1610" y="1342" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1588" y="1390" width="80" height="14" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="End_Robert_Organico_di" bpmnElement="End_Robert_Organico">
      <dc:Bounds x="1610" y="1410" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1588" y="1458" width="80" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="Flow_Robert_Setup_Semanal_di" bpmnElement="Flow_Robert_Setup_Semanal"><di:waypoint x="336" y="1360" /><di:waypoint x="370" y="1360" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Robert_Reels_Stories_di" bpmnElement="Flow_Robert_Reels_Stories"><di:waypoint x="510" y="1360" /><di:waypoint x="550" y="1360" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Robert_Crescimento_Ciclo_di" bpmnElement="Flow_Robert_Crescimento_Ciclo"><di:waypoint x="690" y="1360" /><di:waypoint x="730" y="1360" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Robert_Analise_di" bpmnElement="Flow_Robert_Analise"><di:waypoint x="766" y="1360" /><di:waypoint x="800" y="1360" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Robert_Gateway_di" bpmnElement="Flow_Robert_Gateway"><di:waypoint x="940" y="1360" /><di:waypoint x="980" y="1360" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Robert_Escalar_di" bpmnElement="Flow_Robert_Escalar"><di:waypoint x="1030" y="1360" /><di:waypoint x="1070" y="1280" /><bpmndi:BPMNLabel><dc:Bounds x="1040" y="1320" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Robert_Otimizar_di" bpmnElement="Flow_Robert_Otimizar"><di:waypoint x="1030" y="1360" /><di:waypoint x="1070" y="1440" /><bpmndi:BPMNLabel><dc:Bounds x="1040" y="1400" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Robert_Mensal_Timer_di" bpmnElement="Flow_Robert_Mensal_Timer"><di:waypoint x="1210" y="1280" /><di:waypoint x="1260" y="1280" /><di:waypoint x="1260" y="1360" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Robert_Mensal_Timer2_di" bpmnElement="Flow_Robert_Mensal_Timer2"><di:waypoint x="1210" y="1440" /><di:waypoint x="1260" y="1440" /><di:waypoint x="1260" y="1378" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Robert_Mensal_di" bpmnElement="Flow_Robert_Mensal"><di:waypoint x="1296" y="1360" /><di:waypoint x="1330" y="1360" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Robert_Gateway_LP_di" bpmnElement="Flow_Robert_Gateway_LP"><di:waypoint x="1470" y="1360" /><di:waypoint x="1510" y="1360" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Robert_Sim_di" bpmnElement="Flow_Robert_Sim"><di:waypoint x="1560" y="1360" /><di:waypoint x="1610" y="1360" /><bpmndi:BPMNLabel><dc:Bounds x="1571" y="1342" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Robert_Nao_di" bpmnElement="Flow_Robert_Nao"><di:waypoint x="1535" y="1385" /><di:waypoint x="1535" y="1428" /><di:waypoint x="1610" y="1428" /><bpmndi:BPMNLabel><dc:Bounds x="1540" y="1404" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>

    <!-- POOL 4: KAYNAN -->
    <bpmndi:BPMNShape id="Participant_Kaynan_di" bpmnElement="Participant_Kaynan" isHorizontal="true">
      <dc:Bounds x="160" y="1580" width="1800" height="400" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Start_Kaynan_Setup_di" bpmnElement="Start_Kaynan_Setup">
      <dc:Bounds x="300" y="1762" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="278" y="1810" width="84" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Kaynan_CriarPerfil_di" bpmnElement="Task_Kaynan_CriarPerfil">
      <dc:Bounds x="370" y="1740" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Kaynan_Calendario_di" bpmnElement="Task_Kaynan_Calendario">
      <dc:Bounds x="550" y="1740" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Kaynan_Crescimento_di" bpmnElement="Task_Kaynan_Crescimento">
      <dc:Bounds x="730" y="1740" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Timer_Kaynan_Semanal_di" bpmnElement="Timer_Kaynan_Semanal">
      <dc:Bounds x="910" y="1762" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="888" y="1810" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Kaynan_Analise_di" bpmnElement="Task_Kaynan_Analise">
      <dc:Bounds x="980" y="1740" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_Kaynan_Crescimento_di" bpmnElement="Gateway_Kaynan_Crescimento" isMarkerVisible="true">
      <dc:Bounds x="1160" y="1755" width="50" height="50" />
      <bpmndi:BPMNLabel><dc:Bounds x="1140" y="1725" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Kaynan_Escalar_di" bpmnElement="Task_Kaynan_Escalar">
      <dc:Bounds x="1250" y="1660" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Kaynan_Otimizar_di" bpmnElement="Task_Kaynan_Otimizar">
      <dc:Bounds x="1250" y="1820" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Timer_Kaynan_Mensal_di" bpmnElement="Timer_Kaynan_Mensal">
      <dc:Bounds x="1440" y="1762" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1418" y="1810" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Kaynan_Relatorio_di" bpmnElement="Task_Kaynan_Relatorio">
      <dc:Bounds x="1510" y="1740" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_Kaynan_Engajou_di" bpmnElement="Gateway_Kaynan_Engajou" isMarkerVisible="true">
      <dc:Bounds x="1690" y="1755" width="50" height="50" />
      <bpmndi:BPMNLabel><dc:Bounds x="1670" y="1725" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="LinkThrow_Kaynan_LP_di" bpmnElement="LinkThrow_Kaynan_LP">
      <dc:Bounds x="1790" y="1762" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1768" y="1810" width="80" height="14" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="End_Kaynan_Organico_di" bpmnElement="End_Kaynan_Organico">
      <dc:Bounds x="1790" y="1830" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1768" y="1878" width="80" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="Flow_Kaynan_Setup_Perfil_di" bpmnElement="Flow_Kaynan_Setup_Perfil"><di:waypoint x="336" y="1780" /><di:waypoint x="370" y="1780" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Kaynan_Perfil_Reels_di" bpmnElement="Flow_Kaynan_Perfil_Reels"><di:waypoint x="510" y="1780" /><di:waypoint x="550" y="1780" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Kaynan_Calendario_Crescimento_di" bpmnElement="Flow_Kaynan_Calendario_Crescimento"><di:waypoint x="690" y="1780" /><di:waypoint x="730" y="1780" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Kaynan_Collab_Ciclo_di" bpmnElement="Flow_Kaynan_Collab_Ciclo"><di:waypoint x="870" y="1780" /><di:waypoint x="910" y="1780" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Kaynan_Analise_di" bpmnElement="Flow_Kaynan_Analise"><di:waypoint x="946" y="1780" /><di:waypoint x="980" y="1780" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Kaynan_Gateway_Cresc_di" bpmnElement="Flow_Kaynan_Gateway_Cresc"><di:waypoint x="1120" y="1780" /><di:waypoint x="1160" y="1780" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Kaynan_Escalar_di" bpmnElement="Flow_Kaynan_Escalar"><di:waypoint x="1210" y="1780" /><di:waypoint x="1250" y="1700" /><bpmndi:BPMNLabel><dc:Bounds x="1220" y="1740" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Kaynan_Otimizar_di" bpmnElement="Flow_Kaynan_Otimizar"><di:waypoint x="1210" y="1780" /><di:waypoint x="1250" y="1860" /><bpmndi:BPMNLabel><dc:Bounds x="1220" y="1820" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Kaynan_Mensal_di" bpmnElement="Flow_Kaynan_Mensal"><di:waypoint x="1390" y="1700" /><di:waypoint x="1440" y="1700" /><di:waypoint x="1440" y="1780" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Kaynan_Mensal2_di" bpmnElement="Flow_Kaynan_Mensal2"><di:waypoint x="1390" y="1860" /><di:waypoint x="1440" y="1860" /><di:waypoint x="1440" y="1798" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Kaynan_Relatorio_di" bpmnElement="Flow_Kaynan_Relatorio"><di:waypoint x="1476" y="1780" /><di:waypoint x="1510" y="1780" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Kaynan_Gateway_LP_di" bpmnElement="Flow_Kaynan_Gateway_LP"><di:waypoint x="1650" y="1780" /><di:waypoint x="1690" y="1780" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Kaynan_Sim_di" bpmnElement="Flow_Kaynan_Sim"><di:waypoint x="1740" y="1780" /><di:waypoint x="1790" y="1780" /><bpmndi:BPMNLabel><dc:Bounds x="1751" y="1762" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Kaynan_Nao_di" bpmnElement="Flow_Kaynan_Nao"><di:waypoint x="1715" y="1805" /><di:waypoint x="1715" y="1848" /><di:waypoint x="1790" y="1848" /><bpmndi:BPMNLabel><dc:Bounds x="1720" y="1824" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>

    <!-- POOL 5: FYNESS INSTITUCIONAL -->
    <bpmndi:BPMNShape id="Participant_Institucional_di" bpmnElement="Participant_Institucional" isHorizontal="true">
      <dc:Bounds x="160" y="2000" width="1800" height="360" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Start_Inst_Setup_di" bpmnElement="Start_Inst_Setup">
      <dc:Bounds x="300" y="2162" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="278" y="2210" width="84" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Inst_Calendario_di" bpmnElement="Task_Inst_Calendario">
      <dc:Bounds x="370" y="2140" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Inst_ProvasSociais_di" bpmnElement="Task_Inst_ProvasSociais">
      <dc:Bounds x="550" y="2140" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Inst_CTA_di" bpmnElement="Task_Inst_CTA">
      <dc:Bounds x="730" y="2140" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Timer_Inst_Semanal_di" bpmnElement="Timer_Inst_Semanal">
      <dc:Bounds x="910" y="2162" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="888" y="2210" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Inst_Analise_di" bpmnElement="Task_Inst_Analise">
      <dc:Bounds x="980" y="2140" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_Inst_Conversao_di" bpmnElement="Gateway_Inst_Conversao" isMarkerVisible="true">
      <dc:Bounds x="1160" y="2155" width="50" height="50" />
      <bpmndi:BPMNLabel><dc:Bounds x="1140" y="2125" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Inst_Escalar_di" bpmnElement="Task_Inst_Escalar">
      <dc:Bounds x="1250" y="2080" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Inst_Otimizar_di" bpmnElement="Task_Inst_Otimizar">
      <dc:Bounds x="1250" y="2220" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Timer_Inst_Mensal_di" bpmnElement="Timer_Inst_Mensal">
      <dc:Bounds x="1440" y="2162" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1418" y="2210" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Inst_Relatorio_di" bpmnElement="Task_Inst_Relatorio">
      <dc:Bounds x="1510" y="2140" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="LinkThrow_Inst_LP_di" bpmnElement="LinkThrow_Inst_LP">
      <dc:Bounds x="1700" y="2162" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1678" y="2210" width="80" height="14" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="Flow_Inst_Setup_Calendario_di" bpmnElement="Flow_Inst_Setup_Calendario"><di:waypoint x="336" y="2180" /><di:waypoint x="370" y="2180" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Inst_Calendario_PS_di" bpmnElement="Flow_Inst_Calendario_PS"><di:waypoint x="510" y="2180" /><di:waypoint x="550" y="2180" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Inst_PS_CTA_di" bpmnElement="Flow_Inst_PS_CTA"><di:waypoint x="690" y="2180" /><di:waypoint x="730" y="2180" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Inst_CTA_Ciclo_di" bpmnElement="Flow_Inst_CTA_Ciclo"><di:waypoint x="870" y="2180" /><di:waypoint x="910" y="2180" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Inst_Analise_di" bpmnElement="Flow_Inst_Analise"><di:waypoint x="946" y="2180" /><di:waypoint x="980" y="2180" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Inst_Gateway_di" bpmnElement="Flow_Inst_Gateway"><di:waypoint x="1120" y="2180" /><di:waypoint x="1160" y="2180" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Inst_Escalar_di" bpmnElement="Flow_Inst_Escalar"><di:waypoint x="1210" y="2180" /><di:waypoint x="1250" y="2120" /><bpmndi:BPMNLabel><dc:Bounds x="1220" y="2150" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Inst_Otimizar_di" bpmnElement="Flow_Inst_Otimizar"><di:waypoint x="1210" y="2180" /><di:waypoint x="1250" y="2260" /><bpmndi:BPMNLabel><dc:Bounds x="1220" y="2220" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Inst_Mensal_di" bpmnElement="Flow_Inst_Mensal"><di:waypoint x="1390" y="2120" /><di:waypoint x="1440" y="2120" /><di:waypoint x="1440" y="2180" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Inst_Mensal2_di" bpmnElement="Flow_Inst_Mensal2"><di:waypoint x="1390" y="2260" /><di:waypoint x="1440" y="2260" /><di:waypoint x="1440" y="2198" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Inst_Relatorio_di" bpmnElement="Flow_Inst_Relatorio"><di:waypoint x="1476" y="2180" /><di:waypoint x="1510" y="2180" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Inst_LP_di" bpmnElement="Flow_Inst_LP"><di:waypoint x="1650" y="2180" /><di:waypoint x="1700" y="2180" /></bpmndi:BPMNEdge>

    <!-- POOL 6: LANDING PAGE -->
    <bpmndi:BPMNShape id="Participant_LP_di" bpmnElement="Participant_LP" isHorizontal="true">
      <dc:Bounds x="160" y="2380" width="1800" height="480" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Start_LP_Visitante_di" bpmnElement="Start_LP_Visitante">
      <dc:Bounds x="300" y="2542" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="278" y="2590" width="84" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_LP_CopySecoes_di" bpmnElement="Task_LP_CopySecoes">
      <dc:Bounds x="370" y="2520" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_LP_ABTests_di" bpmnElement="Task_LP_ABTests">
      <dc:Bounds x="550" y="2520" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_LP_Scroll_di" bpmnElement="Task_LP_Scroll">
      <dc:Bounds x="730" y="2520" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_LP_Clicou_di" bpmnElement="Gateway_LP_Clicou" isMarkerVisible="true">
      <dc:Bounds x="910" y="2535" width="50" height="50" />
      <bpmndi:BPMNLabel><dc:Bounds x="890" y="2505" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_LP_Formulario_di" bpmnElement="Task_LP_Formulario">
      <dc:Bounds x="1000" y="2480" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_LP_PopupSaida_di" bpmnElement="Task_LP_PopupSaida">
      <dc:Bounds x="1000" y="2600" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="LinkThrow_LP_Trial_di" bpmnElement="LinkThrow_LP_Trial">
      <dc:Bounds x="1190" y="2498" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1168" y="2544" width="80" height="14" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_LP_Popup_di" bpmnElement="Gateway_LP_Popup" isMarkerVisible="true">
      <dc:Bounds x="1190" y="2615" width="50" height="50" />
      <bpmndi:BPMNLabel><dc:Bounds x="1170" y="2585" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="LinkThrow_LP_Nutricao_di" bpmnElement="LinkThrow_LP_Nutricao">
      <dc:Bounds x="1290" y="2597" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1268" y="2643" width="80" height="14" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="End_LP_Retargeting_di" bpmnElement="End_LP_Retargeting">
      <dc:Bounds x="1290" y="2670" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1268" y="2716" width="80" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Start_LP_Monitoramento_di" bpmnElement="Start_LP_Monitoramento">
      <dc:Bounds x="300" y="2742" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="278" y="2790" width="84" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Timer_LP_Semanal_di" bpmnElement="Timer_LP_Semanal">
      <dc:Bounds x="430" y="2742" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="408" y="2790" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_LP_Analise_di" bpmnElement="Task_LP_Analise">
      <dc:Bounds x="510" y="2720" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_LP_Conversao_di" bpmnElement="Gateway_LP_Conversao" isMarkerVisible="true">
      <dc:Bounds x="690" y="2735" width="50" height="50" />
      <bpmndi:BPMNLabel><dc:Bounds x="670" y="2705" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_LP_Escalar_di" bpmnElement="Task_LP_Escalar">
      <dc:Bounds x="780" y="2680" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_LP_Otimizar_di" bpmnElement="Task_LP_Otimizar">
      <dc:Bounds x="780" y="2800" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Timer_LP_Loop_di" bpmnElement="Timer_LP_Loop">
      <dc:Bounds x="970" y="2742" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="948" y="2790" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="Flow_LP_Start_Auditoria_di" bpmnElement="Flow_LP_Start_Auditoria"><di:waypoint x="336" y="2560" /><di:waypoint x="370" y="2560" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_Auditoria_AB_di" bpmnElement="Flow_LP_Auditoria_AB"><di:waypoint x="510" y="2560" /><di:waypoint x="550" y="2560" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_AB_Visitante_di" bpmnElement="Flow_LP_AB_Visitante"><di:waypoint x="690" y="2560" /><di:waypoint x="730" y="2560" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_Scroll_di" bpmnElement="Flow_LP_Scroll"><di:waypoint x="870" y="2560" /><di:waypoint x="910" y="2560" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_Sim_di" bpmnElement="Flow_LP_Sim"><di:waypoint x="960" y="2560" /><di:waypoint x="1000" y="2520" /><bpmndi:BPMNLabel><dc:Bounds x="970" y="2540" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_Nao_di" bpmnElement="Flow_LP_Nao"><di:waypoint x="960" y="2560" /><di:waypoint x="1000" y="2640" /><bpmndi:BPMNLabel><dc:Bounds x="970" y="2600" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_Form_di" bpmnElement="Flow_LP_Form"><di:waypoint x="1140" y="2520" /><di:waypoint x="1190" y="2516" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_Popup_Gateway_di" bpmnElement="Flow_LP_Popup_Gateway"><di:waypoint x="1140" y="2640" /><di:waypoint x="1190" y="2640" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_Popup_Sim_di" bpmnElement="Flow_LP_Popup_Sim"><di:waypoint x="1240" y="2640" /><di:waypoint x="1290" y="2615" /><bpmndi:BPMNLabel><dc:Bounds x="1251" y="2623" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_Popup_Nao_di" bpmnElement="Flow_LP_Popup_Nao"><di:waypoint x="1215" y="2665" /><di:waypoint x="1215" y="2688" /><di:waypoint x="1290" y="2688" /><bpmndi:BPMNLabel><dc:Bounds x="1220" y="2677" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_Monitor_Start_di" bpmnElement="Flow_LP_Monitor_Start"><di:waypoint x="336" y="2760" /><di:waypoint x="430" y="2760" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_CRO_Ciclo_di" bpmnElement="Flow_LP_CRO_Ciclo"><di:waypoint x="1006" y="2760" /><di:waypoint x="1040" y="2760" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_Analise_di" bpmnElement="Flow_LP_Analise"><di:waypoint x="466" y="2760" /><di:waypoint x="510" y="2760" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_Gateway_CRO_di" bpmnElement="Flow_LP_Gateway_CRO"><di:waypoint x="650" y="2760" /><di:waypoint x="690" y="2760" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_Escalar_di" bpmnElement="Flow_LP_Escalar"><di:waypoint x="740" y="2760" /><di:waypoint x="780" y="2720" /><bpmndi:BPMNLabel><dc:Bounds x="750" y="2740" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_Otimizar_di" bpmnElement="Flow_LP_Otimizar"><di:waypoint x="740" y="2760" /><di:waypoint x="780" y="2840" /><bpmndi:BPMNLabel><dc:Bounds x="750" y="2800" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_CRO_Loop_di" bpmnElement="Flow_LP_CRO_Loop"><di:waypoint x="920" y="2720" /><di:waypoint x="970" y="2720" /><di:waypoint x="970" y="2760" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_LP_CRO_Loop2_di" bpmnElement="Flow_LP_CRO_Loop2"><di:waypoint x="920" y="2840" /><di:waypoint x="970" y="2840" /><di:waypoint x="970" y="2778" /></bpmndi:BPMNEdge>

    <!-- POOL 7: YOUTUBE — CANAL UNICO FYNESS -->
    <bpmndi:BPMNShape id="Participant_MultiPlat_di" bpmnElement="Participant_MultiPlat" isHorizontal="true">
      <dc:Bounds x="160" y="2880" width="1800" height="400" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Start_Multi_Setup_di" bpmnElement="Start_Multi_Setup">
      <dc:Bounds x="300" y="3062" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="278" y="3110" width="84" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Multi_Fluxo_di" bpmnElement="Task_Multi_Fluxo">
      <dc:Bounds x="370" y="3040" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Multi_Calendario_di" bpmnElement="Task_Multi_Calendario">
      <dc:Bounds x="550" y="3040" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Timer_Multi_Semanal_di" bpmnElement="Timer_Multi_Semanal">
      <dc:Bounds x="730" y="3062" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="708" y="3110" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Multi_Analise_di" bpmnElement="Task_Multi_Analise">
      <dc:Bounds x="800" y="3040" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Gateway_Multi_Crescimento_di" bpmnElement="Gateway_Multi_Crescimento" isMarkerVisible="true">
      <dc:Bounds x="980" y="3055" width="50" height="50" />
      <bpmndi:BPMNLabel><dc:Bounds x="960" y="3025" width="90" height="27" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Multi_Escalar_di" bpmnElement="Task_Multi_Escalar">
      <dc:Bounds x="1070" y="2960" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Task_Multi_Otimizar_di" bpmnElement="Task_Multi_Otimizar">
      <dc:Bounds x="1070" y="3120" width="140" height="80" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="LinkThrow_Multi_LP_di" bpmnElement="LinkThrow_Multi_LP">
      <dc:Bounds x="1260" y="3062" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="1238" y="3110" width="80" height="14" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="Flow_Multi_Setup_di" bpmnElement="Flow_Multi_Setup"><di:waypoint x="336" y="3080" /><di:waypoint x="370" y="3080" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_Fluxo_di" bpmnElement="Flow_Multi_Fluxo"><di:waypoint x="510" y="3080" /><di:waypoint x="550" y="3080" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_Ciclo_di" bpmnElement="Flow_Multi_Ciclo"><di:waypoint x="690" y="3080" /><di:waypoint x="730" y="3080" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_Analise_di" bpmnElement="Flow_Multi_Analise"><di:waypoint x="766" y="3080" /><di:waypoint x="800" y="3080" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_Gateway_di" bpmnElement="Flow_Multi_Gateway"><di:waypoint x="940" y="3080" /><di:waypoint x="980" y="3080" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_Escalar_di" bpmnElement="Flow_Multi_Escalar"><di:waypoint x="1030" y="3080" /><di:waypoint x="1070" y="3000" /><bpmndi:BPMNLabel><dc:Bounds x="1040" y="3040" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_Otimizar_di" bpmnElement="Flow_Multi_Otimizar"><di:waypoint x="1030" y="3080" /><di:waypoint x="1070" y="3160" /><bpmndi:BPMNLabel><dc:Bounds x="1040" y="3120" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_Loop_Esc_di" bpmnElement="Flow_Multi_Loop_Esc"><di:waypoint x="1140" y="2960" /><di:waypoint x="748" y="2960" /><di:waypoint x="748" y="3062" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_Loop_Oti_di" bpmnElement="Flow_Multi_Loop_Oti"><di:waypoint x="1140" y="3200" /><di:waypoint x="748" y="3200" /><di:waypoint x="748" y="3098" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Flow_Multi_LP_Link_di" bpmnElement="Flow_Multi_LP_Link"><di:waypoint x="940" y="3060" /><di:waypoint x="940" y="3030" /><di:waypoint x="1260" y="3030" /><di:waypoint x="1260" y="3062" /></bpmndi:BPMNEdge>

        </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>



</bpmn2:definitions>`;

export default MARKETING_TEMPLATE_XML;


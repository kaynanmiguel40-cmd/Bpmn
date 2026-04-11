import { readFileSync, writeFileSync } from 'fs';

const content = readFileSync('c:/Users/kayna/Bpmn/src/utils/marketingTemplate.js', 'utf8');

const startMarker = '  <!-- ============================================================ -->\n  <!-- POOL 2: GOOGLE ADS';
const endMarker   = '  <!-- ============================================================ -->\n  <!-- POOL 3: ROBERT';

const startIdx = content.indexOf(startMarker);
const endIdx   = content.indexOf(endMarker);

if (startIdx === -1 || endIdx === -1) {
  console.error('Markers not found', { startIdx, endIdx });
  process.exit(1);
}

const newGoogleAds = `  <!-- ============================================================ -->
  <!-- POOL 2: GOOGLE ADS — INTENÇÃO ALTA                           -->
  <!-- ============================================================ -->
  <bpmn2:process id="Process_GoogleAds" isExecutable="false">

    <!-- ===== CONFIGURAÇÃO INICIAL ===== -->

    <bpmn2:startEvent id="Start_Google_Setup" name="Setup Inicial da Conta Google Ads">
      <bpmn2:documentation>⚙️ SETUP INICIAL — FAZER UMA VEZ ANTES DE SUBIR QUALQUER CAMPANHA

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
      <bpmn2:documentation>🏗️ ESTRUTURA COMPLETA DA CONTA GOOGLE ADS

HIERARQUIA:
📁 CONTA: Fyness Google Ads
  └── 📁 CAMPANHA 1: Search — Intenção Alta
        └── 📂 Grupo 1: Gestão Financeira (palavras do produto)
        └── 📂 Grupo 2: Concorrência (busca por concorrentes)
        └── 📂 Grupo 3: Branded (nome Fyness)
  └── 📁 CAMPANHA 2: Display — Retargeting
        └── 📂 Grupo 1: Visitou LP (7 dias)
        └── 📂 Grupo 2: Abandonou formulário (14 dias)

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
      <bpmn2:documentation>🔍 CAMPANHA SEARCH — LEAD JÁ SABE QUE TEM UM PROBLEMA E ESTÁ BUSCANDO

Este é o tráfego mais quente que existe no digital.
O lead digitou no Google uma palavra que mostra INTENÇÃO de resolver o problema.
ORÇAMENTO: R$45/dia | LANCE: CPC manual no início → Maximizar Conversões (após 30 conversões)
OBJETIVO: Conversões (Trial Iniciado)</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Google_S1_Start</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_Google_Keywords" name="Configurar Keywords: Grupos + Match Types + Negativas">
      <bpmn2:documentation>🎯 LISTA COMPLETA DE PALAVRAS-CHAVE

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GRUPO 1: GESTÃO FINANCEIRA (principal)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Correspondência Frase] — aparece em buscas que contenham a frase:
"software gestão financeira"
"sistema financeiro empresa"
"controle financeiro empresarial"
"controle financeiro pequena empresa"
"gestão financeira para empresas"
"fluxo de caixa automatico"
"sistema de fluxo de caixa"
"como controlar financeiro da empresa"
"organizar financeiro empresa"
"substituir planilha financeira"
"gestão financeira whatsapp"
"lançamento financeiro whatsapp"
"dre automatico empresa"
"relatorio financeiro automatico"

[Correspondência Exata] — aparece SOMENTE nessa busca:
[software gestão financeira empresas]
[controle financeiro empresa pequena]
[sistema financeiro para pequenas empresas]
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
      <bpmn2:documentation>✍️ ANÚNCIOS RSA (Responsive Search Ads) — VARIAÇÕES COMPLETAS

O Google testa combinações automáticas. Fornecer o máximo de variações de qualidade.
Regra: mínimo 8–10 headlines e 3–4 descrições por anúncio.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANÚNCIO 1 — GRUPO: GESTÃO FINANCEIRA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEADLINES (máx 30 caracteres cada):
H1:  "Fyness: Gestão pelo WhatsApp"         [30 car]
H2:  "Controle Financeiro Completo"          [29 car]
H3:  "7 Dias Grátis — Sem Cartão"           [27 car]
H4:  "Sem Planilha. Sem Contador."           [28 car]
H5:  "DRE e Fluxo de Caixa Automático"      [34 car — verificar]
H6:  "Substitua Sua Planilha Hoje"           [29 car]
H7:  "Mande Áudio — Sistema Lança"          [28 car]
H8:  "Software Financeiro para Empresas"    [34 car — verificar]
H9:  "Alertas de Vencimento Automáticos"    [34 car — verificar]
H10: "Relatórios Prontos em Segundos"       [31 car — verificar]
H11: "Acesso Imediato — Cancele Quando Quiser" [40 car — verificar, pode truncar]
H12: "R$197/mês — Menos de R$7 por Dia"    [35 car — verificar]

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
      <bpmn2:documentation>🖼️ CAMPANHA DISPLAY — REMARKETING VISUAL
OBJETIVO: Conversões | ORÇAMENTO: R$10/dia
PÚBLICO: Visitou LP (últimos 14 dias) + NÃO converteu
POSICIONAMENTOS: Rede de Display Google (banners em sites parceiros)
ATIVAR QUANDO: Lista de remarketing atingir 100+ usuários (requisito mínimo Google)
FREQUÊNCIA: Máx 5x/semana por usuário</bpmn2:documentation>
      <bpmn2:outgoing>Flow_Google_D1_Start</bpmn2:outgoing>
    </bpmn2:startEvent>

    <bpmn2:task id="Task_Google_Display_Banners" name="Criar Banners Display — Todas as Variações">
      <bpmn2:documentation>🖼️ BRIEF COMPLETO — BANNERS DISPLAY GOOGLE

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
      <bpmn2:documentation>📤 PUBLICAÇÃO E CONFIGURAÇÃO DE LANCES

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
      <bpmn2:documentation>⏱️ Aguarda 7 dias após publicação.
Search precisa de dados mínimos antes de otimizar.
Não alterar lances nem pausar keywords antes de 7 dias.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Google_Publicado</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Google_T7</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>P7D</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Google_Analise_Semanal" name="Análise Semanal — Toda Terça-feira (45 min)">
      <bpmn2:documentation>📊 CHECKLIST SEMANAL — GOOGLE ADS
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
      <bpmn2:documentation>📈 CAMPANHA PERFORMANDO — COMO ESCALAR NO GOOGLE

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
      <bpmn2:documentation>🔧 CAMPANHA NÃO PERFORMANDO — ÁRVORE DE DIAGNÓSTICO COMPLETA

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
      <bpmn2:documentation>⏱️ A cada 30 dias: relatório completo + decisão de estratégia de lances.</bpmn2:documentation>
      <bpmn2:incoming>Flow_Google_Loop</bpmn2:incoming>
      <bpmn2:incoming>Flow_Google_Loop2</bpmn2:incoming>
      <bpmn2:outgoing>Flow_Google_T30</bpmn2:outgoing>
      <bpmn2:timerEventDefinition><bpmn2:timeDuration>P30D</bpmn2:timeDuration></bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_Google_Relatorio_Mensal" name="Relatório Mensal + Decisão de Estratégia de Lances">
      <bpmn2:documentation>📋 RELATÓRIO MENSAL GOOGLE ADS — Kaynan monta, apresenta para Robert

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

    <bpmn2:sequenceFlow id="Flow_Google_Setup"         sourceRef="Start_Google_Setup"           targetRef="Task_Google_ContaEstrutura" />
    <bpmn2:sequenceFlow id="Flow_Google_Conta"         sourceRef="Task_Google_ContaEstrutura"   targetRef="Task_Google_Keywords" />
    <bpmn2:sequenceFlow id="Flow_Google_S1_Start"      sourceRef="Start_Google_Search"          targetRef="Task_Google_Keywords" />
    <bpmn2:sequenceFlow id="Flow_Google_D1_Start"      sourceRef="Start_Google_Display"         targetRef="Task_Google_Display_Banners" />
    <bpmn2:sequenceFlow id="Flow_Google_Keywords"      sourceRef="Task_Google_Keywords"         targetRef="Task_Google_RSA" />
    <bpmn2:sequenceFlow id="Flow_Google_RSA"           sourceRef="Task_Google_RSA"              targetRef="Task_Google_Publicar" />
    <bpmn2:sequenceFlow id="Flow_Google_Display_Brief" sourceRef="Task_Google_Display_Banners"  targetRef="Task_Google_Publicar" />
    <bpmn2:sequenceFlow id="Flow_Google_Publicado"     sourceRef="Task_Google_Publicar"         targetRef="Timer_Google_Semana1" />
    <bpmn2:sequenceFlow id="Flow_Google_T7"            sourceRef="Timer_Google_Semana1"         targetRef="Task_Google_Analise_Semanal" />
    <bpmn2:sequenceFlow id="Flow_Google_Analise"       sourceRef="Task_Google_Analise_Semanal"  targetRef="Gateway_Google_CTR" />
    <bpmn2:sequenceFlow id="Flow_Google_CTR_Sim" name="Sim" sourceRef="Gateway_Google_CTR"     targetRef="Task_Google_Escalar" />
    <bpmn2:sequenceFlow id="Flow_Google_CTR_Nao" name="Não" sourceRef="Gateway_Google_CTR"     targetRef="Task_Google_Otimizar" />
    <bpmn2:sequenceFlow id="Flow_Google_Loop"          sourceRef="Task_Google_Escalar"          targetRef="Timer_Google_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Google_Loop2"         sourceRef="Task_Google_Otimizar"         targetRef="Timer_Google_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Google_T30"           sourceRef="Timer_Google_Mensal"          targetRef="Task_Google_Relatorio_Mensal" />
    <bpmn2:sequenceFlow id="Flow_Google_LP_Link"       sourceRef="Task_Google_Relatorio_Mensal" targetRef="LinkThrow_Google_LP" />

  </bpmn2:process>

`;

const before = content.substring(0, startIdx);
const after   = content.substring(endIdx);
const result  = before + newGoogleAds + after;

writeFileSync('c:/Users/kayna/Bpmn/src/utils/marketingTemplate.js', result, 'utf8');
console.log('Done!', result.length, 'chars,', result.split('\n').length, 'lines');

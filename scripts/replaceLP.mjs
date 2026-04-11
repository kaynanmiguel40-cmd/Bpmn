import { readFileSync, writeFileSync } from 'fs';

const filePath = 'src/utils/marketingTemplate.js';
let content = readFileSync(filePath, 'utf8');

const START_MARKER = '<!-- POOL 6:';
// End = after the </bpmn2:process> that closes Pool 6
const startIdx = content.indexOf(START_MARKER);
const endIdx   = content.indexOf('</bpmn2:process>', startIdx) + '</bpmn2:process>'.length;

if (startIdx === -1 || endIdx <= 0) {
  console.error('Markers not found!', { startIdx, endIdx });
  process.exit(1);
}

const LP_POOL = `<!-- POOL 6: LANDING PAGE — CRO E OTIMIZAÇÃO DE CONVERSÃO          -->
  <!-- ============================================================ -->
  <bpmn2:process id="Process_LP" isExecutable="false">

    <!-- ══════════════════════════════════════════════════════════════
         INÍCIO — VISITANTE CHEGA NA LP (de qualquer canal)
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:startEvent id="Start_LP_Visitante" name="Visitante Chega na LP (Qualquer Canal)">
      <bpmn2:documentation>🖥️ LANDING PAGE — CONTEXTO E OBJETIVO

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
    <bpmn2:task id="Task_LP_CopySecoes" name="Copy Otimizada por Seção — Checklist de CRO">
      <bpmn2:documentation>📝 COPY OTIMIZADA POR SEÇÃO — O QUE CADA BLOCO PRECISA ENTREGAR

A LP do Fyness já existe. Este checklist garante que cada seção está
cumprindo seu trabalho de conversão. Kauã implementa os ajustes.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 1 — HERO (acima do fold — o que é visto sem rolar)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: Em 3 segundos, o visitante decide "isso é pra mim?"
→ Resultado esperado: taxa de rejeição abaixo de 55%

ELEMENTOS OBRIGATÓRIOS:
□ Headline principal: falar do problema/dor, não do produto
□ Subheadline: especificar quem é o público ("para pequenos empresários que...")
□ CTA acima do fold: botão verde/laranja, texto de ação ("Começar grátis — 7 dias")
□ Prova de credibilidade: logo do produto + número de usuários (quando disponível)
□ Visual: screenshot do produto OU vídeo demo de 30s (autoplay mudo)

HEADLINES PARA TESTAR (A/B):
VARIAÇÃO A (atual ou base):
"Você não tem culpa de não saber para onde vai o dinheiro da sua empresa"
VARIAÇÃO B (orientada a resultado):
"Controle o financeiro da sua empresa pelo WhatsApp — sem planilha, sem app novo"
VARIAÇÃO C (dado chocante):
"80% dos empresários não sabem o lucro real do próprio negócio. Você é um deles?"
VARIAÇÃO D (direto ao produto):
"Gestão financeira empresarial em 10 segundos por dia — pelo WhatsApp"

CTA HERO — TEXTOS PARA TESTAR:
→ "Começar grátis — 7 dias" (foco no grátis)
→ "Testar o Fyness agora" (foco na ação)
→ "Ver o Fyness funcionando" (foco na curiosidade — menos comprometimento percebido)
→ "Controlar meu financeiro grátis" (foco no benefício)

SUBHEADLINE (fixar — não testar agora):
"Para pequenos empresários que querem saber onde está o dinheiro, sem complicação."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 2 — VALIDAÇÃO DA DOR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: "Isso fala de mim." Lead se sente compreendido — não julgado.
→ Resultado esperado: scroll depth acima de 45%

CHECKLIST:
□ Listar as dores específicas em primeira pessoa (formato de lista ou bullets)
□ Tom: empático, não condescendente. "Você trabalha muito e o dinheiro some."
□ Evitar jargão. Falar como o empresário fala, não como um contador.
□ Não resolver ainda — só identificar e validar.

COPY SUGERIDA (bullets de dor):
→ "Você fatura bem mas no fim do mês a conta não fecha"
→ "Você não sabe qual produto ou serviço dá mais lucro"
→ "Você depende do contador para saber se está no azul ou no vermelho"
→ "Planilha que você criou com tanto cuidado... abandonou em 2 meses"
→ "Você toma decisão financeira no feeling — e às vezes dá errado"
→ "Boleto surpreendente no fim do mês que você não esperava"

VARIAÇÃO A/B DESTA SEÇÃO:
→ A: Lista de bullets (mais rápido de ler)
→ B: Parágrafo narrativo (mais emocional, mais identificação)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 3 — AMPLIFICAÇÃO DA DOR (opcional, mas poderosa)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: Criar urgência. "Ignorar isso tem consequências reais."
→ Não exagerar. Fatos reais, não drama.

COPY SUGERIDA:
"Sem visibilidade financeira, você não está gerenciando seu negócio.
Está apostando.
Cada decisão de contratar, investir, precificar —
sem os dados certos — é um palpite.
E palpites acumulados custam mais do que qualquer ferramenta."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 4 — A SOLUÇÃO (apresentação do Fyness)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: "É simples, funciona, é pra mim."
→ Resultado esperado: scroll depth acima de 65%

CHECKLIST:
□ Apresentar o produto em 1 frase: O QUE É + PARA QUEM + RESULTADO
□ Screenshot ou GIF do produto funcionando (vale mais que qualquer copy)
□ Diferencial claro: "pelo WhatsApp — sem instalar nada novo"
□ Não listar features ainda — isso vem depois. Aqui é o conceito.

COPY DA APRESENTAÇÃO:
"O Fyness é a gestão financeira da sua empresa pelo WhatsApp.
Você manda uma mensagem. O sistema registra, categoriza e gera relatórios.
Nenhum app novo. Nenhuma planilha. Nenhum treinamento.
Só o WhatsApp que você já usa — com o controle financeiro que você sempre precisou."

VARIAÇÃO A/B:
→ A: Texto + screenshot estático do dashboard
→ B: Vídeo demo de 60s (autoplay mudo, legenda ativa)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 5 — COMO FUNCIONA (3 passos)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: Eliminar objeção "parece complicado".
→ Mostrar que é simples em 3 passos visuais.

COPY DOS 3 PASSOS:
Passo 1 — "Manda uma mensagem"
"Você vendeu, pagou uma conta, recebeu? Manda pra o Fyness no WhatsApp."
[Ícone: bolha de chat]

Passo 2 — "O Fyness processa"
"A IA do Fyness lê a mensagem, categoriza e lança no seu financeiro. Em 2 segundos."
[Ícone: engrenagem/IA]

Passo 3 — "Você enxerga tudo"
"DRE, fluxo de caixa, contas a pagar e margem por produto — no painel ou direto no chat."
[Ícone: gráfico/dashboard]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 6 — FEATURES + BENEFÍCIOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: "Leva mais do que pensei." Aumentar valor percebido.

FEATURES A DESTACAR (em ordem de impacto percebido):
1. DRE automático em tempo real (diferencial mais forte)
2. Projeção de fluxo de caixa 30 dias (previne crise antes de acontecer)
3. Alertas de vencimento (nunca mais ser pego de surpresa)
4. Análise de margem por produto (descobre o que vale manter)
5. Registro por áudio (diferencial único — sem digitar)
6. Relatório para contador (economiza horas de serviço)

FORMATO: Grid de cards (ícone + título + 1 frase)
Cada card = 1 feature + 1 benefício direto, não técnico.
ERRADO: "Módulo de DRE automatizado"
CERTO: "Sabe exatamente quanto lucrou — agora, não no fim do mês"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 7 — PROVA SOCIAL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: "Funciona pra outros. Vai funcionar pra mim."
→ Eliminar objeção de ceticismo.

FASE INICIAL (sem clientes ainda):
→ Usar depoimentos dos fundadores (ver Pilar 2 do @fynessbr)
→ Robert: "Construí o Fyness porque precisei dele. Uso todos os dias."
→ Kaynan: "Controlo o financeiro do próprio Fyness com o Fyness."
→ Tom: honesto, não exagerado. Não usar linguagem de marketing aqui.

FASE COM CLIENTES (a partir de 30 dias):
→ 3 depoimentos mínimos com: nome, setor, resultado específico.
→ Formato ideal: foto + nome + cargo/empresa + texto de 2-3 linhas
→ Resultado específico > elogio genérico.
  RUIM: "Ótimo produto, recomendo!"
  BOM: "Em 2 semanas descobri que um serviço meu estava dando prejuízo. Cortei. Aumentei o lucro em R$3.200/mês."
→ Video testimonial de 30s: o mais poderoso. 1 é suficiente por ora.

LOGOS DE CLIENTES:
→ Assim que tiver 5 clientes, adicionar logos (com permissão).
→ Mesmo que sejam negócios pequenos — presença visual de logos = prova social.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 8 — PREÇOS E PLANOS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: Ancorar o anual, minimizar fricção do preço, CTA imediato.

ESTRUTURA DE PREÇOS:
MENSAL: R$197/mês
ANUAL: R$137/mês (cobrado anualmente) ← destacar como "⭐ Mais Popular"
ECONOMIA: "Economize R$720 por ano"

COPY DE ANCORAGEM:
"Menos de R$5 por dia.
Quanto você perde sem controle financeiro?
A maioria descobre R$1.000+ por mês em otimizações no primeiro mês de uso."

GARANTIA (elemento de eliminação de risco):
□ "7 dias grátis — sem cartão de crédito"
□ "Cancele quando quiser. Sem burocracia."
□ "Se não gostar, respondemos em até 24h."
→ Garantia não é custo. É eliminador de objeção. Nunca esconder.

CTA DOS PREÇOS — TEXTOS PARA TESTAR:
→ "Começar meu trial grátis" (foco no grátis)
→ "Testar 7 dias sem cartão" (elimina fricção máxima)
→ "Quero controlar meu financeiro" (foco no benefício)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 9 — FAQ (Objeções Respondidas)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: Eliminar as últimas objeções antes da decisão final.

FAQs OBRIGATÓRIAS:
Q: "Preciso instalar algum aplicativo?"
A: "Não. O Fyness funciona direto no WhatsApp que você já tem no celular."

Q: "É seguro colocar as finanças da empresa no WhatsApp?"
A: "Os dados ficam em servidores seguros com criptografia. O WhatsApp é só o canal de entrada."

Q: "Meu contador precisa saber usar o Fyness?"
A: "Não. O Fyness gera os relatórios prontos. Você envia pro contador quando precisar."

Q: "Funciona para qualquer tipo de negócio?"
A: "Sim. Serviços, comércio, indústria — qualquer negócio que precisa controlar receitas e despesas."

Q: "E se eu não gostar nos 7 dias?"
A: "Você não paga nada. O trial é sem cartão de crédito. Sem complicação."

Q: "Quanto tempo leva para configurar?"
A: "2 minutos. Você cria a conta, conecta o WhatsApp e já pode começar a registrar."

Q: "Posso usar para mais de um negócio?"
A: "Sim. Você pode ter múltiplos negócios na mesma conta."

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SEÇÃO 10 — CTA FINAL (rodapé)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TRABALHO: Última oportunidade de converter quem chegou até aqui.
→ Quem chega ao rodapé tem alto interesse. Não deixar escapar.

COPY DO CTA FINAL:
"Você chegou até aqui. Isso diz algo.
Você sabe que precisa disso.
7 dias grátis. Sem cartão. Cancele quando quiser.
O próximo passo é simples."
[Botão: "Começar agora — é grátis"]
      </bpmn2:documentation>
      <bpmn2:incoming>Flow_LP_Start_Auditoria</bpmn2:incoming>
      <bpmn2:outgoing>Flow_LP_Auditoria_AB</bpmn2:outgoing>
    </bpmn2:task>

    <!-- ══════════════════════════════════════════════════════════════
         TASK 2 — PLANO DE A/B TESTS E POPUP DE SAÍDA
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:task id="Task_LP_ABTests" name="Plano de A/B Tests + Popup de Saída">
      <bpmn2:documentation>🧪 PLANO DE A/B TESTS — PRIORIDADE E SEQUÊNCIA

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
REGRA DE A/B TEST:
→ Testar UMA variável por vez. Nunca duas simultaneamente.
→ Mínimo de tráfego por variação: 500 visitantes únicos antes de decidir.
→ Decisão baseada em taxa de conversão, não em impressão visual.
→ Vencedor vira o novo controle. Próximo teste começa.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIORIDADE 1 — HEADLINE DO HERO (maior impacto, testar primeiro)
→ Ferramenta: Google Optimize (gratuito) ou VWO
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
      <bpmn2:documentation>📜 MONITORAMENTO DA JORNADA DE SCROLL

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
      <bpmn2:documentation>📋 FORMULÁRIO DE CAPTURA — OTIMIZAÇÃO

CAMPOS MÍNIMOS (versão A — controle):
□ Nome completo
□ Email
□ WhatsApp (com DDD)

CAMPOS VERSÃO B (só WhatsApp):
□ WhatsApp — "Começa pelo WhatsApp. Enviaremos o acesso lá."
→ Hipótese: menos atrito = mais conversão. Testar na Prioridade 5.

MICRO-COPY ABAIXO DO FORMULÁRIO (elimina ansiedade):
"✓ Sem cartão de crédito   ✓ Acesso imediato   ✓ Cancele quando quiser"

APÓS SUBMISSÃO — SEQUÊNCIA AUTOMÁTICA:
1. Redirecionar para /obrigado (não fechar — confirmar que funcionou)
2. Disparar evento "TrialIniciado" no Meta Pixel e Google Tag
3. Email de boas-vindas (em até 5 minutos):
   ASSUNTO: "Seu acesso ao Fyness está aqui 🎉"
   CORPO: "Olá [nome], bem-vindo ao Fyness!
   Aqui está como começar em 2 minutos:
   1. Acesse [link do painel]
   2. Conecte seu WhatsApp seguindo as instruções
   3. Mande sua primeira mensagem: 'Oi Fyness, estou pronto!'
   Qualquer dúvida, responde esse email ou fala no WhatsApp. — Robert e Kaynan"
4. WhatsApp de confirmação (em até 2 minutos):
   "Oi [nome]! Sou o [Robert/bot do Fyness]. Seu trial de 7 dias está ativo.
   Manda 'OI' aqui pra eu te ajudar a configurar em 2 minutos. 👋"
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
      <bpmn2:documentation>🚪 POPUP DE SAÍDA — ÚLTIMA CHANCE ANTES DE PERDER O LEAD

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
→ Entra na sequência de email de nutrição (3-5 emails em 7 dias)
→ Email 1 (imediato): PDF do lead magnet (se variação 2) ou conteúdo educativo
→ Email 2 (dia 3): Case de uso do Fyness
→ Email 3 (dia 5): Objeções respondidas + CTA para trial
→ Email 4 (dia 7): "Última chance" — urgência real (trial grátis expira? não — mas pode criar oferta especial)
→ Enquanto isso: remover do retargeting pago (não gastar dinheiro em quem já está na nutrição)
UTM de acompanhamento: utm_source=email&utm_medium=nutricao</bpmn2:documentation>
      <bpmn2:incoming>Flow_LP_Popup_Sim</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Nutricao" />
    </bpmn2:intermediateThrowEvent>

    <bpmn2:intermediateThrowEvent id="LinkThrow_LP_Retargeting" name="→ Retargeting Meta + Google">
      <bpmn2:documentation>Lead saiu sem converter e sem deixar contato.
→ Meta Pixel registrou a visita → entra automaticamente no público de retargeting do Meta Ads
→ Google Tag registrou → entra no público de Display Retargeting do Google
→ Nos próximos 7-14 dias vai ver anúncios do Fyness no Instagram e em sites
→ Segundo toque: frequência de 2-3 vezes/dia no retargeting
→ Copy do retargeting: diferente da aquisição — foca em objeção específica ou prova social</bpmn2:documentation>
      <bpmn2:incoming>Flow_LP_Popup_Nao</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Retargeting" />
    </bpmn2:intermediateThrowEvent>

    <!-- Trial iniciado → passa pro Comercial V9 -->
    <bpmn2:intermediateThrowEvent id="LinkThrow_LP_Trial" name="→ Trial 7 Dias (Comercial V9)">
      <bpmn2:documentation>Lead converteu. Trial iniciado.
→ Entra no fluxo do BPMN Comercial V9 (Trial 7 Dias + Nutrição)
→ CRM atualizado: tag [TRIAL_ATIVO], fonte rastreada por UTM
→ Meta Pixel: evento TrialIniciado disparado
→ Google Tag: conversão registrada
→ Lead removido dos públicos de retargeting (não gastar com quem já converteu)</bpmn2:documentation>
      <bpmn2:incoming>Flow_LP_Form</bpmn2:incoming>
      <bpmn2:linkEventDefinition name="Link_Trial" />
    </bpmn2:intermediateThrowEvent>

    <!-- ══════════════════════════════════════════════════════════════
         TIMER + CICLO DE CRO SEMANAL
    ══════════════════════════════════════════════════════════════ -->
    <bpmn2:intermediateCatchEvent id="Timer_LP_Semanal" name="Ciclo CRO Semanal (P7D)">
      <bpmn2:incoming>Flow_LP_CRO_Ciclo</bpmn2:incoming>
      <bpmn2:outgoing>Flow_LP_Analise</bpmn2:outgoing>
      <bpmn2:timerEventDefinition>
        <bpmn2:timeDuration>P7D</bpmn2:timeDuration>
      </bpmn2:timerEventDefinition>
    </bpmn2:intermediateCatchEvent>

    <bpmn2:task id="Task_LP_Analise" name="Análise Semanal de CRO — Métricas e Hipóteses">
      <bpmn2:documentation>📊 ANÁLISE SEMANAL CRO — TEMPLATE COMPLETO

QUANDO: Toda segunda-feira. Responsável: Kauã + Kaynan.
FERRAMENTAS: Google Analytics 4, Hotjar/Clarity, Dashboard UTMs.

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
      <bpmn2:documentation">🚀 ESCALAR — LP COM BOA CONVERSÃO

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
      <bpmn2:documentation">🔧 OTIMIZAR — LP ABAIXO DA META

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

    <!-- SEQUENCE FLOWS -->
    <bpmn2:sequenceFlow id="Flow_LP_Start_Auditoria"  sourceRef="Start_LP_Visitante"    targetRef="Task_LP_CopySecoes" />
    <bpmn2:sequenceFlow id="Flow_LP_Auditoria_AB"     sourceRef="Task_LP_CopySecoes"    targetRef="Task_LP_ABTests" />
    <bpmn2:sequenceFlow id="Flow_LP_AB_Visitante"     sourceRef="Task_LP_ABTests"       targetRef="Task_LP_Scroll" />
    <bpmn2:sequenceFlow id="Flow_LP_Scroll"           sourceRef="Task_LP_Scroll"        targetRef="Gateway_LP_Clicou" />
    <bpmn2:sequenceFlow id="Flow_LP_Sim"   name="Sim" sourceRef="Gateway_LP_Clicou"     targetRef="Task_LP_Formulario" />
    <bpmn2:sequenceFlow id="Flow_LP_Nao"   name="Não" sourceRef="Gateway_LP_Clicou"     targetRef="Task_LP_PopupSaida" />
    <bpmn2:sequenceFlow id="Flow_LP_Form"             sourceRef="Task_LP_Formulario"    targetRef="LinkThrow_LP_Trial" />
    <bpmn2:sequenceFlow id="Flow_LP_Popup_Gateway"    sourceRef="Task_LP_PopupSaida"    targetRef="Gateway_LP_Popup" />
    <bpmn2:sequenceFlow id="Flow_LP_Popup_Sim" name="Deixou contato" sourceRef="Gateway_LP_Popup" targetRef="LinkThrow_LP_Nutricao" />
    <bpmn2:sequenceFlow id="Flow_LP_Popup_Nao" name="Saiu sem deixar" sourceRef="Gateway_LP_Popup" targetRef="LinkThrow_LP_Retargeting" />
    <bpmn2:sequenceFlow id="Flow_LP_CRO_Ciclo"        sourceRef="Timer_LP_Loop"         targetRef="Timer_LP_Semanal" />
    <bpmn2:sequenceFlow id="Flow_LP_Analise"          sourceRef="Timer_LP_Semanal"      targetRef="Task_LP_Analise" />
    <bpmn2:sequenceFlow id="Flow_LP_Gateway_CRO"      sourceRef="Task_LP_Analise"       targetRef="Gateway_LP_Conversao" />
    <bpmn2:sequenceFlow id="Flow_LP_Escalar"  name="Acima de 8%"  sourceRef="Gateway_LP_Conversao" targetRef="Task_LP_Escalar" />
    <bpmn2:sequenceFlow id="Flow_LP_Otimizar" name="Abaixo de 8%" sourceRef="Gateway_LP_Conversao" targetRef="Task_LP_Otimizar" />
    <bpmn2:sequenceFlow id="Flow_LP_CRO_Loop"         sourceRef="Task_LP_Escalar"       targetRef="Timer_LP_Loop" />
    <bpmn2:sequenceFlow id="Flow_LP_CRO_Loop2"        sourceRef="Task_LP_Otimizar"      targetRef="Timer_LP_Loop" />

  </bpmn2:process>`;

const before = content.slice(0, startIdx);
const after  = content.slice(endIdx);

const newContent = before + LP_POOL + after;
writeFileSync(filePath, newContent, 'utf8');
console.log(`Done! ${newContent.length} chars, ${newContent.split('\n').length} lines`);

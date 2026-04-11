import { readFileSync, writeFileSync } from 'fs';

const f = 'c:/Users/kayna/Bpmn/src/utils/marketingTemplate.js';
let c = readFileSync(f, 'utf8');

// ===================================================================
// FIX 1: Clean Task_LP_CopySecoes — remove copy, keep CRO checklist
// ===================================================================
const copyStart = 'COPY OTIMIZADA POR SEÇÃO — O QUE CADA BLOCO PRECISA ENTREGAR';
const copyEnd = `[Botão: "Começar agora — é grátis"]`;

const si = c.indexOf(copyStart);
const ei = c.indexOf(copyEnd) + copyEnd.length;

if (si === -1 || ei === -1) { console.error('FIX 1 FAILED: markers not found'); process.exit(1); }

const newCopyDoc = `CHECKLIST CRO POR SEÇÃO — O QUE CADA BLOCO PRECISA ENTREGAR

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
□ Quem chega ao rodapé tem alto interesse — não deixar escapar`;

c = c.substring(0, si) + newCopyDoc + c.substring(ei);
console.log('FIX 1: LP copy cleaned ✓');

// Also rename the task
c = c.replace(
  'name="Copy Otimizada por Seção — Checklist de CRO"',
  'name="Checklist CRO por Seção"'
);
console.log('FIX 1b: Task renamed ✓');

// ===================================================================
// FIX 2: Remove Google Optimize reference
// ===================================================================
c = c.replace(
  '→ Ferramenta: Google Optimize (gratuito) ou VWO',
  '→ Ferramenta: VWO, Optimizely, ou A/B test nativo (React feature flag)'
);
console.log('FIX 2: Google Optimize removed ✓');

// ===================================================================
// FIX 3: Enhance Task_LP_Analise with cross-channel consolidation
// ===================================================================
c = c.replace(
  'name="Análise Semanal de CRO — Métricas e Hipóteses"',
  'name="Dashboard Cross-Channel + Análise CRO Semanal"'
);

const oldAnaliseStart = 'ANÁLISE SEMANAL CRO — TEMPLATE COMPLETO\n\nQUANDO: Toda segunda-feira. Responsável: Kauã + Kaynan.\nFERRAMENTAS: Google Analytics 4, Hotjar/Clarity, Dashboard UTMs.';

const newAnaliseStart = `DASHBOARD CROSS-CHANNEL + ANÁLISE CRO SEMANAL

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
→ Se orgânico está trazendo mais de 40% dos trials: manter tráfego pago conservador
→ Registrar decisão de realocação no Notion/planilha`;

if (!c.includes(oldAnaliseStart)) {
  console.error('FIX 3 FAILED: Analise start marker not found');
  process.exit(1);
}
c = c.replace(oldAnaliseStart, newAnaliseStart);
console.log('FIX 3: Cross-channel consolidation added ✓');

// ===================================================================
// FIX 4: Add budget phasing note in Meta Ads pool
// ===================================================================
c = c.replace(
  'TOTAL: R$135/dia | ~R$4.050/mês',
  `TOTAL: R$135/dia | ~R$4.050/mês

NOTA DE FASE:
→ Se estiver começando, NÃO ligar Meta e Google ao mesmo tempo.
→ Fase 1 (mês 1-2): Apenas Meta Ads (R$135/dia) — validar criativos e CPL
→ Fase 2 (mês 3+): Adicionar Google Ads quando Meta já estiver otimizado
→ Orgânico (Robert, Kaynan, @fynessbr) roda desde o dia 1 — custo zero
→ Só escalar quando CAC estiver abaixo do LTV do primeiro mês (R$197)`
);
console.log('FIX 4: Budget phasing note added ✓');

// ===================================================================
// FIX 5: LinkThrow to Comercial V9 — already exists, just verify
// ===================================================================
if (c.includes('LinkThrow_LP_Trial') && c.includes('Comercial V9')) {
  console.log('FIX 5: LinkThrow to Comercial V9 already exists ✓');
} else {
  console.error('FIX 5: WARNING — LinkThrow_LP_Trial or Comercial V9 reference missing');
}

// ===================================================================
// WRITE
// ===================================================================
writeFileSync(f, c, 'utf8');
console.log('\nAll fixes applied. File saved.');
console.log('Total lines:', c.split('\n').length);

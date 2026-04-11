import { readFileSync, writeFileSync } from 'fs';

const f = 'c:/Users/kayna/Bpmn/src/utils/marketingTemplate.js';
let c = readFileSync(f, 'utf8');

// ===================================================================
// FIX 1: CAC máximo — Add TextAnnotation to collaboration
// ===================================================================
const oldCollabEnd = ` </bpmn2:textAnnotation>
 </bpmn2:collaboration>`;

const newCollabEnd = ` </bpmn2:textAnnotation>
 <bpmn2:textAnnotation id="Annotation_CAC">
   <bpmn2:text>CAC MAXIMO E UNIT ECONOMICS

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
- Escalar = mais budget SO SE CAC esta saudavel</bpmn2:text>
 </bpmn2:textAnnotation>
 </bpmn2:collaboration>`;

if (!c.includes(oldCollabEnd)) { console.error('FIX 1 FAILED: collaboration end not found'); process.exit(1); }
c = c.replace(oldCollabEnd, newCollabEnd);
console.log('FIX 1: CAC máximo TextAnnotation added ✓');

// ===================================================================
// FIX 2: Reduzir frequência @fynessbr (phased)
// ===================================================================
const oldInstFreq = `CALENDARIO SEMANAL — @FYNESSBR
Frequencia: 1 post por dia no feed + 5 stories por dia
Horario de post no feed: 18h30

SEGUNDA — Produto em acao (Reel 15-30s)`;

const newInstFreq = `CALENDARIO EDITORIAL — @FYNESSBR (FASEADO)

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

SEGUNDA — Produto em acao (Reel 15-30s)`;

if (!c.includes(oldInstFreq)) { console.error('FIX 2 FAILED: inst freq not found'); process.exit(1); }
c = c.replace(oldInstFreq, newInstFreq);

// Also update the stories section to reflect phases
const oldStories = `STORIES DIARIOS (5 por dia, Kaua programa):
- 1 story com link direto para o trial (obrigatorio, todos os dias)
- 1 story com dado ou estatistica sobre financas de PMEs (2x/semana)`;

const newStories = `STORIES (frequencia por fase — ver acima):
FASE 1 (2/dia): 1 link trial (obrigatorio) + 1 variavel
FASE 2 (3/dia): 1 link trial + 1 demo + 1 variavel
FASE 3 (5/dia, Kaua programa):
- 1 story com link direto para o trial (obrigatorio, todos os dias)
- 1 story com dado ou estatistica sobre financas de PMEs (2x/semana)`;

if (!c.includes(oldStories)) { console.error('FIX 2b FAILED: stories not found'); process.exit(1); }
c = c.replace(oldStories, newStories);
console.log('FIX 2: @fynessbr frequency phased ✓');

// ===================================================================
// FIX 3: Gateway de pausa do pago quando orgânico supera
// ===================================================================
const oldAlocacao = `DECISÃO DE ALOCAÇÃO:
→ Se um canal tem CAC 2x maior que outro: reduzir budget em 30%
→ Se orgânico está trazendo mais de 40% dos trials: manter tráfego pago conservador
→ Registrar decisão de realocação no Notion/planilha`;

const newAlocacao = `DECISÃO DE ALOCAÇÃO:
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
  → Situação normal. Manter pago rodando. Orgânico cresce com o tempo.`;

if (!c.includes(oldAlocacao)) { console.error('FIX 3 FAILED: alocacao not found'); process.exit(1); }
c = c.replace(oldAlocacao, newAlocacao);
console.log('FIX 3: Gateway pausa pago added ✓');

// ===================================================================
// FIX 4: Fluxo de reativação de trial expirado
// ===================================================================
const oldTrial = `Lead converteu. Trial iniciado.
→ Entra no fluxo do BPMN Comercial V9 (Trial 7 Dias + Nutrição)
→ CRM atualizado: tag [TRIAL_ATIVO], fonte rastreada por UTM
→ Meta Pixel: evento TrialIniciado disparado
→ Google Tag: conversão registrada
→ Lead removido dos públicos de retargeting (não gastar com quem já converteu)`;

const newTrial = `Lead converteu. Trial iniciado.
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

META: Taxa de reativação de trial expirado > 15%`;

if (!c.includes(oldTrial)) { console.error('FIX 4 FAILED: trial not found'); process.exit(1); }
c = c.replace(oldTrial, newTrial);
console.log('FIX 4: Trial reactivation flow added ✓');

// ===================================================================
// FIX 5: Expandir nutrição por email (7-10 emails em 14 dias)
// ===================================================================
const oldNutricao = `Lead deixou email no popup de saída.
→ Entra na sequência de email de nutrição (3-5 emails em 7 dias)
→ Email 1 (imediato): PDF do lead magnet (se variação 2) ou conteúdo educativo
→ Email 2 (dia 3): Case de uso do Fyness
→ Email 3 (dia 5): Objeções respondidas + CTA para trial
→ Email 4 (dia 7): "Última chance" — urgência real (trial grátis expira? não — mas pode criar oferta especial)
→ Enquanto isso: remover do retargeting pago (não gastar dinheiro em quem já está na nutrição)
UTM de acompanhamento: utm_source=email&utm_medium=nutricao`;

const newNutricao = `Lead deixou email no popup de saída.
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
UTM: utm_source=email&utm_medium=nutricao&utm_content=email[N]`;

if (!c.includes(oldNutricao)) { console.error('FIX 5 FAILED: nutricao not found'); process.exit(1); }
c = c.replace(oldNutricao, newNutricao);
console.log('FIX 5: Email nurture expanded to 8 emails / 14 days ✓');

// ===================================================================
// FIX 6: Add BPMNShape for CAC annotation in diagram
// ===================================================================
const oldAnnotationShape = `    <!-- ANOTACAO: IN MARKETING -->
    <bpmndi:BPMNShape id="Annotation_InMarketing_di" bpmnElement="Annotation_InMarketing">
      <dc:Bounds x="180" y="2900" width="400" height="230" />
    </bpmndi:BPMNShape>`;

const newAnnotationShape = `    <!-- ANOTACAO: IN MARKETING -->
    <bpmndi:BPMNShape id="Annotation_InMarketing_di" bpmnElement="Annotation_InMarketing">
      <dc:Bounds x="180" y="2900" width="400" height="230" />
    </bpmndi:BPMNShape>

    <!-- ANOTACAO: CAC MAXIMO -->
    <bpmndi:BPMNShape id="Annotation_CAC_di" bpmnElement="Annotation_CAC">
      <dc:Bounds x="620" y="2900" width="400" height="250" />
    </bpmndi:BPMNShape>`;

if (!c.includes(oldAnnotationShape)) { console.error('FIX 6 FAILED: annotation shape not found'); process.exit(1); }
c = c.replace(oldAnnotationShape, newAnnotationShape);
console.log('FIX 6: CAC annotation diagram shape added ✓');

// ===================================================================
// WRITE
// ===================================================================
writeFileSync(f, c, 'utf8');
console.log('\nAll 6 fixes applied. File saved.');
console.log('Total lines:', c.split('\n').length);

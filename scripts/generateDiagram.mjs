/**
 * Generates a complete BPMNDiagram section for the marketing template.
 * Replaces only the bpmndi:BPMNDiagram block in marketingTemplate.js
 */
import { readFileSync, writeFileSync } from 'fs';

// Helper: shape for task (140x80)
const task = (id, x, y, w = 140, h = 80) =>
  `    <bpmndi:BPMNShape id="${id}_di" bpmnElement="${id}">
      <dc:Bounds x="${x}" y="${y}" width="${w}" height="${h}" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>`;

// Helper: shape for event (36x36)
const event = (id, x, y, labelX, labelY, labelW = 90, labelH = 27) =>
  `    <bpmndi:BPMNShape id="${id}_di" bpmnElement="${id}">
      <dc:Bounds x="${x}" y="${y}" width="36" height="36" />
      <bpmndi:BPMNLabel><dc:Bounds x="${labelX}" y="${labelY}" width="${labelW}" height="${labelH}" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>`;

// Helper: shape for gateway (50x50)
const gateway = (id, x, y, labelX, labelY, labelW = 90, labelH = 27) =>
  `    <bpmndi:BPMNShape id="${id}_di" bpmnElement="${id}" isMarkerVisible="true">
      <dc:Bounds x="${x}" y="${y}" width="50" height="50" />
      <bpmndi:BPMNLabel><dc:Bounds x="${labelX}" y="${labelY}" width="${labelW}" height="${labelH}" /></bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>`;

// Helper: participant pool
const pool = (id, x, y, w, h) =>
  `    <bpmndi:BPMNShape id="${id}_di" bpmnElement="${id}" isHorizontal="true">
      <dc:Bounds x="${x}" y="${y}" width="${w}" height="${h}" />
      <bpmndi:BPMNLabel />
    </bpmndi:BPMNShape>`;

// Helper: edge (simple 2-point)
const edge = (id, x1, y1, x2, y2) =>
  `    <bpmndi:BPMNEdge id="${id}_di" bpmnElement="${id}"><di:waypoint x="${x1}" y="${y1}" /><di:waypoint x="${x2}" y="${y2}" /></bpmndi:BPMNEdge>`;

// Helper: edge with label
const edgeL = (id, x1, y1, x2, y2, lx, ly, label) =>
  `    <bpmndi:BPMNEdge id="${id}_di" bpmnElement="${id}"><di:waypoint x="${x1}" y="${y1}" /><di:waypoint x="${x2}" y="${y2}" /><bpmndi:BPMNLabel><dc:Bounds x="${lx}" y="${ly}" width="${20}" height="${14}" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>`;

// Helper: edge with 3 waypoints
const edge3 = (id, x1, y1, x2, y2, x3, y3) =>
  `    <bpmndi:BPMNEdge id="${id}_di" bpmnElement="${id}"><di:waypoint x="${x1}" y="${y1}" /><di:waypoint x="${x2}" y="${y2}" /><di:waypoint x="${x3}" y="${y3}" /></bpmndi:BPMNEdge>`;

const edge3L = (id, x1, y1, x2, y2, x3, y3, lx, ly) =>
  `    <bpmndi:BPMNEdge id="${id}_di" bpmnElement="${id}"><di:waypoint x="${x1}" y="${y1}" /><di:waypoint x="${x2}" y="${y2}" /><di:waypoint x="${x3}" y="${y3}" /><bpmndi:BPMNLabel><dc:Bounds x="${lx}" y="${ly}" width="20" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>`;

// ============================================================
// LAYOUT DESIGN
// Pool x=160, elements start at x=300 (after 140px label area)
// Standard step between elements: 180px
// Task = 140x80, Event = 36x36, Gateway = 50x50
// ============================================================

// Pool 1: META ADS — y=80, height=560
// Rows: setup(y=140), top-camp(y=260), main-camp(y=360), bottom-camp(y=480)
const P1_Y = 80;
const P1_H = 560;

const metaAds = [
  '    <!-- POOL 1: META ADS -->',
  pool('Participant_MetaAds', 160, P1_Y, 1800, P1_H),

  // Setup row (cy=140)
  event('Start_Meta_Setup',          300, 122, 278, 168, 84, 27),
  task('Task_Meta_Pixel_Publicos',   370, 100, 160, 80),

  // Top campaign row (cy=260)
  event('Start_Meta_Consciencia',    300, 242, 278, 288, 84, 27),
  task('Task_Meta_Criativo_Consciencia', 370, 220),

  // Main row (cy=360)
  event('Start_Meta_Conversao',      300, 342, 278, 388, 84, 27),
  task('Task_Meta_Criativo_Conversao', 370, 320),
  task('Task_Meta_Publicar',         560, 320),   // merge point
  event('Timer_Meta_Semana1',        740, 342, 718, 388, 90, 27),
  task('Task_Meta_Analise_Semanal',  810, 320),
  gateway('Gateway_Meta_CPL',        990, 335, 970, 305, 90, 27),
  task('Task_Meta_Escalar',          1080, 270),   // upper gateway branch
  task('Task_Meta_Otimizar_Criativo',1080, 400),   // lower gateway branch
  event('Timer_Meta_Mensal',         1270, 342, 1248, 388, 90, 27),
  task('Task_Meta_Relatorio_Mensal', 1340, 320),
  event('LinkThrow_Meta_LP',         1530, 342, 1508, 388, 90, 14),

  // Bottom campaign row (cy=480)
  event('Start_Meta_Retargeting',    300, 462, 278, 508, 84, 27),
  task('Task_Meta_Criativo_Retargeting', 370, 440),

  // Edges
  edge('Flow_Meta_Setup',             336, 140, 370, 140),
  edge('Flow_Meta_Publicos',          530, 140, 560, 360),  // setup -> criativo_conv (simplified: pixel goes to main row)

  // Campaigns to publicar
  edge('Flow_Meta_C1_Start',          336, 260, 370, 260),
  edge('Flow_Meta_C2_Start',          336, 360, 370, 360),
  edge('Flow_Meta_C3_Start',          336, 480, 370, 480),
  edge('Flow_Meta_C1_Criativo',       510, 260, 560, 340),  // top row converges down to publicar
  edge('Flow_Meta_C2_Criativo',       510, 360, 560, 360),
  edge('Flow_Meta_C3_Criativo',       510, 480, 560, 380),  // bottom row converges up to publicar

  edge('Flow_Meta_Publicado',         700, 360, 740, 360),
  edge('Flow_Meta_T7',                776, 360, 810, 360),
  edge('Flow_Meta_Analise',           950, 360, 990, 360),

  edgeL('Flow_Meta_CPL_Sim',         1040, 360, 1080, 300, 1051, 320, 'Sim'),
  edgeL('Flow_Meta_CPL_Nao',         1040, 360, 1080, 440, 1051, 400, 'Nao'),

  edge('Flow_Meta_Loop',             1220, 310, 1270, 360),   // escalar -> timer_mensal
  edge('Flow_Meta_Loop2',            1220, 440, 1270, 378),   // otimizar -> timer_mensal

  edge('Flow_Meta_T30',              1306, 360, 1340, 360),
  edge('Flow_Meta_LP_Link',          1480, 360, 1530, 360),
].join('\n');

// Pool 2: GOOGLE ADS — y=660, height=480
const P2_Y = 660;
const P2_H = 480;

const googleAds = [
  '    <!-- POOL 2: GOOGLE ADS -->',
  pool('Participant_GoogleAds', 160, P2_Y, 1800, P2_H),

  // Setup row (cy=720)
  event('Start_Google_Setup',        300, 702, 278, 748, 84, 27),
  task('Task_Google_ContaEstrutura', 370, 680, 160, 80),

  // Search row (cy=820)
  event('Start_Google_Search',       300, 802, 278, 848, 84, 27),
  task('Task_Google_Keywords',       370, 780),
  task('Task_Google_RSA',            550, 780),

  // Display row (cy=960)
  event('Start_Google_Display',      300, 942, 278, 988, 84, 27),
  task('Task_Google_Display_Banners',370, 920),

  // Merge + main flow (cy=870)
  task('Task_Google_Publicar',       740, 830),   // merge: RSA + Display_Banners
  event('Timer_Google_Semana1',      920, 852, 898, 898, 90, 27),
  task('Task_Google_Analise_Semanal',990, 830),
  gateway('Gateway_Google_CTR',      1170, 845, 1150, 815, 90, 27),
  task('Task_Google_Escalar',        1260, 780),
  task('Task_Google_Otimizar',       1260, 920),
  event('Timer_Google_Mensal',       1450, 852, 1428, 898, 90, 27),
  task('Task_Google_Relatorio_Mensal',1520, 830),
  event('LinkThrow_Google_LP',       1710, 852, 1688, 898, 90, 14),

  // Edges
  edge('Flow_Google_Setup',          336, 720, 370, 720),
  edge('Flow_Google_Conta',          530, 720, 560, 820),  // setup -> keywords

  edge('Flow_Google_S1_Start',       336, 820, 370, 820),
  edge('Flow_Google_D1_Start',       336, 960, 370, 960),

  edge('Flow_Google_Keywords',       510, 820, 550, 820),
  edge('Flow_Google_RSA',            690, 820, 740, 860),  // RSA converges to publicar
  edge('Flow_Google_Display_Brief',  510, 960, 740, 880),  // display converges to publicar

  edge('Flow_Google_Publicado',      880, 870, 920, 870),
  edge('Flow_Google_T7',             956, 870, 990, 870),
  edge('Flow_Google_Analise',        1130, 870, 1170, 870),

  edgeL('Flow_Google_CTR_Sim',       1220, 870, 1260, 820, 1231, 835, 'Sim'),
  edgeL('Flow_Google_CTR_Nao',       1220, 870, 1260, 960, 1231, 915, 'Nao'),

  edge('Flow_Google_Loop',           1400, 820, 1450, 870),
  edge('Flow_Google_Loop2',          1400, 960, 1450, 888),

  edge('Flow_Google_T30',            1486, 870, 1520, 870),
  edge('Flow_Google_LP_Link',        1660, 870, 1710, 870),
].join('\n');

// Pool 3: ROBERT — y=1160, height=400
const P3_Y = 1160;
const P3_H = 400;
const P3_CY = P3_Y + 200;  // 1360

const robert = [
  '    <!-- POOL 3: ROBERT -->',
  pool('Participant_Robert', 160, P3_Y, 1800, P3_H),

  event('Start_Robert_Setup',        300, P3_CY - 18, 278, P3_CY + 30, 84, 27),
  task('Task_Robert_Calendario',     370, P3_CY - 40),
  task('Task_Robert_Crescimento',    550, P3_CY - 40),
  event('Timer_Robert_Semanal',      730, P3_CY - 18, 708, P3_CY + 30, 90, 27),
  task('Task_Robert_Analise',        800, P3_CY - 40),
  gateway('Gateway_Robert_Crescimento', 980, P3_CY - 25, 960, P3_CY - 55, 90, 27),
  task('Task_Robert_Escalar',        1070, P3_CY - 120),   // upper branch
  task('Task_Robert_Otimizar',       1070, P3_CY + 40),    // lower branch
  event('Timer_Robert_Mensal',       1260, P3_CY - 18, 1238, P3_CY + 30, 90, 27),
  task('Task_Robert_Mensal',         1330, P3_CY - 40),
  gateway('Gateway_Robert_Engajou',  1510, P3_CY - 25, 1490, P3_CY - 55, 90, 27),
  event('LinkThrow_Robert_LP',       1610, P3_CY - 18, 1588, P3_CY + 30, 80, 14),
  event('End_Robert_Organico',       1610, P3_CY + 50, 1588, P3_CY + 98, 80, 27),

  // Edges
  edge('Flow_Robert_Setup_Semanal',  336, P3_CY, 370, P3_CY),
  edge('Flow_Robert_Reels_Stories',  510, P3_CY, 550, P3_CY),
  edge('Flow_Robert_Crescimento_Ciclo', 690, P3_CY, 730, P3_CY),
  edge('Flow_Robert_Analise',        766, P3_CY, 800, P3_CY),
  edge('Flow_Robert_Gateway',        940, P3_CY, 980, P3_CY),

  edgeL('Flow_Robert_Escalar',       1030, P3_CY, 1070, P3_CY-80, 1040, P3_CY-40, 'Sim'),
  edgeL('Flow_Robert_Otimizar',      1030, P3_CY, 1070, P3_CY+80, 1040, P3_CY+40, 'Nao'),

  edge3('Flow_Robert_Mensal_Timer',  1210, P3_CY-80, 1260, P3_CY-80, 1260, P3_CY),
  edge3('Flow_Robert_Mensal_Timer2', 1210, P3_CY+80, 1260, P3_CY+80, 1260, P3_CY+18),

  edge('Flow_Robert_Mensal',         1296, P3_CY, 1330, P3_CY),
  edge('Flow_Robert_Gateway_LP',     1470, P3_CY, 1510, P3_CY),

  edgeL('Flow_Robert_Sim',           1560, P3_CY, 1610, P3_CY, 1571, P3_CY - 18, 'Sim'),
  edge3L('Flow_Robert_Nao',          1535, P3_CY+25, 1535, P3_CY+68, 1610, P3_CY+68, 1540, P3_CY+44),
].join('\n');

// Pool 4: KAYNAN — y=1580, height=400
const P4_Y = 1580;
const P4_H = 400;
const P4_CY = P4_Y + 200;  // 1780

const kaynan = [
  '    <!-- POOL 4: KAYNAN -->',
  pool('Participant_Kaynan', 160, P4_Y, 1800, P4_H),

  event('Start_Kaynan_Setup',        300, P4_CY - 18, 278, P4_CY + 30, 84, 27),
  task('Task_Kaynan_CriarPerfil',    370, P4_CY - 40),
  task('Task_Kaynan_Calendario',     550, P4_CY - 40),
  task('Task_Kaynan_Crescimento',    730, P4_CY - 40),
  event('Timer_Kaynan_Semanal',      910, P4_CY - 18, 888, P4_CY + 30, 90, 27),
  task('Task_Kaynan_Analise',        980, P4_CY - 40),
  gateway('Gateway_Kaynan_Crescimento', 1160, P4_CY - 25, 1140, P4_CY - 55, 90, 27),
  task('Task_Kaynan_Escalar',        1250, P4_CY - 120),
  task('Task_Kaynan_Otimizar',       1250, P4_CY + 40),
  event('Timer_Kaynan_Mensal',       1440, P4_CY - 18, 1418, P4_CY + 30, 90, 27),
  task('Task_Kaynan_Relatorio',      1510, P4_CY - 40),
  gateway('Gateway_Kaynan_Engajou',  1690, P4_CY - 25, 1670, P4_CY - 55, 90, 27),
  event('LinkThrow_Kaynan_LP',       1790, P4_CY - 18, 1768, P4_CY + 30, 80, 14),
  event('End_Kaynan_Organico',       1790, P4_CY + 50, 1768, P4_CY + 98, 80, 27),

  // Edges
  edge('Flow_Kaynan_Setup_Perfil',   336, P4_CY, 370, P4_CY),
  edge('Flow_Kaynan_Perfil_Reels',   510, P4_CY, 550, P4_CY),
  edge('Flow_Kaynan_Calendario_Crescimento', 690, P4_CY, 730, P4_CY),
  edge('Flow_Kaynan_Collab_Ciclo',   870, P4_CY, 910, P4_CY),
  edge('Flow_Kaynan_Analise',        946, P4_CY, 980, P4_CY),
  edge('Flow_Kaynan_Gateway_Cresc',  1120, P4_CY, 1160, P4_CY),

  edgeL('Flow_Kaynan_Escalar',       1210, P4_CY, 1250, P4_CY-80, 1220, P4_CY-40, 'Sim'),
  edgeL('Flow_Kaynan_Otimizar',      1210, P4_CY, 1250, P4_CY+80, 1220, P4_CY+40, 'Nao'),

  edge3('Flow_Kaynan_Mensal',        1390, P4_CY-80, 1440, P4_CY-80, 1440, P4_CY),
  edge3('Flow_Kaynan_Mensal2',       1390, P4_CY+80, 1440, P4_CY+80, 1440, P4_CY+18),

  edge('Flow_Kaynan_Relatorio',      1476, P4_CY, 1510, P4_CY),
  edge('Flow_Kaynan_Gateway_LP',     1650, P4_CY, 1690, P4_CY),

  edgeL('Flow_Kaynan_Sim',           1740, P4_CY, 1790, P4_CY, 1751, P4_CY - 18, 'Sim'),
  edge3L('Flow_Kaynan_Nao',          1715, P4_CY+25, 1715, P4_CY+68, 1790, P4_CY+68, 1720, P4_CY+44),
].join('\n');

// Pool 5: FYNESS INSTITUCIONAL — y=2000, height=360
const P5_Y = 2000;
const P5_H = 360;
const P5_CY = P5_Y + 180;  // 2180

const institucional = [
  '    <!-- POOL 5: FYNESS INSTITUCIONAL -->',
  pool('Participant_Institucional', 160, P5_Y, 1800, P5_H),

  event('Start_Inst_Setup',          300, P5_CY - 18, 278, P5_CY + 30, 84, 27),
  task('Task_Inst_Calendario',       370, P5_CY - 40),
  task('Task_Inst_ProvasSociais',    550, P5_CY - 40),
  task('Task_Inst_CTA',              730, P5_CY - 40),
  event('Timer_Inst_Semanal',        910, P5_CY - 18, 888, P5_CY + 30, 90, 27),
  task('Task_Inst_Analise',          980, P5_CY - 40),
  gateway('Gateway_Inst_Conversao',  1160, P5_CY - 25, 1140, P5_CY - 55, 90, 27),
  task('Task_Inst_Escalar',          1250, P5_CY - 100),
  task('Task_Inst_Otimizar',         1250, P5_CY + 40),
  event('Timer_Inst_Mensal',         1440, P5_CY - 18, 1418, P5_CY + 30, 90, 27),
  task('Task_Inst_Relatorio',        1510, P5_CY - 40),
  event('LinkThrow_Inst_LP',         1700, P5_CY - 18, 1678, P5_CY + 30, 80, 14),

  // Edges
  edge('Flow_Inst_Setup_Calendario', 336, P5_CY, 370, P5_CY),
  edge('Flow_Inst_Calendario_PS',    510, P5_CY, 550, P5_CY),
  edge('Flow_Inst_PS_CTA',           690, P5_CY, 730, P5_CY),
  edge('Flow_Inst_CTA_Ciclo',        870, P5_CY, 910, P5_CY),
  edge('Flow_Inst_Analise',          946, P5_CY, 980, P5_CY),
  edge('Flow_Inst_Gateway',          1120, P5_CY, 1160, P5_CY),

  edgeL('Flow_Inst_Escalar',         1210, P5_CY, 1250, P5_CY-60, 1220, P5_CY-30, 'Sim'),
  edgeL('Flow_Inst_Otimizar',        1210, P5_CY, 1250, P5_CY+80, 1220, P5_CY+40, 'Nao'),

  edge3('Flow_Inst_Mensal',          1390, P5_CY-60, 1440, P5_CY-60, 1440, P5_CY),
  edge3('Flow_Inst_Mensal2',         1390, P5_CY+80, 1440, P5_CY+80, 1440, P5_CY+18),

  edge('Flow_Inst_Relatorio',        1476, P5_CY, 1510, P5_CY),
  edge('Flow_Inst_LP',               1650, P5_CY, 1700, P5_CY),
].join('\n');

// Pool 6: LANDING PAGE — y=2380, height=480
const P6_Y = 2380;
const P6_H = 480;
const P6_CY = P6_Y + 180;  // 2560 (visitor journey row)
const P6_CRO = P6_Y + 380; // 2760 (CRO monitoring row)

const lp = [
  '    <!-- POOL 6: LANDING PAGE -->',
  pool('Participant_LP', 160, P6_Y, 1800, P6_H),

  // Visitor journey row
  event('Start_LP_Visitante',        300, P6_CY - 18, 278, P6_CY + 30, 84, 27),
  task('Task_LP_CopySecoes',         370, P6_CY - 40),
  task('Task_LP_ABTests',            550, P6_CY - 40),
  task('Task_LP_Scroll',             730, P6_CY - 40),
  gateway('Gateway_LP_Clicou',       910, P6_CY - 25, 890, P6_CY - 55, 90, 27),
  task('Task_LP_Formulario',         1000, P6_CY - 80),    // clicked: upper
  task('Task_LP_PopupSaida',         1000, P6_CY + 40),    // not clicked: lower
  event('LinkThrow_LP_Trial',        1190, P6_CY - 62, 1168, P6_CY - 16, 80, 14),
  gateway('Gateway_LP_Popup',        1190, P6_CY + 55, 1170, P6_CY + 25, 90, 27),
  event('LinkThrow_LP_Nutricao',     1290, P6_CY + 37, 1268, P6_CY + 83, 80, 14),
  event('End_LP_Retargeting',        1290, P6_CY + 110, 1268, P6_CY + 156, 80, 27),

  // CRO monitoring row
  event('Start_LP_Monitoramento',    300, P6_CRO - 18, 278, P6_CRO + 30, 84, 27),
  event('Timer_LP_Semanal',          430, P6_CRO - 18, 408, P6_CRO + 30, 90, 27),
  task('Task_LP_Analise',            510, P6_CRO - 40),
  gateway('Gateway_LP_Conversao',    690, P6_CRO - 25, 670, P6_CRO - 55, 90, 27),
  task('Task_LP_Escalar',            780, P6_CRO - 80),
  task('Task_LP_Otimizar',           780, P6_CRO + 40),
  event('Timer_LP_Loop',             970, P6_CRO - 18, 948, P6_CRO + 30, 90, 27),

  // Visitor journey edges
  edge('Flow_LP_Start_Auditoria',    336, P6_CY, 370, P6_CY),
  edge('Flow_LP_Auditoria_AB',       510, P6_CY, 550, P6_CY),
  edge('Flow_LP_AB_Visitante',       690, P6_CY, 730, P6_CY),
  edge('Flow_LP_Scroll',             870, P6_CY, 910, P6_CY),

  edgeL('Flow_LP_Sim',               960, P6_CY, 1000, P6_CY-40, 970, P6_CY-20, 'Sim'),
  edgeL('Flow_LP_Nao',               960, P6_CY, 1000, P6_CY+80, 970, P6_CY+40, 'Nao'),

  edge('Flow_LP_Form',               1140, P6_CY-40, 1190, P6_CY-44),
  edge('Flow_LP_Popup_Gateway',      1140, P6_CY+80, 1190, P6_CY+80),

  edgeL('Flow_LP_Popup_Sim',         1240, P6_CY+80, 1290, P6_CY+55, 1251, P6_CY+63, 'Sim'),
  edge3L('Flow_LP_Popup_Nao',        1215, P6_CY+105, 1215, P6_CY+128, 1290, P6_CY+128, 1220, P6_CY+117),

  // CRO monitoring edges
  edge('Flow_LP_Monitor_Start',      336, P6_CRO, 430, P6_CRO),
  edge('Flow_LP_CRO_Ciclo',          1006, P6_CRO, 1040, P6_CRO),  // timer_loop -> timer_semanal (loop back)
  edge('Flow_LP_Analise',            466, P6_CRO, 510, P6_CRO),
  edge('Flow_LP_Gateway_CRO',        650, P6_CRO, 690, P6_CRO),

  edgeL('Flow_LP_Escalar',           740, P6_CRO, 780, P6_CRO-40, 750, P6_CRO-20, 'Sim'),
  edgeL('Flow_LP_Otimizar',          740, P6_CRO, 780, P6_CRO+80, 750, P6_CRO+40, 'Nao'),

  edge3('Flow_LP_CRO_Loop',          920, P6_CRO-40, 970, P6_CRO-40, 970, P6_CRO),
  edge3('Flow_LP_CRO_Loop2',         920, P6_CRO+80, 970, P6_CRO+80, 970, P6_CRO+18),
].join('\n');

// ============================================================
// Fix CRO loop: Timer_LP_Loop -> Timer_LP_Semanal should loop back left
// The loop goes right -> loop back to semanal
// Actually Flow_LP_CRO_Ciclo: Timer_LP_Loop -> Timer_LP_Semanal  (loop back)
// Timer_LP_Loop is at x=970, Timer_LP_Semanal is at x=430
// Need 4-waypoint edge to loop back
// ============================================================

// Assemble the full diagram
const diagram = `  <!-- ============================================================ -->
  <!-- DIAGRAMA VISUAL — LAYOUT COMPLETO -->
  <!-- ============================================================ -->
  <bpmndi:BPMNDiagram id="BPMNDiagram_Marketing">
    <bpmndi:BPMNPlane id="BPMNPlane_Marketing" bpmnElement="Collaboration_Marketing">

${metaAds}

${googleAds}

${robert}

${kaynan}

${institucional}

${lp}

    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>`;

// Read the file
const filePath = 'c:/Users/kayna/Bpmn/src/utils/marketingTemplate.js';
let content = readFileSync(filePath, 'utf8');

// Find and replace the BPMNDiagram section
const diagStart = content.indexOf('  <!-- ============================================================ -->\n  <!-- DIAGRAMA VISUAL');
const diagEnd = content.indexOf('</bpmndi:BPMNDiagram>') + '</bpmndi:BPMNDiagram>'.length;

if (diagStart === -1) {
  // Try alternative start marker
  const altStart = content.indexOf('<bpmndi:BPMNDiagram');
  if (altStart === -1) {
    console.error('Could not find BPMNDiagram section!');
    process.exit(1);
  }
  content = content.slice(0, altStart) + diagram + '\n\n' + content.slice(diagEnd);
} else {
  content = content.slice(0, diagStart) + diagram + '\n\n' + content.slice(diagEnd);
}

writeFileSync(filePath, content, 'utf8');
console.log('BPMNDiagram section replaced successfully!');

// Count shapes in new diagram
const shapeCount = (diagram.match(/BPMNShape/g) || []).length / 2;
const edgeCount = (diagram.match(/BPMNEdge/g) || []).length / 2;
console.log(`Shapes: ${shapeCount}, Edges: ${edgeCount}`);

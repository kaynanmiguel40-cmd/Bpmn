import { jsPDF } from 'jspdf';
import {
  calcKPIs,
  filterByPeriod,
  formatCurrency,
  formatLateTime,
  calcOSHours,
  calcEstimatedHours,
  calcDeliveryDays,
  calcDelayDays,
  getMemberHourlyRate,
  calcOSCost,
} from './kpiUtils';
import { LOGO_BASE64 } from './logoData';

// ─── Constantes de Layout ────────────────────────────────────────

const PAGE_W = 210;
const PAGE_H = 297;
const MARGIN = 20;
const CONTENT_W = PAGE_W - MARGIN * 2;

const COLORS = {
  primary: [59, 130, 246],    // blue-500
  primaryDark: [37, 99, 235], // blue-600
  dark: [30, 41, 59],         // slate-800
  medium: [100, 116, 139],    // slate-500
  light: [241, 245, 249],     // slate-100
  white: [255, 255, 255],
  green: [34, 197, 94],       // green-500
  red: [239, 68, 68],         // red-500
  amber: [245, 158, 11],      // amber-500
};

// ─── Helpers de Desenho ──────────────────────────────────────────

function setColor(doc, color) {
  doc.setTextColor(...color);
}

function addPageHeader(doc, title) {
  // Barra azul no topo
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE_W, 18, 'F');

  // Logo no header
  try {
    doc.addImage(LOGO_BASE64, 'PNG', MARGIN, 2.5, 13, 13);
  } catch (_) {
    // fallback se logo falhar
  }

  // Titulo da pagina
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.white);
  doc.text(title, MARGIN + 16, 11.5);

  // Fyness marca
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Fyness OS', PAGE_W - MARGIN, 11.5, { align: 'right' });
}

function addFooter(doc, currentPage, totalPages) {
  // Linha separadora
  doc.setDrawColor(...COLORS.light);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, PAGE_H - 16, PAGE_W - MARGIN, PAGE_H - 16);

  doc.setFontSize(7);
  setColor(doc, COLORS.medium);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Fyness OS · Relatorio gerado em ${formatDateBR(new Date().toISOString())} · Pagina ${currentPage} de ${totalPages}`,
    PAGE_W / 2, PAGE_H - 10, { align: 'center' }
  );
}

function drawTable(doc, startY, headers, rows, colWidths) {
  const rowHeight = 8;
  const headerHeight = 10;
  let y = startY;

  // Header
  doc.setFillColor(...COLORS.primary);
  doc.rect(MARGIN, y, CONTENT_W, headerHeight, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.white);

  let x = MARGIN + 4;
  headers.forEach((h, i) => {
    doc.text(h, x, y + 7);
    x += colWidths[i];
  });
  y += headerHeight;

  // Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  rows.forEach((row, rowIdx) => {
    if (y + rowHeight > PAGE_H - 25) return;

    if (rowIdx % 2 === 0) {
      doc.setFillColor(...COLORS.light);
      doc.rect(MARGIN, y, CONTENT_W, rowHeight, 'F');
    }

    setColor(doc, COLORS.dark);
    x = MARGIN + 4;
    row.forEach((cell, i) => {
      doc.text(String(cell), x, y + 6);
      x += colWidths[i];
    });
    y += rowHeight;
  });

  return y + 4;
}

function drawKPITable(doc, startY, items) {
  const colWidths = [CONTENT_W * 0.65, CONTENT_W * 0.35];
  const headers = ['Indicador', 'Valor'];
  const rows = items.map(item => [item.label, item.value]);
  return drawTable(doc, startY, headers, rows, colWidths);
}

function drawSectionTitle(doc, y, title) {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.dark);
  doc.text(title, MARGIN, y);
  // Underline azul
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, y + 2, MARGIN + doc.getTextWidth(title), y + 2);
  return y + 12;
}

function drawProgressBar(doc, y, label, pct, color) {
  doc.setFontSize(10);
  setColor(doc, COLORS.dark);
  doc.setFont('helvetica', 'normal');
  doc.text(label, MARGIN, y);
  y += 4;

  const barH = 8;
  const val = parseFloat(pct) || 0;

  doc.setFillColor(...COLORS.light);
  doc.roundedRect(MARGIN, y, CONTENT_W, barH, 2, 2, 'F');
  if (val > 0) {
    doc.setFillColor(...color);
    const barW = Math.min(CONTENT_W * (val / 100), CONTENT_W);
    doc.roundedRect(MARGIN, y, barW, barH, 2, 2, 'F');
  }
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  setColor(doc, val > 50 ? COLORS.white : COLORS.dark);
  doc.text(`${pct}%`, MARGIN + 4, y + 6);

  return y + barH + 8;
}

// ─── Formatador de Data BR ───────────────────────────────────────

function formatDateBR(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function getMonthName(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

// ─── Gerador Principal (relatorio unico) ──────────────────────────

export function generateReport({ orders, events, members, startDate, endDate, filterMember, targetHours }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const isTeam = !filterMember || filterMember === 'all';
  const memberLabel = isTeam ? 'Toda a Equipe' : filterMember;

  buildReportPages(doc, { orders, events, members, startDate, endDate, filterMember, targetHours }, true);

  const fileName = `Relatorio_Fyness_${memberLabel.replace(/\s+/g, '_')}_${formatDateBR(startDate).replace(/\//g, '-')}_a_${formatDateBR(endDate).replace(/\//g, '-')}.pdf`;
  doc.save(fileName);

  return { fileName };
}

// ─── Gerar Todos (1 individual por membro + 1 equipe) ─────────────

export function generateAllReports({ orders, events, members, startDate, endDate, targetHours }) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let isFirstSection = true;

  // 1) Relatorio da equipe
  buildReportPages(doc, {
    orders, events, members, startDate, endDate,
    filterMember: 'all', targetHours,
  }, isFirstSection);
  isFirstSection = false;

  // 2) Relatorio individual por membro
  for (const member of members) {
    buildReportPages(doc, {
      orders, events, members, startDate, endDate,
      filterMember: member.name, targetHours,
    }, isFirstSection);
    isFirstSection = false;
  }

  const fileName = `Relatorios_Fyness_Completo_${formatDateBR(startDate).replace(/\//g, '-')}_a_${formatDateBR(endDate).replace(/\//g, '-')}.pdf`;
  doc.save(fileName);

  return { fileName, count: members.length + 1 };
}

// ─── Builder de Paginas (reutilizado por ambos geradores) ────────

function buildReportPages(doc, { orders, events, members, startDate, endDate, filterMember, targetHours }, isFirst) {
  const { filteredOrders, filteredEvents } = filterByPeriod(orders, events, startDate, endDate);

  let reportOrders = filteredOrders;
  let reportEvents = filteredEvents;

  const isTeam = !filterMember || filterMember === 'all';
  const memberLabel = isTeam ? 'Toda a Equipe' : filterMember;

  if (!isTeam) {
    const memberName = filterMember.toLowerCase().trim();
    reportOrders = filteredOrders.filter(o =>
      (o.assignee || '').toLowerCase().trim() === memberName
    );
    reportEvents = filteredEvents.filter(e =>
      (e.assignee || '').toLowerCase().trim() === memberName
    );
  }

  const kpis = calcKPIs(reportOrders, reportEvents, targetHours || 176);

  // Custos
  const done = reportOrders.filter(o => o.status === 'done');
  let totalLaborCost = 0;
  let totalMaterialCost = 0;
  const costByMember = {};

  done.forEach(o => {
    const cost = calcOSCost(o, members);
    totalLaborCost += cost.laborCost;
    totalMaterialCost += cost.materialCost;
    const name = o.assignee || 'Sem responsavel';
    if (!costByMember[name]) costByMember[name] = { labor: 0, material: 0, count: 0 };
    costByMember[name].labor += cost.laborCost;
    costByMember[name].material += cost.materialCost;
    costByMember[name].count++;
  });

  const totalCost = totalLaborCost + totalMaterialCost;
  const avgCostPerOS = done.length > 0 ? totalCost / done.length : 0;
  const memberRanking = isTeam ? buildMemberRanking(reportOrders, members) : [];
  const totalPages = isTeam ? 5 : 4;

  // PAGINA 1 — CAPA
  if (!isFirst) doc.addPage();
  drawCoverPage(doc, startDate, endDate, memberLabel, totalPages);

  // PAGINA 2 — INDICADORES
  doc.addPage();
  drawIndicatorsPage(doc, kpis, memberLabel, totalPages);

  // PAGINA 3 — REUNIOES
  doc.addPage();
  drawMeetingsPage(doc, kpis, memberLabel, totalPages);

  // PAGINA 4 — CUSTOS
  doc.addPage();
  drawCostsPage(doc, {
    totalCost, totalLaborCost, totalMaterialCost, avgCostPerOS,
    costByMember, isTeam, done,
  }, memberLabel, totalPages);

  // PAGINA 5 — RANKING (apenas equipe)
  if (isTeam) {
    doc.addPage();
    drawRankingPage(doc, memberRanking, totalPages);
  }
}

// ─── Paginas Individuais ─────────────────────────────────────────

function drawCoverPage(doc, startDate, endDate, memberLabel, totalPages) {
  // Background azul com gradiente simulado
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, PAGE_W, 130, 'F');
  doc.setFillColor(...COLORS.primaryDark);
  doc.rect(0, 100, PAGE_W, 30, 'F');

  // Logo centralizada
  try {
    doc.addImage(LOGO_BASE64, 'PNG', PAGE_W / 2 - 18, 25, 36, 36);
  } catch (_) {
    // fallback
    doc.setFillColor(255, 255, 255);
    doc.circle(PAGE_W / 2, 43, 18, 'F');
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    setColor(doc, COLORS.primary);
    doc.text('F', PAGE_W / 2, 49, { align: 'center' });
  }

  // Titulo
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.white);
  doc.text('Relatorio de Performance', PAGE_W / 2, 82, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont('helvetica', 'normal');
  setColor(doc, [219, 234, 254]); // blue-100
  doc.text('Fyness OS · Sistema de Gestao', PAGE_W / 2, 94, { align: 'center' });

  // Faixa escura com mes
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.white);
  const monthLabel = getMonthName(startDate);
  doc.text(monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1), PAGE_W / 2, 117, { align: 'center' });

  // Info cards
  const cardY = 150;
  const cardH = 24;
  const cardGap = 8;

  // Card: Periodo
  drawInfoCard(doc, MARGIN, cardY, CONTENT_W, cardH, 'Periodo', `${formatDateBR(startDate)}  a  ${formatDateBR(endDate)}`);

  // Card: Colaborador/Equipe
  drawInfoCard(doc, MARGIN, cardY + cardH + cardGap, CONTENT_W, cardH, 'Colaborador / Equipe', memberLabel);

  // Card: Data de Emissao
  drawInfoCard(doc, MARGIN, cardY + (cardH + cardGap) * 2, CONTENT_W, cardH, 'Data de Emissao', formatDateBR(new Date().toISOString()));

  // Linha decorativa
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.5);
  doc.line(MARGIN + 20, PAGE_H - 30, PAGE_W - MARGIN - 20, PAGE_H - 30);

  addFooter(doc, 1, totalPages);
}

function drawInfoCard(doc, x, y, w, h, label, value) {
  doc.setFillColor(...COLORS.light);
  doc.roundedRect(x, y, w, h, 3, 3, 'F');

  // Barra lateral azul
  doc.setFillColor(...COLORS.primary);
  doc.roundedRect(x, y, 3, h, 1.5, 1.5, 'F');

  doc.setFontSize(9);
  setColor(doc, COLORS.medium);
  doc.setFont('helvetica', 'normal');
  doc.text(label, x + 10, y + 9);

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  setColor(doc, COLORS.dark);
  doc.text(value, x + 10, y + 19);
}

function drawIndicatorsPage(doc, kpis, memberLabel, totalPages) {
  addPageHeader(doc, `Indicadores · ${memberLabel}`);

  let y = drawSectionTitle(doc, 30, 'Indicadores de Performance');

  y = drawKPITable(doc, y, [
    { label: 'Tempo Medio de Entrega', value: `${kpis.avgDelivery} dias` },
    { label: 'Tempo Medio de Entrega (periodo)', value: `${kpis.avgDeliveryMonth} dias` },
    { label: 'Taxa de Conclusao', value: `${kpis.completionRate}%` },
    { label: 'Entrega no Prazo', value: `${kpis.onTimeRate}%` },
    { label: 'Atraso Medio', value: `${kpis.avgDelay} dias` },
    { label: 'Produtividade Geral', value: `${kpis.productivity}%` },
    { label: 'Produtividade (periodo)', value: `${kpis.productivityMonth}%` },
    { label: 'Aproveitamento', value: `${kpis.utilization}%` },
    { label: 'Taxa de Retrabalho', value: `${kpis.reworkRate}%` },
  ]);

  y += 8;
  y = drawSectionTitle(doc, y, 'Volume de Trabalho');

  drawKPITable(doc, y, [
    { label: 'Total de O.S.', value: String(kpis.total) },
    { label: 'Concluidas (periodo)', value: String(kpis.doneMonth) },
    { label: 'Em Andamento', value: String(kpis.inProgress) },
    { label: 'Disponiveis', value: String(kpis.available) },
    { label: 'Horas Realizadas (periodo)', value: `${kpis.hoursMonth}h` },
    { label: 'Horas Previstas (periodo)', value: `${kpis.estimatedHours}h` },
    { label: 'Retrabalho (O.S.)', value: `${kpis.reworkCount} de ${kpis.reworkTotal}` },
  ]);

  addFooter(doc, 2, totalPages);
}

function drawMeetingsPage(doc, kpis, memberLabel, totalPages) {
  addPageHeader(doc, `Reunioes · ${memberLabel}`);

  let y = drawSectionTitle(doc, 30, 'Reunioes & Pontualidade');

  y = drawKPITable(doc, y, [
    { label: 'Total de Reunioes (passadas)', value: String(kpis.pastMeetings) },
    { label: 'Reunioes com Presenca', value: String(kpis.attendedMeetings) },
    { label: 'Taxa de Presenca', value: `${kpis.meetingAttendance}%` },
    { label: 'Reunioes Pontuais', value: String(kpis.punctualMeetings) },
    { label: 'Taxa de Pontualidade', value: `${kpis.meetingPunctuality}%` },
    { label: 'Total de Atrasos', value: String(kpis.lateArrivals) },
    { label: 'Tempo Total de Atraso', value: formatLateTime(kpis.totalLateMinutes) },
  ]);

  // Barras visuais
  y += 10;
  y = drawSectionTitle(doc, y, 'Resumo Visual');
  y += 2;

  y = drawProgressBar(doc, y, 'Presenca em Reunioes', kpis.meetingAttendance, COLORS.green);
  y = drawProgressBar(doc, y, 'Pontualidade', kpis.meetingPunctuality, COLORS.primary);

  // Barra de produtividade
  y = drawProgressBar(doc, y, 'Produtividade do Periodo', kpis.productivityMonth, COLORS.primaryDark);

  addFooter(doc, 3, totalPages);
}

function drawCostsPage(doc, data, memberLabel, totalPages) {
  const { totalCost, totalLaborCost, totalMaterialCost, avgCostPerOS, costByMember, isTeam, done } = data;

  addPageHeader(doc, `Custos · ${memberLabel}`);

  let y = drawSectionTitle(doc, 30, 'Analise de Custos');

  y = drawKPITable(doc, y, [
    { label: 'Custo Total', value: formatCurrency(totalCost) },
    { label: 'Custo Medio por O.S.', value: formatCurrency(avgCostPerOS) },
    { label: 'Mao de Obra', value: formatCurrency(totalLaborCost) },
    { label: 'Materiais / Despesas', value: formatCurrency(totalMaterialCost) },
    { label: 'O.S. Concluidas (base de calculo)', value: String(done.length) },
  ]);

  // Custo por colaborador
  if (isTeam && Object.keys(costByMember).length > 0) {
    y += 8;
    y = drawSectionTitle(doc, y, 'Custo por Colaborador');

    const colWidths = [CONTENT_W * 0.30, CONTENT_W * 0.15, CONTENT_W * 0.20, CONTENT_W * 0.20, CONTENT_W * 0.15];
    const headers = ['Colaborador', 'O.S.', 'Mao de Obra', 'Materiais', 'Total'];
    const rows = Object.entries(costByMember)
      .sort((a, b) => (b[1].labor + b[1].material) - (a[1].labor + a[1].material))
      .map(([name, c]) => [
        name.length > 20 ? name.substring(0, 18) + '..' : name,
        String(c.count),
        formatCurrency(c.labor),
        formatCurrency(c.material),
        formatCurrency(c.labor + c.material),
      ]);

    drawTable(doc, y, headers, rows, colWidths);
  }

  addFooter(doc, 4, totalPages);
}

function drawRankingPage(doc, ranking, totalPages) {
  addPageHeader(doc, 'Ranking da Equipe');

  let y = drawSectionTitle(doc, 30, 'Ranking de Performance');

  if (ranking.length === 0) {
    doc.setFontSize(11);
    setColor(doc, COLORS.medium);
    doc.setFont('helvetica', 'italic');
    doc.text('Nenhum dado de ranking disponivel para o periodo selecionado.', MARGIN, y + 8);
    addFooter(doc, 5, totalPages);
    return;
  }

  const colWidths = [
    CONTENT_W * 0.06,  // #
    CONTENT_W * 0.28,  // Nome
    CONTENT_W * 0.10,  // O.S.
    CONTENT_W * 0.16,  // No Prazo %
    CONTENT_W * 0.16,  // Tempo Medio
    CONTENT_W * 0.12,  // Produtiv.
    CONTENT_W * 0.12,  // Retrabalho
  ];
  const headers = ['#', 'Colaborador', 'O.S.', 'No Prazo', 'T. Medio', 'Produtiv.', 'Retrab.'];

  const rows = ranking.map((r, i) => [
    String(i + 1),
    r.name.length > 18 ? r.name.substring(0, 16) + '..' : r.name,
    String(r.totalDone),
    `${r.onTimeRate}%`,
    `${r.avgDelivery}d`,
    `${r.productivity}%`,
    `${r.reworkRate}%`,
  ]);

  y = drawTable(doc, y, headers, rows, colWidths);

  // Legenda
  y += 8;
  doc.setFontSize(8);
  setColor(doc, COLORS.medium);
  doc.setFont('helvetica', 'italic');
  doc.text('Ordenado por O.S. concluidas (desc) e taxa no prazo (desc). Produtividade = Horas previstas / Horas realizadas.', MARGIN, y);

  addFooter(doc, 5, totalPages);
}

// ─── Ranking Builder ─────────────────────────────────────────────

function buildMemberRanking(orders, members) {
  const ranking = [];

  for (const member of members) {
    const memberName = member.name.toLowerCase().trim();
    const memberOrders = orders.filter(o =>
      (o.assignee || '').toLowerCase().trim() === memberName
    );

    const done = memberOrders.filter(o => o.status === 'done');
    if (done.length === 0) continue;

    const deliveryDays = done.map(o => calcDeliveryDays(o)).filter(d => d !== null);
    const avgDelivery = deliveryDays.length > 0
      ? (deliveryDays.reduce((s, d) => s + d, 0) / deliveryDays.length).toFixed(1)
      : '0';

    const withEstimate = done.filter(o => o.estimatedEnd && o.actualEnd);
    const onTime = withEstimate.filter(o => calcDelayDays(o) <= 0);
    const onTimeRate = withEstimate.length > 0
      ? ((onTime.length / withEstimate.length) * 100).toFixed(0)
      : '100';

    const realized = done.reduce((s, o) => s + calcOSHours(o), 0);
    const estimated = done.reduce((s, o) => s + calcEstimatedHours(o), 0);
    const productivity = realized > 0 ? ((estimated / realized) * 100).toFixed(0) : '0';

    const doneWithEst = done.filter(o => calcEstimatedHours(o) > 0 && calcOSHours(o) > 0);
    const rework = doneWithEst.filter(o => calcOSHours(o) > calcEstimatedHours(o) * 1.3);
    const reworkRate = doneWithEst.length > 0
      ? ((rework.length / doneWithEst.length) * 100).toFixed(0)
      : '0';

    ranking.push({
      name: member.name,
      totalDone: done.length,
      avgDelivery,
      onTimeRate,
      productivity,
      reworkRate,
    });
  }

  ranking.sort((a, b) => {
    if (b.totalDone !== a.totalDone) return b.totalDone - a.totalDone;
    return parseFloat(b.onTimeRate) - parseFloat(a.onTimeRate);
  });

  return ranking;
}

// ─── Preview KPIs (para usar no ReportPage) ──────────────────────

export function getReportPreview({ orders, events, members, startDate, endDate, filterMember, targetHours }) {
  const { filteredOrders, filteredEvents } = filterByPeriod(orders, events, startDate, endDate);

  let reportOrders = filteredOrders;
  let reportEvents = filteredEvents;

  if (filterMember && filterMember !== 'all') {
    const memberName = filterMember.toLowerCase().trim();
    reportOrders = filteredOrders.filter(o =>
      (o.assignee || '').toLowerCase().trim() === memberName
    );
    reportEvents = filteredEvents.filter(e =>
      (e.assignee || '').toLowerCase().trim() === memberName
    );
  }

  const kpis = calcKPIs(reportOrders, reportEvents, targetHours || 176);

  const done = reportOrders.filter(o => o.status === 'done');
  let totalCost = 0;
  done.forEach(o => {
    const cost = calcOSCost(o, members);
    totalCost += cost.totalCost;
  });

  return {
    kpis,
    totalCost,
    ordersCount: reportOrders.length,
    eventsCount: reportEvents.length,
    doneCount: done.length,
  };
}

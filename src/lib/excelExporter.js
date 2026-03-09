import * as XLSX from 'xlsx';
import { calcOSHours, calcOSCost, getMemberHourlyRate, formatCurrency } from './kpiUtils';

/**
 * Exporta O.S. para planilha Excel com abas: Resumo, Detalhado, Custos.
 */
export function exportOSToExcel(orders, members, period = '') {
  const wb = XLSX.utils.book_new();

  // ==================== ABA 1: RESUMO ====================
  const total = orders.length;
  const done = orders.filter(o => o.status === 'done').length;
  const inProgress = orders.filter(o => o.status === 'in_progress').length;
  const available = orders.filter(o => o.status === 'available').length;
  const blocked = orders.filter(o => o.status === 'blocked').length;
  const emergency = orders.filter(o => o.type === 'emergency').length;

  const resumeData = [
    ['FYNESS OS - Relatorio de Ordens de Servico'],
    ['Periodo', period || 'Todos'],
    [''],
    ['Indicador', 'Valor'],
    ['Total de O.S.', total],
    ['Concluidas', done],
    ['Em Andamento', inProgress],
    ['Disponiveis', available],
    ['Bloqueadas', blocked],
    ['Emergenciais', emergency],
    ['Taxa de Conclusao', total > 0 ? `${((done / total) * 100).toFixed(1)}%` : '0%'],
  ];

  const wsResume = XLSX.utils.aoa_to_sheet(resumeData);
  wsResume['!cols'] = [{ wch: 25 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsResume, 'Resumo');

  // ==================== ABA 2: DETALHADO ====================
  const detailHeaders = ['#', 'Titulo', 'Status', 'Prioridade', 'Tipo', 'Responsavel', 'Cliente', 'Inicio Est.', 'Fim Est.', 'Inicio Real', 'Fim Real', 'Horas'];
  const detailRows = orders.map(o => [
    o.type === 'emergency' ? `EMG-${o.emergencyNumber}` : o.number,
    o.title,
    translateStatus(o.status),
    translatePriority(o.priority),
    o.type === 'emergency' ? 'Emergencial' : 'Normal',
    o.assignee || '-',
    o.client || '-',
    formatDate(o.estimatedStart),
    formatDate(o.estimatedEnd),
    formatDate(o.actualStart),
    formatDate(o.actualEnd),
    calcOSHours(o).toFixed(1),
  ]);

  const wsDetail = XLSX.utils.aoa_to_sheet([detailHeaders, ...detailRows]);
  wsDetail['!cols'] = detailHeaders.map(() => ({ wch: 16 }));
  XLSX.utils.book_append_sheet(wb, wsDetail, 'Detalhado');

  // ==================== ABA 3: CUSTOS ====================
  const costHeaders = ['#', 'Titulo', 'Responsavel', 'Horas', 'Taxa/h', 'Custo Mao de Obra', 'Custo Materiais', 'Custo Total'];
  const costRows = orders.filter(o => o.status === 'done').map(o => {
    const member = members.find(m => m.name === o.assignee);
    const rate = member ? getMemberHourlyRate(member) : 0;
    const hours = calcOSHours(o);
    const cost = calcOSCost(o, member);
    const materialCost = (o.expenses || []).reduce((sum, e) => sum + (e.quantity || 1) * (e.unitPrice || e.unit_price || 0), 0);

    return [
      o.type === 'emergency' ? `EMG-${o.emergencyNumber}` : o.number,
      o.title,
      o.assignee || '-',
      hours.toFixed(1),
      formatCurrency(rate),
      formatCurrency(hours * rate),
      formatCurrency(materialCost),
      formatCurrency(cost),
    ];
  });

  const wsCost = XLSX.utils.aoa_to_sheet([costHeaders, ...costRows]);
  wsCost['!cols'] = costHeaders.map(() => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, wsCost, 'Custos');

  // ==================== DOWNLOAD ====================
  const filename = `fyness_os_${period || 'completo'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

/**
 * Exporta KPIs da equipe para Excel.
 */
export function exportKPIsToExcel(orders, members, events, period = '') {
  const wb = XLSX.utils.book_new();

  const headers = ['Membro', 'O.S. Total', 'Concluidas', 'Taxa Conclusao', 'Horas Trabalhadas', 'Custo Total', 'Reunioes'];

  const rows = members.map(m => {
    const memberOrders = orders.filter(o => o.assignee === m.name);
    const done = memberOrders.filter(o => o.status === 'done').length;
    const total = memberOrders.length;
    const hours = memberOrders.filter(o => o.status === 'done').reduce((sum, o) => sum + calcOSHours(o), 0);
    const cost = memberOrders.filter(o => o.status === 'done').reduce((sum, o) => sum + calcOSCost(o, m), 0);
    const meetings = events.filter(e => e.type === 'meeting' && (e.assignee === m.name || (e.attendees || []).some(a => a.name === m.name))).length;

    return [
      m.name,
      total,
      done,
      total > 0 ? `${((done / total) * 100).toFixed(1)}%` : '0%',
      hours.toFixed(1),
      formatCurrency(cost),
      meetings,
    ];
  });

  const ws = XLSX.utils.aoa_to_sheet([
    ['FYNESS OS - KPIs da Equipe'],
    ['Periodo', period || 'Todos'],
    [''],
    headers,
    ...rows,
  ]);
  ws['!cols'] = headers.map(() => ({ wch: 18 }));
  XLSX.utils.book_append_sheet(wb, ws, 'KPIs');

  const filename = `fyness_kpis_${period || 'completo'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// ==================== HELPERS ====================

function translateStatus(status) {
  const map = { available: 'Disponivel', in_progress: 'Em Andamento', done: 'Concluida', blocked: 'Bloqueada' };
  return map[status] || status;
}

function translatePriority(priority) {
  const map = { low: 'Baixa', medium: 'Media', high: 'Alta', urgent: 'Urgente' };
  return map[priority] || priority;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  } catch {
    return dateStr;
  }
}

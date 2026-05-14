/**
 * Helpers compartilhados pelos componentes da pagina financial/OS.
 *
 * Extraidos do FinancialPage.jsx pra serem reutilizados pelos modais
 * (OSDocument, OSPreviewDocument, OSFormModal, OSCard).
 */

import { calcWorkingHoursBetween, namesMatch } from '../../../lib/kpiUtils';
import { STANDARD_MONTHLY_HOURS } from '../../../constants/sla';

/** Formata minutos como "1h30" / "2h" / "45min". */
export function formatHM(min) {
  if (!min || min <= 0) return '0min';
  const h = Math.floor(min / 60);
  const r = min % 60;
  if (h > 0 && r > 0) return `${h}h${String(r).padStart(2, '0')}`;
  if (h > 0) return `${h}h`;
  return `${r}min`;
}

/** Lista de nomes a renderizar como chips de "atribuidos".
 *  Em team: usa participants[] (fonte unica de verdade).
 *  Em solo/pool: cai no CSV legado de assignedTo. */
export function getOrderAssigneeNames(order) {
  if (order?.mode === 'team' && Array.isArray(order.participants) && order.participants.length > 0) {
    return order.participants.map(p => p?.name).filter(Boolean);
  }
  return (order?.assignedTo || '').split(',').map(s => s.trim()).filter(Boolean);
}

/** Calcula horas trabalhadas em uma O.S. (horas uteis seg-sex 9-18h). */
export function calcOSHours(order) {
  if (order.actualStart && order.actualEnd) {
    const hours = calcWorkingHoursBetween(order.actualStart, order.actualEnd);
    if (hours > 0) return hours;
  }
  const cl = order.checklist || [];
  let totalHours = 0;
  for (const item of cl) {
    if (item.accumulatedMin > 0) {
      totalHours += item.accumulatedMin / 60;
    } else if (item.startedAt && item.completedAt) {
      const h = calcWorkingHoursBetween(item.startedAt, item.completedAt);
      if (h > 0) totalHours += h;
    }
  }
  return totalHours > 0 ? totalHours : 0;
}

/** Valor/hora de um membro (salario / horas-mes). 0 se nao cadastrado. */
export function getMemberHourlyRate(member) {
  const salary = parseFloat(member.salaryMonth || member.salary_month || 0);
  const hours = parseFloat(member.hoursMonth || member.hours_month || STANDARD_MONTHLY_HOURS);
  if (salary <= 0 || hours <= 0) return 0;
  return salary / hours;
}

/** Custo total da O.S.: mao de obra (horas * rate) + materiais (expenses). */
export function calcOSCost(order, membersList) {
  const hours = calcOSHours(order);
  const member = membersList.find(m =>
    namesMatch(m.name, order.assignee) || namesMatch(m.name, order.assignedTo)
  );
  const hourlyRate = member ? getMemberHourlyRate(member) : 0;
  const laborCost = hours * hourlyRate;
  const materialCost = (order.expenses || []).reduce((acc, e) => acc + (e.value || 0) * (e.quantity || 1), 0);
  return { laborCost, materialCost, totalCost: laborCost + materialCost, hours, hourlyRate, memberFound: !!member };
}

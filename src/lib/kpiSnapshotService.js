import { createCRUDService } from './serviceFactory';
import { supabase } from './supabase';
import { calcKPIs } from './kpiUtils';

// ==================== TRANSFORMADOR ====================

function dbToSnapshot(row) {
  if (!row) return null;
  return {
    id: row.id,
    userName: row.user_name || '',
    period: row.period, // 'YYYY-MM'
    metrics: row.metrics || {},
    createdAt: row.created_at,
  };
}

// ==================== SERVICE (via factory) ====================

const snapshotService = createCRUDService({
  table: 'kpi_snapshots',
  localKey: 'kpi_snapshots',
  idPrefix: 'ks',
  transform: dbToSnapshot,
  fieldMap: {
    userName: 'user_name',
    period: 'period',
    metrics: 'metrics',
  },
  orderBy: 'period',
  orderAsc: true,
});

// ==================== HELPERS ====================

function getCurrentPeriod() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getPeriodLabel(period) {
  const [year, month] = period.split('-');
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${months[parseInt(month) - 1]} ${year}`;
}

// ==================== EXPORTS ====================

export async function saveMonthlySnapshot(orders, events, targetHours, userName) {
  const period = getCurrentPeriod();
  const kpis = calcKPIs(orders, events, targetHours);

  const metrics = {
    doneMonth: kpis.doneMonth,
    inProgress: kpis.inProgress,
    available: kpis.available,
    completionRate: parseFloat(kpis.completionRate),
    onTimeRate: parseFloat(kpis.onTimeRate),
    avgDelivery: parseFloat(kpis.avgDeliveryMonth),
    hoursMonth: kpis.hoursMonth,
    productivity: parseFloat(kpis.productivityMonth),
    utilization: parseFloat(kpis.utilization),
    reworkRate: parseFloat(kpis.reworkRate),
    meetingAttendance: parseFloat(kpis.meetingAttendance),
  };

  // Verificar se ja existe snapshot para este periodo
  const existing = await getHistory(userName);
  const existingSnapshot = existing.find(s => s.period === period);

  if (existingSnapshot) {
    return snapshotService.update(existingSnapshot.id, { metrics });
  }

  return snapshotService.create({ userName, period, metrics });
}

export async function getHistory(userName, limit = 12) {
  const { data, error } = await supabase
    .from('kpi_snapshots')
    .select('*')
    .eq('user_name', userName)
    .order('period', { ascending: true })
    .limit(limit);

  if (error) {
    const local = JSON.parse(localStorage.getItem('kpi_snapshots') || '[]');
    return local
      .filter(s => s.user_name === userName)
      .sort((a, b) => a.period.localeCompare(b.period))
      .slice(-limit)
      .map(dbToSnapshot);
  }
  return (data || []).map(dbToSnapshot);
}

export function calculateTrends(history) {
  if (history.length < 2) {
    return { completionRate: 0, onTimeRate: 0, productivity: 0, hoursMonth: 0, avgDelivery: 0 };
  }

  const current = history[history.length - 1]?.metrics || {};
  const previous = history[history.length - 2]?.metrics || {};

  return {
    completionRate: (current.completionRate || 0) - (previous.completionRate || 0),
    onTimeRate: (current.onTimeRate || 0) - (previous.onTimeRate || 0),
    productivity: (current.productivity || 0) - (previous.productivity || 0),
    hoursMonth: (current.hoursMonth || 0) - (previous.hoursMonth || 0),
    avgDelivery: (current.avgDelivery || 0) - (previous.avgDelivery || 0),
  };
}

export function calcProjection(history, metricKey) {
  if (history.length < 3) return null;

  const values = history.slice(-6).map(s => s.metrics?.[metricKey] || 0);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  const trend = values.length >= 2 ? (values[values.length - 1] - values[0]) / (values.length - 1) : 0;

  return {
    average: avg,
    trend,
    nextMonth: avg + trend,
    direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
  };
}

export { getCurrentPeriod, getPeriodLabel };

import { calcProjection, getPeriodLabel, getCurrentPeriod } from '../../lib/kpiSnapshotService';

/**
 * ProjectionWidget - Exibe projecao "Se manter o ritmo..."
 *
 * Props:
 * - history: array de snapshots do historico
 */
export function ProjectionWidget({ history = [] }) {
  if (history.length < 3) {
    return null;
  }

  const projections = [
    { key: 'completionRate', label: 'Taxa de conclusao', suffix: '%', good: 'up' },
    { key: 'onTimeRate', label: 'Entrega no prazo', suffix: '%', good: 'up' },
    { key: 'productivity', label: 'Produtividade', suffix: '%', good: 'up' },
    { key: 'hoursMonth', label: 'Horas/mes', suffix: 'h', good: 'up' },
    { key: 'avgDelivery', label: 'Tempo medio de entrega', suffix: ' dias', good: 'down' },
  ];

  const validProjections = projections
    .map(p => {
      const proj = calcProjection(history, p.key);
      if (!proj) return null;
      return { ...p, ...proj };
    })
    .filter(Boolean)
    .filter(p => Math.abs(p.trend) > 0.1);

  if (validProjections.length === 0) return null;

  // Pegar projecao mais significativa
  const main = validProjections[0];
  const isGood = main.good === main.direction || (main.good === 'down' && main.direction === 'down');

  // Proximo periodo
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextPeriod = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
        <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        Projecao para {getPeriodLabel(nextPeriod)}
      </h3>

      <div className="space-y-3">
        {validProjections.slice(0, 4).map(p => {
          const isPositive = p.good === 'up' ? p.direction === 'up' : p.direction === 'down';
          return (
            <div key={p.key} className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-300">{p.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                  {p.nextMonth.toFixed(1)}{p.suffix}
                </span>
                <span className={`text-xs font-medium ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
                  {p.direction === 'up' ? '↑' : '↓'} {Math.abs(p.trend).toFixed(1)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-3">
        Baseado na media dos ultimos {Math.min(history.length, 6)} meses
      </p>
    </div>
  );
}

export default ProjectionWidget;

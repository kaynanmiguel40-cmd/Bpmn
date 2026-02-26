/**
 * CrmKpiCard - Card de KPI para Dashboard CRM.
 *
 * Props:
 * - title: Label do KPI
 * - value: Valor principal (string ou numero)
 * - subtitle: Texto auxiliar (ex: "vs mes anterior")
 * - trend: { value: "+12%", up: true } para indicador de tendencia
 * - icon: Componente lucide-react
 * - color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet'
 * - loading: boolean
 */

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-900/20',
    icon: 'text-indigo-600 dark:text-indigo-400',
    ring: 'ring-indigo-200 dark:ring-indigo-800',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    icon: 'text-emerald-600 dark:text-emerald-400',
    ring: 'ring-emerald-200 dark:ring-emerald-800',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    icon: 'text-green-600 dark:text-green-400',
    ring: 'ring-green-200 dark:ring-green-800',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    icon: 'text-amber-600 dark:text-amber-400',
    ring: 'ring-amber-200 dark:ring-amber-800',
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    icon: 'text-orange-600 dark:text-orange-400',
    ring: 'ring-orange-200 dark:ring-orange-800',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    icon: 'text-rose-600 dark:text-rose-400',
    ring: 'ring-rose-200 dark:ring-rose-800',
  },
  violet: {
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    icon: 'text-violet-600 dark:text-violet-400',
    ring: 'ring-violet-200 dark:ring-violet-800',
  },
  sky: {
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    icon: 'text-sky-600 dark:text-sky-400',
    ring: 'ring-sky-200 dark:ring-sky-800',
  },
};

export function CrmKpiCard({ title, value, subtitle, trend, icon: Icon, color = 'indigo', loading }) {
  const colors = colorMap[color] || colorMap.indigo;

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg" />
        </div>
        <div className="h-7 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
        <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center`}>
            <Icon size={18} className={colors.icon} />
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</div>
      <div className="flex items-center gap-2 mt-1">
        {trend && (
          <span className={`text-xs font-medium ${trend.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trend.value}
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-slate-400 dark:text-slate-500">{subtitle}</span>
        )}
      </div>
    </div>
  );
}

export default CrmKpiCard;

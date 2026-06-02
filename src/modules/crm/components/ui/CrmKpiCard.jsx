/**
 * CrmKpiCard - Card de KPI (Soft Depth / Glass) para o Dashboard CRM.
 *
 * Superficie translucida com gradiente de accent, glow no hover e
 * numeros tabulares. Mantem a mesma API anterior.
 *
 * Props:
 * - title: Label do KPI
 * - value: Valor principal ja formatado (string) — fallback quando nao ha rawValue
 * - rawValue: numero cru opcional; se presente, anima com count-up
 * - format: fn(numero) => string usada durante o count-up (ex: formatCurrency)
 * - subtitle: Texto auxiliar (ex: "vs mes anterior")
 * - trend: { value: "+12%", up: true } para indicador de tendencia
 * - icon: Componente lucide-react
 * - color: 'blue' | 'emerald' | 'green' | 'amber' | 'orange' | 'rose' | 'violet' | 'sky'
 * - loading: boolean
 */

import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCountUp } from '../../hooks/useCountUp';

const colorMap = {
  blue:    { tint: 'from-blue-500/12',    icon: 'bg-blue-500/15 text-blue-600 dark:text-blue-300',       glow: 'group-hover:shadow-glow-blue',    bar: 'bg-blue-500' },
  emerald: { tint: 'from-emerald-500/12', icon: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-300', glow: 'group-hover:shadow-glow-emerald', bar: 'bg-emerald-500' },
  green:   { tint: 'from-green-500/12',   icon: 'bg-green-500/15 text-green-600 dark:text-green-300',     glow: 'group-hover:shadow-glow-emerald', bar: 'bg-green-500' },
  amber:   { tint: 'from-amber-500/12',   icon: 'bg-amber-500/15 text-amber-600 dark:text-amber-300',     glow: 'group-hover:shadow-glow-amber',   bar: 'bg-amber-500' },
  orange:  { tint: 'from-orange-500/12',  icon: 'bg-orange-500/15 text-orange-600 dark:text-orange-300',  glow: 'group-hover:shadow-glow-amber',   bar: 'bg-orange-500' },
  rose:    { tint: 'from-rose-500/12',    icon: 'bg-rose-500/15 text-rose-600 dark:text-rose-300',        glow: 'group-hover:shadow-glow-blue',    bar: 'bg-rose-500' },
  violet:  { tint: 'from-violet-500/12',  icon: 'bg-violet-500/15 text-violet-600 dark:text-violet-300',  glow: 'group-hover:shadow-glow-violet',  bar: 'bg-violet-500' },
  sky:     { tint: 'from-sky-500/12',     icon: 'bg-sky-500/15 text-sky-600 dark:text-sky-300',           glow: 'group-hover:shadow-glow-blue',    bar: 'bg-sky-500' },
};

export function CrmKpiCard({ title, value, rawValue, format, subtitle, trend, icon: Icon, color = 'blue', loading }) {
  const c = colorMap[color] || colorMap.blue;

  const hasRaw = typeof rawValue === 'number' && Number.isFinite(rawValue);
  const animated = useCountUp(hasRaw ? rawValue : 0, { enabled: hasRaw, duration: 900 });
  const display = hasRaw
    ? (format ? format(Math.round(animated)) : new Intl.NumberFormat('pt-BR').format(Math.round(animated)))
    : value;

  if (loading) {
    return (
      <div className="crm-glass rounded-2xl p-5 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-3 w-20 bg-slate-200/70 dark:bg-slate-700/70 rounded" />
          <div className="w-10 h-10 bg-slate-200/70 dark:bg-slate-700/70 rounded-xl" />
        </div>
        <div className="h-8 w-24 bg-slate-200/70 dark:bg-slate-700/70 rounded mb-2" />
        <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
    );
  }

  const TrendIcon = trend?.up ? TrendingUp : TrendingDown;

  return (
    <div className={`group crm-glass crm-glass-hover rounded-2xl p-5 relative overflow-hidden`}>
      {/* Gradiente de accent sutil no canto */}
      <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${c.tint} via-transparent to-transparent opacity-70`} />
      {/* Brilho extra no hover, condicional por cor */}
      <div className={`pointer-events-none absolute inset-0 rounded-2xl transition-shadow duration-300 ${c.glow}`} />

      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {title}
          </span>
          {Icon && (
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
              <Icon size={19} />
            </span>
          )}
        </div>

        <div className="text-[1.75rem] leading-none font-bold text-slate-900 dark:text-white tnum">
          {display}
        </div>

        <div className="flex items-center gap-2 mt-2.5">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-semibold tnum ${
                trend.up
                  ? 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/12 text-rose-600 dark:text-rose-400'
              }`}
            >
              <TrendIcon size={11} />
              {trend.value}
            </span>
          )}
          {subtitle && (
            <span className="text-xs text-slate-400 dark:text-slate-500 truncate">{subtitle}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default CrmKpiCard;

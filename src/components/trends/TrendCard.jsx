import { Sparkline } from './TrendChart';

/**
 * TrendCard - Card de KPI com sparkline e indicador de tendencia
 *
 * Props:
 * - label: titulo do KPI
 * - value: valor atual
 * - suffix: sufixo (ex: '%', 'h', 'dias')
 * - trend: variacao vs periodo anterior (positivo ou negativo)
 * - trendInverted: se true, tendencia positiva e ruim (ex: dias de atraso)
 * - sparklineData: array de valores para sparkline
 * - color: cor do sparkline
 */
export function TrendCard({ label, value, suffix = '', trend = 0, trendInverted = false, sparklineData = [], color = '#3b82f6' }) {
  const isPositive = trendInverted ? trend < 0 : trend > 0;
  const isNegative = trendInverted ? trend > 0 : trend < 0;
  const trendColor = isPositive ? 'text-emerald-600 dark:text-emerald-400' : isNegative ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500';
  const trendArrow = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        {sparklineData.length >= 2 && (
          <Sparkline data={sparklineData} color={color} />
        )}
      </div>

      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          {value}{suffix}
        </span>
        {trend !== 0 && (
          <span className={`text-xs font-medium ${trendColor} mb-1`}>
            {trendArrow} {Math.abs(trend).toFixed(1)}{suffix}
          </span>
        )}
      </div>
    </div>
  );
}

export default TrendCard;

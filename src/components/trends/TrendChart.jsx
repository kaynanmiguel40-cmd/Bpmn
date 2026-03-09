import { getPeriodLabel } from '../../lib/kpiSnapshotService';

/**
 * TrendChart - Grafico SVG de linha para historico de KPIs
 *
 * Props:
 * - data: [{ period, value }]
 * - color: cor da linha (ex: '#3b82f6')
 * - height: altura do grafico (default 120)
 * - showLabels: mostrar labels do eixo X
 * - formatValue: funcao para formatar valor no tooltip
 */
export function TrendChart({ data = [], color = '#3b82f6', height = 120, showLabels = true, formatValue = v => v }) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center text-sm text-slate-400 dark:text-slate-500" style={{ height }}>
        Dados insuficientes
      </div>
    );
  }

  const padding = { top: 10, right: 10, bottom: showLabels ? 24 : 10, left: 10 };
  const width = 300;
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = data.map(d => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((d.value - minVal) / range) * chartH,
    ...d,
  }));

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // Gradient fill path
  const fillD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  const gradientId = `gradient-${color.replace('#', '')}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Fill */}
      <path d={fillD} fill={`url(#${gradientId})`} />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="2">
          <title>{getPeriodLabel(p.period)}: {formatValue(p.value)}</title>
        </circle>
      ))}

      {/* X-axis labels */}
      {showLabels && points.filter((_, i) => i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)).map((p, i) => (
        <text key={i} x={p.x} y={height - 4} textAnchor="middle" className="fill-slate-400 dark:fill-slate-500" fontSize="9">
          {getPeriodLabel(p.period)}
        </text>
      ))}
    </svg>
  );
}

/**
 * Sparkline - Mini versao do TrendChart para uso em cards
 */
export function Sparkline({ data = [], color = '#3b82f6', width = 80, height = 24 }) {
  if (data.length < 2) return null;

  const values = data.map(d => typeof d === 'number' ? d : d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1;

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((v - minVal) / range) * (height - 4) - 2;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} className="inline-block">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={points.join(' ')} />
    </svg>
  );
}

export default TrendChart;

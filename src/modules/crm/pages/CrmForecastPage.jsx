/**
 * CrmForecastPage - Dashboard Financeiro do CRM.
 *
 * Analise completa de pipeline, previsao de receita e metricas financeiras.
 * Consome 6 hooks em paralelo sem criar services novos.
 *
 * Secoes:
 * - 8 KPI Cards financeiros
 * - ComposedChart: Receita Real vs Forecast
 * - PieChart/Donut: Valor por Estagio
 * - BarChart: Mensal Total vs Ponderado vs Real
 * - Breakdown visual por estagio do pipeline
 * - Accordion de deals por mes
 */

import { useState, useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  ComposedChart, Area, Line,
  PieChart, Pie, Cell,
} from 'recharts';
import {
  TrendingUp, TrendingDown, DollarSign, Target,
  ChevronDown, ChevronRight, Calendar, Building2, User,
  Clock, Percent, Receipt, Brain, AlertTriangle,
} from 'lucide-react';
import { CrmPageHeader, CrmKpiCard, CrmBadge } from '../components/ui';
import {
  useForecastReport,
  useCrmDashboardKPIs,
  useSalesReport,
  useFunnelReport,
  useCrmPipelines,
  useLearnedProbabilities,
} from '../hooks/useCrmQueries';

// ==================== HELPERS ====================

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val || 0);

const formatCurrencyFull = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getMonthLabel(monthKey) {
  if (!monthKey || monthKey === 'sem_data') return 'Sem data';
  const parts = monthKey.split('-');
  const idx = parseInt(parts[1], 10) - 1;
  return `${monthNames[idx] || parts[1]}/${parts[0]?.slice(2)}`;
}

function getMonthShort(monthKey) {
  if (!monthKey || monthKey === 'sem_data') return '?';
  const parts = monthKey.split('-');
  const idx = parseInt(parts[1], 10) - 1;
  return monthNames[idx] || parts[1];
}

function getProbabilityColor(prob) {
  if (prob >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (prob >= 50) return 'text-blue-600 dark:text-blue-400';
  if (prob >= 30) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

const PERIOD_OPTIONS = [
  { value: 'month', label: 'Mes Atual' },
  { value: 'last_month', label: 'Mes Anterior' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Ano' },
];

function getPeriodDates(period) {
  const now = new Date();
  let start, end;
  switch (period) {
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'quarter': {
      const qMonth = Math.floor(now.getMonth() / 3) * 3;
      start = new Date(now.getFullYear(), qMonth, 1);
      end = now;
      break;
    }
    case 'year':
      start = new Date(now.getFullYear(), 0, 1);
      end = now;
      break;
    default:
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
  }
  return { start: start.toISOString(), end: end.toISOString() };
}

const stageColors = ['#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb923c', '#34d399', '#38bdf8'];

// ==================== SKELETON ====================

function ForecastSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
            <div className="h-7 w-28 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
            <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
            <div className="h-4 w-44 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
        <div className="h-4 w-56 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
}

// ==================== TOOLTIPS ====================

function RevenueVsForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.stroke || p.fill || p.color }} />
          <span className="text-xs text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatCurrencyFull(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function StageDonutTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{d.name}</p>
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrencyFull(d.value)}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{d.payload.count} negocio{d.payload.count !== 1 ? 's' : ''}</p>
    </div>
  );
}

function MonthlyBarTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
          <span className="text-xs text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatCurrencyFull(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ==================== MONTH ACCORDION ====================

function MonthSection({ monthData }) {
  const [open, setOpen] = useState(false);
  const isNoDate = monthData.month === 'sem_data';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="shrink-0 text-slate-400 dark:text-slate-500">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <Calendar size={16} className="text-slate-400 shrink-0" />
          <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            {isNoDate ? 'Sem data definida' : getMonthLabel(monthData.month)}
          </span>
          <CrmBadge variant="neutral" size="sm">{monthData.deals.length} deal{monthData.deals.length !== 1 ? 's' : ''}</CrmBadge>
        </div>
        <div className="ml-auto flex items-center gap-6 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Total</div>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">{formatCurrency(monthData.totalValue)}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500">Ponderado</div>
            <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(monthData.weightedValue)}</div>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-200 dark:border-slate-700/50">
          <div className="hidden sm:grid grid-cols-12 gap-2 px-5 py-2 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium bg-slate-50 dark:bg-slate-800/30">
            <div className="col-span-4">Negocio</div>
            <div className="col-span-2">Estagio</div>
            <div className="col-span-2 text-right">Valor</div>
            <div className="col-span-2 text-center">Probabilidade</div>
            <div className="col-span-2 text-right">Ponderado</div>
          </div>
          {monthData.deals.map((deal) => (
            <div key={deal.id} className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-2 px-5 py-3 border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <div className="sm:col-span-4 min-w-0">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{deal.title}</div>
                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 truncate">
                  {deal.contact && <span className="flex items-center gap-1"><User size={10} />{deal.contact}</span>}
                  {deal.company && <span className="flex items-center gap-1"><Building2 size={10} />{deal.company}</span>}
                </div>
              </div>
              <div className="sm:col-span-2 flex items-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{deal.stage || '—'}</span>
              </div>
              <div className="sm:col-span-2 flex items-center sm:justify-end">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatCurrency(deal.value)}</span>
              </div>
              <div className="sm:col-span-2 flex items-center sm:justify-center gap-2">
                <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      deal.probability >= 80 ? 'bg-emerald-500' :
                      deal.probability >= 50 ? 'bg-blue-500' :
                      deal.probability >= 30 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${deal.probability}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${getProbabilityColor(deal.probability)}`}>{deal.probability}%</span>
              </div>
              <div className="sm:col-span-2 flex items-center sm:justify-end">
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(deal.weightedValue)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export function CrmForecastPage() {
  // State
  const [selectedPeriod, setSelectedPeriod] = useState('quarter');
  const [selectedPipelineId, setSelectedPipelineId] = useState(null);
  const [learnedScope, setLearnedScope] = useState('pipeline'); // 'pipeline' | 'all'

  // Hooks — dados em paralelo
  const { data: forecast, isLoading: loadingForecast } = useForecastReport();
  const { data: kpis, isLoading: loadingKpis } = useCrmDashboardKPIs();
  const { data: pipelines } = useCrmPipelines();

  const { start, end } = useMemo(() => getPeriodDates(selectedPeriod), [selectedPeriod]);
  const { data: sales, isLoading: loadingSales } = useSalesReport(start, end);
  const { data: funnel } = useFunnelReport(selectedPipelineId);
  const learnedPipelineId = learnedScope === 'all' ? null : selectedPipelineId;
  const { data: learned } = useLearnedProbabilities(learnedPipelineId);

  // Auto-selecionar primeiro pipeline
  useEffect(() => {
    if (pipelines?.length && !selectedPipelineId) {
      setSelectedPipelineId(pipelines[0].id);
    }
  }, [pipelines, selectedPipelineId]);

  const isLoading = loadingForecast || loadingKpis || loadingSales;

  // ========== DERIVED DATA ==========

  const totalDeals = useMemo(() => {
    if (!forecast?.months) return 0;
    return forecast.months.reduce((sum, m) => sum + m.deals.length, 0);
  }, [forecast?.months]);

  // Merge receita real + forecast por mes para ComposedChart
  const revenueVsForecastData = useMemo(() => {
    const map = {};
    (kpis?.revenueByMonth || []).forEach(m => {
      map[m.month] = { ...map[m.month], monthKey: m.month, month: getMonthShort(m.month), actual: m.value };
    });
    (forecast?.months || []).forEach(m => {
      if (m.month !== 'sem_data') {
        map[m.month] = { ...map[m.month], monthKey: m.month, month: getMonthShort(m.month), forecast: m.weightedValue };
      }
    });
    return Object.values(map).sort((a, b) => (a.monthKey || '').localeCompare(b.monthKey || ''));
  }, [kpis?.revenueByMonth, forecast?.months]);

  // Dados para BarChart triple
  const monthlyBarData = useMemo(() => {
    const map = {};
    const revenueMap = {};
    (kpis?.revenueByMonth || []).forEach(m => { revenueMap[m.month] = m.value; });
    (forecast?.months || []).forEach(m => {
      if (m.month !== 'sem_data') {
        map[m.month] = {
          month: getMonthShort(m.month),
          monthKey: m.month,
          total: m.totalValue,
          weighted: m.weightedValue,
          actual: revenueMap[m.month] || 0,
        };
      }
    });
    // Adicionar meses que tem receita real mas nao tem forecast
    Object.entries(revenueMap).forEach(([key, val]) => {
      if (!map[key]) {
        map[key] = { month: getMonthShort(key), monthKey: key, total: 0, weighted: 0, actual: val };
      }
    });
    return Object.values(map).sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [forecast?.months, kpis?.revenueByMonth]);

  // Donut data
  const donutData = useMemo(() => {
    if (!funnel?.stages) return [];
    return funnel.stages.filter(s => s.totalValue > 0).map((s, i) => ({
      name: s.name,
      value: s.totalValue,
      count: s.count,
      fill: s.color || stageColors[i % stageColors.length],
    }));
  }, [funnel?.stages]);

  const donutTotal = useMemo(() => donutData.reduce((sum, d) => sum + d.value, 0), [donutData]);

  // Stage breakdown com barras proporcionais
  const stageBreakdown = useMemo(() => {
    if (!funnel?.stages?.length) return [];
    const maxVal = Math.max(...funnel.stages.map(s => s.totalValue), 1);
    const convMap = {};
    (funnel.conversionRates || []).forEach(c => { convMap[c.to] = c.rate; });
    return funnel.stages.map((s, i) => ({
      ...s,
      color: s.color || stageColors[i % stageColors.length],
      widthPercent: Math.round((s.totalValue / maxVal) * 100),
      conversionRate: convMap[s.name],
    }));
  }, [funnel?.stages, funnel?.conversionRates]);

  if (isLoading) return (
    <div>
      <CrmPageHeader title="Forecast Financeiro" subtitle="Analise completa de pipeline, previsao e receita" />
      <ForecastSkeleton />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* A) HEADER */}
      <CrmPageHeader
        title="Forecast Financeiro"
        subtitle="Analise completa de pipeline, previsao e receita"
        actions={
          <div className="flex items-center gap-2">
            {pipelines?.length > 0 && (
              <select
                value={selectedPipelineId || ''}
                onChange={(e) => setSelectedPipelineId(e.target.value)}
                className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-fyness-primary"
              >
                {pipelines.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-fyness-primary"
            >
              {PERIOD_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        }
      />

      {/* B) KPI CARDS — 8 cards, 4 colunas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CrmKpiCard
          title="Pipeline Total"
          value={formatCurrency(forecast?.totalPipeline)}
          subtitle="valor bruto dos deals abertos"
          icon={DollarSign}
          color="violet"
        />
        <CrmKpiCard
          title="Receita Ponderada"
          value={formatCurrency(forecast?.totalWeighted)}
          subtitle="ajustado por probabilidade"
          icon={TrendingUp}
          color="emerald"
        />
        <CrmKpiCard
          title="Receita Real"
          value={formatCurrency(sales?.won?.totalValue)}
          subtitle={`${sales?.won?.count || 0} deal${(sales?.won?.count || 0) !== 1 ? 's' : ''} ganho${(sales?.won?.count || 0) !== 1 ? 's' : ''}`}
          icon={DollarSign}
          color="green"
          trend={forecast?.totalWeighted > 0 ? {
            value: `${Math.round(((sales?.won?.totalValue || 0) / forecast.totalWeighted) * 100)}% do previsto`,
            up: (sales?.won?.totalValue || 0) >= forecast.totalWeighted * 0.7,
          } : undefined}
        />
        <CrmKpiCard
          title="Deals Abertos"
          value={totalDeals}
          subtitle={`em ${forecast?.months?.length || 0} periodo${(forecast?.months?.length || 0) !== 1 ? 's' : ''}`}
          icon={Target}
          color="sky"
        />
        <CrmKpiCard
          title="Ticket Medio"
          value={formatCurrency(sales?.avgDealValue)}
          subtitle="valor medio por deal ganho"
          icon={Receipt}
          color="blue"
        />
        <CrmKpiCard
          title="Tempo Medio"
          value={`${sales?.avgCloseTimeDays || 0} dias`}
          subtitle="para fechar um deal"
          icon={Clock}
          color="amber"
        />
        <CrmKpiCard
          title="Taxa de Conversao"
          value={`${sales?.conversionRate || 0}%`}
          subtitle="ganhos / total fechados"
          icon={Percent}
          color="orange"
        />
        <CrmKpiCard
          title="Deals Perdidos"
          value={formatCurrency(sales?.lost?.totalValue)}
          subtitle={`${sales?.lost?.count || 0} deal${(sales?.lost?.count || 0) !== 1 ? 's' : ''} perdido${(sales?.lost?.count || 0) !== 1 ? 's' : ''}`}
          icon={TrendingDown}
          color="rose"
        />
      </div>

      {/* C) CHARTS ROW 1 — 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* C1 — ComposedChart: Receita Real vs Forecast */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Receita Real vs Forecast
          </h3>
          {revenueVsForecastData.length === 0 ? (
            <div className="h-72 flex items-center justify-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">Sem dados para comparacao</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={revenueVsForecastData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={50} />
                <Tooltip content={<RevenueVsForecastTooltip />} />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={8} />
                <Area type="monotone" dataKey="actual" name="Receita Real" stroke="#10b981" strokeWidth={2.5} fill="url(#actualGradient)" dot={false} activeDot={{ r: 4, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="forecast" name="Forecast" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="6 3" dot={false} activeDot={{ r: 4, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* C2 — Donut: Valor por Estagio */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Valor por Estagio do Pipeline
          </h3>
          {donutData.length === 0 ? (
            <div className="h-72 flex items-center justify-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum deal no pipeline</p>
            </div>
          ) : (
            <div className="relative">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {donutData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<StageDonutTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
              {/* Centro do donut */}
              <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatCurrency(donutTotal)}</div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* D) BARCHART FULL-WIDTH — Mensal: Total vs Ponderado vs Real */}
      {monthlyBarData.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Comparativo Mensal: Pipeline vs Forecast vs Receita
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyBarData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v} width={50} />
              <Tooltip content={<MonthlyBarTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} iconType="circle" iconSize={8} />
              <Bar name="Pipeline Total" dataKey="total" fill="#94a3b8" fillOpacity={0.35} radius={[4, 4, 0, 0]} barSize={20} />
              <Bar name="Forecast Ponderado" dataKey="weighted" fill="#8b5cf6" fillOpacity={0.75} radius={[4, 4, 0, 0]} barSize={20} />
              <Bar name="Receita Real" dataKey="actual" fill="#10b981" fillOpacity={0.85} radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* E) BREAKDOWN POR ESTAGIO */}
      {stageBreakdown.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Distribuicao por Estagio do Pipeline
          </h3>
          <div className="space-y-3">
            {stageBreakdown.map((stage) => (
              <div key={stage.id} className="flex items-center gap-4">
                {/* Stage name */}
                <div className="w-28 shrink-0">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{stage.name}</div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    {stage.count} deal{stage.count !== 1 ? 's' : ''}
                    {stage.conversionRate != null && ` · ${stage.conversionRate}%`}
                  </div>
                </div>

                {/* Bar */}
                <div className="flex-1 h-7 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full rounded-lg transition-all duration-500"
                    style={{ width: `${Math.max(stage.widthPercent, 2)}%`, backgroundColor: stage.color }}
                  />
                  {stage.widthPercent > 15 && (
                    <span className="absolute inset-0 flex items-center pl-3 text-[11px] font-bold text-white drop-shadow-sm">
                      {formatCurrency(stage.totalValue)}
                    </span>
                  )}
                </div>

                {/* Value (when bar is too small) */}
                {stage.widthPercent <= 15 && (
                  <div className="w-24 text-right shrink-0">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(stage.totalValue)}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* F) INTELIGENCIA DE CONVERSAO */}
      {learned?.stages?.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Brain size={18} className="text-violet-600 dark:text-violet-400" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Inteligencia de Conversao
              </h3>
              <span className="text-[10px] bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full font-medium">
                Aprendido
              </span>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setLearnedScope('pipeline')}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                  learnedScope === 'pipeline'
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Pipeline
              </button>
              <button
                onClick={() => setLearnedScope('all')}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                  learnedScope === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                Todas Pipelines
              </button>
            </div>
          </div>

          {/* KPI resumo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Conversao Real</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{learned.overallConversion}%</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Media Vendedores</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{learned.avgProbabilityVendor}%</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Deals Ganhos</div>
              <div className="text-lg font-bold text-slate-700 dark:text-slate-200">{learned.totalWon}</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-0.5">Deals Perdidos</div>
              <div className="text-lg font-bold text-slate-700 dark:text-slate-200">{learned.totalLost}</div>
            </div>
          </div>

          {/* Cards por estagio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            {learned.stages.map((stage) => {
              const probColor = stage.learnedProbability >= 60
                ? 'text-emerald-600 dark:text-emerald-400'
                : stage.learnedProbability >= 30
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-rose-600 dark:text-rose-400';
              const barColor = stage.learnedProbability >= 60
                ? 'bg-emerald-500'
                : stage.learnedProbability >= 30
                  ? 'bg-amber-500'
                  : 'bg-rose-500';
              const lowData = stage.sampleSize < 10;

              return (
                <div key={stage.position} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">{stage.name}</span>
                  </div>

                  {/* % Aprendido */}
                  <div className={`text-2xl font-bold ${probColor} mb-1`}>
                    {stage.learnedProbability}%
                  </div>

                  {/* Barra de progresso */}
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                    <div className={`h-full rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${stage.learnedProbability}%` }} />
                  </div>

                  {/* vs Vendedores */}
                  {stage.avgVendorProbability != null && (
                    <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 mb-1">
                      <span>Vendedores: {stage.avgVendorProbability}%</span>
                      {stage.avgVendorProbability !== stage.learnedProbability && (
                        <span className={stage.avgVendorProbability > stage.learnedProbability ? 'text-rose-500' : 'text-emerald-500'}>
                          {stage.avgVendorProbability > stage.learnedProbability ? 'otimista' : 'conservador'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Sample size + aviso */}
                  <div className="flex items-center gap-1 mt-2">
                    {lowData && <AlertTriangle size={10} className="text-amber-500 shrink-0" />}
                    <span className={`text-[10px] ${lowData ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`}>
                      {lowData ? `${stage.sampleSize} deals — poucos dados` : `${stage.sampleSize} deals analisados`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-3">
            Taxas calculadas automaticamente com base no historico de deals ganhos e perdidos por estagio.
          </p>
        </div>
      )}

      {/* G) ACCORDION DE DEALS POR MES */}
      {forecast?.months?.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Detalhamento por Periodo
          </h3>
          <div className="space-y-3">
            {forecast.months.map((m) => (
              <MonthSection key={m.month} monthData={m} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CrmForecastPage;

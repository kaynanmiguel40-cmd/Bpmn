/**
 * CrmDashboardPage - Dashboard principal do CRM.
 *
 * Consome useCrmDashboardKPIs() e exibe:
 * - Saudacao com data
 * - 6 KPI Cards
 * - Grafico de barras horizontais (Negocios por Estagio)
 * - AreaChart de receita mensal (12 meses)
 * - Lista de deals vencendo esta semana
 * - Timeline de atividades recentes
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, BarChart, Bar, Cell, ComposedChart, Line, Legend,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  CheckSquare,
  ChevronRight,
  AlertTriangle,
  Zap,
  Globe,
  User,
  Users,
  Flame,
  Sprout,
  XCircle,
  CalendarCheck,
} from 'lucide-react';
import { CrmPageHeader, CrmKpiCard, CrmAvatar, CrmBadge } from '../components/ui';
import { useCrmDashboardKPIs, useCrmGoals, useGoalsProgress, useBonificacaoProgress } from '../hooks/useCrmQueries';
import { BonificacaoSection } from '../components/BonificacaoSection';
import { useProfile } from '../../../hooks/useProfile';

// ==================== HELPERS ====================

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val || 0);

const formatCurrencyFull = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const formatNumber = (val) =>
  new Intl.NumberFormat('pt-BR').format(val || 0);

const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

function getMonthLabel(monthKey) {
  if (!monthKey || monthKey === 'sem_data') return '?';
  const parts = monthKey.split('-');
  const idx = parseInt(parts[1], 10) - 1;
  return monthNames[idx] || parts[1];
}

function getDaysRemaining(dateStr) {
  if (!dateStr) return 999;
  const now = new Date();
  const date = new Date(dateStr);
  return Math.max(0, Math.ceil((date - now) / 86400000));
}

// Estilo por tipo de item no painel "Precisa de Atencao Hoje".
const attentionMeta = {
  overdue_activity: {
    icon: Clock,
    fg: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
  },
  overdue_close: {
    icon: AlertTriangle,
    fg: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
  },
  stale_deal: {
    icon: TrendingDown,
    fg: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-slate-100 dark:bg-slate-800',
  },
};

// Stage bar colors
const stageColors = ['#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb923c', '#34d399', '#38bdf8'];

// ==================== SKELETON ====================

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header: saudacao + filtro de periodo */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-9 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>

      {/* KPI grid — 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
            <div className="h-7 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="flex items-center gap-2">
              <div className="h-3 w-10 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Funil + Receita Mensal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
          <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className="h-72 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>

      {/* Deals Vencendo + Precisa Atencao */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="h-3 w-12 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(j => (
                <div key={j} className="flex items-center gap-3 py-2">
                  <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-2.5 w-1/2 bg-slate-100 dark:bg-slate-800 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== CHART TOOLTIPS ====================

const REVENUE_SERIES_META = {
  realizado: { label: 'Realizado', color: '#10b981' },
  previsto:  { label: 'Previsto',  color: '#f59e0b' },
  projetado: { label: 'Projetado', color: '#6366f1' },
};

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg px-3 py-2 min-w-[180px]">
      <p className="text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map(p => {
        const meta = REVENUE_SERIES_META[p.dataKey] || { label: p.dataKey, color: p.color };
        return (
          <div key={p.dataKey} className="flex items-center justify-between gap-3 text-xs py-0.5">
            <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />
              {meta.label}
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-100">{formatCurrencyFull(p.value)}</span>
          </div>
        );
      })}
    </div>
  );
}

function StageTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg px-3 py-2 min-w-[200px]">
      <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{data.stageName}</p>
      <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">{data.conversionFromTop}%</p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">do topo do funil</p>
      <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {data.count} negocio{data.count !== 1 ? 's' : ''} · {formatCurrency(data.value)}
        </p>
        {typeof data.conversion === 'number' && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {data.conversion}% vs etapa anterior
          </p>
        )}
      </div>
    </div>
  );
}

// ==================== PERIOD HELPERS ====================

const PERIOD_OPTIONS = [
  { value: 'month', label: 'Mes Atual' },
  { value: 'last_month', label: 'Mes Anterior' },
  { value: 'last_30', label: 'Ultimos 30 dias' },
  { value: 'quarter', label: 'Trimestre' },
  { value: 'year', label: 'Ano' },
];

function getPeriodLabel(value) {
  return PERIOD_OPTIONS.find(o => o.value === value)?.label || 'Periodo';
}

function getPeriodRange(period) {
  const now = new Date();
  let start, end;
  switch (period) {
    case 'last_month':
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'last_30':
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      end = now;
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
    default: // month
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
  }
  return { start: start.toISOString(), end: end.toISOString() };
}

// ==================== GOAL HEALTH ====================

function getGoalHealth(goal, currentProgress) {
  if (goal.status !== 'active' || !goal.periodStart || !goal.periodEnd || goal.targetValue <= 0) {
    return null;
  }
  const now = new Date();
  const start = new Date(goal.periodStart + 'T00:00:00');
  const end = new Date(goal.periodEnd + 'T00:00:00');
  if (now < start) return null;

  const totalDays = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.min(totalDays, (now - start) / (1000 * 60 * 60 * 24));
  const timePercent = elapsedDays / totalDays;
  const expectedProgress = goal.targetValue * timePercent;
  const ritmo = expectedProgress > 0 ? currentProgress / expectedProgress : 0;

  if (ritmo < 0.6) return { label: 'Apertada', color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-50 dark:bg-rose-900/20', barColor: 'bg-rose-500', icon: AlertTriangle };
  if (ritmo < 0.85) return { label: 'Atencao', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20', barColor: 'bg-amber-500', icon: TrendingDown };
  if (ritmo <= 1.3) return { label: 'No Ritmo', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', barColor: 'bg-emerald-500', icon: TrendingUp };
  return { label: 'Meta Leve', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20', barColor: 'bg-blue-500', icon: Zap };
}

// ==================== MAIN COMPONENT ====================

export function CrmDashboardPage() {
  const [period, setPeriod] = useState('month');
  const range = useMemo(() => getPeriodRange(period), [period]);
  const { data: kpis, isLoading } = useCrmDashboardKPIs(range);
  const { profile } = useProfile();
  const periodLabel = getPeriodLabel(period);

  // Metas ativas
  const { data: goalsData } = useCrmGoals({ status: 'active' });
  const activeGoals = useMemo(() => goalsData?.data || [], [goalsData]);
  const { data: progressMap = {} } = useGoalsProgress(activeGoals);

  // Bonificacao Ouro/Prata/Bronze do periodo
  const { data: bonificacao = [], isLoading: bonificacaoLoading } = useBonificacaoProgress(range.start, range.end);

  // Dados formatados para o ComposedChart de receita (3 series)
  const revenueChartData = useMemo(() => {
    return (kpis?.revenueByMonth || []).map(m => ({
      month: getMonthLabel(m.month),
      realizado: m.realizado ?? m.value ?? 0,
      previsto:  m.previsto ?? 0,
      projetado: m.projetado ?? 0,
    }));
  }, [kpis?.revenueByMonth]);

  const hasGoalsForChart = useMemo(
    () => revenueChartData.some(m => m.projetado > 0),
    [revenueChartData],
  );

  // Dados formatados para o FunnelChart (pipeline default, stages em ordem
  // de posicao). Ja vem com conversion e conversionFromTop pre-calculados.
  const funnelChartData = useMemo(() => {
    return (kpis?.funnel || []).map((s, i) => ({
      ...s,
      fill: stageColors[i % stageColors.length],
    }));
  }, [kpis?.funnel]);

  // Data de hoje
  const todayStr = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header + Saudacao + Filtro de Periodo */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Ola, {profile.name || 'Voce'} 👋
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
            {todayStr}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Periodo:
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary/40"
          >
            {PERIOD_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards — operacional (linha 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CrmKpiCard
          title="Total Leads"
          value={formatNumber(kpis?.totalLeads)}
          subtitle={`${formatNumber(kpis?.activeOpenDeals)} em negociacao`}
          icon={Users}
          color="blue"
        />
        <CrmKpiCard
          title="Deals Abertos"
          value={formatNumber(kpis?.activeOpenDeals)}
          subtitle={`${formatNumber(kpis?.totalLostLeads)} perdidos no total`}
          icon={Target}
          color="emerald"
        />
        <CrmKpiCard
          title="Negociacoes Quentes"
          value={formatNumber(kpis?.hotDeals)}
          subtitle={`${formatCurrency(kpis?.hotDealsValue)} fechando em 30d`}
          icon={Flame}
          color="orange"
        />
        <CrmKpiCard
          title="Leads em Nutricao"
          value={formatNumber(kpis?.nurturingLeads)}
          subtitle={`${formatCurrency(kpis?.nurturingValue)} em pipeline Nurturing`}
          icon={Sprout}
          color="violet"
        />
      </div>

      {/* KPI Cards — financeiro (linha 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <CrmKpiCard
          title="Valor Negociacoes Ativas"
          value={formatCurrency(kpis?.activeDealsValue)}
          subtitle="open, exceto Nurturing"
          icon={DollarSign}
          color="emerald"
        />
        <CrmKpiCard
          title="Receita"
          value={formatCurrency(kpis?.periodRevenue)}
          subtitle={`vs ${periodLabel.toLowerCase()} anterior`}
          trend={kpis?.trends?.revenue}
          icon={TrendingUp}
          color="green"
        />
        <CrmKpiCard
          title="Taxa de Conversao"
          value={`${kpis?.conversionRate || 0}%`}
          subtitle={`vs ${periodLabel.toLowerCase()} anterior`}
          trend={kpis?.trends?.conversion}
          icon={Target}
          color="amber"
        />
        <CrmKpiCard
          title="Leads Perdidos"
          value={formatNumber(kpis?.periodLostLeads)}
          subtitle={`${periodLabel.toLowerCase()}`}
          trend={kpis?.trends?.lostLeads}
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Reunioes Marcadas — destaque */}
      <Link
        to="/crm/activities"
        className="block bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 hover:shadow-md transition-shadow group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0">
            <CalendarCheck size={22} className="text-sky-600 dark:text-sky-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
              Reunioes marcadas
            </div>
            <div className="flex items-baseline gap-4 flex-wrap">
              <span>
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatNumber(kpis?.meetingsToday)}</span>
                <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">hoje</span>
              </span>
              <span>
                <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{formatNumber(kpis?.meetingsWeek)}</span>
                <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">semana</span>
              </span>
            </div>
          </div>
          <ChevronRight size={18} className="text-slate-300 dark:text-slate-600 shrink-0 group-hover:text-fyness-primary" />
        </div>
      </Link>

      {/* Progresso de Bonificacao (Ouro/Prata/Bronze) */}
      <BonificacaoSection rows={bonificacao} loading={bonificacaoLoading} />

      {/* Progresso das Metas */}
      {activeGoals.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-emerald-500" />
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Metas Ativas
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {activeGoals.map((goal) => {
              const autoValue = progressMap[goal.id]?.autoValue || 0;
              const totalProgress = autoValue + (goal.currentValue || 0);
              const percent = goal.targetValue > 0 ? Math.min(100, Math.round((totalProgress / goal.targetValue) * 100)) : 0;
              const health = getGoalHealth(goal, totalProgress);
              const barColor = health?.barColor || 'bg-blue-500';
              const IsTypeIcon = goal.type === 'global' ? Globe : User;

              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <IsTypeIcon size={14} className="text-slate-400 shrink-0" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
                        {goal.title}
                      </span>
                      {goal.owner && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 truncate hidden sm:inline">
                          — {goal.owner.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {health && (
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${health.color} ${health.bgColor}`}>
                          <health.icon size={11} />
                          {health.label}
                        </div>
                      )}
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                        {percent}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {formatCurrency(totalProgress)} / {formatCurrency(goal.targetValue)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Charts — 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* % por Estagio — bar chart horizontal */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              % por Estagio de Negociacao
            </h3>
            {kpis?.funnelPipelineName && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {kpis.funnelPipelineName}
              </span>
            )}
          </div>
          {funnelChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum dado de pipeline</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(funnelChartData.length * 36, 280)}>
              <BarChart
                data={funnelChartData}
                layout="vertical"
                margin={{ top: 8, right: 50, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148,163,184,0.15)" />
                <XAxis
                  type="number"
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="stageName"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                  width={140}
                />
                <Tooltip content={<StageTooltip />} />
                <Bar dataKey="conversionFromTop" radius={[0, 4, 4, 0]} barSize={18}>
                  {funnelChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Receita Mensal — Realizado vs Previsto vs Projetado */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Receita Mensal
            </h3>
            {!hasGoalsForChart && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                sem metas no periodo
              </span>
            )}
          </div>
          {revenueChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum dado de receita</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="realizadoGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148,163,184,0.15)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}
                  width={50}
                />
                <Tooltip content={<RevenueTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={(value) => REVENUE_SERIES_META[value]?.label || value}
                />
                <Area
                  type="monotone"
                  dataKey="realizado"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="url(#realizadoGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
                />
                {hasGoalsForChart && (
                  <Line
                    type="monotone"
                    dataKey="previsto"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={false}
                    activeDot={{ r: 4, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                  />
                )}
                {hasGoalsForChart && (
                  <Line
                    type="monotone"
                    dataKey="projetado"
                    stroke="#6366f1"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                  />
                )}
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom row — Deals vencendo + Atividades recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Deals Vencendo Esta Semana */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Deals Vencendo Esta Semana
            </h3>
            {(kpis?.dealsClosingSoonList || []).length > 5 && (
              <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
                Ver todos <ChevronRight size={12} />
              </button>
            )}
          </div>

          {(kpis?.dealsClosingSoonList || []).length === 0 ? (
            <div className="py-8 text-center">
              <Clock size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum deal vencendo esta semana</p>
            </div>
          ) : (
            <div className="space-y-1">
              {(kpis?.dealsClosingSoonList || []).slice(0, 5).map((deal) => {
                const daysLeft = getDaysRemaining(deal.expectedCloseDate);
                const urgencyVariant = daysLeft < 3 ? 'danger' : 'warning';
                return (
                  <div
                    key={deal.id}
                    className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                  >
                    <CrmAvatar name={deal.contact?.name || deal.title} size="sm" color={deal.contact?.avatarColor} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {deal.title}
                      </div>
                      <div className="text-xs text-slate-400 dark:text-slate-500 truncate">
                        {deal.contact?.name || deal.company || ''}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {formatCurrency(deal.value)}
                      </div>
                      <CrmBadge variant={urgencyVariant} size="sm">
                        {daysLeft === 0 ? 'Hoje' : daysLeft === 1 ? 'Amanha' : `${daysLeft}d`}
                      </CrmBadge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Precisa de Atencao Hoje — itens acionaveis */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Precisa de Atencao Hoje
            </h3>
            {(kpis?.attentionItems || []).length > 0 && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {(kpis?.attentionItems || []).length} item{(kpis?.attentionItems || []).length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {(kpis?.attentionItems || []).length === 0 ? (
            <div className="py-8 text-center">
              <CheckSquare size={32} className="mx-auto text-emerald-400 dark:text-emerald-500 mb-2" />
              <p className="text-sm text-slate-400 dark:text-slate-500">Tudo em dia. Bora pra proxima.</p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {(kpis?.attentionItems || []).map((item) => {
                const meta = attentionMeta[item.kind] || attentionMeta.stale_deal;
                const Icon = meta.icon;
                const link = item.dealId ? `/crm/deals/${item.dealId}` : '/crm/activities';
                return (
                  <Link
                    key={item.id}
                    to={link}
                    className="flex items-start gap-3 py-2 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-full ${meta.bg} flex items-center justify-center shrink-0`}>
                      <Icon size={14} className={meta.fg} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-fyness-primary">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[11px] font-medium ${meta.fg}`}>
                          {item.reason}
                        </span>
                        {(item.companyName || item.contactName) && (
                          <>
                            <span className="text-slate-300 dark:text-slate-600 text-[11px]">·</span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {item.companyName || item.contactName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    {typeof item.value === 'number' && item.value > 0 && (
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0 pt-0.5">
                        {formatCurrency(item.value)}
                      </span>
                    )}
                    <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 shrink-0 mt-1 group-hover:text-fyness-primary" />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CrmDashboardPage;

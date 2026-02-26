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

import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, Cell,
} from 'recharts';
import {
  Users,
  Handshake,
  DollarSign,
  TrendingUp,
  Target,
  Clock,
  Phone,
  Mail,
  Video,
  CheckSquare,
  Coffee,
  MapPin,
  ChevronRight,
} from 'lucide-react';
import { CrmPageHeader, CrmKpiCard, CrmAvatar, CrmBadge } from '../components/ui';
import { useCrmDashboardKPIs } from '../hooks/useCrmQueries';

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

function getRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `ha ${diffMin}min`;
  if (diffH < 24) return `ha ${diffH}h`;
  if (diffD === 1) return 'ontem';
  if (diffD < 7) return `ha ${diffD} dias`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function getDaysRemaining(dateStr) {
  if (!dateStr) return 999;
  const now = new Date();
  const date = new Date(dateStr);
  return Math.max(0, Math.ceil((date - now) / 86400000));
}

const activityTypeIcons = {
  call: Phone,
  email: Mail,
  meeting: Video,
  task: CheckSquare,
  follow_up: Coffee,
  visit: MapPin,
};

const activityTypeColors = {
  call: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
  email: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  meeting: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400',
  task: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
  follow_up: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  visit: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400',
};

// Stage bar colors
const stageColors = ['#818cf8', '#a78bfa', '#c084fc', '#e879f9', '#f472b6', '#fb923c', '#34d399', '#38bdf8'];

// ==================== SKELETON ====================

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Greeting skeleton */}
      <div className="space-y-2">
        <div className="h-7 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
              <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            </div>
            <div className="h-7 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
            <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
          <div className="h-64 bg-slate-100 dark:bg-slate-800 rounded-lg" />
        </div>
      </div>

      {/* Bottom cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== CHART TOOLTIPS ====================

function RevenueTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{label}</p>
      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatCurrencyFull(payload[0].value)}</p>
    </div>
  );
}

function StageTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-medium text-slate-700 dark:text-slate-200">{data.stageName}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400">{data.count} negocios</p>
      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(data.value)}</p>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export function CrmDashboardPage() {
  const { data: kpis, isLoading } = useCrmDashboardKPIs();

  // Dados formatados para o AreaChart
  const revenueChartData = useMemo(() => {
    return (kpis?.revenueByMonth || []).map(m => ({
      month: getMonthLabel(m.month),
      value: m.value,
    }));
  }, [kpis?.revenueByMonth]);

  // Dados formatados para o BarChart horizontal
  const stageChartData = useMemo(() => {
    return (kpis?.dealsByStage || []).map((s, i) => ({
      ...s,
      fill: stageColors[i % stageColors.length],
    }));
  }, [kpis?.dealsByStage]);

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
      {/* Header + Saudacao */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
          Ola, Kaynan 👋
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
          {todayStr}
        </p>
      </div>

      {/* KPI Cards — 3 colunas desktop, 2 tablet, 1 mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <CrmKpiCard
          title="Total de Contatos"
          value={formatNumber(kpis?.totalContacts)}
          subtitle="contatos ativos"
          icon={Users}
          color="sky"
          loading={false}
        />
        <CrmKpiCard
          title="Deals Abertos"
          value={formatNumber(kpis?.openDeals)}
          subtitle={`${kpis?.dealsClosingSoon || 0} vencem esta semana`}
          icon={Handshake}
          color="violet"
          loading={false}
        />
        <CrmKpiCard
          title="Valor do Pipeline"
          value={formatCurrency(kpis?.pipelineValue)}
          subtitle="em negociacao"
          icon={DollarSign}
          color="emerald"
          loading={false}
        />
        <CrmKpiCard
          title="Receita do Mes"
          value={formatCurrency(kpis?.monthRevenue)}
          subtitle="deals ganhos"
          icon={TrendingUp}
          color="green"
          loading={false}
        />
        <CrmKpiCard
          title="Taxa de Conversao"
          value={`${kpis?.conversionRate || 0}%`}
          subtitle="ganhos / total fechados"
          icon={Target}
          color="amber"
          loading={false}
        />
        <CrmKpiCard
          title="Atividades Pendentes"
          value={formatNumber(kpis?.pendingActivities)}
          subtitle="a realizar"
          icon={Clock}
          color="orange"
          loading={false}
        />
      </div>

      {/* Charts — 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Negocios por Estagio — BarChart horizontal */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Negocios por Estagio
          </h3>
          {stageChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum dado de pipeline</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(stageChartData.length * 48, 200)}>
              <BarChart data={stageChartData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(148,163,184,0.15)" />
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="stageName"
                  width={110}
                  tick={{ fontSize: 12, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<StageTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                <Bar
                  dataKey="count"
                  radius={[0, 6, 6, 0]}
                  barSize={24}
                  isAnimationActive={true}
                >
                  {stageChartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Receita Mensal — AreaChart com gradient */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Receita Mensal
          </h3>
          {revenueChartData.length === 0 ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum dado de receita</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
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
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#revenueGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
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
              <button className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5">
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
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
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

        {/* Atividades Recentes — Timeline */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
            Atividades Recentes
          </h3>

          {(kpis?.recentActivities || []).length === 0 ? (
            <div className="py-8 text-center">
              <CheckSquare size={32} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p className="text-sm text-slate-400 dark:text-slate-500">Nenhuma atividade recente</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[15px] top-3 bottom-3 w-px bg-slate-200 dark:bg-slate-700/50" />

              <div className="space-y-0.5">
                {(kpis?.recentActivities || []).slice(0, 8).map((act, idx) => {
                  const Icon = activityTypeIcons[act.type] || CheckSquare;
                  const colorClass = activityTypeColors[act.type] || activityTypeColors.task;
                  return (
                    <div key={act.id} className="flex items-start gap-3 py-2 pl-0 relative">
                      {/* Icon dot */}
                      <div className={`w-[30px] h-[30px] rounded-full ${colorClass} flex items-center justify-center shrink-0 z-10 ring-2 ring-white dark:ring-slate-900`}>
                        <Icon size={13} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-800 dark:text-slate-200 font-medium truncate">
                            {act.title}
                          </span>
                          {act.completed && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Concluida" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {act.contact?.name && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {act.contact.name}
                            </span>
                          )}
                          {!act.contact?.name && act.deal?.title && (
                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {act.deal.title}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Time */}
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 pt-1">
                        {getRelativeTime(act.startDate)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CrmDashboardPage;

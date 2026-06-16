/**
 * CrmDashboardPage - Dashboard principal do CRM (Soft Depth / Glass).
 *
 * Consome useCrmDashboardKPIs() e exibe:
 * - Saudacao com data
 * - 8 KPI Cards (operacional + financeiro)
 * - Reunioes marcadas, bonificacao, metas ativas
 * - Grafico de % por estagio + receita mensal (3 series)
 * - Deals vencendo + itens que precisam de atencao
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
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
  DollarSign,
  Phone,
} from 'lucide-react';
import { CrmKpiCard, CrmAvatar, CrmBadge, CrmPanel } from '../components/ui';
import { useCrmDashboardKPIs, useCrmGoals, useGoalsProgress } from '../hooks/useCrmQueries';
import { useProfile } from '../../../hooks/useProfile';
import SalesFunnel from '../../../components/dashboard/SalesFunnel';
import { getCrmWorkspaceSettings, saveCrmWorkspaceSettings } from '../lib/workspaceSettings';

// ==================== HELPERS ====================

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val || 0);

const formatCurrencyFull = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

const formatNumber = (val) =>
  new Intl.NumberFormat('pt-BR').format(val || 0);

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
    bg: 'bg-rose-500/10',
  },
  overdue_close: {
    icon: AlertTriangle,
    fg: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
  },
  stale_deal: {
    icon: TrendingDown,
    fg: 'text-slate-500 dark:text-slate-400',
    bg: 'bg-slate-500/10',
  },
};

// ==================== SKELETON ====================

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Header: saudacao + filtro de periodo */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-52 bg-slate-200/70 dark:bg-slate-700/70 rounded-lg" />
          <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded" />
        </div>
        <div className="h-10 w-44 bg-slate-200/70 dark:bg-slate-700/70 rounded-xl" />
      </div>

      {/* KPI grid — 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="crm-glass rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="h-3 w-20 bg-slate-200/70 dark:bg-slate-700/70 rounded" />
              <div className="w-10 h-10 bg-slate-200/70 dark:bg-slate-700/70 rounded-xl" />
            </div>
            <div className="h-8 w-24 bg-slate-200/70 dark:bg-slate-700/70 rounded mb-2" />
            <div className="h-3 w-24 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map(i => (
          <div key={i} className="crm-glass rounded-2xl p-5">
            <div className="h-4 w-36 bg-slate-200/70 dark:bg-slate-700/70 rounded mb-4" />
            <div className="h-72 bg-slate-100/70 dark:bg-slate-800/70 rounded-xl" />
          </div>
        ))}
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

  if (ritmo < 0.6) return { label: 'Apertada', color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-500/10', barColor: 'bg-rose-500', icon: AlertTriangle };
  if (ritmo < 0.85) return { label: 'Atencao', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-500/10', barColor: 'bg-amber-500', icon: TrendingDown };
  if (ritmo <= 1.3) return { label: 'No Ritmo', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-500/10', barColor: 'bg-emerald-500', icon: TrendingUp };
  return { label: 'Meta Leve', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-500/10', barColor: 'bg-blue-500', icon: Zap };
}

// Stat compacto pra usar DENTRO dos paineis (sem glass/sombra propria — nada de
// card flutuante; é um numero ancorado no painel).
const STAT_TONE = {
  slate:   'text-slate-800 dark:text-slate-100',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  blue:    'text-blue-600 dark:text-blue-400',
  sky:     'text-sky-600 dark:text-sky-400',
  amber:   'text-amber-600 dark:text-amber-400',
  rose:    'text-rose-600 dark:text-rose-400',
  violet:  'text-violet-600 dark:text-violet-400',
  orange:  'text-orange-600 dark:text-orange-400',
};

function MiniStat({ label, value, sub, tone = 'slate' }) {
  return (
    <div className="min-w-0">
      <div className={`text-xl sm:text-2xl font-bold tnum leading-none ${STAT_TONE[tone] || STAT_TONE.slate}`}>{value}</div>
      <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-1 truncate">{label}</div>
      {sub && <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{sub}</div>}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export function CrmDashboardPage() {
  const [period, setPeriod] = useState('month');
  const [scope, setScope] = useState('sales'); // 'sales' | 'partners' | 'all'
  const [mrrGoal, setMrrGoal] = useState(() => getCrmWorkspaceSettings().mrrGoalMonthly || 0);
  const [editingMrrGoal, setEditingMrrGoal] = useState(false);
  const [mrrGoalDraft, setMrrGoalDraft] = useState('');
  const range = useMemo(() => getPeriodRange(period), [period]);
  const { data: kpis, isLoading } = useCrmDashboardKPIs(range, scope);
  const { profile } = useProfile();

  // Meta de MRR novo (alvo mensal, guardado nas configs do CRM).
  const mrrPct = mrrGoal > 0 ? Math.min(100, Math.round(((kpis?.periodNewMrr || 0) / mrrGoal) * 100)) : 0;
  const openMrrGoalEditor = () => { setMrrGoalDraft(mrrGoal ? String(mrrGoal) : ''); setEditingMrrGoal(true); };
  const saveMrrGoal = () => {
    const n = Math.max(0, parseFloat(mrrGoalDraft) || 0);
    saveCrmWorkspaceSettings({ mrrGoalMonthly: n });
    setMrrGoal(n);
    setEditingMrrGoal(false);
  };

  // Metas ativas
  const { data: goalsData } = useCrmGoals({ status: 'active' });
  const activeGoals = useMemo(() => goalsData?.data || [], [goalsData]);
  const { data: progressMap = {} } = useGoalsProgress(activeGoals);

  // Data de hoje
  const todayStr = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  if (isLoading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6 crm-stagger">
      {/* Header + Saudacao + Filtro de Periodo */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-[1.65rem] font-bold tracking-tight text-slate-900 dark:text-white">
            Ola, {profile.name || 'Voce'} <span className="inline-block">👋</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 capitalize">
            {todayStr}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="dash-scope" className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Visao
          </label>
          <select
            id="dash-scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="text-sm font-medium bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-glass rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-fyness-primary/40 transition-shadow"
          >
            <option value="sales">Vendas</option>
            <option value="partners">Parceiros</option>
            <option value="all">Geral</option>
          </select>
          <label htmlFor="dash-period" className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">
            Periodo
          </label>
          <select
            id="dash-period"
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-sm font-medium bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-glass rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-fyness-primary/40 transition-shadow"
          >
            {PERIOD_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resultado do Mês — MRR novo (métrica SaaS) */}
      <CrmPanel
        title="Resultado do Mês"
        icon={DollarSign}
        accent="emerald"
        action={
          <button
            type="button"
            onClick={openMrrGoalEditor}
            className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-fyness-primary transition-colors"
          >
            {mrrGoal > 0 ? `Meta: ${formatCurrency(mrrGoal)}/mês ✎` : 'Definir meta de MRR ✎'}
          </button>
        }
      >
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-bold text-slate-900 dark:text-white tnum leading-none">
                {formatCurrency(kpis?.periodNewMrr)}
              </span>
              <span className="text-sm font-medium text-slate-400 dark:text-slate-500">MRR novo</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {formatNumber(kpis?.periodWonDeals)} {(kpis?.periodWonDeals === 1 ? 'cliente novo' : 'clientes novos')} · {formatCurrency(kpis?.periodRevenue)} em contratos
            </p>
          </div>
          {mrrGoal > 0 && (
            <div className="sm:w-72 shrink-0">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400">Meta de MRR</span>
                <span className="font-bold text-slate-700 dark:text-slate-200 tnum">{mrrPct}%</span>
              </div>
              <div className="h-2.5 bg-slate-200/60 dark:bg-slate-800/80 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${mrrPct}%` }} />
              </div>
              <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 tnum">
                {formatCurrency(kpis?.periodNewMrr)} / {formatCurrency(mrrGoal)}
              </div>
            </div>
          )}
        </div>

        {/* Editor inline da meta de MRR */}
        {editingMrrGoal && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400">Meta de MRR novo por mês (R$):</span>
            <input
              type="number"
              min="0"
              step="100"
              autoFocus
              value={mrrGoalDraft}
              onChange={(e) => setMrrGoalDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') saveMrrGoal(); if (e.key === 'Escape') setEditingMrrGoal(false); }}
              className="w-32 px-2 py-1 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
            />
            <button type="button" onClick={saveMrrGoal}
              className="px-2.5 py-1 text-xs font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg">Salvar</button>
            <button type="button" onClick={() => setEditingMrrGoal(false)}
              className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">Cancelar</button>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-200/70 dark:border-slate-700/70">
          <MiniStat label="Ticket médio (contrato)" value={formatCurrency(kpis?.avgTicket)} tone="emerald" />
          <MiniStat label="Win rate" value={`${Math.round(kpis?.conversionRate || 0)}%`} tone="blue" />
          <MiniStat label="Ciclo médio" value={kpis?.avgCycleDays ? `${kpis.avgCycleDays}d` : '—'} tone="violet" />
        </div>
      </CrmPanel>

      {/* Funil de Conversão — atividade -> venda (herói do dashboard comercial) */}
      <SalesFunnel range={range} scope={scope} />

      {/* Ritmo do time + Saúde do pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CrmPanel title="Ritmo do Time" icon={Phone} accent="blue">
          <div className="grid grid-cols-2 gap-x-4 gap-y-5">
            <MiniStat label="Ligações hoje" value={formatNumber(kpis?.callsToday)} tone="blue" />
            <MiniStat label="Ligações · últimos 7d" value={formatNumber(kpis?.callsWeek)} tone="slate" />
            <MiniStat label="Reuniões hoje" value={formatNumber(kpis?.meetingsToday)} tone="sky" />
            <MiniStat label="Reuniões · próx. 7d" value={formatNumber(kpis?.meetingsWeek)} tone="slate" />
          </div>
        </CrmPanel>

        <CrmPanel title="Pipeline" icon={Target} accent="violet">
          <div className="grid grid-cols-3 gap-3">
            <MiniStat
              label="Em negociação"
              value={formatCurrency(kpis?.activeDealsValue)}
              sub={`${formatNumber(kpis?.activeOpenDeals)} deals`}
              tone="violet"
            />
            <MiniStat
              label="Quentes (30d)"
              value={formatNumber(kpis?.hotDeals)}
              sub={formatCurrency(kpis?.hotDealsValue)}
              tone="orange"
            />
            <MiniStat
              label="Perdidos no período"
              value={formatNumber(kpis?.periodLostLeads)}
              tone="rose"
            />
          </div>
        </CrmPanel>
      </div>

      {/* Progresso das Metas */}
      {activeGoals.length > 0 && (
        <CrmPanel title="Metas Ativas" icon={Target} accent="emerald">
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
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100 tnum">
                        {percent}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-slate-200/60 dark:bg-slate-800/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap tnum">
                      {formatCurrency(totalProgress)} / {formatCurrency(goal.targetValue)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CrmPanel>
      )}

      {/* Bottom row — Deals vencendo + Atividades recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Deals Vencendo Esta Semana */}
        <CrmPanel
          title="Deals Vencendo Esta Semana"
          icon={Clock}
          accent="amber"
          action={(kpis?.dealsClosingSoonList || []).length > 5 && (
            <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5">
              Ver todos <ChevronRight size={12} />
            </button>
          )}
        >
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
                    className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition-colors cursor-pointer group"
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
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 tnum">
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
        </CrmPanel>

        {/* Precisa de Atencao Hoje — itens acionaveis */}
        <CrmPanel
          title="Precisa de Atencao Hoje"
          icon={AlertTriangle}
          accent="rose"
          action={(kpis?.attentionItems || []).length > 0 && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              {(kpis?.attentionItems || []).length} item{(kpis?.attentionItems || []).length !== 1 ? 's' : ''}
            </span>
          )}
        >
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
                    className="flex items-start gap-3 py-2 px-2 rounded-xl hover:bg-white/60 dark:hover:bg-white/5 transition-colors group"
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
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 shrink-0 pt-0.5 tnum">
                        {formatCurrency(item.value)}
                      </span>
                    )}
                    <ChevronRight size={14} className="text-slate-300 dark:text-slate-600 shrink-0 mt-1 group-hover:text-fyness-primary" />
                  </Link>
                );
              })}
            </div>
          )}
        </CrmPanel>
      </div>
    </div>
  );
}

export default CrmDashboardPage;

/**
 * CrmGoalsPage - Pagina de Metas de Vendas do CRM.
 *
 * Secao 1: Tabs de status (Ativas / Concluidas / Canceladas)
 * Secao 2: Meta Global (card grande com progresso)
 * Secao 3: Resumo consolidado + Metas Individuais com ranking
 * Inclui busca, ordenacao, metricas extras e badge de saude.
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Trophy,
  Plus,
  Pencil,
  Trash2,
  Globe,
  User,
  Target,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Zap,
  Search,
  X,
  ArrowUpDown,
  Clock,
  CalendarDays,
  Medal,
} from 'lucide-react';
import { CrmPageHeader, CrmBadge, CrmConfirmDialog } from '../components/ui';
import { useCrmGoals, useGoalsProgress, useDeleteCrmGoal } from '../hooks/useCrmQueries';
import { GoalFormModal } from '../components/GoalFormModal';
import CrmForecastPage from './CrmForecastPage';

// ==================== HELPERS ====================

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val || 0);

const STATUS_TABS = [
  { value: 'active', label: 'Ativas', variant: 'info' },
  { value: 'completed', label: 'Concluidas', variant: 'success' },
  { value: 'cancelled', label: 'Canceladas', variant: 'neutral' },
];

const STATUS_MAP = {
  active: { label: 'Ativa', variant: 'info' },
  completed: { label: 'Concluida', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'neutral' },
};

const SORT_OPTIONS = [
  { value: 'progress_desc', label: 'Maior progresso' },
  { value: 'progress_asc', label: 'Menor progresso' },
  { value: 'target_desc', label: 'Maior meta' },
  { value: 'target_asc', label: 'Menor meta' },
  { value: 'name_asc', label: 'Nome A-Z' },
  { value: 'deadline_asc', label: 'Prazo mais proximo' },
];

function formatPeriod(start, end) {
  if (!start || !end) return '';
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const opts = { day: '2-digit', month: 'short' };
  return `${s.toLocaleDateString('pt-BR', opts)} - ${e.toLocaleDateString('pt-BR', opts)}`;
}

function getDaysRemaining(periodEnd) {
  if (!periodEnd) return null;
  const end = new Date(periodEnd + 'T23:59:59');
  const now = new Date();
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function getDailyTarget(remaining, target, current) {
  if (!remaining || remaining <= 0) return null;
  const left = target - current;
  if (left <= 0) return 0;
  return left / remaining;
}

/**
 * Calcula a saude da meta baseado no ritmo (progresso vs tempo decorrido).
 */
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

  const expectedPercent = Math.round(timePercent * 100);
  const actualPercent = Math.round((currentProgress / goal.targetValue) * 100);

  const tooltip = `Tempo: ${expectedPercent}% | Progresso: ${actualPercent}% — Deveria estar em ${formatCurrency(expectedProgress)}`;

  if (ritmo < 0.6) {
    return { label: 'Apertada', color: 'text-rose-600 dark:text-rose-400', bgColor: 'bg-rose-50 dark:bg-rose-900/20', icon: AlertTriangle, tooltip, ritmo };
  }
  if (ritmo < 0.85) {
    return { label: 'Atencao', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-50 dark:bg-amber-900/20', icon: TrendingDown, tooltip, ritmo };
  }
  if (ritmo <= 1.3) {
    return { label: 'No Ritmo', color: 'text-emerald-600 dark:text-emerald-400', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20', icon: TrendingUp, tooltip, ritmo };
  }
  return { label: 'Meta Leve', color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20', icon: Zap, tooltip, ritmo };
}

function HealthBadge({ health }) {
  if (!health) return null;
  const Icon = health.icon;
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${health.color} ${health.bgColor}`}
      title={health.tooltip}>
      <Icon size={12} />
      {health.label}
    </div>
  );
}

function ProgressBar({ current, target, size = 'md' }) {
  const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const hClass = size === 'lg' ? 'h-4' : 'h-2.5';
  const barColor = percent >= 100
    ? 'bg-emerald-500'
    : percent >= 70
      ? 'bg-blue-500'
      : percent >= 40
        ? 'bg-amber-500'
        : 'bg-rose-500';

  return (
    <div className="w-full">
      <div className={`w-full ${hClass} bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden`}>
        <div
          className={`${hClass} ${barColor} rounded-full transition-all duration-500`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

const MEDAL_COLORS = [
  'text-amber-500',    // 1o - ouro
  'text-slate-400',    // 2o - prata
  'text-amber-700',    // 3o - bronze
];

function RankBadge({ rank }) {
  if (rank > 3) {
    return (
      <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-500 dark:text-slate-400">
        {rank}
      </span>
    );
  }
  return (
    <div className={`w-6 h-6 flex items-center justify-center ${MEDAL_COLORS[rank - 1]}`}>
      <Medal size={18} />
    </div>
  );
}

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ==================== SKELETON ====================

function GoalsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-10 w-72 bg-slate-200 dark:bg-slate-700 rounded-lg" />
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2" />
        <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
              <div className="flex-1">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
                <div className="h-3 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            </div>
            <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2" />
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

export function CrmGoalsPage() {
  const [viewTab, setViewTab] = useState(() => {
    try { return localStorage.getItem('crm-goals-view') || 'metas'; } catch { return 'metas'; }
  });
  const switchViewTab = (tab) => {
    setViewTab(tab);
    try { localStorage.setItem('crm-goals-view', tab); } catch {}
  };
  const [statusTab, setStatusTab] = useState('active');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('progress_desc');
  const debouncedSearch = useDebounce(search);

  const { data, isLoading } = useCrmGoals({ status: statusTab });
  const allGoals = data?.data || [];

  const { data: progressMap = {} } = useGoalsProgress(allGoals);

  const deleteMutation = useDeleteCrmGoal();

  const [formOpen, setFormOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formDefaultType, setFormDefaultType] = useState('individual');

  // Filtrar por busca
  const filteredGoals = useMemo(() => {
    if (!debouncedSearch) return allGoals;
    const q = debouncedSearch.toLowerCase();
    return allGoals.filter(g =>
      g.title.toLowerCase().includes(q) ||
      (g.owner?.name || '').toLowerCase().includes(q)
    );
  }, [allGoals, debouncedSearch]);

  // Separar globais e individuais
  const globalGoals = useMemo(() => filteredGoals.filter(g => g.type === 'global'), [filteredGoals]);
  const individualGoals = useMemo(() => filteredGoals.filter(g => g.type === 'individual'), [filteredGoals]);

  // Calcula progresso de uma goal
  const getProgress = useCallback((goal) => {
    const auto = progressMap[goal.id]?.autoValue || 0;
    const manual = goal.currentValue || 0;
    return auto + manual;
  }, [progressMap]);

  // Ordenar e rankear metas individuais
  const rankedGoals = useMemo(() => {
    const withProgress = individualGoals.map(g => {
      const current = getProgress(g);
      const percent = g.targetValue > 0 ? (current / g.targetValue) * 100 : 0;
      return { ...g, _current: current, _percent: percent };
    });

    // Ordenar
    withProgress.sort((a, b) => {
      switch (sortBy) {
        case 'progress_desc': return b._percent - a._percent;
        case 'progress_asc': return a._percent - b._percent;
        case 'target_desc': return b.targetValue - a.targetValue;
        case 'target_asc': return a.targetValue - b.targetValue;
        case 'name_asc': return (a.owner?.name || '').localeCompare(b.owner?.name || '');
        case 'deadline_asc': return (a.periodEnd || '').localeCompare(b.periodEnd || '');
        default: return 0;
      }
    });

    return withProgress;
  }, [individualGoals, sortBy, getProgress]);

  // Resumo consolidado
  const summary = useMemo(() => {
    if (individualGoals.length === 0) return null;
    let totalTarget = 0;
    let totalCurrent = 0;
    let onTrack = 0;
    let behind = 0;
    let achieved = 0;

    individualGoals.forEach(g => {
      const current = getProgress(g);
      const percent = g.targetValue > 0 ? (current / g.targetValue) * 100 : 0;
      totalTarget += g.targetValue;
      totalCurrent += current;

      if (percent >= 100) achieved++;
      else {
        const health = getGoalHealth(g, current);
        if (health && health.ritmo < 0.85) behind++;
        else onTrack++;
      }
    });

    const totalPercent = totalTarget > 0 ? Math.round((totalCurrent / totalTarget) * 100) : 0;
    return { totalTarget, totalCurrent, totalPercent, onTrack, behind, achieved, count: individualGoals.length };
  }, [individualGoals, getProgress]);

  const handleNew = (type = 'individual') => { setEditGoal(null); setFormDefaultType(type); setFormOpen(true); };
  const handleEdit = (goal) => { setEditGoal(goal); setFormOpen(true); };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  useEffect(() => { setSearch(''); }, [statusTab]);

  // Renderizar Forecast em aba separada
  if (viewTab === 'forecast') {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
          <button
            onClick={() => switchViewTab('metas')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Trophy size={13} /> Metas
          </button>
          <button
            onClick={() => switchViewTab('forecast')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
          >
            <TrendingUp size={13} /> Forecast
          </button>
        </div>
        <CrmForecastPage />
      </div>
    );
  }

  if (isLoading) return <GoalsSkeleton />;

  return (
    <div className="space-y-6">
      <CrmPageHeader
        title="Metas & Forecast"
        subtitle={`${allGoals.length} meta${allGoals.length !== 1 ? 's' : ''}`}
        actions={
          <div className="flex items-center gap-2">
            {/* Busca */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar meta..."
                className="pl-8 pr-7 py-1.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-fyness-primary text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>

            <button onClick={() => handleNew()}
              className="flex items-center gap-2 px-4 py-2 bg-fyness-primary hover:bg-fyness-secondary text-white text-sm font-medium rounded-lg transition-colors">
              <Plus size={16} /> Nova Meta
            </button>
          </div>
        }
      />

      {/* Toggle Metas / Forecast */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => switchViewTab('metas')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm"
        >
          <Trophy size={13} /> Metas
        </button>
        <button
          onClick={() => switchViewTab('forecast')}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <TrendingUp size={13} /> Forecast
        </button>
      </div>

      {/* Tabs de status */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-lg w-fit">
        {STATUS_TABS.map(tab => (
          <button
            key={tab.value}
            onClick={() => setStatusTab(tab.value)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              statusTab === tab.value
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Meta Global */}
      {globalGoals.length > 0 ? (
        globalGoals.map((goal) => {
          const current = getProgress(goal);
          const percent = goal.targetValue > 0 ? Math.min(100, Math.round((current / goal.targetValue) * 100)) : 0;
          const health = getGoalHealth(goal, current);
          const daysLeft = getDaysRemaining(goal.periodEnd);
          const dailyTarget = getDailyTarget(daysLeft, goal.targetValue, current);

          return (
            <div key={goal.id}
              className="bg-gradient-to-r from-fyness-primary/10 via-purple-500/5 to-transparent dark:from-blue-900/30 dark:via-purple-900/10 rounded-xl border border-blue-200 dark:border-blue-800/50 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                    <Globe size={20} className="text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{goal.title}</h3>
                      <HealthBadge health={health} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatPeriod(goal.periodStart, goal.periodEnd)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleEdit(goal)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => setDeleteTarget(goal)}
                    className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <ProgressBar current={current} target={goal.targetValue} size="lg" />

              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {formatCurrency(current)}
                  </span>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    de {formatCurrency(goal.targetValue)}
                  </span>
                </div>
                <span className={`text-lg font-bold ${percent >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'}`}>
                  {percent}%
                </span>
              </div>

              {/* Metricas extras da meta global */}
              {statusTab === 'active' && (
                <div className="flex items-center gap-6 mt-4 pt-3 border-t border-blue-200/50 dark:border-blue-800/30">
                  {daysLeft !== null && (
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-400" />
                      <span className={`text-xs font-medium ${daysLeft <= 5 ? 'text-rose-600 dark:text-rose-400' : daysLeft <= 10 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {daysLeft > 0 ? `${daysLeft} dia${daysLeft !== 1 ? 's' : ''} restante${daysLeft !== 1 ? 's' : ''}` : 'Prazo encerrado'}
                      </span>
                    </div>
                  )}
                  {dailyTarget !== null && dailyTarget > 0 && (
                    <div className="flex items-center gap-1.5">
                      <CalendarDays size={13} className="text-slate-400" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">
                        Meta diaria: <span className="font-medium">{formatCurrency(dailyTarget)}</span>
                      </span>
                    </div>
                  )}
                  {current >= goal.targetValue && (
                    <div className="flex items-center gap-1.5">
                      <Trophy size={13} className="text-emerald-500" />
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Meta atingida!</span>
                    </div>
                  )}
                </div>
              )}

              {goal.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{goal.description}</p>
              )}
            </div>
          );
        })
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
          <Globe size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            {statusTab === 'active' ? 'Nenhuma meta global ativa' : `Nenhuma meta global ${statusTab === 'completed' ? 'concluida' : 'cancelada'}`}
          </p>
          {statusTab === 'active' && (
            <button onClick={() => handleNew('global')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              Criar meta global
            </button>
          )}
        </div>
      )}

      {/* Resumo consolidado das metas individuais */}
      {summary && statusTab === 'active' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Soma das Metas</div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatCurrency(summary.totalTarget)}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{summary.count} meta{summary.count !== 1 ? 's' : ''}</div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Progresso Total</div>
            <div className="text-lg font-bold text-slate-800 dark:text-slate-100">{formatCurrency(summary.totalCurrent)}</div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${summary.totalPercent >= 100 ? 'bg-emerald-500' : summary.totalPercent >= 70 ? 'bg-blue-500' : 'bg-amber-500'}`}
                  style={{ width: `${Math.min(100, summary.totalPercent)}%` }} />
              </div>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{summary.totalPercent}%</span>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">No Ritmo</div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{summary.onTrack + summary.achieved}</span>
              {summary.achieved > 0 && (
                <span className="text-xs text-emerald-500">({summary.achieved} atingida{summary.achieved !== 1 ? 's' : ''})</span>
              )}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-4">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wider mb-1">Atrasadas</div>
            <span className={`text-lg font-bold ${summary.behind > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
              {summary.behind}
            </span>
          </div>
        </div>
      )}

      {/* Metas Individuais */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User size={16} className="text-slate-500 dark:text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Metas Individuais</h3>
            <span className="text-xs text-slate-400 dark:text-slate-500">({individualGoals.length})</span>
          </div>

          {individualGoals.length > 1 && (
            <div className="flex items-center gap-1.5">
              <ArrowUpDown size={13} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {rankedGoals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
            <Target size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              {debouncedSearch
                ? 'Nenhuma meta encontrada para esta busca'
                : statusTab === 'active'
                  ? 'Nenhuma meta individual ativa'
                  : `Nenhuma meta individual ${statusTab === 'completed' ? 'concluida' : 'cancelada'}`
              }
            </p>
            {statusTab === 'active' && !debouncedSearch && (
              <button onClick={() => handleNew()}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Criar meta individual
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rankedGoals.map((goal, idx) => {
              const current = goal._current;
              const percent = Math.min(100, Math.round(goal._percent));
              const s = STATUS_MAP[goal.status] || STATUS_MAP.active;
              const health = getGoalHealth(goal, current);
              const daysLeft = getDaysRemaining(goal.periodEnd);
              const dailyTarget = getDailyTarget(daysLeft, goal.targetValue, current);
              const rank = idx + 1;

              return (
                <div key={goal.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 hover:border-blue-300 dark:hover:border-blue-700/50 transition-colors group">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {statusTab === 'active' && sortBy.startsWith('progress') && (
                        <RankBadge rank={rank} />
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {goal.owner?.name || 'Sem responsavel'}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 truncate">
                          {goal.title}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(goal)}
                        className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => setDeleteTarget(goal)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Progress */}
                  <ProgressBar current={current} target={goal.targetValue} />

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {formatCurrency(current)}
                      <span className="text-xs font-normal text-slate-400 dark:text-slate-500 ml-1">
                        / {formatCurrency(goal.targetValue)}
                      </span>
                    </span>
                    <span className={`text-xs font-bold ${percent >= 100 ? 'text-emerald-600' : percent >= 70 ? 'text-blue-600' : 'text-slate-500'}`}>
                      {percent}%
                    </span>
                  </div>

                  {/* Metricas extras */}
                  {statusTab === 'active' && (
                    <div className="flex items-center gap-3 mt-2.5 flex-wrap">
                      {daysLeft !== null && (
                        <span className={`text-[11px] flex items-center gap-1 ${daysLeft <= 5 ? 'text-rose-500' : daysLeft <= 10 ? 'text-amber-500' : 'text-slate-400'}`}>
                          <Clock size={11} />
                          {daysLeft > 0 ? `${daysLeft}d` : 'Encerrado'}
                        </span>
                      )}
                      {dailyTarget !== null && dailyTarget > 0 && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <CalendarDays size={11} />
                          {formatCurrency(dailyTarget)}/dia
                        </span>
                      )}
                      {current >= goal.targetValue && (
                        <span className="text-[11px] text-emerald-500 font-medium flex items-center gap-1">
                          <Trophy size={11} />
                          Atingida!
                        </span>
                      )}
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {formatPeriod(goal.periodStart, goal.periodEnd)}
                    </span>
                    <div className="flex items-center gap-2">
                      <HealthBadge health={health} />
                      {statusTab !== 'active' && (
                        <CrmBadge variant={s.variant} size="sm">{s.label}</CrmBadge>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      <GoalFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditGoal(null); }}
        goal={editGoal}
        defaultType={formDefaultType}
      />

      <CrmConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir meta"
        message={`Tem certeza que deseja excluir "${deleteTarget?.title}"? Esta acao nao pode ser desfeita.`}
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default CrmGoalsPage;

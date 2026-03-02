/**
 * CrmGoalsPage - Pagina de Metas de Vendas do CRM.
 *
 * Secao 1: Meta Global (card grande com progresso)
 * Secao 2: Metas Individuais (cards por vendedor)
 * Inclui badge de saude da meta (ritmo vs tempo).
 */

import { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { CrmPageHeader, CrmAvatar, CrmBadge, CrmConfirmDialog } from '../components/ui';
import { useCrmGoals, useGoalsProgress, useDeleteCrmGoal } from '../hooks/useCrmQueries';
import { GoalFormModal } from '../components/GoalFormModal';

// ==================== HELPERS ====================

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val || 0);

const STATUS_MAP = {
  active: { label: 'Ativa', variant: 'info' },
  completed: { label: 'Concluida', variant: 'success' },
  cancelled: { label: 'Cancelada', variant: 'neutral' },
};

function formatPeriod(start, end) {
  if (!start || !end) return '';
  const s = new Date(start + 'T00:00:00');
  const e = new Date(end + 'T00:00:00');
  const opts = { day: '2-digit', month: 'short' };
  return `${s.toLocaleDateString('pt-BR', opts)} - ${e.toLocaleDateString('pt-BR', opts)}`;
}

/**
 * Calcula a saude da meta baseado no ritmo (progresso vs tempo decorrido).
 * Retorna { label, color, bgColor, icon, tooltip, ritmo }
 */
function getGoalHealth(goal, currentProgress) {
  if (goal.status !== 'active' || !goal.periodStart || !goal.periodEnd || goal.targetValue <= 0) {
    return null;
  }

  const now = new Date();
  const start = new Date(goal.periodStart + 'T00:00:00');
  const end = new Date(goal.periodEnd + 'T00:00:00');

  // Se ainda nao comecou ou ja terminou, nao mostrar
  if (now < start) return null;

  const totalDays = Math.max(1, (end - start) / (1000 * 60 * 60 * 24));
  const elapsedDays = Math.min(totalDays, (now - start) / (1000 * 60 * 60 * 24));
  const timePercent = elapsedDays / totalDays;

  const expectedProgress = goal.targetValue * timePercent;
  const ritmo = expectedProgress > 0 ? currentProgress / expectedProgress : 0;

  const expectedPercent = Math.round(timePercent * 100);
  const actualPercent = Math.round((currentProgress / goal.targetValue) * 100);

  const tooltip = `Tempo: ${expectedPercent}% | Progresso: ${actualPercent}% — Voce deveria estar em ${formatCurrency(expectedProgress)}`;

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

// ==================== SKELETON ====================

function GoalsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-7 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6">
        <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded mb-2" />
        <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full" />
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
  const { data, isLoading } = useCrmGoals({ status: 'active' });
  const goals = data?.data || [];

  const { data: progressMap = {} } = useGoalsProgress(goals);

  const deleteMutation = useDeleteCrmGoal();

  const [formOpen, setFormOpen] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formDefaultType, setFormDefaultType] = useState('individual');

  // Separar metas globais e individuais
  const globalGoals = useMemo(() => goals.filter(g => g.type === 'global'), [goals]);
  const individualGoals = useMemo(() => goals.filter(g => g.type === 'individual'), [goals]);

  const handleNew = (type = 'individual') => { setEditGoal(null); setFormDefaultType(type); setFormOpen(true); };
  const handleEdit = (goal) => { setEditGoal(goal); setFormOpen(true); };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  // Calcula progresso total de uma goal
  const getProgress = (goal) => {
    const auto = progressMap[goal.id]?.autoValue || 0;
    const manual = goal.currentValue || 0;
    return auto + manual;
  };

  if (isLoading) return <GoalsSkeleton />;

  return (
    <div className="space-y-6">
      <CrmPageHeader
        title="Metas"
        subtitle={`${goals.length} meta${goals.length !== 1 ? 's' : ''} ativa${goals.length !== 1 ? 's' : ''}`}
        actions={
          <button onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 bg-fyness-primary hover:bg-fyness-secondary text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16} /> Nova Meta
          </button>
        }
      />

      {/* ── Meta Global ── */}
      {globalGoals.length > 0 ? (
        globalGoals.map((goal) => {
          const current = getProgress(goal);
          const percent = goal.targetValue > 0 ? Math.min(100, Math.round((current / goal.targetValue) * 100)) : 0;
          const health = getGoalHealth(goal, current);

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

              {/* Barra grande */}
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

              {goal.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{goal.description}</p>
              )}
            </div>
          );
        })
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
          <Globe size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Nenhuma meta global definida</p>
          <button onClick={() => handleNew('global')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
            Criar meta global
          </button>
        </div>
      )}

      {/* ── Metas Individuais ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-slate-500 dark:text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Metas Individuais</h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">({individualGoals.length})</span>
        </div>

        {individualGoals.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 text-center">
            <Target size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Nenhuma meta individual definida</p>
            <button onClick={handleNew}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
              Criar meta individual
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {individualGoals.map((goal) => {
              const current = getProgress(goal);
              const percent = goal.targetValue > 0 ? Math.min(100, Math.round((current / goal.targetValue) * 100)) : 0;
              const s = STATUS_MAP[goal.status] || STATUS_MAP.active;
              const health = getGoalHealth(goal, current);

              return (
                <div key={goal.id}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 hover:border-blue-300 dark:hover:border-blue-700/50 transition-colors group">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <CrmAvatar name={goal.owner?.name || '?'} size="sm" color={goal.owner?.color} />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {goal.owner?.name || 'Sem responsavel'}
                        </div>
                        <div className="text-xs text-slate-400 dark:text-slate-500 truncate">
                          {goal.title}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {formatPeriod(goal.periodStart, goal.periodEnd)}
                    </span>
                    <div className="flex items-center gap-2">
                      <HealthBadge health={health} />
                      <CrmBadge variant={s.variant} size="sm">{s.label}</CrmBadge>
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

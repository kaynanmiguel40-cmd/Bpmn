/**
 * Paletas de cores centralizadas do sistema Fyness.
 *
 * Antes essas definicoes estavam espalhadas em 7+ arquivos.
 * Qualquer ajuste de cor deve ser feito aqui para refletir em todo o app.
 */

// ─── Cores de Empresa (Dashboard / Settings) ────────────────────

/** Cores para cards de empresa (sem dark mode) */
export const COMPANY_COLORS = [
  { bg: 'bg-blue-500', light: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', gradient: 'from-blue-500 to-blue-600' },
  { bg: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', gradient: 'from-emerald-500 to-emerald-600' },
  { bg: 'bg-amber-500', light: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', gradient: 'from-amber-500 to-amber-600' },
  { bg: 'bg-rose-500', light: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', gradient: 'from-rose-500 to-rose-600' },
  { bg: 'bg-cyan-500', light: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700', gradient: 'from-cyan-500 to-cyan-600' },
  { bg: 'bg-violet-500', light: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700', gradient: 'from-violet-500 to-violet-600' },
];

/** Cores para badges de empresa (com dark mode) */
export const COMPANY_BADGE_COLORS = [
  { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
  { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-500' },
  { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800', dot: 'bg-rose-500' },
  { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800', dot: 'bg-cyan-500' },
  { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800', dot: 'bg-purple-500' },
];

// ─── Cores de Prioridade (O.S.) ─────────────────────────────────

/** Prioridades com label, cor de badge e dot */
export const PRIORITIES = {
  urgent: { label: 'Urgente', color: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400', dot: 'bg-red-500' },
  high: { label: 'Alta', color: 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  medium: { label: 'Media', color: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-400' },
  low: { label: 'Baixa', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', dot: 'bg-slate-400' },
};

/** Prioridades como array (para selects e listas) */
export const PRIORITIES_LIST = [
  { id: 'low', label: 'Baixa', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300', dot: 'bg-slate-400' },
  { id: 'medium', label: 'Media', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-400' },
  { id: 'high', label: 'Alta', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  { id: 'urgent', label: 'Urgente', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400', dot: 'bg-red-500' },
];

// ─── Colunas Kanban ─────────────────────────────────────────────

/** Colunas do kanban de rotina (por status) */
export const ROUTINE_COLUMNS = [
  { id: 'todo', title: 'Por Fazer', color: 'from-slate-400 to-slate-500', emptyText: 'Nenhuma O.S. pendente' },
  { id: 'doing', title: 'Em Andamento', color: 'from-blue-500 to-blue-600', emptyText: 'Nenhuma O.S. em andamento' },
  { id: 'done', title: 'Concluido', color: 'from-green-500 to-emerald-600', emptyText: 'Nenhuma O.S. concluida' },
];

/** Colunas do kanban financeiro (por prioridade) */
export const PRIORITY_COLUMNS = [
  { id: 'red', title: 'Urgente / Alta', color: 'from-red-500 to-red-600', priorities: ['urgent', 'high'], emptyText: 'Nenhuma O.S. urgente' },
  { id: 'yellow', title: 'Media', color: 'from-yellow-400 to-amber-500', priorities: ['medium'], emptyText: 'Nenhuma O.S. media' },
  { id: 'green', title: 'Baixa', color: 'from-green-500 to-emerald-600', priorities: ['low'], emptyText: 'Nenhuma O.S. de baixa prioridade' },
];

// ─── Categorias (O.S.) ──────────────────────────────────────────

export const CATEGORIES = [
  { id: 'internal', label: 'Interno', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  { id: 'bug', label: 'Bug', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
  { id: 'feature', label: 'Feature', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  { id: 'support', label: 'Suporte', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  { id: 'compliance', label: 'Compliance', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
  { id: 'campaign', label: 'Campanha', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' },
];

// ─── Status Labels ──────────────────────────────────────────────

export const OS_STATUS_LABELS = {
  available: 'Disponivel',
  in_progress: 'Em Andamento',
  done: 'Concluida',
};

export const EAP_STATUS_LABELS = {
  planning: { label: 'Planejamento', color: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300' },
  active: { label: 'Ativo', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
  completed: { label: 'Concluido', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
  on_hold: { label: 'Pausado', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
};

// ─── Paletas Hex (para graficos e seletores) ────────────────────

/** Cores hex para setores */
export const SECTOR_COLORS = ['#2563eb', '#3b82f6', '#f97316', '#10b981', '#ec4899', '#eab308', '#ef4444', '#06b6d4', '#84cc16', '#f43f5e'];

/** Cores hex para projetos */
export const PROJECT_COLORS = ['#3b82f6', '#10b981', '#f97316', '#ec4899', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4'];

/** Cores hex para status de O.S. no calendario */
export const OS_STATUS_COLORS = { available: '#3b82f6', in_progress: '#f97316', done: '#22c55e', blocked: '#ef4444' };

// ─── Motivos de Bloqueio ────────────────────────────────────────

export const BLOCK_REASONS = [
  { id: 'material', label: 'Aguardando Material' },
  { id: 'approval', label: 'Aguardando Aprovacao' },
  { id: 'resource', label: 'Aguardando Recurso' },
  { id: 'dependency', label: 'Dependencia de Outro Time' },
  { id: 'other', label: 'Outro' },
];

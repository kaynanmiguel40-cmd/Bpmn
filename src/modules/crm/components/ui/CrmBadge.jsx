/**
 * CrmBadge - Badge de status reutilizavel.
 *
 * Props:
 * - variant: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'indigo' | 'violet'
 * - size: 'sm' | 'md'
 * - children: texto
 * - dot: boolean - mostra ponto colorido antes do texto
 */

const variants = {
  success: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  danger: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  info: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
  neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  violet: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400',
};

const dotVariants = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  neutral: 'bg-slate-400',
  indigo: 'bg-indigo-500',
  violet: 'bg-violet-500',
};

const sizes = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-2.5 py-1 text-xs',
};

export function CrmBadge({ variant = 'neutral', size = 'sm', dot, children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full ${variants[variant]} ${sizes[size]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotVariants[variant]}`} />}
      {children}
    </span>
  );
}

export default CrmBadge;

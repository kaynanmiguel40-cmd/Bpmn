import { getDeadlineStatus } from '../../lib/deadlineUtils';

const BADGE_STYLES = {
  overdue: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  ok: 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
  none: '',
};

const BADGE_ICONS = {
  overdue: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
  warning: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
};

export function DeadlineBadge({ order, showOk = false, className = '' }) {
  const { status, label } = getDeadlineStatus(order);

  if (status === 'none') return null;
  if (status === 'ok' && !showOk) return null;

  const style = BADGE_STYLES[status];
  const iconPath = BADGE_ICONS[status];

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${style} ${className}`}>
      {iconPath && (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
        </svg>
      )}
      {label}
    </span>
  );
}

export default DeadlineBadge;

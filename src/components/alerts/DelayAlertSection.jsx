import { getOverdueOrders, getWarningOrders } from '../../lib/deadlineUtils';

export function DelayAlertSection({ orders = [] }) {
  const overdue = getOverdueOrders(orders);
  const warnings = getWarningOrders(orders);

  if (overdue.length === 0 && warnings.length === 0) return null;

  return (
    <div className="space-y-3">
      {/* Overdue */}
      {overdue.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h4 className="text-sm font-semibold text-red-700 dark:text-red-400">
              {overdue.length} O.S. atrasada{overdue.length > 1 ? 's' : ''}
            </h4>
          </div>
          <div className="space-y-1">
            {overdue.slice(0, 5).map(o => (
              <div key={o.id} className="flex items-center justify-between text-sm">
                <span className="text-red-700 dark:text-red-300">
                  #{o.number} {o.title}
                </span>
                <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                  {Math.abs(Math.ceil((new Date(o.estimatedEnd) - new Date()) / 86400000))}d atrasado
                </span>
              </div>
            ))}
            {overdue.length > 5 && (
              <p className="text-xs text-red-500 dark:text-red-400">+{overdue.length - 5} mais</p>
            )}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {warnings.length} O.S. com prazo proximo
            </h4>
          </div>
          <div className="space-y-1">
            {warnings.slice(0, 5).map(o => {
              const daysLeft = Math.ceil((new Date(o.estimatedEnd) - new Date()) / 86400000);
              return (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <span className="text-amber-700 dark:text-amber-300">
                    #{o.number} {o.title}
                  </span>
                  <span className="text-xs text-amber-500 dark:text-amber-400 font-medium">
                    {daysLeft === 0 ? 'Hoje' : daysLeft === 1 ? 'Amanha' : `${daysLeft}d`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default DelayAlertSection;

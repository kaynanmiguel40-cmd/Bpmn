export function DependencyIndicator({ dependencies = [], orders = [], className = '' }) {
  if (!dependencies || dependencies.length === 0) return null;

  // Verificar se todas as dependencias estao concluidas
  const depOrders = orders.filter(o => dependencies.includes(o.id));
  const allDone = depOrders.every(o => o.status === 'done');
  const pendingCount = depOrders.filter(o => o.status !== 'done').length;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium ${
        allDone
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-amber-600 dark:text-amber-400'
      } ${className}`}
      title={
        allDone
          ? 'Todas as dependencias concluidas'
          : `${pendingCount} dependencia(s) pendente(s)`
      }
    >
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
      {allDone ? (
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <span>{pendingCount}</span>
      )}
    </span>
  );
}

export default DependencyIndicator;

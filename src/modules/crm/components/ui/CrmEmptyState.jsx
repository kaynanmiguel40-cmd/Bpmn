/**
 * CrmEmptyState - Estado vazio reutilizavel.
 *
 * Props:
 * - icon: Componente lucide-react
 * - title: string
 * - description: string
 * - action: { label, onClick } - Botao de acao primaria
 */

import { Inbox } from 'lucide-react';

export function CrmEmptyState({
  icon: Icon = Inbox,
  title = 'Nenhum registro encontrado',
  description,
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Icon size={28} className="text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default CrmEmptyState;

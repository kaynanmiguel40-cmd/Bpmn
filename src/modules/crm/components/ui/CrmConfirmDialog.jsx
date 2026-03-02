/**
 * CrmConfirmDialog - Dialog de confirmacao para acoes destrutivas.
 *
 * Props:
 * - open: boolean
 * - onConfirm: () => void
 * - onCancel: () => void
 * - title: string
 * - message: string
 * - confirmLabel: string (default: "Confirmar")
 * - variant: 'danger' | 'warning' | 'info'
 * - loading: boolean
 */

import { AlertTriangle, Info, Trash2 } from 'lucide-react';
import { CrmModal } from './CrmModal';

const variantConfig = {
  danger: {
    icon: Trash2,
    iconBg: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
    btnClass: 'bg-rose-600 hover:bg-rose-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
    btnClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    btnClass: 'bg-fyness-primary hover:bg-fyness-secondary text-white',
  },
};

export function CrmConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = 'Confirmar acao',
  message = 'Tem certeza que deseja continuar?',
  confirmLabel = 'Confirmar',
  variant = 'danger',
  loading,
}) {
  const config = variantConfig[variant] || variantConfig.danger;
  const IconComponent = config.icon;

  return (
    <CrmModal open={open} onClose={onCancel} title={title} size="sm" footer={
      <>
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 ${config.btnClass}`}
        >
          {loading && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {confirmLabel}
        </button>
      </>
    }>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full ${config.iconBg} flex items-center justify-center shrink-0`}>
          <IconComponent size={20} className={config.iconColor} />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 pt-2">{message}</p>
      </div>
    </CrmModal>
  );
}

export default CrmConfirmDialog;

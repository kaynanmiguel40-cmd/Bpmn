/**
 * LostReasonModal - Modal que pede o motivo de perda de um negocio.
 * Reutilizado no Pipeline (kanban) e DealDetail.
 *
 * Usa o CrmModal (casca padrao do CRM): portal, trava de scroll, Escape,
 * backdrop e botao X vem de graca — antes este modal rolava o proprio overlay.
 */

import { useState, useRef, useEffect } from 'react';
import { XCircle } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';

// Campo padrao do CRM, com o anel de foco rosa (semantica de perda).
const fieldClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none';

export function LostReasonModal({ open, onClose, onConfirm, isPending }) {
  const [reason, setReason] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setReason('');
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [open]);

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title="Marcar como perdido"
      size="sm"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isPending}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending || reason.trim().length < 3}
            title={reason.trim().length < 3 ? 'Escreva o motivo da perda' : undefined}
            className="min-h-[44px] px-4 py-2 text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isPending ? 'Salvando…' : 'Confirmar'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
            <XCircle size={20} className="text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 pt-2">
            Por que este negócio foi perdido?
          </p>
        </div>

        <div>
          <textarea
            ref={inputRef}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Ex.: Cliente escolheu concorrente, preço muito alto, sem orçamento…"
            className={fieldClass}
          />
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            Esse negócio vai sair desta pipeline e ir pra Nurturing (reativação futura), se ainda não tiver uma etapa própria de perdidos aqui.
          </p>
        </div>
      </div>
    </CrmModal>
  );
}

export default LostReasonModal;

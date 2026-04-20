/**
 * LostReasonModal - Modal que pede o motivo de perda de um negocio.
 * Reutilizado no Pipeline (kanban) e DealDetail.
 */

import { useState, useRef, useEffect } from 'react';
import { XCircle } from 'lucide-react';

export function LostReasonModal({ open, onClose, onConfirm, isPending }) {
  const [reason, setReason] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setReason('');
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center shrink-0">
            <XCircle size={20} className="text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Marcar como Perdido</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Por que este negocio foi perdido?</p>
          </div>
        </div>

        <textarea
          ref={inputRef}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Ex: Cliente escolheu concorrente, preco muito alto, sem orcamento..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none mb-4"
        />

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium bg-rose-600 hover:bg-rose-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}

export default LostReasonModal;

/**
 * LostReasonModal - Modal que pede o motivo de perda de um negocio E se o lead
 * ainda e resgatavel (vale nutrir) ou nao (descarta de vez).
 *
 * A escolha roteia o destino na Nurturing:
 *   - "Ainda da pra nutrir" -> Em Nutricao (ativo, entra na cadencia).
 *   - "Nao vale, descarta"   -> Descarte (perdido e parado).
 *
 * Reutilizado no Pipeline (kanban), Deals e DealDetail. Usa o CrmModal (casca
 * padrao: portal, trava de scroll, Escape, backdrop, X).
 */

import { useState, useRef, useEffect } from 'react';
import { XCircle, Sprout, Trash2 } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';

// Campo padrao do CRM, com o anel de foco rosa (semantica de perda).
const fieldClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none';

export function LostReasonModal({ open, onClose, onConfirm, isPending }) {
  const [reason, setReason] = useState('');
  const [resgatavel, setResgatavel] = useState(null); // null (nao escolheu) | true | false
  const inputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setReason('');
    setResgatavel(null);
    const timer = setTimeout(() => inputRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [open]);

  const canConfirm = reason.trim().length >= 3 && resgatavel !== null;

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
            onClick={() => onConfirm(reason, resgatavel)}
            disabled={isPending || !canConfirm}
            title={!canConfirm ? 'Escreva o motivo e escolha se ainda dá pra nutrir' : undefined}
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

        <textarea
          ref={inputRef}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Ex.: Cliente escolheu concorrente, preço muito alto, sem orçamento…"
          className={fieldClass}
        />

        {/* Escolha resgatável — dois botões grandes, sem espaço pra dúvida. */}
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Esse lead ainda vale a pena?</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setResgatavel(true)}
              className={`flex flex-col items-center text-center gap-1 rounded-xl border-2 px-3 py-3 transition-colors ${
                resgatavel === true
                  ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700'
              }`}
            >
              <Sprout size={22} className="text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Ainda dá pra nutrir</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">vai pra Nutrição</span>
            </button>
            <button
              type="button"
              onClick={() => setResgatavel(false)}
              className={`flex flex-col items-center text-center gap-1 rounded-xl border-2 px-3 py-3 transition-colors ${
                resgatavel === false
                  ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-700'
              }`}
            >
              <Trash2 size={22} className="text-rose-600 dark:text-rose-400" />
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Não vale, descarta</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">vai pro Descarte</span>
            </button>
          </div>
        </div>
      </div>
    </CrmModal>
  );
}

export default LostReasonModal;

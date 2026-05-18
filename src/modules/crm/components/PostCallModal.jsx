/**
 * PostCallModal - Modal pos-chamada do discador (V1).
 *
 * Vendedor ja discou via celular (link tel:). Este modal:
 *   - mostra duracao cronometrada (editavel),
 *   - pede o resultado da chamada (CALL_OUTCOMES),
 *   - aceita notas,
 *   - se outcome = callback_scheduled, pede data/hora do retorno.
 *
 * Ao confirmar chama createCrmCall, que registra em crm_calls e espelha
 * uma activity type='call' na timeline.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Phone, Building2, Clock } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { CALL_OUTCOMES } from '../services/crmCallsService';

const OUTCOME_GROUPS = [
  {
    label: 'Conversou',
    keys: ['answered', 'meeting_scheduled', 'callback_scheduled', 'deal_advanced', 'not_interested'],
  },
  {
    label: 'Nao falou',
    keys: ['no_answer', 'voicemail', 'busy', 'wrong_number'],
  },
];

function formatSeconds(total) {
  const s = Math.max(0, Math.floor(total || 0));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function toDatetimeLocal(date) {
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function PostCallModal({
  open,
  onClose,
  contact,           // { id, name, phone, company? } — o que esta sendo ligado
  startedAt,         // ISO — inicio cronometrado
  elapsedSeconds,    // numero — cronometro
  onSubmit,          // ({ outcome, notes, durationSeconds, followUpAt }) => Promise
  isPending,
}) {
  const [outcome, setOutcome] = useState(null);
  const [notes, setNotes] = useState('');
  const [duration, setDuration] = useState(elapsedSeconds || 0);
  const [followUpAt, setFollowUpAt] = useState('');
  const handleConfirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setOutcome(null);
    setNotes('');
    setDuration(elapsedSeconds || 0);
    // Sugere amanha 09:00 como default de retorno
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    setFollowUpAt(toDatetimeLocal(tomorrow));
  }, [open, elapsedSeconds]);

  // Cmd/Ctrl+Enter registra (Enter "puro" pode estar em uma textarea)
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleConfirmRef.current?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const requiresFollowUp = outcome === 'callback_scheduled';

  const canSubmit = useMemo(() => {
    if (!outcome) return false;
    if (requiresFollowUp && !followUpAt) return false;
    return true;
  }, [outcome, requiresFollowUp, followUpAt]);

  const handleConfirm = () => {
    if (!canSubmit || isPending) return;
    onSubmit?.({
      outcome,
      notes: notes.trim(),
      durationSeconds: Number(duration) || 0,
      followUpAt: requiresFollowUp ? new Date(followUpAt).toISOString() : null,
      startedAt,
      endedAt: new Date().toISOString(),
    });
  };
  handleConfirmRef.current = handleConfirm;

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title="Registrar resultado da ligacao"
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            Pular registro
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canSubmit || isPending}
            title="Ctrl+Enter pra registrar"
            className="px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Registrar
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Cabecalho com contato */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full bg-fyness-primary/10 dark:bg-fyness-primary/20 flex items-center justify-center shrink-0">
              <Phone size={16} className="text-fyness-primary" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                {contact?.name || 'Contato sem nome'}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 truncate flex items-center gap-2">
                <span>{contact?.phone || '—'}</span>
                {contact?.company?.name && (
                  <>
                    <span>·</span>
                    <Building2 size={11} className="shrink-0" />
                    <span className="truncate">{contact.company.name}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Duracao */}
          <div className="flex items-center gap-2 shrink-0">
            <Clock size={14} className="text-slate-400" />
            <input
              type="text"
              value={formatSeconds(duration)}
              onChange={(e) => {
                const parts = e.target.value.split(':');
                if (parts.length === 2) {
                  const m = parseInt(parts[0], 10) || 0;
                  const s = parseInt(parts[1], 10) || 0;
                  setDuration(m * 60 + s);
                }
              }}
              className="w-16 text-center text-sm font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-fyness-primary"
              aria-label="Duracao da chamada (mm:ss)"
            />
          </div>
        </div>

        {/* Resultado */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Resultado *
          </label>
          <div className="space-y-3">
            {OUTCOME_GROUPS.map((group) => (
              <div key={group.label}>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mb-1.5">{group.label}</div>
                <div className="grid grid-cols-2 gap-1.5">
                  {group.keys.map((key) => {
                    const o = CALL_OUTCOMES[key];
                    if (!o) return null;
                    const active = outcome === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setOutcome(key)}
                        className={`px-3 py-2 text-sm rounded-lg border text-left transition-colors ${
                          active
                            ? 'bg-fyness-primary/10 dark:bg-fyness-primary/20 border-fyness-primary text-fyness-primary dark:text-blue-300 font-medium'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                        }`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Retorno agendado */}
        {requiresFollowUp && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Quando retornar *
            </label>
            <input
              type="datetime-local"
              value={followUpAt}
              onChange={(e) => setFollowUpAt(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
            />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Cria uma atividade tipo "ligacao" agendada na sua agenda.
            </p>
          </div>
        )}

        {/* Notas */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            Notas
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="O que foi conversado, proximos passos, objecoes..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary resize-none"
          />
        </div>
      </div>
    </CrmModal>
  );
}

export default PostCallModal;

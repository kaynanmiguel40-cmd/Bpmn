/**
 * DueDateButton — Botao+popover pra setar/exibir prazo de entrega.
 * Reutilizavel: vale tanto pra pasta (grupo do checklist) quanto pra item.
 *
 * Estados visuais:
 *   - Sem prazo  -> "+ prazo"  cinza/discreto
 *   - No prazo   -> "06/05 18h" indigo
 *   - <24h falta -> "06/05 18h" amarelo
 *   - Atrasado   -> "06/05 18h (atrasado)" vermelho (so se !done)
 *   - Concluido  -> "06/05 18h" cinza riscado
 *
 * dueAt e armazenado em ISO ("2026-05-10T18:00:00Z").
 */

import { useState, useEffect, useRef } from 'react';

const isoFromDatetimeLocal = (v) => {
  if (!v) return null;
  // datetime-local: "YYYY-MM-DDTHH:mm" -> normaliza pra UTC
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) return `${v}:00Z`;
  return null;
};

const datetimeLocalFromIso = (iso) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const pad = n => String(n).padStart(2, '0');
    return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
  } catch { return ''; }
};

function fmtShort(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return ''; }
}

export default function DueDateButton({
  dueAt,           // ISO ou null
  done = false,    // se a coisa ja foi concluida (atrasado fica neutro)
  disabled = false,
  size = 'sm',     // 'xs' (item) | 'sm' (pasta)
  onChange,        // (iso | null) => void
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [draft, setDraft] = useState(datetimeLocalFromIso(dueAt));
  const ref = useRef(null);

  useEffect(() => { setDraft(datetimeLocalFromIso(dueAt)); }, [dueAt]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const now = Date.now();
  const due = dueAt ? new Date(dueAt).getTime() : null;
  const overdue = due && !done && due < now;
  const soon = due && !done && !overdue && (due - now) < 24 * 3600 * 1000;

  let cls = 'border';
  if (!dueAt) {
    cls += ' bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500';
  } else if (done) {
    cls += ' bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 line-through';
  } else if (overdue) {
    cls += ' bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300';
  } else if (soon) {
    cls += ' bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300';
  } else {
    cls += ' bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300';
  }

  const sizing = size === 'xs'
    ? 'text-[10px] px-1.5 py-0.5 gap-1'
    : 'text-[11px] px-2 py-1 gap-1';

  const handleSave = (val) => {
    onChange?.(val ? isoFromDatetimeLocal(val) : null);
    setOpen(false);
  };

  const label = dueAt
    ? (overdue ? `${fmtShort(dueAt)} · atrasado` : fmtShort(dueAt))
    : '+ prazo';

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className={`inline-flex items-center rounded-md font-medium transition-colors max-w-[180px] truncate ${cls} ${sizing} ${
          disabled ? 'cursor-default opacity-60' : 'cursor-pointer hover:opacity-80'
        }`}
        title={dueAt ? `Prazo: ${fmtShort(dueAt)}${overdue ? ' (atrasado)' : ''}` : 'Sem prazo'}
      >
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="truncate">{label}</span>
      </button>

      {open && !disabled && (
        <div
          className="absolute right-0 top-full mt-1 z-30 min-w-[220px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg p-2"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="datetime-local"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="w-full px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-slate-700 dark:text-slate-200"
            autoFocus
          />
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => handleSave(null)}
              className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-red-500 px-2 py-1"
            >
              Limpar
            </button>
            <div className="flex-1" />
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-1"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => handleSave(draft)}
              disabled={!draft}
              className="text-[10px] font-medium px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

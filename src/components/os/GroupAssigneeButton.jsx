/**
 * GroupAssigneeButton — Multi-seletor de responsaveis pra um grupo de checklist.
 *
 * Aceita 0, 1 ou N responsaveis na mesma pasta. Mesma pessoa pode estar em
 * varias pastas (independente).
 *
 * Lista APENAS os membros que estao em order.participants[].
 * onToggle(member) e disparado a cada click pra adicionar/remover.
 */

import { useState, useEffect, useRef } from 'react';

export default function GroupAssigneeButton({
  participants = [],
  currentAssignees = [],     // [{id, name}, ...]
  disabled = false,
  onToggle,                  // (member) => void
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const isAssigned = (p) =>
    currentAssignees.some(a =>
      (a.id && p.id && a.id === p.id) ||
      (!a.id && !p.id && a.name === p.name) ||
      (a.name === p.name)
    );

  const count = currentAssignees.length;
  const namesList = currentAssignees.map(a => a.name).join(', ');

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className={`px-1.5 py-1 rounded-md border inline-flex items-center gap-1 transition-colors max-w-[420px] ${
          count > 0
            ? 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-slate-700/50'
            : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 text-[11px] font-medium'
        } ${disabled ? 'cursor-default opacity-60' : 'cursor-pointer'}`}
        title={count > 0 ? `Responsaveis: ${namesList}` : 'Sem responsavel'}
      >
        {count === 0 ? (
          <span>— sem resp. —</span>
        ) : (
          <span className="flex items-center gap-1 flex-wrap min-w-0">
            {currentAssignees.map((a, i) => (
              <span
                key={`${a.id || ''}|${a.name}|${i}`}
                className="inline-block px-2 py-0.5 text-[11px] font-medium rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 max-w-[140px] truncate"
              >
                {a.name}
              </span>
            ))}
          </span>
        )}
        {!disabled && (
          <svg className="w-3 h-3 shrink-0 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </button>

      {open && !disabled && (
        <div
          className="absolute right-0 top-full mt-1 z-30 min-w-[200px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {participants.length === 0 ? (
            <div className="px-3 py-2 text-xs text-slate-400 italic">
              Sem participantes na O.S.
            </div>
          ) : (
            <>
              <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700">
                Responsaveis ({count})
              </div>
              {participants.map((p, i) => {
                const checked = isAssigned(p);
                return (
                  <button
                    type="button"
                    key={`${p.id || ''}|${p.name}|${i}`}
                    onClick={() => onToggle?.({ id: p.id || null, name: p.name })}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center gap-2 ${
                      checked
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-200 font-medium'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                      checked
                        ? 'bg-indigo-500 border-indigo-500'
                        : 'border-slate-300 dark:border-slate-600'
                    }`}>
                      {checked && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <span className="truncate flex-1">{p.name}</span>
                  </button>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

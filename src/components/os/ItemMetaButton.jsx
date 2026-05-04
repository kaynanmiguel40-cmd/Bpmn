/**
 * ItemMetaButton — Compacta prazo + duracao numa interface limpa.
 *
 * Comportamento:
 *  - Vazio (sem prazo nem duracao):  "+"  discreto que abre menu pra escolher
 *  - Com 1 dos 2:                     mostra o chip + um "+" pra adicionar o outro
 *  - Com os 2:                        mostra os 2 chips, sem "+"
 *
 * Resultado: tarefa sem nada quase nao polui a UI.
 */

import { useState, useRef, useEffect } from 'react';
import DueDateButton from './DueDateButton';
import DurationButton from './DurationButton';

export default function ItemMetaButton({
  dueAt = null,
  minutes = 0,
  done = false,
  disabled = false,
  onChangeDueAt,
  onChangeMinutes,
}) {
  // 'due' | 'time' | null — qual o usuario acabou de pedir pra abrir
  const [pending, setPending] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const hasDue  = !!dueAt;
  const hasTime = (minutes || 0) > 0;
  const showPlus = !disabled && (!hasDue || !hasTime);

  return (
    <div className="flex items-center gap-1">
      {(hasDue || pending === 'due') && (
        <DueDateButton
          dueAt={dueAt}
          done={done}
          disabled={disabled}
          size="xs"
          defaultOpen={pending === 'due'}
          onChange={(iso) => {
            setPending(null);
            onChangeDueAt?.(iso);
          }}
        />
      )}
      {(hasTime || pending === 'time') && (
        <DurationButton
          minutes={minutes}
          disabled={disabled}
          size="xs"
          defaultOpen={pending === 'time'}
          onChange={(mins) => {
            setPending(null);
            onChangeMinutes?.(mins);
          }}
        />
      )}
      {showPlus && (
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(o => !o); }}
            className="text-[10px] font-medium px-1.5 py-0.5 rounded-md border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
            title="Adicionar prazo ou tempo"
          >
            +
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-1 z-30 min-w-[140px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {!hasDue && (
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); setPending('due'); }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                >
                  <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Prazo
                </button>
              )}
              {!hasTime && (
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); setPending('time'); }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 flex items-center gap-2"
                >
                  <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="9" strokeWidth="2" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v5l3 2" />
                  </svg>
                  Tempo
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

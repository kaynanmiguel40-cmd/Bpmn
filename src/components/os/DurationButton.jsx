/**
 * DurationButton — Botao+popover pra setar/exibir DURACAO estimada.
 *
 * Diferente do prazo (data/hora), aqui o valor e duracao em minutos.
 * Util pra metrificar trabalho estrategico (sem deadline duro) e somar
 * tempos por pasta/O.S.
 */

import { useState, useEffect, useRef } from 'react';

function formatMin(min) {
  if (!min || min <= 0) return '';
  const h = Math.floor(min / 60);
  const r = min % 60;
  if (h > 0 && r > 0) return `${h}h${String(r).padStart(2, '0')}`;
  if (h > 0) return `${h}h`;
  return `${r}min`;
}

export default function DurationButton({
  minutes = 0,
  disabled = false,
  size = 'sm',
  onChange,        // (minutes) => void
  defaultOpen = false,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [h, setH] = useState('');
  const [m, setM] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    if (open) {
      const total = minutes || 0;
      setH(total >= 60 ? String(Math.floor(total / 60)) : '');
      setM(String(total % 60 || ''));
    }
  }, [open, minutes]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const has = minutes > 0;
  const sizing = size === 'xs'
    ? 'text-[10px] px-1.5 py-0.5 gap-1'
    : 'text-[11px] px-2 py-1 gap-1';

  const cls = has
    ? 'bg-violet-50 dark:bg-violet-900/20 border-violet-200 dark:border-violet-800 text-violet-700 dark:text-violet-300'
    : 'bg-slate-50 dark:bg-slate-700/30 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500';

  const handleSave = () => {
    const total = (parseInt(h, 10) || 0) * 60 + (parseInt(m, 10) || 0);
    onChange?.(total);
    setOpen(false);
  };

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        className={`inline-flex items-center rounded-md border font-medium transition-colors ${cls} ${sizing} ${
          disabled ? 'cursor-default opacity-60' : 'cursor-pointer hover:opacity-80'
        }`}
        title={has ? `Duracao estimada: ${formatMin(minutes)}` : 'Sem duracao'}
      >
        <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="9" strokeWidth="2" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 7v5l3 2" />
        </svg>
        <span>{has ? formatMin(minutes) : '+ tempo'}</span>
      </button>

      {open && !disabled && (
        <div
          className="absolute right-0 top-full mt-1 z-30 min-w-[180px] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg p-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              placeholder="h"
              value={h}
              onChange={(e) => setH(e.target.value)}
              className="w-14 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-center text-slate-700 dark:text-slate-200"
              autoFocus
            />
            <span className="text-xs text-slate-400">h</span>
            <input
              type="number"
              min="0"
              max="59"
              placeholder="min"
              value={m}
              onChange={(e) => setM(e.target.value)}
              className="w-14 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded text-center text-slate-700 dark:text-slate-200"
            />
            <span className="text-xs text-slate-400">min</span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => { onChange?.(0); setOpen(false); }}
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
              onClick={handleSave}
              className="text-[10px] font-medium px-2 py-1 rounded bg-violet-600 text-white hover:bg-violet-700"
            >
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

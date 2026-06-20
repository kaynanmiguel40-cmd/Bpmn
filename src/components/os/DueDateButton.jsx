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

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

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
    if (isNaN(d.getTime())) return '';
    // dueAt e "wall clock" rotulado UTC -> le componentes UTC (sem desconto de
    // fuso). Formato clean: "22/10 18h" (hora cheia) ou "22/10 18:15".
    const pad = n => String(n).padStart(2, '0');
    const H = d.getUTCHours(), M = d.getUTCMinutes();
    return `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)} ${M === 0 ? pad(H) + 'h' : pad(H) + ':' + pad(M)}`;
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
  const [pos, setPos] = useState(null); // {top, left} em coords de viewport (fixed)
  const ref = useRef(null);       // wrapper do botao
  const popRef = useRef(null);    // popover (no portal)

  useEffect(() => { setDraft(datetimeLocalFromIso(dueAt)); }, [dueAt]);

  // Posiciona o popover a partir do retangulo do botao. Em coords de viewport
  // (position: fixed) -> escapa de qualquer container com overflow/scroll.
  const POP_W = 240, POP_H = 90, GAP = 4, MARGIN = 8;
  const updatePos = () => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    // alinha pela direita do botao (igual ao antigo right-0), mas mantem na tela
    let left = r.right - POP_W;
    if (left + POP_W > window.innerWidth - MARGIN) left = window.innerWidth - MARGIN - POP_W;
    if (left < MARGIN) left = MARGIN;
    // abre pra baixo; se nao couber, abre pra cima
    let top = r.bottom + GAP;
    if (top + POP_H > window.innerHeight - MARGIN) top = Math.max(MARGIN, r.top - POP_H - GAP);
    setPos({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) return;
    updatePos();
    const onScrollResize = () => updatePos();
    // capture:true pega scroll de qualquer container ancestral, nao so do window
    window.addEventListener('scroll', onScrollResize, true);
    window.addEventListener('resize', onScrollResize);
    return () => {
      window.removeEventListener('scroll', onScrollResize, true);
      window.removeEventListener('resize', onScrollResize);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      // popover vive num portal -> checa tanto o wrapper quanto o popover
      if (ref.current?.contains(e.target) || popRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Compara o prazo (wall clock rotulado UTC) contra o AGORA tambem como wall
  // clock (componentes locais rotulados UTC), senao o offset do fuso falsearia
  // o "atrasado".
  const nd = new Date();
  const nowWall = Date.UTC(nd.getFullYear(), nd.getMonth(), nd.getDate(), nd.getHours(), nd.getMinutes(), nd.getSeconds());
  const due = dueAt ? new Date(dueAt).getTime() : null;
  const overdue = due && !done && due < nowWall;
  const soon = due && !done && !overdue && (due - nowWall) < 24 * 3600 * 1000;

  // Prazo setado = so texto colorido (clean, sem chip). "+ prazo" = botao discreto.
  let cls;
  if (!dueAt) {
    cls = 'border border-dashed border-slate-300 dark:border-slate-600 text-slate-400 dark:text-slate-500';
  } else if (done) {
    cls = 'text-slate-400 dark:text-slate-500 line-through';
  } else if (overdue) {
    cls = 'text-red-600 dark:text-red-400 font-medium';
  } else if (soon) {
    cls = 'text-amber-600 dark:text-amber-400 font-medium';
  } else {
    cls = 'text-indigo-600 dark:text-indigo-400 font-medium';
  }

  const sizing = size === 'xs'
    ? 'text-[10px] px-1.5 py-0.5 gap-1'
    : 'text-[11px] px-2 py-1 gap-1';

  const handleSave = (val) => {
    onChange?.(val ? isoFromDatetimeLocal(val) : null);
    setOpen(false);
  };

  const label = dueAt ? fmtShort(dueAt) : '+ prazo';

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

      {open && !disabled && pos && createPortal(
        <div
          ref={popRef}
          style={{ position: 'fixed', top: pos.top, left: pos.left, width: POP_W }}
          className="z-[1000] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg p-2"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
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
        </div>,
        document.body
      )}
    </div>
  );
}

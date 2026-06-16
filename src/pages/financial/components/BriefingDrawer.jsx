import { useState, useRef, useEffect } from 'react';
import NotionEditor from '../../../components/ui/NotionEditor';
import RichTextDisplay from './RichTextDisplay';

const MIN_W = 360;
const STORAGE_KEY = 'briefing-drawer-width';

/**
 * Painel lateral de Briefing (estilo Notion), REDIMENSIONAVEL.
 * Arraste a borda esquerda pra mudar a largura (tipo o DevTools / F12).
 * A largura fica salva no localStorage.
 */
export default function BriefingDrawer({ title, editable = false, content, onChange, onClose, author, authorAt }) {
  const [width, setWidth] = useState(() => {
    try {
      const saved = parseInt(localStorage.getItem(STORAGE_KEY) || '', 10);
      if (Number.isFinite(saved) && saved >= MIN_W) return saved;
    } catch {}
    return 480;
  });
  const widthRef = useRef(width);
  widthRef.current = width;
  const dragging = useRef(false);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragging.current) return;
      const max = Math.min(window.innerWidth - 60, 1200);
      const w = Math.min(Math.max(window.innerWidth - e.clientX, MIN_W), max);
      setWidth(w);
    };
    const onUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      try { localStorage.setItem(STORAGE_KEY, String(Math.round(widthRef.current))); } catch {}
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const startDrag = (e) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex justify-end print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Briefing da tarefa"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-glass-lg flex flex-col animate-slide-in-right"
        style={{ width }}
      >
        {/* Handle de redimensionamento — arraste pra mudar a largura */}
        <div
          onMouseDown={startDrag}
          title="Arraste para redimensionar"
          className="absolute left-0 top-0 h-full w-1.5 -ml-1 cursor-col-resize z-20 hover:bg-fyness-primary/40 active:bg-fyness-primary/60 transition-colors"
        />

        <div className="flex items-start justify-between gap-3 p-5 border-b border-slate-200 dark:border-slate-700">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Briefing da tarefa</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug break-words">{title}</h3>
            {author && (
              <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <span>Criado por <span className="font-medium text-slate-500 dark:text-slate-300">{author}</span>{authorAt ? ` · ${new Date(authorAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}</span>
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {editable ? (
            <NotionEditor
              content={content}
              onChange={onChange}
              placeholder="Como executar esta tarefa? Passos, links, criterio de pronto..."
              minHeight="300px"
            />
          ) : content ? (
            <RichTextDisplay content={content} className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed" />
          ) : (
            <p className="text-sm text-slate-400 dark:text-slate-500 italic">Sem briefing.</p>
          )}
        </div>
      </div>
    </div>
  );
}

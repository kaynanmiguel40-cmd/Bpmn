import { useState, useRef, useEffect } from 'react';
import NotionEditor from '../../../components/ui/NotionEditor';
import RichTextDisplay from './RichTextDisplay';

const MIN_W = 360;
const STORAGE_KEY = 'briefing-drawer-width';

function MetaLine({ label, who, at }) {
  if (!who) return null;
  return (
    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
      <span>{label} <span className="font-medium text-slate-500 dark:text-slate-300">{who}</span>{at ? ` · ${new Date(at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}` : ''}</span>
    </p>
  );
}

/**
 * Painel lateral da tarefa (estilo Notion), REDIMENSIONAVEL.
 * Arraste a borda esquerda pra mudar a largura (tipo o DevTools / F12).
 * A largura fica salva no localStorage.
 *
 * Tem duas abas quando `showDelivery`:
 *  - Briefing: como executar a tarefa (com revisao do supervisor).
 *  - Entrega: o que foi feito (texto + print/foto colados no editor).
 */
export default function BriefingDrawer({
  title,
  editable = false,
  content,
  onChange,
  onClose,
  author,
  authorAt,
  reviewStatus,
  reviewBy,
  reviewAt,
  onReview,
  // Aba Entrega (opcional)
  showDelivery = false,
  deliveryContent,
  onDeliveryChange,
  deliveryAuthor,
  deliveryAt,
  initialTab = 'briefing',
}) {
  const [tab, setTab] = useState(showDelivery ? initialTab : 'briefing');
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

  // Esc fecha o painel (padrao de modal). NotionEditor/SlashCommand tratam o
  // proprio Esc antes (stopPropagation no popup), entao aqui so chega quando
  // nenhum overlay interno consumiu.
  useEffect(() => {
    const onKey = (e) => {
      // Se o menu "/" (ou outro overlay do editor) ja consumiu o Esc, nao fecha.
      if (e.key === 'Escape' && !e.defaultPrevented) onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // Se as abas sumirem (tarefa deixou de estar concluida) com o painel aberto
  // na aba Entrega, cai de volta pro Briefing pra nao editar um campo oculto.
  const onBriefing = !showDelivery || tab === 'briefing';
  const activeContent = onBriefing ? content : deliveryContent;
  const activeOnChange = onBriefing ? onChange : onDeliveryChange;
  const activePlaceholder = onBriefing
    ? 'Como executar esta tarefa? Passos, links, criterio de pronto...'
    : 'O que foi feito? Cole o print/foto aqui (Ctrl+V), descreva o resultado, links...';

  return (
    <div
      className="fixed inset-0 z-[70] flex justify-end print:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Painel da tarefa"
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

        <div className="flex items-start justify-between gap-3 p-5 pb-3 border-b border-slate-200 dark:border-slate-700">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">Tarefa</p>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug break-words">{title}</h3>

            {/* Abas */}
            {showDelivery && (
              <div className="mt-3 flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                <button
                  type="button"
                  onClick={() => setTab('briefing')}
                  className={`px-3 py-1 rounded-md text-[12px] font-semibold transition-colors ${onBriefing ? 'bg-white dark:bg-slate-700 text-fyness-primary shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  Briefing
                </button>
                <button
                  type="button"
                  onClick={() => setTab('entrega')}
                  className={`px-3 py-1 rounded-md text-[12px] font-semibold transition-colors inline-flex items-center gap-1 ${!onBriefing ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                >
                  Entrega
                  {deliveryAuthor && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                </button>
              </div>
            )}

            {/* Meta (autor) contextual da aba ativa */}
            {onBriefing
              ? <MetaLine label="Criado por" who={author} at={authorAt} />
              : <MetaLine label="Entregue por" who={deliveryAuthor} at={deliveryAt} />}

            {/* Barra de revisao do supervisor — nivel da tarefa */}
            {onReview && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  reviewStatus === 'review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                  reviewStatus === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  reviewStatus === 'changes' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                  'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                }`}>
                  {reviewStatus === 'review' ? 'Em revisao' : reviewStatus === 'approved' ? 'Aprovado' : reviewStatus === 'changes' ? 'Ajuste pedido' : 'Rascunho'}
                  {(reviewStatus === 'approved' || reviewStatus === 'changes') && reviewBy ? ` · ${reviewBy}` : ''}
                </span>
                {reviewStatus === 'review' ? (
                  <>
                    <button type="button" onClick={() => onReview('approved')} className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">Aprovar</button>
                    <button type="button" onClick={() => onReview('changes')} className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">Pedir ajuste</button>
                  </>
                ) : reviewStatus === 'approved' ? (
                  <button type="button" onClick={() => onReview('draft')} className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">Reabrir</button>
                ) : (
                  <button type="button" onClick={() => onReview('review')} className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-fyness-primary text-white hover:bg-fyness-secondary transition-colors">Pronto pra revisar</button>
                )}
              </div>
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

        <div className="flex-1 min-h-0 p-5 flex flex-col">
          {editable ? (
            <NotionEditor
              key={tab}
              fill
              content={activeContent}
              onChange={activeOnChange}
              placeholder={activePlaceholder}
              minHeight="300px"
            />
          ) : (
            <div className="flex-1 min-h-0 overflow-y-auto">
              {activeContent ? (
                <RichTextDisplay content={activeContent} className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed" />
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">{onBriefing ? 'Sem briefing.' : 'Sem entrega registrada.'}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

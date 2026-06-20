import { useState, useRef, useEffect } from 'react';
import NotionEditor from '../../../components/ui/NotionEditor';
import RichTextDisplay from './RichTextDisplay';
import { OPERACAO_QUALITY, scoreQualityChecklist } from '../../../lib/qualityChecklist';
import { notaColor } from '../../../lib/productivity';

const MIN_W = 360;
const STORAGE_KEY = 'briefing-drawer-width';

// Checklist de qualidade que o supervisor preenche ao revisar a tarefa.
// Cada critério recebe uma nota de 1 a 5; a qualidade é a MÉDIA PONDERADA (peso
// por critério). Nota abaixo de 5 EXIGE justificativa.
const ratingColor = (n) => (n >= 4 ? '#10b981' : n === 3 ? '#f59e0b' : '#ef4444');

// O que cada nota significa — vira legenda no topo e tooltip em cada botão.
const RATING_LABELS = {
  1: 'Muito abaixo do esperado',
  2: 'Abaixo do esperado',
  3: 'Regular — mínimo aceitável',
  4: 'Bom — no esperado',
  5: 'Excelente — superou',
};

function QualityChecklist({ initial, initialNotes, onChange, onSubmit, submitLabel = 'Concluir avaliação' }) {
  const [ans, setAns] = useState(initial || {});
  const [notes, setNotes] = useState(initialNotes || {});
  const { avg, pct } = scoreQualityChecklist(ans);
  const set = (id, v) => setAns((a) => {
    const next = { ...a, [id]: a[id] === v ? undefined : v };
    onChange?.(next, notes); // autosave do rascunho — fechar não perde
    return next;
  });
  const setNote = (id, text) => setNotes((n) => {
    const next = { ...n, [id]: text };
    onChange?.(ans, next);
    return next;
  });
  // Toda nota dada (1–5) exige justificativa — inclusive 5 ("por que foi 5?").
  // N/A e itens sem nota não pedem.
  const needsJustify = (c) => typeof ans[c.id] === 'number';
  const missing = OPERACAO_QUALITY.some((c) => needsJustify(c) && !(notes[c.id] || '').trim());
  const baseBtn = 'text-[10px] font-medium w-6 py-0.5 rounded border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50';
  return (
    <div className="mt-2 w-full rounded-lg border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/60 dark:bg-slate-800/30">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Avaliação de qualidade</span>
        <span className="text-sm font-bold tabular-nums" style={{ color: notaColor(avg == null ? null : avg * 2) }}>
          {avg == null ? '—' : `${avg.toFixed(1)}/5`} {pct != null && <span className="text-[10px] font-normal text-slate-400">· {pct}%</span>}
        </span>
      </div>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1.5">Nota de 1 a 5 por critério (peso ao lado) · média ponderada · N/A = não se aplica · <span className="font-medium text-slate-500 dark:text-slate-300">toda nota exige justificativa</span></p>
      {/* Legenda: o que cada nota quer dizer */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mb-2.5 text-[10px]">
        {[1, 2, 3, 4, 5].map((n) => (
          <span key={n} className="inline-flex items-center gap-1">
            <span className="font-bold tabular-nums" style={{ color: ratingColor(n) }}>{n}</span>
            <span className="text-slate-400 dark:text-slate-500">{RATING_LABELS[n]}</span>
          </span>
        ))}
        <span className="inline-flex items-center gap-1">
          <span className="font-bold text-slate-400">N/A</span>
          <span className="text-slate-400 dark:text-slate-500">não se aplica</span>
        </span>
      </div>
      <div className="space-y-2.5">
        {OPERACAO_QUALITY.map((c) => (
          <div key={c.id}>
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[12px] text-slate-700 dark:text-slate-200 leading-snug">{c.label}</span>
              <span className="text-[10px] text-slate-400 shrink-0">peso {c.weight}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              <button type="button" onClick={() => set(c.id, 'na')} title="Não se aplica / em progresso"
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ans[c.id] === 'na' ? 'bg-slate-400 text-white' : 'border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}`}>N/A</button>
              {[1, 2, 3, 4, 5].map((n) => {
                const active = ans[c.id] === n;
                return (
                  <button key={n} type="button" onClick={() => set(c.id, n)} title={`${n} · ${RATING_LABELS[n]}`}
                    className={active ? 'text-[10px] font-medium w-6 py-0.5 rounded text-white' : baseBtn}
                    style={active ? { backgroundColor: ratingColor(n) } : undefined}>{n}</button>
                );
              })}
            </div>
            {needsJustify(c) && (
              <input
                type="text"
                value={notes[c.id] || ''}
                onChange={(e) => setNote(c.id, e.target.value)}
                placeholder={`Por que a nota ${ans[c.id]}? (obrigatório)`}
                className={`mt-1.5 w-full text-[11px] px-2 py-1 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-fyness-primary border ${(notes[c.id] || '').trim() ? 'border-slate-200 dark:border-slate-600' : 'border-rose-300 dark:border-rose-700'}`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <button type="button" disabled={missing} onClick={() => !missing && onSubmit({ answers: ans, notes, avg, pct })}
          title={missing ? 'Justifique a nota de cada critério' : ''}
          className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{submitLabel}</button>
      </div>
      {missing && <p className="text-[10px] text-rose-500 dark:text-rose-400 mt-1.5">Justifique a nota de cada critério pra concluir.</p>}
    </div>
  );
}

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
// Análise de qualidade em modo LEITURA (critérios + nota dada + justificativa + %).
function QualityChecklistDisplay({ answers, notes, pct }) {
  const { avg } = scoreQualityChecklist(answers || {});
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Análise de qualidade</span>
        <span className="text-sm font-bold tabular-nums" style={{ color: notaColor(avg == null ? null : avg * 2) }}>
          {avg == null ? '—' : `${avg.toFixed(1)}/5`} {pct != null && <span className="text-[10px] font-normal text-slate-400">· {pct}%</span>}
        </span>
      </div>
      <div className="space-y-2">
        {OPERACAO_QUALITY.map((c) => {
          const v = answers?.[c.id];
          const isNa = v === 'na' || v == null;
          const score = typeof v === 'number' ? v : null;
          return (
            <div key={c.id}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[12px] text-slate-700 dark:text-slate-200 leading-snug">{c.label} <span className="text-[10px] text-slate-400">· peso {c.weight}</span></span>
                <span className="text-[11px] font-medium tabular-nums shrink-0 text-slate-500 dark:text-slate-400">{isNa ? 'N/A' : `${score}/5`}</span>
              </div>
              {!isNa && (
                <div className="mt-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700/50 overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(score / 5) * 100}%`, backgroundColor: notaColor(score * 2) }} />
                </div>
              )}
              {notes?.[c.id] && <p className="text-[11px] text-slate-400 dark:text-slate-500 italic mt-1">“{notes[c.id]}”</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const critLabel = (id) => OPERACAO_QUALITY.find((c) => c.id === id)?.label || null;

/**
 * Contestação da nota de qualidade.
 *  - Executor (recebe onFile, sem onResolve): vê a avaliação e pode DISCORDAR
 *    com uma defesa escrita (e, opcionalmente, apontar o critério).
 *  - Supervisor / 3º (recebe onResolve): vê a contestação aberta e decide —
 *    "Reavaliar" reabre o checklist pra mudar a nota, ou "Manter" mantém.
 *  - Todos veem o desfecho quando resolvida.
 */
function DisputeBlock({ dispute, qualityAnswers, qualityNotes, currentPct, onFile, onResolve }) {
  const [filing, setFiling] = useState(false);
  const [reason, setReason] = useState('');
  const [criterion, setCriterion] = useState('');
  const [resolving, setResolving] = useState(null); // null | 'reeval' | 'keep'
  const [note, setNote] = useState('');
  const canResolve = !!onResolve;
  const canFile = !!onFile && !canResolve;

  // Resolvida — desfecho visível pra todos.
  if (dispute?.status === 'resolved') {
    const changed = dispute.outcome === 'changed';
    return (
      <div className={`mt-2.5 rounded-lg border p-3 ${changed ? 'border-emerald-200 bg-emerald-50/60 dark:border-emerald-800/40 dark:bg-emerald-900/15' : 'border-slate-200 bg-slate-50/60 dark:border-slate-700 dark:bg-slate-800/30'}`}>
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{changed ? 'Nota ajustada após contestação' : 'Nota mantida após contestação'}</span>
          {changed && dispute.prevPct != null && currentPct != null && (
            <span className="text-[10px] font-medium tabular-nums text-slate-400">{dispute.prevPct}% → {currentPct}%</span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">Contestação de <b className="font-medium text-slate-600 dark:text-slate-300">{dispute.by}</b>{dispute.criterion ? ` · sobre "${critLabel(dispute.criterion)}"` : ''}: <span className="italic">“{dispute.reason}”</span></p>
        {dispute.resolutionNote && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Decisão de <b className="font-medium text-slate-600 dark:text-slate-300">{dispute.resolvedBy}</b>: <span className="italic">“{dispute.resolutionNote}”</span></p>}
      </div>
    );
  }

  // Aberta.
  if (dispute?.status === 'open') {
    if (canResolve) {
      return (
        <div className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50/60 dark:border-amber-800/40 dark:bg-amber-900/15 p-3">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">Contestação aberta</span>
          <p className="text-[12px] text-slate-700 dark:text-slate-200 mt-1"><b className="font-medium">{dispute.by}</b> discorda{dispute.criterion ? ` do critério “${critLabel(dispute.criterion)}”` : ' da nota'}:</p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 italic mt-1 pl-2 border-l-2 border-amber-300 dark:border-amber-700">“{dispute.reason}”</p>
          {resolving === 'reeval' ? (
            <div className="mt-2">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1">Revise as notas e salve a nova avaliação:</p>
              <QualityChecklist initial={qualityAnswers} initialNotes={qualityNotes} submitLabel="Salvar nova nota"
                onSubmit={(q) => onResolve({ outcome: 'changed', quality: q })} />
              <button type="button" onClick={() => setResolving(null)} className="text-[11px] text-slate-400 hover:text-slate-600 mt-1">cancelar</button>
            </div>
          ) : resolving === 'keep' ? (
            <div className="mt-2 space-y-1.5">
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                placeholder="Por que está mantendo a nota? (opcional)"
                className="w-full text-[11px] px-2 py-1.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-fyness-primary" />
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => onResolve({ outcome: 'kept', note: note.trim() || null })}
                  className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-slate-600 text-white hover:bg-slate-700 transition-colors">Confirmar manutenção</button>
                <button type="button" onClick={() => setResolving(null)} className="text-[11px] text-slate-400 hover:text-slate-600">cancelar</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 mt-2.5">
              <button type="button" onClick={() => setResolving('reeval')}
                className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">Reavaliar nota</button>
              <button type="button" onClick={() => setResolving('keep')}
                className="text-[11px] font-medium px-3 py-1.5 rounded-md border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">Manter nota</button>
            </div>
          )}
        </div>
      );
    }
    // Visão do executor (ou observador): contestação enviada.
    return (
      <div className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50/60 dark:border-amber-800/40 dark:bg-amber-900/15 p-3">
        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">⏳ Contestação enviada · aguardando decisão</span>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1">“{dispute.reason}”{dispute.criterion ? ` — sobre “${critLabel(dispute.criterion)}”` : ''}</p>
      </div>
    );
  }

  // Sem contestação — só o executor pode abrir.
  if (!canFile) return null;
  return (
    <div className="mt-2.5">
      {filing ? (
        <div className="rounded-lg border border-orange-200 bg-orange-50/50 dark:border-orange-800/40 dark:bg-orange-900/15 p-3 space-y-2">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-400">Discordo da avaliação</span>
          <select value={criterion} onChange={(e) => setCriterion(e.target.value)}
            className="w-full text-[11px] px-2 py-1.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-fyness-primary">
            <option value="">Discordância geral (todos os critérios)</option>
            {OPERACAO_QUALITY.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3}
            placeholder="Explique por que você discorda da nota. Dê o contexto / a prova do que foi feito..."
            className="w-full text-[11px] px-2 py-1.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-1 focus:ring-fyness-primary" />
          <div className="flex items-center gap-2">
            <button type="button" disabled={!reason.trim()} onClick={() => onFile({ reason: reason.trim(), criterion: criterion || null })}
              className="text-[11px] font-medium px-3 py-1.5 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Enviar contestação</button>
            <button type="button" onClick={() => { setFiling(false); setReason(''); setCriterion(''); }} className="text-[11px] text-slate-400 hover:text-slate-600">cancelar</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setFiling(true)}
          className="text-[11px] font-medium px-2.5 py-1.5 rounded-md border border-orange-300 text-orange-600 dark:border-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors">Discordar desta avaliação</button>
      )}
    </div>
  );
}

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
  qualityPct,
  qualityAnswers,
  qualityNotes,
  qualityDispute,
  onReview,
  onQualityDraft,
  onFileDispute,
  onResolveDispute,
  canReview = true,
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

  // Responsivo: em tela estreita (< 640px) o drawer vira sheet de tela cheia;
  // no desktop continua lateral e redimensionável.
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

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

  // Trava o scroll do fundo enquanto o painel está aberto.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const qualityHasData = (qualityAnswers && Object.keys(qualityAnswers).length > 0) || qualityPct != null;
  // Contestação: só faz sentido quando a tarefa já foi avaliada (nota final) e
  // não está com a revisão em andamento — ou quando já existe uma contestação.
  const finalEvaluated = reviewStatus === 'approved' || (!onReview && qualityHasData);
  const showDispute = (finalEvaluated && reviewStatus !== 'review') || !!qualityDispute;

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
        className={`relative h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700 shadow-glass-lg flex flex-col animate-slide-in-right ${isMobile ? 'w-full' : ''}`}
        style={isMobile ? undefined : { width }}
      >
        {/* Handle de redimensionamento — arraste pra mudar a largura (só desktop) */}
        {!isMobile && (
          <div
            onMouseDown={startDrag}
            title="Arraste para redimensionar"
            className="absolute left-0 top-0 h-full w-1.5 -ml-1 cursor-col-resize z-20 hover:bg-fyness-primary/40 active:bg-fyness-primary/60 transition-colors"
          />
        )}

        <div className="flex items-start justify-between gap-3 p-5 pb-3 border-b border-slate-200 dark:border-slate-700 shrink-0">
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

            {/* Leitura: já avaliada (sem ações de revisão) */}
            {!onReview && qualityHasData && (
              <div className="mt-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                  Avaliado{qualityPct != null ? ` · ${qualityPct}% qualidade` : ''}
                </span>
              </div>
            )}

            {/* Barra de revisao do supervisor — nivel da tarefa */}
            {onReview && (
              <div className="mt-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    reviewStatus === 'review' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                    reviewStatus === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    reviewStatus === 'changes' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                    'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                  }`}>
                    {reviewStatus === 'review' ? 'Em revisao' : reviewStatus === 'approved' ? 'Avaliado' : reviewStatus === 'changes' ? 'Ajuste pedido' : 'Rascunho'}
                    {(reviewStatus === 'approved' || reviewStatus === 'changes') && reviewBy ? ` · ${reviewBy}` : ''}
                    {reviewStatus === 'approved' && qualityPct != null ? ` · ${qualityPct}% qualidade` : ''}
                  </span>
                  {reviewStatus === 'approved' ? (
                    canReview ? <button type="button" onClick={() => onReview('draft')} className="text-[11px] font-medium px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">Reabrir</button> : null
                  ) : reviewStatus !== 'review' ? (
                    <button type="button" onClick={() => onReview('review')} className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-fyness-primary text-white hover:bg-fyness-secondary transition-colors">Pronto pra revisar</button>
                  ) : null}
                </div>
                {/* O checklist de qualidade (alto) foi movido pro corpo rolável
                    abaixo — antes ficava aqui no header fixo e espremia o briefing. */}
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

        {/* Corpo: UMA coluna rolável — briefing/entrega + (supervisor) avaliação
            de qualidade + contestação. Antes o checklist ficava no header fixo e
            espremia o briefing num filete; agora tudo rola junto e o briefing
            mantém sua altura (min 320px, scroll interno até 50vh). */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-5 flex flex-col gap-5">
            {editable ? (
              <NotionEditor
                key={tab}
                content={activeContent}
                onChange={activeOnChange}
                placeholder={activePlaceholder}
                minHeight="320px"
              />
            ) : (
              activeContent ? (
                <RichTextDisplay content={activeContent} className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed" />
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">{onBriefing ? 'Sem briefing.' : 'Sem entrega registrada.'}</p>
              )
            )}

            {/* Supervisor: avaliação de qualidade (quando "pronto pra revisar") */}
            {onReview && reviewStatus === 'review' && (
              canReview ? (
                <QualityChecklist
                  initial={qualityAnswers}
                  initialNotes={qualityNotes}
                  onChange={onQualityDraft}
                  onSubmit={(q) => onReview('approved', q)}
                />
              ) : (
                <p className="text-[12px] text-slate-400 dark:text-slate-500 italic">Aguardando a avaliação do supervisor da O.S.</p>
              )
            )}

            {/* Contestação da nota (executor discorda → supervisor/3º decide) */}
            {showDispute && (
              <DisputeBlock
                dispute={qualityDispute}
                qualityAnswers={qualityAnswers}
                qualityNotes={qualityNotes}
                currentPct={qualityPct}
                onFile={onFileDispute}
                onResolve={onResolveDispute}
              />
            )}

            {/* Leitura: avaliação já dada (modo não-supervisor) */}
            {!onReview && qualityHasData && (
              <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                <QualityChecklistDisplay answers={qualityAnswers} notes={qualityNotes} pct={qualityPct} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

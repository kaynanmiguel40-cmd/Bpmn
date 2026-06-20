/**
 * osReview - transições PURAS do ciclo de vida de um item de O.S.:
 *   briefing → entrega → revisão (qualidade) → contestação.
 *
 * Cada função recebe o `checklist` (array de itens da O.S.) e devolve um NOVO
 * checklist, sem efeitos colaterais. Quem dispara (FinancialPage) cuida do
 * persistir (onUpdateOrder), notificar e do `now`/autor — assim a lógica fica
 * determinística e testável.
 */

import { scoreQualityChecklist } from './qualityChecklist';

const mapItem = (checklist, itemId, fn) =>
  (checklist || []).map((i) => (i.id === itemId ? fn(i) : i));

// "Tem conteúdo de verdade" = texto OU mídia (print colado, tabela, vídeo).
// Uma entrega que é só um print não pode ser tratada como vazia.
export function hasMeaning(html) {
  if (!html) return false;
  const stripped = String(html).replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
  return !!stripped || /<(img|table|iframe)/i.test(html);
}

// Salva o briefing e carimba o autor na PRIMEIRA vez que ganha conteúdo.
// Esvaziar limpa o carimbo (não fica "criado por" fantasma).
export function setBriefing(checklist, itemId, briefing, { by, at } = {}) {
  return mapItem(checklist, itemId, (i) => {
    const next = { ...i, briefing };
    if (!hasMeaning(briefing)) { next.briefingBy = null; next.briefingAt = null; }
    else if (!i.briefingBy) { next.briefingBy = by || 'Voce'; next.briefingAt = at; }
    return next;
  });
}

// Idem para a entrega.
export function setDelivery(checklist, itemId, delivery, { by, at } = {}) {
  return mapItem(checklist, itemId, (i) => {
    const next = { ...i, delivery };
    if (!hasMeaning(delivery)) { next.deliveryBy = null; next.deliveryAt = null; }
    else if (!i.deliveryBy) { next.deliveryBy = by || 'Voce'; next.deliveryAt = at; }
    return next;
  });
}

// Status de revisão: draft → review → approved/changes (e reabrir → draft).
// Ao aprovar com `quality` (checklist preenchido), grava a nota na tarefa.
export function applyReview(checklist, itemId, status, quality = null, { by, at } = {}) {
  return mapItem(checklist, itemId, (i) => ({
    ...i,
    reviewStatus: status,
    reviewBy: by || 'Voce',
    reviewAt: at,
    ...(quality ? { qualityPct: quality.pct, qualityAnswers: quality.answers, qualityNotes: quality.notes } : {}),
  }));
}

// Autosave do checklist de qualidade (rascunho): recalcula o % a cada marcação.
export function applyQualityDraft(checklist, itemId, answers, notes) {
  const { pct } = scoreQualityChecklist(answers);
  return mapItem(checklist, itemId, (i) => ({ ...i, qualityAnswers: answers, qualityNotes: notes, qualityPct: pct }));
}

// O executor DISCORDA da nota: abre uma contestação escrita (opcionalmente
// sobre um critério). Não muda a nota — só registra o pedido.
export function fileDispute(checklist, itemId, { reason, criterion } = {}, { by, byId, at } = {}) {
  return mapItem(checklist, itemId, (i) => ({
    ...i,
    qualityDispute: { status: 'open', by: by || 'Voce', byId: byId || null, criterion: criterion || null, reason, at },
  }));
}

// Supervisor/3º DECIDE a contestação:
//  - outcome 'changed' + quality → muda a nota (guarda a anterior em prevPct).
//  - outcome 'kept'              → mantém a nota.
export function resolveDispute(checklist, itemId, { outcome, note, quality } = {}, { by, at } = {}) {
  return mapItem(checklist, itemId, (i) => {
    const prev = i.qualityDispute || {};
    const dispute = {
      ...prev, status: 'resolved', outcome,
      resolutionNote: note || null, resolvedBy: by || 'Voce', resolvedAt: at,
      prevPct: i.qualityPct ?? null,
    };
    if (outcome === 'changed' && quality) {
      return { ...i, reviewBy: by || i.reviewBy, reviewAt: at, qualityPct: quality.pct, qualityAnswers: quality.answers, qualityNotes: quality.notes, qualityDispute: dispute };
    }
    return { ...i, qualityDispute: dispute };
  });
}

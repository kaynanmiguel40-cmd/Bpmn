/**
 * osTimer - cronômetro de tarefa de O.S. (transições PURAS).
 *
 * É um CRONÔMETRO de verdade: "Pegar" começa do ZERO e conta o tempo REAL
 * (relógio) trabalhado; "Pausar"/"Retomar" congela e volta; "Finalizar" para e
 * marca como entregue. O total fica em `accumulatedMin` (sobrevive a pausa e a
 * reabrir). NÃO há tempo fantasma: finalizar sem ter pego = 0 min.
 *
 * Cada função recebe o `checklist` + o id do item + um `at` (ISO, o "agora") e
 * devolve um NOVO checklist. Quem dispara (FinancialPage) cuida do persistir e
 * do `at` — assim a lógica fica determinística e testável.
 */

const mapItem = (checklist, itemId, fn) =>
  (checklist || []).map((i) => (i.id === itemId ? fn(i) : i));

/** Minutos REAIS (relógio) entre dois ISO, com precisão de SEGUNDOS (fracionário).
 *  NÃO arredonda pra minuto cheio — senão a pausa perderia os segundos (40:30 → 40)
 *  e segmentos curtos (<30s) somariam 0 e o tempo nunca progrediria. 0 se inválido. */
const realMin = (from, at) => {
  const ms = new Date(at).getTime() - new Date(from).getTime();
  return Number.isFinite(ms) && ms > 0 ? Math.round(ms / 1000) / 60 : 0;
};

/** "Pegar" — começa o cronômetro do zero. Se já está rodando, não reinicia. */
export function startTask(checklist, itemId, { at } = {}) {
  return mapItem(checklist, itemId, (i) => {
    if (i.done) return i;
    if (i.startedAt && !i.pausedAt) return i; // já rodando
    return { ...i, startedAt: at, pausedAt: null, accumulatedMin: i.accumulatedMin || 0 };
  });
}

/** "Pausar" — congela o tempo rodado em accumulatedMin. */
export function pauseTask(checklist, itemId, { at } = {}) {
  return mapItem(checklist, itemId, (i) => {
    if (i.done || i.pausedAt || !i.startedAt) return i; // não está rodando
    return { ...i, accumulatedMin: (i.accumulatedMin || 0) + realMin(i.startedAt, at), pausedAt: at };
  });
}

/** "Retomar" — volta a rodar (o acumulado já está em accumulatedMin). */
export function resumeTask(checklist, itemId, { at } = {}) {
  return mapItem(checklist, itemId, (i) => {
    if (i.done || !i.pausedAt) return i;
    return { ...i, startedAt: at, pausedAt: null };
  });
}

/**
 * "Finalizar" — para o cronômetro e marca como entregue. Soma o segmento em
 * andamento (se estava rodando). Sem startedAt (nunca pego) = 0 min, sem fantasma.
 */
export function finishTask(checklist, itemId, { at } = {}) {
  return mapItem(checklist, itemId, (i) => {
    if (i.done) return i;
    let acc = i.accumulatedMin || 0;
    if (i.startedAt && !i.pausedAt) acc += realMin(i.startedAt, at);
    acc = Math.max(0, Math.round(acc));
    return { ...i, done: true, completedAt: at, durationMin: acc, accumulatedMin: acc, pausedAt: null };
  });
}

/** "Reabrir" — desmarca, PRESERVANDO o tempo já acumulado (não apaga o trabalho). */
export function reopenTask(checklist, itemId) {
  return mapItem(checklist, itemId, (i) => {
    if (!i.done) return i;
    return { ...i, done: false, completedAt: null, durationMin: null, pausedAt: null, startedAt: null };
  });
}

/**
 * Minutos trabalhados (AO VIVO): acumulado + o segmento rodando agora.
 * Use no display do cronômetro — recalcula sozinho a cada render/tick.
 */
export function workedMinutes(item, atIso) {
  if (!item) return 0;
  const base = item.accumulatedMin || 0;
  if (item.done || item.pausedAt || !item.startedAt) return Math.round(base);
  return Math.round(base + realMin(item.startedAt, atIso || new Date().toISOString()));
}

/**
 * SEGUNDOS trabalhados ao vivo (acumulado + segmento rodando em segundos).
 * Pro display tipo stopwatch (MM:SS) que tica a cada 1s. `atMs` = Date.now().
 */
export function workedSeconds(item, atMs) {
  if (!item) return 0;
  const base = Math.round((item.accumulatedMin || 0) * 60);
  if (item.done || item.pausedAt || !item.startedAt) return base;
  const now = atMs || Date.now();
  const elapsed = Math.max(0, Math.floor((now - new Date(item.startedAt).getTime()) / 1000));
  return base + elapsed;
}

/** Estado do cronômetro: 'idle' | 'running' | 'paused' | 'done'. */
export function timerState(item) {
  if (item?.done) return 'done';
  if (item?.pausedAt) return 'paused';
  if (item?.startedAt) return 'running';
  return 'idle';
}

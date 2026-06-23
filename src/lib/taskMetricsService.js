/**
 * taskMetricsService - BASE de produtividade (camada 1).
 *
 * Grava 1 linha em `task_completions` cada vez que uma tarefa de O.S. é
 * concluída (pessoa, setor, prazo, tempo real) e atualiza a qualidade quando o
 * supervisor revisa. É o banco em cima do qual vamos aprender padrões de tempo
 * e calcular a nota de produtividade.
 *
 * Tudo é fire-and-forget e silencioso em erro: NUNCA pode travar a conclusão da
 * tarefa na O.S. Fica em src/lib (fora do módulo CRM).
 */

import { supabase } from './supabase';
import { getOSProjects, getOSSectors } from './osService';

// "Relógio de parede": dueAt com hora é rotulado UTC (a hora escolhida) →
// componentes UTC; completedAt é UTC REAL → componentes LOCAIS. Compara os dois
// no mesmo referencial pra o "no prazo" não errar por causa do fuso.
const wallMs = (iso, asUtc) => {
  const d = new Date(iso); if (isNaN(d.getTime())) return NaN;
  return asUtc
    ? Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes())
    : Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes());
};

// ---- cache de projetos/setores pra derivar o setor do trabalho ----
let _proj = null, _sec = null, _cacheAt = 0;
async function sectorMaps() {
  const now = Date.now();
  if (!_proj || now - _cacheAt > 5 * 60 * 1000) {
    try {
      const [projects, sectors] = await Promise.all([getOSProjects(), getOSSectors()]);
      _proj = {}; for (const p of (projects || [])) _proj[p.id] = p;
      _sec = {}; for (const s of (sectors || [])) _sec[s.id] = s;
      _cacheAt = now;
    } catch { _proj = _proj || {}; _sec = _sec || {}; }
  }
  return { proj: _proj, sec: _sec };
}

// Quem executou: responsável do item → do grupo (item.group) → da O.S.
function resolvePerson(order, item) {
  if (item.assigneeName || item.assigneeId) return { id: item.assigneeId || null, name: item.assigneeName || '' };
  const groups = Array.isArray(order.checklistGroups) ? order.checklistGroups : [];
  const g = item.group ? groups.find((x) => x.name === item.group) : null;
  if (g) {
    const a = (Array.isArray(g.assignees) && g.assignees.length) ? g.assignees[0]
      : (g.assigneeId || g.assigneeName) ? { id: g.assigneeId, name: g.assigneeName } : null;
    if (a) return { id: a.id || null, name: a.name || '' };
  }
  if (order.mode === 'team' && Array.isArray(order.participants) && order.participants.length) {
    return { id: order.participants[0].id || null, name: order.participants[0].name || '' };
  }
  return { id: order.assignedTo || null, name: order.assignee || '' };
}

// Prazo vigente do item: item → grupo → entrega da O.S.
function resolveDueAt(order, item) {
  if (item.dueAt) return item.dueAt;
  const groups = Array.isArray(order.checklistGroups) ? order.checklistGroups : [];
  const g = item.group ? groups.find((x) => x.name === item.group) : null;
  if (g && g.dueAt) return g.dueAt;
  return order.estimatedEnd || null;
}

/** Grava/atualiza o registro de uma tarefa concluída. */
export async function recordTaskCompletion(order, item, completedBy) {
  if (!order?.id || !item?.id) return;
  try {
    const { proj, sec } = await sectorMaps();
    const project = order.projectId ? proj[order.projectId] : null;
    const secId = project?.sector || null;
    const sector = secId ? sec[secId] : null;
    const person = resolvePerson(order, item);
    const dueAt = resolveDueAt(order, item);
    const completedAt = item.completedAt || new Date().toISOString();
    const realMinutes = item.accumulatedMin ?? item.durationMin ?? null;
    // No prazo? dueAt só-data ('YYYY-MM-DD') = fim do dia LOCAL. dueAt com hora é
    // "wall clock" rotulado UTC; completedAt é UTC real → compara relógio de
    // parede (senao o offset do fuso falsearia o "no prazo").
    let onTime = null;
    if (dueAt) {
      onTime = /^\d{4}-\d{2}-\d{2}$/.test(dueAt)
        ? (new Date(completedAt) <= new Date(`${dueAt}T23:59:59.999`))
        : (wallMs(completedAt, false) <= wallMs(dueAt, true));
    }

    const row = {
      order_id: String(order.id),
      task_id: String(item.id),
      task_text: item.text || '',
      group_name: item.group || null,
      assignee_id: person.id ? String(person.id) : null,
      assignee_name: person.name || null,
      project_id: order.projectId || null,
      sector_id: secId,
      sector_label: sector?.label || null,
      estimated_minutes: item.estimatedMinutes ?? null,
      real_minutes: realMinutes,
      due_at: dueAt,
      started_at: item.startedAt || null,
      completed_at: completedAt,
      on_time: onTime,
      completed_by: completedBy || null,
      review_status: item.reviewStatus || null,
      reviewed_at: item.reviewAt || null,
      reviewed_by: item.reviewBy || null,
      updated_at: new Date().toISOString(),
    };
    await supabase.from('task_completions').upsert(row, { onConflict: 'order_id,task_id' });
  } catch { /* silencioso — base é secundária, não pode travar a O.S. */ }
}

/** Atualiza a qualidade (revisão do supervisor) de uma tarefa já registrada. */
export async function recordTaskReview({ orderId, taskId, reviewStatus, reviewedBy, qualityPct = null, qualityAnswers = null }) {
  if (!orderId || !taskId) return;
  try {
    await supabase.from('task_completions')
      .update({
        review_status: reviewStatus || null,
        reviewed_by: reviewedBy || null,
        reviewed_at: new Date().toISOString(),
        quality_pct: qualityPct,
        quality_answers: qualityAnswers,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', String(orderId)).eq('task_id', String(taskId));
  } catch { /* silencioso */ }
}

/** Remove o registro (tarefa desmarcada). */
export async function removeTaskCompletion(orderId, taskId) {
  if (!orderId || !taskId) return;
  try {
    await supabase.from('task_completions').delete().eq('order_id', String(orderId)).eq('task_id', String(taskId));
  } catch { /* silencioso */ }
}

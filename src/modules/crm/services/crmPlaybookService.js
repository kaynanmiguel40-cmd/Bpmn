/**
 * crmPlaybookService — o processo de cada etapa do funil.
 *
 * Duas metades:
 *  - DEFINICAO (por etapa, igual pra todo lead): objetivo, passos com script,
 *    e o criterio de saida (quando mover o lead).
 *  - ESTADO (por negocio): quais passos ja foram feitos, por quem e quando.
 *
 * O checklist do lead NAO copia os passos pra dentro do deal: ele referencia o
 * passo da etapa. Assim editar o playbook vale na hora pra todo mundo, em vez
 * de deixar leads antigos rodando uma versao velha do processo em silencio.
 */

import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';

// ==================== TRANSFORMADORES ====================

export function dbToStep(row) {
  if (!row) return null;
  return {
    id: row.id,
    stageId: row.stage_id,
    position: row.position ?? 0,
    title: row.title || '',
    script: row.script || '',
  };
}

export function dbToProgress(row) {
  if (!row) return null;
  return {
    id: row.id,
    dealId: row.deal_id,
    stepId: row.step_id,
    doneAt: row.done_at,
    doneBy: row.done_by || null,
  };
}

// ==================== DEFINICAO (playbook da etapa) ====================

/** Passos de todas as etapas de uma pipeline, agrupados por stageId. */
export async function getPlaybookByPipeline(pipelineId) {
  if (!pipelineId) return {};

  const { data: stages, error: stErr } = await supabase
    .from('crm_pipeline_stages')
    .select('id')
    .eq('pipeline_id', pipelineId);
  if (stErr) { console.error('[getPlaybookByPipeline] etapas', stErr.message); throw stErr; }

  const stageIds = (stages || []).map(s => s.id);
  if (stageIds.length === 0) return {};

  const { data, error } = await supabase
    .from('crm_stage_steps')
    .select('*')
    .in('stage_id', stageIds)
    .order('position', { ascending: true });
  if (error) { console.error('[getPlaybookByPipeline] passos', error.message); throw error; }

  const byStage = {};
  for (const row of data || []) {
    const step = dbToStep(row);
    (byStage[step.stageId] ||= []).push(step);
  }
  return byStage;
}

/**
 * Substitui os passos de uma etapa reconciliando por id:
 *   com id  -> UPDATE (preserva o progresso dos leads que ja marcaram)
 *   sem id  -> INSERT
 *   sumiu   -> DELETE (o progresso vai junto pelo ON DELETE CASCADE)
 *
 * Reconciliar em vez de "apaga tudo e insere de novo" e o que preserva o
 * checklist: recriar os passos geraria ids novos e todo lead apareceria como
 * se nunca tivesse feito nada.
 */
export async function saveStageSteps(stageId, steps) {
  if (!stageId) return null;
  const list = Array.isArray(steps) ? steps : [];

  const { data: current = [], error: curErr } = await supabase
    .from('crm_stage_steps')
    .select('id')
    .eq('stage_id', stageId);
  if (curErr) { console.error('[saveStageSteps] atual', curErr.message); toast('Nao consegui salvar o processo', 'error'); return null; }

  const keptIds = new Set(list.map(s => s.id).filter(Boolean));
  const removed = (current || []).filter(r => !keptIds.has(r.id));

  for (const rem of removed) {
    const { error } = await supabase.from('crm_stage_steps').delete().eq('id', rem.id);
    if (error) console.warn('[saveStageSteps] falha ao remover passo', rem.id, error.message);
  }

  for (let i = 0; i < list.length; i++) {
    const s = list[i];
    const payload = {
      stage_id: stageId,
      position: i,
      title: (s.title || '').trim() || 'Passo',
      script: (s.script || '').trim() || null,
    };
    const { error } = s.id
      ? await supabase.from('crm_stage_steps').update(payload).eq('id', s.id)
      : await supabase.from('crm_stage_steps').insert(payload);
    if (error) {
      console.error('[saveStageSteps] gravar', error.message);
      toast('Nao consegui salvar o processo', 'error');
      return null;
    }
  }

  return true;
}

/** Objetivo e criterio de saida vivem na propria etapa. */
export async function saveStageGoal(stageId, { objetivo, exitCriteria }) {
  if (!stageId) return null;
  const { error } = await supabase
    .from('crm_pipeline_stages')
    .update({
      objetivo: (objetivo || '').trim() || null,
      exit_criteria: (exitCriteria || '').trim() || null,
    })
    .eq('id', stageId);
  if (error) {
    console.error('[saveStageGoal]', error.message);
    toast('Nao consegui salvar o objetivo da etapa', 'error');
    return null;
  }
  return true;
}

// ==================== ESTADO (checklist do lead) ====================

/** Ids dos passos que este negocio ja cumpriu. */
export async function getDealProgress(dealId) {
  if (!dealId) return [];
  const { data, error } = await supabase
    .from('crm_deal_step_progress')
    .select('*')
    .eq('deal_id', dealId);
  if (error) { console.error('[getDealProgress]', error.message); throw error; }
  return (data || []).map(dbToProgress);
}

/**
 * Marca/desmarca um passo pro negocio.
 *
 * O UNIQUE(deal_id, step_id) faz o insert falhar em corrida (dois cliques) em
 * vez de duplicar — por isso 23505 (unique_violation) e tratado como sucesso:
 * o estado final e o desejado.
 */
export async function toggleDealStep(dealId, stepId, done, memberId = null) {
  if (!dealId || !stepId) return null;

  if (!done) {
    const { error } = await supabase
      .from('crm_deal_step_progress')
      .delete()
      .eq('deal_id', dealId)
      .eq('step_id', stepId);
    if (error) { console.error('[toggleDealStep] desmarcar', error.message); toast('Nao consegui desmarcar', 'error'); return null; }
    return true;
  }

  const { error } = await supabase
    .from('crm_deal_step_progress')
    .insert({ deal_id: dealId, step_id: stepId, done_by: memberId || null });
  if (error && error.code !== '23505') {
    console.error('[toggleDealStep] marcar', error.message);
    toast('Nao consegui marcar o passo', 'error');
    return null;
  }
  return true;
}

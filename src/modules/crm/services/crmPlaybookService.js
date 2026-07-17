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
    // Origem a que o passo se aplica (ex: 'trafego', 'contador'). null =
    // universal (aparece pra todo lead). Ver filterStepsForDeal.
    sourceTag: row.source_tag || null,
    // Cenarios: o que o cliente responde + como reagir. [{ when, then }].
    scenarios: Array.isArray(row.scenarios) ? row.scenarios : [],
  };
}

/**
 * Categoriza a origem (source) de um lead numa das tags de passo. Os sources sao
 * texto livre e baguncado ("Indicacao de parceiro (Edson)", "Prospeccao ativa",
 * "Trafego pago"), entao casa por PALAVRA-CHAVE, nao igualdade.
 * Parceiro cobre tambem "contador" (a parceria do negocio e com contadores).
 */
export function dealSourceCategory(source) {
  const s = (source || '').toLowerCase();
  if (!s) return null;
  if (/tr[aá]fego|an[uú]ncio|\bads?\b|pago/.test(s)) return 'trafego';
  if (/parceiro|contador/.test(s)) return 'parceiro';
  if (/insta|\bdm\b|direct|org[aâ]nic/.test(s)) return 'instagram';
  if (/indica|cliente/.test(s)) return 'cliente';
  return null;
}

/**
 * Filtra os passos de uma etapa pro lead conforme a ORIGEM dele:
 *  - passo sem tag (universal) sempre aparece;
 *  - passo com tag so aparece se casar com a categoria da origem do lead.
 * Se a etapa nao tem passo-por-origem, devolve tudo. Se tem, mas a origem do
 * lead nao casa nenhuma (desconhecida/vazia), cai pro conjunto todo — melhor
 * mostrar tudo do que deixar o vendedor sem roteiro.
 */
export function filterStepsForDeal(steps, dealSource) {
  const list = steps || [];
  if (!list.some(s => s.sourceTag)) return list;
  const cat = dealSourceCategory(dealSource);
  const matched = list.filter(s => !s.sourceTag || s.sourceTag === cat);
  return matched.some(s => s.sourceTag) ? matched : list;
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
    // Cenarios: mantem so os que tem "quando" preenchido (linha vazia = lixo).
    const scenarios = Array.isArray(s.scenarios)
      ? s.scenarios
          .map(sc => ({ when: (sc.when || '').trim(), then: (sc.then || '').trim() }))
          .filter(sc => sc.when || sc.then)
      : [];
    const payload = {
      stage_id: stageId,
      position: i,
      title: (s.title || '').trim() || 'Passo',
      script: (s.script || '').trim() || null,
      scenarios,
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

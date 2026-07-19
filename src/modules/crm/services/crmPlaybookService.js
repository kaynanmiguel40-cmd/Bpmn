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
import { planSteps, dayKey, SLOT_MINUTES } from './crmScheduling';

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
    // O que o lead respondeu/reagiu quando essa tarefa foi feita.
    outcome: row.outcome || '',
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

// ==================== AGENDAMENTO (tarefas viram atividades) ====================

// Tipo da atividade a partir do titulo do passo — so pra o icone/filtro da
// agenda fazer sentido. Nao muda comportamento.
function guessType(title) {
  const t = (title || '').toLowerCase();
  if (/liga|ligar|ligacao|ligação|telefone/.test(t)) return 'call';
  if (/whats|audio|áudio|mensagem|dm|material|cartilha|video|vídeo/.test(t)) return 'message';
  if (/reuni|demo|call/.test(t)) return 'meeting';
  return 'task';
}

/**
 * Agenda as tarefas do processo de uma etapa na AGENDA do dono do negocio.
 *
 * Cada passo vira uma atividade real, no primeiro horario livre do seu dia
 * (dayOffset), respeitando expediente 9-18 e o almoco 11-12, sem colidir com o
 * que ja existe na agenda da pessoa.
 *
 * Idempotente: passo que ja tem atividade pra este negocio e pulado — mover o
 * lead pra fora e de volta nao duplica a agenda.
 */
export async function scheduleStepsForDeal(dealId, stageId) {
  if (!dealId || !stageId) return 0;

  const { data: deal } = await supabase
    .from('crm_deals')
    .select('owner_id, contact_id, source')
    .eq('id', dealId)
    .maybeSingle();
  if (!deal) return 0;

  // PEGADINHA: crm_deals.owner_id aponta pra team_members.id, mas
  // crm_activities.assigned_to aponta pro USUARIO DE AUTH. Gravar o owner_id
  // direto faz a tarefa existir no banco e NAO aparecer na Agenda (que filtra
  // pelo usuario logado). Traduz um no outro aqui.
  let assignee = null;
  let assigneeName = null;
  if (deal.owner_id) {
    const { data: member } = await supabase
      .from('team_members')
      .select('auth_user_id, name')
      .eq('id', deal.owner_id)
      .maybeSingle();
    assignee = member?.auth_user_id || null;
    assigneeName = member?.name || null;
  }

  const { data: stepRows } = await supabase
    .from('crm_stage_steps')
    .select('id, title, position, source_tag, day_offset')
    .eq('stage_id', stageId)
    .order('position', { ascending: true });

  // So os passos que valem pra ORIGEM deste lead (mesma regra do checklist).
  const steps = filterStepsForDeal(
    (stepRows || []).map(r => ({ id: r.id, title: r.title, sourceTag: r.source_tag || null, dayOffset: r.day_offset || 0 })),
    deal.source,
  );
  if (steps.length === 0) return 0;

  // Ja agendados antes? Nao duplica.
  const { data: existing } = await supabase
    .from('crm_activities')
    .select('stage_step_id')
    .eq('deal_id', dealId)
    .is('deleted_at', null)
    .in('stage_step_id', steps.map(s => s.id));
  const already = new Set((existing || []).map(r => r.stage_step_id));
  const pending = steps.filter(s => !already.has(s.id));
  if (pending.length === 0) return 0;

  // Agenda ja ocupada do dono, na janela que vamos preencher.
  const maxOffset = Math.max(...pending.map(s => s.dayOffset || 0), 0);
  const from = new Date();
  const until = new Date();
  until.setDate(until.getDate() + maxOffset + 7); // folga pro empurrao de fim de semana
  let busyQuery = supabase
    .from('crm_activities')
    .select('start_date, end_date, assigned_to')
    .is('deleted_at', null)
    .gte('start_date', new Date(from.getFullYear(), from.getMonth(), from.getDate()).toISOString())
    .lte('start_date', until.toISOString());
  if (assignee) busyQuery = busyQuery.eq('assigned_to', assignee);
  const { data: busyRows } = await busyQuery;

  const busyByDay = {};
  (busyRows || []).forEach(r => {
    const k = dayKey(new Date(r.start_date));
    (busyByDay[k] = busyByDay[k] || []).push({ start: r.start_date, end: r.end_date || null });
  });

  const plan = planSteps(pending, busyByDay, from);
  if (plan.length === 0) return 0;

  const byId = Object.fromEntries(pending.map(s => [s.id, s]));
  const rows = plan.map(p => {
    const step = byId[p.stepId];
    const end = new Date(p.start.getTime() + SLOT_MINUTES * 60000);
    return {
      title: step.title,
      type: guessType(step.title),
      deal_id: dealId,
      contact_id: deal.contact_id || null,
      start_date: p.start.toISOString(),
      end_date: end.toISOString(),
      completed: false,
      assigned_to: assignee,
      assigned_to_name: assigneeName,
      stage_step_id: step.id,
    };
  });

  const { error } = await supabase.from('crm_activities').insert(rows);
  if (error) {
    console.error('[scheduleStepsForDeal]', error.message);
    return 0;
  }
  return rows.length;
}

/**
 * Backfill: agenda o processo dos negocios que JA estao parados numa etapa.
 *
 * O gatilho normal e a troca de etapa — quem ja estava lá antes nunca passou
 * por ele. Roda a MESMA scheduleStepsForDeal (que e idempotente), entao pode
 * ser chamado quantas vezes quiser: so cria o que falta.
 *
 * Sequencial de proposito: cada negocio precisa enxergar os horarios que os
 * anteriores acabaram de ocupar, senao a agenda do vendedor sai empilhada no
 * mesmo slot.
 */
export async function scheduleProcessForPipeline(pipelineId) {
  if (!pipelineId) return { deals: 0, created: 0 };

  const { data: deals, error } = await supabase
    .from('crm_deals')
    .select('id, stage_id')
    .eq('pipeline_id', pipelineId)
    .eq('status', 'open')
    .is('deleted_at', null)
    .not('stage_id', 'is', null);
  if (error) {
    console.error('[scheduleProcessForPipeline]', error.message);
    toast('Nao consegui agendar os processos', 'error');
    return { deals: 0, created: 0 };
  }

  let created = 0;
  let touched = 0;
  for (const d of deals || []) {
    const n = await scheduleStepsForDeal(d.id, d.stage_id);
    if (n > 0) { created += n; touched++; }
  }

  if (created > 0) toast(`${created} tarefas agendadas em ${touched} leads`, 'success');
  else toast('Todos os leads ja estao com o processo agendado', 'info');
  return { deals: touched, created };
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
export async function toggleDealStep(dealId, stepId, done, memberId = null, outcome = '') {
  if (!dealId || !stepId) return null;

  if (!done) {
    const { error } = await supabase
      .from('crm_deal_step_progress')
      .delete()
      .eq('deal_id', dealId)
      .eq('step_id', stepId);
    if (error) { console.error('[toggleDealStep] desmarcar', error.message); toast('Nao consegui desmarcar', 'error'); return null; }
    // Reabre a atividade correspondente na Agenda (se houver).
    await supabase
      .from('crm_activities')
      .update({ completed: false, completed_at: null, updated_at: new Date().toISOString() })
      .eq('deal_id', dealId)
      .eq('stage_step_id', stepId);
    return true;
  }

  const clean = (outcome || '').trim() || null;
  const { error } = await supabase
    .from('crm_deal_step_progress')
    .insert({ deal_id: dealId, step_id: stepId, done_by: memberId || null, outcome: clean });
  if (error && error.code !== '23505') {
    console.error('[toggleDealStep] marcar', error.message);
    toast('Nao consegui marcar o passo', 'error');
    return null;
  }
  // 23505 = ja estava marcado. Se veio resultado novo, atualiza (o vendedor
  // pode ter reaberto pra registrar o que o lead respondeu).
  if (error?.code === '23505' && clean) {
    await supabase
      .from('crm_deal_step_progress')
      .update({ outcome: clean })
      .eq('deal_id', dealId)
      .eq('step_id', stepId);
  }

  // PONTE COM A AGENDA: marcar no checklist conclui a atividade gerada pra esse
  // passo, levando o que o lead respondeu. Assim a tarefa some do "a fazer" da
  // Agenda em vez de ficar pendente pra sempre.
  const nowIso = new Date().toISOString();
  await supabase
    .from('crm_activities')
    .update({
      completed: true,
      completed_at: nowIso,
      updated_at: nowIso,
      ...(clean ? { delivery_report: clean } : {}),
    })
    .eq('deal_id', dealId)
    .eq('stage_step_id', stepId)
    .eq('completed', false);

  return true;
}

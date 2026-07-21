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
import { planSteps, dayKey, SLOT_MINUTES, stepChannel, horarioLembrete, findFreeSlot, atMinutes } from './crmScheduling';

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
 * Passos avulsos por id, indexados: { [stepId]: step }.
 *
 * A Agenda precisa do script/cenarios das tarefas do recorte visivel, e essas
 * tarefas podem vir de etapas de PIPELINES DIFERENTES — carregar o playbook
 * inteiro de cada uma pra achar um punhado de passos sairia caro. Aqui busca
 * so os ids que aparecem na tela.
 */
export async function getStepsByIds(ids = []) {
  const unique = [...new Set((ids || []).filter(Boolean))];
  if (unique.length === 0) return {};

  const { data, error } = await supabase
    .from('crm_stage_steps')
    .select('*')
    .in('id', unique);
  if (error) { console.error('[getStepsByIds]', error.message); throw error; }

  const byId = {};
  for (const row of data || []) {
    const step = dbToStep(row);
    byId[step.id] = step;
  }
  return byId;
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
// Fonte unica em crmScheduling.stepChannel — o mesmo canal alimenta o icone do
// checklist e o `type` da atividade na Agenda.
const guessType = stepChannel;

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
    .select('id, title, position, source_tag, day_offset, period, agendavel')
    // agendavel=false e roteiro (SPIN, metodologia): aparece na ficha mas nunca
    // vira tarefa. Filtrar aqui, no unico ponto que cria tarefa de etapa, e o
    // que garante que a metodologia nao vaza pra Agenda.
    .eq('stage_id', stageId)
    .neq('agendavel', false)
    .order('position', { ascending: true });

  // So os passos que valem pra ORIGEM deste lead (mesma regra do checklist).
  const steps = filterStepsForDeal(
    (stepRows || []).map(r => ({
      id: r.id, title: r.title, sourceTag: r.source_tag || null,
      dayOffset: r.day_offset || 0, period: r.period || null,
    })),
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

  // Agenda ja ocupada do dono, na janela que vamos preencher. Cada toque pega um
  // slot livre proprio (horarios distintos) — o que mantem o calendario legivel.
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
 * Resolve o dono do negocio no par (auth_user_id, nome) que a Agenda entende.
 *
 * PEGADINHA repetida: crm_deals.owner_id -> team_members.id, mas
 * crm_activities.assigned_to -> auth_user_id. Sem traduzir, a tarefa existe no
 * banco e some da Agenda (que filtra pelo usuario logado).
 */
async function resolverDono(dealOwnerId) {
  if (!dealOwnerId) return { assignee: null, assigneeName: null };
  const { data: member } = await supabase
    .from('team_members')
    .select('auth_user_id, name')
    .eq('id', dealOwnerId)
    .maybeSingle();
  return { assignee: member?.auth_user_id || null, assigneeName: member?.name || null };
}

/**
 * Lead atendeu e pediu pra ligar depois: cria o RETORNO e re-ancora a cadencia.
 *
 * O lead ENGAJOU — nao faz sentido seguir a perseguicao fria. Entao:
 *  1. Cancela o que ficou PRA TRAS (toque de cadencia pendente ja atrasado): voce
 *     falou com ele, nao ha mais o que perseguir antes do retorno.
 *  2. Cria o RETORNO no horario que voce escolheu (tarefa avulsa, o proximo toque
 *     de verdade).
 *  3. RE-ANCORA o resto da cadencia a partir do retorno: os toques futuros se
 *     re-espalham do callback pra frente, mantendo o espacamento RELATIVO ao
 *     passo atual (offset - offsetAtual). Como se o lead reentrasse na cadencia
 *     no momento do retorno.
 *
 * `excludeActivityId` = a tarefa que voce esta concluindo agora; fica de fora do
 * cancelamento e da re-ancoragem (quem a fecha e o proprio modal).
 *
 * @returns {Promise<{ok:boolean, canceladas:number, reancoradas:number}>}
 */
export async function agendarRetornoEReancorar({
  dealId, stageStepId = null, callbackISO, excludeActivityId = null,
  tipo = 'call',
  titulo = 'Retorno — lead pediu pra ligar depois',
} = {}) {
  if (!dealId || !callbackISO) return { ok: false, canceladas: 0, reancoradas: 0 };
  const callback = new Date(callbackISO);
  const agora = new Date();

  const { data: deal } = await supabase
    .from('crm_deals').select('owner_id, contact_id, title').eq('id', dealId).maybeSingle();
  if (!deal) return { ok: false, canceladas: 0, reancoradas: 0 };
  const { assignee, assigneeName } = await resolverDono(deal.owner_id);

  // Offset do passo atual — a base pra rebasear o resto da cadencia.
  let offsetAtual = 0;
  if (stageStepId) {
    const { data: st } = await supabase
      .from('crm_stage_steps').select('day_offset').eq('id', stageStepId).maybeSingle();
    offsetAtual = st?.day_offset || 0;
  }

  // 1) PRA TRAS = pendente do lead ja atrasado. Cadencia E MANUAL (antes so
  //    cadencia): o lead atendeu, entao o que ficou pra tras — seja toque da
  //    cadencia ou tarefa que voce marcou na mao — nao vale mais antes do retorno.
  let cancelQ = supabase
    .from('crm_activities')
    .update({ deleted_at: agora.toISOString() })
    .eq('deal_id', dealId).eq('completed', false).is('deleted_at', null)
    .lt('start_date', agora.toISOString());
  if (excludeActivityId) cancelQ = cancelQ.neq('id', excludeActivityId);
  const { data: canceladas } = await cancelQ.select('id');

  // 2) O RETORNO no horario escolhido. Guarda o id pra nao se cancelar/mover a si
  //    mesmo na resolucao de colisao logo abaixo.
  const fimRetorno = new Date(callback.getTime() + SLOT_MINUTES * 60000);
  const { data: retorno } = await supabase.from('crm_activities').insert({
    title: titulo, type: tipo, deal_id: dealId, contact_id: deal.contact_id || null,
    start_date: callback.toISOString(), end_date: fimRetorno.toISOString(), completed: false,
    assigned_to: assignee, assigned_to_name: assigneeName,
  }).select('id').single();

  // 3) RE-ANCORA o resto (futuros, nao atrasados) a partir do retorno.
  let futQ = supabase
    .from('crm_activities')
    .select('id, stage_step_id, crm_stage_steps(day_offset, period)')
    .eq('deal_id', dealId).eq('completed', false).is('deleted_at', null)
    .not('stage_step_id', 'is', null)
    .gte('start_date', agora.toISOString());
  if (excludeActivityId) futQ = futQ.neq('id', excludeActivityId);
  const { data: futuras } = await futQ;

  const steps = (futuras || [])
    .map(r => ({
      id: r.id,
      off: r.crm_stage_steps?.day_offset || 0,
      // Rebase: offset relativo ao passo atual. O primeiro toque depois do atual
      // cai ~1 dia depois do retorno, e o resto segue o mesmo espacamento.
      dayOffset: Math.max(0, (r.crm_stage_steps?.day_offset || 0) - offsetAtual),
      period: r.crm_stage_steps?.period || null,
    }))
    .sort((a, b) => a.off - b.off);

  let reancoradas = 0;
  if (steps.length > 0) {
    const until = new Date(callback);
    until.setDate(until.getDate() + Math.max(...steps.map(s => s.dayOffset), 0) + 7);
    let bq = supabase.from('crm_activities').select('start_date, end_date, assigned_to')
      .is('deleted_at', null)
      .gte('start_date', callback.toISOString()).lte('start_date', until.toISOString());
    if (assignee) bq = bq.eq('assigned_to', assignee);
    const { data: busyRows } = await bq;
    const busyByDay = {};
    (busyRows || []).forEach(r => {
      const k = dayKey(new Date(r.start_date));
      (busyByDay[k] = busyByDay[k] || []).push({ start: r.start_date, end: r.end_date || null });
    });

    const plano = planSteps(steps, busyByDay, callback);
    const byId = Object.fromEntries(plano.map(p => [p.stepId, p.start]));
    for (const s of steps) {
      const novo = byId[s.id];
      if (!novo) continue;
      const fim = new Date(novo.getTime() + SLOT_MINUTES * 60000);
      const { error } = await supabase.from('crm_activities')
        .update({ start_date: novo.toISOString(), end_date: fim.toISOString() })
        .eq('id', s.id);
      if (!error) reancoradas++;
    }
  }

  // Janela do slot do retorno: qualquer coisa que COMECE dentro dela colide.
  const janelaIni = new Date(callback.getTime() - SLOT_MINUTES * 60000 + 60000).toISOString();
  const janelaFim = fimRetorno.toISOString();

  // 4) COLISAO DO MESMO LEAD: tarefa pendente deste lead no slot do retorno (ex: a
  //    ligacao manual que voce ja tinha marcado pra essa hora) sai — duas coisas
  //    do mesmo lead no mesmo horario e duplicidade.
  let colMesmo = supabase.from('crm_activities')
    .update({ deleted_at: agora.toISOString() })
    .eq('deal_id', dealId).eq('completed', false).is('deleted_at', null)
    .gt('start_date', janelaIni).lt('start_date', janelaFim);
  if (retorno?.id) colMesmo = colMesmo.neq('id', retorno.id);
  if (excludeActivityId) colMesmo = colMesmo.neq('id', excludeActivityId);
  await colMesmo;

  // 5) COLISAO DE OUTRO LEAD: toque FLEXIVEL (nao compromisso) de outro lead no
  //    mesmo slot e remanejado pra frente. O retorno tem hora combinada COM O
  //    LEAD; o toque da fila e que se move, nao o contrario.
  const HORA_MARCADA = ['meeting', 'visit', 'lunch'];
  let colOutroQ = supabase.from('crm_activities')
    .select('id, type')
    .eq('completed', false).is('deleted_at', null)
    .neq('deal_id', dealId)
    .gt('start_date', janelaIni).lt('start_date', janelaFim);
  if (assignee) colOutroQ = colOutroQ.eq('assigned_to', assignee);
  const { data: colisoes } = await colOutroQ;
  const flex = (colisoes || []).filter(c => !HORA_MARCADA.includes(c.type) && c.id !== retorno?.id);

  if (flex.length > 0) {
    // Agenda do dia do retorno (ja inclui o retorno) pra achar slot livre depois.
    const diaIni = new Date(callback.getFullYear(), callback.getMonth(), callback.getDate()).toISOString();
    const diaFim = new Date(callback.getFullYear(), callback.getMonth(), callback.getDate(), 23, 59, 59).toISOString();
    let dq = supabase.from('crm_activities').select('start_date, end_date')
      .eq('completed', false).is('deleted_at', null)
      .gte('start_date', diaIni).lte('start_date', diaFim);
    if (assignee) dq = dq.eq('assigned_to', assignee);
    const { data: doDia } = await dq;
    const busy = (doDia || []).map(r => ({ start: r.start_date, end: r.end_date || null }));

    // A partir do fim do retorno: o toque deslocado vai pra DEPOIS dele.
    let apos = callback.getHours() * 60 + callback.getMinutes();
    for (const c of flex) {
      const slot = findFreeSlot(busy, apos);
      if (slot === null) continue; // dia lotado — deixa onde esta (raro)
      const novo = atMinutes(callback, slot);
      const fim = new Date(novo.getTime() + SLOT_MINUTES * 60000);
      await supabase.from('crm_activities')
        .update({ start_date: novo.toISOString(), end_date: fim.toISOString() })
        .eq('id', c.id);
      busy.push({ start: novo.toISOString(), end: fim.toISOString() });
      apos = slot; // o proximo deslocado cai depois deste
    }
  }

  return { ok: true, canceladas: (canceladas || []).length, reancoradas };
}

/**
 * Marca a reuniao de um lead e cria os lembretes ancorados nela.
 *
 * Chamado quando o lead entra numa etapa `is_meeting_stage`, com o horario que a
 * pessoa escolheu no modal. Faz duas coisas:
 *
 *  1. Cria o COMPROMISSO da reuniao (type='meeting') no horario, com o contato
 *     e o dono. Vai pro Google Calendar (via createCrmActivity) porque reuniao
 *     e o unico toque com hora combinada COM O LEAD — o convite tem que sair.
 *
 *  2. Cria os LEMBRETES: um por passo da etapa com meeting_offset_minutes, no
 *     horario da reuniao + offset. Estes NAO vao pro Calendar — sao tarefa
 *     interna do vendedor (confirmar vespera, mandar link 1h antes, checar
 *     no-show). O script do passo vira o "o que fazer" do lembrete.
 *
 * Idempotente pela reuniao: se ja existe meeting nao-concluida deste lead nesta
 * etapa, remarca (move) em vez de duplicar — reagendar e o caso comum.
 *
 * @param {string} dealId
 * @param {string} stageId       a etapa de reuniao
 * @param {string} meetingStartISO  horario escolhido
 * @param {number} [durationMin=60]
 * @returns {Promise<{meetingId:string|null, lembretes:number}>}
 */
export async function scheduleMeetingForDeal(dealId, stageId, meetingStartISO, durationMin = 60) {
  if (!dealId || !stageId || !meetingStartISO) return { meetingId: null, lembretes: 0 };

  const { data: deal } = await supabase
    .from('crm_deals')
    .select('owner_id, contact_id, title')
    .eq('id', dealId)
    .maybeSingle();
  if (!deal) return { meetingId: null, lembretes: 0 };

  const { assignee, assigneeName } = await resolverDono(deal.owner_id);
  const start = new Date(meetingStartISO);
  const end = new Date(start.getTime() + durationMin * 60000);
  const nome = deal.title || 'lead';

  // Remarcacao: some com a reuniao pendente anterior desta etapa antes de criar
  // a nova, pra nao ficarem duas. Os lembretes velhos (stage_step_id da etapa)
  // saem junto via cancelPendingStepsForDeal, chamado pelo fluxo de mover.
  await supabase
    .from('crm_activities')
    .update({ deleted_at: new Date().toISOString() })
    .eq('deal_id', dealId)
    .eq('type', 'meeting')
    .eq('completed', false)
    .is('deleted_at', null);

  const { createCrmActivity } = await import('./crmActivitiesService');
  const meeting = await createCrmActivity({
    title: `Reunião — ${nome}`,
    type: 'meeting',
    dealId,
    contactId: deal.contact_id || null,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    assignedTo: assignee,
    assignedToName: assigneeName,
  });

  // Lembretes: passos da etapa com offset. Insert direto (sem GCal): sao tarefas
  // internas, nao eventos pra mandar convite.
  const { data: stepRows } = await supabase
    .from('crm_stage_steps')
    .select('id, title, meeting_offset_minutes')
    .eq('stage_id', stageId)
    .not('meeting_offset_minutes', 'is', null)
    .order('position', { ascending: true });

  const agora = Date.now();
  const lembretes = [];
  for (const s of stepRows || []) {
    const t = horarioLembrete(start, s.meeting_offset_minutes);
    // Lembrete que ja passou nao nasce: reuniao marcada pra daqui a 30 min nao
    // deve criar a "vespera" no passado.
    if (t.getTime() <= agora) continue;
    lembretes.push({
      title: s.title,
      type: guessType(s.title),
      deal_id: dealId,
      contact_id: deal.contact_id || null,
      start_date: t.toISOString(),
      end_date: new Date(t.getTime() + SLOT_MINUTES * 60000).toISOString(),
      completed: false,
      assigned_to: assignee,
      assigned_to_name: assigneeName,
      stage_step_id: s.id,
    });
  }

  if (lembretes.length > 0) {
    const { error } = await supabase.from('crm_activities').insert(lembretes);
    if (error) console.error('[scheduleMeetingForDeal] lembretes', error.message);
  }

  return { meetingId: meeting?.id || null, lembretes: lembretes.length };
}

/**
 * Cancela as tarefas PENDENTES do processo de um lead.
 *
 * Sem isso a fila e alimentada por lixo que cresce sozinho: o lead avanca de
 * etapa (ou e ganho/perdido) e a cadencia da etapa ANTIGA continua marcada,
 * competindo por atencao com o trabalho que importa. `scheduleStepsForDeal` so
 * insere; nunca removia nada.
 *
 * Soft-delete (deleted_at), nao DELETE: o passo cumprido continua no historico
 * e da pra desfazer. So mexe no que esta PENDENTE — tarefa ja concluida e
 * historico, nao entulho.
 *
 * @param {string} dealId   negocio
 * @param {string|null} [stageId]  se informado, cancela so as tarefas dos
 *   passos DESSA etapa; senao, todas as pendentes do processo (ganho/perdido).
 * @returns {Promise<number>} quantas sairam da fila
 */
export async function cancelPendingStepsForDeal(dealId, stageId = null) {
  if (!dealId) return 0;

  // Quais atividades sao "do processo" desta etapa: as que apontam pra um passo
  // (stage_step_id) cujo dono e a etapa. Precisa dos ids dos passos primeiro —
  // nao da pra filtrar por join no PostgREST.
  let stepIds = null;
  if (stageId) {
    const { data: steps, error: stepErr } = await supabase
      .from('crm_stage_steps')
      .select('id')
      .eq('stage_id', stageId);
    if (stepErr) { console.error('[cancelPendingStepsForDeal] passos', stepErr.message); return 0; }
    stepIds = (steps || []).map(s => s.id);
    if (stepIds.length === 0) return 0;
  }

  let q = supabase
    .from('crm_activities')
    .update({ deleted_at: new Date().toISOString() })
    .eq('deal_id', dealId)
    .eq('completed', false)
    .is('deleted_at', null)
    .not('stage_step_id', 'is', null);
  if (stepIds) q = q.in('stage_step_id', stepIds);

  const { data, error } = await q.select('id');
  if (error) { console.error('[cancelPendingStepsForDeal]', error.message); return 0; }
  return data?.length || 0;
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

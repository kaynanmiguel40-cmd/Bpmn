/**
 * crmQueueService — a FILA DE TRABALHO da Agenda.
 *
 * A Agenda e o nivel de EXECUCAO (a Pipeline so acompanha), entao a tela
 * precisa responder "o que eu faco agora", nao "como esta meu mes". Isso e uma
 * fila priorizada, nao um recorte de calendario.
 *
 * Por que NAO reusa getCrmCalendarActivities:
 *   1. O calendario so olha pra FRENTE (a partir do dia visivel). A fila
 *      precisa das ATRASADAS — que sao justamente as que somem de la.
 *   2. O select do calendario e gordo (`*` + 3 joins). A fila e a tela que mais
 *      abre no dia; o projeto ja estourou egress uma vez. Aqui as colunas sao
 *      nomeadas e cada consulta tem teto.
 *   3. Sao DUAS consultas, nao uma com limit: um `limit(300)` cronologico
 *      ascendente enche com o lixo mais antigo e trunca as tarefas de HOJE —
 *      exatamente o cenario que a fila existe pra resolver.
 */

import { supabase } from '../../../lib/supabase';
import { planSteps, dayKey, rebalanceQueue, SLOT_MINUTES } from './crmScheduling';

// Colunas enxutas: so o que a linha da fila desenha. Sem `select('*')`.
const QUEUE_COLS = `
  id, title, type, start_date, end_date, completed, stage_step_id,
  deal_id, contact_id, assigned_to, assigned_to_name, created_by,
  delivery_input, delivery_report,
  crm_contacts(id, name, phone),
  crm_deals(id, title, contact_phone, priority, crm_companies(id, name, segment), crm_pipeline_stages(id, name, color))
`;

// Tipos que sao DIVIDA (tem que ser feitos). Reuniao/visita/almoco sao
// compromissos com hora marcada — nao entram na fila de toques atrasados.
const DEBT_TYPES = ['call', 'message', 'email', 'follow_up', 'task'];

// Teto do lote de atrasadas. Acima disso a tela nao ajuda mais ninguem — o
// excedente vira "toques frios" (ver COLD_AFTER_DAYS em utils/stepLabel).
// Teto do fetch de atrasadas. É global (o filtro de dono é client-side, por causa
// da cadência legada), então precisa cobrir a soma de TODOS os vendedores — senão
// as atrasadas de um vendedor podiam cair fora do teto e sumir sem aviso. 400 dá
// folga larga pra escala atual (fix idealmente é filtrar por dono no servidor).
const OVERDUE_LIMIT = 400;

export function startOfToday(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
export function endOfToday(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
}

/** Achata a linha do banco no formato que a fila desenha. */
export function dbToQueueTask(row) {
  if (!row) return null;
  const deal = row.crm_deals || null;
  const stage = deal?.crm_pipeline_stages || null;
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date || null,
    completed: !!row.completed,
    stageStepId: row.stage_step_id || null,
    dealId: row.deal_id || null,
    contactId: row.contact_id || null,
    assignedTo: row.assigned_to || null,
    assignedToName: row.assigned_to_name || null,
    createdBy: row.created_by || null,
    deliveryInput: row.delivery_input || '',
    deliveryReport: row.delivery_report || '',
    // Nome do lead: contato vinculado > titulo do negocio. Mesma ordem do
    // leadLabel da agenda, pra nao existirem dois nomes pro mesmo lead.
    leadName: row.crm_contacts?.name || deal?.title || null,
    // Empresa vinculada — alimenta o [empresa] do roteiro. Sem ela o marcador
    // fica visivel no script, avisando que falta o vinculo.
    companyName: deal?.crm_companies?.name || null,
    companySegment: deal?.crm_companies?.segment || null,
    // Telefone na ordem canonica: contato > o digitado no negocio.
    phone: row.crm_contacts?.phone || deal?.contact_phone || null,
    stageName: stage?.name || null,
    stageColor: stage?.color || null,
    priority: deal?.priority ?? 0,
  };
}

function baseQuery() {
  return supabase
    .from('crm_activities')
    .select(QUEUE_COLS)
    .is('deleted_at', null);
}

/**
 * Atrasadas: pendentes cujo DIA agendado ja passou.
 *
 * Ordem DESCENDENTE de propósito: a mais recente primeiro. Numa cadencia, o
 * toque de ontem ainda e recuperavel; o de duas semanas atras raramente e.
 * Ascendente colocaria o mais morto no topo da tela.
 */
export async function getOverdueQueue(now = new Date()) {
  const { data, error } = await baseQuery()
    .eq('completed', false)
    .lt('start_date', startOfToday(now).toISOString())
    // Divida = toque a fazer OU qualquer passo do playbook. Filtrar so por
    // `type` fazia o passo cujo titulo tem "Reuniao"/"demo" (que stepChannel
    // classifica como meeting) sumir da fila ao atrasar — justamente um passo
    // da cadencia, que e o que a fila existe pra cobrar.
    .or('type.in.(' + DEBT_TYPES.join(',') + '),stage_step_id.not.is.null')
    .order('start_date', { ascending: false })
    .limit(OVERDUE_LIMIT);
  if (error) throw error;
  return (data || []).map(dbToQueueTask);
}

/** Tudo que esta marcado pra hoje — pendente e concluido (o feito vira placar). */
export async function getTodayQueue(now = new Date()) {
  const { data, error } = await baseQuery()
    .gte('start_date', startOfToday(now).toISOString())
    .lte('start_date', endOfToday(now).toISOString())
    .order('start_date', { ascending: true });
  if (error) throw error;
  return (data || []).map(dbToQueueTask);
}

/**
 * Contagem por dia dos proximos dias — o bloco "DEPOIS".
 *
 * So `start_date`: e um contador, nao uma lista. Trazer a linha inteira pra
 * mostrar "amanhã 6" seria pagar caro por um numero.
 */
export async function getUpcomingCounts(days = 8, now = new Date()) {
  const from = new Date(startOfToday(now).getTime() + 86400000);
  const to = new Date(from.getTime() + days * 86400000);
  const { data, error } = await supabase
    .from('crm_activities')
    .select('start_date, assigned_to, assigned_to_name, created_by')
    .is('deleted_at', null)
    .eq('completed', false)
    .gte('start_date', from.toISOString())
    .lt('start_date', to.toISOString())
    .order('start_date', { ascending: true });
  if (error) throw error;
  return data || [];
}

/**
 * Reagenda uma tarefa preservando a DURACAO.
 *
 * Mover so o start_date faria a tarefa de 30min virar uma de varias horas (ou
 * negativa) conforme o end_date antigo ficasse pra tras — e o calendario
 * desenha altura por duracao.
 */
export async function snoozeActivity(id, newStart) {
  if (!id || !newStart) return null;

  const { data: cur, error: readErr } = await supabase
    .from('crm_activities')
    .select('start_date, end_date')
    .eq('id', id)
    .maybeSingle();
  if (readErr) throw readErr;

  const start = new Date(newStart);
  const dur = cur?.end_date
    ? new Date(cur.end_date).getTime() - new Date(cur.start_date).getTime()
    : 30 * 60000;
  const end = new Date(start.getTime() + Math.max(dur, 0));

  const { data, error } = await supabase
    .from('crm_activities')
    .update({ start_date: start.toISOString(), end_date: end.toISOString() })
    .eq('id', id)
    .select(QUEUE_COLS)
    .single();
  if (error) throw error;
  return dbToQueueTask(data);
}

/**
 * O proximo toque pendente de um lead, depois de uma data.
 *
 * Vai ao BANCO em vez de procurar no que a tela ja carregou: a fila so tem
 * atrasadas e hoje, e o proximo toque da cadencia quase sempre e amanha ou
 * depois — procurar nela devolvia null praticamente sempre, e a confirmacao
 * pos-conclusao dizia "nao ha mais contato agendado" com a cadencia inteira
 * pela frente.
 */
export async function getNextActivityForLead({ dealId = null, contactId = null, after } = {}) {
  if (!dealId && !contactId) return null;

  let q = supabase
    .from('crm_activities')
    .select('id, title, type, start_date, stage_step_id, deal_id, contact_id')
    .is('deleted_at', null)
    .eq('completed', false)
    .gt('start_date', new Date(after || Date.now()).toISOString())
    .order('start_date', { ascending: true })
    .limit(1);

  // Casa deal OU contato: a tarefa da cadencia aponta pro deal, mas a criada a
  // mao pode ter so o contato.
  if (dealId && contactId) q = q.or(`deal_id.eq.${dealId},contact_id.eq.${contactId}`);
  else if (dealId) q = q.eq('deal_id', dealId);
  else q = q.eq('contact_id', contactId);

  const { data, error } = await q;
  if (error) { console.warn('[getNextActivityForLead]', error.message); return null; }
  const row = (data || [])[0];
  return row ? { id: row.id, title: row.title, type: row.type, startDate: row.start_date } : null;
}

/**
 * Redistribui um lote de tarefas nos proximos dias uteis, respeitando o
 * expediente, o almoco e o que ja esta marcado.
 *
 * Devolve o PLANO, sem gravar. A confirmacao e obrigatoria porque o resultado
 * e contraintuitivo: 18 atrasadas nao cabem "amanha" — o dia tem 16 slots e
 * parte deles ja esta ocupada. Sem ver isso antes, ela aperta "adiar todas"
 * esperando limpar a fila e descobre depois que empurrou trabalho pra semana
 * que vem.
 */
export async function planBatchPostpone(tasks, assignee, now = new Date()) {
  const lista = (tasks || []).filter(t => t?.id);
  if (lista.length === 0) return { plano: [], porDia: [] };

  // O que ja esta ocupado na agenda de quem vai receber — sem isso o lote
  // empilharia em cima das tarefas de hoje/amanha que ja existem.
  const ate = new Date(now.getTime() + 45 * 86400000);
  let q = supabase
    .from('crm_activities')
    // `id` e obrigatorio: sem ele o filtro de auto-exclusao abaixo nunca casa e
    // as tarefas do proprio lote contam como horario ocupado — o plano fica mais
    // esparso do que precisa, empurrando trabalho pra frente sem motivo.
    .select('id, start_date, end_date, assigned_to')
    .is('deleted_at', null)
    .eq('completed', false)
    .gte('start_date', startOfToday(now).toISOString())
    .lte('start_date', ate.toISOString());
  if (assignee) q = q.eq('assigned_to', assignee);
  const { data: busyRows, error } = await q;
  if (error) throw error;

  const busyByDay = {};
  // As proprias tarefas do lote nao contam como ocupado: elas estao sendo
  // MOVIDAS, entao os slots antigos ficam livres.
  const noLote = new Set(lista.map(t => t.id));
  (busyRows || []).forEach(r => {
    if (noLote.has(r.id)) return;
    const k = dayKey(new Date(r.start_date));
    (busyByDay[k] = busyByDay[k] || []).push({ start: r.start_date, end: r.end_date || null });
  });

  // dayOffset 1 = a partir de amanha; planSteps rola sozinho quando o dia lota.
  const plano = planSteps(
    lista.map(t => ({ id: t.id, dayOffset: 1 })),
    busyByDay,
    now,
  );

  const porDiaMap = {};
  plano.forEach(p => {
    const k = dayKey(p.start);
    porDiaMap[k] = (porDiaMap[k] || 0) + 1;
  });
  const porDia = Object.entries(porDiaMap).map(([k, n]) => {
    const [y, m, d] = k.split('-').map(Number);
    return { date: new Date(y, m - 1, d), count: n };
  }).sort((a, b) => a.date - b.date);

  return {
    plano: plano.map(p => ({ id: p.stepId, start: p.start })),
    porDia,
    naoCoube: lista.length - plano.length,
  };
}

/** Aplica o plano do adiamento em lote. */
export async function applyBatchPostpone(plano) {
  let ok = 0;
  for (const item of plano || []) {
    try {
      await snoozeActivity(item.id, item.start.toISOString());
      ok += 1;
    } catch (e) {
      console.warn('[applyBatchPostpone]', item.id, e.message);
    }
  }
  return ok;
}

/**
 * A PROXIMA etapa do lead na pipeline dele (a seguinte por posicao).
 *
 * Serve pro convite de avancar que aparece depois de um toque bem-sucedido.
 * Deliberadamente NAO le efeito de cenario: carregar "avance a etapa" dentro
 * do JSONB dos cenarios exigiria reescrever o playbook ja semeado em producao,
 * num Supabase self-hosted sem staging. A proxima etapa por posicao acerta o
 * caso comum e nao arrisca dado.
 *
 * Devolve null quando nao ha proxima, quando o lead ja esta na etapa de ganho
 * ou quando ele nao esta aberto — nesses casos nao ha o que sugerir.
 */
export async function getNextStageForDeal(dealId) {
  if (!dealId) return null;

  const { data: deal, error } = await supabase
    .from('crm_deals')
    .select('id, status, pipeline_id, stage_id, crm_pipeline_stages(id, name, position, is_win_stage)')
    .eq('id', dealId)
    .is('deleted_at', null)
    .maybeSingle();
  if (error || !deal || deal.status !== 'open' || !deal.pipeline_id) return null;

  const atual = deal.crm_pipeline_stages;
  if (!atual || atual.is_win_stage) return null;

  const { data: stages, error: sErr } = await supabase
    .from('crm_pipeline_stages')
    .select('id, name, color, position')
    .eq('pipeline_id', deal.pipeline_id)
    .gt('position', atual.position)
    .order('position', { ascending: true })
    .limit(1);
  if (sErr || !stages?.length) return null;

  return { current: { id: atual.id, name: atual.name }, next: stages[0] };
}

/**
 * Leads ABERTOS sem nenhuma tarefa pendente — os que param de ser tocados.
 *
 * Este e o furo silencioso da operacao: o lead nao aparece em lugar nenhum
 * justamente porque nao tem tarefa. Sem este bloco, ninguem descobre que ele
 * existe ate alguem lembrar dele.
 */
export async function getStalledLeads(now = new Date(), ownerId = null) {
  let dq = supabase
    .from('crm_deals')
    .select('id, title, owner_id, updated_at, priority, crm_pipeline_stages(id, name, color), crm_contacts(name)')
    .eq('status', 'open')
    .is('deleted_at', null)
    // Sem ORDER BY, o limite corta um subconjunto ARBITRARIO: o lead mais
    // parado — justamente o que este bloco existe pra achar — podia ficar de
    // fora sem aviso. Mais antigo primeiro, que e a ordem da resposta.
    .order('updated_at', { ascending: true })
    .limit(200);
  // `owner_id` referencia team_members.id (TEXT), NAO auth_user_id: o dono do
  // negocio e o do calendario sao ids diferentes pra mesma pessoa.
  if (ownerId) dq = dq.eq('owner_id', ownerId);

  const { data: deals, error } = await dq;
  if (error) throw error;
  if (!deals?.length) return [];

  const ids = deals.map(d => d.id);
  const { data: pend, error: pErr } = await supabase
    .from('crm_activities')
    .select('deal_id')
    .is('deleted_at', null)
    .eq('completed', false)
    .in('deal_id', ids);
  if (pErr) throw pErr;

  const comPendencia = new Set((pend || []).map(r => r.deal_id));
  return deals
    .filter(d => !comPendencia.has(d.id))
    .map(d => ({
      dealId: d.id,
      leadName: d.crm_contacts?.name || d.title,
      ownerId: d.owner_id || null,
      stageName: d.crm_pipeline_stages?.name || null,
      stageColor: d.crm_pipeline_stages?.color || null,
      priority: d.priority ?? 0,
      since: d.updated_at,
      dias: Math.round((now.getTime() - new Date(d.updated_at).getTime()) / 86400000),
    }))
    .sort((a, b) => b.dias - a.dias);
}

// ==================== NOTAS DO LEAD (diario migrado) ====================

/**
 * Registros do diario do lead (crm_lead_notes).
 *
 * Vieram do campo `notes`, que antes do sistema ter historico virou o diario da
 * consultora — 59 negocios tinham log datado ali dentro, um deles com 3.375
 * caracteres. A migration 104 criou a tabela e o backfill quebrou o texto em
 * registros datados; ver scripts/migrate_notes_to_history.mjs.
 */
export async function getLeadNotes(dealId) {
  if (!dealId) return [];
  const { data, error } = await supabase
    .from('crm_lead_notes')
    .select('id, note_date, title, content, origin, created_at')
    .eq('deal_id', dealId)
    .is('deleted_at', null)
    .order('note_date', { ascending: false, nullsFirst: false });
  if (error) { console.warn('[getLeadNotes]', error.message); return []; }
  return (data || []).map(r => ({
    id: r.id,
    // `note_date` e DATE (sem hora). Parseado como LOCAL pra nao voltar um dia
    // no fuso do Brasil — "2026-05-27" viraria 26/05 se passasse por UTC.
    date: r.note_date ? new Date(`${r.note_date}T12:00:00`) : null,
    title: r.title || '',
    content: r.content,
    origin: r.origin,
  }));
}

/**
 * Quanto trabalho VALIDO foi feito na etapa atual do lead.
 *
 * Serve pra decidir se avancar de etapa pede confirmacao. Mover apaga as
 * tarefas pendentes da etapa que fica pra tras, entao o custo de avancar cedo
 * demais e alto.
 *
 * "Concluida" NAO basta. Uma tarefa so conta como avanco real quando:
 *
 *   1. o lead ATENDEU  — a ligacao em que ninguem atendeu foi executada, e ate
 *      merece sair da fila, mas nao houve conversa: nada ali justifica mover o
 *      lead adiante. Detectado pela ausencia de progresso do passo, que e o que
 *      `contacted: false` deixa de gravar (ver completeCrmActivity);
 *   2. ficou REGISTRO do que aconteceu — tarefa fechada no automatico, sem uma
 *      linha do que o lead disse, nao e prova de nada. Se ninguem anotou, do
 *      ponto de vista do funil nao aconteceu.
 *
 * Por isso o retorno separa os tres casos: o que conta (`concluidas`), o que
 * foi tentado sem contato (`semContato`) e o que foi fechado sem anotar
 * (`semRegistro`). A tela usa os tres pra dizer POR QUE esta perguntando.
 */
export async function getStageWorkSummary(dealId, stageId) {
  const vazio = { concluidas: 0, pendentes: 0, semContato: 0, semRegistro: 0 };
  if (!dealId || !stageId) return vazio;

  const { data: steps, error: sErr } = await supabase
    .from('crm_stage_steps')
    .select('id')
    .eq('stage_id', stageId);
  if (sErr) { console.warn('[getStageWorkSummary] passos', sErr.message); return vazio; }

  const ids = (steps || []).map(s => s.id);
  // Etapa sem playbook nao tem tarefa a cobrar — nao ha "nada feito" a alertar.
  if (ids.length === 0) return { ...vazio, semPlaybook: true };

  const [atividades, progresso] = await Promise.all([
    supabase
      .from('crm_activities')
      .select('id, completed, delivery_report, stage_step_id')
      .eq('deal_id', dealId)
      .is('deleted_at', null)
      .in('stage_step_id', ids),
    // O progresso do passo e a marca de que o lead ATENDEU: "nao atendeu"
    // conclui a atividade mas nao grava progresso.
    supabase
      .from('crm_deal_step_progress')
      .select('step_id')
      .eq('deal_id', dealId)
      .in('step_id', ids),
  ]);

  if (atividades.error) { console.warn('[getStageWorkSummary]', atividades.error.message); return vazio; }
  // O progresso ausente por ERRO nao pode virar "ninguem atendeu": sem ele o
  // Set fica vazio e TODA concluida cairia em semContato, acusando a vendedora
  // de nao ter falado com o lead por causa de uma consulta que falhou. Sem esse
  // dado nao da pra julgar, entao nao julga.
  if (progresso.error) { console.warn('[getStageWorkSummary]', progresso.error.message); return vazio; }

  const comContato = new Set((progresso.data || []).map(p => p.step_id));
  const linhas = atividades.data || [];

  let concluidas = 0, semContato = 0, semRegistro = 0, pendentes = 0;
  for (const a of linhas) {
    if (!a.completed) { pendentes += 1; continue; }
    if (!comContato.has(a.stage_step_id)) { semContato += 1; continue; }
    if (!a.delivery_report || !a.delivery_report.trim()) { semRegistro += 1; continue; }
    concluidas += 1;
  }

  return { concluidas, pendentes, semContato, semRegistro, semPlaybook: false };
}

// ==================== REORGANIZAR A FILA POR PRIORIDADE ====================

/**
 * Monta o plano de rebalanceamento da fila de alguem: quem tem mais estrelas
 * pega os horarios mais cedo, respeitando o dia que a cadencia quis.
 *
 * Devolve o PLANO, sem gravar — a confirmacao e obrigatoria porque isto mexe na
 * agenda inteira da pessoa de uma vez, e ela precisa ver o que muda antes.
 *
 * O `notBefore` sai do proprio agendamento atual, nao do day_offset: a tarefa
 * ja foi colocada num dia que a cadencia escolheu, e esse dia E a maturidade
 * dela. Recalcular pelo offset exigiria saber quando o lead entrou na etapa e
 * daria o mesmo numero — com mais chance de errar.
 */
export async function planQueueRebalance({ assignee = null, assigneeName = null } = {}, now = new Date()) {
  const ate = new Date(now.getTime() + 90 * 86400000);

  const { data, error } = await supabase
    .from('crm_activities')
    .select('id, title, type, start_date, end_date, deal_id, assigned_to, assigned_to_name, created_by, stage_step_id, crm_deals(id, title, priority, position), crm_stage_steps(period)')
    .is('deleted_at', null)
    .eq('completed', false)
    .lte('start_date', ate.toISOString())
    .order('start_date', { ascending: true });
  if (error) throw error;

  // Filtro de dono no cliente, pela mesma razao do resto da fila: a cadencia
  // legada gravou team_members.id em assigned_to.
  const minhas = (data || []).filter(r => {
    if (r.assigned_to) return r.assigned_to === assignee;
    if (r.assigned_to_name && assigneeName) return r.assigned_to_name === assigneeName;
    return r.created_by === assignee;
  });

  // COMPROMISSO nao se remaneja: reuniao e visita tem hora combinada COM O
  // LEAD. Mover unilateralmente e furar o combinado — elas viram bloqueio.
  const remanejaveis = minhas.filter(r => r.stage_step_id && !['meeting', 'visit', 'lunch'].includes(r.type));
  const fixas = minhas.filter(r => !remanejaveis.includes(r));

  const busyByDay = {};
  fixas.forEach(r => {
    const k = dayKey(new Date(r.start_date));
    (busyByDay[k] = busyByDay[k] || []).push({ start: r.start_date, end: r.end_date || null });
  });

  // `seq` = a ordem em que a cadencia agendou. E o que preserva o 1o toque
  // antes do 2o quando os dois disputam o mesmo dia.
  const tarefas = remanejaveis.map((r, i) => ({
    id: r.id,
    dealId: r.deal_id,
    // PRIORIDADE = posicao na coluna do Kanban (menor = mais em cima).
    // QUALIDADE = estrelas. A ordem manda; a estrela desempata.
    rank: r.crm_deals?.position ?? Number.MAX_SAFE_INTEGER,
    priority: r.crm_deals?.priority ?? 0,
    notBefore: new Date(r.start_date),
    startDate: r.start_date,
    // O turno vem do PASSO, nao da hora em que a tarefa esta agendada. Inferir
    // pelo relogio congela o atraso: a ligacao das 9h que ninguem fez vira
    // "manha" pra sempre e, se a manha ja acabou, nao cabe mais hoje — ela
    // pula pro dia seguinte em vez de encaixar a tarde. O passo sem turno
    // definido fica livre pra qualquer hora do expediente.
    period: r.crm_stage_steps?.period || null,
    seq: i,
    duracaoMin: r.end_date
      ? Math.round((new Date(r.end_date) - new Date(r.start_date)) / 60000)
      : SLOT_MINUTES,
  }));

  const plano = rebalanceQueue(tarefas, { from: now, busyByDay });
  const porId = Object.fromEntries(remanejaveis.map(r => [r.id, r]));
  const movidas = plano.filter(p => p.movida).map(p => ({
    id: p.id,
    start: p.start,
    de: porId[p.id]?.start_date,
    titulo: porId[p.id]?.title,
    lead: porId[p.id]?.crm_deals?.title || null,
    priority: porId[p.id]?.crm_deals?.priority ?? 0,
  }));

  return { total: tarefas.length, fixas: fixas.length, movidas };
}

/** Aplica o plano do rebalanceamento. Preserva a duracao de cada tarefa. */
export async function applyQueueRebalance(movidas) {
  let ok = 0;
  for (const m of movidas || []) {
    try { await snoozeActivity(m.id, m.start.toISOString()); ok += 1; }
    catch (e) { console.warn('[applyQueueRebalance]', m.id, e.message); }
  }
  return ok;
}


/**
 * Move um lead na coluna do Kanban — a PRIORIDADE dele.
 *
 * Recebe a lista de ids na ordem final e grava 100, 200, 300... O passo de 100
 * deixa espaco pra encaixar um card entre dois sem reescrever a coluna, mas
 * aqui reescrevemos mesmo: sao dezenas de leads por etapa, nao milhares, e
 * ordem previsivel vale mais que economia de UPDATE.
 *
 * Grava `position_manual` junto: e o que diz ao score que esta coluna foi
 * decidida a mao e ele nao deve reordenar. Sem essa marca, o proximo calculo
 * desfaria o arrasto e a pessoa arrastaria de novo, pra sempre.
 */
export async function reorderStageDeals(stageId, idsNaOrdem) {
  if (!stageId || !idsNaOrdem?.length) return 0;
  const linhas = idsNaOrdem.map((id, i) => ({ id, position: (i + 1) * 100 }));
  for (const l of linhas) {
    const { error } = await supabase
      .from('crm_deals')
      .update({ position: l.position, position_manual: true })
      .eq('id', l.id);
    if (error) { console.warn('[reorderStageDeals]', l.id, error.message); }
  }
  return linhas.length;
}

/**
 * Devolve a coluna ao score: apaga a marca de "fixado a mao".
 *
 * A saida tem que existir. Uma ordem fixada e permanente vira lixo em duas
 * semanas — o lead que era prioridade fechou, esfriou ou virou outro problema,
 * e a coluna continua congelada num julgamento de outro dia.
 */
export async function clearStageManualOrder(stageId, ids) {
  if (!stageId || !ids?.length) return 0;
  const { error } = await supabase
    .from('crm_deals')
    .update({ position_manual: false })
    .in('id', ids);
  if (error) { console.warn('[clearStageManualOrder]', error.message); return 0; }
  return ids.length;
}

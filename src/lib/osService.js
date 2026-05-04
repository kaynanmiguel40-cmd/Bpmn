import { createCRUDService } from './serviceFactory';
import { supabase } from './supabase';
import { osOrderSchema, sectorSchema, osProjectSchema } from './validation';
import { SLA_HOURS, DEFAULT_SLA_HOURS } from '../constants/sla';
import { getOffline } from './offlineDB';
import { ensureSignaturesForParticipants } from './osSignaturesService';

// ==================== TRANSFORMADORES ====================

// Coage qualquer formato vindo do Postgres (DATE "YYYY-MM-DD" ou TIMESTAMPTZ ISO)
// para o formato aceito por <input type="datetime-local">: "YYYY-MM-DDTHH:mm".
// Usa UTC para manter consistencia: o usuario digita "08:00", o banco guarda
// "08:00+00:00", ao ler mostra "08:00" de novo (sem deslocar por timezone).
// Sem isso, a cada save a hora "recua" N horas e a data acaba sumindo.
function toDatetimeLocalInput(value) {
  if (!value) return '';
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return `${value}T08:00`;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

export function dbToOrder(row) {
  if (!row) return null;
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    description: row.description || '',
    checklist: Array.isArray(row.checklist) ? row.checklist : [],
    priority: row.priority || 'medium',
    status: row.status || 'available',
    mode: row.mode || 'pool',
    category: row.category || 'internal',
    blockReason: row.block_reason || null,
    client: row.client || '',
    clientId: row.client_id || null,
    location: row.location || '',
    notes: row.notes || '',
    assignee: row.assignee || null,
    assignedTo: row.assigned_to || null,
    supervisor: row.supervisor || null,
    sortOrder: row.sort_order ?? 0,
    estimatedStart: toDatetimeLocalInput(row.estimated_start),
    estimatedEnd: toDatetimeLocalInput(row.estimated_end),
    actualStart: toDatetimeLocalInput(row.actual_start),
    actualEnd: toDatetimeLocalInput(row.actual_end),
    weekStart: row.week_start || null,
    weekEnd: row.week_end || null,
    pausedAt: row.paused_at || null,
    resumedAt: row.resumed_at || null,
    accumulatedMs: row.accumulated_ms || 0,
    slaDeadline: row.sla_deadline || null,
    leadTimeHours: row.lead_time_hours || null,
    attachments: Array.isArray(row.attachments) ? row.attachments : [],
    expenses: Array.isArray(row.expenses) ? row.expenses : [],
    projectId: row.project_id || null,
    type: row.type || 'normal',
    parentOrderId: row.parent_order_id || null,
    emergencyNumber: row.emergency_number || null,
    eapTaskId: row.eap_task_id || null,
    wbsPath: row.wbs_path || null,
    scheduledPauses: Array.isArray(row.scheduled_pauses) ? row.scheduled_pauses : [],
    dependsOn: Array.isArray(row.depends_on) ? row.depends_on : [],
    participants: Array.isArray(row.participants) ? row.participants : [],
    checklistGroups: Array.isArray(row.checklist_groups) ? row.checklist_groups : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function dbToOSProject(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    sector: row.sector_id || '',
    color: row.color || '#3b82f6',
    description: row.description || '',
    status: row.status || 'active',
    projectType: row.project_type || 'execution',
    eapProjectId: row.eap_project_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function dbToSector(row) {
  if (!row) return null;
  return {
    id: row.id,
    label: row.label,
    color: row.color || '#3b82f6',
  };
}

// ==================== SETORES (via factory) ====================

const sectorService = createCRUDService({
  table: 'os_sectors',
  localKey: 'os_sectors',
  idPrefix: 'sector',
  transform: dbToSector,
  schema: sectorSchema,
  fieldMap: {
    label: 'label',
    color: 'color',
  },
});

export const getOSSectors = sectorService.getAll;
export const createOSSector = (sector) => {
  // ID especial para setores: baseado no label
  const customId = sector.id || sector.label.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '') + '_' + Date.now();
  return sectorService.create(sector, { id: customId });
};
export const updateOSSector = (id, updates) => sectorService.update(id, updates);
export const deleteOSSector = (id) => sectorService.remove(id);

// ==================== PROJETOS (via factory) ====================

const projectService = createCRUDService({
  table: 'os_projects',
  localKey: 'os_projects',
  idPrefix: 'proj',
  transform: dbToOSProject,
  schema: osProjectSchema,
  fieldMap: {
    name: 'name',
    sector: 'sector_id',
    color: 'color',
    description: 'description',
    status: 'status',
    projectType: 'project_type',
    eapProjectId: 'eap_project_id',
  },
});

export const getOSProjects = projectService.getAll;
export const createOSProject = (project) => projectService.create(project);
export const updateOSProject = (id, updates) => projectService.update(id, updates);
export const deleteOSProject = (id) => projectService.remove(id);

// ==================== ORDENS DE SERVICO (via factory) ====================

// Campos timestamp que nao podem ser string vazia (Postgres timestamptz rejeita '')
const TIMESTAMP_FIELDS = [
  'estimatedStart', 'estimatedEnd', 'actualStart', 'actualEnd',
  'pausedAt', 'resumedAt', 'slaDeadline',
];

/** Converte string vazia em null nos campos timestamp (Postgres nao aceita '')
 *  e adiciona sufixo Z (UTC) em valores "YYYY-MM-DDTHH:mm" para garantir que
 *  o Postgres interprete como UTC e nao como timezone local. */
function normalizeTimestamps(order) {
  if (!order || typeof order !== 'object') return order;
  const result = { ...order };
  for (const field of TIMESTAMP_FIELDS) {
    const v = result[field];
    if (v === '' || v === undefined) {
      result[field] = null;
    } else if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v)) {
      // "2026-04-20T08:00" -> "2026-04-20T08:00:00Z" (UTC explicito)
      result[field] = `${v}:00Z`;
    }
  }
  return result;
}

const orderService = createCRUDService({
  table: 'os_orders',
  localKey: 'os_orders',
  idPrefix: 'os',
  transform: dbToOrder,
  schema: osOrderSchema,
  richFields: ['description', 'notes'],
  fieldMap: {
    number: 'number',
    title: 'title',
    description: 'description',
    checklist: 'checklist',
    priority: 'priority',
    status: 'status',
    mode: 'mode',
    category: 'category',
    blockReason: 'block_reason',
    client: 'client',
    clientId: 'client_id',
    location: 'location',
    notes: 'notes',
    assignee: 'assignee',
    assignedTo: 'assigned_to',
    sortOrder: 'sort_order',
    estimatedStart: 'estimated_start',
    estimatedEnd: 'estimated_end',
    actualStart: 'actual_start',
    actualEnd: 'actual_end',
    weekStart: 'week_start',
    weekEnd: 'week_end',
    pausedAt: 'paused_at',
    resumedAt: 'resumed_at',
    accumulatedMs: 'accumulated_ms',
    slaDeadline: 'sla_deadline',
    leadTimeHours: 'lead_time_hours',
    attachments: 'attachments',
    expenses: 'expenses',
    projectId: 'project_id',
    type: 'type',
    parentOrderId: 'parent_order_id',
    emergencyNumber: 'emergency_number',
    supervisor: 'supervisor',
    eapTaskId: 'eap_task_id',
    wbsPath: 'wbs_path',
    scheduledPauses: 'scheduled_pauses',
    dependsOn: 'depends_on',
    participants: 'participants',
    checklistGroups: 'checklist_groups',
  },
});

export const getOSOrders = orderService.getAll;
export const updateOSOrder = (id, updates) => orderService.update(id, normalizeTimestamps(updates));
export const deleteOSOrder = (id) => orderService.remove(id);

// ==================== FUNÇÕES ESPECIAIS (não cabem na factory) ====================

/** Busca o proximo numero sequencial de uma coluna na tabela os_orders */
async function getNextSequentialNumber(column, filter = null) {
  let query = supabase.from('os_orders').select(column).order(column, { ascending: false }).limit(1);
  if (filter) query = query.eq(filter.column, filter.value);

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    let local = await getOffline('os_orders');
    if (filter) local = local.filter(o => o[filter.column] === filter.value);
    const maxNum = local.reduce((acc, o) => Math.max(acc, o[column] || 0), 0);
    return maxNum + 1;
  }
  return (data[0][column] || 0) + 1;
}

export function getNextOrderNumber() {
  return getNextSequentialNumber('number');
}

export function getNextEmergencyNumber() {
  return getNextSequentialNumber('emergency_number', { column: 'type', value: 'emergency' });
}

/** Calcula SLA deadline baseado na prioridade (horas a partir de agora) */
export function calcSLADeadline(priority) {
  const hours = SLA_HOURS[priority] || DEFAULT_SLA_HOURS;
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + hours);
  return deadline.toISOString();
}

export async function createOSOrder(order) {
  // Auto-calcular SLA se nao fornecido
  const slaDeadline = order.slaDeadline || calcSLADeadline(order.priority || 'medium');
  const normalized = normalizeTimestamps(order);

  if (normalized.type === 'emergency') {
    const nextEmg = await getNextEmergencyNumber();
    return orderService.create({
      ...normalized,
      slaDeadline,
      emergencyNumber: normalized.emergencyNumber || nextEmg,
      priority: 'urgent',
    });
  }
  const nextNum = await getNextOrderNumber();
  return orderService.create({ ...normalized, slaDeadline, number: normalized.number || nextNum });
}

export async function updateOSOrdersBatch(orderUpdates) {
  const results = await Promise.all(
    orderUpdates.map(upd => updateOSOrder(upd.id, upd))
  );
  return results.filter(Boolean);
}

export async function clearProjectFromOrders(projectId) {
  await orderService.bulkUpdate('project_id', null, 'project_id', projectId);
}

export async function clearSectorFromProjects(sectorId) {
  await projectService.bulkUpdate('sector_id', null, 'sector_id', sectorId);
}

// ==================== MODOS DA O.S. (pool/solo/team) ====================

/**
 * Status efetivo de uma O.S. considerando o modo:
 * - solo/pool: status escrito direto na linha
 * - team: derivado dos GRUPOS do checklist + assinaturas
 *     todos itens de todos os grupos done + todos participantes assinaram -> done
 *     pelo menos 1 item done (em qualquer grupo)                          -> in_progress
 *     todos itens em todos os grupos = todo                               -> available
 *
 * @param {object} order - O.S. transformada (dbToOrder)
 * @param {Array}  signatures - assinaturas (opcional; lista de { userId, userName })
 */
export function computeOSStatus(order, signatures = []) {
  if (!order) return { status: 'available', awaitingSignatures: false };
  if (order.mode !== 'team') {
    return { status: order.status || 'available', awaitingSignatures: false };
  }

  const checklist = Array.isArray(order.checklist) ? order.checklist : [];
  const groups = Array.isArray(order.checklistGroups) ? order.checklistGroups : [];
  if (checklist.length === 0) {
    return { status: 'available', awaitingSignatures: false };
  }

  const allDone  = checklist.every(i => i.done);
  const anyDone  = checklist.some(i => i.done);

  if (!allDone) {
    return { status: anyDone ? 'in_progress' : 'available', awaitingSignatures: false };
  }
  // Todos os itens done. Checa assinaturas: 1 por participante distinto que tem grupo atribuido.
  const requiredSigners = [...new Set(
    groups.map(g => g.assigneeId).filter(Boolean)
  )];
  if (requiredSigners.length === 0) {
    // Nenhum grupo atribuido — sem exigir assinatura, considera done.
    return { status: 'done', awaitingSignatures: false };
  }
  const signedIds = new Set(signatures.map(s => s.userId || s.user_id).filter(Boolean));
  const allSigned = requiredSigners.every(id => signedIds.has(id));
  if (allSigned) return { status: 'done', awaitingSignatures: false };
  return { status: 'in_progress', awaitingSignatures: true };
}

/**
 * Sincroniza a lista de participantes de uma O.S.
 *
 * - Atualiza a coluna participants[] (autoridade unica de "quem trabalha aqui")
 * - Atualiza mode -> 'team' se total >= 2; nao rebaixa automaticamente (sticky)
 * - Nao toca em checklist_groups: a atribuicao por grupo e responsabilidade da UI
 *
 * @param {string} orderId
 * @param {Array<{id: string|null, name: string}>} members
 */
export async function setOSParticipants(orderId, members) {
  if (!orderId) throw new Error('orderId obrigatorio');
  const target = Array.isArray(members) ? members : [];

  // Dedup por id (se houver) ou por name
  const seen = new Set();
  const dedup = [];
  for (const m of target) {
    const key = m.id || `name:${(m.name || '').toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    dedup.push({ id: m.id || null, name: m.name || '' });
  }

  const { data: orderRow } = await supabase
    .from('os_orders')
    .select('id, mode')
    .eq('id', orderId)
    .maybeSingle();
  if (!orderRow) throw new Error('O.S. nao encontrada');

  let nextMode = orderRow.mode;
  if (dedup.length >= 2) nextMode = 'team';
  else if (dedup.length === 1 && orderRow.mode === 'pool') nextMode = 'solo';
  // Sticky: team nunca volta pra solo/pool automaticamente

  await orderService.update(orderId, {
    participants: dedup,
    ...(nextMode !== orderRow.mode ? { mode: nextMode } : {}),
  });
  return { mode: nextMode, participants: dedup };
}

/**
 * Usuario "pega" uma O.S. para si. Funciona em qualquer modo:
 *  - pool         : preenche assignee/assigned_to, marca solo, status -> in_progress
 *  - solo (sua)   : status -> in_progress
 *  - solo (outro) : adiciona o original + o novo em participants[], vira team
 *  - team         : adiciona o novo em participants[]
 *
 * Nao mexe em checklist_groups. A atribuicao por grupo e na UI.
 *
 * @param {string} orderId
 * @param {{id: string, name: string}} member
 */
export async function joinOSOrder(orderId, member) {
  if (!orderId || !member?.id) throw new Error('orderId e member.id obrigatorios');

  const { data: row } = await supabase
    .from('os_orders')
    .select('id, mode, status, assignee, assigned_to, participants')
    .eq('id', orderId)
    .maybeSingle();
  if (!row) throw new Error('O.S. nao encontrada');

  const now = new Date().toISOString();
  const currentParticipants = Array.isArray(row.participants) ? row.participants : [];

  // Pegar = assinar: registra signature em qualquer cenario (idempotente)
  await ensureSignaturesForParticipants(orderId, [{ id: member.id, name: member.name || '' }]);

  // Caso 1: pool -> solo do novo membro
  if (row.mode === 'pool' || (!row.assigned_to && !row.assignee && currentParticipants.length === 0)) {
    return updateOSOrder(orderId, {
      mode: 'solo',
      assignee: member.name || '',
      assignedTo: member.id,
      participants: [{ id: member.id, name: member.name || '' }],
      status: row.status === 'available' ? 'in_progress' : row.status,
      actualStart: row.status === 'available' ? now : undefined,
    });
  }

  // Caso 2: solo do proprio usuario -> claim
  if (row.mode === 'solo' && row.assigned_to === member.id) {
    return updateOSOrder(orderId, {
      status: 'in_progress',
      actualStart: now,
    });
  }

  // Caso 3: solo de outro -> vira team
  if (row.mode === 'solo') {
    const original = { id: row.assigned_to, name: row.assignee || '' };
    await setOSParticipants(orderId, [original, { id: member.id, name: member.name }]);
    // Garante signature do original tambem (caso ainda nao tenha)
    await ensureSignaturesForParticipants(orderId, [original]);
    return updateOSOrder(orderId, {
      mode: 'team',
      // limpa atribuicao unica — agora cada grupo do checklist tem seu assignee
      assignee: null,
      assignedTo: null,
    });
  }

  // Caso 4: team -> adiciona em participants
  const next = [...currentParticipants, { id: member.id, name: member.name }];
  await setOSParticipants(orderId, next);
  return supabase.from('os_orders').select('*').eq('id', orderId).single()
    .then(({ data }) => dbToOrder(data));
}

// ==================== HELPERS DE GRUPOS DO CHECKLIST ====================

/**
 * Lista os nomes unicos de grupos presentes no checklist da O.S.
 */
export function getChecklistGroupNames(order) {
  if (!order?.checklist) return [];
  const seen = new Set();
  for (const item of order.checklist) {
    seen.add(item.group || '');
  }
  return [...seen];
}

// Le estado FRESCO do banco antes de aplicar patch — evita race entre
// seleções consecutivas que poderiam sobrescrever uma a outra (stale closure).
async function readFreshGroups(orderId) {
  const { data } = await supabase
    .from('os_orders')
    .select('checklist_groups, checklist')
    .eq('id', orderId)
    .single();
  return {
    groups: Array.isArray(data?.checklist_groups) ? data.checklist_groups : [],
    checklist: Array.isArray(data?.checklist) ? data.checklist : [],
  };
}

function upsertGroup(groups, groupName, patch) {
  const next = [...groups];
  const idx = next.findIndex(g => (g.name || '') === (groupName || ''));
  if (idx >= 0) next[idx] = { ...next[idx], ...patch };
  else next.push({ name: groupName, ...patch });
  return next;
}

/**
 * Le os responsaveis de um grupo, com fallback para o modelo legado
 * (assigneeId/assigneeName -> array de 1 item). Sempre retorna array.
 */
export function getGroupAssignees(group) {
  if (!group) return [];
  if (Array.isArray(group.assignees) && group.assignees.length > 0) return group.assignees;
  if (group.assigneeId || group.assigneeName) {
    return [{ id: group.assigneeId || null, name: group.assigneeName || '' }];
  }
  return [];
}

/**
 * Toggle de um responsavel num grupo. Se ja esta na lista, remove; senao,
 * adiciona. Permite multiplos responsaveis por pasta E mesma pessoa em
 * varias pastas.
 *
 * Le estado fresco do banco antes (atomico contra cliques rapidos).
 *
 * @param {string|{id:string}} orderOrId
 * @param {string} groupName
 * @param {{id: string|null, name: string}} member
 */
export async function toggleGroupAssignee(orderOrId, groupName, member) {
  const orderId = typeof orderOrId === 'string' ? orderOrId : orderOrId?.id;
  if (!orderId) throw new Error('orderId obrigatorio');
  if (!member?.name) throw new Error('member.name obrigatorio');

  const { groups } = await readFreshGroups(orderId);
  const idx = groups.findIndex(g => (g.name || '') === (groupName || ''));
  const current = idx >= 0 ? groups[idx] : null;
  const currentAssignees = getGroupAssignees(current);

  const isMatch = (a) =>
    (member.id && a.id === member.id) ||
    (!member.id && a.name === member.name);

  const exists = currentAssignees.some(isMatch);
  const nextAssignees = exists
    ? currentAssignees.filter(a => !isMatch(a))
    : [...currentAssignees, { id: member.id || null, name: member.name }];

  // Limpa campos legados no upsert (assignees passa a ser fonte unica)
  const patch = { assignees: nextAssignees, assigneeId: null, assigneeName: '' };
  const next = upsertGroup(groups, groupName, patch);
  return updateOSOrder(orderId, { checklistGroups: next });
}

/**
 * Sobrescreve a lista de responsaveis de um grupo (substituicao total).
 * Util pra "limpar todos" ou "definir de uma vez".
 */
export async function setGroupAssignees(orderOrId, groupName, members) {
  const orderId = typeof orderOrId === 'string' ? orderOrId : orderOrId?.id;
  if (!orderId) throw new Error('orderId obrigatorio');
  const { groups } = await readFreshGroups(orderId);
  const arr = (Array.isArray(members) ? members : []).map(m => ({ id: m.id || null, name: m.name || '' }));
  const patch = { assignees: arr, assigneeId: null, assigneeName: '' };
  return updateOSOrder(orderId, { checklistGroups: upsertGroup(groups, groupName, patch) });
}

/**
 * Mantida por compatibilidade: define UM responsavel (substituindo a lista)
 * ou limpa (passando null). Equivalente a setGroupAssignees com 0 ou 1 item.
 */
export async function setGroupAssignee(orderOrId, groupName, assignee) {
  return setGroupAssignees(orderOrId, groupName, assignee ? [assignee] : []);
}

export async function setGroupDueAt(orderOrId, groupName, dueAt) {
  const orderId = typeof orderOrId === 'string' ? orderOrId : orderOrId?.id;
  if (!orderId) throw new Error('orderId obrigatorio');
  const { groups } = await readFreshGroups(orderId);
  return updateOSOrder(orderId, {
    checklistGroups: upsertGroup(groups, groupName, { dueAt: dueAt || null }),
  });
}

/**
 * Atualiza o prazo de UM item do checklist (granularidade fina).
 */
export async function setItemDueAt(orderOrId, itemId, dueAt) {
  const orderId = typeof orderOrId === 'string' ? orderOrId : orderOrId?.id;
  if (!orderId) throw new Error('orderId obrigatorio');
  const { checklist } = await readFreshGroups(orderId);
  const next = checklist.map(i =>
    i.id === itemId ? { ...i, dueAt: dueAt || null } : i
  );
  return updateOSOrder(orderId, { checklist: next });
}

/**
 * Atualiza duracao estimada (em minutos) de UM item.
 *
 * Valida regra de soma: a soma das duracoes dos itens da pasta nao pode
 * passar do estimatedMinutes da pasta. Lanca erro se passar — chamador
 * mostra toast.
 */
export async function setItemEstimatedMinutes(orderOrId, itemId, minutes) {
  const orderId = typeof orderOrId === 'string' ? orderOrId : orderOrId?.id;
  if (!orderId) throw new Error('orderId obrigatorio');
  const m = Math.max(0, parseInt(minutes, 10) || 0);

  const { checklist, groups } = await readFreshGroups(orderId);
  const target = checklist.find(i => i.id === itemId);
  if (!target) throw new Error('Item nao encontrado');

  const groupName = target.group || '';
  const groupCfg = groups.find(g => (g.name || '') === groupName);
  const groupBudget = groupCfg?.estimatedMinutes || 0;

  if (groupBudget > 0) {
    const others = checklist
      .filter(i => (i.group || '') === groupName && i.id !== itemId)
      .reduce((s, i) => s + (i.estimatedMinutes || 0), 0);
    const proposed = others + m;
    if (proposed > groupBudget) {
      throw new Error(
        `Soma das tarefas (${formatMin(proposed)}) excederia o total da pasta (${formatMin(groupBudget)}).`
      );
    }
  }

  const next = checklist.map(i =>
    i.id === itemId ? { ...i, estimatedMinutes: m } : i
  );
  return updateOSOrder(orderId, { checklist: next });
}

function formatMin(min) {
  if (!min || min <= 0) return '0min';
  const h = Math.floor(min / 60);
  const r = min % 60;
  if (h > 0 && r > 0) return `${h}h${String(r).padStart(2, '0')}`;
  if (h > 0) return `${h}h`;
  return `${r}min`;
}

/**
 * Atualiza estimatedMinutes da PASTA. Valida que a soma dos itens nao
 * passa do novo total. Tambem valida que nao passa do total da O.S.
 * (caso a O.S. tenha um total definido — usa estimated_minutes legado se houver).
 */
export async function setGroupEstimatedMinutesValidated(orderOrId, groupName, minutes) {
  const orderId = typeof orderOrId === 'string' ? orderOrId : orderOrId?.id;
  if (!orderId) throw new Error('orderId obrigatorio');
  const m = Math.max(0, parseInt(minutes, 10) || 0);

  const { checklist, groups } = await readFreshGroups(orderId);
  if (m > 0) {
    const itemsTotal = checklist
      .filter(i => (i.group || '') === (groupName || ''))
      .reduce((s, i) => s + (i.estimatedMinutes || 0), 0);
    if (itemsTotal > m) {
      throw new Error(
        `Tarefas ja somam ${formatMin(itemsTotal)}, maior que o novo total da pasta (${formatMin(m)}). Ajuste as tarefas primeiro.`
      );
    }
  }
  return updateOSOrder(orderId, {
    checklistGroups: upsertGroup(groups, groupName, { estimatedMinutes: m }),
  });
}

/**
 * Soma duracoes estimadas dos itens de um grupo.
 */
export function sumGroupItemsMinutes(order, groupName) {
  const checklist = Array.isArray(order?.checklist) ? order.checklist : [];
  return checklist
    .filter(i => (i.group || '') === (groupName || ''))
    .reduce((s, i) => s + (i.estimatedMinutes || 0), 0);
}

/**
 * Resolve o prazo efetivo de um item: preferencia item -> grupo -> O.S.
 * Util pra colorir o badge mesmo quando o item nao tem prazo proprio.
 */
export function resolveItemDueAt(order, item) {
  if (item?.dueAt) return item.dueAt;
  const groupName = item?.group || '';
  const group = (order?.checklistGroups || []).find(g => (g.name || '') === groupName);
  if (group?.dueAt) return group.dueAt;
  return order?.estimatedEnd || null;
}

export async function setGroupEstimatedMinutes(orderOrId, groupName, minutes) {
  const orderId = typeof orderOrId === 'string' ? orderOrId : orderOrId?.id;
  if (!orderId) throw new Error('orderId obrigatorio');
  const { groups } = await readFreshGroups(orderId);
  return updateOSOrder(orderId, {
    checklistGroups: upsertGroup(groups, groupName, { estimatedMinutes: minutes || 0 }),
  });
}

/**
 * Renomeia um grupo no checklist E nos checklist_groups[].
 */
export async function renameChecklistGroup(orderOrId, oldName, newName) {
  const orderId = typeof orderOrId === 'string' ? orderOrId : orderOrId?.id;
  if (!orderId) throw new Error('orderId obrigatorio');
  const { groups, checklist } = await readFreshGroups(orderId);
  const newChecklist = checklist.map(i =>
    (i.group || '') === (oldName || '') ? { ...i, group: newName } : i
  );
  const newGroups = groups.map(g =>
    (g.name || '') === (oldName || '') ? { ...g, name: newName } : g
  );
  return updateOSOrder(orderId, { checklist: newChecklist, checklistGroups: newGroups });
}

export async function deleteChecklistGroup(orderOrId, groupName) {
  const orderId = typeof orderOrId === 'string' ? orderOrId : orderOrId?.id;
  if (!orderId) throw new Error('orderId obrigatorio');
  const { groups, checklist } = await readFreshGroups(orderId);
  const newChecklist = checklist.filter(i => (i.group || '') !== (groupName || ''));
  const newGroups = groups.filter(g => (g.name || '') !== (groupName || ''));
  return updateOSOrder(orderId, { checklist: newChecklist, checklistGroups: newGroups });
}

/**
 * Status derivado de 1 grupo: % de itens feitos.
 */
export function getGroupProgress(order, groupName) {
  const items = (order?.checklist || []).filter(i => (i.group || '') === (groupName || ''));
  const total = items.length;
  const done  = items.filter(i => i.done).length;
  return { total, done, ratio: total > 0 ? done / total : 0, allDone: total > 0 && done === total };
}

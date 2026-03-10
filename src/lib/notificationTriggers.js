/**
 * notificationTriggers.js — Gatilhos centralizados de notificacao
 *
 * Cada funcao recebe dados do evento e chama notify() para os destinatarios corretos.
 * Regra de ouro: NUNCA notificar o proprio usuario que disparou a acao.
 */

import { notify } from './notificationService';
import { namesMatch } from './kpiUtils';
import { MANAGER_ROLES } from './roleUtils';
import { shortName } from './teamService';

// ==================== HELPERS ====================

function findMemberByName(name, teamMembers) {
  if (!name || !teamMembers?.length) return null;
  return teamMembers.find(m => namesMatch(m.name, name));
}

function getManagers(teamMembers) {
  return (teamMembers || []).filter(m =>
    m.role && MANAGER_ROLES.some(r => m.role.toLowerCase().includes(r))
  );
}

// ==================== 1. OS ATRIBUIDA ====================

/**
 * Notifica quando uma OS e atribuida a alguem (assignedTo muda).
 */
export async function notifyOSAssigned(order, newAssigneeName, teamMembers, triggeredByUserId) {
  if (!newAssigneeName || !teamMembers?.length) return;

  const member = findMemberByName(newAssigneeName, teamMembers);
  if (!member?.authUserId || member.authUserId === triggeredByUserId) return;

  try {
    await notify({
      userId: member.authUserId,
      type: 'os_assigned',
      title: `O.S. #${order.number || ''} atribuida a voce`,
      message: order.title || 'Nova ordem de servico',
      entityType: 'os_order',
      entityId: order.id,
    });
  } catch { /* silenciar */ }
}

// ==================== 2. OS CONCLUIDA ====================

/**
 * Notifica managers quando uma OS e concluida.
 */
export async function notifyOSCompleted(order, teamMembers, triggeredByName, triggeredByUserId) {
  if (!teamMembers?.length) return;

  const managers = getManagers(teamMembers);

  for (const manager of managers) {
    if (!manager.authUserId || manager.authUserId === triggeredByUserId) continue;

    try {
      await notify({
        userId: manager.authUserId,
        type: 'os_completed',
        title: `O.S. #${order.number || ''} concluida`,
        message: `${shortName(triggeredByName)} finalizou: ${order.title || ''}`,
        entityType: 'os_order',
        entityId: order.id,
      });
    } catch { /* silenciar */ }
  }
}

// ==================== 3. OS BLOQUEADA ====================

/**
 * Notifica managers quando uma OS e bloqueada.
 */
export async function notifyOSBlocked(order, reason, teamMembers, triggeredByUserId) {
  if (!teamMembers?.length) return;

  const REASON_LABELS = {
    material: 'Material',
    approval: 'Aprovacao',
    resource: 'Recurso',
    dependency: 'Dependencia',
    other: 'Outro',
  };

  const reasonLabel = REASON_LABELS[reason] || reason || 'Motivo nao informado';
  const managers = getManagers(teamMembers);

  for (const manager of managers) {
    if (!manager.authUserId || manager.authUserId === triggeredByUserId) continue;

    try {
      await notify({
        userId: manager.authUserId,
        type: 'warning',
        title: `O.S. #${order.number || ''} bloqueada`,
        message: `${order.title || ''} — Motivo: ${reasonLabel}`,
        entityType: 'os_order',
        entityId: order.id,
      });
    } catch { /* silenciar */ }
  }
}

// ==================== 4. OS EDITADA ====================

/**
 * Notifica o responsavel quando campos importantes da OS sao alterados.
 * Campos monitorados: title, description, priority, estimatedEnd, checklist, status.
 */
export async function notifyOSUpdated(order, changes, teamMembers, triggeredByUserId) {
  if (!teamMembers?.length) return;
  if (!order?.assignee && !order?.assignedTo) return;

  // Campos que valem notificacao
  const TRACKED = ['title', 'description', 'priority', 'estimatedEnd', 'checklist', 'status', 'category', 'location'];
  const changedKeys = Object.keys(changes).filter(k => TRACKED.includes(k));
  if (changedKeys.length === 0) return;

  const LABELS = {
    title: 'titulo',
    description: 'descricao',
    priority: 'prioridade',
    estimatedEnd: 'prazo',
    checklist: 'tarefas',
    status: 'status',
    category: 'categoria',
    location: 'local',
  };
  const summary = changedKeys.map(k => LABELS[k] || k).join(', ');

  // Notificar tanto o executor (assignee) quanto o planejado (assignedTo)
  const notifiedIds = new Set();

  for (const name of [order.assignee, order.assignedTo]) {
    if (!name) continue;
    const member = findMemberByName(name, teamMembers);
    if (!member?.authUserId || member.authUserId === triggeredByUserId) continue;
    if (notifiedIds.has(member.authUserId)) continue;
    notifiedIds.add(member.authUserId);

    try {
      await notify({
        userId: member.authUserId,
        type: 'os_updated',
        title: `O.S. #${order.number || ''} atualizada`,
        message: `Alterado: ${summary}`,
        entityType: 'os_order',
        entityId: order.id,
      });
    } catch { /* silenciar */ }
  }
}

// ==================== 5. OS CRIADA ====================

/**
 * Notifica managers quando uma nova OS e criada.
 */
export async function notifyOSCreated(order, teamMembers, triggeredByUserId) {
  if (!teamMembers?.length) return;

  const managers = getManagers(teamMembers);

  for (const manager of managers) {
    if (!manager.authUserId || manager.authUserId === triggeredByUserId) continue;

    try {
      await notify({
        userId: manager.authUserId,
        type: 'os_created',
        title: `Nova O.S. #${order.number || ''} criada`,
        message: order.title || 'Ordem de servico',
        entityType: 'os_order',
        entityId: order.id,
      });
    } catch { /* silenciar */ }
  }
}

// ==================== 6. NOVO COMENTARIO ====================

/**
 * Notifica o assignee da OS quando alguem comenta (se nao foi @mencionado).
 */
export async function notifyCommentToAssignee({ orderId, orderNumber, orderTitle, orderAssignee, orderAssignedTo, authorUserId, authorName, teamMembers, mentionedAuthIds }) {
  if (!teamMembers?.length) return;
  if (!orderAssignee && !orderAssignedTo) return;

  const notifiedIds = new Set();

  for (const name of [orderAssignee, orderAssignedTo]) {
    if (!name) continue;
    const member = findMemberByName(name, teamMembers);
    if (!member?.authUserId) continue;
    if (member.authUserId === authorUserId) continue;
    if (mentionedAuthIds?.includes(member.authUserId)) continue;
    if (notifiedIds.has(member.authUserId)) continue;
    notifiedIds.add(member.authUserId);

    try {
      await notify({
        userId: member.authUserId,
        type: 'comment_added',
        title: `Novo comentario na OS #${orderNumber || ''}`,
        message: `${shortName(authorName)}: ${orderTitle || ''}`,
        entityType: 'os_order',
        entityId: orderId,
      });
    } catch { /* silenciar */ }
  }
}

// ==================== 7. EVENTO CRIADO ====================

/**
 * Notifica participantes quando um evento e criado/atualizado.
 */
export async function notifyEventCreated(event, attendeeIds, teamMembers, createdByUserId) {
  if (!attendeeIds?.length || !teamMembers?.length) return;

  const startFormatted = event.startDate
    ? new Date(event.startDate).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '';

  for (const memberId of attendeeIds) {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member?.authUserId || member.authUserId === createdByUserId) continue;

    try {
      await notify({
        userId: member.authUserId,
        type: 'event_reminder',
        title: `Novo evento: ${event.title || ''}`,
        message: startFormatted ? `Data: ${startFormatted}` : 'Confira na agenda',
        entityType: 'agenda_event',
        entityId: event.id,
      });
    } catch { /* silenciar */ }
  }
}

// ==================== 8. VERIFICACAO DE PRAZOS ====================

const DEADLINE_STORAGE_KEY = 'fyness_deadline_notified';

function getNotifiedToday() {
  try {
    const raw = localStorage.getItem(DEADLINE_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    // Resetar se mudou o dia
    if (parsed._date !== today) return { _date: today };
    return parsed;
  } catch {
    return {};
  }
}

function markNotified(key) {
  const current = getNotifiedToday();
  current._date = new Date().toISOString().slice(0, 10);
  current[key] = true;
  localStorage.setItem(DEADLINE_STORAGE_KEY, JSON.stringify(current));
}

/**
 * Verifica OS com prazo proximo ou atrasado e envia notificacoes.
 * Usa localStorage para evitar duplicatas no mesmo dia.
 */
export async function checkAndNotifyDeadlines(orders, teamMembers) {
  if (!orders?.length || !teamMembers?.length) return;

  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const notified = getNotifiedToday();
  const managers = getManagers(teamMembers);

  for (const order of orders) {
    if (order.status === 'done' || !order.estimatedEnd) continue;

    const deadline = new Date(order.estimatedEnd);
    if (isNaN(deadline.getTime())) continue;

    const assigneeMember = findMemberByName(order.assignee, teamMembers);

    // ATRASADA
    if (deadline < now) {
      const overdueKey = `overdue_${order.id}`;
      if (notified[overdueKey]) continue;

      // Notificar assignee
      if (assigneeMember?.authUserId) {
        try {
          await notify({
            userId: assigneeMember.authUserId,
            type: 'warning',
            title: `O.S. #${order.number || ''} atrasada!`,
            message: `${order.title || ''} — prazo era ${deadline.toLocaleDateString('pt-BR')}`,
            entityType: 'os_order',
            entityId: order.id,
          });
        } catch { /* silenciar */ }
      }

      // Notificar managers
      for (const mgr of managers) {
        if (!mgr.authUserId || mgr.authUserId === assigneeMember?.authUserId) continue;
        try {
          await notify({
            userId: mgr.authUserId,
            type: 'warning',
            title: `O.S. #${order.number || ''} atrasada`,
            message: `${order.title || ''} (${order.assignee || 'Sem responsavel'})`,
            entityType: 'os_order',
            entityId: order.id,
          });
        } catch { /* silenciar */ }
      }

      markNotified(overdueKey);
      continue;
    }

    // PROXIMO DO PRAZO (dentro de 24h)
    if (deadline <= in24h) {
      const warningKey = `warning_${order.id}`;
      if (notified[warningKey]) continue;

      if (assigneeMember?.authUserId) {
        try {
          await notify({
            userId: assigneeMember.authUserId,
            type: 'deadline_warning',
            title: `Prazo proximo: O.S. #${order.number || ''}`,
            message: `${order.title || ''} vence ${deadline.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`,
            entityType: 'os_order',
            entityId: order.id,
          });
        } catch { /* silenciar */ }
      }

      markNotified(warningKey);
    }
  }
}

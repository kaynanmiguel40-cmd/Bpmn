import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOSOrders, getOSSectors, getOSProjects, createOSOrder, updateOSOrder, deleteOSOrder, createOSSector, updateOSSector, deleteOSSector, createOSProject, updateOSProject, deleteOSProject } from '../lib/osService';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '../lib/teamService';
import { getAgendaEvents, createAgendaEvent, updateAgendaEvent, deleteAgendaEvent } from '../lib/agendaService';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } from '../lib/notificationService';
import { getClients, createClient, updateClient, deleteClient } from '../lib/clientService';
import { getAllActivities } from '../lib/activityLogService';
import { getHistory as getKPIHistory } from '../lib/kpiSnapshotService';
import { getEapFolders, createEapFolder, updateEapFolder, deleteEapFolder, getEapProjects, createEapProject, updateEapProject, deleteEapProject, getEapTasks, createEapTask, updateEapTask, deleteEapTask } from '../lib/eapService';
import { getCommentsByOrder, addComment, getChatSummaries, markConversationRead, getConversationReads } from '../lib/commentService';
import { getPenalties, createPenalty, deletePenalty } from '../lib/penaltyService';
import { getContentPosts, createContentPost, updateContentPost, deleteContentPost } from '../lib/contentService';
import { getProcessOrdersByProject, getProcessOrderByElement, createProcessOrder, updateProcessOrder, deleteProcessOrder } from '../lib/processOrderService';
import { supabase } from '../lib/supabase';
import { pushEventToGCal, getGCalConnectionStatus, fetchGCalEvents, createGCalEvent, updateGCalEvent, deleteGCalEvent, syncOSToGCal, deleteOSFromGCal } from '../lib/googleCalendarService';

/** Log falha de sync com GCal sem bloquear o fluxo principal */
function logGCalSyncError(action, err) {
  console.warn(`[GCal Sync] Falha ao ${action}:`, err?.message || err);
}

// ==================== HOOK FACTORIES ====================

/** Cria um hook de query simples */
function makeQueryHook(key, fn, staleTime) {
  return () => useQuery({ queryKey: key, queryFn: fn, staleTime });
}

/** Cria um hook de mutation simples (create/delete) */
function makeMutationHook(fn, key) {
  return () => {
    const qc = useQueryClient();
    return useMutation({ mutationFn: fn, onSuccess: () => qc.invalidateQueries({ queryKey: key }) });
  };
}

/** Cria um hook de update mutation ({ id, updates } -> updateFn(id, updates)) */
function makeUpdateHook(fn, key) {
  return () => {
    const qc = useQueryClient();
    return useMutation({
      mutationFn: ({ id, updates }) => fn(id, updates),
      onSuccess: () => qc.invalidateQueries({ queryKey: key }),
    });
  };
}

// ==================== QUERY KEYS ====================

export const queryKeys = {
  osOrders: ['osOrders'],
  osSectors: ['osSectors'],
  osProjects: ['osProjects'],
  teamMembers: ['teamMembers'],
  agendaEvents: ['agendaEvents'],
  notifications: ['notifications'],
  unreadCount: ['unreadCount'],
  activities: ['activities'],
  clients: ['clients'],
  kpiHistory: ['kpiHistory'],
  eapFolders: ['eapFolders'],
  eapProjects: ['eapProjects'],
  eapTasks: ['eapTasks'],
  contentPosts: ['contentPosts'],
  processOrders: ['processOrders'],
  googleCalendarStatus: ['googleCalendarStatus'],
};

// ==================== OS ORDERS ====================

export const useOSOrders = makeQueryHook(queryKeys.osOrders, getOSOrders, 30_000);

export function useCreateOSOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOSOrder,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.osOrders });
      if (data) syncOSToGCal(data).catch(err => logGCalSyncError('sincronizar OS criada', err));
    },
  });
}

export function useUpdateOSOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateOSOrder(id, updates),
    onSuccess: async (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.osOrders });
      // Buscar O.S. atualizada para sincronizar com Google Calendar
      const orders = qc.getQueryData(queryKeys.osOrders);
      const os = orders?.find(o => o.id === variables.id);
      if (os) syncOSToGCal({ ...os, ...variables.updates }).catch(err => logGCalSyncError('sincronizar OS atualizada', err));
    },
  });
}

export function useDeleteOSOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      deleteOSFromGCal(id).catch(err => logGCalSyncError('remover OS do GCal', err));
      return deleteOSOrder(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.osOrders }),
  });
}

// ==================== OS SECTORS ====================

export const useOSSectors = makeQueryHook(queryKeys.osSectors, getOSSectors, 60_000);
export const useCreateOSSector = makeMutationHook(createOSSector, queryKeys.osSectors);
export const useUpdateOSSector = makeUpdateHook(updateOSSector, queryKeys.osSectors);
export const useDeleteOSSector = makeMutationHook(deleteOSSector, queryKeys.osSectors);

// ==================== OS PROJECTS ====================

export const useOSProjects = makeQueryHook(queryKeys.osProjects, getOSProjects, 60_000);
export const useCreateOSProject = makeMutationHook(createOSProject, queryKeys.osProjects);
export const useUpdateOSProject = makeUpdateHook(updateOSProject, queryKeys.osProjects);
export const useDeleteOSProject = makeMutationHook(deleteOSProject, queryKeys.osProjects);

// ==================== TEAM MEMBERS ====================

export const useTeamMembers = makeQueryHook(queryKeys.teamMembers, getTeamMembers, 60_000);
export const useCreateTeamMember = makeMutationHook(createTeamMember, queryKeys.teamMembers);
export const useUpdateTeamMember = makeUpdateHook(updateTeamMember, queryKeys.teamMembers);
export const useDeleteTeamMember = makeMutationHook(deleteTeamMember, queryKeys.teamMembers);

// ==================== AGENDA EVENTS (com Google Calendar sync) ====================

export const useAgendaEvents = makeQueryHook(queryKeys.agendaEvents, getAgendaEvents, 30_000);

export function useCreateAgendaEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAgendaEvent,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: queryKeys.agendaEvents });
      if (data?.id) pushEventToGCal(data.id, 'create').catch(err => logGCalSyncError('criar evento no GCal', err));
    },
  });
}

export function useUpdateAgendaEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateAgendaEvent(id, updates),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.agendaEvents });
      if (variables?.id) pushEventToGCal(variables.id, 'update').catch(err => logGCalSyncError('atualizar evento no GCal', err));
    },
  });
}

export function useDeleteAgendaEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => {
      // Guardar o ID antes de deletar para poder fazer push
      pushEventToGCal(id, 'delete').catch(err => logGCalSyncError('deletar evento do GCal', err));
      return deleteAgendaEvent(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.agendaEvents });
    },
  });
}

// ==================== GOOGLE CALENDAR STATUS ====================

export const useGCalStatus = () => useQuery({
  queryKey: queryKeys.googleCalendarStatus,
  queryFn: getGCalConnectionStatus,
  staleTime: 60_000,
});

// ==================== GOOGLE CALENDAR DIRECT CRUD ====================

/** Busca eventos direto do Google Calendar (sem Supabase) */
export function useGCalEvents(timeMin, timeMax, enabled = true) {
  return useQuery({
    queryKey: ['gcalEvents', timeMin?.toISOString?.() || timeMin, timeMax?.toISOString?.() || timeMax],
    queryFn: () => fetchGCalEvents(timeMin, timeMax),
    enabled: !!enabled && !!timeMin && !!timeMax,
    staleTime: 30_000,
  });
}

export function useCreateGCalEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createGCalEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gcalEvents'] }),
  });
}

export function useUpdateGCalEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateGCalEvent(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gcalEvents'] }),
  });
}

export function useDeleteGCalEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => deleteGCalEvent(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['gcalEvents'] }),
  });
}

// ==================== NOTIFICATIONS ====================

export const useNotifications = makeQueryHook(queryKeys.notifications, getNotifications, 10_000);
export const useUnreadCount = makeQueryHook(queryKeys.unreadCount, getUnreadCount, 10_000);

export function useMarkAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
      qc.invalidateQueries({ queryKey: queryKeys.unreadCount });
    },
  });
}

export function useMarkAllAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
      qc.invalidateQueries({ queryKey: queryKeys.unreadCount });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
      qc.invalidateQueries({ queryKey: queryKeys.unreadCount });
    },
  });
}

// ==================== CLIENTS ====================

export const useClients = makeQueryHook(queryKeys.clients, getClients, 60_000);
export const useCreateClient = makeMutationHook(createClient, queryKeys.clients);
export const useUpdateClient = makeUpdateHook(updateClient, queryKeys.clients);
export const useDeleteClient = makeMutationHook(deleteClient, queryKeys.clients);

// ==================== ACTIVITIES ====================

export function useActivities(limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.activities, limit],
    queryFn: () => getAllActivities(),
    staleTime: 30_000,
  });
}

// ==================== KPI HISTORY ====================

export function useKPIHistory(limit = 12) {
  return useQuery({
    queryKey: [...queryKeys.kpiHistory, limit],
    queryFn: () => getKPIHistory(limit),
    staleTime: 120_000,
  });
}

// ==================== EAP FOLDERS ====================

export const useEapFolders = makeQueryHook(queryKeys.eapFolders, getEapFolders, 30_000);
export const useCreateEapFolder = makeMutationHook(createEapFolder, queryKeys.eapFolders);
export const useUpdateEapFolder = makeUpdateHook(updateEapFolder, queryKeys.eapFolders);
export const useDeleteEapFolder = makeMutationHook(deleteEapFolder, queryKeys.eapFolders);

// ==================== EAP PROJECTS ====================

export const useEapProjects = makeQueryHook(queryKeys.eapProjects, getEapProjects, 30_000);
export const useCreateEapProject = makeMutationHook(createEapProject, queryKeys.eapProjects);
export const useUpdateEapProject = makeUpdateHook(updateEapProject, queryKeys.eapProjects);
export const useDeleteEapProject = makeMutationHook(deleteEapProject, queryKeys.eapProjects);

// ==================== EAP TASKS ====================

export const useEapTasks = makeQueryHook(queryKeys.eapTasks, getEapTasks, 15_000);
export const useCreateEapTask = makeMutationHook(createEapTask, queryKeys.eapTasks);

// Custom: skipInvalidation para operacoes batch (auto-scheduling, undo)
export function useUpdateEapTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateEapTask(id, updates),
    onSuccess: (_, variables) => {
      if (!variables.skipInvalidation) {
        qc.invalidateQueries({ queryKey: queryKeys.eapTasks });
      }
    },
  });
}

export const useDeleteEapTask = makeMutationHook(deleteEapTask, queryKeys.eapTasks);

// ==================== MEMBER AVATARS ====================

export function useMemberAvatars(teamMembers) {
  const authIds = (teamMembers || []).filter(m => m.authUserId).map(m => m.authUserId);
  return useQuery({
    queryKey: ['memberAvatars', authIds.sort().join(',')],
    queryFn: async () => {
      if (authIds.length === 0) return {};
      const { data } = await supabase
        .from('user_profiles')
        .select('id, avatar')
        .in('id', authIds);
      const map = {};
      (data || []).forEach(p => { if (p.avatar) map[p.id] = p.avatar; });
      return map;
    },
    enabled: authIds.length > 0,
    staleTime: 5 * 60_000,
  });
}

// ==================== OS CHAT (COMMENTS) ====================

export function useOSComments(orderId) {
  return useQuery({
    queryKey: ['osComments', orderId],
    queryFn: () => getCommentsByOrder(orderId),
    enabled: !!orderId,
    staleTime: 10_000,
  });
}

export function useAddOSComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: addComment,
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['osComments', variables.orderId] });
      qc.invalidateQueries({ queryKey: ['chatSummaries'] });
    },
  });
}

export const useChatSummaries = makeQueryHook(['chatSummaries'], getChatSummaries, 30_000);

// ==================== READ RECEIPTS ====================

export function useConversationReads(orderId) {
  return useQuery({
    queryKey: ['conversationReads', orderId],
    queryFn: () => getConversationReads(orderId),
    enabled: !!orderId,
    staleTime: 5_000,
    refetchInterval: 10_000,
  });
}

export function useMarkConversationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, userId, userName }) => markConversationRead(orderId, userId, userName),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: ['conversationReads', variables.orderId] });
    },
  });
}

// ==================== PENALTIES (PUNICOES) ====================

export const usePenalties = makeQueryHook(['penalties'], getPenalties, 30_000);
export const useCreatePenalty = makeMutationHook(createPenalty, ['penalties']);
export const useDeletePenalty = makeMutationHook(deletePenalty, ['penalties']);

// ==================== CONTENT POSTS (Calendario de Postagens) ====================

export const useContentPosts = makeQueryHook(queryKeys.contentPosts, getContentPosts, 30_000);
export const useCreateContentPost = makeMutationHook(createContentPost, queryKeys.contentPosts);
export const useUpdateContentPost = makeUpdateHook(updateContentPost, queryKeys.contentPosts);
export const useDeleteContentPost = makeMutationHook(deleteContentPost, queryKeys.contentPosts);

// ==================== PROCESS ORDERS (Ordem de Processo) ====================

export function useProcessOrdersByProject(projectId) {
  return useQuery({
    queryKey: [...queryKeys.processOrders, 'project', projectId],
    queryFn: () => getProcessOrdersByProject(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
  });
}

export function useProcessOrderByElement(projectId, elementId) {
  return useQuery({
    queryKey: [...queryKeys.processOrders, 'element', projectId, elementId],
    queryFn: () => getProcessOrderByElement(projectId, elementId),
    enabled: !!projectId && !!elementId,
    staleTime: 30_000,
  });
}

export const useCreateProcessOrder = makeMutationHook(createProcessOrder, queryKeys.processOrders);
export const useUpdateProcessOrder = makeUpdateHook(updateProcessOrder, queryKeys.processOrders);
export const useDeleteProcessOrder = makeMutationHook(deleteProcessOrder, queryKeys.processOrders);

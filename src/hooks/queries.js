import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOSOrders, getOSSectors, getOSProjects, createOSOrder, updateOSOrder, deleteOSOrder, createOSSector, updateOSSector, deleteOSSector, createOSProject, updateOSProject, deleteOSProject } from '../lib/osService';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '../lib/teamService';
import { getAgendaEvents, createAgendaEvent, updateAgendaEvent, deleteAgendaEvent } from '../lib/agendaService';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } from '../lib/notificationService';
import { getClients, createClient, updateClient, deleteClient } from '../lib/clientService';
import { getAllActivities } from '../lib/activityLogService';
import { getHistory as getKPIHistory } from '../lib/kpiSnapshotService';
import { getEapProjects, createEapProject, updateEapProject, deleteEapProject, getEapTasks, createEapTask, updateEapTask, deleteEapTask } from '../lib/eapService';
import { getCommentsByOrder, addComment, getChatSummaries, markConversationRead, getConversationReads } from '../lib/commentService';
import { getPenalties, createPenalty, deletePenalty } from '../lib/penaltyService';
import { getContentPosts, createContentPost, updateContentPost, deleteContentPost } from '../lib/contentService';
import { supabase } from '../lib/supabase';

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
  eapProjects: ['eapProjects'],
  eapTasks: ['eapTasks'],
  contentPosts: ['contentPosts'],
};

// ==================== OS ORDERS ====================

export function useOSOrders() {
  return useQuery({
    queryKey: queryKeys.osOrders,
    queryFn: getOSOrders,
    staleTime: 30_000,
  });
}

export function useOSSectors() {
  return useQuery({
    queryKey: queryKeys.osSectors,
    queryFn: getOSSectors,
    staleTime: 60_000,
  });
}

export function useOSProjects() {
  return useQuery({
    queryKey: queryKeys.osProjects,
    queryFn: getOSProjects,
    staleTime: 60_000,
  });
}

export function useCreateOSOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOSOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.osOrders }),
  });
}

export function useUpdateOSOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateOSOrder(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.osOrders }),
  });
}

export function useDeleteOSOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteOSOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.osOrders }),
  });
}

// ==================== OS SECTORS ====================

export function useCreateOSSector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOSSector,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.osSectors }),
  });
}

export function useUpdateOSSector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateOSSector(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.osSectors }),
  });
}

export function useDeleteOSSector() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteOSSector,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.osSectors }),
  });
}

// ==================== OS PROJECTS ====================

export function useCreateOSProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createOSProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.osProjects }),
  });
}

export function useUpdateOSProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateOSProject(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.osProjects }),
  });
}

export function useDeleteOSProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteOSProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.osProjects }),
  });
}

// ==================== TEAM MEMBERS ====================

export function useTeamMembers() {
  return useQuery({
    queryKey: queryKeys.teamMembers,
    queryFn: getTeamMembers,
    staleTime: 60_000,
  });
}

export function useCreateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTeamMember,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teamMembers }),
  });
}

export function useUpdateTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateTeamMember(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teamMembers }),
  });
}

export function useDeleteTeamMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteTeamMember,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.teamMembers }),
  });
}

// ==================== AGENDA EVENTS ====================

export function useAgendaEvents() {
  return useQuery({
    queryKey: queryKeys.agendaEvents,
    queryFn: getAgendaEvents,
    staleTime: 30_000,
  });
}

export function useCreateAgendaEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAgendaEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.agendaEvents }),
  });
}

export function useUpdateAgendaEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateAgendaEvent(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.agendaEvents }),
  });
}

export function useDeleteAgendaEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAgendaEvent,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.agendaEvents }),
  });
}

// ==================== NOTIFICATIONS ====================

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.notifications,
    queryFn: getNotifications,
    staleTime: 10_000,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: queryKeys.unreadCount,
    queryFn: getUnreadCount,
    staleTime: 10_000,
  });
}

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

export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: getClients,
    staleTime: 60_000,
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createClient,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.clients }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateClient(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.clients }),
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteClient,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.clients }),
  });
}

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

// ==================== EAP PROJECTS ====================

export function useEapProjects() {
  return useQuery({
    queryKey: queryKeys.eapProjects,
    queryFn: getEapProjects,
    staleTime: 30_000,
  });
}

export function useCreateEapProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEapProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.eapProjects }),
  });
}

export function useUpdateEapProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateEapProject(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.eapProjects }),
  });
}

export function useDeleteEapProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEapProject,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.eapProjects }),
  });
}

// ==================== EAP TASKS ====================

export function useEapTasks() {
  return useQuery({
    queryKey: queryKeys.eapTasks,
    queryFn: getEapTasks,
    staleTime: 15_000,
  });
}

export function useCreateEapTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createEapTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.eapTasks }),
  });
}

export function useUpdateEapTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateEapTask(id, updates),
    onSuccess: (_, variables) => {
      // Em operacoes batch (auto-scheduling, undo), pular invalidacao individual
      // O chamador invalida uma vez no final
      if (!variables.skipInvalidation) {
        qc.invalidateQueries({ queryKey: queryKeys.eapTasks });
      }
    },
  });
}

export function useDeleteEapTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteEapTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.eapTasks }),
  });
}

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

export function useChatSummaries() {
  return useQuery({
    queryKey: ['chatSummaries'],
    queryFn: getChatSummaries,
    staleTime: 30_000,
  });
}

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

export function usePenalties() {
  return useQuery({
    queryKey: ['penalties'],
    queryFn: getPenalties,
    staleTime: 30_000,
  });
}

export function useCreatePenalty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPenalty,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['penalties'] }),
  });
}

export function useDeletePenalty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePenalty,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['penalties'] }),
  });
}

// ==================== CONTENT POSTS (Calendario de Postagens) ====================

export function useContentPosts() {
  return useQuery({ queryKey: queryKeys.contentPosts, queryFn: getContentPosts, staleTime: 30_000 });
}

export function useCreateContentPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createContentPost,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.contentPosts }),
  });
}

export function useUpdateContentPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }) => updateContentPost(id, updates),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.contentPosts }),
  });
}

export function useDeleteContentPost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteContentPost,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.contentPosts }),
  });
}

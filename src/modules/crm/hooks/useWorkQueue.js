/**
 * useWorkQueue — monta a fila de trabalho da Agenda, ja agrupada.
 *
 * O filtro de dono e CLIENT-SIDE de proposito, apesar de parecer desperdicio:
 * a cadencia legada gravou `team_members.id` em `assigned_to` (a coluna espera
 * `auth_user_id`), e a migration 097 so corrigiu as linhas que tinham
 * `stage_step_id`. Filtrar no servidor antes de limpar o dado faria as tarefas
 * legadas sumirem de TODO MUNDO — que e exatamente o modo de falha que a fila
 * existe pra matar. O custo ja foi cortado nas colunas enxutas e nos tetos.
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOverdueQueue, getTodayQueue, getUpcomingCounts, getStalledLeads, snoozeActivity, getNextStageForDeal, planBatchPostpone, applyBatchPostpone, getNextActivityForLead,
} from '../services/crmQueueService';
import { isCold, COLD_AFTER_DAYS } from '../utils/stepLabel';
import { namesMatch } from '../../../lib/kpiUtils';
import { useProfile } from '../../../hooks/useProfile';
import { toast } from '../../../contexts/ToastContext';

export const workQueueKeys = {
  all: ['crm', 'workQueue'],
  overdue: ['crm', 'workQueue', 'overdue'],
  today: ['crm', 'workQueue', 'today'],
  upcoming: ['crm', 'workQueue', 'upcoming'],
  stalled: ['crm', 'workQueue', 'stalled'],
};

/**
 * A tarefa e minha? Mesma tripla que a Agenda ja usava: id do usuario,
 * fallback por NOME (pra cadencia legada) e, por ultimo, quem criou.
 */
export function ownsTask(task, uid, uname) {
  if (!task) return false;
  if (task.assignedTo) return task.assignedTo === uid;
  if (task.assignedToName && uname) return namesMatch(task.assignedToName, uname);
  return task.createdBy === uid;
}

/** Tarefa sem dono resolvivel — nao e de ninguem, entao some da tela de todos. */
export function isOrphan(task) {
  return !task?.assignedTo && !task?.assignedToName && !task?.createdBy;
}

export function useWorkQueue() {
  const { profile, isLoading: profileLoading } = useProfile();
  const uid = profile?.id || null;
  const uname = profile?.name || null;

  const overdueQ = useQuery({
    queryKey: workQueueKeys.overdue,
    queryFn: () => getOverdueQueue(),
    staleTime: 30_000,
  });
  const todayQ = useQuery({
    queryKey: workQueueKeys.today,
    queryFn: () => getTodayQueue(),
    staleTime: 30_000,
  });
  const upcomingQ = useQuery({
    queryKey: workQueueKeys.upcoming,
    queryFn: () => getUpcomingCounts(),
    staleTime: 60_000,
  });

  return useMemo(() => {
    const mine = (list) => (list || []).filter(t => ownsTask(t, uid, uname));

    const overdueAll = mine(overdueQ.data);
    // O corte de 7 dias existe pra fila ser ZERAVEL. Uma faixa vermelha que
    // nunca chega a zero vira mobilia em duas semanas e para de ser lida.
    const overdue = overdueAll.filter(t => !isCold(t));
    const cold = overdueAll.filter(t => isCold(t));

    const todayAll = mine(todayQ.data);
    const todayPending = todayAll.filter(t => !t.completed);
    const doneToday = todayAll.filter(t => t.completed);

    // Atrasadas agrupadas por LEAD: 5 toques parados do mesmo lead sao UMA
    // conversa a retomar, nao 5 itens soltos competindo por atencao.
    const byLead = [];
    const idx = new Map();
    for (const t of overdue) {
      const key = t.dealId || t.contactId || t.id;
      if (!idx.has(key)) {
        idx.set(key, byLead.length);
        byLead.push({ key, leadName: t.leadName, dealId: t.dealId, stageName: t.stageName, tasks: [] });
      }
      byLead[idx.get(key)].tasks.push(t);
    }
    // Lead com o toque mais antigo primeiro — e o que esta esfriando.
    byLead.forEach(g => g.tasks.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)));
    byLead.sort((a, b) => new Date(a.tasks[0].startDate) - new Date(b.tasks[0].startDate));

    const manha = todayPending.filter(t => new Date(t.startDate).getHours() < 12);
    const tarde = todayPending.filter(t => new Date(t.startDate).getHours() >= 12);

    // "Comece por aqui": a atrasada mais antiga; na falta, o proximo toque de
    // hoje. Uma tarefa so, pra tela ter uma resposta e nao um menu.
    const now = byLead[0]?.tasks[0] || todayPending[0] || null;

    const upcomingByDay = {};
    (upcomingQ.data || []).forEach(r => {
      if (!ownsTask({ assignedTo: r.assigned_to, assignedToName: r.assigned_to_name, createdBy: r.created_by }, uid, uname)) return;
      const d = new Date(r.start_date);
      const k = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      upcomingByDay[k] = (upcomingByDay[k] || 0) + 1;
    });

    // Tarefa que existe mas nao e de ninguem: some da fila de todos. Sem este
    // contador a tela mentiria dizendo "nada pendente".
    const orphanCount = [...(overdueQ.data || []), ...(todayQ.data || [])].filter(isOrphan).length;

    const total = overdue.length + todayPending.length;
    return {
      now,
      overdueByLead: byLead,
      overdueCount: overdue.length,
      coldCount: cold.length,
      coldAfterDays: COLD_AFTER_DAYS,
      manha,
      tarde,
      todayCount: todayPending.length,
      doneToday,
      upcomingByDay,
      total,
      doneCount: doneToday.length,
      orphanCount,
      isEmpty: total === 0,
      isLoading: profileLoading || overdueQ.isLoading || todayQ.isLoading,
      isError: overdueQ.isError || todayQ.isError,
      error: overdueQ.error || todayQ.error,
      refetch: () => { overdueQ.refetch(); todayQ.refetch(); upcomingQ.refetch(); },
    };
  }, [overdueQ.data, overdueQ.isLoading, overdueQ.isError, todayQ.data, todayQ.isLoading, todayQ.isError, upcomingQ.data, uid, uname, profileLoading]);
}

/**
 * Proxima etapa do lead — pro convite de avancar apos um toque bem-sucedido.
 * So dispara quando ha um dealId (tarefa avulsa nao tem etapa a avancar).
 */
export function useNextStage(dealId) {
  return useQuery({
    queryKey: ['crm', 'nextStage', dealId],
    queryFn: () => getNextStageForDeal(dealId),
    enabled: !!dealId,
    staleTime: 60_000,
  });
}

/**
 * Proximo toque pendente do lead. Consulta o banco (nao a fila carregada):
 * o proximo da cadencia costuma ser amanha ou depois, fora do recorte da fila.
 */
export function useNextActivityForLead({ dealId, contactId, after } = {}) {
  return useQuery({
    queryKey: ['crm', 'nextActivity', dealId || '', contactId || '', after || ''],
    queryFn: () => getNextActivityForLead({ dealId, contactId, after }),
    enabled: !!(dealId || contactId) && !!after,
    staleTime: 30_000,
  });
}

export function useStalledLeads() {
  return useQuery({
    queryKey: workQueueKeys.stalled,
    queryFn: () => getStalledLeads(),
    staleTime: 5 * 60_000,
  });
}

/**
 * Adiar em lote, em duas etapas: `planejar` devolve o plano pra ela CONFERIR,
 * `aplicar` grava. Nunca grava direto — ver planBatchPostpone.
 */
export function useBatchPostpone() {
  const qc = useQueryClient();
  const { profile } = useProfile();

  const planejar = useMutation({
    mutationFn: ({ tasks }) => planBatchPostpone(tasks, profile?.id || null),
    onError: (err) => toast(`Não consegui calcular o adiamento: ${err.message}`, 'error'),
  });

  const aplicar = useMutation({
    mutationFn: ({ plano }) => applyBatchPostpone(plano),
    onSuccess: (n) => {
      qc.invalidateQueries({ queryKey: workQueueKeys.all });
      qc.invalidateQueries({ queryKey: ['crm', 'calendarActivities'] });
      qc.invalidateQueries({ queryKey: ['agendaCrmActivities'] });
      toast(`${n} ${n === 1 ? 'tarefa adiada' : 'tarefas adiadas'}`, 'success');
    },
    onError: (err) => toast(`Não consegui adiar: ${err.message}`, 'error'),
  });

  return { planejar, aplicar };
}

export function useSnoozeActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, start }) => snoozeActivity(id, start),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: workQueueKeys.all });
      qc.invalidateQueries({ queryKey: ['crm', 'calendarActivities'] });
      qc.invalidateQueries({ queryKey: ['crm', 'dealActivities'] });
      qc.invalidateQueries({ queryKey: ['agendaCrmActivities'] });
    },
    onError: (err) => toast(`Não consegui adiar: ${err.message}`, 'error'),
  });
}

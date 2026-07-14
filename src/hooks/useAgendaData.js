/**
 * useAgendaData — monta os dados unificados da agenda (uma vez, reutilizável).
 *
 * Junta as 4 fontes no MESMO shape do CrmCalendar, cada evento com `assignee`
 * (id do membro). Usado tanto pela Agenda (/agenda) quanto pelo Cronograma da
 * equipe (/cronograma), pra não duplicar a lógica de dedup de membros e de
 * resolução das atividades comerciais.
 *
 * Retorna só LEITURA (membros + eventos). Mutations de evento, filtros e modais
 * ficam em cada página.
 */

import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  useAgendaEvents, useTeamMembers, useOSOrders, useGCalEvents, useTeamGCalEvents, useGCalStatus,
} from './queries';
import { useProfile } from './useProfile';
import { namesMatch } from '../lib/kpiUtils';
import { buildOSDeadlineEvents } from '../lib/agendaDeadlines';
import { expandRecurrences } from '../lib/recurrenceUtils';
import { useRealtimeAgendaEvents } from './useRealtimeSubscription';
import { getCrmCalendarActivities } from '../modules/crm/services/crmAgendaService';

// Tipos de evento LOCAL (criados direto na agenda).
export const EVENT_TYPES = [
  { id: 'meeting', label: 'Reuniao', color: '#3b82f6' },
  { id: 'task', label: 'Tarefa', color: '#22c55e' },
  { id: 'personal', label: 'Pessoal', color: '#64748b' },
];
export const typeMeta = (id) => EVENT_TYPES.find(t => t.id === id) || EVENT_TYPES[0];

// Chave de dedupe CRM<->espelho/Google: título normalizado + minuto de início.
// Toda atividade do CRM vira um agenda_event espelho (mesmo título/horário) que
// ainda é empurrado pro Google. Sem deduplicar, a mesma atividade apareceria 2x
// (chip 'Comercial' + chip 'Reuniões') e 3x com Google conectado. Mesma chave
// usada pela CrmAgendaPage.
const dedupeKey = (title, startDate) => {
  const t = (title || '').trim().toLowerCase();
  const ms = startDate ? Math.floor(new Date(startDate).getTime() / 60000) : 0;
  return `${t}|${ms}`;
};

// Fontes que a agenda mistura — cada uma pode ser ligada/desligada (some o ruído).
export const DEFAULT_SOURCES = { os: true, crm: true, local: true, google: true };
export const SOURCE_META = [
  { key: 'os', label: 'O.S.', color: '#ef4444' },
  { key: 'crm', label: 'Comercial', color: '#8b5cf6' },
  { key: 'local', label: 'Reuniões', color: '#3b82f6' },
  { key: 'google', label: 'Google', color: '#94a3b8' },
];

export function useAgendaData() {
  const today = useMemo(() => new Date(), []);

  const { data: localEventsRaw = [] } = useAgendaEvents();
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: osOrders = [] } = useOSOrders();
  const { profile } = useProfile();
  useRealtimeAgendaEvents();

  // Google Calendar (opcional)
  const { data: gcalStatus } = useGCalStatus();
  const gcalConnected = !!gcalStatus?.id && !gcalStatus?.expired;
  // EGRESS: janela do Google/CRM era de 6 meses (-2/+4) por membro. -1/+2 cobre o
  // uso real da agenda e corta ~metade do payload (Google client + team + CRM).
  const gMin = useMemo(() => { const d = new Date(today); d.setMonth(d.getMonth() - 1); return d; }, [today]);
  const gMax = useMemo(() => { const d = new Date(today); d.setMonth(d.getMonth() + 2); return d; }, [today]);
  const { data: gcalEvents = [] } = useGCalEvents(gMin, gMax, gcalConnected);
  // Google da EQUIPE (cada membro buscado com o token DELE, via Edge Function).
  // Independe de EU estar conectado — outros membros podem estar.
  const { data: teamGcalRaw = [] } = useTeamGCalEvents(gMin, gMax, true);

  // Atividades comerciais (CRM)
  const crmStart = useMemo(() => gMin.toISOString(), [gMin]);
  const crmEnd = useMemo(() => gMax.toISOString(), [gMax]);
  const { data: crmActivitiesRaw = [] } = useQuery({
    queryKey: ['agendaCrmActivities', crmStart, crmEnd],
    queryFn: () => getCrmCalendarActivities({ start: crmStart, end: crmEnd }),
    staleTime: 60_000,
  });

  // Chaves das atividades comerciais — pra remover o espelho (source 'local') e o
  // eco do Google das outras fontes. A fonte 'crm' é a canônica (traz lead, dono,
  // concluído). Sem isso, cada atividade duplica no calendário e o espelho sem
  // dono ainda vaza pra qualquer pessoa no filtro da /agenda.
  const crmKeySet = useMemo(() => {
    const s = new Set();
    for (const a of crmActivitiesRaw || []) {
      if (a.startDate) s.add(dedupeKey(a.title, a.startDate));
    }
    return s;
  }, [crmActivitiesRaw]);

  // Membros + perfil logado — DEDUPADOS por nome. O cadastro às vezes repete a
  // mesma pessoa (ex.: "3 Lorena"), e isso quebra o filtro: você seleciona uma
  // e os eventos estão atribuídos à outra. Uma entrada por nome conserta.
  const allMembers = useMemo(() => {
    const base = (!profile.name || teamMembers.some(m => namesMatch(m.name, profile.name)))
      ? teamMembers
      : [{ id: 'profile_self', name: profile.name, role: profile.role || '', color: '#3b82f6', authUserId: profile.id || null }, ...teamMembers];
    const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const byName = new Map();
    for (const m of base) {
      const k = norm(m.name);
      if (!k) continue;
      const prev = byName.get(k);
      // prefere a entrada que tem authUserId (pra resolver eventos do comercial/Google)
      if (!prev || (!prev.authUserId && m.authUserId)) byName.set(k, m);
    }
    return [...byName.values()];
  }, [teamMembers, profile]);

  // Deriva do allMembers JÁ DEDUPADO (mesma regra que os eventos usam pra
  // resolver o dono). Antes vinha de teamMembers cru + namesMatch (1ª ocorrência)
  // — com nome duplicado ("3 Lorena"), o id do "eu" divergia do id que os
  // eventos comerciais recebiam e a própria agenda comercial sumia do filtro.
  const myMemberId = useMemo(() => {
    if (profile.id) {
      const byAuth = allMembers.find(m => m.authUserId === profile.id);
      if (byAuth) return byAuth.id;
    }
    if (profile.name) {
      const byName = allMembers.find(m => namesMatch(m.name, profile.name));
      if (byName) return byName.id;
    }
    return profile.name ? 'profile_self' : null;
  }, [allMembers, profile]);

  const memberByName = useCallback((name) => {
    if (!name) return null;
    const n = String(name).toLowerCase().trim();
    return allMembers.find(m => m.name && m.name.toLowerCase().trim() === n) || null;
  }, [allMembers]);
  const memberByAuth = useCallback((authId) => {
    if (!authId) return null;
    return allMembers.find(m => m.authUserId === authId) || null;
  }, [allMembers]);

  // ===== Eventos unificados (shape do CrmCalendar) =====

  // 1) Eventos locais (reunioes/tarefas/pessoais) — expande recorrencia na janela.
  const localEvents = useMemo(() => {
    // Mesma janela do Google/CRM (gMin/gMax = -1/+2) pra as 4 fontes aparecerem e
    // sumirem juntas — senão local/O.S. mostrariam meses onde Google/CRM somem.
    const expanded = expandRecurrences(localEventsRaw, gMin, gMax);
    return expanded
      // Remove o espelho de atividade comercial (mesmo título+minuto) — ele já
      // aparece como fonte 'crm'. Sem isso duplicaria e vazaria (dono nulo).
      .filter(e => !crmKeySet.has(dedupeKey(e.title, e.startDate)))
      .map(e => {
        const meta = typeMeta(e.type);
        return {
          id: e.id, _localId: e._parentId || e.id, _local: true,
          title: e.title, startDate: e.startDate, endDate: e.endDate || e.startDate,
          color: e.color || meta.color, source: 'local',
          typeKey: e.type === 'meeting' ? 'meeting' : 'task', typeLabel: meta.label,
          assignee: e.assignee || null,
          _raw: e,
        };
      });
  }, [localEventsRaw, gMin, gMax, crmKeySet]);

  // 2) Atividades comerciais do CRM
  const crmEvents = useMemo(() => {
    return (crmActivitiesRaw || []).map(a => {
      if (!a.startDate) return null;
      const m = memberByAuth(a.assignedTo) || memberByName(a.assignedToName) || memberByAuth(a.createdBy);
      return {
        id: `crm_${a.id}`,
        title: a.title || a.typeLabel || 'Atividade',
        startDate: a.startDate, endDate: a.endDate || a.startDate,
        color: a.color || '#3b82f6', source: 'crm',
        typeKey: a.type, typeLabel: a.typeLabel,
        completed: a.completed, completedAt: a.completedAt || null,
        leadName: a.leadName || null, stageName: a.stageName || null,
        assignee: m?.id || null,
        _crmActivityId: a.id, _dealId: a.dealId || null,
      };
    }).filter(Boolean);
  }, [crmActivitiesRaw, memberByAuth, memberByName]);

  // 3) Prazos de O.S. — cobre a cascata item → grupo → O.S. (prazo de entrega).
  // Lógica pura e testada em agendaDeadlines.js.
  const osTaskEvents = useMemo(() => buildOSDeadlineEvents(osOrders, memberByName), [osOrders, memberByName]);

  // 4a) Meu Google (client-side GIS) — atribuído a mim (some no chip Google).
  const myGoogleEvents = useMemo(() => {
    if (!gcalConnected) return [];
    return (gcalEvents || []).filter(g => g.startDate).map(g => ({
      id: `gcal_${g.id}`, title: g.title, startDate: g.startDate, endDate: g.endDate || g.startDate,
      color: g.color || '#94a3b8', source: 'google', isAllDay: g.isAllDay, typeLabel: 'Google',
      htmlLink: g.htmlLink, assignee: myMemberId || null,
    }));
  }, [gcalEvents, gcalConnected, myMemberId]);

  // 4b) Google da equipe (server) — atribuído a cada membro. Exclui o meu
  //     (já vem do 4a) pra não duplicar.
  const teamGoogleEvents = useMemo(() => {
    return (teamGcalRaw || []).map(g => {
      const m = memberByAuth(g.userId);
      if (!m || m.id === myMemberId || !g.startDate) return null;
      return {
        id: `tgcal_${g.userId}_${g.id}`, title: g.title,
        startDate: g.startDate, endDate: g.endDate || g.startDate,
        color: '#94a3b8', source: 'google', isAllDay: g.isAllDay, typeLabel: 'Google',
        htmlLink: g.htmlLink, assignee: m.id,
      };
    }).filter(Boolean);
  }, [teamGcalRaw, memberByAuth, myMemberId]);

  // Remove o eco das atividades comerciais que o CRM já empurrou pro Google
  // (mesmo título+minuto) — senão voltam como 3ª cópia da mesma atividade.
  const googleEvents = useMemo(
    () => [...myGoogleEvents, ...teamGoogleEvents].filter(g => !crmKeySet.has(dedupeKey(g.title, g.startDate))),
    [myGoogleEvents, teamGoogleEvents, crmKeySet]
  );

  return {
    today,
    allMembers,
    myMemberId,
    memberByName,
    memberByAuth,
    localEvents,
    crmEvents,
    osTaskEvents,
    googleEvents,
    gcalConnected,
  };
}

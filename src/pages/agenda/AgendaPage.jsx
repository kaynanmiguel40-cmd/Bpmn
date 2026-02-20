/**
 * AgendaPage - Calendario estilo Google Calendar
 * Acompanhamento da rotina da equipe, O.S., eventos
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAgendaEvents, useCreateAgendaEvent, useUpdateAgendaEvent, useDeleteAgendaEvent, useTeamMembers, useOSOrders, useContentPosts, useCreateContentPost, useUpdateContentPost, useDeleteContentPost } from '../../hooks/queries';
import { shortName } from '../../lib/teamService';
import { getProfile } from '../../lib/profileService';
import { expandRecurrences, toDateKey } from '../../lib/recurrenceUtils';
import { downloadICS } from '../../lib/icsExporter';
import { useRealtimeAgendaEvents, useRealtimeContentPosts } from '../../hooks/useRealtimeSubscription';
import { notifyEventCreated } from '../../lib/notificationTriggers';

// ==================== CONSTANTES ====================

const EVENT_TYPES = [
  { id: 'meeting', label: 'Reuniao', color: '#3b82f6' },
  { id: 'os', label: 'Ordem de Servico', color: '#f97316' },
  { id: 'task', label: 'Tarefa', color: '#22c55e' },
  { id: 'personal', label: 'Pessoal', color: '#64748b' },
];

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 07h - 22h
const BUSINESS_HOURS = { start: 8, end: 18 }; // Horario comercial: 08h - 18h

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
const DAYS_FULL_PT = ['domingo', 'segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado'];
const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

// ==================== HELPERS DE DATA ====================

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
}

function getMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = firstDay.getDay();
  const days = [];

  // Dias do mes anterior para preencher a primeira semana
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    days.push({ date: d, isCurrentMonth: false });
  }

  // Dias do mes atual
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true });
  }

  // Dias do proximo mes para completar a ultima semana
  const remaining = 42 - days.length; // 6 semanas * 7 dias
  for (let i = 1; i <= remaining; i++) {
    days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
  }

  return days;
}

function getWeekDays(date) {
  const start = new Date(date);
  start.setDate(start.getDate() - start.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    return d;
  });
}

function formatTime(date) {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function toLocalDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// ==================== OVERLAP LAYOUT (estilo Google Calendar) ====================

function computeOverlapLayout(events) {
  if (events.length === 0) return [];

  const parsed = events.map(e => ({
    ...e,
    _startMs: new Date(e.startDate).getTime(),
    _endMs: new Date(e.endDate).getTime(),
  }));

  // Ordena: inicio mais cedo primeiro; empate = maior duracao primeiro
  parsed.sort((a, b) => a._startMs - b._startMs || (b._endMs - b._startMs) - (a._endMs - a._startMs));

  // Agrupar eventos que se sobrepõem transitivamente
  const groups = [];
  let currentGroup = [parsed[0]];
  let groupEnd = parsed[0]._endMs;

  for (let i = 1; i < parsed.length; i++) {
    const ev = parsed[i];
    if (ev._startMs < groupEnd) {
      currentGroup.push(ev);
      groupEnd = Math.max(groupEnd, ev._endMs);
    } else {
      groups.push(currentGroup);
      currentGroup = [ev];
      groupEnd = ev._endMs;
    }
  }
  groups.push(currentGroup);

  // Atribuir colunas dentro de cada grupo
  const result = [];
  for (const group of groups) {
    const columns = []; // columns[i] = fim do ultimo evento na coluna i
    for (const ev of group) {
      let placed = false;
      for (let c = 0; c < columns.length; c++) {
        if (ev._startMs >= columns[c]) {
          ev._col = c;
          columns[c] = ev._endMs;
          placed = true;
          break;
        }
      }
      if (!placed) {
        ev._col = columns.length;
        columns.push(ev._endMs);
      }
    }
    const totalCols = columns.length;
    for (const ev of group) {
      ev._totalCols = totalCols;
      result.push(ev);
    }
  }

  return result;
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function AgendaPage() {
  const today = new Date();
  const routerNavigate = useNavigate();

  // React Query hooks para dados
  const { data: events = [], isLoading: loadingEvents } = useAgendaEvents();
  const { data: teamMembers = [], isLoading: loadingMembers } = useTeamMembers();
  const { data: osOrders = [], isLoading: loadingOS } = useOSOrders();
  const createEventMutation = useCreateAgendaEvent();
  const updateEventMutation = useUpdateAgendaEvent();
  const deleteEventMutation = useDeleteAgendaEvent();

  // Content posts (Calendario de Postagens)
  const { data: contentPosts = [] } = useContentPosts();
  const createPostMutation = useCreateContentPost();
  const updatePostMutation = useUpdateContentPost();
  const deletePostMutation = useDeleteContentPost();

  const loading = loadingEvents || loadingMembers || loadingOS;

  // Realtime
  useRealtimeAgendaEvents();
  useRealtimeContentPosts();

  const [currentDate, setCurrentDate] = useState(today);
  const [view, setView] = useState('day');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [quickCreate, setQuickCreate] = useState(null); // { date, startTime, endTime }
  const [recurrenceAction, setRecurrenceAction] = useState(null); // { event, action: 'edit'|'delete' }
  const [profile, setProfile] = useState({});
  const [activeFilters, setActiveFilters] = useState([]); // inicializa vazio, preenche ao carregar
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [dayViewMember, setDayViewMember] = useState(null);
  const [viewingEvent, setViewingEvent] = useState(null); // modal de detalhes do evento

  // Lista completa: membros cadastrados + perfil logado
  const allMembers = useMemo(() => {
    if (!profile.name) return teamMembers;
    const alreadyIn = teamMembers.some(m => m.name.toLowerCase().trim() === profile.name.toLowerCase().trim());
    if (alreadyIn) return teamMembers;
    return [{ id: 'profile_self', name: profile.name, role: profile.role || '', color: '#3b82f6' }, ...teamMembers];
  }, [teamMembers, profile]);

  // ID do membro do usuario logado (para DayView individual)
  const myMemberId = useMemo(() => {
    if (!profile.name) return null;
    const match = teamMembers.find(m => m.name.toLowerCase().trim() === profile.name.toLowerCase().trim());
    return match ? match.id : 'profile_self';
  }, [teamMembers, profile]);

  // Inicializar dayViewMember com o usuario logado
  useEffect(() => {
    if (myMemberId && !dayViewMember) setDayViewMember(myMemberId);
  }, [myMemberId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleFilter = (memberId) => {
    setActiveFilters(prev => {
      if (prev.includes(memberId)) {
        if (prev.length === 1) return allMembers.map(m => m.id); // se desmarcar o ultimo, reativa todos
        return prev.filter(id => id !== memberId);
      }
      return [...prev, memberId];
    });
  };

  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    startDate: toLocalDateString(today),
    startTime: '09:00',
    endDate: toLocalDateString(today),
    endTime: '10:00',
    assignee: '1',
    attendees: [],
    type: 'task',
    attended: false,
    wasLate: false,
    lateMinutes: 0,
    recurrenceType: null,
    recurrenceConfig: { interval: 1 },
    recurrenceEndType: 'never',
    recurrenceEndValue: '',
    notes: '',
    attachments: [],
  });

  // Carregar perfil (unico dado sem React Query hook)
  useEffect(() => {
    getProfile().then(prof => setProfile(prof));
  }, []);

  // Inicializar filtros quando teamMembers e profile estiverem prontos
  useEffect(() => {
    if (loadingMembers || !teamMembers.length) return;
    setActiveFilters(prev => {
      if (prev.length > 0) return prev; // ja inicializado
      const profName = profile?.name?.toLowerCase().trim();
      const profAlreadyIn = profName && teamMembers.some(m => m.name.toLowerCase().trim() === profName);
      return profAlreadyIn ? teamMembers.map(m => m.id) : ['profile_self', ...teamMembers.map(m => m.id)];
    });
  }, [teamMembers, profile, loadingMembers]);

  // ==================== HANDLERS ====================

  const openCreateModal = (date) => {
    const d = date || currentDate;
    const dateStr = toLocalDateString(d);
    const hour = d.getHours ? d.getHours() : 9;
    const startTime = `${String(hour).padStart(2, '0')}:00`;
    const endTime = `${String(Math.min(hour + 1, 23)).padStart(2, '0')}:00`;

    setEditingEvent(null);
    setForm({
      title: '',
      description: '',
      startDate: dateStr,
      startTime,
      endDate: dateStr,
      endTime,
      assignee: allMembers[0]?.id || '1',
      attendees: [],
      type: 'task',
      attended: false,
      wasLate: false,
      recurrenceType: null,
      recurrenceConfig: { interval: 1 },
      recurrenceEndType: 'never',
      recurrenceEndValue: '',
      notes: '',
      attachments: [],
    });
    setQuickCreate({ date: dateStr, startTime, endTime });
  };

  const openFullModal = () => {
    setQuickCreate(null);
    setShowEventModal(true);
  };

  const openEditModal = (event) => {
    // O.S. e eventos normais: abre modal de detalhes
    if (event._isOS) {
      setViewingEvent(event);
      return;
    }
    // Se e ocorrencia virtual de evento recorrente, perguntar o que fazer
    if (event._parentId) {
      setRecurrenceAction({ event, action: 'edit' });
      return;
    }
    doOpenEditModal(event);
  };

  const doOpenEditModal = (event) => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    setEditingEvent(event);
    setForm({
      title: event.title,
      description: event.description || '',
      startDate: toLocalDateString(start),
      startTime: formatTime(start),
      endDate: toLocalDateString(end),
      endTime: formatTime(end),
      assignee: event.assignee || '1',
      attendees: event.attendees || [],
      type: event.type || 'task',
      attended: event.attended || false,
      wasLate: event.wasLate || false,
      lateMinutes: event.lateMinutes || 0,
      recurrenceType: event.recurrenceType || null,
      recurrenceConfig: event.recurrenceConfig || { interval: 1 },
      recurrenceEndType: event.recurrenceEndType || 'never',
      recurrenceEndValue: event.recurrenceEndValue || '',
      notes: event.notes || '',
      attachments: event.attachments || [],
    });
    setShowEventModal(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;

    // Se editando apenas esta ocorrencia, salvar como excecao
    if (editingEvent?._editThisOnly) {
      await handleSaveThisOnly();
      return;
    }

    const startDate = new Date(`${form.startDate}T${form.startTime}:00`);
    const endDate = new Date(`${form.endDate}T${form.endTime}:00`);
    const eventType = EVENT_TYPES.find(t => t.id === form.type);

    const eventData = {
      title: form.title,
      description: form.description,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      assignee: form.assignee,
      attendees: form.attendees || [],
      type: form.type,
      color: eventType.color,
      attended: form.attended,
      wasLate: form.wasLate,
      lateMinutes: form.wasLate ? (parseInt(form.lateMinutes) || 0) : 0,
      recurrenceType: form.recurrenceType || null,
      recurrenceConfig: form.recurrenceConfig || { interval: 1 },
      recurrenceEndType: form.recurrenceEndType || 'never',
      recurrenceEndValue: form.recurrenceEndValue || null,
      notes: form.notes || '',
      attachments: form.attachments || [],
    };

    if (editingEvent) {
      // Se editando ocorrencia virtual (toda serie), usar ID do pai
      const realId = editingEvent._parentId || editingEvent.id;
      await updateEventMutation.mutateAsync({ id: realId, updates: eventData });
    } else {
      const created = await createEventMutation.mutateAsync(eventData);
      // Notificar participantes do novo evento
      if (eventData.attendees?.length > 0) {
        notifyEventCreated(created || eventData, eventData.attendees, teamMembers, profile?.id);
      }
    }
    setShowEventModal(false);
    setQuickCreate(null);
    setRecurrenceAction(null);
  };

  const handleDelete = async (id) => {
    // Se editando ocorrencia virtual, perguntar o que fazer
    if (editingEvent && editingEvent._parentId) {
      setRecurrenceAction({ event: editingEvent, action: 'delete' });
      setShowDeleteModal(null);
      setShowEventModal(false);
      return;
    }
    await deleteEventMutation.mutateAsync(id);
    setShowDeleteModal(null);
    setShowEventModal(false);
    setQuickCreate(null);
  };

  // Handlers para acoes em eventos recorrentes
  const handleRecurrenceChoice = async (choice) => {
    if (!recurrenceAction) return;
    const { event, action } = recurrenceAction;
    const parentId = event._parentId;
    const parentEvent = events.find(e => e.id === parentId);
    if (!parentEvent) { setRecurrenceAction(null); return; }

    if (choice === 'this') {
      // Adicionar excecao no evento pai
      const exceptions = [...(parentEvent.recurrenceExceptions || [])];
      if (action === 'delete') {
        exceptions.push({ date: event._occurrenceDate, type: 'deleted' });
        await updateEventMutation.mutateAsync({ id: parentId, updates: { recurrenceExceptions: exceptions } });
      } else {
        // Para edicao de "este evento", abrir modal com os dados da ocorrencia
        // A excecao sera salva quando o usuario salvar o modal
        setRecurrenceAction(null);
        doOpenEditModal({ ...event, _editThisOnly: true });
        return;
      }
    } else if (choice === 'all') {
      if (action === 'delete') {
        await deleteEventMutation.mutateAsync(parentId);
      } else {
        // Editar toda a serie: abrir modal com dados do pai
        setRecurrenceAction(null);
        doOpenEditModal(parentEvent);
        return;
      }
    } else if (choice === 'future') {
      if (action === 'delete') {
        // Terminar a serie antes desta ocorrencia
        const endDate = new Date(event._occurrenceDate);
        endDate.setDate(endDate.getDate() - 1);
        await updateEventMutation.mutateAsync({ id: parentId, updates: {
          recurrenceEndType: 'on_date',
          recurrenceEndValue: toDateKey(endDate),
        }});
      } else {
        // Terminar serie antes, criar nova serie a partir desta data
        const endDate = new Date(event._occurrenceDate);
        endDate.setDate(endDate.getDate() - 1);
        await updateEventMutation.mutateAsync({ id: parentId, updates: {
          recurrenceEndType: 'on_date',
          recurrenceEndValue: toDateKey(endDate),
        }});
        // Abrir modal para criar nova serie
        setRecurrenceAction(null);
        const start = new Date(event.startDate);
        const end = new Date(event.endDate);
        setEditingEvent(null);
        setForm({
          title: event.title,
          description: event.description || '',
          startDate: toLocalDateString(start),
          startTime: formatTime(start),
          endDate: toLocalDateString(end),
          endTime: formatTime(end),
          assignee: event.assignee || '1',
          attendees: event.attendees || [],
          type: event.type || 'task',
          attended: false,
          wasLate: false,
          lateMinutes: 0,
          recurrenceType: parentEvent.recurrenceType,
          recurrenceConfig: parentEvent.recurrenceConfig || { interval: 1 },
          recurrenceEndType: parentEvent.recurrenceEndType || 'never',
          recurrenceEndValue: parentEvent.recurrenceEndValue || '',
          notes: event.notes || '',
          attachments: event.attachments || [],
        });
        // React Query ja refez o fetch via invalidation no mutateAsync acima
        setShowEventModal(true);
        return;
      }
    }

    setRecurrenceAction(null);
    setShowEventModal(false);
    setQuickCreate(null);
  };

  // Salvar excecao "este evento" quando usuario confirma no modal
  const handleSaveThisOnly = async () => {
    if (!form.title.trim() || !editingEvent?._parentId) return;

    const parentId = editingEvent._parentId;
    const parentEvent = events.find(e => e.id === parentId);
    if (!parentEvent) return;

    const startDate = new Date(`${form.startDate}T${form.startTime}:00`);
    const endDate = new Date(`${form.endDate}T${form.endTime}:00`);
    const eventType = EVENT_TYPES.find(t => t.id === form.type);

    const exceptions = [...(parentEvent.recurrenceExceptions || [])];
    // Remover excecao anterior para esta data, se existir
    const idx = exceptions.findIndex(e => e.date === editingEvent._occurrenceDate);
    if (idx >= 0) exceptions.splice(idx, 1);

    exceptions.push({
      date: editingEvent._occurrenceDate,
      type: 'modified',
      overrides: {
        title: form.title,
        description: form.description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        assignee: form.assignee,
        type: form.type,
        color: eventType.color,
      },
    });

    await updateEventMutation.mutateAsync({ id: parentId, updates: { recurrenceExceptions: exceptions } });
    setShowEventModal(false);
    setRecurrenceAction(null);
  };

  // Navegacao
  const navigate = (direction) => {
    const d = new Date(currentDate);
    if (view === 'month') d.setMonth(d.getMonth() + direction);
    else if (view === 'week') d.setDate(d.getDate() + direction * 7);
    else d.setDate(d.getDate() + direction);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  // O.S. convertidas em eventos do calendario (TODAS as O.S. com assignee)
  const OS_STATUS_COLORS = { available: '#3b82f6', in_progress: '#f97316', done: '#22c55e', blocked: '#ef4444' };
  const SLA_HOURS = { urgent: 4, high: 24, medium: 72, low: 168 };
  const BIZ_START_H = 8;  // inicio expediente
  const BIZ_END_H = 18;   // fim expediente

  const osCalendarEvents = useMemo(() => {
    const result = [];

    osOrders
      .filter(os => {
        const hasAssignee = os.assignee || os.assignedTo;
        return hasAssignee && (os.actualStart || os.estimatedStart || os.slaDeadline || os.createdAt);
      })
      .forEach(os => {
        const responsibleName = os.assignee || os.assignedTo || '';
        const member = allMembers.find(m => m.name.toLowerCase().trim() === responsibleName.toLowerCase().trim());

        let start, end;
        if (os.actualStart) {
          start = new Date(os.actualStart);
          end = os.actualEnd ? new Date(os.actualEnd) : new Date(start.getTime() + 2 * 3600000);
        } else if (os.estimatedStart) {
          start = new Date(os.estimatedStart);
          end = os.estimatedEnd ? new Date(os.estimatedEnd) : new Date(start.getTime() + 1 * 3600000);
        } else if (os.slaDeadline) {
          end = new Date(os.slaDeadline);
          start = new Date(end.getTime() - 1 * 3600000);
        } else {
          const slaH = SLA_HOURS[os.priority] || 72;
          end = new Date(new Date(os.createdAt).getTime() + slaH * 3600000);
          start = new Date(end.getTime() - 1 * 3600000);
        }

        // Guard: garantir que end > start
        if (end <= start) {
          end = new Date(start.getTime() + 2 * 3600000);
        }

        const osNum = os.type === 'emergency' ? `EMG-${os.emergencyNumber}` : `#${os.number}`;
        const baseEvent = {
          title: `O.S. ${osNum} - ${os.title}`,
          description: os.client ? `Cliente: ${os.client}` : os.description || '',
          assignee: member?.id || null,
          type: 'os',
          color: OS_STATUS_COLORS[os.status] || '#f97316',
          _isOS: true,
          _osId: os.id,
          _osStatus: os.status,
          _osPriority: os.priority,
        };

        // OS concluida: mostra horario real (sem split)
        if (os.status === 'done') {
          result.push({ ...baseEvent, id: `os_cal_${os.id}`, startDate: start.toISOString(), endDate: end.toISOString() });
          return;
        }

        // Split: OS nao pode passar das 18h (continua no proximo dia as 08h)
        let segStart = new Date(start);
        let segIdx = 0;
        while (segStart < end) {
          const dayEnd = new Date(segStart);
          dayEnd.setHours(BIZ_END_H, 0, 0, 0);

          // Se segStart ja passou do fim do expediente, pula pro proximo dia
          if (segStart >= dayEnd) {
            segStart.setDate(segStart.getDate() + 1);
            segStart.setHours(BIZ_START_H, 0, 0, 0);
            continue;
          }

          const segEnd = end <= dayEnd ? end : dayEnd;
          result.push({
            ...baseEvent,
            id: `os_cal_${os.id}${segIdx > 0 ? `_seg${segIdx}` : ''}`,
            startDate: segStart.toISOString(),
            endDate: segEnd.toISOString(),
          });
          segIdx++;

          if (end > dayEnd) {
            segStart = new Date(segStart);
            segStart.setDate(segStart.getDate() + 1);
            segStart.setHours(BIZ_START_H, 0, 0, 0);
          } else {
            break;
          }

          // Safety: max 30 segmentos
          if (segIdx >= 30) break;
        }
      });

    return result;
  }, [osOrders, allMembers]);

  // Eventos de um dia (com expansao de recorrencia + O.S. + filtro de pessoa)
  const getEventsForDay = useCallback((date) => {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const expanded = expandRecurrences(events, dayStart, dayEnd);

    // Incluir O.S. que caem neste dia
    const osForDay = osCalendarEvents.filter(e => {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      return end >= dayStart && start < dayEnd;
    });

    return [...expanded, ...osForDay].filter(e => activeFilters.includes(e.assignee));
  }, [events, osCalendarEvents, activeFilters]);

  // Todos os eventos do dia sem filtro de pessoa (usado pelo DayView individual)
  const getAllEventsForDay = useCallback((date) => {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    const expanded = expandRecurrences(events, dayStart, dayEnd);
    const osForDay = osCalendarEvents.filter(e => {
      const start = new Date(e.startDate);
      const end = new Date(e.endDate);
      return end >= dayStart && start < dayEnd;
    });
    return [...expanded, ...osForDay];
  }, [events, osCalendarEvents]);

  // Horario comercial calculado a partir dos membros filtrados
  const businessHours = useMemo(() => {
    const filtered = allMembers.filter(m => activeFilters.includes(m.id));
    if (filtered.length === 0) return BUSINESS_HOURS; // fallback global
    let earliest = 23;
    let latest = 0;
    for (const m of filtered) {
      const start = parseInt((m.workStart || '08:00').split(':')[0]);
      const end = parseInt((m.workEnd || '18:00').split(':')[0]);
      if (start < earliest) earliest = start;
      if (end > latest) latest = end;
    }
    return { start: earliest, end: latest };
  }, [allMembers, activeFilters]);

  // Titulo do header
  const headerTitle = useMemo(() => {
    if (view === 'month') return `${MONTHS_PT[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (view === 'week') {
      const week = getWeekDays(currentDate);
      const start = week[0];
      const end = week[6];
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} - ${end.getDate()} ${MONTHS_PT[start.getMonth()]} ${start.getFullYear()}`;
      }
      return `${start.getDate()} ${MONTHS_PT[start.getMonth()].slice(0, 3)} - ${end.getDate()} ${MONTHS_PT[end.getMonth()].slice(0, 3)} ${end.getFullYear()}`;
    }
    return `${currentDate.getDate()} de ${MONTHS_PT[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;
  }, [currentDate, view]);

  // ==================== RENDER ====================

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {view !== 'posts' && (
            <>
              <button
                onClick={() => openCreateModal()}
                className="flex items-center gap-2 px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors text-sm font-medium shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Novo Evento
              </button>

              <div className="flex items-center gap-1">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={goToday} className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  Hoje
                </button>
                <button onClick={() => navigate(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{headerTitle}</h2>
            </>
          )}
          {view === 'posts' && (
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Calendario de Postagens</h2>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Dropdown Filtro de Pessoas (escondido no day view e posts view) */}
          {view !== 'day' && view !== 'posts' && <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(prev => !prev)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Equipe</span>
              {activeFilters.length < allMembers.length && (
                <span className="bg-blue-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilters.length}
                </span>
              )}
              <svg className={`w-3.5 h-3.5 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showFilterDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowFilterDropdown(false)} />
                <div className="absolute right-0 top-full mt-1 w-56 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-40 py-1 overflow-hidden">
                  {/* Selecionar/Desmarcar todos */}
                  <button
                    onClick={() => {
                      if (activeFilters.length === allMembers.length) {
                        setActiveFilters([]);
                      } else {
                        setActiveFilters(allMembers.map(m => m.id));
                      }
                    }}
                    className="w-full px-3 py-2 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors uppercase tracking-wide flex items-center justify-between"
                  >
                    <span>{activeFilters.length === allMembers.length ? 'Desmarcar todos' : 'Selecionar todos'}</span>
                    <span className="text-[10px] normal-case font-normal text-slate-400 dark:text-slate-500">{activeFilters.length}/{allMembers.length}</span>
                  </button>
                  <div className="border-t border-slate-100 dark:border-slate-700" />

                  {/* Lista de membros */}
                  {allMembers.map(m => {
                    const isActive = activeFilters.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        onClick={() => toggleFilter(m.id)}
                        className="w-full px-3 py-2 flex items-center gap-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        {/* Checkbox */}
                        <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          isActive ? 'border-transparent' : 'border-slate-300 dark:border-slate-600'
                        }`} style={isActive ? { backgroundColor: m.color } : {}}>
                          {isActive && (
                            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        {/* Avatar */}
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0" style={{ backgroundColor: m.color }}>
                          {(m.name || '?').charAt(0).toUpperCase()}
                        </div>
                        {/* Nome */}
                        <span className={`text-sm truncate ${isActive ? 'text-slate-800 dark:text-slate-100 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
                          {shortName(m.name)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>}

          {view !== 'posts' && (
            <button
              onClick={() => {
                try {
                  downloadICS(events, `agenda-${toLocalDateString(new Date())}.ics`);
                } catch (err) {
                  console.error('Erro ao exportar .ics:', err);
                }
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              title="Exportar calendario .ics"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              .ics
            </button>
          )}

          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
            {['month', 'week', 'day', 'posts'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  view === v ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {{ month: 'Mes', week: 'Semana', day: 'Dia', posts: 'Postagens' }[v]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Views */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {view === 'month' && <MonthView currentDate={currentDate} today={today} getEventsForDay={getEventsForDay} onDayClick={(d) => { setCurrentDate(d); setView('day'); }} onEventClick={openEditModal} allMembers={allMembers} />}
        {view === 'week' && <WeekView currentDate={currentDate} today={today} getEventsForDay={getEventsForDay} onEventClick={openEditModal} onSlotClick={(d) => openCreateModal(d)} allMembers={allMembers} businessHours={businessHours} />}
        {view === 'day' && <DayView currentDate={currentDate} today={today} getAllEventsForDay={getAllEventsForDay} onEventClick={openEditModal} onSlotClick={() => openCreateModal(currentDate)} allMembers={allMembers} businessHours={businessHours} dayViewMember={dayViewMember} setDayViewMember={setDayViewMember} />}
        {view === 'posts' && <PostingsView contentPosts={contentPosts} createPost={createPostMutation} updatePost={updatePostMutation} deletePost={deletePostMutation} allMembers={allMembers} />}
      </div>

      {/* Quick Create Popover (estilo Google Calendar) */}
      {quickCreate && (
        <QuickCreatePopover
          form={form}
          setForm={setForm}
          onSave={handleSave}
          onClose={() => setQuickCreate(null)}
          onMoreOptions={openFullModal}
          allMembers={allMembers}
        />
      )}

      {/* Event Modal (edicao / mais opcoes) */}
      {showEventModal && (
        <EventModal
          form={form}
          setForm={setForm}
          editing={!!editingEvent}
          onSave={handleSave}
          onClose={() => setShowEventModal(false)}
          onDelete={() => setShowDeleteModal(editingEvent?.id)}
          allMembers={allMembers}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 text-center mb-2">Excluir Evento?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center">Esta acao nao pode ser desfeita.</p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex gap-3 justify-center">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleDelete(showDeleteModal)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Evento */}
      {viewingEvent && (
        <EventDetailModal
          event={viewingEvent}
          allMembers={allMembers}
          onClose={() => setViewingEvent(null)}
          onNavigateOS={viewingEvent._isOS ? () => { setViewingEvent(null); routerNavigate('/financial'); } : null}
        />
      )}

      {/* Recurrence Action Modal (editar/excluir ocorrencia de serie) */}
      {recurrenceAction && (
        <RecurrenceEditModal
          action={recurrenceAction.action}
          onChoice={handleRecurrenceChoice}
          onClose={() => setRecurrenceAction(null)}
        />
      )}
    </div>
  );
}

// ==================== VIEW MENSAL ====================

function MonthView({ currentDate, today, getEventsForDay, onDayClick, onEventClick, allMembers }) {
  const days = useMemo(() => getMonthDays(currentDate.getFullYear(), currentDate.getMonth()), [currentDate]);

  return (
    <div className="h-full flex flex-col">
      {/* Header dias da semana */}
      <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
        {DAYS_PT.map(day => (
          <div key={day} className="px-2 py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7">
        {days.map(({ date, isCurrentMonth }, i) => {
          const dayEvents = getEventsForDay(date);
          const isToday = isSameDay(date, today);

          return (
            <div
              key={i}
              onClick={() => onDayClick(date)}
              className={`border-b border-r border-slate-100 dark:border-slate-700 p-1 min-h-[80px] cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                !isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''
              }`}
            >
              <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                isToday ? 'bg-fyness-primary text-white' : isCurrentMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
              }`}>
                {date.getDate()}
              </div>

              <div className="space-y-0.5">
                {dayEvents.map(event => {
                  const member = allMembers.find(m => m.id === event.assignee);
                  const bgColor = member?.color || event.color || '#3b82f6';
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate text-white font-medium cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-0.5 ${event._isOS ? 'ring-1 ring-white/30' : ''}`}
                      style={{ backgroundColor: bgColor }}
                      title={`${event.title} - ${member?.name || ''}`}
                    >
                      {event._isOS && <svg className="w-2.5 h-2.5 shrink-0 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                      {event._parentId && !event._isOS && <svg className="w-2.5 h-2.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                      <span className={`truncate ${event._isOS && event._osStatus === 'done' ? 'line-through opacity-70' : ''}`}>{formatTime(new Date(event.startDate))} {event.title}</span>
                      {event._isOS && event._osStatus === 'done' && <span className="ml-auto text-[8px] bg-white/30 px-1 rounded shrink-0">&#10003;</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        </div>
      </div>
    </div>
  );
}

// ==================== VIEW SEMANAL ====================

function WeekView({ currentDate, today, getEventsForDay, onEventClick, onSlotClick, allMembers, businessHours }) {
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);
  const SLOT_HEIGHT = 56; // h-14 = 56px
  const FIRST_HOUR = HOURS[0]; // 7

  // Pre-computar layout de overlap para cada dia da semana
  const weekLayouts = useMemo(() => {
    return weekDays.map(day => {
      const dayEvents = getEventsForDay(day);
      return computeOverlapLayout(dayEvents);
    });
  }, [weekDays, getEventsForDay]);

  return (
    <div className="h-full flex flex-col">
      {/* Header com dias */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-200 dark:border-slate-700">
        <div className="border-r border-slate-200 dark:border-slate-700" />
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today);
          return (
            <div key={i} className="px-2 py-2 text-center border-r border-slate-100 dark:border-slate-700">
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">{DAYS_PT[day.getDay()]}</div>
              <div className={`text-lg font-semibold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full mx-auto ${
                isToday ? 'bg-fyness-primary text-white' : 'text-slate-800 dark:text-slate-100'
              }`}>
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Body: colunas de hora + colunas de dia com overlay de eventos */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex">
          {/* Coluna de labels de hora */}
          <div className="w-[60px] shrink-0">
            {HOURS.map(hour => {
              const isOffHours = hour < businessHours.start || hour >= businessHours.end;
              return (
                <div key={hour} className={`h-14 border-r border-b border-slate-100 dark:border-slate-700 flex items-start justify-end pr-2 pt-0.5 ${isOffHours ? 'bg-slate-100/60 dark:bg-slate-700/50' : ''}`}>
                  <span className={`text-[10px] font-medium ${isOffHours ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`}>{String(hour).padStart(2, '0')}:00</span>
                </div>
              );
            })}
          </div>

          {/* Colunas de dia (cada uma com grid de horas + overlay de eventos) */}
          {weekDays.map((day, dayIdx) => {
            const layoutEvents = weekLayouts[dayIdx];

            return (
              <div key={dayIdx} className="flex-1 relative min-w-0">
                {/* Grid de horas (visual + click) */}
                {HOURS.map(hour => {
                  const isOffHours = hour < businessHours.start || hour >= businessHours.end;
                  return (
                    <div
                      key={hour}
                      onClick={() => {
                        const d = new Date(day);
                        d.setHours(hour, 0, 0, 0);
                        onSlotClick(d);
                      }}
                      className={`h-14 border-r border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors ${isOffHours ? 'bg-slate-100/60 dark:bg-slate-700/50' : ''}`}
                    />
                  );
                })}

                {/* Overlay de eventos (absoluto sobre a coluna do dia) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {layoutEvents.map(event => {
                    const start = new Date(event.startDate);
                    const end = new Date(event.endDate);
                    const startHour = start.getHours() + start.getMinutes() / 60;
                    const endHour = end.getHours() + end.getMinutes() / 60;
                    const clampedStart = Math.max(startHour, FIRST_HOUR);
                    const clampedEnd = Math.min(endHour, FIRST_HOUR + HOURS.length);
                    if (clampedEnd <= clampedStart) return null;

                    const top = (clampedStart - FIRST_HOUR) * SLOT_HEIGHT;
                    const height = Math.max((clampedEnd - clampedStart) * SLOT_HEIGHT, 20);

                    // Colunas de overlap
                    const colWidth = 100 / event._totalCols;
                    const left = event._col * colWidth;

                    // Cor do membro (na semana, distinguir por pessoa)
                    const member = allMembers.find(m => m.id === event.assignee);
                    const bgColor = member?.color || event.color || '#3b82f6';

                    return (
                      <div
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                        className={`absolute rounded px-1 py-0.5 text-white text-[10px] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity z-10 shadow-sm pointer-events-auto ${event._isOS ? 'ring-1 ring-white/30' : ''}`}
                        style={{
                          backgroundColor: bgColor,
                          top: `${top}px`,
                          height: `${height}px`,
                          left: `calc(${left}% + 1px)`,
                          width: `calc(${colWidth}% - 2px)`,
                        }}
                        title={`${event.title} - ${member?.name || ''} ${formatTime(start)}-${formatTime(end)}`}
                      >
                        <div className="font-semibold truncate flex items-center gap-0.5">
                          {event._isOS && <svg className="w-2.5 h-2.5 shrink-0 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                          {event._parentId && !event._isOS && <svg className="w-2.5 h-2.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                          <span className={`truncate ${event._isOS && event._osStatus === 'done' ? 'line-through opacity-70' : ''}`}>{event.title}</span>
                          {event._isOS && event._osStatus === 'done' && <span className="text-[8px] bg-white/30 px-1 rounded shrink-0 ml-auto">&#10003;</span>}
                        </div>
                        <div className="opacity-80 truncate">{formatTime(start)} - {formatTime(end)}</div>
                        {member && <div className="opacity-70 truncate">{shortName(member.name)}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== VIEW DIARIA ====================

function DayView({ currentDate, today, getAllEventsForDay, onEventClick, onSlotClick, allMembers, businessHours, dayViewMember, setDayViewMember }) {
  const allDayEvents = useMemo(() => getAllEventsForDay(currentDate), [getAllEventsForDay, currentDate]);

  // Filtra apenas eventos do membro selecionado
  const dayEvents = useMemo(() => {
    if (!dayViewMember) return allDayEvents;
    return allDayEvents.filter(e => e.assignee === dayViewMember);
  }, [allDayEvents, dayViewMember]);

  // Layout de overlap (colunas lado a lado)
  const layoutEvents = useMemo(() => computeOverlapLayout(dayEvents), [dayEvents]);

  const isToday = isSameDay(currentDate, today);
  const SLOT_HEIGHT = 64; // h-16 = 64px
  const FIRST_HOUR = HOURS[0]; // 7

  const selectedMember = allMembers.find(m => m.id === dayViewMember);

  return (
    <div className="h-full flex flex-col">
      {/* Header: info do dia + seletor de membro */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${
            isToday ? 'bg-fyness-primary text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
          }`}>
            <span className="text-[10px] uppercase leading-none">{DAYS_PT[currentDate.getDay()]}</span>
            <span className="text-lg font-bold leading-none">{currentDate.getDate()}</span>
          </div>
          <div>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Seletor de membro */}
        <div className="flex items-center gap-2">
          {selectedMember && (
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ backgroundColor: selectedMember.color || '#3b82f6' }}>
              {(selectedMember.name || '?').charAt(0).toUpperCase()}
            </div>
          )}
          <select
            value={dayViewMember || ''}
            onChange={(e) => setDayViewMember(e.target.value)}
            className="px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
          >
            {allMembers.map(m => (
              <option key={m.id} value={m.id}>{shortName(m.name)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[60px_1fr] relative">
          {/* Grid de horas (apenas visual + click) */}
          {HOURS.map(hour => {
            const isOffHours = hour < businessHours.start || hour >= businessHours.end;
            return (
              <div key={hour} className="contents">
                <div className={`h-16 border-r border-b border-slate-100 dark:border-slate-700 flex items-start justify-end pr-2 pt-1 ${isOffHours ? 'bg-slate-100/60 dark:bg-slate-700/50' : ''}`}>
                  <span className={`text-xs font-medium ${isOffHours ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`}>{String(hour).padStart(2, '0')}:00</span>
                </div>
                <div
                  onClick={onSlotClick}
                  className={`h-16 border-b border-slate-100 dark:border-slate-700 cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors ${isOffHours ? 'bg-slate-100/60 dark:bg-slate-700/50' : ''}`}
                />
              </div>
            );
          })}

          {/* Camada de eventos (absoluta sobre a grid inteira) */}
          <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: '60px', right: '0px' }}>
            {layoutEvents.map(event => {
              const start = new Date(event.startDate);
              const end = new Date(event.endDate);
              const startHour = start.getHours() + start.getMinutes() / 60;
              const endHour = end.getHours() + end.getMinutes() / 60;
              // Clamp ao range visivel
              const clampedStart = Math.max(startHour, FIRST_HOUR);
              const clampedEnd = Math.min(endHour, FIRST_HOUR + HOURS.length);
              if (clampedEnd <= clampedStart) return null;

              const top = (clampedStart - FIRST_HOUR) * SLOT_HEIGHT;
              const height = Math.max((clampedEnd - clampedStart) * SLOT_HEIGHT, 28);

              // Colunas de overlap
              const colWidth = 100 / event._totalCols;
              const left = event._col * colWidth;

              const eventType = EVENT_TYPES.find(t => t.id === event.type);

              return (
                <div
                  key={event.id}
                  onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                  className={`absolute rounded-lg px-3 py-1.5 text-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity z-10 shadow-sm pointer-events-auto ${event._isOS ? 'ring-2 ring-orange-300' : ''}`}
                  style={{
                    backgroundColor: event.color || '#3b82f6',
                    top: `${top}px`,
                    height: `${height}px`,
                    left: `calc(${left}% + 2px)`,
                    width: `calc(${colWidth}% - 6px)`,
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`font-semibold text-sm truncate flex items-center gap-1 ${event._isOS && event._osStatus === 'done' ? 'line-through opacity-70' : ''}`}>
                      {event._isOS && <svg className="w-3 h-3 shrink-0 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                      {event._parentId && !event._isOS && <svg className="w-3 h-3 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                      {event.title}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {event._isOS && event._osStatus === 'available' && (
                        <span className="text-[9px] bg-blue-400/30 text-blue-100 px-1.5 py-0.5 rounded-full whitespace-nowrap font-semibold">A fazer</span>
                      )}
                      {event._isOS && event._osStatus === 'in_progress' && (
                        <span className="text-[9px] bg-yellow-400/30 text-yellow-100 px-1 py-0.5 rounded-full whitespace-nowrap font-semibold">Em andamento</span>
                      )}
                      {event._isOS && event._osStatus === 'done' && (
                        <span className="text-[9px] bg-green-400/30 text-green-100 px-1.5 py-0.5 rounded-full whitespace-nowrap font-semibold">&#10003; Concluida</span>
                      )}
                      {event._isOS && event._osStatus === 'blocked' && (
                        <span className="text-[9px] bg-red-400/30 text-red-100 px-1.5 py-0.5 rounded-full whitespace-nowrap font-semibold">Bloqueada</span>
                      )}
                      {eventType && (
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                          {eventType.label}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs opacity-80 mt-0.5">
                    {formatTime(start)} - {formatTime(end)}
                  </div>
                  {event.description && (
                    <div className="text-xs opacity-70 mt-0.5 truncate">{event.description}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL DETALHES DO EVENTO ====================

function EventDetailModal({ event, allMembers, onClose, onNavigateOS }) {
  const start = new Date(event.startDate);
  const end = new Date(event.endDate);
  const member = allMembers.find(m => m.id === event.assignee);
  const eventType = EVENT_TYPES.find(t => t.id === event.type);

  const STATUS_LABELS = { available: 'A fazer', in_progress: 'Em andamento', done: 'Concluida', blocked: 'Bloqueada' };
  const PRIORITY_LABELS = { urgent: 'Urgente', high: 'Alta', medium: 'Media', low: 'Baixa' };

  return (
    <>
      {/* Backdrop transparente pra fechar ao clicar fora */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Painel lateral direito */}
      <div className="fixed top-0 right-0 h-full w-[340px] max-w-[85vw] bg-white dark:bg-slate-800 shadow-2xl z-50 flex flex-col animate-slide-in-right border-l border-slate-200 dark:border-slate-700">
        {/* Barra colorida no topo */}
        <div className="h-1.5 shrink-0" style={{ backgroundColor: member?.color || event.color || '#3b82f6' }} />

        {/* Header */}
        <div className="px-5 pt-4 pb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {event._isOS && (
              <svg className="w-5 h-5 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">{event.title}</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors shrink-0">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conteudo scrollavel */}
        <div className="flex-1 overflow-y-auto px-5 pb-4">
          <div className="space-y-3 text-sm">
            {/* Data e hora */}
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {start.toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })}
                {' — '}
                {formatTime(start)} ate {formatTime(end)}
              </span>
            </div>

            {/* Responsavel */}
            {member && (
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <div className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: member.color || '#3b82f6' }} />
                <span>{member.name}</span>
              </div>
            )}

            {/* Tipo */}
            {eventType && (
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>{eventType.label}</span>
              </div>
            )}

            {/* Status e Prioridade (OS) */}
            {event._isOS && (
              <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: event.color }}>
                    {STATUS_LABELS[event._osStatus] || event._osStatus}
                  </span>
                  {event._osPriority && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                      {PRIORITY_LABELS[event._osPriority] || event._osPriority}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Descricao */}
            {event.description && (
              <div className="pt-3 mt-1 border-t border-slate-100 dark:border-slate-700">
                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{event.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {onNavigateOS && (
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-700 shrink-0">
            <button
              onClick={onNavigateOS}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors font-medium"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Ver O.S.
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ==================== QUICK CREATE (estilo Google Calendar) ====================

function QuickCreatePopover({ form, setForm, onSave, onClose, onMoreOptions, allMembers }) {
  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const selectedType = EVENT_TYPES.find(t => t.id === form.type) || EVENT_TYPES[0];

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra colorida no topo */}
        <div className="h-2 rounded-t-2xl" style={{ backgroundColor: selectedType.color }} />

        <div className="p-5 space-y-4">
          {/* Titulo - input sem borda, estilo Google */}
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="w-full text-xl font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-500 focus:outline-none border-b-2 border-transparent focus:border-fyness-primary pb-2 transition-colors dark:bg-transparent"
            placeholder="Adicionar titulo"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && form.title.trim()) onSave();
              if (e.key === 'Escape') onClose();
            }}
          />

          {/* Data e Hora */}
          <div className="flex items-center gap-2 text-sm">
            <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <input
              type="date"
              value={form.startDate}
              onChange={(e) => { updateField('startDate', e.target.value); updateField('endDate', e.target.value); }}
              className="px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
            />
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => updateField('startTime', e.target.value)}
              className="px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
            />
            <span className="text-slate-400 dark:text-slate-500">-</span>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => updateField('endTime', e.target.value)}
              className="px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
            />
          </div>

          {/* Recorrencia - contextual como Google Calendar */}
          {(() => {
            const d = form.startDate ? new Date(form.startDate + 'T00:00:00') : new Date();
            const dayOfWeek = d.getDay();
            const dayOfMonth = d.getDate();
            const dayName = DAYS_FULL_PT[dayOfWeek];

            return (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <select
                    value={form.recurrenceType || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'custom') {
                        // Abrir modal completo para personalizado
                        updateField('recurrenceType', 'weekly');
                        updateField('recurrenceConfig', { interval: 1, daysOfWeek: [dayOfWeek] });
                        onMoreOptions();
                        return;
                      }
                      updateField('recurrenceType', val || null);
                      if (val === 'weekly') {
                        updateField('recurrenceConfig', { interval: 1, daysOfWeek: [dayOfWeek] });
                      } else if (val === 'monthly') {
                        updateField('recurrenceConfig', { interval: 1, dayOfMonth });
                      } else {
                        updateField('recurrenceConfig', { interval: 1 });
                      }
                    }}
                    className="flex-1 px-2 py-1.5 border border-slate-200 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
                  >
                    <option value="">Nao repete</option>
                    <option value="daily">Diariamente</option>
                    <option value="weekly">Semanalmente na {dayName}</option>
                    <option value="monthly">Mensalmente no dia {dayOfMonth}</option>
                    <option value="yearly">Anualmente</option>
                    <option value="custom">Personalizado...</option>
                  </select>
                </div>

                {/* Seletor de dias da semana (se semanal) */}
                {form.recurrenceType === 'weekly' && (
                  <div className="flex items-center gap-1 pl-7">
                    {DAYS_PT.map((day, i) => {
                      const selected = (form.recurrenceConfig?.daysOfWeek || []).includes(i);
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            const days = form.recurrenceConfig?.daysOfWeek || [];
                            const next = selected ? days.filter(d => d !== i) : [...days, i];
                            if (next.length === 0) return; // precisa pelo menos 1 dia
                            updateField('recurrenceConfig', { ...form.recurrenceConfig, daysOfWeek: next.sort() });
                          }}
                          className={`w-8 h-8 rounded-full text-[10px] font-bold transition-all ${
                            selected ? 'bg-fyness-primary text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Tipo - pills coloridos */}
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <div className="flex gap-1.5">
              {EVENT_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => updateField('type', t.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    form.type === t.id
                      ? 'text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  style={form.type === t.id ? { backgroundColor: t.color } : {}}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Responsavel */}
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400 dark:text-slate-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={form.type === 'meeting' ? 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' : 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'} />
            </svg>
            <div className="flex gap-1.5 flex-wrap">
              {form.type === 'meeting' ? (
                // Multi-select para reunioes
                allMembers.map(m => {
                  const isSelected = (form.attendees || []).includes(m.id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        const current = form.attendees || [];
                        const next = isSelected ? current.filter(id => id !== m.id) : [...current, m.id];
                        updateField('attendees', next);
                        if (next.length > 0 && !next.includes(form.assignee)) updateField('assignee', next[0]);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                        isSelected
                          ? 'text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                      style={isSelected ? { backgroundColor: m.color } : {}}
                    >
                      {isSelected && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      {shortName(m.name)}
                    </button>
                  );
                })
              ) : (
                // Single select para outros tipos
                allMembers.map(m => (
                  <button
                    key={m.id}
                    onClick={() => updateField('assignee', m.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      form.assignee === m.id
                        ? 'text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                    style={form.assignee === m.id ? { backgroundColor: m.color } : {}}
                  >
                    {shortName(m.name)}
                  </button>
                ))
              )}
            </div>
          </div>
          {form.type === 'meeting' && (form.attendees || []).length > 0 && (
            <p className="text-[10px] text-slate-400 dark:text-slate-500 ml-7">{(form.attendees || []).length} participante{(form.attendees || []).length > 1 ? 's' : ''}</p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onMoreOptions}
            className="text-sm text-fyness-primary hover:text-fyness-secondary font-medium transition-colors"
          >
            Mais opcoes
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              disabled={!form.title.trim()}
              className="px-5 py-2 bg-fyness-primary text-white text-sm rounded-lg hover:bg-fyness-secondary transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== MODAL COMPLETO (edicao / mais opcoes) ====================

function EventModal({ form, setForm, editing, onSave, onClose, onDelete, allMembers }) {
  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));
  const isPastEvent = new Date(`${form.endDate}T${form.endTime}:00`) < new Date();
  const isMeeting = form.type === 'meeting';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {editing ? 'Editar Evento' : 'Novo Evento'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Titulo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Titulo</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              placeholder="Ex: Reuniao de equipe"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onClose(); }}
            />
          </div>

          {/* Data e Hora - Inicio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Data Inicio</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Hora Inicio</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => updateField('startTime', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Data e Hora - Fim */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Data Fim</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => updateField('endDate', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Hora Fim</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => updateField('endTime', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Responsavel/Participantes e Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                {form.type === 'meeting' ? 'Participantes' : 'Responsavel'}
              </label>
              {form.type === 'meeting' ? (
                <div className="flex gap-1.5 flex-wrap p-2 border border-slate-300 dark:border-slate-600 rounded-lg min-h-[42px] dark:bg-slate-800">
                  {allMembers.map(m => {
                    const isSelected = (form.attendees || []).includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          const current = form.attendees || [];
                          const next = isSelected ? current.filter(id => id !== m.id) : [...current, m.id];
                          updateField('attendees', next);
                          if (next.length > 0 && !next.includes(form.assignee)) updateField('assignee', next[0]);
                        }}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium transition-all ${
                          isSelected ? 'text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                        style={isSelected ? { backgroundColor: m.color } : {}}
                      >
                        {isSelected && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                        {shortName(m.name)}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <select
                  value={form.assignee}
                  onChange={(e) => updateField('assignee', e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
                >
                  {allMembers.map(m => (
                    <option key={m.id} value={m.id}>{shortName(m.name)}</option>
                  ))}
                </select>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              >
                {EVENT_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Recorrencia */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Recorrencia</span>
            </div>

            {(() => {
              const d = form.startDate ? new Date(form.startDate + 'T00:00:00') : new Date();
              const dayOfWeek = d.getDay();
              const dayOfMonth = d.getDate();
              const dayName = DAYS_FULL_PT[dayOfWeek];

              return (
                <>
                  <select
                    value={form.recurrenceType || ''}
                    onChange={(e) => {
                      const val = e.target.value || null;
                      updateField('recurrenceType', val);
                      if (!val) {
                        updateField('recurrenceConfig', { interval: 1 });
                        updateField('recurrenceEndType', 'never');
                        updateField('recurrenceEndValue', '');
                      } else if (val === 'weekly' || val === 'custom') {
                        updateField('recurrenceType', 'weekly');
                        updateField('recurrenceConfig', { ...form.recurrenceConfig, interval: form.recurrenceConfig?.interval || 1, daysOfWeek: form.recurrenceConfig?.daysOfWeek?.length ? form.recurrenceConfig.daysOfWeek : [dayOfWeek] });
                      } else if (val === 'monthly') {
                        updateField('recurrenceConfig', { interval: 1, dayOfMonth });
                      } else {
                        updateField('recurrenceConfig', { interval: form.recurrenceConfig?.interval || 1 });
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
                  >
                    <option value="">Nao repete</option>
                    <option value="daily">Diariamente</option>
                    <option value="weekly">Semanalmente na {dayName}</option>
                    <option value="monthly">Mensalmente no dia {dayOfMonth}</option>
                    <option value="yearly">Anualmente</option>
                  </select>

                  {/* Intervalo */}
                  {form.recurrenceType && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600 dark:text-slate-300">A cada</span>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={form.recurrenceConfig?.interval || 1}
                        onChange={(e) => updateField('recurrenceConfig', { ...form.recurrenceConfig, interval: parseInt(e.target.value) || 1 })}
                        className="w-16 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm text-center dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
                      />
                      <span className="text-xs text-slate-600 dark:text-slate-300">
                        {form.recurrenceType === 'daily' && 'dia(s)'}
                        {form.recurrenceType === 'weekly' && 'semana(s)'}
                        {form.recurrenceType === 'monthly' && 'mes(es)'}
                        {form.recurrenceType === 'yearly' && 'ano(s)'}
                      </span>
                    </div>
                  )}

                  {/* Dias da semana (para semanal) */}
                  {form.recurrenceType === 'weekly' && (
                    <div className="space-y-1.5">
                      <span className="text-xs text-slate-600 dark:text-slate-300">Repetir nos dias:</span>
                      <div className="flex gap-1">
                        {DAYS_PT.map((day, i) => {
                          const selected = (form.recurrenceConfig?.daysOfWeek || []).includes(i);
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                const days = form.recurrenceConfig?.daysOfWeek || [];
                                const next = selected ? days.filter(dd => dd !== i) : [...days, i];
                                if (next.length === 0) return;
                                updateField('recurrenceConfig', { ...form.recurrenceConfig, daysOfWeek: next.sort() });
                              }}
                              className={`w-9 h-9 rounded-full text-xs font-medium transition-all ${
                                selected ? 'bg-fyness-primary text-white shadow-sm' : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                              }`}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Info mensal */}
                  {form.recurrenceType === 'monthly' && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">Repete todo dia <strong>{dayOfMonth}</strong> de cada mes</p>
                  )}
                </>
              );
            })()}

            {/* Termino da recorrencia */}
            {form.recurrenceType && (
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">Termina</span>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="recEnd" checked={form.recurrenceEndType === 'never'} onChange={() => { updateField('recurrenceEndType', 'never'); updateField('recurrenceEndValue', ''); }} className="w-3.5 h-3.5 text-fyness-primary" />
                    <span className="text-sm text-slate-700 dark:text-slate-200">Nunca</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="recEnd" checked={form.recurrenceEndType === 'after'} onChange={() => updateField('recurrenceEndType', 'after')} className="w-3.5 h-3.5 text-fyness-primary" />
                    <span className="text-sm text-slate-700 dark:text-slate-200">Apos</span>
                    {form.recurrenceEndType === 'after' && (
                      <>
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={form.recurrenceEndValue || ''}
                          onChange={(e) => updateField('recurrenceEndValue', e.target.value)}
                          className="w-16 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm text-center dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
                          placeholder="10"
                        />
                        <span className="text-sm text-slate-500 dark:text-slate-400">ocorrencia(s)</span>
                      </>
                    )}
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="recEnd" checked={form.recurrenceEndType === 'on_date'} onChange={() => updateField('recurrenceEndType', 'on_date')} className="w-3.5 h-3.5 text-fyness-primary" />
                    <span className="text-sm text-slate-700 dark:text-slate-200">Na data</span>
                    {form.recurrenceEndType === 'on_date' && (
                      <input
                        type="date"
                        value={form.recurrenceEndValue || ''}
                        onChange={(e) => updateField('recurrenceEndValue', e.target.value)}
                        className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded text-sm dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
                      />
                    )}
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Presenca (apenas reunioes passadas) */}
          {isMeeting && isPastEvent && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2">
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wide">Registro de Presenca</p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.attended}
                  onChange={(e) => {
                    updateField('attended', e.target.checked);
                    if (!e.target.checked) updateField('wasLate', false);
                  }}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-200">Participou da reuniao</span>
              </label>
              {form.attended && (
                <label className="flex items-center gap-2 cursor-pointer ml-6">
                  <input
                    type="checkbox"
                    checked={form.wasLate}
                    onChange={(e) => {
                      updateField('wasLate', e.target.checked);
                      if (!e.target.checked) updateField('lateMinutes', 0);
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-400"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-200">Chegou atrasado</span>
                </label>
              )}
              {form.attended && form.wasLate && (
                <div className="ml-6 flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="480"
                    value={form.lateMinutes || ''}
                    onChange={(e) => updateField('lateMinutes', e.target.value)}
                    placeholder="0"
                    className="w-20 px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                  />
                  <span className="text-sm text-slate-500 dark:text-slate-400">minutos de atraso</span>
                </div>
              )}
            </div>
          )}

          {/* Descricao */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Descricao</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm resize-none dark:placeholder-slate-500"
              placeholder="Detalhes do evento..."
            />
          </div>

          {/* Anotacoes / Ata (reunioes) */}
          {isMeeting && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Anotacoes / Ata da Reuniao
                </span>
              </label>
              <textarea
                value={form.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                rows={5}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm resize-y dark:placeholder-slate-500"
                placeholder="Pauta, decisoes, pendencias..."
              />
            </div>
          )}

          {/* Anexos (reunioes) */}
          {isMeeting && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                  Anexos
                </span>
              </label>

              {/* Lista de anexos existentes */}
              {(form.attachments || []).length > 0 && (
                <div className="space-y-1.5">
                  {form.attachments.map((att, idx) => (
                    <div key={att.id || idx} className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      {att.type === 'image' ? (
                        <img src={att.data} alt={att.label} className="w-8 h-8 rounded object-cover shrink-0" />
                      ) : (
                        <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/20 rounded flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                      <span className="text-xs text-slate-600 dark:text-slate-300 truncate flex-1">{att.label || 'Arquivo'}</span>
                      <button
                        type="button"
                        onClick={() => updateField('attachments', form.attachments.filter((_, i) => i !== idx))}
                        className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Botao de upload */}
              <label className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm text-slate-500 dark:text-slate-400">Adicionar arquivo (max 3MB)</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 3 * 1024 * 1024) { alert('Arquivo muito grande! Maximo: 3MB.'); return; }
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const isImage = file.type.startsWith('image/');
                      const newAtt = { id: Date.now(), type: isImage ? 'image' : 'document', data: ev.target.result, label: file.name, mimeType: file.type };
                      updateField('attachments', [...(form.attachments || []), newAtt]);
                    };
                    reader.readAsDataURL(file);
                    e.target.value = '';
                  }}
                />
              </label>
              <p className="text-xs text-slate-400 dark:text-slate-500">Atas, documentos, imagens, PDFs</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between">
          <div>
            {editing && (
              <button
                onClick={onDelete}
                className="px-3 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
              >
                Excluir
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm">
              Cancelar
            </button>
            <button
              onClick={onSave}
              disabled={!form.title.trim()}
              className="px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {editing ? 'Salvar' : 'Criar Evento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== VIEW POSTAGENS (Calendario de Conteudo) ====================

const PLATFORM_ICONS = {
  instagram: (size = 12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  facebook: (size = 12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  tiktok: (size = 12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.16v-3.44a4.85 4.85 0 01-3.59-1.44V6.69h3.59z"/>
    </svg>
  ),
  youtube: (size = 12) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
};

const PLATFORMS = [
  { id: 'instagram', label: 'Instagram', color: '#E1306C', short: 'IG' },
  { id: 'facebook', label: 'Facebook', color: '#1877F2', short: 'FB' },
  { id: 'tiktok', label: 'TikTok', color: '#000000', short: 'TT' },
  { id: 'youtube', label: 'YouTube', color: '#FF0000', short: 'YT' },
];

const MEDIA_TYPES = [
  { id: 'image', label: 'Imagem' },
  { id: 'video', label: 'Video' },
  { id: 'carousel', label: 'Carrossel' },
  { id: 'story', label: 'Story' },
  { id: 'reel', label: 'Reel' },
];

function PostingsView({ contentPosts, createPost, updatePost, deletePost, allMembers }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [filterPlatform, setFilterPlatform] = useState('all');
  const [editingPost, setEditingPost] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [postForm, setPostForm] = useState({
    title: '', description: '', scheduledDate: '', scheduledTime: '12:00',
    platform: 'instagram', mediaType: null, assignee: '',
  });
  const [recurrence, setRecurrence] = useState({ enabled: false, type: 'weekly', daysOfWeek: [], monthsAhead: 3 });

  const days = useMemo(() => getMonthDays(currentMonth.getFullYear(), currentMonth.getMonth()), [currentMonth]);

  const filteredPosts = useMemo(() => {
    let posts = contentPosts || [];
    if (filterPlatform !== 'all') {
      posts = posts.filter(p => p.platform === filterPlatform);
    }
    return posts;
  }, [contentPosts, filterPlatform]);

  const getPostsForDay = useCallback((date) => {
    const key = toLocalDateString(date);
    return filteredPosts
      .filter(p => p.scheduledDate === key)
      .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''));
  }, [filteredPosts]);

  const navigateMonth = (dir) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + dir, 1));
  };

  const goTodayMonth = () => {
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  const togglePublished = (e, post) => {
    e.stopPropagation();
    if (post.status === 'published') {
      updatePost.mutate({ id: post.id, updates: { status: 'scheduled', publishedAt: null } });
    } else {
      updatePost.mutate({ id: post.id, updates: { status: 'published', publishedAt: new Date().toISOString() } });
    }
  };

  const openNewPost = (date) => {
    setPostForm({
      title: '', description: '',
      scheduledDate: date ? toLocalDateString(date) : toLocalDateString(today),
      scheduledTime: '12:00', platform: 'instagram', mediaType: null, assignee: '',
    });
    setRecurrence({ enabled: false, type: 'weekly', daysOfWeek: [], monthsAhead: 3 });
    setEditingPost({});
  };

  const openEditPost = (e, post) => {
    e.stopPropagation();
    setPostForm({
      title: post.title || '',
      description: post.description || '',
      scheduledDate: post.scheduledDate || '',
      scheduledTime: post.scheduledTime || '12:00',
      platform: post.platform || 'instagram',
      mediaType: post.mediaType || null,
      assignee: post.assignee || '',
    });
    setEditingPost(post);
  };

  // Gerar datas recorrentes a partir da data base
  const generateRecurrenceDates = useCallback((baseDate, rec) => {
    const dates = [];
    const start = new Date(baseDate + 'T00:00:00');
    const endLimit = new Date(start);
    endLimit.setMonth(endLimit.getMonth() + rec.monthsAhead);

    if (rec.type === 'weekly' && rec.daysOfWeek.length > 0) {
      // Para cada semana ate o limite, gerar nos dias selecionados
      const cursor = new Date(start);
      // Voltar pro domingo da semana atual
      cursor.setDate(cursor.getDate() - cursor.getDay());
      while (cursor <= endLimit) {
        for (const dow of rec.daysOfWeek) {
          const d = new Date(cursor);
          d.setDate(d.getDate() + dow);
          if (d >= start && d <= endLimit) {
            dates.push(toLocalDateString(d));
          }
        }
        cursor.setDate(cursor.getDate() + 7);
      }
    } else if (rec.type === 'biweekly' && rec.daysOfWeek.length > 0) {
      const cursor = new Date(start);
      cursor.setDate(cursor.getDate() - cursor.getDay());
      let weekCount = 0;
      while (cursor <= endLimit) {
        if (weekCount % 2 === 0) {
          for (const dow of rec.daysOfWeek) {
            const d = new Date(cursor);
            d.setDate(d.getDate() + dow);
            if (d >= start && d <= endLimit) {
              dates.push(toLocalDateString(d));
            }
          }
        }
        cursor.setDate(cursor.getDate() + 7);
        weekCount++;
      }
    } else if (rec.type === 'monthly') {
      // Mesmo dia do mes, a cada mes
      const dayOfMonth = start.getDate();
      const cursor = new Date(start);
      while (cursor <= endLimit) {
        dates.push(toLocalDateString(cursor));
        cursor.setMonth(cursor.getMonth() + 1);
        // Ajustar se o mes nao tem esse dia (ex: 31 em fevereiro)
        const maxDay = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
        cursor.setDate(Math.min(dayOfMonth, maxDay));
      }
    }

    // Remover duplicatas e ordenar
    return [...new Set(dates)].sort();
  }, []);

  const handleSave = async () => {
    if (!postForm.title.trim() || !postForm.scheduledDate) return;
    try {
      if (editingPost?.id) {
        // Edicao simples (sem recorrencia)
        await updatePost.mutateAsync({ id: editingPost.id, updates: postForm });
      } else if (recurrence.enabled) {
        // Criacao com recorrencia: gerar multiplos posts
        const dates = generateRecurrenceDates(postForm.scheduledDate, recurrence);
        if (dates.length === 0) {
          await createPost.mutateAsync(postForm);
        } else {
          const groupId = `recgroup_${Date.now()}`;
          for (const date of dates) {
            await createPost.mutateAsync({
              ...postForm,
              scheduledDate: date,
              recurrenceGroupId: groupId,
            });
          }
        }
      } else {
        await createPost.mutateAsync(postForm);
      }
      setEditingPost(null);
    } catch (err) {
      console.error('Erro ao salvar postagem:', err);
    }
  };

  const handleDeletePost = async (id) => {
    try {
      await deletePost.mutateAsync(id);
      setEditingPost(null);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Erro ao excluir postagem:', err);
    }
  };

  const handleDeleteSeries = async (groupId) => {
    try {
      const postsInGroup = (contentPosts || []).filter(p => p.recurrenceGroupId === groupId);
      for (const p of postsInGroup) {
        await deletePost.mutateAsync(p.id);
      }
      setEditingPost(null);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Erro ao excluir serie:', err);
    }
  };

  const getPlatform = (id) => PLATFORMS.find(p => p.id === id) || PLATFORMS[0];

  // Contadores por status para o header
  const stats = useMemo(() => {
    const all = contentPosts || [];
    const monthKey = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    const monthPosts = all.filter(p => p.scheduledDate?.startsWith(monthKey));
    return {
      total: monthPosts.length,
      published: monthPosts.filter(p => p.status === 'published').length,
      scheduled: monthPosts.filter(p => p.status === 'scheduled').length,
      missed: monthPosts.filter(p => {
        if (p.status === 'published') return false;
        const d = new Date(p.scheduledDate + 'T23:59:59');
        return d < today;
      }).length,
    };
  }, [contentPosts, currentMonth, today]);

  return (
    <div className="h-full flex flex-col">
      {/* Header interno: navegacao + filtro + botao */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={() => navigateMonth(-1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={goTodayMonth} className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              Hoje
            </button>
            <button onClick={() => navigateMonth(1)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <svg className="w-4 h-4 text-slate-600 dark:text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {MONTHS_PT[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>

          {/* Stats badges */}
          <div className="hidden sm:flex items-center gap-1.5 ml-2">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">{stats.total} total</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">{stats.published} publicados</span>
            {stats.missed > 0 && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-medium">{stats.missed} atrasados</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filtro por plataforma */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
            <button
              onClick={() => setFilterPlatform('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                filterPlatform === 'all' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
            >
              Todas
            </button>
            {PLATFORMS.map(p => (
              <button
                key={p.id}
                onClick={() => setFilterPlatform(p.id)}
                className={`px-2 py-1.5 rounded-md transition-colors flex items-center justify-center ${
                  filterPlatform === p.id ? 'text-white shadow-sm' : 'hover:text-slate-600'
                }`}
                style={filterPlatform === p.id ? { backgroundColor: p.color, color: '#fff' } : { color: p.color }}
                title={p.label}
              >
                {PLATFORM_ICONS[p.id]?.(16)}
              </button>
            ))}
          </div>

          <button
            onClick={() => openNewPost(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors text-xs font-medium shadow-sm"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Postagem
          </button>
        </div>
      </div>

      {/* Grid mensal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dias da semana */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-700">
          {DAYS_PT.map(day => (
            <div key={day} className="px-2 py-1.5 text-center text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase">
              {day}
            </div>
          ))}
        </div>

        {/* Celulas dos dias */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-7">
            {days.map(({ date, isCurrentMonth }, i) => {
              const dayPosts = getPostsForDay(date);
              const isToday = isSameDay(date, today);
              const isPast = date < today && !isToday;

              return (
                <div
                  key={i}
                  onClick={() => openNewPost(date)}
                  className={`border-b border-r border-slate-100 dark:border-slate-700 p-1 min-h-[90px] cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors ${
                    !isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-800/50' : ''
                  }`}
                >
                  <div className={`text-[10px] font-medium mb-1 w-5 h-5 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-fyness-primary text-white' : isCurrentMonth ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                    {date.getDate()}
                  </div>

                  <div className="space-y-0.5">
                    {dayPosts.map(post => {
                      const plat = getPlatform(post.platform);
                      const isPublished = post.status === 'published';
                      const isMissed = !isPublished && isPast && isCurrentMonth;

                      return (
                        <div
                          key={post.id}
                          onClick={(e) => openEditPost(e, post)}
                          className={`group relative flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] cursor-pointer transition-all hover:shadow-sm ${
                            isPublished
                              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                              : isMissed
                              ? 'bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800'
                              : 'bg-white dark:bg-slate-800 border dark:border-slate-600'
                          }`}
                          style={{ borderLeftWidth: '3px', borderLeftColor: plat.color }}
                        >
                          {/* Checkbox publicado */}
                          <button
                            onClick={(e) => togglePublished(e, post)}
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                              isPublished
                                ? 'bg-green-500 border-green-500 text-white'
                                : 'border-slate-300 dark:border-slate-500 hover:border-green-400'
                            }`}
                          >
                            {isPublished && (
                              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>

                          {/* Icone plataforma */}
                          <span className="shrink-0" style={{ color: plat.color }}>
                            {PLATFORM_ICONS[plat.id]?.(14)}
                          </span>

                          {/* Titulo + horario */}
                          <span className={`truncate font-medium ${
                            isPublished ? 'text-green-700 dark:text-green-400 line-through opacity-70' : isMissed ? 'text-red-600 dark:text-red-400' : 'text-slate-700 dark:text-slate-200'
                          }`}>
                            {post.scheduledTime && <span className="text-slate-400 dark:text-slate-500 mr-0.5">{post.scheduledTime}</span>}
                            {post.title}
                          </span>

                          {/* Indicador atrasado */}
                          {isMissed && (
                            <svg className="w-3 h-3 text-red-500 shrink-0 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal de criacao/edicao de postagem */}
      {editingPost !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setEditingPost(null)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header modal */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                {editingPost?.id ? 'Editar Postagem' : 'Nova Postagem'}
              </h3>
              <button onClick={() => setEditingPost(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {/* Titulo */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Titulo *</label>
                <input
                  type="text"
                  value={postForm.title}
                  onChange={(e) => setPostForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fyness-primary text-sm"
                  placeholder="Ex: Post sobre lancamento..."
                  autoFocus
                />
              </div>

              {/* Descricao */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Descricao</label>
                <textarea
                  value={postForm.description}
                  onChange={(e) => setPostForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fyness-primary text-sm resize-none"
                  placeholder="Legenda, copy, observacoes..."
                />
              </div>

              {/* Data + Horario */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Data *</label>
                  <input
                    type="date"
                    value={postForm.scheduledDate}
                    onChange={(e) => setPostForm(f => ({ ...f, scheduledDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fyness-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Horario</label>
                  <input
                    type="time"
                    value={postForm.scheduledTime}
                    onChange={(e) => setPostForm(f => ({ ...f, scheduledTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fyness-primary text-sm"
                  />
                </div>
              </div>

              {/* Plataforma */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Plataforma</label>
                <div className="flex gap-2">
                  {PLATFORMS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPostForm(f => ({ ...f, platform: p.id }))}
                      className={`flex-1 flex flex-col items-center justify-center gap-1 px-3 py-2.5 rounded-lg text-[10px] font-bold transition-all border-2 ${
                        postForm.platform === p.id
                          ? 'text-white shadow-md scale-105'
                          : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-slate-300'
                      }`}
                      style={postForm.platform === p.id ? { backgroundColor: p.color, borderColor: p.color, color: '#fff' } : { color: p.color }}
                    >
                      {PLATFORM_ICONS[p.id]?.(20)}
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tipo de midia */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Tipo de Midia</label>
                <div className="flex flex-wrap gap-1.5">
                  {MEDIA_TYPES.map(mt => (
                    <button
                      key={mt.id}
                      type="button"
                      onClick={() => setPostForm(f => ({ ...f, mediaType: f.mediaType === mt.id ? null : mt.id }))}
                      className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                        postForm.mediaType === mt.id
                          ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-800'
                          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                      }`}
                    >
                      {mt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Responsavel */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Responsavel</label>
                <select
                  value={postForm.assignee}
                  onChange={(e) => setPostForm(f => ({ ...f, assignee: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fyness-primary text-sm"
                >
                  <option value="">Nenhum</option>
                  {allMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              {/* Recorrencia (apenas criacao) */}
              {!editingPost?.id && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={recurrence.enabled}
                      onChange={(e) => setRecurrence(r => ({ ...r, enabled: e.target.checked }))}
                      className="w-4 h-4 rounded border-slate-300 text-fyness-primary focus:ring-fyness-primary"
                    />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Postagem recorrente</span>
                  </label>

                  {recurrence.enabled && (
                    <>
                      {/* Frequencia */}
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Frequencia</label>
                        <div className="flex gap-1.5">
                          {[
                            { id: 'weekly', label: 'Semanal' },
                            { id: 'biweekly', label: 'Quinzenal' },
                            { id: 'monthly', label: 'Mensal' },
                          ].map(f => (
                            <button
                              key={f.id}
                              type="button"
                              onClick={() => setRecurrence(r => ({ ...r, type: f.id }))}
                              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                recurrence.type === f.id
                                  ? 'bg-fyness-primary text-white shadow-sm'
                                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Dias da semana (semanal / quinzenal) */}
                      {(recurrence.type === 'weekly' || recurrence.type === 'biweekly') && (
                        <div>
                          <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Nos dias</label>
                          <div className="flex gap-1">
                            {DAYS_PT.map((day, i) => {
                              const selected = recurrence.daysOfWeek.includes(i);
                              return (
                                <button
                                  key={i}
                                  type="button"
                                  onClick={() => {
                                    setRecurrence(r => ({
                                      ...r,
                                      daysOfWeek: selected
                                        ? r.daysOfWeek.filter(d => d !== i)
                                        : [...r.daysOfWeek, i].sort(),
                                    }));
                                  }}
                                  className={`w-9 h-9 rounded-full text-[10px] font-bold transition-all ${
                                    selected
                                      ? 'bg-fyness-primary text-white shadow-sm'
                                      : 'bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600'
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Mensal info */}
                      {recurrence.type === 'monthly' && postForm.scheduledDate && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Repete todo dia <strong>{new Date(postForm.scheduledDate + 'T00:00:00').getDate()}</strong> de cada mes
                        </p>
                      )}

                      {/* Quantidade de meses */}
                      <div>
                        <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">Gerar para os proximos</label>
                        <div className="flex gap-1.5">
                          {[3, 6, 12].map(m => (
                            <button
                              key={m}
                              type="button"
                              onClick={() => setRecurrence(r => ({ ...r, monthsAhead: m }))}
                              className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                recurrence.monthsAhead === m
                                  ? 'bg-fyness-primary text-white shadow-sm'
                                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                              }`}
                            >
                              {m} meses
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Preview quantidade */}
                      {recurrence.enabled && postForm.scheduledDate && (() => {
                        const dates = generateRecurrenceDates(postForm.scheduledDate, recurrence);
                        return dates.length > 0 ? (
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            {dates.length} postagens serao criadas
                          </p>
                        ) : (
                          <p className="text-xs text-amber-600 dark:text-amber-400">
                            Selecione ao menos um dia da semana
                          </p>
                        );
                      })()}
                    </>
                  )}
                </div>
              )}

              {/* Indicador de serie (edicao) */}
              {editingPost?.id && editingPost?.recurrenceGroupId && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-xs text-blue-700 dark:text-blue-300">Esta postagem faz parte de uma serie recorrente</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-1">
                {editingPost?.id && (
                  showDeleteConfirm === editingPost.id ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-red-600 dark:text-red-400">Confirmar?</span>
                      <button onClick={() => handleDeletePost(editingPost.id)} className="px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600 transition-colors">
                        So esta
                      </button>
                      {editingPost.recurrenceGroupId && (
                        <button onClick={() => handleDeleteSeries(editingPost.recurrenceGroupId)} className="px-2 py-1 bg-red-700 text-white text-xs rounded hover:bg-red-800 transition-colors">
                          Toda serie
                        </button>
                      )}
                      <button onClick={() => setShowDeleteConfirm(null)} className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700 transition-colors">
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(editingPost.id)}
                      className="px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium"
                    >
                      Excluir
                    </button>
                  )
                )}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingPost(null)} className="px-3 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={!postForm.title.trim() || !postForm.scheduledDate}
                  className="px-4 py-1.5 text-xs bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingPost?.id ? 'Salvar' : 'Criar Postagem'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== MODAL RECORRENCIA (editar/excluir serie) ====================

function RecurrenceEditModal({ action, onChoice, onClose }) {
  const [choice, setChoice] = useState('this');
  const isDelete = action === 'delete';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isDelete ? 'bg-red-100 dark:bg-red-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
              <svg className={`w-5 h-5 ${isDelete ? 'text-red-500' : 'text-blue-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              {isDelete ? 'Excluir evento recorrente' : 'Editar evento recorrente'}
            </h3>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <input type="radio" name="recChoice" checked={choice === 'this'} onChange={() => setChoice('this')} className="w-4 h-4 text-fyness-primary" />
              <div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">Este evento</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Apenas esta ocorrencia sera {isDelete ? 'excluida' : 'editada'}</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <input type="radio" name="recChoice" checked={choice === 'future'} onChange={() => setChoice('future')} className="w-4 h-4 text-fyness-primary" />
              <div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">Este e os proximos</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">{isDelete ? 'Excluir' : 'Editar'} esta e todas as ocorrencias futuras</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <input type="radio" name="recChoice" checked={choice === 'all'} onChange={() => setChoice('all')} className="w-4 h-4 text-fyness-primary" />
              <div>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100">Todos os eventos da serie</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">Todas as ocorrencias serao {isDelete ? 'excluidas' : 'editadas'}</p>
              </div>
            </label>
          </div>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-700">
          <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => onChoice(choice)}
            className={`px-4 py-2 text-sm text-white rounded-lg transition-colors font-medium ${
              isDelete ? 'bg-red-500 hover:bg-red-600' : 'bg-fyness-primary hover:bg-fyness-secondary'
            }`}
          >
            {isDelete ? 'Excluir' : 'Editar'}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * AgendaPage - Calendario estilo Google Calendar
 * Acompanhamento da rotina da equipe, O.S., eventos
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAgendaEvents, useCreateAgendaEvent, useUpdateAgendaEvent, useDeleteAgendaEvent, useTeamMembers, useOSOrders } from '../../hooks/queries';
import { shortName } from '../../lib/teamService';
import { getProfile } from '../../lib/profileService';
import { expandRecurrences, toDateKey } from '../../lib/recurrenceUtils';
import { downloadICS } from '../../lib/icsExporter';
import { useRealtimeAgendaEvents } from '../../hooks/useRealtimeSubscription';

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

// ==================== COMPONENTE PRINCIPAL ====================

export default function AgendaPage() {
  const today = new Date();

  // React Query hooks para dados
  const { data: events = [], isLoading: loadingEvents } = useAgendaEvents();
  const { data: teamMembers = [], isLoading: loadingMembers } = useTeamMembers();
  const { data: osOrders = [], isLoading: loadingOS } = useOSOrders();
  const createEventMutation = useCreateAgendaEvent();
  const updateEventMutation = useUpdateAgendaEvent();
  const deleteEventMutation = useDeleteAgendaEvent();

  const loading = loadingEvents || loadingMembers || loadingOS;

  // Realtime: atualiza automaticamente quando eventos mudam no Supabase
  useRealtimeAgendaEvents();

  const [currentDate, setCurrentDate] = useState(today);
  const [view, setView] = useState('day');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [quickCreate, setQuickCreate] = useState(null); // { date, startTime, endTime }
  const [recurrenceAction, setRecurrenceAction] = useState(null); // { event, action: 'edit'|'delete' }
  const [profile, setProfile] = useState({});
  const [activeFilters, setActiveFilters] = useState([]); // inicializa vazio, preenche ao carregar

  // Lista completa: membros cadastrados + perfil logado
  const allMembers = useMemo(() => {
    if (!profile.name) return teamMembers;
    const alreadyIn = teamMembers.some(m => m.name.toLowerCase().trim() === profile.name.toLowerCase().trim());
    if (alreadyIn) return teamMembers;
    return [{ id: 'profile_self', name: profile.name, role: profile.role || '', color: '#3b82f6' }, ...teamMembers];
  }, [teamMembers, profile]);

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
    // O.S. sao somente leitura no calendario
    if (event._isOS) return;
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
      await createEventMutation.mutateAsync(eventData);
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
  const osCalendarEvents = useMemo(() => {
    return osOrders
      .filter(os => {
        // Incluir O.S. que tenha alguem atribuido (assignee ou assignedTo)
        const hasAssignee = os.assignee || os.assignedTo;
        if (!hasAssignee) return false;
        // Precisa ter alguma data para posicionar no calendario
        return os.actualStart || os.estimatedStart || os.slaDeadline || os.createdAt;
      })
      .map(os => {
        // Determinar nome do responsavel: assignee (quem pegou) ou assignedTo (atribuido)
        const responsibleName = os.assignee || os.assignedTo || '';
        const member = allMembers.find(m => m.name.toLowerCase().trim() === responsibleName.toLowerCase().trim());

        // Determinar datas baseado no status
        let start, end;
        if (os.actualStart) {
          start = new Date(os.actualStart);
          end = os.actualEnd ? new Date(os.actualEnd) : new Date(start.getTime() + 2 * 3600000);
        } else if (os.estimatedStart) {
          start = new Date(os.estimatedStart);
          end = os.estimatedEnd ? new Date(os.estimatedEnd) : new Date(start.getTime() + 2 * 3600000);
        } else if (os.slaDeadline) {
          // SLA: posicionar 2h antes do deadline
          end = new Date(os.slaDeadline);
          start = new Date(end.getTime() - 2 * 3600000);
        } else {
          start = new Date(os.createdAt);
          end = new Date(start.getTime() + 2 * 3600000);
        }

        const osNum = os.type === 'emergency' ? `EMG-${os.emergencyNumber}` : `#${os.number}`;
        return {
          id: `os_cal_${os.id}`,
          title: `O.S. ${osNum} - ${os.title}`,
          description: os.client ? `Cliente: ${os.client}` : os.description || '',
          startDate: start.toISOString(),
          endDate: end.toISOString(),
          assignee: member?.id || null,
          type: 'os',
          color: OS_STATUS_COLORS[os.status] || '#f97316',
          _isOS: true,
          _osId: os.id,
          _osStatus: os.status,
          _osPriority: os.priority,
        };
      });
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
        </div>

        <div className="flex items-center gap-2">
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

          <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
            {['month', 'week', 'day'].map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  view === v ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Dia'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Views */}
      <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {view === 'month' && <MonthView currentDate={currentDate} today={today} getEventsForDay={getEventsForDay} onDayClick={(d) => { setCurrentDate(d); setView('day'); }} onEventClick={openEditModal} allMembers={allMembers} />}
        {view === 'week' && <WeekView currentDate={currentDate} today={today} getEventsForDay={getEventsForDay} onEventClick={openEditModal} onSlotClick={(d) => openCreateModal(d)} allMembers={allMembers} businessHours={businessHours} />}
        {view === 'day' && <DayView currentDate={currentDate} today={today} getEventsForDay={getEventsForDay} onEventClick={openEditModal} onSlotClick={() => openCreateModal(currentDate)} allMembers={allMembers} businessHours={businessHours} />}
      </div>

      {/* Filtro por pessoa */}
      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="font-medium text-slate-500 dark:text-slate-400 mr-1">Filtrar:</span>
        {allMembers.map(m => {
          const isActive = activeFilters.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() => toggleFilter(m.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
                isActive
                  ? 'border-transparent text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800'
              }`}
              style={isActive ? { backgroundColor: m.color } : {}}
            >
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white/80' : ''}`} style={!isActive ? { backgroundColor: m.color } : {}} />
              <span className="font-medium">{shortName(m.name)}</span>
            </button>
          );
        })}
        {activeFilters.length < allMembers.length && (
          <button
            onClick={() => setActiveFilters(allMembers.map(m => m.id))}
            className="px-2 py-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Mostrar todos
          </button>
        )}
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
      <div className="flex-1 grid grid-cols-7 grid-rows-6">
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
                {dayEvents.slice(0, 3).map(event => {
                  const member = allMembers.find(m => m.id === event.assignee);
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className={`text-[10px] px-1.5 py-0.5 rounded truncate text-white font-medium cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-0.5 ${event._isOS ? 'ring-1 ring-orange-300' : ''}`}
                      style={{ backgroundColor: event.color || '#3b82f6' }}
                      title={`${event.title} - ${member?.name || ''}`}
                    >
                      {event._isOS && <svg className="w-2.5 h-2.5 shrink-0 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                      {event._parentId && !event._isOS && <svg className="w-2.5 h-2.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                      <span className={`truncate ${event._isOS && event._osStatus === 'done' ? 'line-through opacity-70' : ''}`}>{formatTime(new Date(event.startDate))} {event.title}</span>
                      {event._isOS && event._osStatus === 'available' && <span className="ml-auto text-[8px] bg-white/30 px-1 rounded shrink-0">A fazer</span>}
                      {event._isOS && event._osStatus === 'done' && <span className="ml-auto text-[8px] bg-white/30 px-1 rounded shrink-0">&#10003;</span>}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium px-1">
                    +{dayEvents.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==================== VIEW SEMANAL ====================

function WeekView({ currentDate, today, getEventsForDay, onEventClick, onSlotClick, allMembers, businessHours }) {
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

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

      {/* Grid horarios */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {HOURS.map(hour => {
            const isOffHours = hour < businessHours.start || hour >= businessHours.end;
            return (
            <div key={hour} className="contents">
              {/* Label hora */}
              <div className={`h-14 border-r border-b border-slate-100 dark:border-slate-700 flex items-start justify-end pr-2 pt-0.5 ${isOffHours ? 'bg-slate-100/60 dark:bg-slate-700/50' : ''}`}>
                <span className={`text-[10px] font-medium ${isOffHours ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`}>{String(hour).padStart(2, '0')}:00</span>
              </div>

              {/* Celulas por dia */}
              {weekDays.map((day, dayIdx) => {
                const dayEvents = getEventsForDay(day);
                const hourEvents = dayEvents.filter(e => new Date(e.startDate).getHours() === hour);

                return (
                  <div
                    key={dayIdx}
                    onClick={() => {
                      const d = new Date(day);
                      d.setHours(hour, 0, 0, 0);
                      onSlotClick(d);
                    }}
                    className={`h-14 border-r border-b border-slate-100 dark:border-slate-700 relative cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors ${isOffHours ? 'bg-slate-100/60 dark:bg-slate-700/50' : ''}`}
                  >
                    {hourEvents.map(event => {
                      const start = new Date(event.startDate);
                      const end = new Date(event.endDate);
                      const durationHours = Math.max((end - start) / 3600000, 0.5);
                      const topOffset = (start.getMinutes() / 60) * 56;
                      const height = Math.min(durationHours * 56, 56 * 4);
                      const member = allMembers.find(m => m.id === event.assignee);

                      return (
                        <div
                          key={event.id}
                          onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                          className={`absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 text-white text-[10px] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity z-10 shadow-sm ${event._isOS ? 'ring-1 ring-orange-300' : ''}`}
                          style={{
                            backgroundColor: event.color || '#3b82f6',
                            top: `${topOffset}px`,
                            height: `${height}px`,
                            minHeight: '20px',
                          }}
                          title={`${event.title} - ${member?.name || ''}`}
                        >
                          <div className="font-semibold truncate flex items-center gap-0.5">
                            {event._isOS && <svg className="w-2.5 h-2.5 shrink-0 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            {event._parentId && !event._isOS && <svg className="w-2.5 h-2.5 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                            <span className={`truncate ${event._isOS && event._osStatus === 'done' ? 'line-through opacity-70' : ''}`}>{event.title}</span>
                            {event._isOS && event._osStatus === 'available' && <span className="text-[8px] bg-white/30 px-1 rounded shrink-0 ml-auto">A fazer</span>}
                            {event._isOS && event._osStatus === 'done' && <span className="text-[8px] bg-white/30 px-1 rounded shrink-0 ml-auto">&#10003;</span>}
                          </div>
                          <div className="opacity-80 truncate">{formatTime(start)} - {formatTime(end)}</div>
                          {member && <div className="opacity-70 truncate">{shortName(member.name)}</div>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ==================== VIEW DIARIA ====================

function DayView({ currentDate, today, getEventsForDay, onEventClick, onSlotClick, allMembers, businessHours }) {
  const dayEvents = useMemo(() => getEventsForDay(currentDate), [getEventsForDay, currentDate]);
  const isToday = isSameDay(currentDate, today);

  return (
    <div className="h-full flex flex-col">
      {/* Header do dia */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
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

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[60px_1fr]">
          {HOURS.map(hour => {
            const hourEvents = dayEvents.filter(e => new Date(e.startDate).getHours() === hour);
            const isOffHours = hour < businessHours.start || hour >= businessHours.end;

            return (
              <div key={hour} className="contents">
                <div className={`h-16 border-r border-b border-slate-100 dark:border-slate-700 flex items-start justify-end pr-2 pt-1 ${isOffHours ? 'bg-slate-100/60 dark:bg-slate-700/50' : ''}`}>
                  <span className={`text-xs font-medium ${isOffHours ? 'text-slate-300 dark:text-slate-600' : 'text-slate-400 dark:text-slate-500'}`}>{String(hour).padStart(2, '0')}:00</span>
                </div>
                <div
                  onClick={onSlotClick}
                  className={`h-16 border-b border-slate-100 dark:border-slate-700 relative cursor-pointer hover:bg-blue-50/30 dark:hover:bg-blue-900/20 transition-colors ${isOffHours ? 'bg-slate-100/60 dark:bg-slate-700/50' : ''}`}
                >
                  {hourEvents.map(event => {
                    const start = new Date(event.startDate);
                    const end = new Date(event.endDate);
                    const durationMin = (end - start) / 60000;
                    const topOffset = (start.getMinutes() / 60) * 64;
                    const height = Math.max((durationMin / 60) * 64, 28);
                    const member = allMembers.find(m => m.id === event.assignee);
                    const eventType = EVENT_TYPES.find(t => t.id === event.type);

                    return (
                      <div
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                        className={`absolute left-1 right-4 rounded-lg px-3 py-1.5 text-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity z-10 shadow-sm ${event._isOS ? 'ring-2 ring-orange-300' : ''}`}
                        style={{
                          backgroundColor: event.color || '#3b82f6',
                          top: `${topOffset}px`,
                          minHeight: `${height}px`,
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className={`font-semibold text-sm truncate flex items-center gap-1 ${event._isOS && event._osStatus === 'done' ? 'line-through opacity-70' : ''}`}>
                            {event._isOS && <svg className="w-3 h-3 shrink-0 opacity-90" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            {event._parentId && !event._isOS && <svg className="w-3 h-3 shrink-0 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                            {event.title}
                          </span>
                          <div className="flex items-center gap-1">
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
                          {member && <span className="ml-2">{shortName(member.name)}</span>}
                        </div>
                        {event.description && (
                          <div className="text-xs opacity-70 mt-0.5 truncate">{event.description}</div>
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
  );
}

// ==================== MODAL EVENTO ====================

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

/**
 * AgendaPage - Calendario estilo Google Calendar
 * Acompanhamento da rotina da equipe, O.S., eventos
 */

import { useState, useEffect, useMemo, useCallback } from 'react';

// ==================== CONSTANTES ====================

const STORAGE_KEY = 'agenda_events';

const TEAM_MEMBERS = [
  { id: '1', name: 'Admin', color: '#6366f1' },
  { id: '2', name: 'Operador 1', color: '#22c55e' },
  { id: '3', name: 'Operador 2', color: '#f97316' },
  { id: '4', name: 'Operador 3', color: '#ec4899' },
];

const EVENT_TYPES = [
  { id: 'meeting', label: 'Reuniao', color: '#6366f1' },
  { id: 'os', label: 'Ordem de Servico', color: '#f97316' },
  { id: 'task', label: 'Tarefa', color: '#22c55e' },
  { id: 'personal', label: 'Pessoal', color: '#64748b' },
];

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7); // 07h - 22h

const DAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];
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

// ==================== SEED DATA ====================

function getSeedEvents() {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  const dow = now.getDay();

  // Helper para criar datas relativas a hoje
  const dt = (dayOffset, hour, min = 0) => new Date(y, m, d + dayOffset, hour, min).toISOString();

  return [
    // HOJE
    { id: 'seed_1', title: 'Daily Standup', description: 'Alinhamento diario da equipe', startDate: dt(0, 9, 0), endDate: dt(0, 9, 30), assignee: '1', type: 'meeting', color: '#6366f1', createdAt: dt(-1, 8) },
    { id: 'seed_2', title: 'O.S. #142 - Manutencao Servidor', description: 'Atualizar pacotes e reiniciar servicos', startDate: dt(0, 10, 0), endDate: dt(0, 12, 0), assignee: '2', type: 'os', color: '#f97316', createdAt: dt(-1, 8) },
    { id: 'seed_3', title: 'Revisar proposta comercial', description: 'Cliente Acme Corp - contrato anual', startDate: dt(0, 14, 0), endDate: dt(0, 15, 0), assignee: '1', type: 'task', color: '#22c55e', createdAt: dt(-1, 8) },
    { id: 'seed_4', title: 'O.S. #143 - Deploy Frontend', description: 'Deploy da versao 2.1 em producao', startDate: dt(0, 15, 30), endDate: dt(0, 16, 30), assignee: '3', type: 'os', color: '#f97316', createdAt: dt(-1, 8) },

    // AMANHA
    { id: 'seed_5', title: 'Reuniao com cliente', description: 'Apresentacao do projeto BPMN', startDate: dt(1, 10, 0), endDate: dt(1, 11, 30), assignee: '1', type: 'meeting', color: '#6366f1', createdAt: dt(-1, 8) },
    { id: 'seed_6', title: 'O.S. #144 - Corrigir bug login', description: 'Bug reportado pelo cliente - tela branca apos login', startDate: dt(1, 13, 0), endDate: dt(1, 15, 0), assignee: '2', type: 'os', color: '#f97316', createdAt: dt(-1, 8) },
    { id: 'seed_7', title: 'Treino da equipe', description: 'Workshop sobre boas praticas React', startDate: dt(1, 16, 0), endDate: dt(1, 17, 30), assignee: '4', type: 'task', color: '#22c55e', createdAt: dt(-1, 8) },

    // DEPOIS DE AMANHA
    { id: 'seed_8', title: 'Sprint Planning', description: 'Planejamento da sprint 14', startDate: dt(2, 9, 0), endDate: dt(2, 10, 30), assignee: '1', type: 'meeting', color: '#6366f1', createdAt: dt(-1, 8) },
    { id: 'seed_9', title: 'O.S. #145 - Configurar backup', description: 'Configurar backup automatico do banco', startDate: dt(2, 11, 0), endDate: dt(2, 13, 0), assignee: '3', type: 'os', color: '#f97316', createdAt: dt(-1, 8) },

    // PROXIMA SEMANA
    { id: 'seed_10', title: 'Retrospectiva Sprint 13', description: 'O que foi bom, o que melhorar', startDate: dt(5, 14, 0), endDate: dt(5, 15, 0), assignee: '1', type: 'meeting', color: '#6366f1', createdAt: dt(-1, 8) },
    { id: 'seed_11', title: 'O.S. #146 - Migrar banco de dados', description: 'Migrar tabelas para novo schema', startDate: dt(5, 9, 0), endDate: dt(5, 12, 0), assignee: '2', type: 'os', color: '#f97316', createdAt: dt(-1, 8) },
    { id: 'seed_12', title: 'Almoco de integracao', description: 'Confraternizacao mensal da equipe', startDate: dt(6, 12, 0), endDate: dt(6, 13, 30), assignee: '4', type: 'personal', color: '#64748b', createdAt: dt(-1, 8) },

    // SEMANA ANTERIOR (historico)
    { id: 'seed_13', title: 'O.S. #140 - Setup ambiente', description: 'Configurar ambiente de desenvolvimento novo colaborador', startDate: dt(-2, 9, 0), endDate: dt(-2, 11, 0), assignee: '3', type: 'os', color: '#f97316', createdAt: dt(-3, 8) },
    { id: 'seed_14', title: 'Reuniao de resultados', description: 'Apresentacao de KPIs do mes', startDate: dt(-1, 15, 0), endDate: dt(-1, 16, 0), assignee: '1', type: 'meeting', color: '#6366f1', createdAt: dt(-3, 8) },
  ];
}

// ==================== PERSISTENCIA ====================

function loadEvents() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (stored === null) {
      // Primeiro acesso: carregar dados de exemplo
      const seed = getSeedEvents();
      saveEvents(seed);
      return seed;
    }
    return stored;
  } catch {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function AgendaPage() {
  const today = new Date();
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(today);
  const [view, setView] = useState('month');
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [activeFilters, setActiveFilters] = useState(TEAM_MEMBERS.map(m => m.id)); // todos ativos por padrao

  const toggleFilter = (memberId) => {
    setActiveFilters(prev => {
      if (prev.includes(memberId)) {
        if (prev.length === 1) return TEAM_MEMBERS.map(m => m.id); // se desmarcar o ultimo, reativa todos
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
    type: 'task',
  });

  // Carregar eventos
  useEffect(() => {
    setEvents(loadEvents());
  }, []);

  // Persistir eventos
  const updateEvents = useCallback((newEvents) => {
    setEvents(newEvents);
    saveEvents(newEvents);
  }, []);

  // ==================== HANDLERS ====================

  const openCreateModal = (date) => {
    const dateStr = date ? toLocalDateString(date) : toLocalDateString(currentDate);
    setEditingEvent(null);
    setForm({
      title: '',
      description: '',
      startDate: dateStr,
      startTime: '09:00',
      endDate: dateStr,
      endTime: '10:00',
      assignee: '1',
      type: 'task',
    });
    setShowEventModal(true);
  };

  const openEditModal = (event) => {
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
      type: event.type || 'task',
    });
    setShowEventModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;

    const startDate = new Date(`${form.startDate}T${form.startTime}:00`);
    const endDate = new Date(`${form.endDate}T${form.endTime}:00`);
    const eventType = EVENT_TYPES.find(t => t.id === form.type);

    if (editingEvent) {
      const updated = events.map(e =>
        e.id === editingEvent.id
          ? { ...e, title: form.title, description: form.description, startDate: startDate.toISOString(), endDate: endDate.toISOString(), assignee: form.assignee, type: form.type, color: eventType.color }
          : e
      );
      updateEvents(updated);
    } else {
      const newEvent = {
        id: `evt_${Date.now()}`,
        title: form.title,
        description: form.description,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        assignee: form.assignee,
        type: form.type,
        color: eventType.color,
        createdAt: new Date().toISOString(),
      };
      updateEvents([...events, newEvent]);
    }
    setShowEventModal(false);
  };

  const handleDelete = (id) => {
    updateEvents(events.filter(e => e.id !== id));
    setShowDeleteModal(null);
    setShowEventModal(false);
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

  // Eventos de um dia (com filtro de pessoa)
  const getEventsForDay = useCallback((date) => {
    return events.filter(e => {
      const start = new Date(e.startDate);
      return isSameDay(start, date) && activeFilters.includes(e.assignee);
    });
  }, [events, activeFilters]);

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
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={goToday} className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              Hoje
            </button>
            <button onClick={() => navigate(1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <h2 className="text-lg font-semibold text-slate-800">{headerTitle}</h2>
        </div>

        <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
          {['month', 'week', 'day'].map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                view === v ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {v === 'month' ? 'Mes' : v === 'week' ? 'Semana' : 'Dia'}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Views */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {view === 'month' && <MonthView currentDate={currentDate} today={today} getEventsForDay={getEventsForDay} onDayClick={(d) => { setCurrentDate(d); setView('day'); }} onEventClick={openEditModal} />}
        {view === 'week' && <WeekView currentDate={currentDate} today={today} getEventsForDay={getEventsForDay} onEventClick={openEditModal} onSlotClick={(d) => openCreateModal(d)} />}
        {view === 'day' && <DayView currentDate={currentDate} today={today} getEventsForDay={getEventsForDay} onEventClick={openEditModal} onSlotClick={() => openCreateModal(currentDate)} />}
      </div>

      {/* Filtro por pessoa */}
      <div className="mt-3 flex items-center gap-2 text-xs">
        <span className="font-medium text-slate-500 mr-1">Filtrar:</span>
        {TEAM_MEMBERS.map(m => {
          const isActive = activeFilters.includes(m.id);
          return (
            <button
              key={m.id}
              onClick={() => toggleFilter(m.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
                isActive
                  ? 'border-transparent text-white shadow-sm'
                  : 'border-slate-200 text-slate-400 bg-white'
              }`}
              style={isActive ? { backgroundColor: m.color } : {}}
            >
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-white/80' : ''}`} style={!isActive ? { backgroundColor: m.color } : {}} />
              <span className="font-medium">{m.name}</span>
            </button>
          );
        })}
        {activeFilters.length < TEAM_MEMBERS.length && (
          <button
            onClick={() => setActiveFilters(TEAM_MEMBERS.map(m => m.id))}
            className="px-2 py-1 text-slate-400 hover:text-slate-600 transition-colors"
          >
            Mostrar todos
          </button>
        )}
      </div>

      {/* Event Modal */}
      {showEventModal && (
        <EventModal
          form={form}
          setForm={setForm}
          editing={!!editingEvent}
          onSave={handleSave}
          onClose={() => setShowEventModal(false)}
          onDelete={() => setShowDeleteModal(editingEvent?.id)}
        />
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">Excluir Evento?</h3>
              <p className="text-sm text-slate-500 text-center">Esta acao nao pode ser desfeita.</p>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3 justify-center">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors">
                Cancelar
              </button>
              <button onClick={() => handleDelete(showDeleteModal)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== VIEW MENSAL ====================

function MonthView({ currentDate, today, getEventsForDay, onDayClick, onEventClick }) {
  const days = useMemo(() => getMonthDays(currentDate.getFullYear(), currentDate.getMonth()), [currentDate]);

  return (
    <div className="h-full flex flex-col">
      {/* Header dias da semana */}
      <div className="grid grid-cols-7 border-b border-slate-200">
        {DAYS_PT.map(day => (
          <div key={day} className="px-2 py-2 text-center text-xs font-semibold text-slate-500 uppercase">
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
              className={`border-b border-r border-slate-100 p-1 min-h-[80px] cursor-pointer hover:bg-slate-50 transition-colors ${
                !isCurrentMonth ? 'bg-slate-50/50' : ''
              }`}
            >
              <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                isToday ? 'bg-fyness-primary text-white' : isCurrentMonth ? 'text-slate-700' : 'text-slate-400'
              }`}>
                {date.getDate()}
              </div>

              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map(event => {
                  const member = TEAM_MEMBERS.find(m => m.id === event.assignee);
                  return (
                    <div
                      key={event.id}
                      onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                      className="text-[10px] px-1.5 py-0.5 rounded truncate text-white font-medium cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: event.color || '#6366f1' }}
                      title={`${event.title} - ${member?.name || ''}`}
                    >
                      {formatTime(new Date(event.startDate))} {event.title}
                    </div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-slate-500 font-medium px-1">
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

function WeekView({ currentDate, today, getEventsForDay, onEventClick, onSlotClick }) {
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  return (
    <div className="h-full flex flex-col">
      {/* Header com dias */}
      <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-200">
        <div className="border-r border-slate-200" />
        {weekDays.map((day, i) => {
          const isToday = isSameDay(day, today);
          return (
            <div key={i} className="px-2 py-2 text-center border-r border-slate-100">
              <div className="text-xs text-slate-500 uppercase">{DAYS_PT[day.getDay()]}</div>
              <div className={`text-lg font-semibold mt-0.5 w-8 h-8 flex items-center justify-center rounded-full mx-auto ${
                isToday ? 'bg-fyness-primary text-white' : 'text-slate-800'
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
          {HOURS.map(hour => (
            <div key={hour} className="contents">
              {/* Label hora */}
              <div className="h-14 border-r border-b border-slate-100 flex items-start justify-end pr-2 pt-0.5">
                <span className="text-[10px] text-slate-400 font-medium">{String(hour).padStart(2, '0')}:00</span>
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
                    className="h-14 border-r border-b border-slate-100 relative cursor-pointer hover:bg-blue-50/30 transition-colors"
                  >
                    {hourEvents.map(event => {
                      const start = new Date(event.startDate);
                      const end = new Date(event.endDate);
                      const durationHours = Math.max((end - start) / 3600000, 0.5);
                      const topOffset = (start.getMinutes() / 60) * 56;
                      const height = Math.min(durationHours * 56, 56 * 4);
                      const member = TEAM_MEMBERS.find(m => m.id === event.assignee);

                      return (
                        <div
                          key={event.id}
                          onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                          className="absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 text-white text-[10px] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity z-10 shadow-sm"
                          style={{
                            backgroundColor: event.color || '#6366f1',
                            top: `${topOffset}px`,
                            height: `${height}px`,
                            minHeight: '20px',
                          }}
                          title={`${event.title} - ${member?.name || ''}`}
                        >
                          <div className="font-semibold truncate">{event.title}</div>
                          <div className="opacity-80 truncate">{formatTime(start)} - {formatTime(end)}</div>
                          {member && <div className="opacity-70 truncate">{member.name}</div>}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== VIEW DIARIA ====================

function DayView({ currentDate, today, getEventsForDay, onEventClick, onSlotClick }) {
  const dayEvents = useMemo(() => getEventsForDay(currentDate), [getEventsForDay, currentDate]);
  const isToday = isSameDay(currentDate, today);

  return (
    <div className="h-full flex flex-col">
      {/* Header do dia */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full flex flex-col items-center justify-center ${
          isToday ? 'bg-fyness-primary text-white' : 'bg-slate-100 text-slate-700'
        }`}>
          <span className="text-[10px] uppercase leading-none">{DAYS_PT[currentDate.getDay()]}</span>
          <span className="text-lg font-bold leading-none">{currentDate.getDate()}</span>
        </div>
        <div>
          <span className="text-sm text-slate-500">
            {dayEvents.length} evento{dayEvents.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-[60px_1fr]">
          {HOURS.map(hour => {
            const hourEvents = dayEvents.filter(e => new Date(e.startDate).getHours() === hour);

            return (
              <div key={hour} className="contents">
                <div className="h-16 border-r border-b border-slate-100 flex items-start justify-end pr-2 pt-1">
                  <span className="text-xs text-slate-400 font-medium">{String(hour).padStart(2, '0')}:00</span>
                </div>
                <div
                  onClick={onSlotClick}
                  className="h-16 border-b border-slate-100 relative cursor-pointer hover:bg-blue-50/30 transition-colors"
                >
                  {hourEvents.map(event => {
                    const start = new Date(event.startDate);
                    const end = new Date(event.endDate);
                    const durationMin = (end - start) / 60000;
                    const topOffset = (start.getMinutes() / 60) * 64;
                    const height = Math.max((durationMin / 60) * 64, 28);
                    const member = TEAM_MEMBERS.find(m => m.id === event.assignee);
                    const eventType = EVENT_TYPES.find(t => t.id === event.type);

                    return (
                      <div
                        key={event.id}
                        onClick={(e) => { e.stopPropagation(); onEventClick(event); }}
                        className="absolute left-1 right-4 rounded-lg px-3 py-1.5 text-white overflow-hidden cursor-pointer hover:opacity-90 transition-opacity z-10 shadow-sm"
                        style={{
                          backgroundColor: event.color || '#6366f1',
                          top: `${topOffset}px`,
                          minHeight: `${height}px`,
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-sm truncate">{event.title}</span>
                          {eventType && (
                            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                              {eventType.label}
                            </span>
                          )}
                        </div>
                        <div className="text-xs opacity-80 mt-0.5">
                          {formatTime(start)} - {formatTime(end)}
                          {member && <span className="ml-2">{member.name}</span>}
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

function EventModal({ form, setForm, editing, onSave, onClose, onDelete }) {
  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">
            {editing ? 'Editar Evento' : 'Novo Evento'}
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Titulo */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Titulo</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              placeholder="Ex: Reuniao de equipe"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onClose(); }}
            />
          </div>

          {/* Data e Hora - Inicio */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Inicio</label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => updateField('startDate', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hora Inicio</label>
              <input
                type="time"
                value={form.startTime}
                onChange={(e) => updateField('startTime', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Data e Hora - Fim */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data Fim</label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => updateField('endDate', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Hora Fim</label>
              <input
                type="time"
                value={form.endTime}
                onChange={(e) => updateField('endTime', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Responsavel e Tipo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Responsavel</label>
              <select
                value={form.assignee}
                onChange={(e) => updateField('assignee', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              >
                {TEAM_MEMBERS.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select
                value={form.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
              >
                {EVENT_TYPES.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Descricao */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descricao</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm resize-none"
              placeholder="Detalhes do evento..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 flex items-center justify-between">
          <div>
            {editing && (
              <button
                onClick={onDelete}
                className="px-3 py-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
              >
                Excluir
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors text-sm">
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

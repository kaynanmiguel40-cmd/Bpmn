/**
 * AgendaPage — Agenda unificada por pessoa, MESMA cara do comercial (CrmCalendar).
 *
 * Mostra, por pessoa (com filtro pra ver a de qualquer um):
 *  - Tarefas de O.S. COM PRAZO (checklist dueAt) no dia do prazo
 *  - Atividades comerciais (CRM)
 *  - Reunioes / eventos da agenda (locais)
 *  - Google Calendar (quando conectado)
 *
 * Usa o componente CrmCalendar (do modulo CRM) pra ficar identica a agenda do
 * comercial. Nao reimplementa calendario.
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Plus, Link2, Users, Trash2 } from 'lucide-react';
import {
  useAgendaEvents, useCreateAgendaEvent, useUpdateAgendaEvent, useDeleteAgendaEvent,
  useTeamMembers, useOSOrders, useGCalEvents, useGCalStatus,
} from '../../hooks/queries';
import { useProfile } from '../../hooks/useProfile';
import { namesMatch } from '../../lib/kpiUtils';
import { expandRecurrences } from '../../lib/recurrenceUtils';
import { useRealtimeAgendaEvents } from '../../hooks/useRealtimeSubscription';
import { connectGCal } from '../../lib/googleCalendarService';
import CrmCalendar from '../../modules/crm/components/agenda/CrmCalendar';
import { getCrmCalendarActivities } from '../../modules/crm/services/crmAgendaService';
import { useCompleteCrmActivity } from '../../modules/crm/hooks/useCrmQueries';

// Tipos de evento LOCAL (criados direto na agenda).
const EVENT_TYPES = [
  { id: 'meeting', label: 'Reuniao', color: '#3b82f6' },
  { id: 'task', label: 'Tarefa', color: '#22c55e' },
  { id: 'personal', label: 'Pessoal', color: '#64748b' },
];
const typeMeta = (id) => EVENT_TYPES.find(t => t.id === id) || EVENT_TYPES[0];

const pad = (n) => String(n).padStart(2, '0');
const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeStr = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// ==================== MODAL COMPACTO DE EVENTO ====================

function EventModal({ open, initial, members, defaultAssignee, onClose, onSave, onDelete }) {
  const [form, setForm] = useState(null);

  // Inicializa o form quando abre.
  useEffect(() => {
    if (!open) return;
    if (initial?.id) {
      const s = new Date(initial.startDate);
      const e = new Date(initial.endDate || initial.startDate);
      setForm({
        id: initial.id, title: initial.title || '', description: initial.description || '',
        date: toDateStr(s), startTime: toTimeStr(s), endTime: toTimeStr(e),
        type: initial.type || 'meeting', assignee: initial.assignee || defaultAssignee || '',
      });
    } else {
      const base = initial?.date ? new Date(initial.date) : new Date();
      setForm({
        id: null, title: '', description: '',
        date: toDateStr(base), startTime: '09:00', endTime: '10:00',
        type: 'meeting', assignee: defaultAssignee || '',
      });
    }
  }, [open, initial, defaultAssignee]);

  if (!open || !form) return null;
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.title.trim()) return;
    const start = new Date(`${form.date}T${form.startTime}:00`);
    const end = new Date(`${form.date}T${form.endTime}:00`);
    onSave({
      id: form.id,
      title: form.title.trim(),
      description: form.description,
      startDate: start.toISOString(),
      endDate: (end > start ? end : new Date(start.getTime() + 3600000)).toISOString(),
      type: form.type,
      assignee: form.assignee || null,
      color: typeMeta(form.type).color,
    });
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-glass-lg w-full max-w-md border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">{form.id ? 'Editar evento' : 'Novo evento'}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="p-5 space-y-3">
          <input autoFocus value={form.title} onChange={e => set('title', e.target.value)} placeholder="Titulo do evento"
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-fyness-primary" />
          <div className="grid grid-cols-3 gap-2">
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className="col-span-3 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-200 text-sm" />
            <input type="time" value={form.startTime} onChange={e => set('startTime', e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-200 text-sm" />
            <span className="flex items-center justify-center text-slate-400 text-sm">ate</span>
            <input type="time" value={form.endTime} onChange={e => set('endTime', e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-200 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select value={form.type} onChange={e => set('type', e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-200 text-sm">
              {EVENT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
            <select value={form.assignee || ''} onChange={e => set('assignee', e.target.value)} className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-200 text-sm">
              <option value="">Sem responsavel</option>
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descricao (opcional)" rows={2}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 dark:text-slate-200 text-sm resize-none" />
        </div>
        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700">
          {form.id ? (
            <button onClick={() => onDelete(form.id)} className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg"><Trash2 size={15} /> Excluir</button>
          ) : <span />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Cancelar</button>
            <button onClick={save} className="px-4 py-2 text-sm bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary font-medium">Salvar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================

export default function AgendaPage() {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);

  const { data: localEventsRaw = [] } = useAgendaEvents();
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: osOrders = [] } = useOSOrders();
  const { profile } = useProfile();
  const createEvent = useCreateAgendaEvent();
  const updateEvent = useUpdateAgendaEvent();
  const deleteEvent = useDeleteAgendaEvent();
  const completeCrm = useCompleteCrmActivity();
  useRealtimeAgendaEvents();

  // Google Calendar (opcional)
  const { data: gcalStatus } = useGCalStatus();
  const gcalConnected = !!gcalStatus?.id && !gcalStatus?.expired;
  const gMin = useMemo(() => { const d = new Date(today); d.setMonth(d.getMonth() - 2); return d; }, [today]);
  const gMax = useMemo(() => { const d = new Date(today); d.setMonth(d.getMonth() + 4); return d; }, [today]);
  const { data: gcalEvents = [] } = useGCalEvents(gMin, gMax, gcalConnected);

  // Atividades comerciais (CRM)
  const crmStart = useMemo(() => gMin.toISOString(), [gMin]);
  const crmEnd = useMemo(() => gMax.toISOString(), [gMax]);
  const { data: crmActivitiesRaw = [] } = useQuery({
    queryKey: ['agendaCrmActivities', crmStart, crmEnd],
    queryFn: () => getCrmCalendarActivities({ start: crmStart, end: crmEnd }),
    staleTime: 60_000,
  });

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('agenda');
  const [activeFilters, setActiveFilters] = useState(null); // null = ainda nao inicializou
  const [showFilter, setShowFilter] = useState(false);
  const [modal, setModal] = useState(null); // { id?, date? } ou null

  // Membros + perfil logado
  const allMembers = useMemo(() => {
    if (!profile.name) return teamMembers;
    if (teamMembers.some(m => namesMatch(m.name, profile.name))) return teamMembers;
    return [{ id: 'profile_self', name: profile.name, role: profile.role || '', color: '#3b82f6', authUserId: profile.id || null }, ...teamMembers];
  }, [teamMembers, profile]);

  const myMemberId = useMemo(() => {
    if (!profile.name) return null;
    const m = teamMembers.find(mm => namesMatch(mm.name, profile.name));
    return m ? m.id : 'profile_self';
  }, [teamMembers, profile]);

  // Inicia o filtro mostrando SO o meu (padrao: cada um ve a sua agenda).
  const filters = activeFilters ?? (myMemberId ? [myMemberId] : allMembers.map(m => m.id));

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
    const start = new Date(today); start.setMonth(start.getMonth() - 2);
    const end = new Date(today); end.setMonth(end.getMonth() + 4);
    const expanded = expandRecurrences(localEventsRaw, start, end);
    return expanded.map(e => {
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
  }, [localEventsRaw, today]);

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

  // 3) Tarefas de O.S. COM PRAZO (responsavel da O.S.)
  const osTaskEvents = useMemo(() => {
    const out = [];
    for (const os of osOrders) {
      const cl = Array.isArray(os.checklist) ? os.checklist : [];
      const names = [...new Set([
        ...(os.assignee ? [os.assignee] : []),
        ...(os.assignedTo || '').split(',').map(s => s.trim()).filter(Boolean),
      ])];
      const people = names.length ? names : [''];
      const osNum = os.type === 'emergency' ? `EMG-${os.emergencyNumber}` : `#${os.number}`;
      for (const item of cl) {
        if (!item.dueAt || item.done) continue;
        const due = new Date(item.dueAt);
        if (isNaN(due.getTime())) continue;
        people.forEach((personName, idx) => {
          const m = personName ? memberByName(personName) : null;
          out.push({
            id: `ostask_${os.id}_${item.id}_p${idx}`,
            title: `${item.text} · ${osNum}`,
            startDate: due.toISOString(), endDate: new Date(due.getTime() + 30 * 60000).toISOString(),
            color: '#ef4444', source: 'os',
            typeKey: 'task', typeLabel: 'Prazo',
            assignee: m?.id || null, _osId: os.id,
          });
        });
      }
    }
    return out;
  }, [osOrders, memberByName]);

  // 4) Google Calendar
  const googleEvents = useMemo(() => {
    if (!gcalConnected) return [];
    return (gcalEvents || []).filter(g => g.startDate).map(g => ({
      id: `gcal_${g.id}`, title: g.title, startDate: g.startDate, endDate: g.endDate || g.startDate,
      color: g.color || '#94a3b8', source: 'google', isAllDay: g.isAllDay, typeLabel: 'Google',
      htmlLink: g.htmlLink, assignee: null,
    }));
  }, [gcalEvents, gcalConnected]);

  // Junta tudo + filtro por pessoa.
  //  - "Ver todos" -> mostra tudo.
  //  - Pessoa(s) selecionada(s) -> so o que e DAQUELAS pessoas.
  //  - Sem dono resolvido: lead (CRM) e tarefa de O.S. NAO vazam pra agenda
  //    alheia; Google e do usuario logado; evento local sem responsavel aparece.
  const events = useMemo(() => {
    const all = [...localEvents, ...crmEvents, ...osTaskEvents, ...googleEvents];
    const isAll = allMembers.length > 0 && filters.length === allMembers.length;
    return all.filter(e => {
      if (isAll) return true;
      if (e.assignee) return filters.includes(e.assignee);
      if (e.source === 'crm' || e.source === 'os') return false;
      if (e.source === 'google') return !!myMemberId && filters.includes(myMemberId);
      return true; // evento local sem responsavel
    });
  }, [localEvents, crmEvents, osTaskEvents, googleEvents, filters, allMembers, myMemberId]);

  // ===== Navegacao / acoes =====
  const handleNavigate = useCallback((dir) => {
    setCurrentDate(prev => {
      const d = new Date(prev);
      if (view === 'month') d.setMonth(d.getMonth() + dir);
      else if (view === 'week') d.setDate(d.getDate() + dir * 7);
      else if (view === 'agenda') d.setDate(d.getDate() + dir * 30);
      else d.setDate(d.getDate() + dir);
      return d;
    });
  }, [view]);

  const handleSelectEvent = useCallback((ev) => {
    if (ev._osId) { navigate('/financial', { state: { openOsId: ev._osId } }); return; }
    if (ev.source === 'crm') { if (ev._dealId) navigate(`/crm/deals/${ev._dealId}`); return; }
    if (ev.source === 'google') { if (ev.htmlLink) window.open(ev.htmlLink, '_blank', 'noopener'); return; }
    if (ev.source === 'local') setModal({ id: ev._localId, _ev: ev._raw });
  }, [navigate]);

  const handleSelectSlot = useCallback((day) => setModal({ date: day.toISOString() }), []);

  const handleSave = async (data) => {
    if (data.id) await updateEvent.mutateAsync({ id: data.id, updates: data });
    else await createEvent.mutateAsync(data);
    setModal(null);
  };
  const handleDelete = async (id) => { await deleteEvent.mutateAsync(id); setModal(null); };

  const toggleFilter = (id) => {
    setActiveFilters(() => {
      const cur = filters;
      if (cur.includes(id)) {
        const next = cur.filter(x => x !== id);
        return next.length ? next : allMembers.map(m => m.id);
      }
      return [...cur, id];
    });
  };

  const filterLabel = filters.length === allMembers.length ? 'Todos'
    : filters.length === 1 ? (allMembers.find(m => m.id === filters[0])?.name || '1 pessoa')
    : `${filters.length} pessoas`;

  const modalInitial = modal ? (modal.id ? { ...modal._ev, id: modal.id } : { date: modal.date }) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">Agenda</h1>
          <p className="text-xs text-slate-400 dark:text-slate-500">Tarefas com prazo, atividades comerciais e reunioes — por pessoa</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Filtro de pessoa */}
          <div className="relative">
            <button onClick={() => setShowFilter(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Users size={15} /> {filterLabel}
            </button>
            {showFilter && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowFilter(false)} />
                <div className="absolute right-0 mt-1 z-20 w-52 max-h-72 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg p-1.5">
                  <button onClick={() => setActiveFilters(allMembers.map(m => m.id))} className="w-full text-left px-2 py-1.5 text-xs text-fyness-primary hover:bg-slate-50 dark:hover:bg-slate-700 rounded">Ver todos</button>
                  {myMemberId && <button onClick={() => setActiveFilters([myMemberId])} className="w-full text-left px-2 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 rounded">So a minha</button>}
                  <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                  {allMembers.map(m => (
                    <label key={m.id} className="flex items-center gap-2 px-2 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded cursor-pointer">
                      <input type="checkbox" checked={filters.includes(m.id)} onChange={() => toggleFilter(m.id)} className="accent-fyness-primary" />
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color || '#3b82f6' }} />
                      {m.name}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
          {!gcalConnected && (
            <button onClick={() => connectGCal()} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Link2 size={15} /> Google Agenda
            </button>
          )}
          <button onClick={() => setModal({})} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg shadow-sm">
            <Plus size={16} /> Novo evento
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <CrmCalendar
          events={events}
          view={view}
          onViewChange={setView}
          currentDate={currentDate}
          onNavigate={handleNavigate}
          onToday={() => setCurrentDate(new Date())}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onCompleteTask={(ev) => { if (ev._crmActivityId) completeCrm.mutate(ev._crmActivityId); }}
        />
      </div>

      <EventModal
        open={!!modal}
        initial={modalInitial}
        members={allMembers}
        defaultAssignee={myMemberId}
        onClose={() => setModal(null)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}

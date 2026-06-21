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
import { Plus, Link2, Users, Trash2 } from 'lucide-react';
import {
  useCreateAgendaEvent, useUpdateAgendaEvent, useDeleteAgendaEvent,
} from '../../hooks/queries';
import { connectGCalServer } from '../../lib/googleCalendarService';
import CrmCalendar from '../../modules/crm/components/agenda/CrmCalendar';
import { useCompleteCrmActivity } from '../../modules/crm/hooks/useCrmQueries';
import { useAgendaData, EVENT_TYPES, typeMeta, SOURCE_META, DEFAULT_SOURCES } from '../../hooks/useAgendaData';

const pad = (n) => String(n).padStart(2, '0');
const toDateStr = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeStr = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

// Visão (lista/mês/semana) e filtro de pessoa ficam TRAVADOS no que o usuário
// escolheu — sobrevivem a sair e voltar pra agenda (ex.: abrir uma O.S. e voltar).
const AGENDA_VIEW_KEY = 'agenda:view';
const AGENDA_FILTERS_KEY = 'agenda:filters';
const AGENDA_SOURCES_KEY = 'agenda:sources';
const loadView = () => { try { return localStorage.getItem(AGENDA_VIEW_KEY) || 'agenda'; } catch { return 'agenda'; } };
const loadFilters = () => {
  try { const r = JSON.parse(localStorage.getItem(AGENDA_FILTERS_KEY) || 'null'); return Array.isArray(r) && r.length ? r : null; }
  catch { return null; }
};

// Fontes (chips) — constantes vêm do hook compartilhado (useAgendaData).
const loadSources = () => {
  try { const r = JSON.parse(localStorage.getItem(AGENDA_SOURCES_KEY) || 'null'); return r && typeof r === 'object' ? { ...DEFAULT_SOURCES, ...r } : { ...DEFAULT_SOURCES }; }
  catch { return { ...DEFAULT_SOURCES }; }
};

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

  // Dados unificados (membros + eventos das 4 fontes) vêm do hook compartilhado.
  const {
    allMembers, myMemberId,
    localEvents, crmEvents, osTaskEvents, googleEvents,
    gcalConnected,
  } = useAgendaData();

  const createEvent = useCreateAgendaEvent();
  const updateEvent = useUpdateAgendaEvent();
  const deleteEvent = useDeleteAgendaEvent();
  const completeCrm = useCompleteCrmActivity();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState(loadView);
  const [activeFilters, setActiveFilters] = useState(loadFilters); // null = ainda nao inicializou
  const [showFilter, setShowFilter] = useState(false);

  const [sources, setSources] = useState(loadSources);
  const toggleSource = (k) => setSources((s) => ({ ...s, [k]: !s[k] }));

  // Persiste a visão, o filtro e as fontes escolhidas (travam entre navegações).
  useEffect(() => { try { localStorage.setItem(AGENDA_VIEW_KEY, view); } catch {} }, [view]);
  useEffect(() => {
    try {
      if (activeFilters && activeFilters.length) localStorage.setItem(AGENDA_FILTERS_KEY, JSON.stringify(activeFilters));
    } catch {}
  }, [activeFilters]);
  useEffect(() => { try { localStorage.setItem(AGENDA_SOURCES_KEY, JSON.stringify(sources)); } catch {} }, [sources]);
  const [modal, setModal] = useState(null); // { id?, date? } ou null

  // Inicia o filtro mostrando SO o meu (padrao: cada um ve a sua agenda).
  const filters = activeFilters ?? (myMemberId ? [myMemberId] : allMembers.map(m => m.id));

  // Junta tudo + filtro por pessoa.
  //  - Atividade COMERCIAL (CRM) e PRIVADA do dono: so entra na agenda de quem
  //    ela pertence E que esteja no filtro. Nunca vaza pra operacao (ex.: Elias,
  //    que e produto, nao ve cadencia comercial) nem aparece no load inicial.
  //    Sem dono resolvido (lixo de demo/cadencia) = nao aparece pra ninguem.
  //  - "Ver todos" -> mostra o resto (local/O.S./Google) de todo mundo.
  //  - Pessoa(s) selecionada(s) -> so o que e DAQUELAS pessoas.
  //  - Sem dono resolvido: tarefa de O.S. NAO vaza pra agenda alheia; Google e
  //    do usuario logado; evento local sem responsavel aparece.
  const events = useMemo(() => {
    const all = [...localEvents, ...crmEvents, ...osTaskEvents, ...googleEvents];
    // Sem membros carregados (load inicial) -> mostra tudo, senao a agenda some.
    const isAll = allMembers.length === 0 || filters.length === allMembers.length;
    return all.filter(e => {
      // Fonte desligada (chip) -> some.
      if (sources[e.source] === false) return false;
      // Comercial: sempre travado no dono, mesmo no "ver todos" e no load inicial.
      if (e.source === 'crm') return !!e.assignee && filters.includes(e.assignee);
      if (isAll) return true;
      if (e.assignee) return filters.includes(e.assignee);
      if (e.source === 'os') return false;
      if (e.source === 'google') return !!myMemberId && filters.includes(myMemberId);
      return true; // evento local sem responsavel
    });
  }, [localEvents, crmEvents, osTaskEvents, googleEvents, filters, allMembers, myMemberId, sources]);

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
    if (ev._osId) { navigate('/financial', { state: { openOsId: ev._osId, openTaskId: ev._taskId || null } }); return; }
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

  // Memoizado: sem isso, cada re-render de fundo (realtime + refetch do CRM/Google)
  // cria um novo objeto, o efeito de init do EventModal dispara de novo e apaga o
  // que o usuario esta digitando. So muda quando o `modal` realmente abre/troca.
  const modalInitial = useMemo(
    () => (modal ? (modal.id ? { ...modal._ev, id: modal.id } : { date: modal.date }) : null),
    [modal]
  );

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
            <button onClick={() => connectGCalServer().catch(e => alert(e.message || 'Falha ao conectar Google'))} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Link2 size={15} /> Google Agenda
            </button>
          )}
          <button onClick={() => setModal({})} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg shadow-sm">
            <Plus size={16} /> Novo evento
          </button>
        </div>
      </div>

      {/* Filtros de FONTE — liga/desliga o que aparece (mata o ruído de leads/tarefas) */}
      <div className="flex flex-wrap items-center gap-1.5 mb-3">
        <span className="text-[11px] text-slate-400 dark:text-slate-500 mr-0.5">Mostrar:</span>
        {SOURCE_META.map(s => {
          const on = sources[s.key] !== false;
          return (
            <button key={s.key} onClick={() => toggleSource(s.key)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border transition-colors ${on ? 'border-transparent text-white' : 'border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              style={on ? { backgroundColor: s.color } : undefined}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: on ? '#fff' : s.color }} />
              {s.label}
            </button>
          );
        })}
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

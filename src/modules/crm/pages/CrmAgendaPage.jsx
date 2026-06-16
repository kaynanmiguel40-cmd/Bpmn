/**
 * CrmAgendaPage - Agenda do CRM: execução de tarefas + histórico do lead.
 *
 * Layout: calendário (mês/semana/dia) à esquerda + painel lateral com a
 * timeline unificada do lead selecionado à direita. Integra com o Google
 * Calendar de forma bidirecional: as atividades do CRM já são espelhadas
 * pro Google (push, em crmActivitiesService) e aqui também PUXAMOS os
 * eventos do Google (pull, useGCalEvents) pra mostrar junto.
 */

import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Link2, Eye, EyeOff, FileText } from 'lucide-react';
import { CrmPageHeader } from '../components/ui';
import CrmCalendar from '../components/agenda/CrmCalendar';
import LeadHistoryPanel from '../components/agenda/LeadHistoryPanel';
import { ActivityFormModal } from '../components/ActivityFormModal';
import { useCrmCalendarActivities, useCompleteCrmActivity } from '../hooks/useCrmQueries';
import { useGCalEvents, useGCalStatus } from '../../../hooks/queries';
import { connectGCal } from '../../../lib/googleCalendarService';

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

// Recorte de datas que o calendário precisa carregar, por visão.
function computeRange(view, date) {
  if (view === 'agenda') {
    const s = startOfDay(date);
    return [s, addDays(s, 31)]; // lista cobre ~30 dias à frente
  }
  if (view === 'day') {
    const s = startOfDay(date);
    return [s, addDays(s, 1)];
  }
  if (view === 'week') {
    const s = addDays(startOfDay(date), -date.getDay());
    return [s, addDays(s, 7)];
  }
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const s = addDays(startOfDay(first), -first.getDay());
  return [s, addDays(s, 42)]; // matriz de 6 semanas
}

// Chave de dedupe CRM↔Google: título normalizado + minuto de início.
// As atividades do CRM viram eventos no Google com mesmo título/horário —
// sem isso, o pull traria cada atividade de volta como um evento duplicado.
function dedupeKey(title, startDate) {
  const t = (title || '').trim().toLowerCase();
  const ms = startDate ? Math.floor(new Date(startDate).getTime() / 60000) : 0;
  return `${t}|${ms}`;
}

export default function CrmAgendaPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('agenda');
  const [selected, setSelected] = useState(null); // { dealId, contactId }
  const [formOpen, setFormOpen] = useState(false);
  const [formInitial, setFormInitial] = useState(null);
  const [showGoogle, setShowGoogle] = useState(true); // camada Google Agenda visível

  const [rangeStart, rangeEnd] = useMemo(() => computeRange(view, currentDate), [view, currentDate]);
  const startISO = rangeStart.toISOString();
  const endISO = rangeEnd.toISOString();

  // Atividades do CRM no recorte
  const { data: crmActivities = [] } = useCrmCalendarActivities(startISO, endISO);
  const completeMutation = useCompleteCrmActivity();

  // Google Calendar (pull). Só dispara se conectado.
  const { data: gcalStatus } = useGCalStatus();
  const gcalConnected = !!gcalStatus?.id && !gcalStatus?.expired;
  const { data: gcalEvents = [] } = useGCalEvents(rangeStart, rangeEnd, gcalConnected);

  // Mescla CRM + Google, deduplicando o que o CRM já espelhou pro Google.
  const events = useMemo(() => {
    const crm = crmActivities.map(a => ({
      id: `crm_${a.id}`,
      title: a.title,
      startDate: a.startDate,
      endDate: a.endDate,
      color: a.color,
      source: 'crm',
      typeKey: a.type,
      activityId: a.id,
      leadName: a.leadName,
      stageName: a.stageName,
      completed: a.completed,
      completedAt: a.completedAt,
      typeLabel: a.typeLabel,
      dealId: a.dealId,
      contactId: a.contactId,
      leadKey: `${a.dealId || ''}:${a.contactId || ''}`,
    }));
    if (!gcalConnected || !showGoogle || gcalEvents.length === 0) return crm;

    const seen = new Set(crm.map(e => dedupeKey(e.title, e.startDate)));
    const google = gcalEvents
      .filter(g => g.startDate && !seen.has(dedupeKey(g.title, g.startDate)))
      .map(g => ({
        id: `gcal_${g.id}`,
        title: g.title,
        startDate: g.startDate,
        endDate: g.endDate,
        color: g.color || '#64748b',
        source: 'google',
        isAllDay: g.isAllDay,
        typeLabel: 'Google',
        htmlLink: g.htmlLink,
        leadKey: null,
      }));
    return [...crm, ...google];
  }, [crmActivities, gcalEvents, gcalConnected, showGoogle]);

  // Navegação do calendário
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
    if (ev.source === 'google') {
      if (ev.htmlLink) window.open(ev.htmlLink, '_blank', 'noopener');
      return;
    }
    if (ev.dealId || ev.contactId) {
      setSelected({ dealId: ev.dealId || null, contactId: ev.contactId || null });
    }
  }, []);

  // Clicar num dia vazio: abre o form de nova tarefa já naquela data (09h)
  const handleSelectSlot = useCallback((day) => {
    const d = new Date(day);
    d.setHours(9, 0, 0, 0);
    setFormInitial({ startDate: d.toISOString() });
    setFormOpen(true);
  }, []);

  const openNewTask = () => { setFormInitial(null); setFormOpen(true); };

  const selectedLeadKey = selected ? `${selected.dealId || ''}:${selected.contactId || ''}` : null;

  return (
    <div className="h-full flex flex-col">
      <CrmPageHeader
        title="Agenda"
        subtitle="Execução de tarefas e histórico de cada lead em calendário"
        actions={
          <div className="flex items-center gap-2">
            {!gcalConnected && (
              <button onClick={() => connectGCal()}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200/70 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
                <Link2 size={15} /> Conectar Google Agenda
              </button>
            )}
            {gcalConnected && (
              <button
                onClick={() => setShowGoogle(v => !v)}
                title={showGoogle ? 'Ocultar eventos do Google Agenda' : 'Mostrar eventos do Google Agenda'}
                className={`flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors ${
                  showGoogle
                    ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40'
                    : 'text-slate-400 dark:text-slate-500 border-slate-200/70 dark:border-white/10 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {showGoogle ? <Eye size={14} /> : <EyeOff size={14} />} Google Agenda
              </button>
            )}
            <button onClick={() => navigate('/crm/relatorio-diario')}
              title="Relatório diário dos leads atendidos"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200/70 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
              <FileText size={15} /> Relatório do dia
            </button>
            <button onClick={openNewTask}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg shadow-sm">
              <Plus size={16} /> Nova tarefa
            </button>
          </div>
        }
      />

      <div className="flex-1 flex gap-3 min-h-0">
        <div className="flex-1 min-w-0">
          <CrmCalendar
            events={events}
            view={view}
            onViewChange={setView}
            currentDate={currentDate}
            onNavigate={handleNavigate}
            onToday={() => setCurrentDate(new Date())}
            onSelectEvent={handleSelectEvent}
            onSelectSlot={handleSelectSlot}
            onCompleteTask={(ev) => ev.activityId && completeMutation.mutate(ev.activityId)}
            selectedLeadKey={selectedLeadKey}
          />
        </div>

        {selected && (
          <aside className="w-[360px] shrink-0 crm-glass rounded-2xl overflow-hidden hidden lg:block">
            <LeadHistoryPanel
              selected={selected}
              onClose={() => setSelected(null)}
              onOpenLead={(lead) => lead.dealId && navigate(`/crm/deals/${lead.dealId}`)}
            />
          </aside>
        )}
      </div>

      <ActivityFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setFormInitial(null); }}
        activity={formInitial}
      />
    </div>
  );
}

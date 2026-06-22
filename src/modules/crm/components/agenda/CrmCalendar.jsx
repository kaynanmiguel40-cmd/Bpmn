/**
 * CrmCalendar - Calendario do CRM (mes / semana / dia).
 *
 * Mostra os eventos ja unificados (atividades do CRM + Google Calendar) que o
 * pai passa. Nao busca dados: e puramente apresentacional + navegacao.
 * Clicar num evento chama onSelectEvent; clicar num dia vazio, onSelectSlot.
 */

import { useMemo } from 'react';
import {
  ChevronLeft, ChevronRight, Check, Circle, CheckCircle2,
  Phone, Mail, MessageCircle, Users, MapPin, CheckSquare, Coffee, ArrowRight, CalendarClock,
} from 'lucide-react';
import { scheduleTiming } from '../../services/crmAgendaService';

// Toda atividade (CRM ou Google) é desenhada como bloco. Itens do CRM podem ser
// concluídos: o botão "concluir" aparece no hover; concluído fica riscado + cinza.

// Chip "previsto vs realizado" — verde no horário, âmbar atrasou, azul adiantou
const TIMING_CLASS = {
  on_time: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20',
  late: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20',
  early: 'text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-900/20',
};

// Icone por tipo de atividade — comunica o tipo SEM depender so da cor
// (acessibilidade). Eventos do Google usam um icone de calendario proprio.
const TYPE_ICON = {
  call: Phone, email: Mail, message: MessageCircle, meeting: Users,
  visit: MapPin, task: CheckSquare, lunch: Coffee, follow_up: ArrowRight,
};
const iconFor = (ev) => (ev.source === 'google' ? CalendarClock : (TYPE_ICON[ev.typeKey] || Circle));

const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// ==================== HELPERS DE DATA ====================

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const toKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

function monthMatrix(date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = addDays(first, -first.getDay()); // volta pro domingo
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

function weekDays(date) {
  const start = addDays(startOfDay(date), -date.getDay());
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// ==================== CHIP DE EVENTO ====================

function EventChip({ ev, onClick, onCompleteTask, dimmed }) {
  const isGoogle = ev.source === 'google';
  const isCrm = ev.source === 'crm';
  const Icon = iconFor(ev);
  const label = ev.leadName && isCrm ? ev.leadName : ev.title;

  // Tudo é bloco. Itens do CRM podem ser concluídos (botão no hover).
  return (
    <div
      className={`group/chip w-full flex items-center gap-1 rounded-md pl-1 pr-1 py-1 transition-colors duration-150
        ${dimmed ? 'opacity-30 hover:opacity-100' : ''}
        ${isGoogle
          ? 'border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/60 dark:bg-slate-800/30 hover:border-slate-400'
          : 'border-l-2 bg-white/80 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
      style={isGoogle ? undefined : { borderLeftColor: ev.color }}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onClick?.(ev); }}
        title={`${ev.startDate ? fmtTime(ev.startDate) + ' · ' : ''}${ev.title}${ev.leadName ? ` — ${ev.leadName}` : ''}${isGoogle ? ' (Google Agenda)' : ''}`}
        className="flex-1 min-w-0 flex items-center gap-1 text-left cursor-pointer"
      >
        {ev.completed
          ? <Check size={11} className="shrink-0" style={{ color: ev.color }} />
          : <Icon size={11} className="shrink-0" style={{ color: isGoogle ? '#94a3b8' : ev.color }} />}
        {ev.startDate && !ev.isAllDay && (
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">{fmtTime(ev.startDate)}</span>
        )}
        <span className={`truncate text-[11px] ${ev.completed ? 'line-through text-slate-400 dark:text-slate-500' : isGoogle ? 'text-slate-500 dark:text-slate-400 italic' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
          {label}
        </span>
      </button>
      {isCrm && !ev.completed && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onCompleteTask?.(ev); }}
          title="Marcar como concluída"
          className="shrink-0 opacity-0 group-hover/chip:opacity-100 transition-opacity text-slate-300 dark:text-slate-600 hover:text-emerald-500"
        >
          <CheckCircle2 size={12} />
        </button>
      )}
    </div>
  );
}

// ==================== VIEWS ====================

function MonthView({ current, eventsByDay, onSelectEvent, onSelectSlot, onCompleteTask, selectedLeadKey }) {
  const today = new Date();
  const cells = useMemo(() => monthMatrix(current), [current]);
  const month = current.getMonth();

  return (
    <div className="grid grid-cols-7 flex-1 min-h-0 rounded-xl overflow-hidden border border-slate-200/70 dark:border-white/10">
      {DOW.map(d => (
        <div key={d} className="px-2 py-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/70 dark:border-white/10 text-center">
          {d}
        </div>
      ))}
      {cells.map((day, i) => {
        const key = toKey(day);
        const dayEvents = eventsByDay.get(key) || [];
        const inMonth = day.getMonth() === month;
        const isToday = isSameDay(day, today);
        const shown = dayEvents.slice(0, 4);
        const extra = dayEvents.length - shown.length;
        return (
          <div
            key={i}
            onClick={() => onSelectSlot?.(day)}
            className={`min-h-[92px] p-1 border-b border-r border-slate-200/60 dark:border-white/5 last:border-r-0 cursor-pointer transition-colors
              ${inMonth ? 'bg-white/40 dark:bg-transparent' : 'bg-slate-50/60 dark:bg-slate-900/40'}
              hover:bg-fyness-primary/5 dark:hover:bg-white/5 ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}`}
          >
            <div className="flex items-center justify-between px-1">
              <span className={`text-[11px] font-medium w-5 h-5 flex items-center justify-center rounded-full
                ${isToday ? 'bg-fyness-primary text-white' : inMonth ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>
                {day.getDate()}
              </span>
            </div>
            <div className="mt-0.5 space-y-0.5">
              {shown.map(ev => (
                <EventChip key={ev.id} ev={ev} onClick={onSelectEvent} onCompleteTask={onCompleteTask}
                  dimmed={!!selectedLeadKey && ev.leadKey !== selectedLeadKey} />
              ))}
              {extra > 0 && <div className="text-[10px] text-slate-400 dark:text-slate-500 pl-1">+{extra} mais</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function WeekView({ current, eventsByDay, onSelectEvent, onSelectSlot, onCompleteTask, selectedLeadKey }) {
  const today = new Date();
  const days = useMemo(() => weekDays(current), [current]);
  return (
    <div className="grid grid-cols-7 flex-1 min-h-0 gap-2 overflow-y-auto">
      {days.map((day, i) => {
        const key = toKey(day);
        const dayEvents = eventsByDay.get(key) || [];
        const isToday = isSameDay(day, today);
        return (
          <div key={i} onClick={() => onSelectSlot?.(day)}
            className="flex flex-col rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/40 dark:bg-slate-900/30 overflow-hidden cursor-pointer hover:border-fyness-primary/30">
            <div className={`px-2 py-1.5 text-center border-b border-slate-200/70 dark:border-white/10 ${isToday ? 'bg-fyness-primary/10' : 'bg-slate-50/60 dark:bg-slate-800/40'}`}>
              <div className="text-[10px] uppercase text-slate-400 dark:text-slate-500">{DOW[day.getDay()]}</div>
              <div className={`text-sm font-semibold ${isToday ? 'text-fyness-primary' : 'text-slate-700 dark:text-slate-200'}`}>{day.getDate()}</div>
            </div>
            <div className="flex-1 p-1 space-y-0.5 min-h-[120px]">
              {dayEvents.length === 0 && <div className="text-[10px] text-slate-300 dark:text-slate-600 text-center pt-3">—</div>}
              {dayEvents.map(ev => (
                <EventChip key={ev.id} ev={ev} onClick={onSelectEvent} onCompleteTask={onCompleteTask}
                  dimmed={!!selectedLeadKey && ev.leadKey !== selectedLeadKey} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({ current, eventsByDay, onSelectEvent, onCompleteTask, selectedLeadKey }) {
  const key = toKey(current);
  const dayEvents = eventsByDay.get(key) || [];
  return (
    <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/40 dark:bg-slate-900/30 p-3">
      {dayEvents.length === 0 ? (
        <div className="text-center text-sm text-slate-400 dark:text-slate-500 py-12">Nenhuma atividade neste dia.</div>
      ) : (
        <div className="space-y-1.5 max-w-2xl mx-auto">
          {dayEvents.map(ev => {
            const isCrm = ev.source === 'crm';
            return (
            <div key={ev.id} className="group/day flex items-stretch gap-3">
              <div className="w-14 shrink-0 text-right text-[11px] font-medium text-slate-500 dark:text-slate-400 pt-2 tabular-nums">
                {ev.isAllDay || !ev.startDate ? 'dia' : fmtTime(ev.startDate)}
              </div>
              <div className="w-1 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
              <button
                onClick={() => onSelectEvent?.(ev)}
                className={`flex-1 text-left rounded-lg px-3 py-2 border border-slate-200/70 dark:border-white/10 hover:border-fyness-primary/40 hover:bg-fyness-primary/5 transition-colors
                  ${!!selectedLeadKey && ev.leadKey !== selectedLeadKey ? 'opacity-40' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${ev.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                    {ev.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${ev.color}22`, color: ev.color }}>{ev.typeLabel}</span>
                  {ev.source === 'google' && <span className="text-[10px] text-slate-400 dark:text-slate-500">Google</span>}
                </div>
                {ev.leadName && ev.source === 'crm' && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ev.leadName}</div>}
              </button>
              {isCrm && (
                <button type="button" onClick={(e) => { e.stopPropagation(); if (!ev.completed) onCompleteTask?.(ev); }}
                  title={ev.completed ? 'Concluída' : 'Marcar como concluída'}
                  className={`shrink-0 self-center cursor-pointer transition-opacity ${ev.completed ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600 opacity-0 group-hover/day:opacity-100 hover:text-emerald-500'}`}>
                  <CheckCircle2 size={18} />
                </button>
              )}
            </div>
          );})}
        </div>
      )}
    </div>
  );
}

// ==================== AGENDA (LISTA) ====================

const sameDay = (a, b) => isSameDay(a, b);
function dayHeading(date) {
  const today = new Date();
  if (sameDay(date, today)) return 'Hoje';
  if (sameDay(date, addDays(today, 1))) return 'Amanhã';
  if (sameDay(date, addDays(today, -1))) return 'Ontem';
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' });
}

function AgendaRow({ ev, onClick, onCompleteTask, dimmed }) {
  const isGoogle = ev.source === 'google';
  const isCrm = ev.source === 'crm';
  const Icon = iconFor(ev);
  const label = ev.leadName && isCrm ? ev.leadName : ev.title;
  const sub = [ev.typeLabel, ev.stageName].filter(Boolean).join(' · ');
  // Previsto = o FIM agendado (prazo da tarefa), não o início. Sem fim, cai no início.
  const timing = !isGoogle && ev.completed && ev.completedAt ? scheduleTiming(ev.endDate || ev.startDate, ev.completedAt) : null;
  return (
    <div className={`group/row w-full flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors
        hover:bg-slate-50 dark:hover:bg-white/5 ${dimmed ? 'opacity-30 hover:opacity-100' : ''}`}>
      <span className="w-12 shrink-0 text-sm font-semibold tabular-nums text-slate-600 dark:text-slate-300">
        {ev.isAllDay || !ev.startDate ? '—' : fmtTime(ev.startDate)}
      </span>
      {/* Ícone do tipo (vira ✓ quando concluído) */}
      <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: isGoogle ? 'transparent' : `${ev.color}1a`, border: isGoogle ? '1px dashed #94a3b8' : 'none' }}>
        {ev.completed
          ? <Check size={16} style={{ color: ev.color }} />
          : <Icon size={15} style={{ color: isGoogle ? '#94a3b8' : ev.color }} />}
      </span>
      <button type="button" onClick={() => onClick?.(ev)} className="flex-1 min-w-0 text-left cursor-pointer">
        <div className={`text-sm truncate ${ev.completed ? 'line-through text-slate-400 dark:text-slate-500' : isGoogle ? 'text-slate-500 dark:text-slate-400 italic' : 'text-slate-800 dark:text-slate-100 font-medium'}`}>
          {label}
        </div>
        <div className="text-xs text-slate-400 dark:text-slate-500 truncate">{isGoogle ? 'Google Agenda' : sub}</div>
        {timing && (
          <div className="flex items-center gap-1.5 mt-1 text-[11px] flex-wrap">
            <span className="text-slate-400 dark:text-slate-500 tabular-nums">
              Previsto {fmtTime(ev.endDate || ev.startDate)} · feito {fmtTime(ev.completedAt)}
            </span>
            <span className={`px-1.5 py-px rounded-full font-medium ${TIMING_CLASS[timing.state]}`}>{timing.label}</span>
          </div>
        )}
      </button>
      {/* Concluir — aparece no hover (itens do CRM ainda não concluídos) */}
      {isCrm && !ev.completed && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onCompleteTask?.(ev); }}
          title="Marcar como concluída"
          className="shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity text-slate-300 dark:text-slate-600 hover:text-emerald-500">
          <CheckCircle2 size={20} />
        </button>
      )}
    </div>
  );
}

function AgendaListView({ current, eventsByDay, onSelectEvent, onCompleteTask, selectedLeadKey }) {
  const days = useMemo(() => {
    const out = [];
    for (let i = 0; i < 31; i++) {
      const d = addDays(startOfDay(current), i);
      const evs = eventsByDay.get(toKey(d));
      if (evs && evs.length) out.push({ date: d, events: evs });
    }
    return out;
  }, [current, eventsByDay]);

  if (days.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-center text-sm text-slate-400 dark:text-slate-500">
        Nenhuma atividade nos próximos 30 dias.
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="max-w-3xl mx-auto pb-4">
        {days.map(({ date, events }) => (
          <section key={toKey(date)} className="mb-1">
            <div className="sticky top-0 z-10 bg-white/85 dark:bg-slate-900/80 backdrop-blur px-3 py-1.5 mb-0.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 capitalize">{dayHeading(date)}</span>
              <span className="ml-2 text-[11px] text-slate-400 dark:text-slate-500">{events.length} {events.length === 1 ? 'item' : 'itens'}</span>
            </div>
            {events.map(ev => (
              <AgendaRow key={ev.id} ev={ev} onClick={onSelectEvent} onCompleteTask={onCompleteTask}
                dimmed={!!selectedLeadKey && ev.leadKey !== selectedLeadKey} />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================

const VIEWS = [{ id: 'agenda', label: 'Lista' }, { id: 'month', label: 'Mês' }, { id: 'week', label: 'Semana' }, { id: 'day', label: 'Dia' }];

export default function CrmCalendar({
  events = [],
  view = 'month',
  onViewChange,
  currentDate,
  onNavigate,
  onToday,
  onSelectEvent,
  onSelectSlot,
  onCompleteTask,
  selectedLeadKey,
}) {
  // Indexa eventos por dia (uma vez). Eventos sem data sao ignorados.
  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const ev of events) {
      if (!ev.startDate) continue;
      const k = toKey(new Date(ev.startDate));
      if (!map.has(k)) map.set(k, []);
      map.get(k).push(ev);
    }
    // Ordena cada dia por horario
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    }
    return map;
  }, [events]);

  const title = useMemo(() => {
    if (view === 'agenda') return `A partir de ${currentDate.getDate()} de ${MONTHS[currentDate.getMonth()]}`;
    if (view === 'month') return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (view === 'week') {
      const w = weekDays(currentDate);
      const a = w[0], b = w[6];
      return `${a.getDate()}/${a.getMonth() + 1} – ${b.getDate()}/${b.getMonth() + 1} · ${b.getFullYear()}`;
    }
    return `${currentDate.getDate()} de ${MONTHS[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;
  }, [view, currentDate]);

  // Legenda só com os tipos que aparecem na tela (menos ruído que listar todos)
  const legend = useMemo(() => {
    const types = new Map();
    let hasGoogle = false;
    for (const ev of events) {
      if (ev.source === 'google') { hasGoogle = true; continue; }
      if (ev.typeKey && !types.has(ev.typeKey)) {
        types.set(ev.typeKey, { key: ev.typeKey, label: ev.typeLabel, color: ev.color });
      }
    }
    return { types: [...types.values()], hasGoogle };
  }, [events]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={onToday} className="px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200/70 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">Hoje</button>
          <div className="flex items-center">
            <button onClick={() => onNavigate?.(-1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400"><ChevronLeft size={18} /></button>
            <button onClick={() => onNavigate?.(1)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400"><ChevronRight size={18} /></button>
          </div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 capitalize">{title}</h2>
        </div>
        <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/60">
          {VIEWS.map(v => (
            <button key={v.id} onClick={() => onViewChange?.(v.id)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${view === v.id ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
              {v.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'agenda' && <AgendaListView current={currentDate} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onCompleteTask={onCompleteTask} selectedLeadKey={selectedLeadKey} />}
      {view === 'month' && <MonthView current={currentDate} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onSelectSlot={onSelectSlot} onCompleteTask={onCompleteTask} selectedLeadKey={selectedLeadKey} />}
      {view === 'week' && <WeekView current={currentDate} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onSelectSlot={onSelectSlot} onCompleteTask={onCompleteTask} selectedLeadKey={selectedLeadKey} />}
      {view === 'day' && <DayView current={currentDate} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onCompleteTask={onCompleteTask} selectedLeadKey={selectedLeadKey} />}

      {/* Legenda — explica as cores/ícones e separa CRM de Google */}
      {(legend.types.length > 0 || legend.hasGoogle) && (
        <div className="flex items-center gap-x-4 gap-y-1.5 flex-wrap mt-3 pt-2.5 border-t border-slate-200/60 dark:border-white/5">
          {legend.types.map(t => {
            const Icon = TYPE_ICON[t.key] || Circle;
            return (
              <span key={t.key} className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Icon size={13} style={{ color: t.color }} /> {t.label}
              </span>
            );
          })}
          {legend.hasGoogle && (
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 sm:ml-auto">
              <span className="inline-block w-4 h-3 rounded border border-dashed border-slate-400 dark:border-slate-500 bg-slate-50/60 dark:bg-slate-800/30" />
              <CalendarClock size={13} className="text-slate-400" /> do Google Agenda
            </span>
          )}
        </div>
      )}
    </div>
  );
}

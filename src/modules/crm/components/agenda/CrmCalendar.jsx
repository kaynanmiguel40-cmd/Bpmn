/**
 * CrmCalendar - Calendario do CRM (mes / semana / dia).
 *
 * Mostra os eventos ja unificados (atividades do CRM + Google Calendar) que o
 * pai passa. Nao busca dados: e puramente apresentacional + navegacao.
 * Clicar num evento chama onSelectEvent; clicar num dia vazio, onSelectSlot.
 */

import { useMemo } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

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

function EventChip({ ev, onClick, dimmed, compact }) {
  const isGoogle = ev.source === 'google';
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(ev); }}
      title={`${ev.startDate ? fmtTime(ev.startDate) + ' · ' : ''}${ev.title}${ev.leadName ? ` — ${ev.leadName}` : ''}`}
      className={`group w-full flex items-center gap-1.5 rounded-md px-1.5 py-1 text-left transition-all
        ${dimmed ? 'opacity-35 hover:opacity-100' : ''}
        ${isGoogle ? 'border border-dashed' : ''}
        hover:ring-1 hover:ring-fyness-primary/40`}
      style={{
        backgroundColor: isGoogle ? 'transparent' : `${ev.color}1a`,
        borderColor: isGoogle ? `${ev.color}66` : undefined,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: ev.color }} />
      {!compact && ev.startDate && !ev.isAllDay && (
        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">{fmtTime(ev.startDate)}</span>
      )}
      <span className={`truncate text-[11px] ${ev.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-700 dark:text-slate-200'}`}>
        {ev.completed && <Check size={9} className="inline mr-0.5 -mt-0.5" />}
        {ev.leadName && ev.source === 'crm' ? <span className="font-medium">{ev.leadName}</span> : ev.title}
      </span>
    </button>
  );
}

// ==================== VIEWS ====================

function MonthView({ current, eventsByDay, onSelectEvent, onSelectSlot, selectedLeadKey }) {
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
                <EventChip key={ev.id} ev={ev} onClick={onSelectEvent}
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

function WeekView({ current, eventsByDay, onSelectEvent, onSelectSlot, selectedLeadKey }) {
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
                <EventChip key={ev.id} ev={ev} onClick={onSelectEvent}
                  dimmed={!!selectedLeadKey && ev.leadKey !== selectedLeadKey} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DayView({ current, eventsByDay, onSelectEvent, selectedLeadKey }) {
  const key = toKey(current);
  const dayEvents = eventsByDay.get(key) || [];
  return (
    <div className="flex-1 min-h-0 overflow-y-auto rounded-xl border border-slate-200/70 dark:border-white/10 bg-white/40 dark:bg-slate-900/30 p-3">
      {dayEvents.length === 0 ? (
        <div className="text-center text-sm text-slate-400 dark:text-slate-500 py-12">Nenhuma atividade neste dia.</div>
      ) : (
        <div className="space-y-1.5 max-w-2xl mx-auto">
          {dayEvents.map(ev => (
            <div key={ev.id} className="flex items-stretch gap-3">
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
                    {ev.completed && <Check size={12} className="inline mr-1 text-emerald-500" />}{ev.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${ev.color}22`, color: ev.color }}>{ev.typeLabel}</span>
                  {ev.source === 'google' && <span className="text-[10px] text-slate-400 dark:text-slate-500">Google</span>}
                </div>
                {ev.leadName && ev.source === 'crm' && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ev.leadName}</div>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== COMPONENTE PRINCIPAL ====================

const VIEWS = [{ id: 'month', label: 'Mês' }, { id: 'week', label: 'Semana' }, { id: 'day', label: 'Dia' }];

export default function CrmCalendar({
  events = [],
  view = 'month',
  onViewChange,
  currentDate,
  onNavigate,
  onToday,
  onSelectEvent,
  onSelectSlot,
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
    if (view === 'month') return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    if (view === 'week') {
      const w = weekDays(currentDate);
      const a = w[0], b = w[6];
      return `${a.getDate()}/${a.getMonth() + 1} – ${b.getDate()}/${b.getMonth() + 1} · ${b.getFullYear()}`;
    }
    return `${currentDate.getDate()} de ${MONTHS[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;
  }, [view, currentDate]);

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

      {view === 'month' && <MonthView current={currentDate} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onSelectSlot={onSelectSlot} selectedLeadKey={selectedLeadKey} />}
      {view === 'week' && <WeekView current={currentDate} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onSelectSlot={onSelectSlot} selectedLeadKey={selectedLeadKey} />}
      {view === 'day' && <DayView current={currentDate} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} selectedLeadKey={selectedLeadKey} />}
    </div>
  );
}

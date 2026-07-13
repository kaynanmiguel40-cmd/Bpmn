/**
 * CrmCalendar - Calendario do CRM (mes / semana / dia).
 *
 * Mostra os eventos ja unificados (atividades do CRM + Google Calendar) que o
 * pai passa. Nao busca dados: e puramente apresentacional + navegacao.
 * Clicar num evento chama onSelectEvent; clicar num dia vazio, onSelectSlot.
 */

import { useMemo, useState, useEffect } from 'react';
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
// Início–fim legível. endDate é opcional pra tipos pontuais (ligação/mensagem)
// — sem fim real, mostra só o início em vez de repetir o mesmo horário 2x.
const fmtRange = (startIso, endIso) => {
  if (!startIso) return null;
  const start = fmtTime(startIso);
  if (!endIso) return start;
  const end = fmtTime(endIso);
  return end === start ? start : `${start}–${end}`;
};

function monthMatrix(date) {
  const first = new Date(date.getFullYear(), date.getMonth(), 1);
  const start = addDays(first, -first.getDay()); // volta pro domingo
  return Array.from({ length: 42 }, (_, i) => addDays(start, i));
}

function weekDays(date) {
  const start = addDays(startOfDay(date), -date.getDay());
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

// ==================== BADGE DE DONO ====================

// Só aparece na visão "Todos os vendedores" (showOwner) — numa agenda de uma
// pessoa só o dono já é óbvio pelo contexto, então mostrar sempre seria ruído.
// Sem isso, um admin em "Todos" podia concluir a tarefa errada sem perceber
// de quem era (achado do audit de usabilidade).
function OwnerBadge({ name, color, size = 15 }) {
  if (!name) return null;
  return (
    <span
      title={name}
      className="shrink-0 rounded-full flex items-center justify-center text-white font-bold leading-none"
      style={{ backgroundColor: color || '#94a3b8', width: size, height: size, fontSize: Math.max(8, Math.round(size * 0.55)) }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

// ==================== CHIP DE EVENTO ====================

function EventChip({ ev, onClick, onCompleteTask, dimmed, showOwner }) {
  const isGoogle = ev.source === 'google';
  const isCrm = ev.source === 'crm';
  const Icon = iconFor(ev);
  const label = ev.leadName && isCrm ? ev.leadName : ev.title;

  // Tudo é bloco. Itens do CRM podem ser concluídos (botão sempre visível).
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
        title={`${ev.startDate && !ev.isAllDay ? fmtRange(ev.startDate, ev.endDate) + ' · ' : ''}${ev.title}${ev.leadName ? ` — ${ev.leadName}` : ''}${isGoogle ? ' (Google Agenda)' : ''}`}
        className="flex-1 min-w-0 flex items-center gap-1 text-left cursor-pointer"
      >
        {ev.completed
          ? <Check size={11} className="shrink-0" style={{ color: ev.color }} />
          : <Icon size={11} className="shrink-0" style={{ color: isGoogle ? '#94a3b8' : ev.color }} />}
        {ev.startDate && !ev.isAllDay && (
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">{fmtTime(ev.startDate)}</span>
        )}
        <span className={`flex-1 min-w-0 truncate text-[11px] ${ev.completed ? 'line-through text-slate-400 dark:text-slate-500' : isGoogle ? 'text-slate-500 dark:text-slate-400 italic' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
          {label}
        </span>
        {showOwner && isCrm && ev.assignedToName && <OwnerBadge name={ev.assignedToName} color={ev.assignedToColor} size={13} />}
      </button>
      {isCrm && !ev.completed && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onCompleteTask?.(ev); }}
          title="Marcar como concluída"
          className="shrink-0 text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors"
        >
          <CheckCircle2 size={12} />
        </button>
      )}
    </div>
  );
}

// ==================== VIEWS ====================

function MonthView({ current, eventsByDay, onSelectEvent, onSelectSlot, onShowDay, onCompleteTask, selectedLeadKey, showOwner }) {
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
                  dimmed={!!selectedLeadKey && ev.leadKey !== selectedLeadKey} showOwner={showOwner} />
              ))}
              {extra > 0 && (
                // Handler próprio + stopPropagation: sem isso o clique cai no
                // onClick da célula (abre "nova tarefa") em vez de mostrar os
                // itens do dia — "+N mais" parecia link mas não fazia nada.
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onShowDay?.(day); }}
                  className="w-full text-left text-[10px] text-slate-400 dark:text-slate-500 hover:text-fyness-primary hover:underline pl-1 cursor-pointer"
                >
                  +{extra} mais
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==================== GRADE DE HORÁRIO (Semana / Dia) ====================
//
// Antes Semana/Dia eram só uma lista de chips em sequência, sem eixo de
// horário — dava pra ver A ORDEM das tarefas mas não ONDE elas caíam no dia
// nem quanto elas duravam (achado de usabilidade: "difícil entender início
// e fim"). Agora é uma grade de verdade: posição vertical = horário,
// altura do bloco = duração — igual Google Calendar/Outlook.

const GRID_HOUR_PX = 56; // altura de 1h na grade
const GRID_MIN_PX = GRID_HOUR_PX / 60;
const GRID_DEFAULT_START_H = 6;
const GRID_DEFAULT_END_H = 22;
const GRID_MIN_BLOCK_MIN = 28; // altura mínima (em "minutos equivalentes") pra tarefa curta/pontual não virar um traço

const minutesOfDay = (iso) => { const d = new Date(iso); return d.getHours() * 60 + d.getMinutes(); };

/** Intervalo de horas a desenhar: cobre 6h-22h, mas se estica se algum evento cair fora disso. */
function computeGridHours(dayGroups) {
  let startH = GRID_DEFAULT_START_H;
  let endH = GRID_DEFAULT_END_H;
  for (const evs of dayGroups) {
    for (const ev of evs) {
      if (ev.isAllDay || !ev.startDate) continue;
      const startMin = minutesOfDay(ev.startDate);
      const endMin = ev.endDate ? minutesOfDay(ev.endDate) : startMin + GRID_MIN_BLOCK_MIN;
      startH = Math.min(startH, Math.floor(startMin / 60));
      endH = Math.max(endH, Math.ceil(endMin / 60));
    }
  }
  return { startH, endH };
}

/**
 * Agrupa eventos que se sobrepõem em "clusters" e, dentro de cada um,
 * atribui coluna (coloração gulosa de grafo de intervalo) — pra tarefas no
 * mesmo horário ficarem lado a lado em vez de uma em cima da outra.
 */
function layoutOverlaps(dayEvents) {
  const items = dayEvents
    .filter(ev => !ev.isAllDay && ev.startDate)
    .map(ev => {
      const startMin = minutesOfDay(ev.startDate);
      const endMin = ev.endDate ? Math.max(minutesOfDay(ev.endDate), startMin + 15) : startMin + GRID_MIN_BLOCK_MIN;
      return { ev, startMin, endMin, col: 0, cols: 1 };
    })
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin);

  let clusterStart = 0;
  for (let i = 0; i < items.length; i++) {
    const clusterSoFar = items.slice(clusterStart, i + 1);
    const clusterEnd = Math.max(...clusterSoFar.map(x => x.endMin));
    const isLast = i === items.length - 1;
    if (isLast || items[i + 1].startMin >= clusterEnd) {
      const colEnds = [];
      for (const item of clusterSoFar) {
        let col = colEnds.findIndex(end => item.startMin >= end);
        if (col === -1) { col = colEnds.length; colEnds.push(item.endMin); }
        else colEnds[col] = item.endMin;
        item.col = col;
      }
      for (const item of clusterSoFar) item.cols = colEnds.length;
      clusterStart = i + 1;
    }
  }
  return items;
}

// Linha vermelha marcando "agora" — só no dia de hoje, só dentro do range visível.
function NowLine({ startH, endH }) {
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick(n => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);
  const now = new Date();
  const min = now.getHours() * 60 + now.getMinutes();
  if (min < startH * 60 || min > endH * 60) return null;
  const top = (min - startH * 60) * GRID_MIN_PX;
  return (
    <div className="absolute left-0 right-0 z-20 pointer-events-none flex items-center" style={{ top }}>
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 -ml-[3px]" />
      <div className="flex-1 h-px bg-rose-500/70" />
    </div>
  );
}

function GridEventBlock({ item, onClick, onCompleteTask, dimmed, showOwner, startH }) {
  const { ev, startMin, endMin, col, cols } = item;
  const isGoogle = ev.source === 'google';
  const isCrm = ev.source === 'crm';
  const Icon = iconFor(ev);
  const top = (startMin - startH * 60) * GRID_MIN_PX;
  const height = Math.max(20, (endMin - startMin) * GRID_MIN_PX - 2);
  const short = height < 34;
  const GAP = 2;
  const widthPct = 100 / cols;

  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick?.(ev); }}
      title={`${fmtRange(ev.startDate, ev.endDate)} · ${ev.title}${ev.leadName ? ` — ${ev.leadName}` : ''}${isGoogle ? ' (Google Agenda)' : ''}`}
      className={`group/blk absolute text-left rounded-md px-1.5 overflow-hidden transition-colors
        ${short ? 'py-0.5 flex items-center gap-1' : 'py-1'}
        ${dimmed ? 'opacity-30 hover:opacity-100' : ''}
        ${isGoogle
          ? 'border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 hover:border-slate-400'
          : 'border-l-2 bg-white/95 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm'}`}
      style={{
        top, height,
        left: `calc(${col * widthPct}% + ${GAP}px)`,
        width: `calc(${widthPct}% - ${GAP * 2}px)`,
        borderLeftColor: isGoogle ? undefined : ev.color,
        zIndex: 10,
      }}
    >
      {short ? (
        <>
          {ev.completed
            ? <Check size={10} className="shrink-0" style={{ color: ev.color }} />
            : <Icon size={10} className="shrink-0" style={{ color: isGoogle ? '#94a3b8' : ev.color }} />}
          <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">{fmtTime(ev.startDate)}</span>
          <span className={`flex-1 min-w-0 truncate text-[10px] ${ev.completed ? 'line-through text-slate-400' : isGoogle ? 'text-slate-500 dark:text-slate-400 italic' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
            {ev.title}
          </span>
        </>
      ) : (
        <>
          <div className="flex items-center gap-1">
            {ev.completed
              ? <Check size={11} className="shrink-0" style={{ color: ev.color }} />
              : <Icon size={11} className="shrink-0" style={{ color: isGoogle ? '#94a3b8' : ev.color }} />}
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">{fmtRange(ev.startDate, ev.endDate)}</span>
            {showOwner && isCrm && ev.assignedToName && <OwnerBadge name={ev.assignedToName} color={ev.assignedToColor} size={12} />}
          </div>
          <div className={`text-[11px] leading-tight truncate ${ev.completed ? 'line-through text-slate-400 dark:text-slate-500' : isGoogle ? 'text-slate-500 dark:text-slate-400 italic' : 'text-slate-800 dark:text-slate-100 font-medium'}`}>
            {ev.title}
          </div>
          {ev.leadName && !isGoogle && height > 50 && (
            <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{ev.leadName}</div>
          )}
        </>
      )}
      {isCrm && !ev.completed && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => { e.stopPropagation(); onCompleteTask?.(ev); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onCompleteTask?.(ev); } }}
          title="Marcar como concluída"
          className="hidden group-hover/blk:flex absolute top-0.5 right-0.5 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
        >
          <CheckCircle2 size={12} />
        </span>
      )}
    </button>
  );
}

// Faixa de eventos "dia inteiro" acima da grade (não têm horário pra plotar).
function AllDayStrip({ days, eventsByDay, onSelectEvent, onCompleteTask, selectedLeadKey, showOwner }) {
  const anyAllDay = days.some(day => (eventsByDay.get(toKey(day)) || []).some(ev => ev.isAllDay));
  if (!anyAllDay) return null;
  return (
    <div className={`grid gap-px bg-slate-200/60 dark:bg-white/5 border-b border-slate-200/70 dark:border-white/10`} style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}>
      <div className="bg-white/60 dark:bg-slate-900/40 text-[10px] text-slate-400 dark:text-slate-500 flex items-center justify-end pr-1.5 py-1">dia</div>
      {days.map((day) => {
        const dayEvents = (eventsByDay.get(toKey(day)) || []).filter(ev => ev.isAllDay);
        return (
          <div key={toKey(day)} className="bg-white/60 dark:bg-slate-900/40 p-0.5 space-y-0.5">
            {dayEvents.map(ev => (
              <EventChip key={ev.id} ev={ev} onClick={onSelectEvent} onCompleteTask={onCompleteTask}
                dimmed={!!selectedLeadKey && ev.leadKey !== selectedLeadKey} showOwner={showOwner} />
            ))}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Grade de horário compartilhada por Semana (7 dias) e Dia (1 dia). Eixo de
 * horas na esquerda + colunas por dia com blocos posicionados/dimensionados
 * por horário real. onSelectSlot recebe a data JÁ com a hora clicada (em vez
 * de sempre cair em 9h como no clique de célula do Mês).
 */
function TimeGrid({ days, eventsByDay, onSelectEvent, onSelectSlot, onCompleteTask, selectedLeadKey, showOwner }) {
  const today = new Date();
  const dayGroups = useMemo(() => days.map(d => eventsByDay.get(toKey(d)) || []), [days, eventsByDay]);
  const { startH, endH } = useMemo(() => computeGridHours(dayGroups), [dayGroups]);
  const totalHeight = (endH - startH) * GRID_HOUR_PX;
  const hours = useMemo(() => Array.from({ length: endH - startH + 1 }, (_, i) => startH + i), [startH, endH]);

  const handleColumnClick = (e, day) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = Math.max(0, e.clientY - rect.top);
    const minutesFromStart = offsetY / GRID_MIN_PX;
    const snapped = Math.round(minutesFromStart / 15) * 15; // encaixa em blocos de 15min
    const totalMin = startH * 60 + snapped;
    const d = new Date(day);
    d.setHours(Math.floor(totalMin / 60), totalMin % 60, 0, 0);
    onSelectSlot?.(d, true);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-slate-200/70 dark:border-white/10 overflow-hidden">
      <AllDayStrip days={days} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onCompleteTask={onCompleteTask} selectedLeadKey={selectedLeadKey} showOwner={showOwner} />
      {/* Cabeçalho dos dias (Semana) — Dia usa 1 coluna só, cabeçalho fica no título do topo do calendário */}
      {days.length > 1 && (
        <div className="grid bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/70 dark:border-white/10" style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}>
          <div />
          {days.map(day => {
            const isToday = isSameDay(day, today);
            return (
              <div key={toKey(day)} className={`px-2 py-1.5 text-center ${isToday ? 'bg-fyness-primary/10' : ''}`}>
                <div className="text-[10px] uppercase text-slate-400 dark:text-slate-500">{DOW[day.getDay()]}</div>
                <div className={`text-sm font-semibold ${isToday ? 'text-fyness-primary' : 'text-slate-700 dark:text-slate-200'}`}>{day.getDate()}</div>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="grid" style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}>
          {/* Eixo de horas */}
          <div className="relative" style={{ height: totalHeight }}>
            {hours.map(h => (
              <div key={h} className="absolute right-1.5 -translate-y-1/2 text-[10px] text-slate-400 dark:text-slate-500 tabular-nums" style={{ top: (h - startH) * GRID_HOUR_PX }}>
                {String(h).padStart(2, '0')}:00
              </div>
            ))}
          </div>
          {/* Colunas por dia */}
          {days.map((day, i) => {
            const isToday = isSameDay(day, today);
            const laidOut = layoutOverlaps(dayGroups[i]);
            return (
              <div
                key={toKey(day)}
                onClick={(e) => handleColumnClick(e, day)}
                className={`relative border-l border-slate-200/60 dark:border-white/5 cursor-pointer ${isToday ? 'bg-fyness-primary/[0.03]' : ''}`}
                style={{ height: totalHeight }}
              >
                {/* Linhas de hora (grade de fundo) */}
                {hours.map(h => (
                  <div key={h} className="absolute left-0 right-0 border-t border-slate-100 dark:border-white/[0.04]" style={{ top: (h - startH) * GRID_HOUR_PX }} />
                ))}
                {isToday && <NowLine startH={startH} endH={endH} />}
                {laidOut.map(item => (
                  <GridEventBlock key={item.ev.id} item={item} onClick={onSelectEvent} onCompleteTask={onCompleteTask}
                    dimmed={!!selectedLeadKey && item.ev.leadKey !== selectedLeadKey} showOwner={showOwner} startH={startH} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeekView({ current, eventsByDay, onSelectEvent, onSelectSlot, onCompleteTask, selectedLeadKey, showOwner }) {
  const days = useMemo(() => weekDays(current), [current]);
  return <TimeGrid days={days} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onSelectSlot={onSelectSlot}
    onCompleteTask={onCompleteTask} selectedLeadKey={selectedLeadKey} showOwner={showOwner} />;
}

function DayView({ current, eventsByDay, onSelectEvent, onSelectSlot, onCompleteTask, selectedLeadKey, showOwner }) {
  const days = useMemo(() => [startOfDay(current)], [current]);
  return <TimeGrid days={days} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onSelectSlot={onSelectSlot}
    onCompleteTask={onCompleteTask} selectedLeadKey={selectedLeadKey} showOwner={showOwner} />;
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

function AgendaRow({ ev, onClick, onCompleteTask, dimmed, showOwner }) {
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
      <span className="w-14 shrink-0 tabular-nums text-right">
        {ev.isAllDay || !ev.startDate ? (
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">—</span>
        ) : (
          <>
            <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">{fmtTime(ev.startDate)}</div>
            {ev.endDate && fmtTime(ev.endDate) !== fmtTime(ev.startDate) && (
              <div className="text-[10px] text-slate-400 dark:text-slate-500">–{fmtTime(ev.endDate)}</div>
            )}
          </>
        )}
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
      {showOwner && isCrm && ev.assignedToName && <OwnerBadge name={ev.assignedToName} color={ev.assignedToColor} size={22} />}
      {/* Concluir — sempre visível (itens do CRM ainda não concluídos) */}
      {isCrm && !ev.completed && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onCompleteTask?.(ev); }}
          title="Marcar como concluída"
          className="shrink-0 text-slate-400 dark:text-slate-500 hover:text-emerald-500 transition-colors">
          <CheckCircle2 size={20} />
        </button>
      )}
    </div>
  );
}

function AgendaListView({ current, eventsByDay, onSelectEvent, onCompleteTask, selectedLeadKey, showOwner }) {
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
                dimmed={!!selectedLeadKey && ev.leadKey !== selectedLeadKey} showOwner={showOwner} />
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
  onShowDay,
  onCompleteTask,
  selectedLeadKey,
  extraActions,
  showOwner,
  isLoading,
  isError,
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
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {extraActions}
          <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/60">
            {VIEWS.map(v => (
              <button key={v.id} onClick={() => onViewChange?.(v.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${view === v.id ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}>
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        // Skeleton — sem isso, um fetch lento renderizava igual a um dia
        // genuinamente vazio ("Nenhuma atividade"), sem sinal de carregando.
        <div className="flex-1 min-h-0 rounded-xl border border-slate-200/70 dark:border-white/10 p-3 space-y-2">
          {[0, 1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />)}
        </div>
      ) : isError ? (
        <div className="flex-1 min-h-0 flex items-center justify-center text-center text-sm text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200/60 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-900/10 p-6">
          Não foi possível carregar a agenda. Tente atualizar a página.
        </div>
      ) : (
        <>
          {view === 'agenda' && <AgendaListView current={currentDate} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onCompleteTask={onCompleteTask} selectedLeadKey={selectedLeadKey} showOwner={showOwner} />}
          {view === 'month' && <MonthView current={currentDate} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onSelectSlot={onSelectSlot} onShowDay={onShowDay} onCompleteTask={onCompleteTask} selectedLeadKey={selectedLeadKey} showOwner={showOwner} />}
          {view === 'week' && <WeekView current={currentDate} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onSelectSlot={onSelectSlot} onCompleteTask={onCompleteTask} selectedLeadKey={selectedLeadKey} showOwner={showOwner} />}
          {view === 'day' && <DayView current={currentDate} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onSelectSlot={onSelectSlot} onCompleteTask={onCompleteTask} selectedLeadKey={selectedLeadKey} showOwner={showOwner} />}
        </>
      )}

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

/**
 * CrmCalendar - Calendario do CRM (mes / semana / dia).
 *
 * Mostra os eventos ja unificados (atividades do CRM + Google Calendar) que o
 * pai passa. Nao busca dados: e puramente apresentacional + navegacao.
 * Clicar num evento chama onSelectEvent; clicar num dia vazio, onSelectSlot.
 */

import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, Check, Circle, CheckCircle2, Pencil,
  Phone, Mail, MessageCircle, Users, MapPin, CheckSquare, Coffee, ArrowRight, CalendarClock, AlertTriangle,
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

// Atrasada = tarefa do CRM, pendente, cujo DIA agendado ja passou. Por DIA e
// nao por hora: a ligacao das 9h nao pode ficar vermelha as 9h01 com a pessoa
// ainda no telefone — e a comparacao por dia dispensa timer de re-render.
const isLate = (ev) => {
  if (ev.source !== 'crm' || ev.completed || !ev.startDate || ev.isAllDay || ev._dragging) return false;
  const d = new Date(ev.startDate);
  const hoje = new Date();
  return d < new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
};

const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

// ==================== HELPERS DE DATA ====================

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const toKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
// "minutos do dia" -> "HH:MM" (rótulo do fantasma/indicador de arrasto)
const fmtMinutes = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
// Início–fim legível. endDate é opcional pra tipos pontuais (ligação/mensagem)
// — sem fim real, mostra só o início em vez de repetir o mesmo horário 2x.
const fmtRange = (startIso, endIso) => {
  if (!startIso) return null;
  const start = fmtTime(startIso);
  if (!endIso) return start;
  const end = fmtTime(endIso);
  return end === start ? start : `${start}–${end}`;
};

// Eventos de dia inteiro do Google chegam como "YYYY-MM-DD" (sem hora).
// new Date("2026-07-14") interpreta como meia-noite UTC e, no Brasil (UTC-3),
// joga o evento pro dia anterior. Pra all-day date-only, parseamos como LOCAL.
const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const parseLocalDate = (str) => { const [y, m, d] = str.split('-').map(Number); return new Date(y, m - 1, d); };
const parseEventStart = (ev) =>
  (ev.isAllDay && typeof ev.startDate === 'string' && DATE_ONLY.test(ev.startDate))
    ? parseLocalDate(ev.startDate) : new Date(ev.startDate);
const parseEventEnd = (ev) =>
  (ev.isAllDay && typeof ev.endDate === 'string' && DATE_ONLY.test(ev.endDate))
    ? parseLocalDate(ev.endDate) : new Date(ev.endDate);

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

function EventChip({ ev, onClick, onCompleteTask, onEditDelivery, dimmed, showOwner, dnd }) {
  const isGoogle = ev.source === 'google';
  const isCrm = ev.source === 'crm';
  const Icon = iconFor(ev);
  const label = ev.leadName && isCrm ? ev.leadName : ev.title;
  const draggable = dnd ? dnd.canDrag(ev) : false;
  const beingDragged = !!ev._dragging;
  const late = isLate(ev);

  // Tudo é bloco. Itens do CRM podem ser concluídos (botão sempre visível).
  return (
    <div
      onPointerDown={draggable ? (e) => dnd.onPointerDown(ev, e) : undefined}
      style={{ ...(isGoogle ? {} : { borderLeftColor: ev.color }), ...(draggable ? { touchAction: dnd?.armedId === ev.id ? 'none' : 'pan-y' } : {}), ...(beingDragged ? { pointerEvents: 'none' } : {}) }}
      className={`group/chip w-full flex items-center gap-1 rounded-md pl-1 pr-1 py-1 transition-colors duration-150
        ${draggable && !beingDragged ? 'cursor-grab active:cursor-grabbing' : ''}
        ${beingDragged ? 'ring-2 ring-fyness-primary shadow-lg relative z-20' : ''}
        ${dimmed ? 'opacity-30 hover:opacity-100' : ''}
        ${isGoogle
          ? 'border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/60 dark:bg-slate-800/30 hover:border-slate-400'
          : late
            ? 'border-l-2 bg-rose-50/80 dark:bg-rose-950/30 hover:bg-rose-100/80 dark:hover:bg-rose-950/50'
            : 'border-l-2 bg-white/80 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
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
        {late && <AlertTriangle size={10} className="shrink-0 text-rose-500" />}
        {ev.startDate && !ev.isAllDay && (
          <span className={`text-[12px] font-medium shrink-0 tabular-nums ${late ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>{fmtTime(ev.startDate)}</span>
        )}
        <span className={`flex-1 min-w-0 truncate text-[12px] ${ev.completed ? 'line-through text-slate-500 dark:text-slate-400' : isGoogle ? 'text-slate-500 dark:text-slate-400 italic' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
          {label}
        </span>
        {showOwner && isCrm && ev.assignedToName && <OwnerBadge name={ev.assignedToName} color={ev.assignedToColor} size={13} />}
      </button>
      {isCrm && !ev.completed && (
        <button
          type="button"
          data-cal-nodrag=""
          onClick={(e) => { e.stopPropagation(); onCompleteTask?.(ev); }}
          title="Concluir tarefa"
          className="shrink-0 text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors"
        >
          <CheckCircle2 size={12} />
        </button>
      )}
      {isCrm && ev.completed && onEditDelivery && (
        <button
          type="button"
          data-cal-nodrag=""
          onClick={(e) => { e.stopPropagation(); onEditDelivery(ev); }}
          title="Editar o que aconteceu"
          className="shrink-0 text-slate-500 dark:text-slate-400 hover:text-fyness-primary transition-colors"
        >
          <Pencil size={11} />
        </button>
      )}
    </div>
  );
}

// ==================== VIEWS ====================

function MonthView({ current, eventsByDay, onSelectEvent, onSelectSlot, onShowDay, onCompleteTask, onEditDelivery, selectedLeadKey, showOwner, dnd }) {
  const today = new Date();
  const cells = useMemo(() => monthMatrix(current), [current]);
  const month = current.getMonth();

  return (
    <div className="grid grid-cols-7 flex-1 min-h-0 rounded-xl overflow-hidden border border-slate-200/70 dark:border-white/10">
      {DOW.map(d => (
        <div key={d} className="px-2 py-1.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/70 dark:border-white/10 text-center">
          {d}
        </div>
      ))}
      {cells.map((day, i) => {
        const key = toKey(day);
        const dayEvents = eventsByDay.get(key) || [];
        const inMonth = day.getMonth() === month;
        const isToday = isSameDay(day, today);
        // Durante o arrasto, o chip que caiu aqui vem pra frente pra não sumir no "+N".
        const ordered = dayEvents.some(e => e._dragging)
          ? [...dayEvents].sort((a, b) => (b._dragging ? 1 : 0) - (a._dragging ? 1 : 0))
          : dayEvents;
        const shown = ordered.slice(0, 4);
        const extra = ordered.length - shown.length;
        return (
          <div
            key={i}
            data-cal-daykey={key}
            onClick={() => onSelectSlot?.(day)}
            className={`min-h-[92px] p-1 border-b border-r border-slate-200/60 dark:border-white/5 last:border-r-0 cursor-pointer transition-colors
              ${inMonth ? 'bg-white/40 dark:bg-transparent' : 'bg-slate-50/60 dark:bg-slate-900/40'}
              ${dnd?.drop?.dayKey === key ? 'ring-2 ring-inset ring-fyness-primary/60 bg-fyness-primary/10 dark:bg-fyness-primary/10' : 'hover:bg-fyness-primary/5 dark:hover:bg-white/5'} ${(i + 1) % 7 === 0 ? 'border-r-0' : ''}`}
          >
            <div className="flex items-center justify-between px-1">
              <span className={`text-[12px] font-medium w-5 h-5 flex items-center justify-center rounded-full
                ${isToday ? 'bg-fyness-primary text-white' : inMonth ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'}`}>
                {day.getDate()}
              </span>
            </div>
            <div className="mt-0.5 space-y-0.5">
              {shown.map(ev => (
                <EventChip key={ev.id} ev={ev} onClick={onSelectEvent} onCompleteTask={onCompleteTask} onEditDelivery={onEditDelivery}
                  dimmed={!!selectedLeadKey && ev.leadKey !== selectedLeadKey} showOwner={showOwner} dnd={dnd} />
              ))}
              {extra > 0 && (
                // Handler próprio + stopPropagation: sem isso o clique cai no
                // onClick da célula (abre "nova tarefa") em vez de mostrar os
                // itens do dia — "+N mais" parecia link mas não fazia nada.
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onShowDay?.(day); }}
                  className="w-full text-left text-[12px] text-slate-500 dark:text-slate-400 hover:text-fyness-primary hover:underline pl-1 cursor-pointer"
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
const GRID_DEFAULT_START_H = 8; // topo da grade — só sobe pra mais cedo se tiver evento antes das 8h
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
      return { ev, startMin, endMin, col: 0, cols: 1, colspan: 1 };
    })
    // Ordem ESTÁVEL (início, depois fim, depois id): sem o id de desempate,
    // eventos no mesmo horário trocavam de coluna a cada render/arrasto.
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin || String(a.ev.id).localeCompare(String(b.ev.id)));

  // Fecha um cluster de eventos que se cruzam: atribui coluna (guloso) e depois
  // EXPANDE cada evento pra direita enquanto as colunas seguintes estiverem
  // livres no intervalo dele — assim ele usa a largura sobrando em vez de ficar
  // sempre em 1/N (antes 2 eventos que mal se tocavam já viravam 2 tiras finas).
  const finalize = (cluster) => {
    const colEnds = [];
    for (const item of cluster) {
      let c = colEnds.findIndex(end => item.startMin >= end);
      if (c === -1) { c = colEnds.length; colEnds.push(item.endMin); }
      else colEnds[c] = item.endMin;
      item.col = c;
    }
    const totalCols = colEnds.length;
    for (const item of cluster) {
      item.cols = totalCols;
      let span = 1;
      for (let c = item.col + 1; c < totalCols; c++) {
        const blocked = cluster.some(o => o !== item && o.col === c && o.startMin < item.endMin && o.endMin > item.startMin);
        if (blocked) break;
        span++;
      }
      item.colspan = span;
    }
  };

  let clusterStart = 0;
  for (let i = 0; i < items.length; i++) {
    const clusterSoFar = items.slice(clusterStart, i + 1);
    const clusterEnd = Math.max(...clusterSoFar.map(x => x.endMin));
    const isLast = i === items.length - 1;
    if (isLast || items[i + 1].startMin >= clusterEnd) {
      finalize(clusterSoFar);
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

function GridEventBlock({ item, onClick, onCompleteTask, onEditDelivery, dimmed, showOwner, startH, dnd }) {
  const { ev, startMin, endMin, col, cols, colspan = 1 } = item;
  const isGoogle = ev.source === 'google';
  const isCrm = ev.source === 'crm';
  const Icon = iconFor(ev);
  const top = (startMin - startH * 60) * GRID_MIN_PX;
  const height = Math.max(20, (endMin - startMin) * GRID_MIN_PX - 2);
  const short = height < 34;
  const GAP = 2;
  const unit = 100 / cols;
  const leftPct = col * unit;
  const widthPct = colspan * unit;
  const draggable = dnd ? dnd.canDrag(ev) : false;
  const beingDragged = !!ev._dragging;

  return (
    <button
      type="button"
      onPointerDown={draggable ? (e) => dnd.onPointerDown(ev, e) : undefined}
      onClick={(e) => { e.stopPropagation(); onClick?.(ev); }}
      title={`${fmtRange(ev.startDate, ev.endDate)} · ${ev.title}${ev.leadName ? ` — ${ev.leadName}` : ''}${isGoogle ? ' (Google Agenda)' : ''}`}
      className={`group/blk absolute text-left rounded-md px-1.5 overflow-hidden transition-[top,height,left,width] duration-75
        ${short ? 'py-0.5 flex items-center gap-1' : 'py-1'}
        ${draggable && !beingDragged ? 'cursor-grab active:cursor-grabbing' : ''}
        ${beingDragged ? 'ring-2 ring-fyness-primary shadow-2xl opacity-95' : ''}
        ${dimmed ? 'opacity-30 hover:opacity-100' : ''}
        ${isGoogle
          ? 'border border-dashed border-slate-300 dark:border-slate-600 bg-slate-50/80 dark:bg-slate-800/50 hover:border-slate-400'
          : 'border-l-2 bg-white/95 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm'}`}
      style={{
        top, height,
        left: `calc(${leftPct}% + ${GAP}px)`,
        width: `calc(${widthPct}% - ${GAP * 2}px)`,
        borderLeftColor: isGoogle ? undefined : ev.color,
        zIndex: beingDragged ? 40 : 10,
        pointerEvents: beingDragged ? 'none' : undefined,
        ...(draggable ? { touchAction: dnd?.armedId === ev.id ? 'none' : 'pan-y' } : {}),
      }}
    >
      {short ? (
        <>
          {ev.completed
            ? <Check size={10} className="shrink-0" style={{ color: ev.color }} />
            : <Icon size={10} className="shrink-0" style={{ color: isGoogle ? '#94a3b8' : ev.color }} />}
          <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">{fmtTime(ev.startDate)}</span>
          <span className={`flex-1 min-w-0 truncate text-[12px] ${ev.completed ? 'line-through text-slate-400' : isGoogle ? 'text-slate-500 dark:text-slate-400 italic' : 'text-slate-700 dark:text-slate-200 font-medium'}`}>
            {ev.title}
          </span>
        </>
      ) : (
        <>
          <div className="flex items-center gap-1">
            {ev.completed
              ? <Check size={11} className="shrink-0" style={{ color: ev.color }} />
              : <Icon size={11} className="shrink-0" style={{ color: isGoogle ? '#94a3b8' : ev.color }} />}
            <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 shrink-0 tabular-nums">{fmtRange(ev.startDate, ev.endDate)}</span>
            {showOwner && isCrm && ev.assignedToName && <OwnerBadge name={ev.assignedToName} color={ev.assignedToColor} size={12} />}
          </div>
          <div className={`text-[12px] leading-tight truncate ${ev.completed ? 'line-through text-slate-500 dark:text-slate-400' : isGoogle ? 'text-slate-500 dark:text-slate-400 italic' : 'text-slate-800 dark:text-slate-100 font-medium'}`}>
            {ev.title}
          </div>
          {ev.leadName && !isGoogle && height > 50 && (
            <div className="text-[12px] text-slate-500 dark:text-slate-400 truncate">{ev.leadName}</div>
          )}
        </>
      )}
      {isCrm && !ev.completed && (
        <span
          role="button"
          tabIndex={0}
          data-cal-nodrag=""
          onClick={(e) => { e.stopPropagation(); onCompleteTask?.(ev); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onCompleteTask?.(ev); } }}
          title="Concluir tarefa"
          className="flex md:hidden md:group-hover/blk:flex absolute top-0.5 right-0.5 text-slate-400 hover:text-emerald-500 transition-colors cursor-pointer"
        >
          <CheckCircle2 size={12} />
        </span>
      )}
      {isCrm && ev.completed && onEditDelivery && (
        <span
          role="button"
          tabIndex={0}
          data-cal-nodrag=""
          onClick={(e) => { e.stopPropagation(); onEditDelivery(ev); }}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onEditDelivery(ev); } }}
          title="Editar o que aconteceu"
          className="flex md:hidden md:group-hover/blk:flex absolute top-0.5 right-0.5 text-slate-400 hover:text-fyness-primary transition-colors cursor-pointer"
        >
          <Pencil size={12} />
        </span>
      )}
    </button>
  );
}

// Faixa de eventos "dia inteiro" acima da grade (não têm horário pra plotar).
function AllDayStrip({ days, eventsByDay, onSelectEvent, onCompleteTask, onEditDelivery, selectedLeadKey, showOwner }) {
  const anyAllDay = days.some(day => (eventsByDay.get(toKey(day)) || []).some(ev => ev.isAllDay));
  if (!anyAllDay) return null;
  return (
    <div className={`grid gap-px bg-slate-200/60 dark:bg-white/5 border-b border-slate-200/70 dark:border-white/10`} style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}>
      <div className="bg-white/60 dark:bg-slate-900/40 text-[12px] text-slate-500 dark:text-slate-400 flex items-center justify-end pr-1.5 py-1">dia</div>
      {days.map((day) => {
        const dayEvents = (eventsByDay.get(toKey(day)) || []).filter(ev => ev.isAllDay);
        return (
          <div key={toKey(day)} className="bg-white/60 dark:bg-slate-900/40 p-0.5 space-y-0.5">
            {dayEvents.map(ev => (
              <EventChip key={ev.id} ev={ev} onClick={onSelectEvent} onCompleteTask={onCompleteTask} onEditDelivery={onEditDelivery}
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
function TimeGrid({ days, eventsByDay, onSelectEvent, onSelectSlot, onCompleteTask, onEditDelivery, selectedLeadKey, showOwner, dnd }) {
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
      <AllDayStrip days={days} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onCompleteTask={onCompleteTask} onEditDelivery={onEditDelivery} selectedLeadKey={selectedLeadKey} showOwner={showOwner} />
      {/* Cabeçalho dos dias (Semana) — Dia usa 1 coluna só, cabeçalho fica no título do topo do calendário */}
      {days.length > 1 && (
        <div className="grid bg-slate-50/80 dark:bg-slate-800/40 border-b border-slate-200/70 dark:border-white/10" style={{ gridTemplateColumns: `56px repeat(${days.length}, 1fr)` }}>
          <div />
          {days.map(day => {
            const isToday = isSameDay(day, today);
            return (
              <div key={toKey(day)} className={`px-2 py-1.5 text-center ${isToday ? 'bg-fyness-primary/10' : ''}`}>
                <div className="text-[12px] uppercase text-slate-500 dark:text-slate-400">{DOW[day.getDay()]}</div>
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
            {/* Nudge pra baixo (sem centralizar na linha) — centralizar cortava a
                primeira hora (metade do texto ficava acima do topo da grade). */}
            {hours.map(h => (
              <div key={h} className="absolute right-1.5 text-[12px] text-slate-500 dark:text-slate-400 tabular-nums" style={{ top: (h - startH) * GRID_HOUR_PX + 2 }}>
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
                data-cal-daykey={toKey(day)}
                data-cal-grid=""
                data-cal-starth={startH}
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
                  <GridEventBlock key={item.ev.id} item={item} onClick={onSelectEvent} onCompleteTask={onCompleteTask} onEditDelivery={onEditDelivery}
                    dimmed={!!selectedLeadKey && item.ev.leadKey !== selectedLeadKey} showOwner={showOwner} startH={startH} dnd={dnd} />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WeekView({ current, eventsByDay, onSelectEvent, onSelectSlot, onCompleteTask, onEditDelivery, selectedLeadKey, showOwner, dnd }) {
  const days = useMemo(() => weekDays(current), [current]);
  return <TimeGrid days={days} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onSelectSlot={onSelectSlot}
    onCompleteTask={onCompleteTask} onEditDelivery={onEditDelivery} selectedLeadKey={selectedLeadKey} showOwner={showOwner} dnd={dnd} />;
}

function DayView({ current, eventsByDay, onSelectEvent, onSelectSlot, onCompleteTask, onEditDelivery, selectedLeadKey, showOwner, dnd }) {
  const days = useMemo(() => [startOfDay(current)], [current]);
  return <TimeGrid days={days} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onSelectSlot={onSelectSlot}
    onCompleteTask={onCompleteTask} onEditDelivery={onEditDelivery} selectedLeadKey={selectedLeadKey} showOwner={showOwner} dnd={dnd} />;
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

function AgendaRow({ ev, onClick, onCompleteTask, onEditDelivery, dimmed, showOwner }) {
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
              <div className="text-[12px] text-slate-500 dark:text-slate-400">–{fmtTime(ev.endDate)}</div>
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
        <div className={`text-sm truncate ${ev.completed ? 'line-through text-slate-500 dark:text-slate-400' : isGoogle ? 'text-slate-500 dark:text-slate-400 italic' : 'text-slate-800 dark:text-slate-100 font-medium'}`}>
          {label}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{isGoogle ? 'Google Agenda' : sub}</div>
        {timing && (
          <div className="flex items-center gap-1.5 mt-1 text-[12px] flex-wrap">
            <span className="text-slate-500 dark:text-slate-400 tabular-nums">
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
          title="Concluir tarefa"
          className="shrink-0 text-slate-500 dark:text-slate-400 hover:text-emerald-500 transition-colors">
          <CheckCircle2 size={20} />
        </button>
      )}
      {/* Editar entrega — tarefa do CRM já concluída */}
      {isCrm && ev.completed && onEditDelivery && (
        <button type="button" onClick={(e) => { e.stopPropagation(); onEditDelivery(ev); }}
          title="Editar o que aconteceu"
          className="shrink-0 text-slate-500 dark:text-slate-400 hover:text-fyness-primary transition-colors">
          <Pencil size={18} />
        </button>
      )}
    </div>
  );
}

function AgendaListView({ current, eventsByDay, onSelectEvent, onCompleteTask, onEditDelivery, selectedLeadKey, showOwner }) {
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
      <div className="flex-1 flex items-center justify-center text-center text-sm text-slate-500 dark:text-slate-400">
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
              <span className="ml-2 text-[12px] text-slate-500 dark:text-slate-400">{events.length} {events.length === 1 ? 'item' : 'itens'}</span>
            </div>
            {events.map(ev => (
              <AgendaRow key={ev.id} ev={ev} onClick={onSelectEvent} onCompleteTask={onCompleteTask} onEditDelivery={onEditDelivery}
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
  onEditDelivery,
  selectedLeadKey,
  extraActions,
  showOwner,
  isLoading,
  isError,
  onEventDrop,
}) {
  // ===== Arrasto por pointer pra reagendar (suave, tipo Google Agenda) =====
  // Um "fantasma" flutuante segue o cursor; no grid encaixa em 15min. Só conta
  // como arrasto depois de passar de um limiar (senão é clique = abrir). O drop
  // chama onEventDrop(ev, {start,end}); um override otimista mantém o item no
  // novo lugar até o refetch chegar. Só CRM pendente e evento local não-recorrente
  // arrastam (Google/O.S. são read-only aqui).
  const DRAG_THRESHOLD = 5;
  // Toque precisa de mais folga: o dedo treme e a area de contato e grande.
  const TOUCH_THRESHOLD = 12;
  const TOUCH_SLOP = 10;    // mexeu mais que isso antes de armar = e scroll
  const LONG_PRESS_MS = 350;
  const stateRef = useRef(null);              // { ev, startX, startY, started }
  const [drop, setDrop] = useState(null);     // { dayKey, minutes|null } | null — alvo (highlight do Mês)
  // Qual tarefa ja passou pelo long-press e pode ser arrastada no toque. Enquanto
  // for null, o chip mantem touch-action pan-y — ou seja, rolar a pagina em cima
  // dele continua rolando a pagina.
  const [armedId, setArmedId] = useState(null);
  const [previewMove, setPreviewMove] = useState(null); // { id, startDate, endDate } — o PRÓPRIO bloco renderizado no destino durante o arrasto
  const [pendingMoves, setPendingMoves] = useState(() => new Map());
  // Reconciliação: mantém o override otimista até os dados FRESCOS refletirem o
  // novo horário (start igual) ou o evento sair do recorte. Antes limpava a cada
  // troca de referência de `events` — e como o mutate re-renderiza o pai
  // (recriando `events`), o override era apagado na hora e o item só andava
  // depois do refetch: era isso que dava o "delay ao soltar".
  useEffect(() => {
    setPendingMoves(prev => {
      if (prev.size === 0) return prev;
      let changed = false;
      const next = new Map();
      for (const [id, mv] of prev) {
        const ev = events.find(e => e.id === id);
        if (!ev) { changed = true; continue; }                       // sumiu do recorte
        if (new Date(ev.startDate).getTime() === new Date(mv.startDate).getTime()) { changed = true; continue; } // servidor confirmou
        next.set(id, mv);
      }
      return changed ? next : prev;
    });
  }, [events]);

  const canDrag = useCallback((ev) => {
    if (!onEventDrop || !ev.startDate) return false;
    if (ev.source === 'crm') return !ev.completed;
    if (ev.source === 'local') return !ev._raw?.recurrenceType || ev._raw.recurrenceType === 'none';
    return false;
  }, [onEventDrop]);

  // Zona de drop sob o cursor: célula do Mês (data-cal-daykey) ou coluna do Grid
  // (+ data-cal-grid + data-cal-starth pra converter Y em minutos, snap 15min).
  const hitTest = useCallback((x, y) => {
    const el = document.elementFromPoint(x, y);
    const zone = el?.closest?.('[data-cal-daykey]');
    if (!zone) return null;
    const dayKey = zone.getAttribute('data-cal-daykey');
    if (!zone.hasAttribute('data-cal-grid')) return { dayKey, minutes: null };
    const rect = zone.getBoundingClientRect();
    const startH = Number(zone.getAttribute('data-cal-starth')) || 0;
    const offsetY = Math.max(0, Math.min(y - rect.top, rect.height));
    const minutes = startH * 60 + Math.round((offsetY / GRID_MIN_PX) / 15) * 15;
    return { dayKey, minutes };
  }, []);

  // Onde o evento ficaria pra um alvo (puro). Mês: mantém a hora, muda o dia.
  // Grid: hora vem do Y. Mantém a duração. sameAsOrig = soltar aqui não muda nada.
  const resolveMove = useCallback((ev, target) => {
    const origStart = new Date(ev.startDate);
    const [ky, km, kd] = target.dayKey.split('-').map(Number);
    const ns = target.minutes == null
      ? new Date(ky, km - 1, kd, origStart.getHours(), origStart.getMinutes(), 0, 0)
      : new Date(ky, km - 1, kd, Math.floor(target.minutes / 60), target.minutes % 60, 0, 0);
    const durMs = ev.endDate ? Math.max(0, new Date(ev.endDate).getTime() - origStart.getTime()) : 0;
    const ne = ev.endDate ? new Date(ns.getTime() + durMs) : null;
    const sameAsOrig = target.minutes == null
      ? isSameDay(ns, origStart)
      : Math.abs(ns.getTime() - origStart.getTime()) < 60000;
    return { startDate: ns.toISOString(), endDate: ne ? ne.toISOString() : null, sameAsOrig };
  }, []);

  const commit = useCallback((ev, mv) => {
    setPendingMoves(prev => new Map(prev).set(ev.id, { startDate: mv.startDate, endDate: mv.endDate }));
    onEventDrop?.(ev, { start: mv.startDate, end: mv.endDate });
    // Rede de segurança: se o servidor não confirmar, o override some depois de 8s
    // e o bloco volta pro estado real (em vez de ficar preso no lugar errado).
    window.setTimeout(() => {
      setPendingMoves(prev => {
        if (!prev.has(ev.id)) return prev;
        const n = new Map(prev); n.delete(ev.id); return n;
      });
    }, 8000);
  }, [onEventDrop]);

  // Listeners globais (uma vez): leem stateRef, setado no pointerdown do item.
  useEffect(() => {
    const clearBody = () => { document.body.style.cursor = ''; document.body.style.userSelect = ''; };
    const onMove = (e) => {
      const st = stateRef.current;
      if (!st) return;
      if (!st.started) {
        const dist = Math.hypot(e.clientX - st.startX, e.clientY - st.startY);
        // No TOQUE o arrasto so arma depois do long-press. Sem isso, o gesto de
        // ROLAR a tela em cima de uma tarefa virava reagendamento — o dedo nao
        // tem "hover" pra distinguir intencao, e a pessoa nem percebia que
        // moveu o compromisso.
        if (st.touch && !st.armed) {
          if (dist > TOUCH_SLOP) { clearTimeout(st.timer); setArmedId(null); stateRef.current = null; }
          return;
        }
        if (dist < (st.touch ? TOUCH_THRESHOLD : DRAG_THRESHOLD)) return;
        st.started = true;
        document.body.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
      }
      const t = hitTest(e.clientX, e.clientY);
      setDrop(prev => {
        const same = (!prev && !t) || (prev && t && prev.dayKey === t.dayKey && prev.minutes === t.minutes);
        return same ? prev : t;
      });
      // Preview: renderiza o PRÓPRIO bloco no destino (tamanho real). Fora de
      // qualquer zona, mostra no lugar original (soltar aí não muda nada).
      const mv = t ? resolveMove(st.ev, t) : { startDate: st.ev.startDate, endDate: st.ev.endDate || null };
      setPreviewMove(prev => (prev && prev.id === st.ev.id && prev.startDate === mv.startDate && prev.endDate === mv.endDate)
        ? prev : { id: st.ev.id, startDate: mv.startDate, endDate: mv.endDate });
    };
    const onUp = (e) => {
      const st = stateRef.current;
      if (!st) return;
      clearTimeout(st.timer);
      setArmedId(null);
      const started = st.started;
      stateRef.current = null;
      if (started) {
        const t = hitTest(e.clientX, e.clientY);
        if (t) {
          const mv = resolveMove(st.ev, t);
          if (!mv.sameAsOrig) commit(st.ev, mv);
        }
        // Suprime o "click" que o navegador dispara logo após o arrasto (senão
        // soltar em cima de um item abriria o histórico dele).
        const suppress = (ce) => { ce.stopPropagation(); ce.preventDefault(); };
        window.addEventListener('click', suppress, { capture: true, once: true });
        setTimeout(() => window.removeEventListener('click', suppress, true), 0);
      }
      setPreviewMove(null);
      setDrop(null);
      clearBody();
    };
    // Cancela sem reagendar (Esc, troca de aba/janela) — rede de segurança
    // contra estado de arrasto preso.
    const cancel = () => {
      if (!stateRef.current) return;
      clearTimeout(stateRef.current.timer);
      setArmedId(null);
      stateRef.current = null;
      setPreviewMove(null);
      setDrop(null);
      clearBody();
    };
    const onKey = (e) => { if (e.key === 'Escape') cancel(); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    // pointercancel CANCELA, nunca confirma: no toque, o navegador dispara isso
    // quando decide que o gesto virou scroll. Confirmando ali, rolar a agenda
    // no celular reagendava a tarefa que estava sob o dedo.
    window.addEventListener('pointercancel', cancel);
    window.addEventListener('blur', cancel);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', cancel);
      window.removeEventListener('blur', cancel);
      window.removeEventListener('keydown', onKey);
      clearBody();
    };
  }, [hitTest, resolveMove, commit]);

  const dnd = onEventDrop ? {
    canDrag,
    drop,
    armedId,
    onPointerDown: (ev, e) => {
      if (e.button != null && e.button !== 0) return; // só botão primário
      // NÃO sequestrar cliques nos controles do card (concluir ✓ / editar): sem
      // isso, um clique com leve movimento no ✓ virava arrasto e REAGENDAVA a
      // tarefa em vez de concluí-la — parecia "não dá pra confirmar a tarefa".
      if (e.target?.closest?.('[data-cal-nodrag]')) return;
      // Captura o ponteiro: garante que o pointerup chegue mesmo se soltar fora
      // da janela — sem isso um arrasto podia "ficar preso" e travar a página.
      try { e.currentTarget.setPointerCapture?.(e.pointerId); } catch { /* noop */ }
      const touch = e.pointerType === 'touch';
      const st = {
        ev, pointerId: e.pointerId, startX: e.clientX, startY: e.clientY,
        started: false, touch, armed: !touch, timer: null,
      };
      // No toque, o arrasto só existe depois de segurar. Antes disso o gesto
      // pertence ao scroll — é o mesmo contrato que a pessoa já conhece de
      // arrastar ícone no celular.
      if (touch) {
        st.timer = setTimeout(() => {
          if (stateRef.current === st) {
            st.armed = true;
            setArmedId(st.ev.id);
            // Feedback tátil de "agora pode arrastar": sem isso ela não tem
            // como saber que o long-press pegou.
            try { navigator.vibrate?.(15); } catch { /* noop */ }
          }
        }, LONG_PRESS_MS);
      }
      stateRef.current = st;
    },
  } : null;

  // Override otimista (drop confirmado) + PREVIEW ao vivo: o bloco sendo
  // arrastado é renderizado JÁ no destino (marcado com _dragging pra estilizar
  // como "levantado") — você vê em tamanho real como ele vai ficar lá.
  const effectiveEvents = useMemo(() => {
    if (pendingMoves.size === 0 && !previewMove) return events;
    return events.map(ev => {
      if (previewMove && ev.id === previewMove.id) {
        return { ...ev, startDate: previewMove.startDate, endDate: previewMove.endDate, _dragging: true };
      }
      const p = pendingMoves.get(ev.id);
      return p ? { ...ev, startDate: p.startDate, endDate: p.endDate } : ev;
    });
  }, [events, pendingMoves, previewMove]);

  // Indexa eventos por dia (uma vez). Eventos sem data sao ignorados.
  const eventsByDay = useMemo(() => {
    const map = new Map();
    const push = (k, ev) => { if (!map.has(k)) map.set(k, []); map.get(k).push(ev); };

    for (const ev of effectiveEvents) {
      if (!ev.startDate) continue;
      const start = parseEventStart(ev);
      const firstDay = startOfDay(start);
      // Expande o evento por TODOS os dias que ele ocupa — antes indexava só o
      // dia de início, então evento multi-dia (all-day do Google 14→18) ou que
      // cruza a meia-noite sumia dos dias seguintes.
      let lastDay = firstDay;
      if (ev.endDate) {
        lastDay = startOfDay(parseEventEnd(ev));
        // all-day do Google tem end.date EXCLUSIVO (evento só no dia 14 vem
        // start=14/end=15) — desconta 1 dia pra não pintar um dia a mais.
        if (ev.isAllDay) lastDay = addDays(lastDay, -1);
        if (lastDay < firstDay) lastDay = firstDay;
      }
      let cursor = firstDay;
      let guard = 0;
      while (cursor <= lastDay && guard < 90) {
        push(toKey(cursor), ev);
        cursor = addDays(cursor, 1);
        guard++;
      }
    }
    // Ordena cada dia por horario (parse local pra all-day não desalinhar)
    for (const list of map.values()) {
      list.sort((a, b) => parseEventStart(a) - parseEventStart(b));
    }
    return map;
  }, [effectiveEvents]);

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
          {view === 'agenda' && <AgendaListView current={currentDate} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onCompleteTask={onCompleteTask} onEditDelivery={onEditDelivery} selectedLeadKey={selectedLeadKey} showOwner={showOwner} />}
          {view === 'month' && <MonthView current={currentDate} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onSelectSlot={onSelectSlot} onShowDay={onShowDay} onCompleteTask={onCompleteTask} onEditDelivery={onEditDelivery} selectedLeadKey={selectedLeadKey} showOwner={showOwner} dnd={dnd} />}
          {view === 'week' && <WeekView current={currentDate} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onSelectSlot={onSelectSlot} onCompleteTask={onCompleteTask} onEditDelivery={onEditDelivery} selectedLeadKey={selectedLeadKey} showOwner={showOwner} dnd={dnd} />}
          {view === 'day' && <DayView current={currentDate} eventsByDay={eventsByDay} onSelectEvent={onSelectEvent} onSelectSlot={onSelectSlot} onCompleteTask={onCompleteTask} onEditDelivery={onEditDelivery} selectedLeadKey={selectedLeadKey} showOwner={showOwner} dnd={dnd} />}
        </>
      )}

      {/* Legenda — explica as cores/ícones e separa CRM de Google */}
      {(legend.types.length > 0 || legend.hasGoogle) && (
        <div className="flex items-center gap-x-4 gap-y-1.5 flex-wrap mt-3 pt-2.5 border-t border-slate-200/60 dark:border-white/5">
          {legend.types.map(t => {
            const Icon = TYPE_ICON[t.key] || Circle;
            return (
              <span key={t.key} className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
                <Icon size={13} style={{ color: t.color }} /> {t.label}
              </span>
            );
          })}
          {legend.hasGoogle && (
            <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 sm:ml-auto">
              <span className="inline-block w-4 h-3 rounded border border-dashed border-slate-400 dark:border-slate-500 bg-slate-50/60 dark:bg-slate-800/30" />
              <CalendarClock size={13} className="text-slate-400" /> do Google Agenda
            </span>
          )}
        </div>
      )}
    </div>
  );
}

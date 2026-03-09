/**
 * Exportador de eventos para formato iCalendar (.ics).
 * Compativel com Google Calendar, Apple Calendar, Outlook, etc.
 */

/**
 * Converte um evento para formato iCalendar.
 */
function eventToVEVENT(event) {
  const uid = `${event.id}@fyness-os`;
  const now = formatICSDate(new Date());
  const dtStart = formatICSDate(new Date(event.startDate));
  const dtEnd = event.endDate ? formatICSDate(new Date(event.endDate)) : dtStart;

  let vevent = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeICS(event.title)}`,
  ];

  if (event.description) {
    vevent.push(`DESCRIPTION:${escapeICS(event.description)}`);
  }

  if (event.assignee) {
    vevent.push(`ORGANIZER:${escapeICS(event.assignee)}`);
  }

  // Attendees
  if (event.attendees && event.attendees.length > 0) {
    for (const attendee of event.attendees) {
      const name = attendee.name || attendee;
      vevent.push(`ATTENDEE;CN=${escapeICS(name)}:MAILTO:${attendee.email || ''}`);
    }
  }

  // Recorrencia (RRULE)
  if (event.recurrenceType) {
    const rrule = buildRRule(event);
    if (rrule) {
      vevent.push(`RRULE:${rrule}`);
    }
  }

  // Tipo como categoria
  if (event.type) {
    const typeMap = { meeting: 'Reuniao', task: 'Tarefa', reminder: 'Lembrete', deadline: 'Prazo', other: 'Outro' };
    vevent.push(`CATEGORIES:${typeMap[event.type] || event.type}`);
  }

  vevent.push('END:VEVENT');
  return vevent.join('\r\n');
}

/**
 * Gera RRULE a partir dos campos de recorrencia do evento.
 */
function buildRRule(event) {
  const freqMap = {
    daily: 'DAILY',
    weekly: 'WEEKLY',
    monthly: 'MONTHLY',
    yearly: 'YEARLY',
  };

  const freq = freqMap[event.recurrenceType];
  if (!freq) return null;

  let rrule = `FREQ=${freq}`;

  const config = event.recurrenceConfig || {};
  if (config.interval && config.interval > 1) {
    rrule += `;INTERVAL=${config.interval}`;
  }

  if (event.recurrenceType === 'weekly' && config.daysOfWeek && config.daysOfWeek.length > 0) {
    const dayMap = { 0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA' };
    const days = config.daysOfWeek.map(d => dayMap[d]).filter(Boolean).join(',');
    if (days) rrule += `;BYDAY=${days}`;
  }

  if (event.recurrenceEndType === 'after' && event.recurrenceEndValue) {
    rrule += `;COUNT=${event.recurrenceEndValue}`;
  } else if (event.recurrenceEndType === 'on' && event.recurrenceEndValue) {
    rrule += `;UNTIL=${formatICSDate(new Date(event.recurrenceEndValue))}`;
  }

  return rrule;
}

/**
 * Gera arquivo .ics e faz download.
 */
export function downloadICS(events, filename = 'fyness_agenda.ics') {
  const eventsArray = Array.isArray(events) ? events : [events];

  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Fyness OS//Agenda//PT',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Fyness OS Agenda',
    ...eventsArray.map(eventToVEVENT),
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta um unico evento como .ics.
 */
export function downloadSingleEventICS(event) {
  const filename = `${(event.title || 'evento').replace(/[^a-zA-Z0-9]/g, '_')}.ics`;
  downloadICS([event], filename);
}

// ==================== HELPERS ====================

function formatICSDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) return '';
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeICS(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

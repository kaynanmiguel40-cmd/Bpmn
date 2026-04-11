/**
 * Shared: Conversao de eventos entre Fyness e Google Calendar
 */

// ==================== RRULE (reutiliza logica do icsExporter.js) ====================

const FREQ_MAP: Record<string, string> = {
  daily: 'DAILY',
  weekly: 'WEEKLY',
  monthly: 'MONTHLY',
  yearly: 'YEARLY',
}

const DAY_MAP: Record<number, string> = {
  0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA',
}

function buildRRule(event: any): string | null {
  const freq = FREQ_MAP[event.recurrence_type]
  if (!freq) return null

  let rrule = `RRULE:FREQ=${freq}`

  const config = event.recurrence_config || {}
  if (config.interval && config.interval > 1) {
    rrule += `;INTERVAL=${config.interval}`
  }

  if (event.recurrence_type === 'weekly' && config.daysOfWeek?.length > 0) {
    const days = config.daysOfWeek.map((d: number) => DAY_MAP[d]).filter(Boolean).join(',')
    if (days) rrule += `;BYDAY=${days}`
  }

  if (event.recurrence_end_type === 'after' && event.recurrence_end_value) {
    rrule += `;COUNT=${event.recurrence_end_value}`
  } else if (event.recurrence_end_type === 'on_date' && event.recurrence_end_value) {
    const d = new Date(event.recurrence_end_value)
    rrule += `;UNTIL=${d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`
  }

  return rrule
}

// ==================== PARSE RRULE (Google -> Fyness) ====================

const REVERSE_DAY_MAP: Record<string, number> = {
  SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6,
}

function parseRRule(rruleStr: string): {
  recurrence_type: string | null
  recurrence_config: any
  recurrence_end_type: string
  recurrence_end_value: string | null
} {
  const result = {
    recurrence_type: null as string | null,
    recurrence_config: { interval: 1 } as any,
    recurrence_end_type: 'never',
    recurrence_end_value: null as string | null,
  }

  // Remove "RRULE:" prefix
  const rule = rruleStr.replace(/^RRULE:/, '')
  const parts: Record<string, string> = {}

  for (const part of rule.split(';')) {
    const [key, value] = part.split('=')
    if (key && value) parts[key] = value
  }

  // FREQ
  const reverseFreq: Record<string, string> = {
    DAILY: 'daily', WEEKLY: 'weekly', MONTHLY: 'monthly', YEARLY: 'yearly',
  }
  if (parts.FREQ) result.recurrence_type = reverseFreq[parts.FREQ] || null

  // INTERVAL
  if (parts.INTERVAL) result.recurrence_config.interval = parseInt(parts.INTERVAL) || 1

  // BYDAY
  if (parts.BYDAY) {
    result.recurrence_config.daysOfWeek = parts.BYDAY
      .split(',')
      .map(d => REVERSE_DAY_MAP[d])
      .filter(d => d !== undefined)
  }

  // COUNT
  if (parts.COUNT) {
    result.recurrence_end_type = 'after'
    result.recurrence_end_value = parts.COUNT
  }

  // UNTIL
  if (parts.UNTIL) {
    result.recurrence_end_type = 'on_date'
    // Parse UNTIL format: 20250315T235959Z -> ISO
    const u = parts.UNTIL
    if (u.length >= 8) {
      const year = u.substring(0, 4)
      const month = u.substring(4, 6)
      const day = u.substring(6, 8)
      result.recurrence_end_value = `${year}-${month}-${day}`
    }
  }

  return result
}

// ==================== COLOR MAPPING ====================

// Fyness hex -> Google colorId (1-11)
const COLOR_TO_GOOGLE: Record<string, string> = {
  '#3b82f6': '9',   // blue -> blueberry
  '#f97316': '6',   // orange -> tangerine
  '#22c55e': '10',  // green -> basil
  '#64748b': '8',   // gray -> graphite
  '#ef4444': '11',  // red -> tomato
  '#8b5cf6': '3',   // purple -> grape
}

// Google colorId -> Fyness hex
const GOOGLE_TO_COLOR: Record<string, string> = {
  '1': '#7986cb',  // lavender
  '2': '#33b679',  // sage
  '3': '#8b5cf6',  // grape
  '4': '#e67c73',  // flamingo
  '5': '#f6bf26',  // banana
  '6': '#f97316',  // tangerine
  '7': '#039be5',  // peacock
  '8': '#64748b',  // graphite
  '9': '#3b82f6',  // blueberry
  '10': '#22c55e', // basil
  '11': '#ef4444', // tomato
}

// ==================== CONVERSORES ====================

/**
 * Converte evento Fyness (formato DB snake_case) para Google Calendar API format
 */
export function fynessToGoogle(event: any): any {
  const gcalEvent: any = {
    summary: event.title || '',
    description: [event.description, event.notes].filter(Boolean).join('\n\n---\nNotas:\n'),
    start: {
      dateTime: event.start_date,
      timeZone: 'America/Sao_Paulo',
    },
    end: {
      dateTime: event.end_date || event.start_date,
      timeZone: 'America/Sao_Paulo',
    },
  }

  // Color
  if (event.color && COLOR_TO_GOOGLE[event.color]) {
    gcalEvent.colorId = COLOR_TO_GOOGLE[event.color]
  }

  // Recurrence
  if (event.recurrence_type) {
    const rrule = buildRRule(event)
    if (rrule) gcalEvent.recurrence = [rrule]
  }

  // Attendees (se tiverem email)
  if (Array.isArray(event.attendees) && event.attendees.length > 0) {
    gcalEvent.attendees = event.attendees
      .filter((a: any) => typeof a === 'object' && a.email)
      .map((a: any) => ({ email: a.email, displayName: a.name || '' }))
  }

  return gcalEvent
}

/**
 * Converte evento Google Calendar para formato Fyness DB (snake_case)
 */
export function googleToFyness(gcalEvent: any): any {
  const fynessEvent: any = {
    title: gcalEvent.summary || '(Sem titulo)',
    description: gcalEvent.description || '',
    start_date: gcalEvent.start?.dateTime || gcalEvent.start?.date || null,
    end_date: gcalEvent.end?.dateTime || gcalEvent.end?.date || null,
    type: 'task',
    color: '#3b82f6',
    google_event_id: gcalEvent.id,
    google_calendar_id: 'primary',
    sync_source: 'google',
    attended: false,
    was_late: false,
    late_minutes: 0,
    notes: '',
    attachments: [],
  }

  // Color
  if (gcalEvent.colorId && GOOGLE_TO_COLOR[gcalEvent.colorId]) {
    fynessEvent.color = GOOGLE_TO_COLOR[gcalEvent.colorId]
  }

  // Attendees
  if (Array.isArray(gcalEvent.attendees)) {
    fynessEvent.attendees = gcalEvent.attendees.map((a: any) => ({
      name: a.displayName || a.email,
      email: a.email,
    }))
  }

  // Recurrence
  if (gcalEvent.recurrence && gcalEvent.recurrence.length > 0) {
    const rruleStr = gcalEvent.recurrence.find((r: string) => r.startsWith('RRULE:'))
    if (rruleStr) {
      const parsed = parseRRule(rruleStr)
      Object.assign(fynessEvent, parsed)
    }
  }

  return fynessEvent
}

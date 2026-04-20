/**
 * Google Calendar Service — Client-Side (GIS)
 *
 * Usa Google Identity Services (GIS) para OAuth direto no browser.
 * Sem Edge Functions — tudo roda no client.
 * Tokens salvos em google_calendar_tokens via Supabase (com RLS).
 */

import { supabase } from './supabaseClient';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GCAL_API = 'https://www.googleapis.com/calendar/v3';
const SCOPES = 'https://www.googleapis.com/auth/calendar';

// ==================== TOKEN MANAGEMENT ====================

let cachedToken = null;

/** Busca token salvo no Supabase */
async function getSavedToken() {
  const { data, error } = await supabase
    .from('google_calendar_tokens')
    .select('*')
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

/** Salva/atualiza token no Supabase */
async function saveToken(tokenData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario nao autenticado');

  const row = {
    user_id: user.id,
    access_token: tokenData.access_token,
    token_type: tokenData.token_type || 'Bearer',
    expires_at: new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString(),
    scope: tokenData.scope || SCOPES,
    calendar_id: 'primary',
    sync_enabled: true,
    updated_at: new Date().toISOString(),
  };

  // Tentar update primeiro, se nao existir faz insert
  const { data: existing } = await supabase
    .from('google_calendar_tokens')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('google_calendar_tokens')
      .update(row)
      .eq('user_id', user.id);
  } else {
    await supabase
      .from('google_calendar_tokens')
      .insert([row]);
  }

  cachedToken = { ...row };
}

/** Obtem access token valido (do cache ou do Supabase) */
async function getAccessToken() {
  // Checar cache primeiro
  if (cachedToken && new Date(cachedToken.expires_at) > new Date(Date.now() + 60000)) {
    return cachedToken.access_token;
  }

  // Buscar do banco
  const saved = await getSavedToken();
  if (saved && new Date(saved.expires_at) > new Date(Date.now() + 60000)) {
    cachedToken = saved;
    return saved.access_token;
  }

  // Token expirado — precisa reconectar
  return null;
}

// ==================== GIS OAUTH ====================

/** Conecta o Google Calendar via popup GIS */
export function connectGCal() {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('Google Identity Services nao carregou. Recarregue a pagina.'));
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: async (response) => {
        if (response.error) {
          reject(new Error(response.error_description || response.error));
          return;
        }

        try {
          await saveToken(response);
          resolve({ success: true });
        } catch (err) {
          reject(err);
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

/** Reconecta silenciosamente (sem popup, se possivel) */
export function refreshGCalToken() {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) {
      reject(new Error('GIS nao disponivel'));
      return;
    }

    const tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: async (response) => {
        if (response.error) {
          reject(new Error(response.error_description || response.error));
          return;
        }
        try {
          await saveToken(response);
          resolve({ success: true });
        } catch (err) {
          reject(err);
        }
      },
    });

    tokenClient.requestAccessToken({ prompt: '' });
  });
}

// ==================== CONNECTION STATUS ====================

/** Verifica se o usuario tem o Google Calendar conectado */
export async function getGCalConnectionStatus() {
  // Primeiro checar o banco
  const { data, error } = await supabase
    .from('google_calendar_tokens')
    .select('id, sync_enabled, last_sync_at, calendar_id, created_at, expires_at')
    .maybeSingle();

  if (data) {
    if (new Date(data.expires_at) < new Date()) {
      return { ...data, expired: true };
    }
    return data;
  }

  if (error) {
    console.warn('[GCal] Status check error:', error.message);
  }

  // Fallback: checar token em memoria (caso INSERT no banco tenha falhado por RLS)
  if (cachedToken && cachedToken.access_token) {
    const isExpired = new Date(cachedToken.expires_at) < new Date();
    return {
      id: 'cached',
      sync_enabled: true,
      last_sync_at: null,
      calendar_id: cachedToken.calendar_id || 'primary',
      created_at: cachedToken.updated_at,
      expires_at: cachedToken.expires_at,
      expired: isExpired,
    };
  }

  return null;
}

/** Desconecta o Google Calendar */
export async function disconnectGCal() {
  const token = await getAccessToken();

  // Revogar token no Google
  if (token) {
    try {
      await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });
    } catch {
      // Ignorar erro de revogacao
    }
  }

  // Remover do banco
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from('google_calendar_tokens')
      .delete()
      .eq('user_id', user.id);
  }

  cachedToken = null;
  return { success: true };
}

// ==================== EVENT MAPPERS ====================

const FREQ_MAP = {
  daily: 'DAILY',
  weekly: 'WEEKLY',
  monthly: 'MONTHLY',
  yearly: 'YEARLY',
};

const DAY_MAP = { 0: 'SU', 1: 'MO', 2: 'TU', 3: 'WE', 4: 'TH', 5: 'FR', 6: 'SA' };

const COLOR_TO_GOOGLE = {
  '#3b82f6': '9',
  '#f97316': '6',
  '#22c55e': '10',
  '#64748b': '8',
  '#ef4444': '11',
  '#8b5cf6': '3',
};

const GOOGLE_TO_COLOR = {
  '1': '#7986cb', '2': '#33b679', '3': '#8b5cf6', '4': '#e67c73',
  '5': '#f6bf26', '6': '#f97316', '7': '#039be5', '8': '#64748b',
  '9': '#3b82f6', '10': '#22c55e', '11': '#ef4444',
};

const REVERSE_DAY_MAP = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };

function buildRRule(event) {
  const freq = FREQ_MAP[event.recurrence_type];
  if (!freq) return null;

  let rrule = `RRULE:FREQ=${freq}`;
  const config = event.recurrence_config || {};

  if (config.interval && config.interval > 1) rrule += `;INTERVAL=${config.interval}`;
  if (event.recurrence_type === 'weekly' && config.daysOfWeek?.length > 0) {
    const days = config.daysOfWeek.map(d => DAY_MAP[d]).filter(Boolean).join(',');
    if (days) rrule += `;BYDAY=${days}`;
  }
  if (event.recurrence_end_type === 'after' && event.recurrence_end_value) {
    rrule += `;COUNT=${event.recurrence_end_value}`;
  } else if (event.recurrence_end_type === 'on_date' && event.recurrence_end_value) {
    const d = new Date(event.recurrence_end_value);
    rrule += `;UNTIL=${d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`;
  }

  return rrule;
}

function parseRRule(rruleStr) {
  const result = {
    recurrence_type: null,
    recurrence_config: { interval: 1 },
    recurrence_end_type: 'never',
    recurrence_end_value: null,
  };

  const rule = rruleStr.replace(/^RRULE:/, '');
  const parts = {};
  for (const part of rule.split(';')) {
    const [key, value] = part.split('=');
    if (key && value) parts[key] = value;
  }

  const reverseFreq = { DAILY: 'daily', WEEKLY: 'weekly', MONTHLY: 'monthly', YEARLY: 'yearly' };
  if (parts.FREQ) result.recurrence_type = reverseFreq[parts.FREQ] || null;
  if (parts.INTERVAL) result.recurrence_config.interval = parseInt(parts.INTERVAL) || 1;
  if (parts.BYDAY) {
    result.recurrence_config.daysOfWeek = parts.BYDAY.split(',').map(d => REVERSE_DAY_MAP[d]).filter(d => d !== undefined);
  }
  if (parts.COUNT) { result.recurrence_end_type = 'after'; result.recurrence_end_value = parts.COUNT; }
  if (parts.UNTIL) {
    result.recurrence_end_type = 'on_date';
    const u = parts.UNTIL;
    if (u.length >= 8) result.recurrence_end_value = `${u.substring(0, 4)}-${u.substring(4, 6)}-${u.substring(6, 8)}`;
  }

  return result;
}

/** Converte evento Fyness (DB snake_case) para Google Calendar API */
function fynessToGoogle(event) {
  const gcalEvent = {
    summary: event.title || '',
    description: [event.description, event.notes].filter(Boolean).join('\n\n---\nNotas:\n'),
    start: { dateTime: event.start_date, timeZone: 'America/Sao_Paulo' },
    end: { dateTime: event.end_date || event.start_date, timeZone: 'America/Sao_Paulo' },
  };

  if (event.color && COLOR_TO_GOOGLE[event.color]) {
    gcalEvent.colorId = COLOR_TO_GOOGLE[event.color];
  }

  if (event.recurrence_type) {
    const rrule = buildRRule(event);
    if (rrule) gcalEvent.recurrence = [rrule];
  }

  if (Array.isArray(event.attendees) && event.attendees.length > 0) {
    gcalEvent.attendees = event.attendees
      .filter(a => typeof a === 'object' && a.email)
      .map(a => ({ email: a.email, displayName: a.name || '' }));
  }

  return gcalEvent;
}

/** Converte evento Google Calendar para formato Fyness DB */
function googleToFyness(gcalEvent) {
  const fynessEvent = {
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
  };

  if (gcalEvent.colorId && GOOGLE_TO_COLOR[gcalEvent.colorId]) {
    fynessEvent.color = GOOGLE_TO_COLOR[gcalEvent.colorId];
  }

  if (Array.isArray(gcalEvent.attendees)) {
    fynessEvent.attendees = gcalEvent.attendees.map(a => ({
      name: a.displayName || a.email,
      email: a.email,
    }));
  }

  if (gcalEvent.recurrence && gcalEvent.recurrence.length > 0) {
    const rruleStr = gcalEvent.recurrence.find(r => r.startsWith('RRULE:'));
    if (rruleStr) Object.assign(fynessEvent, parseRRule(rruleStr));
  }

  return fynessEvent;
}

// ==================== HELPER: fetch com token ====================

async function gcalFetch(url, options = {}) {
  let token = await getAccessToken();

  // Se token expirado, tentar refresh silencioso
  if (!token) {
    try {
      await refreshGCalToken();
      token = await getAccessToken();
    } catch {
      throw new Error('Token expirado. Reconecte o Google Calendar.');
    }
  }

  if (!token) throw new Error('Token expirado. Reconecte o Google Calendar.');

  const res = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Se 401, token invalido
  if (res.status === 401) {
    cachedToken = null;
    throw new Error('Token expirado. Reconecte o Google Calendar.');
  }

  return res;
}

// ==================== PUSH (Fyness -> Google) ====================

/**
 * Envia um evento para o Google Calendar.
 * Chamada automaticamente apos create/update/delete.
 */
export async function pushEventToGCal(eventId, action) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  // Verificar se esta conectado
  const tokenRow = await getSavedToken();
  if (!tokenRow || !tokenRow.sync_enabled) return null;

  // Verificar se token esta valido
  if (new Date(tokenRow.expires_at) < new Date()) return null;

  const calendarId = tokenRow.calendar_id || 'primary';

  try {
    // ==================== CREATE ====================
    if (action === 'create') {
      const { data: event } = await supabase
        .from('agenda_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (!event || event.sync_source === 'google') return null;

      const gcalEvent = fynessToGoogle(event);
      const res = await gcalFetch(`${GCAL_API}/calendars/${calendarId}/events`, {
        method: 'POST',
        body: JSON.stringify(gcalEvent),
      });

      if (res.ok) {
        const created = await res.json();
        await supabase
          .from('agenda_events')
          .update({ google_event_id: created.id, google_calendar_id: calendarId })
          .eq('id', eventId);
        await logSync(user.id, 'push', 'create', eventId, created.id);
        return { success: true, googleEventId: created.id };
      }
    }

    // ==================== UPDATE ====================
    if (action === 'update') {
      const { data: event } = await supabase
        .from('agenda_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (!event) return null;

      const gcalEvent = fynessToGoogle(event);

      if (!event.google_event_id) {
        if (event.sync_source === 'google') return null;
        // Criar no Google se nao tem ID
        const res = await gcalFetch(`${GCAL_API}/calendars/${calendarId}/events`, {
          method: 'POST',
          body: JSON.stringify(gcalEvent),
        });
        if (res.ok) {
          const created = await res.json();
          await supabase
            .from('agenda_events')
            .update({ google_event_id: created.id, google_calendar_id: calendarId })
            .eq('id', eventId);
          await logSync(user.id, 'push', 'create', eventId, created.id);
        }
        return { success: true };
      }

      const res = await gcalFetch(`${GCAL_API}/calendars/${calendarId}/events/${event.google_event_id}`, {
        method: 'PATCH',
        body: JSON.stringify(gcalEvent),
      });

      if (!res.ok && res.status === 404) {
        // Evento nao existe mais — recriar
        const createRes = await gcalFetch(`${GCAL_API}/calendars/${calendarId}/events`, {
          method: 'POST',
          body: JSON.stringify(gcalEvent),
        });
        if (createRes.ok) {
          const created = await createRes.json();
          await supabase
            .from('agenda_events')
            .update({ google_event_id: created.id })
            .eq('id', eventId);
          await logSync(user.id, 'push', 'create', eventId, created.id);
        }
        return { success: true };
      }

      if (res.ok) {
        await logSync(user.id, 'push', 'update', eventId, event.google_event_id);
      }
      return { success: res.ok };
    }

    // ==================== DELETE ====================
    if (action === 'delete') {
      const { data: event } = await supabase
        .from('agenda_events')
        .select('google_event_id, sync_source')
        .eq('id', eventId)
        .single();

      if (!event?.google_event_id || event.sync_source === 'google') return null;

      const res = await gcalFetch(`${GCAL_API}/calendars/${calendarId}/events/${event.google_event_id}`, {
        method: 'DELETE',
      });

      // 404/410 = ja deletado, OK
      if (res.ok || res.status === 404 || res.status === 410) {
        await logSync(user.id, 'push', 'delete', eventId, event.google_event_id);
      }
      return { success: true };
    }
  } catch (err) {
    console.warn(`[GCal Push] ${action} failed:`, err.message);
    return null;
  }

  return null;
}

// ==================== PULL (Google -> Fyness) ====================

/**
 * Puxa eventos do Google Calendar para o Fyness.
 * Chamada manualmente pelo usuario ou ao abrir a Agenda.
 */
export async function triggerGCalPull() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario nao autenticado');

  const tokenRow = await getSavedToken();
  if (!tokenRow || !tokenRow.sync_enabled) {
    throw new Error('Google Calendar nao conectado');
  }

  const calendarId = tokenRow.calendar_id || 'primary';
  const stats = { created: 0, updated: 0, deleted: 0 };

  // Definir range: 3 meses atras ate 6 meses a frente
  const params = new URLSearchParams();

  if (tokenRow.sync_token) {
    params.set('syncToken', tokenRow.sync_token);
  } else {
    const timeMin = new Date();
    timeMin.setMonth(timeMin.getMonth() - 3);
    params.set('timeMin', timeMin.toISOString());

    const timeMax = new Date();
    timeMax.setMonth(timeMax.getMonth() + 6);
    params.set('timeMax', timeMax.toISOString());

    params.set('singleEvents', 'false');
  }

  params.set('maxResults', '250');

  let nextPageToken = null;
  let newSyncToken = null;

  try {
    do {
      if (nextPageToken) params.set('pageToken', nextPageToken);

      const res = await gcalFetch(`${GCAL_API}/calendars/${calendarId}/events?${params.toString()}`);

      if (!res.ok) {
        // syncToken expirado — fazer full sync
        if (res.status === 410) {
          await supabase
            .from('google_calendar_tokens')
            .update({ sync_token: null, updated_at: new Date().toISOString() })
            .eq('user_id', user.id);
          // Recursao com sync_token limpo
          return triggerGCalPull();
        }
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || `Erro ${res.status}`);
      }

      const data = await res.json();
      const events = data.items || [];
      nextPageToken = data.nextPageToken || null;
      newSyncToken = data.nextSyncToken || null;

      for (const gcalEvent of events) {
        try {
          await processGoogleEvent(user.id, gcalEvent, calendarId, stats);
        } catch (err) {
          console.error(`[GCal Pull] Error processing event ${gcalEvent.id}:`, err);
        }
      }
    } while (nextPageToken);
  } catch (err) {
    // Se for erro de token, nao salvar syncToken
    if (err.message.includes('Token expirado')) throw err;
    throw err;
  }

  // Salvar syncToken e timestamp
  const updateData = {
    last_sync_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (newSyncToken) updateData.sync_token = newSyncToken;

  await supabase
    .from('google_calendar_tokens')
    .update(updateData)
    .eq('user_id', user.id);

  return stats;
}

/** Processa um evento individual do Google Calendar */
async function processGoogleEvent(userId, gcalEvent, calendarId, stats) {
  const googleEventId = gcalEvent.id;

  // Buscar evento existente
  const { data: existing } = await supabase
    .from('agenda_events')
    .select('id, updated_at, sync_source')
    .eq('google_event_id', googleEventId)
    .maybeSingle();

  // Evento cancelado/deletado
  if (gcalEvent.status === 'cancelled') {
    if (existing) {
      await supabase.from('agenda_events').delete().eq('id', existing.id);
      await logSync(userId, 'pull', 'delete', existing.id, googleEventId);
      stats.deleted++;
    }
    return;
  }

  // Evento existente — update
  if (existing) {
    const googleUpdated = new Date(gcalEvent.updated || gcalEvent.created);
    const fynessUpdated = new Date(existing.updated_at);

    if (fynessUpdated > googleUpdated && existing.sync_source === 'fyness') return;

    const fynessEvent = googleToFyness(gcalEvent);
    delete fynessEvent.google_event_id;
    delete fynessEvent.google_calendar_id;
    fynessEvent.updated_at = new Date().toISOString();

    await supabase.from('agenda_events').update(fynessEvent).eq('id', existing.id);
    await logSync(userId, 'pull', 'update', existing.id, googleEventId);
    stats.updated++;
    return;
  }

  // Evento novo — verificar duplicata por titulo/data
  const { data: byTitle } = await supabase
    .from('agenda_events')
    .select('id')
    .eq('title', gcalEvent.summary || '')
    .gte('start_date', gcalEvent.start?.dateTime || gcalEvent.start?.date || '')
    .lte('start_date', gcalEvent.start?.dateTime || gcalEvent.start?.date || '')
    .limit(1);

  if (byTitle && byTitle.length > 0) {
    await supabase
      .from('agenda_events')
      .update({ google_event_id: googleEventId, google_calendar_id: calendarId })
      .eq('id', byTitle[0].id);
    return;
  }

  // Criar evento novo
  const fynessEvent = googleToFyness(gcalEvent);
  const { data: { user } } = await supabase.auth.getUser();
  const id = `evt_g_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  await supabase.from('agenda_events').insert([{
    id,
    user_id: user?.id,
    ...fynessEvent,
    google_calendar_id: calendarId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }]);

  await logSync(userId, 'pull', 'create', id, googleEventId);
  stats.created++;
}

// ==================== SYNC LOG ====================

async function logSync(userId, direction, action, fynessId, googleId, status = 'success', errorMsg = null) {
  try {
    await supabase.from('google_sync_log').insert([{
      user_id: userId,
      direction,
      action,
      fyness_event_id: fynessId || null,
      google_event_id: googleId || null,
      status,
      error_message: errorMsg,
    }]);
  } catch {
    // Log falhou — nao bloquear a operacao principal
  }
}

// ==================== DIRECT GOOGLE CALENDAR CRUD ====================
// Essas funcoes operam DIRETO na API do Google Calendar.
// A agenda do Fyness vira um "client" do Google Calendar.

/**
 * Busca eventos do Google Calendar num range de datas.
 * Retorna no formato Fyness (camelCase) para uso direto no AgendaPage.
 */
export async function fetchGCalEvents(timeMin, timeMax) {
  const params = new URLSearchParams({
    timeMin: timeMin instanceof Date ? timeMin.toISOString() : timeMin,
    timeMax: timeMax instanceof Date ? timeMax.toISOString() : timeMax,
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '500',
  });

  const res = await gcalFetch(`${GCAL_API}/calendars/primary/events?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `Erro ${res.status}`);
  }

  const data = await res.json();
  const events = data.items || [];

  // Converter para formato Fyness (camelCase) para uso no AgendaPage
  return events
    .filter(e => e.status !== 'cancelled')
    .map(gcalEvent => ({
      id: gcalEvent.id,
      title: gcalEvent.summary || '(Sem titulo)',
      description: gcalEvent.description || '',
      startDate: gcalEvent.start?.dateTime || gcalEvent.start?.date || null,
      endDate: gcalEvent.end?.dateTime || gcalEvent.end?.date || null,
      type: 'task',
      color: gcalEvent.colorId ? (GOOGLE_TO_COLOR[gcalEvent.colorId] || '#3b82f6') : '#3b82f6',
      attended: false,
      wasLate: false,
      lateMinutes: 0,
      recurrenceType: null,
      recurrenceConfig: {},
      recurrenceEndType: 'never',
      recurrenceEndValue: null,
      recurrenceExceptions: [],
      attendees: Array.isArray(gcalEvent.attendees)
        ? gcalEvent.attendees.map(a => ({ name: a.displayName || a.email, email: a.email }))
        : [],
      notes: '',
      attachments: [],
      googleEventId: gcalEvent.id,
      syncSource: 'google',
      // Campos extras do Google
      location: gcalEvent.location || '',
      htmlLink: gcalEvent.htmlLink || '',
      meetLink: (() => {
        const link = gcalEvent.hangoutLink || gcalEvent.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri || null;
        // So aceitar links do Google Meet (ignorar tasks.google.com etc)
        if (link && link.includes('meet.google.com')) return link;
        return null;
      })(),
      organizer: gcalEvent.organizer?.email || '',
      isAllDay: !!gcalEvent.start?.date && !gcalEvent.start?.dateTime,
    }));
}

/**
 * Cria evento direto no Google Calendar.
 * Retorna o evento criado no formato Fyness.
 */
export async function createGCalEvent(eventData) {
  const gcalEvent = {
    summary: eventData.title || '',
    description: eventData.description || '',
    start: eventData.isAllDay
      ? { date: eventData.startDate?.split('T')[0] }
      : { dateTime: eventData.startDate, timeZone: 'America/Sao_Paulo' },
    end: eventData.isAllDay
      ? { date: eventData.endDate?.split('T')[0] || eventData.startDate?.split('T')[0] }
      : { dateTime: eventData.endDate || eventData.startDate, timeZone: 'America/Sao_Paulo' },
  };

  if (eventData.color && COLOR_TO_GOOGLE[eventData.color]) {
    gcalEvent.colorId = COLOR_TO_GOOGLE[eventData.color];
  }

  if (eventData.location) gcalEvent.location = eventData.location;

  // Google Meet automatico apenas para reunioes ONLINE (nao presenciais)
  const isMeeting = eventData.type === 'meeting';
  const isOnlineMeeting = isMeeting && eventData.meetingMode !== 'presencial';
  if (isOnlineMeeting) {
    gcalEvent.conferenceData = {
      createRequest: {
        requestId: `meet_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    };
  }

  // conferenceDataVersion=1 necessario para criar Meet
  const url = isOnlineMeeting
    ? `${GCAL_API}/calendars/primary/events?conferenceDataVersion=1`
    : `${GCAL_API}/calendars/primary/events`;

  const res = await gcalFetch(url, {
    method: 'POST',
    body: JSON.stringify(gcalEvent),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Erro ao criar evento');
  }

  const created = await res.json();
  return {
    id: created.id,
    title: created.summary,
    startDate: created.start?.dateTime || created.start?.date,
    endDate: created.end?.dateTime || created.end?.date,
    googleEventId: created.id,
    meetLink: created.hangoutLink || created.conferenceData?.entryPoints?.find(e => e.entryPointType === 'video')?.uri || null,
  };
}

/**
 * Atualiza evento direto no Google Calendar.
 */
export async function updateGCalEvent(googleEventId, eventData) {
  const gcalEvent = {};
  if (eventData.title !== undefined) gcalEvent.summary = eventData.title;
  if (eventData.description !== undefined) gcalEvent.description = eventData.description;
  if (eventData.location !== undefined) gcalEvent.location = eventData.location;

  if (eventData.startDate) {
    gcalEvent.start = eventData.isAllDay
      ? { date: eventData.startDate.split('T')[0] }
      : { dateTime: eventData.startDate, timeZone: 'America/Sao_Paulo' };
  }
  if (eventData.endDate) {
    gcalEvent.end = eventData.isAllDay
      ? { date: eventData.endDate.split('T')[0] }
      : { dateTime: eventData.endDate, timeZone: 'America/Sao_Paulo' };
  }
  if (eventData.color && COLOR_TO_GOOGLE[eventData.color]) {
    gcalEvent.colorId = COLOR_TO_GOOGLE[eventData.color];
  }

  const res = await gcalFetch(`${GCAL_API}/calendars/primary/events/${googleEventId}`, {
    method: 'PATCH',
    body: JSON.stringify(gcalEvent),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Erro ao atualizar evento');
  }

  return res.json();
}

/**
 * Deleta evento do Google Calendar.
 */
export async function deleteGCalEvent(googleEventId) {
  const res = await gcalFetch(`${GCAL_API}/calendars/primary/events/${googleEventId}`, {
    method: 'DELETE',
  });

  // 404/410 = ja deletado
  if (!res.ok && res.status !== 404 && res.status !== 410) {
    throw new Error('Erro ao deletar evento');
  }

  return { success: true };
}

/**
 * Verifica se o usuario tem token valido (sem ir ao banco).
 * Util para checar rapidamente se pode usar as funcoes de CRUD.
 */
export async function isGCalReady() {
  const token = await getAccessToken();
  return !!token;
}

// ==================== O.S. -> GOOGLE CALENDAR ====================

const OS_STATUS_LABELS = {
  pending: 'Pendente', in_progress: 'Em Andamento', done: 'Concluida',
  blocked: 'Bloqueada', review: 'Em Revisao',
};
const OS_PRIORITY_LABELS = {
  critical: 'Critica', high: 'Alta', medium: 'Media', low: 'Baixa',
};

/**
 * Sincroniza uma O.S. com o Google Calendar.
 * Cria ou atualiza o evento correspondente.
 */
export async function syncOSToGCal(os) {
  const token = await getAccessToken();
  if (!token) return null;

  const osNum = os.type === 'emergency' ? `EMG-${os.emergencyNumber}` : `#${os.number}`;

  // Montar descricao completa
  const descParts = [];
  if (os.client) descParts.push(`Cliente: ${os.client}`);
  if (os.description) descParts.push(`Descricao: ${os.description}`);
  if (os.priority) descParts.push(`Prioridade: ${OS_PRIORITY_LABELS[os.priority] || os.priority}`);
  if (os.status) descParts.push(`Status: ${OS_STATUS_LABELS[os.status] || os.status}`);
  if (os.assignee || os.assignedTo) descParts.push(`Responsavel: ${os.assignee || os.assignedTo}`);
  if (os.location) descParts.push(`Local: ${os.location}`);
  if (os.notes) descParts.push(`\nNotas:\n${os.notes}`);

  // Calcular datas
  let startDate, endDate;
  if (os.estimatedStart) {
    startDate = os.estimatedStart;
    endDate = os.estimatedEnd || new Date(new Date(os.estimatedStart).getTime() + 3600000).toISOString();
  } else if (os.actualStart) {
    startDate = os.actualStart;
    endDate = os.actualEnd || new Date(new Date(os.actualStart).getTime() + 3600000).toISOString();
  } else if (os.slaDeadline) {
    endDate = os.slaDeadline;
    startDate = new Date(new Date(os.slaDeadline).getTime() - 3600000).toISOString();
  } else {
    // Sem datas — nao sincronizar
    return null;
  }

  const gcalEvent = {
    summary: `O.S. ${osNum} - ${os.title}`,
    description: descParts.join('\n'),
    start: { dateTime: startDate, timeZone: 'America/Sao_Paulo' },
    end: { dateTime: endDate, timeZone: 'America/Sao_Paulo' },
    colorId: os.status === 'done' ? '10' : os.type === 'emergency' ? '11' : '6', // verde/vermelho/laranja
  };

  try {
    // Checar se ja tem google_event_id na O.S. (via sync_log ou campo)
    const { data: logEntry } = await supabase
      .from('google_sync_log')
      .select('google_event_id')
      .eq('fyness_event_id', os.id)
      .eq('direction', 'push')
      .not('google_event_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (logEntry?.google_event_id) {
      // Update evento existente
      const res = await gcalFetch(`${GCAL_API}/calendars/primary/events/${logEntry.google_event_id}`, {
        method: 'PATCH',
        body: JSON.stringify(gcalEvent),
      });
      if (res.ok) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) await logSync(user.id, 'push', 'update', os.id, logEntry.google_event_id);
        return { success: true, action: 'updated' };
      }
      // Se 404, evento foi deletado no Google — recriar
      if (res.status !== 404) return null;
    }

    // Criar novo evento
    const res = await gcalFetch(`${GCAL_API}/calendars/primary/events`, {
      method: 'POST',
      body: JSON.stringify(gcalEvent),
    });

    if (res.ok) {
      const created = await res.json();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await logSync(user.id, 'push', 'create', os.id, created.id);
      return { success: true, action: 'created', googleEventId: created.id };
    }
  } catch (err) {
    console.warn('[GCal] Erro ao sincronizar O.S.:', err.message);
  }

  return null;
}

/**
 * Remove evento de O.S. do Google Calendar.
 */
export async function deleteOSFromGCal(osId) {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const { data: logEntry } = await supabase
      .from('google_sync_log')
      .select('google_event_id')
      .eq('fyness_event_id', osId)
      .eq('direction', 'push')
      .not('google_event_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (logEntry?.google_event_id) {
      await gcalFetch(`${GCAL_API}/calendars/primary/events/${logEntry.google_event_id}`, {
        method: 'DELETE',
      });
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await logSync(user.id, 'push', 'delete', osId, logEntry.google_event_id);
    }
  } catch (err) {
    console.warn('[GCal] Erro ao deletar O.S. do GCal:', err.message);
  }

  return null;
}

/** Busca os ultimos registros de sync */
export async function getGCalSyncLog(limit = 10) {
  const { data, error } = await supabase
    .from('google_sync_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data || [];
}

// Exports internos para testes unitarios
export const __test__ = {
  fynessToGoogle,
  googleToFyness,
  buildRRule,
  parseRRule,
};

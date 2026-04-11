/**
 * Shared: Google OAuth token management
 * Usado por todas as Edge Functions de Google Calendar.
 */

const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID')!
const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET')!

export interface TokenRow {
  id: string
  user_id: string
  access_token: string
  refresh_token: string
  expires_at: string
  calendar_id: string
  sync_enabled: boolean
  last_sync_at: string | null
  sync_token: string | null
}

/**
 * Obtem um access token valido, renovando se necessario.
 * Usa service_role client para ler/atualizar tokens.
 */
export async function getValidAccessToken(
  supabase: any,
  userId: string
): Promise<string | null> {
  const { data: tokenRow, error } = await supabase
    .from('google_calendar_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !tokenRow) return null

  const expiresAt = new Date(tokenRow.expires_at)
  const now = new Date()
  const bufferMs = 5 * 60 * 1000 // 5 minutos de margem

  // Token ainda valido
  if (expiresAt.getTime() - now.getTime() > bufferMs) {
    return tokenRow.access_token
  }

  // Renovar token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: tokenRow.refresh_token,
      grant_type: 'refresh_token',
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    console.error('[GCal] Token refresh failed:', data)
    // Se o refresh falhar (usuario revogou acesso), desabilitar sync
    if (data.error === 'invalid_grant') {
      await supabase
        .from('google_calendar_tokens')
        .update({ sync_enabled: false, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
    }
    return null
  }

  const newExpiresAt = new Date(Date.now() + data.expires_in * 1000)

  await supabase
    .from('google_calendar_tokens')
    .update({
      access_token: data.access_token,
      expires_at: newExpiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  return data.access_token
}

/**
 * Headers CORS padrao para Edge Functions
 */
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

/**
 * Resposta JSON padronizada
 */
export function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

/**
 * Registra operacao no sync log
 */
export async function logSync(
  supabase: any,
  userId: string,
  direction: 'push' | 'pull',
  action: 'create' | 'update' | 'delete',
  eventId: string | null,
  googleEventId: string | null,
  status: 'success' | 'error' | 'conflict' = 'success',
  errorMessage?: string
) {
  await supabase.from('google_sync_log').insert([{
    user_id: userId,
    direction,
    event_id: eventId,
    google_event_id: googleEventId,
    action,
    status,
    error_message: errorMessage || null,
  }])
}

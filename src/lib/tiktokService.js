/**
 * TikTok Service - Video Publishing (Enterprise Mode)
 *
 * TikTok requer OAuth para autorização - não aceita token fixo.
 * Após autorização inicial, o refresh_token é salvo no Supabase
 * e usado para auto-renovar access_token (expira em 24h).
 *
 * Configuração:
 *   Frontend (.env):
 *     VITE_TIKTOK_CLIENT_KEY=seu_client_key
 *     VITE_TIKTOK_REDIRECT_URI=https://seu-site.com/auth/tiktok-callback
 *
 *   Supabase Secrets (Edge Function):
 *     TIKTOK_CLIENT_KEY=seu_client_key
 *     TIKTOK_CLIENT_SECRET=seu_client_secret
 *     TIKTOK_REDIRECT_URI=https://seu-site.com/auth/tiktok-callback
 *
 * Fluxo:
 *   1. Usuário clica "Conectar TikTok"
 *   2. Redireciona para TikTok OAuth
 *   3. TikTok retorna com código de autorização
 *   4. Edge Function troca código por tokens (server-side, seguro)
 *   5. Tokens são salvos no Supabase
 *   6. Usa access_token para publicar vídeos
 *
 * Documentação:
 * - https://developers.tiktok.com/doc/content-posting-api-get-started/
 */

import { supabase } from './supabaseClient';

const CLIENT_KEY = import.meta.env.VITE_TIKTOK_CLIENT_KEY || '';
const REDIRECT_URI = import.meta.env.VITE_TIKTOK_REDIRECT_URI || '';

const TIKTOK_AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize/';

// URL das Edge Functions (server-side seguro - evita CORS)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const TIKTOK_OAUTH_FUNCTION = `${SUPABASE_URL}/functions/v1/tiktok-oauth`;
const TIKTOK_PUBLISH_FUNCTION = `${SUPABASE_URL}/functions/v1/tiktok-publish`;

// Scopes necessários para publicação de vídeo
const SCOPES = ['user.info.basic', 'video.upload', 'video.publish'];

// ==================== TOKEN STORAGE ====================

/**
 * Salva tokens do TikTok no Supabase
 */
async function saveTokens(tokens) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuário não autenticado');

  const tokenData = {
    user_id: user.id,
    platform: 'tiktok',
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    open_id: tokens.open_id,
    expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    refresh_expires_at: new Date(Date.now() + tokens.refresh_expires_in * 1000).toISOString(),
    scope: tokens.scope,
    updated_at: new Date().toISOString(),
  };

  // Upsert - insere ou atualiza
  const { error } = await supabase
    .from('social_tokens')
    .upsert(tokenData, { onConflict: 'user_id,platform' });

  if (error) {
    console.error('[TikTok] Erro ao salvar tokens:', error);
    throw new Error('Erro ao salvar tokens: ' + error.message);
  }

  return tokenData;
}

/**
 * Busca tokens do TikTok do Supabase
 */
async function getStoredTokens() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('social_tokens')
    .select('*')
    .eq('user_id', user.id)
    .eq('platform', 'tiktok')
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Remove tokens do TikTok do Supabase
 */
async function deleteTokens() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('social_tokens')
    .delete()
    .eq('user_id', user.id)
    .eq('platform', 'tiktok');
}

// ==================== OAUTH FLOW ====================

/**
 * Verifica se TikTok está configurado
 * Nota: CLIENT_SECRET é mantido apenas no servidor (Edge Function)
 */
export function isTikTokConfigured() {
  return !!CLIENT_KEY && !!REDIRECT_URI && !!SUPABASE_URL;
}

/**
 * Gera URL de autorização OAuth do TikTok
 */
export function getTikTokAuthUrl() {
  if (!isTikTokConfigured()) {
    throw new Error('TikTok não configurado. Verifique as variáveis VITE_TIKTOK_* no .env');
  }

  // Gerar state para segurança (prevenir CSRF)
  // Usar localStorage para persistir entre redirects
  const state = crypto.randomUUID();
  localStorage.setItem('tiktok_oauth_state', state);

  const params = new URLSearchParams({
    client_key: CLIENT_KEY,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(','),
    state,
  });

  return `${TIKTOK_AUTH_URL}?${params.toString()}`;
}

/**
 * Troca código de autorização por tokens (via Edge Function)
 * A troca é feita server-side para manter CLIENT_SECRET seguro
 */
export async function exchangeCodeForTokens(code, state) {
  // Verificar state para segurança (opcional em server-side, mas mantemos por consistência)
  const savedState = localStorage.getItem('tiktok_oauth_state');
  if (state !== savedState) {
    console.warn('[TikTok] State mismatch - saved:', savedState, 'received:', state);
    if (savedState) {
      throw new Error('Estado inválido. Possível ataque CSRF.');
    }
    console.warn('[TikTok] State não encontrado no storage, continuando...');
  }
  localStorage.removeItem('tiktok_oauth_state');

  // Obter token de sessão do Supabase para autenticação
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Usuário não autenticado no Supabase');
  }

  console.log('[TikTok] Trocando código via Edge Function...');

  // Chamar Edge Function para trocar código por tokens (server-side)
  const response = await fetch(`${TIKTOK_OAUTH_FUNCTION}/exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ code }),
  });

  const data = await response.json();

  if (data.error) {
    console.error('[TikTok] Erro na troca de token:', data.error);
    throw new Error(data.error);
  }

  console.log('[TikTok] Tokens obtidos com sucesso!');
  return data;
}

/**
 * Renova access_token usando refresh_token (via Edge Function)
 */
export async function refreshAccessToken() {
  // Obter token de sessão do Supabase para autenticação
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Usuário não autenticado no Supabase');
  }

  console.log('[TikTok] Renovando token via Edge Function...');

  const response = await fetch(`${TIKTOK_OAUTH_FUNCTION}/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({}),
  });

  const data = await response.json();

  if (data.error) {
    console.error('[TikTok] Erro ao renovar token:', data.error);
    throw new Error(data.error);
  }

  console.log('[TikTok] Token renovado com sucesso!');
  return data;
}

/**
 * Obtém access_token válido (renova se necessário)
 */
async function getValidAccessToken() {
  let stored = await getStoredTokens();
  if (!stored) {
    throw new Error('TikTok não conectado. Autorize o app primeiro.');
  }

  // Verificar se access_token expirou (com margem de 5 minutos)
  const expiresAt = new Date(stored.expires_at);
  const now = new Date();
  const marginMs = 5 * 60 * 1000; // 5 minutos

  if (expiresAt.getTime() - marginMs < now.getTime()) {
    console.log('[TikTok] Token expirado, renovando...');
    await refreshAccessToken();
    // Refetch tokens do banco após renovação
    stored = await getStoredTokens();
    if (!stored) {
      throw new Error('Erro ao renovar token do TikTok');
    }
  }

  return stored.access_token;
}

// ==================== STATUS ====================

/**
 * Verifica status da conexão TikTok
 */
export async function getTikTokStatus() {
  if (!isTikTokConfigured()) {
    return {
      connected: false,
      configured: false,
      error: 'TikTok não configurado. Preencha VITE_TIKTOK_* no .env',
    };
  }

  const stored = await getStoredTokens();
  if (!stored) {
    return {
      connected: false,
      configured: true,
      error: null,
    };
  }

  // Verificar se refresh_token expirou
  if (new Date(stored.refresh_expires_at) < new Date()) {
    await deleteTokens();
    return {
      connected: false,
      configured: true,
      error: 'Token expirado. Reconecte o TikTok.',
    };
  }

  // Buscar informações do usuário
  try {
    const userInfo = await fetchUserInfo();

    return {
      connected: true,
      configured: true,
      open_id: stored.open_id,
      username: userInfo?.display_name || stored.open_id,
      avatar_url: userInfo?.avatar_url,
      expires_at: stored.expires_at,
      refresh_expires_at: stored.refresh_expires_at,
    };
  } catch (err) {
    return {
      connected: false,
      configured: true,
      error: err.message,
    };
  }
}

/**
 * Busca informações do usuário TikTok (via Edge Function)
 */
async function fetchUserInfo() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  try {
    const response = await fetch(`${TIKTOK_PUBLISH_FUNCTION}/user-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json();

    if (data.error) {
      console.error('[TikTok] Erro ao buscar usuário:', data.error);
      return null;
    }

    return data.user;
  } catch (err) {
    console.error('[TikTok] Erro ao buscar usuário:', err);
    return null;
  }
}

/**
 * Desconecta TikTok (remove tokens)
 */
export async function disconnectTikTok() {
  await deleteTokens();
  return { success: true };
}

// ==================== PUBLISHING ====================

/**
 * Publica vídeo no TikTok (via Edge Function)
 *
 * A Edge Function faz as chamadas server-side para evitar CORS:
 * 1. POST /v2/post/publish/video/init/ - Inicializa upload
 * 2. Aguarda processamento
 * 3. POST /v2/post/publish/status/fetch/ - Verifica status
 *
 * @param {Object} options
 * @param {string} options.videoUrl - URL pública do vídeo
 * @param {string} options.title - Título/caption do vídeo (max 150 chars)
 * @param {string} options.privacyLevel - PUBLIC, FRIENDS, PRIVATE
 * @param {boolean} options.disableComment - Desabilitar comentários
 * @param {boolean} options.disableDuet - Desabilitar duetos
 * @param {boolean} options.disableStitch - Desabilitar stitch
 */
export async function publishToTikTok({
  videoUrl,
  title = '',
  privacyLevel = 'PUBLIC',
  disableComment = false,
  disableDuet = false,
  disableStitch = false,
}) {
  // Obter token de sessão do Supabase para autenticação
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Usuário não autenticado no Supabase');
  }

  // Truncar título se necessário (TikTok limita a 150 caracteres)
  const caption = title.length > 150 ? title.substring(0, 147) + '...' : title;

  console.log('[TikTok] Iniciando publicação via Edge Function:', { videoUrl, caption, privacyLevel });

  // Chamar Edge Function para publicar (server-side - evita CORS)
  const response = await fetch(`${TIKTOK_PUBLISH_FUNCTION}/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      videoUrl,
      title: caption,
      privacyLevel: privacyLevel.toLowerCase(),
      disableComment,
      disableDuet,
      disableStitch,
    }),
  });

  const data = await response.json();

  if (data.error) {
    console.error('[TikTok] Erro na publicação:', data.error);
    throw new Error(data.error);
  }

  console.log('[TikTok] Publicação concluída:', data);

  // Log de sucesso
  await logPublishResult({
    platform: 'tiktok',
    media_id: data.publish_id,
    status: 'success',
  });

  return {
    id: data.publish_id,
    platform: 'tiktok',
    status: data.status,
  };
}

// ==================== LOGGING ====================

async function logPublishResult({ platform, media_id, status, error_message }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('meta_publish_logs')
    .insert([{
      user_id: user.id,
      platform,
      media_id,
      status,
      error_message,
      created_at: new Date().toISOString(),
    }]);
}

// ==================== QUOTA/LIMITS ====================

/**
 * Verifica limites de publicação do TikTok
 * TikTok permite 5 vídeos por dia no modo sandbox
 */
export async function getTikTokQuota() {
  // TikTok não tem endpoint público para verificar quota
  // Em sandbox: limite de 5 vídeos/dia
  // Em produção: limites variam por app
  return {
    daily_limit: 5,
    note: 'Limite do modo sandbox. Em produção, consulte o TikTok Developer Portal.',
  };
}

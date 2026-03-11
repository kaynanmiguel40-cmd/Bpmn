/**
 * YouTube Service - Video Publishing (YouTube Shorts)
 *
 * YouTube/Google requer OAuth 2.0 para autorização.
 * Após autorização inicial, o refresh_token é salvo no Supabase
 * e usado para auto-renovar access_token (expira em 1h).
 *
 * Configuração:
 *   Frontend (.env):
 *     VITE_YOUTUBE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
 *     VITE_YOUTUBE_REDIRECT_URI=https://seu-site.com/auth/youtube-callback
 *
 *   Supabase Secrets (Edge Function):
 *     YOUTUBE_CLIENT_ID=seu_client_id.apps.googleusercontent.com
 *     YOUTUBE_CLIENT_SECRET=seu_client_secret
 *     YOUTUBE_REDIRECT_URI=https://seu-site.com/auth/youtube-callback
 *
 * Fluxo:
 *   1. Usuário clica "Conectar YouTube"
 *   2. Redireciona para Google OAuth
 *   3. Google retorna com código de autorização
 *   4. Edge Function troca código por tokens (server-side, seguro)
 *   5. Tokens são salvos no Supabase
 *   6. Usa access_token para publicar vídeos
 *
 * YouTube Shorts:
 *   - Vídeos verticais (9:16) com menos de 60 segundos
 *   - Incluir #Shorts no título ou descrição
 *   - Quota: 10.000 unidades/dia, upload = 1.600 unidades (~6 vídeos/dia)
 *
 * Documentação:
 * - https://developers.google.com/youtube/v3/guides/uploading_a_video
 */

import { supabase } from './supabaseClient';

const CLIENT_ID = import.meta.env.VITE_YOUTUBE_CLIENT_ID || '';
const REDIRECT_URI = import.meta.env.VITE_YOUTUBE_REDIRECT_URI || '';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';

// URL das Edge Functions (server-side seguro - evita CORS)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const YOUTUBE_OAUTH_FUNCTION = `${SUPABASE_URL}/functions/v1/youtube-oauth`;
const YOUTUBE_PUBLISH_FUNCTION = `${SUPABASE_URL}/functions/v1/youtube-publish`;

// Scopes necessários para upload de vídeo
const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
];

// ==================== TOKEN STORAGE ====================

/**
 * Busca tokens do YouTube do Supabase
 */
async function getStoredTokens() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('social_tokens')
    .select('*')
    .eq('user_id', user.id)
    .eq('platform', 'youtube')
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Remove tokens do YouTube do Supabase
 */
async function deleteTokens() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from('social_tokens')
    .delete()
    .eq('user_id', user.id)
    .eq('platform', 'youtube');
}

// ==================== OAUTH FLOW ====================

/**
 * Verifica se YouTube está configurado
 */
export function isYouTubeConfigured() {
  return !!CLIENT_ID && !!REDIRECT_URI && !!SUPABASE_URL;
}

/**
 * Gera URL de autorização OAuth do Google/YouTube
 */
export function getYouTubeAuthUrl() {
  if (!isYouTubeConfigured()) {
    throw new Error('YouTube não configurado. Verifique as variáveis VITE_YOUTUBE_* no .env');
  }

  // Gerar state para segurança (prevenir CSRF)
  const state = crypto.randomUUID();
  localStorage.setItem('youtube_oauth_state', state);

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPES.join(' '),
    state,
    access_type: 'offline', // Necessário para obter refresh_token
    prompt: 'consent', // Forçar tela de consentimento para garantir refresh_token
  });

  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/**
 * Troca código de autorização por tokens (via Edge Function)
 * A troca é feita server-side para manter CLIENT_SECRET seguro
 */
export async function exchangeCodeForTokens(code, state) {
  // Verificar state para segurança
  const savedState = localStorage.getItem('youtube_oauth_state');
  if (state !== savedState) {
    console.warn('[YouTube] State mismatch - saved:', savedState, 'received:', state);
    if (savedState) {
      throw new Error('Estado inválido. Possível ataque CSRF.');
    }
    console.warn('[YouTube] State não encontrado no storage, continuando...');
  }
  localStorage.removeItem('youtube_oauth_state');

  // Obter token de sessão do Supabase para autenticação
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Usuário não autenticado no Supabase');
  }

  console.log('[YouTube] Trocando código via Edge Function...');

  // Chamar Edge Function para trocar código por tokens (server-side)
  const response = await fetch(`${YOUTUBE_OAUTH_FUNCTION}/exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ code }),
  });

  const data = await response.json();

  if (data.error) {
    console.error('[YouTube] Erro na troca de token:', data.error);
    throw new Error(data.error);
  }

  console.log('[YouTube] Tokens obtidos com sucesso!');
  return data;
}

/**
 * Renova access_token usando refresh_token (via Edge Function)
 */
export async function refreshAccessToken() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Usuário não autenticado no Supabase');
  }

  console.log('[YouTube] Renovando token via Edge Function...');

  const response = await fetch(`${YOUTUBE_OAUTH_FUNCTION}/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({}),
  });

  const data = await response.json();

  if (data.error) {
    console.error('[YouTube] Erro ao renovar token:', data.error);
    throw new Error(data.error);
  }

  console.log('[YouTube] Token renovado com sucesso!');
  return data;
}

// ==================== STATUS ====================

/**
 * Verifica status da conexão YouTube
 */
export async function getYouTubeStatus() {
  if (!isYouTubeConfigured()) {
    return {
      connected: false,
      configured: false,
      error: 'YouTube não configurado. Preencha VITE_YOUTUBE_* no .env',
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

  // Buscar informações do canal
  try {
    const channelInfo = await fetchChannelInfo();

    // Parse extra_data para email
    let extraData = {};
    try {
      extraData = stored.extra_data ? JSON.parse(stored.extra_data) : {};
    } catch {
      extraData = {};
    }

    return {
      connected: true,
      configured: true,
      channel_id: channelInfo?.channel?.id || stored.open_id,
      channel_name: channelInfo?.channel?.title,
      channel_thumbnail: channelInfo?.channel?.thumbnail,
      subscriber_count: channelInfo?.channel?.subscriberCount,
      video_count: channelInfo?.channel?.videoCount,
      email: channelInfo?.email || extraData.email,
      expires_at: stored.expires_at,
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
 * Busca informações do canal YouTube (via Edge Function)
 */
async function fetchChannelInfo() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return null;

  try {
    const response = await fetch(`${YOUTUBE_PUBLISH_FUNCTION}/user-info`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    const data = await response.json();

    if (data.error) {
      console.error('[YouTube] Erro ao buscar canal:', data.error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('[YouTube] Erro ao buscar canal:', err);
    return null;
  }
}

/**
 * Desconecta YouTube (remove tokens)
 */
export async function disconnectYouTube() {
  await deleteTokens();
  return { success: true };
}

// ==================== PUBLISHING ====================

/**
 * Publica vídeo no YouTube (via Edge Function)
 *
 * @param {Object} options
 * @param {string} options.videoUrl - URL pública do vídeo
 * @param {string} options.title - Título do vídeo (max 100 chars)
 * @param {string} options.description - Descrição do vídeo (max 5000 chars)
 * @param {string[]} options.tags - Tags do vídeo
 * @param {string} options.categoryId - ID da categoria (padrão: 22 - People & Blogs)
 * @param {string} options.privacyStatus - public, unlisted, private (padrão: private)
 * @param {boolean} options.isShort - Se true, adiciona #Shorts ao título
 */
export async function publishToYouTube({
  videoUrl,
  title = '',
  description = '',
  tags = [],
  categoryId = '22',
  privacyStatus = 'private',
  isShort = true, // Por padrão, tratamos como Short
}) {
  // Obter token de sessão do Supabase para autenticação
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Usuário não autenticado no Supabase');
  }

  console.log('[YouTube] Iniciando publicação via Edge Function:', {
    videoUrl,
    title,
    privacyStatus,
    isShort,
  });

  // Chamar Edge Function para publicar (server-side)
  const response = await fetch(`${YOUTUBE_PUBLISH_FUNCTION}/publish`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      videoUrl,
      title,
      description,
      tags,
      categoryId,
      privacyStatus,
      isShort,
    }),
  });

  const data = await response.json();

  if (data.error) {
    console.error('[YouTube] Erro na publicação:', data.error);
    throw new Error(data.error);
  }

  console.log('[YouTube] Publicação concluída:', data);

  // Log de sucesso
  await logPublishResult({
    platform: 'youtube',
    media_id: data.video_id,
    status: 'success',
  });

  return {
    id: data.video_id,
    platform: 'youtube',
    url: data.url,
    shorts_url: data.shorts_url,
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
 * Retorna informações sobre quota do YouTube
 * YouTube Data API tem 10.000 unidades/dia
 * Upload de vídeo consome 1.600 unidades
 */
export function getYouTubeQuota() {
  return {
    daily_quota: 10000,
    upload_cost: 1600,
    max_uploads_per_day: Math.floor(10000 / 1600), // ~6 vídeos
    note: 'Quota padrão. Pode solicitar aumento no Google Cloud Console.',
  };
}

// ==================== CATEGORIES ====================

/**
 * Categorias comuns do YouTube
 */
export const YOUTUBE_CATEGORIES = [
  { id: '1', name: 'Film & Animation' },
  { id: '2', name: 'Autos & Vehicles' },
  { id: '10', name: 'Music' },
  { id: '15', name: 'Pets & Animals' },
  { id: '17', name: 'Sports' },
  { id: '19', name: 'Travel & Events' },
  { id: '20', name: 'Gaming' },
  { id: '22', name: 'People & Blogs' },
  { id: '23', name: 'Comedy' },
  { id: '24', name: 'Entertainment' },
  { id: '25', name: 'News & Politics' },
  { id: '26', name: 'Howto & Style' },
  { id: '27', name: 'Education' },
  { id: '28', name: 'Science & Technology' },
  { id: '29', name: 'Nonprofits & Activism' },
];

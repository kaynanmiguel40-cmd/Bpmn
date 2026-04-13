/**
 * Meta Social Service - Instagram Content Publishing
 *
 * Usa Instagram Login API (não Facebook Login) para autenticação direta.
 * Suporta: Feed posts, Reels, Stories para contas Business/Creator
 *
 * Documentacao:
 * - https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/
 * - https://developers.facebook.com/docs/instagram-platform/content-publishing/
 */

import { supabase } from './supabaseClient';

const META_APP_ID = import.meta.env.VITE_META_APP_ID || '';
// META_APP_SECRET agora fica apenas nas Edge Functions (mais seguro)
const GRAPH_API = 'https://graph.instagram.com';

// Permissoes para Instagram Login API
// Docs: https://developers.facebook.com/docs/instagram-platform/instagram-api-with-instagram-login/
const PERMISSIONS = [
  'instagram_business_basic',
  'instagram_business_content_publish',
].join(',');

// ==================== TOKEN MANAGEMENT ====================

let cachedTokens = null;

/** Busca tokens salvos no Supabase */
async function getSavedTokens() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('meta_social_tokens')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

/** Salva/atualiza tokens no Supabase */
async function saveTokens(tokenData) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario nao autenticado');

  const row = {
    user_id: user.id,
    access_token: tokenData.access_token,
    token_type: tokenData.token_type || 'Bearer',
    expires_at: tokenData.expires_at || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    facebook_user_id: null,
    facebook_page_id: null,
    facebook_page_token: null,
    instagram_account_id: tokenData.instagram_account_id || null,
    instagram_username: tokenData.instagram_username || null,
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from('meta_social_tokens')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('meta_social_tokens')
      .update(row)
      .eq('user_id', user.id);
  } else {
    await supabase
      .from('meta_social_tokens')
      .insert([row]);
  }

  cachedTokens = { ...row };
  return cachedTokens;
}

/** Obtem access token valido */
async function getAccessToken() {
  if (cachedTokens && new Date(cachedTokens.expires_at) > new Date(Date.now() + 60000)) {
    return cachedTokens.access_token;
  }

  const saved = await getSavedTokens();
  if (saved && new Date(saved.expires_at) > new Date(Date.now() + 60000)) {
    cachedTokens = saved;
    return saved.access_token;
  }

  return null;
}

/** Verifica status da conexao */
export async function getMetaStatus() {
  const saved = await getSavedTokens();
  if (!saved) {
    return { connected: false };
  }

  const expired = new Date(saved.expires_at) <= new Date();
  return {
    connected: !expired,
    expired,
    instagram_username: saved.instagram_username,
    instagram_account_id: saved.instagram_account_id,
    expires_at: saved.expires_at,
    updated_at: saved.updated_at,
  };
}

// ==================== OAUTH FLOW (Instagram Login) ====================

/** Gera URL de autorizacao Instagram */
export function getAuthUrl() {
  const redirectUri = `${window.location.origin}/auth/meta/callback`;
  const state = crypto.randomUUID();

  // Salvar state para validacao
  sessionStorage.setItem('meta_oauth_state', state);

  // Instagram OAuth URL (não Facebook!)
  return `https://www.instagram.com/oauth/authorize?` +
    `client_id=${META_APP_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(PERMISSIONS)}` +
    `&response_type=code` +
    `&state=${state}`;
}

/** Inicia conexao via popup */
export function connectMeta() {
  return new Promise((resolve, reject) => {
    if (!META_APP_ID || META_APP_ID === 'your-meta-app-id') {
      reject(new Error('Configure VITE_META_APP_ID no arquivo .env'));
      return;
    }

    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const authUrl = getAuthUrl();
    const popup = window.open(
      authUrl,
      'instagram_oauth',
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      reject(new Error('Popup bloqueado. Permita popups para este site.'));
      return;
    }

    // Listener para mensagem do callback
    const handleMessage = async (event) => {
      if (event.origin !== window.location.origin) return;
      if (!event.data?.type?.startsWith('meta_oauth')) return;

      window.removeEventListener('message', handleMessage);
      popup.close();

      if (event.data.type === 'meta_oauth_success') {
        try {
          const tokens = await exchangeCodeForToken(event.data.code);
          resolve(tokens);
        } catch (err) {
          reject(err);
        }
      } else if (event.data.type === 'meta_oauth_error') {
        reject(new Error(event.data.error || 'Erro na autorizacao'));
      }
    };

    window.addEventListener('message', handleMessage);

    // Timeout de seguranca
    setTimeout(() => {
      window.removeEventListener('message', handleMessage);
      if (!popup.closed) {
        popup.close();
        reject(new Error('Timeout na autorizacao'));
      }
    }, 300000); // 5 min
  });
}

/** Troca authorization code por access token (via Edge Function) */
async function exchangeCodeForToken(code) {
  const redirectUri = `${window.location.origin}/auth/meta/callback`;

  // Chamar Edge Function para trocar code (evita CORS)
  const { data: fnData, error: fnError } = await supabase.functions.invoke('meta-oauth-exchange', {
    body: { code, redirect_uri: redirectUri },
  });

  if (fnError || fnData?.error) {
    throw new Error(fnData?.error || fnError?.message || 'Erro ao trocar code por token');
  }

  // Token retornado
  const accessToken = fnData.access_token;
  const userId = fnData.user_id;

  // Tentar obter long-lived token, se falhar usar o short-lived
  let finalToken = accessToken;
  let expiresIn = 3600; // 1 hora (short-lived default)

  try {
    const longLivedToken = await getLongLivedToken(accessToken);
    finalToken = longLivedToken.access_token;
    expiresIn = longLivedToken.expires_in || 5184000;
  } catch (err) {
    console.warn('Nao foi possivel obter long-lived token, usando short-lived:', err.message);
  }

  // Buscar informacoes do usuario
  const userInfo = await fetchUserInfo(finalToken);

  // Salvar tudo
  const tokens = await saveTokens({
    access_token: finalToken,
    expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
    instagram_account_id: userId.toString(),
    instagram_username: userInfo.username,
  });

  return tokens;
}

/** Converte token de curta duracao para longa duracao (60 dias) via Edge Function */
async function getLongLivedToken(shortToken) {
  const { data: fnData, error: fnError } = await supabase.functions.invoke('meta-long-lived-token', {
    body: { access_token: shortToken },
  });

  if (fnError || fnData?.error) {
    throw new Error(fnData?.error || fnError?.message || 'Erro ao obter token de longa duracao');
  }

  return {
    access_token: fnData.access_token,
    expires_in: fnData.expires_in || 5184000,
  };
}

/** Busca informacoes do usuario Instagram */
async function fetchUserInfo(accessToken) {
  const res = await fetch(
    `${GRAPH_API}/me?fields=id,username,account_type,media_count&access_token=${accessToken}`
  );
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Erro ao buscar informacoes do usuario');
  }

  return {
    user_id: data.id,
    username: data.username,
    account_type: data.account_type,
    media_count: data.media_count,
  };
}

/** Refresh token antes de expirar */
export async function refreshToken() {
  const saved = await getSavedTokens();
  if (!saved?.access_token) {
    throw new Error('Nenhum token salvo para renovar');
  }

  const url = `${GRAPH_API}/refresh_access_token?` +
    `grant_type=ig_refresh_token` +
    `&access_token=${saved.access_token}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Erro ao renovar token');
  }

  // Atualizar token salvo
  await saveTokens({
    ...saved,
    access_token: data.access_token,
    expires_at: new Date(Date.now() + (data.expires_in || 5184000) * 1000).toISOString(),
  });

  return data;
}

/** Desconecta a conta */
export async function disconnectMeta() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario nao autenticado');

  await supabase
    .from('meta_social_tokens')
    .delete()
    .eq('user_id', user.id);

  cachedTokens = null;
}

// ==================== INSTAGRAM PUBLISHING ====================

/**
 * Publica video/reel no Instagram
 * @param {Object} options
 * @param {string} options.videoUrl - URL publica do video
 * @param {string} options.caption - Legenda do post
 * @param {string} options.mediaType - 'REELS' | 'VIDEO' | 'STORIES'
 * @param {string} options.coverUrl - URL da thumbnail (opcional)
 * @param {string} options.shareToFeed - Compartilhar Reel no Feed (default: true)
 */
export async function publishToInstagram({ videoUrl, caption, mediaType = 'REELS', coverUrl, shareToFeed = true }) {
  const tokens = await getSavedTokens();
  if (!tokens?.instagram_account_id) {
    throw new Error('Conta Instagram nao conectada');
  }

  const accessToken = tokens.access_token;
  const igUserId = tokens.instagram_account_id;

  // 1. Criar container de midia
  const containerParams = new URLSearchParams({
    video_url: videoUrl,
    caption: caption || '',
    media_type: mediaType,
    access_token: accessToken,
  });

  if (coverUrl) {
    containerParams.append('cover_url', coverUrl);
  }

  if (mediaType === 'REELS') {
    containerParams.append('share_to_feed', shareToFeed.toString());
  }

  const containerRes = await fetch(`${GRAPH_API}/v21.0/${igUserId}/media`, {
    method: 'POST',
    body: containerParams,
  });
  const containerData = await containerRes.json();

  if (containerData.error) {
    throw new Error(containerData.error.message || 'Erro ao criar container');
  }

  const containerId = containerData.id;

  // 2. Aguardar processamento do video
  await waitForMediaReady(containerId, accessToken);

  // 3. Publicar
  const publishRes = await fetch(`${GRAPH_API}/v21.0/${igUserId}/media_publish`, {
    method: 'POST',
    body: new URLSearchParams({
      creation_id: containerId,
      access_token: accessToken,
    }),
  });
  const publishData = await publishRes.json();

  if (publishData.error) {
    throw new Error(publishData.error.message || 'Erro ao publicar');
  }

  // Logar resultado
  await logPublishResult({
    platform: 'instagram',
    media_id: publishData.id,
    status: 'success',
  });

  return {
    id: publishData.id,
    platform: 'instagram',
  };
}

/**
 * Publica imagem no Instagram
 */
export async function publishImageToInstagram({ imageUrl, caption }) {
  const tokens = await getSavedTokens();
  if (!tokens?.instagram_account_id) {
    throw new Error('Conta Instagram nao conectada');
  }

  const accessToken = tokens.access_token;
  const igUserId = tokens.instagram_account_id;

  // 1. Criar container
  const containerRes = await fetch(`${GRAPH_API}/v21.0/${igUserId}/media`, {
    method: 'POST',
    body: new URLSearchParams({
      image_url: imageUrl,
      caption: caption || '',
      access_token: accessToken,
    }),
  });
  const containerData = await containerRes.json();

  if (containerData.error) {
    throw new Error(containerData.error.message || 'Erro ao criar container');
  }

  // 2. Publicar
  const publishRes = await fetch(`${GRAPH_API}/v21.0/${igUserId}/media_publish`, {
    method: 'POST',
    body: new URLSearchParams({
      creation_id: containerData.id,
      access_token: accessToken,
    }),
  });
  const publishData = await publishRes.json();

  if (publishData.error) {
    throw new Error(publishData.error.message || 'Erro ao publicar');
  }

  await logPublishResult({
    platform: 'instagram',
    media_id: publishData.id,
    status: 'success',
  });

  return {
    id: publishData.id,
    platform: 'instagram',
  };
}

/**
 * Publica carrossel no Instagram (ate 10 imagens/videos)
 */
export async function publishCarouselToInstagram({ mediaUrls, caption }) {
  const tokens = await getSavedTokens();
  if (!tokens?.instagram_account_id) {
    throw new Error('Conta Instagram nao conectada');
  }

  const accessToken = tokens.access_token;
  const igUserId = tokens.instagram_account_id;

  // 1. Criar container para cada midia
  const childIds = [];
  for (const url of mediaUrls) {
    const isVideo = /\.(mp4|mov|avi|webm)$/i.test(url);
    const params = {
      is_carousel_item: 'true',
      access_token: accessToken,
    };
    if (isVideo) {
      params.media_type = 'VIDEO';
      params.video_url = url;
    } else {
      params.image_url = url;
    }

    const res = await fetch(`${GRAPH_API}/v21.0/${igUserId}/media`, {
      method: 'POST',
      body: new URLSearchParams(params),
    });
    const data = await res.json();
    if (data.error) {
      throw new Error(data.error.message || 'Erro ao criar item do carrossel');
    }

    if (isVideo) {
      await waitForMediaReady(data.id, accessToken);
    }
    childIds.push(data.id);
  }

  // 2. Criar container do carrossel
  const carouselRes = await fetch(`${GRAPH_API}/v21.0/${igUserId}/media`, {
    method: 'POST',
    body: new URLSearchParams({
      media_type: 'CAROUSEL',
      children: childIds.join(','),
      caption: caption || '',
      access_token: accessToken,
    }),
  });
  const carouselData = await carouselRes.json();
  if (carouselData.error) {
    throw new Error(carouselData.error.message || 'Erro ao criar carrossel');
  }

  // 3. Publicar
  const publishRes = await fetch(`${GRAPH_API}/v21.0/${igUserId}/media_publish`, {
    method: 'POST',
    body: new URLSearchParams({
      creation_id: carouselData.id,
      access_token: accessToken,
    }),
  });
  const publishData = await publishRes.json();
  if (publishData.error) {
    throw new Error(publishData.error.message || 'Erro ao publicar carrossel');
  }

  await logPublishResult({
    platform: 'instagram',
    media_id: publishData.id,
    status: 'success',
  });

  return { id: publishData.id, platform: 'instagram' };
}

/** Aguarda video ficar pronto para publicar */
async function waitForMediaReady(containerId, accessToken, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GRAPH_API}/v21.0/${containerId}?fields=status_code,status&access_token=${accessToken}`
    );
    const data = await res.json();

    if (data.status_code === 'FINISHED') {
      return true;
    }

    if (data.status_code === 'ERROR') {
      throw new Error(`Erro no processamento: ${data.status || 'desconhecido'}`);
    }

    // Aguardar 5 segundos antes de tentar novamente
    await new Promise(r => setTimeout(r, 5000));
  }

  throw new Error('Timeout aguardando processamento do video');
}

// ==================== FACEBOOK PUBLISHING (desabilitado por enquanto) ====================

/**
 * Publica video na pagina do Facebook
 * NOTA: Requer Facebook Login separado, não funciona com Instagram Login
 */
export async function publishToFacebook() {
  throw new Error('Publicacao no Facebook requer configuracao adicional. Use apenas Instagram por enquanto.');
}

export async function publishTextToFacebook() {
  throw new Error('Publicacao no Facebook requer configuracao adicional. Use apenas Instagram por enquanto.');
}

export async function publishImageToFacebook() {
  throw new Error('Publicacao no Facebook requer configuracao adicional. Use apenas Instagram por enquanto.');
}

export async function publishVideoToFacebook() {
  throw new Error('Publicacao no Facebook requer configuracao adicional. Use apenas Instagram por enquanto.');
}

export async function getFacebookStatus() {
  return { connected: false, message: 'Facebook nao configurado' };
}

// ==================== RATE LIMITS ====================

/** Verifica limite de publicacao do Instagram (100 posts/24h) */
export async function checkPublishingLimit() {
  const tokens = await getSavedTokens();
  if (!tokens?.instagram_account_id) return null;

  const accessToken = tokens.access_token;

  const res = await fetch(
    `${GRAPH_API}/v21.0/${tokens.instagram_account_id}/content_publishing_limit?fields=config,quota_usage&access_token=${accessToken}`
  );
  const data = await res.json();

  if (data.error) return null;

  return {
    limit: data.data?.[0]?.config?.quota_total || 100,
    used: data.data?.[0]?.quota_usage || 0,
    remaining: (data.data?.[0]?.config?.quota_total || 100) - (data.data?.[0]?.quota_usage || 0),
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

/** Obtem historico de publicacoes */
export async function getPublishLogs(limit = 20) {
  const { data, error } = await supabase
    .from('meta_publish_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data;
}

// ==================== UPLOAD HELPER ====================

/**
 * Faz upload de arquivo para storage e retorna URL publica
 * (necessario pois APIs do Meta precisam de URL publica)
 */
export async function uploadMediaToStorage(file) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Usuario nao autenticado');

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('social-media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) throw new Error('Erro ao fazer upload: ' + uploadError.message);

  const { data: { publicUrl } } = supabase.storage
    .from('social-media')
    .getPublicUrl(fileName);

  return publicUrl;
}

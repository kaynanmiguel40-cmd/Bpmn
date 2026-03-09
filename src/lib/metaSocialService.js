/**
 * Meta Social Service - Instagram + Facebook Integration
 *
 * Usa Facebook Login para OAuth e Meta Graph API para publicacao.
 * Suporta: Feed posts, Reels, Stories (Instagram) e Videos (Facebook Page)
 *
 * Documentacao:
 * - https://developers.facebook.com/docs/instagram-platform/content-publishing/
 * - https://developers.facebook.com/docs/video-api/guides/publishing
 */

import { supabase } from './supabaseClient';

const META_APP_ID = import.meta.env.VITE_META_APP_ID || '';
const GRAPH_API = 'https://graph.facebook.com/v21.0';
const INSTAGRAM_API = 'https://graph.instagram.com/v21.0';

// Permissoes necessarias para publicacao
// IMPORTANTE: Adicionar produto Instagram no Meta Developer Console
// e configurar o Caso de Uso "Gerenciamento de conteudo"
const PERMISSIONS = [
  'public_profile',
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'business_management',
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
    expires_at: tokenData.expires_at || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 dias
    facebook_user_id: tokenData.facebook_user_id || null,
    facebook_page_id: tokenData.facebook_page_id || null,
    facebook_page_token: tokenData.facebook_page_token || null,
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
    facebook_page_id: saved.facebook_page_id,
    expires_at: saved.expires_at,
    updated_at: saved.updated_at,
  };
}

// ==================== OAUTH FLOW ====================

/** Gera URL de autorizacao Facebook */
export function getAuthUrl() {
  const redirectUri = `${window.location.origin}/auth/meta/callback`;
  const state = crypto.randomUUID();

  // Salvar state para validacao
  sessionStorage.setItem('meta_oauth_state', state);

  return `https://www.facebook.com/v21.0/dialog/oauth?` +
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
      'meta_oauth',
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
          // Trocar code por access token
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

/** Troca authorization code por access token */
async function exchangeCodeForToken(code) {
  const redirectUri = `${window.location.origin}/auth/meta/callback`;
  const appId = META_APP_ID;
  const appSecret = import.meta.env.VITE_META_APP_SECRET || '';

  // Trocar code por access token diretamente
  const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?` +
    `client_id=${appId}` +
    `&client_secret=${appSecret}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&code=${code}`;

  const res = await fetch(tokenUrl);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Erro ao trocar code por token');
  }

  // Obter long-lived token
  const longLivedToken = await getLongLivedToken(data.access_token);

  // Buscar informacoes da conta
  const accountInfo = await fetchAccountInfo({ access_token: longLivedToken.access_token });

  // Salvar tudo
  const tokens = await saveTokens({
    access_token: longLivedToken.access_token,
    expires_at: new Date(Date.now() + (longLivedToken.expires_in || 5184000) * 1000).toISOString(),
    ...accountInfo,
  });

  return tokens;
}

/** Converte token de curta duracao para longa duracao (60 dias) */
async function getLongLivedToken(shortToken) {
  const appId = META_APP_ID;
  const appSecret = import.meta.env.VITE_META_APP_SECRET || '';

  const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?` +
    `grant_type=fb_exchange_token` +
    `&client_id=${appId}` +
    `&client_secret=${appSecret}` +
    `&fb_exchange_token=${shortToken}`;

  const res = await fetch(tokenUrl);
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Erro ao obter token de longa duracao');
  }

  return {
    access_token: data.access_token,
    expires_in: data.expires_in || 5184000,
  };
}

/** Busca informacoes das contas conectadas */
async function fetchAccountInfo(token) {
  // Buscar paginas do Facebook
  const pagesRes = await fetch(
    `${GRAPH_API}/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${token.access_token}`
  );
  const pagesData = await pagesRes.json();

  if (pagesData.error) throw new Error(pagesData.error.message);

  // Pegar primeira pagina com Instagram vinculado
  const pageWithIG = pagesData.data?.find(p => p.instagram_business_account);

  if (!pageWithIG) {
    throw new Error('Nenhuma pagina do Facebook com conta Instagram Business encontrada');
  }

  // Buscar detalhes da conta Instagram
  const igRes = await fetch(
    `${GRAPH_API}/${pageWithIG.instagram_business_account.id}?fields=id,username,name&access_token=${token.access_token}`
  );
  const igData = await igRes.json();

  return {
    facebook_user_id: null, // sera preenchido se necessario
    facebook_page_id: pageWithIG.id,
    facebook_page_token: pageWithIG.access_token,
    instagram_account_id: pageWithIG.instagram_business_account.id,
    instagram_username: igData.username || igData.name,
  };
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

  const accessToken = tokens.facebook_page_token || tokens.access_token;
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

  const containerRes = await fetch(`${GRAPH_API}/${igUserId}/media`, {
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
  const publishRes = await fetch(`${GRAPH_API}/${igUserId}/media_publish`, {
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

/** Aguarda video ficar pronto para publicar */
async function waitForMediaReady(containerId, accessToken, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(
      `${GRAPH_API}/${containerId}?fields=status_code,status&access_token=${accessToken}`
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

// ==================== FACEBOOK PUBLISHING ====================

/**
 * Publica video na pagina do Facebook
 * @param {Object} options
 * @param {string} options.videoUrl - URL publica do video
 * @param {string} options.title - Titulo do video
 * @param {string} options.description - Descricao do video
 */
export async function publishToFacebook({ videoUrl, title, description }) {
  const tokens = await getSavedTokens();
  if (!tokens?.facebook_page_id) {
    throw new Error('Pagina do Facebook nao conectada');
  }

  const accessToken = tokens.facebook_page_token;
  const pageId = tokens.facebook_page_id;

  // Publicar video diretamente (para videos pequenos)
  // Para videos grandes, usar upload resumivel
  const params = new URLSearchParams({
    file_url: videoUrl,
    title: title || '',
    description: description || '',
    access_token: accessToken,
  });

  const res = await fetch(`${GRAPH_API}/${pageId}/videos`, {
    method: 'POST',
    body: params,
  });
  const data = await res.json();

  if (data.error) {
    throw new Error(data.error.message || 'Erro ao publicar no Facebook');
  }

  await logPublishResult({
    platform: 'facebook',
    media_id: data.id,
    status: 'success',
  });

  return {
    id: data.id,
    platform: 'facebook',
  };
}

// ==================== MULTI-PLATFORM PUBLISH ====================

/**
 * Publica em multiplas plataformas simultaneamente
 * @param {Object} options
 * @param {string[]} options.platforms - ['instagram', 'facebook']
 * @param {string} options.videoUrl - URL do video
 * @param {string} options.caption - Legenda/descricao
 * @param {string} options.title - Titulo (Facebook)
 * @param {string} options.mediaType - Tipo de midia para Instagram
 */
export async function publishToMultiplePlatforms({ platforms, videoUrl, caption, title, mediaType = 'REELS' }) {
  const results = [];
  const errors = [];

  for (const platform of platforms) {
    try {
      let result;
      if (platform === 'instagram') {
        result = await publishToInstagram({ videoUrl, caption, mediaType });
      } else if (platform === 'facebook') {
        result = await publishToFacebook({ videoUrl, title: title || caption, description: caption });
      }

      if (result) {
        results.push(result);
      }
    } catch (err) {
      errors.push({ platform, error: err.message });
    }
  }

  return { results, errors };
}

// ==================== RATE LIMITS ====================

/** Verifica limite de publicacao do Instagram (100 posts/24h) */
export async function checkPublishingLimit() {
  const tokens = await getSavedTokens();
  if (!tokens?.instagram_account_id) return null;

  const accessToken = tokens.facebook_page_token || tokens.access_token;

  const res = await fetch(
    `${GRAPH_API}/${tokens.instagram_account_id}/content_publishing_limit?fields=config,quota_usage&access_token=${accessToken}`
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

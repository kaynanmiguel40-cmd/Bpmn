/**
 * MetaSocialIntegration - Status da conta Instagram da empresa
 * Modo Enterprise: mostra status read-only da conta configurada no .env
 */

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getMetaStatus,
  checkPublishingLimit,
  getPublishLogs,
  getFacebookStatus,
} from '../../lib/metaSocialService';
import {
  getTikTokStatus,
  getTikTokAuthUrl,
  disconnectTikTok,
  isTikTokConfigured,
} from '../../lib/tiktokService';
import {
  getYouTubeStatus,
  getYouTubeAuthUrl,
  disconnectYouTube,
  isYouTubeConfigured,
} from '../../lib/youtubeService';

export default function MetaSocialIntegration() {
  const [showLog, setShowLog] = useState(false);
  const [publishLimit, setPublishLimit] = useState(null);
  const [isConnectingTikTok, setIsConnectingTikTok] = useState(false);
  const [isConnectingYouTube, setIsConnectingYouTube] = useState(false);

  const { data: metaStatus, isLoading: isLoadingInstagram } = useQuery({
    queryKey: ['metaSocialStatus'],
    queryFn: getMetaStatus,
    staleTime: 60000,
  });

  const { data: facebookStatus, isLoading: isLoadingFacebook } = useQuery({
    queryKey: ['facebookStatus'],
    queryFn: getFacebookStatus,
    staleTime: 60000,
  });

  const { data: tiktokStatus, isLoading: isLoadingTikTok, refetch: refetchTikTok } = useQuery({
    queryKey: ['tiktokStatus'],
    queryFn: getTikTokStatus,
    staleTime: 60000,
  });

  const { data: youtubeStatus, isLoading: isLoadingYouTube, refetch: refetchYouTube } = useQuery({
    queryKey: ['youtubeStatus'],
    queryFn: getYouTubeStatus,
    staleTime: 60000,
  });

  const { data: publishLogs } = useQuery({
    queryKey: ['metaPublishLogs'],
    queryFn: () => getPublishLogs(15),
    enabled: showLog,
  });

  const isConnected = metaStatus?.connected;
  const isFacebookConnected = facebookStatus?.connected;
  const isTikTokConnected = tiktokStatus?.connected;
  const isYouTubeConnected = youtubeStatus?.connected;
  const isLoading = isLoadingInstagram || isLoadingFacebook || isLoadingTikTok || isLoadingYouTube;

  const handleConnectTikTok = () => {
    try {
      setIsConnectingTikTok(true);
      const authUrl = getTikTokAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      console.error('[TikTok] Erro ao gerar URL:', err);
      setIsConnectingTikTok(false);
    }
  };

  const handleDisconnectTikTok = async () => {
    if (!confirm('Deseja desconectar sua conta TikTok?')) return;
    await disconnectTikTok();
    refetchTikTok();
  };

  const handleConnectYouTube = () => {
    try {
      setIsConnectingYouTube(true);
      const authUrl = getYouTubeAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      console.error('[YouTube] Erro ao gerar URL:', err);
      setIsConnectingYouTube(false);
    }
  };

  const handleDisconnectYouTube = async () => {
    if (!confirm('Deseja desconectar sua conta YouTube?')) return;
    await disconnectYouTube();
    refetchYouTube();
  };

  useEffect(() => {
    if (isConnected) {
      checkPublishingLimit().then(setPublishLimit);
    }
  }, [isConnected]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Instagram Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Instagram Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 via-purple-500 to-orange-400 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Instagram</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Conta da empresa para publicações
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isConnected
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {isConnected ? 'Conectado' : 'Erro na configuração'}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="mt-5">
          {!isConnected ? (
            /* Token não configurado ou inválido */
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-2">
                Token não configurado ou expirado
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {metaStatus?.error || 'Verifique as variáveis VITE_META_ACCESS_TOKEN e VITE_META_INSTAGRAM_USER_ID no arquivo .env'}
              </p>
            </div>
          ) : (
            /* Conectado - modo read-only */
            <div className="space-y-4">
              {/* Info da conta */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069z"/>
                  </svg>
                  <span className="font-medium">@{metaStatus.instagram_username}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded text-xs font-medium">
                    {metaStatus.account_type}
                  </span>
                </div>

                {publishLimit && (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {publishLimit.remaining}/{publishLimit.limit} posts restantes (24h)
                  </div>
                )}
              </div>

              {/* Aviso de token fixo */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Modo Empresa:</strong> Token fixo configurado no servidor.
                  Renovar token a cada 60 dias no Facebook Developer Console.
                </p>
              </div>

              {/* Botão de histórico */}
              <button
                onClick={() => setShowLog(!showLog)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {showLog ? 'Ocultar histórico' : 'Ver histórico de publicações'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Facebook Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Facebook Icon */}
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Facebook Page</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Página da empresa para publicações
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isFacebookConnected
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {isFacebookConnected ? 'Conectado' : 'Erro na configuração'}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="mt-5">
          {!isFacebookConnected ? (
            /* Token não configurado ou inválido */
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-2">
                Token não configurado ou expirado
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                {facebookStatus?.error || 'Verifique as variáveis VITE_FB_PAGE_ID e VITE_FB_PAGE_ACCESS_TOKEN no arquivo .env'}
              </p>
            </div>
          ) : (
            /* Conectado - modo read-only */
            <div className="space-y-4">
              {/* Info da página */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <svg className="w-4 h-4 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span className="font-medium">{facebookStatus.page_name}</span>
                </div>

              </div>

              {/* Aviso de token fixo */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Modo Empresa:</strong> Token fixo configurado no servidor.
                  Renovar token a cada 60 dias no Facebook Developer Console.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TikTok Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* TikTok Icon */}
            <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"
                  fill="#00f2ea"
                />
                <path
                  d="M16.37 2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.57 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4A4.83 4.83 0 0116.37 2z"
                  fill="#ff0050"
                />
              </svg>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">TikTok</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Conta da empresa para publicações
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isTikTokConnected
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : tiktokStatus?.configured
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {isTikTokConnected ? 'Conectado' : tiktokStatus?.configured ? 'Não conectado' : 'Não configurado'}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="mt-5">
          {!tiktokStatus?.configured ? (
            /* TikTok não configurado */
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-2">
                TikTok não configurado
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Preencha as variáveis VITE_TIKTOK_CLIENT_KEY, VITE_TIKTOK_CLIENT_SECRET e VITE_TIKTOK_REDIRECT_URI no arquivo .env
              </p>
            </div>
          ) : !isTikTokConnected ? (
            /* Configurado mas não conectado */
            <div className="space-y-4">
              {tiktokStatus?.error && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    {tiktokStatus.error}
                  </p>
                </div>
              )}

              <button
                onClick={handleConnectTikTok}
                disabled={isConnectingTikTok}
                className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {isConnectingTikTok ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" fill="#00f2ea"/>
                    </svg>
                    Conectar TikTok
                  </>
                )}
              </button>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Sandbox:</strong> App em modo sandbox permite apenas 5 vídeos/dia.
                  Submeta para review no TikTok Developer Portal para produção.
                </p>
              </div>
            </div>
          ) : (
            /* Conectado */
            <div className="space-y-4">
              {/* Info da conta */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  {tiktokStatus.avatar_url && (
                    <img src={tiktokStatus.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                  )}
                  <span className="font-medium">@{tiktokStatus.username}</span>
                </div>
              </div>

              {/* Aviso sobre sandbox */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Modo Sandbox:</strong> Limite de 5 vídeos/dia.
                  Access token renova automaticamente.
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-2">
                <button
                  onClick={handleDisconnectTikTok}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Desconectar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* YouTube Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* YouTube Icon */}
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">YouTube Shorts</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Canal para publicação de Shorts
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isYouTubeConnected
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : youtubeStatus?.configured
                ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
          }`}>
            {isYouTubeConnected ? 'Conectado' : youtubeStatus?.configured ? 'Não conectado' : 'Não configurado'}
          </div>
        </div>

        {/* Conteúdo */}
        <div className="mt-5">
          {!youtubeStatus?.configured ? (
            /* YouTube não configurado */
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-2">
                YouTube não configurado
              </p>
              <p className="text-xs text-red-600 dark:text-red-400">
                Preencha VITE_YOUTUBE_CLIENT_ID e VITE_YOUTUBE_REDIRECT_URI no .env
              </p>
            </div>
          ) : !isYouTubeConnected ? (
            /* Configurado mas não conectado */
            <div className="space-y-4">
              {youtubeStatus?.error && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    {youtubeStatus.error}
                  </p>
                </div>
              )}

              <button
                onClick={handleConnectYouTube}
                disabled={isConnectingYouTube}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
              >
                {isConnectingYouTube ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    Conectar YouTube
                  </>
                )}
              </button>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Quota:</strong> 10.000 unidades/dia. Upload = 1.600 unidades (~6 vídeos/dia).
                </p>
              </div>
            </div>
          ) : (
            /* Conectado */
            <div className="space-y-4">
              {/* Info do canal */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  {youtubeStatus.channel_thumbnail && (
                    <img src={youtubeStatus.channel_thumbnail} alt="" className="w-6 h-6 rounded-full" />
                  )}
                  <span className="font-medium">{youtubeStatus.channel_name}</span>
                </div>
                {youtubeStatus.subscriber_count && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {parseInt(youtubeStatus.subscriber_count).toLocaleString()} inscritos
                  </span>
                )}
              </div>

              {/* Info de email */}
              {youtubeStatus.email && (
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {youtubeStatus.email}
                </div>
              )}

              {/* Aviso sobre quota */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Shorts:</strong> Vídeos verticais até 60s com #Shorts no título.
                  Token renova automaticamente.
                </p>
              </div>

              {/* Botões */}
              <div className="flex gap-2">
                <button
                  onClick={handleDisconnectYouTube}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Desconectar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Publish Log */}
      {showLog && publishLogs && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Histórico de publicações</h4>

          {publishLogs.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma publicação ainda.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {publishLogs.map(log => (
                <div key={log.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  <span className={`px-1.5 py-0.5 rounded font-medium ${
                    log.platform === 'facebook'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : log.platform === 'tiktok'
                        ? 'bg-gray-800 dark:bg-gray-700 text-white'
                        : log.platform === 'youtube'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400'
                  }`}>
                    {log.platform === 'facebook' ? 'FB' : log.platform === 'tiktok' ? 'TT' : log.platform === 'youtube' ? 'YT' : 'IG'}
                  </span>

                  <span className={`${
                    log.status === 'success' ? 'text-green-600 dark:text-green-400' :
                    log.status === 'error' ? 'text-red-600 dark:text-red-400' :
                    'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {log.status === 'success' ? 'Publicado' : log.status}
                  </span>

                  {log.media_id && (
                    <span className="text-slate-400 dark:text-slate-500 font-mono truncate max-w-[100px]">
                      {log.media_id}
                    </span>
                  )}

                  {log.error_message && (
                    <span className="text-red-500 dark:text-red-400 truncate max-w-xs" title={log.error_message}>
                      {log.error_message.substring(0, 50)}
                    </span>
                  )}

                  <span className="text-slate-400 dark:text-slate-500 ml-auto">{formatDate(log.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

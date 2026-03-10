/**
 * MetaSocialIntegration - Componente de conexao com Instagram
 * Usado na aba Integracoes do SettingsPage.
 * Usa Instagram Login API para autenticacao direta.
 */

import { useState, useEffect } from 'react';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import {
  getMetaStatus,
  connectMeta,
  disconnectMeta,
  checkPublishingLimit,
  getPublishLogs,
} from '../../lib/metaSocialService';
import { toast } from '../../contexts/ToastContext';

export default function MetaSocialIntegration() {
  const queryClient = useQueryClient();
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [publishLimit, setPublishLimit] = useState(null);

  const { data: metaStatus, isLoading } = useQuery({
    queryKey: ['metaSocialStatus'],
    queryFn: getMetaStatus,
    staleTime: 60000,
  });

  const { data: publishLogs } = useQuery({
    queryKey: ['metaPublishLogs'],
    queryFn: () => getPublishLogs(15),
    enabled: showLog,
  });

  const isConnected = metaStatus?.connected;

  useEffect(() => {
    if (isConnected) {
      checkPublishingLimit().then(setPublishLimit);
    }
  }, [isConnected]);

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connectMeta();
      toast('Instagram conectado com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: ['metaSocialStatus'] });
    } catch (err) {
      toast(err.message || 'Erro ao conectar', 'error');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnectMeta();
      toast('Contas desconectadas', 'success');
      queryClient.invalidateQueries({ queryKey: ['metaSocialStatus'] });
      setShowConfirmDisconnect(false);
    } catch (err) {
      toast(err.message || 'Erro ao desconectar', 'error');
    } finally {
      setDisconnecting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  };

  const timeSince = (dateStr) => {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'agora';
    if (mins < 60) return `${mins} min atras`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h atras`;
    const days = Math.floor(hours / 24);
    return `${days}d atras`;
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
                Publique fotos, videos e reels diretamente do sistema
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isConnected
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
          }`}>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </div>
        </div>

        {/* Conteudo baseado no status */}
        <div className="mt-5">
          {!isConnected ? (
            /* Nao conectado */
            <div className="space-y-3">
              <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-3">
                <p className="text-xs text-pink-700 dark:text-pink-300">
                  Conecte sua conta Instagram Business ou Creator para publicar fotos,
                  videos, reels e stories diretamente do sistema.
                </p>
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  <strong>Requisitos:</strong> Conta Instagram Business ou Creator.
                  Contas pessoais nao sao suportadas pela API do Instagram.
                </p>
              </div>

              <button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-pink-500 via-purple-500 to-orange-400 hover:from-pink-600 hover:via-purple-600 hover:to-orange-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-all"
              >
                {connecting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                )}
                {connecting ? 'Conectando...' : 'Conectar Instagram'}
              </button>
            </div>
          ) : (
            /* Conectado */
            <div className="space-y-4">
              {/* Info da conta */}
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <svg className="w-4 h-4 text-pink-500" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  @{metaStatus.instagram_username || 'conta conectada'}
                </div>

                {publishLimit && (
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    {publishLimit.remaining}/{publishLimit.limit} posts restantes (24h)
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Conectado {metaStatus.updated_at ? timeSince(metaStatus.updated_at) : ''}
                </div>
              </div>

              {/* Botoes */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowLog(!showLog)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Historico de publicacoes
                </button>

                <button
                  onClick={() => setShowConfirmDisconnect(true)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm transition-colors ml-auto"
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
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Historico de publicacoes</h4>

          {publishLogs.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma publicacao ainda.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {publishLogs.map(log => (
                <div key={log.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  {/* Plataforma */}
                  <span className={`px-1.5 py-0.5 rounded font-medium ${
                    log.platform === 'instagram'
                      ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400'
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}>
                    {log.platform === 'instagram' ? 'IG' : 'FB'}
                  </span>

                  {/* Status */}
                  <span className={`${
                    log.status === 'success' ? 'text-green-600 dark:text-green-400' :
                    log.status === 'error' ? 'text-red-600 dark:text-red-400' :
                    'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {log.status === 'success' ? 'Publicado' : log.status}
                  </span>

                  {/* Media ID */}
                  {log.media_id && (
                    <span className="text-slate-400 dark:text-slate-500 font-mono truncate max-w-[100px]">
                      {log.media_id}
                    </span>
                  )}

                  {/* Error */}
                  {log.error_message && (
                    <span className="text-red-500 dark:text-red-400 truncate max-w-xs" title={log.error_message}>
                      {log.error_message.substring(0, 50)}
                    </span>
                  )}

                  {/* Timestamp */}
                  <span className="text-slate-400 dark:text-slate-500 ml-auto">{formatDate(log.created_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirm Disconnect Modal */}
      {showConfirmDisconnect && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowConfirmDisconnect(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Desconectar Instagram?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              Voce nao podera mais publicar diretamente do sistema. O historico de publicacoes sera mantido.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDisconnect(false)}
                className="px-4 py-2 text-sm rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium transition-colors"
              >
                {disconnecting ? 'Desconectando...' : 'Desconectar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

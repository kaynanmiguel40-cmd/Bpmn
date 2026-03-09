/**
 * GoogleCalendarIntegration - Componente de conexao com Google Calendar
 * Usado na aba Integracoes do SettingsPage.
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useGCalStatus, queryKeys } from '../../hooks/queries';
import { connectGCal, triggerGCalPull, disconnectGCal, getGCalSyncLog } from '../../lib/googleCalendarService';
import { toast } from '../../contexts/ToastContext';

export default function GoogleCalendarIntegration() {
  const queryClient = useQueryClient();
  const { data: gcalStatus, isLoading } = useGCalStatus();
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState(false);
  const [syncLog, setSyncLog] = useState(null);
  const [showLog, setShowLog] = useState(false);

  const isConnected = !!gcalStatus?.id && !gcalStatus?.expired;

  const handleConnect = async () => {
    try {
      await connectGCal();
      toast('Google Calendar conectado com sucesso!', 'success');
      queryClient.invalidateQueries({ queryKey: queryKeys.googleCalendarStatus });
    } catch (err) {
      toast(err.message || 'Erro ao conectar', 'error');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const result = await triggerGCalPull();
      const msg = [];
      if (result.created > 0) msg.push(`${result.created} criado(s)`);
      if (result.updated > 0) msg.push(`${result.updated} atualizado(s)`);
      if (result.deleted > 0) msg.push(`${result.deleted} removido(s)`);

      toast(msg.length > 0 ? `Sincronizado: ${msg.join(', ')}` : 'Tudo sincronizado!', 'success');

      queryClient.invalidateQueries({ queryKey: queryKeys.agendaEvents });
      queryClient.invalidateQueries({ queryKey: queryKeys.googleCalendarStatus });
    } catch (err) {
      toast(err.message || 'Erro ao sincronizar', 'error');
    } finally {
      setSyncing(false);
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnectGCal();
      toast('Google Calendar desconectado', 'success');
      queryClient.invalidateQueries({ queryKey: queryKeys.googleCalendarStatus });
      setShowConfirmDisconnect(false);
    } catch (err) {
      toast(err.message || 'Erro ao desconectar', 'error');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleShowLog = async () => {
    const log = await getGCalSyncLog(15);
    setSyncLog(log);
    setShowLog(!showLog);
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
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Google Calendar Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Google Calendar Icon */}
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="3" stroke="#4285f4" strokeWidth="2" />
                <path d="M3 9h18" stroke="#4285f4" strokeWidth="2" />
                <path d="M9 4V2M15 4V2" stroke="#4285f4" strokeWidth="2" strokeLinecap="round" />
                <rect x="7" y="12" width="3" height="3" rx="0.5" fill="#34a853" />
                <rect x="14" y="12" width="3" height="3" rx="0.5" fill="#fbbc04" />
                <rect x="7" y="17" width="3" height="3" rx="0.5" fill="#ea4335" />
                <rect x="14" y="17" width="3" height="3" rx="0.5" fill="#4285f4" />
              </svg>
            </div>

            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Google Calendar</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Sincronize eventos automaticamente com seu Google Calendar
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
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Ao conectar, seus eventos da agenda serao sincronizados automaticamente com o Google Calendar.
                  Eventos criados no Google Calendar tambem aparecerao aqui.
                </p>
              </div>

              <button
                onClick={handleConnect}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Conectar Google Calendar
              </button>
            </div>
          ) : (
            /* Conectado */
            <div className="space-y-4">
              {/* Info de sync */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Ultimo sync: {gcalStatus.last_sync_at ? timeSince(gcalStatus.last_sync_at) : 'nunca'}
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Calendario: {gcalStatus.calendar_id || 'primary'}
                </div>
              </div>

              {/* Botoes */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {syncing ? 'Sincronizando...' : 'Sincronizar agora'}
                </button>

                <button
                  onClick={handleShowLog}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Historico
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

      {/* Sync Log */}
      {showLog && syncLog && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-3">Historico de sincronizacao</h4>

          {syncLog.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Nenhum registro de sincronizacao ainda.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {syncLog.map(log => (
                <div key={log.id} className="flex items-center gap-3 text-xs py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-0">
                  {/* Direcao */}
                  <span className={`px-1.5 py-0.5 rounded font-medium ${
                    log.direction === 'push'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400'
                  }`}>
                    {log.direction === 'push' ? 'PUSH' : 'PULL'}
                  </span>

                  {/* Acao */}
                  <span className="text-slate-600 dark:text-slate-300 capitalize">{log.action}</span>

                  {/* Status */}
                  <span className={`${
                    log.status === 'success' ? 'text-green-600 dark:text-green-400' :
                    log.status === 'error' ? 'text-red-600 dark:text-red-400' :
                    'text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {log.status}
                  </span>

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
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-2">Desconectar Google Calendar?</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
              Os eventos ja sincronizados serao mantidos no sistema, mas nao serao mais atualizados automaticamente.
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

import { useState, useEffect } from 'react';
import {
  getNotificationPrefs,
  saveNotificationPrefs,
  NOTIFICATION_TYPE_LABELS,
} from '../../lib/communicationService';

/**
 * NotificationPreferences - Configuracao de preferencias por tipo de evento
 *
 * Permite ativar/desativar canais (in-app, email, whatsapp) por tipo de notificacao.
 */
export function NotificationPreferences() {
  const [prefs, setPrefs] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrefs(getNotificationPrefs());
  }, []);

  const handleToggle = (type, channel) => {
    const updated = {
      ...prefs,
      [type]: {
        ...prefs[type],
        [channel]: !prefs[type]?.[channel],
      },
    };
    setPrefs(updated);
    saveNotificationPrefs(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const channels = [
    { key: 'inApp', label: 'No app', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { key: 'email', label: 'Email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { key: 'whatsapp', label: 'WhatsApp', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Preferencias de Notificacao</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Escolha como receber cada tipo de alerta</p>
        </div>
        {saved && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Salvo
          </span>
        )}
      </div>

      {/* Header */}
      <div className="grid grid-cols-[1fr_repeat(3,64px)] gap-2 items-center px-3">
        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Tipo</span>
        {channels.map(ch => (
          <span key={ch.key} className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase text-center">{ch.label}</span>
        ))}
      </div>

      {/* Rows */}
      <div className="space-y-1">
        {Object.entries(NOTIFICATION_TYPE_LABELS).map(([type, label]) => (
          <div key={type} className="grid grid-cols-[1fr_repeat(3,64px)] gap-2 items-center px-3 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
            <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
            {channels.map(ch => {
              const isActive = prefs[type]?.[ch.key] ?? false;
              return (
                <div key={ch.key} className="flex justify-center">
                  <button
                    onClick={() => handleToggle(type, ch.key)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={ch.icon} />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 rounded-lg p-3">
        <p className="text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2">
          <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>
            <strong>WhatsApp:</strong> Abre o wa.me com a mensagem pre-formatada.
            <br />
            <strong>Email:</strong> Usa o servico de email configurado no Supabase. Se nao configurado, abre o cliente de email padrao.
          </span>
        </p>
      </div>
    </div>
  );
}

export default NotificationPreferences;

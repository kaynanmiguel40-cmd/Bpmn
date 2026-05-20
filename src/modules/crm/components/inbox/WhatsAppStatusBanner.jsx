import { AlertTriangle, Loader2, QrCode, CheckCircle2, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCrmWhatsAppInstance } from '../../hooks/useCrmQueries';

/**
 * Banner no topo do Inbox que mostra status da instancia.
 * Esconde quando connected. Direciona pra tela de setup pra reconectar.
 */
export function WhatsAppStatusBanner({ instanceName }) {
  const { data: instance } = useCrmWhatsAppInstance(instanceName);

  if (!instance) {
    return (
      <div className="bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800 px-4 py-2 flex items-center gap-2 text-sm">
        <AlertTriangle size={14} className="text-orange-500 shrink-0" />
        <span className="text-orange-700 dark:text-orange-300">
          Instância WhatsApp não configurada.
        </span>
        <Link to="/crm/whatsapp" className="ml-auto text-orange-600 dark:text-orange-300 hover:underline font-medium text-xs">
          Configurar
        </Link>
      </div>
    );
  }

  if (instance.status === 'connected') return null;

  const config = {
    connecting: {
      Icon: Loader2,
      iconCls: 'text-blue-500 animate-spin',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      msg: 'Conectando ao WhatsApp...',
    },
    qr_pending: {
      Icon: QrCode,
      iconCls: 'text-yellow-500',
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      text: 'text-yellow-700 dark:text-yellow-300',
      msg: 'QR Code pendente. Escaneie pra conectar.',
    },
    disconnected: {
      Icon: AlertTriangle,
      iconCls: 'text-orange-500',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-700 dark:text-orange-300',
      msg: 'WhatsApp desconectado.',
    },
    banned: {
      Icon: Ban,
      iconCls: 'text-red-500',
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      msg: 'Número banido pelo WhatsApp. Use outro chip.',
    },
  };

  const c = config[instance.status] || config.disconnected;

  return (
    <div className={`${c.bg} border-b ${c.border} px-4 py-2 flex items-center gap-2 text-sm`}>
      <c.Icon size={14} className={`${c.iconCls} shrink-0`} />
      <span className={c.text}>{c.msg}</span>
      {instance.phoneNumber && (
        <span className="text-xs text-slate-500 ml-1">({instance.phoneNumber})</span>
      )}
      <Link
        to="/crm/whatsapp"
        className={`ml-auto ${c.text} hover:underline font-medium text-xs`}
      >
        Gerenciar
      </Link>
    </div>
  );
}

export default WhatsAppStatusBanner;

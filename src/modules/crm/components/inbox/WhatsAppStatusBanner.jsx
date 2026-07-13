import { AlertTriangle, Loader2, QrCode, Ban } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCrmWhatsAppInstances } from '../../hooks/useCrmQueries';

const STATUS_CONFIG = {
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

/**
 * Banner no topo do Inbox com status de TODAS as instancias WhatsApp
 * configuradas — nao so a que esta ativa na conversa aberta. Com 2 numeros
 * (ex: fyness-principal + lorena-consultora), o outro podia cair
 * desconectado e ficar invisivel enquanto o usuario navegava conversas do
 * numero que segue conectado.
 */
export function WhatsAppStatusBanner() {
  const { data: instances = [] } = useCrmWhatsAppInstances();

  if (instances.length === 0) {
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

  const problematic = instances.filter((i) => i.status !== 'connected');
  if (problematic.length === 0) return null;

  return (
    <div className="flex flex-col">
      {problematic.map((instance) => {
        const c = STATUS_CONFIG[instance.status] || STATUS_CONFIG.disconnected;
        return (
          <div key={instance.id} className={`${c.bg} border-b ${c.border} px-4 py-2 flex items-center gap-2 text-sm`}>
            <c.Icon size={14} className={`${c.iconCls} shrink-0`} />
            <span className={c.text}>{c.msg}</span>
            <span className="text-xs text-slate-500 ml-1">
              ({instance.phoneNumber || instance.instanceName})
            </span>
            <Link
              to="/crm/whatsapp"
              className={`ml-auto ${c.text} hover:underline font-medium text-xs`}
            >
              Gerenciar
            </Link>
          </div>
        );
      })}
    </div>
  );
}

export default WhatsAppStatusBanner;

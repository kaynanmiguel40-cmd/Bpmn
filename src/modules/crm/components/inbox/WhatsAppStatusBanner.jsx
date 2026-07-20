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

/** "há 2 dias" / "há 3h" / "há 40min" — sem sinal desde quando. */
function tempoSemSinal(lastSeenAt) {
  if (!lastSeenAt) return 'desde sempre';
  const min = Math.floor((Date.now() - new Date(lastSeenAt).getTime()) / 60000);
  if (min < 60)   return `há ${min}min`;
  const h = Math.floor(min / 60);
  if (h < 24)     return `há ${h}h`;
  const d = Math.floor(h / 24);
  return `há ${d} dia${d > 1 ? 's' : ''}`;
}

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

  // "Conectado" nao basta: o status so mudava quando chegava um evento de
  // conexao, entao uma sessao que morre calada congela em 'connected' pra
  // sempre — e este banner, que so olhava status != 'connected', nunca tinha o
  // que mostrar. Foi assim que um numero passou 24 dias fora com a tela dizendo
  // que estava tudo certo.
  //
  // O reconciliador (evolution-webhook ?action=reconcile_instances) carimba
  // last_seen_at a cada checagem em que a instancia esta mesmo de pe. Entao
  // silencio prolongado aqui significa uma de duas coisas, e as duas merecem
  // alarme: a instancia caiu, ou a propria checagem parou de rodar.
  const LIMITE_SEM_SINAL_MIN = 30;
  const mudas = instances.filter((i) => {
    if (i.status !== 'connected') return false;
    if (!i.lastSeenAt) return true;
    const min = (Date.now() - new Date(i.lastSeenAt).getTime()) / 60000;
    return min > LIMITE_SEM_SINAL_MIN;
  });

  const problematic = instances.filter((i) => i.status !== 'connected');
  if (problematic.length === 0 && mudas.length === 0) return null;

  return (
    <div className="flex flex-col">
      {mudas.map((instance) => (
        <div
          key={`mudo-${instance.id}`}
          className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-4 py-2 flex items-center gap-2 text-sm"
        >
          <AlertTriangle size={14} className="text-amber-500 shrink-0" />
          <span className="text-amber-700 dark:text-amber-300">
            Diz conectado, mas está sem sinal {tempoSemSinal(instance.lastSeenAt)}. Pode não estar recebendo.
          </span>
          <span className="text-xs text-slate-500 ml-1">
            ({instance.phoneNumber || instance.instanceName})
          </span>
          <Link
            to="/crm/whatsapp"
            className="ml-auto text-amber-700 dark:text-amber-300 hover:underline font-medium text-xs"
          >
            Verificar
          </Link>
        </div>
      ))}
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

/**
 * CrmWhatsAppSetupPage - Tela de gerenciamento das instâncias Evolution.
 *
 * - Lista instâncias cadastradas
 * - Mostra status + QR (se qr_pending) pra escanear
 * - Permite registrar nova instancia (cria so no banco; instancia real na
 *   Evolution é criada via /manager OU futura Edge admin)
 *
 * Observação: instancia "registrada" aqui apenas reserva o nome. A primeira
 * conexão real acontece quando a Evolution dispara o webhook de qrcode/connection.
 */

import { useState } from 'react';
import {
  Smartphone, Plus, CheckCircle2, AlertTriangle, Loader2, QrCode, Ban,
  RefreshCw,
} from 'lucide-react';
import {
  useCrmWhatsAppInstances,
  useCreateCrmWhatsAppInstance,
} from '../hooks/useCrmQueries';

const STATUS_META = {
  connected:    { label: 'Conectado',     Icon: CheckCircle2, cls: 'text-emerald-600' },
  qr_pending:   { label: 'QR pendente',   Icon: QrCode,       cls: 'text-yellow-600' },
  connecting:   { label: 'Conectando',    Icon: Loader2,      cls: 'text-blue-600 animate-spin' },
  disconnected: { label: 'Desconectado',  Icon: AlertTriangle, cls: 'text-orange-600' },
  banned:       { label: 'Banido',        Icon: Ban,          cls: 'text-red-600' },
};

function InstanceCard({ instance }) {
  const meta = STATUS_META[instance.status] || STATUS_META.disconnected;
  const showQr = instance.status === 'qr_pending' && instance.qrCode;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
            <Smartphone size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {instance.instanceName}
            </h3>
            {instance.phoneNumber && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {instance.phoneNumber}
              </p>
            )}
          </div>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-medium ${meta.cls}`}>
          <meta.Icon size={14} />
          <span>{meta.label}</span>
        </div>
      </div>

      {showQr && (
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-3">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Escaneie no WhatsApp do celular: Configurações &rarr; Aparelhos Conectados &rarr; Conectar um aparelho
          </p>
          <div className="flex justify-center bg-white rounded-md p-3">
            <img
              src={instance.qrCode.startsWith('data:') ? instance.qrCode : `data:image/png;base64,${instance.qrCode}`}
              alt="QR Code"
              className="max-w-[240px] max-h-[240px]"
            />
          </div>
          {instance.qrExpiresAt && (
            <p className="text-[10px] text-center text-slate-400 mt-2">
              QR expira em ~60s. Recarrega automatico quando renovar.
            </p>
          )}
        </div>
      )}

      {instance.status === 'disconnected' && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Acesse o painel da Evolution API (<code>{import.meta.env.VITE_EVOLUTION_URL || 'EVOLUTION_URL'}/manager</code>) pra reconectar.
        </p>
      )}

      {instance.lastSeenAt && (
        <p className="text-[10px] text-slate-400 mt-3">
          Última atividade: {new Date(instance.lastSeenAt).toLocaleString('pt-BR')}
        </p>
      )}
    </div>
  );
}

function NewInstanceForm({ onCreated }) {
  const [name, setName] = useState('');
  const createMutation = useCreateCrmWhatsAppInstance();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await createMutation.mutateAsync({ instanceName: name.trim() });
    if (res?.ok) {
      setName('');
      onCreated?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 flex items-center gap-2">
        <Plus size={14} /> Registrar nova instância
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
        Esse cadastro apenas reserva o nome. A instância real é criada no painel da Evolution API e a conexão acontece quando você escaneia o QR.
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ex: fyness-vendedor-2"
          className="flex-1 px-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
        />
        <button
          type="submit"
          disabled={!name.trim() || createMutation.isPending}
          className="px-4 py-1.5 rounded-md bg-fyness-primary text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          {createMutation.isPending ? 'Criando...' : 'Registrar'}
        </button>
      </div>
    </form>
  );
}

export function CrmWhatsAppSetupPage() {
  const { data: instances = [], isLoading, refetch } = useCrmWhatsAppInstances();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">WhatsApp · Configuração</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Gerencie as instâncias Evolution API conectadas ao seu CRM.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="p-2 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Recarregar"
        >
          <RefreshCw size={16} />
        </button>
      </header>

      {isLoading ? (
        <div className="text-center text-sm text-slate-400 py-8">Carregando instâncias...</div>
      ) : (
        <div className="space-y-3">
          {instances.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
              <Smartphone className="mx-auto mb-2 text-slate-300" size={32} />
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nenhuma instância registrada ainda.
              </p>
            </div>
          ) : (
            instances.map((inst) => <InstanceCard key={inst.id} instance={inst} />)
          )}
        </div>
      )}

      <NewInstanceForm onCreated={refetch} />
    </div>
  );
}

export default CrmWhatsAppSetupPage;

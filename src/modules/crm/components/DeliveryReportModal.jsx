/**
 * DeliveryReportModal - relatório de ENTREGA por tarefa.
 *
 * Abre ao concluir uma tarefa na Agenda. O texto fica salvo NA tarefa
 * (crm_activities.delivery_report) — atribuído ao lead e à tarefa — e entra no
 * relatório do lead (diário/semanal/mensal). Pulável (concluir não exige escrever).
 */

import { useState, useEffect } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { useUpdateCrmActivity } from '../hooks/useCrmQueries';

export function DeliveryReportModal({ open, task, onClose, onSaved }) {
  const updateMutation = useUpdateCrmActivity();
  const [text, setText] = useState('');

  useEffect(() => { if (open) setText(task?.deliveryReport || ''); }, [open, task?.deliveryReport]);

  if (!open || !task) return null;

  const save = async () => {
    await updateMutation.mutateAsync({ id: task.id, updates: { deliveryReport: text } });
    onSaved?.();
    onClose();
  };

  return (
    <CrmModal open={open} onClose={onClose} title="Relatório de entrega" size="md"
      footer={
        <>
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
            Pular
          </button>
          <button type="button" onClick={save} disabled={updateMutation.isPending}
            className="px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
            {updateMutation.isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            Salvar entrega
          </button>
        </>
      }>
      <div className="space-y-3">
        <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <ClipboardCheck size={15} className="text-emerald-500" /> Tarefa: <strong className="text-slate-700 dark:text-slate-200">{task.title}</strong>
        </p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          autoFocus
          placeholder="O que foi entregue / o que rolou nessa tarefa? (entra no relatório do lead)"
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary resize-none"
        />
      </div>
    </CrmModal>
  );
}

export default DeliveryReportModal;

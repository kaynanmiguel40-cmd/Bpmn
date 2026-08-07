/**
 * ReassignTaskModal — passar uma tarefa (ou o lead inteiro) pra outro vendedor,
 * direto da Agenda/Fila. Escolhe quem recebe e, quando a tarefa tem lead, o
 * ESCOPO: só esta tarefa OU o lead inteiro (todas as pendentes + o dono).
 */

import { useState, useEffect } from 'react';
import { UserCheck } from 'lucide-react';
import { CrmModal } from '../ui/CrmModal';
import { useReassignTask } from '../../hooks/useWorkQueue';

export function ReassignTaskModal({ open, task, membros = [], onClose }) {
  const [toMember, setToMember] = useState(null);
  const [scope, setScope] = useState('lead');
  const reassign = useReassignTask();

  const temLead = !!task?.dealId;

  useEffect(() => {
    if (open) { setToMember(null); setScope(temLead ? 'lead' : 'task'); }
  }, [open, temLead]);

  // Só vendedores do CRM (com login), e sem o dono atual da tarefa.
  const alvos = (membros || []).filter(
    (m) => m.authUserId && m.crmRole && m.name !== task?.assignedToName,
  );

  const confirmar = () => {
    if (!toMember) return;
    reassign.mutate(
      { scope: temLead ? scope : 'task', task, toMember },
      { onSuccess: (ok) => { if (ok) onClose?.(); } },
    );
  };

  const btn = (ativo) =>
    `w-full text-left px-3 py-2.5 rounded-lg border text-sm flex items-center gap-2.5 transition-colors ${
      ativo
        ? 'border-fyness-primary bg-fyness-primary/10 text-fyness-primary font-semibold'
        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200'
    }`;

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title="Passar pra outro vendedor"
      size="sm"
      footer={
        <>
          <button onClick={onClose} disabled={reassign.isPending}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 w-full sm:w-auto">
            Cancelar
          </button>
          <button onClick={confirmar} disabled={!toMember || reassign.isPending}
            className="min-h-[44px] px-4 py-2 text-sm font-bold text-white bg-fyness-primary hover:bg-fyness-secondary rounded-lg disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto">
            <UserCheck size={16} /> {reassign.isPending ? 'Passando…' : 'Passar'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {task && (
          <p className="text-[13px] text-slate-500 dark:text-slate-400">
            Tarefa: <span className="font-medium text-slate-700 dark:text-slate-200">{task.leadName || task.title}</span>
          </p>
        )}

        <div>
          <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">Quem recebe</div>
          {alvos.length === 0 ? (
            <p className="text-sm text-slate-400">Nenhum outro vendedor pra passar.</p>
          ) : (
            <div className="space-y-1.5 max-h-[38vh] overflow-y-auto">
              {alvos.map((m) => (
                <button key={m.authUserId} type="button" onClick={() => setToMember(m)} className={btn(toMember?.authUserId === m.authUserId)}>
                  <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                    style={{ backgroundColor: m.color || '#94a3b8' }}>
                    {(m.name || '?').charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate">{m.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {temLead && (
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5">O que passa</div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setScope('lead')} className={btn(scope === 'lead')}>O lead inteiro</button>
              <button type="button" onClick={() => setScope('task')} className={btn(scope === 'task')}>Só esta tarefa</button>
            </div>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1.5">
              {scope === 'lead'
                ? 'Todas as tarefas pendentes deste lead + o dono do negócio passam pro vendedor escolhido.'
                : 'Só esta tarefa muda de dono; o resto do lead fica com o vendedor atual.'}
            </p>
          </div>
        )}
      </div>
    </CrmModal>
  );
}

export default ReassignTaskModal;

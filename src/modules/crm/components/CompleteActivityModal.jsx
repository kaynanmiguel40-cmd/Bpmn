/**
 * CompleteActivityModal - modal de conclusão de tarefa do CRM.
 *
 * Ao concluir uma atividade (ligação/mensagem/reunião/tarefa/...), pede o par
 * INPUT (o que o vendedor fez/disse, em cima) / OUTPUT (o que o lead
 * respondeu/reagiu, embaixo). Cada tarefa grava o seu próprio par — vira a
 * "entrega" da tarefa e alimenta o relatório do dia/semana/mês.
 *
 * Mesmo padrão do PostCallModal (chamada), mas genérico pra qualquer tipo
 * de atividade.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';

export function CompleteActivityModal({
  open,
  onClose,
  activity,     // { title, type } — a tarefa sendo concluída
  onSubmit,     // ({ input, output }) => void
  isPending,
}) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const handleConfirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setInput('');
    setOutput('');
  }, [open, activity?.id]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleConfirmRef.current?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const canSubmit = useMemo(() => !isPending, [isPending]);

  const handleConfirm = () => {
    if (!canSubmit) return;
    onSubmit?.({ input: input.trim(), output: output.trim() });
  };
  handleConfirmRef.current = handleConfirm;

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title="Concluir tarefa"
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            Pular
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canSubmit}
            title="Ctrl+Enter pra concluir"
            className="px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <CheckCircle2 size={15} /> Concluir
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {activity?.title && (
          <div className="text-sm font-medium text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            {activity.title}
          </div>
        )}

        {/* Input em cima: o que o vendedor fez/disse */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            O que você fez/disse
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
            placeholder="Ex.: liguei e apresentei a proposta, mandei o áudio explicando o preço..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary resize-none"
            autoFocus
          />
        </div>

        {/* Output embaixo: o que o lead respondeu/reagiu */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            O que o lead respondeu
          </label>
          <textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            rows={3}
            placeholder="Ex.: achou caro, pediu pra ligar semana que vem, topou agendar reunião..."
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary resize-none"
          />
        </div>
      </div>
    </CrmModal>
  );
}

export default CompleteActivityModal;

/**
 * CompleteActivityModal - modal de conclusão de tarefa do CRM.
 *
 * Ao concluir uma atividade (ligação/mensagem/reunião/tarefa/...), pede o par
 * INPUT (o que o vendedor fez/disse, em cima) / OUTPUT (o que o lead
 * respondeu/reagiu, embaixo). Cada tarefa grava o seu próprio par — vira a
 * "entrega" da tarefa e alimenta o relatório do dia/semana/mês.
 *
 * Se a tarefa JÁ está concluída (activity.completed), o modal entra em modo
 * EDIÇÃO: pré-preenche com a entrega atual e salva por cima (quem concluiu
 * pulando os detalhes pode voltar e preencher depois).
 *
 * Mesmo padrão do PostCallModal (chamada), mas genérico pra qualquer tipo
 * de atividade.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, RotateCcw, Trash2 } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { fieldClass } from './ui/formFieldClass';

// Botões do rodapé na norma de modal do CRM: alvo de toque de 44px e
// largura cheia no celular (a casca empilha os botões abaixo do sm).
const PRIMARY_BTN =
  'min-h-[44px] px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto';
const SECONDARY_BTN =
  'min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto';

export function CompleteActivityModal({
  open,
  onClose,
  activity,     // { title, type, completed?, deliveryInput?, deliveryReport? }
  onSubmit,     // ({ input, output }) => void
  onOpenHistory,// (activity) => void — opcional; o historico do lead
  onUncomplete, // () => void — opcional; desmarca a tarefa concluida (volta a pendente)
  onDelete,     // () => void — opcional; exclui a tarefa
  isPending,
}) {
  const isEditing = !!activity?.completed;
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const handleConfirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // Editando entrega de tarefa concluída → pré-preenche com o que já tem.
    setInput(activity?.deliveryInput || '');
    setOutput(activity?.deliveryReport || '');
  }, [open, activity?.id, activity?.deliveryInput, activity?.deliveryReport]);

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

  // "Pular" antes so fechava o modal sem concluir a tarefa (agia como
  // Cancelar disfarcado). Agora pula so o preenchimento do input/output e
  // ainda conclui a atividade — quem quer desistir de vez usa "Cancelar".
  const handleSkipDetails = () => {
    if (!canSubmit) return;
    onSubmit?.({ input: '', output: '' });
  };

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar o que aconteceu' : 'Concluir tarefa'}
      size="md"
      footer={
        <>
          {onDelete && (
            <button
              onClick={onDelete}
              disabled={isPending}
              title="Excluir esta tarefa"
              className={`${SECONDARY_BTN} sm:mr-auto text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-900/20`}
            >
              <Trash2 size={15} /> Excluir
            </button>
          )}
          {isEditing && onUncomplete && (
            <button
              onClick={onUncomplete}
              disabled={isPending}
              title="Desmarcar — volta a tarefa pra pendente"
              className={SECONDARY_BTN}
            >
              <RotateCcw size={15} /> Desmarcar
            </button>
          )}
          <button
            onClick={onClose}
            disabled={isPending}
            className={SECONDARY_BTN}
          >
            Cancelar
          </button>
          {!isEditing && (
            <button
              onClick={handleSkipDetails}
              disabled={!canSubmit}
              title="Conclui a tarefa sem preencher o que foi feito/respondido"
              className={SECONDARY_BTN}
            >
              Pular detalhes e concluir
            </button>
          )}
          <button
            onClick={handleConfirm}
            disabled={!canSubmit}
            title={isEditing ? 'Ctrl+Enter pra salvar' : 'Ctrl+Enter pra concluir'}
            className={PRIMARY_BTN}
          >
            {/* Carregando: o spinner ocupa o lugar do ícone e o texto diz o que está acontecendo. */}
            {isPending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEditing ? 'Salvando…' : 'Concluindo…'}
              </>
            ) : (
              <>
                <CheckCircle2 size={15} />
                {isEditing ? 'Salvar' : 'Concluir'}
              </>
            )}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {activity?.title && (
          <div className="flex items-start justify-between gap-2 text-sm font-medium text-slate-800 dark:text-slate-100 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg p-3">
            <span className="min-w-0">{activity.title}</span>
            {/* Clicar na tarefa passou a abrir a conclusao (a Agenda executa),
                entao o historico do lead perdeu o gesto que o abria. Fica aqui,
                a um clique — so quando ha lead a que voltar. */}
            {onOpenHistory && (activity.dealId || activity.contactId) && (
              <button
                type="button"
                onClick={() => onOpenHistory(activity)}
                className="shrink-0 text-[12px] font-semibold text-fyness-primary hover:underline"
              >
                Ver histórico →
              </button>
            )}
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
            className={fieldClass(false, 'resize-none')}
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
            className={fieldClass(false, 'resize-none')}
          />
        </div>
      </div>
    </CrmModal>
  );
}

export default CompleteActivityModal;

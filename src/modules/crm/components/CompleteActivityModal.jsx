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
import { CheckCircle2, RotateCcw, Trash2, UserCheck } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { fieldClass } from './ui/formFieldClass';

// Botões do rodapé na norma de modal do CRM: alvo de toque de 44px e
// largura cheia no celular (a casca empilha os botões abaixo do sm).
const PRIMARY_BTN =
  'min-h-[44px] px-4 py-2 text-sm font-medium whitespace-nowrap bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto';
const SECONDARY_BTN =
  'min-h-[44px] px-4 py-2 text-sm font-medium whitespace-nowrap text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto';

// Ação RARA (excluir, passar, desmarcar): rótulo no celular, só ícone no desktop.
//
// O rodapé tem 5 botões e ~470px úteis (modal md). Cinco rótulos não cabem: ou
// espremem e quebram o texto em 3 linhas, ou saltam pra uma segunda fileira que
// empurra o "Concluir" pra longe de onde a mão está. Encolher as raras é o que
// abre espaço pras que importam — e o desktop tem tooltip pra dizer o que fazem.
//
// A inversão é de propósito: no CELULAR os botões empilham em largura cheia
// (`w-full sm:w-auto`), então lá sobra espaço e o rótulo aparece; quem aperta
// num botão de linha inteira sem texto não sabe o que vai acontecer.
// No desktop vira um QUADRADO de 44px sem borda: ação de utilidade, não um botão
// que disputa a decisão. Com borda, cada ícone virava mais uma caixa competindo
// com o Concluir; e px-3 num min-h de 44 dava um retângulo em pé, torto.
const ICON_BTN =
  'min-h-[44px] px-4 py-2 sm:w-11 sm:h-11 sm:p-0 text-sm font-medium whitespace-nowrap text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto';

export function CompleteActivityModal({
  open,
  onClose,
  activity,     // { title, type, completed?, deliveryInput?, deliveryReport? }
  onSubmit,     // ({ input, output }) => void
  onOpenHistory,// (activity) => void — opcional; o historico do lead
  onUncomplete, // () => void — opcional; desmarca a tarefa concluida (volta a pendente)
  onDelete,     // () => void — opcional; exclui a tarefa
  onReassign,   // (activity) => void — opcional; passar a tarefa/lead pra outro vendedor
  isPending,
}) {
  const isEditing = !!activity?.completed;
  // Ligação PRECISA de desfecho: falou (true) ou tentou e não atendeu (false).
  // Sem isso, concluir por esta tela deixava a ligação "sem desfecho" e a taxa de
  // atendimento do placar mentia — só a execução principal da Agenda perguntava.
  const isCall = activity?.type === 'call';
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [contacted, setContacted] = useState(null);
  const handleConfirmRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // Editando entrega de tarefa concluída → pré-preenche com o que já tem.
    setInput(activity?.deliveryInput || '');
    setOutput(activity?.deliveryReport || '');
    setContacted(typeof activity?.contacted === 'boolean' ? activity.contacted : null);
  }, [open, activity?.id, activity?.deliveryInput, activity?.deliveryReport, activity?.contacted]);

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

  // Concluir uma ligação exige dizer se atendeu (menos em edição, onde o desfecho
  // já foi decidido). O desfecho não é "detalhe" — é o que separa "falei" de
  // "ninguém atendeu" no placar e no progresso do playbook.
  const faltaDesfecho = isCall && !isEditing && contacted === null;
  const canSubmit = useMemo(() => !isPending && !faltaDesfecho, [isPending, faltaDesfecho]);

  // Não atendeu e sem relato: grava "Não atendeu" (mesmo texto que a execução
  // principal usa), pra a tarefa não ficar concluída muda sobre o desfecho.
  const outputFinal = () =>
    output.trim() || (isCall && contacted === false ? 'Não atendeu' : '');
  const contactedFinal = () => (isCall ? contacted : undefined);

  const handleConfirm = () => {
    if (!canSubmit) return;
    onSubmit?.({ input: input.trim(), output: outputFinal(), contacted: contactedFinal() });
  };
  handleConfirmRef.current = handleConfirm;

  // O "Pular e concluir" foi REMOVIDO, não escondido: os dois campos são
  // opcionais, então apertar Concluir com eles vazios já produzia payload
  // idêntico ao do Pular. A única coisa que ele fazia de diferente era DESCARTAR
  // o que a pessoa tinha acabado de digitar — que ninguém quer.
  //
  // Ele existia pra dizer "pode deixar em branco". Esse recado agora está no
  // rótulo dos campos ("opcional"), que é onde a dúvida aparece, e não num botão
  // que disputava a fileira com o Concluir de verdade.

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
              aria-label="Excluir esta tarefa"
              className={`${ICON_BTN} sm:mr-auto text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20`}
            >
              <Trash2 size={15} /> <span className="sm:hidden">Excluir</span>
            </button>
          )}
          {onReassign && !isEditing && (
            <button
              onClick={() => onReassign(activity)}
              disabled={isPending}
              title="Passar pra outro vendedor"
              aria-label="Passar pra outro vendedor"
              className={ICON_BTN}
            >
              <UserCheck size={15} /> <span className="sm:hidden">Passar</span>
            </button>
          )}
          {isEditing && onUncomplete && (
            <button
              onClick={onUncomplete}
              disabled={isPending}
              title="Desmarcar — volta a tarefa pra pendente"
              aria-label="Desmarcar — volta a tarefa pra pendente"
              className={ICON_BTN}
            >
              <RotateCcw size={15} /> <span className="sm:hidden">Desmarcar</span>
            </button>
          )}
          {/* Cancelar SEM borda: ele e o "Pular e concluir" ficam lado a lado e,
              com a mesma casca, os dois competem pela mesma atenção — sendo que um
              desiste da tarefa e o outro a conclui. Fantasma também economiza a
              largura da borda, que é justamente o que falta nesta fileira. */}
          <button
            onClick={onClose}
            disabled={isPending}
            className="min-h-[44px] px-4 sm:px-3 py-2 text-sm font-medium whitespace-nowrap text-slate-500 dark:text-slate-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:hover:text-slate-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            Cancelar
          </button>
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

        {/* Ligação: atendeu ou não? Obrigatório antes de concluir (menos edição).
            É o que alimenta atendidas × não atendidas no placar. */}
        {isCall && !isEditing && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Conseguiu falar com o lead?
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setContacted(true)}
                className={`min-h-[44px] px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  contacted === true
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-emerald-400'
                }`}
              >
                Falei com ele
              </button>
              <button
                type="button"
                onClick={() => setContacted(false)}
                className={`min-h-[44px] px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                  contacted === false
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-rose-400'
                }`}
              >
                Não atendeu
              </button>
            </div>
          </div>
        )}

        {/* Input em cima: o que o vendedor fez/disse. Some no "não atendeu": não
            houve conversa a relatar — só o desfecho importa. */}
        {!(isCall && contacted === false) && (
        <>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            O que você fez/disse <span className="font-normal normal-case tracking-normal text-slate-400 dark:text-slate-500">(opcional)</span>
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
            O que o lead respondeu <span className="font-normal normal-case tracking-normal text-slate-400 dark:text-slate-500">(opcional)</span>
          </label>
          <textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            rows={3}
            placeholder="Ex.: achou caro, pediu pra ligar semana que vem, topou agendar reunião..."
            className={fieldClass(false, 'resize-none')}
          />
        </div>
        </>
        )}
      </div>
    </CrmModal>
  );
}

export default CompleteActivityModal;

/**
 * ExecuteTaskModal — a tarefa do processo sendo EXECUTADA, na Agenda.
 *
 * A Agenda e o nivel de execucao: o pipeline so mostra onde o lead esta, e o
 * check acontece aqui. Entao tudo que o vendedor precisa pra fazer o toque
 * tem que caber nesta tela, sem abrir o lead:
 *
 *   1. de que canal e (ligacao / WhatsApp / e-mail)
 *   2. pra quem — com o telefone a um clique (ligar ou abrir a conversa)
 *   3. o SCRIPT do passo: o que falar
 *   4. os CENARIOS: o que ele pode responder → 1 clique conclui com aquele
 *      resultado, sem digitar
 *   5. depois de concluir, qual e o PROXIMO toque e quando
 *
 * Tarefa avulsa (sem stage_step_id) nao tem script nem cenario — essa continua
 * no CompleteActivityModal generico.
 */

import { useEffect, useState } from 'react';
import {
  Phone, MessageCircle, CheckCircle2, CornerDownRight, ArrowRight,
  ExternalLink, Clock,
} from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { ChannelBadge } from './ui/ChannelBadge';
import { stepChannel } from '../services/crmScheduling';

function formatPhone(val) {
  if (!val) return '';
  const clean = val.replace(/\D/g, '');
  if (clean.length === 11) return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  if (clean.length === 10) return clean.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  return val;
}

function whatsappUrl(val) {
  if (!val) return null;
  const clean = val.replace(/\D/g, '');
  if (clean.length < 10) return null;
  const withCountry = clean.startsWith('55') && clean.length >= 12 ? clean : `55${clean}`;
  return `https://wa.me/${withCountry}`;
}

const whenLabel = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  const hoje = new Date();
  const mesmoDia = d.toDateString() === hoje.toDateString();
  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (mesmoDia) return `hoje ${hora}`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' + hora;
};

export function ExecuteTaskModal({
  open,
  onClose,
  activity,      // { id, title, type, leadName, stageName, contactPhone, startDate, completed, deliveryInput, deliveryReport, dealId }
  step,          // { title, script, scenarios } — passo do playbook (pode faltar)
  nextActivity,  // { title, startDate } | null — proximo toque da cadencia
  onSubmit,      // ({ input, output, contacted }) => void
  onOpenLead,    // (dealId) => void
  onOpenHistory, // (activity) => void — timeline do lead, sem sair da Agenda
  onCorrect,     // () => void — reabre o formulario apos concluir (desfazer)
  advance,       // { current:{name}, next:{id,name} } | null — convite de avancar
  onAdvance,     // (stage) => void
  onDismissAdvance,
  advancing,
  isPending,
  justDone,      // true logo apos concluir — troca o corpo pela confirmacao
}) {
  const isEditing = !!activity?.completed && !justDone;
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  // null = ainda nao escolheu. So vale pra toque que depende de ALGUEM ATENDER.
  const [contacted, setContacted] = useState(null);

  useEffect(() => {
    if (!open) return;
    setInput(activity?.deliveryInput || '');
    setOutput(activity?.deliveryReport || '');
    setContacted(null);
  }, [open, activity?.id, activity?.deliveryInput, activity?.deliveryReport]);

  if (!activity) return null;

  const phone = activity.contactPhone;
  const wa = whatsappUrl(phone);
  const scenarios = step?.scenarios || [];
  // So ligacao tem "nao atendeu". E-mail e WhatsApp sao assincronos: mandar JA
  // e o passo cumprido — a resposta (ou o silencio) vem no toque seguinte.
  const isCall = stepChannel(activity.title) === 'call';

  // Confirmacao pos-conclusao: mostra o proximo toque pra nao perder o fio da
  // cadencia. "Corrigir" volta pro formulario — e o desfazer de quem clicou no
  // cenario errado (o chip conclui em 1 clique, entao errar e facil).
  if (justDone) {
    return (
      <CrmModal open={open} onClose={onClose} title="Tarefa concluída" size="md"
        footer={
          <>
            {/* O chip de cenario conclui em 1 clique, entao errar e facil.
                "Corrigir" e o desfazer que sobrevive ao fechamento do modal. */}
            {onCorrect && (
              <button onClick={onCorrect}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700">
                Corrigir
              </button>
            )}
            <button onClick={onClose}
              className="px-4 py-2 text-sm font-semibold bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg">
              {nextActivity ? 'Próxima tarefa →' : 'Fechar'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 size={20} className="text-emerald-500 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{activity.title}</div>
              {output && (
                <div className="text-[13px] text-slate-600 dark:text-slate-300 mt-0.5 flex gap-1.5">
                  <CornerDownRight size={13} className="shrink-0 mt-0.5 text-emerald-500" />
                  <span><span className="text-slate-500 dark:text-slate-400">Lead:</span> {output}</span>
                </div>
              )}
            </div>
          </div>

          {/* Convite de avancar — CONFIRMADO, nunca automatico. A Agenda
              executa e a Pipeline mostra onde o lead esta; mudar o funil sem
              ela mandar quebraria essa divisao. Mas obrigar a ir ate a Pipeline
              arrastar o card depois de uma boa conversa e o tipo de passo que
              simplesmente nao acontece. */}
          {advance && (
            <div className="rounded-xl border border-fyness-primary/30 bg-fyness-primary/5 p-3">
              <div className="text-sm text-slate-700 dark:text-slate-200 mb-2">
                {activity.leadName || 'Esse lead'} avançou para <strong>{advance.next.name}</strong>?
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onAdvance?.(advance.next)}
                  disabled={advancing}
                  className="min-h-[44px] px-4 rounded-lg text-sm font-bold text-white bg-fyness-primary hover:bg-fyness-secondary disabled:opacity-50"
                >
                  {advancing ? 'Movendo…' : `Mover para ${advance.next.name}`}
                </button>
                <button
                  type="button"
                  onClick={onDismissAdvance}
                  disabled={advancing}
                  className="min-h-[44px] px-4 rounded-lg text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Continua em {advance.current.name}
                </button>
              </div>
            </div>
          )}

          {nextActivity ? (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3">
              <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Próximo contato
              </div>
              <div className="flex items-center gap-2">
                <ChannelBadge title={nextActivity.title} showLabel={false} />
                <span className="flex-1 text-sm text-slate-700 dark:text-slate-200 min-w-0 truncate">
                  {nextActivity.title}
                </span>
                <span className="shrink-0 inline-flex items-center gap-1 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                  <Clock size={11} /> {whenLabel(nextActivity.startDate)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              Era o último toque agendado deste lead. Se ele avançou, mova o card na Pipeline.
            </p>
          )}
        </div>
      </CrmModal>
    );
  }

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Editar o que aconteceu' : 'Executar tarefa'}
      size="md"
      footer={
        <>
          <button onClick={onClose} disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50">
            Cancelar
          </button>
          <button
            onClick={() => onSubmit?.({
              input: input.trim(),
              output: output.trim() || (contacted === false ? 'Não atendeu' : ''),
              contacted: contacted !== false,
            })}
            // Ligacao exige escolher o desfecho: concluir sem dizer se falou ou
            // nao e o que fazia o passo virar verde por engano.
            disabled={isPending || (isCall && !isEditing && contacted === null)}
            title={isCall && contacted === null ? 'Diga se conseguiu falar com o lead' : undefined}
            className="px-4 py-2 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            <CheckCircle2 size={15} /> {isEditing ? 'Salvar' : 'Concluir'}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* 1+2. O que e, pra quem, e o contato a um clique */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-3 space-y-2.5">
          <div className="flex items-center gap-2">
            <ChannelBadge title={activity.title} />
            <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100 min-w-0">
              {activity.title}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {activity.leadName && (
              <button
                type="button"
                onClick={() => activity.dealId && onOpenLead?.(activity.dealId)}
                disabled={!activity.dealId}
                className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-700 dark:text-slate-200 hover:text-fyness-primary disabled:hover:text-slate-700 disabled:cursor-default"
              >
                {activity.leadName}
                {activity.dealId && <ExternalLink size={11} className="opacity-60" />}
              </button>
            )}
            {activity.stageName && (
              <span className="text-[12px] text-slate-500 dark:text-slate-400">· Etapa: {activity.stageName}</span>
            )}
            {activity.dealId && onOpenHistory && (
              <button
                type="button"
                onClick={() => onOpenHistory(activity)}
                className="ml-auto shrink-0 text-[12px] font-semibold text-fyness-primary hover:underline"
              >
                Ver histórico do lead →
              </button>
            )}
          </div>

          {phone && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] tnum text-slate-600 dark:text-slate-300">{formatPhone(phone)}</span>
              <a href={`tel:${phone.replace(/\D/g, '')}`}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-semibold bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-300">
                <Phone size={12} /> Ligar
              </a>
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <MessageCircle size={12} /> WhatsApp
                </a>
              )}
            </div>
          )}
        </div>

        {/* 3. O script — o que falar */}
        {step?.script && (
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              O que falar
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap border-l-2 border-fyness-primary/40 pl-3">
              {step.script}
            </p>
          </div>
        )}

        {/* 4a. O DESFECHO, antes dos cenarios.
            "Nao atendeu" e o resultado mais frequente do dia e ele NAO e um
            cenario como os outros: a tarefa foi executada, mas o passo do
            playbook nao foi cumprido (o objetivo era falar com a pessoa). Ate
            aqui os dois pintavam o passo de verde igual, e a Pipeline mentia
            sobre o quanto o lead tinha avancado. */}
        {isCall && !isEditing && (
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Conseguiu falar com {activity.leadName || 'o lead'}?
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setContacted(true)}
                className={`min-h-[48px] rounded-xl text-sm font-bold border-2 transition-colors disabled:opacity-50 ${
                  contacted === true
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-400'
                }`}
              >
                ✓ Falei com ele
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => setContacted(false)}
                className={`min-h-[48px] rounded-xl text-sm font-bold border-2 transition-colors disabled:opacity-50 ${
                  contacted === false
                    ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-400'
                }`}
              >
                ✗ Não atendeu
              </button>
            </div>
            {contacted === false && (
              <p className="mt-2 text-[12px] text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-2.5 py-2">
                A tarefa sai da fila, mas o passo continua pendente — você ainda
                precisa falar com {activity.leadName || 'ele'}. Depois de concluir,
                marque quando vai tentar de novo.
              </p>
            )}
          </div>
        )}

        {/* 4b. Cenarios: 1 clique conclui com aquele resultado. O "como reagir"
            fica visivel junto — e o script da resposta, nao so o rotulo.
            So aparecem depois de "falei com ele": se ninguem atendeu, nao ha
            resposta do lead a registrar. */}
        {scenarios.length > 0 && contacted !== false && (
          <div>
            <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              O que o lead respondeu?
            </div>
            <div className="space-y-1.5">
              {scenarios.map((sc, i) => (
                <button
                  key={i}
                  type="button"
                  disabled={isPending}
                  onClick={() => {
                    // Reflete no estado antes de concluir: a tela de
                    // confirmação mostra `output`, e o clique no chip nunca
                    // passou pelo textarea.
                    setOutput(sc.when);
                    // Em EDICAO o chip so preenche — quem grava e o Salvar.
                    // Concluir de novo uma tarefa ja concluida nao faz sentido.
                    if (isEditing) return;
                    onSubmit?.({ input: input.trim(), output: sc.when, contacted: true });
                  }}
                  className="w-full text-left rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 px-2.5 py-2 hover:border-fyness-primary hover:bg-fyness-primary/5 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-1.5">
                    <span className="flex-1 text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                      {sc.when}
                    </span>
                    <ArrowRight size={13} className="shrink-0 text-slate-400" />
                  </div>
                  {sc.then && (
                    <div className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 flex gap-1.5">
                      <CornerDownRight size={12} className="shrink-0 mt-0.5 text-fyness-primary" />
                      <span>{sc.then}</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1.5">
              Um clique já conclui a tarefa com esse resultado.
            </p>
          </div>
        )}

        {/* 5. Saida livre pro que nao cabe em nenhum cenario */}
        <div>
          {/* O rotulo segue o que esta VISIVEL, nao o que existe no playbook:
              "Respondeu outra coisa?" so faz sentido com as opcoes na tela, e
              perguntar "o que o lead respondeu" depois de ninguem atender e
              perguntar por uma conversa que nao houve. */}
          <label className="block text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
            {contacted === false
              ? 'Quer anotar alguma coisa?'
              : scenarios.length > 0 ? 'Respondeu outra coisa?' : 'O que o lead respondeu'}
          </label>
          <textarea
            value={output}
            onChange={(e) => setOutput(e.target.value)}
            rows={2}
            placeholder="Escreva o que ele respondeu"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary resize-none"
          />
        </div>

        <details className="group">
          <summary className="text-[12px] font-medium text-slate-500 dark:text-slate-400 cursor-pointer hover:text-slate-700 dark:hover:text-slate-200">
            Anotar o que você fez/disse
          </summary>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            placeholder="Ex.: liguei, caiu na caixa postal, deixei recado"
            className="mt-1.5 w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary resize-none"
          />
        </details>
      </div>
    </CrmModal>
  );
}

export default ExecuteTaskModal;

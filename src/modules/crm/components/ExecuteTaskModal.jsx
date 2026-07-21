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

import { useEffect, useState, useMemo } from 'react';
import {
  Phone, MessageCircle, CheckCircle2, CornerDownRight, ArrowRight,
  ExternalLink, Clock, CalendarClock, Check,
} from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { ChannelBadge } from './ui/ChannelBadge';
import { stepChannel } from '../services/crmScheduling';
import { formatWhen } from '../utils/stepLabel';
import { preencherScript, dadosDoScript } from '../utils/preencherScript';
import { useProfile } from '../../../hooks/useProfile';
import { registrarTentativaDeLigacao, contarTentativas } from '../services/crmCallsService';
import { useAgendarRetorno } from '../hooks/useCrmQueries';

// Date -> string do input datetime-local (local, sem fuso).
const paraInputLocal = (d) => {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};

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

// Classes da norma de modal do CRM. Alvo de toque de 44px porque a usuaria
// principal opera no celular.
const BTN_PRIMARY =
  'min-h-[44px] px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto';
const BTN_SECONDARY =
  'min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto';
// Concluir e VERDE de proposito (verde = concluido em todo o CRM); so a
// geometria segue o primario da norma.
const BTN_PRIMARY_DONE =
  'min-h-[44px] px-4 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto';

// Este modal nao tem validacao de campo — so o ramo "sem erro" do fieldClass.
const fieldClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-fyness-primary bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2';

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
  // "Pediu pra ligar depois": aberto o seletor? e o horario escolhido (local).
  const [retornoAberto, setRetornoAberto] = useState(false);
  const [retornoLocal, setRetornoLocal] = useState('');
  const agendarRetorno = useAgendarRetorno();

  useEffect(() => {
    if (!open) return;
    setInput(activity?.deliveryInput || '');
    setOutput(activity?.deliveryReport || '');
    setContacted(null);
    setRetornoAberto(false);
    setRetornoLocal('');
  }, [open, activity?.id, activity?.deliveryInput, activity?.deliveryReport]);

  // Atalhos de horario pro retorno. Recalcula a cada abertura (o "agora" muda).
  const presetsRetorno = useMemo(() => {
    const agora = new Date();
    const emHoras = (h) => new Date(agora.getTime() + h * 3600000);
    const amanha = (hh) => { const d = new Date(agora); d.setDate(d.getDate() + 1); d.setHours(hh, 0, 0, 0); return d; };
    return [
      { label: 'Em 2h', d: emHoras(2) },
      { label: 'Em 3h', d: emHoras(3) },
      { label: 'Amanhã 9h', d: amanha(9) },
      { label: 'Amanhã 14h', d: amanha(14) },
    ];
  }, [open]);

  if (!activity) return null;

  const phone = activity.contactPhone;
  const wa = whatsappUrl(phone);
  // So ligacao tem "nao atendeu". E-mail e WhatsApp sao assincronos: mandar JA
  // e o passo cumprido — a resposta (ou o silencio) vem no toque seguinte.
  const isCall = stepChannel(activity.title) === 'call';
  const todosCenarios = step?.scenarios || [];
  // O cenario de "ninguem atendeu" e a MESMA coisa que o botao "Não atendeu" —
  // dito duas vezes, em dois lugares. Depois de escolher "Falei com ele", ver
  // "Não atendeu nas 3" na lista de respostas e contradicao pura: a tela
  // oferece o que a pessoa acabou de negar.
  const SEM_CONTATO_RE = /n[ãa]o\s+atend|caixa\s+postal|n[ãa]o\s+retorn|sem\s+resposta|nao\s+respond/i;
  const cenariosDeConversa = todosCenarios.filter(sc => !SEM_CONTATO_RE.test(sc.when || ''));
  const cenarioSemContato = todosCenarios.find(sc => SEM_CONTATO_RE.test(sc.when || ''));
  // Sem o botao de desfecho (e-mail, WhatsApp) todos os cenarios valem: ali nao
  // existe "atendeu ou nao", a mensagem foi enviada e pronto.
  const scenarios = isCall ? cenariosDeConversa : todosCenarios;

  // Os roteiros vem com marcadores ([nome], [empresa], [consultora]) porque o
  // mesmo texto serve pra todo lead. Quem substitui e a tela — nao a cabeca de
  // quem esta com o telefone no ouvido. Dado que falta mantem o marcador: um
  // buraco no meio da frase so aparece depois de ja ter saido pela boca.
  const { profile } = useProfile();
  const dadosScript = dadosDoScript(activity, profile);

  // Confirma o retorno: cria a tarefa de callback + re-ancora a cadencia, e ai
  // conclui a tarefa atual (com o desfecho) e fecha.
  const confirmarRetorno = async () => {
    if (!retornoLocal) return;
    const iso = new Date(retornoLocal).toISOString();
    const r = await agendarRetorno.mutateAsync({
      dealId: activity.dealId,
      stageStepId: activity.stageStepId || null,
      callbackISO: iso,
      excludeActivityId: activity.id,
    });
    if (r?.ok === false) return; // falhou; deixa o modal aberto pra tentar de novo
    const dt = new Date(iso);
    onSubmit?.({
      input: input.trim(),
      output: `Pediu retorno para ${dt.toLocaleDateString('pt-BR')} ${dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      contacted: true,
    });
  };

  // Tentativas ja feitas nesta tarefa. Carrega ao abrir porque a pessoa pode ter
  // ligado, saido pro celular e voltado — o contador nao pode zerar no caminho.
  const [tentativas, setTentativas] = useState(0);
  useEffect(() => {
    if (!activity?.id) return;
    let vivo = true;
    contarTentativas(activity.id).then(n => { if (vivo) setTentativas(n); });
    return () => { vivo = false; };
  }, [activity?.id]);
  const scriptPronto = preencherScript(step?.script, dadosScript);

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
              <button onClick={onCorrect} className={BTN_SECONDARY}>
                Corrigir
              </button>
            )}
            <button onClick={onClose} className={BTN_PRIMARY}>
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
              {/* Empilha no celular: os dois rotulos carregam o nome da etapa e
                  nao cabem lado a lado numa tela estreita. */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={() => onAdvance?.(advance.next)}
                  disabled={advancing}
                  className={BTN_PRIMARY}
                >
                  {advancing && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {advancing ? 'Movendo…' : `Mover para ${advance.next.name}`}
                </button>
                <button
                  type="button"
                  onClick={onDismissAdvance}
                  disabled={advancing}
                  className={BTN_SECONDARY}
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
          <button onClick={onClose} disabled={isPending} className={BTN_SECONDARY}>
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
            className={BTN_PRIMARY_DONE}
          >
            {/* Carregando: o spinner ocupa o lugar do check e o texto diz o que
                esta acontecendo — "disco girando" nao informa nada. */}
            {isPending
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <CheckCircle2 size={15} />}
            {/* O texto muda junto com o spinner: "Concluindo…" diz o que esta
                acontecendo, um disco girando nao diz. Mesmo comportamento do
                CompleteActivityModal — sao a mesma acao em telas irmas. */}
            {isEditing ? (isPending ? 'Salvando…' : 'Salvar') : (isPending ? 'Concluindo…' : 'Concluir')}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        {/* 1+2. O que e, pra quem, e o contato a um clique */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 p-3 space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <ChannelBadge title={activity.title} />
            <span className="flex-1 text-sm font-semibold text-slate-800 dark:text-slate-100 min-w-0">
              {activity.title}
            </span>
            {/* Quando ela esta marcada, com a faixa inicio–fim: a tarefa ocupa
                a agenda, entao so o inicio nao diz se cabe outra coisa depois. */}
            {activity.startDate && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[12px] font-semibold tnum text-slate-500 dark:text-slate-400">
                <Clock size={11} /> {formatWhen(activity.startDate, activity.endDate)}
              </span>
            )}
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
              {/* O toque conta como 1 tentativa. Nao conclui a tarefa: o passo
                  manda ligar ate 3x, e quem fecha e o registro do que houve.
                  A navegacao pro tel: acontece de qualquer jeito — registrar e
                  fire-and-forget justamente pra nao atrasar o discar. */}
              <a href={`tel:${phone.replace(/\D/g, '')}`}
                onClick={() => {
                  setTentativas(t => t + 1);
                  registrarTentativaDeLigacao({
                    contactId: activity.contactId,
                    dealId: activity.dealId,
                    activityId: activity.id,
                    phone,
                  });
                }}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-semibold bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/40 dark:text-sky-300">
                <Phone size={12} /> Ligar
              </a>
              {/* Ligar POR WHATSAPP e outro canal, nao outro botao pro mesmo.
                  Economia e taxa de atendimento sao diferentes das do telefone,
                  e so separando da pra responder "por onde atendem mais?".

                  O link abre a CONVERSA, nao a chamada: o WhatsApp nao expõe
                  jeito de iniciar ligacao por link. Por isso o rotulo diz onde
                  tocar — prometer que disca e mentir pra quem esta com pressa. */}
              {wa && isCall && (
                <a href={wa} target="_blank" rel="noopener noreferrer"
                  onClick={() => {
                    setTentativas(t => t + 1);
                    registrarTentativaDeLigacao({
                      contactId: activity.contactId,
                      dealId: activity.dealId,
                      activityId: activity.id,
                      phone,
                      canal: 'whatsapp',
                    });
                  }}
                  title="Abre a conversa — toque no ícone de telefone lá dentro pra chamar"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <Phone size={12} /> Ligar no WhatsApp
                </a>
              )}
              {tentativas > 0 && (
                <span
                  className="text-[12px] font-semibold text-slate-500 dark:text-slate-400"
                  title="Contado pelo toque no botão, não pelo que você marcar depois"
                >
                  {tentativas} {tentativas === 1 ? 'tentativa' : 'tentativas'}
                  {tentativas >= 3 && ' — já deu as 3, pode deixar recado'}
                </span>
              )}
              {/* Mandar MENSAGEM e outra coisa e NAO conta tentativa de ligacao.
                  Fica visivel tambem no passo de ligacao de proposito: os
                  proprios roteiros mandam "deixa mensagem" depois das 3
                  tentativas, entao esconder aqui quebraria o passo no momento
                  exato em que ele e usado. */}
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer"
                  title="Mandar mensagem — não conta como tentativa de ligação"
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-300">
                  <MessageCircle size={12} /> {isCall ? 'Mensagem' : 'WhatsApp'}
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
              {scriptPronto.texto}
            </p>
            {/* Aviso, nao erro: o roteiro continua utilizavel: so diz onde
                completar de cabeca e o que cadastrar pra nao repetir amanha. */}
            {scriptPronto.faltando.length > 0 && (
              <p className="text-[12px] text-amber-600 dark:text-amber-400 mt-1 pl-3">
                Complete de cabeça: {scriptPronto.faltando.map(f => `[${f}]`).join(', ')}
                {scriptPronto.faltando.includes('nome') && ' — falta vincular o contato neste negócio.'}
              </p>
            )}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
              <div className="mt-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 px-2.5 py-2 space-y-1.5">
                {/* O playbook JA tem o que fazer quando ninguem atende (deixar
                    recado). Isso vivia num cenario da lista, que some justamente
                    aqui — a orientacao desaparecia na hora em que era necessaria.
                    Agora ela aparece como INSTRUCAO: o desfecho ja foi escolhido,
                    nao ha mais o que clicar. */}
                {cenarioSemContato?.then && (
                  <p className="text-[13px] text-amber-900 dark:text-amber-200 flex gap-1.5">
                    <CornerDownRight size={13} className="shrink-0 mt-0.5" />
                    <span>{cenarioSemContato.then}</span>
                  </p>
                )}
                <p className="text-[12px] text-amber-700 dark:text-amber-300">
                  A tarefa sai da fila, mas o passo continua pendente — você ainda
                  precisa falar com {activity.leadName || 'ele'}.
                </p>
              </div>
            )}
          </div>
        )}

        {/* 4b. Cenarios: 1 clique conclui com aquele resultado. O "como reagir"
            fica visivel junto — e o script da resposta, nao so o rotulo.
            Numa LIGACAO so aparecem DEPOIS de "Falei com ele". Mostrar as duas
            perguntas ao mesmo tempo — "conseguiu falar?" e "o que ele
            respondeu?" — fazia parecer que havia duas decisoes competindo,
            quando na verdade uma so existe depois da outra. */}
        {scenarios.length > 0 && (!isCall || isEditing || contacted === true) && (
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
                      <span>{preencherScript(sc.then, dadosScript).texto}</span>
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

        {/* 4c. "Pediu pra ligar depois" — o lead atendeu mas nao deu pra
            qualificar. Cria o retorno no horario escolhido, cancela os toques
            atrasados (voce ja falou com ele) e re-ancora o resto da cadencia a
            partir do retorno. So aparece na LIGACAO depois de "Falei com ele". */}
        {isCall && !isEditing && contacted === true && (
          <div className="rounded-xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/50 dark:bg-sky-900/15 p-3">
            {!retornoAberto ? (
              <button
                type="button"
                onClick={() => setRetornoAberto(true)}
                className="w-full flex items-center justify-center gap-1.5 min-h-[44px] rounded-lg text-sm font-semibold text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/30 transition-colors"
              >
                <CalendarClock size={16} /> Pediu pra ligar depois
              </button>
            ) : (
              <div className="space-y-2.5">
                <div className="text-[13px] font-semibold text-sky-800 dark:text-sky-200">
                  Quando ligar de volta pra {activity.leadName || 'ele'}?
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {presetsRetorno.map(p => {
                    const val = paraInputLocal(p.d);
                    const ativo = retornoLocal === val;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setRetornoLocal(val)}
                        className={`px-2.5 py-1.5 rounded-lg text-[12px] font-medium border transition-colors ${
                          ativo
                            ? 'border-sky-500 bg-sky-500 text-white'
                            : 'border-sky-200 dark:border-sky-700 text-sky-700 dark:text-sky-300 hover:border-sky-400'
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
                <input
                  type="datetime-local"
                  value={retornoLocal}
                  onChange={(e) => setRetornoLocal(e.target.value)}
                  className={fieldClass}
                />
                {/* O que vai acontecer, em palavras — pra nao ser magica silenciosa. */}
                <p className="text-[12px] text-sky-700 dark:text-sky-300">
                  Cria o retorno nesse horário, cancela os toques atrasados desse lead
                  e reorganiza o resto da cadência a partir daqui.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setRetornoAberto(false); setRetornoLocal(''); }}
                    className="px-3 h-9 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!retornoLocal || isPending || agendarRetorno.isPending}
                    onClick={confirmarRetorno}
                    className="px-4 h-9 rounded-lg text-sm font-semibold bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-50 inline-flex items-center gap-1.5"
                  >
                    <Check size={15} /> {agendarRetorno.isPending ? 'Agendando…' : 'Confirmar retorno'}
                  </button>
                </div>
              </div>
            )}
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
            className={`${fieldClass} resize-none`}
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
            className={`mt-1.5 ${fieldClass} resize-none`}
          />
        </details>
      </div>
    </CrmModal>
  );
}

export default ExecuteTaskModal;

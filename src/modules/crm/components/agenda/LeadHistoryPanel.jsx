/**
 * LeadHistoryPanel - painel lateral com a timeline UNIFICADA de um lead.
 *
 * Responde "o que aconteceu e o que vem" num lugar so:
 *  - cabecalho: lead, empresa, valor, estagio atual e status
 *  - "A fazer": atividades futuras agendadas
 *  - "Histórico": atividades feitas + ligacoes + WhatsApp, AGRUPADAS POR ETAPA
 *
 * Os dados vem de useLeadTimeline (junta as 4 fontes no servico), mas o LAYOUT
 * do historico e o mesmo da pagina do Negocio: LeadHistoryTimeline. Antes cada
 * porta tinha a sua cara pra mesma pergunta — "o que ja aconteceu com esse
 * lead" — e isso confundia mais do que ajudava.
 */

import { useMemo } from 'react';
import {
  X, Phone, MessageCircle, CalendarCheck, Flag, Mail, Users, Coffee,
  MapPin, ExternalLink, Building2, CheckCircle2, Clock, ArrowRight, Trash2, Pencil,
} from 'lucide-react';
import { useLeadTimeline } from '../../hooks/useCrmQueries';
import { scheduleTiming } from '../../services/crmAgendaService';
import { CrmBadge } from '../ui';
import { LeadHistoryTimeline } from '../LeadHistoryTimeline';

const hm = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const TIMING_CLASS = {
  on_time: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20',
  late: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20',
  early: 'text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-900/20',
};

const KIND_ICON = {
  call: Phone,
  message: MessageCircle,
  stage: Flag,
  activity: CalendarCheck,
};
const ACTIVITY_ICON = {
  call: Phone, email: Mail, message: MessageCircle, meeting: Users, visit: MapPin, task: CalendarCheck, lunch: Coffee, follow_up: ArrowRight,
};

const DEAL_STATUS = {
  open: { label: 'Aberto', variant: 'info' },
  won: { label: 'Ganho', variant: 'success' },
  lost: { label: 'Perdido', variant: 'danger' },
};

const fmtMoney = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function relativeLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const dayMs = 86400000;
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startThat - startToday) / dayMs);
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  if (diffDays === 0) return `Hoje · ${time}`;
  if (diffDays === 1) return `Amanhã · ${time}`;
  if (diffDays === -1) return `Ontem · ${time}`;
  if (diffDays > 1) return `Em ${diffDays} dias · ${dateStr}`;
  if (diffDays < -1) return `Há ${Math.abs(diffDays)} dias · ${dateStr}`;
  return dateStr;
}

function TimelineRow({ item, onComplete, onDelete, onEditDelivery }) {
  const Icon = item.kind === 'activity'
    ? (ACTIVITY_ICON[item.activityType] || CalendarCheck)
    : (KIND_ICON[item.kind] || CalendarCheck);
  const isPendingActivity = item.kind === 'activity' && !item.done;
  // Atividade concluída pode ter a entrega (input/output) editada depois —
  // quem concluiu pulando os detalhes volta e preenche.
  const isDoneActivity = item.kind === 'activity' && item.done;
  return (
    <div className="group/tl flex gap-3">
      {/* trilho + bolinha */}
      <div className="flex flex-col items-center">
        <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 ring-1 ring-inset"
          style={{ backgroundColor: `${item.color}1a`, color: item.color, ['--tw-ring-color']: `${item.color}55` }}>
          <Icon size={14} />
        </span>
        <span className="flex-1 w-px bg-slate-200 dark:bg-white/10 my-1" />
      </div>
      {/* conteudo */}
      <div className="pb-4 min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium ${item.done && item.kind === 'activity' ? 'text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
            {item.done && item.kind === 'activity' && <CheckCircle2 size={13} className="inline mr-1 text-emerald-500 -mt-0.5" />}
            {item.title}
          </span>
          <span className="text-[12px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${item.color}22`, color: item.color }}>{item.typeLabel}</span>
          {isPendingActivity && (onComplete || onDelete) && (
            <span className="ml-auto flex items-center gap-1 transition-opacity">
              {onComplete && (
                <button type="button" onClick={() => onComplete(item)} title="Marcar como concluída"
                  className="p-1 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded">
                  <CheckCircle2 size={14} />
                </button>
              )}
              {onDelete && (
                <button type="button" onClick={() => onDelete(item)} title="Excluir atividade"
                  className="p-1 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded">
                  <Trash2 size={14} />
                </button>
              )}
            </span>
          )}
          {isDoneActivity && onEditDelivery && (
            <button type="button" onClick={() => onEditDelivery(item)}
              title={item.deliveryInput || item.deliveryReport ? 'Editar o que aconteceu' : 'Preencher o que aconteceu'}
              className="ml-auto p-1 text-slate-500 dark:text-slate-400 hover:text-fyness-primary hover:bg-fyness-primary/10 rounded transition-opacity">
              <Pencil size={13} />
            </button>
          )}
        </div>
        {/* Input/output da tarefa concluída — mesmo par "Você"/"Lead" do Histórico do Negócio */}
        {(item.deliveryInput || item.deliveryReport) ? (
          <div className="mt-1.5 space-y-1.5">
            {item.deliveryInput && (
              <div className="flex items-start gap-2 rounded-lg border-l-[3px] border-sky-400 dark:border-sky-500 bg-sky-50 dark:bg-sky-500/10 px-2.5 py-1.5">
                <span className="text-[12px] font-bold uppercase tracking-wide text-sky-600 dark:text-sky-400 shrink-0 mt-px">Você</span>
                <span className="text-xs text-slate-700 dark:text-slate-200 break-words">{item.deliveryInput}</span>
              </div>
            )}
            {item.deliveryReport && (
              <div className="flex items-start gap-2 rounded-lg border-l-[3px] border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1.5">
                <span className="text-[12px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 shrink-0 mt-px">Lead</span>
                <span className="text-xs text-slate-700 dark:text-slate-200 break-words">{item.deliveryReport}</span>
              </div>
            )}
          </div>
        ) : item.detail && (
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 break-words">{item.detail}</p>
        )}
        <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{relativeLabel(item.date)}</p>
        {item.kind === 'activity' && item.done && item.completedAt && (() => {
          const t = scheduleTiming(item.endDate || item.date, item.completedAt);
          if (!t) return null;
          return (
            <p className="flex items-center gap-1.5 mt-1 text-[12px] flex-wrap">
              <span className="text-slate-500 dark:text-slate-400 tabular-nums">Previsto {hm(item.endDate || item.date)} · feito {hm(item.completedAt)}</span>
              <span className={`px-1.5 py-px rounded-full font-medium ${TIMING_CLASS[t.state]}`}>{t.label}</span>
            </p>
          );
        })()}
      </div>
    </div>
  );
}

export default function LeadHistoryPanel({ selected, onClose, onOpenLead, onCompleteTask, onDeleteTask, onEditDelivery }) {
  const { data, isLoading } = useLeadTimeline(selected || {});
  const lead = data?.lead;
  const items = data?.items || [];

  const { upcoming, past } = useMemo(() => {
    // Tarefa pendente (atividade não concluída) é sempre "A fazer", mesmo que o
    // horário já tenha passado. Antes o split olhava só `future` (date > now), e
    // uma tarefa atrasada caía no Histórico — renderizado sem os botões de
    // concluir/excluir, escondendo a ação mais comum do painel.
    const isTodo = (i) => i.future || (i.kind === 'activity' && !i.done);
    const up = items.filter(isTodo).sort((a, b) => new Date(a.date) - new Date(b.date));
    const pa = items.filter(i => !isTodo(i)); // ja vem desc do servico
    return { upcoming: up, past: pa };
  }, [items]);

  // Traduz a timeline do painel pro formato do componente compartilhado.
  // As mudancas de etapa saem da LISTA e viram os CABECALHOS dos grupos — o
  // cabecalho ja e a transicao, entao mante-las na lista diria duas vezes.
  const { historico, stageHistory } = useMemo(() => {
    const stages = past
      .filter(i => i.kind === 'stage')
      .map(i => ({
        id: i.id,
        createdAt: i.date,
        // O titulo do item traz "→ Nome"; o nome limpo esta em `detail`.
        stage: { name: (i.detail || '').replace(/^→\s*/, '') || 'Etapa', color: i.color },
      }));
    const registros = past
      .filter(i => i.kind !== 'stage')
      .map(i => ({
        _type: 'activity',
        _date: i.completedAt || i.date,
        id: i.id,
        title: i.title,
        // Ligacao e WhatsApp nao tem `activityType` — o proprio kind ja diz o
        // canal, e e assim que o icone certo aparece.
        type: i.activityType || i.kind,
        description: i.detail || '',
        deliveryInput: i.deliveryInput || '',
        deliveryReport: i.deliveryReport || '',
        // So ATIVIDADE do CRM pode ter a entrega corrigida — ligacao e WhatsApp
        // sao registro do que aconteceu, nao ha entrega a preencher.
        _canEdit: i.kind === 'activity',
        activityType: i.activityType,
      }));
    return { historico: registros, stageHistory: stages };
  }, [past]);

  if (!selected) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 text-slate-500 dark:text-slate-400">
        <CalendarCheck size={32} className="mb-3 opacity-50" />
        <p className="text-sm font-medium">Selecione uma atividade</p>
        <p className="text-xs mt-1">Clique num evento do calendário para ver o histórico completo do lead — o que foi feito, conversado, em que etapa ele está e o que está agendado.</p>
      </div>
    );
  }

  const status = lead?.status ? DEAL_STATUS[lead.status] : null;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/70 dark:border-white/10">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate">{lead?.title || 'Lead'}</h3>
            {lead?.company?.name && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                <Building2 size={12} /> {lead.company.name}
              </p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 shrink-0"><X size={16} /></button>
        </div>

        <div className="flex items-center gap-2 flex-wrap mt-3">
          {lead?.stage && (
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"
              style={{ backgroundColor: `${lead.stage.color || '#6366f1'}22`, color: lead.stage.color || '#6366f1' }}>
              <Flag size={11} /> {lead.stage.name}
            </span>
          )}
          {status && <CrmBadge variant={status.variant} size="sm" dot>{status.label}</CrmBadge>}
          {lead?.value > 0 && <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{fmtMoney(lead.value)}</span>}
        </div>

        {lead?.dealId && (
          <button onClick={() => onOpenLead?.(lead)}
            className="mt-3 text-xs text-fyness-primary hover:underline inline-flex items-center gap-1">
            Abrir negócio <ExternalLink size={11} />
          </button>
        )}

      </div>

      {/* Conteúdo: notas + timeline (a fazer + histórico) — TUDO rola junto.
          As notas ficam AQUI, não no header fixo: um lead com anotação longa
          (ex.: histórico inteiro colado) empurrava a timeline pra fora da tela
          e nada rolava — parecia um "print travado". */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {lead?.notes && (
          <div className="mb-4 text-xs text-slate-600 dark:text-slate-300 bg-amber-50/70 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30 rounded-lg p-2 whitespace-pre-wrap break-words">
            {lead.notes}
          </div>
        )}
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-fyness-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="mb-5">
                <h4 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <Clock size={12} /> A fazer
                </h4>
                <div>{upcoming.map(i => <TimelineRow key={i.id} item={i} onComplete={onCompleteTask} onDelete={onDeleteTask} />)}</div>
              </section>
            )}

            {/* MESMO layout do Histórico na página do Negócio — agrupado por
                etapa. É a mesma pergunta ("o que já aconteceu com esse lead"),
                então tem que ter a mesma cara, venha de onde vier. O componente
                é compartilhado: components/LeadHistoryTimeline. */}
            <section>
              <h4 className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Histórico</h4>
              <LeadHistoryTimeline
                items={historico}
                stageHistory={stageHistory}
                compact
                onEditItem={onEditDelivery}
                empty="Nenhum registro ainda — ligações, mensagens, atividades e mudanças de etapa vão aparecer aqui."
              />
            </section>
          </>
        )}
      </div>
    </div>
  );
}

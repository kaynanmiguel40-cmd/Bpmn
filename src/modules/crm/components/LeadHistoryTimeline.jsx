/**
 * LeadHistoryTimeline — o historico de um lead, SEPARADO POR ETAPA.
 *
 * Fonte UNICA do layout do historico. Antes existiam dois: a aba Historico do
 * negocio (agrupada por etapa) e o painel lateral da Agenda (uma timeline
 * plana, com outro visual). Era o mesmo dado, a mesma pergunta — "o que ja
 * aconteceu com esse lead" — e duas respostas com cara diferente conforme a
 * porta por onde se entrava.
 *
 * As FONTES continuam duas de proposito:
 *   - a aba do negocio manda atividades + passos do playbook;
 *   - o painel da Agenda manda a timeline unificada, que tem tambem ligacoes e
 *     WhatsApp.
 * Quem chama normaliza pra `items`; este componente so agrupa e desenha.
 *
 * O agrupamento e por PERIODO de etapa, nao por vinculo: o lead entrou na etapa
 * X em tal data e ficou ate a mudanca seguinte. Assim ate a tarefa criada a mao
 * — que nao tem vinculo com etapa nenhuma — cai no periodo certo, pela data.
 */

import { ListChecks, CornerDownRight, CalendarCheck, Phone, Mail, MessageCircle, Video, CheckSquare, Coffee, MapPin, Pencil, StickyNote } from 'lucide-react';
import { CrmBadge } from './ui';
import { scheduleTiming } from '../services/crmAgendaService';

// Previsto x realizado: verde no horario, ambar atrasou, azul adiantou.
const TIMING_CLASS = {
  on_time: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20',
  late: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20',
  early: 'text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-900/20',
};
const hhmm = (d) => (d ? new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '');

const ACTIVITY_ICONS = {
  call: Phone, email: Mail, message: MessageCircle, meeting: Video,
  task: CheckSquare, follow_up: Coffee, visit: MapPin,
};
const ACTIVITY_LABELS = {
  call: 'Ligação', email: 'E-mail', message: 'Mensagem', meeting: 'Reunião',
  task: 'Tarefa', follow_up: 'Follow-up', visit: 'Visita',
};

const formatDate = (d) => (d ? new Date(d).toLocaleDateString('pt-BR') : '—');
const formatDateTime = (d) => (d
  ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  : '—');

/**
 * Divide os itens nos periodos de etapa.
 * @param {Array} items  [{ _type, _date, ... }] em ordem decrescente
 * @param {Array} stageHistory  [{ id, createdAt, stage:{name,color} }]
 */
export function groupByStagePeriod(items, stageHistory = []) {
  const asc = [...(stageHistory || [])].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const periods = asc.map((e, i) => ({
    key: e.id,
    name: e.stage?.name || 'Etapa',
    color: e.stage?.color || '#94a3b8',
    from: new Date(e.createdAt),
    to: i + 1 < asc.length ? new Date(asc[i + 1].createdAt) : null, // null = ate hoje
  }));

  const periodOf = (date) => {
    const d = new Date(date);
    for (let i = periods.length - 1; i >= 0; i--) {
      const p = periods[i];
      if (d >= p.from && (!p.to || d < p.to)) return p;
    }
    return null; // antes da 1a mudanca registrada
  };

  const groups = [];
  for (const item of items) {
    const p = periodOf(item._date);
    const key = p ? p.key : '__inicio__';
    const last = groups[groups.length - 1];
    if (last && last.key === key) last.items.push(item);
    else groups.push({
      key,
      name: p ? p.name : 'Antes da primeira mudança de etapa',
      color: p ? p.color : '#94a3b8',
      since: p ? p.from : null,
      items: [item],
    });
  }
  return groups;
}

function StepItem({ item, compact }) {
  return (
    <div className="flex items-start gap-3 py-2.5 relative">
      <div className="w-[26px] h-[26px] rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0 z-10 ring-2 ring-white dark:ring-slate-950 -ml-[19px]">
        <ListChecks size={12} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <div className={`flex-1 min-w-0 rounded-2xl ${compact ? 'px-3 py-2' : 'crm-glass px-4 py-3'}`}>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{item.title}</span>
          <CrmBadge variant="info" size="sm">Processo</CrmBadge>
        </div>
        {item.outcome && (
          <div className="mt-1.5 flex gap-1.5 text-[13px] text-slate-600 dark:text-slate-300">
            <CornerDownRight size={13} className="shrink-0 mt-0.5 text-indigo-500" />
            <span><span className="text-slate-500 dark:text-slate-400">Lead:</span> {item.outcome}</span>
          </div>
        )}
        <span className="text-[12px] text-slate-500 dark:text-slate-400">{formatDateTime(item._date)}</span>
      </div>
    </div>
  );
}

/**
 * Trecho da anotacao livre do lead (crm_deals.notes).
 *
 * Antes do sistema ter historico de verdade, o campo de notas virou o diario do
 * lead — 290 dos 299 negocios tem nota. E historico escrito no lugar errado,
 * entao e no historico que ele se le.
 *
 * Quando o trecho traz DATA no proprio texto (parseNoteEntries acha), ele cai
 * no dia certo — e, com isso, dentro da etapa em que o lead estava naquele dia.
 * O texto sem data (cabecalho "Dados Fulano", fecho) vira um item unico no
 * grupo mais antigo: e o que veio ANTES de tudo que o sistema registrou.
 */
function NoteItem({ item, compact }) {
  return (
    <div className="flex items-start gap-3 py-2.5 relative">
      <div className="w-[26px] h-[26px] rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 z-10 ring-2 ring-white dark:ring-slate-950 -ml-[19px]">
        <StickyNote size={12} className="text-amber-600 dark:text-amber-400" />
      </div>
      <div className={`flex-1 min-w-0 rounded-2xl ${compact ? 'px-3 py-2' : 'crm-glass px-4 py-3'}`}>
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 min-w-0">
            {item.title || 'Anotações do lead'}
          </span>
          <CrmBadge variant="warning" size="sm">Nota</CrmBadge>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words">{item.text}</p>
        {/* A procedencia fica explicita: e texto que alguem digitou no campo de
            notas, nao um registro que o sistema criou. Sem isso, um trecho
            datado se confunde com atividade de verdade. */}
        <p className="text-[12px] text-slate-400 mt-1.5">
          {item._date
            ? `${formatDate(item._date)} · escrito no campo de notas`
            : 'Sem data no texto — anotado antes do histórico existir.'}
        </p>
      </div>
    </div>
  );
}

function ActivityItem({ item, compact, onEdit }) {
  const Icon = ACTIVITY_ICONS[item.type] || CalendarCheck;
  const label = ACTIVITY_LABELS[item.type] || item.type;
  return (
    <div className="flex items-start gap-3 py-2.5 relative">
      <div className="w-[26px] h-[26px] rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 z-10 ring-2 ring-white dark:ring-slate-950 -ml-[19px]">
        <Icon size={12} className="text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className={`flex-1 min-w-0 rounded-2xl ${compact ? 'px-3 py-2' : 'crm-glass px-4 py-3'}`}>
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 min-w-0 truncate">{item.title}</span>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium">Concluída</span>
            {!compact && <CrmBadge variant="neutral" size="sm">{label}</CrmBadge>}
            {/* Corrigir depois: quem concluiu pulando os detalhes volta e
                preenche. Opcional — a pagina do Negocio nao oferece. */}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(item)}
                title={item.deliveryInput || item.deliveryReport ? 'Editar o que aconteceu' : 'Preencher o que aconteceu'}
                className="p-1 text-slate-500 dark:text-slate-400 hover:text-fyness-primary hover:bg-fyness-primary/10 rounded"
              >
                <Pencil size={13} />
              </button>
            )}
          </div>
        </div>
        {/* O par você/lead e o coracao do registro: o que foi feito e o que
            veio de volta. Sem ele o historico so diria "feito". */}
        {(item.deliveryInput || item.deliveryReport) ? (
          <div className="mt-2 space-y-1.5">
            {item.deliveryInput && (
              <div className="flex items-start gap-2 rounded-lg border-l-[3px] border-sky-400 dark:border-sky-500 bg-sky-50 dark:bg-sky-500/10 px-2.5 py-1.5">
                <span className="text-[12px] font-bold uppercase tracking-wide text-sky-600 dark:text-sky-400 shrink-0 mt-px">Você</span>
                <span className="text-xs text-slate-700 dark:text-slate-200">{item.deliveryInput}</span>
              </div>
            )}
            {item.deliveryReport && (
              <div className="flex items-start gap-2 rounded-lg border-l-[3px] border-amber-400 dark:border-amber-500 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1.5">
                <span className="text-[12px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 shrink-0 mt-px">Lead</span>
                <span className="text-xs text-slate-700 dark:text-slate-200">{item.deliveryReport}</span>
              </div>
            )}
          </div>
        ) : item.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{item.description}</p>
        )}
        <div className="flex items-center gap-3 mt-2 text-[12px] text-slate-400 flex-wrap">
          <span>{formatDateTime(item._date)}</span>
          {item.contactName && <><span>·</span><span className="truncate">{item.contactName}</span></>}
        </div>

        {/* PREVISTO x REALIZADO. Só aparece quando há os dois horários e a
            diferença passa de 5 minutos — abaixo disso é ruído, não desvio.
            É o que mostra se a cadência está sendo cumprida no horário ou se
            o dia inteiro anda arrastado. */}
        {(() => {
          const t = scheduleTiming(item.plannedAt, item.completedAt);
          if (!t) return null;
          return (
            <div className="flex items-center gap-1.5 mt-1 text-[12px] flex-wrap">
              <span className="text-slate-500 dark:text-slate-400 tnum">
                Previsto {hhmm(item.plannedAt)} · feito {hhmm(item.completedAt)}
              </span>
              <span className={`px-1.5 py-0.5 rounded font-semibold ${TIMING_CLASS[t.state]}`}>
                {t.label}
              </span>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export function LeadHistoryTimeline({ items = [], stageHistory = [], compact = false, empty, onEditItem }) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-slate-500 dark:text-slate-400">
        {empty || 'Nada feito ainda com esse lead.'}
      </div>
    );
  }

  const groups = groupByStagePeriod(items, stageHistory);

  return (
    <div className="space-y-6">
      {groups.map((g, gi) => (
        <div key={`${g.key}-${gi}`}>
          {/* O cabecalho da etapa JA E a transicao — por isso nao existe mais um
              item solto de "mudou de etapa" na lista: seria dizer duas vezes. */}
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
            <span className="text-[12px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 truncate">
              {g.name}
            </span>
            {g.since && (
              <span className="text-[12px] text-slate-500 dark:text-slate-400 shrink-0">
                · entrou em {formatDate(g.since)}
              </span>
            )}
            <span className="ml-auto text-[12px] text-slate-500 dark:text-slate-400 tnum shrink-0">
              {g.items.length} {g.items.length === 1 ? 'registro' : 'registros'}
            </span>
          </div>

          <div className="relative pl-6">
            <div className="absolute left-[11px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700/50" />
            <div className="space-y-1">
              {g.items.map((item, idx) => {
                if (item._type === 'note') return <NoteItem key={`note-${idx}`} item={item} compact={compact} />;
                if (item._type === 'step') return <StepItem key={`step-${item.id || idx}`} item={item} compact={compact} />;
                return <ActivityItem key={`act-${item.id || idx}`} item={item} compact={compact} onEdit={item._canEdit ? onEditItem : undefined} />;
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default LeadHistoryTimeline;

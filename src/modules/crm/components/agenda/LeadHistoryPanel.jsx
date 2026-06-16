/**
 * LeadHistoryPanel - painel lateral com a timeline UNIFICADA de um lead.
 *
 * Responde "o que aconteceu e o que vem" num lugar so:
 *  - cabecalho: lead, empresa, valor, estagio atual e status
 *  - "A fazer": atividades futuras agendadas
 *  - "Histórico": atividades feitas + ligacoes + WhatsApp + mudancas de estagio
 *
 * Os dados vem de useLeadTimeline (junta as 4 fontes no servico).
 */

import { useMemo, useState, useEffect } from 'react';
import {
  X, Phone, MessageCircle, CalendarCheck, Flag, Mail, Users, Coffee,
  MapPin, ExternalLink, Building2, CheckCircle2, Clock, ArrowRight, PenLine,
} from 'lucide-react';
import { useLeadTimeline, useLeadDailyReport, useSaveLeadReport } from '../../hooks/useCrmQueries';
import { scheduleTiming } from '../../services/crmAgendaService';
import { CrmBadge } from '../ui';

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

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

function TimelineRow({ item }) {
  const Icon = item.kind === 'activity'
    ? (ACTIVITY_ICON[item.activityType] || CalendarCheck)
    : (KIND_ICON[item.kind] || CalendarCheck);
  return (
    <div className="flex gap-3">
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
          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${item.color}22`, color: item.color }}>{item.typeLabel}</span>
        </div>
        {item.detail && <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 break-words">{item.detail}</p>}
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{relativeLabel(item.date)}</p>
        {item.kind === 'activity' && item.done && item.completedAt && (() => {
          const t = scheduleTiming(item.date, item.completedAt);
          if (!t) return null;
          return (
            <p className="flex items-center gap-1.5 mt-1 text-[11px] flex-wrap">
              <span className="text-slate-400 dark:text-slate-500 tabular-nums">Previsto {hm(item.date)} · feito {hm(item.completedAt)}</span>
              <span className={`px-1.5 py-px rounded-full font-medium ${TIMING_CLASS[t.state]}`}>{t.label}</span>
            </p>
          );
        })()}
      </div>
    </div>
  );
}

// Campo onde o vendedor escreve o relato do lead no dia de hoje. Salva ao
// sair do campo (blur) ou no botão; alimenta a página de Relatório Diário.
function LeadReportField({ dealId, contactId }) {
  const date = todayKey();
  const { data: report } = useLeadDailyReport({ dealId, contactId, date });
  const saveMut = useSaveLeadReport();
  const [text, setText] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setText(report?.content || ''); setDirty(false); }, [report?.content, dealId, contactId]);

  const save = () => {
    if (!dirty) return;
    saveMut.mutate({ dealId, contactId, content: text, date }, { onSuccess: () => setDirty(false) });
  };

  return (
    <div className="mb-5 rounded-xl border border-slate-200/70 dark:border-white/10 bg-slate-50/60 dark:bg-slate-800/30 p-3">
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <PenLine size={12} /> Relato de hoje
        </h4>
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          {saveMut.isPending ? 'salvando…' : dirty ? 'não salvo' : (text ? 'salvo' : '')}
        </span>
      </div>
      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setDirty(true); }}
        onBlur={save}
        rows={3}
        placeholder="O que rolou com esse lead hoje? (vai pro relatório do dia)"
        className="w-full text-sm rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder-slate-400 p-2 resize-y focus:outline-none focus:ring-2 focus:ring-fyness-primary/40"
      />
      {dirty && (
        <div className="flex justify-end mt-1.5">
          <button onClick={save} disabled={saveMut.isPending}
            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-fyness-primary hover:bg-fyness-secondary text-white disabled:opacity-50">
            Salvar relato
          </button>
        </div>
      )}
    </div>
  );
}

export default function LeadHistoryPanel({ selected, onClose, onOpenLead }) {
  const { data, isLoading } = useLeadTimeline(selected || {});
  const lead = data?.lead;
  const items = data?.items || [];

  const { upcoming, past } = useMemo(() => {
    const up = items.filter(i => i.future).sort((a, b) => new Date(a.date) - new Date(b.date));
    const pa = items.filter(i => !i.future); // ja vem desc do servico
    return { upcoming: up, past: pa };
  }, [items]);

  if (!selected) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6 text-slate-400 dark:text-slate-500">
        <CalendarCheck size={32} className="mb-3 opacity-50" />
        <p className="text-sm font-medium">Selecione uma atividade</p>
        <p className="text-xs mt-1">Clique num evento do calendário para ver o histórico completo do lead — o que foi feito, conversado, o estágio atual e o que está agendado.</p>
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
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"
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

        {lead?.notes && (
          <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 bg-amber-50/70 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/30 rounded-lg p-2 whitespace-pre-wrap break-words">
            {lead.notes}
          </div>
        )}
      </div>

      {/* Conteúdo: relato de hoje + timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        <LeadReportField dealId={selected.dealId} contactId={selected.contactId} />
        {isLoading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-fyness-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <section className="mb-5">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                  <Clock size={12} /> A fazer
                </h4>
                <div>{upcoming.map(i => <TimelineRow key={i.id} item={i} />)}</div>
              </section>
            )}

            <section>
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Histórico</h4>
              {past.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-4">Nenhum registro ainda — ligações, mensagens, atividades e mudanças de estágio vão aparecer aqui.</p>
              ) : (
                <div>{past.map(i => <TimelineRow key={i.id} item={i} />)}</div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

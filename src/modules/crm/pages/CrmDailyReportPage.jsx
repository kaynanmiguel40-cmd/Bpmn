/**
 * CrmDailyReportPage - Relatório Diário consolidado.
 *
 * Junta, num documento só, os leads que o vendedor atendeu no dia com TUDO que
 * aconteceu com cada um (ligações com desfecho, mensagens, e-mails, atividades —
 * com hora) + o relato escrito no painel da Agenda. Navega por qualquer data
 * (os relatos ficam guardados no banco, então nada se perde). Clicar no lead
 * abre a jornada completa dele.
 */

import { useState, useMemo } from 'react';
import {
  Phone, MessageCircle, CalendarCheck, Flag, Copy, FileText, CalendarRange,
  ChevronLeft, ChevronRight, Mail, Users, MapPin, Coffee, ArrowRight, CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CrmPageHeader } from '../components/ui';
import LeadJourneyDrawer from '../components/LeadJourneyDrawer';
import { useDailyReport } from '../hooks/useCrmQueries';
import { CALL_OUTCOMES } from '../services/crmCallsService';
import { activityMeta } from '../services/crmAgendaService';
import { toast } from '../../../contexts/ToastContext';

const todayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const shiftKey = (key, days) => {
  const [y, m, d] = key.split('-').map(Number);
  const dt = new Date(y, m - 1, d + days);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};
const longDate = (key) => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
};
const relativeDay = (key) => {
  if (key === todayKey()) return 'Hoje';
  if (key === shiftKey(todayKey(), -1)) return 'Ontem';
  if (key === shiftKey(todayKey(), 1)) return 'Amanhã';
  return null;
};
const hm = (iso) => (iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '');

const TYPE_ICON = { call: Phone, email: Mail, message: MessageCircle, meeting: Users, visit: MapPin, task: CheckCircle2, lunch: Coffee, follow_up: ArrowRight };

// Como cada evento do dia (ligação / mensagem / atividade) aparece na timeline.
function eventVisual(ev) {
  if (ev.kind === 'call') {
    const oc = CALL_OUTCOMES[ev.outcome]?.label;
    return { Icon: Phone, color: '#f59e0b', label: oc ? `Ligação · ${oc}` : 'Ligação' };
  }
  if (ev.kind === 'message') {
    return { Icon: MessageCircle, color: '#22c55e', label: ev.direction === 'inbound' ? 'Mensagem recebida' : 'Mensagem enviada' };
  }
  const meta = activityMeta(ev.activityType);
  const Icon = TYPE_ICON[ev.activityType] || CheckCircle2;
  return { Icon, color: meta.color, label: ev.title ? `${meta.label}: ${ev.title}` : meta.label };
}

function StatPill({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-white/10">
      <Icon size={16} className="text-slate-400" />
      <span className="text-lg font-semibold text-slate-800 dark:text-slate-100 tabular-nums">{value}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

function DayEventRow({ ev }) {
  const { Icon, color, label } = eventVisual(ev);
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="w-11 shrink-0 text-[11px] text-slate-400 dark:text-slate-500 tabular-nums pt-1">{hm(ev.time)}</span>
      <span className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${color}1a`, color }}>
        <Icon size={12} />
      </span>
      <div className="min-w-0 flex-1">
        <span className="text-slate-700 dark:text-slate-200">{label}</span>
        {ev.detail && <span className="text-slate-500 dark:text-slate-400 break-words"> — {ev.detail}</span>}
      </div>
    </div>
  );
}

function buildPlainText(date, summary, leads) {
  const lines = [];
  lines.push(`RELATÓRIO DO DIA — ${longDate(date)}`);
  lines.push(`${summary.leads} leads atendidos · ${summary.calls} ligações · ${summary.messages} mensagens · ${summary.activities} atividades`);
  lines.push('');
  leads.forEach(l => {
    lines.push(`• ${l.name}${l.stage ? ` (${l.stage})` : ''}`);
    (l.events || []).forEach(ev => {
      const { label } = eventVisual(ev);
      lines.push(`  ${hm(ev.time)} ${label}${ev.detail ? ` — ${ev.detail}` : ''}`);
    });
    lines.push(`  Relato: ${l.report ? l.report : '—'}`);
    lines.push('');
  });
  return lines.join('\n');
}

export default function CrmDailyReportPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(todayKey());
  const [selectedLead, setSelectedLead] = useState(null); // { dealId, contactId }
  const { data, isLoading } = useDailyReport(date);

  const summary = data?.summary || { leads: 0, withReport: 0, calls: 0, messages: 0, activities: 0 };
  const leads = data?.leads || [];
  const rel = relativeDay(date);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainText(date, summary, leads));
      toast('Relatório copiado', 'success');
    } catch {
      toast('Não consegui copiar', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <CrmPageHeader
        title="Relatório Diário"
        subtitle={`${rel ? rel + ' · ' : ''}${longDate(date)}`}
        actions={
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/crm/relatorio-semanal')}
              title="Ver relatório da semana"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200/70 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
              <CalendarRange size={15} /> Semanal
            </button>
            {/* Navegação livre por data — qualquer dia passado fica acessível */}
            <div className="flex items-center gap-1">
              <button onClick={() => setDate(d => shiftKey(d, -1))} title="Dia anterior"
                className="p-2 rounded-lg border border-slate-200/70 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"><ChevronLeft size={16} /></button>
              <input type="date" value={date} max={todayKey()} onChange={(e) => e.target.value && setDate(e.target.value)}
                className="px-2 py-1.5 text-sm rounded-lg border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200" />
              <button onClick={() => setDate(d => shiftKey(d, 1))} disabled={date >= todayKey()} title="Próximo dia"
                className="p-2 rounded-lg border border-slate-200/70 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-40"><ChevronRight size={16} /></button>
              <button onClick={() => setDate(todayKey())} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200/70 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5">Hoje</button>
            </div>
            <button onClick={copy} disabled={leads.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg shadow-sm disabled:opacity-50">
              <Copy size={15} /> Copiar
            </button>
          </div>
        }
      />

      {/* Resumo */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <StatPill icon={FileText} value={summary.leads} label="leads atendidos" />
        <StatPill icon={Phone} value={summary.calls} label="ligações" />
        <StatPill icon={MessageCircle} value={summary.messages} label="mensagens" />
        <StatPill icon={CalendarCheck} value={summary.activities} label="atividades" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-fyness-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <FileText size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">Nenhum lead atendido {rel === 'Hoje' ? 'hoje' : 'neste dia'}.</p>
          <p className="text-xs mt-1">Registre ligações, mensagens ou atividades — e escreva o relato de cada lead no painel da Agenda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(l => (
            <div key={l.leadKey}
              onClick={() => setSelectedLead({ dealId: l.dealId, contactId: l.contactId })}
              className="crm-glass rounded-2xl p-4 cursor-pointer transition-colors hover:ring-1 hover:ring-fyness-primary/30"
              title="Abrir jornada completa do lead">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{l.name}</h3>
                {l.stage && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                    style={{ backgroundColor: `${l.stageColor || '#6366f1'}22`, color: l.stageColor || '#6366f1' }}>
                    <Flag size={10} /> {l.stage}
                  </span>
                )}
                <div className="ml-auto flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  {l.counts.calls > 0 && <span className="inline-flex items-center gap-1"><Phone size={12} className="text-amber-500" />{l.counts.calls}</span>}
                  {l.counts.messages > 0 && <span className="inline-flex items-center gap-1"><MessageCircle size={12} className="text-emerald-500" />{l.counts.messages}</span>}
                  {l.counts.activities > 0 && <span className="inline-flex items-center gap-1"><CalendarCheck size={12} className="text-blue-500" />{l.counts.activities}</span>}
                </div>
              </div>

              {/* Timeline do dia: tudo que aconteceu com o lead */}
              {l.events && l.events.length > 0 && (
                <div className="space-y-1.5 mb-2 pl-0.5">
                  {l.events.map(ev => <DayEventRow key={ev.id} ev={ev} />)}
                </div>
              )}

              {l.report ? (
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words border-l-2 border-fyness-primary/30 pl-3 mt-2">{l.report}</p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-2">Sem relato escrito — abra o lead na Agenda pra registrar.</p>
              )}
            </div>
          ))}
        </div>
      )}

      <LeadJourneyDrawer
        selected={selectedLead}
        onClose={() => setSelectedLead(null)}
        onOpenLead={(lead) => lead.dealId && navigate(`/crm/deals/${lead.dealId}`)}
      />
    </div>
  );
}

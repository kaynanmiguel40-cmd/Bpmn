/**
 * ReportBlocks - peças de renderização dos relatórios (diário / semanal / mensal).
 *
 * Usadas pelo Arquivo de Relatórios pra exibir o conteúdo consolidado de
 * qualquer pessoa/período de forma read-only. Os dados vêm dos serviços
 * getDailyReport / getWeeklyReport / getMonthlyReport.
 */

import {
  Phone, MessageCircle, Mail, Users, MapPin, Coffee, ArrowRight, CheckCircle2,
  Flag, CalendarCheck, Trophy, Percent, DollarSign, FileText, XCircle, Circle,
} from 'lucide-react';
import { CALL_OUTCOMES } from '../../services/crmCallsService';
import { activityMeta } from '../../services/crmAgendaService';
import SalesFunnel from '../../../../components/dashboard/SalesFunnel';

export const hm = (iso) => (iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '');
export const money = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const dayShort = (key) => { const [y, m, d] = String(key).split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }); };

const TYPE_ICON = { call: Phone, email: Mail, message: MessageCircle, meeting: Users, visit: MapPin, task: CheckCircle2, lunch: Coffee, follow_up: ArrowRight };

export function eventVisual(ev) {
  if (ev.kind === 'call') {
    const oc = CALL_OUTCOMES[ev.outcome]?.label;
    return { Icon: Phone, color: '#f59e0b', label: oc ? `Ligação · ${oc}` : 'Ligação' };
  }
  if (ev.kind === 'message') {
    return { Icon: MessageCircle, color: '#22c55e', label: ev.direction === 'inbound' ? 'Mensagem recebida' : 'Mensagem enviada' };
  }
  if (ev.kind === 'deal') {
    return ev.status === 'won'
      ? { Icon: Trophy, color: '#10b981', label: `Negócio ganho${ev.value ? ' · ' + money(ev.value) : ''}` }
      : { Icon: XCircle, color: '#f43f5e', label: 'Negócio perdido' };
  }
  if (ev.kind === 'meeting') {
    return { Icon: CalendarCheck, color: '#3b82f6', label: 'Reunião marcada' };
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

function StatCard({ icon: Icon, value, label, accent }) {
  return (
    <div className="flex-1 min-w-[150px] flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-white/10">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}1a` }}>
        <Icon size={18} style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <div className="text-xl font-semibold text-slate-800 dark:text-slate-100 tabular-nums leading-none">{value}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">{label}</div>
      </div>
    </div>
  );
}

function LeadHeader({ lead }) {
  return (
    <div className="flex items-center gap-2 flex-wrap mb-2">
      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{lead.name}</h3>
      {lead.stage && (
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"
          style={{ backgroundColor: `${lead.stageColor || '#6366f1'}22`, color: lead.stageColor || '#6366f1' }}>
          <Flag size={10} /> {lead.stage}
        </span>
      )}
      <div className="ml-auto flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        {lead.counts.calls > 0 && <span className="inline-flex items-center gap-1"><Phone size={12} className="text-amber-500" />{lead.counts.calls}</span>}
        {lead.counts.messages > 0 && <span className="inline-flex items-center gap-1"><MessageCircle size={12} className="text-emerald-500" />{lead.counts.messages}</span>}
        {lead.counts.activities > 0 && <span className="inline-flex items-center gap-1"><CalendarCheck size={12} className="text-blue-500" />{lead.counts.activities}</span>}
      </div>
    </div>
  );
}

function LeadCard({ lead, onOpen, children }) {
  return (
    <div onClick={onOpen} title="Abrir jornada completa do lead"
      className="crm-glass rounded-2xl p-4 cursor-pointer transition-colors hover:ring-1 hover:ring-fyness-primary/30">
      <LeadHeader lead={lead} />
      {children}
    </div>
  );
}

// ---------- Corpo do relatório DIÁRIO ----------
export function DailyReportBody({ data, onOpenLead }) {
  const summary = data?.summary || { leads: 0, calls: 0, messages: 0, activities: 0 };
  const leads = data?.leads || [];
  return (
    <>
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <StatPill icon={FileText} value={summary.leads} label="leads atendidos" />
        <StatPill icon={Phone} value={summary.calls} label="ligações" />
        <StatPill icon={MessageCircle} value={summary.messages} label="mensagens" />
        <StatPill icon={CalendarCheck} value={summary.activities} label="atividades" />
        {summary.meetings > 0 && <StatPill icon={Users} value={summary.meetings} label="reuniões marcadas" />}
        {summary.sales > 0 && <StatPill icon={Trophy} value={summary.sales} label={summary.sales === 1 ? 'venda' : 'vendas'} />}
      </div>
      {leads.length === 0 ? (
        <EmptyReports />
      ) : (
        <div className="space-y-3">
          {leads.map(l => (
            <LeadCard key={l.leadKey} lead={l} onOpen={() => onOpenLead?.(l)}>
              {l.events && l.events.length > 0 && (
                <div className="space-y-1.5 mb-2 pl-0.5">
                  {l.events.map(ev => {
                    const { Icon, color, label } = eventVisual(ev);
                    return (
                      <div key={ev.id} className="flex items-start gap-2 text-sm">
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
                  })}
                </div>
              )}
              {l.report ? (
                <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words border-l-2 border-fyness-primary/30 pl-3 mt-2">{l.report}</p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-2">Sem relato escrito neste dia.</p>
              )}
            </LeadCard>
          ))}
        </div>
      )}
    </>
  );
}

// ---------- Corpo do relatório de PERÍODO (semanal / mensal) ----------
export function PeriodReportBody({ data, onOpenLead, funnelRange, ownerId }) {
  const metrics = data?.metrics || { meetings: 0, sales: 0, revenue: 0, conversionRate: 0, closedDeals: 0, leads: 0, calls: 0, messages: 0, activities: 0 };
  const leads = data?.leads || [];
  return (
    <>
      <div className="flex items-stretch gap-2 flex-wrap mb-3">
        <StatCard icon={CalendarCheck} value={metrics.meetings} label="reuniões marcadas" accent="#3b82f6" />
        <StatCard icon={Trophy} value={metrics.sales} label="vendas feitas" accent="#f59e0b" />
        <StatCard icon={DollarSign} value={money(metrics.revenue)} label="receita" accent="#10b981" />
        <StatCard icon={Percent} value={`${metrics.conversionRate}%`} label={`conversão · ${metrics.closedDeals} fechados`} accent="#8b5cf6" />
      </div>
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <StatPill icon={FileText} value={metrics.leads} label="leads atendidos" />
        <StatPill icon={Phone} value={metrics.calls} label="ligações" />
        <StatPill icon={MessageCircle} value={metrics.messages} label="mensagens" />
        <StatPill icon={CalendarCheck} value={metrics.activities} label="atividades" />
      </div>
      {funnelRange && (
        <div className="mb-6">
          <SalesFunnel range={funnelRange} scope="sales" ownerId={ownerId} />
        </div>
      )}
      <TasksSection tasks={data?.tasks} />
      {leads.length === 0 ? (
        <EmptyReports />
      ) : (
        <div className="space-y-3">
          {leads.map(l => (
            <LeadCard key={l.leadKey} lead={l} onOpen={() => onOpenLead?.(l)}>
              {l.reports && l.reports.length > 0 ? (
                <div className="space-y-2 mt-1">
                  {l.reports.map((r, i) => (
                    <div key={i} className="pl-3 border-l-2 border-slate-200 dark:border-white/10">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 capitalize">{dayShort(r.date)}</div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words">{r.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">Sem relato escrito.</p>
              )}
            </LeadCard>
          ))}
        </div>
      )}
    </>
  );
}

function EmptyReports() {
  return (
    <div className="text-center py-16 text-slate-400 dark:text-slate-500">
      <FileText size={32} className="mx-auto mb-3 opacity-50" />
      <p className="text-sm font-medium">Sem registros neste período.</p>
    </div>
  );
}

// Tarefas do período: contadores (em aberto / concluídas) + lista das em aberto.
// A "entrega" das concluídas é o relato do lead, que já aparece nos cards abaixo.
function TasksSection({ tasks }) {
  if (!tasks) return null;
  const open = tasks.open || [];
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <StatPill icon={Circle} value={tasks.openCount || 0} label="tarefas em aberto" />
        <StatPill icon={CheckCircle2} value={tasks.doneCount || 0} label="concluídas" />
      </div>
      {open.length > 0 && (
        <div className="crm-glass rounded-2xl p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Tarefas em aberto</p>
          <div className="space-y-1.5">
            {open.map(t => {
              const meta = activityMeta(t.type);
              const Icon = TYPE_ICON[t.type] || Circle;
              return (
                <div key={t.id} className="flex items-center gap-2 text-sm">
                  <Circle size={13} className="text-slate-300 dark:text-slate-600 shrink-0" />
                  <Icon size={12} className="shrink-0" style={{ color: meta.color }} />
                  <span className="text-slate-700 dark:text-slate-200 truncate">{t.title}</span>
                  {t.leadName && <span className="text-slate-400 dark:text-slate-500 truncate">· {t.leadName}</span>}
                  {t.dueAt && <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500 shrink-0 tabular-nums">{new Date(t.dueAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} {hm(t.dueAt)}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

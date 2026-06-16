/**
 * CrmWeeklyReportPage - Relatório Semanal consolidado.
 *
 * Junta os relatos diários da semana (por lead, dia a dia) num documento só e
 * coroa com as métricas da semana: reuniões marcadas, vendas feitas, receita e
 * taxa de conversão. É o "fechamento da semana" — dá pra ler e copiar pro gestor.
 * Tudo do vendedor logado, igual ao Relatório Diário.
 */

import { useState, useMemo } from 'react';
import { CalendarCheck, Trophy, Percent, DollarSign, Phone, MessageCircle, Flag, Copy, FileText, CalendarDays, Sparkles, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CrmPageHeader } from '../components/ui';
import WeeklyFunnel from '../components/WeeklyFunnel';
import LeadJourneyDrawer from '../components/LeadJourneyDrawer';
import { useWeeklyReport } from '../hooks/useCrmQueries';
import { seedWeeklyExample, clearWeeklyExample, hasWeeklyExample } from '../services/crmDemoWeekService';
import { toast } from '../../../contexts/ToastContext';

const keyOf = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const parseKey = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };

// Segunda-feira (ISO) da semana atual deslocada em N semanas, como 'YYYY-MM-DD'.
const mondayKey = (offsetWeeks = 0) => {
  const d = new Date();
  const day = d.getDay(); // 0=Dom .. 6=Sáb
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day) + offsetWeeks * 7);
  return keyOf(d);
};
// Segunda-feira da semana que contém 'key' (snap de qualquer data pro início da semana).
const mondayOf = (key) => {
  const d = parseKey(key);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return keyOf(d);
};
const shiftWeek = (key, weeks) => { const d = parseKey(key); d.setDate(d.getDate() + weeks * 7); return keyOf(d); };

const money = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

// "16 – 22 de junho de 2026" (mesmo mês) ou "30 jun – 6 jul de 2026" (vira mês).
function weekRangeLabel(weekStart, weekEnd) {
  if (!weekStart || !weekEnd) return '';
  const s = parseKey(weekStart), e = parseKey(weekEnd);
  if (s.getMonth() === e.getMonth()) {
    return `${s.getDate()} – ${e.getDate()} de ${e.toLocaleDateString('pt-BR', { month: 'long' })} de ${e.getFullYear()}`;
  }
  const f = (d) => `${d.getDate()} ${d.toLocaleDateString('pt-BR', { month: 'short' })}`;
  return `${f(s)} – ${f(e)} de ${e.getFullYear()}`;
}

const dayShort = (key) => parseKey(key).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });

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

function StatPill({ icon: Icon, value, label }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-800/50 border border-slate-200/70 dark:border-white/10">
      <Icon size={16} className="text-slate-400" />
      <span className="text-base font-semibold text-slate-800 dark:text-slate-100 tabular-nums">{value}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

function buildPlainText(label, metrics, leads) {
  const lines = [];
  lines.push(`RELATÓRIO SEMANAL — ${label}`);
  lines.push(`Reuniões marcadas: ${metrics.meetings} · Vendas: ${metrics.sales} (${money(metrics.revenue)}) · Conversão: ${metrics.conversionRate}% (${metrics.closedDeals} fechados)`);
  lines.push(`${metrics.leads} leads atendidos · ${metrics.calls} ligações · ${metrics.messages} mensagens · ${metrics.activities} atividades`);
  lines.push('');
  leads.forEach(l => {
    lines.push(`• ${l.name}${l.stage ? ` (${l.stage})` : ''}`);
    const parts = [];
    if (l.counts.calls) parts.push(`${l.counts.calls} ligação(ões)`);
    if (l.counts.messages) parts.push(`${l.counts.messages} mensagem(ns)`);
    if (l.counts.activities) parts.push(`${l.counts.activities} atividade(s)`);
    if (parts.length) lines.push(`  ${parts.join(' · ')}`);
    if (l.reports.length) {
      l.reports.forEach(r => lines.push(`  ${dayShort(r.date)}: ${r.content}`));
    } else {
      lines.push('  Sem relato escrito.');
    }
    lines.push('');
  });
  return lines.join('\n');
}

export default function CrmWeeklyReportPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [weekStart, setWeekStart] = useState(() => mondayKey(0));
  const [selectedLead, setSelectedLead] = useState(null); // { dealId, contactId }
  const [hasExample, setHasExample] = useState(hasWeeklyExample());
  const [seeding, setSeeding] = useState(false);
  const { data, isLoading } = useWeeklyReport(weekStart);
  const isCurrentWeek = weekStart === mondayKey(0);

  const runSeed = async () => {
    setSeeding(true);
    const res = await seedWeeklyExample();
    setSeeding(false);
    if (res.ok) { setHasExample(true); setWeekStart(mondayKey(0)); qc.invalidateQueries({ queryKey: ['crm'] }); }
  };
  const runClear = async () => {
    setSeeding(true);
    const res = await clearWeeklyExample();
    setSeeding(false);
    if (res.ok) { setHasExample(false); qc.invalidateQueries({ queryKey: ['crm'] }); }
  };

  // Intervalo da semana (seg 00:00 → dom 23:59:59) pro funil de conversão.
  const funnelRange = useMemo(() => {
    const start = parseKey(weekStart);
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000 - 1);
    return { start: start.toISOString(), end: end.toISOString() };
  }, [weekStart]);

  const metrics = data?.metrics || { meetings: 0, sales: 0, revenue: 0, conversionRate: 0, closedDeals: 0, leads: 0, calls: 0, messages: 0, activities: 0 };
  const leads = data?.leads || [];
  const label = weekRangeLabel(weekStart, data?.weekEnd);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(buildPlainText(label, metrics, leads));
      toast('Relatório semanal copiado', 'success');
    } catch {
      toast('Não consegui copiar', 'error');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <CrmPageHeader
        title="Relatório Semanal"
        subtitle={label}
        actions={
          <div className="flex items-center gap-3">
            {hasExample ? (
              <button onClick={runClear} disabled={seeding}
                title="Remover os dados de exemplo desta semana"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 rounded-lg border border-rose-200/70 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-50">
                {seeding ? <span className="w-4 h-4 border-2 border-rose-400/40 border-t-rose-500 rounded-full animate-spin" /> : <Trash2 size={15} />} Limpar exemplo
              </button>
            ) : (
              <button onClick={runSeed} disabled={seeding}
                title="Gerar dados de exemplo na semana atual (pra demonstração)"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 rounded-lg border border-violet-200/70 dark:border-violet-900/40 hover:bg-violet-50 dark:hover:bg-violet-900/20 disabled:opacity-50">
                {seeding ? <span className="w-4 h-4 border-2 border-violet-400/40 border-t-violet-500 rounded-full animate-spin" /> : <Sparkles size={15} />} Gerar exemplo
              </button>
            )}
            <button onClick={() => navigate('/crm/relatorio-diario')}
              title="Ver relatório do dia"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200/70 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
              <CalendarDays size={15} /> Diário
            </button>
            {/* Navegação livre por semana — qualquer semana passada fica acessível */}
            <div className="flex items-center gap-1">
              <button onClick={() => setWeekStart(w => shiftWeek(w, -1))} title="Semana anterior"
                className="p-2 rounded-lg border border-slate-200/70 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"><ChevronLeft size={16} /></button>
              <input type="date" value={weekStart} max={mondayKey(0)} onChange={(e) => e.target.value && setWeekStart(mondayOf(e.target.value))}
                title="Pular pra semana de uma data" className="px-2 py-1.5 text-sm rounded-lg border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200" />
              <button onClick={() => setWeekStart(w => shiftWeek(w, 1))} disabled={isCurrentWeek} title="Próxima semana"
                className="p-2 rounded-lg border border-slate-200/70 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-40"><ChevronRight size={16} /></button>
              <button onClick={() => setWeekStart(mondayKey(0))} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200/70 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5">Esta semana</button>
            </div>
            <button onClick={copy} disabled={leads.length === 0}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg shadow-sm disabled:opacity-50">
              <Copy size={15} /> Copiar
            </button>
          </div>
        }
      />

      {/* Métricas da semana */}
      <div className="flex items-stretch gap-2 flex-wrap mb-3">
        <StatCard icon={CalendarCheck} value={metrics.meetings} label="reuniões marcadas" accent="#3b82f6" />
        <StatCard icon={Trophy} value={metrics.sales} label="vendas feitas" accent="#f59e0b" />
        <StatCard icon={DollarSign} value={money(metrics.revenue)} label="receita" accent="#10b981" />
        <StatCard icon={Percent} value={`${metrics.conversionRate}%`} label={`conversão · ${metrics.closedDeals} fechados`} accent="#8b5cf6" />
      </div>

      {/* Volume de atividade */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <StatPill icon={FileText} value={metrics.leads} label="leads atendidos" />
        <StatPill icon={Phone} value={metrics.calls} label="ligações" />
        <StatPill icon={MessageCircle} value={metrics.messages} label="mensagens" />
        <StatPill icon={CalendarCheck} value={metrics.activities} label="atividades" />
      </div>

      {/* Funil da jornada do lead na semana */}
      <div className="mb-6">
        <WeeklyFunnel range={funnelRange} scope="sales" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-fyness-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <FileText size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">Nenhum lead atendido {isCurrentWeek ? 'esta semana' : 'nesta semana'} ainda.</p>
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
              {l.reports.length > 0 ? (
                <div className="space-y-2 mt-1">
                  {l.reports.map((r, i) => (
                    <div key={i} className="pl-3 border-l-2 border-slate-200 dark:border-white/10">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 capitalize">{dayShort(r.date)}</div>
                      <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words">{r.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic">Sem relato escrito — abra o lead na Agenda pra registrar.</p>
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

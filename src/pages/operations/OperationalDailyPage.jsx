/**
 * OperationalDailyPage - Relatório Operacional Diário por SETOR.
 *
 * Espelha o relatório diário do comercial, mas pra operação: cards por SETOR
 * (Marketing / Produto-Tech / Comercial / ...) com Volume, Tempo, Prazo e
 * Qualidade do que foi entregue no dia. Atribuição pelo setor do TRABALHO
 * (O.S. → projeto → setor). Lê só o sistema de O.S. — não toca no CRM.
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, ClipboardCheck, Clock, Timer, BadgeCheck, FileText, Copy, Award, Scale } from 'lucide-react';
import { getOperationalDailyReport } from '../../lib/operationalReportService';
import { formatHM } from '../financial/components/helpers';
import { toast } from '../../contexts/ToastContext';

const pad = (n) => String(n).padStart(2, '0');
const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const shiftKey = (key, days) => { const [y, m, d] = key.split('-').map(Number); const dt = new Date(y, m - 1, d + days); return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`; };
const longDate = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }); };
const relativeDay = (key) => (key === todayKey() ? 'Hoje' : key === shiftKey(todayKey(), -1) ? 'Ontem' : null);

function Metric({ icon: Icon, value, sub, accent }) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} style={{ color: accent }} className="shrink-0" />
      <div className="min-w-0">
        <div className="text-base font-semibold text-slate-800 dark:text-slate-100 tabular-nums leading-none">{value}</div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{sub}</div>
      </div>
    </div>
  );
}

function SectorCard({ s }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-800/50 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-white/5" style={{ borderLeft: `4px solid ${s.color}` }}>
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex-1 truncate">{s.label}</h3>
        {s.osDone > 0 && <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{s.osDone} O.S. concluída{s.osDone > 1 ? 's' : ''}</span>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 px-4 py-3">
        <Metric icon={ClipboardCheck} accent="#3b82f6" value={s.tasksDone} sub={`tarefa${s.tasksDone === 1 ? '' : 's'} · ${s.deliveries} entrega${s.deliveries === 1 ? '' : 's'}`} />
        <Metric icon={Timer} accent="#8b5cf6" value={formatHM(Math.round(s.timeMin))} sub="tempo trabalhado" />
        <Metric icon={Clock} accent="#f59e0b" value={s.onTimePct == null ? '—' : `${s.onTimePct}%`} sub={`no prazo${s.late ? ` · ${s.late} atrasada${s.late > 1 ? 's' : ''}` : ''}`} />
        <Metric icon={BadgeCheck} accent="#10b981" value={s.approvedPct == null ? '—' : `${s.approvedPct}%`} sub={`aprovadas${s.reviewed ? ` · ${s.reviewed} revisada${s.reviewed > 1 ? 's' : ''}` : ''}`} />
        <Metric icon={Award} accent="#6366f1" value={s.qualityAvg == null ? '—' : `${s.qualityAvg}%`} sub="nota de qualidade" />
      </div>
      {/* Contestações arbitradas pelo Juiz — só aparece quando houve contestação */}
      {s.disputes > 0 && (
        <div className="flex items-center gap-2 px-4 py-2 border-t border-slate-100 dark:border-white/5 text-[11px] text-slate-500 dark:text-slate-400">
          <Scale size={13} className="text-indigo-500 dark:text-indigo-400 shrink-0" />
          <span className="min-w-0">
            {s.disputes} contestaç{s.disputes > 1 ? 'ões' : 'ão'}
            {s.disputesChanged ? ` · ${s.disputesChanged} ajustada${s.disputesChanged > 1 ? 's' : ''}` : ''}
            {s.disputesKept ? ` · ${s.disputesKept} mantida${s.disputesKept > 1 ? 's' : ''}` : ''}
            {s.disputesOpen ? ` · ${s.disputesOpen} em aberto` : ''}
            {s.judges && s.judges.length ? ` · Juiz: ${s.judges.join(', ')}` : ''}
          </span>
        </div>
      )}
    </div>
  );
}

function disputeText(s) {
  if (!s.disputes) return '';
  const parts = [`${s.disputes} contestaç${s.disputes > 1 ? 'ões' : 'ão'}`];
  if (s.disputesChanged) parts.push(`${s.disputesChanged} ajustada${s.disputesChanged > 1 ? 's' : ''}`);
  if (s.disputesKept) parts.push(`${s.disputesKept} mantida${s.disputesKept > 1 ? 's' : ''}`);
  if (s.disputesOpen) parts.push(`${s.disputesOpen} em aberto`);
  if (s.judges && s.judges.length) parts.push(`Juiz: ${s.judges.join(', ')}`);
  return ` · ⚖️ ${parts.join(' · ')}`;
}

function buildText(date, report) {
  const t = report.totals;
  const lines = [`RELATÓRIO OPERACIONAL — ${longDate(date)}`];
  lines.push(`${t.tasksDone} tarefas · ${t.deliveries} entregas · ${formatHM(Math.round(t.timeMin))} · ${t.osDone} O.S. concluídas${t.qualityAvg == null ? '' : ` · nota ${t.qualityAvg}%`}${t.disputes ? ` · ${t.disputes} contestaç${t.disputes > 1 ? 'ões' : 'ão'}` : ''}`);
  lines.push('');
  report.sectors.forEach(s => {
    lines.push(`• ${s.label}: ${s.tasksDone} tarefas · ${formatHM(Math.round(s.timeMin))} · ${s.onTimePct == null ? '—' : s.onTimePct + '% no prazo'} · ${s.approvedPct == null ? '—' : s.approvedPct + '% aprovadas'}${s.qualityAvg == null ? '' : ` · nota ${s.qualityAvg}%`}${disputeText(s)}`);
  });
  return lines.join('\n');
}

export default function OperationalDailyPage() {
  const [date, setDate] = useState(todayKey());
  const { data, isLoading } = useQuery({
    queryKey: ['operationalDailyReport', date],
    queryFn: () => getOperationalDailyReport(date),
    enabled: !!date,
    staleTime: 30_000,
  });

  const report = data || { date, sectors: [], totals: { tasksDone: 0, deliveries: 0, timeMin: 0, osDone: 0, qualityAvg: null, disputes: 0 } };
  const rel = relativeDay(date);

  const copy = async () => {
    try { await navigator.clipboard.writeText(buildText(date, report)); toast('Relatório copiado', 'success'); }
    catch { toast('Não consegui copiar', 'error'); }
  };

  const totalLabel = useMemo(() => {
    const t = report.totals;
    let s = `${t.tasksDone} tarefas · ${t.deliveries} entregas · ${formatHM(Math.round(t.timeMin))} · ${t.osDone} O.S.`;
    if (t.qualityAvg != null) s += ` · nota ${t.qualityAvg}%`;
    if (t.disputes) s += ` · ${t.disputes} contestaç${t.disputes > 1 ? 'ões' : 'ão'}`;
    return s;
  }, [report.totals]);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-3 mb-6 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Relatório Operacional</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 capitalize">{rel ? `${rel} · ` : ''}{longDate(date)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDate(d => shiftKey(d, -1))} title="Dia anterior"
            className="p-2 rounded-lg border border-slate-200/70 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"><ChevronLeft size={16} /></button>
          <input type="date" value={date} max={todayKey()} onChange={(e) => e.target.value && setDate(e.target.value)}
            className="px-2 py-1.5 text-sm rounded-lg border border-slate-200/70 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200" />
          <button onClick={() => setDate(d => shiftKey(d, 1))} disabled={date >= todayKey()} title="Próximo dia"
            className="p-2 rounded-lg border border-slate-200/70 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-40"><ChevronRight size={16} /></button>
          <button onClick={() => setDate(todayKey())} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200/70 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5">Hoje</button>
          <button onClick={copy} disabled={report.sectors.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg shadow-sm disabled:opacity-50">
            <Copy size={15} /> Copiar
          </button>
        </div>
      </div>

      {/* Totais do dia */}
      <div className="text-sm text-slate-500 dark:text-slate-400 mb-4">{totalLabel}</div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-7 h-7 border-2 border-fyness-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : report.sectors.length === 0 ? (
        <div className="text-center py-16 text-slate-400 dark:text-slate-500">
          <FileText size={32} className="mx-auto mb-3 opacity-50" />
          <p className="text-sm font-medium">Nada concluído {rel === 'Hoje' ? 'hoje' : 'neste dia'}.</p>
          <p className="text-xs mt-1">Conclua tarefas nas O.S. (em projetos com setor) pra elas aparecerem aqui por setor.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {report.sectors.map(s => <SectorCard key={s.sectorId} s={s} />)}
        </div>
      )}
    </div>
  );
}

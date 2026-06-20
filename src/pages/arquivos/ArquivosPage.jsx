/**
 * ArquivosPage - Arquivo de Relatórios (fora do CRM).
 *
 * Navegação estilo Finder: (Pessoa | Setor) → [Diários / Semanais / Mensais] →
 * datas → relatório. Um interruptor no topo alterna o corte:
 *   • Pessoas — vendedores do comercial (relatório da agenda) + pessoas da
 *     operação (relatório das O.S., cada tarefa com chip do setor).
 *   • Setores — setores da operação (relatório das O.S., cada tarefa com chip
 *     de quem fez).
 * Semana = junção dos dias; mês = junção das semanas. "Apresentar" marca o período
 * como apresentado (genérico por pessoa OU setor). Clicar num lead abre a jornada.
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { Folder, ChevronRight, ArrowLeft, Home, Copy, Sparkles, Trash2, Lock, CheckCircle2, Users, Layers } from 'lucide-react';
import {
  useReportOwners, useOwnerReportIndex, useDailyReport, useWeeklyReport, useMonthlyReport,
} from '../../modules/crm/hooks/useCrmQueries';
import { DailyReportBody, PeriodReportBody, eventVisual, hm, money } from '../../modules/crm/components/reports/ReportBlocks';
import LeadJourneyDrawer from '../../modules/crm/components/LeadJourneyDrawer';
import { seedWeeklyExample, clearWeeklyExample, hasWeeklyExample } from '../../modules/crm/services/crmDemoWeekService';
import { getOperationalIndex, getOperationalReport, buildOperationalText } from '../../lib/operationalModel';
import { listClosings, closeReport, reopenReport } from '../../lib/crmReportClosingsService';
import OpReport from '../operations/components/OpReport';
import BriefingDrawer from '../financial/components/BriefingDrawer';
import { toast } from '../../contexts/ToastContext';
import { FolderGlyph, FileGlyph, FinderItem } from './FinderIcons';

// ---------- formatadores ----------
const parseKey = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d); };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const longDate = (key) => cap(parseKey(key).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }));
const dayItemLabel = (key) => cap(parseKey(key).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }));
const monthLabel = (key) => { const [y, m] = key.split('-').map(Number); return cap(new Date(y, m - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })); };
function weekLabel(mondayKey) {
  const s = parseKey(mondayKey);
  const e = new Date(s); e.setDate(e.getDate() + 6);
  if (s.getMonth() === e.getMonth()) return `${s.getDate()} – ${e.getDate()} de ${cap(e.toLocaleDateString('pt-BR', { month: 'long' }))} ${e.getFullYear()}`;
  const f = (d) => `${d.getDate()} ${d.toLocaleDateString('pt-BR', { month: 'short' })}`;
  return `${f(s)} – ${f(e)} ${e.getFullYear()}`;
}

const PERIODS = [
  { key: 'daily', label: 'Relatórios Diários', color: '#3B9EE3', countKey: 'days' },
  { key: 'weekly', label: 'Relatórios Semanais', color: '#A06BE6', countKey: 'weeks' },
  { key: 'monthly', label: 'Relatórios Mensais', color: '#27AE8B', countKey: 'months' },
];

// Intervalo ISO do período (pro funil). null no diário.
function periodRange(period, key) {
  if (period === 'weekly') {
    const s = parseKey(key); s.setHours(0, 0, 0, 0);
    return { start: s.toISOString(), end: new Date(s.getTime() + 7 * 24 * 60 * 60 * 1000 - 1).toISOString() };
  }
  if (period === 'monthly') {
    const [y, m] = key.split('-').map(Number);
    return { start: new Date(y, m - 1, 1).toISOString(), end: new Date(y, m, 1, 0, 0, 0, -1).toISOString() };
  }
  return null;
}

function buildArchiveText(period, data, headLabel, ownerName) {
  const lines = [];
  if (period === 'daily') {
    const s = data?.summary || {};
    lines.push(`RELATÓRIO DO DIA — ${headLabel}`, ownerName);
    const parts = [`${s.leads || 0} leads`, `${s.calls || 0} ligações`, `${s.messages || 0} mensagens`, `${s.activities || 0} atividades`];
    if (s.meetings) parts.push(`${s.meetings} reuniões`);
    if (s.sales) parts.push(`${s.sales} venda(s)`);
    lines.push(parts.join(' · '), '');
    (data?.leads || []).forEach(l => {
      lines.push(`• ${l.name}${l.stage ? ` (${l.stage})` : ''}`);
      (l.events || []).forEach(ev => { const { label } = eventVisual(ev); lines.push(`  ${hm(ev.time)} ${label}${ev.detail ? ` — ${ev.detail}` : ''}`); });
      lines.push(`  Relato: ${l.report || '—'}`, '');
    });
  } else {
    const m = data?.metrics || {};
    lines.push(`RELATÓRIO ${period === 'weekly' ? 'SEMANAL' : 'MENSAL'} — ${headLabel}`, ownerName);
    lines.push(`Reuniões: ${m.meetings || 0} · Vendas: ${m.sales || 0} (${money(m.revenue || 0)}) · Conversão: ${m.conversionRate || 0}%`);
    lines.push(`${m.leads || 0} leads · ${m.calls || 0} ligações · ${m.messages || 0} mensagens · ${m.activities || 0} atividades`, '');
    (data?.leads || []).forEach(l => {
      lines.push(`• ${l.name}${l.stage ? ` (${l.stage})` : ''}`);
      (l.reports || []).forEach(r => lines.push(`  ${r.date}: ${r.content}`));
      lines.push('');
    });
  }
  return lines.join('\n');
}

function Avatar({ name, color, size = 40 }) {
  return (
    <div className="rounded-full flex items-center justify-center text-white font-semibold shrink-0"
      style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.4 }}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

function Crumb({ children, onClick, last }) {
  return (
    <button onClick={onClick} disabled={last}
      className={`inline-flex items-center gap-1 ${last ? 'text-slate-800 dark:text-slate-100 font-semibold cursor-default' : 'text-slate-500 dark:text-slate-400 hover:text-fyness-primary'}`}>
      {children}
    </button>
  );
}

export default function ArquivosPage() {
  const navigate = useNavigate();
  const [lens, setLens] = useState('person'); // corte operacional: 'person' | 'sector'
  const [owner, setOwner] = useState(null);   // { kind:'crm'|'op', ... }
  const [period, setPeriod] = useState(null); // 'daily' | 'weekly' | 'monthly'
  const [item, setItem] = useState(null);     // dateKey / mondayKey / monthKey
  const [selectedLead, setSelectedLead] = useState(null);
  const [openTask, setOpenTask] = useState(null); // tarefa do relatório operacional (painel de leitura)
  const qc = useQueryClient();
  const [hasExample, setHasExample] = useState(hasWeeklyExample());
  const [seeding, setSeeding] = useState(false);

  const switchLens = (l) => { setLens(l); setOwner(null); setPeriod(null); setItem(null); };

  const { data: crmOwners = [] } = useReportOwners();

  // Camada OPERACIONAL (das O.S.): pessoas OU setores, conforme o interruptor.
  const opIndex = useMemo(() => getOperationalIndex(lens), [lens]);
  const opOwners = useMemo(
    () => opIndex.owners.map((o) => ({ kind: 'op', opLens: lens, id: o.id, name: o.name, color: o.color, sub: o.sub })),
    [opIndex, lens],
  );
  // "Pessoas" = vendedores do comercial (agenda) + pessoas da operação.
  // "Setores" = só os setores da operação.
  // Dedupe por nome: a mesma pessoa aparece no comercial E na operação (e o
  // comercial pode repetir) — UMA pasta por pessoa. Operação ganha no empate
  // (é o "o que ela fez" das O.S.).
  const owners = useMemo(() => {
    if (lens === 'sector') return opOwners;
    const norm = (s) => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
    const combined = [...opOwners, ...crmOwners.map((o) => ({ kind: 'crm', ...o }))];
    const seen = new Set();
    return combined.filter((o) => {
      const k = norm(o.name);
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }, [lens, crmOwners, opOwners]);

  const isOp = owner?.kind === 'op';

  // Índice de períodos (pastas/datas)
  const crmIndexQ = useOwnerReportIndex(isOp ? null : owner?.authUserId);
  const index = isOp ? opIndex : crmIndexQ.data;
  const indexLoading = isOp ? false : crmIndexQ.isLoading;

  // Relatório operacional (montado na hora a partir do modelo, das O.S.)
  const opReport = useMemo(
    () => (isOp && period && item ? getOperationalReport(owner.opLens, owner.id, period, item) : null),
    [isOp, owner, period, item],
  );

  // Relatórios comerciais (agenda)
  const dailyQ = useDailyReport(period === 'daily' && !isOp ? item : null, owner?.authUserId);
  const weeklyQ = useWeeklyReport(period === 'weekly' && !isOp ? item : null, owner?.authUserId);
  const monthlyQ = useMonthlyReport(period === 'monthly' && !isOp ? item : null, owner?.authUserId);

  // Fechamento (marco) do relatório — genérico: vendedor (authUserId), pessoa ou
  // setor da operação (namespaced como op:person:<id> / op:sector:<id>).
  const closingOwnerId = owner ? (isOp ? `op:${owner.opLens}:${owner.id}` : owner.authUserId) : null;
  const closingsQ = useQuery({
    queryKey: ['reportClosings', closingOwnerId],
    queryFn: () => listClosings(closingOwnerId),
    enabled: !!closingOwnerId,
    staleTime: 15_000,
  });
  const closings = closingsQ.data || [];
  const closingOf = (p, k) => closings.find((c) => c.period === p && c.periodKey === k) || null;

  const closeMut = useMutation({
    mutationFn: (vars) => closeReport(vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reportClosings', closingOwnerId] }); toast('Relatório apresentado', 'success'); },
    onError: () => toast('Não consegui marcar como apresentado', 'error'),
  });
  const reopenMut = useMutation({
    mutationFn: (vars) => reopenReport(vars),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['reportClosings', closingOwnerId] }); toast('Apresentação desfeita', 'success'); },
    onError: () => toast('Não consegui desfazer', 'error'),
  });

  const openLeadJourney = (l) => setSelectedLead({ dealId: l.dealId, contactId: l.contactId });

  const runSeed = async () => { setSeeding(true); const r = await seedWeeklyExample(); setSeeding(false); if (r.ok) { setHasExample(true); qc.invalidateQueries({ queryKey: ['crm'] }); } };
  const runClear = async () => { setSeeding(true); const r = await clearWeeklyExample(); setSeeding(false); if (r.ok) { setHasExample(false); qc.invalidateQueries({ queryKey: ['crm'] }); } };

  // ---------- breadcrumb ----------
  const periodLabel = PERIODS.find(p => p.key === period)?.label;
  const itemLabel = !item ? null
    : period === 'daily' ? longDate(item)
      : period === 'weekly' ? weekLabel(item)
        : monthLabel(item);

  const activeData = period === 'daily' ? dailyQ.data : period === 'weekly' ? weeklyQ.data : monthlyQ.data;
  const activeLoading = isOp ? false : (period === 'daily' ? dailyQ.isLoading : period === 'weekly' ? weeklyQ.isLoading : monthlyQ.isLoading);
  const currentClosing = item ? closingOf(period, item) : null;
  const periodNoun = period === 'daily' ? 'dia' : period === 'weekly' ? 'semana' : 'mês';

  const copyReport = async () => {
    try {
      const text = isOp
        ? buildOperationalText(opReport, owner.name, owner.sub, itemLabel)
        : buildArchiveText(period, activeData, itemLabel, owner?.name || '');
      await navigator.clipboard.writeText(text); toast('Relatório copiado', 'success');
    } catch { toast('Não consegui copiar', 'error'); }
  };

  const buildSummary = () => {
    if (isOp) return opReport?.summary || {};
    if (period === 'daily') { const s = activeData?.summary || {}; return { leads: s.leads || 0, calls: s.calls || 0, messages: s.messages || 0, meetings: s.meetings || 0, sales: s.sales || 0 }; }
    const m = activeData?.metrics || {}; return { meetings: m.meetings || 0, sales: m.sales || 0, revenue: m.revenue || 0, conversionRate: m.conversionRate || 0, leads: m.leads || 0 };
  };
  const doClose = () => closeMut.mutate({ ownerId: closingOwnerId, period, periodKey: item, summary: buildSummary() });
  const doReopen = () => reopenMut.mutate({ ownerId: closingOwnerId, period, periodKey: item });

  const Breadcrumb = (
    <nav className="flex items-center gap-1.5 text-sm flex-wrap">
      <Crumb onClick={() => { setOwner(null); setPeriod(null); setItem(null); }} last={!owner}>
        <Home size={14} /> Arquivos
      </Crumb>
      {owner && <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />}
      {owner && (
        <Crumb onClick={() => { setPeriod(null); setItem(null); }} last={!period}>{owner.name}</Crumb>
      )}
      {period && <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />}
      {period && <Crumb onClick={() => setItem(null)} last={!item}>{periodLabel}</Crumb>}
      {item && <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />}
      {item && <Crumb last>{itemLabel}</Crumb>}
    </nav>
  );

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Arquivos</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Relatórios por pessoa e por setor — diário, semanal e mensal.</p>
          <div className="mt-4">{Breadcrumb}</div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Interruptor de corte: Pessoas | Setores */}
          <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/70 dark:border-white/10">
            {[{ k: 'person', label: 'Pessoas', icon: Users }, { k: 'sector', label: 'Setores', icon: Layers }].map((t) => {
              const Icon = t.icon; const active = lens === t.k;
              return (
                <button key={t.k} onClick={() => switchLens(t.k)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-md transition ${active ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </div>
          {lens === 'person' && !owner && (
            hasExample ? (
              <button onClick={runClear} disabled={seeding}
                title="Remover os dados de exemplo do comercial"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 rounded-lg border border-rose-200/70 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-50">
                {seeding ? <span className="w-4 h-4 border-2 border-rose-400/40 border-t-rose-500 rounded-full animate-spin" /> : <Trash2 size={15} />} Limpar exemplo
              </button>
            ) : (
              <button onClick={runSeed} disabled={seeding}
                title="Gerar dados de exemplo do comercial na sua semana atual"
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 rounded-lg border border-violet-200/70 dark:border-violet-900/40 hover:bg-violet-50 dark:hover:bg-violet-900/20 disabled:opacity-50">
                {seeding ? <span className="w-4 h-4 border-2 border-violet-400/40 border-t-violet-500 rounded-full animate-spin" /> : <Sparkles size={15} />} Gerar exemplo
              </button>
            )
          )}
        </div>
      </div>

      {/* Nível 0: Pessoas ou Setores */}
      {!owner && (
        owners.length === 0 ? (
          <Empty msg={lens === 'sector' ? 'Nenhum setor com relatórios ainda.' : 'Nenhuma pessoa com relatórios ainda.'} />
        ) : (
          <div className="flex flex-wrap gap-1">
            {owners.map(o => {
              const key = o.kind === 'op' ? `op-${o.id}` : o.authUserId;
              const isSectorFolder = o.kind === 'op' && o.opLens === 'sector';
              return (
                <FinderItem key={key}
                  glyph={<FolderGlyph color={o.color} badge={isSectorFolder ? undefined : (o.name || '?').charAt(0).toUpperCase()} />}
                  label={`${o.name}${o.kind === 'crm' && o.isMe ? ' (você)' : ''}`}
                  sublabel={isSectorFolder ? o.sub : undefined}
                  onClick={() => { setOwner(o); setPeriod(null); setItem(null); }}
                />
              );
            })}
          </div>
        )
      )}

      {/* Nível 1: Pastas de período */}
      {owner && !period && (
        <div className="flex flex-wrap gap-1">
          {PERIODS.map(p => {
            const count = index?.[p.countKey]?.length || 0;
            return (
              <FinderItem key={p.key}
                glyph={<FolderGlyph color={p.color} />}
                label={p.label}
                sublabel={indexLoading ? '…' : `${count} ${count === 1 ? 'relatório' : 'relatórios'}`}
                onClick={() => { setPeriod(p.key); setItem(null); }}
              />
            );
          })}
        </div>
      )}

      {/* Nível 2: Lista de itens (datas) */}
      {owner && period && !item && (
        indexLoading ? <Spinner /> : (() => {
          const list = index?.[PERIODS.find(p => p.key === period).countKey] || [];
          if (list.length === 0) return <Empty msg="Nenhum relatório arquivado nesta pasta." />;
          const labelFor = (k) => period === 'daily' ? dayItemLabel(k) : period === 'weekly' ? weekLabel(k) : monthLabel(k);
          const accent = PERIODS.find(p => p.key === period).color;
          return (
            <div className="flex flex-wrap gap-1">
              {list.map(k => (
                <FinderItem key={k}
                  glyph={<FileGlyph accent={accent} />}
                  label={labelFor(k)}
                  sublabel={closingOf(period, k) ? `✓ Apresentado ${new Date(closingOf(period, k).closedAt).toLocaleDateString('pt-BR')}` : undefined}
                  onClick={() => setItem(k)}
                />
              ))}
            </div>
          );
        })()
      )}

      {/* Nível 3: Relatório */}
      {owner && period && item && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2 min-w-0">
              <Avatar name={owner.name} color={owner.color} size={32} />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{owner.name}</div>
                <div className="text-xs text-slate-400 dark:text-slate-500 capitalize truncate">{itemLabel}</div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {(
                currentClosing ? (
                  <button onClick={doReopen} disabled={reopenMut.isPending}
                    title={`Apresentado em ${new Date(currentClosing.closedAt).toLocaleDateString('pt-BR')} — clique pra desfazer`}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 disabled:opacity-50">
                    <CheckCircle2 size={15} /> Apresentado · {new Date(currentClosing.closedAt).toLocaleDateString('pt-BR')}
                  </button>
                ) : (
                  <button onClick={doClose} disabled={closeMut.isPending || activeLoading}
                    title={`Marcar o relatório ${periodNoun === 'mês' ? 'do mês' : `da/do ${periodNoun}`} como apresentado`}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200/70 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 disabled:opacity-50">
                    {closeMut.isPending ? <span className="w-4 h-4 border-2 border-slate-400/40 border-t-slate-500 rounded-full animate-spin" /> : <Lock size={15} />} Apresentar {periodNoun}
                  </button>
                )
              )}
              <button onClick={copyReport}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg shadow-sm">
                <Copy size={15} /> Copiar
              </button>
              <button onClick={() => setItem(null)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200/70 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5">
                <ArrowLeft size={15} /> Voltar
              </button>
            </div>
          </div>

          {isOp ? (
            <OpReport report={opReport} onOpenTask={setOpenTask} />
          ) : (
            <>
              {period === 'daily' && (
                dailyQ.isLoading ? <Spinner /> : <DailyReportBody data={dailyQ.data} onOpenLead={openLeadJourney} />
              )}
              {period === 'weekly' && (
                weeklyQ.isLoading ? <Spinner /> : <PeriodReportBody data={weeklyQ.data} onOpenLead={openLeadJourney} funnelRange={periodRange('weekly', item)} ownerId={owner.authUserId} />
              )}
              {period === 'monthly' && (
                monthlyQ.isLoading ? <Spinner /> : <PeriodReportBody data={monthlyQ.data} onOpenLead={openLeadJourney} funnelRange={periodRange('monthly', item)} ownerId={owner.authUserId} />
              )}
            </>
          )}
        </div>
      )}

      <LeadJourneyDrawer
        selected={selectedLead}
        onClose={() => setSelectedLead(null)}
        onOpenLead={(lead) => lead.dealId && navigate(`/crm/deals/${lead.dealId}`)}
      />

      {openTask && (
        <BriefingDrawer
          key={openTask.taskId}
          title={openTask.title || openTask.taskText}
          editable={false}
          content={openTask.briefing}
          showDelivery={!!openTask.done}
          deliveryContent={openTask.delivery}
          reviewStatus={openTask.done ? (openTask.qualityPct != null ? 'approved' : 'draft') : undefined}
          qualityPct={openTask.qualityPct}
          qualityAnswers={openTask.qualityAnswers}
          qualityNotes={openTask.qualityNotes}
          qualityDispute={openTask.qualityDispute}
          onClose={() => setOpenTask(null)}
        />
      )}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 border-2 border-fyness-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
function Empty({ msg }) {
  return (
    <div className="text-center py-16 text-slate-400 dark:text-slate-500">
      <Folder size={32} className="mx-auto mb-3 opacity-50" />
      <p className="text-sm font-medium">{msg}</p>
    </div>
  );
}

/**
 * ArquivosPage - Arquivo de Relatórios (fora do CRM).
 *
 * Navegação estilo Finder: Pessoas → [Diários / Semanais / Mensais] → datas →
 * relatório. Cada vendedor tem a pasta dele com os relatórios diários, semanais
 * e mensais arquivados por data. Nada se perde: tudo é reconstruído dos relatos
 * salvos no banco. Clicar num lead abre a jornada completa dele.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Folder, ChevronRight, ArrowLeft, Home, Copy, Sparkles, Trash2 } from 'lucide-react';
import {
  useReportOwners, useOwnerReportIndex, useDailyReport, useWeeklyReport, useMonthlyReport,
} from '../../modules/crm/hooks/useCrmQueries';
import { DailyReportBody, PeriodReportBody, eventVisual, hm, money } from '../../modules/crm/components/reports/ReportBlocks';
import LeadJourneyDrawer from '../../modules/crm/components/LeadJourneyDrawer';
import { seedWeeklyExample, clearWeeklyExample, hasWeeklyExample } from '../../modules/crm/services/crmDemoWeekService';
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
  const [owner, setOwner] = useState(null);   // { authUserId, name, color, role }
  const [period, setPeriod] = useState(null); // 'daily' | 'weekly' | 'monthly'
  const [item, setItem] = useState(null);     // dateKey / mondayKey / monthKey
  const [selectedLead, setSelectedLead] = useState(null);
  const qc = useQueryClient();
  const [hasExample, setHasExample] = useState(hasWeeklyExample());
  const [seeding, setSeeding] = useState(false);

  const { data: owners = [], isLoading: ownersLoading } = useReportOwners();
  const { data: index, isLoading: indexLoading } = useOwnerReportIndex(owner?.authUserId);

  const dailyQ = useDailyReport(period === 'daily' ? item : null, owner?.authUserId);
  const weeklyQ = useWeeklyReport(period === 'weekly' ? item : null, owner?.authUserId);
  const monthlyQ = useMonthlyReport(period === 'monthly' ? item : null, owner?.authUserId);

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
  const copyReport = async () => {
    try { await navigator.clipboard.writeText(buildArchiveText(period, activeData, itemLabel, owner?.name || '')); toast('Relatório copiado', 'success'); }
    catch { toast('Não consegui copiar', 'error'); }
  };

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
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Todos os relatórios, organizados por pessoa e período — nada se perde.</p>
          <div className="mt-4">{Breadcrumb}</div>
        </div>
        {!owner && (
          hasExample ? (
            <button onClick={runClear} disabled={seeding}
              title="Remover os dados de exemplo"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 rounded-lg border border-rose-200/70 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-50 shrink-0">
              {seeding ? <span className="w-4 h-4 border-2 border-rose-400/40 border-t-rose-500 rounded-full animate-spin" /> : <Trash2 size={15} />} Limpar exemplo
            </button>
          ) : (
            <button onClick={runSeed} disabled={seeding}
              title="Gerar dados de exemplo na sua semana atual (pra demonstração)"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-violet-600 dark:text-violet-400 rounded-lg border border-violet-200/70 dark:border-violet-900/40 hover:bg-violet-50 dark:hover:bg-violet-900/20 disabled:opacity-50 shrink-0">
              {seeding ? <span className="w-4 h-4 border-2 border-violet-400/40 border-t-violet-500 rounded-full animate-spin" /> : <Sparkles size={15} />} Gerar exemplo
            </button>
          )
        )}
      </div>

      {/* Nível 0: Pessoas */}
      {!owner && (
        ownersLoading ? <Spinner /> : owners.length === 0 ? (
          <Empty msg="Nenhum vendedor com relatórios ainda." />
        ) : (
          <div className="flex flex-wrap gap-1">
            {owners.map(o => (
              <FinderItem key={o.authUserId}
                glyph={<FolderGlyph color={o.color} badge={(o.name || '?').charAt(0).toUpperCase()} />}
                label={`${o.name}${o.isMe ? ' (você)' : ''}`}
                sublabel={o.role || undefined}
                onClick={() => { setOwner(o); setPeriod(null); setItem(null); }}
              />
            ))}
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

          {period === 'daily' && (
            dailyQ.isLoading ? <Spinner /> : <DailyReportBody data={dailyQ.data} onOpenLead={openLeadJourney} />
          )}
          {period === 'weekly' && (
            weeklyQ.isLoading ? <Spinner /> : <PeriodReportBody data={weeklyQ.data} onOpenLead={openLeadJourney} funnelRange={periodRange('weekly', item)} ownerId={owner.authUserId} />
          )}
          {period === 'monthly' && (
            monthlyQ.isLoading ? <Spinner /> : <PeriodReportBody data={monthlyQ.data} onOpenLead={openLeadJourney} funnelRange={periodRange('monthly', item)} ownerId={owner.authUserId} />
          )}
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

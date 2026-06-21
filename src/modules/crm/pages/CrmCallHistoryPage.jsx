/**
 * CrmCallHistoryPage - Historico de chamadas do discador.
 *
 * Lista paginada com filtros por periodo, resultado e busca livre
 * (numero discado ou notas). Click numa linha expande pra ver notas
 * e detalhes da ligacao.
 *
 * Por padrao mostra apenas chamadas do vendedor logado. Toggle
 * "Time todo" libera para ver chamadas de todos (util pra gestor).
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, Search, X, ArrowLeft, History, Filter, Building2, FileText, Trash2,
} from 'lucide-react';
import {
  CrmPageHeader, CrmDataTable, CrmBadge, CrmConfirmDialog, CrmAvatar,
} from '../components/ui';
import { useCrmCalls, useDeleteCrmCall } from '../hooks/useCrmQueries';
import { CALL_OUTCOMES } from '../services/crmCallsService';
import { useUrlState, useUrlInt } from '../../../hooks/useUrlState';
import { supabase } from '../../../lib/supabase';

// Periodos pre-definidos (em dias)
const PERIODS = [
  { value: '1',  label: 'Hoje' },
  { value: '7',  label: '7 dias' },
  { value: '30', label: '30 dias' },
  { value: '90', label: '90 dias' },
  { value: '0',  label: 'Tudo' },
];

function formatSeconds(total) {
  if (total == null) return '—';
  const s = Math.max(0, Math.floor(total));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function CrmCallHistoryPage() {
  // Filtros (persistidos em URL)
  const [page, setPage] = useUrlInt('page', 1);
  const [search, setSearch] = useUrlState('q', '');
  const [outcomeFilter, setOutcomeFilter] = useUrlState('outcome', '');
  const [period, setPeriod] = useUrlState('period', '7');
  const [teamMode, setTeamMode] = useUrlState('team', '');

  const debouncedSearch = useDebounce(search);

  // Carrega o user id atual pra filtrar "minhas chamadas" por default
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (alive) setUserId(data?.session?.user?.id || null);
    });
    return () => { alive = false; };
  }, []);

  const startDate = useMemo(() => {
    const days = Number(period);
    if (!days || days <= 0) return undefined;
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, [period]);

  const filters = useMemo(() => ({
    page,
    perPage: 25,
    search: debouncedSearch || undefined,
    outcome: outcomeFilter || undefined,
    startDate,
    createdBy: teamMode === '1' ? undefined : (userId || undefined),
    sortBy: 'started_at',
    sortOrder: 'desc',
  }), [page, debouncedSearch, outcomeFilter, startDate, teamMode, userId]);

  // No modo "minhas chamadas" espera o userId resolver antes de buscar — senao a
  // 1a query sai sem createdBy e traz o historico do time inteiro pro cache.
  const { data, isLoading } = useCrmCalls(filters, {
    enabled: teamMode === '1' || !!userId,
  });
  const deleteMutation = useDeleteCrmCall();

  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { setPage(1); }, [debouncedSearch, outcomeFilter, period, teamMode]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const columns = [
    {
      key: 'startedAt',
      label: 'Quando',
      render: (val) => (
        <span className="text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
          {formatDateTime(val)}
        </span>
      ),
    },
    {
      key: 'contact',
      label: 'Contato',
      render: (_, row) => {
        if (!row.contact) {
          return (
            <span className="text-xs text-slate-400 font-mono">{row.phoneDialed}</span>
          );
        }
        return (
          <div className="flex items-center gap-2.5 min-w-0">
            <CrmAvatar name={row.contact.name} color={row.contact.avatarColor} size="sm" />
            <div className="min-w-0">
              <div className="font-medium text-sm text-slate-800 dark:text-slate-200 truncate">{row.contact.name}</div>
              <div className="text-[11px] text-slate-400 font-mono truncate">{row.phoneDialed}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'company',
      label: 'Empresa',
      render: (_, row) => row.company?.name ? (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 min-w-0">
          <Building2 size={11} className="shrink-0" />
          <span className="truncate max-w-[160px]">{row.company.name}</span>
        </div>
      ) : <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'outcome',
      label: 'Resultado',
      render: (val) => {
        const o = val ? CALL_OUTCOMES[val] : null;
        if (!o) return <span className="text-slate-300 dark:text-slate-600">—</span>;
        return <CrmBadge variant={o.variant} size="sm">{o.label}</CrmBadge>;
      },
    },
    {
      key: 'durationSeconds',
      label: 'Duracao',
      render: (val) => (
        <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">{formatSeconds(val)}</span>
      ),
    },
    {
      key: 'notes',
      label: 'Notas',
      render: (val) => val ? (
        <div className="flex items-start gap-1.5 max-w-[260px]">
          <FileText size={11} className="text-slate-400 mt-0.5 shrink-0" />
          <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{val}</span>
        </div>
      ) : <span className="text-slate-300 dark:text-slate-600">—</span>,
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <button
          onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
          title="Excluir"
          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors md:opacity-0 md:group-hover:opacity-100"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div>
      <CrmPageHeader
        title="Historico de chamadas"
        subtitle="Todas as ligacoes registradas pelo discador"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Link
              to="/crm/discador"
              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 px-2.5 py-1.5 bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <ArrowLeft size={14} /> Voltar ao discador
            </Link>

            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar numero ou notas..."
                className="pl-8 pr-7 py-1.5 text-sm bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-fyness-primary text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>

            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="text-xs bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
            >
              {PERIODS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>

            <select
              value={outcomeFilter}
              onChange={(e) => setOutcomeFilter(e.target.value)}
              className="text-xs bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
            >
              <option value="">Todos resultados</option>
              {Object.entries(CALL_OUTCOMES).map(([k, o]) => (
                <option key={k} value={k}>{o.label}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 px-2.5 py-1.5 bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg cursor-pointer select-none">
              <input
                type="checkbox"
                checked={teamMode === '1'}
                onChange={(e) => setTeamMode(e.target.checked ? '1' : '')}
                className="accent-fyness-primary"
              />
              Time todo
            </label>
          </div>
        }
      />

      <CrmDataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        emptyMessage="Nenhuma chamada encontrada"
        emptyIcon={History}
        pagination={{ page, perPage: 25, total: data?.count || 0, onPageChange: setPage }}
      />

      <CrmConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir chamada"
        message="Tem certeza que deseja excluir este registro? Esta acao nao pode ser desfeita."
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default CrmCallHistoryPage;

/**
 * CrmProspectsPage - Gerador de Lista (estilo Exact Sales Searching).
 *
 * Layout: Sidebar de filtros na esquerda + Tabela de resultados na direita.
 * Fluxo: Preencher filtros → Gerar Lista → Selecionar → Enviar para Pipeline.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Crosshair, Search, Pencil, Trash2, X, Send, Loader2,
  CheckSquare, Square, MinusSquare, Building2,
  MapPin, Briefcase, Filter, DollarSign, Compass,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  RotateCw, Phone, Mail, User, Zap, List, Globe, Handshake, Users,
} from 'lucide-react';
import { REVENUE_RANGES, getCitiesByState } from '../data/mockProspects';
import { PARTNER_SEGMENT_OPTIONS, CLIENT_RANGES } from '../data/mockPartners';
import { CrmBadge, CrmConfirmDialog, CrmModal } from '../components/ui';
import { ProspectsInsightsPanel } from '../components/ProspectsInsightsPanel';
import ProspectingDashboard from '../components/po/ProspectingDashboard';
import {
  useCrmProspects,
  useDeleteCrmProspect,
  useUpdateCrmProspect,
  useSendToPipeline,
  useCrmPipelines,
  useEnsurePartnersPipeline,
} from '../hooks/useCrmQueries';

// ==================== CONSTANTES ====================

const SEGMENT_OPTIONS = [
  'Tecnologia', 'Educacao', 'Saude', 'Varejo', 'Industria', 'Servicos',
  'Financeiro', 'Construcao', 'Alimenticio', 'Logistica', 'Agronegocio', 'Outro',
];

const SIZE_MAP = { mei: 'MEI', me: 'ME', epp: 'EPP', media: 'Media', grande: 'Grande' };
const SIZE_OPTIONS = ['mei', 'me', 'epp', 'media', 'grande'];

const UF_OPTIONS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT',
  'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
];

const SOURCE_OPTIONS = [
  'Google Maps', 'LinkedIn', 'Indicacao', 'Site', 'Redes Sociais', 'Evento', 'Lista comprada', 'Outro',
];

const STATUS_MAP = {
  new: { label: 'Novo', variant: 'blue' },
  contacted: { label: 'Contatado', variant: 'yellow' },
  qualified: { label: 'Qualificado', variant: 'violet' },
  converted: { label: 'Convertido', variant: 'green' },
  discarded: { label: 'Descartado', variant: 'red' },
};

// ==================== HELPERS ====================

function formatPhone(val) {
  if (!val) return '';
  const clean = val.replace(/\D/g, '');
  if (clean.length === 11) return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  if (clean.length === 10) return clean.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3');
  return val;
}

// ==================== MODAL ENVIAR PARA PIPELINE ====================

function SendToPipelineModal({ open, onClose, selectedCount, selectedIds, onSuccess, prospectMode = 'leads' }) {
  const { data: pipelines = [], isLoading: loadingPipelines } = useCrmPipelines();
  const sendMutation = useSendToPipeline();
  const ensurePartnersPipeline = useEnsurePartnersPipeline();

  const [pipelineId, setPipelineId] = useState('');
  const [stageId, setStageId] = useState('');

  const selectedPipeline = pipelines.find(p => p.id === pipelineId);
  const stages = selectedPipeline?.stages || [];

  useEffect(() => {
    if (stages.length > 0) setStageId(stages[0].id);
    else setStageId('');
  }, [pipelineId]);

  // Auto-select "Parceiros" pipeline when in partners mode
  useEffect(() => {
    if (open) {
      if (prospectMode === 'partners' && pipelines.length > 0) {
        const partnerPipeline = pipelines.find(p => p.name === 'Parceiros');
        if (partnerPipeline) {
          setPipelineId(partnerPipeline.id);
        } else {
          // Create it on the fly, then select
          ensurePartnersPipeline.mutateAsync().then(() => {
            setPipelineId('');
          });
        }
      } else {
        setPipelineId('');
        setStageId('');
      }
    }
  }, [open, prospectMode, pipelines.length]);

  const handleConfirm = async () => {
    if (!pipelineId || !stageId) return;
    await sendMutation.mutateAsync({ prospectIds: selectedIds, pipelineId, stageId });
    onSuccess?.();
    onClose();
  };

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title="Enviar para Pipeline"
      size="sm"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!pipelineId || !stageId || sendMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-fyness-primary hover:bg-fyness-secondary text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            Converter {selectedCount} {prospectMode === 'partners' ? 'parceiro' : 'lead'}{selectedCount > 1 ? 's' : ''}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          <strong>{selectedCount}</strong> {prospectMode === 'partners' ? 'parceiro' : 'lead'}{selectedCount > 1 ? 's' : ''} ser{selectedCount > 1 ? 'ao' : 'a'} convertido{selectedCount > 1 ? 's' : ''}.
          Para cada {prospectMode === 'partners' ? 'parceiro' : 'lead'} sera criado: <strong>Empresa</strong>, <strong>Contato</strong> e <strong>Negocio</strong> no pipeline.
        </p>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pipeline</label>
          {loadingPipelines ? (
            <div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 size={14} className="animate-spin" /> Carregando...</div>
          ) : (
            <select value={pipelineId} onChange={(e) => setPipelineId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-fyness-primary focus:outline-none">
              <option value="">Selecione o pipeline...</option>
              {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
        </div>
        {stages.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estagio inicial</label>
            <select value={stageId} onChange={(e) => setStageId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-fyness-primary focus:outline-none">
              {stages.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}
      </div>
    </CrmModal>
  );
}

// ==================== MODAL EDITAR LEAD ====================

function EditLeadModal({ open, onClose, prospect }) {
  const updateMutation = useUpdateCrmProspect();
  const [form, setForm] = useState({});

  useEffect(() => {
    if (prospect) {
      setForm({
        companyName: prospect.companyName || '',
        contactName: prospect.contactName || '',
        phone: prospect.phone || '',
        email: prospect.email || '',
        cnpj: prospect.cnpj || '',
        segment: prospect.segment || '',
        size: prospect.size || '',
        city: prospect.city || '',
        state: prospect.state || '',
        position: prospect.position || '',
        source: prospect.source || '',
        website: prospect.website || '',
        notes: prospect.notes || '',
        status: prospect.status || 'new',
      });
    }
  }, [prospect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prospect) return;
    await updateMutation.mutateAsync({ id: prospect.id, updates: form });
    onClose();
  };

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));
  const inputCls = "w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-fyness-primary focus:outline-none";

  return (
    <CrmModal open={open} onClose={onClose} title="Editar Lead" size="lg"
      footer={
        <>
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={updateMutation.isPending || !form.companyName}
            className="px-4 py-2 text-sm bg-fyness-primary hover:bg-fyness-secondary text-white font-medium rounded-lg transition-colors disabled:opacity-50">
            {updateMutation.isPending ? 'Salvando...' : 'Salvar'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Empresa *</label>
          <input type="text" value={form.companyName || ''} onChange={e => set('companyName', e.target.value)} className={inputCls} required />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Contato</label>
          <input type="text" value={form.contactName || ''} onChange={e => set('contactName', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Telefone</label>
          <input type="text" value={form.phone || ''} onChange={e => set('phone', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Email</label>
          <input type="email" value={form.email || ''} onChange={e => set('email', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">CNPJ</label>
          <input type="text" value={form.cnpj || ''} onChange={e => set('cnpj', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Cargo</label>
          <input type="text" value={form.position || ''} onChange={e => set('position', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Segmento</label>
          <select value={form.segment || ''} onChange={e => set('segment', e.target.value)} className={inputCls}>
            <option value="">Sem segmento</option>
            {SEGMENT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Porte</label>
          <select value={form.size || ''} onChange={e => set('size', e.target.value)} className={inputCls}>
            <option value="">Sem porte</option>
            {SIZE_OPTIONS.map(s => <option key={s} value={s}>{SIZE_MAP[s]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Cidade</label>
          <input type="text" value={form.city || ''} onChange={e => set('city', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">UF</label>
          <select value={form.state || ''} onChange={e => set('state', e.target.value)} className={inputCls}>
            <option value="">Selecione</option>
            {UF_OPTIONS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Fonte</label>
          <select value={form.source || ''} onChange={e => set('source', e.target.value)} className={inputCls}>
            <option value="">Sem fonte</option>
            {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Website</label>
          <input type="text" value={form.website || ''} onChange={e => set('website', e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Status</label>
          <select value={form.status || 'new'} onChange={e => set('status', e.target.value)} className={inputCls}>
            {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">Observacoes</label>
          <textarea value={form.notes || ''} onChange={e => set('notes', e.target.value)} className={inputCls} rows={2} />
        </div>
      </form>
    </CrmModal>
  );
}

// ==================== PAGINA PRINCIPAL (Exact Sales Layout) ====================

export function CrmProspectsPage() {
  // Tabs
  const [activeTab, setActiveTab] = useState('list');

  // Modo prospeccao: leads ou parceiros
  const [prospectMode, setProspectMode] = useState('leads');
  const isPartners = prospectMode === 'partners';

  // Filtros
  const [segment, setSegment] = useState('');
  const [size, setSize] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [revenueRange, setRevenueRange] = useState('');
  const [clientRange, setClientRange] = useState('');

  // Cidades disponiveis baseadas no estado selecionado
  const cityOptions = useMemo(() => getCitiesByState(state || null), [state]);

  // Controle de geracao
  const [generated, setGenerated] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState({});

  // Paginacao & sort
  const [page, setPage] = useState(1);
  const perPage = 30;
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  // Selecao
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Modais
  const [editProspect, setEditProspect] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [pipelineModalOpen, setPipelineModalOpen] = useState(false);

  const filters = generated ? {
    page,
    perPage,
    search: appliedFilters.search || undefined,
    segment: appliedFilters.segment || undefined,
    size: appliedFilters.size || undefined,
    state: appliedFilters.state || undefined,
    city: appliedFilters.city || undefined,
    revenueRange: appliedFilters.revenueRange || undefined,
    clientRange: appliedFilters.clientRange || undefined,
    prospectType: isPartners ? 'partner' : undefined,
    sortBy: sortConfig.key === 'companyName' ? 'company_name' : sortConfig.key === 'contactName' ? 'contact_name' : sortConfig.key,
    sortOrder: sortConfig.direction,
  } : null;

  const analyticsFilters = generated ? {
    search: appliedFilters.search || undefined,
    segment: appliedFilters.segment || undefined,
    size: appliedFilters.size || undefined,
    state: appliedFilters.state || undefined,
    city: appliedFilters.city || undefined,
    revenueRange: appliedFilters.revenueRange || undefined,
    clientRange: appliedFilters.clientRange || undefined,
    prospectType: isPartners ? 'partner' : undefined,
  } : null;

  const { data, isLoading, isFetching } = useCrmProspects(filters || { page: 1, perPage: 1 });
  const deleteMutation = useDeleteCrmProspect();

  const prospects = generated ? (data?.data || []) : [];
  const total = generated ? (data?.count || 0) : 0;

  const activeCount = [segment, size, state, city, revenueRange, clientRange].filter(Boolean).length;

  // Reset filters when switching mode
  const switchMode = (mode) => {
    setProspectMode(mode);
    setSegment('');
    setSize('');
    setRevenueRange('');
    setClientRange('');
    setGenerated(false);
    setAppliedFilters({});
    setSelectedIds(new Set());
  };

  useEffect(() => { setSelectedIds(new Set()); }, [data]);

  const handleGenerate = () => {
    setAppliedFilters({ segment, size, state, city, search, revenueRange, clientRange });
    setPage(1);
    setGenerated(true);
    setSelectedIds(new Set());
  };

  const handleClear = () => {
    setSegment('');
    setSize('');
    setState('');
    setCity('');
    setSearch('');
    setRevenueRange('');
    setClientRange('');
    setGenerated(false);
    setAppliedFilters({});
    setSelectedIds(new Set());
  };

  const handleSort = useCallback((key) => {
    setSortConfig(prev =>
      prev.key === key
        ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' }
    );
  }, []);

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === prospects.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(prospects.map(p => p.id)));
  };

  const allSelected = prospects.length > 0 && selectedIds.size === prospects.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < prospects.length;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const totalPages = Math.ceil(total / perPage);

  const selectCls = "w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all";

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-0">

      {/* ==================== SIDEBAR FILTROS (Esquerda) — oculta na aba P.O. ==================== */}
      <aside className={`w-72 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/50 flex flex-col overflow-hidden rounded-l-xl ${activeTab === 'po' ? 'hidden' : ''}`}>
        {/* Header sidebar */}
        <div className="px-4 py-3.5 border-b border-slate-200 dark:border-slate-700/50 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-white/90" />
            <span className="text-sm font-bold text-white">Filtros de Busca</span>
          </div>
          <p className="text-[11px] text-blue-100/70 mt-0.5">Defina o perfil da prospeccao</p>
        </div>

        {/* Toggle Leads / Parceiros */}
        <div className="px-4 pt-4 pb-1">
          <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
            <button
              onClick={() => switchMode('leads')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
                !isPartners
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Users size={13} />
              Leads
            </button>
            <button
              onClick={() => switchMode('partners')}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-all ${
                isPartners
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              <Handshake size={13} />
              Parceiros
            </button>
          </div>
        </div>

        {/* Filtros empilhados */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Busca */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <Search size={12} />
              Buscar
            </label>
            <input
              type="text"
              placeholder="Empresa, contato, telefone..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleGenerate(); }}
              className={selectCls}
            />
          </div>

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Segmento / Categoria */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              {isPartners ? <Handshake size={12} /> : <Briefcase size={12} />}
              {isPartners ? 'Categoria' : 'Segmento'}
            </label>
            <select value={segment} onChange={e => setSegment(e.target.value)} className={selectCls}>
              <option value="">{isPartners ? 'Todas as categorias' : 'Todos os segmentos'}</option>
              {(isPartners ? PARTNER_SEGMENT_OPTIONS : SEGMENT_OPTIONS).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Porte — somente no modo Leads */}
          {!isPartners && (
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <Building2 size={12} />
              Porte da Empresa
            </label>
            <select value={size} onChange={e => setSize(e.target.value)} className={selectCls}>
              <option value="">Todos os portes</option>
              {SIZE_OPTIONS.map(s => <option key={s} value={s}>{SIZE_MAP[s]}</option>)}
            </select>
          </div>
          )}

          {/* Estado (UF) */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <MapPin size={12} />
              Estado (UF)
            </label>
            <select value={state} onChange={e => { setState(e.target.value); setCity(''); }} className={selectCls}>
              <option value="">Todos os estados</option>
              {UF_OPTIONS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>

          {/* Cidade (dependente do Estado) */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <MapPin size={12} />
              Cidade
            </label>
            <select
              value={city}
              onChange={e => setCity(e.target.value)}
              className={selectCls}
              disabled={!state}
            >
              <option value="">{state ? 'Todo o estado' : 'Selecione o estado primeiro'}</option>
              {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Faturamento (leads) ou Qtd Clientes (parceiros) */}
          {isPartners ? (
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <Users size={12} />
              Qtd. de Clientes
            </label>
            <select value={clientRange} onChange={e => setClientRange(e.target.value)} className={selectCls}>
              <option value="">Todas as faixas</option>
              {CLIENT_RANGES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>
          ) : (
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              <DollarSign size={12} />
              Faturamento Anual
            </label>
            <select value={revenueRange} onChange={e => setRevenueRange(e.target.value)} className={selectCls}>
              <option value="">Todas as faixas</option>
              {REVENUE_RANGES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>
          </div>
          )}


        </div>

        {/* Botoes sidebar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 space-y-2 bg-slate-50 dark:bg-slate-800/30">
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
          >
            {isFetching && generated ? <Loader2 size={16} className="animate-spin" /> : activeTab === 'list' ? <Crosshair size={16} /> : <Compass size={16} />}
            {activeTab === 'list' ? 'Gerar Lista' : 'Pesquisar'}
          </button>
          {activeCount > 0 && (
            <button
              onClick={handleClear}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={12} />
              Limpar filtros ({activeCount})
            </button>
          )}
        </div>
      </aside>

      {/* ==================== AREA PRINCIPAL (Direita) ==================== */}
      <main className={`flex-1 flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 ${activeTab === 'po' ? 'rounded-xl' : 'rounded-r-xl'}`}>

        {/* Tab Bar */}
        <div className="flex items-center border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 shrink-0">
          <button
            onClick={() => { setActiveTab('list'); setGenerated(false); setAppliedFilters({}); setSelectedIds(new Set()); }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'list'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <List size={16} />
            Gerar Lista
          </button>
          <button
            onClick={() => { setActiveTab('opportunities'); setGenerated(false); setAppliedFilters({}); setSelectedIds(new Set()); }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'opportunities'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Compass size={16} />
            Encontro de Oportunidades
          </button>
          <button
            onClick={() => { setActiveTab('po'); setGenerated(false); setAppliedFilters({}); setSelectedIds(new Set()); }}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'po'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Globe size={16} />
            P.O.
          </button>
        </div>

        {/* P.O. Dashboard — aba independente, mapa ocupa tudo */}
        {activeTab === 'po' ? (
          <div className="flex-1 overflow-hidden p-2 flex flex-col">
            <ProspectingDashboard />
          </div>
        ) : (
        <>
        {/* Header da area de resultados */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {!generated
                ? (activeTab === 'list' ? 'Resultados' : 'Pesquisa de Mercado')
                : isLoading
                  ? 'Buscando...'
                  : activeTab === 'list'
                    ? `${total} ${isPartners ? 'parceiro' : 'lead'}${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`
                    : `${total} empresa${total !== 1 ? 's' : ''} analisada${total !== 1 ? 's' : ''}`
              }
            </h2>
            {generated && (
              <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
                {appliedFilters.segment && <CrmBadge variant="violet" size="sm">{appliedFilters.segment}</CrmBadge>}
                {appliedFilters.size && <CrmBadge variant="slate" size="sm">{SIZE_MAP[appliedFilters.size]}</CrmBadge>}
                {appliedFilters.state && <CrmBadge variant="blue" size="sm">{appliedFilters.state}</CrmBadge>}
                {appliedFilters.city && <CrmBadge variant="sky" size="sm">{appliedFilters.city}</CrmBadge>}
                {appliedFilters.revenueRange && <CrmBadge variant="success" size="sm">{REVENUE_RANGES.find(r => r.key === appliedFilters.revenueRange)?.label}</CrmBadge>}
                {appliedFilters.clientRange && <CrmBadge variant="success" size="sm">{CLIENT_RANGES.find(r => r.key === appliedFilters.clientRange)?.label}</CrmBadge>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeTab === 'list' && selectedIds.size > 0 && (
              <button
                onClick={() => setPipelineModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                <Send size={14} />
                Enviar para Pipeline ({selectedIds.size})
              </button>
            )}
            {generated && (
              <button
                onClick={handleGenerate}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Atualizar"
              >
                <RotateCw size={16} className={isFetching ? 'animate-spin' : ''} />
              </button>
            )}
          </div>
        </div>

        {/* Conteudo */}
        {!generated ? (
          /* Estado inicial - antes de gerar */
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <div className="w-20 h-20 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mx-auto mb-5">
                {activeTab === 'list'
                  ? <Crosshair size={40} className="text-blue-400 dark:text-blue-500" />
                  : <Compass size={40} className="text-blue-400 dark:text-blue-500" />
                }
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
                {activeTab === 'list' ? 'Gerador de Lista' : 'Encontro de Oportunidades'}
              </h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed">
                {activeTab === 'list'
                  ? <>Use os filtros ao lado para definir o perfil ideal de prospeccao. Selecione segmento, porte, regiao e clique em <strong className="text-slate-600 dark:text-slate-300">"Gerar Lista"</strong>.</>
                  : <>Pesquise o mercado por cidade, porte e segmento. Analise a distribuicao de oportunidades e identifique nichos. Clique em <strong className="text-slate-600 dark:text-slate-300">"Pesquisar"</strong>.</>
                }
              </p>
            </div>
          </div>
        ) : activeTab === 'opportunities' ? (
          /* Encontro de Oportunidades: Dashboard analitico full */
          <div className="flex-1 overflow-auto p-4">
            <ProspectsInsightsPanel filters={analyticsFilters} />
          </div>
        ) : (
          /* Gerar Lista: Tabela de prospeccao */
          <div className="flex-1 overflow-auto">
            {/* Tabela de resultados */}
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-slate-200 dark:border-slate-700/50 bg-slate-100 dark:bg-slate-800/80">
                  <th className="px-3 py-2.5 w-10">
                    <button onClick={toggleSelectAll} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      {allSelected ? <CheckSquare size={16} /> : someSelected ? <MinusSquare size={16} /> : <Square size={16} />}
                    </button>
                  </th>
                  {[
                    { key: 'companyName', label: 'Empresa', sortable: true },
                    { key: 'segment', label: isPartners ? 'Categoria' : 'Segmento', sortable: true },
                    { key: 'contactName', label: 'Contato', sortable: true },
                    { key: 'phone', label: 'Telefone' },
                    { key: 'email', label: 'Email' },
                    ...(isPartners ? [] : [{ key: 'size', label: 'Porte' }]),
                    { key: 'city', label: 'Cidade/UF' },
                    { key: '_actions', label: '' },
                  ].map(col => (
                    <th
                      key={col.key}
                      className={`px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ${col.sortable ? 'cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200' : ''}`}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      <div className="flex items-center gap-1">
                        {col.label}
                        {col.sortable && sortConfig?.key === col.key && (
                          sortConfig.direction === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 bg-white dark:bg-slate-900">
                {isLoading ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      {Array.from({ length: isPartners ? 8 : 9 }).map((_, ci) => (
                        <td key={ci} className="px-3 py-3"><div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-3/4" /></td>
                      ))}
                    </tr>
                  ))
                ) : prospects.length === 0 ? (
                  <tr>
                    <td colSpan={isPartners ? 8 : 9} className="px-4 py-16 text-center">
                      <Crosshair size={36} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                      <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum {isPartners ? 'parceiro' : 'lead'} encontrado</p>
                      <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Ajuste os filtros ao lado e tente novamente</p>
                    </td>
                  </tr>
                ) : (
                  prospects.map(p => {
                    const isSelected = selectedIds.has(p.id);
                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors ${isSelected ? 'bg-blue-50/60 dark:bg-blue-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                      >
                        <td className="px-3 py-2.5">
                          <button onClick={() => toggleSelect(p.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                            {isSelected ? <CheckSquare size={16} className="text-blue-600" /> : <Square size={16} />}
                          </button>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{p.companyName}</div>
                        </td>
                        <td className="px-3 py-2.5">
                          {p.segment ? (
                            <CrmBadge variant="violet" size="sm">{p.segment}</CrmBadge>
                          ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="min-w-0">
                            <div className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{p.contactName || '—'}</div>
                            {p.position && <span className="text-[11px] text-slate-400">{p.position}</span>}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          {p.phone ? (
                            <a href={`tel:${p.phone}`} className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 whitespace-nowrap text-xs">
                              <Phone size={11} className="shrink-0" />
                              {formatPhone(p.phone)}
                            </a>
                          ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          {p.email ? (
                            <a href={`mailto:${p.email}`} className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 truncate max-w-[160px] text-xs">
                              <Mail size={11} className="shrink-0" />
                              {p.email}
                            </a>
                          ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                        </td>
                        {!isPartners && (
                        <td className="px-3 py-2.5">
                          {SIZE_MAP[p.size] ? (
                            <span className="text-xs text-slate-600 dark:text-slate-300">{SIZE_MAP[p.size]}</span>
                          ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                        </td>
                        )}
                        <td className="px-3 py-2.5">
                          {(p.city || p.state) ? (
                            <span className="text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">{[p.city, p.state].filter(Boolean).join('/')}</span>
                          ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                        </td>
                        <td className="px-3 py-2.5 w-16">
                          <div className="flex items-center gap-0.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditProspect(p); }}
                              className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title="Editar"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteTarget(p); }}
                              className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                              title="Excluir"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginacao (somente aba Gerar Lista) */}
        {activeTab === 'list' && generated && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {((page - 1) * perPage) + 1}–{Math.min(page * perPage, total)} de {total}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-slate-600 dark:text-slate-400 px-2">{page} / {totalPages}</span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
        </>
        )}
      </main>

      {/* ==================== MODAIS ==================== */}
      <EditLeadModal
        open={!!editProspect}
        onClose={() => setEditProspect(null)}
        prospect={editProspect}
      />

      <SendToPipelineModal
        open={pipelineModalOpen}
        onClose={() => setPipelineModalOpen(false)}
        selectedCount={selectedIds.size}
        selectedIds={[...selectedIds]}
        onSuccess={() => setSelectedIds(new Set())}
        prospectMode={prospectMode}
      />

      <CrmConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir lead"
        message={`Tem certeza que deseja excluir "${deleteTarget?.companyName}" da lista?`}
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default CrmProspectsPage;

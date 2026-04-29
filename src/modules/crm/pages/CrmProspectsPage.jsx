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
  MapPin, Briefcase, Filter, DollarSign,
  ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  RotateCw, Phone, Smartphone, MessageCircle, Mail, User, Zap, List, Globe, Handshake, Users,
  ExternalLink, Sparkles, Instagram, Hash,
} from 'lucide-react';
import { CITIES_BY_STATE } from '../data/brazilCities';
import { getDddsByState } from '../data/brazilDdds';
import { GOOGLE_SEGMENT_GROUPS, GOOGLE_PARTNER_SEGMENT_GROUPS } from '../data/googleSegments';
import { tempoDesdeAbertura } from '../../../lib/dateRelative';
import { CrmBadge, CrmConfirmDialog, CrmModal } from '../components/ui';
import ProspectingDashboard from '../components/po/ProspectingDashboard';
import {
  useCrmProspects,
  useDeleteCrmProspect,
  useUpdateCrmProspect,
  useSendToPipeline,
  useCrmPipelines,
  useEnsurePartnersPipeline,
} from '../hooks/useCrmQueries';
import { enrichProspectWithGoogle } from '../../../lib/googlePlacesService';
import { lookupCnpjByName } from '../services/crmProspectsService';
import { getUsage, setCdBalance } from '../../../lib/usageTracker';

// ==================== CONSTANTES ====================

const REVENUE_RANGES = [
  { key: 'ate100k', label: 'Ate R$ 100 mil/ano', min: 0, max: 100000 },
  { key: '100k-500k', label: 'R$ 100 mil - 500 mil/ano', min: 100000, max: 500000 },
  { key: '500k-1m', label: 'R$ 500 mil - 1 milhao/ano', min: 500000, max: 1000000 },
  { key: '1m-5m', label: 'R$ 1M - 5M/ano', min: 1000000, max: 5000000 },
  { key: '5m-50m', label: 'R$ 5M - 50M/ano', min: 5000000, max: 50000000 },
  { key: 'acima50m', label: 'Acima de R$ 50M/ano', min: 50000000, max: Infinity },
];

const CLIENT_RANGES = [
  { key: 'ate50', label: 'Ate 50 clientes', min: 0, max: 50 },
  { key: '50-200', label: '50 - 200 clientes', min: 50, max: 200 },
  { key: '200-500', label: '200 - 500 clientes', min: 200, max: 500 },
  { key: '500-1000', label: '500 - 1.000 clientes', min: 500, max: 1000 },
  { key: '1000mais', label: '1.000+ clientes', min: 1000, max: Infinity },
];

const PARTNER_SEGMENT_OPTIONS = ['Contabilidade', 'Financeira', 'Advocacia', 'Associacao'];

function getCitiesByState(uf) {
  if (uf) return (CITIES_BY_STATE[uf] || []).slice().sort();
  return [...new Set(Object.values(CITIES_BY_STATE).flat())].sort();
}

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

// Padrao brasileiro: celular tem 11 digitos com 9 inicial apos o DDD; fixo tem 10
function detectPhoneType(val) {
  if (!val) return null;
  const clean = val.replace(/\D/g, '');
  const local = clean.length >= 12 && clean.startsWith('55') ? clean.slice(2) : clean;
  if (local.length === 11 && local[2] === '9') return 'mobile';
  if (local.length === 10) return 'landline';
  if (local.length === 9 && local[0] === '9') return 'mobile';
  if (local.length === 8) return 'landline';
  return null;
}

function whatsappUrl(val) {
  if (!val) return null;
  const clean = val.replace(/\D/g, '');
  if (clean.length < 10) return null;
  const withCountry = clean.startsWith('55') && clean.length >= 12 ? clean : `55${clean}`;
  return `https://wa.me/${withCountry}`;
}

function abbreviateNatureza(natureza) {
  if (!natureza) return '';
  const n = natureza.toUpperCase();
  if (n.includes('MICROEMPRESARIO INDIVIDUAL') || /\bMEI\b/.test(n)) return 'MEI';
  if (n.includes('LIMITADA')) return 'LTDA';
  if (n.includes('ANONIMA') || n.includes('ANÔNIMA')) return 'S.A.';
  if (n.includes('EMPRESARIO INDIVIDUAL') || n.includes('EMPRESÁRIO INDIVIDUAL')) return 'EI';
  if (n.includes('EIRELI') || n.includes('INDIVIDUAL DE RESPONSABILIDADE')) return 'EIRELI';
  if (n.includes('COOPERATIVA')) return 'COOP';
  if (n.includes('ASSOCIACAO') || n.includes('ASSOCIAÇÃO')) return 'ASSOC';
  if (n.includes('FUNDACAO') || n.includes('FUNDAÇÃO')) return 'FUND';
  return natureza.length > 18 ? natureza.slice(0, 18) + '…' : natureza;
}

// ==================== MODAL ENVIAR PARA PIPELINE ====================

function SendToPipelineModal({ open, onClose, selectedCount, selectedProspects, onSuccess, prospectMode = 'leads' }) {
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
    await sendMutation.mutateAsync({ prospects: selectedProspects, pipelineId, stageId });
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

  // Fonte de busca: Google Places (default — barato, ja verificado) vs Casa
  // dos Dados (mais dados estruturais, mas custa por CNPJ retornado).
  const [searchSource, setSearchSource] = useState('google');
  const isGoogleSearch = searchSource === 'google';

  // Token de paginacao do Google (substitui `page` quando em modo Google)
  const [googlePageToken, setGooglePageToken] = useState('');

  // Filtros
  const [segment, setSegment] = useState('');
  const [size, setSize] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [ddd, setDdd] = useState('');
  const [filterMode, setFilterMode] = useState('city'); // 'city' | 'ddd'
  const [search, setSearch] = useState('');
  const [revenueRange, setRevenueRange] = useState('');
  const [clientRange, setClientRange] = useState('');

  // Cidades / DDDs disponiveis baseados no estado selecionado
  const cityOptions = useMemo(() => getCitiesByState(state || null), [state]);
  const dddOptions = useMemo(() => getDddsByState(state || null), [state]);

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

  // Enriquecimento Google Places — Map<prospectId, enrichedData|'miss'|'loading'>
  const [enrichments, setEnrichments] = useState(() => new Map());
  const [enrichingAll, setEnrichingAll] = useState(false);

  // Enriquecimento Casa dos Dados em modo Google-first
  // Map<prospectId, cdData|'miss'|'loading'>. Traz dono (sócio) + CNPJ + porte.
  const [cdEnrichments, setCdEnrichments] = useState(() => new Map());

  // Filtro display-only: mostrar apenas leads com celular (Casa dos Dados ou Google).
  // Default ON — Google enriquecimento roda em background e os leads cujo
  // numero passa a ser celular (do Google Meu Negocio) vao surgindo na lista.
  const [whatsappOnly, setWhatsappOnly] = useState(true);

  // Tracker de uso de API (Google + Casa Dados) com auto-refresh
  const [usage, setUsage] = useState(() => getUsage());
  useEffect(() => {
    const onUpdate = () => setUsage(getUsage());
    window.addEventListener('usage-tracker-update', onUpdate);
    return () => window.removeEventListener('usage-tracker-update', onUpdate);
  }, []);

  const filters = generated ? (
    isGoogleSearch
      ? {
          // Modo Google-first: filtros simplificados, paginacao por pageToken
          source: 'google',
          segment: appliedFilters.segment || undefined,
          city: appliedFilters.city || undefined,
          state: appliedFilters.state || undefined,
          pageToken: googlePageToken || undefined,
        }
      : {
          page,
          perPage,
          search: appliedFilters.search || undefined,
          segment: appliedFilters.segment || undefined,
          size: appliedFilters.size || undefined,
          state: appliedFilters.state || undefined,
          // Mutuamente exclusivos: cidade OU DDD (escolha do usuario via filterMode)
          city: appliedFilters.filterMode === 'city' ? (appliedFilters.city || undefined) : undefined,
          ddd:  appliedFilters.filterMode === 'ddd'  ? (appliedFilters.ddd  || undefined) : undefined,
          revenueRange: appliedFilters.revenueRange || undefined,
          clientRange: appliedFilters.clientRange || undefined,
          prospectType: isPartners ? 'partner' : undefined,
          sortBy: sortConfig.key === 'companyName' ? 'company_name' : sortConfig.key === 'contactName' ? 'contact_name' : sortConfig.key,
          sortOrder: sortConfig.direction,
        }
  ) : null;

  const { data, isLoading, isFetching } = useCrmProspects(filters);
  const deleteMutation = useDeleteCrmProspect();

  // Acumulamos prospects ao longo das pages — modelo "carregar mais" em vez de
  // paginacao tradicional. Filtros (WhatsApp etc.) podem reduzir muito o
  // visivel, e a gente quer sempre ter 15+ leads na tela sem o usuario clicar.
  const [accumulated, setAccumulated] = useState([]);
  const [autoLoading, setAutoLoading] = useState(false);
  const MAX_AUTO_PAGES = 3;
  const TARGET_VISIBLE = 15;

  // Reset do acumulado quando filtros aplicados ou fonte mudam
  useEffect(() => {
    setAccumulated([]);
    setAutoLoading(false);
    setGooglePageToken('');
  }, [appliedFilters, isPartners, searchSource]);

  // Append sempre que vier nova page. Dedup por CNPJ (CD) ou googlePlaceId (Google).
  useEffect(() => {
    if (!data?.data?.length) return;
    setAccumulated(prev => {
      const seenIds = new Set(prev.map(p => p.id).filter(Boolean));
      const fresh = data.data.filter(p => p.id && !seenIds.has(p.id));
      return fresh.length > 0 ? [...prev, ...fresh] : prev;
    });
    setAutoLoading(false);
  }, [data]);

  const prospects = generated ? accumulated : [];
  const total = generated ? (data?.count || 0) : 0;
  const totalPages = Math.ceil(total / perPage);
  // Em modo Google: continua tendo mais se a ultima resposta veio com nextPageToken
  const hasMore = isGoogleSearch ? !!data?.nextPageToken : page < totalPages;

  const activeCount = [
    segment,
    size,
    state,
    filterMode === 'city' ? city : '',
    filterMode === 'ddd'  ? ddd  : '',
    revenueRange,
    clientRange,
  ].filter(Boolean).length;

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

  // Reset selecao + enrichments apenas quando filtros mudam (nova busca);
  // NAO em cada page (porque acumulamos prospects e enrichments entre pages)
  useEffect(() => {
    setSelectedIds(new Set());
    setEnrichments(new Map());
    setCdEnrichments(new Map());
  }, [appliedFilters, isPartners]);

  // Auto-enriquecimento: a cada vez que `accumulated` cresce (lista nova ou
  // page extra carregada), dispara Google em background. Cache de 30 dias por
  // CNPJ no localStorage evita custo repetido para CNPJs ja vistos.
  useEffect(() => {
    if (!generated || accumulated.length === 0) return;
    if (isGoogleSearch) return; // em modo Google-first o lead ja vem com phone, sem enrichment
    const t = setTimeout(() => { enrichAll(); }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accumulated.length, isGoogleSearch]);

  // Auto-enriquecimento Casa dos Dados em modo Google-first
  // Pra cada lead Google, busca CD por nome+UF e traz nome do socio + CNPJ + porte.
  // Vendedor consegue ligar pedindo "falar com Sr. Joao" em vez de "responsavel".
  useEffect(() => {
    if (!generated || !isGoogleSearch || accumulated.length === 0) return;
    let cancelled = false;

    const run = async () => {
      const queue = accumulated.filter(p => !cdEnrichments.has(p.id) && p.companyName);
      if (queue.length === 0) return;

      // Concorrencia 5 paralela — nao bombardeia CD nem trava UI
      const CONC = 5;
      for (let i = 0; i < queue.length; i += CONC) {
        if (cancelled) return;
        const batch = queue.slice(i, i + CONC);

        // Marca como loading antes de disparar
        setCdEnrichments(prev => {
          const next = new Map(prev);
          batch.forEach(p => next.set(p.id, 'loading'));
          return next;
        });

        const results = await Promise.allSettled(
          batch.map(p => lookupCnpjByName(p.companyName, p.state, p.city))
        );

        if (cancelled) return;
        setCdEnrichments(prev => {
          const next = new Map(prev);
          batch.forEach((p, idx) => {
            const r = results[idx];
            next.set(p.id, r.status === 'fulfilled' && r.value ? r.value : 'miss');
          });
          return next;
        });
      }
    };

    const timer = setTimeout(run, 250);
    return () => { cancelled = true; clearTimeout(timer); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accumulated.length, isGoogleSearch]);

  const enrichOne = useCallback(async (prospect) => {
    if (!prospect?.id) return;
    setEnrichments(prev => {
      const next = new Map(prev);
      next.set(prospect.id, 'loading');
      return next;
    });
    const result = await enrichProspectWithGoogle(prospect);
    setEnrichments(prev => {
      const next = new Map(prev);
      next.set(prospect.id, result || 'miss');
      return next;
    });
  }, []);

  const enrichAll = useCallback(async () => {
    if (enrichingAll) return;
    setEnrichingAll(true);
    try {
      // Concorrencia controlada: 5 paralelos (browser + Google ambos aguentam,
      // mas mantemos baixo pra nao explodir quota nem rate limit)
      const queue = prospects.filter(p => !enrichments.has(p.id));
      const CONCURRENCY = 5;
      for (let i = 0; i < queue.length; i += CONCURRENCY) {
        const batch = queue.slice(i, i + CONCURRENCY);
        await Promise.all(batch.map(enrichOne));
      }
    } finally {
      setEnrichingAll(false);
    }
  }, [prospects, enrichments, enrichOne, enrichingAll]);

  const enrichedCount = [...enrichments.values()].filter(v => v && v !== 'loading' && v !== 'miss').length;

  // Filtro display-only: leads cujo telefone efetivo (Google primeiro, depois Receita) seja celular.
  // Considera tambem todos os telefones extras (`phones[]`) da Receita.
  const visibleProspects = useMemo(() => {
    if (!whatsappOnly) return prospects;
    return prospects.filter(p => {
      const enr = enrichments.get(p.id);
      const enriched = enr && enr !== 'loading' && enr !== 'miss' ? enr : null;
      if (enriched?.phone && detectPhoneType(enriched.phone) === 'mobile') return true;
      if (detectPhoneType(p.phone) === 'mobile') return true;
      if ((p.phones || []).some(t => detectPhoneType(t) === 'mobile')) return true;
      return false;
    });
  }, [prospects, enrichments, whatsappOnly]);

  const hiddenByFilter = prospects.length - visibleProspects.length;

  const handleGenerate = () => {
    setAppliedFilters({ segment, size, state, city, ddd, filterMode, search, revenueRange, clientRange });
    setPage(1);
    setGenerated(true);
    setSelectedIds(new Set());
  };

  const handleClear = () => {
    setSegment('');
    setSize('');
    setState('');
    setCity('');
    setDdd('');
    setFilterMode('city');
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
    const allVisibleSelected = visibleProspects.length > 0 && visibleProspects.every(p => selectedIds.has(p.id));
    if (allVisibleSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(visibleProspects.map(p => p.id)));
  };

  const allSelected = visibleProspects.length > 0 && visibleProspects.every(p => selectedIds.has(p.id));
  const someSelected = selectedIds.size > 0 && !allSelected;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  // Helper unificado pra avancar pagina (CD: page++; Google: substitui pageToken)
  const loadNext = useCallback(() => {
    if (isGoogleSearch) {
      const token = data?.nextPageToken;
      if (token) setGooglePageToken(token);
    } else {
      setPage(p => p + 1);
    }
  }, [isGoogleSearch, data]);

  // Auto-load-more: quando filtro WhatsApp deixa visivel < target, busca proxima
  // page automaticamente ate cap de seguranca. Em modo Google, hit rate ja eh
  // alto entao auto-load nao costuma disparar.
  useEffect(() => {
    if (!generated || !whatsappOnly) return;
    if (autoLoading || isFetching || enrichingAll) return;
    if (visibleProspects.length >= TARGET_VISIBLE) return;
    if (!hasMore) return;
    if (!isGoogleSearch && page >= MAX_AUTO_PAGES) return;
    setAutoLoading(true);
    loadNext();
  }, [visibleProspects.length, whatsappOnly, autoLoading, isFetching, enrichingAll, hasMore, page, generated, isGoogleSearch, loadNext]);

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

          {/* Busca — somente CD */}
          {!isGoogleSearch && (
            <>
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
            </>
          )}

          {/* Segmento / Categoria */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
              {isPartners ? <Handshake size={12} /> : <Briefcase size={12} />}
              {isPartners ? 'Categoria' : 'Segmento'}
            </label>
            {isGoogleSearch ? (
              <select value={segment} onChange={e => setSegment(e.target.value)} className={selectCls} required>
                <option value="">{isPartners ? 'Selecione uma categoria...' : 'Selecione um segmento...'}</option>
                {(isPartners ? GOOGLE_PARTNER_SEGMENT_GROUPS : GOOGLE_SEGMENT_GROUPS).map(group => (
                  <optgroup key={group.label} label={group.label}>
                    {group.options.map(opt => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            ) : (
              <select value={segment} onChange={e => setSegment(e.target.value)} className={selectCls}>
                <option value="">{isPartners ? 'Todas as categorias' : 'Todos os segmentos'}</option>
                {(isPartners ? PARTNER_SEGMENT_OPTIONS : SEGMENT_OPTIONS).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </div>

          {/* Porte — somente CD */}
          {!isGoogleSearch && (
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

          {/* Cidade (Google) ou Cidade/DDD toggle (CD) */}
          {isGoogleSearch ? (
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
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {filterMode === 'ddd' ? <Hash size={12} /> : <MapPin size={12} />}
                  {filterMode === 'ddd' ? 'DDD' : 'Cidade'}
                </label>
                <div className="flex rounded-md bg-slate-100 dark:bg-slate-800 p-0.5">
                  <button
                    type="button"
                    onClick={() => { setFilterMode('city'); setDdd(''); }}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                      filterMode === 'city'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    Cidade
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFilterMode('ddd'); setCity(''); }}
                    className={`px-2 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                      filterMode === 'ddd'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    DDD
                  </button>
                </div>
              </div>
              {filterMode === 'city' ? (
                <select
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className={selectCls}
                  disabled={!state}
                >
                  <option value="">{state ? 'Todo o estado' : 'Selecione o estado primeiro'}</option>
                  {cityOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              ) : (
                <select
                  value={ddd}
                  onChange={e => setDdd(e.target.value)}
                  className={selectCls}
                  disabled={!state}
                >
                  <option value="">{state ? 'Todos os DDDs' : 'Selecione o estado primeiro'}</option>
                  {dddOptions.map(d => <option key={d} value={d}>({d})</option>)}
                </select>
              )}
            </div>
          )}

          {/* Capital Social — somente CD + leads */}
          {!isGoogleSearch && !isPartners && (
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5">
                <DollarSign size={12} />
                Capital Social
              </label>
              <select value={revenueRange} onChange={e => setRevenueRange(e.target.value)} className={selectCls}>
                <option value="">Todas as faixas</option>
                {REVENUE_RANGES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
              </select>
            </div>
          )}

          <hr className="border-slate-100 dark:border-slate-800" />

          {/* Toggle: apenas com WhatsApp (display-only filter) */}
          <div>
            <button
              type="button"
              onClick={() => setWhatsappOnly(v => !v)}
              className="w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                <MessageCircle size={12} className="text-[#25D366]" />
                Apenas com WhatsApp
              </span>
              <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                whatsappOnly ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}>
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${
                  whatsappOnly ? 'translate-x-[14px]' : 'translate-x-[2px]'
                }`} />
              </span>
            </button>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 px-2 mt-1 leading-snug">
              Esconde leads que só têm fixo. Após "Enriquecer com Google", muitos fixos viram celulares.
            </p>
          </div>

        </div>

        {/* Botoes sidebar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 space-y-2 bg-slate-50 dark:bg-slate-800/30">
          <button
            onClick={handleGenerate}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
          >
            {isFetching && generated ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
            Gerar Lista
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
        {/* Barra de uso/custo de APIs (Google + Casa Dados) */}
        <div className="flex items-center gap-3 px-5 py-1.5 text-[11px] border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 shrink-0">
          <span
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"
            title={`Mês ${usage.month}\nText Search (New) Pro Tier — cota free ~${usage.google.freeQuota.toLocaleString('pt-BR')} chamadas/mês\nUsadas: ${usage.google.calls}\nApós cota: R$ 0,16/chamada (~$0.032 USD)`}
          >
            <Globe size={11} className="text-blue-500" />
            <span className="font-medium">Google:</span>
            <span className="text-slate-700 dark:text-slate-200">{usage.google.calls} / {usage.google.freeQuota.toLocaleString('pt-BR')}</span>
            <span className="text-slate-400">free</span>
            {usage.google.billedCalls > 0 && (
              <span className="text-amber-600 dark:text-amber-400">+ R$ {usage.google.costBrl.toFixed(2)}</span>
            )}
          </span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"
            title={`Casa dos Dados — R$0,006 por lookup\nTotal mês: ${usage.cd.total} (${usage.cd.searches} buscas, ${usage.cd.lookups} lookups individuais)\nCusto estimado: R$${usage.cd.costBrl.toFixed(2)}`}
          >
            <Briefcase size={11} className="text-amber-500" />
            <span className="font-medium">Casa Dados:</span>
            <span className="text-slate-700 dark:text-slate-200">R$ {usage.cd.costBrl.toFixed(2)}</span>
            <span className="text-slate-400">· {usage.cd.balanceRemaining.toLocaleString('pt-BR')} de {usage.cd.balanceTotal.toLocaleString('pt-BR')} créditos</span>
            <button
              type="button"
              onClick={() => {
                const v = prompt('Saldo atual de créditos Casa dos Dados:', String(usage.cd.balanceTotal));
                if (v !== null) {
                  setCdBalance(v);
                  setUsage(getUsage());
                }
              }}
              className="ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              title="Ajustar saldo (após renovar plano ou comprar créditos)"
            >
              <Pencil size={9} />
            </button>
          </span>
          {/* Barra de progresso pequena pra Casa Dados */}
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden" title={`Casa Dados: ${usage.cd.pctUsed.toFixed(1)}% usado`}>
              <div
                className={`h-full transition-all ${
                  usage.cd.pctUsed > 90 ? 'bg-rose-500' :
                  usage.cd.pctUsed > 70 ? 'bg-amber-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${usage.cd.pctUsed}%` }}
              />
            </div>
          </div>
        </div>

        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-baseline gap-2 flex-wrap">
              {!generated ? (
                'Resultados'
              ) : isLoading ? (
                'Buscando...'
              ) : (
                <>
                  <span>
                    {visibleProspects.length} {isPartners ? 'parceiro' : 'lead'}{visibleProspects.length !== 1 ? 's' : ''}
                    {whatsappOnly ? ' com WhatsApp' : ' baixado' + (visibleProspects.length !== 1 ? 's' : '')}
                  </span>
                  {hiddenByFilter > 0 && whatsappOnly && (
                    <span className="text-[11px] font-normal text-amber-600 dark:text-amber-400" title="Esses leads tem so fixo. Desmarque 'Apenas com WhatsApp' no sidebar pra ver, ou clique em 'Enriquecer com Google' pra tentar achar celular.">
                      ({hiddenByFilter} fixo{hiddenByFilter > 1 ? 's' : ''} ocultos)
                    </span>
                  )}
                  {total > prospects.length && (
                    <span className="text-[11px] font-normal text-slate-400 dark:text-slate-500">
                      · {total.toLocaleString('pt-BR')} na base
                    </span>
                  )}
                </>
              )}
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
            {activeTab === 'list' && generated && prospects.length > 0 && (
              <button
                onClick={enrichAll}
                disabled={enrichingAll || enrichedCount === prospects.length}
                title="Busca telefone e site atualizados via Google Places (cache local 30 dias)"
                className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
              >
                {enrichingAll ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                {enrichingAll
                  ? `Enriquecendo... (${enrichedCount}/${prospects.length})`
                  : enrichedCount === prospects.length && prospects.length > 0
                    ? 'Tudo enriquecido'
                    : `Enriquecer com Google${enrichedCount > 0 ? ` (${enrichedCount}/${prospects.length})` : ''}`}
              </button>
            )}
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
                <Crosshair size={40} className="text-blue-400 dark:text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
                Gerador de Lista
              </h3>
              <p className="text-sm text-slate-400 dark:text-slate-500 leading-relaxed">
                Use os filtros ao lado para definir o perfil ideal de prospeccao. Selecione segmento, porte, regiao e clique em <strong className="text-slate-600 dark:text-slate-300">"Gerar Lista"</strong>.
              </p>
            </div>
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
                    { key: 'size', label: 'Porte' },
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
                      {Array.from({ length: 9 }).map((_, ci) => (
                        <td key={ci} className="px-3 py-3"><div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-3/4" /></td>
                      ))}
                    </tr>
                  ))
                ) : visibleProspects.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-16 text-center">
                      <Crosshair size={36} className="text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                      {prospects.length === 0 ? (
                        <>
                          <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum {isPartners ? 'parceiro' : 'lead'} encontrado</p>
                          <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Ajuste os filtros ao lado e tente novamente</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-slate-400 dark:text-slate-500">Todos os {prospects.length} resultados são fixo (sem WhatsApp)</p>
                          <p className="text-xs text-slate-300 dark:text-slate-600 mt-1">Desmarque "Apenas com WhatsApp" no sidebar ou clique em "Enriquecer com Google" pra tentar achar celular</p>
                        </>
                      )}
                    </td>
                  </tr>
                ) : (
                  visibleProspects.map(p => {
                    const isSelected = selectedIds.has(p.id);
                    // Em modo Google-first, mescla com dados CD enriquecidos (sócio, CNPJ, porte)
                    const cdEnr = cdEnrichments.get(p.id);
                    const cdLoading = cdEnr === 'loading';
                    const cdData = cdEnr && cdEnr !== 'loading' && cdEnr !== 'miss' ? cdEnr : null;
                    const m = {
                      cnpj:             p.cnpj             || cdData?.cnpj             || '',
                      contactName:      p.contactName      || cdData?.contactName      || '',
                      position:         p.position         || cdData?.position         || '',
                      size:             p.size             || cdData?.size             || '',
                      naturezaJuridica: p.naturezaJuridica || cdData?.naturezaJuridica || '',
                      dataAbertura:     p.dataAbertura     || cdData?.dataAbertura     || null,
                      simplesNacional:  p.simplesNacional  || cdData?.simplesNacional  || false,
                      socios:           p.socios?.length   ? p.socios   : (cdData?.socios   || []),
                      atividadesSecundarias: p.atividadesSecundarias?.length ? p.atividadesSecundarias : (cdData?.atividadesSecundarias || []),
                      cnaeDescricao:    p.cnaeDescricao    || cdData?.cnaeDescricao    || '',
                    };
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
                          <div className="font-medium text-slate-800 dark:text-slate-200" title={p.companyName}>{p.companyName}</div>
                          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1 flex-wrap">
                            {m.cnpj && <span className="font-mono select-all">{m.cnpj}</span>}
                            {m.dataAbertura && tempoDesdeAbertura(m.dataAbertura) && (
                              <>
                                {m.cnpj && <span className="opacity-50">·</span>}
                                <span title={`Aberta em ${new Date(m.dataAbertura).toLocaleDateString('pt-BR')}`}>{tempoDesdeAbertura(m.dataAbertura)}</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          {p.segment ? (
                            <span title={m.cnaeDescricao || p.segment}>
                              <CrmBadge variant="violet" size="sm">{p.segment}</CrmBadge>
                            </span>
                          ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                          {m.atividadesSecundarias?.length > 0 && (
                            <div
                              className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 cursor-help"
                              title={m.atividadesSecundarias.map(a => `${a.code}${a.description ? ' — ' + a.description : ''}`).join('\n')}
                            >
                              +{m.atividadesSecundarias.length} CNAE{m.atividadesSecundarias.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="min-w-0">
                            <div className="text-slate-700 dark:text-slate-300 truncate max-w-[150px] flex items-center gap-1" title={m.contactName}>
                              <span className={m.contactName ? '' : 'text-slate-300 dark:text-slate-600'}>{m.contactName || '—'}</span>
                              {cdLoading && <Loader2 size={10} className="animate-spin text-amber-500 shrink-0" />}
                            </div>
                            {m.position && <span className="text-[11px] text-slate-400">{m.position}</span>}
                            {m.socios?.length > 1 && (
                              <div
                                className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 cursor-help"
                                title={m.socios.map(s => `${s.name}${s.role ? ' (' + s.role + ')' : ''}${s.capitalPercent != null ? ' — ' + s.capitalPercent + '%' : ''}`).join('\n')}
                              >
                                +{m.socios.length - 1} sócio{m.socios.length - 1 > 1 ? 's' : ''}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          {(() => {
                            const enr = enrichments.get(p.id);
                            const isLoading = enr === 'loading';
                            const isMiss = enr === 'miss';
                            const enriched = enr && enr !== 'loading' && enr !== 'miss' ? enr : null;

                            // Escolhe o melhor telefone: prefere celular do Google, senao
                            // celular da Receita, senao qualquer um disponivel
                            const googlePhone = enriched?.phone || '';
                            const googleIsMobile = googlePhone && detectPhoneType(googlePhone) === 'mobile';
                            const cdPhone = p.phone || '';
                            const cdIsMobile = cdPhone && detectPhoneType(cdPhone) === 'mobile';

                            const phoneToShow = googleIsMobile ? googlePhone
                              : cdIsMobile ? cdPhone
                              : googlePhone || cdPhone;
                            const phoneSource = phoneToShow === googlePhone && googlePhone ? 'google' : 'receita';

                            if (!phoneToShow) {
                              return (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-slate-300 dark:text-slate-600">—</span>
                                  {isLoading && <Loader2 size={11} className="animate-spin text-blue-500" />}
                                  {isMiss && <span className="text-[9px] text-slate-400" title="Google nao encontrou esta empresa">no Google?</span>}
                                </div>
                              );
                            }

                            const type = detectPhoneType(phoneToShow);
                            const Icon = type === 'mobile' ? Smartphone : Phone;
                            const colorClass = type === 'mobile'
                              ? 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300'
                              : type === 'landline'
                                ? 'text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400'
                                : 'text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400';
                            const titleText = type === 'mobile'
                              ? 'Celular — pode ter WhatsApp'
                              : type === 'landline'
                                ? 'Fixo — sem WhatsApp'
                                : undefined;

                            return (
                              <div>
                                <div className="flex items-center gap-1.5 whitespace-nowrap">
                                  <a
                                    href={`tel:${phoneToShow}`}
                                    title={titleText}
                                    className={`flex items-center gap-1 text-xs ${colorClass}`}
                                  >
                                    <Icon size={11} className="shrink-0" />
                                    {formatPhone(phoneToShow)}
                                  </a>
                                  {type === 'mobile' && whatsappUrl(phoneToShow) && (
                                    <a
                                      href={whatsappUrl(phoneToShow)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      title="Abrir no WhatsApp"
                                      onClick={(e) => e.stopPropagation()}
                                      className="inline-flex items-center justify-center w-5 h-5 rounded text-[#25D366] hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                    >
                                      <MessageCircle size={12} className="shrink-0" />
                                    </a>
                                  )}
                                  {phoneSource === 'google' && (
                                    <span
                                      className="inline-flex items-center text-[8px] font-bold px-1 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                                      title="Telefone via Google Places — provavelmente mais atualizado"
                                    >
                                      GOOGLE
                                    </span>
                                  )}
                                  {isLoading && <Loader2 size={10} className="animate-spin text-blue-500" />}
                                </div>
                                {p.phones?.length > 1 && (
                                  <div
                                    className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 cursor-help"
                                    title={p.phones.map(t => {
                                      const tp = detectPhoneType(t);
                                      const tag = tp === 'mobile' ? 'cel' : tp === 'landline' ? 'fixo' : '?';
                                      return `${formatPhone(t)} [${tag}]`;
                                    }).join('\n')}
                                  >
                                    +{p.phones.length - 1} {phoneSource === 'google' ? '(Receita)' : ''}
                                  </div>
                                )}
                                {enriched?.website && (
                                  <a
                                    href={enriched.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    title={enriched.website}
                                    className="flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400 hover:underline mt-0.5 truncate max-w-[140px]"
                                  >
                                    <ExternalLink size={9} className="shrink-0" />
                                    {enriched.website.replace(/^https?:\/\//, '').replace(/\/$/, '').slice(0, 24)}
                                  </a>
                                )}
                                {enriched?.instagram && (
                                  <a
                                    href={enriched.instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    title={enriched.instagram}
                                    className="flex items-center gap-1 text-[10px] text-pink-600 dark:text-pink-400 hover:underline mt-0.5 truncate max-w-[140px]"
                                  >
                                    <Instagram size={9} className="shrink-0" />
                                    {enriched.instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@').replace(/[/?].*$/, '').slice(0, 24)}
                                  </a>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-3 py-2.5">
                          {p.email ? (
                            <div>
                              <a href={`mailto:${p.email}`} className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 truncate max-w-[160px] text-xs">
                                <Mail size={11} className="shrink-0" />
                                {p.email}
                              </a>
                              {p.emails?.length > 1 && (
                                <div
                                  className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 cursor-help"
                                  title={p.emails.join('\n')}
                                >
                                  +{p.emails.length - 1}
                                </div>
                              )}
                            </div>
                          ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                        </td>
                        <td className="px-3 py-2.5">
                          {SIZE_MAP[m.size] ? (
                            <div className="flex items-center gap-1 flex-wrap">
                              <span className="text-xs text-slate-600 dark:text-slate-300">{SIZE_MAP[m.size]}</span>
                              {m.simplesNacional && (
                                <span
                                  className="inline-flex items-center text-[9px] font-bold px-1 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                  title="Optante do Simples Nacional"
                                >
                                  SIMPLES
                                </span>
                              )}
                            </div>
                          ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                        </td>
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

        {/* Carregar mais — modelo infinite-scroll-on-click */}
        {activeTab === 'list' && generated && hasMore && (
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900 shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {accumulated.length} carregados {whatsappOnly && hiddenByFilter > 0 && `(${visibleProspects.length} visíveis após filtro)`}
              {!isGoogleSearch && ` de ~${total.toLocaleString('pt-BR')}`}
            </span>
            <button
              onClick={loadNext}
              disabled={isFetching || autoLoading}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isFetching || autoLoading ? <Loader2 size={12} className="animate-spin" /> : <ChevronDown size={12} />}
              {isFetching || autoLoading ? 'Carregando...' : `Carregar mais ${isGoogleSearch ? 20 : perPage}`}
            </button>
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
        selectedProspects={prospects
          .filter(p => selectedIds.has(p.id))
          .map(p => ({ ...p, enriched: enrichments.get(p.id) }))}
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

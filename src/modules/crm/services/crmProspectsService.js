import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { crmProspectSchema } from '../schemas/crmValidation';
import { createCrmCompany } from './crmCompaniesService';
import { createCrmContact } from './crmContactsService';
import { createCrmDeal } from './crmDealsService';
import { SEGMENT_TO_CNAE, CNAE_TO_SEGMENT, SIZE_TO_PORTE, PORTE_TO_SIZE, REVENUE_TO_CAPITAL, PARTNER_CATEGORY_TO_CNAE, CNAE_TO_PARTNER_CATEGORY, PARTNER_CATEGORY_LABELS } from '../data/cnaeMapping';

// API Casa dos Dados — chave obtida em https://portal.casadosdados.com.br
const CASA_DOS_DADOS_API_KEY = '3845f12c696f5a8cc50bded9fa6a5df0197604d95f74cb16915c8bdd43398ce22765050eeca421b8e8d06d232ace474ee936efb1d5cf6852b8a6283b1a7fee16';
const CASA_DOS_DADOS_URL = 'https://api.casadosdados.com.br/v5/cnpj/pesquisa?tipo_resultado=completo';

// ==================== TRANSFORMADOR ====================

export function dbToProspect(row) {
  if (!row) return null;
  return {
    id: row.id,
    companyName: row.company_name,
    contactName: row.contact_name || '',
    phone: row.phone || '',
    email: row.email || '',
    cnpj: row.cnpj || '',
    segment: row.segment || '',
    size: row.size || '',
    city: row.city || '',
    state: row.state || '',
    position: row.position || '',
    source: row.source || '',
    website: row.website || '',
    revenue: row.revenue || null,
    employees: row.employees || null,
    notes: row.notes || '',
    status: row.status || 'new',
    assignedTo: row.assigned_to || null,
    assignedMember: row.team_members ? {
      id: row.team_members.id,
      name: row.team_members.name,
      color: row.team_members.color,
    } : null,
    prospectType: row.prospect_type || 'lead',
    partnerCategory: row.partner_category || null,
    listName: row.list_name || '',
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || null,
  };
}

// ==================== CRUD VIA FACTORY ====================

const prospectService = createCRUDService({
  table: 'crm_prospects',
  localKey: 'crm_prospects',
  idPrefix: 'crm_prs',
  transform: dbToProspect,
  schema: crmProspectSchema,
  fieldMap: {
    companyName: 'company_name',
    contactName: 'contact_name',
    phone: 'phone',
    email: 'email',
    cnpj: 'cnpj',
    segment: 'segment',
    size: 'size',
    city: 'city',
    state: 'state',
    position: 'position',
    source: 'source',
    website: 'website',
    revenue: 'revenue',
    employees: 'employees',
    notes: 'notes',
    status: 'status',
    assignedTo: 'assigned_to',
    listName: 'list_name',
    prospectType: 'prospect_type',
    partnerCategory: 'partner_category',
  },
  orderBy: 'created_at',
  orderAsc: false,
});

// ==================== BUSCA VIA API (LEADS) ====================

function buildApiBody(filters) {
  const body = {
    situacao_cadastral: ['ATIVA'],
    limite: Math.min(filters.perPage || 50, 1000),
    pagina: filters.page || 1,
    mais_filtros: { somente_matriz: true, com_telefone: true, com_email: true },
  };

  // Segmento → CNAE
  if (filters.segment && filters.segment !== 'Outro' && SEGMENT_TO_CNAE[filters.segment]) {
    body.codigo_atividade_principal = SEGMENT_TO_CNAE[filters.segment];
    body.incluir_atividade_secundaria = true;
  }

  // Porte
  if (filters.size && SIZE_TO_PORTE[filters.size]) {
    const cfg = SIZE_TO_PORTE[filters.size];
    body.porte_empresa = { codigos: cfg.codigos };
    if (cfg.mei) body.mei = cfg.mei;
  }

  // Estado
  if (filters.state) body.uf = [filters.state.toLowerCase()];

  // Cidade
  if (filters.city) body.municipio = [filters.city.toUpperCase()];

  // Faturamento → capital social
  if (filters.revenueRange && REVENUE_TO_CAPITAL[filters.revenueRange]) {
    body.capital_social = REVENUE_TO_CAPITAL[filters.revenueRange];
  }

  // Busca textual
  if (filters.search) {
    body.busca_textual = [{
      texto: [filters.search],
      tipo_busca: 'radical',
      razao_social: true,
      nome_fantasia: true,
    }];
  }

  return body;
}

function guessSegmentFromCnae(cnaeCode) {
  if (!cnaeCode) return 'Outro';
  if (CNAE_TO_SEGMENT[cnaeCode]) return CNAE_TO_SEGMENT[cnaeCode];
  // Tenta por divisao (2 primeiros digitos)
  const div = cnaeCode.substring(0, 2);
  const divMap = {
    '01': 'Agronegocio', '02': 'Agronegocio', '03': 'Agronegocio',
    '10': 'Alimenticio', '11': 'Alimenticio', '56': 'Alimenticio',
    '41': 'Construcao', '42': 'Construcao', '43': 'Construcao',
    '45': 'Varejo', '46': 'Varejo', '47': 'Varejo',
    '49': 'Logistica', '50': 'Logistica', '51': 'Logistica', '52': 'Logistica',
    '62': 'Tecnologia', '63': 'Tecnologia',
    '64': 'Financeiro', '65': 'Financeiro', '66': 'Financeiro',
    '69': 'Servicos', '70': 'Servicos', '71': 'Servicos', '73': 'Servicos', '74': 'Servicos',
    '85': 'Educacao',
    '86': 'Saude', '87': 'Saude',
  };
  return divMap[div] || 'Outro';
}

function formatCnpj(cnpj) {
  if (!cnpj || cnpj.length !== 14) return cnpj || '';
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
}

function extractPhone(c) {
  // Casa dos Dados v5: contato_telefonico[].completo / ddd+numero
  const tel = c.contato_telefonico?.[0];
  if (tel) {
    if (tel.completo) return tel.completo;
    if (tel.ddd && tel.numero) return `(${tel.ddd}) ${tel.numero}`;
  }
  return '';
}

function extractEmail(c) {
  // Casa dos Dados v5: contato_email[].email
  const em = c.contato_email?.[0];
  if (em?.email) return em.email.toLowerCase();
  return '';
}

function transformApiCompany(c, index, { isPartner = false, partnerCategory = null } = {}) {
  const cnaeCode = c.atividade_principal?.codigo || c.cnae_fiscal_principal?.toString() || '';
  const isMei = c.mei?.optante === true;
  const porteCode = c.porte_empresa?.codigo || c.porte?.codigo || '05';

  const fantasia = c.nome_fantasia?.trim();
  const razao = c.razao_social?.trim() || '';
  const companyName = (fantasia && fantasia.length < razao.length && fantasia.length > 2) ? fantasia : razao;

  const socio = c.quadro_societario?.[0] || c.socios?.[0];

  // Para parceiros: detectar categoria pelo CNAE se nao foi informada
  let detectedCategory = partnerCategory || CNAE_TO_PARTNER_CATEGORY[cnaeCode] || null;
  // Se nao achou match exato, tentar por prefixo (5 digitos)
  if (!detectedCategory && cnaeCode && isPartner) {
    const prefix = cnaeCode.substring(0, 5);
    for (const [cat, codes] of Object.entries(PARTNER_CATEGORY_TO_CNAE)) {
      if (codes.some(c => c.startsWith(prefix))) { detectedCategory = cat; break; }
    }
    // Ultimo fallback: usar a categoria do filtro se existir
    if (!detectedCategory) detectedCategory = partnerCategory;
  }
  const categoryLabel = detectedCategory ? (PARTNER_CATEGORY_LABELS[detectedCategory] || detectedCategory) : '';

  return {
    id: `api_${c.cnpj}`,
    companyName,
    contactName: socio?.nome || socio?.nome_socio || '',
    phone: extractPhone(c),
    email: extractEmail(c),
    cnpj: formatCnpj(c.cnpj),
    segment: isPartner ? categoryLabel : guessSegmentFromCnae(cnaeCode),
    size: isMei ? 'mei' : (PORTE_TO_SIZE[porteCode] || 'media'),
    city: c.endereco?.municipio || '',
    state: (c.endereco?.uf || '').toUpperCase(),
    position: socio?.qualificacao_socio || '',
    source: 'Casa dos Dados',
    website: '',
    revenue: c.capital_social ?? null,
    employees: null,
    notes: '',
    status: 'new',
    assignedTo: null,
    assignedMember: null,
    prospectType: isPartner ? 'partner' : 'lead',
    partnerCategory: detectedCategory,
    partnerType: null,
    listName: '',
    createdBy: null,
    createdAt: c.data_abertura || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    cnaeDescricao: c.atividade_principal?.descricao || '',
    endereco: c.endereco ? `${c.endereco.logradouro || ''}, ${c.endereco.numero || 'S/N'} - ${c.endereco.bairro || ''}` : '',
    cep: c.endereco?.cep || '',
  };
}

async function callCasaDadosAPI(body, { isPartner = false, partnerCategory = null } = {}) {
  if (!CASA_DOS_DADOS_API_KEY) {
    console.warn('[Search] API key nao configurada');
    return null;
  }

  try {
    const res = await fetch(CASA_DOS_DADOS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': CASA_DOS_DADOS_API_KEY,
      },
      body: JSON.stringify(body),
    });

    if (res.status === 401) {
      toast('API key da Casa dos Dados invalida.', 'error');
      return null;
    }
    if (res.status === 403) {
      toast('Saldo insuficiente na API Casa dos Dados.', 'error');
      return null;
    }
    if (!res.ok) {
      console.error('[Search] API error:', res.status);
      return null;
    }

    const json = await res.json();
    const prospects = (json.cnpjs || []).map((c, i) =>
      transformApiCompany(c, i, { isPartner, partnerCategory })
    );

    return { data: prospects, count: json.total || prospects.length, source: 'api' };
  } catch (err) {
    console.error('[Search] Fetch error:', err);
    return null;
  }
}

async function searchLeadsViaAPI(filters = {}) {
  return callCasaDadosAPI(buildApiBody(filters));
}

function buildPartnerApiBody(filters) {
  const body = {
    situacao_cadastral: ['ATIVA'],
    limite: Math.min(filters.perPage || 50, 1000),
    pagina: filters.page || 1,
    mais_filtros: { somente_matriz: true, com_telefone: true, com_email: true },
  };

  // Categoria de parceiro → CNAEs especificos (somente atividade PRINCIPAL para evitar resultados irrelevantes)
  if (filters.segment && PARTNER_CATEGORY_TO_CNAE[filters.segment]) {
    body.codigo_atividade_principal = PARTNER_CATEGORY_TO_CNAE[filters.segment];
  } else {
    // Sem categoria selecionada → combinar TODOS os CNAEs de parceiros
    const allPartnerCnaes = Object.values(PARTNER_CATEGORY_TO_CNAE).flat();
    body.codigo_atividade_principal = allPartnerCnaes;
  }

  // Porte
  if (filters.size && SIZE_TO_PORTE[filters.size]) {
    const cfg = SIZE_TO_PORTE[filters.size];
    body.porte_empresa = { codigos: cfg.codigos };
    if (cfg.mei) body.mei = cfg.mei;
  }

  // Estado
  if (filters.state) body.uf = [filters.state.toLowerCase()];

  // Cidade
  if (filters.city) body.municipio = [filters.city.toUpperCase()];

  // Busca textual
  if (filters.search) {
    body.busca_textual = [{
      texto: [filters.search],
      tipo_busca: 'radical',
      razao_social: true,
      nome_fantasia: true,
    }];
  }

  return body;
}

async function searchPartnersViaAPI(filters = {}) {
  // Mapear label da categoria de volta para key
  const categoryKey = filters.segment
    ? Object.entries(PARTNER_CATEGORY_LABELS).find(([, label]) => label === filters.segment)?.[0] || filters.segment
    : null;

  const body = buildPartnerApiBody({ ...filters, segment: categoryKey });
  return callCasaDadosAPI(body, { isPartner: true, partnerCategory: categoryKey });
}

// ==================== FALLBACK: BUSCA NO CRM LOCAL ====================

async function searchLocalCrmData(filters = {}) {
  try {
    // Buscar contacts com companies associadas
    let contactsQuery = supabase
      .from('crm_contacts')
      .select('id, name, email, phone, position, status, company_id, created_at, crm_companies(id, name, cnpj, segment, size, city, state, phone, email, website)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Filtros
    if (filters.state) {
      contactsQuery = contactsQuery.eq('crm_companies.state', filters.state);
    }
    if (filters.search) {
      contactsQuery = contactsQuery.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,crm_companies.name.ilike.%${filters.search}%`);
    }

    const { data: contacts, error: contactsErr } = await contactsQuery.limit(filters.perPage || 50);

    // Buscar companies sem contato associado
    let companiesQuery = supabase
      .from('crm_companies')
      .select('id, name, cnpj, segment, size, city, state, phone, email, website, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (filters.segment) companiesQuery = companiesQuery.eq('segment', filters.segment);
    if (filters.size) companiesQuery = companiesQuery.eq('size', filters.size);
    if (filters.state) companiesQuery = companiesQuery.eq('state', filters.state);
    if (filters.search) {
      companiesQuery = companiesQuery.or(`name.ilike.%${filters.search}%,cnpj.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
    }

    const { data: companies, error: companiesErr } = await companiesQuery.limit(filters.perPage || 50);

    if (contactsErr && companiesErr) return null;

    const prospects = [];
    const seenCompanyIds = new Set();

    // Contacts com company
    (contacts || []).forEach(c => {
      const co = c.crm_companies;
      // Aplicar filtros de segment/size client-side (join nao filtra no Supabase select)
      if (filters.segment && co?.segment !== filters.segment) return;
      if (filters.size && co?.size !== filters.size) return;

      if (co?.id) seenCompanyIds.add(co.id);
      prospects.push({
        id: `crm_c_${c.id}`,
        companyName: co?.name || '',
        contactName: c.name || '',
        phone: c.phone || co?.phone || '',
        email: c.email || co?.email || '',
        cnpj: co?.cnpj || '',
        segment: co?.segment || '',
        size: co?.size || '',
        city: co?.city || '',
        state: co?.state || '',
        position: c.position || '',
        source: 'CRM',
        website: co?.website || '',
        revenue: null,
        employees: null,
        notes: '',
        status: 'new',
        assignedTo: null,
        assignedMember: null,
        prospectType: 'lead',
        partnerCategory: null,
        listName: '',
        createdBy: null,
        createdAt: c.created_at,
        updatedAt: c.created_at,
        deletedAt: null,
      });
    });

    // Companies sem contato ja mapeado
    (companies || []).forEach(co => {
      if (seenCompanyIds.has(co.id)) return;
      prospects.push({
        id: `crm_co_${co.id}`,
        companyName: co.name || '',
        contactName: '',
        phone: co.phone || '',
        email: co.email || '',
        cnpj: co.cnpj || '',
        segment: co.segment || '',
        size: co.size || '',
        city: co.city || '',
        state: co.state || '',
        position: '',
        source: 'CRM',
        website: co.website || '',
        revenue: null,
        employees: null,
        notes: '',
        status: 'new',
        assignedTo: null,
        assignedMember: null,
        prospectType: 'lead',
        partnerCategory: null,
        listName: '',
        createdBy: null,
        createdAt: co.created_at,
        updatedAt: co.created_at,
        deletedAt: null,
      });
    });

    if (prospects.length === 0) return null;
    return { data: prospects, count: prospects.length, source: 'crm' };
  } catch (err) {
    console.error('[Prospects] Fallback CRM error:', err);
    return null;
  }
}

// ==================== FUNCOES EXPORTADAS ====================

export async function getCrmProspects(filters = {}) {
  const empty = { data: [], count: 0, source: 'api' };

  if (filters.prospectType === 'partner') {
    const apiResult = await searchPartnersViaAPI(filters);
    if (apiResult && apiResult.data.length > 0) return apiResult;
    // Fallback: buscar no CRM local
    const localResult = await searchLocalCrmData(filters);
    return localResult || empty;
  }

  const apiResult = await searchLeadsViaAPI(filters);
  if (apiResult && apiResult.data.length > 0) return apiResult;
  // Fallback: buscar no CRM local
  const localResult = await searchLocalCrmData(filters);
  return localResult || empty;
}

// ==================== ANALYTICS (agregacao client-side) ====================

function aggregateAnalytics(rows) {
  const total = rows.length;
  if (total === 0) return {
    total: 0, withEmail: 0, withPhone: 0, withCnpj: 0,
    uniqueSegments: 0, uniqueCities: 0,
    bySegment: [], bySize: [], byCity: [], bySource: [],
    topSegment: null, topCity: null, newCompanies: 0,
    revenueBySegment: [], avgRevenue: 0, topRevenueSegment: null,
  };

  const withEmail = rows.filter(r => r.email && r.email.trim()).length;
  const withPhone = rows.filter(r => r.phone && r.phone.trim()).length;
  const withCnpj = rows.filter(r => r.cnpj && r.cnpj.trim()).length;

  const groupBy = (arr, key) => {
    const map = {};
    arr.forEach(r => {
      const val = r[key] || 'Nao informado';
      map[val] = (map[val] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const bySegment = groupBy(rows, 'segment');
  const bySize = groupBy(rows, 'size');
  const bySource = groupBy(rows, 'source');

  const cityMap = {};
  rows.forEach(r => {
    const c = r.city?.trim();
    const st = r.state?.trim();
    if (!c && !st) {
      cityMap['Nao informado'] = (cityMap['Nao informado'] || 0) + 1;
      return;
    }
    const key = [c, st].filter(Boolean).join('/');
    cityMap[key] = (cityMap[key] || 0) + 1;
  });
  const byCity = Object.entries(cityMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const uniqueSegments = new Set(rows.map(r => r.segment).filter(Boolean)).size;
  const uniqueCities = new Set(rows.map(r => r.city).filter(Boolean)).size;

  const topSegment = bySegment[0] || null;
  const topCity = byCity[0] || null;

  // Empresas novas (abertas nos ultimos 2 anos)
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
  const newCompanies = rows.filter(r => {
    if (!r.createdAt) return false;
    return new Date(r.createdAt) >= twoYearsAgo;
  }).length;

  // Capital social medio por segmento
  const segRevMap = {};
  const segRevCount = {};
  rows.forEach(r => {
    const seg = r.segment || 'Nao informado';
    const rev = r.revenue;
    if (rev && rev > 0) {
      segRevMap[seg] = (segRevMap[seg] || 0) + rev;
      segRevCount[seg] = (segRevCount[seg] || 0) + 1;
    }
  });
  const revenueBySegment = Object.entries(segRevMap)
    .map(([name, total]) => ({ name, value: Math.round(total / segRevCount[name]) }))
    .sort((a, b) => b.value - a.value);

  const allRevenues = rows.filter(r => r.revenue && r.revenue > 0).map(r => r.revenue);
  const avgRevenue = allRevenues.length > 0 ? Math.round(allRevenues.reduce((a, b) => a + b, 0) / allRevenues.length) : 0;
  const topRevenueSegment = revenueBySegment[0] || null;

  return {
    total, withEmail, withPhone, withCnpj,
    uniqueSegments, uniqueCities,
    bySegment, bySize, byCity, bySource,
    topSegment, topCity, newCompanies,
    revenueBySegment, avgRevenue, topRevenueSegment,
  };
}

export async function getProspectsAnalytics(filters = {}) {
  // Sample reduzido para economizar creditos da API
  const ANALYTICS_SAMPLE = 50;
  const emptyAnalytics = { total: 0, withEmail: 0, withPhone: 0, withCnpj: 0, uniqueSegments: 0, uniqueCities: 0, bySegment: [], bySize: [], byCity: [], bySource: [], topSegment: null, topCity: null, newCompanies: 0, revenueBySegment: [], avgRevenue: 0, topRevenueSegment: null, topCompanies: [] };

  const buildResult = (result) => {
    if (!result || result.data.length === 0) return null;
    const analytics = aggregateAnalytics(result.data);
    return { ...analytics, total: result.count, topCompanies: result.data.slice(0, 15) };
  };

  if (filters.prospectType === 'partner') {
    const apiResult = await searchPartnersViaAPI({ ...filters, page: 1, perPage: ANALYTICS_SAMPLE });
    const built = buildResult(apiResult);
    if (built) return built;
    const localResult = await searchLocalCrmData({ ...filters, perPage: ANALYTICS_SAMPLE });
    return buildResult(localResult) || emptyAnalytics;
  }

  const apiResult = await searchLeadsViaAPI({ ...filters, page: 1, perPage: ANALYTICS_SAMPLE });
  const built = buildResult(apiResult);
  if (built) return built;
  const localResult = await searchLocalCrmData({ ...filters, perPage: ANALYTICS_SAMPLE });
  return buildResult(localResult) || emptyAnalytics;
}

export async function getProspectListNames() {
  const { data, error } = await supabase
    .from('crm_prospects')
    .select('list_name')
    .is('deleted_at', null)
    .not('list_name', 'is', null)
    .not('list_name', 'eq', '');

  if (error) return [];
  const unique = [...new Set((data || []).map(r => r.list_name).filter(Boolean))];
  return unique.sort();
}

export async function createCrmProspect(data) {
  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;
  return prospectService.create(data, { created_by: userId });
}

export async function updateCrmProspect(id, updates) {
  return prospectService.update(id, updates);
}

export async function softDeleteCrmProspect(id) {
  const { error } = await supabase
    .from('crm_prospects')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    toast(`Erro ao excluir prospect: ${error.message}`, 'error');
    return false;
  }
  return true;
}

/**
 * Envia prospects selecionados para um pipeline do CRM.
 * Para cada prospect: cria empresa, contato e deal.
 */
export async function sendToPipeline(prospectIds, pipelineId, stageId) {
  // Buscar dados dos prospects
  const { data: prospects, error } = await supabase
    .from('crm_prospects')
    .select('*')
    .in('id', prospectIds)
    .is('deleted_at', null);

  if (error || !prospects?.length) {
    toast('Erro ao buscar prospects para conversao', 'error');
    return { success: 0, errors: 0 };
  }

  let success = 0;
  let errors = 0;

  for (const p of prospects) {
    try {
      // 1. Verificar se empresa com mesmo CNPJ ja existe
      let companyId = null;
      if (p.cnpj) {
        const { data: existing } = await supabase
          .from('crm_companies')
          .select('id')
          .eq('cnpj', p.cnpj)
          .is('deleted_at', null)
          .maybeSingle();
        if (existing) companyId = existing.id;
      }

      // Criar empresa se nao existe
      if (!companyId) {
        const company = await createCrmCompany({
          name: p.company_name,
          cnpj: p.cnpj || '',
          segment: p.segment || '',
          size: p.size || '',
          phone: p.phone || '',
          email: p.email || '',
          website: p.website || '',
          city: p.city || '',
          state: p.state || '',
        });
        companyId = company?.id;
      }

      // 2. Criar contato
      let contactId = null;
      if (p.contact_name) {
        const contact = await createCrmContact({
          name: p.contact_name,
          email: p.email || '',
          phone: p.phone || '',
          position: p.position || '',
          status: 'lead',
          companyId: companyId,
        });
        contactId = contact?.id;
      }

      // 3. Criar deal
      await createCrmDeal({
        title: p.company_name,
        value: 0,
        pipelineId,
        stageId,
        contactId: contactId || null,
        companyId: companyId || null,
        status: 'open',
      });

      // 4. Marcar prospect como convertido
      await supabase
        .from('crm_prospects')
        .update({ status: 'converted', updated_at: new Date().toISOString() })
        .eq('id', p.id);

      success++;
    } catch (err) {
      console.error(`[Prospects] Erro ao converter prospect ${p.id}:`, err);
      errors++;
    }
  }

  if (success > 0) {
    toast(`${success} prospect${success > 1 ? 's' : ''} convertido${success > 1 ? 's' : ''} com sucesso`, 'success');
  }
  if (errors > 0) {
    toast(`${errors} prospect${errors > 1 ? 's' : ''} com erro na conversao`, 'error');
  }

  return { success, errors };
}

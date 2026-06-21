import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { crmProspectSchema } from '../schemas/crmValidation';
import { createCrmCompany } from './crmCompaniesService';
import { createCrmDeal } from './crmDealsService';
import { searchProspectsByGoogle, markGooglePlaceConverted } from '../../../lib/googlePlacesService';
import { trackCdSearch, trackCdLookup } from '../../../lib/usageTracker';
import { SEGMENT_TO_CNAE, CNAE_TO_SEGMENT, SIZE_TO_PORTE, PORTE_TO_SIZE, REVENUE_TO_CAPITAL, PARTNER_CATEGORY_TO_CNAE, CNAE_TO_PARTNER_CATEGORY, PARTNER_CATEGORY_LABELS } from '../data/cnaeMapping';
import { escapeOrIlike } from '../lib/searchFilters';

// API Casa dos Dados — chave via env var (nunca hardcode!)
const CASA_DOS_DADOS_API_KEY = import.meta.env.VITE_CASA_DOS_DADOS_API_KEY || '';
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
    avatarUrl: row.avatar_url || null,
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
    limite: Math.min(filters.perPage || 30, 100), // teto rigido p/ economizar creditos
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

function extractAllPhones(c) {
  return (c.contato_telefonico || [])
    .map(t => t?.completo || (t?.ddd && t?.numero ? `(${t.ddd}) ${t.numero}` : null))
    .filter(Boolean);
}

// Padrao brasileiro: celular tem 11 digitos com 9 inicial apos DDD (ou 9 digits sem DDD).
// Apenas celulares podem ter WhatsApp — usado pra filtrar a lista resultante.
export function isMobilePhone(val) {
  if (!val) return false;
  const clean = val.replace(/\D/g, '');
  const local = clean.length >= 12 && clean.startsWith('55') ? clean.slice(2) : clean;
  if (local.length === 11 && local[2] === '9') return true;
  if (local.length === 9 && local[0] === '9') return true;
  return false;
}

function extractEmail(c) {
  // Casa dos Dados v5: contato_email[].email
  const em = c.contato_email?.[0];
  if (em?.email) return em.email.toLowerCase();
  return '';
}

function extractAllEmails(c) {
  return (c.contato_email || [])
    .map(e => e?.email?.toLowerCase())
    .filter(Boolean);
}

function extractSocios(c) {
  return (c.quadro_societario || c.socios || [])
    .map(s => ({
      name: s?.nome || s?.nome_socio || '',
      role: s?.qualificacao_socio || s?.qualificacao || '',
      capitalPercent: s?.percentual_capital ?? s?.percentual ?? null,
    }))
    .filter(s => s.name);
}

function extractAtividadesSecundarias(c) {
  return (c.atividades_secundarias || [])
    .map(a => ({
      code: a?.codigo || a?.cnae || '',
      description: a?.descricao || a?.descricao_cnae || '',
    }))
    .filter(a => a.code);
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

  // Promove primeiro celular ao campo `phone` (se houver) — usuario quer
  // priorizar contato via WhatsApp. Se nao houver celular, mantem o primeiro
  // telefone disponivel (sera filtrado depois pelo callCasaDadosAPI).
  const allPhonesList = extractAllPhones(c);
  const firstMobile = allPhonesList.find(isMobilePhone);
  const primaryPhone = firstMobile || allPhonesList[0] || extractPhone(c);

  return {
    id: `api_${c.cnpj}`,
    companyName,
    contactName: socio?.nome || socio?.nome_socio || '',
    phone: primaryPhone,
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
    // Dados extras Casa dos Dados v5
    naturezaJuridica: c.natureza_juridica?.descricao || c.natureza_juridica || '',
    inscricaoEstadual: c.inscricao_estadual || '',
    simplesNacional: c.simples_nacional?.optante === true,
    dataAbertura: c.data_abertura || null,
    situacaoCadastral: c.situacao_cadastral || '',
    dataSituacaoCadastral: c.data_situacao_cadastral || null,
    socios: extractSocios(c),
    phones: extractAllPhones(c),
    emails: extractAllEmails(c),
    atividadesSecundarias: extractAtividadesSecundarias(c),
    enderecoComplemento: c.endereco?.complemento || '',
  };
}

// ─── Lookup CNPJ a partir de nome + UF (usado no fluxo Google-first) ─────────
// Quando o lead foi gerado via Google Places (sem CNPJ), a gente busca CD na
// hora do envio pra pipeline pra trazer dados estruturais.
// Cache por (nome, uf) por 30 dias evita custo repetido na conversao.

const CD_LOOKUP_PREFIX = 'cd_lookup_';
const CD_LOOKUP_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function cdLookupCacheKey(name, uf) {
  const norm = (name || '').toLowerCase().trim().replace(/\s+/g, ' ');
  const k = `${norm}|${(uf || '').toUpperCase()}`;
  try {
    return CD_LOOKUP_PREFIX + btoa(unescape(encodeURIComponent(k))).replace(/[+/=]/g, '').slice(0, 80);
  } catch {
    return CD_LOOKUP_PREFIX + k;
  }
}

function readCdLookupCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CD_LOOKUP_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeCdLookupCache(key, data) {
  try { localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() })); } catch {}
}

// Stop-words que nao agregam à busca (preposicoes, sufixos, termos genericos)
const STOPWORDS_LOOKUP = new Set([
  'de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'nas', 'nos',
  'a', 'o', 'as', 'os', 'um', 'uma', 'uns', 'umas',
  'ltda', 'me', 'epp', 'eireli', 'sa', 's/a', 's.a',
  'escritorio', 'empresa',
]);

function tokenizeName(name) {
  return (name || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 3 && !STOPWORDS_LOOKUP.has(t));
}

/**
 * Reduz nome a palavras significativas: remove stopwords, mantém palavras
 * mais distintivas no início. "Escritório LPL Contabilidade" → "LPL Contabilidade".
 */
function buildLookupVariants(name) {
  const tokens = tokenizeName(name);
  const variants = [];
  if (tokens.length > 0) variants.push(tokens.join(' ').slice(0, 80));
  if (tokens.length >= 2) variants.push(tokens.slice(0, 2).join(' '));
  if (tokens.length >= 1 && tokens[0].length >= 3) variants.push(tokens[0]);
  return [...new Set(variants)];
}

/**
 * Score Jaccard de tokens entre nome original e candidato CD.
 * Retorna 0..1 — quanto maior, mais similar.
 */
function scoreCandidate(candidate, originalTokens) {
  if (originalTokens.length === 0) return 0;
  const cdName = `${candidate.razao_social || ''} ${candidate.nome_fantasia || ''}`;
  const cdTokens = new Set(tokenizeName(cdName));
  const intersection = originalTokens.filter(t => cdTokens.has(t)).length;
  return intersection / originalTokens.length;
}

/**
 * Busca CD por razao_social/nome_fantasia + UF, com fallbacks de simplificacao
 * de nome. Tenta variantes ate achar OU desistir cacheando 'miss'.
 *
 * Retorna o melhor match (objeto prospect-shaped) ou null se nao bateu.
 */
export async function lookupCnpjByName(name, uf, city = '') {
  if (!name) return null;
  if (!CASA_DOS_DADOS_API_KEY) return null;

  // Cache global por (nome ORIGINAL, uf) — nao dependendo da variante usada
  const key = cdLookupCacheKey(name, uf);
  const cached = readCdLookupCache(key);
  if (cached !== null) return cached.miss ? null : cached;

  const variants = buildLookupVariants(name);
  if (variants.length === 0) {
    writeCdLookupCache(key, { miss: true });
    return null;
  }

  const originalTokens = tokenizeName(name);
  // Threshold mais permissivo — 30% dos tokens significativos. Pra empresas
  // cuja razao social na Receita eh nome do dono ("JOSE SILVA LTDA") em vez
  // do nome fantasia ("Padaria do Jose"), tokens raramente batem 50%+.
  // O ranking ainda escolhe o mais similar; threshold so descarta lixo total.
  const SCORE_MIN_FIRST = 0.3;
  const SCORE_MIN_LAST  = 0.5; // ultimo recurso (variante curta tipo "lpl") exige mais

  // Se TODAS as variantes derem erro HTTP/network, nao cacheia miss — assim
  // o usuario pode tentar de novo (provavelmente foi falha transitoria de rede,
  // nao ausencia real do CNPJ na base).
  let hadTransportError = false;

  for (let i = 0; i < variants.length; i++) {
    const variant = variants[i];
    const isLastResort = i === variants.length - 1 && variant.split(' ').length === 1;
    const threshold = isLastResort ? SCORE_MIN_LAST : SCORE_MIN_FIRST;

    try {
      const body = {
        situacao_cadastral: ['ATIVA'],
        limite: 20,
        pagina: 1,
        mais_filtros: { somente_matriz: true },
        busca_textual: [{
          texto: [variant],
          tipo_busca: 'radical',
          razao_social: true,
          nome_fantasia: true,
        }],
      };
      if (uf) body.uf = [uf.toLowerCase()];
      // Sem filtro de cidade — Google's formattedAddress nem sempre usa o nome
      // exato do municipio CD (ex: "Belo Horizonte" vs "BELO HORIZONTE"
      // vs cidades vizinhas). Filtra DEPOIS pelo score.

      const res = await fetch(CASA_DOS_DADOS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': CASA_DOS_DADOS_API_KEY },
        body: JSON.stringify(body),
      });

      trackCdLookup();

      // 401 = chave invalida, 403 = sem saldo na Casa dos Dados. Nenhum dos dois
      // melhora trocando a variante de busca — aborta o loop na hora (evita 3x
      // request/403 no console) e segue sem enriquecer. O fluxo Google nao
      // depende da CD: o lead entra na pipeline sem CNPJ, so com dados do Google.
      // Nao cacheia miss — assim, se recarregar credito depois, volta a funcionar.
      if (res.status === 401 || res.status === 403) {
        return null;
      }

      if (!res.ok) {
        hadTransportError = true;
        console.warn('[lookupCnpj] HTTP', res.status, 'variant:', variant);
        continue;
      }

      const json = await res.json();
      const candidates = json.cnpjs || [];
      if (candidates.length === 0) continue;

      // Boost de score se cidade do CD bate com cidade do Google
      const cityNorm = (city || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      const scored = candidates
        .map(c => {
          let score = scoreCandidate(c, originalTokens);
          if (cityNorm) {
            const cdCity = (c.endereco?.municipio || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
            if (cdCity && (cdCity === cityNorm || cdCity.includes(cityNorm) || cityNorm.includes(cdCity))) {
              score += 0.3; // boost de 30% se cidade bate
            }
          }
          return { c, score };
        })
        .sort((a, b) => b.score - a.score);

      const best = scored[0];
      if (!best || best.score < threshold) continue;

      const result = transformApiCompany(best.c, 0);
      writeCdLookupCache(key, result);
      return result;
    } catch (err) {
      hadTransportError = true;
      console.warn('[lookupCnpj] erro variant:', variant, err);
    }
  }

  // Cacheia miss APENAS se a busca foi bem-sucedida em todas as variantes
  // (sem erro de rede/HTTP) e ainda assim nao achou nada. Caso contrario,
  // permite retry na proxima chamada.
  if (!hadTransportError) {
    writeCdLookupCache(key, { miss: true });
  }
  return null;
}

// ─── Cache localStorage da Casa dos Dados ─────────────────────────────────────
// Mesma busca repetida em ate 7 dias → vem do cache, sem queimar credito.

const CD_CACHE_PREFIX = 'cd_search_';
const CD_CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function cdCacheKey(filters, isPartner) {
  // Normaliza pra produzir chave estavel: ordena propriedades e descarta vazios
  const norm = {
    isPartner: !!isPartner,
    segment:      filters.segment      || '',
    size:         filters.size         || '',
    state:        filters.state        || '',
    city:         filters.city         || '',
    ddd:          filters.ddd          || '',
    search:       filters.search       || '',
    revenueRange: filters.revenueRange || '',
    page:         filters.page         || 1,
    perPage:      filters.perPage      || 30,
  };
  const str = JSON.stringify(norm, Object.keys(norm).sort());
  // Encode pra chave compacta (hash leve via btoa)
  try {
    return CD_CACHE_PREFIX + btoa(unescape(encodeURIComponent(str))).replace(/[+/=]/g, '').slice(0, 80);
  } catch {
    return CD_CACHE_PREFIX + str;
  }
}

function readCdCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CD_CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeCdCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage cheio — silencioso (cache opcional)
  }
}

export function clearCasaDosDadosCache() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(CD_CACHE_PREFIX)) keys.push(k);
  }
  keys.forEach(k => localStorage.removeItem(k));
  return keys.length;
}

// ─── Pos-processamento (fora do cache, sempre fresco) ─────────────────────────

/**
 * Filtra prospects cujo telefone (primario ou na lista) bata com o DDD desejado.
 * Determinístico — pode rodar antes ou depois do cache, dah no mesmo.
 */
function applyDddFilter(prospects, dddFilter) {
  if (!dddFilter) return prospects;
  const ddd = dddFilter.replace(/\D/g, '');
  const matchesDdd = (phone) => {
    if (!phone) return false;
    const clean = phone.replace(/\D/g, '');
    const local = clean.length >= 12 && clean.startsWith('55') ? clean.slice(2) : clean;
    return local.startsWith(ddd);
  };
  return prospects.filter(p =>
    matchesDdd(p.phone) || (p.phones || []).some(matchesDdd)
  );
}

/**
 * Remove prospects cujo CNPJ ja existe em crm_companies (lead ja convertido).
 * NAO eh cacheado — depende do estado atual do CRM. Roda apos cache hit.
 */
async function excludeConvertedCnpjs(prospects) {
  const cnpjs = prospects.map(p => p.cnpj).filter(Boolean);
  if (cnpjs.length === 0) return prospects;

  const { data: existing } = await supabase
    .from('crm_companies')
    .select('cnpj')
    .in('cnpj', cnpjs)
    .is('deleted_at', null);
  if (!existing || existing.length === 0) return prospects;

  const existingSet = new Set(existing.map(c => c.cnpj));
  return prospects.filter(p => !existingSet.has(p.cnpj));
}

// ─── API call (sem dedup, sem DDD — pos-processado fora) ──────────────────────

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

    trackCdSearch();

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

// ─── Wrappers com cache + pos-processamento ───────────────────────────────────

async function searchLeadsViaAPI(filters = {}) {
  const key = cdCacheKey(filters, false);
  let result = readCdCache(key);
  if (!result) {
    result = await callCasaDadosAPI(buildApiBody(filters));
    if (result) writeCdCache(key, result);
  }
  if (!result) return null;

  // Pos-processamento (DDD + dedup contra crm_companies). Nao cacheado pq
  // dedup depende do estado atual do CRM e DDD ja eh chave do cache.
  let data = applyDddFilter(result.data, filters.ddd);
  data = await excludeConvertedCnpjs(data);
  return { ...result, data };
}

function buildPartnerApiBody(filters) {
  const body = {
    situacao_cadastral: ['ATIVA'],
    limite: Math.min(filters.perPage || 30, 100), // teto rigido p/ economizar creditos
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
  const result = await callCasaDadosAPI(body, { isPartner: true, partnerCategory: categoryKey });
  if (!result) return null;
  // Mesmo pos-processamento dos leads: o DDD nao eh enviado a API (filtro client)
  // e parceiros ja importados precisam sair do resultado (dedup contra crm_companies).
  let data = applyDddFilter(result.data, filters.ddd);
  data = await excludeConvertedCnpjs(data);
  return { ...result, data };
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
      const s = escapeOrIlike(filters.search);
      contactsQuery = contactsQuery.or(`name.ilike.%${s}%,email.ilike.%${s}%,crm_companies.name.ilike.%${s}%`);
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
      const s = escapeOrIlike(filters.search);
      companiesQuery = companiesQuery.or(`name.ilike.%${s}%,cnpj.ilike.%${s}%,email.ilike.%${s}%`);
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

  // Modo Google-first: usa Places API direto (mais barato + ja verificado).
  // Casa dos Dados eh consultada apenas no envio pra pipeline (lookup CNPJ).
  if (filters.source === 'google') {
    const result = await searchProspectsByGoogle(
      { segment: filters.segment, city: filters.city, state: filters.state },
      filters.pageToken || ''
    );
    if (!result) return empty;
    // Surface erro pra UI exibir toast explicativo
    if (result.error === 'quota_exceeded') {
      toast('Cota diária do Google Places esgotada. Aumente o limite no Google Cloud Console ou tente amanhã.', 'error');
    } else if (result.error === 'unauthorized') {
      toast('Chave do Google Places inválida ou sem permissão pra Places API (New).', 'error');
    } else if (result.error === 'http_error') {
      toast(`Google Places retornou erro ${result.httpStatus}. Veja console.`, 'error');
    }
    return { data: result.data, count: result.data.length, nextPageToken: result.nextPageToken, source: 'google-first', error: result.error };
  }

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
 * Recebe os objetos completos (camelCase, em memoria) — eles podem vir da API
 * Casa dos Dados (id `api_*`), do fallback local (id `crm_c_*` / `crm_co_*`)
 * ou de linhas reais persistidas em crm_prospects (id `crm_prs_*`).
 * Para cada um: cria empresa, contato e deal.
 */
export async function sendToPipeline(prospects, pipelineId, stageId, opts = {}) {
  if (!prospects?.length) {
    toast('Nenhum prospect selecionado', 'error');
    return { success: 0, errors: 0 };
  }

  const { defaultValue = 0 } = opts;

  let success = 0;
  let errors = 0;

  for (const p of prospects) {
    // Rastreia o que foi criado neste ciclo para permitir rollback em falha
    let createdCompanyId = null;

    try {
      // Lead veio direto do Google Places (sem CNPJ na lista). Busca dados
      // estruturais na Casa dos Dados sob demanda — primeiro CNPJ encontrado
      // por razao_social/nome_fantasia + UF eh usado como fonte estrutural.
      let cdData = null;
      const fromGoogleFirst = typeof p.id === 'string' && p.id.startsWith('gpl_');
      if (fromGoogleFirst && p.companyName) {
        cdData = await lookupCnpjByName(p.companyName, p.state, p.city);
      }

      // Mescla: dados estruturais do CD (CNPJ, porte, capital, sócios) +
      // dados de contato/site/IG do Google. Phone do Google sobrepoe sempre
      // (mais atualizado).
      const merged = {
        ...p,
        cnpj:           p.cnpj             || cdData?.cnpj           || '',
        contactName:    p.contactName      || cdData?.contactName    || '',
        position:       p.position         || cdData?.position       || '',
        size:           p.size             || cdData?.size           || '',
        segment:        p.segment          || cdData?.segment        || '',
        revenue:        p.revenue          ?? cdData?.revenue        ?? null,
        socios:         p.socios?.length   ? p.socios       : (cdData?.socios || []),
        naturezaJuridica: p.naturezaJuridica || cdData?.naturezaJuridica || '',
        simplesNacional:  p.simplesNacional  || cdData?.simplesNacional  || false,
        dataAbertura:     p.dataAbertura     || cdData?.dataAbertura     || null,
      };

      // Dados enriquecidos pelo Google Places no fluxo CD-first (se houver)
      const enr = p.enriched && p.enriched !== 'loading' && p.enriched !== 'miss' ? p.enriched : null;
      const googleSite      = merged.website   || enr?.website   || '';
      const googleInstagram = merged.instagram || enr?.instagram || '';
      const googleFacebook  = merged.facebook  || enr?.facebook  || '';

      // Telefone preferencial: do Google (Google-first OU enrichment) → CD primario
      const enrichedPhone = enr?.phone || merged.phone || '';
      const bestPhone = enrichedPhone || p.phone || '';

      // 1. Verificar se empresa com mesmo CNPJ ja existe
      let companyId = null;
      if (merged.cnpj) {
        const { data: existing } = await supabase
          .from('crm_companies')
          .select('id')
          .eq('cnpj', merged.cnpj)
          .is('deleted_at', null)
          .maybeSingle();
        if (existing) companyId = existing.id;
      }

      // Criar empresa se nao existe (mesclando CD + Google)
      if (!companyId) {
        const company = await createCrmCompany({
          name: merged.companyName,
          cnpj: merged.cnpj || '',
          segment: merged.segment || '',
          size: merged.size || '',
          phone: bestPhone,
          email: merged.email || '',
          website: googleSite || merged.website || '',
          city: merged.city || '',
          state: merged.state || '',
        });
        companyId = company?.id;
        createdCompanyId = companyId;
      }

      // Notas do deal: registra origem + extras (Instagram, site enriquecido,
      // status do negocio no Google). Usuario pode editar depois sem perder contexto.
      const originLabel = fromGoogleFirst
        ? '🎯 Origem: Lista via Google Meu Negócio'
        : '🎯 Origem: Geração automática via lista de prospecção';
      const noteLines = [originLabel];

      if (googleInstagram)   noteLines.push(`📱 Instagram: ${googleInstagram}`);
      if (googleFacebook)    noteLines.push(`👥 Facebook: ${googleFacebook}`);
      if (googleSite)        noteLines.push(`🌐 Site: ${googleSite}`);
      if (merged.businessStatus && merged.businessStatus !== 'OPERATIONAL') {
        noteLines.push(`⚠️ Google: ${merged.businessStatus}`);
      }
      if (merged.displayName && merged.displayName !== merged.companyName) {
        noteLines.push(`🏷️ Nome no Google: ${merged.displayName}`);
      }
      if (fromGoogleFirst && !merged.cnpj) {
        noteLines.push('⚠️ CNPJ não localizado na Receita — empresa criada sem dados estruturais');
      }

      // 2. Criar deal direto, sem contato isolado.
      // O telefone/email vem da Casa dos Dados (PJ, nao pessoal) — manter esses
      // dados no proprio Lead evita confundir o usuario achando que e telefone do socio.
      // probability: 10 — leads de prospeccao fria comecam com chance baixa
      // (default do schema seria 50, o que infla forecast).
      const deal = await createCrmDeal({
        title: merged.companyName,
        value: defaultValue,
        probability: 10,
        pipelineId,
        stageId,
        ownerId: p._ownerId || null,
        contactId: null,
        companyId: companyId || null,
        contactName: merged.contactName || '',
        contactPhone: bestPhone,
        contactEmail: merged.email || '',
        notes: noteLines.join('\n'),
        status: 'open',
      });
      if (!deal?.id) throw new Error('Falha ao criar deal');

      // 3. Marcar como convertido pra nao reaparecer em buscas seguintes
      if (typeof p.id === 'string' && p.id.startsWith('crm_prs_')) {
        // Prospect persistido em crm_prospects → status converted
        await supabase
          .from('crm_prospects')
          .update({ status: 'converted', updated_at: new Date().toISOString() })
          .eq('id', p.id);
      }
      if (fromGoogleFirst && p.googlePlaceId) {
        // Lead vindo do Google-first → marca placeId em localStorage
        // (sem CNPJ confiavel pra dedup via crm_companies)
        markGooglePlaceConverted(p.googlePlaceId);
      }

      success++;
    } catch (err) {
      console.error(`[Prospects] Erro ao converter prospect ${p.id}:`, err);

      // Rollback: soft-delete da empresa criada neste ciclo
      if (createdCompanyId) {
        await supabase
          .from('crm_companies')
          .update({ deleted_at: new Date().toISOString() })
          .eq('id', createdCompanyId);
      }

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

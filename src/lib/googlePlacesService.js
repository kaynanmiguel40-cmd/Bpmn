import { trackGoogleCall } from './usageTracker';

/**
 * googlePlacesService.js
 * Enriquecimento de prospects via Google Places API (New).
 *
 * Estrategia:
 * - 1 chamada Text Search por prospect (retorna phone + website + tudo numa
 *   so request — diferente da Legacy que precisava de 2 calls).
 * - Cache em localStorage por CNPJ (TTL 30 dias) pra evitar reconsultas e
 *   queimar credito a toa.
 * - Match por nome da empresa + cidade. Se nome muito longo, trunca.
 * - Retorna null se nao bateu ou se a API falhou — chamador deve lidar.
 *
 * Pricing (Places API New, field mask Pro Tier): ~$25/1000 calls.
 * Free credit Google: $200/mes => ~8.000 enrichments/mes gratis.
 */

const PLACES_TEXT_SEARCH_URL = 'https://places.googleapis.com/v1/places:searchText';
const FIELD_MASK = [
  'places.id',
  'places.displayName',
  'places.formattedAddress',
  'places.nationalPhoneNumber',
  'places.internationalPhoneNumber',
  'places.websiteUri',
  'places.types',
  'places.businessStatus',
].join(',');

const CACHE_PREFIX = 'gp_enrich_';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

function getApiKey() {
  // Reaproveita a key ja existente do Maps (mesma chave funciona pra Places New
  // se as restricoes da chave permitirem ambas as APIs).
  return import.meta.env.VITE_GOOGLE_PLACES_API_KEY
      || import.meta.env.VITE_GOOGLE_MAPS_API_KEY
      || '';
}

// ─── Cache ────────────────────────────────────────────────────────────────────

function cacheKey(cnpj) {
  // Normaliza CNPJ (so digitos) pra evitar mismatch por formatacao
  return CACHE_PREFIX + (cnpj || '').replace(/\D/g, '');
}

function readCache(cnpj) {
  if (!cnpj) return null;
  try {
    const raw = localStorage.getItem(cacheKey(cnpj));
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) {
      localStorage.removeItem(cacheKey(cnpj));
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeCache(cnpj, data) {
  if (!cnpj) return;
  try {
    localStorage.setItem(cacheKey(cnpj), JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage cheio ou bloqueado — ignora silenciosamente
  }
}

// ─── Match scoring ────────────────────────────────────────────────────────────

function normalizeStr(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function pickBestMatch(places, prospect) {
  if (!places?.length) return null;

  const targetName  = normalizeStr(prospect.companyName);
  const targetCity  = normalizeStr(prospect.city);
  const targetState = (prospect.state || '').toUpperCase();

  // Score: cada place ganha pontos por similaridade com nome + cidade + UF
  const scored = places.map(p => {
    const placeName    = normalizeStr(p.displayName?.text || '');
    const placeAddress = (p.formattedAddress || '').toLowerCase();
    let score = 0;

    // Nome: tokens em comum
    if (targetName && placeName) {
      const targetTokens = new Set(targetName.split(' ').filter(t => t.length > 2));
      const placeTokens  = new Set(placeName.split(' ').filter(t => t.length > 2));
      const intersection = [...targetTokens].filter(t => placeTokens.has(t)).length;
      const union = new Set([...targetTokens, ...placeTokens]).size;
      if (union > 0) score += 50 * (intersection / union);
    }

    // Cidade no endereco formatado
    if (targetCity && placeAddress.includes(targetCity)) score += 30;

    // UF no endereco formatado (sigla, ex: " - SP,")
    if (targetState && placeAddress.includes(`- ${targetState.toLowerCase()},`)) score += 15;

    // Negocio ativo
    if (p.businessStatus === 'OPERATIONAL') score += 5;

    return { place: p, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  // Threshold minimo: precisa pelo menos cidade ou nome forte pra evitar falso match
  if (best.score < 20) return null;
  return best.place;
}

// ─── API call ─────────────────────────────────────────────────────────────────

async function callTextSearch(query) {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[googlePlaces] VITE_GOOGLE_PLACES_API_KEY (ou MAPS) nao configurada');
    return null;
  }

  try {
    const res = await fetch(PLACES_TEXT_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK,
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'pt-BR',
        regionCode: 'BR',
        maxResultCount: 5,
      }),
    });

    trackGoogleCall();

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[googlePlaces] HTTP', res.status, errBody.slice(0, 200));
      return null;
    }

    const json = await res.json();
    return json.places || [];
  } catch (err) {
    console.error('[googlePlaces] Fetch error:', err);
    return null;
  }
}

// ─── API publica ──────────────────────────────────────────────────────────────

/**
 * Tenta enriquecer um prospect com dados do Google Places.
 * Retorna { source: 'google', phone, website, displayName, formattedAddress,
 *           types, businessStatus, googlePlaceId } ou null se nao bateu.
 * Resultado eh cacheado em localStorage por CNPJ por 30 dias.
 */
export async function enrichProspectWithGoogle(prospect) {
  if (!prospect) return null;

  // Cache hit? Pode ser dado enriquecido OU sentinela de miss ({ miss: true })
  const cached = readCache(prospect.cnpj);
  if (cached !== null) {
    return cached.miss ? null : cached;
  }

  // Constroi query: nome + cidade. Se nome muito longo, trunca.
  const name = (prospect.companyName || '').slice(0, 60).trim();
  const city = (prospect.city || '').trim();
  if (!name) return null;

  const query = [name, city].filter(Boolean).join(' ');

  const places = await callTextSearch(query);
  if (!places) return null; // erro na chamada — nao cacheia

  const best = pickBestMatch(places, prospect);
  if (!best) {
    // Cacheia o "miss" tambem pra nao reconsultar
    writeCache(prospect.cnpj, { miss: true });
    return null;
  }

  // websiteUri da Google Places frequentemente e perfil do Instagram, Facebook
  // ou outra rede. Separamos pra renderizar com icones distintos na tabela.
  const url = best.websiteUri || '';
  const urlLower = url.toLowerCase();
  const isInstagram = /instagram\.com/.test(urlLower);
  const isFacebook  = /facebook\.com/.test(urlLower);
  const website   = url && !isInstagram && !isFacebook ? url : '';
  const instagram = isInstagram ? url : '';
  const facebook  = isFacebook  ? url : '';

  const enriched = {
    source: 'google',
    googlePlaceId:    best.id,
    displayName:      best.displayName?.text || '',
    phone:            best.nationalPhoneNumber || best.internationalPhoneNumber || '',
    website,
    instagram,
    facebook,
    formattedAddress: best.formattedAddress || '',
    types:            best.types || [],
    businessStatus:   best.businessStatus || '',
  };

  writeCache(prospect.cnpj, enriched);
  return enriched;
}

/**
 * Limpa todo o cache de enrichment Google Places.
 * Util quando a key muda ou pra forcar reconsulta.
 */
export function clearGooglePlacesCache() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(CACHE_PREFIX)) keys.push(k);
  }
  keys.forEach(k => localStorage.removeItem(k));
  return keys.length;
}

// ─── Busca Google-First: retorna prospects diretamente do Google ─────────────
// Cada call retorna ate 20 lugares verificados (com phone, site, IG quando ha).
// Cache por (query, pageToken) por 7 dias evita custo repetido.

const GP_SEARCH_PREFIX = 'gp_search_';
const GP_SEARCH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function gpSearchCacheKey(query, pageToken = '') {
  try {
    const raw = JSON.stringify({ q: query.toLowerCase().trim(), p: pageToken });
    return GP_SEARCH_PREFIX + btoa(unescape(encodeURIComponent(raw))).replace(/[+/=]/g, '').slice(0, 80);
  } catch {
    return GP_SEARCH_PREFIX + query;
  }
}

function readGpSearchCache(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, ts } = JSON.parse(raw);
    if (Date.now() - ts > GP_SEARCH_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function writeGpSearchCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch {
    // localStorage cheio — ignora
  }
}

// Pega cidade e UF de "Rua X, 123 - Bairro, Cidade - UF, CEP, Brazil"
export function parseFormattedAddress(addr) {
  if (!addr) return { city: '', state: '' };
  const m = addr.match(/,\s*([^,-]+?)\s*-\s*([A-Z]{2})\s*(?:,|$)/);
  if (m) return { city: m[1].trim(), state: m[2].trim() };
  return { city: '', state: '' };
}

// Limpa nome verboso tipo "LPL Contabilidade - Escritorio de Contabilidade em BH"
export function cleanCompanyName(displayName) {
  if (!displayName) return '';
  // Pega antes do primeiro " - " ou " | " — geralmente nome real
  const split = displayName.split(/\s+[-|]\s+/);
  const first = split[0].trim();
  return first.length >= 3 ? first : displayName;
}

export function placeToProspect(place) {
  const url = place.websiteUri || '';
  const isInstagram = /instagram\.com/i.test(url);
  const isFacebook  = /facebook\.com/i.test(url);
  const { city, state } = parseFormattedAddress(place.formattedAddress);
  const segment = (place.types || []).find(t =>
    !['point_of_interest', 'establishment', 'service', 'food', 'store'].includes(t)
  ) || 'Outro';

  return {
    id: `gpl_${place.id}`,
    googlePlaceId: place.id,
    companyName: cleanCompanyName(place.displayName?.text || ''),
    displayName: place.displayName?.text || '',
    contactName: '',
    phone: place.nationalPhoneNumber || place.internationalPhoneNumber || '',
    phones: [place.nationalPhoneNumber || place.internationalPhoneNumber].filter(Boolean),
    email: '',
    emails: [],
    cnpj: '',                              // sera resolvido sob demanda no envio
    segment,
    size: '',
    city,
    state,
    position: '',
    source: 'Google Places',
    website:   !isInstagram && !isFacebook ? url : '',
    instagram: isInstagram ? url : '',
    facebook:  isFacebook  ? url : '',
    revenue: null,
    employees: null,
    notes: '',
    status: 'new',
    types: place.types || [],
    businessStatus: place.businessStatus || '',
    formattedAddress: place.formattedAddress || '',
    socios: [],
    atividadesSecundarias: [],
    naturezaJuridica: '',
    inscricaoEstadual: '',
    simplesNacional: false,
    dataAbertura: null,
    prospectType: 'lead',
    partnerCategory: null,
    listName: '',
  };
}

/**
 * Busca empresas via Google Places com filtros simplificados.
 * @param {Object} filters - { segment, city, state }
 * @param {string} pageToken - token de pagina retornado pela request anterior
 * @returns {Promise<{ data, nextPageToken, source: 'google-first' } | null>}
 */
export async function searchProspectsByGoogle(filters = {}, pageToken = '') {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn('[gpSearch] API key nao configurada');
    return null;
  }

  const segment = (filters.segment || '').trim();
  const city    = (filters.city    || '').trim();
  const state   = (filters.state   || '').trim();
  if (!segment && !city && !state) return null;

  const queryParts = [segment, city, state].filter(Boolean);
  const query = queryParts.join(' ');

  const cacheKey = gpSearchCacheKey(query, pageToken);
  const cached = readGpSearchCache(cacheKey);
  if (cached) {
    const converted = readConvertedPlaces();
    if (converted.size > 0) {
      return { ...cached, data: cached.data.filter(p => !converted.has(p.googlePlaceId)) };
    }
    return cached;
  }

  try {
    const body = {
      textQuery: query,
      languageCode: 'pt-BR',
      regionCode: 'BR',
      maxResultCount: 20,
    };
    if (pageToken) body.pageToken = pageToken;

    const res = await fetch(PLACES_TEXT_SEARCH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': FIELD_MASK + ',nextPageToken',
      },
      body: JSON.stringify(body),
    });

    trackGoogleCall();

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.error('[gpSearch] HTTP', res.status, errBody.slice(0, 200));
      // 429 = quota diaria esgotada. 401/403 = key invalida ou sem permissao.
      // Sinaliza pra UI conseguir mostrar mensagem clara.
      const error = res.status === 429 ? 'quota_exceeded'
                  : res.status === 401 || res.status === 403 ? 'unauthorized'
                  : 'http_error';
      return { data: [], nextPageToken: null, source: 'google-first', error, httpStatus: res.status };
    }

    const json = await res.json();
    const prospects = (json.places || [])
      .filter(p => p.businessStatus !== 'CLOSED_PERMANENTLY')
      .map(placeToProspect);

    const result = {
      data: prospects,
      nextPageToken: json.nextPageToken || null,
      source: 'google-first',
    };

    // Cache armazena resultado bruto da Google (sem filtro de converted) —
    // dedup contra ja-convertidos eh feito no leitor pra refletir estado atual.
    writeGpSearchCache(cacheKey, result);

    // Aplica dedup contra placeIds ja convertidos pra pipeline
    const converted = readConvertedPlaces();
    if (converted.size > 0) {
      return { ...result, data: result.data.filter(p => !converted.has(p.googlePlaceId)) };
    }
    return result;
  } catch (err) {
    console.error('[gpSearch] Fetch error:', err);
    return null;
  }
}

export function clearGoogleSearchCache() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(GP_SEARCH_PREFIX)) keys.push(k);
  }
  keys.forEach(k => localStorage.removeItem(k));
  return keys.length;
}

// ─── Dedup: Google placeIds ja enviados pra pipeline ─────────────────────────
// Usado quando o lead vem do modo google-first (sem CNPJ disponivel no momento
// da busca). Sem isso, o usuario veria os mesmos leads em buscas seguintes.

const CONVERTED_PLACES_KEY = 'gp_converted_places';

function readConvertedPlaces() {
  try {
    const raw = localStorage.getItem(CONVERTED_PLACES_KEY);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function writeConvertedPlaces(set) {
  try {
    localStorage.setItem(CONVERTED_PLACES_KEY, JSON.stringify([...set]));
  } catch {
    // localStorage cheio — silencioso
  }
}

/** Marca um Google placeId como ja convertido pra pipeline. */
export function markGooglePlaceConverted(placeId) {
  if (!placeId) return;
  const set = readConvertedPlaces();
  set.add(placeId);
  writeConvertedPlaces(set);
}

/** Lista todos os placeIds ja convertidos. Usado pra filtrar buscas seguintes. */
export function getConvertedGooglePlaces() {
  return readConvertedPlaces();
}

export function clearConvertedGooglePlaces() {
  localStorage.removeItem(CONVERTED_PLACES_KEY);
}

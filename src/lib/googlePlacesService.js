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

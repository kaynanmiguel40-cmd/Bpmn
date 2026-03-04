/**
 * geoService — Fetch e cache de dados geograficos do IBGE
 *
 * APIs usadas:
 * - Malhas v3: geometrias de estados e municipios
 * - Localidades v1: nomes de municipios
 *
 * Todos os dados sao cacheados em memoria para performance.
 */

const IBGE_BASE = 'https://servicodados.ibge.gov.br/api';

const cache = new Map();

async function fetchWithCache(url, key) {
  if (cache.has(key)) return cache.get(key);

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Erro na API IBGE: ${res.status} ${res.statusText}`);

  const data = await res.json();
  cache.set(key, data);
  return data;
}

/** Busca GeoJSON dos 27 estados do Brasil */
export async function fetchBrazilStates() {
  return fetchWithCache(
    `${IBGE_BASE}/v3/malhas/paises/BR?intrarregiao=UF&qualidade=intermediaria&formato=application/vnd.geo+json`,
    'brazil-states'
  );
}

/** Busca GeoJSON dos municipios de um estado (por codigo IBGE) */
export async function fetchStateMunicipalities(ibgeCode) {
  return fetchWithCache(
    `${IBGE_BASE}/v3/malhas/estados/${ibgeCode}?intrarregiao=municipio&qualidade=intermediaria&formato=application/vnd.geo+json`,
    `mun-geo-${ibgeCode}`
  );
}

/** Busca lista de municipios (id + nome) de um estado */
export async function fetchMunicipalityNames(ibgeCode) {
  const data = await fetchWithCache(
    `${IBGE_BASE}/v1/localidades/estados/${ibgeCode}/municipios?orderBy=nome`,
    `mun-names-${ibgeCode}`
  );
  const nameMap = {};
  data.forEach(m => { nameMap[String(m.id)] = m.nome; });
  return nameMap;
}

/** Busca geometria + nomes de municipios em paralelo */
export async function fetchStateDetail(ibgeCode) {
  const [geo, names] = await Promise.all([
    fetchStateMunicipalities(ibgeCode),
    fetchMunicipalityNames(ibgeCode),
  ]);
  return { geo, names };
}

// ── Mapeamento IBGE <-> UF ──

export const IBGE_TO_UF = {
  '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO',
  '21': 'MA', '22': 'PI', '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL', '28': 'SE', '29': 'BA',
  '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP',
  '41': 'PR', '42': 'SC', '43': 'RS',
  '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF',
};

export const UF_TO_IBGE = Object.fromEntries(
  Object.entries(IBGE_TO_UF).map(([k, v]) => [v, k])
);

/** Limpa o cache (util para dev/debug) */
export function clearGeoCache() {
  cache.clear();
}

/**
 * placesService — Busca parceiros potenciais via Google Places API
 *
 * Busca negócios reais (contabilidades, financeiras, advocacias, associações)
 * próximos ao município selecionado no mapa P.O.
 */

/** Categorias de parceiros potenciais para o Fyness */
export const PARTNER_CATEGORIES = {
  accounting: {
    label: 'Contabilidade',
    keyword: 'contabilidade escritório contábil',
    color: '#22d3ee',
    icon: 'Calculator',
  },
  finance: {
    label: 'Serviços Financeiros',
    keyword: 'consultoria financeira assessoria financeira',
    color: '#fbbf24',
    icon: 'DollarSign',
  },
  lawyer: {
    label: 'Advocacia',
    keyword: 'escritório advocacia advogado empresarial',
    color: '#a78bfa',
    icon: 'Scale',
  },
  association: {
    label: 'Associações',
    keyword: 'associação comercial CDL câmara dirigentes lojistas',
    color: '#34d399',
    icon: 'Users',
  },
};

// Cache em memória — evita rebuscar o mesmo município
const searchCache = new Map();
const detailsCache = new Map();

/**
 * Calcula raio de busca em metros a partir do bounding box.
 * Usa fórmula Haversine simplificada na diagonal do bbox.
 * Clamp entre 3000m e 15000m.
 */
export function calcSearchRadius(bounds) {
  const [minLng, minLat, maxLng, maxLat] = bounds;
  const dLat = (maxLat - minLat) * Math.PI / 180;
  const dLng = (maxLng - minLng) * Math.PI / 180;
  const midLat = ((minLat + maxLat) / 2) * Math.PI / 180;
  // Haversine simplificado
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(midLat) * Math.cos(midLat) * Math.sin(dLng / 2) ** 2;
  const distMeters = 2 * 6371000 * Math.asin(Math.sqrt(a));
  // Usa metade da diagonal como raio, clamp
  const radius = Math.round(distMeters / 2);
  return Math.max(3000, Math.min(15000, radius));
}

/**
 * Busca parceiros potenciais em todas as categorias.
 * Faz textSearch em paralelo, merge e deduplica por place_id.
 */
export function searchNearbyPartners(map, center, radiusMeters) {
  const cacheKey = `${center.lat.toFixed(3)},${center.lng.toFixed(3)}`;
  if (searchCache.has(cacheKey)) {
    return Promise.resolve(searchCache.get(cacheKey));
  }

  const service = new window.google.maps.places.PlacesService(map);

  const searchCategory = (categoryKey) => {
    const cat = PARTNER_CATEGORIES[categoryKey];
    return new Promise((resolve) => {
      service.textSearch(
        {
          query: cat.keyword,
          location: center,
          radius: radiusMeters,
        },
        (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
            console.log(`[Places] ${categoryKey}: ${results.length} resultados`);
            resolve(results.map(r => ({ ...r, _category: categoryKey })));
          } else {
            console.warn(`[Places] ${categoryKey}: status=${status}`);
            resolve({ _error: status, _category: categoryKey });
          }
        }
      );
    });
  };

  const categories = Object.keys(PARTNER_CATEGORIES);
  return Promise.all(categories.map(searchCategory)).then((allResults) => {
    // Merge e deduplica por place_id (mantém primeira categoria encontrada)
    const seen = new Set();
    const merged = [];
    const byCategory = {};
    const errors = [];

    categories.forEach(cat => { byCategory[cat] = []; });

    for (const results of allResults) {
      // Se veio objeto de erro em vez de array
      if (results && results._error) {
        errors.push(results);
        continue;
      }
      if (!Array.isArray(results)) continue;
      for (const place of results) {
        if (!seen.has(place.place_id)) {
          seen.add(place.place_id);
          merged.push(place);
          byCategory[place._category].push(place);
        }
      }
    }

    // Se TODAS as categorias falharam, propaga o erro
    if (errors.length === categories.length) {
      const status = errors[0]._error;
      console.error(`[Places] Todas as buscas falharam: ${status}`);
      throw new Error(`Places API: ${status}`);
    }

    console.log(`[Places] Total: ${merged.length} parceiros (${errors.length} categorias falharam)`);
    const result = { places: merged, byCategory };
    searchCache.set(cacheKey, result);
    return result;
  });
}

/**
 * Busca detalhes adicionais de um lugar (telefone, website).
 * Cache por place_id.
 */
export function getPlaceDetails(map, placeId) {
  if (detailsCache.has(placeId)) {
    return Promise.resolve(detailsCache.get(placeId));
  }

  const service = new window.google.maps.places.PlacesService(map);
  return new Promise((resolve) => {
    service.getDetails(
      {
        placeId,
        fields: ['formatted_phone_number', 'website', 'url', 'opening_hours'],
      },
      (result, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && result) {
          detailsCache.set(placeId, result);
          resolve(result);
        } else {
          resolve(null);
        }
      }
    );
  });
}

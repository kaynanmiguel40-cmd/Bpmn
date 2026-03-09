/**
 * usePlacesSearch — Hook para buscar parceiros potenciais via Google Places
 *
 * Gerencia o ciclo de vida da busca: loading, resultados, filtros, seleção.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { searchNearbyPartners, calcSearchRadius, PARTNER_CATEGORIES } from '../services/placesService';
import { computeFeatureBounds } from '../components/po/geoUtils';

export function usePlacesSearch(mapInstance, activeMunicipality) {
  const [places, setPlaces] = useState([]);
  const [placesByCategory, setPlacesByCategory] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null); // null = todos
  const [selectedPlace, setSelectedPlace] = useState(null);
  const cancelledRef = useRef(false);
  const lastSearchRef = useRef(null);

  // TODO: Ativar quando billing do Google Cloud estiver habilitado
  // Busca desabilitada temporariamente — Places API exige billing ativo
  const PLACES_ENABLED = false;

  // Dispara busca quando mapa + município estão prontos
  useEffect(() => {
    if (!PLACES_ENABLED) return;
    if (!mapInstance || !activeMunicipality?.feature) return;

    const bounds = computeFeatureBounds(activeMunicipality.feature);
    const center = {
      lat: (bounds[1] + bounds[3]) / 2,
      lng: (bounds[0] + bounds[2]) / 2,
    };
    const radius = calcSearchRadius(bounds);
    const searchKey = `${center.lat.toFixed(3)},${center.lng.toFixed(3)}`;

    // Não rebusca se é o mesmo município
    if (lastSearchRef.current === searchKey) return;

    cancelledRef.current = false;
    setLoading(true);
    setError(null);
    setSelectedPlace(null);
    setActiveCategory(null);

    // Debounce 500ms
    const timer = setTimeout(() => {
      searchNearbyPartners(mapInstance, center, radius)
        .then((result) => {
          if (cancelledRef.current) return;
          lastSearchRef.current = searchKey;
          setPlaces(result.places);
          setPlacesByCategory(result.byCategory);
          setLoading(false);
        })
        .catch((err) => {
          if (cancelledRef.current) return;
          console.error('Erro ao buscar parceiros:', err);
          setError('Erro ao buscar parceiros na região');
          setLoading(false);
        });
    }, 500);

    return () => {
      cancelledRef.current = true;
      clearTimeout(timer);
    };
  }, [mapInstance, activeMunicipality]);

  // Filtra por categoria ativa
  const filteredPlaces = useMemo(() => {
    if (!activeCategory) return places;
    return placesByCategory[activeCategory] || [];
  }, [places, placesByCategory, activeCategory]);

  // Estatísticas
  const stats = useMemo(() => {
    const byCat = {};
    Object.keys(PARTNER_CATEGORIES).forEach(key => {
      byCat[key] = (placesByCategory[key] || []).length;
    });
    return { total: places.length, byCategory: byCat };
  }, [places, placesByCategory]);

  const clearSelection = useCallback(() => setSelectedPlace(null), []);

  return {
    places,
    placesByCategory,
    loading,
    error,
    activeCategory,
    setActiveCategory,
    selectedPlace,
    setSelectedPlace,
    clearSelection,
    filteredPlaces,
    stats,
  };
}

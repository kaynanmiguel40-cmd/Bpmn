/**
 * MunicipalityMapView - Google Maps no 3º nível do mapa P.O.
 *
 * Mostra mapa do município com busca automática de parceiros potenciais
 * via Google Places API + painel lateral com lista filtrável.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { Loader2, AlertTriangle, Building2 } from 'lucide-react';
import { computeFeatureBounds } from './geoUtils';
import { usePlacesSearch } from '../../hooks/usePlacesSearch';
import PlacesMarkerLayer from './PlacesMarkerLayer';
import NearbyBusinessPanel from './NearbyBusinessPanel';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Array estável fora do componente — evita re-render infinito do loader
const LIBRARIES = ['places'];

/** Dark map style — combina com bg-slate-950 do SVG */
const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0f172a' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#94a3b8' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#475569' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0d2818' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e3a5f' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#334155' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#64748b' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1e293b' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0c4a6e' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#334155' }] },
];

const MAP_CONTAINER_STYLE = {
  width: '100%',
  height: '100%',
  borderRadius: '0.75rem',
};

const MAP_OPTIONS = {
  styles: DARK_MAP_STYLE,
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: true,
  fullscreenControl: true,
  gestureHandling: 'greedy',
  backgroundColor: '#0f172a',
};

function calcZoomFromBounds(bounds) {
  const [minLng, minLat, maxLng, maxLat] = bounds;
  const dLat = maxLat - minLat;
  const dLng = maxLng - minLng;
  const diagonal = Math.sqrt(dLat * dLat + dLng * dLng);
  if (diagonal < 0.15) return 14;
  if (diagonal < 0.3) return 13;
  if (diagonal < 0.6) return 12;
  if (diagonal < 1.2) return 11;
  if (diagonal < 2.5) return 10;
  return 9;
}

export default function MunicipalityMapView({ activeMunicipality, activeStateUf }) {
  const [mapInstance, setMapInstance] = useState(null);
  const [panelOpen, setPanelOpen] = useState(true);
  const polygonRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  });

  // Centro e zoom do GeoJSON IBGE
  const { center, zoom } = useMemo(() => {
    if (!activeMunicipality?.feature) {
      return { center: { lat: -14.235, lng: -51.9253 }, zoom: 12 };
    }
    const bounds = computeFeatureBounds(activeMunicipality.feature);
    return {
      center: {
        lat: (bounds[1] + bounds[3]) / 2,
        lng: (bounds[0] + bounds[2]) / 2,
      },
      zoom: calcZoomFromBounds(bounds),
    };
  }, [activeMunicipality]);

  // Hook de busca de parceiros via Places API
  const {
    filteredPlaces,
    stats,
    loading: placesLoading,
    error: placesError,
    activeCategory,
    setActiveCategory,
    selectedPlace,
    setSelectedPlace,
    clearSelection,
  } = usePlacesSearch(mapInstance, activeMunicipality);

  // Pan + zoom no negócio ao clicar no card do painel
  const handleSelectPlace = useCallback((place) => {
    setSelectedPlace(place);
    if (mapInstance && place?.geometry?.location) {
      mapInstance.panTo({
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      });
      mapInstance.setZoom(16);
    }
  }, [mapInstance, setSelectedPlace]);

  // Desenha contorno do município
  const drawMunicipalityBorder = useCallback((map, feature) => {
    if (polygonRef.current) {
      polygonRef.current.forEach(p => p.setMap(null));
      polygonRef.current = null;
    }

    const { type, coordinates } = feature.geometry;
    const polygons = [];
    const createPoly = (paths) => new window.google.maps.Polygon({
      paths,
      strokeColor: '#22d3ee',
      strokeOpacity: 0.8,
      strokeWeight: 2.5,
      fillColor: '#22d3ee',
      fillOpacity: 0.06,
      map,
    });

    if (type === 'Polygon') {
      polygons.push(createPoly(coordinates[0].map(([lng, lat]) => ({ lat, lng }))));
    } else if (type === 'MultiPolygon') {
      coordinates.forEach(poly => {
        polygons.push(createPoly(poly[0].map(([lng, lat]) => ({ lat, lng }))));
      });
    }
    polygonRef.current = polygons;
  }, []);

  const onMapLoad = useCallback((map) => {
    setMapInstance(map);
    if (!activeMunicipality?.feature) return;
    map.setCenter(center);
    map.setZoom(zoom);
    drawMunicipalityBorder(map, activeMunicipality.feature);
  }, [activeMunicipality, center, zoom, drawMunicipalityBorder]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (polygonRef.current) {
        polygonRef.current.forEach(p => p.setMap(null));
      }
    };
  }, []);

  // Re-draw quando muda o município
  useEffect(() => {
    if (mapInstance && activeMunicipality?.feature) {
      mapInstance.setCenter(center);
      mapInstance.setZoom(zoom);
      drawMunicipalityBorder(mapInstance, activeMunicipality.feature);
    }
  }, [mapInstance, activeMunicipality, center, zoom, drawMunicipalityBorder]);

  // ── Sem API key ──
  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 rounded-xl">
        <div className="text-center max-w-sm px-4">
          <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="text-sm text-amber-300 font-medium mb-2">Google Maps API Key não configurada</p>
          <p className="text-xs text-slate-400 mb-1">
            Adicione sua key no arquivo <code className="text-cyan-400">.env</code>:
          </p>
          <code className="text-[11px] text-cyan-400 bg-slate-800/80 px-3 py-1.5 rounded-lg block mt-2">
            VITE_GOOGLE_MAPS_API_KEY=AIza...
          </code>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 rounded-xl">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto mb-3" />
          <p className="text-sm text-rose-400 mb-1">Erro ao carregar Google Maps</p>
          <p className="text-xs text-slate-500">{loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 rounded-xl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Carregando Google Maps...</p>
        </div>
      </div>
    );
  }

  // Places desabilitado temporariamente (billing pendente)
  const placesEnabled = filteredPlaces.length > 0 || placesLoading;

  return (
    <div className="relative w-full h-full flex">
      {/* Mapa */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={MAP_CONTAINER_STYLE}
          center={center}
          zoom={zoom}
          onLoad={onMapLoad}
          options={MAP_OPTIONS}
          onClick={clearSelection}
        >
          {placesEnabled && (
            <PlacesMarkerLayer
              filteredPlaces={filteredPlaces}
              selectedPlace={selectedPlace}
              onSelectPlace={handleSelectPlace}
              onClearSelection={clearSelection}
            />
          )}
        </GoogleMap>
      </div>

      {/* Painel lateral — só aparece quando Places está ativo e tem dados */}
      {placesEnabled && (
        <>
          {!panelOpen && (
            <button
              onClick={() => setPanelOpen(true)}
              className="absolute top-3 right-3 z-20 flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900/90 backdrop-blur-sm border border-slate-700/50 text-slate-300 hover:text-white hover:border-cyan-500/40 transition-colors"
            >
              <Building2 className="w-4 h-4 text-cyan-400" />
              <span className="text-[11px] font-semibold">Parceiros</span>
              {stats.total > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">
                  {stats.total}
                </span>
              )}
            </button>
          )}
          <div
            className={`flex-shrink-0 transition-all duration-300 overflow-hidden ${
              panelOpen ? 'w-[340px]' : 'w-0'
            }`}
          >
            <NearbyBusinessPanel
              places={filteredPlaces}
              stats={stats}
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
              selectedPlace={selectedPlace}
              onSelectPlace={handleSelectPlace}
              onClose={() => setPanelOpen(false)}
              municipalityName={activeMunicipality?.name}
              loading={placesLoading}
              error={placesError}
            />
          </div>
        </>
      )}
    </div>
  );
}

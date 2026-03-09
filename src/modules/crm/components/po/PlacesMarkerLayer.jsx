/**
 * PlacesMarkerLayer — Markers de parceiros potenciais no Google Maps
 *
 * Renderiza MarkerF colorido por categoria + InfoWindow ao clicar.
 */

import { MarkerF, InfoWindowF } from '@react-google-maps/api';
import { PARTNER_CATEGORIES } from '../../services/placesService';

/** Cria SVG data URL para marker colorido */
function createMarkerIcon(color, isActive = false) {
  const size = isActive ? 36 : 28;
  const stroke = isActive ? '#ffffff' : '#0f172a';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${Math.round(size * 1.3)}" viewBox="0 0 28 36">
    <path d="M14 0C6.3 0 0 6.3 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.3 21.7 0 14 0z"
          fill="${color}" stroke="${stroke}" stroke-width="1.5" opacity="${isActive ? 1 : 0.85}"/>
    <circle cx="14" cy="14" r="5" fill="white" opacity="0.9"/>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

/** Renderiza estrelas de rating */
function StarRating({ rating }) {
  if (!rating) return null;
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  const stars = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push('★');
    else if (i === full && half) stars.push('★');
    else stars.push('☆');
  }
  return (
    <span style={{ color: '#fbbf24', fontSize: '12px', letterSpacing: '1px' }}>
      {stars.join('')}
      <span style={{ color: '#94a3b8', fontSize: '10px', marginLeft: '4px' }}>{rating.toFixed(1)}</span>
    </span>
  );
}

export default function PlacesMarkerLayer({ filteredPlaces, selectedPlace, onSelectPlace, onClearSelection }) {
  return (
    <>
      {filteredPlaces.map((place) => {
        const cat = PARTNER_CATEGORIES[place._category];
        const isSelected = selectedPlace?.place_id === place.place_id;
        const pos = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };

        return (
          <MarkerF
            key={place.place_id}
            position={pos}
            icon={{
              url: createMarkerIcon(cat?.color || '#64748b', isSelected),
              scaledSize: new window.google.maps.Size(
                isSelected ? 36 : 28,
                isSelected ? 47 : 36
              ),
              anchor: new window.google.maps.Point(
                isSelected ? 18 : 14,
                isSelected ? 47 : 36
              ),
            }}
            onClick={() => onSelectPlace(place)}
            zIndex={isSelected ? 999 : 1}
          />
        );
      })}

      {selectedPlace && (
        <InfoWindowF
          position={{
            lat: selectedPlace.geometry.location.lat(),
            lng: selectedPlace.geometry.location.lng(),
          }}
          onCloseClick={onClearSelection}
          options={{ pixelOffset: new window.google.maps.Size(0, -36) }}
        >
          <div style={{
            fontFamily: 'system-ui, sans-serif',
            minWidth: '200px',
            maxWidth: '280px',
            padding: '4px',
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '0 0 4px 0', color: '#0f172a' }}>
              {selectedPlace.name}
            </h3>
            {selectedPlace.formatted_address && (
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0' }}>
                {selectedPlace.formatted_address}
              </p>
            )}
            {selectedPlace.vicinity && !selectedPlace.formatted_address && (
              <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0' }}>
                {selectedPlace.vicinity}
              </p>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
              <span style={{
                display: 'inline-block',
                padding: '1px 8px',
                borderRadius: '9999px',
                fontSize: '10px',
                fontWeight: 600,
                backgroundColor: (PARTNER_CATEGORIES[selectedPlace._category]?.color || '#64748b') + '20',
                color: PARTNER_CATEGORIES[selectedPlace._category]?.color || '#64748b',
                border: `1px solid ${(PARTNER_CATEGORIES[selectedPlace._category]?.color || '#64748b')}40`,
              }}>
                {PARTNER_CATEGORIES[selectedPlace._category]?.label || 'Outro'}
              </span>
              <StarRating rating={selectedPlace.rating} />
            </div>
          </div>
        </InfoWindowF>
      )}
    </>
  );
}

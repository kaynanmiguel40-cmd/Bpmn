/**
 * NearbyBusinessPanel — Painel lateral de parceiros potenciais
 *
 * Slide-in panel (340px) com lista filtrável de negócios
 * encontrados via Google Places API.
 */

import { X, Loader2, MapPin, Star, Building2, SearchX } from 'lucide-react';
import { PARTNER_CATEGORIES } from '../../services/placesService';

/** Card de negócio individual */
function BusinessCard({ place, isSelected, onSelect }) {
  const cat = PARTNER_CATEGORIES[place._category];
  return (
    <button
      onClick={() => onSelect(place)}
      className={`w-full text-left p-3 rounded-lg border transition-all duration-150 ${
        isSelected
          ? 'bg-slate-700/60 border-cyan-500/40'
          : 'bg-slate-800/50 border-slate-700/30 hover:border-slate-600 hover:bg-slate-800/80'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-[13px] font-semibold text-slate-100 leading-tight line-clamp-2">
          {place.name}
        </h4>
        {place.rating && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[11px] text-amber-400 font-medium">{place.rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      {(place.formatted_address || place.vicinity) && (
        <p className="text-[11px] text-slate-400 mt-1 flex items-start gap-1 line-clamp-2">
          <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5 text-slate-500" />
          {place.formatted_address || place.vicinity}
        </p>
      )}

      <div className="mt-2">
        <span
          className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{
            backgroundColor: (cat?.color || '#64748b') + '15',
            color: cat?.color || '#64748b',
            border: `1px solid ${(cat?.color || '#64748b')}30`,
          }}
        >
          {cat?.label || 'Outro'}
        </span>
      </div>
    </button>
  );
}

export default function NearbyBusinessPanel({
  places,
  stats,
  activeCategory,
  onCategoryChange,
  selectedPlace,
  onSelectPlace,
  onClose,
  municipalityName,
  loading,
  error,
}) {
  const categories = Object.entries(PARTNER_CATEGORIES);

  return (
    <div className="w-[340px] h-full bg-slate-900 border-l border-slate-700/50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 flex-shrink-0">
        <div>
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            Parceiros Potenciais
          </h3>
          {municipalityName && (
            <p className="text-[11px] text-slate-400 mt-0.5">{municipalityName}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      {!loading && stats.total > 0 && (
        <div className="grid grid-cols-2 gap-2 px-4 py-3 border-b border-slate-700/50 flex-shrink-0">
          {categories.map(([key, cat]) => (
            <div
              key={key}
              className="rounded-lg px-3 py-2 text-center"
              style={{
                backgroundColor: cat.color + '10',
                border: `1px solid ${cat.color}25`,
              }}
            >
              <p className="text-lg font-bold" style={{ color: cat.color }}>
                {stats.byCategory[key] || 0}
              </p>
              <p className="text-[10px] text-slate-400">{cat.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter chips */}
      {!loading && stats.total > 0 && (
        <div className="flex gap-2 px-4 py-2.5 overflow-x-auto flex-shrink-0 border-b border-slate-700/50">
          <button
            onClick={() => onCategoryChange(null)}
            className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
              activeCategory === null
                ? 'bg-cyan-500 text-slate-900'
                : 'bg-slate-800 text-slate-400 border border-slate-600 hover:text-slate-200'
            }`}
          >
            Todos ({stats.total})
          </button>
          {categories.map(([key, cat]) => {
            const count = stats.byCategory[key] || 0;
            if (count === 0) return null;
            return (
              <button
                key={key}
                onClick={() => onCategoryChange(key)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  activeCategory === key
                    ? 'text-slate-900'
                    : 'bg-slate-800 border border-slate-600 hover:text-slate-200'
                }`}
                style={activeCategory === key ? { backgroundColor: cat.color } : { color: cat.color }}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      )}

      {/* Lista */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
        {loading && (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-cyan-400 animate-spin mb-3" />
            <p className="text-sm text-slate-400">Buscando parceiros...</p>
            <p className="text-[10px] text-slate-500 mt-1">na região de {municipalityName}</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <SearchX className="w-8 h-8 text-rose-400 mb-3" />
            <p className="text-sm text-rose-400">{error}</p>
          </div>
        )}

        {!loading && !error && places.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <SearchX className="w-8 h-8 text-slate-500 mb-3" />
            <p className="text-sm text-slate-400">Nenhum parceiro encontrado</p>
            <p className="text-[10px] text-slate-500 mt-1">nesta região</p>
          </div>
        )}

        {!loading && !error && places.map((place) => (
          <BusinessCard
            key={place.place_id}
            place={place}
            isSelected={selectedPlace?.place_id === place.place_id}
            onSelect={onSelectPlace}
          />
        ))}
      </div>

      {/* Footer */}
      {!loading && stats.total > 0 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-700/50 flex-shrink-0">
          <span className="text-[10px] text-slate-500">
            {stats.total} parceiro(s) encontrado(s)
          </span>
          <span className="text-[9px] text-slate-600">Powered by Google</span>
        </div>
      )}
    </div>
  );
}

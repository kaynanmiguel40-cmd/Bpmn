/**
 * StateDetailPanel - Painel lateral de detalhes do estado
 *
 * Abre pela direita quando um estado é selecionado no mapa.
 * Mostra: header com nome/região, stats do estado, lista de cidades com busca.
 */

import { useState, useMemo } from 'react';
import { X, Search, MapPin, Users, Calendar, CheckCircle, ChevronRight, Building2 } from 'lucide-react';
import {
  BRAZIL_STATES,
  REGIONS,
  PROSPECT_STATUS,
  getStateProspection,
  getCityStatus,
} from '../../data/brazilStates';
import CityProspectCard from './CityProspectCard';

export default function StateDetailPanel({ selectedState, onClose }) {
  const [citySearch, setCitySearch] = useState('');

  const stateData = useMemo(() => {
    if (!selectedState) return null;
    const state = BRAZIL_STATES.find(s => s.uf === selectedState);
    if (!state) return null;
    const prospection = getStateProspection(selectedState);
    const region = REGIONS[state.region];
    return { state, prospection, region };
  }, [selectedState]);

  const filteredCities = useMemo(() => {
    if (!stateData) return [];
    const search = citySearch.toLowerCase().trim();
    if (!search) return stateData.state.cities;
    return stateData.state.cities.filter(c =>
      c.name.toLowerCase().includes(search)
    );
  }, [stateData, citySearch]);

  const cityStats = useMemo(() => {
    if (!stateData) return { total: 0, prospected: 0, scheduled: 0, closed: 0 };
    const cities = stateData.state.cities;
    let prospected = 0, scheduled = 0, closed = 0;
    cities.forEach(city => {
      const cs = getCityStatus(selectedState, city.name);
      if (cs) {
        if (cs.status === 'prospecting') prospected++;
        if (cs.status === 'scheduled') scheduled++;
        if (cs.status === 'closed') closed++;
      }
    });
    return { total: cities.length, prospected, scheduled, closed };
  }, [stateData, selectedState]);

  if (!stateData) return null;

  const { state, prospection, region } = stateData;

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-700/50 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-slate-200 dark:border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: region?.lightBg || '#cbd5e1' }}
            />
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {state.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {region?.name}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {state.capital}
          </span>
        </div>
        {/* Status badge */}
        <div className="mt-2">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${PROSPECT_STATUS[prospection.status]?.bg || ''} ${PROSPECT_STATUS[prospection.status]?.text || ''}`}>
            {PROSPECT_STATUS[prospection.status]?.label}
          </span>
        </div>
      </div>

      {/* Stats mini cards */}
      <div className="flex-shrink-0 grid grid-cols-2 gap-2 px-4 py-3 border-b border-slate-100 dark:border-slate-700/50">
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-slate-400 dark:text-slate-500 mb-0.5">
            <MapPin className="w-3 h-3" />
          </div>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{cityStats.total}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Cidades</p>
        </div>
        <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-500 dark:text-amber-400 mb-0.5">
            <Users className="w-3 h-3" />
          </div>
          <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{cityStats.prospected}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Prospectando</p>
        </div>
        <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-blue-500 dark:text-blue-400 mb-0.5">
            <Calendar className="w-3 h-3" />
          </div>
          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{cityStats.scheduled}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Visitas agend.</p>
        </div>
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-900/20 p-2 text-center">
          <div className="flex items-center justify-center gap-1 text-emerald-500 dark:text-emerald-400 mb-0.5">
            <CheckCircle className="w-3 h-3" />
          </div>
          <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{cityStats.closed}</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Fechados</p>
        </div>
      </div>

      {/* City search */}
      <div className="flex-shrink-0 px-4 py-2 border-b border-slate-100 dark:border-slate-700/50">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Buscar cidade..."
            value={citySearch}
            onChange={e => setCitySearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-fyness-primary focus:outline-none"
          />
        </div>
      </div>

      {/* City list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {filteredCities.length > 0 ? (
          filteredCities.map(city => (
            <CityProspectCard
              key={city.name}
              city={city}
              cityStatus={getCityStatus(selectedState, city.name)}
            />
          ))
        ) : (
          <div className="text-center py-8">
            <MapPin className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400 dark:text-slate-500">
              {citySearch ? 'Nenhuma cidade encontrada' : 'Nenhuma cidade cadastrada'}
            </p>
          </div>
        )}
      </div>

      {/* Footer info */}
      {prospection.lastActivity && (
        <div className="flex-shrink-0 px-4 py-2 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50">
          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
            Última atividade: {new Date(prospection.lastActivity).toLocaleDateString('pt-BR')}
          </p>
        </div>
      )}
    </div>
  );
}

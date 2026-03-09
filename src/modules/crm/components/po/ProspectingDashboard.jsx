/**
 * ProspectingDashboard - Orquestrador principal da tela P.O.
 *
 * Layout otimizado: KPIs compactos no topo, mapa ocupa maximo de espaco.
 */

import { useState, useMemo } from 'react';
import { Map, Calendar, TrendingUp, Crosshair, Globe } from 'lucide-react';
import BrazilMap, { COLOR_MODES } from './BrazilMap';
import StateDetailPanel from './StateDetailPanel';
import { getProspectionStats } from '../../data/brazilStates';
import { useDealsWithMeetings } from '../../hooks/useCrmQueries';

export default function ProspectingDashboard() {
  const [selectedState, setSelectedState] = useState(null);
  const [colorMode, setColorMode] = useState(COLOR_MODES.REGION);

  const stats = useMemo(() => getProspectionStats(), []);

  // Reunioes agendadas para pins no mapa
  const { data: dealsWithMeetings = [] } = useDealsWithMeetings();
  const meetingPins = useMemo(() =>
    dealsWithMeetings
      .filter(d => d.meetingCity)
      .map(d => ({
        dealId: d.id,
        title: d.title,
        city: d.meetingCity,
        uf: d.company?.state || d.contact?.state || '',
        meetingDate: d.meetingDate,
        companyName: d.company?.name || d.title,
      })),
    [dealsWithMeetings]
  );

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Top bar: KPIs compactos + toggle */}
      <div className="flex-shrink-0 flex items-center justify-between gap-3 flex-wrap">
        {/* KPI chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <KpiChip icon={Crosshair} value={stats.statesProspecting} suffix={`/${stats.totalStates}`} label="Estados" color="amber" />
          <KpiChip icon={Map} value={stats.citiesProspected} label="Cidades" color="blue" />
          <KpiChip icon={Calendar} value={stats.scheduledVisits} label="Visitas" color="violet" />
          <KpiChip icon={TrendingUp} value={`${stats.conversionRate}%`} label="Conversão" color="emerald" />
        </div>

        {/* Color mode toggle */}
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setColorMode(COLOR_MODES.REGION)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-200 ${
                colorMode === COLOR_MODES.REGION
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Regiões
            </button>
            <button
              onClick={() => setColorMode(COLOR_MODES.STATUS)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-all duration-200 ${
                colorMode === COLOR_MODES.STATUS
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
            >
              Status
            </button>
          </div>
        </div>
      </div>

      {/* Map + Panel — ocupa todo o espaco restante */}
      <div className="flex-1 flex gap-0 rounded-xl border border-slate-700/50 overflow-hidden min-h-0">
        {/* Map */}
        <div className={`flex-1 min-w-0 transition-all duration-300 h-full`}>
          <BrazilMap
            selectedState={selectedState}
            onSelectState={setSelectedState}
            colorMode={colorMode}
            meetingPins={meetingPins}
          />
        </div>

        {/* Panel slide-in */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden h-full ${
            selectedState ? 'w-[340px] opacity-100' : 'w-0 opacity-0'
          }`}
        >
          {selectedState && (
            <StateDetailPanel
              selectedState={selectedState}
              onClose={() => setSelectedState(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** KPI chip compacto — ocupa minimo espaco vertical */
function KpiChip({ icon: Icon, value, suffix, label, color }) {
  const colors = {
    amber:   'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200/50 dark:border-amber-700/30',
    blue:    'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200/50 dark:border-blue-700/30',
    violet:  'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-200/50 dark:border-violet-700/30',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200/50 dark:border-emerald-700/30',
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${colors[color]}`}>
      <Icon className="w-3.5 h-3.5" />
      <span className="text-sm font-bold">{value}</span>
      {suffix && <span className="text-[10px] opacity-60 -ml-1">{suffix}</span>}
      <span className="text-[10px] opacity-60">{label}</span>
    </div>
  );
}

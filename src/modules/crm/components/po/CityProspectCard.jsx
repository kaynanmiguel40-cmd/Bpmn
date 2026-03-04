/**
 * CityProspectCard - Card compacto para cidade no painel de prospecção
 *
 * Exibe: nome, população, status, responsável, última atividade, notas
 * Padrão visual CRM com dark mode completo
 */

import { Circle, Clock, Calendar, CheckCircle, MapPin, User, FileText } from 'lucide-react';
import { PROSPECT_STATUS } from '../../data/brazilStates';

const STATUS_ICONS = {
  none: Circle,
  prospecting: Clock,
  scheduled: Calendar,
  closed: CheckCircle,
};

function formatPopulation(pop) {
  if (pop >= 1_000_000) return `${(pop / 1_000_000).toFixed(1)}M hab.`;
  if (pop >= 1_000) return `${(pop / 1_000).toFixed(0)}mil hab.`;
  return `${pop} hab.`;
}

export default function CityProspectCard({ city, cityStatus }) {
  const status = cityStatus?.status || city.status || 'none';
  const config = PROSPECT_STATUS[status];
  const StatusIcon = STATUS_ICONS[status] || Circle;

  return (
    <div className="group relative rounded-lg border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-800/50 p-3 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm transition-all duration-200">
      {/* Header: city name + status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {city.name}
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              {formatPopulation(city.pop)}
            </p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${config?.bg || 'bg-slate-200 dark:bg-slate-700'} ${config?.text || 'text-slate-500 dark:text-slate-400'}`}>
          <StatusIcon className="w-3 h-3" />
          {config?.label || 'Sem prospecção'}
        </span>
      </div>

      {/* Details (only for cities with active prospection) */}
      {cityStatus && (
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-700/50">
          {cityStatus.responsible && (
            <div className="flex items-center gap-1.5">
              <User className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span className="text-[11px] text-slate-600 dark:text-slate-300">
                {cityStatus.responsible}
              </span>
            </div>
          )}
          {cityStatus.notes && (
            <div className="flex items-start gap-1.5">
              <FileText className="w-3 h-3 text-slate-400 dark:text-slate-500 mt-0.5" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                {cityStatus.notes}
              </span>
            </div>
          )}
          {cityStatus.lastActivity && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                {new Date(cityStatus.lastActivity).toLocaleDateString('pt-BR')}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

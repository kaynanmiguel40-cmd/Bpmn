/**
 * CrmForecastPage - Previsao de receita do CRM.
 * Placeholder que consumira getForecastReport().
 */

import { TrendingUp } from 'lucide-react';
import { CrmPageHeader, CrmEmptyState } from '../components/ui';

export function CrmForecastPage() {
  return (
    <div>
      <CrmPageHeader
        title="Forecast"
        subtitle="Previsao de receita ponderada por probabilidade"
      />

      <CrmEmptyState
        icon={TrendingUp}
        title="Forecast em construcao"
        description="O modulo de previsao de receita sera implementado em breve com graficos mensais e pipeline ponderado."
      />
    </div>
  );
}

export default CrmForecastPage;

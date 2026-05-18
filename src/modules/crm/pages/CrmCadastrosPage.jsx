/**
 * CrmCadastrosPage - Unifica Contatos e Empresas em uma unica aba.
 *
 * Sub-tabs: Contatos (default) | Empresas. Persiste a aba selecionada
 * via URL (?aba=) pra dar pra compartilhar link direto.
 *
 * Reaproveita CrmContactsPage e CrmCompaniesPage como componentes
 * internos — toda a logica de listagem/CRUD continua nelas.
 */

import { Users, Building2 } from 'lucide-react';
import { CrmPageHeader } from '../components/ui';
import { useUrlState } from '../../../hooks/useUrlState';
import CrmContactsPage from './CrmContactsPage';
import CrmCompaniesPage from './CrmCompaniesPage';

const TABS = [
  { id: 'contatos', label: 'Contatos',  icon: Users },
  { id: 'empresas', label: 'Empresas',  icon: Building2 },
];

export function CrmCadastrosPage() {
  const [aba, setAba] = useUrlState('aba', 'contatos');
  const active = TABS.find(t => t.id === aba) || TABS[0];

  return (
    <div className="space-y-4">
      <CrmPageHeader
        title="Cadastros"
        subtitle="Contatos e empresas em um so lugar"
      />

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = active.id === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAba(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Conteudo da sub-tab */}
      {active.id === 'contatos' && <CrmContactsPage embedded />}
      {active.id === 'empresas' && <CrmCompaniesPage embedded />}
    </div>
  );
}

export default CrmCadastrosPage;

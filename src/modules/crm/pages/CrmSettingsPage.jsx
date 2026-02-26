/**
 * CrmSettingsPage - Configuracoes do CRM.
 * Placeholder para gerenciar pipelines, stages, campos customizados.
 */

import { Settings, Kanban, Tag, Columns } from 'lucide-react';
import { CrmPageHeader } from '../components/ui';

const settingSections = [
  {
    title: 'Pipelines e Etapas',
    description: 'Gerenciar pipelines, renomear etapas, alterar cores e ordem.',
    icon: Kanban,
    color: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
  },
  {
    title: 'Tags e Segmentos',
    description: 'Criar e gerenciar tags para classificar contatos e negocios.',
    icon: Tag,
    color: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
  },
  {
    title: 'Campos Personalizados',
    description: 'Adicionar campos extras em contatos, empresas e negocios.',
    icon: Columns,
    color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  },
  {
    title: 'Geral',
    description: 'Moeda padrao, formato de data, notificacoes CRM.',
    icon: Settings,
    color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  },
];

export function CrmSettingsPage() {
  return (
    <div>
      <CrmPageHeader
        title="Configuracoes"
        subtitle="Personalize o CRM de acordo com seu processo"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {settingSections.map((section) => {
          const Icon = section.icon;
          return (
            <div
              key={section.title}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 hover:shadow-md transition-shadow cursor-pointer group"
            >
              <div className="flex items-start gap-4">
                <div className={`w-11 h-11 rounded-xl ${section.color} flex items-center justify-center shrink-0`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{section.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default CrmSettingsPage;

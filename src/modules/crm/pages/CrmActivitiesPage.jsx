/**
 * CrmActivitiesPage - Lista de atividades com filtros por tipo e status.
 */

import { useState } from 'react';
import { CalendarCheck, Plus, Phone, Mail, Video, Users, MapPin, FileText } from 'lucide-react';
import { CrmPageHeader, CrmDataTable, CrmBadge } from '../components/ui';
import { useCrmActivities } from '../hooks/useCrmQueries';

const typeIcons = {
  call: Phone,
  email: Mail,
  meeting: Video,
  visit: MapPin,
  task: FileText,
  follow_up: Users,
};

const typeLabels = {
  call: 'Ligacao',
  email: 'Email',
  meeting: 'Reuniao',
  visit: 'Visita',
  task: 'Tarefa',
  follow_up: 'Follow-up',
};

const columns = [
  {
    key: 'title',
    label: 'Atividade',
    sortable: true,
    render: (val, row) => {
      const Icon = typeIcons[row.type] || CalendarCheck;
      return (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <Icon size={14} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">{val}</div>
            <div className="text-xs text-slate-400">{typeLabels[row.type] || row.type}</div>
          </div>
        </div>
      );
    },
  },
  {
    key: 'startDate',
    label: 'Data',
    sortable: true,
    render: (val) => val ? new Date(val).toLocaleDateString('pt-BR') : '—',
  },
  {
    key: 'completed',
    label: 'Status',
    render: (val) => (
      <CrmBadge variant={val ? 'success' : 'warning'} dot>
        {val ? 'Concluida' : 'Pendente'}
      </CrmBadge>
    ),
  },
  {
    key: 'contact',
    label: 'Contato',
    render: (val, row) => row.contact?.name || '—',
  },
  {
    key: 'deal',
    label: 'Negocio',
    render: (val, row) => row.deal?.title || '—',
  },
];

export function CrmActivitiesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCrmActivities({ page, perPage: 25 });

  return (
    <div>
      <CrmPageHeader
        title="Atividades"
        subtitle="Ligacoes, reunioes, tarefas e follow-ups"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16} />
            Nova Atividade
          </button>
        }
      />

      <CrmDataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        emptyMessage="Nenhuma atividade encontrada"
        emptyIcon={CalendarCheck}
        pagination={{
          page,
          perPage: 25,
          total: data?.count || 0,
          onPageChange: setPage,
        }}
      />
    </div>
  );
}

export default CrmActivitiesPage;

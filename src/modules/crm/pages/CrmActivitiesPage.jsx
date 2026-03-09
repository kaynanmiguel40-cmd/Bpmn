/**
 * CrmActivitiesPage - Lista de atividades com CRUD completo.
 */

import { useState } from 'react';
import { CalendarCheck, Plus, Phone, Mail, Video, FileText, MapPin, UtensilsCrossed, Pencil, Trash2, CheckCircle } from 'lucide-react';
import { CrmPageHeader, CrmDataTable, CrmBadge, CrmConfirmDialog } from '../components/ui';
import { useCrmActivities, useDeleteCrmActivity, useCompleteCrmActivity } from '../hooks/useCrmQueries';
import { ActivityFormModal } from '../components/ActivityFormModal';

const typeIcons = {
  call: Phone,
  email: Mail,
  meeting: Video,
  visit: MapPin,
  task: FileText,
  lunch: UtensilsCrossed,
  follow_up: CalendarCheck,
};

const typeLabels = {
  call: 'Ligacao',
  email: 'Email',
  meeting: 'Reuniao',
  visit: 'Visita',
  task: 'Tarefa',
  lunch: 'Almoco',
  follow_up: 'Follow-up',
};

export function CrmActivitiesPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCrmActivities({ page, perPage: 25 });

  const deleteMutation = useDeleteCrmActivity();
  const completeMutation = useCompleteCrmActivity();

  const [formOpen, setFormOpen] = useState(false);
  const [editActivity, setEditActivity] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleNew = () => { setEditActivity(null); setFormOpen(true); };
  const handleEdit = (activity) => { setEditActivity(activity); setFormOpen(true); };
  const handleDelete = async () => {
    if (!deleteTarget) return;
    await deleteMutation.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  const columns = [
    {
      key: 'title',
      label: 'Atividade',
      sortable: true,
      render: (val, row) => {
        const Icon = typeIcons[row.type] || CalendarCheck;
        return (
          <button type="button" onClick={() => handleEdit(row)} className="text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                <Icon size={14} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="font-medium text-slate-800 dark:text-slate-200">{val}</div>
                <div className="text-xs text-slate-400">{typeLabels[row.type] || row.type}</div>
              </div>
            </div>
          </button>
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
      render: (val, row) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">{row.contact?.name || '—'}</span>
      ),
    },
    {
      key: 'deal',
      label: 'Negocio',
      render: (val, row) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">{row.deal?.title || '—'}</span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!row.completed && (
            <button onClick={(e) => { e.stopPropagation(); completeMutation.mutate(row.id); }}
              title="Marcar como concluida"
              className="p-1 rounded text-slate-400 hover:text-emerald-600 transition-colors">
              <CheckCircle size={14} />
            </button>
          )}
          <button onClick={(e) => { e.stopPropagation(); handleEdit(row); }}
            className="p-1 rounded text-slate-400 hover:text-blue-600 transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); setDeleteTarget(row); }}
            className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <CrmPageHeader
        title="Atividades"
        subtitle="Ligacoes, reunioes, tarefas e follow-ups"
        actions={
          <button onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2 bg-fyness-primary hover:bg-fyness-secondary text-white text-sm font-medium rounded-lg transition-colors">
            <Plus size={16} /> Nova Atividade
          </button>
        }
      />

      <CrmDataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        emptyMessage="Nenhuma atividade encontrada"
        emptyIcon={CalendarCheck}
        pagination={{ page, perPage: 25, total: data?.count || 0, onPageChange: setPage }}
      />

      <ActivityFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditActivity(null); }}
        activity={editActivity}
      />

      <CrmConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Excluir atividade"
        message={`Tem certeza que deseja excluir "${deleteTarget?.title}"? Esta acao nao pode ser desfeita.`}
        variant="danger"
        loading={deleteMutation.isPending}
      />
    </div>
  );
}

export default CrmActivitiesPage;

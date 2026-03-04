/**
 * ActivityFormModal - Modal para criar/editar atividades do CRM.
 * React Hook Form + Zod validation.
 */

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Phone, Mail, Video, FileText, MapPin, UtensilsCrossed } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { crmActivitySchema } from '../schemas/crmValidation';
import {
  useCrmContacts,
  useCrmDeals,
  useCreateCrmActivity,
  useUpdateCrmActivity,
} from '../hooks/useCrmQueries';

const ACTIVITY_TYPES = [
  { value: 'call', label: 'Ligacao', icon: Phone, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700' },
  { value: 'email', label: 'Email', icon: Mail, color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-300 dark:border-violet-700' },
  { value: 'meeting', label: 'Reuniao', icon: Video, color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700' },
  { value: 'task', label: 'Tarefa', icon: FileText, color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700' },
  { value: 'lunch', label: 'Almoco', icon: UtensilsCrossed, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700' },
  { value: 'visit', label: 'Visita', icon: MapPin, color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700' },
];

function EntityCombobox({ value, onChange, placeholder, useQueryHook, nameField = 'name', labelField }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data } = useQueryHook({ search, perPage: 10 });
  const items = data?.data || [];

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = items.find(c => c.id === value);

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={open ? search : (selected?.[nameField] || selected?.[labelField] || '')}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
      />
      {value && (
        <button type="button" onClick={() => { onChange(null); setSearch(''); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <X size={14} />
        </button>
      )}
      {open && items.length > 0 && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {items.map(item => (
            <button key={item.id} type="button"
              onClick={() => { onChange(item.id); setSearch(''); setOpen(false); }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
              <span className="font-medium text-slate-800 dark:text-slate-200">{item[nameField] || item[labelField]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ActivityFormModal({ open, onClose, activity = null, defaultDealId = null, defaultContactId = null }) {
  const isEdit = !!activity;
  const createMutation = useCreateCrmActivity();
  const updateMutation = useUpdateCrmActivity();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(crmActivitySchema),
    defaultValues: {
      title: '', description: '', type: 'call',
      contactId: null, dealId: null,
      startDate: '', endDate: null, completed: false,
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (open && activity) {
      reset({
        title: activity.title || '',
        description: activity.description || '',
        type: activity.type || 'call',
        contactId: activity.contactId || null,
        dealId: activity.dealId || null,
        startDate: activity.startDate ? activity.startDate.split('T')[0] : '',
        endDate: activity.endDate ? activity.endDate.split('T')[0] : null,
        completed: activity.completed || false,
      });
    } else if (open) {
      const today = new Date().toISOString().split('T')[0];
      reset({
        title: '', description: '', type: 'call',
        contactId: defaultContactId || null,
        dealId: defaultDealId || null,
        startDate: today, endDate: null, completed: false,
      });
    }
  }, [open, activity, reset, defaultDealId, defaultContactId]);

  const onSubmit = async (data) => {
    if (isEdit) {
      await updateMutation.mutateAsync({ id: activity.id, updates: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
  };

  const fieldClass = (name) =>
    `w-full px-3 py-2 text-sm rounded-lg border ${errors[name] ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-fyness-primary'} bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2`;

  return (
    <CrmModal open={open} onClose={onClose} title={isEdit ? 'Editar Atividade' : 'Nova Atividade'} size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" form="activity-form" disabled={isPending}
            className="px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
            {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEdit ? 'Salvar' : 'Criar Atividade'}
          </button>
        </>
      }>
      <form id="activity-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Tipo (toggle buttons) */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tipo *</label>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TYPES.map(t => {
              const Icon = t.icon;
              const isActive = selectedType === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setValue('type', t.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    isActive
                      ? `${t.color} ring-1 ring-offset-1 dark:ring-offset-slate-900`
                      : 'border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon size={12} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Titulo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titulo *</label>
          <input {...register('title')} placeholder="Ex: Ligar para cliente sobre proposta" className={fieldClass('title')} />
          {errors.title && <p className="text-xs text-rose-500 mt-0.5">{errors.title.message}</p>}
        </div>

        {/* Datas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Inicio *</label>
            <input type="date" {...register('startDate')} className={fieldClass('startDate')} />
            {errors.startDate && <p className="text-xs text-rose-500 mt-0.5">{errors.startDate.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Data Fim</label>
            <input type="date" {...register('endDate')} className={fieldClass('endDate')} />
          </div>
        </div>

        {/* Contato + Negocio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contato</label>
            <Controller name="contactId" control={control}
              render={({ field }) => (
                <EntityCombobox value={field.value} onChange={field.onChange}
                  placeholder="Buscar contato..." useQueryHook={useCrmContacts} />
              )} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Negocio</label>
            <Controller name="dealId" control={control}
              render={({ field }) => (
                <EntityCombobox value={field.value} onChange={field.onChange}
                  placeholder="Buscar negocio..." useQueryHook={useCrmDeals} nameField="title" />
              )} />
          </div>
        </div>

        {/* Descricao */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descricao</label>
          <textarea {...register('description')} rows={3} placeholder="Detalhes da atividade..."
            className={`${fieldClass('description')} resize-none`} />
        </div>
      </form>
    </CrmModal>
  );
}

export default ActivityFormModal;

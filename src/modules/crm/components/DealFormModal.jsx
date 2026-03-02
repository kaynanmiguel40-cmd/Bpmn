/**
 * DealFormModal - Modal para criar/editar negocios (deals) do CRM.
 * React Hook Form + Zod validation.
 */

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { crmDealSchema } from '../schemas/crmValidation';
import {
  useCrmPipelines,
  useCrmContacts,
  useCrmCompanies,
  useCreateCrmDeal,
  useUpdateCrmDeal,
} from '../hooks/useCrmQueries';

const STATUS_OPTIONS = [
  { value: 'open', label: 'Aberto' },
  { value: 'won', label: 'Ganho' },
  { value: 'lost', label: 'Perdido' },
];

function EntityCombobox({ value, onChange, placeholder, useQueryHook, nameField = 'name', extraInfo }) {
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
        value={open ? search : (selected?.[nameField] || '')}
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
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
              <span className="font-medium text-slate-800 dark:text-slate-200">{item[nameField]}</span>
              {extraInfo && extraInfo(item)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DealFormModal({ open, onClose, deal = null, defaultPipelineId = null, defaultStageId = null }) {
  const isEdit = !!deal;
  const createMutation = useCreateCrmDeal();
  const updateMutation = useUpdateCrmDeal();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: pipelines = [] } = useCrmPipelines();

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(crmDealSchema),
    defaultValues: {
      title: '', value: 0, probability: 50,
      contactId: null, companyId: null,
      pipelineId: null, stageId: null,
      expectedCloseDate: null, status: 'open', lostReason: '',
    },
  });

  const selectedPipelineId = watch('pipelineId');
  const selectedStatus = watch('status');
  const stages = pipelines?.find(p => p.id === selectedPipelineId)?.stages || [];

  useEffect(() => {
    if (open && deal) {
      reset({
        title: deal.title || '',
        value: deal.value || 0,
        probability: deal.probability ?? 50,
        contactId: deal.contactId || null,
        companyId: deal.companyId || null,
        pipelineId: deal.pipelineId || pipelines?.[0]?.id || null,
        stageId: deal.stageId || null,
        expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : null,
        status: deal.status || 'open',
        lostReason: deal.lostReason || '',
      });
    } else if (open) {
      const pId = defaultPipelineId || pipelines?.[0]?.id || null;
      const sId = defaultStageId || pipelines?.find(p => p.id === pId)?.stages?.[0]?.id || null;
      reset({
        title: '', value: 0, probability: 50,
        contactId: null, companyId: null,
        pipelineId: pId, stageId: sId,
        expectedCloseDate: null, status: 'open', lostReason: '',
      });
    }
  }, [open, deal, pipelines, defaultPipelineId, defaultStageId, reset]);

  // Auto-select first stage when pipeline changes
  useEffect(() => {
    if (selectedPipelineId && !isEdit) {
      const pipelineStages = pipelines?.find(p => p.id === selectedPipelineId)?.stages || [];
      if (pipelineStages.length > 0) {
        setValue('stageId', pipelineStages[0].id);
      }
    }
  }, [selectedPipelineId, pipelines, setValue, isEdit]);

  const onSubmit = async (data) => {
    if (isEdit) {
      await updateMutation.mutateAsync({ id: deal.id, updates: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
  };

  const fieldClass = (name) =>
    `w-full px-3 py-2 text-sm rounded-lg border ${errors[name] ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-fyness-primary'} bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2`;

  return (
    <CrmModal open={open} onClose={onClose} title={isEdit ? 'Editar Negocio' : 'Novo Negocio'} size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" form="deal-form" disabled={isPending}
            className="px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
            {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEdit ? 'Salvar' : 'Criar Negocio'}
          </button>
        </>
      }>
      <form id="deal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Titulo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titulo *</label>
          <input {...register('title')} placeholder="Ex: Projeto Website Empresa X" className={fieldClass('title')} />
          {errors.title && <p className="text-xs text-rose-500 mt-0.5">{errors.title.message}</p>}
        </div>

        {/* Valor + Probabilidade */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor (R$)</label>
            <input type="number" min="0" step="0.01" {...register('value', { valueAsNumber: true })}
              placeholder="0.00" className={fieldClass('value')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Probabilidade (%)</label>
            <input type="number" min="0" max="100" {...register('probability', { valueAsNumber: true })}
              placeholder="50" className={fieldClass('probability')} />
          </div>
        </div>

        {/* Contato + Empresa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contato</label>
            <Controller name="contactId" control={control}
              render={({ field }) => (
                <EntityCombobox value={field.value} onChange={field.onChange}
                  placeholder="Buscar contato..." useQueryHook={useCrmContacts}
                  extraInfo={(item) => item.email && <span className="text-xs text-slate-400">({item.email})</span>} />
              )} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Empresa</label>
            <Controller name="companyId" control={control}
              render={({ field }) => (
                <EntityCombobox value={field.value} onChange={field.onChange}
                  placeholder="Buscar empresa..." useQueryHook={useCrmCompanies}
                  extraInfo={(item) => item.segment && <span className="text-xs text-slate-400">({item.segment})</span>} />
              )} />
          </div>
        </div>

        {/* Pipeline + Etapa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pipeline</label>
            <select {...register('pipelineId')} className={fieldClass('pipelineId')}>
              <option value="">Selecione...</option>
              {pipelines?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Etapa</label>
            <select {...register('stageId')} className={fieldClass('stageId')}>
              <option value="">Selecione...</option>
              {stages.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Data prevista + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Previsao de Fechamento</label>
            <input type="date" {...register('expectedCloseDate')} className={fieldClass('expectedCloseDate')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
            <select {...register('status')} className={fieldClass('status')}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Motivo da perda (so se status = lost) */}
        {selectedStatus === 'lost' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Motivo da Perda</label>
            <textarea {...register('lostReason')} rows={2} placeholder="Por que o negocio foi perdido?"
              className={`${fieldClass('lostReason')} resize-none`} />
          </div>
        )}
      </form>
    </CrmModal>
  );
}

export default DealFormModal;

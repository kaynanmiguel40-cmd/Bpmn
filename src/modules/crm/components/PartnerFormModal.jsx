/**
 * PartnerFormModal - Modal para Criar/Editar parceiro indicador.
 * React Hook Form + Zod validation.
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CrmModal } from './ui/CrmModal';
import { crmPartnerSchema } from '../schemas/crmValidation';
import { useCreateCrmPartner, useUpdateCrmPartner } from '../hooks/useCrmQueries';

export function PartnerFormModal({ open, onClose, partner = null }) {
  const isEdit = !!partner?.id;
  const createMutation = useCreateCrmPartner();
  const updateMutation = useUpdateCrmPartner();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(crmPartnerSchema),
    defaultValues: { name: '', phone: '', notes: '', active: true },
  });

  useEffect(() => {
    if (open && partner) {
      reset({
        name: partner.name || '',
        phone: partner.phone || '',
        notes: partner.notes || '',
        active: partner.active !== false,
      });
    } else if (open) {
      reset({ name: '', phone: '', notes: '', active: true });
    }
  }, [open, partner, reset]);

  const onSubmit = async (data) => {
    if (isEdit) {
      await updateMutation.mutateAsync({ id: partner.id, updates: data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onClose();
  };

  const fieldClass = (name) => `w-full px-3 py-2 text-sm rounded-lg border ${errors[name] ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-fyness-primary'} bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2`;

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Parceiro' : 'Novo Parceiro'}
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={isPending} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" form="partner-form" disabled={isPending} className="px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
            {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEdit ? 'Salvar' : 'Criar Parceiro'}
          </button>
        </>
      }
    >
      <form id="partner-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
          <input {...register('name')} placeholder="Ex.: Edson" className={fieldClass('name')} />
          {errors.name && <p className="text-xs text-rose-500 mt-0.5">{errors.name.message}</p>}
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
            Precisa bater com o nome usado na origem do lead: "Indicação de parceiro (Nome)".
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
          <input {...register('phone')} placeholder="(11) 99999-0000" className={fieldClass('phone')} />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas</label>
          <textarea {...register('notes')} rows={3} placeholder="Observações sobre esse parceiro..." className={`${fieldClass('notes')} resize-none`} />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <input type="checkbox" {...register('active')} className="rounded border-slate-300 dark:border-slate-600 text-fyness-primary focus:ring-fyness-primary" />
          Parceiro ativo
        </label>
      </form>
    </CrmModal>
  );
}

export default PartnerFormModal;

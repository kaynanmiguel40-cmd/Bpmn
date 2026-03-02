/**
 * CompanyFormModal - Modal para Criar/Editar empresa CRM.
 * React Hook Form + Zod validation.
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CrmModal } from './ui/CrmModal';
import { crmCompanySchema } from '../schemas/crmValidation';
import { useCreateCrmCompany, useUpdateCrmCompany } from '../hooks/useCrmQueries';

const UF_LIST = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const SIZE_OPTIONS = [
  { value: 'micro', label: 'Microempresa' },
  { value: 'small', label: 'Pequena' },
  { value: 'medium', label: 'Media' },
  { value: 'large', label: 'Grande' },
];

const SEGMENT_OPTIONS = [
  'Tecnologia', 'Educacao', 'Saude', 'Varejo', 'Industria', 'Servicos',
  'Financeiro', 'Construcao', 'Alimenticio', 'Logistica', 'Outro',
];

export function CompanyFormModal({ open, onClose, company = null }) {
  const isEdit = !!company;
  const createMutation = useCreateCrmCompany();
  const updateMutation = useUpdateCrmCompany();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(crmCompanySchema),
    defaultValues: {
      name: '', cnpj: '', segment: '', size: '', phone: '',
      email: '', website: '', address: '', city: '', state: '', notes: '',
    },
  });

  useEffect(() => {
    if (open && company) {
      reset({
        name: company.name || '',
        cnpj: company.cnpj || '',
        segment: company.segment || '',
        size: company.size || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        notes: company.notes || '',
      });
    } else if (open) {
      reset({
        name: '', cnpj: '', segment: '', size: '', phone: '',
        email: '', website: '', address: '', city: '', state: '', notes: '',
      });
    }
  }, [open, company, reset]);

  const onSubmit = async (data) => {
    if (isEdit) {
      await updateMutation.mutateAsync({ id: company.id, updates: data });
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
      title={isEdit ? 'Editar Empresa' : 'Nova Empresa'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={isPending} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" form="company-form" disabled={isPending} className="px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
            {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEdit ? 'Salvar' : 'Criar Empresa'}
          </button>
        </>
      }
    >
      <form id="company-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome + CNPJ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
            <input {...register('name')} placeholder="Nome da empresa" className={fieldClass('name')} />
            {errors.name && <p className="text-xs text-rose-500 mt-0.5">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">CNPJ</label>
            <input {...register('cnpj')} placeholder="XX.XXX.XXX/XXXX-XX" className={fieldClass('cnpj')} />
          </div>
        </div>

        {/* Segmento + Porte */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Segmento</label>
            <select {...register('segment')} className={fieldClass('segment')}>
              <option value="">Selecione...</option>
              {SEGMENT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Porte</label>
            <select {...register('size')} className={fieldClass('size')}>
              <option value="">Selecione...</option>
              {SIZE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Telefone + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
            <input {...register('phone')} placeholder="(11) 3333-0000" className={fieldClass('phone')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input {...register('email')} type="email" placeholder="contato@empresa.com" className={fieldClass('email')} />
            {errors.email && <p className="text-xs text-rose-500 mt-0.5">{errors.email.message}</p>}
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Website</label>
          <input {...register('website')} placeholder="https://www.empresa.com" className={fieldClass('website')} />
        </div>

        {/* Endereco */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Endereco</label>
          <input {...register('address')} placeholder="Rua, numero, complemento" className={fieldClass('address')} />
        </div>

        {/* Cidade + Estado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
            <input {...register('city')} placeholder="Cidade" className={fieldClass('city')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Estado</label>
            <select {...register('state')} className={fieldClass('state')}>
              <option value="">Selecione...</option>
              {UF_LIST.map(uf => <option key={uf} value={uf}>{uf}</option>)}
            </select>
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas</label>
          <textarea {...register('notes')} rows={3} placeholder="Observacoes sobre a empresa..." className={`${fieldClass('notes')} resize-none`} />
        </div>
      </form>
    </CrmModal>
  );
}

export default CompanyFormModal;

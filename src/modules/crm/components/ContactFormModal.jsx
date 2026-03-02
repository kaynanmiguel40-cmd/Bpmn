/**
 * ContactFormModal - Modal para Criar/Editar contato CRM.
 * React Hook Form + Zod validation + combobox de empresa.
 */

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Plus } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { crmContactSchema } from '../schemas/crmValidation';
import { useCrmCompanies, useCreateCrmContact, useUpdateCrmContact } from '../hooks/useCrmQueries';

const UF_LIST = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO',
];

const STATUS_OPTIONS = [
  { value: 'lead', label: 'Lead' },
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'customer', label: 'Cliente' },
];

function TagInput({ value = [], onChange }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const tag = input.trim();
    if (tag && !value.includes(tag)) {
      onChange([...value, tag]);
    }
    setInput('');
  };

  const removeTag = (idx) => {
    onChange(value.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {value.map((tag, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">
            {tag}
            <button type="button" onClick={() => removeTag(i)} className="hover:text-blue-900 dark:hover:text-blue-200">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1.5">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
          placeholder="Digite e pressione Enter"
          className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
        />
        <button type="button" onClick={addTag} className="px-2 py-1.5 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600">
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function CompanyCombobox({ value, onChange }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data } = useCrmCompanies({ search, perPage: 10 });
  const companies = data?.data || [];

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const selected = companies.find(c => c.id === value);

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={open ? search : (selected?.name || '')}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar empresa..."
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(null); setSearch(''); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          <X size={14} />
        </button>
      )}
      {open && companies.length > 0 && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {companies.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => { onChange(c.id); setSearch(''); setOpen(false); }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
            >
              <span className="font-medium text-slate-800 dark:text-slate-200">{c.name}</span>
              {c.segment && <span className="text-xs text-slate-400">({c.segment})</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ContactFormModal({ open, onClose, contact = null }) {
  const isEdit = !!contact;
  const createMutation = useCreateCrmContact();
  const updateMutation = useUpdateCrmContact();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(crmContactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      position: '',
      status: 'lead',
      companyId: null,
      tags: [],
      address: '',
      city: '',
      state: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open && contact) {
      reset({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        position: contact.position || '',
        status: contact.status || 'lead',
        companyId: contact.companyId || null,
        tags: contact.tags || [],
        address: contact.address || '',
        city: contact.city || '',
        state: contact.state || '',
        notes: contact.notes || '',
      });
    } else if (open) {
      reset({
        name: '', email: '', phone: '', position: '', status: 'lead',
        companyId: null, tags: [], address: '', city: '', state: '', notes: '',
      });
    }
  }, [open, contact, reset]);

  const onSubmit = async (data) => {
    if (isEdit) {
      await updateMutation.mutateAsync({ id: contact.id, updates: data });
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
      title={isEdit ? 'Editar Contato' : 'Novo Contato'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={isPending} className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" form="contact-form" disabled={isPending} className="px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
            {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEdit ? 'Salvar' : 'Criar Contato'}
          </button>
        </>
      }
    >
      <form id="contact-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Nome + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome *</label>
            <input {...register('name')} placeholder="Nome completo" className={fieldClass('name')} />
            {errors.name && <p className="text-xs text-rose-500 mt-0.5">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input {...register('email')} type="email" placeholder="email@exemplo.com" className={fieldClass('email')} />
            {errors.email && <p className="text-xs text-rose-500 mt-0.5">{errors.email.message}</p>}
          </div>
        </div>

        {/* Telefone + Cargo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
            <input {...register('phone')} placeholder="(11) 99999-0000" className={fieldClass('phone')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cargo</label>
            <input {...register('position')} placeholder="Ex: Diretor Comercial" className={fieldClass('position')} />
          </div>
        </div>

        {/* Empresa + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Empresa</label>
            <Controller
              name="companyId"
              control={control}
              render={({ field }) => <CompanyCombobox value={field.value} onChange={field.onChange} />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
            <select {...register('status')} className={fieldClass('status')}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
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

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags</label>
          <Controller
            name="tags"
            control={control}
            render={({ field }) => <TagInput value={field.value} onChange={field.onChange} />}
          />
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas</label>
          <textarea {...register('notes')} rows={3} placeholder="Observacoes sobre o contato..." className={`${fieldClass('notes')} resize-none`} />
        </div>
      </form>
    </CrmModal>
  );
}

export default ContactFormModal;

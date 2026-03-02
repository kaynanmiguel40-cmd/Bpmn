/**
 * ProposalFormModal - Modal para criar/editar propostas do CRM.
 * Inclui secao dinamica de itens com calculo automatico.
 */

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { X, Plus, Trash2 } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { useCrmDeals, useCreateCrmProposal, useUpdateCrmProposal } from '../hooks/useCrmQueries';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'sent', label: 'Enviada' },
  { value: 'viewed', label: 'Visualizada' },
  { value: 'accepted', label: 'Aceita' },
  { value: 'rejected', label: 'Rejeitada' },
];

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

function DealCombobox({ value, onChange, placeholder }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data } = useCrmDeals({ search, perPage: 10 });
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
        value={open ? search : (selected?.title || '')}
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
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between">
              <span className="font-medium text-slate-800 dark:text-slate-200">{item.title}</span>
              {item.value > 0 && <span className="text-xs text-slate-400">{formatCurrency(item.value)}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const EMPTY_ITEM = { name: '', description: '', quantity: 1, unitPrice: 0, discountPercent: 0 };

export function ProposalFormModal({ open, onClose, proposal = null }) {
  const isEdit = !!proposal;
  const createMutation = useCreateCrmProposal();
  const updateMutation = useUpdateCrmProposal();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      dealId: '', status: 'draft', notes: '', terms: '',
      items: [{ ...EMPTY_ITEM }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = watch('items');

  const calcSubtotal = (item) => {
    const qty = item?.quantity || 0;
    const price = item?.unitPrice || 0;
    const disc = item?.discountPercent || 0;
    return qty * price * (1 - disc / 100);
  };

  const totalValue = (watchedItems || []).reduce((sum, item) => sum + calcSubtotal(item), 0);

  useEffect(() => {
    if (open && proposal) {
      reset({
        dealId: proposal.dealId || '',
        status: proposal.status || 'draft',
        notes: proposal.notes || '',
        terms: proposal.terms || '',
        items: proposal.items && proposal.items.length > 0
          ? proposal.items.map(i => ({
              name: i.name || '',
              description: i.description || '',
              quantity: i.quantity || 1,
              unitPrice: i.unitPrice || 0,
              discountPercent: i.discountPercent || 0,
            }))
          : [{ ...EMPTY_ITEM }],
      });
    } else if (open) {
      reset({
        dealId: '', status: 'draft', notes: '', terms: '',
        items: [{ ...EMPTY_ITEM }],
      });
    }
  }, [open, proposal, reset]);

  const onSubmit = async (data) => {
    const items = (data.items || [])
      .filter(i => i.name.trim())
      .map(i => ({
        ...i,
        quantity: Number(i.quantity) || 1,
        unitPrice: Number(i.unitPrice) || 0,
        discountPercent: Number(i.discountPercent) || 0,
        subtotal: calcSubtotal(i),
      }));

    const payload = {
      dealId: data.dealId,
      status: data.status,
      notes: data.notes,
      terms: data.terms,
      totalValue,
      items,
    };

    if (isEdit) {
      await updateMutation.mutateAsync({ id: proposal.id, updates: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  const fieldClass = (name) =>
    `w-full px-3 py-2 text-sm rounded-lg border ${errors[name] ? 'border-rose-300 dark:border-rose-700 focus:ring-rose-500' : 'border-slate-300 dark:border-slate-600 focus:ring-fyness-primary'} bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2`;

  const inputClass = 'w-full px-2 py-1.5 text-sm rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-fyness-primary';

  return (
    <CrmModal open={open} onClose={onClose} title={isEdit ? 'Editar Proposta' : 'Nova Proposta'} size="xl"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" form="proposal-form" disabled={isPending}
            className="px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
            {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEdit ? 'Salvar' : 'Criar Proposta'}
          </button>
        </>
      }>
      <form id="proposal-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Negocio + Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Negocio *</label>
            <Controller name="dealId" control={control}
              rules={{ required: 'Negocio e obrigatorio' }}
              render={({ field }) => (
                <DealCombobox value={field.value} onChange={field.onChange} placeholder="Buscar negocio..." />
              )} />
            {errors.dealId && <p className="text-xs text-rose-500 mt-0.5">{errors.dealId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
            <select {...register('status')} className={fieldClass('status')}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Itens */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Itens da Proposta</label>
            <button type="button" onClick={() => append({ ...EMPTY_ITEM })}
              className="flex items-center gap-1 text-xs text-fyness-primary hover:text-fyness-secondary font-medium transition-colors">
              <Plus size={12} /> Adicionar Item
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            {/* Header da tabela */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">
              <div className="col-span-4">Item</div>
              <div className="col-span-2">Qtd</div>
              <div className="col-span-2">Preco Unit.</div>
              <div className="col-span-1">Desc%</div>
              <div className="col-span-2 text-right">Subtotal</div>
              <div className="col-span-1" />
            </div>

            {/* Rows */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {fields.map((field, index) => {
                const item = watchedItems?.[index];
                const subtotal = calcSubtotal(item);
                return (
                  <div key={field.id} className="grid grid-cols-12 gap-2 px-3 py-2 items-center">
                    <div className="col-span-4">
                      <input {...register(`items.${index}.name`)} placeholder="Nome do item" className={inputClass} />
                    </div>
                    <div className="col-span-2">
                      <input type="number" min="0" step="1" {...register(`items.${index}.quantity`, { valueAsNumber: true })} className={inputClass} />
                    </div>
                    <div className="col-span-2">
                      <input type="number" min="0" step="0.01" {...register(`items.${index}.unitPrice`, { valueAsNumber: true })} className={inputClass} />
                    </div>
                    <div className="col-span-1">
                      <input type="number" min="0" max="100" step="1" {...register(`items.${index}.discountPercent`, { valueAsNumber: true })} className={inputClass} />
                    </div>
                    <div className="col-span-2 text-right text-sm font-medium text-slate-700 dark:text-slate-300">
                      {formatCurrency(subtotal)}
                    </div>
                    <div className="col-span-1 text-right">
                      {fields.length > 1 && (
                        <button type="button" onClick={() => remove(index)}
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total */}
            <div className="grid grid-cols-12 gap-2 px-3 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
              <div className="col-span-9 text-right text-sm font-semibold text-slate-700 dark:text-slate-300">
                Total:
              </div>
              <div className="col-span-2 text-right text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalValue)}
              </div>
              <div className="col-span-1" />
            </div>
          </div>
        </div>

        {/* Notas + Termos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas</label>
            <textarea {...register('notes')} rows={3} placeholder="Observacoes internas..."
              className={`${fieldClass('notes')} resize-none`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Termos e Condicoes</label>
            <textarea {...register('terms')} rows={3} placeholder="Condicoes de pagamento, prazo..."
              className={`${fieldClass('terms')} resize-none`} />
          </div>
        </div>
      </form>
    </CrmModal>
  );
}

export default ProposalFormModal;

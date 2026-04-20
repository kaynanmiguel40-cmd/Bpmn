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
  useCreateCrmCompany,
  useCreateCrmDeal,
  useUpdateCrmDeal,
} from '../hooks/useCrmQueries';
import { useTeamMembers } from '../../../hooks/queries';

// Mascara telefone: (11) 99999-9999 ou (11) 9999-9999
function formatPhoneDisplay(val) {
  const d = (val || '').replace(/\D/g, '').slice(0, 11);
  if (!d) return '';
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0,2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0,2)}) ${d.slice(2,6)}-${d.slice(6)}`;
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`;
}

// Formata numero como moeda brasileira para exibicao no input.
// Padrao "calculadora": dígitos entram por trás (1 -> R$ 0,01 -> R$ 0,10 ->
// R$ 1,00). Cursor fica sempre no fim, o que esse padrao espera — resolve o
// bug em que cada tecla resetava a digitacao pela vírgula injetada no meio.
function formatCurrencyInput(num) {
  if (num === null || num === undefined || num === '') return '';
  const n = typeof num === 'number' ? num : parseFloat(num);
  if (isNaN(n) || n === 0) return '';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n);
}

const STATUS_OPTIONS = [
  { value: 'open', label: 'Aberto' },
  { value: 'won', label: 'Ganho' },
  { value: 'lost', label: 'Perdido' },
];

const SEGMENT_OPTIONS = [
  'Agro', 'Alimenticio', 'Automotivo', 'Comercio', 'Construcao Civil',
  'Educacao', 'Energia', 'Financeiro', 'Industria', 'Logistica',
  'Saude', 'Servicos', 'Tecnologia', 'Varejo', 'Outros',
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

// Combobox hibrido: digita livremente (freeText) OU seleciona contato existente (contactId)
function ContactField({ freeValue, onFreeChange, linkedId, onLinkChange }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data } = useCrmContacts({ search, perPage: 8 });
  const items = data?.data || [];

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const linked = items.find(c => c.id === linkedId);

  function handleInput(e) {
    const val = e.target.value;
    onFreeChange(val);
    setSearch(val);
    onLinkChange(null); // limpa vinculo se usuario digita manualmente
    setOpen(true);
  }

  function handleSelect(item) {
    onFreeChange(item.name);
    onLinkChange(item.id);
    setSearch('');
    setOpen(false);
  }

  function handleClear() {
    onFreeChange('');
    onLinkChange(null);
    setSearch('');
  }

  const displayValue = linked ? linked.name : freeValue;

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={displayValue || ''}
        onChange={handleInput}
        onFocus={() => { setSearch(freeValue || ''); setOpen(true); }}
        placeholder="Nome do contato (ou busque um existente)"
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
      />
      {(freeValue || linkedId) && (
        <button type="button" onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <X size={14} />
        </button>
      )}
      {linkedId && (
        <span className="absolute right-7 top-1/2 -translate-y-1/2 text-xs text-fyness-primary font-medium">vinculado</span>
      )}
      {open && items.length > 0 && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {items.map(item => (
            <button key={item.id} type="button"
              onClick={() => handleSelect(item)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
              <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
              {item.email && <span className="text-xs text-slate-400">({item.email})</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Combobox hibrido para empresa: digita livremente (freeText) OU seleciona existente.
// Se ao salvar o freeText nao estiver vinculado, a empresa e criada no banco.
function CompanyField({ freeValue, onFreeChange, linkedId, onLinkChange }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data } = useCrmCompanies({ search, perPage: 8 });
  const items = data?.data || [];

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const linked = items.find(c => c.id === linkedId);

  function handleInput(e) {
    const val = e.target.value;
    onFreeChange(val);
    setSearch(val);
    onLinkChange(null);
    setOpen(true);
  }

  function handleSelect(item) {
    onFreeChange(item.name);
    onLinkChange(item.id);
    setSearch('');
    setOpen(false);
  }

  function handleClear() {
    onFreeChange('');
    onLinkChange(null);
    setSearch('');
  }

  const displayValue = linked ? linked.name : freeValue;

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={displayValue || ''}
        onChange={handleInput}
        onFocus={() => { setSearch(freeValue || ''); setOpen(true); }}
        placeholder="Nome da empresa (ou busque uma existente)"
        className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
      />
      {(freeValue || linkedId) && (
        <button type="button" onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <X size={14} />
        </button>
      )}
      {linkedId && (
        <span className="absolute right-7 top-1/2 -translate-y-1/2 text-xs text-fyness-primary font-medium">vinculado</span>
      )}
      {open && items.length > 0 && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {items.map(item => (
            <button key={item.id} type="button"
              onClick={() => handleSelect(item)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2">
              <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
              {item.segment && <span className="text-xs text-slate-400">({item.segment})</span>}
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
  const createCompanyMutation = useCreateCrmCompany();
  const isPending = createMutation.isPending || updateMutation.isPending || createCompanyMutation.isPending;

  const { data: pipelines = [] } = useCrmPipelines();
  const { data: allMembers = [] } = useTeamMembers();
  const crmMembers = allMembers.filter(m => m.crmRole);

  const { register, handleSubmit, control, reset, watch, setValue, getValues, formState: { errors } } = useForm({
    resolver: zodResolver(crmDealSchema),
    defaultValues: {
      title: '', value: 0, probability: 0, segment: '',
      contactName: '', contactPhone: '', contactEmail: '', contactId: null,
      companyName: '', companyId: null, pipelineId: null, stageId: null,
      expectedCloseDate: null, status: 'open', lostReason: '',
      ownerId: null,
    },
  });

  const selectedPipelineId = watch('pipelineId');
  const selectedStatus = watch('status');
  const stages = pipelines?.find(p => p.id === selectedPipelineId)?.stages || [];

  // Modo "Outros" do segmento — controla exibicao do input livre independente
  // do valor do form (que e o texto final digitado).
  const [isCustomSegment, setIsCustomSegment] = useState(false);

  // Reset do form SO quando abre o modal ou muda o deal selecionado.
  // Nao pode depender de `pipelines` porque esse array muda a cada realtime/
  // refetch e acabava apagando campos ja digitados pelo usuario.
  useEffect(() => {
    if (!open) return;
    const knownSegments = SEGMENT_OPTIONS.filter(s => s !== 'Outros');
    if (deal) {
      setIsCustomSegment(!!deal.segment && !knownSegments.includes(deal.segment));
      reset({
        title: deal.title || '',
        value: deal.value || 0,
        probability: deal.probability ?? 0,
        segment: deal.segment || '',
        contactName: deal.contactName || deal.contact?.name || '',
        contactPhone: deal.contactPhone || deal.contact?.phone || '',
        contactEmail: deal.contactEmail || deal.contact?.email || '',
        contactId: deal.contactId || null,
        companyName: deal.company?.name || '',
        companyId: deal.companyId || null,
        pipelineId: deal.pipelineId || null,
        stageId: deal.stageId || null,
        expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.split('T')[0] : null,
        status: deal.status || 'open',
        lostReason: deal.lostReason || '',
        ownerId: deal.ownerId || null,
      });
    } else {
      setIsCustomSegment(false);
      reset({
        title: '', value: 0, probability: 0, segment: '',
        contactName: '', contactPhone: '', contactEmail: '', contactId: null,
        companyId: null, pipelineId: null, stageId: null,
        expectedCloseDate: null, status: 'open', lostReason: '',
        ownerId: null,
      });
    }
  }, [open, deal, reset]);

  // Aplicar pipeline/stage default quando a lista carrega — via setValue
  // (preserva os demais campos digitados) e so se ainda estiver vazio.
  useEffect(() => {
    if (!open || !pipelines?.length) return;
    const current = getValues();
    if (!current.pipelineId) {
      const pId = (deal?.pipelineId) || defaultPipelineId || pipelines[0].id;
      setValue('pipelineId', pId);
      if (!current.stageId) {
        const sId = (deal?.stageId) || defaultStageId || pipelines.find(p => p.id === pId)?.stages?.[0]?.id || null;
        if (sId) setValue('stageId', sId);
      }
    }
  }, [open, pipelines, deal, defaultPipelineId, defaultStageId, setValue, getValues]);

  // Auto-select first stage when pipeline changes (novo deal)
  useEffect(() => {
    if (selectedPipelineId && !isEdit) {
      const pipelineStages = pipelines?.find(p => p.id === selectedPipelineId)?.stages || [];
      if (pipelineStages.length > 0) {
        const current = getValues('stageId');
        const stillValid = pipelineStages.some(s => s.id === current);
        if (!stillValid) setValue('stageId', pipelineStages[0].id);
      }
    }
  }, [selectedPipelineId, pipelines, setValue, getValues, isEdit]);

  const onSubmit = async (data) => {
    let companyId = data.companyId || null;

    // Se o usuario digitou nome de empresa mas nao vinculou a uma existente,
    // criar a empresa agora e usar o id retornado no deal.
    const typedCompany = (data.companyName || '').trim();
    if (!companyId && typedCompany) {
      try {
        const newCompany = await createCompanyMutation.mutateAsync({
          name: typedCompany,
          segment: data.segment || '',
        });
        companyId = newCompany?.id || null;
      } catch (_) {
        // toast de erro ja disparado pelo service; aborta submit
        return;
      }
    }

    // companyName e campo so da UI — nao vai pro banco do deal
    const { companyName: _ignore, ...rest } = data;
    const payload = { ...rest, companyId, ownerId: data.ownerId || null };

    if (isEdit) {
      await updateMutation.mutateAsync({ id: deal.id, updates: payload });
    } else {
      await createMutation.mutateAsync(payload);
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
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor</label>
            <Controller name="value" control={control}
              render={({ field }) => (
                <input
                  type="text"
                  inputMode="numeric"
                  value={formatCurrencyInput(field.value)}
                  onChange={(e) => {
                    // Estrategia "calculadora": extrai TODOS os digitos da string
                    // e trata como centavos. Cursor no fim, tecla por tecla empurra
                    // da direita. Ex: "5" -> 0.05, "50" -> 0.50, "500" -> 5.00.
                    const digits = e.target.value.replace(/\D/g, '');
                    if (!digits) { field.onChange(0); return; }
                    // Limita a 12 digitos (R$ 9.999.999.999,99) pra nao explodir
                    const cents = parseInt(digits.slice(0, 12), 10);
                    field.onChange(cents / 100);
                  }}
                  placeholder="R$ 0,00"
                  className={fieldClass('value')}
                />
              )} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Probabilidade (%)</label>
            <Controller name="probability" control={control}
              render={({ field }) => (
                <input
                  type="text"
                  inputMode="numeric"
                  value={field.value === undefined || field.value === null ? '' : String(field.value)}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    // Bloqueia a tecla se o numero resultante passar de 100 —
                    // ex: 10 aceita mais 0 (vira 100), mas 11 ou 20 recusam o
                    // proximo digito porque ultrapassariam o limite.
                    const digits = e.target.value.replace(/\D/g, '');
                    if (digits === '') { field.onChange(undefined); return; }
                    const n = parseInt(digits, 10);
                    if (n > 100) return;
                    field.onChange(n);
                  }}
                  placeholder="0"
                  className={fieldClass('probability')}
                />
              )} />
          </div>
        </div>

        {/* Segmento */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Segmento</label>
          <Controller name="segment" control={control}
            render={({ field }) => {
              const selectValue = isCustomSegment ? 'Outros' : (field.value || '');
              return (
                <div className="space-y-2">
                  <select
                    value={selectValue}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === 'Outros') {
                        setIsCustomSegment(true);
                        field.onChange('');
                      } else {
                        setIsCustomSegment(false);
                        field.onChange(v);
                      }
                    }}
                    className={fieldClass('segment')}
                  >
                    <option value="">Selecione o segmento...</option>
                    {SEGMENT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {isCustomSegment && (
                    <input
                      type="text"
                      value={field.value || ''}
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="Digite o segmento..."
                      autoFocus
                      className={fieldClass('segment')}
                    />
                  )}
                </div>
              );
            }} />
        </div>

        {/* Contato */}
        <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-3">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Contato</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
            <Controller name="contactName" control={control}
              render={({ field: freeField }) => (
                <Controller name="contactId" control={control}
                  render={({ field: idField }) => (
                    <ContactField
                      freeValue={freeField.value}
                      onFreeChange={freeField.onChange}
                      linkedId={idField.value}
                      onLinkChange={idField.onChange}
                    />
                  )} />
              )} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone</label>
              <Controller name="contactPhone" control={control}
                render={({ field }) => (
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatPhoneDisplay(field.value)}
                    onChange={(e) => field.onChange(formatPhoneDisplay(e.target.value))}
                    placeholder="(11) 99999-9999"
                    maxLength={16}
                    className={fieldClass('contactPhone')}
                  />
                )} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
              <input type="email" {...register('contactEmail')} placeholder="contato@empresa.com" className={fieldClass('contactEmail')} />
            </div>
          </div>
        </div>

        {/* Empresa */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Empresa</label>
          <Controller name="companyName" control={control}
            render={({ field: freeField }) => (
              <Controller name="companyId" control={control}
                render={({ field: idField }) => (
                  <CompanyField
                    freeValue={freeField.value}
                    onFreeChange={freeField.onChange}
                    linkedId={idField.value}
                    onLinkChange={idField.onChange}
                  />
                )} />
            )} />
        </div>

        {/* Vendedor responsavel */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vendedor Responsavel</label>
          <select {...register('ownerId')} className={fieldClass('ownerId')}>
            <option value="">Selecione...</option>
            {crmMembers.filter(m => m.crmRole === 'gestor').length > 0 && (
              <optgroup label="Gestores">
                {crmMembers.filter(m => m.crmRole === 'gestor').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </optgroup>
            )}
            {crmMembers.filter(m => m.crmRole === 'vendedor').length > 0 && (
              <optgroup label="Vendedores">
                {crmMembers.filter(m => m.crmRole === 'vendedor').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </optgroup>
            )}
            {crmMembers.filter(m => m.crmRole === 'pre_vendedor').length > 0 && (
              <optgroup label="Pre-vendedores">
                {crmMembers.filter(m => m.crmRole === 'pre_vendedor').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </optgroup>
            )}
          </select>
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

/**
 * GoalFormModal - Modal para criar/editar metas de vendas.
 * Inclui sugestao SMART baseada em dados reais do CRM.
 */

import { useState, useEffect } from 'react';
import { Brain, Sparkles, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { fieldClass as sharedFieldClass } from './ui/formFieldClass';
import { useCreateCrmGoal, useUpdateCrmGoal } from '../hooks/useCrmQueries';
import { useTeamMembers } from '../../../hooks/queries';
import { getSmartSuggestion } from '../services/crmGoalsService';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativa' },
  { value: 'completed', label: 'Concluída' },
  { value: 'cancelled', label: 'Cancelada' },
];

const EMPTY_FORM = {
  title: '',
  description: '',
  type: 'individual',
  ownerId: '',
  targetValue: '',
  currentValue: '',
  periodStart: '',
  periodEnd: '',
  status: 'active',
};

function getDefaultPeriod() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return {
    periodStart: start.toISOString().split('T')[0],
    periodEnd: end.toISOString().split('T')[0],
  };
}

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

export function GoalFormModal({ open, onClose, goal = null, defaultType = 'individual' }) {
  const isEdit = !!goal?.id;
  const createMutation = useCreateCrmGoal();
  const updateMutation = useUpdateCrmGoal();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: allMembers = [] } = useTeamMembers();
  const crmMembers = allMembers.filter(m => m.crmRole);

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});

  // SMART suggestion state
  const [smartData, setSmartData] = useState(null);
  const [smartLoading, setSmartLoading] = useState(false);
  const [smartOpen, setSmartOpen] = useState(false);

  useEffect(() => {
    if (open && goal) {
      setForm({
        title: goal.title || '',
        description: goal.description || '',
        type: goal.type || 'individual',
        ownerId: goal.ownerId || '',
        targetValue: goal.targetValue || '',
        currentValue: goal.currentValue || '',
        periodStart: goal.periodStart ? goal.periodStart.split('T')[0] : '',
        periodEnd: goal.periodEnd ? goal.periodEnd.split('T')[0] : '',
        status: goal.status || 'active',
      });
      setErrors({});
      setSmartData(null);
      setSmartOpen(false);
    } else if (open) {
      const defaults = getDefaultPeriod();
      setForm({ ...EMPTY_FORM, ...defaults, type: defaultType });
      setErrors({});
      setSmartData(null);
      setSmartOpen(false);
    }
  }, [open, goal]);

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Título é obrigatório';
    if (!form.periodStart) errs.periodStart = 'Data de início é obrigatória';
    if (!form.periodEnd) errs.periodEnd = 'Data de fim é obrigatória';
    if (form.type === 'individual' && !form.ownerId) errs.ownerId = 'Selecione um responsável';
    const target = parseFloat(form.targetValue);
    if (!target || target <= 0) errs.targetValue = 'Valor alvo deve ser maior que 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      ownerId: form.type === 'individual' ? form.ownerId || null : null,
      targetValue: parseFloat(form.targetValue) || 0,
      currentValue: parseFloat(form.currentValue) || 0,
      periodStart: form.periodStart,
      periodEnd: form.periodEnd,
      status: form.status,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: goal.id, updates: data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch {
      // toast ja exibido pelo hook
    }
  };

  const handleSmartSuggest = async () => {
    if (!form.periodStart || !form.periodEnd) {
      setErrors(prev => ({
        ...prev,
        periodStart: !form.periodStart ? 'Defina o período primeiro' : null,
        periodEnd: !form.periodEnd ? 'Defina o período primeiro' : null,
      }));
      return;
    }
    setSmartLoading(true);
    setSmartOpen(true);
    try {
      const result = await getSmartSuggestion(form.periodStart, form.periodEnd);
      setSmartData(result);
    } catch (err) {
      console.warn('[GoalFormModal] getSmartSuggestion falhou:', err?.message || err);
      setSmartData(null);
    } finally {
      setSmartLoading(false);
    }
  };

  const handleUseSuggestion = () => {
    if (smartData?.suggestedTarget > 0) {
      setField('targetValue', String(smartData.suggestedTarget));
      setSmartOpen(false);
    }
  };

  const fieldClass = (name) => sharedFieldClass(!!errors[name]);

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar meta' : 'Nova meta'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={isPending}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto">
            Cancelar
          </button>
          <button type="submit" form="goal-form" disabled={isPending}
            className="min-h-[44px] px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto">
            {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isPending ? (isEdit ? 'Salvando…' : 'Criando…') : (isEdit ? 'Salvar' : 'Criar meta')}
          </button>
        </>
      }
    >
      <form id="goal-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Escopo: Individual ou Global */}
        <div className="flex gap-3">
          {[{ value: 'individual', label: 'Individual' }, { value: 'global', label: 'Global (equipe)' }].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setField('type', opt.value)}
              className={`flex-1 min-h-[44px] px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                form.type === opt.value
                  ? 'border-fyness-primary bg-fyness-primary/10 text-fyness-primary'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Titulo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título *</label>
          <input value={form.title} onChange={(e) => setField('title', e.target.value)}
            placeholder="Ex.: Meta de vendas março" className={fieldClass('title')} />
          {errors.title && <p className="text-xs text-rose-500 mt-0.5">{errors.title}</p>}
        </div>

        {/* Descricao */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
          <textarea value={form.description} onChange={(e) => setField('description', e.target.value)}
            placeholder="Detalhes da meta…" rows={2} className={`${fieldClass('description')} resize-none`} />
        </div>

        {/* Responsavel (so individual) */}
        {form.type === 'individual' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsável *</label>
            <select value={form.ownerId} onChange={(e) => setField('ownerId', e.target.value)} className={fieldClass('ownerId')}>
              <option value="">Selecione…</option>
              {crmMembers.length > 0 ? (
                <>
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
                    <optgroup label="Pré-vendedores">
                      {crmMembers.filter(m => m.crmRole === 'pre_vendedor').map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                    </optgroup>
                  )}
                </>
              ) : (
                allMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)
              )}
            </select>
            {errors.ownerId && <p className="text-xs text-rose-500 mt-0.5">{errors.ownerId}</p>}
          </div>
        )}

        {/* Periodo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Início *</label>
            <input type="date" value={form.periodStart}
              onChange={(e) => setField('periodStart', e.target.value)} className={fieldClass('periodStart')} />
            {errors.periodStart && <p className="text-xs text-rose-500 mt-0.5">{errors.periodStart}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fim *</label>
            <input type="date" value={form.periodEnd}
              onChange={(e) => setField('periodEnd', e.target.value)} className={fieldClass('periodEnd')} />
            {errors.periodEnd && <p className="text-xs text-rose-500 mt-0.5">{errors.periodEnd}</p>}
          </div>
        </div>

        {/* Valor alvo + Botao SMART */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Valor alvo (R$) *</label>
              <button
                type="button"
                onClick={handleSmartSuggest}
                disabled={smartLoading}
                className="flex items-center gap-1 px-2.5 py-1 text-[12px] font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors disabled:opacity-50"
              >
                <Brain size={12} />
                Sugerir meta
              </button>
            </div>
            <input type="number" min="0" step="0.01" value={form.targetValue}
              onChange={(e) => setField('targetValue', e.target.value)}
              placeholder="50000" className={fieldClass('targetValue')} />
            {errors.targetValue && <p className="text-xs text-rose-500 mt-0.5">{errors.targetValue}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ajuste manual (R$)</label>
            <input type="number" min="0" step="0.01" value={form.currentValue}
              onChange={(e) => setField('currentValue', e.target.value)}
              placeholder="0" className={fieldClass('currentValue')} />
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">Valor extra somado ao progresso automático</p>
          </div>
        </div>

        {/* Painel SMART */}
        {smartOpen && (
          <div className="rounded-lg border border-violet-200 dark:border-violet-800/50 bg-violet-50/50 dark:bg-violet-900/10 p-4">
            {smartLoading ? (
              <div className="flex items-center gap-3 justify-center py-4">
                <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-violet-600 dark:text-violet-400">Analisando dados do CRM…</span>
              </div>
            ) : smartData && !smartData.hasData ? (
              <div className="flex items-start gap-3 py-2">
                <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Dados insuficientes</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Cadastre registros de tráfego pago e feche deals primeiro para que o sistema possa calcular uma meta realista.
                  </p>
                </div>
              </div>
            ) : smartData ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-violet-600 dark:text-violet-400" />
                  <span className="text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                    Sugestão SMART
                  </span>
                </div>

                {/* Breakdown do calculo */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 w-32">Investimento:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(smartData.investmentAvg)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 w-32">CPL histórico:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(smartData.cpl)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 w-32">Leads esperados:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{smartData.expectedLeads}</span>
                  </div>

                  <div className="flex items-center justify-center py-1">
                    <ArrowRight size={14} className="text-violet-400" />
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 w-32">Conversão real:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {smartData.conversionRate.toFixed(1)}%
                      <span className="text-[12px] text-slate-500 dark:text-slate-400 ml-1">({smartData.conversionSource === 'history' ? 'histórico' : 'estimada'})</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 w-32">Deals esperados:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{smartData.expectedDeals}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 w-32">Ticket médio:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(smartData.avgDealValue)}</span>
                  </div>
                </div>

                {/* Resultado */}
                <div className="mt-3 pt-3 border-t border-violet-200 dark:border-violet-700/50 flex items-center justify-between">
                  <div>
                    <div className="text-[12px] font-medium text-violet-500 uppercase">Meta sugerida</div>
                    <div className="text-lg font-bold text-violet-700 dark:text-violet-300">
                      {formatCurrency(smartData.suggestedTarget)}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseSuggestion}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors"
                  >
                    <Check size={13} />
                    Usar este valor
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Status (so edit) */}
        {isEdit && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
            <select value={form.status} onChange={(e) => setField('status', e.target.value)} className={fieldClass('status')}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        )}
      </form>
    </CrmModal>
  );
}

export default GoalFormModal;

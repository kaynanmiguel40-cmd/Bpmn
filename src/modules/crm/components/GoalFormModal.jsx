/**
 * GoalFormModal - Modal para criar/editar metas de vendas.
 * Inclui sugestao SMART baseada em dados reais do CRM.
 */

import { useState, useEffect } from 'react';
import { Brain, Sparkles, AlertTriangle, ArrowRight, Check } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { useCreateCrmGoal, useUpdateCrmGoal } from '../hooks/useCrmQueries';
import { useTeamMembers } from '../../../hooks/queries';
import { getSmartSuggestion } from '../services/crmGoalsService';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativa' },
  { value: 'completed', label: 'Concluida' },
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
  const isEdit = !!goal;
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
    if (!form.title.trim()) errs.title = 'Titulo e obrigatorio';
    if (!form.periodStart) errs.periodStart = 'Data inicio e obrigatoria';
    if (!form.periodEnd) errs.periodEnd = 'Data fim e obrigatoria';
    if (form.type === 'individual' && !form.ownerId) errs.ownerId = 'Selecione um responsavel';
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
        periodStart: !form.periodStart ? 'Defina o periodo primeiro' : null,
        periodEnd: !form.periodEnd ? 'Defina o periodo primeiro' : null,
      }));
      return;
    }
    setSmartLoading(true);
    setSmartOpen(true);
    const result = await getSmartSuggestion(form.periodStart, form.periodEnd);
    setSmartData(result);
    setSmartLoading(false);
  };

  const handleUseSuggestion = () => {
    if (smartData?.suggestedTarget > 0) {
      setField('targetValue', String(smartData.suggestedTarget));
      setSmartOpen(false);
    }
  };

  const fieldClass = (name) =>
    `w-full px-3 py-2 text-sm rounded-lg border ${errors[name] ? 'border-rose-400 dark:border-rose-600' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary`;

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Meta' : 'Nova Meta'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" form="goal-form" disabled={isPending}
            className="px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
            {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEdit ? 'Salvar' : 'Criar Meta'}
          </button>
        </>
      }
    >
      <form id="goal-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Tipo */}
        <div className="flex gap-3">
          {[{ value: 'individual', label: 'Individual' }, { value: 'global', label: 'Global (Equipe)' }].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setField('type', opt.value)}
              className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                form.type === opt.value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Titulo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Titulo *</label>
          <input value={form.title} onChange={(e) => setField('title', e.target.value)}
            placeholder="Ex: Meta de vendas Marco" className={fieldClass('title')} />
          {errors.title && <p className="text-xs text-rose-500 mt-0.5">{errors.title}</p>}
        </div>

        {/* Descricao */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descricao</label>
          <textarea value={form.description} onChange={(e) => setField('description', e.target.value)}
            placeholder="Detalhes da meta..." rows={2} className={`${fieldClass('description')} resize-none`} />
        </div>

        {/* Responsavel (so individual) */}
        {form.type === 'individual' && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsavel *</label>
            <select value={form.ownerId} onChange={(e) => setField('ownerId', e.target.value)} className={fieldClass('ownerId')}>
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
            {errors.ownerId && <p className="text-xs text-rose-500 mt-0.5">{errors.ownerId}</p>}
          </div>
        )}

        {/* Periodo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Inicio *</label>
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
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Valor Alvo (R$) *</label>
              <button
                type="button"
                onClick={handleSmartSuggest}
                disabled={smartLoading}
                className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 rounded-md hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors disabled:opacity-50"
              >
                <Brain size={12} />
                Sugerir Meta
              </button>
            </div>
            <input type="number" min="0" step="0.01" value={form.targetValue}
              onChange={(e) => setField('targetValue', e.target.value)}
              placeholder="50000" className={fieldClass('targetValue')} />
            {errors.targetValue && <p className="text-xs text-rose-500 mt-0.5">{errors.targetValue}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Ajuste Manual (R$)</label>
            <input type="number" min="0" step="0.01" value={form.currentValue}
              onChange={(e) => setField('currentValue', e.target.value)}
              placeholder="0" className={fieldClass('currentValue')} />
            <p className="text-[11px] text-slate-400 mt-0.5">Valor extra somado ao progresso automatico</p>
          </div>
        </div>

        {/* Painel SMART */}
        {smartOpen && (
          <div className="rounded-lg border border-violet-200 dark:border-violet-800/50 bg-violet-50/50 dark:bg-violet-900/10 p-4">
            {smartLoading ? (
              <div className="flex items-center gap-3 justify-center py-4">
                <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-violet-600 dark:text-violet-400">Analisando dados do CRM...</span>
              </div>
            ) : smartData && !smartData.hasData ? (
              <div className="flex items-start gap-3 py-2">
                <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Dados insuficientes</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Cadastre registros de trafego pago e feche deals primeiro para que o sistema possa calcular uma meta realista.
                  </p>
                </div>
              </div>
            ) : smartData ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={14} className="text-violet-600 dark:text-violet-400" />
                  <span className="text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wider">
                    Sugestao SMART
                  </span>
                </div>

                {/* Breakdown do calculo */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 w-32">Investimento:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(smartData.investmentAvg)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 w-32">CPL historico:</span>
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
                    <span className="text-slate-500 dark:text-slate-400 w-32">Conversao real:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">
                      {smartData.conversionRate.toFixed(1)}%
                      <span className="text-[10px] text-slate-400 ml-1">({smartData.conversionSource === 'history' ? 'historico' : 'estimada'})</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 w-32">Deals esperados:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{smartData.expectedDeals}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 w-32">Ticket medio:</span>
                    <span className="font-medium text-slate-700 dark:text-slate-200">{formatCurrency(smartData.avgDealValue)}</span>
                  </div>
                </div>

                {/* Resultado */}
                <div className="mt-3 pt-3 border-t border-violet-200 dark:border-violet-700/50 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-medium text-violet-500 uppercase">Meta Sugerida</div>
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

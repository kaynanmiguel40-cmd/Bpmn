/**
 * TrafficFormModal - Modal para criar/editar registros de trafego pago.
 * Preview auto dos calculos (CPL, CPC, CTR, ROAS) conforme usuario digita.
 */

import { useState, useEffect, useMemo } from 'react';
import { CrmModal } from './ui/CrmModal';
import { useCreateCrmTraffic, useUpdateCrmTraffic, useCrmPipelines } from '../hooks/useCrmQueries';

const CHANNELS = [
  { value: 'google_ads', label: 'Google Ads' },
  { value: 'meta_ads', label: 'Meta Ads' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'organico', label: 'Organico' },
  { value: 'indicacao', label: 'Indicacao' },
  { value: 'outro', label: 'Outro' },
];

const EMPTY_FORM = {
  channel: '',
  pipelineId: '',
  periodStart: '',
  periodEnd: '',
  amountSpent: '',
  impressions: '',
  clicks: '',
  leadsGenerated: '',
  conversions: '',
  revenueGenerated: '',
  notes: '',
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

export function TrafficFormModal({ open, onClose, entry = null }) {
  const isEdit = !!entry;
  const createMutation = useCreateCrmTraffic();
  const updateMutation = useUpdateCrmTraffic();
  const isPending = createMutation.isPending || updateMutation.isPending;

  const { data: pipelines = [] } = useCrmPipelines();

  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open && entry) {
      setForm({
        channel: entry.channel || '',
        pipelineId: entry.pipelineId || '',
        periodStart: entry.periodStart ? entry.periodStart.split('T')[0] : '',
        periodEnd: entry.periodEnd ? entry.periodEnd.split('T')[0] : '',
        amountSpent: entry.amountSpent || '',
        impressions: entry.impressions || '',
        clicks: entry.clicks || '',
        leadsGenerated: entry.leadsGenerated || '',
        conversions: entry.conversions || '',
        revenueGenerated: entry.revenueGenerated || '',
        notes: entry.notes || '',
      });
      setErrors({});
    } else if (open) {
      const defaults = getDefaultPeriod();
      setForm({ ...EMPTY_FORM, ...defaults });
      setErrors({});
    }
  }, [open, entry]);

  const setField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors(prev => ({ ...prev, [key]: null }));
  };

  const metrics = useMemo(() => {
    const spent = parseFloat(form.amountSpent) || 0;
    const impressions = parseInt(form.impressions) || 0;
    const clicks = parseInt(form.clicks) || 0;
    const leads = parseInt(form.leadsGenerated) || 0;
    const revenue = parseFloat(form.revenueGenerated) || 0;

    return {
      cpl: leads > 0 ? spent / leads : 0,
      cpc: clicks > 0 ? spent / clicks : 0,
      ctr: impressions > 0 ? (clicks / impressions) * 100 : 0,
      roas: spent > 0 ? revenue / spent : 0,
    };
  }, [form.amountSpent, form.impressions, form.clicks, form.leadsGenerated, form.revenueGenerated]);

  const validate = () => {
    const errs = {};
    if (!form.channel) errs.channel = 'Selecione um canal';
    if (!form.periodStart) errs.periodStart = 'Data inicio obrigatoria';
    if (!form.periodEnd) errs.periodEnd = 'Data fim obrigatoria';
    const spent = parseFloat(form.amountSpent);
    if (isNaN(spent) || spent < 0) errs.amountSpent = 'Valor gasto invalido';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      channel: form.channel,
      pipelineId: form.pipelineId || null,
      periodStart: form.periodStart,
      periodEnd: form.periodEnd,
      amountSpent: parseFloat(form.amountSpent) || 0,
      impressions: parseInt(form.impressions) || 0,
      clicks: parseInt(form.clicks) || 0,
      leadsGenerated: parseInt(form.leadsGenerated) || 0,
      conversions: parseInt(form.conversions) || 0,
      revenueGenerated: parseFloat(form.revenueGenerated) || 0,
      notes: form.notes.trim(),
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({ id: entry.id, updates: data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch {
      // toast ja exibido pelo hook
    }
  };

  const fieldClass = (name) =>
    `w-full px-3 py-2 text-sm rounded-lg border ${errors[name] ? 'border-rose-400 dark:border-rose-600' : 'border-slate-300 dark:border-slate-600'} bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary`;

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Registro' : 'Novo Registro de Trafego'}
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50">
            Cancelar
          </button>
          <button type="submit" form="traffic-form" disabled={isPending}
            className="px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg disabled:opacity-50 flex items-center gap-2">
            {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isEdit ? 'Salvar' : 'Criar Registro'}
          </button>
        </>
      }
    >
      <form id="traffic-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Canal + Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Canal *</label>
            <select value={form.channel} onChange={(e) => setField('channel', e.target.value)} className={fieldClass('channel')}>
              <option value="">Selecione...</option>
              {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
            {errors.channel && <p className="text-xs text-rose-500 mt-0.5">{errors.channel}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pipeline (destino dos leads)</label>
            <select value={form.pipelineId} onChange={(e) => setField('pipelineId', e.target.value)} className={fieldClass('pipelineId')}>
              <option value="">Todos</option>
              {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>

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

        {/* Valor gasto + Receita */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Valor Gasto (R$) *</label>
            <input type="number" min="0" step="0.01" value={form.amountSpent}
              onChange={(e) => setField('amountSpent', e.target.value)}
              placeholder="2000.00" className={fieldClass('amountSpent')} />
            {errors.amountSpent && <p className="text-xs text-rose-500 mt-0.5">{errors.amountSpent}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Receita Gerada (R$)</label>
            <input type="number" min="0" step="0.01" value={form.revenueGenerated}
              onChange={(e) => setField('revenueGenerated', e.target.value)}
              placeholder="10000.00" className={fieldClass('revenueGenerated')} />
          </div>
        </div>

        {/* Impressoes + Cliques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Impressoes</label>
            <input type="number" min="0" step="1" value={form.impressions}
              onChange={(e) => setField('impressions', e.target.value)}
              placeholder="50000" className={fieldClass('impressions')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Cliques</label>
            <input type="number" min="0" step="1" value={form.clicks}
              onChange={(e) => setField('clicks', e.target.value)}
              placeholder="2500" className={fieldClass('clicks')} />
          </div>
        </div>

        {/* Leads + Conversoes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Leads Gerados</label>
            <input type="number" min="0" step="1" value={form.leadsGenerated}
              onChange={(e) => setField('leadsGenerated', e.target.value)}
              placeholder="150" className={fieldClass('leadsGenerated')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Conversoes</label>
            <input type="number" min="0" step="1" value={form.conversions}
              onChange={(e) => setField('conversions', e.target.value)}
              placeholder="30" className={fieldClass('conversions')} />
          </div>
        </div>

        {/* Preview de Metricas */}
        {(parseFloat(form.amountSpent) > 0 || parseInt(form.clicks) > 0) && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <div className="text-center">
              <div className="text-[10px] font-medium text-slate-400 uppercase">CPL</div>
              <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatCurrency(metrics.cpl)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-medium text-slate-400 uppercase">CPC</div>
              <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{formatCurrency(metrics.cpc)}</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-medium text-slate-400 uppercase">CTR</div>
              <div className="text-sm font-bold text-slate-700 dark:text-slate-200">{metrics.ctr.toFixed(2)}%</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] font-medium text-slate-400 uppercase">ROAS</div>
              <div className={`text-sm font-bold ${metrics.roas >= 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {metrics.roas.toFixed(2)}x
              </div>
            </div>
          </div>
        )}

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas</label>
          <textarea value={form.notes} onChange={(e) => setField('notes', e.target.value)}
            placeholder="Observacoes sobre a campanha..." rows={2} className={`${fieldClass('notes')} resize-none`} />
        </div>
      </form>
    </CrmModal>
  );
}

export default TrafficFormModal;

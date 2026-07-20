/**
 * AutomationFormModal
 * Criação e edição de regras de automação do CRM.
 */

import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Type, Image, Video, Mic, Zap } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { fieldClass as sharedFieldClass } from './ui/formFieldClass';
import { useCrmPipelines } from '../hooks/useCrmQueries';
import { useCreateAutomation, useUpdateAutomation } from '../hooks/useCrmQueries';
import { loadSegments } from '../lib/crmSegments';

const CHANNELS = [
  { id: 'email',     label: 'E-mail',    icon: Mail },
  { id: 'whatsapp',  label: 'WhatsApp',  icon: MessageSquare },
];

const MESSAGE_TYPES = [
  { id: 'text',  label: 'Texto',   icon: Type },
  { id: 'image', label: 'Imagem',  icon: Image },
  { id: 'video', label: 'Vídeo',   icon: Video },
  { id: 'audio', label: 'Áudio',   icon: Mic },
];

function emptyForm() {
  return {
    name: '',
    pipelineId: '',
    stageId: '',
    channel: 'whatsapp',
    messageType: 'text',
    subject: '',
    messageContent: '',
    mediaUrl: '',
    segmentFilter: '',
    delayMinutes: 0,
    // Nasce inativa: automacao nova (ainda sendo configurada/testada) nao
    // deve poder disparar mensagem real pro primeiro deal que cair na etapa.
    active: false,
  };
}

export function AutomationFormModal({ open, onClose, automation }) {
  const isEdit = !!automation?.id;
  const [form, setForm] = useState(emptyForm());
  // Só apresentação: o submit já barrava os campos obrigatórios com `return`
  // mudo. Este estado existe apenas para dizer à usuária QUAL campo faltou.
  const [errors, setErrors] = useState({});
  // Recarregado a cada abertura — a lista de Segmentos (Configurações) pode ter
  // mudado desde a última vez que este modal foi aberto.
  const [segmentOptions, setSegmentOptions] = useState(() => loadSegments());

  const { data: pipelinesData } = useCrmPipelines();
  const pipelines = pipelinesData || [];

  const createMutation = useCreateAutomation();
  const updateMutation = useUpdateAutomation();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // Stages do pipeline selecionado
  const selectedPipeline = pipelines.find(p => p.id === form.pipelineId);
  const stages = selectedPipeline?.stages || [];

  // Preencher formulário ao editar
  useEffect(() => {
    if (open) {
      setSegmentOptions(loadSegments());
      setErrors({});
      setForm(automation ? {
        name:           automation.name           || '',
        pipelineId:     automation.pipelineId     || '',
        stageId:        automation.stageId        || '',
        channel:        automation.channel        || 'whatsapp',
        messageType:    automation.messageType    || 'text',
        subject:        automation.subject        || '',
        messageContent: automation.messageContent || '',
        mediaUrl:       automation.mediaUrl       || '',
        segmentFilter:  automation.segmentFilter  || '',
        delayMinutes:   automation.delayMinutes   ?? 0,
        active:         automation.active         ?? true,
      } : emptyForm());
    }
  }, [open, automation]);

  const clearError = (key) => setErrors(prev => (prev[key] ? { ...prev, [key]: undefined } : prev));

  // Resetar stage ao trocar pipeline
  const handlePipelineChange = (pipelineId) => {
    setForm(f => ({ ...f, pipelineId, stageId: '' }));
    setErrors(prev => ({ ...prev, pipelineId: undefined, stageId: undefined }));
  };

  const set = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
    clearError(key);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setErrors(prev => ({ ...prev, name: 'Dê um nome para a automação' })); return; }
    if (!form.stageId)     { setErrors(prev => ({ ...prev, [form.pipelineId ? 'stageId' : 'pipelineId']: form.pipelineId ? 'Escolha a etapa que dispara a automação' : 'Escolha o pipeline' })); return; }
    if (!form.channel)     { setErrors(prev => ({ ...prev, channel: 'Escolha o canal de envio' })); return; }

    const payload = {
      ...form,
      delayMinutes: Number(form.delayMinutes) || 0,
      segmentFilter: form.segmentFilter || null,
      subject: form.channel === 'email' ? (form.subject?.trim() || null) : null,
      messageContent: form.messageType === 'text' ? form.messageContent : null,
      mediaUrl: form.messageType !== 'text' ? form.mediaUrl : null,
    };

    if (isEdit) {
      await updateMutation.mutateAsync({ id: automation.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  // Helpers de estilo
  const tabBtn = (active) =>
    `min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-fyness-primary text-white'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
    }`;

  const fieldClass = (name) => sharedFieldClass(!!errors[name]);
  const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';
  const hintCls = 'text-[12px] text-slate-500 dark:text-slate-400 mt-1';

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar automação' : 'Nova automação'}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="automation-form"
            disabled={isPending}
            className="min-h-[44px] px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            {isPending
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Zap size={14} />}
            {isPending ? (isEdit ? 'Salvando…' : 'Criando…') : isEdit ? 'Salvar' : 'Criar automação'}
          </button>
        </>
      }
    >
      <form id="automation-form" onSubmit={handleSubmit} className="space-y-4">

        {/* Nome */}
        <div>
          <label className={labelCls}>Nome da automação *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Ex.: Boas-vindas Follow 1 Agro"
            className={fieldClass('name')}
          />
          {errors.name && <p className="text-xs text-rose-500 mt-0.5">{errors.name}</p>}
        </div>

        {/* Pipeline + Etapa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Pipeline *</label>
            <select
              value={form.pipelineId}
              onChange={e => handlePipelineChange(e.target.value)}
              className={fieldClass('pipelineId')}
            >
              <option value="">Selecionar pipeline</option>
              {pipelines.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.pipelineId && <p className="text-xs text-rose-500 mt-0.5">{errors.pipelineId}</p>}
          </div>
          <div>
            <label className={labelCls}>Etapa de disparo *</label>
            <select
              value={form.stageId}
              onChange={e => set('stageId', e.target.value)}
              className={fieldClass('stageId')}
              disabled={!form.pipelineId}
            >
              <option value="">Selecionar etapa</option>
              {stages.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.stageId && <p className="text-xs text-rose-500 mt-0.5">{errors.stageId}</p>}
          </div>
        </div>

        {/* Canal */}
        <div>
          <label className={labelCls}>Canal de envio *</label>
          <div className="flex gap-2">
            {CHANNELS.map(ch => {
              const Icon = ch.icon;
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => set('channel', ch.id)}
                  className={tabBtn(form.channel === ch.id)}
                >
                  <Icon size={14} />
                  {ch.label}
                </button>
              );
            })}
          </div>
          {errors.channel && <p className="text-xs text-rose-500 mt-0.5">{errors.channel}</p>}
          {form.channel === 'whatsapp' && (
            <p className="mt-1 text-[12px] text-amber-600 dark:text-amber-400">
              Envio real via a instância WhatsApp conectada (Evolution API) — mensagens de teste chegam de verdade no lead.
            </p>
          )}
          {form.channel === 'email' && (
            <p className="mt-1 text-[12px] text-emerald-600 dark:text-emerald-400">
              Envio ativo via Resend (Edge Function send-email).
            </p>
          )}
        </div>

        {/* Assunto — só para e-mail */}
        {form.channel === 'email' && (
          <div>
            <label className={labelCls}>Assunto do e-mail</label>
            <input
              type="text"
              value={form.subject}
              onChange={e => set('subject', e.target.value)}
              placeholder="Ex.: {nome}, vamos avançar com a sua proposta?"
              className={fieldClass('subject')}
            />
            <p className={hintCls}>
              Vazio → será usado o nome da automação como assunto.
            </p>
          </div>
        )}

        {/* Tipo de mensagem */}
        <div>
          <label className={labelCls}>Tipo de mensagem</label>
          <div className="flex gap-2 flex-wrap">
            {MESSAGE_TYPES.map(mt => {
              const Icon = mt.icon;
              return (
                <button
                  key={mt.id}
                  type="button"
                  onClick={() => set('messageType', mt.id)}
                  className={tabBtn(form.messageType === mt.id)}
                >
                  <Icon size={14} />
                  {mt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Conteúdo da mensagem */}
        {form.messageType === 'text' ? (
          <div>
            <label className={labelCls}>Mensagem</label>
            <textarea
              value={form.messageContent}
              onChange={e => set('messageContent', e.target.value)}
              placeholder="Olá {nome}, vimos que você avançou para…"
              rows={4}
              className={`${fieldClass('messageContent')} resize-none`}
            />
            <p className={hintCls}>
              Variáveis disponíveis:{' '}
              <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">{'{nome}'}</code>{' '}
              <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">{'{empresa}'}</code>{' '}
              <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">{'{valor}'}</code>{' '}
              <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">{'{etapa}'}</code>{' '}
              <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">{'{vendedor}'}</code>
            </p>
          </div>
        ) : (
          <div>
            <label className={labelCls}>URL da mídia ({form.messageType})</label>
            <input
              type="url"
              value={form.mediaUrl}
              onChange={e => set('mediaUrl', e.target.value)}
              placeholder="https://…"
              className={fieldClass('mediaUrl')}
            />
          </div>
        )}

        {/* Segmento (filtro de tag) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Filtrar por segmento</label>
            <select
              value={form.segmentFilter}
              onChange={e => set('segmentFilter', e.target.value)}
              className={fieldClass('segmentFilter')}
            >
              <option value="">Todos os segmentos</option>
              {segmentOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <p className={hintCls}>
              Vazio = dispara para qualquer deal na etapa.
            </p>
          </div>
          <div>
            <label className={labelCls}>Delay (minutos após avançar)</label>
            <input
              type="number"
              min={0}
              max={10080}
              value={form.delayMinutes}
              onChange={e => set('delayMinutes', e.target.value)}
              className={fieldClass('delayMinutes')}
            />
          </div>
        </div>

        {/* Ativo */}
        <div className="min-h-[44px] flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => set('active', !form.active)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              form.active ? 'bg-fyness-primary' : 'bg-slate-300 dark:bg-slate-600'
            }`}
          >
            <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
              form.active ? 'translate-x-[18px]' : 'translate-x-[2px]'
            }`} />
          </button>
          <span className="text-sm text-slate-700 dark:text-slate-300">
            {form.active ? 'Ativa — disparará automaticamente' : 'Inativa — não disparará'}
          </span>
        </div>

      </form>
    </CrmModal>
  );
}

export default AutomationFormModal;

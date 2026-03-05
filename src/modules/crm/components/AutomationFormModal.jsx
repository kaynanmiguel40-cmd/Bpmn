/**
 * AutomationFormModal
 * Criação e edição de regras de automação do CRM.
 */

import { useState, useEffect } from 'react';
import { Mail, MessageSquare, Smartphone, Type, Image, Video, Mic, Zap } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { useCrmPipelines } from '../hooks/useCrmQueries';
import { useCreateAutomation, useUpdateAutomation } from '../hooks/useCrmQueries';

const CHANNELS = [
  { id: 'email',     label: 'E-mail',    icon: Mail },
  { id: 'whatsapp',  label: 'WhatsApp',  icon: MessageSquare },
  { id: 'sms',       label: 'SMS',       icon: Smartphone },
];

const MESSAGE_TYPES = [
  { id: 'text',  label: 'Texto',   icon: Type },
  { id: 'image', label: 'Imagem',  icon: Image },
  { id: 'video', label: 'Vídeo',   icon: Video },
  { id: 'audio', label: 'Áudio',   icon: Mic },
];

const SEGMENT_OPTIONS = [
  'Agro', 'Varejo', 'Industria', 'Tecnologia', 'Educacao',
  'Saude', 'Financeiro', 'Construcao', 'Servicos', 'Outro',
];

function emptyForm() {
  return {
    name: '',
    pipelineId: '',
    stageId: '',
    channel: 'whatsapp',
    messageType: 'text',
    messageContent: '',
    mediaUrl: '',
    segmentFilter: '',
    delayMinutes: 0,
    active: true,
  };
}

export function AutomationFormModal({ open, onClose, automation }) {
  const isEdit = !!automation;
  const [form, setForm] = useState(emptyForm());

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
      setForm(automation ? {
        name:           automation.name           || '',
        pipelineId:     automation.pipelineId     || '',
        stageId:        automation.stageId        || '',
        channel:        automation.channel        || 'whatsapp',
        messageType:    automation.messageType    || 'text',
        messageContent: automation.messageContent || '',
        mediaUrl:       automation.mediaUrl       || '',
        segmentFilter:  automation.segmentFilter  || '',
        delayMinutes:   automation.delayMinutes   ?? 0,
        active:         automation.active         ?? true,
      } : emptyForm());
    }
  }, [open, automation]);

  // Resetar stage ao trocar pipeline
  const handlePipelineChange = (pipelineId) => {
    setForm(f => ({ ...f, pipelineId, stageId: '' }));
  };

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (!form.stageId)     return;
    if (!form.channel)     return;

    const payload = {
      ...form,
      delayMinutes: Number(form.delayMinutes) || 0,
      segmentFilter: form.segmentFilter || null,
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
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      active
        ? 'bg-blue-600 text-white'
        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
    }`;

  const inputCls = 'w-full px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40';
  const labelCls = 'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1';

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Automação' : 'Nova Automação'}
      size="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="automation-form"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <Zap size={14} />
            {isPending ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar Automação'}
          </button>
        </>
      }
    >
      <form id="automation-form" onSubmit={handleSubmit} className="space-y-5">

        {/* Nome */}
        <div>
          <label className={labelCls}>Nome da automação *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Ex.: Boas-vindas Follow 1 Agro"
            className={inputCls}
            required
          />
        </div>

        {/* Pipeline + Etapa */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Pipeline *</label>
            <select
              value={form.pipelineId}
              onChange={e => handlePipelineChange(e.target.value)}
              className={inputCls}
              required
            >
              <option value="">Selecionar pipeline</option>
              {pipelines.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Etapa de disparo *</label>
            <select
              value={form.stageId}
              onChange={e => set('stageId', e.target.value)}
              className={inputCls}
              required
              disabled={!form.pipelineId}
            >
              <option value="">Selecionar etapa</option>
              {stages.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
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
          {form.channel === 'whatsapp' && (
            <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
              Requer integração com Meta Business API ou Z-API para envio real.
            </p>
          )}
          {form.channel === 'sms' && (
            <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
              Requer integração com Twilio para envio real.
            </p>
          )}
          {form.channel === 'email' && (
            <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
              Requer integração com Resend / SendGrid para envio real.
            </p>
          )}
        </div>

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
              placeholder="Olá {nome}, vimos que você avançou para..."
              rows={4}
              className={`${inputCls} resize-none`}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Use <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">{'{nome}'}</code> para inserir o nome do contato.
            </p>
          </div>
        ) : (
          <div>
            <label className={labelCls}>URL da mídia ({form.messageType})</label>
            <input
              type="url"
              value={form.mediaUrl}
              onChange={e => set('mediaUrl', e.target.value)}
              placeholder="https://..."
              className={inputCls}
            />
          </div>
        )}

        {/* Segmento (filtro de tag) */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Filtrar por segmento</label>
            <select
              value={form.segmentFilter}
              onChange={e => set('segmentFilter', e.target.value)}
              className={inputCls}
            >
              <option value="">Todos os segmentos</option>
              {SEGMENT_OPTIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-slate-400">
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
              className={inputCls}
            />
          </div>
        </div>

        {/* Ativo */}
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            onClick={() => set('active', !form.active)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
              form.active ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-600'
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

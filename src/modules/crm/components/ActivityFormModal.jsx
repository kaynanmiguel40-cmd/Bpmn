/**
 * ActivityFormModal - Modal para criar/editar atividades do CRM.
 * React Hook Form + Zod validation.
 */

import { useState, useEffect, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Phone, Mail, Video, FileText, MapPin, UtensilsCrossed, MessageCircle, UserPlus, Trash2, CheckCircle2 } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { fieldClass as sharedFieldClass } from './ui/formFieldClass';
import { CrmConfirmDialog } from './ui/CrmConfirmDialog';
import { z } from 'zod';
import { crmActivitySchema } from '../schemas/crmValidation';

// Tipos pontuais (ligacao/mensagem) nao tem uma "janela" real de horario —
// exigir ENTREGA igual reuniao forcava o vendedor a chutar um segundo
// horario sem sentido. So exige ENTREGA pros demais tipos (tarefa/email/
// reuniao/visita/almoco).
const INSTANT_ACTIVITY_TYPES = ['call', 'message'];

// No modal, INÍCIO é sempre obrigatório; ENTREGA só quando o tipo não é pontual.
const activityFormSchema = crmActivitySchema
  .extend({ endDate: z.string().nullable().optional() })
  .superRefine((data, ctx) => {
    if (!INSTANT_ACTIVITY_TYPES.includes(data.type) && !data.endDate) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['endDate'], message: 'Informe a hora em que a tarefa termina' });
    }
  });
import {
  useCrmContacts,
  useCrmDeals,
  useCreateCrmActivity,
  useUpdateCrmActivity,
  useDeleteCrmActivity,
  useReportOwners,
} from '../hooks/useCrmQueries';
import { getActivityAttendees } from '../services/crmActivitiesService';

// Converte Date ou ISO string para formato aceito pelo <input type="datetime-local">:
// "YYYY-MM-DDTHH:MM" (hora LOCAL do usuario, sem fuso).
function toLocalDatetimeInput(val) {
  if (!val) return '';
  const d = val instanceof Date ? val : new Date(val);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Tipos de atividade. Todos viram evento no Google Calendar; meeting/visit/lunch
// aceitam convidados e a reunião ainda ganha link do Google Meet.
// `label` é só texto de tela — quem manda no dado é `value`.
const ACTIVITY_TYPES = [
  { value: 'call', label: 'Ligação', icon: Phone, kind: 'task', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700' },
  { value: 'message', label: 'Mensagem', icon: MessageCircle, kind: 'task', color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-300 dark:border-green-700' },
  { value: 'email', label: 'Email', icon: Mail, kind: 'task', color: 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-300 dark:border-violet-700' },
  { value: 'task', label: 'Tarefa', icon: FileText, kind: 'task', color: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700' },
  { value: 'meeting', label: 'Reunião', icon: Video, kind: 'event', color: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700' },
  { value: 'visit', label: 'Visita', icon: MapPin, kind: 'event', color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700' },
  { value: 'lunch', label: 'Almoço', icon: UtensilsCrossed, kind: 'event', color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700' },
];

// Norma de modal do CRM: estilo único de campo. Subcomponentes (combobox,
// convidados) usam FIELD_CLASS() direto; o formulário usa fieldClass(name),
// que só troca a borda quando aquele campo tem erro de validação.
const FIELD_CLASS = (hasError = false) => sharedFieldClass(hasError);

// Botões do rodapé — norma de modal do CRM (alvo de toque >= 44px).
const BTN_PRIMARY =
  'min-h-[44px] px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto';
const BTN_SECONDARY =
  'min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto';
const BTN_ICON =
  'min-h-[44px] min-w-[44px] p-2 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg disabled:opacity-50';

function EntityCombobox({ value, onChange, placeholder, useQueryHook, nameField = 'name', labelField }) {
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
        value={open ? search : (selected?.[nameField] || selected?.[labelField] || '')}
        onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className={FIELD_CLASS()}
      />
      {value && (
        <button type="button" onClick={() => { onChange(null); setSearch(''); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
          <X size={14} />
        </button>
      )}
      {open && items.length > 0 && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {items.map(item => (
            <button key={item.id} type="button"
              onClick={() => { onChange(item.id); setSearch(''); setOpen(false); }}
              className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700">
              <span className="font-medium text-slate-800 dark:text-slate-200">{item[nameField] || item[labelField]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Convidados por e-mail (chips). Vira attendees do evento no Google Calendar.
function AttendeesInput({ value = [], onChange }) {
  const [draft, setDraft] = useState('');
  const add = () => {
    const email = draft.trim().toLowerCase();
    const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    if (valid && !value.includes(email)) onChange([...value, email]);
    setDraft('');
  };
  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {value.map(em => (
            <span key={em} className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/40">
              {em}
              <button type="button" onClick={() => onChange(value.filter(e => e !== em))} className="hover:text-blue-900 dark:hover:text-blue-100">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        type="email"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder="email@convidado.com — Enter pra adicionar"
        className={FIELD_CLASS()}
      />
    </div>
  );
}

const EVENT_TYPE_VALUES = ['meeting', 'visit', 'lunch'];

export function ActivityFormModal({
  open, onClose, activity = null, defaultDealId = null, defaultContactId = null, onOpenLeadHistory = null,
  // Responsavel padrao pra tarefa NOVA — normalmente quem esta logado, mas
  // uma agenda aberta na visao de outro vendedor deve herdar esse vendedor
  // como padrao (sem isso, "Nova tarefa" no calendario do Joao criava a
  // tarefa pra quem clicou, nao pro Joao).
  defaultAssignedTo = null, defaultAssignedToName = null,
}) {
  const isEdit = !!activity?.id;
  const createMutation = useCreateCrmActivity();
  const updateMutation = useUpdateCrmActivity();
  const deleteMutation = useDeleteCrmActivity();
  const isPending = createMutation.isPending || updateMutation.isPending;
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  // Entrega (input/output) da tarefa concluída — editável aqui pra quem
  // concluiu pulando os detalhes voltar e preencher. Fica fora do
  // react-hook-form/schema (que valida só o agendamento da tarefa).
  const [deliveryInput, setDeliveryInput] = useState('');
  const [deliveryReport, setDeliveryReport] = useState('');

  const { register, handleSubmit, control, reset, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      title: '', description: '', type: 'call',
      contactId: null, dealId: null,
      startDate: '', endDate: null, completed: false, attendees: [],
      assignedTo: null, assignedToName: null,
    },
  });

  const selectedType = watch('type');
  const assignedTo = watch('assignedTo');
  const { data: owners = [] } = useReportOwners();

  useEffect(() => {
    if (open && activity) {
      reset({
        title: activity.title || '',
        description: activity.description || '',
        type: activity.type || 'call',
        contactId: activity.contactId || null,
        dealId: activity.dealId || null,
        startDate: toLocalDatetimeInput(activity.startDate),
        endDate: toLocalDatetimeInput(activity.endDate),
        completed: activity.completed || false,
        attendees: Array.isArray(activity.attendees) ? activity.attendees : [],
        assignedTo: activity.assignedTo || null,
        assignedToName: activity.assignedToName || null,
      });
      setDeliveryInput(activity.deliveryInput || '');
      setDeliveryReport(activity.deliveryReport || '');
    } else if (open) {
      // Default: agora, arredondado pra proxima meia-hora, duracao 30min
      const now = new Date();
      now.setMinutes(now.getMinutes() + (30 - (now.getMinutes() % 30 || 30)), 0, 0);
      const end = new Date(now.getTime() + 30 * 60 * 1000);
      reset({
        title: '', description: '', type: 'call',
        contactId: defaultContactId || null,
        dealId: defaultDealId || null,
        startDate: toLocalDatetimeInput(now),
        endDate: toLocalDatetimeInput(end),
        completed: false,
        attendees: [],
        assignedTo: null, assignedToName: null,
      });
    }
  }, [open, activity, reset, defaultDealId, defaultContactId]);

  // Em tarefa NOVA, responsável já vem preenchido: o vendedor cuja agenda
  // está sendo vista (defaultAssignedTo), ou você mesmo na ausência disso.
  // Roda UMA vez por abertura (ref). Antes tinha `assignedTo` nas deps e a
  // guarda `!assignedTo`, então re-disparava sempre que o campo ficava vazio —
  // escolher "— Selecionar responsável —" revertia sozinho pro default (clique
  // morto). Com o ref, limpar o campo agora fica limpo.
  // Precisa ficar DEPOIS do reset acima: os dois disparam no mesmo commit
  // quando `open` vira true, e o reset zera assignedTo.
  const assigneeInitRef = useRef(false);
  useEffect(() => {
    if (!open) { assigneeInitRef.current = false; return; }
    if (isEdit || !owners.length || assigneeInitRef.current) return;
    assigneeInitRef.current = true;
    if (defaultAssignedTo) {
      setValue('assignedTo', defaultAssignedTo);
      setValue('assignedToName', defaultAssignedToName || owners.find(o => o.authUserId === defaultAssignedTo)?.name || null);
      return;
    }
    const me = owners.find(o => o.isMe) || owners[0];
    if (me) { setValue('assignedTo', me.authUserId); setValue('assignedToName', me.name); }
  }, [open, isEdit, owners, setValue, defaultAssignedTo, defaultAssignedToName]);

  // Convidados vivem em agenda_events, não em crm_activities — o objeto
  // `activity` nunca os traz, então o form precisa buscá-los. Sem isso a edição
  // salvava attendees:[] e apagava os convidados já gravados no evento.
  // Também precisa ficar DEPOIS do reset (que zera attendees).
  useEffect(() => {
    if (!open || !activity?.agendaEventId) return;
    let cancelled = false;
    getActivityAttendees(activity.agendaEventId).then(emails => {
      if (!cancelled && emails.length) setValue('attendees', emails);
    });
    return () => { cancelled = true; };
  }, [open, activity?.agendaEventId, setValue]);

  const onSubmit = async (data) => {
    // <input type="datetime-local"> devolve "YYYY-MM-DDTHH:MM" sem timezone.
    // Sem converter pra ISO UTC, o Postgres assume UTC e a hora exibida fica
    // off-by-3h (no Brasil). new Date(s) interpreta como LOCAL; toISOString
    // serializa em UTC — round-trip correto.
    const toIsoUtc = (s) => (s ? new Date(s).toISOString() : null);
    const payload = {
      ...data,
      startDate: toIsoUtc(data.startDate),
      endDate: toIsoUtc(data.endDate),
    };
    // Só grava a entrega quando a tarefa já está concluída (é aí que os
    // campos aparecem). Tarefa em aberto não tem entrega ainda.
    if (isEdit && activity.completed) {
      payload.deliveryInput = deliveryInput.trim();
      payload.deliveryReport = deliveryReport.trim();
    }
    if (isEdit) {
      await updateMutation.mutateAsync({ id: activity.id, updates: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    onClose();
  };

  const fieldClass = (name) => FIELD_CLASS(!!errors[name]);

  return (
    <>
    <CrmModal open={open} onClose={onClose} title={isEdit ? 'Editar tarefa' : 'Nova tarefa'} size="lg"
      footer={
        <>
          {isEdit && onOpenLeadHistory && (activity?.dealId || activity?.contactId) && (
            <button type="button" onClick={() => onOpenLeadHistory(activity)}
              className="mr-auto min-h-[44px] inline-flex items-center px-3 py-2 text-sm font-medium text-fyness-primary hover:underline">
              Histórico do lead →
            </button>
          )}
          {isEdit && (
            <>
              <button type="button" onClick={() => setConfirmDeleteOpen(true)} disabled={isPending || deleteMutation.isPending}
                title="Excluir atividade"
                className={`${onOpenLeadHistory && (activity?.dealId || activity?.contactId) ? '' : 'mr-auto'} ${BTN_ICON}`}>
                <Trash2 size={16} />
              </button>
              {/* Separador some no mobile: com o rodape empilhado ele viraria um
                  risco solto entre os botoes. */}
              <span className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-700 mx-0.5" aria-hidden="true" />
            </>
          )}
          <button type="button" onClick={onClose} disabled={isPending} className={BTN_SECONDARY}>
            Cancelar
          </button>
          <button type="submit" form="activity-form" disabled={isPending} className={BTN_PRIMARY}>
            {isPending && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
            {isPending ? (isEdit ? 'Salvando…' : 'Criando…') : (isEdit ? 'Salvar' : 'Criar tarefa')}
          </button>
        </>
      }>
      <form id="activity-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Tipo da atividade */}
        <div>
          <p className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</p>
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_TYPES.map(t => {
              const Icon = t.icon;
              const isActive = selectedType === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setValue('type', t.value)}
                  className={`min-h-[44px] flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    isActive
                      ? `${t.color} ring-1 ring-offset-1 dark:ring-offset-slate-900`
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <Icon size={12} />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Titulo */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Título *</label>
          <input {...register('title')} placeholder="Ex.: Ligar para cliente sobre proposta" className={fieldClass('title')} />
          {errors.title && <p className="text-xs text-rose-500 mt-0.5">{errors.title.message}</p>}
        </div>

        {/* Data + Hora */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Início *</label>
            <input type="datetime-local" {...register('startDate')} className={fieldClass('startDate')} />
            {errors.startDate && <p className="text-xs text-rose-500 mt-0.5">{errors.startDate.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Entrega{!INSTANT_ACTIVITY_TYPES.includes(selectedType) && ' *'}
            </label>
            <input type="datetime-local" {...register('endDate')} className={fieldClass('endDate')} />
            {errors.endDate && <p className="text-xs text-rose-500 mt-0.5">{errors.endDate.message}</p>}
          </div>
        </div>

        {/* Contato + Negocio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contato</label>
            <Controller name="contactId" control={control}
              render={({ field }) => (
                <EntityCombobox value={field.value} onChange={field.onChange}
                  placeholder="Buscar contato…" useQueryHook={useCrmContacts} />
              )} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Negócio</label>
            <Controller name="dealId" control={control}
              render={({ field }) => (
                <EntityCombobox value={field.value} onChange={field.onChange}
                  placeholder="Buscar negócio…" useQueryHook={useCrmDeals} nameField="title" />
              )} />
          </div>
        </div>

        {/* Responsável pela tarefa (vendedor) — pode ser != quem cria */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Responsável</label>
          <select
            value={assignedTo || ''}
            onChange={(e) => {
              const o = owners.find(x => x.authUserId === e.target.value);
              setValue('assignedTo', o ? o.authUserId : null);
              setValue('assignedToName', o ? o.name : null);
            }}
            className={fieldClass('assignedTo')}
          >
            <option value="">— Selecionar responsável —</option>
            {owners.map(o => (
              <option key={o.authUserId} value={o.authUserId}>{o.name}{o.isMe ? ' (você)' : ''}</option>
            ))}
          </select>
        </div>

        {/* Convidados — só pra eventos (reunião/visita/almoço) */}
        {EVENT_TYPE_VALUES.includes(selectedType) && (
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <UserPlus size={14} /> Convidados
              <span className="font-normal text-xs text-slate-500 dark:text-slate-400">recebem convite por e-mail</span>
            </label>
            <Controller name="attendees" control={control}
              render={({ field }) => (
                <AttendeesInput value={field.value || []} onChange={field.onChange} />
              )} />
            {selectedType === 'meeting' && (
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                <Video size={11} /> Reunião gera link do Google Meet automaticamente.
              </p>
            )}
          </div>
        )}

        {/* Descricao */}
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
          <textarea {...register('description')} rows={3} placeholder="Detalhes da atividade…"
            className={`${fieldClass('description')} resize-none`} />
        </div>

        {/* O que aconteceu nesta tarefa (input/output) — EDITÁVEL: quem concluiu
            pulando os detalhes volta aqui e preenche. Só aparece pra tarefa já
            concluída (em aberto a entrega vem depois, na conclusão). */}
        {isEdit && activity?.completed && (
          <div className="rounded-xl border border-emerald-200/70 dark:border-emerald-800/40 bg-emerald-50/40 dark:bg-emerald-900/10 p-3 space-y-3">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 size={13} /> O que aconteceu nesta tarefa
            </p>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">O que você fez/disse</label>
              <textarea value={deliveryInput} onChange={(e) => setDeliveryInput(e.target.value)} rows={2}
                placeholder="Ex.: liguei e apresentei a proposta, mandei o áudio explicando o preço…"
                className={`${FIELD_CLASS()} resize-none`} />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">O que o lead respondeu</label>
              <textarea value={deliveryReport} onChange={(e) => setDeliveryReport(e.target.value)} rows={2}
                placeholder="Ex.: achou caro, pediu pra ligar semana que vem, topou agendar reunião…"
                className={`${FIELD_CLASS()} resize-none`} />
            </div>
          </div>
        )}
      </form>
    </CrmModal>
    <CrmConfirmDialog
      open={confirmDeleteOpen}
      onClose={() => setConfirmDeleteOpen(false)}
      onConfirm={() => {
        deleteMutation.mutate(activity.id, { onSuccess: () => { setConfirmDeleteOpen(false); onClose(); } });
      }}
      title="Excluir atividade"
      message={`Tem certeza que deseja excluir "${activity?.title || 'esta atividade'}"? Esta ação não pode ser desfeita.`}
      confirmLabel="Excluir"
      variant="danger"
      loading={deleteMutation.isPending}
    />
    </>
  );
}

export default ActivityFormModal;

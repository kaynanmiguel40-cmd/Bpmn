/**
 * LeadHistoryPanel - modal com o historico UNIFICADO de um lead.
 *
 * Responde "o que aconteceu e o que vem" num lugar so:
 *  - cabecalho: lead, empresa, valor, estagio atual e status
 *  - historico: atividades feitas + ligacoes + WhatsApp, AGRUPADAS POR ETAPA
 *
 * NAO tem "a fazer": esta tela responde "o que ja aconteceu". O que falta fazer
 * e a Fila, onde da pra executar de verdade — ter os dois aqui repetia a Fila
 * num lugar onde ela nao funciona.
 *
 * Os dados vem de useLeadTimeline (junta as 4 fontes no servico), mas o LAYOUT
 * do historico e o mesmo da pagina do Negocio: LeadHistoryTimeline. Antes cada
 * porta tinha a sua cara pra mesma pergunta — "o que ja aconteceu com esse
 * lead" — e isso confundia mais do que ajudava.
 */

import { useMemo } from 'react';
import {
  X, Phone, MessageCircle, CalendarCheck, Flag, Mail, Users, Coffee,
  MapPin, ExternalLink, Building2, CheckCircle2, Clock, ArrowRight, Trash2, Pencil,
} from 'lucide-react';
import { useLeadTimeline } from '../../hooks/useCrmQueries';
import { scheduleTiming } from '../../services/crmAgendaService';
import { CrmBadge } from '../ui';
import { CrmModal } from '../ui/CrmModal';
import { LeadHistoryTimeline } from '../LeadHistoryTimeline';

const hm = (iso) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
const TIMING_CLASS = {
  on_time: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20',
  late: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20',
  early: 'text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-900/20',
};

const KIND_ICON = {
  call: Phone,
  message: MessageCircle,
  stage: Flag,
  activity: CalendarCheck,
};
const ACTIVITY_ICON = {
  call: Phone, email: Mail, message: MessageCircle, meeting: Users, visit: MapPin, task: CalendarCheck, lunch: Coffee, follow_up: ArrowRight,
};

const DEAL_STATUS = {
  open: { label: 'Aberto', variant: 'info' },
  won: { label: 'Ganho', variant: 'success' },
  lost: { label: 'Perdido', variant: 'danger' },
};

const fmtMoney = (v) => (v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function relativeLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const dayMs = 86400000;
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startThat = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((startThat - startToday) / dayMs);
  const time = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  if (diffDays === 0) return `Hoje · ${time}`;
  if (diffDays === 1) return `Amanhã · ${time}`;
  if (diffDays === -1) return `Ontem · ${time}`;
  if (diffDays > 1) return `Em ${diffDays} dias · ${dateStr}`;
  if (diffDays < -1) return `Há ${Math.abs(diffDays)} dias · ${dateStr}`;
  return dateStr;
}

export default function LeadHistoryPanel({ selected, onClose, onOpenLead, onEditDelivery }) {
  const { data, isLoading } = useLeadTimeline(selected || {});
  const lead = data?.lead;
  const items = data?.items || [];

  // So o que JA ACONTECEU. Tarefa pendente fica de fora — inclusive a atrasada
  // — porque quem cobra o que falta e a Fila, a tela de execucao.
  const past = useMemo(
    () => items.filter(i => !(i.future || (i.kind === 'activity' && !i.done))),
    [items],
  );

  // Traduz a timeline do painel pro formato do componente compartilhado.
  // As mudancas de etapa saem da LISTA e viram os CABECALHOS dos grupos — o
  // cabecalho ja e a transicao, entao mante-las na lista diria duas vezes.
  const { historico, stageHistory } = useMemo(() => {
    const stages = past
      .filter(i => i.kind === 'stage')
      .map(i => ({
        id: i.id,
        createdAt: i.date,
        // O titulo do item traz "→ Nome"; o nome limpo esta em `detail`.
        stage: { name: (i.detail || '').replace(/^→\s*/, '') || 'Etapa', color: i.color },
      }));
    const registros = past
      .filter(i => i.kind !== 'stage')
      .map(i => ({
        _type: 'activity',
        _date: i.completedAt || i.date,
        id: i.id,
        title: i.title,
        // Ligacao e WhatsApp nao tem `activityType` — o proprio kind ja diz o
        // canal, e e assim que o icone certo aparece.
        type: i.activityType || i.kind,
        description: i.detail || '',
        deliveryInput: i.deliveryInput || '',
        deliveryReport: i.deliveryReport || '',
        // So ATIVIDADE do CRM pode ter a entrega corrigida — ligacao e WhatsApp
        // sao registro do que aconteceu, nao ha entrega a preencher.
        _canEdit: i.kind === 'activity',
        activityType: i.activityType,
      }));
    // A anotacao livre entra como o ULTIMO item: e o que foi escrito antes de
    // o sistema ter historico, entao vem antes de tudo que ele registrou. Fica
    // no grupo mais antigo porque nao tem data — o campo nunca teve.
    if (lead?.notes?.trim()) {
      registros.push({ _type: 'note', _date: null, text: lead.notes.trim() });
    }
    return { historico: registros, stageHistory: stages };
  }, [past, lead?.notes]);

  if (!selected) return null;

  const status = lead?.status ? DEAL_STATUS[lead.status] : null;

  return (
    <CrmModal
      open
      onClose={onClose}
      title={lead?.title || 'Histórico do lead'}
      size="lg"
    >
      {/* Cabecalho do lead: quem e, em que etapa esta, quanto vale. Fica no
          CORPO e nao no titulo do modal porque rola junto com o historico —
          num lead com muita conversa, cabecalho fixo comia a tela. */}
      <div className="pb-3 mb-3 border-b border-slate-200/70 dark:border-white/10">
        {lead?.company?.name && (
          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Building2 size={12} /> {lead.company.name}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap mt-2">
          {lead?.stage && (
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full inline-flex items-center gap-1"
              style={{ backgroundColor: `${lead.stage.color || '#6366f1'}22`, color: lead.stage.color || '#6366f1' }}>
              <Flag size={11} /> {lead.stage.name}
            </span>
          )}
          {status && <CrmBadge variant={status.variant} size="sm" dot>{status.label}</CrmBadge>}
          {lead?.value > 0 && <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{fmtMoney(lead.value)}</span>}
          {lead?.dealId && (
            <button onClick={() => onOpenLead?.(lead)}
              className="ml-auto text-xs text-fyness-primary hover:underline inline-flex items-center gap-1">
              Abrir negócio <ExternalLink size={11} />
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 border-2 border-fyness-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        /* SO o historico. O "A fazer" saiu: esta tela responde "o que ja
           aconteceu", e o que ainda ha pra fazer e a Fila — que e a tela de
           execucao. Ter as duas coisas aqui repetia a Fila num lugar onde nao
           da pra trabalhar direito. */
        <LeadHistoryTimeline
          items={historico}
          stageHistory={stageHistory}
          compact
          onEditItem={onEditDelivery}
          empty="Nenhum registro ainda — ligações, mensagens, atividades e mudanças de etapa vão aparecer aqui."
        />
      )}
    </CrmModal>
  );
}

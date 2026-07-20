/**
 * CrmPipelinePage - Kanban funcional do CRM.
 * Drag & drop nativo HTML5, deals reais, DealFormModal integrado.
 */

import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Kanban, Plus, Search, X, User, Trophy, Trash2, List, XCircle, MessageCircle, Repeat, Ban, Upload, Combine, ArrowLeftRight, ChevronUp, ChevronDown, Pencil, ListChecks, UserPlus, BadgeCheck, CalendarCheck, Crown, Filter, TrendingUp } from 'lucide-react';
import { CrmPageHeader, CrmEmptyState, CrmConfirmDialog, CrmBadge } from '../components/ui';
import { CrmModal } from '../components/ui/CrmModal';
import { useCrmPipelines, useCrmPipelineWithDeals, useMoveCrmDeal, useMarkDealLost, useLearnedProbabilities, useCreateCrmPipeline, useUpdateCrmPipeline, useDeleteCrmPipeline, useDeleteCrmDeal, useCreateCrmDeal, useUpdateCrmDeal, useEnsureGeneralPipeline, useConsolidateIntoGeneral, useStagePlaybook, useScheduleProcessForPipeline } from '../hooks/useCrmQueries';
import { getDealLeadInfo } from '../services/crmDealsService';
import { detectFunnelStagePositions } from '../services/crmDashboardService';
import { useTeamMembers } from '../../../hooks/queries';
import { useUrlState } from '../../../hooks/useUrlState';
import { supabase } from '../../../lib/supabase';
import { DealFormModal } from '../components/DealFormModal';
import { LostReasonModal } from '../components/LostReasonModal';
import { ImportLeadsModal } from '../components/ImportLeadsModal';
import { PriorityStars } from '../components/ui/PriorityStars';
import { StagePlaybookModal } from '../components/StagePlaybookModal';

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

// Calcula dias desde a ultima transicao de stage (ou criacao se nao houver historico).
// Retorna { days, label, color } — usado no card pra sinalizar deal "esfriando".
function getStageHealth(deal) {
  const ref = deal.lastStageChangedAt || deal.createdAt;
  if (!ref) return null;
  const diffMs = Date.now() - new Date(ref).getTime();
  const days = Math.max(0, Math.floor(diffMs / 86400000));
  // Status fechados (won/lost) nao precisam de saude — ja esta resolvido
  if (deal.status !== 'open') return { days, label: null, color: null };
  // Verde 0-2d, amarelo 3-6d, laranja 7-13d, vermelho 14d+
  if (days <= 2) return { days, label: days === 0 ? 'hoje' : `${days}d`, color: 'emerald' };
  if (days <= 6) return { days, label: `${days}d`, color: 'amber' };
  if (days <= 13) return { days, label: `${days}d`, color: 'orange' };
  return { days, label: `${days}d`, color: 'rose' };
}


// Limpa telefone deixando so digitos (com codigo de pais Brasil 55 prefixado)
function getWhatsappLink(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;
  // Adiciona 55 se nao tiver codigo de pais
  const withCountry = digits.startsWith('55') ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

// ==================== DEAL CARD ====================

function DealCard({ deal, allStages = [], onDragStart, onMarkLost, onDelete, onMoveStage, onSetPriority }) {
  const navigate = useNavigate();
  const isDragging = useRef(false);
  const [stagePickerOpen, setStagePickerOpen] = useState(false);
  const stagePickerRef = useRef(null);

  // Fecha o seletor de etapa ao clicar fora.
  useEffect(() => {
    if (!stagePickerOpen) return;
    const onClickOut = (e) => {
      if (stagePickerRef.current && !stagePickerRef.current.contains(e.target)) setStagePickerOpen(false);
    };
    document.addEventListener('mousedown', onClickOut);
    return () => document.removeEventListener('mousedown', onClickOut);
  }, [stagePickerOpen]);

  // Etapas pra onde este lead pode ir (exclui a atual).
  const otherStages = (allStages || []).filter(s => s.id !== deal.stageId);

  // Contato/empresa vinculado sempre vence; contactPhone digitado e so fallback (getDealLeadInfo).
  const { phone } = getDealLeadInfo(deal);
  const whatsappLink = getWhatsappLink(phone);

  const health = getStageHealth(deal);
  const healthClasses = {
    emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    amber:   'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
    orange:  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400',
    rose:    'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
  };


  return (
    <>
    <div
      draggable
      onDragStart={(e) => {
        isDragging.current = true;
        e.dataTransfer.setData('text/plain', deal.id);
        e.dataTransfer.effectAllowed = 'move';
        onDragStart(deal.id);
      }}
      onDragEnd={() => {
        setTimeout(() => { isDragging.current = false; }, 100);
      }}
      onClick={() => {
        if (!isDragging.current) navigate(`/crm/deals/${deal.id}`);
      }}
      className={`rounded-xl border px-3 py-2.5 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-glass hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 group relative ${
        deal.status === 'won'
          ? 'bg-emerald-50/70 dark:bg-emerald-900/20 border-emerald-300/60 dark:border-emerald-700/40'
          : deal.status === 'lost'
            ? 'bg-rose-50/70 dark:bg-rose-900/20 border-rose-300/60 dark:border-rose-700/40'
            : 'bg-white/90 dark:bg-slate-800/80 border-slate-200/70 dark:border-white/10'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug line-clamp-2">{deal.title}</h4>
          {deal.status === 'lost' && (
            <span className="shrink-0 px-1.5 py-0.5 text-[11px] font-semibold uppercase rounded bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
              Perdido
            </span>
          )}
          {deal.status === 'won' && (
            <span className="shrink-0 px-1.5 py-0.5 text-[11px] font-semibold uppercase rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Ganho
            </span>
          )}
        </div>
        {deal.value > 0 && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
            {formatCurrency(deal.value)}
          </span>
        )}
      </div>

      {(deal.contact || deal.company) && (
        <div className="flex items-center gap-1.5 mb-1">
          {deal.contact && (
            <>
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: deal.contact.avatarColor || '#94a3b8' }} />
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{deal.contact.name}</span>
            </>
          )}
          {deal.contact && deal.company && <span className="text-slate-300 dark:text-slate-600">·</span>}
          {deal.company && (
            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{deal.company.name}</span>
          )}
        </div>
      )}

      {/* Origem em NEUTRO: a cor do card fica reservada pra urgencia. Segmento
          saiu do card (vive no detalhe) — 9 blocos competindo em 288px nao
          davam pra escanear. */}
      {deal.source && (
        <div className="mb-1">
          <span className="inline-block px-1.5 py-0.5 text-[12px] font-medium rounded bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 truncate max-w-full">
            {deal.source}
          </span>
        </div>
      )}

      {deal.owner && (
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: deal.owner.color || '#6366f1' }} />
          <span className="text-[12px] text-slate-500 dark:text-slate-400 truncate">{deal.owner.name}</span>
        </div>
      )}

      {/* Prioridade em estrelas — clicavel direto no card (o vendedor prioriza
          sem abrir o lead). Estrela ja marcada zera a prioridade. */}
      <div className="mb-1 flex items-center justify-between gap-2">
        <PriorityStars
          value={deal.priority || 0}
          size={13}
          onChange={(n) => onSetPriority?.(deal.id, n)}
        />

        {/* Mover de etapa — SO no toque (md:hidden). O drag HTML5 nao dispara
            em celular/tablet, entao sem isto o kanban vira somente-leitura no
            telefone. No desktop nao aparece (arrastar resolve). */}
        {otherStages.length > 0 && (
          <div className="relative md:hidden" ref={stagePickerRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setStagePickerOpen(o => !o); }}
              title="Mover de etapa"
              className="p-1 rounded text-slate-500 hover:text-fyness-primary hover:bg-fyness-primary/10"
            >
              <ArrowLeftRight size={13} />
            </button>
            {stagePickerOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-full mb-1 w-44 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
              >
                {otherStages.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => { onMoveStage(deal.id, s.id); setStagePickerOpen(false); }}
                    className="w-full px-3 py-2 text-left text-[12px] hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                  >
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Linha final: urgencia (dias na etapa) + progresso do processo.
          A barra de probabilidade saiu: era o 3o indicador numerico do mesmo
          card e ninguem decide por ela — quem decide e prioridade e atraso. */}
      <div className="flex items-center gap-2">
        {health?.label && (
          <span
            className={`text-[12px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${healthClasses[health.color]}`}
            title={`Nesta etapa ha ${health.days} dia${health.days === 1 ? '' : 's'}`}
          >
            {health.label}
          </span>
        )}
      </div>

      {/* Selo do PROCESSO: quantas tarefas da etapa esse lead ja cumpriu.
          Substituiu o antigo selo de cadencia — a cadencia agora vive no
          playbook da etapa. Verde quando conclui tudo. */}
      {deal.process && (
        <div className="mt-1.5">
          <span className={`inline-flex items-center gap-1 text-[12px] font-semibold px-1.5 py-0.5 rounded ${
            deal.process.done >= deal.process.total
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : deal.process.done > 0
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400'
          }`}>
            <ListChecks size={10} />
            {deal.process.done}/{deal.process.total}
          </span>
        </div>
      )}

      {/* Acoes no hover */}
      <div className="absolute right-1.5 top-1.5 flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-1 rounded bg-white dark:bg-slate-800 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 shadow-sm border border-slate-200 dark:border-slate-700"
            title="Abrir WhatsApp"
          >
            <MessageCircle size={11} />
          </a>
        )}
        {deal.status === 'open' && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onMarkLost(deal.id); }}
              className="px-1.5 py-0.5 text-[12px] font-medium rounded bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 shadow-sm border border-rose-200 dark:border-rose-800"
              title="Marcar como perdido"
            >
              Perdido
            </button>
            {/* Separador: destrutivo (Excluir) nao pode ficar colado no "Perdido" */}
            <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700/70 mx-0.5 shrink-0" aria-hidden="true" />
          </>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(deal); }}
          className="p-1 rounded bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 shadow-sm border border-slate-200 dark:border-slate-700"
          title="Excluir"
        >
          <Trash2 size={11} />
        </button>
      </div>

    </div>
    </>
  );
}

// ==================== CONFETTI ====================

function ConfettiCelebration({ show, onDone }) {
  const particles = useMemo(() =>
    Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 2 + Math.random() * 2,
      color: ['#10b981', '#f59e0b', '#6366f1', '#ef4444', '#06b6d4', '#f97316', '#8b5cf6', '#ec4899'][i % 8],
      size: 6 + Math.random() * 8,
      isCircle: Math.random() > 0.5,
      swayAmount: -50 + Math.random() * 100,
    }))
  , [show]);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => onDone(), 3500);
    return () => clearTimeout(timer);
  }, [show, onDone]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(-10vh) translateX(0px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) translateX(var(--sway)) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {particles.map(p => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.isCircle ? '50%' : '2px',
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            '--sway': `${p.swayAmount}px`,
          }}
        />
      ))}
    </div>
  );
}

// ==================== QUICK ADD INLINE ====================

function QuickAddInline({ onCreate, onCancel, isPending }) {
  const [title, setTitle] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => {
    const t = title.trim();
    if (!t || isPending) return;
    onCreate(t);
  };

  return (
    <div className="rounded-lg border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-800 p-2 shadow-sm">
      <input
        ref={inputRef}
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); submit(); }
          if (e.key === 'Escape') {
            e.preventDefault();
            // So descarta direto se nao ha rascunho — com texto digitado,
            // confirma antes (Esc nao pode apagar o titulo silenciosamente).
            if (title.trim() && !window.confirm('Descartar o negocio que voce esta digitando?')) return;
            onCancel();
          }
        }}
        onBlur={() => { if (!title.trim()) onCancel(); }}
        placeholder="Titulo do negocio (Enter)"
        disabled={isPending}
        className="w-full text-sm bg-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none disabled:opacity-50"
      />
      <div className="flex items-center justify-between mt-1.5 pt-1.5 border-t border-slate-100 dark:border-slate-700">
        <span className="text-[12px] text-slate-400">Enter pra salvar · Esc cancela</span>
        <button
          type="button"
          onClick={submit}
          disabled={!title.trim() || isPending}
          className="text-[12px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 disabled:opacity-50"
        >
          {isPending ? 'Salvando...' : 'Adicionar'}
        </button>
      </div>
    </div>
  );
}

// ==================== STAGE COLUMN ====================

// ==================== FAIXA DE FASES (por cima das colunas) ====================

const COL_W = 288; // w-72
const COL_GAP = 12; // gap-3

/** Largura de um trecho de colunas. Toda coluna tem a MESMA largura, mesmo
 *  vazia: espremer a etapa sem lead fazia o kanban "pular" de tamanho a cada
 *  arrasto e escondia justamente a etapa que precisa ser preenchida. */
const spanWidth = (stages) =>
  stages.length * COL_W + Math.max(0, stages.length - 1) * COL_GAP;

// Cor de cada fase = a MESMA do passo correspondente no funil do Dashboard
// (FunnelPrevistoReal.STEP_META). A faixa e o funil sao a mesma etapa vista de
// dois lugares — cor diferente faria parecer coisas diferentes.
const PHASE_ACCENT = {
  'Leads':        '#3b82f6',
  'Qualificação': '#6366f1',
  'Reunião':      '#f59e0b',
  // Follow up nao e passo do funil (Proposta/Negociacao nao entram la), entao
  // nao ha cor do Dashboard pra respeitar — violeta so pra nao virar o mesmo
  // ambar da Reuniao, que fica logo do lado.
  'Follow up':    '#8b5cf6',
  'Fechamentos':  '#10b981',
  // Fases da pipeline de Nutrição (fluxo de reativacao, nao de venda).
  'Triagem':      '#f43f5e',
  'Reativação':   '#8b5cf6',
  'Reativou':     '#10b981',
  'Descarte':     '#64748b',
};

// Icone de cada fase = o MESMO do funil do Dashboard (FunnelPrevistoReal). Fica
// ao lado do nome de cada etapa amarrando a coluna a etapa do funil que ela é.
// Follow up nao tem passo no funil (e o loop pos-reuniao), entao usa Repeat.
const PHASE_ICON = {
  'Leads':        UserPlus,
  'Qualificação': BadgeCheck,
  'Reunião':      CalendarCheck,
  'Follow up':    Repeat,
  'Fechamentos':  Crown,
  'Triagem':      Filter,
  'Reativação':   Repeat,
  'Reativou':     TrendingUp,
  'Descarte':     Ban,
};

// Gradiente do badge da faixa = o MESMO do funil (STEP_META from/to). Follow up
// nao existe la, entao um violeta que combina com o PHASE_ACCENT dele.
const PHASE_GRADIENT = {
  'Leads':        ['#60a5fa', '#3b82f6'],
  'Qualificação': ['#818cf8', '#6366f1'],
  'Reunião':      ['#fbbf24', '#f59e0b'],
  'Follow up':    ['#a78bfa', '#8b5cf6'],
  'Fechamentos':  ['#34d399', '#10b981'],
  'Triagem':      ['#fb7185', '#f43f5e'],
  'Reativação':   ['#a78bfa', '#8b5cf6'],
  'Reativou':     ['#34d399', '#10b981'],
  'Descarte':     ['#94a3b8', '#64748b'],
};

// Badge estilo funil: quadradinho com gradiente e o icone branco.
function PhaseBadge({ phase, size = 12, box = 'w-5 h-5' }) {
  const Icon = PHASE_ICON[phase];
  const grad = PHASE_GRADIENT[phase];
  if (!Icon || !grad) return null;
  return (
    <span
      className={`${box} rounded-md flex items-center justify-center shrink-0 text-white`}
      style={{ background: `linear-gradient(135deg, ${grad[0]}, ${grad[1]})` }}
    >
      <Icon size={size} />
    </span>
  );
}

/**
 * Agrupa as etapas em FASES DO PROCESSO e devolve as faixas ({ label, span })
 * pra desenhar por cima do kanban — cada faixa "abraça" as colunas da sua fase:
 *
 *   Leads | processo de qualificação | reunião (agendada → acontecida → follow-up)
 *
 * A faixa é um RÓTULO DE AGRUPAMENTO, não um contador: ela diz "estas colunas
 * são a qualificação", não "N leads qualificados". Por isso não conflita com o
 * funil do Dashboard, que conta a coorte (quem CHEGOU a qualificado) — são
 * afirmações diferentes sobre a mesma pipeline, ambas verdadeiras.
 *
 * Os cortes de reunião/ganho ainda vêm da detecção do funil
 * (detectFunnelStagePositions) pra não inventar um segundo entendimento de
 * "onde começa a reunião" que divergiria do Comparativo com o tempo.
 */
// A qual FASE cada etapa pertence — usado tanto pelas faixas quanto pelo icone
// no cabecalho da coluna, pra nunca divergirem. Devolve o mapa por id e a
// funcao (pra montar as faixas em ordem).
// Fluxo de reativacao (pipeline Nutrição) — reconhecido pelos nomes das etapas.
// A ordem importa: "Reativou" (sucesso) casa /reativ/ e tem que ser testado
// ANTES de "Reativação" (a cadencia D30/D60/D90).
function isNurturingStages(stages) {
  const blob = (stages || []).map(s => (s.name || '').toLowerCase()).join(' ');
  return /triagem/.test(blob) && (/nutri/.test(blob) || /reativ/.test(blob));
}
function nurturingPhaseOf(name) {
  const n = name || '';
  if (/triagem/i.test(n)) return 'Triagem';
  if (/reativou/i.test(n)) return 'Reativou';
  if (/descarte|exclu/i.test(n)) return 'Descarte';
  if (/nutri|reativ/i.test(n)) return 'Reativação';
  return 'Reativação';
}

function computeStagePhases(stages) {
  const ordered = [...(stages || [])].sort((a, b) => (a.position || 0) - (b.position || 0));

  // Pipeline de Nutrição tem fluxo proprio (Triagem -> Reativação -> Reativou/
  // Descarte), agrupado por NOME. Nao passa pela deteccao do funil de vendas,
  // que produziria fases sem sentido aqui.
  if (isNurturingStages(ordered)) {
    const byId = {};
    for (const s of ordered) byId[s.id] = nurturingPhaseOf(s.name);
    return { ordered, phaseById: byId };
  }

  const asDb = ordered.map(s => ({ position: s.position, name: s.name, is_win_stage: s.isWinStage }));
  const { meetingPosByPipeline } = detectFunnelStagePositions({ p: asDb });
  const meetPos = meetingPosByPipeline.p;
  const winPos = ordered.find(s => s.isWinStage)?.position ?? Infinity;
  const firstPos = ordered[0]?.position ?? 0;

  // De proposito NAO usa o qualPos do funil. qualPos e onde o lead CHEGA a
  // qualificado (a coorte que o Dashboard conta); aqui a faixa marca o PROCESSO
  // de qualificar, que comeca no 1o toque. Usar qualPos faria "Leads" abraçar
  // todas as colunas ate o "Qualificado", quando Leads e so a lista crua.
  // Follow up mora DENTRO de Reunião: tudo da reuniao ate o ganho (agendada,
  // acontecida e o follow-up pos-reuniao) e a mesma faixa.
  const phaseOf = (pos) => {
    if (pos >= winPos) return 'Fechamentos';
    if (pos <= firstPos) return 'Leads';
    if (pos < meetPos) return 'Qualificação';
    return 'Reunião';
  };

  const byId = {};
  for (const s of ordered) byId[s.id] = phaseOf(s.position ?? 0);
  return { ordered, phaseOf, phaseById: byId };
}

function buildPhaseBands(stages) {
  if (!stages?.length) return [];
  // phaseById (nao phaseOf-por-posicao): a Nutrição agrupa por NOME, entao o
  // mapa por id e a fonte unica que serve os dois fluxos.
  const { ordered, phaseById } = computeStagePhases(stages);
  const bands = [];
  for (const s of ordered) {
    const label = phaseById[s.id];
    const last = bands[bands.length - 1];
    if (last && last.label === label) { last.span++; last.stages.push(s); }
    else bands.push({ label, span: 1, stages: [s] });
  }
  return bands;
}

// Fases que aparecem hoje. As outras seguem calculadas e viram espacador
// invisivel (mantem o alinhamento com as colunas) — pra mostrar mais alguma,
// e so acrescentar a label aqui.
const VISIBLE_PHASES = new Set([
  'Leads', 'Qualificação', 'Reunião', 'Fechamentos',
  'Triagem', 'Reativação', 'Reativou', 'Descarte',
]);

function PhaseBands({ stages }) {
  const bands = useMemo(() => buildPhaseBands(stages), [stages]);
  if (bands.length === 0) return null;
  return (
    <div className="flex gap-3 shrink-0 mb-2.5">
      {bands.map((b, i) => {
        const show = VISIBLE_PHASES.has(b.label);
        // Largura REAL: coluna vazia e estreita, entao nao da pra multiplicar
        // por COL_W — a faixa desalinharia das colunas.
        const bandW = spanWidth(b.stages || []);
        const collapsed = bandW < 120; // so etapas vazias: nao cabe rotulo

        return (
          <div
            key={`${b.label}-${i}`}
            style={{ width: bandW }}
            aria-hidden={!show}
            className={`shrink-0 ${show ? '' : 'invisible'}`}
          >
            {/* Badge do funil na frente do rotulo da fase (mesmo do Dashboard).
                Faixa estreita (so etapas vazias) mostra so o badge. */}
            <div className="mb-1 flex items-center justify-center gap-1.5 overflow-hidden">
              <PhaseBadge phase={b.label} />
              {!collapsed && (
                <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 truncate">
                  {b.label}
                </span>
              )}
            </div>
            {/* Bracket: borda em cima + nas laterais (sem embaixo), fechando o
                range das colunas daquela fase. */}
            <div
              className="h-1.5 rounded-t-sm border-t-2 border-l-2 border-r-2"
              style={{ borderColor: PHASE_ACCENT[b.label] || '#94a3b8', opacity: 0.5 }}
            />
          </div>
        );
      })}
    </div>
  );
}

function StageColumn({ stage, learned, filteredDeals, onDrop, onDragStart, dragOverStageId, onNewDeal, onQuickAdd, quickAddPending, onMarkLost, onDelete, allStages, onMoveStage, onOpenPlaybook, stepCount = 0, phase, onSetPriority }) {
  const PhaseIcon = PHASE_ICON[phase] || null;
  const isDragOver = dragOverStageId === stage.id;
  const learnedStage = learned?.stages?.find(s => s.position === stage.position);
  const showConv = learnedStage && learnedStage.sampleSize >= 5;
  const convColor = learnedStage?.learnedProbability >= 50
    ? 'text-emerald-600 dark:text-emerald-400'
    : learnedStage?.learnedProbability >= 20
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-rose-600 dark:text-rose-400';

  const allCount = stage.deals?.length || 0;
  const isFiltered = filteredDeals.length !== allCount;

  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <div className="w-72 shrink-0 flex flex-col h-full crm-glass rounded-2xl overflow-hidden">
      {/* Valor total — so aparece quando ha valor. Antes um "R$ 0" gigante era
          o elemento de maior peso visual da tela mostrando nada. */}
      {stage.totalValue > 0 && (
        <div className="px-3 pt-3 pb-1.5 text-center">
          <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(stage.totalValue)}
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
          {/* Icone da etapa do funil a que essa coluna pertence (mesmo do
              Dashboard). Cor da fase pra bater com a faixa la em cima. */}
          {PhaseIcon && (
            <PhaseIcon size={14} className="shrink-0" style={{ color: PHASE_ACCENT[phase] }} />
          )}
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{stage.name}</span>
          {showConv && (
            <span className={`text-[12px] font-medium shrink-0 ${convColor}`} title={`Conversao: ${learnedStage.learnedProbability}%`}>
              {learnedStage.learnedProbability}%
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setQuickAddOpen(true)}
            title="Criar negocio rapido"
            className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-500 transition-colors"
          >
            <Plus size={13} />
          </button>
          <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            {isFiltered ? `${filteredDeals.length} de ${allCount}` : allCount}
          </span>
        </div>
      </div>

      {/* Botao "O que fazer": abre o processo da etapa (objetivo + passos com
          script). Explicito no lugar do livrinho — qualquer um entende. */}
      <button
        onClick={() => onOpenPlaybook?.(stage)}
        className="mx-3 mb-2 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-semibold uppercase tracking-wider bg-fyness-primary/10 text-fyness-primary hover:bg-fyness-primary/20 transition-colors"
      >
        <ListChecks size={13} /> O que fazer
      </button>

      {/* Drop zone com scroll vertical */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          onDrop.setDragOver(stage.id);
        }}
        onDragLeave={() => onDrop.setDragOver(null)}
        onDrop={(e) => {
          e.preventDefault();
          const dealId = e.dataTransfer.getData('text/plain');
          if (dealId) onDrop.execute(dealId, stage.id);
          onDrop.setDragOver(null);
        }}
        className={`flex-1 overflow-y-auto p-2 space-y-2 transition-colors ${
          isDragOver
            ? 'bg-fyness-primary/5 ring-2 ring-inset ring-fyness-primary/30'
            : ''
        }`}
      >
        {quickAddOpen && (
          <QuickAddInline
            isPending={quickAddPending}
            onCreate={async (title) => {
              await onQuickAdd(title, stage.id);
              setQuickAddOpen(false);
            }}
            onCancel={() => setQuickAddOpen(false)}
          />
        )}

        {filteredDeals.map(deal => (
          <DealCard
            key={deal.id}
            deal={deal}
            allStages={allStages}
            onDragStart={onDragStart}
            onMarkLost={onMarkLost}
            onDelete={onDelete}
            onMoveStage={onMoveStage}
            onSetPriority={onSetPriority}
          />
        ))}

        {allCount === 0 && !isDragOver && !quickAddOpen && (
          <button
            onClick={() => setQuickAddOpen(true)}
            className="w-full h-20 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors group/add"
          >
            <span className="text-xs text-slate-500 dark:text-slate-400 group-hover/add:text-blue-500 transition-colors flex items-center gap-1">
              <Plus size={12} /> Novo negocio
            </span>
          </button>
        )}

        {allCount > 0 && filteredDeals.length === 0 && (
          <div className="py-8 text-center text-xs text-slate-400">Nenhum resultado</div>
        )}
      </div>
    </div>
  );
}

// ==================== COLUNA PERDIDO ====================

// Card enxuto pra coluna "Perdido": mostra em QUAL etapa o lead se perdeu e o
// motivo. Sem drag (perdido nao volta arrastando) — so abre o deal ou exclui.
function LostDealCard({ deal, onDelete }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => navigate(`/crm/deals/${deal.id}`)}
      className="rounded-xl border px-3 py-2.5 cursor-pointer shadow-sm hover:shadow-glass hover:-translate-y-0.5 transition-[transform,box-shadow] duration-200 group relative bg-rose-50/60 dark:bg-rose-900/15 border-rose-200/60 dark:border-rose-800/40"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug line-clamp-2">{deal.title}</h4>
        {deal.value > 0 && (
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 line-through shrink-0 mt-0.5">
            {formatCurrency(deal.value)}
          </span>
        )}
      </div>

      {(deal.contact || deal.company) && (
        <div className="text-xs text-slate-500 dark:text-slate-400 truncate mb-1">
          {getDealLeadInfo(deal).name}
        </div>
      )}

      {/* Em qual etapa se perdeu */}
      {deal.lostStage && (
        <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 text-[12px] font-medium rounded bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400">
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: deal.lostStage.color }} />
          Perdido em {deal.lostStage.name}
        </div>
      )}

      {deal.lostReason && (
        <div className="mt-1 text-[12px] text-slate-500 dark:text-slate-400 italic line-clamp-2">“{deal.lostReason}”</div>
      )}

      {deal.source && (
        <div className="mt-1">
          <span className="inline-block px-1.5 py-0.5 text-[12px] font-medium rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
            {deal.source}
          </span>
        </div>
      )}

      <div className="absolute right-1.5 top-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(deal); }}
          title="Excluir"
          className="p-1 rounded bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 shadow-sm border border-slate-200 dark:border-slate-700"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  );
}

function LostColumn({ lostDeals, totalLost, onDelete }) {
  return (
    <div className="w-72 shrink-0 flex flex-col h-full crm-glass rounded-2xl overflow-hidden border border-rose-200/50 dark:border-rose-900/30">
      {/* Total perdido */}
      <div className="px-3 pt-3 pb-1.5 text-center">
        <div className="text-base font-bold text-rose-500 dark:text-rose-400">
          {totalLost} perdido{totalLost !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <XCircle size={14} className="text-rose-500 shrink-0" />
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">Perdido</span>
        </div>
        <span className="text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
          {lostDeals.length}{lostDeals.length !== totalLost ? ` de ${totalLost}` : ''}
        </span>
      </div>

      {/* Lista (sem drop — perdido nao recebe arraste) */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {lostDeals.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            {totalLost > 0 ? 'Nenhum resultado' : 'Nenhum negocio perdido'}
          </div>
        ) : (
          lostDeals.map(deal => (
            <LostDealCard key={deal.id} deal={deal} onDelete={onDelete} />
          ))
        )}
      </div>
    </div>
  );
}

// ==================== MODAL CRIAR PIPELINE ====================

const DEFAULT_STAGES = [
  { name: 'Prospecção',  color: '#94a3b8', isWinStage: false },
  { name: 'Qualificação',color: '#6366f1', isWinStage: false },
  { name: 'Proposta',    color: '#f59e0b', isWinStage: false },
  { name: 'Negociação',  color: '#f97316', isWinStage: false },
  { name: 'Fechamento',  color: '#10b981', isWinStage: true  },
];

function CreatePipelineModal({ open, onClose, onCreated, pipeline = null }) {
  const isEdit = !!pipeline?.id;
  const [name, setName]     = useState('');
  const [stages, setStages] = useState(() => DEFAULT_STAGES.map(s => ({ ...s })));
  const [isDefault, setIsDefault] = useState(false);
  const createMutation = useCreateCrmPipeline();
  const updateMutation = useUpdateCrmPipeline();
  const pending = createMutation.isPending || updateMutation.isPending;

  // Reset ao abrir. Editar pré-preenche do pipeline PRESERVANDO os ids dos
  // estágios (o service reconcilia por id: mesmo id = update, sem id = novo,
  // sumiu = remove com reatribuição dos negócios).
  useEffect(() => {
    if (!open) return;
    if (isEdit) {
      setName(pipeline.name || '');
      const ordered = [...(pipeline.stages || [])].sort((a, b) => (a.position || 0) - (b.position || 0));
      setStages(ordered.map(s => ({ id: s.id, name: s.name, color: s.color || '#6366f1', isWinStage: !!s.isWinStage })));
      setIsDefault(!!pipeline.isDefault);
    } else {
      setName('');
      setStages(DEFAULT_STAGES.map(s => ({ ...s })));
      setIsDefault(false);
    }
  }, [open, isEdit, pipeline]);

  const addStage = () =>
    setStages(s => [...s, { name: '', color: '#6366f1', isWinStage: false }]);

  const removeStage = (i) =>
    setStages(s => s.filter((_, idx) => idx !== i));

  const updateStage = (i, field, value) =>
    setStages(s => s.map((st, idx) => idx === i ? { ...st, [field]: value } : st));

  // Reordenar (a posição importa pro funil) — troca com o vizinho.
  const moveStage = (i, dir) =>
    setStages(s => {
      const j = i + dir;
      if (j < 0 || j >= s.length) return s;
      const next = s.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  // Apenas uma etapa pode ser "ganho"
  const setWin = (i) =>
    setStages(s => s.map((st, idx) => ({ ...st, isWinStage: idx === i })));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || stages.length === 0) return;
    const payloadStages = stages.map((s, i) => ({
      id:         s.id,                               // undefined = etapa nova (INSERT)
      name:       s.name.trim() || `Etapa ${i + 1}`,
      color:      s.color,
      position:   i + 1,
      isWinStage: s.isWinStage,
    }));
    if (isEdit) {
      await updateMutation.mutateAsync({ id: pipeline.id, data: { name: name.trim(), isDefault, stages: payloadStages } });
      onClose();
      onCreated?.(pipeline.id);
    } else {
      const created = await createMutation.mutateAsync({ name: name.trim(), isDefault, stages: payloadStages });
      onClose();
      if (created?.id) onCreated?.(created.id);
    }
  };

  const inputCls = 'px-2.5 py-1.5 text-sm bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40';

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Pipeline' : 'Nova Pipeline'}
      size="md"
      footer={
        <>
          <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            Cancelar
          </button>
          <button
            type="submit"
            form="create-pipeline-form"
            disabled={!name.trim() || stages.length === 0 || pending}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {isEdit ? <Pencil size={14} /> : <Plus size={14} />}
            {pending ? 'Salvando...' : (isEdit ? 'Salvar' : 'Criar Pipeline')}
          </button>
        </>
      }
    >
      <form id="create-pipeline-form" onSubmit={handleSubmit} className="space-y-5">

        {/* Nome */}
        <div>
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5">Nome da pipeline *</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ex.: Vendas, Parceiros, Renovações..."
            className={`w-full ${inputCls}`}
            required
          />
        </div>

        {/* Etapas */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Etapas do Kanban
            </label>
            <span className="text-[12px] text-slate-400">
              <Trophy size={10} className="inline mr-1 text-amber-500" />
              = etapa de ganho
            </span>
          </div>

          <div className="space-y-2">
            {stages.map((stage, i) => (
              <div key={i} className="flex items-center gap-2">
                {/* Reordenar — a posição das etapas alimenta o funil */}
                <div className="flex flex-col shrink-0 -my-1">
                  <button type="button" onClick={() => moveStage(i, -1)} disabled={i === 0}
                    title="Subir" className="p-0.5 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-300 disabled:opacity-20 transition-colors">
                    <ChevronUp size={13} />
                  </button>
                  <button type="button" onClick={() => moveStage(i, 1)} disabled={i === stages.length - 1}
                    title="Descer" className="p-0.5 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-300 disabled:opacity-20 transition-colors">
                    <ChevronDown size={13} />
                  </button>
                </div>

                {/* Cor */}
                <div className="relative shrink-0">
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-700 shadow cursor-pointer"
                    style={{ backgroundColor: stage.color }}
                  />
                  <input
                    type="color"
                    value={stage.color}
                    onChange={e => updateStage(i, 'color', e.target.value)}
                    className="absolute inset-0 opacity-0 w-6 h-6 cursor-pointer"
                    title="Escolher cor"
                  />
                </div>

                {/* Nome */}
                <input
                  type="text"
                  value={stage.name}
                  onChange={e => updateStage(i, 'name', e.target.value)}
                  placeholder={`Etapa ${i + 1}`}
                  className={`flex-1 ${inputCls}`}
                />

                {/* Marcar como ganho */}
                <button
                  type="button"
                  onClick={() => setWin(i)}
                  title="Marcar como etapa de ganho"
                  className={`shrink-0 p-1.5 rounded-lg transition-colors ${
                    stage.isWinStage
                      ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-500'
                      : 'text-slate-300 dark:text-slate-600 hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/10'
                  }`}
                >
                  <Trophy size={14} />
                </button>

                {/* Remover */}
                <button
                  type="button"
                  onClick={() => removeStage(i)}
                  disabled={stages.length <= 1}
                  className="shrink-0 p-1.5 rounded-lg text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors disabled:opacity-30"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={addStage}
            className="mt-3 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            <Plus size={12} /> Adicionar etapa
          </button>
        </div>

        {/* Pipeline padrao — novos negocios nascem nela */}
        <label className="flex items-start gap-2.5 cursor-pointer select-none rounded-lg border border-white/60 dark:border-white/10 bg-white/40 dark:bg-slate-800/40 p-3">
          <input
            type="checkbox"
            checked={isDefault}
            onChange={e => setIsDefault(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500/40"
          />
          <span className="text-xs text-slate-600 dark:text-slate-300">
            <span className="font-medium text-slate-700 dark:text-slate-200">Definir como pipeline padrão</span>
            <span className="block text-slate-500 dark:text-slate-400 mt-0.5">Novos negócios passam a nascer nesta pipeline. Marcar aqui desmarca a anterior.</span>
          </span>
        </label>

      </form>
    </CrmModal>
  );
}

// ==================== SOM DE CELEBRACAO ====================

function playWinSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.4);
    });
  } catch (_) { /* silencioso se audio nao disponivel */ }
}

// ==================== PIPELINE LIST VIEW ====================

const STATUS_BADGE = {
  open: { label: 'Aberto',  variant: 'info'    },
  won:  { label: 'Ganho',   variant: 'success' },
  lost: { label: 'Perdido', variant: 'danger'  },
};

function PipelineListView({ pipelineData, filterDeals, onMarkLost, onDelete }) {
  const navigate = useNavigate();

  // Achatar deals de todos os stages e enriquecer com nome/cor do stage.
  // Os perdidos saem da lista por stage (service), entao reentram aqui com a
  // etapa em que se perderam (lostStage), mantendo o status "Perdido".
  const rows = useMemo(() => {
    const stages = pipelineData?.stages || [];
    const all = stages.flatMap(stage =>
      (stage.deals || []).map(d => ({
        ...d,
        stage: { id: stage.id, name: stage.name, color: stage.color },
      }))
    );
    const lost = (pipelineData?.lostDeals || []).map(d => ({ ...d, stage: d.lostStage }));
    return filterDeals([...all, ...lost]);
  }, [pipelineData, filterDeals]);

  if (!pipelineData) return null;

  if (rows.length === 0) {
    return (
      <div className="crm-glass rounded-2xl py-16 text-center text-sm text-slate-400">
        Nenhum negocio com os filtros atuais.
      </div>
    );
  }

  return (
    <div className="crm-glass rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[12px] uppercase tracking-wider text-slate-400 border-b border-white/60 dark:border-white/10 bg-white/40 dark:bg-white/[0.03]">
              <th className="text-left px-4 py-2.5">Negocio</th>
              <th className="text-left px-4 py-2.5">Etapa</th>
              <th className="text-right px-4 py-2.5">Valor</th>
              <th className="text-left px-4 py-2.5">Prob.</th>
              <th className="text-left px-4 py-2.5">Status</th>
              <th className="text-left px-4 py-2.5">Vendedor</th>
              <th className="text-right px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {rows.map(deal => {
              const s = STATUS_BADGE[deal.status] || STATUS_BADGE.open;
              const prob = deal.probability ?? 50;
              const probColor = prob >= 70 ? 'bg-emerald-500' : prob >= 30 ? 'bg-amber-500' : 'bg-rose-500';
              return (
                <tr
                  key={deal.id}
                  className="group hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer"
                  onClick={() => navigate(`/crm/deals/${deal.id}`)}
                >
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-slate-800 dark:text-slate-200">{deal.title}</div>
                    <div className="text-xs text-slate-400">
                      {getDealLeadInfo(deal).name}
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: deal.stage?.color }} />
                      <span className="text-xs text-slate-600 dark:text-slate-300">{deal.stage?.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-medium text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(deal.value || 0)}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${probColor}`} style={{ width: `${prob}%` }} />
                      </div>
                      <span className="text-xs text-slate-500">{prob}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5">
                    <CrmBadge variant={s.variant} dot>{s.label}</CrmBadge>
                  </td>
                  <td className="px-4 py-2.5">
                    {deal.owner ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: deal.owner.color || '#6366f1' }} />
                        <span className="text-xs text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{deal.owner.name}</span>
                      </div>
                    ) : <span className="text-slate-300 dark:text-slate-600">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-0.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      {deal.status === 'open' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); onMarkLost(deal.id); }}
                          title="Marcar como perdido"
                          className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); onDelete(deal); }}
                        title="Excluir"
                        className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==================== EMPTY STATE ====================

function SeedOrCreateEmpty({ onCreateManual, onCreateGeneral, creatingGeneral }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Kanban size={28} className="text-slate-400" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-1">Nenhum pipeline criado</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md">
          Comece com a pipeline <strong>Geral</strong> (um funil unico, com a origem do lead marcada no negocio) — ou crie uma manual.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={onCreateGeneral}
          disabled={creatingGeneral}
          className="px-5 py-2.5 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60"
        >
          <Plus size={16} />
          {creatingGeneral ? 'Criando...' : 'Criar pipeline Geral'}
        </button>
        <button
          onClick={onCreateManual}
          className="px-5 py-2.5 text-sm font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
        >
          Criar pipeline manual
        </button>
      </div>
    </div>
  );
}

// ==================== PAGINA ====================

export function CrmPipelinePage() {
  const { data: pipelines, isLoading: loadingPipelines } = useCrmPipelines();
  // Persiste a pipeline selecionada entre sessoes (igual viewMode/filtros).
  // Le localStorage SINCRONO na inicializacao pra evitar flash da primeira
  // pipeline (ex: Outbound) antes de restaurar a salva. URL ainda e fonte
  // de verdade quando presente.
  const PIPELINE_SELECTED_KEY = 'crm-pipeline-selected';
  const [selectedPipelineId, setSelectedPipelineId] = useUrlState('pipeline', (() => {
    try { return localStorage.getItem(PIPELINE_SELECTED_KEY) || ''; } catch { return ''; }
  })());

  // Salva quando muda
  useEffect(() => {
    if (!selectedPipelineId) return;
    try { localStorage.setItem(PIPELINE_SELECTED_KEY, selectedPipelineId); } catch {}
  }, [selectedPipelineId]);

  // Se a pipeline salva nao existe mais (foi deletada), limpa e cai no fallback
  useEffect(() => {
    if (!selectedPipelineId || !pipelines || pipelines.length === 0) return;
    if (!pipelines.some(p => p.id === selectedPipelineId)) {
      setSelectedPipelineId('');
      try { localStorage.removeItem(PIPELINE_SELECTED_KEY); } catch {}
    }
  }, [pipelines, selectedPipelineId, setSelectedPipelineId]);

  const activePipelineId = selectedPipelineId || pipelines?.[0]?.id || null;

  const { data: pipelineData, isLoading: loadingDeals } = useCrmPipelineWithDeals(activePipelineId);
  const { data: learned } = useLearnedProbabilities(activePipelineId);
  // Playbook de todas as etapas de uma vez (uma query pra pipeline inteira, em
  // vez de uma por coluna).
  const { data: playbook } = useStagePlaybook(activePipelineId);
  const scheduleProcessMutation = useScheduleProcessForPipeline();
  const updateDealMutation = useUpdateCrmDeal();
  // Fase (etapa do funil) de cada coluna — pro icone no cabecalho. Mesmo calculo
  // das faixas, entao coluna e faixa nunca discordam.
  const phaseById = useMemo(
    () => computeStagePhases(pipelineData?.stages).phaseById,
    [pipelineData?.stages],
  );
  const moveMutation = useMoveCrmDeal();
  const lostMutation = useMarkDealLost();
  const deleteDealMutation = useDeleteCrmDeal();
  const deletePipelineMutation = useDeleteCrmPipeline();
  const ensureGeneralMutation = useEnsureGeneralPipeline();
  const consolidateMutation = useConsolidateIntoGeneral();
  const quickCreateMutation = useCreateCrmDeal();
  const { data: allMembers = [] } = useTeamMembers();
  const crmMembers = allMembers.filter(m => m.crmRole);

  // Descobrir o team_member do usuario logado
  const [myMemberId, setMyMemberId] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data?.session?.user?.id;
      if (uid && allMembers.length > 0) {
        const me = allMembers.find(m => m.authUserId === uid);
        if (me) setMyMemberId(me.id);
      }
    });
  }, [allMembers]);

  const [formOpen, setFormOpen] = useState(false);
  const [defaultStageId, setDefaultStageId] = useState(null);
  const [dragOverStageId, setDragOverStageId] = useState(null);
  const [createPipelineOpen, setCreatePipelineOpen] = useState(false);
  const [editPipelineOpen, setEditPipelineOpen] = useState(false);
  const [deletePipelineConfirm, setDeletePipelineConfirm] = useState(false);
  const [consolidateConfirm, setConsolidateConfirm] = useState(false);
  const [lostModalDealId, setLostModalDealId] = useState(null);
  const [importOpen, setImportOpen] = useState(false);
  const [deleteDealTarget, setDeleteDealTarget] = useState(null);
  const [playbookStage, setPlaybookStage] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const draggingDealId = useRef(null);

  // Referencia estavel: `playbook?.[id] || []` criaria um array novo a cada
  // render numa etapa sem passos, e o useEffect do modal (que depende de steps)
  // resetaria o rascunho a cada tecla — justo ao escrever o processo do zero.
  // Precisa vir DEPOIS do useState do playbookStage (const nao hoista valor).
  const playbookSteps = useMemo(
    () => (playbookStage ? (playbook?.[playbookStage.id] || []) : []),
    [playbookStage, playbook],
  );

  // View mode (kanban ou lista) — persiste em URL e tambem em localStorage
  // pra retornar pra view preferida do usuario quando entra sem param.
  const [viewMode, setViewMode] = useUrlState('view', (() => {
    try { return localStorage.getItem('crm-pipeline-view') || 'kanban'; } catch { return 'kanban'; }
  })());
  const switchView = (mode) => {
    setViewMode(mode);
    try { localStorage.setItem('crm-pipeline-view', mode); } catch {}
  };

  // Filtros
  const [searchQuery, setSearchQuery] = useUrlState('q', '');
  const [probFilter, setProbFilter]   = useUrlState('p', 'all');
  const [ownerFilter, setOwnerFilter] = useUrlState('o', 'all');
  const [sourceFilter, setSourceFilter] = useUrlState('src', 'all');

  // Persiste filtros entre navegacoes (URL e sempre fonte de verdade quando
  // presente; quando ausente, restaura do localStorage). Salva sempre que muda.
  const PIPELINE_FILTERS_KEY = 'crm-pipeline-filters';
  useEffect(() => {
    // Restaura ao montar SE a URL nao tem filtros ainda
    const hasUrlFilters = searchQuery || probFilter !== 'all' || ownerFilter !== 'all' || sourceFilter !== 'all';
    if (hasUrlFilters) return;
    try {
      const raw = localStorage.getItem(PIPELINE_FILTERS_KEY);
      if (!raw) return;
      const f = JSON.parse(raw);
      if (f.searchQuery) setSearchQuery(f.searchQuery);
      if (f.probFilter && f.probFilter !== 'all') setProbFilter(f.probFilter);
      if (f.ownerFilter && f.ownerFilter !== 'all') setOwnerFilter(f.ownerFilter);
      if (f.sourceFilter && f.sourceFilter !== 'all') setSourceFilter(f.sourceFilter);
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(PIPELINE_FILTERS_KEY, JSON.stringify({ searchQuery, probFilter, ownerFilter, sourceFilter }));
    } catch {}
  }, [searchQuery, probFilter, ownerFilter, sourceFilter]);

  const hasFilters = searchQuery || probFilter !== 'all' || ownerFilter !== 'all' || sourceFilter !== 'all';
  const clearFilters = () => { setSearchQuery(''); setProbFilter('all'); setOwnerFilter('all'); setSourceFilter('all'); };

  // Origens (canais) presentes no pipeline atual — alimenta o filtro por Origem.
  // Vem dos deals reais (inclui nomes de pipelines antigas apos a consolidacao).
  const sourceOptions = useMemo(() => {
    const set = new Set();
    (pipelineData?.stages || []).forEach(st => (st.deals || []).forEach(d => { if (d.source) set.add(d.source); }));
    (pipelineData?.lostDeals || []).forEach(d => { if (d.source) set.add(d.source); });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [pipelineData]);

  const filterDeals = useCallback((deals) => {
    if (!deals) return [];
    const q = searchQuery.toLowerCase();
    return deals.filter(d => {
      if (q) {
        // Busca em titulo + nome do contato + nome da empresa
        const haystack = [
          d.title || '',
          d.contact?.name || '',
          d.contactName || '',
          d.company?.name || '',
        ].join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (sourceFilter === '_none' && d.source) return false;
      if (sourceFilter !== 'all' && sourceFilter !== '_none' && d.source !== sourceFilter) return false;
      if (probFilter === 'high' && (d.probability ?? 50) < 70) return false;
      if (probFilter === 'mid' && ((d.probability ?? 50) < 30 || (d.probability ?? 50) >= 70)) return false;
      if (probFilter === 'low' && (d.probability ?? 50) >= 30) return false;
      if (ownerFilter === '_mine' && d.ownerId !== myMemberId) return false;
      if (ownerFilter === '_none' && d.ownerId) return false;
      if (ownerFilter !== 'all' && ownerFilter !== '_mine' && ownerFilter !== '_none' && d.ownerId !== ownerFilter) return false;
      return true;
    });
  }, [searchQuery, sourceFilter, probFilter, ownerFilter, myMemberId]);

  const handleNewDeal = (stageId = null) => {
    setDefaultStageId(stageId);
    setFormOpen(true);
  };

  // Cria (ou reaproveita) a pipeline unica "Geral" e ja a seleciona.
  const handleCreateGeneral = async () => {
    const res = await ensureGeneralMutation.mutateAsync();
    if (res?.id) setSelectedPipelineId(res.id);
  };

  // Criacao rapida: so titulo + pipeline + stage. Vendedor edita o resto depois
  // se quiser. probability=10 espelha o default usado em sendToPipeline.
  const handleQuickAdd = async (title, stageId) => {
    if (!activePipelineId || !stageId || !title.trim()) return;
    await quickCreateMutation.mutateAsync({
      title: title.trim(),
      value: 0,
      probability: 10,
      pipelineId: activePipelineId,
      stageId,
      status: 'open',
      ownerId: myMemberId || null,
    });
  };

  const handleDrop = (dealId, newStageId) => {
    if (draggingDealId.current === dealId) {
      moveMutation.mutate({ dealId, stageId: newStageId }, {
        onSuccess: (data) => {
          if (data?.status === 'won') {
            setShowConfetti(true);
            playWinSound();
          }
        },
      });
    }
    draggingDealId.current = null;
  };

  // Mesmo efeito do drop, mas via clique no botao "mover de etapa" do card —
  // fallback pra touch/mobile, onde o drag and drop HTML5 nao dispara.
  const handleMoveStage = (dealId, newStageId) => {
    moveMutation.mutate({ dealId, stageId: newStageId }, {
      onSuccess: (data) => {
        if (data?.status === 'won') {
          setShowConfetti(true);
          playWinSound();
        }
      },
    });
  };

  // Prioridade em estrelas direto do card.
  const handleSetPriority = (dealId, priority) => {
    updateDealMutation.mutate({ id: dealId, updates: { priority } });
  };

  const allPipelineStages = useMemo(
    () => (pipelineData?.stages || []).map(s => ({ id: s.id, name: s.name, color: s.color })),
    [pipelineData],
  );

  const isLoading = loadingPipelines || loadingDeals;

  return (
    <div>
      <CrmPageHeader
        title="Pipeline"
        subtitle="Kanban visual dos seus negocios"
        actions={
          <div className="flex items-center gap-2">
            {/* Seletor de Pipeline (com opção de criar nova) */}
            <select
              value={activePipelineId || ''}
              onChange={(e) => {
                const v = e.target.value;
                if (v === '__new__') {
                  setCreatePipelineOpen(true);
                  requestAnimationFrame(() => { e.target.value = activePipelineId || ''; });
                } else if (v === '__geral__') {
                  handleCreateGeneral();
                  requestAnimationFrame(() => { e.target.value = activePipelineId || ''; });
                } else {
                  setSelectedPipelineId(v || '');
                }
              }}
              className="text-sm bg-white/70 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-sm rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
            >
              {(pipelines || []).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              <option disabled>──────────</option>
              <option value="__geral__">+ Pipeline Geral (recomendada)</option>
              <option value="__new__">+ Nova Pipeline</option>
            </select>

            {/* Editar etapas desta pipeline (renomear/add/remover/reordenar) */}
            {activePipelineId && pipelineData && (
              <button
                onClick={() => setEditPipelineOpen(true)}
                title="Editar etapas desta pipeline"
                className="flex items-center gap-1.5 text-sm bg-white/70 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-sm rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors"
              >
                <Pencil size={14} /> Editar
              </button>
            )}

            {/* Agenda o processo dos leads que JA estavam parados nas etapas —
                o gatilho normal e a troca de etapa, entao quem ja estava la
                nunca passou por ele. Idempotente: so cria o que falta. */}
            {activePipelineId && pipelineData && (
              <button
                onClick={() => scheduleProcessMutation.mutate(activePipelineId)}
                disabled={scheduleProcessMutation.isPending}
                title="Gera as tarefas do processo (com data e hora) pros leads que ainda nao tem"
                className="flex items-center gap-1.5 text-sm bg-white/70 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-sm rounded-lg px-3 py-1.5 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-60"
              >
                <CalendarCheck size={14} />
                {scheduleProcessMutation.isPending ? 'Agendando…' : 'Agendar processos'}
              </button>
            )}

            {/* Consolidar leads das pipelines antigas na Geral */}
            {pipelines && pipelines.length > 1 && (
              <button
                onClick={() => setConsolidateConfirm(true)}
                title="Consolidar leads das pipelines de venda antigas na Geral (origem = nome da pipeline)"
                className="p-1.5 text-slate-400 hover:text-fyness-primary hover:bg-fyness-primary/10 rounded-lg transition-colors"
              >
                <Combine size={15} />
              </button>
            )}

            {/* Excluir pipeline selecionada */}
            {pipelines && pipelines.length > 1 && (
              <button
                onClick={() => setDeletePipelineConfirm(true)}
                title="Excluir pipeline"
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
              >
                <Trash2 size={15} />
              </button>
            )}

            <button
              onClick={() => setImportOpen(true)}
              disabled={!pipelineData}
              className="flex items-center gap-2 px-3 py-2 bg-white/70 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-sm text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              title="Importar lista (ligação fria / WhatsApp) pro pipeline"
            >
              <Upload size={16} /> Importar
            </button>

            <button
              onClick={() => handleNewDeal()}
              className="flex items-center gap-2 px-4 py-2 bg-fyness-primary hover:bg-fyness-secondary text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={16} /> Novo Negocio
            </button>
          </div>
        }
      />

      {/* Toggle de visualizacao + barra de filtros */}
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <div className="flex items-center gap-1 crm-glass rounded-xl p-1 w-fit">
          <button
            onClick={() => switchView('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Kanban size={13} />
            Kanban
          </button>
          <button
            onClick={() => switchView('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <List size={13} />
            Lista
          </button>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Busca */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar..."
              className="pl-8 pr-7 py-1.5 text-sm bg-white/70 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-sm rounded-lg w-36 focus:outline-none focus:ring-2 focus:ring-fyness-primary text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Filtro Origem (canal) — so aparece quando ha origens no pipeline */}
          {sourceOptions.length > 0 && (
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="text-xs bg-white/70 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-sm rounded-lg px-2 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary max-w-[180px]"
              title="Filtrar por origem do lead"
            >
              <option value="all">Origem: Todas</option>
              {sourceOptions.map(s => <option key={s} value={s}>{s}</option>)}
              <option value="_none">Sem origem</option>
            </select>
          )}

          {/* Filtro vendedor */}
          <select
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className="text-xs bg-white/70 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-sm rounded-lg px-2 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
          >
            <option value="all">Vendedor: Todos</option>
            {myMemberId && <option value="_mine">Meus Leads</option>}
            <option value="_none">Sem vendedor</option>
            {crmMembers.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>

          {/* Filtro probabilidade */}
          <select
            value={probFilter}
            onChange={(e) => setProbFilter(e.target.value)}
            className="text-xs bg-white/70 dark:bg-slate-900/50 backdrop-blur border border-white/60 dark:border-white/10 shadow-sm rounded-lg px-2 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
          >
            <option value="all">Prob: Todas</option>
            <option value="high">Alta (70%+)</option>
            <option value="mid">Media (30-69%)</option>
            <option value="low">Baixa (&lt;30%)</option>
          </select>

          {/* Limpar filtros */}
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 px-2 py-1.5"
              title="Limpar filtros"
            >
              <X size={14} /> Limpar
            </button>
          )}
        </div>
      </div>

      {viewMode === 'list' ? (
        <PipelineListView
          pipelineData={pipelineData}
          filterDeals={filterDeals}
          onMarkLost={(dealId) => setLostModalDealId(dealId)}
          onDelete={(deal) => setDeleteDealTarget(deal)}
        />
      ) : isLoading ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="w-72 shrink-0 crm-glass rounded-2xl h-96 animate-pulse" />
          ))}
        </div>
      ) : !pipelines || pipelines.length === 0 ? (
        <SeedOrCreateEmpty
          onCreateManual={() => setCreatePipelineOpen(true)}
          onCreateGeneral={handleCreateGeneral}
          creatingGeneral={ensureGeneralMutation.isPending}
        />
      ) : (
        // O scroll horizontal envolve a faixa E as colunas juntas — senao a
        // faixa fica parada enquanto o kanban rola e desalinha das etapas.
        <div className="overflow-x-auto pb-2 h-[calc(100vh-210px)]">
          <div className="flex flex-col h-full min-w-max">
            <PhaseBands stages={pipelineData?.stages || []} />
            <div className="flex gap-3 flex-1 min-h-0 crm-stagger">
              {(pipelineData?.stages || []).map(stage => (
                <StageColumn
                  key={stage.id}
                  stage={stage}
                  learned={learned}
                  filteredDeals={filterDeals(stage.deals)}
                  onOpenPlaybook={setPlaybookStage}
                  stepCount={(playbook?.[stage.id] || []).length}
                  phase={phaseById[stage.id]}
                  dragOverStageId={dragOverStageId}
                  onNewDeal={handleNewDeal}
                  onQuickAdd={handleQuickAdd}
                  quickAddPending={quickCreateMutation.isPending}
                  onMarkLost={(dealId) => setLostModalDealId(dealId)}
                  onDelete={(deal) => setDeleteDealTarget(deal)}
                  onDragStart={(id) => { draggingDealId.current = id; }}
                  allStages={allPipelineStages}
                  onMoveStage={handleMoveStage}
                  onSetPriority={handleSetPriority}
                  onDrop={{
                    execute: handleDrop,
                    setDragOver: setDragOverStageId,
                  }}
                />
              ))}
              {(pipelineData?.lostDeals?.length || 0) > 0 && (
                <LostColumn
                  lostDeals={filterDeals(pipelineData.lostDeals)}
                  totalLost={pipelineData.lostDeals.length}
                  onDelete={(deal) => setDeleteDealTarget(deal)}
                />
              )}
            </div>
          </div>
        </div>
      )}

      <DealFormModal
        open={formOpen}
        onClose={() => { setFormOpen(false); setDefaultStageId(null); }}
        deal={null}
        defaultPipelineId={activePipelineId}
        defaultStageId={defaultStageId}
      />

      <LostReasonModal
        open={!!lostModalDealId}
        onClose={() => setLostModalDealId(null)}
        isPending={lostMutation.isPending}
        onConfirm={(reason) => {
          lostMutation.mutate({ dealId: lostModalDealId, reason }, {
            onSuccess: () => setLostModalDealId(null),
          });
        }}
      />

      <ImportLeadsModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        pipeline={pipelineData}
      />

      <StagePlaybookModal
        open={!!playbookStage}
        onClose={() => setPlaybookStage(null)}
        stage={playbookStage}
        pipelineId={activePipelineId}
        steps={playbookSteps}
      />

      <ConfettiCelebration show={showConfetti} onDone={() => setShowConfetti(false)} />

      <CreatePipelineModal
        open={createPipelineOpen}
        onClose={() => setCreatePipelineOpen(false)}
        onCreated={(id) => setSelectedPipelineId(id)}
      />

      {/* Mesmo modal em modo EDIÇÃO da pipeline atual (etapas do funil) */}
      <CreatePipelineModal
        open={editPipelineOpen}
        pipeline={pipelineData}
        onClose={() => setEditPipelineOpen(false)}
        onCreated={() => setEditPipelineOpen(false)}
      />

      <CrmConfirmDialog
        open={consolidateConfirm}
        onCancel={() => setConsolidateConfirm(false)}
        onConfirm={() => {
          consolidateMutation.mutate(undefined, {
            onSuccess: (res) => {
              setConsolidateConfirm(false);
              if (res?.geralId) setSelectedPipelineId(res.geralId);
            },
          });
        }}
        title="Consolidar leads na pipeline Geral"
        message='Move os negocios das pipelines de venda antigas (Outbound, IA, Vendedor, Leads de Parceiros...) pra pipeline "Geral", mapeando cada etapa na equivalente e marcando a ORIGEM com o nome da pipeline de onde vieram (so quando o negocio ainda nao tem origem). As pipelines de venda antigas que ficarem vazias sao REMOVIDAS. Aquisicao de Parceiros e Nutricao NAO sao tocadas.'
        confirmLabel="Consolidar"
        variant="info"
        loading={consolidateMutation.isPending}
      />

      <CrmConfirmDialog
        open={deletePipelineConfirm}
        onCancel={() => setDeletePipelineConfirm(false)}
        onConfirm={() => {
          deletePipelineMutation.mutate(activePipelineId, {
            onSuccess: () => {
              setDeletePipelineConfirm(false);
              setSelectedPipelineId('');
            },
          });
        }}
        title="Excluir Pipeline"
        message={`Tem certeza que deseja excluir a pipeline "${pipelineData?.name || ''}"? Todos os negócios e etapas serão removidos permanentemente.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={deletePipelineMutation.isPending}
      />

      <CrmConfirmDialog
        open={!!deleteDealTarget}
        onCancel={() => setDeleteDealTarget(null)}
        onConfirm={() => {
          deleteDealMutation.mutate(deleteDealTarget.id, {
            onSuccess: () => setDeleteDealTarget(null),
          });
        }}
        title="Excluir negocio"
        message={`Tem certeza que deseja excluir "${deleteDealTarget?.title || ''}"? Esta acao nao pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="danger"
        loading={deleteDealMutation.isPending}
      />

    </div>
  );
}

export default CrmPipelinePage;

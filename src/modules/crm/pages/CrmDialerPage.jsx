/**
 * CrmDialerPage - Discador V1.
 *
 * Fluxo:
 *  1) Fila de contatos com telefone (configuravel por status/tag/busca).
 *  2) Cartao do contato atual + botao "Ligar" abre o discador do celular (tel:).
 *  3) Cronometro local conta enquanto o vendedor esta na ligacao.
 *  4) Modal pos-chamada coleta resultado/notas/retorno e chama createCrmCall.
 *  5) Avanca pra proximo da fila.
 *
 * V2 vai trocar a acao "Ligar" por click-to-call via provedor VoIP
 * (preenche provider/provider_call_id/recording_url no mesmo fluxo).
 * V3 vai adicionar painel lateral com transcript/objections/score por chamada.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Phone, PhoneOff, PhoneCall, SkipForward, Building2, User, Tag,
  Clock, History, ChevronRight, Search, Filter, X, CheckCircle2,
  Copy, Check, Info, Smartphone, Keyboard,
  Target, Users2, CalendarClock,
  Users, AlertCircle, Crosshair, MapPin,
} from 'lucide-react';

// Icones por fonte da fila
const SOURCE_ICONS = {
  contacts:        Users,
  stuck_deals:     AlertCircle,
  scheduled_calls: CalendarClock,
  prospects:       Crosshair,
};

// Variante de badge do "contexto da fonte" exibido no cartao/fila
const SOURCE_BADGE_VARIANT = {
  contacts:        'neutral',
  stuck_deals:     'warning',
  scheduled_calls: 'info',
  prospects:       'violet',
};
import { CrmPageHeader, CrmBadge, CrmEmptyState, CrmAvatar, CrmKpiCard } from '../components/ui';
import {
  useDialerQueue,
  useCreateCrmCall,
  useRecentCallsForContact,
  useDialerKPIs,
} from '../hooks/useCrmQueries';
import { PostCallModal } from '../components/PostCallModal';
import { DailyGoalProgress } from '../components/DailyGoalProgress';
import { CALL_OUTCOMES, DIALER_SOURCES } from '../services/crmCallsService';
import { toast } from '../../../contexts/ToastContext';

// ============================================================
// Detecção de plataforma (resolve cenário Win+iPhone onde tel: capenga)
// ============================================================

function detectEnvironment() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return { isMobile: false, os: 'other' };
  }
  const ua = navigator.userAgent || '';
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  let os = 'other';
  if (/Win/i.test(ua)) os = 'windows';
  else if (/Mac/i.test(ua)) os = 'mac';
  else if (/Linux/i.test(ua)) os = 'linux';
  return { isMobile, os };
}

const DESKTOP_HINT_DISMISS_KEY = 'crm-dialer-desktop-hint-dismissed';

const STATUS_OPTIONS = [
  { value: '',        label: 'Todos' },
  { value: 'lead',    label: 'Leads' },
  { value: 'active',  label: 'Ativos' },
  { value: 'customer',label: 'Clientes' },
];

function formatSeconds(total) {
  const s = Math.max(0, Math.floor(total || 0));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function formatRelative(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min atras`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h atras`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d atras`;
  return d.toLocaleDateString('pt-BR');
}

/** Sanitiza telefone pra link tel: (mantem digitos e +). */
function toTelHref(phone) {
  if (!phone) return null;
  const cleaned = String(phone).replace(/[^\d+]/g, '');
  return cleaned ? `tel:${cleaned}` : null;
}

export function CrmDialerPage() {
  // ---- ambiente (mobile vs desktop, OS pra customizar dica) ----
  const env = useMemo(detectEnvironment, []);

  // ---- dica de desktop (dismissivel via localStorage) ----
  const [showDesktopHint, setShowDesktopHint] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem(DESKTOP_HINT_DISMISS_KEY) !== 'true'; } catch { return true; }
  });
  const dismissDesktopHint = () => {
    setShowDesktopHint(false);
    try { localStorage.setItem(DESKTOP_HINT_DISMISS_KEY, 'true'); } catch {}
  };

  // ---- fonte da fila + filtros ----
  const [source, setSource] = useState('contacts');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [excludeRecent, setExcludeRecent] = useState(true); // exclui contatos chamados nas ultimas 24h

  const excludeCalledSince = useMemo(() => {
    if (!excludeRecent) return null;
    const d = new Date();
    d.setHours(d.getHours() - 24);
    return d.toISOString();
  }, [excludeRecent]);

  const queueFilters = useMemo(() => ({
    source,
    // status so se aplica a Contatos
    status: source === 'contacts' && statusFilter ? statusFilter : undefined,
    search: search.trim() || undefined,
    excludeCalledSince: excludeCalledSince || undefined,
    limit: 50,
  }), [source, statusFilter, search, excludeCalledSince]);

  const { data: queue = [], isLoading } = useDialerQueue(queueFilters);
  const { data: kpis, isLoading: kpisLoading } = useDialerKPIs();

  // ---- ponteiro do contato atual ----
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => { setCurrentIndex(0); }, [queueFilters]);
  const currentContact = queue[currentIndex] || null;

  // ---- cronometro de chamada ----
  const [callStartedAt, setCallStartedAt] = useState(null); // ISO string
  const [elapsed, setElapsed] = useState(0);
  // O cronometro so corre durante a ligacao. Ao "Encerrar" ele congela (mas
  // callStartedAt continua setado p/ o timestamp startedAt), pra duracao
  // registrada nao incluir o tempo gasto preenchendo o modal pos-chamada.
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  const isInCall = !!callStartedAt;

  useEffect(() => {
    if (!callStartedAt || !timerRunning) return;
    const startMs = new Date(callStartedAt).getTime();
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startMs) / 1000));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [callStartedAt, timerRunning]);

  // ---- modal pos-chamada ----
  const [postCallOpen, setPostCallOpen] = useState(false);
  const createCallMutation = useCreateCrmCall();

  // ---- historico recente do contato atual ----
  const { data: recentCalls = [] } = useRecentCallsForContact(currentContact?.contactId, 5);

  // ===== Acoes =====

  const handleStartCall = () => {
    if (!currentContact?.phone) return;
    setElapsed(0);
    setCallStartedAt(new Date().toISOString());
    setTimerRunning(true);
    // Abre discador nativo (no desktop pode nao fazer nada — usuario disca manual).
    const href = toTelHref(currentContact.phone);
    if (href) {
      // window.location ao inves de criar <a> evita pop-up bloqueio em mobile.
      window.location.href = href;
    }
  };

  const handleEndCall = () => {
    setTimerRunning(false); // congela a duracao antes de abrir o pos-call
    setPostCallOpen(true);
  };

  const handleCancelCall = () => {
    setCallStartedAt(null);
    setTimerRunning(false);
    setElapsed(0);
  };

  const handleSkip = () => {
    if (isInCall) return;
    setCurrentIndex(i => Math.min(i + 1, queue.length - 1));
  };

  const handlePrev = () => {
    if (isInCall) return;
    setCurrentIndex(i => Math.max(i - 1, 0));
  };

  const handleSubmitPostCall = async (payload) => {
    if (!currentContact) return;
    try {
      await createCallMutation.mutateAsync({
        contactId: currentContact.contactId || null,
        dealId: currentContact.dealId || null,
        companyId: currentContact.companyId || null,
        prospectId: currentContact.prospectId || null,
        activityId: currentContact.activityId || null,
        phoneDialed: currentContact.phone,
        direction: 'outbound',
        channel: 'device',
        startedAt: payload.startedAt,
        endedAt: payload.endedAt,
        durationSeconds: payload.durationSeconds,
        outcome: payload.outcome,
        notes: payload.notes,
        followUpAt: payload.followUpAt,
      });
      setPostCallOpen(false);
      setCallStartedAt(null);
      setTimerRunning(false);
      setElapsed(0);
      // Avanca pro proximo. Com excludeRecent ligado, o refetch REMOVE o contato
      // chamado e a fila desliza — o mesmo indice ja aponta pro proximo, entao nao
      // somar 1 (somar pularia um contato). Sem o filtro, avancar manualmente.
      setCurrentIndex(i => (excludeRecent ? i : (i + 1 < queue.length ? i + 1 : i)));
    } catch {
      // toast ja foi emitido pelo service
    }
  };

  // ===== Atalhos de teclado =====
  // Espaco       -> ligar (se nao em chamada)
  // E            -> encerrar (se em chamada)
  // Esc          -> cancelar chamada / fechar modal (modal trata localmente)
  // J / ArrowDown -> proximo na fila
  // K / ArrowUp   -> anterior na fila
  // ?            -> abre/fecha cheatsheet
  //
  // Skip total se foco em input/textarea/select/contentEditable ou modal aberto
  // (o modal lida com Enter/Esc localmente).
  const [showCheatsheet, setShowCheatsheet] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      const t = e.target;
      const inField = t && (
        t.tagName === 'INPUT' ||
        t.tagName === 'TEXTAREA' ||
        t.tagName === 'SELECT' ||
        t.isContentEditable
      );
      if (inField) return;
      if (postCallOpen) return; // modal cuida dos seus proprios atalhos

      if (e.key === ' ' || e.code === 'Space') {
        if (!isInCall && currentContact) {
          e.preventDefault();
          handleStartCall();
        }
        return;
      }
      if (e.key === 'e' || e.key === 'E') {
        if (isInCall) {
          e.preventDefault();
          handleEndCall();
        }
        return;
      }
      if (e.key === 'Escape') {
        if (isInCall) {
          e.preventDefault();
          handleCancelCall();
        } else if (showCheatsheet) {
          setShowCheatsheet(false);
        }
        return;
      }
      if (e.key === 'j' || e.key === 'J' || e.key === 'ArrowDown') {
        if (!isInCall) {
          e.preventDefault();
          handleSkip();
        }
        return;
      }
      if (e.key === 'k' || e.key === 'K' || e.key === 'ArrowUp') {
        if (!isInCall) {
          e.preventDefault();
          handlePrev();
        }
        return;
      }
      if (e.key === '?') {
        e.preventDefault();
        setShowCheatsheet(v => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isInCall, currentContact, postCallOpen, showCheatsheet, queue.length]);

  // ===== Render =====

  const totalInQueue = queue.length;

  return (
    <div>
      <CrmPageHeader
        title="Discador"
        subtitle="Disque pela fila, registre resultado e siga pra proxima"
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar nome ou telefone..."
                className="pl-8 pr-7 py-1.5 text-sm bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-fyness-primary text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={13} />
                </button>
              )}
            </div>

            {source === 'contacts' && (
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-xs bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
              >
                {STATUS_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            )}

            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 px-2.5 py-1.5 bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg cursor-pointer select-none">
              <input
                type="checkbox"
                checked={excludeRecent}
                onChange={(e) => setExcludeRecent(e.target.checked)}
                className="accent-fyness-primary"
              />
              Pular chamados nas ultimas 24h
            </label>

            <button
              onClick={() => setShowCheatsheet(v => !v)}
              title="Atalhos de teclado (?)"
              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 px-2.5 py-1.5 bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Keyboard size={14} /> Atalhos
            </button>

            <Link
              to="/crm/discador/historico"
              className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 px-2.5 py-1.5 bg-white/70 dark:bg-slate-800/60 backdrop-blur border border-white/60 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <History size={14} /> Historico
            </Link>
          </div>
        }
      />

      {/* Metas diarias */}
      <DailyGoalProgress
        callsToday={kpis?.callsToday ?? 0}
        meetingsToday={kpis?.meetingsToday ?? 0}
      />

      {/* KPIs do vendedor */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 mt-1">
        <CrmKpiCard
          title="Ligacoes hoje"
          value={kpis?.callsToday ?? 0}
          subtitle={`${kpis?.callsLast7d ?? 0} nos ultimos 7 dias`}
          icon={PhoneCall}
          color="blue"
          loading={kpisLoading}
        />
        <CrmKpiCard
          title="Taxa de atendimento"
          value={`${kpis?.answerRate7d ?? 0}%`}
          subtitle="ultimos 7 dias"
          icon={Target}
          color="emerald"
          loading={kpisLoading}
        />
        <CrmKpiCard
          title="Reunioes agendadas"
          value={kpis?.meetingsLast7d ?? 0}
          subtitle="ultimos 7 dias"
          icon={Users2}
          color="violet"
          loading={kpisLoading}
        />
        <CrmKpiCard
          title="Retornos pendentes"
          value={kpis?.pendingFollowUps ?? 0}
          subtitle="agendados pra frente"
          icon={CalendarClock}
          color="amber"
          loading={kpisLoading}
        />
      </div>

      {/* Tabs de fonte da fila */}
      <SourceTabs current={source} onChange={setSource} />

      {/* Dica de desktop: como ligar usando o chip do celular pelo PC */}
      {!env.isMobile && showDesktopHint && (
        <DesktopHintBanner os={env.os} onDismiss={dismissDesktopHint} />
      )}

      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-sm text-slate-400">
          Montando fila...
        </div>
      ) : totalInQueue === 0 ? (
        <CrmEmptyState
          icon={Phone}
          title="Sem contatos para discar"
          description="Ajuste os filtros ou cadastre contatos com telefone na aba Contatos."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-1">
          {/* Coluna principal: contato + cronometro */}
          <div className="lg:col-span-2 space-y-4">
            {currentContact && (
              <ActiveContactCard
                contact={currentContact}
                position={currentIndex + 1}
                total={totalInQueue}
                isInCall={isInCall}
                elapsed={elapsed}
                env={env}
                onStart={handleStartCall}
                onEnd={handleEndCall}
                onCancel={handleCancelCall}
                onSkip={handleSkip}
              />
            )}

            <RecentCallsPanel calls={recentCalls} />
          </div>

          {/* Coluna lateral: fila */}
          <QueueList
            queue={queue}
            currentIndex={currentIndex}
            onSelect={(i) => { if (!isInCall) setCurrentIndex(i); }}
            disabled={isInCall}
          />
        </div>
      )}

      <KeyboardCheatsheet open={showCheatsheet} onClose={() => setShowCheatsheet(false)} />

      <PostCallModal
        open={postCallOpen}
        onClose={() => setPostCallOpen(false)}
        contact={currentContact}
        startedAt={callStartedAt}
        elapsedSeconds={elapsed}
        onSubmit={handleSubmitPostCall}
        isPending={createCallMutation.isPending}
      />
    </div>
  );
}

// ============================================================
// Subcomponents
// ============================================================

function ActiveContactCard({ contact, position, total, isInCall, elapsed, env, onStart, onEnd, onCancel, onSkip }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!contact?.phone) return;
    try {
      await navigator.clipboard.writeText(contact.phone);
      setCopied(true);
      toast('Numero copiado', 'success');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast('Nao foi possivel copiar', 'error');
    }
  };

  const showCopy = env && !env.isMobile;

  return (
    <div className="crm-glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          Contato {position} de {total}
        </span>
        <button
          onClick={onSkip}
          disabled={isInCall || position >= total}
          className="text-xs flex items-center gap-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed"
          title={isInCall ? 'Termine a ligacao primeiro' : 'Pular sem registrar'}
        >
          Pular <SkipForward size={13} />
        </button>
      </div>

      <div className="flex items-start gap-4 mb-6">
        <CrmAvatar name={contact.name} color={contact.avatarColor} size="lg" />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 truncate">{contact.name}</h2>
          {contact.sourceContext && (
            <div className="mt-0.5">
              <CrmBadge variant={SOURCE_BADGE_VARIANT[contact.sourceType] || 'neutral'} size="sm">
                {contact.sourceContext}
              </CrmBadge>
            </div>
          )}
          {contact.sourceType === 'prospects' && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400">
              <Info size={11} />
              Prospect ainda nao esta no CRM. Sera convertido em contato ao registrar a chamada.
            </div>
          )}
          <div className="mt-1 space-y-1 text-sm">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <Phone size={14} className="text-slate-400" />
              <span className="font-mono">{contact.phone}</span>
            </div>
            {contact.company?.name && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Building2 size={14} className="text-slate-400" />
                <span className="truncate">{contact.company.name}</span>
              </div>
            )}
            {contact.position && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <User size={14} className="text-slate-400" />
                <span className="truncate">{contact.position}</span>
              </div>
            )}
            {contact.tags?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mt-1">
                <Tag size={12} className="text-slate-400" />
                {contact.tags.map(t => (
                  <CrmBadge key={t} size="sm">{t}</CrmBadge>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cronometro + acoes */}
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock size={18} className={isInCall ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'} />
          <div>
            <div className={`font-mono text-2xl font-semibold ${isInCall ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
              {formatSeconds(elapsed)}
            </div>
            <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <span>{isInCall ? 'Em chamada' : 'Pronto pra ligar'}</span>
              <span className="hidden sm:inline-flex items-center gap-1">
                <Kbd>{isInCall ? 'E' : 'Espaco'}</Kbd>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isInCall ? (
            <>
              {showCopy && (
                <button
                  onClick={handleCopy}
                  title="Copiar numero (util pra Phone Link com iPhone, onde tel: pode nao abrir direto)"
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  {copied ? 'Copiado' : 'Copiar'}
                </button>
              )}
              <button
                onClick={onStart}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <PhoneCall size={16} /> Ligar
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onCancel}
                className="px-3 py-2 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                title="Cancelar sem registrar"
              >
                Cancelar
              </button>
              <button
                onClick={onEnd}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              >
                <PhoneOff size={16} /> Encerrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RecentCallsPanel({ calls }) {
  return (
    <div className="crm-glass rounded-2xl">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/50 flex items-center gap-2">
        <History size={14} className="text-slate-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Ultimas ligacoes pra este contato
        </span>
      </div>
      {calls.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-slate-400 dark:text-slate-500">
          Nenhuma ligacao anterior.
        </div>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {calls.map((c) => {
            const o = CALL_OUTCOMES[c.outcome];
            return (
              <li key={c.id} className="px-4 py-3 flex items-center justify-between text-sm">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    {o && <CrmBadge variant={o.variant} size="sm">{o.label}</CrmBadge>}
                    <span className="text-xs text-slate-400">{formatRelative(c.startedAt)}</span>
                    {c.durationSeconds != null && (
                      <span className="text-xs text-slate-400 font-mono">{formatSeconds(c.durationSeconds)}</span>
                    )}
                  </div>
                  {c.notes && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{c.notes}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function QueueList({ queue, currentIndex, onSelect, disabled }) {
  return (
    <div className="crm-glass rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Fila ({queue.length})
          </span>
        </div>
      </div>
      <ul className="max-h-[600px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {queue.map((c, i) => {
          const active = i === currentIndex;
          const done = i < currentIndex;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(i)}
                disabled={disabled}
                className={`w-full px-4 py-3 flex items-center gap-3 text-left transition-colors ${
                  active
                    ? 'bg-fyness-primary/5 dark:bg-fyness-primary/10'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                } ${disabled && !active ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                <CrmAvatar name={c.name} color={c.avatarColor} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-medium truncate ${
                      active ? 'text-fyness-primary dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'
                    }`}>
                      {c.name}
                    </span>
                    {done && <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {c.phone}{c.company?.name ? ` · ${c.company.name}` : ''}
                  </div>
                  {c.sourceContext && (
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      {c.sourceContext}
                    </div>
                  )}
                </div>
                {active && <ChevronRight size={14} className="text-fyness-primary shrink-0" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ============================================================
// SourceTabs — tabs de fonte da fila
// ============================================================

function SourceTabs({ current, onChange }) {
  return (
    <div className="flex items-center gap-1 mb-3 border-b border-slate-200 dark:border-slate-700/50">
      {Object.entries(DIALER_SOURCES).map(([key, src]) => {
        const Icon = SOURCE_ICONS[key] || Users;
        const active = current === key;
        return (
          <button
            key={key}
            onClick={() => onChange(key)}
            title={src.description}
            className={`flex items-center gap-2 px-3 py-2 text-sm border-b-2 -mb-px transition-colors ${
              active
                ? 'border-fyness-primary text-fyness-primary dark:text-blue-300 font-medium'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            <Icon size={14} />
            {src.label}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// KeyboardCheatsheet — overlay com atalhos disponiveis
// ============================================================

const SHORTCUTS = [
  { keys: ['Espaco'],          label: 'Ligar pro contato atual' },
  { keys: ['E'],               label: 'Encerrar chamada (abre o registro)' },
  { keys: ['Esc'],             label: 'Cancelar chamada em andamento' },
  { keys: ['J', '↓'],          label: 'Proximo na fila' },
  { keys: ['K', '↑'],          label: 'Anterior na fila' },
  { keys: ['Ctrl+Enter'],      label: 'Registrar no modal pos-chamada' },
  { keys: ['?'],               label: 'Mostrar/ocultar este painel' },
];

function Kbd({ children }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5 text-[11px] font-mono font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded shadow-[inset_0_-1px_0_rgba(0,0,0,0.08)]">
      {children}
    </kbd>
  );
}

function KeyboardCheatsheet({ open, onClose }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700/50"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-700/50">
          <div className="flex items-center gap-2">
            <Keyboard size={16} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Atalhos do discador</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </div>
        <ul className="px-5 py-3 space-y-2">
          {SHORTCUTS.map((s, i) => (
            <li key={i} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-slate-600 dark:text-slate-300">{s.label}</span>
              <span className="flex items-center gap-1 shrink-0">
                {s.keys.map((k, j) => (
                  <span key={j} className="flex items-center gap-1">
                    {j > 0 && <span className="text-slate-300 text-xs">/</span>}
                    <Kbd>{k}</Kbd>
                  </span>
                ))}
              </span>
            </li>
          ))}
        </ul>
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-700/50 text-[11px] text-slate-400">
          Atalhos sao ignorados enquanto voce digita em campos de texto.
        </div>
      </div>
    </div>
  );
}

// ============================================================
// DesktopHintBanner — orienta como ligar pelo PC usando o chip
// ============================================================

const HINT_BY_OS = {
  windows: {
    title: 'Ligando pelo PC com o seu chip',
    body: 'Pareie o celular com o app "Vincular ao telefone" do Windows (Phone Link). Com Android, o botao "Ligar" abre direto. Com iPhone, use o "Copiar" e cole no Phone Link.',
  },
  mac: {
    title: 'Ligando pelo Mac com o seu iPhone',
    body: 'Ative a Continuidade no iPhone (Ajustes > Telefone > Chamadas em Outros Dispositivos) com a mesma conta iCloud. O botao "Ligar" passa a discar pelo iPhone usando o FaceTime do Mac.',
  },
  linux: {
    title: 'Ligando pelo PC',
    body: 'Linux nao tem integracao nativa com celular. Use "Copiar" pra colar no celular ou em um app VoIP.',
  },
  other: {
    title: 'Ligando pelo PC',
    body: 'Pra ligar usando o chip do seu celular, pareie via Phone Link (Windows) ou Continuidade (Mac). Sem pareamento, use "Copiar" pra discar manualmente.',
  },
};

function DesktopHintBanner({ os, onDismiss }) {
  const hint = HINT_BY_OS[os] || HINT_BY_OS.other;
  return (
    <div className="mb-4 flex items-start gap-3 px-4 py-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg">
      <div className="w-8 h-8 rounded-lg bg-sky-100 dark:bg-sky-800/50 flex items-center justify-center shrink-0">
        <Smartphone size={16} className="text-sky-600 dark:text-sky-300" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Info size={12} className="text-sky-600 dark:text-sky-300 shrink-0" />
          <span className="text-sm font-medium text-sky-800 dark:text-sky-200">{hint.title}</span>
        </div>
        <p className="text-xs text-sky-700 dark:text-sky-300 leading-relaxed">{hint.body}</p>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 rounded text-sky-500 hover:text-sky-700 dark:hover:text-sky-200 hover:bg-sky-100 dark:hover:bg-sky-800/50 shrink-0"
        aria-label="Dispensar dica"
        title="Nao mostrar mais"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default CrmDialerPage;

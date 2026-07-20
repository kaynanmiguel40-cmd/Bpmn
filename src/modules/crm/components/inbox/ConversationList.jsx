import { useState, useMemo, useEffect } from 'react';
import { Search, MessageSquare, Image as ImageIcon, Video, Mic, FileText, Check, CheckCheck, Clock, AlertTriangle } from 'lucide-react';
import { useCrmInboxConversations, useCrmWhatsAppInstances } from '../../hooks/useCrmQueries';
import { useTeamMembers } from '../../../../hooks/queries';
import { numberIdentity, numberLabel, UNKNOWN_COLOR } from './numberIdentity';
import { useAuth } from '../../../../contexts/AuthContext';

// Limiar pra considerar uma conversa "sem resposta" — a ultima mensagem foi do
// lead/cliente (inbound) e ninguem respondeu depois desse tanto de tempo.
const OVERDUE_HOURS = 2;

function hoursSince(iso) {
  if (!iso) return null;
  return (Date.now() - new Date(iso).getTime()) / 3_600_000;
}

/** Dono da conversa: contato usa quem criou; prospect usa o responsavel atribuido. */
function resolveOwner(conv, membersById, membersByAuthId) {
  if (conv.ownerMemberId) return membersById.get(conv.ownerMemberId) || null;
  if (conv.ownerAuthUserId) return membersByAuthId.get(conv.ownerAuthUserId) || null;
  return null;
}

function formatRelativeTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  }
  const yest = new Date(); yest.setDate(now.getDate() - 1);
  if (d.toDateString() === yest.toDateString()) return 'Ontem';
  const days = Math.floor((now - d) / 86400000);
  if (days < 7) return d.toLocaleDateString('pt-BR', { weekday: 'short' });
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function initials(name) {
  if (!name) return '?';
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('');
}

function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// Sentinela pra aba "Todos" — distinto de qualquer telefone real e do `null`
// que representa "nenhuma escolha ainda, usa o default (1o numero)".
const ALL_INSTANCES = '__all__';

const MEDIA_HINT = {
  image:    { Icon: ImageIcon, label: 'Foto' },
  video:    { Icon: Video,     label: 'Vídeo' },
  audio:    { Icon: Mic,       label: 'Áudio' },
  sticker:  { Icon: ImageIcon, label: 'Figurinha' },
  document: { Icon: FileText,  label: 'Documento' },
};

function LastMessage({ conv }) {
  const raw = conv.lastMessage || '';
  const m = raw.match(/^\[(\w+)\]$/);
  const hint = m && MEDIA_HINT[m[1]];
  return (
    <span className="flex items-center gap-1 text-[13px] text-slate-500 dark:text-slate-400 truncate">
      {conv.lastDirection === 'outbound' && (
        conv.lastStatus === 'read'
          ? <CheckCheck size={14} className="text-[#53bdeb] shrink-0" />
          : <Check size={14} className="text-slate-400 shrink-0" />
      )}
      {hint ? (
        <><hint.Icon size={13} className="shrink-0" /><span className="truncate">{hint.label}</span></>
      ) : (
        <span className="truncate">{raw || '(sem texto)'}</span>
      )}
    </span>
  );
}

/**
 * Linha da conversa. Cinco elementos, os mesmos do WhatsApp Web: foto, nome,
 * hora, previa e nao-lidas.
 *
 * A identidade do numero nao entra nessa conta porque nao ocupa espaco
 * horizontal: e a faixa de 3px na borda esquerda. O NOME do numero so aparece
 * quando a cor sozinha e ambigua — lead que aparece duas vezes na lista, ou
 * numero que o app nao identificou.
 *
 * Regra que decide empate: nada entra no canto direito alem do contador de
 * nao-lidas. Antes ele empilhava pilula do numero, relogio de atraso, tag
 * "novo" e o contador, quatro coisas coloridas disputando o mesmo canto.
 */
function ConversationItem({ conv, active, onSelect, overdueH, numberColor, numberText }) {
  const unread = conv.unreadCount > 0;
  const overdue = overdueH != null;
  return (
    <button
      onClick={() => onSelect(conv)}
      className={`relative w-full flex items-center gap-3 pl-3 pr-2 py-2.5 text-left transition-colors
        ${active ? 'bg-[#f0f2f5] dark:bg-[#2a3942]' : 'hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]'}`}
    >
      {/* Numero da empresa. Atributo permanente de toda linha, entao fica no
          canal permanente; o atraso, que e excecao, migrou pro horario. */}
      <span className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ backgroundColor: numberColor }} />
      <div className="relative shrink-0">
        {conv.avatarUrl ? (
          <img src={conv.avatarUrl} alt={conv.otherName} referrerPolicy="no-referrer"
            onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
            className="w-12 h-12 rounded-full object-cover bg-slate-200 dark:bg-slate-700" />
        ) : null}
        <div className={`w-12 h-12 rounded-full items-center justify-center text-white text-base font-semibold ${conv.avatarUrl ? 'hidden' : 'flex'}`}
          style={{ backgroundColor: conv.avatarColor || '#6366f1' }}>
          {initials(conv.otherName)}
        </div>
      </div>

      <div className="flex-1 min-w-0 border-b border-black/5 dark:border-white/5 pb-2.5 -mb-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <div className="flex items-baseline gap-2 min-w-0 flex-1">
            <span className="text-[15px] font-medium text-slate-900 dark:text-slate-100 truncate">
              {conv.otherName || conv.otherPhone}
            </span>
            {numberText && (
              <span className="text-[11px] font-semibold shrink-0" style={{ color: numberColor }}>
                {numberText}
              </span>
            )}
          </div>
          {/* O horario carrega o atraso: rosa = sem resposta. Antes eram duas
              coisas separadas (relogio + "3h" escrito) dizendo o mesmo que a
              faixa vermelha lateral e o aviso do topo ja diziam — a mesma
              informacao contada tres vezes. O verde de "nao lida" tambem saiu:
              o contador verde 20px abaixo ja dizia isso. */}
          <span
            title={overdue ? `Sem resposta há ${Math.round(overdueH)}h` : undefined}
            className={`text-[12px] shrink-0 ${overdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-400'}`}
          >
            {formatRelativeTime(conv.lastAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <LastMessage conv={conv} />
          {unread && (
            <span className="text-[12px] font-bold text-white bg-[#25d366] rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shrink-0">
              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

/**
 * Lista de conversas (lado esquerdo do Inbox), estilo WhatsApp.
 * Filtro por número (Todos / Fyness / Lorena) quando há +1 instância.
 * Props: activeKey ("c:<id>"|"p:<id>"), onSelect(conversation)
 */
export function ConversationList({ activeKey, onSelect }) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const [filterPhone, setFilterPhone] = useState(null); // null = ainda nao escolheu (usa default); ALL_INSTANCES = aba "Todos"
  const [ownerFilter, setOwnerFilter] = useState('all'); // 'all' | 'mine'
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  // Sem termo: {} — mesma query key que outros consumidores (ex: CrmInboxPage)
  // usam sem opts, entao continua compartilhando cache/network com eles.
  // Com termo: busca server-side (ver crmMessagesService.getInboxConversations),
  // que nao depende da janela recente de mensagens e por isso acha conversas antigas.
  const inboxOpts = useMemo(() => (
    debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}
  ), [debouncedSearch]);
  const { data: conversations = [], isLoading, isError, error, refetch, isFetching } =
    useCrmInboxConversations(inboxOpts);
  const { data: instances = [] } = useCrmWhatsAppInstances();
  const { data: members = [] } = useTeamMembers();
  const { user } = useAuth();

  const membersById = useMemo(() => new Map(members.map((m) => [m.id, m])), [members]);
  const membersByAuthId = useMemo(() => new Map(members.filter((m) => m.authUserId).map((m) => [m.authUserId, m])), [members]);
  const myMemberId = useMemo(() => (user?.id ? membersByAuthId.get(user.id)?.id : null), [user, membersByAuthId]);

  // Dono + "sem resposta" calculados uma vez por conversa (nao por render de item).
  const enriched = useMemo(() => conversations.map((c) => {
    const owner = resolveOwner(c, membersById, membersByAuthId);
    const h = c.lastDirection === 'inbound' ? hoursSince(c.lastAt) : null;
    return { ...c, _owner: owner, _overdueH: h != null && h >= OVERDUE_HOURS ? h : null };
  }), [conversations, membersById, membersByAuthId]);

  // Cor + rotulo de cada numero, compartilhado com o cabecalho da thread.
  const numbers = useMemo(() => numberIdentity(instances), [instances]);
  const numberTabs = numbers.order;

  // unread por telefone (badge na aba) + total (badge da aba "Todos")
  const unreadByPhone = useMemo(() => {
    const m = {};
    for (const c of enriched) {
      if (c.unreadCount) m[c.instancePhone] = (m[c.instancePhone] || 0) + c.unreadCount;
    }
    return m;
  }, [enriched]);
  const totalUnread = useMemo(() => enriched.reduce((sum, c) => sum + (c.unreadCount || 0), 0), [enriched]);

  // Default = "Todos". Antes o default era o 1º numero da lista (Fyness), e o
  // inbox abria FILTRADO sem parecer filtrado: as conversas da Lorena nao
  // existiam na tela ate alguem descobrir a aba e clicar nela. Uma caixa de
  // entrada que esconde metade das mensagens por padrao e indistinguivel de uma
  // caixa que perdeu as mensagens — que e exatamente a queixa que investigamos.
  const showingAll = (filterPhone ?? ALL_INSTANCES) === ALL_INSTANCES;
  const selectedPhone = showingAll ? null : filterPhone;

  // Recorte por numero, antes dos demais filtros.
  const byNumber = useMemo(() => {
    if (showingAll || !selectedPhone) return enriched;
    // Mantem conversas de instancias ainda sem phone_number sincronizado visiveis
    // em qualquer aba — senao elas somem sem nenhuma UI pra limpar o filtro.
    return enriched.filter((c) => !c.instancePhone || c.instancePhone === selectedPhone);
  }, [enriched, showingAll, selectedPhone]);

  // Contado sobre o recorte por numero, nao sobre tudo. Antes a faixa somava os
  // dois numeros enquanto a lista mostrava so o selecionado: dizia "3 conversas
  // sem resposta" e o clique abria 1.
  const overdueCount = useMemo(() => byNumber.filter((c) => c._overdueH != null).length, [byNumber]);

  const filtered = useMemo(() => {
    let list = byNumber;
    if (ownerFilter === 'mine' && myMemberId) list = list.filter((c) => c._owner?.id === myMemberId);
    if (onlyOverdue) list = list.filter((c) => c._overdueH != null);
    // Sem filtro por termo aqui de proposito: quem busca e o server (inboxOpts),
    // que casa em campos que a conversa nao carrega (ex: company_name do prospect).
    // Refiltrar no client descartaria justamente esses matches.
    return list;
  }, [byNumber, ownerFilter, myMemberId, onlyOverdue]);

  // Nome do numero SO onde a cor nao basta: o mesmo lead aparecendo duas vezes
  // na lista visivel (uma thread por numero). Nas outras linhas a faixa colorida
  // ja resolve, e escrever o rotulo em todas seria a pilula cinza de volta.
  const duplicados = useMemo(() => {
    const n = new Map();
    for (const c of filtered) {
      const quem = c.contactId ? `c:${c.contactId}` : `p:${c.prospectId}`;
      n.set(quem, (n.get(quem) || 0) + 1);
    }
    return new Set([...n].filter(([, v]) => v > 1).map(([k]) => k));
  }, [filtered]);

  return (
    <aside className="w-full max-w-sm flex flex-col bg-white dark:bg-[#111b21] border-r border-black/10 dark:border-white/5">
      {/* O titulo saiu da tela mas nao do documento: ocupava uma faixa inteira
          pra dizer o que a tela ja diz, mas continua sendo o cabecalho que
          nomeia esta regiao pra leitor de tela. */}
      <h2 className="sr-only">Conversas</h2>
      <div className="px-3 py-2 bg-white dark:bg-[#111b21] shrink-0 space-y-2">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar conversa"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-[#f0f2f5] dark:bg-[#202c33] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#00a884]"
          />
        </div>

        {/* Numero e dono na MESMA linha: eram duas faixas de filtro empilhadas
            sobre a lista, e juntas comiam mais altura que tres conversas. */}
        {(numberTabs.length > 1 || myMemberId) && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {numberTabs.length > 1 && (
              <>
                <FilterPill
                  label="Todos"
                  badge={totalUnread}
                  active={showingAll}
                  onClick={() => setFilterPhone(ALL_INSTANCES)}
                />
                {numberTabs.map((t) => (
                  <FilterPill
                    key={t.phone}
                    label={t.label}
                    badge={unreadByPhone[t.phone] || 0}
                    active={!showingAll && selectedPhone === t.phone}
                    onClick={() => setFilterPhone(t.phone)}
                    color={t.color}
                  />
                ))}
              </>
            )}
            {/* "Minhas" e o que substitui o selo de responsavel que saiu de cada
                linha: perguntar de quem e a conversa vira um clique, em vez de
                trinta iniciais permanentes na tela. */}
            {myMemberId && (
              <FilterPill
                label="Minhas"
                active={ownerFilter === 'mine'}
                onClick={() => setOwnerFilter((v) => (v === 'mine' ? 'all' : 'mine'))}
              />
            )}
          </div>
        )}
      </div>

      {/* aviso de conversas sem resposta ha muito tempo */}
      {overdueCount > 0 && (
        <button
          onClick={() => setOnlyOverdue((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-medium text-left shrink-0 transition-colors border-b border-black/5 dark:border-white/5
            ${onlyOverdue ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300' : 'bg-rose-50 dark:bg-rose-900/15 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/25'}`}
        >
          <Clock size={13} className="shrink-0" />
          {overdueCount} conversa{overdueCount > 1 ? 's' : ''} sem resposta há mais de {OVERDUE_HOURS}h
        </button>
      )}

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-slate-400">Carregando…</div>
        ) : isError ? (
          // Distinto do estado vazio DE PROPOSITO. Enquanto o servico devolvia
          // [] no erro, falha de RLS / migration nao aplicada / timeout aparecia
          // como "Nenhuma conversa ainda" — e a caixa cheia parecia vazia.
          <div className="p-6 text-center">
            <AlertTriangle className="mx-auto mb-2 text-amber-500" size={32} />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
              Não foi possível carregar as conversas
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              As mensagens continuam salvas — é a leitura que falhou.
            </p>
            {error?.message && (
              <p className="mt-2 break-words text-xs text-slate-400 dark:text-slate-500">
                {error.message}
              </p>
            )}
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              {isFetching ? 'Tentando…' : 'Tentar novamente'}
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="mx-auto mb-2 text-slate-300 dark:text-slate-600" size={32} />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {search ? 'Nenhuma conversa encontrada' : showingAll ? 'Nenhuma conversa ainda' : 'Nenhuma conversa nesse número ainda'}
            </p>
          </div>
        ) : (
          filtered.map((conv) => {
            const ident = conv.instancePhone ? numbers.byPhone.get(conv.instancePhone) : null;
            const quem = conv.contactId ? `c:${conv.contactId}` : `p:${conv.prospectId}`;
            return (
              <ConversationItem
                key={conv.key}
                conv={conv}
                active={activeKey === conv.key}
                onSelect={onSelect}
                overdueH={conv._overdueH}
                numberColor={ident?.color || UNKNOWN_COLOR}
                // Instancia sem telefone sincronizado e rotulada SEMPRE: e a
                // linha mais incerta da tela, e ate agora era a que menos tinha
                // marca nenhuma.
                numberText={!ident ? numberLabel(conv.instanceName) : (duplicados.has(quem) ? ident.label : null)}
              />
            );
          })
        )}
      </div>
    </aside>
  );
}

function FilterPill({ label, active, onClick, badge = 0, color = null }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors
        ${active
          ? 'bg-[#00a884] text-white'
          : 'bg-[#f0f2f5] dark:bg-[#202c33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2a3942]'}`}
    >
      {/* Ponto na cor do numero: e o que ensina o codigo. Sem ele a faixa
          colorida na lista seria uma cor sem legenda. */}
      {color && !active && (
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
      )}
      {label}
      {badge > 0 && (
        <span className={`text-[12px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center ${active ? 'bg-white/25' : 'bg-[#25d366] text-white'}`}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

export default ConversationList;

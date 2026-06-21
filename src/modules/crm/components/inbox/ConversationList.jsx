import { useState, useMemo } from 'react';
import { Search, MessageSquare, Image as ImageIcon, Video, Mic, FileText, Check, CheckCheck } from 'lucide-react';
import { useCrmInboxConversations, useCrmWhatsAppInstances } from '../../hooks/useCrmQueries';

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

// "fyness-principal" -> "Fyness", "lorena-consultora" -> "Lorena"
function numberLabel(instanceName) {
  if (!instanceName) return 'Número';
  const base = instanceName.split('-')[0];
  return base.charAt(0).toUpperCase() + base.slice(1);
}

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

function ConversationItem({ conv, active, onSelect }) {
  const unread = conv.unreadCount > 0;
  return (
    <button
      onClick={() => onSelect(conv)}
      className={`w-full flex items-center gap-3 pl-3 pr-2 py-2.5 text-left transition-colors
        ${active ? 'bg-[#f0f2f5] dark:bg-[#2a3942]' : 'hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]'}`}
    >
      {conv.avatarUrl ? (
        <img src={conv.avatarUrl} alt={conv.otherName} referrerPolicy="no-referrer"
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
          className="w-12 h-12 rounded-full object-cover shrink-0 bg-slate-200 dark:bg-slate-700" />
      ) : null}
      <div className={`w-12 h-12 rounded-full items-center justify-center text-white text-base font-semibold shrink-0 ${conv.avatarUrl ? 'hidden' : 'flex'}`}
        style={{ backgroundColor: conv.avatarColor || '#6366f1' }}>
        {initials(conv.otherName)}
      </div>

      <div className="flex-1 min-w-0 border-b border-black/5 dark:border-white/5 pb-2.5 -mb-2.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[15px] font-medium text-slate-900 dark:text-slate-100 truncate">
            {conv.otherName || conv.otherPhone}
          </span>
          <span className={`text-[11px] shrink-0 ${unread ? 'text-[#25d366] font-semibold' : 'text-slate-400'}`}>
            {formatRelativeTime(conv.lastAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <LastMessage conv={conv} />
          <div className="flex items-center gap-1.5 shrink-0">
            {conv.prospectId && !conv.contactId && !unread && (
              <span className="text-[9px] uppercase font-bold text-orange-500 tracking-wide">novo</span>
            )}
            {unread && (
              <span className="text-[11px] font-bold text-white bg-[#25d366] rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
              </span>
            )}
          </div>
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
  const [filterPhone, setFilterPhone] = useState(null); // null = Todos
  const { data: conversations = [], isLoading } = useCrmInboxConversations();
  const { data: instances = [] } = useCrmWhatsAppInstances();

  // Abas por número (dedup por telefone)
  const numberTabs = useMemo(() => {
    const seen = new Set();
    const tabs = [];
    for (const i of instances) {
      const phone = i.phoneNumber;
      if (!phone || seen.has(phone)) continue;
      seen.add(phone);
      tabs.push({ phone, label: numberLabel(i.instanceName) });
    }
    return tabs;
  }, [instances]);

  // unread por telefone (badge na aba)
  const unreadByPhone = useMemo(() => {
    const m = {};
    for (const c of conversations) {
      if (c.unreadCount) m[c.instancePhone] = (m[c.instancePhone] || 0) + c.unreadCount;
    }
    return m;
  }, [conversations]);

  // Sem "Todos": sempre UM número selecionado (default = 1º da lista = Fyness).
  const selectedPhone = filterPhone ?? numberTabs[0]?.phone ?? null;

  const filtered = useMemo(() => {
    let list = conversations;
    // Mantem conversas de instancias ainda sem phone_number sincronizado visiveis
    // em qualquer aba — senao elas somem sem nenhuma UI pra limpar o filtro.
    if (selectedPhone) list = list.filter((c) => !c.instancePhone || c.instancePhone === selectedPhone);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) =>
        (c.otherName || '').toLowerCase().includes(q) ||
        (c.otherPhone || '').includes(q) ||
        (c.lastMessage || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [conversations, search, selectedPhone]);

  return (
    <aside className="w-full max-w-sm flex flex-col bg-white dark:bg-[#111b21] border-r border-black/10 dark:border-white/5">
      <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-3 shrink-0">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Conversas</h2>
      </div>
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

        {/* abas por número — um por vez (sem "Todos") */}
        {numberTabs.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            {numberTabs.map((t) => (
              <FilterPill
                key={t.phone}
                label={t.label}
                badge={unreadByPhone[t.phone] || 0}
                active={selectedPhone === t.phone}
                onClick={() => setFilterPhone(t.phone)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-slate-400">Carregando…</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="mx-auto mb-2 text-slate-300 dark:text-slate-600" size={32} />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {search ? 'Nenhuma conversa encontrada' : 'Nenhuma conversa nesse número ainda'}
            </p>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationItem
              key={conv.key}
              conv={conv}
              active={activeKey === conv.key}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </aside>
  );
}

function FilterPill({ label, active, onClick, badge = 0 }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors
        ${active
          ? 'bg-[#00a884] text-white'
          : 'bg-[#f0f2f5] dark:bg-[#202c33] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#2a3942]'}`}
    >
      {label}
      {badge > 0 && (
        <span className={`text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center ${active ? 'bg-white/25' : 'bg-[#25d366] text-white'}`}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

export default ConversationList;

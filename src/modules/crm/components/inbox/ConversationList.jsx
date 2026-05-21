import { useState, useMemo } from 'react';
import { Search, MessageSquare } from 'lucide-react';
import { useCrmInboxConversations } from '../../hooks/useCrmQueries';

function formatRelativeTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)   return 'agora';
  if (minutes < 60)  return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)    return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7)      return `${days}d`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function initials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');
}

function ConversationItem({ conv, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(conv)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 transition-colors text-left
        ${active
          ? 'bg-fyness-primary/10 dark:bg-fyness-primary/20'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'}`}
    >
      {conv.avatarUrl ? (
        <img
          src={conv.avatarUrl}
          alt={conv.otherName}
          referrerPolicy="no-referrer"
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
          className="w-10 h-10 rounded-full object-cover shrink-0 bg-slate-200 dark:bg-slate-800"
        />
      ) : null}
      <div
        className={`w-10 h-10 rounded-full items-center justify-center text-white text-sm font-semibold shrink-0 ${conv.avatarUrl ? 'hidden' : 'flex'}`}
        style={{ backgroundColor: conv.avatarColor || '#6366f1' }}
      >
        {initials(conv.otherName)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
            {conv.otherName || conv.otherPhone}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
            {formatRelativeTime(conv.lastAt)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-2 mt-0.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {conv.lastDirection === 'outbound' && '↗ '}
            {conv.lastMessage || '(sem texto)'}
          </span>
          {conv.unreadCount > 0 && (
            <span className="text-[10px] font-bold text-white bg-fyness-primary rounded-full min-w-[18px] h-[18px] px-1.5 flex items-center justify-center shrink-0">
              {conv.unreadCount > 99 ? '99+' : conv.unreadCount}
            </span>
          )}
        </div>
        {conv.prospectId && !conv.contactId && (
          <span className="text-[9px] uppercase font-semibold text-orange-500 mt-0.5">
            novo lead
          </span>
        )}
      </div>
    </button>
  );
}

/**
 * Lista de conversas (lado esquerdo do Inbox).
 *
 * Props:
 *   - activeKey: string ("c:<id>" ou "p:<id>")
 *   - onSelect: (conversation) => void
 */
export function ConversationList({ activeKey, onSelect }) {
  const [search, setSearch] = useState('');
  const { data: conversations = [], isLoading } = useCrmInboxConversations();

  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const q = search.toLowerCase();
    return conversations.filter((c) =>
      (c.otherName || '').toLowerCase().includes(q) ||
      (c.otherPhone || '').includes(q) ||
      (c.lastMessage || '').toLowerCase().includes(q)
    );
  }, [conversations, search]);

  return (
    <aside className="w-full max-w-sm flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      <div className="p-3 border-b border-slate-200 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Conversas</h2>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conversa..."
            className="w-full pl-8 pr-3 py-1.5 text-sm rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-slate-400">Carregando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center">
            <MessageSquare className="mx-auto mb-2 text-slate-300 dark:text-slate-600" size={32} />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {search ? 'Nenhuma conversa encontrada' : 'Sem conversas ainda'}
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

export default ConversationList;

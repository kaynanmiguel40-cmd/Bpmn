import { useState, useMemo, useCallback } from 'react';
import { useOSOrders, useTeamMembers, useChatSummaries, useOSProjects, useMemberAvatars } from '../../hooks/queries';
import { shortName } from '../../lib/teamService';
import { namesMatch } from '../../lib/kpiUtils';
import { markChatAsRead, getUnreadCount } from '../../lib/commentService';
import ChatConversation from './ChatConversation';
import ChatAvatar from './ChatAvatar';

// ==================== HELPERS ====================

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

const statusLabels = {
  pending: 'Pendente', in_progress: 'Em Andamento', review: 'Revisao',
  done: 'Concluida', available: 'Disponivel', cancelled: 'Cancelada',
};

// ==================== ZOOM-STYLE GROUP AVATAR ====================

function GroupAvatar({ participants, teamMembers, avatarMap, size = 'w-11 h-11' }) {
  const getMember = (name) => teamMembers.find(m => namesMatch(m.name, name));

  const getInfo = (p) => {
    const member = getMember(p.userName);
    const authUserId = p.userId || member?.authUserId;
    const avatarUrl = authUserId && avatarMap ? avatarMap[authUserId] : null;
    return { avatarUrl, color: member?.color || '#64748b', initial: (p.userName || '?')[0].toUpperCase() };
  };

  const renderSegment = (p) => {
    const { avatarUrl, color, initial } = getInfo(p);
    if (avatarUrl) {
      return <img src={avatarUrl} alt="" className="w-full h-full object-cover" />;
    }
    return (
      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: color }}>
        <span className="text-white font-bold" style={{ fontSize: '10px' }}>{initial}</span>
      </div>
    );
  };

  // 1 participant → regular avatar
  if (!participants || participants.length <= 1) {
    const p = participants?.[0] || { userName: '?', userId: null };
    const member = getMember(p.userName);
    return (
      <ChatAvatar
        userName={p.userName}
        userColor={member?.color || '#64748b'}
        authUserId={p.userId || member?.authUserId}
        avatarMap={avatarMap}
        size={size}
      />
    );
  }

  const count = Math.min(participants.length, 3);
  const gap = '1.5px';

  // 2 participants → left/right split
  if (count === 2) {
    return (
      <div className={`${size} rounded-full overflow-hidden flex-shrink-0 flex`} style={{ gap }}>
        <div className="h-full overflow-hidden" style={{ width: 'calc(50% - 0.75px)' }}>
          {renderSegment(participants[0])}
        </div>
        <div className="h-full overflow-hidden" style={{ width: 'calc(50% - 0.75px)' }}>
          {renderSegment(participants[1])}
        </div>
      </div>
    );
  }

  // 3 participants → top-left, top-right, bottom full
  return (
    <div className={`${size} rounded-full overflow-hidden flex-shrink-0 flex flex-col`} style={{ gap }}>
      <div className="flex" style={{ height: 'calc(50% - 0.75px)', gap }}>
        <div className="h-full overflow-hidden" style={{ width: 'calc(50% - 0.75px)' }}>
          {renderSegment(participants[0])}
        </div>
        <div className="h-full overflow-hidden" style={{ width: 'calc(50% - 0.75px)' }}>
          {renderSegment(participants[1])}
        </div>
      </div>
      <div className="w-full overflow-hidden" style={{ height: 'calc(50% - 0.75px)' }}>
        {renderSegment(participants[2])}
      </div>
    </div>
  );
}

// ==================== ACTIVE CHATS LIST ====================

function ActiveChatsList({ orders, summaries, teamMembers, avatarMap, search, userId, onSelect }) {
  const chats = useMemo(() => {
    const q = search.toLowerCase().trim();
    return orders
      .filter(o => summaries[o.id])
      .filter(o => !q || (o.title || '').toLowerCase().includes(q) || (o.code || '').toLowerCase().includes(q))
      .sort((a, b) => {
        const sa = summaries[a.id];
        const sb = summaries[b.id];
        return new Date(sb.lastMessage.createdAt) - new Date(sa.lastMessage.createdAt);
      });
  }, [orders, summaries, search]);

  if (chats.length === 0 && search) {
    return (
      <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
        Nenhuma conversa encontrada
      </div>
    );
  }

  const getMember = (name) => teamMembers.find(m => namesMatch(m.name, name));

  return (
    <div className="py-1">
      {chats.map((order) => {
        const summary = summaries[order.id];
        const lastMsg = summary.lastMessage;
        const participants = summary.participants || [{ userName: lastMsg.userName, userId: lastMsg.userId }];

        return (
          <button
            key={order.id}
            onClick={() => onSelect(order)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left border-b border-slate-100 dark:border-slate-800/50"
          >
            {/* Zoom-style split avatar */}
            <GroupAvatar
              participants={participants}
              teamMembers={teamMembers}
              avatarMap={avatarMap}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                  {order.title || 'Sem titulo'}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                  {formatRelativeTime(lastMsg.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  order.status === 'done'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {statusLabels[order.status] || order.status}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  OS #{order.code || order.id?.slice(0, 6)}
                </span>
              </div>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                <span className="text-slate-600 dark:text-slate-300">{shortName(lastMsg.userName)}:</span>{' '}
                {lastMsg.content?.slice(0, 40) || '📎 Arquivo'}
              </p>
            </div>

            {(() => {
              const unread = getUnreadCount(order.id, userId, summary.count);
              if (unread <= 0) return null;
              return (
                <span className="bg-blue-500 text-white text-[10px] font-bold min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center flex-shrink-0">
                  {unread > 99 ? '99+' : unread}
                </span>
              );
            })()}
          </button>
        );
      })}
    </div>
  );
}

// ==================== NEW CHAT PICKER (folder style) ====================

function NewChatPicker({ projects, orders, summaries, onSelect, onBack }) {
  const [selectedProject, setSelectedProject] = useState(null);

  const openOrders = useMemo(() => {
    return orders.filter(o => o.status !== 'done' && o.status !== 'cancelled');
  }, [orders]);

  const projectFolders = useMemo(() => {
    const byProject = {};
    for (const order of openOrders) {
      const pid = order.projectId || '__none__';
      if (!byProject[pid]) byProject[pid] = [];
      byProject[pid].push(order);
    }

    const result = [];
    for (const project of projects) {
      const list = byProject[project.id] || [];
      if (list.length > 0) result.push({ project, orders: list });
    }

    const orphans = byProject['__none__'] || [];
    if (orphans.length > 0) {
      result.push({
        project: { id: '__none__', name: 'Sem Projeto', color: '#94a3b8' },
        orders: orphans,
      });
    }

    return result;
  }, [projects, openOrders]);

  // === OS list inside a project ===
  if (selectedProject) {
    const folder = projectFolders.find(f => f.project.id === selectedProject.id);
    const osList = folder?.orders || [];

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <button onClick={() => setSelectedProject(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
            style={{ backgroundColor: selectedProject.color || '#3b82f6' }}
          >
            {(selectedProject.name || '?')[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{selectedProject.name}</h3>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{osList.length} OS</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {osList.map((order) => {
            const hasChat = !!summaries[order.id];
            return (
              <button
                key={order.id}
                onClick={() => onSelect(order)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left border-b border-slate-100 dark:border-slate-800/50"
              >
                <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4.5 h-4.5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-slate-700 dark:text-slate-200 truncate block">
                    {order.title || 'Sem titulo'}
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[10px] text-slate-400">
                      OS #{order.code || order.id?.slice(0, 6)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      • {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                </div>
                {hasChat ? (
                  <span className="text-[10px] text-blue-500 font-medium">
                    {summaries[order.id].count} msg
                  </span>
                ) : (
                  <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // === Project folders ===
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <button onClick={onBack} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Nova Conversa</h3>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Selecione um projeto</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-1">
        {projectFolders.length === 0 ? (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-sm">
            Nenhuma OS disponivel
          </div>
        ) : (
          projectFolders.map(({ project, orders: osList }) => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left border-b border-slate-100 dark:border-slate-800/50"
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: project.color || '#3b82f6' }}
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
              </div>

              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate block">
                  {project.name}
                </span>
                <span className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {osList.length} OS
                </span>
              </div>

              <svg className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ==================== EMPTY STATE ====================

function EmptyState({ onNewChat }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 py-12">
      <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-4">
        <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200 mb-1">
        Nenhuma conversa
      </h3>
      <p className="text-sm text-slate-400 dark:text-slate-500 text-center mb-4">
        Inicie uma conversa em uma ordem de servico.
      </p>
      <button
        onClick={onNewChat}
        className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nova conversa
      </button>
    </div>
  );
}

// ==================== MAIN PANEL ====================

export default function ChatSidePanel({ isOpen, onClose, userName, userId }) {
  const [view, setView] = useState('list'); // 'list' | 'newChat' | 'conversation'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState('');
  const { data: orders = [] } = useOSOrders();
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: summaries = {} } = useChatSummaries();
  const { data: projects = [] } = useOSProjects();
  const { data: avatarMap = {} } = useMemberAvatars(teamMembers);

  const handleSelectOS = useCallback((order) => {
    const summary = summaries[order.id];
    if (summary) markChatAsRead(order.id, userId, summary.count);
    setSelectedOrder(order);
    setView('conversation');
    setSearch('');
  }, [summaries, userId]);

  const handleBack = useCallback(() => {
    setSelectedOrder(null);
    setView('list');
    setSearch('');
  }, []);

  if (!isOpen) return null;

  const allOrders = orders.filter(o => o.status !== 'cancelled');
  const activeChats = allOrders.filter(o => summaries[o.id]);
  const totalUnread = Object.entries(summaries).reduce(
    (sum, [orderId, s]) => sum + getUnreadCount(orderId, userId, s.count), 0
  );

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-[55]" onClick={onClose} />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 h-full w-full sm:w-[380px] bg-white dark:bg-slate-900 shadow-2xl z-[56] flex flex-col animate-slide-in-right"
        style={{ animationDuration: '200ms' }}
      >
        {/* === CONVERSATION === */}
        {view === 'conversation' && selectedOrder ? (
          <ChatConversation
            order={selectedOrder}
            userName={userName}
            userId={userId}
            teamMembers={teamMembers}
            onBack={handleBack}
          />

        /* === NEW CHAT PICKER === */
        ) : view === 'newChat' ? (
          <NewChatPicker
            projects={projects}
            orders={allOrders}
            summaries={summaries}
            onSelect={handleSelectOS}
            onBack={() => { setView('list'); setSearch(''); }}
          />

        /* === ACTIVE CHATS LIST === */
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-500 to-blue-600">
              <div className="flex-1">
                <h2 className="text-lg font-bold text-white">Conversas</h2>
                <p className="text-[11px] text-blue-100 mt-0.5">
                  {activeChats.length} conversa{activeChats.length !== 1 ? 's' : ''}{totalUnread > 0 ? ` • ${totalUnread} nao lida${totalUnread > 1 ? 's' : ''}` : ''}
                </p>
              </div>
              <button
                onClick={() => { setView('newChat'); setSearch(''); }}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Nova conversa"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {activeChats.length > 0 ? (
              <>
                {/* Search */}
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="relative">
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Buscar conversa..."
                      className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Chat list */}
                <div className="flex-1 overflow-y-auto">
                  <ActiveChatsList
                    orders={allOrders}
                    summaries={summaries}
                    teamMembers={teamMembers}
                    avatarMap={avatarMap}
                    search={search}
                    userId={userId}
                    onSelect={handleSelectOS}
                  />
                </div>
              </>
            ) : (
              <EmptyState onNewChat={() => { setView('newChat'); setSearch(''); }} />
            )}
          </>
        )}
      </div>
    </>
  );
}

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useOSComments, useAddOSComment, useMemberAvatars, useConversationReads, useMarkConversationRead } from '../../hooks/queries';
import { useRealtimeComments } from '../../hooks/useRealtimeSubscription';
import { shortName } from '../../lib/teamService';
import { namesMatch } from '../../lib/kpiUtils';
import { notify } from '../../lib/notificationService';
import { extractMentions } from './chatUtils';
import ChatAvatar from './ChatAvatar';
import ChatBubble from './ChatBubble';
import ChatInput from './ChatInput';

// ==================== HELPERS ====================

function formatChatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function groupMessages(messages) {
  const groups = [];
  for (const msg of messages) {
    const prev = groups[groups.length - 1];
    const sameSender = prev && prev.userName === msg.userName;
    const within5min = prev && (new Date(msg.createdAt) - new Date(prev.lastTime)) < 300000;
    if (sameSender && within5min) {
      prev.items.push(msg);
      prev.lastTime = msg.createdAt;
    } else {
      groups.push({
        userName: msg.userName,
        userId: msg.userId,
        lastTime: msg.createdAt,
        items: [msg],
      });
    }
  }
  return groups;
}

// ==================== COMPONENTE ====================

export default function ChatConversation({ order, userName, userId, teamMembers, onBack }) {
  const [text, setText] = useState('');
  const listRef = useRef(null);
  const { data: messages = [], isLoading } = useOSComments(order.id);
  const addMutation = useAddOSComment();
  const { data: avatarMap = {} } = useMemberAvatars(teamMembers);
  const { data: conversationReads = [] } = useConversationReads(order.id);
  const markReadMutation = useMarkConversationRead();

  useRealtimeComments(order.id);

  // Mark conversation as read on open and when new messages arrive
  useEffect(() => {
    if (userId && messages.length > 0) {
      markReadMutation.mutate({ orderId: order.id, userId, userName });
    }
  }, [order.id, userId, userName, messages.length]);

  // Read receipts from other users (exclude self)
  const otherReads = conversationReads.filter(r => r.userId !== userId);

  // Unique participants in this conversation (everyone who sent a message, except me)
  const otherParticipants = useMemo(() => {
    const seen = new Set();
    const result = [];
    for (const msg of messages) {
      if (msg.userId === userId || namesMatch(msg.userName, userName)) continue;
      const key = msg.userId || msg.userName;
      if (seen.has(key)) continue;
      seen.add(key);
      result.push({ userId: msg.userId, userName: msg.userName });
    }
    return result;
  }, [messages, userId, userName]);

  // Auto-scroll
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const getMember = useCallback((name) => {
    return teamMembers?.find(m => namesMatch(m.name, name));
  }, [teamMembers]);

  const getColor = useCallback((name) => {
    if (namesMatch(name, userName)) return '#3b82f6';
    return getMember(name)?.color || '#64748b';
  }, [userName, getMember]);

  const getAuthUserId = useCallback((name, msgUserId) => {
    if (msgUserId) return msgUserId;
    if (namesMatch(name, userName)) return userId;
    return getMember(name)?.authUserId || null;
  }, [userName, userId, getMember]);

  const isMe = useCallback((name) => namesMatch(name, userName), [userName]);

  const handleSend = useCallback(async (content, attachments = []) => {
    if ((!content && attachments.length === 0) || addMutation.isPending) return;
    const mentions = extractMentions(content, teamMembers);

    addMutation.mutate({
      orderId: order.id,
      userName,
      userId,
      content,
      attachments,
      mentions,
    });
    setText('');

    const mentionedAuthIds = [];
    for (const mention of mentions) {
      const member = teamMembers.find(m => m.id === mention.memberId);
      if (member?.authUserId && member.authUserId !== userId) {
        mentionedAuthIds.push(member.authUserId);
        try {
          await notify({
            userId: member.authUserId,
            type: 'mention',
            title: `${shortName(userName)} mencionou voce`,
            message: `"${content.slice(0, 80)}${content.length > 80 ? '...' : ''}"`,
            entityType: 'os_order',
            entityId: order.id,
          });
        } catch { /* ok */ }
      }
    }

    // Notificar assignee se nao foi mencionado e nao e o autor
    if (order.assignee) {
      const assigneeMember = teamMembers.find(m => namesMatch(m.name, order.assignee));
      if (assigneeMember?.authUserId
          && assigneeMember.authUserId !== userId
          && !mentionedAuthIds.includes(assigneeMember.authUserId)) {
        try {
          await notify({
            userId: assigneeMember.authUserId,
            type: 'comment_added',
            title: `Novo comentario na OS #${order.number || ''}`,
            message: `${shortName(userName)}: "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`,
            entityType: 'os_order',
            entityId: order.id,
          });
        } catch { /* ok */ }
      }
    }
  }, [addMutation, order.id, order.number, order.assignee, userName, userId, teamMembers]);

  const grouped = groupMessages(messages);
  const isDone = order.status === 'done';

  // Status badge colors
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    done: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };
  const statusLabels = { pending: 'Pendente', in_progress: 'Em Andamento', review: 'Revisao', done: 'Concluida' };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <button
          onClick={onBack}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
            OS #{order.code || order.id?.slice(0, 6)} — {order.title}
          </h3>
          <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded-full mt-0.5 ${statusColors[order.status] || 'bg-slate-100 text-slate-600'}`}>
            {statusLabels[order.status] || order.status}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-1 p-3 bg-slate-50 dark:bg-slate-900/50">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500 text-xs">
            Nenhuma mensagem ainda. Seja o primeiro!
          </div>
        )}

        {grouped.map((group) => (
          <div key={group.items[0].id} className={`flex gap-2 ${isMe(group.userName) ? 'flex-row-reverse' : ''}`}>
            <ChatAvatar
              userName={group.userName}
              userColor={getColor(group.userName)}
              authUserId={getAuthUserId(group.userName, group.userId)}
              avatarMap={avatarMap}
            />
            <div className={`flex flex-col gap-0.5 max-w-[75%] ${isMe(group.userName) ? 'items-end' : 'items-start'}`}>
              <div className={`flex items-center gap-1.5 ${isMe(group.userName) ? 'flex-row-reverse' : ''}`}>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                  {shortName(group.userName)}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500">
                  {formatChatTime(group.items[0].createdAt)}
                </span>
              </div>
              {group.items.map((msg) => (
                <ChatBubble key={msg.id} message={msg} isMe={isMe(msg.userName)} readBy={otherReads} participants={otherParticipants} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Input or archived banner */}
      <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2">
        {isDone ? (
          <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-2">
            <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Chat arquivado — OS concluida
          </div>
        ) : (
          <ChatInput
            text={text}
            setText={setText}
            onSend={handleSend}
            isPending={addMutation.isPending}
            teamMembers={teamMembers}
            avatarMap={avatarMap}
          />
        )}
      </div>
    </div>
  );
}

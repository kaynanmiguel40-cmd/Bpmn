import { useState, useRef, useEffect, useCallback } from 'react';
import { useOSComments, useAddOSComment, useMemberAvatars } from '../../hooks/queries';
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

/** Agrupa mensagens consecutivas do mesmo usuario (janela de 5 min) */
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

export default function OSChatPanel({ orderId, orderAssignee, orderNumber, userName, userId, userColor, teamMembers, readOnly }) {
  const [text, setText] = useState('');
  const listRef = useRef(null);
  const { data: messages = [], isLoading } = useOSComments(orderId);
  const addMutation = useAddOSComment();
  const { data: avatarMap = {} } = useMemberAvatars(teamMembers);

  // Realtime: recebe mensagens novas instantaneamente
  useRealtimeComments(orderId);

  // Auto-scroll ao receber novas mensagens
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  // ==================== RESOLVE MEMBER INFO ====================

  const getMember = useCallback((name) => {
    return teamMembers?.find(m => namesMatch(m.name, name));
  }, [teamMembers]);

  const getColor = useCallback((name) => {
    if (namesMatch(name, userName)) return userColor || '#3b82f6';
    const member = getMember(name);
    return member?.color || '#64748b';
  }, [userName, userColor, getMember]);

  const getAuthUserId = useCallback((name, msgUserId) => {
    if (msgUserId) return msgUserId;
    if (namesMatch(name, userName)) return userId;
    const member = getMember(name);
    return member?.authUserId || null;
  }, [userName, userId, getMember]);

  const isMe = useCallback((name) => namesMatch(name, userName), [userName]);

  // ==================== SEND ====================

  const handleSend = useCallback(async (content, attachments = []) => {
    if ((!content && attachments.length === 0) || addMutation.isPending) return;

    // Extract mentions from text
    const mentions = extractMentions(content, teamMembers);

    addMutation.mutate({
      orderId,
      userName,
      userId,
      content,
      attachments,
      mentions,
    });

    setText('');

    // Send notifications for mentioned members
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
            entityId: orderId,
          });
        } catch { /* notification failure shouldn't block chat */ }
      }
    }

    // Notificar assignee se nao foi mencionado e nao e o autor
    if (orderAssignee) {
      const assigneeMember = teamMembers.find(m => namesMatch(m.name, orderAssignee));
      if (assigneeMember?.authUserId
          && assigneeMember.authUserId !== userId
          && !mentionedAuthIds.includes(assigneeMember.authUserId)) {
        try {
          await notify({
            userId: assigneeMember.authUserId,
            type: 'comment_added',
            title: `Novo comentario na OS #${orderNumber || ''}`,
            message: `${shortName(userName)}: "${content.slice(0, 60)}${content.length > 60 ? '...' : ''}"`,
            entityType: 'os_order',
            entityId: orderId,
          });
        } catch { /* ok */ }
      }
    }
  }, [addMutation, orderId, orderAssignee, orderNumber, userName, userId, teamMembers]);

  const grouped = groupMessages(messages);

  return (
    <div className="print:hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Chat da Equipe</h3>
        <span className="text-xs text-slate-400 dark:text-slate-500">({messages.length})</span>
      </div>

      {/* Lista de mensagens */}
      <div
        ref={listRef}
        className="max-h-80 overflow-y-auto space-y-1 mb-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50 p-3"
      >
        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
            Nenhuma mensagem ainda. Seja o primeiro a comentar!
          </div>
        )}

        {grouped.map((group) => (
          <div key={group.items[0].id} className={`flex gap-2 ${isMe(group.userName) ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <ChatAvatar
              userName={group.userName}
              userColor={getColor(group.userName)}
              authUserId={getAuthUserId(group.userName, group.userId)}
              avatarMap={avatarMap}
            />

            {/* Mensagens */}
            <div className={`flex flex-col gap-0.5 max-w-[75%] ${isMe(group.userName) ? 'items-end' : 'items-start'}`}>
              {/* Nome + hora */}
              <div className={`flex items-center gap-1.5 ${isMe(group.userName) ? 'flex-row-reverse' : ''}`}>
                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                  {shortName(group.userName)}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500">
                  {formatChatTime(group.items[0].createdAt)}
                </span>
              </div>

              {/* Bubbles */}
              {group.items.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  isMe={isMe(msg.userName)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Input ou banner arquivado */}
      {readOnly ? (
        <div className="text-center text-xs text-slate-400 dark:text-slate-500 py-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900/50">
          <svg className="w-4 h-4 inline-block mr-1 -mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Chat arquivado — esta OS foi concluida.
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
  );
}

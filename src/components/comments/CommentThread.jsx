import { useState, useEffect, useRef } from 'react';
import { getCommentsByOrder, addComment } from '../../lib/commentService';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin}m atras`;
  if (diffHours < 24) return `${diffHours}h atras`;
  if (diffDays < 7) return `${diffDays}d atras`;
  return d.toLocaleDateString('pt-BR');
}

export function CommentThread({ orderId, userName = 'Voce' }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (!orderId) return;
    (async () => {
      setLoading(true);
      const data = await getCommentsByOrder(orderId);
      setComments(data);
      setLoading(false);
    })();
  }, [orderId]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments]);

  const handleSend = async () => {
    if (!newComment.trim() || sending) return;
    setSending(true);
    await addComment({ orderId, userName, content: newComment.trim() });
    setNewComment('');
    const data = await getCommentsByOrder(orderId);
    setComments(data);
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div className="space-y-3 p-3">
        {[1, 2].map(i => (
          <div key={i} className="flex gap-2 animate-pulse">
            <div className="w-7 h-7 bg-slate-200 dark:bg-slate-700 rounded-full" />
            <div className="flex-1 space-y-1">
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Comments list */}
      <div ref={listRef} className="flex-1 overflow-y-auto space-y-3 p-3 max-h-60">
        {comments.length === 0 ? (
          <div className="text-center py-4">
            <svg className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-xs text-slate-400 dark:text-slate-500">Nenhum comentario ainda</p>
          </div>
        ) : (
          comments.map(c => (
            <div key={c.id} className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                {(c.userName || '?')[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">{c.userName}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-0.5 whitespace-pre-wrap break-words">{c.content}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escreva um comentario..."
            rows={1}
            className="flex-1 px-3 py-2 text-sm border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!newComment.trim() || sending}
            className="px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default CommentThread;

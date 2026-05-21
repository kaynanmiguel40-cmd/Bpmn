import { Check, CheckCheck, AlertCircle, Image as ImageIcon, FileText, Mic, Video } from 'lucide-react';

/**
 * MessageBubble - Renderiza uma mensagem no thread.
 *
 * Inbound: alinha esquerda, fundo cinza.
 * Outbound: alinha direita, fundo verde-claro.
 * Status: ✓ (sent), ✓✓ (delivered), ✓✓ azul (read), ⚠ (failed).
 */

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function StatusIcon({ status }) {
  if (status === 'pending')   return <Check size={12} className="text-slate-400" />;
  if (status === 'sent')      return <Check size={12} className="text-slate-400" />;
  if (status === 'delivered') return <CheckCheck size={12} className="text-slate-400" />;
  if (status === 'read')      return <CheckCheck size={12} className="text-blue-500" />;
  if (status === 'failed')    return <AlertCircle size={12} className="text-red-500" />;
  return null;
}

function MediaContent({ type, url, mime, filename, caption }) {
  if (!url) return null;
  if (type === 'image') {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block mb-1">
        <img src={url} alt={caption || 'imagem'} className="rounded max-w-full max-h-64 object-cover" />
      </a>
    );
  }
  if (type === 'video') {
    return (
      <video controls src={url} className="rounded max-w-full max-h-64 mb-1">
        Seu navegador nao suporta video.
      </video>
    );
  }
  if (type === 'audio') {
    return (
      <audio controls src={url} className="w-full mb-1">
        Seu navegador nao suporta audio.
      </audio>
    );
  }
  // document/sticker/other -> link
  const Icon = type === 'sticker' ? ImageIcon : FileText;
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 text-sm text-fyness-primary hover:underline mb-1"
    >
      <Icon size={14} />
      <span className="truncate">{filename || caption || mime || 'arquivo'}</span>
    </a>
  );
}

export function MessageBubble({ message }) {
  const isOut = message.direction === 'outbound';
  const align = isOut ? 'justify-end' : 'justify-start';
  const bubbleClasses = isOut
    ? 'bg-emerald-100 dark:bg-emerald-900/40 text-slate-800 dark:text-slate-100'
    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700';

  return (
    <div className={`flex ${align} mb-1.5`}>
      <div className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm ${bubbleClasses}`}>
        {message.mediaUrl && message.status !== 'failed' && (
          <MediaContent
            type={message.mediaType}
            url={message.mediaUrl}
            mime={message.mediaMime}
            filename={message.mediaFilename}
            caption={message.mediaCaption}
          />
        )}
        {message.content && (
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        )}
        <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
          <span>{formatTime(message.sentAt)}</span>
          {isOut && <StatusIcon status={message.status} />}
        </div>
        {message.status === 'failed' && message.errorMessage && (
          <p className="text-[10px] text-red-500 mt-1">{message.errorMessage}</p>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;

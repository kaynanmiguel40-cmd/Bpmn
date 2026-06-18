import { useRef, useState } from 'react';
import { Check, CheckCheck, AlertCircle, FileText, Play, Pause, Download, Mic } from 'lucide-react';

/**
 * MessageBubble - Mensagem no thread, estilo WhatsApp.
 * Inbound: esquerda, bolha branca/escura. Outbound: direita, bolha verde.
 */

function formatTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function StatusIcon({ status }) {
  if (status === 'pending')   return <Check size={15} className="text-slate-400" />;
  if (status === 'sent')      return <Check size={15} className="text-slate-400" />;
  if (status === 'delivered') return <CheckCheck size={15} className="text-slate-400" />;
  if (status === 'read')      return <CheckCheck size={15} className="text-[#53bdeb]" />;
  if (status === 'failed')    return <AlertCircle size={15} className="text-red-500" />;
  return null;
}

function fmtClock(s) {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const sec = String(Math.floor(s % 60)).padStart(2, '0');
  return `${m}:${sec}`;
}

function AudioPlayer({ url, isOut }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); } else { a.play(); }
  };
  const pct = dur ? (cur / dur) * 100 : 0;
  const accent = isOut ? '#1da57a' : '#00a884';

  return (
    <div className="flex items-center gap-2.5 py-1 min-w-[200px]">
      <button onClick={toggle}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white shrink-0"
        style={{ backgroundColor: accent }}>
        {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>
      <div className="flex-1">
        <div className="h-1 rounded-full bg-black/15 dark:bg-white/20 relative">
          <div className="h-1 rounded-full absolute left-0 top-0" style={{ width: `${pct}%`, backgroundColor: accent }} />
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Mic size={12} className="text-slate-400" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
            {fmtClock(playing || cur ? cur : dur)}
          </span>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onLoadedMetadata={(e) => setDur(e.currentTarget.duration)}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCur(0); }}
      />
    </div>
  );
}

function MediaContent({ message, isOut }) {
  const { mediaType: type, mediaUrl: url, mediaMime: mime, mediaFilename: filename, mediaCaption: caption } = message;
  if (!url) return null;

  if (type === 'image') {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block -mx-1 -mt-1 mb-1">
        <img src={url} alt={caption || 'imagem'} loading="lazy"
          className="rounded-lg max-w-full w-full max-h-80 object-cover" />
      </a>
    );
  }
  if (type === 'video') {
    return (
      <div className="-mx-1 -mt-1 mb-1">
        <video controls src={url} className="rounded-lg max-w-full max-h-80 w-full bg-black" />
      </div>
    );
  }
  if (type === 'audio') return <AudioPlayer url={url} isOut={isOut} />;

  // documento / sticker / outro
  return (
    <a href={url} target="_blank" rel="noreferrer"
      className="flex items-center gap-3 py-1.5 pr-2 min-w-[180px] group">
      <span className="w-10 h-10 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0">
        <FileText size={18} className="text-slate-600 dark:text-slate-200" />
      </span>
      <span className="flex-1 min-w-0 text-sm text-slate-700 dark:text-slate-100 truncate">
        {filename || caption || mime || 'arquivo'}
      </span>
      <Download size={16} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 shrink-0" />
    </a>
  );
}

export function MessageBubble({ message }) {
  const isOut = message.direction === 'outbound';
  const hasMedia = !!message.mediaUrl && message.status !== 'failed';
  const showCaption = !!message.content && message.mediaType !== 'audio';

  return (
    <div className={`flex ${isOut ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={[
          'relative max-w-[78%] md:max-w-[65%] rounded-lg px-2 py-1.5 shadow-sm text-[14.5px] leading-snug',
          isOut
            ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-800 dark:text-slate-50 rounded-tr-sm'
            : 'bg-white dark:bg-[#202c33] text-slate-800 dark:text-slate-50 rounded-tl-sm',
        ].join(' ')}
      >
        {hasMedia && <MediaContent message={message} isOut={isOut} />}

        {showCaption && (
          <p className="whitespace-pre-wrap break-words px-1">{message.content}</p>
        )}

        <div className={`flex items-center justify-end gap-1 select-none ${hasMedia && !showCaption ? '-mt-0.5' : 'mt-0.5'} pl-2`}>
          <span className="text-[11px] text-slate-500 dark:text-slate-300/70 tabular-nums">
            {formatTime(message.sentAt)}
          </span>
          {isOut && <StatusIcon status={message.status} />}
        </div>

        {message.status === 'failed' && (
          <p className="text-[11px] text-red-500 mt-0.5 px-1">
            {message.errorMessage || 'Falha no envio'}
          </p>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;

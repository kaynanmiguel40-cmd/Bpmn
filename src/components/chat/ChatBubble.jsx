import { useState, useRef, useEffect } from 'react';
import { parseRichText } from './chatUtils';

// ==================== ATTACHMENT RENDERERS ====================

function ImageAttachment({ att, onPreview }) {
  return (
    <button
      type="button"
      onClick={() => onPreview(att)}
      className="block rounded-lg overflow-hidden max-w-[200px] hover:opacity-90 transition-opacity"
    >
      <img
        src={att.data}
        alt={att.label}
        className="w-full h-auto max-h-48 object-cover rounded-lg"
        loading="lazy"
      />
    </button>
  );
}

function VideoAttachment({ att, isMe }) {
  return (
    <div className="rounded-lg overflow-hidden max-w-[240px]">
      <video
        src={att.data}
        controls
        preload="metadata"
        className="w-full rounded-lg"
        style={{ maxHeight: '180px' }}
      />
      <p className={`text-[10px] mt-1 truncate ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
        {att.label}
      </p>
    </div>
  );
}

function DocumentAttachment({ att, isMe }) {
  const icons = {
    pdf: '📄',
    doc: '📝', docx: '📝',
    xls: '📊', xlsx: '📊',
    default: '📎',
  };
  const ext = att.label?.split('.').pop()?.toLowerCase() || '';
  const icon = icons[ext] || icons.default;

  return (
    <a
      href={att.data}
      download={att.label}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${
        isMe
          ? 'bg-blue-400/30 text-white hover:bg-blue-400/50'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
      } transition-colors`}
    >
      <span className="text-lg">{icon}</span>
      <span className="truncate max-w-[150px]">{att.label}</span>
    </a>
  );
}

// ==================== AUDIO PLAYER ====================

function AudioAttachment({ att, isMe }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(att.duration || 0);
  const audioRef = useRef(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoaded = () => {
      if (audio.duration && isFinite(audio.duration)) setDuration(Math.round(audio.duration));
    };
    const onTimeUpdate = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onEnded = () => { setPlaying(false); setProgress(0); };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); }
    else { audio.play(); }
    setPlaying(!playing);
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 min-w-[180px] max-w-[220px]">
      <audio ref={audioRef} src={att.data} preload="metadata" />

      {/* Play/Pause */}
      <button
        type="button"
        onClick={toggle}
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
          isMe ? 'bg-white/20 hover:bg-white/30' : 'bg-blue-500/10 hover:bg-blue-500/20'
        }`}
      >
        {playing ? (
          <svg className={`w-4 h-4 ${isMe ? 'text-white' : 'text-blue-500'}`} fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
        ) : (
          <svg className={`w-4 h-4 ${isMe ? 'text-white' : 'text-blue-500'}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Waveform / progress */}
      <div className="flex-1 flex flex-col gap-1">
        <div
          className="relative h-5 flex items-center cursor-pointer"
          onClick={seek}
        >
          {/* Waveform bars */}
          <div className="flex items-center gap-[2px] w-full h-full">
            {Array.from({ length: 28 }).map((_, i) => {
              const filled = i / 28 <= progress;
              const barH = [6, 10, 14, 8, 12, 16, 10, 14, 8, 12, 16, 10, 6, 14, 10, 16, 8, 12, 14, 10, 8, 16, 12, 6, 14, 10, 8, 12][i];
              return (
                <div
                  key={i}
                  className={`w-[3px] rounded-full transition-colors ${
                    filled
                      ? isMe ? 'bg-white' : 'bg-blue-500'
                      : isMe ? 'bg-white/30' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                  style={{ height: `${barH}px` }}
                />
              );
            })}
          </div>
        </div>
        <span className={`text-[10px] ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
          {formatTime(playing ? Math.round(progress * duration) : duration)}
        </span>
      </div>
    </div>
  );
}

// ==================== RICH TEXT RENDERER ====================

function RichText({ text, mentions, isMe }) {
  const segments = parseRichText(text, mentions);

  return (
    <span className="whitespace-pre-wrap break-words">
      {segments.map((seg, i) => {
        if (seg.type === 'link') {
          return (
            <a
              key={i}
              href={seg.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline ${isMe ? 'text-blue-100 hover:text-white' : 'text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'}`}
            >
              {seg.value}
            </a>
          );
        }
        if (seg.type === 'mention') {
          return (
            <span
              key={i}
              className={`font-semibold ${isMe ? 'text-blue-100' : 'text-blue-600 dark:text-blue-400'}`}
            >
              {seg.value}
            </span>
          );
        }
        return <span key={i}>{seg.value}</span>;
      })}
    </span>
  );
}

// ==================== PREVIEW MODAL ====================

function PreviewModal({ attachment, onClose }) {
  if (!attachment) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-slate-300 transition-colors"
      >
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <div onClick={(e) => e.stopPropagation()} className="max-w-4xl max-h-[90vh]">
        {attachment.type === 'image' && (
          <img src={attachment.data} alt={attachment.label} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
        )}
        {attachment.type === 'video' && (
          <video src={attachment.data} controls autoPlay className="max-w-full max-h-[85vh] rounded-lg" />
        )}
      </div>
    </div>
  );
}

// ==================== READ RECEIPT CHECKMARKS ====================

function formatReadTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min`;
  if (diffHours < 24) return `${diffHours}h`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function ReadReceipt({ message, isMe, readBy, participants }) {
  const [showViewers, setShowViewers] = useState(false);

  if (!isMe) return null;

  const msgTime = new Date(message.createdAt);

  // Who actually read this specific message
  const viewers = (readBy || []).filter(r => {
    if (!r.lastReadAt || !message.createdAt) return false;
    return new Date(r.lastReadAt) >= msgTime;
  });

  // Who hasn't read yet (participants minus viewers)
  const viewerIds = new Set(viewers.map(v => v.userId || v.userName));
  const pending = (participants || []).filter(p => !viewerIds.has(p.userId || p.userName));

  const totalOthers = (participants || []).length;
  const allRead = totalOthers > 0 && pending.length === 0;
  const someRead = viewers.length > 0;

  return (
    <div className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setShowViewers(!showViewers); }}
        className="inline-flex items-center gap-0 cursor-pointer"
        title={allRead ? 'Visualizado por todos' : someRead ? `Visualizado por ${viewers.length}/${totalOthers}` : 'Enviado'}
      >
        {/* Double check SVG */}
        <svg
          width="16"
          height="11"
          viewBox="0 0 16 11"
          fill="none"
          className={`flex-shrink-0 transition-colors ${
            allRead ? 'text-blue-200' : someRead ? 'text-blue-300/60' : 'text-white/40'
          }`}
        >
          <path
            d="M11 1L4.5 8.5L1.5 5.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14.5 1L8 8.5L6.5 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Viewers popup */}
      {showViewers && (
        <>
          <div className="fixed inset-0 z-[100]" onClick={() => setShowViewers(false)} />
          <div className="absolute bottom-full right-0 mb-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-2 px-1 z-[101] min-w-[170px]">
            {/* Read section */}
            {viewers.length > 0 && (
              <>
                <p className="text-[10px] font-bold text-blue-500 mb-1 px-2 flex items-center gap-1">
                  <svg width="12" height="9" viewBox="0 0 16 11" fill="none" className="text-blue-500">
                    <path d="M11 1L4.5 8.5L1.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14.5 1L8 8.5L6.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Visualizado
                </p>
                {viewers.map((v) => (
                  <div key={v.userId || v.userName} className="flex items-center justify-between gap-2 py-1 px-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <span className="text-[11px] text-slate-700 dark:text-slate-200 truncate">
                      {v.userName || 'Usuario'}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                      {formatReadTime(v.lastReadAt)}
                    </span>
                  </div>
                ))}
              </>
            )}

            {/* Pending section */}
            {pending.length > 0 && (
              <>
                {viewers.length > 0 && <div className="border-t border-slate-100 dark:border-slate-700 my-1.5" />}
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 px-2 flex items-center gap-1">
                  <svg width="12" height="9" viewBox="0 0 16 11" fill="none" className="text-slate-400">
                    <path d="M11 1L4.5 8.5L1.5 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14.5 1L8 8.5L6.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Pendente
                </p>
                {pending.map((p) => (
                  <div key={p.userId || p.userName} className="flex items-center gap-2 py-1 px-2">
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                      {p.userName || 'Usuario'}
                    </span>
                  </div>
                ))}
              </>
            )}

            {/* No participants */}
            {viewers.length === 0 && pending.length === 0 && (
              <p className="text-[10px] text-slate-400 dark:text-slate-500 px-2 py-1">
                Nenhum participante ainda
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ==================== MAIN COMPONENT ====================

/**
 * ChatBubble - renders a single message with rich content.
 * readBy: array of { userId, userName, lastReadAt } for read receipt display
 * participants: array of { userId, userName } - other participants in the conversation
 */
export default function ChatBubble({ message, isMe, readBy, participants }) {
  const [preview, setPreview] = useState(null);
  const hasText = !!message.content;
  const hasAttachments = message.attachments && message.attachments.length > 0;

  return (
    <>
      <div
        className={`px-3 py-1.5 rounded-xl text-sm leading-relaxed max-w-full ${
          isMe
            ? 'bg-blue-500 text-white rounded-tr-sm'
            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-tl-sm'
        }`}
      >
        {/* Text content with rich rendering */}
        {hasText && (
          <RichText text={message.content} mentions={message.mentions} isMe={isMe} />
        )}

        {/* Attachments */}
        {hasAttachments && (
          <div className={`flex flex-wrap gap-2 ${hasText ? 'mt-2' : ''}`}>
            {message.attachments.map((att) => {
              if (att.type === 'image') {
                return <ImageAttachment key={att.id} att={att} onPreview={setPreview} />;
              }
              if (att.type === 'video') {
                return <VideoAttachment key={att.id} att={att} isMe={isMe} />;
              }
              if (att.type === 'audio') {
                return <AudioAttachment key={att.id} att={att} isMe={isMe} />;
              }
              return <DocumentAttachment key={att.id} att={att} isMe={isMe} />;
            })}
          </div>
        )}

        {/* Read receipt checkmarks */}
        {isMe && (
          <div className="flex justify-end mt-0.5 -mb-0.5">
            <ReadReceipt message={message} isMe={isMe} readBy={readBy} participants={participants} />
          </div>
        )}
      </div>

      {/* Fullscreen preview */}
      {preview && <PreviewModal attachment={preview} onClose={() => setPreview(null)} />}
    </>
  );
}

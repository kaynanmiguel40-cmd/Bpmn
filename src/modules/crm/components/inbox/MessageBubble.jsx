import { useRef, useState } from 'react';
import { Check, CheckCheck, AlertCircle, FileText, Play, Pause, Download, Mic, MapPin, UserRound, Reply, Trash2, Ban } from 'lucide-react';
import { AudioMessage } from './AudioMessage';

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
  const [failed, setFailed] = useState(false);

  // Fallback: se o navegador nao consegue carregar/decodificar o audio
  // (ex: nota de voz .webm), degrada pra link em vez de player quebrado.
  if (failed) {
    return (
      <a href={url} target="_blank" rel="noreferrer"
        className="flex items-center gap-2 py-1.5 pr-2 min-w-[170px] text-sm text-slate-600 dark:text-slate-200 hover:underline">
        <Mic size={16} className="shrink-0" />
        <span className="flex-1">Áudio</span>
        <Download size={14} className="text-slate-400 shrink-0" />
      </a>
    );
  }

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); return; }
    // play() retorna promise; sem .catch, autoplay bloqueado/decodificacao vira
    // "Uncaught (in promise)" que pode escapar e derrubar a tela.
    const p = a.play();
    if (p && typeof p.catch === 'function') p.catch(() => setPlaying(false));
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
          <span className="text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">
            {fmtClock(playing || cur ? cur : dur)}
          </span>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onLoadedMetadata={(e) => { const d = e.currentTarget.duration; setDur(Number.isFinite(d) ? d : 0); }}
        onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => { setPlaying(false); setCur(0); }}
        onError={() => setFailed(true)}
      />
    </div>
  );
}

/** 5535999998888 -> (35) 99999-8888. Fora do padrão BR, devolve como veio. */
function formatarTelefone(digitos) {
  const d = String(digitos || '').replace(/\D/g, '');
  const nac = d.startsWith('55') && d.length > 11 ? d.slice(2) : d;
  if (nac.length === 11) return `(${nac.slice(0, 2)}) ${nac.slice(2, 7)}-${nac.slice(7)}`;
  if (nac.length === 10) return `(${nac.slice(0, 2)}) ${nac.slice(2, 6)}-${nac.slice(6)}`;
  return digitos;
}

function MediaContent({ message, isOut }) {
  const { mediaType: type, mediaUrl: url, mediaMime: mime, mediaFilename: filename, mediaCaption: caption } = message;
  if (!url) return null;

  const m = mime || '';

  // Localização: não há arquivo, `url` é o link do mapa. Mostrar a coordenada
  // crua no balão não resolvia nada — o vendedor precisa ABRIR, não ler número.
  if (type === 'location') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className={`flex items-center gap-2.5 py-1.5 pr-2 min-w-[180px] group ${isOut ? '' : ''}`}
      >
        <span className="w-10 h-10 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0">
          <MapPin size={18} className="text-rose-500" />
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-medium truncate">
            {caption || 'Localização'}
          </span>
          <span className="block text-[11px] opacity-70 group-hover:underline">
            Abrir no mapa
          </span>
        </span>
      </a>
    );
  }

  // Contato compartilhado: alguém indicou alguém — ou seja, um lead. O balão
  // trazia só o nome, que não dá pra fazer nada. `url` é o wa.me do número que
  // veio no vCard, então dá pra puxar conversa num clique.
  if (type === 'contact') {
    return (
      <a href={url} target="_blank" rel="noreferrer"
        className="flex items-center gap-2.5 py-1.5 pr-2 min-w-[180px] group">
        <span className="w-10 h-10 rounded-lg bg-black/10 dark:bg-white/10 flex items-center justify-center shrink-0">
          <UserRound size={18} className="text-emerald-500" />
        </span>
        <span className="min-w-0">
          <span className="block text-[13px] font-medium truncate">
            {message.content || 'Contato'}
          </span>
          <span className="block text-[11px] opacity-70 group-hover:underline">
            {caption ? formatarTelefone(caption) : 'Abrir conversa'}
          </span>
        </span>
      </a>
    );
  }

  // Figurinha (sticker): webp pequeno, fundo transparente — NUNCA vira "arquivo".
  if (type === 'sticker') {
    return (
      <img src={url} alt="figurinha" loading="lazy"
        className="w-32 h-32 object-contain" />
    );
  }

  // Foto: media_type 'image' OU um "documento" cujo mime e de imagem
  // (foto enviada "como arquivo" no WhatsApp chega como documentMessage).
  if (type === 'image' || m.startsWith('image/')) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="block -mx-1 -mt-1 mb-1">
        <img src={url} alt={caption || 'imagem'} loading="lazy"
          className="rounded-lg max-w-full w-full max-h-80 object-cover" />
      </a>
    );
  }
  if (type === 'video' || m.startsWith('video/')) {
    return (
      <div className="-mx-1 -mt-1 mb-1">
        <video controls src={url} className="rounded-lg max-w-full max-h-80 w-full bg-black" />
      </div>
    );
  }
  if (type === 'audio' || m.startsWith('audio/')) {
    // Player que toca ogg/opus em qualquer navegador — nativo onde da, WASM no
    // iPhone (onde nenhum navegador toca ogg/opus), download como ultimo fallback.
    return <AudioMessage url={url} isOut={isOut} durationSeconds={message.mediaDurationSeconds} />;
  }

  // documento real (pdf, planilha, etc) / outro
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

export function MessageBubble({ message, onReply, onDelete }) {
  const isOut = message.direction === 'outbound';
  // Apagada: o balão mostra só o "🚫 Esta mensagem foi apagada" (igual WhatsApp),
  // sem mídia/legenda/citação e sem ações de responder/apagar.
  const isDeleted = !!message.deleted;
  const hasMedia = !isDeleted && !!message.mediaUrl && message.status !== 'failed';
  const isSticker = hasMedia && message.mediaType === 'sticker';
  // 'location' e 'contact' mostram o texto DENTRO do card (nome do lugar / nome
  // do contato), entao repetir embaixo duplicaria a informacao.
  //
  // Mas so quando o card EXISTE: MediaContent devolve null sem media_url, e ai
  // suprimir a legenda deixa o balao literalmente vazio. Foi o que aconteceu com
  // as mensagens gravadas antes do fix (media_type preenchido, media_url nulo) —
  // elas sumiram da tela sem ter sumido do banco. Vale pro audio tambem: quando
  // o espelhamento falha, `[audio nao disponivel]` e a unica coisa que resta pra
  // mostrar, e a regra antiga escondia justamente ela.
  const CARD_COM_TEXTO_PROPRIO = ['audio', 'location', 'contact'];
  const showCaption = !!message.content
    && !(hasMedia && CARD_COM_TEXTO_PROPRIO.includes(message.mediaType));
  // figurinha: sem horario "grudado"; resto segue a regra antiga.
  const timeMt = isSticker ? 'mt-0.5' : (hasMedia && !showCaption ? '-mt-0.5' : 'mt-0.5');

  return (
    <div className={`group flex ${isOut ? 'justify-end' : 'justify-start'} mb-1`}>
      <div
        className={
          isSticker
            // figurinha: SEM bolha (fundo transparente), igual ao WhatsApp
            ? 'relative max-w-[55%]'
            : [
                'relative max-w-[78%] md:max-w-[65%] rounded-lg px-2 py-1.5 shadow-sm text-[14.5px] leading-snug',
                isOut
                  ? 'bg-[#d9fdd3] dark:bg-[#005c4b] text-slate-800 dark:text-slate-50 rounded-tr-sm'
                  : 'bg-white dark:bg-[#202c33] text-slate-800 dark:text-slate-50 rounded-tl-sm',
              ].join(' ')
        }
      >
        {/* Acoes no hover, ao lado da bolha (estilo WhatsApp): responder + apagar.
            Mensagem ja apagada nao oferece nenhuma das duas. */}
        {!isDeleted && (onReply || onDelete) && (
          <div className={`absolute top-1 ${isOut ? '-left-9' : '-right-9'} flex flex-col gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity`}>
            {onReply && (
              <button
                type="button"
                onClick={() => onReply(message)}
                title="Responder"
                className="p-1.5 rounded-full bg-white dark:bg-slate-700 shadow text-slate-500 hover:text-slate-700 dark:text-slate-200"
              >
                <Reply size={15} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(message)}
                title="Apagar mensagem"
                className="p-1.5 rounded-full bg-white dark:bg-slate-700 shadow text-slate-500 hover:text-rose-600 dark:text-slate-200 dark:hover:text-rose-400"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}

        {isDeleted ? (
          <p className="flex items-center gap-1.5 italic text-slate-500 dark:text-slate-300/80 px-1 py-0.5">
            <Ban size={14} className="shrink-0 opacity-70" />
            Esta mensagem foi apagada
          </p>
        ) : (
          <>
            {/* Mensagem citada (respondendo a). Desnormalizado — nao precisa de join. */}
            {message.replyToPreview && (
              <div
                className={`mb-1 rounded px-2 py-1 border-l-[3px] ${isOut ? 'bg-black/5 dark:bg-black/25' : 'bg-black/[0.03] dark:bg-white/5'}`}
                style={{ borderLeftColor: message.replyToFromMe ? '#1da57a' : '#00a884' }}
              >
                <span className="block text-[11px] font-semibold" style={{ color: message.replyToFromMe ? '#1da57a' : '#06a37f' }}>
                  {message.replyToFromMe ? 'Você' : 'Contato'}
                </span>
                <span className="block text-[13px] text-slate-600 dark:text-slate-300 truncate">
                  {message.replyToPreview}
                </span>
              </div>
            )}

            {hasMedia && <MediaContent message={message} isOut={isOut} />}

            {showCaption && (
              <p className="whitespace-pre-wrap break-words px-1">{message.content}</p>
            )}
          </>
        )}

        <div className={`flex items-center justify-end gap-1 select-none ${timeMt} ${isSticker ? '' : 'pl-2'}`}>
          <span className="text-[12px] text-slate-500 dark:text-slate-300/70 tabular-nums">
            {formatTime(message.sentAt)}
          </span>
          {isOut && !isDeleted && <StatusIcon status={message.status} />}
        </div>

        {message.status === 'failed' && (
          <p className="text-[12px] text-red-500 mt-0.5 px-1">
            {message.errorMessage || 'Falha no envio'}
          </p>
        )}
      </div>
    </div>
  );
}

export default MessageBubble;

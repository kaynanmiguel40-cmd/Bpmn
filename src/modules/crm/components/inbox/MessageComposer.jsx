import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send, Paperclip, Loader2, Image as ImageIcon, FileText, X,
  Mic, Trash2, Smile,
} from 'lucide-react';
import { useSendCrmMessage } from '../../hooks/useCrmQueries';
import { uploadCrmMedia, detectMediaType } from '../../lib/uploadCrmMedia';
import { messagePreview } from '../../services/crmMessagesService';
import { toast } from '../../../../contexts/ToastContext';
import { EmojiPicker } from './EmojiPicker';

// Constroi o objeto de citacao que o envio entende, a partir da mensagem-alvo.
function buildReplyPayload(msg) {
  if (!msg) return null;
  return {
    id: msg.id,
    evolutionMessageId: msg.evolutionMessageId || null,
    preview: messagePreview(msg),
    fromMe: msg.direction === 'outbound',
  };
}

/**
 * MessageComposer - Barra de envio estilo WhatsApp.
 *
 * Suporta:
 *   - texto (Enter envia, Shift+Enter quebra linha)
 *   - anexo de foto/vídeo (image/* , video/*) e documento
 *   - gravação de nota de voz (MediaRecorder) com timer + cancelar/enviar
 *
 * Props:
 *   - conversation: { contactId?, prospectId?, otherPhone, dealId? }
 *   - instanceName: instância/numero por onde enviar (roteia a resposta)
 *   - disabled: bool (ex: instância desconectada)
 */

function pickAudioMime() {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  return candidates.find((t) => MediaRecorder.isTypeSupported?.(t)) || '';
}

function audioExt(mime) {
  if (mime.includes('ogg')) return 'ogg';
  if (mime.includes('mp4')) return 'm4a';
  return 'webm';
}

function fmtDuration(s) {
  const m = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, '0');
  return `${m}:${sec}`;
}

// Guard de tamanho por tipo de midia — pega o arquivo grande ANTES do upload
// inteiro (senao so descobria o erro depois). NAO sao os limites da Cloud API da
// Meta (5/16/16/100): a gente manda pela Evolution/Baileys (protocolo do WhatsApp
// Web), que aguenta bem mais. Video em 64MB (o app so trima em 16MB pra ECONOMIA
// do remetente; via Evolution passa maior). Doc ja sobe 100MB pela mesma tubulacao
// base64 -> edge function, entao 64MB de video e o mesmo patamar de infra.
const MEDIA_SIZE_LIMITS = {
  image: 5 * 1024 * 1024,
  video: 64 * 1024 * 1024,
  audio: 16 * 1024 * 1024,
  document: 100 * 1024 * 1024,
};

function mediaSizeLimitFor(mediaType) {
  return MEDIA_SIZE_LIMITS[mediaType] ?? MEDIA_SIZE_LIMITS.document;
}

export function MessageComposer({ conversation, instanceName, disabled, placeholder = 'Mensagem', replyTo = null, onCancelReply }) {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState(null); // { file, preview, mediaType }
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const rootRef = useRef(null);

  // gravação de voz
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  // true entre o stop da gravação e a mutation resolver — mantém a barra visível
  // com "Enviando áudio…" em vez de voltar pro composer normal (mic estático, sem feedback).
  const [audioSending, setAudioSending] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const cancelledRef = useRef(false);

  const textareaRef = useRef(null);
  const mediaInputRef = useRef(null);
  const docInputRef = useRef(null);
  const sendMutation = useSendCrmMessage();

  useEffect(() => () => stopTracks(), []);

  // Fecha o painel de emoji ao clicar fora do composer.
  useEffect(() => {
    if (!emojiOpen) return;
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setEmojiOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [emojiOpen]);

  // Insere o emoji na posição do cursor do textarea (mantém o painel aberto).
  const insertEmoji = (emoji) => {
    const el = textareaRef.current;
    if (!el) { setText((t) => t + emoji); return; }
    const start = el.selectionStart ?? text.length;
    const end = el.selectionEnd ?? text.length;
    setText(text.slice(0, start) + emoji + text.slice(end));
    requestAnimationFrame(() => {
      el.focus();
      const pos = start + emoji.length;
      try { el.setSelectionRange(pos, pos); } catch { /* noop */ }
    });
  };

  function stopTracks() {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  const isSending = uploading || sendMutation.isPending;
  const hasText = text.trim().length > 0;
  const canSendNow = !disabled && !isSending && !!conversation?.otherPhone;

  // ---- anexos (foto/vídeo/documento) ----
  // Prepara um File como anexo pendente (valida tamanho, gera preview). Fonte
  // unica pro seletor de arquivo E pro colar (Ctrl+V). Substitui um anexo anterior
  // revogando o preview velho pra nao vazar object URL.
  const stageFile = useCallback((file) => {
    if (!file) return false;
    const mediaType = detectMediaType(file.type);
    const limit = mediaSizeLimitFor(mediaType);
    if (file.size > limit) {
      toast(`Arquivo maior que o limite do WhatsApp pra esse tipo (${(limit / (1024 * 1024)).toFixed(0)}MB)`, 'error');
      return false;
    }
    const preview = (mediaType === 'image' || mediaType === 'video') ? URL.createObjectURL(file) : null;
    setAttachment((prev) => {
      if (prev?.preview) URL.revokeObjectURL(prev.preview);
      return { file, preview, mediaType };
    });
    return true;
  }, []);

  // Colar imagem (Ctrl+V), estilo WhatsApp: um print no clipboard vira anexo
  // pendente. Escuta no window pra funcionar mesmo sem clicar na caixa antes; so
  // sequestra o paste quando HA imagem no clipboard — colar texto segue normal.
  useEffect(() => {
    if (disabled || !conversation?.otherPhone) return undefined;
    const onPaste = (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const it of items) {
        if (it.kind === 'file' && it.type.startsWith('image/')) {
          const blob = it.getAsFile();
          if (!blob) continue;
          e.preventDefault();
          // Print do clipboard costuma vir sem nome; da um pra o upload/preview.
          const ext = (blob.type.split('/')[1] || 'png').split('+')[0];
          const named = new File([blob], `print-${Date.now()}.${ext}`, { type: blob.type });
          if (stageFile(named)) {
            setAttachMenuOpen(false);
            setEmojiOpen(false);
            toast('Imagem colada — Enter pra enviar', 'success');
            textareaRef.current?.focus();
          }
          return;
        }
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [disabled, conversation?.otherPhone, stageFile]);

  // Ao escolher "Responder", joga o foco na caixa pra ja digitar.
  useEffect(() => {
    if (replyTo) textareaRef.current?.focus();
  }, [replyTo]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (stageFile(file)) setAttachMenuOpen(false);
  };

  const removeAttachment = () => {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    setAttachment(null);
  };

  // ---- gravação de voz ----
  const startRecording = async () => {
    if (disabled || !conversation?.otherPhone) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = pickAudioMime();
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      chunksRef.current = [];
      cancelledRef.current = false;
      rec.ondataavailable = (ev) => { if (ev.data.size > 0) chunksRef.current.push(ev.data); };
      rec.onstop = async () => {
        stopTracks();
        const wasCancelled = cancelledRef.current;
        const type = rec.mimeType || mime || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        chunksRef.current = [];
        setRecSeconds(0);
        if (wasCancelled || blob.size < 800) {
          setRecording(false);
          return;
        }
        // Mantem a barra visivel (agora em modo "enviando") ate a mutation resolver —
        // senao o composer volta pro estado normal com um microfone estatico e
        // desabilitado, sem nenhum sinal de que o audio ainda esta subindo.
        setAudioSending(true);
        const file = new File([blob], `voz-${Date.now()}.${audioExt(type)}`, { type });
        const ok = await sendMedia({ file, mediaType: 'audio' });
        setRecording(false);
        setAudioSending(false);
        if (ok) toast('Áudio enviado', 'success');
      };
      streamRef.current = stream;
      recorderRef.current = rec;
      rec.start();
      setRecording(true);
      setRecSeconds(0);
      timerRef.current = setInterval(() => setRecSeconds((s) => s + 1), 1000);
    } catch {
      toast('Não consegui acessar o microfone. Verifique a permissão.', 'error');
    }
  };

  const stopRecording = (cancel = false) => {
    cancelledRef.current = cancel;
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    } else {
      stopTracks();
      setRecording(false);
      setRecSeconds(0);
    }
  };

  // ---- envio ----
  async function sendMedia({ file, mediaType, caption }) {
    setUploading(true);
    const prefix = conversation.contactId
      ? `contact-${conversation.contactId.slice(0, 8)}`
      : conversation.prospectId
      ? `prospect-${conversation.prospectId.slice(0, 8)}`
      : 'general';
    const up = await uploadCrmMedia(file, { prefix });
    setUploading(false);
    if (!up.ok) { toast(`Falha no upload: ${up.error}`, 'error'); return false; }
    const res = await sendMutation.mutateAsync({
      instanceName,
      phone:        conversation.otherPhone,
      mediaUrl:     up.url,
      mediaType:    mediaType || up.mediaType,
      mediaCaption: caption || undefined,
      contactId:    conversation.contactId || null,
      prospectId:   conversation.prospectId || null,
      dealId:       conversation.dealId || null,
      source:       'manual',
      replyTo:      buildReplyPayload(replyTo),
    });
    // sendCrmMessage devolve { ok:false } em vez de lançar — sem isto o envio
    // "falha em silencio" e a UI nao saberia que nao foi.
    const ok = res?.ok === true;
    if (ok) onCancelReply?.(); // enviou com a citacao -> limpa o banner
    return ok;
  }

  const handleSend = async () => {
    if (!canSendNow) return;
    setEmojiOpen(false);
    const content = text.trim();

    if (attachment) {
      const a = attachment;
      // So limpa o anexo se o envio deu certo — senao o usuario perderia o arquivo.
      const ok = await sendMedia({ file: a.file, mediaType: a.mediaType, caption: content || undefined });
      if (ok) {
        setText('');
        setAttachment(null);
        if (a.preview) URL.revokeObjectURL(a.preview);
      }
      textareaRef.current?.focus();
      return;
    }

    if (!content) return;
    const res = await sendMutation.mutateAsync({
      instanceName,
      phone:      conversation.otherPhone,
      content,
      contactId:  conversation.contactId || null,
      prospectId: conversation.prospectId || null,
      dealId:     conversation.dealId || null,
      source:     'manual',
      replyTo:    buildReplyPayload(replyTo),
    });
    // Limpa o texto so apos confirmar — em falha o usuario nao reescreve do zero.
    if (res?.ok) { setText(''); onCancelReply?.(); }
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
  }, [text]);

  return (
    <div ref={rootRef} className="px-3 py-2.5 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-black/5 dark:border-white/5 relative">
      {/* painel de emoji */}
      {emojiOpen && !recording && !audioSending && (
        <div className="absolute bottom-[60px] left-3 z-30">
          <EmojiPicker onPick={insertEmoji} />
        </div>
      )}

      {/* respondendo a (citacao) — estilo WhatsApp: quem + preview + cancelar */}
      {replyTo && !recording && !audioSending && (
        <div className="mb-2 flex items-stretch gap-2 bg-white dark:bg-[#2a3942] rounded-lg overflow-hidden border border-black/5 dark:border-white/10">
          <span className="w-1 shrink-0" style={{ backgroundColor: replyTo.direction === 'outbound' ? '#1da57a' : '#00a884' }} />
          <div className="flex-1 min-w-0 py-1.5 pr-1">
            <p className="text-[12px] font-semibold" style={{ color: replyTo.direction === 'outbound' ? '#1da57a' : '#00a884' }}>
              {replyTo.direction === 'outbound' ? 'Você' : (conversation?.otherName || 'Contato')}
            </p>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 truncate">{messagePreview(replyTo)}</p>
          </div>
          <button
            type="button"
            onClick={() => onCancelReply?.()}
            title="Cancelar resposta"
            className="px-2 shrink-0 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* preview de anexo */}
      {attachment && !recording && !audioSending && (
        <div className="mb-2 flex items-center gap-3 bg-white dark:bg-[#2a3942] rounded-lg p-2 border border-black/5 dark:border-white/10">
          {attachment.mediaType === 'image' && attachment.preview ? (
            <img src={attachment.preview} alt="preview" className="w-12 h-12 rounded object-cover" />
          ) : attachment.mediaType === 'video' && attachment.preview ? (
            <video src={attachment.preview} className="w-12 h-12 rounded object-cover" />
          ) : (
            <FileText size={28} className="text-slate-400 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-800 dark:text-slate-100 truncate">{attachment.file.name}</p>
            <p className="text-[12px] text-slate-400">
              {(attachment.file.size / 1024).toFixed(0)} KB · {attachment.mediaType}
            </p>
          </div>
          <button type="button" onClick={removeAttachment} className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10" title="Remover">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
      )}

      {/* menu de anexo */}
      {attachMenuOpen && !recording && !audioSending && (
        <div className="absolute bottom-[60px] left-3 bg-white dark:bg-[#233138] rounded-xl shadow-xl border border-black/5 dark:border-white/10 overflow-hidden z-20 py-1 min-w-[180px]">
          <button type="button" onClick={() => mediaInputRef.current?.click()}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-100 hover:bg-black/5 dark:hover:bg-white/10 w-full">
            <span className="w-8 h-8 rounded-full bg-violet-500/15 text-violet-500 flex items-center justify-center"><ImageIcon size={16} /></span>
            Fotos e vídeos
          </button>
          <button type="button" onClick={() => docInputRef.current?.click()}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-100 hover:bg-black/5 dark:hover:bg-white/10 w-full">
            <span className="w-8 h-8 rounded-full bg-sky-500/15 text-sky-500 flex items-center justify-center"><FileText size={16} /></span>
            Documento
          </button>
        </div>
      )}

      <input ref={mediaInputRef} type="file" accept="image/*,video/*" onChange={handleFileSelect} className="hidden" />
      <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip" onChange={handleFileSelect} className="hidden" />

      {recording || audioSending ? (
        /* barra de gravação / envio */
        <div className="flex items-center gap-3 h-11">
          {audioSending ? (
            <>
              <span className="w-9 h-9 rounded-full flex items-center justify-center text-[#00a884] shrink-0">
                <Loader2 size={20} className="animate-spin" />
              </span>
              <div className="flex-1 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="text-sm font-medium">Enviando áudio…</span>
              </div>
            </>
          ) : (
            <>
              <button type="button" onClick={() => stopRecording(true)} title="Cancelar" className="p-2 rounded-full text-red-500 hover:bg-red-500/10">
                <Trash2 size={20} />
              </button>
              <div className="flex-1 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="text-sm tabular-nums font-medium">{fmtDuration(recSeconds)}</span>
                <span className="text-xs text-slate-400 hidden sm:inline">gravando… toque na lixeira pra cancelar</span>
              </div>
              <button type="button" onClick={() => stopRecording(false)} title="Enviar áudio"
                className="w-11 h-11 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#06cf9c] shadow">
                <Send size={20} />
              </button>
            </>
          )}
        </div>
      ) : (
        /* barra normal */
        <div className="flex items-end gap-2">
          <button type="button" onClick={() => { setEmojiOpen((v) => !v); setAttachMenuOpen(false); }} disabled={disabled || isSending}
            title="Emoji" className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-40 shrink-0">
            <Smile size={22} className={emojiOpen ? 'text-[#00a884]' : 'text-slate-500 dark:text-slate-300'} />
          </button>

          <button type="button" onClick={() => { setAttachMenuOpen((v) => !v); setEmojiOpen(false); }} disabled={disabled || isSending}
            title="Anexar" className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-40 shrink-0">
            <Paperclip size={22} className={attachMenuOpen ? 'rotate-45 transition-transform' : 'transition-transform'} />
          </button>

          <div className="flex-1 bg-white dark:bg-[#2a3942] rounded-2xl px-3 py-1.5 flex items-end">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? 'Instância desconectada' : (attachment ? 'Legenda (opcional)' : placeholder)}
              disabled={disabled || isSending}
              rows={1}
              className="flex-1 resize-none bg-transparent text-[15px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none py-1 max-h-32 disabled:opacity-50"
            />
          </div>

          {hasText || attachment ? (
            <button type="button" onClick={handleSend} disabled={!canSendNow}
              title="Enviar (Enter)" className="w-11 h-11 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#06cf9c] disabled:opacity-40 shrink-0 shadow">
              {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          ) : (
            <button type="button" onClick={startRecording} disabled={disabled || isSending}
              title="Gravar áudio" className="w-11 h-11 rounded-full bg-[#00a884] text-white flex items-center justify-center hover:bg-[#06cf9c] disabled:opacity-40 shrink-0 shadow">
              <Mic size={20} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default MessageComposer;

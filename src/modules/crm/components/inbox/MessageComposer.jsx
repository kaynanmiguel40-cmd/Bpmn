import { useState, useRef, useEffect } from 'react';
import {
  Send, Paperclip, Loader2, Image as ImageIcon, FileText, X,
  Mic, Trash2,
} from 'lucide-react';
import { useSendCrmMessage } from '../../hooks/useCrmQueries';
import { uploadCrmMedia, detectMediaType } from '../../lib/uploadCrmMedia';
import { toast } from '../../../../contexts/ToastContext';

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

export function MessageComposer({ conversation, instanceName, disabled, placeholder = 'Mensagem' }) {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState(null); // { file, preview, mediaType }
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  // gravação de voz
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
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
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast('Arquivo maior que 50MB', 'error'); return; }
    const mediaType = detectMediaType(file.type);
    const preview = (mediaType === 'image' || mediaType === 'video') ? URL.createObjectURL(file) : null;
    setAttachment({ file, preview, mediaType });
    setAttachMenuOpen(false);
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
        setRecording(false);
        setRecSeconds(0);
        if (wasCancelled || blob.size < 800) return;
        const file = new File([blob], `voz-${Date.now()}.${audioExt(type)}`, { type });
        await sendMedia({ file, mediaType: 'audio' });
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
    await sendMutation.mutateAsync({
      instanceName,
      phone:        conversation.otherPhone,
      mediaUrl:     up.url,
      mediaType:    mediaType || up.mediaType,
      mediaCaption: caption || undefined,
      contactId:    conversation.contactId || null,
      prospectId:   conversation.prospectId || null,
      dealId:       conversation.dealId || null,
      source:       'manual',
    });
    return true;
  }

  const handleSend = async () => {
    if (!canSendNow) return;
    const content = text.trim();

    if (attachment) {
      const a = attachment;
      setText('');
      setAttachment(null);
      await sendMedia({ file: a.file, mediaType: a.mediaType, caption: content || undefined });
      if (a.preview) URL.revokeObjectURL(a.preview);
      textareaRef.current?.focus();
      return;
    }

    if (!content) return;
    setText('');
    await sendMutation.mutateAsync({
      instanceName,
      phone:      conversation.otherPhone,
      content,
      contactId:  conversation.contactId || null,
      prospectId: conversation.prospectId || null,
      dealId:     conversation.dealId || null,
      source:     'manual',
    });
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
    <div className="px-3 py-2.5 bg-[#f0f2f5] dark:bg-[#202c33] border-t border-black/5 dark:border-white/5 relative">
      {/* preview de anexo */}
      {attachment && !recording && (
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
            <p className="text-[11px] text-slate-400">
              {(attachment.file.size / 1024).toFixed(0)} KB · {attachment.mediaType}
            </p>
          </div>
          <button type="button" onClick={removeAttachment} className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10" title="Remover">
            <X size={16} className="text-slate-500" />
          </button>
        </div>
      )}

      {/* menu de anexo */}
      {attachMenuOpen && !recording && (
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

      {recording ? (
        /* barra de gravação */
        <div className="flex items-center gap-3 h-11">
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
            {isSending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
          </button>
        </div>
      ) : (
        /* barra normal */
        <div className="flex items-end gap-2">
          <button type="button" onClick={() => setAttachMenuOpen((v) => !v)} disabled={disabled || isSending}
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

import { useState, useRef } from 'react';
import { Send, Paperclip, Loader2, Image as ImageIcon, FileText, X } from 'lucide-react';
import { useSendCrmMessage } from '../../hooks/useCrmQueries';
import { uploadCrmMedia } from '../../lib/uploadCrmMedia';
import { toast } from '../../../../contexts/ToastContext';

/**
 * MessageComposer - Input de mensagem + anexo de mídia.
 *
 * Fluxo de mídia:
 *   1. usuario clica em Anexar -> menu (Imagem | Documento)
 *   2. file picker -> usuario escolhe arquivo
 *   3. preview + opcao de remover
 *   4. send: faz upload pro Storage -> sendMessage com mediaUrl
 *
 * Props:
 *   - conversation: { contactId?, prospectId?, otherPhone, dealId? }
 *   - disabled: bool (ex: instance desconectada)
 *   - placeholder
 */
export function MessageComposer({ conversation, disabled, placeholder = 'Mensagem...' }) {
  const [text, setText] = useState('');
  const [attachment, setAttachment] = useState(null);  // { file, preview, mediaType }
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);
  const imageInputRef = useRef(null);
  const docInputRef = useRef(null);
  const sendMutation = useSendCrmMessage();

  const canSend = !disabled
    && !uploading
    && !!conversation?.otherPhone
    && (text.trim().length > 0 || !!attachment);

  const handleFileSelect = (e, mediaType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validação tamanho
    if (file.size > 50 * 1024 * 1024) {
      toast('Arquivo maior que 50MB', 'error');
      return;
    }

    const preview = mediaType === 'image' ? URL.createObjectURL(file) : null;
    setAttachment({ file, preview, mediaType });
    setAttachMenuOpen(false);
    e.target.value = '';  // reset pra permitir mesmo arquivo de novo
  };

  const removeAttachment = () => {
    if (attachment?.preview) URL.revokeObjectURL(attachment.preview);
    setAttachment(null);
  };

  const handleSend = async () => {
    if (!canSend) return;

    let mediaPayload = {};
    if (attachment) {
      setUploading(true);
      const prefix = conversation.contactId
        ? `contact-${conversation.contactId.slice(0, 8)}`
        : conversation.prospectId
        ? `prospect-${conversation.prospectId.slice(0, 8)}`
        : 'general';
      const up = await uploadCrmMedia(attachment.file, { prefix });
      setUploading(false);
      if (!up.ok) {
        toast(`Falha no upload: ${up.error}`, 'error');
        return;
      }
      mediaPayload = {
        mediaUrl: up.url,
        mediaType: up.mediaType,
        mediaCaption: text.trim() || undefined,
      };
    }

    const content = text.trim();
    setText('');
    removeAttachment();

    await sendMutation.mutateAsync({
      phone:      conversation.otherPhone,
      content:    mediaPayload.mediaUrl ? undefined : content,
      ...mediaPayload,
      contactId:  conversation.contactId || null,
      prospectId: conversation.prospectId || null,
      dealId:     conversation.dealId || null,
      source:     'manual',
    });
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isSending = uploading || sendMutation.isPending;

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 relative">
      {/* Preview do anexo */}
      {attachment && (
        <div className="mb-2 flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-md p-2 border border-slate-200 dark:border-slate-700">
          {attachment.preview ? (
            <img src={attachment.preview} alt="preview" className="w-12 h-12 rounded object-cover" />
          ) : (
            <FileText size={32} className="text-slate-500 shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-slate-800 dark:text-slate-100 truncate">{attachment.file.name}</p>
            <p className="text-[10px] text-slate-400">
              {(attachment.file.size / 1024).toFixed(1)} KB
              {' · '}
              {attachment.mediaType}
            </p>
          </div>
          <button
            type="button"
            onClick={removeAttachment}
            className="p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700"
            title="Remover anexo"
          >
            <X size={16} className="text-slate-500" />
          </button>
        </div>
      )}

      {/* Menu anexar */}
      {attachMenuOpen && (
        <div className="absolute bottom-16 left-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-lg overflow-hidden z-10">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 w-full"
          >
            <ImageIcon size={16} className="text-emerald-500" /> Imagem
          </button>
          <button
            type="button"
            onClick={() => docInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 w-full"
          >
            <FileText size={16} className="text-blue-500" /> Documento
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          disabled
          title="Envio de mídia requer WAHA Plus (upgrade da Evolution API)"
          className="p-2 rounded-md text-slate-300 dark:text-slate-600 cursor-not-allowed"
        >
          <Paperclip size={18} />
        </button>

        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => handleFileSelect(e, 'image')}
          className="hidden"
        />
        <input
          ref={docInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
          onChange={(e) => handleFileSelect(e, 'document')}
          className="hidden"
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Instância desconectada' : (attachment ? 'Adicionar legenda (opcional)...' : placeholder)}
          disabled={disabled || isSending}
          rows={1}
          className="flex-1 resize-none rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 max-h-32 focus:outline-none focus:ring-2 focus:ring-fyness-primary disabled:opacity-50"
          style={{ minHeight: 38 }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend}
          className="p-2 rounded-md bg-fyness-primary text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          title="Enviar (Enter)"
        >
          {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
        Enter envia · Shift+Enter quebra linha · Anexo disponível com WAHA Plus
      </p>
    </div>
  );
}

export default MessageComposer;

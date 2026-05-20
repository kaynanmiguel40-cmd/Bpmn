import { useState, useRef } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { useSendCrmMessage } from '../../hooks/useCrmQueries';

/**
 * MessageComposer - Input de mensagem com Enter/Shift+Enter.
 *
 * Props:
 *   - conversation: { contactId?, prospectId?, otherPhone, dealId? }
 *   - disabled: bool (ex: instance desconectada)
 *   - placeholder
 */
export function MessageComposer({ conversation, disabled, placeholder = 'Mensagem...' }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);
  const sendMutation = useSendCrmMessage();

  const canSend = !disabled && text.trim().length > 0 && !!conversation?.otherPhone;

  const handleSend = async () => {
    if (!canSend) return;
    const content = text.trim();
    setText('');
    await sendMutation.mutateAsync({
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
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-3">
      <div className="flex items-end gap-2">
        <button
          type="button"
          disabled
          title="Anexar (em breve)"
          className="p-2 rounded-md text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-not-allowed opacity-50"
        >
          <Paperclip size={18} />
        </button>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Instância desconectada' : placeholder}
          disabled={disabled || sendMutation.isPending}
          rows={1}
          className="flex-1 resize-none rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 px-3 py-2 max-h-32 focus:outline-none focus:ring-2 focus:ring-fyness-primary disabled:opacity-50"
          style={{ minHeight: 38 }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!canSend || sendMutation.isPending}
          className="p-2 rounded-md bg-fyness-primary text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
          title="Enviar (Enter)"
        >
          {sendMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </div>
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Enter envia · Shift+Enter quebra linha</p>
    </div>
  );
}

export default MessageComposer;

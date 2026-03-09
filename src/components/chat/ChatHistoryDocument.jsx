import { useOSComments, useMemberAvatars, useTeamMembers } from '../../hooks/queries';
import { shortName } from '../../lib/teamService';
import { namesMatch } from '../../lib/kpiUtils';
import { parseRichText } from './chatUtils';
import ChatAvatar from './ChatAvatar';

// ==================== HELPERS ====================

function formatFullDateTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function RichTextPrint({ text, mentions }) {
  const segments = parseRichText(text, mentions);
  return (
    <span>
      {segments.map((seg, i) => {
        if (seg.type === 'link') {
          return <a key={i} href={seg.href} className="text-blue-600 underline">{seg.value}</a>;
        }
        if (seg.type === 'mention') {
          return <span key={i} className="font-semibold text-blue-600">{seg.value}</span>;
        }
        return <span key={i}>{seg.value}</span>;
      })}
    </span>
  );
}

// ==================== MAIN COMPONENT ====================

export default function ChatHistoryDocument({ order, onClose }) {
  const { data: messages = [], isLoading } = useOSComments(order.id);
  const { data: teamMembers = [] } = useTeamMembers();
  const { data: avatarMap = {} } = useMemberAvatars(teamMembers);

  const getMember = (name) => teamMembers.find(m => namesMatch(m.name, name));
  const getColor = (name) => getMember(name)?.color || '#64748b';
  const getAuthUserId = (name, msgUserId) => {
    if (msgUserId) return msgUserId;
    return getMember(name)?.authUserId || null;
  };

  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[9998] overflow-auto">
      {/* Top bar (hidden on print) */}
      <div className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center gap-3 print:hidden">
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex-1">
          Historico de Conversas
        </h2>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir
        </button>
      </div>

      {/* Document */}
      <div className="max-w-3xl mx-auto px-8 py-8 print:max-w-none print:px-12">
        {/* Header */}
        <div className="text-center mb-8 border-b-2 border-slate-300 pb-6">
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 print:text-black">
            Historico de Conversas
          </h1>
          <p className="text-sm text-slate-500 mt-2 print:text-gray-600">
            OS #{order.code || order.id?.slice(0, 8)} — {order.title}
          </p>
          <p className="text-xs text-slate-400 mt-1 print:text-gray-500">
            {messages.length} mensagens • Gerado em {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        {/* Messages */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm">
            Nenhuma mensagem nesta OS.
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-3 items-start">
                {/* Avatar */}
                <div className="flex-shrink-0 print:hidden">
                  <ChatAvatar
                    userName={msg.userName}
                    userColor={getColor(msg.userName)}
                    authUserId={getAuthUserId(msg.userName, msg.userId)}
                    avatarMap={avatarMap}
                    size="w-8 h-8"
                  />
                </div>

                {/* Print avatar (initial only) */}
                <div className="hidden print:flex w-8 h-8 rounded-full bg-gray-300 items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {(msg.userName || '?')[0].toUpperCase()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 print:text-black">
                      {shortName(msg.userName)}
                    </span>
                    <span className="text-[11px] text-slate-400 print:text-gray-500">
                      {formatFullDateTime(msg.createdAt)}
                    </span>
                  </div>

                  {/* Text */}
                  {msg.content && (
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap break-words print:text-black">
                      <RichTextPrint text={msg.content} mentions={msg.mentions} />
                    </p>
                  )}

                  {/* Attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.attachments.map((att) => (
                        <div key={att.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden print:border-gray-300">
                          {att.type === 'image' ? (
                            <img src={att.data} alt={att.label} className="max-w-[200px] max-h-[150px] object-cover" />
                          ) : (
                            <div className="px-3 py-2 text-xs text-slate-500 flex items-center gap-1.5">
                              <span>📎</span>
                              <span>{att.label}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 pt-6 border-t-2 border-slate-300 text-center text-xs text-slate-400 print:text-gray-500">
          Documento gerado automaticamente pelo sistema Fyness OS
        </div>
      </div>
    </div>
  );
}

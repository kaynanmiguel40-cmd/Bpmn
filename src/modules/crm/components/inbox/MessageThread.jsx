import { useEffect, useRef, useMemo, Component } from 'react';
import { Link } from 'react-router-dom';
import { Phone, ExternalLink, MessageSquare, Lock, AlertTriangle } from 'lucide-react';
import { useCrmConversation, useMarkConversationAsRead, useCrmWhatsAppInstances } from '../../hooks/useCrmQueries';
import { numberIdentity, numberLabel, UNKNOWN_COLOR } from './numberIdentity';
import { MessageBubble } from './MessageBubble';

/**
 * Isola cada balão: se UMA mensagem tem dado que quebra a renderização, mostra um
 * placeholder discreto em vez de derrubar a conversa inteira (tela branca).
 */
class BubbleBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error) { console.error('[MessageBubble] falha ao renderizar mensagem:', error); }
  render() {
    if (this.state.failed) {
      return (
        <div className="flex justify-center my-1">
          <span className="text-[12px] text-slate-500 dark:text-slate-400 italic px-2 py-0.5 rounded bg-black/5 dark:bg-white/5">
            mensagem não pôde ser exibida
          </span>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * MessageThread - Painel direito do Inbox (estilo WhatsApp).
 * Props: conversation, instanceName?, children (composer)
 */

function dayLabel(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const today = new Date();
  const yest = new Date(); yest.setDate(today.getDate() - 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return 'Hoje';
  if (sameDay(d, yest)) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function Avatar({ url, name, color, size = 40 }) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {url ? (
        <img
          src={url}
          alt={name}
          referrerPolicy="no-referrer"
          onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
          className="w-full h-full rounded-full object-cover bg-slate-200 dark:bg-slate-700"
        />
      ) : null}
      <div
        className={`absolute inset-0 rounded-full items-center justify-center text-white font-semibold ${url ? 'hidden' : 'flex'}`}
        style={{ backgroundColor: color || '#6366f1', fontSize: size * 0.4 }}
      >
        {name?.[0]?.toUpperCase() || '?'}
      </div>
    </div>
  );
}

/**
 * Cabecalho da conversa aberta.
 *
 * Alem de quem e o lead, ele responde a pergunta que decide se a mensagem sai
 * pelo chip certo: POR QUAL NUMERO estou respondendo. Ate agora essa informacao
 * nao existia em lugar nenhum da tela — e com as threads separadas por numero,
 * o mesmo lead aparece duas vezes na lista, entao nao da pra deduzir pelo nome.
 */
function ThreadHeader({ conversation, numero }) {
  const detailLink = conversation.contactId ? `/crm/contacts/${conversation.contactId}` : null;
  const telHref = conversation.otherPhone ? `tel:+${String(conversation.otherPhone).replace(/\D/g, '')}` : null;
  const semCadastro = !!conversation.prospectId && !conversation.contactId;

  return (
    <div className="relative h-16 bg-[#f0f2f5] dark:bg-[#202c33] px-4 flex items-center justify-between shrink-0 border-b border-black/5 dark:border-white/5">
      {/* Mesma cor da faixa da linha na lista — e o que ensina o codigo sem
          precisar de legenda. */}
      <span className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: numero.cor }} />
      <div className="flex items-center gap-3 min-w-0">
        <Avatar url={conversation.avatarUrl} name={conversation.otherName || conversation.otherPhone} color={conversation.avatarColor} size={40} />
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight flex items-center gap-2">
            <span className="truncate">{conversation.otherName || conversation.otherPhone}</span>
            {/* Herda a tag "novo" que saiu da lista, mas no lugar onde ela e
                acionavel: aqui voce olha antes de responder. Na lista ela so
                aparecia quando NAO havia mensagem nova — o oposto do util. */}
            {semCadastro && (
              <span className="text-[10px] uppercase font-bold tracking-wide text-orange-500 shrink-0">
                sem cadastro
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {conversation.otherPhone && <span>{conversation.otherPhone}</span>}
            {conversation.otherPhone && ' · '}
            {numero.certo ? (
              // "via", nunca "pelo": o rotulo sai de um nome de instancia
              // arbitrario e nao da pra inferir genero — "pelo Lorena" iria pro ar.
              <span style={{ color: numero.cor }} className="font-semibold">via {numero.rotulo}</span>
            ) : (
              // Nao inventa. Um rotulo confiante aqui desligaria a desconfianca
              // justamente no caminho (deep-link antigo, conversa sem historico)
              // em que o envio pode sair pelo chip errado.
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                número não definido{numero.rotulo ? `, deve sair via ${numero.rotulo}` : ''}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {telHref && (
          <a href={telHref} title="Ligar"
            className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10">
            <Phone size={18} />
          </a>
        )}
        {detailLink && (
          <Link to={detailLink} title="Ver detalhes do contato"
            className="p-2 rounded-full text-slate-500 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/10">
            <ExternalLink size={18} />
          </Link>
        )}
      </div>
    </div>
  );
}

function DateChip({ label }) {
  return (
    <div className="flex justify-center my-3">
      <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300 bg-white/90 dark:bg-[#182229] px-3 py-1 rounded-md shadow-sm uppercase tracking-wide">
        {label}
      </span>
    </div>
  );
}

function ThreadEmpty() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-[#f0f2f5] dark:bg-[#161e23]">
      <div className="w-20 h-20 rounded-full bg-[#00a884]/10 flex items-center justify-center mb-4">
        <MessageSquare size={36} className="text-[#00a884]" />
      </div>
      <h3 className="text-lg font-medium text-slate-600 dark:text-slate-200 mb-1">WhatsApp do CRM</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
        Escolha uma conversa à esquerda pra acompanhar e responder seus leads.
      </p>
      <p className="flex items-center gap-1 text-[12px] text-slate-400 mt-6">
        <Lock size={11} /> Conversas sincronizadas via Evolution API
      </p>
    </div>
  );
}

export function MessageThread({ conversation, children, onReply }) {
  const scrollRef = useRef(null);
  const markReadMutation = useMarkConversationAsRead();
  const { data: instances = [] } = useCrmWhatsAppInstances();

  /**
   * Por qual numero da empresa esta conversa responde.
   *
   * `certo` distingue "eu sei" de "eu chutei". Quando a conversa nao carrega
   * instancia — deep-link antigo, conversa sem historico — o envio cai no
   * fallback da primeira instancia conectada, que pode ser o chip errado. O
   * cabecalho precisa dizer isso em vez de exibir um nome confiante.
   */
  const numero = useMemo(() => {
    const ident = numberIdentity(instances);
    const daConversa = conversation?.instanceId
      ? instances.find((i) => i.id === conversation.instanceId)
      : null;
    const usada = daConversa
      || instances.find((i) => i.status === 'connected')
      || instances[0]
      || null;
    const cor = usada?.phoneNumber ? (ident.byPhone.get(usada.phoneNumber)?.color || UNKNOWN_COLOR) : UNKNOWN_COLOR;
    return {
      certo:  !!daConversa,
      rotulo: usada ? numberLabel(usada.instanceName) : '',
      cor:    daConversa ? cor : UNKNOWN_COLOR,
    };
  }, [instances, conversation?.instanceId]);

  const { data: messages = [], isLoading, isError, error, refetch, isFetching } = useCrmConversation({
    contactId:  conversation?.contactId,
    prospectId: conversation?.prospectId,
    instanceId: conversation?.instanceId,
    limit:      200,
  });

  // `messages.length` nao serve de gatilho: a thread carrega no maximo 200
  // mensagens, entao numa conversa que ja bateu o teto a mensagem nova entra e a
  // mais antiga sai — o comprimento fica igual e o efeito nunca dispara. A tela
  // parava de rolar e a mensagem nova ficava fora do campo de visao. O id da
  // ultima mensagem muda sempre.
  const ultimaId = messages.length ? messages[messages.length - 1].id : null;

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [ultimaId]);

  useEffect(() => {
    if (!conversation) return;
    const temNaoLida = messages.some((m) => m.direction === 'inbound' && m.status !== 'read');
    if (!temNaoLida) return;
    // Marca a conversa INTEIRA no banco, nao os ids carregados aqui: as inbound
    // anteriores a 200a mensagem nunca entram nesta lista e ficariam eternamente
    // "nao lidas", travando o badge num numero que nao zera.
    markReadMutation.mutate({
      contactId:  conversation.contactId,
      prospectId: conversation.prospectId,
      instanceId: conversation.instanceId,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation?.contactId, conversation?.prospectId, ultimaId]);

  if (!conversation) {
    return <main className="flex-1 flex flex-col min-w-0"><ThreadEmpty /></main>;
  }

  let lastDay = null;

  return (
    <main className="flex-1 flex flex-col min-w-0">
      <ThreadHeader conversation={conversation} numero={numero} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto relative bg-[#efeae2] dark:bg-[#0b141a]">
        {/* papel de parede sutil */}
        <div className="absolute inset-0 pointer-events-none block dark:hidden"
          style={{ backgroundImage: 'radial-gradient(rgba(0,0,0,0.045) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute inset-0 pointer-events-none hidden dark:block"
          style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        <div className="relative px-3 md:px-10 lg:px-16 py-4 min-h-full flex flex-col justify-end">
          {isLoading ? (
            <div className="text-center text-sm text-slate-500 py-8">Carregando mensagens…</div>
          ) : isError ? (
            // Nunca dizer "nenhuma mensagem ainda" quando na verdade a leitura
            // falhou: convidar o vendedor a "enviar a primeira" numa conversa que
            // ja tem historico e pior que nao mostrar nada.
            <div className="text-center py-8">
              <AlertTriangle className="mx-auto mb-2 text-amber-500" size={28} />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                Não foi possível carregar esta conversa
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                O histórico continua salvo — é a leitura que falhou.
              </p>
              {error?.message && (
                <p className="mt-2 break-words text-xs text-slate-400 dark:text-slate-500">{error.message}</p>
              )}
              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
                className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {isFetching ? 'Tentando…' : 'Tentar novamente'}
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">
              Nenhuma mensagem ainda. Envie a primeira. 👋
            </div>
          ) : (
            messages.map((m) => {
              const d = dayLabel(m.sentAt);
              const showDay = d !== lastDay;
              lastDay = d;
              return (
                <div key={m.id}>
                  {showDay && <DateChip label={d} />}
                  <BubbleBoundary><MessageBubble message={m} onReply={onReply} /></BubbleBoundary>
                </div>
              );
            })
          )}
        </div>
      </div>

      {children}
    </main>
  );
}

export default MessageThread;

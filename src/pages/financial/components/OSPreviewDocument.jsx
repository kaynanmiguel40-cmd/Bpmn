import { PRIORITIES_LIST as PRIORITIES, OS_STATUS_LABELS as STATUS_LABELS } from '../../../constants/colors';
import logoFyness from '../../../assets/logo-fyness.png';
import { formatDateTime as formatDate } from '../../../lib/formatters';
import { namesMatch, calcChecklistItemMinutes } from '../../../lib/kpiUtils';
import RichTextDisplay from './RichTextDisplay';
import { getOrderAssigneeNames } from './helpers';

export default function OSPreviewDocument({ order, projectName, profileName, profileCpf, teamMembers, allOrders = [], onConfirm, onEdit, onCancel }) {
  const priority = PRIORITIES.find(p => p.id === order.priority) || PRIORITIES[1];
  const docAttachments = order.attachments || [];
  const isEmergency = order.type === 'emergency';
  const parentOrder = isEmergency && order.parentOrderId ? allOrders.find(o => o.id === order.parentOrderId) : null;

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={onCancel} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Cancelar
        </button>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Pre-visualizacao
          </span>
          <button onClick={onEdit} className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors font-medium">
            Editar
          </button>
          <button onClick={onConfirm} className={`px-4 py-1.5 ${isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-green-500 hover:bg-green-600'} text-white text-sm rounded-lg transition-colors font-semibold shadow-sm flex items-center gap-2`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {isEmergency ? 'Confirmar Emergencial' : 'Confirmar Ordem'}
          </button>
        </div>
      </div>

      {/* Documento */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          {/* Faixa de preview */}
          <div className={`${isEmergency ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gradient-to-r from-amber-400 to-amber-500'} px-6 py-2 rounded-t-xl flex items-center gap-2`}>
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-white text-xs font-bold">
              {isEmergency ? 'EMERGENCIAL — Revise os dados antes de confirmar' : 'RASCUNHO — Revise os dados antes de confirmar'}
            </span>
          </div>

          {/* Cabecalho do documento */}
          <div className="border-b-2 border-slate-800 dark:border-slate-400 p-8 pb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <img src={logoFyness} alt="Fyness" className="w-12 h-12 object-contain" />
                <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">FYNESS</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Gestao de Processos</p>
                </div>
              </div>
              <div className="text-right">
                {isEmergency ? (
                  <>
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 uppercase">Emergencial</h2>
                    <p className="text-3xl font-black text-red-600 dark:text-red-400 mt-1">EMG-{String(order.emergencyNumber || 0).padStart(3, '0')}</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 print:text-slate-800">ORDEM DE SERVICO</h2>
                    <p className="text-3xl font-black text-fyness-primary mt-1">#{String(order.number).padStart(3, '0')}</p>
                  </>
                )}
                {projectName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Projeto: {projectName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Vinculo emergencial no preview */}
          {isEmergency && parentOrder && (
            <div className="bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800/50 px-6 py-3 flex items-center gap-2">
              <svg className="w-4 h-4 text-red-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <span className="text-sm text-red-600 dark:text-red-400">Originada da</span>
              <span className="text-sm font-bold text-red-700 dark:text-red-300">O.S. #{parentOrder.number} — {parentOrder.title}</span>
            </div>
          )}

          {/* Info grid */}
          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700">
            <div className="p-4 border-r border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</label>
              <div className="mt-1">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  {STATUS_LABELS[order.status]}
                </span>
              </div>
            </div>
            <div className="p-4">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Prioridade</label>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${priority.color}`}>
                  <span className={`w-2 h-2 rounded-full ${priority.dot}`} />
                  {priority.label}
                </span>
              </div>
            </div>
          </div>

          {order.estimatedEnd && (
          <div className="border-b border-slate-200 dark:border-slate-700">
            <div className="p-4">
              <label className="text-[10px] font-semibold text-blue-500 uppercase tracking-wider">Previsao de Entrega</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{formatDate(order.estimatedEnd)}</p>
            </div>
          </div>
          )}

          {(order.client || order.location) && (
          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700">
            <div className="p-4 border-r border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Cliente / Solicitante</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{order.client || '-'}</p>
            </div>
            <div className="p-4">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Local / Ambiente</label>
              <p className="text-sm text-slate-800 dark:text-slate-100 mt-1 font-medium">{order.location || '-'}</p>
            </div>
          </div>
          )}

          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-slate-700">
            <div className="p-4 border-r border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Atribuido a</label>
              {getOrderAssigneeNames(order).length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {getOrderAssigneeNames(order).map((name, i) => {
                    const m3 = teamMembers.find(tm => namesMatch(tm.name, name));
                    return (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: m3?.color || '#3b82f6' }}>{(name || '?')[0]}</div>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-100">{name}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 italic">Ninguem</p>
              )}
            </div>
            <div className="p-4">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Pego por</label>
              <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 italic">Aguardando confirmacao</p>
            </div>
          </div>

          {/* Titulo */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Titulo do Servico</label>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">{order.title}</h3>
          </div>

          {/* Descricao */}
          {order.description && (
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Descricao do Servico</label>
              <RichTextDisplay content={order.description} className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed" />
            </div>
          )}

          {/* Bloco de Tarefas (somente visualizacao — blocos colapsaveis) */}
          {(order.checklist || []).length > 0 && (() => {
            const cl = order.checklist || [];
            const doneCount = cl.filter(i => i.done).length;
            const realDuration = (item) => calcChecklistItemMinutes(item);
            const totalTime = cl.reduce((sum, i) => sum + realDuration(i), 0);
            const fmtTime = (min) => {
              if (!min || min <= 0) return '';
              if (min < 60) return `${Math.round(min)}min`;
              const h = Math.floor(min / 60);
              const m = Math.round(min % 60);
              return m > 0 ? `${h}h ${m}min` : `${h}h`;
            };
            const fmtHour = (iso) => {
              if (!iso) return '';
              const d = new Date(iso);
              return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            };
            const groupOrder = [];
            const groupMap = new Map();
            cl.forEach(item => {
              const key = item.group || '__ungrouped__';
              if (!groupMap.has(key)) { groupMap.set(key, []); groupOrder.push(key); }
              groupMap.get(key).push(item);
            });
            const getGrpOutput = (groupKey) => {
              const grpItems = cl.filter(i => (i.group || '__ungrouped__') === groupKey);
              const firstItem = grpItems[0];
              const base = firstItem?.groupOutput || { text: '', links: [], files: [] };
              const legacyLinks = grpItems.flatMap(i => i.output?.links || []);
              const legacyFiles = grpItems.flatMap(i => i.output?.files || []);
              const legacyText = grpItems.map(i => i.output?.text || '').filter(Boolean).join('\n');
              return { text: base.text || legacyText, links: [...(base.links || []), ...legacyLinks], files: [...(base.files || []), ...legacyFiles] };
            };
            return (
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Bloco de Tarefas</label>
                  <div className="flex items-center gap-3">
                    {totalTime > 0 && <span className="text-[10px] text-slate-400 dark:text-slate-500">Total: {fmtTime(totalTime)}</span>}
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{doneCount}/{cl.length}</span>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full mb-3 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${(doneCount / cl.length) * 100}%` }} />
                </div>
                <div className="space-y-2">
                  {groupOrder.map(groupKey => {
                    const groupItems = groupMap.get(groupKey);
                    const isGrouped = groupKey !== '__ungrouped__';
                    const groupDone = groupItems.filter(i => i.done).length;
                    const allGroupDone = groupDone === groupItems.length;
                    const groupTime = groupItems.reduce((sum, i) => sum + realDuration(i), 0);
                    const grpOutput = getGrpOutput(groupKey);
                    const hasAttachments = (grpOutput.links?.length > 0) || (grpOutput.files?.length > 0) || grpOutput.text;
                    return (
                      <div key={groupKey} className={`rounded-xl overflow-hidden border ${
                        allGroupDone ? 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50/30 dark:bg-emerald-900/10' :
                        'border-slate-200 dark:border-slate-700/60 bg-slate-50/50 dark:bg-slate-800/30'
                      }`}>
                        <div className="flex items-center gap-2.5 px-3 py-2.5">
                          {isGrouped ? (
                            <svg className={`w-4 h-4 shrink-0 ${allGroupDone ? 'text-emerald-500' : 'text-indigo-500 dark:text-indigo-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                          )}
                          <span className={`text-xs font-semibold flex-1 ${allGroupDone ? 'text-emerald-700 dark:text-emerald-300' : 'text-indigo-700 dark:text-indigo-300'}`}>
                            {isGrouped ? groupKey : 'Tarefas'}
                          </span>
                          {groupTime > 0 && <span className="text-[10px] text-slate-400 dark:text-slate-500">{fmtTime(groupTime)}</span>}
                          {hasAttachments && (
                            <span className="flex items-center gap-0.5 text-[10px] text-violet-500 dark:text-violet-400">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                              {(grpOutput.links?.length || 0) + (grpOutput.files?.length || 0)}
                            </span>
                          )}
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${allGroupDone ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                            {groupDone}/{groupItems.length}
                          </span>
                          {allGroupDone && (
                            <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          )}
                        </div>
                        <div className="border-t border-slate-200/60 dark:border-slate-700/40 px-2 py-1.5 space-y-1">
                          {groupItems.map((item) => {
                            const arrIdx = cl.findIndex(i => i.id === item.id);
                            return (
                              <div key={item.id} className="flex items-center gap-2 px-2.5 py-2 flex-wrap">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${item.done ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                  {item.done && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className="text-xs text-slate-400 font-mono w-5 shrink-0">{arrIdx + 1}.</span>
                                <span className={`text-sm flex-1 min-w-[120px] ${item.done ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>{item.text}</span>
                                {item.assigneeName && <span className="text-[10px] font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-300 px-1.5 py-0.5 rounded shrink-0">{item.assigneeName}</span>}
                                {item.startAt && <span className="text-[10px] text-slate-400 shrink-0">início {fmtHour(item.startAt)}</span>}
                                {item.dueAt && <span className="text-[10px] text-slate-400 shrink-0">entrega {fmtHour(item.dueAt)}</span>}
                                {item.done && realDuration(item) > 0 && <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded shrink-0">{fmtTime(realDuration(item))}</span>}
                                {item.done && item.completedAt && <span className="text-[10px] text-emerald-600 shrink-0">real {fmtHour(item.completedAt)}</span>}
                              </div>
                            );
                          })}
                        </div>
                        {/* Entregaveis do bloco (somente leitura) */}
                        {hasAttachments && (
                          <div className="px-3 pb-3 pt-1 border-t border-violet-200/30 dark:border-violet-800/20">
                            <span className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">Entregaveis do Bloco</span>
                            <div className="mt-1.5 space-y-1.5">
                              {grpOutput.text && <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{grpOutput.text}</p>}
                              {(grpOutput.links || []).length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {grpOutput.links.map(link => (
                                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 px-2 py-1 bg-violet-50 dark:bg-violet-900/20 rounded-lg text-[11px] text-violet-600 dark:text-violet-400 hover:underline font-medium">
                                      <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.172 13.828a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.102 1.101" /></svg>
                                      <span className="max-w-[200px] truncate">{link.label}</span>
                                    </a>
                                  ))}
                                </div>
                              )}
                              {(grpOutput.files || []).length > 0 && (
                                <div className="space-y-1.5">
                                  {grpOutput.files.filter(f => f.type === 'image').length > 0 && (
                                    <div className="grid grid-cols-3 gap-1.5">
                                      {grpOutput.files.filter(f => f.type === 'image').map(f => (
                                        <div key={f.id}><img src={f.data} alt={f.label} className="w-full h-20 object-cover rounded-lg border border-violet-200 dark:border-violet-800/50" /><p className="text-[9px] text-slate-400 mt-0.5 truncate">{f.label}</p></div>
                                      ))}
                                    </div>
                                  )}
                                  {grpOutput.files.filter(f => f.type === 'document').map(f => (
                                    <div key={f.id} className="flex items-center gap-2 px-2 py-1.5 bg-violet-50 dark:bg-violet-900/20 rounded-lg">
                                      <svg className="w-3.5 h-3.5 text-violet-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                                      <a href={f.data} download={f.label} className="text-[11px] text-violet-600 dark:text-violet-400 hover:underline font-medium flex-1 truncate">{f.label}</a>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* No preview nao tem painel de assinaturas — a O.S. ainda nao foi
              criada, ninguem pode "Pegar". Aparece apenas no documento real. */}

          {order.notes && (
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-amber-50/50 dark:bg-amber-900/10">
              <label className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Observacoes</label>
              <RichTextDisplay content={order.notes} className="text-sm text-slate-700 dark:text-slate-200 mt-2 leading-relaxed" />
            </div>
          )}

          {/* Anexos */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <label className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Anexos</label>
            {docAttachments.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic mt-2">Sem anexos.</p>
            ) : (
              <div className="mt-3 space-y-3">
                {docAttachments.filter(a => a.type === 'link').length > 0 && (
                  <div className="space-y-1.5">
                    {docAttachments.filter(a => a.type === 'link').map(att => (
                      <div key={att.id} className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="text-sm text-blue-600 font-medium truncate">{att.label}</span>
                      </div>
                    ))}
                  </div>
                )}
                {docAttachments.filter(a => a.type === 'image').length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {docAttachments.filter(a => a.type === 'image').map(att => (
                      <div key={att.id}>
                        <img src={att.data} alt={att.label} className="w-full h-32 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">{att.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rodape */}
          <div className="bg-slate-50 dark:bg-slate-800/50 px-8 py-3 text-center border-t border-slate-200 dark:border-slate-700 rounded-b-xl">
            <p className="text-[10px] text-slate-400 dark:text-slate-500">Fyness - Gestao de Processos Empresariais | Rascunho gerado em {formatDate(new Date().toISOString())}</p>
          </div>
        </div>
      </div>

      {/* Botao fixo no rodape */}
      <div className="mt-4 flex items-center justify-center gap-3">
        <button onClick={onCancel} className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
          Cancelar
        </button>
        <button onClick={onEdit} className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
          Editar Dados
        </button>
        <button onClick={onConfirm} className={`px-6 py-2.5 ${isEmergency ? 'bg-red-600 hover:bg-red-700' : 'bg-green-500 hover:bg-green-600'} text-white rounded-lg transition-colors text-sm font-bold shadow-md flex items-center gap-2`}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {isEmergency ? 'Confirmar Emergencial' : 'Confirmar Ordem'}
        </button>
      </div>
    </div>
  );
}

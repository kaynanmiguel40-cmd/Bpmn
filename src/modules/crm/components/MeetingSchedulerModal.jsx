/**
 * MeetingSchedulerModal — marca o dia e a hora da reuniao de um lead.
 *
 * Abre quando o lead entra na etapa de reuniao (is_meeting_stage). O vendedor
 * escolhe um dia e um horario LIVRE (expediente, fora do almoco, sem colidir com
 * o que ele ja tem). Ao confirmar, o pai (a Pipeline) move o lead e cria o
 * compromisso + os lembretes — por isso este componente so devolve o horario
 * escolhido, nao grava nada sozinho.
 *
 * Nao ha "digitar horario a mao": a reuniao tem que caber na agenda de verdade,
 * e oferecer so os slots livres impede marcar em cima de outra coisa.
 */

import { useMemo, useState, useEffect } from 'react';
import { CalendarClock, Clock, Check } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { useOwnerBusyWindows } from '../hooks/useCrmQueries';
import { montarDiasComSlots, rotuloDoDia } from '../lib/meetingDays';

const DIAS_A_MOSTRAR = 10;
const DURACAO_MIN = 60;

export function MeetingSchedulerModal({ open, onClose, deal, stageName, onConfirm, isSaving = false }) {
  // Janela de busca: de agora ate ~3 semanas (folga pra achar 10 dias uteis).
  const { fromISO, toISO } = useMemo(() => {
    const from = new Date();
    const to = new Date(from.getTime() + 24 * 86400000);
    return { fromISO: from.toISOString(), toISO: to.toISOString() };
  }, [open]); // recalcula a cada abertura

  const { data: busy = [], isLoading } = useOwnerBusyWindows({
    ownerId: deal?.ownerId || null,
    fromISO,
    toISO,
    enabled: open,
  });

  const dias = useMemo(
    () => montarDiasComSlots(busy, { dias: DIAS_A_MOSTRAR, durationMin: DURACAO_MIN }),
    [busy],
  );

  const [diaSel, setDiaSel] = useState(null);
  const [slotSel, setSlotSel] = useState(null);

  // Ao (re)abrir ou quando os dias chegam, seleciona o primeiro dia com vaga.
  useEffect(() => {
    if (!open) { setDiaSel(null); setSlotSel(null); return; }
    if (dias.length > 0) setDiaSel((atual) => atual ?? dias[0].chave);
  }, [open, dias]);

  const diaAtual = dias.find((d) => d.chave === diaSel) || null;

  const confirmar = () => {
    if (!slotSel) return;
    onConfirm?.(slotSel);
  };

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title="Marcar a reunião"
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3 w-full">
          <span className="text-[13px] text-slate-500 dark:text-slate-400 min-w-0 truncate">
            {slotSel
              ? `Reunião ${slotResumo(diaAtual, slotSel)}`
              : 'Escolha um dia e um horário'}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-3 h-9 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancelar
            </button>
            <button
              onClick={confirmar}
              disabled={!slotSel || isSaving}
              className="px-4 h-9 rounded-lg text-sm font-semibold bg-fyness-primary text-white hover:bg-fyness-secondary disabled:opacity-50 inline-flex items-center gap-1.5"
            >
              <Check size={15} /> {isSaving ? 'Marcando…' : 'Confirmar reunião'}
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-[13px] text-slate-500 dark:text-slate-400">
          <CalendarClock size={16} className="text-fyness-primary shrink-0" />
          <span className="truncate">
            {deal?.title || 'Lead'} — reunião de {DURACAO_MIN} min
            {stageName ? ` · ${stageName}` : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="py-10 text-center text-sm text-slate-400">Carregando horários livres…</div>
        ) : dias.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
            Sem horário livre nos próximos dias. Libere um compromisso na Agenda e tente de novo.
          </div>
        ) : (
          <>
            {/* Dias com vaga */}
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Dia
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {dias.map((d) => {
                  const ativo = d.chave === diaSel;
                  return (
                    <button
                      key={d.chave}
                      onClick={() => { setDiaSel(d.chave); setSlotSel(null); }}
                      className={`shrink-0 px-3 py-2 rounded-xl border text-sm transition-colors ${
                        ativo
                          ? 'border-fyness-primary bg-fyness-primary/10 text-fyness-primary font-semibold'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-fyness-primary/40'
                      }`}
                    >
                      <div className="whitespace-nowrap">{rotuloDoDia(d.data)}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {d.slots.length} {d.slots.length === 1 ? 'horário' : 'horários'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Horarios do dia escolhido */}
            {diaAtual && (
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                  <Clock size={13} /> Horário
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 max-h-52 overflow-y-auto">
                  {diaAtual.slots.map((s) => {
                    const ativo = s.iso === slotSel;
                    return (
                      <button
                        key={s.iso}
                        onClick={() => setSlotSel(s.iso)}
                        className={`h-10 rounded-lg border text-sm font-medium transition-colors ${
                          ativo
                            ? 'border-fyness-primary bg-fyness-primary text-white'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-fyness-primary hover:bg-fyness-primary/5'
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </CrmModal>
  );
}

function slotResumo(dia, iso) {
  if (!dia || !iso) return '';
  const t = new Date(iso);
  const hh = String(t.getHours()).padStart(2, '0');
  const mm = String(t.getMinutes()).padStart(2, '0');
  return `${rotuloDoDia(dia.data)} às ${hh}:${mm}`;
}

export default MeetingSchedulerModal;

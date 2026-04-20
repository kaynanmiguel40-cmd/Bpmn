/**
 * ScheduleMeetingModal — Modal de agendamento de reuniao com parceiro.
 * Aparece quando um deal e arrastado para uma stage com triggers_meeting=true.
 * Cria agenda_event + crm_activity + atualiza deal.
 */

import { useState, useRef, useEffect } from 'react';
import { Calendar, Clock, MapPin, FileText, Loader2 } from 'lucide-react';
import { useSchedulePartnerMeeting } from '../hooks/useCrmQueries';

export function ScheduleMeetingModal({ open, onClose, dealId, dealTitle, dealCity }) {
  const scheduleMutation = useSchedulePartnerMeeting();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const dateRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    setDate('');
    setTime('09:00');
    setCity(dealCity || '');
    setNotes('');
    const timer = setTimeout(() => dateRef.current?.focus(), 100);
    return () => clearTimeout(timer);
  }, [open, dealCity]);

  if (!open) return null;

  const handleConfirm = async () => {
    if (!date || !time) return;
    try {
      await scheduleMutation.mutateAsync({
        dealId,
        meetingData: { date, time, notes, city },
      });
      onClose();
    } catch {
      // toast de erro ja exibido pelo hook onError
    }
  };

  const isPending = scheduleMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => !isPending && onClose()}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl w-full max-w-md mx-4 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
            <Calendar size={20} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Agendar Reuniao</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">{dealTitle}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-3 mb-5">
          {/* Data */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              <Calendar size={12} />
              Data da Reuniao *
            </label>
            <input
              ref={dateRef}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Hora */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              <Clock size={12} />
              Horario
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Cidade */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              <MapPin size={12} />
              Cidade
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex: Sao Paulo, Rio de Janeiro..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Observacoes */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              <FileText size={12} />
              Observacoes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Notas sobre a reuniao..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Info */}
        <p className="text-[11px] text-slate-500 dark:text-slate-500 mb-4">
          Sera criado um evento na agenda de todos os gestores (socios) do time.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending || !date}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            {isPending && <Loader2 size={14} className="animate-spin" />}
            Agendar Reuniao
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScheduleMeetingModal;

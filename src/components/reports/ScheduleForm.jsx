import { useState, useEffect } from 'react';
import {
  getSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  FREQUENCY_LABELS,
  DAY_OF_WEEK_LABELS,
} from '../../lib/reportScheduleService';

/**
 * ScheduleForm - Gerenciamento de agendamentos de relatorios
 *
 * Permite criar, editar e excluir schedules de relatorio.
 */
export function ScheduleForm({ members = [] }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form state
  const [frequency, setFrequency] = useState('weekly');
  const [dayOfWeek, setDayOfWeek] = useState(1); // Segunda
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [recipients, setRecipients] = useState('');
  const [filterMember, setFilterMember] = useState('all');

  useEffect(() => {
    loadSchedules();
  }, []);

  async function loadSchedules() {
    const data = await getSchedules();
    setSchedules(data);
    setLoading(false);
  }

  function resetForm() {
    setFrequency('weekly');
    setDayOfWeek(1);
    setDayOfMonth(1);
    setRecipients('');
    setFilterMember('all');
    setEditId(null);
    setShowForm(false);
  }

  async function handleSave() {
    const recipientsList = recipients
      .split(',')
      .map(e => e.trim())
      .filter(e => e.includes('@'));

    const data = {
      frequency,
      dayOfWeek: frequency === 'weekly' ? dayOfWeek : null,
      dayOfMonth: frequency === 'monthly' ? dayOfMonth : null,
      recipients: recipientsList,
      filterMember,
      isActive: true,
    };

    if (editId) {
      await updateSchedule(editId, data);
    } else {
      await createSchedule(data);
    }

    resetForm();
    loadSchedules();
  }

  function handleEdit(schedule) {
    setEditId(schedule.id);
    setFrequency(schedule.frequency);
    setDayOfWeek(schedule.dayOfWeek || 1);
    setDayOfMonth(schedule.dayOfMonth || 1);
    setRecipients((schedule.recipients || []).join(', '));
    setFilterMember(schedule.filterMember || 'all');
    setShowForm(true);
  }

  async function handleDelete(id) {
    await deleteSchedule(id);
    loadSchedules();
  }

  async function handleToggle(schedule) {
    await updateSchedule(schedule.id, { isActive: !schedule.isActive });
    loadSchedules();
  }

  function getScheduleLabel(s) {
    if (s.frequency === 'weekly') {
      return `${FREQUENCY_LABELS.weekly} - ${DAY_OF_WEEK_LABELS[s.dayOfWeek || 0]}`;
    }
    return `${FREQUENCY_LABELS.monthly} - Dia ${s.dayOfMonth || 1}`;
  }

  if (loading) {
    return <div className="animate-pulse h-24 bg-slate-100 dark:bg-slate-700 rounded-xl" />;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Relatorios Agendados</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Receba relatorios automaticamente por email</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Agendamento
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 border border-slate-200 dark:border-slate-600 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Frequencia */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Frequencia</label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </select>
            </div>

            {/* Dia */}
            {frequency === 'weekly' ? (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Dia da Semana</label>
                <select
                  value={dayOfWeek}
                  onChange={e => setDayOfWeek(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {DAY_OF_WEEK_LABELS.map((label, i) => (
                    <option key={i} value={i}>{label}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Dia do Mes</label>
                <input
                  type="number"
                  min="1"
                  max="28"
                  value={dayOfMonth}
                  onChange={e => setDayOfMonth(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Colaborador */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Colaborador</label>
              <select
                value={filterMember}
                onChange={e => setFilterMember(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Toda a Equipe</option>
                {members.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
              </select>
            </div>

            {/* Destinatarios */}
            <div>
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1">Destinatarios (emails)</label>
              <input
                type="text"
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                placeholder="email@empresa.com, outro@empresa.com"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={resetForm}
              className="px-3 py-1.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editId ? 'Atualizar' : 'Criar Agendamento'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {schedules.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-slate-400 dark:text-slate-500">Nenhum agendamento configurado</p>
        </div>
      ) : (
        <div className="space-y-2">
          {schedules.map(s => (
            <div key={s.id} className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-colors ${
              s.isActive
                ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-700/50 opacity-60'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  s.isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                }`}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{getScheduleLabel(s)}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {s.filterMember === 'all' ? 'Toda equipe' : s.filterMember}
                    {s.recipients?.length > 0 && ` · ${s.recipients.length} destinatario(s)`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggle(s)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    s.isActive ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                  title={s.isActive ? 'Desativar' : 'Ativar'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                      s.isActive
                        ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                        : 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z'
                    } />
                  </svg>
                </button>
                <button
                  onClick={() => handleEdit(s)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  title="Editar"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default ScheduleForm;

import { useState, useEffect, useMemo } from 'react';
import { getOSOrders } from '../../lib/osService';
import { getAgendaEvents } from '../../lib/agendaService';
import { getTeamMembers } from '../../lib/teamService';
import { generateReport, generateAllReports, getReportPreview } from '../../lib/reportGenerator';
import { formatCurrency } from '../../lib/kpiUtils';
import { useToast } from '../../contexts/ToastContext';
import { ScheduleForm } from '../../components/reports/ScheduleForm';

function toInputDate(date) {
  return date.toISOString().split('T')[0];
}

export default function ReportPage() {
  const { addToast } = useToast();

  // Data padrão: primeiro dia do mês atual → hoje
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return toInputDate(new Date(d.getFullYear(), d.getMonth(), 1));
  });
  const [endDate, setEndDate] = useState(() => toInputDate(new Date()));
  const [filterMember, setFilterMember] = useState('all');
  const [generating, setGenerating] = useState(false);
  const [generatingAll, setGeneratingAll] = useState(false);

  // Dados
  const [orders, setOrders] = useState([]);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [o, e, m] = await Promise.all([
          getOSOrders(),
          getAgendaEvents(),
          getTeamMembers(),
        ]);
        setOrders(o || []);
        setEvents(e || []);
        setMembers(m || []);
      } catch (err) {
        addToast('Erro ao carregar dados', 'error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Preview dos KPIs
  const preview = useMemo(() => {
    if (orders.length === 0 && events.length === 0) return null;
    return getReportPreview({
      orders, events, members,
      startDate, endDate, filterMember,
      targetHours: 176,
    });
  }, [orders, events, members, startDate, endDate, filterMember]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const result = generateReport({
        orders, events, members,
        startDate, endDate, filterMember,
        targetHours: 176,
      });
      addToast(`Relatorio gerado: ${result.fileName}`, 'success');
    } catch (err) {
      addToast('Erro ao gerar relatorio PDF', 'error');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (members.length === 0) {
      addToast('Nenhum membro da equipe cadastrado', 'warning');
      return;
    }
    setGeneratingAll(true);
    try {
      const result = generateAllReports({
        orders, events, members,
        startDate, endDate,
        targetHours: 176,
      });
      addToast(`${result.count} relatorios gerados em: ${result.fileName}`, 'success');
    } catch (err) {
      addToast('Erro ao gerar relatorios completos', 'error');
      console.error(err);
    } finally {
      setGeneratingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Relatorios</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Gere relatorios de performance em PDF com filtro por periodo e colaborador.</p>
      </div>

      {/* Filtros */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Filtros do Relatorio</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Data Início */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Data Inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600"
            />
          </div>

          {/* Data Fim */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Data Fim</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600"
            />
          </div>

          {/* Membro */}
          <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Colaborador</label>
            <select
              value={filterMember}
              onChange={e => setFilterMember(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600"
            >
              <option value="all">Toda a Equipe</option>
              {members.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preview KPIs */}
      {preview && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Preview dos Indicadores</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard label="O.S. no Periodo" value={preview.ordersCount} />
            <KPICard label="Concluidas" value={preview.doneCount} color="text-emerald-600" />
            <KPICard label="Em Andamento" value={preview.kpis.inProgress} color="text-blue-600" />
            <KPICard label="Eventos" value={preview.eventsCount} color="text-purple-600" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <KPICard label="Taxa Conclusao" value={`${preview.kpis.completionRate}%`} />
            <KPICard label="No Prazo" value={`${preview.kpis.onTimeRate}%`} color="text-emerald-600" />
            <KPICard label="Produtividade" value={`${preview.kpis.productivityMonth}%`} color="text-blue-600" />
            <KPICard label="Retrabalho" value={`${preview.kpis.reworkRate}%`} color="text-amber-600" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <KPICard label="T. Medio Entrega" value={`${preview.kpis.avgDelivery}d`} />
            <KPICard label="Presenca Reunioes" value={`${preview.kpis.meetingAttendance}%`} />
            <KPICard label="Pontualidade" value={`${preview.kpis.meetingPunctuality}%`} />
            <KPICard label="Custo Total" value={formatCurrency(preview.totalCost)} color="text-red-600" />
          </div>
        </div>
      )}

      {/* Botoes Gerar */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <button
          onClick={handleGenerateAll}
          disabled={generatingAll || generating}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm dark:bg-slate-600 dark:hover:bg-slate-500"
        >
          {generatingAll ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Gerando Todos...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Gerar Todos (Equipe + Individual)
            </>
          )}
        </button>
        <button
          onClick={handleGenerate}
          disabled={generating || generatingAll}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Gerar Relatorio PDF
            </>
          )}
        </button>
      </div>

      {/* Agendamentos */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        <ScheduleForm members={members} />
      </div>
    </div>
  );
}

function KPICard({ label, value, color = 'text-slate-800 dark:text-slate-100' }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
      <p className={`text-xl font-bold mt-1 ${color}`}>{value}</p>
    </div>
  );
}

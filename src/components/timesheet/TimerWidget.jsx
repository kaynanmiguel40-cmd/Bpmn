import { useState, useEffect, useCallback, useRef } from 'react';
import { startTimer, stopTimer, getEntriesForOrder } from '../../lib/timeEntryService';

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function TimerWidget({ orderId, userName = 'Voce', compact = false, onUpdate }) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeEntryId, setActiveEntryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  // Verificar se existe entry ativa
  useEffect(() => {
    (async () => {
      const entries = await getEntriesForOrder(orderId);
      const active = entries.find(e => !e.endTime);
      if (active) {
        setActiveEntryId(active.id);
        setIsRunning(true);
        startTimeRef.current = new Date(active.startTime);
      }
    })();
  }, [orderId]);

  // Timer tick
  useEffect(() => {
    if (isRunning && startTimeRef.current) {
      intervalRef.current = setInterval(() => {
        const now = new Date();
        const diffSeconds = Math.floor((now - startTimeRef.current) / 1000);
        setElapsed(diffSeconds);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const handleStart = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const entry = await startTimer(orderId, userName);
    if (entry) {
      setActiveEntryId(entry.id);
      setIsRunning(true);
      startTimeRef.current = new Date(entry.startTime);
      setElapsed(0);
    }
    setLoading(false);
  }, [orderId, userName, loading]);

  const handleStop = useCallback(async () => {
    if (loading || !activeEntryId) return;
    setLoading(true);
    await stopTimer(activeEntryId);
    setIsRunning(false);
    setActiveEntryId(null);
    setElapsed(0);
    startTimeRef.current = null;
    if (onUpdate) onUpdate();
    setLoading(false);
  }, [activeEntryId, loading, onUpdate]);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5">
        {isRunning ? (
          <>
            <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-medium">{formatDuration(elapsed)}</span>
            <button
              onClick={handleStop}
              disabled={loading}
              className="p-1 rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
              </svg>
            </button>
          </>
        ) : (
          <button
            onClick={handleStart}
            disabled={loading}
            className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors disabled:opacity-50"
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
      <div className={`text-lg font-mono font-bold ${isRunning ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
        {formatDuration(elapsed)}
      </div>

      <div className="flex items-center gap-1">
        {isRunning ? (
          <button
            onClick={handleStop}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
            </svg>
            Parar
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            Iniciar
          </button>
        )}
      </div>

      {isRunning && (
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
        </span>
      )}
    </div>
  );
}

export default TimerWidget;

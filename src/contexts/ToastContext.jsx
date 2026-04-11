import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((msgOrObj, typeArg = 'info') => {
    const isObject = typeof msgOrObj === 'object' && msgOrObj !== null;
    const message = isObject ? msgOrObj.message : msgOrObj;
    const type = isObject ? (msgOrObj.type || 'info') : typeArg;
    const undoCallback = isObject ? msgOrObj.undoCallback : undefined;
    const duration = isObject ? (msgOrObj.duration || 4000) : 4000;
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, undoCallback }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast, undo: (message, undoCallback) => addToast({ type: 'undo', message, undoCallback, duration: 8000 }) }}>
      {children}
      {/* Toast container */}
      {toasts.length > 0 && (
        <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
          {toasts.map(toast => (
            <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

const TOAST_STYLES = {
  success: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200',
  error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200',
  warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200',
  info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-200',
  undo: 'bg-indigo-600 dark:bg-indigo-700 border-indigo-500 dark:border-indigo-600 text-white',
};

const TOAST_ICONS = {
  success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  warning: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z',
  info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  undo: 'M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4',
};

function Toast({ toast, onClose }) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-lg border shadow-lg animate-slide-in ${TOAST_STYLES[toast.type] || TOAST_STYLES.info}`}
    >
      <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={TOAST_ICONS[toast.type] || TOAST_ICONS.info} />
      </svg>
      <p className="text-sm flex-1">{toast.message}</p>
      {toast.type === 'undo' && toast.undoCallback && (
        <button
          onClick={() => { toast.undoCallback(); onClose(); }}
          className="ml-2 px-2 py-0.5 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded transition-colors"
        >
          Desfazer
        </button>
      )}
      <button onClick={onClose} className="shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback silencioso caso usado fora do provider (ex: serviceFactory)
    return { addToast: () => {}, undo: () => {} };
  }
  return ctx;
}

// Singleton para uso fora de componentes (ex: serviceFactory)
let globalAddToast = null;

export function setGlobalToast(fn) {
  globalAddToast = fn;
}

export function toast(message, type = 'info') {
  if (globalAddToast) {
    globalAddToast(message, type);
  }
}

toast.info = (message) => toast(message, 'info');
toast.success = (message) => toast(message, 'success');
toast.warning = (message) => toast(message, 'warning');
toast.error = (message) => toast(message, 'error');
toast.undo = (message, undoCallback) => {
  if (globalAddToast) {
    globalAddToast({ type: 'undo', message, undoCallback, duration: 8000 });
  }
};

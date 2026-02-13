import { useState, useEffect, useRef } from 'react';

export function DependencySelector({ orders = [], selected = [], onChange, currentOrderId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  // Filtrar ordens disponiveis (excluir a propria ordem)
  const available = orders.filter(o =>
    o.id !== currentOrderId &&
    (search.length < 2 || o.title.toLowerCase().includes(search.toLowerCase()) || String(o.number).includes(search))
  );

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDep = (orderId) => {
    const next = selected.includes(orderId)
      ? selected.filter(id => id !== orderId)
      : [...selected, orderId];
    onChange(next);
  };

  const selectedOrders = orders.filter(o => selected.includes(o.id));

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
        Dependencias
      </label>

      {/* Selected chips */}
      <div
        className="min-h-[38px] flex flex-wrap gap-1 p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        {selectedOrders.length === 0 ? (
          <span className="text-sm text-slate-400 dark:text-slate-500">Nenhuma dependencia</span>
        ) : (
          selectedOrders.map(o => (
            <span
              key={o.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded"
            >
              #{o.number} {o.title.slice(0, 20)}
              <button
                onClick={(e) => { e.stopPropagation(); toggleDep(o.id); }}
                className="hover:text-blue-900 dark:hover:text-blue-200"
              >
                x
              </button>
            </span>
          ))
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 max-h-48 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-100 dark:border-slate-700">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar O.S...."
              autoFocus
              className="w-full px-3 py-1.5 text-sm border border-slate-200 dark:border-slate-600 rounded bg-white dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div className="overflow-y-auto">
            {available.length === 0 ? (
              <div className="px-4 py-3 text-xs text-slate-400 dark:text-slate-500 text-center">Nenhuma O.S. encontrada</div>
            ) : (
              available.slice(0, 20).map(o => (
                <button
                  key={o.id}
                  onClick={() => toggleDep(o.id)}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 text-sm transition-colors ${
                    selected.includes(o.id)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <input type="checkbox" checked={selected.includes(o.id)} readOnly className="w-3.5 h-3.5 rounded" />
                  <span className="font-medium">#{o.number}</span>
                  <span className="truncate">{o.title}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DependencySelector;

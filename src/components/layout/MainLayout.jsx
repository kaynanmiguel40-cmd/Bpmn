/**
 * MainLayout - Layout principal do Company OS
 *
 * Estrutura:
 * - Sidebar (navegacao)
 * - Header (breadcrumb, acoes)
 * - Main (conteudo da pagina)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
// Auth desabilitado temporariamente
// import { useAuth } from '../../contexts/AuthContext';

// Mapa de titulos por rota
const routeTitles = {
  '/dashboard': 'Dashboard',
  '/sales': 'Processos',
  '/sales/editor': 'Editor de Fluxo',
  '/routine': 'Minha Rotina',
  '/agenda': 'Agenda',
  '/financial': 'Ordens de Servico',
  '/settings': 'Configuracoes'
};

// Icone de notificacao
const BellIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

// Icone de busca
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

function searchLocalStorage(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  const results = [];

  // Buscar em O.S.
  try {
    const orders = JSON.parse(localStorage.getItem('os_orders') || '[]');
    orders.forEach(o => {
      if (
        (o.title && o.title.toLowerCase().includes(q)) ||
        (o.client && o.client.toLowerCase().includes(q)) ||
        (o.description && o.description.toLowerCase().includes(q)) ||
        (o.number && String(o.number).includes(q))
      ) {
        results.push({ type: 'os', label: `O.S. #${o.number} - ${o.title}`, sub: o.client || 'Sem cliente', route: '/financial', id: o.id });
      }
    });
  } catch {}

  // Buscar em Agenda
  try {
    const events = JSON.parse(localStorage.getItem('agenda_events') || '[]');
    events.forEach(e => {
      if (
        (e.title && e.title.toLowerCase().includes(q)) ||
        (e.description && e.description.toLowerCase().includes(q))
      ) {
        results.push({ type: 'event', label: e.title, sub: e.description || '', route: '/agenda', id: e.id });
      }
    });
  } catch {}

  return results.slice(0, 8);
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  const handleSearch = useCallback((value) => {
    setSearchQuery(value);
    if (value.length >= 2) {
      setSearchResults(searchLocalStorage(value));
      setShowResults(true);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, []);

  const handleResultClick = (result) => {
    setSearchQuery('');
    setShowResults(false);
    navigate(result.route);
  };

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determinar titulo baseado na rota
  const getTitle = () => {
    for (const [path, title] of Object.entries(routeTitles)) {
      if (location.pathname === path || location.pathname.startsWith(path + '/')) {
        return title;
      }
    }
    return 'Dashboard';
  };

  // Gerar breadcrumb
  const getBreadcrumb = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.map((part, index) => {
      const path = '/' + parts.slice(0, index + 1).join('/');
      const title = routeTitles[path] || part.charAt(0).toUpperCase() + part.slice(1);
      return { path, title };
    });
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      {/* Breadcrumb */}
      <div>
        <nav className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Inicio</span>
          {breadcrumb.map((item, index) => (
            <span key={item.path} className="flex items-center gap-2">
              <span className="text-slate-300">/</span>
              <span className={index === breadcrumb.length - 1 ? 'text-slate-800 font-medium' : 'text-slate-500'}>
                {item.title}
              </span>
            </span>
          ))}
        </nav>
        <h1 className="text-xl font-semibold text-slate-800">{getTitle()}</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block" ref={searchRef}>
          <input
            type="text"
            placeholder="Buscar O.S., eventos..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => { if (searchQuery.length >= 2) setShowResults(true); }}
            className="w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </div>

          {/* Dropdown de resultados */}
          {showResults && (
            <div className="absolute top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">Nenhum resultado para &ldquo;{searchQuery}&rdquo;</div>
              ) : (
                searchResults.map((r, i) => (
                  <button
                    key={`${r.type}-${r.id}-${i}`}
                    onClick={() => handleResultClick(r)}
                    className="w-full px-4 py-2.5 text-left hover:bg-slate-50 flex items-center gap-3 transition-colors border-b border-slate-100 last:border-b-0"
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${r.type === 'os' ? 'bg-fyness-primary' : 'bg-amber-500'}`}>
                      {r.type === 'os' ? 'OS' : 'AG'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-800 truncate">{r.label}</div>
                      <div className="text-[11px] text-slate-400 truncate">{r.sub}</div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export function MainLayout() {
  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;

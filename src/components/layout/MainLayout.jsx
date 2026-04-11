/**
 * MainLayout - Layout principal do Company OS
 *
 * Estrutura:
 * - Sidebar (navegacao)
 * - Header (breadcrumb, acoes, theme toggle)
 * - Main (conteudo da pagina)
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { NotificationBell } from '../notifications/NotificationBell';
import { GlobalSearch } from '../search/GlobalSearch';
import { useDeadlineChecker } from '../../hooks/useDeadlineChecker';
import { searchAll } from '../../lib/searchService';

// Mapa de titulos por rota
const routeTitles = {
  '/dashboard': 'Dashboard',
  '/sales': 'Processos',
  '/sales/editor': 'Editor de Fluxo',
  '/routine': 'Minha Rotina',
  '/agenda': 'Agenda',
  '/financial': 'Ordens de Servico',
  '/eap': 'EAP - Projetos',
  '/reports': 'Relatorios',
  '/my-day': 'Meu Dia',
  '/settings': 'Configuracoes'
};

// Icone de busca
const SearchIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SunIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

// Header search now uses the centralized searchAll from searchService (Supabase)

function Header({ onMenuToggle, mobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showAllResults, setShowAllResults] = useState(false);
  const searchRef = useRef(null);
  const debounceTimerRef = useRef(null);

  const MAX_RESULTS = 8;

  // Debounce: atrasa a busca real por 300ms apos o usuario parar de digitar
  useEffect(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [searchQuery]);

  // Reset "mostrar mais" quando a busca muda
  useEffect(() => {
    setShowAllResults(false);
  }, [searchQuery]);

  // Executar busca quando o termo debounced muda
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchAll(debouncedQuery).then(data => {
        setSearchResults(data);
        setShowResults(true);
      });
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  }, [debouncedQuery]);

  const handleSearchInput = useCallback((value) => {
    setSearchQuery(value);
    if (value.length < 2) {
      setSearchResults([]);
      setShowResults(false);
    }
  }, []);

  const handleResultClick = (result) => {
    setSearchQuery('');
    setShowResults(false);
    navigate(result.route);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getTitle = () => {
    for (const [path, title] of Object.entries(routeTitles)) {
      if (location.pathname === path || location.pathname.startsWith(path + '/')) {
        return title;
      }
    }
    return 'Dashboard';
  };

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
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 flex items-center justify-between">
      {/* Mobile menu + Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Hamburger - mobile only */}
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden"
          aria-label="Abrir menu"
          aria-expanded={mobileOpen}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="hidden md:block">
          <nav className="flex items-center gap-2 text-sm">
            <span className="text-slate-400 dark:text-slate-500">Inicio</span>
            {breadcrumb.map((item, index) => (
              <span key={item.path} className="flex items-center gap-2">
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className={index === breadcrumb.length - 1 ? 'text-slate-800 dark:text-slate-100 font-medium' : 'text-slate-500 dark:text-slate-400'}>
                  {item.title}
                </span>
              </span>
            ))}
          </nav>
          <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">{getTitle()}</h1>
        </div>
        <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 md:hidden">{getTitle()}</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block" ref={searchRef}>
          <input
            type="search"
            role="searchbox"
            aria-label="Buscar ordens de servico e eventos"
            placeholder="Buscar O.S., eventos..."
            value={searchQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            onFocus={() => { if (searchQuery.length >= 2) setShowResults(true); }}
            className="w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent text-sm"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            <SearchIcon />
          </div>
          {!searchQuery && (
            <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-100 dark:bg-slate-700 dark:text-slate-500 rounded border border-slate-200 dark:border-slate-600">⌘K</kbd>
          )}

          {showResults && (
            <div role="listbox" aria-label="Resultados da busca" className="absolute top-full mt-1 left-0 right-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
              {searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 dark:text-slate-500 text-center">Nenhum resultado para &ldquo;{searchQuery}&rdquo;</div>
              ) : (
                <>
                  {(showAllResults ? searchResults : searchResults.slice(0, MAX_RESULTS)).map((r, i) => (
                    <button
                      key={`${r.type}-${r.id}-${i}`}
                      role="option"
                      onClick={() => handleResultClick(r)}
                      className="w-full px-4 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 transition-colors border-b border-slate-100 dark:border-slate-700 last:border-b-0"
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-[10px] font-bold shrink-0 ${r.type === 'os' ? 'bg-fyness-primary' : 'bg-amber-500'}`}>
                        {r.type === 'os' ? 'OS' : 'AG'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{r.label}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{r.sub}</div>
                      </div>
                    </button>
                  ))}
                  {searchResults.length > MAX_RESULTS && !showAllResults && (
                    <button
                      onClick={() => setShowAllResults(true)}
                      className="w-full px-4 py-2 text-xs text-center text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      Mostrar mais {searchResults.length - MAX_RESULTS} resultados
                    </button>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <NotificationBell />

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDark ? 'Modo claro' : 'Modo escuro'}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
        </button>
      </div>
    </header>
  );
}

export function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Verificacao periodica de prazos e atrasos
  useDeadlineChecker();

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 print:block print:bg-white">
      {/* Sidebar */}
      <div className="print:hidden">
        <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        {/* Header */}
        <div className="print:hidden">
          <Header onMenuToggle={() => setMobileMenuOpen(true)} mobileOpen={mobileMenuOpen} />
        </div>

        {/* Page Content */}
        <main role="main" aria-label="Conteudo principal" className="flex-1 overflow-auto p-6 print:p-0 print:overflow-visible">
          <Outlet />
        </main>
      </div>

      {/* Global Search (Cmd+K) */}
      <GlobalSearch />
    </div>
  );
}

export default MainLayout;

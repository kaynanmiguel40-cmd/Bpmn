/**
 * MainLayout - Layout principal do Company OS
 *
 * Estrutura:
 * - Sidebar (navegacao)
 * - Header (breadcrumb, acoes)
 * - Main (conteudo da pagina)
 */

import { Outlet, useLocation } from 'react-router-dom';
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
  '/financial': 'Gestao Financeira',
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

function Header() {
  const location = useLocation();
  // Auth desabilitado temporariamente
  // const { profile } = useAuth();

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
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Buscar..."
            className="w-64 pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <SearchIcon />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </div>
        </div>

        {/* Quick Actions */}
        <button className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova O.S.
        </button>
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

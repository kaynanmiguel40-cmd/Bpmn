/**
 * CrmLayout - Layout principal do modulo CRM
 *
 * Estrutura:
 * - CrmSidebar (navegacao interna)
 * - CrmTopbar (breadcrumb, acoes)
 * - Main (conteudo da pagina via Outlet)
 *
 * Responsivo: sidebar vira drawer no mobile.
 */

import { useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Search, Bell, Moon, Sun } from 'lucide-react';
import { CrmSidebar } from './CrmSidebar';
import { useTheme } from '../../../../contexts/ThemeContext';
import { useCrmRealtime } from '../../hooks/useCrmRealtime';

// Mapa de titulos CRM
const crmRouteTitles = {
  '/crm': 'Dashboard',
  '/crm/pipeline': 'Pipeline',
  '/crm/deals': 'Negocios',
  '/crm/contacts': 'Contatos',
  '/crm/companies': 'Empresas',
  '/crm/activities': 'Atividades',
  '/crm/proposals': 'Propostas',
  '/crm/reports': 'Relatorios',
  '/crm/forecast': 'Forecast',
  '/crm/traffic': 'Trafego Pago',
  '/crm/prospects': 'Gerador de Lista',
  '/crm/settings': 'Configuracoes',
};

function CrmTopbar({ onToggleMobileMenu }) {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const getTitle = () => {
    for (const [path, title] of Object.entries(crmRouteTitles)) {
      if (location.pathname === path || location.pathname.startsWith(path + '/')) {
        return title;
      }
    }
    return 'CRM';
  };

  const getBreadcrumb = () => {
    const parts = location.pathname.split('/').filter(Boolean);
    return parts.map((part, index) => {
      const path = '/' + parts.slice(0, index + 1).join('/');
      const title = crmRouteTitles[path] || part.charAt(0).toUpperCase() + part.slice(1);
      return { path, title };
    });
  };

  const breadcrumb = getBreadcrumb();

  return (
    <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/50 px-4 md:px-6 flex items-center justify-between shrink-0">
      {/* Left: Mobile menu + Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <span>CRM</span>
            {breadcrumb.slice(1).map((item, index) => (
              <span key={item.path} className="flex items-center gap-1.5">
                <span className="text-slate-300 dark:text-slate-600">/</span>
                <span className={index === breadcrumb.length - 2 ? 'text-slate-700 dark:text-slate-300 font-medium' : ''}>
                  {item.title}
                </span>
              </span>
            ))}
          </nav>
          <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100 leading-tight">{getTitle()}</h1>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          aria-label={isDark ? 'Modo claro' : 'Modo escuro'}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}

export function CrmLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Ativar Realtime para todas as tabelas CRM
  useCrmRealtime({ enabled: true });

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev);
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <CrmSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-64 h-full">
            <CrmSidebar />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-3 right-3 p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-700"
              aria-label="Fechar menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <CrmTopbar onToggleMobileMenu={toggleMobileMenu} />

        <main
          role="main"
          aria-label="Conteudo CRM"
          className="flex-1 overflow-auto p-4 md:p-6"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default CrmLayout;

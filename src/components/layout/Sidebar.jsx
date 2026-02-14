/**
 * Sidebar - Navegacao principal do Company OS
 *
 * Features:
 * - Navegacao baseada em permissoes
 * - Indicador de rota ativa
 * - Collapse/Expand
 * - Avatar e menu do usuario
 */

import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile } from '../../lib/profileService';
import logoFyness from '../../assets/logo-fyness.png';

// Icones SVG
const DashboardIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const SalesIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const KanbanIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const AgendaIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const FinancialIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
  </svg>
);

const ReportIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const CollapseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
  </svg>
);

const ExpandIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
  </svg>
);

// Item de navegacao
function NavItem({ to, icon: Icon, label, isCollapsed, badge }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <NavLink
      to={to}
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
        ${isActive
          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
        }
        ${isCollapsed ? 'justify-center' : ''}
      `}
      title={isCollapsed ? label : undefined}
    >
      <Icon />
      {!isCollapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge && (
            <span className="px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full">
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export function Sidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profile, setProfile] = useState({});

  // Carregar perfil do Supabase na montagem
  const loadProfile = async () => {
    const p = await getProfile();
    setProfile(p);
  };

  useEffect(() => { loadProfile(); }, []);

  // Atualizar perfil quando salvo (custom event)
  useEffect(() => {
    const handleUpdate = () => loadProfile();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('profile-updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('profile-updated', handleUpdate);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
      className={`
        flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 h-screen sticky top-0
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo/Header */}
      <div className="h-16 flex items-center justify-center px-4 border-b border-slate-200 dark:border-slate-700">
        {isCollapsed ? (
          <img src={logoFyness} alt="Fyness" className="w-8 h-8 object-contain" />
        ) : (
          <div className="flex items-center gap-2">
            <img src={logoFyness} alt="Fyness" className="w-8 h-8 object-contain" />
            <span className="font-bold text-slate-800 dark:text-slate-100">Fyness OS</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto" role="navigation" aria-label="Menu principal">
        {/* Dashboard */}
        <NavItem
          to="/dashboard"
          icon={DashboardIcon}
          label="Dashboard"
          isCollapsed={isCollapsed}
        />

        {/* Ordens de Servico */}
        <NavItem
          to="/financial"
          icon={FinancialIcon}
          label="Ordens de Servico"
          isCollapsed={isCollapsed}
        />

        {/* Agenda */}
        <NavItem
          to="/agenda"
          icon={AgendaIcon}
          label="Agenda"
          isCollapsed={isCollapsed}
        />

        {/* Minha Rotina */}
        <NavItem
          to="/routine"
          icon={KanbanIcon}
          label="Minha Rotina"
          isCollapsed={isCollapsed}
        />

        {/* Separador */}
        <div className="my-4 border-t border-slate-200 dark:border-slate-700" />

        {/* Processos */}
        <NavItem
          to="/sales"
          icon={SalesIcon}
          label="Processos"
          isCollapsed={isCollapsed}
        />

        {/* Relatorios */}
        <NavItem
          to="/reports"
          icon={ReportIcon}
          label="Relatorios"
          isCollapsed={isCollapsed}
        />

        {/* Configuracoes */}
        <NavItem
          to="/settings"
          icon={SettingsIcon}
          label="Configuracoes"
          isCollapsed={isCollapsed}
        />
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-700">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            aria-label="Menu do usuario"
            aria-expanded={showUserMenu}
            aria-haspopup="true"
            className={`
              w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors
              ${isCollapsed ? 'justify-center' : ''}
            `}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-medium shrink-0">
                {(profile.name || 'U').charAt(0).toUpperCase()}
              </div>
            )}
            {!isCollapsed && (
              <div className="flex-1 text-left">
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">
                  {profile.name || 'Sem nome'}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {profile.role || 'Sem cargo'}
                </div>
              </div>
            )}
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className={`
              absolute bottom-full mb-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg py-1 z-50
              ${isCollapsed ? 'left-0' : 'left-0 right-0'}
            `}>
              <button
                onClick={() => { setShowUserMenu(false); navigate('/settings'); }}
                className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Meu Perfil
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
              >
                <LogoutIcon />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

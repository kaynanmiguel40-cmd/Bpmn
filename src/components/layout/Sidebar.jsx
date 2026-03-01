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
import {
  DashboardIcon, SalesIcon, KanbanIcon, AgendaIcon,
  FinancialIcon, ReportIcon, EapIcon, CrmIcon,
  SettingsIcon, LogoutIcon, CollapseIcon, ExpandIcon,
} from '../icons/NavIcons';

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

// Icone de pin/fixar
const PinIcon = ({ pinned }) => (
  <svg className="w-4 h-4" fill={pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d={pinned
        ? 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'
        : 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z'}
    />
  </svg>
);

export function Sidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isPinned, setIsPinned] = useState(() => {
    try { return localStorage.getItem('sidebar-pinned') === 'true'; } catch { return false; }
  });
  const [isCollapsed, setIsCollapsed] = useState(() => !isPinned);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [profile, setProfile] = useState({});

  const togglePin = () => {
    const next = !isPinned;
    setIsPinned(next);
    setIsCollapsed(!next);
    try { localStorage.setItem('sidebar-pinned', String(next)); } catch {}
  };

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
      onMouseEnter={() => { if (!isPinned) setIsCollapsed(false); }}
      onMouseLeave={() => { if (!isPinned) setIsCollapsed(true); }}
      className={`
        flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 h-screen sticky top-0
        ${isCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      {/* Logo/Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
        {isCollapsed ? (
          <img src={logoFyness} alt="Fyness" className="w-8 h-8 object-contain mx-auto" />
        ) : (
          <>
            <div className="flex items-center gap-2">
              <img src={logoFyness} alt="Fyness" className="w-8 h-8 object-contain" />
              <span className="font-bold text-slate-800 dark:text-slate-100">Fyness OS</span>
            </div>
            <button
              onClick={togglePin}
              title={isPinned ? 'Desafixar menu' : 'Fixar menu aberto'}
              className={`p-1.5 rounded-lg transition-colors ${
                isPinned
                  ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                  : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <PinIcon pinned={isPinned} />
            </button>
          </>
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

        {/* EAP - Gantt */}
        <NavItem
          to="/eap"
          icon={EapIcon}
          label="EAP"
          isCollapsed={isCollapsed}
        />

        {/* Separador */}
        <div className="my-4 border-t border-slate-200 dark:border-slate-700" />

        {/* CRM */}
        <NavItem
          to="/crm"
          icon={CrmIcon}
          label="CRM"
          isCollapsed={isCollapsed}
          badge={isCollapsed ? undefined : 'Novo'}
        />

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

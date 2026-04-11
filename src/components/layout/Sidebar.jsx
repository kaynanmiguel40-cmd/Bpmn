/**
 * Sidebar - Navegacao principal do Company OS
 *
 * Features:
 * - Navegacao baseada em permissoes
 * - Indicador de rota ativa
 * - Collapse/Expand
 * - Avatar e menu do usuario
 * - Mobile: overlay com hamburger toggle
 */

import { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile } from '../../lib/profileService';
import { supabase } from '../../lib/supabase';
import logoFyness from '../../assets/logo-fyness.png';
import {
  DashboardIcon, SalesIcon, KanbanIcon, AgendaIcon,
  FinancialIcon, ReportIcon, EapIcon, CrmIcon,
  SettingsIcon, LogoutIcon, CollapseIcon, ExpandIcon,
} from '../icons/NavIcons';

// Item de navegacao
function NavItem({ to, icon: Icon, label, isCollapsed, badge, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <NavLink
      to={to}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
        ${isActive
          ? 'bg-fyness-primary/15 dark:bg-fyness-primary/20 text-fyness-primary dark:text-blue-400 font-medium border-l-[3px] border-fyness-primary'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
        }
        ${isCollapsed ? 'justify-center' : ''}
      `}
      title={isCollapsed ? label : undefined}
    >
      <span className="relative">
        <Icon />
        {badge && isCollapsed && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {badge > 9 ? '9+' : badge}
          </span>
        )}
      </span>
      {!isCollapsed && (
        <>
          <span className="flex-1">{label}</span>
          {badge && (
            <span className="min-w-[20px] h-5 px-1.5 text-[11px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
              {badge > 99 ? '99+' : badge}
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

export function Sidebar({ mobileOpen = false, onMobileClose }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Contar leads nao atendidos (deals no primeiro stage de cada pipeline)
  const { data: newLeadsCount = 0 } = useQuery({
    queryKey: ['crmNewLeadsCount'],
    queryFn: async () => {
      // Buscar todos os stages com position = 1 (primeiro stage = lead novo)
      const { data: firstStages } = await supabase
        .from('crm_pipeline_stages')
        .select('id')
        .eq('position', 1);
      if (!firstStages?.length) return 0;
      const stageIds = firstStages.map(s => s.id);
      // Contar deals ativos nesses stages
      const { count } = await supabase
        .from('crm_deals')
        .select('id', { count: 'exact', head: true })
        .in('stage_id', stageIds)
        .eq('status', 'open')
        .is('deleted_at', null);
      return count || 0;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

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

  // Fechar sidebar mobile ao navegar
  const handleNavClick = () => {
    if (onMobileClose) onMobileClose();
  };

  // No mobile, sidebar nunca fica collapsed (sempre expandida quando aberta)
  const effectiveCollapsed = mobileOpen ? false : isCollapsed;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        onMouseEnter={() => { if (!isPinned && !mobileOpen) setIsCollapsed(false); }}
        onMouseLeave={() => { if (!isPinned && !mobileOpen) setIsCollapsed(true); }}
        className={`
          flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 h-screen
          ${effectiveCollapsed ? 'w-16' : 'w-64'}
          ${mobileOpen
            ? 'fixed top-0 left-0 z-50 shadow-xl'
            : 'sticky top-0 hidden md:flex'
          }
        `}
      >
        {/* Logo/Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-700">
          {effectiveCollapsed ? (
            <img src={logoFyness} alt="Fyness" className="w-8 h-8 object-contain mx-auto" />
          ) : (
            <>
              <div className="flex items-center gap-2">
                <img src={logoFyness} alt="Fyness" className="w-8 h-8 object-contain" />
                <span className="font-bold text-slate-800 dark:text-slate-100">Fyness OS</span>
              </div>
              {/* Hide pin on mobile, show close button instead */}
              {mobileOpen ? (
                <button
                  onClick={onMobileClose}
                  aria-label="Fechar menu"
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={togglePin}
                  title={isPinned ? 'Desafixar menu' : 'Fixar menu aberto'}
                  aria-label={isPinned ? 'Desafixar menu' : 'Fixar menu'}
                  className={`p-1.5 rounded-lg transition-colors hidden md:block ${
                    isPinned
                      ? 'text-fyness-primary dark:text-blue-400 bg-fyness-primary/10 dark:bg-blue-900/30'
                      : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <PinIcon pinned={isPinned} />
                </button>
              )}
            </>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto" role="navigation" aria-label="Menu principal">
          <NavItem to="/dashboard" icon={DashboardIcon} label="Dashboard" isCollapsed={effectiveCollapsed} onClick={handleNavClick} />
          <NavItem to="/financial" icon={FinancialIcon} label="Ordens de Servico" isCollapsed={effectiveCollapsed} onClick={handleNavClick} />
          <NavItem to="/agenda" icon={AgendaIcon} label="Agenda" isCollapsed={effectiveCollapsed} onClick={handleNavClick} />
          <NavItem to="/routine" icon={KanbanIcon} label="Minha Rotina" isCollapsed={effectiveCollapsed} onClick={handleNavClick} />
          <NavItem to="/eap" icon={EapIcon} label="EAP" isCollapsed={effectiveCollapsed} onClick={handleNavClick} />

          <div className="my-4 border-t border-slate-200 dark:border-slate-700" />

          <NavItem to="/crm" icon={CrmIcon} label="CRM" isCollapsed={effectiveCollapsed} badge={newLeadsCount > 0 ? newLeadsCount : undefined} onClick={handleNavClick} />
          <NavItem to="/sales" icon={SalesIcon} label="Processos" isCollapsed={effectiveCollapsed} onClick={handleNavClick} />
          <NavItem to="/reports" icon={ReportIcon} label="Relatorios" isCollapsed={effectiveCollapsed} onClick={handleNavClick} />
          <NavItem to="/settings" icon={SettingsIcon} label="Configuracoes" isCollapsed={effectiveCollapsed} onClick={handleNavClick} />
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
                ${effectiveCollapsed ? 'justify-center' : ''}
              `}
            >
              {profile.avatar ? (
                <img src={profile.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-fyness-primary to-fyness-secondary flex items-center justify-center text-white font-medium shrink-0">
                  {(profile.name || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              {!effectiveCollapsed && (
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
                ${effectiveCollapsed ? 'left-0' : 'left-0 right-0'}
              `}>
                <button
                  onClick={() => { setShowUserMenu(false); handleNavClick(); navigate('/settings'); }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Meu Perfil
                </button>
                <button
                  onClick={handleLogout}
                  aria-label="Sair"
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
    </>
  );
}

export default Sidebar;

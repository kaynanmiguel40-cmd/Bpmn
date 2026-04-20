/**
 * CrmSidebar - Sidebar dedicada do modulo CRM
 *
 * Mesmo padrao visual da sidebar principal (Fyness OS).
 * Inclui logo Fyness, hover expand/collapse e botao pin.
 */

import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Kanban,
  Users,
  Building2,
  CalendarCheck,
  FileText,
  BarChart3,
  Settings,
  TrendingUp,
  ArrowLeft,
  Target,
  Trophy,
  Megaphone,
  Crosshair,
  Zap,
} from 'lucide-react';
import logoFyness from '../../../../assets/logo-fyness.png';

const PinIcon = ({ pinned }) => (
  <svg className="w-4 h-4" fill={pinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
    />
  </svg>
);

const crmNavItems = [
  { to: '/crm', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { section: 'Vendas' },
  { to: '/crm/pipeline', icon: Kanban, label: 'Pipeline' },
  { to: '/crm/proposals', icon: FileText, label: 'Propostas' },
  { to: '/crm/activities', icon: CalendarCheck, label: 'Atividades' },
  { section: 'Prospecao' },
  { to: '/crm/prospects', icon: Crosshair, label: 'Gerador de Lista' },
  { to: '/crm/traffic', icon: Megaphone, label: 'Trafego Pago' },
  { to: '/crm/automations', icon: Zap, label: 'Automacoes' },
  { section: 'Cadastros' },
  { to: '/crm/contacts', icon: Users, label: 'Contatos' },
  { to: '/crm/companies', icon: Building2, label: 'Empresas' },
  { section: 'Gestao' },
  { to: '/crm/goals', icon: Trophy, label: 'Metas' },
  { to: '/crm/forecast', icon: TrendingUp, label: 'Forecast' },
  { to: '/crm/reports', icon: BarChart3, label: 'Relatorios' },
  { divider: true },
  { to: '/crm/settings', icon: Settings, label: 'Configuracoes' },
];

function CrmNavItem({ to, icon: Icon, label, isCollapsed, exact }) {
  const location = useLocation();
  const isActive = exact
    ? location.pathname === to
    : location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <NavLink
      to={to}
      end={exact}
      aria-current={isActive ? 'page' : undefined}
      aria-label={label}
      className={`
        flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors duration-150
        ${isActive
          ? 'bg-fyness-primary/10 dark:bg-fyness-primary/20 text-fyness-primary dark:text-blue-400 font-medium'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
        }
        ${isCollapsed ? 'justify-center' : ''}
      `}
      title={isCollapsed ? label : undefined}
    >
      <Icon size={18} className="shrink-0" />
      {!isCollapsed && <span className="truncate">{label}</span>}
    </NavLink>
  );
}

export function CrmSidebar() {
  const navigate = useNavigate();
  const [isPinned, setIsPinned] = useState(() => {
    try { return localStorage.getItem('crm-sidebar-pinned') === 'true'; } catch { return false; }
  });
  const [isCollapsed, setIsCollapsed] = useState(() => !isPinned);

  const togglePin = () => {
    const next = !isPinned;
    setIsPinned(next);
    setIsCollapsed(!next);
    try { localStorage.setItem('crm-sidebar-pinned', String(next)); } catch {}
  };

  return (
    <aside
      onMouseEnter={() => { if (!isPinned) setIsCollapsed(false); }}
      onMouseLeave={() => { if (!isPinned) setIsCollapsed(true); }}
      className={`
        flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/60 transition-[width] duration-200 ease-out h-screen sticky top-0
        ${isCollapsed ? 'w-14' : 'w-48'}
      `}
    >
      {/* Logo Header */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-slate-200 dark:border-slate-700/60">
        {isCollapsed ? (
          <img src={logoFyness} alt="Fyness" className="w-7 h-7 object-contain mx-auto" />
        ) : (
          <>
            <div className="flex items-center gap-2 min-w-0">
              <img src={logoFyness} alt="Fyness" className="w-7 h-7 object-contain shrink-0" />
              <div className="truncate">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">Fyness</span>
                <span className="ml-1 text-[11px] font-medium text-fyness-primary">CRM</span>
              </div>
            </div>
            <button
              onClick={togglePin}
              title={isPinned ? 'Desafixar menu' : 'Fixar menu aberto'}
              className={`p-1 rounded-md transition-colors ${
                isPinned
                  ? 'text-fyness-primary dark:text-blue-400 bg-fyness-primary/10 dark:bg-blue-900/30'
                  : 'text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <PinIcon pinned={isPinned} />
            </button>
          </>
        )}
      </div>

      {/* Voltar ao Fyness */}
      <div className="px-2 pt-2 pb-0.5">
        <button
          onClick={() => navigate('/dashboard')}
          className={`
            flex items-center gap-2 w-full px-2.5 py-1 rounded-md text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors
            ${isCollapsed ? 'justify-center px-2' : ''}
          `}
          title="Voltar ao Fyness"
        >
          <ArrowLeft size={13} className="shrink-0" />
          {!isCollapsed && <span>Voltar ao Fyness</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Menu CRM">
        {crmNavItems.map((item, idx) =>
          item.divider ? (
            <div key={`div-${idx}`} className="my-2 border-t border-slate-200 dark:border-slate-700/60" />
          ) : item.section ? (
            !isCollapsed && (
              <div key={`sec-${idx}`} className="pt-3 pb-1 px-2.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {item.section}
                </span>
              </div>
            )
          ) : (
            <CrmNavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
              exact={item.exact}
            />
          )
        )}
      </nav>
    </aside>
  );
}

export default CrmSidebar;

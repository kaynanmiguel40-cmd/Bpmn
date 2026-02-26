/**
 * CrmSidebar - Sidebar dedicada do modulo CRM
 *
 * Navegacao interna do CRM com visual dark/indigo.
 * Inclui botao "Voltar ao Fyness" e icones lucide-react.
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
  ChevronLeft,
  ChevronRight,
  Target,
} from 'lucide-react';

const crmNavItems = [
  { to: '/crm', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/crm/pipeline', icon: Kanban, label: 'Pipeline' },
  { to: '/crm/deals', icon: Target, label: 'Negocios' },
  { to: '/crm/contacts', icon: Users, label: 'Contatos' },
  { to: '/crm/companies', icon: Building2, label: 'Empresas' },
  { to: '/crm/activities', icon: CalendarCheck, label: 'Atividades' },
  { to: '/crm/proposals', icon: FileText, label: 'Propostas' },
  { divider: true },
  { to: '/crm/reports', icon: BarChart3, label: 'Relatorios' },
  { to: '/crm/forecast', icon: TrendingUp, label: 'Forecast' },
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
        flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm
        ${isActive
          ? 'bg-indigo-600/20 text-indigo-300 font-medium border-l-2 border-indigo-400'
          : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200 border-l-2 border-transparent'
        }
        ${isCollapsed ? 'justify-center px-2' : ''}
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={`
        flex flex-col bg-slate-900 border-r border-slate-700/50 transition-all duration-300 h-screen sticky top-0
        ${isCollapsed ? 'w-16' : 'w-56'}
      `}
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-slate-700/50">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <Target size={14} className="text-white" />
            </div>
            <span className="font-semibold text-sm text-slate-100">CRM</span>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          aria-label={isCollapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Voltar ao Fyness */}
      <div className="px-3 pt-3 pb-1">
        <button
          onClick={() => navigate('/dashboard')}
          className={`
            flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-xs text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors
            ${isCollapsed ? 'justify-center' : ''}
          `}
          title="Voltar ao Fyness"
        >
          <ArrowLeft size={14} className="shrink-0" />
          {!isCollapsed && <span>Voltar ao Fyness</span>}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Menu CRM">
        {crmNavItems.map((item, idx) =>
          item.divider ? (
            <div key={`div-${idx}`} className="my-3 border-t border-slate-700/50" />
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

      {/* Footer */}
      <div className="px-3 py-3 border-t border-slate-700/50">
        {!isCollapsed && (
          <div className="text-[10px] text-slate-600 text-center">
            Fyness CRM v1.0
          </div>
        )}
      </div>
    </aside>
  );
}

export default CrmSidebar;

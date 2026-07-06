/**
 * CrmSidebar - Sidebar dedicada do modulo CRM
 *
 * Mesmo padrao visual da sidebar principal (Fyness OS).
 * Inclui logo Fyness, hover expand/collapse e botao pin.
 */

import { useState, useMemo } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useCrmAccess } from '../../hooks/useCrmAccess';
import {
  LayoutDashboard,
  Kanban,
  Users,
  Building2,
  CalendarDays,
  Settings,
  UserCog,
  Target,
  Trophy,
  Crosshair,
  Zap,
  PhoneCall,
  MessageCircle,
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
  { section: 'Vendas' },
  { to: '/crm/pipeline', icon: Kanban, label: 'Pipeline', sectionKey: 'pipeline' },
  // Ganhos oculto da sidebar (a rota /crm/ganhos e a página seguem ativas).
  // Pra religar: re-importe CircleDollarSign do lucide-react e adicione aqui:
  //   { to: '/crm/ganhos', icon: CircleDollarSign, label: 'Ganhos' },
  { to: '/crm/discador', icon: PhoneCall, label: 'Discador', sectionKey: 'discador' },
  { to: '/crm/inbox', icon: MessageCircle, label: 'Inbox WhatsApp', sectionKey: 'inbox' },
  { to: '/crm/agenda', icon: CalendarDays, label: 'Agenda', sectionKey: 'agenda' },
  // Atividades agora vivem dentro da Agenda — item oculto da sidebar.
  // A rota /crm/activities e a página seguem ativas (lista, filtros, editar,
  // concluir). Pra religar: re-importe CalendarCheck e adicione aqui:
  //   { to: '/crm/activities', icon: CalendarCheck, label: 'Atividades' },
  { section: 'Prospecao' },
  { to: '/crm/prospects', icon: Crosshair, label: 'Gerador de Lista', sectionKey: 'prospects' },
  // Tráfego Pago oculto por enquanto (a rota /crm/traffic e a página seguem ativas).
  // Pra religar: re-importe Megaphone do lucide-react e adicione aqui:
  //   { to: '/crm/traffic', icon: Megaphone, label: 'Trafego Pago' },
  { to: '/crm/automations', icon: Zap, label: 'Automacoes', sectionKey: 'automations' },
  { section: 'Cadastros' },
  { to: '/crm/cadastros', icon: Users, label: 'Cadastros', sectionKey: 'cadastros' },
  { section: 'Gestao' },
  { to: '/crm', icon: LayoutDashboard, label: 'Dashboard', exact: true }, // landing, sempre visível
  { to: '/crm/comparativo', icon: Target, label: 'Comparativo', sectionKey: 'comparativo' },
  { to: '/crm/goals', icon: Trophy, label: 'Metas', sectionKey: 'goals' },
  // Forecast oculto por enquanto (a rota /crm/forecast e a página seguem ativas).
  // Pra religar: re-importe TrendingUp do lucide-react e adicione aqui:
  //   { to: '/crm/forecast', icon: TrendingUp, label: 'Forecast' },
  { divider: true },
  { to: '/crm/equipe', icon: UserCog, label: 'Equipe', sectionKey: 'equipe' },
  { to: '/crm/settings', icon: Settings, label: 'Configuracoes', sectionKey: 'settings' },
];

// Remove seções bloqueadas e limpa cabeçalhos/divisores que ficaram órfãos.
function filterNavItems(items, canAccess) {
  const filtered = items.filter(it => !(it.to && it.sectionKey && !canAccess(it.sectionKey)));
  return filtered.filter((it, i) => {
    if (!it.section && !it.divider) return true;
    // mantém o cabeçalho/divisor só se houver um item de nav antes do próximo
    for (let j = i + 1; j < filtered.length; j++) {
      if (filtered[j].section || filtered[j].divider) return false;
      if (filtered[j].to) return true;
    }
    return false;
  });
}

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
          ? 'bg-fyness-primary/10 dark:bg-blue-500/15 text-fyness-primary dark:text-blue-300 font-semibold ring-1 ring-fyness-primary/20'
          : 'text-slate-600 dark:text-slate-400 hover:bg-white/70 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100'
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
  const { canAccess } = useCrmAccess();
  const navItems = useMemo(() => filterNavItems(crmNavItems, canAccess), [canAccess]);
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
        flex flex-col bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border-r border-white/60 dark:border-white/10 transition-[width] duration-200 ease-out h-screen sticky top-0
        ${isCollapsed ? 'w-14' : 'w-48'}
      `}
    >
      {/* Logo Header */}
      <div className="h-14 flex items-center justify-between px-3 border-b border-white/60 dark:border-white/10">
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

      {/* CRM-only: botão "Voltar ao Fyness" removido (o app agora é só CRM). */}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto" role="navigation" aria-label="Menu CRM">
        {navItems.map((item, idx) =>
          item.divider ? (
            <div key={`div-${idx}`} className="my-2 border-t border-white/60 dark:border-white/10" />
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

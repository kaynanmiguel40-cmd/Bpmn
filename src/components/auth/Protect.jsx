/**
 * Componente Protect - Renderiza children apenas se usuario tiver permissao
 *
 * Uso basico:
 *   <Protect permission="os.create">
 *     <button>Criar OS</button>
 *   </Protect>
 *
 * Com fallback:
 *   <Protect permission="financial.view" fallback={<p>Sem acesso</p>}>
 *     <FinancialDashboard />
 *   </Protect>
 *
 * Multiplas permissoes (OR - qualquer uma):
 *   <Protect permissions={['os.create', 'os.edit']} requireAll={false}>
 *     <button>Gerenciar</button>
 *   </Protect>
 *
 * Multiplas permissoes (AND - todas):
 *   <Protect permissions={['admin.users', 'admin.roles']} requireAll={true}>
 *     <AdminPanel />
 *   </Protect>
 *
 * Por role:
 *   <Protect roles={['admin', 'manager']}>
 *     <ManagerTools />
 *   </Protect>
 */

import { usePermissions } from '../../contexts/PermissionContext';
import { useAuth } from '../../contexts/AuthContext';

export function Protect({
  children,
  permission,        // String: permissao unica
  permissions,       // Array: multiplas permissoes
  requireAll = false, // Se true, requer TODAS as permissoes (AND). Se false, qualquer uma (OR)
  roles,             // Array: roles permitidas
  fallback = null,   // Componente alternativo se nao tiver acesso
  loading: loadingFallback = null // Componente enquanto carrega
}) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading: permLoading } = usePermissions();
  const { profile, loading: authLoading } = useAuth();

  const isLoading = permLoading || authLoading;

  // Mostrar loading state
  if (isLoading) {
    return loadingFallback;
  }

  // Verificar roles
  if (roles && roles.length > 0) {
    if (!profile?.role || !roles.includes(profile.role)) {
      return fallback;
    }
  }

  // Verificar permissao unica
  if (permission) {
    if (!hasPermission(permission)) {
      return fallback;
    }
  }

  // Verificar multiplas permissoes
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return fallback;
    }
  }

  // Passou todas as verificacoes
  return children;
}

/**
 * Componente ProtectCost - Wrapper especifico para ocultar valores monetarios
 *
 * Uso:
 *   <ProtectCost>
 *     <span>R$ 1.500,00</span>
 *   </ProtectCost>
 *
 * Com placeholder:
 *   <ProtectCost placeholder="--">
 *     {formatCurrency(task.cost)}
 *   </ProtectCost>
 */
export function ProtectCost({ children, placeholder = '***' }) {
  const { canViewCosts, loading } = usePermissions();

  if (loading) return <span className="animate-pulse">...</span>;

  if (!canViewCosts()) {
    return <span className="text-slate-400">{placeholder}</span>;
  }

  return children;
}

/**
 * Componente ProtectSalary - Wrapper especifico para ocultar salarios/valor hora
 */
export function ProtectSalary({ children, placeholder = '***' }) {
  const { canViewSalaries, loading } = usePermissions();

  if (loading) return <span className="animate-pulse">...</span>;

  if (!canViewSalaries()) {
    return <span className="text-slate-400">{placeholder}</span>;
  }

  return children;
}

export default Protect;

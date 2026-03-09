/**
 * ProtectedRoute - Protege rotas que requerem autenticacao
 *
 * Uso no App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 * Com permissao requerida:
 *   <Route element={<ProtectedRoute permission="financial.view" />}>
 *     <Route path="/financial" element={<Financial />} />
 *   </Route>
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionContext';

export function ProtectedRoute({
  permission,
  permissions,
  requireAll = false,
  roles,
  redirectTo = '/login'
}) {
  const { isAuthenticated, loading: authLoading, profile } = useAuth();
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading: permLoading } = usePermissions();
  const location = useLocation();

  const isLoading = authLoading || permLoading;

  // Mostrar loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Nao autenticado -> redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Verificar roles
  if (roles && roles.length > 0) {
    if (!profile?.role || !roles.includes(profile.role)) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Verificar permissao unica
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar multiplas permissoes
  if (permissions && permissions.length > 0) {
    const hasAccess = requireAll
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);

    if (!hasAccess) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Autorizado - renderizar rota
  return <Outlet />;
}

export default ProtectedRoute;

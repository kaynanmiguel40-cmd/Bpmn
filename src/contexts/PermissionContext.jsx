import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { detectRole } from '../lib/roleUtils';

const PermissionContext = createContext({});

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermissions deve ser usado dentro de PermissionProvider');
  }
  return context;
};

export function PermissionProvider({ children }) {
  const { user, profile, loading: authLoading } = useAuth();
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Permissoes padrao por role (fallback quando tabelas nao existem)
  // Gestor (manager) e Admin tem acesso completo ao SaaS
  const DEFAULT_PERMISSIONS = {
    admin: [
      { name: '*', module: '*' }
    ],
    member: [
      { name: 'sales.view', module: 'sales' },
      { name: 'agenda.view', module: 'agenda' },
      { name: 'agenda.edit', module: 'agenda' },
      { name: 'os.view', module: 'os' },
      { name: 'os.create', module: 'os' },
      { name: 'os.edit', module: 'os' },
    ],
  };

  // Gestor (detectRole 'manager') e admin tem acesso completo
  const isGestor = detectRole(profile) === 'manager';
  const normalizedRole = (isGestor || profile?.role === 'admin') ? 'admin' : 'member';

  // Buscar permissoes do usuario baseado no role
  const fetchPermissions = useCallback(async () => {
    if (!profile?.role) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.rpc('get_user_permissions');

      if (error || !data || data.length === 0) {
        // Usar permissoes padrao baseado no role normalizado
        setPermissions(DEFAULT_PERMISSIONS[normalizedRole] || DEFAULT_PERMISSIONS.member);
      } else {
        setPermissions(data);
      }
    } catch {
      setPermissions(DEFAULT_PERMISSIONS[normalizedRole] || DEFAULT_PERMISSIONS.member);
    } finally {
      setLoading(false);
    }
  }, [normalizedRole]);

  useEffect(() => {
    if (!authLoading) {
      fetchPermissions();
    }
  }, [authLoading, fetchPermissions]);

  const isAdmin = normalizedRole === 'admin' || permissions.some(p => p.name === '*');

  // Verificar se usuario tem uma permissao especifica
  const hasPermission = useCallback((permissionName) => {
    if (isAdmin) return true;
    return permissions.some(p =>
      p.name === permissionName ||
      p.permission_name === permissionName
    );
  }, [permissions, isAdmin]);

  // Verificar se usuario tem QUALQUER uma das permissoes
  const hasAnyPermission = useCallback((permissionNames) => {
    if (isAdmin) return true;
    return permissionNames.some(name => hasPermission(name));
  }, [hasPermission, isAdmin]);

  // Verificar se usuario tem TODAS as permissoes
  const hasAllPermissions = useCallback((permissionNames) => {
    if (isAdmin) return true;
    return permissionNames.every(name => hasPermission(name));
  }, [hasPermission, isAdmin]);

  // Verificar se pode acessar modulo
  const canAccessModule = useCallback((moduleName) => {
    if (isAdmin) return true;
    return permissions.some(p =>
      (p.module === moduleName) ||
      (p.name && p.name.startsWith(`${moduleName}.`))
    );
  }, [permissions, isAdmin]);

  // Verificar se pode ver custos financeiros
  const canViewCosts = useCallback(() => {
    return hasPermission('financial.view_costs');
  }, [hasPermission]);

  // Verificar se pode ver salarios
  const canViewSalaries = useCallback(() => {
    return hasPermission('financial.view_salaries');
  }, [hasPermission]);

  const value = {
    permissions,
    loading: loading || authLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canAccessModule,
    canViewCosts,
    canViewSalaries,
    refreshPermissions: fetchPermissions,
    // Shortcuts para modulos comuns
    canAccessSales: () => canAccessModule('sales'),
    canAccessFinancial: () => canAccessModule('financial'),
    canAccessAgenda: () => canAccessModule('agenda'),
    canAccessOS: () => canAccessModule('os')
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

export default PermissionContext;

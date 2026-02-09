import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

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

  // Buscar permissoes do usuario baseado no role
  const fetchPermissions = useCallback(async () => {
    if (!profile?.role) {
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      // Usa a funcao do Supabase para buscar permissoes
      const { data, error } = await supabase.rpc('get_user_permissions');

      if (error) {
        console.error('Erro ao buscar permissoes via RPC:', error);
        // Fallback: buscar diretamente
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('role_permissions')
          .select(`
            permission_id,
            permissions:permission_id (
              name,
              module
            )
          `)
          .eq('role', profile.role);

        if (fallbackError) throw fallbackError;

        const permissionList = fallbackData?.map(rp => ({
          name: rp.permissions.name,
          module: rp.permissions.module
        })) || [];

        setPermissions(permissionList);
      } else {
        setPermissions(data || []);
      }
    } catch (err) {
      console.error('Erro ao buscar permissoes:', err);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  }, [profile?.role]);

  useEffect(() => {
    if (!authLoading) {
      fetchPermissions();
    }
  }, [authLoading, fetchPermissions]);

  // Verificar se usuario tem uma permissao especifica
  const hasPermission = useCallback((permissionName) => {
    // Admin tem todas as permissoes
    if (profile?.role === 'admin') return true;

    return permissions.some(p =>
      p.name === permissionName ||
      p.permission_name === permissionName
    );
  }, [permissions, profile?.role]);

  // Verificar se usuario tem QUALQUER uma das permissoes
  const hasAnyPermission = useCallback((permissionNames) => {
    if (profile?.role === 'admin') return true;
    return permissionNames.some(name => hasPermission(name));
  }, [hasPermission, profile?.role]);

  // Verificar se usuario tem TODAS as permissoes
  const hasAllPermissions = useCallback((permissionNames) => {
    if (profile?.role === 'admin') return true;
    return permissionNames.every(name => hasPermission(name));
  }, [hasPermission, profile?.role]);

  // Verificar se pode acessar modulo
  const canAccessModule = useCallback((moduleName) => {
    if (profile?.role === 'admin') return true;

    return permissions.some(p =>
      (p.module === moduleName) ||
      (p.name && p.name.startsWith(`${moduleName}.`))
    );
  }, [permissions, profile?.role]);

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

/**
 * Hook usePermission - Verifica permissoes de usuario
 *
 * Uso:
 *   const canCreate = usePermission('os.create');
 *   const canViewFinancial = usePermission('financial.view');
 *
 *   if (canCreate) {
 *     // mostrar botao de criar
 *   }
 */

import { useMemo } from 'react';
import { usePermissions } from '../contexts/PermissionContext';

export function usePermission(permissionName) {
  const { hasPermission, loading } = usePermissions();

  const allowed = useMemo(() => {
    if (loading) return false;
    return hasPermission(permissionName);
  }, [hasPermission, permissionName, loading]);

  return allowed;
}

/**
 * Hook useMultiplePermissions - Verifica multiplas permissoes
 *
 * Uso:
 *   const { canCreate, canEdit, canDelete } = useMultiplePermissions({
 *     canCreate: 'os.create',
 *     canEdit: 'os.edit',
 *     canDelete: 'os.delete'
 *   });
 */
export function useMultiplePermissions(permissionsMap) {
  const { hasPermission, loading } = usePermissions();

  const results = useMemo(() => {
    if (loading) {
      return Object.keys(permissionsMap).reduce((acc, key) => {
        acc[key] = false;
        return acc;
      }, {});
    }

    return Object.entries(permissionsMap).reduce((acc, [key, permission]) => {
      acc[key] = hasPermission(permission);
      return acc;
    }, {});
  }, [hasPermission, permissionsMap, loading]);

  return { ...results, loading };
}

/**
 * Hook useModuleAccess - Verifica acesso a modulo
 *
 * Uso:
 *   const canAccessSales = useModuleAccess('sales');
 */
export function useModuleAccess(moduleName) {
  const { canAccessModule, loading } = usePermissions();

  const allowed = useMemo(() => {
    if (loading) return false;
    return canAccessModule(moduleName);
  }, [canAccessModule, moduleName, loading]);

  return allowed;
}

export default usePermission;

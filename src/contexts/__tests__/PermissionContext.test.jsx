import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';

// ==================== MOCKS ====================

const { mockAuthReturn, mockRpc } = vi.hoisted(() => ({
  mockAuthReturn: {
    current: {
      user: { id: 'user-1' },
      profile: { role: 'admin' },
      loading: false,
    },
  },
  mockRpc: vi.fn().mockResolvedValue({ data: null, error: { message: 'function not found' } }),
}));

vi.mock('../AuthContext', () => ({
  useAuth: () => mockAuthReturn.current,
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    rpc: mockRpc,
  },
}));

// ==================== IMPORT ====================

import { PermissionProvider, usePermissions } from '../PermissionContext';

// ==================== HELPERS ====================

const wrapper = ({ children }) => <PermissionProvider>{children}</PermissionProvider>;

// ==================== TESTES ====================

describe('PermissionContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRpc.mockResolvedValue({ data: null, error: { message: 'function not found' } });
  });

  describe('admin', () => {
    beforeEach(() => {
      mockAuthReturn.current = {
        user: { id: 'admin-1' },
        profile: { role: 'admin' },
        loading: false,
      };
    });

    it('admin tem todas as permissoes', async () => {
      const { result } = renderHook(() => usePermissions(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasPermission('qualquer.coisa')).toBe(true);
      expect(result.current.hasPermission('sales.view')).toBe(true);
      expect(result.current.hasPermission('financial.view_costs')).toBe(true);
    });

    it('admin pode acessar qualquer modulo', async () => {
      const { result } = renderHook(() => usePermissions(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.canAccessModule('sales')).toBe(true);
      expect(result.current.canAccessModule('financial')).toBe(true);
      expect(result.current.canAccessModule('crm')).toBe(true);
    });
  });

  describe('manager (gestor)', () => {
    beforeEach(() => {
      mockAuthReturn.current = {
        user: { id: 'mgr-1' },
        profile: { role: 'Gestor' },
        loading: false,
      };
    });

    it('gestor tem acesso de admin (via detectRole)', async () => {
      const { result } = renderHook(() => usePermissions(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasPermission('qualquer.coisa')).toBe(true);
      expect(result.current.canAccessModule('financial')).toBe(true);
    });
  });

  describe('collaborator (membro)', () => {
    beforeEach(() => {
      mockAuthReturn.current = {
        user: { id: 'collab-1' },
        profile: { role: 'desenvolvedor' },
        loading: false,
      };
    });

    it('membro tem permissoes limitadas (fallback)', async () => {
      const { result } = renderHook(() => usePermissions(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      // Member tem sales.view, agenda.view, agenda.edit, os.view, os.create, os.edit
      expect(result.current.hasPermission('sales.view')).toBe(true);
      expect(result.current.hasPermission('agenda.view')).toBe(true);
      expect(result.current.hasPermission('os.create')).toBe(true);
    });

    it('membro nao tem permissoes de admin', async () => {
      const { result } = renderHook(() => usePermissions(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasPermission('financial.view_costs')).toBe(false);
      expect(result.current.hasPermission('financial.view_salaries')).toBe(false);
    });
  });

  describe('hasAnyPermission', () => {
    beforeEach(() => {
      mockAuthReturn.current = {
        user: { id: 'collab-1' },
        profile: { role: 'analista' },
        loading: false,
      };
    });

    it('retorna true quando tem pelo menos uma permissao', async () => {
      const { result } = renderHook(() => usePermissions(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasAnyPermission(['sales.view', 'financial.view_costs'])).toBe(true);
    });

    it('retorna false quando nao tem nenhuma', async () => {
      const { result } = renderHook(() => usePermissions(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasAnyPermission(['financial.view_costs', 'admin.manage'])).toBe(false);
    });
  });

  describe('hasAllPermissions', () => {
    beforeEach(() => {
      mockAuthReturn.current = {
        user: { id: 'collab-1' },
        profile: { role: 'estagiario' },
        loading: false,
      };
    });

    it('retorna true quando tem todas as permissoes', async () => {
      const { result } = renderHook(() => usePermissions(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasAllPermissions(['sales.view', 'os.view'])).toBe(true);
    });

    it('retorna false quando falta uma permissao', async () => {
      const { result } = renderHook(() => usePermissions(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasAllPermissions(['sales.view', 'financial.view_costs'])).toBe(false);
    });
  });

  describe('canAccessModule', () => {
    beforeEach(() => {
      mockAuthReturn.current = {
        user: { id: 'collab-1' },
        profile: { role: 'designer' },
        loading: false,
      };
    });

    it('membro pode acessar modulos com permissao', async () => {
      const { result } = renderHook(() => usePermissions(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.canAccessModule('sales')).toBe(true);
      expect(result.current.canAccessModule('agenda')).toBe(true);
      expect(result.current.canAccessModule('os')).toBe(true);
    });

    it('membro nao pode acessar modulos sem permissao', async () => {
      const { result } = renderHook(() => usePermissions(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.canAccessModule('financial')).toBe(false);
    });
  });

  describe('shortcuts', () => {
    it('canAccessSales funciona como shortcut', async () => {
      mockAuthReturn.current = {
        user: { id: 'admin-1' },
        profile: { role: 'admin' },
        loading: false,
      };

      const { result } = renderHook(() => usePermissions(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.canAccessSales()).toBe(true);
      expect(result.current.canAccessFinancial()).toBe(true);
      expect(result.current.canAccessAgenda()).toBe(true);
      expect(result.current.canAccessOS()).toBe(true);
    });
  });

  describe('sem usuario', () => {
    it('retorna permissoes vazias quando nao autenticado', async () => {
      mockAuthReturn.current = {
        user: null,
        profile: null,
        loading: false,
      };

      const { result } = renderHook(() => usePermissions(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasPermission('sales.view')).toBe(false);
      expect(result.current.canAccessModule('sales')).toBe(false);
    });
  });

  describe('permissoes do banco (RPC)', () => {
    it('usa permissoes do banco quando RPC retorna dados', async () => {
      mockAuthReturn.current = {
        user: { id: 'user-1' },
        profile: { role: 'custom_role' },
        loading: false,
      };
      mockRpc.mockResolvedValueOnce({
        data: [
          { name: 'crm.view', module: 'crm' },
          { name: 'crm.edit', module: 'crm' },
        ],
        error: null,
      });

      const { result } = renderHook(() => usePermissions(), { wrapper });

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(result.current.hasPermission('crm.view')).toBe(true);
      expect(result.current.hasPermission('crm.edit')).toBe(true);
      expect(result.current.hasPermission('sales.view')).toBe(false);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';

// ==================== MOCKS ====================

const { mockAuth, resultQueue } = vi.hoisted(() => ({
  mockAuth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  },
  resultQueue: [],
}));

vi.mock('../../lib/supabase', () => {
  function createChain() {
    return new Proxy({}, {
      get(_, prop) {
        if (prop === 'then') {
          const result = resultQueue.shift() || { data: null, error: null };
          return (resolve, reject) => Promise.resolve(result).then(resolve, reject);
        }
        return (...args) => createChain();
      },
    });
  }
  return {
    supabase: {
      from: vi.fn(() => createChain()),
      auth: mockAuth,
    },
  };
});

// ==================== IMPORT ====================

import { AuthProvider, useAuth } from '../AuthContext';

// ==================== HELPERS ====================

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

// ==================== TESTES ====================

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resultQueue.length = 0;
    mockAuth.getSession.mockResolvedValue({ data: { session: null } });
    mockAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
  });

  describe('estado inicial', () => {
    it('comeca com loading=true e sem usuario', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      // Inicialmente loading pode ser true
      // Apos inicializacao, loading deve ser false
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('carrega sessao existente no mount', async () => {
      const mockUser = { id: 'user-1', email: 'test@test.com' };
      mockAuth.getSession.mockResolvedValueOnce({
        data: { session: { user: mockUser } },
      });
      // Profile query result
      resultQueue.push({ data: { id: 'user-1', role: 'admin', full_name: 'Admin' }, error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('signIn', () => {
    it('faz login com sucesso', async () => {
      const mockData = { user: { id: 'user-1' }, session: {} };
      mockAuth.signInWithPassword.mockResolvedValueOnce({ data: mockData, error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn('test@test.com', 'password123');
      });

      expect(signInResult.success).toBe(true);
      expect(mockAuth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });

    it('traduz erro "Invalid login credentials" para portugues', async () => {
      mockAuth.signInWithPassword.mockResolvedValueOnce({
        data: null,
        error: { message: 'Invalid login credentials' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn('wrong@test.com', 'wrong');
      });

      expect(signInResult.success).toBe(false);
      expect(signInResult.error).toBe('Email ou senha incorretos');
    });

    it('traduz erro "Email not confirmed"', async () => {
      mockAuth.signInWithPassword.mockResolvedValueOnce({
        data: null,
        error: { message: 'Email not confirmed' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn('test@test.com', 'pass');
      });

      expect(signInResult.error).toContain('confirmado');
    });

    it('traduz erro "Too many requests"', async () => {
      mockAuth.signInWithPassword.mockResolvedValueOnce({
        data: null,
        error: { message: 'Too many requests' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn('test@test.com', 'pass');
      });

      expect(signInResult.error).toContain('tentativas');
    });

    it('traduz erro de rede', async () => {
      mockAuth.signInWithPassword.mockResolvedValueOnce({
        data: null,
        error: { message: 'Failed to fetch' },
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      let signInResult;
      await act(async () => {
        signInResult = await result.current.signIn('test@test.com', 'pass');
      });

      expect(signInResult.error).toContain('conexao');
    });
  });

  describe('signOut', () => {
    it('faz logout e limpa estado', async () => {
      // Iniciar com usuario logado
      const mockUser = { id: 'user-1', email: 'test@test.com' };
      mockAuth.getSession.mockResolvedValueOnce({
        data: { session: { user: mockUser } },
      });
      resultQueue.push({ data: { id: 'user-1', role: 'admin' }, error: null });
      mockAuth.signOut.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.user).not.toBeNull());

      let logoutResult;
      await act(async () => {
        logoutResult = await result.current.signOut();
      });

      expect(logoutResult.success).toBe(true);
      expect(result.current.user).toBeNull();
      expect(result.current.profile).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('signUp', () => {
    it('registra novo usuario', async () => {
      mockAuth.signUp.mockResolvedValueOnce({
        data: { user: { id: 'new-user' } },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      let signUpResult;
      await act(async () => {
        signUpResult = await result.current.signUp('new@test.com', 'pass123', 'Novo Usuario');
      });

      expect(signUpResult.success).toBe(true);
      expect(mockAuth.signUp).toHaveBeenCalledWith({
        email: 'new@test.com',
        password: 'pass123',
        options: { data: { full_name: 'Novo Usuario' } },
      });
    });
  });

  describe('signInWithGoogle', () => {
    it('inicia OAuth com Google', async () => {
      mockAuth.signInWithOAuth.mockResolvedValueOnce({
        data: { url: 'https://accounts.google.com/...' },
        error: null,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      let googleResult;
      await act(async () => {
        googleResult = await result.current.signInWithGoogle();
      });

      expect(googleResult.success).toBe(true);
      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: expect.any(String) },
      });
    });
  });

  describe('helpers de role', () => {
    it('isAdmin retorna true quando profile.role e "admin"', async () => {
      mockAuth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'admin-1' } } },
      });
      resultQueue.push({ data: { id: 'admin-1', role: 'admin' }, error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isManager).toBe(true);
    });

    it('isManager retorna true para role "manager"', async () => {
      mockAuth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'mgr-1' } } },
      });
      resultQueue.push({ data: { id: 'mgr-1', role: 'manager' }, error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });

      expect(result.current.isManager).toBe(true);
      expect(result.current.isAdmin).toBe(false);
    });

    it('isAdmin e isManager retornam false para collaborator', async () => {
      mockAuth.getSession.mockResolvedValueOnce({
        data: { session: { user: { id: 'collab-1' } } },
      });
      resultQueue.push({ data: { id: 'collab-1', role: 'collaborator' }, error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.profile).not.toBeNull();
      });

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.isManager).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('envia email de reset', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValueOnce({ error: null });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.loading).toBe(false));

      let resetResult;
      await act(async () => {
        resetResult = await result.current.resetPassword('user@test.com');
      });

      expect(resetResult.success).toBe(true);
      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledWith(
        'user@test.com',
        { redirectTo: expect.stringContaining('/reset-password') }
      );
    });
  });
});

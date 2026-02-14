import { describe, it, expect, vi } from 'vitest';
import { handleError, ERROR_TYPES } from '../errorHandler';

// Mock toast
vi.mock('../../contexts/ToastContext', () => ({
  toast: vi.fn(),
}));

describe('handleError', () => {
  it('classifica erro de rede', () => {
    const result = handleError(new Error('Failed to fetch'), 'test', { showToast: false });
    expect(result.type).toBe(ERROR_TYPES.NETWORK);
  });

  it('classifica erro de autenticacao', () => {
    const result = handleError({ message: 'JWT expired', status: 401 }, 'test', { showToast: false });
    expect(result.type).toBe(ERROR_TYPES.AUTH);
  });

  it('classifica erro de permissao', () => {
    const result = handleError({ message: 'new row violates RLS policy', status: 403 }, 'test', { showToast: false });
    expect(result.type).toBe(ERROR_TYPES.PERMISSION);
  });

  it('classifica erro de validacao', () => {
    const result = handleError(new Error('Validation failed: invalid email'), 'test', { showToast: false });
    expect(result.type).toBe(ERROR_TYPES.VALIDATION);
  });

  it('classifica erro de servidor', () => {
    const result = handleError({ message: 'Internal server error', status: 500 }, 'test', { showToast: false });
    expect(result.type).toBe(ERROR_TYPES.SERVER);
  });

  it('classifica erro desconhecido', () => {
    const result = handleError(new Error('algo inesperado'), 'test', { showToast: false });
    expect(result.type).toBe(ERROR_TYPES.UNKNOWN);
  });

  it('retorna mensagem amigavel', () => {
    const result = handleError(new Error('Failed to fetch'), 'test', { showToast: false });
    expect(result.message).toContain('conexao');
  });

  it('usa mensagem customizada quando fornecida', () => {
    const result = handleError(new Error('test'), 'test', {
      showToast: false,
      customMessage: 'Mensagem personalizada',
    });
    expect(result.message).toBe('Mensagem personalizada');
  });
});

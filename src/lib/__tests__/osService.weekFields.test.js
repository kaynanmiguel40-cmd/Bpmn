import { describe, it, expect, vi } from 'vitest';

vi.mock('../serviceFactory', () => ({
  createCRUDService: vi.fn(() => ({
    getAll: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn(), bulkUpdate: vi.fn(),
  })),
}));
vi.mock('../supabase', () => ({ supabase: { from: vi.fn() } }));
vi.mock('../validation', () => ({
  osOrderSchema: {}, sectorSchema: {}, osProjectSchema: {},
  validateAndSanitize: vi.fn((_, data) => ({ success: true, data })),
  validatePartial: vi.fn((_, data) => ({ success: true, data })),
}));
vi.mock('../offlineDB', () => ({ getOffline: vi.fn().mockResolvedValue([]) }));

import { dbToOrder } from '../osService';

describe('dbToOrder — campos novos da semana', () => {
  it('mapeia week_start/week_end para weekStart/weekEnd', () => {
    const row = {
      id: 'os_1', title: 'Semana 17', status: 'available',
      week_start: '2026-04-27', week_end: '2026-05-03',
    };
    const out = dbToOrder(row);
    expect(out.weekStart).toBe('2026-04-27');
    expect(out.weekEnd).toBe('2026-05-03');
  });

  it('retorna null para weekStart/weekEnd quando nao informados', () => {
    const out = dbToOrder({ id: 'os_1', title: 'X', status: 'available' });
    expect(out.weekStart).toBeNull();
    expect(out.weekEnd).toBeNull();
  });

  it('nao inventa valor a partir de string vazia', () => {
    const out = dbToOrder({ id: 'os_1', title: 'X', status: 'available', week_start: '', week_end: '' });
    expect(out.weekStart).toBeNull();
    expect(out.weekEnd).toBeNull();
  });
});

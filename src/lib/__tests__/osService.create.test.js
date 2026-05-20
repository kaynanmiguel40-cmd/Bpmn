import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==================== MOCKS (vi.hoisted para acesso nos factories) ====================
const { createSpy, updateSpy, removeSpy, supabaseQueue } = vi.hoisted(() => ({
  createSpy: vi.fn(async (data) => ({ id: 'os_generated', ...data })),
  updateSpy: vi.fn(async (id, data) => ({ id, ...data })),
  removeSpy: vi.fn(async () => true),
  supabaseQueue: [],
}));

vi.mock('../serviceFactory', () => ({
  createCRUDService: vi.fn(() => ({
    getAll: vi.fn().mockResolvedValue([]),
    getPaginated: vi.fn(),
    getById: vi.fn(),
    create: createSpy,
    update: updateSpy,
    remove: removeSpy,
    bulkUpdate: vi.fn(),
    syncPending: vi.fn(),
  })),
}));

vi.mock('../supabase', () => {
  function chain() {
    return new Proxy({}, {
      get(_, prop) {
        if (prop === 'then') {
          const r = supabaseQueue.shift() || { data: null, error: null };
          return (resolve) => Promise.resolve(r).then(resolve);
        }
        return () => chain();
      },
    });
  }
  return { supabase: { from: vi.fn(() => chain()) } };
});

vi.mock('../osSignaturesService', () => ({
  ensureSignaturesForParticipants: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../validation', () => ({
  osOrderSchema: {},
  sectorSchema: {},
  osProjectSchema: {},
}));

vi.mock('../offlineDB', () => ({ getOffline: vi.fn().mockResolvedValue([]) }));

import {
  createOSOrder,
  updateOSOrder,
  calcSLADeadline,
} from '../osService';
import { SLA_HOURS, DEFAULT_SLA_HOURS } from '../../constants/sla';

beforeEach(() => {
  createSpy.mockClear();
  updateSpy.mockClear();
  supabaseQueue.length = 0;
});

// ==================== calcSLADeadline ====================

describe('calcSLADeadline', () => {
  it('retorna ISO string valido', () => {
    const out = calcSLADeadline('medium');
    expect(typeof out).toBe('string');
    expect(() => new Date(out).toISOString()).not.toThrow();
    expect(new Date(out).toISOString()).toBe(out);
  });

  it('soma SLA_HOURS[priority] horas a partir de agora', () => {
    const before = Date.now();
    const out = calcSLADeadline('high');
    const diffMs = new Date(out).getTime() - before;
    const expectedMs = SLA_HOURS.high * 3600 * 1000;
    // Tolerancia de 5s pra latencia do test runner
    expect(diffMs).toBeGreaterThanOrEqual(expectedMs - 5000);
    expect(diffMs).toBeLessThanOrEqual(expectedMs + 5000);
  });

  it('usa DEFAULT_SLA_HOURS quando prioridade desconhecida', () => {
    const before = Date.now();
    const out = calcSLADeadline('inexistente');
    const diffMs = new Date(out).getTime() - before;
    const expectedMs = DEFAULT_SLA_HOURS * 3600 * 1000;
    expect(Math.abs(diffMs - expectedMs)).toBeLessThan(5000);
  });
});

// ==================== createOSOrder: normalizeTimestamps ====================

describe('createOSOrder - normalizacao de timestamps', () => {
  it('converte estimatedStart "" para null antes de chamar create', async () => {
    supabaseQueue.push({ data: [{ number: 0 }], error: null }); // getNextOrderNumber
    await createOSOrder({
      title: 'Sem datas',
      priority: 'medium',
      estimatedStart: '',
      estimatedEnd: '',
    });
    expect(createSpy).toHaveBeenCalledTimes(1);
    const payload = createSpy.mock.calls[0][0];
    expect(payload.estimatedStart).toBeNull();
    expect(payload.estimatedEnd).toBeNull();
  });

  it('adiciona sufixo Z em "YYYY-MM-DDTHH:mm"', async () => {
    supabaseQueue.push({ data: [{ number: 0 }], error: null });
    await createOSOrder({
      title: 'Com datas locais',
      priority: 'medium',
      estimatedStart: '2026-05-20T08:00',
      estimatedEnd: '2026-05-20T17:30',
    });
    const payload = createSpy.mock.calls[0][0];
    expect(payload.estimatedStart).toBe('2026-05-20T08:00:00Z');
    expect(payload.estimatedEnd).toBe('2026-05-20T17:30:00Z');
  });

  it('preserva ISO ja completo intacto', async () => {
    supabaseQueue.push({ data: [{ number: 0 }], error: null });
    const iso = '2026-05-20T08:00:00.000Z';
    await createOSOrder({
      title: 'X', priority: 'medium', estimatedStart: iso,
    });
    expect(createSpy.mock.calls[0][0].estimatedStart).toBe(iso);
  });

  it('nao adiciona timestamps ausentes (nao injeta null/"")', async () => {
    supabaseQueue.push({ data: [{ number: 0 }], error: null });
    await createOSOrder({ title: 'Minimal', priority: 'medium' });
    const payload = createSpy.mock.calls[0][0];
    // Nao devem aparecer no payload final como ''
    expect(payload.actualStart).not.toBe('');
    expect(payload.actualEnd).not.toBe('');
    expect(payload.resumedAt).not.toBe('');
    expect(payload.pausedAt).not.toBe('');
  });
});

// ==================== createOSOrder: numero sequencial ====================

describe('createOSOrder - numero sequencial', () => {
  it('preenche number com proximo sequencial quando ausente', async () => {
    supabaseQueue.push({ data: [{ number: 17 }], error: null });
    await createOSOrder({ title: 'Nova', priority: 'medium' });
    expect(createSpy.mock.calls[0][0].number).toBe(18);
  });

  it('respeita number explicito (nao sobrescreve)', async () => {
    supabaseQueue.push({ data: [{ number: 17 }], error: null });
    await createOSOrder({ title: 'Manual', priority: 'medium', number: 999 });
    expect(createSpy.mock.calls[0][0].number).toBe(999);
  });

  it('comeca em 1 quando nao ha O.S. ainda', async () => {
    supabaseQueue.push({ data: [], error: null });
    await createOSOrder({ title: 'Primeira', priority: 'medium' });
    expect(createSpy.mock.calls[0][0].number).toBe(1);
  });
});

// ==================== createOSOrder: SLA automatico ====================

describe('createOSOrder - SLA automatico', () => {
  it('auto-calcula slaDeadline baseado em priority quando ausente', async () => {
    supabaseQueue.push({ data: [{ number: 0 }], error: null });
    const before = Date.now();
    await createOSOrder({ title: 'Sem SLA', priority: 'high' });
    const sla = createSpy.mock.calls[0][0].slaDeadline;
    expect(typeof sla).toBe('string');
    const slaMs = new Date(sla).getTime();
    const expectedMs = before + SLA_HOURS.high * 3600 * 1000;
    expect(Math.abs(slaMs - expectedMs)).toBeLessThan(10000);
  });

  it('respeita slaDeadline explicito', async () => {
    supabaseQueue.push({ data: [{ number: 0 }], error: null });
    const explicit = '2027-01-01T00:00:00Z';
    await createOSOrder({ title: 'X', priority: 'low', slaDeadline: explicit });
    expect(createSpy.mock.calls[0][0].slaDeadline).toBe(explicit);
  });

  it('usa medium como prioridade default pro SLA', async () => {
    supabaseQueue.push({ data: [{ number: 0 }], error: null });
    const before = Date.now();
    await createOSOrder({ title: 'Sem prioridade' });
    const sla = createSpy.mock.calls[0][0].slaDeadline;
    const slaMs = new Date(sla).getTime();
    const expectedMs = before + SLA_HOURS.medium * 3600 * 1000;
    expect(Math.abs(slaMs - expectedMs)).toBeLessThan(10000);
  });
});

// ==================== createOSOrder: emergency ====================

describe('createOSOrder - tipo emergency', () => {
  it('atribui emergencyNumber sequencial e forca priority=urgent', async () => {
    // getNextEmergencyNumber le os_orders filtrando type=emergency
    supabaseQueue.push({ data: [{ emergency_number: 4 }], error: null });
    await createOSOrder({
      title: 'Emergencia',
      type: 'emergency',
      priority: 'low', // deve ser sobrescrito
    });
    const payload = createSpy.mock.calls[0][0];
    expect(payload.emergencyNumber).toBe(5);
    expect(payload.priority).toBe('urgent');
    expect(payload.type).toBe('emergency');
  });

  it('respeita emergencyNumber explicito', async () => {
    supabaseQueue.push({ data: [{ emergency_number: 4 }], error: null });
    await createOSOrder({
      title: 'X', type: 'emergency', emergencyNumber: 99,
    });
    expect(createSpy.mock.calls[0][0].emergencyNumber).toBe(99);
  });
});

// ==================== updateOSOrder: normalizacao parcial ====================

describe('updateOSOrder - normalizacao parcial', () => {
  it('converte "" em null em campos timestamp do update', async () => {
    await updateOSOrder('os_1', { actualStart: '', actualEnd: '' });
    const [id, payload] = updateSpy.mock.calls[0];
    expect(id).toBe('os_1');
    expect(payload.actualStart).toBeNull();
    expect(payload.actualEnd).toBeNull();
  });

  it('nao injeta null em timestamps AUSENTES do update', async () => {
    // Update parcial (so checklist) nao pode zerar estimated_start no banco
    await updateOSOrder('os_1', { checklist: [{ id: '1', done: true }] });
    const payload = updateSpy.mock.calls[0][1];
    expect('estimatedStart' in payload).toBe(false);
    expect('estimatedEnd' in payload).toBe(false);
    expect('actualStart' in payload).toBe(false);
    expect('slaDeadline' in payload).toBe(false);
  });

  it('adiciona sufixo Z em datetime-local no update', async () => {
    await updateOSOrder('os_1', { estimatedStart: '2026-06-01T09:00' });
    expect(updateSpy.mock.calls[0][1].estimatedStart).toBe('2026-06-01T09:00:00Z');
  });
});

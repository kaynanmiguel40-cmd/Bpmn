import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDeadlineStatus, getOverdueOrders, getWarningOrders } from '../deadlineUtils';

describe('getDeadlineStatus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna none para ordem sem data estimada', () => {
    const result = getDeadlineStatus({ status: 'available' });
    expect(result.status).toBe('none');
  });

  it('retorna none para ordem concluida', () => {
    const result = getDeadlineStatus({
      status: 'done',
      estimatedEnd: '2025-06-10',
    });
    expect(result.status).toBe('none');
  });

  it('retorna overdue para ordem atrasada', () => {
    const result = getDeadlineStatus({
      status: 'in_progress',
      estimatedEnd: '2025-06-10',
    });
    expect(result.status).toBe('overdue');
    expect(result.daysLeft).toBeLessThan(0);
  });

  it('retorna warning para ordem proxima do prazo', () => {
    const result = getDeadlineStatus({
      status: 'in_progress',
      estimatedEnd: '2025-06-17',
    });
    expect(result.status).toBe('warning');
  });

  it('retorna ok para ordem com prazo distante', () => {
    const result = getDeadlineStatus({
      status: 'available',
      estimatedEnd: '2025-07-15',
    });
    expect(result.status).toBe('ok');
  });
});

describe('getOverdueOrders', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('filtra ordens atrasadas', () => {
    const orders = [
      { id: '1', status: 'in_progress', estimatedEnd: '2025-06-10' },
      { id: '2', status: 'in_progress', estimatedEnd: '2025-07-10' },
      { id: '3', status: 'done', estimatedEnd: '2025-06-01' },
    ];
    const overdue = getOverdueOrders(orders);
    expect(overdue.length).toBe(1);
    expect(overdue[0].id).toBe('1');
  });
});

describe('getWarningOrders', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('filtra ordens proximas do prazo', () => {
    const orders = [
      { id: '1', status: 'in_progress', estimatedEnd: '2025-06-17' },
      { id: '2', status: 'in_progress', estimatedEnd: '2025-07-10' },
    ];
    const warnings = getWarningOrders(orders);
    expect(warnings.length).toBe(1);
    expect(warnings[0].id).toBe('1');
  });
});

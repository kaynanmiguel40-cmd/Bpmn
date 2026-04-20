import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDeadlineStatus, getOverdueOrders, getWarningOrders, getAlertOrders } from '../deadlineUtils';

/**
 * Testes estendidos para deadlineUtils.
 * Complementam os testes existentes em deadlineUtils.test.js
 * com edge cases e cenarios adicionais.
 */

describe('getDeadlineStatus - edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna "Vence hoje" quando prazo e hoje', () => {
    const result = getDeadlineStatus({
      status: 'in_progress',
      estimatedEnd: '2025-06-15T12:00:00',
    });
    expect(result.status).toBe('warning');
    expect(result.daysLeft).toBe(0);
    expect(result.label).toBe('Vence hoje');
  });

  it('retorna "Vence amanha" quando prazo e amanha', () => {
    const result = getDeadlineStatus({
      status: 'available',
      estimatedEnd: '2025-06-16T12:00:00',
    });
    expect(result.status).toBe('warning');
    expect(result.daysLeft).toBe(1);
    expect(result.label).toBe('Vence amanha');
  });

  it('retorna "Vence em 2d" quando prazo e em 2 dias', () => {
    const result = getDeadlineStatus({
      status: 'in_progress',
      estimatedEnd: '2025-06-17T12:00:00',
    });
    expect(result.status).toBe('warning');
    expect(result.daysLeft).toBe(2);
    expect(result.label).toBe('Vence em 2d');
  });

  it('retorna ok com dias restantes quando prazo > 2 dias', () => {
    const result = getDeadlineStatus({
      status: 'in_progress',
      estimatedEnd: '2025-06-20T12:00:00',
    });
    expect(result.status).toBe('ok');
    expect(result.daysLeft).toBe(5);
    expect(result.label).toBe('5d restantes');
  });

  it('retorna overdue com label "Xd atrasado"', () => {
    const result = getDeadlineStatus({
      status: 'in_progress',
      estimatedEnd: '2025-06-12T12:00:00',
    });
    expect(result.status).toBe('overdue');
    expect(result.daysLeft).toBe(-3);
    expect(result.label).toBe('3d atrasado');
  });

  it('retorna none para qualquer status done mesmo atrasado', () => {
    const result = getDeadlineStatus({
      status: 'done',
      estimatedEnd: '2025-06-01',
    });
    expect(result.status).toBe('none');
    expect(result.label).toBe('');
  });

  it('retorna none quando estimatedEnd e undefined', () => {
    const result = getDeadlineStatus({ status: 'in_progress' });
    expect(result.status).toBe('none');
  });

  it('retorna none quando estimatedEnd e null', () => {
    const result = getDeadlineStatus({ status: 'in_progress', estimatedEnd: null });
    expect(result.status).toBe('none');
  });

  it('retorna none quando estimatedEnd e string vazia', () => {
    const result = getDeadlineStatus({ status: 'in_progress', estimatedEnd: '' });
    expect(result.status).toBe('none');
  });
});

describe('getAlertOrders', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('retorna overdue + warning juntos', () => {
    const orders = [
      { id: '1', status: 'in_progress', estimatedEnd: '2025-06-10' }, // overdue
      { id: '2', status: 'in_progress', estimatedEnd: '2025-06-16' }, // warning
      { id: '3', status: 'in_progress', estimatedEnd: '2025-07-15' }, // ok
      { id: '4', status: 'done', estimatedEnd: '2025-06-01' },        // done
    ];
    const alerts = getAlertOrders(orders);
    expect(alerts).toHaveLength(2);
    expect(alerts.map(a => a.id).sort()).toEqual(['1', '2']);
  });

  it('retorna array vazio quando todas ok', () => {
    const orders = [
      { id: '1', status: 'in_progress', estimatedEnd: '2025-07-15' },
      { id: '2', status: 'done', estimatedEnd: '2025-06-01' },
    ];
    expect(getAlertOrders(orders)).toHaveLength(0);
  });

  it('retorna array vazio para lista vazia', () => {
    expect(getAlertOrders([])).toHaveLength(0);
  });
});

describe('getOverdueOrders - edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('nao inclui ordens que vencem hoje (warning, nao overdue)', () => {
    const orders = [
      { id: '1', status: 'in_progress', estimatedEnd: '2025-06-15T12:00:00' },
    ];
    expect(getOverdueOrders(orders)).toHaveLength(0);
  });

  it('inclui multiplas ordens atrasadas', () => {
    const orders = [
      { id: '1', status: 'in_progress', estimatedEnd: '2025-06-10' },
      { id: '2', status: 'available', estimatedEnd: '2025-06-13' },
      { id: '3', status: 'blocked', estimatedEnd: '2025-06-01' },
    ];
    expect(getOverdueOrders(orders)).toHaveLength(3);
  });
});

describe('getWarningOrders - edge cases', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-06-15T12:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('inclui hoje, amanha e depois de amanha', () => {
    const orders = [
      { id: '1', status: 'in_progress', estimatedEnd: '2025-06-15' }, // hoje
      { id: '2', status: 'in_progress', estimatedEnd: '2025-06-16' }, // amanha
      { id: '3', status: 'in_progress', estimatedEnd: '2025-06-17' }, // 2 dias
      { id: '4', status: 'in_progress', estimatedEnd: '2025-06-18' }, // 3 dias (ok)
    ];
    expect(getWarningOrders(orders)).toHaveLength(3);
  });

  it('nao inclui ordens atrasadas', () => {
    const orders = [
      { id: '1', status: 'in_progress', estimatedEnd: '2025-06-10' }, // overdue
    ];
    expect(getWarningOrders(orders)).toHaveLength(0);
  });
});

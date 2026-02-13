import { describe, it, expect } from 'vitest';
import {
  calcOSHours,
  calcEstimatedHours,
  calcDeliveryDays,
  calcDelayDays,
  getMemberHourlyRate,
  calcOSCost,
  formatCurrency,
  formatLateTime,
  timeAgo,
  findCurrentUser,
  calcKPIs,
} from '../kpiUtils';

// ─── Helpers de O.S. ─────────────────────────────────────────────

describe('calcOSHours', () => {
  it('deve retornar 0 se não tiver datas', () => {
    expect(calcOSHours({})).toBe(0);
    expect(calcOSHours({ actualStart: '2025-01-01' })).toBe(0);
    expect(calcOSHours({ actualEnd: '2025-01-05' })).toBe(0);
  });

  it('deve calcular horas baseado em dias * 8h', () => {
    const order = { actualStart: '2025-01-01', actualEnd: '2025-01-03' };
    // 3 dias (1,2,3) = 3 * 8 = 24h
    expect(calcOSHours(order)).toBe(24);
  });

  it('deve retornar mínimo de 8h (1 dia)', () => {
    const order = { actualStart: '2025-01-01', actualEnd: '2025-01-01' };
    expect(calcOSHours(order)).toBe(8);
  });
});

describe('calcEstimatedHours', () => {
  it('deve retornar 0 se não tiver datas', () => {
    expect(calcEstimatedHours({})).toBe(0);
  });

  it('deve calcular horas previstas baseado em dias * 8h', () => {
    const order = { estimatedStart: '2025-01-01', estimatedEnd: '2025-01-05' };
    // 5 dias * 8 = 40h
    expect(calcEstimatedHours(order)).toBe(40);
  });
});

describe('calcDeliveryDays', () => {
  it('deve retornar null se não tiver datas', () => {
    expect(calcDeliveryDays({})).toBeNull();
  });

  it('deve calcular dias corridos', () => {
    expect(calcDeliveryDays({ actualStart: '2025-01-01', actualEnd: '2025-01-04' })).toBe(3);
  });

  it('deve retornar 0 para mesmo dia', () => {
    expect(calcDeliveryDays({ actualStart: '2025-01-01', actualEnd: '2025-01-01' })).toBe(0);
  });
});

describe('calcDelayDays', () => {
  it('deve retornar null se não tiver datas', () => {
    expect(calcDelayDays({})).toBeNull();
  });

  it('deve retornar positivo quando atrasou', () => {
    expect(calcDelayDays({ estimatedEnd: '2025-01-05', actualEnd: '2025-01-08' })).toBe(3);
  });

  it('deve retornar negativo quando adiantou', () => {
    expect(calcDelayDays({ estimatedEnd: '2025-01-10', actualEnd: '2025-01-07' })).toBe(-3);
  });

  it('deve retornar 0 quando entregou no prazo', () => {
    expect(calcDelayDays({ estimatedEnd: '2025-01-05', actualEnd: '2025-01-05' })).toBe(0);
  });
});

// ─── Helpers de Custo ────────────────────────────────────────────

describe('getMemberHourlyRate', () => {
  it('deve calcular valor/hora corretamente', () => {
    expect(getMemberHourlyRate({ salaryMonth: 5280, hoursMonth: 176 })).toBe(30);
  });

  it('deve retornar 0 se salário for 0', () => {
    expect(getMemberHourlyRate({ salaryMonth: 0, hoursMonth: 176 })).toBe(0);
  });

  it('deve usar default 176h quando hoursMonth é 0 (falsy)', () => {
    // JS || trata 0 como falsy, então cai no default 176
    expect(getMemberHourlyRate({ salaryMonth: 5000, hoursMonth: 0 })).toBeCloseTo(5000 / 176);
  });

  it('deve aceitar formato snake_case do banco', () => {
    expect(getMemberHourlyRate({ salary_month: 3520, hours_month: 176 })).toBe(20);
  });
});

describe('calcOSCost', () => {
  const members = [
    { name: 'João Silva', salaryMonth: 5280, hoursMonth: 176 }, // R$30/h
  ];

  it('deve calcular custo de mão de obra + material', () => {
    const order = {
      actualStart: '2025-01-01',
      actualEnd: '2025-01-01', // 1 dia = 8h
      assignee: 'João Silva',
      expenses: [{ value: 100, quantity: 2 }], // R$200
    };
    const cost = calcOSCost(order, members);
    expect(cost.laborCost).toBe(240); // 8h * R$30
    expect(cost.materialCost).toBe(200);
    expect(cost.totalCost).toBe(440);
  });

  it('deve retornar 0 quando não encontra membro', () => {
    const order = { actualStart: '2025-01-01', actualEnd: '2025-01-01', assignee: 'Desconhecido', expenses: [] };
    const cost = calcOSCost(order, members);
    expect(cost.laborCost).toBe(0);
  });
});

// ─── Formatação ──────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('deve formatar em BRL', () => {
    const result = formatCurrency(1500.5);
    expect(result).toContain('1.500,50');
  });

  it('deve retornar R$ 0,00 para valores inválidos', () => {
    expect(formatCurrency('abc')).toBe('R$ 0,00');
    expect(formatCurrency(NaN)).toBe('R$ 0,00');
  });
});

describe('formatLateTime', () => {
  it('deve formatar minutos', () => {
    expect(formatLateTime(30)).toBe('30min');
  });

  it('deve formatar horas', () => {
    expect(formatLateTime(120)).toBe('2h');
  });

  it('deve formatar horas e minutos', () => {
    expect(formatLateTime(90)).toBe('1h 30min');
  });

  it('deve retornar 0min para 0 ou negativo', () => {
    expect(formatLateTime(0)).toBe('0min');
    expect(formatLateTime(-5)).toBe('0min');
  });
});

// ─── findCurrentUser ─────────────────────────────────────────────

describe('findCurrentUser', () => {
  const teamMembers = [
    { id: '1', name: 'Kaynan Silva', color: '#3b82f6' },
    { id: '2', name: 'Ana Santos', color: '#22c55e' },
  ];

  it('deve encontrar membro por nome exato', () => {
    const result = findCurrentUser({ name: 'Kaynan Silva' }, teamMembers);
    expect(result.id).toBe('1');
  });

  it('deve retornar fallback quando nome não encontrado', () => {
    const result = findCurrentUser({ name: 'Desconhecido' }, teamMembers);
    expect(result.name).toBe('Desconhecido');
  });

  it('deve retornar primeiro membro como fallback quando sem perfil', () => {
    const result = findCurrentUser(null, teamMembers);
    expect(result.id).toBe('1');
  });
});

// ─── calcKPIs ────────────────────────────────────────────────────

describe('calcKPIs', () => {
  it('deve retornar valores padrão para listas vazias', () => {
    const kpi = calcKPIs([], [], 176);
    expect(kpi.total).toBe(0);
    expect(kpi.doneMonth).toBe(0);
    expect(kpi.completionRate).toBe('0');
    expect(kpi.onTimeRate).toBe('100');
    expect(kpi.productivity).toBe('0');
  });

  it('deve calcular taxa de conclusão corretamente', () => {
    const now = new Date();
    const thisMonth = now.toISOString().slice(0, 7); // YYYY-MM

    const orders = [
      { status: 'done', actualEnd: `${thisMonth}-10`, actualStart: `${thisMonth}-08` },
      { status: 'done', actualEnd: `${thisMonth}-15`, actualStart: `${thisMonth}-12` },
      { status: 'in_progress', actualStart: `${thisMonth}-20` },
    ];

    const kpi = calcKPIs(orders, [], 176);
    // 2 done no mês / (2 done + 1 in_progress) = 66.67%
    expect(parseInt(kpi.completionRate)).toBe(67);
  });

  it('deve calcular presença em reuniões', () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);

    const events = [
      { type: 'meeting', endDate: past.toISOString(), attended: true, wasLate: false },
      { type: 'meeting', endDate: past.toISOString(), attended: true, wasLate: true, lateMinutes: 15 },
      { type: 'meeting', endDate: past.toISOString(), attended: false },
    ];

    const kpi = calcKPIs([], events, 176);
    expect(kpi.pastMeetings).toBe(3);
    expect(kpi.attendedMeetings).toBe(2);
    expect(parseInt(kpi.meetingAttendance)).toBe(67); // 2/3
    expect(parseInt(kpi.meetingPunctuality)).toBe(50); // 1/2
    expect(kpi.totalLateMinutes).toBe(15);
  });
});

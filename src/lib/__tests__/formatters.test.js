import { describe, it, expect } from 'vitest';
import {
  formatCurrency,
  formatCurrencyShort,
  formatNumber,
  formatDateTime,
  formatDateShortMonth,
  formatDateSmart,
  formatLateTime,
  formatAudioTime,
  formatCpf,
  toInputDate,
  timeAgo,
  formatChatTime,
} from '../formatters';

// ─── Moeda ──────────────────────────────────────────────────────

describe('formatCurrency', () => {
  it('formata valor positivo em BRL', () => {
    const result = formatCurrency(1500.5);
    expect(result).toContain('1.500,50');
  });

  it('formata zero', () => {
    expect(formatCurrency(0)).toContain('0,00');
  });

  it('formata valor negativo', () => {
    const result = formatCurrency(-250.99);
    expect(result).toContain('250,99');
  });

  it('retorna R$ 0,00 para NaN', () => {
    expect(formatCurrency('abc')).toBe('R$ 0,00');
    expect(formatCurrency(NaN)).toBe('R$ 0,00');
    expect(formatCurrency(undefined)).toBe('R$ 0,00');
  });

  it('converte string numerica', () => {
    const result = formatCurrency('1234.56');
    expect(result).toContain('1.234,56');
  });
});

describe('formatCurrencyShort', () => {
  it('formata sem centavos', () => {
    const result = formatCurrencyShort(1500.99);
    expect(result).toContain('1.501');
    expect(result).not.toContain(',99');
  });

  it('formata null como zero', () => {
    const result = formatCurrencyShort(null);
    expect(result).toContain('0');
  });
});

describe('formatNumber', () => {
  it('formata com separadores pt-BR', () => {
    expect(formatNumber(1234567)).toContain('1.234.567');
  });

  it('formata null como 0', () => {
    expect(formatNumber(null)).toBe('0');
  });
});

// ─── Data ───────────────────────────────────────────────────────

describe('formatDateTime', () => {
  it('formata ISO para DD/MM/YYYY HH:MM', () => {
    const result = formatDateTime('2025-03-15T14:30:00');
    expect(result).toContain('15');
    expect(result).toContain('03');
    expect(result).toContain('2025');
    expect(result).toContain('14');
    expect(result).toContain('30');
  });

  it('retorna traço para valor vazio', () => {
    expect(formatDateTime(null)).toBe('-');
    expect(formatDateTime('')).toBe('-');
    expect(formatDateTime(undefined)).toBe('-');
  });
});

describe('formatDateShortMonth', () => {
  it('retorna traço para valor vazio', () => {
    expect(formatDateShortMonth(null)).toBe('-');
    expect(formatDateShortMonth('')).toBe('-');
  });

  it('formata data com mes abreviado', () => {
    const result = formatDateShortMonth('2025-06-15T12:00:00');
    expect(result).toContain('15');
    expect(result).toContain('2025');
  });
});

describe('formatDateSmart', () => {
  it('retorna traço para valor vazio', () => {
    expect(formatDateSmart(null)).toBe('-');
    expect(formatDateSmart('')).toBe('-');
  });

  it('formata data sem hora quando nao tem T', () => {
    const result = formatDateSmart('2025-06-15');
    expect(result).toContain('15');
    expect(result).toContain('06');
    expect(result).toContain('2025');
  });

  it('inclui hora quando tem T', () => {
    const result = formatDateSmart('2025-06-15T14:30:00');
    expect(result).toContain('14');
    expect(result).toContain('30');
  });
});

// ─── Tempo Relativo ─────────────────────────────────────────────

describe('timeAgo', () => {
  it('retorna vazio para input vazio', () => {
    expect(timeAgo(null)).toBe('');
    expect(timeAgo('')).toBe('');
  });

  it('retorna "agora" para menos de 1 minuto', () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe('agora');
  });

  it('retorna minutos', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe('ha 5min');
  });

  it('retorna horas', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000).toISOString();
    expect(timeAgo(threeHoursAgo)).toBe('ha 3h');
  });

  it('retorna "ontem"', () => {
    const yesterday = new Date(Date.now() - 25 * 3600 * 1000).toISOString();
    expect(timeAgo(yesterday)).toBe('ontem');
  });

  it('retorna dias', () => {
    const fourDaysAgo = new Date(Date.now() - 4 * 86400 * 1000).toISOString();
    expect(timeAgo(fourDaysAgo)).toBe('ha 4 dias');
  });
});

describe('formatChatTime', () => {
  it('retorna vazio para input vazio', () => {
    expect(formatChatTime(null)).toBe('');
    expect(formatChatTime('')).toBe('');
  });

  it('retorna "Agora" para menos de 1 minuto', () => {
    const now = new Date().toISOString();
    expect(formatChatTime(now)).toBe('Agora');
  });

  it('retorna minutos abreviados', () => {
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    expect(formatChatTime(tenMinAgo)).toBe('10m');
  });

  it('retorna horas abreviadas', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    expect(formatChatTime(twoHoursAgo)).toBe('2h');
  });
});

// ─── Duracao ────────────────────────────────────────────────────

describe('formatLateTime', () => {
  it('formata apenas minutos', () => {
    expect(formatLateTime(30)).toBe('30min');
  });

  it('formata apenas horas', () => {
    expect(formatLateTime(120)).toBe('2h');
  });

  it('formata horas e minutos', () => {
    expect(formatLateTime(90)).toBe('1h 30min');
  });

  it('retorna 0min para zero', () => {
    expect(formatLateTime(0)).toBe('0min');
  });

  it('retorna 0min para negativo', () => {
    expect(formatLateTime(-5)).toBe('0min');
  });

  it('formata valor grande', () => {
    expect(formatLateTime(600)).toBe('10h');
  });
});

describe('formatAudioTime', () => {
  it('formata segundos em M:SS', () => {
    expect(formatAudioTime(0)).toBe('0:00');
    expect(formatAudioTime(5)).toBe('0:05');
    expect(formatAudioTime(65)).toBe('1:05');
    expect(formatAudioTime(125)).toBe('2:05');
    expect(formatAudioTime(600)).toBe('10:00');
  });
});

// ─── CPF ────────────────────────────────────────────────────────

describe('formatCpf', () => {
  it('formata CPF valido', () => {
    expect(formatCpf('12345678901')).toBe('123.456.789-01');
  });

  it('formata CPF com caracteres nao numericos', () => {
    expect(formatCpf('123.456.789-01')).toBe('123.456.789-01');
  });

  it('retorna original se nao tem 11 digitos', () => {
    expect(formatCpf('1234')).toBe('1234');
    expect(formatCpf('123456789012')).toBe('123456789012');
  });

  it('retorna string vazia para null/undefined', () => {
    expect(formatCpf(null)).toBe('');
    expect(formatCpf(undefined)).toBe('');
  });
});

// ─── toInputDate ────────────────────────────────────────────────

describe('toInputDate', () => {
  it('converte Date para YYYY-MM-DD', () => {
    const date = new Date('2025-06-15T14:30:00Z');
    expect(toInputDate(date)).toBe('2025-06-15');
  });
});

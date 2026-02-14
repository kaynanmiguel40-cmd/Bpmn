import { describe, it, expect } from 'vitest';
import {
  validateAndSanitize,
  validatePartial,
  osOrderSchema,
  teamMemberSchema,
  agendaEventSchema,
  commentSchema,
  sectorSchema,
  clientSchema,
  sanitize,
} from '../validation';

describe('sanitize', () => {
  it('remove tags HTML', () => {
    expect(sanitize('<script>alert("xss")</script>')).toBe('');
    expect(sanitize('<b>bold</b>')).toBe('bold');
    expect(sanitize('texto normal')).toBe('texto normal');
  });

  it('mantem strings vazias e nao-strings', () => {
    expect(sanitize('')).toBe('');
    expect(sanitize(42)).toBe(42);
    expect(sanitize(null)).toBe(null);
  });
});

describe('osOrderSchema', () => {
  it('valida ordem valida', () => {
    const result = validateAndSanitize(osOrderSchema, {
      title: 'Instalar ar condicionado',
      priority: 'high',
      status: 'available',
    });
    expect(result.success).toBe(true);
    expect(result.data.title).toBe('Instalar ar condicionado');
    expect(result.data.priority).toBe('high');
  });

  it('rejeita titulo vazio', () => {
    const result = validateAndSanitize(osOrderSchema, {
      title: '',
      priority: 'medium',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('obrigatorio');
  });

  it('rejeita prioridade invalida', () => {
    const result = validateAndSanitize(osOrderSchema, {
      title: 'Teste',
      priority: 'super_alta',
    });
    expect(result.success).toBe(false);
  });

  it('sanitiza XSS no titulo', () => {
    const result = validateAndSanitize(osOrderSchema, {
      title: '<img onerror=alert(1) src=x>Tarefa',
      priority: 'medium',
    });
    expect(result.success).toBe(true);
    expect(result.data.title).not.toContain('<img');
  });

  it('aplica defaults', () => {
    const result = validateAndSanitize(osOrderSchema, {
      title: 'Tarefa',
    });
    expect(result.success).toBe(true);
    expect(result.data.priority).toBe('medium');
    expect(result.data.status).toBe('available');
    expect(result.data.type).toBe('normal');
    expect(result.data.expenses).toEqual([]);
    expect(result.data.checklist).toEqual([]);
  });
});

describe('teamMemberSchema', () => {
  it('valida membro valido', () => {
    const result = validateAndSanitize(teamMemberSchema, {
      name: 'Kaynan Silva',
      email: 'kaynan@teste.com',
      salaryMonth: 5000,
    });
    expect(result.success).toBe(true);
  });

  it('rejeita nome vazio', () => {
    const result = validateAndSanitize(teamMemberSchema, {
      name: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita salario negativo', () => {
    const result = validateAndSanitize(teamMemberSchema, {
      name: 'Teste',
      salaryMonth: -100,
    });
    expect(result.success).toBe(false);
  });

  it('aceita email vazio', () => {
    const result = validateAndSanitize(teamMemberSchema, {
      name: 'Teste',
      email: '',
    });
    expect(result.success).toBe(true);
  });
});

describe('agendaEventSchema', () => {
  it('valida evento valido', () => {
    const result = validateAndSanitize(agendaEventSchema, {
      title: 'Reuniao semanal',
      startDate: '2025-01-15T10:00:00',
      type: 'meeting',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita titulo vazio', () => {
    const result = validateAndSanitize(agendaEventSchema, {
      title: '',
      startDate: '2025-01-15',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita tipo invalido', () => {
    const result = validateAndSanitize(agendaEventSchema, {
      title: 'Teste',
      startDate: '2025-01-15',
      type: 'invalido',
    });
    expect(result.success).toBe(false);
  });
});

describe('commentSchema', () => {
  it('valida comentario valido', () => {
    const result = validateAndSanitize(commentSchema, {
      content: 'Finalizado com sucesso',
      orderId: 'os_123',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita comentario vazio', () => {
    const result = validateAndSanitize(commentSchema, {
      content: '',
      orderId: 'os_123',
    });
    expect(result.success).toBe(false);
  });
});

describe('sectorSchema', () => {
  it('valida setor valido', () => {
    const result = validateAndSanitize(sectorSchema, {
      label: 'Refrigeracao',
    });
    expect(result.success).toBe(true);
    expect(result.data.color).toBe('#3b82f6');
  });
});

describe('clientSchema', () => {
  it('valida cliente valido', () => {
    const result = validateAndSanitize(clientSchema, {
      name: 'Empresa ABC',
      email: 'contato@abc.com',
      phone: '11999998888',
      company: 'ABC Ltda',
    });
    expect(result.success).toBe(true);
    expect(result.data.name).toBe('Empresa ABC');
  });

  it('rejeita nome vazio', () => {
    const result = validateAndSanitize(clientSchema, {
      name: '',
    });
    expect(result.success).toBe(false);
    expect(result.error).toContain('obrigatorio');
  });

  it('aceita email vazio', () => {
    const result = validateAndSanitize(clientSchema, {
      name: 'Cliente Teste',
      email: '',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita email invalido', () => {
    const result = validateAndSanitize(clientSchema, {
      name: 'Cliente Teste',
      email: 'nao-e-email',
    });
    expect(result.success).toBe(false);
  });

  it('aplica defaults', () => {
    const result = validateAndSanitize(clientSchema, {
      name: 'Minimo',
    });
    expect(result.success).toBe(true);
    expect(result.data.phone).toBe('');
    expect(result.data.company).toBe('');
    expect(result.data.notes).toBe('');
  });
});

describe('osOrderSchema - campos SaaS', () => {
  it('aceita category valida', () => {
    const result = validateAndSanitize(osOrderSchema, {
      title: 'Fix login bug',
      category: 'bug',
    });
    expect(result.success).toBe(true);
    expect(result.data.category).toBe('bug');
  });

  it('rejeita category invalida', () => {
    const result = validateAndSanitize(osOrderSchema, {
      title: 'Teste',
      category: 'inexistente',
    });
    expect(result.success).toBe(false);
  });

  it('default category e internal', () => {
    const result = validateAndSanitize(osOrderSchema, {
      title: 'Tarefa generica',
    });
    expect(result.success).toBe(true);
    expect(result.data.category).toBe('internal');
  });

  it('aceita blockReason valido', () => {
    const result = validateAndSanitize(osOrderSchema, {
      title: 'Tarefa bloqueada',
      status: 'blocked',
      blockReason: 'approval',
    });
    expect(result.success).toBe(true);
    expect(result.data.blockReason).toBe('approval');
  });

  it('rejeita blockReason invalido', () => {
    const result = validateAndSanitize(osOrderSchema, {
      title: 'Teste',
      blockReason: 'motivo_falso',
    });
    expect(result.success).toBe(false);
  });

  it('aceita clientId e slaDeadline opcionais', () => {
    const result = validateAndSanitize(osOrderSchema, {
      title: 'Tarefa com SLA',
      clientId: 'cli_abc123',
      slaDeadline: '2025-06-01T12:00:00Z',
    });
    expect(result.success).toBe(true);
    expect(result.data.clientId).toBe('cli_abc123');
    expect(result.data.slaDeadline).toBe('2025-06-01T12:00:00Z');
  });

  it('aceita leadTimeHours numerico', () => {
    const result = validateAndSanitize(osOrderSchema, {
      title: 'Tarefa concluida',
      leadTimeHours: 48.5,
    });
    expect(result.success).toBe(true);
    expect(result.data.leadTimeHours).toBe(48.5);
  });
});

describe('validatePartial', () => {
  it('valida update parcial de ordem', () => {
    const result = validatePartial(osOrderSchema, {
      status: 'done',
    });
    expect(result.success).toBe(true);
    expect(result.data.status).toBe('done');
  });

  it('permite campos omitidos em update', () => {
    const result = validatePartial(osOrderSchema, {
      notes: 'Nota atualizada',
    });
    expect(result.success).toBe(true);
    expect(result.data.title).toBeUndefined();
  });
});

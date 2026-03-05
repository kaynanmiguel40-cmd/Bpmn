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
  osProjectSchema,
  eapFolderSchema,
  eapProjectSchema,
  eapTaskSchema,
  contentPostSchema,
  processOrderSchema,
  sanitize,
  sanitizeRichText,
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

  it('nao injeta defaults do Zod em updates parciais', () => {
    const result = validatePartial(osOrderSchema, {
      status: 'done',
    });
    expect(result.success).toBe(true);
    // Nao deve ter campos que nao estavam no input
    expect(result.data.priority).toBeUndefined();
    expect(result.data.type).toBeUndefined();
    expect(result.data.category).toBeUndefined();
  });
});

// ==================== OS PROJECT ====================

describe('osProjectSchema', () => {
  it('valida projeto valido', () => {
    const result = validateAndSanitize(osProjectSchema, {
      name: 'Projeto Alpha',
      description: 'Descricao do projeto',
    });
    expect(result.success).toBe(true);
    expect(result.data.status).toBe('active');
    expect(result.data.projectType).toBe('execution');
  });

  it('rejeita nome vazio', () => {
    const result = validateAndSanitize(osProjectSchema, { name: '' });
    expect(result.success).toBe(false);
    expect(result.error).toContain('obrigatorio');
  });

  it('aceita status "finished"', () => {
    const result = validateAndSanitize(osProjectSchema, {
      name: 'Projeto',
      status: 'finished',
    });
    expect(result.success).toBe(true);
    expect(result.data.status).toBe('finished');
  });

  it('rejeita status invalido', () => {
    const result = validateAndSanitize(osProjectSchema, {
      name: 'Projeto',
      status: 'cancelled',
    });
    expect(result.success).toBe(false);
  });
});

// ==================== EAP FOLDER ====================

describe('eapFolderSchema', () => {
  it('valida folder valido', () => {
    const result = validateAndSanitize(eapFolderSchema, {
      name: 'Pasta de Projetos',
      description: 'Todos os projetos ativos',
    });
    expect(result.success).toBe(true);
    expect(result.data.color).toBe('#3b82f6');
    expect(result.data.status).toBe('planning');
  });

  it('rejeita nome vazio', () => {
    const result = validateAndSanitize(eapFolderSchema, { name: '' });
    expect(result.success).toBe(false);
  });

  it('aceita todos os status validos', () => {
    for (const status of ['planning', 'active', 'completed', 'on_hold']) {
      const result = validateAndSanitize(eapFolderSchema, { name: 'Test', status });
      expect(result.success).toBe(true);
    }
  });

  it('rejeita status invalido', () => {
    const result = validateAndSanitize(eapFolderSchema, {
      name: 'Test',
      status: 'cancelled',
    });
    expect(result.success).toBe(false);
  });
});

// ==================== EAP PROJECT ====================

describe('eapProjectSchema', () => {
  it('valida projeto valido', () => {
    const result = validateAndSanitize(eapProjectSchema, {
      name: 'Sistema ERP',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'active',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita nome vazio', () => {
    const result = validateAndSanitize(eapProjectSchema, { name: '' });
    expect(result.success).toBe(false);
  });

  it('aceita folderId nullable', () => {
    const result = validateAndSanitize(eapProjectSchema, {
      name: 'Projeto',
      folderId: null,
    });
    expect(result.success).toBe(true);
    expect(result.data.folderId).toBeNull();
  });

  it('aceita folderId como string', () => {
    const result = validateAndSanitize(eapProjectSchema, {
      name: 'Projeto',
      folderId: 'folder_123',
    });
    expect(result.success).toBe(true);
    expect(result.data.folderId).toBe('folder_123');
  });
});

// ==================== EAP TASK ====================

describe('eapTaskSchema', () => {
  it('valida tarefa valida', () => {
    const result = validateAndSanitize(eapTaskSchema, {
      name: 'Implementar modulo de login',
      projectId: 'proj_123',
      durationDays: 5,
      progress: 50,
    });
    expect(result.success).toBe(true);
    expect(result.data.progress).toBe(50);
  });

  it('rejeita nome vazio', () => {
    const result = validateAndSanitize(eapTaskSchema, {
      name: '',
      projectId: 'proj_123',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita projectId vazio', () => {
    const result = validateAndSanitize(eapTaskSchema, {
      name: 'Tarefa',
      projectId: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita progress acima de 100', () => {
    const result = validateAndSanitize(eapTaskSchema, {
      name: 'Tarefa',
      projectId: 'proj_1',
      progress: 150,
    });
    expect(result.success).toBe(false);
  });

  it('rejeita progress negativo', () => {
    const result = validateAndSanitize(eapTaskSchema, {
      name: 'Tarefa',
      projectId: 'proj_1',
      progress: -10,
    });
    expect(result.success).toBe(false);
  });

  it('aceita predecessors com tipos validos', () => {
    const result = validateAndSanitize(eapTaskSchema, {
      name: 'Tarefa',
      projectId: 'proj_1',
      predecessors: [
        { taskId: 'task_1', type: 'FS', lag: 0 },
        { taskId: 'task_2', type: 'SS', lag: 2 },
      ],
    });
    expect(result.success).toBe(true);
    expect(result.data.predecessors).toHaveLength(2);
  });

  it('rejeita predecessor com tipo invalido', () => {
    const result = validateAndSanitize(eapTaskSchema, {
      name: 'Tarefa',
      projectId: 'proj_1',
      predecessors: [{ taskId: 'task_1', type: 'XX' }],
    });
    expect(result.success).toBe(false);
  });

  it('aplica defaults', () => {
    const result = validateAndSanitize(eapTaskSchema, {
      name: 'Tarefa minima',
      projectId: 'proj_1',
    });
    expect(result.success).toBe(true);
    expect(result.data.progress).toBe(0);
    expect(result.data.durationDays).toBe(1);
    expect(result.data.isMilestone).toBe(false);
    expect(result.data.predecessors).toEqual([]);
  });
});

// ==================== CONTENT POST ====================

describe('contentPostSchema', () => {
  it('valida post valido', () => {
    const result = validateAndSanitize(contentPostSchema, {
      title: 'Post sobre vendas',
      scheduledDate: '2025-06-15',
      platform: 'instagram',
      status: 'scheduled',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita titulo vazio', () => {
    const result = validateAndSanitize(contentPostSchema, {
      title: '',
      scheduledDate: '2025-06-15',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita data vazia', () => {
    const result = validateAndSanitize(contentPostSchema, {
      title: 'Post',
      scheduledDate: '',
    });
    expect(result.success).toBe(false);
  });

  it('aceita todas as plataformas validas', () => {
    for (const platform of ['instagram', 'facebook', 'tiktok', 'youtube']) {
      const result = validateAndSanitize(contentPostSchema, {
        title: 'Post',
        scheduledDate: '2025-06-15',
        platform,
      });
      expect(result.success).toBe(true);
    }
  });

  it('rejeita plataforma invalida', () => {
    const result = validateAndSanitize(contentPostSchema, {
      title: 'Post',
      scheduledDate: '2025-06-15',
      platform: 'twitter',
    });
    expect(result.success).toBe(false);
  });

  it('aceita todos os mediaTypes validos', () => {
    for (const mediaType of ['image', 'video', 'carousel', 'story', 'reel']) {
      const result = validateAndSanitize(contentPostSchema, {
        title: 'Post',
        scheduledDate: '2025-06-15',
        mediaType,
      });
      expect(result.success).toBe(true);
    }
  });

  it('aplica defaults', () => {
    const result = validateAndSanitize(contentPostSchema, {
      title: 'Post minimo',
      scheduledDate: '2025-06-15',
    });
    expect(result.success).toBe(true);
    expect(result.data.platform).toBe('instagram');
    expect(result.data.status).toBe('scheduled');
    expect(result.data.scheduledTime).toBe('12:00');
  });
});

// ==================== PROCESS ORDER ====================

describe('processOrderSchema', () => {
  it('valida ordem de processo valida', () => {
    const result = validateAndSanitize(processOrderSchema, {
      projectId: 'proj_1',
      elementId: 'elem_1',
      title: 'Processo de compra',
      description: 'Fluxo completo de compras',
      status: 'active',
    });
    expect(result.success).toBe(true);
  });

  it('rejeita projectId vazio', () => {
    const result = validateAndSanitize(processOrderSchema, {
      projectId: '',
      elementId: 'elem_1',
      title: 'Processo',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita elementId vazio', () => {
    const result = validateAndSanitize(processOrderSchema, {
      projectId: 'proj_1',
      elementId: '',
      title: 'Processo',
    });
    expect(result.success).toBe(false);
  });

  it('rejeita titulo vazio', () => {
    const result = validateAndSanitize(processOrderSchema, {
      projectId: 'proj_1',
      elementId: 'elem_1',
      title: '',
    });
    expect(result.success).toBe(false);
  });

  it('aceita steps estruturados', () => {
    const result = validateAndSanitize(processOrderSchema, {
      projectId: 'proj_1',
      elementId: 'elem_1',
      title: 'Processo',
      steps: [
        { order: 0, text: 'Passo 1', required: true },
        { order: 1, text: 'Passo 2', required: false },
      ],
    });
    expect(result.success).toBe(true);
    expect(result.data.steps).toHaveLength(2);
  });

  it('aceita risks estruturados', () => {
    const result = validateAndSanitize(processOrderSchema, {
      projectId: 'proj_1',
      elementId: 'elem_1',
      title: 'Processo',
      risks: [
        { description: 'Risco de atraso', severity: 'high', mitigation: 'Buffer de tempo' },
      ],
    });
    expect(result.success).toBe(true);
    expect(result.data.risks[0].severity).toBe('high');
  });

  it('rejeita severity invalida em risks', () => {
    const result = validateAndSanitize(processOrderSchema, {
      projectId: 'proj_1',
      elementId: 'elem_1',
      title: 'Processo',
      risks: [{ description: 'Risco', severity: 'critical' }],
    });
    expect(result.success).toBe(false);
  });

  it('aceita todos os status validos', () => {
    for (const status of ['draft', 'active', 'review', 'archived']) {
      const result = validateAndSanitize(processOrderSchema, {
        projectId: 'proj_1',
        elementId: 'elem_1',
        title: 'Processo',
        status,
      });
      expect(result.success).toBe(true);
    }
  });

  it('aplica defaults', () => {
    const result = validateAndSanitize(processOrderSchema, {
      projectId: 'proj_1',
      elementId: 'elem_1',
      title: 'Processo minimo',
    });
    expect(result.success).toBe(true);
    expect(result.data.status).toBe('draft');
    expect(result.data.version).toBe(1);
    expect(result.data.steps).toEqual([]);
    expect(result.data.risks).toEqual([]);
    expect(result.data.improvements).toEqual([]);
  });
});

// ==================== SANITIZE RICH TEXT ====================

describe('sanitizeRichText', () => {
  it('permite tags de formatacao basica', () => {
    const html = '<p>Texto <strong>negrito</strong> e <em>italico</em></p>';
    const result = sanitizeRichText(html);
    expect(result).toContain('<strong>');
    expect(result).toContain('<em>');
    expect(result).toContain('<p>');
  });

  it('permite tags de lista', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    const result = sanitizeRichText(html);
    expect(result).toContain('<ul>');
    expect(result).toContain('<li>');
  });

  it('remove scripts', () => {
    const html = '<p>Texto</p><script>alert("xss")</script>';
    const result = sanitizeRichText(html);
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
    expect(result).toContain('<p>');
  });

  it('mantem nao-strings inalteradas', () => {
    expect(sanitizeRichText(42)).toBe(42);
    expect(sanitizeRichText(null)).toBe(null);
  });
});

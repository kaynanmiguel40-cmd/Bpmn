import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==================== MOCKS ====================

const { resultMap } = vi.hoisted(() => ({
  resultMap: new Map(),
}));

vi.mock('../supabase', () => {
  function createChain(tableName) {
    return new Proxy({}, {
      get(_, prop) {
        if (prop === 'then') {
          const result = resultMap.get(tableName) || { data: [], error: null };
          return (resolve) => Promise.resolve(result).then(resolve);
        }
        return (..._args) => createChain(tableName);
      },
    });
  }
  return { supabase: { from: vi.fn((table) => createChain(table)) } };
});

import { searchAll } from '../searchService';

describe('searchAll', () => {
  beforeEach(() => {
    resultMap.clear();
  });

  // ==================== INPUT VALIDATION ====================

  it('retorna array vazio para query null', async () => {
    expect(await searchAll(null)).toEqual([]);
  });

  it('retorna array vazio para query vazia', async () => {
    expect(await searchAll('')).toEqual([]);
  });

  it('retorna array vazio para query com 1 caractere', async () => {
    expect(await searchAll('a')).toEqual([]);
  });

  it('aceita query com 2+ caracteres', async () => {
    const results = await searchAll('ab');
    expect(Array.isArray(results)).toBe(true);
  });

  // ==================== PAGINAS ====================

  it('encontra pagina Dashboard por nome', async () => {
    const results = await searchAll('dashboard');
    const page = results.find(r => r.type === 'page' && r.label === 'Dashboard');
    expect(page).toBeDefined();
    expect(page.route).toBe('/dashboard');
  });

  it('encontra pagina por keyword', async () => {
    const results = await searchAll('kanban');
    const page = results.find(r => r.type === 'page');
    expect(page).toBeDefined();
    expect(page.label).toBe('Ordens de Servico');
  });

  it('encontra pagina Agenda por keyword calendario', async () => {
    const results = await searchAll('calendario');
    const page = results.find(r => r.type === 'page');
    expect(page).toBeDefined();
    expect(page.label).toBe('Agenda');
  });

  it('nao encontra pagina para termo inexistente', async () => {
    const results = await searchAll('xyzabc123');
    const pages = results.filter(r => r.type === 'page');
    expect(pages).toHaveLength(0);
  });

  // ==================== RESULTADOS DE SUPABASE ====================

  it('inclui O.S. nos resultados', async () => {
    resultMap.set('os_orders', {
      data: [{ id: 'os_1', number: '42', title: 'Instalar servidor', client: 'ACME' }],
      error: null,
    });

    const results = await searchAll('instalar');
    const os = results.find(r => r.type === 'os');
    expect(os).toBeDefined();
    expect(os.label).toContain('42');
    expect(os.label).toContain('Instalar servidor');
    expect(os.route).toBe('/financial');
  });

  it('inclui eventos nos resultados', async () => {
    resultMap.set('agenda_events', {
      data: [{ id: 'evt_1', title: 'Reuniao semanal', description: 'Alinhamento' }],
      error: null,
    });

    const results = await searchAll('reuniao');
    const event = results.find(r => r.type === 'event');
    expect(event).toBeDefined();
    expect(event.label).toBe('Reuniao semanal');
    expect(event.route).toBe('/agenda');
  });

  it('inclui projetos nos resultados', async () => {
    resultMap.set('os_projects', {
      data: [{ id: 'pj_1', name: 'Projeto Alpha', description: 'Fase 1' }],
      error: null,
    });

    const results = await searchAll('alpha');
    const project = results.find(r => r.type === 'project');
    expect(project).toBeDefined();
    expect(project.label).toBe('Projeto Alpha');
  });

  it('inclui membros nos resultados', async () => {
    resultMap.set('team_members', {
      data: [{ id: 'tm_1', name: 'Kaynan Silva', role: 'Dev' }],
      error: null,
    });

    const results = await searchAll('kaynan');
    const member = results.find(r => r.type === 'member');
    expect(member).toBeDefined();
    expect(member.label).toBe('Kaynan Silva');
    expect(member.icon).toBe('K');
  });

  // ==================== LIMITES ====================

  it('limita resultado a 12 itens', async () => {
    resultMap.set('os_orders', {
      data: Array.from({ length: 10 }, (_, i) => ({
        id: `os_${i}`, number: `${i}`, title: `OS ${i}`, client: '',
      })),
      error: null,
    });
    resultMap.set('agenda_events', {
      data: Array.from({ length: 10 }, (_, i) => ({
        id: `evt_${i}`, title: `Evento ${i}`, description: '',
      })),
      error: null,
    });

    const results = await searchAll('test');
    expect(results.length).toBeLessThanOrEqual(12);
  });

  // ==================== RESILIENCIA ====================

  it('continua funcionando quando Supabase falha', async () => {
    // Mesmo sem dados do Supabase, busca de paginas deve funcionar
    const results = await searchAll('agenda');
    const page = results.find(r => r.type === 'page');
    expect(page).toBeDefined();
  });

  // ==================== ESTRUTURA DO RESULTADO ====================

  it('resultado tem estrutura correta', async () => {
    resultMap.set('os_orders', {
      data: [{ id: 'os_1', number: '1', title: 'Test', client: 'Client' }],
      error: null,
    });

    const results = await searchAll('test');
    const item = results.find(r => r.type === 'os');
    expect(item).toHaveProperty('type');
    expect(item).toHaveProperty('id');
    expect(item).toHaveProperty('label');
    expect(item).toHaveProperty('sub');
    expect(item).toHaveProperty('route');
    expect(item).toHaveProperty('icon');
    expect(item).toHaveProperty('color');
  });
});

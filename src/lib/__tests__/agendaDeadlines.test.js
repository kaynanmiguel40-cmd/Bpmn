import { describe, it, expect } from 'vitest';
import { buildOSDeadlineEvents } from '../agendaDeadlines';

// resolvedor nome→membro (como a AgendaPage passa)
const MEMBERS = [{ id: 'm-elias', name: 'Elias' }, { id: 'm-kaua', name: 'Kauã' }];
const byName = (name) => MEMBERS.find((m) => m.name === name) || null;

const order = (over = {}) => ({
  id: 'os1', number: 12, type: 'normal', status: 'in_progress', mode: 'solo',
  title: 'Site da Construtora', assignee: 'Elias', assignedTo: '',
  estimatedEnd: null, checklist: [], checklistGroups: [], ...over,
});
const item = (over = {}) => ({ id: 'i1', text: 'Tarefa', group: '', done: false, dueAt: null, ...over });

describe('buildOSDeadlineEvents — pega os prazos da O.S.', () => {
  it('1) prazo PRÓPRIO do item vira evento "Prazo"', () => {
    const ev = buildOSDeadlineEvents([order({
      checklist: [item({ id: 'i1', text: 'Subir banner', dueAt: '2026-06-25T18:00:00Z' })],
    })], byName);
    expect(ev).toHaveLength(1);
    expect(ev[0].typeLabel).toBe('Prazo');
    expect(ev[0].title).toBe('Subir banner · #12');
    expect(ev[0].startDate).toBe('2026-06-25T18:00:00.000Z');
    expect(ev[0].assignee).toBe('m-elias'); // responsável da O.S.
    expect(ev[0]._osId).toBe('os1');
  });

  it('2) item SEM prazo próprio NÃO herda do grupo (não infla a agenda)', () => {
    const ev = buildOSDeadlineEvents([order({
      checklist: [item({ id: 'i1', text: 'Editar reel', group: 'Marketing', dueAt: null })],
      checklistGroups: [{ name: 'Marketing', dueAt: '2026-06-30T12:00:00Z' }],
    })], byName);
    expect(ev).toHaveLength(0); // sem prazo no item = não aparece como tarefa
  });

  it('3) prazo de ENTREGA da O.S. (estimatedEnd) vira marco "Entrega O.S."', () => {
    const ev = buildOSDeadlineEvents([order({
      estimatedEnd: '2026-07-10T17:00:00Z',
      checklist: [item({ dueAt: null })], // pendente, sem prazo próprio
    })], byName);
    const entrega = ev.find((e) => e.typeLabel === 'Entrega O.S.');
    expect(entrega).toBeTruthy();
    expect(entrega.title).toBe('Entrega · #12 Site da Construtora');
    expect(entrega.startDate).toBe('2026-07-10T17:00:00.000Z');
    expect(entrega.assignee).toBe('m-elias');
  });

  it('mostra só item com prazo próprio + a entrega da O.S. (grupo não conta)', () => {
    const ev = buildOSDeadlineEvents([order({
      estimatedEnd: '2026-07-10T17:00:00Z',
      checklist: [
        item({ id: 'a', text: 'A', dueAt: '2026-06-25T10:00:00Z' }),   // prazo próprio → aparece
        item({ id: 'b', text: 'B', group: 'Dev', dueAt: null }),        // sem prazo próprio → NÃO aparece
      ],
      checklistGroups: [{ name: 'Dev', dueAt: '2026-06-28T10:00:00Z' }],
    })], byName);
    expect(ev.filter((e) => e.typeLabel === 'Prazo')).toHaveLength(1);
    expect(ev.filter((e) => e.typeLabel === 'Entrega O.S.')).toHaveLength(1);
  });

  it('NÃO vaza tarefa concluída nem O.S. sem nenhum prazo', () => {
    const ev = buildOSDeadlineEvents([
      order({ id: 'done', checklist: [item({ done: true, dueAt: '2026-06-25T10:00:00Z' })] }),
      order({ id: 'noDeadline', estimatedEnd: null, checklist: [item({ dueAt: null })] }),
    ], byName);
    expect(ev).toHaveLength(0);
  });

  it('O.S. finalizada (status done) não mostra marco de entrega', () => {
    const ev = buildOSDeadlineEvents([order({
      status: 'done', estimatedEnd: '2026-07-10T17:00:00Z', checklist: [item({ done: true })],
    })], byName);
    expect(ev).toHaveLength(0);
  });

  it('time (>1 responsável): item escolhido vai pro responsável; senão pra todos', () => {
    const ev = buildOSDeadlineEvents([order({
      mode: 'team',
      participants: [{ name: 'Elias' }, { name: 'Kauã' }],
      checklist: [
        item({ id: 'x', text: 'X', assigneeName: 'Kauã', dueAt: '2026-06-25T10:00:00Z' }),
        item({ id: 'y', text: 'Y', dueAt: '2026-06-26T10:00:00Z' }), // sem dono → todos
      ],
    })], byName);
    const x = ev.filter((e) => e.title.startsWith('X'));
    const y = ev.filter((e) => e.title.startsWith('Y'));
    expect(x).toHaveLength(1);
    expect(x[0].assignee).toBe('m-kaua');
    expect(y).toHaveLength(2); // um por participante
    expect(y.map((e) => e.assignee).sort()).toEqual(['m-elias', 'm-kaua']);
  });

  it('prazo inválido é ignorado (sem evento quebrado)', () => {
    const ev = buildOSDeadlineEvents([order({
      checklist: [item({ dueAt: 'data-invalida' })],
    })], byName);
    expect(ev).toHaveLength(0);
  });
});

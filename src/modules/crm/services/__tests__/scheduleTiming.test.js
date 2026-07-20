import { describe, it, expect } from 'vitest';
import { scheduleTiming } from '../crmAgendaService';

const h = (hora, min = 0) => new Date(2026, 6, 20, hora, min).toISOString();

/**
 * Previsto x realizado: era pra concluir às 20h, concluiu 20:20.
 *
 * Serve pra ver se a cadência está sendo cumprida no horário ou se o dia inteiro
 * anda arrastado — um atraso de 20min repetido em 12 tarefas é o dia acabando
 * às 22h sem ninguém ter percebido.
 */
describe('scheduleTiming', () => {
  it('mostra o atraso quando concluiu depois do previsto', () => {
    const t = scheduleTiming(h(20, 0), h(20, 20));
    expect(t.state).toBe('late');
    expect(t.label).toBe('+20min');
    expect(t.diffMin).toBe(20);
  });

  it('mostra o adiantamento quando concluiu antes', () => {
    const t = scheduleTiming(h(20, 0), h(19, 30));
    expect(t.state).toBe('early');
    expect(t.label).toBe('−30min');
  });

  // Cinco minutos não é desvio, é a vida. Marcar isso como atraso encheria a
  // tela de alerta em tarefa que saiu no horário — e alerta que sempre aparece
  // para de ser lido.
  it('diferença abaixo de 5 minutos conta como no horário', () => {
    expect(scheduleTiming(h(20, 0), h(20, 4)).state).toBe('on_time');
    expect(scheduleTiming(h(20, 0), h(19, 56)).state).toBe('on_time');
    expect(scheduleTiming(h(20, 0), h(20, 4)).label).toBe('no horário');
  });

  it('atraso de horas aparece em horas, não em minutos', () => {
    expect(scheduleTiming(h(9, 0), h(11, 30)).label).toBe('+2h30');
    expect(scheduleTiming(h(9, 0), h(11, 0)).label).toBe('+2h');
  });

  // Tarefa pendente não tem "realizado": sem os dois horários não há
  // comparação a fazer, e inventar uma seria dizer que atrasou quem ainda tem
  // tempo.
  it('sem um dos horários não devolve nada', () => {
    expect(scheduleTiming(h(20), null)).toBeNull();
    expect(scheduleTiming(null, h(20))).toBeNull();
    expect(scheduleTiming(null, null)).toBeNull();
  });
});

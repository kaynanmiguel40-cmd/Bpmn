import { describe, it, expect } from 'vitest';
import {
  meetingSlots, horarioLembrete, WORK_START_MIN, WORK_END_HOUR,
} from '../crmScheduling';
import { montarDiasComSlots } from '../../lib/meetingDays';

/**
 * Uma reunião ocupa um BLOCO, não um toque de 30 min. Os limites que importam:
 * não invadir o almoço (11-12), não passar das 18h, não cair em cima do que já
 * existe na agenda.
 */
describe('meetingSlots (bloco de reunião)', () => {
  // Deriva do expediente em vez de cravar 9h: o inicio ja mudou uma vez (pra
  // 8:10) e o teste quebrou sem que nada de errado tivesse acontecido. O que
  // importa aqui e a REGRA — abre no inicio do expediente, fecha a tempo do
  // bloco terminar as 18h —, nao o numero do dia em que foi escrito.
  it('dia vazio: abre no inicio do expediente e o ultimo bloco termina as 18h', () => {
    const s = meetingSlots([], 60);
    expect(s[0]).toBe(WORK_START_MIN);
    expect(s[s.length - 1]).toBe(WORK_END_HOUR * 60 - 60);
  });

  // Um bloco de 60min começando 10:30 terminaria 11:30 — pega o almoço. E 11:30
  // começaria dentro do almoço. Nenhum dos dois pode aparecer.
  it('não oferece bloco que invade o almoço', () => {
    const s = meetingSlots([], 60);
    expect(s).not.toContain(10 * 60 + 30); // 10:30 → 11:30 invade
    expect(s).not.toContain(11 * 60);      // 11:00 dentro do almoço
    expect(s).not.toContain(11 * 60 + 30); // 11:30 dentro do almoço
    expect(s).toContain(10 * 60);          // 10:00 → 11:00 encosta mas cabe
    expect(s).toContain(12 * 60);          // 12:00 → 13:00 depois do almoço
  });

  it('não passa das 18h', () => {
    const s = meetingSlots([], 60);
    expect(s).not.toContain(17 * 60 + 30); // 17:30 → 18:30 passa
  });

  it('pula um horário já ocupado (e o bloco que colide com ele)', () => {
    const busy = [{ start: '2026-07-21T14:00:00', end: '2026-07-21T15:00:00' }];
    const s = meetingSlots(busy, 60);
    expect(s).not.toContain(14 * 60);      // exatamente em cima
    expect(s).not.toContain(13 * 60 + 30); // 13:30 → 14:30 colide
    expect(s).toContain(15 * 60);          // 15:00 livre logo depois
  });

  it('reunião mais curta abre mais horários (30min encosta no almoço)', () => {
    const s = meetingSlots([], 30);
    expect(s).toContain(10 * 60 + 30); // 10:30 → 11:00 cabe antes do almoço
  });
});

/**
 * A grade do modal: só dias úteis, só dias COM vaga, e nunca um horário que já
 * passou hoje.
 */
describe('montarDiasComSlots', () => {
  // Sexta 2026-07-24 09:00 → os dias devem pular sáb/dom.
  const sexta = new Date(2026, 6, 24, 9, 0, 0);

  it('não inclui sábado nem domingo', () => {
    const dias = montarDiasComSlots([], { from: sexta, dias: 3 });
    const dows = dias.map((d) => d.data.getDay());
    expect(dows).not.toContain(0);
    expect(dows).not.toContain(6);
  });

  it('devolve a quantidade de dias úteis pedida', () => {
    const dias = montarDiasComSlots([], { from: sexta, dias: 3 });
    expect(dias).toHaveLength(3);
    // sexta, depois segunda, terça (pulou o fim de semana)
    expect(dias[0].data.getDay()).toBe(5);
    expect(dias[1].data.getDay()).toBe(1);
  });

  // Hoje às 16h: os slots das 9h/10h/... já passaram; só devem sobrar 16h+.
  it('hoje não oferece horário que já passou', () => {
    const hoje4pm = new Date(2026, 6, 24, 16, 0, 0);
    const dias = montarDiasComSlots([], { from: hoje4pm, dias: 1 });
    const primeiros = dias[0].slots.map((s) => s.label);
    expect(primeiros).not.toContain('09:00');
    expect(primeiros.every((l) => l >= '16:00')).toBe(true);
  });

  it('dia lotado some da grade', () => {
    // Ocupa a segunda inteira (9-18) → ela não aparece.
    const busy = [{ start: '2026-07-27T09:00:00', end: '2026-07-27T18:00:00' }];
    const dias = montarDiasComSlots(busy, { from: sexta, dias: 5 });
    expect(dias.some((d) => d.chave === '2026-07-27')).toBe(false);
  });
});

/**
 * O lembrete ancora na reunião. O snap da véspera é o detalhe que engana: 24h
 * antes de uma reunião das 15h cairia às 15h do dia anterior — mas "confirmar
 * presença na véspera" é tarefa de manhã.
 */
describe('horarioLembrete', () => {
  const reuniao = new Date(2026, 6, 23, 15, 0, 0); // qui 23/07 15:00

  it('véspera (−1440) vira 9h da manhã do dia anterior, não 15h', () => {
    const t = horarioLembrete(reuniao, -1440);
    expect(t.getDate()).toBe(22);
    expect(t.getHours()).toBe(9);
    expect(t.getMinutes()).toBe(0);
  });

  it('1h antes (−60) fica exato, no mesmo dia', () => {
    const t = horarioLembrete(reuniao, -60);
    expect(t.getDate()).toBe(23);
    expect(t.getHours()).toBe(14);
  });

  it('na hora +5 fica exato', () => {
    const t = horarioLembrete(reuniao, 5);
    expect(t.getDate()).toBe(23);
    expect(t.getHours()).toBe(15);
    expect(t.getMinutes()).toBe(5);
  });

  // Só snapa quem cai em outro dia ANTES. Um lembrete depois da reunião no dia
  // seguinte (não é o caso aqui, mas a regra tem que ser específica) fica exato.
  it('offset que não cruza pra dia anterior não é snapado', () => {
    const cedo = new Date(2026, 6, 23, 10, 0, 0);
    const t = horarioLembrete(cedo, -60); // 09:00 mesmo dia
    expect(t.getHours()).toBe(9);
    expect(t.getMinutes()).toBe(0);
    expect(t.getDate()).toBe(23);
  });
});

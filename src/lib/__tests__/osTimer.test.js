import { describe, it, expect } from 'vitest';
import {
  startTask, pauseTask, resumeTask, finishTask, reopenTask, workedMinutes, timerState,
} from '../osTimer';

const T9 = '2026-06-22T09:00:00.000Z';
const T10 = '2026-06-22T10:00:00.000Z';
const T1030 = '2026-06-22T10:30:00.000Z';
const T11 = '2026-06-22T11:00:00.000Z';
// minutos REAIS de relógio (o cronômetro conta isso, não horas comerciais)
const realMin = (a, b) => Math.max(0, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 60000));

const item = (over = {}) => ({
  id: 't1', text: 'Tarefa', done: false,
  startedAt: null, completedAt: null, durationMin: null, pausedAt: null, accumulatedMin: 0,
  ...over,
});
const find = (cl, id = 't1') => cl.find((i) => i.id === id);

describe('timerState', () => {
  it('idle / running / paused / done', () => {
    expect(timerState(item())).toBe('idle');
    expect(timerState(item({ startedAt: T9 }))).toBe('running');
    expect(timerState(item({ startedAt: T9, pausedAt: T10 }))).toBe('paused');
    expect(timerState(item({ done: true }))).toBe('done');
  });
});

describe('startTask (Pegar) — começa do zero', () => {
  it('idle → running e o tempo trabalhado começa em ~0', () => {
    const cl = startTask([item()], 't1', { at: T9 });
    expect(find(cl).startedAt).toBe(T9);
    expect(find(cl).pausedAt).toBeNull();
    expect(workedMinutes(find(cl), T9)).toBe(0); // acabou de pegar = 0, sem fantasma
  });
  it('já rodando → não reinicia', () => {
    const cl = startTask([item({ startedAt: T9 })], 't1', { at: T10 });
    expect(find(cl).startedAt).toBe(T9);
  });
  it('concluída → ignora', () => {
    expect(find(startTask([item({ done: true })], 't1', { at: T9 })).startedAt).toBeNull();
  });
});

describe('workedMinutes (ao vivo) — conta tempo REAL', () => {
  it('running: acumulado + segmento desde startedAt', () => {
    expect(workedMinutes(item({ startedAt: T9 }), T10)).toBe(realMin(T9, T10)); // 60
    expect(workedMinutes(item({ startedAt: T9, accumulatedMin: 15 }), T10)).toBe(15 + realMin(T9, T10));
  });
  it('idle/paused/done: só o acumulado (não conta segmento)', () => {
    expect(workedMinutes(item(), T10)).toBe(0);
    expect(workedMinutes(item({ startedAt: T9, pausedAt: T10, accumulatedMin: 60 }), T11)).toBe(60);
    expect(workedMinutes(item({ done: true, accumulatedMin: 90 }), T11)).toBe(90);
  });
});

describe('pauseTask (Pausar)', () => {
  it('running → paused, congela o segmento real em accumulatedMin', () => {
    const cl = pauseTask([item({ startedAt: T9 })], 't1', { at: T10 });
    expect(find(cl).pausedAt).toBe(T10);
    expect(find(cl).accumulatedMin).toBe(realMin(T9, T10)); // 60
  });
  it('soma ao acumulado existente', () => {
    const cl = pauseTask([item({ startedAt: T10, accumulatedMin: 30 })], 't1', { at: T11 });
    expect(find(cl).accumulatedMin).toBe(30 + realMin(T10, T11));
  });
  it('não rodando → ignora', () => {
    expect(find(pauseTask([item()], 't1', { at: T10 })).pausedAt).toBeNull();
  });
});

describe('resumeTask (Retomar)', () => {
  it('paused → running (novo startedAt, mantém acumulado)', () => {
    const cl = resumeTask([item({ startedAt: T9, pausedAt: T10, accumulatedMin: 60 })], 't1', { at: T1030 });
    const i = find(cl);
    expect(i.startedAt).toBe(T1030);
    expect(i.pausedAt).toBeNull();
    expect(i.accumulatedMin).toBe(60);
  });
});

describe('finishTask (Finalizar)', () => {
  it('running → done, durationMin = acumulado + segmento real', () => {
    const cl = finishTask([item({ startedAt: T9, accumulatedMin: 30 })], 't1', { at: T10 });
    const i = find(cl);
    expect(i.done).toBe(true);
    expect(i.completedAt).toBe(T10);
    expect(i.durationMin).toBe(30 + realMin(T9, T10));
    expect(i.accumulatedMin).toBe(i.durationMin);
    expect(i.pausedAt).toBeNull();
  });
  it('SEM ter pego (idle) → 0 min, sem tempo fantasma', () => {
    const cl = finishTask([item()], 't1', { at: T1030 });
    expect(find(cl).durationMin).toBe(0);
    expect(find(cl).startedAt).toBeNull();
  });
  it('paused → NÃO soma segmento (usa só o acumulado)', () => {
    const cl = finishTask([item({ startedAt: T9, pausedAt: T10, accumulatedMin: 60 })], 't1', { at: T11 });
    expect(find(cl).durationMin).toBe(60);
  });
});

describe('reopenTask (Reabrir)', () => {
  it('desmarca preservando accumulatedMin', () => {
    const cl = reopenTask([item({ done: true, completedAt: T10, durationMin: 90, accumulatedMin: 90 })], 't1');
    const i = find(cl);
    expect(i.done).toBe(false);
    expect(i.completedAt).toBeNull();
    expect(i.durationMin).toBeNull();
    expect(i.accumulatedMin).toBe(90);
  });
});

describe('ciclo pegar → pausar → retomar → finalizar acumula os 2 segmentos', () => {
  it('soma o tempo real das duas janelas', () => {
    let cl = [item()];
    cl = startTask(cl, 't1', { at: T9 });      // 09:00
    cl = pauseTask(cl, 't1', { at: T10 });     // 10:00 → 60min
    cl = resumeTask(cl, 't1', { at: T1030 });  // 10:30
    cl = finishTask(cl, 't1', { at: T11 });    // 11:00 → +30min
    expect(find(cl).durationMin).toBe(realMin(T9, T10) + realMin(T1030, T11)); // 90
  });
});

describe('imutabilidade', () => {
  it('não muta o checklist original', () => {
    const original = [item({ startedAt: T9 })];
    const snap = JSON.stringify(original);
    startTask(original, 't1', { at: T10 });
    pauseTask(original, 't1', { at: T10 });
    finishTask(original, 't1', { at: T10 });
    expect(JSON.stringify(original)).toBe(snap);
  });
});

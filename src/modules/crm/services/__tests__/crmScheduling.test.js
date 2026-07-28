import { describe, it, expect } from 'vitest';
import { daySlots, findFreeSlot, planSteps, dayKey, nextBusinessDay, WORK_START_HOUR, SLOT_MINUTES, empurrarFila } from '../crmScheduling';

// Ultimo slot do dia: o expediente vai ate 18h, entao o ultimo toque comeca a
// 18h menos a duracao de um slot (17:55 com slots de 5min, 17:30 com 30min).
const ULTIMO = `17:${String(60 - SLOT_MINUTES).padStart(2, '0')}`;
// Ultimo slot da manha: antes do almoco (11h) menos a duracao do slot.
const ULTIMO_MANHA = `10:${String(60 - SLOT_MINUTES).padStart(2, '0')}`;

const hhmm = (min) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`;
// Helper: ISO de um horario num dia fixo (2026-07-20 = segunda-feira)
const at = (h, m = 0) => new Date(2026, 6, 20, h, m).toISOString();

describe('daySlots — expediente 9-18 com almoco 11-12', () => {
  const slots = daySlots();
  it('comeca as 9h e o ultimo termina as 18h', () => {
    expect(hhmm(slots[0])).toBe('09:00');
    expect(hhmm(slots[slots.length - 1])).toBe(ULTIMO);
  });
  it('nao agenda nada dentro do almoco', () => {
    const dentro = slots.filter(s => s >= 11 * 60 && s < 12 * 60);
    expect(dentro).toHaveLength(0);
  });
  it('nao deixa slot INVADIR o almoco (o bloco inteiro termina ate 11h)', () => {
    // Nenhum slot pode terminar depois das 11h e comecar antes das 12h.
    const invade = slots.filter(s => s + SLOT_MINUTES > 11 * 60 && s < 12 * 60);
    expect(invade).toHaveLength(0);
  });
  it('retoma as 12h depois do almoco', () => {
    expect(slots.map(hhmm)).toContain('12:00');
    expect(slots.map(hhmm)).toContain('10:30');
  });
});

describe('turno (manha/tarde) — "sempre ligar de manha e a tarde"', () => {
  it('manha vai das 9h ate antes do almoco', () => {
    const s = daySlots('manha').map(hhmm);
    expect(s[0]).toBe('09:00');
    expect(s[s.length - 1]).toBe(ULTIMO_MANHA); // ultimo bloco termina 11:00
    expect(s).not.toContain('12:00');
  });
  it('tarde comeca depois do almoco', () => {
    const s = daySlots('tarde').map(hhmm);
    expect(s[0]).toBe('12:00');
    expect(s[s.length - 1]).toBe(ULTIMO);
    expect(s).not.toContain('09:00');
  });
  it('sem turno = dia inteiro', () => {
    expect(daySlots().length).toBeGreaterThan(daySlots('manha').length);
  });

  it('as duas ligacoes do MESMO dia caem em turnos diferentes', () => {
    const plan = planSteps([
      { id: 'manha', dayOffset: 0, period: 'manha' },
      { id: 'tarde', dayOffset: 0, period: 'tarde' },
    ], {}, new Date(2026, 6, 20));
    expect(plan[0].start.getHours()).toBeLessThan(11);
    expect(plan[1].start.getHours()).toBeGreaterThanOrEqual(12);
  });

  it('manha lotada NAO joga a ligacao pra tarde — empurra pro dia seguinte', () => {
    // Sem isto o "ligar de manha" viraria uma ligacao as 17h.
    const busy = { '2026-07-20': [{ start: at(9, 0), end: at(11, 0) }] };
    const plan = planSteps([{ id: 'a', dayOffset: 0, period: 'manha' }], busy, new Date(2026, 6, 20));
    expect(dayKey(plan[0].start)).toBe('2026-07-21');
    expect(plan[0].start.getHours()).toBeLessThan(11);
  });
});

describe('findFreeSlot', () => {
  it('dia vazio -> 9h', () => {
    expect(hhmm(findFreeSlot([]))).toBe('09:00');
  });
  it('pula o horario ja ocupado', () => {
    const busy = [{ start: at(9, 0), end: at(9, 30) }];
    expect(hhmm(findFreeSlot(busy))).toBe('09:30');
  });
  it('pula reuniao longa (9h-11h) e cai depois do almoco', () => {
    const busy = [{ start: at(9, 0), end: at(11, 0) }];
    expect(hhmm(findFreeSlot(busy))).toBe('12:00');
  });
  it('atividade sem fim ocupa um slot (SLOT_MINUTES)', () => {
    const busy = [{ start: at(9, 0) }];
    // Sem end, o ocupado dura SLOT_MINUTES; o proximo livre e logo depois.
    expect(hhmm(findFreeSlot(busy))).toBe(hhmm(9 * 60 + SLOT_MINUTES));
  });
  it('respeita afterMinutes (empilhar no mesmo dia)', () => {
    expect(hhmm(findFreeSlot([], 9 * 60))).toBe(hhmm(9 * 60 + SLOT_MINUTES));
  });
  it('dia lotado -> null (nao fura a regra)', () => {
    const busy = [{ start: at(9, 0), end: at(18, 0) }];
    expect(findFreeSlot(busy)).toBeNull();
  });
});

describe('planSteps', () => {
  const from = new Date(2026, 6, 20); // segunda

  it('duas tarefas no mesmo dia NAO caem no mesmo horario (espalha pelo dia)', () => {
    const plan = planSteps([
      { id: 'a', dayOffset: 0 },
      { id: 'b', dayOffset: 0 },
    ], {}, from);
    expect(plan).toHaveLength(2);
    expect(plan[0].start.getTime()).not.toBe(plan[1].start.getTime());
    expect(plan[0].start.getHours()).toBe(9);
    expect(plan[0].start.getMinutes()).toBe(0);
    // Folga do mesmo lead: 3h. a=09:00 -> b=12:00 (manha -> meio-dia).
    expect(plan[1].start.getHours()).toBe(12);
    expect(plan[1].start.getMinutes()).toBe(0);
  });

  it('respeita o dayOffset', () => {
    const plan = planSteps([{ id: 'a', dayOffset: 3 }], {}, from);
    expect(dayKey(plan[0].start)).toBe('2026-07-23');
  });

  it('desvia de atividade que ja existe na agenda', () => {
    const busy = { '2026-07-20': [{ start: at(9, 0), end: at(10, 0) }] };
    const plan = planSteps([{ id: 'a', dayOffset: 0 }], busy, from);
    expect(plan[0].start.getHours()).toBe(10);
  });

  it('dia lotado EMPURRA pro proximo dia util (nao descarta a tarefa)', () => {
    // 20/07 inteiro ocupado -> a tarefa tem que cair no dia 21, nao sumir.
    const busy = { '2026-07-20': [{ start: at(9, 0), end: at(18, 0) }] };
    const plan = planSteps([{ id: 'a', dayOffset: 0 }], busy, from);
    expect(plan).toHaveLength(1);
    expect(dayKey(plan[0].start)).toBe('2026-07-21');
    expect(plan[0].start.getHours()).toBe(9);
  });

  it('joga pro dia util quando o offset cai no fim de semana', () => {
    // 20/07 (seg) + 5 = 25/07 (sabado) -> vai pra segunda 27
    const plan = planSteps([{ id: 'a', dayOffset: 5 }], {}, from);
    const d = plan[0].start;
    expect(d.getDay()).not.toBe(0);
    expect(d.getDay()).not.toBe(6);
    expect(dayKey(d)).toBe('2026-07-27');
  });

  /**
   * O bug que motivou isto: com a agenda cheia, o D2 rolava pra frente
   * atravessando os dias lotados e caia DEPOIS do D9 (que achou vaga antes) — a
   * cadencia saia fora de ordem no checklist. A regra: passo nunca cai antes do
   * anterior.
   */
  it('as datas nunca retrocedem — offset menor nunca cai depois de offset maior', () => {
    // D0 lotado nos primeiros dias forca rollover; D2 nao pode acabar antes do D0.
    const busy = {
      '2026-07-20': [{ start: at(9, 0), end: at(18, 0) }],
      '2026-07-21': [{ start: at(9, 0), end: at(18, 0) }],
      '2026-07-22': [{ start: at(9, 0), end: at(18, 0) }],
    };
    const plan = planSteps([
      { id: 'd0', dayOffset: 0 },
      { id: 'd2', dayOffset: 2 },
      { id: 'd9', dayOffset: 9 },
    ], busy, from);
    const dias = plan.map(p => p.start.getTime());
    // Cada um >= o anterior. Sem o piso, d2 cairia antes por causa do rollover.
    expect(dias[1]).toBeGreaterThanOrEqual(dias[0]);
    expect(dias[2]).toBeGreaterThanOrEqual(dias[1]);
  });

  it('sem compromisso real, cada offset cai no seu proprio dia (nao empurra)', () => {
    // Sem busy: D0->20, D2->22, D3->23. Nada rola, nada estica.
    const plan = planSteps([
      { id: 'd0', dayOffset: 0 },
      { id: 'd2', dayOffset: 2 },
      { id: 'd3', dayOffset: 3 },
    ], {}, from);
    expect(dayKey(plan[0].start)).toBe('2026-07-20');
    expect(dayKey(plan[1].start)).toBe('2026-07-22');
    expect(dayKey(plan[2].start)).toBe('2026-07-23');
  });
});

describe('nextBusinessDay', () => {
  it('sabado vira segunda', () => {
    expect(nextBusinessDay(new Date(2026, 6, 25)).getDay()).toBe(1);
  });
  it('dia util nao muda', () => {
    expect(dayKey(nextBusinessDay(new Date(2026, 6, 20)))).toBe('2026-07-20');
  });
});

// Tarefa do dia 0 nao pode nascer no passado: um lead que entra na etapa as 15h
// ganhava o toque de "hoje" as 9h — ja atrasado no instante da criacao, caindo
// direto na fila de atrasadas sem ninguem ter falhado.
describe('planSteps — piso do agora', () => {
  it('nao agenda no passado quando a etapa comeca no meio da tarde', () => {
    const from = new Date(2026, 6, 20, 15, 0); // segunda, 15h
    const plan = planSteps([{ id: 'p1', dayOffset: 0 }], {}, from);
    expect(plan).toHaveLength(1);
    expect(plan[0].start.getTime()).toBeGreaterThan(from.getTime());
  });

  it('dia seguinte continua comecando as 9h (o piso vale so pra hoje)', () => {
    const from = new Date(2026, 6, 20, 15, 0);
    const plan = planSteps([{ id: 'p1', dayOffset: 1 }], {}, from);
    expect(plan[0].start.getHours()).toBe(WORK_START_HOUR);
  });

  it('entrada depois do expediente empurra pro proximo dia util', () => {
    const from = new Date(2026, 6, 20, 19, 30); // segunda, 19h30 — ja fechou
    const plan = planSteps([{ id: 'p1', dayOffset: 0 }], {}, from);
    expect(plan).toHaveLength(1);
    expect(plan[0].start.getDate()).toBe(21);
    expect(plan[0].start.getHours()).toBe(WORK_START_HOUR);
  });
});

// Mesmo lead nao pode ganhar toques colados: quando a agenda enche e varios
// offsets colapsam num dia, sem folga o lead virava "12:00, 12:30, 13:00".
describe('planSteps — folga entre toques do mesmo lead', () => {
  const minutosDe = (d) => d.getHours() * 60 + d.getMinutes();

  it('dois passos no mesmo dia ficam a pelo menos 3h um do outro', () => {
    const from = new Date(2026, 6, 20, 9, 0); // segunda 9h
    // Dois passos que caem no MESMO dia (offset 0), sem period.
    const plan = planSteps([{ id: 'a', dayOffset: 0 }, { id: 'b', dayOffset: 0 }], {}, from);
    expect(plan).toHaveLength(2);
    const [a, b] = plan;
    expect(a.start.getDate()).toBe(20);
    expect(b.start.getDate()).toBe(20);
    expect(minutosDe(b.start) - minutosDe(a.start)).toBeGreaterThanOrEqual(180);
  });

  it('espalha pelo dia: 9:00 -> 12:00 -> 15:00 (manha, meio-dia, tarde)', () => {
    // Sabado 18/07 -> os passos caem na segunda 20/07 LIMPA (sem o piso do "agora"),
    // entao os horarios sao exatos.
    const from = new Date(2026, 6, 18, 9, 0);
    const plan = planSteps([
      { id: 'a', dayOffset: 0 }, { id: 'b', dayOffset: 0 }, { id: 'c', dayOffset: 0 },
    ], {}, from);
    expect(minutosDe(plan[0].start)).toBe(9 * 60);   // 09:00
    expect(minutosDe(plan[1].start)).toBe(12 * 60);  // 12:00 (pula o almoco 11-12)
    expect(minutosDe(plan[2].start)).toBe(15 * 60);  // 15:00
    // os tres no mesmo dia (segunda 20)
    expect(new Set(plan.map(p => p.start.getDate()))).toEqual(new Set([20]));
  });

  it('4o toque do dia estoura as 18h e rola pro proximo dia util', () => {
    const from = new Date(2026, 6, 18, 9, 0); // -> segunda 20 limpa
    const plan = planSteps([
      { id: 'a', dayOffset: 0 }, { id: 'b', dayOffset: 0 },
      { id: 'c', dayOffset: 0 }, { id: 'd', dayOffset: 0 },
    ], {}, from);
    // a/b/c em 9/12/15 na segunda; d (15:00+3h=18:00, sem slot) vai pra terca 21.
    expect(plan[3].start.getDate()).toBe(21);
    expect(plan[3].start.getHours()).toBe(WORK_START_HOUR);
  });

  it('offsets diferentes em dias diferentes nao sofrem a folga (dia limpo)', () => {
    const from = new Date(2026, 6, 20, 9, 0);
    const plan = planSteps([{ id: 'a', dayOffset: 0 }, { id: 'b', dayOffset: 2 }], {}, from);
    // dias distintos: cada um comeca as 9h, sem empurrao.
    expect(plan[0].start.getDate()).not.toBe(plan[1].start.getDate());
    expect(plan[1].start.getHours()).toBe(WORK_START_HOUR);
  });
});

// Emergencial: entra "agora" e empurra o resto do dia pra frente, sem reordenar
// por prioridade. So desce quem foi atropelado; hora marcada fica cravada.
describe('empurrarFila — bloco emergencial empurra o resto do dia', () => {
  // 2026-07-20 = segunda. Bloco emergencial as 9h (ocupa 9:00-9:30).
  const desde = new Date(2026, 6, 20, 9, 0);
  const bloco = { '2026-07-20': [{ start: desde.toISOString(), end: new Date(2026, 6, 20, 9, 30).toISOString() }] };
  const hora = (start) => `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}`;

  it('a tarefa que estava no slot do bloco desce pro proximo livre', () => {
    const mover = [{ id: 'a', start: new Date(2026, 6, 20, 9, 0) }]; // colidia com o bloco
    const out = empurrarFila(mover, bloco, desde);
    expect(out).toHaveLength(1);
    expect(out[0].movida).toBe(true);
    expect(hora(out[0].start)).toBe('09:30');
  });

  it('cascata: quem colide com o bloco desce; quem tem buraco antes fica', () => {
    const mover = [
      { id: 'a', start: new Date(2026, 6, 20, 9, 0) },   // colide com o bloco 9:00-9:30
      { id: 'b', start: new Date(2026, 6, 20, 9, 30) },  // colide com 'a' recolocada
      { id: 'c', start: new Date(2026, 6, 20, 12, 0) },  // buraco enorme antes -> fica
    ];
    const out = empurrarFila(mover, bloco, desde);
    const by = Object.fromEntries(out.map(o => [o.id, o]));
    // Bloco ocupa 9:00-9:30; 'a' cai no 1o slot livre (9:30), 'b' no seguinte (10:00).
    expect(hora(by.a.start)).toBe('09:30');
    expect(hora(by.b.start)).toBe('10:00');
    // 'c' as 12:00 nao colide com nada — o buraco absorveu a cascata.
    expect(by.c.movida).toBe(false);
    expect(hora(by.c.start)).toBe('12:00');
  });

  it('buraco fecha: tarefa cujo slot continua livre nao se mexe', () => {
    // Bloco as 9h, tarefa as 10h. 9:30-10:00 fica livre, entao a de 10h nao anda.
    const mover = [{ id: 'a', start: new Date(2026, 6, 20, 10, 0) }];
    const out = empurrarFila(mover, bloco, desde);
    expect(out[0].movida).toBe(false);
    expect(hora(out[0].start)).toBe('10:00');
  });

  it('hora marcada nao entra na fila — quem a chama filtra reuniao/visita/almoco', () => {
    // O motor so recebe flexiveis; a reuniao entra como fixo e a flexivel pula.
    const reuniao = new Date(2026, 6, 20, 9, 30);
    const fixos = {
      '2026-07-20': [
        ...bloco['2026-07-20'],
        { start: reuniao.toISOString(), end: new Date(2026, 6, 20, 10, 30).toISOString() },
      ],
    };
    const mover = [{ id: 'a', start: new Date(2026, 6, 20, 9, 0) }];
    const out = empurrarFila(mover, fixos, desde);
    // 9:00 (bloco) e 9:30-10:30 (reuniao) ocupados -> cai as 10:30.
    expect(hora(out[0].start)).toBe('10:30');
  });

  it('dia lotado rola pro proximo dia util', () => {
    // Preenche a tarde toda de segunda com fixos; a flexivel da tarde rola.
    const cheios = [...bloco['2026-07-20']];
    for (let h = 12; h < 18; h++) {
      for (const m of [0, 30]) {
        cheios.push({ start: new Date(2026, 6, 20, h, m).toISOString(), end: new Date(2026, 6, 20, h, m + 30).toISOString() });
      }
    }
    // Tambem lota a manha (9:30-11:00) — so sobra... nada em segunda.
    cheios.push({ start: new Date(2026, 6, 20, 9, 30).toISOString(), end: new Date(2026, 6, 20, 11, 0).toISOString() });
    cheios.push({ start: new Date(2026, 6, 20, 10, 0).toISOString(), end: new Date(2026, 6, 20, 10, 30).toISOString() });
    cheios.push({ start: new Date(2026, 6, 20, 10, 30).toISOString(), end: new Date(2026, 6, 20, 11, 0).toISOString() });
    const fixos = { '2026-07-20': cheios };
    const mover = [{ id: 'a', start: new Date(2026, 6, 20, 12, 0) }];
    const out = empurrarFila(mover, fixos, desde);
    expect(out[0].start.getDate()).toBe(21); // terca
    expect(out[0].start.getHours()).toBe(WORK_START_HOUR);
  });

  it('mantem a ordem cronologica: b (mais tarde) nunca cai antes de a', () => {
    const mover = [
      { id: 'a', start: new Date(2026, 6, 20, 9, 0) },
      { id: 'b', start: new Date(2026, 6, 20, 9, 30) },
    ];
    const out = empurrarFila(mover, bloco, desde);
    const by = Object.fromEntries(out.map(o => [o.id, o]));
    expect(by.a.start.getTime()).toBeLessThan(by.b.start.getTime());
  });

  // #3: tarefa longa (>30min) nao pode ser encaixada num buraco de 30min por cima
  // de uma reuniao intransponivel nem vazar do expediente.
  it('tarefa longa respeita a duracao — nao atravessa a reuniao seguinte', () => {
    const desde14 = new Date(2026, 6, 20, 14, 0);
    const fixos = {
      '2026-07-20': [
        { start: desde14.toISOString(), end: new Date(2026, 6, 20, 14, 30).toISOString() }, // bloco
        { start: new Date(2026, 6, 20, 15, 0).toISOString(), end: new Date(2026, 6, 20, 16, 0).toISOString() }, // reuniao
      ],
    };
    const mover = [{ id: 'longa', start: new Date(2026, 6, 20, 14, 0), durMin: 120 }];
    const out = empurrarFila(mover, fixos, desde14);
    const s = out[0].start;
    const e = new Date(s.getTime() + 120 * 60000);
    // Nao invade a reuniao 15:00-16:00.
    const rS = new Date(2026, 6, 20, 15, 0), rE = new Date(2026, 6, 20, 16, 0);
    expect(s < rE && e > rS).toBe(false);
    // Nem passa das 18h (no mesmo dia) — se rolou pro dia seguinte, tudo bem.
    if (e.getDate() === 20) expect(e.getHours() * 60 + e.getMinutes()).toBeLessThanOrEqual(18 * 60);
  });

  // #18: tarefa fora da grade canonica (18:30, 11:30) que nao colide com o bloco
  // nao pode ser arrastada pra grade — ela nao foi atropelada.
  it('tarefa fora da grade que nao colide fica exatamente onde esta', () => {
    const mover = [{ id: 'noite', start: new Date(2026, 6, 20, 18, 30) }];
    const out = empurrarFila(mover, bloco, desde);
    expect(out[0].movida).toBe(false);
    expect(hora(out[0].start)).toBe('18:30');
  });
});

import { describe, it, expect, vi } from 'vitest';

// crmDashboardService importa supabase + ToastContext no topo; mockamos pra
// poder testar o helper puro sem tocar a rede.
vi.mock('../../../../lib/supabase', () => ({
  supabase: { from: vi.fn(), auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) } },
}));
vi.mock('../../../../contexts/ToastContext', () => ({ toast: vi.fn() }));

import { buildSalesFunnel } from '../crmDashboardService';

describe('buildSalesFunnel (Lead → Qualificado → Reunião → Fechamento)', () => {
  // pipeline p1: qualificado >= pos 3, reunião >= pos 4, fechamento = won
  const qualPosByPipeline = { p1: 3 };
  const meetingPosByPipeline = { p1: 4 };

  it('retorna funil zerado sem dados', () => {
    const r = buildSalesFunnel();
    expect(r.steps).toHaveLength(4);
    expect(r.steps.map(s => s.key)).toEqual(['lead', 'qualified', 'meeting', 'closing']);
    expect(r.steps.every(s => s.count === 0)).toBe(true);
    expect(r.ratios.winRate).toBe(0);
    expect(r.revenue).toBe(0);
  });

  it('conta cada etapa pela maior posição alcançada (won conta em todas)', () => {
    const leadDeals = [
      { id: 'd1', status: 'open', pipeline_id: 'p1', value: 0 },    // alcançou pos 1
      { id: 'd2', status: 'open', pipeline_id: 'p1', value: 0 },    // pos 3
      { id: 'd3', status: 'open', pipeline_id: 'p1', value: 0 },    // pos 4
      { id: 'd4', status: 'won',  pipeline_id: 'p1', value: 1200 }, // fechado
    ];
    const reachedPosByDeal = { d1: 1, d2: 3, d3: 4, d4: 6 };
    const r = buildSalesFunnel({ leadDeals, reachedPosByDeal, qualPosByPipeline, meetingPosByPipeline });
    const byKey = Object.fromEntries(r.steps.map(s => [s.key, s.count]));
    expect(byKey.lead).toBe(4);
    expect(byKey.qualified).toBe(3); // d2, d3, d4
    expect(byKey.meeting).toBe(2);   // d3, d4
    expect(byKey.closing).toBe(1);   // d4
    expect(r.revenue).toBe(1200);
  });

  it('jornada real: lead que avançou e voltou ainda conta na etapa mais funda', () => {
    // d1 está hoje na pos 3, mas já tocou a pos 4 (reunião) → conta reunião.
    const leadDeals = [{ id: 'd1', status: 'open', pipeline_id: 'p1', value: 0 }];
    const reachedPosByDeal = { d1: 4 };
    const r = buildSalesFunnel({ leadDeals, reachedPosByDeal, qualPosByPipeline, meetingPosByPipeline });
    const byKey = Object.fromEntries(r.steps.map(s => [s.key, s.count]));
    expect(byKey.qualified).toBe(1);
    expect(byKey.meeting).toBe(1);
    expect(byKey.closing).toBe(0);
  });

  it('calcula conversão fromPrev/fromTop e ratios', () => {
    const leadDeals = [
      ...Array.from({ length: 5 }, (_, i) => ({ id: `a${i}`, status: 'open', pipeline_id: 'p1' })),
      ...Array.from({ length: 3 }, (_, i) => ({ id: `b${i}`, status: 'open', pipeline_id: 'p1' })),
      { id: 'c0', status: 'open', pipeline_id: 'p1' },
      { id: 'w0', status: 'won',  pipeline_id: 'p1', value: 0 },
    ];
    const reachedPosByDeal = {
      a0: 1, a1: 1, a2: 1, a3: 1, a4: 1, // 5× só lead
      b0: 3, b1: 3, b2: 3,               // 3× qualificado
      c0: 4,                             // reunião
      w0: 6,                             // fechado
    };
    const r = buildSalesFunnel({ leadDeals, reachedPosByDeal, qualPosByPipeline, meetingPosByPipeline });
    const byKey = Object.fromEntries(r.steps.map(s => [s.key, s]));
    expect(byKey.lead.count).toBe(10);
    expect(byKey.qualified.count).toBe(5); // 3×b + c0 + w0
    expect(byKey.meeting.count).toBe(2);   // c0 + w0
    expect(byKey.closing.count).toBe(1);   // w0
    expect(byKey.lead.fromPrev).toBeNull();
    expect(byKey.lead.fromTop).toBe(100);
    expect(byKey.qualified.fromPrev).toBe(50); // 5/10
    expect(byKey.meeting.fromTop).toBe(20);    // 2/10
    expect(r.ratios.qualRate).toBe(50);        // 5/10
    expect(r.ratios.winRate).toBe(10);         // 1/10
    expect(r.ratios.meetingToClose).toBe(50);  // 1/2
  });

  it('won conta em todas as etapas mesmo sem posição alcançada', () => {
    const leadDeals = [{ id: 'd1', status: 'won', pipeline_id: 'p1', value: 500 }];
    const r = buildSalesFunnel({ leadDeals });
    const byKey = Object.fromEntries(r.steps.map(s => [s.key, s.count]));
    expect(byKey.lead).toBe(1);
    expect(byKey.qualified).toBe(1);
    expect(byKey.meeting).toBe(1);
    expect(byKey.closing).toBe(1);
    expect(r.revenue).toBe(500);
  });
});

import { describe, it, expect, vi } from 'vitest';

// crmDashboardService importa supabase + ToastContext no topo; mockamos pra
// poder testar o helper puro sem tocar a rede.
vi.mock('../../../../lib/supabase', () => ({
  supabase: { from: vi.fn(), auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) } },
}));
vi.mock('../../../../contexts/ToastContext', () => ({ toast: vi.fn() }));

import { buildSalesFunnel } from '../crmDashboardService';

describe('buildSalesFunnel', () => {
  it('retorna funil zerado sem dados', () => {
    const r = buildSalesFunnel();
    expect(r.steps).toHaveLength(6);
    expect(r.steps.every(s => s.count === 0)).toBe(true);
    expect(r.ratios.callsPerMeeting).toBeNull();
    expect(r.ratios.answerRate).toBe(0);
    expect(r.ratios.winRate).toBe(0);
    expect(r.revenue).toBe(0);
  });

  it('conta ligações atendidas pelos outcomes corretos', () => {
    const calls = [
      { outcome: 'answered' },
      { outcome: 'meeting_scheduled' },
      { outcome: 'no_answer' },      // não conta
      { outcome: 'voicemail' },      // não conta
      { outcome: 'deal_advanced' },
    ];
    const r = buildSalesFunnel({ calls });
    expect(r.callsTotal).toBe(5);
    expect(r.answered).toBe(3);
    expect(r.ratios.answerRate).toBe(60); // 3/5
  });

  it('marca qualificado por posição de estágio ou por won', () => {
    // Pipeline p1: qualificação a partir da posição 3.
    const stagePosById = { s1: 1, s2: 2, s3: 3, s4: 4 };
    const qualPosByPipeline = { p1: 3 };
    const leadDeals = [
      { status: 'open', stage_id: 's1', pipeline_id: 'p1', value: 0 },   // lead, não qualificado
      { status: 'open', stage_id: 's3', pipeline_id: 'p1', value: 0 },   // qualificado (pos 3 >= 3)
      { status: 'open', stage_id: 's4', pipeline_id: 'p1', value: 0 },   // qualificado (pos 4 >= 3)
      { status: 'won',  stage_id: 's4', pipeline_id: 'p1', value: 1500 }, // qualificado + cliente
    ];
    const r = buildSalesFunnel({ leadDeals, stagePosById, qualPosByPipeline });
    expect(r.leads).toBe(4);
    expect(r.qualified).toBe(3);
    expect(r.clients).toBe(1);
    expect(r.revenue).toBe(1500);
    expect(r.ratios.winRate).toBe(25); // 1/4
  });

  it('calcula conversão fromPrev e fromTop por degrau', () => {
    const calls = Array.from({ length: 100 }, () => ({ outcome: 'no_answer' }));
    calls.fill({ outcome: 'answered' }, 0, 20); // 20 atendidas
    const r = buildSalesFunnel({ calls, meetingsCount: 10 });
    const byKey = Object.fromEntries(r.steps.map(s => [s.key, s]));
    expect(byKey.calls.fromTop).toBe(100);
    expect(byKey.calls.fromPrev).toBeNull();
    expect(byKey.answered.fromPrev).toBe(20);  // 20/100
    expect(byKey.meetings.fromPrev).toBe(50);  // 10/20
    expect(byKey.meetings.fromTop).toBe(10);   // 10/100
    expect(r.ratios.callsPerMeeting).toBe(10); // 100/10
  });

  it('não quebra com denominador zero (sem reuniões)', () => {
    const r = buildSalesFunnel({ calls: [{ outcome: 'answered' }], meetingsCount: 0 });
    expect(r.ratios.callsPerMeeting).toBeNull();
    expect(r.ratios.meetingsPerClient).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { buildFunnelPlan, stageProgress, funnelPlanHeadline } from '../funnelGoals';

describe('buildFunnelPlan', () => {
  it('retorna null para dados invalidos', () => {
    expect(buildFunnelPlan({ base: 'sales', targetCount: 0, conversionRate: 5 })).toBeNull();
    expect(buildFunnelPlan({ base: 'sales', targetCount: 10, conversionRate: 0 })).toBeNull();
    expect(buildFunnelPlan({})).toBeNull();
  });

  it('base=sales: sobe das vendas pros leads pela taxa', () => {
    const plan = buildFunnelPlan({ base: 'sales', targetCount: 10, conversionRate: 5 });
    expect(plan.closingTarget).toBe(10);
    expect(plan.leadTarget).toBe(200); // 10 / 0.05
    expect(plan.salesTarget).toBe(10);
    expect(plan.stageTargets.lead).toBe(200);
    expect(plan.stageTargets.closing).toBe(10);
  });

  it('base=calls: desce das ligacoes pras vendas pela taxa', () => {
    const plan = buildFunnelPlan({ base: 'calls', targetCount: 200, conversionRate: 5 });
    expect(plan.leadTarget).toBe(200);
    expect(plan.closingTarget).toBe(10); // 200 * 0.05
    expect(plan.callsTarget).toBe(200);
    expect(plan.salesTarget).toBe(10);
  });

  it('etapas sempre afunilam (monotonico decrescente)', () => {
    const plan = buildFunnelPlan({ base: 'sales', targetCount: 12, conversionRate: 8 });
    const { lead, qualified, meeting, closing } = plan.stageTargets;
    expect(lead).toBeGreaterThanOrEqual(qualified);
    expect(qualified).toBeGreaterThanOrEqual(meeting);
    expect(meeting).toBeGreaterThanOrEqual(closing);
  });

  it('taxa acima de 100% e limitada; taxa minima nao explode', () => {
    const plan = buildFunnelPlan({ base: 'sales', targetCount: 10, conversionRate: 250 });
    expect(plan.conversionRate).toBe(100);
    expect(plan.leadTarget).toBe(10); // vendas nao podem passar dos leads
  });
});

describe('stageProgress', () => {
  it('calcula percentual real vs meta', () => {
    const plan = buildFunnelPlan({ base: 'sales', targetCount: 10, conversionRate: 5 });
    const p = stageProgress(plan, 'closing', 3);
    expect(p.target).toBe(10);
    expect(p.current).toBe(3);
    expect(p.percent).toBe(30);
    expect(p.hit).toBe(false);
  });

  it('marca hit quando bate ou passa a meta', () => {
    const plan = buildFunnelPlan({ base: 'sales', targetCount: 10, conversionRate: 5 });
    expect(stageProgress(plan, 'closing', 10).hit).toBe(true);
    expect(stageProgress(plan, 'closing', 12).hit).toBe(true);
  });

  it('retorna null para etapa sem meta', () => {
    expect(stageProgress(null, 'closing', 3)).toBeNull();
  });
});

describe('funnelPlanHeadline', () => {
  it('base=calls mostra ligacoes -> vendas', () => {
    const plan = buildFunnelPlan({ base: 'calls', targetCount: 200, conversionRate: 5 });
    expect(funnelPlanHeadline(plan)).toContain('ligações');
    expect(funnelPlanHeadline(plan)).toContain('vendas');
  });

  it('sem plano retorna string vazia', () => {
    expect(funnelPlanHeadline(null)).toBe('');
  });
});

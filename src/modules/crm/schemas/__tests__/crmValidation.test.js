import { describe, it, expect } from 'vitest';
import {
  crmCompanySchema,
  crmContactSchema,
  crmPipelineSchema,
  crmPipelineStageSchema,
  crmDealSchema,
  crmActivitySchema,
  crmGoalSchema,
  crmTrafficSchema,
  crmProspectSchema,
  crmSettingsSchema,
} from '../crmValidation';

// ─────────────────────────────────────────────────────────────────────────────
// COMPANY
// ─────────────────────────────────────────────────────────────────────────────

describe('crmCompanySchema', () => {
  it('aceita company com apenas name', () => {
    const r = crmCompanySchema.safeParse({ name: 'Empresa X' });
    expect(r.success).toBe(true);
    expect(r.data.name).toBe('Empresa X');
  });

  it('rejeita company sem name', () => {
    const r = crmCompanySchema.safeParse({});
    expect(r.success).toBe(false);
  });

  it('rejeita name vazio', () => {
    const r = crmCompanySchema.safeParse({ name: '' });
    expect(r.success).toBe(false);
  });

  it('aceita email vazio (literal)', () => {
    const r = crmCompanySchema.safeParse({ name: 'X', email: '' });
    expect(r.success).toBe(true);
  });

  it('aceita email valido', () => {
    const r = crmCompanySchema.safeParse({ name: 'X', email: 'a@b.com' });
    expect(r.success).toBe(true);
  });

  it('rejeita email invalido', () => {
    const r = crmCompanySchema.safeParse({ name: 'X', email: 'not-an-email' });
    expect(r.success).toBe(false);
  });

  it('preserva campos extra (passthrough)', () => {
    const r = crmCompanySchema.safeParse({ name: 'X', customField: 'value' });
    expect(r.success).toBe(true);
    expect(r.data.customField).toBe('value');
  });

  it('aceita revenue como numero ou null', () => {
    expect(crmCompanySchema.safeParse({ name: 'X', revenue: 1000 }).success).toBe(true);
    expect(crmCompanySchema.safeParse({ name: 'X', revenue: null }).success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// CONTACT
// ─────────────────────────────────────────────────────────────────────────────

describe('crmContactSchema', () => {
  it('aceita contact basico', () => {
    const r = crmContactSchema.safeParse({ name: 'Joao' });
    expect(r.success).toBe(true);
    expect(r.data.status).toBe('lead');
    expect(r.data.tags).toEqual([]);
  });

  it('rejeita contact sem name', () => {
    expect(crmContactSchema.safeParse({}).success).toBe(false);
  });

  it('aceita status valido', () => {
    ['lead', 'active', 'inactive', 'customer'].forEach(s => {
      expect(crmContactSchema.safeParse({ name: 'X', status: s }).success).toBe(true);
    });
  });

  it('rejeita status invalido', () => {
    const r = crmContactSchema.safeParse({ name: 'X', status: 'qualified' });
    expect(r.success).toBe(false);
  });

  it('aceita tags como array de strings', () => {
    const r = crmContactSchema.safeParse({ name: 'X', tags: ['vip', 'churn-risk'] });
    expect(r.success).toBe(true);
    expect(r.data.tags).toEqual(['vip', 'churn-risk']);
  });

  it('rejeita tags com tipo errado', () => {
    expect(crmContactSchema.safeParse({ name: 'X', tags: [1, 2] }).success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PIPELINE / STAGE
// ─────────────────────────────────────────────────────────────────────────────

describe('crmPipelineSchema', () => {
  it('aceita pipeline minima', () => {
    const r = crmPipelineSchema.safeParse({ name: 'Vendas' });
    expect(r.success).toBe(true);
    expect(r.data.isDefault).toBe(false);
  });

  it('rejeita pipeline sem nome', () => {
    expect(crmPipelineSchema.safeParse({}).success).toBe(false);
  });
});

describe('crmPipelineStageSchema', () => {
  it('aceita stage com pipelineId, name e position', () => {
    const r = crmPipelineStageSchema.safeParse({ pipelineId: 'p1', name: 'Etapa', position: 1 });
    expect(r.success).toBe(true);
    expect(r.data.color).toBe('#6366f1');
    expect(r.data.isWinStage).toBe(false);
    expect(r.data.triggersMeeting).toBe(false);
  });

  it('rejeita stage sem pipelineId', () => {
    expect(crmPipelineStageSchema.safeParse({ name: 'X', position: 1 }).success).toBe(false);
  });

  it('rejeita position negativa', () => {
    expect(crmPipelineStageSchema.safeParse({ pipelineId: 'p1', name: 'X', position: -1 }).success).toBe(false);
  });

  it('aceita position 0', () => {
    expect(crmPipelineStageSchema.safeParse({ pipelineId: 'p1', name: 'X', position: 0 }).success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// DEAL
// ─────────────────────────────────────────────────────────────────────────────

describe('crmDealSchema', () => {
  it('aceita deal minimo', () => {
    const r = crmDealSchema.safeParse({ title: 'Negocio X' });
    expect(r.success).toBe(true);
    expect(r.data.value).toBe(0);
    expect(r.data.probability).toBe(50);
    expect(r.data.status).toBe('open');
  });

  it('rejeita deal sem title', () => {
    expect(crmDealSchema.safeParse({}).success).toBe(false);
  });

  it('aceita probability entre 0 e 100', () => {
    [0, 50, 100].forEach(p => {
      expect(crmDealSchema.safeParse({ title: 'X', probability: p }).success).toBe(true);
    });
  });

  it('rejeita probability fora de [0,100]', () => {
    expect(crmDealSchema.safeParse({ title: 'X', probability: 101 }).success).toBe(false);
    expect(crmDealSchema.safeParse({ title: 'X', probability: -1 }).success).toBe(false);
  });

  it('rejeita value negativo', () => {
    expect(crmDealSchema.safeParse({ title: 'X', value: -10 }).success).toBe(false);
  });

  it('aceita status valido', () => {
    ['open', 'won', 'lost'].forEach(s => {
      expect(crmDealSchema.safeParse({ title: 'X', status: s }).success).toBe(true);
    });
  });

  it('rejeita status invalido', () => {
    expect(crmDealSchema.safeParse({ title: 'X', status: 'closed' }).success).toBe(false);
  });

  it('aceita contactEmail vazio', () => {
    expect(crmDealSchema.safeParse({ title: 'X', contactEmail: '' }).success).toBe(true);
  });

  it('rejeita contactEmail invalido', () => {
    expect(crmDealSchema.safeParse({ title: 'X', contactEmail: 'fail' }).success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVITY
// ─────────────────────────────────────────────────────────────────────────────

describe('crmActivitySchema', () => {
  it('aceita atividade basica', () => {
    const r = crmActivitySchema.safeParse({ title: 'Ligar', startDate: '2026-05-01' });
    expect(r.success).toBe(true);
    expect(r.data.type).toBe('task');
    expect(r.data.completed).toBe(false);
  });

  it('rejeita sem title', () => {
    expect(crmActivitySchema.safeParse({ startDate: '2026-05-01' }).success).toBe(false);
  });

  it('rejeita sem startDate', () => {
    expect(crmActivitySchema.safeParse({ title: 'X' }).success).toBe(false);
  });

  it('aceita todos os types validos', () => {
    ['call', 'email', 'meeting', 'task', 'lunch', 'visit'].forEach(t => {
      expect(
        crmActivitySchema.safeParse({ title: 'X', startDate: '2026-05-01', type: t }).success
      ).toBe(true);
    });
  });

  it('rejeita type invalido', () => {
    expect(
      crmActivitySchema.safeParse({ title: 'X', startDate: '2026-05-01', type: 'whatsapp' }).success
    ).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GOAL
// ─────────────────────────────────────────────────────────────────────────────

describe('crmGoalSchema', () => {
  it('aceita meta basica', () => {
    const r = crmGoalSchema.safeParse({
      title: 'Meta Q1',
      periodStart: '2026-01-01',
      periodEnd: '2026-03-31',
    });
    expect(r.success).toBe(true);
    expect(r.data.type).toBe('individual');
    expect(r.data.status).toBe('active');
  });

  it('rejeita type invalido', () => {
    expect(
      crmGoalSchema.safeParse({
        title: 'X',
        periodStart: '2026-01-01',
        periodEnd: '2026-03-31',
        type: 'team',
      }).success
    ).toBe(false);
  });

  it('rejeita targetValue negativo', () => {
    expect(
      crmGoalSchema.safeParse({
        title: 'X',
        periodStart: '2026-01-01',
        periodEnd: '2026-03-31',
        targetValue: -100,
      }).success
    ).toBe(false);
  });

  it('rejeita meta sem periodStart', () => {
    expect(crmGoalSchema.safeParse({ title: 'X', periodEnd: '2026-03-31' }).success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TRAFFIC
// ─────────────────────────────────────────────────────────────────────────────

describe('crmTrafficSchema', () => {
  it('aceita registro de trafego basico', () => {
    const r = crmTrafficSchema.safeParse({
      channel: 'meta',
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
    });
    expect(r.success).toBe(true);
    expect(r.data.amountSpent).toBe(0);
    expect(r.data.impressions).toBe(0);
  });

  it('rejeita channel vazio', () => {
    expect(
      crmTrafficSchema.safeParse({
        channel: '',
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
      }).success
    ).toBe(false);
  });

  it('rejeita amountSpent negativo', () => {
    expect(
      crmTrafficSchema.safeParse({
        channel: 'meta',
        periodStart: '2026-01-01',
        periodEnd: '2026-01-31',
        amountSpent: -1,
      }).success
    ).toBe(false);
  });

  it('rejeita campos numericos negativos (impressions, clicks, leads, conversions, revenue)', () => {
    const base = { channel: 'm', periodStart: '2026-01-01', periodEnd: '2026-01-31' };
    expect(crmTrafficSchema.safeParse({ ...base, impressions: -1 }).success).toBe(false);
    expect(crmTrafficSchema.safeParse({ ...base, clicks: -1 }).success).toBe(false);
    expect(crmTrafficSchema.safeParse({ ...base, leadsGenerated: -1 }).success).toBe(false);
    expect(crmTrafficSchema.safeParse({ ...base, conversions: -1 }).success).toBe(false);
    expect(crmTrafficSchema.safeParse({ ...base, revenueGenerated: -1 }).success).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PROSPECT
// ─────────────────────────────────────────────────────────────────────────────

describe('crmProspectSchema', () => {
  it('aceita prospect basico', () => {
    const r = crmProspectSchema.safeParse({ companyName: 'Empresa X' });
    expect(r.success).toBe(true);
    expect(r.data.status).toBe('new');
    expect(r.data.prospectType).toBe('lead');
    expect(r.data.partnerCategory).toBeNull();
  });

  it('rejeita sem companyName', () => {
    expect(crmProspectSchema.safeParse({}).success).toBe(false);
  });

  it('aceita todos os status validos', () => {
    ['new', 'contacted', 'qualified', 'converted', 'discarded'].forEach(s => {
      expect(crmProspectSchema.safeParse({ companyName: 'X', status: s }).success).toBe(true);
    });
  });

  it('aceita prospectType lead/partner', () => {
    expect(crmProspectSchema.safeParse({ companyName: 'X', prospectType: 'lead' }).success).toBe(true);
    expect(crmProspectSchema.safeParse({ companyName: 'X', prospectType: 'partner' }).success).toBe(true);
  });

  it('rejeita prospectType invalido', () => {
    expect(crmProspectSchema.safeParse({ companyName: 'X', prospectType: 'cliente' }).success).toBe(false);
  });

  it('aceita partnerCategory valido ou null', () => {
    ['contabilidade', 'financeira', 'advocacia', 'associacao'].forEach(c => {
      expect(crmProspectSchema.safeParse({ companyName: 'X', partnerCategory: c }).success).toBe(true);
    });
    expect(crmProspectSchema.safeParse({ companyName: 'X', partnerCategory: null }).success).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────────────────────

describe('crmSettingsSchema', () => {
  it('aceita settings vazio (todos opcionais)', () => {
    const r = crmSettingsSchema.safeParse({});
    expect(r.success).toBe(true);
    expect(r.data.accentColor).toBe('#6366f1');
  });

  it('rejeita email invalido', () => {
    expect(crmSettingsSchema.safeParse({ companyEmail: 'fail' }).success).toBe(false);
  });

  it('aceita email vazio (literal)', () => {
    expect(crmSettingsSchema.safeParse({ companyEmail: '' }).success).toBe(true);
  });
});

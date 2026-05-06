import { describe, it, expect, vi } from 'vitest';

vi.mock('../../../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: { getSession: vi.fn().mockResolvedValue({ data: { session: null } }) },
  },
}));
vi.mock('../../../../contexts/ToastContext', () => ({ toast: vi.fn() }));
vi.mock('../../../../lib/validation', () => ({
  validateAndSanitize: vi.fn(),
  validatePartial: vi.fn(),
}));
vi.mock('../../schemas/crmValidation', () => ({
  crmPipelineSchema: {},
  crmPipelineStageSchema: {},
}));

import { dbToPipeline, dbToStage } from '../crmPipelinesService';

describe('dbToStage', () => {
  it('retorna null para entrada nula', () => {
    expect(dbToStage(null)).toBeNull();
  });

  it('mapeia stage completa', () => {
    const r = dbToStage({
      id: 's1',
      pipeline_id: 'p1',
      name: 'Qualificacao',
      position: 2,
      color: '#abcdef',
      is_win_stage: true,
      triggers_meeting: true,
      created_at: '2026-01-01',
    });
    expect(r.id).toBe('s1');
    expect(r.pipelineId).toBe('p1');
    expect(r.name).toBe('Qualificacao');
    expect(r.position).toBe(2);
    expect(r.color).toBe('#abcdef');
    expect(r.isWinStage).toBe(true);
    expect(r.triggersMeeting).toBe(true);
  });

  it('aplica defaults: color, isWinStage=false, triggersMeeting=false', () => {
    const r = dbToStage({ id: 's1', pipeline_id: 'p1', name: 'X', position: 1 });
    expect(r.color).toBe('#6366f1');
    expect(r.isWinStage).toBe(false);
    expect(r.triggersMeeting).toBe(false);
  });
});

describe('dbToPipeline', () => {
  it('retorna null para entrada nula', () => {
    expect(dbToPipeline(null)).toBeNull();
  });

  it('mapeia campos basicos', () => {
    const r = dbToPipeline({
      id: 'p1',
      name: 'Vendas',
      is_default: true,
      created_by: 'u1',
      created_at: '2026-01-01',
    });
    expect(r.id).toBe('p1');
    expect(r.name).toBe('Vendas');
    expect(r.isDefault).toBe(true);
    expect(r.createdBy).toBe('u1');
    expect(r.stages).toEqual([]);
  });

  it('isDefault default false', () => {
    const r = dbToPipeline({ id: 'p1', name: 'X' });
    expect(r.isDefault).toBe(false);
  });

  it('mapeia stages e ordena por position', () => {
    const r = dbToPipeline({
      id: 'p1',
      name: 'Vendas',
      crm_pipeline_stages: [
        { id: 's3', pipeline_id: 'p1', name: 'Tres', position: 3 },
        { id: 's1', pipeline_id: 'p1', name: 'Um', position: 1 },
        { id: 's2', pipeline_id: 'p1', name: 'Dois', position: 2 },
      ],
    });
    expect(r.stages.map(s => s.position)).toEqual([1, 2, 3]);
    expect(r.stages.map(s => s.name)).toEqual(['Um', 'Dois', 'Tres']);
  });

  it('stages vazia quando join ausente', () => {
    expect(dbToPipeline({ id: 'p1', name: 'X' }).stages).toEqual([]);
  });

  it('crm_pipeline_stages nao-array vira []', () => {
    expect(dbToPipeline({ id: 'p1', name: 'X', crm_pipeline_stages: null }).stages).toEqual([]);
  });
});

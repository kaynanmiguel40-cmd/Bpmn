import { describe, it, expect, beforeEach } from 'vitest';
import {
  getCrmWorkspaceSettings,
  saveCrmWorkspaceSettings,
  clearCrmWorkspaceSettings,
} from '../workspaceSettings';

beforeEach(() => {
  localStorage.clear();
});

describe('getCrmWorkspaceSettings', () => {
  it('retorna shape vazio quando nao ha config salva', () => {
    const result = getCrmWorkspaceSettings();
    expect(result).toEqual({
      lostTargetPipelineId: null,
      lostTargetStageId: null,
      discardStageId: null,
    });
  });

  it('le config salva no localStorage', () => {
    localStorage.setItem('crm-workspace-config', JSON.stringify({
      lostTargetPipelineId: 'p1',
      lostTargetStageId: 's1',
      discardStageId: 's2',
    }));
    const result = getCrmWorkspaceSettings();
    expect(result.lostTargetPipelineId).toBe('p1');
    expect(result.lostTargetStageId).toBe('s1');
    expect(result.discardStageId).toBe('s2');
  });

  it('mescla config parcial com defaults', () => {
    localStorage.setItem('crm-workspace-config', JSON.stringify({
      lostTargetPipelineId: 'p1',
      // outros campos ausentes
    }));
    const result = getCrmWorkspaceSettings();
    expect(result.lostTargetPipelineId).toBe('p1');
    expect(result.lostTargetStageId).toBeNull();
    expect(result.discardStageId).toBeNull();
  });

  it('retorna shape vazio se JSON invalido (sem crashar)', () => {
    localStorage.setItem('crm-workspace-config', 'not-json{{{');
    const result = getCrmWorkspaceSettings();
    expect(result.lostTargetPipelineId).toBeNull();
  });
});

describe('saveCrmWorkspaceSettings', () => {
  it('persiste config no localStorage', () => {
    saveCrmWorkspaceSettings({ lostTargetPipelineId: 'p1', lostTargetStageId: 's1' });
    const raw = JSON.parse(localStorage.getItem('crm-workspace-config'));
    expect(raw.lostTargetPipelineId).toBe('p1');
    expect(raw.lostTargetStageId).toBe('s1');
  });

  it('faz merge: salva updates parciais sem perder campos existentes', () => {
    saveCrmWorkspaceSettings({ lostTargetPipelineId: 'p1', lostTargetStageId: 's1', discardStageId: 's2' });
    saveCrmWorkspaceSettings({ lostTargetStageId: 's_novo' }); // so atualiza 1 campo
    const result = getCrmWorkspaceSettings();
    expect(result.lostTargetPipelineId).toBe('p1');
    expect(result.lostTargetStageId).toBe('s_novo');
    expect(result.discardStageId).toBe('s2');
  });

  it('retorna o objeto persistido', () => {
    const result = saveCrmWorkspaceSettings({ lostTargetPipelineId: 'p1' });
    expect(result.lostTargetPipelineId).toBe('p1');
  });
});

describe('clearCrmWorkspaceSettings', () => {
  it('remove a config do localStorage', () => {
    saveCrmWorkspaceSettings({ lostTargetPipelineId: 'p1' });
    clearCrmWorkspaceSettings();
    expect(localStorage.getItem('crm-workspace-config')).toBeNull();
  });

  it('eh idempotente (nao crasha sem config)', () => {
    expect(() => clearCrmWorkspaceSettings()).not.toThrow();
  });
});

/**
 * workspaceSettings.js — Configuracoes globais do CRM persistidas em localStorage.
 *
 * Atualmente cobre o roteamento de "deal perdido":
 *   - lostTargetPipelineId: pipeline pra onde o deal vai (ex: "Nurturing")
 *   - lostTargetStageId:    stage de entrada na pipeline alvo (ex: "Em Nutricao")
 *   - discardStageId:       stage final pra deals ja na pipeline alvo (ex: "Descarte")
 *
 * Por enquanto eh localStorage (consistente com os outros settings do CRM —
 * crm-segments, crm-currency). Se um dia precisar virar config de workspace
 * compartilhada entre vendedores, migra pra Supabase preservando a mesma
 * shape de objeto.
 */

const STORAGE_KEY = 'crm-workspace-config';

const EMPTY_SETTINGS = {
  lostTargetPipelineId: null,
  lostTargetStageId: null,
  discardStageId: null,
};

export function getCrmWorkspaceSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_SETTINGS };
    return { ...EMPTY_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...EMPTY_SETTINGS };
  }
}

export function saveCrmWorkspaceSettings(updates) {
  try {
    const current = getCrmWorkspaceSettings();
    const next = { ...current, ...updates };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return null;
  }
}

export function clearCrmWorkspaceSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

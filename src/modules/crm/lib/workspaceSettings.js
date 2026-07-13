/**
 * workspaceSettings.js — Configuracoes do CRM persistidas em localStorage
 * (por navegador, NAO compartilhadas entre vendedores/devices).
 *
 * Cobre:
 *   - Roteamento de "deal perdido": lostTargetPipelineId / lostTargetStageId
 *     (pipeline+stage de entrada, ex: "Nurturing" / "Em Nutricao") e
 *     discardStageId (stage final pra deals ja na pipeline alvo, ex: "Descarte").
 *   - Plano do Funil (pagina /crm/planejamento) — etapas 100% customizaveis.
 *
 * A Meta de MRR do Dashboard SAIU daqui — agora vive em crm_workspace_settings
 * (Supabase), compartilhada entre todo mundo (ver crmWorkspaceSettingsService.js
 * / useCrmWorkspaceSettings). O Plano do Funil continua aqui de proposito: e
 * escrito a cada tecla digitada (nome/contagem/taxa por etapa) e migrar isso
 * sem debounce viraria upsert no Supabase por tecla — fica pra uma proxima
 * leva com essa peca resolvida (ver comentario na migration 074).
 */

const STORAGE_KEY = 'crm-workspace-config';

const EMPTY_SETTINGS = {
  lostTargetPipelineId: null,
  lostTargetStageId: null,
  discardStageId: null,
  // Plano do Funil (pagina /crm/planejamento) — etapas 100% customizaveis.
  // O usuario pode digitar a contagem em QUALQUER etapa e a taxa em QUALQUER
  // transicao; o resto e resolvido por propagacao (ver resolveFunnelPlan em
  // funnelGoals.js). Alimenta o previsto do Funil de Conversao.
  funnelPlanStages: null,   // string[] | null (desativado) — nomes das etapas, topo->base
  funnelPlanCounts: null,   // (number|null)[] | null — contagem digitada por etapa
  funnelPlanRates: null,    // (number|null)[] | null — taxa % digitada por transicao
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

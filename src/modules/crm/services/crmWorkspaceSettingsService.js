/**
 * crmWorkspaceSettingsService.js — Config de workspace do CRM compartilhada
 * (tabela crm_workspace_settings, 1 linha so / singleton).
 *
 * So a Meta de MRR do Dashboard por enquanto — ver comentario da migration
 * 074_crm_workspace_settings.sql pro porque o plano do Funil (Planejamento)
 * nao entrou aqui e continua em ../lib/workspaceSettings.js (localStorage).
 */

import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';

const EMPTY = { mrrGoalMonthly: 0 };

function dbToSettings(row) {
  if (!row) return { ...EMPTY };
  return { mrrGoalMonthly: row.mrr_goal_monthly || 0 };
}

export async function getCrmWorkspaceSettingsRemote() {
  const { data, error } = await supabase
    .from('crm_workspace_settings')
    .select('mrr_goal_monthly')
    .eq('id', true)
    .maybeSingle();
  if (error) {
    toast(`Erro ao buscar configuracoes do workspace: ${error.message}`, 'error');
    throw error;
  }
  return dbToSettings(data);
}

export async function updateCrmWorkspaceSettingsRemote(updates) {
  const payload = { id: true, updated_at: new Date().toISOString() };
  if ('mrrGoalMonthly' in updates) payload.mrr_goal_monthly = updates.mrrGoalMonthly;

  const { data, error } = await supabase
    .from('crm_workspace_settings')
    .upsert(payload, { onConflict: 'id' })
    .select('mrr_goal_monthly')
    .single();
  if (error) {
    toast(`Erro ao salvar configuracoes do workspace: ${error.message}`, 'error');
    throw error;
  }
  return dbToSettings(data);
}

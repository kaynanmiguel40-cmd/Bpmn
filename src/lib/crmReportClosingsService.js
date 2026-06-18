/**
 * crmReportClosingsService - fechamento de relatório comercial por período.
 *
 * "Fechar" o dia/semana/mês grava um marco em crm_report_closings (quando/quem
 * + um resumo das métricas). O conteúdo do relatório continua dinâmico (montado
 * da agenda); aqui só registramos a entrega.
 *
 * Fica em src/lib (fora do módulo CRM) — usado pelo Arquivos e pelo lembrete.
 */

import { supabase } from './supabase';

async function currentUserId() {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id || null;
}

function dbToClosing(row) {
  if (!row) return null;
  return {
    id: row.id,
    ownerId: row.owner_id,
    period: row.period,
    periodKey: row.period_key,
    summary: row.summary || null,
    closedBy: row.closed_by || null,
    closedAt: row.closed_at,
  };
}

/** Fechamentos de um dono (default: usuário atual). */
export async function listClosings(ownerId) {
  const oid = ownerId || (await currentUserId());
  if (!oid) return [];
  const { data, error } = await supabase
    .from('crm_report_closings')
    .select('*')
    .eq('owner_id', oid);
  if (error) return [];
  return (data || []).map(dbToClosing);
}

/** Fecha (ou re-fecha) um período. Upsert por (owner_id, period, period_key). */
export async function closeReport({ ownerId, period, periodKey, summary = null }) {
  const oid = ownerId || (await currentUserId());
  const by = await currentUserId();
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('crm_report_closings')
    .upsert(
      { owner_id: oid, period, period_key: periodKey, summary, closed_by: by, closed_at: now, updated_at: now },
      { onConflict: 'owner_id,period,period_key' },
    )
    .select()
    .single();
  if (error) throw error;
  return dbToClosing(data);
}

/** Reabre (apaga o marco de fechamento). */
export async function reopenReport({ ownerId, period, periodKey }) {
  const oid = ownerId || (await currentUserId());
  const { error } = await supabase
    .from('crm_report_closings')
    .delete()
    .eq('owner_id', oid)
    .eq('period', period)
    .eq('period_key', periodKey);
  if (error) throw error;
  return true;
}

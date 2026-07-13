/**
 * crmPartnersService - cadastro de parceiros indicadores (pessoas físicas
 * que indicam leads, ex.: Edson, João, Robert).
 *
 * Diferente da pipeline "Parceiros" (prospecção de EMPRESAS pra virarem
 * parceiros institucionais) — isso aqui é o registro da PESSOA indicadora.
 *
 * Sem FK em crm_deals: a contagem de leads por parceiro casa o nome com o
 * texto livre de crm_deals.source (ex.: "Indicação de parceiro (Edson)").
 */

import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { crmPartnerSchema } from '../schemas/crmValidation';

// ==================== TRANSFORMADOR ====================

export function dbToCrmPartner(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || null,
    notes: row.notes || '',
    active: row.active !== false,
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || null,
  };
}

// ==================== CRUD VIA FACTORY ====================

const partnerService = createCRUDService({
  table: 'crm_partners',
  localKey: 'crm_partners',
  idPrefix: 'crm_partner',
  transform: dbToCrmPartner,
  schema: crmPartnerSchema,
  fieldMap: {
    name: 'name',
    phone: 'phone',
    notes: 'notes',
    active: 'active',
  },
  orderBy: 'name',
  orderAsc: true,
});

// ==================== FUNCOES EXPORTADAS ====================

/**
 * Lista parceiros ativos (não deletados) com a contagem de leads indicados
 * por cada um (casando o nome com crm_deals.source via ILIKE — não é FK).
 */
export async function getCrmPartners() {
  const { data, error } = await supabase
    .from('crm_partners')
    .select('*')
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) return [];
  const all = (data || []).map(dbToCrmPartner);

  const counts = await Promise.all(
    all.map(p =>
      supabase
        .from('crm_deals')
        .select('id', { count: 'exact', head: true })
        .is('deleted_at', null)
        .ilike('source', `%(${p.name})%`)
    )
  );

  return all.map((p, i) => ({ ...p, leadCount: counts[i].count || 0 }));
}

/** Leads (deals) indicados por um parceiro, pra listar no detalhe. */
export async function getLeadsByPartner(partnerName) {
  const { data, error } = await supabase
    .from('crm_deals')
    .select('id, title, status, value, created_at, crm_pipeline_stages(name, color)')
    .is('deleted_at', null)
    .ilike('source', `%(${partnerName})%`)
    .order('created_at', { ascending: false });

  if (error) return [];
  return (data || []).map(d => ({
    id: d.id,
    title: d.title,
    status: d.status,
    value: d.value || 0,
    createdAt: d.created_at,
    stageName: d.crm_pipeline_stages?.name || null,
    stageColor: d.crm_pipeline_stages?.color || null,
  }));
}

export async function createCrmPartner(data) {
  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;
  return partnerService.create(data, { created_by: userId });
}

export async function updateCrmPartner(id, updates) {
  return partnerService.update(id, updates);
}

export async function softDeleteCrmPartner(id) {
  const { error } = await supabase
    .from('crm_partners')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);
  return !error;
}

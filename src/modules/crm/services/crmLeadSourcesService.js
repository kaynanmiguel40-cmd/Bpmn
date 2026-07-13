/**
 * crmLeadSourcesService - origens de lead (canal de aquisicao) cadastraveis
 * pela equipe, alimentando o dropdown "Origem do Lead" do formulario de
 * negocio. crm_deals.source continua texto livre (sem FK).
 */

import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { crmLeadSourceSchema } from '../schemas/crmValidation';

// ==================== TRANSFORMADOR ====================

export function dbToCrmLeadSource(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    position: row.position ?? 0,
    createdAt: row.created_at,
  };
}

// ==================== CRUD VIA FACTORY ====================

const leadSourceService = createCRUDService({
  table: 'crm_lead_sources',
  localKey: 'crm_lead_sources',
  idPrefix: 'crm_src',
  transform: dbToCrmLeadSource,
  schema: crmLeadSourceSchema,
  fieldMap: {
    name: 'name',
    position: 'position',
  },
  orderBy: 'position',
  orderAsc: true,
});

// ==================== FUNCOES EXPORTADAS ====================

export async function getCrmLeadSources() {
  const { data, error } = await supabase
    .from('crm_lead_sources')
    .select('*')
    .order('position', { ascending: true })
    .order('name', { ascending: true });

  if (error) return [];
  return (data || []).map(dbToCrmLeadSource);
}

export async function createCrmLeadSource(data) {
  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;
  return leadSourceService.create(data, { created_by: userId });
}

export async function deleteCrmLeadSource(id) {
  const { error } = await supabase.from('crm_lead_sources').delete().eq('id', id);
  return !error;
}

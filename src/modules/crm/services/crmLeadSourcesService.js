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

/**
 * Compara nomes ignorando caixa, acento e espaco sobrando.
 *
 * "Prospecção ativa" e "Prospeccao ativa" sao a MESMA origem digitada duas
 * vezes — e foi assim que a lista chegou a 29 tags pra ~8 origens reais, com o
 * mesmo parceiro aparecendo cinco vezes no filtro e toda contagem por origem
 * saindo partida ao meio.
 */
export function mesmaOrigem(a, b) {
  const norm = (v) => (v || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')  // tira acento
    .replace(/\s+/g, ' ').trim().toLowerCase();
  return norm(a) === norm(b);
}

/**
 * Cria a tag de origem — ou devolve a que ja existe.
 *
 * Nao e so evitar duplicata visual: `source` alimenta o score do lead
 * (categoriaOrigem) e a pagina do parceiro, que casa o nome entre parenteses.
 * Duas grafias da mesma origem partem os dois em dois.
 */
export async function createCrmLeadSource(data) {
  const nome = (data?.name || '').replace(/\s+/g, ' ').trim();
  if (!nome) return null;

  const { data: existentes } = await supabase.from('crm_lead_sources').select('id, name');
  const igual = (existentes || []).find(s => mesmaOrigem(s.name, nome));
  // Devolve a existente em vez de criar irma: quem digitou "Trafego pago"
  // queria a "Tráfego pago" que ja esta la.
  if (igual) return igual;

  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;
  return leadSourceService.create({ ...data, name: nome }, { created_by: userId });
}

export async function deleteCrmLeadSource(id) {
  const { error } = await supabase.from('crm_lead_sources').delete().eq('id', id);
  return !error;
}

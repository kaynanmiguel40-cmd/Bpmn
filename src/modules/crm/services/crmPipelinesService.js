import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { validateAndSanitize } from '../../../lib/validation';
import { crmPipelineSchema } from '../schemas/crmValidation';

// ==================== TRANSFORMADORES ====================

export function dbToPipeline(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    isDefault: row.is_default || false,
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    stages: Array.isArray(row.crm_pipeline_stages)
      ? row.crm_pipeline_stages.map(dbToStage).sort((a, b) => a.position - b.position)
      : [],
  };
}

export function dbToStage(row) {
  if (!row) return null;
  return {
    id: row.id,
    pipelineId: row.pipeline_id,
    name: row.name,
    position: row.position,
    color: row.color || '#6366f1',
    isWinStage: row.is_win_stage || false,
    createdAt: row.created_at,
  };
}

// ==================== FUNCOES EXPORTADAS ====================

export async function getCrmPipelines() {
  const { data, error } = await supabase
    .from('crm_pipelines')
    .select('*, crm_pipeline_stages(*)')
    .order('created_at');

  if (error) {
    toast(`Erro ao buscar pipelines: ${error.message}`, 'error');
    return [];
  }
  return (data || []).map(dbToPipeline);
}

export async function getCrmPipelineWithDeals(pipelineId) {
  // Buscar pipeline com stages
  const { data: pipeline, error: pError } = await supabase
    .from('crm_pipelines')
    .select('*, crm_pipeline_stages(*)')
    .eq('id', pipelineId)
    .maybeSingle();

  if (pError) {
    toast(`Erro ao buscar pipeline: ${pError.message}`, 'error');
    return null;
  }
  if (!pipeline) return null;

  // Buscar deals ABERTOS e PERDIDOS do pipeline com contato e empresa.
  // Ordem descendente: novos deals aparecem no topo de cada estagio.
  const { data: deals, error: dError } = await supabase
    .from('crm_deals')
    .select('*, crm_contacts(id, name, avatar_color, company_id, city, phone), crm_companies(id, name, city, phone), team_members(id, name, color)')
    .eq('pipeline_id', pipelineId)
    .in('status', ['open', 'lost', 'won'])
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (dError) {
    toast(`Erro ao buscar deals: ${dError.message}`, 'error');
  }

  // Buscar historico de transicoes pra calcular `daysInStage` por deal.
  // Pega a ultima transicao de cada deal — quando ele entrou no stage atual.
  const dealIds = (deals || []).map(d => d.id);
  const lastStageChangeMap = {};
  if (dealIds.length > 0) {
    const { data: history } = await supabase
      .from('crm_deal_stage_history')
      .select('deal_id, to_stage_id, created_at')
      .in('deal_id', dealIds)
      .order('created_at', { ascending: false });

    // Para cada deal, primeira ocorrencia (mais recente, ja ordenado desc) eh a ultima transicao
    (history || []).forEach(h => {
      if (!lastStageChangeMap[h.deal_id]) {
        lastStageChangeMap[h.deal_id] = h.created_at;
      }
    });
  }

  // Cadencia: conta os toques de follow-up (call/email) por deal e descobre o
  // proximo toque pendente. Alimenta o selo "Tentativa X/Y · proximo toque" no card.
  const cadenceMap = {};
  if (dealIds.length > 0) {
    const { data: activities } = await supabase
      .from('crm_activities')
      .select('deal_id, start_date, completed')
      .in('deal_id', dealIds)
      .in('type', ['call', 'email'])
      .is('deleted_at', null);

    const todayStr = new Date().toISOString().slice(0, 10);
    const byDeal = {};
    (activities || []).forEach(a => {
      if (!a.deal_id) return;
      (byDeal[a.deal_id] = byDeal[a.deal_id] || []).push(a);
    });

    Object.entries(byDeal).forEach(([dealId, list]) => {
      const total = list.length;
      const done = list.filter(a => a.completed).length;
      // Proximo toque pendente = mais cedo entre os nao concluidos
      const pending = list
        .filter(a => !a.completed && a.start_date)
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
      const next = pending[0] || null;
      const nextDate = next ? next.start_date.slice(0, 10) : null;
      cadenceMap[dealId] = {
        total,
        done,
        attempt: Math.min(done + 1, total), // tentativa "atual" (proxima a fazer)
        nextDate,
        overdue: !!(nextDate && nextDate < todayStr),
        finished: total > 0 && done >= total,
      };
    });
  }

  const result = dbToPipeline(pipeline);

  // Agrupar deals por stage
  const dealsByStage = {};
  (deals || []).forEach(d => {
    if (!dealsByStage[d.stage_id]) dealsByStage[d.stage_id] = [];
    // Fallback: deals antigos sem historico usam created_at do deal
    const lastStageChangedAt = lastStageChangeMap[d.id] || d.created_at;
    dealsByStage[d.stage_id].push({
      id: d.id,
      title: d.title,
      value: d.value,
      probability: d.probability,
      status: d.status,
      expectedCloseDate: d.expected_close_date,
      contactId: d.contact_id,
      companyId: d.company_id,
      // contactPhone do deal (campo direto) cai pro phone do contact joineado
      contactName: d.contact_name,
      contactPhone: d.contact_phone,
      contact: d.crm_contacts ? { id: d.crm_contacts.id, name: d.crm_contacts.name, avatarColor: d.crm_contacts.avatar_color, city: d.crm_contacts.city, phone: d.crm_contacts.phone } : null,
      company: d.crm_companies ? { id: d.crm_companies.id, name: d.crm_companies.name, city: d.crm_companies.city, phone: d.crm_companies.phone } : null,
      ownerId: d.owner_id || null,
      owner: d.team_members ? { id: d.team_members.id, name: d.team_members.name, color: d.team_members.color } : null,
      createdAt: d.created_at,
      lastStageChangedAt,
      cadence: cadenceMap[d.id] || null,
    });
  });

  result.stages = result.stages.map(stage => {
    const allDeals = dealsByStage[stage.id] || [];
    const deals = allDeals;
    return {
      ...stage,
      deals,
      totalValue: deals.reduce((sum, d) => sum + (d.value || 0), 0),
    };
  });

  return result;
}

export async function createCrmPipeline(data) {
  const validation = validateAndSanitize(crmPipelineSchema, data);
  if (!validation.success) {
    toast(validation.error, 'error');
    return null;
  }

  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;

  const { data: pipeline, error } = await supabase
    .from('crm_pipelines')
    .insert([{ name: validation.data.name, is_default: validation.data.isDefault, created_by: userId }])
    .select()
    .single();

  if (error) {
    toast(`Erro ao criar pipeline: ${error.message}`, 'error');
    return null;
  }

  // Criar stages padrao se nenhum fornecido (Fechamento marca vitoria — sem
  // win stage o kanban nunca fecha deal como ganho)
  const defaultStages = data.stages || [
    { name: 'Prospecção', position: 1, color: '#94a3b8' },
    { name: 'Qualificação', position: 2, color: '#6366f1' },
    { name: 'Proposta', position: 3, color: '#f59e0b' },
    { name: 'Negociação', position: 4, color: '#f97316' },
    { name: 'Fechamento', position: 5, color: '#10b981', isWinStage: true },
  ];

  const stageRows = defaultStages.map(s => ({
    pipeline_id: pipeline.id,
    name: s.name,
    position: s.position,
    color: s.color || '#6366f1',
    is_win_stage: s.isWinStage || false,
  }));

  const { error: stagesError } = await supabase.from('crm_pipeline_stages').insert(stageRows);
  if (stagesError) {
    console.error('Erro ao criar stages:', stagesError, stageRows);
    toast(`Pipeline criada, mas erro ao criar etapas: ${stagesError.message}`, 'error');
  }

  // Re-buscar pipeline com stages para retornar completo
  const { data: fullPipeline } = await supabase
    .from('crm_pipelines')
    .select('*, crm_pipeline_stages(*)')
    .eq('id', pipeline.id)
    .maybeSingle();

  return dbToPipeline(fullPipeline || pipeline);
}

export async function deleteCrmPipeline(id) {
  // CASCADE deleta os stages automaticamente
  const { error } = await supabase
    .from('crm_pipelines')
    .delete()
    .eq('id', id);

  if (error) {
    toast(`Erro ao excluir pipeline: ${error.message}`, 'error');
    return false;
  }
  return true;
}

// ==================== PIPELINE PARCEIROS ====================

export async function ensurePartnersPipeline() {
  // Verifica se pipeline "Parceiros" ja existe
  const { data: existing } = await supabase
    .from('crm_pipelines')
    .select('id')
    .eq('name', 'Parceiros')
    .maybeSingle();

  if (existing) return { id: existing.id, created: false };

  // Cria pipeline com stages especificas para parceiros
  const pipeline = await createCrmPipeline({
    name: 'Parceiros',
    isDefault: false,
    stages: [
      { name: 'Identificado', position: 1, color: '#94a3b8' },
      { name: 'Contato Feito', position: 2, color: '#6366f1' },
      { name: 'Reuniao Agendada', position: 3, color: '#3b82f6' },
      { name: 'Em Negociacao', position: 4, color: '#f97316' },
      { name: 'Parceria Fechada', position: 5, color: '#10b981', isWinStage: true },
    ],
  });

  return { id: pipeline?.id, created: true };
}

// ==================== LIMPEZA COMPLETA CRM ====================

/**
 * Remove TODOS os dados de teste do CRM:
 * - Soft-delete em deals, contacts, companies, activities
 * - Hard-delete em pipelines (CASCADE apaga stages e historico)
 * - Hard-delete em goals
 */
export async function cleanAllCrmTestData() {
  const now = new Date().toISOString();

  // Soft-delete em todas as tabelas com deleted_at
  const softDeleteTables = ['crm_deals', 'crm_activities', 'crm_contacts', 'crm_companies'];
  for (const table of softDeleteTables) {
    await supabase.from(table).update({ deleted_at: now }).is('deleted_at', null);
  }

  // Hard-delete em pipelines (CASCADE apaga stages + historico)
  await supabase.from('crm_pipelines').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Hard-delete em goals
  await supabase.from('crm_goals').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  return true;
}

// ==================== SEED PIPELINES COMERCIAIS FYNESS ====================

/**
 * Limpa todos os dados de teste e cria as 4 pipelines do processo Inside Sales:
 *
 *   1. IA Inbound   (default) -> lead que chegou ate nos (anuncio, SEO, site)
 *   2. IA Outbound            -> lead da prospeccao ativa (Apollo, LinkedIn, GMN)
 *   3. Vendedor               -> smart lead na mao do closer
 *   4. Nurturing              -> nao convertidos, ciclos de reativacao 30/60/90d
 *
 * Handoff entre pipelines:
 *   IA Inbound  --(Smart Lead Criado)--> Vendedor
 *   IA Outbound --(Smart Lead Criado)--> Vendedor
 *   Vendedor    --(perdeu / nao agora)-> Nurturing
 *   Nurturing   --(reativou)----------> IA Inbound
 */
export async function seedCommercialPipelines() {
  // Limpar dados de teste primeiro
  await cleanAllCrmTestData();

  const PIPELINES = [
    {
      name: 'IA Inbound',
      isDefault: true,
      stages: [
        { name: 'Lead Captado',                     position: 1, color: '#94a3b8', isWinStage: false },
        { name: 'WhatsApp Qualificador',            position: 2, color: '#06b6d4', isWinStage: false },
        { name: 'Cadencia D0',                      position: 3, color: '#0891b2', isWinStage: false },
        { name: 'Cadencia D2',                      position: 4, color: '#0e7490', isWinStage: false },
        { name: 'Cadencia D5',                      position: 5, color: '#155e75', isWinStage: false },
        { name: 'Respondeu - Qualificando ICP',     position: 6, color: '#a78bfa', isWinStage: false },
        { name: 'ICP OK - Demo Gravada Enviada',    position: 7, color: '#8b5cf6', isWinStage: false },
        { name: 'Smart Lead Criado',                position: 8, color: '#10b981', isWinStage: true  },
        { name: 'Excluida',                         position: 9, color: '#ef4444', isWinStage: false },
      ],
    },
    {
      name: 'IA Outbound',
      isDefault: false,
      stages: [
        { name: 'Lista Gerada',                     position: 1, color: '#94a3b8', isWinStage: false },
        { name: 'Enriquecido',                      position: 2, color: '#fbbf24', isWinStage: false },
        { name: 'Cadencia D0-D1',                   position: 3, color: '#f59e0b', isWinStage: false },
        { name: 'Cadencia D2-D4',                   position: 4, color: '#d97706', isWinStage: false },
        { name: 'Cadencia D5-D7',                   position: 5, color: '#b45309', isWinStage: false },
        { name: 'Engajou - Qualificando ICP',       position: 6, color: '#a78bfa', isWinStage: false },
        { name: 'ICP OK - Demo Gravada Enviada',    position: 7, color: '#8b5cf6', isWinStage: false },
        { name: 'Smart Lead Criado',                position: 8, color: '#10b981', isWinStage: true  },
        { name: 'Excluida',                         position: 9, color: '#ef4444', isWinStage: false },
      ],
    },
    {
      name: 'Vendedor',
      isDefault: false,
      stages: [
        { name: 'Smart Lead Recebido',  position: 1,  color: '#94a3b8', isWinStage: false },
        { name: 'Tentativas 1-3',       position: 2,  color: '#60a5fa', isWinStage: false },
        { name: 'Tentativas 4-6',       position: 3,  color: '#3b82f6', isWinStage: false },
        { name: 'Tentativas 7-9',       position: 4,  color: '#2563eb', isWinStage: false },
        { name: 'Break-up Enviado',     position: 5,  color: '#64748b', isWinStage: false },
        { name: 'Conectou (AIDA)',      position: 6,  color: '#6366f1', isWinStage: false },
        { name: 'Demo (SPIN)',          position: 7,  color: '#4f46e5', isWinStage: false },
        { name: 'Proposta Enviada',     position: 8,  color: '#f59e0b', isWinStage: false },
        { name: 'Trial 7 Dias',         position: 9,  color: '#f97316', isWinStage: false },
        { name: 'Negociacao Final',     position: 10, color: '#ef4444', isWinStage: false },
        { name: 'Cliente Ativo',        position: 11, color: '#10b981', isWinStage: true  },
        { name: 'Excluida',             position: 12, color: '#ef4444', isWinStage: false },
      ],
    },
    {
      name: 'Nurturing',
      isDefault: false,
      stages: [
        { name: 'Em Nutricao',         position: 1, color: '#ec4899', isWinStage: false },
        { name: 'Reativacao D30',      position: 2, color: '#f472b6', isWinStage: false },
        { name: 'Reativacao D60',      position: 3, color: '#db2777', isWinStage: false },
        { name: 'Reativacao D90',      position: 4, color: '#be185d', isWinStage: false },
        { name: 'Reativou',            position: 5, color: '#10b981', isWinStage: true  },
        { name: 'Descarte',            position: 6, color: '#94a3b8', isWinStage: false },
      ],
    },
  ];

  const created = [];
  for (const p of PIPELINES) {
    const pipeline = await createCrmPipeline(p);
    if (pipeline) {
      created.push({ name: p.name, id: pipeline.id, alreadyExisted: false });
    }
  }

  if (created.length > 0) {
    toast(`${created.length} pipelines criadas com sucesso`, 'success');
  }
  return created;
}

// ==================== SEED EARLY STAGE (vendas + parceiros) ==================

/**
 * Tres pipelines pro estagio atual (na unha, poucos leads), todas com a mesma
 * espinha (prospect -> cadencia -> conversa -> reuniao -> proposta -> fechado),
 * pra reaproveitar o selo/botao de cadencia (que sao por NEGOCIO, nao por pipeline):
 *
 *   1. "Outbound Manual" (default) -> VENDAS frias: vender o Fyness pro cliente final.
 *        A contatar -> Em cadencia -> Respondeu -> Reuniao/Demo -> Proposta -> Cliente
 *
 *   2. "Parceiros"               -> AQUISICAO DE PARCEIROS: contadores, financeiras,
 *        advocacia, associacoes que indicam/endossam. (Nome "Parceiros" e exigido
 *        pela integracao de Prospeccao modo parceiros -> enviar pra pipeline.)
 *        Fluxo real do contador: mapeio -> cadencia pra conversar -> apresento a
 *        parceria -> ele topa -> comeca a endossar/indicar clientes (que entram
 *        QUENTES na pipeline de Vendas, ja em "Respondeu", nao em "A contatar").
 *        Mapeado -> Em cadencia -> Respondeu -> Reuniao/Apresentacao -> Topou a parceria -> Parceiro ativo
 *
 *   3. "Leads de Parceiros"      -> clientes INDICADOS pelos parceiros (chegam quentes).
 *        Indicado -> Em cadencia -> Respondeu -> Reuniao/Demo -> Proposta -> Cliente
 *
 * A cadencia NAO vira coluna em nenhuma: vive como atividades dentro de
 * "Em cadencia" (ver createCadenceForDeal). Estagio = estado do lead, nao esforco.
 * "Comecar limpo": apaga dados de teste + pipelines existentes antes de criar.
 */
export async function seedEarlyStagePipelines() {
  await cleanAllCrmTestData();

  const sales = await createCrmPipeline({
    name: 'Outbound Manual',
    isDefault: true,
    stages: [
      { name: 'A contatar',     position: 1, color: '#94a3b8', isWinStage: false },
      { name: 'Em cadência',    position: 2, color: '#06b6d4', isWinStage: false },
      { name: 'Respondeu',      position: 3, color: '#a78bfa', isWinStage: false },
      { name: 'Reunião / Demo', position: 4, color: '#3b82f6', isWinStage: false },
      { name: 'Proposta',       position: 5, color: '#f59e0b', isWinStage: false },
      { name: 'Cliente',        position: 6, color: '#10b981', isWinStage: true  },
    ],
  });

  const partners = await createCrmPipeline({
    name: 'Parceiros',
    isDefault: false,
    stages: [
      { name: 'Mapeado',               position: 1, color: '#94a3b8', isWinStage: false },
      { name: 'Em cadência',           position: 2, color: '#06b6d4', isWinStage: false },
      { name: 'Respondeu',             position: 3, color: '#a78bfa', isWinStage: false },
      { name: 'Reunião / Apresentação',position: 4, color: '#3b82f6', isWinStage: false },
      { name: 'Topou a parceria',      position: 5, color: '#f59e0b', isWinStage: false },
      { name: 'Parceiro ativo',        position: 6, color: '#10b981', isWinStage: true  },
    ],
  });

  // Clientes INDICADOS pelos parceiros — chegam quentes (sem fase fria). Pipeline
  // separada pra medir o canal: quanto cada parceiro indica e quanto converte.
  const partnerLeads = await createCrmPipeline({
    name: 'Leads de Parceiros',
    isDefault: false,
    stages: [
      { name: 'Indicado',       position: 1, color: '#94a3b8', isWinStage: false },
      { name: 'Em cadência',    position: 2, color: '#06b6d4', isWinStage: false },
      { name: 'Respondeu',      position: 3, color: '#a78bfa', isWinStage: false },
      { name: 'Reunião / Demo', position: 4, color: '#3b82f6', isWinStage: false },
      { name: 'Proposta',       position: 5, color: '#f59e0b', isWinStage: false },
      { name: 'Cliente',        position: 6, color: '#10b981', isWinStage: true  },
    ],
  });

  const created = [sales, partners, partnerLeads].filter(p => p?.id);
  if (created.length > 0) {
    toast(`${created.length} pipelines criadas (Vendas + Parceiros + Leads de Parceiros)`, 'success');
  }
  return created;
}

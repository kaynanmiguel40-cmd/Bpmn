import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { validateAndSanitize, validatePartial } from '../../../lib/validation';
import { crmPipelineSchema, crmPipelineStageSchema } from '../schemas/crmValidation';

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
    triggersMeeting: row.triggers_meeting || false,
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

  // Buscar deals ABERTOS e PERDIDOS do pipeline com contato e empresa
  const { data: deals, error: dError } = await supabase
    .from('crm_deals')
    .select('*, crm_contacts(id, name, avatar_color, company_id, city), crm_companies(id, name, city), team_members(id, name, color)')
    .eq('pipeline_id', pipelineId)
    .in('status', ['open', 'lost', 'won'])
    .is('deleted_at', null)
    .order('created_at');

  if (dError) {
    toast(`Erro ao buscar deals: ${dError.message}`, 'error');
  }

  const result = dbToPipeline(pipeline);

  // Agrupar deals por stage
  const dealsByStage = {};
  (deals || []).forEach(d => {
    if (!dealsByStage[d.stage_id]) dealsByStage[d.stage_id] = [];
    dealsByStage[d.stage_id].push({
      id: d.id,
      title: d.title,
      value: d.value,
      probability: d.probability,
      status: d.status,
      expectedCloseDate: d.expected_close_date,
      contactId: d.contact_id,
      companyId: d.company_id,
      contact: d.crm_contacts ? { id: d.crm_contacts.id, name: d.crm_contacts.name, avatarColor: d.crm_contacts.avatar_color, city: d.crm_contacts.city } : null,
      company: d.crm_companies ? { id: d.crm_companies.id, name: d.crm_companies.name, city: d.crm_companies.city } : null,
      ownerId: d.owner_id || null,
      owner: d.team_members ? { id: d.team_members.id, name: d.team_members.name, color: d.team_members.color } : null,
      createdAt: d.created_at,
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

  // Criar stages padrao se nenhum fornecido
  const defaultStages = data.stages || [
    { name: 'Prospecção', position: 1, color: '#94a3b8' },
    { name: 'Qualificação', position: 2, color: '#6366f1' },
    { name: 'Proposta', position: 3, color: '#f59e0b' },
    { name: 'Negociação', position: 4, color: '#f97316' },
    { name: 'Fechamento', position: 5, color: '#10b981' },
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

export async function updateCrmPipeline(id, updates) {
  const validation = validatePartial(crmPipelineSchema, updates);
  if (!validation.success) {
    toast(validation.error, 'error');
    return null;
  }

  const updateData = {};
  if (validation.data.name !== undefined) updateData.name = validation.data.name;
  if (validation.data.isDefault !== undefined) updateData.is_default = validation.data.isDefault;

  const { data, error } = await supabase
    .from('crm_pipelines')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    toast(`Erro ao atualizar pipeline: ${error.message}`, 'error');
    return null;
  }
  return dbToPipeline(data);
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

export async function reorderCrmStages(stageUpdates) {
  // stageUpdates = [{ id, position, name?, color?, isWinStage? }, ...]
  const results = await Promise.all(
    stageUpdates.map(s => {
      const update = { position: s.position };
      if (s.name) update.name = s.name;
      if (s.color) update.color = s.color;
      if (s.isWinStage !== undefined) update.is_win_stage = s.isWinStage;
      if (s.triggersMeeting !== undefined) update.triggers_meeting = s.triggersMeeting;
      return supabase.from('crm_pipeline_stages').update(update).eq('id', s.id);
    })
  );

  const hasError = results.some(r => r.error);
  if (hasError) {
    toast('Erro ao reordenar etapas', 'error');
    return false;
  }
  return true;
}

export async function addCrmStage(pipelineId, stageData) {
  const validation = validateAndSanitize(crmPipelineStageSchema, { ...stageData, pipelineId });
  if (!validation.success) {
    toast(validation.error, 'error');
    return null;
  }

  const { data, error } = await supabase
    .from('crm_pipeline_stages')
    .insert([{
      pipeline_id: pipelineId,
      name: validation.data.name,
      position: validation.data.position,
      color: validation.data.color,
      is_win_stage: validation.data.isWinStage || false,
      triggers_meeting: validation.data.triggersMeeting || false,
    }])
    .select()
    .single();

  if (error) {
    toast(`Erro ao criar etapa: ${error.message}`, 'error');
    return null;
  }
  return dbToStage(data);
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
      { name: 'Reuniao Agendada', position: 3, color: '#3b82f6', triggersMeeting: true },
      { name: 'Em Negociacao', position: 4, color: '#f97316' },
      { name: 'Parceria Fechada', position: 5, color: '#10b981', isWinStage: true },
    ],
  });

  return { id: pipeline?.id, created: true };
}

export async function deleteCrmStage(stageId) {
  const { error } = await supabase
    .from('crm_pipeline_stages')
    .delete()
    .eq('id', stageId);

  if (error) {
    toast(`Erro ao excluir etapa: ${error.message}`, 'error');
    return false;
  }
  return true;
}

export async function setWinStage(stageId, pipelineId) {
  // Desmarcar todos os estagios de vitoria do pipeline
  await supabase
    .from('crm_pipeline_stages')
    .update({ is_win_stage: false })
    .eq('pipeline_id', pipelineId);

  // Marcar o estagio selecionado (se houver)
  if (stageId) {
    const { error } = await supabase
      .from('crm_pipeline_stages')
      .update({ is_win_stage: true })
      .eq('id', stageId);

    if (error) {
      toast(`Erro ao definir estagio de vitoria: ${error.message}`, 'error');
      return false;
    }
  }

  return true;
}

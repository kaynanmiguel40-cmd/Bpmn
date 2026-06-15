import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { crmDealSchema } from '../schemas/crmValidation';
import { triggerAutomationsForDeal } from './crmAutomationsService';
import { createCrmActivity } from './crmActivitiesService';
import { getCrmWorkspaceSettings } from '../lib/workspaceSettings';
import { escapeIlike } from '../lib/searchFilters';

// ==================== TIPOS ====================

export type DealStatus = 'open' | 'won' | 'lost';

export interface CrmDeal {
  id: string;
  title: string;
  value: number;
  probability: number;
  contactId: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contact: { id: string; name: string; avatarColor?: string | null; email?: string | null } | null;
  companyId: string | null;
  company: { id: string; name: string; segment?: string | null } | null;
  pipelineId: string | null;
  stageId: string | null;
  stage: { id: string; name: string; color?: string | null } | null;
  expectedCloseDate: string | null;
  closedAt: string | null;
  status: DealStatus;
  lostReason: string | null;
  segment: string | null;
  notes: string;
  ownerId: string | null;
  owner: { id: string; name: string; color?: string | null } | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _movedTo?: 'nurturing' | 'descarte' | null;
}

export interface CrmDealRow {
  id: string;
  title: string;
  value?: number | null;
  probability?: number | null;
  contact_id?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  crm_contacts?: { id: string; name: string; avatar_color?: string | null; email?: string | null } | null;
  company_id?: string | null;
  crm_companies?: { id: string; name: string; segment?: string | null } | null;
  pipeline_id?: string | null;
  stage_id?: string | null;
  crm_pipeline_stages?: { id: string; name: string; color?: string | null } | null;
  expected_close_date?: string | null;
  closed_at?: string | null;
  status?: DealStatus | null;
  lost_reason?: string | null;
  segment?: string | null;
  notes?: string | null;
  owner_id?: string | null;
  team_members?: { id: string; name: string; color?: string | null } | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  [key: string]: unknown;
}

export interface CrmDealFilters {
  search?: string;
  status?: DealStatus;
  pipelineId?: string;
  stageId?: string;
  contactId?: string;
  companyId?: string;
  page?: number;
  perPage?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ==================== TRANSFORMADOR ====================

export function dbToCrmDeal(row: CrmDealRow | null | undefined): CrmDeal | null {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    value: row.value || 0,
    probability: row.probability ?? 50,
    contactId: row.contact_id || null,
    contactName: row.contact_name || null,
    contactPhone: row.contact_phone || null,
    contactEmail: row.contact_email || null,
    contact: row.crm_contacts ? {
      id: row.crm_contacts.id,
      name: row.crm_contacts.name,
      avatarColor: row.crm_contacts.avatar_color,
      email: row.crm_contacts.email,
    } : null,
    companyId: row.company_id || null,
    company: row.crm_companies ? {
      id: row.crm_companies.id,
      name: row.crm_companies.name,
      segment: row.crm_companies.segment || null,
    } : null,
    pipelineId: row.pipeline_id || null,
    stageId: row.stage_id || null,
    stage: row.crm_pipeline_stages ? {
      id: row.crm_pipeline_stages.id,
      name: row.crm_pipeline_stages.name,
      color: row.crm_pipeline_stages.color,
    } : null,
    expectedCloseDate: row.expected_close_date || null,
    closedAt: row.closed_at || null,
    status: row.status || 'open',
    lostReason: row.lost_reason || null,
    segment: row.segment || null,
    notes: row.notes || '',
    ownerId: row.owner_id || null,
    owner: row.team_members ? {
      id: row.team_members.id,
      name: row.team_members.name,
      color: row.team_members.color,
    } : null,
    createdBy: row.created_by || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at || null,
  };
}

// ==================== CRUD VIA FACTORY ====================

const dealService = createCRUDService<CrmDeal, CrmDealRow>({
  table: 'crm_deals',
  localKey: 'crm_deals',
  idPrefix: 'crm_dl',
  transform: row => dbToCrmDeal(row) as CrmDeal,
  schema: crmDealSchema,
  fieldMap: {
    title: 'title',
    value: 'value',
    probability: 'probability',
    contactId: 'contact_id',
    contactName: 'contact_name',
    contactPhone: 'contact_phone',
    contactEmail: 'contact_email',
    companyId: 'company_id',
    pipelineId: 'pipeline_id',
    stageId: 'stage_id',
    expectedCloseDate: 'expected_close_date',
    segment: 'segment',
    status: 'status',
    lostReason: 'lost_reason',
    closedAt: 'closed_at',
    notes: 'notes',
    ownerId: 'owner_id',
  },
  orderBy: 'created_at',
  orderAsc: false,
});

// ==================== FUNCOES EXPORTADAS ====================

export async function getCrmDeals(filters: CrmDealFilters = {}): Promise<{ data: CrmDeal[]; count: number }> {
  const { search, status, pipelineId, stageId, contactId, companyId, page, perPage = 25, sortBy, sortOrder } = filters;

  let query = supabase
    .from('crm_deals')
    .select(
      '*, crm_contacts(id, name, avatar_color), crm_companies(id, name, segment), crm_pipeline_stages(id, name, color), team_members(id, name, color)',
      { count: 'exact' },
    )
    .is('deleted_at', null);

  if (search) {
    query = query.ilike('title', `%${escapeIlike(search)}%`);
  }
  if (status) query = query.eq('status', status);
  if (pipelineId) query = query.eq('pipeline_id', pipelineId);
  if (stageId) query = query.eq('stage_id', stageId);
  if (contactId) query = query.eq('contact_id', contactId);
  if (companyId) query = query.eq('company_id', companyId);

  query = query.order(sortBy || 'created_at', { ascending: sortOrder === 'asc' });

  if (page && perPage) {
    const from = (page - 1) * perPage;
    query = query.range(from, from + perPage - 1);
  }

  const { data, error, count } = await query;
  if (error) {
    toast(`Erro ao buscar negocios: ${error.message}`, 'error');
    return { data: [], count: 0 };
  }
  return {
    data: ((data as CrmDealRow[]) || []).map(row => dbToCrmDeal(row) as CrmDeal),
    count: count || 0,
  };
}

export async function getCrmDealById(id: string): Promise<CrmDeal | null> {
  const { data, error } = await supabase
    .from('crm_deals')
    .select('*, crm_contacts(id, name, avatar_color, email, phone, position), crm_companies(id, name, segment), crm_pipeline_stages(id, name, color), team_members(id, name, color)')
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error) return null;
  return dbToCrmDeal(data as CrmDealRow);
}

export async function createCrmDeal(data: Record<string, unknown>): Promise<CrmDeal | null> {
  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;
  const result = await dealService.create(data, { created_by: userId });

  if (result?.id && data.stageId && data.pipelineId) {
    await recordStageTransition(result.id, null, data.stageId as string, data.pipelineId as string);
  }

  return result;
}

export async function updateCrmDeal(id: string, updates: Record<string, unknown>): Promise<CrmDeal | null> {
  // closed_at e probability andam JUNTOS com o status em QUALQUER caminho que
  // edite status (form de detalhe, dropdown, etc). Sem isso, um deal marcado
  // won/lost pelo formulario fica sem closed_at e SOME dos relatorios que
  // filtram por closed_at — a divergencia classica entre arrastar e editar.
  const next = { ...updates };
  if (next.status === 'won') {
    if (next.closedAt === undefined) next.closedAt = new Date().toISOString();
    if (next.probability === undefined) next.probability = 100;
  } else if (next.status === 'lost') {
    if (next.closedAt === undefined) next.closedAt = new Date().toISOString();
    if (next.probability === undefined) next.probability = 0;
  } else if (next.status === 'open') {
    next.closedAt = null; // reabrir limpa o fechamento
  }
  return dealService.update(id, next);
}

export async function softDeleteCrmDeal(id: string): Promise<boolean> {
  const { error, data } = await supabase
    .from('crm_deals')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .select('id');

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) {
    throw new Error('Nenhum negocio foi excluido — provavel bloqueio por RLS ou ID inexistente.');
  }
  return true;
}

async function recordStageTransition(
  dealId: string,
  fromStageId: string | null,
  toStageId: string,
  pipelineId: string,
): Promise<void> {
  await supabase.from('crm_deal_stage_history').insert({
    deal_id: dealId,
    from_stage_id: fromStageId || null,
    to_stage_id: toStageId,
    pipeline_id: pipelineId,
  });
}

export async function moveDealToStage(dealId: string, stageId: string): Promise<CrmDeal | null> {
  const { data: current } = await supabase
    .from('crm_deals')
    .select('stage_id, pipeline_id, status')
    .eq('id', dealId)
    .single();

  const { data: targetStage } = await supabase
    .from('crm_pipeline_stages')
    .select('is_win_stage, name')
    .eq('id', stageId)
    .single();

  const isWinStage = (targetStage as { is_win_stage?: boolean } | null)?.is_win_stage === true;
  const currentStatus = (current as { status?: DealStatus } | null)?.status;
  const shouldAutoWin = isWinStage && currentStatus === 'open';
  const shouldReopen = !isWinStage && (currentStatus === 'won' || currentStatus === 'lost');

  const updatePayload: Record<string, unknown> = { stage_id: stageId, updated_at: new Date().toISOString() };
  if (shouldAutoWin) {
    updatePayload.status = 'won';
    updatePayload.probability = 100;
    updatePayload.closed_at = new Date().toISOString();
  } else if (shouldReopen) {
    updatePayload.status = 'open';
    updatePayload.closed_at = null;
  }

  const { data, error } = await supabase
    .from('crm_deals')
    .update(updatePayload)
    .eq('id', dealId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  const cur = current as { stage_id?: string; pipeline_id?: string } | null;
  if (cur && cur.stage_id !== stageId) {
    await recordStageTransition(dealId, cur.stage_id || null, stageId, cur.pipeline_id || '');
  }

  const result = dbToCrmDeal(data as CrmDealRow);

  if (cur && cur.stage_id !== stageId && result) {
    triggerAutomationsForDeal(result, stageId).catch(console.warn);
  }

  return result;
}

/**
 * Marca o deal como ganho. Equivalente a arrastar pro estagio de vitoria:
 * move pro win stage da pipeline (se houver), grava o historico de transicao
 * e dispara as automacoes da etapa. Antes, o botao de "trofeu" so trocava o
 * status e divergia do drag (sem stage/history/automacao).
 */
export async function markDealAsWon(dealId: string): Promise<CrmDeal | null> {
  const { data: current } = await supabase
    .from('crm_deals')
    .select('stage_id, pipeline_id, status')
    .eq('id', dealId)
    .single();
  const cur = current as { stage_id?: string | null; pipeline_id?: string | null } | null;

  // Acha o estagio de vitoria da pipeline pra alinhar a coluna do Kanban
  let winStageId: string | null = null;
  if (cur?.pipeline_id) {
    const { data: winStage } = await supabase
      .from('crm_pipeline_stages')
      .select('id')
      .eq('pipeline_id', cur.pipeline_id)
      .eq('is_win_stage', true)
      .maybeSingle();
    winStageId = (winStage as { id?: string } | null)?.id ?? null;
  }

  const nowIso = new Date().toISOString();
  const movedStage = !!winStageId && winStageId !== cur?.stage_id;
  const updatePayload: Record<string, unknown> = {
    status: 'won',
    probability: 100,
    closed_at: nowIso,
    updated_at: nowIso,
  };
  if (movedStage) updatePayload.stage_id = winStageId;

  const { data, error } = await supabase
    .from('crm_deals')
    .update(updatePayload)
    .eq('id', dealId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (movedStage && cur?.pipeline_id) {
    await recordStageTransition(dealId, cur.stage_id || null, winStageId as string, cur.pipeline_id);
  }

  const result = dbToCrmDeal(data as CrmDealRow);
  if (movedStage && result) {
    triggerAutomationsForDeal(result, winStageId as string).catch(console.warn);
  }
  return result;
}

interface PipelineConfig {
  pipelineId: string;
  entryStageId: string | null;
  discardStageId: string | null;
}

/**
 * Marca o deal como perdido E o move pra pipeline configurada como destino
 * de "perdidos" (handoff pra reativacao futura).
 */
export async function markDealAsLost(dealId: string, reason = ''): Promise<CrmDeal | null> {
  const { data: current } = await supabase
    .from('crm_deals')
    .select('pipeline_id, stage_id')
    .eq('id', dealId)
    .single();

  const cur = current as { pipeline_id?: string | null; stage_id?: string | null } | null;
  const settings = getCrmWorkspaceSettings();
  let targetPipelineId = cur?.pipeline_id ?? null;
  let targetStageId = cur?.stage_id ?? null;
  let movedTo: 'nurturing' | 'descarte' | 'excluida' | null = null;

  // Prioridade 1: se a propria pipeline tem estagio "Excluida", deal lost
  // vai pra la (continua visivel no Kanban da pipeline original).
  if (cur?.pipeline_id) {
    const { data: discardStage } = await supabase
      .from('crm_pipeline_stages')
      .select('id, name')
      .eq('pipeline_id', cur.pipeline_id)
      .ilike('name', 'exclu%')
      .maybeSingle();

    if (discardStage && (discardStage as { id?: string }).id) {
      const stageId = (discardStage as { id: string }).id;
      const nowIso = new Date().toISOString();
      const updatePayload: Record<string, unknown> = {
        status: 'lost',
        probability: 0,
        lost_reason: reason,
        closed_at: nowIso,
        updated_at: nowIso,
      };
      if (stageId !== cur.stage_id) updatePayload.stage_id = stageId;

      const { data: updated, error: updErr } = await supabase
        .from('crm_deals')
        .update(updatePayload)
        .eq('id', dealId)
        .select()
        .single();
      if (updErr) throw new Error(updErr.message);

      if (stageId !== cur.stage_id && cur.pipeline_id) {
        await recordStageTransition(dealId, cur.stage_id || null, stageId, cur.pipeline_id);
      }
      const dealRow = updated as unknown as CrmDealRow;
      const result = dbToCrmDeal(dealRow) as (CrmDeal & { movedTo?: 'excluida' | null });
      result.movedTo = 'excluida';
      return result;
    }
  }

  let pipelineConfig: PipelineConfig | null = null;

  if (settings.lostTargetPipelineId) {
    pipelineConfig = {
      pipelineId: settings.lostTargetPipelineId,
      entryStageId: settings.lostTargetStageId || null,
      discardStageId: settings.discardStageId || null,
    };
  } else {
    const { data: nurturing } = await supabase
      .from('crm_pipelines')
      .select('id, crm_pipeline_stages(id, name, position)')
      .eq('name', 'Nurturing')
      .maybeSingle();

    if (nurturing) {
      const nurturingData = nurturing as { id: string; crm_pipeline_stages?: Array<{ id: string; name: string; position: number }> };
      const stages = (nurturingData.crm_pipeline_stages || []).slice().sort((a, b) => a.position - b.position);
      const emNutricao = stages.find(s => s.name === 'Em Nutricao') || stages[0];
      const descarte = stages.find(s => s.name === 'Descarte') || stages[stages.length - 1];
      pipelineConfig = {
        pipelineId: nurturingData.id,
        entryStageId: emNutricao?.id || null,
        discardStageId: descarte?.id || null,
      };
    }
  }

  const nowIso = new Date().toISOString();
  const updatePayload: Record<string, unknown> = {
    status: 'lost',
    probability: 0,
    lost_reason: reason,
    closed_at: nowIso,
    updated_at: nowIso,
  };

  if (pipelineConfig && cur) {
    const isAlreadyInTarget = cur.pipeline_id === pipelineConfig.pipelineId;

    if (isAlreadyInTarget) {
      if (pipelineConfig.discardStageId && pipelineConfig.discardStageId !== cur.stage_id) {
        targetStageId = pipelineConfig.discardStageId;
        movedTo = 'descarte';
      }
    } else if (pipelineConfig.entryStageId) {
      targetPipelineId = pipelineConfig.pipelineId;
      targetStageId = pipelineConfig.entryStageId;
      movedTo = 'nurturing';
    }

    if (targetPipelineId !== cur.pipeline_id) {
      updatePayload.pipeline_id = targetPipelineId;
    }
    if (targetStageId !== cur.stage_id) {
      updatePayload.stage_id = targetStageId;
    }
  }

  const { data, error } = await supabase
    .from('crm_deals')
    .update(updatePayload)
    .eq('id', dealId)
    .select()
    .single();

  if (error) throw new Error(error.message);

  if (cur && targetStageId && targetStageId !== cur.stage_id) {
    await supabase.from('crm_deal_stage_history').insert({
      deal_id: dealId,
      from_stage_id: cur.stage_id || null,
      to_stage_id: targetStageId,
      pipeline_id: targetPipelineId,
    });
  }

  const result = dbToCrmDeal(data as CrmDealRow);
  if (result) result._movedTo = movedTo;
  return result;
}

// ==================== DEAL ACTIVITIES & HISTORY ====================

export interface DealActivity {
  id: string;
  title: string;
  description: string | null;
  type: string;
  startDate: string;
  endDate: string | null;
  completed: boolean;
  completedAt: string | null;
  contact: { id: string; name: string; avatarColor?: string | null } | null;
  createdAt: string;
}

export async function getDealActivities(dealId: string): Promise<DealActivity[]> {
  const { data, error } = await supabase
    .from('crm_activities')
    .select('*, crm_contacts(id, name, avatar_color)')
    .eq('deal_id', dealId)
    .is('deleted_at', null)
    .order('start_date', { ascending: false });

  if (error) {
    toast(`Erro ao buscar atividades: ${error.message}`, 'error');
    return [];
  }

  type ActivityRow = {
    id: string; title: string; description: string | null; type: string;
    start_date: string; end_date: string | null; completed: boolean; completed_at: string | null;
    crm_contacts?: { id: string; name: string; avatar_color?: string | null } | null;
    created_at: string;
  };

  return ((data as ActivityRow[]) || []).map(row => ({
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date,
    completed: row.completed,
    completedAt: row.completed_at,
    contact: row.crm_contacts
      ? { id: row.crm_contacts.id, name: row.crm_contacts.name, avatarColor: row.crm_contacts.avatar_color }
      : null,
    createdAt: row.created_at,
  }));
}

export interface DealStageHistoryEntry {
  id: string;
  fromStageId: string | null;
  toStageId: string;
  stage: { id: string; name: string; color: string | null } | null;
  createdAt: string;
}

export async function getDealStageHistory(dealId: string): Promise<DealStageHistoryEntry[]> {
  const { data, error } = await supabase
    .from('crm_deal_stage_history')
    .select('*, crm_pipeline_stages!crm_deal_stage_history_to_stage_id_fkey(id, name, color)')
    .eq('deal_id', dealId)
    .order('created_at', { ascending: false });

  type Row = {
    id: string; from_stage_id: string | null; to_stage_id: string;
    crm_pipeline_stages?: { id: string; name: string; color: string | null } | null;
    created_at: string;
  };

  if (error) {
    const { data: fallback } = await supabase
      .from('crm_deal_stage_history')
      .select('*')
      .eq('deal_id', dealId)
      .order('created_at', { ascending: false });

    return ((fallback as Row[]) || []).map(row => ({
      id: row.id,
      fromStageId: row.from_stage_id,
      toStageId: row.to_stage_id,
      stage: null,
      createdAt: row.created_at,
    }));
  }

  return ((data as Row[]) || []).map(row => ({
    id: row.id,
    fromStageId: row.from_stage_id,
    toStageId: row.to_stage_id,
    stage: row.crm_pipeline_stages
      ? { id: row.crm_pipeline_stages.id, name: row.crm_pipeline_stages.name, color: row.crm_pipeline_stages.color }
      : null,
    createdAt: row.created_at,
  }));
}

import { createCRUDService } from '../../../lib/serviceFactory';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';
import { crmDealSchema } from '../schemas/crmValidation';
import { triggerAutomationsForDeal } from './crmAutomationsService';
import { createCrmActivity } from './crmActivitiesService';
import { scheduleStepsForDeal, cancelPendingStepsForDeal } from './crmPlaybookService';
import { getCrmWorkspaceSettings } from '../lib/workspaceSettings';
import { escapeIlike } from '../lib/searchFilters';

// ==================== TIPOS ====================

export type DealStatus = 'open' | 'won' | 'lost';

export interface CrmDeal {
  id: string;
  title: string;
  value: number;
  mrr: number;
  probability: number;
  /** Prioridade do lead em estrelas (0-5). 0 = nao definida. */
  priority: number;
  /** Ordem na coluna do Kanban. Menor = mais em cima = atender primeiro. */
  position: number | null;
  /** true = a ordem foi arrastada a mao; false = herdada do backfill. */
  positionManual: boolean;
  contactId: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contact: { id: string; name: string; avatarColor?: string | null; email?: string | null; phone?: string | null } | null;
  companyId: string | null;
  company: { id: string; name: string; segment?: string | null; phone?: string | null } | null;
  pipelineId: string | null;
  stageId: string | null;
  stage: { id: string; name: string; color?: string | null; objetivo?: string; exitCriteria?: string } | null;
  expectedCloseDate: string | null;
  closedAt: string | null;
  status: DealStatus;
  churnedAt: string | null;
  lostReason: string | null;
  segment: string | null;
  source: string | null;
  notes: string;
  ownerId: string | null;
  /** Negocio que GEROU este (lead ligado). Historico compartilhado na cadeia. */
  originDealId: string | null;
  owner: { id: string; name: string; color?: string | null } | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  _movedTo?: 'nurturing' | 'descarte' | null;
  _reactivated?: boolean;
}

export interface CrmDealRow {
  id: string;
  title: string;
  value?: number | null;
  mrr?: number | null;
  probability?: number | null;
  priority?: number | null;
  position?: number | null;
  position_manual?: boolean | null;
  contact_id?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  crm_contacts?: { id: string; name: string; avatar_color?: string | null; email?: string | null; phone?: string | null } | null;
  company_id?: string | null;
  crm_companies?: { id: string; name: string; segment?: string | null; phone?: string | null } | null;
  pipeline_id?: string | null;
  stage_id?: string | null;
  crm_pipeline_stages?: { id: string; name: string; color?: string | null; objetivo?: string | null; exit_criteria?: string | null } | null;
  expected_close_date?: string | null;
  closed_at?: string | null;
  status?: DealStatus | null;
  churned_at?: string | null;
  lost_reason?: string | null;
  segment?: string | null;
  source?: string | null;
  notes?: string | null;
  owner_id?: string | null;
  origin_deal_id?: string | null;
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
    mrr: row.mrr || 0,
    probability: row.probability ?? 50,
    priority: row.priority ?? 0,
    position: row.position ?? null,
    positionManual: !!row.position_manual,
    contactId: row.contact_id || null,
    contactName: row.contact_name || null,
    contactPhone: row.contact_phone || null,
    contactEmail: row.contact_email || null,
    contact: row.crm_contacts ? {
      id: row.crm_contacts.id,
      name: row.crm_contacts.name,
      avatarColor: row.crm_contacts.avatar_color,
      email: row.crm_contacts.email,
      phone: row.crm_contacts.phone,
    } : null,
    companyId: row.company_id || null,
    company: row.crm_companies ? {
      id: row.crm_companies.id,
      name: row.crm_companies.name,
      segment: row.crm_companies.segment || null,
      phone: row.crm_companies.phone,
    } : null,
    pipelineId: row.pipeline_id || null,
    stageId: row.stage_id || null,
    stage: row.crm_pipeline_stages ? {
      id: row.crm_pipeline_stages.id,
      name: row.crm_pipeline_stages.name,
      color: row.crm_pipeline_stages.color,
      // Playbook da etapa (080) — usado pela aba Processo do negocio.
      objetivo: row.crm_pipeline_stages.objetivo || '',
      exitCriteria: row.crm_pipeline_stages.exit_criteria || '',
    } : null,
    expectedCloseDate: row.expected_close_date || null,
    closedAt: row.closed_at || null,
    status: row.status || 'open',
    churnedAt: row.churned_at || null,
    lostReason: row.lost_reason || null,
    segment: row.segment || null,
    source: row.source || null,
    notes: row.notes || '',
    ownerId: row.owner_id || null,
    originDealId: row.origin_deal_id || null,
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

/**
 * Resolve o nome/telefone/email "do lead" de um deal com UMA regra só:
 * o registro vinculado (contato, depois empresa) sempre vence; o texto
 * digitado direto no deal (contactName/contactPhone/contactEmail — usado
 * quando o negocio foi criado sem vincular um Contato) e so um fallback.
 *
 * Existiam 4 ordens de prioridade diferentes espalhadas pelo Pipeline/Deal
 * Detail, cada uma resolvendo esse empate de um jeito — o mesmo lead podia
 * mostrar telefone diferente dependendo da tela. Use esta função em vez de
 * repetir o fallback manual.
 */
export function getDealLeadInfo(deal: Pick<CrmDeal, 'contact' | 'company' | 'contactName' | 'contactPhone' | 'contactEmail'> | null | undefined) {
  return {
    name: deal?.contact?.name || deal?.company?.name || deal?.contactName || '',
    phone: deal?.contact?.phone || deal?.contactPhone || deal?.company?.phone || '',
    email: deal?.contact?.email || deal?.contactEmail || '',
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
    mrr: 'mrr',
    probability: 'probability',
    priority: 'priority',
    contactId: 'contact_id',
    contactName: 'contact_name',
    contactPhone: 'contact_phone',
    contactEmail: 'contact_email',
    companyId: 'company_id',
    pipelineId: 'pipeline_id',
    stageId: 'stage_id',
    expectedCloseDate: 'expected_close_date',
    segment: 'segment',
    source: 'source',
    status: 'status',
    lostReason: 'lost_reason',
    closedAt: 'closed_at',
    notes: 'notes',
    ownerId: 'owner_id',
    originDealId: 'origin_deal_id',
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
      '*, crm_contacts(id, name, avatar_color), crm_companies(id, name, segment), crm_pipeline_stages(id, name, color, objetivo, exit_criteria), team_members(id, name, color)',
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
    .select('*, crm_contacts(id, name, avatar_color, email, phone, position), crm_companies(id, name, segment, phone), crm_pipeline_stages(id, name, color, objetivo, exit_criteria), team_members(id, name, color)')
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

/**
 * Gera um lead NOVO ligado a um existente ("2 leads em 1").
 *
 * No primeiro contato o lead as vezes passa a bola pra outra pessoa que vai
 * continuar o atendimento. Ela vira um lead proprio — mas ligado ao original
 * (origin_deal_id), pra o historico seguir junto. O lead novo entra no MESMO
 * pipeline, no Primeiro contato, e ja recebe a cadencia dele.
 *
 * @returns o negocio criado, ou null.
 */
export async function gerarLeadLigado(
  { originDealId, nome, telefone = null, excludeActivityId = null }:
  { originDealId: string; nome: string; telefone?: string | null; excludeActivityId?: string | null },
): Promise<CrmDeal | null> {
  if (!originDealId || !nome?.trim()) return null;

  const { data: origem } = await supabase
    .from('crm_deals').select('pipeline_id, owner_id').eq('id', originDealId).maybeSingle();
  const origemRow = origem as { pipeline_id?: string; owner_id?: string | null } | null;
  if (!origemRow?.pipeline_id) return null;

  // Primeiro contato do MESMO pipeline (o estagio com cadencia). Fallback: o 2o
  // estagio (Leads=1, Primeiro contato=2 no funil padrao), senao o primeiro.
  const { data: stages } = await supabase
    .from('crm_pipeline_stages').select('id, name, position')
    .eq('pipeline_id', origemRow.pipeline_id).order('position', { ascending: true });
  const lista = (stages || []) as Array<{ id: string; name: string; position: number }>;
  const alvo = lista.find(s => /primeiro contato/i.test(s.name)) || lista[1] || lista[0];
  if (!alvo) return null;

  // O contato do novo lead. Insert direto (sem importar crmContactsService) pra
  // nao acoplar este service a ele. Cor de avatar so pro cadastro nao nascer
  // cinza; created_by pro trigger de dono resolver o responsavel.
  const session = await supabase.auth.getSession();
  const userId = session.data?.session?.user?.id;
  const cores = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#f97316', '#6366f1'];
  const { data: contato } = await supabase
    .from('crm_contacts')
    .insert({
      name: nome.trim(),
      phone: telefone || null,
      avatar_color: cores[Math.floor(Math.random() * cores.length)],
      created_by: userId,
    })
    .select('id')
    .single();

  const deal = await createCrmDeal({
    title: nome.trim(),
    pipelineId: origemRow.pipeline_id,
    stageId: alvo.id,
    contactId: (contato as { id?: string } | null)?.id || null,
    contactName: nome.trim(),
    contactPhone: telefone || null,
    ownerId: origemRow.owner_id || null,
    originDealId,
    probability: 10,
    status: 'open',
  });

  if (!deal?.id) return null;

  // O createCrmDeal cai num FALLBACK OFFLINE (id UUID local, indistinguivel de um
  // real) quando o insert falha — coluna origin_deal_id ausente, RLS, constraint.
  // Confiar no id truthy cancelaria a cadencia do PAI deixando o lead sem filho E
  // sem cadencia, com o modal reportando sucesso. Um SELECT do proprio id confirma
  // que a linha existe mesmo no banco.
  const { data: gravado } = await supabase
    .from('crm_deals').select('id').eq('id', deal.id).maybeSingle();
  if (!gravado) return deal; // nao persistiu: NAO mexe na cadencia do pai

  // A cadencia MUDA de lead: agenda a do FILHO (idempotente) e SO ENTAO para a do
  // pai — nesta ordem, e com await. So cancela o pai depois que o filho de fato
  // assumiu (>=1 toque criado); se o filho nao recebeu cadencia nenhuma, o pai
  // mantem a dele, melhor que deixar a cadeia inteira sem cadencia.
  //
  // Exclui a tarefa ATUAL (de onde a pessoa gerou o lead): ela foi EXECUTADA e o
  // modal a conclui — cancelar junto a mandaria pro limbo (concluida E apagada).
  let criadas = 0;
  try { criadas = await scheduleStepsForDeal(deal.id, alvo.id); } catch (e) { console.warn(e); }

  if (criadas > 0) {
    let cancelPai = supabase
      .from('crm_activities')
      .update({ deleted_at: new Date().toISOString() })
      .eq('deal_id', originDealId).eq('completed', false).is('deleted_at', null)
      .not('stage_step_id', 'is', null);
    if (excludeActivityId) cancelPai = cancelPai.neq('id', excludeActivityId);
    await cancelPai;
  }

  return deal;
}

export async function updateCrmDeal(id: string, updates: Record<string, unknown>): Promise<CrmDeal | null> {
  // closed_at e probability andam JUNTOS com o status em QUALQUER caminho que
  // edite status (form de detalhe, dropdown, etc). Sem isso, um deal marcado
  // won/lost pelo formulario fica sem closed_at e SOME dos relatorios que
  // filtram por closed_at — a divergencia classica entre arrastar e editar.
  const next = { ...updates };
  if (next.status === 'won' || next.status === 'lost') {
    if (next.closedAt === undefined) {
      // o formulario SEMPRE manda status e NUNCA manda closedAt, entao o
      // payload nao distingue "fechando agora" de "editando deal ja fechado".
      // Quem decide e o estado ATUAL: so carimba na transicao real (open ->
      // fechado) ou pra preencher fechado sem data. Reescrever aqui remarcaria
      // a venda de periodo nos relatorios a cada edicao.
      const { data: current } = await supabase
        .from('crm_deals')
        .select('status, closed_at')
        .eq('id', id)
        .single();
      const cur = current as { status?: DealStatus; closed_at?: string | null } | null;
      if (!cur?.closed_at || cur.status === 'open') {
        next.closedAt = new Date().toISOString();
      }
    }
    if (next.probability === undefined) next.probability = next.status === 'won' ? 100 : 0;
  } else if (next.status === 'open') {
    next.closedAt = null; // reabrir limpa o fechamento
  }
  const result = await dealService.update(id, next);
  // E-mail preenchido AGORA: reagenda os passos de e-mail da etapa que foram
  // pulados por falta de e-mail (agendarPassos ignora passo de e-mail sem e-mail).
  // scheduleStepsForDeal é idempotente — não duplica os toques já criados. Cobre o
  // caso "liguei, o lead passou o e-mail, salvei" — antes o follow-up por e-mail
  // nunca nascia na Agenda.
  const emailNovo = next.contactEmail as string | undefined;
  const stageId = (result as { stageId?: string } | null)?.stageId;
  if (result && emailNovo && String(emailNovo).trim() && stageId) {
    scheduleStepsForDeal(id, stageId).catch(console.warn);
  }
  return result;
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
  // O negocio saiu, mas a cadencia dele continuava caindo na Fila/Agenda do
  // vendedor ("tarefa pra um lead excluido"). Cancela os toques pendentes. O
  // trigger no banco (migration 144) faz o mesmo como rede de seguranca pra
  // outros caminhos de exclusao — aqui e explicito e retorna na hora.
  cancelPendingStepsForDeal(id).catch(console.warn);
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

  // Card que muda de coluna entra na nova SEM a fixação manual da antiga — senão
  // carrega a `position` da coluna anterior e aparece "Fixado" numa etapa onde
  // ninguém o fixou, sem reordenar pelo score.
  if ((current as { stage_id?: string } | null)?.stage_id !== stageId) {
    updatePayload.position = null;
    updatePayload.position_manual = false;
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
    // A cadencia da etapa que ficou pra tras sai da fila ANTES de agendar a
    // nova: o lead que avancou nao deve mais ser tocado pelo script da etapa
    // anterior. Sem isso a agenda acumula lixo que cresce sozinho todo dia.
    if (cur.stage_id) {
      cancelPendingStepsForDeal(dealId, cur.stage_id).catch(console.warn);
    }
    // Agenda as tarefas do processo da etapa nova (9-18h, sem almoco, sem
    // colidir). Idempotente. Nao pode derrubar o move: se falhar, o lead ja
    // mudou de etapa e a agenda pode ser gerada depois.
    scheduleStepsForDeal(dealId, stageId).catch(console.warn);
  }

  // Reativacao: arrastar pra etapa "Reativou" (win stage da Nurturing) clona o
  // lead pro Geral como Cliente ganho, mantendo o original aqui.
  if (result && (targetStage as { name?: string } | null)?.name === 'Reativou') {
    try {
      await cloneDealToGeralAsClient(dealId);
      (result as CrmDeal & { _reactivated?: boolean })._reactivated = true;
    } catch (e) {
      console.warn('Reativacao (clone pro Geral) falhou:', e);
    }
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
  // Lead fechado nao tem mais cadencia: TODAS as tarefas pendentes do processo
  // saem da fila (nao so as da etapa atual). Continuar ligando pra quem ja
  // comprou e o tipo de erro que queima cliente.
  cancelPendingStepsForDeal(dealId).catch(console.warn);
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
export async function markDealAsLost(dealId: string, reason = '', resgatavel: boolean | null = null): Promise<CrmDeal | null> {
  const { data: current } = await supabase
    .from('crm_deals')
    .select('pipeline_id, stage_id')
    .eq('id', dealId)
    .single();
  const cur = current as { pipeline_id?: string | null; stage_id?: string | null } | null;

  // Destino: pipeline Nurturing. A decisao "resgatavel?" (vinda do modal de
  // perda) roteia: SIM -> "Em Nutricao" (entra ATIVO na cadencia de nutricao);
  // NAO -> "Descarte" (fica perdido, parado, sem trabalho). Substituiu o modelo
  // antigo de cair na "Triagem" e so virar ativo ao arrastar pra frente.
  const { data: nurturing } = await supabase
    .from('crm_pipelines')
    .select('id, crm_pipeline_stages(id, name, position)')
    .eq('name', 'Nurturing')
    .maybeSingle();

  let nurturingId: string | null = null;
  let nutricaoStageId: string | null = null;
  let descarteStageId: string | null = null;
  if (nurturing) {
    const n = nurturing as { id: string; crm_pipeline_stages?: Array<{ id: string; name: string; position: number }> };
    const stages = (n.crm_pipeline_stages || []).slice().sort((a, b) => a.position - b.position);
    nurturingId = n.id;
    nutricaoStageId = (stages.find(s => /nutri/i.test(s.name)) || stages[0])?.id || null;
    descarteStageId = (stages.find(s => /descarte/i.test(s.name)) || stages[stages.length - 1])?.id || null;
  }

  const goToNutricao = resgatavel === true && !!nutricaoStageId;
  const targetStageId = goToNutricao ? nutricaoStageId : descarteStageId;

  const nowIso = new Date().toISOString();
  const updatePayload: Record<string, unknown> = { lost_reason: reason, updated_at: nowIso };
  let movedTo: 'nurturing' | 'descarte' | null = null;
  let targetPipelineId = cur?.pipeline_id ?? null;

  if (nurturingId && targetStageId && cur) {
    targetPipelineId = nurturingId;
    updatePayload.stage_id = targetStageId;
    if (nurturingId !== cur.pipeline_id) updatePayload.pipeline_id = nurturingId;

    if (goToNutricao) {
      // Resgatavel: ativo em Em Nutricao. Reabre (open) pra cadencia rodar.
      updatePayload.status = 'open';
      updatePayload.probability = 10;
      updatePayload.closed_at = null;
      movedTo = 'nurturing';
    } else {
      // Nao resgatavel: descartado de vez, perdido e parado.
      updatePayload.status = 'lost';
      updatePayload.probability = 0;
      updatePayload.closed_at = nowIso;
      movedTo = 'descarte';
    }
  } else {
    // Sem pipeline Nurturing: so marca perdido no lugar.
    updatePayload.status = 'lost';
    updatePayload.probability = 0;
    updatePayload.closed_at = nowIso;
  }

  const { data, error } = await supabase
    .from('crm_deals')
    .update(updatePayload)
    .eq('id', dealId)
    .select()
    .single();
  if (error) throw new Error(error.message);

  if (cur && targetStageId && targetStageId !== cur.stage_id) {
    await recordStageTransition(dealId, cur.stage_id || null, targetStageId, targetPipelineId || '');
  }

  // Cadencia: descartado sai da fila; resgatavel agenda a cadencia de Em Nutricao.
  cancelPendingStepsForDeal(dealId).catch(console.warn);
  if (goToNutricao && targetStageId) {
    scheduleStepsForDeal(dealId, targetStageId).catch(console.warn);
  }

  const result = dbToCrmDeal(data as CrmDealRow);
  if (result) result._movedTo = movedTo;
  return result;
}

/**
 * Reativacao: clona um lead da Nurturing pro pipeline "Geral" como CLIENTE
 * (ganho), MANTENDO o original na Nurturing. Copia fiel do lead (contato,
 * empresa, valor, dono, etc) — so troca pipeline/etapa/status. Disparado ao
 * arrastar o lead pra etapa "Reativado" (ver moveDealToStage).
 */
async function cloneDealToGeralAsClient(dealId: string): Promise<void> {
  const { data: orig } = await supabase.from('crm_deals').select('*').eq('id', dealId).single();
  if (!orig) return;

  const { data: geral } = await supabase
    .from('crm_pipelines')
    .select('id, crm_pipeline_stages(id, name, position, is_win_stage)')
    .eq('name', 'Geral')
    .maybeSingle();
  if (!geral) return;
  const g = geral as { id: string; crm_pipeline_stages?: Array<{ id: string; name: string; position: number; is_win_stage: boolean }> };
  const gStages = (g.crm_pipeline_stages || []).slice().sort((a, b) => a.position - b.position);
  const winStage = gStages.find(s => s.is_win_stage) || gStages[gStages.length - 1];
  if (!winStage) return;

  // Não duplica: re-arrastar pra "Reativou" (ou reentrar na etapa) criava vários
  // Clientes ganhos no Geral pro mesmo lead, inflando faturamento. Se já existe um
  // clone deste lead no Geral, não cria de novo.
  const { data: jaClonado } = await supabase
    .from('crm_deals')
    .select('id')
    .eq('origin_deal_id', dealId)
    .eq('pipeline_id', g.id)
    .is('deleted_at', null)
    .limit(1);
  if (jaClonado && jaClonado.length > 0) return;

  const nowIso = new Date().toISOString();
  const clone: Record<string, unknown> = { ...(orig as Record<string, unknown>) };
  delete clone.id;
  delete clone.created_at;
  delete clone.updated_at;
  delete clone.deleted_at;
  clone.pipeline_id = g.id;
  clone.stage_id = winStage.id;
  clone.status = 'won';
  clone.probability = 100;
  clone.closed_at = nowIso;
  clone.lost_reason = null;
  clone.churned_at = null;
  clone.origin_deal_id = dealId; // linka o Cliente do Geral ao lead da Nurturing que o gerou

  const { data: inserted, error } = await supabase.from('crm_deals').insert(clone).select('id').single();
  if (error) throw new Error(error.message);
  const newId = (inserted as { id?: string } | null)?.id;
  if (newId) await recordStageTransition(newId, null, winStage.id, g.id);
}

/**
 * Marca um cliente (deal ganho) como cancelado. O status continua 'won' —
 * churn e um estado a mais, nao desfaz o historico da venda.
 */
export async function markDealAsChurned(dealId: string): Promise<CrmDeal | null> {
  const { data, error } = await supabase
    .from('crm_deals')
    .update({ churned_at: new Date().toISOString() })
    .eq('id', dealId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return dbToCrmDeal(data as CrmDealRow);
}

/** Reativa um cliente cancelado (limpa churned_at). */
export async function reactivateChurnedDeal(dealId: string): Promise<CrmDeal | null> {
  const { data, error } = await supabase
    .from('crm_deals')
    .update({ churned_at: null })
    .eq('id', dealId)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return dbToCrmDeal(data as CrmDealRow);
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
  deliveryInput: string | null;
  deliveryReport: string | null;
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
    delivery_input: string | null; delivery_report: string | null;
    stage_step_id?: string | null;
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
    deliveryInput: row.delivery_input,
    deliveryReport: row.delivery_report,
    // Passo do playbook que gerou esta atividade (quando veio do processo).
    stageStepId: row.stage_step_id || null,
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

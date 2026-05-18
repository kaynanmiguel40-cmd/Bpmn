import { z } from 'zod';

// ==================== HELPERS ====================

const nullableStr = z.string().nullable().optional().default('');
const nullableNum = z.number().nullable().optional();

// ==================== COMPANY ====================

export const crmCompanySchema = z.object({
  name: z.string().min(1, 'Nome da empresa e obrigatorio'),
  cnpj: nullableStr,
  segment: nullableStr,
  size: nullableStr,
  revenue: nullableNum,
  phone: nullableStr,
  email: z.string().email('Email invalido').optional().or(z.literal('')).default(''),
  website: nullableStr,
  address: nullableStr,
  city: nullableStr,
  state: nullableStr,
  notes: z.string().optional().default(''),
}).passthrough();

// ==================== CONTACT ====================

export const crmContactSchema = z.object({
  name: z.string().min(1, 'Nome do contato e obrigatorio'),
  email: z.string().email('Email invalido').optional().or(z.literal('')).default(''),
  phone: nullableStr,
  position: nullableStr,
  avatarColor: nullableStr,
  status: z.enum(['lead', 'active', 'inactive', 'customer']).default('lead'),
  companyId: z.string().nullable().optional().default(null),
  tags: z.array(z.string()).default([]),
  address: nullableStr,
  city: nullableStr,
  state: nullableStr,
  notes: z.string().optional().default(''),
}).passthrough();

// ==================== PIPELINE ====================

export const crmPipelineSchema = z.object({
  name: z.string().min(1, 'Nome do pipeline e obrigatorio'),
  isDefault: z.boolean().optional().default(false),
}).passthrough();

export const crmPipelineStageSchema = z.object({
  pipelineId: z.string().min(1, 'Pipeline e obrigatorio'),
  name: z.string().min(1, 'Nome da etapa e obrigatorio'),
  position: z.number().min(0),
  color: z.string().optional().default('#6366f1'),
  isWinStage: z.boolean().optional().default(false),
  triggersMeeting: z.boolean().optional().default(false),
}).passthrough();

// ==================== DEAL ====================

export const crmDealSchema = z.object({
  title: z.string().min(1, 'Titulo do negocio e obrigatorio'),
  value: z.number().min(0).default(0),
  probability: z.number().min(0).max(100).default(50),
  segment: nullableStr,
  contactName: nullableStr,
  contactPhone: nullableStr,
  contactEmail: z.string().email('Email invalido').optional().or(z.literal('')).default(''),
  contactId: z.string().nullable().optional().default(null),
  companyName: nullableStr,
  companyId: z.string().nullable().optional().default(null),
  pipelineId: z.string().nullable().optional().default(null),
  stageId: z.string().nullable().optional().default(null),
  expectedCloseDate: z.string().nullable().optional().default(null),
  status: z.enum(['open', 'won', 'lost']).default('open'),
  lostReason: nullableStr,
  ownerId: z.string().nullable().optional().default(null),
}).passthrough();

// ==================== CALL ====================

export const crmCallSchema = z.object({
  contactId: z.string().nullable().optional().default(null),
  dealId: z.string().nullable().optional().default(null),
  companyId: z.string().nullable().optional().default(null),
  phoneDialed: z.string().min(1, 'Numero discado e obrigatorio'),
  direction: z.enum(['outbound', 'inbound']).default('outbound'),
  channel: z.enum(['device', 'voip']).default('device'),
  provider: nullableStr,
  providerCallId: nullableStr,
  startedAt: z.string().nullable().optional().default(null),
  endedAt: z.string().nullable().optional().default(null),
  durationSeconds: z.number().int().min(0).nullable().optional().default(null),
  outcome: z.enum([
    'answered', 'no_answer', 'voicemail', 'busy', 'wrong_number',
    'callback_scheduled', 'meeting_scheduled', 'not_interested', 'deal_advanced',
  ]).nullable().optional(),
  notes: z.string().optional().default(''),
  followUpAt: z.string().nullable().optional().default(null),
}).passthrough();

// ==================== ACTIVITY ====================

export const crmActivitySchema = z.object({
  title: z.string().min(1, 'Titulo da atividade e obrigatorio'),
  description: z.string().optional().default(''),
  type: z.enum(['call', 'email', 'meeting', 'task', 'lunch', 'visit']).default('task'),
  contactId: z.string().nullable().optional().default(null),
  dealId: z.string().nullable().optional().default(null),
  startDate: z.string().min(1, 'Data de inicio e obrigatoria'),
  endDate: z.string().nullable().optional().default(null),
  completed: z.boolean().optional().default(false),
}).passthrough();

// ==================== GOAL ====================

export const crmGoalSchema = z.object({
  title: z.string().min(1, 'Titulo da meta e obrigatorio'),
  description: z.string().optional().default(''),
  type: z.enum(['individual', 'global']).default('individual'),
  ownerId: z.string().nullable().optional().default(null),
  targetValue: z.number().min(0, 'Valor alvo deve ser positivo').default(0),
  currentValue: z.number().min(0).default(0),
  periodStart: z.string().min(1, 'Data de inicio e obrigatoria'),
  periodEnd: z.string().min(1, 'Data de fim e obrigatoria'),
  status: z.enum(['active', 'completed', 'cancelled']).default('active'),
}).passthrough();

// ==================== PAID TRAFFIC ====================

export const crmTrafficSchema = z.object({
  channel: z.string().min(1, 'Canal e obrigatorio'),
  pipelineId: z.string().nullable().optional().default(null),
  periodStart: z.string().min(1, 'Data inicio e obrigatoria'),
  periodEnd: z.string().min(1, 'Data fim e obrigatoria'),
  amountSpent: z.number().min(0, 'Valor gasto deve ser positivo').default(0),
  impressions: z.number().min(0).default(0),
  clicks: z.number().min(0).default(0),
  leadsGenerated: z.number().min(0).default(0),
  conversions: z.number().min(0).default(0),
  revenueGenerated: z.number().min(0).default(0),
  notes: z.string().optional().default(''),
}).passthrough();

// ==================== PROSPECT ====================

export const crmProspectSchema = z.object({
  companyName: z.string().min(1, 'Nome da empresa e obrigatorio'),
  contactName: nullableStr,
  phone: nullableStr,
  email: z.string().email('Email invalido').optional().or(z.literal('')).default(''),
  cnpj: nullableStr,
  segment: nullableStr,
  size: nullableStr,
  city: nullableStr,
  state: nullableStr,
  position: nullableStr,
  source: nullableStr,
  website: nullableStr,
  revenue: nullableNum,
  employees: z.number().nullable().optional(),
  notes: z.string().optional().default(''),
  status: z.enum(['new', 'contacted', 'qualified', 'converted', 'discarded']).default('new'),
  prospectType: z.enum(['lead', 'partner']).optional().default('lead'),
  partnerCategory: z.enum(['contabilidade', 'financeira', 'advocacia', 'associacao']).nullable().optional().default(null),
  assignedTo: z.string().nullable().optional().default(null),
  listName: nullableStr,
}).passthrough();

// ==================== SETTINGS ====================

export const crmSettingsSchema = z.object({
  companyName: nullableStr,
  companyPhone: nullableStr,
  companyEmail: z.string().email('Email invalido').optional().or(z.literal('')).default(''),
  companyAddress: nullableStr,
  companyCity: nullableStr,
  companyState: nullableStr,
  companyLogoUrl: nullableStr,
  accentColor: z.string().optional().default('#6366f1'),
}).passthrough();

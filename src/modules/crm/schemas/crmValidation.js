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
  contactId: z.string().nullable().optional().default(null),
  companyId: z.string().nullable().optional().default(null),
  pipelineId: z.string().nullable().optional().default(null),
  stageId: z.string().nullable().optional().default(null),
  expectedCloseDate: z.string().nullable().optional().default(null),
  status: z.enum(['open', 'won', 'lost']).default('open'),
  lostReason: nullableStr,
  ownerId: z.string().nullable().optional().default(null),
}).passthrough();

// ==================== ACTIVITY ====================

export const crmActivitySchema = z.object({
  title: z.string().min(1, 'Titulo da atividade e obrigatorio'),
  description: z.string().optional().default(''),
  type: z.enum(['call', 'email', 'meeting', 'task', 'lunch', 'visit']),
  contactId: z.string().nullable().optional().default(null),
  dealId: z.string().nullable().optional().default(null),
  startDate: z.string().min(1, 'Data de inicio e obrigatoria'),
  endDate: z.string().nullable().optional().default(null),
  completed: z.boolean().optional().default(false),
}).passthrough();

// ==================== PROPOSAL ====================

export const crmProposalSchema = z.object({
  dealId: z.string().min(1, 'Negocio e obrigatorio'),
  status: z.enum(['draft', 'sent', 'viewed', 'accepted', 'rejected']).default('draft'),
  notes: z.string().optional().default(''),
  terms: z.string().optional().default(''),
  totalValue: z.number().min(0).default(0),
}).passthrough();

export const crmProposalItemSchema = z.object({
  proposalId: z.string().min(1, 'Proposta e obrigatoria'),
  name: z.string().min(1, 'Nome do item e obrigatorio'),
  description: z.string().optional().default(''),
  quantity: z.number().min(0).default(1),
  unitPrice: z.number().min(0).default(0),
  discountPercent: z.number().min(0).max(100).default(0),
  subtotal: z.number().min(0).default(0),
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

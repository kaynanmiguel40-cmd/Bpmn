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

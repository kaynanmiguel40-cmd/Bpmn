import { z } from 'zod';
import DOMPurify from 'dompurify';

// ==================== SANITIZACAO ====================

// DOMPurify 3.x precisa de window - inicializar corretamente
let purify;
try {
  purify = typeof window !== 'undefined' && window.document
    ? DOMPurify
    : (DOMPurify.sanitize ? DOMPurify : null);
} catch {
  purify = null;
}

/**
 * Sanitiza texto para prevenir XSS.
 */
export function sanitize(text) {
  if (typeof text !== 'string') return text;
  if (purify && typeof purify.sanitize === 'function') {
    return purify.sanitize(text, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
  }
  // Fallback: remover script/style com conteudo, depois demais tags
  return text
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, '');
}

/**
 * Sanitiza todos os campos string de um objeto.
 */
function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      result[key] = sanitize(value);
    } else if (Array.isArray(value)) {
      result[key] = value.map(item =>
        typeof item === 'string' ? sanitize(item) :
        typeof item === 'object' && item !== null ? sanitizeObject(item) : item
      );
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ==================== SCHEMAS ====================

const priorityEnum = z.enum(['low', 'medium', 'high', 'urgent']).default('medium');
const osStatusEnum = z.enum(['available', 'in_progress', 'done', 'blocked']).default('available');
const osTypeEnum = z.enum(['normal', 'emergency']).default('normal');
const osCategoryEnum = z.enum(['bug', 'feature', 'support', 'compliance', 'campaign', 'internal']).default('internal');
const blockReasonEnum = z.enum(['material', 'approval', 'resource', 'dependency', 'other']).nullable().optional();

const expenseItem = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().default(''),
  quantity: z.number().min(0).default(1),
  unitPrice: z.number().min(0).default(0),
  unit_price: z.number().min(0).optional(),
}).passthrough();

const checklistItem = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  text: z.string().default(''),
  done: z.boolean().default(false),
}).passthrough();

// Helper: string que aceita null (para campos que vem como null do form/DB)
const nullableStr = z.string().nullable().optional().default('');

export const osOrderSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio'),
  description: z.string().optional().default(''),
  priority: priorityEnum,
  status: osStatusEnum,
  type: osTypeEnum,
  category: osCategoryEnum,
  blockReason: blockReasonEnum,
  client: nullableStr,
  clientId: nullableStr,
  location: nullableStr,
  notes: z.string().optional().default(''),
  assignee: nullableStr,
  assignedTo: nullableStr,
  estimatedStart: nullableStr,
  estimatedEnd: nullableStr,
  actualStart: nullableStr,
  actualEnd: nullableStr,
  slaDeadline: nullableStr,
  leadTimeHours: z.number().nullable().optional(),
  expenses: z.array(expenseItem).default([]),
  checklist: z.array(checklistItem).default([]),
  attachments: z.array(z.any()).default([]),
  projectId: nullableStr,
  parentOrderId: nullableStr,
  sortOrder: z.number().optional().default(0),
  emergencyNumber: z.number().nullable().optional(),
}).passthrough();

export const teamMemberSchema = z.object({
  name: z.string().min(1, 'Nome e obrigatorio'),
  role: z.string().optional().default(''),
  color: z.string().optional().default('#3b82f6'),
  email: z.string().email('Email invalido').optional().or(z.literal('')).default(''),
  workStart: z.string().optional().default('08:00'),
  workEnd: z.string().optional().default('18:00'),
  workDays: z.array(z.number()).optional().default([1,2,3,4,5]),
  salaryMonth: z.number().min(0, 'Salario nao pode ser negativo').default(0),
  hoursMonth: z.number().min(1).default(176),
}).passthrough();

export const agendaEventSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio'),
  description: z.string().optional().default(''),
  startDate: z.string().min(1, 'Data de inicio e obrigatoria'),
  endDate: z.string().optional().default(''),
  assignee: z.string().optional().default(''),
  type: z.enum(['meeting', 'task', 'reminder', 'deadline', 'other']).default('task'),
  color: z.string().optional().default('#3b82f6'),
  attendees: z.array(z.any()).default([]),
}).passthrough();

export const commentSchema = z.object({
  content: z.string().min(1, 'Comentario nao pode estar vazio'),
  orderId: z.string().min(1),
  userName: z.string().optional().default('Anonimo'),
}).passthrough();

export const sectorSchema = z.object({
  label: z.string().min(1, 'Nome do setor e obrigatorio'),
  color: z.string().optional().default('#3b82f6'),
}).passthrough();

export const osProjectSchema = z.object({
  name: z.string().min(1, 'Nome do projeto e obrigatorio'),
  sectorId: z.string().optional().default(''),
  color: z.string().optional().default('#3b82f6'),
  description: z.string().optional().default(''),
}).passthrough();

export const clientSchema = z.object({
  name: z.string().min(1, 'Nome do cliente e obrigatorio'),
  email: z.string().email('Email invalido').optional().or(z.literal('')).default(''),
  phone: z.string().optional().default(''),
  company: z.string().optional().default(''),
  notes: z.string().optional().default(''),
}).passthrough();

// ==================== VALIDACAO + SANITIZACAO ====================

/**
 * Valida dados contra um schema Zod e sanitiza strings.
 * Retorna { success, data, error }.
 */
export function validateAndSanitize(schema, data) {
  try {
    // Sanitizar strings primeiro
    const sanitized = sanitizeObject(data);
    // Validar contra schema
    const parsed = schema.parse(sanitized);
    return { success: true, data: parsed, error: null };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const messages = (err.issues || err.errors || []).map(e => e.message).join(', ');
      return { success: false, data: null, error: messages };
    }
    return { success: false, data: null, error: err.message };
  }
}

/**
 * Valida parcialmente (para updates que nao tem todos os campos).
 * So retorna os campos que estavam no input original — evita que
 * .default() do Zod injete valores e sobrescreva dados existentes.
 */
export function validatePartial(schema, data) {
  try {
    const sanitized = sanitizeObject(data);
    const inputKeys = new Set(Object.keys(sanitized));
    const partialSchema = schema.partial();
    const parsed = partialSchema.parse(sanitized);
    // Filtrar: so manter campos que estavam no input original
    const filtered = {};
    for (const key of Object.keys(parsed)) {
      if (inputKeys.has(key)) {
        filtered[key] = parsed[key];
      }
    }
    return { success: true, data: filtered, error: null };
  } catch (err) {
    if (err instanceof z.ZodError) {
      const messages = (err.issues || err.errors || []).map(e => e.message).join(', ');
      return { success: false, data: null, error: messages };
    }
    return { success: false, data: null, error: err.message };
  }
}

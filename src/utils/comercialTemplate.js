/**
 * Template BPMN - INSIDE SALES FYNESS
 * Baseado na metodologia Vivendo de SaaS (ZipLine/eGestor)
 *
 * POOLS:
 * 1. SDR ROBÔ — Qualificação Automática (WhatsApp + CRM)
 * 2. SDR HUMANO — Conexão e Agendamento (Cadência Transacional)
 * 3. VENDEDOR (CLOSER) — Venda Consultiva (SPIN + Demo)
 * 4. NURTURING & EDUCAÇÃO — Moeda de Negociação
 */

// Importar template Inside Sales (Vivendo de SaaS)
import { COMERCIAL_INSIDE_SALES_XML } from './comercialInsideSalesTemplate';

// Exportar como COMERCIAL_DIAGRAM_XML (substitui o V9 antigo)
export const COMERCIAL_DIAGRAM_XML = COMERCIAL_INSIDE_SALES_XML;

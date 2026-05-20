/**
 * crmWhatsAppInstanceService - Instâncias Evolution API (crm_whatsapp_instances).
 *
 * Cada instância representa uma conexão WhatsApp ativa via Evolution.
 * Estado (status, QR, phone) é atualizado pelo webhook (evolution-webhook).
 * Frontend lê via Realtime; não escreve diretamente nos campos de
 * status/qr (a Evolution é a fonte da verdade).
 *
 * Acoes locais permitidas:
 *   - listar/ler instâncias
 *   - criar instância (registra no banco; criacao na Evolution é
 *     manual via /manager OU via funcao admin futura)
 *   - alocar a um team_member
 */

import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';

const DEFAULT_INSTANCE = import.meta.env.VITE_EVOLUTION_INSTANCE_DEFAULT || 'fyness-principal';

// ==================== TRANSFORMADOR ====================

export function dbToCrmWhatsAppInstance(row) {
  if (!row) return null;
  return {
    id:            row.id,
    instanceName:  row.instance_name,
    teamMemberId:  row.team_member_id || null,
    phoneNumber:   row.phone_number || null,
    status:        row.status,
    qrCode:        row.qr_code || null,
    qrExpiresAt:   row.qr_expires_at || null,
    lastSeenAt:    row.last_seen_at || null,
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
  };
}

// ==================== LEITURA ====================

export async function listCrmWhatsAppInstances() {
  const { data, error } = await supabase
    .from('crm_whatsapp_instances')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: true });
  if (error) {
    toast(`Erro ao listar instâncias: ${error.message}`, 'error');
    return [];
  }
  return (data || []).map(dbToCrmWhatsAppInstance);
}

export async function getCrmWhatsAppInstanceByName(instanceName = DEFAULT_INSTANCE) {
  const { data, error } = await supabase
    .from('crm_whatsapp_instances')
    .select('*')
    .eq('instance_name', instanceName)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) {
    toast(`Erro ao buscar instância: ${error.message}`, 'error');
    return null;
  }
  return dbToCrmWhatsAppInstance(data);
}

export async function getDefaultCrmWhatsAppInstance() {
  return getCrmWhatsAppInstanceByName(DEFAULT_INSTANCE);
}

// ==================== ESCRITA ====================

/**
 * Cria registro local da instância. Apenas registra; a instância
 * real na Evolution deve ser criada via /manager (UI da Evolution) OU
 * via Edge Function admin (a ser feita em fase futura).
 */
export async function createCrmWhatsAppInstance({ instanceName, teamMemberId = null }) {
  if (!instanceName) {
    toast('Nome da instância obrigatório', 'error');
    return { ok: false, error: 'instanceName obrigatório' };
  }
  const { data, error } = await supabase
    .from('crm_whatsapp_instances')
    .insert({
      instance_name:   instanceName,
      team_member_id:  teamMemberId,
      status:          'disconnected',
    })
    .select('*')
    .single();
  if (error) {
    toast(`Erro ao criar instância: ${error.message}`, 'error');
    return { ok: false, error: error.message };
  }
  toast('Instância registrada', 'success');
  return { ok: true, instance: dbToCrmWhatsAppInstance(data) };
}

export async function assignCrmWhatsAppInstance(instanceId, teamMemberId) {
  const { error } = await supabase
    .from('crm_whatsapp_instances')
    .update({ team_member_id: teamMemberId })
    .eq('id', instanceId);
  if (error) {
    toast(`Erro ao alocar: ${error.message}`, 'error');
    return { ok: false };
  }
  return { ok: true };
}

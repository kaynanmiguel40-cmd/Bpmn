/**
 * communicationService - Integracao com WhatsApp e Email
 *
 * WhatsApp: Gera links wa.me para envio direto
 * Email: Usa Supabase Edge Function (ou mailto como fallback)
 */

import { supabase } from './supabase';

// ==================== PREFERENCIAS ====================

const PREFS_KEY = 'notification_prefs';

const DEFAULT_PREFS = {
  os_assigned: { inApp: true, email: false, whatsapp: false },
  os_completed: { inApp: true, email: false, whatsapp: false },
  os_overdue: { inApp: true, email: true, whatsapp: false },
  deadline_warning: { inApp: true, email: false, whatsapp: false },
  comment_added: { inApp: true, email: false, whatsapp: false },
  event_reminder: { inApp: true, email: true, whatsapp: false },
};

export function getNotificationPrefs() {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFS_KEY) || '{}');
    return { ...DEFAULT_PREFS, ...saved };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveNotificationPrefs(prefs) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  // Tentar salvar no Supabase (notification_prefs no perfil)
  const profile = JSON.parse(localStorage.getItem('settings_profile') || '{}');
  if (profile.id) {
    supabase
      .from('user_profiles')
      .update({ notification_prefs: prefs })
      .eq('id', profile.id)
      .then(() => {});
  }
}

// ==================== WHATSAPP ====================

/**
 * Gera link wa.me para envio de mensagem.
 * @param {string} phone - Numero com DDI (ex: "5511999999999")
 * @param {string} message - Texto da mensagem
 */
export function getWhatsAppLink(phone, message) {
  const cleanPhone = (phone || '').replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

/**
 * Abre WhatsApp com mensagem pre-formatada.
 */
export function sendWhatsApp(phone, message) {
  const link = getWhatsAppLink(phone, message);
  window.open(link, '_blank');
}

/**
 * Gera mensagem padrao para notificacao via WhatsApp.
 */
export function formatWhatsAppMessage(type, data) {
  const templates = {
    os_assigned: (d) => `*Fyness OS* - Nova O.S. atribuida\n\n#${d.number} - ${d.title}\nCliente: ${d.client || 'N/A'}\nPrazo: ${d.estimatedEnd ? new Date(d.estimatedEnd).toLocaleDateString('pt-BR') : 'N/A'}`,
    os_completed: (d) => `*Fyness OS* - O.S. Concluida\n\n#${d.number} - ${d.title}\nConcluida em: ${new Date().toLocaleDateString('pt-BR')}`,
    os_overdue: (d) => `*Fyness OS* - O.S. Atrasada\n\n#${d.number} - ${d.title}\nPrazo era: ${d.estimatedEnd ? new Date(d.estimatedEnd).toLocaleDateString('pt-BR') : 'N/A'}`,
    event_reminder: (d) => `*Fyness OS* - Lembrete de Evento\n\n${d.title}\nData: ${d.startDate ? new Date(d.startDate).toLocaleDateString('pt-BR') : 'N/A'}`,
  };

  const formatter = templates[type];
  return formatter ? formatter(data) : `*Fyness OS* - ${type}`;
}

// ==================== EMAIL ====================

/**
 * Envia email via Supabase Edge Function.
 * Fallback: abre mailto: link.
 */
export async function sendEmail({ to, subject, body, html }) {
  // Tentar enviar via Edge Function
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, body, html },
    });

    if (!error && data?.success) return { success: true };
  } catch {}

  // Fallback: mailto
  const mailtoLink = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(mailtoLink);
  return { success: true, fallback: true };
}

/**
 * Gera conteudo de email padrao para notificacao.
 */
export function formatEmailContent(type, data) {
  const templates = {
    os_assigned: (d) => ({
      subject: `[Fyness OS] Nova O.S. atribuida: #${d.number} - ${d.title}`,
      body: `Voce recebeu uma nova O.S.:\n\n#${d.number} - ${d.title}\nCliente: ${d.client || 'N/A'}\nPrazo: ${d.estimatedEnd ? new Date(d.estimatedEnd).toLocaleDateString('pt-BR') : 'N/A'}\n\nAcesse o sistema para mais detalhes.`,
    }),
    os_completed: (d) => ({
      subject: `[Fyness OS] O.S. Concluida: #${d.number} - ${d.title}`,
      body: `A O.S. #${d.number} - ${d.title} foi concluida.\n\nData de conclusao: ${new Date().toLocaleDateString('pt-BR')}`,
    }),
    os_overdue: (d) => ({
      subject: `[Fyness OS] O.S. Atrasada: #${d.number} - ${d.title}`,
      body: `Atencao! A O.S. #${d.number} - ${d.title} esta atrasada.\n\nPrazo original: ${d.estimatedEnd ? new Date(d.estimatedEnd).toLocaleDateString('pt-BR') : 'N/A'}`,
    }),
    event_reminder: (d) => ({
      subject: `[Fyness OS] Lembrete: ${d.title}`,
      body: `Lembrete de evento: ${d.title}\n\nData: ${d.startDate ? new Date(d.startDate).toLocaleDateString('pt-BR') : 'N/A'}`,
    }),
  };

  const formatter = templates[type];
  return formatter ? formatter(data) : { subject: `[Fyness OS] ${type}`, body: '' };
}

// ==================== DISPATCH ====================

/**
 * Dispara notificacao por todos os canais habilitados.
 */
export async function dispatchNotification(type, data, recipientPhone, recipientEmail) {
  const prefs = getNotificationPrefs();
  const pref = prefs[type] || { inApp: true, email: false, whatsapp: false };

  if (pref.whatsapp && recipientPhone) {
    const msg = formatWhatsAppMessage(type, data);
    sendWhatsApp(recipientPhone, msg);
  }

  if (pref.email && recipientEmail) {
    const content = formatEmailContent(type, data);
    await sendEmail({ to: recipientEmail, ...content });
  }
}

// Labels para tipos de notificacao
export const NOTIFICATION_TYPE_LABELS = {
  os_assigned: 'O.S. atribuida a mim',
  os_completed: 'O.S. concluida',
  os_overdue: 'O.S. atrasada',
  deadline_warning: 'Alerta de prazo',
  comment_added: 'Novo comentario',
  event_reminder: 'Lembrete de evento',
};

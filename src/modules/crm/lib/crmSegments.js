/**
 * crmSegments.js — lista de segmentos de mercado compartilhada entre a aba
 * Segmentos (CrmSettingsPage) e o filtro de segmento das automações
 * (AutomationFormModal). Fonte única: localStorage['crm-segments'] — sem isso,
 * cada tela tinha sua própria lista e um segmento criado em Configurações
 * nunca aparecia no filtro da automação (e variava por navegador/dispositivo).
 */

export const CRM_SEGMENTS_STORAGE_KEY = 'crm-segments';

export const DEFAULT_SEGMENTS = [
  'Agro', 'Varejo', 'Industria', 'Tecnologia', 'Educacao',
  'Saude', 'Financeiro', 'Construcao', 'Servicos',
];

export function loadSegments() {
  try {
    const s = localStorage.getItem(CRM_SEGMENTS_STORAGE_KEY);
    return s ? JSON.parse(s) : DEFAULT_SEGMENTS;
  } catch {
    return DEFAULT_SEGMENTS;
  }
}

export function saveSegments(list) {
  try { localStorage.setItem(CRM_SEGMENTS_STORAGE_KEY, JSON.stringify(list)); } catch {}
}

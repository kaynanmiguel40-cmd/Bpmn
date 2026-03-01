/**
 * Funcoes de formatacao centralizadas.
 *
 * Consolida formatacao de moeda, data e tempo relativo
 * que antes estavam duplicadas em 6+ arquivos.
 */

import { MS_PER_MINUTE, MS_PER_HOUR, MS_PER_DAY } from '../constants/sla';
import { MESES_PT } from '../constants/localization';

// ─── Moeda ──────────────────────────────────────────────────────

/** Formata valor em BRL (R$ 1.234,56) */
export function formatCurrency(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return 'R$ 0,00';
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/** Formata valor em BRL sem centavos (R$ 1.235) — para valores grandes */
export function formatCurrencyShort(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

/** Formata numero com separadores pt-BR */
export function formatNumber(value) {
  return new Intl.NumberFormat('pt-BR').format(value || 0);
}

// ─── Data ───────────────────────────────────────────────────────

/** DD/MM/YYYY HH:MM */
export function formatDateTime(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/** DD de MMM de YYYY (ex: 01 de mar. de 2026) */
export function formatDateShortMonth(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/** DD/MM/YYYY — inclui hora so se houver 'T' na string */
export function formatDateSmart(dateStr) {
  if (!dateStr) return '-';
  const hasTime = dateStr.includes('T') && dateStr.length > 10;
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T12:00:00' : ''));
  const opts = { day: '2-digit', month: '2-digit', year: 'numeric' };
  if (hasTime) { opts.hour = '2-digit'; opts.minute = '2-digit'; }
  return d.toLocaleDateString('pt-BR', opts);
}

// ─── Tempo Relativo ─────────────────────────────────────────────

/** "agora", "ha 5min", "ha 3h", "ontem", "ha 4 dias", ou DD/MMM */
export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / MS_PER_MINUTE);
  if (mins < 1) return 'agora';
  if (mins < 60) return `ha ${mins}min`;
  const hrs = Math.floor(diff / MS_PER_HOUR);
  if (hrs < 24) return `ha ${hrs}h`;
  const days = Math.floor(diff / MS_PER_DAY);
  if (days === 1) return 'ontem';
  if (days < 7) return `ha ${days} dias`;
  return new Date(dateStr).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

/** Tempo relativo curto para chat: "Agora", "5m", "3h", ou "DD/MM HH:MM" */
export function formatChatTime(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / MS_PER_MINUTE);
  const diffHours = Math.floor(diffMs / MS_PER_HOUR);

  if (diffMin < 1) return 'Agora';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Duracao ────────────────────────────────────────────────────

/** Formata minutos em "Xh Ymin" (ex: 90 -> "1h 30min") */
export function formatLateTime(totalMinutes) {
  if (totalMinutes <= 0) return '0min';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

/** Formata segundos em "M:SS" (ex: 125 -> "2:05") — para audio */
export function formatAudioTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ─── CPF ────────────────────────────────────────────────────────

/** Formata CPF: 000.000.000-00 */
export function formatCpf(value) {
  const d = (value || '').replace(/\D/g, '');
  if (d.length !== 11) return value || '';
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

// ─── Data Extenso (Assinaturas) ──────────────────────────────────

/** Formata data para assinatura: "X horas e Y minutos do dia D do mes de M do ano de A" */
export function formatSignatureDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const h = d.getHours();
  const m = d.getMinutes();
  const dia = d.getDate();
  const mes = MESES_PT[d.getMonth()];
  const ano = d.getFullYear();
  return `${h} horas e ${m} minutos do dia ${dia} do mes de ${mes} do ano de ${ano}`;
}

/** Converte Date para string YYYY-MM-DD (formato input[type=date]) */
export function toInputDate(date) {
  return date.toISOString().split('T')[0];
}

/** Data extenso: "segunda-feira, 1 de marco" (para saudacoes/headers) */
export function formatDateLong(date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

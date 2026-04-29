/**
 * dateRelative.js
 * Helpers de formatação de datas relativas (tempo de mercado, etc.)
 */

/**
 * Tempo decorrido desde uma data passada, formatado em PT-BR.
 *
 *  ≥ 2 anos      → "12 anos"
 *  1 ano + meses → "1 ano e 5 meses"
 *  1-11 meses    → "8 meses"
 *  < 1 mês       → "14 dias"
 *  hoje/futuro   → "recente"
 */
export function tempoDesdeAbertura(dataAbertura) {
  if (!dataAbertura) return null;
  const d = new Date(dataAbertura);
  if (isNaN(d.getTime())) return null;

  // Usa UTC pra calculo timezone-agnostic (datas ISO YYYY-MM-DD vem como UTC
  // e nao queremos shift de fuso horaria em getMonth/getDate)
  const now = new Date();
  let years  = now.getUTCFullYear() - d.getUTCFullYear();
  let months = now.getUTCMonth()    - d.getUTCMonth();
  if (now.getUTCDate() < d.getUTCDate()) months--;
  if (months < 0) { years--; months += 12; }

  if (years === 1) {
    return months > 0 ? `1 ano e ${months} ${months === 1 ? 'mês' : 'meses'}` : '1 ano';
  }
  if (years >= 2) return `${years} anos`;
  if (months >= 1) return `${months} ${months === 1 ? 'mês' : 'meses'}`;

  const dayDiff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (dayDiff > 0) return `${dayDiff} ${dayDiff === 1 ? 'dia' : 'dias'}`;
  return 'recente';
}

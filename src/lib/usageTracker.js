/**
 * usageTracker.js
 * Conta chamadas API + custo em R$ no mes corrente, persistido em localStorage.
 * Reseta automaticamente ao virar o mes (chave inclui YYYY-MM).
 */

// Pricing em R$ (ajusta aqui se cambio mudar muito ou plano CD mudar)
//
// Google Places API (New) — pricing por SKU com cota mensal free PROPRIA pra
// cada tier. Pra Text Search Pro Tier (que e o que a gente usa, com fieldmask
// incluindo nationalPhoneNumber + websiteUri), a cota free typical eh
// ~5000 chamadas/mes. Apos isso, bill em ~$32 USD por mil chamadas.
//
// IMPORTANTE: o credito unificado de $200/mes do Maps Platform foi
// DESCONTINUADO em mar/2025 — agora eh so a cota free por API.
//
// Fonte real do bill: Google Cloud Console > Billing.
export const PRICE_GOOGLE_CALL_BRL    = 0.16;   // ~$0.032 × R$5/USD apos cota free
export const GOOGLE_FREE_CALLS_MONTH  = 5000;   // cota free mensal Text Search Pro
export const PRICE_CD_LOOKUP_BRL      = 0.006;  // R$30 / 5000 creditos
export const CD_DEFAULT_BALANCE       = 5000;   // creditos no plano padrao

const BALANCE_KEY = 'usage_cd_balance';
const BALANCE_RESET_AT_KEY = 'usage_cd_balance_reset_at';

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function googleKey()       { return `usage_google_${currentMonthKey()}`; }
function cdKey()           { return `usage_cd_${currentMonthKey()}`; }
function cdLookupKey()     { return `usage_cd_lookup_${currentMonthKey()}`; }
function cdSearchKey()     { return `usage_cd_search_${currentMonthKey()}`; }

function readInt(k) {
  return parseInt(localStorage.getItem(k) || '0', 10) || 0;
}

function bump(key, n = 1) {
  try {
    localStorage.setItem(key, String(readInt(key) + n));
    window.dispatchEvent(new Event('usage-tracker-update'));
  } catch {
    // localStorage cheio — silencioso
  }
}

// ─── API publica de tracking ─────────────────────────────────────────────────

export function trackGoogleCall(n = 1) {
  bump(googleKey(), n);
}

/** Busca CD por filtros (search) — uma chamada retorna varios CNPJs */
export function trackCdSearch(n = 1) {
  bump(cdSearchKey(), n);
  bump(cdKey(), n); // total
}

/** Lookup CD por nome+UF (lookup individual no enrichment Google-first) */
export function trackCdLookup(n = 1) {
  bump(cdLookupKey(), n);
  bump(cdKey(), n); // total
}

// ─── Read API ────────────────────────────────────────────────────────────────

export function getUsage() {
  const googleCalls    = readInt(googleKey());
  const cdTotal        = readInt(cdKey());
  const cdSearches     = readInt(cdSearchKey());
  const cdLookups      = readInt(cdLookupKey());

  const cdBalance = parseInt(localStorage.getItem(BALANCE_KEY) || String(CD_DEFAULT_BALANCE), 10);

  // Google: primeiras N chamadas/mes saem da cota free (R$0). Depois disso bill.
  const googleBilledCalls = Math.max(0, googleCalls - GOOGLE_FREE_CALLS_MONTH);
  const googleCost = googleBilledCalls * PRICE_GOOGLE_CALL_BRL;
  const googleFreeRemaining = Math.max(0, GOOGLE_FREE_CALLS_MONTH - googleCalls);

  const cdCost = cdTotal * PRICE_CD_LOOKUP_BRL;

  return {
    month: currentMonthKey(),
    google: {
      calls:              googleCalls,
      freeQuota:          GOOGLE_FREE_CALLS_MONTH,
      freeRemainingCalls: googleFreeRemaining,
      billedCalls:        googleBilledCalls,
      costBrl:            googleCost,
      pctUsed:            Math.min(100, (googleCalls / GOOGLE_FREE_CALLS_MONTH) * 100),
    },
    cd: {
      total:           cdTotal,
      searches:        cdSearches,
      lookups:         cdLookups,
      costBrl:         cdCost,
      balanceTotal:    cdBalance,
      balanceRemaining: Math.max(0, cdBalance - cdTotal),
      pctUsed:         Math.min(100, (cdTotal / cdBalance) * 100),
    },
  };
}

/** Permite o usuario ajustar saldo (compra novos creditos, mes virou, etc.) */
export function setCdBalance(value) {
  const n = Math.max(0, parseInt(value, 10) || 0);
  localStorage.setItem(BALANCE_KEY, String(n));
  localStorage.setItem(BALANCE_RESET_AT_KEY, new Date().toISOString());
  // Reseta contador no mes corrente pra refletir saldo "fresh"
  localStorage.setItem(cdKey(), '0');
  localStorage.setItem(cdLookupKey(), '0');
  localStorage.setItem(cdSearchKey(), '0');
  window.dispatchEvent(new Event('usage-tracker-update'));
}

export function resetCurrentMonthUsage() {
  localStorage.setItem(googleKey(), '0');
  localStorage.setItem(cdKey(), '0');
  localStorage.setItem(cdLookupKey(), '0');
  localStorage.setItem(cdSearchKey(), '0');
  window.dispatchEvent(new Event('usage-tracker-update'));
}

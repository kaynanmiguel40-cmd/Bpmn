/**
 * BonificacaoSection - Gamificacao Ouro/Prata/Bronze do dashboard.
 *
 * Substitui o antigo ranking simples. Cada vendedor:
 *   - Avatar + nome + medalha conquistada (badge colorido)
 *   - Barra de progresso ate a proxima medalha (gradiente da cor da tier alvo)
 *   - Valor realizado / meta
 *
 * Tiers vem do service (BONIFICACAO_TIERS): Bronze 30%, Prata 60%, Ouro 100%.
 * Quem nao tem meta ativa entra cinza com label "Sem meta".
 */

import { Trophy, Medal, Award, Target } from 'lucide-react';
import { CrmAvatar } from './ui';

const formatCurrency = (val) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val || 0);

const TIER_ICONS = {
  ouro:   Trophy,
  prata:  Medal,
  bronze: Award,
};

const TIER_BAR_GRADIENT = {
  ouro:   'from-yellow-400 to-amber-500',
  prata:  'from-slate-300 to-slate-500',
  bronze: 'from-amber-600 to-orange-700',
};

function TierBadge({ tier }) {
  if (!tier) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
        <Target size={10} /> Sem meta
      </span>
    );
  }
  const Icon = TIER_ICONS[tier.key] || Medal;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${tier.bg} ${tier.text}`}>
      <Icon size={10} />
      {tier.label}
    </span>
  );
}

function VendedorRow({ row }) {
  const { vendedor, goal, currentValue, targetValue, percentInt, earnedTier, nextTier, progressToNext } = row;
  const isGold = earnedTier?.key === 'ouro';
  const hasGoal = targetValue > 0;

  // Cor da barra = cor da PROXIMA tier (a que o vendedor esta perseguindo).
  // Se ja eh ouro, mantem dourada.
  const barGradient = isGold
    ? TIER_BAR_GRADIENT.ouro
    : (nextTier?.key ? TIER_BAR_GRADIENT[nextTier.key] : 'from-slate-300 to-slate-400');

  return (
    <div className="flex items-center gap-3 py-2.5">
      <CrmAvatar name={vendedor.name} color={vendedor.color} size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
            {vendedor.name}
          </span>
          <TierBadge tier={earnedTier} />
          {isGold && <span className="text-base">🏆</span>}
        </div>

        {hasGoal ? (
          <>
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <span>
                {formatCurrency(currentValue)} <span className="text-slate-300 dark:text-slate-600">/</span> {formatCurrency(targetValue)}
              </span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{percentInt}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${barGradient} transition-all duration-700 ease-out`}
                style={{ width: `${Math.min(100, percentInt)}%` }}
              />
            </div>
            {!isGold && nextTier && (
              <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                {Math.round(progressToNext * 100)}% rumo a {nextTier.label}
              </div>
            )}
            {isGold && (
              <div className="text-[10px] font-medium text-yellow-600 dark:text-yellow-400 mt-0.5">
                Meta batida — Ouro conquistado!
              </div>
            )}
          </>
        ) : (
          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            {formatCurrency(currentValue)} ganhos no periodo · sem meta individual ativa
          </div>
        )}
      </div>
    </div>
  );
}

export function BonificacaoSection({ rows = [], loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
        <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded mb-4 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5 text-center">
        <Trophy size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Nenhum vendedor com cargo CRM atribuido.
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          Configure cargos em Configuracoes &gt; Equipe.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-yellow-500" />
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Progresso de Bonificacao</h3>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-[10px]">
          <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
            <Award size={11} /> Bronze 30%
          </span>
          <span className="inline-flex items-center gap-1 text-slate-700 dark:text-slate-300">
            <Medal size={11} /> Prata 60%
          </span>
          <span className="inline-flex items-center gap-1 text-yellow-700 dark:text-yellow-400">
            <Trophy size={11} /> Ouro 100%
          </span>
        </div>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {rows.map(row => (
          <VendedorRow key={row.vendedor.id} row={row} />
        ))}
      </div>
    </div>
  );
}

export default BonificacaoSection;

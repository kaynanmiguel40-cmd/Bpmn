/**
 * OpReport - corpo de um relatório operacional, em CARDS.
 *
 * Lógica (de cima pra baixo):
 *   1. Resumo    — KPIs do período + 1 frase de contexto
 *   2. Carga por prazo — gráfico previsto + entregue (só no relatório pessoal)
 *   3. Por setor / Por pessoa — total + contribuição individual
 *   4. Por dia / semana — visão temporal (quando não há gráfico de carga)
 *   5. Entregas  — tarefas com relato
 *
 * Genérico: o objeto `report` já vem pronto do operationalModel. Só visual.
 */

import { Sparkles, Send, UserPlus, DollarSign, ClipboardCheck, Timer, Clock, BadgeCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { notaColor } from '../../../lib/productivity';

const ICONS = {
  creative: Sparkles, publish: Send, leads: UserPlus, money: DollarSign,
  tasks: ClipboardCheck, time: Timer, ontime: Clock, quality: BadgeCheck, done: CheckCircle2,
};

const fmtMin = (m) => { if (!m) return '0min'; const h = Math.floor(m / 60), r = Math.round(m % 60); return h ? (r ? `${h}h${String(r).padStart(2, '0')}` : `${h}h`) : `${r}min`; };
const ddmm = (key) => { const [, m, d] = key.split('-').map(Number); return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`; };
// PRAZO (dueAt) é "wall clock" rotulado UTC (ex.: 18:00 que o usuário escolheu)
// → lê os componentes do ISO sem converter.
const dmHm = (iso) => { if (!iso) return ''; const [date, time] = iso.split('T'); const [, m, d] = date.split('-'); const hm = (time || '').slice(0, 5); return `${d}/${m}${hm ? ` ${hm}` : ''}`; };
// ENTREGA (completedAt) é UTC REAL → converte pro fuso LOCAL (senão sai ~3h adiantado).
const localDmHm = (iso) => { if (!iso) return ''; const d = new Date(iso); if (isNaN(d.getTime())) return ''; const p = (n) => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}`; };

function PendingCard({ pending, onOpenTask }) {
  const overdue = pending.filter((p) => p.overdue).length;
  return (
    <Card title="Faltando (não entregue)" meta={`${pending.length}${overdue ? ` · ${overdue} atrasada${overdue > 1 ? 's' : ''}` : ''}`}>
      <div className="divide-y divide-slate-100 dark:divide-white/5 -my-2">
        {pending.map((p, i) => (
          <div key={i} onClick={() => onOpenTask?.(p)}
            className={`flex items-center justify-between gap-3 py-2 -mx-2 px-2 rounded-lg ${onOpenTask ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5' : ''}`}>
            <div className="min-w-0 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full shrink-0 ${p.overdue ? 'bg-rose-500' : 'bg-amber-400'}`} />
              <span className="text-sm text-slate-700 dark:text-slate-200 truncate">{p.taskText}</span>
              {p.chip && <span className="text-[10px] font-medium px-1.5 py-0.5 rounded capitalize shrink-0" style={{ backgroundColor: `${p.chip.color}22`, color: p.chip.color }}>{p.chip.label}</span>}
            </div>
            <span className={`text-[11px] tabular-nums shrink-0 ${p.overdue ? 'text-rose-500 font-medium' : 'text-slate-400 dark:text-slate-500'}`}>
              {p.overdue ? 'venceu' : 'vence'} {ddmm(p.dueKey)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ScoreCard({ score }) {
  const { nota, items = [], foot } = score;
  const color = notaColor(nota);
  return (
    <Card title="Nota de produtividade">
      <div className="flex items-center gap-5">
        <div className="shrink-0 text-center w-16">
          <div className="text-4xl font-bold tabular-nums leading-none" style={{ color }}>{nota == null ? '—' : nota.toFixed(1)}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">de 10</div>
        </div>
        <div className="flex-1 min-w-0 space-y-1.5">
          {items.length === 0 ? (
            <p className="text-[13px] text-slate-400 dark:text-slate-500">Sem dados suficientes pra nota neste período.</p>
          ) : items.map((it, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 w-24 shrink-0 capitalize">{it.label}</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700/50 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${it.value}%`, backgroundColor: color }} />
              </div>
              <span className="text-[11px] font-medium tabular-nums text-slate-500 dark:text-slate-400 w-8 text-right">{it.value}%</span>
            </div>
          ))}
          {foot && <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">{foot}</p>}
        </div>
      </div>
    </Card>
  );
}

function Card({ title, meta, children }) {
  return (
    <section className="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/70 dark:bg-slate-800/40 overflow-hidden">
      {(title || meta) && (
        <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-white/5">
          {title && <h4 className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{title}</h4>}
          {meta && <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{meta}</span>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </section>
  );
}

function Kpis({ metrics, note }) {
  return (
    <Card>
      <div className="flex flex-wrap justify-center gap-y-4">
        {metrics.map((m, i) => {
          const Icon = ICONS[m.icon] || ClipboardCheck;
          return (
            <div key={i} className="flex-1 min-w-[110px] text-center px-2">
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <Icon size={14} style={{ color: m.accent }} className="shrink-0" />
                <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{m.label}</span>
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-none">{m.value}</div>
              {m.sub && <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 truncate">{m.sub}</div>}
            </div>
          );
        })}
      </div>
      {note && (
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-4 pt-3 border-t border-slate-100 dark:border-white/5 leading-relaxed">{note}</p>
      )}
    </Card>
  );
}

function TaskList({ title, tasks, onOpenTask }) {
  return (
    <Card title={title}>
      <div className="divide-y divide-slate-100 dark:divide-white/5 -my-3">
        {tasks.map((t, i) => (
          <div key={i} onClick={() => onOpenTask?.(t)}
            className={`py-3 -mx-2 px-2 rounded-lg ${onOpenTask ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5' : ''}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  {t.day && <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 capitalize">{t.day}</span>}
                  {t.chip && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded capitalize"
                      style={{ backgroundColor: `${t.chip.color}22`, color: t.chip.color }}>{t.chip.label}</span>
                  )}
                </div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-100">{t.title}</div>
                {/* Relato/briefing NÃO aparece inline — só ao clicar na tarefa (abre o drawer). */}
                {(t.dueAt || t.doneAt) && (
                  <div className="flex items-center gap-2 mt-1 text-[10px] tabular-nums">
                    {t.dueAt && <span className="text-slate-400 dark:text-slate-500"><span className="uppercase tracking-wide mr-1">prazo</span>{dmHm(t.dueAt)}</span>}
                    {t.doneAt && <span className={t.onTime ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}><span className="text-slate-300 dark:text-slate-600 mr-1">→</span><span className="uppercase tracking-wide mr-1">entregue</span>{localDmHm(t.doneAt)}</span>}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                {t.qualityPct != null
                  ? <span className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded" style={{ color: notaColor(t.qualityPct / 10), backgroundColor: `${notaColor(t.qualityPct / 10)}1a` }} title="Nota de qualidade (1–5) — clique pra ver o porquê">{(t.qualityPct / 20).toFixed(1)}/5</span>
                  : (t.done && <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 px-1.5 py-0.5">sem avaliação</span>)}
                {t.onTime
                  ? <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">no prazo</span>
                  : <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded"><AlertTriangle size={10} /> atrasada</span>}
                {t.duration && <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500"><Timer size={11} /> {t.duration}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

const CARD_META = {
  green: { label: 'Cartão verde', desc: 'acima da média', color: '#10b981' },
  red: { label: 'Cartão vermelho', desc: 'abaixo da média', color: '#ef4444' },
  neutral: { label: 'Dentro do esperado', desc: 'na média', color: '#94a3b8' },
};

function CardsCard({ cards }) {
  const { current, green, red, saldo, history } = cards;
  const cur = current ? (CARD_META[current] || CARD_META.neutral) : null;
  const saldoColor = saldo > 0 ? '#10b981' : saldo < 0 ? '#ef4444' : '#94a3b8';
  return (
    <Card title="Cartões da pessoa" meta={<span style={{ color: saldoColor }}>saldo {saldo > 0 ? `+${saldo}` : saldo}</span>}>
      {cur ? (
        <div className="flex items-center gap-2.5">
          <span className="w-3.5 h-5 rounded-[3px] shadow-sm shrink-0" style={{ backgroundColor: cur.color }} />
          <div className="min-w-0">
            <div className="text-[13px] font-semibold leading-tight" style={{ color: cur.color }}>{cur.label}</div>
            <div className="text-[10px] text-slate-400 dark:text-slate-500">{cur.desc} na semana mais recente</div>
          </div>
        </div>
      ) : (
        <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Sem cartões ainda</div>
      )}

      {history.length > 0 && (
        <div className="mt-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Cada barra = uma semana</span>
            <span className="text-[10px] text-slate-300 dark:text-slate-600">antigas → recentes</span>
          </div>
          <div className="flex items-end gap-1">
            {history.map((h, i) => {
              const meta = CARD_META[h.card];
              return (
                <div key={i} className="flex flex-col items-center gap-0.5 flex-1 min-w-0" title={`Semana de ${ddmm(h.key)} — ${meta.label} (${meta.desc})`}>
                  <span className="w-full h-4 rounded-[2px]" style={{ backgroundColor: meta.color, opacity: h.card === 'neutral' ? 0.3 : 1 }} />
                  <span className="text-[9px] tabular-nums text-slate-400 dark:text-slate-500">{ddmm(h.key)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: CARD_META.green.color }} /> acima</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm" style={{ backgroundColor: CARD_META.red.color }} /> abaixo</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm opacity-30" style={{ backgroundColor: CARD_META.neutral.color }} /> na média</span>
          </div>
        </div>
      )}

      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{green} verde{green !== 1 ? 's' : ''}</span>
        {' · '}
        <span className="text-rose-600 dark:text-rose-400 font-medium">{red} vermelho{red !== 1 ? 's' : ''}</span>
        {' '}nas semanas — vermelhos consomem verdes.
      </p>
    </Card>
  );
}

// Meta batida (carga prevista × entregue) do período: total + sub-períodos.
function MetaBar({ g, big }) {
  const pct = g.pct ?? 0;
  const color = g.pct == null ? '#94a3b8' : pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className={`${big ? 'text-[13px] font-semibold' : 'text-[11px]'} text-slate-600 dark:text-slate-300 capitalize`}>{g.label}</span>
        <span className={`${big ? 'text-[13px]' : 'text-[11px]'} font-bold tabular-nums`} style={{ color }}>
          {g.pct == null ? '—' : `${g.pct}%`} <span className="text-[10px] font-normal text-slate-400 dark:text-slate-500">({g.done}/{g.planned})</span>
        </span>
      </div>
      <div className={`${big ? 'h-2.5' : 'h-1.5'} rounded-full bg-slate-100 dark:bg-slate-700/50 overflow-hidden`}>
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function MetaCard({ goals }) {
  return (
    <Card title={goals.title} meta="previsto × entregue">
      <MetaBar g={goals.total} big />
      {goals.parts.length > 0 && (
        <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100 dark:border-white/5">
          {goals.parts.map((p, i) => <MetaBar key={i} g={p} />)}
        </div>
      )}
    </Card>
  );
}

// Por setor/pessoa — UM card: tarefas · tempo previsto→real (+ desvio) · % no prazo.
function SectorCard({ title, rows }) {
  return (
    <Card title={title} meta="prev → real">
      <div className="divide-y divide-slate-100 dark:divide-white/5 -my-2.5">
        {rows.map((r, i) => {
          const delta = r.realMin - r.estMin; // < 0 = gastou MENOS que o previsto
          const pct = r.estMin > 0 ? Math.round((delta / r.estMin) * 100) : null;
          const dcolor = delta <= 0 ? '#10b981' : '#f59e0b';
          return (
            <div key={i} className="py-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate capitalize">{r.label}</span>
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums shrink-0">{r.onTimePct == null ? '—' : `${r.onTimePct}%`} no prazo</span>
              </div>
              <div className="flex items-center justify-between gap-3 mt-1 pl-[18px]">
                <span className="text-[12px] text-slate-500 dark:text-slate-400 tabular-nums truncate">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{r.done}</span>/{r.planned} feitas
                  {r.done > 0 && <> · <span className="text-slate-400 dark:text-slate-500">prev</span> {fmtMin(r.estMin)} <span className="text-slate-300 dark:text-slate-600">→</span> <span className="text-slate-400 dark:text-slate-500">real</span> <span className="font-semibold text-slate-700 dark:text-slate-200">{fmtMin(r.realMin)}</span></>}
                </span>
                {r.done > 0 && pct != null && (
                  <span className="text-[11px] font-semibold tabular-nums shrink-0" style={{ color: dcolor }}>
                    {delta === 0 ? 'no previsto' : `${delta < 0 ? '−' : '+'}${fmtMin(Math.abs(delta))} · ${pct > 0 ? '+' : ''}${pct}%`}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// Por dia (semanal) / Por semana (mensal) — consolidado: nota + feitas/previstas + tempo + prazo.
function TimelineCard({ title, rows }) {
  return (
    <Card title={title}>
      <div className="divide-y divide-slate-100 dark:divide-white/5 -my-2.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center justify-between gap-3 py-2.5">
            <span className="flex items-center gap-2 w-28 shrink-0 min-w-0">
              <span className="text-[11px] font-bold tabular-nums px-1.5 py-0.5 rounded shrink-0 w-9 text-center"
                style={{ color: notaColor(r.nota), backgroundColor: r.nota == null ? 'transparent' : `${notaColor(r.nota)}1a` }}>
                {r.nota == null ? '—' : r.nota.toFixed(1)}
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate capitalize">{r.label}</span>
            </span>
            <span className="text-[12px] text-slate-500 dark:text-slate-400 flex-1 truncate tabular-nums">
              <span className="font-semibold text-slate-700 dark:text-slate-200">{r.done}</span>/{r.planned} feitas · {fmtMin(r.realMin)}
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums shrink-0">{r.onTimePct == null ? '—' : `${r.onTimePct}%`} no prazo</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function OpReport({ report, onOpenTask }) {
  if (!report) return null;
  const { metrics = [], score, cards, goals, pending = [], split, timeline, tasks = [], note } = report;

  return (
    <div className="space-y-3">
      {score && <ScoreCard score={score} />}

      {cards && <CardsCard cards={cards} />}

      <Kpis metrics={metrics} note={note} />

      {goals && <MetaCard goals={goals} />}

      {split && split.rows.length > 0 && <SectorCard title={split.title} rows={split.rows} />}

      {timeline && timeline.length > 0 && (
        <TimelineCard title={report.period === 'monthly' ? 'Por semana' : 'Por dia'} rows={timeline} />
      )}

      {tasks.length > 0 && (
        <TaskList title={report.period === 'daily' ? 'Entregas do dia' : 'Principais entregas'} tasks={tasks} onOpenTask={onOpenTask} />
      )}

      {pending.length > 0 && <PendingCard pending={pending} onOpenTask={onOpenTask} />}
    </div>
  );
}

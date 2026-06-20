/**
 * operationalModel - Relatório operacional por SETOR e por PESSOA.
 *
 * Núcleo do "novo modelo": tudo deriva de uma lista de REGISTROS de tarefa
 * concluída, cada um carregando setor + pessoa. A mesma lista alimenta os dois
 * cortes (lens):
 *   • 'person' → agrupa por pessoa; cada tarefa mostra um chip do SETOR.
 *   • 'sector' → agrupa por setor; cada tarefa mostra um chip da PESSOA.
 *
 * Cascata: dia = registros do dia · semana = junção dos dias · mês = junção das
 * semanas (mesma lógica do comercial).
 *
 * Por enquanto os registros vêm de um EXEMPLO determinístico (recordsForDay).
 * Pra ligar nos dados reais, basta trocar recordsForDay/listDays por uma leitura
 * das O.S. (setor = O.S.→projeto→setor; pessoa = responsável do grupo/da O.S.).
 * O resto (cascata, agregação, UI) não muda.
 *
 * Fica em src/lib (fora do módulo CRM).
 */

import { OPERACAO_QUALITY, scoreQualityChecklist } from './qualityChecklist';

// ---------- datas ----------
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthKeyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const todayKey = () => keyOf(today0());

// Dias úteis SEM cortar em "hoje" (pro gráfico de carga, que precisa do futuro).
function allWeekdaysFromMonday(mondayKey) {
  const [y, m, d] = mondayKey.split('-').map(Number);
  const start = new Date(y, m - 1, d); const out = [];
  for (let i = 0; i < 5; i++) { const dt = new Date(start); dt.setDate(dt.getDate() + i); out.push(keyOf(dt)); }
  return out;
}
function allWeekdaysOfMonth(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  const end = new Date(y, m, 0); const out = []; const d = new Date(y, m - 1, 1);
  while (d <= end) { const dow = d.getDay(); if (dow !== 0 && dow !== 6) out.push(keyOf(new Date(d))); d.setDate(d.getDate() + 1); }
  return out;
}

function lastWeekdays(n) {
  const out = []; const d = today0();
  while (out.length < n) { const dow = d.getDay(); if (dow !== 0 && dow !== 6) out.push(keyOf(new Date(d))); d.setDate(d.getDate() - 1); }
  return out;
}
function lastMondays(n) {
  const out = []; const d = today0();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  for (let i = 0; i < n; i++) { out.push(keyOf(new Date(d))); d.setDate(d.getDate() - 7); }
  return out;
}
function lastMonths(n) {
  const out = []; const d = today0(); d.setDate(1);
  for (let i = 0; i < n; i++) { out.push(monthKeyOf(d)); d.setMonth(d.getMonth() - 1); }
  return out;
}
function weekdaysFromMonday(mondayKey) {
  const [y, m, d] = mondayKey.split('-').map(Number);
  const start = new Date(y, m - 1, d); const last = today0(); const out = [];
  for (let i = 0; i < 5; i++) { const dt = new Date(start); dt.setDate(dt.getDate() + i); if (dt <= last) out.push(keyOf(dt)); }
  return out;
}
function weekdaysOfMonth(monthKey) {
  const [y, m] = monthKey.split('-').map(Number);
  const last = today0(); const monthEnd = new Date(y, m, 0); const stop = monthEnd < last ? monthEnd : last;
  const out = []; const d = new Date(y, m - 1, 1);
  while (d <= stop) { const dow = d.getDay(); if (dow !== 0 && dow !== 6) out.push(keyOf(new Date(d))); d.setDate(d.getDate() + 1); }
  return out;
}
function mondayOf(dateKey) {
  const [y, m, d] = dateKey.split('-').map(Number);
  const dt = new Date(y, m - 1, d); dt.setDate(dt.getDate() - ((dt.getDay() + 6) % 7));
  return keyOf(dt);
}
const shortDay = (key) => { const [y, m, d] = key.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' }); };
const ddmm = (key) => { const [, m, d] = key.split('-').map(Number); return `${pad(d)}/${pad(m)}`; };
const WD = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const weekdayShort = (key) => { const [y, m, d] = key.split('-').map(Number); return WD[new Date(y, m - 1, d).getDay()]; };

// Semanas (úteis) de um mês, agrupadas pela segunda — pros baldes do gráfico mensal.
function weeksOfMonth(monthKey) {
  const groups = new Map();
  for (const dk of allWeekdaysOfMonth(monthKey)) { const mk = mondayOf(dk); if (!groups.has(mk)) groups.set(mk, []); groups.get(mk).push(dk); }
  return [...groups.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([mk, days], i) => ({ n: i + 1, monday: mk, days }));
}

// ---------- utils ----------
const hashKey = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const fmtHM = (min) => { const h = Math.floor(min / 60), m = Math.round(min % 60); return h ? (m ? `${h}h${pad(m)}` : `${h}h`) : `${m}min`; };

// ---------- catálogo do exemplo (setores, pessoas, tarefas) ----------
const SECTORS = {
  comercial: { id: 'comercial', label: 'Comercial', color: '#EC4899' },
  produto: { id: 'produto', label: 'Produto', color: '#3B82F6' },
  marketing: { id: 'marketing', label: 'Marketing', color: '#A06BE6' },
  suporte: { id: 'suporte', label: 'Suporte / CS', color: '#10B981' },
};

// sectors[] com repetição = peso (ex.: Kaynan mais Comercial que Produto)
const PEOPLE = [
  { id: 'kaynan', name: 'Kaynan', color: '#6366F1', sectors: ['comercial', 'comercial', 'produto'] },
  { id: 'elias', name: 'Elias', color: '#0EA5E9', sectors: ['produto', 'produto', 'produto', 'suporte'] },
  { id: 'lorena', name: 'Lorena', color: '#F59E0B', sectors: ['suporte', 'suporte', 'comercial'] },
  { id: 'kaua', name: 'Kauã', color: '#A06BE6', sectors: ['marketing'] },
];

const TASKS = {
  comercial: [
    { title: 'Diagnóstico financeiro com a Marmoraria Granito Real', min: 35, delivery: 'Levantei faturamento e margem. Dor: não sabe o custo por obra. Proposta marcada pra segunda.' },
    { title: 'Fechamento com a Clínica Sorriso', min: 55, delivery: 'Fechou plano Pro mensal + implantação. Contrato assinado.' },
    { title: 'Reativar lead frio: Auto Peças Veloz', min: 20, delivery: 'Reabri com case de outro mecânico. Topou uma demo na quinta.' },
    { title: 'Montar proposta para a Rede Farmácias Bem-Estar', min: 45, delivery: '3 CNPJs, plano Enterprise. Proposta enviada com ROI por loja.' },
    { title: 'Qualificar 8 leads novos do diagnóstico', min: 40, delivery: '5 dentro do ICP (contadores e PMEs), 3 descartados.' },
    { title: 'Demo de DRE para a Transportadora Rota Sul', min: 50, delivery: 'Mostrei DRE e fluxo por filial. Decisor pediu a proposta.' },
  ],
  produto: [
    { title: 'Integração Open Finance com o Sicoob', min: 120, delivery: 'Sandbox conectado, importando extrato e saldo em tempo real.' },
    { title: 'Refatorar o cálculo do balancete', min: 80, delivery: 'Corrigi arredondamento de centavos. Bate com a contabilidade.' },
    { title: 'Conciliação automática de maquininha (Stone/PagBank)', min: 95, delivery: 'Conciliando taxa e antecipação automaticamente.' },
    { title: 'Bug: parcelamento sumindo no fluxo de caixa', min: 35, delivery: 'Causa era timezone no vencimento. Corrigido e testado.' },
    { title: 'Exportador do relatório gerencial em PDF', min: 60, delivery: 'DRE + fluxo + indicadores num PDF com a marca do cliente.' },
    { title: 'Subir release 1.6 (alertas de saldo)', min: 40, delivery: 'Deploy ok. Push e e-mail de alerta validados.' },
  ],
  marketing: [
    { title: 'Campanha "Feche seu mês em 1 clique"', min: 90, delivery: '1 vídeo + 3 estáticos aprovados, sobem amanhã.' },
    { title: 'Reel com depoimento da Clínica Sorriso', min: 70, delivery: 'Reel de 28s com o antes/depois do controle financeiro.' },
    { title: 'Otimizar o funil do diagnóstico (CPL)', min: 35, delivery: 'Troquei a headline. CPL caiu de R$ 18 → R$ 11.' },
    { title: 'Sequência de e-mail pós-diagnóstico', min: 50, delivery: '4 e-mails de nutrição agendados no automation.' },
    { title: 'Atualizar a landing com prova social', min: 55, delivery: '3 depoimentos + selo "+50 empresas". Pixel validado.' },
    { title: 'Calendário de conteúdo da semana', min: 30, delivery: '5 posts sobre fechamento e DRE agendados.' },
  ],
  suporte: [
    { title: 'Implantação completa: Contabilidade Silva', min: 110, delivery: 'Plano de contas, integrações e usuários no ar. Cliente lança sozinho.' },
    { title: 'Migrar 18 meses de histórico (Padaria Pão Quente)', min: 100, delivery: 'Saldos de abertura conferidos, fechamento batendo.' },
    { title: 'Treinar equipe no fluxo de caixa projetado', min: 45, delivery: 'Call de 50min. Projeção de 90 dias e alertas configurados.' },
    { title: 'Chamado: divergência no DRE de maio', min: 35, delivery: 'Duas notas classificadas errado. Corrigido e documentado.' },
    { title: 'Revisão mensal de saúde da Ótica Visão', min: 40, delivery: 'Uso alto, sem risco. Sugeri upsell de centro de custo.' },
    { title: 'Configurar alertas de vencimento (Auto Peças Veloz)', min: 30, delivery: 'Alertas de contas a pagar/receber ativados.' },
  ],
};

// ---------- gerador do exemplo: tarefas por PRAZO DE ENTREGA ----------
// Cada tarefa tem um prazo (dueKey) e um status (done). Dias passados ~entregues
// (alguns atrasados), hoje ~metade, futuro pendente (previsto). Determinístico.
const BRIEF_BY_SECTOR = {
  comercial: 'Siga o script de abordagem, registre o resultado no CRM e combine o próximo passo com o lead.',
  produto: 'Confira o requisito, implemente seguindo o padrão do repositório, teste e registre a entrega com print.',
  marketing: 'Alinhe com a campanha vigente, produza dentro da identidade visual e registre as métricas/links.',
  suporte: 'Confirme a necessidade do cliente, execute o procedimento padrão e registre o atendimento.',
};
const QUALITY_REASONS = [
  'Faltou um detalhe pequeno, ajustado depois.',
  'Precisou de um retoque na revisão.',
  'Ficou bom, mas dava pra documentar melhor.',
  'Um ponto fora do padrão.',
];
// Contestações de EXEMPLO (o executor discorda da nota; supervisor/3º decide).
const DISPUTE_REASONS = [
  'Discordo. Entreguei tudo que foi pedido e ainda antecipei um problema — segue o print no chat.',
  'Acho injusto. O retrabalho foi por mudança de escopo no meio, não por erro meu.',
  'Fui proativo sim: avisei o time antes do prazo e propus a solução. Vale revisar essa nota.',
  'A documentação estava no card, só não foi vista. Anexei de novo.',
];
const DISPUTE_RESOLUTIONS_CHANGED = [
  'Procede. Revi o histórico e ajustei a nota.',
  'Tem razão, o print confirma. Corrigido.',
];
const DISPUTE_RESOLUTIONS_KEPT = [
  'Entendo o ponto, mas o critério segue valendo. Mantida.',
  'Conversamos — a nota reflete o combinado. Mantida.',
];
const clampPct = (n) => Math.max(0, Math.min(100, n));
// Gera (ou não) uma contestação determinística pra uma avaliação de exemplo.
function exampleDispute(seed, quality, executorName) {
  if (seed % 4 !== 0) return null; // ~25% das avaliadas têm contestação
  const lows = OPERACAO_QUALITY.filter((c) => typeof quality.answers[c.id] === 'number' && quality.answers[c.id] < 5);
  const criterion = lows.length ? lows[seed % lows.length].id : null;
  const reason = DISPUTE_REASONS[seed % DISPUTE_REASONS.length];
  const base = { by: executorName, byId: null, criterion, reason };
  if (seed % 2 === 0) return { ...base, status: 'open' }; // metade ainda abertas
  const changed = seed % 3 === 0;
  return {
    ...base,
    status: 'resolved',
    outcome: changed ? 'changed' : 'kept',
    resolvedBy: 'Kaynan',
    resolutionNote: (changed ? DISPUTE_RESOLUTIONS_CHANGED : DISPUTE_RESOLUTIONS_KEPT)[seed % 2],
    prevPct: changed ? clampPct(quality.pct - (10 + (seed % 10))) : quality.pct,
  };
}
// Qualidade de EXEMPLO (notas por critério + justificativas) pra tarefa revisada.
function exampleQuality(seed) {
  const answers = {}, notes = {};
  for (const c of OPERACAO_QUALITY) {
    const r = (seed + hashKey(c.id)) % 10;
    let v;
    if (r === 0) v = 'na';
    else if (r <= 5) v = 5;
    else if (r <= 7) v = 4;
    else if (r === 8) v = 3;
    else v = 2;
    answers[c.id] = v;
    if (typeof v === 'number' && v < 5) notes[c.id] = QUALITY_REASONS[(seed + r) % QUALITY_REASONS.length];
  }
  return { answers, notes, pct: scoreQualityChecklist(answers).pct };
}

const addDays = (key, n) => { const [y, m, d] = key.split('-').map(Number); return keyOf(new Date(y, m - 1, d + n)); };

const _dueCache = new Map();
function tasksForDueDay(dueKey) {
  if (_dueCache.has(dueKey)) return _dueCache.get(dueKey);
  const out = [];
  const tk = todayKey();
  const past = dueKey < tk;
  const isToday = dueKey === tk;
  for (const p of PEOPLE) {
    const seed = hashKey(p.id + dueKey);
    const count = seed % 5; // 0–4 tarefas com prazo nesse dia (alguns dias 0)
    for (let i = 0; i < count; i++) {
      const secId = p.sectors[(seed + i * 7) % p.sectors.length];
      const sector = SECTORS[secId];
      const task = TASKS[secId][(seed + i * 5) % TASKS[secId].length];
      const done = past ? ((seed + i) % 6 !== 0) : isToday ? ((seed + i) % 2 === 0) : false;
      const onTime = done ? ((seed + i) % 7 !== 0) : false;
      const reviewed = done && (seed + i) % 2 === 0;
      const approved = reviewed && (seed + i) % 11 !== 0;
      const quality = reviewed ? exampleQuality(seed + i) : null;
      const dispute = quality ? exampleDispute(seed + i, quality, p.name) : null;
      // data REAL de entrega: no prazo → no dia do prazo; atrasada → 1–4 dias depois.
      const doneKey = done ? addDays(dueKey, onTime ? 0 : 1 + ((seed + i) % 4)) : null;
      // com HORA (no real virá do dueAt/completedAt da O.S.)
      const dueAt = `${dueKey}T${pad(9 + ((seed + i) % 9))}:${pad(((seed + i) * 13) % 60)}:00`;
      const doneAt = doneKey ? `${doneKey}T${pad(8 + ((seed + i * 3) % 11))}:${pad((seed + i * 7) % 60)}:00` : null;
      out.push({
        taskId: `${p.id}-${dueKey}-${i}`,
        dueKey, doneKey, dueAt, doneAt, done,
        sector: { id: sector.id, label: sector.label, color: sector.color },
        person: { id: p.id, name: p.name, color: p.color },
        taskText: task.title,
        briefing: `${task.title}. ${BRIEF_BY_SECTOR[secId]}`,
        timeMin: task.min,
        estMin: Math.round(task.min * (1 + ((seed + i) % 6) * 0.1)), // previsto: 1.0–1.5× o real (estimativa inflada)
        onTime, reviewed, approved,
        delivery: done ? task.delivery : null,
        qualityPct: quality?.pct ?? null,
        qualityAnswers: quality?.answers ?? null,
        qualityNotes: quality?.notes ?? null,
        qualityDispute: dispute,
      });
    }
  }
  _dueCache.set(dueKey, out);
  return out;
}

// "Concluídas no dia" = tarefas com prazo nesse dia que já foram entregues
// (no exemplo, a entrega cai no dia do prazo). Mantém os blocos de "feito".
function recordsForDay(dateKey) {
  return tasksForDueDay(dateKey).filter((t) => t.done);
}

// ---------- agregação ----------
function aggregate(records) {
  const tasksDone = records.length;
  const timeMin = records.reduce((a, r) => a + r.timeMin, 0);
  const onTime = records.filter((r) => r.onTime).length;
  const late = tasksDone - onTime;
  const reviewed = records.filter((r) => r.reviewed).length;
  const approved = records.filter((r) => r.approved).length;
  const deliveries = records.filter((r) => r.delivery).length;
  return {
    tasksDone, timeMin, onTime, late, reviewed, approved, deliveries,
    onTimePct: tasksDone ? Math.round((onTime / tasksDone) * 100) : null,
    approvedPct: reviewed ? Math.round((approved / reviewed) * 100) : null,
  };
}

// Eficiência: tempo real vs previsto (− = gastou menos que o estimado).
const effSub = (realMin, totalEst) => {
  if (!(totalEst > 0)) return 'trabalhado';
  const pct = Math.round(((realMin - totalEst) / totalEst) * 100);
  return `prev ${fmtHM(totalEst)} · ${pct > 0 ? '+' : ''}${pct}%`;
};

// KPIs por CARGA (pessoa OU setor): previstas × entregues + prazo + tempo.
function tilesPerson(a, load, totalEst) {
  const planned = load?.totalPlanned ?? a.tasksDone;
  const done = load?.totalDone ?? a.tasksDone;
  const donePct = planned ? Math.round((done / planned) * 100) : null;
  return [
    { icon: 'tasks', label: 'Previstas', value: planned, sub: 'com prazo no período', accent: '#3b82f6' },
    { icon: 'done', label: 'Entregues', value: done, sub: donePct == null ? '—' : `${donePct}% da carga`, accent: '#10b981' },
    { icon: 'ontime', label: 'No prazo', value: a.onTimePct == null ? '—' : `${a.onTimePct}%`, sub: a.late ? `${a.late} atrasada${a.late > 1 ? 's' : ''}` : 'das entregues', accent: '#f59e0b' },
    { icon: 'time', label: 'Tempo', value: fmtHM(a.timeMin), sub: effSub(a.timeMin, totalEst), accent: '#8b5cf6' },
  ];
}

// 1 tarefa representativa por dia (rotulada pela data), amostrada até ~10.
function repTasks(byDay, otherDim) {
  const perDay = [];
  for (const { key, records } of byDay) {
    if (!records.length) continue;
    const r = records[0];
    perDay.push(recordToTask(r, otherDim, shortDay(key)));
  }
  if (perDay.length <= 10) return perDay;
  const step = perDay.length / 10; const out = [];
  for (let i = 0; i < 10; i++) out.push(perDay[Math.floor(i * step)]);
  return out;
}

// otherDim = 'sector' | 'person' → qual dimensão vira chip na linha da tarefa
function recordToTask(r, otherDim, day) {
  const chip = otherDim === 'sector'
    ? { label: r.sector.label, color: r.sector.color }
    : { label: r.person.name, color: r.person.color };
  return {
    taskId: r.taskId, title: r.taskText, duration: fmtHM(r.timeMin),
    onTime: r.onTime, approved: r.approved, delivery: r.delivery,
    chip, day: day || null,
    // detalhe pro painel de leitura (clique na tarefa)
    briefing: r.briefing, done: r.done, dueKey: r.dueKey, doneKey: r.doneKey, dueAt: r.dueAt, doneAt: r.doneAt,
    qualityPct: r.qualityPct, qualityAnswers: r.qualityAnswers, qualityNotes: r.qualityNotes,
    qualityDispute: r.qualityDispute,
    person: r.person, sector: r.sector,
  };
}

// ---------- API pública ----------
export function getOperationalIndex(lens) {
  const owners = lens === 'sector'
    ? Object.values(SECTORS).map((s) => ({ id: s.id, name: s.label, color: s.color, sub: 'setor' }))
    : PEOPLE.map((p) => ({ id: p.id, name: p.name, color: p.color, sub: SECTORS[p.sectors[0]]?.label }));
  return { owners, days: lastWeekdays(10), weeks: lastMondays(4), months: lastMonths(3) };
}

/**
 * Carga por PRAZO DE ENTREGA: quantas tarefas têm prazo em cada balde (dia da
 * semana / semana do mês), e quantas dessas já foram entregues. Inclui dias
 * futuros do período (a graça é ver a carga à frente).
 * @returns {{ buckets: {label,planned,done}[], totalPlanned, totalDone }}
 */
export function getOperationalLoad(lens, id, period, key) {
  const match = (t) => (lens === 'person' ? t.person.id === id : t.sector.id === id);
  const bucket = (dayKeys, label) => {
    let planned = 0, done = 0;
    for (const dk of dayKeys) for (const t of tasksForDueDay(dk)) { if (!match(t)) continue; planned++; if (t.done) done++; }
    return { label, planned, done };
  };

  let buckets;
  if (period === 'daily') buckets = [bucket([key], shortDay(key))];
  else if (period === 'weekly') buckets = allWeekdaysFromMonday(key).map((dk) => bucket([dk], weekdayShort(dk)));
  else buckets = weeksOfMonth(key).map((w) => bucket(w.days, `Sem ${w.n}`));

  const totalPlanned = buckets.reduce((s, b) => s + b.planned, 0);
  const totalDone = buckets.reduce((s, b) => s + b.done, 0);
  return { buckets, totalPlanned, totalDone };
}

// dias do período (compartilhado por report/nota/cartões)
function periodDays(period, key) {
  if (period === 'daily') return [key];
  if (period === 'weekly') { const d = weekdaysFromMonday(key); return d.length ? d : [key]; }
  const d = weekdaysOfMonth(key); return d.length ? d : [`${key}-01`];
}

// ---------- algoritmo da NOTA (compensatório) ----------
// Nota do DIA: entregue no dia vs previsto pro dia (Entrega 40% · Qualidade 40% · Prazo 20%).
// Nota da SEMANA = média das notas dos dias (compensa dia bom × dia ruim).
// Nota do MÊS = média das notas das semanas. Dia/semana sem movimento sai da conta.
const avg = (arr) => arr.reduce((s, n) => s + n, 0) / arr.length;
const round1 = (n) => Math.round(n * 10) / 10;
const matcher = (lens, id) => (lens === 'person' ? (x) => x.person.id === id : (x) => x.sector.id === id);

function weightedNota({ entrega, qualidade, prazo }) {
  const items = [[entrega, 0.4], [qualidade, 0.4], [prazo, 0.2]].filter(([s]) => s != null);
  if (!items.length) return null;
  const ws = items.reduce((a, [, w]) => a + w, 0);
  return round1(items.reduce((a, [s, w]) => a + s * w, 0) / ws / 10);
}

// fatores do dia (0–100) — base da nota do dia e do detalhamento
function dayFactors(match, dayKey) {
  const delivered = recordsForDay(dayKey).filter(match);
  const planned = tasksForDueDay(dayKey).filter(match).length;
  if (planned === 0 && delivered.length === 0) return null; // dia neutro
  const a = aggregate(delivered);
  return {
    entrega: planned > 0 ? Math.min(100, Math.round((delivered.length / planned) * 100)) : (delivered.length ? 100 : null),
    qualidade: a.reviewed > 0 ? Math.round((a.approved / a.reviewed) * 100) : null,
    prazo: a.onTimePct,
  };
}
const dayNotaBy = (match, dayKey) => { const f = dayFactors(match, dayKey); return f ? weightedNota(f) : null; };

// Média dos fatores (Entrega/Qualidade/Prazo) dos dias — pro score da semana/mês.
function avgFactors(match, dayKeys) {
  const acc = { entrega: [], qualidade: [], prazo: [] };
  for (const d of dayKeys) {
    const f = dayFactors(match, d);
    if (!f) continue;
    for (const kk of ['entrega', 'qualidade', 'prazo']) if (f[kk] != null) acc[kk].push(f[kk]);
  }
  const avg = (arr) => (arr.length ? Math.round(arr.reduce((s, n) => s + n, 0) / arr.length) : null);
  return { entrega: avg(acc.entrega), qualidade: avg(acc.qualidade), prazo: avg(acc.prazo) };
}
function weekNotaBy(match, mondayKey) {
  const notas = weekdaysFromMonday(mondayKey).map((d) => dayNotaBy(match, d)).filter((n) => n != null);
  return notas.length ? round1(avg(notas)) : null;
}
function monthNotaBy(match, monthKey) {
  const notas = weeksOfMonth(monthKey).map((w) => weekNotaBy(match, w.monday)).filter((n) => n != null);
  return notas.length ? round1(avg(notas)) : null;
}
function notaBy(lens, id, period, key) {
  const m = matcher(lens, id);
  return period === 'daily' ? dayNotaBy(m, key) : period === 'weekly' ? weekNotaBy(m, key) : monthNotaBy(m, key);
}
const personNota = (id, period, key) => notaBy('person', id, period, key);

// "esperado" = média das notas das pessoas no período
function periodMedia(period, key) {
  const notas = PEOPLE.map((p) => personNota(p.id, period, key)).filter((n) => n != null);
  if (!notas.length) return null;
  return Math.round((notas.reduce((s, n) => s + n, 0) / notas.length) * 10) / 10;
}

// Cartão do período: verde (acima da média), vermelho (ruim/abaixo), nada (esperado).
const CARD_MARGIN = 0.5;
function classifyCard(nota, media) {
  if (nota == null) return 'neutral';
  const ref = media == null ? nota : media;
  if (nota <= ref - CARD_MARGIN || nota < 5) return 'red';
  if (nota >= ref + CARD_MARGIN && nota >= 7) return 'green';
  return 'neutral';
}

/**
 * Cartões de produtividade — atribuídos à PESSOA, não ao relatório. É o histórico
 * de avaliação semanal dela (1 cartão/semana); independe do período que você abre:
 * o mesmo cartão aparece igual no diário, no semanal e no mensal da pessoa.
 *   - current  = a semana mais recente (standing atual da pessoa)
 *   - history  = últimas 6 semanas (antiga → recente)
 *   - saldo    = verdes − vermelhos (vermelhos consomem verdes)
 */
const weekCard = (id, mondayKey) => classifyCard(personNota(id, 'weekly', mondayKey), periodMedia('weekly', mondayKey));

export function getOperationalCards(id) {
  const weekKeys = lastMondays(6).slice().reverse(); // antiga → recente
  let green = 0, red = 0;
  const history = weekKeys.map((k) => {
    const card = weekCard(id, k);
    if (card === 'green') green++; else if (card === 'red') red++;
    return { key: k, card };
  });
  const current = history.length ? history[history.length - 1].card : null;
  return { current, green, red, saldo: green - red, history };
}

// Tarefas FALTANDO no período: previstas (têm prazo) e ainda NÃO entregues.
// Inclui dias futuros (a vencer) e marca as atrasadas (prazo < hoje).
function gatherPending(lens, id, period, key) {
  const m = matcher(lens, id);
  const days = period === 'daily' ? [key] : period === 'weekly' ? allWeekdaysFromMonday(key) : allWeekdaysOfMonth(key);
  const tk = todayKey();
  const out = [];
  for (const d of days) {
    for (const t of tasksForDueDay(d)) {
      if (!m(t) || t.done) continue;
      out.push({
        taskId: t.taskId,
        taskText: t.taskText, title: t.taskText,
        briefing: t.briefing,
        dueKey: d,
        overdue: d < tk,
        done: false,
        chip: lens === 'person' ? { label: t.sector.label, color: t.sector.color } : { label: t.person.name, color: t.person.color },
        person: t.person, sector: t.sector,
        qualityPct: null, qualityAnswers: null, qualityNotes: null, delivery: null,
      });
    }
  }
  return out.sort((a, b) => (Number(b.overdue) - Number(a.overdue)) || (a.dueKey < b.dueKey ? -1 : 1));
}

// Meta batida (carga PREVISTA × ENTREGUE) DO PERÍODO navegado:
//  - diário  → só a meta do dia
//  - semanal → a meta da semana + cada dia (Seg–Sex)
//  - mensal  → a meta do mês + cada semana
function getGoals(lens, id, period, key) {
  const g = (p, k, label) => { const l = getOperationalLoad(lens, id, p, k); return { label, done: l.totalDone, planned: l.totalPlanned, pct: l.totalPlanned > 0 ? Math.round((l.totalDone / l.totalPlanned) * 100) : null }; };
  const t = period === 'daily' ? 'Meta do dia' : period === 'weekly' ? 'Meta da semana' : 'Meta do mês';
  const lbl = period === 'daily' ? 'Dia' : period === 'weekly' ? 'Semana' : 'Mês';
  return { title: t, total: g(period, key, lbl), parts: [] }; // detalhe por sub-período vai no card "Por dia/semana"
}

/**
 * @param {'person'|'sector'} lens
 * @param {string} id      personId | sectorId
 * @param {'daily'|'weekly'|'monthly'} period
 * @param {string} key     dateKey | mondayKey | monthKey
 */
export function getOperationalReport(lens, id, period, key) {
  if (!lens || !id || !key) return null;
  const otherDim = lens === 'person' ? 'sector' : 'person';
  const match = (r) => (lens === 'person' ? r.person.id === id : r.sector.id === id);

  // dias do período
  let dayKeys;
  if (period === 'daily') dayKeys = [key];
  else if (period === 'weekly') { dayKeys = weekdaysFromMonday(key); if (!dayKeys.length) dayKeys = [key]; }
  else { dayKeys = weekdaysOfMonth(key); if (!dayKeys.length) dayKeys = [`${key}-01`]; }

  const byDay = dayKeys.map((k) => ({ key: k, records: recordsForDay(k).filter(match) }));
  const all = byDay.flatMap((d) => d.records);
  const a = aggregate(all);
  const totalEst = all.reduce((s, r) => s + (r.estMin || 0), 0); // tempo previsto das entregues

  // Por dia (semanal) / Por semana (mensal) — UM card só: nota + feitas/previstas
  // + tempo + % no prazo de cada sub-período.
  const periodStats = (ks) => {
    let planned = 0; const doneRecs = [];
    for (const k of ks) for (const t of tasksForDueDay(k)) { if (!match(t)) continue; planned++; if (t.done) doneRecs.push(t); }
    const ag = aggregate(doneRecs);
    return { planned, done: ag.tasksDone, realMin: ag.timeMin, onTimePct: ag.onTimePct };
  };
  let timeline = null;
  if (period === 'weekly') {
    timeline = allWeekdaysFromMonday(key).map((d) => ({ label: weekdayShort(d), nota: dayNotaBy(match, d), ...periodStats([d]) })).filter((x) => x.planned > 0 || x.done > 0);
  } else if (period === 'monthly') {
    timeline = weeksOfMonth(key).map((w) => ({ label: `Sem ${w.n}`, nota: weekNotaBy(match, w.monday), ...periodStats(w.days) })).filter((x) => x.planned > 0 || x.done > 0);
  }

  // tarefas: no dia mostra todas; em semana/mês, 1 representativa por dia
  const tasks = period === 'daily'
    ? all.map((r) => recordToTask(r, otherDim, null))
    : repTasks(byDay, otherDim);

  // destaques + resumo
  const single = period === 'daily';
  const span = single ? 'no dia' : period === 'weekly' ? 'na semana' : 'no mês';
  let note, highlights;
  if (lens === 'person') {
    const setores = new Set(all.map((r) => r.sector.label));
    note = `${a.tasksDone} tarefas ${span} em ${fmtHM(a.timeMin)} — ${a.onTimePct ?? '—'}% no prazo e ${a.approvedPct ?? '—'}% aprovadas. Trabalho em ${setores.size} setor${setores.size === 1 ? '' : 'es'}.`;
    highlights = [
      `${a.tasksDone} tarefas e ${a.deliveries} entregas ${span}`,
      `Setores tocados: ${[...setores].join(' · ') || '—'}`,
      `${a.onTimePct ?? '—'}% no prazo · ${a.approvedPct ?? '—'}% aprovadas`,
    ];
  } else {
    const pessoas = new Set(all.map((r) => r.person.name));
    note = `${a.tasksDone} tarefas ${span} no setor, por ${pessoas.size} pessoa${pessoas.size === 1 ? '' : 's'}, em ${fmtHM(a.timeMin)}. Prazo ${a.onTimePct ?? '—'}% · qualidade ${a.approvedPct ?? '—'}%.`;
    highlights = [
      `${a.tasksDone} tarefas e ${a.deliveries} entregas ${span}`,
      `Quem trabalhou: ${[...pessoas].join(' · ') || '—'}`,
      `${a.onTimePct ?? '—'}% no prazo · ${a.approvedPct ?? '—'}% aprovadas`,
    ];
  }

  // Por setor (pessoa) / Por pessoa (setor) — UM card só: tarefas · tempo
  // previsto→real (+ desvio) · % no prazo.
  const splitDim = lens === 'sector' ? 'person' : 'sector';
  const splitMap = new Map();
  const ensure = (dim) => {
    if (!splitMap.has(dim.id)) splitMap.set(dim.id, { label: splitDim === 'person' ? dim.name : dim.label, color: dim.color, records: [], estMin: 0, planned: 0 });
    return splitMap.get(dim.id);
  };
  // feitas (done) → tempo real/estimado
  for (const r of all) {
    const g = ensure(splitDim === 'person' ? r.person : r.sector);
    g.records.push(r);
    g.estMin += r.estMin || 0;
  }
  // previstas (com prazo no período: done + pendentes)
  for (const k of dayKeys) {
    for (const t of tasksForDueDay(k)) {
      if (!match(t)) continue;
      ensure(splitDim === 'person' ? t.person : t.sector).planned += 1;
    }
  }
  const split = splitMap.size > 0 ? {
    title: splitDim === 'person' ? 'Por pessoa' : 'Por setor',
    rows: [...splitMap.values()]
      .map((g) => { const ga = aggregate(g.records); return { label: g.label, color: g.color, planned: g.planned, done: ga.tasksDone, realMin: ga.timeMin, estMin: g.estMin, onTimePct: ga.onTimePct }; })
      .sort((x, y) => y.planned - x.planned),
  } : null;

  // carga por prazo de entrega — alimenta os KPIs (Previstas/Entregues) e a Meta.
  // Vale pra PESSOA e pra SETOR (no setor é a soma da carga de quem é dele).
  const load = getOperationalLoad(lens, id, period, key);

  // camada 3 — nota (compensatória) + fatores (Entrega/Qualidade/Prazo). No dia
  // são os fatores do dia; na semana/mês são a MÉDIA dos fatores diários.
  const m = matcher(lens, id);
  const nota = notaBy(lens, id, period, key);
  const f = period === 'daily' ? (dayFactors(m, key) || {}) : avgFactors(m, period === 'weekly' ? weekdaysFromMonday(key) : weekdaysOfMonth(key));
  const scoreItems = [
    { label: 'Entrega', value: f.entrega },
    { label: 'Qualidade', value: f.qualidade },
    { label: 'Prazo', value: f.prazo },
  ].filter((x) => x.value != null);
  const foot = period === 'daily'
    ? 'Entrega 40% · Qualidade 40% · Prazo 20%'
    : 'média dos dias · Entrega 40% · Qualidade 40% · Prazo 20%';
  const score = { nota, kind: 'factors', items: scoreItems, foot };

  // cartões (verde/vermelho + saldo) — atribuídos à PESSOA (mesmo cartão em
  // qualquer período dela); setor não tem cartão (não é uma pessoa).
  const cards = lens === 'person' ? getOperationalCards(id) : null;

  return {
    kind: 'operacao', period, lens,
    score, cards,
    goals: getGoals(lens, id, period, key),
    pending: gatherPending(lens, id, period, key),
    metrics: tilesPerson(a, load, totalEst),
    load, highlights, split, timeline, tasks, note,
    summary: { tasksDone: a.tasksDone, timeMin: a.timeMin, onTimePct: a.onTimePct, approvedPct: a.approvedPct, deliveries: a.deliveries },
  };
}

/** Texto pronto pra copiar (zap / slide). */
export function buildOperationalText(report, ownerName, sub, headLabel) {
  if (!report) return '';
  const tag = report.period === 'daily' ? 'DIÁRIO' : report.period === 'weekly' ? 'SEMANAL' : 'MENSAL';
  const lines = [`RELATÓRIO OPERACIONAL ${tag} — ${headLabel}`, `${ownerName}${sub ? ` · ${sub}` : ''}`, ''];
  lines.push(report.metrics.map((m) => `${m.label}: ${m.value}${m.sub ? ` (${m.sub})` : ''}`).join(' · '), '');
  if (report.note) lines.push(report.note, '');
  if (report.load?.buckets?.length) {
    lines.push(`Carga por prazo (${report.load.totalDone}/${report.load.totalPlanned} entregues):`);
    report.load.buckets.forEach((b) => lines.push(`• ${b.label}: ${b.planned} tarefa${b.planned === 1 ? '' : 's'}${b.done ? ` (${b.done} entregue${b.done > 1 ? 's' : ''})` : ''}`));
    lines.push('');
  }
  if (report.highlights?.length) { lines.push('Destaques:'); report.highlights.forEach((h) => lines.push(`• ${h}`)); lines.push(''); }
  if (report.split?.rows?.length) {
    lines.push(`${report.split.title}:`);
    report.split.rows.forEach((r) => lines.push(`• ${r.label}: ${r.value}${r.sub ? ` — ${r.sub}` : ''}`));
    lines.push('');
  }
  if (report.timeline?.length) {
    lines.push(report.period === 'monthly' ? 'Por semana:' : 'Por dia:');
    report.timeline.forEach((b) => lines.push(`• ${b.label}: nota ${b.nota == null ? '—' : b.nota.toFixed(1)} · ${b.done}/${b.planned} feitas · ${b.onTimePct ?? '—'}% no prazo`));
    lines.push('');
  }
  if (report.tasks?.length) {
    lines.push('Entregas:');
    report.tasks.forEach((t) => { lines.push(`• ${t.day ? `[${t.day}] ` : ''}${t.chip ? `(${t.chip.label}) ` : ''}${t.title} — ${t.duration}${t.onTime ? '' : ', atrasada'}`); if (t.delivery) lines.push(`  ${t.delivery}`); });
  }
  return lines.join('\n');
}

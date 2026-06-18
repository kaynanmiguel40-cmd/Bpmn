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

// ---------- datas ----------
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthKeyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
const today0 = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };

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
    { title: 'Ligar para o lead Construtora Alfa', min: 25, delivery: 'Conversa de 20min. Dor: não saber o lucro real. Reunião marcada pra quinta.' },
    { title: 'Reunião de fechamento com a Ótica Visão', min: 50, delivery: 'Fechou plano Pro anual. Contrato enviado pra assinatura.' },
    { title: 'Follow-up da proposta da Padaria Pão Quente', min: 20, delivery: 'Reforcei o ROI. Ficou de responder até sexta.' },
    { title: 'Qualificar 5 leads novos do formulário', min: 40, delivery: '3 qualificados (perfil PME), 2 descartados (fora do ICP).' },
    { title: 'Enviar proposta revisada ao Mercado São Jorge', min: 30, delivery: 'Ajustei escopo e preço. Proposta v2 enviada.' },
    { title: 'Demo do sistema pra Construtora Beta', min: 45, delivery: 'Demo de 40min focada em fluxo de caixa. Interesse alto.' },
  ],
  produto: [
    { title: 'Implementar conciliação automática (Banco Inter)', min: 110, delivery: 'Integração no ar, auto-categorizando ~80% dos lançamentos.' },
    { title: 'Corrigir bug no relatório de DRE', min: 40, delivery: '3 contas mal classificadas corrigidas. DRE batendo com o extrato.' },
    { title: 'Ajustar fechamento de balancete', min: 70, delivery: 'Fechamento mensal automatizado e validado em 2 clientes.' },
    { title: 'Criar centro de custos por obra', min: 55, delivery: '6 centros de custo pra separar resultado por obra.' },
    { title: 'Revisar PR do módulo de fluxo de caixa', min: 35, delivery: 'Code review feito, 2 ajustes pedidos e mergeado.' },
    { title: 'Subir release 1.4 em produção', min: 45, delivery: 'Deploy ok, smoke test passou, changelog publicado.' },
  ],
  marketing: [
    { title: 'Produzir 3 criativos da campanha de captação', min: 90, delivery: '1 carrossel + 2 estáticos enviados pra aprovação.' },
    { title: 'Subir campanha de remarketing no Meta', min: 45, delivery: 'Público de visitantes 30d, R$ 40/dia, otimização por leads.' },
    { title: 'Editar reel institucional', min: 75, delivery: 'Reel de 22s com depoimento da Ótica + CTA.' },
    { title: 'Agendar posts educativos da semana', min: 40, delivery: '2 posts sobre fluxo de caixa agendados ter/qui.' },
    { title: 'Otimizar conjuntos de anúncios (CPL)', min: 35, delivery: 'Pausei 2 criativos caros, dupliquei o vencedor. CPL caiu pra R$ 13.' },
    { title: 'Publicar a landing do diagnóstico', min: 60, delivery: 'LP no ar com form integrado ao CRM e pixel validado.' },
  ],
  suporte: [
    { title: 'Onboarding financeiro da Ótica Visão', min: 100, delivery: 'Contas, categorias e fluxo configurados. Cliente já lança sozinho.' },
    { title: 'Treinar cliente no fluxo de caixa', min: 45, delivery: 'Call de 40min. Projeção de 90 dias e alertas de saldo.' },
    { title: 'Resolver chamado de divergência de saldo', min: 30, delivery: 'Lançamento duplicado removido. Causa documentada.' },
    { title: 'Migrar planilha histórica do cliente', min: 95, delivery: '12 meses migrados com saldos de abertura conferidos.' },
    { title: 'Gerar relatório gerencial mensal', min: 45, delivery: 'DRE + fluxo + indicadores. PDF enviado com comentário da margem.' },
    { title: 'Acompanhar implantação da Construtora Alfa', min: 50, delivery: 'Checkpoint semanal. Pendência de extrato resolvida.' },
  ],
};

// ---------- gerador do exemplo: registros de tarefa concluída por dia ----------
const _dayCache = new Map();
function recordsForDay(dateKey) {
  if (_dayCache.has(dateKey)) return _dayCache.get(dateKey);
  const out = [];
  for (const p of PEOPLE) {
    const seed = hashKey(p.id + dateKey);
    const count = 1 + (seed % 3); // 1–3 tarefas por pessoa no dia
    for (let i = 0; i < count; i++) {
      const secId = p.sectors[(seed + i * 7) % p.sectors.length];
      const sector = SECTORS[secId];
      const pool = TASKS[secId];
      const task = pool[(seed + i * 5) % pool.length];
      const onTime = (seed + i) % 7 !== 0;          // ~85% no prazo
      const reviewed = (seed + i) % 2 === 0;          // ~metade revisada
      const approved = reviewed && (seed + i) % 11 !== 0;
      out.push({
        dateKey,
        sector: { id: sector.id, label: sector.label, color: sector.color },
        person: { id: p.id, name: p.name, color: p.color },
        taskText: task.title,
        timeMin: task.min,
        onTime, reviewed, approved,
        delivery: task.delivery,
      });
    }
  }
  _dayCache.set(dateKey, out);
  return out;
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

function tiles(a) {
  return [
    { icon: 'tasks', label: 'Tarefas', value: a.tasksDone, sub: `${a.deliveries} entrega${a.deliveries === 1 ? '' : 's'}`, accent: '#3b82f6' },
    { icon: 'time', label: 'Tempo', value: fmtHM(a.timeMin), sub: 'trabalhado', accent: '#8b5cf6' },
    { icon: 'ontime', label: 'No prazo', value: a.onTimePct == null ? '—' : `${a.onTimePct}%`, sub: a.late ? `${a.late} atrasada${a.late > 1 ? 's' : ''}` : 'tudo no prazo', accent: '#f59e0b' },
    { icon: 'quality', label: 'Aprovadas', value: a.approvedPct == null ? '—' : `${a.approvedPct}%`, sub: a.reviewed ? `${a.reviewed} revisada${a.reviewed > 1 ? 's' : ''}` : 'sem revisão', accent: '#10b981' },
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
    title: r.taskText, duration: fmtHM(r.timeMin),
    onTime: r.onTime, approved: r.approved, delivery: r.delivery,
    chip, day: day || null,
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

  // breakdown: por dia (semanal) ou por semana (mensal)
  let breakdown = null;
  if (period === 'weekly') {
    breakdown = byDay.filter((d) => d.records.length).map((d) => {
      const da = aggregate(d.records);
      return { label: shortDay(d.key), value: `${da.tasksDone} tarefas · ${fmtHM(da.timeMin)}`, sub: `${da.onTimePct ?? '—'}% no prazo` };
    });
  } else if (period === 'monthly') {
    const groups = new Map();
    for (const d of byDay) { const mk = mondayOf(d.key); if (!groups.has(mk)) groups.set(mk, []); groups.get(mk).push(...d.records); }
    breakdown = [...groups.entries()].filter(([, recs]) => recs.length).map(([mk, recs]) => {
      const wa = aggregate(recs);
      return { label: `Semana de ${ddmm(mk)}`, value: `${wa.tasksDone} tarefas · ${fmtHM(wa.timeMin)}`, sub: `${wa.onTimePct ?? '—'}% no prazo` };
    });
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

  return {
    kind: 'operacao', period, lens,
    metrics: tiles(a), highlights, breakdown, tasks, note,
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
  if (report.highlights?.length) { lines.push('Destaques:'); report.highlights.forEach((h) => lines.push(`• ${h}`)); lines.push(''); }
  if (report.breakdown?.length) {
    lines.push(report.period === 'monthly' ? 'Por semana:' : 'Por dia:');
    report.breakdown.forEach((b) => lines.push(`• ${b.label}: ${b.value}${b.sub ? ` — ${b.sub}` : ''}`));
    lines.push('');
  }
  if (report.tasks?.length) {
    lines.push('Entregas:');
    report.tasks.forEach((t) => { lines.push(`• ${t.day ? `[${t.day}] ` : ''}${t.chip ? `(${t.chip.label}) ` : ''}${t.title} — ${t.duration}${t.onTime ? '' : ', atrasada'}`); if (t.delivery) lines.push(`  ${t.delivery}`); });
  }
  return lines.join('\n');
}

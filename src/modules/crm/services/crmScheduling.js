/**
 * crmScheduling — acha horario livre pra agendar as tarefas do processo.
 *
 * Regras da casa:
 *   - Expediente das 9h as 18h.
 *   - Almoco das 11h as 12h (nao agenda nada).
 *   - Nao encosta em atividade que ja existe na agenda da pessoa.
 *
 * As funcoes aqui sao PURAS de proposito (nao tocam banco): a regra de horario
 * e o que mais quebra em silencio, entao da pra testar sem mock nenhum.
 */

/**
 * Canal do toque a partir do titulo do passo: ligacao, WhatsApp ou e-mail.
 *
 * Fonte UNICA dessa regra — usada pelo icone do checklist E pelo `type` da
 * atividade criada na Agenda. Duplicar em dois lugares faria o icone da Agenda
 * discordar do icone do checklist pro mesmo toque.
 */
export function stepChannel(title) {
  const t = (title || '').toLowerCase();
  if (/e-?mail/.test(t)) return 'email';
  if (/liga|ligar|ligacao|ligação|telefone/.test(t)) return 'call';
  if (/whats|audio|áudio|mensagem|dm|material|cartilha|video|vídeo/.test(t)) return 'message';
  if (/reuni|demo/.test(t)) return 'meeting';
  return 'task';
}

export const WORK_START_HOUR = 9;
export const WORK_END_HOUR = 18;
export const LUNCH_START_HOUR = 11;
export const LUNCH_END_HOUR = 12;
// Tamanho do slot = duracao de UM toque de cadencia E o passo da grade. 10min:
// realista pro toque (a ligacao e ~5min, mais folga pra anotar) e ~48/dia, backlog
// enxuto. O calendario foi ajustado (GRID_HOUR_PX no CrmCalendar) pra desenhar
// toque de 10min sem conflito — grade de 30min desperdicava, a de 5min nao cabia.
// Reuniao/visita/almoco tem duracao propria (scheduleMeetingForDeal passa 60min);
// o findFreeSlot ciente de duracao reserva o bloco inteiro.
export const SLOT_MINUTES = 10;
// Ate quantos dias uteis empurrar quando o dia alvo lota.
export const MAX_ROLLOVER_DAYS = 60;
// Folga MINIMA (inicio-a-inicio) entre dois toques DO MESMO LEAD no mesmo dia.
// 3h ESPALHA pelo dia em vez de so descolar: comecando 9h, os toques caem 9:00,
// 12:00, 15:00 — manha / meio-dia / tarde ("cafe da manha, almoco, cafe da
// tarde", nas palavras da vendedora). O 4o do dia estoura as 18h e rola pro dia
// seguinte, entao um lead ganha no maximo ~3 toques/dia, bem distribuidos. Sem
// isso, quando a agenda enche e varios offsets colapsam num dia, o lead ganhava
// 3-4 tarefas coladas ("Paulo 12:00, Paulo 12:30, Paulo 13:00").
export const GAP_MESMO_LEAD = 180;

/**
 * Todos os inicios de slot possiveis num dia, em minutos desde 00:00.
 *
 * `period` prende o toque a um turno: 'manha' (antes do almoco) ou 'tarde'
 * (depois). Sem isso, duas ligacoes do mesmo dia — a "de manha" e a "de tarde"
 * — cairiam as duas de manha, porque o agendador so pega o primeiro slot vago.
 */
export function daySlots(period = null) {
  const from = period === 'tarde' ? LUNCH_END_HOUR * 60 : WORK_START_HOUR * 60;
  const to = period === 'manha' ? LUNCH_START_HOUR * 60 : WORK_END_HOUR * 60;
  const slots = [];
  for (let m = from; m + SLOT_MINUTES <= to; m += SLOT_MINUTES) {
    // Almoco: descarta qualquer slot que comece dentro da janela OU que
    // invada ela (um slot que comeca 10:45 e termina 11:15 nao serve).
    const end = m + SLOT_MINUTES;
    if (end > LUNCH_START_HOUR * 60 && m < LUNCH_END_HOUR * 60) continue;
    slots.push(m);
  }
  return slots;
}

const toMinutes = (iso) => {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
};

/**
 * Primeiro slot livre de um dia.
 *
 * @param {Array<{start:string,end?:string}>} busy  atividades que ja existem NO DIA
 * @param {number} afterMinutes  nao devolve slot antes disso (pra empilhar
 *   varias tarefas do mesmo dia sem repetir horario)
 * @returns {number|null} minuto de inicio, ou null se o dia lotou
 */
export function findFreeSlot(busy = [], afterMinutes = -1, period = null, durationMin = SLOT_MINUTES) {
  const taken = (busy || []).map(b => {
    const start = toMinutes(b.start);
    const end = b.end ? toMinutes(b.end) : start + SLOT_MINUTES;
    return [start, end > start ? end : start + SLOT_MINUTES];
  });

  for (const slot of daySlots(period)) {
    if (slot <= afterMinutes) continue;
    const slotEnd = slot + durationMin;
    // O BLOCO INTEIRO tem que caber: um compromisso de 1h+ nao pode passar das
    // 18h nem invadir o almoco so porque o slot de INICIO (30min) coube. daySlots
    // ja garante isso pra 30min; pra blocos maiores a checagem vem aqui — senao a
    // cauda da tarefa longa atropela o proximo compromisso ou vaza do expediente.
    if (slotEnd > WORK_END_HOUR * 60) continue;
    if (slotEnd > LUNCH_START_HOUR * 60 && slot < LUNCH_END_HOUR * 60) continue;
    const conflita = taken.some(([s, e]) => slot < e && slotEnd > s);
    if (!conflita) return slot;
  }
  return null;
}

/**
 * Slots livres pra um compromisso de `durationMin` num dia.
 *
 * Diferente de daySlots/findFreeSlot (que pensam em toques de 30 min): uma
 * reuniao ocupa um BLOCO. Um slot de 60 min comecando 10:30 invadiria o almoco
 * (10:30-11:30 pega as 11:00), e comecando 17:30 passaria das 18h. Aqui o bloco
 * inteiro tem que caber — dentro do expediente, fora do almoco, sem colidir com
 * o que ja existe na agenda.
 *
 * @param {Array<{start:string,end?:string}>} busy  compromissos ja no dia
 * @param {number} durationMin  duracao do bloco
 * @returns {number[]} minutos de inicio possiveis, em ordem
 */
export function meetingSlots(busy = [], durationMin = 60) {
  const taken = (busy || []).map(b => {
    const s = toMinutes(b.start);
    const e = b.end ? toMinutes(b.end) : s + SLOT_MINUTES;
    return [s, e > s ? e : s + SLOT_MINUTES];
  });
  const lunchS = LUNCH_START_HOUR * 60;
  const lunchE = LUNCH_END_HOUR * 60;
  const out = [];
  for (let m = WORK_START_HOUR * 60; m + durationMin <= WORK_END_HOUR * 60; m += SLOT_MINUTES) {
    const end = m + durationMin;
    if (end > lunchS && m < lunchE) continue;                 // invade o almoco
    if (taken.some(([s, e]) => m < e && end > s)) continue;   // colide com algo
    out.push(m);
  }
  return out;
}

/**
 * Horario de um lembrete ancorado numa reuniao.
 *
 * `offsetMin` = minutos relativos ao inicio da reuniao (negativo = antes).
 *
 * SNAP DA VESPERA: um lembrete que cai em OUTRO dia antes da reuniao vira 9h da
 * manha daquele dia. "Confirmar presenca na vespera" e tarefa de manha, nao 24h
 * cravadas antes de uma reuniao das 15h (que cairia 15h da vespera). Lembrete do
 * MESMO dia (1h antes, na hora) fica no ponto exato.
 *
 * @returns {Date}
 */
export function horarioLembrete(meetingStart, offsetMin) {
  const base = new Date(meetingStart);
  const t = new Date(base.getTime() + offsetMin * 60000);
  const outroDia = t.toDateString() !== base.toDateString();
  if (outroDia && t < base) {
    return new Date(t.getFullYear(), t.getMonth(), t.getDate(), 9, 0, 0);
  }
  return t;
}

/** Data com o horario cravado no minuto do dia (local). */
export function atMinutes(date, minutes) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setMinutes(minutes);
  return d;
}

/** Pula fim de semana — ninguem trabalha lead no sabado. */
export function nextBusinessDay(date) {
  const d = new Date(date);
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  return d;
}

/**
 * Distribui os passos de uma etapa em datas/horas livres.
 *
 * @param {Array<{id:string,title:string,dayOffset:number}>} steps  na ordem
 * @param {Object} busyByDay  { 'YYYY-MM-DD': [{start,end}] } ja ocupado
 * @param {Date} from  data de referencia (entrada na etapa)
 * @returns {Array<{stepId:string,start:Date}>}  so os que couberam
 */
export function planSteps(steps, busyByDay = {}, from = new Date()) {
  const out = [];
  // Copia local do ocupado — cada tarefa agendada ocupa o slot pras seguintes,
  // senao duas tarefas do mesmo dia cairiam no mesmo horario.
  const busy = {};
  Object.entries(busyByDay).forEach(([k, v]) => { busy[k] = [...(v || [])]; });

  // Piso do "agora": tarefa do dia 0 nao pode nascer no passado. Um lead que
  // entra na etapa as 15h ganhava o toque de hoje as 9h — ja atrasado no
  // instante em que foi criado, entrando direto na fila de atrasadas.
  const hojeKey = dayKey(from);
  const agoraMin = from.getHours() * 60 + from.getMinutes() + 15; // 15min de folga

  // Piso de DIA: um passo nunca cai antes do passo anterior. Sem isso, quando a
  // agenda esta cheia, o D2 rola pra frente atravessando os dias lotados e cai
  // depois do D9 (que achou vaga antes) — a cadencia sai fora de ordem. Os
  // passos ja vem em ordem de dayOffset, entao basta impedir retroceder.
  let pisoDia = null;
  let ultimoStart = null; // ultimo toque JA colocado deste lead

  for (const step of steps) {
    let target = nextBusinessDay(
      atMinutes(new Date(from.getFullYear(), from.getMonth(), from.getDate() + (step.dayOffset || 0)), 0),
    );
    // Nao deixa o alvo ser antes do dia do passo anterior.
    if (pisoDia && target.getTime() < pisoDia.getTime()) target = new Date(pisoDia);

    // Dia cheio EMPURRA pra frente em vez de descartar a tarefa: com varios
    // leads na mesma etapa o dia alvo lota rapido (16 slots uteis por dia) e
    // dropar em silencio deixaria lead sem cadencia nenhuma.
    let slot = null;
    let key = dayKey(target);
    for (let i = 0; i <= MAX_ROLLOVER_DAYS; i++) {
      key = dayKey(target);
      // So o dia de HOJE tem piso de horario; nos dias seguintes o expediente
      // comeca as 9h normalmente.
      let piso = key === hojeKey ? agoraMin : -1;
      // Nao encosta dois toques do MESMO LEAD: se este passo cair no mesmo dia do
      // anterior, ele fica a pelo menos GAP do anterior (deixa vao pra outro lead).
      if (ultimoStart && dayKey(ultimoStart) === key) {
        const ultimoMin = ultimoStart.getHours() * 60 + ultimoStart.getMinutes();
        piso = Math.max(piso, ultimoMin + GAP_MESMO_LEAD - 1);
      }
      slot = findFreeSlot(busy[key] || [], piso, step.period || null);
      if (slot !== null) break;
      target = nextBusinessDay(new Date(target.getFullYear(), target.getMonth(), target.getDate() + 1));
    }
    if (slot === null) continue;

    const start = atMinutes(target, slot);
    out.push({ stepId: step.id, start });
    // O proximo passo nao pode cair antes deste dia.
    pisoDia = new Date(target.getFullYear(), target.getMonth(), target.getDate());
    ultimoStart = start;
    (busy[key] = busy[key] || []).push({
      start: start.toISOString(),
      end: new Date(start.getTime() + SLOT_MINUTES * 60000).toISOString(),
    });
  }
  return out;
}

export function dayKey(date) {
  const d = new Date(date);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

// ==================== REBALANCEAMENTO POR PRIORIDADE ====================

/**
 * Redistribui as tarefas pendentes pela PRIORIDADE do lead, nao pela ordem em
 * que foram agendadas.
 *
 * O problema que isto resolve: a cadencia agenda tudo no momento em que o lead
 * entra na etapa, e nunca mais reavalia. Ai a realidade muda — o Pablo liga
 * dizendo "quero fechar agora", ou o Joao manda parar de ligar — e a agenda
 * continua servindo a ordem de ontem. A fila fica cheia de trabalho na ordem
 * errada, e quem importa espera atras de quem nao importa.
 *
 * REGRAS, e o motivo de cada uma:
 *
 * 1. A ORDEM DO KANBAN MANDA; A ESTRELA DESEMPATA. Sao dois eixos diferentes:
 *    `rank` (a posicao na coluna) e PRIORIDADE — a decisao explicita de quem
 *    se atende antes; `priority` (as estrelas) e QUALIDADE — o quanto o lead
 *    vale. Quem arrastou o card pro topo decidiu, e essa decisao vence: o
 *    Pablo ligando "quero fechar agora" sobe pro topo e passa na frente, tendo
 *    duas estrelas ou cinco. A estrela so resolve empate entre leads na mesma
 *    altura da coluna.
 *
 * 2. MAS NINGUEM VIAJA NO TEMPO. Cada tarefa tem um `notBefore` — o dia que a
 *    cadencia quis (D0, D1, D3, D7...). Prioridade alta NAO puxa o follow-up de
 *    D7 pra hoje: o espacamento existe pra dar respiro ao lead, e comprimir por
 *    ansiedade e o oposto de cadencia. Prioridade decide a ORDEM entre as
 *    elegiveis, nao antecipa o que ainda nao amadureceu.
 *
 * 3. A ORDEM DENTRO DO LEAD E SAGRADA. `seq` desempata: o 2o toque de um lead
 *    nunca cai antes do 1o, por mais estrelas que ele tenha.
 *
 * 4. BURACO SE FECHA. Como cada tarefa pega o PRIMEIRO slot livre a partir do
 *    seu notBefore, cancelar um lead (o "para de me ligar") faz as seguintes
 *    subirem sozinhas — nao ha lacuna a varrer, ela simplesmente nao e
 *    escolhida por ninguem.
 *
 * Puro de proposito: sem banco, sem relogio proprio. O `from` entra por
 * parametro pra que o teste consiga fixar "hoje".
 *
 * @param {Array} tarefas  [{ id, dealId, rank, priority, notBefore: Date|null,
 *                           period: 'manha'|'tarde'|null, seq: number,
 *                           duracaoMin?: number }]
 * @param {{ from?: Date, busyByDay?: Object }} opts
 *   `busyByDay` = compromissos que NAO entram no rebalanceamento (reuniao
 *   marcada, evento do Google): eles ocupam slot mas nao sao remanejados.
 * @returns {Array<{ id, start: Date, movida: boolean }>}
 */
export function rebalanceQueue(tarefas, { from = new Date(), busyByDay = {} } = {}) {
  const lista = (tarefas || []).filter(t => t?.id);
  if (lista.length === 0) return [];

  // Copia: o algoritmo ocupa slots conforme decide, e nao pode sujar a entrada.
  const busy = {};
  Object.entries(busyByDay).forEach(([k, v]) => { busy[k] = [...(v || [])]; });

  const hojeKey = dayKey(from);
  const agoraMin = from.getHours() * 60 + from.getMinutes() + 15;
  const inicioDoDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const hoje = inicioDoDia(from);

  const ordenada = [...lista].sort((a, b) => {
    // 1. quem esta mais em cima na coluna (menor rank) escolhe primeiro
    const r = (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER);
    if (r !== 0) return r;
    // 2. empatados na coluna: mais estrelas primeiro
    const p = (b.priority ?? 0) - (a.priority ?? 0);
    if (p !== 0) return p;
    // 3. quem amadureceu antes vai antes
    const na = a.notBefore ? inicioDoDia(a.notBefore).getTime() : 0;
    const nb = b.notBefore ? inicioDoDia(b.notBefore).getTime() : 0;
    if (na !== nb) return na - nb;
    // 4. ordem original do lead
    return (a.seq ?? 0) - (b.seq ?? 0);
  });

  // Ultimo slot dado a cada lead: garante a regra 3 mesmo quando duas tarefas
  // do mesmo lead disputam o mesmo dia.
  const ultimoDoLead = new Map();
  const saida = [];

  for (const t of ordenada) {
    // Nao antes do que a cadencia quis, nem antes de agora.
    let alvo = t.notBefore && inicioDoDia(t.notBefore) > hoje ? inicioDoDia(t.notBefore) : hoje;
    const anterior = ultimoDoLead.get(t.dealId);
    if (anterior && inicioDoDia(anterior) > alvo) alvo = inicioDoDia(anterior);

    let dia = nextBusinessDay(alvo);
    let slot = null;
    let key = dayKey(dia);

    for (let i = 0; i <= MAX_ROLLOVER_DAYS; i++) {
      key = dayKey(dia);
      // Piso do dia: hoje respeita o relogio; no dia do toque anterior do mesmo
      // lead, respeita aquele horario (dois toques no mesmo dia nao invertem).
      let piso = key === hojeKey ? agoraMin : -1;
      if (anterior && dayKey(anterior) === key) {
        piso = Math.max(piso, anterior.getHours() * 60 + anterior.getMinutes());
      }
      slot = findFreeSlot(busy[key] || [], piso, t.period || null);
      if (slot !== null) break;
      dia = nextBusinessDay(new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() + 1));
    }
    if (slot === null) continue; // nao coube em 60 dias uteis: fica onde esta

    const start = atMinutes(dia, slot);
    const dur = t.duracaoMin || SLOT_MINUTES;
    (busy[key] = busy[key] || []).push({
      start: start.toISOString(),
      end: new Date(start.getTime() + dur * 60000).toISOString(),
    });
    ultimoDoLead.set(t.dealId, start);
    saida.push({
      id: t.id,
      start,
      // `movida` deixa a tela mostrar SO o que muda — rebalancear 300 tarefas e
      // avisar "300 alteradas" quando 4 mudaram de lugar seria alarme falso.
      movida: !t.startDate || new Date(t.startDate).getTime() !== start.getTime(),
    });
  }

  return saida;
}

// ==================== EMPURRAO POR EMERGENCIA ====================

/**
 * Insere um bloco EMERGENCIAL ("faz agora") e empurra as tarefas flexiveis do
 * dia pra frente, em cascata.
 *
 * Diferente do rebalanceamento por prioridade: aqui NAO reordena nada por
 * estrela nem por rank. Mantem a ordem cronologica que ja existe e so DESCE quem
 * foi atropelado — cada tarefa cai no primeiro slot livre a partir do SEU proprio
 * horario original (nunca anda pra tras). Isso preenche buraco de proposito: se o
 * slot original da tarefa continua livre, ela nao se mexe; a cascata para quando
 * o primeiro buraco a absorve.
 *
 * `fixosByDay` = intransponiveis: o proprio bloco emergencial, a hora marcada
 * (reuniao/visita/almoco) e o que estiver em dias futuros. Eles ocupam slot mas
 * nunca sao movidos — tarefa flexivel que esbarra num deles pula por cima. Dia
 * lotado rola pro proximo dia util (MAX_ROLLOVER_DAYS), igual a cadencia.
 *
 * Puro de proposito (sem banco, sem relogio): `desde` entra por parametro pra o
 * teste fixar o instante do bloco.
 *
 * @param {Array<{id:string,start:Date|string,durMin?:number,period?:string}>} mover
 *   as tarefas flexiveis candidatas a descer (a partir de `desde`)
 * @param {Object} fixosByDay  { 'YYYY-MM-DD': [{start,end}] } imoveis
 * @param {Date} desde  inicio do bloco emergencial — piso global, nada cai antes
 * @returns {Array<{id:string,start:Date,movida:boolean}>}
 */
export function empurrarFila(mover, fixosByDay = {}, desde) {
  const lista = (mover || [])
    .filter(t => t?.id && t.start)
    .map(t => ({ ...t, start: new Date(t.start) }))
    // A partir do bloco: o que ja passou de manha nao entra no empurrao.
    .filter(t => t.start.getTime() >= desde.getTime())
    .sort((a, b) => a.start - b.start);
  if (lista.length === 0) return [];

  // Copia do ocupado — o algoritmo reserva slot conforme decide e nao pode sujar
  // a entrada.
  const busy = {};
  Object.entries(fixosByDay).forEach(([k, v]) => { busy[k] = [...(v || [])]; });

  const inicioDoDia = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const minutosDe = (d) => d.getHours() * 60 + d.getMinutes();
  const desdeKey = dayKey(desde);
  const desdeMin = minutosDe(desde);

  const saida = [];
  let ultimo = null; // ultimo slot dado — mantem a cascata em ordem

  for (const t of lista) {
    const orig = t.start;
    const dur = t.durMin || SLOT_MINUTES;

    // FAST-PATH: se a posicao ORIGINAL nao colide com nada ja reservado (o bloco,
    // hora marcada, ou tarefas ja recolocadas), a tarefa NAO foi atropelada — fica
    // exatamente onde esta, mesmo fora da grade canonica (18:30, 11:30). Sem isto,
    // toda tarefa era forcada pra grade 9-18 e uma que ja estava fora pulava de dia
    // sem ter colidido com ninguem — contrariando "so desce quem foi atropelado".
    const origKey = dayKey(orig);
    const os = orig.getTime();
    const oe = os + dur * 60000;
    const colideOrig = (busy[origKey] || []).some(b => {
      const bs = new Date(b.start).getTime();
      const be = b.end ? new Date(b.end).getTime() : bs + SLOT_MINUTES * 60000;
      return os < be && oe > bs;
    });
    if (!colideOrig) {
      (busy[origKey] = busy[origKey] || []).push({ start: orig.toISOString(), end: new Date(oe).toISOString() });
      ultimo = orig;
      saida.push({ id: t.id, start: orig, movida: false });
      continue;
    }

    // Colidiu: desce pro primeiro slot livre a partir do proprio horario. Comeca a
    // busca no dia da tarefa (ou no dia do ultimo colocado, se for depois — a
    // cascata nunca volta pra um dia ja passado).
    let base = inicioDoDia(orig);
    if (ultimo && inicioDoDia(ultimo) > base) base = inicioDoDia(ultimo);
    let dia = nextBusinessDay(base);

    let slot = null;
    let key = dayKey(dia);
    for (let i = 0; i <= MAX_ROLLOVER_DAYS; i++) {
      key = dayKey(dia);
      // Piso de horario do dia. So vale no dia certo:
      //  - dia original: nao anda pra tras do proprio horario;
      //  - dia do bloco: nao cai antes do bloco emergencial;
      //  - dia do ultimo colocado: cai depois dele (ordem da cascata).
      let X = -Infinity;
      if (key === dayKey(orig)) X = Math.max(X, minutosDe(orig));
      if (key === desdeKey) X = Math.max(X, desdeMin);
      if (ultimo && dayKey(ultimo) === key) X = Math.max(X, minutosDe(ultimo) + 1);
      const piso = X === -Infinity ? -1 : X - 1;

      // Duracao real: o slot tem que caber o bloco INTEIRO (senao a tarefa longa
      // atravessa a hora marcada seguinte ou vaza das 18h).
      slot = findFreeSlot(busy[key] || [], piso, t.period || null, dur);
      if (slot !== null) break;
      dia = nextBusinessDay(new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() + 1));
    }
    if (slot === null) continue; // nao coube em 60 dias uteis: fica onde esta

    const start = atMinutes(dia, slot);
    (busy[key] = busy[key] || []).push({
      start: start.toISOString(),
      end: new Date(start.getTime() + dur * 60000).toISOString(),
    });
    ultimo = start;
    saida.push({ id: t.id, start, movida: orig.getTime() !== start.getTime() });
  }

  return saida;
}

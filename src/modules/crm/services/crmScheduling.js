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
export const SLOT_MINUTES = 30;
// Ate quantos dias uteis empurrar quando o dia alvo lota.
export const MAX_ROLLOVER_DAYS = 60;

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
export function findFreeSlot(busy = [], afterMinutes = -1, period = null) {
  const taken = (busy || []).map(b => {
    const start = toMinutes(b.start);
    const end = b.end ? toMinutes(b.end) : start + SLOT_MINUTES;
    return [start, end > start ? end : start + SLOT_MINUTES];
  });

  for (const slot of daySlots(period)) {
    if (slot <= afterMinutes) continue;
    const slotEnd = slot + SLOT_MINUTES;
    const conflita = taken.some(([s, e]) => slot < e && slotEnd > s);
    if (!conflita) return slot;
  }
  return null;
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

  for (const step of steps) {
    let target = nextBusinessDay(
      atMinutes(new Date(from.getFullYear(), from.getMonth(), from.getDate() + (step.dayOffset || 0)), 0),
    );

    // Dia cheio EMPURRA pra frente em vez de descartar a tarefa: com varios
    // leads na mesma etapa o dia alvo lota rapido (16 slots uteis por dia) e
    // dropar em silencio deixaria lead sem cadencia nenhuma.
    let slot = null;
    let key = dayKey(target);
    for (let i = 0; i <= MAX_ROLLOVER_DAYS; i++) {
      key = dayKey(target);
      // So o dia de HOJE tem piso de horario; nos dias seguintes o expediente
      // comeca as 9h normalmente.
      const piso = key === hojeKey ? agoraMin : -1;
      slot = findFreeSlot(busy[key] || [], piso, step.period || null);
      if (slot !== null) break;
      target = nextBusinessDay(new Date(target.getFullYear(), target.getMonth(), target.getDate() + 1));
    }
    if (slot === null) continue;

    const start = atMinutes(target, slot);
    out.push({ stepId: step.id, start });
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

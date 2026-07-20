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
      slot = findFreeSlot(busy[key] || [], -1, step.period || null);
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

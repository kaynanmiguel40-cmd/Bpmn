/**
 * stepLabel — transforma o titulo cru do passo do playbook em algo que se le
 * batendo o olho.
 *
 * O titulo no banco e jargao de seed: "D2 13h — Ligação 3 (almoço)". O "D2" e
 * dado (o `day_offset` da migration 094 foi parseado dali), nao texto pra
 * humano — e a palavra que mais importa na linha ("Ligar") fica escondida atras
 * de um prefixo que nao diz nada pra quem vai executar.
 *
 * Regra: a MANCHETE e o verbo do canal + o nome do lead ("Ligar para Padaria do
 * João"). O resto do titulo vira detalhe secundario.
 */

import { stepChannel } from '../services/crmScheduling';

// Verbo por canal. Imperativo: a linha diz o que FAZER, nao o que a coisa e.
export const CHANNEL_VERB = {
  call: 'Ligar',
  message: 'Mandar WhatsApp',
  email: 'Mandar e-mail',
  meeting: 'Reunião',
  visit: 'Visita',
  follow_up: 'Follow-up',
  task: 'Fazer',
};

/** Tira o prefixo de agendamento ("D2 13h — ", "D1 manhã — ") do titulo. */
export function cleanStepTitle(title) {
  return (title || '')
    .replace(/^D\d+\s*(manh[ãa]|tarde|\d{1,2}h)?\s*[—–-]\s*/i, '')
    .trim();
}

/**
 * Manchete da tarefa: "Ligar para Padaria do João".
 *
 * Sem lead (tarefa avulsa criada a mao) devolve o titulo como esta — nao ha
 * verbo de canal a inferir e inventar um seria pior que o texto do usuario.
 */
export function taskHeadline(title, leadName) {
  if (!leadName) return title || 'Tarefa';
  const verb = CHANNEL_VERB[stepChannel(title)] || CHANNEL_VERB.task;
  // "Ligar para X" / "Mandar WhatsApp para X" — mas "Reunião com X".
  const prep = stepChannel(title) === 'meeting' ? 'com' : 'para';
  return `${verb} ${prep} ${leadName}`;
}

/** Detalhe secundario: o que sobrou do titulo depois de tirar o prefixo. */
export function taskDetail(title) {
  return cleanStepTitle(title);
}

/**
 * "há 3 dias", "ontem", "hoje" — distancia em DIAS, nao em horas.
 *
 * Atraso e contado por dia de proposito: a ligacao das 9h nao pode ficar
 * vermelha as 9h01 com a pessoa ainda no telefone. Alem de ser injusto, obriga
 * um timer de re-render pra tela nao mentir.
 */
export function relativeDayLabel(iso, now = new Date()) {
  if (!iso) return '';
  const d = new Date(iso);
  const dia = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((dia(now) - dia(d)) / 86400000);
  if (diff === 0) return 'hoje';
  if (diff === 1) return 'ontem';
  if (diff > 1) return `há ${diff} dias`;
  if (diff === -1) return 'amanhã';
  return `em ${Math.abs(diff)} dias`;
}

/** Atrasada = pendente cujo DIA agendado ja passou. */
export function isOverdue(activity, now = new Date()) {
  if (!activity || activity.completed || !activity.startDate) return false;
  const d = new Date(activity.startDate);
  const hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return d < hoje;
}

/** Corte entre atrasada recuperavel e "toque frio" (decisao do dono: 7 dias). */
export const COLD_AFTER_DAYS = 7;

export function isCold(activity, now = new Date()) {
  if (!isOverdue(activity, now)) return false;
  const d = new Date(activity.startDate);
  const dia = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  return Math.round((dia(now) - dia(d)) / 86400000) > COLD_AFTER_DAYS;
}

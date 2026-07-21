/**
 * Monta os dias com horarios livres pro modal de marcar reuniao.
 *
 * Pura de proposito: recebe a agenda ocupada e devolve a grade. Toda a regra de
 * expediente/almoco/colisao mora em crmScheduling.meetingSlots — aqui so agrupa
 * por dia e pula fim de semana.
 */
import { meetingSlots } from '../services/crmScheduling';

const UM_DIA = 86400000;

/** 'YYYY-MM-DD' local (nao UTC — o dia do vendedor e o dia local dele). */
export function chaveDoDia(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * @param {Array<{start:string,end?:string}>} busy  agenda ocupada do dono
 * @param {object} opts
 * @param {Date}   opts.from        a partir de quando (default agora)
 * @param {number} opts.dias        quantos dias UTEIS montar (default 10)
 * @param {number} opts.durationMin duracao da reuniao (default 60)
 * @returns {Array<{ chave, data: Date, slots: Array<{ minuto, iso, label }> }>}
 *   so dias com pelo menos um slot livre.
 */
export function montarDiasComSlots(busy = [], { from = new Date(), dias = 10, durationMin = 60 } = {}) {
  // Agrupa o ocupado por dia uma vez.
  const ocupadoPorDia = {};
  for (const b of busy || []) {
    if (!b.start) continue;
    const k = chaveDoDia(new Date(b.start));
    (ocupadoPorDia[k] = ocupadoPorDia[k] || []).push(b);
  }

  const agora = from.getTime();
  const out = [];
  const cursor = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  // Varre ate achar `dias` uteis com vaga (teto de 30 dias corridos pra nao
  // rodar pra sempre se tudo estiver lotado).
  for (let i = 0; i < 30 && out.length < dias; i++) {
    const dia = new Date(cursor.getTime() + i * UM_DIA);
    const dow = dia.getDay();
    if (dow === 0 || dow === 6) continue; // fim de semana

    const k = chaveDoDia(dia);
    const livres = meetingSlots(ocupadoPorDia[k] || [], durationMin);
    const slots = [];
    for (const minuto of livres) {
      const iso = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate(),
        Math.floor(minuto / 60), minuto % 60, 0);
      // Hoje: nao oferece horario que ja passou.
      if (iso.getTime() <= agora) continue;
      const hh = String(Math.floor(minuto / 60)).padStart(2, '0');
      const mm = String(minuto % 60).padStart(2, '0');
      slots.push({ minuto, iso: iso.toISOString(), label: `${hh}:${mm}` });
    }
    if (slots.length > 0) out.push({ chave: k, data: dia, slots });
  }
  return out;
}

/** "seg, 21/07" — rotulo curto do chip de dia. */
export function rotuloDoDia(d) {
  const semana = d.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  const dm = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  return `${semana}, ${dm}`;
}

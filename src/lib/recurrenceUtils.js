/**
 * recurrenceUtils.js - Expansao de eventos recorrentes no client-side
 *
 * Evento pai armazenado no banco com campos de recorrencia.
 * Ocorrencias sao geradas dinamicamente para o range visivel.
 * Excecoes (editadas/excluidas) ficam em recurrenceExceptions do pai.
 */

/**
 * Formata data como YYYY-MM-DD para comparar com exceptions
 */
export function toDateKey(date) {
  const d = date instanceof Date ? date : new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Avanca uma data por 1 passo conforme tipo de recorrencia
 */
function advanceDate(date, recurrenceType, config) {
  const d = new Date(date);
  const interval = config.interval || 1;

  switch (recurrenceType) {
    case 'daily':
      d.setDate(d.getDate() + interval);
      break;
    case 'weekly':
      d.setDate(d.getDate() + 7 * interval);
      break;
    case 'monthly': {
      const targetDay = d.getDate();
      d.setMonth(d.getMonth() + interval);
      // Clamp ao ultimo dia do mes (ex: 31 jan -> 28 fev)
      if (d.getDate() < targetDay) {
        d.setDate(0); // volta pro ultimo dia do mes anterior
      }
      break;
    }
    case 'yearly':
      d.setFullYear(d.getFullYear() + interval);
      break;
    case 'custom':
      // Custom usa weekly com daysOfWeek especificos
      d.setDate(d.getDate() + 1);
      break;
    default:
      d.setDate(d.getDate() + 1);
  }

  return d;
}

/**
 * Para tipo 'custom' com daysOfWeek, encontra o proximo dia valido
 */
function nextValidDay(date, daysOfWeek, interval) {
  if (!daysOfWeek || daysOfWeek.length === 0) return date;

  const d = new Date(date);
  // Avanca ate encontrar um dia valido dentro das semanas com intervalo
  const startWeek = getWeekNumber(date);
  const maxIterations = 7 * interval * 2 + 7; // seguranca contra loop infinito

  for (let i = 0; i < maxIterations; i++) {
    if (daysOfWeek.includes(d.getDay())) {
      // Verifica se esta na semana correta (respeita intervalo)
      const weekDiff = getWeekNumber(d) - startWeek;
      if (weekDiff >= 0 && weekDiff % interval === 0) {
        return d;
      }
    }
    d.setDate(d.getDate() + 1);
  }

  return d;
}

/**
 * Numero da semana ISO simplificado (para calculo de intervalo)
 */
function getWeekNumber(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

/**
 * Gera ocorrencias virtuais de um evento recorrente dentro de um range
 */
function generateOccurrences(event, rangeStart, rangeEnd) {
  const occurrences = [];
  const eventStart = new Date(event.startDate);
  const eventEnd = new Date(event.endDate);
  const duration = eventEnd - eventStart; // duracao em ms

  const config = event.recurrenceConfig || { interval: 1 };
  const endType = event.recurrenceEndType || 'never';
  const endValue = event.recurrenceEndValue;

  let maxCount = Infinity;
  let endDate = null;

  if (endType === 'after' && endValue) {
    maxCount = parseInt(endValue) || Infinity;
  } else if (endType === 'on_date' && endValue) {
    endDate = new Date(endValue);
    endDate.setHours(23, 59, 59, 999);
  }

  let current = new Date(eventStart);
  let count = 0;

  // Limite de seguranca: max 365 ocorrencias ou 2 anos
  const safetyLimit = 365;
  const safetyDate = new Date(rangeEnd);
  safetyDate.setFullYear(safetyDate.getFullYear() + 2);

  while (count < safetyLimit) {
    // Checar limites de termino
    if (count >= maxCount) break;
    if (endDate && current > endDate) break;
    if (current > safetyDate) break;

    // Para weekly/custom com daysOfWeek, pular dias invalidos
    const hasDaysOfWeek = (event.recurrenceType === 'weekly' || event.recurrenceType === 'custom') && config.daysOfWeek && config.daysOfWeek.length > 0;
    if (hasDaysOfWeek) {
      if (!config.daysOfWeek.includes(current.getDay())) {
        current.setDate(current.getDate() + 1);
        continue;
      }
    }

    // Se a ocorrencia esta dentro do range visivel, adicionar
    const occEnd = new Date(current.getTime() + duration);

    if (occEnd >= rangeStart && current < rangeEnd) {
      occurrences.push({
        ...event,
        id: `${event.id}_${toDateKey(current)}`,
        _parentId: event.id,
        _occurrenceDate: toDateKey(current),
        startDate: current.toISOString(),
        endDate: occEnd.toISOString(),
      });
    }

    // Se ja passou do range, podemos parar
    if (current > rangeEnd) break;

    count++;

    // Avancar para proxima ocorrencia
    if (hasDaysOfWeek) {
      // Para weekly com daysOfWeek: avancar 1 dia e deixar o filtro acima pular dias invalidos
      // Quando todos os dias da semana atual ja passaram, pular para proxima(s) semana(s) conforme intervalo
      const currentDay = current.getDay();
      const nextDays = config.daysOfWeek.filter(d => d > currentDay);
      if (nextDays.length > 0) {
        // Ainda tem dias nesta semana
        current.setDate(current.getDate() + (nextDays[0] - currentDay));
      } else {
        // Ir pra primeiro dia da proxima semana (respeitando intervalo)
        const daysUntilEndOfWeek = 6 - currentDay;
        const daysToSkip = daysUntilEndOfWeek + 1 + (config.interval - 1) * 7;
        current.setDate(current.getDate() + daysToSkip);
        // Agora estamos no domingo da proxima semana valida, o filtro acima vai encontrar o dia certo
      }
    } else {
      current = advanceDate(current, event.recurrenceType, config);
    }
  }

  return occurrences;
}

/**
 * Expande eventos recorrentes dentro de um range de datas
 *
 * @param {Array} events - Lista de eventos do banco
 * @param {Date} rangeStart - Inicio do range visivel
 * @param {Date} rangeEnd - Fim do range visivel
 * @returns {Array} - Eventos expandidos (unicos + ocorrencias virtuais)
 */
export function expandRecurrences(events, rangeStart, rangeEnd) {
  const result = [];

  for (const event of events) {
    // Evento sem recorrencia: retorna direto se esta no range
    if (!event.recurrenceType) {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      if (end >= rangeStart && start < rangeEnd) {
        result.push(event);
      }
      continue;
    }

    // Evento com recorrencia: gerar ocorrencias
    const occurrences = generateOccurrences(event, rangeStart, rangeEnd);
    const exceptions = event.recurrenceExceptions || [];

    for (const occ of occurrences) {
      const dateKey = occ._occurrenceDate;
      const exception = exceptions.find(e => e.date === dateKey);

      // Excecao: ocorrencia excluida
      if (exception && exception.type === 'deleted') {
        continue;
      }

      // Excecao: ocorrencia modificada
      if (exception && exception.type === 'modified' && exception.overrides) {
        result.push({
          ...occ,
          ...exception.overrides,
          id: occ.id,
          _parentId: occ._parentId,
          _occurrenceDate: occ._occurrenceDate,
          _isModified: true,
        });
        continue;
      }

      result.push(occ);
    }
  }

  return result;
}

/**
 * agendaDeadlines - extrai os PRAZOS das O.S. pra agenda (eventos do calendário).
 *
 * Cobre a cascata de prazo de um item (mesma do resolveItemDueAt):
 *   1. item.dueAt            → prazo próprio da tarefa        → evento "Prazo"
 *   2. grupo/setor (dueAt)   → o item herda o prazo do grupo  → evento "Prazo"
 *   3. O.S. estimatedEnd     → prazo de ENTREGA da O.S.       → 1 marco "Entrega · #N"
 *
 * Lógica pura (sem React) pra ficar testável: recebe os pedidos + um resolvedor
 * nome→membro e devolve os eventos no shape do CrmCalendar.
 */

const groupDueOf = (os, item) =>
  (os?.checklistGroups || []).find((g) => (g.name || '') === (item?.group || ''))?.dueAt || null;

// Responsáveis da O.S.: time (>1) usa participantes; senão assignee + assignedTo.
function responsiblesOf(os) {
  if (os?.mode === 'team') return (os.participants || []).map((p) => p.name).filter(Boolean);
  return [...new Set([
    ...(os?.assignee ? [os.assignee] : []),
    ...((os?.assignedTo || '').split(',').map((s) => s.trim()).filter(Boolean)),
  ])];
}

export function buildOSDeadlineEvents(orders, memberByName = () => null) {
  const out = [];
  for (const os of orders || []) {
    const cl = Array.isArray(os?.checklist) ? os.checklist : [];
    const responsibles = responsiblesOf(os);
    const osNum = os?.type === 'emergency' ? `EMG-${os.emergencyNumber}` : `#${os?.number}`;
    const peopleFor = (item) => {
      const taskPeople = (responsibles.length > 1 && item?.assigneeName) ? [item.assigneeName] : responsibles;
      return taskPeople.length ? taskPeople : [''];
    };
    const pushEntry = (people, base) => people.forEach((personName, idx) => {
      const m = personName ? memberByName(personName) : null;
      out.push({ ...base, id: `${base.id}_p${idx}`, assignee: m?.id || null, _osId: os.id });
    });

    // 1+2) Itens com prazo próprio (do item OU herdado do grupo/setor).
    for (const item of cl) {
      if (item.done) continue;
      const own = item.dueAt || groupDueOf(os, item);
      if (!own) continue;
      const due = new Date(own);
      if (isNaN(due.getTime())) continue;
      pushEntry(peopleFor(item), {
        id: `ostask_${os.id}_${item.id}`,
        title: `${item.text} · ${osNum}`,
        startDate: due.toISOString(), endDate: new Date(due.getTime() + 30 * 60000).toISOString(),
        color: '#ef4444', source: 'os', typeKey: 'task', typeLabel: 'Prazo',
        _taskId: item.id, // clique → abre o briefing dessa tarefa
      });
    }

    // 3) Prazo de ENTREGA da O.S. (estimatedEnd) — 1 marco enquanto houver pendência.
    const hasPending = cl.length ? cl.some((i) => !i.done) : os?.status !== 'done';
    if (os?.estimatedEnd && os?.status !== 'done' && hasPending) {
      const due = new Date(os.estimatedEnd);
      if (!isNaN(due.getTime())) {
        pushEntry(responsibles.length ? responsibles : [''], {
          id: `osdue_${os.id}`,
          title: `Entrega · ${osNum}${os.title ? ` ${os.title}` : ''}`,
          startDate: due.toISOString(), endDate: new Date(due.getTime() + 30 * 60000).toISOString(),
          color: '#dc2626', source: 'os', typeKey: 'task', typeLabel: 'Entrega O.S.',
        });
      }
    }
  }
  return out;
}

/**
 * agendaDeadlines - extrai os PRAZOS das O.S. pra agenda (eventos do calendário).
 *
 * Pra NÃO lotar a agenda, mostra o essencial:
 *   1. item.dueAt         → prazo PRÓPRIO da tarefa     → evento "Prazo"
 *   2. O.S. estimatedEnd  → prazo de ENTREGA da O.S.    → 1 marco "Entrega · #N"
 *
 * (Herança de prazo do grupo foi removida — inflava demais.)
 *
 * Lógica pura (sem React) pra ficar testável: recebe os pedidos + um resolvedor
 * nome→membro e devolve os eventos no shape do CrmCalendar.
 */

// Responsáveis da O.S.: time usa participantes; solo usa o nome em `assignee`.
// `assignedTo` NÃO entra aqui: guarda um UUID de auth.users (não um nome), e
// passá-lo pra memberByName gerava um 2º evento "fantasma" sem dono no calendário.
function responsiblesOf(os) {
  if (os?.mode === 'team') return (os.participants || []).map((p) => p.name).filter(Boolean);
  return os?.assignee ? [os.assignee] : [];
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

    // 1) Itens com prazo PRÓPRIO (só o que foi marcado no item).
    for (const item of cl) {
      if (item.done || !item.dueAt) continue;
      const due = new Date(item.dueAt);
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

/**
 * deadlineUtils - Utilitarios de prazo e atraso para O.S.
 *
 * Retorna status e metadados para exibicao de badges/alertas.
 */

/**
 * Retorna o status de prazo de uma O.S.
 * @param {Object} order - Objeto com estimatedEnd e status
 * @returns {{ status: 'ok'|'warning'|'overdue'|'none', daysLeft: number, label: string }}
 */
export function getDeadlineStatus(order) {
  if (!order.estimatedEnd || order.status === 'done') {
    return { status: 'none', daysLeft: null, label: '' };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const deadline = new Date(order.estimatedEnd);
  deadline.setHours(0, 0, 0, 0);

  const diffMs = deadline - now;
  const daysLeft = Math.ceil(diffMs / 86400000);

  if (daysLeft < 0) {
    return {
      status: 'overdue',
      daysLeft,
      label: `${Math.abs(daysLeft)}d atrasado`,
    };
  }

  if (daysLeft <= 2) {
    return {
      status: 'warning',
      daysLeft,
      label: daysLeft === 0 ? 'Vence hoje' : daysLeft === 1 ? 'Vence amanha' : `Vence em ${daysLeft}d`,
    };
  }

  return {
    status: 'ok',
    daysLeft,
    label: `${daysLeft}d restantes`,
  };
}

/**
 * Filtra O.S. atrasadas
 */
export function getOverdueOrders(orders) {
  return orders.filter(o => getDeadlineStatus(o).status === 'overdue');
}

/**
 * Filtra O.S. com prazo proximo (warning)
 */
export function getWarningOrders(orders) {
  return orders.filter(o => getDeadlineStatus(o).status === 'warning');
}

/**
 * Retorna todas as O.S. que precisam de atencao (atrasadas + warning)
 */
export function getAlertOrders(orders) {
  return orders.filter(o => {
    const s = getDeadlineStatus(o).status;
    return s === 'overdue' || s === 'warning';
  });
}

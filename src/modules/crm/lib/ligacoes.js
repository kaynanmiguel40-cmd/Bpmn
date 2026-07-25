/**
 * ligacoes — atribuicao das tarefas de ligacao/mensagem no placar.
 *
 * REGRA DE CONTAGEM (aplicada em crmDailyService/crmDashboardService, nao aqui):
 * uma tarefa de Ligacao concluida = UMA ligacao. Nao se multiplica pelo
 * "(3 tentativas)" do titulo — o "3" e um TETO ("tente ate 3 vezes"), nao um
 * realizado: o vendedor para quando o lead atende, e a contagem real de discadas
 * nao e registrada. Contar 3 inflaria justamente as atendidas.
 */

/**
 * Quem fez a ligacao, na ordem em que a verdade e mais confiavel:
 * quem CONCLUIU > o responsavel > quem criou.
 *
 * Importa porque a tarefa de cadencia nasce de um insert do sistema (sem
 * created_by): agregar so por created_by jogava fora as ligacoes de cadencia —
 * justamente as que o time mais faz.
 */
export function autorDaLigacao(row) {
  return row?.completed_by || row?.assigned_to || row?.created_by || null;
}

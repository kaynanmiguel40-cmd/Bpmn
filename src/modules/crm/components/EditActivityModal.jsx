/**
 * EditActivityModal — abre o formulário de edição de uma tarefa a partir do ID.
 *
 * POR QUE PELO ID, e não pelo objeto que a tela já tem em mãos:
 *
 * O ActivityFormModal inicializa cada campo com `activity.campo || ''` e, no
 * submit, grava o formulário INTEIRO. Alimentado com um objeto parcial, ele abre
 * o campo ausente vazio e salva vazio — apagando o dado sem ninguém pedir. E os
 * objetos que circulam pelas telas SÃO parciais: a Fila seleciona só as colunas
 * que a linha desenha (sem `description`), e o card do calendário é ainda mais
 * enxuto.
 *
 * Concentrar o carregamento aqui é o que evita ter que auditar, tela por tela, se
 * o objeto daquela superfície é completo o bastante pra ser salvo de volta. Toda
 * tela abre a edição do mesmo jeito: passa o id.
 */

import { CrmModal } from './ui/CrmModal';
import { ActivityFormModal } from './ActivityFormModal';
import { useCrmActivity } from '../hooks/useCrmQueries';

export function EditActivityModal({ activityId, open, onClose }) {
  const { data: activity, isLoading, isError } = useCrmActivity(open ? activityId : null);

  if (!open) return null;

  // Enquanto carrega (ou se falhar) NÃO renderiza o formulário: montá-lo com
  // `activity` nulo o trataria como "tarefa nova" — e salvar criaria uma tarefa
  // duplicada em vez de editar a que a pessoa clicou.
  if (isLoading || isError || !activity) {
    return (
      <CrmModal open onClose={onClose} title="Editar tarefa" size="md">
        <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
          {isError || (!isLoading && !activity)
            ? 'Não consegui carregar esta tarefa. Feche e tente de novo.'
            : (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-slate-300 border-t-fyness-primary rounded-full animate-spin" />
                Carregando…
              </span>
            )}
        </div>
      </CrmModal>
    );
  }

  return <ActivityFormModal open onClose={onClose} activity={activity} />;
}

export default EditActivityModal;

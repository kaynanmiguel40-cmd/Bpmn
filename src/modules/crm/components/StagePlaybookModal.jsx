/**
 * StagePlaybookModal — o processo de uma etapa do funil.
 *
 * Mostra (e edita) a DEFINICAO: objetivo da etapa, os passos com script, e o
 * criterio de saida. O checklist por lead vive na aba "Processo" do negocio
 * (CrmDealDetailPage) e referencia estes passos.
 *
 * Abre em modo leitura: quem mais usa isso e o vendedor consultando o que
 * fazer, nao o gestor editando. Editar e um clique a mais, de proposito.
 */

import { useState, useEffect } from 'react';
import { Plus, Trash2, Pencil, ChevronUp, ChevronDown, Target, Flag, X } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { useSaveStageSteps, useSaveStageGoal } from '../hooks/useCrmQueries';

function StepEditor({ step, index, total, onChange, onRemove, onMove }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2 bg-white/60 dark:bg-slate-800/40">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-[11px] font-bold text-slate-500 dark:text-slate-300 flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        <input
          value={step.title}
          onChange={(e) => onChange({ ...step, title: e.target.value })}
          placeholder="O que o vendedor faz (ex: Ligação 1 — manhã)"
          className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
        />
        <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0}
          className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30" title="Subir">
          <ChevronUp size={15} />
        </button>
        <button type="button" onClick={() => onMove(index, 1)} disabled={index === total - 1}
          className="p-1 rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30" title="Descer">
          <ChevronDown size={15} />
        </button>
        <button type="button" onClick={() => onRemove(index)}
          className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30" title="Remover passo">
          <Trash2 size={15} />
        </button>
      </div>
      <textarea
        value={step.script}
        onChange={(e) => onChange({ ...step, script: e.target.value })}
        placeholder="Script — o que falar. Use [nome], [empresa]…"
        rows={3}
        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-700 dark:text-slate-200 resize-y"
      />
    </div>
  );
}

export function StagePlaybookModal({ open, onClose, stage, pipelineId, steps = [] }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState([]);
  const [objetivo, setObjetivo] = useState('');
  const [exitCriteria, setExitCriteria] = useState('');

  const saveSteps = useSaveStageSteps(pipelineId);
  const saveGoal = useSaveStageGoal(pipelineId);
  const saving = saveSteps.isPending || saveGoal.isPending;

  // Recarrega o rascunho toda vez que abre (ou que a etapa/os passos mudam):
  // sem isso, reabrir depois de cancelar mostraria a edicao descartada.
  useEffect(() => {
    if (!open) return;
    setEditing(false);
    setDraft(steps.map(s => ({ id: s.id, title: s.title, script: s.script })));
    setObjetivo(stage?.objetivo || '');
    setExitCriteria(stage?.exitCriteria || '');
  }, [open, stage?.id, stage?.objetivo, stage?.exitCriteria, steps]);

  if (!stage) return null;

  const moveStep = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= draft.length) return;
    const next = [...draft];
    [next[i], next[j]] = [next[j], next[i]];
    setDraft(next);
  };

  const handleSave = async () => {
    // Passo sem titulo vira lixo no checklist de todo lead — descarta antes.
    const clean = draft.filter(s => (s.title || '').trim());
    await saveGoal.mutateAsync({ stageId: stage.id, objetivo, exitCriteria });
    await saveSteps.mutateAsync({ stageId: stage.id, steps: clean });
    setEditing(false);
  };

  const hasContent = objetivo || exitCriteria || steps.length > 0;

  return (
    <CrmModal
      open={open}
      onClose={onClose}
      title={`Processo — ${stage.name}`}
      size="lg"
      footer={
        editing ? (
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditing(false)} disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-fyness-primary text-white hover:bg-fyness-secondary disabled:opacity-60">
              {saving ? 'Salvando…' : 'Salvar processo'}
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              O checklist de cada lead fica na aba Processo do negócio.
            </span>
            <button onClick={() => setEditing(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-fyness-primary text-white hover:bg-fyness-secondary">
              <Pencil size={15} /> Editar
            </button>
          </div>
        )
      }
    >
      {editing ? (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Objetivo da etapa
            </label>
            <input
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Por que essa etapa existe (ex: conseguir a primeira resposta)"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Passos — o que o vendedor faz
            </label>
            <div className="space-y-2">
              {draft.map((s, i) => (
                <StepEditor
                  key={s.id || `novo-${i}`}
                  step={s}
                  index={i}
                  total={draft.length}
                  onChange={(next) => setDraft(draft.map((d, j) => (j === i ? next : d)))}
                  onRemove={(j) => setDraft(draft.filter((_, k) => k !== j))}
                  onMove={moveStep}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setDraft([...draft, { title: '', script: '' }])}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-fyness-primary hover:bg-fyness-primary/10"
            >
              <Plus size={15} /> Adicionar passo
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
              Quando mover o lead
            </label>
            <input
              value={exitCriteria}
              onChange={(e) => setExitCriteria(e.target.value)}
              placeholder="O que precisa acontecer pra ele sair dessa etapa"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100"
            />
          </div>
        </div>
      ) : !hasContent ? (
        <div className="py-10 text-center">
          <Target size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Essa etapa ainda não tem processo.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Clique em Editar pra escrever o que o vendedor deve fazer aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {objetivo && (
            <div className="flex gap-2.5">
              <Target size={16} className="text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Objetivo</div>
                <p className="text-sm text-slate-700 dark:text-slate-200">{objetivo}</p>
              </div>
            </div>
          )}

          {steps.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                O que fazer
              </div>
              <div className="space-y-2">
                {steps.map((s, i) => (
                  <div key={s.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white/60 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-fyness-primary/10 text-[11px] font-bold text-fyness-primary flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.title}</span>
                    </div>
                    {s.script && (
                      <p className="mt-2 ml-8 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap border-l-2 border-slate-200 dark:border-slate-600 pl-3">
                        {s.script}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {exitCriteria && (
            <div className="flex gap-2.5">
              <Flag size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Quando mover</div>
                <p className="text-sm text-slate-700 dark:text-slate-200">{exitCriteria}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </CrmModal>
  );
}

export default StagePlaybookModal;

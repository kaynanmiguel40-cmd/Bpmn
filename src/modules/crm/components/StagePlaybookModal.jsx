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
import { ChannelBadge } from './ui/ChannelBadge';
import { useSaveStageSteps, useSaveStageGoal } from '../hooks/useCrmQueries';

// Estilo canonico de campo da norma de modal do CRM. Este modal nao tem
// validacao por campo (nada aqui e obrigatorio), entao so o estado normal.
const fieldClass =
  'w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-fyness-primary bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2';

const BTN_PRIMARIO =
  'min-h-[44px] px-4 py-2 text-sm font-medium bg-fyness-primary hover:bg-fyness-secondary text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 w-full sm:w-auto';

const BTN_SECUNDARIO =
  'min-h-[44px] px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 w-full sm:w-auto';

// Controles de icone do passo (subir/descer/remover) ficam em 36px, nao 44px:
// sao adjacentes numa linha densa e 44px quebraria a linha do passo. Unica
// excecao registrada da norma.
const BTN_ICONE_PASSO =
  'min-h-[36px] min-w-[36px] flex items-center justify-center rounded text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30';

function StepEditor({ step, index, total, onChange, onRemove, onMove }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 space-y-2 bg-white/60 dark:bg-slate-800/40">
      <div className="flex items-center gap-2">
        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 text-[12px] font-bold text-slate-500 dark:text-slate-300 flex items-center justify-center shrink-0">
          {index + 1}
        </span>
        {/* O canal sai do TITULO — mostrar aqui deixa claro, ao editar, que
            escrever "Ligação"/"WhatsApp"/"E-mail" no nome e o que define o
            canal do toque (e o icone que vai aparecer na Agenda). */}
        <ChannelBadge title={step.title} showLabel={false} />
        <input
          value={step.title}
          onChange={(e) => onChange({ ...step, title: e.target.value })}
          placeholder="O que o vendedor faz (ex.: Ligação manhã, WhatsApp, E-mail…)"
          className={`${fieldClass} flex-1`}
        />
        <button type="button" onClick={() => onMove(index, -1)} disabled={index === 0}
          className={BTN_ICONE_PASSO} title="Subir">
          <ChevronUp size={15} />
        </button>
        <button type="button" onClick={() => onMove(index, 1)} disabled={index === total - 1}
          className={BTN_ICONE_PASSO} title="Descer">
          <ChevronDown size={15} />
        </button>
        <button type="button" onClick={() => onRemove(index)}
          className="min-h-[36px] min-w-[36px] flex items-center justify-center rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30" title="Remover passo">
          <Trash2 size={15} />
        </button>
      </div>
      <textarea
        value={step.script}
        onChange={(e) => onChange({ ...step, script: e.target.value })}
        placeholder="Script — o que falar. Use [nome], [empresa]…"
        rows={3}
        className={`${fieldClass} resize-none`}
      />

      {/* Cenarios: o que o cliente responde + como reagir. */}
      <div className="pl-3 border-l-2 border-slate-200 dark:border-slate-600 space-y-1.5">
        {(step.scenarios || []).map((sc, si) => (
          <div key={si} className="flex gap-1.5 items-center">
            <input
              value={sc.when || ''}
              onChange={(e) => {
                const next = [...(step.scenarios || [])];
                next[si] = { ...next[si], when: e.target.value };
                onChange({ ...step, scenarios: next });
              }}
              placeholder="Se o cliente diz…"
              className="flex-1 px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-[13px] text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
            />
            <span className="text-slate-400 text-xs shrink-0">→</span>
            <input
              value={sc.then || ''}
              onChange={(e) => {
                const next = [...(step.scenarios || [])];
                next[si] = { ...next[si], then: e.target.value };
                onChange({ ...step, scenarios: next });
              }}
              placeholder="você faz/responde…"
              className="flex-1 px-2 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-[13px] text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-fyness-primary"
            />
            <button type="button"
              onClick={() => onChange({ ...step, scenarios: (step.scenarios || []).filter((_, k) => k !== si) })}
              className="p-1 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 shrink-0" title="Remover cenário">
              <X size={13} />
            </button>
          </div>
        ))}
        <button type="button"
          onClick={() => onChange({ ...step, scenarios: [...(step.scenarios || []), { when: '', then: '' }] })}
          className="inline-flex items-center gap-1 text-[12px] font-medium text-fyness-primary hover:bg-fyness-primary/10 px-2 py-1 rounded-md">
          <Plus size={12} /> Cenário (se o cliente responde…)
        </button>
      </div>
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
    setDraft(steps.map(s => ({
      id: s.id, title: s.title, script: s.script,
      scenarios: Array.isArray(s.scenarios) ? s.scenarios.map(sc => ({ ...sc })) : [],
    })));
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
      title={`O que fazer — ${stage.name}`}
      size="lg"
      footer={
        editing ? (
          <>
            <button onClick={() => setEditing(false)} disabled={saving} className={BTN_SECUNDARIO}>
              Cancelar
            </button>
            <button onClick={handleSave} disabled={saving} className={BTN_PRIMARIO}>
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {saving ? 'Salvando…' : 'Salvar processo'}
            </button>
          </>
        ) : (
          <>
            <span className="mr-auto text-xs text-slate-500 dark:text-slate-400">
              O checklist de cada lead fica na aba Atividades dele.
            </span>
            <button onClick={() => setEditing(true)} className={BTN_PRIMARIO}>
              <Pencil size={15} /> Editar
            </button>
          </>
        )
      }
    >
      {editing ? (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Objetivo da etapa
            </label>
            <input
              value={objetivo}
              onChange={(e) => setObjetivo(e.target.value)}
              placeholder="Por que essa etapa existe (ex.: conseguir a primeira resposta)"
              className={fieldClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
              className="mt-2 min-h-[44px] inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-fyness-primary hover:bg-fyness-primary/10"
            >
              <Plus size={15} /> Adicionar passo
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Quando mover o lead
            </label>
            <input
              value={exitCriteria}
              onChange={(e) => setExitCriteria(e.target.value)}
              placeholder="O que precisa acontecer pra ele sair dessa etapa"
              className={fieldClass}
            />
          </div>
        </div>
      ) : !hasContent ? (
        <div className="py-10 text-center">
          <Target size={28} className="mx-auto text-slate-300 dark:text-slate-600 mb-2" />
          <p className="text-sm text-slate-500 dark:text-slate-400">Essa etapa ainda não tem processo.</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Clique em Editar pra escrever o que o vendedor deve fazer aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {objetivo && (
            <div className="flex gap-2.5">
              <Target size={16} className="text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Objetivo</div>
                <p className="text-sm text-slate-700 dark:text-slate-200">{objetivo}</p>
              </div>
            </div>
          )}

          {steps.length > 0 && (
            <div>
              <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                O que fazer
              </div>
              <div className="space-y-2">
                {steps.map((s, i) => (
                  <div key={s.id} className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-white/60 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-fyness-primary/10 text-[12px] font-bold text-fyness-primary flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <ChannelBadge title={s.title} />
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.title}</span>
                    </div>
                    {s.script && (
                      <p className="mt-2 ml-8 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap border-l-2 border-slate-200 dark:border-slate-600 pl-3">
                        {s.script}
                      </p>
                    )}
                    {s.scenarios?.length > 0 && (
                      <div className="mt-2 ml-8 space-y-1.5">
                        {s.scenarios.map((sc, k) => (
                          <div key={k} className="rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700 px-2.5 py-1.5">
                            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Se: {sc.when}</span>
                            <div className="text-[13px] text-slate-700 dark:text-slate-200">→ {sc.then}</div>
                          </div>
                        ))}
                      </div>
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
                <div className="text-[12px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Quando mover</div>
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

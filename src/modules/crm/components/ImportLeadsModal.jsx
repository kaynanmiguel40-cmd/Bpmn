/**
 * ImportLeadsModal — importa uma lista colada (ligação fria / WhatsApp) direto
 * pro pipeline como negócios. Cada linha vira um deal no estágio escolhido.
 *
 * Formato por linha (separador vírgula, ponto-e-vírgula ou tab):
 *   Nome
 *   Nome, telefone
 *   Nome, telefone, estágio   (estágio casa pelo nome com as colunas da pipeline)
 *
 * Pro caso do usuário: a maioria foi ligação fria → só nome + status (estágio).
 * O contato/telefone entra só pra quem avançou.
 */

import { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Upload, AlertTriangle } from 'lucide-react';
import { CrmModal } from './ui/CrmModal';
import { createCrmDeal } from '../services/crmDealsService';
import { toast } from '../../../contexts/ToastContext';

const COMBINING_MARKS = /[̀-ͯ]/g;
const norm = (s) =>
  (s || '').normalize('NFD').replace(COMBINING_MARKS, '').toLowerCase().trim();

const isPhoneToken = (s) => {
  const digits = s.replace(/\D/g, '');
  return digits.length >= 8 && s.replace(/[\d()+\-\s]/g, '').length === 0;
};

function parseImportLines(raw, stages) {
  const stageByNorm = {};
  stages.forEach((s) => { stageByNorm[norm(s.name)] = s; });

  return raw
    .split('\n')
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return null;

      let parts = trimmed.split(/[\t;,]+/).map((s) => s.trim()).filter(Boolean);
      // Uma parte só: tenta separar "Nome 11999998888"
      if (parts.length === 1) {
        const m = trimmed.match(/^(.+?)\s+([\d()+\-\s]{8,})$/);
        if (m) parts = [m[1].trim(), m[2].trim()];
      }

      const phoneIdx = parts.findIndex(isPhoneToken);
      let name = '';
      let phone = '';
      let stageMatch = null;

      if (parts.length === 1 && phoneIdx === 0) {
        // Só telefone — usa o número como título também
        phone = parts[0];
        name = parts[0];
      } else {
        name = parts[0] || '';
        if (phoneIdx > 0) phone = parts[phoneIdx];
        for (let i = 1; i < parts.length; i++) {
          if (i === phoneIdx) continue;
          const st = stageByNorm[norm(parts[i])];
          if (st) { stageMatch = st; break; }
        }
      }

      return {
        raw: trimmed,
        name: name.trim(),
        phone: phone.trim(),
        stageMatch,
        valid: !!name.trim(),
      };
    })
    .filter(Boolean);
}

export function ImportLeadsModal({ open, onClose, pipeline }) {
  const qc = useQueryClient();
  const stages = pipeline?.stages || [];

  const [rawText, setRawText] = useState('');
  const [defaultStageId, setDefaultStageId] = useState('');
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  // Estágio padrão = primeiro da pipeline (ex: "A contatar")
  const effectiveDefaultStage = defaultStageId || stages[0]?.id || '';

  const rows = useMemo(
    () => parseImportLines(rawText, stages),
    [rawText, stages]
  );
  const validRows = rows.filter((r) => r.valid);

  const handleImport = async () => {
    if (!pipeline?.id || validRows.length === 0 || !effectiveDefaultStage) return;
    setImporting(true);
    setProgress({ done: 0, total: validRows.length });

    let ok = 0;
    let fail = 0;
    for (const row of validRows) {
      const stageId = row.stageMatch?.id || effectiveDefaultStage;
      try {
        const deal = await createCrmDeal({
          title: row.name,
          pipelineId: pipeline.id,
          stageId,
          contactName: row.name,
          contactPhone: row.phone || '',
          probability: 10,
          status: 'open',
          notes: '📇 Origem: importação de lista (ligação fria / WhatsApp)',
        });
        if (deal?.id) ok++; else fail++;
      } catch {
        fail++;
      }
      setProgress((p) => ({ ...p, done: p.done + 1 }));
    }

    setImporting(false);
    qc.invalidateQueries({ queryKey: ['crm', 'pipelineDeals'] });
    qc.invalidateQueries({ queryKey: ['crm', 'deals'] });
    qc.invalidateQueries({ queryKey: ['crm', 'dashboard'] });

    if (ok > 0) toast(`${ok} negócio${ok > 1 ? 's' : ''} importado${ok > 1 ? 's' : ''}`, 'success');
    if (fail > 0) toast(`${fail} linha${fail > 1 ? 's' : ''} com erro`, 'error');

    setRawText('');
    onClose();
  };

  const selectCls =
    'w-full px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-fyness-primary focus:outline-none';

  return (
    <CrmModal
      open={open}
      onClose={importing ? () => {} : onClose}
      title="Importar lista pro pipeline"
      size="lg"
      footer={
        <>
          <button
            onClick={onClose}
            disabled={importing}
            className="px-4 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={importing || validRows.length === 0 || !effectiveDefaultStage}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-fyness-primary hover:bg-fyness-secondary text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing
              ? <><Loader2 size={16} className="animate-spin" /> Importando {progress.done}/{progress.total}…</>
              : <><Upload size={16} /> Importar {validRows.length} negócio{validRows.length !== 1 ? 's' : ''}</>}
          </button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Estágio inicial (status)
          </label>
          <select
            value={effectiveDefaultStage}
            onChange={(e) => setDefaultStageId(e.target.value)}
            className={selectCls}
          >
            {stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Aplica a todas as linhas — exceto as que trouxerem um estágio próprio na 3ª coluna.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Cole a lista (uma pessoa por linha)
          </label>
          <textarea
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            rows={8}
            placeholder={'João Silva\nMaria Souza, (11) 98888-7777\nPedro Lima, 11977776666, Respondeu'}
            className={`${selectCls} font-mono text-xs leading-relaxed`}
          />
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Formatos: <code>Nome</code> · <code>Nome, telefone</code> · <code>Nome, telefone, estágio</code>. Separador: vírgula, ponto-e-vírgula ou tab.
          </p>
        </div>

        {/* Preview */}
        {rows.length > 0 && (
          <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>{validRows.length} válida{validRows.length !== 1 ? 's' : ''}{rows.length !== validRows.length ? ` · ${rows.length - validRows.length} ignorada(s)` : ''}</span>
              <span>Prévia</span>
            </div>
            <div className="max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((r, i) => (
                <div key={i} className={`px-3 py-1.5 flex items-center gap-2 text-xs ${!r.valid ? 'opacity-40' : ''}`}>
                  {!r.valid && <AlertTriangle size={12} className="text-amber-500 shrink-0" />}
                  <span className="font-medium text-slate-700 dark:text-slate-200 truncate flex-1">{r.name || r.raw}</span>
                  {r.phone && <span className="text-slate-400 shrink-0">{r.phone}</span>}
                  <span className="px-1.5 py-0.5 rounded bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 shrink-0">
                    {r.stageMatch?.name || stages.find((s) => s.id === effectiveDefaultStage)?.name || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CrmModal>
  );
}

export default ImportLeadsModal;

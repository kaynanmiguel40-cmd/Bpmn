/**
 * migrate_notes_to_history — quebra o diario do campo `notes` em registros.
 *
 * Usa o MESMO parser da tela (src/modules/crm/utils/parseNoteEntries.js), pra
 * que o que foi migrado seja exatamente o que voce viu antes de migrar.
 *
 * O que faz, por negocio que tenha data no texto:
 *   1. separa os trechos datados;
 *   2. grava cada um em crm_lead_notes (origin='migrado');
 *   3. deixa em crm_deals.notes SO o texto sem data (cabecalho "Dados Fulano",
 *      observacao de estado) — a nota volta a caber numa nota.
 *
 * O que NAO faz:
 *   - nao toca em nota curta/sem data: aquilo e nota de verdade, nao historico;
 *   - nao apaga nada sem o texto original estar em crm_deals_notes_backup_104
 *     (criado na migration 104) E no arquivo backups/notas_crm_deals_*.tsv.
 *
 * Uso:
 *   node scripts/migrate_notes_to_history.mjs           # SIMULA, nao grava
 *   node scripts/migrate_notes_to_history.mjs --aplicar # grava
 */

import { execFileSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { parseNoteEntries, noteEntryTitle } from '../src/modules/crm/utils/parseNoteEntries.js';

const APLICAR = process.argv.includes('--aplicar');

/** Roda SQL no VPS via o mesmo caminho do db.mjs e devolve a saida crua. */
function sql(query) {
  return execFileSync('node', ['scripts/db.mjs', '--query', query], {
    encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
  });
}

/** Escapa string pra literal SQL. */
const lit = (v) => (v == null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);

// ---------------------------------------------------------------- ler
// Le do BACKUP, nao de crm_deals: assim rodar de novo depois de ja ter limpado
// `notes` continua funcionando (e idempotente de verdade).
const SEP = '<%|%>';
// `--ano-do-negocio` liga a leitura de DD/MM (sem ano), assumindo o ano em que
// o negocio foi criado. So use quando conferir que a nota nao atravessa virada
// de ano — nestes dados os negocios sao de 2026 e as notas citam maio a julho.
const CURTAS = process.argv.includes('--ano-do-negocio');
const filtro = CURTAS
  ? `b.notes !~ '[0-9]{1,2}/[0-9]{1,2}/[0-9]{2,4}' AND b.notes ~ '[0-9]{1,2}/[0-9]{2}'`
  : `b.notes ~ '[0-9]{1,2}/[0-9]{1,2}/[0-9]{2,4}'`;

const raw = sql(
  `COPY (SELECT b.deal_id || '${SEP}' || extract(year from d.created_at)::text || '${SEP}' || ` +
  `replace(b.notes, chr(10), '<%NL%>') ` +
  `FROM crm_deals_notes_backup_104 b JOIN crm_deals d ON d.id = b.deal_id ` +
  `WHERE d.deleted_at IS NULL AND ${filtro}) TO STDOUT;`,
);

const linhas = raw.split('\n').filter(l => l.includes(SEP));
console.log(`negocios com data na nota: ${linhas.length}`);

let totalTrechos = 0;
const statements = [];

for (const linha of linhas) {
  const [dealId, anoStr, notaEscapada] = linha.split(SEP);
  // Desfaz os dois escapes: o nosso (<%NL%>) e o do COPY (\n literal).
  const nota = notaEscapada.replace(/<%NL%>/g, '\n').replace(/\\n/g, '\n');
  const { entries, resto } = parseNoteEntries(nota, { anoPadrao: CURTAS ? Number(anoStr) : null });
  if (entries.length === 0) continue;

  totalTrechos += entries.length;
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  for (const e of entries) {
    statements.push(
      `INSERT INTO crm_lead_notes (deal_id, note_date, title, content, origin) VALUES ` +
      `(${lit(dealId)}::uuid, ${lit(iso(e.date))}::date, ${lit(noteEntryTitle(e.text))}, ${lit(e.text)}, 'migrado') ` +
      `ON CONFLICT DO NOTHING;`,
    );
  }
  // A nota fica so com o que nao tem data. Vazia vira NULL, nao string vazia.
  statements.push(
    `UPDATE crm_deals SET notes = ${resto ? lit(resto) : 'NULL'} WHERE id = ${lit(dealId)}::uuid;`,
  );

  const antes = nota.length;
  const depois = resto.length;
  console.log(
    `  ${String(entries.length).padStart(2)} trechos | ${antes} -> ${depois} chars ` +
    `(${Math.round((1 - depois / antes) * 100)}% menor) | ${dealId.slice(0, 8)}`,
  );
}

console.log(`\ntrechos a gravar: ${totalTrechos}`);
console.log(`comandos SQL: ${statements.length}`);

if (!APLICAR) {
  console.log('\nSIMULACAO — nada foi gravado. Rode com --aplicar pra valer.');
  process.exit(0);
}

// -------------------------------------------------------------- aplicar
// Tudo numa transacao: ou migra inteiro, ou nao migra nada. Migrar pela metade
// deixaria trecho gravado E ainda dentro da nota — duplicado na tela.
// Vai por ARQUIVO e nao por --query: com 200+ comandos o SQL estoura o limite
// de tamanho de argumento do processo (ENAMETOOLONG) e o db.mjs morre sem
// mensagem util — parece falha de banco quando e limite do sistema operacional.
const script = ['BEGIN;', ...statements, 'COMMIT;'].join('\n');
const arquivo = 'database/_tmp_migrate_notes.sql';
writeFileSync(arquivo, script, 'utf8');
console.log(`\naplicando via ${arquivo}…`);
const out = execFileSync('node', ['scripts/db.mjs', '--file', arquivo], {
  encoding: 'utf8', maxBuffer: 64 * 1024 * 1024,
});
unlinkSync(arquivo);
console.log(out.split('\n').slice(-4).join('\n'));
console.log('pronto.');

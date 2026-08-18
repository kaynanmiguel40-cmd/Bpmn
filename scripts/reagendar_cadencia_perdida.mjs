/**
 * Reagenda a cadência dos leads que ficaram sem tarefa nenhuma.
 *
 * POR QUE ESTE SCRIPT EXISTE: dois bugs deixaram leads abertos, numa etapa com
 * playbook, sem uma única tarefa pendente — invisíveis na Fila, porque a Fila só
 * mostra quem TEM tarefa. Ver database/153 e o fix de ordem em moveDealToStage.
 *
 * COMO ELE NÃO VIRA UMA TERCEIRA VERSÃO DA REGRA: o horário de cada toque sai do
 * `planSteps` do próprio app (crmScheduling.js — puro, sem banco). Este arquivo
 * só carrega os dados, chama o motor e gera os INSERTs. A regra de expediente,
 * almoço, fim de semana, espaçamento do mesmo lead e rollover de dia cheio é a
 * mesma que roda em produção; se ela mudar, este script muda junto.
 *
 * SEQUENCIAL DE PROPÓSITO: cada lead precisa enxergar os horários que os
 * anteriores acabaram de ocupar, senão a agenda sai empilhada no mesmo slot
 * (mesmo motivo do scheduleProcessForPipeline).
 *
 * Uso:  node scripts/reagendar_cadencia_perdida.mjs           (só mostra o plano)
 *       node scripts/reagendar_cadencia_perdida.mjs --aplicar (grava)
 */

import { execFileSync } from 'child_process';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { planSteps, dayKey, stepChannel, SLOT_MINUTES } from '../src/modules/crm/services/crmScheduling.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, '..');
const APLICAR = process.argv.includes('--aplicar');

// O agendador raciocina em hora LOCAL do vendedor. Rodar em UTC colocaria os
// toques 3h fora do lugar (e o piso "não nasce no passado" erraria o dia).
// Checa o fuso EFETIVO, não a variável TZ: no Windows o `TZ=... node` não
// propaga, e a máquina normalmente já está no fuso certo — abortar por causa da
// variável seria recusar trabalho que estava correto.
const fuso = Intl.DateTimeFormat().resolvedOptions().timeZone;
if (new Date().getTimezoneOffset() !== 180) {
  console.error(`[erro] rode num fuso de Brasília (UTC-3). Fuso atual: ${fuso}`);
  process.exit(1);
}

/**
 * Roda SQL no Postgres do VPS e devolve o texto cru.
 *
 * A consulta vai numa LINHA SÓ: dentro de `-c "..."` a quebra de linha chega
 * como `\n` literal e o psql a lê como meta-comando ("invalid command \n").
 * Por isso as consultas aqui não usam comentário `--` — ele comentaria o resto.
 */
function psql(sql) {
  const umaLinha = sql.replace(/\s+/g, ' ').trim();
  const script = `docker exec -i supabase-db psql -U postgres -d postgres -tAc ${JSON.stringify(umaLinha)}`;
  const b64 = Buffer.from(script, 'utf8').toString('base64');
  return execFileSync(
    'node',
    [join(RAIZ, '_ssh-run.mjs'), `echo '${b64}' | base64 -d | bash`],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  ).trim();
}

const json = (sql) => JSON.parse(psql(sql) || 'null') || [];

// ─── 1. Quem precisa de reparo ───────────────────────────────────────────────
// Lead ABERTO, numa etapa que TEM passo agendável, e sem NENHUMA tarefa de
// cadência pendente. Ganho (win) e descartado ficam de fora: continuar ligando
// pra quem já comprou (ou já disse não) é o erro que queima cliente.
const alvos = json(`
  SELECT coalesce(json_agg(row_to_json(t)), '[]') FROM (
    SELECT d.id, d.title, d.stage_id, d.source, d.contact_id,
           nullif(btrim(coalesce(d.contact_email,'')),'') AS deal_email,
           nullif(btrim(coalesce(c.email,'')),'')         AS contato_email,
           tm.auth_user_id AS assignee, tm.name AS assignee_name,
           s.name AS etapa
    FROM crm_deals d
    JOIN crm_pipeline_stages s ON s.id = d.stage_id
    LEFT JOIN crm_contacts c   ON c.id = d.contact_id
    LEFT JOIN team_members tm  ON tm.id = d.owner_id
    WHERE d.deleted_at IS NULL AND d.status = 'open'
      AND coalesce(s.is_win_stage,false) = false
      AND EXISTS (SELECT 1 FROM crm_stage_steps ss
                   WHERE ss.stage_id = d.stage_id AND ss.agendavel)
      AND NOT EXISTS (SELECT 1 FROM crm_activities a
                       WHERE a.deal_id = d.id AND a.stage_step_id IS NOT NULL
                         AND a.deleted_at IS NULL AND a.completed = false)
    ORDER BY d.title
  ) t`);

if (alvos.length === 0) { console.log('Nenhum lead sem cadência. Nada a fazer.'); process.exit(0); }

const stageIds = [...new Set(alvos.map(d => d.stage_id))];
const dealIds = alvos.map(d => d.id);
const lista = (arr) => arr.map(v => `'${v}'`).join(',');

// ─── 2. Passos das etapas envolvidas ─────────────────────────────────────────
const passos = json(`
  SELECT coalesce(json_agg(row_to_json(t)), '[]') FROM (
    SELECT id, stage_id, title, source_tag, day_offset, period
    FROM crm_stage_steps
    WHERE stage_id IN (${lista(stageIds)}) AND agendavel IS NOT false
    ORDER BY position
  ) t`);

// Passo que este lead JÁ tem tarefa (concluída ou não) não nasce de novo —
// mesma idempotência do scheduleStepsForDeal.
const jaTem = json(`
  SELECT coalesce(json_agg(row_to_json(t)), '[]') FROM (
    SELECT deal_id, stage_step_id FROM crm_activities
    WHERE deal_id IN (${lista(dealIds)}) AND stage_step_id IS NOT NULL AND deleted_at IS NULL
  ) t`);

// ─── 3. Agenda já ocupada ────────────────────────────────────────────────────
const ocupado = json(`
  SELECT coalesce(json_agg(row_to_json(t)), '[]') FROM (
    SELECT assigned_to, start_date, end_date FROM crm_activities
    WHERE deleted_at IS NULL
      AND start_date >= date_trunc('day', now())
      AND start_date <= now() + interval '75 days'
  ) t`);

const busyPorDono = {};
for (const r of ocupado) {
  const k = r.assigned_to || '__sem_dono__';
  const dia = dayKey(new Date(r.start_date));
  ((busyPorDono[k] ||= {})[dia] ||= []).push({ start: r.start_date, end: r.end_date || null });
}

// ─── 4. Filtros de passo (mesma regra do crmPlaybookService) ─────────────────
function categoriaOrigem(source) {
  const s = (source || '').toLowerCase();
  if (!s) return null;
  if (/tr[aá]fego|an[uú]ncio|\bads?\b|pago/.test(s)) return 'trafego';
  if (/parceiro|contador/.test(s)) return 'parceiro';
  if (/insta|\bdm\b|direct|org[aâ]nic/.test(s)) return 'instagram';
  if (/indica|cliente/.test(s)) return 'cliente';
  return null;
}
function filtrarPorOrigem(steps, source) {
  if (!steps.some(s => s.source_tag)) return steps;
  const cat = categoriaOrigem(source);
  const casou = steps.filter(s => !s.source_tag || s.source_tag === cat);
  return casou.some(s => s.source_tag) ? casou : steps;
}

const sql = (v) => (v === null || v === undefined ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);

// ─── 5. Planeja lead a lead, acumulando o que cada um ocupa ──────────────────
const agora = new Date();
const linhas = [];
const resumo = [];

for (const deal of alvos) {
  let steps = filtrarPorOrigem(
    passos.filter(p => p.stage_id === deal.stage_id),
    deal.source,
  );

  // Sem e-mail, passo de e-mail não vira tarefa — o vendedor não teria o que mandar.
  if (!deal.deal_email && !deal.contato_email) {
    steps = steps.filter(s => stepChannel(s.title) !== 'email');
  }

  const feitos = new Set(jaTem.filter(j => j.deal_id === deal.id).map(j => j.stage_step_id));
  const pendentes = steps.filter(s => !feitos.has(s.id));
  if (pendentes.length === 0) { resumo.push({ lead: deal.title, criadas: 0, nota: 'nada a criar' }); continue; }

  const donoKey = deal.assignee || '__sem_dono__';
  const busy = (busyPorDono[donoKey] ||= {});

  const plano = planSteps(
    pendentes.map(s => ({ id: s.id, dayOffset: s.day_offset || 0, period: s.period || null })),
    busy,
    agora,
  );

  for (const p of plano) {
    const step = pendentes.find(s => s.id === p.stepId);
    const fim = new Date(p.start.getTime() + SLOT_MINUTES * 60000);
    // Ocupa o slot pros próximos leads da fila (e pros próximos passos deste).
    ((busy[dayKey(p.start)] ||= [])).push({ start: p.start.toISOString(), end: fim.toISOString() });
    linhas.push(
      `(${sql(step.title)}, ${sql(stepChannel(step.title))}, ${sql(deal.id)}, ${sql(deal.contact_id)}, ` +
      `${sql(p.start.toISOString())}, ${sql(fim.toISOString())}, false, ` +
      `${sql(deal.assignee)}, ${sql(deal.assignee_name)}, ${sql(step.id)})`,
    );
  }
  resumo.push({ lead: deal.title, etapa: deal.etapa, dono: deal.assignee_name, criadas: plano.length,
    primeira: plano[0] ? plano[0].start.toLocaleString('pt-BR') : '—' });
}

console.table(resumo);
console.log(`\nTotal de tarefas a criar: ${linhas.length}`);

if (linhas.length === 0) process.exit(0);

const insert =
  'INSERT INTO crm_activities\n' +
  '  (title, type, deal_id, contact_id, start_date, end_date, completed, assigned_to, assigned_to_name, stage_step_id)\n' +
  'VALUES\n' + linhas.join(',\n') + ';\n';

const arquivo = join(__dirname, 'reagendar_cadencia_perdida.generated.sql');
writeFileSync(arquivo, insert, 'utf8');
console.log(`SQL gerado em ${arquivo}`);

if (!APLICAR) { console.log('\n(sem --aplicar: nada foi gravado)'); process.exit(0); }

// SFTP, não base64 embutido no comando: um lote grande (500+ tarefas) estoura o
// limite de tamanho do processo e o execFileSync falha ANTES de conectar (pid 0).
execFileSync('node', [join(RAIZ, '_scp-put.mjs'), arquivo, '/tmp/reag.sql'], { stdio: 'inherit' });
const cmd = 'docker cp /tmp/reag.sql supabase-db:/tmp/reag.sql && ' +
  'docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/reag.sql';
console.log(execFileSync('node', [join(RAIZ, '_ssh-run.mjs'), cmd], { encoding: 'utf8' }));

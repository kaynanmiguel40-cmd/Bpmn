/**
 * whatsapp_backfill.mjs — recupera no CRM as mensagens que a Evolution guardou
 * e o webhook nao entregou.
 *
 * POR QUE EXISTE
 *   Quando a instancia cai, a mensagem nao chega no webhook — nao ha o que
 *   retentar. Foi assim que 8 dias (28/06 a 05/07, 864 mensagens) ficaram com
 *   ZERO linhas no CRM enquanto a Evolution tinha tudo.
 *
 *   A Evolution roda com DATABASE_SAVE_DATA_NEW_MESSAGE=true, entao ela e a
 *   fonte da verdade do que realmente chegou. Este script le a tabela `Message`
 *   dela e REENVIA cada linha pro proprio `evolution-webhook`.
 *
 * POR QUE REENVIAR EM VEZ DE INSERIR DIRETO
 *   `Message.key` e `Message.message` sao exatamente o payload que o webhook ja
 *   recebe. Reenviando, todo o parser (desembrulho de envelope, extracao de
 *   midia, resolucao de @lid, vinculo, dedup) e reusado sem uma linha nova. Uma
 *   segunda implementacao divergiria da primeira no primeiro tipo novo.
 *
 * SEGURANCA
 *   - `UNIQUE (evolution_message_id)` + dedup do handler: reenviar mensagem que
 *     ja existe e no-op. Rodar duas vezes nao duplica.
 *   - `mode=existing_only`: vincula so a contato/prospect que JA existe. Nunca
 *     cria lead. O que nao casa vai pro dead-letter e fica recuperavel.
 *   - Ordem cronologica ASC obrigatoria: `created_at` das linhas recuperadas e o
 *     instante do backfill, e o desempate de exibicao e (sent_at, created_at,
 *     id). Fora de ordem embaralha o que empata no mesmo segundo.
 *
 * USO
 *   node scripts/whatsapp_backfill.mjs --desde 2026-06-28 --ate 2026-07-06 --dry-run
 *   node scripts/whatsapp_backfill.mjs --desde 2026-06-28 --ate 2026-07-06
 *   node scripts/whatsapp_backfill.mjs --horas 24        # janela do cron
 */

import { createRequire } from 'module';
import { readFileSync, existsSync } from 'fs';
import { execFile } from 'child_process';

const require = createRequire(import.meta.url);
const { Client } = require('ssh2');

/**
 * Roda no VPS ou na maquina do dev?
 *
 * O mesmo arquivo serve os dois: recuperacao manual daqui (via SSH) e o cron
 * de hora em hora la dentro. Rodando NO VPS, abrir SSH pra si mesmo e absurdo —
 * e foi o que quebrou o cron na primeira tentativa: o .env de la nao tem as
 * credenciais de deploy, entao o script morria em "Invalid username" antes de
 * ler uma linha sequer.
 *
 * Deteccao pelo unico sinal que importa: o socket do Docker esta aqui?
 */
const NO_VPS = existsSync('/var/run/docker.sock');

const PG_CONTAINER  = 'fyness-evolution-postgres';
const EDGE_CONTAINER = 'supabase-edge-functions';
const WEBHOOK_URL   = 'https://bpmn.fyness.com.br/sb/functions/v1/evolution-webhook';
const LOTE          = 100;   // linhas por pagina do psql
const PAUSA_MS      = 400;   // entre mensagens: midia bate na Evolution e no Storage

function loadEnv() {
  // No VPS nao ha SSH a fazer, entao credencial ausente nao pode derrubar nada.
  if (NO_VPS) return {};
  return Object.fromEntries(
    readFileSync(new URL('../.env', import.meta.url), 'utf8')
      .split('\n').map((l) => l.trim())
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
  );
}

function parseArgs(argv) {
  const o = { dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--desde')        o.desde = argv[++i];
    else if (argv[i] === '--ate')     o.ate = argv[++i];
    else if (argv[i] === '--horas')   o.horas = parseInt(argv[++i], 10);
    else if (argv[i] === '--dry-run') o.dryRun = true;
  }
  return o;
}

/**
 * Executa um comando onde os containers estao: shell local quando ja e o VPS,
 * SSH quando e a maquina do dev. O resto do script nao precisa saber qual.
 */
function ssh(env, command) {
  if (NO_VPS) {
    return new Promise((resolve) => {
      execFile('/bin/bash', ['-c', command], { maxBuffer: 64 * 1024 * 1024 },
        (_e, stdout, stderr) => resolve({ out: stdout || '', err: stderr || '' }));
    });
  }
  return new Promise((resolve, reject) => {
    const conn = new Client();
    let out = '', err = '';
    conn.on('ready', () => {
      conn.exec(command, (e, stream) => {
        if (e) return reject(e);
        stream.on('data', (d) => { out += d.toString(); });
        stream.stderr.on('data', (d) => { err += d.toString(); });
        stream.on('close', () => { conn.end(); resolve({ out, err }); });
      });
    }).on('error', reject).connect({
      host: env.DEPLOY_SSH_HOST,
      port: parseInt(env.DEPLOY_SSH_PORT || '22', 10),
      username: env.DEPLOY_SSH_USER,
      password: env.DEPLOY_SSH_PASSWORD,
    });
  });
}

/** Roda SQL no Postgres da Evolution. O SQL vai por base64 pra escapar de aspas. */
async function evoQuery(env, sql) {
  const b64 = Buffer.from(sql, 'utf8').toString('base64');
  const cmd = `echo '${b64}' | base64 -d | docker exec -i ${PG_CONTAINER} `
            + `psql -U evolution -d evolution -t -A -F$'\\t'`;
  const { out, err } = await ssh(env, cmd);
  if (err && !out) throw new Error(`psql: ${err.slice(0, 400)}`);
  return out.split('\n').map((l) => l.trimEnd()).filter(Boolean);
}

const args = parseArgs(process.argv.slice(2));
const env = loadEnv();

// Janela de tempo. --horas serve o cron; --desde/--ate a recuperacao manual.
let filtroTempo;
if (args.horas) {
  filtroTempo = `to_timestamp("messageTimestamp") > now() - interval '${args.horas} hours'`;
} else if (args.desde || args.ate) {
  const desde = args.desde || '2000-01-01';
  const ate   = args.ate   || '2100-01-01';
  filtroTempo = `to_timestamp("messageTimestamp") >= '${desde}' AND to_timestamp("messageTimestamp") < '${ate}'`;
} else {
  console.error('uso: --desde AAAA-MM-DD [--ate AAAA-MM-DD] | --horas N   [--dry-run]');
  process.exit(2);
}

console.log(`[backfill] janela: ${args.horas ? `ultimas ${args.horas}h` : `${args.desde || '...'} -> ${args.ate || '...'}`}`);
console.log(`[backfill] modo:   ${args.dryRun ? 'DRY-RUN (nao envia nada)' : 'ENVIO REAL'}`);

// Mapa instanceId -> nome, pro payload sair com o nome que o webhook resolve.
const instRows = await evoQuery(env, 'SELECT id, name FROM "Instance";');
const instancias = new Map(instRows.map((l) => l.split('\t')));
console.log(`[backfill] instancias: ${[...instancias.values()].join(', ')}`);

// Grupo e broadcast ficam de fora ja na origem: o webhook tambem os recusa, mas
// nao ha razao pra trafegar 16 linhas so pra receber "nao".
const where = `${filtroTempo} AND key->>'remoteJid' NOT LIKE '%@g.us' AND key->>'remoteJid' NOT LIKE '%broadcast%'`;

const [{ total }] = (await evoQuery(env, `SELECT COUNT(*) FROM "Message" WHERE ${where};`))
  .map((l) => ({ total: parseInt(l, 10) }));
console.log(`[backfill] ${total} mensagens na janela`);

if (!total) { console.log('[backfill] nada a fazer'); process.exit(0); }

if (args.dryRun) {
  const porTipo = await evoQuery(env,
    `SELECT "messageType", COUNT(*) FROM "Message" WHERE ${where} GROUP BY 1 ORDER BY 2 DESC;`);
  console.log('[backfill] por tipo:');
  for (const l of porTipo) { const [t, c] = l.split('\t'); console.log(`  ${String(c).padStart(5)}  ${t}`); }
  const semAlt = await evoQuery(env,
    `SELECT COUNT(*) FROM "Message" WHERE ${where} AND key->>'remoteJid' LIKE '%@lid' AND NOT (key ? 'remoteJidAlt');`);
  console.log(`[backfill] @lid sem numero real (serao puladas): ${semAlt[0] || 0}`);
  console.log('[backfill] dry-run: nada foi enviado');
  process.exit(0);
}

// Segredo do webhook, lido do ambiente da edge function (nao trafega por aqui
// alem do necessario).
const { out: segredo } = await ssh(env,
  `docker exec ${EDGE_CONTAINER} printenv EVOLUTION_WEBHOOK_SECRET 2>/dev/null || true`);
const secret = segredo.trim();

// mode=existing_only: nunca cria lead. Ver plano/decisao do dono do produto.
const url = `${WEBHOOK_URL}?mode=existing_only${secret ? `&secret=${secret}` : ''}`;

let enviadas = 0, falhas = 0;

for (let offset = 0; offset < total; offset += LOTE) {
  // ORDER BY ASC e inegociavel: define a ordem de insercao, que vira o
  // desempate de exibicao das mensagens que empatam no mesmo segundo.
  const linhas = await evoQuery(env, `
    SELECT "instanceId", jsonb_build_object(
             'key', key, 'message', message,
             'messageTimestamp', "messageTimestamp",
             'pushName', "pushName", 'status', status
           )::text
    FROM "Message" WHERE ${where}
    ORDER BY "messageTimestamp" ASC, id ASC
    LIMIT ${LOTE} OFFSET ${offset};`);

  for (const linha of linhas) {
    const sep = linha.indexOf('\t');
    const instanceId = linha.slice(0, sep);
    const nome = instancias.get(instanceId);
    if (!nome) { falhas++; continue; }

    let data;
    try { data = JSON.parse(linha.slice(sep + 1)); }
    catch { falhas++; continue; }

    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'messages.upsert', instance: nome, data }),
      });
      // 500 aqui e o webhook pedindo reentrega (falha nossa, transitoria).
      // Nao retentamos no script: a proxima passada do cron pega.
      if (!r.ok) falhas++;
      else enviadas++;
    } catch { falhas++; }

    await new Promise((s) => setTimeout(s, PAUSA_MS));
  }

  console.log(`[backfill] ${Math.min(offset + LOTE, total)}/${total}  enviadas=${enviadas} falhas=${falhas}`);
}

console.log(`[backfill] fim. enviadas=${enviadas} falhas=${falhas}`);
console.log('[backfill] confira: crm_messages na janela, e crm_webhook_dead_letter por reason');

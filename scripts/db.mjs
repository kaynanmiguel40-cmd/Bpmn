/**
 * db.mjs — roda SQL no Postgres do VPS (Supabase self-hosted).
 *
 * Reusa as credenciais de SSH do deploy.mjs (.env), abre conexao e manda o SQL
 * pro psql dentro do container. O arquivo vai por base64 pra nao depender de
 * escape de shell (o SQL tem aspas, $$ e acento).
 *
 * Uso:
 *   node scripts/db.mjs --file database/080_crm_stage_playbook.sql
 *   node scripts/db.mjs --query "SELECT name FROM crm_pipeline_stages;"
 *
 * ON_ERROR_STOP=1 e proposital: sem ele o psql segue rodando os comandos
 * seguintes depois de um erro e a migration aplica pela metade, em silencio.
 */

import { createRequire } from 'module';
import { readFileSync } from 'fs';

const require = createRequire(import.meta.url);
const { Client } = require('ssh2');

const CONTAINER = 'supabase-db';

function loadEnv() {
  return Object.fromEntries(
    readFileSync(new URL('../.env', import.meta.url), 'utf8')
      .split('\n')
      .map(l => l.trim())
      .filter(l => l && !l.startsWith('#') && l.includes('='))
      .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; }),
  );
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--file') out.file = argv[++i];
    else if (argv[i] === '--query') out.query = argv[++i];
  }
  return out;
}

function run(env, command) {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    conn.on('ready', () => {
      conn.exec(command, (err, stream) => {
        if (err) return reject(err);
        let code = 0;
        stream.on('data', d => process.stdout.write(d.toString()));
        stream.stderr.on('data', d => process.stderr.write(d.toString()));
        stream.on('exit', c => { code = c; });
        stream.on('close', () => { conn.end(); resolve(code); });
      });
    })
      .on('error', reject)
      .connect({
        host: env.DEPLOY_SSH_HOST,
        port: parseInt(env.DEPLOY_SSH_PORT || '22', 10),
        username: env.DEPLOY_SSH_USER,
        password: env.DEPLOY_SSH_PASSWORD,
        privateKey: env.DEPLOY_SSH_KEY_PATH ? readFileSync(env.DEPLOY_SSH_KEY_PATH) : undefined,
      });
  });
}

const args = parseArgs(process.argv.slice(2));
if (!args.file && !args.query) {
  console.error('uso: node scripts/db.mjs --file <arquivo.sql> | --query "<sql>"');
  process.exit(2);
}

const sql = args.file ? readFileSync(args.file, 'utf8') : args.query;
const b64 = Buffer.from(sql, 'utf8').toString('base64');
const cmd = `echo '${b64}' | base64 -d | docker exec -i ${CONTAINER} psql -U postgres -d postgres -v ON_ERROR_STOP=1`;

console.log(`[db] ${args.file ? `arquivo ${args.file}` : 'query'} (${sql.length} bytes) -> ${CONTAINER}`);
const code = await run(loadEnv(), cmd);
console.log(`[db] exit ${code}`);
process.exit(code);

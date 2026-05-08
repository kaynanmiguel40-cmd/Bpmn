import { createRequire } from 'module';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const { Client } = require('ssh2');

// Le credenciais do .env (que esta no .gitignore — nunca vai pro git).
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '.env');

if (!existsSync(envPath)) {
  console.error('[check] .env nao encontrado em', envPath);
  console.error('[check] Crie o arquivo com DEPLOY_SSH_HOST, DEPLOY_SSH_USER, DEPLOY_SSH_PASSWORD.');
  process.exit(1);
}

const env = {};
for (const line of readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const host = env.DEPLOY_SSH_HOST;
const port = parseInt(env.DEPLOY_SSH_PORT || '22', 10);
const username = env.DEPLOY_SSH_USER;
const password = env.DEPLOY_SSH_PASSWORD;

if (!host || !username || !password) {
  console.error('[check] Variaveis ausentes no .env: DEPLOY_SSH_HOST, DEPLOY_SSH_USER, DEPLOY_SSH_PASSWORD.');
  process.exit(1);
}

const conn = new Client();
conn.on('ready', () => {
  const cmd = `
    echo "=== /var/www/bpmn ===" && ls /var/www/bpmn 2>/dev/null || echo "pasta nao existe"
    echo "=== package.json bpmn ===" && cat /var/www/bpmn/package.json 2>/dev/null | grep -E '"name"|"scripts"' | head -5
    echo "=== nginx configs ===" && ls /etc/nginx/sites-enabled/ 2>/dev/null
    echo "=== pm2 full list ===" && pm2 list
    echo "=== bpmn git remote ===" && cd /var/www/bpmn 2>/dev/null && git remote -v
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) { conn.end(); return; }
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', () => conn.end());
  });
}).connect({ host, port, username, password, readyTimeout: 20000 });
conn.on('error', err => console.error(err.message));

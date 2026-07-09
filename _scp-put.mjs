// Upload de arquivo local -> VPS via SFTP, usando DEPLOY_SSH_* do .env.
// Uso: node _scp-put.mjs <localPath> <remotePath>
import { readFileSync, existsSync } from 'fs';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const require = createRequire(import.meta.url);
const { Client } = require('ssh2');

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '.env');
if (!existsSync(envPath)) { console.error('[scp] .env nao encontrado'); process.exit(1); }
const env = {};
for (const line of readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
  if (m) env[m[1]] = m[2].replace(/^['"]|['"]$/g, '');
}

const [localPath, remotePath] = process.argv.slice(2);
if (!localPath || !remotePath) { console.error('[scp] uso: node _scp-put.mjs <local> <remote>'); process.exit(1); }
if (!existsSync(localPath)) { console.error('[scp] local nao existe:', localPath); process.exit(1); }

const conn = new Client();
conn.on('ready', () => {
  conn.sftp((err, sftp) => {
    if (err) { console.error('[scp] sftp err:', err.message); conn.end(); process.exit(1); }
    sftp.fastPut(localPath, remotePath, (e) => {
      if (e) { console.error('[scp] put err:', e.message); conn.end(); process.exit(1); }
      console.log('UPLOADED', localPath, '->', remotePath);
      conn.end();
    });
  });
}).on('error', (e) => { console.error('[scp] conn err:', e.message); process.exit(1); })
  .connect({
    host: env.DEPLOY_SSH_HOST,
    port: parseInt(env.DEPLOY_SSH_PORT || '22', 10),
    username: env.DEPLOY_SSH_USER,
    password: env.DEPLOY_SSH_PASSWORD,
    readyTimeout: 30_000,
  });

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Conectado! Corrigindo dependencia e buildando...\n');

  const cmd = `
    set -e
    cd /opt/fyness/frontend

    echo "=== Git stash + pull ==="
    git stash --include-untracked
    git pull origin master

    echo "=== Instalando dependencias ==="
    npm install

    echo "=== Build ==="
    npm run build

    echo "=== Nginx reload ==="
    nginx -s reload

    echo "=== Deploy concluido! ==="
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) { console.error(err); conn.end(); return; }
    stream.on('data', d => process.stdout.write(d));
    stream.stderr.on('data', d => process.stderr.write(d));
    stream.on('close', code => {
      console.log('\nCodigo de saida:', code);
      conn.end();
    });
  });
}).connect({ host: '187.127.6.160', port: 22, username: 'root', password: 'Fyness123456#', readyTimeout: 20000 });
conn.on('error', err => console.error('Erro:', err.message));

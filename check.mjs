import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Client } = require('ssh2');

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
}).connect({ host: '31.97.16.109', port: 22, username: 'root', password: 'Holding123456#', readyTimeout: 20000 });
conn.on('error', err => console.error(err.message));

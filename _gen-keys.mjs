// Gera segredos pro Supabase self-hosted: JWT_SECRET + ANON_KEY + SERVICE_ROLE_KEY
// (JWTs HS256 assinados com o JWT_SECRET) + POSTGRES_PASSWORD. Sem deps externas.
import crypto from 'crypto';

function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function sign(payload, secret) {
  const h = b64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const p = b64url(JSON.stringify(payload));
  const data = `${h}.${p}`;
  const sig = b64url(crypto.createHmac('sha256', secret).update(data).digest());
  return `${data}.${sig}`;
}

const jwtSecret = crypto.randomBytes(32).toString('hex'); // 64 hex chars
const pgPass = crypto.randomBytes(24).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 28);
const iat = Math.floor(Date.now() / 1000);
const exp = iat + 60 * 60 * 24 * 365 * 10; // 10 anos
const anon = sign({ role: 'anon', iss: 'supabase', iat, exp }, jwtSecret);
const service = sign({ role: 'service_role', iss: 'supabase', iat, exp }, jwtSecret);

console.log(JSON.stringify({ jwtSecret, pgPass, anon, service }));

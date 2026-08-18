/**
 * Importa leads de estética/beleza da planilha de Passos/MG pro CRM.
 *
 * ESCOLHAS QUE VALEM SER LIDAS ANTES DE RODAR:
 *
 * 1. FONTE = aba "Contato do Dono", não "Base Completa". As duas têm as mesmas
 *    empresas, mas a primeira só traz as 2.847 em que a planilha tem confiança
 *    ALTA de que o telefone cai na mão do DONO. Ligar pra recepção de clínica é
 *    queimar toque: quem atende não decide e não passa.
 *
 * 2. SERVIÇO, não varejo. "Beleza e Estética" mistura clínica/salão (serviço,
 *    caixa diário, agenda cheia — o ICP do Fyness) com loja de cosméticos
 *    (varejo, outra conversa). Fica só o serviço.
 *
 * 3. ETAPA = "Cadencia", não "Leads". A etapa Leads tem 4 passos marcados por
 *    ORIGEM (anúncio / parceiro / indicação / Instagram) e prospecção ativa não
 *    casa com nenhuma — o filtro cai no fallback e entrega os 4 passos errados
 *    pra cada lead. Cadencia é a cadência fria, que é exatamente o que isto é.
 *
 * 4. REVEZAMENTO na divisão. Os 40 melhores saem ordenados por qualidade e vão
 *    1º→Lhorena, 2º→Kaua, 3º→Lhorena... Dar o topo pra um e a sobra pro outro
 *    faria a comparação entre os dois medir a lista, não o vendedor.
 *
 * Uso:  node scripts/importar_leads_estetica.mjs            (prévia)
 *       node scripts/importar_leads_estetica.mjs --aplicar  (grava)
 */

import XLSX from 'xlsx';
import { execFileSync } from 'child_process';
import { writeFileSync, readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const RAIZ = join(__dirname, '..');
const APLICAR = process.argv.includes('--aplicar');
const PLANILHA = process.env.PLANILHA
  || join(process.env.USERPROFILE || process.env.HOME, 'Downloads', 'PARA Claude', 'empresas_passos.xlsx');

const PIPELINE_GERAL = 'a1e1e2bb-0000-0000-0000-000000000000'; // resolvido em runtime
const STAGE_CADENCIA = 'ecc39a55-2f4a-4442-8017-fc72143f0eda';
const VENDEDORES = [
  { nome: 'Lhorena',   memberId: 'be3691fd-6859-4e76-ac02-58db09489406', auth: '66f7bcb3-6f48-4f41-a4cc-522c02a2101d' },
  { nome: 'Kaua Reis', memberId: 'member_1771239896509',                auth: '68847090-0881-491e-91db-ab73304d8a9e' },
];
const POR_VENDEDOR = 20;
const ORIGEM = 'Prospecção ativa — Passos/MG';

const tem = (v) => v != null && String(v).trim() !== '' && String(v).trim() !== '-';
const txt = (v) => (tem(v) ? String(v).trim() : null);
const so9 = (v) => String(v || '').replace(/\D/g, '');
const sql = (v) => (v == null ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);

function psql(query) {
  const script = `docker exec -i supabase-db psql -U postgres -d postgres -tAc ${JSON.stringify(query.replace(/\s+/g, ' ').trim())}`;
  const b64 = Buffer.from(script, 'utf8').toString('base64');
  return execFileSync('node', [join(RAIZ, '_ssh-run.mjs'), `echo '${b64}' | base64 -d | bash`],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }).trim();
}

// ─── 1. Planilha ─────────────────────────────────────────────────────────────
const wb = XLSX.readFile(PLANILHA);
const donos = XLSX.utils.sheet_to_json(wb.Sheets['Contato do Dono'], { defval: null });
const base = XLSX.utils.sheet_to_json(wb.Sheets['Base Completa'], { defval: null });
const baseporCnpj = new Map(base.map(r => [so9(r.CNPJ), r]));

// Serviço de estética/beleza. O CNAE de cosmético é varejo e fica de fora.
const E_SERVICO = /atividades de est[eé]tica|cabeleireiro/i;
// 3 anos é CORTE, não peso. O ICP do Fyness é problem-aware: o dono já sabe que
// está desorganizado e procura solução. Quem abriu ano passado ainda controla de
// cabeça e não reconhece o problema — pitch de organização financeira nele é
// evangelização, não venda. Há 47 candidatos com 3+ anos pros 40 que precisamos,
// então o corte cabe sem raspar o fundo da lista.
const IDADE_MINIMA = 3;
const candidatos = donos
  .filter(d => E_SERVICO.test(String(d['Atividade (CNAE)'] || '')))
  .map(d => ({ dono: d, emp: baseporCnpj.get(so9(d.CNPJ)) || {} }))
  .filter(c => (Number(c.emp.Anos ?? c.dono.Anos) || 0) >= IDADE_MINIMA);

// ─── 2. Qualidade ────────────────────────────────────────────────────────────
// O que faz um lead destes valer a próxima hora, na ordem em que pesa:
function qualidade({ dono, emp }) {
  let s = 0; const por = [];
  const anos = Number(emp.Anos ?? dono.Anos) || 0;
  // Empresa madura já acumulou bagunça financeira que dói. A recém-aberta ainda
  // está no "dá pra controlar de cabeça" — é o público que não reconhece o problema.
  if (anos >= 10) { s += 30; por.push(`${anos} anos`); }
  else if (anos >= 5) { s += 25; por.push(`${anos} anos`); }
  else if (anos >= 3) { s += 15; por.push(`${anos} anos`); }
  else por.push(`${anos} anos (nova)`);
  // Sócio-administrador é quem assina. "Sócio" solto pode ser cotista sem mando.
  if (/administrador/i.test(String(dono.Cargo || ''))) { s += 15; por.push('decisor'); }
  // Clínica de estética tem ticket e recorrência maiores que salão de bairro.
  if (/est[eé]tica/i.test(String(dono['Atividade (CNAE)'] || ''))) { s += 12; por.push('clínica'); }
  // EPP fatura mais que MICRO — mais perto do piso de R$10k/mês do ICP.
  if (/PEQUENO/i.test(String(emp.Porte || ''))) { s += 12; por.push('EPP'); }
  else if (/MICRO/i.test(String(emp.Porte || ''))) { s += 6; }
  // Canal a mais = mais chance de alcançar. E-mail destrava os 3 passos de
  // e-mail da cadência; sem ele o agendador simplesmente os descarta.
  if (tem(dono['E-mail']) || tem(emp['E-mail'])) { s += 10; por.push('e-mail'); }
  if (tem(emp.Instagram) || tem(dono.Instagram)) { s += 8; por.push('Instagram'); }
  if (tem(emp['WhatsApp?']) && !/n[aã]o/i.test(String(emp['WhatsApp?']))) { s += 8; por.push('WhatsApp'); }
  if (tem(emp.Site)) { s += 4; }
  // Sócio único decide sozinho; sociedade divide a decisão e alonga o ciclo.
  if (Number(dono.Socios) === 1) { s += 6; por.push('sócio único'); }
  if (tem(emp['Nome Fantasia'])) s += 3;
  return { score: s, motivos: por };
}

const ranqueados = candidatos
  .map(c => ({ ...c, ...qualidade(c) }))
  .sort((a, b) => b.score - a.score);

// ─── 3. Dedupe contra o CRM ──────────────────────────────────────────────────
const cnpjsCrm = new Set(
  JSON.parse(psql(`SELECT coalesce(json_agg(DISTINCT regexp_replace(coalesce(cnpj,''),'[^0-9]','','g')),'[]')
                   FROM crm_companies WHERE deleted_at IS NULL AND coalesce(cnpj,'') <> ''`) || '[]'));
const telsCrm = new Set(
  JSON.parse(psql(`SELECT coalesce(json_agg(DISTINCT right(regexp_replace(t,'[^0-9]','','g'),8)),'[]') FROM (
                     SELECT phone AS t FROM crm_contacts WHERE deleted_at IS NULL AND coalesce(phone,'')<>''
                     UNION ALL SELECT contact_phone FROM crm_deals WHERE deleted_at IS NULL AND coalesce(contact_phone,'')<>''
                     UNION ALL SELECT phone FROM crm_companies WHERE deleted_at IS NULL AND coalesce(phone,'')<>''
                   ) s(t)`) || '[]'));

const vistos = new Set();
const selecionados = [];
let pulados = 0;
for (const c of ranqueados) {
  if (selecionados.length >= POR_VENDEDOR * VENDEDORES.length) break;
  const cnpj = so9(c.dono.CNPJ);
  const cel = so9(c.dono.Celular || c.dono['Para discar']);
  const suf = cel.slice(-8);
  if (!cnpj || !suf || suf.length < 8) { pulados++; continue; }
  if (cnpjsCrm.has(cnpj) || telsCrm.has(suf) || vistos.has(cnpj) || vistos.has(suf)) { pulados++; continue; }
  vistos.add(cnpj); vistos.add(suf);
  selecionados.push(c);
}

// ─── 4. Revezamento e montagem das linhas ────────────────────────────────────
const CORES = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#f97316', '#6366f1'];
const geralId = psql(`SELECT id FROM crm_pipelines WHERE name='Geral' LIMIT 1`).trim() || PIPELINE_GERAL;

const empresas = [], contatos = [], negocios = [], previa = [];
selecionados.forEach((c, i) => {
  const { dono, emp, score, motivos } = c;
  const vend = VENDEDORES[i % VENDEDORES.length];
  const companyId = randomUUID(), contactId = randomUUID(), dealId = randomUUID();

  const nomeEmpresa = txt(emp['Nome Fantasia']) || txt(dono.Empresa) || txt(emp['Razao Social']);
  const telefone = txt(dono.Celular) || txt(dono['Telefone cadastrado']);
  const email = txt(dono['E-mail']) || txt(emp['E-mail']);
  const endereco = [txt(emp.Rua) || txt(dono.Rua), txt(emp.Num) || txt(dono.Num), txt(emp['Compl.'])]
    .filter(Boolean).join(', ');
  // Estrelas = QUALIDADE (fit com o ICP), que é o que elas medem no leadScore.
  const estrelas = score >= 70 ? 5 : score >= 55 ? 4 : 3;

  // Nada da planilha se perde: o que não tem coluna no CRM vira nota da empresa.
  const notas = [
    `Importado da lista de Passos/MG em ${new Date().toLocaleDateString('pt-BR')}.`,
    `Qualidade ${score} — ${motivos.join(', ')}.`,
    txt(emp['Razao Social']) && `Razão social: ${emp['Razao Social']}`,
    txt(dono.Cargo) && `Cargo do contato: ${dono.Cargo}`,
    txt(emp.CNAE) && `CNAE ${emp.CNAE} — ${txt(emp['Subnicho (CNAE)']) || ''}`,
    txt(emp.Regime) && `Regime: ${emp.Regime}`,
    tem(emp['Capital Social']) && `Capital social: ${emp['Capital Social']}`,
    txt(emp.Abertura) && `Aberta em ${emp.Abertura} (${emp.Anos} anos)`,
    tem(dono.Socios) && `Sócios: ${dono.Socios}`,
    txt(emp.Bairro) && `Bairro: ${emp.Bairro}`,
    txt(emp.CEP) && `CEP: ${emp.CEP}`,
    txt(emp['Telefone 2']) && `Telefone 2: ${emp['Telefone 2']}`,
    txt(emp.Instagram) && `Instagram: ${emp.Instagram}`,
    txt(emp.Facebook) && `Facebook: ${emp.Facebook}`,
    txt(emp['WhatsApp (site)']) && `WhatsApp do site: ${emp['WhatsApp (site)']}`,
    txt(emp['Horario (OSM)']) && `Horário: ${emp['Horario (OSM)']}`,
    tem(emp.Latitude) && `Coordenadas: ${emp.Latitude}, ${emp.Longitude}`,
  ].filter(Boolean).join('\n');

  empresas.push(`(${sql(companyId)}, ${sql(nomeEmpresa)}, ${sql(txt(dono.CNPJ))}, ${sql(txt(dono.Nicho))}, ` +
    `${sql(txt(emp.Porte))}, ${sql(telefone)}, ${sql(email)}, ${sql(txt(emp.Site))}, ${sql(endereco || null)}, ` +
    `'Passos', 'MG', ${sql(notas)}, ${sql(vend.auth)})`);

  contatos.push(`(${sql(contactId)}, ${sql(txt(dono['Dono / Responsavel']))}, ${sql(email)}, ${sql(telefone)}, ` +
    `${sql(txt(dono.Cargo))}, ${sql(CORES[i % CORES.length])}, ${sql(companyId)}, 'Passos', 'MG', ${sql(vend.auth)})`);

  negocios.push(`(${sql(dealId)}, ${sql(nomeEmpresa)}, ${sql(contactId)}, ${sql(companyId)}, ` +
    `${sql(txt(dono['Dono / Responsavel']))}, ${sql(telefone)}, ${sql(email)}, ${sql(geralId)}, ${sql(STAGE_CADENCIA)}, ` +
    `${sql(vend.memberId)}, ${sql(ORIGEM)}, ${sql(txt(dono.Nicho))}, 'open', 10, ${estrelas}, ${sql(vend.auth)})`);

  previa.push({ '#': i + 1, vendedor: vend.nome, empresa: (nomeEmpresa || '').slice(0, 30),
    dono: (txt(dono['Dono / Responsavel']) || '').slice(0, 24), tel: telefone,
    anos: Number(emp.Anos) || 0, porte: (txt(emp.Porte) || '').slice(0, 12), q: score, estrelas });
});

console.table(previa);
console.log(`\nCandidatos de estética/beleza (serviço, tel do dono): ${candidatos.length}`);
console.log(`Selecionados: ${selecionados.length}  |  pulados por duplicidade/dado ruim: ${pulados}`);
for (const v of VENDEDORES) console.log(`  ${v.nome}: ${previa.filter(p => p.vendedor === v.nome).length} leads`);

if (selecionados.length === 0) process.exit(0);

const script =
`BEGIN;
INSERT INTO crm_companies (id, name, cnpj, segment, size, phone, email, website, address, city, state, notes, created_by)
VALUES\n${empresas.join(',\n')};

INSERT INTO crm_contacts (id, name, email, phone, position, avatar_color, company_id, city, state, created_by)
VALUES\n${contatos.join(',\n')};

INSERT INTO crm_deals (id, title, contact_id, company_id, contact_name, contact_phone, contact_email,
                       pipeline_id, stage_id, owner_id, source, segment, status, probability, priority, created_by)
VALUES\n${negocios.join(',\n')};
COMMIT;
`;

const arquivo = join(__dirname, 'importar_leads_estetica.generated.sql');
writeFileSync(arquivo, script, 'utf8');
console.log(`\nSQL gerado em ${arquivo} (${script.length} bytes)`);

if (!APLICAR) { console.log('(sem --aplicar: nada foi gravado)'); process.exit(0); }

// SFTP, não base64 na linha de comando: o SQL tem ~55 KB e vira ~75 KB em
// base64. Embutido no comando, estoura o limite de tamanho do processo e o
// execFileSync falha ANTES de conectar (pid 0) — parece erro de banco e não é.
execFileSync('node', [join(RAIZ, '_scp-put.mjs'), arquivo, '/tmp/imp.sql'], { stdio: 'inherit' });
const cmd = 'docker cp /tmp/imp.sql supabase-db:/tmp/imp.sql && ' +
  'docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 -f /tmp/imp.sql';
console.log(execFileSync('node', [join(RAIZ, '_ssh-run.mjs'), cmd], { encoding: 'utf8' }));

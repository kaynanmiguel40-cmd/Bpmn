/**
 * normalizar_origens — junta as tags de origem que sao a mesma coisa escrita
 * de jeitos diferentes.
 *
 * O campo `source` e texto livre e virou 29 tags pra ~8 origens reais: o mesmo
 * parceiro aparece como "Indicação de parceiro (Edson)" e "Indicação parceiro
 * Edson"; "Prospecção ativa" (200 leads) convive com "Prospeccao ativa" (16).
 * No filtro da Pipeline isso vira cinco linhas do mesmo Edson, e qualquer
 * contagem por origem sai partida ao meio.
 *
 * O QUE FAZ:
 *   1. reescreve `crm_deals.source` pra forma canonica;
 *   2. apaga da lista de tags (`crm_lead_sources`) as variantes que sobraram;
 *   3. nunca junta duas origens que sejam REALMENTE diferentes — o mapa abaixo
 *      e explicito, nao heuristico. Adivinhar aqui misturaria parceiros.
 *
 * Uso:
 *   node scripts/normalizar_origens.mjs           # SIMULA
 *   node scripts/normalizar_origens.mjs --aplicar
 */

import { execFileSync } from 'child_process';

const APLICAR = process.argv.includes('--aplicar');
const lit = (v) => `'${String(v).replace(/'/g, "''")}'`;

function sql(query) {
  return execFileSync('node', ['scripts/db.mjs', '--query', query], {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  });
}

/**
 * variante -> forma canonica.
 *
 * A forma canonica do parceiro e "Indicação de parceiro (Nome)": e a que ja
 * domina na base E a que `getLeadsByPartner` procura (ele casa por "(Nome)").
 * Escrever de outro jeito faz o lead sumir da pagina do parceiro.
 */
const MAPA = {
  // — mesmo parceiro, grafias diferentes —
  'Indicação parceiro Edson': 'Indicação de parceiro (Edson)',
  'Indicação Parceiro João': 'Indicação de parceiro (João)',
  'Indicação do nosso parceiro Luan': 'Indicação de parceiro (Luan)',
  'Indicação de Parceiro (Luan)': 'Indicação de parceiro (Luan)',
  'Indicação Robert': 'Indicação de parceiro (Robert)',
  'Indicação de Parceiro (Claudio)': 'Indicação de parceiro (Claudio)',
  'Indicação de Parceiro (James)': 'Indicação de parceiro (James)',
  'Indicação do nosso parcerio Rogerio': 'Indicação de parceiro (Rogerio)',
  'Indicação Bruno Contador': 'Indicação de parceiro (Bruno)',

  // — acento e caixa —
  'Prospeccao ativa': 'Prospecção ativa',
  'Trafego pago': 'Tráfego pago',
  'Indicacao de contador': 'Indicação de parceiro',
  'Indicacao de parceiro': 'Indicação de parceiro',
};

/**
 * NAO entram no mapa, de proposito:
 *   "Indicação do Kaua", "Indicação Guilherme", "Indicação Kaynan",
 *   "Indicação Felipe Reis (grafica)", "Base clientes Sergio",
 *   "Venda Ernandes", "Indicacao / WhatsApp", "Leads de Parceiros"
 *
 * Sao indicacoes de pessoas que NAO estao na tabela de parceiros — juntar cada
 * uma em "parceiro" mudaria o significado (e o peso no score de origem, onde
 * parceiro e indicacao pontuam diferente). Ficam como estao ate alguem dizer
 * quem e parceiro de fato.
 */

// Separador proprio: o COPY escapa tabulacao como o TEXTO "\t" (dois
// caracteres), entao dividir por tab de verdade nao acha linha nenhuma.
const SEP = '<%|%>';
const linhas = sql(`COPY (
  SELECT s.name || '${SEP}' || (SELECT count(*) FROM crm_deals d WHERE d.deleted_at IS NULL AND d.source = s.name)
  FROM crm_lead_sources s ORDER BY s.name) TO STDOUT;`)
  .split('\n').filter(l => l.includes(SEP))
  .map(l => { const [name, n] = l.split(SEP); return { name, leads: Number(n) }; });

const statements = [];
let deals = 0, tags = 0;

console.log('MUDANCAS:\n');
for (const { name, leads } of linhas) {
  const alvo = MAPA[name];
  if (!alvo || alvo === name) continue;
  console.log(`  ${String(leads).padStart(3)} leads | ${name}\n               -> ${alvo}`);
  deals += leads;
  tags += 1;
  if (leads > 0) {
    statements.push(`UPDATE crm_deals SET source = ${lit(alvo)} WHERE source = ${lit(name)} AND deleted_at IS NULL;`);
  }
  // A tag alvo pode nao existir ainda (ex.: "(Rogerio)"): cria antes de apagar
  // a variante, senao o filtro fica sem a opcao.
  statements.push(`INSERT INTO crm_lead_sources (name) SELECT ${lit(alvo)} WHERE NOT EXISTS (SELECT 1 FROM crm_lead_sources WHERE name = ${lit(alvo)});`);
  statements.push(`DELETE FROM crm_lead_sources WHERE name = ${lit(name)};`);
}

// Tag sem nenhum lead e que ninguem mais usa: so polui o filtro.
const orfas = linhas.filter(l => l.leads === 0 && !MAPA[l.name]);
if (orfas.length) {
  console.log('\nTAGS SEM NENHUM LEAD (ficam, mas vale saber):');
  orfas.forEach(o => console.log(`    ${o.name}`));
}

console.log(`\n${tags} tags juntadas · ${deals} negocios reescritos`);
console.log(`de ${linhas.length} tags -> ${linhas.length - tags}`);

if (!APLICAR) {
  console.log('\nSIMULACAO — nada foi gravado. Rode com --aplicar.');
  process.exit(0);
}

const script = ['BEGIN;', ...statements, 'COMMIT;'].join('\n');
const { writeFileSync, unlinkSync } = await import('fs');
const arquivo = 'database/_tmp_normalizar_origens.sql';
writeFileSync(arquivo, script, 'utf8');
console.log('\naplicando…');
console.log(execFileSync('node', ['scripts/db.mjs', '--file', arquivo], { encoding: 'utf8' }).split('\n').slice(-3).join('\n'));
unlinkSync(arquivo);
console.log('pronto.');

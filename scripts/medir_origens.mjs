/**
 * medir_origens — recalcula a força de cada origem a partir da base real.
 *
 * Os pesos em ORIGEM_FORCA (src/modules/crm/services/leadScore.js) foram
 * medidos em 20/07/2026 e ENVELHECEM: canal que era bom pode saturar, e o
 * parceiro que fechava 30% pode virar 10% quando a base dele acaba. Rodar isto
 * de tempos em tempos é o que mantém a fila apontando pro lugar certo.
 *
 * O ajuste é encolhimento bayesiano: cada taxa é puxada na direção da média
 * geral na proporção da confiança que a amostra merece. Uma origem com 7 casos
 * não tem direito de mover a fila tanto quanto uma com 40 — sem isso, três
 * indicações de sorte jogam a categoria inteira pro topo e a operação passa
 * semanas perseguindo um número que nunca existiu.
 *
 * Uso: node scripts/medir_origens.mjs
 */

import { execFileSync } from 'child_process';

// Força do prior. k=20 significa "só acredito na taxa de uma origem depois de
// uns 20 negócios decididos". Abaixo disso ela fica perto da média geral.
const K = 20;

const SQL = `
WITH c AS (
  SELECT CASE
    WHEN source ~* 'tr[aá]fego|an[uú]ncio|ads?|pago' THEN 'trafego'
    WHEN source ~* 'parceiro|contador'               THEN 'parceiro'
    WHEN source ~* 'prospec|maps|lista'              THEN 'prospeccao'
    WHEN source ~* 'indica|cliente'                  THEN 'indicacao'
    ELSE 'desconhecida' END AS cat,
    status
  FROM crm_deals WHERE deleted_at IS NULL
)
SELECT cat, count(*) FILTER (WHERE status='won') AS ganhos,
       count(*) FILTER (WHERE status IN ('won','lost')) AS decididos
FROM c GROUP BY 1 ORDER BY 3 DESC`;

const saida = execFileSync('node', ['scripts/db.mjs', '--query', `COPY (${SQL}) TO STDOUT;`], {
  encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
});

const linhas = saida.split('\n')
  .filter(l => l.includes('\t'))
  .map(l => {
    const [cat, ganhos, decididos] = l.split('\t');
    return { cat, ganhos: Number(ganhos), decididos: Number(decididos) };
  })
  .filter(r => r.decididos > 0);

if (linhas.length === 0) {
  console.log('Sem negócios decididos ainda — nada a medir.');
  process.exit(0);
}

const totalG = linhas.reduce((a, r) => a + r.ganhos, 0);
const totalD = linhas.reduce((a, r) => a + r.decididos, 0);
const media = totalG / totalD;

const comAjuste = linhas.map(r => ({
  ...r,
  crua: r.ganhos / r.decididos,
  ajustada: (r.ganhos + K * media) / (r.decididos + K),
}));
const maior = Math.max(...comAjuste.map(r => r.ajustada));

console.log(`média geral: ${(media * 100).toFixed(1)}%  (${totalG}/${totalD})   prior k=${K}\n`);
console.log('origem'.padEnd(14) + 'n'.padStart(5) + 'crua'.padStart(9) + 'ajustada'.padStart(11) + 'peso'.padStart(7));
comAjuste.sort((a, b) => b.ajustada - a.ajustada).forEach(r => {
  console.log(
    r.cat.padEnd(14) + String(r.decididos).padStart(5) +
    `${(r.crua * 100).toFixed(1)}%`.padStart(9) +
    `${(r.ajustada * 100).toFixed(1)}%`.padStart(11) +
    (r.ajustada / maior).toFixed(2).padStart(7),
  );
});

console.log('\nPra atualizar, copie em ORIGEM_FORCA (leadScore.js):\n');
console.log('export const ORIGEM_FORCA = {');
comAjuste.forEach(r => console.log(`  ${r.cat}: ${(r.ajustada / maior).toFixed(2)},`));
console.log('  desconhecida: 0.5,');
console.log('};');

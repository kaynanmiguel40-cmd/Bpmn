import { readFileSync, writeFileSync } from 'fs';

const f = 'c:/Users/kayna/Bpmn/src/utils/marketingTemplate.js';
let c = readFileSync(f, 'utf8');

// ===================================================================
// FIX 1: Update Robert's target audience (MEI fraco → faturamento 10k+)
// ===================================================================
const oldRobertTarget = `PUBLICO-ALVO: MEI e EPP — dono de padaria, salao, loja, oficina, food truck, hotfruit.
NAO e empresario corporativo. E o Seu Ze que trabalha 12h por dia e nao sabe pra onde vai o dinheiro.`;

const newRobertTarget = `PUBLICO-ALVO: Dono de negocio que fatura R$10k+/mes — padaria, salao, loja, oficina, restaurante, hotfruit.
NAO e MEI fraco (fatura R$3-5k). E o pequeno empresario que JA TEM operacao rodando (funcionarios, estoque, fluxo)
mas controla tudo na cabeca, caderninho ou planilha abandonada. Ticket de R$197/mes faz sentido pra ele.
FILTRO: se o negocio nao fatura pelo menos R$10k/mes, o Fyness nao e pra ele (ainda).`;

if (!c.includes(oldRobertTarget)) { console.error('FIX 1 FAILED'); process.exit(1); }
c = c.replace(oldRobertTarget, newRobertTarget);
console.log('FIX 1: Robert target updated (10k+/mes) ✓');

// ===================================================================
// FIX 2: Update Kaynan's target audience
// ===================================================================
const oldKaynanTarget = `PUBLICO-ALVO: MEI e EPP. Kaynan fala com o dono de negocio pequeno que nao entende de tecnologia.
A linguagem e simples. "SaaS" nao existe no vocabulario do Seu Ze — falar "sistema", "app", "ferramenta".`;

const newKaynanTarget = `PUBLICO-ALVO: Dono de negocio que fatura R$10k+/mes. Nao e MEI fraco — e o cara que ja tem operacao,
funcionarios, e sente que perde dinheiro sem saber onde.
A linguagem e simples. "SaaS" nao existe no vocabulario dele — falar "sistema", "ferramenta".`;

if (!c.includes(oldKaynanTarget)) { console.error('FIX 2 FAILED'); process.exit(1); }
c = c.replace(oldKaynanTarget, newKaynanTarget);
console.log('FIX 2: Kaynan target updated (10k+/mes) ✓');

// ===================================================================
// FIX 3: Update Meta Ads targeting — add revenue filter
// ===================================================================
const oldMetaMEI = `PÚBLICO FRIO (Campanha Consciência) — FOCO MEI/EPP:
→ Interesses PRIMARIOS (nicho MEI):
  Microempreendedor Individual (MEI), Empreendedorismo,
  Pequenos Negocios, Comercio Local, Gestao de Negocios,
  Sebrae, Simples Nacional, MEI Facil
→ Interesses SECUNDARIOS (setores do publico-alvo):
  Padaria, Salao de Beleza, Barbearia, Food Truck, Loja de Roupas,
  Oficina Mecanica, Restaurante, Acai, Hamburgueria, Pet Shop`;

const newMetaMEI = `PÚBLICO FRIO (Campanha Consciência) — FOCO: NEGOCIO COM FATURAMENTO R$10k+/MES:
→ Interesses PRIMARIOS:
  Empreendedorismo, Pequenos Negocios, Gestao de Negocios,
  Sebrae, Simples Nacional, Comercio Local
  (EVITAR "MEI" isolado — atrai MEI fraco que fatura pouco)
→ Interesses SECUNDARIOS (setores com faturamento medio alto):
  Padaria, Salao de Beleza com funcionarios, Barbearia Premium,
  Restaurante, Hamburgueria, Pet Shop, Oficina Mecanica,
  Loja de Roupas, Acai, Food Truck (operacao media/grande)
→ FILTRO DE QUALIDADE (importante):
  Comportamento: "Administradores de Paginas de Negocios" (indica negocio real, nao hobby)
  Excluir: "Trabalho autonomo" sem equipe, "Freelancer", "Renda extra"
  Priorizar: quem tem funcionarios, quem usa maquininha de cartao, quem tem CNPJ ativo`;

if (!c.includes(oldMetaMEI)) { console.error('FIX 3 FAILED'); process.exit(1); }
c = c.replace(oldMetaMEI, newMetaMEI);
console.log('FIX 3: Meta Ads targeting filtered for 10k+/mes ✓');

// ===================================================================
// FIX 4: Update Google Ads keywords — remove MEI fraco terms
// ===================================================================
c = c.replace(
  'GRUPO 1: CONTROLE FINANCEIRO MEI/EPP (principal)',
  'GRUPO 1: CONTROLE FINANCEIRO — NEGOCIO COM OPERACAO (principal)'
);

c = c.replace(
  `TERMOS QUE MEI PESQUISA (linguagem real):`,
  `TERMOS QUE DONO DE NEGOCIO PESQUISA (faturamento R$10k+/mes):`
);

// Replace MEI-specific keywords with business owner keywords
c = c.replace(
  `"controle financeiro MEI"
"gestao financeira MEI"
"fluxo de caixa MEI"`,
  `"controle financeiro do meu negocio"
"gestao financeira para dono de negocio"
"fluxo de caixa restaurante"
"controle financeiro para quem tem funcionario"`
);

c = c.replace(
  `[controle financeiro mei]`,
  `[controle financeiro pequeno negocio]`
);
console.log('FIX 4: Google Ads keywords filtered for 10k+ ✓');

// ===================================================================
// FIX 5: Update Robert hooks — examples with 10k+ businesses
// ===================================================================
c = c.replace(
  `"Conheco dono de salao que fatura R$15 mil e no fim do mes nao tem R$2 mil na conta."`,
  `"Conheco dono de salao que fatura R$20 mil por mes e no fim nao tem R$3 mil na conta. Sabe por que?"`
);

c = c.replace(
  `"Voce que tem oficina, food truck, loja de roupa — se nao sabe seu lucro real, a gente precisa conversar."`,
  `"Voce que fatura R$10, 20, 30 mil por mes e nao sabe quanto sobra — a gente precisa conversar."`
);
console.log('FIX 5: Robert hooks updated for 10k+ audience ✓');

// ===================================================================
// FIX 6: Update CAC annotation with revenue filter
// ===================================================================
c = c.replace(
  `CAC MAXIMO E UNIT ECONOMICS`,
  `CAC MAXIMO, UNIT ECONOMICS E FILTRO DE CLIENTE`
);

c = c.replace(
  `REGRA DE OURO:
- CAC deve ser no maximo 25% do LTV
- Todo gateway de "escalar" nos pools deve checar CAC antes
- Escalar = mais budget SO SE CAC esta saudavel`,
  `REGRA DE OURO:
- CAC deve ser no maximo 25% do LTV
- Todo gateway de "escalar" nos pools deve checar CAC antes
- Escalar = mais budget SO SE CAC esta saudavel

FILTRO DE CLIENTE IDEAL:
- Faturamento minimo: R$10.000/mes
- Tem pelo menos 1 funcionario (indica operacao real)
- Controla financeiro na cabeca, caderninho ou planilha abandonada
- MEI fraco (fatura R$3-5k, sem funcionario) = NAO e cliente Fyness
  → Da muito trabalho de suporte e churn alto
  → R$197/mes pesa demais no orcamento dele`
);
console.log('FIX 6: CAC annotation updated with client filter ✓');

// ===================================================================
// WRITE
// ===================================================================
writeFileSync(f, c, 'utf8');
console.log('\nAll fixes applied. File saved.');
console.log('Total lines:', c.split('\n').length);

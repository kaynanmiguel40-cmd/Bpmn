/**
 * Modelos para o editor de briefing.
 *
 * Dois grupos:
 *  - FULL_BRIEFINGS: briefings profissionais COMPLETOS (documento inteiro pronto).
 *  - TABLE_SNIPPETS: facilitadores — tabelas/frameworks prontos pra inserir.
 *
 * Tudo e HTML (formato do editor). Regra das tabelas pra nao quebrar a insercao:
 * 1a linha com <th>, demais linhas com conteudo na 1a celula (evitar linha 100% vazia).
 */

// ============================================================
// BRIEFINGS COMPLETOS
// ============================================================

const BRIEFING_MODULO_SAAS = `
<h2>Briefing &mdash; Desenvolvimento de Modulo</h2>
<p><strong>Modulo:</strong> [nome] &nbsp;&bull;&nbsp; <strong>Responsavel:</strong> [quem] &nbsp;&bull;&nbsp; <strong>Prazo alvo:</strong> [data]</p>
<hr>
<h3>1. Contexto &amp; objetivo</h3>
<p>Que problema este modulo resolve e por que agora. Qual o resultado esperado para o usuario e para o negocio.</p>
<h3>2. Escopo</h3>
<p><strong>Entra nesta entrega:</strong></p>
<ul><li>...</li><li>...</li></ul>
<p><strong>NAO entra (fora de escopo):</strong></p>
<ul><li>...</li></ul>
<h3>3. Modelo de dados (Entidade-Relacionamento)</h3>
<p><strong>Entidades e atributos</strong></p>
<table><tbody><tr><th>Entidade</th><th>Atributos principais</th><th>Chave</th></tr><tr><td>Ex: Cliente</td><td>nome, email, status</td><td>id</td></tr><tr><td>...</td><td>...</td><td>id</td></tr></tbody></table>
<p><strong>Relacionamentos</strong></p>
<table><tbody><tr><th>De</th><th>Cardinalidade</th><th>Para</th></tr><tr><td>Cliente</td><td>1 : N</td><td>Pedido</td></tr></tbody></table>
<h3>4. Fases de desenvolvimento</h3>
<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p><strong>Modelagem &amp; schema</strong> &mdash; criar/migrar as tabelas no banco</p></li><li data-type="taskItem" data-checked="false"><p><strong>Backend / API</strong> &mdash; endpoints, regras de negocio, validacao</p></li><li data-type="taskItem" data-checked="false"><p><strong>Frontend / UI</strong> &mdash; telas e integracao</p></li><li data-type="taskItem" data-checked="false"><p><strong>Testes</strong> &mdash; caminho feliz + casos de borda</p></li><li data-type="taskItem" data-checked="false"><p><strong>Revisao do supervisor</strong> &mdash; aprovar antes do deploy</p></li><li data-type="taskItem" data-checked="false"><p><strong>Deploy &amp; monitoramento</strong></p></li></ul>
<h3>5. Criterios de aceite (Definition of Done)</h3>
<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Fluxo principal funciona de ponta a ponta</p></li><li data-type="taskItem" data-checked="false"><p>Casos de borda tratados (erro, vazio, permissao)</p></li><li data-type="taskItem" data-checked="false"><p>Nao quebrou nada que ja existia (sem regressao)</p></li><li data-type="taskItem" data-checked="false"><p>Build e testes passando</p></li></ul>
<h3>6. Revisao do supervisor (gate de aprovacao)</h3>
<p>Antes de liberar, o supervisor confere:</p>
<table><tbody><tr><th>Item avaliado</th><th>Aprovado?</th></tr><tr><td>Atende ao objetivo e ao escopo</td><td>&nbsp;</td></tr><tr><td>Modelo de dados coerente</td><td>&nbsp;</td></tr><tr><td>Qualidade do codigo / padroes do projeto</td><td>&nbsp;</td></tr><tr><td>Testado sem quebrar o resto</td><td>&nbsp;</td></tr><tr><td>Liberado para deploy</td><td>&nbsp;</td></tr></tbody></table>
<h3>7. Riscos &amp; dependencias</h3>
<ul><li>...</li></ul>
`;

const BRIEFING_BUG = `
<h2>Briefing &mdash; Correcao de Bug</h2>
<p><strong>Bug:</strong> [titulo] &nbsp;&bull;&nbsp; <strong>Gravidade:</strong> [baixa/media/alta/critica] &nbsp;&bull;&nbsp; <strong>Responsavel:</strong> [quem]</p>
<hr>
<h3>1. O que acontece (sintoma)</h3>
<p>Descreva o comportamento errado, com print/video se possivel.</p>
<h3>2. Como reproduzir</h3>
<ol><li>Passo 1</li><li>Passo 2</li><li>Resultado: o que aparece &nbsp;vs&nbsp; o que deveria aparecer</li></ol>
<h3>3. Investigacao &amp; causa raiz</h3>
<p>Onde esta o problema e por que acontece (use os "5 Porques" se ajudar).</p>
<h3>4. Correcao</h3>
<ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Aplicar o fix</p></li><li data-type="taskItem" data-checked="false"><p>Testar o cenario que falhava</p></li><li data-type="taskItem" data-checked="false"><p>Verificar que nao quebrou cenarios proximos</p></li></ul>
<h3>5. Revisao do supervisor</h3>
<table><tbody><tr><th>Item</th><th>Aprovado?</th></tr><tr><td>Causa raiz tratada (nao so o sintoma)</td><td>&nbsp;</td></tr><tr><td>Testado e sem regressao</td><td>&nbsp;</td></tr><tr><td>Liberado para deploy</td><td>&nbsp;</td></tr></tbody></table>
`;

const BRIEFING_SPIKE = `
<h2>Briefing &mdash; Pesquisa Tecnica (Spike)</h2>
<p><strong>Tema:</strong> [o que investigar] &nbsp;&bull;&nbsp; <strong>Time-box:</strong> [ex: 4h] &nbsp;&bull;&nbsp; <strong>Responsavel:</strong> [quem]</p>
<hr>
<h3>1. Pergunta a responder</h3>
<p>O que precisamos descobrir/decidir ao fim desta pesquisa.</p>
<h3>2. Opcoes a avaliar</h3>
<ul><li>Opcao A &mdash; ...</li><li>Opcao B &mdash; ...</li></ul>
<h3>3. Criterios de comparacao</h3>
<table><tbody><tr><th>Opcao</th><th>Esforco</th><th>Risco</th><th>Custo</th><th>Recomendacao</th></tr><tr><td>Opcao A</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>Opcao B</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>
<h3>4. Conclusao &amp; recomendacao</h3>
<p>Qual caminho seguir e por que.</p>
<h3>5. Levar para o supervisor decidir</h3>
<p>Pontos que precisam de aval antes de prosseguir.</p>
`;

export const FULL_BRIEFINGS = [
  { label: 'Modulo SaaS', title: 'Desenvolvimento de Modulo (SaaS)', html: BRIEFING_MODULO_SAAS },
  { label: 'Correcao de Bug', title: 'Correcao de Bug', html: BRIEFING_BUG },
  { label: 'Pesquisa (Spike)', title: 'Pesquisa Tecnica', html: BRIEFING_SPIKE },
];

// ============================================================
// TABELAS / FACILITADORES
// ============================================================

const TABLE_5W2H = `<h3>5W2H</h3><table><tbody><tr><th>Pergunta</th><th>Resposta</th></tr><tr><td><strong>O que?</strong></td><td>&nbsp;</td></tr><tr><td><strong>Por que?</strong></td><td>&nbsp;</td></tr><tr><td><strong>Onde?</strong></td><td>&nbsp;</td></tr><tr><td><strong>Quando?</strong></td><td>&nbsp;</td></tr><tr><td><strong>Quem?</strong></td><td>&nbsp;</td></tr><tr><td><strong>Como?</strong></td><td>&nbsp;</td></tr><tr><td><strong>Quanto?</strong></td><td>&nbsp;</td></tr></tbody></table><p></p>`;

const TABLE_PDCA = `<h3>PDCA</h3><table><tbody><tr><th>Etapa</th><th>O que fazer</th></tr><tr><td><strong>P &mdash; Planejar</strong></td><td>&nbsp;</td></tr><tr><td><strong>D &mdash; Fazer</strong></td><td>&nbsp;</td></tr><tr><td><strong>C &mdash; Checar</strong></td><td>&nbsp;</td></tr><tr><td><strong>A &mdash; Agir</strong></td><td>&nbsp;</td></tr></tbody></table><p></p>`;

const TABLE_SWOT = `<h3>Analise SWOT</h3><table><tbody><tr><td><p><strong>Forcas</strong> (interno +)</p><p>&nbsp;</p></td><td><p><strong>Fraquezas</strong> (interno -)</p><p>&nbsp;</p></td></tr><tr><td><p><strong>Oportunidades</strong> (externo +)</p><p>&nbsp;</p></td><td><p><strong>Ameacas</strong> (externo -)</p><p>&nbsp;</p></td></tr></tbody></table><p></p>`;

const TABLE_RACI = `<h3>Matriz RACI</h3><p>Por atividade, defina quem e <strong>R</strong>esponsavel (faz), <strong>A</strong>provador (responde por), <strong>C</strong>onsultado e <strong>I</strong>nformado.</p><table><tbody><tr><th>Atividade</th><th>Responsavel (R)</th><th>Aprovador (A)</th><th>Consultado (C)</th><th>Informado (I)</th></tr><tr><td>Ex: Desenvolver</td><td>Dev</td><td>Tech Lead</td><td>PO</td><td>Time</td></tr><tr><td>...</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table>`;

const TABLE_DECISAO = `<h3>Matriz de Decisao</h3><table><tbody><tr><th>Opcao</th><th>Criterio 1</th><th>Criterio 2</th><th>Criterio 3</th><th>Total</th></tr><tr><td>Opcao A</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>Opcao B</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr></tbody></table><p></p>`;

const TABLE_ER = `<h3>Modelo Entidade-Relacionamento</h3><p><strong>Entidades e atributos</strong></p><table><tbody><tr><th>Entidade</th><th>Atributos</th><th>Chave</th></tr><tr><td>Ex: Cliente</td><td>nome, email, telefone</td><td>id</td></tr></tbody></table><p><strong>Relacionamentos</strong></p><table><tbody><tr><th>De</th><th>Cardinalidade</th><th>Para</th></tr><tr><td>Cliente</td><td>1 : N</td><td>Pedido</td></tr></tbody></table>`;

const TABLE_CRONOGRAMA = `<h3>Cronograma</h3><table><tbody><tr><th>Etapa</th><th>Sem 1</th><th>Sem 2</th><th>Sem 3</th><th>Sem 4</th></tr><tr><td>Ex: Planejamento</td><td>X</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr><tr><td>Ex: Execucao</td><td>&nbsp;</td><td>X</td><td>X</td><td>&nbsp;</td></tr><tr><td>Ex: Revisao &amp; entrega</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>X</td></tr></tbody></table>`;

const TABLE_CHECKLIST = `<h3>Checklist de Revisao</h3><p><strong>Pronto para comecar (DoR)</strong></p><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Objetivo e escopo claros</p></li><li data-type="taskItem" data-checked="false"><p>Requisitos/insumos definidos</p></li><li data-type="taskItem" data-checked="false"><p>Sem bloqueios ou dependencias abertas</p></li></ul><p><strong>Pronto / entregue (DoD)</strong></p><ul data-type="taskList"><li data-type="taskItem" data-checked="false"><p>Funciona de ponta a ponta</p></li><li data-type="taskItem" data-checked="false"><p>Testado (caminho feliz + bordas)</p></li><li data-type="taskItem" data-checked="false"><p>Revisado e aprovado pelo supervisor</p></li></ul>`;

export const TABLE_SNIPPETS = [
  { label: '5W2H', html: TABLE_5W2H },
  { label: 'PDCA', html: TABLE_PDCA },
  { label: 'SWOT', html: TABLE_SWOT },
  { label: 'RACI', html: TABLE_RACI },
  { label: 'Matriz de Decisao', html: TABLE_DECISAO },
  { label: 'Cronograma', html: TABLE_CRONOGRAMA },
  { label: 'Checklist', html: TABLE_CHECKLIST },
  { label: 'ER', html: TABLE_ER },
];

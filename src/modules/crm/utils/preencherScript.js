/**
 * Preenche as variáveis do script com os dados que o CRM já tem.
 *
 * Os roteiros são escritos com marcadores — "Oi [nome]! Aqui é a [consultora]
 * da Fyness" — porque o mesmo texto serve pra todo lead. Na hora de ligar, quem
 * tem que fazer a substituição é a tela, não a cabeça de quem está com o
 * telefone no ouvido.
 *
 * DECISÃO CENTRAL: dado que falta MANTÉM o marcador visível.
 *
 * A alternativa seria apagar o trecho, e isso é pior de um jeito que só aparece
 * ao vivo: "Oi !" lido em voz alta soa como erro de sistema, e "Te mostro como
 * fica na " trava a frase no meio. O marcador preservado avisa que ali falta um
 * dado — e ainda diz QUAL — enquanto o buraco silencioso só aparece depois de
 * já ter saído pela boca.
 */

/** Primeiro nome. Ninguém abre uma ligação com o nome completo. */
export function primeiroNome(nome) {
  const limpo = (nome || '').trim();
  if (!limpo) return '';
  return limpo.split(/\s+/)[0];
}

/**
 * Os marcadores aceitos, e por que são estes.
 *
 * Cada um mapeia pra um dado que a tela de execução SEMPRE tem à mão. Marcador
 * que dependeria de outra consulta ficaria vazio na maioria das vezes, e um
 * marcador que quase nunca preenche ensina a pessoa a ignorar todos.
 */
export const VARIAVEIS = {
  nome: 'primeiro nome do lead',
  empresa: 'nome da empresa do lead',
  segmento: 'ramo da empresa (padaria, oficina, salão…)',
  consultora: 'primeiro nome de quem está executando',
};

const ALIAS = {
  nome: 'nome', lead: 'nome', cliente: 'nome',
  empresa: 'empresa', negocio: 'empresa', negócio: 'empresa',
  segmento: 'segmento', ramo: 'segmento', 'mesmo segmento': 'segmento',
  consultora: 'consultora', consultor: 'consultora', vendedor: 'consultora', vendedora: 'consultora',
};

/**
 * @param {string} texto   o roteiro com marcadores
 * @param {object} dados   { nome, empresa, consultora } — nomes completos, o
 *                         corte pro primeiro nome acontece aqui
 * @returns {{ texto: string, faltando: string[] }}
 *   `faltando` lista os marcadores que continuaram no texto, pra tela poder
 *   avisar sem ter que varrer a string de novo.
 */
export function preencherScript(texto, dados = {}) {
  if (!texto || typeof texto !== 'string') return { texto: texto || '', faltando: [] };

  const valores = {
    nome: primeiroNome(dados.nome),
    // Empresa NÃO vira primeiro nome: "Padaria do Zé" tem que sair inteira.
    empresa: (dados.empresa || '').trim(),
    segmento: (dados.segmento || '').trim(),
    consultora: primeiroNome(dados.consultora),
  };

  const faltando = new Set();
  const saida = texto.replace(/\[([^\][]{1,20})\]/g, (marcador, dentro) => {
    const chave = ALIAS[dentro.trim().toLowerCase()];
    // Marcador que não conhecemos fica como está: pode ser texto de verdade
    // entre colchetes, e reescrever o que não se entende é pior que não mexer.
    if (!chave) return marcador;
    if (!valores[chave]) { faltando.add(chave); return marcador; }
    return valores[chave];
  });

  return { texto: saida, faltando: [...faltando] };
}

/**
 * Monta os dados a partir da tarefa da fila e do perfil de quem está logada.
 *
 * `leadName` já chega na ordem canônica (contato vinculado > título do
 * negócio), então o nome do lead pode ser o título de um negócio como "Padaria
 * do Zé". Chamar isso de primeiro nome dá "Padaria", e "Oi Padaria!" é pior que
 * o marcador. Por isso o título só entra quando NÃO houve contato vinculado —
 * e nesse caso entra como empresa, que é o que ele realmente é.
 */
export function dadosDoScript(activity = {}, profile = {}) {
  const temContato = !!activity.contactId;
  return {
    nome: temContato ? activity.leadName : '',
    empresa: activity.companyName || (temContato ? '' : activity.leadName) || '',
    segmento: activity.companySegment || '',
    consultora: profile?.name || '',
  };
}

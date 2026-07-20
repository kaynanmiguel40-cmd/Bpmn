import { describe, it, expect } from 'vitest';
import { preencherScript, primeiroNome, dadosDoScript } from '../preencherScript';

describe('primeiroNome', () => {
  it('corta no primeiro nome — ninguém abre ligação com nome completo', () => {
    expect(primeiroNome('João da Silva Pereira')).toBe('João');
    expect(primeiroNome('Maria')).toBe('Maria');
  });

  it('espaço sobrando e vazio não viram nome', () => {
    expect(primeiroNome('  Ana  Paula ')).toBe('Ana');
    expect(primeiroNome('')).toBe('');
    expect(primeiroNome(null)).toBe('');
  });
});

describe('preencherScript', () => {
  const dados = { nome: 'João da Silva', empresa: 'Padaria do Zé', consultora: 'Lorena Martins' };

  it('preenche os três marcadores com o dado certo', () => {
    const { texto } = preencherScript(
      'Oi [nome]! Aqui é a [consultora] da Fyness. Te mostro como fica na [empresa].',
      dados,
    );
    expect(texto).toBe('Oi João! Aqui é a Lorena da Fyness. Te mostro como fica na Padaria do Zé.');
  });

  // Empresa é razão social, não pessoa: cortar no primeiro nome daria "Padaria".
  it('empresa sai inteira, sem corte', () => {
    expect(preencherScript('na [empresa]', dados).texto).toBe('na Padaria do Zé');
  });

  it('o mesmo marcador repetido é preenchido em todas as vezes', () => {
    expect(preencherScript('[nome], oi [nome]!', dados).texto).toBe('João, oi João!');
  });

  /**
   * A decisão central. Apagar o trecho daria "Oi !" — que lido em voz alta soa
   * como erro de sistema — e "fica na " trava a frase no meio. O marcador
   * preservado avisa que falta um dado e diz qual; o buraco silencioso só
   * aparece depois de já ter saído pela boca.
   */
  it('dado que falta MANTÉM o marcador, não abre buraco', () => {
    const { texto, faltando } = preencherScript(
      'Oi [nome]! Te mostro como fica na [empresa].',
      { nome: 'João da Silva' },
    );
    expect(texto).toBe('Oi João! Te mostro como fica na [empresa].');
    expect(faltando).toEqual(['empresa']);
  });

  it('lista cada marcador faltante uma vez só', () => {
    const { faltando } = preencherScript('[empresa] e [empresa] e [consultora]', {});
    expect(faltando.sort()).toEqual(['consultora', 'empresa']);
  });

  it('aceita os apelidos que já aparecem nos roteiros', () => {
    expect(preencherScript('[lead] / [vendedora]', { nome: 'Ana Souza', consultora: 'Lorena M' }).texto)
      .toBe('Ana / Lorena');
  });

  // Reescrever o que não se entende é pior que não mexer.
  it('marcador desconhecido fica intacto e não conta como faltante', () => {
    const { texto, faltando } = preencherScript('valor [xyz] e [nome]', dados);
    expect(texto).toBe('valor [xyz] e João');
    expect(faltando).toEqual([]);
  });

  it('texto sem marcador, vazio e nulo não quebram', () => {
    expect(preencherScript('Bom dia!', dados).texto).toBe('Bom dia!');
    expect(preencherScript('', dados).texto).toBe('');
    expect(preencherScript(null, dados)).toEqual({ texto: '', faltando: [] });
  });
});

/**
 * `leadName` chega na ordem canônica: contato vinculado > título do negócio.
 * Sem contato, o "nome do lead" pode ser "Padaria do Zé" — e "Oi Padaria!" é
 * pior que deixar o marcador.
 */
describe('dadosDoScript', () => {
  it('com contato vinculado, o nome é da pessoa', () => {
    const d = dadosDoScript(
      { contactId: 'c1', leadName: 'João da Silva', companyName: 'Padaria do Zé', companySegment: 'padaria' },
      { name: 'Lorena Martins' },
    );
    expect(d).toEqual({
      nome: 'João da Silva',
      empresa: 'Padaria do Zé',
      segmento: 'padaria',
      consultora: 'Lorena Martins',
    });
  });

  it('sem contato, o título do negócio entra como EMPRESA e o nome fica vazio', () => {
    const d = dadosDoScript({ contactId: null, leadName: 'Padaria do Zé' }, { name: 'Lorena' });
    expect(d.nome).toBe('');
    expect(d.empresa).toBe('Padaria do Zé');
    // O marcador [nome] sobrevive — é o aviso de que falta cadastrar o contato.
    expect(preencherScript('Oi [nome], da [empresa]', d).texto).toBe('Oi [nome], da Padaria do Zé');
  });

  it('perfil sem nome não inventa consultora', () => {
    expect(dadosDoScript({ contactId: 'c1', leadName: 'João' }, {}).consultora).toBe('');
  });
});

/**
 * `[segmento]` é o segundo marcador mais usado nos roteiros (9 ocorrências) e o
 * CRM tem o dado em crm_companies.segment. Deixar ele de fora significaria a
 * consultora lendo "outras [segmento] que atendo" em voz alta.
 */
describe('segmento', () => {
  it('preenche o ramo da empresa', () => {
    const { texto } = preencherScript(
      'Já atendo outras [segmento] aqui na região.',
      { segmento: 'padarias' },
    );
    expect(texto).toBe('Já atendo outras padarias aqui na região.');
  });

  it('"mesmo segmento" e "ramo" apontam pro mesmo dado', () => {
    expect(preencherScript('[mesmo segmento] / [ramo]', { segmento: 'oficinas' }).texto)
      .toBe('oficinas / oficinas');
  });

  it('empresa sem ramo cadastrado mantém o marcador', () => {
    const { texto, faltando } = preencherScript('outras [segmento]', { empresa: 'Padaria do Zé' });
    expect(texto).toBe('outras [segmento]');
    expect(faltando).toEqual(['segmento']);
  });

  it('dadosDoScript lê o segmento da empresa vinculada', () => {
    const d = dadosDoScript(
      { contactId: 'c1', leadName: 'João', companyName: 'Padaria do Zé', companySegment: 'padaria' },
      { name: 'Lorena' },
    );
    expect(d.segmento).toBe('padaria');
  });
});

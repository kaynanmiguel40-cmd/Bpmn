import { describe, it, expect } from 'vitest';
import { parseNoteEntries, parseBrDate, noteEntryTitle } from '../parseNoteEntries';

// Texto REAL de producao (Henrique Robert), encurtado. Formato "narrativa":
// a data vem no meio da frase que abre o paragrafo.
const HENRIQUE = `Dados Henrique

O primeiro contato com o Henrique foi realizado em 27/05/2026, quando me apresentei como consultora de relacionamento do Fyness.

No dia 28/05/2026, foi criado o acesso da Construtora Martins para que ele pudesse testar o sistema.

Em 29/05/2026, ele informou que havia gostado da plataforma.

Henrique havia contratado o plano mensal, porém ainda não renovou.`;

// Formato "cabecalho": data abre o paragrafo, corpo vem no paragrafo seguinte.
const WINSTON = `Dados Winston Vieira

Empresa: Gelatopia

27/05/2026 — Primeiro contato

Foi enviada uma mensagem para retomar o atendimento com Winston.

28/05/2026 — Dúvidas sobre as datas dos lançamentos

Winston explicou sua dificuldade com os lançamentos.`;

describe('parseBrDate', () => {
  it('le DD/MM/AAAA', () => {
    const d = parseBrDate('01/06/2026'.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/));
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(5); // junho
    expect(d.getDate()).toBe(1);
  });

  it('ano de 2 digitos vira 20xx', () => {
    const d = parseBrDate('10/06/26'.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/));
    expect(d.getFullYear()).toBe(2026);
  });

  // Data que "transborda" (31/02 vira 03/03 no Date) nao pode passar como valida
  // — colocaria o registro num dia que nao existiu.
  it('rejeita data impossivel em vez de deixar transbordar', () => {
    expect(parseBrDate('31/02/2026'.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/))).toBeNull();
    expect(parseBrDate('45/13/2026'.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/))).toBeNull();
  });
});

describe('parseNoteEntries — formato narrativa (Henrique)', () => {
  const { entries, resto } = parseNoteEntries(HENRIQUE);

  it('acha um registro por paragrafo datado', () => {
    expect(entries).toHaveLength(3);
    expect(entries.map(e => e.date.getDate())).toEqual([27, 28, 29]);
  });

  it('ordena por data crescente', () => {
    const datas = entries.map(e => e.date.getTime());
    expect([...datas].sort((a, b) => a - b)).toEqual(datas);
  });

  // O cabecalho e o fecho nao tem data: se virassem registro, apareceriam num
  // dia inventado. Ficam no `resto`.
  it('guarda o texto sem data no resto', () => {
    expect(resto).toContain('Dados Henrique');
    expect(resto).toContain('ainda não renovou');
  });

  it('nao perde o texto do registro', () => {
    expect(entries[1].text).toContain('acesso da Construtora Martins');
  });
});

describe('parseNoteEntries — formato cabecalho (Winston)', () => {
  const { entries, resto } = parseNoteEntries(WINSTON);

  it('junta o corpo ao cabecalho datado que veio antes', () => {
    expect(entries).toHaveLength(2);
    // Sem essa juncao o corpo do registro sumiria da tela.
    expect(entries[0].text).toContain('Primeiro contato');
    expect(entries[0].text).toContain('retomar o atendimento');
  });

  it('cabecalho do lead (sem data) fica fora dos registros', () => {
    expect(resto).toContain('Gelatopia');
    expect(entries.some(e => e.text.includes('Gelatopia'))).toBe(false);
  });
});

describe('parseNoteEntries — caminho triste', () => {
  it('nota sem nenhuma data nao vira registro', () => {
    const { entries, resto } = parseNoteEntries('Cliente simpatico, ligar depois.');
    expect(entries).toHaveLength(0);
    expect(resto).toBe('Cliente simpatico, ligar depois.');
  });

  it('vazio e nulo nao quebram', () => {
    expect(parseNoteEntries('').entries).toEqual([]);
    expect(parseNoteEntries(null).entries).toEqual([]);
    expect(parseNoteEntries(null).resto).toBe('');
  });

  // Nota escrita "corrida", uma linha por dia, sem linha em branco entre elas.
  it('sem linha em branco, cada linha vira um paragrafo', () => {
    const { entries } = parseNoteEntries('10/06/26 - reunião feita\n11/06/26 - pediram teste');
    expect(entries).toHaveLength(2);
  });

  // Telefone e valor tem barra e digito perto; nao podem virar data.
  it('nao confunde numero solto com data', () => {
    expect(parseNoteEntries('Contrato 123/456/789 assinado').entries).toHaveLength(0);
  });
});

describe('noteEntryTitle', () => {
  it('tira a data do cabecalho', () => {
    expect(noteEntryTitle('27/05/2026 — Primeiro contato\nCorpo aqui')).toBe('Primeiro contato');
  });

  it('tira o "No dia" da narrativa', () => {
    expect(noteEntryTitle('No dia 28/05/2026, foi criado o acesso'))
      .toBe('foi criado o acesso');
  });

  it('corta titulo longo sem cortar palavra no meio', () => {
    const t = noteEntryTitle('Em 29/05/2026, ' + 'palavra '.repeat(20));
    expect(t.length).toBeLessThanOrEqual(71);
    expect(t.endsWith('…')).toBe(true);
  });
});

// A nota do Henrique tem 14 datas espalhadas por 6 semanas. Cada trecho precisa
// cair no SEU dia pra que o agrupamento por etapa ponha cada um na etapa em que
// o lead realmente estava — que e o motivo de tudo isso existir.
describe('nota longa espalha os registros no tempo', () => {
  const NOTA = [
    'Dados Henrique',
    'O primeiro contato foi em 27/05/2026, quando me apresentei.',
    'No dia 01/06/2026, Henrique solicitou orientações sobre o plano.',
    'Em 17/06/2026, durante um contato de pós-venda, pediu separação por obra.',
    'Por fim, em 06/07/2026, foi informado sobre uma melhoria.',
    'Henrique havia contratado o plano mensal, porém não renovou.',
  ].join('\n\n');

  const { entries, resto } = parseNoteEntries(NOTA);

  it('cada trecho datado vira um registro', () => {
    expect(entries).toHaveLength(4);
  });

  it('as datas cobrem o periodo inteiro, nao um dia so', () => {
    const meses = new Set(entries.map(e => e.date.getMonth()));
    expect(meses.size).toBe(3); // maio, junho, julho
  });

  // O fecho ("não renovou") nao tem data. Herdar a data do paragrafo anterior
  // colocaria esse fato em 06/07 — um dia em que ele nao aconteceu.
  it('o fecho sem data NAO herda a data do trecho anterior', () => {
    expect(resto).toContain('não renovou');
    expect(entries.some(e => e.text.includes('não renovou'))).toBe(false);
  });
});

describe('noteEntryTitle — data no meio da abertura', () => {
  // A data aparece com aberturas variadas. Listar cada uma seria jogo perdido:
  // a regra e cortar ATE a data quando ela esta no comeco da frase.
  it('corta "Por fim, em <data>,"', () => {
    expect(noteEntryTitle('Por fim, em 06/07/2026, foi informado sobre a melhoria'))
      .toBe('foi informado sobre a melhoria');
  });

  it('corta "O primeiro contato foi em <data>,"', () => {
    expect(noteEntryTitle('O primeiro contato foi em 27/05/2026, quando me apresentei'))
      .toBe('quando me apresentei');
  });

  // Data la no fundo da frase e CONTEUDO, nao carimbo de quando aconteceu —
  // cortar ali destruiria o sentido do titulo.
  it('data no fim da frase nao e cortada', () => {
    const t = 'Cliente pediu para adiar a proposta e remarcar tudo para 10/09/2026';
    expect(noteEntryTitle(t)).toBe(t);
  });
});

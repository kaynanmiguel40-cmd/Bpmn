/**
 * parseNoteEntries — le o diario que virou o campo `notes` do negocio.
 *
 * Antes do sistema ter historico, a consultora registrou tudo no texto livre.
 * 290 dos 299 negocios tem nota, e boa parte e um LOG DATADO, em duas formas:
 *
 *   cabecalho:  "27/05/2026 — Primeiro contato"          (data abre o paragrafo)
 *               "Foi enviada uma mensagem…"              (corpo, sem data)
 *
 *   narrativa:  "No dia 28/05/2026, foi criado o acesso…" (data no meio da frase)
 *
 * Este parser separa esses paragrafos em registros datados pra que cada um caia
 * no lugar certo da linha do tempo — e, com isso, dentro da ETAPA em que o lead
 * estava naquele dia.
 *
 * Este parser e usado em DOIS lugares, de proposito: pela tela (leitura) e pelo
 * backfill scripts/migrate_notes_to_history.mjs, que gravou os trechos em
 * crm_lead_notes. Sendo o mesmo codigo, o que foi migrado e exatamente o que se
 * via antes de migrar. O texto original de todo negocio esta em
 * crm_deals_notes_backup_104 (migration 104) — se o recorte errar em algum
 * caso, da pra reconstruir.
 */

// DD/MM/AAAA ou DD/MM/AA. Exige nao-digito em volta pra nao casar pedaco de
// numero maior (ex.: um telefone ou um valor).
const DATA_RE = /(?<![\d/])(\d{1,2})\/(\d{1,2})\/(\d{2,4})(?![\d/])/;

// DD/MM sem ano — "no dia 26/05", "dia 17/06". So e usado quando quem chama diz
// QUAL ano assumir (`anoPadrao`); sem isso, adivinhar ano e chute. Exige os dois
// digitos do mes pra nao casar fracao ("2/3 das obras") nem placar.
const DATA_CURTA_RE = /(?<![\d/])(\d{1,2})\/(\d{2})(?![\d/])/;

/** Converte o casamento do regex numa Date local, ou null se a data nao existe. */
export function parseBrDate(m) {
  if (!m) return null;
  const dia = Number(m[1]);
  const mes = Number(m[2]);
  let ano = Number(m[3]);
  // "26" => 2026. Ano de 2 digitos so aparece neste seculo nestes dados.
  if (ano < 100) ano += 2000;
  if (dia < 1 || dia > 31 || mes < 1 || mes > 12) return null;
  const d = new Date(ano, mes - 1, dia);
  // Rejeita data que "transbordou" (31/02 vira 03/03).
  if (d.getDate() !== dia || d.getMonth() !== mes - 1) return null;
  return d;
}

/**
 * @param {string} notes
 * @param {{anoPadrao?: number}} [opts]  `anoPadrao` liga a leitura de datas SEM
 *   ano (DD/MM), assumindo esse ano. So passe quando souber que o texto inteiro
 *   cabe num ano so — ex.: o negocio foi criado em 2026 e a nota so cita meses
 *   de 2026. Sem isso, DD/MM e ignorado.
 * @returns {{ entries: Array<{date: Date, text: string}>, resto: string }}
 *   `entries` em ordem crescente de data; `resto` e o texto sem data (o
 *   cabecalho "Dados Fulano", o fecho, qualquer coisa solta).
 */
export function parseNoteEntries(notes, { anoPadrao = null } = {}) {
  const texto = (notes || '').trim();
  if (!texto) return { entries: [], resto: '' };

  // Paragrafo = bloco separado por linha em branco. Quando o texto nao usa
  // linha em branco, cada linha vira um paragrafo — cobre a nota escrita
  // "corrida", uma linha por dia.
  const brutos = texto.includes('\n\n')
    ? texto.split(/\n\s*\n/)
    : texto.split('\n');

  const entries = [];
  const semData = [];
  let atual = null;

  for (const bruto of brutos) {
    const p = bruto.trim();
    if (!p) continue;
    let m = p.match(DATA_RE);
    let data = parseBrDate(m);
    if (!data && anoPadrao) {
      const c = p.match(DATA_CURTA_RE);
      if (c) {
        data = parseBrDate([c[0], c[1], c[2], String(anoPadrao)]);
        if (data) m = c;
      }
    }

    if (data) {
      // CABECALHO ("27/05/2026 — Primeiro contato") vs NARRATIVA ("No dia
      // 28/05/2026, foi criado o acesso…"): no cabecalho a data ABRE o
      // paragrafo e a linha e curta, porque o texto vem no paragrafo seguinte.
      const ehCabecalho = m.index <= 2 && p.length <= 80;
      atual = { date: data, text: p, aceitaCorpo: ehCabecalho };
      entries.push(atual);
    } else if (atual?.aceitaCorpo) {
      // So o CABECALHO absorve o paragrafo seguinte. Na narrativa, paragrafo
      // sem data e observacao solta (o fecho "ainda nao renovou") — herdar a
      // data do paragrafo anterior seria inventar quando aquilo aconteceu.
      atual.text += `\n${p}`;
      atual.aceitaCorpo = false; // so o primeiro paragrafo e o corpo
    } else {
      // Antes do primeiro datado: cabecalho ("Dados Henrique", "Empresa: X").
      semData.push(p);
    }
  }

  entries.forEach(e => { delete e.aceitaCorpo; });
  entries.sort((a, b) => a.date - b.date);
  return { entries, resto: semData.join('\n\n').trim() };
}

/**
 * Titulo curto de um registro, pra manchete da linha do tempo.
 * Tira a data do comeco e corta na primeira quebra ou no fim da frase.
 */
export function noteEntryTitle(text) {
  const primeira = (text || '').split('\n')[0].trim();
  // Corta tudo ATE a data, nao so um prefixo fixo. A data aparece de varias
  // formas — "27/05/2026 — Primeiro contato", "No dia 28/05/2026, foi criado",
  // "Por fim, em 06/07/2026, foi informado" — e listar cada abertura possivel
  // seria um jogo perdido. So vale quando a data esta no COMECO da frase (ate
  // 40 caracteres): mais pra dentro ela e parte do conteudo, nao um carimbo.
  const m = primeira.match(DATA_RE) || primeira.match(DATA_CURTA_RE);
  let base = primeira;
  if (m && m.index <= 40) {
    const depois = primeira.slice(m.index + m[0].length).replace(/^\s*[—–\-:,]?\s*/, '').trim();
    if (depois) base = depois;
  }
  if (base.length <= 70) return base;
  const corte = base.slice(0, 70);
  const ponto = corte.lastIndexOf(' ');
  return `${corte.slice(0, ponto > 30 ? ponto : 70)}…`;
}

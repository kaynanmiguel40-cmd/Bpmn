import { describe, it, expect } from 'vitest';
import {
  hasMeaning, setBriefing, setDelivery, applyReview, applyQualityDraft, fileDispute, resolveDispute,
} from '../osReview';
import { scoreQualityChecklist, OPERACAO_QUALITY } from '../qualityChecklist';

// Item de O.S. cru, recém-criado (como nasce no checklist).
const newItem = (over = {}) => ({
  id: 't1', text: 'Criar arte do post', group: 'Marketing', done: false,
  briefing: '', briefingBy: null, briefingAt: null,
  delivery: '', deliveryBy: null, deliveryAt: null,
  reviewStatus: undefined, reviewBy: null, reviewAt: null,
  qualityPct: null, qualityAnswers: null, qualityNotes: null, qualityDispute: null,
  ...over,
});
const list = (over) => [newItem(over), newItem({ id: 't2', text: 'Outra tarefa' })];
const AT = '2026-06-20T10:00:00.000Z';
const find = (cl, id = 't1') => cl.find((i) => i.id === id);

// Nota 5 em tudo → 100% ; uma nota baixa derruba.
const allFive = Object.fromEntries(OPERACAO_QUALITY.map((c) => [c.id, 5]));
const qualityOf = (answers, notes = {}) => ({ answers, notes, ...scoreQualityChecklist(answers) });

describe('hasMeaning', () => {
  it('texto puro conta', () => expect(hasMeaning('<p>oi</p>')).toBe(true));
  it('vazio / só tags não conta', () => {
    expect(hasMeaning('')).toBe(false);
    expect(hasMeaning('<p></p>')).toBe(false);
    expect(hasMeaning('<p>&nbsp;</p>')).toBe(false);
  });
  it('mídia (print/tabela/vídeo) conta mesmo sem texto', () => {
    expect(hasMeaning('<img src="x">')).toBe(true);
    expect(hasMeaning('<table><tr><td></td></tr></table>')).toBe(true);
  });
});

describe('criação do briefing', () => {
  it('carimba autor + data na primeira vez que ganha conteúdo', () => {
    const cl = setBriefing(list(), 't1', '<p>Passo a passo</p>', { by: 'Kauã', at: AT });
    const i = find(cl);
    expect(i.briefing).toBe('<p>Passo a passo</p>');
    expect(i.briefingBy).toBe('Kauã');
    expect(i.briefingAt).toBe(AT);
    expect(find(cl, 't2').briefingBy).toBeNull(); // não mexe nos outros
  });

  it('não re-carimba se já tem autor (mantém quem criou)', () => {
    const cl0 = setBriefing(list(), 't1', '<p>v1</p>', { by: 'Kauã', at: AT });
    const cl1 = setBriefing(cl0, 't1', '<p>v2 editada</p>', { by: 'Elias', at: '2026-06-21T09:00:00Z' });
    const i = find(cl1);
    expect(i.briefing).toBe('<p>v2 editada</p>');
    expect(i.briefingBy).toBe('Kauã'); // segue sendo o criador original
    expect(i.briefingAt).toBe(AT);
  });

  it('esvaziar o briefing limpa o carimbo (sem autor fantasma)', () => {
    const cl0 = setBriefing(list(), 't1', '<p>algo</p>', { by: 'Kauã', at: AT });
    const cl1 = setBriefing(cl0, 't1', '<p></p>', { by: 'Kauã', at: AT });
    const i = find(cl1);
    expect(i.briefingBy).toBeNull();
    expect(i.briefingAt).toBeNull();
  });

  it('entrega tem o mesmo comportamento de carimbo', () => {
    const cl = setDelivery(list(), 't1', '<img src="print.png">', { by: 'Elias', at: AT });
    const i = find(cl);
    expect(i.deliveryBy).toBe('Elias'); // print conta como entrega
    expect(i.deliveryAt).toBe(AT);
  });
});

describe('fluxo de revisão', () => {
  it('draft → review → approved com a nota gravada', () => {
    let cl = applyReview(list(), 't1', 'review', null, { by: 'Kauã', at: AT });
    expect(find(cl).reviewStatus).toBe('review');

    const q = qualityOf(allFive);
    cl = applyReview(cl, 't1', 'approved', q, { by: 'Kaynan', at: AT });
    const i = find(cl);
    expect(i.reviewStatus).toBe('approved');
    expect(i.reviewBy).toBe('Kaynan');
    expect(i.qualityPct).toBe(100);
    expect(i.qualityAnswers).toEqual(allFive);
  });

  it('pedir ajuste (changes) não grava nota', () => {
    const cl = applyReview(list(), 't1', 'changes', null, { by: 'Kaynan', at: AT });
    const i = find(cl);
    expect(i.reviewStatus).toBe('changes');
    expect(i.qualityPct).toBeNull();
  });

  it('reabrir volta pra draft', () => {
    const cl0 = applyReview(list(), 't1', 'approved', qualityOf(allFive), { by: 'Kaynan', at: AT });
    const cl1 = applyReview(cl0, 't1', 'draft', null, { by: 'Kaynan', at: AT });
    expect(find(cl1).reviewStatus).toBe('draft');
  });

  it('autosave do checklist recalcula o % (média ponderada)', () => {
    // funcional(peso4)=3, escopo(3)=4, resto N/A → (3*4+4*3)/(4+3)=24/7=3.43→3.4 ; 3.4/5=68%
    const answers = { funcional: 3, escopo: 4, sem_retrabalho: 'na', documentado: 'na', proatividade: 'na' };
    const cl = applyQualityDraft(list(), 't1', answers, {});
    const i = find(cl);
    expect(i.qualityAnswers).toEqual(answers);
    expect(i.qualityPct).toBe(scoreQualityChecklist(answers).pct);
    expect(i.qualityPct).toBe(68);
  });
});

describe('contestação da nota', () => {
  // Estado base: tarefa aprovada com nota 80%.
  const approved = () => applyReview(list(), 't1',
    'approved', qualityOf({ ...allFive, proatividade: 1 }, { proatividade: 'achei pouco' }), { by: 'Kaynan', at: AT });

  it('executor abre contestação (aberta, não muda a nota)', () => {
    const pctBefore = find(approved()).qualityPct;
    const cl = fileDispute(approved(), 't1', { reason: 'Fui proativo sim', criterion: 'proatividade' }, { by: 'Elias', byId: 'u9', at: AT });
    const d = find(cl).qualityDispute;
    expect(d.status).toBe('open');
    expect(d.by).toBe('Elias');
    expect(d.criterion).toBe('proatividade');
    expect(d.reason).toBe('Fui proativo sim');
    expect(find(cl).qualityPct).toBe(pctBefore); // nota intacta enquanto aberta
  });

  it('supervisor MUDA a nota: prevPct guarda a anterior, aplica a nova', () => {
    const cl0 = fileDispute(approved(), 't1', { reason: 'discordo', criterion: 'proatividade' }, { by: 'Elias', at: AT });
    const before = find(cl0).qualityPct;
    const novaNota = qualityOf(allFive); // 100%
    const cl1 = resolveDispute(cl0, 't1', { outcome: 'changed', note: 'procede', quality: novaNota }, { by: 'Kaynan', at: '2026-06-22T08:00:00Z' });
    const i = find(cl1);
    expect(i.qualityDispute.status).toBe('resolved');
    expect(i.qualityDispute.outcome).toBe('changed');
    expect(i.qualityDispute.prevPct).toBe(before);
    expect(i.qualityDispute.resolvedBy).toBe('Kaynan');
    expect(i.qualityPct).toBe(100); // nota nova aplicada
    expect(before).toBeLessThan(100);
  });

  it('supervisor MANTÉM a nota: nota intacta, prevPct = atual', () => {
    const cl0 = fileDispute(approved(), 't1', { reason: 'discordo' }, { by: 'Elias', at: AT });
    const before = find(cl0).qualityPct;
    const cl1 = resolveDispute(cl0, 't1', { outcome: 'kept', note: 'mantida' }, { by: 'Kaynan', at: AT });
    const i = find(cl1);
    expect(i.qualityDispute.outcome).toBe('kept');
    expect(i.qualityDispute.prevPct).toBe(before);
    expect(i.qualityPct).toBe(before); // nota NÃO muda
  });
});

describe('imutabilidade (não mexe no array original)', () => {
  it('cada transição devolve novo array sem mutar o anterior', () => {
    const original = list();
    const snapshot = JSON.stringify(original);
    setBriefing(original, 't1', '<p>x</p>', { by: 'A', at: AT });
    applyReview(original, 't1', 'review', null, { by: 'A', at: AT });
    fileDispute(original, 't1', { reason: 'r' }, { by: 'A', at: AT });
    expect(JSON.stringify(original)).toBe(snapshot);
  });
});

describe('CICLO COMPLETO: O.S. → briefing → entrega → revisão → contestação → decisão', () => {
  it('encadeia tudo e termina coerente', () => {
    let cl = list(); // 1) O.S. criada com 2 itens

    // 2) supervisor escreve o briefing da tarefa
    cl = setBriefing(cl, 't1', '<p>Fazer a arte 1080x1080, exportar PNG</p>', { by: 'Kaynan', at: AT });
    expect(find(cl).briefingBy).toBe('Kaynan');

    // 3) executor entrega (print) e pede revisão
    cl = setDelivery(cl, 't1', '<img src="arte.png">', { by: 'Elias', at: AT });
    cl = applyReview(cl, 't1', 'review', null, { by: 'Elias', at: AT });
    expect(find(cl).reviewStatus).toBe('review');
    expect(find(cl).deliveryBy).toBe('Elias');

    // 4) supervisor avalia → aprovado com nota
    const nota = qualityOf({ ...allFive, documentado: 2 }, { documentado: 'faltou print do antes' });
    cl = applyReview(cl, 't1', 'approved', nota, { by: 'Kaynan', at: AT });
    expect(find(cl).reviewStatus).toBe('approved');
    expect(find(cl).qualityPct).toBe(nota.pct);

    // 5) executor discorda
    cl = fileDispute(cl, 't1', { reason: 'documentei no card', criterion: 'documentado' }, { by: 'Elias', at: AT });
    expect(find(cl).qualityDispute.status).toBe('open');

    // 6) 3º (manager) reavalia e sobe a nota
    const ajustada = qualityOf(allFive);
    cl = resolveDispute(cl, 't1', { outcome: 'changed', note: 'confirmado', quality: ajustada }, { by: 'Sofia', at: AT });
    const i = find(cl);
    expect(i.qualityDispute.status).toBe('resolved');
    expect(i.qualityPct).toBe(100);
    expect(i.qualityDispute.prevPct).toBe(nota.pct);

    // a outra tarefa seguiu intocada o tempo todo
    expect(find(cl, 't2').reviewStatus).toBeUndefined();
    expect(find(cl, 't2').qualityDispute).toBeNull();
  });
});

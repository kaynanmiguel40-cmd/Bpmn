/**
 * crmDemoWeekService - gera (e limpa) um exemplo do Relatório Semanal.
 *
 * Popula a semana atual do vendedor logado com dados realistas: negócios
 * ganhos/perdidos, reuniões, ligações (pro funil), atividades concluídas e
 * relatos diários por lead. Tudo inserido DIRETO no banco (sem disparar Google
 * Agenda) e marcado com o prefixo 🧪 + rastreado em localStorage, pra remover
 * com 1 clique depois. É só pra demonstração.
 */

import { supabase } from '../../../lib/supabase';
import { toast } from '../../../contexts/ToastContext';

const STORE_KEY = 'crm-demo-week-v1';
const PREFIX = '🧪 ';

const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export function hasWeeklyExample() {
  try { return !!localStorage.getItem(STORE_KEY); } catch { return false; }
}

async function currentUserId() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id || null;
}

// Insere 1 linha por vez (statement separado) pra não esbarrar no trigger de
// log que colide PK em operações de várias linhas num só comando.
async function insertOne(track, key, table, row) {
  const { data, error } = await supabase.from(table).insert(row).select('id').single();
  if (error) throw new Error(`${table}: ${error.message}`);
  track[key].push(data.id);
  return data.id;
}

export async function seedWeeklyExample() {
  const userId = await currentUserId();
  if (!userId) { toast('Faça login pra gerar o exemplo', 'error'); return { ok: false }; }

  // Pipeline de venda (mesmo escopo do funil) + estágios
  const { data: pipelines } = await supabase.from('crm_pipelines').select('id, name, is_default');
  const isNurturing = (p) => /nurturing|nutri/i.test(p.name || '');
  const isPartner = (p) => /^\s*parceiros\s*$/i.test(p.name || '');
  const sales = (pipelines || []).filter((p) => !isNurturing(p) && !isPartner(p));
  const pipeline = sales.find((p) => p.is_default) || sales[0] || (pipelines || [])[0];
  if (!pipeline) { toast('Crie um pipeline de vendas antes de gerar o exemplo', 'error'); return { ok: false }; }

  const { data: stages } = await supabase.from('crm_pipeline_stages')
    .select('id, name, position, is_win_stage').eq('pipeline_id', pipeline.id).order('position', { ascending: true });
  const ordered = stages || [];
  const firstStage = ordered[0] || null;
  const winStage = ordered.find((s) => s.is_win_stage) || ordered[ordered.length - 1] || null;
  const qualStage = ordered.find((s) => /qualifica|reuni|proposta|negocia|demo/i.test(s.name || ''))
    || ordered[Math.floor(ordered.length / 2)] || firstStage;

  // Datas da semana (segunda = offset 0), nunca no futuro
  const now = new Date();
  const dow = now.getDay(); // 0=Dom..6=Sáb
  const todayOffset = dow === 0 ? 6 : dow - 1; // Seg=0..Dom=6
  const monday = new Date(now);
  monday.setDate(now.getDate() + (dow === 0 ? -6 : 1 - dow));
  monday.setHours(0, 0, 0, 0);
  const dayAt = (offset, h = 10, m = 0) => {
    const o = Math.min(offset, todayOffset);
    const d = new Date(monday);
    d.setDate(monday.getDate() + o);
    d.setHours(h, m, 0, 0);
    return d;
  };

  const track = { deals: [], activities: [], calls: [], reports: [] };

  try {
    // ---------- Negócios ----------
    const dealDefs = [
      { name: 'Padaria Trigo de Ouro', value: 4900, kind: 'won', off: 1 },
      { name: 'Auto Peças Veloz', value: 2400, kind: 'won', off: 3 },
      { name: 'Studio Pilates Zen', value: 3200, kind: 'lost', off: 2 },
      { name: 'Mercado Bom Preço', value: 5600, kind: 'open_qual', off: 0 },
      { name: 'Clínica Sorriso', value: 1800, kind: 'open_new', off: 0 },
    ];
    const byName = {};
    for (const d of dealDefs) {
      const row = {
        title: PREFIX + d.name, value: d.value, pipeline_id: pipeline.id,
        created_by: userId, created_at: dayAt(d.off, 9, 0).toISOString(),
      };
      if (d.kind === 'won') { row.status = 'won'; row.stage_id = winStage?.id || null; row.closed_at = dayAt(d.off, 16, 0).toISOString(); }
      else if (d.kind === 'lost') { row.status = 'lost'; row.stage_id = qualStage?.id || null; row.closed_at = dayAt(d.off, 15, 0).toISOString(); row.lost_reason = 'Sem orçamento agora (exemplo)'; }
      else if (d.kind === 'open_qual') { row.status = 'open'; row.stage_id = qualStage?.id || null; }
      else { row.status = 'open'; row.stage_id = firstStage?.id || null; }
      byName[d.name] = await insertOne(track, 'deals', 'crm_deals', row);
    }

    // ---------- Atividades (reuniões marcadas + concluídas) ----------
    const meet = (off, h, title, dealId) => insertOne(track, 'activities', 'crm_activities', {
      title, type: 'meeting', deal_id: dealId,
      start_date: dayAt(off, h, 0).toISOString(), end_date: dayAt(off, h + 1, 0).toISOString(),
      completed: false, created_by: userId,
    });
    const done = (off, h, type, title, dealId) => insertOne(track, 'activities', 'crm_activities', {
      title, type, deal_id: dealId,
      start_date: dayAt(off, h, 0).toISOString(), end_date: dayAt(off, h, 0).toISOString(),
      completed: true, completed_at: dayAt(off, h, 20).toISOString(), created_by: userId,
    });
    await meet(1, 14, PREFIX + 'Reunião de proposta — Padaria', byName['Padaria Trigo de Ouro']);
    await meet(3, 11, PREFIX + 'Demo — Auto Peças', byName['Auto Peças Veloz']);
    await meet(2, 15, PREFIX + 'Reunião — Mercado Bom Preço', byName['Mercado Bom Preço']);
    await done(0, 9, 'call', PREFIX + 'Primeiro contato', byName['Clínica Sorriso']);
    await done(1, 10, 'follow_up', PREFIX + 'Follow-up da proposta', byName['Padaria Trigo de Ouro']);
    await done(2, 16, 'task', PREFIX + 'Enviar contrato', byName['Mercado Bom Preço']);
    await done(3, 17, 'call', PREFIX + 'Ligação de fechamento', byName['Auto Peças Veloz']);

    // ---------- Ligações (alimentam o funil) ----------
    const call = (off, h, outcome, dealId) => insertOne(track, 'calls', 'crm_calls', {
      phone_dialed: '+5511990000000', direction: 'outbound', channel: 'device',
      outcome, deal_id: dealId, started_at: dayAt(off, h, 0).toISOString(), created_by: userId,
    });
    await call(0, 9, 'answered', byName['Clínica Sorriso']);
    await call(0, 10, 'no_answer', byName['Mercado Bom Preço']);
    await call(1, 11, 'meeting_scheduled', byName['Padaria Trigo de Ouro']);
    await call(1, 14, 'no_answer', null);
    await call(2, 9, 'answered', byName['Mercado Bom Preço']);
    await call(3, 10, 'deal_advanced', byName['Auto Peças Veloz']);
    await call(3, 15, 'not_interested', byName['Studio Pilates Zen']);

    // ---------- Relatos diários por lead ----------
    // 1 relato por (lead, dia). Como as datas são "presas" pra não cair no
    // futuro, dois relatos do mesmo lead podem querer o mesmo dia — aí recuamos
    // pro dia livre anterior (e pulamos se a semana ainda não tem dia sobrando).
    const usedReportDays = new Set();
    const rep = async (off, dealId, content) => {
      if (!dealId) return;
      let o = Math.min(off, todayOffset);
      while (o >= 0 && usedReportDays.has(`${dealId}|${o}`)) o--;
      if (o < 0) return; // sem dia livre nesta semana — pula
      usedReportDays.add(`${dealId}|${o}`);
      return insertOne(track, 'reports', 'crm_lead_daily_reports', {
        lead_key: `${dealId}:`, deal_id: dealId, report_date: ymd(dayAt(o, 12, 0)), content, created_by: userId,
      });
    };
    await rep(0, byName['Clínica Sorriso'], 'Primeiro contato feito. Recepção pediu pra retornar terça. Interesse médio.');
    await rep(1, byName['Padaria Trigo de Ouro'], 'Reunião de proposta marcada — o dono curtiu o controle de fluxo de caixa. Enviar proposta.');
    await rep(2, byName['Mercado Bom Preço'], 'Reunião boa, mandei o contrato. Decisão até sexta.');
    await rep(2, byName['Studio Pilates Zen'], 'Sem orçamento agora. Voltar a procurar em 60 dias.');
    await rep(3, byName['Auto Peças Veloz'], 'Fechamos! Assinou o plano. Onboarding na próxima semana. 🎉');
    await rep(3, byName['Padaria Trigo de Ouro'], 'Proposta enviada, aguardando o retorno do sócio.');

    try { localStorage.setItem(STORE_KEY, JSON.stringify(track)); } catch { /* sem persistência local, tudo bem */ }
    toast('Exemplo da semana gerado! 🎉', 'success');
    return { ok: true };
  } catch (err) {
    // Rollback do que já entrou pra não deixar lixo pela metade
    await deleteTracked(track);
    toast(`Erro ao gerar exemplo: ${err.message}`, 'error');
    return { ok: false, error: err.message };
  }
}

// Remove 1 linha por vez (evita colisão do trigger de log em delete múltiplo).
async function deleteTracked(track) {
  for (const id of track.reports || []) await supabase.from('crm_lead_daily_reports').delete().eq('id', id);
  for (const id of track.calls || []) await supabase.from('crm_calls').delete().eq('id', id);
  for (const id of track.activities || []) await supabase.from('crm_activities').delete().eq('id', id);
  for (const id of track.deals || []) await supabase.from('crm_deals').delete().eq('id', id);
}

export async function clearWeeklyExample() {
  let track;
  try { track = JSON.parse(localStorage.getItem(STORE_KEY) || 'null'); } catch { track = null; }
  if (!track) { toast('Nenhum exemplo pra limpar', 'info'); return { ok: false }; }
  try {
    await deleteTracked(track);
    try { localStorage.removeItem(STORE_KEY); } catch { /* noop */ }
    toast('Exemplo removido', 'success');
    return { ok: true };
  } catch (err) {
    toast(`Erro ao limpar exemplo: ${err.message}`, 'error');
    return { ok: false, error: err.message };
  }
}

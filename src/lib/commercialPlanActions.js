/**
 * PLANO DE ACAO — 5W1H das 5 fases (kanban do plano comercial).
 *
 * Conteudo estatico extraido do PDF "5W1H por fase". Os passos do "COMO" sao os
 * itens checaveis do checklist; o estado (feito/nao) vive na tabela
 * commercial_plan_actions (compartilhado).
 */

import { supabase } from './supabase';

export const PLAN_PHASES = [
  {
    n: '01', key: 'f1',
    title: 'Ativar a carteira do Robert',
    tag: 'Origem da demanda',
    oque: 'Converter a rede do Robert em parcerias e vendas diretas.',
    porque: 'A autoridade do Robert destrava a negociacao — menor CAC, maior conversao. Ponto de partida.',
    quem: 'Robert (abre + reunioes), Kaynan (negocia), SDR (qualifica), closer (fecha).',
    onde: 'Reunioes/demos, WhatsApp (audio) e CRM.',
    quando: '',
    como: [
      'Extrair e classificar a carteira.',
      'Isolar Daniel, Diego, Dudu, James.',
      'Robert dispara audio pessoal.',
      'Negociar (comissao 30% + termo).',
      'Vendas diretas via SDR.',
      'Tudo no CRM com atribuicao.',
      'Devolver a leitura ao Robert.',
    ],
    saidaLabel: 'Criterio de saida',
    saida: 'Prioritarios fechados ou descartados e vendas diretas no funil.',
  },
  {
    n: '02', key: 'f2',
    title: 'Parceiros dos parceiros',
    tag: 'Expansao',
    oque: 'Repetir a Fase 1 um nivel abaixo — cada parceiro vira origem.',
    porque: 'Tirar a demanda do socio fundador; virar canal institucional escalavel.',
    quem: 'Parceiro (abre a rede), Kaynan (negocia), SDR (qualifica).',
    onde: 'Carteira do parceiro, WhatsApp (audio) e CRM.',
    quando: '',
    como: [
      'Extrair a carteira do parceiro.',
      'Isolar os melhores alvos.',
      'Parceiro dispara apresentacao aquecida.',
      'Fechar parcerias de 2o nivel.',
      'Vendas diretas via SDR.',
      'CRM com cadeia de atribuicao.',
    ],
    saidaLabel: 'Criterio de saida',
    saida: 'Um nivel de parceiros do parceiro ativo; ciclo 1->2 sem o Robert.',
  },
  {
    n: '03', key: 'f3',
    title: 'Indicacao em toda venda',
    tag: 'Efeito composto',
    oque: 'Cada venda vira motor de leads: 1 venda -> 5 indicacoes.',
    porque: 'Topo de funil cheio sem trafego frio — efeito composto.',
    quem: 'Kaynan / closer, na propria call de fechamento.',
    onde: 'Na call, no CRM (ao vivo) e WhatsApp (a ponte).',
    quando: 'O "sim" e o momento em que o cliente aprova e fecha a compra. A indicacao se pede nesse instante — ainda na call, no pico da satisfacao, antes de encerrar. Nunca "depois te mando no zap".',
    como: [
      'Pedir na hora, no pico.',
      'Contato concreto: nome + WhatsApp.',
      'Anotar ao vivo no CRM.',
      'Pedir a ponte (cliente apresenta).',
      'Reciclar como lead qualificado.',
    ],
    saidaLabel: 'Efeito',
    saida: 'Loop infinito — todo fechamento repete o pedido.',
  },
  {
    n: '04', key: 'f4',
    title: 'Marketing · velocidade',
    tag: 'Captacao inbound',
    oque: 'Capturar e converter leads de marketing com velocidade maxima.',
    porque: 'Velocidade e o fator no 1 de conversao de inbound.',
    quem: 'SDR (responde + qualifica), closer (fecha); marketing encaminha.',
    onde: 'Canais de inbound e CRM (origem "marketing").',
    quando: 'Em ate 5 min da entrada — SLA duro.',
    como: [
      'Responder em <=5 min.',
      'Qualificar (perfil/porte/setor/dor).',
      'Sem perfil descarta; com perfil agenda.',
      'Sem reuniao -> pool de reativacao.',
      'Fechar (garantia 7 dias); senao reativa.',
    ],
    saidaLabel: 'Resultado',
    saida: 'Inbound no mesmo motor, tudo rastreado no CRM.',
  },
  {
    n: '05', key: 'f5',
    title: 'Padronizacao',
    tag: 'Sistematizacao',
    oque: 'Transformar as fases 1-4 em processo repetivel e escalavel.',
    porque: 'Crescer com vendedores treinados no mesmo padrao — sem heroismo.',
    quem: 'Kaynan (sistematiza + treina); novos closers/SDRs executam.',
    onde: 'No CRM e no playbook versionado.',
    quando: 'Ao fechar 90 dias, com taxas reais consolidadas.',
    como: [
      'Consolidar taxas reais.',
      'Documentar scripts.',
      'Definir SLAs e processo.',
      'Montar playbook de parceiro.',
      'Concentrar no que mais converte.',
      'Treinar o proximo vendedor.',
      'Migrar o Robert para a operacao.',
    ],
    saidaLabel: 'Maturidade',
    saida: 'Operacao previsivel, taxas validadas, novos vendedores na faixa.',
  },
];

/** id estavel do passo (ex: 'f1-0'). */
export const actionId = (phaseKey, idx) => `${phaseKey}-${idx}`;

/** Total de passos checaveis do plano. */
export const TOTAL_ACTIONS = PLAN_PHASES.reduce((s, p) => s + p.como.length, 0);

/** Estado do checklist: { [id]: { done, doneBy, doneAt } }. */
export async function getPlanActionsState() {
  const { data, error } = await supabase
    .from('commercial_plan_actions')
    .select('id, done, done_by, done_at');
  if (error) {
    console.error('[Plano de acao] erro ao ler estado:', error.message);
    return {};
  }
  const map = {};
  for (const r of data || []) {
    map[r.id] = { done: !!r.done, doneBy: r.done_by || null, doneAt: r.done_at || null };
  }
  return map;
}

/** Marca/desmarca um passo (upsert). */
export async function setPlanActionDone(id, done, by) {
  const now = new Date().toISOString();
  const row = {
    id,
    done: !!done,
    done_by: done ? (by || null) : null,
    done_at: done ? now : null,
    updated_at: now,
  };
  const { error } = await supabase
    .from('commercial_plan_actions')
    .upsert(row, { onConflict: 'id' });
  if (error) {
    console.error('[Plano de acao] erro ao salvar:', error.message);
    throw error;
  }
  return true;
}

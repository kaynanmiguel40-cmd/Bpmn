-- ============================================================
-- O.S. de TESTE / DEMONSTRACAO
-- ------------------------------------------------------------
-- Insere UMA ordem de servico completa (grupos + tarefas + briefings
-- + status de revisao) so pra visualizar a feature no quadro.
--
-- Rode no Supabase -> SQL Editor. Depois e so abrir Ordens de Servico.
--
-- Para APAGAR depois (e a numeracao volta ao normal):
--   DELETE FROM public.os_orders WHERE id = 'os_teste_demo_001';
--
-- Obs: a numeracao do quadro vai pular pra ~9002 enquanto esta O.S.
-- existir (ela usa #9001). Ao apagar, volta ao normal.
-- ============================================================

INSERT INTO public.os_orders (id, number, title, description, priority, status, checklist)
VALUES (
  'os_teste_demo_001',
  9001,
  '[TESTE] Onboarding do Cliente Acme',
  $desc$<p>O.S. de demonstracao &mdash; mostra grupos, tarefas, briefings ricos e o status de revisao do supervisor.</p>$desc$,
  'high',
  'available',
  $json$[
    {
      "id": 9001001,
      "text": "Agendar reuniao de boas-vindas (kickoff)",
      "group": "Kickoff",
      "done": true,
      "briefing": "<h3>Objetivo</h3><p>Dar o tom de parceria e alinhar expectativas logo no inicio.</p><h3>Passo a passo</h3><ol><li>Agendar em ate 48h apos o fechamento.</li><li>Confirmar participantes (decisor + responsavel pela conta).</li><li>Enviar pauta: objetivos, prazos, proximos passos.</li></ol><p><strong>Pronto quando:</strong> reuniao agendada e confirmada pelo cliente.</p>",
      "briefingBy": "Kaynan",
      "briefingAt": "2026-06-10T13:00:00.000Z",
      "reviewStatus": "approved",
      "reviewBy": "Supervisor",
      "reviewAt": "2026-06-11T15:00:00.000Z",
      "startedAt": null, "completedAt": null, "durationMin": null, "pausedAt": null, "accumulatedMin": 0
    },
    {
      "id": 9001002,
      "text": "Coletar dados e documentos do cliente",
      "group": "Kickoff",
      "done": false,
      "briefing": "<h3>O que coletar</h3><ul data-type='taskList'><li data-type='taskItem' data-checked='true'><p>CNPJ e razao social</p></li><li data-type='taskItem' data-checked='false'><p>Usuarios que terao acesso</p></li><li data-type='taskItem' data-checked='false'><p>Integracoes necessarias</p></li></ul><p><strong>Pronto quando:</strong> formulario respondido e documentos recebidos.</p>",
      "briefingBy": "Kaynan",
      "briefingAt": "2026-06-10T13:10:00.000Z",
      "reviewStatus": "review",
      "reviewBy": "Kaynan",
      "reviewAt": "2026-06-12T09:00:00.000Z",
      "startedAt": null, "completedAt": null, "durationMin": null, "pausedAt": null, "accumulatedMin": 0
    },
    {
      "id": 9001003,
      "text": "Configurar conta, usuarios e permissoes",
      "group": "Configuracao",
      "done": false,
      "briefing": "<h3>Objetivo</h3><p>Deixar o ambiente pronto pro cliente usar no primeiro acesso.</p><table><tbody><tr><th>Passo</th><th>Feito?</th></tr><tr><td>Criar login e enviar credenciais</td><td>&nbsp;</td></tr><tr><td>Configurar perfil da empresa</td><td>&nbsp;</td></tr><tr><td>Definir permissao de cada usuario</td><td>&nbsp;</td></tr></tbody></table><blockquote><p>&#128161; <strong>Dica:</strong> mande as credenciais por canal seguro, nunca por email aberto.</p></blockquote>",
      "briefingBy": "Kaynan",
      "briefingAt": "2026-06-10T13:20:00.000Z",
      "reviewStatus": null, "reviewBy": null, "reviewAt": null,
      "startedAt": null, "completedAt": null, "durationMin": null, "pausedAt": null, "accumulatedMin": 0
    },
    {
      "id": 9001004,
      "text": "Importar dados iniciais",
      "group": "Configuracao",
      "done": false,
      "briefing": "",
      "startedAt": null, "completedAt": null, "durationMin": null, "pausedAt": null, "accumulatedMin": 0
    },
    {
      "id": 9001005,
      "text": "Check-in de 7 dias",
      "group": "Acompanhamento",
      "done": false,
      "briefing": "<p>Primeiro pulso pos go-live: pegar duvida/atrito cedo, antes de virar churn.</p><ul><li>Esta usando? Onde travou?</li><li>Resolver na hora ou abrir tarefa.</li></ul>",
      "briefingBy": "Kaynan",
      "briefingAt": "2026-06-10T13:30:00.000Z",
      "reviewStatus": null,
      "startedAt": null, "completedAt": null, "durationMin": null, "pausedAt": null, "accumulatedMin": 0
    }
  ]$json$::jsonb
);

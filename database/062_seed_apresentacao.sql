-- ============================================================
-- SEED DE APRESENTAÇÃO — setor + projeto + 1 O.S. COMPLETA
-- ------------------------------------------------------------
-- Cria, prontos pra demonstrar:
--   • 1 setor de O.S. novo  ........ "Implantação"
--   • 1 projeto novo no setor ...... "Implantação — Contabilidade Silva"
--   • 1 O.S. completa, toda briefada, com:
--       - 9 tarefas em 5 grupos (Kickoff → Go-live)
--       - briefings ricos (HTML) em todas
--       - entregas + avaliação de qualidade (nota por critério)
--       - 1 tarefa em revisão (aguardando avaliação)
--       - 1 CONTESTAÇÃO em aberto e 1 já resolvida (nota ajustada)
--       - prazos (dueAt) → aparece na Agenda; prazo de entrega da O.S. também
--
-- Rode no Supabase → SQL Editor. Idempotente (pode rodar de novo).
--
-- Para APAGAR depois:
--   DELETE FROM public.os_orders   WHERE id = 'os_demo_apresentacao_001';
--   DELETE FROM public.os_projects WHERE id = 'proj_silva_onboarding';
--   DELETE FROM public.os_sectors  WHERE id = 'sector_implantacao';
-- ============================================================

-- 0) Limpa O.S. de teste antigas (a [TESTE] Acme e re-runs deste seed)
DELETE FROM public.os_orders WHERE id IN ('os_teste_demo_001', 'os_demo_apresentacao_001');

-- 1) Setor de O.S. (novo)
INSERT INTO public.os_sectors (id, label, color)
VALUES ('sector_implantacao', 'Implantação', '#0EA5E9')
ON CONFLICT (id) DO UPDATE SET label = EXCLUDED.label, color = EXCLUDED.color;

-- 2) Projeto (novo) dentro do setor
INSERT INTO public.os_projects (id, name, sector_id, color, description, status, project_type)
VALUES (
  'proj_silva_onboarding',
  'Implantação — Contabilidade Silva',
  'sector_implantacao',
  '#0EA5E9',
  'Onboarding completo do cliente Contabilidade Silva & Associados.',
  'active',
  'execution'
)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name, sector_id = EXCLUDED.sector_id, color = EXCLUDED.color,
      description = EXCLUDED.description, status = EXCLUDED.status, project_type = EXCLUDED.project_type;

-- 3) O.S. completa
INSERT INTO public.os_orders (
  id, number, title, description, priority, status, mode,
  client, assignee, supervisor, project_id, sort_order,
  estimated_start, estimated_end, checklist_groups, checklist
)
VALUES (
  'os_demo_apresentacao_001',
  9100,
  'Implantação Fyness — Contabilidade Silva & Associados',
  $desc$<p>Onboarding completo de um cliente novo: do kickoff ao go-live. Mostra briefings ricos, entregas com avaliação de qualidade e o fluxo de contestação da nota.</p>$desc$,
  'high',
  'in_progress',
  'solo',
  'Contabilidade Silva & Associados',
  'Kaynan',
  'Kaynan',
  'proj_silva_onboarding',
  0,
  '2026-06-12T09:00:00Z',
  '2026-06-30T18:00:00Z',
  $groups$[
    {"name": "Treinamento", "dueAt": "2026-06-26T18:00:00.000Z"},
    {"name": "Go-live", "dueAt": "2026-06-30T18:00:00.000Z"}
  ]$groups$::jsonb,
  $json$[
    {
      "id": 9100101,
      "text": "Reunião de kickoff com o cliente",
      "group": "Kickoff",
      "done": true,
      "dueAt": "2026-06-13T17:00:00.000Z",
      "estimatedMinutes": 50,
      "briefing": "<h3>Objetivo</h3><p>Dar o tom de parceria e alinhar expectativas logo no início da implantação.</p><h3>Passo a passo</h3><ol><li>Agendar em até 48h após o fechamento.</li><li>Confirmar participantes (decisor + responsável financeiro).</li><li>Enviar a pauta: objetivos, prazos e próximos passos.</li></ol><p><strong>Pronto quando:</strong> reunião feita e ata enviada ao cliente.</p>",
      "briefingBy": "Kaynan",
      "briefingAt": "2026-06-11T13:00:00.000Z",
      "delivery": "<p>Kickoff de 50min com o sócio e a responsável financeira. Alinhamos escopo, prazos e o canal de suporte. Ata enviada por e-mail no mesmo dia.</p>",
      "deliveryBy": "Elias",
      "deliveryAt": "2026-06-13T16:30:00.000Z",
      "reviewStatus": "approved",
      "reviewBy": "Kaynan",
      "reviewAt": "2026-06-13T18:00:00.000Z",
      "qualityPct": 100,
      "qualityAnswers": {"funcional": 5, "escopo": 5, "sem_retrabalho": 5, "documentado": 5, "proatividade": 5},
      "qualityNotes": {},
      "startedAt": "2026-06-13T15:40:00.000Z", "completedAt": "2026-06-13T16:30:00.000Z", "durationMin": 50, "pausedAt": null, "accumulatedMin": 50
    },
    {
      "id": 9100102,
      "text": "Coletar documentos e acessos do cliente",
      "group": "Kickoff",
      "done": true,
      "dueAt": "2026-06-16T17:00:00.000Z",
      "estimatedMinutes": 40,
      "briefing": "<h3>O que coletar</h3><ul><li>CNPJ e razão social</li><li>Acessos bancários (Open Finance) e das maquininhas</li><li>Plano de contas atual (se houver)</li><li>Usuários que terão acesso</li></ul><p><strong>Pronto quando:</strong> formulário respondido e documentos recebidos.</p>",
      "briefingBy": "Kaynan",
      "briefingAt": "2026-06-11T13:10:00.000Z",
      "delivery": "<p>Recebi CNPJ, contrato social e os acessos de 2 bancos. Faltou o acesso da maquininha — cobrado, chega amanhã.</p>",
      "deliveryBy": "Elias",
      "deliveryAt": "2026-06-16T15:00:00.000Z",
      "reviewStatus": "approved",
      "reviewBy": "Kaynan",
      "reviewAt": "2026-06-16T18:00:00.000Z",
      "qualityPct": 88,
      "qualityAnswers": {"funcional": 5, "escopo": 5, "sem_retrabalho": 4, "documentado": 3, "proatividade": 4},
      "qualityNotes": {"documentado": "Faltou anexar o checklist de coleta preenchido."},
      "startedAt": "2026-06-16T14:20:00.000Z", "completedAt": "2026-06-16T15:00:00.000Z", "durationMin": 40, "pausedAt": null, "accumulatedMin": 40
    },
    {
      "id": 9100201,
      "text": "Montar o plano de contas do cliente",
      "group": "Configuração",
      "done": true,
      "dueAt": "2026-06-17T17:00:00.000Z",
      "estimatedMinutes": 90,
      "briefing": "<h3>Objetivo</h3><p>Estruturar o plano de contas pra que os relatórios (DRE, fluxo) saiam corretos desde o início.</p><ol><li>Partir do modelo padrão do segmento.</li><li>Adaptar às receitas/despesas reais do cliente.</li><li>Validar o agrupamento com o contador.</li></ol><p><strong>Pronto quando:</strong> plano de contas aprovado pelo contador.</p>",
      "briefingBy": "Kaynan",
      "briefingAt": "2026-06-11T13:20:00.000Z",
      "delivery": "<p>Plano de contas montado a partir do modelo de serviços e ajustado às contas reais. Validei o agrupamento com o contador por call.</p>",
      "deliveryBy": "Elias",
      "deliveryAt": "2026-06-17T16:10:00.000Z",
      "reviewStatus": "approved",
      "reviewBy": "Kaynan",
      "reviewAt": "2026-06-17T19:00:00.000Z",
      "qualityPct": 97,
      "qualityAnswers": {"funcional": 5, "escopo": 5, "sem_retrabalho": 5, "documentado": 4, "proatividade": 5},
      "qualityNotes": {"documentado": "Pequeno ajuste no agrupamento de contas após a contestação."},
      "qualityDispute": {
        "status": "resolved",
        "by": "Elias",
        "byId": null,
        "criterion": "documentado",
        "reason": "Anexei o de-para das contas no card — a documentação estava completa, dava pra ser mais que 3.",
        "at": "2026-06-17T20:00:00.000Z",
        "outcome": "changed",
        "resolvedBy": "Kaynan",
        "resolutionNote": "Procede, revi o card e ajustei a nota.",
        "resolvedAt": "2026-06-18T10:00:00.000Z",
        "prevPct": 80
      },
      "startedAt": "2026-06-17T14:40:00.000Z", "completedAt": "2026-06-17T16:10:00.000Z", "durationMin": 90, "pausedAt": null, "accumulatedMin": 90
    },
    {
      "id": 9100202,
      "text": "Configurar usuários e permissões",
      "group": "Configuração",
      "done": true,
      "dueAt": "2026-06-18T17:00:00.000Z",
      "estimatedMinutes": 35,
      "briefing": "<h3>Objetivo</h3><p>Deixar cada pessoa do cliente com o acesso certo.</p><ul><li>Criar login e enviar por canal seguro.</li><li>Definir a permissão de cada usuário.</li><li>Testar um login de cada perfil.</li></ul>",
      "briefingBy": "Kaynan",
      "briefingAt": "2026-06-11T13:30:00.000Z",
      "delivery": "<p>3 usuários criados (sócio, financeiro, contador) com permissões diferentes. Credenciais enviadas pelo cofre. Testei um login de cada.</p>",
      "deliveryBy": "Elias",
      "deliveryAt": "2026-06-18T15:30:00.000Z",
      "reviewStatus": "review",
      "reviewBy": "Kaynan",
      "reviewAt": "2026-06-18T16:00:00.000Z",
      "startedAt": "2026-06-18T15:00:00.000Z", "completedAt": "2026-06-18T15:30:00.000Z", "durationMin": 35, "pausedAt": null, "accumulatedMin": 35
    },
    {
      "id": 9100301,
      "text": "Migrar 12 meses de histórico",
      "group": "Migração",
      "done": true,
      "dueAt": "2026-06-19T17:00:00.000Z",
      "estimatedMinutes": 110,
      "briefing": "<h3>Objetivo</h3><p>Trazer o histórico pra dar base aos relatórios e comparativos.</p><ol><li>Exportar a planilha histórica do cliente.</li><li>Conferir os saldos de abertura.</li><li>Importar e validar 3 meses por amostragem.</li></ol><p><strong>Pronto quando:</strong> 12 meses migrados e os saldos batendo.</p>",
      "briefingBy": "Kaynan",
      "briefingAt": "2026-06-11T13:40:00.000Z",
      "delivery": "<p>12 meses migrados. Conferi os saldos de abertura e validei 3 meses por amostragem — tudo batendo com o extrato.</p>",
      "deliveryBy": "Lorena",
      "deliveryAt": "2026-06-19T16:20:00.000Z",
      "reviewStatus": "approved",
      "reviewBy": "Kaynan",
      "reviewAt": "2026-06-19T18:30:00.000Z",
      "qualityPct": 80,
      "qualityAnswers": {"funcional": 5, "escopo": 4, "sem_retrabalho": 4, "documentado": 3, "proatividade": 2},
      "qualityNotes": {"documentado": "Faltou registrar o de-para da migração.", "proatividade": "Seguiu o combinado, sem antecipar pontos."},
      "qualityDispute": {
        "status": "open",
        "by": "Lorena",
        "byId": null,
        "criterion": "proatividade",
        "reason": "Discordo do 2 em proatividade: avisei do problema dos lançamentos duplicados antes do prazo e já trouxe a solução pronta. Segue o print na conversa.",
        "at": "2026-06-19T20:00:00.000Z"
      },
      "startedAt": "2026-06-19T14:30:00.000Z", "completedAt": "2026-06-19T16:20:00.000Z", "durationMin": 110, "pausedAt": null, "accumulatedMin": 110
    },
    {
      "id": 9100302,
      "text": "Conciliar saldos de abertura",
      "group": "Migração",
      "done": false,
      "dueAt": "2026-06-23T17:00:00.000Z",
      "estimatedMinutes": 60,
      "briefing": "<h3>Objetivo</h3><p>Garantir que o saldo inicial de cada conta bate com o banco no dia da virada.</p><ul><li>Comparar saldo do sistema x extrato.</li><li>Ajustar diferenças e documentar a causa.</li></ul>",
      "briefingBy": "Kaynan",
      "briefingAt": "2026-06-11T13:45:00.000Z",
      "reviewStatus": null,
      "startedAt": null, "completedAt": null, "durationMin": null, "pausedAt": null, "accumulatedMin": 0
    },
    {
      "id": 9100401,
      "text": "Treinar a equipe no lançamento diário",
      "group": "Treinamento",
      "done": false,
      "dueAt": "2026-06-25T17:00:00.000Z",
      "estimatedMinutes": 50,
      "briefing": "<h3>Objetivo</h3><p>Deixar o cliente lançando sozinho com segurança.</p><ol><li>Mostrar o lançamento de receita e despesa.</li><li>Anexar comprovante e categorizar.</li><li>Deixar um roteiro de 1 página.</li></ol>",
      "briefingBy": "Kaynan",
      "briefingAt": "2026-06-11T13:50:00.000Z",
      "reviewStatus": null,
      "startedAt": null, "completedAt": null, "durationMin": null, "pausedAt": null, "accumulatedMin": 0
    },
    {
      "id": 9100402,
      "text": "Treinar no fluxo de caixa projetado",
      "group": "Treinamento",
      "done": false,
      "dueAt": "2026-06-26T17:00:00.000Z",
      "estimatedMinutes": 45,
      "briefing": "<h3>Objetivo</h3><p>Ensinar a usar a projeção pra tomar decisão.</p><ul><li>Como ler a projeção de 90 dias.</li><li>Configurar alertas de saldo mínimo.</li></ul>",
      "briefingBy": "Kaynan",
      "briefingAt": "2026-06-11T13:55:00.000Z",
      "reviewStatus": null,
      "startedAt": null, "completedAt": null, "durationMin": null, "pausedAt": null, "accumulatedMin": 0
    },
    {
      "id": 9100501,
      "text": "Check-in de 7 dias pós go-live",
      "group": "Go-live",
      "done": false,
      "dueAt": "2026-06-30T17:00:00.000Z",
      "estimatedMinutes": 30,
      "briefing": "<p>Primeiro pulso pós go-live: pegar dúvida/atrito cedo, antes de virar churn.</p><ul><li>Está usando? Onde travou?</li><li>Resolver na hora ou abrir tarefa.</li></ul>",
      "briefingBy": "Kaynan",
      "briefingAt": "2026-06-11T14:00:00.000Z",
      "reviewStatus": null,
      "startedAt": null, "completedAt": null, "durationMin": null, "pausedAt": null, "accumulatedMin": 0
    }
  ]$json$::jsonb
);

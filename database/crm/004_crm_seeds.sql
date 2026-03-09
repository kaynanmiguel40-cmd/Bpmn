-- ============================================================
-- FYNESS CRM - SEED DATA (dados fictícios em português)
-- Execute este script no SQL Editor do Supabase
-- IMPORTANTE: usa auth.uid() como created_by — execute logado
-- ============================================================

-- ============================================================
-- IDs fixos para referência cruzada
-- ============================================================
DO $$
DECLARE
  v_user_id UUID := auth.uid();

  -- Empresas
  emp_1 UUID := gen_random_uuid();
  emp_2 UUID := gen_random_uuid();
  emp_3 UUID := gen_random_uuid();
  emp_4 UUID := gen_random_uuid();
  emp_5 UUID := gen_random_uuid();

  -- Contatos (25)
  ct_01 UUID := gen_random_uuid();
  ct_02 UUID := gen_random_uuid();
  ct_03 UUID := gen_random_uuid();
  ct_04 UUID := gen_random_uuid();
  ct_05 UUID := gen_random_uuid();
  ct_06 UUID := gen_random_uuid();
  ct_07 UUID := gen_random_uuid();
  ct_08 UUID := gen_random_uuid();
  ct_09 UUID := gen_random_uuid();
  ct_10 UUID := gen_random_uuid();
  ct_11 UUID := gen_random_uuid();
  ct_12 UUID := gen_random_uuid();
  ct_13 UUID := gen_random_uuid();
  ct_14 UUID := gen_random_uuid();
  ct_15 UUID := gen_random_uuid();
  ct_16 UUID := gen_random_uuid();
  ct_17 UUID := gen_random_uuid();
  ct_18 UUID := gen_random_uuid();
  ct_19 UUID := gen_random_uuid();
  ct_20 UUID := gen_random_uuid();
  ct_21 UUID := gen_random_uuid();
  ct_22 UUID := gen_random_uuid();
  ct_23 UUID := gen_random_uuid();
  ct_24 UUID := gen_random_uuid();
  ct_25 UUID := gen_random_uuid();

  -- Pipeline e stages
  pipe_1  UUID := gen_random_uuid();
  stg_1   UUID := gen_random_uuid();
  stg_2   UUID := gen_random_uuid();
  stg_3   UUID := gen_random_uuid();
  stg_4   UUID := gen_random_uuid();
  stg_5   UUID := gen_random_uuid();
  stg_6   UUID := gen_random_uuid();

  -- Deals (20)
  dl_01 UUID := gen_random_uuid();
  dl_02 UUID := gen_random_uuid();
  dl_03 UUID := gen_random_uuid();
  dl_04 UUID := gen_random_uuid();
  dl_05 UUID := gen_random_uuid();
  dl_06 UUID := gen_random_uuid();
  dl_07 UUID := gen_random_uuid();
  dl_08 UUID := gen_random_uuid();
  dl_09 UUID := gen_random_uuid();
  dl_10 UUID := gen_random_uuid();
  dl_11 UUID := gen_random_uuid();
  dl_12 UUID := gen_random_uuid();
  dl_13 UUID := gen_random_uuid();
  dl_14 UUID := gen_random_uuid();
  dl_15 UUID := gen_random_uuid();
  dl_16 UUID := gen_random_uuid();
  dl_17 UUID := gen_random_uuid();
  dl_18 UUID := gen_random_uuid();
  dl_19 UUID := gen_random_uuid();
  dl_20 UUID := gen_random_uuid();

  -- Propostas (5)
  prop_1 UUID := gen_random_uuid();
  prop_2 UUID := gen_random_uuid();
  prop_3 UUID := gen_random_uuid();
  prop_4 UUID := gen_random_uuid();
  prop_5 UUID := gen_random_uuid();

BEGIN

-- ============================================================
-- 1. EMPRESAS (5 empresas brasileiras)
-- ============================================================
INSERT INTO public.crm_companies (id, name, cnpj, segment, size, revenue, phone, email, website, address, city, state, notes, created_by) VALUES
  (emp_1, 'TechNova Soluções Digitais', '12.345.678/0001-90', 'Tecnologia', 'Médio', 2400000, '(11) 3456-7890', 'contato@technova.com.br', 'www.technova.com.br', 'Av. Paulista, 1578 - Sala 1204', 'São Paulo', 'SP', 'Empresa de software B2B com foco em automação industrial. Cliente desde 2024.', v_user_id),
  (emp_2, 'Construtora Horizonte', '23.456.789/0001-01', 'Construção Civil', 'Grande', 18500000, '(21) 2345-6789', 'comercial@horizonte.eng.br', 'www.horizonteconstrutora.com.br', 'Rua da Assembleia, 100 - 15º andar', 'Rio de Janeiro', 'RJ', 'Construtora com obras em RJ e SP. Interesse em sistema de gestão de obras.', v_user_id),
  (emp_3, 'AgroVita Alimentos', '34.567.890/0001-12', 'Agronegócio', 'Grande', 45000000, '(62) 3456-1234', 'vendas@agrovita.com.br', 'www.agrovita.com.br', 'Rod. GO-060, km 12 - Zona Rural', 'Goiânia', 'GO', 'Distribuidora de alimentos orgânicos. Rede de 120 produtores parceiros.', v_user_id),
  (emp_4, 'EduPlus Cursos Online', '45.678.901/0001-23', 'Educação', 'Pequeno', 850000, '(31) 9876-5432', 'parcerias@eduplus.com.br', 'www.eduplus.com.br', 'Rua Espírito Santo, 456 - Sala 302', 'Belo Horizonte', 'MG', 'Plataforma EAD com 15 mil alunos ativos. Busca integração com CRM.', v_user_id),
  (emp_5, 'LogiMax Transportes', '56.789.012/0001-34', 'Logística', 'Médio', 6200000, '(41) 3344-5566', 'diretoria@logimax.com.br', 'www.logimax.com.br', 'Av. Comendador Franco, 2100', 'Curitiba', 'PR', 'Frota de 80 caminhões. Atende Sul e Sudeste. Quer digitalizar processos.', v_user_id);

-- ============================================================
-- 2. CONTATOS (25 contatos distribuídos)
-- ============================================================
INSERT INTO public.crm_contacts (id, name, email, phone, position, avatar_color, status, company_id, tags, city, state, notes, created_by) VALUES
  -- TechNova (6 contatos)
  (ct_01, 'Rafael Mendes',     'rafael.mendes@technova.com.br',    '(11) 99001-1001', 'CEO',                    '#3b82f6', 'customer', emp_1, '["decisor", "c-level"]'::jsonb,         'São Paulo', 'SP', 'Decisor final. Prefere reuniões às 10h.',            v_user_id),
  (ct_02, 'Camila Ferreira',   'camila.ferreira@technova.com.br',  '(11) 99002-2002', 'Diretora de TI',         '#8b5cf6', 'customer', emp_1, '["técnico", "influenciador"]'::jsonb,   'São Paulo', 'SP', 'Avalia tecnicamente todas as propostas.',             v_user_id),
  (ct_03, 'Thiago Oliveira',   'thiago.oliveira@technova.com.br',  '(11) 99003-3003', 'Gerente de Projetos',    '#06b6d4', 'active',   emp_1, '["operacional"]'::jsonb,                'São Paulo', 'SP', 'Responsável pela implantação.',                       v_user_id),
  (ct_04, 'Juliana Santos',    'juliana.santos@technova.com.br',   '(11) 99004-4004', 'Analista de Compras',    '#f59e0b', 'active',   emp_1, '["compras"]'::jsonb,                    'São Paulo', 'SP', 'Cuida da parte burocrática e contratos.',             v_user_id),
  (ct_05, 'Lucas Rodrigues',   'lucas.rodrigues@technova.com.br',  '(11) 99005-5005', 'Dev Lead',               '#10b981', 'active',   emp_1, '["técnico"]'::jsonb,                    'São Paulo', 'SP', 'Valida integrações via API.',                         v_user_id),
  (ct_06, 'Ana Paula Costa',   'anapaula.costa@technova.com.br',   '(11) 99006-6006', 'Coord. de Marketing',    '#ec4899', 'lead',     emp_1, '["marketing"]'::jsonb,                  'São Paulo', 'SP', 'Interessada em módulo de relatórios.',                v_user_id),

  -- Construtora Horizonte (5 contatos)
  (ct_07, 'Marcos Vieira',     'marcos.vieira@horizonte.eng.br',   '(21) 98001-1001', 'Diretor Geral',          '#3b82f6', 'customer', emp_2, '["decisor", "c-level"]'::jsonb,         'Rio de Janeiro', 'RJ', 'Fundador da empresa. Muito exigente com prazos.',   v_user_id),
  (ct_08, 'Fernanda Lima',     'fernanda.lima@horizonte.eng.br',   '(21) 98002-2002', 'Gerente Financeira',     '#f59e0b', 'customer', emp_2, '["financeiro", "influenciador"]'::jsonb, 'Rio de Janeiro', 'RJ', 'Aprova orçamentos. Prefere propostas detalhadas.',  v_user_id),
  (ct_09, 'Roberto Almeida',   'roberto.almeida@horizonte.eng.br', '(21) 98003-3003', 'Engenheiro Chefe',       '#06b6d4', 'active',   emp_2, '["técnico"]'::jsonb,                    'Rio de Janeiro', 'RJ', 'Coordena 3 obras simultâneas.',                     v_user_id),
  (ct_10, 'Patrícia Souza',    'patricia.souza@horizonte.eng.br',  '(21) 98004-4004', 'Coord. Administrativa',  '#10b981', 'active',   emp_2, '["administrativo"]'::jsonb,             'Rio de Janeiro', 'RJ', 'Ponto de contato para agendamentos.',               v_user_id),
  (ct_11, 'André Nascimento',  'andre.nascimento@horizonte.eng.br','(21) 98005-5005', 'Estagiário de Eng.',     '#94a3b8', 'lead',     emp_2, '["junior"]'::jsonb,                     'Rio de Janeiro', 'RJ', 'Suporte operacional ao Roberto.',                   v_user_id),

  -- AgroVita (5 contatos)
  (ct_12, 'Dona Helena Martins','helena.martins@agrovita.com.br',  '(62) 99001-1234', 'Fundadora e CEO',        '#3b82f6', 'customer', emp_3, '["decisor", "c-level"]'::jsonb,         'Goiânia',   'GO', 'Visionária. Lidera expansão para o Nordeste.',       v_user_id),
  (ct_13, 'Pedro Henrique',    'pedro.henrique@agrovita.com.br',   '(62) 99002-2345', 'Diretor Comercial',      '#8b5cf6', 'customer', emp_3, '["comercial", "influenciador"]'::jsonb, 'Goiânia',   'GO', 'Negocia parcerias com varejistas.',                   v_user_id),
  (ct_14, 'Marina Carvalho',   'marina.carvalho@agrovita.com.br',  '(62) 99003-3456', 'Gerente de Logística',   '#f59e0b', 'active',   emp_3, '["logística"]'::jsonb,                  'Goiânia',   'GO', 'Responsável pela cadeia de distribuição.',            v_user_id),
  (ct_15, 'Bruno Silva',       'bruno.silva@agrovita.com.br',      '(62) 99004-4567', 'Analista de TI',         '#10b981', 'active',   emp_3, '["técnico"]'::jsonb,                    'Goiânia',   'GO', 'Avalia ferramentas de automação.',                    v_user_id),
  (ct_16, 'Isabela Rocha',     'isabela.rocha@agrovita.com.br',    '(62) 99005-5678', 'Coord. de Qualidade',    '#ec4899', 'lead',     emp_3, '["qualidade"]'::jsonb,                  'Goiânia',   'GO', 'Procura sistema de rastreabilidade.',                 v_user_id),

  -- EduPlus (5 contatos)
  (ct_17, 'Dr. Ricardo Teixeira','ricardo.teixeira@eduplus.com.br','(31) 99001-0001', 'Co-fundador',            '#3b82f6', 'customer', emp_4, '["decisor", "c-level"]'::jsonb,         'Belo Horizonte', 'MG', 'PhD em Educação. Focado em metodologias ativas.',  v_user_id),
  (ct_18, 'Larissa Gomes',     'larissa.gomes@eduplus.com.br',     '(31) 99002-0002', 'Head de Produto',        '#8b5cf6', 'customer', emp_4, '["produto", "influenciador"]'::jsonb,   'Belo Horizonte', 'MG', 'Define roadmap da plataforma.',                     v_user_id),
  (ct_19, 'Gustavo Pereira',   'gustavo.pereira@eduplus.com.br',   '(31) 99003-0003', 'Desenvolvedor Full-Stack','#06b6d4', 'active',  emp_4, '["técnico"]'::jsonb,                    'Belo Horizonte', 'MG', 'Implementa integrações.',                           v_user_id),
  (ct_20, 'Aline Moreira',     'aline.moreira@eduplus.com.br',     '(31) 99004-0004', 'Coord. Pedagógica',      '#10b981', 'active',  emp_4, '["educacional"]'::jsonb,                'Belo Horizonte', 'MG', 'Define conteúdo e trilhas de aprendizado.',         v_user_id),
  (ct_21, 'Felipe Cardoso',    'felipe.cardoso@eduplus.com.br',    '(31) 99005-0005', 'Financeiro',             '#f59e0b', 'lead',    emp_4, '["financeiro"]'::jsonb,                 'Belo Horizonte', 'MG', 'Cuida de faturamento e contratos.',                 v_user_id),

  -- LogiMax (4 contatos)
  (ct_22, 'Carlos Eduardo Pinto','carlos.pinto@logimax.com.br',    '(41) 99001-1111', 'Diretor de Operações',   '#3b82f6', 'customer', emp_5, '["decisor", "c-level"]'::jsonb,         'Curitiba',  'PR', 'Decide investimentos em tecnologia.',                 v_user_id),
  (ct_23, 'Vanessa Duarte',    'vanessa.duarte@logimax.com.br',    '(41) 99002-2222', 'Gerente de Frota',       '#8b5cf6', 'active',   emp_5, '["operacional"]'::jsonb,                'Curitiba',  'PR', 'Precisa de rastreamento em tempo real.',              v_user_id),
  (ct_24, 'Diego Machado',     'diego.machado@logimax.com.br',     '(41) 99003-3333', 'Coord. de TI',           '#06b6d4', 'active',   emp_5, '["técnico"]'::jsonb,                    'Curitiba',  'PR', 'Responsável por integrações de sistemas.',            v_user_id),
  (ct_25, 'Simone Araújo',     'simone.araujo@logimax.com.br',     '(41) 99004-4444', 'Assistente Comercial',   '#ec4899', 'lead',     emp_5, '["comercial"]'::jsonb,                  'Curitiba',  'PR', 'Primeiro ponto de contato. Muito organizada.',       v_user_id);

-- ============================================================
-- 3. PIPELINE PADRÃO + 6 STAGES
-- ============================================================
INSERT INTO public.crm_pipelines (id, name, is_default, created_by)
VALUES (pipe_1, 'Pipeline Comercial', TRUE, v_user_id);

INSERT INTO public.crm_pipeline_stages (id, pipeline_id, name, position, color) VALUES
  (stg_1, pipe_1, 'Prospecção',   1, '#94a3b8'),
  (stg_2, pipe_1, 'Qualificação', 2, '#6366f1'),
  (stg_3, pipe_1, 'Proposta',     3, '#f59e0b'),
  (stg_4, pipe_1, 'Negociação',   4, '#f97316'),
  (stg_5, pipe_1, 'Fechamento',   5, '#10b981'),
  (stg_6, pipe_1, 'Pós-venda',    6, '#06b6d4');

-- ============================================================
-- 4. DEALS (20 negócios distribuídos)
-- ============================================================
INSERT INTO public.crm_deals (id, title, value, probability, contact_id, company_id, pipeline_id, stage_id, expected_close_date, closed_at, status, lost_reason, created_by) VALUES
  -- Prospecção (4 deals)
  (dl_01, 'Automação de Estoque - TechNova',        25000,  10, ct_06, emp_1, pipe_1, stg_1, NOW() + INTERVAL '45 days', NULL, 'open', NULL, v_user_id),
  (dl_02, 'Sistema de Rastreabilidade - AgroVita',   42000,  15, ct_16, emp_3, pipe_1, stg_1, NOW() + INTERVAL '60 days', NULL, 'open', NULL, v_user_id),
  (dl_03, 'Dashboard Gerencial - LogiMax',           18000,  10, ct_25, emp_5, pipe_1, stg_1, NOW() + INTERVAL '50 days', NULL, 'open', NULL, v_user_id),
  (dl_04, 'App Mobile para Motoristas - LogiMax',    55000,  20, ct_24, emp_5, pipe_1, stg_1, NOW() + INTERVAL '90 days', NULL, 'open', NULL, v_user_id),

  -- Qualificação (4 deals)
  (dl_05, 'Plataforma de Gestão de Obras',          150000,  30, ct_09, emp_2, pipe_1, stg_2, NOW() + INTERVAL '40 days', NULL, 'open', NULL, v_user_id),
  (dl_06, 'Integração ERP + CRM - TechNova',         38000,  35, ct_02, emp_1, pipe_1, stg_2, NOW() + INTERVAL '30 days', NULL, 'open', NULL, v_user_id),
  (dl_07, 'Portal do Aluno v2.0 - EduPlus',          28000,  40, ct_18, emp_4, pipe_1, stg_2, NOW() + INTERVAL '35 days', NULL, 'open', NULL, v_user_id),
  (dl_08, 'Módulo de Logística - AgroVita',           72000,  25, ct_14, emp_3, pipe_1, stg_2, NOW() + INTERVAL '55 days', NULL, 'open', NULL, v_user_id),

  -- Proposta (4 deals)
  (dl_09, 'Sistema BPMN Completo - Horizonte',      120000,  50, ct_07, emp_2, pipe_1, stg_3, NOW() + INTERVAL '20 days', NULL, 'open', NULL, v_user_id),
  (dl_10, 'Automação Comercial - AgroVita',           65000,  55, ct_13, emp_3, pipe_1, stg_3, NOW() + INTERVAL '25 days', NULL, 'open', NULL, v_user_id),
  (dl_11, 'Consultoria de Processos - TechNova',      15000,  60, ct_01, emp_1, pipe_1, stg_3, NOW() + INTERVAL '15 days', NULL, 'open', NULL, v_user_id),
  (dl_12, 'LMS Personalizado - EduPlus',              45000,  50, ct_17, emp_4, pipe_1, stg_3, NOW() + INTERVAL '28 days', NULL, 'open', NULL, v_user_id),

  -- Negociação (3 deals)
  (dl_13, 'Implantação Fyness OS - Horizonte',       85000,  70, ct_08, emp_2, pipe_1, stg_4, NOW() + INTERVAL '10 days', NULL, 'open', NULL, v_user_id),
  (dl_14, 'Treinamento + Suporte - TechNova',         9500,  80, ct_03, emp_1, pipe_1, stg_4, NOW() + INTERVAL '7 days',  NULL, 'open', NULL, v_user_id),
  (dl_15, 'Roteirização Inteligente - LogiMax',       95000,  65, ct_22, emp_5, pipe_1, stg_4, NOW() + INTERVAL '18 days', NULL, 'open', NULL, v_user_id),

  -- Fechamento (3 deals - won)
  (dl_16, 'Setup Inicial Fyness - TechNova',          32000, 100, ct_01, emp_1, pipe_1, stg_5, NOW() - INTERVAL '5 days',  NOW() - INTERVAL '5 days',  'won', NULL, v_user_id),
  (dl_17, 'Módulo Financeiro - Horizonte',             48000, 100, ct_08, emp_2, pipe_1, stg_5, NOW() - INTERVAL '12 days', NOW() - INTERVAL '12 days', 'won', NULL, v_user_id),
  (dl_18, 'Integração Moodle - EduPlus',               22000, 100, ct_17, emp_4, pipe_1, stg_5, NOW() - INTERVAL '8 days',  NOW() - INTERVAL '8 days',  'won', NULL, v_user_id),

  -- Pós-venda (1 deal) + 1 lost
  (dl_19, 'Suporte Contínuo 12 meses - TechNova',     36000, 100, ct_01, emp_1, pipe_1, stg_6, NULL,                         NOW() - INTERVAL '30 days', 'won', NULL, v_user_id),
  (dl_20, 'Sistema de BI - LogiMax',                   78000,   0, ct_22, emp_5, pipe_1, stg_1, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', 'lost', 'Optaram por solução concorrente (preço menor)', v_user_id);

-- ============================================================
-- 5. ATIVIDADES (40 atividades nos últimos 60 dias)
-- ============================================================
INSERT INTO public.crm_activities (title, description, type, contact_id, deal_id, start_date, end_date, completed, completed_at, created_by) VALUES
  -- Semana passada e esta semana
  ('Ligação de prospecção',           'Apresentar Fyness para novo contato',                    'call',    ct_06, dl_01, NOW() - INTERVAL '1 day',   NULL,                          FALSE, NULL, v_user_id),
  ('E-mail com proposta',             'Enviar proposta revisada do BPMN',                       'email',   ct_07, dl_09, NOW() - INTERVAL '2 days',  NULL,                          TRUE,  NOW() - INTERVAL '2 days', v_user_id),
  ('Reunião de alinhamento',          'Alinhar escopo do projeto de gestão de obras',           'meeting', ct_09, dl_05, NOW() - INTERVAL '3 days',  NOW() - INTERVAL '3 days' + INTERVAL '1 hour', TRUE, NOW() - INTERVAL '3 days', v_user_id),
  ('Follow-up por telefone',          'Verificar se receberam a proposta',                      'call',    ct_13, dl_10, NOW() - INTERVAL '1 day',   NULL,                          FALSE, NULL, v_user_id),
  ('Almoço com diretor',              'Almoço executivo para estreitar relacionamento',         'lunch',   ct_01, dl_11, NOW() + INTERVAL '2 days',  NOW() + INTERVAL '2 days' + INTERVAL '2 hours', FALSE, NULL, v_user_id),

  -- 1-2 semanas atrás
  ('Demo online do Fyness',           'Apresentação completa da plataforma',                    'meeting', ct_02, dl_06, NOW() - INTERVAL '7 days',  NOW() - INTERVAL '7 days' + INTERVAL '1.5 hours', TRUE, NOW() - INTERVAL '7 days', v_user_id),
  ('Enviar case de sucesso',          'Enviar case da Horizonte para a AgroVita',               'email',   ct_12, dl_10, NOW() - INTERVAL '8 days',  NULL,                          TRUE,  NOW() - INTERVAL '8 days', v_user_id),
  ('Visita técnica',                  'Visitar escritório e entender fluxo atual',              'visit',   ct_22, dl_15, NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days' + INTERVAL '3 hours', TRUE, NOW() - INTERVAL '10 days', v_user_id),
  ('Ligação de qualificação',         'Entender necessidades e orçamento disponível',           'call',    ct_18, dl_07, NOW() - INTERVAL '9 days',  NULL,                          TRUE,  NOW() - INTERVAL '9 days', v_user_id),
  ('Tarefa: preparar proposta',       'Montar proposta comercial com 3 cenários',               'task',    ct_08, dl_13, NOW() - INTERVAL '6 days',  NOW() - INTERVAL '4 days',    TRUE,  NOW() - INTERVAL '4 days', v_user_id),

  -- 2-3 semanas atrás
  ('Reunião de negociação',           'Negociar valores e prazos do contrato',                  'meeting', ct_08, dl_13, NOW() - INTERVAL '14 days', NOW() - INTERVAL '14 days' + INTERVAL '2 hours', TRUE, NOW() - INTERVAL '14 days', v_user_id),
  ('E-mail com material técnico',     'Enviar documentação técnica do Fyness',                  'email',   ct_05, dl_06, NOW() - INTERVAL '15 days', NULL,                          TRUE,  NOW() - INTERVAL '15 days', v_user_id),
  ('Ligação para agendar demo',       'Agendar demonstração para semana que vem',               'call',    ct_24, dl_04, NOW() - INTERVAL '12 days', NULL,                          TRUE,  NOW() - INTERVAL '12 days', v_user_id),
  ('Visita na obra Barra',            'Acompanhar equipe na obra para entender processo',       'visit',   ct_09, dl_05, NOW() - INTERVAL '16 days', NOW() - INTERVAL '16 days' + INTERVAL '4 hours', TRUE, NOW() - INTERVAL '16 days', v_user_id),
  ('Tarefa: atualizar CRM',           'Registrar todas as interações da semana',                'task',    NULL,  NULL,  NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days',    TRUE,  NOW() - INTERVAL '13 days', v_user_id),

  -- 3-4 semanas atrás
  ('Primeira ligação - LogiMax',      'Contato inicial via indicação',                          'call',    ct_25, dl_03, NOW() - INTERVAL '21 days', NULL,                          TRUE,  NOW() - INTERVAL '21 days', v_user_id),
  ('Reunião de kickoff - TechNova',   'Kickoff do projeto Setup Inicial',                       'meeting', ct_01, dl_16, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days' + INTERVAL '2 hours', TRUE, NOW() - INTERVAL '20 days', v_user_id),
  ('E-mail boas-vindas',              'Enviar welcome pack para novo cliente',                  'email',   ct_17, dl_18, NOW() - INTERVAL '22 days', NULL,                          TRUE,  NOW() - INTERVAL '22 days', v_user_id),
  ('Almoço com equipe AgroVita',      'Conhecer time de logística',                             'lunch',   ct_14, dl_08, NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days' + INTERVAL '1.5 hours', TRUE, NOW() - INTERVAL '18 days', v_user_id),
  ('Tarefa: revisar contrato',        'Revisar termos contratuais com jurídico',                'task',    ct_08, dl_17, NOW() - INTERVAL '25 days', NOW() - INTERVAL '23 days',    TRUE,  NOW() - INTERVAL '23 days', v_user_id),

  -- 4-5 semanas atrás
  ('Demo para EduPlus',               'Apresentar módulo de relatórios e EAP',                  'meeting', ct_18, dl_12, NOW() - INTERVAL '28 days', NOW() - INTERVAL '28 days' + INTERVAL '1 hour', TRUE, NOW() - INTERVAL '28 days', v_user_id),
  ('Ligação follow-up - Horizonte',   'Verificar andamento da aprovação interna',               'call',    ct_07, dl_09, NOW() - INTERVAL '30 days', NULL,                          TRUE,  NOW() - INTERVAL '30 days', v_user_id),
  ('E-mail proposta Moodle',          'Enviar proposta de integração Moodle',                   'email',   ct_19, dl_18, NOW() - INTERVAL '32 days', NULL,                          TRUE,  NOW() - INTERVAL '32 days', v_user_id),
  ('Visita sede AgroVita',            'Conhecer operação e estrutura de TI',                    'visit',   ct_15, dl_02, NOW() - INTERVAL '27 days', NOW() - INTERVAL '27 days' + INTERVAL '5 hours', TRUE, NOW() - INTERVAL '27 days', v_user_id),
  ('Tarefa: benchmark concorrência',  'Pesquisar preços de concorrentes para argumentação',     'task',    NULL,  dl_20, NOW() - INTERVAL '29 days', NOW() - INTERVAL '28 days',    TRUE,  NOW() - INTERVAL '28 days', v_user_id),

  -- 5-6 semanas atrás
  ('Prospecção fria - AgroVita',      'Primeiro contato por telefone',                          'call',    ct_12, NULL,  NOW() - INTERVAL '35 days', NULL,                          TRUE,  NOW() - INTERVAL '35 days', v_user_id),
  ('Reunião de discovery',            'Entender dores e objetivos da LogiMax',                  'meeting', ct_22, dl_15, NOW() - INTERVAL '38 days', NOW() - INTERVAL '38 days' + INTERVAL '1.5 hours', TRUE, NOW() - INTERVAL '38 days', v_user_id),
  ('E-mail introdutório',             'Apresentação institucional da Fyness',                   'email',   ct_22, NULL,  NOW() - INTERVAL '40 days', NULL,                          TRUE,  NOW() - INTERVAL '40 days', v_user_id),
  ('Ligação para marcar visita',      'Agendar visita técnica na LogiMax',                      'call',    ct_24, dl_15, NOW() - INTERVAL '36 days', NULL,                          TRUE,  NOW() - INTERVAL '36 days', v_user_id),
  ('Tarefa: montar apresentação',     'Preparar slides customizados para Horizonte',            'task',    ct_07, dl_09, NOW() - INTERVAL '37 days', NOW() - INTERVAL '35 days',    TRUE,  NOW() - INTERVAL '35 days', v_user_id),

  -- 7-8 semanas atrás
  ('Ligação inicial - EduPlus',       'Contato via LinkedIn do Dr. Ricardo',                    'call',    ct_17, NULL,  NOW() - INTERVAL '45 days', NULL,                          TRUE,  NOW() - INTERVAL '45 days', v_user_id),
  ('Reunião com financeiro',          'Apresentar ROI e payback do investimento',               'meeting', ct_08, dl_17, NOW() - INTERVAL '42 days', NOW() - INTERVAL '42 days' + INTERVAL '1 hour', TRUE, NOW() - INTERVAL '42 days', v_user_id),
  ('E-mail com ROI calculado',        'Enviar planilha de ROI personalizada',                   'email',   ct_08, dl_17, NOW() - INTERVAL '43 days', NULL,                          TRUE,  NOW() - INTERVAL '43 days', v_user_id),
  ('Visita escritório TechNova',      'Reunião presencial para fechar Setup Inicial',           'visit',   ct_01, dl_16, NOW() - INTERVAL '40 days', NOW() - INTERVAL '40 days' + INTERVAL '2 hours', TRUE, NOW() - INTERVAL '40 days', v_user_id),
  ('Tarefa: configurar ambiente demo','Preparar ambiente de demonstração com dados reais',      'task',    NULL,  NULL,  NOW() - INTERVAL '44 days', NOW() - INTERVAL '42 days',    TRUE,  NOW() - INTERVAL '42 days', v_user_id),

  -- Atividades futuras agendadas
  ('Demo personalizada - AgroVita',   'Demonstrar módulo logístico com dados da empresa',       'meeting', ct_14, dl_08, NOW() + INTERVAL '3 days',  NOW() + INTERVAL '3 days' + INTERVAL '2 hours', FALSE, NULL, v_user_id),
  ('Ligação de fechamento',           'Negociação final do contrato Horizonte',                 'call',    ct_07, dl_09, NOW() + INTERVAL '5 days',  NULL,                          FALSE, NULL, v_user_id),
  ('Reunião técnica API',             'Alinhar requisitos de integração com dev team',          'meeting', ct_05, dl_06, NOW() + INTERVAL '4 days',  NOW() + INTERVAL '4 days' + INTERVAL '1.5 hours', FALSE, NULL, v_user_id),
  ('Enviar contrato final',           'Enviar minuta do contrato para assinatura',              'email',   ct_22, dl_15, NOW() + INTERVAL '6 days',  NULL,                          FALSE, NULL, v_user_id),
  ('Visita pós-implantação',          'Verificar satisfação e coletar feedback',                'visit',   ct_01, dl_19, NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days' + INTERVAL '3 hours', FALSE, NULL, v_user_id);

-- ============================================================
-- 6. PROPOSTAS (5 propostas com itens)
-- ============================================================

-- Proposta 1: Sistema BPMN para Horizonte (deal dl_09)
INSERT INTO public.crm_proposals (id, deal_id, status, notes, terms, total_value, created_by)
VALUES (prop_1, dl_09, 'sent', 'Proposta completa com módulos BPMN, Kanban e Dashboard.', 'Pagamento em 3x sem juros. Suporte incluso por 6 meses. SLA de 99.5% de disponibilidade.', 120000, v_user_id);

INSERT INTO public.crm_proposal_items (proposal_id, name, description, quantity, unit_price, discount_percent, subtotal) VALUES
  (prop_1, 'Licença Fyness BPMN',        'Licença anual do módulo BPMN com editor visual',        1, 48000, 0,  48000),
  (prop_1, 'Módulo Kanban + Dashboard',   'Módulo de gestão visual e indicadores',                 1, 36000, 0,  36000),
  (prop_1, 'Implantação e Configuração',  'Setup inicial, migração de dados e configuração',       1, 25000, 10, 22500),
  (prop_1, 'Treinamento Presencial',      '40h de treinamento para equipe (até 15 pessoas)',       1, 15000, 10, 13500);

-- Proposta 2: Automação Comercial AgroVita (deal dl_10)
INSERT INTO public.crm_proposals (id, deal_id, status, notes, terms, total_value, created_by)
VALUES (prop_2, dl_10, 'viewed', 'Foco em automação do processo de vendas e distribuição.', 'Pagamento: 40% na assinatura, 60% na entrega. Garantia de 12 meses.', 65000, v_user_id);

INSERT INTO public.crm_proposal_items (proposal_id, name, description, quantity, unit_price, discount_percent, subtotal) VALUES
  (prop_2, 'Módulo CRM',                  'Sistema CRM completo com pipeline e atividades',        1, 28000, 0,  28000),
  (prop_2, 'Automação de Processos',      'Workflows automatizados para vendas e pós-venda',       1, 22000, 0,  22000),
  (prop_2, 'Integrações',                 'Integração com ERP existente e sistema de logística',   1, 18000, 5,  17100);

-- Proposta 3: LMS EduPlus (deal dl_12)
INSERT INTO public.crm_proposals (id, deal_id, status, notes, terms, total_value, created_by)
VALUES (prop_3, dl_12, 'draft', 'Proposta inicial para customização do LMS.', 'Desenvolvimento em sprints de 2 semanas. Pagamento mensal conforme entregas.', 45000, v_user_id);

INSERT INTO public.crm_proposal_items (proposal_id, name, description, quantity, unit_price, discount_percent, subtotal) VALUES
  (prop_3, 'Customização LMS',            'Personalização da plataforma de ensino',                1, 20000, 0,  20000),
  (prop_3, 'Integração Moodle',           'Conector bidirecional Fyness ↔ Moodle',                1, 12000, 0,  12000),
  (prop_3, 'Dashboard Pedagógico',        'Painel de indicadores para coordenação',                1,  8000, 0,   8000),
  (prop_3, 'App Mobile (PWA)',            'Versão mobile responsiva para alunos',                  1,  5000, 0,   5000);

-- Proposta 4: Implantação Fyness Horizonte (deal dl_13)
INSERT INTO public.crm_proposals (id, deal_id, status, notes, terms, total_value, created_by)
VALUES (prop_4, dl_13, 'accepted', 'Proposta aceita! Início da implantação em 2 semanas.', 'Contrato de 12 meses. Pagamento mensal. Inclui suporte 8x5.', 85000, v_user_id);

INSERT INTO public.crm_proposal_items (proposal_id, name, description, quantity, unit_price, discount_percent, subtotal) VALUES
  (prop_4, 'Implantação Completa',        'Setup, migração, configuração e go-live',               1, 35000, 0,  35000),
  (prop_4, 'Licença Anual Full',          'Todos os módulos Fyness por 12 meses',                  1, 38000, 5,  36100),
  (prop_4, 'Treinamento Online',          '20h de treinamento remoto + material',                  1,  8000, 0,   8000),
  (prop_4, 'Suporte Premium 12m',         'Suporte prioritário 8x5 com SLA de 4h',                1,  6000, 5,   5700),
  (prop_4, 'Consultoria de Processos',    '8h de consultoria para mapeamento BPMN',                1,  2400, 0,   2400);

-- Proposta 5: Roteirização LogiMax (deal dl_15)
INSERT INTO public.crm_proposals (id, deal_id, status, notes, terms, total_value, created_by)
VALUES (prop_5, dl_15, 'sent', 'Proposta técnica detalhada com cronograma de 3 meses.', 'Pagamento em 4 parcelas. Inclui período de homologação de 30 dias.', 95000, v_user_id);

INSERT INTO public.crm_proposal_items (proposal_id, name, description, quantity, unit_price, discount_percent, subtotal) VALUES
  (prop_5, 'Módulo de Roteirização',      'Algoritmo de otimização de rotas com IA',               1, 45000, 0,  45000),
  (prop_5, 'Rastreamento em Tempo Real',  'GPS tracking com painel de monitoramento',              1, 25000, 0,  25000),
  (prop_5, 'App do Motorista',            'Aplicativo mobile para motoristas (Android/iOS)',        1, 18000, 5,  17100),
  (prop_5, 'Implantação + Treinamento',   'Setup, instalação nos veículos e treinamento',          1, 10000, 10,  9000);

-- ============================================================
-- 7. SETTINGS (configuração padrão)
-- ============================================================
INSERT INTO public.crm_settings (user_id, company_name, company_phone, company_email, company_address, company_city, company_state, accent_color)
VALUES (v_user_id, 'Fyness Tecnologia', '(11) 91234-5678', 'contato@fyness.com.br', 'Av. Paulista, 1000 - Sala 501', 'São Paulo', 'SP', '#6366f1');

END $$;

-- ============================================================
-- FIM - Seed data inserido com sucesso
-- Total: 5 empresas, 25 contatos, 1 pipeline, 6 stages,
--        20 deals, 40 atividades, 5 propostas (~19 itens),
--        1 configuração
-- ============================================================

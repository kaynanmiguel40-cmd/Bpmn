-- ============================================================
-- Projeto demo: Lancamento App Mobile
-- Hierarquia completa, dependencias, marcos, caminho critico
-- ============================================================

DO $$
DECLARE
  v_proj TEXT;
  -- IDs das tarefas (pre-gerados para referenciar em predecessors)
  t1   TEXT := 'demo_plan';
  t1_1 TEXT := 'demo_plan_escopo';
  t1_2 TEXT := 'demo_plan_pesquisa';
  t1_3 TEXT := 'demo_plan_briefing';

  t2   TEXT := 'demo_design';
  t2_1 TEXT := 'demo_design_wire';
  t2_2 TEXT := 'demo_design_ui';
  t2_3 TEXT := 'demo_design_proto';
  t2_4 TEXT := 'demo_design_ok';

  t3   TEXT := 'demo_dev';
  t3_1 TEXT := 'demo_dev_setup';
  t3_2 TEXT := 'demo_dev_front';
  t3_2a TEXT := 'demo_dev_telas';
  t3_2b TEXT := 'demo_dev_apiint';
  t3_3 TEXT := 'demo_dev_back';
  t3_3a TEXT := 'demo_dev_api';
  t3_3b TEXT := 'demo_dev_db';
  t3_3c TEXT := 'demo_dev_auth';
  t3_4 TEXT := 'demo_dev_intok';

  t4   TEXT := 'demo_test';
  t4_1 TEXT := 'demo_test_unit';
  t4_2 TEXT := 'demo_test_integ';
  t4_3 TEXT := 'demo_test_ux';
  t4_4 TEXT := 'demo_test_ok';

  t5   TEXT := 'demo_launch';
  t5_1 TEXT := 'demo_launch_mkt';
  t5_2 TEXT := 'demo_launch_store';
  t5_3 TEXT := 'demo_launch_deploy';
  t5_4 TEXT := 'demo_launch_go';
BEGIN
  SELECT id INTO v_proj FROM public.eap_projects LIMIT 1;
  IF v_proj IS NULL THEN
    RAISE NOTICE 'Nenhum projeto EAP. Crie primeiro.';
    RETURN;
  END IF;

  -- Limpar demo anterior (se rodar mais de uma vez)
  DELETE FROM public.eap_tasks WHERE id LIKE 'demo_%';

  -- ==================== 1. PLANEJAMENTO ====================
  INSERT INTO eap_tasks (id,project_id,name,wbs_number,parent_id,sort_order,level,is_milestone,start_date,end_date,duration_days,estimated_hours,progress,assigned_to,predecessors,notes,color,attachments)
  VALUES
  (t1, v_proj, 'Planejamento', '1', NULL, 1, 0, false, NULL, NULL, 1, 0, 0, '', '[]', '', '#6366f1', '[]'),

  (t1_1, v_proj, 'Definir escopo e requisitos', '1.1', t1, 1, 1, false,
   '2026-02-23','2026-02-27', 5, 40, 100, 'Ana Silva',
   '[]', 'Levantar requisitos funcionais e nao-funcionais', '', '[]'),

  (t1_2, v_proj, 'Pesquisa de mercado', '1.2', t1, 2, 1, false,
   '2026-02-23','2026-02-25', 3, 24, 100, 'Carlos Lima',
   '[]', 'Analise de concorrentes e publico-alvo', '', '[]'),

  (t1_3, v_proj, 'Aprovar briefing', '1.3', t1, 3, 1, true,
   '2026-03-02','2026-03-02', 1, 2, 100, 'Gerente',
   format('[{"taskId":"%s","type":"FS","lag":0},{"taskId":"%s","type":"FS","lag":0}]', t1_1, t1_2)::jsonb,
   'Marco: briefing aprovado pela diretoria', '#f59e0b', '[]'),

  -- ==================== 2. DESIGN ====================
  (t2, v_proj, 'Design', '2', NULL, 2, 0, false, NULL, NULL, 1, 0, 0, '', '[]', '', '#ec4899', '[]'),

  (t2_1, v_proj, 'Wireframes', '2.1', t2, 1, 1, false,
   '2026-03-03','2026-03-06', 4, 32, 80, 'Julia Rocha',
   format('[{"taskId":"%s","type":"FS","lag":0}]', t1_3)::jsonb,
   'Wireframes de baixa fidelidade no Figma', '', '[]'),

  (t2_2, v_proj, 'UI Design completo', '2.2', t2, 2, 1, false,
   '2026-03-09','2026-03-16', 6, 48, 40, 'Julia Rocha',
   format('[{"taskId":"%s","type":"FS","lag":0}]', t2_1)::jsonb,
   'Design de alta fidelidade + design system', '', '[]'),

  (t2_3, v_proj, 'Prototipo interativo', '2.3', t2, 3, 1, false,
   '2026-03-17','2026-03-19', 3, 24, 0, 'Julia Rocha',
   format('[{"taskId":"%s","type":"FS","lag":0}]', t2_2)::jsonb,
   'Prototipo navegavel para testes com usuarios', '', '[]'),

  (t2_4, v_proj, 'Aprovacao do design', '2.4', t2, 4, 1, true,
   '2026-03-20','2026-03-20', 1, 2, 0, 'Gerente',
   format('[{"taskId":"%s","type":"FS","lag":0}]', t2_3)::jsonb,
   'Marco: design aprovado', '#f59e0b', '[]'),

  -- ==================== 3. DESENVOLVIMENTO ====================
  (t3, v_proj, 'Desenvolvimento', '3', NULL, 3, 0, false, NULL, NULL, 1, 0, 0, '', '[]', '', '#10b981', '[]'),

  (t3_1, v_proj, 'Setup do ambiente', '3.1', t3, 1, 1, false,
   '2026-03-23','2026-03-24', 2, 16, 0, 'Pedro Santos',
   format('[{"taskId":"%s","type":"FS","lag":0}]', t2_4)::jsonb,
   'Configurar repositorio, CI/CD, ambientes', '', '[]'),

  -- 3.2 Frontend (sub-grupo)
  (t3_2, v_proj, 'Frontend', '3.2', t3, 2, 1, false, NULL, NULL, 1, 0, 0, '', '[]', '', '', '[]'),

  (t3_2a, v_proj, 'Telas principais', '3.2.1', t3_2, 1, 2, false,
   '2026-03-25','2026-04-03', 8, 64, 0, 'Pedro Santos',
   format('[{"taskId":"%s","type":"FS","lag":0}]', t3_1)::jsonb,
   'Home, Login, Perfil, Dashboard', '', '[]'),

  (t3_2b, v_proj, 'Integracao com API', '3.2.2', t3_2, 2, 2, false,
   '2026-04-06','2026-04-10', 5, 40, 0, 'Pedro Santos',
   format('[{"taskId":"%s","type":"FS","lag":0}]', t3_2a)::jsonb,
   'Conectar frontend com endpoints do backend', '', '[]'),

  -- 3.3 Backend (sub-grupo)
  (t3_3, v_proj, 'Backend', '3.3', t3, 3, 1, false, NULL, NULL, 1, 0, 0, '', '[]', '', '', '[]'),

  (t3_3a, v_proj, 'API REST', '3.3.1', t3_3, 1, 2, false,
   '2026-03-25','2026-04-01', 6, 48, 0, 'Marina Costa',
   format('[{"taskId":"%s","type":"FS","lag":0}]', t3_1)::jsonb,
   'CRUD de usuarios, produtos, pedidos', '', '[]'),

  (t3_3b, v_proj, 'Modelagem banco de dados', '3.3.2', t3_3, 2, 2, false,
   '2026-03-25','2026-03-27', 3, 24, 0, 'Marina Costa',
   format('[{"taskId":"%s","type":"FS","lag":0}]', t3_1)::jsonb,
   'Schema, migrations, seeds', '', '[]'),

  (t3_3c, v_proj, 'Sistema de autenticacao', '3.3.3', t3_3, 3, 2, false,
   '2026-04-02','2026-04-07', 4, 32, 0, 'Marina Costa',
   format('[{"taskId":"%s","type":"FS","lag":0},{"taskId":"%s","type":"FS","lag":0}]', t3_3a, t3_3b)::jsonb,
   'JWT, refresh tokens, OAuth', '', '[]'),

  (t3_4, v_proj, 'Integracao completa', '3.4', t3, 4, 1, true,
   '2026-04-13','2026-04-13', 1, 2, 0, 'Gerente',
   format('[{"taskId":"%s","type":"FS","lag":0},{"taskId":"%s","type":"FS","lag":0}]', t3_2b, t3_3c)::jsonb,
   'Marco: frontend + backend integrados', '#f59e0b', '[]'),

  -- ==================== 4. TESTES ====================
  (t4, v_proj, 'Testes e QA', '4', NULL, 4, 0, false, NULL, NULL, 1, 0, 0, '', '[]', '', '#f97316', '[]'),

  (t4_1, v_proj, 'Testes unitarios', '4.1', t4, 1, 1, false,
   '2026-04-14','2026-04-17', 4, 32, 0, 'Lucas Mendes',
   format('[{"taskId":"%s","type":"FS","lag":0}]', t3_4)::jsonb,
   'Cobertura minima de 80%', '', '[]'),

  (t4_2, v_proj, 'Testes de integracao', '4.2', t4, 2, 1, false,
   '2026-04-20','2026-04-22', 3, 24, 0, 'Lucas Mendes',
   format('[{"taskId":"%s","type":"FS","lag":0}]', t4_1)::jsonb,
   'Testes end-to-end dos fluxos principais', '', '[]'),

  (t4_3, v_proj, 'Testes de usabilidade', '4.3', t4, 3, 1, false,
   '2026-04-23','2026-04-27', 3, 24, 0, 'Julia Rocha',
   format('[{"taskId":"%s","type":"FS","lag":0}]', t4_2)::jsonb,
   'Sessoes com 5 usuarios reais', '', '[]'),

  (t4_4, v_proj, 'QA aprovado', '4.4', t4, 4, 1, true,
   '2026-04-28','2026-04-28', 1, 2, 0, 'Gerente',
   format('[{"taskId":"%s","type":"FS","lag":0}]', t4_3)::jsonb,
   'Marco: qualidade aprovada para lancamento', '#f59e0b', '[]'),

  -- ==================== 5. LANCAMENTO ====================
  (t5, v_proj, 'Lancamento', '5', NULL, 5, 0, false, NULL, NULL, 1, 0, 0, '', '[]', '', '#8b5cf6', '[]'),

  (t5_1, v_proj, 'Campanha de marketing', '5.1', t5, 1, 1, false,
   '2026-03-23','2026-03-27', 5, 40, 0, 'Carlos Lima',
   format('[{"taskId":"%s","type":"FS","lag":0}]', t2_4)::jsonb,
   'Redes sociais, email marketing, landing page', '', '[]'),

  (t5_2, v_proj, 'Preparar app stores', '5.2', t5, 2, 1, false,
   '2026-04-29','2026-04-30', 2, 16, 0, 'Pedro Santos',
   format('[{"taskId":"%s","type":"FS","lag":0}]', t4_4)::jsonb,
   'Screenshots, descricao, metadata App Store e Play Store', '', '[]'),

  (t5_3, v_proj, 'Deploy em producao', '5.3', t5, 3, 1, false,
   '2026-05-04','2026-05-04', 1, 8, 0, 'Pedro Santos',
   format('[{"taskId":"%s","type":"FS","lag":0}]', t5_2)::jsonb,
   'Deploy final do backend + submissao nas stores', '', '[]'),

  (t5_4, v_proj, 'Lancamento oficial', '5.4', t5, 4, 1, true,
   '2026-05-05','2026-05-05', 1, 2, 0, 'Gerente',
   format('[{"taskId":"%s","type":"FS","lag":0},{"taskId":"%s","type":"FS","lag":0}]', t5_1, t5_3)::jsonb,
   'Marco: app ao vivo!', '#f59e0b', '[]');

  RAISE NOTICE 'Projeto demo criado com sucesso! Recarregue a EAP.';
END $$;

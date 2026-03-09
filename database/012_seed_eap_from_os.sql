-- ============================================================
-- Script: Conectar OS Projects e OS Orders existentes à EAP
-- Cria tarefas EAP a partir dos dados já existentes
-- ============================================================

DO $$
DECLARE
  v_eap_project_id TEXT;
  v_os_project RECORD;
  v_os_order RECORD;
  v_parent_task_id TEXT;
  v_task_id TEXT;
  v_project_sort INTEGER := 0;
  v_order_sort INTEGER;
  v_duration INTEGER;
BEGIN
  -- 1) Pegar o projeto EAP (o primeiro / unico)
  SELECT id INTO v_eap_project_id FROM public.eap_projects LIMIT 1;

  IF v_eap_project_id IS NULL THEN
    RAISE NOTICE 'Nenhum projeto EAP encontrado. Crie um projeto EAP primeiro.';
    RETURN;
  END IF;

  RAISE NOTICE 'Projeto EAP: %', v_eap_project_id;

  -- 2) Para cada OS Project → tarefa nivel 0 (raiz)
  FOR v_os_project IN
    SELECT * FROM public.os_projects ORDER BY created_at
  LOOP
    -- Verificar se ja existe tarefa para esse projeto OS
    -- (evitar duplicatas se rodar o script mais de uma vez)
    IF EXISTS (
      SELECT 1 FROM public.eap_tasks
      WHERE project_id = v_eap_project_id
        AND name = v_os_project.name
        AND level = 0
        AND parent_id IS NULL
    ) THEN
      -- Ja existe, pegar o id
      SELECT id INTO v_parent_task_id FROM public.eap_tasks
      WHERE project_id = v_eap_project_id
        AND name = v_os_project.name
        AND level = 0
        AND parent_id IS NULL
      LIMIT 1;

      RAISE NOTICE 'Projeto OS "%" ja existe na EAP, pulando criacao.', v_os_project.name;
    ELSE
      v_parent_task_id := gen_random_uuid()::TEXT;
      v_project_sort := v_project_sort + 1;

      INSERT INTO public.eap_tasks (
        id, project_id, name, wbs_number, parent_id, sort_order,
        level, is_milestone, start_date, end_date, duration_days,
        progress, assigned_to, predecessors, notes, color, attachments
      ) VALUES (
        v_parent_task_id,
        v_eap_project_id,
        v_os_project.name,
        v_project_sort::TEXT,
        NULL,
        v_project_sort,
        0,
        FALSE,
        NULL,
        NULL,
        1,
        0,
        '',
        '[]'::JSONB,
        COALESCE(v_os_project.description, ''),
        COALESCE(v_os_project.color, '#3b82f6'),
        '[]'::JSONB
      );

      RAISE NOTICE 'Criada tarefa raiz para projeto OS: %', v_os_project.name;
    END IF;

    -- 3) Para cada OS Order desse projeto → tarefa nivel 1
    v_order_sort := 0;
    FOR v_os_order IN
      SELECT * FROM public.os_orders
      WHERE project_id = v_os_project.id
      ORDER BY sort_order, number, created_at
    LOOP
      -- Verificar se ja existe tarefa linkada a essa OS
      IF EXISTS (
        SELECT 1 FROM public.eap_tasks WHERE os_order_id = v_os_order.id
      ) THEN
        RAISE NOTICE '  OS #% "%" ja linkada, pulando.', v_os_order.number, v_os_order.title;
        CONTINUE;
      END IF;

      v_task_id := gen_random_uuid()::TEXT;
      v_order_sort := v_order_sort + 1;

      -- Calcular duracao em dias (se tiver datas)
      v_duration := 1;
      IF v_os_order.estimated_start IS NOT NULL
         AND v_os_order.estimated_start != ''
         AND v_os_order.estimated_end IS NOT NULL
         AND v_os_order.estimated_end != ''
      THEN
        BEGIN
          v_duration := GREATEST(1,
            (v_os_order.estimated_end::DATE - v_os_order.estimated_start::DATE) + 1
          );
        EXCEPTION WHEN OTHERS THEN
          v_duration := 1;
        END;
      END IF;

      INSERT INTO public.eap_tasks (
        id, project_id, name, wbs_number, parent_id, sort_order,
        level, is_milestone, start_date, end_date, duration_days,
        progress, assigned_to, predecessors, notes, color,
        os_order_id, attachments
      ) VALUES (
        v_task_id,
        v_eap_project_id,
        v_os_order.title,
        v_project_sort::TEXT || '.' || v_order_sort::TEXT,
        v_parent_task_id,
        v_order_sort,
        1,
        FALSE,
        CASE
          WHEN v_os_order.estimated_start IS NOT NULL AND v_os_order.estimated_start != ''
          THEN v_os_order.estimated_start::DATE
          ELSE NULL
        END,
        CASE
          WHEN v_os_order.estimated_end IS NOT NULL AND v_os_order.estimated_end != ''
          THEN v_os_order.estimated_end::DATE
          ELSE NULL
        END,
        v_duration,
        CASE v_os_order.status
          WHEN 'done' THEN 100
          WHEN 'in_progress' THEN 50
          ELSE 0
        END,
        COALESCE(v_os_order.assigned_to, ''),
        '[]'::JSONB,
        COALESCE(v_os_order.description, ''),
        '',
        v_os_order.id,
        COALESCE(v_os_order.attachments, '[]'::JSONB)
      );

      RAISE NOTICE '  Criada tarefa para OS #%: %', v_os_order.number, v_os_order.title;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Concluido! Recarregue a pagina da EAP para ver os dados.';
END $$;

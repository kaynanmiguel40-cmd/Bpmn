-- ============================================================
-- FYNESS OS - CONSTRAINTS E TRIGGERS DE AUDITORIA
-- Execute este script no SQL Editor do Supabase
-- Adiciona CHECK constraints em JSONB e triggers de auditoria
-- ============================================================

-- ============================================================
-- 1. CHECK CONSTRAINTS - JSONB deve ser array
-- ============================================================

-- os_orders: checklist, expenses, attachments devem ser arrays
DO $$ BEGIN
  ALTER TABLE public.os_orders
    ADD CONSTRAINT chk_checklist_array
    CHECK (jsonb_typeof(checklist) = 'array');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.os_orders
    ADD CONSTRAINT chk_expenses_array
    CHECK (jsonb_typeof(expenses) = 'array');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.os_orders
    ADD CONSTRAINT chk_attachments_array
    CHECK (jsonb_typeof(attachments) = 'array');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- agenda_events: attendees deve ser array
DO $$ BEGIN
  ALTER TABLE public.agenda_events
    ADD CONSTRAINT chk_attendees_array
    CHECK (jsonb_typeof(attendees) = 'array');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- agenda_events: recurrence_exceptions deve ser array
DO $$ BEGIN
  ALTER TABLE public.agenda_events
    ADD CONSTRAINT chk_recurrence_exceptions_array
    CHECK (jsonb_typeof(recurrence_exceptions) = 'array');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- report_schedules: recipients deve ser array
DO $$ BEGIN
  ALTER TABLE public.report_schedules
    ADD CONSTRAINT chk_recipients_array
    CHECK (jsonb_typeof(recipients) = 'array');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 2. CHECK CONSTRAINTS - Enums
-- ============================================================

DO $$ BEGIN
  ALTER TABLE public.os_orders
    ADD CONSTRAINT chk_os_priority
    CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.os_orders
    ADD CONSTRAINT chk_os_status
    CHECK (status IN ('available', 'in_progress', 'done', 'blocked'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.os_orders
    ADD CONSTRAINT chk_os_type
    CHECK (type IN ('normal', 'emergency'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 3. FUNCAO DE AUDITORIA AUTOMATICA
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_text TEXT;
  entity_title TEXT;
  log_id TEXT;
BEGIN
  log_id := 'log_' || extract(epoch from now())::bigint || '_' || floor(random() * 1000)::int;

  IF TG_OP = 'UPDATE' THEN
    action_text := 'updated';
    -- Tentar extrair titulo da entidade
    entity_title := COALESCE(NEW.title, NEW.name, NEW.label, '');

    INSERT INTO public.activity_logs (id, user_name, action, entity_type, entity_id, entity_title, old_values, new_values, created_at)
    VALUES (
      log_id,
      'Sistema (trigger)',
      action_text,
      TG_TABLE_NAME,
      NEW.id,
      entity_title,
      to_jsonb(OLD),
      to_jsonb(NEW),
      NOW()
    );
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    action_text := 'deleted';
    entity_title := COALESCE(OLD.title, OLD.name, OLD.label, '');

    INSERT INTO public.activity_logs (id, user_name, action, entity_type, entity_id, entity_title, old_values, new_values, created_at)
    VALUES (
      log_id,
      'Sistema (trigger)',
      action_text,
      TG_TABLE_NAME,
      OLD.id,
      entity_title,
      to_jsonb(OLD),
      NULL,
      NOW()
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 4. TRIGGERS DE AUDITORIA
-- ============================================================

-- os_orders
DROP TRIGGER IF EXISTS audit_os_orders ON public.os_orders;
CREATE TRIGGER audit_os_orders
  AFTER UPDATE OR DELETE ON public.os_orders
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- team_members
DROP TRIGGER IF EXISTS audit_team_members ON public.team_members;
CREATE TRIGGER audit_team_members
  AFTER UPDATE OR DELETE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- agenda_events
DROP TRIGGER IF EXISTS audit_agenda_events ON public.agenda_events;
CREATE TRIGGER audit_agenda_events
  AFTER UPDATE OR DELETE ON public.agenda_events
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- os_projects
DROP TRIGGER IF EXISTS audit_os_projects ON public.os_projects;
CREATE TRIGGER audit_os_projects
  AFTER UPDATE OR DELETE ON public.os_projects
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- companies
DROP TRIGGER IF EXISTS audit_companies ON public.companies;
CREATE TRIGGER audit_companies
  AFTER UPDATE OR DELETE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- ============================================================
-- 5. INDICES ADICIONAIS PARA PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_os_orders_assignee ON public.os_orders(assignee);
CREATE INDEX IF NOT EXISTS idx_os_orders_assigned_to ON public.os_orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_os_orders_priority ON public.os_orders(priority);
CREATE INDEX IF NOT EXISTS idx_os_orders_created_at ON public.os_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_auth ON public.team_members(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_agenda_events_type ON public.agenda_events(type);
CREATE INDEX IF NOT EXISTS idx_agenda_events_assignee ON public.agenda_events(assignee);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at);

-- ============================================================
-- FIM
-- ============================================================

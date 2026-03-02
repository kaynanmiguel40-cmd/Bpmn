-- ============================================================
-- 007: FIX log_changes() — usar to_jsonb para campos seguros
-- ============================================================
-- Problema: COALESCE(NEW.title, NEW.name, NEW.label, '') falha
-- quando a tabela não tem todos esses campos (ex: crm_deals não tem "name").
-- Solução: converter para JSONB e acessar via ->> que retorna NULL
-- em vez de erro quando o campo não existe.
-- ============================================================

CREATE OR REPLACE FUNCTION public.log_changes()
RETURNS TRIGGER AS $$
DECLARE
  action_text TEXT;
  entity_title TEXT;
  log_id TEXT;
  rec_jsonb JSONB;
BEGIN
  log_id := 'log_' || extract(epoch from now())::bigint || '_' || floor(random() * 1000)::int;

  IF TG_OP = 'UPDATE' THEN
    action_text := 'updated';
    rec_jsonb := to_jsonb(NEW);
    entity_title := COALESCE(rec_jsonb->>'title', rec_jsonb->>'name', rec_jsonb->>'label', '');

    INSERT INTO public.activity_logs (id, user_name, action, entity_type, entity_id, entity_title, old_values, new_values, created_at)
    VALUES (
      log_id,
      'Sistema (trigger)',
      action_text,
      TG_TABLE_NAME,
      NEW.id,
      entity_title,
      to_jsonb(OLD),
      rec_jsonb,
      NOW()
    );
    RETURN NEW;

  ELSIF TG_OP = 'DELETE' THEN
    action_text := 'deleted';
    rec_jsonb := to_jsonb(OLD);
    entity_title := COALESCE(rec_jsonb->>'title', rec_jsonb->>'name', rec_jsonb->>'label', '');

    INSERT INTO public.activity_logs (id, user_name, action, entity_type, entity_id, entity_title, old_values, new_values, created_at)
    VALUES (
      log_id,
      'Sistema (trigger)',
      action_text,
      TG_TABLE_NAME,
      OLD.id,
      entity_title,
      rec_jsonb,
      NULL,
      NOW()
    );
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

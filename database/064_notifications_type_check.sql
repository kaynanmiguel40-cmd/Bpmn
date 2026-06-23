-- ============================================================
-- 064_notifications_type_check.sql
--
-- A constraint notifications_type_check listava tipos FIXOS e ficava pra tras
-- toda vez que o app adicionava um tipo de notificacao novo (task_review,
-- os_assigned, os_created, os_updated, os_completed, comment_added,
-- event_reminder, deadline_warning, ...). O insert entao era REJEITADO e caia
-- no fallback offline:
--   "Salvo localmente: new row for relation \"notifications\" violates check
--    constraint \"notifications_type_check\""
--
-- O `type` e controlado 100% pela aplicacao (notificationTriggers / notify), so
-- alimenta icone/cor no sino. Nao vale travar com um enum rigido no banco que
-- vive desatualizado. Soltamos o CHECK — para de quebrar a cada tipo novo.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

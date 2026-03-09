-- 020: Atualizar constraint de tipo das notificacoes
-- Incluir todos os tipos usados pelo sistema

ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN (
    'info',
    'warning',
    'success',
    'error',
    'os_assigned',
    'os_completed',
    'comment_added',
    'event_reminder',
    'deadline_warning'
  ));

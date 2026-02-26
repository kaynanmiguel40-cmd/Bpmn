-- 025: Adicionar tipos os_updated e os_created nas notificacoes

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
    'os_updated',
    'os_created',
    'comment_added',
    'event_reminder',
    'deadline_warning'
  ));

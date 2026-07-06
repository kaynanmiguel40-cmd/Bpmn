-- ============================================================
-- 066_crm_member_access.sql
--
-- Permissao de acesso por MEMBRO a secoes do CRM.
--
-- `crm_blocked_sections` = lista (JSONB) das secoes que o membro NAO pode ver.
--   - NULL ou []  -> vê TUDO (padrao; nao quebra ninguem que ja usa).
--   - ['comparativo','automations'] -> tudo MENOS essas secoes.
--
-- Admins (dono por e-mail OU cargo gestor/admin) ignoram esta lista e veem tudo.
-- O admin edita a lista de cada membro em Configuracoes do CRM > Equipe.
--
-- Semantica de BLOQUEIO (e nao de liberacao) de proposito: secao nova que a
-- gente criar no futuro aparece por padrao pra todo mundo, ate o admin bloquear.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.team_members
  ADD COLUMN IF NOT EXISTS crm_blocked_sections JSONB;

COMMENT ON COLUMN public.team_members.crm_blocked_sections IS
  'Secoes do CRM que este membro NAO pode acessar (lista de keys). NULL/[] = vê tudo. Admins ignoram.';

-- Recarrega o cache de schema do PostgREST (pega a coluna nova na hora).
NOTIFY pgrst, 'reload schema';

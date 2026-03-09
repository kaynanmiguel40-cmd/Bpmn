-- ============================================================
-- FYNESS OS - CAMPOS DE AUTENTICACAO PARA EQUIPE
-- Execute este script no SQL Editor do Supabase
-- Adiciona email e vinculo com auth.users nos membros da equipe
-- ============================================================

-- Email do membro (usado para login)
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS email TEXT;

-- ID do usuario no Supabase Auth
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- Indices para performance
CREATE INDEX IF NOT EXISTS idx_team_members_email ON public.team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_auth ON public.team_members(auth_user_id);

-- ============================================================
-- FIM
-- ============================================================

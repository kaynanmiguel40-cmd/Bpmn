-- ============================================================
-- FYNESS OS - FIX: Permissao para managers atualizarem roles
-- Migration 009
--
-- PROBLEMA: Quando um manager cria ou edita um membro da equipe,
-- o UPDATE no profiles.role falhava silenciosamente porque a RLS
-- so permitia que 'admin' atualizasse perfis de outros usuarios.
-- Resultado: usuarios criados ficavam com role 'collaborator'
-- mesmo quando marcados como Gestor.
--
-- SOLUCAO: Funcao RPC SECURITY DEFINER que permite managers
-- atualizarem o role de outros usuarios de forma segura.
-- ============================================================

-- ============================================================
-- 1. FUNCAO RPC: set_user_role
-- Permite que admin/manager defina o role de outro usuario.
-- Roda como SECURITY DEFINER (ignora RLS, mas valida internamente).
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_user_role(
  target_user_id UUID,
  new_role TEXT
)
RETURNS VOID AS $$
BEGIN
  -- Validar que o role e valido
  IF new_role NOT IN ('admin', 'manager', 'collaborator', 'viewer') THEN
    RAISE EXCEPTION 'Role invalido: %', new_role;
  END IF;

  -- Verificar se o usuario atual e admin ou manager
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND LOWER(TRIM(role)) IN ('admin', 'manager')
  ) THEN
    RAISE EXCEPTION 'Sem permissao para alterar roles';
  END IF;

  -- Apenas admin pode promover alguem a admin
  IF new_role = 'admin' AND NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND LOWER(TRIM(role)) = 'admin'
  ) THEN
    RAISE EXCEPTION 'Apenas admin pode promover a admin';
  END IF;

  -- Atualizar o role do usuario alvo
  UPDATE public.profiles
  SET role = new_role, updated_at = NOW()
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Usuario nao encontrado: %', target_user_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 2. FIX RLS: Permitir managers atualizarem profiles
-- (Backup/fallback caso RPC nao seja usado)
-- ============================================================
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;

CREATE POLICY "profiles_update_admin_or_manager" ON public.profiles
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
      AND LOWER(TRIM(role)) IN ('admin', 'manager')
    )
  );

-- ============================================================
-- 3. FIX: Atualizar is_manager_or_admin para incluir 'manager'
-- (Ja inclui, mas garantir consistencia)
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_manager_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND LOWER(TRIM(role)) IN (
      'admin', 'manager', 'gestor', 'gerente',
      'diretor', 'supervisor', 'coordenador'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================================
-- FIM - Migration 009
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================================

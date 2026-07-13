-- ============================================================
-- 070_crm_lead_sources.sql
--
-- Origens de lead (canal de aquisicao) cadastraveis pela equipe, no lugar
-- da lista fixa hardcoded no formulario de negocio. crm_deals.source
-- continua texto livre (sem FK) — essa tabela so alimenta as opcoes do
-- dropdown + a tela de gestao em Configuracoes.
--
-- Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.crm_lead_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  position INT NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.crm_lead_sources IS
  'Origens de lead cadastraveis (canal de aquisicao). crm_deals.source continua texto livre (sem FK) — essa tabela so alimenta as opcoes do formulario.';

ALTER TABLE public.crm_lead_sources ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_lead_sources_all" ON public.crm_lead_sources;
CREATE POLICY "crm_lead_sources_all" ON public.crm_lead_sources FOR ALL USING (true);

-- Seed com as opcoes que ja existiam hardcoded no formulario.
INSERT INTO public.crm_lead_sources (name, position)
SELECT nome, pos FROM (VALUES
  ('Prospeccao ativa', 0),
  ('Indicacao de contador', 1),
  ('Trafego pago', 2),
  ('Indicacao / WhatsApp', 3),
  ('Indicacao de parceiro', 4)
) AS v(nome, pos)
WHERE NOT EXISTS (SELECT 1 FROM public.crm_lead_sources s WHERE s.name = v.nome);

-- ============================================================
-- 069_crm_partners.sql
--
-- Cadastro de PARCEIROS INDICADORES (pessoas físicas que indicam leads,
-- ex.: Edson, João, Robert — hoje só existiam como texto livre dentro de
-- crm_deals.source, tipo "Indicação de parceiro (Edson)"). Diferente da
-- pipeline "Parceiros" (que é prospecção de EMPRESAS pra virarem parceiros
-- institucionais) — isso aqui é o registro da PESSOA que indica.
--
-- Sem FK em crm_deals de propósito: a contagem de leads por parceiro é
-- feita casando o nome com o texto de crm_deals.source (ILIKE), pra não
-- precisar de uma migração de dados nos ~500 deals existentes.
--
-- Idempotente.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.crm_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

COMMENT ON TABLE public.crm_partners IS
  'Pessoas físicas que indicam leads pro Fyness (ex.: Edson, João, Robert). Contagem de leads é calculada casando o nome com crm_deals.source (não tem FK).';

ALTER TABLE public.crm_partners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_partners_all" ON public.crm_partners;
CREATE POLICY "crm_partners_all" ON public.crm_partners FOR ALL USING (true);

-- Seed dos parceiros já identificados no texto de crm_deals.source.
INSERT INTO public.crm_partners (name)
SELECT nome FROM (VALUES ('Edson'), ('Robert'), ('Claudio'), ('João'), ('Dudu'), ('Vinicius'), ('Lilian'), ('Luan')) AS v(nome)
WHERE NOT EXISTS (SELECT 1 FROM public.crm_partners p WHERE p.name = v.nome);

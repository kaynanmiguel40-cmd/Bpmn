-- ============================================================
-- 062_crm_deal_source.sql
--
-- Adiciona `source` (origem do lead) em crm_deals.
--
-- Contexto: substitui o uso de "uma pipeline por canal" (Outbound Manual,
-- Parceiros, Leads de Parceiros) por UMA pipeline de Vendas + este campo de
-- origem. Permite cruzar conversao por canal no relatorio comercial sem
-- fragmentar o funil em varias pipelines.
--
-- Texto livre (com sugestoes na UI: Prospeccao ativa, Indicacao de contador,
-- Trafego pago, Indicacao/WhatsApp, Indicacao de parceiro, ...). Fica livre
-- de proposito pra o time escrever a propria origem.
--
-- Idempotente.
-- ============================================================

ALTER TABLE public.crm_deals
  ADD COLUMN IF NOT EXISTS source TEXT;

COMMENT ON COLUMN public.crm_deals.source IS
  'Origem do lead (canal de aquisicao). Texto livre com sugestoes na UI. Base pra analise de conversao por canal no relatorio comercial.';

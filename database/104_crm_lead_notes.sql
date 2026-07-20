-- 104 — crm_lead_notes: o diario do lead vira registro de verdade.
--
-- Antes do sistema ter historico, a consultora registrou tudo no texto livre de
-- crm_deals.notes. 290 dos 299 negocios tem nota; 7 delas sao LOGS DATADOS de
-- ate 3.400 caracteres, com uma entrada por dia:
--
--   "27/05/2026 — Primeiro contato\nFoi enviada uma mensagem..."
--   "No dia 28/05/2026, foi criado o acesso da Construtora Martins..."
--
-- Enquanto isso vive num campo de texto, o historico so existe se alguem ler o
-- paragrafo certo — nao da pra ordenar, nao cai na etapa em que o lead estava,
-- e o campo de notas fica impossivel de usar pro que ele serve.
--
-- Esta tabela guarda cada trecho como um registro datado. O backfill (105) le
-- as notas com o MESMO parser que a tela usava, grava aqui, e deixa em `notes`
-- so o que nao tem data (cabecalho, observacao de estado) — a nota volta a ser
-- uma nota.
--
-- Por que tabela propria e nao crm_activities: uma atividade conta no placar do
-- time, nos relatorios de ligacoes e nas metas. Injetar ~70 "atividades
-- concluidas" historicas inflaria numero que ninguem executou.

CREATE TABLE IF NOT EXISTS public.crm_lead_notes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id     uuid NOT NULL REFERENCES public.crm_deals(id) ON DELETE CASCADE,
  -- Dia a que o trecho se refere. NULL = texto sem data no original: aparece no
  -- inicio da linha do tempo, como "veio antes de tudo que foi registrado".
  note_date   date,
  title       text,
  content     text NOT NULL,
  -- 'migrado' = extraido do campo notes pelo backfill 105.
  -- 'manual'  = escrito na tela depois desta migration.
  origin      text NOT NULL DEFAULT 'manual',
  created_by  uuid,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

-- A linha do tempo sempre busca por lead e ordena por data.
CREATE INDEX IF NOT EXISTS idx_crm_lead_notes_deal
  ON public.crm_lead_notes (deal_id, note_date DESC)
  WHERE deleted_at IS NULL;

-- Backfill idempotente: rodar 105 duas vezes nao duplica os registros.
-- COALESCE porque note_date e nulo no trecho sem data, e NULL nao casa em
-- indice unico — sem isso, o "resto" entraria de novo a cada execucao.
CREATE UNIQUE INDEX IF NOT EXISTS uq_crm_lead_notes_migrado
  ON public.crm_lead_notes (deal_id, COALESCE(note_date, DATE '1900-01-01'), md5(content))
  WHERE origin = 'migrado' AND deleted_at IS NULL;

ALTER TABLE public.crm_lead_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "crm_lead_notes_select" ON public.crm_lead_notes;
CREATE POLICY "crm_lead_notes_select" ON public.crm_lead_notes FOR SELECT USING (true);
DROP POLICY IF EXISTS "crm_lead_notes_insert" ON public.crm_lead_notes;
CREATE POLICY "crm_lead_notes_insert" ON public.crm_lead_notes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "crm_lead_notes_update" ON public.crm_lead_notes;
CREATE POLICY "crm_lead_notes_update" ON public.crm_lead_notes FOR UPDATE USING (true);
DROP POLICY IF EXISTS "crm_lead_notes_delete" ON public.crm_lead_notes;
CREATE POLICY "crm_lead_notes_delete" ON public.crm_lead_notes FOR DELETE USING (true);

-- Guarda o texto original ANTES de o backfill mexer em notes. E a rede: se o
-- parser errar o recorte de algum trecho, da pra reconstruir tudo daqui.
CREATE TABLE IF NOT EXISTS public.crm_deals_notes_backup_104 (
  deal_id    uuid PRIMARY KEY,
  notes      text,
  backed_up_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.crm_deals_notes_backup_104 (deal_id, notes)
SELECT id, notes
FROM public.crm_deals
WHERE deleted_at IS NULL AND notes IS NOT NULL AND btrim(notes) <> ''
ON CONFLICT (deal_id) DO NOTHING;

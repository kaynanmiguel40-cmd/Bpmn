-- 105 — posicao do lead na coluna do Kanban.
--
-- Ate agora a coluna ordenava por `created_at`: a ordem que aparecia na tela
-- era um acidente de quando o lead foi cadastrado, e arrastar um card pra cima
-- nao guardava nada. Nao dava pra dizer "atende o Pablo primeiro" — o gesto
-- existia na cabeca da pessoa e em lugar nenhum no sistema.
--
-- `position` e a PRIORIDADE: menor = mais em cima = atende antes. E diferente
-- de `priority` (as estrelas), que mede QUALIDADE do lead. Os dois juntos
-- decidem quem pega o horario mais cedo na fila — a ordem manda, a estrela
-- desempata entre leads na mesma altura.
--
-- Por que inteiro com passo de 100 e nao 1,2,3: reordenar um card no meio da
-- coluna passa a ser um UPDATE so (posicao = media dos vizinhos), em vez de
-- reescrever a coluna inteira a cada arrasto.

ALTER TABLE public.crm_deals
  ADD COLUMN IF NOT EXISTS position integer;

-- Backfill: congela a ordem que a tela JA mostrava (created_at), pra que
-- ninguem veja os cards pularem de lugar no primeiro deploy.
WITH ordenado AS (
  SELECT id,
         row_number() OVER (PARTITION BY stage_id ORDER BY created_at) * 100 AS pos
  FROM public.crm_deals
  WHERE deleted_at IS NULL AND stage_id IS NOT NULL
)
UPDATE public.crm_deals d
SET position = o.pos
FROM ordenado o
WHERE d.id = o.id AND d.position IS NULL;

-- Lead novo entra no TOPO da coluna: acabou de chegar, e a pergunta "o que faco
-- com ele" esta quente. Enterrar no fim faria o mais recente virar o menos
-- visivel — o oposto do que a fila precisa.
ALTER TABLE public.crm_deals
  ALTER COLUMN position SET DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_crm_deals_stage_position
  ON public.crm_deals (stage_id, position, created_at)
  WHERE deleted_at IS NULL;

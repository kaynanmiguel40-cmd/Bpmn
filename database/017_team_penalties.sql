-- 017: Sistema de punicoes (cartoes amarelos)
-- Cada membro pode receber ate 3 cartoes. Cada row = 1 cartao.

CREATE TABLE IF NOT EXISTS public.team_penalties (
  id text PRIMARY KEY,
  member_id text NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  applied_by_name text NOT NULL,
  applied_by_user_id uuid,
  reason text NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_penalties_member ON public.team_penalties(member_id);

ALTER TABLE public.team_penalties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "penalties_select" ON public.team_penalties
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "penalties_insert" ON public.team_penalties
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "penalties_delete" ON public.team_penalties
  FOR DELETE TO authenticated USING (true);

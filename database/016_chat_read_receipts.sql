-- 016: Read receipts para chat (visualizacao estilo WhatsApp)
-- Armazena quando cada usuario leu por ultimo cada conversa de OS

CREATE TABLE IF NOT EXISTS os_comment_reads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name text NOT NULL DEFAULT '',
  last_read_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(order_id, user_id)
);

-- Index para buscar reads por order_id
CREATE INDEX IF NOT EXISTS idx_comment_reads_order ON os_comment_reads(order_id);

-- RLS
ALTER TABLE os_comment_reads ENABLE ROW LEVEL SECURITY;

-- Todos autenticados podem ler (precisamos saber quem leu as mensagens)
CREATE POLICY "comment_reads_select" ON os_comment_reads
  FOR SELECT TO authenticated USING (true);

-- Cada usuario so pode inserir/atualizar seu proprio read
CREATE POLICY "comment_reads_insert" ON os_comment_reads
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "comment_reads_update" ON os_comment_reads
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- 140: EVENTO RECORRENTE (ex: Almoço todo dia)
--
-- Modelo MATERIALIZADO: criar um evento "que se repete" gera N ocorrencias, uma
-- linha por data, todas com o MESMO recurrence_group_id. Cada ocorrencia e um
-- evento normal (renderiza, conclui, edita, apaga sozinha); o group_id permite
-- apagar/editar a serie inteira depois.
ALTER TABLE crm_activities ADD COLUMN IF NOT EXISTS recurrence_group_id uuid;
CREATE INDEX IF NOT EXISTS idx_crm_activities_recurrence ON crm_activities (recurrence_group_id) WHERE recurrence_group_id IS NOT NULL;

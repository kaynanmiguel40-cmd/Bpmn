\pset pager off
\echo '=== 15. DISPATCHER (ficou cortado) ==='
SELECT count(*) AS pendentes_vencidos, min(dispatch_at) AS mais_antigo
FROM crm_scheduled_automations WHERE status = 'pending' AND dispatch_at < now();

\echo ''
\echo '=== A. "(sem dono)": assigned_to que NÃO casa com nenhum team_member ==='
-- A tarefa tem dono gravado, mas o id não existe em team_members.auth_user_id.
-- É a assinatura da cadência legada, que gravou team_members.id na coluna que
-- espera auth_user_id: some da fila de todo mundo e não conta como órfã.
SELECT a.assigned_to, a.assigned_to_name, count(*) AS tarefas,
       min(a.start_date)::date AS mais_antiga, max(a.start_date)::date AS mais_nova
FROM crm_activities a
LEFT JOIN team_members tm ON tm.auth_user_id = a.assigned_to
WHERE a.deleted_at IS NULL AND a.completed = false AND tm.id IS NULL
GROUP BY 1,2 ORDER BY 3 DESC;

\echo ''
\echo '=== B. DONO DIVIDIDO: quem são os 9 ==='
SELECT d.title AS lead, tmd.name AS dono_do_negocio,
       a.assigned_to_name AS dono_da_tarefa, count(*) AS tarefas
FROM crm_deals d
JOIN crm_activities a ON a.deal_id = d.id
JOIN team_members tmd ON tmd.id = d.owner_id
WHERE d.deleted_at IS NULL AND a.deleted_at IS NULL AND a.completed = false
  AND a.assigned_to IS NOT NULL AND tmd.auth_user_id IS NOT NULL
  AND a.assigned_to <> tmd.auth_user_id
GROUP BY 1,2,3 ORDER BY 4 DESC;

\echo ''
\echo '=== C. LEADS SEM TAREFA: quem são os 9 ==='
SELECT d.title AS lead, s.name AS etapa, tm.name AS dono, d.source,
       d.updated_at::date AS parado_desde
FROM crm_deals d
JOIN crm_pipeline_stages s ON s.id = d.stage_id
LEFT JOIN team_members tm ON tm.id = d.owner_id
WHERE d.deleted_at IS NULL AND d.status = 'open'
  AND coalesce(s.is_win_stage,false) = false
  AND EXISTS (SELECT 1 FROM crm_stage_steps ss WHERE ss.stage_id = d.stage_id AND ss.agendavel)
  AND NOT EXISTS (SELECT 1 FROM crm_activities a WHERE a.deal_id = d.id
                    AND a.stage_step_id IS NOT NULL AND a.deleted_at IS NULL AND a.completed = false)
ORDER BY 5;

\echo ''
\echo '=== D. Onde estão os 40 importados (a equipe já começou a trabalhar?) ==='
SELECT s.name AS etapa, tm.name AS dono, count(*) AS leads,
       sum((SELECT count(*) FROM crm_activities a WHERE a.deal_id=d.id
              AND a.deleted_at IS NULL AND a.completed=false)) AS tarefas
FROM crm_deals d
JOIN crm_pipeline_stages s ON s.id = d.stage_id
JOIN team_members tm ON tm.id = d.owner_id
WHERE d.source = 'Prospecção ativa — Passos/MG'
GROUP BY 1,2 ORDER BY 1,2;

\echo ''
\echo '=== E. LEADS DUPLICADOS (mesmo telefone) ==='
SELECT right(regexp_replace(coalesce(contact_phone,''),'[^0-9]','','g'),8) AS tel,
       string_agg(title || ' [' || status || ']', ' | ') AS leads
FROM crm_deals
WHERE deleted_at IS NULL AND length(regexp_replace(coalesce(contact_phone,''),'[^0-9]','','g')) >= 8
GROUP BY 1 HAVING count(*) > 1;

\echo ''
\echo '=== F. LEAD INALCANÇÁVEL ==='
SELECT d.title, s.name AS etapa, tm.name AS dono
FROM crm_deals d
LEFT JOIN crm_contacts c ON c.id = d.contact_id
LEFT JOIN crm_pipeline_stages s ON s.id = d.stage_id
LEFT JOIN team_members tm ON tm.id = d.owner_id
WHERE d.deleted_at IS NULL AND d.status = 'open'
  AND coalesce(nullif(btrim(d.contact_phone),''), nullif(btrim(c.phone),'')) IS NULL
  AND coalesce(nullif(btrim(d.contact_email),''), nullif(btrim(c.email),'')) IS NULL;

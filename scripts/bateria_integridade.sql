-- BATERIA DE INTEGRIDADE — procura no dado de produção os modos de falha que a
-- tela não denuncia. Só SELECT: não escreve nada.
--
-- A lógica de cada checagem é "o que teria que ser verdade se o sistema estivesse
-- funcionando". Onde não é, ou há bug, ou há dado que ficou pra trás de um bug já
-- corrigido — e os dois precisam de conserto, um no código e outro nos registros.

\pset pager off
\echo '=============== 1. TAREFA ÓRFÃ (some da fila de TODO MUNDO) ==============='
-- ownsTask() casa por assigned_to, depois nome, depois created_by. Sem nenhum dos
-- três a tarefa existe no banco e não aparece pra ninguém.
SELECT count(*) AS orfas
FROM crm_activities
WHERE deleted_at IS NULL AND completed = false
  AND assigned_to IS NULL AND coalesce(assigned_to_name,'') = '' AND created_by IS NULL;

\echo '=============== 2. LEAD ABERTO, COM PLAYBOOK, SEM TAREFA ==============='
-- O furo silencioso: o lead não aparece em lugar nenhum JUSTAMENTE por não ter
-- tarefa. Só conta etapa que tem passo agendável e que não é de ganho.
SELECT s.name AS etapa, count(*) AS leads
FROM crm_deals d
JOIN crm_pipeline_stages s ON s.id = d.stage_id
WHERE d.deleted_at IS NULL AND d.status = 'open'
  AND coalesce(s.is_win_stage,false) = false
  AND EXISTS (SELECT 1 FROM crm_stage_steps ss WHERE ss.stage_id = d.stage_id AND ss.agendavel)
  AND NOT EXISTS (SELECT 1 FROM crm_activities a WHERE a.deal_id = d.id
                    AND a.stage_step_id IS NOT NULL AND a.deleted_at IS NULL AND a.completed = false)
GROUP BY 1 ORDER BY 2 DESC;

\echo '=============== 3. TAREFA NASCIDA MORTA (trigger comendo o lote) ==============='
SELECT count(*) AS nascidas_mortas, count(DISTINCT deal_id) AS leads,
       max(created_at)::date AS mais_recente
FROM crm_activities
WHERE stage_step_id IS NOT NULL AND deleted_at = created_at;

\echo '=============== 4. COLISÃO: 2+ tarefas do mesmo dono no mesmo horário ==============='
SELECT count(*) AS horarios_com_colisao, coalesce(sum(n - 1),0) AS tarefas_sobrando
FROM (
  SELECT assigned_to, start_date, count(*) AS n
  FROM crm_activities
  WHERE deleted_at IS NULL AND completed = false AND assigned_to IS NOT NULL
    AND start_date >= now()
  GROUP BY 1,2 HAVING count(*) > 1
) t;

\echo '=============== 5. TAREFA FORA DO EXPEDIENTE OU NO FIM DE SEMANA ==============='
-- Expediente 8:10–18h, almoço 11–12h (crmScheduling). Fora disso ninguém executa.
SELECT
  count(*) FILTER (WHERE extract(dow FROM l.dt) IN (0,6))                       AS fim_de_semana,
  count(*) FILTER (WHERE l.dt::time <  '08:10' OR l.dt::time >= '18:00')        AS fora_do_horario,
  count(*) FILTER (WHERE l.dt::time >= '11:00' AND l.dt::time <  '12:00')       AS no_almoco
FROM (
  SELECT (start_date AT TIME ZONE 'America/Sao_Paulo') AS dt
  FROM crm_activities
  WHERE deleted_at IS NULL AND completed = false AND start_date >= now()
    AND type NOT IN ('meeting','visit','lunch')   -- hora marcada é combinada, pode ser fora da grade
) l;

\echo '=============== 6. CADÊNCIA VIVA DE LEAD JÁ FECHADO/EXCLUÍDO ==============='
-- Continuar ligando pra quem já comprou (ou já foi descartado) queima cliente.
SELECT d.status, count(*) AS tarefas_pendentes, count(DISTINCT d.id) AS leads
FROM crm_activities a
JOIN crm_deals d ON d.id = a.deal_id
WHERE a.deleted_at IS NULL AND a.completed = false AND a.stage_step_id IS NOT NULL
  AND (d.status <> 'open' OR d.deleted_at IS NOT NULL)
GROUP BY 1 ORDER BY 2 DESC;

\echo '=============== 7. DONO DIVIDIDO (deal de um, tarefa de outro) ==============='
SELECT count(DISTINCT d.id) AS leads_com_dono_dividido
FROM crm_deals d
JOIN crm_activities a ON a.deal_id = d.id
JOIN team_members tm ON tm.id = d.owner_id
WHERE d.deleted_at IS NULL AND a.deleted_at IS NULL AND a.completed = false
  AND a.assigned_to IS NOT NULL AND tm.auth_user_id IS NOT NULL
  AND a.assigned_to <> tm.auth_user_id;

\echo '=============== 8. CADÊNCIA DE ETAPA ONDE O LEAD NÃO ESTÁ MAIS ==============='
-- moveDealToStage cancela a cadência da etapa que ficou pra trás. Sobra = o
-- cancelamento não rodou (era o bug do fire-and-forget).
SELECT count(*) AS tarefas, count(DISTINCT a.deal_id) AS leads
FROM crm_activities a
JOIN crm_stage_steps ss ON ss.id = a.stage_step_id
JOIN crm_deals d ON d.id = a.deal_id
WHERE a.deleted_at IS NULL AND a.completed = false
  AND d.deleted_at IS NULL AND d.status = 'open'
  AND ss.stage_id <> d.stage_id;

\echo '=============== 9. LEAD DUPLICADO (mesmo telefone, 8 últimos dígitos) ==============='
SELECT count(*) AS telefones_duplicados, coalesce(sum(n - 1),0) AS leads_excedentes
FROM (
  SELECT right(regexp_replace(coalesce(contact_phone,''),'[^0-9]','','g'),8) AS tel, count(*) AS n
  FROM crm_deals
  WHERE deleted_at IS NULL AND length(regexp_replace(coalesce(contact_phone,''),'[^0-9]','','g')) >= 8
  GROUP BY 1 HAVING count(*) > 1
) t;

\echo '=============== 10. NEGÓCIO ABERTO SEM DONO ==============='
SELECT count(*) AS sem_dono FROM crm_deals
WHERE deleted_at IS NULL AND status = 'open' AND owner_id IS NULL;

\echo '=============== 11. LEAD ABERTO INALCANÇÁVEL (sem telefone e sem e-mail) ==============='
SELECT count(*) AS inalcancaveis
FROM crm_deals d
LEFT JOIN crm_contacts c ON c.id = d.contact_id
WHERE d.deleted_at IS NULL AND d.status = 'open'
  AND coalesce(nullif(btrim(d.contact_phone),''), nullif(btrim(c.phone),'')) IS NULL
  AND coalesce(nullif(btrim(d.contact_email),''), nullif(btrim(c.email),'')) IS NULL;

\echo '=============== 12. SAÚDE DA FILA POR VENDEDOR ==============='
SELECT coalesce(tm.name,'(sem dono)') AS vendedor,
       count(*) FILTER (WHERE a.start_date <  date_trunc('day', now())) AS atrasadas,
       count(*) FILTER (WHERE a.start_date >= date_trunc('day', now())
                          AND a.start_date <  date_trunc('day', now()) + interval '1 day') AS hoje,
       count(*) FILTER (WHERE a.start_date >= date_trunc('day', now()) + interval '1 day') AS futuras
FROM crm_activities a
LEFT JOIN team_members tm ON tm.auth_user_id = a.assigned_to
WHERE a.deleted_at IS NULL AND a.completed = false
GROUP BY 1 ORDER BY 2 DESC;

\echo '=============== 13. MENSAGEM DO INBOX SEM VÍNCULO ==============='
SELECT count(*) AS sem_contato_nem_prospect
FROM crm_messages WHERE contact_id IS NULL AND prospect_id IS NULL;

\echo '=============== 14. AUTOMAÇÃO ATIVA APONTANDO PRA ETAPA QUE NÃO EXISTE ==============='
SELECT count(*) AS automacoes_quebradas
FROM crm_automations a
WHERE a.active AND a.deleted_at IS NULL AND a.stage_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM crm_pipeline_stages s WHERE s.id = a.stage_id);

\echo '=============== 15. DISPARO AGENDADO VENCIDO E PARADO (cron do dispatcher) ==============='
SELECT count(*) AS pendentes_vencidos, min(dispatch_at) AS mais_antigo
FROM crm_scheduled_automations
WHERE status = 'pending' AND dispatch_at < now();

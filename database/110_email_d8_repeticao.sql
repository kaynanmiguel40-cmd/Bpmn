-- 110 — tira a repeticao que a troca do [segmento] deixou no e-mail do D8.
-- Ficou "Um negocio igual ao seu" / "parecido com o seu negocio" / "Um negocio
-- que atendemos" em quatro linhas. E-mail frio ja e lido na diagonal; palavra
-- repetida assim marca como texto de molde.
UPDATE crm_stage_steps
SET script = replace(script, 'Um negocio que atendemos', 'Um cliente nosso')
WHERE script LIKE '%Um negocio que atendemos%';

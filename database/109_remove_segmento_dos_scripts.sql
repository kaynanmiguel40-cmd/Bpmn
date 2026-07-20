-- 109 — tira [segmento] dos roteiros.
--
-- O marcador preenchia com o ramo cadastrado na empresa e saia torto na fala:
-- "Ja atendo outras Comercio". Os segmentos estao no singular masculino
-- ("Comercio", "Servico") e as frases pedem concordancia que o dado nao tem.
--
-- Consertar exigiria ou reescrever as frases pra caber qualquer genero/numero,
-- ou padronizar o cadastro de ramo em todas as empresas. As duas coisas sao
-- trabalho recorrente pra ganhar quase nada: "o seu negocio" diz a mesma coisa,
-- soa natural em toda frase e nao depende de cadastro nenhum.
--
-- "negocio" sem acento de proposito: e a grafia que o resto dos roteiros usa.

BEGIN;

UPDATE crm_stage_steps
SET script = replace(replace(script, '[mesmo segmento]', 'negocio'), '[segmento]', 'negocio')
WHERE script LIKE '%[segmento]%' OR script LIKE '%[mesmo segmento]%';

UPDATE crm_stage_steps
SET scenarios = replace(replace(scenarios::text, '[mesmo segmento]', 'negocio'), '[segmento]', 'negocio')::jsonb
WHERE scenarios::text LIKE '%[segmento]%' OR scenarios::text LIKE '%[mesmo segmento]%';

-- A prova social fala de uma PESSOA que adiou, nao de um negocio. "teve um
-- negocio que ficou adiando" troca o sujeito da frase.
UPDATE crm_stage_steps
SET script = replace(script, 'teve um negocio que ficou adiando', 'teve um cliente que ficou adiando')
WHERE script LIKE '%teve um negocio que ficou adiando%';

COMMIT;

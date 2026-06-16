# Inbox WhatsApp via Evolution API — Setup

Guia operacional pra subir a Evolution API e ligar no CRM Fyness.

## Quickstart — EasyPanel + 2 numeros (Evolution v2)

Se a Evolution **ja esta no ar no EasyPanel** (URL HTTPS + API key em maos), pula o
docker-compose abaixo e faz so isto:

1. **Secrets no Supabase** (Dashboard → Edge Functions → Secrets):
   ```
   EVOLUTION_URL=https://sua-evo.easypanel.host
   EVOLUTION_API_KEY=<AUTHENTICATION_API_KEY da Evolution>
   EVOLUTION_PROVIDER=evolution
   EVOLUTION_INSTANCE_DEFAULT=fyness-principal
   EVOLUTION_WEBHOOK_SECRET=<gere: openssl rand -hex 24>
   ```

2. **Deploy das Edge Functions** (payload v2 + midia inbound da Evolution):
   ```bash
   supabase functions deploy evolution-send
   supabase functions deploy evolution-webhook
   ```

3. **Cria as 2 instancias na Evolution ja com webhook** (roda local):
   ```powershell
   $env:EVOLUTION_URL="https://sua-evo.easypanel.host"
   $env:EVOLUTION_API_KEY="<API key>"
   $env:WEBHOOK_URL="https://SEU_PROJETO.supabase.co/functions/v1/evolution-webhook"
   $env:WEBHOOK_SECRET="<mesmo EVOLUTION_WEBHOOK_SECRET>"
   node scripts/evolutionSetup.mjs
   ```

4. **`.env` do frontend** (VPS): `VITE_EVOLUTION_URL` + `VITE_EVOLUTION_INSTANCE_DEFAULT=fyness-principal`. Rebuild/deploy do front.

5. **Escaneia o QR** de `fyness-principal` (numero da Fyness) e `lorena-consultora`
   (numero da Lorena) em **/crm/whatsapp** → Aparelhos conectados → Conectar aparelho.

Pronto: mensagens dos 2 numeros entram no Inbox e a resposta sai pelo numero da
propria conversa.

---

> O restante deste doc cobre o **self-host via docker-compose** (alternativa ao EasyPanel).

## 0. Pre-requisitos no VPS

- Docker + Docker Compose instalados
- Um subdominio apontando pro IP do VPS (ex: `evo.fyness.com.br`)
- Reverse proxy com HTTPS (Nginx, Caddy ou Traefik). Sem HTTPS o WhatsApp recusa conectar.
- Porta 8080 do container **NAO** exposta diretamente na internet (ela esta bindada em `127.0.0.1` no compose).

## 1. Subir os containers

```bash
# 1) Copia os arquivos pro VPS
scp infra/docker-compose.evolution.yml infra/.env.evolution.example user@vps:/opt/evolution/

ssh user@vps
cd /opt/evolution

# 2) Renomeia e ajusta o env
mv .env.evolution.example .env.evolution
nano .env.evolution
#    - EVOLUTION_SERVER_URL: URL publica HTTPS (ex: https://evo.seudominio.com)
#    - EVOLUTION_API_KEY: gere com `openssl rand -hex 32`
#    - EVOLUTION_WEBHOOK_URL: deixa em branco por enquanto; preencher na etapa 4
#    - POSTGRES_PASSWORD: senha forte

# 3) Sobe
docker compose -f docker-compose.evolution.yml --env-file .env.evolution up -d

# 4) Confere
docker compose -f docker-compose.evolution.yml logs -f evolution-api
```

A Evolution vai estar rodando em `http://127.0.0.1:8080`.

## 2. Configurar o reverse proxy (Caddy exemplo)

```caddy
evo.seudominio.com {
  reverse_proxy 127.0.0.1:8080
}
```

Caddy ja faz HTTPS automatico via Let's Encrypt.

Para Nginx, basicamente:
```nginx
server {
  listen 443 ssl;
  server_name evo.seudominio.com;
  ssl_certificate     /etc/letsencrypt/live/evo.seudominio.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/evo.seudominio.com/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
  }
}
```

Teste: `curl https://evo.seudominio.com` deve retornar uma resposta da Evolution.

## 3. Criar a instancia (escaneio de QR code)

A Evolution suporta multiplas instancias (uma por numero/vendedor). Comecamos com 1:
nome `fyness-principal`.

**Via API:**

```bash
EVO_URL=https://evo.seudominio.com
EVO_KEY=SUA_API_KEY

curl -X POST $EVO_URL/instance/create \
  -H "apikey: $EVO_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "instanceName": "fyness-principal",
    "qrcode": true,
    "integration": "WHATSAPP-BAILEYS"
  }'
```

A resposta vem com um QR code (base64). Abra:

```
https://evo.seudominio.com/manager
```

…faça login com a API key, clique em `fyness-principal`, escaneie o QR com o WhatsApp do
celular do vendedor (WhatsApp > Aparelhos conectados > Conectar um aparelho).

Quando a conexao virar `open`, a instancia esta pronta.

## 4. Configurar o webhook do Supabase

Antes de habilitar o webhook global no Evolution, a Edge Function precisa estar
deployada no Supabase. Isso vem na Fase 2 desse modulo (proximo passo).

Ordem correta:
1. Fase 1: criar tabelas no Supabase (migration `046_crm_whatsapp.sql`).
2. Fase 2: deploy das Edge Functions `evolution-send` e `evolution-webhook`.
3. Ai sim editar `.env.evolution`:
   - `EVOLUTION_WEBHOOK_URL=https://SEU_PROJETO.supabase.co/functions/v1/evolution-webhook`
4. Restartar: `docker compose -f docker-compose.evolution.yml --env-file .env.evolution up -d`

## 5. Variaveis do CRM (frontend + edge functions)

No `.env` da raiz do Fyness, adicionar (ja foi pro `.env.example`):

```
# Inbox WhatsApp (Evolution API)
VITE_EVOLUTION_URL=https://evo.seudominio.com
VITE_EVOLUTION_INSTANCE_DEFAULT=fyness-principal
```

E nas vars das Edge Functions do Supabase (Dashboard > Edge Functions > Secrets):

```
EVOLUTION_URL=https://evo.seudominio.com
EVOLUTION_API_KEY=mesma_chave_do_compose
EVOLUTION_WEBHOOK_SECRET=outra_string_aleatoria_pra_validar_webhook
```

## 6. Manutencao

- **Logs em tempo real:** `docker compose -f docker-compose.evolution.yml logs -f`
- **Reiniciar instancia:** `POST /instance/restart/fyness-principal` (com header `apikey`)
- **Desconectar (re-escanear):** `DELETE /instance/logout/fyness-principal`
- **Status:** `GET /instance/connectionState/fyness-principal`
- **Backup:** os volumes `evolution_instances` e `evolution_postgres_data` contem o estado das sessoes. Backup periodico recomendado.

## 7. Riscos conhecidos

- **Ban do numero:** WhatsApp pode banir numeros que disparam muito conteudo automatico
  ou parecem spam. Mitigacao: usar um numero secundario, nao misturar disparo em massa
  com conversa 1-a-1, respeitar limites de mensagens/hora.
- **Versao do Baileys:** a Evolution API depende da lib Baileys, que precisa acompanhar
  atualizacoes do WhatsApp Web. Mantenha a imagem atualizada (`docker compose pull` periodico).
- **Sessao perdida:** se o servidor reiniciar mal ou os volumes forem deletados, precisa
  re-escanear o QR. Backup dos volumes evita isso.

## 8. Proximos passos

Apos a Fase 0 (esse documento + compose), seguir:
- **Fase 1:** `database/046_crm_whatsapp.sql` (tabelas)
- **Fase 2:** `supabase/functions/evolution-send/` e `evolution-webhook/`
- **Fase 3:** services + hooks no frontend
- **Fase 4:** UI do Inbox
- **Fase 5:** integrar com automations

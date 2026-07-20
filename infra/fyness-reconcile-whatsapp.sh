#!/bin/bash
#
# Pergunta a Evolution o estado real das instancias de WhatsApp e corrige o
# banco. Roda de 5 em 5 minutos no VPS.
#
# POR QUE EXISTE
#   crm_whatsapp_instances.status so mudava quando chegava um evento
#   connection.update da Evolution. Quando a sessao morre calada — que e o caso
#   comum: o WhatsApp desloga o aparelho sem avisar — o valor congela em
#   'connected' pra sempre. Foi assim que o fyness-principal passou 24 dias fora
#   do ar com a tela dizendo que estava tudo certo.
#
#   Este script fecha esse buraco perguntando, em vez de esperar ser avisado. E
#   carimba last_seen_at quando a instancia esta mesmo de pe, o que faz do campo
#   um heartbeat de verdade.
#
# INSTALACAO (como root no VPS):
#   cp infra/fyness-reconcile-whatsapp.sh /usr/local/bin/
#   chmod 700 /usr/local/bin/fyness-reconcile-whatsapp.sh
#   crontab -e   ->   */5 * * * * /usr/local/bin/fyness-reconcile-whatsapp.sh
#
#   ATENCAO ao 700 (rwx------), nao 600. O arquivo carrega o secret do webhook,
#   entao precisa ser ilegivel pros outros — mas 600 tira o bit de EXECUCAO e o
#   cron falha silenciosamente em toda tentativa. Ja aconteceu: o heartbeat
#   parou de bater e o inbox passou a acusar os dois numeros como fora do ar
#   enquanto os dois recebiam mensagem normalmente.
#
#   Conferir depois de instalar:
#     ls -l /usr/local/bin/fyness-reconcile-whatsapp.sh   # tem que ter x
#     tail /var/log/fyness-reconcile.log                  # tem que crescer

set -u

SECRET="${EVOLUTION_WEBHOOK_SECRET:-}"
if [ -z "$SECRET" ]; then
  # Fallback: le do ambiente do container das edge functions.
  SECRET="$(docker exec supabase-edge-functions printenv EVOLUTION_WEBHOOK_SECRET 2>/dev/null || true)"
fi

URL="https://bpmn.fyness.com.br/sb/functions/v1/evolution-webhook?action=reconcile_instances"
[ -n "$SECRET" ] && URL="${URL}&secret=${SECRET}"

{
  printf '[%s] ' "$(date -Iseconds)"
  curl -s -m 60 -X POST "$URL" -H 'Content-Type: application/json' -d '{}'
  printf '\n'
} >> /var/log/fyness-reconcile.log 2>&1

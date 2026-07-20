#!/bin/bash
#
# Reenvia pro webhook as mensagens das ultimas 24h que a Evolution guardou.
# Roda de hora em hora no VPS.
#
# POR QUE EXISTE
#   O retry de webhook cobre so o caso em que a Evolution TENTA entregar e
#   falha. Quando a instancia esta caida, a mensagem nunca chega la — nao ha o
#   que retentar. Foi assim que 8 dias (28/06 a 05/07, 864 mensagens) ficaram
#   com ZERO linhas no CRM enquanto a Evolution tinha tudo guardado.
#
#   Este cron fecha esse furo: se a instancia cair, se a edge function ficar
#   fora do ar, ou se o webhook se perder por qualquer motivo, o sistema se
#   corrige sozinho na hora seguinte — sem depender de ninguem perceber.
#
#   A janela de 24h (bem maior que a de 1h entre execucoes) e proposital: cobre
#   queda longa e reprocessa de graca, porque reenviar mensagem que ja existe e
#   no-op (UNIQUE em evolution_message_id + dedup no handler).
#
# INSTALACAO (como root no VPS):
#   cp infra/fyness-backfill-whatsapp.sh /usr/local/bin/
#   chmod 700 /usr/local/bin/fyness-backfill-whatsapp.sh
#   crontab -e   ->   0 * * * * /usr/local/bin/fyness-backfill-whatsapp.sh
#
#   700, NAO 600. O 600 protege o conteudo mas tira o bit de execucao, e o cron
#   falha calado em toda tentativa — foi exatamente o que aconteceu com o
#   reconciliador de instancias, que passou horas sem rodar enquanto a tela
#   acusava os dois numeros como fora do ar.
#
#   Conferir depois de instalar:
#     ls -l /usr/local/bin/fyness-backfill-whatsapp.sh   # tem que ter x
#     tail /var/log/fyness-backfill.log                  # tem que crescer

set -u

REPO=/var/www/bpmn
LOG=/var/log/fyness-backfill.log

cd "$REPO" || { echo "[$(date -Iseconds)] repo ausente em $REPO" >> "$LOG"; exit 1; }

{
  echo "[$(date -Iseconds)] inicio"
  node scripts/whatsapp_backfill.mjs --horas 24
  echo "[$(date -Iseconds)] fim"
} >> "$LOG" 2>&1

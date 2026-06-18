/**
 * useReportCloseReminder - avisa (notificação) quando um período comercial
 * fechou e ainda não foi marcado como fechado no Arquivos. Roda no MainLayout.
 *
 *  - Diário:  lembra do dia de ONTEM.
 *  - Semanal: lembra da semana atual a partir de sexta 18h.
 *  - Mensal:  lembra do mês anterior nos primeiros 3 dias do mês.
 *
 * localStorage evita repetir o mesmo aviso. Cada browser só notifica o próprio
 * usuário sobre os relatórios DELE.
 */

import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { listClosings } from '../lib/crmReportClosingsService';
import { notify } from '../lib/notificationService';

const CHECK_INTERVAL = 30 * 60 * 1000; // 30 min

const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const monthKeyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;

// Períodos já encerrados que ainda podem precisar de fechamento, no instante `now`.
function pendingPeriods(now) {
  const out = [];

  // Diário: o dia de ontem.
  const y = new Date(now); y.setDate(y.getDate() - 1);
  out.push({ period: 'daily', key: keyOf(y), label: 'do dia' });

  // Semanal: a semana atual (segunda), a partir de sexta 18h até domingo.
  const dow = now.getDay(); // 0 dom .. 6 sáb
  const afterFri18 = (dow === 5 && now.getHours() >= 18) || dow === 6 || dow === 0;
  if (afterFri18) {
    const mon = new Date(now);
    mon.setDate(mon.getDate() - ((mon.getDay() + 6) % 7));
    out.push({ period: 'weekly', key: keyOf(mon), label: 'da semana' });
  }

  // Mensal: o mês anterior, nos 3 primeiros dias do mês.
  if (now.getDate() <= 3) {
    const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    out.push({ period: 'monthly', key: monthKeyOf(prev), label: 'do mês' });
  }

  return out;
}

export function useReportCloseReminder() {
  const [userId, setUserId] = useState(null);
  const lastCheck = useRef(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUserId(session?.user?.id || null));
  }, []);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    const run = async () => {
      if (Date.now() - lastCheck.current < CHECK_INTERVAL - 1000) return;
      lastCheck.current = Date.now();

      const now = new Date();
      const pend = pendingPeriods(now);
      if (pend.length === 0) return;

      let closings;
      try { closings = await listClosings(userId); } catch { return; }
      if (cancelled) return;
      const closedSet = new Set(closings.map((c) => `${c.period}:${c.periodKey}`));

      for (const p of pend) {
        const id = `${p.period}:${p.key}`;
        if (closedSet.has(id)) continue;
        const lsKey = `fyness:reportReminder:${userId}:${id}`;
        if (localStorage.getItem(lsKey)) continue;
        localStorage.setItem(lsKey, '1');
        try {
          await notify({
            userId,
            type: 'info',
            title: `Fechar relatório ${p.label}`,
            message: `Seu relatório ${p.label} está pronto. Revise e feche em Arquivos.`,
            entityType: 'report',
            entityId: p.key,
          });
        } catch { /* silencioso */ }
        if (cancelled) return;
      }
    };

    const t = setTimeout(run, 12_000); // espera o app carregar
    const iv = setInterval(run, CHECK_INTERVAL);
    return () => { cancelled = true; clearTimeout(t); clearInterval(iv); };
  }, [userId]);
}

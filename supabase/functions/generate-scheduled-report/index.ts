/**
 * Supabase Edge Function: generate-scheduled-report
 *
 * Executada via cron (Supabase pg_cron ou externo).
 * Verifica schedules ativos, gera relatorio e envia por email.
 *
 * Deploy: supabase functions deploy generate-scheduled-report
 * Cron: configure no Supabase Dashboard > Database > Extensions > pg_cron
 *
 * Exemplo de cron entry (todo dia as 8h):
 *   select cron.schedule('daily-reports', '0 8 * * *',
 *     $$ select net.http_post(
 *       url := 'https://<project>.supabase.co/functions/v1/generate-scheduled-report',
 *       headers := '{"Authorization": "Bearer <service_role_key>"}'::jsonb
 *     ) $$
 *   );
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'noreply@fyness.app'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    const now = new Date()
    const dayOfWeek = now.getDay()
    const dayOfMonth = now.getDate()

    // Buscar schedules ativos para hoje
    const { data: schedules, error } = await supabase
      .from('report_schedules')
      .select('*')
      .eq('is_active', true)

    if (error) throw error
    if (!schedules || schedules.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active schedules', processed: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let processed = 0

    for (const schedule of schedules) {
      // Verificar se e o dia certo
      if (schedule.frequency === 'weekly' && schedule.day_of_week !== dayOfWeek) continue
      if (schedule.frequency === 'monthly' && schedule.day_of_month !== dayOfMonth) continue

      const recipients = schedule.recipients || []
      if (recipients.length === 0) continue

      // Gerar dados do relatorio
      const memberFilter = schedule.filter_member !== 'all' ? schedule.filter_member : null

      // Periodo: ultimo mes/semana
      const periodEnd = new Date()
      const periodStart = new Date()
      if (schedule.frequency === 'weekly') {
        periodStart.setDate(periodStart.getDate() - 7)
      } else {
        periodStart.setMonth(periodStart.getMonth() - 1)
      }

      // Buscar O.S. do periodo
      let ordersQuery = supabase.from('os_orders').select('*')
      if (memberFilter) {
        ordersQuery = ordersQuery.eq('assignee', memberFilter)
      }
      const { data: orders } = await ordersQuery

      const doneOrders = (orders || []).filter((o: any) => {
        if (o.status !== 'done' || !o.actual_end) return false
        const d = new Date(o.actual_end)
        return d >= periodStart && d <= periodEnd
      })

      const inProgressCount = (orders || []).filter((o: any) => o.status === 'in_progress').length

      // Montar resumo textual
      const summary = [
        `Relatorio Fyness OS - ${schedule.frequency === 'weekly' ? 'Semanal' : 'Mensal'}`,
        `Periodo: ${periodStart.toLocaleDateString('pt-BR')} a ${periodEnd.toLocaleDateString('pt-BR')}`,
        memberFilter ? `Colaborador: ${memberFilter}` : 'Toda a equipe',
        '',
        `O.S. concluidas: ${doneOrders.length}`,
        `O.S. em andamento: ${inProgressCount}`,
        `Total de O.S.: ${(orders || []).length}`,
        '',
        'Para mais detalhes, acesse o sistema e gere o relatorio completo em PDF.',
      ].join('\n')

      // Enviar email
      if (RESEND_API_KEY) {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: recipients,
            subject: `[Fyness OS] Relatorio ${schedule.frequency === 'weekly' ? 'Semanal' : 'Mensal'} - ${periodEnd.toLocaleDateString('pt-BR')}`,
            text: summary,
          }),
        })
      }

      processed++
    }

    return new Response(
      JSON.stringify({ message: 'Reports processed', processed }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

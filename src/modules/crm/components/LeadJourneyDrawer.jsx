/**
 * LeadJourneyDrawer - gaveta lateral com a jornada completa do lead.
 *
 * Reaproveita o LeadHistoryPanel (a mesma timeline unificada da Agenda) num
 * slide-over. Usado nos relatórios: clicar num lead abre toda a jornada dele
 * (atividades, ligações, WhatsApp, e-mails, mudanças de estágio) + relato.
 */

import LeadHistoryPanel from './agenda/LeadHistoryPanel';

export default function LeadJourneyDrawer({ selected, onClose, onOpenLead }) {
  if (!selected) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md h-full bg-white dark:bg-slate-900 border-l border-slate-200/70 dark:border-white/10 shadow-2xl overflow-hidden">
        <LeadHistoryPanel selected={selected} onClose={onClose} onOpenLead={onOpenLead} />
      </div>
    </div>
  );
}

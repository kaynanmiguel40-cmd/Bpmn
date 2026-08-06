/**
 * PostponeMenu — "Adiar ▾" com horarios prontos.
 *
 * A alternativa (abrir um seletor de data e hora) e o tipo de coisa que faz a
 * pessoa desistir e simplesmente deixar a tarefa vencer — que e o problema que
 * a fila existe pra resolver. Aqui adiar custa 2 cliques e cai sempre num
 * horario valido: dentro do expediente, fora do almoco, em dia util.
 */

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Clock, ChevronDown } from 'lucide-react';
import {
  nextBusinessDay, atMinutes, daySlots, WORK_START_HOUR, LUNCH_END_HOUR,
} from '../../services/crmScheduling';

/**
 * Opcoes relativas ao agora, todas caindo em horario util.
 *
 * O horario NUNCA e calculado na mao: sai de daySlots(), a mesma fonte que o
 * agendador da cadencia usa. Fazer a conta aqui separadamente ja produziu
 * sugestao dentro do almoco (adiar as 9h propunha 11:30) e fora do expediente
 * (as 15:50 propunha 18:00) — duas regras que o resto do sistema respeita.
 */
export function postponeOptions(now = new Date()) {
  const hoje = new Date(now);
  const opts = [];
  const fimDeSemana = now.getDay() === 0 || now.getDay() === 6;

  // "Mais tarde hoje": o primeiro slot valido a pelo menos 2h daqui. Se nao
  // sobrou slot no dia (ou e fim de semana), a opcao simplesmente nao aparece —
  // melhor que oferecer um horario que nao existe.
  if (!fimDeSemana) {
    const alvo = now.getHours() * 60 + now.getMinutes() + 120;
    const slot = daySlots().find(m => m >= alvo);
    if (slot != null) opts.push({ label: 'Mais tarde hoje', date: atMinutes(hoje, slot) });
  }

  const amanha = nextBusinessDay(new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1));
  opts.push({ label: 'Amanhã de manhã', date: atMinutes(amanha, WORK_START_HOUR * 60 + 30) });
  opts.push({ label: 'Amanhã à tarde', date: atMinutes(amanha, LUNCH_END_HOUR * 60 + 120) });

  // Proxima segunda — o "deixa pra semana que vem" que todo mundo faz.
  const seg = new Date(hoje);
  seg.setDate(seg.getDate() + ((8 - seg.getDay()) % 7 || 7));
  opts.push({ label: 'Segunda de manhã', date: atMinutes(seg, WORK_START_HOUR * 60 + 30) });

  return opts;
}

const fmt = (d) =>
  d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
  d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

export function PostponeMenu({ onPick, disabled, compact = false }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    // `true` (capture) pra fechar mesmo quando o clique e barrado por
    // stopPropagation numa linha da fila.
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [open]);

  const toggle = (e) => {
    e.stopPropagation();
    if (open) { setOpen(false); return; }
    const r = btnRef.current?.getBoundingClientRect();
    // Portal + coordenadas de viewport: a fila fica dentro de `.crm-glass`, que
    // tem backdrop-filter — e isso cria bloco de contencao pra position:fixed,
    // prendendo qualquer dropdown dentro do card.
    if (r) {
      // Se não couber abaixo (botão perto do rodapé), abre PRA CIMA — senão o menu
      // era cortado fora da tela no celular.
      const H = 300; // altura estimada do menu de opções
      const abreAcima = r.bottom + H > window.innerHeight && r.top > H;
      setPos({
        top: abreAcima ? Math.max(8, r.top - H - 4) : r.bottom + 4,
        left: Math.max(8, r.right - 190),
      });
    }
    setOpen(true);
  };

  const opts = postponeOptions();

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        disabled={disabled}
        title="Adiar esta tarefa"
        className={`shrink-0 inline-flex items-center gap-1 rounded-lg border border-slate-300 dark:border-slate-600 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-50 ${
          compact ? 'px-2 py-1.5 text-[12px] min-h-[36px]' : 'px-3 py-2 text-sm min-h-[44px]'
        }`}
      >
        <Clock size={compact ? 12 : 14} /> Adiar <ChevronDown size={compact ? 11 : 13} />
      </button>

      {open && pos && createPortal(
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[61] w-[190px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-xl py-1"
            style={{ top: pos.top, left: pos.left }}
            onClick={(e) => e.stopPropagation()}
          >
            {opts.map((o) => (
              <button
                key={o.label}
                type="button"
                onClick={() => { setOpen(false); onPick?.(o.date); }}
                className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <div className="text-sm text-slate-700 dark:text-slate-200">{o.label}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 tnum">{fmt(o.date)}</div>
              </button>
            ))}
          </div>
        </>,
        document.body,
      )}
    </>
  );
}

export default PostponeMenu;

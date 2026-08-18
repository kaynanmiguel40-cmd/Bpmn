/**
 * CrmModal - Modal reutilizavel do CRM.
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - title: string
 * - size: 'sm' | 'md' | 'lg' | 'xl'
 * - children: conteudo
 * - footer: React node para footer (botoes)
 * - onBeforeClose: () => boolean (opcional) — chamado antes de fechar via Escape,
 *   clique no backdrop ou no X. Devolver `false` cancela o fechamento (ex: pra
 *   avisar o usuario que ha dado nao salvo). Sem essa prop o comportamento eh
 *   o de sempre — fecha direto.
 */

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

// Contador global de modais abertos — libera overflow apenas quando 0.
// Evita que modal A fechar restaure scroll enquanto modal B ainda esta aberto.
let openModalCount = 0;
let previousBodyOverflow = null;

function acquireBodyLock() {
  if (openModalCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  openModalCount += 1;
}

function releaseBodyLock() {
  openModalCount = Math.max(0, openModalCount - 1);
  if (openModalCount === 0) {
    document.body.style.overflow = previousBodyOverflow ?? '';
    previousBodyOverflow = null;
  }
}

export function CrmModal({ open, onClose, title, size = 'md', children, footer, onBeforeClose }) {
  const overlayRef = useRef(null);

  // Fechamento "protegido": da chance do consumidor barrar (ex: form com dado
  // nao salvo) antes de Escape/backdrop/X dispararem o onClose de verdade.
  const guardedClose = () => {
    if (onBeforeClose && onBeforeClose() === false) return;
    onClose?.();
  };

  // Fechar com Escape
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') guardedClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose, onBeforeClose]);

  // Bloquear scroll do body (stack-safe — conta modais empilhados)
  useEffect(() => {
    if (!open) return;
    acquireBodyLock();
    return () => {
      releaseBodyLock();
    };
  }, [open]);

  if (!open) return null;

  // PORTAL pro body de proposito: um ancestral com backdrop-filter (todo cartao
  // .crm-glass tem) vira bloco de contencao de position:fixed. Sem o portal, o
  // "inset-0" cobria so o cartao — dava uma faixa cinza parcial e o modal
  // centralizava dentro do card em vez da tela.
  return createPortal((
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) guardedClose(); }}
    >
      {/* Backdrop — cobre a tela inteira (ver o portal acima). */}
      <div className="absolute inset-0 bg-slate-900/30 dark:bg-black/60 backdrop-blur-sm" />

      {/* Modal — fundo SOLIDO de proposito: translucido (bg-white/90) por cima
          do backdrop escuro deixava o painel encardido, com aspecto cinza. */}
      <div className={`relative w-full ${sizeMap[size]} bg-white dark:bg-slate-900 rounded-2xl shadow-glass-lg border border-slate-200/80 dark:border-white/10 flex flex-col max-h-[90vh] animate-scale-in`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200/80 dark:border-white/10 shrink-0">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <button
            onClick={guardedClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Fechar modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {children}
        </div>

        {/* Footer.
            No celular os botoes EMPILHAM (flex-col), e `-reverse` poe o
            primario — que e sempre o ultimo no DOM — no TOPO da pilha, onde o
            polegar chega primeiro. Em linha unica, modal de 3 botoes estourava
            a largura em telas de 360px.
            Os botoes usam `w-full sm:w-auto`: e o par desta regra, e um so nao
            funciona sem o outro. */}
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row sm:flex-wrap sm:items-center sm:justify-end gap-2 px-5 py-3 border-t border-slate-200/80 dark:border-white/10 rounded-b-2xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  ), document.body);
}

export default CrmModal;

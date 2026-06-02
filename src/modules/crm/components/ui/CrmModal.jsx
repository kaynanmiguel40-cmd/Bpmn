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
 */

import { useEffect, useRef } from 'react';
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

export function CrmModal({ open, onClose, title, size = 'md', children, footer }) {
  const overlayRef = useRef(null);

  // Fechar com Escape
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [open, onClose]);

  // Bloquear scroll do body (stack-safe — conta modais empilhados)
  useEffect(() => {
    if (!open) return;
    acquireBodyLock();
    return () => {
      releaseBodyLock();
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md" />

      {/* Modal */}
      <div className={`relative w-full ${sizeMap[size]} bg-white/90 dark:bg-slate-900/85 backdrop-blur-2xl rounded-2xl shadow-glass-lg border border-white/60 dark:border-white/10 flex flex-col max-h-[90vh] animate-scale-in`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/60 dark:border-white/10 shrink-0">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <button
            onClick={onClose}
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

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/60 dark:border-white/10 bg-white/30 dark:bg-white/[0.02] rounded-b-2xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default CrmModal;

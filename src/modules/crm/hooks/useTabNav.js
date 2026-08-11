/**
 * useTabNav — gestos padrão de navegador pra "abrir em nova aba".
 *
 * O CRM abre o lead via navigate() no onClick de um <div> — e navigate() não
 * entende os gestos nativos do navegador. Como o card não é um <a href> de
 * verdade, o clique do meio (botão do scroll) e o Ctrl/⌘+clique não abriam
 * nada. Este helper devolve os handlers que trazem esse comportamento pra
 * qualquer elemento clicável, sem precisar transformá-lo em link (o que
 * quebraria o drag-and-drop do kanban e os botões aninhados).
 *
 * Uso:
 *   const tabNav = useTabNav();
 *   <div {...tabNav(`/crm/deals/${id}`)}>…</div>
 *
 * - clique normal          → navega no SPA (mesma aba)
 * - Ctrl/⌘ + clique        → abre em nova aba
 * - clique do meio (scroll)→ abre em nova aba
 *
 * `guard` (opcional): roda antes de agir; se devolver false, o gesto é
 * ignorado. Ex.: no kanban, um card em pleno arraste não deve navegar —
 * `tabNav(path, () => !isDragging.current)`.
 */

import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export function useTabNav() {
  const navigate = useNavigate();

  return useCallback((path, guard) => {
    const allowed = () => !guard || guard() !== false;
    const openTab = () => window.open(path, '_blank', 'noopener');

    return {
      onClick: (e) => {
        // Ctrl/⌘+clique abre em aba nova mesmo durante um arraste — o gesto é
        // explícito e não é o "clique normal" que o guard protege.
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          openTab();
          return;
        }
        if (allowed()) navigate(path);
      },
      // onAuxClick cobre o botão do meio (scroll). Ignora direito (button 2)
      // pra não atropelar o menu de contexto.
      onAuxClick: (e) => {
        if (e.button !== 1) return;
        e.preventDefault();
        if (allowed()) openTab();
      },
      // Sem isto o botão do meio dispara o auto-scroll do navegador (aquele
      // ícone de rolagem) em vez de só abrir a aba.
      onMouseDown: (e) => {
        if (e.button === 1) e.preventDefault();
      },
    };
  }, [navigate]);
}

export default useTabNav;

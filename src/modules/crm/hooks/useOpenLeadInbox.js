import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { openLeadInbox } from '../utils/inboxLink';

/**
 * Abre a conversa do lead no Inbox com estado de carregando.
 *
 * O caminho só-telefone (negócio sem contato) cria/vincula um contato pelo número
 * antes de navegar — são 2-4 idas à rede. Sem feedback o botão "parece morto" e o
 * vendedor re-clica. Aqui expomos `abrindo` pra desabilitar/mostrar spinner e uma
 * trava que ignora o clique-duplo enquanto a primeira abertura roda.
 */
export function useOpenLeadInbox() {
  const navigate = useNavigate();
  const [abrindo, setAbrindo] = useState(false);
  const abrir = useCallback(async (lead, waFallback = null, opts = {}) => {
    if (abrindo) return; // trava clique-duplo
    setAbrindo(true);
    try {
      await openLeadInbox(navigate, lead, waFallback, opts);
    } finally {
      setAbrindo(false);
    }
  }, [navigate, abrindo]);
  return { abrir, abrindo };
}

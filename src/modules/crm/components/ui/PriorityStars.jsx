/**
 * PriorityStars — prioridade do lead de 1 a 5 estrelas.
 *
 * E leitura humana ("esse merece minha atencao primeiro"), diferente de
 * `probability` (chance de fechar). 0 = sem prioridade.
 *
 * Interativo: clicar na estrela N define N; clicar na MESMA estrela que ja e o
 * valor atual zera (unica forma de tirar a prioridade sem um botao extra).
 */

import { useState } from 'react';
import { Star } from 'lucide-react';

export function PriorityStars({
  value = 0,
  onChange,
  size = 14,
  readOnly = false,
  className = '',
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  // Sem prioridade e so leitura: nao ocupa espaco no card.
  if (readOnly && !value) return null;

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      onMouseLeave={() => setHover(0)}
      title={value ? `Prioridade ${value} de 5` : 'Definir prioridade'}
    >
      {[1, 2, 3, 4, 5].map(n => {
        const on = n <= shown;
        const star = (
          <Star
            size={size}
            className={on ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}
            fill={on ? 'currentColor' : 'none'}
          />
        );
        if (readOnly) return <span key={n}>{star}</span>;
        return (
          <button
            key={n}
            type="button"
            aria-label={`Prioridade ${n}`}
            onMouseEnter={() => setHover(n)}
            onClick={(e) => {
              // O card inteiro e clicavel/arrastavel — sem isto, definir a
              // prioridade abriria o lead.
              e.stopPropagation();
              e.preventDefault();
              onChange?.(n === value ? 0 : n);
            }}
            className="leading-none hover:scale-110 transition-transform"
          >
            {star}
          </button>
        );
      })}
    </span>
  );
}

export default PriorityStars;

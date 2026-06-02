import { useEffect, useRef, useState } from 'react';

/**
 * useCountUp - anima um numero de 0 ate `target` ao montar/atualizar.
 *
 * Usa requestAnimationFrame com easing easeOutCubic. Respeita
 * prefers-reduced-motion (vai direto pro valor final). Se `target` nao
 * for um numero finito, retorna o proprio valor sem animar.
 *
 * @param {number} target valor final
 * @param {{ duration?: number, enabled?: boolean }} opts
 * @returns {number} valor corrente (fracionario durante a animacao)
 */
export function useCountUp(target, { duration = 800, enabled = true } = {}) {
  const isNum = typeof target === 'number' && Number.isFinite(target);
  const [value, setValue] = useState(isNum && enabled ? 0 : target);
  const rafRef = useRef(0);

  useEffect(() => {
    if (!enabled || !isNum) {
      setValue(target);
      return;
    }

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      setValue(target);
      return;
    }

    const start = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      setValue(target * easeOutCubic(progress));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration, enabled, isNum]);

  return value;
}

export default useCountUp;

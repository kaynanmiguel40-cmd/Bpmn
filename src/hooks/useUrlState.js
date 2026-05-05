import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook que sincroniza um valor com a URL (query string).
 * Permite recuperar o estado ao trocar de aba e voltar ou compartilhar link.
 *
 * @param {string} key - chave da query string
 * @param {*} defaultValue - valor inicial caso ausente na URL
 * @param {object} opts
 *   - serialize(v): converte valor -> string. Default: String(v)
 *   - parse(s): converte string -> valor. Default: identidade. Numbers tem helper.
 *   - replace: usa replaceState (true) ou pushState (false). Default: true.
 *
 * Convencao: se o valor for igual ao default, remove o param da URL pra
 * manter limpa. Sentinela: defaultValue === '' considera vazio como default.
 */
export function useUrlState(key, defaultValue = '', opts = {}) {
  const [params, setParams] = useSearchParams();
  const { serialize = (v) => String(v), parse = (s) => s, replace = true } = opts;

  const value = useMemo(() => {
    const raw = params.get(key);
    if (raw === null) return defaultValue;
    try { return parse(raw); } catch { return defaultValue; }
  }, [params, key, defaultValue, parse]);

  const setValue = useCallback((next) => {
    setParams(prev => {
      const sp = new URLSearchParams(prev);
      const resolved = typeof next === 'function' ? next(value) : next;
      const isDefault = resolved === defaultValue
        || (resolved === '' && (defaultValue === '' || defaultValue == null))
        || (resolved == null && defaultValue == null);
      if (isDefault) {
        sp.delete(key);
      } else {
        sp.set(key, serialize(resolved));
      }
      return sp;
    }, { replace });
  }, [setParams, key, value, defaultValue, serialize, replace]);

  return [value, setValue];
}

// Helper pra integers com clamp opcional (page=1+).
export function useUrlInt(key, defaultValue = 1, opts = {}) {
  return useUrlState(key, defaultValue, {
    serialize: (v) => String(v),
    parse: (s) => {
      const n = parseInt(s, 10);
      return Number.isFinite(n) ? n : defaultValue;
    },
    replace: opts.replace ?? true,
  });
}

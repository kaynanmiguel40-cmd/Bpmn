import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

// Defaults hoisted pro escopo do modulo: se ficassem inline no destructuring
// de `opts`, cada chamador que nao passa serialize/parse proprio ganhava uma
// funcao NOVA a cada render — isso entrava na dependencia do useCallback de
// `setValue` (abaixo) e recriava o setter a cada render. Paginas que
// sincronizam um valor debounced pra URL via
// `useEffect(() => setUrl(x), [x, setUrl])` viravam loop infinito
// ("Maximum update depth exceeded") porque o proprio efeito recriava a
// dependencia que o disparava de novo. Confirmado ao vivo em
// CrmContactsPage/CrmCompaniesPage.
const defaultSerialize = (v) => String(v);
const defaultParse = (s) => s;

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
  const { serialize = defaultSerialize, parse = defaultParse, replace = true } = opts;

  const value = useMemo(() => {
    const raw = params.get(key);
    if (raw === null) return defaultValue;
    try { return parse(raw); } catch { return defaultValue; }
  }, [params, key, defaultValue, parse]);

  // Le o valor atual de dentro do updater (via `prev`), nao do closure —
  // assim `setValue` nao depende de `value`, que muda a cada chamada.
  const setValue = useCallback((next) => {
    setParams(prev => {
      const sp = new URLSearchParams(prev);
      const rawPrev = prev.get(key);
      let currentValue = defaultValue;
      if (rawPrev !== null) {
        try { currentValue = parse(rawPrev); } catch { currentValue = defaultValue; }
      }
      const resolved = typeof next === 'function' ? next(currentValue) : next;
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
  }, [setParams, key, defaultValue, serialize, parse, replace]);

  return [value, setValue];
}

// Helper pra integers com clamp opcional (page=1+).
export function useUrlInt(key, defaultValue = 1, opts = {}) {
  const parse = useCallback((s) => {
    const n = parseInt(s, 10);
    return Number.isFinite(n) ? n : defaultValue;
  }, [defaultValue]);

  return useUrlState(key, defaultValue, {
    serialize: defaultSerialize,
    parse,
    replace: opts.replace ?? true,
  });
}

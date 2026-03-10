/**
 * MetaCallbackPage - Callback OAuth para Meta (Instagram/Facebook)
 *
 * Esta pagina recebe o code do OAuth e envia para a janela pai.
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function MetaCallbackPage() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const state = searchParams.get('state');

    // Validar state
    const savedState = sessionStorage.getItem('meta_oauth_state');
    if (state && savedState && state !== savedState) {
      window.opener?.postMessage({
        type: 'meta_oauth_error',
        error: 'State mismatch - possivel ataque CSRF',
      }, window.location.origin);
      return;
    }

    if (error) {
      window.opener?.postMessage({
        type: 'meta_oauth_error',
        error: errorDescription || error,
      }, window.location.origin);
    } else if (code) {
      window.opener?.postMessage({
        type: 'meta_oauth_success',
        code,
      }, window.location.origin);
    }

    // Limpar state
    sessionStorage.removeItem('meta_oauth_state');
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 gap-4">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-600 dark:text-slate-300">Conectando com Instagram...</p>
      <p className="text-sm text-slate-400">Esta janela fechara automaticamente.</p>
    </div>
  );
}

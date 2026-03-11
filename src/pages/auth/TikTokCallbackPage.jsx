/**
 * TikTokCallbackPage - Processa retorno OAuth do TikTok
 *
 * Após usuário autorizar o app no TikTok, ele é redirecionado para cá
 * com code e state nos query params. Trocamos o code por tokens.
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForTokens } from '../../lib/tiktokService';

export default function TikTokCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [error, setError] = useState('');
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const processCallback = async () => {
      // Evitar processamento duplicado (React StrictMode)
      if (isProcessingRef.current) {
        console.log('[TikTok Callback] Já processando, ignorando...');
        return;
      }

      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Verificar se houve erro no OAuth
      if (errorParam) {
        setStatus('error');
        setError(errorDescription || errorParam);
        return;
      }

      // Verificar se temos code e state
      if (!code || !state) {
        setStatus('error');
        setError('Parâmetros inválidos. Code ou state ausentes.');
        return;
      }

      // Verificar se já foi processado com sucesso anteriormente
      const lastProcessedCode = localStorage.getItem('tiktok_last_processed_code');
      if (lastProcessedCode === code) {
        console.log('[TikTok Callback] Código já processado, redirecionando...');
        navigate('/settings', { replace: true });
        return;
      }

      // Marcar como em processamento IMEDIATAMENTE
      isProcessingRef.current = true;
      console.log('[TikTok Callback] Iniciando troca de código via Edge Function...');

      try {
        // Trocar code por tokens via Edge Function (server-side)
        await exchangeCodeForTokens(code, state);

        // Marcar como processado com sucesso
        localStorage.setItem('tiktok_last_processed_code', code);
        setStatus('success');

        // Redirecionar para settings após 2 segundos
        setTimeout(() => {
          navigate('/settings', { replace: true });
        }, 2000);
      } catch (err) {
        console.error('[TikTok Callback] Erro:', err);
        setStatus('error');
        setError(err.message || 'Erro ao processar autorização');
        isProcessingRef.current = false;
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
          {/* TikTok Logo */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-black flex items-center justify-center">
            <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none">
              <path
                d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"
                fill="#00f2ea"
              />
              <path
                d="M16.37 2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005.57 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4A4.83 4.83 0 0116.37 2z"
                fill="#ff0050"
              />
            </svg>
          </div>

          {/* Status */}
          {status === 'processing' && (
            <>
              <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Processando autorização...
              </h2>
              <p className="text-slate-400 text-sm">
                Estamos conectando sua conta TikTok
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                TikTok conectado!
              </h2>
              <p className="text-slate-400 text-sm">
                Redirecionando para configurações...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Erro na autorização
              </h2>
              <p className="text-red-300 text-sm mb-4">
                {error}
              </p>
              <button
                onClick={() => navigate('/settings', { replace: true })}
                className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Voltar para configurações
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

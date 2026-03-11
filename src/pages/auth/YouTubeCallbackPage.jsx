/**
 * YouTubeCallbackPage - Processa retorno OAuth do YouTube/Google
 *
 * Após usuário autorizar o app no Google, ele é redirecionado para cá
 * com code e state nos query params. Trocamos o code por tokens.
 */

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForTokens } from '../../lib/youtubeService';

export default function YouTubeCallbackPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [error, setError] = useState('');
  const isProcessingRef = useRef(false);

  useEffect(() => {
    const processCallback = async () => {
      // Evitar processamento duplicado (React StrictMode)
      if (isProcessingRef.current) {
        console.log('[YouTube Callback] Já processando, ignorando...');
        return;
      }

      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const errorParam = searchParams.get('error');

      // Verificar se houve erro no OAuth
      if (errorParam) {
        setStatus('error');
        setError(errorParam === 'access_denied'
          ? 'Acesso negado. Você precisa autorizar o app para continuar.'
          : errorParam);
        return;
      }

      // Verificar se temos code e state
      if (!code || !state) {
        setStatus('error');
        setError('Parâmetros inválidos. Code ou state ausentes.');
        return;
      }

      // Verificar se já foi processado com sucesso anteriormente
      const lastProcessedCode = localStorage.getItem('youtube_last_processed_code');
      if (lastProcessedCode === code) {
        console.log('[YouTube Callback] Código já processado, redirecionando...');
        navigate('/settings', { replace: true });
        return;
      }

      // Marcar como em processamento IMEDIATAMENTE
      isProcessingRef.current = true;
      console.log('[YouTube Callback] Iniciando troca de código via Edge Function...');

      try {
        // Trocar code por tokens via Edge Function (server-side)
        await exchangeCodeForTokens(code, state);

        // Marcar como processado com sucesso
        localStorage.setItem('youtube_last_processed_code', code);
        setStatus('success');

        // Redirecionar para settings após 2 segundos
        setTimeout(() => {
          navigate('/settings', { replace: true });
        }, 2000);
      } catch (err) {
        console.error('[YouTube Callback] Erro:', err);
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
          {/* YouTube Logo */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-600 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>

          {/* Status */}
          {status === 'processing' && (
            <>
              <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Processando autorização...
              </h2>
              <p className="text-slate-400 text-sm">
                Estamos conectando sua conta YouTube
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
                YouTube conectado!
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

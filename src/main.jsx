import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider, MutationCache } from '@tanstack/react-query'
import { toast } from './contexts/ToastContext'
import { AuthProvider } from './contexts/AuthContext'
import { PermissionProvider } from './contexts/PermissionContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { InstallPrompt } from './components/pwa/InstallPrompt'
import { ErrorBoundary } from './components/ErrorBoundary'
import { registerSW } from './lib/pwaUtils'
import App from './App'
import './index.css'

// Service Worker:
//  - DEV (localhost): NUNCA registra, e DESREGISTRA qualquer SW + limpa caches.
//    Evita o SW servir codigo velho em cache no localhost (causava "codigo preso").
//  - PROD: registra o SW (v6, sem cache de assets; so push + auto-limpeza).
if (import.meta.env.DEV) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then((rs) => rs.forEach((r) => r.unregister()))
      .catch(() => {});
    if (typeof caches !== 'undefined') {
      caches.keys().then((ks) => ks.forEach((k) => caches.delete(k))).catch(() => {});
    }
  }
} else {
  registerSW()
}

// Recarregar automaticamente se um chunk antigo falhar (apos deploy)
// Evita tela branca quando usuario tem HTML em cache apontando para chunks removidos
const RELOAD_FLAG = 'chunk-reload-attempt';
window.addEventListener('error', (event) => {
  const msg = event?.message || '';
  const isChunkError =
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Loading chunk') ||
    msg.includes('Importing a module script failed');
  if (!isChunkError) return;
  // Evitar loop: so recarregar uma vez por sessao
  if (sessionStorage.getItem(RELOAD_FLAG)) return;
  sessionStorage.setItem(RELOAD_FLAG, '1');
  window.location.reload();
});
window.addEventListener('unhandledrejection', (event) => {
  const msg = event?.reason?.message || '';
  const isChunkError =
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Loading chunk') ||
    msg.includes('Importing a module script failed');
  if (!isChunkError) return;
  if (sessionStorage.getItem(RELOAD_FLAG)) return;
  sessionStorage.setItem(RELOAD_FLAG, '1');
  window.location.reload();
});
// Limpar flag quando a pagina carregar com sucesso (apos o reload dar certo)
window.addEventListener('load', () => {
  setTimeout(() => sessionStorage.removeItem(RELOAD_FLAG), 3000);
});

// ===================== DIAGNOSTICO TEMPORARIO (remover depois) =====================
// Captura QUALQUER erro nao-tratado (event handler/async) e o exibe numa barra
// vermelha fixa que SOBREVIVE ao React desmontar (anexada no body, fora do React)
// e ate a reload (persiste em localStorage). Serve pra achar a causa da "tela branca".
function __pushFatal(label, msg, stack) {
  try {
    const entry = `[${label}] @ ${location.pathname}${location.search}\n${msg || '?'}\n${(stack || '').split('\n').slice(0, 8).join('\n')}`;
    const log = JSON.parse(localStorage.getItem('__fatal_log') || '[]');
    log.unshift(`${new Date().toISOString().slice(11, 19)} ${entry}`);
    localStorage.setItem('__fatal_log', JSON.stringify(log.slice(0, 8)));
  } catch { /* noop */ }
  __renderFatal();
}
function __renderFatal() {
  try {
    const log = JSON.parse(localStorage.getItem('__fatal_log') || '[]');
    if (!log.length) return;
    let el = document.getElementById('__fatal_overlay');
    if (!el) {
      el = document.createElement('div');
      el.id = '__fatal_overlay';
      el.style.cssText = 'position:fixed;left:0;right:0;bottom:0;z-index:2147483647;background:#7f1d1d;color:#fff;font:11px/1.35 monospace;padding:8px 10px;max-height:60vh;overflow:auto;white-space:pre-wrap;border-top:3px solid #fca5a5';
      (document.body || document.documentElement).appendChild(el);
    }
    el.textContent = '⚠ ERRO CAPTURADO (manda um print disso) — toque pra fechar:\n\n' + log.join('\n\n──────────\n');
    el.onclick = () => { try { localStorage.removeItem('__fatal_log'); } catch {} el.remove(); };
  } catch { /* noop */ }
}
window.addEventListener('error', (e) => __pushFatal('error', e?.message, e?.error?.stack));
window.addEventListener('unhandledrejection', (e) => __pushFatal('promise', e?.reason?.message || String(e?.reason), e?.reason?.stack));
window.addEventListener('load', () => setTimeout(__renderFatal, 1500));

// React Query client global
const queryClient = new QueryClient({
  // Rede de seguranca global: mutation que falha SEM onError proprio ainda
  // avisa o usuario — evita o padrao "falhou em silencio e parecia sucesso".
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.options.onError) return; // quem trata o proprio erro, trata
      toast(`Erro: ${error?.message || 'falha inesperada'}`, 'error');
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* ErrorBoundary RAIZ: pega crash/loop ate nos providers (Theme/Auth/Permission)
          — sem isso, um throw acima do App vira tela branca total. */}
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <PermissionProvider>
                <App />
                <InstallPrompt />
              </PermissionProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>,
)

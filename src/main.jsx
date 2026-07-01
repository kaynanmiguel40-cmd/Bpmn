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
      // EGRESS: staleTime curto + refetchOnWindowFocus faziam TODAS as queries
      // refazerem o fetch a cada foco de aba → banco inteiro baixado dezenas de
      // vezes/dia. Realtime + invalidação nas mutations já mantêm os dados frescos.
      staleTime: 120_000,
      retry: 1,
      refetchOnWindowFocus: false,
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

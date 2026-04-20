import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import { PermissionProvider } from './contexts/PermissionContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { InstallPrompt } from './components/pwa/InstallPrompt'
import { registerSW } from './lib/pwaUtils'
import App from './App'
import './index.css'

// Registrar Service Worker para PWA
registerSW()

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
    </BrowserRouter>
  </React.StrictMode>,
)

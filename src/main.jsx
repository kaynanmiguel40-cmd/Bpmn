import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { PermissionProvider } from './contexts/PermissionContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { InstallPrompt } from './components/pwa/InstallPrompt'
import { registerSW } from './lib/pwaUtils'
import App from './App'
import './index.css'

// Registrar Service Worker para PWA
registerSW()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <PermissionProvider>
            <App />
            <InstallPrompt />
          </PermissionProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)

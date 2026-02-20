import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider, useToast, setGlobalToast } from './contexts/ToastContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Layout (carrega sempre — leve)
import MainLayout from './components/layout/MainLayout'

// Pages com lazy loading (code splitting)
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Editor = lazy(() => import('./pages/Editor'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const RoutinePage = lazy(() => import('./pages/routine/RoutinePage'))
const AgendaPage = lazy(() => import('./pages/agenda/AgendaPage'))
const FinancialPage = lazy(() => import('./pages/financial/FinancialPage'))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'))
const ReportPage = lazy(() => import('./pages/reports/ReportPage'))
const EapPage = lazy(() => import('./pages/eap/EapPage'))
const EapGanttPage = lazy(() => import('./pages/eap/EapGanttPage'))

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-slate-950">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 dark:bg-slate-950 gap-4">
      <div className="text-6xl font-bold text-slate-300 dark:text-slate-600">403</div>
      <h1 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Acesso Negado</h1>
      <p className="text-slate-500 dark:text-slate-400">Voce nao tem permissao para acessar esta pagina.</p>
      <a href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        Voltar ao Dashboard
      </a>
    </div>
  )
}

// Conecta toast global para uso fora de componentes (serviceFactory)
function ToastBridge() {
  const { addToast } = useToast()
  useEffect(() => {
    setGlobalToast(addToast)
    return () => setGlobalToast(null)
  }, [addToast])
  return null
}

function App() {
  return (
    <ToastProvider>
      <ToastBridge />
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            {/* Rotas publicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Editor em tela cheia (protegido) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/sales/editor/:id?" element={<Editor />} />
              <Route path="/editor/:id?" element={<Editor />} />
            </Route>

            {/* Rotas com Layout (Sidebar) — protegidas */}
            {/* Cada pagina tem ErrorBoundary individual para nao crashar o app inteiro */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
                <Route path="/sales" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                <Route path="/routine" element={<ErrorBoundary><RoutinePage /></ErrorBoundary>} />
                <Route path="/agenda" element={<ErrorBoundary><AgendaPage /></ErrorBoundary>} />
                <Route path="/financial" element={<ErrorBoundary><FinancialPage /></ErrorBoundary>} />
                <Route path="/eap" element={<ErrorBoundary><EapPage /></ErrorBoundary>} />
                <Route path="/eap/:projectId" element={<ErrorBoundary><EapGanttPage /></ErrorBoundary>} />
                <Route path="/reports" element={<ErrorBoundary><ReportPage /></ErrorBoundary>} />
                <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
              </Route>
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </ToastProvider>
  )
}

export default App

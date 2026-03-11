import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider, useToast, setGlobalToast } from './contexts/ToastContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Layout (carrega sempre — leve)
import MainLayout from './components/layout/MainLayout'

// Pages com lazy loading (code splitting)
const LoginPage = lazy(() => import('./pages/auth/LoginPage'))
const TikTokCallbackPage = lazy(() => import('./pages/auth/TikTokCallbackPage'))
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

// CRM Module (lazy loaded — app dentro do app)
const CrmLayout = lazy(() => import('./modules/crm/components/layout/CrmLayout'))
const CrmDashboardPage = lazy(() => import('./modules/crm/pages/CrmDashboardPage'))
const CrmPipelinePage = lazy(() => import('./modules/crm/pages/CrmPipelinePage'))
const CrmDealsPage = lazy(() => import('./modules/crm/pages/CrmDealsPage'))
const CrmDealDetailPage = lazy(() => import('./modules/crm/pages/CrmDealDetailPage'))
const CrmContactsPage = lazy(() => import('./modules/crm/pages/CrmContactsPage'))
const CrmContactDetailPage = lazy(() => import('./modules/crm/pages/CrmContactDetailPage'))
const CrmCompaniesPage = lazy(() => import('./modules/crm/pages/CrmCompaniesPage'))
const CrmCompanyDetailPage = lazy(() => import('./modules/crm/pages/CrmCompanyDetailPage'))
const CrmActivitiesPage = lazy(() => import('./modules/crm/pages/CrmActivitiesPage'))
const CrmProposalsPage = lazy(() => import('./modules/crm/pages/CrmProposalsPage'))
const CrmGoalsPage = lazy(() => import('./modules/crm/pages/CrmGoalsPage'))
const CrmReportsPage = lazy(() => import('./modules/crm/pages/CrmReportsPage'))
const CrmForecastPage = lazy(() => import('./modules/crm/pages/CrmForecastPage'))
const CrmTrafficPage = lazy(() => import('./modules/crm/pages/CrmTrafficPage'))
const CrmProspectsPage = lazy(() => import('./modules/crm/pages/CrmProspectsPage'))
const CrmSettingsPage = lazy(() => import('./modules/crm/pages/CrmSettingsPage'))
const CrmAutomationsPage = lazy(() => import('./modules/crm/pages/CrmAutomationsPage'))

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
      <a href="/dashboard" className="px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors">
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
            <Route path="/auth/tiktok-callback" element={<TikTokCallbackPage />} />

            {/* Editor em tela cheia (protegido) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/sales/editor/:id?" element={<Editor />} />
              <Route path="/editor/:id?" element={<Editor />} />
            </Route>

            {/* CRM — layout proprio (app dentro do app) — protegido */}
            <Route element={<ProtectedRoute />}>
              <Route path="/crm" element={<CrmLayout />}>
                <Route index element={<ErrorBoundary><CrmDashboardPage /></ErrorBoundary>} />
                <Route path="pipeline" element={<ErrorBoundary><CrmPipelinePage /></ErrorBoundary>} />
                <Route path="pipeline/:pipelineId" element={<ErrorBoundary><CrmPipelinePage /></ErrorBoundary>} />
                <Route path="deals" element={<ErrorBoundary><CrmDealsPage /></ErrorBoundary>} />
                <Route path="deals/:dealId" element={<ErrorBoundary><CrmDealDetailPage /></ErrorBoundary>} />
                <Route path="contacts" element={<ErrorBoundary><CrmContactsPage /></ErrorBoundary>} />
                <Route path="contacts/:id" element={<ErrorBoundary><CrmContactDetailPage /></ErrorBoundary>} />
                <Route path="companies" element={<ErrorBoundary><CrmCompaniesPage /></ErrorBoundary>} />
                <Route path="companies/:id" element={<ErrorBoundary><CrmCompanyDetailPage /></ErrorBoundary>} />
                <Route path="activities" element={<ErrorBoundary><CrmActivitiesPage /></ErrorBoundary>} />
                <Route path="proposals" element={<ErrorBoundary><CrmProposalsPage /></ErrorBoundary>} />
                <Route path="reports" element={<ErrorBoundary><CrmReportsPage /></ErrorBoundary>} />
                <Route path="forecast" element={<ErrorBoundary><CrmForecastPage /></ErrorBoundary>} />
                <Route path="goals" element={<ErrorBoundary><CrmGoalsPage /></ErrorBoundary>} />
                <Route path="traffic" element={<ErrorBoundary><CrmTrafficPage /></ErrorBoundary>} />
                <Route path="prospects" element={<ErrorBoundary><CrmProspectsPage /></ErrorBoundary>} />
                <Route path="settings" element={<ErrorBoundary><CrmSettingsPage /></ErrorBoundary>} />
                <Route path="automations" element={<ErrorBoundary><CrmAutomationsPage /></ErrorBoundary>} />
              </Route>
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

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
const YouTubeCallbackPage = lazy(() => import('./pages/auth/YouTubeCallbackPage'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Editor = lazy(() => import('./pages/Editor'))
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'))
const AgendaPage = lazy(() => import('./pages/agenda/AgendaPage'))
const FinancialPage = lazy(() => import('./pages/financial/FinancialPage'))
const SettingsPage = lazy(() => import('./pages/settings/SettingsPage'))
const ReportPage = lazy(() => import('./pages/reports/ReportPage'))
const ArquivosPage = lazy(() => import('./pages/arquivos/ArquivosPage'))

// CRM Module (lazy loaded — app dentro do app)
const CrmLayout = lazy(() => import('./modules/crm/components/layout/CrmLayout'))
const CrmDashboardPage = lazy(() => import('./modules/crm/pages/CrmDashboardPage'))
const CrmDailyPage = lazy(() => import('./modules/crm/pages/CrmDailyPage'))
const CrmPipelinePage = lazy(() => import('./modules/crm/pages/CrmPipelinePage'))
const CrmDealsPage = lazy(() => import('./modules/crm/pages/CrmDealsPage'))
const CrmDealDetailPage = lazy(() => import('./modules/crm/pages/CrmDealDetailPage'))
const CrmGanhosPage = lazy(() => import('./modules/crm/pages/CrmGanhosPage'))
const CrmContactsPage = lazy(() => import('./modules/crm/pages/CrmContactsPage'))
const CrmContactDetailPage = lazy(() => import('./modules/crm/pages/CrmContactDetailPage'))
const CrmCompaniesPage = lazy(() => import('./modules/crm/pages/CrmCompaniesPage'))
const CrmCompanyDetailPage = lazy(() => import('./modules/crm/pages/CrmCompanyDetailPage'))
const CrmActivitiesPage = lazy(() => import('./modules/crm/pages/CrmActivitiesPage'))
const CrmAgendaPage = lazy(() => import('./modules/crm/pages/CrmAgendaPage'))
const CrmGoalsPage = lazy(() => import('./modules/crm/pages/CrmGoalsPage'))
const ComparativoPage = lazy(() => import('./modules/crm/pages/ComparativoPage'))
const CrmForecastPage = lazy(() => import('./modules/crm/pages/CrmForecastPage'))
const CrmTrafficPage = lazy(() => import('./modules/crm/pages/CrmTrafficPage'))
const CrmProspectsPage = lazy(() => import('./modules/crm/pages/CrmProspectsPage'))
const CrmSettingsPage = lazy(() => import('./modules/crm/pages/CrmSettingsPage'))
const CrmAutomationsPage = lazy(() => import('./modules/crm/pages/CrmAutomationsPage'))
const CrmDialerPage = lazy(() => import('./modules/crm/pages/CrmDialerPage'))
const CrmCallHistoryPage = lazy(() => import('./modules/crm/pages/CrmCallHistoryPage'))
const CrmInboxPage = lazy(() => import('./modules/crm/pages/CrmInboxPage'))
const CrmWhatsAppSetupPage = lazy(() => import('./modules/crm/pages/CrmWhatsAppSetupPage'))
const CrmCadastrosPage = lazy(() => import('./modules/crm/pages/CrmCadastrosPage'))

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
      <a href="/financial" className="px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors">
        Voltar ao Inicio
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
            <Route path="/auth/youtube-callback" element={<YouTubeCallbackPage />} />

            {/* Editor em tela cheia (protegido) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/sales/editor/:id?" element={<Editor />} />
              <Route path="/editor/:id?" element={<Editor />} />
            </Route>

            {/* CRM — layout proprio (app dentro do app) — protegido.
                ErrorBoundary em volta do CrmLayout: um crash no shell/pagina do CRM
                vira "Algo deu errado" (com stack no console) em vez de tela branca total. */}
            <Route element={<ProtectedRoute />}>
              <Route path="/crm" element={<ErrorBoundary><CrmLayout /></ErrorBoundary>}>
                <Route index element={<ErrorBoundary><CrmDashboardPage /></ErrorBoundary>} />
                <Route path="daily" element={<ErrorBoundary><CrmDailyPage /></ErrorBoundary>} />
                <Route path="pipeline" element={<ErrorBoundary><CrmPipelinePage /></ErrorBoundary>} />
                <Route path="pipeline/:pipelineId" element={<ErrorBoundary><CrmPipelinePage /></ErrorBoundary>} />
                <Route path="deals" element={<ErrorBoundary><CrmDealsPage /></ErrorBoundary>} />
                <Route path="deals/:dealId" element={<ErrorBoundary><CrmDealDetailPage /></ErrorBoundary>} />
                <Route path="ganhos" element={<ErrorBoundary><CrmGanhosPage /></ErrorBoundary>} />
                <Route path="cadastros" element={<ErrorBoundary><CrmCadastrosPage /></ErrorBoundary>} />
                <Route path="contacts" element={<ErrorBoundary><CrmContactsPage /></ErrorBoundary>} />
                <Route path="contacts/:id" element={<ErrorBoundary><CrmContactDetailPage /></ErrorBoundary>} />
                <Route path="companies" element={<ErrorBoundary><CrmCompaniesPage /></ErrorBoundary>} />
                <Route path="companies/:id" element={<ErrorBoundary><CrmCompanyDetailPage /></ErrorBoundary>} />
                <Route path="activities" element={<ErrorBoundary><CrmActivitiesPage /></ErrorBoundary>} />
                <Route path="agenda" element={<ErrorBoundary><CrmAgendaPage /></ErrorBoundary>} />
                <Route path="discador" element={<ErrorBoundary><CrmDialerPage /></ErrorBoundary>} />
                <Route path="discador/historico" element={<ErrorBoundary><CrmCallHistoryPage /></ErrorBoundary>} />
                <Route path="inbox" element={<ErrorBoundary><CrmInboxPage /></ErrorBoundary>} />
                <Route path="whatsapp" element={<ErrorBoundary><CrmWhatsAppSetupPage /></ErrorBoundary>} />
                <Route path="forecast" element={<ErrorBoundary><CrmForecastPage /></ErrorBoundary>} />
                <Route path="goals" element={<ErrorBoundary><CrmGoalsPage /></ErrorBoundary>} />
                <Route path="comparativo" element={<ErrorBoundary><ComparativoPage /></ErrorBoundary>} />
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
                <Route path="/" element={<Navigate to="/financial" replace />} />
                <Route path="/dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
                <Route path="/sales" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                {/* "Minha Rotina" removida — o trabalho passou a ser pela Agenda. Redireciona links antigos. */}
                <Route path="/routine" element={<Navigate to="/agenda" replace />} />
                <Route path="/agenda" element={<ErrorBoundary><AgendaPage /></ErrorBoundary>} />
                <Route path="/financial" element={<ErrorBoundary><FinancialPage /></ErrorBoundary>} />
                <Route path="/reports" element={<ErrorBoundary><ReportPage /></ErrorBoundary>} />
                <Route path="/arquivos" element={<ErrorBoundary><ArquivosPage /></ErrorBoundary>} />
                <Route path="/settings" element={<ErrorBoundary><SettingsPage /></ErrorBoundary>} />
              </Route>
            </Route>

            {/* Catch-all: qualquer URL nao-casada vai pra um destino visivel
                em vez de renderizar <Routes> vazio (tela branca). */}
            <Route path="*" element={<Navigate to="/financial" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </ToastProvider>
  )
}

export default App

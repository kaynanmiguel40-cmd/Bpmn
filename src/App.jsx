import { Routes, Route, Navigate } from 'react-router-dom'

// Pages antigas (BPMN)
import Dashboard from './pages/Dashboard'
import Editor from './pages/Editor'

// Pages novas
import DashboardPage from './pages/dashboard/DashboardPage'
import RoutinePage from './pages/routine/RoutinePage'
import AgendaPage from './pages/agenda/AgendaPage'
import FinancialPage from './pages/financial/FinancialPage'
import SettingsPage from './pages/settings/SettingsPage'

// Layout
import MainLayout from './components/layout/MainLayout'

function App() {
  return (
    <Routes>
      {/* Rotas com novo Layout (Sidebar) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sales" element={<Dashboard />} />
        <Route path="/sales/editor/:id?" element={<Editor />} />
        <Route path="/routine" element={<RoutinePage />} />
        <Route path="/agenda" element={<AgendaPage />} />
        <Route path="/financial" element={<FinancialPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* Rota antiga mantida para compatibilidade */}
        <Route path="/editor/:id?" element={<Editor />} />
      </Route>
    </Routes>
  )
}

export default App

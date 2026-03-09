# Fyness Company OS

Sistema Operacional da Empresa com RBAC, Kanban Financeiro e Agenda.

## Arquivos Criados

### 1. Database (SQL)
- **[database/001_rbac_schema.sql](../database/001_rbac_schema.sql)** - Script SQL completo para Supabase

### 2. Contextos (React Context)
- **[src/contexts/AuthContext.jsx](../src/contexts/AuthContext.jsx)** - Autenticacao e sessao
- **[src/contexts/PermissionContext.jsx](../src/contexts/PermissionContext.jsx)** - Sistema de permissoes RBAC

### 3. Hooks
- **[src/hooks/usePermission.js](../src/hooks/usePermission.js)** - Hook para verificar permissoes

### 4. Componentes de Auth
- **[src/components/auth/Protect.jsx](../src/components/auth/Protect.jsx)** - Componente para proteger UI
- **[src/components/auth/ProtectedRoute.jsx](../src/components/auth/ProtectedRoute.jsx)** - Proteger rotas

### 5. Layout
- **[src/components/layout/Sidebar.jsx](../src/components/layout/Sidebar.jsx)** - Sidebar com navegacao
- **[src/components/layout/MainLayout.jsx](../src/components/layout/MainLayout.jsx)** - Layout principal

### 6. Kanban
- **[src/components/kanban/OSCard.jsx](../src/components/kanban/OSCard.jsx)** - Card de O.S. com Play/Pause

### 7. Paginas
- **[src/pages/auth/LoginPage.jsx](../src/pages/auth/LoginPage.jsx)** - Tela de login
- **[src/pages/dashboard/DashboardPage.jsx](../src/pages/dashboard/DashboardPage.jsx)** - Dashboard principal
- **[src/pages/routine/RoutinePage.jsx](../src/pages/routine/RoutinePage.jsx)** - Kanban de tarefas

### 8. Documentacao
- **[docs/MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Guia de migracao

---

## Setup Rapido

### 1. Executar SQL no Supabase

1. Acesse o painel do Supabase
2. Va em **SQL Editor**
3. Cole o conteudo de `database/001_rbac_schema.sql`
4. Execute o script

### 2. Habilitar Autenticacao

1. No Supabase, va em **Authentication > Providers**
2. Habilite **Email** (ja vem habilitado)
3. (Opcional) Habilite **Google** OAuth

### 3. Criar Usuario Admin

```sql
-- Apos criar um usuario via signup, execute:
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'seu@email.com';
```

### 4. Atualizar App.jsx

Substitua o conteudo de `src/App.jsx` por:

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import RoutinePage from './pages/routine/RoutinePage';
// Importe as outras paginas conforme migrar

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PermissionProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/routine" element={<RoutinePage />} />
                {/* Adicione mais rotas aqui */}
              </Route>
            </Route>
          </Routes>
        </PermissionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## Estrutura de Permissoes

### Roles Disponiveis

| Role | Descricao |
|------|-----------|
| `admin` | Acesso total ao sistema |
| `manager` | Acesso gerencial (sem admin e salarios) |
| `collaborator` | Acesso basico (tarefas, agenda, BPMN) |
| `viewer` | Apenas visualizacao |

### Permissoes por Modulo

| Modulo | Permissoes |
|--------|------------|
| Dashboard | `dashboard.view`, `dashboard.view_metrics` |
| Sales (BPMN) | `sales.access`, `sales.bpmn.edit`, `sales.bpmn.delete` |
| O.S. | `os.view`, `os.create`, `os.edit`, `os.delete`, `os.assign` |
| Financial | `financial.view`, `financial.view_costs`, `financial.view_salaries` |
| Agenda | `agenda.view`, `agenda.create`, `agenda.edit`, `agenda.delete` |
| Admin | `admin.users`, `admin.roles`, `admin.settings`, `admin.audit` |

---

## Uso dos Componentes

### Verificar Permissao no Codigo

```jsx
import { usePermission } from './hooks/usePermission';

function MyComponent() {
  const canCreate = usePermission('os.create');

  return (
    <div>
      {canCreate && <button>Criar O.S.</button>}
    </div>
  );
}
```

### Proteger Parte da UI

```jsx
import { Protect, ProtectCost } from './components/auth/Protect';

function MyComponent() {
  return (
    <div>
      {/* Botao so aparece se tiver permissao */}
      <Protect permission="os.delete">
        <button>Deletar</button>
      </Protect>

      {/* Valor so aparece para quem pode ver custos */}
      <ProtectCost>
        <span>R$ 1.500,00</span>
      </ProtectCost>
    </div>
  );
}
```

### Proteger Rota

```jsx
// No App.jsx
<Route
  element={<ProtectedRoute permission="financial.view" />}
>
  <Route path="/financial" element={<FinancialPage />} />
</Route>
```

---

## Features do OSCard

O componente `OSCard` inclui:

1. **Play/Pause Timer** - Inicia/para contagem de tempo
2. **Barra de Progresso** - Mostra tempo gasto vs estimado
3. **Indicador de Estouro** - Borda vermelha quando passar do tempo
4. **Protecao de Custos** - Valores so aparecem com permissao
5. **Avatar do Responsavel** - Mostra quem esta na tarefa

---

## Proximos Passos

1. [ ] Mover paginas BPMN existentes para nova estrutura
2. [ ] Criar pagina de Agenda com calendario
3. [ ] Criar pagina Financeira com relatorios
4. [ ] Implementar drag-and-drop no Kanban
5. [ ] Adicionar notificacoes em tempo real

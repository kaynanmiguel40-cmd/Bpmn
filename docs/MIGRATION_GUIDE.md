# Guia de Migracao - Company OS

## Visao Geral

Este guia detalha como transformar a aplicacao BPMN atual em um **Company OS** (Sistema Operacional da Empresa) com:
- Sistema RBAC (Role-Based Access Control)
- Sidebar persistente com navegacao baseada em permissoes
- Modulos: Dashboard, BPMN Sales, Kanban (O.S.), Agenda

---

## 1. Nova Estrutura de Pastas

### Estrutura Atual
```
src/
├── App.jsx
├── main.jsx
├── index.css
├── components/
│   ├── BpmnEditor.jsx
│   └── PropertiesPanel.jsx
├── pages/
│   ├── Dashboard.jsx
│   └── Editor.jsx
├── hooks/
│   └── useLocalStorage.js
├── lib/
│   └── supabase.js
└── utils/
    ├── bpmnTranslations.js
    ├── comercialTemplate.js
    └── ...
```

### Nova Estrutura (Company OS)
```
src/
├── App.jsx                    # Router principal (atualizado)
├── main.jsx                   # Entry point
├── index.css                  # Estilos globais
│
├── components/
│   ├── ui/                    # Componentes UI reutilizaveis
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── Modal.jsx
│   │   ├── Sidebar.jsx        # NOVO: Sidebar principal
│   │   ├── Toast.jsx
│   │   └── Avatar.jsx
│   │
│   ├── layout/                # NOVO: Layouts
│   │   ├── MainLayout.jsx     # Layout com Sidebar
│   │   ├── AuthLayout.jsx     # Layout para login
│   │   └── Header.jsx         # Header do app
│   │
│   ├── auth/                  # NOVO: Componentes de auth
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   │
│   ├── bpmn/                  # Componentes BPMN (movidos)
│   │   ├── BpmnEditor.jsx     # <- antigo components/BpmnEditor.jsx
│   │   └── PropertiesPanel.jsx
│   │
│   ├── kanban/                # NOVO: Componentes Kanban
│   │   ├── KanbanBoard.jsx
│   │   ├── KanbanColumn.jsx
│   │   ├── OSCard.jsx         # Card com Play/Pause
│   │   └── TimeTracker.jsx
│   │
│   └── agenda/                # NOVO: Componentes Agenda
│       ├── Calendar.jsx
│       ├── EventModal.jsx
│       └── MeetingCostBadge.jsx
│
├── pages/                     # Paginas principais
│   ├── auth/                  # NOVO
│   │   ├── LoginPage.jsx
│   │   └── RegisterPage.jsx
│   │
│   ├── dashboard/             # NOVO: Dashboard principal
│   │   └── DashboardPage.jsx
│   │
│   ├── sales/                 # BPMN Sales (movido)
│   │   ├── SalesPage.jsx      # <- antigo pages/Dashboard.jsx (renomeado)
│   │   └── EditorPage.jsx     # <- antigo pages/Editor.jsx
│   │
│   ├── routine/               # NOVO: Minha Rotina (Kanban)
│   │   └── RoutinePage.jsx
│   │
│   ├── agenda/                # NOVO: Agenda
│   │   └── AgendaPage.jsx
│   │
│   └── financial/             # NOVO: Financeiro
│       └── FinancialPage.jsx
│
├── hooks/                     # Hooks customizados
│   ├── useLocalStorage.js
│   ├── useAuth.js             # NOVO: Hook de autenticacao
│   ├── usePermission.js       # NOVO: Hook de permissoes
│   ├── useProfile.js          # NOVO: Hook de perfil
│   └── useTasks.js            # NOVO: Hook para O.S.
│
├── lib/
│   ├── supabase.js            # Cliente Supabase
│   ├── auth.js                # NOVO: Funcoes de auth
│   ├── permissions.js         # NOVO: Funcoes de permissao
│   └── api/                   # NOVO: API modules
│       ├── tasks.js
│       ├── events.js
│       └── profiles.js
│
├── utils/
│   ├── bpmnTranslations.js
│   ├── comercialTemplate.js
│   ├── fynessTemplate.js
│   ├── indicacoesTemplate.js
│   ├── customResizeProvider.js
│   ├── connectionCrossings.js
│   └── formatters.js          # NOVO: Formatadores (moeda, tempo)
│
└── contexts/                  # NOVO: React Contexts
    ├── AuthContext.jsx
    └── PermissionContext.jsx
```

---

## 2. Passo a Passo da Migracao

### Passo 1: Criar novas pastas

```bash
cd /Users/kaynanluper/Documents/Bpmn\ Sistem/src

# Criar estrutura de pastas
mkdir -p components/ui
mkdir -p components/layout
mkdir -p components/auth
mkdir -p components/bpmn
mkdir -p components/kanban
mkdir -p components/agenda
mkdir -p pages/auth
mkdir -p pages/dashboard
mkdir -p pages/sales
mkdir -p pages/routine
mkdir -p pages/agenda
mkdir -p pages/financial
mkdir -p lib/api
mkdir -p contexts
```

### Passo 2: Mover componentes BPMN

```bash
# Mover componentes BPMN existentes
mv src/components/BpmnEditor.jsx src/components/bpmn/
mv src/components/PropertiesPanel.jsx src/components/bpmn/
```

### Passo 3: Renomear/Mover paginas

```bash
# Mover Dashboard atual para Sales (e um gerenciador de flows, nao dashboard)
mv src/pages/Dashboard.jsx src/pages/sales/SalesPage.jsx

# Mover Editor para Sales
mv src/pages/Editor.jsx src/pages/sales/EditorPage.jsx
```

### Passo 4: Atualizar imports nas paginas movidas

**src/pages/sales/SalesPage.jsx**
```jsx
// Antes
import { ... } from '../lib/supabase';

// Depois
import { ... } from '../../lib/supabase';
```

**src/pages/sales/EditorPage.jsx**
```jsx
// Antes
import BpmnEditor from '../components/BpmnEditor';
import { ... } from '../lib/supabase';

// Depois
import BpmnEditor from '../../components/bpmn/BpmnEditor';
import { ... } from '../../lib/supabase';
```

**src/components/bpmn/BpmnEditor.jsx**
```jsx
// Antes
import translateModule from '../utils/bpmnTranslations';
import customResizeModule from '../utils/customResizeProvider';
import connectionCrossingsModule from '../utils/connectionCrossings';
import { COMERCIAL_DIAGRAM_XML } from '../utils/comercialTemplate';

// Depois
import translateModule from '../../utils/bpmnTranslations';
import customResizeModule from '../../utils/customResizeProvider';
import connectionCrossingsModule from '../../utils/connectionCrossings';
import { COMERCIAL_DIAGRAM_XML } from '../../utils/comercialTemplate';
```

### Passo 5: Atualizar App.jsx (Router Principal)

```jsx
// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Auth
import { AuthProvider } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';

// Layouts
import MainLayout from './components/layout/MainLayout';

// Pages
import DashboardPage from './pages/dashboard/DashboardPage';
import SalesPage from './pages/sales/SalesPage';
import EditorPage from './pages/sales/EditorPage';
import RoutinePage from './pages/routine/RoutinePage';
import AgendaPage from './pages/agenda/AgendaPage';
import FinancialPage from './pages/financial/FinancialPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PermissionProvider>
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes with MainLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/sales" element={<SalesPage />} />
                <Route path="/sales/editor/:id" element={<EditorPage />} />
                <Route path="/routine" element={<RoutinePage />} />
                <Route path="/agenda" element={<AgendaPage />} />
                <Route path="/financial" element={<FinancialPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </PermissionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
```

---

## 3. Checklist de Migracao

### Fase 1: Estrutura Base
- [ ] Criar nova estrutura de pastas
- [ ] Mover BpmnEditor.jsx para components/bpmn/
- [ ] Mover PropertiesPanel.jsx para components/bpmn/
- [ ] Mover Dashboard.jsx para pages/sales/SalesPage.jsx
- [ ] Mover Editor.jsx para pages/sales/EditorPage.jsx
- [ ] Atualizar todos os imports

### Fase 2: Autenticacao
- [ ] Executar script SQL no Supabase
- [ ] Criar AuthContext.jsx
- [ ] Criar useAuth.js hook
- [ ] Criar LoginPage.jsx
- [ ] Criar ProtectedRoute.jsx

### Fase 3: Permissoes
- [ ] Criar PermissionContext.jsx
- [ ] Criar usePermission.js hook
- [ ] Criar componente Protect.jsx
- [ ] Implementar verificacao em rotas

### Fase 4: Layout
- [ ] Criar Sidebar.jsx
- [ ] Criar MainLayout.jsx
- [ ] Criar Header.jsx
- [ ] Integrar navegacao baseada em permissoes

### Fase 5: Novos Modulos
- [ ] Criar DashboardPage.jsx
- [ ] Criar RoutinePage.jsx (Kanban)
- [ ] Criar OSCard.jsx com Play/Pause
- [ ] Criar AgendaPage.jsx
- [ ] Criar FinancialPage.jsx

---

## 4. Notas Importantes

### Sobre os imports
Ao mover arquivos de uma pasta para outra, voce precisara ajustar todos os imports relativos. Por exemplo:
- `../lib/supabase` -> `../../lib/supabase`
- `../components/X` -> `../../components/x/X`

### Sobre o Supabase
Execute o script SQL **ANTES** de implementar o frontend. As tabelas e RLS precisam existir para os hooks funcionarem.

### Sobre compatibilidade
Durante a migracao, mantenha a rota `/editor/:id` funcionando redirecionando para `/sales/editor/:id` para evitar quebrar links salvos.

---

## 5. Comandos Uteis

```bash
# Verificar imports quebrados (VSCode)
npm run build

# Encontrar todos os imports de um arquivo
grep -r "from '.*BpmnEditor'" src/

# Substituir imports em massa (com sed)
find src -name "*.jsx" -exec sed -i '' 's|from "../components/BpmnEditor"|from "../../components/bpmn/BpmnEditor"|g' {} \;
```

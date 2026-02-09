-- ============================================================
-- COMPANY OS - SCHEMA COMPLETO DE RBAC E MODULOS
-- Execute este script no SQL Editor do Supabase
-- ============================================================

-- Habilitar extensao UUID se nao existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. TABELA DE PERFIS (profiles) - Estende auth.users
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'collaborator' CHECK (role IN ('admin', 'manager', 'collaborator', 'viewer')),
    hourly_rate DECIMAL(10, 2) DEFAULT 0.00, -- Valor hora (PROTEGIDO via RLS)
    department TEXT,
    phone TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para criar profile automaticamente quando usuario se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Conectar trigger ao auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. TABELA DE PERMISSOES
-- ============================================================
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL, -- Ex: 'os.create', 'financial.view'
    description TEXT,
    module TEXT, -- Ex: 'os', 'financial', 'sales', 'agenda'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir permissoes base do sistema
INSERT INTO public.permissions (name, description, module) VALUES
    -- Dashboard
    ('dashboard.view', 'Visualizar dashboard geral', 'dashboard'),
    ('dashboard.view_metrics', 'Ver metricas detalhadas', 'dashboard'),

    -- BPMN Sales
    ('sales.access', 'Acessar modulo de vendas BPMN', 'sales'),
    ('sales.bpmn.edit', 'Editar diagramas BPMN', 'sales'),
    ('sales.bpmn.delete', 'Deletar diagramas BPMN', 'sales'),

    -- O.S. / Kanban
    ('os.view', 'Visualizar O.S.', 'os'),
    ('os.create', 'Criar novas O.S.', 'os'),
    ('os.edit', 'Editar O.S.', 'os'),
    ('os.delete', 'Deletar O.S.', 'os'),
    ('os.assign', 'Atribuir O.S. a outros usuarios', 'os'),

    -- Financeiro
    ('financial.view', 'Acessar modulo financeiro', 'financial'),
    ('financial.view_costs', 'Ver custos e valores monetarios', 'financial'),
    ('financial.view_salaries', 'Ver salarios/valor hora dos colaboradores', 'financial'),
    ('financial.reports', 'Gerar relatorios financeiros', 'financial'),

    -- Agenda
    ('agenda.view', 'Visualizar agenda', 'agenda'),
    ('agenda.create', 'Criar eventos na agenda', 'agenda'),
    ('agenda.edit', 'Editar eventos', 'agenda'),
    ('agenda.delete', 'Deletar eventos', 'agenda'),
    ('agenda.view_costs', 'Ver custo das reunioes', 'agenda'),

    -- Administracao
    ('admin.users', 'Gerenciar usuarios', 'admin'),
    ('admin.roles', 'Gerenciar roles e permissoes', 'admin'),
    ('admin.settings', 'Configuracoes do sistema', 'admin'),
    ('admin.audit', 'Visualizar logs de auditoria', 'admin')
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- 3. TABELA PIVO - ROLE -> PERMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'collaborator', 'viewer')),
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(role, permission_id)
);

-- Atribuir permissoes por role
-- ADMIN: Tudo
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions
ON CONFLICT DO NOTHING;

-- MANAGER: Quase tudo, exceto admin e salarios
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager', id FROM public.permissions
WHERE name NOT IN ('admin.users', 'admin.roles', 'admin.settings', 'financial.view_salaries')
ON CONFLICT DO NOTHING;

-- COLLABORATOR: Acesso basico, sem financeiro detalhado
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'collaborator', id FROM public.permissions
WHERE name IN (
    'dashboard.view',
    'sales.access', 'sales.bpmn.edit',
    'os.view', 'os.create', 'os.edit',
    'agenda.view', 'agenda.create', 'agenda.edit'
)
ON CONFLICT DO NOTHING;

-- VIEWER: Apenas visualizacao
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'viewer', id FROM public.permissions
WHERE name IN ('dashboard.view', 'sales.access', 'os.view', 'agenda.view')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 4. TABELA DE TASKS (O.S. - Ordens de Servico)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'doing', 'done', 'blocked')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

    -- Tempo e custo
    estimated_time INTEGER DEFAULT 0, -- Em minutos
    actual_time INTEGER DEFAULT 0, -- Calculado automaticamente
    estimated_cost DECIMAL(10, 2) DEFAULT 0.00, -- Calculado: (estimated_time/60) * hourly_rate
    actual_cost DECIMAL(10, 2) DEFAULT 0.00, -- Calculado: (actual_time/60) * hourly_rate

    -- Relacionamentos
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

    -- Tracking
    is_timer_running BOOLEAN DEFAULT FALSE,
    timer_started_at TIMESTAMPTZ,

    -- Metadados
    due_date DATE,
    tags TEXT[],
    order_index INTEGER DEFAULT 0, -- Para ordenar no Kanban
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. TABELA DE TIME ENTRIES (Registro de Tempo)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.time_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INTEGER, -- Calculado ao finalizar
    hourly_rate_snapshot DECIMAL(10, 2), -- Snapshot do valor hora no momento
    cost DECIMAL(10, 2), -- (duration_minutes/60) * hourly_rate_snapshot
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. TABELA DE EVENTOS/REUNIOES (Agenda)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    event_type TEXT DEFAULT 'meeting' CHECK (event_type IN ('meeting', 'task', 'reminder', 'deadline', 'other')),

    -- Datas
    start_datetime TIMESTAMPTZ NOT NULL,
    end_datetime TIMESTAMPTZ NOT NULL,
    all_day BOOLEAN DEFAULT FALSE,

    -- Recorrencia (opcional)
    recurrence_rule TEXT, -- iCal RRULE format
    recurrence_end DATE,

    -- Custo da reuniao
    total_cost DECIMAL(10, 2) DEFAULT 0.00, -- Soma dos hourly_rate * duracao de todos participantes

    -- Relacionamentos
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL,

    -- Metadados
    location TEXT,
    meeting_link TEXT,
    color TEXT DEFAULT '#3b82f6',
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. TABELA DE PARTICIPANTES DE EVENTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS public.event_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'tentative')),
    hourly_rate_snapshot DECIMAL(10, 2), -- Snapshot do valor hora
    cost_contribution DECIMAL(10, 2), -- Custo individual deste participante
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);

-- ============================================================
-- 8. TABELA DE AUDIT LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'create', 'update', 'delete'
    entity_type TEXT NOT NULL, -- 'task', 'event', 'project', etc
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- === PROFILES ===

-- Todos podem ver perfis basicos (sem hourly_rate)
CREATE POLICY "profiles_select_basic" ON public.profiles
    FOR SELECT USING (true);

-- Usuario pode atualizar seu proprio perfil (exceto role e hourly_rate)
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Admins podem atualizar qualquer perfil
CREATE POLICY "profiles_update_admin" ON public.profiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- View especial que esconde hourly_rate para nao-admins
CREATE OR REPLACE VIEW public.profiles_safe AS
SELECT
    id,
    email,
    full_name,
    avatar_url,
    role,
    CASE
        WHEN EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        ) OR id = auth.uid()
        THEN hourly_rate
        ELSE NULL
    END as hourly_rate,
    department,
    phone,
    is_active,
    created_at,
    updated_at
FROM public.profiles;

-- === PERMISSIONS ===
CREATE POLICY "permissions_select" ON public.permissions
    FOR SELECT USING (true);

-- === ROLE_PERMISSIONS ===
CREATE POLICY "role_permissions_select" ON public.role_permissions
    FOR SELECT USING (true);

-- === TASKS ===

-- Usuarios veem suas proprias tasks ou tasks da mesma empresa
CREATE POLICY "tasks_select" ON public.tasks
    FOR SELECT USING (
        assigned_to = auth.uid()
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Usuarios podem criar tasks
CREATE POLICY "tasks_insert" ON public.tasks
    FOR INSERT WITH CHECK (true);

-- Usuarios podem editar tasks atribuidas a eles ou criadas por eles
CREATE POLICY "tasks_update" ON public.tasks
    FOR UPDATE USING (
        assigned_to = auth.uid()
        OR created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Apenas admins/managers podem deletar
CREATE POLICY "tasks_delete" ON public.tasks
    FOR DELETE USING (
        created_by = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- === TIME_ENTRIES ===

-- Usuarios veem suas proprias entradas de tempo
CREATE POLICY "time_entries_select" ON public.time_entries
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- Usuarios podem criar suas proprias entradas
CREATE POLICY "time_entries_insert" ON public.time_entries
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Usuarios podem editar suas proprias entradas
CREATE POLICY "time_entries_update" ON public.time_entries
    FOR UPDATE USING (user_id = auth.uid());

-- === EVENTS ===

-- Todos veem eventos (exceto privados)
CREATE POLICY "events_select" ON public.events
    FOR SELECT USING (
        NOT is_private
        OR organizer_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.event_participants
            WHERE event_id = events.id AND user_id = auth.uid()
        )
    );

-- Usuarios podem criar eventos
CREATE POLICY "events_insert" ON public.events
    FOR INSERT WITH CHECK (true);

-- Organizador ou admin pode editar
CREATE POLICY "events_update" ON public.events
    FOR UPDATE USING (
        organizer_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role IN ('admin', 'manager')
        )
    );

-- === EVENT_PARTICIPANTS ===
CREATE POLICY "event_participants_select" ON public.event_participants
    FOR SELECT USING (true);

CREATE POLICY "event_participants_insert" ON public.event_participants
    FOR INSERT WITH CHECK (true);

CREATE POLICY "event_participants_update" ON public.event_participants
    FOR UPDATE USING (user_id = auth.uid());

-- === AUDIT_LOG ===
CREATE POLICY "audit_log_select" ON public.audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "audit_log_insert" ON public.audit_log
    FOR INSERT WITH CHECK (true);

-- ============================================================
-- 10. FUNCOES AUXILIARES
-- ============================================================

-- Funcao para verificar se usuario tem permissao
CREATE OR REPLACE FUNCTION public.has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();

    IF user_role IS NULL THEN
        RETURN FALSE;
    END IF;

    RETURN EXISTS (
        SELECT 1
        FROM public.role_permissions rp
        JOIN public.permissions p ON p.id = rp.permission_id
        WHERE rp.role = user_role AND p.name = permission_name
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcao para obter todas as permissoes do usuario atual
CREATE OR REPLACE FUNCTION public.get_user_permissions()
RETURNS TABLE (permission_name TEXT, module TEXT) AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();

    RETURN QUERY
    SELECT p.name, p.module
    FROM public.role_permissions rp
    JOIN public.permissions p ON p.id = rp.permission_id
    WHERE rp.role = user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcao para calcular custo de uma task
CREATE OR REPLACE FUNCTION public.calculate_task_cost(task_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_cost DECIMAL := 0;
BEGIN
    SELECT COALESCE(SUM(cost), 0) INTO total_cost
    FROM public.time_entries
    WHERE time_entries.task_id = calculate_task_cost.task_id;

    RETURN total_cost;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcao para finalizar time entry e calcular custo
CREATE OR REPLACE FUNCTION public.stop_time_entry(entry_id UUID)
RETURNS public.time_entries AS $$
DECLARE
    entry public.time_entries;
    hourly_rate DECIMAL;
    duration INTEGER;
    entry_cost DECIMAL;
BEGIN
    -- Buscar entry
    SELECT * INTO entry FROM public.time_entries WHERE id = entry_id;

    IF entry.end_time IS NOT NULL THEN
        RETURN entry;
    END IF;

    -- Buscar hourly_rate do usuario
    SELECT COALESCE(profiles.hourly_rate, 0) INTO hourly_rate
    FROM public.profiles WHERE id = entry.user_id;

    -- Calcular duracao em minutos
    duration := EXTRACT(EPOCH FROM (NOW() - entry.start_time)) / 60;

    -- Calcular custo
    entry_cost := (duration / 60.0) * hourly_rate;

    -- Atualizar entry
    UPDATE public.time_entries
    SET
        end_time = NOW(),
        duration_minutes = duration,
        hourly_rate_snapshot = hourly_rate,
        cost = entry_cost
    WHERE id = entry_id
    RETURNING * INTO entry;

    -- Atualizar actual_time e actual_cost na task
    UPDATE public.tasks
    SET
        actual_time = (
            SELECT COALESCE(SUM(duration_minutes), 0)
            FROM public.time_entries te
            WHERE te.task_id = entry.task_id
        ),
        actual_cost = (
            SELECT COALESCE(SUM(cost), 0)
            FROM public.time_entries te
            WHERE te.task_id = entry.task_id
        ),
        is_timer_running = FALSE,
        timer_started_at = NULL,
        updated_at = NOW()
    WHERE id = entry.task_id;

    RETURN entry;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Funcao para calcular custo de uma reuniao
CREATE OR REPLACE FUNCTION public.calculate_event_cost(event_id UUID)
RETURNS DECIMAL AS $$
DECLARE
    event_record public.events;
    duration_hours DECIMAL;
    total_cost DECIMAL := 0;
BEGIN
    SELECT * INTO event_record FROM public.events WHERE id = event_id;

    -- Calcular duracao em horas
    duration_hours := EXTRACT(EPOCH FROM (event_record.end_datetime - event_record.start_datetime)) / 3600;

    -- Somar custo de todos os participantes
    SELECT COALESCE(SUM(
        COALESCE(ep.hourly_rate_snapshot, p.hourly_rate, 0) * duration_hours
    ), 0) INTO total_cost
    FROM public.event_participants ep
    JOIN public.profiles p ON p.id = ep.user_id
    WHERE ep.event_id = calculate_event_cost.event_id;

    -- Atualizar custo individual de cada participante
    UPDATE public.event_participants ep
    SET cost_contribution = COALESCE(ep.hourly_rate_snapshot, (
        SELECT hourly_rate FROM public.profiles WHERE id = ep.user_id
    ), 0) * duration_hours
    WHERE ep.event_id = calculate_event_cost.event_id;

    -- Atualizar custo total do evento
    UPDATE public.events
    SET total_cost = total_cost, updated_at = NOW()
    WHERE id = event_id;

    RETURN total_cost;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas relevantes
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.tasks;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.tasks
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.events;
CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- 11. INDICES PARA PERFORMANCE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_company_id ON public.tasks(company_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_task_id ON public.time_entries(task_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_events_start_datetime ON public.events(start_datetime);
CREATE INDEX IF NOT EXISTS idx_events_organizer_id ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON public.audit_log(entity_type, entity_id);

-- ============================================================
-- FIM DO SCRIPT
-- ============================================================

/**
 * REPRO: bug do redirect ao abrir conversa do Inbox.
 * Renderiza a CADEIA REAL: MemoryRouter -> providers reais -> ProtectedRoute -> CrmLayout -> CrmInboxPage.
 *
 * Mocka SOMENTE o supabase client (src/lib/supabaseClient) pra controlar auth e dados.
 * Um LocationSpy loga toda mudanca de URL. Rotas-marcador (LOGIN_PAGE etc.) identificam
 * pra onde o app foi parar.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// ----------------------------------------------------------------------------
// Estado controlavel do mock de auth.
// authCallback guarda o callback do onAuthStateChange pra simular eventos.
// ----------------------------------------------------------------------------
// jsdom nao tem matchMedia (usado pelo ThemeProvider)
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
  }));
}

const TEST_USER = { id: '00000000-0000-0000-0000-000000000001', email: 'teste@fyness.com' };
let authCallback = null;
let sessionToReturn = { user: TEST_USER, access_token: 'fake' };

// Builder de query encadeavel que sempre resolve (thenable).
function makeQueryBuilder(resultFactory) {
  const builder = {
    select: () => builder,
    is: () => builder,
    eq: () => builder,
    in: () => builder,
    order: () => builder,
    limit: () => builder,
    single: () => builder,
    update: () => builder,
    abortSignal: () => builder,
    then: (resolve) => resolve(resultFactory()),
  };
  return builder;
}

// Dados por tabela. profiles -> perfil admin. crm_messages/instances -> vazio (nao importa pro redirect).
function resultForTable(table) {
  if (table === 'profiles') {
    return { data: { id: TEST_USER.id, role: 'admin', full_name: 'Teste' }, error: null };
  }
  return { data: [], error: null };
}

const channelStub = {
  on: () => channelStub,
  subscribe: () => channelStub,
};

vi.mock('../../../lib/supabaseClient', () => {
  const supabase = {
    auth: {
      getSession: vi.fn(async () => ({ data: { session: sessionToReturn } })),
      getUser: vi.fn(async () => ({ data: { user: sessionToReturn?.user || null } })),
      onAuthStateChange: vi.fn((cb) => {
        authCallback = cb;
        return { data: { subscription: { unsubscribe: () => {} } } };
      }),
      signOut: vi.fn(async () => ({ error: null })),
    },
    from: vi.fn((table) => makeQueryBuilder(() => resultForTable(table))),
    rpc: vi.fn(async () => ({ data: null, error: null })),
    channel: vi.fn(() => channelStub),
    removeChannel: vi.fn(),
    functions: { invoke: vi.fn(async () => ({ data: { ok: true } })) },
  };
  return { supabase };
});

// src/lib/supabase reexporta supabaseClient — garante que tudo aponte pro mock.
vi.mock('../../../lib/supabase', async () => {
  const mod = await import('../../../lib/supabaseClient');
  return { supabase: mod.supabase };
});

// Imports REAIS depois dos mocks
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { AuthProvider } from '../../../contexts/AuthContext';
import { PermissionProvider } from '../../../contexts/PermissionContext';
import { ToastProvider } from '../../../contexts/ToastContext';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { CrmLayout } from '../../../modules/crm/components/layout/CrmLayout';
import { CrmInboxPage } from '../../../modules/crm/pages/CrmInboxPage';

const locationLog = [];
function LocationSpy() {
  const loc = useLocation();
  React.useEffect(() => {
    const entry = loc.pathname + loc.search;
    locationLog.push(entry);
    // eslint-disable-next-line no-console
    console.log('[LOCATION]', entry);
  }, [loc.pathname, loc.search]);
  return null;
}

function Marker({ name }) {
  return <div data-testid={name}>{name}</div>;
}

function renderChain(initialEntry) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ToastProvider>
        <QueryClientProvider client={qc}>
          <ThemeProvider>
            <AuthProvider>
              <PermissionProvider>
                <LocationSpy />
                <Routes>
                  <Route path="/login" element={<Marker name="LOGIN_PAGE" />} />
                  <Route path="/unauthorized" element={<Marker name="UNAUTHORIZED_PAGE" />} />
                  <Route path="/financial" element={<Marker name="FINANCIAL_PAGE" />} />
                  <Route element={<ProtectedRoute />}>
                    <Route path="/crm" element={<CrmLayout />}>
                      <Route path="inbox" element={<CrmInboxPage />} />
                      <Route index element={<Marker name="CRM_DASHBOARD" />} />
                    </Route>
                  </Route>
                  <Route path="*" element={<Marker name="CATCH_ALL" />} />
                </Routes>
              </PermissionProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe('Inbox redirect repro (cadeia completa)', () => {
  beforeEach(() => {
    locationLog.length = 0;
    authCallback = null;
    sessionToReturn = { user: TEST_USER, access_token: 'fake' };
  });

  it('CASO 1: sessao valida estavel — deve ficar em /crm/inbox', async () => {
    renderChain('/crm/inbox?prospect=f6e18e8e-ad1f-4ca1-8ed7-c3281a127181');

    // Espera o ProtectedRoute resolver (sair do "Carregando...")
    await waitFor(() => {
      expect(document.body.textContent).toContain('Conversas');
    }, { timeout: 5000 });

    const final = locationLog[locationLog.length - 1];
    console.log('[FINAL CASO 1]', final, '| log:', JSON.stringify(locationLog));
    expect(final).toBe('/crm/inbox?prospect=f6e18e8e-ad1f-4ca1-8ed7-c3281a127181');
    expect(screen.queryByTestId('LOGIN_PAGE')).toBeNull();
  });

  it('CASO 2: SIGNED_OUT chega depois (token expira / 401) — redireciona?', async () => {
    renderChain('/crm/inbox?prospect=f6e18e8e-ad1f-4ca1-8ed7-c3281a127181');

    await waitFor(() => {
      expect(document.body.textContent).toContain('Conversas');
    }, { timeout: 5000 });

    console.log('[ANTES DO SIGNED_OUT]', locationLog[locationLog.length - 1]);

    // Simula o supabase emitindo SIGNED_OUT (refresh de token falhou / 401)
    await waitFor(() => expect(authCallback).toBeTypeOf('function'));
    await React.act(async () => {
      sessionToReturn = null;
      await authCallback('SIGNED_OUT', null);
    });

    await waitFor(() => {
      const final = locationLog[locationLog.length - 1];
      console.log('[FINAL CASO 2]', final, '| log:', JSON.stringify(locationLog));
      expect(final).not.toContain('/crm/inbox');
    }, { timeout: 3000 });

    expect(screen.queryByTestId('LOGIN_PAGE')).not.toBeNull();
  });

  it('CASO 3 (REGRESSAO DO FIX): TOKEN_REFRESHED com session=null NAO deve deslogar — fica no inbox', async () => {
    renderChain('/crm/inbox?prospect=f6e18e8e-ad1f-4ca1-8ed7-c3281a127181');

    await waitFor(() => {
      expect(document.body.textContent).toContain('Conversas');
    }, { timeout: 5000 });

    await waitFor(() => expect(authCallback).toBeTypeOf('function'));
    // session=null mas a sessao NAO acabou de verdade — getSession ainda devolve user.
    await React.act(async () => {
      await authCallback('TOKEN_REFRESHED', null);
    });

    // Da tempo de qualquer redirect espurio acontecer.
    await new Promise((r) => setTimeout(r, 50));

    const final = locationLog[locationLog.length - 1];
    console.log('[FINAL CASO 3]', final, '| log:', JSON.stringify(locationLog));
    expect(final).toContain('/crm/inbox'); // continua no inbox, NAO foi pro /login
    expect(screen.queryByTestId('LOGIN_PAGE')).toBeNull();
  });

  it('CASO 4 (REGRESSAO DO FIX): USER_UPDATED com session=null NAO deve deslogar', async () => {
    renderChain('/crm/inbox?prospect=f6e18e8e-ad1f-4ca1-8ed7-c3281a127181');

    await waitFor(() => {
      expect(document.body.textContent).toContain('Conversas');
    }, { timeout: 5000 });

    await waitFor(() => expect(authCallback).toBeTypeOf('function'));
    await React.act(async () => {
      await authCallback('USER_UPDATED', null);
    });

    await new Promise((r) => setTimeout(r, 50));

    const final = locationLog[locationLog.length - 1];
    console.log('[FINAL CASO 4]', final);
    expect(final).toContain('/crm/inbox');
    expect(screen.queryByTestId('LOGIN_PAGE')).toBeNull();
  });
});

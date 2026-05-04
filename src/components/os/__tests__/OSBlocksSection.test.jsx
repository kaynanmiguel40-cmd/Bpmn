import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// ==================== MOCKS ====================

const { mockBlocks, mockTeamMembers, blocksApi, sigsApi } = vi.hoisted(() => ({
  mockBlocks: { current: [] },
  mockTeamMembers: { current: [] },
  blocksApi: {
    createBlock: vi.fn(async (block) => ({ id: 'b_new', ...block })),
    updateBlock: vi.fn(async (id, updates) => ({ id, ...updates })),
    deleteBlock: vi.fn().mockResolvedValue(true),
    setBlockStatus: vi.fn().mockResolvedValue(true),
    ensureBlocksForOrder: vi.fn().mockResolvedValue([]),
  },
  sigsApi: {
    signOrder: vi.fn().mockResolvedValue({ id: 's1', orderId: 'os_1', userId: 'u_k', userName: 'Kaynan', signedAt: '2026-04-27T10:00:00Z' }),
    unsignOrder: vi.fn().mockResolvedValue(true),
    getSignaturesByOrder: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../../hooks/queries', () => ({
  useOSBlocks: () => ({ data: mockBlocks.current, isLoading: false }),
  useTeamMembers: () => ({ data: mockTeamMembers.current }),
}));

vi.mock('../../../lib/osBlocksService', () => blocksApi);
vi.mock('../../../lib/osSignaturesService', () => sigsApi);

// ==================== IMPORT ====================

import OSBlocksSection from '../OSBlocksSection';

// ==================== HELPERS ====================

async function renderWithQuery(ui) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  let result;
  await act(async () => {
    result = render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>);
  });
  // Aguarda o useEffect de getSignaturesByOrder resolver
  await waitFor(() => expect(sigsApi.getSignaturesByOrder).toHaveBeenCalled());
  return result;
}

const baseOrder = { id: 'os_1', title: 'Semana 17', assignee: 'Robert' };

beforeEach(() => {
  vi.clearAllMocks();
  mockBlocks.current = [];
  mockTeamMembers.current = [];
  sigsApi.getSignaturesByOrder.mockResolvedValue([]);
});

// ==================== RENDER BASICO ====================

describe('OSBlocksSection — render', () => {
  it('mostra placeholder quando nao tem blocos', async () => {
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);
    expect(screen.getByText(/Nenhum bloco ainda/i)).toBeInTheDocument();
  });

  it('lista cada bloco com titulo, responsavel e tempo previsto', async () => {
    mockBlocks.current = [
      { id: 'b1', orderId: 'os_1', title: 'Marketing', assigneeName: 'Elias', estimatedMinutes: 90, status: 'todo', sortOrder: 0 },
      { id: 'b2', orderId: 'os_1', title: 'Producao', assigneeName: 'Kaua', estimatedMinutes: 120, status: 'doing', sortOrder: 1 },
    ];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);
    expect(screen.getByText('Marketing')).toBeInTheDocument();
    expect(screen.getByText('Elias')).toBeInTheDocument();
    expect(screen.getByText('Producao')).toBeInTheDocument();
    expect(screen.getByText('Kaua')).toBeInTheDocument();
    // formatMinutes(90) = "1h30"
    expect(screen.getByText(/1h30/)).toBeInTheDocument();
    // formatMinutes(120) = "2h"
    expect(screen.getByText(/2h/)).toBeInTheDocument();
  });

  it('mostra contagem de blocos e total previsto', async () => {
    mockBlocks.current = [
      { id: 'b1', orderId: 'os_1', title: 'A', estimatedMinutes: 60, status: 'todo', sortOrder: 0 },
      { id: 'b2', orderId: 'os_1', title: 'B', estimatedMinutes: 30, status: 'todo', sortOrder: 1 },
    ];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);
    expect(screen.getByText(/2 blocos/i)).toBeInTheDocument();
    expect(screen.getByText(/Total previsto: 1h30/i)).toBeInTheDocument();
  });

  it('singular "1 bloco" quando ha apenas 1', async () => {
    mockBlocks.current = [{ id: 'b1', orderId: 'os_1', title: 'A', estimatedMinutes: 60, status: 'todo', sortOrder: 0 }];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);
    expect(screen.getByText(/^1 bloco$/)).toBeInTheDocument();
  });

  it('filtra blocos por orderId (nao mistura entre O.S.)', async () => {
    mockBlocks.current = [
      { id: 'b1', orderId: 'os_1', title: 'Meu', status: 'todo', sortOrder: 0 },
      { id: 'b2', orderId: 'os_OUTRO', title: 'Outra', status: 'todo', sortOrder: 0 },
    ];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);
    expect(screen.getByText('Meu')).toBeInTheDocument();
    expect(screen.queryByText('Outra')).not.toBeInTheDocument();
  });
});

// ==================== ADICIONAR BLOCO ====================

describe('OSBlocksSection — adicionar bloco', () => {
  it('mostra form ao clicar em "+ Adicionar bloco"', async () => {
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);
    fireEvent.click(screen.getByText(/Adicionar bloco/i));
    expect(screen.getByPlaceholderText(/Titulo do bloco/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Horas/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Minutos/i)).toBeInTheDocument();
  });

  it('converte horas+minutos em estimatedMinutes corretamente (1h30 -> 90)', async () => {
    mockTeamMembers.current = [{ id: 'tm_1', userId: 'u_elias', name: 'Elias' }];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);

    fireEvent.click(screen.getByText(/Adicionar bloco/i));
    fireEvent.change(screen.getByPlaceholderText(/Titulo do bloco/i), { target: { value: 'Marketing' } });
    fireEvent.change(screen.getByPlaceholderText(/Horas/i), { target: { value: '1' } });
    fireEvent.change(screen.getByPlaceholderText(/Minutos/i), { target: { value: '30' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'tm_1' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Adicionar', { selector: 'button' }));
    });

    expect(blocksApi.createBlock).toHaveBeenCalledTimes(1);
    const payload = blocksApi.createBlock.mock.calls[0][0];
    expect(payload).toMatchObject({
      orderId: 'os_1',
      title: 'Marketing',
      assigneeId: 'u_elias',
      assigneeName: 'Elias',
      estimatedMinutes: 90,
      status: 'todo',
    });
  });

  it('nao envia se titulo vazio', async () => {
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);
    fireEvent.click(screen.getByText(/Adicionar bloco/i));
    const btn = screen.getByText('Adicionar', { selector: 'button' });
    expect(btn).toBeDisabled();
  });

  it('aceita 0 horas + apenas minutos (45 min)', async () => {
    mockTeamMembers.current = [{ id: 'tm_1', userId: 'u_elias', name: 'Elias' }];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);

    fireEvent.click(screen.getByText(/Adicionar bloco/i));
    fireEvent.change(screen.getByPlaceholderText(/Titulo do bloco/i), { target: { value: 'Quick' } });
    fireEvent.change(screen.getByPlaceholderText(/Minutos/i), { target: { value: '45' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Adicionar', { selector: 'button' }));
    });

    expect(blocksApi.createBlock.mock.calls[0][0].estimatedMinutes).toBe(45);
  });

  it('aceita criar bloco SEM responsavel (assigneeId/Name vazios)', async () => {
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);
    fireEvent.click(screen.getByText(/Adicionar bloco/i));
    fireEvent.change(screen.getByPlaceholderText(/Titulo do bloco/i), { target: { value: 'Sem dono' } });

    await act(async () => {
      fireEvent.click(screen.getByText('Adicionar', { selector: 'button' }));
    });

    expect(blocksApi.createBlock).toHaveBeenCalledTimes(1);
    expect(blocksApi.createBlock.mock.calls[0][0].assigneeId).toBeNull();
    expect(blocksApi.createBlock.mock.calls[0][0].assigneeName).toBe('');
  });

  it('cancela limpa o form', async () => {
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);
    fireEvent.click(screen.getByText(/Adicionar bloco/i));
    fireEvent.change(screen.getByPlaceholderText(/Titulo do bloco/i), { target: { value: 'X' } });
    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.queryByPlaceholderText(/Titulo do bloco/i)).not.toBeInTheDocument();
  });
});

// ==================== TROCAR STATUS ====================

describe('OSBlocksSection — toggle status', () => {
  it('clique no badge avanca todo -> doing', async () => {
    mockBlocks.current = [{ id: 'b1', orderId: 'os_1', title: 'Marketing', estimatedMinutes: 60, status: 'todo', sortOrder: 0 }];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);

    await act(async () => {
      fireEvent.click(screen.getByText('A fazer'));
    });

    expect(blocksApi.setBlockStatus).toHaveBeenCalledWith('b1', 'doing');
  });

  it('clique no badge avanca doing -> done', async () => {
    mockBlocks.current = [{ id: 'b1', orderId: 'os_1', title: 'X', status: 'doing', sortOrder: 0 }];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);

    await act(async () => {
      fireEvent.click(screen.getByText('Fazendo'));
    });

    expect(blocksApi.setBlockStatus).toHaveBeenCalledWith('b1', 'done');
  });

  it('clique no badge done -> todo (volta ao inicio)', async () => {
    mockBlocks.current = [{ id: 'b1', orderId: 'os_1', title: 'X', status: 'done', sortOrder: 0 }];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);

    await act(async () => {
      fireEvent.click(screen.getByText('Feito'));
    });

    expect(blocksApi.setBlockStatus).toHaveBeenCalledWith('b1', 'todo');
  });
});

// ==================== READ-ONLY ====================

describe('OSBlocksSection — modo read-only (canEdit=false)', () => {
  it('nao mostra botao "+ Adicionar bloco"', async () => {
    mockBlocks.current = [{ id: 'b1', orderId: 'os_1', title: 'X', status: 'todo', sortOrder: 0 }];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit={false} currentUserId="u_k" currentUserName="Kaynan" />);
    expect(screen.queryByText(/Adicionar bloco/i)).not.toBeInTheDocument();
  });

  it('toggle de status fica desabilitado (clique nao chama setBlockStatus)', async () => {
    mockBlocks.current = [{ id: 'b1', orderId: 'os_1', title: 'X', status: 'todo', sortOrder: 0 }];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit={false} currentUserId="u_k" currentUserName="Kaynan" />);
    const badge = screen.getByText('A fazer');
    expect(badge).toBeDisabled();
    fireEvent.click(badge);
    expect(blocksApi.setBlockStatus).not.toHaveBeenCalled();
  });

  it('nao mostra X de remover', async () => {
    mockBlocks.current = [{ id: 'b1', orderId: 'os_1', title: 'X', status: 'todo', sortOrder: 0 }];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit={false} currentUserId="u_k" currentUserName="Kaynan" />);
    expect(screen.queryByTitle(/Remover bloco/i)).not.toBeInTheDocument();
  });
});

// ==================== ASSINATURAS ====================

describe('OSBlocksSection — assinaturas', () => {
  it('botao "Assinar O.S." fica desabilitado quando algum bloco != done', async () => {
    mockBlocks.current = [
      { id: 'b1', orderId: 'os_1', title: 'X', status: 'done', sortOrder: 0 },
      { id: 'b2', orderId: 'os_1', title: 'Y', status: 'doing', sortOrder: 1 },
    ];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);
    expect(screen.getByText(/Assinar O.S./i)).toBeDisabled();
  });

  it('botao "Assinar O.S." habilitado quando todos done', async () => {
    mockBlocks.current = [
      { id: 'b1', orderId: 'os_1', title: 'X', status: 'done', sortOrder: 0 },
      { id: 'b2', orderId: 'os_1', title: 'Y', status: 'done', sortOrder: 1 },
    ];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);
    expect(screen.getByText(/Assinar O.S./i)).not.toBeDisabled();
  });

  it('clique em "Assinar O.S." chama signOrder com user_id e user_name', async () => {
    mockBlocks.current = [{ id: 'b1', orderId: 'os_1', title: 'X', status: 'done', sortOrder: 0 }];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);

    await waitFor(() => expect(sigsApi.getSignaturesByOrder).toHaveBeenCalled());
    await act(async () => {
      fireEvent.click(screen.getByText(/Assinar O.S./i));
    });

    expect(sigsApi.signOrder).toHaveBeenCalledWith({
      orderId: 'os_1',
      userId: 'u_k',
      userName: 'Kaynan',
    });
  });

  it('mostra "Desfazer assinatura" se usuario ja assinou', async () => {
    mockBlocks.current = [{ id: 'b1', orderId: 'os_1', title: 'X', status: 'done', sortOrder: 0 }];
    sigsApi.getSignaturesByOrder.mockResolvedValue([
      { id: 's1', orderId: 'os_1', userId: 'u_k', userName: 'Kaynan', signedAt: '2026-04-27T10:00:00Z' },
    ]);
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);

    await waitFor(() => {
      expect(screen.getByText(/Desfazer assinatura/i)).toBeInTheDocument();
    });
  });

  it('lista chips com nome de cada participante que assinou', async () => {
    mockBlocks.current = [{ id: 'b1', orderId: 'os_1', title: 'X', status: 'done', sortOrder: 0 }];
    sigsApi.getSignaturesByOrder.mockResolvedValue([
      { id: 's1', orderId: 'os_1', userId: 'u_k', userName: 'Kaynan', signedAt: '2026-04-27T10:00:00Z' },
      { id: 's2', orderId: 'os_1', userId: 'u_r', userName: 'Robert', signedAt: '2026-04-27T11:00:00Z' },
    ]);
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);

    await waitFor(() => {
      expect(screen.getByText('Kaynan')).toBeInTheDocument();
      expect(screen.getByText('Robert')).toBeInTheDocument();
    });
  });

  it('mostra contagem "X de Y participantes" baseada em assigneeIds unicos', async () => {
    mockBlocks.current = [
      { id: 'b1', orderId: 'os_1', title: 'A', assigneeId: 'u_k', assigneeName: 'Kaynan', status: 'done', sortOrder: 0 },
      { id: 'b2', orderId: 'os_1', title: 'B', assigneeId: 'u_r', assigneeName: 'Robert', status: 'done', sortOrder: 1 },
      { id: 'b3', orderId: 'os_1', title: 'C', assigneeId: 'u_k', assigneeName: 'Kaynan', status: 'done', sortOrder: 2 },
    ];
    sigsApi.getSignaturesByOrder.mockResolvedValue([
      { id: 's1', orderId: 'os_1', userId: 'u_k', userName: 'Kaynan', signedAt: '2026-04-27T10:00:00Z' },
    ]);
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);

    await waitFor(() => {
      // 2 participantes unicos (u_k, u_r), 1 assinatura
      expect(screen.getByText(/1 de 2 participantes/i)).toBeInTheDocument();
    });
  });

  it('mostra "Todos assinaram" quando todos participantes assinaram', async () => {
    mockBlocks.current = [
      { id: 'b1', orderId: 'os_1', title: 'A', assigneeId: 'u_k', assigneeName: 'Kaynan', status: 'done', sortOrder: 0 },
      { id: 'b2', orderId: 'os_1', title: 'B', assigneeId: 'u_r', assigneeName: 'Robert', status: 'done', sortOrder: 1 },
    ];
    sigsApi.getSignaturesByOrder.mockResolvedValue([
      { id: 's1', orderId: 'os_1', userId: 'u_k', userName: 'Kaynan', signedAt: '2026-04-27T10:00:00Z' },
      { id: 's2', orderId: 'os_1', userId: 'u_r', userName: 'Robert', signedAt: '2026-04-27T11:00:00Z' },
    ]);
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);

    await waitFor(() => {
      expect(screen.getByText(/Todos assinaram/i)).toBeInTheDocument();
    });
  });

  it('clique em "Desfazer assinatura" chama unsignOrder', async () => {
    mockBlocks.current = [{ id: 'b1', orderId: 'os_1', title: 'X', status: 'done', sortOrder: 0 }];
    sigsApi.getSignaturesByOrder.mockResolvedValue([
      { id: 's1', orderId: 'os_1', userId: 'u_k', userName: 'Kaynan', signedAt: '2026-04-27T10:00:00Z' },
    ]);
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);

    await waitFor(() => screen.getByText(/Desfazer assinatura/i));
    await act(async () => {
      fireEvent.click(screen.getByText(/Desfazer assinatura/i));
    });

    expect(sigsApi.unsignOrder).toHaveBeenCalledWith({ orderId: 'os_1', userId: 'u_k' });
  });
});

// ==================== MIGRACAO SILENCIOSA ====================

describe('OSBlocksSection — migracao silenciosa', () => {
  it('chama ensureBlocksForOrder quando O.S. nao tem blocos', async () => {
    mockBlocks.current = [];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);
    await waitFor(() => {
      expect(blocksApi.ensureBlocksForOrder).toHaveBeenCalledWith(baseOrder);
    });
  });

  it('NAO chama ensureBlocksForOrder se ja tem blocos', async () => {
    mockBlocks.current = [{ id: 'b1', orderId: 'os_1', title: 'X', status: 'todo', sortOrder: 0 }];
    await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);
    // Aguardar microtasks
    await waitFor(() => {
      expect(screen.getByText('X')).toBeInTheDocument();
    });
    expect(blocksApi.ensureBlocksForOrder).not.toHaveBeenCalled();
  });
});

// ==================== ORDENACAO ====================

describe('OSBlocksSection — ordenacao', () => {
  it('renderiza blocos em ordem de sortOrder ASC', async () => {
    mockBlocks.current = [
      { id: 'b3', orderId: 'os_1', title: 'Terceiro', status: 'todo', sortOrder: 2 },
      { id: 'b1', orderId: 'os_1', title: 'Primeiro', status: 'todo', sortOrder: 0 },
      { id: 'b2', orderId: 'os_1', title: 'Segundo', status: 'todo', sortOrder: 1 },
    ];
    const { container } = await renderWithQuery(<OSBlocksSection order={baseOrder} canEdit currentUserId="u_k" currentUserName="Kaynan" />);
    const titles = within(container).getAllByText(/Primeiro|Segundo|Terceiro/);
    expect(titles.map(t => t.textContent)).toEqual(['Primeiro', 'Segundo', 'Terceiro']);
  });
});

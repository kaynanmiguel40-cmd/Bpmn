import { describe, it, expect, vi, beforeEach } from 'vitest';

// ==================== MOCKS ====================

const mockWriteFile = vi.fn();
const mockBookNew = vi.fn().mockReturnValue({ SheetNames: [], Sheets: {} });
const mockAoaToSheet = vi.fn().mockReturnValue({});
const mockBookAppendSheet = vi.fn();

vi.mock('xlsx', () => ({
  utils: {
    book_new: () => mockBookNew(),
    aoa_to_sheet: (...args) => mockAoaToSheet(...args),
    book_append_sheet: (...args) => mockBookAppendSheet(...args),
  },
  writeFile: (...args) => mockWriteFile(...args),
}));

import { exportOSToExcel, exportKPIsToExcel } from '../excelExporter';

describe('exportOSToExcel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cria 3 abas: Resumo, Detalhado, Custos', () => {
    exportOSToExcel([], [], 'Jan 2025');

    expect(mockBookAppendSheet).toHaveBeenCalledTimes(3);
    expect(mockBookAppendSheet.mock.calls[0][2]).toBe('Resumo');
    expect(mockBookAppendSheet.mock.calls[1][2]).toBe('Detalhado');
    expect(mockBookAppendSheet.mock.calls[2][2]).toBe('Custos');
  });

  it('gera arquivo com nome correto incluindo periodo', () => {
    exportOSToExcel([], [], 'Jan-2025');

    expect(mockWriteFile).toHaveBeenCalledTimes(1);
    const filename = mockWriteFile.mock.calls[0][1];
    expect(filename).toContain('fyness_os_');
    expect(filename).toContain('Jan-2025');
    expect(filename).toContain('.xlsx');
  });

  it('calcula indicadores corretamente no resumo', () => {
    const orders = [
      { status: 'done', type: 'normal', checklist: [] },
      { status: 'done', type: 'emergency', checklist: [] },
      { status: 'in_progress', type: 'normal', checklist: [] },
      { status: 'available', type: 'normal', checklist: [] },
      { status: 'blocked', type: 'normal', checklist: [] },
    ];

    exportOSToExcel(orders, [{ name: 'Test' }]);

    const resumeData = mockAoaToSheet.mock.calls[0][0];
    // Total
    expect(resumeData[4][1]).toBe(5);
    // Concluidas
    expect(resumeData[5][1]).toBe(2);
    // Em Andamento
    expect(resumeData[6][1]).toBe(1);
    // Disponiveis
    expect(resumeData[7][1]).toBe(1);
    // Bloqueadas
    expect(resumeData[8][1]).toBe(1);
    // Emergenciais
    expect(resumeData[9][1]).toBe(1);
    // Taxa de Conclusao
    expect(resumeData[10][1]).toBe('40.0%');
  });

  it('calcula taxa 0% quando sem ordens', () => {
    exportOSToExcel([], []);

    const resumeData = mockAoaToSheet.mock.calls[0][0];
    expect(resumeData[10][1]).toBe('0%');
  });

  it('inclui headers na aba detalhado', () => {
    exportOSToExcel([], []);

    const detailData = mockAoaToSheet.mock.calls[1][0];
    const headers = detailData[0];
    expect(headers).toContain('#');
    expect(headers).toContain('Titulo');
    expect(headers).toContain('Status');
    expect(headers).toContain('Prioridade');
    expect(headers).toContain('Horas');
  });

  it('traduz status e prioridade nas linhas', () => {
    const orders = [
      {
        number: 1,
        title: 'Tarefa A',
        status: 'available',
        priority: 'high',
        type: 'normal',
        assignee: 'Kaynan',
        checklist: [],
      },
    ];

    exportOSToExcel(orders, []);

    const detailData = mockAoaToSheet.mock.calls[1][0];
    const row = detailData[1]; // primeira linha de dados
    expect(row[2]).toBe('Disponivel');
    expect(row[3]).toBe('Alta');
    expect(row[4]).toBe('Normal');
  });

  it('marca emergenciais com prefixo EMG', () => {
    const orders = [
      {
        number: 1,
        emergencyNumber: 5,
        title: 'Urgencia',
        status: 'available',
        priority: 'urgent',
        type: 'emergency',
        checklist: [],
      },
    ];

    exportOSToExcel(orders, []);

    const detailData = mockAoaToSheet.mock.calls[1][0];
    const row = detailData[1];
    expect(row[0]).toBe('EMG-5');
    expect(row[4]).toBe('Emergencial');
  });

  it('usa periodo "Todos" quando nao fornecido', () => {
    exportOSToExcel([], []);

    const resumeData = mockAoaToSheet.mock.calls[0][0];
    expect(resumeData[1][1]).toBe('Todos');
  });
});

describe('exportKPIsToExcel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('cria 1 aba KPIs', () => {
    exportKPIsToExcel([], [], []);

    expect(mockBookAppendSheet).toHaveBeenCalledTimes(1);
    expect(mockBookAppendSheet.mock.calls[0][2]).toBe('KPIs');
  });

  it('gera arquivo com nome correto', () => {
    exportKPIsToExcel([], [], [], 'Mar-2025');

    const filename = mockWriteFile.mock.calls[0][1];
    expect(filename).toContain('fyness_kpis_');
    expect(filename).toContain('Mar-2025');
    expect(filename).toContain('.xlsx');
  });

  it('inclui headers corretos', () => {
    exportKPIsToExcel([], [], []);

    const data = mockAoaToSheet.mock.calls[0][0];
    const headers = data[3]; // linha 4 (após titulo, periodo e linha vazia)
    expect(headers).toContain('Membro');
    expect(headers).toContain('O.S. Total');
    expect(headers).toContain('Concluidas');
    expect(headers).toContain('Taxa Conclusao');
    expect(headers).toContain('Reunioes');
  });

  it('calcula metricas por membro', () => {
    const members = [{ name: 'Ana', salaryMonth: 5000, hoursMonth: 176 }];
    const orders = [
      { assignee: 'Ana', status: 'done', checklist: [] },
      { assignee: 'Ana', status: 'in_progress', checklist: [] },
      { assignee: 'Outro', status: 'done', checklist: [] },
    ];
    const events = [
      { type: 'meeting', assignee: 'Ana' },
    ];

    exportKPIsToExcel(orders, members, events);

    const data = mockAoaToSheet.mock.calls[0][0];
    const anaRow = data[4]; // primeira linha de dados
    expect(anaRow[0]).toBe('Ana');
    expect(anaRow[1]).toBe(2); // total de OS da Ana
    expect(anaRow[2]).toBe(1); // concluidas
    expect(anaRow[3]).toBe('50.0%'); // taxa
    expect(anaRow[6]).toBe(1); // reunioes
  });

  it('calcula 0% quando membro nao tem OS', () => {
    const members = [{ name: 'Sem OS', salaryMonth: 3000, hoursMonth: 176 }];

    exportKPIsToExcel([], members, []);

    const data = mockAoaToSheet.mock.calls[0][0];
    const row = data[4];
    expect(row[1]).toBe(0);
    expect(row[3]).toBe('0%');
  });
});

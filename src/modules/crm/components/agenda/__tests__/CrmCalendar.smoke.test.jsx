import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CrmCalendar from '../CrmCalendar';

// Smoke test da grade de horario (Semana/Dia) — cobre os casos que o layout
// de sobreposicao/duracao precisa lidar sem quebrar: eventos sobrepostos,
// evento sem endDate (tarefa pontual), evento dia inteiro, evento fora do
// range padrao 6h-22h.
function baseEvent(overrides) {
  return {
    id: Math.random().toString(36),
    source: 'crm',
    typeKey: 'call',
    typeLabel: 'Ligação',
    color: '#f59e0b',
    completed: false,
    leadKey: null,
    leadName: null,
    ...overrides,
  };
}

describe('CrmCalendar - grade de horario', () => {
  const today = new Date();
  today.setHours(10, 0, 0, 0);

  const events = [
    baseEvent({ id: 'a', title: 'Reuniao overlap 1', startDate: new Date(today.getTime()).toISOString(), endDate: new Date(today.getTime() + 60 * 60000).toISOString() }),
    baseEvent({ id: 'b', title: 'Reuniao overlap 2', startDate: new Date(today.getTime() + 15 * 60000).toISOString(), endDate: new Date(today.getTime() + 45 * 60000).toISOString() }),
    baseEvent({ id: 'c', title: 'Ligacao pontual sem fim', startDate: new Date(today.getTime() + 3 * 60 * 60000).toISOString(), endDate: null }),
    baseEvent({ id: 'd', title: 'Evento cedo (fora do range padrao)', startDate: new Date(today.getTime() - 8 * 60 * 60000).toISOString(), endDate: new Date(today.getTime() - 7 * 60 * 60000).toISOString() }),
    baseEvent({ id: 'e', title: 'Dia inteiro', startDate: today.toISOString(), isAllDay: true }),
  ];

  it('renderiza a visão Semana sem erro com eventos sobrepostos, sem fim, dia inteiro e fora do range padrão', () => {
    render(
      <CrmCalendar
        events={events}
        view="week"
        currentDate={today}
        onViewChange={() => {}}
        onNavigate={() => {}}
        onToday={() => {}}
        onSelectEvent={vi.fn()}
        onSelectSlot={vi.fn()}
        onCompleteTask={vi.fn()}
      />
    );
    expect(screen.getByText('Reuniao overlap 1')).toBeInTheDocument();
    expect(screen.getByText('Reuniao overlap 2')).toBeInTheDocument();
    expect(screen.getByText('Ligacao pontual sem fim')).toBeInTheDocument();
    expect(screen.getByText('Evento cedo (fora do range padrao)')).toBeInTheDocument();
  });

  it('renderiza a visão Dia sem erro com os mesmos eventos', () => {
    render(
      <CrmCalendar
        events={events}
        view="day"
        currentDate={today}
        onViewChange={() => {}}
        onNavigate={() => {}}
        onToday={() => {}}
        onSelectEvent={vi.fn()}
        onSelectSlot={vi.fn()}
        onCompleteTask={vi.fn()}
      />
    );
    expect(screen.getByText('Reuniao overlap 1')).toBeInTheDocument();
    expect(screen.getByText('Ligacao pontual sem fim')).toBeInTheDocument();
  });

  it('não quebra com um dia vazio (sem nenhum evento)', () => {
    render(
      <CrmCalendar
        events={[]}
        view="week"
        currentDate={today}
        onViewChange={() => {}}
        onNavigate={() => {}}
        onToday={() => {}}
        onSelectEvent={vi.fn()}
        onSelectSlot={vi.fn()}
        onCompleteTask={vi.fn()}
      />
    );
    expect(screen.getByText('Hoje')).toBeInTheDocument();
  });
});

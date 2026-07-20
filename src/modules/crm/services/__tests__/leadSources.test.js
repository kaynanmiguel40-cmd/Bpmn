import { describe, it, expect } from 'vitest';
import { mesmaOrigem } from '../crmLeadSourcesService';

/**
 * O campo de origem é texto livre e chegou a 29 tags para ~8 origens reais: o
 * mesmo parceiro aparecendo cinco vezes no filtro, e toda contagem por origem
 * saindo partida ao meio. Não é só feio — `source` alimenta o score do lead e a
 * página do parceiro.
 */
describe('mesmaOrigem', () => {
  it('acento não cria origem nova', () => {
    expect(mesmaOrigem('Prospecção ativa', 'Prospeccao ativa')).toBe(true);
    expect(mesmaOrigem('Tráfego pago', 'Trafego pago')).toBe(true);
  });

  it('caixa não cria origem nova', () => {
    expect(mesmaOrigem('Indicação de Parceiro (Luan)', 'indicação de parceiro (luan)')).toBe(true);
  });

  it('espaço sobrando não cria origem nova', () => {
    expect(mesmaOrigem('  Tráfego pago ', 'Tráfego pago')).toBe(true);
    expect(mesmaOrigem('Tráfego  pago', 'Tráfego pago')).toBe(true);
  });

  // O limite: parceiros diferentes têm que continuar diferentes. Juntar por
  // semelhança misturaria o Luan com o João — e com ele o crédito da indicação.
  it('parceiros diferentes continuam diferentes', () => {
    expect(mesmaOrigem('Indicação de parceiro (Luan)', 'Indicação de parceiro (João)')).toBe(false);
    expect(mesmaOrigem('Indicação de parceiro', 'Indicação de parceiro (Edson)')).toBe(false);
  });

  it('vazio e nulo não quebram', () => {
    expect(mesmaOrigem('', '')).toBe(true);
    expect(mesmaOrigem(null, undefined)).toBe(true);
    expect(mesmaOrigem('Tráfego pago', null)).toBe(false);
  });
});

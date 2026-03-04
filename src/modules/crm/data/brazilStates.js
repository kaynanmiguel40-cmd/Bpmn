/**
 * Dados geograficos do Brasil - 27 estados + cidades principais
 * Usado pelo mapa interativo de Prospeccao Outbound (P.O.)
 */

export const REGIONS = {
  norte: { name: 'Norte', color: 'emerald', lightBg: '#6ee7b7', darkBg: '#047857', hover: '#34d399' },
  nordeste: { name: 'Nordeste', color: 'amber', lightBg: '#fcd34d', darkBg: '#b45309', hover: '#fbbf24' },
  centroOeste: { name: 'Centro-Oeste', color: 'sky', lightBg: '#7dd3fc', darkBg: '#0369a1', hover: '#38bdf8' },
  sudeste: { name: 'Sudeste', color: 'violet', lightBg: '#c4b5fd', darkBg: '#6d28d9', hover: '#a78bfa' },
  sul: { name: 'Sul', color: 'rose', lightBg: '#fda4af', darkBg: '#be123c', hover: '#fb7185' },
};

export const PROSPECT_STATUS = {
  none: { label: 'Sem prospeccao', color: 'slate', icon: 'Circle', bg: 'bg-slate-200 dark:bg-slate-700', text: 'text-slate-500 dark:text-slate-400', mapColor: '#cbd5e1', mapColorDark: '#334155', textHex: '#64748b' },
  prospecting: { label: 'Em prospeccao', color: 'amber', icon: 'Clock', bg: 'bg-amber-100 dark:bg-amber-900/40', text: 'text-amber-600 dark:text-amber-400', mapColor: '#fbbf24', mapColorDark: '#b45309', textHex: '#d97706' },
  scheduled: { label: 'Visita agendada', color: 'blue', icon: 'Calendar', bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400', mapColor: '#60a5fa', mapColorDark: '#1d4ed8', textHex: '#2563eb' },
  closed: { label: 'Parceiro fechado', color: 'emerald', icon: 'CheckCircle', bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-600 dark:text-emerald-400', mapColor: '#34d399', mapColorDark: '#047857', textHex: '#059669' },
};

export const BRAZIL_STATES = [
  // ── Norte ──
  { uf: 'AC', name: 'Acre', region: 'norte', capital: 'Rio Branco', labelX: 145, labelY: 340,
    cities: [
      { name: 'Rio Branco', pop: 413418, status: 'none' },
      { name: 'Cruzeiro do Sul', pop: 89072, status: 'none' },
      { name: 'Sena Madureira', pop: 46511, status: 'none' },
      { name: 'Tarauaca', pop: 43151, status: 'none' },
      { name: 'Feijo', pop: 34780, status: 'none' },
    ]},
  { uf: 'AM', name: 'Amazonas', region: 'norte', capital: 'Manaus', labelX: 230, labelY: 230,
    cities: [
      { name: 'Manaus', pop: 2255903, status: 'none' },
      { name: 'Parintins', pop: 116439, status: 'none' },
      { name: 'Itacoatiara', pop: 104046, status: 'none' },
      { name: 'Manacapuru', pop: 100862, status: 'none' },
      { name: 'Tefe', pop: 62230, status: 'none' },
      { name: 'Coari', pop: 85097, status: 'none' },
      { name: 'Tabatinga', pop: 67892, status: 'none' },
    ]},
  { uf: 'AP', name: 'Amapa', region: 'norte', capital: 'Macapa', labelX: 400, labelY: 135,
    cities: [
      { name: 'Macapa', pop: 512902, status: 'none' },
      { name: 'Santana', pop: 123096, status: 'none' },
      { name: 'Laranjal do Jari', pop: 52000, status: 'none' },
      { name: 'Oiapoque', pop: 28207, status: 'none' },
    ]},
  { uf: 'PA', name: 'Para', region: 'norte', capital: 'Belem', labelX: 380, labelY: 230,
    cities: [
      { name: 'Belem', pop: 1506420, status: 'none' },
      { name: 'Ananindeua', pop: 535547, status: 'none' },
      { name: 'Santarem', pop: 306480, status: 'none' },
      { name: 'Maraba', pop: 287664, status: 'none' },
      { name: 'Castanhal', pop: 203251, status: 'none' },
      { name: 'Parauapebas', pop: 211364, status: 'none' },
      { name: 'Altamira', pop: 117320, status: 'none' },
      { name: 'Tucurui', pop: 113392, status: 'none' },
    ]},
  { uf: 'RO', name: 'Rondonia', region: 'norte', capital: 'Porto Velho', labelX: 195, labelY: 350,
    cities: [
      { name: 'Porto Velho', pop: 539354, status: 'none' },
      { name: 'Ji-Parana', pop: 132667, status: 'none' },
      { name: 'Ariquemes', pop: 109523, status: 'none' },
      { name: 'Vilhena', pop: 102211, status: 'none' },
      { name: 'Cacoal', pop: 87226, status: 'none' },
    ]},
  { uf: 'RR', name: 'Roraima', region: 'norte', capital: 'Boa Vista', labelX: 260, labelY: 115,
    cities: [
      { name: 'Boa Vista', pop: 419652, status: 'none' },
      { name: 'Rorainopolis', pop: 32700, status: 'none' },
      { name: 'Caracarai', pop: 22291, status: 'none' },
    ]},
  { uf: 'TO', name: 'Tocantins', region: 'norte', capital: 'Palmas', labelX: 395, labelY: 355,
    cities: [
      { name: 'Palmas', pop: 306296, status: 'none' },
      { name: 'Araguaina', pop: 183381, status: 'none' },
      { name: 'Gurupi', pop: 86647, status: 'none' },
      { name: 'Porto Nacional', pop: 53316, status: 'none' },
      { name: 'Paraiso do Tocantins', pop: 52269, status: 'none' },
    ]},

  // ── Nordeste ──
  { uf: 'AL', name: 'Alagoas', region: 'nordeste', capital: 'Maceio', labelX: 575, labelY: 360,
    cities: [
      { name: 'Maceio', pop: 1025360, status: 'none' },
      { name: 'Arapiraca', pop: 233047, status: 'none' },
      { name: 'Rio Largo', pop: 77543, status: 'none' },
      { name: 'Palmeira dos Indios', pop: 73162, status: 'none' },
      { name: 'Penedo', pop: 64534, status: 'none' },
    ]},
  { uf: 'BA', name: 'Bahia', region: 'nordeste', capital: 'Salvador', labelX: 500, labelY: 420,
    cities: [
      { name: 'Salvador', pop: 2886698, status: 'none' },
      { name: 'Feira de Santana', pop: 619609, status: 'none' },
      { name: 'Vitoria da Conquista', pop: 343230, status: 'none' },
      { name: 'Camacari', pop: 304302, status: 'none' },
      { name: 'Ilheus', pop: 164844, status: 'none' },
      { name: 'Juazeiro', pop: 218324, status: 'none' },
      { name: 'Itabuna', pop: 213223, status: 'none' },
      { name: 'Lauro de Freitas', pop: 201635, status: 'none' },
      { name: 'Barreiras', pop: 156975, status: 'none' },
      { name: 'Teixeira de Freitas', pop: 162190, status: 'none' },
    ]},
  { uf: 'CE', name: 'Ceara', region: 'nordeste', capital: 'Fortaleza', labelX: 530, labelY: 260,
    cities: [
      { name: 'Fortaleza', pop: 2703391, status: 'none' },
      { name: 'Caucaia', pop: 365212, status: 'none' },
      { name: 'Juazeiro do Norte', pop: 278264, status: 'none' },
      { name: 'Maracanau', pop: 229458, status: 'none' },
      { name: 'Sobral', pop: 210711, status: 'none' },
      { name: 'Crato', pop: 133913, status: 'none' },
      { name: 'Itapipoca', pop: 131077, status: 'none' },
    ]},
  { uf: 'MA', name: 'Maranhao', region: 'nordeste', capital: 'Sao Luis', labelX: 450, labelY: 240,
    cities: [
      { name: 'Sao Luis', pop: 1115932, status: 'none' },
      { name: 'Imperatriz', pop: 259337, status: 'none' },
      { name: 'Sao Jose de Ribamar', pop: 179028, status: 'none' },
      { name: 'Timon', pop: 171008, status: 'none' },
      { name: 'Caxias', pop: 165525, status: 'none' },
      { name: 'Codó', pop: 124682, status: 'none' },
      { name: 'Paço do Lumiar', pop: 122420, status: 'none' },
    ]},
  { uf: 'PB', name: 'Paraiba', region: 'nordeste', capital: 'Joao Pessoa', labelX: 570, labelY: 310,
    cities: [
      { name: 'Joao Pessoa', pop: 817511, status: 'none' },
      { name: 'Campina Grande', pop: 411807, status: 'none' },
      { name: 'Santa Rita', pop: 136851, status: 'none' },
      { name: 'Patos', pop: 108192, status: 'none' },
      { name: 'Bayeux', pop: 96630, status: 'none' },
    ]},
  { uf: 'PE', name: 'Pernambuco', region: 'nordeste', capital: 'Recife', labelX: 570, labelY: 335,
    cities: [
      { name: 'Recife', pop: 1661681, status: 'none' },
      { name: 'Jaboatao dos Guararapes', pop: 702621, status: 'none' },
      { name: 'Olinda', pop: 393115, status: 'none' },
      { name: 'Caruaru', pop: 361118, status: 'none' },
      { name: 'Petrolina', pop: 354317, status: 'none' },
      { name: 'Paulista', pop: 334376, status: 'none' },
      { name: 'Cabo de Santo Agostinho', pop: 208944, status: 'none' },
      { name: 'Garanhuns', pop: 140577, status: 'none' },
    ]},
  { uf: 'PI', name: 'Piaui', region: 'nordeste', capital: 'Teresina', labelX: 475, labelY: 295,
    cities: [
      { name: 'Teresina', pop: 868075, status: 'none' },
      { name: 'Parnaiba', pop: 153482, status: 'none' },
      { name: 'Picos', pop: 78431, status: 'none' },
      { name: 'Floriano', pop: 59841, status: 'none' },
      { name: 'Piripiri', pop: 63662, status: 'none' },
    ]},
  { uf: 'RN', name: 'Rio Grande do Norte', region: 'nordeste', capital: 'Natal', labelX: 570, labelY: 290,
    cities: [
      { name: 'Natal', pop: 896708, status: 'none' },
      { name: 'Mossoro', pop: 300618, status: 'none' },
      { name: 'Parnamirim', pop: 267036, status: 'none' },
      { name: 'Sao Goncalo do Amarante', pop: 105763, status: 'none' },
      { name: 'Macaiba', pop: 80988, status: 'none' },
    ]},
  { uf: 'SE', name: 'Sergipe', region: 'nordeste', capital: 'Aracaju', labelX: 560, labelY: 380,
    cities: [
      { name: 'Aracaju', pop: 664908, status: 'none' },
      { name: 'Nossa Senhora do Socorro', pop: 181928, status: 'none' },
      { name: 'Lagarto', pop: 104099, status: 'none' },
      { name: 'Itabaiana', pop: 95765, status: 'none' },
      { name: 'Estancia', pop: 70399, status: 'none' },
    ]},

  // ── Centro-Oeste ──
  { uf: 'DF', name: 'Distrito Federal', region: 'centroOeste', capital: 'Brasilia', labelX: 410, labelY: 460,
    cities: [
      { name: 'Brasilia', pop: 3055149, status: 'none' },
      { name: 'Ceilandia', pop: 432927, status: 'none' },
      { name: 'Taguatinga', pop: 390855, status: 'none' },
      { name: 'Samambaia', pop: 274231, status: 'none' },
      { name: 'Planaltina', pop: 222201, status: 'none' },
    ]},
  { uf: 'GO', name: 'Goias', region: 'centroOeste', capital: 'Goiania', labelX: 370, labelY: 460,
    cities: [
      { name: 'Goiania', pop: 1555626, status: 'none' },
      { name: 'Aparecida de Goiania', pop: 590146, status: 'none' },
      { name: 'Anapolis', pop: 391772, status: 'none' },
      { name: 'Rio Verde', pop: 241518, status: 'none' },
      { name: 'Luziania', pop: 210530, status: 'none' },
      { name: 'Aguas Lindas de Goias', pop: 212440, status: 'none' },
      { name: 'Valparaiso de Goias', pop: 173274, status: 'none' },
      { name: 'Trindade', pop: 130318, status: 'none' },
    ]},
  { uf: 'MT', name: 'Mato Grosso', region: 'centroOeste', capital: 'Cuiaba', labelX: 280, labelY: 410,
    cities: [
      { name: 'Cuiaba', pop: 618124, status: 'none' },
      { name: 'Varzea Grande', pop: 287526, status: 'none' },
      { name: 'Rondonopolis', pop: 239634, status: 'none' },
      { name: 'Sinop', pop: 196035, status: 'none' },
      { name: 'Tangara da Serra', pop: 107009, status: 'none' },
      { name: 'Sorriso', pop: 97816, status: 'none' },
      { name: 'Lucas do Rio Verde', pop: 80826, status: 'none' },
    ]},
  { uf: 'MS', name: 'Mato Grosso do Sul', region: 'centroOeste', capital: 'Campo Grande', labelX: 300, labelY: 510,
    cities: [
      { name: 'Campo Grande', pop: 916001, status: 'none' },
      { name: 'Dourados', pop: 225495, status: 'none' },
      { name: 'Tres Lagoas', pop: 123281, status: 'none' },
      { name: 'Corumba', pop: 112058, status: 'none' },
      { name: 'Ponta Pora', pop: 93937, status: 'none' },
      { name: 'Naviraí', pop: 55689, status: 'none' },
    ]},

  // ── Sudeste ──
  { uf: 'ES', name: 'Espirito Santo', region: 'sudeste', capital: 'Vitoria', labelX: 510, labelY: 500,
    cities: [
      { name: 'Vitoria', pop: 365855, status: 'none' },
      { name: 'Serra', pop: 527240, status: 'none' },
      { name: 'Vila Velha', pop: 501325, status: 'none' },
      { name: 'Cariacica', pop: 387368, status: 'none' },
      { name: 'Linhares', pop: 176688, status: 'none' },
      { name: 'Cachoeiro de Itapemirim', pop: 210589, status: 'none' },
    ]},
  { uf: 'MG', name: 'Minas Gerais', region: 'sudeste', capital: 'Belo Horizonte', labelX: 440, labelY: 480,
    cities: [
      { name: 'Belo Horizonte', pop: 2521564, status: 'none' },
      { name: 'Uberlandia', pop: 699097, status: 'none' },
      { name: 'Contagem', pop: 668949, status: 'none' },
      { name: 'Juiz de Fora', pop: 577532, status: 'none' },
      { name: 'Betim', pop: 444784, status: 'none' },
      { name: 'Montes Claros', pop: 413487, status: 'none' },
      { name: 'Ribeirao das Neves', pop: 334858, status: 'none' },
      { name: 'Uberaba', pop: 340277, status: 'none' },
      { name: 'Governador Valadares', pop: 281046, status: 'none' },
      { name: 'Ipatinga', pop: 264884, status: 'none' },
    ]},
  { uf: 'RJ', name: 'Rio de Janeiro', region: 'sudeste', capital: 'Rio de Janeiro', labelX: 470, labelY: 530,
    cities: [
      { name: 'Rio de Janeiro', pop: 6747815, status: 'none' },
      { name: 'Sao Goncalo', pop: 1091737, status: 'none' },
      { name: 'Duque de Caxias', pop: 924624, status: 'none' },
      { name: 'Nova Iguacu', pop: 823302, status: 'none' },
      { name: 'Niteroi', pop: 515317, status: 'none' },
      { name: 'Campos dos Goytacazes', pop: 507548, status: 'none' },
      { name: 'Belford Roxo', pop: 510906, status: 'none' },
      { name: 'Sao Joao de Meriti', pop: 472906, status: 'none' },
      { name: 'Petrópolis', pop: 306678, status: 'none' },
      { name: 'Volta Redonda', pop: 273012, status: 'none' },
    ]},
  { uf: 'SP', name: 'Sao Paulo', region: 'sudeste', capital: 'Sao Paulo', labelX: 390, labelY: 545,
    cities: [
      { name: 'Sao Paulo', pop: 12396372, status: 'none' },
      { name: 'Guarulhos', pop: 1392121, status: 'none' },
      { name: 'Campinas', pop: 1213792, status: 'none' },
      { name: 'Sao Bernardo do Campo', pop: 844483, status: 'none' },
      { name: 'Santo Andre', pop: 721368, status: 'none' },
      { name: 'Osasco', pop: 699944, status: 'none' },
      { name: 'Ribeirao Preto', pop: 711825, status: 'none' },
      { name: 'Sorocaba', pop: 687357, status: 'none' },
      { name: 'Sao Jose dos Campos', pop: 737310, status: 'none' },
      { name: 'Santos', pop: 433311, status: 'none' },
    ]},

  // ── Sul ──
  { uf: 'PR', name: 'Parana', region: 'sul', capital: 'Curitiba', labelX: 365, labelY: 570,
    cities: [
      { name: 'Curitiba', pop: 1963726, status: 'none' },
      { name: 'Londrina', pop: 580870, status: 'none' },
      { name: 'Maringa', pop: 430157, status: 'none' },
      { name: 'Ponta Grossa', pop: 358838, status: 'none' },
      { name: 'Cascavel', pop: 332333, status: 'none' },
      { name: 'Sao Jose dos Pinhais', pop: 323340, status: 'none' },
      { name: 'Foz do Iguacu', pop: 258823, status: 'none' },
      { name: 'Colombo', pop: 246540, status: 'none' },
    ]},
  { uf: 'RS', name: 'Rio Grande do Sul', region: 'sul', capital: 'Porto Alegre', labelX: 340, labelY: 640,
    cities: [
      { name: 'Porto Alegre', pop: 1492530, status: 'none' },
      { name: 'Caxias do Sul', pop: 517451, status: 'none' },
      { name: 'Canoas', pop: 349728, status: 'none' },
      { name: 'Pelotas', pop: 343132, status: 'none' },
      { name: 'Santa Maria', pop: 283677, status: 'none' },
      { name: 'Gravatai', pop: 281519, status: 'none' },
      { name: 'Viamao', pop: 256225, status: 'none' },
      { name: 'Novo Hamburgo', pop: 247032, status: 'none' },
    ]},
  { uf: 'SC', name: 'Santa Catarina', region: 'sul', capital: 'Florianopolis', labelX: 380, labelY: 600,
    cities: [
      { name: 'Joinville', pop: 604708, status: 'none' },
      { name: 'Florianopolis', pop: 516524, status: 'none' },
      { name: 'Blumenau', pop: 361855, status: 'none' },
      { name: 'Sao Jose', pop: 250028, status: 'none' },
      { name: 'Chapeco', pop: 224013, status: 'none' },
      { name: 'Criciuma', pop: 215186, status: 'none' },
      { name: 'Itajai', pop: 223112, status: 'none' },
      { name: 'Balneario Camboriu', pop: 145796, status: 'none' },
    ]},
];

/** Mock de prospeccoes ativas por estado (dados de exemplo) */
export const MOCK_PROSPECTIONS = {
  SP: { status: 'closed', prospectedCities: 4, totalVisits: 12, lastActivity: '2026-02-28' },
  RJ: { status: 'scheduled', prospectedCities: 2, totalVisits: 5, lastActivity: '2026-03-01' },
  MG: { status: 'prospecting', prospectedCities: 3, totalVisits: 3, lastActivity: '2026-02-25' },
  PR: { status: 'prospecting', prospectedCities: 1, totalVisits: 2, lastActivity: '2026-02-20' },
  SC: { status: 'scheduled', prospectedCities: 1, totalVisits: 1, lastActivity: '2026-03-02' },
  BA: { status: 'prospecting', prospectedCities: 2, totalVisits: 2, lastActivity: '2026-02-15' },
  RS: { status: 'none', prospectedCities: 0, totalVisits: 0, lastActivity: null },
  GO: { status: 'prospecting', prospectedCities: 1, totalVisits: 1, lastActivity: '2026-02-18' },
  DF: { status: 'closed', prospectedCities: 1, totalVisits: 4, lastActivity: '2026-02-27' },
  PE: { status: 'none', prospectedCities: 0, totalVisits: 0, lastActivity: null },
  CE: { status: 'prospecting', prospectedCities: 1, totalVisits: 1, lastActivity: '2026-02-10' },
};

/** Mock de status por cidade (para estados que ja tem prospeccao) */
export const MOCK_CITY_STATUS = {
  SP: {
    'Sao Paulo': { status: 'closed', responsible: 'Carlos Silva', lastActivity: '2026-02-28', notes: 'Parceria assinada com escritorio SP' },
    'Campinas': { status: 'closed', responsible: 'Carlos Silva', lastActivity: '2026-02-20', notes: 'Parceiro ativo' },
    'Ribeirao Preto': { status: 'scheduled', responsible: 'Carlos Silva', lastActivity: '2026-03-05', notes: 'Visita agendada para Marco' },
    'Sorocaba': { status: 'prospecting', responsible: 'Carlos Silva', lastActivity: '2026-02-15', notes: 'Primeiro contato feito' },
  },
  RJ: {
    'Rio de Janeiro': { status: 'scheduled', responsible: 'Carlos Silva', lastActivity: '2026-03-10', notes: 'Visita agendada' },
    'Niteroi': { status: 'prospecting', responsible: 'Carlos Silva', lastActivity: '2026-03-01', notes: 'Levantamento de potenciais' },
  },
  MG: {
    'Belo Horizonte': { status: 'prospecting', responsible: 'Carlos Silva', lastActivity: '2026-02-25', notes: 'Em negociacao' },
    'Uberlandia': { status: 'prospecting', responsible: 'Carlos Silva', lastActivity: '2026-02-22', notes: 'Contato inicial' },
    'Juiz de Fora': { status: 'prospecting', responsible: 'Carlos Silva', lastActivity: '2026-02-18', notes: 'Agendando reuniao' },
  },
  DF: {
    'Brasilia': { status: 'closed', responsible: 'Carlos Silva', lastActivity: '2026-02-27', notes: 'Parceiro federal ativo' },
  },
  PR: {
    'Curitiba': { status: 'prospecting', responsible: 'Carlos Silva', lastActivity: '2026-02-20', notes: 'Primeiro contato' },
  },
  SC: {
    'Florianopolis': { status: 'scheduled', responsible: 'Carlos Silva', lastActivity: '2026-03-08', notes: 'Visita agendada' },
  },
  BA: {
    'Salvador': { status: 'prospecting', responsible: 'Carlos Silva', lastActivity: '2026-02-15', notes: 'Mapeando mercado' },
    'Feira de Santana': { status: 'prospecting', responsible: 'Carlos Silva', lastActivity: '2026-02-12', notes: 'Contato inicial' },
  },
  GO: {
    'Goiania': { status: 'prospecting', responsible: 'Carlos Silva', lastActivity: '2026-02-18', notes: 'Levantamento' },
  },
  CE: {
    'Fortaleza': { status: 'prospecting', responsible: 'Carlos Silva', lastActivity: '2026-02-10', notes: 'Primeiro contato por email' },
  },
};

export function getStateByUf(uf) {
  return BRAZIL_STATES.find(s => s.uf === uf);
}

export function getStateProspection(uf) {
  return MOCK_PROSPECTIONS[uf] || { status: 'none', prospectedCities: 0, totalVisits: 0, lastActivity: null };
}

export function getCityStatus(uf, cityName) {
  return MOCK_CITY_STATUS[uf]?.[cityName] || null;
}

export function getRegion(regionKey) {
  return REGIONS[regionKey];
}

export function getStatesbyRegion(regionKey) {
  return BRAZIL_STATES.filter(s => s.region === regionKey);
}

export function getProspectionStats() {
  const states = BRAZIL_STATES;
  const withProspection = states.filter(s => MOCK_PROSPECTIONS[s.uf] && MOCK_PROSPECTIONS[s.uf].status !== 'none');
  const totalCitiesProspected = withProspection.reduce((acc, s) => acc + (MOCK_PROSPECTIONS[s.uf]?.prospectedCities || 0), 0);
  const totalVisits = withProspection.reduce((acc, s) => acc + (MOCK_PROSPECTIONS[s.uf]?.totalVisits || 0), 0);
  const closed = withProspection.filter(s => MOCK_PROSPECTIONS[s.uf]?.status === 'closed').length;
  const scheduled = withProspection.filter(s => MOCK_PROSPECTIONS[s.uf]?.status === 'scheduled').length;

  return {
    totalStates: 27,
    statesWithPartners: closed,
    statesProspecting: withProspection.length,
    citiesProspected: totalCitiesProspected,
    totalVisits,
    scheduledVisits: scheduled,
    conversionRate: withProspection.length > 0 ? Math.round((closed / withProspection.length) * 100) : 0,
  };
}

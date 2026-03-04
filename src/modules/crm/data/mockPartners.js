/**
 * Mock Data para Parceiros Potenciais.
 * ~40 parceiros (contabilidades, financeiras, advocacias, associações)
 * espalhados pelo Brasil para testar o fluxo Leads vs Parceiros.
 */

let _idCounter = 1;
const id = () => `mock-partner-${String(_idCounter++).padStart(3, '0')}`;
const now = new Date().toISOString();

function p(overrides) {
  return {
    id: id(),
    companyName: '',
    contactName: '',
    phone: '',
    email: '',
    cnpj: '',
    segment: '',
    size: '',
    city: '',
    state: '',
    position: '',
    source: '',
    website: '',
    revenue: null,
    employees: null,
    clients: null,
    notes: '',
    status: 'new',
    prospectType: 'partner',
    partnerCategory: null,
    assignedTo: null,
    assignedMember: null,
    listName: '',
    createdBy: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  };
}

export const PARTNER_SEGMENT_OPTIONS = [
  'Contabilidade',
  'Financeira',
  'Advocacia',
  'Associacao',
];

export const CLIENT_RANGES = [
  { key: 'ate50', label: 'Ate 50 clientes', min: 0, max: 50 },
  { key: '50-200', label: '50 - 200 clientes', min: 50, max: 200 },
  { key: '200-500', label: '200 - 500 clientes', min: 200, max: 500 },
  { key: '500-1000', label: '500 - 1.000 clientes', min: 500, max: 1000 },
  { key: '1000mais', label: '1.000+ clientes', min: 1000, max: Infinity },
];

export const MOCK_PARTNERS = [
  // ---- Contabilidade - SP ----
  p({ companyName: 'ContabilPro Assessoria', contactName: 'Roberto Nunes', phone: '11987651234', email: 'roberto@contabilpro.com.br', segment: 'Contabilidade', partnerCategory: 'contabilidade', city: 'Sao Paulo', state: 'SP', position: 'Socio Diretor', source: 'Google Maps', website: 'contabilpro.com.br', employees: 15, clients: 320 }),
  p({ companyName: 'Escritorio Fiscal SP', contactName: 'Marcia Oliveira', phone: '11976542345', email: 'marcia@fiscalsp.com.br', segment: 'Contabilidade', partnerCategory: 'contabilidade', city: 'Sao Paulo', state: 'SP', position: 'Contadora', source: 'LinkedIn', clients: 85 }),
  p({ companyName: 'Exata Contabilidade', contactName: 'Fernando Lima', phone: '19998761234', email: 'fernando@exata.cnt.br', segment: 'Contabilidade', partnerCategory: 'contabilidade', city: 'Campinas', state: 'SP', position: 'Diretor', source: 'Indicacao', employees: 22, clients: 480 }),
  p({ companyName: 'Solucao Contabil Ltda', contactName: 'Patricia Ramos', email: 'patricia@solucaocontabil.com.br', segment: 'Contabilidade', partnerCategory: 'contabilidade', city: 'Ribeirao Preto', state: 'SP', position: 'Socia', source: 'Site', employees: 8, clients: 150 }),

  // ---- Contabilidade - MG ----
  p({ companyName: 'Minas Contab', contactName: 'Joao Vitor Alves', phone: '31987654321', email: 'joao@minascontab.com.br', segment: 'Contabilidade', partnerCategory: 'contabilidade', city: 'Belo Horizonte', state: 'MG', position: 'Contador Chefe', source: 'Google Maps', employees: 18, clients: 380 }),
  p({ companyName: 'Contabiliza BH', contactName: 'Carla Souza', phone: '31976543210', email: 'carla@contabilizabh.com.br', segment: 'Contabilidade', partnerCategory: 'contabilidade', city: 'Belo Horizonte', state: 'MG', position: 'Diretora', source: 'Evento', employees: 12, clients: 220 }),

  // ---- Contabilidade - RJ ----
  p({ companyName: 'Carioca Contabilidade', contactName: 'Andre Costa', phone: '21987654321', email: 'andre@cariocacontab.com.br', segment: 'Contabilidade', partnerCategory: 'contabilidade', city: 'Rio de Janeiro', state: 'RJ', position: 'Socio', source: 'Indicacao', employees: 25, clients: 550 }),

  // ---- Contabilidade - PR/SC/RS ----
  p({ companyName: 'Sul Contabil', contactName: 'Marcos Bauer', phone: '41998765432', email: 'marcos@sulcontabil.com.br', segment: 'Contabilidade', partnerCategory: 'contabilidade', city: 'Curitiba', state: 'PR', position: 'Diretor', source: 'LinkedIn', employees: 10, clients: 180 }),
  p({ companyName: 'Precisao Assessoria Contabil', contactName: 'Luciana Rech', phone: '51987654321', email: 'luciana@precisaocontabil.com.br', segment: 'Contabilidade', partnerCategory: 'contabilidade', city: 'Porto Alegre', state: 'RS', position: 'Contadora', source: 'Site', employees: 14, clients: 260 }),

  // ---- Financeira - SP ----
  p({ companyName: 'FinanceiraBR Consultoria', contactName: 'Diego Martins', phone: '11955443322', email: 'diego@financeirabr.com.br', segment: 'Financeira', partnerCategory: 'financeira', city: 'Sao Paulo', state: 'SP', position: 'Consultor Senior', source: 'LinkedIn', website: 'financeirabr.com.br', employees: 8, clients: 120 }),
  p({ companyName: 'Assessoria Capital SP', contactName: 'Renata Barros', phone: '11944332211', email: 'renata@capitalsp.com.br', segment: 'Financeira', partnerCategory: 'financeira', city: 'Sao Paulo', state: 'SP', position: 'Diretora', source: 'Evento', employees: 5, clients: 65 }),
  p({ companyName: 'Valor Investimentos', contactName: 'Gustavo Ferreira', phone: '19987654321', email: 'gustavo@valorinvest.com.br', segment: 'Financeira', partnerCategory: 'financeira', city: 'Campinas', state: 'SP', position: 'Gestor', source: 'Indicacao', employees: 12, clients: 200 }),

  // ---- Financeira - RJ ----
  p({ companyName: 'Carioca Financeira', contactName: 'Tatiana Lopes', phone: '21976543210', email: 'tatiana@cariocafin.com.br', segment: 'Financeira', partnerCategory: 'financeira', city: 'Rio de Janeiro', state: 'RJ', position: 'Analista Chefe', source: 'LinkedIn', employees: 6, clients: 90 }),

  // ---- Financeira - MG ----
  p({ companyName: 'BH Capital Assessoria', contactName: 'Rodrigo Pinto', phone: '31965432109', email: 'rodrigo@bhcapital.com.br', segment: 'Financeira', partnerCategory: 'financeira', city: 'Belo Horizonte', state: 'MG', position: 'Consultor', source: 'Google Maps', employees: 4, clients: 45 }),

  // ---- Financeira - GO ----
  p({ companyName: 'Cerrado Consultoria Financeira', contactName: 'Simone Araujo', phone: '62987654321', email: 'simone@cerradofin.com.br', segment: 'Financeira', partnerCategory: 'financeira', city: 'Goiania', state: 'GO', position: 'Diretora', source: 'Evento', employees: 7, clients: 110 }),

  // ---- Financeira - BA ----
  p({ companyName: 'Nordeste Financeiro', contactName: 'Carlos Eduardo', phone: '71987654321', email: 'carlos@nordestefin.com.br', segment: 'Financeira', partnerCategory: 'financeira', city: 'Salvador', state: 'BA', position: 'Socio', source: 'Indicacao', employees: 9, clients: 160 }),

  // ---- Advocacia - SP ----
  p({ companyName: 'Mendes & Associados Advogados', contactName: 'Dr. Paulo Mendes', phone: '11933221100', email: 'paulo@mendesadv.com.br', segment: 'Advocacia', partnerCategory: 'advocacia', city: 'Sao Paulo', state: 'SP', position: 'Socio Fundador', source: 'Indicacao', website: 'mendesadv.com.br', employees: 20, clients: 350 }),
  p({ companyName: 'Direito Empresarial SP', contactName: 'Dra. Julia Campos', phone: '11922110099', email: 'julia@direitoemp.com.br', segment: 'Advocacia', partnerCategory: 'advocacia', city: 'Sao Paulo', state: 'SP', position: 'Advogada Socia', source: 'LinkedIn', employees: 12, clients: 180 }),
  p({ companyName: 'Advocacia Pereira & Lima', contactName: 'Dr. Marcelo Pereira', email: 'marcelo@pereiralima.adv.br', segment: 'Advocacia', partnerCategory: 'advocacia', city: 'Santos', state: 'SP', position: 'Socio', source: 'Evento', employees: 8, clients: 95 }),

  // ---- Advocacia - RJ ----
  p({ companyName: 'Costa & Filho Advocacia', contactName: 'Dr. Ricardo Costa', phone: '21933221100', email: 'ricardo@costafilho.adv.br', segment: 'Advocacia', partnerCategory: 'advocacia', city: 'Rio de Janeiro', state: 'RJ', position: 'Socio Senior', source: 'Indicacao', employees: 15, clients: 280 }),

  // ---- Advocacia - MG ----
  p({ companyName: 'Minas Legal Advocacia', contactName: 'Dra. Fernanda Gomes', phone: '31922110099', email: 'fernanda@minaslegal.adv.br', segment: 'Advocacia', partnerCategory: 'advocacia', city: 'Belo Horizonte', state: 'MG', position: 'Advogada', source: 'LinkedIn', employees: 6, clients: 70 }),

  // ---- Advocacia - PR ----
  p({ companyName: 'Tribunal Sul Advogados', contactName: 'Dr. Henrique Basso', phone: '41933221100', email: 'henrique@tribunalsul.adv.br', segment: 'Advocacia', partnerCategory: 'advocacia', city: 'Curitiba', state: 'PR', position: 'Socio', source: 'Evento', employees: 10, clients: 140 }),

  // ---- Advocacia - DF ----
  p({ companyName: 'Capital Law', contactName: 'Dr. Alexandre Santos', phone: '61933221100', email: 'alexandre@capitallaw.adv.br', segment: 'Advocacia', partnerCategory: 'advocacia', city: 'Brasilia', state: 'DF', position: 'Fundador', source: 'Site', employees: 18, clients: 420 }),

  // ---- Associacao - SP ----
  p({ companyName: 'ACSP - Associacao Comercial SP', contactName: 'Mauricio Tavares', phone: '11988776655', email: 'mauricio@acsp.org.br', segment: 'Associacao', partnerCategory: 'associacao', city: 'Sao Paulo', state: 'SP', position: 'Diretor Executivo', source: 'Evento', website: 'acsp.org.br', employees: 40, clients: 3500 }),
  p({ companyName: 'CDL Campinas', contactName: 'Ana Maria Lopes', phone: '19977665544', email: 'ana@cdlcampinas.org.br', segment: 'Associacao', partnerCategory: 'associacao', city: 'Campinas', state: 'SP', position: 'Presidente', source: 'Indicacao', employees: 12, clients: 1200 }),

  // ---- Associacao - RJ ----
  p({ companyName: 'CDL Rio de Janeiro', contactName: 'Roberto Nascimento', phone: '21977665544', email: 'roberto@cdlrj.org.br', segment: 'Associacao', partnerCategory: 'associacao', city: 'Rio de Janeiro', state: 'RJ', position: 'Presidente', source: 'Evento', employees: 20, clients: 2800 }),

  // ---- Associacao - MG ----
  p({ companyName: 'Sebrae MG', contactName: 'Claudia Ferreira', phone: '31977665544', email: 'claudia@sebrae.mg.br', segment: 'Associacao', partnerCategory: 'associacao', city: 'Belo Horizonte', state: 'MG', position: 'Gerente Regional', source: 'Indicacao', employees: 80, clients: 8500 }),
  p({ companyName: 'CDL Uberlandia', contactName: 'Marcos Rezende', phone: '34977665544', email: 'marcos@cdluberlandia.org.br', segment: 'Associacao', partnerCategory: 'associacao', city: 'Uberlandia', state: 'MG', position: 'Diretor', source: 'Site', employees: 8, clients: 650 }),

  // ---- Associacao - PR/SC/RS ----
  p({ companyName: 'ACIC Curitiba', contactName: 'Eduardo Becker', phone: '41977665544', email: 'eduardo@acic.org.br', segment: 'Associacao', partnerCategory: 'associacao', city: 'Curitiba', state: 'PR', position: 'Superintendente', source: 'Evento', employees: 15, clients: 1800 }),
  p({ companyName: 'CDL Florianopolis', contactName: 'Marina Vieira', phone: '48977665544', email: 'marina@cdlfloripa.org.br', segment: 'Associacao', partnerCategory: 'associacao', city: 'Florianopolis', state: 'SC', position: 'Presidente', source: 'LinkedIn', employees: 10, clients: 900 }),
  p({ companyName: 'Sebrae RS', contactName: 'Paulo Schneider', phone: '51977665544', email: 'paulo@sebrae.rs.br', segment: 'Associacao', partnerCategory: 'associacao', city: 'Porto Alegre', state: 'RS', position: 'Gerente', source: 'Indicacao', employees: 60, clients: 6200 }),

  // ---- Associacao - NE ----
  p({ companyName: 'Sebrae BA', contactName: 'Renata Oliveira', phone: '71977665544', email: 'renata@sebrae.ba.br', segment: 'Associacao', partnerCategory: 'associacao', city: 'Salvador', state: 'BA', position: 'Coordenadora', source: 'Evento', employees: 50, clients: 5400 }),
  p({ companyName: 'CDL Recife', contactName: 'Fabio Correia', phone: '81977665544', email: 'fabio@cdlrecife.org.br', segment: 'Associacao', partnerCategory: 'associacao', city: 'Recife', state: 'PE', position: 'Presidente', source: 'Site', employees: 12, clients: 1100 }),

  // ---- Associacao - GO/DF ----
  p({ companyName: 'CDL Goiania', contactName: 'Luciano Borges', phone: '62977665544', email: 'luciano@cdlgoiania.org.br', segment: 'Associacao', partnerCategory: 'associacao', city: 'Goiania', state: 'GO', position: 'Diretor', source: 'Evento', employees: 10, clients: 750 }),
  p({ companyName: 'Sebrae DF', contactName: 'Adriana Melo', phone: '61977665544', email: 'adriana@sebrae.df.br', segment: 'Associacao', partnerCategory: 'associacao', city: 'Brasilia', state: 'DF', position: 'Gerente', source: 'Indicacao', employees: 45, clients: 4800 }),

  // ---- Contabilidade - NE ----
  p({ companyName: 'Nordeste Contabil', contactName: 'Sergio Barbosa', phone: '71976543210', email: 'sergio@nordestecontab.com.br', segment: 'Contabilidade', partnerCategory: 'contabilidade', city: 'Salvador', state: 'BA', position: 'Contador', source: 'Google Maps', employees: 10, clients: 190 }),
  p({ companyName: 'Recife Contabilidade', contactName: 'Vanessa Morais', phone: '81976543210', email: 'vanessa@recifecontab.com.br', segment: 'Contabilidade', partnerCategory: 'contabilidade', city: 'Recife', state: 'PE', position: 'Socia', source: 'Indicacao', employees: 7, clients: 120 }),
];

// ==================== FUNCOES DE FILTRO ====================

function normalize(str) {
  return (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function getMockPartners(filters = {}) {
  let results = [...MOCK_PARTNERS];

  if (filters.search) {
    const q = normalize(filters.search);
    results = results.filter(p =>
      normalize(p.companyName).includes(q) ||
      normalize(p.contactName).includes(q) ||
      normalize(p.phone).includes(q) ||
      normalize(p.email).includes(q)
    );
  }

  if (filters.segment) {
    results = results.filter(p => p.segment === filters.segment);
  }
  if (filters.partnerCategory) {
    results = results.filter(p => p.partnerCategory === filters.partnerCategory);
  }
  if (filters.state) {
    results = results.filter(p => p.state === filters.state);
  }
  if (filters.city) {
    const q = normalize(filters.city);
    results = results.filter(p => normalize(p.city).includes(q));
  }
  if (filters.clientRange) {
    const range = CLIENT_RANGES.find(r => r.key === filters.clientRange);
    if (range) {
      results = results.filter(p => {
        if (p.clients == null) return false;
        return p.clients >= range.min && p.clients < range.max;
      });
    }
  }

  // Sorting
  const { sortBy = 'companyName', sortOrder = 'asc' } = filters;
  results.sort((a, b) => {
    const va = a[sortBy] || '';
    const vb = b[sortBy] || '';
    if (typeof va === 'string') {
      return sortOrder === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    }
    return sortOrder === 'asc' ? va - vb : vb - va;
  });

  // Pagination
  const page = filters.page || 1;
  const perPage = filters.perPage || 30;
  const total = results.length;
  const start = (page - 1) * perPage;
  const paged = results.slice(start, start + perPage);

  return { data: paged, count: total };
}

export function getMockPartnerAnalytics(filters = {}) {
  let results = [...MOCK_PARTNERS];

  if (filters.segment) results = results.filter(p => p.segment === filters.segment);
  if (filters.state) results = results.filter(p => p.state === filters.state);
  if (filters.city) {
    const q = normalize(filters.city);
    results = results.filter(p => normalize(p.city).includes(q));
  }

  const total = results.length;
  const bySegment = {};
  const byCity = {};

  results.forEach(r => {
    bySegment[r.segment] = (bySegment[r.segment] || 0) + 1;
    const cityKey = [r.city, r.state].filter(Boolean).join('/');
    byCity[cityKey] = (byCity[cityKey] || 0) + 1;
  });

  return {
    total,
    bySegment: Object.entries(bySegment).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    byCity: Object.entries(byCity).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10),
  };
}

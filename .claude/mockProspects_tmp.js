/**
 * Mock Data para o Gerador de Lista de Prospecao.
 * ~80 prospects com variedade de cidades, segmentos, portes, faturamento, etc.
 *
 * Funcoes exportadas:
 * - getMockProspects(filters) → { data, count }
 * - getMockAnalytics(filters) → analytics object
 * - getMockListNames() → string[]
 */

// ==================== HELPERS GERACAO ====================

let _idCounter = 1;
const id = () => `mock-prospect-${String(_idCounter++).padStart(3, '0')}`;
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
    notes: '',
    status: 'new',
    assignedTo: null,
    assignedMember: null,
    listName: '',
    createdBy: null,
    createdAt: now,
    updatedAt: now,
    foundedYear: null,
    deletedAt: null,
    ...overrides,
  };
}

// ==================== MOCK DATA ====================

export const MOCK_PROSPECTS = [
  // ---- Tecnologia - SP ----
  p({ companyName: 'TechNova Solutions', contactName: 'Rafael Mendes', phone: '11987654321', email: 'rafael@technova.com.br', cnpj: '12.345.678/0001-01', segment: 'Tecnologia', size: 'epp', city: 'Sao Paulo', state: 'SP', position: 'CTO', source: 'LinkedIn', website: 'technova.com.br', revenue: 2500000, employees: 45, listName: 'Tech SP 2024' }),
  p({ companyName: 'CloudBR Sistemas', contactName: 'Camila Rocha', phone: '11976543210', email: 'camila@cloudbr.io', cnpj: '23.456.789/0001-02', segment: 'Tecnologia', size: 'me', city: 'Sao Paulo', state: 'SP', position: 'CEO', source: 'Google Maps', website: 'cloudbr.io', revenue: 800000, employees: 12, listName: 'Tech SP 2024' }),
  p({ companyName: 'DataStream Analytics', contactName: 'Lucas Ferreira', phone: '11965432109', email: 'lucas@datastream.com.br', segment: 'Tecnologia', size: 'media', city: 'Campinas', state: 'SP', position: 'Diretor Comercial', source: 'Indicacao', revenue: 15000000, employees: 200, listName: 'Tech SP 2024' }),
  p({ companyName: 'AppForge Labs', contactName: 'Juliana Santos', email: 'juliana@appforge.dev', segment: 'Tecnologia', size: 'mei', city: 'Sao Paulo', state: 'SP', position: 'Fundadora', source: 'Redes Sociais', revenue: 180000, employees: 4, listName: 'Tech SP 2024' }),
  p({ companyName: 'CyberShield Seguranca', contactName: 'Marcos Oliveira', phone: '19998765432', email: 'marcos@cybershield.com.br', cnpj: '34.567.890/0001-03', segment: 'Tecnologia', size: 'epp', city: 'Campinas', state: 'SP', position: 'Gerente de TI', source: 'Evento', website: 'cybershield.com.br', revenue: 3200000, employees: 60, listName: 'Tech SP 2024' }),

  // ---- Tecnologia - RJ ----
  p({ companyName: 'PixelCraft Digital', contactName: 'Amanda Costa', phone: '21987654321', email: 'amanda@pixelcraft.com.br', segment: 'Tecnologia', size: 'me', city: 'Rio de Janeiro', state: 'RJ', position: 'Diretora Criativa', source: 'LinkedIn', revenue: 650000, employees: 10, listName: 'Tech RJ' }),
  p({ companyName: 'NetWave Telecom', contactName: 'Bruno Almeida', phone: '21976543210', segment: 'Tecnologia', size: 'media', city: 'Rio de Janeiro', state: 'RJ', position: 'VP Vendas', source: 'Indicacao', revenue: 28000000, employees: 350, listName: 'Tech RJ' }),

  // ---- Saude ----
  p({ companyName: 'MedVida Clinicas', contactName: 'Dra. Patricia Lima', phone: '11988776655', email: 'patricia@medvida.com.br', cnpj: '45.678.901/0001-04', segment: 'Saude', size: 'epp', city: 'Sao Paulo', state: 'SP', position: 'Diretora Medica', source: 'Google Maps', website: 'medvida.com.br', revenue: 4800000, employees: 85 }),
  p({ companyName: 'FarmaExpress Ltda', contactName: 'Carlos Souza', phone: '31987654321', email: 'carlos@farmaexpress.com.br', segment: 'Saude', size: 'me', city: 'Belo Horizonte', state: 'MG', position: 'Gerente Geral', source: 'Site', revenue: 1200000, employees: 22, listName: 'Saude MG' }),
  p({ companyName: 'BioLab Diagnosticos', contactName: 'Fernanda Martins', phone: '41998765432', email: 'fernanda@biolab.com.br', cnpj: '56.789.012/0001-05', segment: 'Saude', size: 'media', city: 'Curitiba', state: 'PR', position: 'CEO', source: 'Evento', website: 'biolab.com.br', revenue: 22000000, employees: 280, listName: 'Saude Sul' }),
  p({ companyName: 'OdontoPlus', contactName: 'Ricardo Neves', email: 'ricardo@odontoplus.com.br', segment: 'Saude', size: 'mei', city: 'Florianopolis', state: 'SC', position: 'Proprietario', source: 'Redes Sociais', revenue: 320000, employees: 6 }),
  p({ companyName: 'VitaCare Homecare', contactName: 'Ana Paula Ribeiro', phone: '51987654321', segment: 'Saude', size: 'me', city: 'Porto Alegre', state: 'RS', position: 'Coordenadora', source: 'Indicacao', revenue: 900000, employees: 18, listName: 'Saude Sul' }),

  // ---- Educacao ----
  p({ companyName: 'EduTech Brasil', contactName: 'Thiago Gomes', phone: '11955443322', email: 'thiago@edutech.com.br', cnpj: '67.890.123/0001-06', segment: 'Educacao', size: 'epp', city: 'Sao Paulo', state: 'SP', position: 'Diretor Pedagogico', source: 'LinkedIn', website: 'edutech.com.br', revenue: 5500000, employees: 95 }),
  p({ companyName: 'Escola Futuro Digital', contactName: 'Maria Clara Dias', phone: '21966554433', email: 'mariaclara@futurodigital.edu.br', segment: 'Educacao', size: 'me', city: 'Rio de Janeiro', state: 'RJ', position: 'Coordenadora', source: 'Google Maps', revenue: 1800000, employees: 35 }),
  p({ companyName: 'Instituto Saber+', contactName: 'Pedro Henrique', email: 'pedro@sabermais.org.br', segment: 'Educacao', size: 'mei', city: 'Salvador', state: 'BA', position: 'Diretor', source: 'Redes Sociais', revenue: 450000, employees: 8, listName: 'Educacao NE' }),
  p({ companyName: 'UniCorp Treinamentos', contactName: 'Beatriz Mendonca', phone: '61998877665', email: 'beatriz@unicorp.com.br', segment: 'Educacao', size: 'epp', city: 'Brasilia', state: 'DF', position: 'Gerente Comercial', source: 'Evento', revenue: 3800000, employees: 55 }),

  // ---- Varejo ----
  p({ companyName: 'MegaShop Varejo', contactName: 'Jose Roberto Silva', phone: '11944332211', email: 'jose@megashop.com.br', cnpj: '78.901.234/0001-07', segment: 'Varejo', size: 'media', city: 'Sao Paulo', state: 'SP', position: 'Diretor de Operacoes', source: 'Indicacao', website: 'megashop.com.br', revenue: 45000000, employees: 500, listName: 'Varejo Grande SP' }),
  p({ companyName: 'Loja Express Center', contactName: 'Sandra Pereira', phone: '31976543210', email: 'sandra@lojaexpress.com.br', segment: 'Varejo', size: 'epp', city: 'Belo Horizonte', state: 'MG', position: 'Gerente de Loja', source: 'Google Maps', revenue: 6200000, employees: 110 }),
  p({ companyName: 'ModaFit Boutique', contactName: 'Larissa Campos', email: 'larissa@modafit.com.br', segment: 'Varejo', size: 'mei', city: 'Curitiba', state: 'PR', position: 'Proprietaria', source: 'Redes Sociais', revenue: 280000, employees: 5 }),
  p({ companyName: 'SuperBom Mercados', contactName: 'Antonio Carlos', phone: '51966778899', segment: 'Varejo', size: 'media', city: 'Porto Alegre', state: 'RS', position: 'Diretor Geral', source: 'Lista comprada', revenue: 35000000, employees: 420, listName: 'Varejo Sul' }),
  p({ companyName: 'TechStore Eletronicos', contactName: 'Felipe Nunes', phone: '85987654321', email: 'felipe@techstore.com.br', segment: 'Varejo', size: 'me', city: 'Fortaleza', state: 'CE', position: 'Socio', source: 'Site', revenue: 1500000, employees: 25, listName: 'Varejo NE' }),

  // ---- Industria ----
  p({ companyName: 'MetalForge Industria', contactName: 'Roberto Machado', phone: '19988776655', email: 'roberto@metalforge.ind.br', cnpj: '89.012.345/0001-08', segment: 'Industria', size: 'grande', city: 'Campinas', state: 'SP', position: 'Diretor Industrial', source: 'Indicacao', website: 'metalforge.ind.br', revenue: 52000000, employees: 600, listName: 'Industria SP' }),
  p({ companyName: 'PlastiForm Embalagens', contactName: 'Renata Azevedo', phone: '47998765432', email: 'renata@plastiform.com.br', segment: 'Industria', size: 'epp', city: 'Joinville', state: 'SC', position: 'Gerente Comercial', source: 'Evento', revenue: 8500000, employees: 130, listName: 'Industria Sul' }),
  p({ companyName: 'AgroMaq Equipamentos', contactName: 'Marcos Teixeira', phone: '62987654321', segment: 'Industria', size: 'epp', city: 'Goiania', state: 'GO', position: 'Gerente de Vendas', source: 'Google Maps', revenue: 7200000, employees: 95 }),
  p({ companyName: 'TextilBR Confeccoes', contactName: 'Claudia Barros', email: 'claudia@textilbr.com.br', segment: 'Industria', size: 'me', city: 'Blumenau', state: 'SC', position: 'Diretora', source: 'LinkedIn', revenue: 2100000, employees: 40, listName: 'Industria Sul' }),

  // ---- Servicos ----
  p({ companyName: 'ConsultPro Assessoria', contactName: 'Daniel Vieira', phone: '11933221100', email: 'daniel@consultpro.com.br', segment: 'Servicos', size: 'me', city: 'Sao Paulo', state: 'SP', position: 'Socio', source: 'LinkedIn', revenue: 1100000, employees: 15 }),
  p({ companyName: 'LimpaMax Servicos', contactName: 'Elaine Rodrigues', phone: '21955443322', email: 'elaine@limpamax.com.br', segment: 'Servicos', size: 'epp', city: 'Rio de Janeiro', state: 'RJ', position: 'Diretora Operacional', source: 'Google Maps', revenue: 4200000, employees: 180 }),
  p({ companyName: 'LogiMove Transportes', contactName: 'Fabio Santos', phone: '41977665544', segment: 'Servicos', size: 'media', city: 'Curitiba', state: 'PR', position: 'Gerente Logistico', source: 'Indicacao', revenue: 18000000, employees: 250 }),
  p({ companyName: 'SegurancaTotal Ltda', contactName: 'Wagner Costa', email: 'wagner@segurancatotal.com.br', segment: 'Servicos', size: 'epp', city: 'Belo Horizonte', state: 'MG', position: 'Diretor', source: 'Lista comprada', revenue: 6800000, employees: 300 }),
  p({ companyName: 'RH Talentos Consultoria', contactName: 'Priscila Duarte', phone: '61955667788', email: 'priscila@rhtalentos.com.br', segment: 'Servicos', size: 'mei', city: 'Brasilia', state: 'DF', position: 'Fundadora', source: 'Redes Sociais', revenue: 350000, employees: 7 }),

  // ---- Financeiro ----
  p({ companyName: 'FinTech Capital', contactName: 'Gustavo Pinto', phone: '11922110099', email: 'gustavo@fintechcapital.com.br', cnpj: '90.123.456/0001-09', segment: 'Financeiro', size: 'epp', city: 'Sao Paulo', state: 'SP', position: 'CFO', source: 'LinkedIn', website: 'fintechcapital.com.br', revenue: 9500000, employees: 70 }),
  p({ companyName: 'CrediFacil Promotora', contactName: 'Michele Tavares', phone: '31966554433', email: 'michele@credifacil.com.br', segment: 'Financeiro', size: 'me', city: 'Belo Horizonte', state: 'MG', position: 'Gerente', source: 'Google Maps', revenue: 2800000, employees: 30 }),
  p({ companyName: 'InvestSmart Consultoria', contactName: 'Rodrigo Lima', email: 'rodrigo@investsmart.com.br', segment: 'Financeiro', size: 'mei', city: 'Rio de Janeiro', state: 'RJ', position: 'Consultor Senior', source: 'Indicacao', revenue: 520000, employees: 5 }),

  // ---- Construcao ----
  p({ companyName: 'Construtora Horizonte', contactName: 'Henrique Moraes', phone: '11988990011', email: 'henrique@consthoriz.com.br', cnpj: '01.234.567/0001-10', segment: 'Construcao', size: 'media', city: 'Sao Paulo', state: 'SP', position: 'Engenheiro Chefe', source: 'Evento', website: 'consthoriz.com.br', revenue: 42000000, employees: 480, listName: 'Construcao SP' }),
  p({ companyName: 'Reforma Express', contactName: 'Tatiane Sousa', phone: '21944332211', segment: 'Construcao', size: 'me', city: 'Rio de Janeiro', state: 'RJ', position: 'Coordenadora', source: 'Google Maps', revenue: 1600000, employees: 28 }),
  p({ companyName: 'ArquiDesign Studio', contactName: 'Gabriela Monteiro', email: 'gabriela@arquidesign.com.br', segment: 'Construcao', size: 'mei', city: 'Florianopolis', state: 'SC', position: 'Arquiteta', source: 'Redes Sociais', revenue: 420000, employees: 6 }),

  // ---- Alimenticio ----
  p({ companyName: 'SaborBrasil Alimentos', contactName: 'Paulo Henrique', phone: '11977889900', email: 'paulo@saborbrasil.com.br', segment: 'Alimenticio', size: 'media', city: 'Sao Paulo', state: 'SP', position: 'Diretor Comercial', source: 'Indicacao', revenue: 38000000, employees: 350, listName: 'Alimentos SP' }),
  p({ companyName: 'PadariaGourmet', contactName: 'Renata Lopes', phone: '31955667788', email: 'renata@padariagourmet.com.br', segment: 'Alimenticio', size: 'mei', city: 'Belo Horizonte', state: 'MG', position: 'Proprietaria', source: 'Google Maps', revenue: 480000, employees: 12 }),
  p({ companyName: 'FrigoNorte Carnes', contactName: 'Joao Batista', phone: '92987654321', segment: 'Alimenticio', size: 'epp', city: 'Manaus', state: 'AM', position: 'Gerente', source: 'Lista comprada', revenue: 5600000, employees: 80 }),
  p({ companyName: 'NutriVida Organicos', contactName: 'Isabela Mendes', email: 'isabela@nutrivida.com.br', segment: 'Alimenticio', size: 'me', city: 'Curitiba', state: 'PR', position: 'Fundadora', source: 'Redes Sociais', revenue: 950000, employees: 14 }),

  // ---- Logistica ----
  p({ companyName: 'TransLog Express', contactName: 'Marcelo Prado', phone: '11966778899', email: 'marcelo@translog.com.br', cnpj: '12.345.000/0001-11', segment: 'Logistica', size: 'media', city: 'Sao Paulo', state: 'SP', position: 'Diretor de Frota', source: 'Evento', website: 'translog.com.br', revenue: 25000000, employees: 320 }),
  p({ companyName: 'PortoRapido Logistica', contactName: 'Andre Silveira', phone: '13987654321', email: 'andre@portorapido.com.br', segment: 'Logistica', size: 'epp', city: 'Santos', state: 'SP', position: 'Gerente Operacional', source: 'Indicacao', revenue: 8200000, employees: 110 }),
  p({ companyName: 'VelocityShip', contactName: 'Daniela Torres', email: 'daniela@velocityship.com.br', segment: 'Logistica', size: 'me', city: 'Recife', state: 'PE', position: 'Coordenadora', source: 'LinkedIn', revenue: 1800000, employees: 22, listName: 'Logistica NE' }),

  // ---- Agronegocio ----
  p({ companyName: 'AgroBrasil Commodities', contactName: 'Sergio Campos', phone: '64987654321', email: 'sergio@agrobrasil.com.br', cnpj: '34.567.000/0001-12', segment: 'Agronegocio', size: 'grande', city: 'Rio Verde', state: 'GO', position: 'Diretor', source: 'Evento', website: 'agrobrasil.com.br', revenue: 85000000, employees: 800 }),
  p({ companyName: 'Fazenda Boa Vista', contactName: 'Luciana Ferreira', phone: '66998877665', segment: 'Agronegocio', size: 'epp', city: 'Rondonopolis', state: 'MT', position: 'Administradora', source: 'Indicacao', revenue: 12000000, employees: 60 }),
  p({ companyName: 'SementesPro', contactName: 'Adriano Martins', email: 'adriano@sementespro.com.br', segment: 'Agronegocio', size: 'me', city: 'Londrina', state: 'PR', position: 'Gerente Comercial', source: 'Google Maps', revenue: 3200000, employees: 25 }),
  p({ companyName: 'PecuariaSul', contactName: 'Rita Goncalves', phone: '55987654321', email: 'rita@pecuariasul.com.br', segment: 'Agronegocio', size: 'epp', city: 'Pelotas', state: 'RS', position: 'Socia', source: 'Lista comprada', revenue: 9800000, employees: 45 }),

  // ---- Mais variedade de cidades/estados ----
  p({ companyName: 'NorteTech Inovacao', contactName: 'Felipe Araujo', phone: '91987654321', email: 'felipe@nortetech.com.br', segment: 'Tecnologia', size: 'me', city: 'Belem', state: 'PA', position: 'CTO', source: 'LinkedIn', revenue: 750000, employees: 10 }),
  p({ companyName: 'ClinicaSaude Natal', contactName: 'Dra. Camila Borges', phone: '84987654321', email: 'camila@clinicasaude.com.br', segment: 'Saude', size: 'me', city: 'Natal', state: 'RN', position: 'Diretora', source: 'Google Maps', revenue: 1100000, employees: 20 }),
  p({ companyName: 'EduMais Aracaju', contactName: 'Pedro Nascimento', email: 'pedro@edumais.com.br', segment: 'Educacao', size: 'mei', city: 'Aracaju', state: 'SE', position: 'Coordenador', source: 'Redes Sociais', revenue: 220000, employees: 5 }),
  p({ companyName: 'AutoPecas Centro', contactName: 'Vinicius Amaral', phone: '62977889900', email: 'vinicius@autopecas.com.br', segment: 'Varejo', size: 'epp', city: 'Goiania', state: 'GO', position: 'Gerente', source: 'Google Maps', revenue: 4500000, employees: 65 }),
  p({ companyName: 'Construtora Nordeste', contactName: 'Leandro Alves', phone: '71987654321', segment: 'Construcao', size: 'epp', city: 'Salvador', state: 'BA', position: 'Engenheiro', source: 'Indicacao', revenue: 7800000, employees: 120 }),

  // ---- Mais prospects para diversidade ----
  p({ companyName: 'SmartHome IoT', contactName: 'Carolina Freitas', phone: '11955667788', email: 'carolina@smarthome.com.br', segment: 'Tecnologia', size: 'me', city: 'Sao Paulo', state: 'SP', position: 'COO', source: 'LinkedIn', revenue: 1800000, employees: 18 }),
  p({ companyName: 'GreenEnergy Solar', contactName: 'Thiago Barbosa', phone: '31944556677', email: 'thiago@greenenergy.com.br', segment: 'Industria', size: 'epp', city: 'Uberlandia', state: 'MG', position: 'Diretor', source: 'Evento', revenue: 6500000, employees: 85 }),
  p({ companyName: 'PetLove Veterinaria', contactName: 'Mariana Costa', email: 'mariana@petlove.vet.br', segment: 'Saude', size: 'mei', city: 'Curitiba', state: 'PR', position: 'Veterinaria', source: 'Redes Sociais', revenue: 380000, employees: 8 }),
  p({ companyName: 'CafeGourmet Premium', contactName: 'Eduardo Pires', phone: '35987654321', segment: 'Alimenticio', size: 'me', city: 'Pocos de Caldas', state: 'MG', position: 'Proprietario', source: 'Google Maps', revenue: 1200000, employees: 15 }),
  p({ companyName: 'SeguraTech Vigilancia', contactName: 'Fabiana Melo', phone: '81987654321', email: 'fabiana@seguratech.com.br', segment: 'Servicos', size: 'epp', city: 'Recife', state: 'PE', position: 'Gerente', source: 'Lista comprada', revenue: 5200000, employees: 200, listName: 'Servicos NE' }),

  p({ companyName: 'InovaPharma Ltda', contactName: 'Dr. Alexandre Santos', phone: '11933445566', email: 'alexandre@inovapharma.com.br', cnpj: '45.678.000/0001-13', segment: 'Saude', size: 'media', city: 'Sao Paulo', state: 'SP', position: 'Diretor P&D', source: 'Evento', website: 'inovapharma.com.br', revenue: 32000000, employees: 400 }),
  p({ companyName: 'DesignHub Criativo', contactName: 'Natalia Ribeiro', email: 'natalia@designhub.com.br', segment: 'Servicos', size: 'mei', city: 'Porto Alegre', state: 'RS', position: 'Designer Lead', source: 'Redes Sociais', revenue: 250000, employees: 4 }),
  p({ companyName: 'Imobiliaria Planalto', contactName: 'Sergio Neto', phone: '61944556677', email: 'sergio@planalto.imob.br', segment: 'Servicos', size: 'me', city: 'Brasilia', state: 'DF', position: 'Corretor Chefe', source: 'Site', revenue: 2200000, employees: 18 }),
  p({ companyName: 'BarraTech Automacao', contactName: 'Rodrigo Mendonca', phone: '47987654321', email: 'rodrigo@barratech.com.br', segment: 'Tecnologia', size: 'epp', city: 'Joinville', state: 'SC', position: 'Engenheiro', source: 'LinkedIn', revenue: 4800000, employees: 55 }),
  p({ companyName: 'CoopAgro Cooperativa', contactName: 'Maria Aparecida', phone: '44987654321', segment: 'Agronegocio', size: 'grande', city: 'Maringa', state: 'PR', position: 'Presidente', source: 'Evento', revenue: 65000000, employees: 500 }),

  p({ companyName: 'SolucaoWeb Agency', contactName: 'Vitor Hugo', email: 'vitor@solucaoweb.com.br', segment: 'Tecnologia', size: 'mei', city: 'Florianopolis', state: 'SC', position: 'Desenvolvedor', source: 'Redes Sociais', revenue: 150000, employees: 3 }),
  p({ companyName: 'FitGym Academia', contactName: 'Aline Carvalho', phone: '21933445566', email: 'aline@fitgym.com.br', segment: 'Saude', size: 'me', city: 'Niteroi', state: 'RJ', position: 'Gerente', source: 'Google Maps', revenue: 850000, employees: 20 }),
  p({ companyName: 'PapelariaCentral', contactName: 'Marcos Vieira', phone: '11922334455', segment: 'Varejo', size: 'mei', city: 'Guarulhos', state: 'SP', position: 'Proprietario', source: 'Google Maps', revenue: 320000, employees: 6 }),
  p({ companyName: 'EngenhariaTop', contactName: 'Ricardo Braga', phone: '31922334455', email: 'ricardo@engenhariatop.com.br', segment: 'Construcao', size: 'me', city: 'Belo Horizonte', state: 'MG', position: 'Socio', source: 'Indicacao', revenue: 2800000, employees: 35 }),
  p({ companyName: 'AgroMinas Sementes', contactName: 'Claudemir Silva', email: 'claudemir@agrominas.com.br', segment: 'Agronegocio', size: 'me', city: 'Uberlandia', state: 'MG', position: 'Comercial', source: 'Google Maps', revenue: 4100000, employees: 28 }),

  p({ companyName: 'TelecomBR Solucoes', contactName: 'Patricia Soares', phone: '71966778899', email: 'patricia@telecombr.com.br', segment: 'Tecnologia', size: 'epp', city: 'Salvador', state: 'BA', position: 'Gerente de Contas', source: 'LinkedIn', revenue: 6200000, employees: 75 }),
  p({ companyName: 'CasaDecor Moveis', contactName: 'Luciano Ferraz', phone: '41955667788', segment: 'Varejo', size: 'me', city: 'Curitiba', state: 'PR', position: 'Gerente', source: 'Google Maps', revenue: 1400000, employees: 20 }),
  p({ companyName: 'ContabilExpress', contactName: 'Sandra Machado', email: 'sandra@contabilexpress.com.br', segment: 'Financeiro', size: 'mei', city: 'Campinas', state: 'SP', position: 'Contadora', source: 'Indicacao', revenue: 280000, employees: 4 }),
  p({ companyName: 'EcoPack Embalagens', contactName: 'Fernando Reis', phone: '19955443322', email: 'fernando@ecopack.com.br', segment: 'Industria', size: 'me', city: 'Piracicaba', state: 'SP', position: 'Diretor', source: 'Evento', revenue: 2500000, employees: 32, listName: 'Industria SP' }),
  p({ companyName: 'AquaVida Tratamento', contactName: 'Juliana Paes', phone: '27987654321', email: 'juliana@aquavida.com.br', segment: 'Servicos', size: 'epp', city: 'Vitoria', state: 'ES', position: 'Diretora', source: 'Site', revenue: 3800000, employees: 45 }),

  p({ companyName: 'LaticinioBrasil', contactName: 'Marcio Nunes', phone: '34987654321', segment: 'Alimenticio', size: 'epp', city: 'Uberaba', state: 'MG', position: 'Gerente Industrial', source: 'Indicacao', revenue: 7500000, employees: 95 }),
  p({ companyName: 'InfoSchool Sistemas', contactName: 'Tatiana Alves', email: 'tatiana@infoschool.com.br', segment: 'Educacao', size: 'me', city: 'Goiania', state: 'GO', position: 'Diretora de TI', source: 'LinkedIn', revenue: 1300000, employees: 16 }),
  p({ companyName: 'SteelBR Metalurgica', contactName: 'Paulo Roberto', phone: '15987654321', email: 'paulo@steelbr.ind.br', cnpj: '56.789.000/0001-14', segment: 'Industria', size: 'media', city: 'Sorocaba', state: 'SP', position: 'Diretor Tecnico', source: 'Evento', website: 'steelbr.ind.br', revenue: 48000000, employees: 550, listName: 'Industria SP' }),
  p({ companyName: 'CoworkHub Espacos', contactName: 'Daniela Gomes', phone: '48987654321', email: 'daniela@coworkhub.com.br', segment: 'Servicos', size: 'me', city: 'Florianopolis', state: 'SC', position: 'Fundadora', source: 'Redes Sociais', revenue: 650000, employees: 8 }),
  p({ companyName: 'FarmaVerde Natural', contactName: 'Cristina Moreira', email: 'cristina@farmaverde.com.br', segment: 'Saude', size: 'mei', city: 'Curitiba', state: 'PR', position: 'Farmaceutica', source: 'Google Maps', revenue: 290000, employees: 5 }),

  // ---- Ultimos para completar ~80 ----
  p({ companyName: 'RoboTech Automacao', contactName: 'Anderson Lira', phone: '81955667788', email: 'anderson@robotech.com.br', segment: 'Tecnologia', size: 'epp', city: 'Recife', state: 'PE', position: 'CTO', source: 'Evento', revenue: 5800000, employees: 68, listName: 'Tech NE' }),
  p({ companyName: 'JuridikPro Advocacia', contactName: 'Dra. Fernanda Castro', phone: '11988776600', email: 'fernanda@juridikpro.adv.br', segment: 'Servicos', size: 'me', city: 'Sao Paulo', state: 'SP', position: 'Socia', source: 'Indicacao', revenue: 1800000, employees: 12 }),
  p({ companyName: 'TurismoVip Viagens', contactName: 'Marcos Aurelio', email: 'marcos@turismovip.com.br', segment: 'Servicos', size: 'mei', city: 'Salvador', state: 'BA', position: 'Diretor', source: 'Redes Sociais', revenue: 450000, employees: 6, listName: 'Servicos NE' }),
  p({ companyName: 'MineraBR Extracao', contactName: 'Joao Almeida', phone: '38987654321', segment: 'Industria', size: 'grande', city: 'Montes Claros', state: 'MG', position: 'Gerente de Mina', source: 'Lista comprada', revenue: 72000000, employees: 700 }),
  p({ companyName: 'EventosPro Producoes', contactName: 'Carla Souza', phone: '11944556677', email: 'carla@eventospro.com.br', segment: 'Servicos', size: 'me', city: 'Sao Paulo', state: 'SP', position: 'Produtora', source: 'Redes Sociais', revenue: 980000, employees: 10 }),
];

// Atribuir foundedYear realista por porte (MEI tende a ser mais recente, Grande mais antigo)
const _YEAR_RANGES = { mei: [2020, 2025], me: [2017, 2024], epp: [2014, 2023], media: [2008, 2019], grande: [2000, 2012] };
MOCK_PROSPECTS.forEach((item, i) => {
  const range = _YEAR_RANGES[item.size] || [2015, 2023];
  const span = range[1] - range[0];
  item.foundedYear = range[0] + (i % (span + 1));
});

// ==================== FAIXAS DE FATURAMENTO ====================

export const REVENUE_RANGES = [
  { key: 'ate100k', label: 'Ate R$ 100 mil/ano', min: 0, max: 100000 },
  { key: '100k-500k', label: 'R$ 100 mil - 500 mil/ano', min: 100000, max: 500000 },
  { key: '500k-1m', label: 'R$ 500 mil - 1 milhao/ano', min: 500000, max: 1000000 },
  { key: '1m-5m', label: 'R$ 1M - 5M/ano', min: 1000000, max: 5000000 },
  { key: '5m-50m', label: 'R$ 5M - 50M/ano', min: 5000000, max: 50000000 },
  { key: 'acima50m', label: 'Acima de R$ 50M/ano', min: 50000000, max: Infinity },
];

// ==================== FILTRAGEM ====================

function applyFilters(prospects, filters = {}) {
  const { search, segment, size, state, city, source, listName, revenueRange, hasPhone, hasEmail, sortBy, sortOrder } = filters;

  let result = [...prospects];

  if (search) {
    const q = search.toLowerCase();
    result = result.filter(p =>
      (p.companyName || '').toLowerCase().includes(q) ||
      (p.contactName || '').toLowerCase().includes(q) ||
      (p.phone || '').includes(q) ||
      (p.email || '').toLowerCase().includes(q)
    );
  }
  if (segment) result = result.filter(p => p.segment === segment);
  if (size) result = result.filter(p => p.size === size);
  if (state) result = result.filter(p => p.state === state);
  if (city) result = result.filter(p => p.city === city);
  if (source) result = result.filter(p => p.source === source);
  if (listName) result = result.filter(p => p.listName === listName);
  if (hasPhone) result = result.filter(p => p.phone && p.phone.trim());
  if (hasEmail) result = result.filter(p => p.email && p.email.trim());

  if (revenueRange) {
    const range = REVENUE_RANGES.find(r => r.key === revenueRange);
    if (range) {
      result = result.filter(p => {
        if (p.revenue == null) return false;
        return p.revenue >= range.min && p.revenue < range.max;
      });
    }
  }

  // Sort
  const sortKey = sortBy || 'companyName';
  const dir = sortOrder === 'desc' ? -1 : 1;
  result.sort((a, b) => {
    const va = a[sortKey] || '';
    const vb = b[sortKey] || '';
    if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
    return String(va).localeCompare(String(vb)) * dir;
  });

  return result;
}

// ==================== FUNCOES EXPORTADAS ====================

export function getMockProspects(filters = {}) {
  const { page = 1, perPage = 30 } = filters;
  const filtered = applyFilters(MOCK_PROSPECTS, filters);
  const total = filtered.length;
  const start = (page - 1) * perPage;
  const paged = filtered.slice(start, start + perPage);

  return { data: paged, count: total };
}

export function getMockAnalytics(filters = {}) {
  const filtered = applyFilters(MOCK_PROSPECTS, filters);
  const total = filtered.length;

  if (total === 0) {
    return { total: 0, withEmail: 0, withPhone: 0, contactable: 0, avgRevenue: 0, bySegment: [], bySize: [], byCity: [], bySource: [], revenueBySegment: [] };
  }

  const withEmail = filtered.filter(r => r.email && r.email.trim()).length;
  const withPhone = filtered.filter(r => r.phone && r.phone.trim()).length;
  const contactable = filtered.filter(r => (r.email && r.email.trim()) && (r.phone && r.phone.trim())).length;

  // Faturamento medio
  const withRevenue = filtered.filter(r => r.revenue != null && r.revenue > 0);
  const avgRevenue = withRevenue.length > 0
    ? Math.round(withRevenue.reduce((sum, r) => sum + r.revenue, 0) / withRevenue.length)
    : 0;

  const groupBy = (arr, key) => {
    const map = {};
    arr.forEach(r => {
      const val = r[key] || 'Nao informado';
      map[val] = (map[val] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const bySegment = groupBy(filtered, 'segment');
  const bySize = groupBy(filtered, 'size');
  const bySource = groupBy(filtered, 'source');

  const cityMap = {};
  filtered.forEach(r => {
    const c = r.city?.trim();
    const s = r.state?.trim();
    if (!c && !s) { cityMap['Nao informado'] = (cityMap['Nao informado'] || 0) + 1; return; }
    const key = [c, s].filter(Boolean).join('/');
    cityMap[key] = (cityMap[key] || 0) + 1;
  });
  const byCity = Object.entries(cityMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Faturamento medio por segmento
  const segRevMap = {};
  filtered.forEach(r => {
    const seg = r.segment || 'Nao informado';
    if (r.revenue != null && r.revenue > 0) {
      if (!segRevMap[seg]) segRevMap[seg] = { sum: 0, count: 0 };
      segRevMap[seg].sum += r.revenue;
      segRevMap[seg].count += 1;
    }
  });
  const revenueBySegment = Object.entries(segRevMap)
    .map(([name, { sum, count }]) => ({ name, value: Math.round(sum / count) }))
    .sort((a, b) => b.value - a.value);

  // Top segmento e top cidade (para KPIs de mercado)
  const topSegment = bySegment.length > 0 ? bySegment[0] : null;
  const topCity = byCity.length > 0 ? byCity[0] : null;
  // Ticket medio do segmento com maior faturamento medio
  const topRevenueSegment = revenueBySegment.length > 0 ? revenueBySegment[0] : null;
  const uniqueSegments = new Set(filtered.map(r => r.segment).filter(Boolean)).size;
  const uniqueCities = new Set(filtered.map(r => r.city).filter(Boolean)).size;

  // Empresas novas (abertas nos ultimos 2 anos)
  const currentYear = new Date().getFullYear();
  const newCompanies = filtered.filter(r => r.foundedYear && r.foundedYear >= currentYear - 2).length;

  return { total, withEmail, withPhone, contactable, avgRevenue, topSegment, topCity, topRevenueSegment, uniqueSegments, uniqueCities, newCompanies, bySegment, bySize, byCity, bySource, revenueBySegment };
}

export function getMockListNames() {
  const names = [...new Set(MOCK_PROSPECTS.map(p => p.listName).filter(Boolean))];
  return names.sort();
}

/**
 * Retorna cidades reais do Brasil agrupadas por estado.
 * Usa o dataset CITIES_BY_STATE (~1500 cidades reais).
 * Se `uf` for passado, retorna apenas as cidades daquele estado.
 * Se nao, retorna todas as cidades de todos os estados (sorted).
 */
import { CITIES_BY_STATE } from './brazilCities';

export function getCitiesByState(uf) {
  if (uf) {
    return (CITIES_BY_STATE[uf] || []).slice().sort();
  }
  const all = Object.values(CITIES_BY_STATE).flat();
  return [...new Set(all)].sort();
}

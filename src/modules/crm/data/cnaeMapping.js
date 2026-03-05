/**
 * Mapeamento de Segmentos da UI para codigos CNAE (Receita Federal).
 * Usado pelo Edge Function search-leads para traduzir filtros.
 *
 * Formato CNAE: 7 digitos sem pontuacao (ex: "6201501")
 * Fonte: https://concla.ibge.gov.br/busca-online-cnae.html
 */

export const SEGMENT_TO_CNAE = {
  Tecnologia: [
    '6201501', // Desenvolvimento de programas de computador sob encomenda
    '6201502', // Web design
    '6202300', // Desenvolvimento e licenciamento de programas customizaveis
    '6203100', // Desenvolvimento e licenciamento de programas nao-customizaveis
    '6204000', // Consultoria em tecnologia da informacao
    '6209100', // Suporte tecnico, manutencao e outros servicos em TI
    '6311900', // Tratamento de dados, provedores de hospedagem
    '6319400', // Portais, provedores de conteudo e outros servicos de internet
  ],
  Saude: [
    '8610101', // Atividades de atendimento hospitalar (exceto pronto-socorro)
    '8610102', // Atividades de atendimento em pronto-socorro
    '8630501', // Atividade medica ambulatorial com recursos para exames complementares
    '8630502', // Atividade medica ambulatorial com recursos para pequenas cirurgias
    '8630503', // Atividade medica ambulatorial restrita a consultas
    '8630504', // Atividade odontologica
    '8650001', // Atividades de enfermagem
    '8650002', // Atividades de profissionais da nutricao
    '8650003', // Atividades de psicologia e psicanalise
    '8650004', // Atividades de fisioterapia
    '8690901', // Atividades de praticas integrativas e complementares
  ],
  Educacao: [
    '8511200', // Educacao infantil — creche
    '8512100', // Educacao infantil — pre-escola
    '8513900', // Ensino fundamental
    '8520100', // Ensino medio
    '8531700', // Educacao superior — graduacao
    '8532500', // Educacao superior — pos-graduacao e extensao
    '8541400', // Educacao profissional de nivel tecnico
    '8542200', // Educacao profissional de nivel tecnologico
    '8591100', // Ensino de esportes
    '8592901', // Ensino de danca
    '8593700', // Ensino de idiomas
    '8599603', // Treinamento em informatica
    '8599604', // Treinamento em desenvolvimento profissional e gerencial
    '8599605', // Cursos preparatorios para concursos
  ],
  Varejo: [
    '4711301', // Comercio varejista de mercadorias em geral, com predominancia de alimentos — hipermercados
    '4711302', // Comercio varejista de mercadorias em geral, com predominancia de alimentos — supermercados
    '4712100', // Comercio varejista de mercadorias em geral, com predominancia de alimentos — minimercados
    '4713001', // Lojas de departamentos ou magazines
    '4713002', // Lojas de variedades (exceto lojas de departamentos)
    '4713004', // Lojas de departamentos ou magazines (eletrodomesticos)
    '4751201', // Comercio varejista especializado de equipamentos e suprimentos de informatica
    '4753900', // Comercio varejista de artigos de relojoaria
    '4755501', // Comercio varejista de tecidos
    '4755502', // Comercio varejista de artigos de armarinho
    '4781400', // Comercio varejista de artigos de vestuario e acessorios
    '4782201', // Comercio varejista de calcados
    '4789001', // Comercio varejista de suvenires, bijuterias e artesanatos
  ],
  Industria: [
    '1011201', // Frigorifico — abate de bovinos
    '1012101', // Abate de aves
    '1091100', // Fabricacao de produtos de panificacao
    '2511000', // Fabricacao de estruturas metalicas
    '2599301', // Servicos de confeccao de armacoes metalicas
    '2710401', // Fabricacao de motores eletricos
    '2710402', // Fabricacao de transformadores e indutores
    '2751100', // Fabricacao de fogoes, refrigeradores e maquinas de lavar
    '2829199', // Fabricacao de outras maquinas e equipamentos de uso geral
    '2930101', // Fabricacao de cabines, carrocerias e reboques para caminhoes
  ],
  Servicos: [
    '6911701', // Servicos advocaticios
    '6920601', // Atividades de contabilidade
    '6920602', // Atividades de consultoria e auditoria contabil e tributaria
    '7020400', // Atividades de consultoria em gestao empresarial
    '7111100', // Servicos de arquitetura
    '7112000', // Servicos de engenharia
    '7311400', // Agencias de publicidade
    '7319002', // Promocao de vendas
    '7410202', // Design de interiores
    '7410203', // Design de produto
    '7490101', // Servicos de traducao e interpretacao
    '7810800', // Selecao e agenciamento de mao-de-obra
    '8121400', // Limpeza em predios e domicilios
    '8130300', // Atividades paisagisticas
  ],
  Financeiro: [
    '6421200', // Bancos comerciais
    '6422100', // Bancos multiplos, com carteira comercial
    '6423900', // Caixas economicas
    '6431000', // Bancos multiplos, sem carteira comercial
    '6432800', // Bancos de investimento
    '6434400', // Agencias de fomento
    '6435201', // Sociedades de credito imobiliario
    '6436100', // Sociedades de credito, financiamento e investimento
    '6438701', // Bancos de cambio
    '6440900', // Arrendamento mercantil
    '6450600', // Sociedades de capitalizacao
    '6461100', // Holdings de instituicoes financeiras
    '6462000', // Holdings de instituicoes nao-financeiras
    '6499999', // Outras atividades de servicos financeiros
  ],
  Construcao: [
    '4120400', // Construcao de edificios
    '4211101', // Construcao de rodovias e ferrovias
    '4212000', // Construcao de obras de arte especiais
    '4213800', // Obras de urbanizacao — ruas, pracas e calcadas
    '4221901', // Construcao de barragens e represas para geracao de energia
    '4221902', // Construcao de estacoes e redes de distribuicao de energia eletrica
    '4222701', // Construcao de redes de abastecimento de agua e esgoto
    '4291000', // Obras portuarias, maritimas e fluviais
    '4292801', // Montagem de estruturas metalicas
    '4299501', // Construcao de instalacoes esportivas e recreativas
    '4391600', // Obras de fundacoes
    '4399101', // Administracao de obras
    '4399103', // Obras de alvenaria
  ],
  Alimenticio: [
    '1091100', // Fabricacao de produtos de panificacao industrial
    '1091101', // Fabricacao de produtos de panificacao
    '1092900', // Fabricacao de biscoitos e bolachas
    '1093701', // Fabricacao de bombons, balas e semelhantes
    '1094500', // Fabricacao de massas alimenticias
    '1095300', // Fabricacao de especiarias, molhos, temperos e condimentos
    '1099601', // Fabricacao de vinagres
    '5611201', // Restaurantes e similares
    '5611202', // Bares e outros estabelecimentos especializados em servir bebidas
    '5611203', // Lanchonetes, casas de cha, de sucos e similares
    '5612100', // Servicos ambulantes de alimentacao
    '5620101', // Fornecimento de alimentos preparados preponderantemente para empresas
    '5620102', // Servicos de alimentacao para eventos e recepcoes — buffet
  ],
  Logistica: [
    '4911600', // Transporte ferroviario de carga
    '4912401', // Transporte ferroviario de passageiros intermunicipal e interestadual
    '4921301', // Transporte rodoviario coletivo de passageiros (linhas regulares, municipal)
    '4921302', // Transporte rodoviario coletivo de passageiros (linhas regulares, metropolitano)
    '4923001', // Servico de taxi
    '4923002', // Servico de transporte de passageiros — locacao com motorista
    '4930201', // Transporte rodoviario de carga (exceto produtos perigosos)
    '4930202', // Transporte rodoviario de carga (produtos perigosos)
    '5211701', // Armazens gerais — emissao de warrant
    '5211799', // Depositos de mercadorias para terceiros
    '5212500', // Carga e descarga
    '5231101', // Administracao da infraestrutura portuaria
    '5240101', // Operacao dos aeroportos e campos de aterrissagem
    '5250801', // Comissaria de despachos
    '5250803', // Agenciamento de cargas
  ],
  Agronegocio: [
    '0111301', // Cultivo de arroz
    '0111302', // Cultivo de milho
    '0111303', // Cultivo de trigo
    '0112101', // Cultivo de algodao herbaceo
    '0112102', // Cultivo de juta
    '0113000', // Cultivo de cana-de-acucar
    '0115600', // Cultivo de soja
    '0119901', // Cultivo de abacaxi
    '0121101', // Horticultura
    '0131800', // Cultivo de laranja
    '0133401', // Cultivo de acai
    '0141501', // Producao de sementes certificadas
    '0151201', // Criacao de bovinos para corte
    '0151202', // Criacao de bovinos para leite
    '0152101', // Criacao de bufalinos
    '0153901', // Criacao de caprinos
    '0154700', // Criacao de suinos
    '0155501', // Criacao de frangos para corte
  ],
  Outro: [], // Sem filtro CNAE — busca todas as atividades
};

// Reverse map: CNAE code → segment name
export const CNAE_TO_SEGMENT = {};
for (const [segment, codes] of Object.entries(SEGMENT_TO_CNAE)) {
  for (const code of codes) {
    CNAE_TO_SEGMENT[code] = segment;
  }
}

// Mapeamento porte UI → codigos Casa dos Dados
// Casa dos Dados: "01" = Micro Empresa, "03" = Empresa de Pequeno Porte, "05" = Demais
export const SIZE_TO_PORTE = {
  mei: { codigos: ['01'], mei: { optante: true } },
  me: { codigos: ['01'], mei: { excluir_optante: true } },
  epp: { codigos: ['03'] },
  media: { codigos: ['05'] },
  grande: { codigos: ['05'] },
};

// Mapeamento faturamento → capital social (aproximacao)
// Capital social nao e faturamento, mas e o melhor proxy disponivel na Receita Federal
export const REVENUE_TO_CAPITAL = {
  'ate100k': { minimo: 0, maximo: 100000 },
  '100k-500k': { minimo: 100000, maximo: 500000 },
  '500k-1m': { minimo: 500000, maximo: 1000000 },
  '1m-5m': { minimo: 1000000, maximo: 5000000 },
  '5m-50m': { minimo: 5000000, maximo: 50000000 },
  'acima50m': { minimo: 50000000 },
};

// Reverse porte → size label do app
export const PORTE_TO_SIZE = {
  '01': 'me',       // Micro Empresa → ME (ou MEI, verificar campo mei.optante)
  '03': 'epp',      // Empresa de Pequeno Porte → EPP
  '05': 'media',    // Demais → Media/Grande (sem distincao na RF)
};

// ==================== PARCEIROS — CATEGORIAS E CNAEs ====================

/**
 * Categorias de parceiros mapeadas para CNAEs.
 * Usadas na busca via API Casa dos Dados para encontrar parceiros potenciais.
 */
export const PARTNER_CATEGORY_TO_CNAE = {
  contabilidades: [
    '6920601', // Atividades de contabilidade
    '6920602', // Atividades de consultoria e auditoria contabil e tributaria
  ],
  consultorias: [
    '7020400', // Atividades de consultoria em gestao empresarial
    '7490104', // Atividades de intermediacao e agenciamento de servicos e negocios em geral
  ],
  plataformas_digitais: [
    '6201501', // Desenvolvimento de programas de computador sob encomenda
    '6202300', // Desenvolvimento e licenciamento de programas customizaveis
    '6203100', // Desenvolvimento e licenciamento de programas nao-customizaveis
    '6311900', // Tratamento de dados, provedores de hospedagem
    '6319400', // Portais, provedores de conteudo e outros servicos de internet
  ],
  fintechs: [
    '6499999', // Outras atividades de servicos financeiros
    '6619302', // Correspondentes de instituicoes financeiras
    '6613400', // Administracao de cartoes de credito
    '6619399', // Outros servicos auxiliares aos servicos financeiros
  ],
  associacoes: [
    '9411100', // Atividades de organizacoes associativas patronais e empresariais
    '9412099', // Outras atividades associativas profissionais
  ],
  conselhos_classe: [
    '9412001', // Atividades de fiscalizacao profissional
    '9430800', // Atividades de associacoes de defesa de direitos sociais
  ],
  cooperativas_credito: [
    '6424701', // Bancos cooperativos
    '6424702', // Cooperativas centrais de credito
    '6424703', // Cooperativas de credito mutuo
    '6424704', // Cooperativas de credito rural
  ],
  coworkings: [
    '8211300', // Servicos combinados de escritorio e apoio administrativo
    '6810202', // Aluguel de imoveis proprios — inclui coworkings
    '8219901', // Fotocopia, preparacao de documentos e servicos de apoio administrativo
  ],
  franqueadoras: [
    '7740300', // Gestao de ativos intangiveis nao-financeiros (franquias)
  ],
  infoprodutores: [
    '8599604', // Treinamento em desenvolvimento profissional e gerencial
    '8599699', // Outras atividades de ensino nao especificadas anteriormente
    '8550302', // Atividades de apoio a educacao (exceto caixas escolares)
  ],
  distribuidores: [
    '4639701', // Comercio atacadista de produtos alimenticios em geral
    '4691500', // Comercio atacadista de mercadorias em geral
    '4637107', // Comercio atacadista de chocolates, confeitos, balas, bombons e semelhantes
    '4649408', // Comercio atacadista de produtos de higiene, limpeza e conservacao domiciliar
  ],
  sindicatos: [
    '9420100', // Atividades de organizacoes sindicais
  ],
};

// Labels legíveis para as categorias de parceiros
export const PARTNER_CATEGORY_LABELS = {
  contabilidades: 'Contabilidades',
  consultorias: 'Consultorias de Gestao',
  plataformas_digitais: 'Plataformas Digitais / Apps',
  fintechs: 'Fintechs / Maquininhas',
  associacoes: 'Associacoes Comerciais',
  conselhos_classe: 'Conselhos e Entidades de Classe',
  cooperativas_credito: 'Cooperativas de Credito',
  coworkings: 'Coworkings',
  franqueadoras: 'Franqueadoras',
  infoprodutores: 'Infoprodutores / Educacao Empresarial',
  distribuidores: 'Distribuidores / Atacadistas',
  sindicatos: 'Sindicatos Patronais',
};

// Reverse: CNAE → categoria de parceiro
export const CNAE_TO_PARTNER_CATEGORY = {};
for (const [cat, codes] of Object.entries(PARTNER_CATEGORY_TO_CNAE)) {
  for (const code of codes) {
    CNAE_TO_PARTNER_CATEGORY[code] = cat;
  }
}

// Tipos de parceria
export const PARTNER_TYPE_OPTIONS = [
  { key: 'individual', label: 'Individual' },
  { key: 'institucional', label: 'Institucional' },
];

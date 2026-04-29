/**
 * googleSegments.js
 * Lista pre-definida de segmentos otimizados pra Google Places search.
 * Organizada em grupos pra melhor UX no dropdown (uses <optgroup>).
 *
 * Critério: termos curtos em PT-BR que o Google entende como tipo de negocio
 * (validados que retornam empresas reais com phone na maioria dos casos).
 */

export const GOOGLE_SEGMENT_GROUPS = [
  {
    label: 'Alimentação',
    options: [
      'Restaurante', 'Pizzaria', 'Hamburgueria', 'Lanchonete',
      'Padaria', 'Confeitaria', 'Doceria', 'Sorveteria',
      'Cafeteria', 'Bar', 'Pub', 'Buffet', 'Casa de Festa',
    ],
  },
  {
    label: 'Saúde & Bem-estar',
    options: [
      'Clínica Médica', 'Clínica Odontológica', 'Clínica Veterinária',
      'Clínica Estética', 'Clínica de Fisioterapia', 'Laboratório de Análises',
      'Farmácia', 'Drogaria', 'Academia', 'Estúdio de Pilates',
      'Salão de Beleza', 'Barbearia', 'Spa', 'Petshop',
    ],
  },
  {
    label: 'Comércio Varejo',
    options: [
      'Mercado', 'Supermercado', 'Mercearia', 'Açougue', 'Hortifruti',
      'Loja de Roupa', 'Loja de Calçados', 'Boutique',
      'Joalheria', 'Ótica', 'Relojoaria',
      'Livraria', 'Papelaria', 'Floricultura',
      'Loja de Informática', 'Loja de Móveis', 'Loja de Brinquedos',
    ],
  },
  {
    label: 'Serviços Profissionais',
    options: [
      'Escritório de Contabilidade', 'Escritório de Advocacia',
      'Escritório de Engenharia', 'Escritório de Arquitetura',
      'Consultoria Empresarial', 'Consultoria Financeira',
      'Agência de Marketing', 'Agência de Publicidade',
      'Agência de Viagens', 'Agência de RH',
      'Despachante', 'Cartório',
    ],
  },
  {
    label: 'Tecnologia',
    options: [
      'Software House', 'Empresa de TI',
      'Assistência Técnica', 'Loja de Celulares',
      'Provedor de Internet', 'Empresa de Marketing Digital',
    ],
  },
  {
    label: 'Imobiliário & Construção',
    options: [
      'Imobiliária', 'Construtora', 'Material de Construção',
      'Loja de Tintas', 'Marmoraria', 'Vidraçaria',
      'Serralheria', 'Marcenaria', 'Decorador',
    ],
  },
  {
    label: 'Automotivo',
    options: [
      'Oficina Mecânica', 'Auto-elétrica', 'Auto-peças',
      'Lava-rápido', 'Concessionária', 'Locadora de Veículos',
      'Posto de Combustível', 'Auto-escola',
    ],
  },
  {
    label: 'Educação',
    options: [
      'Escola', 'Creche', 'Escola Infantil', 'Colégio',
      'Faculdade', 'Universidade', 'Curso',
      'Escola de Idiomas', 'Escola de Música', 'Escola de Dança',
    ],
  },
  {
    label: 'Hotelaria & Turismo',
    options: [
      'Hotel', 'Pousada', 'Motel', 'Hostel', 'Resort',
    ],
  },
  {
    label: 'Indústria & Atacado',
    options: [
      'Indústria', 'Fábrica', 'Distribuidora',
      'Atacadista', 'Transportadora', 'Logística',
    ],
  },
  {
    label: 'Eventos & Entretenimento',
    options: [
      'Casa de Eventos', 'Casa de Festa Infantil',
      'Empresa de Eventos', 'Estúdio Fotográfico',
    ],
  },
  {
    label: 'Outros Serviços',
    options: [
      'Lavanderia', 'Estacionamento', 'Funilaria',
      'Igreja', 'ONG',
    ],
  },
];

// Lista "flat" pra busca/lookup
export const GOOGLE_SEGMENTS_FLAT = GOOGLE_SEGMENT_GROUPS.flatMap(g => g.options);

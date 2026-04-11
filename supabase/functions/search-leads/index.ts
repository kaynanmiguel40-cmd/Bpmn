/**
 * Supabase Edge Function: search-leads
 *
 * Proxy para API Casa dos Dados (v5) — pesquisa avancada de empresas.
 * Recebe filtros do frontend, traduz para formato Casa dos Dados,
 * chama a API e retorna dados no formato Prospect do app.
 *
 * Env var: CASA_DOS_DADOS_API_KEY
 * Deploy: supabase functions deploy search-leads
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const API_KEY = Deno.env.get('CASA_DOS_DADOS_API_KEY')
const API_URL = 'https://api.casadosdados.com.br/v5/cnpj/pesquisa'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ==================== MAPEAMENTOS ====================

const SEGMENT_TO_CNAE: Record<string, string[]> = {
  Tecnologia: ['6201501', '6202300', '6203100', '6204000', '6209100', '6311900', '6319400'],
  Saude: ['8610101', '8610102', '8630501', '8630502', '8630503', '8630504', '8650001', '8650003', '8650004'],
  Educacao: ['8511200', '8512100', '8513900', '8520100', '8531700', '8541400', '8593700', '8599604'],
  Varejo: ['4711301', '4711302', '4712100', '4713001', '4781400', '4751201', '4782201'],
  Industria: ['1011201', '1012101', '2511000', '2599301', '2710401', '2829199'],
  Servicos: ['6911701', '6920601', '7020400', '7112000', '7311400', '7810800'],
  Financeiro: ['6421200', '6422100', '6431000', '6436100', '6462000', '6499999'],
  Construcao: ['4120400', '4211101', '4292801', '4391600', '4399101', '4399103'],
  Alimenticio: ['5611201', '5611202', '5611203', '5612100', '5620101', '5620102'],
  Logistica: ['4930201', '4930202', '5211701', '5211799', '5212500', '5250803'],
  Agronegocio: ['0111301', '0111302', '0113000', '0115600', '0151201', '0154700'],
}

// Reverse map: CNAE prefix (7 digitos) → segmento
const CNAE_TO_SEGMENT: Record<string, string> = {}
for (const [seg, codes] of Object.entries(SEGMENT_TO_CNAE)) {
  for (const code of codes) {
    CNAE_TO_SEGMENT[code] = seg
  }
}

// Porte: nosso size → codigos Casa dos Dados
// "01" = Micro Empresa, "03" = Empresa Pequeno Porte, "05" = Demais
const SIZE_TO_PORTE: Record<string, { codigos: string[]; mei?: { optante?: boolean; excluir_optante?: boolean } }> = {
  mei: { codigos: ['01'], mei: { optante: true } },
  me: { codigos: ['01'], mei: { excluir_optante: true } },
  epp: { codigos: ['03'] },
  media: { codigos: ['05'] },
  grande: { codigos: ['05'] },
}

const PORTE_CODE_TO_SIZE: Record<string, string> = {
  '01': 'me',
  '03': 'epp',
  '05': 'media',
}

// Faturamento → capital social (proxy)
const REVENUE_TO_CAPITAL: Record<string, { minimo?: number; maximo?: number }> = {
  'ate100k': { minimo: 0, maximo: 100000 },
  '100k-500k': { minimo: 100000, maximo: 500000 },
  '500k-1m': { minimo: 500000, maximo: 1000000 },
  '1m-5m': { minimo: 1000000, maximo: 5000000 },
  '5m-50m': { minimo: 5000000, maximo: 50000000 },
  'acima50m': { minimo: 50000000 },
}

// ==================== FUNCOES AUXILIARES ====================

function guessSegmentFromCnae(cnaePrincipal: string): string {
  if (!cnaePrincipal) return 'Outro'
  // Tenta match exato primeiro
  if (CNAE_TO_SEGMENT[cnaePrincipal]) return CNAE_TO_SEGMENT[cnaePrincipal]
  // Tenta match por prefixo (classe CNAE = 5 digitos)
  const prefix5 = cnaePrincipal.substring(0, 5)
  for (const [code, seg] of Object.entries(CNAE_TO_SEGMENT)) {
    if (code.startsWith(prefix5)) return seg
  }
  // Tenta match por divisao (2 primeiros digitos)
  const div = cnaePrincipal.substring(0, 2)
  const divMap: Record<string, string> = {
    '01': 'Agronegocio', '02': 'Agronegocio', '03': 'Agronegocio',
    '10': 'Alimenticio', '11': 'Alimenticio',
    '41': 'Construcao', '42': 'Construcao', '43': 'Construcao',
    '45': 'Varejo', '46': 'Varejo', '47': 'Varejo',
    '49': 'Logistica', '50': 'Logistica', '51': 'Logistica', '52': 'Logistica',
    '56': 'Alimenticio',
    '62': 'Tecnologia', '63': 'Tecnologia',
    '64': 'Financeiro', '65': 'Financeiro', '66': 'Financeiro',
    '69': 'Servicos', '70': 'Servicos', '71': 'Servicos', '73': 'Servicos', '74': 'Servicos',
    '85': 'Educacao',
    '86': 'Saude', '87': 'Saude',
  }
  return divMap[div] || 'Outro'
}

function mapSizeFromPorte(porteCode: string, isMei: boolean): string {
  if (isMei) return 'mei'
  return PORTE_CODE_TO_SIZE[porteCode] || 'media'
}

function formatCnpj(cnpj: string): string {
  if (!cnpj || cnpj.length !== 14) return cnpj || ''
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

function capitalSocialToRevenue(capital: number | null): number | null {
  return capital ?? null
}

interface CasaDadosCompany {
  cnpj: string
  cnpj_raiz: string
  razao_social: string
  nome_fantasia: string
  porte_empresa: { codigo: string; descricao: string }
  situacao_cadastral: { situacao_cadastral: string }
  endereco: {
    cep: string
    logradouro: string
    numero: string
    complemento: string
    bairro: string
    uf: string
    municipio: string
    ibge?: { latitude?: number; longitude?: number }
  }
  data_abertura: string
  capital_social: number
  atividade_principal?: { codigo?: string; descricao?: string }
  atividades_principais?: Array<{ codigo: string; descricao: string }>
  telefones?: string[]
  emails?: string[]
  quadro_societario?: Array<{ nome: string; qualificacao_socio: string }>
  mei?: { optante?: boolean }
  simples?: { optante?: boolean }
}

function transformToProspect(company: CasaDadosCompany, index: number): Record<string, unknown> {
  const cnaeCode = company.atividade_principal?.codigo
    || company.atividades_principais?.[0]?.codigo
    || ''

  const isMei = company.mei?.optante === true
  const porteCode = company.porte_empresa?.codigo || '05'

  // Usar nome fantasia se disponivel e mais curto, senao razao social
  const fantasia = company.nome_fantasia?.trim()
  const razao = company.razao_social?.trim() || ''
  const companyName = (fantasia && fantasia.length < razao.length && fantasia.length > 2)
    ? fantasia
    : razao

  // Primeiro socio como contato
  const socio = company.quadro_societario?.[0]
  const contactName = socio?.nome || ''

  // Telefone e email
  const phone = company.telefones?.[0] || ''
  const email = company.emails?.[0] || ''

  // Ano de abertura
  const foundedYear = company.data_abertura
    ? new Date(company.data_abertura).getFullYear()
    : null

  return {
    id: `api_${company.cnpj}`,
    companyName: companyName || razao,
    contactName,
    phone,
    email,
    cnpj: formatCnpj(company.cnpj),
    segment: guessSegmentFromCnae(cnaeCode),
    size: mapSizeFromPorte(porteCode, isMei),
    city: company.endereco?.municipio || '',
    state: (company.endereco?.uf || '').toUpperCase(),
    position: socio?.qualificacao_socio || '',
    source: 'Casa dos Dados',
    website: '',
    revenue: capitalSocialToRevenue(company.capital_social),
    employees: null,
    notes: '',
    status: 'new',
    assignedTo: null,
    assignedMember: null,
    prospectType: 'lead',
    partnerCategory: null,
    listName: '',
    createdBy: null,
    createdAt: company.data_abertura || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    // Campos extras uteis
    cnaePrincipal: cnaeCode,
    cnaeDescricao: company.atividade_principal?.descricao
      || company.atividades_principais?.[0]?.descricao
      || '',
    endereco: company.endereco
      ? `${company.endereco.logradouro || ''}, ${company.endereco.numero || 'S/N'} - ${company.endereco.bairro || ''}`
      : '',
    cep: company.endereco?.cep || '',
    situacao: company.situacao_cadastral?.situacao_cadastral || '',
    simplesNacional: company.simples?.optante || false,
  }
}

// ==================== HANDLER ====================

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar API key
    if (!API_KEY) {
      return new Response(
        JSON.stringify({
          error: 'CASA_DOS_DADOS_API_KEY not configured',
          code: 'NO_API_KEY',
          data: [],
          count: 0,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const {
      segment,
      size,
      state,
      city,
      revenueRange,
      search,
      page = 1,
      perPage = 50,
    } = body

    // Construir request body para Casa dos Dados
    const apiBody: Record<string, unknown> = {
      situacao_cadastral: ['ATIVA'], // Apenas empresas ativas
      limite: Math.min(perPage, 1000),
      pagina: page,
    }

    // Filtro de segmento → CNAE
    if (segment && segment !== 'Outro' && SEGMENT_TO_CNAE[segment]) {
      apiBody.codigo_atividade_principal = SEGMENT_TO_CNAE[segment]
      apiBody.incluir_atividade_secundaria = true
    }

    // Filtro de porte
    if (size && SIZE_TO_PORTE[size]) {
      const porteConfig = SIZE_TO_PORTE[size]
      apiBody.porte_empresa = { codigos: porteConfig.codigos }
      if (porteConfig.mei) {
        apiBody.mei = porteConfig.mei
      }
    }

    // Filtro de estado
    if (state) {
      apiBody.uf = [state.toLowerCase()]
    }

    // Filtro de cidade
    if (city) {
      apiBody.municipio = [city.toUpperCase()]
    }

    // Filtro de faturamento → capital social
    if (revenueRange && REVENUE_TO_CAPITAL[revenueRange]) {
      apiBody.capital_social = REVENUE_TO_CAPITAL[revenueRange]
    }

    // Busca textual
    if (search) {
      apiBody.busca_textual = [{
        texto: [search],
        tipo_busca: 'radical',
        razao_social: true,
        nome_fantasia: true,
      }]
    }

    // Filtros adicionais uteis
    apiBody.mais_filtros = {
      somente_matriz: true,  // Apenas matrizes (evita filiais duplicadas)
      com_email: false,
      com_telefone: false,
    }

    // Chamar Casa dos Dados API
    const apiRes = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': API_KEY,
      },
      body: JSON.stringify(apiBody),
    })

    if (!apiRes.ok) {
      const errData = await apiRes.text()
      const statusCode = apiRes.status

      // Erros conhecidos
      if (statusCode === 401) {
        return new Response(
          JSON.stringify({ error: 'API key invalida', code: 'INVALID_API_KEY', data: [], count: 0 }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      if (statusCode === 403) {
        return new Response(
          JSON.stringify({ error: 'Saldo insuficiente na API', code: 'NO_BALANCE', data: [], count: 0 }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ error: `API error: ${statusCode} - ${errData}`, code: 'API_ERROR', data: [], count: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiData = await apiRes.json()

    // Transformar resposta
    const prospects = (apiData.cnpjs || []).map((c: CasaDadosCompany, i: number) => transformToProspect(c, i))

    return new Response(
      JSON.stringify({
        data: prospects,
        count: apiData.total || prospects.length,
        source: 'api',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message, code: 'INTERNAL_ERROR', data: [], count: 0 }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

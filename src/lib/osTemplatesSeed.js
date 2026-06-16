/**
 * Modelos de O.S. PRONTOS (embutidos no app).
 *
 * Aparecem sempre no "Usar template" — nao dependem do banco nem da migration,
 * e nao podem ser apagados pelo usuario (sao read-only / builtin).
 *
 * Cada item de checklist guarda: { text, group, briefing }.
 * O `briefing` e HTML (mesmo formato do editor: paragrafos, listas, tabelas...).
 *
 * Para adicionar/editar um modelo pronto: edite este arquivo.
 */

const T = (text, group, briefing = '') => ({ text, group, briefing });

export const BUILTIN_OS_TEMPLATES = [
  // ============================================================
  {
    id: 'builtin-onboarding-cliente',
    builtin: true,
    name: 'Onboarding de Cliente',
    title: 'Onboarding — [Nome do Cliente]',
    description: '<p>Receber o cliente novo, configurar tudo e garantir o primeiro valor (primeira entrega/uso) o quanto antes.</p>',
    priority: 'high',
    notes: '',
    checklist: [
      T('Agendar reuniao de boas-vindas (kickoff)', 'Kickoff',
        '<p>Primeiro contato pos-venda. Objetivo: alinhar expectativas e dar o tom de parceria.</p><ul><li>Agende em ate 48h apos o fechamento.</li><li>Participantes: cliente (decisor) + responsavel pela conta.</li><li>Pauta: objetivos do cliente, prazos, proximos passos.</li></ul><p><strong>Pronto quando:</strong> reuniao agendada e confirmada pelo cliente.</p>'),
      T('Enviar formulario de dados e documentos', 'Kickoff',
        '<p>Coletar tudo que precisamos para configurar a conta sem ficar pedingo depois.</p><ul><li>Dados da empresa (CNPJ, razao social, logo).</li><li>Usuarios que terao acesso + funcao de cada um.</li><li>Acessos/integracoes necessarios.</li></ul><p><strong>Pronto quando:</strong> formulario respondido e documentos recebidos.</p>'),
      T('Configurar conta, usuarios e permissoes', 'Configuracao',
        '<p>Deixar o ambiente pronto para o cliente usar no primeiro acesso.</p><ul><li>Criar a conta e os logins; enviar credenciais por canal seguro.</li><li>Configurar perfil da empresa (logo, dados fiscais).</li><li>Definir permissao de cada usuario.</li></ul><p><strong>Pronto quando:</strong> cliente consegue logar e ve os dados dele.</p>'),
      T('Importar / cadastrar dados iniciais', 'Configuracao',
        '<p>Levar o cliente de "conta vazia" para "conta com a cara do negocio dele".</p><ul><li>Importar a base inicial (clientes, produtos, etc.).</li><li>Conferir consistencia dos dados importados.</li></ul><p><strong>Pronto quando:</strong> dados conferidos e sem erros.</p>'),
      T('Treinar o cliente no uso essencial', 'Configuracao',
        '<p>Garantir que o cliente sabe fazer o que importa (nao tudo — o essencial).</p><ul><li>Mostrar o fluxo principal de ponta a ponta.</li><li>Deixar 1 material curto de referencia.</li></ul><p><strong>Pronto quando:</strong> cliente executa o fluxo principal sozinho.</p>'),
      T('Check-in de 7 dias', 'Acompanhamento',
        '<p>Primeiro pulso. Pegar duvida/atrito cedo, antes de virar churn.</p><ul><li>Esta usando? Onde travou?</li><li>Resolver pendencia na hora ou abrir tarefa.</li></ul>'),
      T('Check-in de 30 dias', 'Acompanhamento',
        '<p>Confirmar que o cliente esta tendo resultado e marcar o proximo passo de relacionamento.</p><ul><li>Revisar uso e primeiros resultados.</li><li>Pedir feedback (NPS) e registrar.</li></ul>'),
    ],
  },

  // ============================================================
  {
    id: 'builtin-contratacao',
    builtin: true,
    name: 'Contratacao de Colaborador',
    title: 'Contratacao — [Cargo]',
    description: '<p>Contratar a pessoa certa, do anuncio da vaga ate o primeiro dia, sem furos de processo.</p>',
    priority: 'medium',
    notes: '',
    checklist: [
      T('Definir descricao e perfil da vaga', 'Abertura',
        '<p>Sem isso, o resto vira chute. Defina o que a pessoa precisa entregar.</p><ul><li>Responsabilidades e entregaveis do cargo.</li><li>Requisitos obrigatorios x desejaveis.</li><li>Faixa salarial e modelo (CLT/PJ, presencial/remoto).</li></ul>'),
      T('Publicar a vaga e divulgar', 'Abertura',
        '<p>Levar a vaga onde os bons candidatos estao.</p><ul><li>Publicar nos canais (LinkedIn, grupos, indicacoes).</li><li>Pedir indicacao para o time.</li></ul>'),
      T('Triagem de candidatos', 'Selecao',
        '<p>Filtrar com criterio, nao por volume.</p><ul><li>Conferir requisitos obrigatorios.</li><li>Selecionar os 3-5 melhores para entrevista.</li></ul><p><strong>Pronto quando:</strong> shortlist definida.</p>'),
      T('Entrevista', 'Selecao',
        '<p>Avaliar fit tecnico E cultural.</p><ul><li>Perguntas sobre experiencias reais (situacao - acao - resultado).</li><li>Apresentar a empresa e o cargo com honestidade.</li></ul>'),
      T('Teste pratico / case', 'Selecao',
        '<p>Ver a pessoa fazendo, nao so falando.</p><ul><li>Aplicar um desafio curto e realista do dia a dia.</li><li>Avaliar com criterio combinado antes.</li></ul>'),
      T('Enviar proposta', 'Admissao',
        '<p>Fechar com clareza para nao ter ruido depois.</p><ul><li>Salario, beneficios, data de inicio, modelo de contrato.</li><li>Confirmar aceite por escrito.</li></ul>'),
      T('Coletar documentos e formalizar', 'Admissao',
        '<p>Parte burocratica — sem ela nao tem admissao.</p><ul><li>Documentos pessoais e contrato assinado.</li><li>Acionar contabilidade/RH.</li></ul>'),
      T('Preparar primeiro dia (onboarding)', 'Admissao',
        '<p>Primeira impressao conta. Pessoa nova tem que chegar e conseguir trabalhar.</p><ul><li>Criar acessos e ferramentas.</li><li>Definir padrinho/responsavel e plano da 1a semana.</li></ul>'),
    ],
  },

  // ============================================================
  {
    id: 'builtin-implantacao',
    builtin: true,
    name: 'Implantacao / Setup',
    title: 'Implantacao — [Cliente/Projeto]',
    description: '<p>Tirar do "vendido" para o "funcionando", com levantamento, configuracao, teste e go-live controlado.</p>',
    priority: 'high',
    notes: '',
    checklist: [
      T('Levantar requisitos', 'Levantamento',
        '<p>Entender o cenario real antes de configurar qualquer coisa.</p><ul><li>O que o cliente usa hoje? O que precisa funcionar?</li><li>Integracoes, dados e restricoes.</li></ul><p><strong>Pronto quando:</strong> escopo do setup confirmado por escrito.</p>'),
      T('Configurar o ambiente', 'Configuracao',
        '<p>Montar a solucao conforme o levantamento.</p><ul><li>Aplicar configuracoes e integracoes.</li><li>Registrar o que foi configurado.</li></ul>'),
      T('Testar de ponta a ponta', 'Configuracao',
        '<p>Achar problema antes do cliente achar.</p><ul><li>Rodar o fluxo principal como o usuario faria.</li><li>Corrigir o que falhar e re-testar.</li></ul><p><strong>Pronto quando:</strong> fluxo principal roda sem erro.</p>'),
      T('Treinar o usuario', 'Go-live',
        '<p>Entregar o conhecimento junto com a ferramenta.</p><ul><li>Mostrar o uso essencial.</li><li>Deixar material de referencia.</li></ul>'),
      T('Go-live e acompanhamento', 'Go-live',
        '<p>Virar a chave com rede de seguranca.</p><ul><li>Liberar para uso real.</li><li>Acompanhar de perto nas primeiras 48h.</li></ul>'),
    ],
  },
];

export default BUILTIN_OS_TEMPLATES;

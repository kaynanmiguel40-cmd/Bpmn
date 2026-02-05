// Traduções em português para bpmn-js
const translations = {
  // Paleta - Ferramentas (com e sem "the")
  'Activate the hand tool': 'Ativar ferramenta de mão',
  'Activate hand tool': 'Ativar ferramenta de mão',
  'Hand tool': 'Ferramenta de mão',
  'Activate the lasso tool': 'Ativar ferramenta de laço',
  'Activate lasso tool': 'Ativar ferramenta de laço',
  'Lasso tool': 'Ferramenta de laço',
  'Activate the create/remove space tool': 'Ativar ferramenta de criar/remover espaço',
  'Activate create/remove space tool': 'Ativar ferramenta de criar/remover espaço',
  'Create/remove space tool': 'Ferramenta de criar/remover espaço',
  'Space tool': 'Ferramenta de espaço',
  'Activate the global connect tool': 'Ativar ferramenta de conexão global',
  'Activate global connect tool': 'Ativar ferramenta de conexão global',
  'Global connect tool': 'Ferramenta de conexão global',
  'Connect tool': 'Ferramenta de conexão',

  // Paleta - Elementos
  'Create StartEvent': 'Criar Evento de Início',
  'Create EndEvent': 'Criar Evento de Fim',
  'Create Task': 'Criar Tarefa',
  'Create Gateway': 'Criar Gateway',
  'Create Intermediate/Boundary Event': 'Criar Evento Intermediário',
  'Create Pool/Participant': 'Criar Pool/Participante',
  'Create DataObjectReference': 'Criar Objeto de Dados',
  'Create DataStoreReference': 'Criar Armazém de Dados',
  'Create Group': 'Criar Grupo',
  'Create expanded SubProcess': 'Criar Sub-Processo expandido',
  'Create CallActivity': 'Criar Atividade de Chamada',

  // Context Pad
  'Append Task': 'Adicionar Tarefa',
  'Append EndEvent': 'Adicionar Evento de Fim',
  'Append Gateway': 'Adicionar Gateway',
  'Append Intermediate/Boundary Event': 'Adicionar Evento Intermediário',
  'Append TextAnnotation': 'Adicionar Anotação',
  'Connect using Sequence/MessageFlow or Association': 'Conectar usando Fluxo de Sequência/Mensagem',
  'Connect using DataInputAssociation': 'Conectar usando Associação de Entrada',
  'Change type': 'Alterar tipo',
  'Delete': 'Excluir',
  'Remove': 'Remover',

  // Popup Menu - Tipos de Tarefa
  'Task': 'Tarefa',
  'Send Task': 'Tarefa de Envio',
  'Receive Task': 'Tarefa de Recebimento',
  'User Task': 'Tarefa de Usuário',
  'Manual Task': 'Tarefa Manual',
  'Business Rule Task': 'Tarefa de Regra de Negócio',
  'Service Task': 'Tarefa de Serviço',
  'Script Task': 'Tarefa de Script',
  'Call Activity': 'Atividade de Chamada',
  'Sub Process (collapsed)': 'Sub-Processo (recolhido)',
  'Sub Process (expanded)': 'Sub-Processo (expandido)',

  // Popup Menu - Tipos de Gateway
  'Exclusive Gateway': 'Gateway Exclusivo',
  'Parallel Gateway': 'Gateway Paralelo',
  'Inclusive Gateway': 'Gateway Inclusivo',
  'Complex Gateway': 'Gateway Complexo',
  'Event based Gateway': 'Gateway baseado em Evento',

  // Popup Menu - Tipos de Evento
  'Start Event': 'Evento de Início',
  'Intermediate Throw Event': 'Evento Intermediário de Envio',
  'End Event': 'Evento de Fim',
  'Message Start Event': 'Evento de Início por Mensagem',
  'Timer Start Event': 'Evento de Início por Temporizador',
  'Conditional Start Event': 'Evento de Início Condicional',
  'Signal Start Event': 'Evento de Início por Sinal',
  'Message Intermediate Catch Event': 'Evento Intermediário de Captura de Mensagem',
  'Message Intermediate Throw Event': 'Evento Intermediário de Envio de Mensagem',
  'Timer Intermediate Catch Event': 'Evento Intermediário de Temporizador',
  'Escalation Intermediate Throw Event': 'Evento Intermediário de Escalação',
  'Conditional Intermediate Catch Event': 'Evento Intermediário Condicional',
  'Link Intermediate Catch Event': 'Evento Intermediário de Link (Captura)',
  'Link Intermediate Throw Event': 'Evento Intermediário de Link (Envio)',
  'Compensation Intermediate Throw Event': 'Evento Intermediário de Compensação',
  'Signal Intermediate Catch Event': 'Evento Intermediário de Captura de Sinal',
  'Signal Intermediate Throw Event': 'Evento Intermediário de Envio de Sinal',
  'Message End Event': 'Evento de Fim por Mensagem',
  'Escalation End Event': 'Evento de Fim por Escalação',
  'Error End Event': 'Evento de Fim por Erro',
  'Cancel End Event': 'Evento de Fim por Cancelamento',
  'Compensation End Event': 'Evento de Fim por Compensação',
  'Signal End Event': 'Evento de Fim por Sinal',
  'Terminate End Event': 'Evento de Fim por Terminação',

  // Boundary Events
  'Message Boundary Event': 'Evento de Limite por Mensagem',
  'Timer Boundary Event': 'Evento de Limite por Temporizador',
  'Escalation Boundary Event': 'Evento de Limite por Escalação',
  'Conditional Boundary Event': 'Evento de Limite Condicional',
  'Error Boundary Event': 'Evento de Limite por Erro',
  'Cancel Boundary Event': 'Evento de Limite por Cancelamento',
  'Signal Boundary Event': 'Evento de Limite por Sinal',
  'Compensation Boundary Event': 'Evento de Limite por Compensação',
  'Non-interrupting Message Boundary Event': 'Evento de Limite por Mensagem (Não-interruptivo)',
  'Non-interrupting Timer Boundary Event': 'Evento de Limite por Temporizador (Não-interruptivo)',
  'Non-interrupting Escalation Boundary Event': 'Evento de Limite por Escalação (Não-interruptivo)',
  'Non-interrupting Conditional Boundary Event': 'Evento de Limite Condicional (Não-interruptivo)',
  'Non-interrupting Signal Boundary Event': 'Evento de Limite por Sinal (Não-interruptivo)',

  // Outros
  'Participant': 'Participante',
  'Pool': 'Pool',
  'Lane': 'Raia',
  'Data Object': 'Objeto de Dados',
  'Data Store': 'Armazém de Dados',
  'Text Annotation': 'Anotação de Texto',
  'Group': 'Grupo',
  'Sequence Flow': 'Fluxo de Sequência',
  'Message Flow': 'Fluxo de Mensagem',
  'Association': 'Associação',
  'Data Association': 'Associação de Dados',

  // Ações
  'Append {type}': 'Adicionar {type}',
  'Add Lane above': 'Adicionar Raia acima',
  'Add Lane below': 'Adicionar Raia abaixo',
  'Divide into two Lanes': 'Dividir em duas Raias',
  'Divide into three Lanes': 'Dividir em três Raias',

  // Labels de entrada
  'element name': 'nome do elemento',
  'no parent for {element} in {parent}': 'sem pai para {element} em {parent}',
  'no shape type specified': 'tipo de forma não especificado',
  'flow elements must be children of pools/participants': 'elementos de fluxo devem ser filhos de pools/participantes',

  // Erros
  'no process or collaboration to display': 'nenhum processo ou colaboração para exibir',
  'element {element} referenced by {referenced}#{property} not yet drawn': 'elemento {element} referenciado por {referenced}#{property} ainda não desenhado',
  'out of bounds release': 'liberação fora dos limites',
  'more than {count} child lanes': 'mais de {count} raias filhas'
};

// Função de tradução
export function customTranslate(template, replacements) {
  replacements = replacements || {};

  // Traduzir o template
  let translation = translations[template] || template;

  // Substituir placeholders
  return translation.replace(/{([^}]+)}/g, function(_, key) {
    // Traduzir o valor de substituição também, se existir
    const value = replacements[key];
    if (value !== undefined) {
      return translations[value] || value;
    }
    return '{' + key + '}';
  });
}

// Módulo de tradução para bpmn-js
export default {
  translate: ['value', customTranslate]
};

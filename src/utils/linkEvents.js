/**
 * Link Events - Sistema de "portais" para fluxos BPMN
 *
 * Link Throw (saída): Sai do fluxo e redireciona para um Link Catch
 * Link Catch (entrada): Recebe o fluxo de um Link Throw
 */

/**
 * Cria um Link Event Throw (saída)
 * @param {string} id - ID único do elemento
 * @param {string} name - Nome do link (deve corresponder ao Link Catch)
 * @param {string} label - Label visual (opcional)
 * @param {number} x - Posição X
 * @param {number} y - Posição Y
 */
export function createLinkThrow(id, name, label = '', x = 0, y = 0) {
  return {
    id,
    type: 'bpmn:IntermediateThrowEvent',
    name: label || name,
    linkName: name, // Nome do link para conexão
    eventDefinitionType: 'bpmn:LinkEventDefinition',
    x,
    y,
    width: 36,
    height: 36,
    isLinkThrow: true
  };
}

/**
 * Cria um Link Event Catch (entrada/gatilho)
 * @param {string} id - ID único do elemento
 * @param {string} name - Nome do link (deve corresponder ao Link Throw)
 * @param {string} label - Label visual (opcional)
 * @param {number} x - Posição X
 * @param {number} y - Posição Y
 */
export function createLinkCatch(id, name, label = '', x = 0, y = 0) {
  return {
    id,
    type: 'bpmn:IntermediateCatchEvent',
    name: label || name,
    linkName: name, // Nome do link para conexão
    eventDefinitionType: 'bpmn:LinkEventDefinition',
    x,
    y,
    width: 36,
    height: 36,
    isLinkCatch: true
  };
}

/**
 * Encontra o Link Catch correspondente a um Link Throw
 * @param {object} xml - XML do BPMN parseado
 * @param {string} linkName - Nome do link
 * @returns {object|null} Elemento Link Catch encontrado
 */
export function findLinkCatch(xml, linkName) {
  // Procurar em todos os elementos do diagrama
  const allElements = xml.getElementsByTagName('*');

  for (let element of allElements) {
    // Verificar se é um IntermediateCatchEvent com LinkEventDefinition
    if (element.tagName === 'bpmn:intermediateCatchEvent') {
      const linkEventDef = element.getElementsByTagName('bpmn:linkEventDefinition')[0];
      if (linkEventDef) {
        const name = element.getAttribute('name');
        if (name === linkName) {
          return element;
        }
      }
    }
  }

  return null;
}

/**
 * Gera XML para Link Throw Event
 * @param {object} linkThrow - Objeto do Link Throw
 * @param {string} laneId - ID da lane onde está o elemento
 */
export function generateLinkThrowXML(linkThrow, laneId) {
  return `
    <bpmn:intermediateThrowEvent id="${linkThrow.id}" name="${linkThrow.name}">
      <bpmn:incoming>${linkThrow.id}_in</bpmn:incoming>
      <bpmn:linkEventDefinition name="${linkThrow.linkName}" />
    </bpmn:intermediateThrowEvent>
  `;
}

/**
 * Gera XML para Link Catch Event
 * @param {object} linkCatch - Objeto do Link Catch
 * @param {string} laneId - ID da lane onde está o elemento
 */
export function generateLinkCatchXML(linkCatch, laneId) {
  return `
    <bpmn:intermediateCatchEvent id="${linkCatch.id}" name="${linkCatch.name}">
      <bpmn:outgoing>${linkCatch.id}_out</bpmn:outgoing>
      <bpmn:linkEventDefinition name="${linkCatch.linkName}" />
    </bpmn:intermediateCatchEvent>
  `;
}

/**
 * Gera Shape (visualização) para Link Event no BPMNDi
 * @param {object} linkEvent - Link Throw ou Catch
 */
export function generateLinkEventShape(linkEvent) {
  return `
    <bpmndi:BPMNShape id="Shape_${linkEvent.id}" bpmnElement="${linkEvent.id}">
      <dc:Bounds x="${linkEvent.x}" y="${linkEvent.y}" width="${linkEvent.width}" height="${linkEvent.height}" />
      <bpmndi:BPMNLabel>
        <dc:Bounds x="${linkEvent.x - 10}" y="${linkEvent.y + 40}" width="56" height="14" />
      </bpmndi:BPMNLabel>
    </bpmndi:BPMNShape>
  `;
}

/**
 * Aplica destaque visual ao Link Catch correspondente
 * @param {object} modeler - Instância do bpmn-js modeler
 * @param {string} linkName - Nome do link
 */
export function highlightLinkCatch(modeler, linkName) {
  const elementRegistry = modeler.get('elementRegistry');
  const canvas = modeler.get('canvas');

  // Encontrar todos os elementos
  const allElements = elementRegistry.getAll();

  // Procurar pelo Link Catch correspondente
  const linkCatch = allElements.find(element => {
    const bo = element.businessObject;
    return (
      bo.$type === 'bpmn:IntermediateCatchEvent' &&
      bo.eventDefinitions &&
      bo.eventDefinitions[0].$type === 'bpmn:LinkEventDefinition' &&
      bo.name === linkName
    );
  });

  if (linkCatch) {
    // Adicionar classe de destaque
    canvas.addMarker(linkCatch.id, 'link-highlight');

    // Scroll para o elemento
    canvas.scrollToElement(linkCatch);

    // Remover destaque após 3 segundos
    setTimeout(() => {
      canvas.removeMarker(linkCatch.id, 'link-highlight');
    }, 3000);
  }
}

/**
 * Mapeamento de Links do fluxo comercial
 * Organiza os "portais" do fluxo para evitar linhas cruzadas
 */
export const COMMERCIAL_LINKS = {
  // Google Ads -> Qualificação
  GOOGLE_TO_QUALIFICATION: 'link_google_qualification',

  // Meta Ads -> Qualificação
  META_TO_QUALIFICATION: 'link_meta_qualification',

  // Educação -> Qualificação
  EDUCATION_TO_QUALIFICATION: 'link_education_qualification',

  // Qualificação -> Proposta
  QUALIFICATION_TO_PROPOSAL: 'link_qualification_proposal',

  // Proposta -> Contrato
  PROPOSAL_TO_CONTRACT: 'link_proposal_contract',

  // Contrato -> Ativação
  CONTRACT_TO_ACTIVATION: 'link_contract_activation',

  // Ativação -> Retenção
  ACTIVATION_TO_RETENTION: 'link_activation_retention',

  // Não Lead -> Educação
  NOT_LEAD_TO_EDUCATION: 'link_not_lead_education'
};

export default {
  createLinkThrow,
  createLinkCatch,
  findLinkCatch,
  generateLinkThrowXML,
  generateLinkCatchXML,
  generateLinkEventShape,
  highlightLinkCatch,
  COMMERCIAL_LINKS
};

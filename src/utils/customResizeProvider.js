import inherits from 'inherits-browser';
import RuleProvider from 'diagram-js/lib/features/rules/RuleProvider';

/**
 * Custom Rule Provider para permitir redimensionamento de elementos de imagem (Tasks)
 */
function CustomResizeProvider(eventBus) {
  RuleProvider.call(this, eventBus);
}

inherits(CustomResizeProvider, RuleProvider);

CustomResizeProvider.$inject = ['eventBus'];

CustomResizeProvider.prototype.init = function() {
  // Regra para permitir resize em Tasks que são imagens
  // Prioridade 1500 (maior que as regras padrão que usam ~1000)
  this.addRule('shape.resize', 1500, function(context) {
    const shape = context.shape;

    // Verificar se é um elemento de imagem (Task com dados de imagem)
    if (shape && shape.type === 'bpmn:Task') {
      const businessObject = shape.businessObject;
      if (businessObject && businessObject.name && businessObject.name.startsWith('__IMAGE__:')) {
        // Permitir resize para elementos de imagem
        // Retornar objeto com dimensões mínimas
        return {
          minBounds: {
            width: 50,
            height: 50
          }
        };
      }
    }

    // Retornar undefined para deixar outras regras decidirem
    return;
  });
};

// Módulo para exportar
export default {
  __init__: ['customResizeProvider'],
  customResizeProvider: ['type', CustomResizeProvider]
};

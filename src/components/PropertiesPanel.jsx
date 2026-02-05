import { useState, useEffect } from 'react';

// Paleta de cores disponíveis
const COLOR_PALETTE = [
  { name: 'Azul', fill: '#dbeafe', stroke: '#3b82f6' },
  { name: 'Verde', fill: '#dcfce7', stroke: '#22c55e' },
  { name: 'Roxo', fill: '#ede9fe', stroke: '#8b5cf6' },
  { name: 'Laranja', fill: '#ffedd5', stroke: '#f97316' },
  { name: 'Cyan', fill: '#cffafe', stroke: '#06b6d4' },
  { name: 'Rosa', fill: '#fce7f3', stroke: '#ec4899' },
  { name: 'Amarelo', fill: '#fef3c7', stroke: '#f59e0b' },
  { name: 'Vermelho', fill: '#fecaca', stroke: '#ef4444' },
  { name: 'Teal', fill: '#ccfbf1', stroke: '#14b8a6' },
  { name: 'Indigo', fill: '#e0e7ff', stroke: '#6366f1' },
];

/**
 * Painel de propriedades lateral para editar elementos BPMN
 */
// Helper para verificar se é elemento de imagem
const isImageElement = (el) => {
  return el?.businessObject?.name?.startsWith('__IMAGE__:');
};

// Helper para extrair dados de imagem
const getImageData = (el) => {
  try {
    if (isImageElement(el)) {
      const jsonStr = el.businessObject.name.substring(10);
      return JSON.parse(jsonStr);
    }
  } catch (e) {
    console.error('Erro ao parsear dados de imagem:', e);
  }
  return null;
};

export default function PropertiesPanel({ element, onUpdate, onColorChange }) {
  const [name, setName] = useState('');
  const [documentation, setDocumentation] = useState('');
  const [selectedColor, setSelectedColor] = useState(null);
  const [imageData, setImageData] = useState(null);

  // Atualizar campos quando elemento mudar
  useEffect(() => {
    if (element) {
      const businessObject = element.businessObject;

      // Verificar se é elemento de imagem
      if (isImageElement(element)) {
        const imgData = getImageData(element);
        setImageData(imgData);
        setName(imgData?.displayName || 'Imagem');
      } else {
        setImageData(null);
        setName(businessObject.name || '');
      }

      // Extrair documentação se existir
      const docs = businessObject.documentation;
      if (docs && docs.length > 0) {
        setDocumentation(docs[0].text || '');
      } else {
        setDocumentation('');
      }

      // Resetar cor selecionada
      setSelectedColor(null);
    } else {
      setName('');
      setDocumentation('');
      setSelectedColor(null);
      setImageData(null);
    }
  }, [element]);

  // Aplicar cor ao elemento
  const handleColorChange = (color) => {
    setSelectedColor(color);
    if (onColorChange && element) {
      onColorChange(element, color);
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
  };

  // Função para salvar o nome
  const saveName = () => {
    if (onUpdate && element) {
      // Se for elemento de imagem, atualizar o displayName no JSON
      if (imageData) {
        const updatedImageData = { ...imageData, displayName: name };
        onUpdate(element, { name: '__IMAGE__:' + JSON.stringify(updatedImageData) });
      } else {
        onUpdate(element, { name });
      }
    }
  };

  const handleNameBlur = () => {
    saveName();
  };

  // Salvar ao pressionar Enter
  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveName();
      e.target.blur(); // Tirar foco do input
    }
  };

  const handleDocChange = (e) => {
    setDocumentation(e.target.value);
  };

  // Função para salvar a documentação
  const saveDocumentation = () => {
    if (onUpdate && element) {
      // A documentação em BPMN é um array de objetos com propriedade 'text'
      // Para simplificar, vamos usar o campo 'documentation' se disponível no businessObject
      // Ou criar um novo array de documentação
      const newDocs = documentation ? [{ text: documentation }] : [];
      onUpdate(element, { documentation: newDocs });
    }
  };

  const handleDocBlur = () => {
    saveDocumentation();
  };

  // Obter tipo legível do elemento
  const getElementType = (el) => {
    if (!el) return '';

    // Se for elemento de imagem, mostrar "Imagem"
    if (isImageElement(el)) {
      return 'Imagem';
    }

    const type = el.type || el.businessObject?.$type || '';

    const typeMap = {
      'bpmn:Task': 'Tarefa',
      'bpmn:UserTask': 'Tarefa de Usuário',
      'bpmn:ServiceTask': 'Tarefa de Serviço',
      'bpmn:ScriptTask': 'Tarefa de Script',
      'bpmn:ManualTask': 'Tarefa Manual',
      'bpmn:BusinessRuleTask': 'Tarefa de Regra',
      'bpmn:SendTask': 'Tarefa de Envio',
      'bpmn:ReceiveTask': 'Tarefa de Recebimento',
      'bpmn:StartEvent': 'Evento de Início',
      'bpmn:EndEvent': 'Evento de Fim',
      'bpmn:IntermediateCatchEvent': 'Evento Intermediário',
      'bpmn:IntermediateThrowEvent': 'Evento Intermediário',
      'bpmn:BoundaryEvent': 'Evento de Limite',
      'bpmn:ExclusiveGateway': 'Gateway Exclusivo',
      'bpmn:ParallelGateway': 'Gateway Paralelo',
      'bpmn:InclusiveGateway': 'Gateway Inclusivo',
      'bpmn:EventBasedGateway': 'Gateway de Evento',
      'bpmn:SubProcess': 'Sub-Processo',
      'bpmn:CallActivity': 'Atividade de Chamada',
      'bpmn:Participant': 'Pool',
      'bpmn:Lane': 'Raia',
      'bpmn:SequenceFlow': 'Fluxo de Sequência',
      'bpmn:MessageFlow': 'Fluxo de Mensagem',
      'bpmn:DataObject': 'Objeto de Dados',
      'bpmn:DataStore': 'Armazém de Dados',
      'bpmn:TextAnnotation': 'Anotação',
    };

    return typeMap[type] || type.replace('bpmn:', '');
  };

  // Obter ícone do tipo
  const getElementIcon = (el) => {
    if (!el) return null;

    // Ícone especial para imagens
    if (isImageElement(el)) {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
          <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15l-5-5L5 21" />
        </svg>
      );
    }

    const type = el.type || el.businessObject?.$type || '';

    if (type.includes('Task')) {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      );
    }
    if (type.includes('Event')) {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <circle cx="12" cy="12" r="9" strokeWidth={2} />
        </svg>
      );
    }
    if (type.includes('Gateway')) {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3l9 9-9 9-9-9 9-9z" />
        </svg>
      );
    }
    if (type.includes('SubProcess')) {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
          <path strokeLinecap="round" strokeWidth={2} d="M12 8v8M8 12h8" />
        </svg>
      );
    }
    if (type.includes('Participant') || type.includes('Lane')) {
      return (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <rect x="2" y="4" width="20" height="16" rx="1" strokeWidth={2} />
          <line x1="6" y1="4" x2="6" y2="20" strokeWidth={2} />
        </svg>
      );
    }

    return (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    );
  };

  if (!element) {
    return (
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <h2 className="font-semibold text-slate-700">Propriedades</h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
            <p className="text-sm">Selecione um elemento no diagrama para editar suas propriedades</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="font-semibold text-slate-700">Propriedades</h2>
      </div>

      {/* Element Info */}
      <div className="p-4 border-b border-slate-200 bg-fyness-light">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-fyness-primary/10 rounded-lg flex items-center justify-center text-fyness-primary">
            {getElementIcon(element)}
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">Tipo</p>
            <p className="font-medium text-slate-700">{getElementType(element)}</p>
          </div>
        </div>
      </div>

      {/* Properties Form */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ID (readonly) */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            ID
          </label>
          <input
            type="text"
            value={element.id || ''}
            readOnly
            className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-md text-sm text-slate-600 cursor-not-allowed"
          />
        </div>

        {/* Nome */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            Nome
          </label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleNameKeyDown}
            placeholder="Digite o nome do elemento..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
          />
          <p className="text-xs text-slate-400 mt-1">Pressione Enter para salvar</p>
        </div>

        {/* Documentação */}
        <div>
          <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
            Documentação
          </label>
          <textarea
            value={documentation}
            onChange={handleDocChange}
            onBlur={handleDocBlur}
            placeholder="Adicione uma descrição ou notas..."
            rows={4}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent resize-none"
          />
          <p className="text-xs text-slate-400 mt-1">Clique fora para salvar</p>
        </div>

        {/* Cores - apenas para elementos com forma (não conexões) */}
        {element.type && !element.type.includes('Flow') && !element.type.includes('Association') && (
          <div className="pt-4 border-t border-slate-200">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
              Cor do Elemento
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_PALETTE.map((color) => (
                <button
                  key={color.name}
                  onClick={() => handleColorChange(color)}
                  title={color.name}
                  className={`w-10 h-10 rounded-lg border-2 transition-all hover:scale-110 ${
                    selectedColor?.name === color.name
                      ? 'ring-2 ring-offset-2 ring-slate-400'
                      : ''
                  }`}
                  style={{
                    backgroundColor: color.fill,
                    borderColor: color.stroke,
                  }}
                />
              ))}
            </div>
            {selectedColor && (
              <p className="text-xs text-slate-500 mt-2 text-center">
                Cor selecionada: {selectedColor.name}
              </p>
            )}
          </div>
        )}

        {/* Tipo Específico - Conditional */}
        {element.type?.includes('SequenceFlow') && (
          <div className="pt-4 border-t border-slate-200">
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">
              Condição (Expressão)
            </label>
            <input
              type="text"
              placeholder="Ex: ${approved == true}"
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent font-mono"
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <p className="text-xs text-slate-400 text-center">
          Use o canvas para editar visualmente
        </p>
      </div>
    </div>
  );
}

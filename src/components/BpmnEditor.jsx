import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import BpmnJS from 'bpmn-js/lib/Modeler';
import translateModule, { customTranslate } from '../utils/bpmnTranslations';
import customResizeModule from '../utils/customResizeProvider';
import { COMERCIAL_DIAGRAM_XML } from '../utils/comercialTemplate';

// Dicionário completo de traduções para tooltips
const tooltipTranslations = {
  // Ferramentas principais
  'Activate global connect tool': 'Ativar conexão global',
  'Activate the global connect tool': 'Ativar conexão global',
  'Activate hand tool': 'Mover canvas',
  'Activate the hand tool': 'Mover canvas',
  'Activate lasso tool': 'Selecionar múltiplos',
  'Activate the lasso tool': 'Selecionar múltiplos',
  'Activate create/remove space tool': 'Criar/remover espaço',
  'Activate the create/remove space tool': 'Criar/remover espaço',

  // Criar elementos - várias variações
  'Create StartEvent': 'Criar Início',
  'Create start event': 'Criar Início',
  'Create Start Event': 'Criar Início',
  'Create EndEvent': 'Criar Fim',
  'Create end event': 'Criar Fim',
  'Create End Event': 'Criar Fim',
  'Create Task': 'Criar Tarefa',
  'Create task': 'Criar Tarefa',
  'Create Gateway': 'Criar Gateway',
  'Create gateway': 'Criar Gateway',
  'Create exclusive gateway': 'Criar Gateway Exclusivo',
  'Create Exclusive Gateway': 'Criar Gateway Exclusivo',
  'Create parallel gateway': 'Criar Gateway Paralelo',
  'Create Parallel Gateway': 'Criar Gateway Paralelo',
  'Create Intermediate/Boundary Event': 'Criar Evento Intermediário',
  'Create intermediate/boundary event': 'Criar Evento Intermediário',
  'Create IntermediateThrowEvent': 'Criar Evento Intermediário',
  'Create Pool/Participant': 'Criar Pool',
  'Create pool/participant': 'Criar Pool',
  'Create Participant': 'Criar Participante',
  'Create participant': 'Criar Participante',
  'Create DataObjectReference': 'Criar Dados',
  'Create data object reference': 'Criar Dados',
  'Create Data Object Reference': 'Criar Dados',
  'Create DataStoreReference': 'Criar Armazém',
  'Create data store reference': 'Criar Armazém',
  'Create Data Store Reference': 'Criar Armazém',
  'Create Group': 'Criar Grupo',
  'Create group': 'Criar Grupo',
  'Create expanded SubProcess': 'Criar Sub-Processo',
  'Create expanded sub-process': 'Criar Sub-Processo',
  'Create Expanded SubProcess': 'Criar Sub-Processo',
  'Create SubProcess': 'Criar Sub-Processo',
  'Create CallActivity': 'Criar Chamada Externa',
  'Create call activity': 'Criar Chamada Externa',
  'Create Call Activity': 'Criar Chamada Externa',

  // Adicionar elementos
  'Append Task': 'Adicionar Tarefa',
  'Append task': 'Adicionar Tarefa',
  'Append EndEvent': 'Adicionar Fim',
  'Append end event': 'Adicionar Fim',
  'Append End Event': 'Adicionar Fim',
  'Append Gateway': 'Adicionar Gateway',
  'Append gateway': 'Adicionar Gateway',
  'Append Intermediate/Boundary Event': 'Adicionar Evento',
  'Append intermediate/boundary event': 'Adicionar Evento',
  'Append TextAnnotation': 'Adicionar Anotação',
  'Append text annotation': 'Adicionar Anotação',

  // Conexões
  'Connect using Sequence/MessageFlow or Association': 'Conectar',
  'Connect using sequence/message flow or association': 'Conectar',
  'Connect using DataInputAssociation': 'Conectar Dados',
  'Connect': 'Conectar',

  // Ações
  'Change type': 'Alterar tipo',
  'Change element': 'Alterar elemento',
  'Delete': 'Excluir',
  'Remove': 'Remover',
  'Edit label': 'Editar rótulo',
  'Copy': 'Copiar',
  'Paste': 'Colar',
  'Undo': 'Desfazer',
  'Redo': 'Refazer',
};

const BpmnEditor = forwardRef(function BpmnEditor({ xml, onXmlChange, onElementSelect, onFluxosClick, showGrid = true, onGridToggle, onAddImage }, ref) {
  const containerRef = useRef(null);
  const modelerRef = useRef(null);
  const initialXmlRef = useRef(xml);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  // Expor métodos para o componente pai
  useImperativeHandle(ref, () => ({
    async saveSVG() {
      if (modelerRef.current) {
        try {
          const { svg } = await modelerRef.current.saveSVG();
          return svg;
        } catch (e) {
          console.error('Erro ao exportar SVG:', e);
          return null;
        }
      }
      return null;
    },
    // Método para mudar cor de um elemento
    setElementColor(element, color) {
      if (modelerRef.current && element) {
        try {
          const modeling = modelerRef.current.get('modeling');
          modeling.setColor([element], {
            fill: color.fill,
            stroke: color.stroke
          });
        } catch (e) {
          console.error('Erro ao mudar cor:', e);
        }
      }
    },
    // Método para adicionar um CallActivity (fluxo externo) ao canvas
    addCallActivity(flowId, flowName) {
      if (!modelerRef.current) {
        console.error('Modeler não disponível');
        return null;
      }

      try {
        const modeler = modelerRef.current;
        const modeling = modeler.get('modeling');
        const elementFactory = modeler.get('elementFactory');
        const canvas = modeler.get('canvas');
        const elementRegistry = modeler.get('elementRegistry');

        // Obter o elemento raiz do canvas
        const rootElement = canvas.getRootElement();

        if (!rootElement || !rootElement.businessObject) {
          console.error('RootElement inválido');
          return null;
        }

        // Encontrar o pai correto para criar o elemento
        let targetParent = rootElement;
        const rootBo = rootElement.businessObject;
        const rootType = rootBo.$type || rootElement.type;

        // Se o rootElement é uma Colaboração, precisamos encontrar uma Lane ou Participant
        if (rootType === 'bpmn:Collaboration') {
          // Primeiro, tentar encontrar uma Lane
          const lanes = elementRegistry.filter(el => el.type === 'bpmn:Lane');

          if (lanes.length > 0) {
            targetParent = lanes[0];
          } else {
            // Se não houver lanes, usar o Participant
            const participants = elementRegistry.filter(el => el.type === 'bpmn:Participant');

            if (participants.length > 0) {
              targetParent = participants[0];
            } else {
              console.error('Colaboração sem participantes');
              alert('Adicione uma Pool/Participante ao diagrama antes de adicionar fluxos.');
              return null;
            }
          }
        }

        // Criar um ID único baseado no flowId (sem caracteres especiais)
        const safeId = 'CallActivity_' + flowId.replace(/-/g, '').substring(0, 8);

        // Criar o shape
        const shape = elementFactory.createShape({
          type: 'bpmn:CallActivity'
        });

        // Posição no canvas (dentro do parent)
        const position = { x: 250, y: 200 };

        // Adicionar ao canvas
        modeling.createShape(shape, position, targetParent);

        // Atualizar o nome após criar
        modeling.updateProperties(shape, { name: flowName });

        // Armazenar o ID do fluxo original como atributo customizado para referência
        shape.flowId = flowId;

        // Aplicar cor laranja após um pequeno delay
        setTimeout(() => {
          try {
            modeling.setColor([shape], {
              fill: '#fef3c7',
              stroke: '#f59e0b'
            });
          } catch (colorError) {
            console.warn('Não foi possível aplicar cor:', colorError);
          }
        }, 200);

        console.log('CallActivity criado com sucesso:', shape.id, 'para flowId:', flowId);
        return shape;
      } catch (e) {
        console.error('Erro ao criar CallActivity:', e);
        alert('Erro ao criar elemento: ' + e.message);
        return null;
      }
    },
    // Verificar se um fluxo já foi adicionado ao canvas
    hasFlowElement(flowId) {
      if (!modelerRef.current) return false;
      try {
        const elementRegistry = modelerRef.current.get('elementRegistry');
        // Procurar por CallActivity com o flowId correspondente
        const found = elementRegistry.filter(el =>
          el.type === 'bpmn:CallActivity' && el.flowId === flowId
        );
        return found.length > 0;
      } catch (e) {
        return false;
      }
    },
    // Remover elemento de fluxo do canvas
    removeFlowElement(flowId) {
      if (!modelerRef.current) return false;
      try {
        const modeling = modelerRef.current.get('modeling');
        const elementRegistry = modelerRef.current.get('elementRegistry');
        // Procurar por CallActivity com o flowId correspondente
        const elements = elementRegistry.filter(el =>
          el.type === 'bpmn:CallActivity' && el.flowId === flowId
        );
        if (elements.length > 0) {
          modeling.removeElements(elements);
          return true;
        }
        return false;
      } catch (e) {
        console.error('Erro ao remover elemento:', e);
        return false;
      }
    },
    // Método para criar overlay de imagem para um elemento existente
    createImageOverlayForElement(element, imageUrl, format) {
      if (!modelerRef.current) return;

      const modeler = modelerRef.current;
      const overlays = modeler.get('overlays');

      const borderRadius = format === 'circle' ? '50%' : format === 'rounded' ? '12px' : '4px';

      const overlayHtml = document.createElement('div');
      overlayHtml.className = 'bpmn-image-overlay';
      overlayHtml.setAttribute('data-format', format);
      overlayHtml.style.cssText = `
        width: ${element.width}px;
        height: ${element.height}px;
        overflow: hidden;
        border-radius: ${borderRadius};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        pointer-events: none;
        background: white;
      `;

      const img = document.createElement('img');
      img.src = imageUrl;
      img.draggable = false;
      img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      `;

      overlayHtml.appendChild(img);

      overlays.add(element.id, {
        position: { top: 0, left: 0 },
        html: overlayHtml
      });

      // Marcar elemento com atributo para CSS e esconder texto
      const hideImageText = () => {
        const gfx = document.querySelector(`[data-element-id="${element.id}"]`);
        if (gfx) {
          gfx.setAttribute('data-image-element', 'true');
          gfx.setAttribute('data-image-format', format);
          // Esconder texto/label dentro do elemento
          const textElements = gfx.querySelectorAll('text, tspan');
          textElements.forEach(txt => {
            txt.style.display = 'none';
            txt.style.visibility = 'hidden';
          });
        }
      };
      setTimeout(hideImageText, 50);
      setTimeout(hideImageText, 200); // Garantir após renderização completa

      // Listener para atualizar overlay quando elemento for redimensionado
      const eventBus = modeler.get('eventBus');
      const modeling = modeler.get('modeling');

      // Função para atualizar tamanho do overlay
      const updateSize = (width, height) => {
        overlayHtml.style.width = width + 'px';
        overlayHtml.style.height = height + 'px';
      };

      // Função para salvar dimensões no JSON do elemento
      const saveDimensions = (shape) => {
        try {
          const bo = shape.businessObject;
          if (bo && bo.name && bo.name.startsWith('__IMAGE__:')) {
            const jsonData = bo.name.substring(10);
            const imageData = JSON.parse(jsonData);
            // Atualizar com novas dimensões
            imageData.width = shape.width;
            imageData.height = shape.height;
            // Salvar de volta no elemento
            modeling.updateProperties(shape, {
              name: '__IMAGE__:' + JSON.stringify(imageData)
            });
          }
        } catch (err) {
          console.error('Erro ao salvar dimensões:', err);
        }
      };

      // Handler para resize em tempo real (durante o arraste)
      const onResizeMove = (e) => {
        if (e.shape && e.shape.id === element.id) {
          const newBounds = e.newBounds;
          if (newBounds) {
            updateSize(newBounds.width, newBounds.height);
          }
        }
      };

      // Handler para shape.changed (usa e.element)
      const onShapeChanged = (e) => {
        const shape = e.element;
        if (shape && shape.id === element.id) {
          updateSize(shape.width, shape.height);
          // Re-esconder texto após mudanças
          setTimeout(hideImageText, 10);
        }
      };

      // Handler para resize postExecuted (usa e.context.shape)
      // Este é chamado quando o resize TERMINA - salvar dimensões aqui
      const onResizeExecuted = (e) => {
        const shape = e.context?.shape;
        if (shape && shape.id === element.id) {
          updateSize(shape.width, shape.height);
          // Salvar as novas dimensões no JSON
          saveDimensions(shape);
        }
      };

      // Evento em tempo real durante o resize
      eventBus.on('resize.move', onResizeMove);
      eventBus.on('shape.changed', onShapeChanged);
      eventBus.on('commandStack.shape.resize.postExecuted', onResizeExecuted);
    },

    // Método para restaurar overlays de imagem ao carregar diagrama
    restoreImageOverlays() {
      if (!modelerRef.current) return;

      const modeler = modelerRef.current;
      const elementRegistry = modeler.get('elementRegistry');

      // Buscar todos os elementos que têm dados de imagem
      elementRegistry.forEach((element) => {
        if (element.businessObject && element.businessObject.name) {
          try {
            // Verificar se o nome contém dados de imagem (formato JSON)
            if (element.businessObject.name.startsWith('__IMAGE__:')) {
              const jsonData = element.businessObject.name.substring(10);
              const imageData = JSON.parse(jsonData);
              this.createImageOverlayForElement(element, imageData.url, imageData.format);
            }
          } catch (e) {
            // Não é um elemento de imagem, ignorar
          }
        }
      });
    },

    // Método para adicionar imagem como elemento BPMN (Task com overlay de imagem)
    addImageOverlay(imageUrl, x = 300, y = 300, format = 'square') {
      console.log('addImageOverlay chamado:', { imageUrl: imageUrl?.substring(0, 50), x, y, format });
      if (!modelerRef.current) {
        console.error('modelerRef.current é null');
        return null;
      }

      try {
        const modeler = modelerRef.current;
        const modeling = modeler.get('modeling');
        const elementFactory = modeler.get('elementFactory');
        const canvas = modeler.get('canvas');
        const elementRegistry = modeler.get('elementRegistry');

        // Obter o elemento raiz do canvas
        const rootElement = canvas.getRootElement();

        if (!rootElement || !rootElement.businessObject) {
          console.error('RootElement inválido');
          return null;
        }

        // Encontrar o pai correto para criar o elemento
        let targetParent = rootElement;
        const rootBo = rootElement.businessObject;
        const rootType = rootBo.$type || rootElement.type;

        console.log('Root type:', rootType);

        // Se o rootElement é uma Colaboração, precisamos encontrar uma Lane ou Participant
        if (rootType === 'bpmn:Collaboration') {
          // Primeiro, tentar encontrar uma Lane (mais específico)
          const lanes = elementRegistry.filter(el => el.type === 'bpmn:Lane');

          if (lanes.length > 0) {
            // Usar a primeira Lane disponível
            targetParent = lanes[0];
            console.log('Usando Lane como pai:', targetParent.id);
          } else {
            // Se não houver lanes, usar o Participant
            const participants = elementRegistry.filter(el => el.type === 'bpmn:Participant');

            if (participants.length > 0) {
              targetParent = participants[0];
              console.log('Usando Participant como pai:', targetParent.id);
            } else {
              console.error('Colaboração sem participantes - não é possível adicionar elementos');
              alert('Adicione uma Pool/Participante ao diagrama antes de inserir imagens.');
              return null;
            }
          }
        }

        // Tamanho da imagem
        const size = 120;

        // Criar o shape
        const shape = elementFactory.createShape({
          type: 'bpmn:Task',
          width: size,
          height: size
        });

        // Posição no canvas (centro da área visível)
        const viewbox = canvas.viewbox();
        const position = {
          x: viewbox.x + viewbox.width / 2,
          y: viewbox.y + viewbox.height / 2
        };

        console.log('Criando shape em:', targetParent.id, 'posição:', position);

        // Adicionar ao canvas
        modeling.createShape(shape, position, targetParent);

        // Obter o ID gerado automaticamente
        const imageId = shape.id;
        console.log('Shape criado com sucesso, ID:', imageId);

        // Contar imagens existentes para gerar nome automático
        let imageCount = 1;
        elementRegistry.forEach((el) => {
          if (el.businessObject?.name?.startsWith('__IMAGE__:')) {
            imageCount++;
          }
        });

        // Salvar dados da imagem no nome do elemento (será persistido no XML)
        // Formato: __IMAGE__:{"url":"...","format":"...","displayName":"..."}
        const imageData = JSON.stringify({
          url: imageUrl,
          format: format,
          displayName: `Imagem ${imageCount}`
        });
        modeling.updateProperties(shape, {
          name: '__IMAGE__:' + imageData
        });

        // Criar o overlay visual
        this.createImageOverlayForElement(shape, imageUrl, format);

        return imageId;
      } catch (e) {
        console.error('Erro ao adicionar imagem:', e);
        console.error('Stack:', e.stack);
        return null;
      }
    },
    // Método para obter o modeler (para uso avançado)
    getModeler() {
      return modelerRef.current;
    },
    // Método para atualizar propriedades de um elemento (nome, documentação, etc.)
    updateElementProperties(element, properties) {
      if (!modelerRef.current || !element) return false;

      try {
        const modeling = modelerRef.current.get('modeling');
        modeling.updateProperties(element, properties);
        return true;
      } catch (e) {
        console.error('Erro ao atualizar propriedades:', e);
        return false;
      }
    },
    // Método para carregar o template Comercial
    async loadComercialTemplate() {
      if (!modelerRef.current) return false;

      try {
        await modelerRef.current.importXML(COMERCIAL_DIAGRAM_XML);

        const canvas = modelerRef.current.get('canvas');
        canvas.zoom(0.7); // Zoom out para ver o diagrama completo

        // Centralizar no conteúdo
        const viewbox = canvas.viewbox();
        const elementRegistry = modelerRef.current.get('elementRegistry');
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        elementRegistry.forEach((element) => {
          if (element.x !== undefined && element.y !== undefined) {
            minX = Math.min(minX, element.x);
            minY = Math.min(minY, element.y);
            maxX = Math.max(maxX, element.x + (element.width || 0));
            maxY = Math.max(maxY, element.y + (element.height || 0));
          }
        });

        if (minX !== Infinity) {
          const contentCenterX = (minX + maxX) / 2;
          const contentCenterY = (minY + maxY) / 2;
          canvas.viewbox({
            x: contentCenterX - viewbox.width / 2,
            y: contentCenterY - viewbox.height / 2,
            width: viewbox.width,
            height: viewbox.height
          });
        }

        // Aplicar ícones de robô apenas em elementos com [ROBO] no nome
        setTimeout(() => {
          const overlays = modelerRef.current.get('overlays');
          elementRegistry.forEach((element) => {
            // Aplicar ícone de robô APENAS em ServiceTasks com [ROBO] no nome
            const hasRoboPrefix = element.businessObject?.name?.includes('[ROBO]');

            if (hasRoboPrefix) {
              const gfx = document.querySelector(`[data-element-id="${element.id}"]`);
              if (gfx) {
                gfx.setAttribute('data-robot-task', 'true');

                // Esconder apenas a engrenagem (circles e paths pequenos), mas MANTER o retângulo
                const visual = gfx.querySelector('.djs-visual');
                if (visual) {
                  // Esconder circles (parte da engrenagem)
                  visual.querySelectorAll('circle').forEach(circle => {
                    circle.style.display = 'none';
                  });

                  // Esconder paths pequenos (dentes da engrenagem), mas manter o retângulo
                  visual.querySelectorAll('path').forEach((path, index) => {
                    // Primeiro path geralmente é o retângulo (grande), demais são engrenagem (pequenos)
                    if (index > 0) {
                      path.style.display = 'none';
                    }
                  });
                }

                // Esconder texto [ROBO] do label se existir
                const textElement = gfx.querySelector('.djs-label text');
                if (textElement && element.businessObject.name) {
                  const originalName = element.businessObject.name;
                  if (originalName.includes('[ROBO]')) {
                    const cleanName = originalName.replace(/\[ROBO\]\s*/g, '');
                    textElement.textContent = cleanName;
                  }
                }
              }

              try { overlays.remove({ element: element.id, type: 'robot-icon' }); } catch (e) {}

              const robotSvg = document.createElement('div');
              robotSvg.className = 'robot-icon-overlay';
              robotSvg.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <line x1="12" y1="7" x2="12" y2="11" />
                  <line x1="8" y1="16" x2="8" y2="16" stroke-width="3" />
                  <line x1="16" y1="16" x2="16" y2="16" stroke-width="3" />
                </svg>
              `;
              overlays.add(element.id, 'robot-icon', { position: { top: 5, left: 5 }, html: robotSvg });
            }
          });
        }, 300);

        // Notificar mudança de XML
        const { xml: newXml } = await modelerRef.current.saveXML({ format: true });
        if (onXmlChange) onXmlChange(newXml);

        return true;
      } catch (e) {
        console.error('Erro ao carregar template comercial:', e);
        return false;
      }
    }
  }), [onXmlChange]);

  // Atualizar zoom level
  const updateZoomLevel = useCallback(() => {
    if (modelerRef.current) {
      try {
        const canvas = modelerRef.current.get('canvas');
        const zoom = canvas.zoom();
        setZoomLevel(Math.round(zoom * 100));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Aplicar/remover grid no canvas
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const bjsContainer = container.querySelector('.bjs-container');
    if (bjsContainer) {
      if (showGrid) {
        bjsContainer.classList.add('grid-enabled');
      } else {
        bjsContainer.classList.remove('grid-enabled');
      }
    }
  }, [showGrid]);

  // Inicializar modeler APENAS uma vez
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !initialXmlRef.current) return;

    const initModeler = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const modeler = new BpmnJS({
          container: container,
          keyboard: {
            bindTo: document
          },
          additionalModules: [
            translateModule,
            customResizeModule
          ]
        });

        modelerRef.current = modeler;

        await modeler.importXML(initialXmlRef.current);

        const canvas = modeler.get('canvas');

        // Definir zoom em 100% e centralizar no conteúdo do diagrama
        canvas.zoom(1.0); // 100%

        // Centralizar a visualização no centro do diagrama
        const viewbox = canvas.viewbox();
        const rootElement = canvas.getRootElement();

        if (rootElement) {
          // Calcular o centro do conteúdo
          const elementRegistry = modeler.get('elementRegistry');
          let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

          elementRegistry.forEach((element) => {
            if (element.x !== undefined && element.y !== undefined) {
              minX = Math.min(minX, element.x);
              minY = Math.min(minY, element.y);
              maxX = Math.max(maxX, element.x + (element.width || 0));
              maxY = Math.max(maxY, element.y + (element.height || 0));
            }
          });

          // Se encontrou elementos, centralizar neles
          if (minX !== Infinity) {
            const contentCenterX = (minX + maxX) / 2;
            const contentCenterY = (minY + maxY) / 2;

            // Mover viewbox para centralizar no conteúdo
            canvas.viewbox({
              x: contentCenterX - viewbox.width / 2,
              y: contentCenterY - viewbox.height / 2,
              width: viewbox.width,
              height: viewbox.height
            });
          }
        }

        setZoomLevel(100);

        // Restaurar overlays de imagens salvas
        const restoreImageOverlays = () => {
          const elementRegistry = modeler.get('elementRegistry');
          const overlays = modeler.get('overlays');
          const eventBus = modeler.get('eventBus');
          const modeling = modeler.get('modeling');

          elementRegistry.forEach((element) => {
            if (element.businessObject && element.businessObject.name) {
              try {
                if (element.businessObject.name.startsWith('__IMAGE__:')) {
                  const jsonData = element.businessObject.name.substring(10);
                  const imageData = JSON.parse(jsonData);

                  // Usar dimensões salvas se existirem, senão usar do elemento
                  const savedWidth = imageData.width || element.width;
                  const savedHeight = imageData.height || element.height;

                  // Se as dimensões salvas são diferentes das do elemento, redimensionar
                  if (imageData.width && imageData.height &&
                      (element.width !== imageData.width || element.height !== imageData.height)) {
                    modeling.resizeShape(element, {
                      x: element.x,
                      y: element.y,
                      width: imageData.width,
                      height: imageData.height
                    });
                  }

                  const borderRadius = imageData.format === 'circle' ? '50%' : imageData.format === 'rounded' ? '12px' : '4px';

                  const overlayHtml = document.createElement('div');
                  overlayHtml.className = 'bpmn-image-overlay';
                  overlayHtml.style.cssText = `
                    width: ${savedWidth}px;
                    height: ${savedHeight}px;
                    overflow: hidden;
                    border-radius: ${borderRadius};
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    pointer-events: none;
                    background: white;
                  `;

                  const img = document.createElement('img');
                  img.src = imageData.url;
                  img.draggable = false;
                  img.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    display: block;
                  `;

                  overlayHtml.appendChild(img);

                  overlays.add(element.id, {
                    position: { top: 0, left: 0 },
                    html: overlayHtml
                  });

                  // Marcar elemento com atributo para CSS e esconder texto
                  const hideImageText = () => {
                    const gfx = document.querySelector(`[data-element-id="${element.id}"]`);
                    if (gfx) {
                      gfx.setAttribute('data-image-element', 'true');
                      gfx.setAttribute('data-image-format', imageData.format);
                      // Esconder texto/label dentro do elemento
                      const textElements = gfx.querySelectorAll('text, tspan');
                      textElements.forEach(txt => {
                        txt.style.display = 'none';
                        txt.style.visibility = 'hidden';
                      });
                    }
                  };
                  setTimeout(hideImageText, 50);
                  setTimeout(hideImageText, 200);
                  setTimeout(hideImageText, 500); // Garantir após renderização completa

                  // Listener para atualizar overlay no resize
                  const updateSize = (width, height) => {
                    overlayHtml.style.width = width + 'px';
                    overlayHtml.style.height = height + 'px';
                  };

                  // Função para salvar dimensões no JSON
                  const saveDimensions = (shape) => {
                    try {
                      const bo = shape.businessObject;
                      if (bo && bo.name && bo.name.startsWith('__IMAGE__:')) {
                        const data = JSON.parse(bo.name.substring(10));
                        data.width = shape.width;
                        data.height = shape.height;
                        modeling.updateProperties(shape, {
                          name: '__IMAGE__:' + JSON.stringify(data)
                        });
                      }
                    } catch (err) {
                      console.error('Erro ao salvar dimensões:', err);
                    }
                  };

                  // Handler para resize em tempo real
                  const onResizeMove = (e) => {
                    if (e.shape && e.shape.id === element.id) {
                      const newBounds = e.newBounds;
                      if (newBounds) {
                        updateSize(newBounds.width, newBounds.height);
                      }
                    }
                  };

                  const onShapeChanged = (e) => {
                    const shape = e.element;
                    if (shape && shape.id === element.id) {
                      updateSize(shape.width, shape.height);
                      // Re-esconder texto após mudanças
                      setTimeout(hideImageText, 10);
                    }
                  };

                  // Quando resize termina, salvar dimensões
                  const onResizeExecuted = (e) => {
                    const shape = e.context?.shape;
                    if (shape && shape.id === element.id) {
                      updateSize(shape.width, shape.height);
                      saveDimensions(shape);
                    }
                  };

                  eventBus.on('resize.move', onResizeMove);
                  eventBus.on('shape.changed', onShapeChanged);
                  eventBus.on('commandStack.shape.resize.postExecuted', onResizeExecuted);

                  console.log('Imagem restaurada:', element.id, 'dimensões:', savedWidth, 'x', savedHeight);
                }
              } catch (e) {
                // Não é um elemento de imagem, ignorar
              }
            }
          });
        };

        // Restaurar imagens após um pequeno delay para garantir que o DOM está pronto
        setTimeout(restoreImageOverlays, 200);

        // Função para adicionar ícone de robô em tarefas automatizadas
        // NOTA: Só aplica em elementos que têm [ROBO] no nome (opção explícita do usuário)
        const applyRobotIcons = () => {
          const elementRegistry = modeler.get('elementRegistry');
          const overlays = modeler.get('overlays');

          elementRegistry.forEach((element) => {
            // Aplicar ícone de robô APENAS em ServiceTasks com [ROBO] no nome
            const hasRoboPrefix = element.businessObject?.name?.includes('[ROBO]');

            if (hasRoboPrefix) {
              // Marcar elemento com atributo para CSS
              const gfx = document.querySelector(`[data-element-id="${element.id}"]`);
              if (gfx) {
                gfx.setAttribute('data-robot-task', 'true');

                // Esconder apenas a engrenagem (circles e paths pequenos), mas MANTER o retângulo
                const visual = gfx.querySelector('.djs-visual');
                if (visual) {
                  // Esconder circles (parte da engrenagem)
                  visual.querySelectorAll('circle').forEach(circle => {
                    circle.style.display = 'none';
                  });

                  // Esconder paths pequenos (dentes da engrenagem), mas manter o retângulo
                  visual.querySelectorAll('path').forEach((path, index) => {
                    // Primeiro path geralmente é o retângulo (grande), demais são engrenagem (pequenos)
                    if (index > 0) {
                      path.style.display = 'none';
                    }
                  });
                }
              }

              // Remover overlays existentes de robô para este elemento
              try {
                overlays.remove({ element: element.id, type: 'robot-icon' });
              } catch (e) {}

              // Criar overlay com ícone de robô
              const robotSvg = document.createElement('div');
              robotSvg.className = 'robot-icon-overlay';
              robotSvg.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width: 18px; height: 18px;">
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <circle cx="12" cy="5" r="2" />
                  <line x1="12" y1="7" x2="12" y2="11" />
                  <line x1="8" y1="16" x2="8" y2="16" stroke-width="3" />
                  <line x1="16" y1="16" x2="16" y2="16" stroke-width="3" />
                  <path d="M9 21v-1" />
                  <path d="M15 21v-1" />
                </svg>
              `;

              overlays.add(element.id, 'robot-icon', {
                position: { top: 5, left: 5 },
                html: robotSvg
              });

              // Esconder texto [ROBO] do label se existir
              const textElement = gfx.querySelector('.djs-label text');
              if (textElement && element.businessObject.name) {
                const originalName = element.businessObject.name;
                if (originalName.includes('[ROBO]')) {
                  // Remover [ROBO] do texto visível (mas manter no businessObject)
                  const cleanName = originalName.replace(/\[ROBO\]\s*/g, '');
                  textElement.textContent = cleanName;
                }
              }
            }
          });
        };

        // Aplicar ícones de robô após carregar
        setTimeout(applyRobotIcons, 300);

        // Re-aplicar quando elementos são adicionados/modificados
        const eventBus = modeler.get('eventBus');
        eventBus.on('shape.added', () => {
          setTimeout(applyRobotIcons, 100);
        });
        eventBus.on('shape.changed', () => {
          setTimeout(applyRobotIcons, 100);
        });

        // Aplicar grid inicial
        const bjsContainer = container.querySelector('.bjs-container');
        if (bjsContainer && showGrid) {
          bjsContainer.classList.add('grid-enabled');
        }

        // Listener para zoom
        eventBus.on('canvas.viewbox.changed', updateZoomLevel);

        // Adicionar opção "Tarefa Automatizada" no menu "Change element" usando MutationObserver
        const menuObserver = new MutationObserver(() => {
          const popupBody = document.querySelector('.djs-popup-body');
          if (!popupBody) return;

          // Verificar se já existe a opção (evitar duplicação)
          if (document.querySelector('[data-action="replace-with-robot-task"]')) return;

          // Procurar onde está o "Service task" para adicionar logo depois
          const serviceTaskEntry = Array.from(popupBody.querySelectorAll('.entry')).find(
            entry => entry.textContent.includes('Service task')
          );

          if (serviceTaskEntry) {
            console.log('🤖 Adicionando opção "Tarefa Automatizada" ao menu...');

            // Pegar o elemento selecionado
            const selection = modeler.get('selection').get()[0];

            // Criar nova opção "Tarefa Automatizada"
            const robotEntry = document.createElement('div');
            robotEntry.className = 'entry';
            robotEntry.setAttribute('data-action', 'replace-with-robot-task');
            robotEntry.innerHTML = `
              <span class="robot-menu-icon" style="font-size: 20px; margin-right: 8px;">🤖</span>
              <span>Tarefa Automatizada</span>
            `;
            robotEntry.style.cursor = 'pointer';
            robotEntry.style.padding = '8px 12px';
            robotEntry.style.display = 'flex';
            robotEntry.style.alignItems = 'center';

            // Adicionar hover
            robotEntry.addEventListener('mouseenter', () => {
              robotEntry.style.backgroundColor = '#f3f4f6';
            });
            robotEntry.addEventListener('mouseleave', () => {
              robotEntry.style.backgroundColor = '';
            });

            // Adicionar ação ao clicar
            robotEntry.addEventListener('click', () => {
              const bpmnReplace = modeler.get('bpmnReplace');
              const modeling = modeler.get('modeling');

              // Preservar nome ou criar novo com [ROBO]
              let newName = selection.businessObject.name || 'Automação';
              if (!newName.includes('[ROBO]')) {
                newName = '[ROBO] ' + newName;
              }

              // Substituir elemento usando bpmnReplace
              const newElement = bpmnReplace.replaceElement(selection, {
                type: 'bpmn:ServiceTask'
              });

              // Atualizar o nome para incluir [ROBO]
              modeling.updateProperties(newElement, {
                name: newName
              });

              // Fechar popup
              const popup = document.querySelector('.djs-popup');
              if (popup) popup.remove();
            });

            // Inserir logo após o Service task
            serviceTaskEntry.parentNode.insertBefore(robotEntry, serviceTaskEntry.nextSibling);
          }
        });

        // Observar mudanças no DOM para detectar quando o popup aparece
        menuObserver.observe(document.body, { childList: true, subtree: true });

        // Listener para mudanças - só notifica o pai, não recarrega
        modeler.on('commandStack.changed', async () => {
          try {
            const { xml: newXml } = await modeler.saveXML({ format: true });
            if (onXmlChange) onXmlChange(newXml);
          } catch (e) {
            console.error('Erro ao exportar:', e);
          }
        });

        // Listener para seleção
        modeler.on('selection.changed', (e) => {
          if (onElementSelect) {
            onElementSelect(e.newSelection?.[0] || null);
          }
        });

        // Habilitar copiar/colar com Ctrl+C/Cmd+C e Ctrl+V/Cmd+V
        const editorActions = modeler.get('editorActions');
        const copyPaste = modeler.get('copyPaste');
        const selection = modeler.get('selection');
        const clipboard = modeler.get('clipboard');

        const handleCopyPaste = (e) => {
          // Ignorar se estiver em um input ou textarea
          if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
          }

          const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
          const modifier = isMac ? e.metaKey : e.ctrlKey;

          if (modifier && e.key === 'c') {
            // Copiar
            const selected = selection.get();
            if (selected.length > 0) {
              e.preventDefault();
              copyPaste.copy(selected);
              console.log('Elementos copiados:', selected.length);
            }
          } else if (modifier && e.key === 'v') {
            // Colar
            e.preventDefault();
            if (clipboard.isEmpty && clipboard.isEmpty()) {
              console.log('Clipboard vazio');
              return;
            }
            copyPaste.paste();
            console.log('Elementos colados');
          } else if (modifier && e.key === 'x') {
            // Recortar (copiar + deletar)
            const selected = selection.get();
            if (selected.length > 0) {
              e.preventDefault();
              copyPaste.copy(selected);
              const modeling = modeler.get('modeling');
              modeling.removeElements(selected);
              console.log('Elementos recortados:', selected.length);
            }
          }
        };

        document.addEventListener('keydown', handleCopyPaste);

        // Guardar referência para cleanup
        modelerRef.current._copyPasteHandler = handleCopyPaste;

        // Criar elemento tooltip global
        let tooltipEl = document.getElementById('bpmn-tooltip');
        if (!tooltipEl) {
          tooltipEl = document.createElement('div');
          tooltipEl.id = 'bpmn-tooltip';
          tooltipEl.style.cssText = `
            position: fixed;
            background: #1e293b;
            color: white;
            padding: 8px 14px;
            border-radius: 8px;
            font-size: 13px;
            font-weight: 500;
            white-space: nowrap;
            z-index: 100000;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.1s ease;
            box-shadow: 0 4px 16px rgba(0,0,0,0.25);
          `;
          document.body.appendChild(tooltipEl);
        }

        // Função para mostrar tooltip
        const showTooltip = (e) => {
          const entry = e.currentTarget;
          const text = entry.getAttribute('data-tooltip');
          if (!text) return;

          const rect = entry.getBoundingClientRect();
          tooltipEl.textContent = text;
          tooltipEl.style.opacity = '1';
          tooltipEl.style.left = (rect.right + 12) + 'px';
          tooltipEl.style.top = (rect.top + rect.height / 2) + 'px';
          tooltipEl.style.transform = 'translateY(-50%)';
        };

        // Função para esconder tooltip
        const hideTooltip = () => {
          tooltipEl.style.opacity = '0';
        };

        // Configurar tooltips
        const setupTooltips = () => {
          // Selecionar TODOS os entries, não apenas os com title
          const entries = container.querySelectorAll('.djs-palette .entry, .djs-context-pad .entry');
          entries.forEach(entry => {
            const title = entry.getAttribute('title');
            if (!title) return; // Pular se não tem title
            if (entry.hasAttribute('data-tooltip-setup')) return;

            const translated = tooltipTranslations[title] || customTranslate(title);
            entry.setAttribute('data-tooltip', translated);
            entry.removeAttribute('title');
            entry.setAttribute('data-tooltip-setup', 'true');

            // Adicionar event listeners
            entry.addEventListener('mouseenter', showTooltip);
            entry.addEventListener('mouseleave', hideTooltip);
          });
        };

        // Também configurar por intervalo para garantir
        const tooltipInterval = setInterval(() => {
          const entries = container.querySelectorAll('.djs-palette .entry[title], .djs-context-pad .entry[title]');
          if (entries.length > 0) {
            setupTooltips();
          }
        }, 100);

        // Limpar intervalo após 5 segundos
        setTimeout(() => clearInterval(tooltipInterval), 5000);

        // Observer para novos elementos
        const observer = new MutationObserver((mutations) => {
          let shouldSetup = false;
          mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) shouldSetup = true;
            if (mutation.type === 'attributes' && mutation.attributeName === 'title') {
              const entry = mutation.target;
              if (entry.hasAttribute('title') && !entry.hasAttribute('data-tooltip-setup')) {
                const title = entry.getAttribute('title');
                const translated = tooltipTranslations[title] || customTranslate(title);
                entry.setAttribute('data-tooltip', translated);
                entry.removeAttribute('title');
                entry.setAttribute('data-tooltip-setup', 'true');
                entry.addEventListener('mouseenter', showTooltip);
                entry.addEventListener('mouseleave', hideTooltip);
              }
            }
          });
          if (shouldSetup) setTimeout(setupTooltips, 50);
        });

        observer.observe(container, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['title']
        });

        // Configurar tooltips iniciais
        setTimeout(setupTooltips, 200);
        setTimeout(setupTooltips, 500);
        setTimeout(setupTooltips, 1000);

        // Impedir que scroll na paleta afete o canvas
        const setupPaletteScroll = () => {
          const palette = container.querySelector('.djs-palette');
          if (!palette || palette.hasAttribute('data-scroll-setup')) return;

          palette.setAttribute('data-scroll-setup', 'true');

          palette.addEventListener('wheel', (e) => {
            // Se a paleta tem scroll, capturar o evento
            const hasVerticalScroll = palette.scrollHeight > palette.clientHeight;
            if (hasVerticalScroll) {
              e.stopPropagation();

              // Verificar limites do scroll
              const atTop = palette.scrollTop === 0;
              const atBottom = palette.scrollTop + palette.clientHeight >= palette.scrollHeight;

              // Só permitir scroll se não estiver nos limites ou scrollando na direção oposta
              if ((atTop && e.deltaY < 0) || (atBottom && e.deltaY > 0)) {
                e.preventDefault();
              }
            }
          }, { passive: false });
        };

        setTimeout(setupPaletteScroll, 300);
        setTimeout(setupPaletteScroll, 600);

        // Adicionar botão "Fluxos" na paleta
        const addFluxosButton = () => {
          const palette = container.querySelector('.djs-palette');
          if (!palette) return;

          // Verificar se já existe
          if (palette.querySelector('.fluxos-entry')) return;

          // Criar separador
          const separator = document.createElement('div');
          separator.className = 'separator';
          separator.style.cssText = `
            margin: 6px 8px;
            width: calc(100% - 16px);
            height: 1px;
            background: #e2e8f0;
            border: none;
          `;

          // Criar entrada do Fluxos
          const fluxosEntry = document.createElement('div');
          fluxosEntry.className = 'entry fluxos-entry';
          fluxosEntry.setAttribute('data-tooltip', 'Gerenciar Fluxos');
          fluxosEntry.setAttribute('data-tooltip-setup', 'true');
          fluxosEntry.style.cssText = `
            width: 36px;
            height: 36px;
            min-height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            margin: 2px auto;
            transition: all 0.15s ease;
            cursor: pointer;
          `;

          // Ícone do Fluxos (ícone de pastas/workflow)
          fluxosEntry.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.8;">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              <line x1="12" y1="11" x2="12" y2="17"></line>
              <line x1="9" y1="14" x2="15" y2="14"></line>
            </svg>
          `;

          // Hover effects
          fluxosEntry.addEventListener('mouseenter', (e) => {
            fluxosEntry.style.background = '#f1f5f9';
            fluxosEntry.style.transform = 'scale(1.05)';
            showTooltip(e);
          });

          fluxosEntry.addEventListener('mouseleave', () => {
            fluxosEntry.style.background = '';
            fluxosEntry.style.transform = '';
            hideTooltip();
          });

          // Click handler
          fluxosEntry.addEventListener('click', () => {
            if (onFluxosClick) onFluxosClick();
          });

          // Criar entrada de Imagem
          const imageEntry = document.createElement('div');
          imageEntry.className = 'entry image-entry';
          imageEntry.setAttribute('data-tooltip', 'Adicionar Imagem');
          imageEntry.setAttribute('data-tooltip-setup', 'true');
          imageEntry.style.cssText = `
            width: 36px;
            height: 36px;
            min-height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            margin: 2px auto;
            transition: all 0.15s ease;
            cursor: pointer;
          `;

          // Ícone de imagem
          imageEntry.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.8;">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          `;

          // Hover effects para imagem
          imageEntry.addEventListener('mouseenter', (e) => {
            imageEntry.style.background = '#f1f5f9';
            imageEntry.style.transform = 'scale(1.05)';
            showTooltip(e);
          });

          imageEntry.addEventListener('mouseleave', () => {
            imageEntry.style.background = '';
            imageEntry.style.transform = '';
            hideTooltip();
          });

          // Click handler para imagem
          imageEntry.addEventListener('click', () => {
            if (onAddImage) onAddImage();
          });

          // Criar entrada de Tarefa Automatizada (Robô)
          const robotEntry = document.createElement('div');
          robotEntry.className = 'entry robot-entry';
          robotEntry.setAttribute('data-tooltip', 'Tarefa Automatizada (Robô)');
          robotEntry.setAttribute('data-tooltip-setup', 'true');
          robotEntry.style.cssText = `
            width: 36px;
            height: 36px;
            min-height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            margin: 2px auto;
            transition: all 0.15s ease;
            cursor: pointer;
          `;

          // Ícone de robô
          robotEntry.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.8;">
              <rect x="3" y="11" width="18" height="10" rx="2" />
              <circle cx="12" cy="5" r="2" />
              <line x1="12" y1="7" x2="12" y2="11" />
              <line x1="8" y1="16" x2="8" y2="16" stroke-width="3" />
              <line x1="16" y1="16" x2="16" y2="16" stroke-width="3" />
            </svg>
          `;

          // Hover effects para robô
          robotEntry.addEventListener('mouseenter', (e) => {
            robotEntry.style.background = '#f5f3ff';
            robotEntry.style.transform = 'scale(1.05)';
            showTooltip(e);
          });

          robotEntry.addEventListener('mouseleave', () => {
            robotEntry.style.background = '';
            robotEntry.style.transform = '';
            hideTooltip();
          });

          // Click handler para criar tarefa automatizada
          robotEntry.addEventListener('click', () => {
            try {
              const modeling = modeler.get('modeling');
              const elementFactory = modeler.get('elementFactory');
              const canvas = modeler.get('canvas');
              const elementRegistry = modeler.get('elementRegistry');

              // Obter o elemento raiz do canvas
              const rootElement = canvas.getRootElement();
              let targetParent = rootElement;
              const rootBo = rootElement.businessObject;
              const rootType = rootBo.$type || rootElement.type;

              // Se for Colaboração, encontrar Lane ou Participant
              if (rootType === 'bpmn:Collaboration') {
                const lanes = elementRegistry.filter(el => el.type === 'bpmn:Lane');
                if (lanes.length > 0) {
                  targetParent = lanes[0];
                } else {
                  const participants = elementRegistry.filter(el => el.type === 'bpmn:Participant');
                  if (participants.length > 0) {
                    targetParent = participants[0];
                  }
                }
              }

              // Criar o shape como ServiceTask (engrenagem base)
              const shape = elementFactory.createShape({
                type: 'bpmn:ServiceTask'
              });

              // Posição no centro da área visível
              const viewbox = canvas.viewbox();
              const position = {
                x: viewbox.x + viewbox.width / 2,
                y: viewbox.y + viewbox.height / 2
              };

              // Adicionar ao canvas
              modeling.createShape(shape, position, targetParent);

              // Definir nome com prefixo [ROBO] para ativar o ícone
              modeling.updateProperties(shape, { name: '[ROBO] Nova Automação' });

              // Aplicar cor roxa
              setTimeout(() => {
                modeling.setColor([shape], {
                  fill: '#f5f3ff',
                  stroke: '#8b5cf6'
                });
              }, 100);

              console.log('Tarefa automatizada criada:', shape.id);
            } catch (e) {
              console.error('Erro ao criar tarefa automatizada:', e);
            }
          });

          // Adicionar ao final da paleta
          palette.appendChild(separator);
          palette.appendChild(fluxosEntry);
          palette.appendChild(imageEntry);
          // Robô removido da paleta - agora está no menu "Change element"
        };

        // Aguardar paleta ser renderizada
        setTimeout(addFluxosButton, 300);
        setTimeout(addFluxosButton, 600);

        setIsLoading(false);
      } catch (err) {
        console.error('Erro BPMN:', err);
        setError(err.message || 'Erro ao carregar diagrama');
        setIsLoading(false);
      }
    };

    const timer = setTimeout(initModeler, 100);

    return () => {
      clearTimeout(timer);
      if (modelerRef.current) {
        // Remover handler de copiar/colar
        if (modelerRef.current._copyPasteHandler) {
          document.removeEventListener('keydown', modelerRef.current._copyPasteHandler);
        }
        modelerRef.current.destroy();
        modelerRef.current = null;
      }
    };
  }, [updateZoomLevel]); // Removido xml das dependências!

  // Zoom handlers
  const zoomIn = useCallback(() => {
    const canvas = modelerRef.current?.get('canvas');
    if (canvas) {
      canvas.zoom(canvas.zoom() * 1.2);
      updateZoomLevel();
    }
  }, [updateZoomLevel]);

  const zoomOut = useCallback(() => {
    const canvas = modelerRef.current?.get('canvas');
    if (canvas) {
      canvas.zoom(canvas.zoom() / 1.2);
      updateZoomLevel();
    }
  }, [updateZoomLevel]);

  const zoomFit = useCallback(() => {
    const canvas = modelerRef.current?.get('canvas');
    if (canvas) {
      canvas.zoom('fit-viewport');
      updateZoomLevel();
    }
  }, [updateZoomLevel]);

  const zoomReset = useCallback(() => {
    const canvas = modelerRef.current?.get('canvas');
    if (canvas) {
      canvas.zoom(1);
      updateZoomLevel();
    }
  }, [updateZoomLevel]);

  return (
    <div className="relative w-full h-full" style={{ minHeight: '500px' }}>
      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/90 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-600">Carregando...</span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="absolute inset-0 bg-red-50 flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md text-center">
            <h3 className="text-red-600 font-bold mb-2">Erro ao carregar diagrama</h3>
            <p className="text-slate-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Toolbar */}
      {!isLoading && !error && (
        <div className="absolute top-4 right-4 z-20">
          <div className="bg-white rounded-lg shadow-lg flex items-center border border-slate-200">
            <button
              onClick={zoomOut}
              className="px-3 py-2 hover:bg-slate-100 border-r border-slate-200"
              title="Diminuir zoom"
            >
              <span className="text-xl font-bold text-slate-600">−</span>
            </button>
            <button
              onClick={zoomReset}
              className="px-4 py-2 hover:bg-slate-100 border-r border-slate-200 text-sm font-semibold text-slate-700 min-w-[70px]"
              title="Resetar para 100%"
            >
              {zoomLevel}%
            </button>
            <button
              onClick={zoomIn}
              className="px-3 py-2 hover:bg-slate-100 border-r border-slate-200"
              title="Aumentar zoom"
            >
              <span className="text-xl font-bold text-slate-600">+</span>
            </button>
            <button
              onClick={zoomFit}
              className="px-3 py-2 hover:bg-slate-100 border-r border-slate-200"
              title="Ajustar à tela"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            <button
              onClick={onGridToggle}
              className={`px-3 py-2 hover:bg-slate-100 transition-colors ${showGrid ? 'bg-indigo-50' : ''}`}
              title={showGrid ? "Desativar grade" : "Ativar grade"}
            >
              <svg className={`w-5 h-5 ${showGrid ? 'text-indigo-600' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Canvas */}
      <div
        ref={containerRef}
        className="w-full h-full bg-white"
        style={{ minHeight: '500px' }}
      />
    </div>
  );
});

export default BpmnEditor;

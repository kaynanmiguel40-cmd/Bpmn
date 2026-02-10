import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import BpmnEditor from '../components/BpmnEditor';
import PropertiesPanel from '../components/PropertiesPanel';
import { EMPTY_DIAGRAM_XML } from '../utils/fynessTemplate';
import {
  getProjects,
  getProjectById,
  createProject as createProjectDB,
  updateProject as updateProjectDB,
  dbToProject
} from '../lib/supabase';

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [currentXml, setCurrentXml] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initialXmlRef = useRef(null);
  const projectIdRef = useRef(id);
  const bpmnEditorRef = useRef(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [showFlowPanel, setShowFlowPanel] = useState(false); // Escondido por padrão
  const [allProjects, setAllProjects] = useState([]);
  const [showNewSubflowModal, setShowNewSubflowModal] = useState(false);
  const [newSubflowName, setNewSubflowName] = useState('');
  const [showGrid, setShowGrid] = useState(true); // Grade de engenheiro
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageFormat, setImageFormat] = useState('square'); // square, rounded, circle

  // Carregar todos os projetos para o painel de dependências
  useEffect(() => {
    const loadAllProjects = async () => {
      const projectsData = await getProjects();
      setAllProjects(projectsData.map(dbToProject));
    };
    loadAllProjects();
  }, []);

  // Calcular informações de dependência do projeto atual
  const flowDependencyInfo = useMemo(() => {
    if (!project || !allProjects.length) return null;

    const parentProject = project.parentId
      ? allProjects.find(p => p.id === project.parentId)
      : null;

    const childProjects = allProjects.filter(p => p.parentId === project.id);

    const getAncestors = (proj, ancestors = []) => {
      if (!proj?.parentId) return ancestors;
      const parent = allProjects.find(p => p.id === proj.parentId);
      if (parent) {
        ancestors.unshift(parent);
        return getAncestors(parent, ancestors);
      }
      return ancestors;
    };

    return {
      parent: parentProject,
      children: childProjects,
      ancestors: getAncestors(project),
      level: project.level || 0,
      isRoot: project.isRoot || !project.parentId
    };
  }, [project, allProjects]);

  // Cores por nível
  const getLevelColor = (level) => {
    const colors = [
      { bg: 'bg-green-500', text: 'text-green-600', light: 'bg-green-50', border: 'border-green-400' },
      { bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-400' },
      { bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-400' },
      { bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-400' },
      { bg: 'bg-pink-500', text: 'text-pink-600', light: 'bg-pink-50', border: 'border-pink-400' },
    ];
    return colors[level % colors.length];
  };

  // Carregar projeto do Supabase
  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);

      if (id) {
        const dbProject = await getProjectById(id);
        if (dbProject) {
          const loadedProject = dbToProject(dbProject);
          setProject(loadedProject);
          setCurrentXml(loadedProject.xml);
          setProjectName(loadedProject.name);
          initialXmlRef.current = loadedProject.xml;
          projectIdRef.current = loadedProject.id;
        } else {
          // Projeto não encontrado, redirecionar
          console.warn('Projeto não encontrado:', id);
          navigate('/');
        }
      } else {
        // Novo projeto sem template
        const newXml = EMPTY_DIAGRAM_XML;
        setCurrentXml(newXml);
        setProjectName('Novo Diagrama');
        initialXmlRef.current = newXml;
      }
      setIsLoading(false);
    };

    loadProject();
  }, [id, navigate]);

  // Detectar mudanças
  useEffect(() => {
    if (currentXml && initialXmlRef.current) {
      setHasChanges(currentXml !== initialXmlRef.current);
    }
  }, [currentXml]);

  // Auto-save com debounce de 500ms (salva rapido para nao perder edicoes)
  useEffect(() => {
    if (!currentXml || !hasChanges || !project) return;

    const autoSaveTimer = setTimeout(async () => {
      setIsSaving(true);
      try {
        if (projectIdRef.current) {
          const updated = await updateProjectDB(projectIdRef.current, { xml: currentXml, name: projectName });
          if (updated) {
            initialXmlRef.current = currentXml;
            setHasChanges(false);
            setShowSaveToast(true);
            setTimeout(() => setShowSaveToast(false), 2000);
          }
        }
      } catch (error) {
        console.error('Erro no auto-save:', error);
      } finally {
        setIsSaving(false);
      }
    }, 500); // 500ms de debounce (mais rapido)

    return () => clearTimeout(autoSaveTimer);
  }, [currentXml, hasChanges, project, projectName]);

  // Handler para mudanças no XML
  const handleXmlChange = useCallback((newXml) => {
    setCurrentXml(newXml);
  }, []);

  // Handler para seleção de elemento
  const handleElementSelect = useCallback((element) => {
    setSelectedElement(element);
  }, []);

  // Salvar projeto
  const handleSave = useCallback(async () => {
    if (!currentXml) return;

    setIsSaving(true);

    try {
      if (projectIdRef.current && project) {
        // Atualizar projeto existente no Supabase
        const updated = await updateProjectDB(projectIdRef.current, { xml: currentXml, name: projectName });
        if (updated) {
          initialXmlRef.current = currentXml;
          setHasChanges(false);
        }
      } else {
        // Criar novo projeto no Supabase
        const dbProject = await createProjectDB({
          name: projectName,
          xml: currentXml,
          isTemplate: false
        });
        if (dbProject) {
          const newProject = dbToProject(dbProject);
          setProject(newProject);
          projectIdRef.current = newProject.id;
          initialXmlRef.current = currentXml;
          setHasChanges(false);
          // Atualizar URL sem recarregar
          window.history.replaceState(null, '', `/editor/${newProject.id}`);
        }
      }

      // Mostrar toast de sucesso
      setShowSaveToast(true);
      setTimeout(() => setShowSaveToast(false), 2000);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setIsSaving(false);
    }
  }, [currentXml, project, projectName]);

  // Atalho de teclado para salvar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave]);

  // Renomear projeto
  const handleRename = async () => {
    if (projectIdRef.current && project) {
      await updateProjectDB(projectIdRef.current, { name: projectName });
    }
    setShowRenameModal(false);
  };

  // Mudar cor de elemento
  const handleColorChange = useCallback((element, color) => {
    if (bpmnEditorRef.current) {
      bpmnEditorRef.current.setElementColor(element, color);
    }
  }, []);

  // Atualizar propriedades de elemento (nome, documentação, etc.)
  const handleElementUpdate = useCallback((element, properties) => {
    if (bpmnEditorRef.current) {
      bpmnEditorRef.current.updateElementProperties(element, properties);
    }
  }, []);

  // Criar sub-fluxo
  const handleCreateSubflow = async () => {
    if (!newSubflowName.trim() || !project) return;

    const newProject = await createProjectDB({
      name: newSubflowName.trim(),
      xml: EMPTY_DIAGRAM_XML,
      companyId: project.companyId,
      parentId: project.id,
      level: (project.level || 0) + 1,
      isRoot: false,
      isTemplate: false
    });

    if (newProject) {
      // Recarregar lista de projetos
      const projectsData = await getProjects();
      setAllProjects(projectsData.map(dbToProject));
      setShowNewSubflowModal(false);
      setNewSubflowName('');
    }
  };

  // Adicionar fluxo como pré-requisito (cria elemento BPMN e define parentId)
  const handleAddFlowAsPrerequisite = async (flowToAdd) => {
    if (!project || !flowToAdd || !bpmnEditorRef.current) return;

    // Verificar se já foi adicionado
    if (bpmnEditorRef.current.hasFlowElement(flowToAdd.id)) {
      alert('Este fluxo já foi adicionado ao canvas!');
      return;
    }

    // Adicionar elemento CallActivity ao canvas BPMN
    const element = bpmnEditorRef.current.addCallActivity(flowToAdd.id, flowToAdd.name);

    if (element) {
      // Calcular novo nível baseado no fluxo pai
      const newLevel = (flowToAdd.level || 0) + 1;

      // Atualizar o projeto atual para ter este fluxo como pai
      const updated = await updateProjectDB(project.id, {
        parentId: flowToAdd.id,
        level: newLevel,
        isRoot: false
      });

      if (updated) {
        // Atualizar estado local
        setProject(prev => ({
          ...prev,
          parentId: flowToAdd.id,
          level: newLevel,
          isRoot: false
        }));

        // Recarregar lista de projetos
        const projectsData = await getProjects();
        setAllProjects(projectsData.map(dbToProject));
      }
    }
  };

  // Remover pré-requisito
  const handleRemovePrerequisite = async () => {
    if (!project || !bpmnEditorRef.current) return;

    // Remover elemento do canvas se existir
    if (flowDependencyInfo?.parent) {
      bpmnEditorRef.current.removeFlowElement(flowDependencyInfo.parent.id);
    }

    // Atualizar o projeto para não ter pai (torna-se raiz)
    const updated = await updateProjectDB(project.id, {
      parentId: null,
      level: 0,
      isRoot: true
    });

    if (updated) {
      // Atualizar estado local
      setProject(prev => ({
        ...prev,
        parentId: null,
        level: 0,
        isRoot: true
      }));

      // Recarregar lista de projetos
      const projectsData = await getProjects();
      setAllProjects(projectsData.map(dbToProject));
    }
  };

  // Download XML
  const handleDownload = () => {
    if (!currentXml) return;

    const blob = new Blob([currentXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, '_')}.bpmn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Download PDF
  const handleDownloadPdf = async () => {
    if (!bpmnEditorRef.current) return;

    setIsExportingPdf(true);

    try {
      const svg = await bpmnEditorRef.current.saveSVG();
      if (!svg) {
        throw new Error('Não foi possível exportar o diagrama');
      }

      // Criar um canvas para converter SVG em imagem
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      // Criar blob URL do SVG
      const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      await new Promise((resolve, reject) => {
        img.onload = () => {
          // Definir tamanho do canvas baseado na imagem
          const scale = 2; // Maior qualidade
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          // Fundo branco
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Desenhar a imagem
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Criar PDF
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
          });

          pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
          pdf.save(`${projectName.replace(/\s+/g, '_')}.pdf`);

          URL.revokeObjectURL(svgUrl);
          resolve();
        };
        img.onerror = reject;
        img.src = svgUrl;
      });
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (isLoading || !currentXml) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-fyness-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600">Carregando editor...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm flex-shrink-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Left: Back + Project Name */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="Voltar ao Dashboard"
            >
              <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-fyness-primary to-fyness-secondary rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </div>

              <button
                onClick={() => setShowRenameModal(true)}
                className="group flex items-center gap-1 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors"
              >
                <h1 className="text-lg font-semibold text-slate-800">{projectName}</h1>
                <svg className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>

              {hasChanges && (
                <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                  Não salvo
                </span>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={isExportingPdf}
              className="flex items-center gap-2 px-3 py-2 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Baixar PDF"
            >
              {isExportingPdf ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>PDF</span>
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="flex items-center gap-2 px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>Salvar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Flow Dependency Breadcrumb */}
      {flowDependencyInfo && (flowDependencyInfo.ancestors.length > 0 || flowDependencyInfo.children.length > 0) && (
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-2 overflow-x-auto">
          <span className="text-xs text-slate-500 flex-shrink-0">Hierarquia:</span>

          {/* Ancestors */}
          {flowDependencyInfo.ancestors.map((ancestor, index) => (
            <span key={ancestor.id} className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={() => navigate(`/editor/${ancestor.id}`)}
                className={`text-xs px-2 py-1 rounded ${getLevelColor(index).light} ${getLevelColor(index).text} hover:opacity-80 transition-opacity`}
              >
                {ancestor.name}
              </button>
              <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          ))}

          {/* Current */}
          <span className={`text-xs px-2 py-1 rounded font-semibold ${getLevelColor(flowDependencyInfo.level).bg} text-white flex-shrink-0`}>
            {projectName} (Atual)
          </span>

          {/* Children indicator */}
          {flowDependencyInfo.children.length > 0 && (
            <>
              <svg className="w-3 h-3 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-xs text-slate-500 flex-shrink-0">
                {flowDependencyInfo.children.length} fluxo{flowDependencyInfo.children.length !== 1 ? 's' : ''} dependente{flowDependencyInfo.children.length !== 1 ? 's' : ''}
              </span>
            </>
          )}
        </div>
      )}

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden" style={{ height: flowDependencyInfo && (flowDependencyInfo.ancestors.length > 0 || flowDependencyInfo.children.length > 0) ? 'calc(100vh - 104px)' : 'calc(100vh - 64px)' }}>
        {/* Flows Panel - Add flows as BPMN elements */}
        <div className={`bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${showFlowPanel ? 'w-64' : 'w-0'} overflow-hidden`}>
          {showFlowPanel && (
            <>
              <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-amber-50 to-orange-50">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-amber-500 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm">Fluxos</h3>
                </div>
                <button
                  onClick={() => setShowFlowPanel(false)}
                  className="p-1 hover:bg-white/50 rounded"
                >
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Instructions */}
                <div className="p-3 bg-blue-50 border-b border-blue-100">
                  <p className="text-[11px] text-blue-700">
                    <strong>Clique</strong> em um fluxo para adicioná-lo ao canvas como pré-requisito deste fluxo.
                  </p>
                </div>

                {/* Available Flows to Add */}
                <div className="p-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                    Adicionar Pré-requisito
                  </h4>
                  <div className="space-y-1">
                    {allProjects
                      .filter(p => p.id !== project?.id && p.companyId === project?.companyId)
                      .map((flow) => {
                        const isAlreadyParent = flow.id === project?.parentId;
                        return (
                          <button
                            key={flow.id}
                            onClick={() => !isAlreadyParent && handleAddFlowAsPrerequisite(flow)}
                            disabled={isAlreadyParent}
                            className={`w-full p-2 rounded-lg border-2 text-left transition-all group ${
                              isAlreadyParent
                                ? 'bg-amber-50 border-amber-300 cursor-default'
                                : 'bg-white border-slate-200 hover:border-amber-400 hover:bg-amber-50 hover:shadow-md cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {/* BPMN-style icon */}
                              <div className={`w-8 h-8 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                isAlreadyParent
                                  ? 'bg-amber-100 border-amber-400'
                                  : 'bg-slate-50 border-slate-300 group-hover:bg-amber-100 group-hover:border-amber-400'
                              }`}>
                                <div className={`w-5 h-5 rounded-sm border ${
                                  isAlreadyParent
                                    ? 'border-amber-500'
                                    : 'border-slate-400 group-hover:border-amber-500'
                                }`}>
                                  <div className={`w-full h-full rounded-sm border ${
                                    isAlreadyParent
                                      ? 'border-amber-400'
                                      : 'border-slate-300 group-hover:border-amber-400'
                                  }`}></div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-700 truncate">
                                  {flow.name}
                                </p>
                                {isAlreadyParent && (
                                  <p className="text-[10px] text-amber-600 font-medium">
                                    Pré-requisito atual
                                  </p>
                                )}
                              </div>
                              {!isAlreadyParent && (
                                <svg className="w-4 h-4 text-slate-300 group-hover:text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    {allProjects.filter(p => p.id !== project?.id && p.companyId === project?.companyId).length === 0 && (
                      <div className="p-3 bg-slate-50 rounded-lg text-center">
                        <p className="text-xs text-slate-500">Nenhum outro fluxo disponível</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-slate-200 my-2"></div>

                {/* Current Prerequisite Status */}
                <div className="p-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                    Status Atual
                  </h4>
                  {flowDependencyInfo?.parent ? (
                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-amber-700 uppercase">Pré-requisito:</span>
                        <button
                          onClick={handleRemovePrerequisite}
                          className="text-[10px] text-red-500 hover:text-red-700 hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                      <button
                        onClick={() => navigate(`/editor/${flowDependencyInfo.parent.id}`)}
                        className="w-full p-2 bg-white rounded border border-amber-300 hover:shadow-md transition-all text-left"
                      >
                        <p className="text-sm font-bold text-slate-800">{flowDependencyInfo.parent.name}</p>
                        <p className="text-[10px] text-slate-500">Clique para abrir</p>
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-bold text-green-700">Fluxo Raiz</span>
                      </div>
                      <p className="text-[10px] text-green-600 mt-1">
                        Este fluxo não tem pré-requisitos
                      </p>
                    </div>
                  )}
                </div>

                {/* Sub-flows that depend on this */}
                {flowDependencyInfo?.children.length > 0 && (
                  <div className="p-2 border-t border-slate-200">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
                      Fluxos que dependem deste ({flowDependencyInfo.children.length})
                    </h4>
                    <div className="space-y-1">
                      {flowDependencyInfo.children.map((child) => (
                        <button
                          key={child.id}
                          onClick={() => navigate(`/editor/${child.id}`)}
                          className="w-full p-2 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 text-left transition-all"
                        >
                          <p className="text-xs font-medium text-slate-700 truncate">{child.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* BPMN Canvas */}
        <div className="flex-1 relative h-full">
          <BpmnEditor
            ref={bpmnEditorRef}
            xml={currentXml}
            onXmlChange={handleXmlChange}
            onElementSelect={handleElementSelect}
            onFluxosClick={() => setShowFlowPanel(!showFlowPanel)}
            showGrid={showGrid}
            onGridToggle={() => setShowGrid(!showGrid)}
            onAddImage={() => setShowImageModal(true)}
          />
        </div>

        {/* Properties Panel - só aparece quando há elemento selecionado */}
        {selectedElement && (
          <PropertiesPanel
            element={selectedElement}
            onUpdate={handleElementUpdate}
            onColorChange={handleColorChange}
          />
        )}
      </div>

      {/* Save Toast */}
      {showSaveToast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-fade-in">
          <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Projeto salvo com sucesso!</span>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Renomear Projeto</h3>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nome do Projeto
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
                placeholder="Digite o nome do projeto..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleRename();
                  if (e.key === 'Escape') setShowRenameModal(false);
                }}
              />
            </div>

            <div className="p-6 bg-slate-50 flex gap-3 justify-end">
              <button
                onClick={() => setShowRenameModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleRename}
                disabled={!projectName.trim()}
                className="px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Subflow Modal */}
      {showNewSubflowModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-fyness-primary/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-fyness-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Criar Sub-Fluxo</h3>
                  <p className="text-sm text-slate-500">Dentro de: {projectName}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nome do Sub-Fluxo
              </label>
              <input
                type="text"
                value={newSubflowName}
                onChange={(e) => setNewSubflowName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
                placeholder="Ex: Validação de Documentos..."
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newSubflowName.trim()) handleCreateSubflow();
                  if (e.key === 'Escape') {
                    setShowNewSubflowModal(false);
                    setNewSubflowName('');
                  }
                }}
              />
              <p className="mt-2 text-xs text-slate-500">
                Este fluxo será criado como dependente do fluxo atual (Nível {(flowDependencyInfo?.level || 0) + 1})
              </p>
            </div>

            <div className="p-6 bg-slate-50 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNewSubflowModal(false);
                  setNewSubflowName('');
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateSubflow}
                disabled={!newSubflowName.trim()}
                className="px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Criar Sub-Fluxo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" strokeWidth={2}></rect>
                    <circle cx="8.5" cy="8.5" r="1.5" strokeWidth={2}></circle>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15l-5-5L5 21" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Adicionar Imagem</h3>
                  <p className="text-sm text-slate-500">Selecione uma imagem do computador</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Upload de arquivo */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Selecionar Imagem
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          setImageUrl(event.target.result);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center gap-3 w-full px-4 py-6 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-green-500 hover:bg-green-50 transition-colors"
                  >
                    {!imageUrl ? (
                      <>
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="text-center">
                          <p className="text-sm font-medium text-slate-700">Clique para selecionar</p>
                          <p className="text-xs text-slate-500">PNG, JPG, GIF até 10MB</p>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-2 text-green-600">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium">Imagem selecionada - clique para trocar</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Formato da imagem */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Formato
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setImageFormat('square')}
                    className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                      imageFormat === 'square'
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 bg-slate-300 rounded-none"></div>
                    <span className="text-xs font-medium text-slate-700">Quadrado</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageFormat('rounded')}
                    className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                      imageFormat === 'rounded'
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 bg-slate-300 rounded-lg"></div>
                    <span className="text-xs font-medium text-slate-700">Arredondado</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageFormat('circle')}
                    className={`p-3 border-2 rounded-lg flex flex-col items-center gap-2 transition-all ${
                      imageFormat === 'circle'
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="w-10 h-10 bg-slate-300 rounded-full"></div>
                    <span className="text-xs font-medium text-slate-700">Redondo</span>
                  </button>
                </div>
              </div>

              {/* Preview */}
              {imageUrl && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pré-visualização
                  </label>
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className={`w-24 h-24 object-cover ${
                        imageFormat === 'circle' ? 'rounded-full' :
                        imageFormat === 'rounded' ? 'rounded-xl' : 'rounded-none'
                      }`}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 text-center">
                    Arraste os cantos da imagem no canvas para redimensionar
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowImageModal(false);
                  setImageUrl('');
                  setImageFormat('square');
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (bpmnEditorRef.current && imageUrl) {
                    bpmnEditorRef.current.addImageOverlay(imageUrl, 300, 300, imageFormat);
                  }
                  setShowImageModal(false);
                  setImageUrl('');
                  setImageFormat('square');
                }}
                disabled={!imageUrl}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Adicionar Imagem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcut Hint */}
      <div className="fixed bottom-4 right-4 text-xs text-slate-400 z-20">
        <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-600">Ctrl</kbd>
        {' + '}
        <kbd className="px-1.5 py-0.5 bg-slate-200 rounded text-slate-600">S</kbd>
        {' para salvar'}
      </div>
    </div>
  );
}

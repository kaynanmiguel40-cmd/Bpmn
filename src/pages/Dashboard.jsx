import { useNavigate } from 'react-router-dom';
import { FYNESS_TEMPLATE_XML, EMPTY_DIAGRAM_XML } from '../utils/fynessTemplate';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  supabase,
  getCompanies,
  createCompany as createCompanyDB,
  updateCompany as updateCompanyDB,
  deleteCompany as deleteCompanyDB,
  getProjects,
  createProject as createProjectDB,
  updateProject as updateProjectDB,
  deleteProject as deleteProjectDB,
  dbToProject,
  dbToCompany
} from '../lib/supabase';

// Cores para empresas
const COMPANY_COLORS = [
  { bg: 'bg-indigo-500', light: 'bg-indigo-50', border: 'border-indigo-300', text: 'text-indigo-700', gradient: 'from-indigo-500 to-indigo-600' },
  { bg: 'bg-emerald-500', light: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-700', gradient: 'from-emerald-500 to-emerald-600' },
  { bg: 'bg-amber-500', light: 'bg-amber-50', border: 'border-amber-300', text: 'text-amber-700', gradient: 'from-amber-500 to-amber-600' },
  { bg: 'bg-rose-500', light: 'bg-rose-50', border: 'border-rose-300', text: 'text-rose-700', gradient: 'from-rose-500 to-rose-600' },
  { bg: 'bg-cyan-500', light: 'bg-cyan-50', border: 'border-cyan-300', text: 'text-cyan-700', gradient: 'from-cyan-500 to-cyan-600' },
  { bg: 'bg-violet-500', light: 'bg-violet-50', border: 'border-violet-300', text: 'text-violet-700', gradient: 'from-violet-500 to-violet-600' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showDependencyModal, setShowDependencyModal] = useState(null);
  const [selectedParent, setSelectedParent] = useState('');
  const [cardPositions, setCardPositions] = useState({});
  const gridRefs = useRef({});
  const cardRefs = useRef({});

  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [companyName, setCompanyName] = useState('');
  const [selectedCompanyForProject, setSelectedCompanyForProject] = useState(null);
  const [showDeleteCompanyModal, setShowDeleteCompanyModal] = useState(null);

  // Carregar dados do Supabase
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [companiesData, projectsData] = await Promise.all([
        getCompanies(),
        getProjects()
      ]);

      const mappedCompanies = companiesData.map(dbToCompany);
      const mappedProjects = projectsData.map(dbToProject);

      setCompanies(mappedCompanies);
      setProjects(mappedProjects);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados do banco de dados');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Calcular posições dos cards para desenhar as conexões
  const updateCardPositions = useCallback(() => {
    const positions = {};

    Object.keys(gridRefs.current).forEach(companyId => {
      const gridRef = gridRefs.current[companyId];
      if (!gridRef) return;

      const gridRect = gridRef.getBoundingClientRect();

      Object.keys(cardRefs.current).forEach(id => {
        const card = cardRefs.current[id];
        if (card) {
          const project = projects.find(p => p.id === id);
          if (project?.companyId === companyId) {
            const rect = card.getBoundingClientRect();
            positions[id] = {
              x: rect.left - gridRect.left + rect.width / 2,
              y: rect.top - gridRect.top + rect.height / 2,
              width: rect.width,
              height: rect.height,
              top: rect.top - gridRect.top,
              bottom: rect.top - gridRect.top + rect.height,
              left: rect.left - gridRect.left,
              right: rect.left - gridRect.left + rect.width,
              companyId
            };
          }
        }
      });
    });

    setCardPositions(positions);
  }, [projects]);

  useEffect(() => {
    const timer = setTimeout(updateCardPositions, 100);
    const resizeTimer = setTimeout(updateCardPositions, 400); // Aguarda animação da sidebar
    window.addEventListener('resize', updateCardPositions);

    // Observer para mudanças no layout
    const observer = new ResizeObserver(() => {
      updateCardPositions();
    });

    if (document.querySelector('aside')) {
      observer.observe(document.querySelector('aside'));
    }

    return () => {
      clearTimeout(timer);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', updateCardPositions);
      observer.disconnect();
    };
  }, [projects, companies, updateCardPositions]);

  // Calcular as conexões por empresa
  const getConnectionsForCompany = useCallback((companyId) => {
    const lines = [];
    const companyProjects = projects.filter(p => p.companyId === companyId);

    companyProjects.forEach(project => {
      if (project.parentId && cardPositions[project.id] && cardPositions[project.parentId]) {
        const parent = cardPositions[project.parentId];
        const child = cardPositions[project.id];

        if (parent.companyId !== companyId || child.companyId !== companyId) return;

        let startX, startY, endX, endY;

        if (child.top > parent.bottom - 10) {
          startX = parent.x;
          startY = parent.bottom;
          endX = child.x;
          endY = child.top;
        } else if (child.left > parent.right - 10) {
          startX = parent.right;
          startY = parent.y;
          endX = child.left;
          endY = child.y;
        } else if (child.right < parent.left + 10) {
          startX = parent.left;
          startY = parent.y;
          endX = child.right;
          endY = child.y;
        } else {
          startX = parent.x;
          startY = parent.top;
          endX = child.x;
          endY = child.bottom;
        }

        lines.push({
          id: `${project.parentId}-${project.id}`,
          parentId: project.parentId,
          childId: project.id,
          startX,
          startY,
          endX,
          endY,
          level: project.level || 1
        });
      }
    });
    return lines;
  }, [projects, cardPositions]);

  // Handlers de empresas
  const handleCreateCompany = async () => {
    const result = await createCompanyDB({
      name: companyName,
      colorIndex: companies.length % COMPANY_COLORS.length
    });
    if (result) {
      await loadData();
    }
    setShowCompanyModal(false);
    setCompanyName('');
  };

  const handleEditCompany = async () => {
    await updateCompanyDB(editingCompany.id, { name: companyName });
    await loadData();
    setEditingCompany(null);
    setCompanyName('');
  };

  const handleDeleteCompany = async (companyId) => {
    // Primeiro mover projetos para null ou deletar
    const companyProjects = projects.filter(p => p.companyId === companyId);
    for (const p of companyProjects) {
      await deleteProjectDB(p.id);
    }
    await deleteCompanyDB(companyId);
    await loadData();
    setShowDeleteCompanyModal(null);
  };

  // Obter fluxos que podem ser pais (dentro da mesma empresa)
  const getAvailableParents = (currentId, companyId) => {
    return projects.filter(p => p.id !== currentId && p.companyId === companyId);
  };

  const handleCreateBlank = (companyId) => {
    setSelectedCompanyForProject(companyId);
    setNewProjectName('Novo Diagrama');
    setShowNewProjectModal(true);
  };

  const handleConfirmCreate = async () => {
    const result = await createProjectDB({
      name: newProjectName,
      xml: EMPTY_DIAGRAM_XML,
      companyId: selectedCompanyForProject,
      level: 0,
      parentId: null,
      isRoot: true,
      isTemplate: false
    });

    if (result) {
      setShowNewProjectModal(false);
      setNewProjectName('');
      setSelectedCompanyForProject(null);
      navigate(`/editor/${result.id}`);
    }
  };

  const handleOpenProject = (id) => {
    navigate(`/editor/${id}`);
  };

  const handleDeleteProject = async (id) => {
    // Desvincular projetos filhos
    const childProjects = projects.filter(p => p.parentId === id);
    for (const child of childProjects) {
      await updateProjectDB(child.id, { parentId: null, level: 0 });
    }
    await deleteProjectDB(id);
    await loadData();
    setShowDeleteModal(null);
  };

  const handleSetDependency = async () => {
    if (showDependencyModal) {
      const parentProject = projects.find(p => p.id === selectedParent);
      const parentLevel = parentProject?.level ?? 0;

      await updateProjectDB(showDependencyModal, {
        parentId: selectedParent || null,
        level: selectedParent ? parentLevel + 1 : 0,
        isRoot: !selectedParent
      });
      await loadData();
    }
    setShowDependencyModal(null);
    setSelectedParent('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getParentName = (parentId) => {
    const parent = projects.find(p => p.id === parentId);
    return parent?.name || 'Desconhecido';
  };

  const getLevelColor = (level) => {
    const colors = [
      { gradient: 'from-green-500 to-emerald-600', border: 'border-green-400', bg: 'bg-green-500', light: 'bg-green-50' },
      { gradient: 'from-blue-500 to-indigo-600', border: 'border-blue-400', bg: 'bg-blue-500', light: 'bg-blue-50' },
      { gradient: 'from-purple-500 to-violet-600', border: 'border-purple-400', bg: 'bg-purple-500', light: 'bg-purple-50' },
      { gradient: 'from-orange-500 to-amber-600', border: 'border-orange-400', bg: 'bg-orange-500', light: 'bg-orange-50' },
      { gradient: 'from-pink-500 to-rose-600', border: 'border-pink-400', bg: 'bg-pink-500', light: 'bg-pink-50' },
    ];
    return colors[level % colors.length];
  };

  const getConnectionColor = (level) => {
    const colors = ['#22c55e', '#3b82f6', '#8b5cf6', '#f97316', '#ec4899'];
    return colors[(level - 1) % colors.length] || '#64748b';
  };

  // Organizar projetos por empresa
  const projectsByCompany = useMemo(() => {
    const grouped = {};
    companies.forEach(company => {
      grouped[company.id] = projects
        .filter(p => p.companyId === company.id)
        .sort((a, b) => {
          const levelA = a.level ?? 0;
          const levelB = b.level ?? 0;
          if (levelA !== levelB) return levelA - levelB;
          return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        });
    });
    return grouped;
  }, [projects, companies]);

  const currentProjectForDependency = projects.find(p => p.id === showDependencyModal);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-fyness-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-600">Carregando dados...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Erro de Conexão</h2>
          <p className="text-slate-500 mb-4">{error}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-fyness-primary to-fyness-secondary rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">BPMN Holding</h1>
                <p className="text-sm text-slate-500">Gestão de Processos Empresariais</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                Supabase
              </div>
              <button
                onClick={() => {
                  setEditingCompany(null);
                  setCompanyName('');
                  setShowCompanyModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nova Empresa
              </button>
              <span className="text-sm text-slate-500">
                {companies.length} empresa{companies.length !== 1 ? 's' : ''} • {projects.length} fluxo{projects.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {companies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
            </svg>
            <h2 className="text-lg font-semibold text-slate-700 mb-2">Nenhuma empresa cadastrada</h2>
            <p className="text-slate-500 mb-4">Crie sua primeira empresa para começar a gerenciar os processos.</p>
            <button
              onClick={() => {
                setEditingCompany(null);
                setCompanyName('');
                setShowCompanyModal(true);
              }}
              className="px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors"
            >
              Criar Primeira Empresa
            </button>
          </div>
        ) : (
          <>
            {/* Empresas */}
            {companies.map((company) => {
              const companyColor = COMPANY_COLORS[company.colorIndex % COMPANY_COLORS.length];
              const companyProjects = projectsByCompany[company.id] || [];
              const connections = getConnectionsForCompany(company.id);

              return (
                <div
                  key={company.id}
                  className={`bg-white rounded-2xl border-2 ${companyColor.border} shadow-sm overflow-hidden`}
                >
                  {/* Company Header */}
                  <div className={`bg-gradient-to-r ${companyColor.gradient} px-6 py-4`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white">{company.name}</h2>
                          <p className="text-white/70 text-sm">
                            {companyProjects.length} fluxo{companyProjects.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCreateBlank(company.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors text-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Novo Fluxo
                        </button>
                        <button
                          onClick={() => {
                            setEditingCompany(company);
                            setCompanyName(company.name);
                            setShowCompanyModal(true);
                          }}
                          className="p-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
                          title="Editar empresa"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setShowDeleteCompanyModal(company.id)}
                          className="p-1.5 bg-white/20 hover:bg-red-500/50 text-white rounded-lg transition-colors"
                          title="Excluir empresa"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Company Content */}
                  <div className="p-6">
                    {companyProjects.length === 0 ? (
                      <div className={`${companyColor.light} rounded-xl border-2 border-dashed ${companyColor.border} p-8 text-center`}>
                        <svg className={`w-12 h-12 ${companyColor.text} mx-auto mb-3 opacity-50`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                        </svg>
                        <p className={`${companyColor.text} font-medium mb-1`}>Nenhum fluxo ainda</p>
                        <p className="text-slate-500 text-sm mb-4">Crie o primeiro fluxo de processos desta empresa</p>
                        <button
                          onClick={() => handleCreateBlank(company.id)}
                          className={`px-4 py-2 bg-gradient-to-r ${companyColor.gradient} text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium`}
                        >
                          Criar Primeiro Fluxo
                        </button>
                      </div>
                    ) : (
                      <div ref={el => gridRefs.current[company.id] = el} className="relative">
                        {/* SVG Layer for Connections */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ overflow: 'visible' }}>
                          <defs>
                            {[0, 1, 2, 3, 4].map(level => (
                              <marker
                                key={`arrow-${company.id}-${level}`}
                                id={`arrowhead-${company.id}-${level}`}
                                markerWidth="10"
                                markerHeight="7"
                                refX="9"
                                refY="3.5"
                                orient="auto"
                              >
                                <polygon
                                  points="0 0, 10 3.5, 0 7"
                                  fill={getConnectionColor(level + 1)}
                                />
                              </marker>
                            ))}
                          </defs>

                          {connections.map(conn => {
                            const color = getConnectionColor(conn.level);
                            const isVertical = Math.abs(conn.endY - conn.startY) > Math.abs(conn.endX - conn.startX);
                            const midX = (conn.startX + conn.endX) / 2;
                            const midY = (conn.startY + conn.endY) / 2;

                            let pathD;
                            if (isVertical) {
                              pathD = `M ${conn.startX} ${conn.startY} C ${conn.startX} ${midY}, ${conn.endX} ${midY}, ${conn.endX} ${conn.endY}`;
                            } else {
                              pathD = `M ${conn.startX} ${conn.startY} C ${midX} ${conn.startY}, ${midX} ${conn.endY}, ${conn.endX} ${conn.endY}`;
                            }

                            return (
                              <g key={conn.id}>
                                <path
                                  d={pathD}
                                  fill="none"
                                  stroke={color}
                                  strokeWidth="4"
                                  strokeOpacity="0.2"
                                  strokeLinecap="round"
                                />
                                <path
                                  d={pathD}
                                  fill="none"
                                  stroke={color}
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  markerEnd={`url(#arrowhead-${company.id}-${(conn.level - 1) % 5})`}
                                />
                              </g>
                            );
                          })}
                        </svg>

                        {/* Cards Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 relative z-10">
                          {companyProjects.map((project) => {
                            const levelColor = getLevelColor(project.level || 0);
                            return (
                              <div
                                key={project.id}
                                ref={el => cardRefs.current[project.id] = el}
                                className={`bg-white rounded-lg border hover:shadow-md transition-all overflow-hidden group relative z-20 ${levelColor.border} hover:border-slate-400`}
                              >
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${levelColor.gradient}`} />

                                <div
                                  onClick={() => handleOpenProject(project.id)}
                                  className="h-14 bg-slate-50 border-b border-slate-200 flex items-center justify-center cursor-pointer relative overflow-hidden"
                                >
                                  <svg className="w-6 h-6 text-slate-300 group-hover:opacity-0 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                                  </svg>

                                  <div className={`absolute top-1 left-1 bg-gradient-to-r ${levelColor.gradient} text-white text-[8px] px-1.5 py-0.5 rounded-full font-medium z-20`}>
                                    {project.level === 0 || project.isRoot ? 'Raiz' : `N${project.level}`}
                                  </div>

                                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/90 transition-all flex items-center justify-center">
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-fyness-primary font-medium text-xs">
                                      Abrir
                                    </span>
                                  </div>
                                </div>

                                <div className="p-2">
                                  <h3 className="font-semibold text-slate-800 truncate text-xs">{project.name}</h3>
                                  <p className="text-[9px] text-slate-400 mb-1.5">{formatDate(project.updatedAt)}</p>

                                  {project.parentId && (
                                    <div className="mb-1.5 p-1 bg-slate-50 rounded flex items-center gap-1 text-[8px]">
                                      <div className={`w-1 h-1 rounded-full ${getLevelColor((project.level || 1) - 1).bg}`}></div>
                                      <span className="text-slate-500 truncate">
                                        ← {getParentName(project.parentId)}
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleOpenProject(project.id)}
                                      className="flex-1 px-1.5 py-0.5 bg-fyness-primary text-white text-[9px] rounded hover:bg-fyness-secondary transition-colors"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => {
                                        setShowDependencyModal(project.id);
                                        setSelectedParent(project.parentId || '');
                                      }}
                                      className="px-1.5 py-0.5 border border-slate-200 text-slate-500 rounded hover:bg-slate-50 transition-colors"
                                      title="Dependência"
                                    >
                                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" />
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => setShowDeleteModal(project.id)}
                                      className="px-1.5 py-0.5 border border-red-200 text-red-400 rounded hover:bg-red-50 transition-colors"
                                      title="Excluir"
                                    >
                                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div className="p-4 bg-white rounded-xl border border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Legenda - Relacionamento entre Fluxos</h3>
              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-green-500 to-emerald-600"></div>
                  <span className="text-slate-600">Nível 0 - Raiz</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-indigo-600"></div>
                  <span className="text-slate-600">Nível 1</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-violet-600"></div>
                  <span className="text-slate-600">Nível 2+</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-6 h-3" viewBox="0 0 24 12">
                    <path d="M0 6 L18 6" stroke="#3b82f6" strokeWidth="2" fill="none" />
                    <polygon points="16,3 22,6 16,9" fill="#3b82f6" />
                  </svg>
                  <span className="text-slate-600">Dependência</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Company Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingCompany ? 'Editar Empresa' : 'Nova Empresa'}
              </h3>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nome da Empresa
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
                placeholder="Ex: Empresa de Tecnologia"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && companyName.trim()) {
                    editingCompany ? handleEditCompany() : handleCreateCompany();
                  }
                  if (e.key === 'Escape') {
                    setShowCompanyModal(false);
                    setEditingCompany(null);
                  }
                }}
              />
            </div>

            <div className="p-6 bg-slate-50 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowCompanyModal(false);
                  setEditingCompany(null);
                  setCompanyName('');
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={editingCompany ? handleEditCompany : handleCreateCompany}
                disabled={!companyName.trim()}
                className="px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingCompany ? 'Salvar' : 'Criar Empresa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dependency Modal */}
      {showDependencyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Definir Dependência</h3>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Este fluxo depende de:
              </label>
              <select
                value={selectedParent}
                onChange={(e) => setSelectedParent(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
              >
                <option value="">Nenhum (Fluxo Raiz)</option>
                {getAvailableParents(showDependencyModal, currentProjectForDependency?.companyId).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.level !== undefined ? `(Nível ${p.level})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-6 bg-slate-50 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDependencyModal(null);
                  setSelectedParent('');
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSetDependency}
                className="px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800">Novo Fluxo</h3>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nome do Fluxo
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fyness-primary focus:border-transparent"
                placeholder="Ex: Processo de Vendas"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newProjectName.trim()) handleConfirmCreate();
                  if (e.key === 'Escape') setShowNewProjectModal(false);
                }}
              />
            </div>

            <div className="p-6 bg-slate-50 flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowNewProjectModal(false);
                  setSelectedCompanyForProject(null);
                }}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmCreate}
                disabled={!newProjectName.trim()}
                className="px-4 py-2 bg-fyness-primary text-white rounded-lg hover:bg-fyness-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Criar Fluxo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">
                Excluir Fluxo?
              </h3>
              <p className="text-sm text-slate-500 text-center">
                Esta ação não pode ser desfeita.
              </p>
            </div>

            <div className="p-6 bg-slate-50 flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteProject(showDeleteModal)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Company Modal */}
      {showDeleteCompanyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 overflow-hidden">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 text-center mb-2">
                Excluir Empresa?
              </h3>
              <p className="text-sm text-slate-500 text-center">
                Todos os fluxos desta empresa serão excluídos.
              </p>
            </div>

            <div className="p-6 bg-slate-50 flex gap-3 justify-center">
              <button
                onClick={() => setShowDeleteCompanyModal(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteCompany(showDeleteCompanyModal)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

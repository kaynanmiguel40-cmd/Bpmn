/**
 * BrazilMap - Mapa interativo do Brasil com dados reais do IBGE
 *
 * Features:
 * - GeoJSON real do IBGE (Malhas v3 + Localidades v1)
 * - Navegacao 3 niveis: Brasil (estados) → Estado (municipios) → Municipio (pins)
 * - Contorno neon com glow SVG filter
 * - Tooltip rico no hover
 * - Labels inteligentes
 * - Background dark (estilo mapa espacial)
 * - Cores por regiao ou por status de prospeccao
 * - Pins de comercios/parceiros no nivel municipio
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Loader2, ArrowLeft, RotateCw } from 'lucide-react';
import {
  BRAZIL_STATES,
  REGIONS,
  PROSPECT_STATUS,
  getStateProspection,
  getCityStatus,
} from '../../data/brazilStates';
import {
  fetchBrazilStates,
  fetchStateDetail,
  IBGE_TO_UF,
  UF_TO_IBGE,
} from '../../services/geoService';
import { computeBounds, createProjection, geoToPath, computeCenter, computeFeatureBounds, normalizeText } from './geoUtils';
import MunicipalityMapView from './MunicipalityMapView';

const COLOR_MODES = { REGION: 'region', STATUS: 'status' };
const SVG_W = 700;
const SVG_H = 750;

// Cores neon por regiao
const NEON = {
  norte:       { stroke: '#34d399', fill: '#064e3b' },
  nordeste:    { stroke: '#fbbf24', fill: '#78350f' },
  centroOeste: { stroke: '#38bdf8', fill: '#0c4a6e' },
  sudeste:     { stroke: '#a78bfa', fill: '#4c1d95' },
  sul:         { stroke: '#fb7185', fill: '#881337' },
};

// Status neon
const STATUS_NEON = {
  none:        { stroke: '#475569', fill: '#0f172a' },
  prospecting: { stroke: '#fbbf24', fill: '#78350f' },
  scheduled:   { stroke: '#60a5fa', fill: '#1e3a5f' },
  closed:      { stroke: '#34d399', fill: '#064e3b' },
};

// Pin neon por tipo de business
const PIN_NEON = {
  commerce: { fill: '#fbbf24', stroke: '#f59e0b', glow: '#fbbf2460' },
  partner:  { fill: '#34d399', stroke: '#10b981', glow: '#34d39960' },
  lead:     { fill: '#22d3ee', stroke: '#06b6d4', glow: '#22d3ee60' },
};

export default function BrazilMap({ selectedState, onSelectState, colorMode = COLOR_MODES.REGION, meetingPins = [] }) {
  // Dados geograficos
  const [statesGeo, setStatesGeo] = useState(null);
  const [municipalitiesGeo, setMunicipalitiesGeo] = useState(null);
  const [municipalityNames, setMunicipalityNames] = useState({});

  // Loading / error
  const [loading, setLoading] = useState(true);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [error, setError] = useState(null);

  // View state
  const [view, setView] = useState('country'); // 'country' | 'state' | 'municipality'
  const [activeStateUf, setActiveStateUf] = useState(null);
  const [activeMunicipality, setActiveMunicipality] = useState(null); // { code, name, feature }
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [hoveredPin, setHoveredPin] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const svgRef = useRef(null);
  const containerRef = useRef(null);

  // ── Fetch estados on mount ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchBrazilStates()
      .then(data => { if (!cancelled) { setStatesGeo(data); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  // ── Projecao pais ──
  const countryProjection = useMemo(() => {
    if (!statesGeo) return null;
    return createProjection(computeBounds(statesGeo), SVG_W, SVG_H, 8);
  }, [statesGeo]);

  // ── Projecao estado (municipios) ──
  const stateProjection = useMemo(() => {
    if (!municipalitiesGeo) return null;
    return createProjection(computeBounds(municipalitiesGeo), SVG_W, SVG_H, 12);
  }, [municipalitiesGeo]);

  // ── Features dos estados processados ──
  const stateFeatures = useMemo(() => {
    if (!statesGeo || !countryProjection) return [];
    return statesGeo.features.map(f => {
      const ibgeCode = f.properties.codarea;
      const uf = IBGE_TO_UF[ibgeCode] || ibgeCode;
      const stateData = BRAZIL_STATES.find(s => s.uf === uf);
      const center = computeCenter(f.geometry);
      const [cx, cy] = countryProjection(center[0], center[1]);
      const path = geoToPath(f.geometry, countryProjection);
      return { uf, ibgeCode, stateData, path, cx, cy };
    });
  }, [statesGeo, countryProjection]);

  // ── Features dos municipios processados ──
  const municipalityFeatures = useMemo(() => {
    if (!municipalitiesGeo || !stateProjection) return [];
    return municipalitiesGeo.features.map(f => {
      const code = f.properties.codarea;
      const name = municipalityNames[code] || f.properties.nome || code;
      const center = computeCenter(f.geometry);
      const [cx, cy] = stateProjection(center[0], center[1]);
      const path = geoToPath(f.geometry, stateProjection);
      return { code, name, path, cx, cy, feature: f };
    });
  }, [municipalitiesGeo, stateProjection, municipalityNames]);

  // ── Projecao municipio (zoom) ──
  const municipalityProjection = useMemo(() => {
    if (!activeMunicipality?.feature) return null;
    const bounds = computeFeatureBounds(activeMunicipality.feature);
    return createProjection(bounds, SVG_W, SVG_H, 40);
  }, [activeMunicipality]);

  // ── Path do municipio selecionado ──
  const municipalityView = useMemo(() => {
    if (!activeMunicipality?.feature || !municipalityProjection) return null;
    const path = geoToPath(activeMunicipality.feature.geometry, municipalityProjection);
    return { path };
  }, [activeMunicipality, municipalityProjection]);

  // ── Click em estado ──
  const handleStateClick = useCallback(async (uf) => {
    const ibgeCode = UF_TO_IBGE[uf];
    if (!ibgeCode) return;

    setActiveStateUf(uf);
    setLoadingMunicipalities(true);
    setHoveredFeature(null);

    try {
      const { geo, names } = await fetchStateDetail(ibgeCode);
      setMunicipalitiesGeo(geo);
      setMunicipalityNames(names);
      setView('state');
      onSelectState?.(uf);
    } catch (err) {
      console.error('Erro ao carregar municipios:', err);
      setLoadingMunicipalities(false);
      // Fallback: seleciona o estado sem zoom
      onSelectState?.(uf);
      return;
    }

    setLoadingMunicipalities(false);
  }, [onSelectState]);

  // ── Click em municipio (state view) ──
  const handleMunicipalityClick = useCallback((munFeature) => {
    setActiveMunicipality({
      code: munFeature.code,
      name: munFeature.name,
      feature: munFeature.feature,
    });
    setView('municipality');
    setHoveredFeature(null);
    setHoveredPin(null);
  }, []);

  // ── Voltar ──
  const handleBack = useCallback(() => {
    if (view === 'municipality') {
      setView('state');
      setActiveMunicipality(null);
      setHoveredFeature(null);
      setHoveredPin(null);
      return;
    }
    setView('country');
    setActiveStateUf(null);
    setMunicipalitiesGeo(null);
    setMunicipalityNames({});
    setActiveMunicipality(null);
    setHoveredFeature(null);
    setHoveredPin(null);
    onSelectState?.(null);
  }, [onSelectState, view]);

  // ── Mouse move tooltip ──
  const handleMouseMove = useCallback((e) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    setTooltipPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top - 10,
    });
  }, []);

  // ── Cor do estado ──
  const getStateColor = useCallback((uf) => {
    const stateData = BRAZIL_STATES.find(s => s.uf === uf);
    const region = stateData?.region || 'sudeste';

    if (colorMode === COLOR_MODES.STATUS) {
      const prospection = getStateProspection(uf);
      const status = prospection?.status || 'none';
      const n = STATUS_NEON[status] || STATUS_NEON.none;
      return { fill: n.fill, stroke: n.stroke };
    }

    const n = NEON[region] || NEON.sudeste;
    return { fill: n.fill, stroke: n.stroke };
  }, [colorMode]);

  // ── Cor do municipio ──
  // Base = cor da regiao do estado (todos os municipios ficam visiveis)
  // Municipios com prospeccao recebem cor de status (destaque)
  const getMunicipalityColor = useCallback((name) => {
    if (!activeStateUf) return { fill: '#1e293b', stroke: '#475569', status: null };

    const stateData = BRAZIL_STATES.find(s => s.uf === activeStateUf);
    if (!stateData) return { fill: '#1e293b', stroke: '#475569', status: null };

    // Cor base da regiao
    const regionNeon = NEON[stateData.region] || NEON.sudeste;

    // Verifica se tem prospeccao
    const normalizedName = normalizeText(name);
    const matchedCity = stateData.cities.find(c => normalizeText(c.name) === normalizedName);
    const cityStatus = matchedCity ? getCityStatus(activeStateUf, matchedCity.name) : null;

    if (cityStatus && cityStatus.status !== 'none') {
      const sn = STATUS_NEON[cityStatus.status];
      return { fill: sn.fill, stroke: sn.stroke, status: cityStatus.status };
    }

    // Sem prospeccao — usa cor da regiao (suave)
    return { fill: regionNeon.fill, stroke: regionNeon.stroke, status: null };
  }, [activeStateUf]);

  // ── Tooltip data ──
  const tooltipData = useMemo(() => {
    if (!hoveredFeature) return null;

    if (view === 'country') {
      const stateData = BRAZIL_STATES.find(s => s.uf === hoveredFeature);
      const prospection = getStateProspection(hoveredFeature);
      const region = REGIONS[stateData?.region];
      return {
        title: stateData?.name || hoveredFeature,
        subtitle: region?.name,
        status: prospection?.status !== 'none' ? PROSPECT_STATUS[prospection.status]?.label : null,
        statusColor: PROSPECT_STATUS[prospection?.status]?.textHex,
        detail: prospection?.prospectedCities > 0 ? `${prospection.prospectedCities} cidades prospectadas` : null,
        hint: 'Clique para ver municípios',
      };
    }

    if (view === 'state') {
      const stateData = BRAZIL_STATES.find(s => s.uf === activeStateUf);
      const normalizedName = normalizeText(hoveredFeature);
      const matchedCity = stateData?.cities.find(c => normalizeText(c.name) === normalizedName);
      const cityStatus = matchedCity ? getCityStatus(activeStateUf, matchedCity.name) : null;
      const status = cityStatus?.status || 'none';

      return {
        title: hoveredFeature,
        subtitle: stateData?.name,
        status: status !== 'none' ? PROSPECT_STATUS[status]?.label : null,
        statusColor: PROSPECT_STATUS[status]?.textHex,
        detail: matchedCity ? `${(matchedCity.pop / 1000).toFixed(0)} mil hab.` : null,
        hint: 'Clique para ver detalhes',
      };
    }

    return null;
  }, [hoveredFeature, view, activeStateUf]);

  // ── Retry on error ──
  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    fetchBrazilStates()
      .then(data => { setStatesGeo(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  // ── Loading state ──
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 rounded-xl">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-400">Carregando mapa do IBGE...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-950 rounded-xl">
        <div className="text-center">
          <p className="text-sm text-rose-400 mb-2">Erro ao carregar mapa</p>
          <p className="text-xs text-slate-500 mb-3">{error}</p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400 text-xs font-medium hover:bg-slate-700 transition-colors mx-auto"
          >
            <RotateCw className="w-3.5 h-3.5" />
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  const activeStateData = activeStateUf ? BRAZIL_STATES.find(s => s.uf === activeStateUf) : null;

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-950 rounded-xl overflow-hidden">

      {/* ── Top bar: back + breadcrumb ── */}
      {(view === 'state' || view === 'municipality') && (
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-cyan-500/30 text-cyan-400 text-xs font-medium hover:bg-slate-700/80 hover:border-cyan-400/50 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Voltar
          </button>
          <div className="px-4 py-1.5 rounded-full bg-slate-800/80 backdrop-blur-sm border border-cyan-500/20">
            <span className="text-sm font-bold text-cyan-300">
              {activeStateData?.name} ({activeStateUf})
              {view === 'municipality' && activeMunicipality && (
                <span className="text-slate-400"> › <span className="text-white">{activeMunicipality.name}</span></span>
              )}
            </span>
          </div>
          <div className="w-16" />
        </div>
      )}

      {/* ── Loading overlay municipios ── */}
      {loadingMunicipalities && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
            <p className="text-sm text-cyan-300 font-medium">Carregando municípios...</p>
            <p className="text-xs text-slate-500 mt-1">{activeStateData?.name}</p>
          </div>
        </div>
      )}

      {/* ── Google Maps (municipality view) ── */}
      {view === 'municipality' && activeMunicipality && (
        <div className="absolute inset-0 z-10">
          <MunicipalityMapView
            activeMunicipality={activeMunicipality}
            activeStateUf={activeStateUf}
          />
        </div>
      )}

      {/* ── SVG Map (country + state views) ── */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className={`w-full h-full ${view === 'municipality' ? 'invisible' : ''}`}
        onMouseMove={handleMouseMove}
      >
        <defs>
          {/* Neon glow filter — aplica blur no SourceGraphic (herda cor do stroke) */}
          <filter id="neon-glow" x="-15%" y="-15%" width="130%" height="130%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="neon-glow-strong" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Grid decorativo de fundo */}
          <pattern id="bg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(148,163,184,0.04)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Background */}
        <rect width={SVG_W} height={SVG_H} fill="url(#bg-grid)" />

        {/* ════════════ COUNTRY VIEW: estados ════════════ */}
        {view === 'country' && stateFeatures.map(({ uf, stateData, path, cx, cy }) => {
          const colors = getStateColor(uf);
          const isHovered = hoveredFeature === uf;
          const region = stateData?.region;
          const neonStroke = colors.stroke;
          const isSmall = ['DF', 'SE', 'AL', 'RN', 'PB'].includes(uf);

          return (
            <g
              key={uf}
              className="cursor-pointer"
              onClick={() => handleStateClick(uf)}
              onMouseEnter={() => setHoveredFeature(uf)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {/* Fill */}
              <path
                d={path}
                fill={colors.fill}
                fillOpacity={isHovered ? 0.95 : 0.7}
                stroke="transparent"
                strokeWidth="0"
              />
              {/* Neon border */}
              <path
                d={path}
                fill="none"
                stroke={neonStroke}
                strokeWidth={isHovered ? 2 : 1}
                strokeOpacity={isHovered ? 1 : 0.7}
                filter={isHovered ? 'url(#neon-glow-strong)' : 'url(#neon-glow)'}
                style={{ pointerEvents: 'none' }}
              />
              {/* Hover overlay */}
              {isHovered && (
                <path
                  d={path}
                  fill={neonStroke}
                  fillOpacity="0.12"
                  stroke="none"
                  style={{ pointerEvents: 'none' }}
                />
              )}
              {/* Label */}
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill={isHovered ? '#ffffff' : '#e2e8f0'}
                fontSize={isSmall ? 11 : 14}
                fontWeight="800"
                fontFamily="system-ui, sans-serif"
                letterSpacing="0.5"
                className="select-none pointer-events-none"
                style={{ textShadow: `0 0 8px ${neonStroke}, 0 0 16px ${neonStroke}60, 0 1px 2px rgba(0,0,0,0.8)` }}
              >
                {uf}
              </text>
            </g>
          );
        })}

        {/* ════════════ STATE VIEW: municipios ════════════ */}
        {view === 'state' && municipalityFeatures.map((mf) => {
          const { code, name, path, cx, cy } = mf;
          const colors = getMunicipalityColor(name);
          const isHovered = hoveredFeature === name;
          const hasStatus = !!colors.status; // tem prospeccao ativa

          return (
            <g
              key={code}
              className="cursor-pointer"
              onClick={() => handleMunicipalityClick(mf)}
              onMouseEnter={() => setHoveredFeature(name)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              {/* Fill — todos os municipios ficam visiveis com cor da regiao */}
              <path
                d={path}
                fill={colors.fill}
                fillOpacity={isHovered ? 1 : hasStatus ? 0.85 : 0.55}
                stroke="transparent"
                strokeWidth="0"
              />
              {/* Border — neon da regiao (todos visiveis) */}
              <path
                d={path}
                fill="none"
                stroke={colors.stroke}
                strokeWidth={isHovered ? 1.8 : hasStatus ? 1 : 0.5}
                strokeOpacity={isHovered ? 1 : hasStatus ? 0.9 : 0.45}
                filter={isHovered ? 'url(#neon-glow-strong)' : hasStatus ? 'url(#neon-glow)' : undefined}
                style={{ pointerEvents: 'none' }}
              />
              {/* Hover overlay */}
              {isHovered && (
                <path
                  d={path}
                  fill={colors.stroke}
                  fillOpacity="0.2"
                  stroke="none"
                  style={{ pointerEvents: 'none' }}
                />
              )}
              {/* Label — hover ou municipios com prospeccao */}
              {isHovered && (
                <text
                  x={cx}
                  y={cy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#ffffff"
                  fontSize="8"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                  className="select-none pointer-events-none"
                  style={{ textShadow: `0 0 6px ${colors.stroke}, 0 0 10px rgba(0,0,0,0.9)` }}
                >
                  {name.length > 18 ? name.slice(0, 17) + '…' : name}
                </text>
              )}
            </g>
          );
        })}

        {/* ════════════ MEETING PINS: Country view ════════════ */}
        {view === 'country' && meetingPins.length > 0 && (() => {
          const meetingsByState = {};
          meetingPins.forEach(pin => {
            if (pin.uf) meetingsByState[pin.uf] = (meetingsByState[pin.uf] || 0) + 1;
          });
          return stateFeatures
            .filter(sf => meetingsByState[sf.uf])
            .map(sf => (
              <g key={`mp-${sf.uf}`} style={{ pointerEvents: 'none' }}>
                <circle cx={sf.cx + 14} cy={sf.cy - 12} r={7} fill="#60a5fa" fillOpacity={0.35} stroke="#60a5fa" strokeWidth={1.2} filter="url(#neon-glow)" />
                <circle cx={sf.cx + 14} cy={sf.cy - 12} r={4.5} fill="#60a5fa" stroke="#fff" strokeWidth={0.8} />
                <text x={sf.cx + 14} y={sf.cy - 11.5} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={6} fontWeight="bold" className="select-none">
                  {meetingsByState[sf.uf]}
                </text>
              </g>
            ));
        })()}

        {/* ════════════ MEETING PINS: State view ════════════ */}
        {view === 'state' && meetingPins.length > 0 && meetingPins
          .filter(pin => pin.uf === activeStateUf && pin.city)
          .map(pin => {
            const norm = normalizeText(pin.city);
            const mf = municipalityFeatures.find(m => normalizeText(m.name) === norm);
            if (!mf) return null;
            const isHovered = hoveredPin === pin.dealId;
            return (
              <g
                key={`mp-${pin.dealId}`}
                onMouseEnter={() => { setHoveredPin(pin.dealId); setHoveredFeature(null); }}
                onMouseLeave={() => setHoveredPin(null)}
                className="cursor-pointer"
              >
                {/* Outer glow */}
                <circle cx={mf.cx} cy={mf.cy} r={isHovered ? 14 : 10} fill="#60a5fa" fillOpacity={0.2} stroke="#60a5fa" strokeWidth={1} filter="url(#neon-glow)" style={{ pointerEvents: 'none' }} />
                {/* Inner pin */}
                <circle cx={mf.cx} cy={mf.cy} r={isHovered ? 7 : 5} fill="#60a5fa" stroke="#fff" strokeWidth={1.5} />
                {/* Calendar icon indicator */}
                <text x={mf.cx} y={mf.cy + 0.5} textAnchor="middle" dominantBaseline="central" fill="#fff" fontSize={isHovered ? 8 : 6} fontWeight="bold" className="select-none" style={{ pointerEvents: 'none' }}>
                  ●
                </text>
              </g>
            );
          })
        }

        {/* Municipality view now uses Google Maps — rendered outside SVG */}
      </svg>

      {/* ── Meeting pin tooltip ── */}
      {hoveredPin && view === 'state' && (() => {
        const pin = meetingPins.find(p => p.dealId === hoveredPin);
        if (!pin) return null;
        const dateStr = pin.meetingDate ? new Date(pin.meetingDate).toLocaleDateString('pt-BR') : '';
        return (
          <div
            className="absolute z-50 pointer-events-none"
            style={{
              left: `${tooltipPos.x}px`,
              top: `${tooltipPos.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="bg-slate-800/95 backdrop-blur-sm rounded-lg border border-blue-500/30 shadow-lg shadow-blue-500/10 px-3 py-2 text-center min-w-[160px]">
              <p className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider">Reuniao Agendada</p>
              <p className="text-sm font-bold text-white mt-0.5">{pin.companyName}</p>
              <p className="text-[11px] text-slate-400">{pin.city}</p>
              {dateStr && <p className="text-[11px] text-blue-300 mt-0.5">{dateStr}</p>}
            </div>
            <div className="flex justify-center">
              <div className="w-2 h-2 bg-slate-800/95 border-r border-b border-blue-500/30 transform rotate-45 -mt-1" />
            </div>
          </div>
        );
      })()}

      {/* ── Tooltip (country + state views only) ── */}
      {tooltipData && !hoveredPin && view !== 'municipality' && (
        <div
          className="absolute z-50 pointer-events-none"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-slate-800/95 backdrop-blur-sm rounded-lg border border-cyan-500/20 shadow-lg shadow-cyan-500/10 px-3 py-2 text-center min-w-[150px]">
            <p className="text-sm font-bold text-white">{tooltipData.title}</p>
            {tooltipData.subtitle && (
              <p className="text-[11px] text-slate-400">{tooltipData.subtitle}</p>
            )}
            {tooltipData.status && (
              <p className="text-[11px] font-semibold mt-1" style={{ color: tooltipData.statusColor }}>
                {tooltipData.status}
              </p>
            )}
            {tooltipData.detail && (
              <p className="text-[10px] text-slate-500">{tooltipData.detail}</p>
            )}
            {tooltipData.hint && (
              <p className="text-[9px] text-cyan-500/70 mt-1 italic">{tooltipData.hint}</p>
            )}
          </div>
          <div className="flex justify-center">
            <div className="w-2 h-2 bg-slate-800/95 border-r border-b border-cyan-500/20 transform rotate-45 -mt-1" />
          </div>
        </div>
      )}

      {/* ── Legend (country + state views only — municipality has its own via Google Maps) ── */}
      {view !== 'municipality' && (
        <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-sm rounded-lg p-3 border border-slate-700/50">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {view === 'country'
              ? (colorMode === COLOR_MODES.REGION ? 'Regiões' : 'Status')
              : 'Status de Prospecção'
            }
          </p>
          {view === 'country' && colorMode === COLOR_MODES.REGION ? (
            <div className="space-y-1.5">
              {Object.entries(NEON).map(([key, neon]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{
                      backgroundColor: neon.fill,
                      border: `1px solid ${neon.stroke}`,
                      boxShadow: `0 0 4px ${neon.stroke}60`,
                    }}
                  />
                  <span className="text-[11px] text-slate-300">{REGIONS[key]?.name || key}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-1.5">
              {Object.entries(STATUS_NEON).map(([key, neon]) => (
                <div key={key} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: neon.fill,
                      border: `1px solid ${neon.stroke}`,
                      boxShadow: `0 0 4px ${neon.stroke}60`,
                    }}
                  />
                  <span className="text-[11px] text-slate-300">
                    {PROSPECT_STATUS[key]?.label || key}
                  </span>
                </div>
              ))}
              {/* Meeting pin legend */}
              {meetingPins.length > 0 && (
                <div className="flex items-center gap-2 mt-1 pt-1 border-t border-slate-700/50">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#60a5fa', border: '1px solid #93c5fd', boxShadow: '0 0 4px #60a5fa60' }} />
                  <span className="text-[11px] text-slate-300">Reuniao agendada</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Info (state view only) ── */}
      {view === 'state' && municipalityFeatures.length > 0 && (
        <div className="absolute bottom-3 right-3 bg-slate-900/90 backdrop-blur-sm rounded-lg px-3 py-2 border border-slate-700/50">
          <p className="text-[11px] text-slate-400">
            <span className="text-cyan-400 font-bold">{municipalityFeatures.length}</span> municípios
          </p>
        </div>
      )}
    </div>
  );
}

export { COLOR_MODES };

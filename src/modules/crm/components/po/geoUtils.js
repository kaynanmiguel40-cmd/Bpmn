/**
 * Geo Utilities — GeoJSON to SVG projection and path generation
 *
 * Converte coordenadas GeoJSON (longitude/latitude) para coordenadas SVG (x, y).
 * Sem dependencias externas — projecao Mercator simplificada.
 */

/** Calcula bounding box de um FeatureCollection GeoJSON */
export function computeBounds(geojson) {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

  function walk(coords) {
    if (typeof coords[0] === 'number') {
      if (coords[0] < minLng) minLng = coords[0];
      if (coords[1] < minLat) minLat = coords[1];
      if (coords[0] > maxLng) maxLng = coords[0];
      if (coords[1] > maxLat) maxLat = coords[1];
    } else {
      for (let i = 0; i < coords.length; i++) walk(coords[i]);
    }
  }

  for (const f of geojson.features) walk(f.geometry.coordinates);
  return [minLng, minLat, maxLng, maxLat];
}

/**
 * Cria funcao de projecao que mapeia [lng, lat] -> [x, y] SVG.
 * Usa projecao equirectangular com correcao de latitude (Mercator-like).
 */
export function createProjection(bounds, width, height, padding = 20) {
  const [minLng, minLat, maxLng, maxLat] = bounds;
  const geoW = maxLng - minLng;
  const geoH = maxLat - minLat;

  // Correcao para distorcao de latitude
  const midLat = (minLat + maxLat) / 2;
  const latCorrection = Math.cos((midLat * Math.PI) / 180);
  const correctedGeoW = geoW * latCorrection;

  const scaleX = (width - 2 * padding) / correctedGeoW;
  const scaleY = (height - 2 * padding) / geoH;
  const scale = Math.min(scaleX, scaleY);

  const projW = correctedGeoW * scale;
  const projH = geoH * scale;
  const offX = (width - projW) / 2;
  const offY = (height - projH) / 2;

  return (lng, lat) => [
    offX + (lng - minLng) * latCorrection * scale,
    offY + (maxLat - lat) * scale,
  ];
}

/** Converte GeoJSON geometry (Polygon/MultiPolygon) em string SVG path `d` */
export function geoToPath(geometry, project) {
  const parts = [];

  function processRing(ring) {
    let d = '';
    for (let i = 0; i < ring.length; i++) {
      const [x, y] = project(ring[i][0], ring[i][1]);
      d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    }
    return d + 'Z';
  }

  const { type, coordinates } = geometry;
  if (type === 'Polygon') {
    coordinates.forEach(ring => parts.push(processRing(ring)));
  } else if (type === 'MultiPolygon') {
    coordinates.forEach(poly => poly.forEach(ring => parts.push(processRing(ring))));
  }

  return parts.join('');
}

/**
 * Calcula centroide real de uma geometry usando formula de area de poligono.
 * Para MultiPolygon, usa o centroide do maior poligono (por area).
 */
export function computeCenter(geometry) {
  function ringCentroid(ring) {
    let area = 0, cx = 0, cy = 0;
    for (let i = 0, len = ring.length - 1; i < len; i++) {
      const x0 = ring[i][0], y0 = ring[i][1];
      const x1 = ring[i + 1][0], y1 = ring[i + 1][1];
      const cross = x0 * y1 - x1 * y0;
      area += cross;
      cx += (x0 + x1) * cross;
      cy += (y0 + y1) * cross;
    }
    area /= 2;
    if (Math.abs(area) < 1e-10) {
      // Poligono degenerado — fallback para media
      const sx = ring.reduce((s, p) => s + p[0], 0);
      const sy = ring.reduce((s, p) => s + p[1], 0);
      return { cx: sx / ring.length, cy: sy / ring.length, area: 0 };
    }
    const f = 1 / (6 * area);
    return { cx: cx * f, cy: cy * f, area: Math.abs(area) };
  }

  function polygonCentroid(rings) {
    return ringCentroid(rings[0]); // outer ring only
  }

  const { type, coordinates } = geometry;

  if (type === 'Polygon') {
    const c = polygonCentroid(coordinates);
    return [c.cx, c.cy];
  }

  if (type === 'MultiPolygon') {
    // Usa centroide do maior poligono
    let best = null;
    for (const poly of coordinates) {
      const c = polygonCentroid(poly);
      if (!best || c.area > best.area) best = c;
    }
    return best ? [best.cx, best.cy] : [0, 0];
  }

  return [0, 0];
}

/** Calcula bounding box de uma unica feature GeoJSON */
export function computeFeatureBounds(feature) {
  let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;

  function walk(coords) {
    if (typeof coords[0] === 'number') {
      if (coords[0] < minLng) minLng = coords[0];
      if (coords[1] < minLat) minLat = coords[1];
      if (coords[0] > maxLng) maxLng = coords[0];
      if (coords[1] > maxLat) maxLat = coords[1];
    } else {
      for (let i = 0; i < coords.length; i++) walk(coords[i]);
    }
  }

  walk(feature.geometry.coordinates);
  return [minLng, minLat, maxLng, maxLat];
}

/** Remove acentos para comparacao de nomes de cidades */
export function normalizeText(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/**
 * Modulo para adicionar "saltos" (arcos) quando linhas se cruzam no BPMN
 * Isso melhora a legibilidade do diagrama
 */

// Funcao para detectar interseccao entre dois segmentos de linha
function getLineIntersection(p1, p2, p3, p4) {
  const x1 = p1.x, y1 = p1.y;
  const x2 = p2.x, y2 = p2.y;
  const x3 = p3.x, y3 = p3.y;
  const x4 = p4.x, y4 = p4.y;

  const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (Math.abs(denom) < 0.0001) {
    return null; // Linhas paralelas
  }

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;

  if (t > 0.01 && t < 0.99 && u > 0.01 && u < 0.99) {
    return {
      x: x1 + t * (x2 - x1),
      y: y1 + t * (y2 - y1)
    };
  }

  return null;
}

// Encontrar todos os cruzamentos de uma conexao com outras conexoes
function findCrossings(connection, allConnections) {
  const crossings = [];
  const waypoints = connection.waypoints;

  if (!waypoints || waypoints.length < 2) return crossings;

  allConnections.forEach(otherConnection => {
    if (otherConnection === connection) return;
    if (!otherConnection.waypoints || otherConnection.waypoints.length < 2) return;

    // Comparar cada segmento da conexao atual com cada segmento das outras
    for (let i = 0; i < waypoints.length - 1; i++) {
      const p1 = waypoints[i];
      const p2 = waypoints[i + 1];

      for (let j = 0; j < otherConnection.waypoints.length - 1; j++) {
        const p3 = otherConnection.waypoints[j];
        const p4 = otherConnection.waypoints[j + 1];

        const intersection = getLineIntersection(p1, p2, p3, p4);

        if (intersection) {
          crossings.push({
            point: intersection,
            segmentIndex: i
          });
        }
      }
    }
  });

  // Ordenar cruzamentos por distancia do inicio do segmento
  crossings.sort((a, b) => {
    if (a.segmentIndex !== b.segmentIndex) {
      return a.segmentIndex - b.segmentIndex;
    }
    const startA = waypoints[a.segmentIndex];
    const startB = waypoints[b.segmentIndex];
    const distA = Math.hypot(a.point.x - startA.x, a.point.y - startA.y);
    const distB = Math.hypot(b.point.x - startB.x, b.point.y - startB.y);
    return distA - distB;
  });

  return crossings;
}

// Criar o path SVG com arcos nos cruzamentos
function createPathWithJumps(waypoints, crossings, jumpRadius = 8) {
  if (!waypoints || waypoints.length < 2) return '';
  if (!crossings || crossings.length === 0) {
    // Sem cruzamentos, retorna path normal
    let d = `M ${waypoints[0].x} ${waypoints[0].y}`;
    for (let i = 1; i < waypoints.length; i++) {
      d += ` L ${waypoints[i].x} ${waypoints[i].y}`;
    }
    return d;
  }

  let d = `M ${waypoints[0].x} ${waypoints[0].y}`;
  let currentCrossingIndex = 0;

  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i + 1];

    // Coletar cruzamentos neste segmento
    const segmentCrossings = [];
    while (currentCrossingIndex < crossings.length &&
           crossings[currentCrossingIndex].segmentIndex === i) {
      segmentCrossings.push(crossings[currentCrossingIndex].point);
      currentCrossingIndex++;
    }

    if (segmentCrossings.length === 0) {
      d += ` L ${end.x} ${end.y}`;
    } else {
      // Calcular direcao do segmento
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const len = Math.hypot(dx, dy);
      const nx = dx / len; // Vetor unitario
      const ny = dy / len;

      // Para cada cruzamento, desenhar linha ate o arco, depois o arco
      let lastPoint = start;

      segmentCrossings.forEach(crossing => {
        // Ponto antes do arco
        const beforeJump = {
          x: crossing.x - nx * jumpRadius,
          y: crossing.y - ny * jumpRadius
        };

        // Ponto depois do arco
        const afterJump = {
          x: crossing.x + nx * jumpRadius,
          y: crossing.y + ny * jumpRadius
        };

        // Linha ate o inicio do arco
        d += ` L ${beforeJump.x} ${beforeJump.y}`;

        // Arco (semicirculo passando por cima)
        // Usamos um arco SVG: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
        d += ` A ${jumpRadius} ${jumpRadius} 0 0 1 ${afterJump.x} ${afterJump.y}`;

        lastPoint = afterJump;
      });

      // Linha final ate o proximo waypoint
      d += ` L ${end.x} ${end.y}`;
    }
  }

  return d;
}

// Modulo customizado para bpmn-js
export function ConnectionCrossingsModule(eventBus, elementRegistry, canvas) {

  // Atualizar conexoes quando algo mudar
  const updateConnections = () => {
    const connections = elementRegistry.filter(el => el.waypoints);

    connections.forEach(connection => {
      const crossings = findCrossings(connection, connections);

      if (crossings.length > 0) {
        // Encontrar o elemento grafico da conexao
        const gfx = canvas.getGraphics(connection);
        if (gfx) {
          const pathElement = gfx.querySelector('path.djs-visual');
          if (pathElement) {
            const newPath = createPathWithJumps(connection.waypoints, crossings);
            pathElement.setAttribute('d', newPath);
          }
        }
      }
    });
  };

  // Escutar eventos relevantes
  eventBus.on('connection.changed', updateConnections);
  eventBus.on('connection.added', updateConnections);
  eventBus.on('shape.move.end', updateConnections);
  eventBus.on('commandStack.changed', updateConnections);
  eventBus.on('import.done', () => {
    setTimeout(updateConnections, 100);
  });
}

ConnectionCrossingsModule.$inject = ['eventBus', 'elementRegistry', 'canvas'];

// Exportar como modulo bpmn-js
export default {
  __init__: ['connectionCrossings'],
  connectionCrossings: ['type', ConnectionCrossingsModule]
};

import type { Node, Edge } from '@xyflow/react';

/**
 * Clean grid/tree auto-layout algorithm for nodes and edges
 */
export function autoLayoutNodes(nodes: Node[], edges: Edge[]): Node[] {
  if (nodes.length === 0) return [];

  // Find root nodes (nodes with in-degree == 0)
  const incomingCount: Record<string, number> = {};
  nodes.forEach(n => { incomingCount[n.id] = 0; });
  edges.forEach(e => {
    if (incomingCount[e.target] !== undefined) {
      incomingCount[e.target] = (incomingCount[e.target] || 0) + 1;
    }
  });

  // Level assignment via BFS
  const levels: Record<string, number> = {};
  const queue: { id: string; level: number }[] = [];

  // Enqueue all roots (or first node if cyclic)
  nodes.forEach(n => {
    if (incomingCount[n.id] === 0) {
      queue.push({ id: n.id, level: 0 });
      levels[n.id] = 0;
    }
  });

  if (queue.length === 0 && nodes.length > 0) {
    queue.push({ id: nodes[0].id, level: 0 });
    levels[nodes[0].id] = 0;
  }

  // BFS traversal
  while (queue.length > 0) {
    const { id, level } = queue.shift()!;
    const outgoing = edges.filter(e => e.source === id);
    outgoing.forEach(e => {
      if (levels[e.target] === undefined || levels[e.target] < level + 1) {
        levels[e.target] = level + 1;
        queue.push({ id: e.target, level: level + 1 });
      }
    });
  }

  // Assign any unvisited nodes to the next level
  let maxLevel = 0;
  Object.values(levels).forEach(l => { if (l > maxLevel) maxLevel = l; });
  nodes.forEach(n => {
    if (levels[n.id] === undefined) {
      maxLevel++;
      levels[n.id] = maxLevel;
    }
  });

  // Group nodes by level
  const levelGroups: Record<number, Node[]> = {};
  nodes.forEach(n => {
    const lvl = levels[n.id] || 0;
    if (!levelGroups[lvl]) levelGroups[lvl] = [];
    levelGroups[lvl].push(n);
  });

  // Calculate clean coordinates:
  // X = level * 340px, Y = centered around 200px
  const updatedNodes = nodes.map(node => {
    const lvl = levels[node.id] || 0;
    const group = levelGroups[lvl] || [node];
    const indexInGroup = group.findIndex(n => n.id === node.id);
    const totalInGroup = group.length;

    const x = 80 + lvl * 320;
    const startY = 180 - ((totalInGroup - 1) * 160) / 2;
    const y = Math.max(50, startY + indexInGroup * 180);

    return {
      ...node,
      position: { x, y },
    };
  });

  return updatedNodes;
}

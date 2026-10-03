import { useState, useRef, useCallback, useEffect } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  reconnectEdge,
  MarkerType,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import { toPng } from 'html-to-image';

import { PRESET_SYSTEMS } from './data/presets';
import type { ArchitectureNodeData, ArchitectureSystem } from './types/architecture';
import { parseVoiceCommand } from './utils/parser';
import { EDGE_COLOR } from './lib/categories';
import { loadHistory, saveHistory, type HistoryEntry } from './lib/history';

import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Inspector, type EdgePatch } from './components/Inspector';
import { ArchitectureCanvas } from './components/ArchitectureCanvas';
import { VoiceSession } from './components/VoiceSession';
import { Welcome } from './components/Welcome';
import type { FloMood } from './components/Flo';

const WELCOMED_KEY = 'voicearchitect.welcomed';

/** Give every edge an arrowhead that matches its stroke colour */
function decorateEdge(edge: Edge): Edge {
  const stroke = (edge.style?.stroke as string) || EDGE_COLOR;
  return {
    ...edge,
    type: edge.type ?? 'smoothstep',
    style: { strokeWidth: 2, ...edge.style, stroke },
    markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 16, height: 16 },
  };
}

/**
 * Pick connection sides from where the two steps sit: side-by-side steps
 * link right -> left, everything else bottom -> top. Edges the user drew by
 * hand keep the handles they chose.
 */
function routeEdges(nodes: Node[], edges: Edge[]): Edge[] {
  const pos = new Map(nodes.map((n) => [n.id, n.position]));
  return edges.map((e) => {
    if ((e.data as { manual?: boolean } | undefined)?.manual) return e;
    const a = pos.get(e.source);
    const b = pos.get(e.target);
    if (!a || !b) return e;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const sideways = dx > 120 && Math.abs(dx) > Math.abs(dy) * 0.8;
    return { ...e, sourceHandle: sideways ? 'right' : null, targetHandle: sideways ? 'left' : null };
  });
}

function toFlow(system: ArchitectureSystem, stagger: boolean) {
  const nodes = system.nodes.map((n, i) => ({
    ...n,
    data: { ...n.data, enterDelay: stagger ? i * 70 : 0 },
  })) as unknown as Node[];
  const edges = routeEdges(nodes, (system.edges as unknown as Edge[]).map(decorateEdge));
  return { nodes, edges };
}

function toMermaid(nodes: Node[], edges: Edge[]): string {
  const safe = (s: string) => s.replace(/"/g, "'");
  const ids = new Map(nodes.map((n, i) => [n.id, `N${i + 1}`]));
  const lines = ['flowchart TD'];
  nodes.forEach((n) => lines.push(`    ${ids.get(n.id)}["${safe(String((n.data as ArchitectureNodeData).label))}"]`));
  edges.forEach((e) => {
    const label = e.label ? `|"${safe(String(e.label))}"|` : '';
    if (ids.has(e.source) && ids.has(e.target)) lines.push(`    ${ids.get(e.source)} -->${label} ${ids.get(e.target)}`);
  });
  return lines.join('\n');
}

const isTyping = (el: Element | null) =>
  !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || (el as HTMLElement).isContentEditable);

export function App() {
  const initial = toFlow(PRESET_SYSTEMS[0], false);
  const [currentSystem, setCurrentSystem] = useState<ArchitectureSystem>(PRESET_SYSTEMS[0]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initial.edges);
  const [selectedNode, setSelectedNode] = useState<{ id: string; data: ArchitectureNodeData } | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [voiceOpen, setVoiceOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [floMood, setFloMood] = useState<FloMood>('idle');
  const [layoutKey, setLayoutKey] = useState(PRESET_SYSTEMS[0].id);
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null);
  const [showWelcome, setShowWelcome] = useState(() => {
    try {
      return localStorage.getItem(WELCOMED_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const canvasRef = useRef<HTMLDivElement | null>(null);

  const notify = useCallback((text: string) => setToast({ id: Date.now(), text }), []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  // Cmd/Ctrl+K opens voice session
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) && !isTyping(document.activeElement)) {
        e.preventDefault();
        setVoiceOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  const loadSystem = useCallback(
    (system: ArchitectureSystem, stagger = true) => {
      const flow = toFlow(system, stagger);
      setCurrentSystem(system);
      setNodes(flow.nodes);
      setEdges(flow.edges);
      setLayoutKey(`${system.id}-${Date.now()}`);
      clearSelection();
      setSidebarOpen(false);
    },
    [setNodes, setEdges, clearSelection],
  );

  const celebrate = useCallback(() => {
    setFloMood('happy');
    window.setTimeout(() => setFloMood('idle'), 2200);
  }, []);

  const handleReset = useCallback(() => {
    setNodes([]);
    setEdges([]);
    clearSelection();
    setCurrentSystem((s) => ({ ...s, id: `blank-${Date.now()}`, name: 'Untitled flow', nodes: [], edges: [] }));
    notify('Canvas cleared');
  }, [setNodes, setEdges, clearSelection, notify]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(decorateEdge({ ...params, id: `e-${Date.now()}`, data: { manual: true } } as Edge), eds)),
    [setEdges],
  );

  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => setEdges((els) => reconnectEdge(oldEdge, newConnection, els)),
    [setEdges],
  );

  const onNodeDragStop = useCallback(() => {
    setEdges((eds) => routeEdges(nodes, eds));
  }, [nodes, setEdges]);

  const handleNodeClick = useCallback((node: { id: string; data: ArchitectureNodeData }) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setSidebarOpen(true);
  }, []);

  const handleEdgeClick = useCallback((edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setSidebarOpen(true);
  }, []);

  const runCommand = useCallback(
    (text: string, source: 'voice' | 'text' = 'text') => {
      // Parse against what's on the canvas right now, including manual edits
      const live: ArchitectureSystem = {
        ...currentSystem,
        nodes: nodes.map((n) => ({ id: n.id, type: n.type ?? 'custom', position: n.position, data: n.data as ArchitectureNodeData })),
        edges: edges.map((e) => ({ id: e.id, source: e.source, target: e.target, label: e.label as string | undefined, animated: e.animated, style: e.style as { stroke?: string } })),
      };
      const result = parseVoiceCommand(text, live);

      if (result.action === 'node_added') {
        const added = result.updatedSystem.nodes[result.updatedSystem.nodes.length - 1];
        const newEdges = result.updatedSystem.edges.slice(live.edges.length) as unknown as Edge[];
        setCurrentSystem(result.updatedSystem);
        const nextNodes = [...nodes, added as unknown as Node];
        setNodes(nextNodes);
        setEdges((eds) => routeEdges(nextNodes, [...eds, ...newEdges.map(decorateEdge)]));
        setLayoutKey(`${result.updatedSystem.id}-${Date.now()}`);
      } else {
        loadSystem(result.updatedSystem);
        setHistory((h) =>
          saveHistory([{ id: result.updatedSystem.id, prompt: text, source, createdAt: Date.now(), system: result.updatedSystem }, ...h]),
        );
      }
      celebrate();
      notify(result.message);
    },
    [currentSystem, nodes, edges, loadSystem, setNodes, setEdges, celebrate, notify],
  );

  const handleUpdateNodeData = useCallback(
    (nodeId: string, patch: Partial<ArchitectureNodeData>) => {
      setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...patch } } : n)));
      setSelectedNode((prev) => (prev?.id === nodeId ? { ...prev, data: { ...prev.data, ...patch } } : prev));
    },
    [setNodes],
  );

  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((n) => n.id !== nodeId));
      setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
      clearSelection();
      notify('Step removed');
    },
    [setNodes, setEdges, clearSelection, notify],
  );

  const handleUpdateEdgeData = useCallback(
    (edgeId: string, patch: EdgePatch) => {
      const apply = (edge: Edge): Edge => {
        const next = { ...edge };
        if (patch.label !== undefined) next.label = patch.label;
        if (patch.animated !== undefined) next.animated = patch.animated;
        if (patch.type !== undefined) next.type = patch.type;
        if (patch.stroke !== undefined) next.style = { ...next.style, stroke: patch.stroke };
        return decorateEdge(next);
      };
      setEdges((eds) => eds.map((e) => (e.id === edgeId ? apply(e) : e)));
      setSelectedEdge((prev) => (prev?.id === edgeId ? apply(prev) : prev));
    },
    [setEdges],
  );

  const handleDeleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((e) => e.id !== edgeId));
      clearSelection();
      notify('Connection removed');
    },
    [setEdges, clearSelection, notify],
  );

  const handleExportPng = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await toPng(canvasRef.current, {
        backgroundColor: '#09080f',
        pixelRatio: 2,
        filter: (el) => !(el instanceof HTMLElement && el.classList.contains('export-exclude')),
      });
      const link = document.createElement('a');
      link.download = `flowchart-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      notify('PNG downloaded');
    } catch (err) {
      console.error('Failed to export canvas image:', err);
      notify('Export failed — try again');
    }
  }, [notify]);

  const handleCopyMermaid = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(toMermaid(nodes, edges));
      notify('Mermaid copied to clipboard');
    } catch {
      notify('Clipboard is not available here');
    }
  }, [nodes, edges, notify]);

  const getNodeLabel = useCallback(
    (id: string) => String((nodes.find((n) => n.id === id)?.data as ArchitectureNodeData | undefined)?.label ?? id),
    [nodes],
  );

  const openVoice = useCallback(() => {
    setSidebarOpen(false);
    setVoiceOpen(true);
  }, []);

  const hasSelection = !!(selectedNode || selectedEdge);

  return (
    <div className="ambient flex h-screen w-screen flex-col overflow-hidden text-ink-100">
      <Header
        flowName={currentSystem.name}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        onReset={handleReset}
        onExportPng={handleExportPng}
        onCopyMermaid={handleCopyMermaid}
      />

      <div className="relative flex flex-1 overflow-hidden">
        <aside
          className={`absolute inset-y-0 left-0 z-30 w-[320px] max-w-[88vw] shrink-0 border-r border-white/[0.06] bg-ink-950 transition-transform duration-300 md:static md:max-w-none md:translate-x-0 md:border-0 md:bg-transparent ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {hasSelection ? (
            <Inspector
              key={selectedNode?.id ?? selectedEdge?.id}
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              getNodeLabel={getNodeLabel}
              onClose={clearSelection}
              onUpdateNodeData={handleUpdateNodeData}
              onUpdateEdgeData={handleUpdateEdgeData}
              onDeleteNode={handleDeleteNode}
              onDeleteEdge={handleDeleteEdge}
            />
          ) : (
            <Sidebar
              history={history}
              activeId={currentSystem.id}
              onRunPrompt={(p) => runCommand(p, 'text')}
              onLoadSystem={loadSystem}
              onClearHistory={() => setHistory(saveHistory([]))}
            />
          )}
        </aside>

        {sidebarOpen && <div className="absolute inset-0 z-20 bg-black/50 md:hidden animate-fade" onClick={() => setSidebarOpen(false)} />}

        <main className="flex flex-1 overflow-hidden md:pb-3 md:pr-3">
          <div className="flex flex-1 overflow-hidden border-white/[0.07] bg-ink-950/70 md:rounded-3xl md:border">
            <ArchitectureCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onReconnect={onReconnect}
              onNodeDragStop={onNodeDragStop}
              onNodeClick={handleNodeClick}
              onEdgeClick={handleEdgeClick}
              onPaneClick={clearSelection}
              onTalk={openVoice}
              floMood={voiceOpen ? 'listening' : floMood}
              layoutKey={layoutKey}
              canvasRef={canvasRef}
            />
          </div>
        </main>
      </div>

      {voiceOpen && (
        <VoiceSession
          onClose={() => setVoiceOpen(false)}
          onSubmit={(text, source) => {
            setVoiceOpen(false);
            runCommand(text, source);
          }}
        />
      )}

      {showWelcome && (
        <Welcome
          onStart={() => {
            try {
              localStorage.setItem(WELCOMED_KEY, '1');
            } catch {
              // ignore
            }
            setShowWelcome(false);
          }}
        />
      )}

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[70] flex justify-center px-4">
          <div
            key={toast.id}
            role="status"
            className="rounded-full border border-white/10 bg-ink-850/95 px-4 py-2 text-xs font-medium text-ink-100 shadow-2xl backdrop-blur animate-rise"
          >
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  useNodesState, 
  useEdgesState, 
  addEdge, 
  reconnectEdge,
  type Connection, 
  type Edge, 
  type Node 
} from '@xyflow/react';
import { toPng } from 'html-to-image';
import confetti from 'canvas-confetti';

import { PRESET_SYSTEMS } from './data/presets';
import type { ArchitectureNodeData, ArchitectureSystem } from './types/architecture';
import { parseVoiceCommand } from './utils/parser';
import { autoLayoutNodes } from './utils/layout';

import { Header } from './components/Header';
import { VoicePromptBar } from './components/VoicePromptBar';
import { DocPanel } from './components/DocPanel';
import { ArchitectureCanvas } from './components/ArchitectureCanvas';
import { SimulationConsole } from './components/SimulationConsole';

export function App() {
  const [currentSystem, setCurrentSystem] = useState<ArchitectureSystem>(PRESET_SYSTEMS[0]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(PRESET_SYSTEMS[0].nodes as unknown as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(PRESET_SYSTEMS[0].edges as unknown as Edge[]);
  const [selectedNode, setSelectedNode] = useState<{ id: string; data: ArchitectureNodeData } | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Ready for Wispr Flow dictation');

  // History stack for Undo feature
  const [historyStack, setHistoryStack] = useState<{ nodes: Node[]; edges: Edge[]; system: ArchitectureSystem }[]>([]);

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStepIndex, setSimStepIndex] = useState(0);
  const simTimerRef = useRef<number | null>(null);

  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Push state to undo stack before modifications
  const pushUndo = useCallback(() => {
    setHistoryStack((prev) => [
      ...prev.slice(-10), // keep last 10
      { nodes: [...nodes], edges: [...edges], system: { ...currentSystem } },
    ]);
  }, [nodes, edges, currentSystem]);

  // Undo action
  const handleUndo = useCallback(() => {
    if (historyStack.length === 0) {
      setStatusMessage('Nothing to undo');
      return;
    }
    const previous = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    setNodes(previous.nodes);
    setEdges(previous.edges);
    setCurrentSystem(previous.system);
    setSelectedNode(null);
    setSelectedEdge(null);
    setStatusMessage('Undone last action');
  }, [historyStack, setNodes, setEdges]);

  // Clear canvas / start fresh
  const handleReset = useCallback(() => {
    pushUndo();
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSelectedEdge(null);
    setStatusMessage('Canvas cleared. Speak your workflow!');
  }, [pushUndo, setNodes, setEdges]);

  // Auto Layout / Beautify Canvas
  const handleAutoLayout = useCallback(() => {
    if (nodes.length === 0) return;
    pushUndo();
    const neatlyArranged = autoLayoutNodes(nodes, edges);
    setNodes(neatlyArranged);
    setStatusMessage('Auto-aligned canvas neatly!');
    confetti({ particleCount: 25, spread: 45, origin: { y: 0.1 } });
  }, [nodes, edges, pushUndo, setNodes]);

  // Start live flow simulation
  const handleStartSimulation = useCallback(() => {
    if (nodes.length === 0) {
      setStatusMessage('Add some steps first to simulate the flow!');
      return;
    }

    setIsSimulating(true);
    setSimStepIndex(0);
    setStatusMessage('Flow simulation running...');

    let currentIndex = 0;
    const totalNodes = nodes.length;

    // Reset node highlight states
    setNodes((nds) =>
      nds.map((n, i) => ({
        ...n,
        data: {
          ...n.data,
          status: i === 0 ? 'simulating' : 'idle',
          isHighlighted: i === 0,
        },
      }))
    );

    if (simTimerRef.current) clearInterval(simTimerRef.current);

    simTimerRef.current = window.setInterval(() => {
      currentIndex++;
      if (currentIndex >= totalNodes) {
        // Simulation finished
        if (simTimerRef.current) clearInterval(simTimerRef.current);
        simTimerRef.current = null;
        setIsSimulating(false);

        // Mark all as successful
        setNodes((nds) =>
          nds.map((n) => ({
            ...n,
            data: {
              ...n.data,
              status: 'success',
              isHighlighted: false,
            },
          }))
        );

        setStatusMessage('Simulation completed successfully! All steps 200 OK.');
        confetti({ particleCount: 70, spread: 80, origin: { y: 0.4 } });
        return;
      }

      setSimStepIndex(currentIndex);

      // Highlight active node
      setNodes((nds) =>
        nds.map((n, idx) => ({
          ...n,
          data: {
            ...n.data,
            status: idx === currentIndex ? 'simulating' : idx < currentIndex ? 'success' : 'idle',
            isHighlighted: idx === currentIndex,
          },
        }))
      );
    }, 1100);
  }, [nodes, setNodes]);

  // Stop simulation
  const handleStopSimulation = useCallback(() => {
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    setIsSimulating(false);
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          status: 'idle',
          isHighlighted: false,
        },
      }))
    );
    setStatusMessage('Simulation stopped');
  }, [setNodes]);

  useEffect(() => {
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, []);

  // Connect edges manually if dragged
  const onConnect = useCallback(
    (params: Connection) => {
      pushUndo();
      setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } }, eds));
    },
    [pushUndo, setEdges]
  );

  // Reconnect / rewire edge endpoint
  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      pushUndo();
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
      setStatusMessage('Connection rewired!');
    },
    [pushUndo, setEdges]
  );

  // Handle clicking a node
  const handleNodeClick = useCallback((node: { id: string; data: ArchitectureNodeData }) => {
    setSelectedNode(node);
    setSelectedEdge(null);
  }, []);

  // Handle clicking an edge
  const handleEdgeClick = useCallback((edge: Edge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
  }, []);

  // Execute voice commands parsed from speech or chips
  const handleExecuteCommand = useCallback((commandText: string) => {
    setStatusMessage('Wispr Voice processing...');
    
    const result = parseVoiceCommand(commandText, currentSystem);

    if (result.action === 'simulate') {
      handleStartSimulation();
      return;
    }

    if (result.action === 'undo') {
      handleUndo();
      return;
    }

    if (result.action === 'clear') {
      handleReset();
      return;
    }

    if (result.action === 'auto_layout') {
      handleAutoLayout();
      return;
    }

    if (result.action === 'delete_node' && result.targetId) {
      pushUndo();
      setNodes((nds) => nds.filter((n) => n.id !== result.targetId));
      setEdges((eds) => eds.filter((e) => e.source !== result.targetId && e.target !== result.targetId));
      setStatusMessage(result.message);
      return;
    }

    if (result.action === 'change_color' && result.targetColor) {
      pushUndo();
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          style: { ...e.style, stroke: result.targetColor },
        }))
      );
      setStatusMessage(result.message);
      return;
    }

    if (result.updatedSystem) {
      pushUndo();
      setCurrentSystem(result.updatedSystem);
      setNodes(result.updatedSystem.nodes as unknown as Node[]);
      setEdges(result.updatedSystem.edges as unknown as Edge[]);
      setSelectedNode(null);
      setSelectedEdge(null);
      setStatusMessage(result.message);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.2 } });
    } else {
      setStatusMessage(result.message);
    }
  }, [currentSystem, handleAutoLayout, handleReset, handleStartSimulation, handleUndo, pushUndo, setEdges, setNodes]);

  // Update node data from inspector panel
  const handleUpdateNodeData = useCallback((nodeId: string, updatedData: Partial<ArchitectureNodeData>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          const newData = { ...node.data, ...updatedData } as unknown as ArchitectureNodeData;
          return { ...node, data: newData };
        }
        return node;
      })
    );

    setSelectedNode((prev) => {
      if (prev && prev.id === nodeId) {
        return { ...prev, data: { ...prev.data, ...updatedData } };
      }
      return prev;
    });
  }, [setNodes]);

  // Delete a node
  const handleDeleteNode = useCallback((nodeId: string) => {
    pushUndo();
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    setStatusMessage('Step removed');
  }, [pushUndo, setEdges, setNodes]);

  // Update edge / linkage data
  const handleUpdateEdgeData = useCallback((edgeId: string, updatedData: { label?: string; animated?: boolean; stroke?: string; type?: string }) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          const updated = { ...edge };
          if (updatedData.label !== undefined) updated.label = updatedData.label;
          if (updatedData.animated !== undefined) updated.animated = updatedData.animated;
          if (updatedData.type !== undefined) updated.type = updatedData.type;
          if (updatedData.stroke !== undefined) {
            updated.style = { ...updated.style, stroke: updatedData.stroke };
          }
          return updated;
        }
        return edge;
      })
    );

    setSelectedEdge((prev) => {
      if (prev && prev.id === edgeId) {
        const updated = { ...prev };
        if (updatedData.label !== undefined) updated.label = updatedData.label;
        if (updatedData.animated !== undefined) updated.animated = updatedData.animated;
        if (updatedData.type !== undefined) updated.type = updatedData.type;
        if (updatedData.stroke !== undefined) {
          updated.style = { ...updated.style, stroke: updatedData.stroke };
        }
        return updated;
      }
      return prev;
    });
  }, [setEdges]);

  // Delete an edge
  const handleDeleteEdge = useCallback((edgeId: string) => {
    pushUndo();
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    setSelectedEdge(null);
    setStatusMessage('Connection removed');
  }, [pushUndo, setEdges]);

  // Export Canvas as PNG
  const handleExportPng = useCallback(async () => {
    if (!canvasRef.current) return;
    try {
      const dataUrl = await toPng(canvasRef.current, {
        backgroundColor: '#060810',
        quality: 0.95,
      });
      const link = document.createElement('a');
      link.download = `flowchart-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.2 } });
    } catch (err) {
      console.error('Failed to export canvas image:', err);
    }
  }, []);

  const activeNode = nodes[simStepIndex];
  const activeLabel = (activeNode?.data as unknown as ArchitectureNodeData)?.label || 'Step';

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Header
        currentSystem={currentSystem}
        onReset={handleReset}
        onExportPng={handleExportPng}
        onSimulate={isSimulating ? handleStopSimulation : handleStartSimulation}
        isSimulating={isSimulating}
        onAutoLayout={handleAutoLayout}
      />

      {/* Voice Prompt Bar */}
      <VoicePromptBar
        onExecuteCommand={handleExecuteCommand}
        statusMessage={statusMessage}
      />

      {/* Main Workspace (Split View) */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Side: Single Focused Section (Step & Linkage Editor) */}
        <DocPanel
          selectedNode={selectedNode}
          selectedEdge={selectedEdge}
          onUpdateNodeData={handleUpdateNodeData}
          onUpdateEdgeData={handleUpdateEdgeData}
          onDeleteEdge={handleDeleteEdge}
          onDeleteNode={handleDeleteNode}
        />

        {/* Right Side: Interactive Flowchart Canvas */}
        <ArchitectureCanvas
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onReconnect={onReconnect}
          onNodeClick={handleNodeClick}
          onEdgeClick={handleEdgeClick}
          canvasRef={canvasRef}
        />

        {/* Floating Simulation Console when active */}
        {isSimulating && (
          <SimulationConsole
            activeStepLabel={activeLabel}
            stepIndex={simStepIndex}
            totalSteps={nodes.length}
            statusText="Processing and routing data to downstream step..."
            onStop={handleStopSimulation}
          />
        )}
      </div>
    </div>
  );
}

export default App;

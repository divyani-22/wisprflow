import { useState, useRef, useCallback } from 'react';
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

import { Header } from './components/Header';
import { VoicePromptBar } from './components/VoicePromptBar';
import { DocPanel } from './components/DocPanel';
import { ArchitectureCanvas } from './components/ArchitectureCanvas';

export function App() {
  const [currentSystem, setCurrentSystem] = useState<ArchitectureSystem>(PRESET_SYSTEMS[0]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>(PRESET_SYSTEMS[0].nodes as unknown as Node[]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(PRESET_SYSTEMS[0].edges as unknown as Edge[]);
  const [selectedNode, setSelectedNode] = useState<{ id: string; data: ArchitectureNodeData } | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('Ready for Wispr Flow dictation');

  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Clear canvas / start fresh
  const handleReset = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setSelectedEdge(null);
    setStatusMessage('Canvas cleared. Speak your workflow!');
  }, [setNodes, setEdges]);

  // Connect edges manually if dragged
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } }, eds)),
    [setEdges]
  );

  // Reconnect / rewire edge endpoint
  const onReconnect = useCallback(
    (oldEdge: Edge, newConnection: Connection) => {
      setEdges((els) => reconnectEdge(oldEdge, newConnection, els));
      setStatusMessage('Connection rewired!');
    },
    [setEdges]
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
    
    // Call parser
    const result = parseVoiceCommand(commandText, currentSystem);

    if (result.updatedSystem) {
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
  }, [currentSystem, setNodes, setEdges]);

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
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    setStatusMessage('Step removed');
  }, [setNodes, setEdges]);

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
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
    setSelectedEdge(null);
    setStatusMessage('Connection removed');
  }, [setEdges]);

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

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Header
        currentSystem={currentSystem}
        onReset={handleReset}
        onExportPng={handleExportPng}
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
      </div>
    </div>
  );
}

export default App;

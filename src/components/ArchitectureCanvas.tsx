import React, { useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  MarkerType,
  ConnectionMode,
  useReactFlow,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
} from '@xyflow/react';
import { CustomNode } from './CustomNode';
import { Flo, type FloMood } from './Flo';
import type { ArchitectureNodeData } from '../types/architecture';
import { EDGE_COLOR, getCategory } from '../lib/categories';

interface ArchitectureCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onReconnect: (oldEdge: Edge, newConnection: Connection) => void;
  onNodeDragStop: () => void;
  onNodeClick: (node: { id: string; data: ArchitectureNodeData }) => void;
  onEdgeClick: (edge: Edge) => void;
  onPaneClick: () => void;
  onTalk: () => void;
  floMood: FloMood;
  /** Changes whenever a whole new flow is loaded, so the view re-fits */
  layoutKey: string;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

function FitOnChange({ layoutKey }: { layoutKey: string }) {
  const { fitView } = useReactFlow();
  useEffect(() => {
    const id = window.setTimeout(() => fitView({ padding: 0.25, duration: 500, maxZoom: 1.1 }), 60);
    return () => window.clearTimeout(id);
  }, [layoutKey, fitView]);
  useEffect(() => {
    let id = 0;
    const onResize = () => {
      window.clearTimeout(id);
      id = window.setTimeout(() => fitView({ padding: 0.25, duration: 300, maxZoom: 1.1 }), 200);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('resize', onResize);
    };
  }, [fitView]);
  return null;
}

export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onReconnect,
  onNodeDragStop,
  onNodeClick,
  onEdgeClick,
  onPaneClick,
  onTalk,
  floMood,
  layoutKey,
  canvasRef,
}) => {
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);
  const [hintVisible, setHintVisible] = useState(true);

  useEffect(() => {
    const id = window.setTimeout(() => setHintVisible(false), 9000);
    return () => window.clearTimeout(id);
  }, []);

  const isEmpty = nodes.length === 0;

  return (
    <div ref={canvasRef} className="relative h-full flex-1 overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        connectionMode={ConnectionMode.Loose}
        connectionRadius={35}
        reconnectRadius={30}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={(_, node) => onNodeClick({ id: node.id, data: node.data as unknown as ArchitectureNodeData })}
        onEdgeClick={(_, edge) => onEdgeClick(edge)}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.25, maxZoom: 1.1 }}
        minZoom={0.2}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: EDGE_COLOR, strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_COLOR, width: 16, height: 16 },
          labelStyle: { fill: '#d5d2e5', fontSize: 11, fontWeight: 600 },
          labelBgStyle: { fill: '#151322', stroke: 'rgba(255,255,255,0.08)' },
          labelBgPadding: [8, 4],
          labelBgBorderRadius: 8,
        }}
        className="touch-none"
      >
        <FitOnChange layoutKey={layoutKey} />
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="#29253f" />
        <Controls showInteractive={false} position="bottom-left" className="export-exclude" />
        <MiniMap
          position="top-right"
          nodeColor={(node) => getCategory((node.data as unknown as ArchitectureNodeData).type).color}
          nodeBorderRadius={8}
          maskColor="rgba(9, 8, 15, 0.7)"
          bgColor="#100e1a"
          className="export-exclude !hidden lg:!block"
          style={{ width: 160, height: 104 }}
          zoomable
          pannable
        />
      </ReactFlow>

      {isEmpty && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center p-6">
          <div className="max-w-sm text-center animate-rise">
            <p className="text-lg font-semibold text-ink-100">Blank canvas</p>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-400">
              Click Flo and say the steps of your process out loud, like
              <span className="text-ink-200"> “signup, verify email, onboarding, dashboard”</span>.
            </p>
          </div>
        </div>
      )}

      {/* Flo, docked to the corner. Clicking opens a voice session. */}
      <div className="export-exclude absolute bottom-5 right-5 z-10 flex items-end gap-2">
        {(hintVisible || isEmpty) && floMood === 'idle' && (
          <div className="relative mb-16 hidden rounded-2xl sm:block rounded-br-md border border-white/10 bg-ink-850/95 px-3.5 py-2 text-xs font-medium text-ink-200 shadow-xl animate-rise">
            Tap me and talk through your flow
          </div>
        )}
        <button
          onClick={onTalk}
          className="group relative rounded-3xl p-1 transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400/60"
          aria-label="Talk to Flo — start a voice session"
          title="Talk to Flo"
        >
          <span className="absolute inset-x-4 bottom-1 h-6 rounded-full bg-accent-500/40 blur-xl transition-opacity group-hover:opacity-100 opacity-60" />
          <div className="animate-float">
            <Flo mood={floMood} size={84} />
          </div>
        </button>
      </div>
    </div>
  );
};

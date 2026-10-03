import React, { useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type Connection,
} from '@xyflow/react';
import { CustomNode } from './CustomNode';
import type { ArchitectureNodeData } from '../types/architecture';

interface ArchitectureCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onReconnect: (oldEdge: Edge, newConnection: Connection) => void;
  onNodeClick: (node: { id: string; data: ArchitectureNodeData }) => void;
  onEdgeClick: (edge: Edge) => void;
  canvasRef: React.RefObject<HTMLDivElement | null>;
}

export const ArchitectureCanvas: React.FC<ArchitectureCanvasProps> = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onReconnect,
  onNodeClick,
  onEdgeClick,
  canvasRef,
}) => {
  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  return (
    <div ref={canvasRef} className="flex-1 h-full relative bg-[#060810] overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onReconnect={onReconnect}
        reconnectRadius={20}
        onNodeClick={(_, node) => {
          onNodeClick({
            id: node.id,
            data: node.data as unknown as ArchitectureNodeData,
          });
        }}
        onEdgeClick={(_, edge) => {
          onEdgeClick(edge);
        }}
        fitView
        attributionPosition="bottom-left"
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#a855f7', strokeWidth: 2 },
        }}
        className="touch-none"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#1e293b"
        />
        <Controls
          className="!bg-slate-900 !border-slate-800 !rounded-xl !shadow-xl !overflow-hidden [&>button]:!bg-slate-900 [&>button]:!border-b [&>button]:!border-slate-800 [&>button]:!text-slate-200 hover:[&>button]:!bg-slate-800"
        />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as unknown as ArchitectureNodeData;
            switch (data.type) {
              case 'gateway': return '#a855f7';
              case 'service': return '#3b82f6';
              case 'database': return '#10b981';
              case 'cache': return '#f59e0b';
              case 'queue': return '#06b6d4';
              case 'client': return '#ec4899';
              default: return '#64748b';
            }
          }}
          maskColor="rgba(6, 8, 16, 0.75)"
          className="!bg-slate-950/90 !border-slate-800 !rounded-xl !shadow-2xl"
          zoomable
          pannable
        />
      </ReactFlow>

      {/* Floating Canvas Watermark / Hint */}
      <div className="absolute bottom-5 right-5 pointer-events-none text-right hidden sm:block">
        <div className="text-[11px] font-mono text-slate-400 bg-slate-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800/80 shadow-lg flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping"></span>
          <span>Click any connection arrow or drag its ends to rewire</span>
        </div>
      </div>
    </div>
  );
};

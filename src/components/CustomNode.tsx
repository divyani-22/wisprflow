import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { 
  Server, 
  Database, 
  Zap, 
  Layers, 
  Globe, 
  Smartphone, 
  Cpu, 
  Radio
} from 'lucide-react';
import type { ArchitectureNodeData } from '../types/architecture';

const iconMap: Record<string, React.ElementType> = {
  client: Smartphone,
  gateway: Globe,
  service: Server,
  database: Database,
  cache: Zap,
  queue: Layers,
  ai: Cpu,
};

const colorScheme: Record<string, {
  border: string;
  bg: string;
  glow: string;
  badge: string;
  iconColor: string;
}> = {
  client: {
    border: 'border-pink-500/50',
    bg: 'bg-pink-950/20',
    glow: 'hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]',
    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    iconColor: 'text-pink-400',
  },
  gateway: {
    border: 'border-purple-500/50',
    bg: 'bg-purple-950/20',
    glow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    iconColor: 'text-purple-400',
  },
  service: {
    border: 'border-blue-500/50',
    bg: 'bg-blue-950/20',
    glow: 'hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    iconColor: 'text-blue-400',
  },
  database: {
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-950/20',
    glow: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    iconColor: 'text-emerald-400',
  },
  cache: {
    border: 'border-amber-500/50',
    bg: 'bg-amber-950/20',
    glow: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    iconColor: 'text-amber-400',
  },
  queue: {
    border: 'border-cyan-500/50',
    bg: 'bg-cyan-950/20',
    glow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    iconColor: 'text-cyan-400',
  },
  ai: {
    border: 'border-indigo-500/50',
    bg: 'bg-indigo-950/20',
    glow: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.3)]',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    iconColor: 'text-indigo-400',
  },
};

const CustomNodeComponent: React.FC<NodeProps> = ({ data, selected }) => {
  const nodeData = data as unknown as ArchitectureNodeData;
  const nodeType = nodeData.type || 'service';
  const Icon = iconMap[nodeType] || Server;
  const theme = colorScheme[nodeType] || colorScheme.service;

  return (
    <div
      className={`min-w-[200px] max-w-[240px] rounded-xl p-3.5 backdrop-blur-md bg-slate-900/90 border transition-all duration-200 cursor-pointer shadow-lg ${
        theme.border
      } ${theme.glow} ${selected ? 'ring-2 ring-violet-400 shadow-[0_0_25px_rgba(167,139,250,0.5)]' : ''}`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-slate-400 !border-slate-800"
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!bg-slate-400 !border-slate-800"
      />

      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${theme.bg} ${theme.border} border`}>
            <Icon className={`w-4 h-4 ${theme.iconColor}`} />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-100 tracking-wide leading-tight">
              {nodeData.label}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono capitalize">
              {nodeData.type}
            </span>
          </div>
        </div>

        {nodeData.tech && (
          <span className={`text-[9px] px-1.5 py-0.5 rounded-full border font-mono ${theme.badge}`}>
            {nodeData.tech}
          </span>
        )}
      </div>

      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-2.5">
        {nodeData.description}
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px]">
        {nodeData.latency ? (
          <span className="text-slate-400 flex items-center gap-1 font-mono">
            <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
            {nodeData.latency}
          </span>
        ) : (
          <span className="text-emerald-400 flex items-center gap-1 font-mono">
            ● Active
          </span>
        )}

        {nodeData.throughput && (
          <span className="text-slate-400 font-mono">
            {nodeData.throughput}
          </span>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-violet-500 !border-slate-800"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!bg-violet-500 !border-slate-800"
      />
    </div>
  );
};

export const CustomNode = memo(CustomNodeComponent);

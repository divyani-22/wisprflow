import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { ArchitectureNodeData } from '../types/architecture';
import { getCategory } from '../lib/categories';

const CustomNodeComponent: React.FC<NodeProps> = ({ data, selected }) => {
  const node = data as unknown as ArchitectureNodeData & { enterDelay?: number };
  const category = getCategory(node.type);
  const Icon = category.icon;
  const metrics = [node.latency, node.throughput].filter(Boolean);

  return (
    <div
      className={`node-enter group w-[232px] rounded-2xl border bg-ink-900/95 p-3 backdrop-blur transition-[border-color,box-shadow] duration-200 ${
        selected ? 'border-accent-400/80' : 'border-white/[0.08] hover:border-white/20'
      }`}
      style={{
        animationDelay: `${node.enterDelay ?? 0}ms`,
        boxShadow: selected
          ? `0 0 0 4px rgba(139,116,248,0.15), 0 12px 32px -12px ${category.color}55`
          : '0 10px 30px -14px rgba(0,0,0,0.7)',
      }}
    >
      <Handle type="target" position={Position.Top} />
      <Handle type="target" position={Position.Left} id="left" />

      <div className="flex items-start gap-2.5">
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
          style={{ backgroundColor: `${category.color}1f`, color: category.color }}
        >
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {node.step !== undefined && (
              <span className="font-mono text-[10px] text-ink-500">{String(node.step).padStart(2, '0')}</span>
            )}
            <span className="truncate text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: category.color }}>
              {node.tech || category.label}
            </span>
          </div>
          <h4 className="mt-0.5 truncate text-[13px] font-semibold leading-tight text-ink-100" title={node.label}>
            {node.label}
          </h4>
        </div>
      </div>

      {node.description && (
        <p className="mt-2 line-clamp-2 text-[11.5px] leading-relaxed text-ink-400">{node.description}</p>
      )}

      {metrics.length > 0 && (
        <div className="mt-2.5 flex items-center gap-3 border-t border-white/[0.06] pt-2 font-mono text-[10px] text-ink-400">
          {metrics.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      )}

      <Handle type="source" position={Position.Bottom} />
      <Handle type="source" position={Position.Right} id="right" />
    </div>
  );
};

export const CustomNode = memo(CustomNodeComponent);

import { ArrowRight, Trash2, X } from 'lucide-react';
import type { Edge } from '@xyflow/react';
import type { ArchitectureNodeData, NodeType } from '../types/architecture';
import { CATEGORIES, EDGE_COLOR, EDGE_COLORS, getCategory } from '../lib/categories';

export interface EdgePatch {
  label?: string;
  animated?: boolean;
  stroke?: string;
  type?: string;
}

interface InspectorProps {
  selectedNode: { id: string; data: ArchitectureNodeData } | null;
  selectedEdge: Edge | null;
  getNodeLabel: (id: string) => string;
  onClose: () => void;
  onUpdateNodeData: (id: string, data: Partial<ArchitectureNodeData>) => void;
  onUpdateEdgeData: (id: string, data: EdgePatch) => void;
  onDeleteNode: (id: string) => void;
  onDeleteEdge: (id: string) => void;
}

const LINE_STYLES = [
  { id: 'smoothstep', label: 'Elbow' },
  { id: 'default', label: 'Curve' },
  { id: 'straight', label: 'Straight' },
];

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="grid rounded-xl border border-white/[0.07] bg-ink-900/80 p-1" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-lg py-1.5 text-xs font-semibold transition-colors ${
            value === o.id ? 'bg-white/10 text-ink-100' : 'text-ink-400 hover:text-ink-200'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Inspector({
  selectedNode,
  selectedEdge,
  getNodeLabel,
  onClose,
  onUpdateNodeData,
  onUpdateEdgeData,
  onDeleteNode,
  onDeleteEdge,
}: InspectorProps) {
  const title = selectedEdge ? 'Connection' : 'Step';

  return (
    <div className="flex h-full flex-col animate-fade">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <span className="text-[13px] font-semibold text-ink-100">Edit {title.toLowerCase()}</span>
        <button onClick={onClose} className="btn-ghost h-8 w-8 !p-0" aria-label="Close editor">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {selectedNode && (
          <>
            <div>
              <label className="label" htmlFor="node-label">Name</label>
              <input
                id="node-label"
                className="field"
                value={selectedNode.data.label}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { label: e.target.value })}
              />
            </div>

            <div>
              <label className="label" htmlFor="node-desc">Notes</label>
              <textarea
                id="node-desc"
                rows={3}
                className="field resize-none leading-relaxed"
                value={selectedNode.data.description}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { description: e.target.value })}
              />
            </div>

            <div>
              <span className="label">Kind</span>
              <div className="grid grid-cols-2 gap-1.5">
                {(Object.keys(CATEGORIES) as NodeType[]).map((type) => {
                  const cat = CATEGORIES[type];
                  const Icon = cat.icon;
                  const active = selectedNode.data.type === type;
                  return (
                    <button
                      key={type}
                      onClick={() => onUpdateNodeData(selectedNode.id, { type })}
                      className={`flex items-center gap-2 rounded-xl border px-2.5 py-2 text-xs font-medium transition-colors ${
                        active ? 'border-white/20 bg-white/[0.06] text-ink-100' : 'border-white/[0.06] text-ink-400 hover:border-white/15 hover:text-ink-200'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: cat.color }} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="node-tag">Tag</label>
              <input
                id="node-tag"
                className="field"
                placeholder={getCategory(selectedNode.data.type).label}
                value={selectedNode.data.tech || ''}
                onChange={(e) => onUpdateNodeData(selectedNode.id, { tech: e.target.value })}
              />
            </div>
          </>
        )}

        {selectedEdge && (
          <>
            <div className="flex items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3 text-xs font-medium text-ink-200">
              <span className="truncate">{getNodeLabel(selectedEdge.source)}</span>
              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-accent-400" />
              <span className="truncate">{getNodeLabel(selectedEdge.target)}</span>
            </div>

            <div>
              <label className="label" htmlFor="edge-label">Label</label>
              <input
                id="edge-label"
                className="field"
                placeholder="e.g. on success"
                value={(selectedEdge.label as string) || ''}
                onChange={(e) => onUpdateEdgeData(selectedEdge.id, { label: e.target.value })}
              />
            </div>

            <div>
              <span className="label">Line</span>
              <Segmented
                value={selectedEdge.type || 'smoothstep'}
                options={LINE_STYLES}
                onChange={(type) => onUpdateEdgeData(selectedEdge.id, { type })}
              />
            </div>

            <div>
              <span className="label">Colour</span>
              <div className="flex flex-wrap gap-2">
                {EDGE_COLORS.map((hex) => {
                  const active = ((selectedEdge.style?.stroke as string) || EDGE_COLOR) === hex;
                  return (
                    <button
                      key={hex}
                      onClick={() => onUpdateEdgeData(selectedEdge.id, { stroke: hex })}
                      className={`h-7 w-7 rounded-full transition-transform hover:scale-110 ${active ? 'ring-2 ring-white/80 ring-offset-2 ring-offset-ink-900' : ''}`}
                      style={{ backgroundColor: hex }}
                      aria-label={`Colour ${hex}`}
                    />
                  );
                })}
              </div>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-white/[0.07] px-3 py-2.5">
              <span className="text-xs font-medium text-ink-200">Animate flow</span>
              <input
                type="checkbox"
                className="peer sr-only"
                checked={!!selectedEdge.animated}
                onChange={() => onUpdateEdgeData(selectedEdge.id, { animated: !selectedEdge.animated })}
              />
              <span className="relative h-5 w-9 rounded-full bg-ink-700 transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform peer-checked:bg-accent-500 peer-checked:after:translate-x-4 peer-focus-visible:ring-2 peer-focus-visible:ring-accent-400/60" />
            </label>
          </>
        )}
      </div>

      <div className="border-t border-white/[0.06] p-4">
        <button
          onClick={() => (selectedEdge ? onDeleteEdge(selectedEdge.id) : selectedNode && onDeleteNode(selectedNode.id))}
          className="btn w-full border border-rose-500/20 text-rose-300 hover:bg-rose-500/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete {title.toLowerCase()}
        </button>
      </div>
    </div>
  );
}

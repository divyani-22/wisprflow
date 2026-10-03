import React from 'react';
import { 
  Settings2, 
  Sparkles,
  Server,
  Zap,
  Clock,
  ArrowRight,
  Trash2,
  Activity,
  Palette,
  Mic
} from 'lucide-react';
import type { ArchitectureNodeData } from '../types/architecture';
import type { Edge } from '@xyflow/react';

interface DocPanelProps {
  selectedNode: { id: string; data: ArchitectureNodeData } | null;
  selectedEdge: Edge | null;
  onUpdateNodeData?: (id: string, updatedData: Partial<ArchitectureNodeData>) => void;
  onUpdateEdgeData?: (edgeId: string, updatedData: { label?: string; animated?: boolean; stroke?: string; type?: string }) => void;
  onDeleteEdge?: (edgeId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
}

export const DocPanel: React.FC<DocPanelProps> = ({
  selectedNode,
  selectedEdge,
  onUpdateNodeData,
  onUpdateEdgeData,
  onDeleteEdge,
  onDeleteNode,
}) => {
  const edgeColors = [
    { name: 'Purple', hex: '#a855f7' },
    { name: 'Blue', hex: '#3b82f6' },
    { name: 'Cyan', hex: '#06b6d4' },
    { name: 'Emerald', hex: '#10b981' },
    { name: 'Amber', hex: '#f59e0b' },
    { name: 'Pink', hex: '#ec4899' },
  ];

  return (
    <aside className="w-[380px] border-r border-slate-800 bg-slate-950 flex flex-col h-full z-10 select-text shrink-0">
      {/* Single Section Header */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-semibold text-slate-100 uppercase tracking-wider">
            {selectedEdge ? 'Edit Linkage' : selectedNode ? 'Edit Step' : 'Flowchart Guide'}
          </span>
        </div>
        {(selectedNode || selectedEdge) && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Selected
          </span>
        )}
      </div>

      {/* Content Area - Single Section */}
      <div className="flex-1 overflow-y-auto p-4 text-sm">
        {selectedEdge ? (
          /* Linkage Editor */
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-violet-500/40 shadow-lg shadow-violet-500/10">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <ArrowRight className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-slate-100">Connection Arrow</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950/60 text-violet-300 border border-violet-800/40 font-mono">
                  {selectedEdge.id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                From: <span className="text-slate-200">{selectedEdge.source}</span> ➔ To: <span className="text-slate-200">{selectedEdge.target}</span>
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Arrow Label / Text
                </label>
                <input
                  type="text"
                  value={(selectedEdge.label as string) || ''}
                  placeholder="e.g. Next Step, User Action, Redirect..."
                  onChange={(e) => onUpdateEdgeData?.(selectedEdge.id, { label: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">
                  Arrow Line Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'default', label: 'Curved' },
                    { id: 'smoothstep', label: 'Step 90°' },
                    { id: 'straight', label: 'Straight' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onUpdateEdgeData?.(selectedEdge.id, { type: item.id })}
                      className={`py-1.5 text-xs rounded-lg border font-medium transition-all ${
                        (selectedEdge.type || 'default') === item.id
                          ? 'bg-violet-600/30 border-violet-500 text-violet-200'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-violet-400" />
                  <span className="text-xs text-slate-300 font-medium">Animated Pulse</span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateEdgeData?.(selectedEdge.id, { animated: !selectedEdge.animated })}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                    selectedEdge.animated
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {selectedEdge.animated ? 'Active' : 'Off'}
                </button>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5 mb-1.5">
                  <Palette className="w-3 h-3 text-slate-400" />
                  Arrow Color
                </label>
                <div className="flex items-center gap-2">
                  {edgeColors.map((color) => {
                    const currentStroke = (selectedEdge.style?.stroke as string) || '#a855f7';
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => onUpdateEdgeData?.(selectedEdge.id, { stroke: color.hex })}
                        style={{ backgroundColor: color.hex }}
                        className={`w-6 h-6 rounded-full transition-transform ${
                          currentStroke === color.hex ? 'scale-125 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={color.name}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => onDeleteEdge?.(selectedEdge.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 text-xs font-medium transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Connection</span>
                </button>
              </div>
            </div>
          </div>
        ) : selectedNode ? (
          /* Node / Step Editor */
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-2 mb-1">
                <Server className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold text-slate-100">{selectedNode.data.label}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-violet-950/60 text-violet-300 border border-violet-800/40 font-mono">
                ID: {selectedNode.id}
              </span>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Step Name</label>
                <input
                  type="text"
                  value={selectedNode.data.label}
                  onChange={(e) => onUpdateNodeData?.(selectedNode.id, { label: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Description / Notes</label>
                <textarea
                  rows={3}
                  value={selectedNode.data.description}
                  onChange={(e) => onUpdateNodeData?.(selectedNode.id, { description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-medium block mb-1">Category / Tag</label>
                <input
                  type="text"
                  value={selectedNode.data.tech || ''}
                  onChange={(e) => onUpdateNodeData?.(selectedNode.id, { tech: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Metrics</h5>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <Zap className="w-3.5 h-3.5 text-amber-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block">Status</span>
                    <span className="text-xs font-mono font-semibold text-emerald-400">Active</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                    <Clock className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
                    <span className="text-[10px] text-slate-400 block">Response Time</span>
                    <span className="text-xs font-mono font-semibold text-slate-200">{selectedNode.data.latency || '10ms'}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => onDeleteNode?.(selectedNode.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/40 text-rose-300 text-xs font-medium transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Step</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State / How-to guide */
          <div className="h-full flex flex-col justify-center text-center p-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mx-auto mb-3">
              <Sparkles className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-200 mb-1">Flowchart Studio</h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Click any <b>step box</b> or <b>connection arrow</b> on the canvas to edit its text, color, style, or remove it.
            </p>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs text-violet-300 font-semibold">
                <Mic className="w-3.5 h-3.5 text-violet-400" />
                <span>Voice Tips:</span>
              </div>
              <ul className="text-[11px] text-slate-400 space-y-1 list-disc pl-4">
                <li>Say: <i>"Landing page, signup, cart, payment, database"</i> to generate a new flow.</li>
                <li>Say: <i>"Add an email receipt step"</i> to extend your flow.</li>
                <li>Drag between circular dots to link any two steps.</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

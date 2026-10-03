import React from 'react';
import { Activity, CheckCircle2, Square } from 'lucide-react';

interface SimulationConsoleProps {
  activeStepLabel: string;
  stepIndex: number;
  totalSteps: number;
  statusText: string;
  onStop: () => void;
}

export const SimulationConsole: React.FC<SimulationConsoleProps> = ({
  activeStepLabel,
  stepIndex,
  totalSteps,
  statusText,
  onStop,
}) => {
  const progressPercent = totalSteps > 0 ? Math.round(((stepIndex + 1) / totalSteps) * 100) : 0;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-4 pointer-events-auto">
      <div className="rounded-2xl bg-slate-950/95 border border-emerald-500/40 p-4 backdrop-blur-xl shadow-2xl shadow-emerald-500/20 space-y-3">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Live Flow Simulation
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
              Step {stepIndex + 1} of {totalSteps}
            </span>
            <button
              onClick={onStop}
              className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Stop Simulation"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 h-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Status text */}
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-200 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-semibold text-emerald-300">{activeStepLabel}</span>
            <span className="text-slate-400 truncate">· {statusText}</span>
          </div>
          <span className="text-[10px] text-slate-500 shrink-0 pl-2">
            200 OK
          </span>
        </div>
      </div>
    </div>
  );
};

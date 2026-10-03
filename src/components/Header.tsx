import React from 'react';
import { 
  Network, 
  Download, 
  RotateCcw,
  Mic
} from 'lucide-react';
import type { ArchitectureSystem } from '../types/architecture';

interface HeaderProps {
  currentSystem: ArchitectureSystem;
  onReset: () => void;
  onExportPng: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onReset,
  onExportPng,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between z-20 shrink-0">
      {/* Brand logo & Wispr Flow Badge */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 p-[1.5px] flex items-center justify-center shadow-lg shadow-violet-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Network className="w-5 h-5 text-violet-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight bg-gradient-to-r from-slate-100 via-violet-200 to-pink-200 bg-clip-text text-transparent">
              VoiceArchitect
            </h1>
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/30">
              <Mic className="w-2.5 h-2.5 text-violet-400 animate-pulse" />
              Wispr Flow
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Voice-to-Flowchart Generator & Editor
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 text-xs font-medium transition-all shadow-sm"
          title="Clear and start new flowchart"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Clear Canvas</span>
        </button>

        <button
          onClick={onExportPng}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Flowchart</span>
        </button>
      </div>
    </header>
  );
};

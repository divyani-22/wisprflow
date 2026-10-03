import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Code2, Download, Image, PanelLeft, RotateCcw } from 'lucide-react';

interface HeaderProps {
  flowName: string;
  onToggleSidebar: () => void;
  onReset: () => void;
  onExportPng: () => void;
  onCopyMermaid: () => void;
}

function Logo() {
  return (
    <svg viewBox="0 0 32 32" className="h-8 w-8" aria-hidden="true">
      <rect width="32" height="32" rx="10" fill="#8b74f8" />
      <rect x="8" y="7" width="7" height="6" rx="2" fill="#fff" />
      <rect x="17" y="19" width="7" height="6" rx="2" fill="#fff" />
      <path d="M11.5 13v3.5a2.5 2.5 0 0 0 2.5 2.5h3" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export const Header: React.FC<HeaderProps> = ({ flowName, onToggleSidebar, onReset, onExportPng, onCopyMermaid }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [menuOpen]);

  return (
    <header className="relative z-20 flex h-16 shrink-0 items-center justify-between border-b border-white/[0.06] px-3 sm:px-4">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="btn-ghost h-9 w-9 !p-0 md:hidden" aria-label="Toggle sidebar">
          <PanelLeft className="h-4 w-4" />
        </button>

        <div className="flex min-w-0 items-center gap-2.5">
          <Logo />
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-tight text-ink-100">VoiceArchitect</p>
            <p className="truncate text-[11px] text-ink-400" title={flowName}>{flowName}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button onClick={onReset} className="btn-ghost" title="Clear canvas">
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setMenuOpen((o) => !o)} className="btn-outline" aria-haspopup="menu" aria-expanded={menuOpen} aria-label="Export">
            <Download className="h-3.5 w-3.5 sm:hidden" />
            <span className="hidden sm:inline">Export</span>
            <ChevronDown className={`hidden h-3.5 w-3.5 sm:block transition-transform ${menuOpen ? 'rotate-180' : ''}`} />
          </button>
          {menuOpen && (
            <div role="menu" className="absolute right-0 top-11 w-52 rounded-2xl border border-white/10 bg-ink-850 p-1.5 shadow-2xl animate-rise">
              {[
                { label: 'Download PNG', icon: Image, action: onExportPng },
                { label: 'Copy as Mermaid', icon: Code2, action: onCopyMermaid },
              ].map(({ label, icon: Icon, action }) => (
                <button
                  key={label}
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    action();
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-xs font-medium text-ink-200 transition-colors hover:bg-white/[0.06]"
                >
                  <Icon className="h-3.5 w-3.5 text-ink-400" />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

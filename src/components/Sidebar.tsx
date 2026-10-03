import { GitBranch, Keyboard, LifeBuoy, Mic, Network, ShoppingCart, UserPlus, type LucideIcon } from 'lucide-react';
import { Flo } from './Flo';
import { PRESET_SYSTEMS } from '../data/presets';
import type { ArchitectureSystem } from '../types/architecture';
import { formatWhen, type HistoryEntry } from '../lib/history';

const TEMPLATES: { title: string; icon: LucideIcon; prompt: string }[] = [
  { title: 'Onboarding', icon: UserPlus, prompt: 'Landing page, user signup, email verification, onboarding survey, and dashboard' },
  { title: 'Checkout', icon: ShoppingCart, prompt: 'Product page, cart, stripe payment, order database, and email receipt' },
  { title: 'Support', icon: LifeBuoy, prompt: 'Customer inquiry, AI chatbot, ticket triage, and admin dashboard' },
  { title: 'Release', icon: GitBranch, prompt: 'Code push, run tests, build image, deploy to staging, then release to production' },
];

interface SidebarProps {
  history: HistoryEntry[];
  activeId: string;
  onTalk: () => void;
  onType: () => void;
  onRunPrompt: (prompt: string) => void;
  onLoadSystem: (system: ArchitectureSystem) => void;
  onClearHistory: () => void;
}

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between px-1">
      <h3 className="text-[13px] font-semibold text-ink-100">{children}</h3>
      {action}
    </div>
  );
}

export function Sidebar({ history, activeId, onTalk, onType, onRunPrompt, onLoadSystem, onClearHistory }: SidebarProps) {
  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
      {/* Primary actions */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={onTalk}
          className="group relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border border-accent-500/30 bg-accent-500/10 px-3 pb-3.5 pt-4 text-center transition-colors hover:border-accent-400/60 hover:bg-accent-500/15"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent-500 text-white shadow-[0_8px_24px_-6px_rgba(139,116,248,0.7)] transition-transform group-hover:scale-105">
            <Mic className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold leading-tight text-ink-100">
            Talk to Flo
            <span className="block font-medium text-ink-400">with Wispr Flow</span>
          </span>
        </button>
        <button
          onClick={onType}
          className="group flex flex-col items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-3 pb-3.5 pt-4 text-center transition-colors hover:border-white/15 hover:bg-white/[0.05]"
        >
          <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-ink-850 text-ink-200 transition-transform group-hover:scale-105">
            <Keyboard className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold leading-tight text-ink-100">
            Type it
            <span className="block font-medium text-ink-400">press /</span>
          </span>
        </button>
      </div>

      {/* Templates */}
      <section>
        <SectionTitle>Start from a template</SectionTitle>
        <div className="grid grid-cols-4 gap-1">
          {TEMPLATES.map(({ title, icon: Icon, prompt }) => (
            <button
              key={title}
              onClick={() => onRunPrompt(prompt)}
              title={prompt}
              className="group flex flex-col items-center gap-1.5 rounded-xl py-2 transition-colors hover:bg-white/[0.04]"
            >
              <div className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-ink-850 text-ink-300 transition-colors group-hover:border-accent-400/50 group-hover:text-accent-300">
                <Icon className="h-[18px] w-[18px]" />
              </div>
              <span className="text-[11px] font-medium text-ink-400 group-hover:text-ink-200">{title}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 space-y-1">
          {PRESET_SYSTEMS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onLoadSystem(preset)}
              className={`flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/[0.04] ${
                activeId === preset.id ? 'bg-white/[0.04]' : ''
              }`}
            >
              <Network className="h-4 w-4 shrink-0 text-ink-400" />
              <span className="truncate text-xs font-medium text-ink-300">{preset.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* History */}
      <section className="flex-1">
        <SectionTitle
          action={
            history.length > 0 && (
              <button onClick={onClearHistory} className="text-[11px] font-medium text-ink-500 transition-colors hover:text-ink-200">
                Clear
              </button>
            )
          }
        >
          History
        </SectionTitle>

        {history.length === 0 ? (
          <div className="flex items-center gap-3 rounded-2xl border border-dashed border-white/10 p-3.5">
            <Flo size={36} followPointer={false} />
            <p className="text-[11.5px] leading-relaxed text-ink-400">Flows you dictate show up here so you can jump back to them.</p>
          </div>
        ) : (
          <ul className="space-y-1.5">
            {history.map((entry) => {
              const SourceIcon = entry.source === 'voice' ? Mic : Keyboard;
              const active = entry.system.id === activeId;
              return (
                <li key={entry.id}>
                  <button
                    onClick={() => onLoadSystem(entry.system)}
                    className={`flex w-full items-start gap-3 rounded-2xl border p-2.5 text-left transition-colors ${
                      active ? 'border-accent-500/40 bg-accent-500/[0.08]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/15'
                    }`}
                  >
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-ink-300">
                      <SourceIcon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 text-xs font-medium leading-snug text-ink-200">{entry.prompt}</p>
                      <p className="mt-1 font-mono text-[10px] text-ink-500">
                        {formatWhen(entry.createdAt)} · {entry.system.nodes.length} steps
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

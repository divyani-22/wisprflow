import type { ArchitectureSystem } from '../types/architecture';

export interface HistoryEntry {
  id: string;
  prompt: string;
  source: 'voice' | 'text';
  createdAt: number;
  system: ArchitectureSystem;
}

const KEY = 'voicearchitect.history.v1';
const LIMIT = 20;

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(entries: HistoryEntry[]): HistoryEntry[] {
  const trimmed = entries.slice(0, LIMIT);
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // Storage full or disabled: history just won't persist
  }
  return trimmed;
}

export function formatWhen(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.round(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

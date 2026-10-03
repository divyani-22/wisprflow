import { Bot, Database, Globe, Layers, Monitor, Server, Zap, type LucideIcon } from 'lucide-react';
import type { NodeType } from '../types/architecture';

export interface Category {
  label: string;
  color: string;
  icon: LucideIcon;
}

export const CATEGORIES: Record<NodeType, Category> = {
  client: { label: 'Screen', color: '#ef8bb5', icon: Monitor },
  gateway: { label: 'Gateway', color: '#9aa5ff', icon: Globe },
  service: { label: 'Logic', color: '#6eb0ff', icon: Server },
  database: { label: 'Data', color: '#52d6a8', icon: Database },
  cache: { label: 'Cache', color: '#f3b862', icon: Zap },
  queue: { label: 'Messaging', color: '#62d2e8', icon: Layers },
  ai: { label: 'AI', color: '#b994ff', icon: Bot },
};

export const getCategory = (type: string | undefined): Category =>
  CATEGORIES[(type as NodeType) ?? 'service'] ?? CATEGORIES.service;

export const EDGE_COLOR = '#8b74f8';

export const EDGE_COLORS = ['#8b74f8', '#6eb0ff', '#62d2e8', '#52d6a8', '#f3b862', '#ef8bb5', '#8a86a6'];

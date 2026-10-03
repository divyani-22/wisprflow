export type NodeType = 'client' | 'gateway' | 'service' | 'database' | 'cache' | 'queue' | 'ai' | 'decision';

export interface ArchitectureNodeData {
  label: string;
  type: NodeType;
  description: string;
  tech?: string;
  latency?: string;
  throughput?: string;
  status?: 'active' | 'scaling' | 'healthy' | 'idle' | 'simulating' | 'success';
  endpoints?: string[];
  isHighlighted?: boolean;
  [key: string]: unknown;
}

export interface ArchitectureSystem {
  id: string;
  name: string;
  description: string;
  nodes: {
    id: string;
    type: string;
    position: { x: number; y: number };
    data: ArchitectureNodeData;
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    label?: string;
    animated?: boolean;
    type?: string;
    style?: { stroke?: string; strokeWidth?: number; strokeDasharray?: string };
  }[];
  specMarkdown: string;
  mermaidCode: string;
}

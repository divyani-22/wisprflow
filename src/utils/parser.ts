import type { ArchitectureNodeData, ArchitectureSystem, NodeType } from '../types/architecture';
import { EDGE_COLOR } from '../lib/categories';

// Generated flows are laid out top-down, wrapping into a new column every few steps
const STEPS_PER_COLUMN = 5;
const COLUMN_GAP = 300;
const ROW_GAP = 170;

export interface ParseResult {
  action: 'flowchart_generated' | 'node_added' | 'preset_loaded';
  message: string;
  updatedSystem: ArchitectureSystem;
}

// Helper to determine node type and icon styling based on keywords
function detectTypeAndTech(item: string): { type: NodeType; tech: string; desc: string } {
  const s = item.toLowerCase();
  if (s.includes('db') || s.includes('database') || s.includes('postgres') || s.includes('mongo') || s.includes('sql') || s.includes('storage')) {
    return { type: 'database', tech: 'Database / Storage', desc: 'Stores and persists application records.' };
  }
  if (s.includes('payment') || s.includes('stripe') || s.includes('checkout') || s.includes('billing')) {
    return { type: 'service', tech: 'Payment Engine', desc: 'Processes transactions and billing.' };
  }
  if (s.includes('auth') || s.includes('login') || s.includes('signup') || s.includes('register') || s.includes('verif')) {
    return { type: 'service', tech: 'Auth & Security', desc: 'Handles identity, tokens, and access control.' };
  }
  if (s.includes('email') || s.includes('notification') || s.includes('sms') || s.includes('alert')) {
    return { type: 'queue', tech: 'Notification Worker', desc: 'Dispatches emails, messages, and webhooks.' };
  }
  if (s.includes('cache') || s.includes('redis')) {
    return { type: 'cache', tech: 'In-Memory Cache', desc: 'Speeds up queries with sub-millisecond responses.' };
  }
  if (s.includes('page') || s.includes('ui') || s.includes('landing') || s.includes('app') || s.includes('mobile') || s.includes('dashboard') || s.includes('cart')) {
    return { type: 'client', tech: 'User Interface / Screen', desc: 'Frontend view for customer interaction.' };
  }
  if (s.includes('ai') || s.includes('llm') || s.includes('bot') || s.includes('gpt')) {
    return { type: 'ai', tech: 'AI Model / Logic', desc: 'Executes intelligence and automated reasoning.' };
  }
  return { type: 'service', tech: 'Application Logic', desc: 'Handles processing and business rules.' };
}

// Extract human items from phrases like "I need a landing page, a checkout, and a database"
function extractItemsFromSpeech(text: string): string[] {
  // Clean filler words
  const clean = text
    .replace(/^(i need|i want|create|build|make|generate|design|can you make|give me)\s*(a|an|the)?/i, '')
    .trim();

  // Split by common natural language delimiters: "then", "and then", "followed by", commas, "and", "connected to"
  const rawParts = clean
    .split(/\s*(?:,|\band then\b|\bthen\b|\bfollowed by\b|\bconnected to\b|\band\b|->|→)\s*/i)
    .map(p => p.replace(/^(a|an|the)\s+/i, '').trim())
    .filter(p => p.length > 1 && !['it', 'all', 'system', 'website', 'app', 'flowchart'].includes(p.toLowerCase()));

  if (rawParts.length >= 2) {
    return rawParts;
  }

  // Fallback: split by commas or words
  return clean.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

export function parseVoiceCommand(
  rawTranscript: string,
  currentSystem: ArchitectureSystem
): ParseResult {
  const text = rawTranscript.trim();
  const lower = text.toLowerCase();

  // If user says "Add [item]" to the existing flowchart
  if (/^(add|insert)\b/.test(lower)) {
    const itemName = text.replace(/^(add|insert)\s*(a|an|the)?\s*/i, '').trim();
    const { type, tech, desc } = detectTypeAndTech(itemName);
    const newId = `node-${Date.now()}`;

    // Place it directly below the last node
    const lastNode = currentSystem.nodes[currentSystem.nodes.length - 1];
    const newX = lastNode ? lastNode.position.x : 0;
    const newY = lastNode ? lastNode.position.y + ROW_GAP : 0;

    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: newX, y: newY },
      data: {
        label: itemName.charAt(0).toUpperCase() + itemName.slice(1),
        type,
        description: desc,
        step: currentSystem.nodes.length + 1,
      } as ArchitectureNodeData,
    };

    const newEdges = [...currentSystem.edges];
    if (lastNode) {
      newEdges.push({
        id: `e-${Date.now()}`,
        source: lastNode.id,
        target: newId,
        animated: true,
        style: { stroke: EDGE_COLOR, strokeWidth: 2 },
      });
    }

    const updatedNodes = [...currentSystem.nodes, newNode];
    const updatedSystem: ArchitectureSystem = {
      ...currentSystem,
      nodes: updatedNodes,
      edges: newEdges,
      specMarkdown: currentSystem.specMarkdown + `\n\n### Step: ${newNode.data.label}\n- **Role**: ${desc}\n- **Category**: ${tech}\n`,
      mermaidCode: currentSystem.mermaidCode + `    ${lastNode ? lastNode.id : 'Start'} --> ${newId}["${newNode.data.label}"]\n`
    };

    return {
      action: 'node_added',
      message: `Added "${newNode.data.label}" to your flowchart!`,
      updatedSystem,
    };
  }

  // Otherwise: Build a brand new custom flowchart from what the user said!
  const items = extractItemsFromSpeech(text);

  // If user spoke a single generic sentence, default to meaningful steps
  const steps = items.length >= 2 ? items : [
    'User Request',
    text || 'Core Processing',
    'Database Storage',
    'Confirmation'
  ];

  const nodes = steps.map((item, index) => {
    const { type, desc } = detectTypeAndTech(item);
    const label = item.charAt(0).toUpperCase() + item.slice(1);
    
    const col = Math.floor(index / STEPS_PER_COLUMN);
    const row = index % STEPS_PER_COLUMN;
    const x = col * COLUMN_GAP;
    const y = row * ROW_GAP;

    return {
      id: `step-${index + 1}`,
      type: 'custom',
      position: { x, y },
      data: {
        label,
        type,
        description: desc,
        step: index + 1,
      } as ArchitectureNodeData,
    };
  });

  // Connect Step 1 -> Step 2 -> Step 3 ...
  const edges = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `edge-${i + 1}-${i + 2}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      animated: true,
      style: { stroke: EDGE_COLOR, strokeWidth: 2 },
    });
  }

  // Generate clean readable Markdown
  let markdown = `# Flowchart & Technical Spec: ${text.slice(0, 40)}...\n\n`;
  markdown += `**Spoken Request**: *"${text}"*\n\n## Sequential Flow Steps:\n`;
  steps.forEach((step, idx) => {
    markdown += `${idx + 1}. **${step.toUpperCase()}**: Processes data and routes to Step ${idx + 2 <= steps.length ? idx + 2 : 'Complete'}.\n`;
  });

  // Generate Mermaid code
  let mermaid = 'graph LR\n';
  steps.forEach((step, idx) => {
    if (idx < steps.length - 1) {
      mermaid += `    Node_${idx + 1}["${step}"] --> Node_${idx + 2}["${steps[idx + 1]}"]\n`;
    }
  });

  const updatedSystem: ArchitectureSystem = {
    id: `custom-flow-${Date.now()}`,
    name: text.length > 25 ? text.slice(0, 25) + '...' : text,
    description: `Flowchart generated from: "${text}"`,
    nodes,
    edges,
    specMarkdown: markdown,
    mermaidCode: mermaid,
  };

  return {
    action: 'flowchart_generated',
    message: `Generated flowchart with ${nodes.length} connected steps!`,
    updatedSystem,
  };
}

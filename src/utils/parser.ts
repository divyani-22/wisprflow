import type { ArchitectureNodeData, ArchitectureSystem, NodeType } from '../types/architecture';
import { INDUSTRY_TEMPLATES } from '../data/industryTemplates';

export interface ParseResult {
  action: 
    | 'flowchart_generated' 
    | 'branch_generated' 
    | 'node_added' 
    | 'undo' 
    | 'clear' 
    | 'simulate' 
    | 'auto_layout' 
    | 'delete_node' 
    | 'change_color'
    | 'unknown';
  message: string;
  updatedSystem?: ArchitectureSystem;
  targetId?: string;
  targetColor?: string;
}

// Detect node type, tech, and description
function detectTypeAndTech(item: string): { type: NodeType; tech: string; desc: string } {
  const s = item.toLowerCase();
  if (s.includes('if') || s.includes('check') || s.includes('verify') || s.includes('valid') || s.includes('decision')) {
    return { type: 'decision', tech: 'Decision Logic', desc: 'Evaluates condition to route downstream branches.' };
  }
  if (s.includes('db') || s.includes('database') || s.includes('postgres') || s.includes('mongo') || s.includes('sql') || s.includes('storage')) {
    return { type: 'database', tech: 'Database / Storage', desc: 'Stores and persists application records.' };
  }
  if (s.includes('payment') || s.includes('stripe') || s.includes('checkout') || s.includes('billing')) {
    return { type: 'service', tech: 'Payment Engine', desc: 'Processes transactions and billing.' };
  }
  if (s.includes('auth') || s.includes('login') || s.includes('signup') || s.includes('register') || s.includes('verification')) {
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

// Extract human items from speech
function extractItemsFromSpeech(text: string): string[] {
  const clean = text
    .replace(/^(i need|i want|create|build|make|generate|design|can you make|give me)\s*(a|an|the)?/i, '')
    .trim();

  const rawParts = clean
    .split(/\s*(?:,|and then|then|followed by|connected to|\band\b)\s*/i)
    .map(p => p.replace(/^(a|an|the)\s+/i, '').trim())
    .filter(p => p.length > 1 && !['it', 'all', 'system', 'website', 'app', 'flowchart'].includes(p.toLowerCase()));

  if (rawParts.length >= 2) return rawParts;
  return clean.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

export function parseVoiceCommand(
  rawTranscript: string,
  currentSystem: ArchitectureSystem
): ParseResult {
  const text = rawTranscript.trim();
  const lower = text.toLowerCase();

  // 0. High-Profile Industry Architecture Templates
  if (lower.includes('uber') || lower.includes('dispatch') || lower.includes('ride match')) {
    return {
      action: 'flowchart_generated',
      message: 'Synthesized Uber Real-Time Driver Dispatch Engine with H3 Geospatial indexing!',
      updatedSystem: JSON.parse(JSON.stringify(INDUSTRY_TEMPLATES.uber)),
    };
  }

  if (lower.includes('rag') || (lower.includes('ai') && lower.includes('agent')) || lower.includes('vector db')) {
    return {
      action: 'flowchart_generated',
      message: 'Synthesized Autonomous Voice AI Agent with RAG & Vector Memory!',
      updatedSystem: JSON.parse(JSON.stringify(INDUSTRY_TEMPLATES.rag)),
    };
  }

  if (lower.includes('netflix') || lower.includes('streaming pipeline') || lower.includes('transcod')) {
    return {
      action: 'flowchart_generated',
      message: 'Synthesized Netflix Video Transcoding & Edge CDN Distribution Architecture!',
      updatedSystem: JSON.parse(JSON.stringify(INDUSTRY_TEMPLATES.netflix)),
    };
  }

  if (lower.includes('fintech') || lower.includes('trading') || lower.includes('orderbook') || lower.includes('fraud engine')) {
    return {
      action: 'flowchart_generated',
      message: 'Synthesized FinTech Ultra-Low-Latency Trading & Fraud Engine!',
      updatedSystem: JSON.parse(JSON.stringify(INDUSTRY_TEMPLATES.fintech)),
    };
  }
  if (lower.includes('simulate') || lower.includes('run test') || lower.includes('test flow') || lower.includes('start simulation')) {
    return {
      action: 'simulate',
      message: 'Running live workflow simulation...',
    };
  }

  // 2. Voice Command: UNDO
  if (lower === 'undo' || lower === 'undo that' || lower.includes('revert')) {
    return {
      action: 'undo',
      message: 'Undone last change.',
    };
  }

  // 3. Voice Command: CLEAR
  if (lower === 'clear' || lower === 'clear canvas' || lower.includes('reset canvas') || lower === 'start over') {
    return {
      action: 'clear',
      message: 'Canvas cleared.',
    };
  }

  // 4. Voice Command: AUTO ALIGN / ORGANIZE
  if (lower.includes('align') || lower.includes('organize') || lower.includes('beautify') || lower.includes('tidy')) {
    return {
      action: 'auto_layout',
      message: 'Auto-aligned all steps and connections.',
    };
  }

  // 5. Voice Command: CHANGE COLOR
  const colorMatches: Record<string, string> = {
    purple: '#a855f7',
    blue: '#3b82f6',
    cyan: '#06b6d4',
    emerald: '#10b981',
    green: '#10b981',
    amber: '#f59e0b',
    yellow: '#f59e0b',
    pink: '#ec4899',
    red: '#ef4444',
  };
  for (const [colorName, hex] of Object.entries(colorMatches)) {
    if (lower.includes(`make arrow ${colorName}`) || lower.includes(`make arrows ${colorName}`) || lower.includes(`color ${colorName}`)) {
      return {
        action: 'change_color',
        message: `Changed arrow colors to ${colorName}.`,
        targetColor: hex,
      };
    }
  }

  // 6. Voice Command: DELETE [NAME]
  if (lower.startsWith('delete ') || lower.startsWith('remove ')) {
    const targetName = lower.replace(/^(delete|remove)\s*(step|node|the|a)?\s*/i, '').trim();
    const matchedNode = currentSystem.nodes.find(n => n.data.label.toLowerCase().includes(targetName));
    if (matchedNode) {
      return {
        action: 'delete_node',
        message: `Deleted "${matchedNode.data.label}".`,
        targetId: matchedNode.id,
      };
    }
  }

  // 7. Feature 2: SMART CONDITIONAL / BRANCHING (IF / ELSE)
  if (lower.includes('if ') && (lower.includes('else') || lower.includes('otherwise'))) {
    // Example: "If user is logged in go to Dashboard, otherwise go to Login page"
    const match = text.match(/if\s+(.*?)\s+(?:then\s+)?(?:go\s+to\s+)?(.*?)\s+(?:else|otherwise)\s+(?:go\s+to\s+)?(.*)/i);
    if (match) {
      const conditionText = match[1].trim();
      const trueBranchText = match[2].trim();
      const falseBranchText = match[3].trim();

      const decisionId = `decision-${Date.now()}`;
      const trueId = `branch-true-${Date.now()}`;
      const falseId = `branch-false-${Date.now()}`;

      const decisionNode = {
        id: decisionId,
        type: 'custom',
        position: { x: 100, y: 160 },
        data: {
          label: `Check: ${conditionText.charAt(0).toUpperCase() + conditionText.slice(1)}?`,
          type: 'decision' as NodeType,
          tech: 'Condition Evaluator',
          description: `Evaluates if "${conditionText}" evaluates to true or false.`,
          latency: '2ms',
          throughput: 'Real-time',
        } as ArchitectureNodeData,
      };

      const trueNode = {
        id: trueId,
        type: 'custom',
        position: { x: 420, y: 60 },
        data: {
          label: trueBranchText.charAt(0).toUpperCase() + trueBranchText.slice(1),
          type: detectTypeAndTech(trueBranchText).type,
          tech: 'True Branch',
          description: `Success route when "${conditionText}" is met.`,
          latency: '15ms',
          throughput: 'Active',
        } as ArchitectureNodeData,
      };

      const falseNode = {
        id: falseId,
        type: 'custom',
        position: { x: 420, y: 260 },
        data: {
          label: falseBranchText.charAt(0).toUpperCase() + falseBranchText.slice(1),
          type: detectTypeAndTech(falseBranchText).type,
          tech: 'False Branch',
          description: `Fallback route when "${conditionText}" is not met.`,
          latency: '15ms',
          throughput: 'Active',
        } as ArchitectureNodeData,
      };

      const edges = [
        {
          id: `e-yes-${Date.now()}`,
          source: decisionId,
          target: trueId,
          label: 'Yes / True',
          animated: true,
          style: { stroke: '#10b981', strokeWidth: 2 },
        },
        {
          id: `e-no-${Date.now()}`,
          source: decisionId,
          target: falseId,
          label: 'No / False',
          animated: true,
          style: { stroke: '#ef4444', strokeWidth: 2 },
        },
      ];

      return {
        action: 'branch_generated',
        message: `Created Decision Diamond with 2 branches: "${trueNode.data.label}" & "${falseNode.data.label}"`,
        updatedSystem: {
          id: `branch-flow-${Date.now()}`,
          name: `Condition: ${conditionText}`,
          description: `Branching flowchart based on condition: "${conditionText}"`,
          nodes: [decisionNode, trueNode, falseNode],
          edges,
          specMarkdown: `# Conditional Decision Workflow: ${conditionText}\n\n1. **Evaluation**: Checks if \`${conditionText}\` is satisfied.\n2. **Branch True**: Routes to ${trueNode.data.label}.\n3. **Branch False**: Routes to ${falseNode.data.label}.\n`,
          mermaidCode: `graph LR\n    Decision{"${conditionText}?"} -->|Yes| TrueNode["${trueNode.data.label}"]\n    Decision -->|No| FalseNode["${falseNode.data.label}"]\n`,
        },
      };
    }
  }

  // 8. ADD A SINGLE STEP
  if ((lower.startsWith('add ') || lower.startsWith('insert ')) && !lower.includes('landing page and')) {
    const itemName = text.replace(/^(add|insert)\s*(a|an|the)?\s*/i, '').trim();
    const { type, tech, desc } = detectTypeAndTech(itemName);
    const newId = `node-${Date.now()}`;

    const lastNode = currentSystem.nodes[currentSystem.nodes.length - 1];
    const newX = lastNode ? lastNode.position.x + 280 : 100;
    const newY = lastNode ? lastNode.position.y : 200;

    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: newX, y: newY },
      data: {
        label: itemName.charAt(0).toUpperCase() + itemName.slice(1),
        type,
        tech,
        description: desc,
        latency: '15ms',
        throughput: '5k/s',
      } as ArchitectureNodeData,
    };

    const newEdges = [...currentSystem.edges];
    if (lastNode) {
      newEdges.push({
        id: `e-${Date.now()}`,
        source: lastNode.id,
        target: newId,
        label: 'Flows To',
        animated: true,
        style: { stroke: '#a855f7', strokeWidth: 2 },
      });
    }

    const updatedNodes = [...currentSystem.nodes, newNode];
    return {
      action: 'node_added',
      message: `Added "${newNode.data.label}" to your flowchart!`,
      updatedSystem: {
        ...currentSystem,
        nodes: updatedNodes,
        edges: newEdges,
        specMarkdown: currentSystem.specMarkdown + `\n\n### Step: ${newNode.data.label}\n- **Role**: ${desc}\n- **Category**: ${tech}\n`,
        mermaidCode: currentSystem.mermaidCode + `    ${lastNode ? lastNode.id : 'Start'} --> ${newId}["${newNode.data.label}"]\n`
      },
    };
  }

  // 9. BUILD FULL FLOWCHART FROM MULTI-STEP SENTENCE
  const items = extractItemsFromSpeech(text);
  const steps = items.length >= 2 ? items : [
    'User Request',
    text || 'Core Processing',
    'Database Storage',
    'Confirmation'
  ];

  const nodes = steps.map((item, index) => {
    const { type, tech, desc } = detectTypeAndTech(item);
    const label = item.charAt(0).toUpperCase() + item.slice(1);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const x = 60 + col * 320;
    const y = 80 + row * 220;

    return {
      id: `step-${index + 1}`,
      type: 'custom',
      position: { x, y },
      data: {
        label,
        type,
        tech,
        description: desc,
        latency: `${10 + index * 5}ms`,
        throughput: 'Active',
      } as ArchitectureNodeData,
    };
  });

  const edges = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `edge-${i + 1}-${i + 2}`,
      source: nodes[i].id,
      target: nodes[i + 1].id,
      label: `Step ${i + 1} ➔ ${i + 2}`,
      animated: true,
      style: { stroke: '#a855f7', strokeWidth: 2 },
    });
  }

  return {
    action: 'flowchart_generated',
    message: `Generated flowchart with ${nodes.length} connected steps!`,
    updatedSystem: {
      id: `custom-flow-${Date.now()}`,
      name: text.length > 25 ? text.slice(0, 25) + '...' : text,
      description: `Flowchart generated from: "${text}"`,
      nodes,
      edges,
      specMarkdown: `# Flowchart: ${text}\n`,
      mermaidCode: `graph LR\n`,
    },
  };
}

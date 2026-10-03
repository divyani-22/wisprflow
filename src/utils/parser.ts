import type { ArchitectureNodeData, ArchitectureSystem, NodeType } from '../types/architecture';
import { EDGE_COLOR } from '../lib/categories';

export interface ParseResult {
  action: 'flowchart_generated' | 'node_added' | 'preset_loaded';
  message: string;
  updatedSystem: ArchitectureSystem;
}

const FILLER_PHRASES = [
  /^(?:i\s*am|i'm)\s*telling\s*(?:you)?\s*(?:on\s*(?:the)?\s*audio)?\s*(?:to)?$/i,
  /^for\s*example$/i,
  /^like\s*this$/i,
  /^here\s*(?:is|are)\s*(?:the\s*)?(?:flow|steps?)$/i,
  /^as\s*follows$/i,
  /^can\s*you\s*(?:make|draw|create)$/i,
  /^please\s*(?:draw|create|make)$/i,
  /^flowchart$/i,
  /^diagram$/i,
  /^this\s*flowchart$/i,
  /^(?:first|firstly|second|secondly|third|thirdly|fourth|fourthly|fifth|finally|lastly|next|then)$/i,
];

function isFiller(str: string): boolean {
  const s = str.trim();
  if (s.length < 2) return true;
  return FILLER_PHRASES.some((rx) => rx.test(s));
}

// Action verb regex to detect boundaries of unpunctuated commands in speech
const ACTION_VERB_REGEX = /\b(?=(?:open|close|shut|switch\s+on|switch\s+off|turn\s+on|turn\s+off|power\s+on|power\s+off|sit\s+(?:on|in|down)|sit|stand\s+up|stand|walk\s+to|walk|go\s+to|enter|leave|start|stop|press|tap|click|check|verify|fetch|send|call|notify|save|create|run|watch|listen|play|signup|sign\s+up|login|log\s+in|checkout|pay)\b)/i;

function splitByVerbs(part: string): string[] {
  const sub = part.split(ACTION_VERB_REGEX).map((s) => s.trim()).filter((s) => s.length > 2);
  return sub.length >= 2 ? sub : [part];
}

function cleanSpeech(raw: string): string {
  let text = raw.trim();

  // Strip conversational opener up to the actual command/actions
  text = text.replace(
    /^(?:(?:i'm|i\s*am)\s*telling\s*(?:you\s*)?(?:on\s*(?:the\s*)?audio\s*)?(?:to\s*)?(?:,\s*)?(?:for\s*example\s*(?:to\s*)?)?|(?:i'm|i\s*am)\s*saying\s*(?:that\s*)?|i\s*want\s*(?:you\s*)?(?:to\s*)?|can\s*you\s*(?:please\s*)?(?:make|create|draw|build|generate)?\s*(?:a\s*)?(?:flowchart|flow|diagram)?\s*(?:for|to|of)?|please\s*(?:make|create|draw|build|generate)?\s*(?:a\s*)?(?:flowchart|flow|diagram)?\s*(?:for|to|of)?|(?:make|create|draw|build|generate)\s*(?:a\s*)?(?:flowchart|flow|diagram)?\s*(?:for|to|of)?|flowchart\s*(?:for|to|of)?|for\s*example\s*(?:to\s*)?|to\s+)/i,
    ''
  ).trim();

  // Clean remaining leading "to "
  text = text.replace(/^to\s+/i, '').trim();

  return text;
}

function postProcess(parts: string[]): string[] {
  return parts
    .map((p) => {
      let s = p.trim();
      s = s.replace(/^(?:and\s+then|and\s+finally|and\s+next|and|then|after\s+that|next|to|so|first(?:ly)?|second(?:ly)?|third(?:ly)?|fourth(?:ly)?|finally|lastly|step\s*\d*)\s+/i, '');
      s = s.replace(/^[,;:\-\s]+/, '').replace(/[,;:\-\s]+$/, '');
      return s.trim();
    })
    .filter((p) => !isFiller(p) && p.length > 1);
}

export function extractSteps(input: string): string[] {
  const text = cleanSpeech(input);

  // Strategy 1: Explicit numbered markers (step 1, step 2, 1., 2., 1, 2)
  if (/(?:step\s*\d+|\b[1-9]\s*[\.):\-]?\s+)/i.test(text)) {
    const parts = text
      .split(/(?:step\s*\d+\s*[:\-]?|\b[1-9]\s*[\.):\-]\s+|\b[1-9]\s+(?=[a-z]))/i)
      .map((s) => s.trim())
      .filter((s) => s.length > 1);
    if (parts.length >= 2) return postProcess(parts);
  }

  // Strategy 2: Common sequence delimiters (commas, then, and then, after that, next, finally, ->)
  const delim = /\s*(?:[,;]+(?:\s*(?:and\s+then|then|after\s+that|next|followed\s+by|finally|and|lastly))?|->|→|\band\s+then\b|\bthen\b|\bafter\s+that\b|\bfollowed\s+by\b|\bnext\b|\band\s+finally\b|\bconnected\s+to\b|\bwhich\s+leads\s+to\b|\bwhich\s+goes\s+to\b)\s*/i;

  const parts = text.split(delim).map((s) => s.trim()).filter((s) => s.length > 0);

  const expanded: string[] = [];
  for (const p of parts) {
    if (/\s+\band\b\s+/i.test(p)) {
      const andParts = p.split(/\s+\band\b\s+/i).map((s) => s.trim()).filter((s) => s.length > 0);
      for (const ap of andParts) {
        expanded.push(...splitByVerbs(ap));
      }
    } else {
      expanded.push(...splitByVerbs(p));
    }
  }

  return postProcess(expanded);
}

// Helper to determine node type, tech tag, and contextual description
export function detectTypeAndTech(item: string): { type: NodeType; tech: string; desc: string } {
  const s = item.toLowerCase();

  // Entryway / Gateway / Access
  if (s.includes('door') || s.includes('gate') || s.includes('lock') || s.includes('window') || s.includes('ingress') || s.includes('gateway') || s.includes('proxy')) {
    return { type: 'gateway', tech: 'Access & Gateway', desc: 'Operates entryway, security portal or physical barrier.' };
  }
  // Media / Device / Screen
  if (s.includes('tv') || s.includes('television') || s.includes('display') || s.includes('monitor') || s.includes('screen') || s.includes('media') || s.includes('audio') || s.includes('music') || s.includes('radio') || s.includes('speaker') || s.includes('landing') || s.includes('dashboard') || s.includes('page') || s.includes('ui') || s.includes('app') || s.includes('view') || s.includes('cart')) {
    return { type: 'client', tech: 'Screen / Device', desc: 'Interface, display, or media interaction point.' };
  }
  // Lighting / Power / Smart Home
  if (s.includes('light') || s.includes('lamp') || s.includes('bulb') || s.includes('led') || s.includes('power on') || s.includes('plug')) {
    return { type: 'service', tech: 'Lighting / IoT', desc: 'Controls room illumination or smart device power.' };
  }
  // Human Activity / Physical Action
  if (s.includes('sofa') || s.includes('couch') || s.includes('chair') || s.includes('bed') || s.includes('sit') || s.includes('stand') || s.includes('walk') || s.includes('relax') || s.includes('sleep') || s.includes('wait')) {
    return { type: 'service', tech: 'Human Activity', desc: 'Physical user presence or movement in environment.' };
  }
  // Database / Storage
  if (s.includes('db') || s.includes('database') || s.includes('postgres') || s.includes('mongo') || s.includes('sql') || s.includes('storage') || s.includes('save') || s.includes('store') || s.includes('persist')) {
    return { type: 'database', tech: 'Database / Storage', desc: 'Persists and stores state records reliably.' };
  }
  // Payment / Commerce
  if (s.includes('payment') || s.includes('stripe') || s.includes('checkout') || s.includes('billing') || s.includes('order') || s.includes('charge') || s.includes('invoice') || s.includes('pay')) {
    return { type: 'service', tech: 'Payment & Commerce', desc: 'Executes transaction and manages order lifecycle.' };
  }
  // Auth & Security
  if (s.includes('auth') || s.includes('login') || s.includes('signup') || s.includes('register') || s.includes('verify') || s.includes('password') || s.includes('token')) {
    return { type: 'service', tech: 'Auth & Security', desc: 'Handles identity, credentials, and verification.' };
  }
  // Messaging & Notifications
  if (s.includes('email') || s.includes('notification') || s.includes('sms') || s.includes('alert') || s.includes('message') || s.includes('queue') || s.includes('webhook')) {
    return { type: 'queue', tech: 'Notification Worker', desc: 'Dispatches alerts, emails, and event messages.' };
  }
  // Caching
  if (s.includes('cache') || s.includes('redis') || s.includes('memcached')) {
    return { type: 'cache', tech: 'In-Memory Cache', desc: 'Sub-millisecond query caching and state lookup.' };
  }
  // AI / LLM
  if (s.includes('ai') || s.includes('llm') || s.includes('bot') || s.includes('gpt') || s.includes('agent')) {
    return { type: 'ai', tech: 'AI Model / Logic', desc: 'Automated intelligence and natural language reasoning.' };
  }

  // Dynamic default
  const capitalized = item.charAt(0).toUpperCase() + item.slice(1);
  return { type: 'service', tech: 'Action Step', desc: `Executes "${capitalized}" step in sequence.` };
}

function findNodeMatch(query: string, nodes: ArchitectureSystem['nodes']) {
  const q = query.trim().toLowerCase();
  const stepMatch = q.match(/^(?:step\s*)?(\d+)$/i);
  if (stepMatch) {
    const num = parseInt(stepMatch[1], 10);
    const byStep = nodes.find((n) => n.data.step === num);
    if (byStep) return byStep;
  }
  const exact = nodes.find((n) => n.data.label.toLowerCase() === q);
  if (exact) return exact;

  const cleanQ = q.replace(/^(?:the|a|an)\s+/i, '');
  return nodes.find((n) => {
    const l = n.data.label.toLowerCase();
    return l.includes(cleanQ) || cleanQ.includes(l.replace(/^(?:the|a|an)\s+/i, ''));
  });
}

export function parseVoiceCommand(
  rawTranscript: string,
  currentSystem: ArchitectureSystem
): ParseResult {
  const text = rawTranscript.trim();
  const lower = text.toLowerCase();

  // If user says "Connect [box A] to [box B]" or "Link [box A] to [box B]"
  const connectMatch = text.match(/^(?:connect|link)\s+(.+?)\s+(?:to|with|and)\s+(.+)$/i);
  if (connectMatch && currentSystem.nodes.length >= 2) {
    const fromQuery = connectMatch[1].trim();
    const toQuery = connectMatch[2].trim();
    const sourceNode = findNodeMatch(fromQuery, currentSystem.nodes);
    const targetNode = findNodeMatch(toQuery, currentSystem.nodes);

    if (sourceNode && targetNode && sourceNode.id !== targetNode.id) {
      const edgeId = `edge-${sourceNode.id}-${targetNode.id}-${Date.now()}`;
      const newEdge = {
        id: edgeId,
        source: sourceNode.id,
        target: targetNode.id,
        animated: true,
        style: { stroke: EDGE_COLOR, strokeWidth: 2 },
      };

      const updatedEdges = [...currentSystem.edges, newEdge];
      const updatedSystem: ArchitectureSystem = {
        ...currentSystem,
        edges: updatedEdges,
        specMarkdown: currentSystem.specMarkdown + `\n- **Connected**: ${sourceNode.data.label} → ${targetNode.data.label}\n`,
        mermaidCode: currentSystem.mermaidCode + `    Node_${sourceNode.data.step ?? 1}["${sourceNode.data.label}"] --> Node_${targetNode.data.step ?? 2}["${targetNode.data.label}"]\n`,
      };

      return {
        action: 'node_added',
        message: `Connected "${sourceNode.data.label}" to "${targetNode.data.label}"!`,
        updatedSystem,
      };
    }
  }

  // If user says "Add [item]" to the existing flowchart
  if (/^(add|insert)\b/i.test(lower)) {
    const itemName = text.replace(/^(add|insert)\s*(a|an|the)?\s*/i, '').trim();
    const { type, tech, desc } = detectTypeAndTech(itemName);
    const newId = `node-${Date.now()}`;

    // Place it to the right or below the last node
    const lastNode = currentSystem.nodes[currentSystem.nodes.length - 1];
    const newX = lastNode ? lastNode.position.x + 300 : 60;
    const newY = lastNode ? lastNode.position.y : 140;

    const newNode = {
      id: newId,
      type: 'custom',
      position: { x: newX, y: newY },
      data: {
        label: itemName.charAt(0).toUpperCase() + itemName.slice(1),
        type,
        tech,
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
      mermaidCode: currentSystem.mermaidCode + `    ${lastNode ? lastNode.id : 'Start'} --> ${newId}["${newNode.data.label}"]\n`,
    };

    return {
      action: 'node_added',
      message: `Added "${newNode.data.label}" to your flowchart!`,
      updatedSystem,
    };
  }

  // Otherwise: Build a brand new custom flowchart from what the user said!
  const extracted = extractSteps(text);
  const steps = extracted.length >= 2 ? extracted : (text.length > 0 ? [text] : ['Start', 'Processing', 'Complete']);

  const STEPS_PER_ROW = 4;
  const COL_GAP = 300;
  const ROW_GAP = 190;

  const nodes = steps.map((item, index) => {
    const { type, tech, desc } = detectTypeAndTech(item);
    const label = item.charAt(0).toUpperCase() + item.slice(1);

    const col = index % STEPS_PER_ROW;
    const row = Math.floor(index / STEPS_PER_ROW);
    const x = 60 + col * COL_GAP;
    const y = 140 + row * ROW_GAP;

    return {
      id: `step-${index + 1}`,
      type: 'custom',
      position: { x, y },
      data: {
        label,
        type,
        tech,
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
  let markdown = `# Flowchart & Technical Spec: ${text.slice(0, 45)}...\n\n`;
  markdown += `**Spoken Command**: *"${text}"*\n\n## Sequential Flow Steps:\n`;
  nodes.forEach((n, idx) => {
    markdown += `${idx + 1}. **${n.data.label.toUpperCase()}** (${n.data.tech})\n   - ${n.data.description}\n`;
  });

  // Generate Mermaid code
  let mermaid = 'flowchart LR\n';
  nodes.forEach((n, idx) => {
    if (idx < nodes.length - 1) {
      mermaid += `    Node_${idx + 1}["${n.data.label}"] --> Node_${idx + 2}["${nodes[idx + 1].data.label}"]\n`;
    }
  });

  const title = nodes.map((n) => n.data.label).slice(0, 2).join(' → ') + (nodes.length > 2 ? '...' : '');

  const updatedSystem: ArchitectureSystem = {
    id: `custom-flow-${Date.now()}`,
    name: title,
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

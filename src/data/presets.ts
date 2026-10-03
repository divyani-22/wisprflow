import type { ArchitectureSystem } from '../types/architecture';

export const PRESET_SYSTEMS: ArchitectureSystem[] = [
  {
    id: 'ecommerce-microservices',
    name: 'E-Commerce Microservices Engine',
    description: 'High-throughput e-commerce platform with decoupled checkout, payment gateways, and Redis session caching.',
    nodes: [
      {
        id: 'client-1',
        type: 'custom',
        position: { x: 50, y: 180 },
        data: {
          label: 'Next.js Web / Mobile',
          type: 'client',
          description: 'Client frontend with SSR and edge caching on Vercel.',
          tech: 'React 19',
          latency: '24ms',
          throughput: '12.5k req/s',
          endpoints: ['GET /', 'POST /checkout', 'GET /products'],
        },
      },
      {
        id: 'gateway-1',
        type: 'custom',
        position: { x: 330, y: 180 },
        data: {
          label: 'Kong API Gateway',
          type: 'gateway',
          description: 'SSL termination, JWT verification, and token-bucket rate limiting.',
          tech: 'Kong / Envoy',
          latency: '4ms',
          throughput: '50k req/s',
          endpoints: ['/api/v1/*'],
        },
      },
      {
        id: 'auth-service',
        type: 'custom',
        position: { x: 620, y: 50 },
        data: {
          label: 'Auth & Identity Service',
          type: 'service',
          description: 'Manages user sessions, OAuth2 logins, and RBAC permissions.',
          tech: 'Go / gRPC',
          latency: '12ms',
          throughput: '8k req/s',
          endpoints: ['POST /auth/login', 'POST /auth/verify'],
        },
      },
      {
        id: 'order-service',
        type: 'custom',
        position: { x: 620, y: 220 },
        data: {
          label: 'Order Processing Service',
          type: 'service',
          description: 'State machine for orders, cart validation, and inventory allocation.',
          tech: 'Node.js / TS',
          latency: '45ms',
          throughput: '4k req/s',
          endpoints: ['POST /orders/create', 'GET /orders/:id'],
        },
      },
      {
        id: 'payment-queue',
        type: 'custom',
        position: { x: 920, y: 220 },
        data: {
          label: 'Kafka Event Stream',
          type: 'queue',
          description: 'Durable event log for async order checkout events & webhooks.',
          tech: 'Apache Kafka',
          latency: '3ms',
          throughput: '100k msg/s',
          endpoints: ['topic: orders.created', 'topic: payments.captured'],
        },
      },
      {
        id: 'redis-cache',
        type: 'custom',
        position: { x: 620, y: 390 },
        data: {
          label: 'Redis Cluster Cache',
          type: 'cache',
          description: 'Product catalog cache and distributed session store with 1hr TTL.',
          tech: 'Redis 7.2',
          latency: '< 1ms',
          throughput: '85k ops/s',
        },
      },
      {
        id: 'postgres-db',
        type: 'custom',
        position: { x: 920, y: 390 },
        data: {
          label: 'Primary Postgres DB',
          type: 'database',
          description: 'Multi-AZ transactional relational database with read replicas.',
          tech: 'PostgreSQL 16',
          latency: '8ms',
          throughput: '3.2k tx/s',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'client-1', target: 'gateway-1', label: 'HTTPS / TLS 1.3', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } },
      { id: 'e2', source: 'gateway-1', target: 'auth-service', label: 'gRPC', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } },
      { id: 'e3', source: 'gateway-1', target: 'order-service', label: 'REST / JSON', animated: true, style: { stroke: '#3b82f6', strokeWidth: 2 } },
      { id: 'e4', source: 'order-service', target: 'payment-queue', label: 'Produce Event', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
      { id: 'e5', source: 'order-service', target: 'redis-cache', label: 'Cache Lookup', animated: true, style: { stroke: '#f59e0b', strokeWidth: 2 } },
      { id: 'e6', source: 'order-service', target: 'postgres-db', label: 'ACID Writes', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
    ],
    specMarkdown: `# E-Commerce Microservices Architecture Spec

## 1. System Overview
The architecture is designed for **99.99% availability** with horizontal autoscaling across AWS multi-AZ regions. Requests terminate at an ingress API Gateway before routing to stateless microservices backed by an event-driven Kafka bus.

### Key Performance SLA
- **P99 API Latency**: < 80ms
- **Max Throughput**: 50,000 requests/second
- **Data Consistency**: Strong consistency on financial transactions; Eventual consistency on catalog and analytics.

---

## 2. Component Specifications

### 2.1 Kong API Gateway (\`gateway-1\`)
- **Role**: Rate limiting (100 req/min per IP), JWT signature validation, and SSL termination.
- **Upstreams**: \`auth-service:50051\`, \`order-service:8080\`.

### 2.2 Order Processing Service (\`order-service\`)
- **Language**: TypeScript / Node.js 20 LTS
- **Core Endpoints**:
  - \`POST /api/v1/orders/checkout\` (Validates cart, reserves inventory)
  - \`GET /api/v1/orders/:id\` (Returns enriched order payload)
- **Caching Strategy**: Cache-aside with Redis (5-minute TTL on stock count).

### 2.3 Event Bus & Queues (\`payment-queue\`)
- **Engine**: Apache Kafka 3.6
- **Topics**:
  - \`orders.created\` (Partitioned by \`customer_id\`)
  - \`payments.captured\` (Consumed by Email & Fulfillment services)

---

## 3. Resilience & Disaster Recovery
1. **Circuit Breakers**: Envoy-managed circuit breaking tripping when error rate exceeds 5% in 10s.
2. **Database Failover**: Aurora PostgreSQL warm-standby replica with automated DNS failover in < 30s.
3. **Dead Letter Queue (DLQ)**: Failed payment processing messages are dumped to an S3 cold storage queue for manual review.
`,
    mermaidCode: `graph LR
    Client["Next.js Web / Mobile"] -->|"HTTPS / TLS 1.3"| Gateway["Kong API Gateway"]
    Gateway -->|"gRPC"| Auth["Auth & Identity Service"]
    Gateway -->|"REST / JSON"| Orders["Order Processing Service"]
    Orders -->|"Produce Event"| Kafka["Kafka Event Stream"]
    Orders -->|"Cache Lookup"| Redis["Redis Cluster Cache"]
    Orders -->|"ACID Writes"| Postgres["Primary Postgres DB"]
`
  },
  {
    id: 'ai-streaming-pipeline',
    name: 'Real-Time Voice & LLM Streaming Pipeline',
    description: 'Ultra-low latency audio ingestion pipeline with Wispr Flow integration, Vector DB retrieval, and chunked streaming.',
    nodes: [
      {
        id: 'voice-client',
        type: 'custom',
        position: { x: 50, y: 180 },
        data: {
          label: 'Wispr Flow Voice Ingress',
          type: 'client',
          description: 'Client microphone streaming 16kHz PCM audio over secure WebSockets.',
          tech: 'WebRTC / WSS',
          latency: '15ms',
          throughput: 'Real-time',
        },
      },
      {
        id: 'audio-processor',
        type: 'custom',
        position: { x: 330, y: 180 },
        data: {
          label: 'Audio Frame Normalizer',
          type: 'service',
          description: 'Noise suppression, VAD (Voice Activity Detection), and chunking.',
          tech: 'Rust / WebAssembly',
          latency: '8ms',
          throughput: '10k streams',
        },
      },
      {
        id: 'whisper-engine',
        type: 'custom',
        position: { x: 620, y: 70 },
        data: {
          label: 'Wispr Speech Model',
          type: 'ai',
          description: 'Ultra-fast speech-to-text token transcription with context biasing.',
          tech: 'TensorRT-LLM',
          latency: '95ms',
          throughput: '2.5k tok/s',
        },
      },
      {
        id: 'agent-orchestrator',
        type: 'custom',
        position: { x: 620, y: 260 },
        data: {
          label: 'Agentic Core Engine',
          type: 'ai',
          description: 'Prompt evaluation, tool calling dispatch, and DAG graph generation.',
          tech: 'Python / LangChain',
          latency: '120ms',
          throughput: '1.2k req/s',
        },
      },
      {
        id: 'vector-memory',
        type: 'custom',
        position: { x: 920, y: 70 },
        data: {
          label: 'Milvus Vector Store',
          type: 'database',
          description: 'HNSW vector index for semantic long-term memory & context recall.',
          tech: 'Milvus / Qdrant',
          latency: '6ms',
          throughput: '20k QPS',
        },
      },
      {
        id: 'sse-streamer',
        type: 'custom',
        position: { x: 920, y: 260 },
        data: {
          label: 'SSE Delta Dispatcher',
          type: 'gateway',
          description: 'Streams token deltas and canvas updates back to client UI.',
          tech: 'Node / HTTP/2',
          latency: '2ms',
          throughput: '35k clients',
        },
      },
    ],
    edges: [
      { id: 'ai-e1', source: 'voice-client', target: 'audio-processor', label: 'WebSocket Stream', animated: true, style: { stroke: '#ec4899', strokeWidth: 2 } },
      { id: 'ai-e2', source: 'audio-processor', target: 'whisper-engine', label: 'PCM Audio Chunks', animated: true, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'ai-e3', source: 'whisper-engine', target: 'agent-orchestrator', label: 'Streaming Tokens', animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } },
      { id: 'ai-e4', source: 'agent-orchestrator', target: 'vector-memory', label: 'RAG Embeddings', animated: true, style: { stroke: '#10b981', strokeWidth: 2 } },
      { id: 'ai-e5', source: 'agent-orchestrator', target: 'sse-streamer', label: 'Token Deltas', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
      { id: 'ai-e6', source: 'sse-streamer', target: 'voice-client', label: 'Client Canvas Updates', animated: true, style: { stroke: '#ec4899', strokeWidth: 2, strokeDasharray: '5,5' } },
    ],
    specMarkdown: `# Real-Time Voice & LLM Streaming Architecture Spec

## 1. Overview
VoiceArchitect leverages **Wispr Flow** audio ingestion to stream user voice commands into low-latency token generators. End-to-end latency from voice utterance to screen rendering is targetted under **250ms**.

---

## 2. Ingestion & Pipeline
- **Input Sampling**: 16kHz Mono 16-bit PCM over WSS.
- **VAD Threshold**: 350ms silence detection before dispatching chunk boundaries.
- **Model Inference**: Quantized speech-to-text inference running on NVIDIA H100 with TensorRT.

---

## 3. Real-Time Canvas Updates
Token deltas are emitted via Server-Sent Events (SSE). The frontend listener parses AST graph diffs and dynamically updates React Flow nodes without re-rendering the entire canvas.
`,
    mermaidCode: `graph LR
    Voice["Wispr Flow Voice Ingress"] -->|"WebSocket Stream"| Audio["Audio Frame Normalizer"]
    Audio -->|"PCM Audio Chunks"| Whisper["Wispr Speech Model"]
    Whisper -->|"Streaming Tokens"| Agent["Agentic Core Engine"]
    Agent -->|"RAG Embeddings"| Milvus["Milvus Vector Store"]
    Agent -->|"Token Deltas"| SSE["SSE Delta Dispatcher"]
    SSE -.->|"Canvas Updates"| Voice
`
  }
];

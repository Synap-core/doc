---
sidebar_position: 4
---

# AI Architecture

**Intelligence Services & Composable AI**

---

## Overview

Synap's AI architecture is built on three key principles:

1. **External Intelligence Services**: AI runs as separate services, not embedded agents
2. **Composable Entities**: AI assembles Lego-like building blocks (entities/documents)
3. **Human-in-the-Loop**: AI proposals require human validation (via proposals system)

---

## Intelligence Services Model

### The Architecture

Unlike traditional apps with built-in AI, Synap provides a **platform** for connecting external AI services:

```
User → Data Pod (Your Data) → Hub Protocol → Intelligence Service (Your AI)
                                                    ↓
                                             ANY AI Model
                                      (GPT-4, Claude, Llama, Custom)
                                                    ↓
                                            Insights/Entities
                                                    ↓
                                    ← Hub Protocol ← Data Pod
```

### Why External Services?

| Traditional (Built-in AI) | Synap (External Services) |
|---------------------------|---------------------------|
| One AI model for everyone | **Your choice of AI** |
| Vendor lock-in | **Swap anytime** |
| Can't use proprietary models | **Keep your IP private** |
| Scales with app | **Scales independently** |
| Generic intelligence | **Specialized agents** |

### How It Works

1. **Developer builds a service** (Node.js, Python, anything)
2. **Service implements Hub Protocol client**
3. **Service requests Data Pod access** (per-user, per-request)
4. **Service processes with ANY AI**
5. **Service submits insights** → Proposals (human review)

**Reference Implementation**: `services/intelligence/` in backend repo

---

## AI as Lego Assembler

Intelligence Services don't write to a database - they **assemble Lego bricks**:

### The Bricks

- **Entities**: Tasks, notes, files, people (metadata)
- **Documents**: Content (markdown, code, PDFs)
- **Relations**: Links between entities
- **Views**: Different perspectives on entities

### How AI Assembles

```typescript
// Intelligence Service reads entities
const userNotes = await hubProtocol.queryEntities({
  type: "note",
  filters: { updatedAfter: "2024-01-01" }
});

// AI processes
const analysis = await yourAI.analyze(userNotes);

// AI proposes new entities
await hubProtocol.createEntity({
  type: "task",
  title: "Review Q1 notes",
  metadata: {
    aiGenerated: true,
    confidence: 0.85,
    reasoning: "Found pattern in recent notes"
  }
});

// AI proposes relations
await hubProtocol.createRelation({
  from: "note-123",
  to: "task-456",
  type: "derived_from"
});
```

**Result**: New entities appear in user's workspace as **proposals** awaiting approval.

---

## Human-in-the-Loop (Proposals)

The unique advantage of Synap's event-sourced architecture is **native human-in-the-loop**:

### Traditional AI Systems

```
AI creates data → Directly writes to DB
```

Problem: User can't review before it's "real".

### Synap's Proposal System

```
1. AI → hubProtocol.createEntity() → event: entity.creation.requested
2. Worker → Creates Proposal (status: pending)
3. User → Reviews in UI (sees AI reasoning, confidence)
4. User → Approves → Worker converts to real entity
5. User → Rejects → Stays in proposals table for audit
```

### Proposal Lifecycle

```typescript
// Proposal object
{
  id: "prop-123",
  workspaceId: "user-workspace",
  targetType: "entity",
  status: "pending", // or "validated", "rejected"
  request: {
    type: "task",
    title: "AI-suggested task",
    metadata: {
      aiGenerated: true,
      confidence: 0.85,
      reasoning: "User mentioned in chat"
    }
  },
  createdAt: "2024-01-15T10:00:00Z"
}
```

### Why This Works

Only possible because of **event sourcing**:

- Events have lifecycle states (`requested` → `validated`)
- Proposals are a separate table
- State transitions are events themselves
- Complete audit trail

No other system can do this cleanly because they use **direct database writes**.

---

## Building an Intelligence Service

### 1. Setup

```bash
# Your service (Node.js example)
mkdir my-ai-service
cd my-ai-service
npm init -y
npm install @synap/hub-protocol hono
```

### 2. Implement Hub Protocol Client

```typescript
// src/index.ts
import { Hono } from 'hono';
import { HubProtocolClient } from '@synap/hub-protocol';

const app = new Hono();

app.post('/analyze', async (c) => {
  const { threadId, dataPodUrl, apiKey } = await c.req.json();
  
  // 1. Connect to user's Data Pod
  const hub = new HubProtocolClient(dataPodUrl, apiKey);
  
  // 2. Read user data
  const context = await hub.getThreadContext({ threadId });
  const userNotes = await hub.queryEntities({ type: "note" });
  
  // 3. Process with YOUR AI (any model)
  const analysis = await myCustomAI.analyze({
    conversation: context,
    notes: userNotes
  });
  
  // 4. Submit insights as proposals
  for (const suggestion of analysis.suggestions) {
    await hub.createEntity({
      type: suggestion.type,
      title: suggestion.title,
      metadata: {
        aiGenerated: true,
        confidence: suggestion.confidence,
        reasoning: suggestion.reasoning
      }
    });
  }
  
  return c.json({ success: true, suggestionsCount: analysis.suggestions.length });
});

export default app;
```

### 3. Register with Data Pod

```typescript
// Register your service
await fetch(`${dataPodUrl}/trpc/intelligenceRegistry.register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "My AI Analyzer",
    endpoint: "https://my-ai-service.com/analyze",
    capabilities: ["entity_creation", "semantic_analysis"]
  })
});
```

### 4. Deploy Anywhere

- **Cloud Functions**: AWS Lambda, Cloudflare Workers
- **Containers**: Docker, Kubernetes
- **VPS**: Your own server
- **Local**: ngrok for development

---

## Internal Agents (Optional)

For tight integrations, you can use **LangGraph** inside the Data Pod:

### LangGraph State Machine

```typescript
// packages/ai/src/agents/my-agent.ts
import { StateGraph, Annotation } from '@langchain/langgraph';

const AgentState = Annotation.Root({
  messages: Annotation<string[]>(),
  context: Annotation<any>()
});

export function createMyAgent() {
  const graph = new StateGraph(AgentState);
  
  graph.addNode('analyze', async (state) => {
    // Your logic
    return { ...state, result: "..." };
  });
  
  graph.addNode('act', async (state) => {
    // Create entities via events
    return state;
  });
  
  graph.setEntryPoint('analyze');
  graph.addEdge('analyze', 'act');
  
  return graph.compile();
}
```

### Integration

```typescript
// packages/api/src/routers/my-router.ts
import { createMyAgent } from '@synap/ai';

export const myRouter = router({
  runAgent: protectedProcedure
    .mutation(async ({ ctx }) => {
      const agent = createMyAgent();
      const result = await agent.invoke({ messages: [] });
      
      // Agent emits events internally
      return result;
    })
});
```

**Use internal agents when**:
- Tight coupling needed
- Low latency critical
- Simple logic

**Use external services when**:
- Need proprietary models
- Require GPU infrastructure
- Want independent scaling
- Building multi-tenant AI

---

## Current Implementation

### Vercel AI SDK + LangGraph

The backend uses:

- **LangGraph**: State machine orchestration
- **Vercel AI SDK**: Type-safe LLM calls
- **Zod schemas**: Structured outputs

```typescript
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const result = await generateObject({
  model: anthropic('claude-3-haiku-20240307'),
  schema: z.object({
    intent: z.enum(['capture', 'command', 'query']),
    confidence: z.number()
  }),
  prompt: userMessage
});
```

**See**: [Event Metadata](./events/event-metadata.md) for AI metadata structure

---

## Comparison

| Feature | Internal (LangGraph) | External (Intelligence Service) |
|---------|---------------------|--------------------------------|
| **Deployment** | Inside Data Pod | Separate infrastructure |
| **AI Models** | Anthropic/OpenAI via API | **ANY** (GPT, Claude, Llama, custom) |
| **Latency** | Lower | Higher (network hop) |
| **Scalability** | Limited | Independent |
| **Cost** | API calls | **Your infrastructure** |
| **Proprietary IP** | Shared codebase | **Private** |
| **Multi-tenancy** | Hard | **Built-in** (per-user credentials) |

---

## Best Practices

1. **Use External Services for production AI** - Better isolation, scaling
2. **Use Internal Agents for simple utilities** - Lower latency
3. **Always use Proposals for AI actions** - Human verification
4. **Store AI metadata** - `aiGenerated`, `confidence`, `reasoning`
5. **Design for multi-tenant** - Each user has unique Data Pod credentials

---

**Next**:
- [Hub Protocol Flow](./hub-protocol-flow.md) - Technical implementation
- [Composable Architecture](../concepts/composable-architecture.md) - Lego philosophy
- [Building AI Agents](../development/ai/building-agents.md) - Development guide

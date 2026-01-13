---
sidebar_position: 6
---

# Building AI Agents

**How to Add Intelligence to Synap**

---

## The Intelligence Services Model

Synap's AI architecture is different: **AI runs as external services**, not embedded code.

### Why External?

| Traditional (Built-in) | Synap (External Services) |
|------------------------|---------------------------|
| One AI model | **Your choice of model** |
| Vendor lock-in | **Swap anytime** |
| Can't use proprietary models | **Keep your IP** |
| Scales with app | **Scale independently** |

### The Flow

```
User → Data Pod → Hub Protocol → Your Intelligence Service
                                        ↓
                                  ANY AI Model
                                  (GPT-4, Claude, Llama, Custom)
                                        ↓
                                  Entities/Proposals
                                        ↓
                        ← Hub Protocol ← Data Pod
```

---

## Quick Decision Tree

```
Building AI for Synap?
├─ Need proprietary AI? → Intelligence Service (recommended)
├─ Need GPU infrastructure? → Intelligence Service
├─ Want to use local models? → Intelligence Service
├─ Simple utility? → Internal Agent (LangGraph)
└─ Just testing? → tRPC mutation with AI SDK
```

---

## Option 1: Intelligence Service (Recommended)

**Best for**: Production AI, proprietary models, independent scaling

### 1. Create Your Service

```bash
mkdir my-intelligence-service
cd my-intelligence-service
npm init -y
npm install @synap/hub-protocol hono
```

### 2. Implement the Service

```typescript
// src/index.ts
import { Hono } from 'hono';
import { HubProtocolClient } from '@synap/hub-protocol';
import OpenAI from 'openai'; // or any AI library

const app = new Hono();

app.post('/analyze', async (c) => {
  const { threadId, dataPodUrl, apiKey } = await c.req.json();
  
  // 1. Connect to user's Data Pod
  const hub = new HubProtocolClient(dataPodUrl, apiKey);
  
  // 2. Read context
  const thread = await hub.getThreadContext({ threadId });
  const userNotes = await hub.queryEntities({ 
    type: "note",
    filters: { tags: ["project-x"] }
  });
  
  // 3. Process with YOUR AI
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a project analyzer." },
      { role: "user", content: `Analyze: ${JSON.stringify(userNotes)}` }
    ]
  });
  
  const analysis = completion.choices[0].message.content;
  
  // 4. Submit insights as proposals
  await hub.createEntity({
    type: "note",
    title: "Project Analysis",
    content: analysis,
    metadata: {
      aiGenerated: true,
      model: "gpt-4",
      confidence: 0.9,
      reasoning: "Analyzed project notes for insights"
    }
  });
  
  return c.json({ success: true });
});

export default app;
```

### 3. Deploy Anywhere

- **Cloudflare Workers**: Serverless, global edge
- **AWS Lambda**: Serverless, AWS ecosystem
- **Railway**: One-click deploy
- **Your VPS**: Full control
- **Local (ngrok)**: Development

### 4. Register with Data Pod

```typescript
// Service startup
await fetch(`${dataPodUrl}/trpc/intelligenceRegistry.register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    serviceId: 'my-analyzer',
    name: 'Project Analyzer',
    capabilities: ['entity_creation', 'semantic_analysis'],
    webhookUrl: 'https://my-service.com/analyze'
  })
});
```

### 5. Frontend Integration

Users can invoke your service:

```typescript
// Frontend
const response = await client.intelligenceServices.invoke({
  serviceId: 'my-analyzer',
  threadId: currentThread.id
});
```

---

## Option 2: Internal Agent (LangGraph)

**Best for**: Simple utilities, tight integration, open-source contributions

### When to Use Internal

- No proprietary logic
- Simple AI calls
- Contributing to core
- Low latency critical

### Example: Note Summarizer

```typescript
// packages/ai/src/agents/summarizer.ts
import { StateGraph, Annotation } from '@langchain/langgraph';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const SummarizerState = Annotation.Root({
  noteId: Annotation<string>(),
  content: Annotation<string>(),
  summary: Annotation<string>()
});

export function createSummarizer() {
  const graph = new StateGraph(SummarizerState);
  
  graph.addNode('fetch', async (state) => {
    // Fetch note from DB
    const note = await db.query.entities.findFirst({
      where: eq(entities.id, state.noteId)
    });
    return { ...state, content: note.content };
  });
  
  graph.addNode('summarize', async (state) => {
    const result = await generateObject({
      model: anthropic('claude-3-haiku-20240307'),
      schema: z.object({
        summary: z.string(),
        keyPoints: z.array(z.string())
      }),
      prompt: `Summarize: ${state.content}`
    });
    
    return { ...state, summary: result.object.summary };
  });
  
  graph.addNode('save', async (state) => {
    // Emit event to create summary entity
    await eventBus.emit('entity.creation.requested', {
      type: 'note',
      title: `Summary: ${state.noteId}`,
      content: state.summary,
      metadata: { aiGenerated: true }
    });
    
    return state;
  });
  
  graph.setEntryPoint('fetch');
  graph.addEdge('fetch', 'summarize');
  graph.addEdge('summarize', 'save');
  
  return graph.compile();
}
```

### Register in Router

```typescript
// packages/api/src/routers/notes.ts
import { createSummarizer } from '@synap/ai';

export const notesRouter = router({
  summarize: protectedProcedure
    .input(z.object({ noteId: z.string() }))
    .mutation(async ({ input }) => {
      const agent = createSummarizer();
      await agent.invoke({ noteId: input.noteId });
      
      return { success: true };
    })
});
```

---

## Option 3: Simple AI Call (Vercel AI SDK)

**Best for**: One-off AI features, prototyping

### Example: Smart Tags

```typescript
// packages/api/src/routers/entities.ts
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export const entitiesRouter = router({
  generateTags: protectedProcedure
    .input(z.object({ content: z.string() }))
    .mutation(async ({ input }) => {
      const result = await generateObject({
        model: anthropic('claude-3-haiku-20240307'),
        schema: z.object({
          tags: z.array(z.string()),
          confidence: z.number()
        }),
        prompt: `Suggest tags for: ${input.content}`
      });
      
      // Emit event for each tag
      for (const tag of result.object.tags) {
        await ctx.events.emit('tag.creation.requested', {
          name: tag,
          metadata: { aiGenerated: true }
        });
      }
      
      return result.object;
    })
});
```

---

## Proposals: Human-in-the-Loop

All AI-created entities start as **proposals** awaiting user approval.

### The Flow

```
1. Intelligence Service → hubProtocol.createEntity()
2. Backend → Creates Proposal (status: pending)
3. User → Reviews in UI
4. User → Approves → Real entity created
5. User → Rejects → Stays for audit
```

### Why Proposals?

- **Review before commit**: See what AI wants to create
- **Confidence scores**: AI explains its reasoning
- **Audit trail**: Track all AI suggestions
- **Undo capability**: Reject bad suggestions

### Proposal API

```typescript
// Intelligence Service creates proposal
await hubProtocol.createEntity({
  type: "task",
  title: "Follow up with client",
  metadata: {
    aiGenerated: true,
    confidence: 0.75,
    reasoning: "Detected action item in meeting notes",
    source: "meeting-note-123"
  }
});

// User sees in proposal inbox
{
  id: "prop-456",
  status: "pending",
  targetType: "entity",
  request: { /* entity data */ },
  createdAt: "2024-01-15T10:00:00Z"
}

// User approves
await client.proposals.approve({ proposalId: "prop-456" });

// Now it's a real entity
```

---

## AI Metadata Standard

Always include AI context in metadata:

```typescript
metadata: {
  aiGenerated: true,              // Required: marks as AI-created
  model: "gpt-4",                  // Which model
  confidence: 0.85,                // 0-1 confidence score
  reasoning: "Found in notes...",  // Explain why created
  source: "entity-123",            // What triggered it
  timestamp: "2024-01-15T10:00:00Z"
}
```

This enables:
- UI badges ("AI-suggested")
- Filtering (show only high-confidence)
- Debugging (trace AI reasoning)
- Analytics (which AI performs best)

---

## Real Examples

### 1. Meeting Notes Analyzer

**Intelligence Service** that:
1. Reads meeting notes
2. Extracts action items → Tasks
3. Identifies attendees → Person entities
4. Creates relations (Task → Person)

All as **proposals** for user review.

### 2. Knowledge Graph Builder

**Intelligence Service** that:
1. Reads all user notes
2. Finds semantic connections
3. Proposes relations between notes
4. Generates summary notes

User reviews and approves connections.

### 3. Smart Inbox

**Internal Agent** that:
1. Monitors inbox items
2. Classifies by type
3. Suggests tags
4. Routes to projects

Runs on every inbox item creation.

---

## Deployment Patterns

### Development

```bash
# Run service locally
npm run dev

# Expose via ngrok
ngrok http 3000

# Register with Data Pod
curl -X POST http://localhost:3001/trpc/intelligenceRegistry.register \
  -d '{"webhookUrl": "https://xyz.ngrok.io/analyze"}'
```

### Production

#### Cloudflare Workers

```bash
npm install wrangler -g
wrangler init
wrangler publish
```

#### Docker

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["npm", "start"]
```

```bash
docker build -t my-intelligence-service .
docker run -p 3000:3000 my-intelligence-service
```

---

## Testing

### Test Intelligence Service Locally

```typescript
// test/analyze.test.ts
import { HubProtocolClient } from '@synap/hub-protocol';

describe('Analyzer Service', () => {
  it('creates proposals', async () => {
    const hub = new HubProtocolClient(
      'http://localhost:3001',
      'test-api-key'
    );
    
    const response = await fetch('http://localhost:3000/analyze', {
      method: 'POST',
      body: JSON.stringify({
        threadId: 'test-thread',
        dataPodUrl: 'http://localhost:3001',
        apiKey: 'test-api-key'
      })
    });
    
    expect(response.status).toBe(200);
    
    // Check proposals were created
    const proposals = await hub.getProposals();
    expect(proposals.length).toBeGreaterThan(0);
  });
});
```

---

## Best Practices

1. **Use Intelligence Services for production** - Better separation, scaling
2. **Use Internal Agents sparingly** - Only for simple utilities
3. **Always create proposals** - Never write directly
4. **Include metadata** - Confidence, reasoning, model
5. **Test with real Data Pods** - Use Hub Protocol SDK
6. **Version your APIs** - Service endpoints can change
7. **Monitor confidence scores** - Track AI performance

---

## Next Steps

1. **Choose your approach** (Intelligence Service recommended)
2. **Read Hub Protocol docs** → [Hub Protocol Flow](../../architecture/hub-protocol-flow.md)
3. **See composability** → [Composable Architecture](../../concepts/composable-architecture.md)
4. **Build and deploy**

---

**Resources**:
- [Hub Protocol SDK](https://github.com/synap-core/hub-protocol-sdk)
- [Intelligence Services Examples](https://github.com/synap-core/intelligence-services)
- [Event Architecture](../../architecture/events/event-architecture.md)

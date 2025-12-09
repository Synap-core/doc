---
sidebar_position: 6
---

# Synap SDK Architecture Strategy

> [!NOTE]
> **Architecture Vision & Roadmap**
>
> This document describes both the **current implementation** and **future vision** for the Synap SDK architecture. Current status indicators (✅ Implemented, 🚧 In Progress, 📋 Planned) are used throughout.

---

## Core Philosophy: Open & Extensible

The Synap SDK architecture is built on a fundamental principle:

**The Data Pod is an open platform that anyone can extend with custom intelligence layers.**

- **Foundation Layer** (`@synap/client`) - OSS data access, available to everyone
- **Intelligence Layers** - Pluggable AI/automation services (anyone can build their own)
- **Reference Implementation** (`@synap/hub-sdk`) - Our proprietary example of what's possible

### Why This Matters

1. **Developer Freedom** - Build your own intelligence layer with custom AI models
2. **Multiple Layers** - Run multiple intelligence services on the same Data Pod
3. **No Lock-In** - The foundation is open source and fully functional on its own
4. **Community Innovation** - Third parties can create specialized intelligence layers

---

## 1. Package Architecture (Current Implementation)

### ✅ Implemented Structure

| Feature | Open Source (`@synap/client`) | Proprietary (`@synap/hub-sdk`) | Unified (`@synap/sdk`) |
|---------|-------------------------------|--------------------------------|------------------------|
| **Install** | `pnpm add @synap/client` | `pnpm add @synap/hub-sdk` | `pnpm add @synap/sdk` |
| **Base Class** | `SynapClient` | `SynapHubClient` (extends `SynapClient`) | Re-exports both |
| **Data Access** | Direct to Data Pod (tRPC) | Inherits all | Inherits all |
| **Auth** | Kratos / Tokens | Inherits | Inherits |
| **Realtime** | WebSockets (Events) | Inherits + AI Streams | Inherits all |
| **Intelligence** | ❌ Build your own | ✅ `.intelligence` facade | ✅ `.intelligence` facade |
| **Views** 📋 | ❌ (Raw Data) | 📋 Planned (`.views`) | 📋 Planned |

---

## 2. Package Breakdown

### A. The Core: `@synap/client` (OSS)
This package is already largely implemented in `synap-backend/packages/client`. It focuses on **Data Access**.

**Structure:**
```typescript
export class SynapClient {
  public readonly rpc: TRPCClient<AppRouter>; // Raw access
  public readonly notes: NotesFacade;         // Semantic access
  public readonly entities: EntitiesFacade;   // Generic access
  public readonly files: FilesFacade;         // File operations
  public readonly realtime: RealtimeManager;  // Events
}
```

**Use Case:** Building a custom CRM, a Note-taking app, or a dashboard where you write your own UI and logic.

### B. The Intelligence Layer: `@synap/hub-sdk` (Proprietary) ✅

Our proprietary SDK demonstrating what's possible with an intelligence layer.

**Current Implementation:**
```typescript
import { SynapClient } from '@synap/client';
import { IntelligenceClient } from './intelligence';

// Extends OSS client with intelligence capabilities
export class SynapHubClient extends SynapClient {
  public readonly intelligence: IntelligenceClient;

  constructor(config: HubSDKConfig) {
    super(config);
    this.intelligence = new IntelligenceClient(config);
  }
}

// Intelligence facade
class IntelligenceClient {
  async chat(message: string, options): Promise<OrchestrateResponse>;
  async approveProposals(proposals: Proposal[]): Promise<ApproveResponse>;
  rejectProposal(proposalId: string): void;
  async healthCheck(): Promise<boolean>;
}
```

---

## 3. Intelligence Integration (`.intelligence` facade)

### ✅ Current Implementation

The Hub SDK exposes AI orchestration through the `intelligence` facade:

```typescript
import { SynapHubClient } from '@synap/hub-sdk';

const client = new SynapHubClient({
  url: 'http://localhost:3000',
  hubUrl: 'http://localhost:3001',
  getToken: async () => getToken()
});

// Chat with AI orchestrator
const response = await client.intelligence.chat(
  'Create a task to call John',
  { userId: 'user-123', threadId: 'thread-abc' }
);

// Response includes thinking steps and proposals
if (response.success) {
  console.log(response.thinkingSteps);  // AI reasoning process
  console.log(response.proposals);      // Proposed actions
  
  // Approve proposals (human-in-the-loop)
  await client.intelligence.approveProposals(response.proposals);
}
```

### 📋 Future Vision: Enhanced Intelligence APIs

Planned extensions to the intelligence facade:

```typescript
// Semantic search (hybrid embedding + keyword)
const results = await client.intelligence.search('revenue last quarter');

// RAG (Retrieval Augmented Generation)
const answer = await client.intelligence.ask('Summarize the meeting with Acme Corp');

// Content generation
const draft = await client.intelligence.generate({
  type: 'email',
  context: { entityId: 'contact_123', intent: 'follow_up' }
});
```

---

## 4. Building Custom Intelligence Layers

### The Extensibility Principle

Anyone can build their own intelligence layer on top of `@synap/client`. Here's how:

### Example: Custom AI Service

```typescript
import { SynapClient, type SynapClientConfig } from '@synap/client';

class MyIntelligenceSDK extends SynapClient {
  public readonly ai: MyAIFacade;

  constructor(config: SynapClientConfig & { openaiKey: string }) {
    super(config);
    this.ai = new MyAIFacade(this.rpc, config.openaiKey);
  }
}

class MyAIFacade {
  constructor(
    private rpc: any,
    private openaiKey: string
  ) {}

  async chat(message: string) {
    // 1. Get context from Data Pod
    const notes = await this.rpc.notes.list.query({ limit: 10 });
    
    // 2. Call your AI service (OpenAI, Anthropic, etc.)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openaiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: `Context: ${JSON.stringify(notes)}` },
          { role: 'user', content: message }
        ]
      })
    });
    
    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // 3. Store AI response in Data Pod
    await this.rpc.chat.sendMessage.mutate({
      content: aiResponse,
      threadId: 'ai-chat'
    });
    
    return aiResponse;
  }
}

// Usage
const mySDK = new MyIntelligenceSDK({
  url: 'http://localhost:3000',
  getToken: async () => getToken(),
  openaiKey: process.env.OPENAI_API_KEY
});

await mySDK.ai.chat('Help me organize my tasks');
```

### What You Get from the Data Pod

When building your intelligence layer, you have full access to:

- **tRPC APIs** - All Data Pod operations via `client.rpc.*`
- **WebSocket Events** - Real-time data change notifications
- **Event Log** - Publish and subscribe to custom events
- **File Storage** - Upload and retrieve files
- **Type Safety** - Full TypeScript support

### Example Use Cases

1. **Custom AI** - OpenAI, Anthropic, local LLMs (LLaMA, Mistral)
2. **Workflow Automation** - n8n, Zapier, Make.com integrations
3. **Analytics** - Data analysis, visualization, reporting
4. **Search** - Custom semantic search with embeddings
5. **Specialized Agents** - Domain-specific AI assistants (legal, medical, finance)

---

## 5. Future: View Generation (`.views`) 📋

### Vision

Dynamic view configurations that tell applications how to render data.

### The Problem
Raw data (`{ "type": "invoice", "amount": 100 }`) requires custom code for every type.

### The Solution
The SDK fetches not just data, but *how to render it*.

**Planned API:**
```typescript
// Get entity with view configuration
const entity = await synap.views.get('entity_123', 'summary');

// Result includes rendering instructions
{
  id: 'entity_123',
  type: 'invoice',
  component: 'Card',
  props: {
    title: 'Invoice #123',
    subtitle: '$100.00',
    statusColor: 'green'
  },
  actions: ['pay', 'download_pdf']
}
```

**AI-Generated Views:**
```typescript
// Generate view on-the-fly for unknown data
const view = await synap.views.generate(unknownData, 'mobile_card');
```

---

## 6. Implementation Roadmap

### ✅ Phase 1: Foundation (Completed)
- [x] OSS Data Pod SDK (`@synap/client`) with facades
- [x] tRPC APIs for all data operations
- [x] React integration (`@synap/client/react`)
- [x] WebSocket support for real-time events
- [x] Authentication (Kratos + API keys)

### ✅ Phase 2: Intelligence Layer (Completed)
- [x] Hub SDK (`@synap/hub-sdk`) with `intelligence` facade
- [x] AI orchestration with thinking steps
- [x] Proposal management (human-in-the-loop)
- [x] Unified SDK (`@synap/sdk`) re-exporting both packages

### 🚧 Phase 3: Enhanced Intelligence (In Progress)
- [ ] WebSocket streaming for AI responses
- [ ] Semantic search API
- [ ] RAG (Retrieval Augmented Generation)
- [ ] Content generation APIs

### 📋 Phase 4: View Definitions (Planned)
- [ ] Define JSON Schema for view configurations
- [ ] Add `views` table or metadata field
- [ ] Create `.views` facade in Hub SDK
- [ ] UI component library for view rendering
- [ ] AI-powered view generation

---

## 7. Real-World Examples

### Example 1: Current Scalar Ring Implementation

```typescript
import { SynapHubClient } from '@synap/sdk';

const client = new SynapHubClient({
  url: process.env.NEXT_PUBLIC_BACKEND_URL,
  hubUrl: process.env.NEXT_PUBLIC_HUB_URL,
  getToken: async () => getSessionToken()
});

// Use Data Pod features
await client.notes.create({ content: '# Note', title: 'Note' });

// Use Intelligence features
const response = await client.intelligence.chat('Create a task');
```

### Example 2: Custom n8n Intelligence Layer

```typescript
import { SynapClient } from '@synap/client';

class N8NIntelligenceSDK extends SynapClient {
  public readonly workflows: N8NFacade;
  
  constructor(config) {
    super(config);
    this.workflows = new N8NFacade(this.rpc, config.n8nUrl);
  }
}

class N8NFacade {
  async trigger(workflowId: string, data: any) {
    // Trigger n8n workflow with Data Pod context
    const notes = await this.rpc.notes.list.query({ limit: 10 });
    
    await fetch(`${this.n8nUrl}/webhook/${workflowId}`, {
      method: 'POST',
      body: JSON.stringify({ data, context: notes })
    });
  }
}
```

### Example 3: Future with View Engine 📋

```typescript
import { SynapHubClient } from '@synap/sdk';

const app = new SynapHubClient({ ... });

function EntityCard({ id }) {
  // Fetch data + rendering instructions
  const { data, view } = app.views.useEntity(id);

  // Render based on view config
  if (view.type === 'kanban_card') return <KanbanCard {...view.props} />;
  if (view.type === 'document_row') return <DocRow {...view.props} />;
  
  // AI actions
  return (
    <GenericCard>
      {data.title}
      <Button onClick={() => app.intelligence.chat(`Summarize ${id}`)}>
        Summarize
      </Button>
    </GenericCard>
  );
}
```

---

## Summary

### Core Principles

1. **Open Foundation** - `@synap/client` is OSS and fully functional
2. **Extensible Architecture** - Anyone can build intelligence layers
3. **Multiple Layers** - Run multiple intelligence services simultaneously
4. **No Lock-In** - Foundation is independent of proprietary features
5. **Reference Implementation** - `@synap/hub-sdk` demonstrates possibilities

### Current State

- ✅ OSS Data Pod SDK with full tRPC APIs
- ✅ Proprietary Hub SDK with AI orchestration
- ✅ Unified SDK combining both  
- ✅ React integration for both SDKs
- 🚧 Enhanced intelligence APIs (search, RAG, generation)
- 📋 View engine for dynamic UI rendering

### Build Your Own

The Data Pod provides everything you need to build custom intelligence layers:
- Full API access via tRPC
- Real-time WebSocket events
- File storage and retrieval
- Event-driven architecture
- Complete type safety

See the [Extensibility Guide](/docs/development/extensibility/extensibility-guide) to get started.

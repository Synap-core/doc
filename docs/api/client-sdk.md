---
sidebar_position: 1
title: Data Pod SDK
description: Open-source client for the Synap Data Pod
---

# Data Pod SDK (`@synap/client`)

The Data Pod SDK is the **Open Source** foundation of the Synap platform. It provides type-safe, high-level access to all core data operations in your personal Data Pod.

## Architecture: Extensible Intelligence Layers

Synap is designed with a clear separation between **data storage** and **intelligence processing**:

```mermaid
graph TB
    App[Your Application]
    Client[@synap/client<br/>OSS Data Pod SDK]
    Pod[Data Pod<br/>Storage, APIs, Events]
    IL1[Intelligence Layer 1<br/>Custom AI Service]
    IL2[Intelligence Layer 2<br/>Synap Hub SDK]
    IL3[Intelligence Layer 3<br/>n8n Workflows]
    
    App --> Client
    Client --> Pod
    IL1 -.-> Pod
    IL2 -.-> Pod
    IL3 -.-> Pod
    
    style Client fill:#4CAF50
    style Pod fill:#2196F3
    style IL1 fill:#FF9800,stroke-dasharray: 5 5
    style IL2 fill:#FF9800,stroke-dasharray: 5 5
    style IL3 fill:#FF9800,stroke-dasharray: 5 5
```

### Key Concepts

- **Data Pod** - Your personal data storage with tRPC APIs, WebSocket events, and file storage
- **@synap/client** - OSS SDK to interact with your Data Pod
- **Intelligence Layers** - Pluggable AI/automation services built on top (anyone can build their own!)

> [!NOTE]
> The Data Pod is **open and extensible**. You can build custom intelligence layers, integrate with existing AI services, or use our proprietary [Synap Hub SDK](#related-sdks) as a reference implementation.

---

## Installation

```bash
pnpm add @synap/client
```

---

## Initialization

```typescript
import { SynapClient } from '@synap/client';

const client = new SynapClient({
  url: 'http://localhost:3000', // Your Data Pod URL
  getToken: async () => {
    // Return your access token (or null for cookie-based auth)
    return await getSessionToken();
  }
});
```

### Authentication Options

1. **Session Cookies** (Browser) - Set `getToken: () => null` and ensure `credentials: 'include'`
2. **API Tokens** (Server/CLI) - Return token from `getToken()`
3. **Ory Kratos** (Recommended) - Use Kratos session cookies for browser auth

---

## API Architecture: Facades + Direct tRPC

The SDK provides two ways to interact with your Data Pod:

### 1. Facades (Recommended)

High-level, semantic methods for common operations:

```typescript
// Simple, intuitive API
await client.notes.create({ 
  content: '# My Note\n\nContent here',
  title: 'My Note' 
});
```

### 2. Direct tRPC Access (Advanced)

Full access to the underlying tRPC router:

```typescript
// Direct tRPC for advanced use cases
await client.rpc.notes.create.mutate({ 
  content: '# My Note',
  title: 'My Note' 
});
```

---

## Capabilities

### Notes

Manage markdown notes and documents.

```typescript
// Create a note
const result = await client.notes.create({
  content: '# New Idea\n\nCurrently thinking about...',
  title: 'New Idea',
  tags: ['ideas', 'planning']
});

// List notes
const notes = await client.notes.list({
  limit: 20,
  offset: 0,
  type: 'note' // or 'task' or 'all'
});

// Get a specific note
const note = await client.notes.get('note-id');
```

---

### Chat

Store and retrieve chat history (data storage only, no AI execution).

```typescript
// Send a message (stored in Data Pod)
const result = await client.chat.sendMessage({
  content: 'Hello world',
  threadId: 'thread-123' // optional
});

// Get thread history
const thread = await client.chat.getThread('thread-123');

// List all threads
const threads = await client.chat.listThreads();
```

> [!TIP]
> Chat persistence is separate from AI execution. To add intelligence, integrate with an [intelligence layer](#architecture-extensible-intelligence-layers) like the Synap Hub SDK or your custom AI service.

---

### Tasks

Manage todo lists and task items.

```typescript
// Complete a task
await client.tasks.complete('task-123');
```

> [!NOTE]
> The tasks facade uses the event-driven architecture under the hood, publishing `task.completion.requested` events.

---

### Capture

Quick thought capture for AI processing.

```typescript
// Capture a raw thought
await client.capture.thought('Remember to buy milk tomorrow');

// With context
await client.capture.thought('Call John about the project', {
  priority: 'high',
  category: 'work'
});
```

---

### System

Health checks and system information.

```typescript
// Health check
const health = await client.system.health();

// System info
const info = await client.system.info();
console.log(info.version, info.database, info.storage);
```

---

## React Integration

Use `@synap/client/react` for React hooks and components.

```tsx
import { createSynapReactClient } from '@synap/client/react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// 1. Create clients
const queryClient = new QueryClient();
const synap = createSynapReactClient({
  url: 'http://localhost:3000',
  getToken: async () => await getSessionToken()
});

// 2. Wrap your app
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotesApp />
    </QueryClientProvider>
  );
}

// 3. Use tRPC hooks
function NotesApp() {
  const { data: notes } = synap.notes.list.useQuery({ limit: 20 });
  const createNote = synap.notes.create.useMutation();

  const handleCreate = async () => {
    await createNote.mutateAsync({
      content: '# New Note',
      title: 'New Note'
    });
  };

  return (
    <div>
      {notes?.map(note => (
        <div key={note.id}>{note.title}</div>
      ))}
      <button onClick={handleCreate}>Create Note</button>
    </div>
  );
}
```

---

## WebSocket Streaming

Subscribe to real-time updates from your Data Pod.

```typescript
const userId = 'user-123';
const wsUrl = client.getRealtimeUrl(userId);

const ws = new WebSocket(wsUrl);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

> [!IMPORTANT]
> WebSocket authentication requires a valid session. Ensure your user is authenticated before connecting.

---

## Building Custom Intelligence Layers

The Data Pod SDK is designed to be extended. You can build your own intelligence layer on top:

### Example: Custom AI Service

```typescript
import { SynapClient } from '@synap/client';

class MyAIService {
  constructor(private dataPod: SynapClient) {}

  async processThought(thought: string) {
    // 1. Store in Data Pod
    await this.dataPod.capture.thought(thought);

    // 2. Your custom AI logic
    const analysis = await this.myAIAnalysis(thought);

    // 3. Store results back
    await this.dataPod.notes.create({
      content: `# AI Analysis\n\n${analysis}`,
      title: 'AI Analysis'
    });
  }

  private async myAIAnalysis(text: string) {
    // Your custom AI implementation
    return 'Analysis result...';
  }
}

// Usage
const dataPod = new SynapClient({ url: '...', getToken: ... });
const myAI = new MyAIService(dataPod);
await myAI.processThought('I need to organize my tasks');
```

### What's Available

- **Full tRPC API** - All Data Pod operations via `client.rpc.*`
- **WebSocket Events** - Real-time data change notifications
- **File Storage** - Upload and retrieve files
- **Event Log** - Publish and query events for custom workflows

---

## Related SDKs

### Synap Hub SDK (Proprietary)

Our reference implementation of an intelligence layer with:
- AI orchestration and agentic workflows
- Thinking steps visualization
- Proposal management (approve/reject actions)

See [Unified SDK](/docs/api/unified-sdk) for details.

### Community Integrations

- **n8n** - Workflow automation connecting to your Data Pod
- **Custom AI** - Build your own intelligence layer using OpenAI, Anthropic, etc.
- **Analytics** - Data analysis and reporting tools

---

## Type Safety

All types are auto-generated from the tRPC router:

```typescript
import type { AppRouter } from '@synap/client';

// Types are inferred automatically
const note = await client.notes.get('note-id');
// note: { id: string; title: string | null; ... }
```

---

## Next Steps

- [React Integration](/docs/development/sdk/react-integration) - Deep dive into React hooks
- [Unified SDK](/docs/api/unified-sdk) - Learn about our proprietary intelligence layer
- [Building Intelligence Layers](/docs/development/extensibility/extensibility-guide) - Build your own AI service


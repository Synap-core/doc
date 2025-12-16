---
sidebar_position: 1
---

# Data Pod SDK

**The single SDK for interacting with your Data Pod**

---

## Overview

The Data Pod SDK (`@synap/client`) is the **only SDK** you need to interact with your Data Pod. It's open source, extensible, and designed to be enhanced by plugins.

### One SDK, Extended by Plugins

```
Data Pod SDK (@synap/client)
    ↓
Extended at build-time:
- Direct plugins add routers, schemas, events
    ↓
Extended at runtime:
- Remote plugins via webhooks
- Intelligence services via registry
    ↓
All extensions accessible via same SDK
```

**Key Point**: You don't install separate SDKs for plugins. Plugins extend the Data Pod, and the SDK automatically reflects those extensions.

---

## Architecture

Data Pod separates **data storage** from **intelligence processing**:

```mermaid
graph TB
    App[Your Application]
    SDK[@synap/client<br/>Data Pod SDK]
    Pod[Data Pod<br/>Storage, APIs, Events]
    Plugins[Plugins<br/>Direct + Remote]
    
    App --> SDK
    SDK --> Pod
    Plugins -.Extend.-> Pod
    
    style SDK fill:#4CAF50
    style Pod fill:#2196F3
    style Plugins fill:#FF9800,stroke-dasharray: 5 5
```

**Components**:
- **Data Pod** - Storage, tRPC APIs, WebSocket events, file storage
- **@synap/client** - SDK to interact with Data Pod
- **Plugins** - Add features (direct in codebase, remote via HTTP)

---

## Installation

```bash
pnpm add @synap/client
```

---

## Quick Start

```typescript
import { SynapClient } from '@synap/client';

// 1. Initialize client
const client = new SynapClient({
  url: 'http://localhost:3000',
  getToken: async () => await getSessionToken()
});

// 2. Use the SDK
await client.notes.create({ 
  content: '# My Note',
  title: 'My Note' 
});

// 3. Query data
const notes = await client.notes.list();
```

---

## Authentication

### Option 1: Session Cookies (Browser)

```typescript
const client = new SynapClient({
  url: 'http://localhost:3000',
  getToken: () => null, // Use cookies
  credentials: 'include'
});
```

**For**: Browser applications with Ory Kratos

---

### Option 2: API Tokens (Server/CLI)

```typescript
const client = new SynapClient({
  url: 'http://localhost:3000',
  getToken: async () => {
    return process.env.SYNAP_API_TOKEN;
  }
});
```

**For**: Server applications, CLI tools, scripts

See: [Authentication Guide](../../architecture/security/authentication)

---

## Two Ways to Use the SDK

### 1. Facades (Recommended)

High-level, intuitive methods:

```typescript
// Simple, semantic API
await client.notes.create({ content: '...', title: '...' });
const notes = await client.notes.list();
```

**Best for**: Most use cases

---

### 2. Direct tRPC (Advanced)

Full access to the underlying tRPC router:

```typescript
// Direct tRPC access
await client.rpc.notes.create.mutate({ content: '...', title: '...' });
```

**Best for**: Advanced features, custom requirements

See: [Advanced Usage](./advanced)

---

## Core Features

The SDK provides facades for common operations:

- **Notes** - Create, read, update notes
- **Chat** - Store conversation threads
- **Tasks** - Manage tasks
- **Capture** - Quick thought capture
- **System** - Health checks, info

See: [Basic Usage](./basic-usage) for detailed examples

---

## Plugin Extensions

When you add plugins, the SDK automatically reflects new capabilities:

### Direct Plugin Example

```typescript
// Plugin adds new router to Data Pod
// packages/api/src/routers/custom-feature.ts

// SDK automatically includes it
await client.rpc.customFeature.doSomething.mutate({ ... });
```

**Learn more**: [Direct Plugins](../plugin-development/direct-plugins)

---

### Remote Plugin Example

```typescript
// Remote service registers with Intelligence Registry
// SDK can discover and use it

const services = await client.rpc.intelligenceRegistry.discover.query();
// Use discovered services
```

**Learn more**: [Remote Plugins](../plugin-development/remote-plugins)

---

## Type Safety

All types are auto-generated from the tRPC router:

```typescript
import type { AppRouter } from '@synap/client';

// Types inferred automatically
const note = await client.notes.get('note-id');
// note: { id: string; title: string | null; content: string | null; ... }
```

**Benefit**: Full TypeScript support out of the box

---

## React Integration

Use with React Query for reactive data:

```tsx
import { createSynapReactClient } from '@synap/client/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
const synap = createSynapReactClient({
  url: 'http://localhost:3000',
  getToken: async () => await getSessionToken()
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotesApp />
    </QueryClientProvider>
  );
}

function NotesApp() {
  const { data: notes } = synap.notes.list.useQuery({ limit: 20 });
  const createNote = synap.notes.create.useMutation();

  // Use React hooks seamlessly
}
```

See: [React Integration](./react-integration)

---

## WebSocket Real-time Updates

Subscribe to real-time data changes:

```typescript
const userId = 'user-123';
const wsUrl = client.getRealtimeUrl(userId);

const ws = new WebSocket(wsUrl);
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Real-time update:', data);
};
```

See: [Advanced Usage](./advanced) for more

---

## Building on Top

The SDK is designed to be the foundation for higher-level tools:

```typescript
class MyCustomService {
  constructor(private dataPod: SynapClient) {}

  async processTask(taskId: string) {
    // 1. Get data from Data Pod
    const task = await this.dataPod.rpc.tasks.get.query({ id: taskId });
    
    // 2. Your custom logic
    const result = await this.myProcessing(task);
    
    // 3. Store back to Data Pod
    await this.dataPod.notes.create({
      content: `# Result\n\n${result}`,
      title: 'Processing Result'
    });
  }
}
```

**Example use cases**:
- Custom AI services
- Analytics tools
- Workflow automation
- Data sync services

---

## Next Steps

- [Basic Usage](./basic-usage) - Notes, chat, tasks examples
- [React Integration](./react-integration) - React hooks guide
- [Advanced Usage](./advanced) - tRPC, WebSocket, custom facades
- [Plugin Development](../plugin-development/overview) - Extend the SDK

---

## Resources

- **Package**: `@synap/client` on npm
- **GitHub**: Synap-core/backend
- **Type Definitions**: Fully typed with TypeScript

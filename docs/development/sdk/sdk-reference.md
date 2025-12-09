---
sidebar_position: 1
---

# SDK Quick Reference

**Quick reference for `@synap/client` API methods**

> [!TIP]
> This is a quick reference guide. For comprehensive documentation, see the [Data Pod SDK](/docs/api/client-sdk) documentation.

---

## Installation

```bash
pnpm add @synap/client
```

---

## Client Initialization

```typescript
import { SynapClient } from '@synap/client';

const client = new SynapClient({
  url: 'http://localhost:3000',
  getToken: async () => getSessionToken() // or return null for cookie auth
});
```

---

## API Facades (Recommended)

The SDK provides high-level facade methods for common operations.

### Notes

```typescript
// Create note
const result = await client.notes.create({
  content: '# My Note\n\nContent here',
  title: 'My Note',
  tags: ['work', 'ideas']
});

// List notes
const notes = await client.notes.list({
  limit: 20,
  offset: 0,
  type: 'note' // or 'task' or 'all'
});

// Get note
const note = await client.notes.get('note-id');
```

---

### Chat

```typescript
// Send message
const result = await client.chat.sendMessage({
  content: 'Create a task to call John',
  threadId: 'thread-id' // optional
});

// Get thread
const thread = await client.chat.getThread('thread-id');

// List threads
const threads = await client.chat.listThreads();
```

---

### Tasks

```typescript
// Complete a task
await client.tasks.complete('task-id');
```

---

### Capture

```typescript
// Capture a quick thought
await client.capture.thought('Remember to buy milk');

// With context
await client.capture.thought('Call John about project', {
  priority: 'high',
  category: 'work'
});
```

---

### System

```typescript
// Health check
const health = await client.system.health();
console.log(health.status, health.timestamp);

// System info
const info = await client.system.info();
console.log(info.version, info.database, info.storage);
```

---

## Direct tRPC Access (Advanced)

For advanced use cases, access the tRPC router directly:

```typescript
// Direct tRPC calls
await client.rpc.notes.create.mutate({
  content: '# Note',
  title: 'Note'
});

const notes = await client.rpc.notes.list.query({
  limit: 20,
  offset: 0
});

// Events
await client.rpc.events.log.mutate({
  eventType: 'custom.event',
  data: { key: 'value' }
});
```

> [!NOTE]
> **Facades vs Direct tRPC**
> 
> Use facades for simplicity and semantic clarity. Use direct tRPC access when you need full control or access to procedures not exposed via facades.

---

## WebSocket Streaming

Subscribe to real-time updates:

```typescript
const userId = 'user-123';
const wsUrl = client.getRealtimeUrl(userId);

const ws = new WebSocket(wsUrl);

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  console.log('Real-time update:', update);
};
```

---

## Error Handling

```typescript
try {
  await client.notes.create({ 
    content: '# Note',
    title: 'Note'
  });
} catch (error) {
  console.error('Failed to create note:', error);
}
```

---

## TypeScript Types

All types are auto-generated from the tRPC router:

```typescript
import type { AppRouter } from '@synap/client';

// Types are inferred automatically
const note = await client.notes.get('note-id');
// note: { id: string; title: string | null; ... }
```

---

## Related Documentation

- [Data Pod SDK](/docs/api/client-sdk) - Comprehensive SDK documentation
- [React Integration](./react-integration) - React hooks and components
- [Unified SDK](/docs/api/unified-sdk) - Proprietary intelligence layer


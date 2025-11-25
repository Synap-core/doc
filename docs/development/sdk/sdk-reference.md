---
sidebar_position: 1
---

# SDK Reference

**Complete API reference for `@synap/client`**

---

## Installation

```bash
npm install @synap/client
```

---

## Client Initialization

```typescript
import SynapClient from '@synap/client';

const synap = new SynapClient({
  url: 'http://localhost:3000',
  token: 'your-token', // Optional if using session cookies
});
```

---

## API Methods

### Notes

```typescript
// Create note
await synap.notes.create.mutate({
  content: '# My Note\n\nContent',
  title: 'My Note',
});

// List notes
const notes = await synap.notes.list.query({
  limit: 20,
  offset: 0,
});

// Get note
const note = await synap.notes.get.query({
  id: 'note-id',
});

// Update note
await synap.notes.update.mutate({
  id: 'note-id',
  content: '# Updated Note',
});

// Delete note
await synap.notes.delete.mutate({
  id: 'note-id',
});
```

### Chat

```typescript
// Send message
const response = await synap.chat.sendMessage.mutate({
  content: 'Create a task to call John',
  threadId: 'thread-id', // Optional
});

// Get thread
const thread = await synap.chat.getThread.query({
  threadId: 'thread-id',
});

// List threads
const threads = await synap.chat.listThreads.query({
  limit: 20,
});
```

### Events

```typescript
// Log event
await synap.events.log.mutate({
  type: 'custom.event',
  data: { key: 'value' },
});

// List events
const events = await synap.events.list.query({
  limit: 100,
  type: 'custom.event', // Optional filter
});
```

### System

```typescript
// Health check
const health = await synap.system.health.query();

// System info
const info = await synap.system.info.query();

// List handlers
const handlers = await synap.system.handlers.query();

// List tools
const tools = await synap.system.tools.query();
```

---

## Error Handling

```typescript
try {
  await synap.notes.create.mutate({ content: '...' });
} catch (error) {
  if (error instanceof SynapError) {
    console.error(error.message, error.statusCode);
  }
}
```

---

## TypeScript Types

All types are auto-generated from the tRPC router:

```typescript
import type { AppRouter } from '@synap/api';

// Types are inferred automatically
const note = await synap.notes.get.query({ id: '...' });
// note is typed as Note | null
```

---

**Next**: See [React Integration](./react-integration.md) for React hooks.

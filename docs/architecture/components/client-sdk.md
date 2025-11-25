---
sidebar_position: 2
---

# Client SDK

**Type-safe client library for building applications**

---

## Overview

The **`@synap/client`** package provides a type-safe client SDK for interacting with the Data Pod API.

---

## Features

### Type Safety
- **End-to-end types**: Auto-generated from tRPC router
- **Zod validation**: Runtime type checking
- **TypeScript strict**: Full type coverage

### High-Level APIs
- **Notes**: Create, read, update, delete notes
- **Chat**: Conversational interface
- **Tasks**: Task management
- **Capture**: Quick thought capture
- **System**: Health checks, metadata

### React Integration
- **Hooks**: `useNotes`, `useChat`, etc.
- **Real-time**: WebSocket subscriptions
- **Optimistic updates**: Instant UI feedback

---

## Installation

```bash
npm install @synap/client
# or
pnpm add @synap/client
```

---

## Usage

### Basic Client

```typescript
import SynapClient from '@synap/client';

const synap = new SynapClient({
  url: 'http://localhost:3000',
  token: 'your-token',
});

// Create a note
const result = await synap.notes.create.mutate({
  content: '# My Note\n\nContent here',
  title: 'My Note',
});
```

### React Integration

```typescript
import { useNotes } from '@synap/client/react';

function NotesList() {
  const { notes, isLoading, createNote } = useNotes();
  
  return (
    <div>
      {notes.map(note => (
        <div key={note.id}>{note.title}</div>
      ))}
    </div>
  );
}
```

---

## Architecture

import MermaidFullscreen from '@site/src/components/MermaidFullscreen';

<MermaidFullscreen 
  title="Client SDK Architecture"
  value={`graph LR
    A[Your App] -->|Uses| B[synap/client]
    B -->|tRPC Calls| C[Data Pod API]
    B -->|WebSocket| D[Real-time Updates]
    C -->|Events| E[Event Store]
    E -->|Triggers| F[Workers]
    F -->|Updates| G[Database]
    D -->|Notifies| A`} 
/>

---

## Best Practices

1. **Use React hooks** - For React applications
2. **Handle errors** - All methods can throw
3. **Use real-time** - Subscribe to updates
4. **Cache appropriately** - Use React Query for caching
5. **Type everything** - Leverage TypeScript

---

**Next**: See [SDK Reference](../../development/sdk/sdk-reference.md) for complete API documentation.

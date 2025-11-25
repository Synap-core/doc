---
sidebar_position: 2
---

# React Integration

**React hooks and components for `@synap/client`**

---

## Installation

```bash
npm install @synap/client @tanstack/react-query @trpc/react-query
```

---

## Setup

```typescript
// app.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SynapProvider } from '@synap/client/react';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SynapProvider url="http://localhost:3000">
        <YourApp />
      </SynapProvider>
    </QueryClientProvider>
  );
}
```

---

## Hooks

### useNotes

```typescript
import { useNotes } from '@synap/client/react';

function NotesList() {
  const { notes, isLoading, error, createNote, updateNote, deleteNote } = useNotes();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {notes.map(note => (
        <div key={note.id}>
          <h3>{note.title}</h3>
          <p>{note.preview}</p>
        </div>
      ))}
    </div>
  );
}
```

### useChat

```typescript
import { useChat } from '@synap/client/react';

function ChatInterface() {
  const { messages, sendMessage, isLoading } = useChat('thread-id');
  
  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>{msg.content}</div>
      ))}
      <button onClick={() => sendMessage('Hello!')}>
        Send
      </button>
    </div>
  );
}
```

### useRealTime

```typescript
import { useRealTime } from '@synap/client/react';

function RealTimeUpdates() {
  const { events } = useRealTime('user-123');
  
  return (
    <div>
      {events.map(event => (
        <div key={event.id}>{event.type}</div>
      ))}
    </div>
  );
}
```

---

## Best Practices

1. **Use QueryClient** - For caching and state management
2. **Handle loading states** - Show loading indicators
3. **Error boundaries** - Catch and display errors
4. **Optimistic updates** - Update UI immediately
5. **Real-time subscriptions** - Use WebSocket for live updates

---

**Next**: See [SDK Reference](./sdk-reference.md) for complete API documentation.

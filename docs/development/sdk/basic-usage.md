---
sidebar_position: 2
---

# Basic Usage

**Common operations with the Data Pod SDK**

---

## Notes

Manage markdown notes and documents.

### Create a Note

```typescript
const result = await client.notes.create({
  content: '# New Idea\n\nCurrently thinking about...',
  title: 'New Idea',
  tags: ['ideas', 'planning']
});

console.log('Created note:', result.noteId);
```

---

### List Notes

```typescript
const notes = await client.notes.list({
  limit: 20,
  offset: 0,
  type: 'note' // or 'task' or 'all'
});

notes.forEach(note => {
  console.log(`- ${note.title}: ${note.content?.substring(0, 50)}...`);
});
```

---

### Get a Specific Note

```typescript
const note = await client.notes.get('note-id');

console.log(note.title);
console.log(note.content);
console.log(note.tags);
```

---

### Update a Note

```typescript
await client.notes.update('note-id', {
  content: '# Updated Content\n\nNew information...',
  title: 'Updated Title'
});
```

---

### Delete a Note

```typescript
await client.notes.delete('note-id');
```

---

## Chat

Store and retrieve chat conversations.

> [!NOTE]
> Chat provides data storage only. For AI functionality, use [Intelligence Services](../plugin-development/intelligence-registry) or build custom logic.

### Send a Message

```typescript
const result = await client.chat.sendMessage({
  content: 'Hello, world!',
  threadId: 'thread-123' // optional, creates new thread if not provided
});

console.log('Message ID:', result.messageId);
console.log('Thread ID:', result.threadId);
```

---

### Get Thread History

```typescript
const thread = await client.chat.getThread('thread-123');

console.log('Thread messages:');
thread.messages.forEach(msg => {
  console.log(`${msg.role}: ${msg.content}`);
});
```

---

### List All Threads

```typescript
const threads = await client.chat.listThreads();

threads.forEach(thread => {
  console.log(`Thread ${thread.id}: ${thread.messages.length} messages`);
});
```

---

## Tasks

Manage tasks and todos.

### Complete a Task

```typescript
await client.tasks.complete('task-123');
```

> [!NOTE]
> Task completion publishes a `task.completion.requested` event, triggering the event-driven workflow.

---

### Create a Task (via Notes)

Tasks are a special type of entity. Create them using notes:

```typescript
await client.notes.create({
  type: 'task',
  title: 'Call John tomorrow',
  content: 'Discuss project timeline',
  metadata: {
    dueDate: '2024-12-20',
    priority: 'high'
  }
});
```

---

## Capture

Quick thought capture for processing.

### Capture a Thought

```typescript
await client.capture.thought('Remember to buy milk tomorrow');
```

---

### Capture with Context

```typescript
await client.capture.thought('Call John about the project', {
  priority: 'high',
  category: 'work',
  source: 'voice-note'
});
```

> [!TIP]
> Capture is designed for quick input that can be processed later by AI services or automation workflows.

---

## System

Health checks and system information.

### Health Check

```typescript
const health = await client.system.health();

if (health.status === 'healthy') {
  console.log('Data Pod is running');
}
```

---

### System Information

```typescript
const info = await client.system.info();

console.log('Version:', info.version);
console.log('Database:', info.database);
console.log('Storage:', info.storage);
console.log('Capabilities:', info.capabilities);
```

---

## Complete Example

Here's a complete example combining multiple operations:

```typescript
import { SynapClient } from '@synap/client';

async function main() {
  // Initialize
  const client = new SynapClient({
    url: 'http://localhost:3000',
    getToken: async () => process.env.SYNAP_TOKEN
  });

  // 1. Create a note
  const note = await client.notes.create({
    content: '# Project Ideas\n\n- Build AI assistant\n- Add search',
    title: 'Project Ideas',
    tags: ['planning', 'ideas']
  });

  console.log('Created note:', note.noteId);

  // 2. Capture a thought
  await client.capture.thought('Remember to review PRs tomorrow');

  // 3. List recent notes
  const notes = await client.notes.list({ limit: 5 });
  console.log(`Found ${notes.length} notes`);

  // 4. Send a chat message
  const chat = await client.chat.sendMessage({
    content: 'Working on project ideas',
    threadId: 'daily-log'
  });

  console.log('Chat message sent to thread:', chat.threadId);

  // 5. System health
  const health = await client.system.health();
  console.log('System status:', health.status);
}

main().catch(console.error);
```

---

## Error Handling

Always handle errors when making SDK calls:

```typescript
try {
  const result = await client.notes.create({
    content: 'My note',
    title: 'Note'
  });
  console.log('Success:', result.noteId);
} catch (error) {
  if (error instanceof TRPCClientError) {
    console.error('API Error:', error.message);
    console.error('Code:', error.data?.code);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## Next Steps

- [React Integration](./react-integration) - Use SDK with React
- [Advanced Usage](./advanced) - Direct tRPC, WebSocket, custom facades
- [Plugin Development](../plugin-development/overview) - Extend SDK capabilities

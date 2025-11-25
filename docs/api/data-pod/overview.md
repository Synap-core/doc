---
sidebar_position: 1
---

# Data Pod API Overview

**Complete API reference for the Synap Data Pod**

---

## Base URL

```
http://localhost:3000/trpc
```

---

## Authentication

All endpoints require authentication via Ory Kratos session or API key.

See [Authentication](./authentication.md) for details.

---

## Available Routers

### Notes Router
- `notes.create` - Create a note
- `notes.list` - List notes
- `notes.get` - Get a note
- `notes.update` - Update a note
- `notes.delete` - Delete a note

### Chat Router
- `chat.sendMessage` - Send a message
- `chat.getThread` - Get conversation thread
- `chat.listThreads` - List all threads

### Events Router
- `events.log` - Log an event
- `events.list` - List events
- `events.get` - Get an event

### Hub Router
- `hub.generateAccessToken` - Generate Hub access token
- `hub.requestData` - Request data (Hub only)
- `hub.submitInsight` - Submit insight (Hub only)

### API Keys Router
- `apiKeys.create` - Create API key
- `apiKeys.list` - List API keys
- `apiKeys.revoke` - Revoke API key

---

## Usage with SDK

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

---

## Usage with tRPC Client

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@synap/api';

const client = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:3000/trpc',
      headers: {
        'Authorization': 'Bearer your-token',
      },
    }),
  ],
});

const result = await client.notes.create.mutate({
  content: '# My Note',
});
```

---

**Next**: See specific router documentation for detailed endpoints.


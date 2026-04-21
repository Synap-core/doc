---
sidebar_position: 4
title: 'Sdk Direct'
description: Documentation covering Sdk Direct
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
hide_title: false
toc: true
---

# Option E — SDK and direct API access

**For developers building custom apps, LLM pipelines, or anything that needs full typed control over pod data.**

---

## What it is

Two access surfaces, same underlying API:

- **`@synap/sdk`** — typed tRPC client generated from the live `AppRouter`. Full autocomplete, runtime validation, and tree-shaking. Use this for TypeScript/JavaScript projects.
- **Hub Protocol REST** — the same access surface the pod's own AI uses internally. Raw HTTP, language-agnostic, no client library required.

Both give you direct read/write access to entities, documents, views, channels, search, and more. You manage the context you pass to your own LLM — the pod is your structured data backend.

---

## Install

```bash
# TypeScript / Node.js
npm install @synap/sdk

# React apps (includes hooks + provider)
npm install @synap/react
```

---

## Pattern E1 — Read data, inject into your own LLM

Pull structured data from your pod, build a prompt, write results back.

```typescript
import { createSynapClient } from '@synap/sdk';
import Anthropic from '@anthropic-ai/sdk';

const synap = createSynapClient({
  podUrl: 'https://YOUR_POD.synap.live',
  apiKey: 'sk_live_...',
  workspaceId: 'ws_...',
});

// 1. Read data from your pod
const tasks = await synap.entities.list.query({
  profileSlug: 'task',
  filter: { status: 'in-progress' },
  limit: 50,
});

// 2. Feed into your own model
const claude = new Anthropic();
const response = await claude.messages.create({
  model: 'claude-opus-4-5',
  max_tokens: 1024,
  messages: [
    {
      role: 'user',
      content: `Here are my in-progress tasks:\n${JSON.stringify(tasks.items, null, 2)}\n\n${userQuestion}`,
    },
  ],
});

const answer = response.content[0].type === 'text' ? response.content[0].text : '';

// 3. Write the result back to your pod
await synap.entities.create.mutate({
  profileSlug: 'note',
  title: 'AI Summary — In-progress tasks',
  properties: {
    content: answer,
    tags: ['ai-generated'],
  },
});
```

### Other useful reads

```typescript
// Search full-text + semantic
const results = await synap.search.global.query({ q: 'Q3 budget projections' });

// Get a specific entity with all properties
const entity = await synap.entities.get.query({ id: 'ent_...' });

// List views
const views = await synap.views.list.query({ workspaceId: 'ws_...' });

// Read a document
const doc = await synap.documents.get.query({ entityId: 'ent_...' });
```

---

## Pattern E2 — Hub Protocol REST

Hub Protocol REST is a language-agnostic HTTP API. Same capabilities as the SDK, no client library needed. Useful for Python pipelines, shell scripts, or any language without a Synap SDK.

```bash
# Search your pod
curl "https://YOUR_POD.synap.live/api/hub-protocol/search?q=contract+renewal&limit=10" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "x-workspace-id: ws_..."
```

Response:

```json
{
  "results": [
    {
      "id": "ent_abc",
      "profileSlug": "deal",
      "title": "Acme Corp — contract renewal",
      "score": 0.94,
      "excerpt": "...renewal deadline is March 31..."
    }
  ],
  "totalCount": 3
}
```

```bash
# Trigger AI on a channel
curl -X POST "https://YOUR_POD.synap.live/api/hub-protocol/channels/trigger-ai" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "channelId": "ch_01hx...",
    "workspaceId": "ws_...",
    "message": "Draft a follow-up email to Acme about the renewal."
  }'
```

Response:

```json
{
  "messageId": "msg_...",
  "channelId": "ch_01hx...",
  "status": "queued"
}
```

The AI response will be delivered as a message in that channel. Poll `GET /api/hub-protocol/channels/:id/messages` or subscribe via webhook to receive it.

### Hub Protocol scopes

| Scope | What it allows |
|-------|---------------|
| `hub-protocol.read` | Search, entity reads, document reads, memory reads |
| `hub-protocol.write` | Create/update entities, send messages, trigger AI |

---

## Pattern E3 — Compose C + D in one script

Call a skill to extract structured data, then chat with the result:

```typescript
import { createSynapClient } from '@synap/sdk';

const POD_URL = 'https://YOUR_POD.synap.live';
const API_KEY = 'YOUR_API_KEY';

// Step 1: Invoke a skill to extract entities from raw text
const skillRes = await fetch(`${POD_URL}/api/external/skills/sk_01hx.../invoke`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input: { text: rawMeetingNotes, workspaceId: 'ws_...' },
  }),
});
const { result: extracted } = await skillRes.json();
console.log('Extracted:', extracted.entitiesCreated);

// Step 2: Ask the AI to summarise and add context
const chatRes = await fetch(`${POD_URL}/api/external/chat/stream`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `I just added entities from a meeting. Summarise what needs follow-up and flag anything urgent.`,
  }),
});

// Parse SSE stream
const reader = chatRes.body!.getReader();
const decoder = new TextDecoder();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  for (const line of decoder.decode(value, { stream: true }).split('\n')) {
    if (!line.startsWith('data: ')) continue;
    const frame = JSON.parse(line.slice(6));
    if (frame.type === 'content') process.stdout.write(frame.content);
  }
}
```

---

## Required scopes per pattern

| Pattern | Required scopes |
|---------|----------------|
| E1 — SDK reads | `read:entities`, `hub-protocol.read` |
| E1 — SDK writes | `read:entities`, `write:entities` |
| E2 — Hub Protocol reads | `hub-protocol.read` |
| E2 — Hub Protocol writes | `hub-protocol.read`, `hub-protocol.write` |
| E3 — Compose C + D | `skills.invoke`, `chat.stream` |
| Full external access | `read:entities`, `write:entities`, `skills.invoke`, `chat.stream`, `hub-protocol.read`, `hub-protocol.write` |

---

## Type safety

The SDK exports input and output types for every procedure:

```typescript
import type { RouterInputs, RouterOutputs } from '@synap/sdk';

type CreateInput = RouterInputs['entities']['create'];
// → { profileSlug: string; title: string; properties?: Record<string, unknown>; workspaceId?: string; ... }

type Entity = RouterOutputs['entities']['list']['items'][number];
// → { id: string; title: string; profileSlug: string; properties: Record<string, unknown>; createdAt: Date; ... }
```

---

## React integration

```tsx
// app.tsx
import { SynapProvider } from '@synap/react';

export default function App({ children }: { children: React.ReactNode }) {
  return (
    <SynapProvider
      podUrl="https://YOUR_POD.synap.live"
      apiKey="sk_live_..."
      workspaceId="ws_..."
    >
      {children}
    </SynapProvider>
  );
}
```

```tsx
// TaskList.tsx
import { useSynap } from '@synap/react';

export function TaskList() {
  const { data, isLoading } = useSynap().entities.list.useQuery({
    profileSlug: 'task',
    filter: { status: 'in-progress' },
    limit: 20,
  });

  if (isLoading) return <p>Loading…</p>;

  return (
    <ul>
      {data?.items.map(task => (
        <li key={task.id}>
          <strong>{task.title}</strong>
          <span>{task.properties.dueDate as string}</span>
        </li>
      ))}
    </ul>
  );
}
```

The `useSynap()` hook returns the full typed tRPC client. All queries use TanStack Query under the hood — caching, refetching, and optimistic updates work out of the box.

---

## Next steps

- [Option C — Skill invocation](./skill-invocation) — call named operations
- [Option D — Chat stream](./chat-stream) — natural language interface
- [API Keys](./api-keys) — scope reference
- [First SDK queries](../development/sdk/first-query) — React, TypeScript, or cURL
- [Quickstart](../../start/getting-started/quickstart) — route to app, agents, or SDK

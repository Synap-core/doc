---
sidebar_position: 3
title: 'Chat Stream'
description: Documentation covering Chat Stream
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
hide_title: false
toc: true
---

# Option D — Stream AI chat

**A single endpoint that gives you a streaming AI conversation backed by your pod's full data and skill library.**

---

## What it is

`POST /api/external/chat/stream` hands your query to the pod's AI system and streams the response back as Server-Sent Events. The AI has access to everything in your pod: entities, documents, conversation memory, and the full skill library. It can search your data, create or update entities, invoke skills, and return structured results — all in response to a plain English question.

Unlike skill invocation, you do not need to know what operation to call. The AI figures that out. The trade-off: the output is less predictable, and latency is higher because the AI reasons before it responds.

---

## Get an API key

Go to **Settings → API Keys → New Key**, and select the scope `chat.stream`.

---

## List available channels

```bash
curl https://YOUR_POD.synap.live/api/external/chat/channels \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Response:

```json
[
  {
    "id": "ch_01hx...",
    "type": "thread",
    "name": "Personal AI",
    "isPersonal": true,
    "workspaceId": "ws_..."
  },
  {
    "id": "ch_02hy...",
    "type": "thread",
    "name": "Project Artemis – AI branch",
    "isPersonal": false,
    "workspaceId": "ws_..."
  }
]
```

If you omit `channelId` when streaming, the pod automatically routes to your personal AI channel (creating it if it does not exist yet).

---

## Stream a conversation

```bash
curl -X POST https://YOUR_POD.synap.live/api/external/chat/stream \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "query": "What tasks are overdue this week?" }' \
  --no-buffer
```

The response is a stream of newline-delimited SSE frames. Each frame is prefixed with `data: `:

```yaml

data: {"type":"step","step":{"tool":"search_entities","result":{"count":4}}}

data: {"type":"content","content":"You have 4 overdue tasks this week:\n\n"}

data: {"type":"content","content":"1. **Send Q3 projections** — due Tuesday\n"}

data: {"type":"content","content":"2. **Review Artemis spec** — due Wednesday\n"}

data: {"type":"content","content":"3. **Call Alice re: contract** — due Thursday\n"}

data: {"type":"content","content":"4. **Update board deck** — due Friday\n"}

data: {"type":"complete","data":{"channelId":"ch_01hx...","messageId":"msg_abc..."}}

```

---

## SSE frame format

Every frame has a `type` field. Parse and handle each type separately.

### `content`

Streamed text chunk. Concatenate these to build the full response.

```json
{ "type": "content", "content": "You have 4 overdue tasks" }
```

### `step`

The AI used a tool against your pod. Useful for showing "thinking" state in a UI, or for auditing what data the AI accessed.

```json
{
  "type": "step",
  "step": {
    "tool": "search_entities",
    "input": { "profileSlug": "task", "filter": "status=overdue" },
    "result": { "count": 4, "entityIds": ["ent_1", "ent_2", "ent_3", "ent_4"] }
  }
}
```

### `proposal`

The AI wants to make a change (create/update/delete an entity, invoke a skill with write effects) but does not have auto-approve permission for this operation. You need to approve it before it executes.

```json
{
  "type": "proposal",
  "data": {
    "proposalId": "prop_xyz...",
    "action": "entities.create",
    "payload": {
      "profileSlug": "task",
      "title": "Follow up with Bob re: contract",
      "properties": { "dueDate": "2026-03-28" }
    },
    "description": "Create a task: Follow up with Bob re: contract (due Friday)",
    "approveUrl": "https://YOUR_POD.synap.live/api/proposals/prop_xyz.../approve"
  }
}
```

Approve it with:

```bash
curl -X POST https://YOUR_POD.synap.live/api/proposals/prop_xyz.../approve \
  -H "Authorization: Bearer YOUR_API_KEY"
```

### `complete`

The stream is done. Contains the channel and message IDs for follow-up queries or linking back to the Synap app.

```json
{
  "type": "complete",
  "data": {
    "channelId": "ch_01hx...",
    "messageId": "msg_abc..."
  }
}
```

### `error`

Something went wrong. The stream ends after this frame.

```json
{ "type": "error", "error": "Intelligence service unavailable" }
```

---

## TypeScript example

```typescript
const POD_URL = 'https://YOUR_POD.synap.live';
const API_KEY = 'YOUR_API_KEY';

async function streamChat(query: string, channelId?: string) {
  const res = await fetch(`${POD_URL}/api/external/chat/stream`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, channelId }),
  });

  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split('\n').filter(l => l.startsWith('data: '));

    for (const line of lines) {
      const frame = JSON.parse(line.slice(6)); // strip "data: "

      switch (frame.type) {
        case 'content':
          fullContent += frame.content;
          process.stdout.write(frame.content); // stream to terminal
          break;

        case 'step':
          console.error(`[tool] ${frame.step.tool}`);
          break;

        case 'proposal':
          console.error(`[proposal] ${frame.data.description}`);
          console.error(`[proposal] Approve: ${frame.data.approveUrl}`);
          break;

        case 'complete':
          console.error(`\n[done] channelId=${frame.data.channelId}`);
          break;

        case 'error':
          throw new Error(`Pod error: ${frame.error}`);
      }
    }
  }

  return fullContent;
}

// Usage
const answer = await streamChat('What tasks are overdue this week?');
```

---

## Persistent history

When you omit `channelId`, the pod uses your **personal thread** — a default `thread` with personal attributes. Every message you send this way is saved to that thread, visible inside the Synap app, and included in the AI's context window on the next call.

This means you can:
- Ask a follow-up without re-sending context: the AI already knows what you discussed
- See the full conversation history in the Synap app under the Chat tab
- Have the AI's memory compound over time (the pod runs session compaction automatically)

If you want an isolated conversation that does not affect your main channel history, create a new `thread` channel first and pass its ID.

---

## Passing a specific channel

```bash
curl -X POST https://YOUR_POD.synap.live/api/external/chat/stream \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Summarise what we decided last week",
    "channelId": "ch_02hy..."
  }' \
  --no-buffer
```

The AI will load that channel's history as context. History is bounded by `HISTORY_TOKEN_BUDGET` (12,000 tokens); older messages are compacted automatically.

---

## Agent types

By default the pod uses the `meta` agent — the full orchestrator with access to all tools. You can request a specific agent personality with `agentType`:

```json
{
  "query": "Review the Artemis spec for technical gaps",
  "agentType": "engineering"
}
```

Unknown `agentType` values fall back to the default orchestrator and log a warning — they do not error.

---

## Full request schema

```typescript
{
  query: string;          // required — your message
  channelId?: string;     // omit to use personal thread
  workspaceId?: string;   // defaults to your key's workspace
  agentType?: string;     // defaults to "meta"
}
```

---

## Using with Claude Code

Add this as a tool Claude Code can call to query your pod mid-task:

```typescript
// synap-chat.ts — run with: npx tsx synap-chat.ts "your question"
const [, , ...words] = process.argv;
const query = words.join(' ');

const res = await fetch(`${process.env.SYNAP_POD_URL}/api/external/chat/stream`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.SYNAP_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query }),
});

const reader = res.body!.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  const chunk = decoder.decode(value, { stream: true });
  for (const line of chunk.split('\n').filter(l => l.startsWith('data: '))) {
    const frame = JSON.parse(line.slice(6));
    if (frame.type === 'content') process.stdout.write(frame.content);
  }
}
```

In your `CLAUDE.md`:

```markdown
## Query my Synap pod

Run `npx tsx synap-chat.ts "question"` to ask my Synap AI anything about my tasks,
notes, projects, or contacts. Results come from live pod data.
Requires SYNAP_POD_URL and SYNAP_API_KEY in environment.
```

---

## Next steps

- [Option C — Skill invocation](./skill-invocation) — deterministic, no natural language
- [Option E — SDK and direct API](./sdk-direct) — full typed access for custom pipelines
- [API Keys](./api-keys) — manage scopes

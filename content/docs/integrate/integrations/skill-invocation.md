---
sidebar_position: 2
title: 'Skill Invocation'
description: Documentation covering Skill Invocation
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
hide_title: false
toc: true
---

# Option C — Invoke skills via HTTP

**Call named, deterministic operations on your pod from any external tool.**

---

## What it is

Skills are named operations that run on your pod with full access to your data — entities, documents, search, and memory. Each skill has a defined input schema, a fixed scope (pod-wide, workspace, or user), and runs synchronously with a configurable timeout.

Invoking a skill via HTTP is like calling a typed function on your pod. The result is structured JSON. There is no natural language involved: you pass `input`, you get `result`.

This is the right option when you want **repeatable, predictable behavior** — extracting entities from raw text, creating structured notes, running a search pipeline, or any other operation your pod has a skill for.

---

## Get an API key

Go to **Settings → API Keys → New Key**, and select the scope `skills.invoke`.

The key is shown once at creation. Store it securely — it cannot be retrieved later.

---

## List your skills

```bash
curl https://YOUR_POD.synap.live/api/external/skills \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Response:

```json
[
  {
    "id": "sk_01hx...",
    "name": "Extract and save entities",
    "description": "Parses raw text and creates structured entity records in your workspace.",
    "scope": "workspace",
    "parameters": {
      "type": "object",
      "properties": {
        "text": { "type": "string", "description": "Raw text to parse" },
        "workspaceId": { "type": "string" }
      },
      "required": ["text", "workspaceId"]
    },
    "executionMode": "synchronous",
    "timeoutSeconds": 30
  },
  {
    "id": "sk_02hy...",
    "name": "Summarize overdue tasks",
    "description": "Fetches overdue tasks and returns a markdown summary.",
    "scope": "workspace",
    "parameters": {
      "type": "object",
      "properties": {
        "workspaceId": { "type": "string" }
      },
      "required": ["workspaceId"]
    },
    "executionMode": "synchronous",
    "timeoutSeconds": 15
  }
]
```

> **Note:** Skill slugs are not yet supported — use the UUID `id` from the list endpoint when invoking. Slugs may be added in a future release.

---

## Invoke a skill

```bash
curl -X POST https://YOUR_POD.synap.live/api/external/skills/sk_01hx.../invoke \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "input": {
      "text": "Meeting with Alice on Friday re: Q3 budget. Action: send updated projections by EOD.",
      "workspaceId": "ws_..."
    }
  }'
```

Response:

```json
{
  "success": true,
  "result": {
    "entitiesCreated": [
      { "id": "ent_abc", "profileSlug": "task", "title": "Send updated Q3 projections" },
      { "id": "ent_def", "profileSlug": "event", "title": "Meeting with Alice – Friday" }
    ],
    "summary": "Created 1 task and 1 event from the input text."
  },
  "executionTimeMs": 142
}
```

---

## TypeScript example

```typescript
const POD_URL = 'https://YOUR_POD.synap.live';
const API_KEY = 'YOUR_API_KEY';

async function listSkills() {
  const res = await fetch(`${POD_URL}/api/external/skills`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return res.json() as Promise<Skill[]>;
}

async function invokeSkill(skillId: string, input: Record<string, unknown>) {
  const res = await fetch(`${POD_URL}/api/external/skills/${skillId}/invoke`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input }),
  });

  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);

  const data = await res.json();
  if (!data.success) throw new Error(`Skill failed: ${JSON.stringify(data)}`);

  return data.result;
}

// Usage
const skills = await listSkills();
const extractSkill = skills.find(s => s.name === 'Extract and save entities');

const result = await invokeSkill(extractSkill.id, {
  text: 'Follow up with Bob about the contract renewal.',
  workspaceId: 'ws_...',
});

console.log(result);
```

---

## Using with Claude Code

Add skill invocation as a tool in your project's `CLAUDE.md` so Claude Code can call it directly:

````markdown
## Tools

### invoke_synap_skill
Calls a named operation on the Synap data pod.

```bash
# List available skills first
curl https://YOUR_POD.synap.live/api/external/skills \
  -H "Authorization: Bearer $SYNAP_API_KEY"

# Invoke a skill by ID
curl -X POST https://YOUR_POD.synap.live/api/external/skills/SKILL_ID/invoke \
  -H "Authorization: Bearer $SYNAP_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{ "input": { ... } }'
```

Use this when you want to persist something to my Synap pod, search my knowledge base, or run a structured operation. Store SYNAP_API_KEY in your environment.
````

Or as a standalone script Claude Code can run:

```typescript
// synap-invoke.ts — run with: npx tsx synap-invoke.ts SKILL_ID '{"text":"..."}'
import { execSync } from 'node:child_process';

const [, , skillId, inputJson] = process.argv;

const result = await fetch(
  `${process.env.SYNAP_POD_URL}/api/external/skills/${skillId}/invoke`,
  {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.SYNAP_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ input: JSON.parse(inputJson) }),
  }
);

console.log(JSON.stringify(await result.json(), null, 2));
```

---

## Skill scopes

| Scope | Visibility | Notes |
|-------|-----------|-------|
| `pod` | All workspaces on the pod | System-level skills: full-text search, cross-workspace indexing |
| `workspace` | One workspace | Most skills live here; your API key's workspace context applies |
| `user` | Current authenticated user only | Personal skills: private notes, personal memory |

Your API key is tied to a user and (optionally) a workspace. Skills scoped below your key's permissions return 403.

---

## Errors

| Status | Meaning |
|--------|---------|
| `401 Unauthorized` | API key missing or invalid |
| `403 Forbidden` | Key has no `skills.invoke` scope, or skill is out of your key's scope |
| `404 Not Found` | Skill ID does not exist, or you do not have access to it |
| `400 Bad Request` | Skill exists but is inactive, or `input` fails the skill's parameter schema |
| `502 Bad Gateway` | Pod could not reach the AI service (Intelligence Service unavailable) |
| `504 Gateway Timeout` | Skill ran longer than `timeoutSeconds` |

---

## Next steps

- [Option D — Chat stream](./chat-stream) — natural language interface to your pod
- [Option E — SDK and direct API](./sdk-direct) — full typed access
- [API Keys](./api-keys) — manage scopes and rotation

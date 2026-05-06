---
sidebar_position: 8
title: 'Memory & Knowledge'
description: Two planes of AI data — memory (user-specific) and knowledge (pod-wide). Different owners, different access patterns, never confused.
section: general
audience: users
version: 1.0+
last_updated: '2026-04-23'
tags: [memory, knowledge, ai, agents]
sidebar_position: null
hide_title: false
toc: true
---

# Memory & Knowledge

**Two planes of AI data. Different owners. Different access patterns. Never confused.**

```
Memory is personal.     →  what the AI knows about YOU
Knowledge is shared.    →  what the system knows about HOW THINGS WORK
```

Episodic vs procedural memory: **episodic** = "I remember that you prefer async, and yesterday we discussed the deploy script" **procedural** = "I know how to deploy a Synap pod, what the UI tokens are, how entity profiles work."

---

## The two planes

| | Memory | Knowledge |
|---|---|---|
| **Stores** | Facts about the *user* | Operational docs about the *system* |
| **Scope** | Per-user | Pod-wide |
| **Created by** | AI agents (auto-extracted) | Humans (deliberate) |
| **Structure** | Freeform text | Structured key (`namespace:slug`) |
| **Search** | Semantic + keyword | Direct O(1) key lookup |
| **Editable by** | AI agents | Humans (authors) |
| **Governance** | Auto-approved writes | Draft → reviewed → active → deprecated |
| **Lifespan** | Persistent until deleted | Status lifecycle |
| **Storage** | `knowledge_facts` (existing) | `knowledge_keys` (new) |
| **Access** | `/api/hub/memory/*` | `/api/hub/knowledge/*` (new) |
| **Tool** | `memory_search` | `get_knowledge` (new) |
| **Example** | "User prefers async" | `deploy:backend` → deploy guide |
| **Embeddings** | Yes (pgvector) | No (key-based) |
| **Use case** | "What does this user care about?" | "How do I deploy/fix/build X?" |

### Memory (what the AI knows about you)

- **Table**: `knowledge_facts` (existing) — `userId`, `fact`, `confidence`, `embedding`, `sourceEntityId`, `sourceMessageId`
- **Endpoint**: `POST/GET/DELETE /api/hub/memory`
- **Created by**: agents calling `POST /memory`, or auto-extracted from conversations via heuristics (`"I prefer..."`, `"remember that..."`)
- **Searched by**: semantic (cosine similarity via pgvector) + keyword fallback
- **Used by**: `memory_search` tool injects recalled facts into conversation context
- **Example**: "I prefer markdown", "standup is at 10am", "I have a project called Project Aurora"
- **Constraint**: per-user, never shared between users

### Knowledge (what the system knows about itself)

- **Table**: `knowledge_keys` (new) — `key` (unique), `namespace`, `slug`, `value`, `version`, `status`, `author`
- **Endpoint**: `/api/hub/knowledge/*` (new)
- **Created by**: humans authoring markdown content in the pod
- **Searched by**: direct O(1) key lookup by `namespace:slug`, namespace listing, full-text search across values
- **Used by**: `get_knowledge(key)` MCP/tools return markdown for execution
- **Example**: `deploy:backend` → step-by-step deploy guide, `ui:tokens` → spacing/color/typography spec
- **Constraint**: pod-wide, shared, author-controlled
- **Lifecycle**: draft → reviewed → active → deprecated

---

## The wrong answer for the job

Confusing memory and knowledge has real consequences:

**Using knowledge (keys) to store memory**: storing a deploy guide in the memory table means every user on the pod gets the same "fact about themselves" — wrong scope, wrong search mode, no personalization.

**Using memory (semantic search) for knowledge**: searching `"deploy backend"` semantically when you need `deploy:backend` is unreliable — vector similarity can't guarantee you get the right step-by-step guide, and you lose the ability to browse by namespace or track status.

**AI agent mixing them**: an agent that tries to "recall" a deploy guide from memory is hunting for a needle. An agent that "stores" a user's project preference in knowledge is polluting system data with user data.

---

## Agents in action

```
Agent receives: "How do I deploy the backend?"

Step 1: check Memory       → "Do I already know this user well?"
Step 2: check Knowledge    → fetch("deploy:backend") ← structured lookup
Step 3: execute            → follow steps, log progress
Step 4: record in Memory   → remember("User just deployed backend successfully")

Agent receives: "What did we talk about last week?"

Step 1: check Memory       → memory_search("last week's conversation")
Step 2: check Knowledge    → skip (not system knowledge)
```

---

## MCP tools

| Tool | Purpose | What it touches |
|---|---|---|
| `synap_recall_memory(query)` | Find user facts | `memory` (existing) |
| `synap_store_memory(fact)` | Store a fact | `memory` (existing) |
| `synap_get_knowledge(key)` | Fetch procedural doc | `knowledge` (new) |
| `synap_list_knowledge(namespace?)` | Browse by category | `knowledge` (new) |
| `synap_update_knowledge(key, value)` | Add/update a doc | `knowledge` (new) |

Governance: read tools are auto-approved. Write tools (`update`, `create`) go through the proposal system — an agent modifying a deploy guide is a meaningful change that deserves human review.

---

## Schema reference

Memory is an existing table. Knowledge is the new addition for which a migration should be created.

### Memory (existing)

```sql
CREATE TABLE knowledge_facts (
  id UUID PRIMARY KEY,
  userId TEXT NOT NULL,
  fact TEXT NOT NULL,
  sourceEntityId UUID,
  sourceMessageId UUID,
  confidence REAL DEFAULT 0.5,
  embedding VECTOR(1536) NOT NULL,  -- pgvector
  createdAt TIMESTAMPTZ DEFAULT NOW()
);
```

### Knowledge (new)

```sql
CREATE TABLE knowledge_keys (
  id UUID PRIMARY KEY,
  key VARCHAR UNIQUE NOT NULL,       -- "deploy:backend"
  namespace VARCHAR NOT NULL,         -- "deploy"
  slug VARCHAR NOT NULL,              -- "backend"
  value TEXT NOT NULL,                -- markdown content
  version INTEGER DEFAULT 1,
  status VARCHAR DEFAULT 'active',    -- draft | reviewed | active | deprecated
  author VARCHAR,                     -- human author identity
  createdAt TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes: lookup by namespace (browse), status (filtering), full-text on value
CREATE INDEX idx_knowledge_namespace ON knowledge_keys(namespace);
CREATE INDEX idx_knowledge_status ON knowledge_keys(status);
CREATE INDEX idx_knowledge_value_ft ON knowledge_keys USING gin(to_tsvector('simple', value));
```

---

## Quick reference

When in doubt:

- You want to remember what a user said → **Memory**
- You want to store how to do something → **Knowledge**
- "What does this user care about?" → **Memory**
- "How does this system work?" → **Knowledge**
- Semantic/meaning search → **Memory**
- Direct lookup by known key → **Knowledge**
- A fact about this specific user → **Memory**
- A fact about the system → **Knowledge**
- Auto-approved writes → **Memory**
- Draft → reviewed → active lifecycle → **Knowledge**

---

## Related

- [Knowledge graph](./knowledge-graph) — entities and typed relationships
- [Multi-agent system](./multi-agent-system) — agents that use both memory and knowledge
- [Channel architecture](./channels) — where user memory lives in conversations
- [Hub Protocol REST](../hub-protocol-flow) — all API endpoints including memory
- [MCP](../integrate/agents/mcp) — tool calling surface for memory + knowledge access
- [Entities](./entities) — what agents create when they use memory

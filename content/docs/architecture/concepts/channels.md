---
sidebar_position: 5
title: Channels
---

# Channels: The Interaction Layer

**Where everything happens — AI conversations, human comments, team messaging, and external integrations.**

---

## The Product Triptych

Synap's data model is built on three fundamental concepts — what we call the **triptych**:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   ENTITIES              VIEWS                CHANNELS           │
│   ─────────             ──────               ────────           │
│   The Data              The Lens             The Interaction    │
│                                                                 │
│   What you know.        How you see it.      How you act on it. │
│                                                                 │
│   Tasks, people,        Tables, kanbans,     AI conversations,  │
│   notes, projects,      calendars, graphs,   comments,          │
│   companies,            whiteboards,         agent teams,       │
│   documents...          timelines...         external imports...│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

Each leg of the triptych is complete without the others, but together they form a living knowledge system:

- **Entities** are the atoms — immutable facts about the world.
- **Views** are the queries — ways to perceive and organise those facts.
- **Channels** are the verbs — where things are discussed, decided, and changed.

> If Entities are the nouns of your workspace and Views are the grammar, Channels are the conversations that put it all in motion.

---

## What is a Channel?

A **Channel** is a persistent, typed conversation surface with a context scope. It holds an ordered sequence of messages (from humans, AI agents, or external systems) and tracks **context** — the entities, documents, views, and proposals that the conversation is about.

Every Channel has:
- A **type** that defines its purpose and behavior
- A **scope** (`pod` or `workspace`) that controls visibility
- An ordered list of **messages** with rich authorship metadata
- An optional **context object** linking it to an entity, document, view, or project
- An optional **parent** for sub-thread branching

The key mental model: **a channel is a conversation surface with a context scope.** The context object is what the conversation is _about_; the channel type is _how_ that conversation is structured.

---

## Channel Types — V2

Synap has exactly **6 canonical channel types**. Each drives different rendering, permissions, AI routing, and sidebar grouping.

### `personal` — Your Permanent AI Assistant

One per user, across the entire data pod. Created automatically on first login. Never deleted. This is your longitudinal relationship with your AI — it accumulates context across all workspaces.

- **Scope:** pod-wide (visible in all workspaces)
- **AI:** always active — your personal AI agent
- **Who can write:** you only
- **User-facing label:** "Chat" or "My AI"

The personal channel is how you have a continuous conversation with an AI that knows you, your projects, your writing style, and your history. Context is injected dynamically depending on which workspace you're working in.

---

### `thread` — A Conversation Linked to Context

The general-purpose conversation type. A thread is always linked to a context object — a workspace, an entity, a document, a view, or a project. The context object determines what the conversation is _about_.

| Context Object | Was (V1) | Default AI |
|---|---|---|
| `workspace` | `ai_thread` | On (`meta` persona) |
| `entity` | `entity_comments` | Off |
| `document` | `document_review` | Off |
| `view` | `view_discussion` | Off |
| `project` | _(new)_ | On (`meta` persona) |
| `task` | _(new)_ | Off |

- **Scope:** workspace (follows the context object)
- **AI:** configurable — on for workspace/project threads, off by default for entity/doc links (but activatable via @mention)
- **Who can write:** workspace members

This consolidates what were four separate V1 types (`ai_thread`, `entity_comments`, `document_review`, `view_discussion`) into a single flexible type. The context object is the differentiator, not the type.

---

### `sub_thread` — A Specialised Sub-Agent Task

A focused conversation spawned within a parent channel to accomplish a specific task. Always has a parent. Expected to conclude — its result summary feeds back to the parent channel.

- **Scope:** inherits from parent
- **AI:** always active, with a specific agent persona
- **Who can write:** the AI (primarily); humans can inject at any time
- **Fields:** `branchPurpose` (what this sub-thread is doing), `resultSummary` (output when complete)

Sub-threads are how Synap's multi-agent system works: the orchestrator delegates focused tasks to specialised sub-agents, each in its own sub-thread, and synthesises the results.

```
Main channel: "Build authentication system"
│
├─ sub_thread: "Research OAuth providers"     ← sub-agent
│    └─ 12 messages of research
│    └─ Created: "OAuth comparison" document
│    └─ [DONE] → resultSummary injected back to parent
│
└─ Main continues with full context...
```

---

### `feed` — Proactive AI Broadcasts

A one-way broadcast channel. AI posts content here (morning briefings, digests, connector sync summaries, automation results). Users read and tap to continue in a thread.

- **AI:** system posts only — no user→AI back-and-forth from here
- **Who can write:** nobody (input is hidden; a read-only banner is shown)
- **Interaction model:** tap any post to "Continue in a thread" → opens a linked `thread`

**Feed scopes:**

| Scope | One per | What appears |
|---|---|---|
| `user` (pod-wide) | User | Morning briefing, personal insights, capture summaries |
| `workspace` | Workspace | Team-wide connector syncs, automation results, workspace digests |

The feed is the proactive surface — your AI reaching out to you, not you reaching out to it.

---

### `external` — Ingested from Outside

One per external conversation linked to Synap. Messages from external platforms (WhatsApp, Slack, Gmail, Telegram, SMS) are replayed into this channel. Historical messages are read-only; the user can write new messages, optionally routed back to the external platform.

- **AI:** off for imported messages; on for new user messages
- **Sources:** `whatsapp`, `slack`, `gmail`, `telegram`, `sms`

```
WhatsApp message arrives
    → external channel created
    → messages replayed (read-only)
    → user writes reply in Synap
    → AI has full conversation context
    → reply routed back to WhatsApp
```

---

### `agent_collab` — Internal Multi-Agent Collaboration

A persistent async channel where multiple AI agents (and optionally human observers) communicate. Created by workspace admins or automation to set up agent teams.

- **Scope:** workspace
- **AI:** multiple agents; no single owner
- **Who can write:** humans can inject messages at any time (deliberate action)
- **Persistence:** full conversation history (unlike ephemeral task delegation)

This is distinct from Synap's external A2A protocol: `agent_collab` channels are permanent, workspace-scoped, and always accessible to humans.

---

## Context Items

Every channel maintains a set of **context items** — links to objects in the knowledge graph that the conversation is about.

```
Channel: "Q3 Marketing Strategy" (thread, contextObjectType=workspace)
  └── Context Items:
        entity: "Q3 Goal" (used_as_context)
        entity: "Marketing Team" (used_as_context)
        document: "Brand Guidelines" (referenced)
        proposal: "Budget Increase" (created)
        entity: "Campaign Tracker" (updated)
```

Context items are automatically injected into the AI's system prompt when a conversation continues. This is what gives the AI grounded, verifiable memory — not vague summarisation.

**Relationship types:**
- `used_as_context` — provided as context to the AI
- `created` — created as a result of this conversation
- `updated` — modified during this conversation
- `referenced` — mentioned or linked
- `inherited_from_parent` — inherited from parent channel (sub-threads)

---

## Messages

Messages are the atomic unit inside a channel. Every message carries:

| Field | Values | Meaning |
|-------|--------|---------|
| `role` | `user`, `assistant`, `system` | LLM-facing role (for prompt construction) |
| `author_type` | `human`, `ai_agent`, `external`, `bot` | Actual nature of the author |
| `message_category` | `chat`, `comment`, `system_notification`, `review` | How to render the message |
| `external_source` | `"whatsapp"`, `"slack"`, etc. | Origin platform (if external) |

A hash chain (`previousHash → hash`) ensures message integrity.

---

## AI Routing

Not every channel triggers an AI response. The routing gate is:

- **Always AI:** `personal`, `sub_thread`, `agent_collab`
- **AI if configured:** `thread` and `external` with `agentType` set (not `none`)
- **Never AI:** `feed` (system posts only)

The `agentType` field is a free string — it can be `"meta"` (the co-founder orchestrator), a persona like `"persona:cto"`, or any custom agent identifier. Setting `agentType = "none"` disables AI in a thread.

---

## Scope Dimension

Channels have a `scope` field (`pod` | `workspace`) that controls visibility:

| Type | Scope | Rationale |
|---|---|---|
| `personal` | `pod` | One across all workspaces |
| `thread` | `workspace` | Follows the context object |
| `sub_thread` | inherits | Same as parent |
| `feed` (user) | `pod` | Personal, crosses workspaces |
| `feed` (workspace) | `workspace` | Team-wide |
| `external` | `workspace` | Imports are workspace-specific |
| `agent_collab` | `workspace` | Agent teams are workspace-scoped |

---

## The Knowledge Graph Connection

Channels are **first-class nodes in the knowledge graph**. They are indexed in Typesense for search, they appear in entity connection views, and they can be linked from any object. This means:

- You can search across all conversations to find when a topic was discussed
- An entity's "activity view" shows every channel that touched it
- The AI's memory is grounded in verifiable, structured context

---

## Summary

Channels complete the triptych. They are not just a chat feature — they are the connective tissue that makes the knowledge system dynamic:

- **Entities** are created and updated _through_ channels
- **Views** can be discussed and annotated _via_ channels
- **External platforms** connect to the workspace _through_ channels
- **AI agents** operate _inside_ channels with full context
- **Proactive AI** broadcasts _into_ feed channels

Wherever something happens in Synap — a decision, a discussion, a review, an automation — it happens in a channel.

---

:::info Learn more
- [Channels Architecture](/architecture/channels) — technical reference for the channels subsystem
- [Multi-agent system](./multi-agent-system.md) — how sub-threads power agent orchestration
:::

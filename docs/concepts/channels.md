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
│   companies,            whiteboards,         reviews, DMs,      │
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

A **Channel** is a persistent, typed conversation container. It holds an ordered sequence of messages (from humans, AI agents, or external systems) and tracks **context** — the entities, documents, views, and proposals that the conversation is about.

Every Channel has:
- A **type** that defines its purpose
- An ordered list of **messages** with rich authorship metadata
- A set of **context items** linking it to the rest of the knowledge graph
- An optional **parent** for branching and threading
- Support for **external sources** (WhatsApp, Slack, Gmail, etc.)

---

## Channel Types

| Type | Description | Use Case |
|------|-------------|----------|
| `ai_thread` | Main AI conversation | User ↔ AI assistant sessions |
| `branch` | Sub-conversation from a parent | AI sub-tasks, parallel explorations |
| `entity_comments` | Comments on an entity | Discuss a task, annotate a contact |
| `document_review` | Review thread on a document | Editorial feedback, approval workflows |
| `view_discussion` | Discussion attached to a view | Team comments on a whiteboard or table |
| `direct` | Direct message between users | 1:1 or small-group messaging |
| `external_import` | Ingested from an external platform | WhatsApp thread, Slack channel, Gmail thread |

This typing is not cosmetic — it drives rendering, permissions, notifications, and routing logic.

---

## Messages

Messages are the atomic unit inside a Channel. They carry:

| Field | Values | Meaning |
|-------|--------|---------|
| `role` | `user`, `assistant`, `system` | Who authored it (for AI context) |
| `author_type` | `human`, `ai_agent`, `external`, `bot` | The actual nature of the author |
| `message_category` | `chat`, `comment`, `system_notification`, `review` | How to render/treat the message |
| `external_source` | `"whatsapp"`, `"slack"`, etc. | Origin platform (if external) |
| `inbox_item_id` | FK → `inbox_items` | Links to a Life Feed item (enables reply-from-Synap) |

A hash chain (`previousHash → hash`) ensures message integrity and prevents tampering.

---

## Context Items

Every Channel maintains a set of **context items** — links to objects in the knowledge graph that this conversation is about.

```
Channel: "Q3 Marketing Strategy" (ai_thread)
  └── Context Items:
        entity: "Q3 Goal" (used_as_context)
        entity: "Marketing Team" (used_as_context)
        document: "Brand Guidelines" (referenced)
        proposal: "Budget Increase" (created)
        entity: "Campaign Tracker" (updated)
```

Context items are how Synap knows what an AI conversation is about — they are automatically injected into the system prompt when the AI continues a thread.

**Object types tracked:**
- `entity` — any entity in the knowledge graph
- `document` — documents (notes, wikis, reports)
- `view` — views (whiteboards, tables)
- `proposal` — pending changes awaiting approval
- `inbox_item` — a Life Feed notification or external message

**Relationship types:**
- `used_as_context` — this object was provided as context to the AI
- `created` — this object was created as a result of this conversation
- `updated` — this object was modified during this conversation
- `referenced` — this object was mentioned or linked
- `inherited_from_parent` — inherited from a parent channel (branch)

---

## Channel Branching

Channels support **Git-style branching**. A branch is a child channel of type `branch`, linked via `parentChannelId`. When the branch's work is complete, it is **merged** back — the summary and key context items flow back to the parent.

```
Main Channel: "Build authentication system"
│
├─ Branch: "Research OAuth providers"     ← AI sub-agent
│    └─ 12 messages of research
│    └─ Created: "OAuth comparison" document
│    └─ [MERGED] → summary injected into main
│
├─ Branch: "Write login component"        ← AI sub-agent
│    └─ 8 messages + code output
│    └─ [MERGED]
│
└─ Main continues with full context...
```

This is how Synap's multi-agent system works — the orchestrator delegates to specialised branches and synthesises the results.

---

## External Integration

Channels with `channel_type = external_import` bridge Synap to the outside world. An external message (a WhatsApp message, a Slack mention, a Gmail thread) arrives in the **Life Feed** as an `inbox_item`. That inbox item can spawn a Channel, and messages in that channel can carry `inbox_item_id` FKs — meaning you can reply to WhatsApp from within Synap, and the AI has full context of the original conversation.

```
WhatsApp message arrives
    → inbox_items row created
    → channels row created (external_import)
    → messages row created (author_type: external, external_source: "whatsapp")
    → AI can respond inline
    → Reply routed back to WhatsApp via webhook
```

---

## The Knowledge Graph Connection

Channels are **first-class nodes in the knowledge graph**. They are indexed in Typesense for search, they appear in entity connection views, and they can be linked to from any object. This means:

- You can search across all conversations to find when a topic was discussed
- An entity's "activity view" shows every Channel that touched it
- The AI's memory is grounded in verifiable, structured context — not vague summarisation

---

## Summary

Channels complete the triptych. They are not just a chat feature — they are the connective tissue that makes the knowledge system dynamic:

- **Entities** are created and updated *through* Channels
- **Views** can be discussed and annotated *via* Channels
- **External platforms** connect to the workspace *through* Channels
- **AI agents** operate *inside* Channels with full context

Wherever something happens in Synap — a decision, a discussion, a review, an automation — it happens in a Channel.

---

:::info Learn more on the website
- [User-friendly guide to Channels](https://www.synap.live/guides/channels) — practical overview of the interaction layer
- [Compare Synap vs Notion](https://www.synap.live/compare/vs-notion) — see how it stacks up
:::

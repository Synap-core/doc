---
sidebar_position: 5
title: 'Channels'
description: Documentation covering Channels
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
hide_title: false
toc: true
---

# Channels: The Interaction Layer

Channels are the interaction layer of the product triptych (Entities, Views, Channels). They are where humans, agents, and external systems exchange messages, keep context, and drive changes.

## Canonical channel model

Synap uses **4 channel types**:

- `thread` — unified conversation type
- `feed` — proactive card stream
- `external` — synced external conversation
- `agent_collab` — multi-agent collaboration surface

Legacy labels (`ai_thread`, `entity_comments`, `document_review`, `view_discussion`, `personal`, `sub_thread`, `external_import`, `a2ai`) are historical terms and not canonical types.

## `thread`: unified conversation type

`thread` is the default conversation container for user/AI collaboration. Instead of separate channel types, behavior is expressed via attributes:

- `contextObjectType` / `contextObjectId` (workspace, entity, document, view, project, etc.)
- `threadKind: "personal"` (personal assistant behavior without a separate `personal` type)
- `parentChannelId` + thread metadata for branch-style workflows (instead of `sub_thread`)
- `agentType` / routing metadata

This collapses personal and branch semantics into **thread + attributes**.

## `feed`: proactive cards, actionable

`feed` is a read-oriented stream of proactive items (briefings, summaries, sync updates, alerts). Each card supports:

- **Primary action** (default continuation, open, apply, acknowledge)
- **Secondary action** (dismiss, snooze, open details, defer)

Feeds can exist at user or workspace scope depending on product surface.

## `external`: connector-backed conversations

`external` represents conversations synced from platforms like Slack, Telegram, email, or WhatsApp.

- Imported history remains traceable to source metadata
- Reply routing back to the external platform is a **capability toggle**
- That toggle depends on connector **live state** and permissions (not all external channels are bidirectional at all times)

## `agent_collab`: internal multi-agent coordination

`agent_collab` is for durable collaboration among multiple AI agents, with optional human oversight.

- Current visibility target: **admin/owner only**
- Intended for orchestration, handoffs, and long-running collaboration context

## AI routing

Routing is policy-driven, not type-count driven:

- `thread` and `external` may route to AI depending on channel settings and agent routing config
- `feed` is system/proactive publishing oriented
- `agent_collab` routes through multi-agent orchestration logic

## Context and graph linkage

All channels remain first-class knowledge graph nodes. They can link to entities, documents, views, and proposals, and they provide structured conversation memory for both humans and agents.

## Migration note for docs

When older docs mention old taxonomy, map them as:

- `ai_thread` / `entity_comments` / `document_review` / `view_discussion` → `thread`
- `personal` → `thread` with personal attributes
- `sub_thread` / `branch` → `thread` with parent/branch attributes
- `external_import` → `external`
- `a2ai` → `agent_collab`

---

:::info Related pages
- [Branching conversations](./branching-conversations)
- [Multi-agent system](./multi-agent-system)
:::

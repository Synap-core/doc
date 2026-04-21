---
sidebar_position: 3
title: 'Contagious Layers'
description: Documentation covering Contagious Layers
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
hide_title: false
toc: true
---

# Contagious Layers

## The Power of Primitives

In Synap, extensibility isn't an afterthought—it's **contagious**.

When you add a new primitive to the system (like a new Entity Type, or a new Agent), you don't just add a standalone feature. You trigger a cascade of capabilities that "infects" every layer of the operating system.

---

## How It Works

Let's say you define a new Entity Type: **`Book`**.

### 1. The Infection Begins (The Definition)
You simply define the schema:
```typescript
{
  type: 'book',
  fields: { title, author, isbn, rating }
}
```

### 2. The Spread (Automatic Capabilities)
Instantly, without writing extra code, your `Book` entity gains:

*   **🧠 The Intelligence Layer**
    *   The **Hub Protocol** exposes `Book` to all AI agents.
    *   Agents can now *read*, *create*, and *update* books.
    *   They understand the schema automatically via introspection.

*   **🕸️ The Graph Layer**
    *   `Book` nodes appear in the Knowledge Graph.
    *   You can link a `Task` to a `Book`.
    *   You can see all `Notes` referencing a `Book`.

*   **🔍 The Search Layer**
    *   Vector embeddings are generated for `Book` content.
    *   Semantic search ("novels about space") finds your books.
    *   Full-text search indices are updated.

*   **⚡ The Realtime Layer**
    *   WebSocket channels (`entities.book.*`) are created.
    *   Collaborators see updates instantly.

*   **🛡️ The Security Layer**
    *   Standard permissions (Owner, Editor, Viewer) apply immediately.
    *   Global Validator protects `Book` creation policies.

---

## "Write Once, Propagate Everywhere"

This architectural property is what makes Synap a true **OS**.

*   **Legacy App**: Add a feature → Update Database → Update API → Update Frontend → Update Search → Update Mobile App.
*   **Synap**: Add a Primitive → **The System Adapts**.

This creates a **flywheel effect**: The more primitives you add, the richer the entire ecosystem becomes for every other primitive. Your `Book` entity makes the `Research Agent` smarter, which makes your `Notes` more valuable, which makes the `Graph` more insightful.

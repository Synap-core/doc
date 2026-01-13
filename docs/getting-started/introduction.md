---
sidebar_position: 1
---

# Introduction

Welcome to **Synap** - a Personal Data Operating System with revolutionary capabilities.

## What is Synap?
**Synap is a Personal Data Operating System.**

It creates a **private, intelligent kernel** for your digital life where you are the root user. Instead of scattering your life across dozens of SaaS silos, Synap brings your data into a single, sovereign "Data Pod" that you own, control, and can extend indefinitely.

### The "Workspace as a Service" Paradigm
Synap treats your workspace not as a static file folder, but as a live service:

- 🕐 **Time-Travel**: Every keystroke is an event. Replay history, fork conversations, and audit everything.
- 🧠 **Contagious Intelligence**: AI isn't a bolt-on; it's a layer. Add an AI capability once, and it propagates to every note, task, and file instantly.
- 🌳 **Branching Workflows**: Just like code, your thoughts can branch. Explore different ideas in parallel without messing up your main thread.
- 🔒 **Sovereign by Design**: You don't "log in" to Synap; you *host* it (or we host a private instance for you). Your data never leaves your pod unless you explicitly authorize it via the Hub Protocol.

### Why It Matters

| The SaaS Model (Old) | The Synap Model (Personal OS) |
|----------------------|-------------------------------|
| App owns the data | **You own the data** |
| Intelligence is trapped in the app | **Intelligence works across your whole life** |
| "Features" are gatekept by pricing | **Features are just plugins you install** |
| Linear history (Ctrl+Z) | **Event Sourcing (Infinite Time Travel)** |

**Learn more**: [Workspace as a Service](../concepts/workspace-as-a-service.md) - Deep dive into the philosophy

---

## Architecture Overview

Synap follows an **event-driven architecture** where all state changes flow through events:

**UI or Automation (Agents) → Events → Workers → Data Layer**

```
┌─────────────┐         ┌──────────────┐
│   Client    │────────▶│   Data Pod   │
│  (Frontend) │         │  (Core OS)   │
└─────────────┘         └──────────────┘
                              │
                              │ Events
                              ▼
                         ┌──────────────┐
                         │   Inngest    │
                         │  Event Bus   │
                         └──────────────┘
                              │
                              │ Dispatches
                              ▼
                         ┌──────────────┐
                         │   Workers    │
                         └──────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
            ┌──────────────┐    ┌──────────────┐
            │  PostgreSQL  │    │  R2/MinIO    │
            │  + pgvector  │    │   Storage    │
            └──────────────┘    └──────────────┘
```

For a complete architecture overview, see [Architecture Overview](../architecture/overview.md).

**How It Works**:
- **[Event Sourcing](../concepts/event-sourcing-explained)** - Never lose data, infinite undo
- **[Knowledge Graph](../concepts/knowledge-graph)** - Automatic connections
- **[Branching](../concepts/branching-conversations)** - Parallel AI work
- **[Multi-Agent System](../concepts/multi-agent-system)** - Specialized AI team

---

## Key Features

- ✅ **Event-Driven Architecture** - Built on Inngest event bus
- ✅ **PostgreSQL with TimescaleDB** - Time-series data and vector search
- ✅ **Multi-User Support** - Row-Level Security (RLS) for data isolation
- ✅ **Ory Authentication** - Enterprise-grade identity management
- ✅ **tRPC APIs** - Type-safe, end-to-end APIs
- ✅ **Vector Search** - pgvector for semantic search
- ✅ **Storage Abstraction** - R2 (production) or MinIO (dev)

---

## Next Steps

1. **[Quickstart](./quickstart)** - Get your first note and chat working in 5 minutes
2. **[Core Concepts](../concepts/what-is-synap)** - Understand what makes Synap different
3. **[Architecture Overview](../architecture/overview)** - Technical deep dive

---

**Ready to get started?** Let's begin with [Quickstart](./quickstart)!

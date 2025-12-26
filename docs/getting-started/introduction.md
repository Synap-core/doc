---
sidebar_position: 1
---

# Introduction

Welcome to **Synap** - a Personal Data Operating System with revolutionary capabilities.

## What is Synap?

**Synap is not just a note-taking app.** It's a complete platform for building intelligent applications with superpowers:

- 🕐 **Time-Travel** - Never lose data, undo anything, see your workspace from any point in time
- 🌳 **Branching** - Git-like conversations, parallel AI exploration, context switching
- 🧠 **Knowledge Graph** - Automatic connections, bi-directional links, relationship discovery
- 🤖 **Multi-Agent AI** - Specialized AI team working in parallel, not just one assistant
- 🔒 **Data Sovereignty** - You own it, you host it, you control it

## Why These Matter

### Unlike Traditional Apps:

| Traditional Apps | Synap |
|------------------|-------|
| Update data → lose history | Record events → remember everything |
| One AI assistant | AI team with specialists |
| Manual organization | Automatic knowledge graph |
| Linear conversations | Git-like branching |
| They own your data | You own your data |

**Learn more**: [What is Synap?](../concepts/what-is-synap) - Deep dive into capabilities

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

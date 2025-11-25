---
sidebar_position: 1
---

# Introduction

Welcome to **Synap** - an event-sourced knowledge backend with AI capabilities.

## What is Synap?

Synap is a modern, event-driven backend system designed to help you build intelligent knowledge management applications. It combines:

- **Event Sourcing** - Immutable event log for complete auditability
- **AI Integration** - LangGraph-powered agents for intelligent interactions
- **Data Sovereignty** - Your data stays in your Data Pod
- **Hub & Spoke Architecture** - Connect to external intelligence services via marketplace
- **Extensibility** - Plugin system for custom capabilities

## Key Features

- ✅ **Event-Driven Architecture** - Built on Inngest event bus
- ✅ **PostgreSQL with TimescaleDB** - Time-series data and vector search
- ✅ **Multi-User Support** - Row-Level Security (RLS) for data isolation
- ✅ **Ory Authentication** - Enterprise-grade identity management
- ✅ **tRPC APIs** - Type-safe, end-to-end APIs
- ✅ **Vector Search** - pgvector for semantic search
- ✅ **Storage Abstraction** - R2 (production) or MinIO (dev)

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

## Next Steps

1. **[Installation](./installation)** - Set up your development environment
2. **[Quickstart](./quickstart)** - Get your first note and chat working
3. **[Architecture Overview](../architecture/overview)** - Understand the system design

---

**Ready to get started?** Let's begin with [Installation](./installation)!


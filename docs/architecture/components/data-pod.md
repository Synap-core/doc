---
sidebar_position: 1
---

# Data Pod (The Brain)

**The central intelligence that powers your entire Synap ecosystem.**

---

## Overview

The **Data Pod** (or Synap Core OS) is the self-hosted backend that serves as the "Digital Brain" of your system. 

It is **headless**, meaning it has no UI of its own. It runs silently in the background, storing your memories (Events), processing your thoughts (AI), and serving your applications (Web, Mobile, CLI).

> "The Body (App) may change, but the Brain (Data Pod) remembers forever."

---

## Core Responsibilities

### Data Management
- **Event Store**: Immutable event log (TimescaleDB)
- **Projections**: Materialized views for fast reads
- **File Storage**: Content stored in R2/MinIO
- **Vector Search**: Semantic search via pgvector

### API Layer
- **tRPC APIs**: Type-safe, end-to-end APIs
- **Authentication**: Ory Kratos + Hydra
- **Authorization**: Row-Level Security (RLS)
- **Real-time**: WebSocket support

### Intelligence
- **Local Agents**: LangGraph workflows for basic tasks
- **Plugin System**: Extensible via The Architech
- **Tool Registry**: Dynamic tool registration

---

## Architecture

import MermaidFullscreen from '@site/src/components/MermaidFullscreen';

<MermaidFullscreen 
  title="Data Pod Architecture"
  value={`graph TD
    A[Client Apps] -->|tRPC| B[Data Pod API]
    B -->|Publishes| C[Event Store]
    C -->|Triggers| D[Inngest]
    D -->|Dispatches| E[Workers]
    E -->|Updates| F[Database]
    E -->|Stores| G[File Storage]
    E -->|Can Use| H[Agents]
    H -->|Creates Events| B`} 
/>

---

## Key Features

### Event-Driven
All state changes flow through events, ensuring:
- Complete audit trail
- Event replay capability
- Decoupled architecture

### Data Sovereignty
- User owns all data
- Self-hostable
- Open source
- Complete control

### Extensibility
- Internal plugins (The Architech)
- External services (Marketplace)
- Agent plugins (LangGraph)

---

## Technology Stack

- **Runtime**: Node.js 20+
- **Database**: PostgreSQL (TimescaleDB + pgvector)
- **Event Bus**: Inngest
- **ORM**: Drizzle ORM
- **API**: tRPC + Hono
- **AI**: LangGraph + Vercel AI SDK
- **Auth**: Ory Stack
- **Storage**: R2/MinIO

---

**Next**: See [Client SDK](./client-sdk.md) for client integration.

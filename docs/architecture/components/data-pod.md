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
- **Intelligence Hub**: Separate service — peer-agent network, Hub Protocol client
- **Tool Registry**: Dynamic tool registration
- **MCP Client**: Connects to external MCP servers (planned)

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
- External Intelligence Services via Hub Protocol
- MCP client for community tools (planned)
- Marketplace widgets for bento dashboards (planned)

---

## Technology Stack

- **Runtime**: Node.js 20+
- **Database**: PostgreSQL 15+ with pgvector
- **Jobs**: pg-boss (PostgreSQL-backed queue)
- **ORM**: Drizzle ORM
- **API**: tRPC 11 + Hono
- **AI**: Vercel AI SDK + Claude (Intelligence Hub is a separate service)
- **Auth**: Ory Kratos
- **Storage**: MinIO / Cloudflare R2

---

**Next**: See [Client SDK](./client-sdk.md) for client integration.

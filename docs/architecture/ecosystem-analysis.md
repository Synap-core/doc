---
sidebar_position: 2
---

# Ecosystem Analysis

**Complete analysis of the Synap ecosystem architecture**

---

## Executive Summary

This document provides a complete analysis of the Synap ecosystem, including:
- **16 packages** organized in a monorepo structure
- **2 applications** (Data Pod API, Admin UI)
- **Hub & Spoke architecture** with clear separation of concerns
- **Event-driven** data flow with CQRS pattern
- **Type-safe** communication via tRPC

---

## Package Architecture

### Core Foundation Layer

#### `@synap/core` (v1.0.0)
**Role**: Foundation utilities shared across all packages  
**Capabilities**:
- Logging (Pino-based structured logging)
- Configuration management (environment-based)
- Error handling (custom error types)
- Metrics (Prometheus-compatible)
- Tracing (OpenTelemetry integration)

**Dependencies**: 
- `@synap/database` (for RLS functions)
- `@opentelemetry/*` (observability)
- `pino` (logging)
- `prom-client` (metrics)

**Used By**: All packages (foundation layer)

---

#### `@synap/types` (v1.0.0)
**Role**: Shared TypeScript types and Zod schemas  
**Capabilities**:
- Event type definitions
- Entity schemas
- Validation schemas

**Dependencies**:
- `@synap/core`
- `zod`

**Used By**: All packages (type definitions)

---

### Data Layer

#### `@synap/database` (v1.0.0)
**Role**: Database abstraction and schema management  
**Capabilities**:
- PostgreSQL client (TimescaleDB + pgvector)
- Drizzle ORM integration
- Schema definitions (12 tables)
- Repositories (Event, Knowledge, Conversation, etc.)
- Row-Level Security (RLS) for multi-tenancy
- Migration system (Drizzle + custom SQL)

**Key Schemas**:
- `events` (event sourcing)
- `entities` (notes, tasks, projects)
- `api_keys` (Hub authentication)
- `knowledge_facts` (knowledge graph)
- `conversation_messages` (chat history)

---

#### `@synap/storage` (v1.0.0)
**Role**: Object storage abstraction  
**Capabilities**:
- Cloudflare R2 integration
- S3-compatible API
- Presigned URLs for secure access

---

### Domain Layer

#### `@synap/domain` (v1.0.0)
**Role**: Business logic and domain services  
**Capabilities**:
- Entity services (Notes, Tasks, Projects)
- Knowledge service (semantic search, facts)
- Conversation service
- Vector search service

---

### AI & Intelligence Layer

#### `@synap/ai` (v1.0.0)
**Role**: Local AI agent orchestrator (Data Pod)  
**Capabilities**:
- LangGraph agent graph
- Intent classification
- Action planning
- Tool execution
- Semantic search
- Knowledge graph integration

**Key Components**:
- `agent/graph.ts` - Main LangGraph workflow
- `agent/intent-classifier.ts` - Intent analysis
- `agent/planner.ts` - Action planning
- `agent/executor.ts` - Tool execution
- `tools/` - Dynamic tool registry

---

**Note**: Intelligence capabilities can be added via plugins (single agents, agent graphs) or external services (marketplace). See [Plugin System](./core-concepts/plugin-system.md) for details.

---

### Hub Protocol Layer

#### `@synap/hub-protocol` (v1.0.0)
**Role**: Protocol schemas and validation  
**Capabilities**:
- HubInsight schema (Zod)
- Action schema
- Analysis schema
- Validation functions
- Type guards

---

#### `@synap/hub-protocol-client` (v1.0.0)
**Role**: Type-safe client for Hub Protocol  
**Capabilities**:
- tRPC client for Data Pod communication
- Token management
- Data request handling
- Insight submission

---

### API Layer

#### `@synap/api` (v1.0.0)
**Role**: tRPC API server (Data Pod)  
**Capabilities**:
- Dynamic router registry (plugin system)
- 8 core routers:
  - `events` - Event logging
  - `capture` - Thought capture
  - `notes` - Notes management
  - `chat` - Conversational interface
  - `suggestions` - AI suggestions
  - `system` - System metadata
  - `hub` - Hub Protocol V1.0
  - `apiKeys` - API key management
- Event publishing (Inngest)
- Event streaming (WebSocket)
- Authentication middleware

---

### Authentication Layer

#### `@synap/auth` (v2.0.0)
**Role**: Authentication and authorization  
**Capabilities**:
- Ory Kratos integration (identity)
- Ory Hydra integration (OAuth2)
- Token exchange (RFC 8693)

---

## Application Layer

### Data Pod API (`apps/api`)
**Role**: Main API server for Data Pod  
**Technology**: Hono + tRPC  
**Capabilities**:
- Serves `@synap/api` router
- Authentication middleware
- Security headers
- Rate limiting
- CORS configuration

---

**Note**: External intelligence services are third-party services that can be connected via the marketplace using the Hub Protocol. They are not part of the core open-source Data Pod.

---

## Package Dependency Graph

```
@synap/core (foundation)
    ↑
    ├── @synap/types
    ├── @synap/database
    ├── @synap/storage
    ├── @synap/domain
    ├── @synap/ai
    ├── @synap/api
    ├── @synap/auth
    ├── @synap/jobs
    └── @synap/client

@synap/hub-protocol (standalone)
    ↑
    ├── @synap/hub-protocol-client
    └── @synap/hub-orchestrator-base

@synap/api (depends on most packages)
    ↑
    └── @synap/client (uses AppRouter type)
```

---

## Technology Stack

### Core Technologies
- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.3+
- **Package Manager**: pnpm 8.15+
- **Build System**: Turbo (monorepo)

### Backend Technologies
- **Web Framework**: Hono 4.0
- **API**: tRPC 11.0
- **Database**: PostgreSQL (TimescaleDB + pgvector)
- **ORM**: Drizzle ORM 0.33
- **Event System**: Inngest 3.15
- **Authentication**: Ory Stack (Kratos + Hydra)

### AI Technologies
- **Orchestration**: LangGraph 1.0
- **LLM SDK**: Vercel AI SDK 4.0
- **Providers**: Anthropic Claude, OpenAI
- **Knowledge**: Temporal knowledge graph

---

## Architecture Patterns

### Event-Driven Architecture
- **Event Sourcing**: All state changes as events
- **CQRS**: Separate read/write models
- **Event Streaming**: Real-time updates via WebSocket

### Hub & Spoke Model
- **Data Pod**: Central hub (data owner)
- **External Services**: External spokes (intelligence providers via marketplace)
- **Protocol**: Standardized communication (Hub Protocol V1.0)

### Plugin System
- **Dynamic Router Registry**: Runtime router registration
- **Tool Registry**: Dynamic tool registration
- **Extensibility**: Internal plugins (The Architech) + External services (Marketplace)

---

## Current Status

### ✅ Completed
- Core packages architecture
- Hub Protocol V1.0
- API Key management
- Ory authentication migration
- Knowledge graph integration
- Event-driven architecture
- Real-time updates
- Type-safe SDK

### 🚧 In Progress
- Marketplace for external services
- Production deployment guides
- Additional agent plugins

### 📋 Planned
- The Architech (CLI for plugin generation)
- Additional agent plugins
- Proactive AI features
- Multi-user Data Pod support

---

**Next Steps**: See other architecture documents for detailed component analysis.


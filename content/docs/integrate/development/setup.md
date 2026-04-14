---
sidebar_position: 1
title: Development Setup
---

# Development Setup

Synap uses a hybrid development environment:
1.  **Infrastructure** runs in Docker (Database, Cache, Search).
2.  **Application Code** runs natively in Node.js (API, Frontend, Workers).

## Prerequisites
*   Node.js 20+
*   pnpm
*   Docker Desktop

## Quick Start

```bash
# 1. Install dependencies
pnpm install

# 2. Start Infrastructure (Postgres, Redis, MinIO, Typesense)
./scripts/dev-local.sh

# 3. Initialize Database
pnpm db:migrate

# 4. Start Development Servers
pnpm dev
```

## Services Overview

| Service | Port | Description |
| :--- | :--- | :--- |
| **PostgreSQL** | 5432 | Main data and event store |
| **Redis** | 6379 | Caching and Rate Limiting |
| **Typesense** | 8108 | Search Engine (Typos, Facets) |
| **MinIO** | 9000 | S3-compatible Object Storage |
| **API Server** | 4000 | tRPC Backend |
| **Web App** | 3000 | Next.js Frontend |
| **Inngest** | 8288 | Background Job Dev Server |

## Package Structure

*   `apps/`
    *   `web`: The main Next.js frontend.
    *   `api`: The Express/Hono backend server.
*   `packages/`
    *   `core`: Shared business logic and utilities.
    *   `database`: Drizzle schemas and migrations.
    *   `api`: tRPC routers (the implementation).
    *   `events`: Event definitions and schemas.
    *   `jobs`: Inngest worker definitions.
    *   `types`: Shared TypeScript definitions.

## Common Commands

*   `pnpm db:generate`: Generate SQL from Drizzle schema.
*   `pnpm db:migrate`: Apply SQL migrations.
*   `pnpm db:studio`: Open Drizzle Studio UI.
*   `pnpm dev:all`: Start API, Web, and Realtime servers together.

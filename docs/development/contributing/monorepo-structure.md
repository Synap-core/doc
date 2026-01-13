---
sidebar_position: 2
---

# Monorepo Structure

**Understanding the Data Pod codebase**

---

## Overview

Data Pod uses a **monorepo** with **pnpm workspaces**.

```
synap-backend/
├── apps/          # Deployable applications
├── packages/      # Reusable libraries
└── services/      # Example services
```

**Key principle**: Packages are building blocks, apps combine them.

---

## Apps (Deployable)

### `apps/api/`

Main Data Pod API server.

**What it does**:
- Serves tRPC endpoints
- Handles webhooks
- Provides SSE for real-time
- Runs event processors

**Key files**:
- `src/index.ts` - Server setup
- `src/webhooks/` - Webhook handlers

**Run locally**:
```bash
cd apps/api
pnpm dev
```

---

## Packages (Libraries)

### `packages/api/`

tRPC router definitions and business logic.

**Contains**:
- `src/routers/` - API endpoints
- `src/event-handlers/` - Event processors
- `src/plugins/` - Plugin system

**Example**:
```typescript
// packages/api/src/routers/notes.ts
export const notesRouter = router({ ... });
```

---

### `packages/database/`

Database schema and migrations.

**Contains**:
- `src/schema/` - Drizzle table definitions
- `migrations/` - SQL migration files
- `src/projectors/` - Event sourcing projections

**Example**:
```typescript
// packages/database/src/schema/notes.ts
export const notes = pgTable('notes', { ... });
```

---

### `packages/events/`

Event type definitions.

**Contains**:
- `src/domain-events.ts` - Typed events
- `src/publisher.ts` - Event publishing
- `src/payloads.ts` - Zod schemas

**Example**:
```typescript
// packages/events/src/domain-events.ts
export type NoteCreatedEvent = BaseEvent<...>;
```

---

### `packages/client/`

TypeScript SDK for frontends.

**Contains**:
- `src/index.ts` - Main client class
- `src/facades/` - High-level APIs
- Auto-generated from packages/api

**Example**:
```typescript
const client = new SynapClient({ url: '...' });
await client.notes.create({ content: '...' });
```

---

### `packages/core/`

Shared utilities.

**Contains**:
- Config management
- Logging
- Utilities

---

## Services (Examples)

### `services/intelligence/`

Example intelligence service (optional).

Shows how to build a remote service that integrates with Data Pod.

---

## Package Dependencies

```
apps/api
  ├─→ packages/api
  ├─→ packages/database
  ├─→ packages/events
  └─→ packages/core

packages/api
  ├─→ packages/database
  ├─→ packages/events
  └─→ packages/core

packages/client
  └─→ packages/api (types only)
```

**Rule**: Packages can depend on other packages, apps depend on packages.

---

## Building Order

When changing code, build in dependency order:

```bash
# 1. Database (no dependencies)
cd packages/database && pnpm build

# 2. Events (no dependencies)
cd ../events && pnpm build

# 3. API (depends on database, events)
cd ../api && pnpm build

# 4. Client (depends on API types)
cd ../client && pnpm build

# 5. Apps (depend on everything)
cd ../../apps/api && pnpm build
```

**Or build all**:
```bash
pnpm build  # From root, builds in correct order
```

---

## Common File Patterns

### Adding a Router

1. Create in `packages/api/src/routers/`
2. Register in `packages/api/src/index.ts`
3. Client automatically gets types

### Adding Schema

1. Create in `packages/database/src/schema/`
2. Export from `packages/database/src/schema/index.ts`
3. Create migration in `packages/database/migrations/`

### Adding Events

1. Define in `packages/events/src/domain-events.ts`
2. Add builder in `packages/events/src/publisher.ts`
3. Export from `packages/events/src/index.ts`

---

## Development Tips

**Hot reload**: Apps auto-reload on changes
```bash
cd apps/api && pnpm dev  # Watches for changes
```

**Type checking**: TypeScript checks across packages
```bash
pnpm typecheck  # Check all packages
```

**Linting**: ESLint + Prettier
```bash
pnpm lint
pnpm format
```

---

## Next Steps

- **Add router** → [Router Development](./router-development)
- **Change schema** → [Database Migrations](./database-migrations)
- **Work with events** → [Event System](./event-system)

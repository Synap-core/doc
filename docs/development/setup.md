---
sidebar_position: 1
---

# Development Setup

**Complete guide to setting up your development environment**

---

## Prerequisites

- **Node.js**: 20+ (LTS recommended)
- **pnpm**: 8.15+ (package manager)
- **Docker Desktop**: For local services (PostgreSQL, MinIO)
- **Git**: For version control

---

## Initial Setup

### 1. Clone Repository

```bash
git clone https://github.com/Synap-core/backend.git
cd backend
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Configuration

```bash
# Copy example environment file
cp env.local.example .env

# Edit .env and add your API keys
# - ANTHROPIC_API_KEY
# - OPENAI_API_KEY
# - DATABASE_URL (PostgreSQL)
# - Ory configuration
```

### 4. Start Local Services

```bash
# Start PostgreSQL and MinIO
docker compose up -d postgres minio

# Wait for services to be ready
docker compose ps
```

### 5. Initialize Database

```bash
# Run migrations
pnpm --filter database db:init

# Verify database
pnpm --filter database db:status
```

---

## Development Workflow

### Start Development Server

```bash
# Start all services in watch mode
pnpm dev

# Or start specific services
pnpm --filter api dev
pnpm --filter jobs dev
```

### Run Tests

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm --filter @synap/api test

# Watch mode
pnpm test:watch
```

### Build

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @synap/api build
```

---

## Project Structure

```
backend/
├── apps/
│   ├── api/              # Data Pod API server
│   └── docs/             # Documentation site
├── packages/
│   ├── api/              # tRPC routers
│   ├── database/         # Database schemas & migrations
│   ├── domain/           # Business logic
│   ├── ai/               # AI agents
│   ├── jobs/             # Inngest workers
│   ├── auth/             # Authentication
│   └── client/           # Client SDK
└── docs/                 # Documentation
```

---

## Common Tasks

### Add a New Router

```typescript
// packages/api/src/routers/my-router.ts
import { router, protectedProcedure } from '../trpc.js';
import { z } from 'zod';

export const myRouter = router({
  create: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Your logic here
    }),
});

// Register in app router
// packages/api/src/router.ts
import { myRouter } from './routers/my-router.js';
export const appRouter = router({
  // ... existing routers
  my: myRouter,
});
```

### Add a New Event Handler

```typescript
// packages/jobs/src/handlers/my-handler.ts
import { IEventHandler } from './interface.js';

export class MyHandler implements IEventHandler {
  eventType = 'my.event.type';
  
  async handle(event: SynapEvent): Promise<void> {
    // Handle event
  }
}

// Register in dispatcher
// packages/jobs/src/functions/event-dispatcher.ts
import { MyHandler } from '../handlers/my-handler.js';
registerHandler(new MyHandler());
```

---

## Debugging

### View Logs

```bash
# API logs
pnpm --filter api dev | grep "api"

# Worker logs
pnpm --filter jobs dev | grep "worker"
```

### Database Queries

```bash
# Connect to PostgreSQL
docker compose exec postgres psql -U postgres -d synap

# View events
SELECT * FROM events_v2 ORDER BY created_at DESC LIMIT 10;

# View entities
SELECT * FROM entities LIMIT 10;
```

---

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker compose ps postgres

# Check connection string
echo $DATABASE_URL

# Test connection
pnpm --filter database db:status
```

### Port Conflicts

```bash
# Check what's using port 3000
lsof -i :3000

# Change port in .env
PORT=3001
```

---

**Next**: See [Extending Synap](./extending/overview.md) to learn how to extend the system.

---
sidebar_position: 3
---

# Quickstart

**Get up and running with Synap in 5 minutes**

---

## Prerequisites

- Node.js 20+ and pnpm 8+
- Docker Desktop running
- API keys (Anthropic, OpenAI)

---

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/Synap-core/backend.git
cd backend

# Install dependencies
pnpm install
```

**Alternative**: Fork the repository on GitHub first, then clone your fork.

---

## Step 2: Setup Environment

```bash
# Copy example env file
cp env.local.example .env

# Edit .env and add your API keys
# - ANTHROPIC_API_KEY=sk-ant-...
# - OPENAI_API_KEY=sk-proj-...
```

---

## Step 3: Start Services

```bash
# Start Docker services (PostgreSQL, MinIO, Ory)
docker compose up -d

# Wait for services to be ready (about 30 seconds)
docker compose ps

# Initialize database
pnpm --filter database db:init
```

This will:
- Start all required services in Docker
- Create database schema
- Enable TimescaleDB and pgvector extensions
- Set up Row-Level Security

---

## Step 4: Start Backend

```bash
# Start API server and background jobs
pnpm dev
```

The API server will be available at `http://localhost:3000`.

---

## Step 5: Test It Works

```bash
# Health check
curl http://localhost:3000/health

# Should return: {"status":"ok"}
```

---

## Your First Note

Once the backend is running, you can create your first note using the API or SDK.

### Using cURL

```bash
# First, you'll need to authenticate (see Authentication guide)
# Then create a note:
curl -X POST http://localhost:3000/trpc/notes.create \
  -H "Content-Type: application/json" \
  -H "Cookie: ory_kratos_session=YOUR_SESSION_COOKIE" \
  -d '{
    "content": "# My First Note\n\nThis is my first note with Synap!",
    "title": "My First Note"
  }'
```

### Using the SDK

```typescript
import SynapClient from '@synap/client';

const synap = new SynapClient({
  url: 'http://localhost:3000',
});

// Create a note
const result = await synap.notes.create.mutate({
  content: '# My First Note\n\nThis is my first note with Synap!',
  title: 'My First Note',
});

console.log('Note created:', result.id);
```

---

## What Happens Next?

1. **Event Created**: The note creation triggers an event (`note.creation.requested`)
2. **Event Stored**: The event is stored in TimescaleDB (immutable history)
3. **Worker Processes**: A background worker processes the event
4. **Content Stored**: The note content is uploaded to MinIO
5. **Entity Created**: A database record is created in the `entities` table
6. **Completion Event**: A `note.creation.completed` event is published
7. **Real-time Update**: Your client receives a real-time notification

This is the **event-driven flow** that powers Synap!

---

## Next Steps

- **[Architecture Overview](../architecture/overview.md)** - Understand how Synap works
- **[API Reference](../api/data-pod/overview.md)** - Explore the API
- **[Development Guide](../development/setup.md)** - Start building with Synap
- **[Installation Guide](./installation.md)** - Detailed setup instructions

---

## Troubleshooting

### Services Not Starting

```bash
# Check Docker is running
docker ps

# View logs
docker compose logs postgres
docker compose logs minio

# Restart services
docker compose restart
```

### Database Issues

```bash
# Check database connection
pnpm --filter database db:status

# Re-run migrations
pnpm --filter database db:init
```

### Port Already in Use

```bash
# Change port in .env
PORT=3001
```

---

## Resources

- **GitHub**: [https://github.com/Synap-core/backend](https://github.com/Synap-core/backend)
- **Docker Compose**: `docker compose.yml` in repository root
- **Documentation**: Full docs in `apps/docs/`

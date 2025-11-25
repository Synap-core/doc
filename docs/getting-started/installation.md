---
sidebar_position: 2
---

# Installation

**Complete setup guide for local development and production deployment**

---

## Prerequisites

- **Node.js 20+** and **pnpm 8+**
- **Docker Desktop** (for local services) - Must be installed and running
- **PostgreSQL** (for production) or use Docker Compose
- **API Keys**:
  - Anthropic API key (for AI)
  - OpenAI API key (for embeddings)

---

## Installation Methods

### Option 1: Clone from GitHub (Recommended)

For full development and customization:

```bash
# Clone the repository
git clone https://github.com/Synap-core/backend.git
cd backend

# Install dependencies
pnpm install
```

**Or fork first** (if you plan to contribute):

1. **Fork the repository** on GitHub: [https://github.com/Synap-core/backend](https://github.com/Synap-core/backend)
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR_USERNAME/backend.git
   cd backend
   ```
3. **Add upstream remote** (to sync with main repo):
   ```bash
   git remote add upstream https://github.com/Synap-core/backend.git
   ```
4. **Install dependencies**:
   ```bash
   pnpm install
   ```

The repository includes a `docker-compose.yml` file that sets up all required infrastructure services.


---

## Local Development Setup

### 1. Configure Environment

```bash
# Copy example env file
cp env.local.example .env
```

Edit `.env`:

```env
# Database (PostgreSQL - required)
DATABASE_URL=postgresql://postgres:synap_dev_password@localhost:5432/synap

# Ory Kratos (Identity Provider)
KRATOS_PUBLIC_URL=http://localhost:4433
KRATOS_ADMIN_URL=http://localhost:4434

# Ory Hydra (OAuth2 Server)
HYDRA_PUBLIC_URL=http://localhost:4444
HYDRA_ADMIN_URL=http://localhost:4445
ORY_HYDRA_SECRETS_SYSTEM=please-change-this-secret-key-in-production

# OpenAI (for AI features)
OPENAI_API_KEY=sk-proj-...

# Anthropic (for AI features)
ANTHROPIC_API_KEY=sk-ant-...


# Inngest (optional for local dev - will use dev server)
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=

# Storage (MinIO for local dev)
STORAGE_PROVIDER=minio
MINIO_ENDPOINT=http://localhost:9000
MINIO_ACCESS_KEY_ID=minioadmin
MINIO_SECRET_ACCESS_KEY=minioadmin123
MINIO_BUCKET_NAME=synap-storage

# Environment
NODE_ENV=development
PORT=3000
```

### 2. Start Local Services with Docker Compose

The repository includes a `docker-compose.yml` file that sets up all required services:

```bash
# Start PostgreSQL, MinIO, Redis, and Ory
docker compose up -d

# Verify services are running
docker compose ps
```

**Services started:**
- PostgreSQL (port 5432) - Main database with TimescaleDB + pgvector
- MinIO (ports 9000, 9001) - S3-compatible storage
- Redis (port 6379) - Caching and rate limiting
- Ory Kratos (ports 4433, 4434) - Identity provider
- Ory Hydra (ports 4444, 4445) - OAuth2 server

**Connection URLs:**
- PostgreSQL: `postgresql://postgres:synap_dev_password@localhost:5432/synap`
- MinIO: `http://localhost:9000` (console: `http://localhost:9001`)
- Redis: `redis://localhost:6379`
- Kratos: `http://localhost:4433` (admin: `http://localhost:4434`)
- Hydra: `http://localhost:4444` (admin: `http://localhost:4445`)

### 3. Initialize Database

```bash
# Run migrations
pnpm --filter database db:init

# Or use Drizzle Kit to push schema
pnpm --filter database db:push
```

This will:
- Create all tables
- Enable TimescaleDB and pgvector extensions
- Set up Row-Level Security (RLS)
- Create hypertables for events

### 4. Start Backend

```bash
# Start API server and background jobs
pnpm dev
```

The API server will be available at `http://localhost:3000`.

**Verify it's working:**
```bash
# Health check
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

---

## Production Setup

See the [Production Deployment](../deployment/data-pod/production.md) guide for detailed production setup instructions.

For production, you'll typically:
- Use managed PostgreSQL (Neon, Supabase, Railway)
- Use Cloudflare R2 instead of MinIO
- Deploy to a platform like Vercel, Railway, or Fly.io
- Set up proper environment variables
- Configure SSL/TLS certificates

---

## Troubleshooting

### Docker Services Not Starting

```bash
# Check logs
docker compose logs postgres
docker compose logs minio

# Restart services
docker compose restart

# Recreate containers
docker compose up -d --force-recreate
```

### Database Connection Issues

```bash
# Check PostgreSQL is running
docker compose ps postgres

# Test connection
psql postgresql://postgres:synap_dev_password@localhost:5432/synap

# Check if extensions are enabled
psql postgresql://postgres:synap_dev_password@localhost:5432/synap -c "\dx"
```

### Port Conflicts

If ports are already in use:

```bash
# Check what's using port 3000
lsof -i :3000

# Change port in .env
PORT=3001
```

---

## Next Steps

- **[Quickstart](./quickstart.md)** - Get your first note and chat working
- **[Architecture Overview](../architecture/overview.md)** - Understand the system design
- **[Development Guide](../development/setup.md)** - Start building with Synap

---

## Resources

- **GitHub Repository**: [https://github.com/Synap-core/backend](https://github.com/Synap-core/backend)
- **Docker Compose File**: `docker-compose.yml` (in repository root)
- **Issues**: [GitHub Issues](https://github.com/Synap-core/backend/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Synap-core/backend/discussions)

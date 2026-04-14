---
sidebar_position: 2
---

# Docker Deployment

**One-command deployment with Docker Compose**

---

## Quick Start

```bash
# 1. Clone repository
git clone https://github.com/Synap-core/backend.git
cd backend

# 2. Configure environment
cp env.local.example .env
# Edit .env with your API keys

# 3. Start services
docker compose up -d

# 4. Initialize database
pnpm --filter database db:init

# 5. Start API (in separate terminal)
pnpm dev
```

---

## Services Included

### PostgreSQL + TimescaleDB

```yaml
postgres:
  image: timescale/timescaledb:latest-pg16
  ports:
    - "5432:5432"
  environment:
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  volumes:
    - ./data/postgres:/var/lib/postgresql/data
```

### MinIO (Storage)

```yaml
minio:
  image: minio/minio:latest
  ports:
    - "9000:9000"  # S3 API
    - "9001:9001"  # Console
  environment:
    MINIO_ROOT_USER: ${MINIO_ROOT_USER}
    MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
  volumes:
    - ./data/minio:/data
```

---

## Verification

```bash
# Check services
docker compose ps

# Check API health
curl http://localhost:3000/health

# Check database
docker compose exec postgres psql -U postgres -d synap -c "SELECT COUNT(*) FROM events_v2;"
```

---

## Production Considerations

For production, consider:
- Using **managed PostgreSQL 14+** (Supabase, Railway, AWS RDS, etc.)
- Using Cloudflare R2 instead of MinIO
- Setting up proper backups
- Configuring monitoring

See [Production Deployment](./production.md) for details.

---

**Next**: See [Self-Hosted](./self-hosted.md) for manual setup.

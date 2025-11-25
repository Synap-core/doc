---
sidebar_position: 1
---

# Deployment Overview

**Complete deployment guides for Synap Backend**

---

## Deployment Options

### Self-Hosted Data Pod
- Full control over your data
- Open source
- Requires infrastructure management

See [Self-Hosted Deployment](./data-pod/self-hosted.md)

### Docker Compose
- One-command deployment
- Includes PostgreSQL and MinIO
- Perfect for development

See [Docker Deployment](./data-pod/docker.md)

### Production Cloud
- Managed infrastructure
- Scalable
- High availability

See [Production Deployment](./data-pod/production.md)

---

## Prerequisites

- ✅ PostgreSQL with TimescaleDB extension
- ✅ Cloudflare R2 or MinIO for storage
- ✅ API keys (Anthropic, OpenAI)
- ✅ Inngest (cloud or self-hosted)
- ✅ Ory Kratos and Hydra (for authentication)

---

## Quick Start

### Docker Compose (Development)

```bash
# 1. Create .env
cp env.local.example .env
# Add your API keys

# 2. Start services
docker compose up -d

# 3. Initialize database
pnpm --filter database db:init

# 4. Start backend
pnpm dev
```

---

## Checklist

### Configuration
- [ ] Environment variables configured
- [ ] Database initialized
- [ ] Migrations applied
- [ ] Storage configured

### Security
- [ ] Secrets secured (not in code)
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] Auth configured

### Monitoring
- [ ] Health checks configured
- [ ] Logs centralized
- [ ] Alerts configured

---

**Next**: See specific deployment guides for detailed instructions.


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

See [Self-Hosted Deployment](./data-pod/self-hosted)

### Docker Compose
- One-command deployment
- Includes PostgreSQL and MinIO
- Perfect for development

See [Docker Deployment](./data-pod/docker)

### Production Cloud
- Managed infrastructure
- Scalable
- High availability

See [Production Deployment](./data-pod/production)

---

## Prerequisites

- ✅ PostgreSQL 15+ with pgvector extension
- ✅ Typesense for full-text search
- ✅ Cloudflare R2 or MinIO for file storage
- ✅ API keys for AI providers (via OpenRouter)
- ✅ Node.js 20+

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

---

:::info Learn more on the website
- [Self-Hosting guide](https://www.synap.live/guides/self-hosting) — practical overview of deploying and running Synap on your own infrastructure
- [Data Pods](https://www.synap.live/product/pods) — learn about Synap's sovereign data architecture
:::


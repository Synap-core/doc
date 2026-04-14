---
sidebar_position: 3
---

# Production Deployment

**Production deployment guide for Synap Data Pod**

---

## Prerequisites

- ✅ Managed PostgreSQL (TimescaleDB + pgvector)
- ✅ Cloudflare R2 (or S3-compatible storage)
- ✅ Ory Kratos + Hydra instances
- ✅ Inngest (cloud or self-hosted)
- ✅ Domain name and SSL certificate

---

## Environment Configuration

### Database

```env
DATABASE_URL=postgresql://user:password@host:5432/synap
```

**Requirements**:
- PostgreSQL 16+
- TimescaleDB extension
- pgvector extension
- Row-Level Security enabled

### Storage

```env
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=synap-storage
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

### Authentication

```env
KRATOS_PUBLIC_URL=https://kratos.yourdomain.com
KRATOS_ADMIN_URL=https://kratos-admin.yourdomain.com
HYDRA_PUBLIC_URL=https://hydra.yourdomain.com
HYDRA_ADMIN_URL=https://hydra-admin.yourdomain.com
ORY_HYDRA_SECRETS_SYSTEM=your-secret-key
```

### AI Services

```env
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-proj-...
```

---

## Deployment Steps

### 1. Database Setup

```bash
# Connect to managed PostgreSQL
# Enable extensions
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS vector;

# Run migrations
pnpm --filter database db:init
```

### 2. Storage Setup

```bash
# Create R2 bucket
# Configure CORS
# Set up public URL (if needed)
```

### 3. Deploy API

```bash
# Build
pnpm build

# Deploy to your platform (Vercel, Railway, etc.)
# Set environment variables
# Start API server
```

### 4. Configure Inngest

```bash
# Set Inngest credentials
INNGEST_EVENT_KEY=your-key
INNGEST_SIGNING_KEY=your-signing-key
```

---

## Security Checklist

- [ ] Environment variables secured (not in code)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] SSL/TLS certificates valid
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Log aggregation configured

---

## Monitoring

### Health Checks

```bash
# API health
curl https://api.yourdomain.com/health

# Database health
# Check connection pool
# Monitor query performance
```

### Metrics

- Event processing rate
- API response times
- Database query performance
- Storage usage
- Error rates

---

**Next**: See [Database Setup](../infrastructure/database.md) for database setup details.

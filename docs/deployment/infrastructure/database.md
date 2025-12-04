---
sidebar_position: 1
---

# Database Setup

**PostgreSQL configuration for production**

---

## Requirements

- **PostgreSQL**: 16+ (LTS recommended)
- **TimescaleDB**: 2.x (for time-series events)
- **pgvector**: Latest (for semantic search)

---

## Installation

### Managed Services (Recommended)

- **Supabase**: Managed PostgreSQL with extensions
- **Railway**: Easy deployment with PostgreSQL
- **AWS RDS**: Enterprise-grade managed PostgreSQL
- **Any PostgreSQL 14+**: Cloud, managed, or self-hosted

### Self-Hosted

```bash
# Ubuntu/Debian
sudo apt install postgresql-16 postgresql-contrib-16
sudo apt install timescaledb-2-postgresql-16
sudo apt install postgresql-16-pgvector

# Configure
sudo timescaledb-tune
sudo systemctl restart postgresql
```

---

## Current Architecture

Synap uses a **pure PostgreSQL 14+** approach with two complementary database clients:

### Database Clients

#### postgres.js
- **Purpose**: Connection management and raw SQL queries
- **Use For**: Complex queries, PostgreSQL-specific features, performance-critical operations

#### Drizzle ORM
- **Purpose**: Type-safe query building and schema management
- **Use For**: CRUD operations, schema definitions, type-safe queries

**Why Both?**
- **Flexibility**: Raw SQL for complex queries, ORM for simple operations
- **Performance**: postgres.js is one of the fastest PostgreSQL clients
- **Type Safety**: Drizzle provides full TypeScript support
- **Cost Control**: Works with any PostgreSQL 14+ provider

**Compatible With:**
- Supabase
- Railway
- AWS RDS
- Google Cloud SQL
- Self-hosted PostgreSQL
- Any PostgreSQL 14+ provider

---

## Configuration

### Enable Extensions

```sql
-- Connect to database
\c synap

-- Enable TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify
\dx
```

### Create Hypertable

```sql
-- Events table should be a hypertable
SELECT create_hypertable('events_v2', 'created_at');
```

---

## Performance Tuning

### Connection Pooling

```env
# Use connection pooler (PgBouncer)
DATABASE_URL=postgresql://user:pass@host:5432/synap?pgbouncer=true
```

### Query Optimization

```sql
-- Set work_mem for heavy queries
SET work_mem = '256MB';

-- Analyze tables regularly
ANALYZE events_v2;
ANALYZE entities;
```

### Indexes

```sql
-- Ensure indexes exist
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events_v2(user_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events_v2(type);
CREATE INDEX IF NOT EXISTS idx_entities_user_id ON entities(user_id);
```

---

## Backup Strategy

### Automated Backups

```bash
# Daily backup script
#!/bin/bash
pg_dump -U synap_user synap | gzip > backup_$(date +%Y%m%d).sql.gz

# Keep last 30 days
find . -name "backup_*.sql.gz" -mtime +30 -delete
```

### Point-in-Time Recovery

Configure WAL archiving for point-in-time recovery:

```conf
# postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backup/wal/%f'
```

---

## Monitoring

### Key Metrics

- Connection pool usage
- Query performance
- Table sizes
- Index usage
- Replication lag (if applicable)

---

**Next**: See [Storage Setup](./storage.md) for file storage configuration.

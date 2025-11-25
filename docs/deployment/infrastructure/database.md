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

- **Neon**: Serverless PostgreSQL with TimescaleDB
- **Supabase**: Managed PostgreSQL with extensions
- **AWS RDS**: Managed PostgreSQL (manual extension setup)

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
# Use connection pooler (PgBouncer or Neon's pooler)
DATABASE_URL=postgresql://user:pass@host:5432/synap?pgbouncer=true
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

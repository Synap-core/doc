---
sidebar_position: 1
---

# Self-Hosted Deployment

**Complete guide for self-hosting your Data Pod**

---

## Overview

Self-hosting gives you complete control over your data and infrastructure. This guide covers manual setup without Docker.

---

## Prerequisites

- **Server**: VPS or dedicated server (2GB RAM minimum)
- **PostgreSQL**: 16+ with TimescaleDB and pgvector
- **Node.js**: 20+ LTS
- **pnpm**: 8.15+
- **Storage**: R2, S3, or MinIO

---

## Step 1: Install PostgreSQL

### Ubuntu/Debian

```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql-16 postgresql-contrib-16

# Install TimescaleDB
sudo apt install timescaledb-2-postgresql-16

# Install pgvector
sudo apt install postgresql-16-pgvector

# Configure
sudo timescaledb-tune
sudo systemctl restart postgresql
```

### Create Database

```bash
sudo -u postgres psql

CREATE DATABASE synap;
CREATE USER synap_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE synap TO synap_user;

\c synap
CREATE EXTENSION IF NOT EXISTS timescaledb;
CREATE EXTENSION IF NOT EXISTS vector;
```

---

## Step 2: Install Node.js

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Install pnpm
npm install -g pnpm
```

---

## Step 3: Clone and Setup

```bash
# Clone repository
git clone https://github.com/synap/synap-backend.git
cd synap-backend

# Install dependencies
pnpm install

# Configure environment
cp env.local.example .env
# Edit .env with your configuration
```

---

## Step 4: Initialize Database

```bash
# Run migrations
pnpm --filter database db:init

# Verify
pnpm --filter database db:status
```

---

## Step 5: Setup Storage

### Option A: Cloudflare R2

```env
STORAGE_PROVIDER=r2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=synap-storage
```

### Option B: MinIO (Self-Hosted)

```bash
# Install MinIO
wget https://dl.min.io/server/minio/release/linux-amd64/minio
chmod +x minio
./minio server /data/minio --console-address ":9001"
```

---

## Step 6: Setup Ory

### Install Ory Kratos + Hydra

```bash
# Using Docker Compose (recommended)
# See Ory documentation for setup
```

---

## Step 7: Run Services

### Development

```bash
pnpm dev
```

### Production (PM2)

```bash
# Install PM2
npm install -g pm2

# Start API
pm2 start apps/api/src/index.ts --name synap-api

# Start Workers
pm2 start apps/jobs/src/index.ts --name synap-jobs

# Save configuration
pm2 save
pm2 startup
```

---

## Maintenance

### Backups

```bash
# Database backup
pg_dump -U synap_user synap > backup.sql

# Restore
psql -U synap_user synap < backup.sql
```

### Updates

```bash
# Pull latest changes
git pull

# Install dependencies
pnpm install

# Run migrations
pnpm --filter database db:migrate

# Restart services
pm2 restart all
```

---

**Next**: See [Docker Deployment](./docker.md) for easier setup.

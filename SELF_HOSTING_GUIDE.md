# Synap Self-Hosting Guide

This guide explains how to host your own Synap Data Pod — a personal server that stores your data and runs the Synap backend.

---

## What is a Data Pod?

A Data Pod is your own dedicated Synap backend. When you self-host, your data never touches Synap's infrastructure — it lives entirely on your server.

The pod runs:
- **Synap Backend** (tRPC API, auth, real-time collaboration)
- **PostgreSQL** (your data store)
- **Ory Kratos** (authentication)
- **MinIO** (file storage)

---

## Prerequisites

- A Linux server (Ubuntu 22.04 recommended) with at least 2 GB RAM and 20 GB disk
- A domain name with the ability to set DNS records
- Docker and Docker Compose installed
- A Synap account (free — used to register your pod)

---

## Quick Start

### 1. Register your pod with the Control Plane

Visit [app.synap.live/settings/pod](https://app.synap.live/settings/pod) → "Add self-hosted pod"

Provide:
- Your subdomain (e.g., `mypod`)  → your pod will be at `mypod.synap.live`
- Your server's public IP address

The Control Plane will:
- Create a DNS record pointing to your server
- Give you a provisioning token (valid for 24 hours)
- Provide an install command

### 2. Point DNS to your server

If you're using a **custom domain** instead of `*.synap.live`, create an `A` record:
```
mypod.yourdomain.com  →  <your-server-ip>
```

### 3. Run the installer

SSH into your server and run the provided install command:
```bash
curl -fsSL https://raw.githubusercontent.com/Synap-core/backend/v1.2.0/deploy/install.sh | sudo bash -s -- --token <your-token>
```

The installer will:
1. Install Docker and dependencies
2. Download the Synap docker-compose configuration
3. Configure SSL via Let's Encrypt
4. Start all services
5. Register the pod with the Control Plane

Installation takes 5–10 minutes.

---

## Manual Installation (Advanced)

If you prefer to configure everything yourself:

### 1. Clone the configuration

```bash
mkdir -p /opt/synap && cd /opt/synap
curl -O https://raw.githubusercontent.com/Synap-core/backend/v1.2.0/deploy/docker-compose.self-hosted.yml
curl -O https://raw.githubusercontent.com/Synap-core/backend/v1.2.0/deploy/.env.example
cp .env.example .env
```

### 2. Configure environment variables

Edit `/opt/synap/.env`:

```env
# Required
DOMAIN=mypod.yourdomain.com
LETSENCRYPT_EMAIL=you@example.com

# Synap Control Plane connection
PROVISIONING_TOKEN=<token from control plane>

# Intelligence Hub (optional — required for AI features)
INTELLIGENCE_HUB_URL=https://intelligence.synap.live
INTELLIGENCE_API_KEY=<your intelligence API key>

# Database (auto-generated if not set)
POSTGRES_PASSWORD=<strong-random-password>

# Auth secret (min 32 chars)
KRATOS_SECRETS_DEFAULT=<random-32-char-string>
```

### 3. Start the services

```bash
cd /opt/synap
docker compose -f docker-compose.self-hosted.yml up -d
```

### 4. Configure SSL

The Caddy reverse proxy handles SSL automatically via Let's Encrypt. Ensure port 80 and 443 are open on your firewall.

---

## Required Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DOMAIN` | Yes | Your pod's domain (e.g., `mypod.yourdomain.com`) |
| `LETSENCRYPT_EMAIL` | Yes | Email for SSL certificate notifications |
| `PROVISIONING_TOKEN` | Yes (once) | One-time token from Control Plane |
| `POSTGRES_PASSWORD` | Yes | Strong password for database |
| `KRATOS_SECRETS_DEFAULT` | Yes | 32+ char secret for auth |
| `INTELLIGENCE_HUB_URL` | Optional | URL of Intelligence Hub for AI features |
| `INTELLIGENCE_API_KEY` | Optional | API key for Intelligence Hub access |

---

## DNS Configuration

### Using `*.synap.live` subdomain (recommended)
- Handled automatically by the Control Plane during registration
- No action needed on your part

### Using a custom domain
Create these DNS records:
```
A    mypod.yourdomain.com    <your-server-ip>
```

If you want to serve the Synap desktop app from your domain:
```
A    app.yourdomain.com      <your-server-ip>
```

---

## Firewall Requirements

Open these ports on your server:
```
22   TCP   SSH (restrict to your IP if possible)
80   TCP   HTTP (Let's Encrypt challenge)
443  TCP   HTTPS (all Synap traffic)
```

Using `ufw`:
```bash
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable
```

---

## Updating Your Pod

### Automatic updates (default)
Pods with `updatePolicy = auto_latest` receive rolling updates automatically when a new image is published.

### Manual update
```bash
cd /opt/synap
docker compose pull
docker compose up -d
```

Or use the Control Plane dashboard → Your Pod → "Check for updates"

---

## Registering with the Control Plane

Your pod communicates with the Synap Control Plane for:
- Subscription and billing verification
- Intelligence Hub access coordination
- Receiving package definitions

To register or re-register:
```bash
curl -X POST https://api.synap.live/self-hosting/register \
  -H "Authorization: Bearer <your-synap-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "subdomain": "mypod",
    "serverIp": "<your-ip>",
    "domain": "mypod.yourdomain.com"
  }'
```

---

## Troubleshooting

### SSL certificate not issuing
- Ensure ports 80 and 443 are publicly accessible
- Check that DNS has propagated: `dig mypod.yourdomain.com`
- View Caddy logs: `docker logs synap-caddy`

### Services not starting
```bash
cd /opt/synap
docker compose logs
docker compose ps
```

### Can't connect from the Synap desktop app
1. Verify your pod URL is correct in Settings → Pod
2. Check that the backend health endpoint responds: `curl https://mypod.yourdomain.com/health`
3. Verify Kratos is running: `docker ps | grep kratos`

### Intelligence features not working
1. Ensure `INTELLIGENCE_HUB_URL` is set in your `.env`
2. Verify your subscription includes intelligence access
3. Check intelligence access: `curl https://mypod.yourdomain.com/trpc/intelligence.getStatus`

---

## Backup and Recovery

### Automated backups
Enable daily PostgreSQL backups by adding to your `docker-compose.self-hosted.yml`:
```yaml
pgbackup:
  image: prodrigestivill/postgres-backup-local:16
  environment:
    - POSTGRES_HOST=postgres
    - POSTGRES_USER=synap
    - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    - POSTGRES_DB=synap
    - SCHEDULE=@daily
    - BACKUP_KEEP_DAYS=7
  volumes:
    - ./backups:/backups
```

### Manual backup
```bash
docker exec synap-postgres pg_dump -U synap synap > backup-$(date +%Y%m%d).sql
```

### Restore
```bash
docker exec -i synap-postgres psql -U synap synap < backup-YYYYMMDD.sql
```

---

## Data Privacy

When self-hosting:
- All your Synap data (entities, documents, messages) stays on your server
- The Control Plane only stores: your email, subscription status, pod domain, and pod IP
- Intelligence Hub calls may be routed through Synap infrastructure (for AI processing) — this can be configured to use your own model provider
- No telemetry is sent without your consent

# Synap Operations Runbook

This runbook covers on-call procedures for the Synap platform.

---

## Service Overview

| Service | Docker container | Restart command |
|---------|-----------------|----------------|
| Control Plane API | `synap-control-plane` | `docker restart synap-control-plane` |
| PostgreSQL | `synap-postgres` | `docker restart synap-postgres` |
| Redis | `synap-redis` | `docker restart synap-redis` |
| Trigger.dev Worker | `synap-trigger-worker` | `docker restart synap-trigger-worker` |
| Backend (per pod) | runs inside each pod VM | SSH to pod, `docker restart synap-backend` |
| Intelligence Hub | separate deploy | See intelligence hub deploy docs |

---

## 1. How to Restart Each Service

### Control Plane (SaaS managed)
```bash
# On the control plane host
docker compose -f docker-compose.prod.yml restart control-plane

# Check logs
docker logs --tail=100 synap-control-plane

# Check health
curl https://api.synap.live/ready
```

### Backend (per pod)
```bash
# SSH to the pod
ssh root@<pod-subdomain>.synap.live

# Check service status
docker ps
docker logs --tail=100 synap-backend

# Restart
docker restart synap-backend

# If Docker compose is used
cd /opt/synap && docker compose restart backend
```

### Intelligence Hub
Follow the intelligence service deployment docs for the specific hosting setup.

---

## 2. How to Check Provisioning Logs for a Failed Pod

### Via Control Plane API
```bash
# Get provisioning logs for a specific pod
curl -H "X-Internal-Key: $SYNAP_POD_INTERNAL_KEY" \
  https://api.synap.live/internal/pods/<podId>/logs
```

### Via Database (direct SQL)
```sql
-- Get pod status
SELECT id, subdomain, status, status_message, created_at, provisioned_at
FROM data_pods WHERE id = '<podId>';

-- Get provisioning step logs
SELECT step, status, output, started_at, completed_at
FROM provisioning_logs
WHERE data_pod_id = '<podId>'
ORDER BY created_at;
```

### Via Trigger.dev Dashboard
Open https://app.trigger.dev → Jobs → `provision-pod` → find the run by pod ID.
The run shows each step with its output, duration, and any errors.

### On the pod VM (for install failures)
```bash
ssh root@<subdomain>.synap.live
cat /var/log/synap-install.log
journalctl -u cloud-init --no-pager | tail -100
docker ps -a
```

---

## 3. How to Manually Re-trigger a Provisioning Job

If a provisioning job failed and the pod is in `error` status, you can:

### Option A: Reset and retry via Control Plane dashboard
1. Open https://api.synap.live/admin
2. Find the pod by ID or user email
3. Click "Retry Provisioning"
4. Monitor status in provisioning logs

### Option B: Via API
```bash
curl -X POST https://api.synap.live/internal/pods/<podId>/reprovision \
  -H "X-Internal-Key: $SYNAP_POD_INTERNAL_KEY" \
  -H "Content-Type: application/json"
```

### Option C: Direct Trigger.dev event
```bash
# Using Trigger.dev CLI
trigger send pod.provision '{
  "podId": "<podId>",
  "userId": "<userId>",
  "subscriptionId": "<subscriptionId>",
  "deploymentMode": "full_managed",
  "config": {
    "subdomain": "<subdomain>",
    "provider": "hetzner",
    "serverType": "cx21",
    "email": "<user-email>"
  }
}'
```

**Note:** Before retrying, reset pod status to `pending` in the database:
```sql
UPDATE data_pods
SET status = 'pending', status_message = NULL, updated_at = NOW()
WHERE id = '<podId>';
```

---

## 4. How to Roll Back a Bad Deploy

### Control Plane API

```bash
# On the control plane host
# Pull previous image (if tagged)
docker pull synap-control-plane:<previous-tag>

# Update docker-compose to use previous tag
vim docker-compose.prod.yml  # change 'latest' to previous tag

# Restart with previous image
docker compose -f docker-compose.prod.yml up -d control-plane
```

### If using CI/CD deployment
```bash
# Find the previous deployment tag in Git
git log --oneline --tags | head -10

# Trigger a rollback deploy from CI with previous tag
# (depends on your CI setup — typically re-run the deploy workflow with a specific tag)
```

### Database migrations rollback
```bash
# Drizzle doesn't have automatic rollback — you need to manually revert
# 1. Connect to the database
psql $DATABASE_URL

# 2. Check what migration was last applied
SELECT * FROM drizzle_migrations ORDER BY created_at DESC LIMIT 5;

# 3. Manually revert the schema change (requires writing inverse SQL)
# 4. Delete the migration record
DELETE FROM drizzle_migrations WHERE hash = '<migration-hash>';
```

**Best practice**: Before any migration, take a manual backup:
```bash
docker exec synap-postgres pg_dump -U synap synap_control_plane > backup-$(date +%Y%m%d).sql
```

---

## 5. How to Restore from DB Backup

### Automated backups
Daily backups are stored in `/backups/` on the control plane host (via `pgbackup` container).

Files are named: `synap_control_plane-YYYY-MM-DDTHH:MM:SSZ.sql.gz`

### Restore procedure
```bash
# 1. Stop the control plane to prevent writes during restore
docker stop synap-control-plane

# 2. Decompress the backup
gunzip < /backups/synap_control_plane-2026-03-01T00:00:00Z.sql.gz > restore.sql

# 3. Drop and recreate the database
docker exec -it synap-postgres psql -U synap -c "DROP DATABASE synap_control_plane;"
docker exec -it synap-postgres psql -U synap -c "CREATE DATABASE synap_control_plane;"

# 4. Restore
docker exec -i synap-postgres psql -U synap synap_control_plane < restore.sql

# 5. Restart the control plane
docker start synap-control-plane

# 6. Verify health
curl https://api.synap.live/ready
```

---

## 6. Emergency Contacts / Escalation

| Role | Contact | When to contact |
|------|---------|----------------|
| On-call engineer | Check PagerDuty rotation | Any P0/P1 incident |
| Infrastructure lead | — | DNS outage, Hetzner issues |
| Security | — | Data breach, unauthorized access |
| Stripe support | https://support.stripe.com | Webhook failures, billing disputes |
| Hetzner support | https://console.hetzner.cloud | Server creation failures, IP issues |
| Cloudflare support | https://dash.cloudflare.com | DNS propagation issues |
| Sentry | https://sentry.io | Error tracking configuration |

### Incident Severity

| Level | Description | Response Time |
|-------|-------------|---------------|
| P0 | All users affected, service down | Immediate |
| P1 | Provisioning broken, >10% users affected | 30 minutes |
| P2 | Degraded performance, minor features broken | 4 hours |
| P3 | Minor bug, workaround available | Next business day |

---

## 7. Common Incidents

### "Provisioning jobs are timing out"
1. Check Hetzner API status: https://status.hetzner.com
2. Check Cloudflare API status: https://www.cloudflarestatus.com
3. Check Trigger.dev worker: `docker logs synap-trigger-worker`
4. If workers are dead: `docker restart synap-trigger-worker`

### "Stripe webhooks not processing"
1. Check Stripe webhook dashboard for failed deliveries
2. Verify `STRIPE_WEBHOOK_SECRET` matches the Stripe dashboard
3. Check control plane logs: `docker logs synap-control-plane | grep webhook`
4. Manually replay failed events from Stripe dashboard

### "Redis is down, rate limiting broken"
1. Rate limiting fails **open** (requests still succeed, just unthrottled) — not an emergency
2. Restart Redis: `docker restart synap-redis`
3. If data is corrupted: `docker exec synap-redis redis-cli FLUSHALL` (loses rate limit state, safe)

### "Pod health check returning 503"
1. Check which dependency: `curl https://api.synap.live/status`
2. Most likely: database connection issue or Redis down
3. Fix the dependency, service auto-recovers

### "User can't log in"
1. Check if Ory Kratos is running (on the pod): `ssh root@<pod> docker ps | grep kratos`
2. Check Kratos logs: `ssh root@<pod> docker logs synap-kratos`
3. Session issues: user may need to clear cookies and try again

# Synap Monitoring Guide

## Overview

Synap has three services that require monitoring:

| Service | Port | Health URL | Sentry DSN env var |
|---------|------|-----------|-------------------|
| Control Plane API | 3001 | `/ready` | `SENTRY_DSN` |
| Backend (Data Pod) | 3000 | `/health` | (see backend env) |
| Intelligence Hub | 4000 | `/health` | `SENTRY_DSN` |

---

## Sentry Setup

### Control Plane API
1. Create a Sentry project of type "Node.js"
2. Copy the DSN and add to `.env`:
   ```
   SENTRY_DSN=https://xxxx@o0.ingest.sentry.io/0000
   ```
3. Sentry is only active in `NODE_ENV=production`

### Backend (Data Pod)
Each pod has its own Sentry configuration. Set in the pod's `.env`:
```
SENTRY_DSN=https://xxxx@o0.ingest.sentry.io/0000
```

### Intelligence Hub
Set in `synap-intelligence-service/apps/intelligence-hub/.env`:
```
SENTRY_DSN=https://xxxx@o0.ingest.sentry.io/0000
```

### Alert Rules (configure in Sentry dashboard)
- **Error rate**: Alert when error rate exceeds 1% over 5 minutes
- **New issue**: Alert on any new error type (first occurrence)
- **Performance**: Alert when p95 response time exceeds 2 seconds
- **Provisioning errors**: Alert on `provision-pod-job` errors (tag: `module:provision-pod-job`)

---

## Health Endpoints

### Control Plane API

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `GET /health` | Liveness probe — is the process running? | None |
| `GET /ready` | Readiness probe — is the service ready to accept traffic? | None |
| `GET /status` | Detailed status for dashboards | None |

`/ready` response:
```json
{
  "status": "healthy|degraded|unhealthy",
  "dependencies": {
    "database": "healthy",
    "redis": "healthy",
    "intelligenceHub": "healthy",
    "stripe": "healthy"
  }
}
```

`/status` includes memory usage, CPU stats, uptime, and per-dependency latency.

### Backend (Data Pod)

| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Basic liveness — returns `{ status: "ok" }` |

### Intelligence Hub
| Endpoint | Purpose |
|----------|---------|
| `GET /health` | Liveness + model provider reachability check |

---

## Uptime Monitoring (BetterStack / UptimeRobot)

Set up external monitors for:
- `https://api.synap.live/ready` — check every 1 minute, alert if non-200 for >2 minutes
- `https://intelligence.synap.live/health` — check every 5 minutes

**Alert escalation**: uptime monitor → Slack #alerts → PagerDuty (if configured)

---

## Logging Guidelines

### Log Levels

| Level | When to use | Example |
|-------|-------------|---------|
| `debug` | Verbose development details | SQL queries in dev |
| `info` | Normal operations | "Server started", "Pod provisioned" |
| `warn` | Recoverable issues | "CP tier lookup failed, defaulting to solo" |
| `error` | Unexpected failures requiring attention | "Webhook handler error", "DNS timeout" |

### PII Rules
- **Never** log email addresses, phone numbers, or payment data
- Log `userId` (internal ID) — NOT email or name
- Log `podId`, `subscriptionId`, `workspaceId` for traceability
- Strip auth headers in Sentry `beforeSend` (already configured)

### Structured Logging
All services use `pino` (or similar) for structured JSON logs:
```ts
logger.info({ podId, tier, userId }, "Pod provisioned successfully");
```

---

## Key Metrics to Watch

### Provisioning
- **Success rate**: provisioning jobs that reach `status=active` / total triggered
- **Duration**: average time from `pod.provision` event to `status=active`
- **Failure reasons**: top errors in `statusMessage` column of `data_pods`

Query:
```sql
SELECT
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (provisioned_at - created_at))/60)::int as avg_minutes
FROM data_pods
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY status;
```

### Webhooks
- **Delivery rate**: Stripe dashboard → Webhooks → check for failed events
- **Retry count**: High retries indicate our endpoint was returning 5xx (now fixed: always returns 200)

### Intelligence
- **AI response latency**: logged per agent type in Intelligence Hub
- **Token usage**: via `intelligence_access.monthly_token_limit` vs actual usage
- **Active access records**: pods with `is_active = true`

### Pods
- **Active pods by status**: `SELECT status, COUNT(*) FROM data_pods GROUP BY status`
- **Error pods**: `SELECT * FROM data_pods WHERE status = 'error' ORDER BY updated_at DESC`

---

## Pod Failure Alerting

When a pod transitions to `error` status:
1. Sentry captures the error with pod context (`podId`, `workspaceId`, `step`)
2. User receives an email: "Pod setup failed, our team has been notified"
3. Control Plane dashboard shows the pod in `error` state

To check failure details:
```sql
SELECT step, status, output, started_at, completed_at
FROM provisioning_logs
WHERE data_pod_id = '<podId>'
ORDER BY created_at;
```

---

## On-Call Response

See `docs/RUNBOOK.md` for step-by-step incident response procedures.

### Quick Reference

| Symptom | First check | Fix |
|---------|------------|-----|
| Pod stuck in `creating_server` | Hetzner API status | Retry or check API quota |
| Pod stuck in `waiting_dns` | Cloudflare dashboard | Verify DNS record was created |
| Pod stuck in `waiting_health` | SSH to server, check `/var/log/synap-install.log` | Restart Docker or re-run installer |
| Webhook not processing | Stripe dashboard → Events | Check signature secret in env |
| Rate limit errors | Redis health check | Restart Redis or check `REDIS_URL` |
| 503 from `/ready` | `/status` endpoint for detail | Fix whichever dependency is unhealthy |

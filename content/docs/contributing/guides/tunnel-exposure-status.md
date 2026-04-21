---
sidebar_position: 9
title: 'Tunnel Exposure Status'
description: Documentation covering Tunnel Exposure Status
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
hide_title: false
toc: true
---

# Pod Exposure & Tunnels — Current State

**What works today, what's deliberately parked, and how the pieces connect**

Synap exposes pods to the internet through one of two paths today. This document captures the final architecture after the 2026-04-18 consolidation, including what each piece does, where secrets live, and how to debug when things go wrong.

---

## The two exposure paths

```
┌──────────────────────────────────────────────────────────────────┐
│  Path 1 — CP-managed (Synap Cloud)                               │
│  ──────────────────────────────────                              │
│  Operator: user on synap.live                                    │
│  Orchestrator: Control Plane provision job                       │
│  Modes supported: direct_dns, cloudflare_tunnel                  │
│  Secrets: CP holds the master Cloudflare account token           │
│  Tokens/tunnel ids: stored per-pod in data_pods.exposure_metadata│
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│  Path 2 — Self-hosted (operator runs everything)                 │
│  ────────────────────────────────────────────────                │
│  Operator: user on their own server                              │
│  Orchestrator: ./synap bash CLI on the pod host                  │
│  Modes supported: direct exposure via Caddy; optional            │
│                   Cloudflare tunnel OR Pangolin tunnel           │
│  Secrets: operator provides their own tunnel token               │
│  Tokens: stored in .env on the pod host                          │
└──────────────────────────────────────────────────────────────────┘
```

**Pangolin is Path 2 only** — Synap does not operate a Pangolin server. Operators who want Pangolin run the fosrl/pangolin server themselves and feed their newt token into their pod via `./synap tunnel enable pangolin`.

---

## Path 1 — CP-managed flow

### Modes enum (database)

`data_pods.exposure_mode` is a Postgres enum. Valid values:
- `direct_dns` — CP creates an A record pointing at the pod's server IP. Caddy on the pod handles TLS.
- `cloudflare_tunnel` — CP creates a per-pod tunnel in its master Cloudflare account, sets the ingress rule, creates a proxied CNAME, and passes the connector token to the pod-agent. The `cloudflared` container on the pod authenticates to Cloudflare and tunnels traffic inward.

`pangolin_tunnel` is **no longer a valid value** (migration `0026_remove_pangolin_exposure_mode.sql`). Any pod previously stuck with this value is automatically mapped to `direct_dns` by that migration.

### Provision flow (`cloudflare_tunnel` example)

```bash

1. User creates pod with exposureMode='cloudflare_tunnel' via CP API
   → Route guard: isExposureModeEnabled() — returns 501 if feature flag off
   → Pod row inserted with status='pending', exposureMode persisted

2. Provision job runs (src/jobs/provision-pod.ts)
   a. Create Hetzner server, get serverIp
   b. exposureMode = pod.exposureMode || 'direct_dns'
   c. Load persisted exposureMetadata (for idempotent retries)
   d. getExposureProvider(exposureMode).configure(exposureInput)
      → For cloudflare_tunnel:
        - If metadata.tunnelId exists: reuse the tunnel (idempotent retry)
        - Else: POST /accounts/:id/cfd_tunnel → { id, token }
        - PUT /accounts/:id/cfd_tunnel/:id/configurations
            ingress: [{ hostname, service: "http://backend:4000" }]
        - POST /zones/:id/dns_records
            type: CNAME, content: <tunnelId>.cfargotunnel.com, proxied: true
        - Returns: {
            env: { CLOUDFLARED_TUNNEL_TOKEN: <connector_token> },
            profiles: ["cloudflare-tunnel"],
            metadata: { tunnelId, dnsRecordId, tunnelName, hostname }
          }
   e. Persist result.metadata → pod.exposureMetadata
   f. lastExposureStatus='pending', lastExposureCheckAt=now()

3. Pod-agent configure call (JWT-signed)
   → pod-agent writes CLOUDFLARED_TUNNEL_TOKEN=<token> to .env
   → pod-agent runs: docker compose --profile cloudflare-tunnel up -d
   → cloudflared container starts, authenticates to Cloudflare

4. Verify loop (up to 5 minutes)
   → exposureProvider.verify() polls Cloudflare tunnel status API
   → On healthy: lastExposureStatus='ok', lastExposureError=null
   → On timeout: lastExposureStatus='failed',
                 lastExposureError='verification timeout: <reason>'

```

### Deprovision flow

```yaml

1. Snapshot pod (including exposure_metadata) BEFORE any destructive action
2. DNS: getDnsProvider().deleteARecord(subdomain) — handles direct_dns CNAMEs too
3. Exposure teardown: getExposureProvider(mode).teardown({ ...snapshot, metadata })
   → For cloudflare_tunnel: delete CNAME, delete tunnel (cascade=true)
   → For direct_dns: no-op (DNS already deleted above)
   → Non-fatal: logs + continues if teardown throws
4. Delete server

```

The `metadata` argument threads through so the provider can find the right external resources to clean up. Without it, CF tunnels leak.

### Observability (new columns)

`data_pods` gained three columns in migration `0025`:
- `last_exposure_check_at` — timestamp of last verify attempt
- `last_exposure_status` — `'ok' | 'pending' | 'failed'`
- `last_exposure_error` — human-readable error message, null when status='ok'

Surfaced in `GET /pods/:id` response so the CP dashboard can show "Exposure failed: verification timeout: tunnel_status_down" instead of a generic pod error.

### Environment variables required (CP)

| Var | Required for | Notes |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | DNS + Tunnels | Bearer token, needs DNS + Tunnel scopes |
| `CLOUDFLARE_ZONE_ID` | DNS + Tunnels | The zone Synap manages records under |
| `CLOUDFLARE_ACCOUNT_ID` | **Tunnels only** | Added 2026-04-18. Tunnels are account-scoped |
| `EXPOSURE_CLOUDFLARE_TUNNEL_ENABLED` | Gate flag | Default `false`. Must be `true` to accept `exposureMode='cloudflare_tunnel'` |

If the flag is off but a request asks for `cloudflare_tunnel`, the route returns 501 with an actionable message. The factory's silent fallback to `direct_dns` is a safety net, not a contract.

---

## Path 2 — Self-hosted flow

Operators who don't use Synap Cloud expose their pods themselves. Three sub-paths:

### Direct (Caddy-only)

Default. No tunnel. Operator points DNS at their server and Caddy handles TLS via Let's Encrypt. Nothing to configure on top of the base install.

### Cloudflare Tunnel (operator-provided token)

```bash
# At install time:
./synap install --domain example.com --tunnel cloudflare --tunnel-token <TOKEN>

# After install:
./synap tunnel enable cloudflare --token <TOKEN>
./synap tunnel enable cloudflare --token-file ~/secrets/cf.token
./synap tunnel status
./synap tunnel disable [--provider cloudflare] [--clear-token]
```

The `./synap tunnel enable` command:
1. Writes `CLOUDFLARED_TUNNEL_TOKEN=<token>` to `.env`
2. Runs `docker compose --profile cloudflare-tunnel up -d`
3. Tails the last 20 lines of `cloudflared` logs so the operator sees whether the tunnel connected
4. Prints a handoff reminding the operator to configure the tunnel's public hostname in Cloudflare's dashboard

Operator keeps their tunnel token in their own Cloudflare account. Synap never sees it.

### Pangolin Tunnel (operator-provided newt token)

Same pattern as Cloudflare, different env var (`PANGOLIN_NEWT_TOKEN`):

```bash
./synap tunnel enable pangolin --token <NEWT_TOKEN>
```

The `pangolin-tunnel` compose profile is a **placeholder alpine container** as of 2026-04-18. Operators must replace the image with `fosrl/newt` and add a proper command to actually connect to their Pangolin server. See the inline comment in `synap-backend/deploy/docker-compose.yml`.

---

## Compose profiles summary

All in `synap-backend/deploy/docker-compose.yml`. Any of these can be active on any pod:

| Profile | Container | Env var | How it's activated |
|---|---|---|---|
| `cloudflare-tunnel` | cloudflared (real image) | `CLOUDFLARED_TUNNEL_TOKEN` | CP path via pod-agent configure; self-hosted via `./synap tunnel enable cloudflare` |
| `pangolin-tunnel` | placeholder alpine (replace with fosrl/newt) | `PANGOLIN_NEWT_TOKEN` | Self-hosted only via `./synap tunnel enable pangolin` |

Not activating either profile = direct exposure through Caddy (the default).

---

## What actually changed on 2026-04-18

| # | Area | Change | Migration / file |
|---|---|---|---|
| 1 | Deprovision | Calls `exposureProvider.teardown()` with `metadata` from snapshot | `jobs/deprovision-pod.ts` |
| 2 | Direct-DNS teardown | Now a no-op with explanatory comment (DNS deletion already handled in step 2 of deprovision) | `exposure/direct-dns.ts` |
| 3 | Observability | New columns: `last_exposure_check_at`, `last_exposure_status`, `last_exposure_error` + write paths in provision job + exposed in `GET /pods/:id` | `0025_exposure_status_columns.sql` |
| 4 | Pangolin (CP-side) | `pangolin_tunnel` removed from `ExposureMode` enum, from DB enum, from env flags, from route schemas. Stub file deleted. Migration auto-migrates stuck rows to `direct_dns` | `0026_remove_pangolin_exposure_mode.sql`, various |
| 5 | Cloudflare Tunnel provider | Replaced stub with real implementation (create, ingress, DNS CNAME, verify, teardown, idempotent reuse) | `exposure/cloudflare-tunnel.ts`, `cloudflare-tunnel-api.ts` |
| 6 | Exposure metadata | New `exposure_metadata` JSONB column on pods + thread-through in provision + deprovision | `0027_exposure_metadata.sql` |
| 7 | API-boundary guard | All 3 write entry points (`POST /pods`, `/pods/:id/provisioning-setup`, `/self-hosting/provision`) return 501 when `exposureMode` is not enabled (instead of silently falling back) | `routes/pods.ts`, `routes/self-hosting.ts` |
| 8 | `CLOUDFLARE_ACCOUNT_ID` env | Added, optional, required only when tunnel flag is on (provider constructor throws if missing) | `env.ts` |
| 9 | Self-hosted CLI | `./synap tunnel enable\|disable\|status` + `./synap install --tunnel cloudflare --tunnel-token`; integrated into post-install handoff | `synap-backend/synap` |
| 10 | Integration tests | `cloudflare-tunnel-provider.integration.test.ts` — 10/10 green. `exposure-factory.integration.test.ts` — includes the `pangolin_tunnel` 501 guard | `__tests__/integration/*` |

---

## Known follow-ups (not yet done)

1. **Post-creation mode migration.** No `PATCH /pods/:id` path accepts `exposureMode`. Switching a pod from `direct_dns` to `cloudflare_tunnel` today requires destroying and recreating it. A re-exposure job (configure new path + verify + swap DNS + teardown old) is the right shape; scoped for a future ticket.

2. **Pangolin compose profile is a placeholder.** The `pangolin-tunnel` service in `docker-compose.yml` is an alpine no-op. An operator using Pangolin today must replace that service definition with `fosrl/newt` + the right command + mount. Worth doing as a small follow-up once one of us actually runs Pangolin end-to-end.

3. **Tunnel health after provision.** `verify()` is only called during the initial 5-minute polling window. If the tunnel later fails (token revoked, Cloudflare-side config change), there's no scheduled re-check. A periodic `re-verify-exposure` worker reading `lastExposureCheckAt` and re-running `verify()` would close this gap.

4. **Pod-side awareness.** The pod itself doesn't know its `exposureMode`. If it wanted to proactively alert on tunnel failures, it'd need the info. Low priority — Cloudflare's own dashboard is the first line of monitoring anyway.

---

## Debugging

### "My pod provisioned but the URL doesn't work"

1. Check the CP dashboard pod detail page — look at `lastExposureStatus` and `lastExposureError`.
2. If status is `failed` with `verification timeout: not_implemented` — the feature flag was on but the provider is a stub. Check `exposureMode` in DB.
3. If status is `failed` with a specific CF API error — check CP logs around the provision job timestamp for the full error body.
4. If status is `ok` but the URL is still dead — it's probably a Caddy / DNS propagation issue on the pod, not an exposure-provider problem. SSH to the pod and check `docker logs caddy`.

### "I ran `./synap tunnel enable cloudflare` but nothing happens"

1. `./synap tunnel status` — is the profile running?
2. `docker compose logs cloudflared` — what does the connector say? "Registered tunnel connection" = good. 401/403 = token is wrong or revoked.
3. Check your Cloudflare dashboard → Zero Trust → Networks → Tunnels. Is the tunnel listed as healthy?
4. Check the tunnel's public hostname config in Cloudflare — is it pointing at `http://backend:4000` (or wherever your pod's backend listens)?

### "Deprovision left a stale Cloudflare tunnel"

Before 2026-04-18 this was a real bug. Now it shouldn't happen — but if you see it:
- Check CP logs for the `exposureProvider.teardown failed` warning around the deprovision job
- The tunnel can be manually deleted via `wrangler tunnel delete <id>` or Cloudflare's dashboard

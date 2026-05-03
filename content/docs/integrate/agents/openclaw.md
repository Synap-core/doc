---
title: 'OpenClaw'
description: >-
  Connect OpenClaw to Synap backend with Hub Protocol, the synap skill, and
  provisioning flows.
section: general
audience: users
version: 1.0+
last_updated: '2026-05-03'
tags: []
sidebar_position: null
hide_title: false
toc: true
---

OpenClaw is an external agent runtime. Synap backend is the sovereign data/governance layer.  
The connection path is: **OpenClaw agent -> Hub Protocol (`/api/hub/*`) -> Synap backend**.

## Relationship to Synap backend

- OpenClaw does not write to the database directly.
- It calls Hub endpoints with scoped API keys.
- Backend still enforces permission/proposal policy for high-impact mutations.

Core implementation points in backend:

- Hub REST surface: [`packages/api/src/routers/hub-protocol-rest.ts`](https://github.com/Synap-core/backend/blob/main/packages/api/src/routers/hub-protocol-rest.ts)
- OpenAI-compatible endpoint used by agent runtimes: [`apps/api/src/index.ts`](https://github.com/Synap-core/backend/blob/main/apps/api/src/index.ts)
- Channel bridge using `/v1/chat/completions`: [`packages/api/src/routers/channels.ts`](https://github.com/Synap-core/backend/blob/main/packages/api/src/routers/channels.ts)

## Setup paths

### 1) Self-hosted backend script

Use backend provisioning script (creates agent user + Hub key + starts OpenClaw profile):

- [`deploy/setup-openclaw.sh`](https://github.com/Synap-core/backend/blob/main/deploy/setup-openclaw.sh)

### 2) Synap backend CLI (`synap`)

Self-hosted operators can enable and manage OpenClaw via backend CLI (`synap`) and compose profiles.

### 3) Synap CLI bootstrap

For end-to-end onboarding from user side:

```bash
npx @synap/cli init
```

CLI repo:

- [`synap-cli`](https://github.com/Synap-core/synap-cli)
- init command source: [`src/commands/init.ts`](https://github.com/Synap-core/synap-cli/blob/main/src/commands/init.ts)

## Skill wiring

OpenClaw should install Synap skill so it can call Hub endpoints coherently:

- skill definition: [`skills/synap/SKILL.md`](https://github.com/Synap-core/backend/blob/main/skills/synap/SKILL.md)
- skill notes: [`skills/synap/README.md`](https://github.com/Synap-core/backend/blob/main/skills/synap/README.md)

## Hub Protocol features for agent integrations

Recent additions you should leverage:

**Idempotency-Key.** Every write (`POST | PUT | PATCH | DELETE`) on `/api/hub/*` accepts an optional `Idempotency-Key` header. Same `(userId, key, body)` returns the cached 2xx response for 24h with `X-Idempotent-Replay: true`. Use it for any retry path — pipelines, schedulers, anything with at-least-once delivery semantics. 4xx and 5xx are never cached; secret-bearing responses are also never cached.

**OpenAPI 3.1 spec.** `GET /api/hub/openapi.json` always available. Dev pods also expose Swagger UI at `/api/hub/docs`. 27 high-traffic routes (entities, threads, memory, knowledge) validate request bodies at runtime against the schema; 65 more routes have full documentation.

**Sub-tokens for shared deployments.** When OpenClaw or any sidecar fronts multiple humans behind one parent agent key, opt into per-user sub-tokens to keep each human's notes/memory under a separate Synap user. Two modes:
- Header remap: send `X-External-User-Id: <opaque>` with the parent bearer key — auth middleware resolves the mapping (auto-creating the Synap user on first sight).
- Real child API keys: `POST /api/hub/setup/external-user { mintSubToken: true }` returns a child token bound to the parent (cascade revocation).
- Pod must enable `HUB_PROTOCOL_SUB_TOKENS=true`. Default is single-user behavior.

**Live event stream.** `GET /api/hub/events/stream` (SSE) replaces polling. `?since=<iso>` for catch-up on reconnect. `event: heartbeat` every 30s.

**Thread upserts.** `POST /api/hub/threads` deduplicates on `(externalSource, externalId)` — pipelines no longer need an in-process cache that resets on container restart. `POST /api/hub/threads/:id/messages.batch` for replaying historical conversations.

## Continue

- [Agents overview](/docs/integrate/agents)
- [Hub Protocol direct integration](/docs/integrate/integrations/sdk-direct)
- [Team OpenClaw docs](/team/platform/openclaw-integration)

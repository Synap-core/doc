---
title: 'Getting Started'
description: Install a data pod, open the app, and take your first actions
section: general
audience: users
last_updated: '2026-04-21'
sidebar_position: 1
---

# Getting Started

Synap is an AI operating system for knowledge work.

It gives you:
- a **sovereign data pod** you control
- a structured data model (entities, views, channels)
- event-governed mutation pipeline
- pluggable intelligence and external agent connectivity

## Pick how you run

| Path | When to choose it |
|---|---|
| **Synap Cloud** | Use Synap immediately — no Postgres, search, or storage to manage |
| **Docker** | Local evaluation or single-server install with official images |
| **CLI** — `npx @synap/cli init` | Connect OpenClaw, scripts, and agents to your pod |
| **From source** | Core development on Synap itself (API, workers, schema) |

### Synap Cloud

[Create an account at synap.live](https://synap.live) — sign up, complete onboarding, and you get a workspace and pod URL. Download the desktop app from the product shell when offered.

### Docker

```bash
git clone https://github.com/Synap-core/backend.git
cd backend
docker compose up -d
pnpm install
pnpm --filter database db:init
pnpm dev
```

See the full [backend repo `deploy/` docs](https://github.com/Synap-core/backend) for compose files, env templates, and production checklists.

### From source

1. **Prerequisites** — Node.js 20+, pnpm, Docker Desktop.
2. **Configure** — copy `.env.local.example` → `.env`, fill `DATABASE_URL` and provider keys.
3. **Start services** — `docker compose up -d && docker compose ps`.
4. **App** — `pnpm install && pnpm --filter database db:init && pnpm dev`.

## Then open the app

- Cloud users: your workspace is ready at synap.live.
- Self-host: navigate to `http://localhost:3000` (or your configured host).

No API keys required to explore entities, views, and channels.

## Continue

- **[AI agents & external tools](./ai-agents-and-tools)** — OpenClaw, CLI, Hub Protocol.
- **[Next steps](./next-steps)** — architecture, SDK, deploy, community.
- **[What is Synap?](../concepts/what-is-synap)** — product framing.

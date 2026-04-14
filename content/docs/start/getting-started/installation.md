---
title: Installation
description: How to get a running data pod — hosted, Docker, CLI, or from source
sidebar_position: 2
---

# Installation

A **data pod** is your Synap backend: API, database, storage, identity, and jobs. Pick **one** path below; you can migrate later (export/import or reconnect clients).

**After install:** **[Quickstart](./quickstart)** routes you to the app, agents, or SDK.

---

## Hosted: Synap Cloud

Best when you want to **use Synap immediately** without operating Postgres, search, or storage.

1. Open **[synap.live](https://synap.live)** and **sign up** (or sign in).  
2. Complete onboarding — you receive a **workspace** and pod URL in the product flow.  
3. Download the **desktop app** from the same landing / app shell when offered (browser works too).

Identity, provisioning, and security boundaries are described at a high level in **[Synap Cloud](/docs/cloud/synap-cloud)**. You do **not** run `docker compose` for this path.

---

## Docker

Best for **local evaluation** or a **single-server** install using the official images / compose stack.

1. Clone **[github.com/Synap-core/backend](https://github.com/Synap-core/backend)** (or your fork).  
2. Follow **`deploy/`** in that repo: compose files, env templates, and the **`synap`** shell script for **install / update / migrate** when you run from source or image.  
3. Deep checklists (production, TLS, backups) → **[Architecture → Deployment](/docs/architecture/deployment)**.

Typical local flow (abbreviated):

```bash
git clone https://github.com/Synap-core/backend.git
cd backend
# copy env, then:
docker compose up -d
pnpm install
pnpm --filter database db:init   # or project’s documented migrate command
pnpm dev
```

Exact service names, ports, and health checks change with releases — treat the **repo `deploy/` docs** as canonical; this page stays the **map**.

---

## CLI

Today there are **two** CLI-related entry points; we are **centralizing** them so one story covers **pod ops** and **agent bridge**.

| Surface | When to use it |
|---------|----------------|
| **`synap` script** (in the backend repo, e.g. `deploy/../synap`) | Install, update, migrate, and operate the **data pod** from Docker/source **on a server** you control. |
| **`npx @synap/cli`** (npm) | Connect **OpenClaw**, laptops, and **external agents** to your pod (guided `init`, Hub-oriented flows). |

**Rule of thumb:** server lifecycle → **repo `synap`**; “connect my AI stack” → **`npx @synap/cli`**.  

Agent connection details → **[AI agents & external tools](./ai-agents-and-tools)**.

---

## From source

For **core development** on Synap itself (API, workers, schema):

### Prerequisites

- **Node.js 20+** and **pnpm** (version pinned in repo)  
- **Docker Desktop** for local dependencies (Postgres, MinIO, Redis, Ory, …)  
- Optional provider keys (OpenAI, Anthropic, …) for AI features  

### Configure environment

```bash
cp env.local.example .env
# Edit DATABASE_URL, storage, and AI keys as documented in the repo.
```

### Start dependencies

```bash
docker compose up -d
docker compose ps
```

Common services: PostgreSQL (+ Timescale / pgvector), MinIO, Redis, Kratos, Hydra — **see repo `docker compose.yml` for current list and ports**.

### Database & app

```bash
pnpm install
pnpm --filter database db:init   # or db:push / migrate per repo README
pnpm dev
```

Verify with the repo’s health endpoint (path/port in README).

### Production

Use **[Production checklist](/docs/architecture/deployment/data-pod/production.md)** and **[Deployment overview](/docs/architecture/deployment/overview.md)** — not a duplicate of those guides here.

---

## Troubleshooting (local Docker)

```bash
docker compose logs postgres
docker compose restart
docker compose up -d --force-recreate
```

```bash
psql "$DATABASE_URL" -c "\dx"
```

Port clashes: change `PORT` in `.env` or free the port with `lsof -i :PORT`.

---

## Next

- **[Quickstart](./quickstart)** — app, agents, or SDK  
- **[AI agents & external tools](./ai-agents-and-tools)** — OpenClaw & Hub Protocol  
- **[Architecture → System concepts](/docs/architecture/concepts)** — how it fits together  

**Resources:** [GitHub](https://github.com/Synap-core/backend) · [Issues](https://github.com/Synap-core/backend/issues) · [Discord](https://discord.gg/synap)

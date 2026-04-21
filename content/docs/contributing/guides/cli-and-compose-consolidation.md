---
sidebar_position: 8
title: 'Cli And Compose Consolidation'
description: Documentation covering Cli And Compose Consolidation
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
hide_title: false
toc: true
---

# CLI & Compose Consolidation

**One compose file, two CLIs with clear boundaries — how the ops story got simple**

This document describes how Synap's deployment and ops story was consolidated from "scattered organic growth" into a coherent shape. It captures what used to exist, why, what was wrong with it, and what you should see in the codebase today.

---

## The situation we came from

Three CLIs overlapped, and two docker-compose files diverged:

- **Two compose files** — `docker-compose.yml` for source-repo installs + CP-managed pods; `docker-compose.standalone.yml` for tarball installs + monitoring stack. They drifted: different Kratos admin URLs, different realtime image names, different monitoring coverage. Users were never told which one they were using.
- **Three CLIs** — `synap` bash script (pod host, full lifecycle), `@synap-core/cli` npm (user laptop, agent connections), and `eve-cli` (part of the Eve Entity System, but silently delegated to the bash script for its `setup`, `update`, `doctor` commands). Duplicate `status`/`doctor`/`update` commands, hidden delegations, and no clear rule for which to run when.

Result: users asked "why is there both?" and got no good answer.

---

## What the consolidation did

### One compose file, profile-gated

`docker-compose.standalone.yml` is **deleted**. Everything lives in `docker-compose.yml`, and optional stacks are activated via Compose profiles:

| Profile | Services | When |
|---|---|---|
| *(default)* | backend, realtime, postgres, minio, typesense, redis, kratos, hydra, caddy, pod-agent, and the one-shot migration services | Always running |
| `monitoring` | prometheus, grafana, alertmanager | Full observability |
| `canary` | backend-canary | Used by `update-pod.sh` to validate a new image before swapping production |
| `openclaw` | openclaw | Self-hosted AI agent (in-pod) |
| `rsshub` | rsshub, browserless | RSS aggregation |
| `cloudflare-tunnel` | cloudflared | Expose pod via Cloudflare Tunnel |
| `pangolin-tunnel` | pangolin-tunnel | Expose via Pangolin |
| `updater` | updater | One-shot self-updater spawned by `update-pod.sh` |

Example — pod with monitoring and OpenClaw:

```bash
docker compose --profile monitoring --profile openclaw up -d
```

### Install scripts converged

`install.sh` and `setup-openclaw.sh` now reference `docker-compose.yml` directly. Config-file paths (`KRATOS_CONFIG_DIR`, `POSTGRES_INIT_SCRIPT`, `CADDYFILE_PATH`) are env-var overridable so a source-repo install and a tarball install share the same file.

### Two CLIs with clear boundaries

The rule is simple:

| You are… | You run… |
|---|---|
| On your **pod server** (you have Docker) | `./synap` — install, update, backup, restore, health, logs |
| On your **laptop** (you have an API key) | `npx @synap-core/cli` — init, connect, oc *, audit, infra |

Every command lives in **exactly one** CLI. No hidden delegations between them.

### Explicit handoff between CLIs

After a successful `./synap install`, the script now prints:

```bash

════════════════════════════════════════════════════════════════
✅ Synap pod is running at: https://your-pod.example.com

Next steps — run these on YOUR LAPTOP (not on this server):

  1. Install the user CLI:
     npm install -g @synap-core/cli

  2. Connect your workspace and AI agents (OpenClaw, Raycast, MCP):
     npx @synap-core/cli init --pod-url https://your-pod.example.com

For ops (health, logs, backups, updates) — keep using ./synap on this server.
════════════════════════════════════════════════════════════════

```

And running `npx @synap-core/cli init` without a reachable pod prints clear
setup instructions (self-host / hosted / localhost) and exits with code 2,
rather than silently failing.

### eve-cli is no longer a Synap front-end

The `eve setup`, `eve init`, `eve update`, `eve doctor`, `eve status`, `eve logs`, and `eve brain init` commands all print a deprecation banner pointing to the correct Synap CLI and require `--confirm-delegation` to actually run. Eve's own commands (`grow`, `birth`, `inspect`, organs, builder, AI) are unaffected — they remain valid for Eve Entity System use cases.

---

## The capability matrix today

| Task | CLI | Command |
|------|-----|---------|
| Install a fresh pod | bash `synap` | `./synap install --clone --domain … --email …` |
| Update a running pod | bash `synap` | `./synap update` |
| Backup / restore | bash `synap` | `./synap backup` / `./synap restore` |
| Local health check (on the pod) | bash `synap` | `./synap health` |
| Tail service logs | bash `synap` | `./synap logs [service]` |
| Add OpenClaw **in-pod** | bash `synap` | `./synap services add openclaw` |
| Create admin user | bash `synap` | `./synap create-admin` |
| Initial workspace / agent provisioning | npm CLI | `npx @synap-core/cli init --pod-url …` |
| Remote pod status (API-only) | npm CLI | `npx @synap-core/cli status` |
| Configure OpenClaw client (MCP configs) | npm CLI | `npx @synap-core/cli oc connect` |
| Security audit | npm CLI | `npx @synap-core/cli audit` |
| Dokploy infrastructure | npm CLI | `npx @synap-core/cli infra …` |

**Still-valid `eve` commands (Eve Entity System):**

| Task | CLI | Command |
|------|-----|---------|
| Provision bare-metal via USB | eve-cli | `eve birth usb` / `eve birth install` |
| Manage Eve organs | eve-cli | `eve brain | arms | eyes | legs | builder` |
| Inspect Eve internals | eve-cli | `eve inspect` / `eve config` / `eve grow` |

---

## Decisions made along the way

1. **Canonical wins on divergent services.** Where `docker-compose.yml` and `docker-compose.standalone.yml` disagreed, we kept the standard version:
   - Kratos admin URL: `https://${DOMAIN}/.ory/kratos/admin/` (set `DOMAIN=localhost` for local dev)
   - Realtime: reuses the backend image (the separate `backend-realtime` image was a packaging mistake)
   - Caddy: `${CADDYFILE_PATH:-./Caddyfile}` (overridable)
   - pod-agent: always on. Harmless on non-CP installs (listens on 4002, idles if nothing reaches it). This means standalone pods can be promoted to CP-managed later without a compose rewrite.

2. **Exec form for complex container commands.** `backend-migrate` previously used `command: > sh -c "..."` string form, which Docker wrapped in an extra shell. That outer shell was silently eating `$p` loop variables. Now the command is YAML-list exec form, bypassing Docker's wrapping shell.

3. **CLI ownership, not hidden delegation.** Previously `eve setup --synap-repo=X` secretly ran `bash synap install` underneath. Now eve-cli loudly says what it's doing and requires an explicit `--confirm-delegation` flag — if you want to install a Synap pod, you're nudged to run `./synap install` directly.

---

## Known follow-ups

Two things flagged by the consolidation agent as **irreconcilable** and left for follow-up:

1. **Kratos `COURIER_SMTP_CONNECTION_URI`** was injected by `docker-compose.standalone.yml` but not by the canonical one. Today Kratos is configured via `kratos.yml` which carries SMTP settings inline, so this shouldn't matter — but if your install relies on the env-var override path, you may need to add it to the canonical compose file.
2. **Caddy `OPENCLAW_DOMAIN`** env var: standalone exposed `${OPENCLAW_DOMAIN:-disabled.invalid}`, canonical doesn't. If the Caddyfile references this variable, the canonical install may need it.

Both are one-line additions if they turn out to matter. If you hit one, open a PR.

---

## How to contribute

The consolidation shape is stable. If you find an ops task that doesn't fit cleanly into one of the two CLIs, open a GitHub issue with label `cli-boundary`. The question to answer: **does this need Docker, or can it be done over HTTP?**

- Needs Docker on the pod host → bash `synap`
- Can be done with an API key over HTTP → `@synap-core/cli`
- Is it a third thing that genuinely doesn't fit? → discuss before adding

---

## Changelog

- **2026-04-17** — Phase 1 landed:
  - `docker-compose.standalone.yml` merged into `docker-compose.yml`, monitoring stack gated behind `--profile monitoring`
  - `install.sh`, `setup-openclaw.sh` updated to use the unified compose file
  - `./synap install` final handoff message pointing to `@synap-core/cli`
  - `@synap-core/cli init` detects missing pod and prints setup instructions instead of silently failing
  - `eve-cli` adds deprecation banners on 7 Synap-delegating commands (`setup`, `init`, `update`, `doctor`, `status`, `logs`, `brain init`)
  - `@synap-core/cli status` rewritten to be API-only — no docker/SSH code paths
  - `backend-migrate` container command converted from `>` string form to exec-form list (one shell instead of two)

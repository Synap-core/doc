---
title: 'AI agents & external tools'
description: >-
  Connect OpenClaw, scripts, and other agents to your pod via Hub Protocol and
  the Synap CLI
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
sidebar_position: null
hide_title: false
toc: true
---

# AI agents & external tools

Synap is built so **any agent or automation** can work on **your** data with **governance** (permissions, proposals). You are not locked into a single chat UI.

## Mental model

| Layer | Role |
|--------|------|
| **Data pod** | Source of truth: entities, documents, events, API keys |
| **Hub Protocol** | Stable HTTP surface for agents: `POST /api/hub/*` on your pod |
| **Intelligence service** | Optional hosted or self-hosted “brain” that calls the Hub |
| **CLI & skills** | Laptop / OpenClaw bridge: `npx @synap/cli`, skills, provisioning |

External tools (OpenClaw, n8n, your own scripts) should talk to the **pod** via **Bearer token + Hub routes**, not by scraping the web app.

---

## 1. Synap CLI (`@synap/cli` on npm)

Use this when you want a **guided setup** from a machine that should talk to your pod (including **OpenClaw** and similar stacks):

```bash
npx @synap/cli init
```

The CLI walks through linking an existing OpenClaw install, pointing at a fresh server, or a local laptop flow. It is the **user-facing** entry for “connect my agents to Synap.”

> **Direction of travel:** today you may still see **two** surfaces — a **`synap` script** shipped with the backend repo (install/update/migrate in Docker) and **`@synap/cli` on npm** (agent bridge). We are **consolidating** toward one coherent CLI story; until then, use **`npx @synap/cli`** for **agents & OpenClaw**, and the **backend `synap`** helper for **pod install/update** when you self-host from the repo.

---

## 2. OpenClaw + Synap skill

For **OpenClaw**, install the community-facing **Synap skill** so the agent uses **Hub Protocol** only (no direct DB access):

- Skill source lives with the backend repo under `skills/synap/` (see **SKILL.md** in that tree).
- Self-hosted pods can use **`deploy/setup-openclaw.sh`** (in the backend repo) which calls the pod’s provisioning endpoint with a **provisioning token** to create an agent user and API key.

After setup, the agent authenticates like any other Hub client.

---

## 3. Hub Protocol (reference)

All Intelligence ↔ Pod traffic for agents goes through **Hub Protocol** REST, for example:

- Base URL: `https://<your-pod>/api/hub/...`
- Auth: **Bearer** API key (and workspace context as required by the route)

Deep reference lives under **Build & integrate** (not duplicated here):

- **[Synap Intelligence overview](/docs/cloud/intelligence)** — how the agent layer relates to the pod  
- **[Integrations overview](/docs/integrate/integrations/overview)** — webhooks, streams, patterns  
- **[Skill invocation (HTTP)](/docs/integrate/integrations/skill-invocation)** — deterministic, typed calls to named skills on the pod  

---

## 4. After you connect

- **[Guides → Second brain](/docs/start/guides/by-use-case/second-brain)** — product-shaped workflows on top of the graph  
- **[Development setup](/docs/integrate/development/setup.md)** — if you are extending the monorepo  
- **[Event catalog](/docs/integrate/reference/event-catalog.md)** — what the pod emits  

If you only need the **desktop / browser app**, start at **[synap.live](https://synap.live)** (sign up and download) — no Hub setup required.

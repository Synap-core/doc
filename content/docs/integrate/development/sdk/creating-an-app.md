---
sidebar_position: 3
title: Creating an app
description: Build your own app on a Synap data pod — get a pod, connect the SDK, add auth and realtime, and start from the base app
section: general
audience: users
version: 1.0+
last_updated: '2026-07-24'
tags: []
hide_title: false
toc: true
---

# Creating an app

This is the path for a developer building their **own app** — personal or commercial — with a Synap data pod as the backend. It covers getting a pod, connecting the SDK, auth, realtime, and the starter app you can copy.

---

## 1. Get a pod

Every Synap app talks to a **data pod** — your entities, views, and channels live there. You need one before anything else. Two ways to get one:

### Option A — Self-host (free)

Run a pod on your own infrastructure. The fastest path is the one-line installer, which downloads pre-built images and generates every required secret for you:

```bash
curl -fsSL https://raw.githubusercontent.com/Synap-core/backend/main/install.sh | bash -s -- --domain your-domain.example.com
```

If you'd rather run `docker compose` directly against [`deploy/docker-compose.yml`](https://github.com/Synap-core/backend/blob/main/deploy/docker-compose.yml) from a clone of the repo instead of the installer:

```bash
git clone https://github.com/Synap-core/backend.git
cd backend/deploy
cp .env.example .env
# edit .env — see the gotcha below before you run this
docker compose up -d
```

> ⚠️ **`.env.example` is missing a required variable.** `docker-compose.yml` hard-requires `ORY_HYDRA_SECRETS_SYSTEM` (Kratos/Hydra system secret) and `docker compose up` will fail without it — but it isn't listed in `.env.example`. The one-line installer generates it for you automatically (`ORY_HYDRA_SECRETS_SYSTEM=$(openssl rand -hex 32)` alongside the ~10 other secrets it writes); if you're filling in `.env` by hand, generate it the same way:
> ```bash
> openssl rand -hex 32
> ```
> and add it as `ORY_HYDRA_SECRETS_SYSTEM=...` in your `.env`.

Either way you'll end up with a pod reachable at your own URL (`https://your-domain.example.com`) and a `PROVISIONING_TOKEN` in `.env` — the credential you use to provision your first API key (see [Auth](#auth) below).

### Option B — Managed pod (paid)

Synap Cloud hosts and operates a pod for you — no Postgres, search index, or storage to run yourself. Sign up at [synap.live](https://synap.live). Be aware: **there is currently no free managed tier** — a managed pod requires an active subscription. If you want to build and test for free, self-host instead.

See [Synap Cloud](/docs/cloud/synap-cloud) for what's included.

---

## 2. Install the SDK and run your first query

```bash
npm install @synap-core/sdk@^1.0.0
```

```typescript
import { createSynapClient } from "@synap-core/sdk";

const synap = createSynapClient({
  podUrl: "https://your-pod.example.com",
  sessionToken, // Kratos session token for the signed-in user (see Auth below)
  workspaceId: "ws_...",
});

const entities = await synap.entities.list.query({ limit: 20 });
```

Full walkthrough (React, TypeScript, cURL) → **[First queries](./first-query)**. Full API surface → **[API reference](../../reference/api-reference)**.

If you're building an agent/CLI instead of an app — no bundler, no React — use [`@synap-core/hub-rest-client`](https://npmjs.com/package/@synap-core/hub-rest-client) (zero-dependency REST, accepts hub / user API keys against `/api/hub/*`) instead of the tRPC SDK. API keys are not accepted by `createSynapClient`. See the [SDK overview](./overview) for the distinction.

---

## 3. Auth

Which credential you use depends on where your code runs:

### Browser apps — Synap Cloud sign-in

The canonical path for a browser app is [`@synap-core/auth`](https://npmjs.com/package/@synap-core/auth): it drives the "Continue with Synap Cloud" flow (CP sign-in, optional TOTP, pod picker) and produces a Kratos session token for the chosen pod. Pass that token straight to `createSynapClient` as `sessionToken`:

```typescript
createSynapClient({ podUrl, workspaceId, sessionToken });
```

The starter app described later on this page wires this end to end — its `components/auth/` and `app/login/` directories are the reference implementation.

### Server, CLI, or script — API key or handshake

For code that isn't a browser (a server, a CLI, a scheduled job), you have two options:

- **API key** — generate one in **Workspace → Settings → Developer → API Keys** and pass it as `apiKey`. Simplest option; treat it like any other long-lived secret.
- **Programmatic handshake** — [`@synap-core/auth-bootstrap`](https://npmjs.com/package/@synap-core/auth-bootstrap) exchanges a short-lived, signed assertion for a session token (`exchangeIssuerAssertion()`) or provisions a Hub Protocol API key from a `PROVISIONING_TOKEN` (`setupAgent()` — the token your self-hosted pod's `.env` already has if you followed step 1 above):

  ```typescript
  import { setupAgent } from "@synap-core/auth-bootstrap";

  const { hubApiKey, agentUserId } = await setupAgent(
    "https://your-pod.example.com",
    process.env.PROVISIONING_TOKEN!,
    "my-agent",
  );
  ```

  `setupAgent` is zero-dependency (native `fetch` only) and runs in Node ≥18, Deno, Bun, and edge runtimes.

---

## 4. Realtime

To be notified when data changes instead of polling, use [`@synap-core/sdk-realtime`](https://npmjs.com/package/@synap-core/sdk-realtime) — a small Socket.IO wrapper, separate from the tRPC SDK on purpose (it only owns "tell me when something changed"; reads/writes stay on `@synap-core/sdk`):

```typescript
import { createRealtimeClient } from "@synap-core/sdk-realtime";

const rt = createRealtimeClient({
  url: "https://your-pod.example.com",
  workspaceId: "ws_...",
  sessionToken, // or apiKey
  onInvalidate: (event) => queryClient.invalidateQueries({ queryKey: ["entities"] }),
});
rt.connect();
```

It refuses to connect over a non-TLS URL unless you explicitly pass `allowInsecure: true` (for localhost dev only) — credentials travel in the connection handshake.

---

## 5. The starter app

`apps/base` in the `synap-app` monorepo is a working Next.js shell you can copy as a starting point:

- Next.js 16 (App Router) + React 19, HeroUI + Tailwind
- Auth pre-wired end to end, including TOTP
- `AppShell` with tabs and a slide-in right panel
- Cmd+K command palette with an extensible command registry
- A realtime bridge (Socket.IO) and a mock mode that runs without a real pod

**Be aware: there is no `create-synap-app` yet.** Today, starting from the base app means cloning the whole `synap-app` monorepo and copying `apps/base/` into a new app directory — there's no standalone scaffolding CLI. The base app's own `README.md` documents the rename checklist (package name, session-storage keys, mock-mode flags, etc.) for turning your copy into an independent app.

```bash
git clone https://github.com/synap-core/synap-app.git
cd synap-app && pnpm install
cp -r apps/base apps/my-app
# then follow the rename checklist in apps/my-app/README.md
cd apps/my-app && pnpm dev
```

---

## 6. Scope and limitations — read this before you commercialize

**Building an app on your own pod is supported today.** If you're the only person whose data the app touches — you self-host or run one managed pod, and you connect to it — everything above just works.

**Building a multi-tenant commercial app, where other users connect their own pods to your app, is not yet supported.** Per-app data scoping doesn't exist yet: an approved app currently gets access to a user's *entire* pod, not a limited slice of it. If your app is meant to onboard other people's pods, treat that as a "coming, not ready" feature rather than building around it today — the scoping vocabulary is a prerequisite for it, not a follow-up you can bolt on after shipping.

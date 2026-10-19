---
sidebar_position: 1
title: Overview
description: Documentation covering Overview
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
hide_title: false
toc: true
---

# SDK Overview

Synap exposes your data pod as a fully-typed tRPC API. Two npm packages let you connect a **user-facing app** to it in minutes:

| Package | Use case |
|---------|----------|
| [`@synap-core/sdk`](https://npmjs.com/package/@synap-core/sdk) | Vanilla JS / TypeScript, server-side, scripts |
| [`@synap-core/react`](https://npmjs.com/package/@synap-core/react) | React apps — TanStack Query hooks, automatic caching |

Both packages are generated from the same `AppRouter` type, so autocomplete covers every procedure.

If you're instead building an **agent, CLI, or headless script** — no React, no bundler, no tRPC types needed — use [`@synap/hub-rest-client`](https://npmjs.com/package/@synap/hub-rest-client) instead: a zero-dependency REST client over the same pod, built for that use case. This page covers the tRPC SDK; agents should read the [Hub Protocol reference](../../reference/api-reference) instead.

---

## Installation

Pin to `^1.0.0` — earlier `0.x` versions on npm are a different, abandoned package and will not work with a current pod.

```bash
# Vanilla JS / TypeScript
npm install @synap-core/sdk@^1.0.0

# React
npm install @synap-core/react@^1.0.0
```

Step-by-step first calls (React, TS, cURL) → **[First queries](./first-query)**.

---

## Servers and scripts with an API key — `@synap-core/hub-rest-client`

```bash
npm install @synap-core/hub-rest-client
```

```typescript
import { HubRestClient } from "@synap-core/hub-rest-client";

const synap = new HubRestClient({
  podUrl: "https://your-pod.synap.live",
  apiKey: process.env.SYNAP_HUB_API_KEY!, // synap_hub_... or synap_user_...
  workspaceId: "ws_...",
});

// Search and read
const notes = await synap.searchEntities("project ideas", { profileSlug: "note", limit: 20 });
const recent = await synap.getRecentEntities({ limit: 20 });

// Create
const note = await synap.createEntity({
  profileSlug: "note",
  title: "My note",
  content: "Hello!",
});
```

> **API keys do not work with `createSynapClient`.** It talks to the pod's `/trpc`
> endpoint, which only accepts a signed-in session (Kratos `sessionToken` or cookie)
> or the local-mode token. Hub / user API keys (`synap_hub_*`, `synap_user_*`) are
> refused there (401), and `createSynapClient` throws early if you pass one. For
> servers and scripts holding an API key, use `@synap-core/hub-rest-client` against
> `/api/hub/*`.

---

## Signed-in apps — `@synap-core/sdk`

`createSynapClient` is the typed tRPC client for an app with a signed-in user.

```typescript
import { createSynapClient } from "@synap-core/sdk";

const synap = createSynapClient({
  podUrl: "https://your-pod.synap.live",
  sessionToken, // Kratos session token (browser apps: omit it and rely on the cookie)
  workspaceId: "ws_...",
});

// Queries
const entities = await synap.entities.list.query({ limit: 20 });
const workspace = await synap.workspaces.get.query({ id: "ws_..." });

// Mutations
const entity = await synap.entities.create.mutate({
  profileSlug: "note",
  title: "My note",
  properties: { content: "Hello!" },
});

// Search
const results = await synap.knowledge.search.query({ query: "project ideas" });
```

---

## React — `@synap-core/react`

### 1. Wrap your app with `<SynapProvider>`

```tsx
import { SynapProvider } from "@synap-core/react";

export default function App() {
  return (
    <SynapProvider
      podUrl="https://your-pod.synap.live"
      sessionToken={sessionToken}
      workspaceId="ws_..."
    >
      <YourApp />
    </SynapProvider>
  );
}
```

### 2. Call `useSynap()` anywhere inside

```tsx
import { useSynap } from "@synap-core/react";

function NoteList() {
  const { data } = useSynap().entities.list.useQuery({
    profileSlug: "note",
    limit: 20,
  });
  return <ul>{data?.items.map((n) => <li key={n.id}>{n.title}</li>)}</ul>;
}

function CreateNote() {
  const create = useSynap().entities.create.useMutation();
  return (
    <button onClick={() => create.mutate({ profileSlug: "note", title: "New" })}>
      Add note
    </button>
  );
}
```

---

## Authentication

`createSynapClient` supports three ways to authenticate, in order of precedence:

### 1. Session token (Kratos — non-browser clients)

Pass a Kratos API session token as `sessionToken` — sent as an `x-session-token` header. This is the credential you get back from `exchangeIssuerAssertion()` in [`@synap-core/auth-bootstrap`](./creating-an-app), and takes priority over `apiKey` if both are set.

```typescript
createSynapClient({ podUrl, workspaceId, sessionToken: "ory_st_..." });
```

### 2. API key (`apiKey`): local-mode token only

`apiKey` is sent as a `Bearer` token to `/trpc`, which on a real pod is behind Ory session auth. It is only meaningful for the LOCAL_MODE token (local development). Hub and user API keys (`synap_hub_*`, `synap_user_*`) are refused by `/trpc`, and `createSynapClient` throws early if you pass one. For those, use [`@synap-core/hub-rest-client`](#servers-and-scripts-with-an-api-key--synap-corehub-rest-client) against `/api/hub/*`.

```typescript
createSynapClient({ podUrl, workspaceId, apiKey: process.env.SYNAP_LOCAL_MODE_TOKEN });
```

### 3. Session cookie (browser — already logged in via Synap)

Omit both `sessionToken` and `apiKey`. The SDK always sends `credentials: "include"`, so if the browser already holds a Kratos session cookie for this pod, it is forwarded automatically.

```typescript
createSynapClient({ podUrl, workspaceId });
```

Pass `onAuthError` to be notified when the pod rejects a request with `401` (expired/invalid session) so you can re-authenticate:

```typescript
createSynapClient({
  podUrl,
  workspaceId,
  sessionToken,
  onAuthError: ({ message }) => {
    // sign the user out / trigger re-auth
  },
});
```

---

## Type helpers

`@synap-core/react` re-exports ready-made input/output types:

```typescript
import type { RouterInputs, RouterOutputs } from "@synap-core/react";

type CreateInput = RouterInputs["entities"]["create"];
type EntityList = RouterOutputs["entities"]["list"]["items"][number];
```

`@synap-core/sdk` only exports the raw `AppRouter` type — derive the same helpers yourself with `@trpc/server`:

```typescript
import type { AppRouter } from "@synap-core/sdk";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

type RouterInputs = inferRouterInputs<AppRouter>;
type RouterOutputs = inferRouterOutputs<AppRouter>;
```

---

## Full procedure list

See the [API Reference](../../reference/api-reference) for every available query and mutation, auto-generated from the live router.

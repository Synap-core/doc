---
title: First queries with the SDK
description: >-
  Call your pod from React, TypeScript, or cURL — after you have a URL,
  workspace, and API key
sidebar_position: 2
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
hide_title: false
toc: true
---

# First queries with the SDK

**Prerequisites:** a running data pod (see [Getting started](/docs/start/getting-started) — or [Creating an app](./creating-an-app) if you don't have one yet), your **pod URL**, **workspace ID**, and an **API key**.

> API keys: Synap app → **Workspace Settings → Developer → API keys → Generate**.

---

## Option A — React

### 1. Install

```bash
npm install @synap-core/react@^1.0.0
```

### 2. Provider

```tsx
import { SynapProvider } from "@synap-core/react";

export default function App({ children }) {
  return (
    <SynapProvider
      podUrl="https://your-pod.example.com"
      sessionToken={sessionToken}
      workspaceId="ws_..."
    >
      {children}
    </SynapProvider>
  );
}
```

### 3. Read & write

```tsx
import { useSynap } from "@synap-core/react";

export function NoteList() {
  const { data, isLoading } = useSynap().entities.list.useQuery({
    profileSlug: "note",
    limit: 20,
  });
  if (isLoading) return <p>Loading…</p>;
  return (
    <ul>
      {data?.items.map((note) => (
        <li key={note.id}>{note.title}</li>
      ))}
    </ul>
  );
}
```

---

## Option B — TypeScript (no React)

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

For a signed-in app, use `createSynapClient({ podUrl, workspaceId, sessionToken })` from `@synap-core/sdk`.

---

## Option C — cURL

With a hub / user API key, call the pod's Hub REST API (`/api/hub/*`):

```bash
curl "https://your-pod.example.com/api/hub/entities?limit=5&workspaceId=ws_..." \
  -H "Authorization: Bearer $SYNAP_HUB_API_KEY"
```

(The tRPC endpoint `/trpc` does not accept API keys; it needs a signed-in session.)

---

## Types

```typescript
import type { RouterInputs, RouterOutputs } from "@synap-core/react";
// (@synap-core/sdk doesn't re-export these — see "Type helpers" in the overview)
```

---

## Next

- **[SDK overview](./overview)** — auth modes and patterns  
- **[API reference](../../reference/api-reference)**  
- **[Self-hosting](/docs/architecture/deployment/data-pod/self-hosted)** — run your own pod  

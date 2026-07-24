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
      apiKey="sk_live_..."
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
npm install @synap-core/sdk@^1.0.0
```

```typescript
import { createSynapClient } from "@synap-core/sdk";

const synap = createSynapClient({
  podUrl: "https://your-pod.example.com",
  apiKey: "sk_live_...",
  workspaceId: "ws_...",
});

const entities = await synap.entities.list.query({ limit: 20 });
const created = await synap.entities.create.mutate({
  profileSlug: "note",
  title: "Hello from the SDK",
});
```

---

## Option C — cURL

tRPC is exposed over HTTP at `/trpc`:

```bash
curl "https://your-pod.example.com/trpc/entities.list?input=%7B%22limit%22%3A5%7D" \
  -H "Authorization: Bearer sk_live_..." \
  -H "x-workspace-id: ws_..."
```

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

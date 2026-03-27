---
sidebar_position: 1
---

# SDK Overview

Synap exposes your data pod as a fully-typed tRPC API. Two npm packages let you connect any app in minutes:

| Package | Use case |
|---------|----------|
| [`@synap/sdk`](https://npmjs.com/package/@synap/sdk) | Vanilla JS / TypeScript, server-side, scripts |
| [`@synap/react`](https://npmjs.com/package/@synap/react) | React apps — TanStack Query hooks, automatic caching |

Both packages are generated from the same `AppRouter` type, so autocomplete covers all 47+ procedures.

---

## Installation

```bash
# Vanilla JS / TypeScript
npm install @synap/sdk

# React
npm install @synap/react
```

---

## Vanilla JS — `@synap/sdk`

```typescript
import { createSynapClient } from "@synap/sdk";

const synap = createSynapClient({
  podUrl: "https://your-pod.synap.live",
  apiKey: "sk_live_...",        // generate in Workspace → Settings → API Keys
  workspaceId: "ws_...",
});

// Queries
const entities = await synap.entities.list.query({ limit: 20 });
const workspace = await synap.workspaces.get.query();

// Mutations
const entity = await synap.entities.create.mutate({
  profileSlug: "note",
  title: "My note",
  properties: { content: "Hello!" },
});

// Search
const results = await synap.search.global.query({ q: "project ideas" });
```

---

## React — `@synap/react`

### 1. Wrap your app with `<SynapProvider>`

```tsx
import { SynapProvider } from "@synap/react";

export default function App() {
  return (
    <SynapProvider
      podUrl="https://your-pod.synap.live"
      apiKey="sk_live_..."
      workspaceId="ws_..."
    >
      <YourApp />
    </SynapProvider>
  );
}
```

### 2. Call `useSynap()` anywhere inside

```tsx
import { useSynap } from "@synap/react";

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

### API key (recommended for external apps)

Generate a key in **Workspace → Settings → Developer → API Keys**. Pass it as `apiKey` — sent as a `Bearer` token.

```typescript
createSynapClient({ podUrl, workspaceId, apiKey: "sk_live_..." });
```

### Session cookie (browser — already logged in via Synap)

Omit `apiKey`. The SDK automatically sends `credentials: "include"` so the Kratos session cookie is forwarded.

```typescript
createSynapClient({ podUrl, workspaceId });
```

---

## Type helpers

```typescript
import type { RouterInputs, RouterOutputs } from "@synap/sdk";
// or from "@synap/react"

type CreateInput = RouterInputs["entities"]["create"];
type EntityList = RouterOutputs["entities"]["list"]["items"][number];
```

---

## Full procedure list

See the [API Reference](../../reference/api-reference.md) for every available query and mutation, auto-generated from the live router.

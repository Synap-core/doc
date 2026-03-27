---
sidebar_position: 3
---

# Quickstart

**Build your first app on top of Synap in 5 minutes.**

---

## Prerequisites

- A running Synap data pod (self-hosted or [synap.live](https://synap.live))
- Your **Pod URL**, **Workspace ID**, and an **API key**

> To get your API key: open the Synap app → **Workspace Settings → Developer → API Keys → Generate key**

---

## Option A — React app

### 1. Install

```bash
npm install @synap/react
```

### 2. Add the provider

```tsx
// app.tsx (or _app.tsx in Next.js)
import { SynapProvider } from "@synap/react";

export default function App({ children }) {
  return (
    <SynapProvider
      podUrl="https://your-pod.synap.live"
      apiKey="sk_live_..."
      workspaceId="ws_..."
    >
      {children}
    </SynapProvider>
  );
}
```

### 3. Fetch data

```tsx
import { useSynap } from "@synap/react";

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

### 4. Create data

```tsx
import { useSynap } from "@synap/react";

export function CreateNote() {
  const create = useSynap().entities.create.useMutation();

  return (
    <button
      onClick={() =>
        create.mutate({
          profileSlug: "note",
          title: "My note",
          properties: { content: "Written via the SDK!" },
        })
      }
    >
      {create.isPending ? "Saving…" : "Create note"}
    </button>
  );
}
```

---

## Option B — Vanilla JS / TypeScript

```bash
npm install @synap/sdk
```

```typescript
import { createSynapClient } from "@synap/sdk";

const synap = createSynapClient({
  podUrl: "https://your-pod.synap.live",
  apiKey: "sk_live_...",
  workspaceId: "ws_...",
});

// Read
const entities = await synap.entities.list.query({ limit: 20 });
console.log(entities.items);

// Write
const newNote = await synap.entities.create.mutate({
  profileSlug: "note",
  title: "Hello from the SDK",
});
console.log("Created:", newNote.id);

// Search
const results = await synap.search.global.query({ q: "my search" });
```

---

## Option C — cURL (no SDK)

All tRPC procedures are HTTP-batchable at `/trpc`. For quick tests:

```bash
# List entities (GET query)
curl "https://your-pod.synap.live/trpc/entities.list?input=%7B%22limit%22%3A5%7D" \
  -H "Authorization: Bearer sk_live_..." \
  -H "x-workspace-id: ws_..."

# Create an entity (POST mutation)
curl -X POST "https://your-pod.synap.live/trpc/entities.create" \
  -H "Authorization: Bearer sk_live_..." \
  -H "x-workspace-id: ws_..." \
  -H "Content-Type: application/json" \
  -d '{"json":{"profileSlug":"note","title":"My note"}}'
```

---

## Type safety

The SDK is generated from the live `AppRouter` type — you get full autocomplete on every procedure:

```typescript
import type { RouterInputs, RouterOutputs } from "@synap/sdk";

type CreateInput = RouterInputs["entities"]["create"];
// → { profileSlug: string; title: string; properties?: Record<string, unknown>; ... }

type Entity = RouterOutputs["entities"]["list"]["items"][number];
// → { id: string; title: string; profileSlug: string; properties: ...; createdAt: Date; ... }
```

---

## Next steps

- **[SDK Overview](../development/sdk/overview.md)** — all options, auth modes, type helpers
- **[API Reference](../reference/api-reference.md)** — every procedure, auto-generated
- **[Architecture](../architecture/components/client-sdk.md)** — how the type pipeline works
- **[Self-hosting guide](../deployment/data-pod/self-hosted.md)** — run your own pod

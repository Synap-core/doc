---
sidebar_position: 2
---

# Client SDK

**Type-safe packages for building on top of Synap data pods.**

---

## Packages

| Package | npm | Description |
|---------|-----|-------------|
| `@synap/sdk` | [`@synap/sdk`](https://npmjs.com/package/@synap/sdk) | Vanilla JS/TS tRPC client |
| `@synap/react` | [`@synap/react`](https://npmjs.com/package/@synap/react) | React hooks + TanStack Query |
| `@synap-core/api-types` | [`@synap-core/api-types`](https://npmjs.com/package/@synap-core/api-types) | Auto-generated `AppRouter` type |

---

## How types flow end-to-end

import MermaidFullscreen from '@site/src/components/MermaidFullscreen';

<MermaidFullscreen
  title="Type-safe SDK pipeline"
  value={`graph LR
    A["tRPC Routers\n(synap-backend)"] -->|"dts-bundle-generator\n(gen-types.mjs)"| B["@synap-core/api-types\nAppRouter type"]
    B -->|"npm publish\n(CI on push to main)"| C["npm registry"]
    C -->|"npm install"| D["@synap/sdk\ncreateClient()"]
    C -->|"npm install"| E["@synap/react\nuseSynap() hooks"]
    D --> F["Your App\nfull type safety + autocomplete"]
    E --> F`}
/>

The key insight: **`AppRouter` is a TypeScript type, not a runtime dependency.** The pod never ships its router code to clients — only the type definition is published. This gives you compile-time safety with zero runtime overhead.

---

## Architecture

### `@synap/sdk`

Thin wrapper around `@trpc/client` + `superjson`:

```typescript
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "@synap-core/api-types";

export function createSynapClient(options: SynapClientOptions) {
  return createTRPCClient<AppRouter>({
    links: [httpBatchLink({ url: `${podUrl}/trpc`, ... })],
  });
}
```

No classes, no magic — just a configured tRPC client typed to `AppRouter`.

### `@synap/react`

Wraps the SDK in a React context + TanStack Query:

```tsx
// Provider sets up QueryClient + tRPC client
<SynapProvider podUrl="..." apiKey="..." workspaceId="...">

// useSynap() returns the full tRPC React hook tree
const { data } = useSynap().entities.list.useQuery({ limit: 20 });
```

Backed by `createTRPCReact<AppRouter>()` — every procedure becomes a `.useQuery` / `.useMutation` hook automatically.

### `@synap-core/api-types`

Auto-generated on every push to `main` via `gen-types.mjs`:

```
tRPC routers → dts-bundle-generator → generated.d.ts → npm publish
```

External consumers get the same `AppRouter` type that the internal monorepo uses.

---

## CORS & auth model

The pod implements **two-mode CORS**:

| Auth mode | Header | CORS behavior |
|-----------|--------|--------------|
| API key | `Authorization: Bearer sk_live_...` | Any origin allowed (no credentials header) |
| Session cookie | `ory_kratos_session` cookie | Origin must be in workspace `corsAllowedOrigins` |

Bearer tokens are **explicit** (JS must send them) so CSRF doesn't apply — any origin is fine. Session cookies are **ambient** (browser sends automatically) — whitelist required.

---

## Quick start

See the [SDK Overview](../../development/sdk/overview.md) for installation and usage examples.

Full procedure list: [API Reference](../../reference/api-reference.md)

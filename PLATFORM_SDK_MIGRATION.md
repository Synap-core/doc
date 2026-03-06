# Platform SDK — Architecture & Migration Plan

## Current state (implemented 2026-03-02)

`@synap/platform-sdk` exists as a **context bridge**: it exposes a clean hook API
(`usePlatformUser`, `useFeatureFlags`, `useIntelligenceActive`, …) but does not own
state or fetching. The browser wires `platformStore` (Zustand) into the SDK context
via `PlatformSdkBridge`. The web app still passes props directly.

```
Browser:
  platformStore (Zustand, 1,079 lines, IPC-backed)
    └─ PlatformSdkBridge          ← thin bridge component in App.tsx
         └─ PlatformSdkProvider   ← SDK context
              └─ useIntelligenceActive() / useFeatureFlags() / …

Web app:
  tRPC subscription query + manual derivation
    └─ intelligenceActive prop    ← passed explicitly to IntelligenceApp
```

This works and is live. It is not the final architecture.

---

## Target architecture

The SDK should **own state and fetching** and accept a **transport adapter** so that
both the browser (Electron IPC) and the web app (plain fetch) can use identical hooks
with no bridge components.

```
Browser:                          Web app:
  ElectronPlatformAdapter           FetchPlatformAdapter
        │                                  │
        └─────────── PlatformSdkProvider ──┘
                            │
          usePlatformUser() │ useSubscription()
          useFeatureFlags() │ useIntelligenceActive()
          useControlPlaneUrl() …
```

### What the adapter interface looks like

```typescript
// @synap/platform-sdk/src/adapter.ts

export interface PlatformSdkAdapter {
  /** Fetch authenticated user info */
  fetchUser(): Promise<PlatformUser | null>;

  /** Fetch subscription + add-ons */
  fetchSubscription(): Promise<{
    subscription: SubscriptionInfo | null;
    addonSubscriptions: AddonSubscription[];
  }>;

  /** Fetch intelligence API keys */
  fetchApiKeys(): Promise<ApiKeyInfo[]>;

  /** Fetch user's primary pod */
  fetchPod(): Promise<PodInfo | null>;

  /** Control plane base URL (for components that need to call it directly) */
  getControlPlaneUrl(): string;

  /** Optional: callbacks for navigation */
  onActivateSynapAI?(): void;
  onOpenIntelligenceSettings?(): void;
  onProvisionService?(serviceId: string): Promise<void>;
}
```

### Browser adapter (Electron)

Implemented in `browser/electron/renderer/src/adapters/ElectronPlatformAdapter.ts`.
Delegates to `platformClient.ts` functions (which use `window.synap.*` IPC).

```typescript
export class ElectronPlatformAdapter implements PlatformSdkAdapter {
  async fetchUser() {
    return fetchUserConfig().then(cfg => cfg?.user ?? null);
  }
  async fetchSubscription() {
    return fetchSubscriptionInfo(); // existing platformClient function
  }
  // …
  getControlPlaneUrl() { return getControlPlaneUrl(); }
}
```

### Web app adapter (fetch)

Implemented in `synap-app/apps/web/lib/platform/FetchPlatformAdapter.ts`.
Uses plain `fetch()` with credentials.

```typescript
export class FetchPlatformAdapter implements PlatformSdkAdapter {
  constructor(private controlPlaneUrl: string) {}

  async fetchUser() {
    const res = await fetch(`${this.controlPlaneUrl}/auth/whoami`, { credentials: 'include' });
    if (!res.ok) return null;
    return res.json();
  }
  // …
  getControlPlaneUrl() { return this.controlPlaneUrl; }
}
```

### SDK provider (new signature)

```typescript
// Simple — no bridge needed
<PlatformSdkProvider adapter={new ElectronPlatformAdapter()}>
  <App />
</PlatformSdkProvider>
```

SDK uses React Query internally to fetch + cache. Polling interval configurable
(default 60s for subscription, 5min for API keys).

---

## Migration steps

### Step 1 — Add adapter interface to `@synap/platform-sdk`

Create `src/adapter.ts` with the `PlatformSdkAdapter` interface.
Update `PlatformSdkProvider` to accept either `adapter` or `value` (keep backward
compat during migration).

### Step 2 — Implement `FetchPlatformAdapter` for web app

Create in `synap-app/apps/web/lib/platform/`.
Wire into `WorkspaceLayout` or root layout via `PlatformSdkProvider`.
Remove `intelligenceActive` / `onActivateSynapAI` props from `IntelligenceApp` call
in `workspace/page.tsx` — SDK hooks handle them.

### Step 3 — Implement `ElectronPlatformAdapter` for browser

Create in `browser/electron/renderer/src/adapters/`.
Wire into `App.tsx` — replace `PlatformSdkBridge` with
`<PlatformSdkProvider adapter={new ElectronPlatformAdapter(…)}>`.

### Step 4 — Delete `platformStore.ts` in browser

Migrate all remaining consumers of `platformStore` to SDK hooks:

| Old (platformStore)            | New (SDK hook)                       |
|-------------------------------|--------------------------------------|
| `usePlatformUser()`           | `usePlatformUser()` from SDK         |
| `usePlatformSubscription()`   | `usePlatformSubscription()` from SDK |
| `usePlatformApiKeys()`        | `usePlatformApiKeys()` from SDK      |
| `usePlatformStore(s => s.addonSubscriptions)` | `usePlatformAddonSubscriptions()` |
| Manual `intelligenceActive` derivation | `useIntelligenceActive()` from SDK |

Files to update: `SettingsView.tsx`, `IntelligenceApp.tsx`, `ActivityBar.tsx`,
`OnboardingFlow.tsx`, `PodConnectPanel.tsx`, and anything else importing from
`platformStore`.

### Step 5 — Delete `PlatformSdkBridge`

Remove `components/providers/PlatformSdkBridge.tsx` and its usage in `App.tsx`.

---

## Why not now?

- `platformStore.ts` is 1,079 lines with many consumers — safe migration requires
  careful per-file updates and testing.
- The bridge approach already delivers the unified hook API to new code (including
  `useIntelligenceActive` in `IntelligenceApp.tsx`). No user-visible regression risk.
- Steps 1–5 above can be done as a dedicated refactor session with no feature work
  blocked on it.

---

## Files involved

| File | Action |
|------|--------|
| `synap-app/packages/core/platform-sdk/src/adapter.ts` | CREATE — adapter interface |
| `synap-app/packages/core/platform-sdk/src/context.tsx` | UPDATE — accept `adapter` prop, use React Query internally |
| `synap-app/apps/web/lib/platform/FetchPlatformAdapter.ts` | CREATE |
| `synap-app/apps/web/app/workspace/page.tsx` | UPDATE — remove explicit platform props |
| `browser/electron/renderer/src/adapters/ElectronPlatformAdapter.ts` | CREATE |
| `browser/electron/renderer/src/App.tsx` | UPDATE — swap bridge for adapter |
| `browser/electron/renderer/src/components/providers/PlatformSdkBridge.tsx` | DELETE |
| `browser/electron/renderer/src/stores/platformStore.ts` | DELETE (after migration) |

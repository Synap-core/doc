# Synap Browser — Current State, Vision & Production Roadmap

> Written: February 2026
> Scope: Electron desktop app (`/browser`), its position relative to the product vision, what remains, and everything needed to ship production-ready installers.

---

## 1. What We Have: Current State

### Architecture Overview

The Synap Browser is an Electron application built with:
- **electron-vite** (Vite-based build system for Electron)
- **React 19** + **Tamagui** UI system
- **tRPC** + **TanStack Query** for all data access
- **Zustand** for local state management
- **Context isolation** (sandboxed preload bridge via `window.synap`)
- **Monorepo source aliases** — workspace packages resolved directly to their TypeScript source at build time, no NPM publishing needed

The app is structured as a **personal OS / workspace browser**: a persistent shell (activity bar + sidebar) that hosts independent app panels, each backed by a Synap Data Pod.

### Implemented Apps (9 of 11)

| App | Status | Pod Required | Notes |
|-----|--------|--------------|-------|
| **Home / Dashboard** | ✅ Full | No | Bento grid with 23+ widget types, drag/resize |
| **Browser** | ✅ Full | No | Embedded Chromium tabs, multi-window |
| **Terminal** | ✅ Full | No | node-pty + xterm, tabs, multi-window |
| **Notes** | ✅ Full | Yes | DocsApp from `@synap/docs-app` |
| **Documents** | ✅ Full | Yes | DocsApp (same package, different context) |
| **Data** | ✅ Full | Yes | Entity database with list/table/graph views |
| **Whiteboard** | ✅ Full | Yes | Infinite canvas, real-time Yjs sync, versions |
| **Intelligence** | ✅ Full | Yes | AI threads, commands, agents, connections |
| **Settings** | ✅ Full | No | Preferences, pod management |
| **Calendar** | ⬜ Stub | Yes | Registered in app registry, no UI |
| **Files** | ⬜ Stub | Yes | Registered in app registry, no UI |
| **Vault** | ✅ Full | Yes | Encrypted secrets with Touch ID / biometric |

### Infrastructure & Cross-Cutting Features

| Feature | Status | Notes |
|---------|--------|-------|
| **Data Pod auth** | ✅ | Kratos session-based auth for self-hosted pods |
| **Control Plane auth** | ✅ | Better Auth (`api.synap.live`) with IPC cookie bridge |
| **Offline gate (PodGate)** | ✅ | Contextual 3-state UI: offline / never-connected / reconnect |
| **Entity floating panels** | ✅ | Any entity opens in a floating overlay from any app |
| **Entity fullscreen view** | ✅ | Entities can expand to full panel |
| **Picture-in-Picture (PIP)** | ✅ | Intelligence app can float in corner |
| **Command palette** | ✅ | Global Cmd+K with app & entity navigation |
| **Keyboard shortcuts** | ✅ | Cmd+1–9 app switching, per-app shortcuts |
| **Multi-window** | ✅ | Apps can detach into separate OS windows |
| **Real-time sync** | ✅ | Yjs collaboration + `useRealtimeSync` websocket |
| **Biometric auth** | ✅ | Touch ID (macOS) / Windows Hello gating |
| **Extensions** | ✅ | Chromium extension support via `ExtensionsView` |
| **Screen capture** | ✅ | `capture-service` + `capture-manager` in main |
| **Onboarding flow** | ✅ | Rendered at first launch |
| **Dark / Light theme** | ✅ | OS-aware, toggleable |
| **Sync status indicator** | ✅ | Shows pod connection health |
| **Auto-connect** | ✅ | Reconnects to last pod on launch |

---

## 2. How Close Are We to the Vision?

### What's Working End-to-End

The core loop is complete: a user can install the app, connect to their pod (self-hosted or via `api.synap.live`), and immediately use Notes, Data, Whiteboard, and Intelligence with real-time sync. Auth, session handling, offline gates, entity panels, and keyboard navigation all work.

### What's Missing From the Full Vision

#### Apps
- **Calendar** — No UI implemented. The app is registered but clicking it in the activity bar renders nothing. Needs a `CalendarApp.tsx` backed by a `@synap/calendar` package or direct tRPC `events.*` calls.
- **Files** — No UI implemented. Should be a file tree / media browser backed by pod storage.

#### Connection & Onboarding
- **Control Plane auto-provisioning** — Users who sign in via `api.synap.live` should have their pod URL fetched automatically via `platform.getUserConfig`. The `PodConnectPanel` does call this but the flow from "I'm a new user" → "pod spinning up" → "auto-connected" may not be fully polished for brand-new accounts (provisioning state).
- **Onboarding UX** — The `onboarding/` component exists but its depth and polish level is unknown. A smooth "connect your pod" step in onboarding is critical for first-run experience.

#### Dashboard Widgets
- Some widgets are likely placeholders. Widget real-time data binding (e.g., "recent entities" widget pulling live from tRPC) should be audited.

#### Settings App
- Pod management settings (add/remove pods, set default pod) should be fully polished.
- App-specific preferences per app are defined in the registry but may not be fully surfaced in the Settings UI.

#### Sharing / Collaboration
- The architecture supports multi-user (Yjs real-time sync is in place) but there's no in-app way to invite collaborators to a pod or share a document link.

#### Notifications
- No notification center or push notification system visible.

#### Mobile / Web Companion
- The Electron app has no web export mode. A companion web app is a separate project.

---

## 3. What to Tackle Next (Priority Order)

### Tier 1 — Required to Feel Finished
1. **Calendar app** — Wire up `@synap/calendar` or implement a minimal event calendar backed by `events.*` tRPC. This is the most visible missing app.
2. **Files app** — Implement a file browser for pod-stored assets.
3. **Onboarding polish** — Ensure new users flow from sign-in → pod connected → first app open without friction.
4. **Production build & installer** — See Section 4 below. Can't ship without this.

### Tier 2 — Polish & Completeness
5. **Dashboard widget data bindings** — Audit which widgets show real data vs. static mocks.
6. **Settings: pod management UI** — Full CRUD for saved pods.
7. **Settings: app preferences** — Per-app settings panels.
8. **Entity panel deep-linking** — Opening an entity URL from outside the app should auto-focus the right panel.

### Tier 3 — Growth Features
9. **Collaboration invites** — UI to share access to a pod workspace.
10. **Notification center** — In-app toast + persistent notification feed.
11. **Extension marketplace** — Browse/install Chromium extensions from within the app.
12. **CLI integration** — `synap-cli` can already be configured; surface this in Settings.
13. **Mobile sync status** — Show cross-device sync indicators.

---

## 4. Production Distribution — Everything Needed

### How It Currently Works (Build System)

The app uses **electron-vite** which runs Vite for all three Electron targets:

```
electron-vite build
  ├── main process     → out/main/index.js      (Node.js bundle)
  ├── preload          → out/preload/index.js    (sandboxed bridge)
  └── renderer         → out/renderer/           (browser bundle)
```

After `electron-vite build`, you run **electron-builder** to package the `out/` directory + Electron binary into platform-specific installers.

### The Workspace Package Question

**Short answer: You don't need to publish anything to NPM.**

The `electron.vite.config.ts` file contains path aliases that map every `@synap/*` import directly to its TypeScript source in the monorepo:

```typescript
"@synap/hooks": resolve(projectRoot, "synap-app/packages/synap-hooks/src"),
"@synap/docs-app": resolve(projectRoot, "synap-app/packages/apps/docs/src"),
// ... 18 total aliases
```

When Vite builds, it follows these aliases into the source files and **bundles them all together** into the renderer output. The final `out/renderer/assets/*.js` file contains everything — your packages, their dependencies, all inlined. electron-builder then wraps this with the Electron binary.

**Result:** The installed app on the user's machine is completely self-contained. It has no dependency on the monorepo, no npm registry, no internet access needed to run (except for pod connectivity). This is the correct and standard approach for Electron apps using a monorepo.

The only thing to watch: if a package has native addons (like `node-pty`), those must either be pre-built binaries or rebuilt via `electron-rebuild` during packaging. `node-pty` is already handled in the `postinstall` script.

### What's Needed for a Production-Ready Installer

#### 4a. App Icons — MISSING

No icon files exist in the `browser/` directory. You need:

| Platform | File | Size | Format |
|----------|------|------|--------|
| macOS | `build/icon.icns` | 1024×1024 | `.icns` (multi-resolution) |
| Windows | `build/icon.ico` | 256×256 | `.ico` (multi-size) |
| Linux | `build/icon.png` | 512×512 | PNG |

**How to create them:**

Start with a 1024×1024 PNG of the Synap logo. Then:
```bash
# macOS .icns (requires Xcode command line tools)
mkdir icon.iconset
# generate sizes: 16, 32, 64, 128, 256, 512, 1024
iconutil -c icns icon.iconset -o build/icon.icns

# Windows .ico (using ImageMagick)
convert icon-1024.png -resize 256x256 build/icon.ico

# Linux PNG
cp icon-1024.png build/icon.png
```

Or use a service like https://www.icoconverter.com / https://cloudconvert.com.

#### 4b. electron-builder Config — MISSING

No `electron-builder.yml` exists. Add one at `browser/electron-builder.yml`:

```yaml
appId: live.synap.browser
productName: Synap
copyright: "Copyright © 2026 Synap"

# Where electron-builder looks for resources
directories:
  buildResources: build
  output: dist

# What to include in the app package
files:
  - out/**/*
  - package.json
  - "!**/node_modules/**"
  - "!**/*.map"

# Extra resources (optional: fonts, native binaries, etc.)
extraResources:
  - from: "../synap-backend/..."  # only if needed

# macOS
mac:
  target:
    - target: dmg
      arch: [x64, arm64]    # Intel + Apple Silicon
    - target: zip            # for auto-updates
  icon: build/icon.icns
  category: public.app-category.productivity
  hardenedRuntime: true      # required for notarization
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist

dmg:
  title: "Synap ${version}"
  sign: false                # sign the DMG separately if needed

# Windows
win:
  target:
    - target: nsis
      arch: [x64, ia32]
    - target: zip
  icon: build/icon.ico
  publisherName: "Synap"
  signingHashAlgorithms: [sha256]

nsis:
  oneClick: false             # show installer UI
  allowToChangeInstallationDirectory: true
  installerIcon: build/icon.ico
  uninstallerIcon: build/icon.ico
  createDesktopShortcut: always
  createStartMenuShortcut: true
  shortcutName: Synap

# Linux
linux:
  target:
    - target: AppImage
      arch: [x64]
    - target: deb
  icon: build/icon.png
  category: Office

# Auto-update publishing (e.g., GitHub Releases)
publish:
  - provider: github
    owner: your-github-org
    repo: synap-browser
    releaseType: release
```

#### 4c. macOS Entitlements — MISSING (for notarization)

Create `browser/build/entitlements.mac.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.network.client</key>
  <true/>
  <key>com.apple.security.device.microphone</key>
  <true/>
  <key>com.apple.security.device.camera</key>
  <true/>
</dict>
</plist>
```

#### 4d. Build Scripts

Add to `browser/package.json`:

```json
{
  "scripts": {
    "build": "electron-vite build",
    "dist": "electron-vite build && electron-builder",
    "dist:mac": "electron-vite build && electron-builder --mac",
    "dist:win": "electron-vite build && electron-builder --win",
    "dist:linux": "electron-vite build && electron-builder --linux",
    "dist:all": "electron-vite build && electron-builder --mac --win --linux"
  }
}
```

#### 4e. Code Signing

**macOS:** You need an Apple Developer ID certificate. Unsigned apps show a Gatekeeper warning and can't be notarized. Set these env vars during CI build:
```
APPLE_ID=you@example.com
APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx
APPLE_TEAM_ID=XXXXXXXXXX
CSC_LINK=base64-encoded-p12-certificate
CSC_KEY_PASSWORD=your-cert-password
```

**Windows:** A code signing certificate (EV or OV) prevents SmartScreen warnings. Without it, users see "Windows protected your PC". Set:
```
WIN_CSC_LINK=path-to-certificate.p12
WIN_CSC_KEY_PASSWORD=your-cert-password
```

For early distribution you can skip signing — users just have to click through the warning.

#### 4f. Auto-Updates

Install `electron-updater`:
```bash
cd browser && pnpm add electron-updater
```

In `electron/main/index.ts`:
```typescript
import { autoUpdater } from 'electron-updater';

autoUpdater.checkForUpdatesAndNotify();
```

When you publish a new release to GitHub (with `electron-builder --publish always`), users get an auto-update prompt. The `publish` block in `electron-builder.yml` controls where updates come from.

#### 4g. The `projectRoot` Hardcode

**Critical issue for CI/other machines:** The vite config has:
```typescript
const projectRoot = "/Users/antoine/Documents/Code/synap";
```

This must be replaced with a dynamic path before the project can build on any machine other than yours:
```typescript
import { resolve } from "path";
const projectRoot = resolve(__dirname, "../../../.."); // browser/ → synap/
```

This is the most important fix before anyone else can run a build.

---

## 5. Full Production Checklist

### Build Infrastructure
- [ ] Fix hardcoded `projectRoot` in `electron.vite.config.ts`
- [ ] Create `build/icon.icns`, `build/icon.ico`, `build/icon.png`
- [ ] Create `electron-builder.yml`
- [ ] Create `build/entitlements.mac.plist`
- [ ] Add `dist:*` scripts to `package.json`
- [ ] Verify `node-pty` native rebuild works via `electron-rebuild`

### App Readiness
- [ ] Implement Calendar app
- [ ] Implement Files app
- [ ] Polish onboarding (first-run flow)
- [ ] Audit dashboard widgets for real data vs mocks

### Signing & Distribution
- [ ] Obtain Apple Developer ID certificate
- [ ] Set up macOS notarization in CI
- [ ] Obtain Windows EV code signing cert (optional for beta)
- [ ] Configure GitHub Releases or S3 for auto-update feed
- [ ] Set up `electron-updater` in main process

### Quality
- [ ] Smoke test on fresh macOS arm64 (Apple Silicon)
- [ ] Smoke test on macOS x64 (Intel)
- [ ] Smoke test on Windows 11
- [ ] Test auto-update flow end-to-end

---

## 6. Build Command Reference

```bash
# Development (hot reload)
cd browser && pnpm dev

# Production bundle (no installer)
cd browser && pnpm build
# Output: browser/out/

# macOS DMG (requires macOS)
cd browser && pnpm dist:mac
# Output: browser/dist/Synap-1.0.0.dmg

# Windows installer (requires Windows or cross-compile)
cd browser && pnpm dist:win
# Output: browser/dist/Synap Setup 1.0.0.exe

# Universal (Intel + Apple Silicon) macOS
# Set in electron-builder.yml: arch: [x64, arm64]
cd browser && pnpm dist:mac
# Output: browser/dist/Synap-1.0.0-universal.dmg
```

---

## 7. Key Files Reference

| Purpose | Path |
|---------|------|
| Vite/Electron build config | `browser/electron.vite.config.ts` |
| Electron-builder config (to create) | `browser/electron-builder.yml` |
| App icons directory (to create) | `browser/build/` |
| Main process entry | `browser/electron/main/index.ts` |
| Preload / IPC bridge | `browser/electron/preload/index.ts` |
| App registry (all apps) | `browser/electron/renderer/src/stores/appRegistry.ts` |
| Connection / pod auth | `browser/electron/main/connection/connection-manager.ts` |
| Platform store (CP auth) | `browser/electron/renderer/src/stores/platformStore.ts` |
| App shell / layout | `browser/electron/renderer/src/App.tsx` |

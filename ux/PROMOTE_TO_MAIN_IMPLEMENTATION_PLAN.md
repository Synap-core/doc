# Promote-to-Main Flow — Implementation Plan

**Goal:** When the AI generates a view and the user clicks it, the view becomes the **main content** (non-fixed sidebar entry), and the **current AI chat** moves to the **side panel**. The sidebar shows a **dynamic tab** for that view with **Close** (revert to chat-as-main) and **Pin** (add to sidebar as persistent entry). Single source of truth for state, no redundancy, clean URL encoding.

**Reference:** `docs/ux/CHAT_FIRST_WORKSPACE_AND_SIDE_PANEL.md` Section 7.

---

## 1. State model (single source of truth)

### 1.1 Current

- **Open state** (`@synap/workspace-state`): `app`, `viewId`, `chatThreadId`, etc. Main content = `app` (e.g. `intelligence`, `views`); when `app === "views"`, `viewId` selects which view. No notion of "main was something else before this view".
- **Side panel**: `useWorkspaceStore().sidePanelTabs` (cell panels: entity, document, ai-chat, view). Independent of open state.
- **Sidebar**: Fixed apps from layout (pinned) or default list. No dynamic "current main resource" tab.

### 1.2 Target

- **Main content** can be:
  - **Fixed app** (e.g. `intelligence`, `canvas`, `data`, `views` with no specific view) — current behavior.
  - **Resource as main** — e.g. "this view is main". Represented as: `app === "views"` and `viewId` set, with **`previousMainApp`** set when we promoted the view (so we know what to revert to on close).
- **`previousMainApp`**: New optional field in open state. Set when we "promote view to main" (so close restores it); cleared when user switches main via sidebar to a fixed app or when they close the dynamic tab.
- **URL**: Continue using `app`, `view`, `chat`. When main is a view: `app=views`, `view=<viewId>`, and when chat is in side we already have `chat=<channelId>` (optional). No new param strictly required; we can add `prev=` for `previousMainApp` for back/forward if desired (Phase 2).

**No new "main resource" type in state:** Reuse existing `app` + `viewId`. The only addition is **`previousMainApp?: string`** so the sidebar and close action know what to revert to.

---

## 2. Files and changes (by area)

### 2.1 Open state store (`@synap/workspace-state`)

| File | Change |
|------|--------|
| `packages/core/workspace-state/src/store.ts` | Add `previousMainApp: string \| undefined` to state and to `WorkspaceOpenState` interface. Add `setPreviousMainApp(prev: string \| undefined)`. In `setFromParams`, map from params if we add a URL param (optional). Add action **`promoteViewToMain(viewId: string)`**: set `previousMainApp = get().app ?? "intelligence"`, then `setApp("views")`, `setViewId(viewId)`, `setView(viewId)`. Add action **`closeMainView()`**: if `app === "views"` and `viewId` and `previousMainApp` are set, then `setApp(previousMainApp)`, `setViewId(undefined)`, `setView(undefined)`, `setPreviousMainApp(undefined)`; otherwise no-op. |
| `packages/core/workspace-state/src/workspaceUrlSchema.ts` | Optional: add `prev` to `WorkspaceUrlParams` and parse/build for back/forward. Can be Phase 2. |
| `packages/core/workspace-state/src/index.ts` | Export `setPreviousMainApp`, `promoteViewToMain`, `closeMainView` if not already exported via the store. |

**Contract:** When `app === "views"` and `viewId` is set, the main area shows that view. When in addition `previousMainApp` is set, the sidebar treats this as a "dynamic main tab" (show Close/Pin). When `previousMainApp` is not set (e.g. user clicked "Views" then picked a view from the list), we can still show the view in main but the sidebar may not show a closable dynamic tab — or we can treat "views + viewId" always as a dynamic tab for consistency; product decision.

**Recommendation:** Treat "dynamic tab" only when `previousMainApp` is set (i.e. we came from promote-to-main). So: sidebar shows dynamic "View: &lt;name&gt;" with Close/Pin only when `previousMainApp != null`.

---

### 2.2 Workspace runtime (promote + move chat to side)

| File | Change |
|------|--------|
| `apps/web/app/workspace/WorkspaceRuntimeProvider.tsx` | No change to `navigate` for `view`. Keep `openStateActions.openView(target.id)` for normal "open view" (e.g. from links). |
| New helper (or in WorkspaceRuntimeProvider / page) | Provide **`promoteViewToMainAndMoveChatToSide(viewId: string, channelId: string)`**: (1) `openStateActions.promoteViewToMain(viewId)`, (2) `openCellPanel("ai-chat", { channelId }, { placement: "side" })`. This is the single place that implements "view as main + chat in side". |

**Where to call it:** From the workspace page when rendering IntelligenceApp: pass a new callback **`onPromoteViewToMain`** that receives `(viewId, channelId)` and calls the helper above. IntelligenceApp will pass it to ChatApp; ChatApp will pass it to ChatView → MessageExtraContent / proposal cards for views.

---

### 2.3 Workspace page (wire promote + open view)

| File | Change |
|------|--------|
| `apps/web/app/workspace/page.tsx` | In the block that renders `IntelligenceApp`, add **`onPromoteViewToMain`**: use `openStateActions.promoteViewToMain(viewId)`, then `openCellPanel("ai-chat", { channelId }, { placement: "side" })` (get `openCellPanel` from `useWorkspaceStore()` in the same component). Pass **`onPromoteViewToMain`** into `IntelligenceApp`. Keep **`onOpenView`** as-is for "just open view in main" (set viewId + switch to views) so other callers (e.g. Studio) still work. Optionally: when we have a "Show in main" button in chat, it will call `onPromoteViewToMain(viewId, currentChannelId)`; when we have "View" only, it can keep calling `onOpenView(viewId)` or open in side panel depending on design. |

---

### 2.4 Intelligence app (pass-through)

| File | Change |
|------|--------|
| `packages/apps/intelligence/src/IntelligenceApp.tsx` | Add prop **`onPromoteViewToMain?: (viewId: string, channelId: string) => void`**. When `mode === "chat"`, pass it to `ChatApp` as **`onPromoteViewToMain`**. No change to `onOpenProposalTarget` or `onOpenView` here; they stay as host-provided. |

---

### 2.5 Chat app (ChatApp + ChatView)

| File | Change |
|------|--------|
| `packages/apps/chat/src/ChatApp.tsx` | Add **`onPromoteViewToMain?: (viewId: string, channelId: string) => void`** to `ChatAppProps`. When `openResource` is available and `onPromoteViewToMain` is provided, pass to `ChatView`: **`onPromoteViewToMain={(viewId) => onPromoteViewToMain(viewId, activeChannelId ?? "")}`** (only call when `activeChannelId` is set). For **`onOpenProposalTarget`**: when in workspace, we want entity/document to open in side panel; if the host (workspace page) already passes a richer callback that includes view (open in panel or open as main), use it. Otherwise extend: when type is `"view"` and we have `onPromoteViewToMain`, we could pass that as the "primary" action from the card. See MessageExtraContent / ProposalCard below. |
| `packages/features/ai-chat/src/components/ChatView.tsx` | Add **`onPromoteViewToMain?: (viewId: string) => void`** to props. Pass it to `MessageExtraContent` as **`onPromoteViewToMain`**. In **`handleEntityLinkClick`**, when `type === "view"` and `onPromoteViewToMain` is provided, we could offer both behaviors (e.g. "Open" vs "Show in main") or a single "Show in main" when in workspace; or keep a single click that calls `onPromoteViewToMain(id)` when provided, else `runtime.navigate({ type: "view", id })`. Product choice: either one primary action "Show in main" when callback exists, or two buttons. Plan: **one primary action** — when `onPromoteViewToMain` is provided, clicking the view card/link calls `onPromoteViewToMain(viewId)`; otherwise existing navigate/open. |

---

### 2.6 Message extras and proposal cards (view → "Show in main")

| File | Change |
|------|--------|
| `packages/features/ai-chat/src/components/MessageExtraContent.tsx` | Add **`onPromoteViewToMain?: (viewId: string) => void`** to props. When rendering **ProposalCard** or **ProposedActionRow** for a **view** (create_view / update_view or proposal with targetType view), pass a handler that calls **`onPromoteViewToMain?.(viewId)`** for the "View" / "Show in main" button. For **ProposalCard**: today `onOpenInPanel` is a generic "open in panel". For view proposals we need "Show in main" when `onPromoteViewToMain` is present. So: add **`onShowInMain?: (viewId: string) => void`** to MessageExtraContent; when building the card for a view proposal, pass **`onOpenInPanel`** as open in side (existing) and **`onShowInMain`** as the promote action. ProposalCard needs to support a second button "Show in main" when `onShowInMain` is provided and target is view. |
| `packages/features/ai-chat/src/components/ProposalCard.tsx` | Add optional **`onShowInMain?: () => void`** (or pass viewId and let parent provide the callback). When `proposal.targetType === "view"` and `onShowInMain` is provided, show a primary button "Show in main" (and optionally keep "View" for side panel). So: **View** = open in side panel (existing), **Show in main** = call `onShowInMain()`. |
| `packages/features/ai-chat/src/components/ProposedActionRow.tsx` | For **create_view** / **update_view** actions that have a `viewId` in args (or a resulting view id from the stream), add a clickable "Show in main" (or "Open") that calls **`onPromoteViewToMain?.(viewId)`** if provided. Need to get viewId from action args (e.g. `args.viewId` or `args.id`) or from proposal/response; if not available in the row, the row may only show after approval and we might get viewId from the proposal targetId. So: add optional **`onOpenViewInMain?: (viewId: string) => void`** to ProposedActionRow; when action is create_view/update_view and we have a viewId and `onOpenViewInMain`, show a button "Show in main" that calls it. |

**Unified approach:** Prefer a single entry point from MessageExtraContent: for any view result (proposal card or proposed action row), we pass **`onPromoteViewToMain`** and the viewId when available. ProposalCard and ProposedActionRow each accept an optional **`onShowInMain?: () => void`** (or with viewId) and render "Show in main" when present. MessageExtraContent builds that callback from `onPromoteViewToMain` + viewId from the proposal/action.

---

### 2.7 Sidebar: dynamic main tab (Close / Pin)

| File | Change |
|------|--------|
| `apps/web/app/workspace/components/FloatingSidebar.tsx` | **Read** `openState.app`, `openState.viewId`, `openState.previousMainApp` (from `useWorkspaceOpenState()`). When **`app === "views"`** and **`viewId`** is set and **`previousMainApp`** is set, treat current main as a **dynamic view tab**: Render a dedicated row/entry (e.g. above or below the fixed apps) for "View: &lt;title&gt;" (fetch view title via tRPC `views.get` or pass from parent; fallback to "View"). That entry has: (1) **Click** → already main (or switch to views + viewId if we’re on a different app). (2) **Close** (X) → call **`openStateActions.closeMainView()`**. (3) **Pin** → add to workspace layout as a sidebar item (`WorkspaceSidebarItem` with `kind: "view"`, `viewId`) and persist via `updateWorkspace.mutate({ settings: { layout: { sidebarItems: [...existing, newItem] } } })`; then optionally clear `previousMainApp` so the tab becomes "pinned" (no longer dynamic) or keep it as-is so closing still reverts main but the view stays in the sidebar. Product decision: Pin = add to sidebarItems + leave main as-is; Close = closeMainView(). |
| Same file | **Resolve view title:** Use `trpc.views.get.useQuery({ id: viewId })` when viewId is set (sidebar is in workspace, so workspaceId from context) to show "View: &lt;name&gt;" in the dynamic tab. |

**Placement of dynamic tab:** Show the dynamic "View: …" entry at the **top** of the app list (or immediately after a separator "Current") so it’s clear it’s the current main. When there’s no dynamic main (previousMainApp is null), no extra row.

---

### 2.8 URL sync (optional for Phase 1)

| File | Change |
|------|--------|
| `apps/web/app/workspace/components/WorkspaceUrlWrite.tsx` | When writing params, if we add `prev` to schema: when `previousMainApp` is set, add `prev=previousMainApp` so back/forward can restore it. Phase 1 can skip this. |
| `apps/web/app/workspace/components/WorkspaceUrlSync.tsx` | When reading URL, if `prev` is present, set `previousMainApp` from it. Phase 1 can skip. |

---

## 3. Data flow summary

1. **User in chat** → AI creates a view → message shows proposal card or "view created" card with **Show in main**.
2. **User clicks "Show in main"** → ChatView calls `onPromoteViewToMain(viewId)` → ChatApp calls `onPromoteViewToMain(viewId, activeChannelId)` → workspace page’s handler runs **`promoteViewToMain(viewId)`** and **`openCellPanel("ai-chat", { channelId }, { placement: "side" })`**.
3. **Open state** → `app = "views"`, `viewId = viewId`, `previousMainApp = "intelligence"`. **Side panel** → gains an ai-chat tab with that channel. **Main content** → renders Views app with that view (existing logic: when app is views and viewId set, Views app shows that view).
4. **Sidebar** → sees `app === "views"`, `viewId`, `previousMainApp` set → renders dynamic tab "View: &lt;name&gt;" with Close and Pin. **Close** → `closeMainView()` → app reverts to intelligence, viewId cleared, chat stays in side panel. **Pin** → add view to `sidebarItems`, persist; main stays as-is.
5. **URL** → already has `app=views`, `view=<viewId>`; with optional `prev=intelligence` for Phase 2.

---

## 4. Order of implementation (recommended)

1. **Open state** — Add `previousMainApp`, `promoteViewToMain`, `closeMainView` in workspace-state store.
2. **Workspace page** — Implement `onPromoteViewToMain(viewId, channelId)` (promote + open chat in side), pass to IntelligenceApp.
3. **IntelligenceApp** — Add and pass `onPromoteViewToMain` to ChatApp.
4. **ChatApp** — Add prop and pass `onPromoteViewToMain` to ChatView with `activeChannelId`.
5. **ChatView** — Add `onPromoteViewToMain`, pass to MessageExtraContent; in entity link handler for view, call `onPromoteViewToMain(id)` when provided.
6. **MessageExtraContent** — Add `onPromoteViewToMain`; for view proposals/actions, pass "Show in main" callback to ProposalCard and ProposedActionRow.
7. **ProposalCard** — Add `onShowInMain`; when targetType is view and `onShowInMain` present, show "Show in main" button.
8. **ProposedActionRow** — Add `onOpenViewInMain(viewId)` for create_view/update_view when viewId is available; show "Show in main" button.
9. **FloatingSidebar** — Add dynamic tab when `app === "views"` && `viewId` && `previousMainApp`; implement Close (`closeMainView`) and Pin (add to sidebarItems, persist).
10. **URL** (Phase 2) — Add `prev` to schema and sync if we want back/forward to restore previousMainApp.

---

## 5. Edge cases and consistency

- **Multiple views promoted in sequence:** Each promote sets `previousMainApp` to current `app` (e.g. first time: intelligence → views; second time: if main is already a view, previousMainApp stays intelligence). So closing once reverts to intelligence. If we want "stack" of mains (close goes to previous view), we’d need a stack in state; out of scope for this plan.
- **Pin then Close:** After pin, the view is in sidebarItems. Close clears main back to intelligence. The pinned view remains in the sidebar; clicking it can call `openView(viewId)` (and optionally set previousMainApp so it becomes the dynamic tab again) or just switch to views + viewId without setting previousMainApp — product choice.
- **View title in sidebar:** Use `trpc.views.get.useQuery({ id: viewId })` in FloatingSidebar; handle loading (show "View" until loaded) and error (show "View" or viewId slice).

---

## 6. Summary table

| Area | Files | Main change |
|------|--------|-------------|
| Open state | workspace-state/store.ts, optional schema/index | `previousMainApp`, `promoteViewToMain`, `closeMainView` |
| Runtime / page | WorkspaceRuntimeProvider (no change), page.tsx | `onPromoteViewToMain(viewId, channelId)` → promote + openCellPanel(ai-chat) |
| Intelligence | IntelligenceApp.tsx | Pass `onPromoteViewToMain` to ChatApp |
| Chat | ChatApp.tsx, ChatView.tsx | Prop `onPromoteViewToMain`, pass to MessageExtraContent and view link handler |
| Message extras | MessageExtraContent.tsx, ProposalCard.tsx, ProposedActionRow.tsx | "Show in main" for view proposals/actions |
| Sidebar | FloatingSidebar.tsx | Dynamic tab when view is main (previousMainApp set), Close + Pin |
| URL | WorkspaceUrlWrite/Sync (Phase 2) | Optional `prev` param |

This plan keeps a single source of truth (open state), avoids duplicating "what is main" logic, and reuses existing side panel and URL patterns. After approval, implementation can proceed in the order above.

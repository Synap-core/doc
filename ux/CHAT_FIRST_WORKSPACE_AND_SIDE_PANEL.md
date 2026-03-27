# Chat-First Workspace & Side Panel Integration

**Goal:** Align side panel usage with the centralized cell panel system, and define how to deliver a "chat-first" experience where the workspace (views, entities, profiles) is created through conversation with agents — with polished, reactive UX.

---

## 1. Side panel: centralized integration

### 1.1 Current state

- **Workspace (web):** `CellPanelOverlay` renders **side panel tabs** from `useWorkspaceStore().sidePanelTabs`. Opening a resource calls `openCellPanel(cellKey, props, { placement: "side" })`. Supported cells: `entity-detail`, `document`, `ai-chat`, `view` (with `PRIMARY_PROP_BY_CELL_KEY` for tab deduplication).
- **Cell runtime:** `useOpenResource()` maps `channel` → `openPanel("ai-chat", { channelId }, { placement: "side" })`. So **opening a channel in the side panel is already supported** at the store and runtime level.
- **Chat app:** When embedded in the workspace (Intelligence app), it runs under `WorkspaceRuntimeProvider`, so `useOpenResource()` is available. **Branch "Open in panel"** is now wired: `ChatApp` passes `onOpenBranchInPanel: openResource ? (channelId) => openResource("channel", channelId, { placement: "side" }) : undefined`. Clicking "Open in panel" on a `BranchResultCard` opens that channel as a **new tab in the centralized side panel** (same IDE-style tabs as entity/doc).
- **Standalone Chat app** (e.g. Electron or route without workspace): No `CellRuntimeProvider` → `openResource` is undefined → only "View branch" is shown (switches main view). No duplicate or conflicting panel system.

### 1.2 What to verify

- In workspace, open Intelligence → start a conversation that triggers a branch (e.g. specialist). In the message, click **"Open in panel"** on the branch card: the right-side panel should open (or add a tab) with that channel’s chat. "View branch" should still switch the main content to that channel.

---

## 2. Vision: chat-first workspace generation

**Idea:** User lands on the app → **chat first** (or chat + minimal shell). Through the conversation, the agent:

- Creates **profiles** (entity types), **property definitions**, **relations**
- Creates **views** (table, kanban, bento, etc.)
- Creates **entities** and optionally **documents**
- Optionally proposes a **full workspace** (onboarding / propose_workspace)

The **sidebar and main area** update as these resources appear: new views in the sidebar, new entities in context, with clear loading/animation so it feels like the workspace is "growing" from the dialogue.

---

## 3. Capabilities we have (backend + agents)

| Capability | Backend / IS | Notes |
|------------|----------------|--------|
| **Profiles & properties** | `create_profile`, `create_property_def` (hub protocol) | Workspace-builder agent uses these |
| **Relations** | `create_relation` | Typed links between profiles |
| **Views** | `create_view` (list, kanban, table, grid, bento, flow, graph, …) | View-builder agent; auto-approved |
| **Entities** | `create_entity`, `update_entity` | Action agent; proposals or auto-approve |
| **Documents** | `create_document`, `update_document` | Proposals or auto-approve |
| **Workspace proposal** | `propose_workspace` | High-level "create workspace" plan |
| **Workspace update** | `update_workspace` | Workspace-builder |
| **Bento schema** | `get_bento_schema` | View-builder for dashboards |

So the **agent can already create** profiles, views, entities, and documents. What we need is **frontend and UX** that:

- Reacts to these events (new view, new entity, new profile)
- Uses the **same cell rendering** for consistency (e.g. view in chat vs view in main area)
- Provides **loading and animation** so the sidebar and panels feel alive

---

## 4. Gaps and desired UX

### 4.1 Sidebar reactivity

- **Gap:** When the agent creates a **view** or a **profile**, the sidebar (FloatingSidebar / WorkspaceOS) may not update immediately or with a clear "new item" state.
- **Desired:**  
  - Subscribe to relevant tRPC invalidation or real-time events (e.g. view created, profile created).  
  - When a new view/profile appears: **animate** it into the sidebar (e.g. highlight, subtle pulse or slide-in).  
  - Optional: short toast or inline hint: "Agent added view X."

### 4.2 Entity / document creation feedback

- **Gap:** When the agent creates an **entity** or **document** (via proposal or auto-approve), the UI shows the proposal card or "Created" chip, but opening that resource in the side panel doesn’t necessarily feel "just created" (e.g. no skeleton → content transition).
- **Desired:**  
  - When opening an entity/doc that was **just created in this turn**, use a **loading/skeleton** state and then a short transition to content (e.g. fade or slide).  
  - Optionally mark the tab or header as "New" for a few seconds.

### 4.3 Cell rendering everywhere

- **Today:** Cells (`entity-detail`, `document`, `view`, `ai-chat`) are used in the **side panel** and in **main app content** via `CellRendererIsolated` / `PanelCellHost`. So "render anything on a cell anywhere" is already the pattern.
- **Gap:** **Inside chat messages** we don’t yet render full cells. We show cards (e.g. DocCreatedCard, ProposalCard, BranchResultCard) with "View" / "Open in panel" that open the resource in the side panel.
- **Desired (optional):** For a **compact preview** inside the message stream, we could embed a **cell in compact mode** (e.g. view thumbnail, entity card) so the user sees a live slice of the resource without leaving the thread. Clicking could still "Open in panel" for the full experience. This would leverage the same cell rendering and keep behavior consistent.

### 4.4 Chat-first entry and workspace emergence

- **Gap:** Today the workspace has a **sidebar of apps/views** from the start. A true "chat-first" flow would: start with **chat only** (or chat + minimal chrome), then **reveal sidebar items as the agent creates them** (e.g. first view, first profile).
- **Desired:**  
  - Optional **chat-first layout mode**: sidebar collapsed or hidden until the first view/profile is created (or user expands it).  
  - When the agent creates a view: **sidebar gains that view** with a clear "new" state and maybe a short animation.  
  - This can be a **progressive disclosure** of the workspace, so the UX feels innovative and "grown from conversation" rather than a static grid.

### 4.5 Real-time events for creation

- **Gap:** Today we rely on **proposal completion** and **tRPC invalidation** after mutations. We may not have **targeted real-time events** for "view created", "profile created", "entity created" that the frontend can subscribe to for instant sidebar/panel updates.
- **Desired:**  
  - Prefer **socket or SSE events** (e.g. `workspace:view_created`, `workspace:profile_created`) so any client (chat, sidebar, panel) can react immediately.  
  - Fallback: aggressive **query invalidation** on approve/create (e.g. `views.list`, `profiles.list`, `entities.get`) so the sidebar and panels refetch and re-render.

---

## 5. Leveraging cell rendering

- **Central place:** `CellPanelHost` + `CellRendererIsolated` + `cellRegistry` resolve `cellKey` + `props` to the same component whether the cell is in the **side panel**, a **floating panel**, or (if we add it) **inline in a message**.
- **Use this for:**  
  1. **Consistency:** Entity, document, view, channel always render via the same cells.  
  2. **Inline previews (future):** A message could render e.g. `<CellRendererIsolated cellKey="view" props={{ viewId }} contextOverride={{ displayMode: "compact" }} />` so a new view appears as a small live preview in the thread; "Open in panel" would open the same cell in the side panel.  
  3. **Loading states:** Cells can expose a **loading/skeleton** state; the panel host can show it when the resource was just created and data is still loading.

---

## 6. Innovative, human UX directions

- **Progressive disclosure:** Start with chat; reveal sidebar and views as the agent creates them (with clear "new" and light animation).  
- **Unified panel model:** All secondary content (branch chat, entity, doc, view) opens in the **same** side panel with tabs — no separate "context panel" vs "cell panel" mental model. (Chat app’s own context panel is for when it’s **standalone**; in workspace, branch channels use the centralized panel.)  
- **Creation feedback:** When the agent creates something, combine: (1) inline card/chip in the message, (2) optional toast or subtle banner, (3) sidebar/panel update with a short highlight or animation.  
- **Futuristic but human:** Use motion sparingly (sidebar item appear, panel tab switch, skeleton → content), clear typography and spacing, and avoid clutter so the "agent is building the workspace" feels helpful, not overwhelming.

---

## 7. Promote-to-main flow: view as main, chat in side panel

This section captures the **key flow** where the AI-generated view takes over the main area and the chat moves to the side panel, with **dynamic main tabs** in the sidebar that can be closed or pinned.

### 7.1 Desired flow

1. **Chat as full view (default)**  
   Main content = AI chat. User opens entities, documents, or other resources in the **side panel** (existing cell panel tabs). No change to current behavior.

2. **AI generates a view (bento, grid, etc.)**  
   When the agent creates a view (e.g. via `create_view`), we want to:
   - **Promote that view to main** — Main content area switches to show that view full-screen (bento grid, table, etc.) so the user sees the result immediately.
   - **Move chat to the side panel** — The current channel opens as a **tab in the right-side panel**, so the user can still see the conversation and watch the AI add widgets or refine the view in real time (e.g. live updates on the bento grid while reading the thread).

3. **Main combo = dynamic tab in sidebar**  
   The newly promoted view is represented in the **sidebar** as a **temporary tab** (or "current main" entry):
   - **Not fixed by default** — If the user **closes** that tab, it disappears and the main content reverts (e.g. back to Intelligence / chat).
   - **Pin to keep** — The user can **activate the tab and pin it**, so it becomes a **persistent app/shortcut** in the sidebar (like "Bento: Dashboard 1" or a view shortcut). Once pinned, closing the main content doesn’t remove it from the sidebar; it stays as an app the user can reopen.

4. **URL and state**  
   So that deep links and back/forward work:
   - **State** should encode: (a) **main content** = either a fixed app (e.g. `intelligence`, `views`) or a **resource** (e.g. `viewId` for "this view is main").
   - When main = resource (view), we also need **side panel** state (e.g. channel id so the chat tab is open). URL should reflect this (e.g. `?app=view&view=uuid` or `?main=view:uuid&side=channel:uuid`).

### 7.2 Why this is the right model

- **Chat-first** — User starts in chat; the workspace grows from the conversation.
- **Showcase the output** — As soon as the AI creates a view, we put it in front (main) so the user sees the result, not just a card in the thread.
- **Context preserved** — Chat in the side panel keeps the thread visible and allows live feedback (e.g. "add a chart here") while viewing the bento.
- **Reversible** — Closing the view tab returns to chat-as-main; no permanent layout change unless the user pins.
- **Pinnable** — If the user likes the view, they can pin it so it becomes a first-class sidebar entry (same idea as "open in new tab" then "pin tab" in a browser).

### 7.3 What we need (state + UI)

| Concern | Current | Target |
|--------|---------|--------|
| **Main content** | Single `app` (e.g. `intelligence`, `views`) from open state; `viewId`/`chatThreadId` select within that app. | Support **main = resource**: e.g. `main = { type: "view", viewId }` or `main = { type: "channel", channelId }`. When set, main area renders that resource full-screen; sidebar shows it as a **dynamic tab**. |
| **Sidebar** | Fixed list of apps (canvas, data, views, intelligence, …). | Add **dynamic main tabs**: when main is a resource (view/channel), show a tab for it. **Close** → clear main resource, revert to previous main (e.g. intelligence). **Pin** → add to sidebar as persistent entry (or "Pinned views" / "Pinned chats"). |
| **Side panel** | Cell panel tabs (entity, document, ai-chat, view). | When we **promote view to main**, we **open the current channel** in the side panel (`openCellPanel("ai-chat", { channelId }, { placement: "side" })`) so chat stays visible. |
| **URL** | `app`, `view`, `chat`, etc. | Extend so **main resource** is encoded (e.g. `main=view:uuid` or `app=view&view=uuid`), and optionally **side** (e.g. `side=chat:channelId`). On load, apply: set main to that resource, open side panel tab for channel if needed. |
| **Agent trigger** | N/A | When the agent creates a view (or we detect "view created" from the stream), the frontend (or a small backend hook) calls **promoteViewToMain(viewId)** and **moveChatToSidePanel(activeChannelId)**. Alternatively, the agent could call a **promote_to_main**-style tool that the backend translates into the same state updates. |

### 7.4 Implementation notes

- **promoteViewToMain(viewId)** (or equivalent) should: (1) set open state so main = that view (new state shape or reuse `app: "views"` + `viewId` with a "full-screen view" mode), (2) ensure the right panel layout: main area = view content, side panel = open and includes the current chat tab. So we need either a dedicated "main resource" in open state or a convention like "when app is views and viewId is set and a flag `viewAsMain` is true, render view full-screen and show chat in side panel".
- **Sidebar dynamic tab** — The sidebar needs a **list of "main" items**: fixed apps + current resource tab(s). When main is a view, one of those items is "View: &lt;name&gt;" (or the view title). That item has: **Close** (revert main to previous), **Pin** (add to pinned list so it survives close). Pinned views could live in a "Pinned" section or as extra icons in the sidebar.
- **Browser + app** — Same behavior in both: dynamic main tab in sidebar, close → tab disappears, pin → stays as app. URL (in browser) should reflect state for shareability and back/forward.

This flow is the **core of the innovative UX** we want: chat-first, then the AI "moves forward" to showcase the view while keeping the conversation one click away in the side panel, with clear control (close vs pin) so the user stays in charge.

---

## 8. Recommended next steps (priority)

1. **Validate side panel integration**  
   - In workspace, trigger a branch and use "Open in panel" on the branch card.  
   - Confirm the channel opens as a new tab in the right-side cell panel and that "View branch" still works.

2. **Promote-to-main + dynamic main tab (Section 7)**  
   - Extend open state (or convention) so **main** can be a resource (view id, or channel id) and render that resource full-screen.  
   - When the AI creates a view, call **promoteViewToMain(viewId)** and **moveChatToSidePanel(activeChannelId)** (or equivalent).  
   - Add **dynamic main tab** in the sidebar for the current resource when it’s not a fixed app; **Close** → revert main, **Pin** → add to sidebar as persistent entry.  
   - Ensure URL encodes this state for deep links and back/forward.

3. **Sidebar reactivity (views/profiles)**  
   - Ensure `views.list` / `profiles.list` (or equivalent) are invalidated when the agent creates a view or profile.  
   - Add a short "new" or highlight state for recently created items in the sidebar (e.g. last 30s or driven by a flag from the creation response).

4. **Real-time or invalidation events**  
   - Prefer real-time events for view/profile/entity creation so the UI can update without a full refetch; if not available, document and use consistent invalidation after approve/create.

5. **Optional: chat-first layout**  
   - Design a layout mode that starts with only chat visible and shows the sidebar (and first view) when the agent creates the first view or when the user asks to "see the workspace".

6. **Optional: inline cell preview in messages**  
   - Experiment with rendering a compact cell (e.g. view or entity card) inside the message stream, with "Open in panel" for the full cell in the side panel.

This document should be updated as we implement each piece and as we add new agent capabilities or panel behaviors.

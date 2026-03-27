# AI UX — Four Points Validation & How to Fill the Gaps

**Purpose:** Validate understanding of your four points and define how we fill those gaps. This doc feeds into `AI_UX_IMPLEMENTATION_GAP.md` and implementation.

---

## 1. Personal AI: always a real thread (channelId), consolidate access

### Your point
- Personal AI today sometimes doesn’t use a channelId (e.g. send without channelId and backend resolves to personal). That’s inconsistent.
- We should **consolidate**: personal AI is **always a real thread** — a first-class channel with proper data (which agent: the user’s personal agent; who: the user).
- By default the user opens that personal thread, but it should be a **real channel** so we can list it, show agent type, and guarantee access the same way as any other thread.

### Current state (verified in code)
- **Backend:** Personal AI **does** have a channelId. `ensurePersonalChannel(userId, workspaceId?)` creates/returns one channel per user (pod-wide), `agentType: "personal"`, `metadata.isPersonal: true`. So the row exists.
- **Where it gets fuzzy:** When the user sends a message **without** a channelId, the backend routes to that personal channel and returns its id. So we have two entry paths:
  1. **Explicit:** Frontend calls `getPersonalChannel` → gets channelId → opens that channel and sends with that channelId.
  2. **Implicit:** Frontend sends with no channelId → backend calls `ensurePersonalChannel` and uses that channelId for the message.

So the **data** is already one channel per user. The gap is **UX consistency**: we should not rely on “send without channelId” as the primary way to “use personal AI”. We should **always** resolve to the personal channelId first (e.g. on app open or when opening “Ask AI”) and then always send **with** that channelId. That way:
- Personal thread always appears in the channel list (with clear “Personal” / agent label).
- Same access pattern as any other thread: select channel → send.
- We can show “user + personal agent” in the UI from channel data.

### How we fill the gap
- **Rule:** Every place that “opens personal AI” or “Ask AI” must first resolve the personal channel via `getPersonalChannel`, then open/send using that **channelId**. Remove or narrow the “send without channelId → backend picks personal” path to a fallback only (e.g. legacy or edge cases).
- **Channel list:** Always include the user’s personal channel in the list (e.g. pinned or in a “Personal” section), with clear label and agent type so it’s obvious it’s “my personal AI thread”.
- **Docs/contract:** Document that “personal AI” = the single channel with `metadata.isPersonal === true` for that user; all clients must use that channelId for personal AI traffic. Update `AI_UX_IMPLEMENTATION_GAP.md` (e.g. G9 / personal consolidation).

---

## 2. Personality switcher: clearer UX, reuse in channel list and elsewhere

### Your point
- There is already a floating panel when opening the chip in the channel header to switch personalities, but it’s **not fully understandable**.
- You want the same capability **in other places**, e.g. in the **channel list** (e.g. “Open with this personality” or “New channel with [personality]” from the list).

### Current state (verified)
- **PersonalityHeaderChip** (ChatApp header): opens a popover with (1) **Switch specialisation** → creates a **branch** with that agentType, (2) **Edit custom personality** → per-channel overlay (name, personality, instructions). So “switch” = new branch; “edit” = overlay on current channel.
- Confusion: “Switch” creates a branch, which is not the same as “use this personality in this thread” or “open a new main thread with this agent”. So the mental model (branch vs overlay vs new thread) is mixed.

### How we fill the gap
- **Clarify the chip UX:** In the header chip popover, separate and label clearly:
  - **“New thread with [Agent]”** — create a new main thread (channel) with that agentType and open it (no branch).
  - **“Branch with [Agent]”** — create a branch from current message/channel (current behavior).
  - **“Edit personality for this thread”** — custom name/instructions overlay (current “personality” tab).
- **Reuse the same picker elsewhere:** Use the same agent/specialisation list (and same actions) in:
  - **Channel list:** e.g. on “New” or per-channel row: “Open with…” / “New thread with [Agent]” using the same component or a shared “PersonalityPicker” that can trigger “new thread”, “branch”, or “edit overlay”.
- **Single component:** Extract a reusable **Agent/Personality picker** (list of specialisations + optional custom overlay editor) used by (a) header chip, (b) channel list “New” / row actions. The picker emits an action: `newThread(agentType)`, `createBranch(agentType)`, or `editOverlay(config)`.

---

## 3. One reusable channel list, filter by type(s)

### Your point
- There are **multiple** ways we show channel lists; we should **consolidate** into **one reusable component**.
- Default: show **all** channels.
- The component should be able to **vary design and list** based on **filter** — e.g. filter **out** one or more channel types, or filter **in** only certain types.

### Current state (verified)
- **ChannelList** (`@synap/channels`): single list, uses `listChannels`, has `ChannelTypeFilter` tabs (all, ai_thread, comments, direct, external, a2ai), supports `channelTypes` prop to restrict without showing filter chips.
- **ChatThreadTabs**: flat list of threads (from same `listChannels`), no sections, “New thread” button.
- **ThreadTree**: tree of threads (with branches), used in ThreadsPanel and elsewhere.
- **ChannelsApp (browser):** sectioned list (Threads, Comments, Direct, Group, External, Agents), each section has its own list and “+” where applicable; uses `listChannels` then groups by section.
- **IntelligenceRecentChatsWidget**, **ChannelFeedSettings**, **ChannelViewSettings**, **ChannelsListAdapter**, **ChannelNavigatorCell**, **ConversationListPanel**, **BranchTreeAdapter**: various uses of `listChannels` with different layouts.

So we have one **data** source (`listChannels`) but **multiple list UIs**: ChannelList (with filter tabs), ChatThreadTabs (tabs bar), ThreadTree (tree), browser SECTIONS (grouped). No single “one list component, pluggable filter and layout”.

### How we fill the gap
- **Single source of truth list component:** Extend or introduce a **unified ChannelList** (or rename to avoid confusion) that:
  - Takes **filter** as props: e.g. `includeTypes?: ChannelType[]` and/or `excludeTypes?: ChannelType[]`. Default: include all (no filter).
  - Optionally **sections** (e.g. Personal, Threads, Branches, Comments, …) as a prop (section config: key, label, filter, canCreate).
  - **Single** `listChannels` call (or one per section if we want section-specific limits); filtering/sectioning is client-side from that data.
- **Consume everywhere:** ChatWorkspace (tabs or sidebar), ChannelsApp, ThreadsPanel, ConversationListPanel, widgets, etc. use this component with different filter/section/layout props.
- **Layout variants:** Same component can render as: vertical list (sidebar), horizontal tabs (ChatThreadTabs style), tree (ThreadTree), or sectioned groups (browser). So “one component” = one API and one data flow; “design and list” vary via props (layout mode, sections, filter).

---

## 4. Distinguish “AI called sub-agent” vs “AI spawned a thread you can use”

### Your point
- We do show something when the AI creates a branch (e.g. BranchResultCard), but we need to **clearly distinguish**:
  - **AI called a sub-agent for a specific task** (internal delegation) — user doesn’t get a new thread to open; maybe we show “Used X for this” but no “View branch”.
  - **AI spawned a new agent/thread that the user can use** — a real new thread the user can open and continue in (show “View branch” / BranchResultCard).

### Current state (verified)
- **IS:** `dispatch_agent` has three modes: **ephemeral** (inline, no channel created, no branch card), **parallel** (creates DB branch channel, user can open it), **deliberate** (A2A critique).
- When a **branch is created** (parallel or `create_branch`), the IS can post a system message with `metadata.type === "branch_result"` and `childThreadId`, which the frontend renders as **BranchResultCard** with “View branch” / “Open in panel”.
- For **ephemeral** dispatch, no such message (or no childThreadId); the user only sees the orchestrator’s synthesized response and possibly an AI step like “Dispatched to Knowledge Search”.

So the **backend/IS** already distinguishes “no user-visible branch” (ephemeral) vs “user-visible branch” (parallel/create_branch). The **frontend** shows BranchResultCard only when there is a `branch_result` message with `childThreadId`. What’s missing is making the **two cases obvious** in the UI:
- **Sub-agent (ephemeral):** e.g. in AI steps, show “Used [Agent] for this” (or similar) and **no** “View branch” — so it’s clear the AI used help internally.
- **Spawned thread (parallel/create_branch):** keep BranchResultCard but optionally label it more clearly as “New thread you can open” / “Conversation with [Agent]” so it’s obvious the user can go there and continue.

### How we fill the gap
- **Keep current rule:** Only show BranchResultCard when we have a user-openable branch (message has `branch_result` and `childThreadId`). Do **not** show “View branch” for ephemeral dispatches.
- **AI steps (ephemeral):** In AIStepsPanel (or equivalent), when the step is “Dispatched to X”, show a short, clear label like “Used [Agent name] for this” (no link to a thread). So the user sees that the AI used a sub-agent without creating a new conversation.
- **Branch result card (parallel/create_branch):** Optionally add a short line of copy that makes the distinction explicit, e.g. “New conversation with [Agent] — you can open it and continue there” and keep “View branch” / “Open in panel” as primary actions.
- **Docs:** In AGENT_SYSTEM or frontend docs, state that “sub-agent call” (ephemeral) = no branch card; “spawned thread” (parallel/create_branch) = BranchResultCard with “View branch”. Update gap doc (G4 / delegation transparency) to reference this distinction.

---

## Summary: validated understanding

| # | Your point | Our understanding | How we fill the gap |
|---|------------|-------------------|---------------------|
| 1 | Personal AI should be a real thread; consolidate; ensure user always accesses it as a channel | Personal already is one channel; we should stop relying on “no channelId” and always resolve personal channelId first, list it, and send with it | Always resolve `getPersonalChannel` before “Ask AI” / default; list personal in channel list; document rule; narrow “no channelId” to fallback |
| 2 | Personality switcher exists but is confusing; reuse it in channel list and elsewhere | Header chip mixes “branch” and “overlay”; need clearer labels and same picker in list | Clarify chip: “New thread with”, “Branch with”, “Edit overlay”; extract reusable picker; use it in channel list “New” / row actions |
| 3 | Multiple channel list UIs → one reusable component; filter in/out by type | Many places use listChannels with different layouts (ChannelList, ChatThreadTabs, ThreadTree, browser sections) | One unified list component with filter (include/exclude types) and optional sections/layout; use it everywhere with different props |
| 4 | Distinguish “AI called sub-agent” vs “AI spawned thread you can use” | IS already has ephemeral vs parallel; frontend shows BranchResultCard only for real branches | Keep BranchResultCard for real branches only; in AI steps show “Used X for this” for ephemeral; optional copy on card: “New conversation you can open” |

---

## Next step

- Fold these four into **AI_UX_IMPLEMENTATION_GAP.md** as concrete tasks (or a new “Phase 0” / “Consolidation” section) and implement in this order: (1) personal-always-channelId and list personal, (2) reusable channel list + filter, (3) personality picker reuse + chip clarity, (4) sub-agent vs spawned-thread UI copy and steps.

If this matches what you meant, we can add a short “Phase 0” section to the gap doc and break these into tickets.

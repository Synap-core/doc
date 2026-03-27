# AI UX Implementation Gap — From Current System to Target

**Purpose:** Concrete gap analysis and task list to move from the current implementation to the target UX described in `AI_UX_AND_CHANNEL_DESIGN_BRAINSTORM.md` (two modes of AI use, user-created personalities, channel-centric Slack-like experience).

**References:**
- Vision & validation checklist: `docs/AI_UX_AND_CHANNEL_DESIGN_BRAINSTORM.md`
- **Four points validation (personal thread, personality switcher, channel list, sub-agent vs branch):** `docs/AI_UX_FOUR_POINTS_VALIDATION.md`
- Backend channel/agent flow: `synap-backend/docs/CHANNEL_AGENT_FLOW.md`
- Agent system (IS): `synap-intelligence-service/docs/AGENT_SYSTEM.md`
- Agent model: `docs/AGENT_MODEL.md`

---

## Phase 0 — Consolidation (four points)

**Progress:** 0.1 ✅, 0.2 (pending), 0.3 ✅, 0.4 partial (sidebar ✅; AI steps / card copy pending).

- **0.1 Done:** Personal AI always uses a real channelId: `getPersonalChannel` used before Ask AI / default; personal channel in list; ChannelsApp and ChatWorkspace "New thread" open personal; no `__new_thread__`; ChatApp receives `hasExternalChannelList` when embedded so floating threads panel is hidden.
- **0.3 Done:** Single reusable channel list = `ChannelsSidebar` in `@synap/channels`: sectioned (Personal, Threads, Comments, Direct, Group, External, Agents), `includeTypes`/`excludeTypes`, `onCreateInSection`. Used by ChannelsApp (browser) and ChatWorkspace (web); old ChannelsApp inline sidebar removed.
- **0.4 Sidebar done:** When a channel is opened in ChannelsApp, the main sidebar is the only list — ChatApp is given `hasExternalChannelList={true}` so the floating "All threads" panel is not shown.

Before Phase 1, address the four validated points in `AI_UX_FOUR_POINTS_VALIDATION.md`:

| # | Goal | Tasks |
|---|------|--------|
| **0.1** | **Personal AI = always a real thread (channelId)** | All "Ask AI" / default open resolve `getPersonalChannel` first; send always with that channelId. Include personal channel in channel list (pinned / "Personal" section). Document rule; treat "send without channelId" as fallback only. |
| **0.2** | **Personality switcher: clear UX + reuse** | In header chip: separate "New thread with [Agent]", "Branch with [Agent]", "Edit personality for this thread". Extract reusable Agent/Personality picker; use it in channel list "New" and row actions. |
| **0.3** | **One reusable channel list + filter** | Single list component with `includeTypes` / `excludeTypes` (default: all). Optional sections (Personal, Threads, Branches, …). Use in ChatWorkspace, ChannelsApp, ThreadsPanel, widgets with different filter/section/layout props. |
| **0.4** | **Sub-agent vs spawned thread in UI** | Only show BranchResultCard for user-openable branches (parallel / create_branch). For ephemeral dispatch: in AI steps show "Used [Agent] for this" (no "View branch"). Optional: on BranchResultCard add copy "New conversation you can open". |

---

## 1. Current State Summary

### 1.1 Backend (Data Pod)

| Area | Current state |
|------|----------------|
| **Channels** | `channels` table: `channelType` (AI_THREAD, BRANCH, DIRECT, …), `agentType` (free string), `agentConfig` (JSONB). `listChannels` by workspace + optional type; personal channel pod-wide via `metadata.isPersonal`. |
| **Personal channel** | `ensurePersonalChannel(userId, workspaceId?)` — one per user pod-wide, `agentType: "personal"`. Created on first `getPersonalChannel` or when sending without `channelId`. |
| **createChannel** | Accepts `parentChannelId`, `agentType`, `agentConfig`. No parent → new AI_THREAD (defaults to meta). Used for branches and explicit new threads; **not** used by "New thread" in web UI today. |
| **sendMessage** | When `channelId` omitted: routes to **personal channel** (ensurePersonalChannel). No path to "create new workspace thread with chosen agentType" from a single send. |
| **agentConfig (channel)** | JSONB on channel: `name`, `personality`, `instructions`. Merged with workspace `settings.agentPersonality` before sending to IS. |
| **agent_configs table** | Per user/workspace/agentType: `promptAppend`, `extraToolIds`, `disabledToolIds`, `maxStepsOverride`, `modelOverride`. Stored in pod; **not** sent to IS in chat request (IS uses its own DB for user config today). |

### 1.2 Intelligence Service

| Area | Current state |
|------|----------------|
| **Agent registry** | `getAgentForType(agentType)` — meta/orchestrator, personal, persona:cto, persona:marketing, etc., specialists. Unknown → Orchestrator. |
| **Channel agentConfig** | Applied in BaseAgent: `name`, `personality`, `instructions` injected into system prompt. No tool allowlist in channel overlay yet. |
| **User config** | Loaded via `agentDefinitionService.getUserConfig(userId, agentType)` from **IS local DB** (promptAppend, extraToolIds, disabledToolIds, maxStepsOverride). Order: userConfig → instruction skills → system skills → **agentConfig** (channel) → activePersonality (personal only). |
| **Tool filtering** | User config can add/disable tools. Channel `agentConfig` does not restrict tools. |

### 1.3 Frontend (Web + Browser)

| Area | Current state |
|------|----------------|
| **Channel list (web)** | ChatWorkspace: `listChannels` (limit 50), flat list in ChatThreadTabs. No sections, no "New channel with [AI]". |
| **New thread (web)** | "New thread" sets `pendingChannelId` (ephemeral). First send → `sendMessage` without channelId → backend returns **personal channel** → `onChannelCreated`. So "New thread" currently opens personal channel, not a new workspace thread. |
| **Create workspace thread** | Only via **branch**: `createBranch(purpose, agentType)` on an existing channel. No UI to create a **new** AI_THREAD with a chosen agentType (e.g. "Start conversation with CTO") without branching. |
| **Browser ChannelsApp** | Sectioned sidebar: Threads, Comments, Direct, Group, External, Agents. "New" in Threads creates thread (default agent). No "New channel with [AI name]" picker. |
| **Agent picker** | Exists for **branch** (e.g. ChatApp PersonalityHeaderChip, create branch with agent). Not used for "new main thread with this AI". |
| **Command palette** | Ask AI / Create note open side panel (fixed). No "Open channel with Content AI" style command that creates/opens a specific agent channel. |

---

## 2. Gaps (What’s Missing for Target UX)

### 2.1 Product & UX

| Gap | Description | Priority |
|-----|-------------|----------|
| **G1. Two clear entry modes** | "Personal AI" (delegate) vs "Talk to [specific AI]" (explicit) are not clearly separated in entry points. Ask AI currently goes to personal/side panel; no one-click "Start chat with CTO" that opens a dedicated channel. | P1 |
| **G2. New workspace thread with chosen AI** | Today, new workspace AI threads are only created implicitly (send without channelId → personal) or via branch. Need: "New channel with [AI]" that creates an AI_THREAD with chosen `agentType` (and optional `agentConfig`) and opens it. | P1 |
| **G3. Channel list as home** | List is flat (or sectioned in browser only). No Slack-style sections like "Personal", "By capability", "Branches"; no prominent "New channel" with AI picker. | P1 |
| **G4. Delegation transparency** | When Personal/Orchestrator hands off to a specialist, user does not see "Switched to Content AI" — acceptable for v1; can be a later enhancement. | P2 |

### 2.2 User-Created Personalities (Override)

| Gap | Description | Priority |
|-----|-------------|----------|
| **G5. First-class personality entity** | No reusable "personality" template in the pod. Channel `agentConfig` is per-channel only. Target: user can create a named personality (name, instructions, tool allowlist, protocol hints) and apply it to any channel or "new channel with this personality". | P1 |
| **G6. Schema & validation** | No shared schema for "personality override" (length limits, allowed tool names, sanitization). Backend should validate and store; IS should receive via existing or extended contract. | P1 |
| **G7. Contract for IS** | No formal document that defines: channel `agentConfig` + optional `personalityOverrideId` (or inline override), tool allowlist semantics, precedence order. Any IS implementation should be able to honor user personalities. | P1 |
| **G8. agentConfig tool allowlist** | Channel/personality overlay cannot restrict tools today; only add (via user config). Allowlist/denylist in `agentConfig` would let "Content AI" expose only a subset. | P2 |

### 2.3 Backend

| Gap | Description | Priority |
|-----|-------------|----------|
| **G9. Create new thread from sendMessage** | When the frontend wants "new workspace thread with this agentType", it must call `createChannel` first then send. Alternatively, extend `sendMessage` to accept optional `agentType` (and optional `agentConfig`) when `channelId` is omitted, and create a new AI_THREAD instead of routing to personal. Keeps one round-trip. | P1 |
| **G10. Personality templates storage** | New table or JSONB in workspace: `personality_templates` (id, workspaceId, userId, name, instructions, personality, toolAllowlist?, protocolHints?). CRUD and "apply to channel" / "create channel with this personality". | P1 |
| **G11. User config source of truth** | Backend `agent_configs` exists but is not passed to the IS. IS uses its own DB. Unify: Backend sends user overrides (promptAppend, extraToolIds, etc.) in the chat request or via Hub so one source of truth (pod). | P2 |
| **G12. Rights on "see all PMs"** | Not implemented. Clarify requirement (workspace admin? pod admin?) and add if needed. | P3 |

### 2.4 Intelligence Service

| Gap | Description | Priority |
|-----|-------------|----------|
| **G13. Apply personality override** | If Backend sends `personalityOverride` (or resolved inline config) in the request, IS should apply it: merge into system prompt, apply tool allowlist. Precedence: base agent → userConfig → channel agentConfig → personality override (or document a different order). | P1 |
| **G14. Tool allowlist in overlay** | BaseAgent currently applies agentConfig only to prompt. Add optional `toolAllowlist` / `toolDenylist` in context.agentConfig and filter `effectiveToolNames`. | P2 |
| **G15. Contract doc** | Write `PERSONALITY_OVERRIDE_CONTRACT.md` (or section in AGENT_SYSTEM): request shape, precedence, tool semantics, versioning. | P1 |

### 2.5 Frontend

| Gap | Description | Priority |
|-----|-------------|----------|
| **G16. "New channel with [AI]"** | In channel list (web + browser): "New channel" opens a picker (personas + specialists + "Personal"). On choose: `createChannel({ agentType, agentConfig? })` then open that channel. Optionally support "personality template" from G10. | P1 |
| **G17. Channel list sections** | Web: add sections (e.g. Personal, Threads, Branches) and optional "By capability" grouping. Reuse or align with browser’s existing SECTIONS. | P1 |
| **G18. Command palette: "Open / Start with [AI]"** | New commands: "Start chat with CTO", "Start chat with Content AI", etc. Create channel with that agentType and open in side panel or main. | P2 |
| **G19. Personality template UI** | Settings or workspace: create/edit personality templates (name, instructions, tool allowlist). Apply when creating channel or to existing channel. Depends on G10. | P2 |

---

## 3. Prioritized Task List

### Phase 0 — Consolidation (see `AI_UX_FOUR_POINTS_VALIDATION.md`)

- **0.1** Personal-always-channelId: resolve `getPersonalChannel` before Ask AI / default; list personal in channel list; narrow "send without channelId" to fallback.
- **0.2** Personality picker: clarify header chip ("New thread with", "Branch with", "Edit overlay"); extract reusable picker; use in channel list.
- **0.3** One channel list: unified component with include/exclude types and optional sections; use everywhere with different props.
- **0.4** Sub-agent vs branch: BranchResultCard only for real branches; AI steps "Used X for this" for ephemeral; optional card copy.

### Phase 1 — MVP: Explicit vs delegated + channel-centric list

1. **Backend: support new workspace thread with chosen agent**
   - **Option A:** Frontend calls `createChannel({ workspaceId, agentType?, agentConfig? })` (no parent) then `sendMessage({ channelId, content })`. Ensure createChannel without parent creates AI_THREAD with given agentType (already does).
   - **Option B:** Extend `sendMessage`: when `channelId` is omitted and `agentType` is provided (and not `"personal"`), create new AI_THREAD with that agentType and use it for the message. Return `channelId` as today.
   - **Recommendation:** Option A (two calls) is simpler and reuses existing createChannel; document that "new thread with AI" = createChannel + sendMessage. Option B reduces round-trips; implement if product prefers.

2. **Frontend (web): "New channel" with AI picker**
   - In ChatWorkspace / ChatThreadTabs: change "New thread" to open a modal or dropdown: list of agents (meta, persona:cto, persona:marketing, … from catalog or IS). On select: `createChannel({ workspaceId, agentType })` then set active channel and focus input.
   - Reuse existing agent catalog / useSpecialisations for the list.

3. **Frontend (web): Channel list sections**
   - Group channels: e.g. "Personal" (single channel or pin), "Threads" (workspace AI_THREADs), "Branches" (optional). Use existing `listChannels`; add client-side grouping by `metadata.isPersonal`, `parentChannelId`, or a dedicated field if needed.

4. **Frontend (browser): Align with web**
   - In ChannelsApp, "New" in Threads section: same "New channel with [AI]" picker. Create channel with chosen agentType and open it.

5. **Command palette: "Start chat with [AI]"**
   - Add commands (e.g. "Start chat with CTO", "Start chat with Content AI") that create channel with that agentType and open side panel (or main) with that channel. Depends on (1) and (2).

### Phase 2 — User personalities and contract

6. **Backend: Personality templates**
   - Design schema (e.g. `personality_templates`: id, workspaceId, userId, name, instructions, personality, toolAllowlist[], protocolHints). CRUD API. Validation (length, allowed tool names from known set).

7. **Backend + IS: Contract**
   - Document in `CHANNEL_AGENT_FLOW.md` or new `PERSONALITY_OVERRIDE_CONTRACT.md`: channel agentConfig shape; optional personalityTemplateId or inline override; precedence; tool allowlist. IS applies overlay and (if present) tool filter.

8. **IS: Apply personality override and tool allowlist**
   - In BaseAgent: if request contains personality override (inline or resolved from template), merge into system prompt. If overlay has toolAllowlist, restrict effectiveToolNames to that set (with validation against known tools).

9. **Frontend: Create channel with personality template**
   - When creating channel, allow "From template" and pass template id or resolved agentConfig. Personality template management UI (create/edit) in workspace settings.

### Phase 3 — Polish and scale

10. **User config source of truth**
    - Backend sends agent_configs (promptAppend, extraToolIds, etc.) to IS in chat request or via Hub endpoint. IS uses that instead of local DB for user overrides.

11. **Delegation transparency**
    - Optional: when Orchestrator delegates to a specialist, show "Using Content AI for this" in the thread (system message or step label).

12. **Rights: "See all PMs"**
    - If required, add permission and filter in listChannels / UI for workspace/pod admins.

---

## 4. Dependency Overview

```
G9 (create path) ──► G16 (New channel with AI picker) ──► G18 (palette "Start with AI")
G10 (personality templates) ──► G7 (contract) ──► G13 (IS apply) ──► G19 (template UI)
G17 (sections) independent
G5, G6, G8 (schema, allowlist) part of G10 + G13
```

---

## 5. Files to Touch (Summary)

| Layer | Files / areas |
|-------|----------------|
| Backend | `routers/channels.ts` (sendMessage optional agentType when no channelId; or document createChannel flow), new `personality_templates` schema + router |
| Backend | `CHANNEL_AGENT_FLOW.md` or `PERSONALITY_OVERRIDE_CONTRACT.md` |
| IS | `agents/base/agent.ts` (tool allowlist from agentConfig), `routes/chat-stream.ts` (accept override if passed), contract doc |
| Web frontend | `ChatWorkspace.tsx`, `ChatThreadTabs.tsx` (new thread = picker + createChannel), channel list grouping |
| Browser frontend | `ChannelsApp.tsx` (new thread picker), command palette provider ("Start with AI") |
| Shared | Agent catalog / specialisations (already used for branch picker; reuse for "new channel" picker) |

---

*This document should be updated as tasks are completed or priorities change. Link implementation PRs to the task numbers above.*

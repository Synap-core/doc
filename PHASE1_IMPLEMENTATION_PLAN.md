# Synap Phase 1 — Full Implementation Plan

**Version:** 1.0
**Date:** 2026-03-06
**Status:** Planning
**Reference doc:** `docs/AGENT_MODEL.md`, `Synap Phase 1 PRD.md`

---

## Audit Summary

Three parallel audits confirm **the system is substantially built**. The remaining work is:
1. Closing specific gaps (agent config storage, branch activation, session dividers)
2. Connecting existing parts that aren't wired together yet
3. Polishing UX (markdown, entity mentions, memory actions)

No new architectural overhauls needed.

---

## Phase 1A — Agent Data Model Hardening
**Goal**: Complete the data layer so agents can be fully configured and tracked
**Effort**: 2–3 days
**Layer**: Backend only

### A1. Users table — add missing agent fields

**File**: `synap-backend/packages/database/src/schema/users.ts`

Add to `agentMetadata` JSONB interface (no migration needed, JSONB):
```typescript
agentMetadata: {
  agentType: string;
  description?: string;
  createdByUserId: string;
  capabilities?: string[];
  // ADD:
  isPersonalAgent?: boolean;       // true = user-scoped personal agent (1:1 with user)
  parentAgentId?: string;          // set = personality expression of parent agent
  writesRequireProposal?: boolean; // default true; false = fully trusted agent
  activePersonality?: string;      // runtime, not persisted (ephemeral sessions only)
}
```

No SQL migration needed — JSONB column, backend interface update only.

**Backend files to update**:
- `packages/database/src/schema/users.ts` — update AgentMetadata interface
- `packages/api/src/utils/permission-check.ts` — read `writesRequireProposal` from agentMetadata when checking (currently hardcoded true)

### A2. Hub Protocol — Agent Config endpoints

**New hub-protocol sub-router**: `packages/api/src/routers/hub-protocol/agent-config.ts`

```typescript
// Two procedures:
agentConfig.get({ agentUserId }) → AgentPermissionConfig
agentConfig.update({ agentUserId, config: Partial<AgentPermissionConfig> }) → void
```

Where `AgentPermissionConfig` is:
```typescript
interface AgentPermissionConfig {
  writesRequireProposal: boolean;
  autoApproveFor: string[];
}
```

Storage: persist in `users.agentMetadata` (no new table needed).

**REST routes to add** in `hub-protocol-rest.ts`:
```
GET  /agent-config?agentUserId=
PATCH /agent-config
```

**Register in** `hub-protocol/index.ts`.

### A3. Hub Protocol — Workspace list endpoint

The intelligence service needs to discover which workspaces an agent operates in.

**New procedure** in existing `hub-protocol/` (add to context router or new workspaces router):
```
GET /workspaces?userId=  → WorkspaceListItem[]
GET /workspaces/:id      → WorkspaceDetail
```

These are thin wrappers over existing `workspaceRepo` calls with hub-protocol auth.

---

## Phase 1B — Session Memory Polish
**Goal**: Make session boundaries visible in the UI and connect the sessionId audit trail
**Effort**: 2–3 days
**Layer**: Intelligence Service + Frontend

### B1. Intelligence Service — sessionId in ToolContext

**File**: `synap-intelligence-service/apps/intelligence-hub/src/tools/base/tool.ts`

Add optional field:
```typescript
export interface ToolContext {
  // ... existing fields
  sessionId?: string;  // ADD: current session for audit trail
}
```

**File**: `apps/intelligence-hub/src/agents/base/agent.ts`

After `startOrContinueSession()` returns `sessionId`, pass it into the ToolContext object when creating tool wrappers.

**Impact**: Proposals created during a session can be linked to that session for replay.

### B2. Intelligence Service — wire activeBranches into bootstrap

**File**: `apps/intelligence-hub/src/agents/utils/context-manager.ts`

Before calling `assembleBootstrap()`, fetch active child threads for the current threadId:
```typescript
const activeBranches = await hubProtocol.getActiveBranches(context.threadId);
const bootstrapResult = await assembleBootstrap({ ..., activeBranches });
```

**Hub Protocol method needed**: `getActiveBranches(parentThreadId)` → list of channels with `parentChannelId = threadId` and `status = ACTIVE`. This likely already exists via `channels.listBranches` procedure.

**File**: `apps/intelligence-hub/src/services/bootstrap-assembler.ts`

The `assembleBootstrap()` method already accepts `activeBranches` param (line 103-108) — just needs to be called with it.

### B3. Frontend — Session dividers in chat

**Trigger**: The backend should include a special message OR the frontend can detect session boundaries from `message.sessionId` changes.

**Option A (preferred)**: Frontend-only detection. MessageList already has `getSessionId()` and `findCurrentSessionId()` infrastructure.

**Files to update**:
- `packages/core/chat-interface/src/components/MessageList.tsx`
  - Already has `CompactionBreak` component defined but not rendered
  - Add logic: when `getSessionId(msg) !== getSessionId(prevMsg)` and both are non-null, render `<CompactionBreak />` between them

This is a 20-line change in MessageList. No backend changes needed.

---

## Phase 1C — Branch Activation
**Goal**: Make dispatch_agent's child threads visible and create a real create_branch tool
**Effort**: 3–4 days
**Layer**: Intelligence Service + Backend + Frontend

### C1. Intelligence Service — Real create_branch tool

**File**: `synap-intelligence-service/apps/intelligence-hub/src/tools/registry.ts`

Replace the stub `create_branch` tool (lines 115-133) with a real implementation:
```typescript
// create_branch tool — replace stub with:
const result = await hubProtocol.createThread({
  parentThreadId: context.threadId,
  title: args.title,
  branchPurpose: args.purpose,
  agentType: args.agentType ?? 'default',
  workspaceId: context.workspaceId,
});
return { success: true, branchId: result.id, branchChannelId: result.id };
```

Register in `tool-registry.ts` `agentToolMap` for `meta` agent (already has dispatch_agent, should also have create_branch).

### C2. Intelligence Service — Branch message sync

**Problem**: `dispatch_agent` creates a child thread and posts the result to the parent thread as a system message. But the full sub-conversation is not visible from the parent.

**Fix**: After dispatch_agent completes (tools/actions/dispatch-agent.ts, line 128-137), in addition to posting a system message, also call:
```typescript
await hubProtocol.postBranchResult({
  parentThreadId: context.threadId,
  childThreadId: childThread.id,
  summary: agentResult.response,
  proposals: createdProposals,
});
```

This is a new hub-protocol call. Backend: store as `channels.resultSummary = summary` (column already exists from session memory migration).

### C3. Frontend — Child thread visibility in BranchesPanel

**Files**: `packages/apps/chat/src/floating/BranchesPanel.tsx`

Currently shows branches from `useBranches()` which uses `trpc.chat.listBranches`. Verify this includes:
- Branches created by `dispatch_agent` (child threads with `parentChannelId`)
- Both active and completed branches

The `useBranches` hook in `packages/core/channels/src/hooks/useBranches.ts` should already handle this — just verify the backend `channels.listBranches` query includes all child threads.

### C4. Compaction — Branch results in memory

**File**: `synap-intelligence-service/apps/intelligence-hub/src/services/compaction-engine.ts`

Currently filters messages to `role in ["user", "assistant"]` (line 85).

Add handling for `role = "system"` messages that contain branch results:
```typescript
// In message filtering, include system messages tagged as branch_result:
const relevantMessages = messages.filter(msg =>
  ['user', 'assistant'].includes(msg.role) ||
  (msg.role === 'system' && msg.metadata?.type === 'branch_result')
);
```

The `entityContextBlock` or `continuityBlock` compaction prompts should be updated to extract branch outcomes into the state.

---

## Phase 1D — Personality System
**Goal**: Wire personality selection UI so users can switch modes
**Effort**: 2–3 days
**Layer**: Frontend + Intelligence Service

### D1. Intelligence Service — Personality in AgentContext

**File**: `synap-intelligence-service/apps/intelligence-hub/src/routes/chat-stream.ts`

Add optional `personality` param to the chat-stream request:
```typescript
// chat-stream request body:
personality?: string;  // e.g. "cto", "marketing", "sales", "project-manager"
```

In agent.ts, if `personality` is provided and agent type is `default` (personal agent):
- Route to `persona:${personality}` agent type OR
- Apply a personality overlay (system prompt merge) on top of the default agent

The persona-agent.ts infrastructure already supports `persona:cto`, `persona:marketing` etc. via agent-registry.ts.

### D2. Frontend — Personality selector in ChatApp

**File**: `packages/apps/chat/src/ChatApp.tsx`

The `AgentSelector` component already exists in ai-chat (`packages/features/ai-chat/src/components/AgentSelector.tsx`).

Connect it to personality switching:
1. `AgentSelector` dropdown shows built-in personalities (CTO, Marketing, Sales, PM) + custom
2. Selected personality stored in local state (not persisted — ephemeral per session)
3. Passed to `useSendMessage` → included in the chat-stream request as `personality`

**Data flow**:
```
ChatApp: personalityState → AgentSelector UI
useSendMessage: include personality in request body
chat-stream route: routes to persona:${personality} agent
```

---

## Phase 1E — Frontend UX Polish
**Goal**: Markdown rendering, entity mentions, memory actions
**Effort**: 3–4 days
**Layer**: Frontend only

### E1. Markdown rendering in MessageContent

**File**: `packages/core/chat-interface/src/components/MessageContent.tsx`

Currently plain text. Wire up markdown rendering. Options:
- Use existing `@tiptap/react` (already in the stack) read-only mode
- Or `react-markdown` (lighter for display-only)

The `format` prop already exists on MessageContent (not implemented). Just wire the rendering.

**Priority**: High — AI responses with code blocks, lists, and headers are unreadable as plain text.

### E2. Entity @mention rendering in messages

**File**: `packages/core/chat-interface/src/components/MessageContent.tsx`

When rendering message content, scan for patterns like `[Entity Name](entity:uuid)` or `@[Entity Name]` and render as styled clickable links that open the entity panel.

**Backend requirement**: AI messages need to include entity references in a standard format. Add to intelligence hub system prompt instructions: "When referencing entities, use the format `[Name](entity:id)`."

### E3. Per-message memory actions

**File**: `packages/core/chat-interface/src/components/MessageActions.tsx`

Add two actions to AI message actions bar:
- **Remember this** — saves the message content as a memory fact via `remember_fact` tool equivalent API call
- **Forget this** — removes related memory facts (needs hub-protocol endpoint)

**Backend**: New hub-protocol endpoint `POST /memory/remember` accepting `{ content, sourceMessageId }`.

**Intelligence Service**: `remember_fact` tool already exists — expose as REST endpoint.

### E4. CompactionBreak integration (session dividers)

Already covered in B3 above. Estimate: included in B3 effort.

---

## Phase 1F — Agent Workspace (Optional Staging)
**Goal**: Allow agents to operate in a dedicated workspace with direct writes
**Effort**: 2–3 days
**Layer**: Backend + Intelligence Service

### F1. Agent workspace creation flow

Per `AGENT_MODEL.md`, agent workspace is optional but supported. When enabled:

**Intelligence Service** (`apps/intelligence-hub/src/services/`): Create `workspace-manager.ts`:
```typescript
// ensureAgentWorkspace(agentUserId, ownerUserId) → workspaceId
// 1. Check if agent already has a workspace (workspace.settings.linkedAgentId = agentUserId)
// 2. If not: call hub-protocol to create workspace with type="agent"
// 3. Add agent as owner member of that workspace
// 4. Return workspaceId
```

**Hub Protocol**: Workspace creation already exists (`workspaces.create` tRPC). Verify it accepts `workspaceType` and `linkedAgentId` in settings.

### F2. ToolContext workspace routing

**File**: `synap-intelligence-service/apps/intelligence-hub/src/tools/base/tool.ts`

Add optional fields:
```typescript
agentWorkspaceId?: string;    // agent's dedicated workspace (direct writes)
personalWorkspaceId?: string; // user's personal workspace (proposal required)
```

In `create_entity` and other write tools: if `agentWorkspaceId` is set and `context.workspaceId === agentWorkspaceId`, skip proposal path (write directly). Otherwise, normal governance.

### F3. Frontend — Agent workspace panel (deferred to Phase 2)

Per PRD: the agent workspace panel is "nice to have" for Phase 1. The UX for configuring agent workspaces belongs in the Agent settings in IntelligenceStudio. **Defer to Phase 2**.

---

## Phase 1G — OpenClaw / External Agent Integration
**Goal**: Allow external agents to connect via Hub Protocol
**Effort**: 3–5 days
**Layer**: Backend + Frontend

### G1. External agent registration

**Hub Protocol existing infrastructure**: `hub-protocol/channels.ts` has `createExternalChannel` and A2AI messaging already.

**What's needed**:
- Endpoint to register an external agent (creates agent user + issues API key)
- Endpoint to receive messages FROM external agent
- Frontend: ConnectionsTab "Add external agent" flow

### G2. A2AI channel type

Channel type `a2ai` needs to be added to the `channel_type` enum.

**File**: `synap-backend/packages/database/src/schema/channels.ts`

Add `a2ai` to the ChannelType enum. This enables async agent-to-agent communication without direct workspace sharing.

### G3. OpenClaw SKILL.md

Create `synap-os` SKILL.md at the root of the intelligence hub that teaches OpenClaw:
- Hub Protocol API endpoints and auth
- Governance rules (proposals)
- A2AI channel format for communication

**File**: `synap-intelligence-service/apps/intelligence-hub/SYNAP_OS.md`

---

## Phased Timeline

```
Week 1:
  Phase 1A (Agent Data Model) ───────────────── 2-3 days
  Phase 1B (Session Memory Polish) ─────────── 2-3 days (parallel)

Week 2:
  Phase 1C (Branch Activation) ──────────────── 3-4 days
  Phase 1D (Personality System) ─────────────── 2-3 days (parallel)

Week 3:
  Phase 1E (Frontend UX Polish) ─────────────── 3-4 days
  Phase 1F (Agent Workspace) ────────────────── 2-3 days (parallel)

Week 4:
  Phase 1G (External Agents / OpenClaw) ──────── 3-5 days
  Integration testing + hardening ─────────────── 2-3 days
```

---

## What to Build vs. What's Already Done

### Already built, needs wiring only:
- ✅ `activeBranches` param in bootstrap-assembler.ts — just call with live data
- ✅ `CompactionBreak` component in MessageList — just enable the condition
- ✅ `PersonaAgent` / persona routing — just expose as request param
- ✅ `AgentSelector` component — just connect to personality state + request

### Already built, needs one missing piece:
- ✅ dispatch_agent (sync sub-agent) — needs branch result posted to hub protocol
- ✅ BranchesPanel — needs `dispatch_agent` branches to show up (verify query)
- ✅ Session Manager — needs sessionId forwarded to ToolContext
- ✅ Agent user model — needs `isPersonalAgent`/`parentAgentId`/`writesRequireProposal` added to JSONB interface

### Net new code needed:
- `hub-protocol/agent-config.ts` sub-router (≈80 lines)
- `workspace-manager.ts` in intelligence service (≈120 lines)
- Markdown rendering in MessageContent (≈30 lines change)
- `a2ai` channel type enum addition (5 lines)
- Per-message memory actions (≈60 lines in MessageActions)
- SYNAP_OS.md skill file (documentation, not code)

---

## Priority Order (launch-critical first)

**P0 — Must have before any agent runs in production:**
1. Phase 1A2 — Agent config endpoint (agents need `writesRequireProposal` to be configurable)
2. Phase 1B3 — Session dividers (user experience for memory boundaries)
3. Phase 1E1 — Markdown rendering (AI responses are unreadable without it)

**P1 — Core agent experience:**
4. Phase 1B2 — Wire activeBranches into bootstrap
5. Phase 1C1 — Real create_branch tool
6. Phase 1D — Personality system (selector UI + request param)
7. Phase 1B1 — sessionId in ToolContext

**P2 — Polish and multi-agent:**
8. Phase 1C2 — Branch message sync
9. Phase 1E2 — Entity @mention rendering
10. Phase 1E3 — Per-message memory actions
11. Phase 1F — Agent workspace
12. Phase 1G — External agent / OpenClaw

---

## Key Files Reference

### Backend
| File | Phase | Change |
|------|-------|--------|
| `packages/database/src/schema/users.ts` | 1A | Add isPersonalAgent, parentAgentId, writesRequireProposal to AgentMetadata |
| `packages/api/src/utils/permission-check.ts` | 1A | Read writesRequireProposal from agentMetadata |
| `packages/api/src/routers/hub-protocol/agent-config.ts` | 1A | NEW — get/update agent config |
| `packages/api/src/routers/hub-protocol/index.ts` | 1A | Register agent-config sub-router |
| `packages/api/src/routers/hub-protocol-rest.ts` | 1A | Add GET/PATCH /agent-config REST endpoints |
| `packages/database/src/schema/channels.ts` | 1G | Add a2ai to channel_type enum |

### Intelligence Service
| File | Phase | Change |
|------|-------|--------|
| `src/tools/base/tool.ts` | 1B | Add sessionId to ToolContext |
| `src/agents/base/agent.ts` | 1B | Forward sessionId to ToolContext; pass activeBranches to assembleBootstrap |
| `src/agents/utils/context-manager.ts` | 1B | Fetch active branches before assembleBootstrap |
| `src/tools/registry.ts` | 1C | Replace stub create_branch with real hub-protocol call |
| `src/tools/tool-registry.ts` | 1C | Add create_branch to meta agent tool list |
| `src/tools/actions/dispatch-agent.ts` | 1C | Post branch result to hub-protocol on completion |
| `src/routes/chat-stream.ts` | 1D | Add `personality` param to request schema |
| `src/services/compaction-engine.ts` | 1C | Include system branch_result messages in compaction |
| `src/services/workspace-manager.ts` | 1F | NEW — ensureAgentWorkspace() |
| `SYNAP_OS.md` | 1G | NEW — OpenClaw integration skill |

### Frontend
| File | Phase | Change |
|------|-------|--------|
| `packages/core/chat-interface/src/components/MessageList.tsx` | 1B | Enable CompactionBreak rendering on session boundary |
| `packages/core/chat-interface/src/components/MessageContent.tsx` | 1E | Wire markdown rendering |
| `packages/core/chat-interface/src/components/MessageActions.tsx` | 1E | Add Remember/Forget actions |
| `packages/apps/chat/src/ChatApp.tsx` | 1D | Wire personality state → AgentSelector → useSendMessage |
| `packages/features/ai-chat/src/components/ChatView.tsx` | 1D | Accept personality prop, include in stream request |

---

*This plan is derived from: backend audit (a436bd0), intelligence service audit (ac8b935), frontend audit (a9c43c5), AGENT_MODEL.md, and Phase 1 PRD v1.1.*

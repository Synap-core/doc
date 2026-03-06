# Unified Channel Vision — Architectural Document

> **Status:** Proposal — pre-implementation
> **Date:** 2026-03-04
> **Authors:** Engineering

---

## 1. Executive Summary

Synap's current model requires users to explicitly create a new channel for every AI interaction. This creates friction, fragments history, and contradicts the product's core promise: an ambient AI that knows your workspace.

This document proposes moving to a **unified channel architecture** where:

1. Every user in a workspace has a **personal AI timeline** — a permanent channel auto-provisioned on join, requiring no creation step.
2. **Sub-channels** (already supported in the data model via `parentChannelId`) become first-class: users and agents can spawn focused channels for specific topics, projects, or tasks, all nested under the personal timeline.
3. **AI can respond in any channel type** — not just `ai_thread`. Entity comments, document reviews, and direct messages can invoke the AI inline.
4. The primary UI shifts from a "list of conversations" to a **structured timeline with branch markers** — a living document of the user's AI-assisted work in the workspace.

This is not a rewrite. The schema already supports it. The changes are in provisioning, routing, context management, and UI.

---

## 2. Current State Audit

### 2.1 Data Model (what exists today)

The `channels` table already has everything we need:

```
channels
├── id (UUID)
├── userId              — channel owner
├── workspaceId         — workspace scope
├── channelType         — ai_thread | branch | entity_comments | document_review | view_discussion | direct | external_import | a2ai
├── parentChannelId     — ✅ self-reference (branch hierarchy already exists!)
├── branchedFromMessageId
├── branchPurpose
├── agentType           — default | meta | prompting | knowledge-search | code | writing | action | ...
├── agentConfig (JSONB) — per-channel system prompt, tool overrides
├── contextSummary      — ✅ compressed summary field (exists but unused)
├── status              — active | merged | archived
├── contextObjectType   — entity | document | view (for linked context)
└── contextObjectId     — ID of the linked object
```

**Key findings:**
- `parentChannelId` exists — hierarchical channels are schema-ready.
- `contextSummary` field exists — designed for compressed history (unused today).
- No auto-provisioning of channels on workspace join exists anywhere.
- `workspaceId` can be null (legacy) but enforced non-null by `workspaceProcedure`.

### 2.2 AI Invocation — Current Trigger Logic

AI auto-responds **only** when a message is sent via `sendMessage` in an `ai_thread` channel. All other channel types (entity_comments, document_review, direct) receive the message but **do not trigger an AI response**.

```
sendMessage(channelId, content)
  ├── if channel.type === AI_THREAD → call Intelligence Hub (auto-response)
  └── else → store message only, no AI response
```

**Problem:** If a user types "@ai help me draft this" in an entity comment thread, nothing happens.

### 2.3 Context Sent to AI

The backend sends **only the current message** to the Intelligence Hub, plus the `threadId`. The hub is responsible for loading its own message history.

```typescript
{
  query: content,          // Just the user's message
  threadId: channelId,     // Hub loads history from this
  userId,
  agentType,
  workspaceId,
  mcpServers,
}
```

**Problem:** There is no backend-side context window management, no summarization, no smart selection. As a channel grows to thousands of messages, the hub receives the full raw history — or silently truncates it at the model's context limit.

### 2.4 Command Palette AI Flow

Today's flow:
```
User types query in command palette
  → setFocus("intelligence")
  → router.push("/workspace?q=<query>")
  → ChatView receives ?q param
  → sendMessage({ content: query, workspaceId }) — NO channelId
  → Backend creates a NEW ai_thread channel
  → Message stored in new channel
  → AI responds
```

**Problem:** Every command palette query creates a new channel. 30 quick AI queries = 30 orphan channels. History is fragmented and unusable.

### 2.5 Agent User Provisioning

`ensureAgentUser(userId, workspaceId)` is called on every `sendMessage`. It lazily creates an agent user (email: `agent-orchestrator-{id}@synap.agent`) as a workspace member. This is correct and remains unchanged.

---

## 3. The Vision

### 3.1 Core Concept: The Personal AI Timeline

Every user in a workspace has one permanent `ai_thread` channel, auto-provisioned when they join. This is their **personal AI timeline**.

- No creation step. It always exists.
- Every AI interaction lands here by default — command palette queries, inline questions, context-aware suggestions.
- It has a `title` (e.g., "Antoine's workspace") and a persistent `id`.
- It never gets archived automatically.

### 3.2 Sub-Channels: Hierarchical Focus

From the personal timeline, users (and the AI itself) can spawn **sub-channels** for focused work:

```
Personal Timeline (ai_thread, parentChannelId = null)
├── Sub-channel: "Q2 Strategy Research"  (parentChannelId = personal timeline)
├── Sub-channel: "Competitor Analysis"   (parentChannelId = personal timeline)
└── Sub-channel: "API Integration Help"  (parentChannelId = Q2 Strategy)
```

Sub-channels:
- Can be spawned from any message in the parent (AI decision, user action, or slash command).
- Can be **private** (only the owner) or **shared** (visible to workspace members).
- Can have their own `agentType` and `agentConfig` (specialized agents for specific tasks).
- When merged or archived, their key insights flow back into the parent's `contextSummary`.

This is different from the current `BRANCH` channel type, which is scoped to a single parent message and primarily for AI reasoning. Sub-channels are for **user-initiated, named, persistent focus areas**.

### 3.3 AI in Any Channel

The AI should respond in **any channel type** when explicitly mentioned or when channel settings allow it:

| Channel Type | AI Behavior |
|---|---|
| `ai_thread` (personal) | Always auto-responds |
| `ai_thread` (sub-channel) | Always auto-responds |
| `entity_comments` | Responds when @mentioned or channel has `agentType` set |
| `document_review` | Responds when @mentioned |
| `direct` | Responds when @mentioned or channel has AI enabled |
| `a2ai` | Responds always (agent-to-agent) |
| `external_import` | Responds via relay service |

The trigger condition changes from "channel type == AI_THREAD" to **"channel allows AI responses AND (message is in AI channel OR message contains @AI mention)"**.

### 3.4 The Timeline UI

The personal channel renders not as a flat message list but as a **structured timeline**:

```
TIMELINE
────────
Today
  ● 09:14 — "Who's overdue on tasks?"
  │   ↳ [AI response with task list]
  │
  ├─◆ 09:22 — Branch: "Deep dive on Alice's blockers"
  │   │   [AI conversation about Alice's tasks]
  │   └─ [Merged: summary injected into parent context]
  │
  ● 10:05 — "Draft Q2 update email"
      ↳ [AI response]
      ↳ [Document created: "Q2 Update"]

Yesterday
  ● 16:30 — "Summarise what happened this week"
  ...
```

Branch points appear as visual markers, not navigation destinations. The user can expand/collapse branches inline. The primary navigation is time, not channel switching.

### 3.5 Intelligence Service Decoupling

Currently, AI responses are tied to the `ai_thread` channel type. The vision decouples them:

- **Any channel can have an intelligence service assigned** via `agentConfig`.
- The intelligence service is not "for chat" — it's "for a workspace context". Channels, documents, entities, and views can all trigger AI responses.
- Third-party AI integration (OpenAI, Anthropic directly, local models) is possible via the existing `resolveIntelligenceService()` routing hierarchy — no changes needed to support this.
- **One-shot AI queries** (no expected continuation) are supported by a `oneShot: true` flag on the message, which marks the response as non-interactive in the timeline.

---

## 4. What We Build vs What We Change

### 4.1 What Already Exists (Keep)

| Component | Status |
|---|---|
| `parentChannelId` on channels table | ✅ Schema-ready |
| `contextSummary` field | ✅ Schema-ready (needs usage) |
| Agent user auto-provisioning | ✅ Works today |
| `resolveIntelligenceService()` routing | ✅ Workspace + user preference hierarchy |
| Channel `agentType` + `agentConfig` | ✅ Per-channel agent config |
| MCP server injection per workspace | ✅ Works today |

### 4.2 What We Add

| Component | Where | Effort |
|---|---|---|
| Personal channel auto-provisioning | Backend: workspace join hook | Small |
| `getPersonalChannel(userId, workspaceId)` | Backend: new tRPC query | Small |
| AI trigger: @mention in any channel | Backend: `sendMessage` handler | Medium |
| `oneShot` flag on messages | Backend: schema + handler | Small |
| Context window management (smart selection) | Backend/Hub boundary | Large |
| `contextSummary` population on branch merge | Backend: merge flow | Medium |
| Timeline view renderer | Frontend: new view mode | Large |
| Command palette → personal channel routing | Frontend: command palette | Small |
| Sub-channel creation UX | Frontend: new UI | Medium |

---

## 5. Impact Analysis

### 5.1 User Experience Impact

**What users gain:**

- **Zero friction for AI queries.** "Ask AI" in command palette has no channel creation delay. The response appears in the always-existing personal timeline.
- **Continuous memory.** "As we discussed earlier" actually works. AI has access to everything in the personal timeline, not just the current isolated conversation.
- **One place for AI history.** No searching through 50 titled conversations to find "that thing I asked last Thursday." The timeline is sorted by time, always.
- **Contextual AI anywhere.** Typing in an entity comment and mentioning @AI gets a relevant response, without leaving the entity.
- **Structured exploration.** Sub-channels for deep dives don't clutter the main timeline — they fold in as collapsible branches.

**What changes for users:**

- **No more "New Conversation" button as primary action.** Replaced by "New Branch" or natural continuation.
- **One timeline view is the default chat UX**, not a list of conversations. Requires learning a slightly different mental model (familiar from Notion docs, code changelogs).
- **@AI mention syntax** becomes the standard for invoking AI in non-AI channels. Consistent with what users expect from Slack/Discord.

### 5.2 Marketing Impact

**Positioning shift:**

Today: "AI chat for your workspace" (a chat app with AI).
After: "AI woven into every interaction in your workspace" (ambient intelligence).

This is a significant positioning upgrade. Key talking points:

- **"Your AI remembers everything"** — persistent timeline vs. forgotten conversations.
- **"AI everywhere"** — not siloed in a chat tab. Works in comments, documents, views.
- **"Your work, structured by AI"** — the timeline isn't just a chat log, it's a structured record of AI-assisted decisions.
- **Differentiator vs. ChatGPT/Claude.ai:** Those are isolated chat interfaces. Synap's AI lives in your workspace and knows your actual data (entities, documents, views) — not just what you paste into a prompt.
- **Enterprise angle:** Audit trail. Every AI interaction is timestamped, attributed, and linked to the workspace entities it referenced. Compliance-friendly by design.

### 5.3 Technical / Engineering Impact

**What gets simpler:**
- No "pending channel" hack needed (ephemeral UUID on frontend). Personal channel always exists.
- No channel creation on `sendMessage` for the common case. `sendMessage` becomes: find personal channel → add message → trigger AI.
- Fewer orphan channels in the database.
- Command palette routing becomes trivial: `getPersonalChannel()` → route to it.

**What gets harder:**
- **Context management.** A personal channel that has been active for 6 months has thousands of messages. The hub can't receive all of them. We need:
  1. Recent-N selection (last 50 messages always included).
  2. Semantic similarity selection (embed query, retrieve top-K relevant past messages).
  3. Branch context isolation (when in a sub-channel, only its history + branch point + pinned context).
  4. Periodic summarization (background job compresses old blocks into `contextSummary`).
- **AI trigger logic complexity.** The current "if AI_THREAD, trigger" is simple. The new "if explicit AI channel OR @mention in any channel" requires parsing message content for mentions on every send.
- **Timeline UI.** The flat message list becomes a tree renderer. Messages with `parentId` branches need visual nesting. This is a non-trivial frontend component.
- **Sub-channel visibility.** Private vs. shared sub-channels require a new access control check. Currently all workspace members can see all channels.

### 5.4 Data Model Impact

**No migrations needed for the core feature.** The schema already supports:
- `parentChannelId` (sub-channels)
- `contextSummary` (summaries)
- `channelType: ai_thread` (personal channel)

**One migration needed:**
- Add `isPersonal: boolean` flag to `channels` table to identify personal channels (vs. regular AI threads). Alternatively use `metadata.isPersonal: true`. Either is one-line.

---

## 6. Implementation Plan

### Phase 1: Personal Channel Provisioning (1–2 days)

**Goal:** Every user always has a channel. Command palette stops creating orphans.

**Backend:**
1. Add `ensurePersonalChannel(userId, workspaceId)` function in `channel-repository.ts`:
   - `SELECT * FROM channels WHERE userId = ? AND workspaceId = ? AND channelType = 'ai_thread' AND metadata->>'isPersonal' = 'true' LIMIT 1`
   - If not found: `INSERT INTO channels (..., metadata: { isPersonal: true }, title: null) ...`
   - Returns the channel.
2. Call `ensurePersonalChannel` in the workspace join flow (workspace member creation).
3. Add `trpc.chat.getPersonalChannel` query: returns the user's personal channel for the active workspace.
4. Modify `sendMessage` (no channelId provided + no workspaceId-only path): route to personal channel instead of creating a new `ai_thread`.

**Frontend:**
1. Command palette `app-ask-ai` handler: call `trpc.chat.getPersonalChannel()` → navigate to that channel with `?q=<query>`.
2. Remove the "pendingChannelId" workaround in `ChatWorkspace` — personal channel always exists.
3. `ChannelList`: add filter to hide personal channels from the list (they're accessed via Timeline, not the channel list).

**Outcome:** `sendMessage` from command palette never creates a new channel. History accumulates in one place.

---

### Phase 2: AI in Any Channel (@mention trigger) (2–3 days)

**Goal:** Typing "@ai" or "@synap" in any channel type triggers an AI response.

**Backend — `sendMessage` handler changes:**
```typescript
// Current logic
const shouldTriggerAI = channel.channelType === ChannelType.AI_THREAD;

// New logic
const hasAIMention = /(@ai|@synap|@assistant)\b/i.test(content);
const isAIChannel = channel.channelType === ChannelType.AI_THREAD;
const channelHasAIEnabled = !!channel.agentType && channel.agentType !== "none";

const shouldTriggerAI = isAIChannel || hasAIMention || channelHasAIEnabled;
```

**@mention stripping:** Before sending to hub, strip the mention trigger from the content:
- `"@ai help me draft this"` → `query: "help me draft this"`

**Channel context injection:** For non-AI channels, inject contextObjectType/Id into the hub request so the AI knows it's responding in an entity comment vs. a personal timeline.

**Frontend:**
1. `ChatInput`: Show `@ai` in autocomplete suggestions for non-AI channels.
2. Non-AI channel message bubbles: mark AI responses with a distinct visual treatment (emerald accent, not the full AI message bubble style — smaller, inline).

---

### Phase 3: Context Window Management (1 week)

**Goal:** Personal channel with months of history doesn't degrade AI quality or hit token limits.

**Backend — Context Assembly Service:**

Create `assembleChannelContext(channelId, query, options)`:

```typescript
interface ChannelContext {
  recentMessages: Message[];     // Last N (default 30)
  relevantMessages: Message[];   // Top-K by semantic similarity to query
  contextSummary?: string;       // Compressed summary of older history
  pinnedContext: ContextItem[];  // Explicitly pinned entities/documents
}
```

Implementation:
1. **Recent messages:** Always include last 30 messages. Non-negotiable anchor.
2. **Semantic retrieval:** Embed the query with the workspace's embedding model. Query message embeddings index (add `embedding vector(1536)` column to messages, populate async). Retrieve top-10 semantically similar older messages.
3. **Context summary:** If channel has `contextSummary`, include it as a system-level context block before the messages.
4. **Token budget:** Estimate tokens per message (avg 50 tokens). If total > 80k, drop oldest "relevant messages" first, then recent messages beyond last 10.

**Summarization job:**
- Background worker runs weekly (or when message count crosses 500, 1000, 2000 thresholds).
- Takes messages older than 30 days.
- Sends to AI: "Summarize the key decisions, entities created, and insights from this conversation history."
- Stores result in `channels.contextSummary`.
- Marks summarized messages with `isSummarized: true` (add column or use metadata).

**Hub changes:**
- Hub currently loads messages independently by `threadId`. Pass the assembled context directly instead, removing the need for the hub to re-query the DB.
- New field: `contextMessages: Message[]` in the hub request payload.

---

### Phase 4: Timeline View (1–2 weeks)

**Goal:** The personal channel renders as a tree timeline, not a flat list.

**Frontend — `TimelineView` component:**

Structure:
- Top-level messages in the personal channel → displayed chronologically.
- Messages with a `branch` sub-channel spawned from them → display branch marker inline.
- Branch can be expanded (shows sub-channel messages inline) or collapsed (shows branch title + message count).
- Date separators by day (already exists in MessageList).
- AI action markers: when the AI created a document or entity, show a compact "artifact" chip in the timeline.

**Data needed:**
- `trpc.chat.getPersonalChannel` returns channel + messages.
- `trpc.chat.listChannels({ parentChannelId: personalChannelId })` returns sub-channels.
- Sub-channel messages loaded lazily on expand.

**Visual design:**
- Main timeline: full-width, same as today's message list.
- Branch marker: left-indented connector line, emerald dot, branch title, collapse button.
- Date headers: sticky as user scrolls.
- "One-shot" messages (command palette queries with no continuation intent): visually compact, no avatar, smaller text — like a shell command with its output.

---

### Phase 5: Sub-Channel UX (3–4 days)

**Goal:** Users can create named sub-channels from the timeline for focused work.

**Frontend — Sub-channel creation:**
- Right-click / long-press on message → "Explore this further" → opens sub-channel creation dialog.
- Input: name (optional, AI suggests one), visibility (private / workspace).
- Creates `BRANCH` channel (reuses existing type) with `parentChannelId = personalChannelId` and `branchPurpose = user input`.
- Navigates to sub-channel. Sub-channel has its own focused view.

**Backend — Sub-channel context inheritance:**
- On create: copy parent's `contextItems` (pinned entities/documents) to sub-channel.
- On merge: summarize sub-channel history → append to parent's `contextSummary`.

**Frontend — Sub-channel rendering in timeline:**
- Folded by default: shows branch name + "X messages · last active Y".
- Expanded: shows full sub-channel history inline with visual nesting.
- "Merge" action: collapses sub-channel back to a marker with the summary.

---

## 7. Open Questions

| Question | Recommendation |
|---|---|
| What's the personal channel title? | `null` (unnamed) — UI shows "Your AI" |
| Can users have multiple personal channels (one per workspace)? | Yes — one per (userId, workspaceId) pair |
| What happens to existing conversations (channels)? | Keep as-is, migrate to sub-channels UX gradually |
| Who can see the personal channel? | Only the owner (private by default). Sharing = explicit action. |
| What if the personal channel is deleted? | `ensurePersonalChannel` recreates it on next interaction |
| Should AI responses in entity comments go to personal timeline too? | Optional: copy reference (not duplicate). Show "AI responded in [entity name]" marker. |
| How does the intelligence service selection work for sub-channels? | Inherit from parent → workspace default → env default. Same existing hierarchy. |
| Can sub-channels have a different AI model/service? | Yes — `agentConfig` per channel supports this already. |
| What about the `a2ai` channel type? | Unchanged — remains agent-to-agent, no UI entry point for users. |

---

## 8. What We Are Not Doing

- **Not removing multi-channel support.** Team channels, entity comments, document reviews all stay.
- **Not building a new data model.** Everything reuses existing schema.
- **Not changing the Intelligence Hub protocol.** Context assembly happens before the hub call.
- **Not forcing one conversation forever.** Users can still create regular `ai_thread` channels if they prefer the isolation model.
- **Not breaking existing command palette behavior.** Phase 1 is additive — existing flows still work.

---

## 9. Summary: Why This Matters

| Dimension | Today | After |
|---|---|---|
| **Start AI query** | Create channel → type → wait | Type → get response |
| **Find past AI interaction** | Browse list of named channels | Scroll timeline by date |
| **AI context** | Isolated per conversation | Persistent, growing, smart-selected |
| **AI in comments** | Not possible | @mention anywhere |
| **Architecture** | Chat app with AI | Ambient intelligence layer |
| **Differentiator** | Feature parity with ChatGPT | Meaningfully different: AI knows your workspace |

The channel model is not being abandoned — it is being elevated. Channels become **purposeful work contexts**, not accidental conversation silos. The personal timeline becomes the connective tissue that makes the workspace feel like a single, coherent, AI-assisted environment rather than a collection of disconnected tools.

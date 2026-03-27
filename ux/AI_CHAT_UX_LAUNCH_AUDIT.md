# AI Chat UX & Launch Readiness Audit

**Role:** UX designer / product owner  
**Scope:** Browser capabilities, backend/packages enabling AI, and end-to-end AI experience with focus on loading, performance, step-by-step clarity, and separation of think / talk / tool / talk again.  
**Date:** 2025-03-10

---

## 1. Product & capabilities understanding

### 1.1 Browser (Electron app)

- **Location:** `browser/` — Electron + Vite, Tamagui, React.
- **Entry:** `App` → `AppContent` (onboarding/workspace gates) → `AppShell` (ActivityBar, AddressBar, AppContainer, modals).
- **Apps:** Single manifest (`apps/manifest.ts`); apps lazy-loaded. **Chat** and **Intelligence** are `requiresPod`; they use Pod tRPC + Socket.IO.
- **Connection:** `SynapProvider` wires Platform tRPC (Control Plane) and Pod tRPC (Data Pod). Pod URL from ref to avoid remounts. `WorkspaceInitializer` syncs workspaces and profile store when connected. Socket.IO for real-time (entity events, chat stream).
- **Entity fullscreen:** `EntityFullscreenView` — document or dashboard embed; uses `trpc.entities.get`, document content, connection store, app store, cell panel.

**Takeaway:** Browser is the main client; Chat and Intelligence are first-class, pod-gated apps with a clear connection model.

### 1.2 AI flow (backend → frontend)

- **Intelligence service:** External Hub Protocol service. Stream endpoint: `POST /api/chat/stream` (SSE). Emits `step` (thinking/tool), `content`, `branch_decision`, `complete` (content, aiSteps, createdProposals), `error`.
- **Backend:** `channels.sendMessage` resolves the intelligence service, then:
  - **Streaming:** `sendMessageStream()`; for each chunk: `chat:stream` (chunk/complete), `ai:step` (step), `branch_decision`. On stream end, message is persisted and `chat:stream` complete is emitted. On stream error: `chat:stream:error` (with `fallback`) and optional non-streaming fallback.
- **Frontend:** `useStreamingMessage` subscribes to `chat:stream`, `ai:step`, `chat:error`, `chat:stream:error`, `branch_decision`. Updates local state and `useStreamingStore` (content + steps). On complete, invalidates `chat.getMessages`. 60s timeout for stuck streams.

**Takeaway:** Event flow is well-defined (request → steps → content → complete). Backend correctly emits every step and completion.

### 1.3 Chat UI structure

- **ChatView** (single/branch/parallel/workspace modes): `MessageList` + `ChatInput` + optional header/sidebar. Uses `useSendMessage`, `useStreamingMessage`, `useStreamingStore`, `useMessages`, `useProposals`, etc.
- **MessageList:** Renders messages, compaction breaks, date separators, session grouping. Supports `streamingMessage` (in-flight), `showThinkingIndicator`, `renderBeforeContent`, `renderExtraContent`.
- **MessageBubble:** For AI: flat layout (no bubble card). Order: author badge → **renderBeforeContent** → message text (or `StreamingDots`) → **renderAfterContent** → timestamp/actions.
- **MessageExtraContent:** Renders AI extras: (1) AIStepsPanel, (2) Doc proposal cards, (3) Other proposed actions, (4) DB proposals, (5) Pending pill, (6) Auto-approved pill.
- **AIStepsPanel:** Pairs steps into thinking labels + tool_call/tool_result disclosures. Thinking steps as compact bullet lines; tool pairs as `ToolDisclosure` with typed content (search, graph, memory, doc). Filters noisy thinking titles. Shows a “Thinking…” shimmer at bottom when `isStreaming`.
- **MessageStepsOnly:** Wraps AIStepsPanel for a single message; documented as “used as renderBeforeContent to show thinking above the text.”

**Takeaway:** The **intended** pattern is: steps above text via `renderBeforeContent` (MessageStepsOnly), extras (proposals, etc.) below via `renderExtraContent`. That gives a clear order: **think / tools → talk → proposals**.

---

## 2. AI experience audit: order, separation, spacing

### 2.1 Intended order (think → tool → talk → talk again)

- **Think:** Thinking steps (and “Thinking…” before first chunk).
- **Tool:** tool_call + tool_result pairs (collapsible disclosures).
- **Talk:** Streamed markdown content.
- **Talk again:** Further thinking/tool/content in the same turn; then proposals after completion.

Design supports this: `renderBeforeContent` = steps (think + tool), then message content, then `renderAfterContent` = proposals/cards.

### 2.2 What actually happens today

| Phase | Expected | Current behavior |
|-------|----------|------------------|
| Before first chunk | “Thinking…” near the message area | ✅ `showThinkingIndicator` (ThinkingRow) at bottom of list when `waitingForAI` and no streaming message. |
| During stream | Live steps (think, tool_call, tool_result) above streamed text | ❌ **Steps are not shown during streaming.** ChatView does **not** pass `renderBeforeContent`. MessageExtraContent renders AIStepsPanel only when `!isStreaming` (line 176). So the user sees only streamed text + dots, no step-by-step. |
| After completion | Steps above content, proposals below | ✅ For **persisted** messages, MessageExtraContent renders AIStepsPanel in renderExtraContent (after content). So steps appear **below** the text, not above. Order is: text → steps → proposals (inconsistent with “think before talk”). |

So we have:

1. **During stream:** No live steps (think / tool / result) at all.
2. **After completion:** Steps are shown **below** the message (in renderExtraContent), not above (renderBeforeContent). So the “think then talk” order is only visible after the fact, and steps are under the fold.

### 2.3 Step data during streaming

- **useStreamingMessage** receives every `ai:step` and either:
  - Sets `currentStep` (e.g. thinking), or
  - For `tool_call` (status complete) / `tool_result`: pushes to **local** `streamingSteps` and clears `currentStep`.
- Only `currentStep` is synced to the store: `useEffect(() => { if (currentStep) addStep(threadId, currentStep); }, [currentStep, ...])`. So **tool_call** and **tool_result** are never passed to `addStep`. The store’s `stream.steps` only contains thinking steps during streaming.
- So even if we started rendering steps during streaming, we would only show thinking steps, not tool calls/results.

### 2.4 StreamingIndicator (status: thinking / typing / tool_running)

- **StreamingIndicator** exists and supports `thinking | typing | tool_running | waiting | error` with optional retry.
- It is **not** used in ChatView or MessageList. The only “thinking” UX is the list’s ThinkingRow and, inside AIStepsPanel, the internal “Thinking…” shimmer when `isStreaming` (but AIStepsPanel is not shown during stream).
- So we do not surface “Typing…” vs “Running: &lt;tool&gt;” in the main chat UI.

### 2.5 Spacing and layout (when steps are shown)

- **MessageBubble (AI):** Author badge → renderBeforeContent → YStack (content + renderAfterContent) → timestamp. `gap="$2"` in the content YStack. `outerMarginBottom` 24px for single/last (good separation between turns).
- **AIStepsPanel:** `marginBottom: $2`; thinking rows: `paddingVertical: 3`, `paddingHorizontal: $2`; ToolDisclosure: `marginVertical: 2`; internal StreamingIndicator has padding. Spacing is consistent and light.
- **ThinkingRow (waiting):** Small avatar box + “Thinking…” text; sits at bottom of list. Visually clear but disconnected from where the message will appear.

### 2.6 Loading and performance

- **Message list load:** When `isLoading && messages.length === 0`, MessageList shows skeleton bubbles (3 placeholder shapes). Good.
- **Thread load / first message:** No dedicated skeleton for “loading thread” once a channel is selected; relies on the same skeleton when there are no messages.
- **Long threads:** No virtualized or paginated message list found; `fetchNextPage` / `hasNextPage` exist but long threads could still hurt performance.
- **Lazy apps:** Chat and Intelligence are lazy-loaded from the manifest; good for initial load.

---

## 3. Gaps and bugs (concise)

| # | Issue | Impact |
|---|--------|--------|
| 1 | **Steps hidden during streaming** — ChatView does not pass `renderBeforeContent`. MessageExtraContent hides AIStepsPanel when `isStreaming`. | User never sees live “think → tool → talk”; feels like a black box until the end. |
| 2 | **Tool steps not in store** — useStreamingMessage only calls `addStep` for `currentStep` (e.g. thinking). tool_call and tool_result go only to local `streamingSteps`. | Even if we showed steps during stream, only thinking would appear; tool calls/results would be missing. |
| 3 | **Steps shown below content after completion** — MessageExtraContent renders AIStepsPanel in renderAfterContent, not as renderBeforeContent. | “Think then talk” order is reversed in the final message (talk then think/tools). |
| 4 | **StreamingIndicator status not wired** — thinking/typing/tool_running not shown in ChatView. | No clear “Running: search_entities” or “Typing…” state. |
| 5 | **Two chat entry points** — Chat app vs Intelligence Channels; both use ChatView but different shells. | More surface for inconsistency (e.g. if one gets renderBeforeContent and the other doesn’t). |
| 6 | **No stream resume / partial recovery** — On `chat:stream:error` we fallback to non-streaming or show error; no resume of partial content. | Acceptable for v1; document as future improvement. |

---

## 4. Recommendations (prioritized)

### P0 – Critical for “step-by-step” and correctness

1. **Show steps during streaming**
   - In ChatView, pass `renderBeforeContent` so that the **streaming** message (and the in-flight pseudo-message) renders steps **above** the text.
   - Use `MessageStepsOnly` for that: it takes the message (with `metadata.aiSteps`) and `isStreaming`. For the streaming pseudo-message, `metadata.aiSteps` must come from the store’s `stream.steps`.

2. **Sync all step types to the streaming store**
   - In `useStreamingMessage`, when appending to `streamingSteps` for tool_call/tool_result, also call `addStep(threadId, step)` so the store’s `stream.steps` includes thinking **and** tool_call/tool_result in order.
   - Ensure the streaming pseudo-message built in MessageList uses `stream.steps` for `metadata.aiSteps` (already does if store is complete).

3. **Show steps above content for completed messages**
   - For AI messages, pass `renderBeforeContent` that renders `MessageStepsOnly` (steps only), and keep `renderExtraContent` for proposals/cards only (no duplicate AIStepsPanel). So: steps above text, proposals below. MessageExtraContent today renders AIStepsPanel in the “after” slot and when `skipSteps` is false; we need a single source of truth: steps in renderBeforeContent, and in MessageExtraContent use `skipSteps: true` so only proposals/cards are in renderAfterContent.

### P1 – UX polish

4. **Wire StreamingIndicator (or equivalent)** ✅ Implemented  
   - **ChatView** derives `streamStatus` from `currentStep` and `streamingMessage`: **thinking** (before first chunk or when currentStep is thinking), **typing** (streaming content), **tool_running** (currentStep is tool_call with toolName). **StreamingIndicator** is rendered above the input when streaming or waiting.

5. **Consistent spacing and hierarchy** ✅ Implemented  
   - **MessageBubble**: When **renderBeforeContent** (steps) is present, the message content **YStack** has **marginTop: $2** so there is a clear gap between steps and text.  
   - **AIStepsPanel**: When a **tool_call** has no **tool_result** yet and **isStreaming**, the disclosure summary shows **“Running: &lt;label&gt;”** so the user sees progress.

6. **Error and recovery**
   - Keep the existing error bar and “Try again” for recoverable errors. Optionally add a short message when falling back to non-streaming (e.g. “Stream was interrupted; showing full response when ready”) so the user knows why the experience changed.

### P2 – Performance and scale

7. **Virtualize or paginate the message list** ✅ Implemented  
   - **MessageList** now caps rendering at **100 messages** (oldest of the visible window). When there are more, a “Load older” row at the top either shows 50 more from the current set or calls **fetchNextPage** to load the next page. This keeps long threads responsive without full DOM virtualization.

8. **Single source of truth for “steps above vs below”** ✅ Implemented  
   - Steps are rendered only via **renderBeforeContent** (MessageStepsOnly). Proposals/cards only via **renderExtraContent** (MessageExtraContent with **skipSteps**). No duplicate AIStepsPanel.

---

## 6. Real data flow: Intelligence Service → Backend → Frontend

### 6.1 What the Intelligence Service actually sends (updated: real-time)

- **Route** (`synap-intelligence-service/apps/intelligence-hub/src/routes/chat-stream.ts`): Calls `agent.executeWithStream({ onThinking, onContent, onStep })`.
- **During execution:**
  - **Thinking** (context assembly): The agent pushes steps and calls **onThinking(step, title)**; the route emits a `step` event immediately (one per thinking title).
  - **Content**: The agent streams **onContent(chunk)** for each token; the route emits `content` immediately.
  - **Tool call**: When a tool is invoked, the tool wrapper creates the step, pushes to `aiSteps`, and calls **onStep(toolCallStep)**; the route emits that `step` immediately. No batching.
  - **Tool result**: When the tool returns, the wrapper creates the result step and calls **onStep(toolResultStep)**; the route emits that `step` immediately.
- **After** `executeWithStream` returns: The route sends **only** `branch_decision` (if any) and **complete** (with full content and aiSteps for persistence). It does **not** re-send `result.aiSteps` — that batch loop was removed to avoid duplication and to keep the stream strictly real-time.
- **Net effect:** The frontend receives a single, ordered stream: thinking steps (from onThinking), content chunks (from onContent), tool_call and tool_result steps (from onStep), then complete. No duplicate steps, no “everything at once” at the end.

### 6.2 What the backend forwards

- **Hub client** (`synap-backend/packages/api/src/clients/intelligence-hub.ts`): Consumes SSE and yields `{ type: "chunk", content }`, `{ type: "step", step }`, `{ type: "complete", data }`, etc., in the **order** received.
- **Channels router**: For each yielded value, emits `chat:stream` (chunk/complete) or `ai:step` (step) to the client. So the frontend sees the same order: thinking steps, content chunks, then the batch of steps, then complete.

### 6.3 Dynamic order and placement

- The AI can logically do: **think → tool → talk → more tools → proposal → talk again**. Today the Intelligence Service does **not** emit tool_call/tool_result or proposals mid-stream; it batches them at the end. So the **current** wire order is: thinking (real-time) + content (real-time), then all steps (think + tools), then complete.
- The **frontend** must support **any** order and placement for future compatibility:
  - **Steps** are stored and rendered in **receive order** (append-only, deduplicated by `step.id`).
  - **AIStepsPanel** renders steps in array order: thinking as bullet lines, tool_call + tool_result as paired disclosures. If the service later emits tool_call then content then tool_result, the frontend will show them in that order.
  - **Proposals** today only appear in the `complete` payload (and via backend governance); they are rendered below the message. If the service later emits `proposal` mid-stream, the backend would need to forward it and the frontend could show it inline (same pattern as steps).

### 6.4 Gaps addressed

- **Duplicate steps:** Removed at source — the Intelligence Service no longer sends a batch of steps after the run. Steps are emitted only via **onThinking** (thinking) and **onStep** (tool_call, tool_result) as they happen. The frontend store’s optional deduplication by `step.id` remains as a safety net.
- **Tool call without result:** When streaming, a `tool_call` can appear before its `tool_result`. AIStepsPanel shows tool_call + optional result; when `result` is missing and `isStreaming`, the UI shows “Running: &lt;toolName&gt;” so the user sees progress.
- **Single source of truth:** Steps are rendered only via `renderBeforeContent` (MessageStepsOnly); proposals/cards only via `renderExtraContent` (MessageExtraContent with `skipSteps`).

See also **synap-intelligence-service/docs/REALTIME_STREAMING_ARCHITECTURE.md** for the full real-time streaming design and comparison with OpenAI/Anthropic/Vercel AI SDK patterns.

---

## 5. Summary

- **Product and structure:** Browser and backend are clear; event flow (think → tool → talk) is supported by the backend and by the component design (AIStepsPanel, MessageStepsOnly, renderBeforeContent).
- **Main problems:** (1) Steps are not shown during streaming. (2) Tool steps are not synced to the store, so even a fix for (1) would be incomplete. (3) After completion, steps appear below the message instead of above, so the “think then talk” order is wrong.
- **Fixes that unblock a top-tier, non-frustrating AI UX:** Sync all step types to the store, pass `renderBeforeContent` (MessageStepsOnly) for both streaming and completed AI messages, and use MessageExtraContent with `skipSteps` for the “after” slot so steps live only above. Optionally wire StreamingIndicator for thinking/typing/tool_running and tighten spacing/alignment.

Implementing **P0 (1–3)** will give users a correct, step-by-step experience (think → tool → talk) in the right order and with full visibility during and after the stream.

---

## 7. Production-readiness checklist (pre-launch polish)

Use this list to validate data, branding, and quality of rendered UI before going live.

### 7.1 Auto-approved chip and floating chips

- **Pill:** Click to expand/collapse; tooltip/title: "Click to see approved actions" / "Click to collapse".
- **Expanded state:** Label "Approved actions" above the list; each approved tool shown as a **floating chip** (pill, `borderRadius: $round`, subtle border, hover feedback). Tool names normalized for display (e.g. underscores → spaces).
- **Implemented:** MessageExtraContent — auto-approved block uses `title` for accessibility, "Approved actions" label when expanded, chips with `borderRadius: $round` and `hoverStyle`.

### 7.2 Branch / sub-agent card (long rectangle)

- **Layout:** Full-width horizontal bar (`width: 100%`, `minHeight: 48`), left accent, icon + label + purpose + actions.
- **Actions:** "View branch" (switch main view); optional "Open in panel" when host provides `onOpenBranchInPanel` (opens sub-agent details in side panel).
- **Implemented:** BranchResultCard — long rectangle layout; `onViewBranch` + optional `onOpenInPanel`; ChatView/MessageExtraContent pass through; ChatApp can wire `onOpenBranchInPanel` when panel support for channels exists.

### 7.3 Tool call: one collapsed line, click to see details

- **Collapsed:** Single line per tool: chevron + optional icon + summary (e.g. "Searched entities") + optional detail badge; no wrapping.
- **Expand:** Click row to expand; show full tool input/result below. Clear hover/press states and min height for touch.
- **Order:** Steps rendered in receive order (search → fetch → …). "Running: &lt;label&gt;" when tool_call has no result yet during stream.
- **Implemented:** ToolDisclosure — single-line trigger with `minHeight: 28`, `numberOfLines={1}` on summary, `title` for "Click to see details" / "Click to collapse"; AIStepsPanel keeps step order.

### 7.4 Doc / entity proposal cards

- **Doc proposals:** DocCreatedCard for create/update document; "View" uses `onOpenInPanel` → `openResource(type, id, { placement: "side" })` when provided.
- **Entity proposals:** ProposalCard with approve/reject and "View" opening entity in side panel.
- **Consistency:** Same card pattern (border, radius, padding) and same "View" / "Open in panel" behavior where applicable.

### 7.5 Tool loading order and tool search UX

- **Order:** Intelligence Service emits steps in real time (onStep); frontend appends in order. So "tool search" step appears first, then "tool result" when it arrives — no extra reordering needed.
- **Collapse:** Each tool is one ToolDisclosure (collapsed by default); user clicks to expand and see arguments/result.

### 7.6 Data and branding

- **Data:** Proposals from DB (useProposals) merged with metadata; branch cards use `childThreadId`; steps from `metadata.aiSteps` or streaming store.
- **Branding:** Use design tokens (`$3`/`$4` radius, `$2` spacing, theme success/primary) across BranchResultCard, ProposalCard, DocCreatedCard, ToolDisclosure, and auto-approved chips.

### 7.7 Small fixes and enhancements

- **Copy:** "View branch"; "Open in panel" when side-panel action exists; "Approved actions" when expanded.
- **Accessibility:** `title` on interactive rows (expand/collapse, auto-approved pill).
- **Empty/error:** Existing error bar and "Try again"; optional fallback message when stream fails and non-streaming response is shown.
- **Long threads:** Render window (e.g. last 100 messages) + "Load older" already implemented.

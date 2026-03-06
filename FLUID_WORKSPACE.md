# Synap Fluid Workspace
## Product Vision Document — March 2026

---

## 1. The Idea in One Sentence

A workspace that starts empty and is entirely _spoken into existence_ through AI conversation — where the UI is not a form you fill in, but a live agent you talk to, and every surface is a generated cell that AI can rearrange at any time.

---

## 2. What Problem This Solves

Traditional productivity software (Notion, Linear, Slack) forces users to make architecture decisions before they even know what they need:

> "Create a workspace → Choose a template → Add databases → Configure views → Invite members"

90% of first-session users don't make it through that funnel. They don't know what they want yet.

**Fluid Workspace flips this.** You arrive at a blank screen. An AI greets you, asks what you're trying to accomplish, and _builds the workspace around your answer_ — in real time, in front of you.

The workspace is not configured. It is _grown_.

---

## 3. Core UX Principles

### 3.1 Zero Default State
When a user opens a new workspace, they see:
- A centered chat input
- "What do you want to build today?" (or a row of quick-start tiles: Research, CRM, Project, Journaling)
- Nothing else

No sidebar, no empty databases, no empty nav. **Emptiness is intentional.** It signals that everything here was put here deliberately.

### 3.2 AI Proposes, User Decides (In the Flow)
AI does not send walls of text describing what it's about to do. It acts, then shows the result inline:

```
AI: I'm creating a Projects database for you.
    [Live preview of entity list appears inline in chat]
    → "Add a due date field?"  [Yes]  [Not now]  [Edit]
```

Proposals are **not modals or notification badges**. They are embedded cards in the chat stream, dismissable with a single keypress.

### 3.3 The Chat Thread IS the Workspace
Every significant thing the AI creates — a view, a document, an entity schema — exists as a **cell embedded in the conversation thread** where it was created. The conversation is the audit trail, the undo history, and the navigation map.

You can scroll up the chat to see the moment the Projects view was created. You can click it to re-open it. You can ask AI to "revert to when we had only two views."

### 3.4 Zero Mouse
Every action has a keyboard path:
- `↑↓` navigate proposals in the chat stream
- `Enter` accept current AI proposal
- `Esc` dismiss / skip
- `Tab` cycle through open cells/panels
- `Cmd+K` → command palette (existing, already built)
- `Cmd+B` → branch navigator
- `/` in chat → slash commands (existing)
- `@agentname` → route message to specific agent

Mouse is available for people who prefer it. It is never _required_.

### 3.5 Branches Are First-Class Navigation
Every time the user explores a different direction with the AI ("actually, make it a CRM instead"), that becomes a **branch** — a named parallel thread that can be resumed, compared, or merged. Branches are visible in a persistent side rail, selectable like tabs in an IDE.

---

## 4. The Three Pillars

### Pillar 1: Fluid Onboarding

**Entry state**: New workspace arrives at `<FluidEntry />` — a full-screen centered component.

**Quick-start tiles** (if the user doesn't want to type):
- 💬 AI Research Assistant
- 📋 Project Tracker
- 🗂 Knowledge Base
- 💼 CRM / Sales Pipeline
- 📓 Personal Journal
- 🖥 Custom (blank)

**If the user types**: a free-form first message is sent to the AI. The AI interprets intent and begins scaffolding.

**The AI response does three things simultaneously**:
1. Sends a chat message acknowledging intent
2. Calls `create_profile`, `create_view`, `create_property_def` via Hub Protocol
3. Injects the newly created views as **inline cells** in its own message

The user sees views appearing live, like a fast web page load, as the AI types its response.

**Progressive disclosure**: AI doesn't create everything at once. It creates the minimum viable structure, then surfaces options:
```
AI: Here's your research workspace. I've set up:
    [inline: KnowledgeBase entity list — live, clickable]
    [inline: Today's Notes document — editable]

    Want me to add a reading queue, or would you prefer to start with a blank note?
    [Reading Queue]  [Blank Note]  [Skip for now]
```

---

### Pillar 2: Branch Navigator

**The problem**: AI conversations branch naturally ("try it this way instead"), but current UIs treat branches as dead ends. You lose the thread you were on.

**The solution**: A persistent **Branch Rail** — a 56px-wide strip on the left edge (collapsible). Expands to a 280px panel on hover/focus.

**Branch Rail elements**:
```
┌──────┐
│  ●   │  Root (your workspace origin)
│  │   │
│  ●   │  "Add CRM fields"  (4h ago)
│  │   │
│  ●   │  "Product research branch"  (2h ago, ACTIVE)
│  │\\  │
│  ●  ●│  "Technical vs Commercial"  (two sub-branches)
└──────┘
```

- Each dot is a branch point, showing label + time + message count
- Active branch glows
- Click any branch → instantly jump to that conversation and its associated workspace state
- `Cmd+B` opens/closes the rail
- Arrow keys navigate branches when rail is focused
- `Enter` switches to focused branch
- `Cmd+N` creates a new branch from current position

**Branch state snapshot**: When you switch branches, the sidebar apps reconfigure to match what was active in that branch's workspace context. Like git checkout, but for your workspace layout.

---

### Pillar 3: Agent Theatre

This is the most novel feature. A dedicated view type (`agent_theatre`) that renders the multi-agent workspace as an **interactive, spatial canvas**.

**Visual metaphor**: A top-down office floor plan. Each agent is a character with a position, a name badge, and a status ring.

```
┌─────────────────────────────────────────┐
│                                         │
│   [🤖 Research]          [🤖 Writer]    │
│       ●●● thinking          idle        │
│         │                              │
│         └───────────────→ [🤖 Editor]  │
│                              working   │
│                                         │
│   [👤 You]                              │
│    online                               │
└─────────────────────────────────────────┘
```

**Behaviors**:
- **Thinking**: animated pulse ring, shows current subtask as tooltip
- **Working**: progress bar at the bottom of the character card
- **Idle**: dim, no animation
- **Talking to you**: speech bubble with last message preview
- **A2A call**: animated dotted line between agents, labeled with the task being handed off
- **Completed**: checkmark flash, then quiet
- **Error**: red ring, click to see error details

**Office areas / rooms** (optional, but powerful):
- Agents can be grouped into "rooms" representing different domains
- E.g., a "Research Room" with 3 research agents, a "Writing Room" with 2 editors
- Rooms have visual borders and labels
- You can drag agents between rooms to reassign scope

**Interaction**:
- Click an agent → opens its conversation thread inline (chat panel slides in from right)
- Double-click → full chat with that agent
- Cmd+click → compare two agents' conversation threads side-by-side
- Right-click → context menu: Pause / Resume / Clone / Dismiss agent

**The canvas is also a branch map**: Each active branch is spatially located. Branches created from an agent conversation appear visually connected to that agent. You can see the entire "tree of thought" for a session.

---

## 5. Technical Architecture

### 5.1 What Already Exists (✅ Ready)

| Component | Status | Location |
|-----------|--------|----------|
| Cell runtime | ✅ | `@synap/cell-runtime` |
| Bento view system | ✅ | `@synap/bento-view` + `@synap/view-renderer` |
| AI channel (`ai_thread`, `branch`) | ✅ | `@synap/channels` |
| Branch tree data | ✅ | `useBranches()`, `trpc.chat.getBranchTree` |
| Branch tree visual | ✅ | `branch_tree` view type in `StructuredViewRenderer` |
| Hub Protocol workspace tools | ✅ | `create_view`, `create_profile`, `create_property_def` |
| Agent users + RBAC | ✅ | `userType: "agent"` in users table |
| Command palette | ✅ | `@synap/command-palette` |
| Proposal flow | ✅ | `checkPermissionOrPropose` → inbox |
| Agent activity cell | ✅ | `AgentActivityCell` in cell-runtime |
| Intelligence dashboard | ✅ | `IntelligenceDashboard` bento |
| ChatTab with branch view toggle | ✅ | ChatTab + WorkspaceGraphView |

### 5.2 What Needs to Be Built (🔨)

| Component | Complexity | Description |
|-----------|------------|-------------|
| `FluidEntry` component | **Medium** | Full-screen blank onboarding with chat + quick tiles |
| Zero-state workspace detector | **Easy** | Check if workspace has 0 views → route to FluidEntry |
| Inline cell injection in chat | **High** | AI messages can embed live `<CellRenderer>` in message body |
| Proposal cards in chat stream | **Medium** | `[Accept] [Edit] [Skip]` inline cards with keyboard nav |
| Branch Rail (persistent nav) | **Medium** | Left-edge strip, expands to full panel, keyboard navigable |
| Branch state snapshot/restore | **High** | Switch branch → restore sidebar layout for that branch |
| `agent_theatre` view type | **High** | Spatial canvas, agent characters, A2A lines, rooms |
| Agent status stream | **Medium** | SSE feed of agent state changes (thinking/working/idle) |
| Keyboard navigation layer | **Medium** | Global hotkeys outside React focus model |
| `@mention` agent routing | **Easy** | Parse `@agentname` in chat → route to specific agentUserId |

### 5.3 Key Technical Challenges

#### Inline Cell Injection in Chat
Currently, `ChatMessage.content` is plain text/markdown. To embed live cells, we need:
1. A message content format that can include `<cell>` nodes (MDX-like or JSON rich text)
2. A `ChatMessageRenderer` that parses these nodes and renders `<CellRenderer>`
3. The AI's response generation to output cell injection markers (e.g., `:::cell{key="entity-list" workspaceId="..."}:::`)

This requires changes to:
- Intelligence Hub: teach agent to output cell markers
- Frontend message renderer: parse and render live cells
- The most elegant approach: use a rich message format (Tiptap JSON or similar) where the AI can include structured blocks

#### Branch State Snapshots
When user switches branches, the sidebar layout should reflect what was active in that branch's context. This requires:
- Storing `sidebarState` on the `Channel` row (or in `channel.metadata`)
- On branch switch: `applyBranchSnapshot(branchId)` → updates `profileStore.layoutConfig`
- This is the "git checkout for workspace layout" concept
- **Simpler first version**: just remember which `activeChannelId` and highlight it when returning to a branch

#### Agent Theatre Rendering
The spatial canvas needs:
- A 2D positioning system for agents (x, y stored in agent config)
- Real-time agent status from the Intelligence Hub (new SSE endpoint `/api/agents/status`)
- A2A call tracking: when one agent calls another via Hub Protocol, emit a `a2a_call` event
- React component with SVG overlay for connection lines + animated pulse rings
- The "rooms" feature can be v2 — start with free-floating agents on a canvas

---

## 6. The "Fluid Chat Document" Pattern

One specific use case the user called out: **the chat document**. This is a new content type that merges long-form writing with AI conversation:

```
[Document: "Market Research Q1 2026"]

Paragraph written by user...

[AI turn: Research Agent found 3 sources ↓]
  ├── Source card 1 (inline cell)
  ├── Source card 2 (inline cell)
  └── Source card 3 (inline cell)

Paragraph incorporating those sources...

[AI turn: "Should I expand the competitor analysis?"]
  [Yes, continue]  [Show sources first]  [Move to new section]
```

This is distinct from a "document" and distinct from a "chat thread." It's a **collaborative document** where the AI is a co-author with explicit turn-taking.

Implementation: a new `channel_type: "fluid_doc"` that renders in a document-like format rather than chat bubbles. The AI's turns look like block quotes with an agent avatar, not chat messages.

---

## 7. Commercial Opportunity

### 7.1 The Demo That Sells Itself

A Fluid Workspace onboarding can be recorded once and used as the product landing page. The video shows:
1. Blank screen
2. User types: "I'm building a SaaS product with a small team"
3. AI creates: Sprint board, Feature backlog, Bug tracker, Team channels — in 8 seconds
4. User says: "Add a CRM for early customers"
5. AI adds the CRM, links it to the backlog

This is more compelling than any feature list. **It demonstrates the system's intelligence rather than its configuration options.**

### 7.2 Personalized Entry Links

Generate shareable URLs like:
```
synap.live/start?intent=crm&industry=saas&team_size=small
```

This pre-seeds the AI with context. The user arrives at the onboarding and the AI already says:
> "I see you're building a SaaS CRM. I'll set up a pipeline, contact database, and activity timeline. Want to add email tracking?"

The `intent` parameters map to AI system prompt additions, not hardcoded templates. Every user gets a subtly different workspace tuned to their context.

### 7.3 "Workspaces as Products"

Power users can configure and package their Fluid Workspace setup as a **template product**:
- Set up a workspace the way they like it
- Mark it as "shareable"
- Others can `fork` it — getting a copy with their own AI agent maintaining it

This enables a marketplace of workspace configurations, where creators can sell their "workspace designs" the way Notion creators sell templates — but here, the workspace is **live** and AI-maintained.

---

## 8. Phased Implementation Plan

### Phase 1 — Zero Canvas & Fluid Onboarding (2–3 weeks)
- `FluidEntry` component: blank state + quick tiles + first chat
- Zero-state detector: workspace with 0 views → show FluidEntry
- AI creates views/profiles inline → appears in workspace immediately
- Simple proposal cards (no inline cells yet): "I created X. [View it]"

### Phase 2 — Branch Rail & Navigation (2 weeks)
- Persistent branch rail (left edge strip)
- Branch switching with `Cmd+B` keyboard shortcut
- Branch labels, timestamps, message counts
- Active branch highlight
- Arrow keys + Enter to navigate

### Phase 3 — Inline Cell Injection (3 weeks)
- Rich message format for AI chat messages (structured JSON content)
- `ChatMessageRenderer` that renders live cells inline
- Intelligence Hub updated to emit cell markers in responses
- Fluid doc channel type

### Phase 4 — Agent Theatre v1 (3–4 weeks)
- `agent_theatre` view type — spatial canvas
- Agent cards with name, status ring, last-action tooltip
- SSE endpoint in Intelligence Hub: `GET /api/agents/activity`
- A2A call visual lines (basic, no animation yet)
- Click agent → slides in their conversation thread

### Phase 5 — Polish & Power User Layer (2 weeks)
- Full keyboard navigation (no mouse required)
- `@agent` routing in chat
- Branch state snapshots (remember sidebar layout per branch)
- Agent room groupings in Theatre
- A2A animated lines + speech bubbles
- Personalized entry URL support

---

## 9. Open Questions

1. **Message format**: Rich JSON (Tiptap-style) vs MDX-style markers vs custom? The choice here has significant implications for storage and rendering.

2. **Branch state granularity**: Does switching branches restore sidebar layout? Just the active channel? The entire bento view? Start minimal.

3. **Agent Theatre persistence**: Is the spatial layout stored server-side (per workspace) or local? Agent positions need to be deterministic or user-configurable.

4. **The "fluid doc" type**: Is this a separate `channel_type` or an enhanced render mode for existing `ai_thread`? Keeping it as a render mode (not a new type) is simpler.

5. **AI initiative vs user initiative**: How often does AI proactively suggest things vs waiting to be asked? This is a product decision that affects the perceived "intelligence" level. Start with reactive (user asks), layer in proactive suggestions as a setting.

---

## 10. What This Says About Synap

Fluid Workspace is not a feature addition. It's a **statement about what software can be**:

> "Configuration is a legacy concept. Intelligence replaces it."

Every hour a user spends setting up a workspace is an hour they're not doing the work they came to do. Fluid Workspace eliminates that tax entirely. The workspace builds itself around the user's intent, adapts as that intent changes, and stays maintained by agents that understand the full history of decisions made.

This is the end state of the "Product Triptych" (Entities + Views + Channels): when all three are AI-generatable and AI-maintainable, the workspace becomes a living system rather than a static configuration.

The Agent Theatre visualization makes this **visceral** — you can see your workspace thinking. Not just using AI, but watching it work.

---

*Document owner: Antoine — March 2026*
*Status: Vision / Pre-implementation*

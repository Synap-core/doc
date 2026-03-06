# OpenClaw × Synap — Validated Architecture

> **This is the decided plan.** Not a brainstorm — a specification.
> Supersedes the options in `OPENCLAW_STRATEGIC_BRIEF.md`.
> Date: 2026-02-27

---

## Core Principles (Decided)

1. **Synap IS the brain. OpenClaw is the world interface.** They are peers, not a hierarchy. Neither calls the other directly for intelligence — they communicate through shared channels and the Hub Protocol API.

2. **Agent interactions are a graph, not a chain.** Agents can work in parallel, wait for each other asynchronously, push updates, and collaborate via dedicated AI-to-AI channels. No agent is subordinated to another.

3. **OpenClaw is outside Synap's internal services.** It connects via the public Hub Protocol API — the same API any external service uses. It never has direct DB access or internal tRPC access. The connection boundary is clean and auditable.

4. **Data modifications always flow through governance.** OpenClaw (or any external agent) never writes to Synap data directly. Every write goes through Hub Protocol → `checkPermissionOrPropose` → user inbox. No exceptions.

5. **Webhooks are for external automation (N8N, Zapier, user scripts), not for OpenClaw's primary integration path.** OpenClaw is a first-class service connected via Hub Protocol + A2AI channels.

6. **Filesystem access is opt-in, scoped, and governed.** Not disabled entirely — there's a real use case for server-side file operations — but never unrestricted.

---

## The Architecture

```
╔══════════════════════════════════════════════════════════════════╗
║                    USER'S DATA POD SERVER                         ║
║                                                                    ║
║  ┌─────────────────────┐    ┌───────────────────────────────────┐ ║
║  │   Synap Backend     │    │         OpenClaw Instance         │ ║
║  │   (internal)        │    │         (external service)        │ ║
║  │                     │    │                                   │ ║
║  │  • tRPC API         │    │  • Gateway (WS + HTTP :18789)     │ ║
║  │  • Intelligence Hub │    │  • Agent runtime                  │ ║
║  │  • Proposals/inbox  │◄───┼──• synap-os SKILL installed       │ ║
║  │  • Hub Protocol API │    │  • Channels: WA/TG/Slack/…        │ ║
║  │  • A2AI channels    │◄───┼──• Speaks Hub Protocol            │ ║
║  │                     │    │                                   │ ║
║  └─────────────────────┘    └───────────────────────────────────┘ ║
║           ▲                              ▲                        ║
║           │ Hub Protocol API             │ Messaging platforms    ║
║           │ (authorized, governed)       │ (WhatsApp, Telegram…)  ║
╚═══════════╪══════════════════════════════╪════════════════════════╝
            │                              │
     Synap Frontend                  User's phone
     (web / browser app)
```

### The Connection Point

OpenClaw connects to Synap through **one** interface: the **Hub Protocol API**.

```
OpenClaw → POST {SYNAP_POD_URL}/trpc/hubProtocol.*
           Authorization: Bearer {SYNAP_HUB_API_KEY}
```

That's it. No internal tRPC. No direct DB. No special bridge route.
The Hub Protocol already handles: search, entity read/write (governed), document read/write (governed), channel operations, proposals, skills, background tasks.

The `synap-os` skill installed in OpenClaw defines what it can do and teaches the AI how to use this API correctly.

---

## The Synap OS Skill — The Integration Contract

The skill is a `SKILL.md` file installed into the user's OpenClaw instance once. It:

1. **Injects a system prompt** telling OpenClaw's AI what Synap is, what Hub Protocol tools are available, and the rules for governance
2. **Defines the tool shims** — shell-based HTTP calls that map to Hub Protocol endpoints
3. **Sets the event relay contract** — when to push channel events to Synap and how

```
Installation:
  openclaw skill install https://github.com/synap-app/openclaw-skill/SKILL.md

Env vars (user sets once in OpenClaw config):
  SYNAP_POD_URL        = https://pod.synap.live
  SYNAP_HUB_API_KEY    = hub_xxxx  (scoped: hub-protocol.read + hub-protocol.write)
  SYNAP_WORKSPACE_ID   = uuid
  SYNAP_AGENT_USER_ID  = uuid      (OpenClaw's agent user in Synap)
```

### What the Skill Teaches OpenClaw

```
READ (auto-approved, no proposal needed):
  • Search workspace entities and documents
  • Get entity by ID
  • Get document content
  • Get channel context
  • List skills installed in workspace

WRITE (always via proposal — Hub Protocol governance):
  • Create entity
  • Update entity
  • Create document
  • Create external channel (import conversation)
  • Add context to channel

RELAY (event push to Synap):
  • When external message arrives → POST hubProtocol.channels.createExternalChannel
  • When important context is available → propose adding to workspace
  • When task completes → push result to A2AI channel if one is waiting

A2AI (agent-to-agent communication):
  • Post to an A2AI channel: hubProtocol.channels.sendMessage (channelType: a2ai)
  • Poll an A2AI channel for responses
  • Wait for Synap agent reply before continuing
```

---

## A2AI Channels — Agent-to-Agent Communication

### The Concept

A new channel type: `a2ai` (AI-to-AI). These are channels where agents communicate asynchronously. No human posts to them (though humans can observe). Each agent is a sender AND receiver.

```
Examples:

Synap Agent → A2AI channel: "Summarize the last 7 days of WhatsApp messages with Alice and find tasks"
                ↓
OpenClaw Agent → reads channel, executes, posts result back
                ↓
Synap Agent → reads result, creates entities in workspace, closes loop

OpenClaw Agent → A2AI channel: "User asked about project status — here's the WhatsApp thread"
                ↓
Synap Agent → reads context, queries workspace, posts back structured data
                ↓
OpenClaw Agent → formats response, sends to WhatsApp
```

### Why This Is Better Than a Linear Call Chain

- **Agents don't block each other.** OpenClaw can post a question and continue handling other messages. When Synap replies, OpenClaw picks it up.
- **Multiple agents can participate.** A future "Research Agent" could subscribe to the same A2AI channel and contribute results without being hardcoded into the flow.
- **Humans can observe and intervene.** A2AI channels are visible in Synap's Channels tab — users can read the inter-agent conversation, add a message, or redirect.
- **Failure is recoverable.** If an agent goes offline, the message waits. When it comes back, it processes the backlog.
- **The graph emerges naturally.** You don't design "Agent A calls Agent B calls Agent C." You design "these agents share a channel, they react to messages." The topology forms based on what each agent responds to.

### Schema Change Needed

Add `A2AI` to the `channel_type` enum:

```sql
-- In channels.ts schema
channelType: 'ai_thread' | 'branch' | 'entity_comments' | 'document_review'
           | 'view_discussion' | 'direct' | 'external_import' | 'a2ai'  -- NEW
```

A2AI channels have:
- `participants: string[]` (agent user IDs that can post/subscribe)
- `topic: string` (what this collaboration is about)
- `status: 'active' | 'resolved' | 'waiting'`
- No human `userId` required — initiated by an agent user

### AI Trigger Behavior for A2AI Channels

When a message lands in an A2AI channel:
- If the message is FROM Synap IS → OpenClaw polls for it (or is notified via webhook on the OpenClaw side)
- If the message is FROM OpenClaw → Synap IS processes it and responds automatically
- No human in the loop unless they choose to observe/intervene

---

## Filesystem Access — Decision

### The Context

If OpenClaw runs on the same server as the Synap Data Pod (which is the goal — "add OpenClaw to the pod"), then filesystem access means:
- **Positive**: User can update server config, create small apps, modify deployment files
- **Risk**: OpenClaw could read/modify Synap backend files, DB config, API keys

### The Decision

**Allow filesystem access, but strictly scoped and always governed.**

Rules:
1. **Scoped to workspace directory** by default: `~/openclaw/workspace/**`
   - This is OpenClaw's own working directory, completely separate from Synap backend
   - User can read/write freely here (auto-approved for workspace dir)

2. **System paths require explicit proposal**: Any path outside `~/openclaw/workspace/` triggers a `checkPermissionOrPropose` with `action: "filesystem.write_system"` — NOT in any `autoApproveFor` whitelist by default

3. **Synap internal paths are blocked at the gateway level**: Backend paths (`~/synap-backend/**`, `.env`, `docker-compose.yml`) are on a blocklist that the OpenClaw skill enforces AND the Hub Protocol governance layer double-checks

4. **The use case you described is valid**: "I want to update my server config / create an app on my server" → this is `filesystem.write_system` → user approves in Synap inbox → OpenClaw executes → Synap logs the action

```
Filesystem permission matrix:

~/openclaw/workspace/**     → Auto-approved (OpenClaw's own domain)
~/projects/**               → Proposal required (user can auto-approve)
~/synap-*/**, .env, etc.    → BLOCKED (governance blocklist, never auto-approved)
/etc/**, /usr/**, /bin/**   → BLOCKED (governance blocklist, never)
```

### Why Not Disable It Entirely

The use case is real and valuable: a developer user who hosts their own pod and wants to use their AI to maintain configs, create small scripts, update deploy files — that's a legitimate power-user scenario. Disabling it entirely removes a differentiating capability. Scoping and governance is the right answer, not prohibition.

---

## What We Build Now — The Validated Scope

### Step 1: Synap OS Skill (2-3 days)
**Goal**: OpenClaw becomes Synap-aware. Zero new backend infrastructure.

Deliverables:
- `SKILL.md` file published at `github.com/synap-app/openclaw-skill`
- Documents Hub Protocol endpoints available to OpenClaw
- Defines governance rules for the AI (what needs proposals, what's auto)
- Defines the event relay format for external channel messages
- Defines A2AI channel message format
- Tested end-to-end: OpenClaw reads a Synap entity, proposes creating one

### Step 2: A2AI Channel Type (2-3 days)
**Goal**: Agents can communicate asynchronously without human mediation.

Deliverables:
- `A2AI` added to channel type enum + DB migration
- `createA2AIChannel` tRPC procedure (initiated by agent user)
- Agent auto-response: messages in A2AI channels trigger both Synap IS and can notify OpenClaw
- `channels.listA2AI` for querying active agent-to-agent channels
- Hub Protocol endpoint: `hubProtocol.channels.postToA2AI`
- Frontend: A2AI channels visible in Channels tab with `[A2A]` badge (read-only for humans, can inject)

### Step 3: External Channel Bridge (3-4 days)
**Goal**: External messages (WhatsApp/Telegram) flow into Synap as EXTERNAL_IMPORT channels.

Deliverables:
- OpenClaw event relay via Hub Protocol: `hubProtocol.channels.createExternalChannel` already exists — just needs OpenClaw to call it with the right event format
- EXTERNAL_IMPORT channel UI: platform icon, participant list, source badge
- Outbound relay: when Synap AI responds in EXTERNAL_IMPORT channel, relay to OpenClaw via `POST /v1/chat/completions` with platform routing headers
- Channel routing rules: user can configure which contacts/groups auto-flow into Synap

### Step 4: Filesystem Governance (1 day)
**Goal**: Scoped filesystem access with proper governance.

Deliverables:
- Add `filesystem.write_workspace` (auto-approve) and `filesystem.write_system` (proposal) to action taxonomy in `permission-check.ts`
- Add path-based blocklist check before any filesystem write proposal is created
- Document in skill: which paths are safe vs. require approval
- Add `filesystem_access_scope` to workspace settings (default: `workspace_only`)

---

## What We Do NOT Build

| Idea | Why not |
|------|---------|
| Direct tRPC access from OpenClaw | Violates boundary: Hub Protocol is the contract |
| OpenAI-compatible passthrough (Synap IS called from within OpenClaw as model) | Too coupled; creates circular dependency |
| Dedicated webhook receiver for OpenClaw | Unnecessary: Hub Protocol `createExternalChannel` already handles inbound events |
| Synap-managed OpenClaw hosting | Out of scope now; evaluate after Phase 1 validation |
| Automatic WhatsApp setup wizard | Risk: Baileys ToS issues; Telegram first |
| Linear orchestration (Synap tells OpenClaw what to do step by step) | Violates graph principle; use A2AI channels instead |

---

## The Architecture in One Sentence

> OpenClaw lives on the user's pod as a **peer agent** — it knows Synap's workspace through the `synap-os` skill, communicates with Synap's AI through **A2AI channels**, relays external messages through **Hub Protocol**, and executes local capabilities under **Synap's governance model**.

---

## Open Items Before Implementation

- [ ] Confirm `SYNAP_HUB_API_KEY` scope: should OpenClaw get a permanent key or rotate on session? → **Recommendation**: permanent, per-workspace, rotatable from settings
- [ ] A2AI channel participants: open (any agent can join) or closed (named agents only)? → **Recommendation**: closed, defined at creation, extendable via `addParticipant`
- [ ] Telegram first for external channels (WhatsApp as opt-in risk)? → **Confirm**
- [ ] Filesystem blocklist: maintained in Synap code or in the skill? → **Recommendation**: both — skill as first line, backend as enforcer
- [ ] A2AI notification to OpenClaw: polling (OpenClaw polls) or push (Synap calls OpenClaw webhook)? → **Phase 1 answer**: OpenClaw polls Hub Protocol. **Phase 2**: push via OpenClaw webhook when available.

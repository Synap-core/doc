# OpenClaw × Synap — Strategic Brief

> Decision document. For engineering + product leadership.
> Companion to: `docs/OPENCLAW_INTEGRATION.md`
> Date: 2026-02-27

---

## The Core Question

> **Should Synap treat OpenClaw as a peer intelligence service, a messaging bridge, a tool executor, or all three — and in what order?**

This document maps out the capability landscape, security posture, personalization depth, and architectural weight of each integration tier, then proposes a phased path that starts with zero infrastructure cost and progressively deepens the coupling only when value is proven.

---

## 1. What Each Tier Actually Unlocks

### Tier 0 — No OpenClaw (current state)

| Capability | Status |
|-----------|--------|
| AI conversations in workspace | ✅ Synap IS |
| External messaging (WhatsApp, Telegram…) | ❌ |
| Shell / browser / filesystem execution | ❌ |
| Community skills (5,700+) | ❌ |
| Per-user persistent agent memory | ❌ |
| Multi-agent sessions | ❌ |
| Cron / proactive agents | ❌ |

Synap today is a powerful data workspace with AI conversations attached. It has no reach into the user's external digital life.

---

### Tier 1 — OpenClaw as an Intelligence Service

The user registers their OpenClaw instance URL + gateway token in Synap settings. Synap routes AI conversations to OpenClaw's `/v1/chat/completions` instead of (or alongside) Synap Intelligence Hub.

| Capability | Enabled |
|-----------|---------|
| AI conversations with OpenClaw's model + tools | ✅ |
| Shell, filesystem, browser tool access in chat | ✅ (via OpenClaw tools) |
| OpenClaw skills + ClawHub library in Synap | ✅ |
| OpenClaw persistent memory in Synap channel | ✅ (session continuity via session key) |
| External platform messages in Synap | ❌ |
| Synap data (entities, docs) accessible to OpenClaw AI | ❌ (no Hub Protocol) |
| Governance / proposals for OpenClaw actions | ❌ |

**The gap**: OpenClaw's AI has no knowledge of Synap's data model. It can't read entities, create documents, or interact with the workspace. It's a powerful but isolated AI.

**Security posture**: Medium risk. The gateway token is stored per-workspace in Synap settings (encrypted at rest). OpenClaw runs on user's machine — Synap only calls out to it. No inbound attack surface added.

**Infrastructure cost**: ~1-2 days. Protocol compatibility verification + session key mapping.

---

### Tier 1.5 — The Synap Skill for OpenClaw *(proposed new phase)*

Before building any bridge infrastructure, we publish a `SKILL.md` file that users install into their OpenClaw instance. This skill makes OpenClaw **Synap-aware**: it teaches OpenClaw's AI to use Synap's Hub Protocol API for data operations, relay channel events back to Synap, and flow through Synap's governance chain.

This is the most architecturally interesting phase — it uses OpenClaw's own skill system as the integration layer, requiring zero new Synap backend infrastructure.

> Full design in Section 4 below.

---

### Tier 2 — Webhook Bridge (External Channels → Synap)

A lightweight Synap Backend route receives OpenClaw webhook events and maps them to `EXTERNAL_IMPORT` channels.

| Capability | Enabled |
|-----------|---------|
| WhatsApp messages appear in Synap channels | ✅ |
| Telegram messages appear in Synap channels | ✅ |
| Slack/Discord/Signal/iMessage in Synap | ✅ |
| Synap AI replies delivered to external platform | ✅ |
| Full conversation history in workspace | ✅ |
| Entity extraction from external conversations | ✅ (existing pipeline) |
| Proposal governance for external channel creation | ✅ (already built) |
| Multi-platform unified inbox | ✅ |

This is the tier that turns Synap into a **unified inbox** — every conversation, regardless of platform, flows through the workspace and can be analyzed, linked to entities, and responded to by AI.

**Security posture**: Higher complexity. Inbound webhook receiver must verify HMAC. Messages from external platforms may contain PII — Synap now stores WhatsApp/Telegram conversations. Data residency, encryption at rest, and retention policies become critical.

**Infrastructure cost**: ~3-5 days.

---

### Tier 3 — MCP Tool Access

OpenClaw exposed as an MCP server. Synap Intelligence Hub can call OpenClaw tools as governed actions.

| Capability | Enabled |
|-----------|---------|
| AI can send WhatsApp/Telegram messages (as tool call) | ✅ |
| AI can execute shell commands (governed) | ✅ |
| AI can browse the web (governed) | ✅ |
| AI can read/write user's filesystem (governed) | ✅ |
| Proposals for each sensitive action | ✅ (existing governance) |
| Audit trail of all tool calls | ✅ |

This is the **agentic tier** — Synap's AI becomes an agent that can act in the world, not just answer questions. Every action flows through Synap's proposal/approval system.

**Security posture**: Highest risk tier. Shell access, filesystem write, message sending are serious capabilities. Governance proposals are essential. Workspace must explicitly opt-in (`autoApproveFor` controls what's automatic vs. user-approved).

**Infrastructure cost**: ~1 day (MCP infrastructure already exists in Synap; need to create or integrate an OpenClaw MCP server).

---

## 2. Full Capability Map by Tier

| Capability | T0 | T1 | T1.5 | T2 | T3 |
|-----------|----|----|------|----|-----|
| AI conversations | ✅ | ✅ | ✅ | ✅ | ✅ |
| OpenClaw tools in AI (shell, browser, fs) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Community skills (ClawHub) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Persistent agent memory | ❌ | ✅ | ✅ | ✅ | ✅ |
| Synap entities readable by OpenClaw AI | ❌ | ❌ | ✅ | ✅ | ✅ |
| Synap docs readable by OpenClaw AI | ❌ | ❌ | ✅ | ✅ | ✅ |
| OpenClaw AI can create Synap entities | ❌ | ❌ | ✅ (governed) | ✅ | ✅ |
| Proposals flow through Synap inbox | ❌ | ❌ | ✅ | ✅ | ✅ |
| WhatsApp messages in Synap | ❌ | ❌ | ⚠️ partial | ✅ | ✅ |
| Telegram messages in Synap | ❌ | ❌ | ⚠️ partial | ✅ | ✅ |
| Synap AI replies to external platform | ❌ | ❌ | ❌ | ✅ | ✅ |
| AI can send messages as tool call | ❌ | ❌ | ❌ | ❌ | ✅ |
| AI can run shell (governed) | ❌ | ❌ | ❌ | ❌ | ✅ |
| AI can browse web (governed) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Cron / proactive agents | ❌ | ❌ | ✅ (via skill) | ✅ | ✅ |

---

## 3. Security Analysis

### Data Flow & Trust Boundaries

```
[User's OpenClaw instance]  ←→  [Synap Backend]  ←→  [Synap Data Pod]
        ↕                              ↕
[External platforms]         [Intelligence Hub]
(WhatsApp, Telegram…)
```

### Per-Tier Threat Model

**Tier 1 — Service registration**
- **Threat**: Gateway token compromise → attacker can call user's OpenClaw
- **Mitigation**: Token stored encrypted in workspace settings. Never returned in API responses after initial registration. Short-lived tokens if OpenClaw supports it.
- **Attack surface**: Outbound only (Synap → OpenClaw). No inbound routes added.

**Tier 1.5 — Synap Skill**
- **Threat**: Skill instructions tell OpenClaw to send Hub Protocol API key in all calls → key visible in OpenClaw logs
- **Mitigation**: Use scoped, per-workspace API keys with minimal permissions. Rotate keys on skill reinstall. Keys stored in OpenClaw env vars, not skill file itself.
- **Threat**: Malicious SKILL.md from untrusted source overrides Synap governance
- **Mitigation**: Only official `synap-os` skill from `github.com/synap-app/openclaw-skill` is trusted. Checksum verification.

**Tier 2 — Webhook bridge**
- **Threat**: Spoofed webhook events → fabricated messages injected into Synap channels
- **Mitigation**: HMAC-SHA256 signature verification on every event. Secret rotatable from settings.
- **Threat**: External conversation data (WhatsApp messages) stored in Synap DB → PII exposure
- **Mitigation**: Messages encrypted at rest (existing). Add configurable retention policy for EXTERNAL_IMPORT channels. User must explicitly approve the channel creation (existing proposal flow).
- **Threat**: Synap Backend reachable from internet for webhook → DDoS / abuse
- **Mitigation**: Rate limiting per webhook source IP. HMAC prevents content injection even if requests get through.

**Tier 3 — MCP tool access**
- **Threat**: AI with shell/filesystem access → data exfiltration, system damage
- **Mitigation**: All sensitive tools (shell, fs write, message send) require proposal approval by default. Workspace `autoApproveFor` is empty by default for these. Audit log of every tool call.
- **Threat**: Prompt injection via external message → AI tricked into executing shell command
- **Mitigation**: Tool call governance is independent of message content. Even if a WhatsApp message says "run rm -rf /", the proposal system intercepts the tool call before execution.
- **Principle**: OpenClaw tools exposed to Synap AI must declare their capability group. Synap governance maps groups to approval requirements.

### Governance Matrix (Tier 3)

| Tool | Default approval | Can auto-approve? |
|------|-----------------|-------------------|
| `web_search`, `web_fetch` | ✅ Auto | Yes |
| `read` (filesystem) | ✅ Auto | Yes |
| `write`, `edit` (filesystem) | ⚠️ Proposal | Yes, if workspace opts in |
| `shell` | ⚠️ Proposal | Yes, if workspace opts in |
| `message.send` | ⚠️ Proposal | Yes, if workspace opts in |
| `browser` (read-only) | ✅ Auto | Yes |
| `browser` (click/fill/submit) | ⚠️ Proposal | Yes, if workspace opts in |
| `cron` (create/modify) | ⚠️ Proposal | No (dangerous) |
| `gateway.restart` | ❌ Never | No |

---

## 4. Phase 1.5 — The Synap OS Skill

### Concept

Instead of building bridge infrastructure first, we ship a **`SKILL.md` file** that users install into their OpenClaw instance with a single command:

```bash
openclaw skill install https://github.com/synap-app/openclaw-skill/blob/main/SKILL.md
```

This skill transforms OpenClaw's AI into a **Synap-aware agent**:
- Teaches it to read/write Synap workspace data via Hub Protocol
- Teaches it to relay channel events back to Synap (lightweight, HTTP-based, no persistent bridge)
- Routes proposals through Synap's governance inbox
- Enables workspace context in every conversation

### What the Skill Does

```
┌─────────────────────────────────────────────────────┐
│               synap-os SKILL                         │
│                                                      │
│  1. SYSTEM PROMPT INJECTION                          │
│     "You have access to a Synap workspace at         │
│      {SYNAP_POD_URL}. Use Hub Protocol tools to      │
│      read/write workspace data. When creating or     │
│      modifying workspace data, always call           │
│      synap_propose() first and wait for approval."   │
│                                                      │
│  2. ENV VARS (user sets once)                        │
│     SYNAP_POD_URL       = https://pod.synap.live     │
│     SYNAP_HUB_API_KEY   = hub_xxxx                   │
│     SYNAP_WORKSPACE_ID  = uuid                       │
│                                                      │
│  3. TOOL SHIMS (via shell calls to Hub Protocol API) │
│     synap_search(query)                              │
│     synap_get_entity(id)                             │
│     synap_create_entity(...) → proposes              │
│     synap_create_document(...) → proposes            │
│     synap_relay_message(channelId, content)          │
│     synap_propose(action, data, reasoning)           │
└─────────────────────────────────────────────────────┘
```

### SKILL.md Structure (draft)

```yaml
---
name: synap-os
description: >
  Connect OpenClaw to your Synap workspace. Gives the agent
  access to your entities, documents, and views — and routes
  all workspace actions through Synap's governance inbox.
version: 1.0.0
metadata:
  openclaw:
    requires:
      env:
        - SYNAP_POD_URL
        - SYNAP_HUB_API_KEY
        - SYNAP_WORKSPACE_ID
    primaryEnv: SYNAP_HUB_API_KEY
    homepage: https://synap.live/openclaw
user-invocable: false
disable-model-invocation: false
---

# Synap OS Integration

You are connected to a Synap workspace. Synap is an OS-like workspace
for knowledge and data intelligence. Your role is to act as an agent
that bridges the user's conversations and external context into Synap.

## Data Access

You can read workspace data via HTTP calls to the Hub Protocol API:

- Search entities: GET {SYNAP_POD_URL}/trpc/hubProtocol.search.entities
- Get entity: GET {SYNAP_POD_URL}/trpc/hubProtocol.entities.get
- List documents: GET {SYNAP_POD_URL}/trpc/hubProtocol.documents.list
- Get channel context: GET {SYNAP_POD_URL}/trpc/hubProtocol.context.getThread

Always pass: Authorization: Bearer {SYNAP_HUB_API_KEY}

## Creating or Modifying Workspace Data

IMPORTANT: Never create or modify workspace data without going through
the governance system. Always call the proposal endpoint first:

POST {SYNAP_POD_URL}/trpc/hubProtocol.proposals.create
{
  "userId": "{SYNAP_USER_ID}",
  "workspaceId": "{SYNAP_WORKSPACE_ID}",
  "subjectType": "entity" | "document" | "channel",
  "action": "create" | "update" | "delete",
  "data": { ... },
  "reasoning": "Explain why you want to do this"
}

Then inform the user: "I've submitted a proposal to create [X].
You can approve it in your Synap inbox."

## Message Relay

When a message arrives on an external channel (WhatsApp, Telegram, etc.)
that you want to sync to Synap, call:

POST {SYNAP_POD_URL}/api/bridge/openclaw/event
Authorization: Bearer {SYNAP_HUB_API_KEY}
{
  "event": "message.inbound",
  "channel": "whatsapp" | "telegram" | ...,
  "externalChannelId": "phone_or_chat_id",
  "from": "display_name_or_handle",
  "body": "message text",
  "timestamp": "ISO8601"
}

This creates or updates an EXTERNAL_IMPORT channel in Synap.

## Proactive Workspace Updates

When you complete an action that creates useful knowledge (research,
analysis, extracted information), always offer to save it to Synap:
"I found X — would you like me to propose saving this to your Synap workspace?"
```

### What This Phase Unlocks (without new backend code)

| Before skill | After skill |
|-------------|-------------|
| OpenClaw AI isolated from Synap data | OpenClaw AI can search + read all workspace data |
| No governance for OpenClaw actions | All OpenClaw write actions go through Synap proposals |
| No channel sync | OpenClaw relays messages to Synap via single HTTP call |
| No context injection | Workspace entities/docs can be referenced in OpenClaw conversations |

### What It Doesn't Solve (needs Tier 2)

- **Two-way relay**: The skill can push messages TO Synap, but Synap can't automatically push responses BACK to the external platform. That still requires the webhook bridge.
- **Real-time sync**: The relay is HTTP-triggered by OpenClaw, not a persistent subscription. If OpenClaw is offline, messages don't flow.
- **Outbound message delivery**: Synap's AI replying in an EXTERNAL_IMPORT channel still can't deliver the reply to WhatsApp without Tier 2.

### The Skill as a Stepping Stone

Phase 1.5 has a second strategic value: it **defines the event contract** between OpenClaw and Synap before building the bridge. The `POST /api/bridge/openclaw/event` endpoint the skill calls is the exact same endpoint Tier 2 will implement properly. So:

- Phase 1.5: Build the endpoint stub (minimal: receive event, create/update channel, save message)
- Phase 2: Harden it (HMAC, retry, idempotency) + add outbound relay

The skill becomes the integration spec. Users in Phase 1.5 test the event flow manually; Phase 2 makes it automatic and production-grade.

---

## 5. Personalization Depth

### Per-User Configuration Layers

OpenClaw is deeply personalizable. Here's what maps to Synap:

**Layer 1 — Model choice** (already in Synap)
Users choose Claude vs. GPT-4 vs. Gemini. OpenClaw supports all via `model` field. Synap intelligence settings → OpenClaw agent config.

**Layer 2 — Agent personality** (Tier 1.5)
OpenClaw supports `IDENTITY.md` (personality) and `SOUL.md` (values). With the Synap skill, the agent personality can be configured from Synap's Agent settings → written to OpenClaw's config via Hub Protocol.

**Layer 3 — Skill set** (Tier 1)
Users install skills from ClawHub. With Synap integration, the Skills section in `AgentDetailView` shows installed OpenClaw skills alongside Synap-native skills. Compatibility badge: `[OpenClaw]` vs `[Synap]` vs `[Both]`.

**Layer 4 — Channel routing** (Tier 2)
Users configure which external channels (specific WhatsApp contacts, Telegram groups) flow into Synap. Granular: "Import messages from Alice but not from family group."

**Layer 5 — Governance rules** (Tier 3)
Per-workspace `autoApproveFor` controls which OpenClaw tool calls are automatic vs. require approval. Power users can auto-approve shell; cautious users require approval for everything.

**Layer 6 — Memory architecture** (Tier 1.5+)
OpenClaw has local persistent memory. Synap has workspace entities/documents. Bridge: OpenClaw memories that matter → proposed as Synap entities. Synap entities → injected as OpenClaw memory at session start via the skill.

---

## 6. Intelligence Service Comparison

### Synap Intelligence Hub vs. OpenClaw

| Dimension | Synap Intelligence Hub | OpenClaw |
|-----------|----------------------|---------|
| **Hosting** | Cloud (Synap-managed) | Self-hosted (user's machine/VPS) |
| **Privacy** | Data passes through Synap infra | Data never leaves user's machine |
| **Tools** | Hub Protocol tools (Synap workspace) | 25 native tools (shell, fs, browser, cron…) |
| **Messaging** | Synap channels only | 13+ external platforms |
| **Skills** | AGENTS.md / Synap commands | SKILL.md / ClawHub 5,700+ |
| **Memory** | Synap entities/documents | Local disk + Synap (via skill) |
| **Governance** | Built-in proposals/approval | Via Synap skill (Tier 1.5+) |
| **Multi-agent** | Branching / parallel threads | Sessions + sessions_spawn |
| **Proactive** | No (reactive only) | Cron + heartbeats |
| **Cost** | Included in Synap plan | User pays API costs directly |
| **Setup** | Zero (built-in) | Docker + QR scan + config |
| **Reliability** | 99.9% SLA (Synap-managed) | Depends on user's infra |

### Complementary, Not Competing

The key insight: **these are complementary**. Synap IS excels at workspace intelligence — understanding entities, documents, relationships, governance. OpenClaw excels at external world interface — messaging channels, local tool execution, persistent personal memory.

The ideal architecture:
```
Synap Intelligence Hub — "The Workspace Brain"
  - Knows your entities, docs, views
  - Runs governance on data writes
  - Handles workspace-native AI (threads, branches, proposals)

OpenClaw — "The World Interface"
  - Connects to your messaging platforms
  - Executes local tools (shell, browser, files)
  - Maintains personal memory and personality
  - Routes results back to Synap workspace
```

Neither replaces the other. OpenClaw becomes the sensory/motor layer; Synap IS remains the cognitive/knowledge layer.

---

## 7. The Coupling Question

**How tightly should OpenClaw be coupled to Synap?**

### Option A — Loose Coupling (OpenClaw as Registered Service)
OpenClaw is one of many possible intelligence services. It registers like any other service. Synap knows nothing special about OpenClaw — it just calls `/v1/chat/completions`. Users who want deeper integration install the Synap skill manually.

**Pro**: Minimal vendor lock-in either direction. Any service that speaks OpenAI-compatible API works.
**Con**: No automatic skill distribution, no automatic bridge setup, no deep telemetry.

### Option B — Privileged Integration (OpenClaw as First-Class Partner)
Synap ships a "Connect OpenClaw" wizard that auto-configures the OpenClaw instance (installs Synap skill, sets up webhook, generates API keys). OpenClaw gets dedicated UI in the Services tab.

**Pro**: Frictionless setup. Synap can offer managed OpenClaw hosting. Clear marketing story.
**Con**: Governance risk — creator joined OpenAI, foundation still forming. Tight coupling to a project with uncertain governance.

### Option C — Synap as the OpenClaw Brain
Synap provides the LLM and governance; OpenClaw provides the tools and channels. OpenClaw configured with Synap IS as its model endpoint. The agent running in OpenClaw IS the Synap agent — it just uses OpenClaw for tool execution and messaging.

**Pro**: Single AI identity, consistent personality, full governance, best of both worlds.
**Con**: Requires latency-tolerant architecture (every tool call goes Synap→OpenClaw→Synap→model→Synap→OpenClaw).

### Recommendation

**Start with Option A** (Tier 1 + Tier 1.5). Validate that users actually want this. If strong demand, invest in Option B (dedicated wizard). If the architecture proves sound, explore Option C as a long-term vision.

The governance risk of OpenAI acquisition is **manageable** — OpenClaw is MIT licensed, the codebase is public, the community is large. Even if the foundation stumbles, a fork would survive. But it's a reason to maintain protocol-level decoupling (speak OpenAI-compatible API, not OpenClaw-specific API).

---

## 8. Proposed Phased Roadmap

```
Phase 1 — OpenClaw as Intelligence Service          ~1-2 days
─────────────────────────────────────────────────────────────
• Verify /v1/chat/completions compatibility
• Map Synap channelId → OpenClaw session key
• Test OpenClaw skills appearing in Synap AI responses
• Document setup: register URL + gateway token in settings
• Result: Users can use OpenClaw AI in Synap channels

Phase 1.5 — Synap OS Skill                         ~3-4 days
─────────────────────────────────────────────────────────────
• Create SKILL.md file published on GitHub
• Build POST /api/bridge/openclaw/event stub
  (receive event → find/create EXTERNAL_IMPORT channel → save message)
• OpenClaw AI can now read Synap workspace data via Hub Protocol
• OpenClaw relays external messages to Synap on demand
• Proposals from OpenClaw flow through Synap inbox
• No webhook receiver hardening yet — manual/on-demand only
• Result: OpenClaw becomes Synap-aware. Two-way data flow possible.

Phase 2 — Production Webhook Bridge                ~3-5 days
─────────────────────────────────────────────────────────────
• Harden /api/bridge/openclaw/event (HMAC, rate limiting, retry)
• Outbound relay: EXTERNAL_IMPORT AI response → OpenClaw → platform
• EXTERNAL_IMPORT channel UI (source badge, participants, platform icon)
• "Connect OpenClaw" setup wizard in Services tab
• Result: Unified inbox. External messages flow seamlessly.

Phase 3 — MCP Tool Access                          ~1 day
─────────────────────────────────────────────────────────────
• Create/integrate openclaw-mcp server
• Wire as default MCP server when OpenClaw service registered
• Map OpenClaw tool groups to Synap governance levels
• Result: Synap AI can act in the world (governed tool calls).

Phase 4 — Deep Personalization                     ~3-4 days
─────────────────────────────────────────────────────────────
• Skill compatibility badges in AgentDetailView
• Memory bridge: important OpenClaw memories → Synap entities (proposed)
• Channel routing rules (which contacts/groups → which workspace)
• Per-workspace tool governance configuration UI
• Agent personality sync (Synap agent config → OpenClaw IDENTITY.md)
• Result: Fully personalized, deeply integrated agent ecosystem.
```

---

## 9. The One-Line Summary of Each Phase

| Phase | What changes for the user |
|-------|--------------------------|
| 1 | "My Synap AI is now powered by my OpenClaw instance with all its tools" |
| 1.5 | "My OpenClaw assistant knows my Synap workspace and routes important things back automatically" |
| 2 | "My WhatsApp and Telegram messages appear in Synap — and my AI responds to them" |
| 3 | "My Synap AI can send messages, run scripts, and browse the web — with my approval" |
| 4 | "My agent has my personality, my memory, and my routing rules — it's truly mine" |

---

## 10. Decision Checklist

Before starting Phase 2 (bridge), answer:

- [ ] Do we want to support user-hosted OpenClaw only, or offer managed OpenClaw hosting?
- [ ] WhatsApp policy: support (at user's risk) or Telegram-first only?
- [ ] Is Phase 1.5 skill approach sufficient to validate demand before building the bridge?
- [ ] Should the Synap skill be Synap-maintained or community-contributed?
- [ ] Option A / B / C coupling preference confirmed?
- [ ] Foundation governance: acceptable risk for Phase 2 deep coupling?

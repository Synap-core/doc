# OpenClaw Integration Guide

> Internal reference for Synap engineers. Last updated: 2026-02-27.

---

## 1. What Is OpenClaw?

OpenClaw (formerly Clawdbot → Moltbot) is an open-source, self-hosted AI agent runtime. It runs as a **single Node.js process** on any machine (Docker, VPS, Mac, Raspberry Pi), connects to messaging platforms, and executes AI-driven agent loops with tool access to files, shell, browser, and more.

- **GitHub**: https://github.com/openclaw/openclaw
- **Docs**: https://docs.openclaw.ai
- **Stars**: ~236k (Feb 2026)
- **License**: MIT
- **Governance**: Creator Peter Steinberger joined OpenAI Feb 14, 2026. Project moving to an open-source foundation backed by OpenAI. Will remain open source. Foundation governance still forming.

### Key Identifiers
| Name | What it means |
|------|---------------|
| **Gateway** | The always-on WebSocket + HTTP server (default port 18789) |
| **Agent Runtime** | The AI loop: context assembly → model call → tool execution → state persistence |
| **Session** | A conversation context with its own message history, model settings, tool state |
| **Session Key** | Encoded routing string (channel + account + agent ID) — identifies which session handles a message |
| **Skill** | A `SKILL.md` file that injects instructions / tool metadata into the agent system prompt |
| **Channel** | A messaging platform connector (WhatsApp, Telegram, Slack, etc.) |
| **Plugin** | A TypeScript/JavaScript Gateway extension (deep hooks, new tools) |

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────┐
│                  OpenClaw Gateway                     │
│  (Node.js process · localhost:18789 · WS + HTTP)      │
│                                                       │
│  ┌─────────────┐    ┌──────────────┐                 │
│  │  Channels   │    │  HTTP API    │                 │
│  │  WhatsApp   │    │  /v1/chat/   │                 │
│  │  Telegram   │    │  completions │                 │
│  │  Slack ...  │    │  /webhook/.. │                 │
│  └──────┬──────┘    └──────┬───────┘                 │
│         │                  │                         │
│  ┌──────▼──────────────────▼───────┐                 │
│  │            Router               │                 │
│  │  access control → session key   │                 │
│  │  → agent dispatch               │                 │
│  └─────────────┬───────────────────┘                 │
│                │                                     │
│  ┌─────────────▼───────────────────┐                 │
│  │         Agent Runtime           │                 │
│  │  1. Assemble context (memory,   │                 │
│  │     session history, skills)    │                 │
│  │  2. Call model (Anthropic, OAI) │                 │
│  │  3. Execute tools               │                 │
│  │  4. Persist state to disk       │                 │
│  └─────────────────────────────────┘                 │
│                                                       │
│  ~/.openclaw/          ~/openclaw/workspace/          │
│  config, sessions,     files the agent can touch      │
│  API keys, skills                                     │
└──────────────────────────────────────────────────────┘
```

### Hub-and-Spoke Communication
All clients (macOS app, web UI, CLI, iOS/Android nodes, external backends) connect to the Gateway as **WebSocket nodes**. The handshake declares role and scope:
```
Client → connect frame
Gateway → hello-ok snapshot { presence, health, state, uptime, rate_limits }
```

---

## 3. HTTP API

OpenClaw multiplexes HTTP and WebSocket on the same port.

### OpenAI-Compatible Chat Completions
```
POST http://localhost:18789/v1/chat/completions
Authorization: Bearer <gateway_token>
Content-Type: application/json

{
  "model": "openclaw",          // or "openclaw:<agentId>" for specific agent
  "messages": [{ "role": "user", "content": "..." }],
  "stream": true
}
```

Headers for advanced routing:
- `x-openclaw-agent-id` — route to specific agent
- `x-openclaw-session-key` — fully control session routing (enables persistent conversations)

**Important limitation**: The HTTP endpoint is stateless by default (new session key per call). Session management commands (`/new`, `/status`, `/compact`) sent via HTTP are treated as plain text — they don't go through the CommandAuthorized dispatch chain. This is a documented limitation (GitHub issue #20934).

### Inbound Webhooks
```
POST http://localhost:18789/webhook/<name>
Authorization: Bearer <shared_secret>
Content-Type: application/json

{ ...any JSON payload... }
```
OpenClaw turns the POST body into an agent run or wake event. The agent receives the payload and decides what to do. Configured in `openclaw.json`:
```json
{
  "webhooks": {
    "my-synap-bridge": {
      "enabled": true,
      "secret": "...",
      "sessionKey": "global"
    }
  }
}
```

---

## 4. Messaging Channels (13+)

| Channel | Connection method | Bidirectional? | Notes |
|---------|------------------|----------------|-------|
| **WhatsApp** | QR scan (Baileys lib, WhatsApp Web protocol) | ✅ | No Business API needed. Linked device flow. Fragile — WA may reject. |
| **Telegram** | BotFather bot token | ✅ | Most reliable, free, instant setup |
| **Slack** | OAuth app token | ✅ | Full RTM + Events API |
| **Discord** | Bot token | ✅ | |
| **iMessage** | BlueBubbles server (macOS required) | ✅ | Requires Mac mini or similar |
| **Signal** | signal-cli | ✅ | Community-supported |
| **Teams** | Azure Bot registration | ✅ | |
| **SMS** | Twilio / Vonage | ✅ | Outbound only on some providers |
| **Email (Gmail/IMAP)** | Gmail API or IMAP | ✅ | |
| **macOS app** | Native | ✅ | |
| **Web UI** | WebSocket to Gateway | ✅ | Built-in |
| **CLI** | `openclaw chat` | ✅ | |
| **Webhook (inbound)** | HTTP POST | → agent only | External → agent trigger |

For **WhatsApp**: OpenClaw uses [Baileys](https://github.com/WhiskeySockets/Baileys) — a TypeScript library that speaks the WhatsApp Web multi-device API. Session credentials stored locally in `~/.openclaw/`. QR scanning required per instance. This is an unofficial API — Meta periodically bans accounts using it.

For **Telegram**: Official Bot API. Set up a bot via @BotFather → get token → paste into config. Most stable integration.

---

## 5. Tools (25 native)

| Tool | Group | What it does |
|------|-------|-------------|
| `shell` | Runtime | Run shell commands in workspace |
| `read` | Filesystem | Read file contents |
| `write` | Filesystem | Write/create files |
| `edit` | Filesystem | Apply targeted edits |
| `grep` | Filesystem | Search file contents |
| `find` | Filesystem | Find files by glob |
| `ls` | Filesystem | List directory |
| `apply_patch` | Filesystem | Apply multi-file patches |
| `process` | Runtime | Manage background exec sessions (list/poll/log/write/kill) |
| `browser` | Browser | Control Playwright-managed browser (accessibility tree, no vision needed) |
| `canvas` | Canvas | Drive A2UI canvas — present HTML, eval JS, snapshot |
| `image` | Vision | Analyze images with vision model |
| `sessions_list` | Session | List active sessions with metadata |
| `sessions_history` | Session | Inspect transcript history |
| `sessions_send` | Session | Send message to another session |
| `sessions_spawn` | Session | Spawn sub-agent session |
| `cron` | Automation | Manage recurring cron jobs and wakeups |
| `nodes` | Devices | Discover paired nodes, send notifications, camera/screen capture |
| `message` | Communication | Send messages to channels |
| `gateway` | Gateway | Restart/update the running Gateway process |
| `web_search` | Search | Keyword search (Brave/Tavily/Perplexity/Exa) |
| `web_fetch` | Search | Fetch and extract web page content |
| `agents_list` | Session | List available agent IDs |
| `memory_*` | Memory | Read/write persistent memory |
| `skills_*` | Skills | Manage/invoke installed skills |

**Sandboxed mode** disables: filesystem writes + shell access (safe for untrusted environments).

---

## 6. Skills System

A **skill** is a directory containing a `SKILL.md` file:
```
my-skill/
  SKILL.md        ← YAML frontmatter + markdown instructions
  README.md       ← (optional) documentation
```

### SKILL.md Format
```yaml
---
name: my-skill
description: What this skill does.
version: 1.0.0
metadata:
  openclaw:
    requires:
      env:
        - TODOIST_API_KEY
      bins:
        - curl
    primaryEnv: TODOIST_API_KEY
    homepage: https://example.com
user-invocable: true          # Show as /slash-command
disable-model-invocation: false  # Exclude from system prompt
---

# My Skill

When the user asks to manage tasks via Todoist, use the API key from env
TODOIST_API_KEY to call the Todoist REST API...

[detailed instructions for the model]
```

### Installation
```bash
# From ClawHub (5,700+ community skills)
openclaw skill install <skill-name>

# From URL (GitHub gist, raw URL)
openclaw skill install https://github.com/user/repo/blob/main/SKILL.md

# From local path
openclaw skill install ./my-skill
```

Skills install into `<workspace>/skills/` and are injected into the agent system prompt on next session.

### Compatibility with Synap AGENTS.md
OpenClaw SKILL.md format (YAML frontmatter + markdown) is **compatible** with Synap's AGENTS.md convention. Supporting `SKILL.md` directly gives Synap users access to the 5,700+ ClawHub community skills.

---

## 7. MCP Support

OpenClaw has **full MCP client support** — it can use any MCP server as tools.

### Configure MCP servers in openclaw.json
```json
{
  "agents": [{
    "mcpServers": {
      "postgres": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-postgres", "postgresql://..."]
      },
      "filesystem": {
        "command": "npx",
        "args": ["-y", "@modelcontextprotocol/server-filesystem", "/home/user/"]
      }
    }
  }]
}
```
Transport: `stdio` (OpenClaw spawns MCP server as child process, JSON-RPC 2.0 over stdin/stdout). HTTP/SSE transport also supported.

### OpenClaw as MCP Server
There is a community project `freema/openclaw-mcp` that exposes OpenClaw as an MCP server — allowing Claude.ai, Cursor, or any MCP client to call OpenClaw tools (send WhatsApp messages, trigger sessions, etc.).

---

## 8. Configuration (openclaw.json)

Located at `~/.openclaw/openclaw.json`. Supports comments and trailing commas.

```json
{
  "agents": [
    {
      "id": "default",
      "workspace": "~/openclaw/workspace",
      "model": "anthropic/claude-sonnet-4-6",
      "heartbeat": "30m",
      "mcpServers": { ... }
    }
  ],
  "channels": {
    "telegram": {
      "enabled": true,
      "botToken": "...",
      "dmPolicy": "allowAll",
      "allowFrom": ["+1234567890"]
    },
    "whatsapp": {
      "enabled": true,
      "allowFrom": ["+1234567890"]
    }
  },
  "webhooks": {
    "synap-bridge": {
      "enabled": true,
      "secret": "..."
    }
  },
  "gateway": {
    "port": 18789,
    "host": "127.0.0.1",
    "http": {
      "endpoints": {
        "chatCompletions": { "enabled": true }
      }
    }
  }
}
```

---

## 9. ZeroClaw vs OpenClaw

| | OpenClaw | ZeroClaw |
|--|---------|---------|
| **Language** | Node.js / TypeScript | Rust |
| **Binary** | `npm install -g openclaw` (~100MB) | 3.4MB static binary |
| **Cold start** | ~2s | <10ms |
| **Memory** | ~150MB | <5MB |
| **Skill format** | SKILL.md (YAML + markdown) | SKILL.toml |
| **Migration** | N/A | `zeroclaw migrate openclaw` (reads OC config/memory) |
| **Extensibility** | Skills (markdown) + Plugins (TypeScript) | Skills (TOML) + Rust crates |
| **Channel ecosystem** | 13+ native channels | Fewer, community-built |
| **MCP** | Full client support | Partial |
| **Use case** | Personal assistant, messaging agent, developer tool | Edge deployment, IoT, resource-constrained |
| **Governance** | OpenAI-backed foundation | Independent (zeroclaw-labs) |

**Recommendation**: Use OpenClaw for everything until ZeroClaw has a stable foundation and richer channel ecosystem. ZeroClaw is only relevant for edge/IoT deployment scenarios.

---

## 10. Integration Patterns with Synap

### Option A — OpenClaw as an Intelligence Service ⭐ (Recommended first step)

Register a user's OpenClaw instance as an intelligence service in Synap. AI conversations in `ai_thread` / `branch` channels route to OpenClaw via its `/v1/chat/completions` endpoint instead of (or alongside) Synap Intelligence Hub.

```
User types in Synap channel
  → Backend: resolveIntelligenceService() → OpenClaw endpoint
  → POST http://openclaw-host:18789/v1/chat/completions
  → Streamed response → Synap message saved
```

**What this unlocks:**
- OpenClaw's 25 native tools available in AI conversations
- OpenClaw skills + ClawHub library in Synap
- User's custom agent config and memory

**What this does NOT solve:**
- External platform messages (WhatsApp/Telegram) don't sync into Synap
- No reverse: Synap AI can't send WhatsApp messages without Option C

**Implementation cost:** ~1-2 days (service already registered via `@synap/agent-service`; just need to confirm protocol compatibility and session key passing)

---

### Option B — Webhook Bridge (External Messages → Synap Channels) ⭐ (Recommended second step)

A lightweight bridge (can be a Synap Backend route or a separate microservice) that:
1. Receives inbound events from OpenClaw webhooks
2. Maps them to Synap `EXTERNAL_IMPORT` channels
3. Syncs messages in both directions

```
WhatsApp message → OpenClaw Gateway
  → OpenClaw webhook fires → POST /api/bridge/openclaw-event
  → Synap Backend: find or create EXTERNAL_IMPORT channel
  → Save message (role: HUMAN, author: external participant)
  → (optional) Trigger AI response in that channel

Synap AI responds in EXTERNAL_IMPORT channel
  → Backend: detect channel type === EXTERNAL_IMPORT && externalSource
  → POST http://openclaw-host:18789/v1/chat/completions with routing header
  → OpenClaw sends reply to original platform
```

**Architecture:**

```
OpenClaw Gateway (user's machine / cloud)
  │
  │  POST /api/bridge/openclaw/event  ← webhook
  ▼
Synap Backend (/api/bridge/openclaw)
  │  finds/creates EXTERNAL_IMPORT channel
  │  saves message
  ▼
Synap channel (EXTERNAL_IMPORT, externalSource: "whatsapp")
  │  AI auto-responds (channel triggers AI)
  ▼
Synap AI response → Backend detects EXTERNAL_IMPORT
  │  calls OpenClaw /v1/chat/completions with channel context
  ▼
OpenClaw → delivers reply to WhatsApp/Telegram
```

**Config needed on OpenClaw side** (user configures once):
```json
{
  "webhooks": {
    "synap": {
      "enabled": true,
      "secret": "<hub-protocol-api-key>",
      "sessionKey": "global",
      "url": "https://pod.synap.live/api/bridge/openclaw/event"
    }
  }
}
```

**Implementation cost:** ~3-5 days
- New `synap-backend` route: `POST /api/bridge/openclaw/event`
- Message normalization layer (OpenClaw event → Synap message schema)
- Outbound relay: detect EXTERNAL_IMPORT response → POST to OpenClaw
- Frontend: EXTERNAL_IMPORT channel UI (render participants, source badge)

---

### Option C — MCP Integration (Synap AI calls OpenClaw tools)

Wire OpenClaw into Synap Intelligence Hub as an MCP server. The AI inside Synap can then call OpenClaw tools directly: `send_whatsapp_message`, `run_browser`, `execute_shell`, etc.

This is **not** a full channel sync — it's about giving Synap's AI access to OpenClaw's tool capabilities.

```
User: "Send a WhatsApp message to Alice saying I'll be late"
  → Synap Intelligence Hub
  → MCP call: openclaw.message({ channel: "whatsapp", to: "+1...", text: "..." })
  → OpenClaw executes
  → returns { status: "sent" }
```

Can be combined with Synap governance: `message.send` → `checkPermissionOrPropose` → user approves in inbox.

**Setup**: Add `openclaw-mcp` (or a custom MCP server that wraps OpenClaw's HTTP API) to the workspace MCP config. Synap already injects workspace MCP servers into agent context.

**Implementation cost:** ~1 day (MCP infrastructure already exists in Synap; just need an OpenClaw MCP server that wraps its REST API)

---

### Option D — Direct WebSocket Connection (Advanced / Real-time)

For maximum real-time fidelity: maintain a persistent WebSocket connection from Synap Backend to the user's OpenClaw Gateway. Subscribe to all events. No polling.

```
Synap Backend → WS connect to OpenClaw Gateway
  → declare role: "bridge-client"
  → receive all message events in real-time
  → fanout to Synap channels
```

**When to use**: When webhook latency is unacceptable (e.g., live agent conversations that need <500ms sync). More complex to operate (manage WS reconnect, auth).

**Implementation cost:** ~5-7 days

---

## 11. Current Synap Channel State

### What's Complete ✅
- Full DB schema: `EXTERNAL_IMPORT` channel type with `externalSource`, `externalChannelId`, `externalParticipants` columns
- Governance: `hub-protocol.channels.createExternalChannel` — proposes channel creation via `checkPermissionOrPropose` (action: `create_external_import`)
- Proposal approval: `proposals.approve` handler creates actual channel via `channels.createExternalChannel`
- AI_THREAD + BRANCH: Full AI loop, streaming, branching, context items
- ENTITY_COMMENTS + DOCUMENT_REVIEW: Comment channels, no AI trigger
- Frontend: ChannelsTab → ChatWorkspace (works for all channel types once channel exists)
- Service registry: `@synap/agent-service` has OpenClaw in WELL_KNOWN_SERVICES

### What's Partial ⚠️
- `EXTERNAL_IMPORT` channels: Created via proposal but then sit empty (no message sync)
- Webhook infrastructure: Generic `webhooks.create` exists, but no platform-specific receivers
- Intelligence service routing: 4-level cascade exists, but OpenClaw endpoint protocol unverified

### What's Missing ❌
- Inbound webhook receiver for OpenClaw bridge events
- Message normalization (OpenClaw event schema → Synap message schema)
- Outbound relay (Synap AI response → OpenClaw for delivery to external platform)
- EXTERNAL_IMPORT channel UI (show external source badge, participant info, platform icon)
- `view_discussion` channel: type exists in schema, no UI
- `direct` channel: type exists in schema, no UI

---

## 12. Recommended Implementation Roadmap

### Phase 1 — OpenClaw as Intelligence Service (1-2 days)
Goal: Users can point Synap at their OpenClaw instance for AI conversations.

1. Verify `/v1/chat/completions` compatibility (auth token, streaming format, SSE events)
2. Add `sessionKey` passing via `x-openclaw-session-key` header (maps to Synap `channelId`)
3. Test OpenClaw skills appearing in AI responses
4. Document setup steps (register OpenClaw URL + gateway token in intelligence settings)

### Phase 2 — Webhook Bridge (3-5 days)
Goal: WhatsApp/Telegram/Slack messages from OpenClaw appear as Synap channels.

1. New backend route: `POST /api/bridge/openclaw/event`
   - Verify HMAC signature (shared secret = hub-protocol API key)
   - Map OpenClaw event to Synap message: `{ channel, from, body, timestamp }`
   - Find or create `EXTERNAL_IMPORT` channel (`externalSource` + `externalChannelId`)
   - Save message to DB, emit socket event
2. Outbound relay in `channels.sendMessage`: detect `EXTERNAL_IMPORT` → POST to OpenClaw
3. `@synap/agent-service` provision flow: "Connect OpenClaw" wizard guides user to paste their webhook secret + gateway URL

### Phase 3 — MCP Tool Access (1 day)
Goal: Synap AI can call OpenClaw tools (send messages, run shell, browse).

1. Create minimal MCP server wrapping OpenClaw HTTP API (or use community `openclaw-mcp`)
2. Add to default MCP servers when OpenClaw service is registered
3. Governance: `message.send` tool goes through `checkPermissionOrPropose`

### Phase 4 — Rich External Channel UI (2-3 days)
Goal: EXTERNAL_IMPORT channels look native in Synap.

1. Platform icon + source badge in channel header
2. External participant display (phone number / handle with platform icon)
3. Channel filter: "External" shows all EXTERNAL_IMPORT channels grouped by source
4. Read status sync (if platform supports it)

---

## 13. Key Questions to Resolve

1. **Hosting model**: Is OpenClaw user-hosted (user runs Docker on VPS) or does Synap offer managed OpenClaw instances? Managed = more seamless UX but more ops work.

2. **Auth between Synap and OpenClaw**: The gateway token is sensitive. Should Synap store it encrypted per workspace (like hub-protocol API key), or should the bridge be on the user's own network?

3. **WhatsApp ToS**: Baileys uses the unofficial WhatsApp Web API. Using it in a production service (not just personal use) may violate WhatsApp ToS. Consider: (a) only supporting Telegram + Slack first, (b) pushing users toward WhatsApp Business API (meta-approved but requires business verification + paid), (c) accepting the risk for personal-use deployments.

4. **Session continuity**: OpenClaw sessions are keyed by channel. When Synap creates a session for an EXTERNAL_IMPORT channel, how do we ensure the same session key is used on the OpenClaw side for consistency?

5. **Skill compatibility**: Can OpenClaw skills that rely on the OpenClaw tool set (shell, browser, etc.) run inside Synap Intelligence Hub if the hub doesn't have those tools? Need to define a compatibility layer / `compatibleWith` metadata.

---

## 14. OpenClaw Resources

- **Docs**: https://docs.openclaw.ai
- **GitHub**: https://github.com/openclaw/openclaw
- **DeepWiki (architecture)**: https://deepwiki.com/openclaw/openclaw
- **ClawHub (skill registry)**: https://github.com/openclaw/clawhub
- **Awesome OpenClaw skills**: https://github.com/VoltAgent/awesome-openclaw-skills
- **OpenClaw MCP server**: https://github.com/freema/openclaw-mcp
- **n8n integration**: https://www.npmjs.com/package/n8n-nodes-openclaw
- **Architecture deep dive**: https://theagentstack.substack.com/p/openclaw-architecture-part-1-control
- **Governance/OpenAI post**: https://steipete.me/posts/2026/openclaw

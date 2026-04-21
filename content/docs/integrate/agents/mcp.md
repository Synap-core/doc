---
title: 'MCP'
description: >-
  The Model Context Protocol endpoint at /mcp. JSON-RPC over HTTP, stdio-ready,
  exposes synap_* tools to any MCP-capable client (Claude Desktop, Cursor, …).
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
sidebar_position: null
hide_title: false
toc: true
---

# MCP — Model Context Protocol

Synap exposes an [MCP](https://modelcontextprotocol.io/) server at `{pod}/mcp`. Any MCP-capable client — Claude Desktop, Cursor, custom agents — can connect and invoke Synap tools directly.

MCP is the direct-tool-call alternative to skills. Where skills teach the AI *how* to use Synap via markdown, MCP gives the AI a typed function-call interface. Both are governed the same way — writes go through `checkPermissionOrPropose()`.

---

## Endpoint

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/mcp` | Capabilities manifest (no auth required — used for discovery) |
| `POST` | `/mcp` | JSON-RPC 2.0 endpoint for tool calls and resource reads |

Transport: HTTP with JSON-RPC 2.0 payloads. Single request/response — stateless.

Auth: `Authorization: Bearer {apiKey}` with scopes `mcp.read` + `mcp.write`.

Source: [`packages/api/src/routers/mcp/`](https://github.com/Synap-core/backend/tree/main/packages/api/src/routers/mcp).

---

## Exposed tools

A compact set focused on high-value operations:

| Tool | Purpose |
|---|---|
| `synap_search` | Unified keyword search across all entities |
| `synap_search_entities` | Filtered search by profile, properties, date |
| `synap_create_entity` | Create an entity with properties and links |
| `synap_update_entity` | Patch properties or title of an existing entity |
| `synap_create_relation` | Link two entities with a typed relation |
| `synap_get_entity` | Fetch one entity by id, optionally with connections |
| `synap_recall_memory` | Keyword search on stored facts |
| `synap_store_memory` | Save a fact as plain text |
| `synap_send_to_channel` | Post a message to a Synap channel |

These are curated — not a 1:1 mirror of Hub Protocol's 76+ endpoints. For the full surface (profile creation, view generation, capture pipeline), use the [Hub Protocol REST API](../integrations/sdk-direct) directly or install the [skills](./skills).

---

## Connecting

### Claude Desktop

```json
{
  "mcpServers": {
    "synap": {
      "url": "https://YOUR_POD.synap.live/mcp",
      "headers": {
        "Authorization": "Bearer sk_live_..."
      }
    }
  }
}
```

Full guide: [Claude Desktop setup](./connect/claude-desktop).

### Cursor

```json
{
  "mcpServers": {
    "synap": {
      "url": "https://YOUR_POD.synap.live/mcp",
      "headers": {
        "Authorization": "Bearer sk_live_..."
      }
    }
  }
}
```

Full guide: [Cursor setup](./connect/cursor).

### Custom MCP client

If you're building a client, follow the [MCP spec](https://spec.modelcontextprotocol.io/). Minimal flow:

```bash
# 1. Fetch the manifest
curl https://YOUR_POD.synap.live/mcp

# 2. Call a tool via JSON-RPC
curl -X POST https://YOUR_POD.synap.live/mcp \
  -H "Authorization: Bearer sk_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "synap_search",
      "arguments": { "query": "Q2 plan" }
    }
  }'
```

---

## Stdio transport (legacy clients)

Older MCP clients expect stdio — a subprocess the client spawns and communicates with via stdin/stdout. The pod exposes HTTP/JSON-RPC natively, so stdio-only clients need a small local bridge:

```json
{
  "mcpServers": {
    "synap": {
      "command": "npx",
      "args": ["-y", "@synap-core/mcp-server", "--pod", "https://YOUR_POD.synap.live"],
      "env": { "SYNAP_HUB_API_KEY": "sk_live_..." }
    }
  }
}
```

The `@synap-core/mcp-server` bridge translates stdio MCP messages into HTTP calls against the pod's `/mcp` endpoint.

---

## Governance

Every tool call passes through the same proposal system as every other surface:

- `synap_search`, `synap_get_entity`, `synap_recall_memory` — always auto-approved (reads)
- `synap_create_entity`, `synap_update_entity`, `synap_create_relation`, `synap_store_memory`, `synap_send_to_channel` — auto-approved when the action is in the workspace's whitelist; otherwise returns `proposed` with a `proposalId`

An MCP `tool call` with status `proposed` is not an error. The client should surface "queued for review" to the user. The actual write happens asynchronously when the user approves.

See the [governance model](../../architecture/security/governance) for the full decision tree.

---

## Rate limits

The pod enforces rate limits per API key (`checkHubRateLimit(keyId, "mcp")`). Limits depend on pod tier. A 429 response means you've hit the limit — back off and retry later.

---

## MCP vs. skills — which to use

**Use skills when:**
- The user wants the AI to reason about Synap ("should I create a new profile or extend an existing one?")
- You want the AI to read instructions, not just invoke tools
- The client supports Agent Skills (Claude Code, Claude Desktop, OpenClaw)

**Use MCP when:**
- You want direct, typed, fast tool calls with no extra token cost
- The client supports MCP but not Agent Skills (Cursor, some custom agents)
- You only need the curated high-value operations (not the full Hub Protocol surface)

Use **both** on clients that support both (Claude Desktop) — skills teach the model, MCP lets it act fast.

---

## Continue

- [Connect your AI](./connect) — per-client install guides
- [Skills architecture](./skills) — what each skill teaches
- [Hub Protocol REST](../integrations/sdk-direct) — the full API surface behind MCP and skills
- [API keys](../integrations/api-keys) — `mcp.read` / `mcp.write` scopes

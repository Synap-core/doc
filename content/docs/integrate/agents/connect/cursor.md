---
title: 'Cursor'
description: >-
  Connect Cursor to your Synap pod via MCP. The synap tool set appears in
  agent mode — Claude inside Cursor can read, write, and search your pod.
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
sidebar_position: 3
hide_title: false
toc: true
---

# Cursor

Cursor's agent mode supports MCP. Add Synap as an MCP server and Cursor's AI can invoke Synap tools inside any chat or edit session — useful when you want the pod's knowledge graph accessible from the same editor you're coding in.

**What you get:** `synap_search`, `synap_create_entity`, `synap_recall_memory`, and 6+ other tools appear in Cursor's tool picker whenever you're in agent mode. Fast, typed, governed.

---

## The short path

```bash
npx @synap-core/cli connect --target=cursor
```

The CLI provisions an API key and writes `~/.cursor/mcp.json`. Restart Cursor — the tools appear.

---

## The manual path

### 1. Provision an API key

[Same as Claude Code](./claude-code#the-manual-path). Scopes required: `mcp.read`, `mcp.write`.

### 2. Write the MCP config

Edit `~/.cursor/mcp.json` (create it if missing):

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

For project-local setup, use `.cursor/mcp.json` inside your project root — that config takes precedence over the global one.

Restart Cursor. Open any chat with agent mode enabled — the `synap` tools appear in the tool picker.

---

## Verify it works

In Cursor agent chat:

> "Using synap, find anything I've noted about this project in my pod."

The agent should invoke `synap_search` (or `synap_search_entities` with a profile filter), fetch results, and incorporate them into its response.

---

## What you can't do yet

Cursor doesn't read Anthropic Agent Skills — only MCP. That means:

- Cursor's AI has **MCP tools** (direct access) but no **skill instructions** (the mental model).
- It'll call `synap_create_entity` correctly for tasks and notes, but may miss patterns like "always link on creation" that the `synap` skill teaches.

Workaround: the project's `.cursor/rules/` file can include a short Synap usage guide. Copy the "Linking — the core principle" section from `synap-backend/skills/synap/SKILL.md` into `.cursor/rules/synap.mdc` and the agent will read it on every session.

---

## Troubleshooting

**Tools don't appear.** Verify `~/.cursor/mcp.json` parses as valid JSON (`cat ~/.cursor/mcp.json | jq .`). Restart Cursor fully.

**"MCP server failed to connect."** Check pod reachability (`curl https://YOUR_POD.synap.live/health`). Verify the key has `mcp.read` + `mcp.write` scopes.

**Agent mode not available.** Cursor's agent mode requires a recent version. Update Cursor, or use Chat mode with the MCP tools manually referenced.

---

## Next steps

- [MCP endpoint reference](../mcp)
- [Claude Desktop](./claude-desktop) — if you want skills + MCP in the same ecosystem
- [API keys](../../integrations/api-keys)

---
title: 'Claude Desktop'
description: >-
  Connect Claude Desktop to your Synap pod. MCP tools via stdio bridge +
  skills uploaded to claude.ai (which sync to Desktop).
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
sidebar_position: 2
hide_title: false
toc: true
---

# Claude Desktop

Claude Desktop uses two separate systems:

- **MCP tools** — configured locally via `claude_desktop_config.json`. Stdio-only transport (no native HTTP/URL support). We use the `mcp-remote` bridge to translate stdio → HTTPS against the pod's `/mcp` endpoint.
- **Agent Skills** — sync from your claude.ai account. **Claude Desktop does not read local skill folders.** You upload skills at claude.ai once; they appear in Desktop on next sync.

Don't confuse Claude Desktop with Claude Code. Claude Code reads `~/.claude/skills/` directly — see the [Claude Code guide](./claude-code).

---

## The short path

```bash
npx @synap-core/cli connect --target=claude-desktop
```

The CLI:
1. Provisions a Hub Protocol API key
2. Writes a `synap` MCP server entry to `claude_desktop_config.json` using the `mcp-remote` stdio bridge
3. Prints instructions to upload skills to claude.ai (skills are not installed locally for Desktop)

After the CLI finishes, **fully quit Claude Desktop** (Cmd+Q, not just close window) and relaunch. The `synap` tool set appears under the tools icon.

---

## The manual path

### 1. Provision an API key

Either via Synap's admin panel (browser) or via `POST /api/hub/setup/agent` on the pod. You need a key with scopes `hub-protocol.read`, `hub-protocol.write`, `mcp.read`, `mcp.write`.

### 2. Write the MCP config

Open `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) and add:

```json
{
  "mcpServers": {
    "synap": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://YOUR_POD.synap.live/mcp",
        "--header",
        "Authorization: Bearer sk_live_..."
      ]
    }
  }
}
```

Platform paths for the config file:

| Platform | Path |
|---|---|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |
| Linux | `~/.config/Claude/claude_desktop_config.json` |

**Why the `mcp-remote` bridge?** Claude Desktop's `claude_desktop_config.json` schema is stdio-only — `command` / `args` / `env`. Entries with `url` and `headers` at the top level are silently ignored. The community-maintained `mcp-remote` package is a stdio-to-HTTPS bridge that translates between the two. Every "HTTP MCP in Claude Desktop" tutorial uses it.

Reference: [mcp-remote on npm](https://www.npmjs.com/package/mcp-remote)

### 3. Fully quit + restart Claude Desktop

Cmd+Q to fully quit (or "Quit Claude" from the menu bar). Don't just close the window — the app keeps running in the dock. Relaunch. The `synap` MCP server spawns as a subprocess; the `mcp-remote` bridge connects to your pod.

---

## Why there's no "skill install" step

Claude Desktop's skill system is **synced from claude.ai** (the web account), not read from a local folder. This is a deliberate difference from Claude Code.

If you want the Synap skills in Claude Desktop:

1. Open [claude.ai](https://claude.ai)
2. Navigate to **Settings → Skills → Upload skill**
3. Upload each of the three skill directories:
   - `synap` (core data operations)
   - `synap-schema` (extend the data model)
   - `synap-ui` (build views and dashboards)
4. On next Claude Desktop launch, the skills sync automatically

The skill files ship as `.zip` directories containing `SKILL.md` + references. If you've already run `synap connect --target=claude-code`, they're at `~/.claude/skills/synap/` etc. — zip those folders and upload.

Alternative: just use MCP tools. The MCP server gives Claude direct access to Synap's core operations (`synap_search`, `synap_create_entity`, `synap_store_memory`, etc.) without needing the skills. Skills add richer context and workflow guidance, but aren't strictly required.

---

## Verify it works

After restart, in any new chat:

1. Click the MCP tools icon under the input box. You should see `synap` with its tool list.
2. Try: *"Using synap, what's in my pod?"* — Claude invokes `synap_search` or similar.
3. Try: *"Create a task to review the Q2 plan by Friday."* — Claude invokes `synap_create_entity`. Response includes the proposal URL if the write is governance-gated.

---

## Troubleshooting

**"No synap server appears in the tools panel."**
- Check `~/Library/Logs/Claude/mcp.log` and `~/Library/Logs/Claude/mcp-server-synap.log` (macOS). `tail -f` them while restarting.
- Validate the JSON: `jq . "$HOME/Library/Application Support/Claude/claude_desktop_config.json"`. A parse error silently drops the entire `mcpServers` block.
- Did you **fully quit** Claude Desktop? Closing the window doesn't do it.

**"mcp-remote: command not found" or PATH errors.**
macOS GUI apps don't inherit your shell's PATH. `npx` may not be reachable. Two fixes:
- **Use absolute path:** replace `"command": "npx"` with `"command": "/opt/homebrew/bin/npx"` (Apple Silicon) or `"command": "/usr/local/bin/npx"` (Intel). Check with `which npx`.
- **Add PATH to env:** add `"env": { "PATH": "/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin" }` to the server entry.

**"Tool calls return 401 Unauthorized."** The API key scope is wrong (or expired). Regenerate via `synap connect --target=claude-desktop` or the admin panel.

**"I uploaded skills to claude.ai but don't see them in Desktop."** Give it a few minutes — sync is not instant. If still missing, sign out and back in to Claude Desktop.

---

## What this is NOT

- **Not a desktop extension (`.mcpb`).** That's a different install mechanism — one-click double-clickable plugin files. We haven't shipped a `.mcpb` for Synap yet; the CLI flow above is the current path.
- **Not a custom connector.** That's a cloud-side MCP server Anthropic calls on your behalf. Requires OAuth on the pod's `/mcp` endpoint — planned, not yet built.
- **Not the same as Claude Code.** Claude Code reads local skills from `~/.claude/skills/` and has its own MCP config mechanism. See the [Claude Code guide](./claude-code).

---

## Continue

- [Claude Code](./claude-code) — if you want local skill install (the filesystem path)
- [MCP endpoint reference](../mcp) — what the `/mcp` endpoint exposes
- [API keys](../../integrations/api-keys) — scope reference
- [mcp-remote docs](https://www.npmjs.com/package/mcp-remote) — the stdio bridge package

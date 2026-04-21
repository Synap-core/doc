---
title: 'Claude Code'
description: >-
  Connect Claude Code to your Synap data pod in three steps. Skills auto-load
  on launch so Claude can search, write, link, and capture directly.
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
sidebar_position: 1
hide_title: false
toc: true
---

# Claude Code

Connect the Claude Code CLI to your Synap pod. Uses [Anthropic Agent Skills](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview) — three markdown-based skills (`synap`, `synap-schema`, `synap-ui`) drop into `~/.claude/skills/` and Claude auto-discovers them.

**What you get:** Claude can read, write, link, and search every entity in your pod. Extend the schema on demand ("I need a podcast episode type"). Build views and dashboards ("make me a reading-list gallery"). Every mutation is governed — writes outside the auto-approve whitelist queue for your review.

---

## The short path

```bash
npx @synap-core/cli connect --target=claude-code
```

The CLI will:
1. Ask for your pod URL and provision an API key (or accept an existing one)
2. Copy `synap/`, `synap-schema/`, `synap-ui/` into `~/.claude/skills/`
3. Print the shell env vars to export

Add the printed `export` lines to your shell rc (`~/.zshrc`, `~/.bashrc`), open a new terminal, and launch `claude` — the three skills show up automatically.

---

## The manual path

### 1. Provision an API key

Two options.

**Via the Synap app:**
1. Open **Settings → API Keys → New Key**
2. Name it "Claude Code"
3. Select scopes: `hub-protocol.read`, `hub-protocol.write`, `mcp.read`, `mcp.write`
4. Copy the key once — it's only shown at creation time

**Via the pod provisioning endpoint** (self-hosted):
```bash
curl -X POST https://YOUR_POD.synap.live/api/hub/setup/agent \
  -H "Authorization: Bearer $SYNAP_PROVISIONING_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"agentType": "claude-code"}'
```

Response includes `hubApiKey`, `agentUserId`, `workspaceId`. Save them.

### 2. Install the skills

Skills live in `synap-backend/skills/` in the repo. Clone or download just that folder, then:

```bash
mkdir -p ~/.claude/skills
cp -r path/to/synap-backend/skills/synap         ~/.claude/skills/
cp -r path/to/synap-backend/skills/synap-schema  ~/.claude/skills/
cp -r path/to/synap-backend/skills/synap-ui      ~/.claude/skills/
```

Each skill is self-contained: `SKILL.md` + references + optional `scripts/`. The `orient.sh` helper in `synap/scripts/` needs execute permission (`chmod +x`).

### 3. Export the credentials

Add to your shell rc:
```bash
export SYNAP_POD_URL="https://YOUR_POD.synap.live"
export SYNAP_HUB_API_KEY="sk_live_..."
export SYNAP_WORKSPACE_ID="ws_..."      # optional — defaults to first workspace
export SYNAP_AGENT_USER_ID="usr_..."    # optional
```

Reload your shell, then run `claude`.

---

## Verify it works

In a fresh Claude Code session, try:

> "What's in my Synap pod? Give me an overview."

Claude should trigger the `synap` skill, run `scripts/orient.sh` (three API calls), and summarize. If the skill doesn't fire, check `~/.claude/skills/synap/SKILL.md` exists and Claude Code was restarted.

Try a write:

> "Create a task: review the Q2 plan by Friday."

Claude will use the `synap` skill to `POST /api/hub/entities` with `profileSlug: "task"`. The response will be either `approved` (auto-whitelisted) or `proposed` (queued for your review).

---

## What each skill covers

| Skill | When it fires | What it does |
|---|---|---|
| `synap` | "save this", "find X", "remind me", "who is Y" | CRUD on entities, memory, documents, links |
| `synap-schema` | "I need a type for X", "add a field to tasks" | Create profiles, property defs, overlays |
| `synap-ui` | "build me a dashboard", "make a kanban" | Generate views, bentos, workspace proposals |

You can install just `synap` (read-write) and skip the others — each is optional. See the [skills architecture](../skills) for the full model.

---

## Troubleshooting

**Skills don't appear.** Claude Code reads `~/.claude/skills/` on launch. Close and reopen the terminal session (or restart the `claude` process). Verify the path: `ls ~/.claude/skills/synap/SKILL.md`.

**Every write becomes a proposal.** Your agent user is in a workspace where `aiGovernance.forceProposals = true`, or destructive-action detection fires. See [governance](../../../architecture/security/governance).

**API key invalid.** Check the scope. Claude Code needs `hub-protocol.read` AND `hub-protocol.write` — the write scope is required even for `GET /channels/personal` because that route does get-or-create.

**Orient script fails.** Verify `SYNAP_POD_URL` doesn't have a trailing slash. Run manually: `bash ~/.claude/skills/synap/scripts/orient.sh` — the output should be a single JSON line.

---

## Next steps

- [Skills architecture](../skills) — the three-skill split and progressive disclosure
- [API keys](../../integrations/api-keys) — scope reference, rotation
- [Claude Desktop](./claude-desktop) — add MCP support alongside skills

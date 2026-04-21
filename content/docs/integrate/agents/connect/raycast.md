---
title: 'Raycast'
description: >-
  Install the Synap Raycast extension and let Raycast AI use your pod as
  memory — 9 typed tools accessible from any Raycast AI conversation.
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
sidebar_position: 4
hide_title: false
toc: true
---

# Raycast

The [Synap Raycast extension](https://www.raycast.com/synap) adds Synap to Raycast AI with nine typed tools — search, create, store memory, send messages to channels, and more. Unlike Claude Code or Cursor, Raycast uses its own tool framework (not skills, not MCP), so the extension bundles everything.

**What you get:**
- `search-entities` — unified search by keyword or profile
- `create-entity` — create a note/task/person/event directly from Raycast
- `store-memory` / `recall-memory` — ask Raycast AI to remember or recall a fact
- `get-tasks` — filter tasks by status/due date
- `get-recent` — recently touched entities
- `update-entity`, `get-entity` — full CRUD
- `send-to-channel` — post to a Synap channel

---

## Install

### 1. Install the extension

Open Raycast, search for the "Synap" extension, and install it from the Raycast Store.

(If the extension hasn't shipped in the store yet, you can install it in developer mode from the source — see [`synap-raycast`](https://github.com/Synap-core/synap-raycast) on GitHub.)

### 2. Provision an API key

Open the Synap app → **Settings → API Keys → New Key**. Name it "Raycast". Scopes: `hub-protocol.read`, `hub-protocol.write`.

Copy the key (shown only once).

### 3. Paste preferences

In Raycast: **Settings → Extensions → Synap → Preferences**:

- **Pod URL** — `https://YOUR_POD.synap.live` (or your local pod URL)
- **Hub API Key** — the key you just created
- **Workspace ID** — optional, defaults to your first workspace

### Or via the CLI

```bash
npx @synap-core/cli connect --target=raycast
```

The CLI provisions the key and prints the exact values to paste into Raycast preferences. It can't auto-fill them (Raycast stores preferences internally), but it saves you a round trip to the Synap app.

---

## Verify it works

Open Raycast and start an AI chat. Try:

> "Search Synap for anything about the Q2 plan."

Raycast AI should invoke the `search-entities` tool and return results. Try a write:

> "Create a task: review the marketing deck by Friday."

Raycast AI invokes `create-entity` with `profileSlug: "task"`.

---

## Using extension commands directly (without AI)

The extension ships six direct commands you can invoke from the Raycast root:

- **Search Synap** — query across your pod
- **Quick Capture** — create a note from a single input
- **Create Task** — structured task form
- **Menu Bar** — pod status in the menu bar
- **Connect** — reconfigure pod URL + API key
- **Browser Capture** — save the current browser tab as an entity

These work without Raycast AI — useful for users who just want keyboard-speed capture without LLM involvement.

---

## Troubleshooting

**"Extension is not connected to Synap."** Open the extension preferences and verify the pod URL + API key. The URL must start with `http://` or `https://` and must NOT end with a trailing slash.

**Tools don't appear in Raycast AI.** Raycast AI only surfaces tools from extensions the user has enabled. Open Raycast → Settings → Extensions → Synap → toggle "Enable tools".

**"Tool call denied."** Check that the key has both `hub-protocol.read` and `hub-protocol.write` scopes — the extension's tools cover both reads and writes.

**Pod URL changes.** Run `synap connect --target=raycast` again (or manually update preferences) to get the new URL into the extension.

---

## What this isn't

The Raycast extension does NOT install skills or register as an MCP client. Raycast has its own tool framework that's independent of those standards. If you want the same AI to use Synap across Raycast AI, Claude Code, AND Claude Desktop, install each separately — each reads from its own place.

---

## Next steps

- [Claude Code](./claude-code) — for CLI-first AI workflows
- [API keys](../../integrations/api-keys) — scope reference
- [Synap Raycast source](https://github.com/Synap-core/synap-raycast) — extension code, issue tracker

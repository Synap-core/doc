---
title: 'OpenClaw'
description: >-
  Connect OpenClaw to your Synap pod. Full agent runtime with skills, channels,
  and governance via Hub Protocol.
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
sidebar_position: 5
hide_title: false
toc: true
---

# OpenClaw

OpenClaw is a self-hosted AI agent runtime. Synap provides OpenClaw with:
- a data pod (entities, documents, memory, governance)
- the three Synap skills (`synap`, `synap-schema`, `synap-ui`)
- an OpenAI-compatible AI provider (via `synap/auto` model routing)

The connection path: **OpenClaw agent → Hub Protocol (`/api/hub/*`) → Synap pod**. OpenClaw never writes to the database directly — it goes through API keys and governance just like every other surface.

---

## The short path

```bash
npx @synap-core/cli init
```

This is the end-to-end onboarding flow:
1. Detects existing OpenClaw (or starts a fresh instance via Docker)
2. Runs a security audit
3. Provisions a pod connection (managed or self-hosted)
4. Installs the three Synap skills
5. Wires the Synap IS as an AI provider (optional)

Full details: [`synap-cli/src/commands/init.ts`](https://github.com/Synap-core/synap-cli/blob/main/src/commands/init.ts).

---

## Already have OpenClaw + pod? Just connect

```bash
npx @synap-core/cli connect --target=openclaw
```

This:
1. Asks for your pod URL
2. Provisions an agent key (or accepts an existing one)
3. Writes the pod connection to OpenClaw's config
4. Prints the install commands for each skill

After that, install the skills via OpenClaw's own CLI:

```bash
openclaw skills install synap
openclaw skills install synap-schema
openclaw skills install synap-ui
```

---

## The manual path

### 1. Create the agent user

On the pod (self-hosted):

```bash
curl -X POST https://YOUR_POD.synap.live/api/hub/setup/agent \
  -H "Authorization: Bearer $PROVISIONING_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"agentType": "openclaw"}'
```

Response:
```json
{
  "agentUserId": "usr_...",
  "workspaceId":  "ws_...",
  "hubApiKey":    "sk_live_...",
  "keyId":        "key_..."
}
```

On managed pods, use the Synap account's CP session token instead of a provisioning token — the CP relays the request for you.

### 2. Configure OpenClaw

Set the pod connection in OpenClaw's config (`~/openclaw/config.json` or equivalent):

```json
{
  "synap": {
    "podUrl":      "https://YOUR_POD.synap.live",
    "hubApiKey":   "sk_live_...",
    "workspaceId": "ws_...",
    "agentUserId": "usr_..."
  }
}
```

Or export env vars that OpenClaw picks up:
```bash
export SYNAP_POD_URL="https://YOUR_POD.synap.live"
export SYNAP_HUB_API_KEY="sk_live_..."
export SYNAP_WORKSPACE_ID="ws_..."
```

### 3. Install the skills

```bash
openclaw skills install synap
openclaw skills install synap-schema
openclaw skills install synap-ui
```

Skills live in the Synap backend repo at [`skills/`](https://github.com/Synap-core/backend/tree/main/skills). OpenClaw's `skills install` pulls from the registered source and stores them in its local skills directory.

---

## Using Synap IS as OpenClaw's AI provider

OpenClaw needs an LLM. By default it uses the user's Anthropic/OpenAI/Google key directly. You can route through Synap instead:

```bash
openclaw configure --provider anthropic \
  --key "$SYNAP_HUB_API_KEY" \
  --model "synap/auto" \
  --base-url "https://YOUR_POD.synap.live/v1"
```

The pod's `/v1/chat/completions` endpoint accepts OpenAI-format requests. Model aliases:
- `synap/auto` — four-tier smart routing
- `synap/free` — DeepSeek V3
- `synap/balanced` — Kimi K2.5
- `synap/advanced` — Claude Sonnet
- `synap/complex` — Claude Opus (with deep-analysis flag)

Full details: [OpenAI-compat endpoint](../../integrations/chat-stream).

---

## Security model

OpenClaw-to-Synap auth is bearer-token only. Every request sends `Authorization: Bearer {hubApiKey}`, and the pod enforces:

- **Scope check** — reads need `hub-protocol.read`, writes need `hub-protocol.write`
- **Agent identity** — the key binds to an agent user; writes are tagged with that user
- **Governance** — writes pass through `checkPermissionOrPropose()` against the workspace's auto-approve whitelist
- **Rate limits** — per pod tier, logged in audit history

OpenClaw itself has its own security layer (sandboxed filesystem, allow-listed commands). The [security audit](https://github.com/Synap-core/synap-cli/blob/main/src/commands/security-audit.ts) in the CLI verifies both sides are hardened before pairing.

---

## Verify it works

After connection, open OpenClaw's interface and ask:

> "What's in my Synap pod?"

OpenClaw invokes the `synap` skill → calls `/api/hub/users/me`, `/workspaces`, `/profiles` → summarizes.

---

## Troubleshooting

**"Synap skill not found."** Install it: `openclaw skills install synap`. Verify: `openclaw skills list`.

**"Hub Protocol request failed."** Check the scopes on the key and the pod's reachability: `curl https://YOUR_POD.synap.live/health`.

**AI provider errors when routing via Synap IS.** Verify the key has `chat.stream` scope. The IS enforces pod tier limits on token usage.

**Run the full diagnostic:**
```bash
npx @synap-core/cli status
```
Prints pod health, OpenClaw gateway status, skill inventory, and AI config.

---

## Next steps

- [Synap CLI reference](https://github.com/Synap-core/synap-cli) — full CLI command list
- [Skills architecture](../skills) — the three skills
- [OpenAI-compat endpoint](../../integrations/chat-stream) — chat stream details
- [Governance](../../../architecture/security/governance) — proposal flow

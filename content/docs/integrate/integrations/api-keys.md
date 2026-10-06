---
sidebar_position: 5
title: 'API Keys'
description: Create, scope, grant and revoke API keys for your pod
section: general
audience: users
version: 1.0+
last_updated: '2026-10-06'
tags: []
hide_title: false
toc: true
---

# API Keys

**Bearer tokens for apps, sites, scripts and AI agents that call your pod.**

A key answers two questions:

- **Which doors can it knock on?** That is its **scopes**, a coarse gate per API surface.
- **What can it touch once inside?** That is its **grant**, fine-grained: kinds, actions, workspaces, projects, or single objects.

A key can never do more than the person it acts for. Effective access is always *grant ∩ what you can see and do*.

---

## Creating a key

1. Open the Synap app and go to **Settings → API Keys**.
2. Click **New Key** and name it after what will use it (e.g. "Portfolio site", "n8n", "Claude Code").
3. Pick its scopes and, through the API (below), its grant and lifetime.
4. Click **Create**.

The key is shown **once**, so copy it immediately. Only a hash is stored.

To create one programmatically, use tRPC `apiKeys.create`:

```json
{
  "keyName": "Portfolio site",
  "scope": ["hub-protocol.read"],
  "expiresInDays": 90,
  "grant": {
    "permissions": ["entity.portfolio.read", "document.read"],
    "workspaceIds": ["<workspace id>"],
    "label": "Portfolio site"
  }
}
```

---

## Grants: what a key may touch

A grant is a list of **permissions** plus optional **resource sets**. Permissions use the same keys as Synap's governance events, with an optional **kind** in the middle:

```
<subject>[.<kind>].<action>
```

| Permission | Allows |
|---|---|
| `*` | everything you can do (an explicit full-access key) |
| `entity` | every action on every entity |
| `entity.knowledge` | every action on `knowledge` entities |
| `entity.knowledge.read` | reading `knowledge` entities only |
| `entity.*.read` or `entity.read` | reading every kind |
| `entity.*.create` | creating any kind |
| `document.read` | reading documents |
| `view.read`, `project.read`, `session.read` | reading views, projects, sessions |

Matching is segment by segment. `*` stands for one segment, and a shorter permission covers everything under it: `entity.knowledge` covers `entity.knowledge.read` and `entity.knowledge.update`. There is no partial-word wildcard.

**Resource sets** narrow further. Leave a set out for no narrowing on that axis.

| Field | Narrows to |
|---|---|
| `workspaceIds` | those workspaces |
| `projectIds` | objects filed in those projects |
| `entityIds` | those exact objects |

How it is enforced:

- **Reads** are filtered in the pod's access layer, so a key with `entity.portfolio.read` simply never sees other kinds.
- **Writes** are checked at the governance gate before anything else. A write outside the grant is **refused**, never queued for approval.
- A grant **permits**, it never auto-approves. Agent writes still go through proposals as usual.
- A write that creates related objects (links, files) needs those subjects in the grant too.
- A key with no grant keeps the older behaviour: its scopes plus everything you can see.

### Doors a scoped key can read through

A key whose grant is narrower than `*` can only **read** through doors whose reads the grant actually bounds. Every other read door answers `403 GRANT_DOOR_UNSUPPORTED`; doors are added as they are migrated. Writes are always allowed through to the governance gate, which applies the grant.

| Surface | Read doors open to scoped keys |
|---|---|
| Hub REST | `GET /users/{id}/entities`, `/entities/{id}`, `/entities/{id}/connections`, `/entities/{id}/facets`, `/documents/{id}`, `/documents/{id}/raw`, `/relations`, `/projects`, `/projects/{id}`, `/projects/{id}/digest`, `/projects/{id}/outputs`, `/tracks`, `/tracks/{id}`, `/views`, `/proposals`, `/channels`, `/threads`, `/threads/{id}/messages`, `/threads/{id}/branches`, `/messaging/channels`, `/messaging/linked-unread`, `/focus-sessions`, `/artifacts`, `/commands`, `/commands/{id}`, `/brand/kit` |
| MCP | `synap_get_entities`, `synap_get_document`, `synap_get_relations`, `synap_list_tracks`, `synap_resolve_identity`, `synap_get_project`, `synap_list_projects`, `synap_list_views` |
| tRPC | `entities.getEntities`, `documents.getDocument`, `relations.listRelations`, `relations.listRelationsPodWide`, `automations.listRuns`, `automations.getRun`, `commands.listCommands`, `commands.getCommand`, `views.listViews`, `proposals.listProposals` |

Search, `ask`, knowledge and memory, the object graph, events and runs are not open to scoped keys yet. A key that needs them must use the full-access `*` grant for now.

### Access roles: reusable grants

Save a grant under a name in **Settings → AI → Access roles**, or with **Save as role** in any access editor. The next key, app or agent can start from it.

- A role is a **template**. A key made from a role keeps what the role said at that moment. Editing the role later never changes an existing key.
- The key remembers which role it came from. Pass `grant.roleId` when minting through the API; it must be one of your own roles.
- Only you can create or change your roles. Your agents can list them but never edit them.

### Limiting an agent

An agent's **capabilities** use the same permission keys. In the agent's panel, the same editor limits what it may **change**, down to one kind (`entity.knowledge.update`). An agent can always **read** what you can read, so the read column is shown on and locked. Leaving every box unticked makes the agent read-only. It never reverts to full access.

---

## Lifetime

`expiresInDays` sets how long a key lives:

| Value | Lifetime |
|---|---|
| omitted | **90 days** (the default) |
| a number (1–36500) | that many days |
| `null` | **never expires**. Choose this deliberately. |

Rotating a CLI key keeps its remaining lifetime.

---

## Scopes: which surfaces a key can call

| Scope | Gate |
|---|---|
| `hub-protocol.read` / `hub-protocol.write` | the Hub REST API (`/api/hub/*`) and API-key tRPC calls |
| `mcp.read` / `mcp.write` | the MCP endpoint (`/mcp`) |
| `data.read` / `data.write` | aliases of `hub-protocol.*`, honoured on `/mcp` only |
| `skills.invoke` | `/api/external/skills` |
| `chat.stream` | `/api/external/chat` and the OpenAI-compatible endpoint |
| `read:entities` / `write:entities` / `ai:analyze` | the n8n integration routes |
| `realtime:observe` | read-only realtime subscriptions |
| `providers.write` | AI provider configuration (operator tools only) |

Older keys may still carry retired scopes (`preferences`, `notes`, `tasks`, …). No door ever checked them, and new keys cannot be minted with them.

---

## Workspace-bound keys

A key created for one workspace (from that workspace's settings, or with a `workspaceIds` grant) is **confined** to it. A request for another workspace is refused with `403`.

---

## Using a key

Pass it as a Bearer token:

```bash
curl https://YOUR_POD.synap.live/api/hub/entities \
  -H "Authorization: Bearer synap_hub_live_..."
```

---

## Seeing and revoking keys

**My connections** lists the keys you hold **and the keys your agents and apps hold for you**, and you can revoke either kind there. Each key shows what it may touch, e.g. "Read Portfolios, Documents · 1 Space". Revoking takes effect immediately: in-flight requests with that key get `401`.

---

## Security notes

- Keys are hashed at rest. The pod never stores the plaintext.
- An AI agent's key cannot mint keys for other agents, widen its own approval rules, or grant itself vault access. Those requests are refused or become proposals you approve.
- Keep keys in environment variables, one key per integration, with the smallest grant that works.

---

## Next steps

- [Connect AI to your pod: overview](./overview)
- [SDK and direct API](./sdk-direct)

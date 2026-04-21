---
title: 'Skills'
description: >-
  The three Synap skills — synap, synap-schema, synap-ui — plus how Agent
  Skills work, progressive disclosure, and file layout.
section: general
audience: users
version: 1.0+
last_updated: '2026-04-20'
tags: []
sidebar_position: null
hide_title: false
toc: true
---

# Skills

Synap ships three [Anthropic Agent Skills](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview). Each one teaches an AI how to use a slice of your pod. Together they cover the full surface: data, schema, UI.

Skills are markdown files (+ optional scripts). They drop into your AI's skills directory — `~/.claude/skills/` for Claude Code, `~/Library/Application Support/Claude/skills/` for Claude Desktop, OpenClaw's own skills dir, etc. The AI discovers them at startup and loads them progressively when they match the user's intent.

---

## The three skills

| Skill | Purpose | When it triggers |
|---|---|---|
| `synap` | Core data operations — read, write, link, search, remember | "save this", "find X", "remind me", "who is Y", "link A to B" |
| `synap-schema` | Extend the data model — new profiles, new properties | "I need a type for X", "add a field to tasks", "create a custom profile" |
| `synap-ui` | Build views, dashboards, bento layouts | "make a dashboard", "build a kanban", "create a CRM workspace" |

Install all three for the full experience. Each one fires only when the user's intent matches its description — so a data-fetch turn doesn't load the UI skill, and a UI-build turn doesn't load the schema skill.

---

## Progressive disclosure

Per Anthropic's spec, every skill has three loading levels:

**Level 1 — Metadata (always loaded, ~100 tokens per skill).** The YAML frontmatter (`name` + `description`). Determines whether the harness surfaces this skill to the model at all.

**Level 2 — SKILL.md body (loaded when triggered, ≤5k tokens).** The authoritative instructions. Concise, action-oriented, full of decision tables.

**Level 3 — References + scripts (loaded on demand).** Deeper docs the model reads only when the current task needs them. Scripts run via bash — their source never enters context.

Total always-on cost for all three Synap skills: ~300 tokens. The full content (~15k tokens across all files) only enters context when genuinely needed.

---

## File layout

```
skills/
├── synap/
│   ├── SKILL.md              ← core instructions (~3k tokens)
│   ├── linking.md            ← auto-sync + explicit relations reference
│   ├── governance.md         ← proposal semantics + whitelist
│   ├── capture.md            ← multi-entity capture pipeline
│   └── scripts/
│       └── orient.sh         ← deterministic startup: users/me + workspaces + profiles
│
├── synap-schema/
│   ├── SKILL.md              ← when to extend vs reuse, creation flow
│   └── property-types.md     ← valueType reference + scope layers
│
├── synap-ui/
│   ├── SKILL.md              ← workspace-as-lens, view creation, bento grammar
│   ├── view-types.md         ← the 12 implemented view types + configs
│   ├── widget-catalog.md     ← cells registry reference
│   └── bento-recipes.md      ← 7 ready-to-adapt layouts
│
└── README.md                 ← shared index
```

Source of truth in the repo: [`synap-backend/skills/`](https://github.com/Synap-core/backend/tree/main/skills).

---

## What each skill teaches

### `synap` — core data operations

Mental model: Synap is a typed knowledge graph. Never orphan entities — every create should link to another entity. Proposals aren't errors, they're queued human-review requests.

Endpoints the skill drives:
- `GET /api/hub/users/me`, `/workspaces`, `/profiles` (orient)
- `POST /api/hub/entities`, `PATCH /api/hub/entities/:id` (write)
- `POST /api/hub/relations`, `POST /api/hub/memory` (link, remember)
- `POST /api/hub/documents` (markdown attached to entities)
- `GET /api/hub/search`, `/api/hub/entities/:id/connections`, `/api/hub/graph/traverse` (read)
- `POST /api/hub/capture/structure` + `/execute` (multi-entity pipeline)

### `synap-schema` — extend the data model

Mental model: reuse before extending. 14 system profiles ship; check them first. When a new type is genuinely needed, prefer inheritance (`child parentProfileSlug: parent`) over new profiles. Workspace overlays let one profile have different fields in different workspaces without copying.

Endpoints:
- `POST /api/hub/profiles` (new profile)
- `POST /api/hub/property-defs` (new property — with `overlay: true` for workspace-scoped)
- `POST /api/hub/relation-defs` (typed relations)

### `synap-ui` — build interface

Mental model: emergent complexity. A workspace is a lens, a view is a lens, a bento is a composition of lenses. Always propose workspaces — never auto-create. Inventory widget registry first, never guess cell kinds.

Endpoints:
- `POST /api/hub/views` (any of the 12 view types, including `bento`)
- `POST /api/hub/views/:id/arrange` (bento layout)
- `POST /api/hub/workspaces` (through proposal — always gated)
- `GET /api/hub/widget-definitions` (discover available cells)

---

## Installing

Via CLI:
```bash
npx @synap-core/cli connect --target=claude-code
# or: claude-desktop, cursor, raycast, openclaw
```

Manually: copy `skills/synap`, `skills/synap-schema`, `skills/synap-ui` from the [backend repo](https://github.com/Synap-core/backend/tree/main/skills) into your AI's skills directory. See the [Connect your AI](./connect) guide for per-target paths.

---

## Reusing skills across AI surfaces

Skills are portable. A single skill directory works unchanged in:

- **OpenClaw** — reads the `metadata.openclaw` block for env requirements
- **Claude Code** (`~/.claude/skills/`)
- **Claude Desktop** (`~/Library/Application Support/Claude/skills/` or platform equivalent)
- **Cursor** — doesn't read Agent Skills natively; use MCP instead, or copy instructions into `.cursor/rules/`
- **Raycast** — uses its own tool framework; skills don't apply, but the Raycast extension covers the same surface

The OpenClaw-specific metadata is namespaced under `metadata.openclaw` so other harnesses ignore it cleanly.

---

## Continue

- [Connect your AI](./connect) — per-client install guides
- [MCP endpoint](./mcp) — the direct tool-call alternative
- [Governance](../../architecture/security/governance) — how the proposal layer enforces safety
- [Build agents](../development/ai/building-agents) — for fully custom agent runtimes

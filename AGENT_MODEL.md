# Synap Agent Model — Reference Specification

**Version:** 1.1
**Date:** March 2026
**Status:** Canonical — all implementation reads from this document

---

## 1. The Three Layers

Synap's architecture has three strictly separated layers. Features live in exactly one layer.

```
┌──────────────────────────────────────────────────────┐
│  FRONTEND  (Browser / Web)                           │
│  Renders data. Navigates workspaces. Approves        │
│  proposals. Configures agents. No AI logic.          │
└──────────────────────┬───────────────────────────────┘
                       │ tRPC / REST
┌──────────────────────▼───────────────────────────────┐
│  DATA POD  (Backend)                                 │
│  Stores everything. Enforces permissions. Records    │
│  the event chain. Runs proposals. Hub Protocol.      │
│  Does not know or care if writer is human or AI.     │
└──────────────────────┬───────────────────────────────┘
                       │ Hub Protocol (REST)
┌──────────────────────▼───────────────────────────────┐
│  INTELLIGENCE SERVICE  (Proprietary)                 │
│  Prompting. ReAct loop. Context assembly.            │
│  Memory compaction. Stateless — all persistence      │
│  goes through Hub Protocol to the pod.               │
└──────────────────────────────────────────────────────┘
```

**Rule:** The backend does not contain AI logic. The intelligence service does not persist its own state. The frontend does not contain business logic.

---

## 2. The Data Scope Model

Every entity, profile, and view in Synap has a **scope** that determines where it is visible and who can access it.

| Scope | Meaning | Example |
|-------|---------|---------|
| `system` | Pod-wide. Available in all workspaces. | "Person" base type shared everywhere |
| `shared` | Explicitly granted to N workspaces (join table). | "Project" type shared between personal + team WS |
| `workspace` | Scoped to exactly one workspace. | "Lead" type only in the CRM workspace |
| `user` | Scoped to one user across all their workspaces. | Personal knowledge facts |

This is a **first-class product concept**, not just an implementation detail. Users should understand and control it. The frontend should surface it clearly.

**Default for templates:** Profiles created from workspace templates default to `workspace` scope. Profiles promoted to pod-wide become `system` scope.

---

## 3. Agent Taxonomy

### 3.1 User-Scoped Personal Agent

One per user. Created when the user first activates their AI. This is "my AI."

**Characteristics:**
- Deeply tied to the user — not to any workspace
- Has a **single persistent memory** (5-block compacted state) that evolves over time
- Can express **multiple personalities** — same agent, different mode. One memory, one relationship.
- The user experiences one continuous AI that knows them across sessions, workspaces, and time
- Identified by: `userType: "agent"`, `agentMetadata.createdByUserId = user.id`, `agentMetadata.isPersonalAgent = true`

**Personality expressions:**
The personal agent can take on specialized roles (OCto, CMO, Analyst, etc.) for specific tasks or channels. These are **not separate agents** — they are the same agent with a role overlay applied to its system prompt and tool set. They share the same compacted state. From the data model perspective: one agent entity, different active configuration.

### 3.2 Independent Agents

Agents with independent existence — not expressions of the user's personal agent. These can be:

- **Personality agents from the intelligence service** (OCto as a standalone, etc.) — registered as their own agent entity, have their own memory if persistent
- **External agents** (OpenClaw, custom) — connected via Hub Protocol with an API key
- **Specialist agents** spawned for specific tasks — may be ephemeral (branch-lifetime) or persistent

**Characteristics:**
- Identified by: `userType: "agent"`, no `isPersonalAgent` flag (or `false`)
- Can optionally have `parentAgentId` — if set, this agent was derived from another agent and inherits base identity
- Scope: workspace-level, user-wide, or pod-wide (configurable)
- Communication with other agents: via A2AI channels, not shared workspace access

### 3.3 The Agent Registry

The intelligence service maintains a **catalog of available agents** the user can configure and talk to:

```
User's agent catalog:
├── Personal Agent (user-scoped, always present, default entry point)
│   ├── [Default personality]
│   ├── OCto (strategy/orchestration mode)
│   ├── CMO (content/communication mode)
│   └── [User-defined personalities]
│
├── Independent agents (configured by user)
│   ├── OpenClaw (external, hub-protocol)
│   ├── [Custom agents]
│   └── [Marketplace agents — future]
│
└── Ephemeral branch agents (spawned per-task, no persistent memory)
```

---

## 4. Agent Permissions

### 4.1 Core Rule

Agents use the **same RBAC system as users**. Same roles (owner / admin / member / viewer). Same workspace scoping. No separate permission primitives.

**The one default difference:**

```
Human (member role) → create entity → writes directly
Agent  (member role) → create entity → creates proposal → user approves
```

This is controlled by `agentMetadata.writesRequireProposal: boolean` (default: `true`).

### 4.2 Permission Matrix

| Action | User (any role) | Personal agent | Independent agent |
|--------|----------------|----------------|------------------|
| Read entities/docs | Per role | Same as user | Per role |
| Search / vector search | Per role | Pod-wide (same as user) | Per role |
| Create entity | Direct | Proposal (default) | Proposal (default) |
| Update entity | Direct | Proposal (default) | Proposal (default) |
| Delete entity | Per role | Proposal (always) | Proposal (always) |
| Create in own workspace* | Direct | Direct | Direct |
| Memory read/write | Per role | Always allowed | Per role |

*An agent's "own workspace" (if it has a dedicated staging workspace) is a workspace where the agent has owner/admin role.

### 4.3 Configuring Agent Permissions

Per-agent configuration (stored in `agent_configs` or workspace member metadata):

```typescript
interface AgentPermissionConfig {
  writesRequireProposal: boolean;      // default: true
  autoApproveFor: string[];            // glob patterns e.g. ["search.*", "entity.read", "memory.*"]
  // Inherits rest of RBAC from workspace membership role
}
```

The personal agent's default `autoApproveFor` is broader (it's trusted). External agents start with a narrow whitelist. All configurable by the user.

### 4.4 Agent Workspace — Optional Staging

Agents **do not require a dedicated workspace**. The workspace is optional staging — useful for research-heavy agents or when isolating draft work from the user's clean space.

Options for any agent:
- **No workspace** — operates in the user's workspace(s) via the proposal system. Clean, simple.
- **Dedicated workspace** — agent has owner/admin role. Direct writes (no proposals) within that workspace. User has read + admin-override capability.
- **Project workspace** — user-created scoped context. Agent is granted member/admin role as needed.

When a dedicated workspace exists, the agent's role in that workspace is what controls write behavior — not a special flag.

---

## 5. Branching

Branches are channels with `parentChannelId` set. Branch agents are ephemeral — they exist for the duration of the task.

**Branch identity:** Derived from the spawning agent's identity + a specialist role overlay. They do NOT have their own compacted states that persist after the branch completes — their output is synthesized back into the parent's compaction.

**Branch communication:** Via A2AI channels. Branches do not read each other's workspaces — they send structured messages through a shared channel.

**Branch completion:** Branch result is written to `channel.resultSummary`, parent is notified via system message, parent orchestrator synthesizes findings.

---

## 6. Data Model Additions Required

### 6.1 Users / Agent Users

```typescript
// Add to agentMetadata (JSONB on users table):
agentMetadata: {
  createdByUserId: string;         // which human this agent serves
  isPersonalAgent?: boolean;       // true = user-scoped personal agent
  parentAgentId?: string;          // if set = personality expression of another agent
  writesRequireProposal?: boolean; // default true; false = trusted agent
  activePersonality?: string;      // current personality mode (runtime, not persisted)
}
```

### 6.2 Workspaces

```typescript
// Already added (2026-03-06):
workspaceType?: "personal" | "agent" | "project" | "operational";
linkedAgentId?: string;   // which agent this workspace belongs to (if agent workspace)
```

### 6.3 Workspace Members (agents as members)

Agents are workspace members. The `workspaceMembers` join table already exists. Agent permissions within a workspace are controlled by their member role — same as users.

No new fields needed. The `writesRequireProposal` flag on the agent entity controls the global default; it can be overridden per-workspace by granting a higher role.

---

## 7. What Lives Where — Feature Map

| Feature | Backend (Pod) | Intelligence Service | Frontend |
|---------|--------------|---------------------|----------|
| Data scope (system/shared/ws/user) | Schema + enforcement | Reads scope when searching | Scope selector in UI |
| Agent user creation | `users` table | Calls hub protocol | Onboarding + settings |
| Agent workspace (optional) | Workspace CRUD | `ensureAgentWorkspace()` | Agent workspace panel |
| Permission enforcement | `permission-check.ts` | N/A (hub protocol enforces) | Proposal UI |
| Proposal creation | `proposals` schema | Tools trigger proposals | Proposal cards |
| Personal agent memory | `sessions` + `compacted_states` | Compaction engine | Memory inspector |
| Personality switching | N/A | `activePersonality` in context | Personality selector in chat |
| Branch spawn | Channel creation | `branch-manager.ts` | Branch cards |
| A2AI communication | Channel + message storage | `send_to_branch` tool | Branch side panel |
| Agent catalog | `intelligence_services` | Manifest registry | Agent settings UI |

---

*This document supersedes the agent architecture sections of the Phase 1 PRD for all architectural decisions. The PRD remains authoritative for implementation sequence and success metrics.*

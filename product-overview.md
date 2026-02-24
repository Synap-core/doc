# Synap — Product Overview

> For new team members and anyone writing copy for the landing page.
> Last updated: February 2026

---

## What is Synap?

Synap is a **self-hostable data intelligence workspace** — an OS-like environment where users capture, organize, and understand all their information, with AI that proposes rather than executes.

The core bet: people and organizations produce enormous amounts of structured and unstructured data — tasks, notes, emails, documents, decisions, relationships — scattered across dozens of tools with no common brain. Synap is that brain. It stores everything in a single open data model (PostgreSQL, fully self-hostable), makes it navigable through a dozen view types, and lets AI help without taking control away from the user.

**Three things that make it unusual:**

1. **You own the data.** A "pod" is a real backend instance running on your infrastructure (or Synap's). There is no SaaS database you can never export from.
2. **AI proposes, humans approve.** No AI agent ever directly writes to your data without a proposal that goes through an approval queue.
3. **Everything is an entity.** Tasks, documents, contacts, events, ideas, code snippets — they all share the same data model and can relate to each other, which means you can build cross-domain views the original tools never imagined.

---

## The Pod Architecture

The foundational concept is the **data pod**: a fully self-contained backend instance.

```
┌────────────────────────────────────────────┐
│                  Data Pod                  │
│  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │ tRPC API │  │ Realtime │  │  Jobs   │  │
│  │ (port    │  │ (Socket  │  │ (pg-    │  │
│  │  4000)   │  │  .IO /   │  │  boss)  │  │
│  └────┬─────┘  │  Yjs)    │  └────┬────┘  │
│       │        └────┬─────┘       │        │
│  ┌────▼─────────────▼─────────────▼──────┐ │
│  │            PostgreSQL                 │ │
│  │   entities · events · workspaces      │ │
│  │   documents · views · invites · ...   │ │
│  └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

Every pod is identical code (open source). Synap cloud simply provisions and operates the pod for you. Self-hosted pods use the same Docker images and behave identically.

### Cloud vs. Self-hosted

| | Synap Cloud | Self-hosted |
|--|-------------|-------------|
| Domain | `your-pod.synap.live` | `data.yourcompany.com` |
| Provisioning | One-click | Docker Compose |
| Backups | Automatic (daily, S3) | Your responsibility |
| Updates | Auto-pushed | `git pull && rebuild` |
| Intelligence service | Synap-managed (default) | Any Hub-compatible service |
| Privacy | Synap infra | 100% on your infra |
| Cost | Subscription tier | Your infra costs only |

### Control Plane

The **control plane** (`synap-control-plane-api`) is a thin coordination layer that:
- Provisions and manages cloud pods (DNS via Cloudflare, SSL via Let's Encrypt)
- Tracks subscriptions (Stripe)
- Sends transactional emails (Resend)
- Monitors pod health

Pods work independently even if the control plane is down. It is not a single point of failure.

---

## Entity System

Everything in Synap is an **Entity** — a universal data model that unifies tasks, notes, documents, contacts, events, ideas, and anything custom.

```typescript
Entity {
  id: UUID
  type: string            // determined by profile (task, note, project, ...)
  title: string
  preview: string
  properties: JSONB       // flexible metadata, schema-validated
  documentId: UUID        // rich-text or canvas content
  relationships: Relation[]
  version: number         // optimistic locking
}
```

### Entity Types (Profiles)

Profiles define what an entity is and what properties it has:

- **System profiles** (built-in): `task`, `note`, `project`, `contact`, `event`, `idea`, `meeting`
- **Workspace profiles**: custom types created by admins per workspace
- **User profiles**: personal entity types
- Profiles support **inheritance** — e.g., `webinar` extends `event`

### Property System

Properties are typed, constrained, and schema-validated:
- Types: `string`, `number`, `date`, `entity_id`, `array`, `object`
- Constraints: min/max, enum values, regex, format
- UI hints: label, icon, input type, placeholder
- Properties auto-detected from existing entities (no schema required to start)

### Knowledge Graph (Relationships)

Entities link to each other with typed, bidirectional edges:

```
Task "Close Q1" --[depends_on]--> Task "Board sign-off"
Document "Spec" --[mentions]--> Contact "Sarah"
Task "Write tests" --[belongs_to_project]--> Project "Backend refactor"
```

Built-in relation types: `assigned_to`, `mentions`, `links_to`, `parent_of`, `relates_to`, `depends_on`, `blocks`, `created_by`. Custom relation types are supported.

---

## Features

### Views — multiple ways to see the same data

All views query the same entities. Switching views never moves your data.

| View | Best for |
|------|----------|
| **Table** | Spreadsheet-style, sortable columns, inline edit |
| **Kanban** | Status-based boards with drag-and-drop |
| **List** | Simple linear list, fast scanning |
| **Grid** | Card grid, image-friendly |
| **Timeline** | Date-based chronological view |
| **Graph** | Node-link knowledge graph, explore relationships |
| **Whiteboard** | Freeform canvas (Tldraw), sticky notes, shapes |
| **Mindmap** | Hierarchical branching |

Views are configurable: custom filters, sorts, grouping, visible columns, column widths. Views can be **embedded inside other views** (e.g., a Kanban inside a document).

The **Field System** (`@synap/entity-card`) is the single source of truth for how any property renders across every view. Auto-detection scores field importance so views can pick smart defaults without configuration.

### Documents & Whiteboards

- **Rich text documents**: TipTap 3 (ProseMirror-based) — heading styles, tables, embeds, code blocks, mentions, comments
- **Whiteboards**: Tldraw 2.0 — freeform canvas, shapes, connectors, sticky notes, images
- Both support **real-time multi-user editing** (Yjs CRDTs, no merge conflicts)
- Every workspace gets a default whiteboard, auto-provisioned on first access

### Real-Time Collaboration

```
Frontend
  ├── Presence socket   (who's online, cursor positions, typing)
  └── Yjs socket        (document/whiteboard content, conflict-free)
          ↓
  Realtime Service (port 4001)
          ↓
  PostgreSQL + MinIO (persistence)
```

- **Yjs CRDTs**: structural conflict resolution — two users editing simultaneously always produces a valid merge
- **Presence**: live cursors, typing indicators, user avatars
- **Auto-save**: every 10 seconds during active editing; snapshot on last user disconnect
- **Offline support**: changes queue locally and sync on reconnect

### AI — Intelligence Hub

#### Built-in agents (Synap Intelligence Service)

15+ specialized agents built on Claude, orchestrated via a ReAct / LangGraph pattern:

| Agent | Role |
|-------|------|
| Orchestrator | Main reasoning, routes to sub-agents |
| Intent Analyzer | Extracts goals from free-form text |
| Entity Extractor | Auto-creates entities from documents or conversation |
| Researcher | Deep investigation and synthesis |
| Code Agent | Generate, explain, review code |
| Writing Agent | Drafts, rewrites, summarizes |
| Action Agent | Executes approved tasks |
| Knowledge Search | Semantic search across all entities |
| Meta Agent | Self-reflection, planning |

#### External AI (Hub Protocol)

Any external AI service can connect to a pod via the **Hub Protocol** — a standard OAuth2 API that gives AI controlled, scoped access:

```
External AI Service
  ↓  OAuth2 token (user-granted, scoped)
POST /search        → semantic search over user's entities
POST /retrieve/{id} → full entity + relationships
POST /propose       → suggest a change (creates a proposal)
```

The pod never lets external services write directly. They can only **propose**. The user approves.

#### Marketplace & custom skills

- **Marketplace**: community-built agents, one-click install, security-reviewed
- **Custom skills**: users write TypeScript tools that run inside the intelligence service, private to their workspace

#### AI Governance — the approval model

This is the core safety primitive:

```
AI wants to create an entity
  → publishes entities.create.requested event
  → if workspace.aiAutoApprove = false:
      → goes to approval queue
      → user reviews (approve / deny with reason)
  → if approved:
      → publishes entities.create.validated
      → worker commits the change
  → if denied:
      → proposal closed, nothing changes, reason recorded
```

`aiAutoApprove` is configurable per workspace and per action type. You can auto-approve low-stakes operations (add a tag) while requiring review for destructive ones (delete an entity).

### Inbox & External Data (Life Feed)

A unified inbox that pulls from connected sources:

- Gmail, Google Calendar, Slack (current integrations)
- Swipeable feed: archive, snooze, act
- Auto-processing: AI can suggest turning an email into a task entity (subject to approval)
- Deep links back to the original source

### Search

- **Full-text search**: PostgreSQL GIN indexes across all content
- **Semantic search**: vector embeddings, meaning-based retrieval
- **Property search**: filter by any property value
- Available globally (Cmd+K command palette) and per-view

### Commands & Keyboard Shortcuts

- **Command palette** (Cmd+K): universal entry point for any action
- **Slash commands** in documents: `/create task`, `/search`, `/table`
- **Custom commands**: workspace-level shortcuts for repeated actions
- **Keyboard bindings**: configurable per user

### Templates

Save any entity (or entity schema) as a template:
- Workspace-wide templates (shared by all members)
- Personal templates (private)
- Templates carry default property values, required fields, hidden fields
- Apply a template → new entity pre-populated, validated on creation

### Workspace Management

- **Multi-workspace**: personal / team / enterprise types
- **Roles**: Owner, Admin, Editor, Viewer
- **Invitations**: token-based invite links (7-day expiry, revocable)
- **Member management**: change roles, remove members, see join date
- **Intelligence service selection**: swap to a different AI backend per workspace

### API Keys & Webhooks

- Generate personal API keys for programmatic access
- Configure webhooks to push events to external URLs (Zapier, n8n, custom)
- Every event in the system is webhook-eligible

---

## Event Chain & Architecture

Synap is **event-sourced**. Every state change produces an immutable event before any database mutation happens.

### Event naming convention

```
{table}.{action}.{modifier}
e.g.:  entities.create.requested
       entities.create.validated
       workspaceMember.add.requested
```

- `requested` = intent has been declared, awaiting validation
- `validated` = validated and approved, about to be committed

54 event types auto-generated from schema (9 tables × 6 events). All fully typed via `@synap-core/types`.

### Full flow example (entity creation)

```
User fills form → clicks "Create Task"
  │
  ▼
trpc.entities.create (tRPC mutation)
  │
  ├─ checkPermissionOrPropose()
  │    ├─ If denied → throw FORBIDDEN
  │    └─ If approved → continue
  │
  ├─ WorkspaceRepository.create() → PostgreSQL
  │
  ├─ auditLog() → writes to events table
  │
  ├─ emitSideEffects() → pg-boss job queue
  │    ├─ Search indexer worker (update embeddings)
  │    ├─ Relation builder worker
  │    └─ Webhook dispatcher worker
  │
  └─ return entity to client
```

### Job system (pg-boss)

Background workers run in the same process as the API, scheduled via **pg-boss** (PostgreSQL-backed job queue):

- No separate Redis or broker needed
- Jobs are durable (survive restarts)
- Dead-letter queue for failed jobs
- Workers: search indexer, relation builder, webhook dispatcher, workspace initializer, email relay

### Audit log

The `events` table is the audit log:
- Immutable (never updated or deleted)
- Every record includes: userId, action, timestamp, subjectId, metadata
- Metadata captures approval chain (who approved, why, auto vs. manual)
- Full event replay available for compliance or debugging

---

## Security

### Authentication — Ory Kratos

Synap uses **Ory Kratos** for identity (registration, login, MFA, session management):

```
Browser
  ↓ session cookie (ory_kratos_session)
Gatekeeper middleware
  ↓ validates at /sessions/whoami
tRPC context
  ↓ userId injected
All procedures
```

The frontend proxies API calls so everything appears same-origin. No CORS headers, no token passing across domains, cookies are first-party.

### Authorization — RBAC + Proposals

**Role hierarchy:**

| Action | Owner | Admin | Editor | Viewer |
|--------|:-----:|:-----:|:------:|:------:|
| Read content | ✓ | ✓ | ✓ | ✓ |
| Create/edit entities | ✓ | ✓ | ✓ | — |
| Delete entities | ✓ | ✓ | — | — |
| Manage members | ✓ | ✓ | — | — |
| Delete workspace | ✓ | — | — | — |

Permission rules are enforced in `checkPermissionOrPropose()` — a single function called at the top of every mutation. It either grants, denies, or returns a pending proposal.

Workspace settings can override default rules per role and per table:

```typescript
workspace.settings.rolePermissions = {
  editor: {
    entities: { delete: true }  // override: editors can delete
  }
}
```

### Invite security

- Tokens: 256-bit random (cryptographically secure, `crypto.randomBytes`)
- Expiry: 7 days hard-coded
- Single-use: token deleted on acceptance
- Revocable at any time by owner/admin
- Pod-to-control-plane communication uses a shared secret (`X-Internal-Key` header)

### Data isolation

Each pod is a separate database. There is no shared multi-tenant database. Users on different pods cannot access each other's data at the infrastructure level.

---

## Personalization

### Per-user preferences
- Theme: light / dark / auto
- Default workspace
- Sidebar width and collapse state
- View defaults (default view type per entity type)
- Notification settings

### Per-workspace configuration
- Default entity types shown on creation
- AI governance (auto-approve threshold, required review list)
- Role permission overrides
- Intelligence service selection (Synap default, marketplace, custom)
- Main whiteboard
- Allowed external sharing

### Intelligence service swapping

Each workspace can point at a different AI backend:

```typescript
workspace.settings.intelligenceServiceId = "custom-service-uuid"
workspace.settings.intelligenceServiceOverrides = {
  chat: "gpt4-service-id",
  analysis: "gemini-service-id"
}
```

This means a team can run their own locally-hosted LLM, a different provider, or the Synap-managed service — without changing anything else.

---

## Tech Stack at a glance

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16.1 (App Router), React 19 |
| UI system | Tamagui 1.141 (Amber/Cyan design system, no shadows) |
| API | tRPC 11 (end-to-end type safety) |
| State | Zustand 5 (client) + TanStack Query 5 (server) |
| Real-time | Socket.IO 4.8 + Yjs 13.6 (CRDTs) |
| Rich text | TipTap 3 (ProseMirror) |
| Whiteboard | Tldraw 2.0 |
| Auth | Ory Kratos 1.3 |
| Database | PostgreSQL 15+ |
| ORM | Drizzle ORM 0.45 |
| Jobs | pg-boss 10 |
| Storage | MinIO (S3-compatible) or Cloudflare R2 |
| Build | pnpm monorepo, Turborepo 2.7 |
| Language | TypeScript 5.9 throughout |

---

## Landing page copy (draft)

### Hero

> **Your data. Your AI. Your rules.**
>
> Synap is an intelligent workspace where tasks, documents, contacts, and ideas live together — linked, searchable, and understood. AI surfaces patterns and suggests actions. You decide what happens.

### Sub-headline

> Run it on your own server or let us host it. Either way, you own the data.

### Feature sections

---

**One workspace for everything you know**

Tasks, notes, projects, contacts, meeting notes — in Synap they're all the same kind of thing, so they can relate to each other. A task can mention a contact, depend on another task, and link to a document. When you change the task's status, everything that references it knows.

---

**See your data the way you think**

Switch between Table, Kanban, List, Timeline, Graph, and Whiteboard with one click. The data never moves — only the lens changes. Configure filters, grouping, and visible properties per view. Embed views inside documents.

---

**AI that asks before it acts**

Connect any AI service — Synap's built-in agents, a local model, GPT-4, Gemini, or a custom agent from the community marketplace. Every AI-suggested change goes through an approval queue. You review it, approve or deny it, and every decision is logged. No surprise overwrites.

---

**Real-time collaboration without the conflicts**

Multiple people in the same document or whiteboard? Yjs CRDTs ensure there are never merge conflicts. See live cursors, typing indicators, and presence avatars. Edits sync in milliseconds. Work offline — everything catches up when you reconnect.

---

**Open and self-hostable**

The data pod is open source. Run it on your own server with Docker Compose in under 10 minutes. Your data lives in a standard PostgreSQL database you can inspect, export, and backup yourself. No lock-in.

---

**Built for teams at any scale**

Personal workspaces for solo users. Team pods for small groups with role-based access. Enterprise pods with SSO, audit logs, and custom AI governance policies. Invite collaborators with a shareable link, assign their role before they even sign in, revoke access any time.

---

### One-liner options

- *"The workspace where your data thinks with you."*
- *"All your data. One model. Any AI."*
- *"Collaborate on everything. Control your AI. Own your data."*
- *"The open workspace OS for data intelligence."*
